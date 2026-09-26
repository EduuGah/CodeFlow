import { supabase } from './supabase';
import type { Attempt } from './mastery';
import type { FlashcardReview, ReviewRating } from './review';
import type { ExercisePerformance } from './admin';
import { lerResposta, resumirFeedback, resumirResposta, type EvidenciaDoErro, type RespostaEnviada } from './resposta';

export interface UserProgress {
  completedLessons: string[];
  completedProjects: string[];
  /**
   * Preenchido quando a leitura falhou.
   *
   * Sem isto, uma falha de rede era indistinguível de "aluno sem progresso": o
   * painel mostrava tudo zerado como se fosse verdade, e quem já tinha concluído
   * aulas via o próprio avanço desaparecer sem explicação.
   */
  error?: string;
}

const EMPTY_PROGRESS: UserProgress = { completedLessons: [], completedProjects: [] };

/**
 * Lê o progresso do aluno na tabela `users`.
 * Nunca lança: se a leitura falhar, devolve progresso vazio para não travar a tela.
 */
export async function fetchProgress(userId: string): Promise<UserProgress> {
  if (!supabase) return { ...EMPTY_PROGRESS, error: 'Supabase não configurado.' };

  // maybeSingle() em vez de single(): um aluno recém-cadastrado ainda não tem linha,
  // e single() trataria isso como erro.
  const { data, error } = await supabase
    .from('users')
    .select('completed_lessons, completed_projects')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Falha ao buscar progresso do aluno:', error.message);
    return { ...EMPTY_PROGRESS, error: 'Não foi possível carregar seu progresso.' };
  }

  return {
    completedLessons: data?.completed_lessons ?? [],
    completedProjects: data?.completed_projects ?? [],
  };
}

/**
 * O PostgREST devolve este erro quando a função chamada por `rpc` não existe —
 * o banco ainda não recebeu a migração que a cria. É o único erro que autoriza
 * cair no caminho antigo; qualquer outro é falha de verdade.
 */
export function funcaoAusente(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === 'PGRST202' || // função não encontrada no schema cache
    error.code === '42883' || // undefined_function
    /could not find the function/i.test(error.message ?? '')
  );
}

/**
 * Acrescenta um id a uma das listas de progresso, sem duplicar.
 *
 * O caminho de verdade é a função `concluir` (migração 0009): o banco
 * acrescenta num comando só, sem ler antes, então duas conclusões ao mesmo
 * tempo — duas abas, ou uma aula e um projeto — ficam as duas.
 *
 * O caminho antigo (ler, acrescentar, regravar a lista inteira) só roda num
 * banco sem a 0009, e **nunca a partir de uma leitura que falhou**: antes,
 * uma falha de rede na leitura virava lista vazia, e a regravação apagava
 * todas as aulas concluídas da pessoa.
 */
async function appendToProgress(
  userId: string,
  column: 'completed_lessons' | 'completed_projects',
  id: string
): Promise<void> {
  if (!supabase) return;

  const { error: erroDaFuncao } = await supabase.rpc('concluir', { p_coluna: column, p_id: id });
  if (!erroDaFuncao) return;
  if (!funcaoAusente(erroDaFuncao)) throw new Error(erroDaFuncao.message);

  const current = await fetchProgress(userId);
  if (current.error) {
    throw new Error(`O progresso não foi lido, então não foi regravado: ${current.error}`);
  }
  const list = column === 'completed_lessons' ? current.completedLessons : current.completedProjects;

  if (list.includes(id)) return;

  const { error } = await supabase
    .from('users')
    .upsert({ id: userId, [column]: [...list, id] }, { onConflict: 'id' });

  if (error) throw new Error(error.message);
}

export function markLessonCompleted(userId: string, lessonId: string): Promise<void> {
  return appendToProgress(userId, 'completed_lessons', lessonId);
}

export function markProjectCompleted(userId: string, projectId: string): Promise<void> {
  return appendToProgress(userId, 'completed_projects', projectId);
}

// ------------------------------------------------------- leitura paginada

/**
 * Uma leitura de histórico: as linhas, e o erro se alguma página falhou.
 *
 * O erro não esvazia `dados`, mas quem lê precisa saber que eles podem estar
 * incompletos — um saldo calculado sem as compras, ou uma sequência sem as
 * tentativas de ontem, parecem números certos e não são.
 */
export interface Leitura<T> {
  dados: T[];
  erro?: string;
}

/**
 * Linhas por página. O Supabase corta toda resposta em `max-rows` (1.000 por
 * padrão) **sem avisar**: sem paginar, quem passasse de mil tentativas via o
 * histórico parar na milésima — a mais antiga, porque a ordem é crescente — e
 * a sequência, o XP e os desafios congelavam no passado.
 */
export const LINHAS_POR_PAGINA = 1000;

/** Trava de segurança: 200 mil linhas é muito mais que uma vida de estudo. */
const PAGINAS_NO_MAXIMO = 200;

type Pagina = PromiseLike<{
  data: unknown[] | null;
  error: { message: string } | null;
  count?: number | null;
}>;

/**
 * Lê todas as páginas de uma consulta ordenada. `consultar(de, ate)` monta a
 * consulta com `.range(de, ate)`; a primeira pede também a contagem, e a
 * leitura para quando juntou tudo — ou, sem contagem, na primeira página
 * incompleta.
 */
export async function lerTodasAsPaginas<T>(consultar: (de: number, ate: number) => Pagina): Promise<Leitura<T>> {
  const dados: T[] = [];
  let total: number | null = null;

  for (let pagina = 0; pagina < PAGINAS_NO_MAXIMO; pagina++) {
    const de = pagina * LINHAS_POR_PAGINA;
    const { data, error, count } = await consultar(de, de + LINHAS_POR_PAGINA - 1);
    if (error) return { dados, erro: error.message };

    const linhas = (data ?? []) as T[];
    dados.push(...linhas);
    if (typeof count === 'number') total = count;

    const acabou = total !== null ? dados.length >= total : linhas.length < LINHAS_POR_PAGINA;
    if (acabou || linhas.length === 0) break;
  }

  return { dados };
}

// ------------------------------------------------------- tentativas

/** O que o registrador precisa saber sobre uma tentativa. */
export interface AttemptInput {
  exerciseId: string;
  lessonId: string;
  concepts: string[];
  correct: boolean;
  hintsUsed: number;
  /** O que foi enviado. Só é gravado quando errou: é para o Caderno de Erros. */
  resposta?: RespostaEnviada;
  /** O retorno que a pessoa leu — a primeira falha, a mensagem do sintoma. */
  feedback?: string;
}

/**
 * A recusa que autoriza gravar a tentativa sem a resposta: o banco ainda sem a
 * 0010 (coluna que não existe), ou uma resposta que passou do teto dela. A
 * tentativa é o fato — conta para sequência, XP e domínio; a resposta é só a
 * evidência, e perder a evidência não pode levar o fato junto.
 */
function semLugarParaResposta(error: { code?: string; message?: string }): boolean {
  return (
    error.code === 'PGRST204' || // coluna fora do schema cache
    error.code === '42703' || // undefined_column
    /exercise_attempts_resposta_formato/.test(error.message ?? '')
  );
}

/**
 * Registra uma tentativa.
 *
 * Nunca lança e nunca bloqueia: se a gravação falhar, o aluno segue estudando e
 * o erro fica no console. Perder um registro de telemetria é aceitável;
 * interromper a aula por causa dele não é.
 */
export async function recordAttempt(userId: string, attempt: AttemptInput): Promise<void> {
  if (!supabase) return;

  const linha = {
    user_id: userId,
    exercise_id: attempt.exerciseId,
    lesson_id: attempt.lessonId,
    concepts: attempt.concepts,
    correct: attempt.correct,
    hints_used: attempt.hintsUsed,
  };
  const feedback = resumirFeedback(attempt.feedback);
  const evidencia = attempt.correct
    ? {}
    : {
        ...(attempt.resposta ? { resposta: resumirResposta(attempt.resposta) } : {}),
        ...(feedback ? { feedback } : {}),
      };

  let { error } = await supabase.from('exercise_attempts').insert({ ...linha, ...evidencia });
  if (error && Object.keys(evidencia).length > 0 && semLugarParaResposta(error)) {
    ({ error } = await supabase.from('exercise_attempts').insert(linha));
  }

  if (error) console.error('Falha ao registrar tentativa:', error.message);
}

/**
 * Exercícios de uma aula que o aluno já resolveu alguma vez.
 *
 * A aula precisa disto para não recomeçar do zero a cada visita. Sem ele, quem
 * resolvesse quatro de cinco exercícios, saísse e voltasse para terminar o
 * quinto nunca veria a aula ser concluída — o estado dos outros quatro tinha
 * morrido junto com a página.
 *
 * Consulta estreita de propósito: só esta aula, só o que passou. Buscar o
 * histórico inteiro para responder a isto seria pagar o catálogo todo por uma
 * pergunta de cinco linhas.
 */
export async function fetchSolvedExercises(
  userId: string,
  lessonId: string
): Promise<string[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('exercise_attempts')
    .select('exercise_id')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .eq('correct', true);

  if (error) {
    console.error('Falha ao buscar exercícios resolvidos:', error.message);
    return [];
  }

  return [...new Set((data ?? []).map((row) => row.exercise_id as string))];
}

/** Histórico de tentativas do aluno, do mais antigo para o mais recente. */
export async function fetchAttempts(userId: string): Promise<Leitura<Attempt>> {
  if (!supabase) return { dados: [] };
  const cliente = supabase;

  const leitura = await lerTodasAsPaginas<{
    exercise_id: string;
    lesson_id: string;
    concepts: string[] | null;
    correct: boolean;
    hints_used: number | null;
    created_at: string;
  }>((de, ate) =>
    cliente
      .from('exercise_attempts')
      .select('exercise_id, lesson_id, concepts, correct, hints_used, created_at', {
        count: de === 0 ? 'exact' : undefined,
      })
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(de, ate)
  );

  if (leitura.erro) console.error('Falha ao buscar tentativas:', leitura.erro);

  return {
    erro: leitura.erro ? 'Não foi possível carregar suas tentativas.' : undefined,
    dados: leitura.dados.map((row) => ({
      exerciseId: row.exercise_id,
      lessonId: row.lesson_id,
      concepts: row.concepts ?? [],
      correct: row.correct,
      hintsUsed: row.hints_used ?? 0,
      createdAt: row.created_at,
    })),
  };
}

/**
 * O que a pessoa enviou nas tentativas erradas, da mais recente para a mais
 * antiga — para o Caderno de Erros.
 *
 * Fora de `fetchAttempts` de propósito: aquela leitura alimenta o aplicativo
 * inteiro, e o código enviado é o que ela tem de mais pesado. Esta só roda na
 * tela do caderno, e só traz as erradas que têm o que mostrar.
 */
export async function fetchEvidencias(userId: string): Promise<Leitura<EvidenciaDoErro>> {
  if (!supabase) return { dados: [] };
  const cliente = supabase;

  const leitura = await lerTodasAsPaginas<{
    exercise_id: string;
    resposta: unknown;
    feedback: string | null;
    created_at: string;
  }>((de, ate) =>
    cliente
      .from('exercise_attempts')
      .select('exercise_id, resposta, feedback, created_at', { count: de === 0 ? 'exact' : undefined })
      .eq('user_id', userId)
      .eq('correct', false)
      .not('resposta', 'is', null)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(de, ate)
  );

  if (leitura.erro) {
    // Banco sem a 0010: não há evidência para mostrar, e isso não é falha.
    if (/resposta|feedback/.test(leitura.erro) && /does not exist|could not find/i.test(leitura.erro)) {
      return { dados: [] };
    }
    console.error('Falha ao buscar o que foi respondido:', leitura.erro);
  }

  return {
    erro: leitura.erro ? 'Não foi possível carregar o que você respondeu.' : undefined,
    dados: leitura.dados.map((row) => ({
      exerciseId: row.exercise_id,
      resposta: lerResposta(row.resposta),
      feedback: row.feedback,
      createdAt: row.created_at,
    })),
  };
}

// ------------------------------------------------- revisao de flashcards

/** Registra a autoavaliação do aluno num cartão. Não bloqueia nem lança. */
export async function recordFlashcardReview(
  userId: string,
  flashcardId: string,
  rating: ReviewRating
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from('flashcard_reviews')
    .insert({ user_id: userId, flashcard_id: flashcardId, rating });

  if (error) console.error('Falha ao registrar revisão:', error.message);
}

/** Histórico de revisões do aluno. */
export async function fetchFlashcardReviews(userId: string): Promise<Leitura<FlashcardReview>> {
  if (!supabase) return { dados: [] };
  const cliente = supabase;

  const leitura = await lerTodasAsPaginas<{ flashcard_id: string; rating: string; created_at: string }>((de, ate) =>
    cliente
      .from('flashcard_reviews')
      .select('flashcard_id, rating, created_at', { count: de === 0 ? 'exact' : undefined })
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(de, ate)
  );

  if (leitura.erro) console.error('Falha ao buscar revisões:', leitura.erro);

  return {
    erro: leitura.erro ? 'Não foi possível carregar suas revisões.' : undefined,
    dados: leitura.dados.map((row) => ({
      flashcardId: row.flashcard_id,
      rating: row.rating as ReviewRating,
      createdAt: row.created_at,
    })),
  };
}

// ------------------------------------------------------------ papel

export type UserRole = 'student' | 'admin';

/**
 * Papel do usuário.
 *
 * Falha fechada: qualquer erro devolve 'student'. Uma leitura que falha e
 * concede admin por engano é bem pior do que uma que nega acesso a quem tem
 * direito — o segundo caso o usuário reporta, o primeiro ninguém percebe.
 *
 * Isto não substitui o RLS: a autorização de verdade acontece no banco, e esta
 * consulta serve apenas para a interface não oferecer um caminho que o servidor
 * vai recusar.
 */
export async function fetchUserRole(userId: string): Promise<UserRole> {
  if (!supabase) return 'student';

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Falha ao buscar o papel do usuário:', error.message);
    return 'student';
  }

  return data?.role === 'admin' ? 'admin' : 'student';
}

/**
 * Desempenho agregado por exercício.
 *
 * Vem da função `desempenho_por_exercicio` (0009), que só responde a admin e
 * só devolve números — a leitura ampla das linhas de cada aluno saiu do banco.
 * Num banco sem a 0009, cai na view antiga.
 */
export async function fetchExercisePerformance(): Promise<ExercisePerformance[]> {
  if (!supabase) return [];

  let { data, error } = await supabase.rpc('desempenho_por_exercicio');
  if (funcaoAusente(error)) {
    ({ data, error } = await supabase.from('exercise_performance').select('*'));
  }

  if (error) {
    console.error('Falha ao buscar desempenho por exercício:', error.message);
    return [];
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    exerciseId: String(row.exercise_id),
    lessonId: String(row.lesson_id),
    attempts: Number(row.attempts ?? 0),
    correctAttempts: Number(row.correct_attempts ?? 0),
    students: Number(row.students ?? 0),
    studentsSolved: Number(row.students_solved ?? 0),
    accuracyPercent: row.accuracy_percent === null || row.accuracy_percent === undefined ? null : Number(row.accuracy_percent),
    avgHintsUsed: Number(row.avg_hints_used ?? 0),
    attemptsPerStudent: Number(row.attempts_per_student ?? 0),
  }));
}

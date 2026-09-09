import { supabase } from './supabase';
import type { Attempt } from './mastery';
import type { FlashcardReview, ReviewRating } from './review';
import type { ExercisePerformance } from './admin';

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

/** Acrescenta um id a uma das listas de progresso, sem duplicar. */
async function appendToProgress(
  userId: string,
  column: 'completed_lessons' | 'completed_projects',
  id: string
): Promise<void> {
  if (!supabase) return;

  const current = await fetchProgress(userId);
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

// ------------------------------------------------------- tentativas

/** O que o registrador precisa saber sobre uma tentativa. */
export interface AttemptInput {
  exerciseId: string;
  lessonId: string;
  concepts: string[];
  correct: boolean;
  hintsUsed: number;
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

  const { error } = await supabase.from('exercise_attempts').insert({
    user_id: userId,
    exercise_id: attempt.exerciseId,
    lesson_id: attempt.lessonId,
    concepts: attempt.concepts,
    correct: attempt.correct,
    hints_used: attempt.hintsUsed,
  });

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
export async function fetchAttempts(userId: string): Promise<Attempt[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('exercise_attempts')
    .select('exercise_id, lesson_id, concepts, correct, hints_used, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Falha ao buscar tentativas:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    exerciseId: row.exercise_id,
    lessonId: row.lesson_id,
    concepts: row.concepts ?? [],
    correct: row.correct,
    hintsUsed: row.hints_used ?? 0,
    createdAt: row.created_at,
  }));
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
export async function fetchFlashcardReviews(userId: string): Promise<FlashcardReview[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('flashcard_reviews')
    .select('flashcard_id, rating, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Falha ao buscar revisões:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    flashcardId: row.flashcard_id,
    rating: row.rating as ReviewRating,
    createdAt: row.created_at,
  }));
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

/** Desempenho agregado por exercício. Só devolve dados para quem o RLS permite. */
export async function fetchExercisePerformance(): Promise<ExercisePerformance[]> {
  if (!supabase) return [];

  const { data, error } = await supabase.from('exercise_performance').select('*');

  if (error) {
    console.error('Falha ao buscar desempenho por exercício:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    exerciseId: row.exercise_id,
    lessonId: row.lesson_id,
    attempts: row.attempts ?? 0,
    correctAttempts: row.correct_attempts ?? 0,
    students: row.students ?? 0,
    studentsSolved: row.students_solved ?? 0,
    accuracyPercent: row.accuracy_percent === null ? null : Number(row.accuracy_percent),
    avgHintsUsed: Number(row.avg_hints_used ?? 0),
    attemptsPerStudent: Number(row.attempts_per_student ?? 0),
  }));
}

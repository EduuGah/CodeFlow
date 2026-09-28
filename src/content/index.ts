import type {
  Concept,
  Exercise,
  Flashcard,
  Lesson,
  LessonBlock,
  Project,
  ResumoDaAula,
  ResumoDeExercicio,
  ResumoDoProjeto,
  Track,
} from './types';

import { concepts as allConcepts } from './concepts';
import { flashcards as allFlashcards } from './flashcards';
import { AULAS, CORPO_DA_AULA, CORPO_DO_PROJETO, EXERCICIOS, PROJETOS } from './indice.gerado';
import { TRILHA_PADRAO, TRILHAS } from './trilhas';

/**
 * A fronteira de conteúdo das telas.
 *
 * O pacote principal só conhece o **índice** (`indice.gerado.ts`): as
 * trilhas, o resumo de cada aula (a aula sem os `blocks`), de cada exercício
 * e de cada projeto. O corpo de uma aula — prosa, exemplos, exercícios — vem
 * por `carregarAula`, um arquivo por aula, quando ela abre. Antes, as 154
 * aulas inteiras iam no pacote que qualquer visita baixava (P2-1b).
 *
 * O catálogo inteiro, com o corpo de tudo e a validação, é `catalogo.ts`:
 * testes, E2E e o gerador do índice usam aquele.
 */

const isPublished = <T extends { status: string }>(item: T) => item.status === 'published';

// ---------------------------------------------------------------- trilhas

export const getTrack = (id: string): Track | undefined => TRILHAS.find((t) => t.id === id && isPublished(t));

export const getDefaultTrack = (): Track => TRILHA_PADRAO;

/** Todas as trilhas publicadas, na ordem em que devem aparecer ao aluno. */
export const listTracks = (): Track[] => TRILHAS.filter(isPublished);

// ---------------------------------------------------------------- aulas (resumo)

let aulasPorId: Map<string, ResumoDaAula> | undefined;

export const getLesson = (id: string): ResumoDaAula | undefined => {
  aulasPorId ??= new Map(AULAS.filter(isPublished).map((a) => [a.id, a]));
  return aulasPorId.get(id);
};

/** Aulas de uma trilha, na ordem pedagógica definida pela própria trilha. */
export function getLessonsOfTrack(trackId: string): ResumoDaAula[] {
  const track = getTrack(trackId);
  if (!track) return [];
  return track.lessonIds.map((id) => getLesson(id)).filter((a): a is ResumoDaAula => a !== undefined);
}

/**
 * Primeira aula da trilha que o aluno ainda não concluiu. Substitui a cadeia de
 * `if`s do Dashboard: acrescentar uma aula à trilha passa a bastar.
 */
export function getNextLesson(trackId: string, completedLessonIds: string[]): ResumoDaAula | undefined {
  const aulas = getLessonsOfTrack(trackId);
  return aulas.find((a) => !completedLessonIds.includes(a.id)) ?? aulas[aulas.length - 1];
}

/**
 * A aula seguinte a esta, na ordem da trilha.
 *
 * Diferente de `getNextLesson`, que responde "por onde retomar" e devolve a
 * primeira pendente. São perguntas diferentes, e usar uma pela outra tinha um
 * efeito ruim no fim da aula: quem tivesse pulado a aula 3 e terminasse a 7
 * recebia um botão "Próxima aula" que levava de volta para a 3.
 *
 * Devolve `undefined` no fim da trilha — quem chama decide o que oferecer.
 */
export function getLessonAfter(lessonId: string): ResumoDaAula | undefined {
  const aula = getLesson(lessonId);
  if (!aula) return undefined;
  const aulas = getLessonsOfTrack(aula.trackId);
  const atual = aulas.findIndex((a) => a.id === lessonId);
  return atual === -1 ? undefined : aulas[atual + 1];
}

export function getTrackProgress(trackId: string, completedLessonIds: string[]) {
  const aulas = getLessonsOfTrack(trackId);
  const completed = aulas.filter((a) => completedLessonIds.includes(a.id)).length;
  return {
    total: aulas.length,
    completed,
    percentage: aulas.length === 0 ? 0 : Math.round((completed / aulas.length) * 100),
  };
}

// ---------------------------------------------------------------- exercícios (resumo)

let exerciciosPorAula: Map<string, ResumoDeExercicio[]> | undefined;
let exerciciosPorId: Map<string, ResumoDeExercicio> | undefined;

/** Os exercícios de uma aula publicada, na ordem, sem abrir a aula. */
export function exerciciosDaAula(lessonId: string): ResumoDeExercicio[] {
  if (!exerciciosPorAula) {
    exerciciosPorAula = new Map();
    for (const e of EXERCICIOS) exerciciosPorAula.set(e.lessonId, [...(exerciciosPorAula.get(e.lessonId) ?? []), e]);
  }
  return getLesson(lessonId) ? (exerciciosPorAula.get(lessonId) ?? []) : [];
}

/**
 * Um exercício de uma aula publicada, pelo id — `undefined` para o que saiu
 * do catálogo (a tentativa antiga continua no histórico).
 */
export function resumoDoExercicio(id: string): ResumoDeExercicio | undefined {
  exerciciosPorId ??= new Map(EXERCICIOS.map((e) => [e.id, e]));
  const exercicio = exerciciosPorId.get(id);
  return exercicio && getLesson(exercicio.lessonId) ? exercicio : undefined;
}

// ---------------------------------------------------------------- projetos (resumo)

export const listProjects = (): ResumoDoProjeto[] => PROJETOS.filter(isPublished);
export const getProject = (id: string): ResumoDoProjeto | undefined =>
  PROJETOS.find((p) => p.id === id && isPublished(p));

// ---------------------------------------------------------------- conceitos e cartões

export const listFlashcards = (): Flashcard[] => allFlashcards;
export const listConcepts = (): Concept[] => allConcepts;
export const getConcept = (id: string): Concept | undefined => allConcepts.find((c) => c.id === id);

// ---------------------------------------------------------------- o corpo, sob demanda

const aulasCarregadas = new Map<string, Lesson>();
const projetosCarregados = new Map<string, Project>();

/**
 * A aula inteira, se já veio — sem esperar. Quem abre uma aula pergunta aqui
 * primeiro: voltar a uma aula já aberta não pisca o esqueleto.
 */
export const aulaCarregada = (id: string): Lesson | undefined => aulasCarregadas.get(id);
export const projetoCarregado = (id: string): Project | undefined => projetosCarregados.get(id);

/**
 * O corpo de uma aula publicada. `undefined` para id fora do catálogo; lança
 * se o arquivo não chegar (rede, ou um deploy novo que trocou os nomes) —
 * quem chama mostra o erro e oferece tentar de novo.
 */
export async function carregarAula(id: string): Promise<Lesson | undefined> {
  const pronta = aulasCarregadas.get(id);
  if (pronta) return pronta;
  if (!getLesson(id)) return undefined;
  const aula = await CORPO_DA_AULA[id]();
  aulasCarregadas.set(id, aula);
  return aula;
}

export async function carregarProjeto(id: string): Promise<Project | undefined> {
  const pronto = projetosCarregados.get(id);
  if (pronto) return pronto;
  if (!getProject(id)) return undefined;
  const projeto = await CORPO_DO_PROJETO[id]();
  projetosCarregados.set(id, projeto);
  return projeto;
}

// ---------------------------------------------------------------- ajudantes de aula

/** Os exercícios de uma aula inteira, na ordem (a aula já carregada). */
export const getExercises = (lesson: Lesson): Exercise[] =>
  lesson.blocks
    .filter((b): b is Extract<LessonBlock, { kind: 'exercise' }> => b.kind === 'exercise')
    .map((b) => b.exercise);

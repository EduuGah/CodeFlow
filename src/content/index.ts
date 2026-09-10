import type {
  CodeExercise,
  Concept,
  Exercise,
  Flashcard,
  Lesson,
  LessonBlock,
  Project,
  Track,
} from './types';
import {
  conceptSchema,
  flashcardSchema,
  lessonSchema,
  projectSchema,
  trackSchema,
} from './schema';

import { concepts as allConcepts } from './concepts';
import { flashcards as allFlashcards } from './flashcards';
import { trackJsFundamentos } from './tracks/javascript';
import { trackLogica } from './tracks/logica';
import { trackWeb } from './tracks/web';
import { lessonVariaveis } from './lessons/js-01-variaveis';
import { lessonTiposEOperadores } from './lessons/js-02-tipos-e-operadores';
import { lessonCondicoes } from './lessons/js-03-condicoes';
import { lessonLoops } from './lessons/js-04-loops';
import { lessonFuncoes } from './lessons/js-05-funcoes';
import { lessonArrays } from './lessons/js-06-arrays';
import { lessonObjetos } from './lessons/js-07-objetos';
import { lessonMetodosArray } from './lessons/js-08-metodos-array';
import { lessonStrings } from './lessons/js-09-strings';
import { lessonErros } from './lessons/js-10-erros';
import { lessonEscopo } from './lessons/js-11-escopo';
import { lessonClosures } from './lessons/js-12-closures';
import { lessonCallbacks } from './lessons/js-13-callbacks';
import { lessonPromises } from './lessons/js-14-promises';
import { lessonAsyncAwait } from './lessons/js-15-async-await';
import { lessonErrosAsync } from './lessons/js-16-erros-async';
import { lessonJson } from './lessons/js-17-json';
import { lessonImutabilidade } from './lessons/js-18-imutabilidade';
import { lessonDatas } from './lessons/js-19-datas';
import { lessonRegex } from './lessons/js-20-regex';
import { lessonDecompor } from './lessons/logica-01-decompor';
import { lessonCasosExtremos } from './lessons/logica-02-casos-extremos';
import { lessonSimular } from './lessons/logica-03-simular';
import { lessonClienteServidor } from './lessons/web-01-cliente-servidor';
import { lessonHttp } from './lessons/web-02-http';
import { lessonCabecalhos } from './lessons/web-03-cabecalhos';
import { lessonRest } from './lessons/web-04-rest';
import { lessonAutenticacao } from './lessons/web-05-autenticacao';
import { lessonTokens } from './lessons/web-06-tokens';
import { lessonCors } from './lessons/web-07-cors';
import { lessonSegurancaWeb } from './lessons/web-08-seguranca';
import { projetoImc } from './projects/js-imc';
import { projetoConversor } from './projects/js-conversor';
import { projetoBoletim } from './projects/js-boletim';
import { projetoCaixa } from './projects/js-caixa';
import { projetoTarefas } from './projects/js-tarefas';
import { projetoSenha } from './projects/js-senha';
import { projetoEstoque } from './projects/js-estoque';

/**
 * Registro de conteúdo. Esta é a única fronteira que as páginas conhecem — se
 * amanhã o conteúdo vier de uma API ou do Postgres, só este arquivo muda.
 */

const lessons: Lesson[] = [
  lessonVariaveis,
  lessonTiposEOperadores,
  lessonCondicoes,
  lessonLoops,
  lessonFuncoes,
  lessonArrays,
  lessonObjetos,
  lessonMetodosArray,
  lessonStrings,
  lessonErros,
  lessonEscopo,
  lessonClosures,
  lessonCallbacks,
  lessonPromises,
  lessonAsyncAwait,
  lessonErrosAsync,
  lessonJson,
  lessonImutabilidade,
  lessonDatas,
  lessonRegex,
  lessonDecompor,
  lessonCasosExtremos,
  lessonSimular,
  lessonClienteServidor,
  lessonHttp,
  lessonCabecalhos,
  lessonRest,
  lessonAutenticacao,
  lessonTokens,
  lessonCors,
  lessonSegurancaWeb,
];
const projects: Project[] = [
  projetoImc,
  projetoConversor,
  projetoBoletim,
  projetoCaixa,
  projetoTarefas,
  projetoSenha,
  projetoEstoque,
];
const tracks: Track[] = [trackJsFundamentos, trackLogica, trackWeb];

/**
 * Checagem de integridade referencial que o Zod sozinho não faz: schema garante
 * o formato de cada item, isto garante que eles apontam uns para os outros.
 */
function checkReferences(): string[] {
  const problems: string[] = [];
  const conceptIds = new Set(allConcepts.map((c) => c.id));
  const lessonIds = new Set(lessons.map((l) => l.id));

  const requireConcepts = (owner: string, ids: string[]) => {
    for (const id of ids) {
      if (!conceptIds.has(id)) problems.push(`${owner} referencia conceito inexistente "${id}"`);
    }
  };

  for (const concept of allConcepts) {
    requireConcepts(`Conceito "${concept.id}"`, concept.prerequisites);
  }

  for (const lesson of lessons) {
    requireConcepts(`Aula "${lesson.id}"`, lesson.concepts);
    for (const block of lesson.blocks) {
      if (block.kind === 'exercise') {
        requireConcepts(`Exercício "${block.exercise.id}"`, block.exercise.concepts);
      }
    }
    if (!tracks.some((t) => t.id === lesson.trackId)) {
      problems.push(`Aula "${lesson.id}" aponta para trilha inexistente "${lesson.trackId}"`);
    }
  }

  for (const project of projects) requireConcepts(`Projeto "${project.id}"`, project.concepts);
  for (const card of allFlashcards) requireConcepts(`Flashcard "${card.id}"`, card.concepts);

  for (const track of tracks) {
    for (const id of track.lessonIds) {
      if (!lessonIds.has(id)) problems.push(`Trilha "${track.id}" lista aula inexistente "${id}"`);
    }
  }

  return problems;
}

function validateAll(): string[] {
  const problems: string[] = [];

  const run = (label: string, schema: { safeParse: (v: unknown) => { success: boolean; error?: unknown } }, items: unknown[]) => {
    items.forEach((item, i) => {
      const result = schema.safeParse(item);
      if (!result.success) {
        problems.push(`${label}[${i}]: ${JSON.stringify(result.error)}`);
      }
    });
  };

  run('Conceito', conceptSchema, allConcepts);
  run('Aula', lessonSchema, lessons);
  run('Projeto', projectSchema, projects);
  run('Flashcard', flashcardSchema, allFlashcards);
  run('Trilha', trackSchema, tracks);

  return [...problems, ...checkReferences()];
}

// Falha ruidosamente em desenvolvimento; em produção apenas registra, para um
// erro de conteúdo não derrubar a aplicação inteira do aluno.
const contentProblems = validateAll();
if (contentProblems.length > 0) {
  const message = `[CodeFlow] Conteúdo inválido:\n- ${contentProblems.join('\n- ')}`;
  if (import.meta.env.DEV) throw new Error(message);
  console.error(message);
}

const isPublished = <T extends { status: string }>(item: T) => item.status === 'published';

// ---------------------------------------------------------------- consultas

export const getTrack = (id: string): Track | undefined =>
  tracks.find((t) => t.id === id && isPublished(t));

export const getDefaultTrack = (): Track => trackJsFundamentos;

/** Todas as trilhas publicadas, na ordem em que devem aparecer ao aluno. */
export const listTracks = (): Track[] => tracks.filter(isPublished);

export const getLesson = (id: string): Lesson | undefined =>
  lessons.find((l) => l.id === id && isPublished(l));

/** Aulas de uma trilha, na ordem pedagógica definida pela própria trilha. */
export function getLessonsOfTrack(trackId: string): Lesson[] {
  const track = getTrack(trackId);
  if (!track) return [];

  return track.lessonIds
    .map((id) => getLesson(id))
    .filter((lesson): lesson is Lesson => lesson !== undefined);
}

/**
 * Primeira aula da trilha que o aluno ainda não concluiu. Substitui a cadeia de
 * `if`s do Dashboard: acrescentar uma aula à trilha passa a bastar.
 */
export function getNextLesson(trackId: string, completedLessonIds: string[]): Lesson | undefined {
  const lessonsOfTrack = getLessonsOfTrack(trackId);
  return (
    lessonsOfTrack.find((lesson) => !completedLessonIds.includes(lesson.id)) ??
    lessonsOfTrack[lessonsOfTrack.length - 1]
  );
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
export function getLessonAfter(lessonId: string): Lesson | undefined {
  const lesson = getLesson(lessonId);
  if (!lesson) return undefined;

  const lessonsOfTrack = getLessonsOfTrack(lesson.trackId);
  const atual = lessonsOfTrack.findIndex((l) => l.id === lessonId);
  if (atual === -1) return undefined;

  return lessonsOfTrack[atual + 1];
}

export function getTrackProgress(trackId: string, completedLessonIds: string[]) {
  const lessonsOfTrack = getLessonsOfTrack(trackId);
  const completed = lessonsOfTrack.filter((l) => completedLessonIds.includes(l.id)).length;

  return {
    total: lessonsOfTrack.length,
    completed,
    percentage: lessonsOfTrack.length === 0 ? 0 : Math.round((completed / lessonsOfTrack.length) * 100),
  };
}

export const listProjects = (): Project[] => projects.filter(isPublished);
export const getProject = (id: string): Project | undefined =>
  projects.find((p) => p.id === id && isPublished(p));

export const listFlashcards = (): Flashcard[] => allFlashcards;
export const listConcepts = (): Concept[] => allConcepts;
export const getConcept = (id: string): Concept | undefined =>
  allConcepts.find((c) => c.id === id);

// ------------------------------------------------------- ajudantes de aula

export const getExercises = (lesson: Lesson): Exercise[] =>
  lesson.blocks
    .filter((b): b is Extract<LessonBlock, { kind: 'exercise' }> => b.kind === 'exercise')
    .map((b) => b.exercise);

/** O exercício de código de uma aula — o que alimenta o editor e o sandbox. */
export const getPrimaryCodeExercise = (lesson: Lesson): CodeExercise | undefined =>
  getExercises(lesson).find((e): e is CodeExercise => e.type === 'code');

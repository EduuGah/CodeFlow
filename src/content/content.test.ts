import { describe, expect, it } from 'vitest';

import { runProgram } from '../client/lib/sandbox-core';
import {
  getExercises,
  getLessonsOfTrack,
  getNextLesson,
  getTrackProgress,
  listFlashcards,
  listProjects,
  listTracks,
} from './index';
import type { CodeExercise, Exercise, Lesson } from './types';

/**
 * Suíte de integridade do conteúdo.
 *
 * O risco que ela cobre é específico do produto: um exercício com teste errado
 * não quebra a aplicação, ele ensina errado. O aluno escreve a resposta certa e
 * a plataforma diz que está errada — ou pior, aceita uma resposta incorreta.
 * Nada disso aparece num typecheck nem num build.
 *
 * Roda o mesmo `runProgram` que o Web Worker usa em produção, então o que passa
 * aqui é o que vai acontecer no navegador do aluno.
 */

const allLessons: Lesson[] = listTracks().flatMap((track) => getLessonsOfTrack(track.id));
const allExercises: Array<{ lesson: Lesson; exercise: Exercise }> = allLessons.flatMap((lesson) =>
  getExercises(lesson).map((exercise) => ({ lesson, exercise }))
);

const codeExercises = allExercises.filter(
  (item): item is { lesson: Lesson; exercise: CodeExercise } => item.exercise.type === 'code'
);

it('o catálogo não está vazio', () => {
  expect(allLessons.length).toBeGreaterThan(0);
  expect(codeExercises.length).toBeGreaterThan(0);
});

describe('exercícios de código', () => {
  it.each(codeExercises.map(({ lesson, exercise }) => [exercise.id, lesson.id, exercise] as const))(
    '%s: a solução de referência passa em todos os testes',
    (_id, _lessonId, exercise) => {
      // Sem solução declarada, não há como garantir que o exercício é resolvível.
      expect(exercise.solution, 'exercício de código precisa declarar uma solução').toBeDefined();

      const resultado = runProgram(`${exercise.initialCode}\n${exercise.solution}`, exercise.tests);

      expect(resultado.error, 'a solução não deveria lançar erro').toBeUndefined();

      const falhas = resultado.testResults.filter((t) => !t.passed).map((t) => t.message);
      expect(falhas, 'a solução deveria passar em todos os testes').toEqual([]);
      expect(resultado.testResults).toHaveLength(exercise.tests.length);
    }
  );

  it.each(codeExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: o código inicial NÃO passa (o exercício exige trabalho do aluno)',
    (_id, exercise) => {
      const resultado = runProgram(exercise.initialCode, exercise.tests);
      const todosPassaram =
        resultado.testResults.length > 0 && resultado.testResults.every((t) => t.passed);

      expect(todosPassaram, 'o exercício está passando sem o aluno escrever nada').toBe(false);
    }
  );

  it.each(codeExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: toda mensagem de falha é escrita para o aluno',
    (_id, exercise) => {
      const resultado = runProgram(exercise.initialCode, exercise.tests);

      for (const teste of resultado.testResults) {
        if (teste.passed) continue;

        // Mensagem crua do motor JavaScript não ensina nada a quem está começando.
        expect(
          teste.message,
          `mensagem pouco didática: "${teste.message}"`
        ).not.toMatch(/is not defined$/);
        expect(teste.message.length, 'mensagem curta demais para orientar').toBeGreaterThan(15);
      }
    }
  );
});

describe('exercícios de previsão de saída', () => {
  const previsoes = allExercises.filter(({ exercise }) => exercise.type === 'predict-output');

  it.each(previsoes.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a saída declarada confere com a execução real',
    (_id, exercise) => {
      if (exercise.type !== 'predict-output') throw new Error('filtro inconsistente');

      const resultado = runProgram(exercise.code, []);

      expect(resultado.error, 'o código do enunciado não deveria lançar erro').toBeUndefined();
      // Declarar uma saída errada aqui ensinaria algo falso ao aluno.
      expect(resultado.logs.join('\n')).toBe(exercise.expectedOutput);
    }
  );
});

describe('exercícios de múltipla escolha', () => {
  const multiplas = allExercises.filter(({ exercise }) => exercise.type === 'multiple-choice');

  it.each(multiplas.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a alternativa correta existe na lista',
    (_id, exercise) => {
      if (exercise.type !== 'multiple-choice') throw new Error('filtro inconsistente');

      // correctIndex fora da lista tornaria a resposta certa `undefined`:
      // o aluno nunca conseguiria acertar e nada denunciaria o erro.
      expect(exercise.correctIndex).toBeLessThan(exercise.options.length);
      expect(exercise.options[exercise.correctIndex]).toBeTruthy();
    }
  );
});

describe('estrutura do catálogo', () => {
  it('ids de aula, exercício, projeto e flashcard são únicos', () => {
    const coletar = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);

    expect(coletar(allLessons.map((l) => l.id))).toEqual([]);
    expect(coletar(allExercises.map(({ exercise }) => exercise.id))).toEqual([]);
    expect(coletar(listProjects().map((p) => p.id))).toEqual([]);
    expect(coletar(listFlashcards().map((f) => f.id))).toEqual([]);
  });

  it('toda aula tem pelo menos um exercício', () => {
    const semExercicio = allLessons.filter((l) => getExercises(l).length === 0).map((l) => l.id);
    expect(semExercicio).toEqual([]);
  });

  it('toda aula pertence à trilha que a lista', () => {
    for (const track of listTracks()) {
      for (const lesson of getLessonsOfTrack(track.id)) {
        expect(lesson.trackId).toBe(track.id);
      }
    }
  });

  it('as dicas vão do geral ao específico, sem repetir', () => {
    for (const { exercise } of allExercises) {
      const unicas = new Set(exercise.hints);
      expect(unicas.size, `dicas repetidas em ${exercise.id}`).toBe(exercise.hints.length);
    }
  });
});

describe('progressão da trilha', () => {
  const track = listTracks()[0];
  const lessons = getLessonsOfTrack(track.id);

  it('sem nada concluído, a próxima aula é a primeira', () => {
    expect(getNextLesson(track.id, [])?.id).toBe(lessons[0].id);
  });

  it('a próxima aula pula as já concluídas', () => {
    expect(getNextLesson(track.id, [lessons[0].id])?.id).toBe(lessons[1].id);
  });

  it('com a trilha inteira concluída, não aponta de volta para o início', () => {
    const todas = lessons.map((l) => l.id);
    expect(getNextLesson(track.id, todas)?.id).toBe(lessons[lessons.length - 1].id);
  });

  it('o percentual acompanha as aulas concluídas', () => {
    expect(getTrackProgress(track.id, []).percentage).toBe(0);
    expect(getTrackProgress(track.id, lessons.map((l) => l.id)).percentage).toBe(100);
  });

  it('aulas concluídas de outra trilha não contam no percentual', () => {
    const outra = listTracks()[1];
    if (!outra) return;

    const idsDaOutra = getLessonsOfTrack(outra.id).map((l) => l.id);
    expect(getTrackProgress(track.id, idsDaOutra).completed).toBe(0);
  });
});

describe('projetos', () => {
  const projetos = listProjects();

  it.each(projetos.map((p) => [p.id, p] as const))(
    '%s: a solução de referência fecha todos os checkpoints',
    (_id, project) => {
      // Sem isso, eu poderia publicar um critério de aceitação impossível de
      // satisfazer — e o aluno tentaria para sempre sem nunca conseguir entregar.
      expect(project.referenceSolution, 'projeto precisa de solução de referência').toBeDefined();

      for (const checkpoint of project.checkpoints) {
        const resultado = runProgram(
          `${project.initialCode}
${project.referenceSolution}`,
          checkpoint.tests
        );

        expect(resultado.error, `${checkpoint.id} lançou erro`).toBeUndefined();

        const falhas = resultado.testResults.filter((t) => !t.passed).map((t) => t.message);
        expect(falhas, `${checkpoint.id} não fechou`).toEqual([]);
      }
    }
  );

  it.each(projetos.map((p) => [p.id, p] as const))(
    '%s: o código inicial NÃO fecha todos os checkpoints',
    (_id, project) => {
      const todosFecham = project.checkpoints.every((checkpoint) => {
        const r = runProgram(project.initialCode, checkpoint.tests);
        return r.testResults.length > 0 && r.testResults.every((t) => t.passed);
      });

      // Um projeto que já vem pronto daria o troféu sem trabalho nenhum.
      expect(todosFecham, 'o projeto está completo antes de o aluno escrever algo').toBe(false);
    }
  );

  it('ids de checkpoint são únicos dentro de cada projeto', () => {
    for (const project of projetos) {
      const ids = project.checkpoints.map((c) => c.id);
      expect(new Set(ids).size, `checkpoints repetidos em ${project.id}`).toBe(ids.length);
    }
  });

  it('todo projeto declara ao menos um checkpoint', () => {
    const semCheckpoint = projetos.filter((p) => p.checkpoints.length === 0).map((p) => p.id);
    expect(semCheckpoint).toEqual([]);
  });
});

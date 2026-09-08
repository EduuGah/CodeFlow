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
import { preencher } from '../client/lib/fill-blank';
import type { CodeExercise, Exercise, FillBlankExercise, Lesson } from './types';

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

const fillBlankExercises = allExercises.filter(
  (item): item is { lesson: Lesson; exercise: FillBlankExercise } =>
    item.exercise.type === 'fill-blank'
);

it('o catálogo não está vazio', async () => {
  expect(allLessons.length).toBeGreaterThan(0);
  expect(codeExercises.length).toBeGreaterThan(0);
});

describe('markdown chega limpo ao aluno', () => {
  const CRASE = String.fromCharCode(96);
  const BARRA = String.fromCharCode(92);

  const textos = allLessons.flatMap((lesson) =>
    lesson.blocks
      .filter((b): b is Extract<typeof b, { markdown: string }> => 'markdown' in b)
      .map((b) => ({ id: lesson.id, texto: b.markdown }))
  );

  it('nenhuma barra invertida sobrou antes de crase', () => {
    // Escrever `\\`` no fonte em vez de `\`` produz uma barra invertida na
    // string, e o aluno vê o caractere no lugar da formatação de código. Passa
    // pelo typecheck e pelos testes de execução: só aparece na tela.
    const ruins = textos.filter(({ texto }) => texto.includes(BARRA + CRASE));

    expect(ruins.map((r) => r.id)).toEqual([]);
  });

  it('nenhum bloco de código ficou aberto', () => {
    for (const { id, texto } of textos) {
      const cercas = (texto.match(/^~~~/gm) ?? []).length;
      // Cerca ímpar significa bloco não fechado: daí em diante a aula inteira
      // vira código na tela.
      expect(cercas % 2, `${id}: bloco de código sem fechar`).toBe(0);
    }
  });
});

describe('armadilha do assíncrono', () => {
  const todasAsAssercoes = allExercises.flatMap(({ exercise }) => {
    if (exercise.type !== 'code' && exercise.type !== 'fill-blank') return [];

    return [
      ...exercise.tests.map((t) => ({ id: exercise.id, texto: t.assertion, onde: t.description })),
      ...(exercise.properties ?? []).map((p) => ({
        id: exercise.id,
        texto: p.check,
        onde: p.description,
      })),
    ];
  });

  it('nenhuma asserção usa .then() sem esperar o resultado', () => {
    const suspeitas = todasAsAssercoes.filter(({ texto }) => {
      const usaThen = /\.then\s*\(/.test(texto);
      if (!usaThen) return false;

      // `await algo.then(...)` e `return algo.then(...)` são seguros; o problema
      // é a chamada solta.
      return !/(await|return)\s+[^;]*\.then\s*\(/.test(texto);
    });

    // Uma promise não esperada reporta sucesso antes de resolver: o aluno vê
    // "correto" para uma resposta errada. É o pior defeito possível num
    // exercício, porque é silencioso e verde.
    expect(
      suspeitas.map((s) => `${s.id} — ${s.onde}`),
      'asserção com .then() sem await: passaria antes de a promise resolver'
    ).toEqual([]);
  });
});

describe('exercícios de lacuna', () => {
  it.each(fillBlankExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a solução declarada preenche e passa',
    async (_id, exercise) => {
      // Sem solução declarada não há como provar que o exercício é resolvível —
      // e um molde impossível só apareceria para o aluno.
      expect(exercise.solution, 'exercício de lacuna precisa declarar uma solução').toBeDefined();

      const resultado = await runProgram(
        preencher(exercise.template, exercise.solution!),
        exercise.tests,
        exercise.properties
      );

      expect(resultado.error, 'a solução não deveria lançar erro').toBeUndefined();

      const falhas = resultado.testResults.filter((t) => !t.passed).map((t) => t.message);
      expect(falhas, 'a solução deveria passar em tudo').toEqual([]);
    }
  );

  it.each(fillBlankExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: com as lacunas vazias NÃO passa',
    async (_id, exercise) => {
      const vazio = exercise.blanks.map(() => '');
      const resultado = await runProgram(
        preencher(exercise.template, vazio),
        exercise.tests,
        exercise.properties
      );

      const todosPassaram =
        resultado.testResults.length > 0 && resultado.testResults.every((t) => t.passed);

      expect(todosPassaram, 'o exercício passa sem o aluno preencher nada').toBe(false);
    }
  );

  it.each(fillBlankExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: a dica não entrega a resposta',
    async (_id, exercise) => {
      // Uma dica que contém a resposta literal transforma o exercício em cópia.
      for (const dica of exercise.hints) {
        for (const resposta of exercise.solution ?? []) {
          if (resposta.length < 3) continue;
          expect(
            dica.includes(resposta),
            `a dica "${dica}" contém a resposta "${resposta}"`
          ).toBe(false);
        }
      }
    }
  );
});

describe('exercícios de código', () => {
  it.each(codeExercises.map(({ lesson, exercise }) => [exercise.id, lesson.id, exercise] as const))(
    '%s: a solução de referência passa em todos os testes',
    async (_id, _lessonId, exercise) => {
      // Sem solução declarada, não há como garantir que o exercício é resolvível.
      expect(exercise.solution, 'exercício de código precisa declarar uma solução').toBeDefined();

      const resultado = await runProgram(`${exercise.initialCode}\n${exercise.solution}`, exercise.tests);

      expect(resultado.error, 'a solução não deveria lançar erro').toBeUndefined();

      const falhas = resultado.testResults.filter((t) => !t.passed).map((t) => t.message);
      expect(falhas, 'a solução deveria passar em todos os testes').toEqual([]);
      expect(resultado.testResults).toHaveLength(exercise.tests.length);
    }
  );

  it.each(codeExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: o código inicial NÃO passa (o exercício exige trabalho do aluno)',
    async (_id, exercise) => {
      const resultado = await runProgram(exercise.initialCode, exercise.tests, exercise.properties);
      const todosPassaram =
        resultado.testResults.length > 0 && resultado.testResults.every((t) => t.passed);

      expect(todosPassaram, 'o exercício está passando sem o aluno escrever nada').toBe(false);
    }
  );

  const comPropriedades = codeExercises.filter(({ exercise }) => exercise.properties?.length);

  it.each(comPropriedades.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: cada propriedade reprova o código inicial',
    async (_id, exercise) => {
      // Uma propriedade que passa com o esqueleto não está verificando nada — e
      // seria pior que a ausência dela, porque parece cobertura.
      for (const propriedade of exercise.properties!) {
        const resultado = await runProgram(exercise.initialCode, [], [propriedade]);
        const passou = resultado.testResults[0]?.passed === true;

        expect(passou, `a propriedade "${propriedade.description}" passa sem o aluno escrever nada`).toBe(
          false
        );
      }
    }
  );

  it.each(codeExercises.map(({ exercise }) => [exercise.id, exercise] as const))(
    '%s: toda mensagem de falha é escrita para o aluno',
    async (_id, exercise) => {
      const resultado = await runProgram(exercise.initialCode, exercise.tests, exercise.properties);

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
    async (_id, exercise) => {
      if (exercise.type !== 'predict-output') throw new Error('filtro inconsistente');

      const resultado = await runProgram(exercise.code, []);

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
    async (_id, exercise) => {
      if (exercise.type !== 'multiple-choice') throw new Error('filtro inconsistente');

      // correctIndex fora da lista tornaria a resposta certa `undefined`:
      // o aluno nunca conseguiria acertar e nada denunciaria o erro.
      expect(exercise.correctIndex).toBeLessThan(exercise.options.length);
      expect(exercise.options[exercise.correctIndex]).toBeTruthy();
    }
  );
});

describe('estrutura do catálogo', () => {
  it('ids de aula, exercício, projeto e flashcard são únicos', async () => {
    const coletar = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);

    expect(coletar(allLessons.map((l) => l.id))).toEqual([]);
    expect(coletar(allExercises.map(({ exercise }) => exercise.id))).toEqual([]);
    expect(coletar(listProjects().map((p) => p.id))).toEqual([]);
    expect(coletar(listFlashcards().map((f) => f.id))).toEqual([]);
  });

  it('toda aula tem pelo menos um exercício', async () => {
    const semExercicio = allLessons.filter((l) => getExercises(l).length === 0).map((l) => l.id);
    expect(semExercicio).toEqual([]);
  });

  it('toda aula pertence à trilha que a lista', async () => {
    for (const track of listTracks()) {
      for (const lesson of getLessonsOfTrack(track.id)) {
        expect(lesson.trackId).toBe(track.id);
      }
    }
  });

  it('as dicas vão do geral ao específico, sem repetir', async () => {
    for (const { exercise } of allExercises) {
      const unicas = new Set(exercise.hints);
      expect(unicas.size, `dicas repetidas em ${exercise.id}`).toBe(exercise.hints.length);
    }
  });
});

describe('progressão da trilha', () => {
  const track = listTracks()[0];
  const lessons = getLessonsOfTrack(track.id);

  it('sem nada concluído, a próxima aula é a primeira', async () => {
    expect(getNextLesson(track.id, [])?.id).toBe(lessons[0].id);
  });

  it('a próxima aula pula as já concluídas', async () => {
    expect(getNextLesson(track.id, [lessons[0].id])?.id).toBe(lessons[1].id);
  });

  it('com a trilha inteira concluída, não aponta de volta para o início', async () => {
    const todas = lessons.map((l) => l.id);
    expect(getNextLesson(track.id, todas)?.id).toBe(lessons[lessons.length - 1].id);
  });

  it('o percentual acompanha as aulas concluídas', async () => {
    expect(getTrackProgress(track.id, []).percentage).toBe(0);
    expect(getTrackProgress(track.id, lessons.map((l) => l.id)).percentage).toBe(100);
  });

  it('aulas concluídas de outra trilha não contam no percentual', async () => {
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
    async (_id, project) => {
      // Sem isso, eu poderia publicar um critério de aceitação impossível de
      // satisfazer — e o aluno tentaria para sempre sem nunca conseguir entregar.
      expect(project.referenceSolution, 'projeto precisa de solução de referência').toBeDefined();

      for (const checkpoint of project.checkpoints) {
        const resultado = await runProgram(
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
    async (_id, project) => {
      // Laço, e não `every`: uma função assíncrona dentro de `every` devolveria
      // uma promessa — que é sempre verdadeira, e o teste passaria sempre.
      let todosFecham = true;
      for (const checkpoint of project.checkpoints) {
        const r = await runProgram(project.initialCode, checkpoint.tests);
        const fechou = r.testResults.length > 0 && r.testResults.every((t) => t.passed);
        if (!fechou) {
          todosFecham = false;
          break;
        }
      }

      // Um projeto que já vem pronto daria o troféu sem trabalho nenhum.
      expect(todosFecham, 'o projeto está completo antes de o aluno escrever algo').toBe(false);
    }
  );

  it('ids de checkpoint são únicos dentro de cada projeto', async () => {
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

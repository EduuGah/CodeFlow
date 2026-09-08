import { describe, expect, it } from 'vitest';

import { getLesson } from '../../content';
import type { Exercise, Lesson, LessonBlock } from '../../content/types';
import { buildLessonSteps, countInteractiveSteps } from './lesson-steps';

/**
 * O agrupamento decide o ritmo da aula. Errar aqui não quebra tela nenhuma —
 * produz passos com conteúdo demais ou de menos, que é justamente o problema
 * que esta divisão existe para resolver.
 */

const exercicio: Exercise = {
  id: 'ex-teste',
  type: 'code',
  prompt: 'faça algo',
  concepts: ['loops'],
  difficulty: 'iniciante',
  hints: [],
  tags: [],
  initialCode: '',
  tests: [{ description: 'd', assertion: 'a' }],
};

function aula(blocks: LessonBlock[]): Lesson {
  return {
    id: 'l-teste',
    trackId: 't',
    title: 'Aula',
    language: 'javascript',
    objective: 'objetivo',
    concepts: ['loops'],
    blocks,
    status: 'published',
    estimatedMinutes: 10,
  };
}

const texto: LessonBlock = { kind: 'prose', markdown: 'explicação' };
const exemplo: LessonBlock = { kind: 'example', language: 'javascript', code: 'let x = 1;' };

describe('agrupamento em passos', () => {
  it('aula vazia não gera passo', () => {
    expect(buildLessonSteps(aula([]))).toEqual([]);
  });

  it('texto e exemplo consecutivos viram um passo só', () => {
    const passos = buildLessonSteps(aula([texto, exemplo]));

    // Um passo contendo só três linhas de código seria uma parede a mais.
    expect(passos).toHaveLength(1);
    expect(passos[0].kind).toBe('reading');
    if (passos[0].kind === 'reading') expect(passos[0].blocks).toHaveLength(2);
  });

  it('cada exercício é um passo próprio', () => {
    const passos = buildLessonSteps(
      aula([{ kind: 'exercise', exercise: exercicio }, { kind: 'exercise', exercise: { ...exercicio, id: 'ex-2' } }])
    );

    expect(passos.map((p) => p.kind)).toEqual(['exercise', 'exercise']);
  });

  it('o exercício interrompe o agrupamento da leitura', () => {
    const passos = buildLessonSteps(
      aula([texto, exemplo, { kind: 'exercise', exercise: exercicio }, texto])
    );

    expect(passos.map((p) => p.kind)).toEqual(['reading', 'exercise', 'reading']);
  });

  it('o resumo fica em passo separado', () => {
    const passos = buildLessonSteps(aula([texto, { kind: 'summary', markdown: 'resumo' }]));

    // Misturá-lo com o bloco anterior apagaria a função de consolidação.
    expect(passos.map((p) => p.kind)).toEqual(['reading', 'summary']);
  });

  it('o passo do exercício usa o id do próprio exercício', () => {
    const passos = buildLessonSteps(aula([{ kind: 'exercise', exercise: exercicio }]));
    expect(passos[0].id).toBe('ex-teste');
  });

  it('todos os passos têm id único', () => {
    const passos = buildLessonSteps(
      aula([
        texto,
        { kind: 'exercise', exercise: exercicio },
        exemplo,
        { kind: 'exercise', exercise: { ...exercicio, id: 'ex-2' } },
        { kind: 'summary', markdown: 'r' },
      ])
    );

    const ids = passos.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('contagem de passos interativos', () => {
  it('conta apenas exercícios', () => {
    const passos = buildLessonSteps(
      aula([texto, { kind: 'exercise', exercise: exercicio }, { kind: 'summary', markdown: 'r' }])
    );

    // Uma aula de dez passos com oito de leitura não é oito décimos de esforço.
    expect(countInteractiveSteps(passos)).toBe(1);
  });
});

describe('contra o conteúdo real', () => {
  it('toda aula publicada gera pelo menos um passo de exercício', () => {
    for (const id of ['lesson-js-1', 'lesson-js-4', 'lesson-js-8', 'lesson-logica-1']) {
      const lesson = getLesson(id);
      expect(lesson, `aula ${id} deveria existir`).toBeDefined();

      const passos = buildLessonSteps(lesson!);
      expect(countInteractiveSteps(passos), `aula ${id} sem exercício`).toBeGreaterThan(0);
    }
  });

  it('nenhuma aula real vira um passo único gigante', () => {
    const lesson = getLesson('lesson-js-4')!;
    const passos = buildLessonSteps(lesson);

    // Se tudo caísse num passo só, a divisão não estaria fazendo nada.
    expect(passos.length).toBeGreaterThan(1);
  });
});

import { describe, expect, it } from 'vitest';

import type { Attempt } from './mastery';
import { currentStreak, daysSinceLastStudy, lastActivity, unsolvedExerciseIds } from './study';

/**
 * Datas são a origem clássica de erro de um dia. Estes testes fixam um "hoje"
 * explícito em vez de depender do relógio, senão a suíte passaria de manhã e
 * falharia à noite.
 */

/** Tentativa num horário local específico. */
function em(dia: string, hora = '10:00', over: Partial<Attempt> = {}): Attempt {
  return {
    exerciseId: 'ex-1',
    lessonId: 'lesson-1',
    concepts: ['loops'],
    correct: true,
    hintsUsed: 0,
    createdAt: new Date(`${dia}T${hora}:00`).toISOString(),
    ...over,
  };
}

const hoje = new Date('2026-03-10T15:00:00');

describe('sequência de estudos', () => {
  it('sem histórico, a sequência é zero', () => {
    expect(currentStreak([], hoje)).toBe(0);
  });

  it('estudando hoje, a sequência começa em um', () => {
    expect(currentStreak([em('2026-03-10')], hoje)).toBe(1);
  });

  it('conta dias consecutivos terminando hoje', () => {
    const attempts = [em('2026-03-08'), em('2026-03-09'), em('2026-03-10')];
    expect(currentStreak(attempts, hoje)).toBe(3);
  });

  it('várias tentativas no mesmo dia contam como um dia só', () => {
    const attempts = [em('2026-03-10', '08:00'), em('2026-03-10', '14:00'), em('2026-03-10', '22:00')];
    expect(currentStreak(attempts, hoje)).toBe(1);
  });

  it('a sequência sobrevive se a última atividade foi ontem', () => {
    // Quem estudou ontem à noite e ainda não abriu hoje não perde a sequência.
    const attempts = [em('2026-03-08'), em('2026-03-09')];
    expect(currentStreak(attempts, hoje)).toBe(2);
  });

  it('dois dias sem estudar quebram a sequência', () => {
    expect(currentStreak([em('2026-03-07'), em('2026-03-08')], hoje)).toBe(0);
  });

  it('conta apenas o trecho consecutivo mais recente', () => {
    const attempts = [
      em('2026-03-01'), // bloco antigo, interrompido
      em('2026-03-02'),
      em('2026-03-09'), // bloco atual
      em('2026-03-10'),
    ];
    expect(currentStreak(attempts, hoje)).toBe(2);
  });

  it('atravessa a virada de mês', () => {
    const fimDeMes = new Date('2026-03-02T12:00:00');
    const attempts = [em('2026-02-28'), em('2026-03-01'), em('2026-03-02')];
    expect(currentStreak(attempts, fimDeMes)).toBe(3);
  });
});

describe('tempo desde o último estudo', () => {
  it('devolve null quando nunca houve atividade', () => {
    expect(daysSinceLastStudy([], hoje)).toBeNull();
  });

  it('zero quando estudou hoje', () => {
    expect(daysSinceLastStudy([em('2026-03-10')], hoje)).toBe(0);
  });

  it('conta os dias de ausência', () => {
    expect(daysSinceLastStudy([em('2026-03-03')], hoje)).toBe(7);
  });
});

describe('ponto de retomada', () => {
  it('devolve null sem histórico', () => {
    expect(lastActivity([])).toBeNull();
  });

  it('devolve a tentativa mais recente, não a última do array', () => {
    const attempts = [
      em('2026-03-10', '10:00', { lessonId: 'lesson-9', exerciseId: 'ex-recente' }),
      em('2026-03-01', '10:00', { lessonId: 'lesson-1', exerciseId: 'ex-antigo' }),
    ];

    expect(lastActivity(attempts)?.exerciseId).toBe('ex-recente');
    expect(lastActivity(attempts)?.lessonId).toBe('lesson-9');
  });

  it('informa se a última tentativa deu certo', () => {
    expect(lastActivity([em('2026-03-10', '10:00', { correct: false })])?.wasCorrect).toBe(false);
  });
});

describe('exercícios pendentes', () => {
  const todos = ['ex-a', 'ex-b', 'ex-c'];

  it('sem histórico, todos estão pendentes', () => {
    expect(unsolvedExerciseIds(todos, [])).toEqual(todos);
  });

  it('resolvido sai da lista', () => {
    const attempts = [em('2026-03-10', '10:00', { exerciseId: 'ex-b', correct: true })];
    expect(unsolvedExerciseIds(todos, attempts)).toEqual(['ex-a', 'ex-c']);
  });

  it('tentado sem sucesso continua pendente', () => {
    const attempts = [em('2026-03-10', '10:00', { exerciseId: 'ex-b', correct: false })];
    expect(unsolvedExerciseIds(todos, attempts)).toEqual(todos);
  });

  it('errar depois de acertar não devolve o exercício à lista', () => {
    const attempts = [
      em('2026-03-09', '10:00', { exerciseId: 'ex-b', correct: true }),
      em('2026-03-10', '10:00', { exerciseId: 'ex-b', correct: false }),
    ];
    // A revisão é tratada pelo domínio por conceito, não por "pendente".
    expect(unsolvedExerciseIds(todos, attempts)).toEqual(['ex-a', 'ex-c']);
  });

  it('preserva a ordem do catálogo', () => {
    expect(unsolvedExerciseIds(todos, [])).toEqual(['ex-a', 'ex-b', 'ex-c']);
  });
});

import { describe, expect, it } from 'vitest';

import {
  conceptMastery,
  conceptsNeedingReview,
  masteryByConcept,
  overallStats,
  type Attempt,
} from './mastery';

/**
 * O domínio por conceito decide o que a plataforma recomenda ao aluno. Errar a
 * conta aqui não quebra tela nenhuma — manda a pessoa revisar o que já sabe, ou
 * deixa avançar sobre uma base que não existe. Por isso cada regra tem teste.
 */

let contador = 0;

/** Tentativa com valores padrão sensatos; sobrescreva só o que o teste exige. */
function tentativa(over: Partial<Attempt> = {}): Attempt {
  contador += 1;
  return {
    exerciseId: `ex-${contador}`,
    lessonId: 'lesson-1',
    concepts: ['loops'],
    correct: true,
    hintsUsed: 0,
    // Datas crescentes, para a ordem cronológica ser previsível.
    createdAt: `2026-01-${String(contador).padStart(2, '0')}T10:00:00.000Z`,
    ...over,
  };
}

describe('níveis de domínio', () => {
  it('sem tentativa nenhuma, o conceito não foi iniciado', () => {
    const m = conceptMastery('loops', []);
    expect(m.level).toBe('nao-iniciado');
    expect(m.attempts).toBe(0);
    expect(m.needsReview).toBe(false);
  });

  it('tentou e ainda não acertou: está conhecendo', () => {
    const m = conceptMastery('loops', [tentativa({ correct: false })]);
    expect(m.level).toBe('conhecendo');
    expect(m.exercisesSolved).toBe(0);
  });

  it('acertou um exercício: está praticando, ainda não dominando', () => {
    const m = conceptMastery('loops', [tentativa()]);
    expect(m.level).toBe('praticando');
  });

  it('resolver o MESMO exercício várias vezes não vira domínio', () => {
    const repetido = { exerciseId: 'ex-fixo' };
    const m = conceptMastery('loops', [
      tentativa(repetido),
      tentativa(repetido),
      tentativa(repetido),
    ]);

    // Anti-decoreba (§82): domínio exige exercícios distintos.
    expect(m.exercisesSolved).toBe(1);
    expect(m.level).toBe('praticando');
  });

  it('dois exercícios distintos resolvidos sem dica: dominando', () => {
    const m = conceptMastery('loops', [
      tentativa({ exerciseId: 'ex-a' }),
      tentativa({ exerciseId: 'ex-b' }),
    ]);
    expect(m.level).toBe('dominando');
    expect(m.solvedUnaided).toBe(true);
  });

  it('acertar sempre com dica não conta como domínio', () => {
    const m = conceptMastery('loops', [
      tentativa({ exerciseId: 'ex-a', hintsUsed: 2 }),
      tentativa({ exerciseId: 'ex-b', hintsUsed: 1 }),
    ]);
    expect(m.solvedUnaided).toBe(false);
    expect(m.level).toBe('praticando');
  });

  it('precisão baixa impede o domínio mesmo com dois exercícios resolvidos', () => {
    const m = conceptMastery('loops', [
      tentativa({ exerciseId: 'ex-a', correct: false }),
      tentativa({ exerciseId: 'ex-a', correct: false }),
      tentativa({ exerciseId: 'ex-a', correct: false }),
      tentativa({ exerciseId: 'ex-a' }),
      tentativa({ exerciseId: 'ex-b' }),
    ]);
    expect(m.accuracy).toBeCloseTo(2 / 5);
    expect(m.level).toBe('praticando');
  });
});

describe('recomendação de revisão', () => {
  it('não recomenda revisão sem histórico', () => {
    expect(conceptMastery('loops', []).needsReview).toBe(false);
  });

  it('recomenda quando há histórico suficiente e pouca precisão', () => {
    const m = conceptMastery('loops', [
      tentativa({ correct: false }),
      tentativa({ correct: false }),
      tentativa({ correct: false }),
    ]);
    expect(m.needsReview).toBe(true);
  });

  it('não julga cedo demais: duas falhas ainda não disparam revisão', () => {
    const m = conceptMastery('loops', [
      tentativa({ correct: false }),
      tentativa({ correct: false }),
    ]);
    expect(m.attempts).toBe(2);
    expect(m.needsReview).toBe(false);
  });

  it('recomenda quando houve regressão: já resolveu, mas a última falhou', () => {
    const m = conceptMastery('loops', [
      tentativa({ exerciseId: 'ex-a', correct: true, createdAt: '2026-02-01T10:00:00.000Z' }),
      tentativa({ exerciseId: 'ex-b', correct: false, createdAt: '2026-02-09T10:00:00.000Z' }),
    ]);
    expect(m.needsReview).toBe(true);
  });

  it('a ordem cronológica é o que vale, não a ordem do array', () => {
    // A falha é anterior ao acerto, então não houve regressão.
    const m = conceptMastery('loops', [
      tentativa({ exerciseId: 'ex-b', correct: true, createdAt: '2026-02-09T10:00:00.000Z' }),
      tentativa({ exerciseId: 'ex-a', correct: false, createdAt: '2026-02-01T10:00:00.000Z' }),
    ]);
    expect(m.needsReview).toBe(false);
  });
});

describe('filtragem por conceito', () => {
  it('tentativas de outro conceito não contam', () => {
    const m = conceptMastery('loops', [
      tentativa({ concepts: ['arrays'] }),
      tentativa({ concepts: ['arrays'] }),
    ]);
    expect(m.level).toBe('nao-iniciado');
  });

  it('uma tentativa conta para todos os conceitos que ela exercita', () => {
    const attempts = [tentativa({ concepts: ['loops', 'arrays'] })];
    const [loops, arrays] = masteryByConcept(['loops', 'arrays'], attempts);

    expect(loops.attempts).toBe(1);
    expect(arrays.attempts).toBe(1);
  });

  it('lista de revisão vem do conceito mais fraco para o mais forte', () => {
    const attempts = [
      // arrays: 0 de 3
      tentativa({ concepts: ['arrays'], correct: false }),
      tentativa({ concepts: ['arrays'], correct: false }),
      tentativa({ concepts: ['arrays'], correct: false }),
      // loops: 1 de 4
      tentativa({ concepts: ['loops'], correct: false }),
      tentativa({ concepts: ['loops'], correct: false }),
      tentativa({ concepts: ['loops'], correct: false }),
      tentativa({ concepts: ['loops'], correct: true }),
    ];

    const revisar = conceptsNeedingReview(['loops', 'arrays', 'funcoes'], attempts);

    expect(revisar.map((m) => m.conceptId)).toEqual(['arrays', 'loops']);
    // 'funcoes' não tem histórico, então não entra na lista.
  });
});

describe('números gerais', () => {
  it('sem tentativas, tudo em zero e sem divisão por zero', () => {
    const s = overallStats([]);
    expect(s).toEqual({
      attempts: 0,
      correctAttempts: 0,
      accuracy: 0,
      exercisesSolved: 0,
      activeDays: 0,
    });
  });

  it('conta acertos, precisão e exercícios distintos resolvidos', () => {
    const s = overallStats([
      tentativa({ exerciseId: 'ex-a', correct: true }),
      tentativa({ exerciseId: 'ex-a', correct: true }),
      tentativa({ exerciseId: 'ex-b', correct: false }),
      tentativa({ exerciseId: 'ex-c', correct: true }),
    ]);

    expect(s.attempts).toBe(4);
    expect(s.correctAttempts).toBe(3);
    expect(s.accuracy).toBeCloseTo(0.75);
    expect(s.exercisesSolved).toBe(2);
  });

  it('dias ativos contam datas distintas, não tentativas', () => {
    const s = overallStats([
      tentativa({ createdAt: '2026-03-01T08:00:00.000Z' }),
      tentativa({ createdAt: '2026-03-01T20:00:00.000Z' }),
      tentativa({ createdAt: '2026-03-04T09:00:00.000Z' }),
    ]);
    expect(s.activeDays).toBe(2);
  });
});

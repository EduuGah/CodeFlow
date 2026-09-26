import { describe, expect, it } from 'vitest';

import {
  conceptMastery,
  conceptsNeedingReview,
  DIAS_PARA_CONFIRMAR,
  DIAS_PARA_ENVELHECER,
  masteryByConcept,
  overallStats,
  type Attempt,
} from './mastery';
import { somarDias } from './sequencia';

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
    // Datas crescentes, uma hora por tentativa, para a ordem cronológica ser
    // previsível — e válidas para qualquer contador (o `2026-01-${n}` de antes
    // virava "dia 45" depois de alguns testes, e ninguém lia a data).
    createdAt: new Date(Date.UTC(2026, 0, 1, 10) + contador * 3_600_000).toISOString(),
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

  it('dois exercícios distintos resolvidos sem dica, com dias entre eles: dominando', () => {
    const m = conceptMastery('loops', [
      tentativa({ exerciseId: 'ex-a', createdAt: local('2026-03-01') }),
      tentativa({ exerciseId: 'ex-b', createdAt: local(somarDias('2026-03-01', DIAS_PARA_CONFIRMAR)) }),
    ]);
    expect(m.level).toBe('dominando');
    expect(m.solvedUnaided).toBe(true);
    expect(m.confirmadoNoTempo).toBe(true);
  });

  it('acertar sempre com dica não conta como domínio', () => {
    const m = conceptMastery('loops', [
      tentativa({ exerciseId: 'ex-a', hintsUsed: 2 }),
      tentativa({ exerciseId: 'ex-b', hintsUsed: 1 }),
    ]);
    expect(m.solvedUnaided).toBe(false);
    expect(m.level).toBe('praticando');
    // Falta mais que tempo: não é "aguardando confirmação".
    expect(m.aguardandoConfirmacao).toBe(false);
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

/** Um instante no dia local dado, às 10h. */
function local(dia: string, hora = '10:00'): string {
  return new Date(`${dia}T${hora}:00`).toISOString();
}

describe('domínio pede tempo', () => {
  it('dois exercícios na mesma tarde: praticando — é a memória de curto prazo respondendo', () => {
    const m = conceptMastery('loops', [
      tentativa({ exerciseId: 'ex-a', createdAt: local('2026-03-01', '14:00') }),
      tentativa({ exerciseId: 'ex-b', createdAt: local('2026-03-01', '14:10') }),
    ]);
    expect(m.exercisesSolved).toBe(2);
    expect(m.confirmadoNoTempo).toBe(false);
    expect(m.level).toBe('praticando');
    // E a tela pode dizer o que falta, em vez de deixar adivinhar.
    expect(m.aguardandoConfirmacao).toBe(true);
  });

  it(`um dia antes dos ${DIAS_PARA_CONFIRMAR} ainda não confirma`, () => {
    const m = conceptMastery('loops', [
      tentativa({ exerciseId: 'ex-a', createdAt: local('2026-03-01') }),
      tentativa({ exerciseId: 'ex-b', createdAt: local(somarDias('2026-03-01', DIAS_PARA_CONFIRMAR - 1)) }),
    ]);
    expect(m.level).toBe('praticando');
  });

  it('refazer o mesmo exercício dias depois confirma — lembrar é o que conta', () => {
    const m = conceptMastery('loops', [
      tentativa({ exerciseId: 'ex-a', createdAt: local('2026-03-01', '14:00') }),
      tentativa({ exerciseId: 'ex-b', createdAt: local('2026-03-01', '14:10') }),
      tentativa({ exerciseId: 'ex-a', createdAt: local('2026-03-05') }),
    ]);
    expect(m.level).toBe('dominando');
  });

  it('conta dias do calendário de quem estuda, não horas corridas', () => {
    const mesmoDia = conceptMastery('loops', [
      tentativa({ exerciseId: 'ex-a', createdAt: local('2026-03-01', '01:00') }),
      tentativa({ exerciseId: 'ex-b', createdAt: local('2026-03-03', '23:00') }),
    ]);
    // 1º às 1h, 3 às 23h: dois dias de distância, por mais horas que sejam.
    expect(mesmoDia.confirmadoNoTempo).toBe(false);

    const tresDias = conceptMastery('loops', [
      tentativa({ exerciseId: 'ex-a', createdAt: local('2026-03-01', '23:00') }),
      tentativa({ exerciseId: 'ex-b', createdAt: local('2026-03-04', '01:00') }),
    ]);
    expect(tresDias.confirmadoNoTempo).toBe(true);
  });

  it(`dominando sem prática há ${DIAS_PARA_ENVELHECER} dias pede revisão — e continua dominando`, () => {
    const attempts = [
      tentativa({ exerciseId: 'ex-a', createdAt: local('2026-01-01') }),
      tentativa({ exerciseId: 'ex-b', createdAt: local('2026-01-10') }),
    ];
    const ainda = conceptMastery('loops', attempts, new Date(`${somarDias('2026-01-10', DIAS_PARA_ENVELHECER - 1)}T12:00:00`));
    expect(ainda.level).toBe('dominando');
    expect(ainda.needsReview).toBe(false);

    const parado = conceptMastery('loops', attempts, new Date(`${somarDias('2026-01-10', DIAS_PARA_ENVELHECER)}T12:00:00`));
    expect(parado.level).toBe('dominando');
    expect(parado.motivoDaRevisao).toBe('tempo');
    expect(parado.needsReview).toBe(true);
  });

  it('o tempo não marca revisão em quem ainda está praticando', () => {
    const m = conceptMastery('loops', [tentativa({ createdAt: local('2025-01-01') })], new Date('2026-03-01T12:00:00'));
    expect(m.level).toBe('praticando');
    expect(m.needsReview).toBe(false);
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
    expect(m.motivoDaRevisao).toBe('pouca-precisao');
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
    expect(m.motivoDaRevisao).toBe('regressao');
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
      tentativa({ createdAt: local('2026-03-01', '08:00') }),
      tentativa({ createdAt: local('2026-03-01', '20:00') }),
      tentativa({ createdAt: local('2026-03-04', '09:00') }),
    ]);
    expect(s.activeDays).toBe(2);
  });

  it('o dia ativo é o local: da 0h às 23h59 é um dia só, em qualquer fuso', () => {
    // Em São Paulo, 22h já é o dia seguinte em UTC: contar pela data UTC
    // transformava uma noite de estudo em dois dias. (O CI roda este arquivo
    // também em UTC+14, onde o engano aparece.)
    const s = overallStats([
      tentativa({ createdAt: local('2026-03-01', '00:30') }),
      tentativa({ createdAt: local('2026-03-01', '23:30') }),
    ]);
    expect(s.activeDays).toBe(1);
  });
});

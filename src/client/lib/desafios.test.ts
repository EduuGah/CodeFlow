import { describe, expect, it } from 'vitest';

import type { Attempt } from './mastery';
import type { FlashcardReview } from './review';
import {
  DESAFIOS_DA_SEMANA,
  DESAFIOS_DO_DIA,
  desafiosAtuais,
  desafiosConcluidos,
  desafiosDaSemana,
  desafiosDoDia,
  inicioDaSemana,
  POR_PERIODO,
  RECOMPENSA,
} from './desafios';

const t = (dia: string, over: Partial<Attempt> = {}): Attempt => ({
  exerciseId: 'ex-1',
  lessonId: 'l-1',
  concepts: ['c'],
  correct: true,
  hintsUsed: 0,
  createdAt: new Date(`${dia}T10:00:00`).toISOString(),
  ...over,
});

const r = (dia: string, id: string): FlashcardReview => ({
  flashcardId: id,
  rating: 'facil',
  createdAt: new Date(`${dia}T10:00:00`).toISOString(),
});

// Uma terça-feira.
const HOJE = new Date('2026-03-10T15:00:00');

describe('o sorteio', () => {
  it('é o mesmo para a mesma data, e diferente da véspera', () => {
    const a = desafiosDoDia('2026-03-10').map((d) => d.id);
    const b = desafiosDoDia('2026-03-10').map((d) => d.id);
    expect(a).toEqual(b);
    expect(a).toHaveLength(POR_PERIODO.dia);

    // Trinta dias seguidos: nunca um desafio repetido de um dia para o outro.
    let anterior = new Set(desafiosDoDia('2026-02-28').map((d) => d.id));
    for (let i = 1; i <= 30; i++) {
      const dia = `2026-03-${String(i).padStart(2, '0')}`;
      const atual = desafiosDoDia(dia).map((d) => d.id);
      expect(new Set(atual).size, dia).toBe(atual.length);
      for (const id of atual) expect(anterior.has(id), `${dia}: ${id} repetiu a véspera`).toBe(false);
      anterior = new Set(atual);
    }
  });

  it('a semana começa na segunda', () => {
    expect(inicioDaSemana('2026-03-10')).toBe('2026-03-09');
    expect(inicioDaSemana('2026-03-09')).toBe('2026-03-09');
    expect(inicioDaSemana('2026-03-15')).toBe('2026-03-09');
    expect(desafiosDaSemana('2026-03-09')).toHaveLength(POR_PERIODO.semana);
  });

  it('toda definição tem meta e frase', () => {
    for (const d of [...DESAFIOS_DO_DIA, ...DESAFIOS_DA_SEMANA]) {
      expect(d.meta).toBeGreaterThan(0);
      expect(d.description).toContain(String(d.meta === 1 ? 'um' : ''));
    }
  });
});

describe('progresso e conclusão', () => {
  it('sem atividade, tudo em zero e nada concluído', () => {
    const { dia, semana } = desafiosAtuais({ attempts: [], reviews: [], completedLessons: [], hoje: HOJE });
    expect([...dia, ...semana].every((d) => d.progresso === 0 && !d.concluido)).toBe(true);
  });

  it('o progresso do dia só conta o de hoje, e exercícios distintos', () => {
    const attempts = [
      t('2026-03-10', { exerciseId: 'a' }),
      t('2026-03-10', { exerciseId: 'a' }),
      t('2026-03-10', { exerciseId: 'b' }),
      t('2026-03-09', { exerciseId: 'c' }),
    ];
    const ctxDia = DESAFIOS_DO_DIA.find((d) => d.id === 'dia-resolver-3')!;
    const { dia } = desafiosAtuais({ attempts, reviews: [], completedLessons: [], hoje: HOJE });
    // Independe do sorteio: avalia a definição direto.
    const tentativasDeHoje = attempts.filter((a) => a.createdAt.startsWith('2026-03-10'));
    expect(ctxDia.progresso({ tentativas: tentativasDeHoje, historico: attempts, revisoes: [], aulasConcluidas: 0 })).toBe(2);
    expect(dia.every((d) => d.progresso <= d.desafio.meta)).toBe(true);
  });

  it('"voltar e resolver" exige um erro anterior no mesmo exercício', () => {
    const def = DESAFIOS_DO_DIA.find((d) => d.id === 'dia-insistir-1')!;
    const ontemErrou = t('2026-03-09', { exerciseId: 'a', correct: false });
    const hojeAcertou = t('2026-03-10', { exerciseId: 'a' });
    expect(def.progresso({ tentativas: [hojeAcertou], historico: [ontemErrou, hojeAcertou], revisoes: [], aulasConcluidas: 0 })).toBe(1);
    expect(def.progresso({ tentativas: [hojeAcertou], historico: [hojeAcertou], revisoes: [], aulasConcluidas: 0 })).toBe(0);
  });

  it('o desafio semanal de dias conta dias distintos da semana', () => {
    const def = DESAFIOS_DA_SEMANA.find((d) => d.id === 'semana-dias-4')!;
    const tentativas = ['2026-03-09', '2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12'].map((d) => t(d));
    expect(def.progresso({ tentativas, historico: tentativas, revisoes: [], aulasConcluidas: 0 })).toBe(4);
  });

  it('a conclusão de aula é datada pela última tentativa certa nela', () => {
    const attempts = [t('2026-03-08', { lessonId: 'l-1', exerciseId: 'a' }), t('2026-03-10', { lessonId: 'l-1', exerciseId: 'b' })];
    const def = DESAFIOS_DO_DIA.find((d) => d.id === 'dia-aula-1')!;
    // A função de contexto é interna; provamos pelo caminho público.
    const concluidos = desafiosConcluidos({ attempts, reviews: [], completedLessons: ['l-1'], hoje: HOJE });
    const hojeTem = desafiosDoDia('2026-03-10').some((d) => d.id === def.id);
    if (hojeTem) expect(concluidos.some((c) => c.id === def.id && c.dia === '2026-03-10')).toBe(true);
    expect(concluidos.some((c) => c.id === def.id && c.dia === '2026-03-08')).toBe(false);
  });
});

describe('o histórico de desafios cumpridos', () => {
  it('vasculha cada dia e cada semana com atividade', () => {
    // Cinco exercícios sem dica, em cinco dias seguidos: os desafios diários
    // de "sem dica" e os semanais de dias devem aparecer conforme o sorteio.
    const attempts = ['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06'].flatMap((d, i) => [
      t(d, { exerciseId: `a${i}` }),
      t(d, { exerciseId: `b${i}` }),
      t(d, { exerciseId: `c${i}` }),
    ]);
    const concluidos = desafiosConcluidos({ attempts, reviews: [], completedLessons: [], hoje: HOJE });

    const diarios = concluidos.filter((c) => c.periodo === 'dia');
    // Todo dia tem 3 exercícios sem dica: "três exercícios" e "sem abrir dica"
    // são cumpridos sempre que sorteados.
    for (const dia of ['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06']) {
      const sorteados = desafiosDoDia(dia).filter((d) => d.id === 'dia-resolver-3' || d.id === 'dia-sem-dica-2');
      expect(diarios.filter((c) => c.dia === dia).map((c) => c.id).sort()).toEqual(sorteados.map((d) => d.id).sort());
    }
    // A semana de 02/03 tem 5 dias e 15 exercícios: cumpre "quatro dias" e "quinze exercícios" se sorteados.
    const semanais = concluidos.filter((c) => c.periodo === 'semana');
    const sorteados = desafiosDaSemana('2026-03-02').filter((d) => d.id === 'semana-dias-4' || d.id === 'semana-exercicios-15');
    expect(semanais.map((c) => c.id).sort()).toEqual(sorteados.map((d) => d.id).sort());
    for (const c of concluidos) expect(c.recompensa).toEqual(RECOMPENSA[c.periodo]);
  });

  it('revisões sozinhas também contam como atividade', () => {
    const reviews = ['a', 'b', 'c', 'd', 'e'].map((id) => r('2026-03-10', id));
    const concluidos = desafiosConcluidos({ attempts: [], reviews, completedLessons: [], hoje: HOJE });
    const sorteado = desafiosDoDia('2026-03-10').some((d) => d.id === 'dia-revisar-5');
    expect(concluidos.some((c) => c.id === 'dia-revisar-5')).toBe(sorteado);
  });
});

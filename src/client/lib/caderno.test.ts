import { describe, expect, it } from 'vitest';

import {
  dependentesPorConceito,
  evidenciaPorExercicio,
  filaDeRevisao,
  INTERVALOS_DO_CADERNO,
  montarCaderno,
  resumoDoCaderno,
  sessaoDeRefazer,
  TAMANHO_DA_SESSAO,
} from './caderno';
import type { Attempt } from './mastery';
import type { EvidenciaDoErro } from './resposta';

/** Tentativa num dia local, na hora dada (10h se não disser). */
function t(exerciseId: string, dia: string, correct: boolean, hora = '10:00', over: Partial<Attempt> = {}): Attempt {
  return {
    exerciseId,
    lessonId: 'aula-1',
    concepts: ['laços'],
    correct,
    hintsUsed: 0,
    createdAt: new Date(`${dia}T${hora}:00`).toISOString(),
    ...over,
  };
}

const HOJE = new Date('2026-03-20T15:00:00');

describe('quem entra no caderno', () => {
  it('só exercício com alguma tentativa errada', () => {
    const caderno = montarCaderno([t('a', '2026-03-10', true), t('b', '2026-03-10', false)], new Map(), HOJE);
    expect(caderno.map((e) => e.exerciseId)).toEqual(['b']);
  });

  it('guarda quantas vezes errou, o primeiro erro e o último', () => {
    const [entrada] = montarCaderno([t('a', '2026-03-10', false), t('a', '2026-03-12', false)], new Map(), HOJE);

    expect(entrada.vezesErrado).toBe(2);
    expect(entrada.primeiroErro).toBe(t('a', '2026-03-10', false).createdAt);
    expect(entrada.ultimoErro.createdAt).toBe(t('a', '2026-03-12', false).createdAt);
  });
});

describe('a evidência', () => {
  const ev = (exerciseId: string, dia: string, indice: number): EvidenciaDoErro => ({
    exerciseId,
    resposta: { tipo: 'alternativa', indice },
    feedback: null,
    createdAt: new Date(`${dia}T10:00:00`).toISOString(),
  });

  it('fica a mais recente de cada exercício, em qualquer ordem de chegada', () => {
    const mapa = evidenciaPorExercicio([ev('a', '2026-03-10', 1), ev('b', '2026-03-11', 0), ev('a', '2026-03-12', 3)]);
    expect(mapa.get('a')?.resposta).toEqual({ tipo: 'alternativa', indice: 3 });
    expect(mapa.get('b')?.resposta).toEqual({ tipo: 'alternativa', indice: 0 });
  });
});

describe('o espaçamento', () => {
  it('errou e não acertou depois: pendente', () => {
    const [e] = montarCaderno([t('a', '2026-03-10', false)], new Map(), HOJE);
    expect(e.estado).toBe('pendente');
    expect(e.proximaRevisao).toBeNull();
  });

  it('acertou depois do erro: volta em 3 dias', () => {
    const [antes] = montarCaderno([t('a', '2026-03-18', false), t('a', '2026-03-18', true, '11:00')], new Map(), HOJE);
    expect(antes.estado).toBe('em-dia');
    expect(antes.proximaRevisao).toBe('2026-03-21');

    const [vencido] = montarCaderno([t('a', '2026-03-10', false), t('a', '2026-03-10', true, '11:00')], new Map(), HOJE);
    expect(vencido.estado).toBe('revisar');
  });

  it('repetir no mesmo dia não adianta: só conta o acerto que chega na data', () => {
    // Quatro acertos seguidos no dia do erro: um só conta.
    const attempts = [
      t('a', '2026-03-18', false),
      ...['11:00', '12:00', '13:00', '14:00'].map((h) => t('a', '2026-03-18', true, h)),
    ];
    const [e] = montarCaderno(attempts, new Map(), HOJE);
    expect(e.acertosEspacados).toBe(1);
    expect(e.estado).toBe('em-dia');
  });

  it(`passar pelas ${INTERVALOS_DO_CADERNO.length} revisões na data deixa dominado`, () => {
    const attempts = [
      t('a', '2026-01-01', false),
      t('a', '2026-01-01', true, '11:00'),
      t('a', '2026-01-04', true), // +3
      t('a', '2026-01-11', true), // +7
      t('a', '2026-02-01', true), // +21
    ];
    const [e] = montarCaderno(attempts, new Map(), HOJE);
    expect(e.acertosEspacados).toBe(4);
    expect(e.estado).toBe('dominado');
    expect(e.proximaRevisao).toBeNull();
  });

  it('um erro novo recomeça a contagem', () => {
    const attempts = [
      t('a', '2026-01-01', false),
      t('a', '2026-01-01', true, '11:00'),
      t('a', '2026-01-04', true),
      t('a', '2026-03-19', false),
    ];
    const [e] = montarCaderno(attempts, new Map(), HOJE);
    expect(e.estado).toBe('pendente');
    expect(e.vezesErrado).toBe(2);
  });
});

describe('a fila de revisão', () => {
  it('pendentes antes de vencidos; em dia e dominados fora', () => {
    const attempts = [
      t('vencido', '2026-03-01', false),
      t('vencido', '2026-03-01', true, '11:00'),
      t('pendente', '2026-03-15', false),
      t('em-dia', '2026-03-19', false),
      t('em-dia', '2026-03-19', true, '11:00'),
    ];
    const fila = filaDeRevisao(montarCaderno(attempts, new Map(), HOJE));
    expect(fila.map((e) => e.exerciseId)).toEqual(['pendente', 'vencido']);
  });

  it('entre pendentes: quem errou mais, depois o conceito que sustenta mais, depois o erro mais antigo', () => {
    const dependentes = dependentesPorConceito([
      { id: 'base', prerequisites: [] },
      { id: 'x', prerequisites: ['base'] },
      { id: 'y', prerequisites: ['base'] },
    ]);
    const attempts = [
      t('uma-vez-folha', '2026-03-10', false, '10:00', { concepts: ['x'] }),
      t('uma-vez-base', '2026-03-12', false, '10:00', { concepts: ['base'] }),
      t('duas-vezes', '2026-03-14', false, '10:00', { concepts: ['x'] }),
      t('duas-vezes', '2026-03-15', false, '10:00', { concepts: ['x'] }),
      t('uma-vez-folha-antiga', '2026-03-01', false, '10:00', { concepts: ['y'] }),
    ];
    const fila = filaDeRevisao(montarCaderno(attempts, dependentes, HOJE));
    expect(fila.map((e) => e.exerciseId)).toEqual(['duas-vezes', 'uma-vez-base', 'uma-vez-folha-antiga', 'uma-vez-folha']);
  });

  it('o resumo conta cada estado', () => {
    const attempts = [t('a', '2026-03-15', false), t('b', '2026-03-19', false), t('b', '2026-03-19', true, '11:00')];
    expect(resumoDoCaderno(montarCaderno(attempts, new Map(), HOJE))).toEqual({ pendente: 1, revisar: 0, 'em-dia': 1, dominado: 0 });
  });
});

describe('a sessão de refazer', () => {
  const existe = () => true;

  it('sem pedido: o começo da fila, no máximo uma sessão curta', () => {
    const attempts = Array.from({ length: TAMANHO_DA_SESSAO + 5 }, (_, i) => t(`ex-${i}`, '2026-03-10', false));
    const sessao = sessaoDeRefazer(montarCaderno(attempts, new Map(), HOJE), null, existe);
    expect(sessao).toHaveLength(TAMANHO_DA_SESSAO);
  });

  it('com pedido: só o escolhido — mesmo em dia, que a pessoa pode querer conferir', () => {
    const caderno = montarCaderno(
      [t('a', '2026-03-10', false), t('b', '2026-03-19', false), t('b', '2026-03-19', true, '11:00')],
      new Map(),
      HOJE
    );
    expect(sessaoDeRefazer(caderno, 'b', existe).map((e) => e.exerciseId)).toEqual(['b']);
    expect(sessaoDeRefazer(caderno, 'nunca-errado', existe)).toEqual([]);
  });

  it('o que saiu do catálogo fica de fora', () => {
    const caderno = montarCaderno([t('a', '2026-03-10', false), t('fora', '2026-03-11', false)], new Map(), HOJE);
    const noCatalogo = (id: string) => id !== 'fora';
    expect(sessaoDeRefazer(caderno, null, noCatalogo).map((e) => e.exerciseId)).toEqual(['a']);
    expect(sessaoDeRefazer(caderno, 'fora', noCatalogo)).toEqual([]);
  });
});

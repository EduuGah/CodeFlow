import { describe, expect, it } from 'vitest';

import type { Attempt } from './mastery';
import {
  dobroAtivo,
  historicoDeCompras,
  ITENS,
  itemDaLoja,
  moedasGanhas,
  moedasGastas,
  MOEDAS,
  posseDe,
  RARIDADES,
  temItem,
} from './economia';

const em = (dia: string): Attempt => ({
  exerciseId: 'ex',
  lessonId: 'l',
  concepts: [],
  correct: true,
  hintsUsed: 0,
  createdAt: new Date(`${dia}T10:00:00`).toISOString(),
});

const hoje = new Date('2026-03-31T15:00:00');

describe('moedas ganhas', () => {
  it('aulas e projetos rendem o tabelado', () => {
    const m = moedasGanhas({ completedLessons: ['a', 'b'], completedProjects: ['p'], attempts: [], purchases: [], moedasDeDesafios: 0, hoje });
    expect(m.aulas).toBe(2 * MOEDAS.porAulaConcluida);
    expect(m.projetos).toBe(MOEDAS.porProjetoEntregue);
    expect(m.total).toBe(m.aulas + m.projetos);
  });

  it('uma semana seguida rende o marco uma vez, e trinta dias rende os dois', () => {
    const sete = Array.from({ length: 7 }, (_, i) => em(`2026-03-${String(i + 1).padStart(2, '0')}`));
    expect(moedasGanhas({ completedLessons: [], completedProjects: [], attempts: sete, purchases: [], moedasDeDesafios: 0, hoje }).sequencia).toBe(MOEDAS.porSemanaSeguida);

    const oito = [...sete, em('2026-03-08')];
    expect(moedasGanhas({ completedLessons: [], completedProjects: [], attempts: oito, purchases: [], moedasDeDesafios: 0, hoje }).sequencia).toBe(MOEDAS.porSemanaSeguida);

    const trinta = Array.from({ length: 30 }, (_, i) => em(`2026-03-${String(i + 1).padStart(2, '0')}`));
    expect(moedasGanhas({ completedLessons: [], completedProjects: [], attempts: trinta, purchases: [], moedasDeDesafios: 0, hoje }).sequencia).toBe(
      MOEDAS.porSemanaSeguida + MOEDAS.porMesSeguido
    );
  });

  it('duas correntes de sete dias são dois marcos', () => {
    const duas = [
      ...Array.from({ length: 7 }, (_, i) => em(`2026-02-${String(i + 1).padStart(2, '0')}`)),
      ...Array.from({ length: 7 }, (_, i) => em(`2026-03-${String(i + 10).padStart(2, '0')}`)),
    ];
    expect(moedasGanhas({ completedLessons: [], completedProjects: [], attempts: duas, purchases: [], moedasDeDesafios: 0, hoje }).sequencia).toBe(2 * MOEDAS.porSemanaSeguida);
  });

  it('os desafios entram já contados', () => {
    expect(moedasGanhas({ completedLessons: [], completedProjects: [], attempts: [], purchases: [], moedasDeDesafios: 45, hoje }).desafios).toBe(45);
  });
});

describe('a loja', () => {
  it('cada item tem preço e frase, e os ids são únicos', () => {
    expect(new Set(ITENS.map((i) => i.id)).size).toBe(ITENS.length);
    for (const item of ITENS) {
      expect(item.price).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(10);
    }
    expect(itemDaLoja('congelar-sequencia')?.tipo).toBe('consumivel');
  });

  it('gastas é a soma dos preços registrados nas compras', () => {
    expect(moedasGastas([{ item: 'x', price: 60, createdAt: '' }, { item: 'y', price: 80, createdAt: '' }])).toBe(140);
  });

  it('um cosmético é seu pelo nível ou pela compra; um consumível nunca é seu', () => {
    const tema = itemDaLoja('tema-oceano')!;
    expect(temItem(tema, 1, [])).toBe(false);
    expect(temItem(tema, tema.nivelQueLibera!, [])).toBe(true);
    expect(temItem(tema, 1, [{ item: 'tema-oceano', price: 120, createdAt: '' }])).toBe(true);
    expect(temItem(itemDaLoja('dobro-de-xp')!, 99, [{ item: 'dobro-de-xp', price: 80, createdAt: '' }])).toBe(false);
  });

  it('o dobro fica ativo por 24 horas a partir da compra', () => {
    const compras = [{ item: 'dobro-de-xp', price: 80, createdAt: '2026-03-10T10:00:00.000Z' }];
    expect(dobroAtivo(compras, new Date('2026-03-10T12:00:00.000Z'))?.ate.toISOString()).toBe('2026-03-11T10:00:00.000Z');
    expect(dobroAtivo(compras, new Date('2026-03-11T10:00:00.000Z'))).toBeNull();
    expect(dobroAtivo(compras, new Date('2026-03-10T09:59:00.000Z'))).toBeNull();
  });
});

describe('a raridade', () => {
  it('acompanha o nível que libera: até o 5 comum, do 6 ao 9 incomum, do 10 em diante raro', () => {
    // Enquanto os preços não forem recalibrados pela raridade (etapa 10 da
    // Loja 2.0), é o nível que diz quão longe na jornada o item mora.
    for (const item of ITENS.filter((i) => i.nivelQueLibera !== undefined)) {
      const nivel = item.nivelQueLibera!;
      const esperada = nivel <= 5 ? 'comum' : nivel <= 9 ? 'incomum' : 'raro';
      expect(item.raridade, item.id).toBe(esperada);
    }
  });

  it('consumível é comum: gastar não pode ser coisa rara', () => {
    for (const item of ITENS.filter((i) => i.tipo === 'consumivel')) expect(item.raridade, item.id).toBe('comum');
  });

  it('nada à venda é épico nem lendário: esses são de conquista', () => {
    for (const item of ITENS) expect(RARIDADES[item.raridade].ordem, item.id).toBeLessThan(RARIDADES.epico.ordem);
  });
});

describe('a posse, para o inventário', () => {
  const tema = itemDaLoja('tema-oceano')!;
  const compra = { item: 'tema-oceano', price: 120, createdAt: '' };

  it('o que nunca esteve à venda é de todo mundo', () => {
    expect(posseDe(undefined, 1, [])).toEqual({ tem: true, origem: 'livre' });
  });

  it('pelo nível, pela compra — e a compra vence na origem, porque foi escolha', () => {
    expect(posseDe(tema, tema.nivelQueLibera!, [])).toEqual({ tem: true, origem: 'nivel' });
    expect(posseDe(tema, 1, [compra])).toEqual({ tem: true, origem: 'compra' });
    expect(posseDe(tema, 99, [compra])).toEqual({ tem: true, origem: 'compra' });
  });

  it('bloqueado diz o que falta: o nível que abre e o preço', () => {
    expect(posseDe(tema, 1, [])).toEqual({ tem: false, nivel: tema.nivelQueLibera, preco: tema.price });
  });

  it('concorda com `temItem` em todo cosmético, em todo nível', () => {
    for (const item of ITENS.filter((i) => i.tipo !== 'consumivel')) {
      for (const nivel of [1, 5, 10, 20]) {
        expect(posseDe(item, nivel, []).tem, `${item.id} no nível ${nivel}`).toBe(temItem(item, nivel, []));
      }
    }
  });
});

describe('o histórico de compras', () => {
  /** Uma aula fechada num dia: o acerto do exercício dela. */
  const aula = (id: string, dia: string): Attempt => ({ ...em(dia), exerciseId: `ex-${id}`, lessonId: id });
  const compra = (item: string, price: number, dia: string, hora = '12:00') => ({
    item,
    price,
    createdAt: new Date(`${dia}T${hora}:00`).toISOString(),
  });
  const aulas = (de: number, ate: number, dia: string) =>
    Array.from({ length: ate - de + 1 }, (_, i) => aula(`l${de + i}`, dia));

  it('cada compra com o saldo que sobrou depois dela, recontado até aquele instante', () => {
    // Nove aulas no dia 1 (90), congelar no dia 2 (sobra 30); cinco aulas no
    // dia 3 (+50), dobro no dia 4 (sobra 0). Dias não seguidos: sem marco.
    const attempts = [...aulas(1, 9, '2026-03-01'), ...aulas(10, 14, '2026-03-03')];
    const purchases = [compra('congelar-sequencia', 60, '2026-03-02'), compra('dobro-de-xp', 80, '2026-03-04')];
    const { linhas, semData } = historicoDeCompras({
      completedLessons: attempts.map((a) => a.lessonId),
      completedProjects: [],
      attempts,
      purchases,
      desafiosCumpridos: [],
      hoje,
    });

    expect(semData).toBe(0);
    // A mais recente primeiro.
    expect(linhas.map((l) => [l.compra.item, l.saldoDepois])).toEqual([
      ['dobro-de-xp', 0],
      ['congelar-sequencia', 30],
    ]);
    expect(linhas[0].item?.title).toMatch(/Dobro de XP/);
  });

  it('aula fechada depois da compra não conta para ela, nem no mesmo dia', () => {
    const attempts = [aula('l1', '2026-03-01'), { ...aula('l2', '2026-03-02'), createdAt: new Date('2026-03-02T15:00:00').toISOString() }];
    const { linhas } = historicoDeCompras({
      completedLessons: ['l1', 'l2'],
      completedProjects: [],
      attempts,
      purchases: [compra('x', 10, '2026-03-02', '12:00')],
      desafiosCumpridos: [],
      hoje,
    });
    expect(linhas[0].saldoDepois).toBe(MOEDAS.porAulaConcluida - 10);
  });

  it('projeto não tem hora: entra em toda linha, e `semData` avisa quanto', () => {
    const { linhas, semData } = historicoDeCompras({
      completedLessons: [],
      completedProjects: ['p1'],
      attempts: [],
      purchases: [compra('x', 10, '2026-03-02')],
      desafiosCumpridos: [],
      hoje,
    });
    expect(semData).toBe(MOEDAS.porProjetoEntregue);
    expect(linhas[0].saldoDepois).toBe(MOEDAS.porProjetoEntregue - 10);
  });

  it('desafios pelo dia em que foram cumpridos; marcos de sequência pelo dia em que a corrente chegou lá', () => {
    // Sete dias seguidos a partir do dia 1: o marco cai no dia 7.
    const attempts = Array.from({ length: 7 }, (_, i) => em(`2026-03-0${i + 1}`));
    const desafiosCumpridos = [{ dia: '2026-03-03', recompensa: { moedas: 15 } }];
    const { linhas } = historicoDeCompras({
      completedLessons: [],
      completedProjects: [],
      attempts,
      purchases: [compra('a', 5, '2026-03-02'), compra('b', 5, '2026-03-05'), compra('c', 5, '2026-03-08')],
      desafiosCumpridos,
      hoje,
    });
    expect(linhas.map((l) => l.saldoDepois)).toEqual([
      15 + MOEDAS.porSemanaSeguida - 15, // dia 8: desafio e marco, três compras
      15 - 10, // dia 5: o desafio, duas compras
      -5, // dia 2: nada ainda — o banco recusaria; aqui a conta só descreve
    ]);
  });

  it('a linha mais recente, depois de tudo, é o saldo de hoje', () => {
    const attempts = [...aulas(1, 12, '2026-03-01')];
    const purchases = [compra('congelar-sequencia', 60, '2026-03-02')];
    const entrada = { completedLessons: attempts.map((a) => a.lessonId), completedProjects: ['p1'], attempts, purchases, hoje };
    const { linhas } = historicoDeCompras({ ...entrada, desafiosCumpridos: [] });
    const ganhas = moedasGanhas({ ...entrada, moedasDeDesafios: 0 });
    expect(linhas[0].saldoDepois).toBe(ganhas.total - moedasGastas(purchases));
  });
});

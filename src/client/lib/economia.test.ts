import { describe, expect, it } from 'vitest';

import type { Attempt } from './mastery';
import { dobroAtivo, ITENS, itemDaLoja, moedasGanhas, moedasGastas, MOEDAS, temItem } from './economia';

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

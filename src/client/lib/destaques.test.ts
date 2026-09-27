import { describe, expect, it } from 'vitest';

import { destaquesDaSemana, DESTAQUES_POR_SEMANA, indiceDaSemana, ORDEM_DA_VITRINE } from './destaques';
import { somarDias } from './sequencia';

const SEGUNDA = '2026-03-02';
const ids = (itens: Array<{ id: string }>) => itens.map((i) => i.id);
const compra = (item: string) => ({ item, price: 1, createdAt: '2026-03-02T10:00:00.000Z' });

describe('os destaques da semana', () => {
  it('são três cosméticos, nunca consumíveis', () => {
    const destaques = destaquesDaSemana(SEGUNDA, 1, []);
    expect(destaques).toHaveLength(DESTAQUES_POR_SEMANA);
    for (const item of destaques) expect(item.tipo).not.toBe('consumivel');
  });

  it('a mesma semana dá os mesmos destaques — não há sorte nisso', () => {
    expect(ids(destaquesDaSemana(SEGUNDA, 1, []))).toEqual(ids(destaquesDaSemana(SEGUNDA, 1, [])));
  });

  it('a semana seguinte troca os três', () => {
    const esta = new Set(ids(destaquesDaSemana(SEGUNDA, 1, [])));
    const proxima = ids(destaquesDaSemana(somarDias(SEGUNDA, 7), 1, []));
    for (const id of proxima) expect(esta.has(id), id).toBe(false);
  });

  it('pula o que a pessoa já tem, pelo nível ou pela compra', () => {
    // No nível 30 tudo que abre por nível já é dela: não sobra vitrine.
    expect(destaquesDaSemana(SEGUNDA, 30, [])).toEqual([]);
    const [primeiro] = destaquesDaSemana(SEGUNDA, 1, []);
    expect(ids(destaquesDaSemana(SEGUNDA, 1, [compra(primeiro.id)]))).not.toContain(primeiro.id);
  });

  it('comprar um destaque troca só aquele: os outros dois ficam', () => {
    const [a, b, c] = ids(destaquesDaSemana(SEGUNDA, 1, []));
    const depois = ids(destaquesDaSemana(SEGUNDA, 1, [compra(b)]));
    expect(depois).toContain(a);
    expect(depois).toContain(c);
    expect(depois).not.toContain(b);
    expect(depois).toHaveLength(3);
  });

  it('todo cosmético passa pela vitrine dentro de um ciclo', () => {
    const semanas = Math.ceil(ORDEM_DA_VITRINE.length / DESTAQUES_POR_SEMANA);
    const vistos = new Set<string>();
    for (let s = 0; s < semanas; s++) for (const id of ids(destaquesDaSemana(somarDias(SEGUNDA, 7 * s), 1, []))) vistos.add(id);
    expect(vistos.size).toBe(ORDEM_DA_VITRINE.length);
  });

  it('a ordem da vitrine alterna as categorias em vez de mostrar três avatares seguidos', () => {
    // Na maioria das semanas, pelo menos dois tipos diferentes.
    const semanas = Math.ceil(ORDEM_DA_VITRINE.length / DESTAQUES_POR_SEMANA);
    let variadas = 0;
    for (let s = 0; s < semanas; s++) {
      const tipos = new Set(destaquesDaSemana(somarDias(SEGUNDA, 7 * s), 1, []).map((i) => i.tipo));
      if (tipos.size >= 2) variadas += 1;
    }
    expect(variadas / semanas).toBeGreaterThanOrEqual(0.7);
  });

  it('conta as semanas pela segunda-feira, e antes da origem também', () => {
    expect(indiceDaSemana('2026-01-05')).toBe(0);
    expect(indiceDaSemana('2026-01-12')).toBe(1);
    expect(indiceDaSemana('2025-12-29')).toBe(-1);
    expect(destaquesDaSemana('2025-12-29', 1, [])).toHaveLength(3);
  });
});

import { describe, expect, it } from 'vitest';

import { destaquesDaSemana, DESTAQUES_POR_SEMANA, indiceDaSemana, ORDEM_DA_VITRINE } from './destaques';
import { aVenda, itemDaLoja } from './economia';
import { somarDias } from './sequencia';

const SEGUNDA = '2026-03-02';
/** Um instante fixo, fora da janela de qualquer sazonal. */
const AGORA = new Date('2026-03-04T12:00:00');
const ids = (itens: Array<{ id: string }>) => itens.map((i) => i.id);
const compra = (item: string) => ({ item, price: 1, createdAt: '2026-03-02T10:00:00.000Z' });

describe('os destaques da semana', () => {
  it('são três cosméticos, nunca consumíveis', () => {
    const destaques = destaquesDaSemana(SEGUNDA, 1, [], AGORA);
    expect(destaques).toHaveLength(DESTAQUES_POR_SEMANA);
    for (const item of destaques) expect(item.tipo).not.toBe('consumivel');
  });

  it('a mesma semana dá os mesmos destaques — não há sorte nisso', () => {
    expect(ids(destaquesDaSemana(SEGUNDA, 1, [], AGORA))).toEqual(ids(destaquesDaSemana(SEGUNDA, 1, [], AGORA)));
  });

  it('a semana seguinte troca os três, em todo o ciclo', () => {
    // Com tudo à venda (o sazonal dentro da janela) e nada comprado, a vitrine
    // anda de três em três. Fora da janela, o sazonal é pulado e o próximo da
    // fila entra no lugar — aí um item pode aparecer duas semanas seguidas, e
    // tudo bem: é o mesmo que acontece quando a pessoa já tem um da vez. Antes
    // o teste olhava uma semana só, fora da janela, e passava ou falhava
    // conforme o catálogo punha o sazonal naquela semana.
    const NA_JANELA = new Date('2026-12-20T12:00:00');
    const semanas = Math.ceil(ORDEM_DA_VITRINE.length / DESTAQUES_POR_SEMANA);
    for (let s = 0; s < semanas; s++) {
      const esta = new Set(ids(destaquesDaSemana(somarDias(SEGUNDA, 7 * s), 1, [], NA_JANELA)));
      const proxima = ids(destaquesDaSemana(somarDias(SEGUNDA, 7 * (s + 1)), 1, [], NA_JANELA));
      for (const id of proxima) expect(esta.has(id), `semana ${s + 1}: ${id}`).toBe(false);
    }
  });

  it('pula o que a pessoa já tem, pelo nível ou pela compra', () => {
    // No nível 30 tudo que abre por nível já é dela: na vitrine, só o que
    // nenhum nível abre (os itens só por moedas).
    const noNivel30 = destaquesDaSemana(SEGUNDA, 30, [], AGORA);
    expect(noNivel30.length).toBeGreaterThan(0);
    for (const item of noNivel30) expect(item.nivelQueLibera, item.id).toBeUndefined();
    const [primeiro] = destaquesDaSemana(SEGUNDA, 1, [], AGORA);
    expect(ids(destaquesDaSemana(SEGUNDA, 1, [compra(primeiro.id)], AGORA))).not.toContain(primeiro.id);
  });

  it('comprar um destaque troca só aquele: os outros dois ficam', () => {
    const [a, b, c] = ids(destaquesDaSemana(SEGUNDA, 1, [], AGORA));
    const depois = ids(destaquesDaSemana(SEGUNDA, 1, [compra(b)], AGORA));
    expect(depois).toContain(a);
    expect(depois).toContain(c);
    expect(depois).not.toContain(b);
    expect(depois).toHaveLength(3);
  });

  it('todo cosmético passa pela vitrine dentro de um ciclo', () => {
    const semanas = Math.ceil(ORDEM_DA_VITRINE.length / DESTAQUES_POR_SEMANA);
    const vistos = new Set<string>();
    for (let s = 0; s < semanas; s++) for (const id of ids(destaquesDaSemana(somarDias(SEGUNDA, 7 * s), 1, [], AGORA))) vistos.add(id);
    // Todos os que estão à venda nesse instante — os sazonais só na janela.
    expect(vistos.size).toBe(ORDEM_DA_VITRINE.filter((i) => aVenda(i, AGORA)).length);
  });

  it('a ordem da vitrine alterna as categorias em vez de mostrar três avatares seguidos', () => {
    // Na maioria das semanas, pelo menos dois tipos diferentes.
    const semanas = Math.ceil(ORDEM_DA_VITRINE.length / DESTAQUES_POR_SEMANA);
    let variadas = 0;
    for (let s = 0; s < semanas; s++) {
      const tipos = new Set(destaquesDaSemana(somarDias(SEGUNDA, 7 * s), 1, [], AGORA).map((i) => i.tipo));
      if (tipos.size >= 2) variadas += 1;
    }
    expect(variadas / semanas).toBeGreaterThanOrEqual(0.7);
  });

  it('conta as semanas pela segunda-feira, e antes da origem também', () => {
    expect(indiceDaSemana('2026-01-05')).toBe(0);
    expect(indiceDaSemana('2026-01-12')).toBe(1);
    expect(indiceDaSemana('2025-12-29')).toBe(-1);
    expect(destaquesDaSemana('2025-12-29', 1, [], AGORA)).toHaveLength(3);
  });
});

describe('os sazonais na vitrine', () => {
  const fogos = itemDaLoja('fundo-fogos')!;

  it('um sazonal só entra na vitrine dentro da janela dele', () => {
    const dentro = new Date('2026-12-20T12:00:00-03:00');
    const semanas = Math.ceil(ORDEM_DA_VITRINE.length / DESTAQUES_POR_SEMANA);
    const vistos = (agora: Date) => {
      const ids = new Set<string>();
      for (let s = 0; s < semanas; s++) {
        for (const item of destaquesDaSemana(somarDias('2026-12-14', 7 * s), 1, [], agora)) ids.add(item.id);
      }
      return ids;
    };
    expect(vistos(dentro).has(fogos.id)).toBe(true);
    expect(vistos(AGORA).has(fogos.id)).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import { ITENS } from './economia';
import { estagioDaPlanta, ICONE_DA_SEQUENCIA_PADRAO, ICONES_DA_SEQUENCIA, iconeDaSequencia } from './icones-da-sequencia';

describe('o catálogo de ícones da sequência', () => {
  it('a chama é de todo mundo, e é o que aparece sem nada equipado', () => {
    expect(ICONE_DA_SEQUENCIA_PADRAO.id).toBe('chama');
    expect(ICONE_DA_SEQUENCIA_PADRAO.item).toBeUndefined();
    expect(iconeDaSequencia(null)).toBe(ICONE_DA_SEQUENCIA_PADRAO);
    expect(iconeDaSequencia('que-nao-existe')).toBe(ICONE_DA_SEQUENCIA_PADRAO);
  });

  it('não há raio: ele já é o "2× XP" do cabeçalho', () => {
    expect(ICONES_DA_SEQUENCIA.map((i) => i.id)).not.toContain('raio');
  });

  it('cada ícone vendido está na loja, com o id que o perfil guarda — e vice-versa', () => {
    for (const icone of ICONES_DA_SEQUENCIA.filter((i) => i.item)) {
      const item = ITENS.find((i) => i.id === icone.item);
      expect(item, icone.id).toBeDefined();
      expect(item!.tipo).toBe('sequencia');
      expect(icone.item).toBe(`sequencia-${icone.id}`);
    }
    for (const item of ITENS.filter((i) => i.tipo === 'sequencia')) {
      expect(ICONES_DA_SEQUENCIA.some((i) => i.item === item.id), item.id).toBe(true);
    }
  });

  it('ids no formato que o banco aceita', () => {
    for (const i of ICONES_DA_SEQUENCIA) expect(i.id).toMatch(/^[a-z0-9][a-z0-9-]{0,39}$/);
  });
});

describe('a planta cresce com a sequência', () => {
  it('broto, muda aos 7 dias e árvore aos 30 — os marcos que rendem moedas', () => {
    expect(estagioDaPlanta(0)).toBe('broto');
    expect(estagioDaPlanta(6)).toBe('broto');
    expect(estagioDaPlanta(7)).toBe('muda');
    expect(estagioDaPlanta(29)).toBe('muda');
    expect(estagioDaPlanta(30)).toBe('arvore');
    expect(estagioDaPlanta(365)).toBe('arvore');
  });
});

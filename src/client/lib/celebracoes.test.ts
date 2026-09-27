import { describe, expect, it } from 'vitest';

import { CELEBRACAO_PADRAO, CELEBRACOES, celebracao } from './celebracoes';
import { ITENS } from './economia';

describe('o catálogo de celebrações', () => {
  it('o confete é de todo mundo, e é o que toca sem nada equipado', () => {
    expect(CELEBRACAO_PADRAO.id).toBe('confete');
    expect(CELEBRACAO_PADRAO.item).toBeUndefined();
    expect(celebracao(null)).toBe(CELEBRACAO_PADRAO);
    expect(celebracao('que-nao-existe')).toBe(CELEBRACAO_PADRAO);
  });

  it('cada celebração vendida está na loja, com o id que o perfil guarda — e vice-versa', () => {
    for (const c of CELEBRACOES.filter((c) => c.item)) {
      const item = ITENS.find((i) => i.id === c.item);
      expect(item, c.id).toBeDefined();
      expect(item!.tipo).toBe('celebracao');
      expect(c.item).toBe(`celebracao-${c.id}`);
    }
    for (const item of ITENS.filter((i) => i.tipo === 'celebracao')) {
      expect(CELEBRACOES.some((c) => c.item === item.id), item.id).toBe(true);
    }
  });

  it('ids no formato que o banco aceita', () => {
    for (const c of CELEBRACOES) expect(c.id).toMatch(/^[a-z0-9][a-z0-9-]{0,39}$/);
  });
});

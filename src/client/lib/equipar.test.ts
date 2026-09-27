import { describe, expect, it } from 'vitest';

import { ITENS, itemDaLoja } from './economia';
import { mudancaDeEquipar } from './equipar';

describe('o que equipar muda no perfil', () => {
  it('cada categoria grava no seu campo, com o id curto', () => {
    expect(mudancaDeEquipar(itemDaLoja('avatar-raposa')!)).toEqual({ avatar: 'preset:raposa' });
    expect(mudancaDeEquipar(itemDaLoja('moldura-neon')!)).toEqual({ moldura: 'neon' });
    expect(mudancaDeEquipar(itemDaLoja('fundo-por-do-sol')!)).toEqual({ fundo: 'por-do-sol' });
    expect(mudancaDeEquipar(itemDaLoja('tema-meia-noite')!)).toEqual({ accent: 'meia-noite' });
    expect(mudancaDeEquipar(itemDaLoja('editor-noturno')!)).toEqual({ temaEditor: 'noturno' });
  });

  it('o adesivo entra no fim da fileira — e, cheia ou com ele já lá, fica para o inventário', () => {
    const pato = itemDaLoja('adesivo-pato')!;
    expect(mudancaDeEquipar(pato)).toEqual({ adesivos: ['pato'] });
    expect(mudancaDeEquipar(pato, { adesivos: ['bug'] })).toEqual({ adesivos: ['bug', 'pato'] });
    expect(mudancaDeEquipar(pato, { adesivos: ['pato'] })).toBeNull();
    expect(mudancaDeEquipar(pato, { adesivos: ['bug', 'cafe', 'terminal'] })).toBeNull();
  });

  it('consumível não se equipa', () => {
    expect(mudancaDeEquipar(itemDaLoja('congelar-sequencia')!)).toBeNull();
    expect(mudancaDeEquipar(itemDaLoja('dobro-de-xp')!)).toBeNull();
  });

  it('todo cosmético da loja tem para onde ir — nenhum item comprado fica sem uso', () => {
    for (const item of ITENS.filter((i) => i.tipo !== 'consumivel')) {
      expect(mudancaDeEquipar(item), item.id).not.toBeNull();
    }
  });
});

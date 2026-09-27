import { describe, expect, it } from 'vitest';

import { AA_TEXTO_NORMAL, contrastOfHex } from './contrast';
import { ITENS } from './economia';
import { TEMA_DO_EDITOR_PADRAO, TEMAS_DO_EDITOR, temaDoEditor } from './temas-do-editor';

/**
 * Um tema de editor é antes de tudo leitura: quem está aprendendo precisa
 * enxergar o comentário e a string tão bem quanto a palavra-chave. Cada cor de
 * token contra o fundo, em AA (4,5:1) — e o alto contraste em AAA (7:1).
 */
describe.each(TEMAS_DO_EDITOR.map((t) => [t.title, t] as const))('o tema %s', (_nome, tema) => {
  const cores = { texto: tema.texto, ...tema.cores };

  it.each(Object.entries(cores))('%s tem contraste contra o fundo', (_papel, cor) => {
    const minimo = tema.id === 'alto-contraste' ? 7 : AA_TEXTO_NORMAL;
    const razao = contrastOfHex(cor, tema.fundo);
    expect(razao, `${cor} sobre ${tema.fundo} = ${razao.toFixed(2)}:1`).toBeGreaterThanOrEqual(minimo);
  });

  it('os números de linha são legíveis (3:1 — são referência, não texto corrido)', () => {
    expect(contrastOfHex(tema.numeros, tema.fundo)).toBeGreaterThanOrEqual(3);
  });

  it('as cores de token são distintas entre si', () => {
    const lista = Object.values(tema.cores).map((c) => c.toLowerCase());
    expect(new Set(lista).size).toBe(lista.length);
  });
});

describe('o catálogo de temas do editor', () => {
  it('o padrão e o alto contraste são de todo mundo: acessibilidade não se vende', () => {
    expect(TEMA_DO_EDITOR_PADRAO.item).toBeUndefined();
    expect(temaDoEditor('alto-contraste').item).toBeUndefined();
  });

  it('cada tema vendido está na loja, com o id que o perfil guarda', () => {
    for (const tema of TEMAS_DO_EDITOR.filter((t) => t.item)) {
      const item = ITENS.find((i) => i.id === tema.item);
      expect(item, tema.id).toBeDefined();
      expect(item!.tipo).toBe('editor');
      expect(tema.item).toBe(`editor-${tema.id}`);
    }
    // E cada item de editor da loja tem a paleta dele.
    for (const item of ITENS.filter((i) => i.tipo === 'editor')) {
      expect(TEMAS_DO_EDITOR.some((t) => t.item === item.id), item.id).toBe(true);
    }
  });

  it('id desconhecido cai no padrão, em vez de deixar o editor sem cor', () => {
    expect(temaDoEditor('que-nao-existe')).toBe(TEMA_DO_EDITOR_PADRAO);
    expect(temaDoEditor(null)).toBe(TEMA_DO_EDITOR_PADRAO);
  });

  it('ids no formato que o banco aceita', () => {
    for (const t of TEMAS_DO_EDITOR) expect(t.id).toMatch(/^[a-z0-9][a-z0-9-]{0,39}$/);
  });
});

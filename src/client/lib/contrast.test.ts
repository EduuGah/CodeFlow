import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  AA_TEXTO_GRANDE,
  AA_TEXTO_NORMAL,
  compose,
  contrastOfHex,
  contrastRatio,
  extractColorTokens,
  parseHex,
  relativeLuminance,
} from './contrast';

/**
 * Contraste da paleta, verificado contra a WCAG AA.
 *
 * Este teste existe por experiência própria: numa migração de cores, um
 * `text-zinc-400` virou `text-ink-faint` numa superfície escura, e o resultado
 * foi texto cinza sobre fundo quase preto. Nada quebrou, nenhum teste falhou, e
 * o typecheck passou. Só reprovaria para quem depende do contraste.
 *
 * Os tokens são lidos do próprio `index.css`: copiar os hexadecimais para cá
 * faria a cópia envelhecer em silêncio, e o teste passaria a validar uma paleta
 * que não é mais a do produto.
 */

const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8');
const cor = extractColorTokens(css);

/** Falha cedo e com nome, em vez de comparar `undefined`. */
function token(nome: string): string {
  const valor = cor[nome];
  if (!valor) throw new Error(`token --color-${nome} não encontrado em index.css`);
  return valor;
}

describe('a matemática do contraste', () => {
  it('preto sobre branco é o máximo de 21', () => {
    expect(contrastOfHex('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('cor igual a si mesma é 1', () => {
    expect(contrastOfHex('#2b8078', '#2b8078')).toBeCloseTo(1, 5);
  });

  it('a ordem dos argumentos não altera o resultado', () => {
    expect(contrastOfHex('#1c2523', '#f7f6f3')).toBeCloseTo(
      contrastOfHex('#f7f6f3', '#1c2523'),
      5
    );
  });

  it('aceita hexadecimal de três dígitos', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('recusa cor inválida em vez de calcular errado', () => {
    expect(() => parseHex('#xyz')).toThrow();
    expect(() => parseHex('teal')).toThrow();
  });

  it('branco tem luminância 1 e preto 0', () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 5);
  });
});

describe('os tokens existem', () => {
  it('index.css declara a paleta esperada', () => {
    for (const nome of [
      'canvas',
      'surface',
      'sunken',
      'line',
      'control',
      'ink',
      'ink-soft',
      'ink-faint',
      'brand-600',
      'energy-700',
      'success-700',
      'danger-700',
    ]) {
      expect(cor[nome], `--color-${nome}`).toBeDefined();
    }
  });
});

/**
 * Pares realmente usados na interface.
 *
 * Cada linha é uma combinação que aparece em tela, não uma varredura de todas
 * as combinações possíveis — reprovar um par que ninguém usa só geraria ruído.
 */
const paresDeTexto: Array<[string, string, string]> = [
  ['texto principal sobre o fundo da aplicação', 'ink', 'canvas'],
  ['texto principal sobre superfície', 'ink', 'surface'],
  ['texto secundário sobre o fundo da aplicação', 'ink-soft', 'canvas'],
  ['texto secundário sobre superfície', 'ink-soft', 'surface'],
  ['texto secundário sobre superfície rebaixada', 'ink-soft', 'sunken'],
  ['marca sobre superfície', 'brand-600', 'surface'],
  ['marca sobre o fundo da aplicação', 'brand-600', 'canvas'],
  ['marca sobre seu próprio tom claro', 'brand-700', 'brand-50'],
  ['sucesso sobre seu tom claro', 'success-700', 'success-50'],
  ['atenção sobre seu tom claro', 'energy-700', 'energy-50'],
  ['erro sobre seu tom claro', 'danger-700', 'danger-50'],
];

describe('texto atende AA (4.5:1)', () => {
  it.each(paresDeTexto)('%s', (_nome, frente, fundo) => {
    const razao = contrastOfHex(token(frente), token(fundo));
    expect(razao, `${frente} sobre ${fundo} = ${razao.toFixed(2)}:1`).toBeGreaterThanOrEqual(
      AA_TEXTO_NORMAL
    );
  });
});

/** Branco sobre superfícies escuras — botões primários, banner, terminal. */
const brancoSobreEscuro: Array<[string, string]> = [
  // A ação primária é a marca, não o preto: era o teal quase não aparecer que
  // fazia a interface ser lida como cinza.
  ['ação primária', 'brand-600'],
  ['ação primária sob o cursor', 'brand-700'],
  ['cabeçalho da trilha', 'ink'],
  ['confirmação', 'success-600'],
  ['terminal', 'terminal'],
  ['editor', 'editor'],
];

describe('branco sobre superfícies escuras atende AA', () => {
  it.each(brancoSobreEscuro)('%s', (_nome, fundo) => {
    const razao = contrastOfHex('#ffffff', token(fundo));
    expect(razao, `branco sobre ${fundo} = ${razao.toFixed(2)}:1`).toBeGreaterThanOrEqual(
      AA_TEXTO_NORMAL
    );
  });
});

/**
 * Branco com opacidade sobre superfície escura.
 *
 * O contraste real é o da cor composta, não o do branco puro — foi assim que o
 * texto do banner da trilha ficou ilegível antes de ser corrigido.
 */
describe('branco translúcido sobre superfície escura', () => {
  const casos: Array<[string, string, number, number]> = [
    ['rótulo do cabeçalho da trilha', 'ink', 0.55, AA_TEXTO_GRANDE],
    ['descrição do cabeçalho da trilha', 'ink', 0.75, AA_TEXTO_NORMAL],
    ['saída do terminal', 'terminal', 0.9, AA_TEXTO_NORMAL],
    ['rótulo do terminal', 'terminal', 0.4, AA_TEXTO_GRANDE],
  ];

  it.each(casos)('%s', (_nome, fundo, alfa, minimo) => {
    const base = parseHex(token(fundo));
    const composta = compose({ r: 255, g: 255, b: 255 }, base, alfa);
    const razao = contrastRatio(composta, base);

    expect(
      razao,
      `branco a ${alfa * 100}% sobre ${fundo} = ${razao.toFixed(2)}:1`
    ).toBeGreaterThanOrEqual(minimo);
  });
});

/**
 * Componentes de interface seguem o mínimo de 3:1.
 *
 * A distinção importa e a primeira versão deste teste errava nela: a WCAG 1.4.11
 * exige 3:1 do contorno que **identifica um controle** — a borda de um campo, o
 * preenchimento de uma barra de progresso. Uma divisória entre itens de lista é
 * decoração, e cobrar 3:1 dela só produziria uma interface listrada.
 *
 * Por isso `--color-control` existe separado de `--color-line`.
 */
describe('componentes de interface atendem 3:1', () => {
  const casos: Array<[string, string, string]> = [
    ['borda de campo sobre superfície', 'control', 'surface'],
    ['borda de campo sobre o fundo da aplicação', 'control', 'canvas'],
    ['preenchimento da barra de progresso', 'ink', 'line'],
    ['barra de progresso da aula', 'brand-500', 'sunken'],
  ];

  it.each(casos)('%s', (_nome, frente, fundo) => {
    const razao = contrastOfHex(token(frente), token(fundo));
    expect(razao, `${frente} sobre ${fundo} = ${razao.toFixed(2)}:1`).toBeGreaterThanOrEqual(
      AA_TEXTO_GRANDE
    );
  });
});

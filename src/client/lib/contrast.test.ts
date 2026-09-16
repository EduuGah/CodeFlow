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
  type VarianteDeTema,
} from './contrast';
import { CORES_DAS_TRILHAS } from './cores-das-trilhas';

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

/**
 * As oito variantes: dois modos vezes quatro cores de destaque. Todo par de
 * texto é conferido em todas — o modo escuro é onde um token de texto claro
 * usado como fundo passa despercebido no claro e quebra no escuro.
 */
const VARIANTES: Array<[string, VarianteDeTema]> = [];
for (const tema of ['claro', 'escuro'] as const) {
  for (const acento of ['floresta', 'oceano', 'brasa', 'ameixa'] as const) {
    VARIANTES.push([`${tema} · ${acento}`, { tema, acento }]);
  }
}

/** Falha cedo e com nome, em vez de comparar `undefined`. */
function token(nome: string, paleta: Record<string, string> = cor): string {
  const valor = paleta[nome];
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
  // O 600 é preenchimento; texto da marca é o 700 — no escuro, o 600 não
  // tem contraste como texto, e foi este teste que o disse.
  ['marca como texto sobre superfície', 'brand-700', 'surface'],
  ['marca como texto sobre o fundo da aplicação', 'brand-700', 'canvas'],
  ['marca sobre seu próprio tom claro', 'brand-700', 'brand-50'],
  ['sucesso sobre seu tom claro', 'success-700', 'success-50'],
  ['atenção sobre seu tom claro', 'energy-700', 'energy-50'],
  ['erro sobre seu tom claro', 'danger-700', 'danger-50'],
];

describe.each(VARIANTES)('texto atende AA (4.5:1) — %s', (_variante, opcoes) => {
  const paleta = extractColorTokens(css, opcoes);
  it.each(paresDeTexto)('%s', (_nome, frente, fundo) => {
    const razao = contrastOfHex(token(frente, paleta), token(fundo, paleta));
    expect(razao, `${frente} sobre ${fundo} = ${razao.toFixed(2)}:1`).toBeGreaterThanOrEqual(
      AA_TEXTO_NORMAL
    );
  });

  it('o preenchimento "tinta" leva o texto da cor do fundo', () => {
    // `bg-ink text-canvas`: no claro é escuro com texto claro; no escuro,
    // claro com texto escuro. Foi o `text-white` fixo que quebrou no escuro.
    const razao = contrastOfHex(token('canvas', paleta), token('ink', paleta));
    expect(razao).toBeGreaterThanOrEqual(AA_TEXTO_NORMAL);
  });
});

/** Branco sobre superfícies escuras — botões primários, confirmação, terminal. */
const brancoSobreEscuro: Array<[string, string]> = [
  // A ação primária é a marca, não o preto: era o teal quase não aparecer que
  // fazia a interface ser lida como cinza.
  ['ação primária', 'brand-600'],
  ['ação primária sob o cursor', 'brand-hover'],
  ['confirmação', 'success-600'],
  ['terminal', 'terminal'],
  ['editor', 'editor'],
];

describe.each(VARIANTES)('branco sobre superfícies escuras atende AA — %s', (_variante, opcoes) => {
  const paleta = extractColorTokens(css, opcoes);
  it.each(brancoSobreEscuro)('%s', (_nome, fundo) => {
    const razao = contrastOfHex('#ffffff', token(fundo, paleta));
    expect(razao, `branco sobre ${fundo} = ${razao.toFixed(2)}:1`).toBeGreaterThanOrEqual(
      AA_TEXTO_NORMAL
    );
  });
});

describe('branco sobre a cor de cada trilha atende AA', () => {
  // A faixa da trilha e o marco do percurso: preenchimento sólido, texto branco.
  it.each(Object.entries(CORES_DAS_TRILHAS))('%s', (_id, fundo) => {
    expect(contrastOfHex('#ffffff', fundo)).toBeGreaterThanOrEqual(AA_TEXTO_NORMAL);
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
    ['rótulo da aula da vez', 'brand-600', 0.75, AA_TEXTO_GRANDE],
    ['trilha da aula da vez', 'brand-600', 0.8, AA_TEXTO_NORMAL],
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
describe.each(VARIANTES)('componentes de interface atendem 3:1 — %s', (_variante, opcoes) => {
  const paleta = extractColorTokens(css, opcoes);
  const casos: Array<[string, string, string]> = [
    ['borda de campo sobre superfície', 'control', 'surface'],
    ['borda de campo sobre o fundo da aplicação', 'control', 'canvas'],
    ['preenchimento da barra de progresso', 'ink', 'line'],
    ['barra de progresso da aula', 'brand-500', 'sunken'],
  ];

  it.each(casos)('%s', (_nome, frente, fundo) => {
    const razao = contrastOfHex(token(frente, paleta), token(fundo, paleta));
    expect(razao, `${frente} sobre ${fundo} = ${razao.toFixed(2)}:1`).toBeGreaterThanOrEqual(
      AA_TEXTO_GRANDE
    );
  });
});

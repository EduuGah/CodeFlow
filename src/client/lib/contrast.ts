/**
 * Contraste segundo a WCAG 2.1.
 *
 * Existe porque contraste é fácil de quebrar sem perceber: uma cor trocada num
 * lugar não gera erro, não quebra teste de comportamento e continua parecendo
 * razoável para quem enxerga bem. Só reprova para quem depende do contraste —
 * exatamente as pessoas que a interface deveria atender.
 *
 * Fórmulas de https://www.w3.org/TR/WCAG21/#dfn-relative-luminance e
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */

/** Mínimos da WCAG nível AA. */
export const AA_TEXTO_NORMAL = 4.5;
/** Texto grande (≥18.66px em negrito ou ≥24px) e componentes de interface. */
export const AA_TEXTO_GRANDE = 3;

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Aceita #rgb e #rrggbb. */
export function parseHex(hex: string): Rgb {
  const limpo = hex.trim().replace(/^#/, '');

  const cheio =
    limpo.length === 3
      ? limpo
          .split('')
          .map((c) => c + c)
          .join('')
      : limpo;

  if (!/^[0-9a-fA-F]{6}$/.test(cheio)) {
    throw new Error(`cor inválida: ${hex}`);
  }

  return {
    r: parseInt(cheio.slice(0, 2), 16),
    g: parseInt(cheio.slice(2, 4), 16),
    b: parseInt(cheio.slice(4, 6), 16),
  };
}

/**
 * Compõe uma cor semitransparente sobre um fundo.
 *
 * Necessário porque parte da interface usa branco com opacidade sobre
 * superfícies escuras — e o contraste real é o da cor resultante, não o do
 * branco puro.
 */
export function compose(frente: Rgb, fundo: Rgb, alfa: number): Rgb {
  const misturar = (f: number, t: number) => Math.round(f * alfa + t * (1 - alfa));
  return {
    r: misturar(frente.r, fundo.r),
    g: misturar(frente.g, fundo.g),
    b: misturar(frente.b, fundo.b),
  };
}

/** Luminância relativa, de 0 (preto) a 1 (branco). */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const canal = (valor: number) => {
    const s = valor / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

/** Razão de contraste entre duas cores, de 1 a 21. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const claro = Math.max(la, lb);
  const escuro = Math.min(la, lb);

  return (claro + 0.05) / (escuro + 0.05);
}

/** Atalho para duas cores em hexadecimal. */
export function contrastOfHex(frente: string, fundo: string): number {
  return contrastRatio(parseHex(frente), parseHex(fundo));
}

/**
 * Extrai os tokens `--color-*` de uma folha de estilo.
 *
 * Lê do CSS em vez de duplicar os valores: uma cópia dos hexadecimais no teste
 * envelheceria em silêncio, e o teste passaria a validar uma paleta que não é
 * mais a do produto.
 */
export interface VarianteDeTema {
  tema?: 'claro' | 'escuro';
  acento?: 'floresta' | 'oceano' | 'brasa' | 'ameixa';
}

/** As declarações `--cf-x: #hex` de um bloco `seletor { … }`. */
function variaveisDoBloco(css: string, seletor: string): Record<string, string> {
  const escapado = seletor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const bloco = new RegExp(`${escapado}\\s*\\{([^}]*)\\}`).exec(css);
  const tokens: Record<string, string> = {};
  if (!bloco) return tokens;
  const regex = /--cf-([\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g;
  let achado: RegExpExecArray | null;
  while ((achado = regex.exec(bloco[1])) !== null) tokens[achado[1]] = achado[2];
  return tokens;
}

/**
 * Os tokens resolvidos para uma variante: os fixos (`--color-x: #hex`), mais
 * as variáveis de `:root` sobrescritas, na mesma ordem do CSS, pelo bloco da
 * cor de destaque, pelo do modo escuro e pelo dos dois juntos.
 */
export function extractColorTokens(css: string, { tema = 'claro', acento = 'floresta' }: VarianteDeTema = {}): Record<string, string> {
  const tokens: Record<string, string> = {};
  const fixos = /--color-([\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g;
  let achado: RegExpExecArray | null;
  while ((achado = fixos.exec(css)) !== null) tokens[achado[1]] = achado[2];

  const camadas = [':root'];
  if (acento !== 'floresta') camadas.push(`:root[data-accent="${acento}"]`);
  if (tema === 'escuro') {
    camadas.push(':root[data-theme="escuro"]');
    if (acento !== 'floresta') camadas.push(`:root[data-theme="escuro"][data-accent="${acento}"]`);
  }
  for (const seletor of camadas) Object.assign(tokens, variaveisDoBloco(css, seletor));

  return tokens;
}

import type { Acento, Tema } from './perfil';

/**
 * Tema e cor de destaque: aplicar, guardar, ouvir o sistema.
 *
 * A preferência mora em dois lugares, de propósito. No `localStorage`, para
 * a página abrir já na cor certa antes de qualquer requisição (o `index.html`
 * lê daqui antes da primeira pintura). No perfil, para o celular e o
 * computador abrirem do mesmo jeito: quando o perfil chega, ele vence o que
 * estava guardado localmente.
 *
 * "Sistema" não é um valor do CSS: é resolvido aqui, para claro ou escuro,
 * e reavaliado quando o sistema muda.
 */

export const CHAVE_DO_TEMA = 'codeflow:tema';
export const CHAVE_DO_ACENTO = 'codeflow:acento';

export const TEMAS: Array<{ id: Tema; title: string; description: string }> = [
  { id: 'sistema', title: 'Como o sistema', description: 'Acompanha a configuração do aparelho.' },
  { id: 'claro', title: 'Claro', description: 'Pedra clara, texto escuro.' },
  { id: 'escuro', title: 'Escuro', description: 'Pedra escura, texto claro. Para a noite.' },
];

export const ACENTOS: Array<{ id: Acento; title: string; description: string; amostra: string; item?: string }> = [
  { id: 'floresta', title: 'Floresta', description: 'O teal profundo, a cor original.', amostra: '#1f6660' },
  { id: 'oceano', title: 'Oceano', description: 'Azul-profundo.', amostra: '#1f5a92', item: 'tema-oceano' },
  { id: 'brasa', title: 'Brasa', description: 'Laranja-queimado.', amostra: '#a1461a', item: 'tema-brasa' },
  { id: 'ameixa', title: 'Ameixa', description: 'Roxo-ameixa.', amostra: '#643876', item: 'tema-ameixa' },
];

export function ehTema(valor: unknown): valor is Tema {
  return valor === 'sistema' || valor === 'claro' || valor === 'escuro';
}

export function ehAcento(valor: unknown): valor is Acento {
  return ACENTOS.some((a) => a.id === valor);
}

function guardado(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function guardar(chave: string, valor: string): void {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // Sem armazenamento (modo privado restrito): o tema vale só nesta página.
  }
}

export function temaGuardado(): Tema {
  const valor = guardado(CHAVE_DO_TEMA);
  return ehTema(valor) ? valor : 'sistema';
}

export function acentoGuardado(): Acento {
  const valor = guardado(CHAVE_DO_ACENTO);
  return ehAcento(valor) ? valor : 'floresta';
}

/** O tema como resolvido para o CSS: claro ou escuro. */
export function resolverTema(tema: Tema): 'claro' | 'escuro' {
  if (tema !== 'sistema') return tema;
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
}

export function aplicarTema(tema: Tema): void {
  document.documentElement.dataset.theme = resolverTema(tema);
  guardar(CHAVE_DO_TEMA, tema);
}

export function aplicarAcento(acento: Acento): void {
  if (acento === 'floresta') delete document.documentElement.dataset.accent;
  else document.documentElement.dataset.accent = acento;
  guardar(CHAVE_DO_ACENTO, acento);
}

/** Reaplica "sistema" quando o sistema muda. Devolve o desligar. */
export function ouvirSistema(aoMudar: () => void): () => void {
  if (typeof matchMedia !== 'function') return () => {};
  const consulta = matchMedia('(prefers-color-scheme: dark)');
  consulta.addEventListener('change', aoMudar);
  return () => consulta.removeEventListener('change', aoMudar);
}

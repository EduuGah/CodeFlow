import { aVenda, ITENS, posseDe, type ItemDaLoja, type Purchase } from './economia';

/**
 * Os destaques da semana: três cosméticos na vitrine, trocados na segunda.
 *
 * Não é sorteio nem promoção. Nenhum destaque custa menos, nenhum some no fim
 * da semana, e não há contagem regressiva — a vitrine só mostra o que talvez
 * passasse despercebido numa loja de trinta itens.
 *
 * O rodízio é determinístico, como o dos desafios: os cosméticos numa ordem
 * fixa (embaralhada pelo id, para as categorias se alternarem) e, a cada
 * semana, a janela seguinte de três. O que a pessoa já tem é pulado — a janela
 * anda até completar três —, então comprar um destaque troca só aquele, e os
 * outros dois ficam. Em algumas semanas todo item passa pela vitrine.
 */

export const DESTAQUES_POR_SEMANA = 3;

/** A segunda-feira em que o rodízio começa a contar. */
const ORIGEM = new Date(2026, 0, 5);

/** FNV-1a de 32 bits: um número estável por texto, para a ordem fixa. */
function fnv1a(texto: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    hash ^= texto.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/** Os cosméticos na ordem da vitrine — a mesma para todo mundo, sempre. */
export const ORDEM_DA_VITRINE: readonly ItemDaLoja[] = ITENS.filter((i) => i.tipo !== 'consumivel').sort(
  (a, b) => fnv1a(a.id) - fnv1a(b.id) || a.id.localeCompare(b.id)
);

/** Semanas desde a origem, pela segunda-feira em `AAAA-MM-DD`. */
export function indiceDaSemana(segunda: string): number {
  const [ano, mes, dia] = segunda.split('-').map(Number);
  const dias = Math.round((new Date(ano, mes - 1, dia).getTime() - ORIGEM.getTime()) / (24 * 60 * 60 * 1000));
  return Math.floor(dias / 7);
}

/**
 * Os destaques da semana de `segunda` para quem tem esse nível e essas
 * compras. Um sazonal só entra dentro da janela dele.
 */
export function destaquesDaSemana(
  segunda: string,
  nivel: number,
  purchases: Purchase[],
  agora: Date = new Date()
): ItemDaLoja[] {
  const n = ORDEM_DA_VITRINE.length;
  if (n === 0) return [];
  const inicio = (((indiceDaSemana(segunda) * DESTAQUES_POR_SEMANA) % n) + n) % n;
  const escolhidos: ItemDaLoja[] = [];
  for (let k = 0; k < n && escolhidos.length < DESTAQUES_POR_SEMANA; k++) {
    const item = ORDEM_DA_VITRINE[(inicio + k) % n];
    if (aVenda(item, agora) && !posseDe(item, nivel, purchases).tem) escolhidos.push(item);
  }
  return escolhidos;
}

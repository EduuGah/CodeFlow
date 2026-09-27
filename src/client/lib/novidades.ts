import type { EstadoDoDesafio } from './desafios';
import { ITENS, type ItemDaLoja, type TipoDeItem } from './economia';
import type { Achievement } from './gamification';

/**
 * Novidades: o que mudou desde a última vez que a pessoa olhou.
 *
 * Conquistas, níveis e desafios são derivados do histórico — não há um
 * evento "conquista aberta" gravado em lugar nenhum. Para avisar a pessoa,
 * compara-se o estado atual com o que ela já viu, guardado neste aparelho.
 * A comparação é pura e testável; guardar e mostrar é de quem chama.
 *
 * Na primeira vez (nada guardado) não há novidade: tudo o que já existia
 * seria "novo", e trinta avisos de uma vez é ruído, não notícia.
 */

export interface EstadoVisto {
  nivel: number;
  /** Ids das conquistas abertas. */
  conquistas: string[];
  /** `${dia}:${id}` dos desafios cumpridos nos períodos atuais. */
  desafios: string[];
  /**
   * Ids do catálogo da loja. Ausente num estado guardado antes deste aviso
   * existir: aí a comparação é com o catálogo de antes da Loja 2.0.
   */
  loja?: string[];
}

/**
 * O catálogo antes da Loja 2.0 — a base para quem já usava o aplicativo
 * quando o aviso da loja chegou: tudo o que entrou depois é novo para ela.
 */
export const CATALOGO_ANTES_DA_LOJA_2: readonly string[] = [
  'congelar-sequencia',
  'dobro-de-xp',
  'tema-oceano',
  'tema-brasa',
  'tema-ameixa',
  ...['cometa', 'raposa', 'coelho', 'urso', 'dino', 'panda', 'robo', 'polvo', 'alien'].map((a) => `avatar-${a}`),
];

export type Novidade =
  | { tipo: 'nivel'; nivel: number; titulo: string }
  | { tipo: 'conquista'; conquista: Achievement }
  | { tipo: 'desafio'; estado: EstadoDoDesafio }
  | { tipo: 'loja'; itens: ItemDaLoja[] };

export function estadoAtual(entrada: {
  nivel: number;
  achievements: Achievement[];
  desafios: { dia: EstadoDoDesafio[]; semana: EstadoDoDesafio[] };
  hoje: string;
  segunda: string;
  /** Os ids do catálogo; sem eles, a loja fica fora da comparação. */
  itensDaLoja?: string[];
}): EstadoVisto {
  return {
    ...(entrada.itensDaLoja ? { loja: entrada.itensDaLoja } : {}),
    nivel: entrada.nivel,
    conquistas: entrada.achievements.filter((c) => c.unlocked).map((c) => c.id),
    desafios: [
      ...entrada.desafios.dia.filter((d) => d.concluido).map((d) => `${entrada.hoje}:${d.desafio.id}`),
      ...entrada.desafios.semana.filter((d) => d.concluido).map((d) => `${entrada.segunda}:${d.desafio.id}`),
    ],
  };
}

/**
 * O que apareceu entre `visto` e `atual`, na ordem em que vale contar: o
 * nível (a maior notícia), depois as conquistas, depois os desafios, e por
 * fim o que chegou à loja — um aviso só, com todos os itens.
 */
export function novidades(
  visto: EstadoVisto | null,
  atual: EstadoVisto,
  contexto: { achievements: Achievement[]; desafios: EstadoDoDesafio[]; tituloDoNivel: string }
): Novidade[] {
  if (!visto) return [];
  const lista: Novidade[] = [];

  if (atual.nivel > visto.nivel) {
    lista.push({ tipo: 'nivel', nivel: atual.nivel, titulo: contexto.tituloDoNivel });
  }

  const conquistasVistas = new Set(visto.conquistas);
  for (const id of atual.conquistas) {
    if (conquistasVistas.has(id)) continue;
    const conquista = contexto.achievements.find((c) => c.id === id);
    if (conquista) lista.push({ tipo: 'conquista', conquista });
  }

  const desafiosVistos = new Set(visto.desafios);
  for (const chave of atual.desafios) {
    if (desafiosVistos.has(chave)) continue;
    const id = chave.slice(chave.indexOf(':') + 1);
    const estado = contexto.desafios.find((d) => d.desafio.id === id);
    if (estado) lista.push({ tipo: 'desafio', estado });
  }

  if (atual.loja) {
    const vistos = new Set(visto.loja ?? CATALOGO_ANTES_DA_LOJA_2);
    const itens = atual.loja
      .filter((id) => !vistos.has(id))
      .map((id) => ITENS.find((i) => i.id === id))
      .filter((i): i is ItemDaLoja => i !== undefined);
    if (itens.length > 0) lista.push({ tipo: 'loja', itens });
  }

  return lista;
}

const NOMES: Record<TipoDeItem, [string, string]> = {
  avatar: ['avatar', 'avatares'],
  moldura: ['moldura', 'molduras'],
  fundo: ['fundo', 'fundos'],
  tema: ['cor', 'cores'],
  editor: ['tema do editor', 'temas do editor'],
  celebracao: ['celebração', 'celebrações'],
  sequencia: ['ícone da sequência', 'ícones da sequência'],
  adesivo: ['adesivo', 'adesivos'],
  consumivel: ['item para usar', 'itens para usar'],
};

/** "4 avatares, 2 molduras e 1 fundo" — os itens novos por tipo, na ordem da loja. */
export function resumoDosItens(itens: ItemDaLoja[]): string {
  const ordem: TipoDeItem[] = ['avatar', 'moldura', 'fundo', 'tema', 'editor', 'celebracao', 'sequencia', 'adesivo', 'consumivel'];
  const partes = ordem
    .map((tipo) => [tipo, itens.filter((i) => i.tipo === tipo).length] as const)
    .filter(([, n]) => n > 0)
    .map(([tipo, n]) => `${n} ${NOMES[tipo][n === 1 ? 0 : 1]}`);
  return partes.length <= 1 ? (partes[0] ?? '') : `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`;
}

const PREFIXO = 'codeflow:visto:';

export function lerVisto(userId: string): EstadoVisto | null {
  try {
    const bruto = localStorage.getItem(PREFIXO + userId);
    if (!bruto) return null;
    const dado = JSON.parse(bruto) as Partial<EstadoVisto>;
    return {
      nivel: typeof dado.nivel === 'number' ? dado.nivel : 1,
      conquistas: Array.isArray(dado.conquistas) ? dado.conquistas : [],
      desafios: Array.isArray(dado.desafios) ? dado.desafios : [],
      ...(Array.isArray(dado.loja) ? { loja: dado.loja } : {}),
    };
  } catch {
    return null;
  }
}

export function guardarVisto(userId: string, estado: EstadoVisto): void {
  try {
    localStorage.setItem(PREFIXO + userId, JSON.stringify(estado));
  } catch {
    // Sem armazenamento: a pessoa vê a novidade de novo na próxima vez. Melhor
    // que não ver.
  }
}

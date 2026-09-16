import type { Attempt } from './mastery';
import { correntesDaHistoria } from './sequencia';

/**
 * Moedas e a loja.
 *
 * A regra da plataforma continua valendo: **nenhum saldo é guardado**. As
 * moedas ganhas são uma leitura do histórico — aulas, projetos, desafios,
 * marcos de sequência —, e as gastas são a lista de compras, que é append-only.
 * O saldo é a diferença. Não há como o número desandar do que aconteceu.
 *
 * O que a loja vende foi escolhido para não competir com aprender: o
 * congelamento protege quem estudou de perder a sequência num dia ruim, o
 * dobro de XP acelera o nível de quem vai estudar de qualquer jeito, e os
 * temas e avatares são só aparência. Nada compra resposta, dica nem avanço.
 */

export interface Purchase {
  item: string;
  price: number;
  /** ISO 8601. */
  createdAt: string;
}

export type TipoDeItem = 'consumivel' | 'tema' | 'avatar';

export interface ItemDaLoja {
  id: string;
  title: string;
  description: string;
  price: number;
  tipo: TipoDeItem;
  /** Nível a partir do qual o item é liberado de graça. Só cosméticos. */
  nivelQueLibera?: number;
}

export const MOEDAS = {
  porAulaConcluida: 10,
  porProjetoEntregue: 40,
  porDesafioDiario: 15,
  porDesafioSemanal: 50,
  /** Uma corrente que chega a 7 dias, uma vez por corrente. */
  porSemanaSeguida: 30,
  /** Uma corrente que chega a 30 dias. */
  porMesSeguido: 100,
} as const;

/** Duração do dobro de XP, em horas, a partir da compra. */
export const HORAS_DE_DOBRO = 24;

export const ITENS: ItemDaLoja[] = [
  {
    id: 'congelar-sequencia',
    title: 'Congelar a sequência',
    description:
      'Um dia sem estudar não zera a sua sequência. É usado sozinho no primeiro dia perdido depois da compra — um por dia.',
    price: 60,
    tipo: 'consumivel',
  },
  {
    id: 'dobro-de-xp',
    title: 'Dobro de XP por 24 horas',
    description:
      'Exercícios, aulas, revisões e desafios rendem o dobro de XP nas 24 horas depois da compra. Começa na hora.',
    price: 80,
    tipo: 'consumivel',
  },
  {
    id: 'tema-oceano',
    title: 'Tema Oceano',
    description: 'A cor de destaque em azul-profundo.',
    price: 120,
    tipo: 'tema',
    nivelQueLibera: 3,
  },
  {
    id: 'tema-brasa',
    title: 'Tema Brasa',
    description: 'A cor de destaque em laranja-queimado.',
    price: 150,
    tipo: 'tema',
    nivelQueLibera: 5,
  },
  {
    id: 'tema-ameixa',
    title: 'Tema Ameixa',
    description: 'A cor de destaque em roxo-ameixa.',
    price: 200,
    tipo: 'tema',
    nivelQueLibera: 8,
  },
  {
    id: 'avatar-cometa',
    title: 'Avatar Cometa',
    description: 'Um dos avatares que só o nível ou as moedas abrem.',
    price: 90,
    tipo: 'avatar',
    nivelQueLibera: 4,
  },
  {
    id: 'avatar-raposa',
    title: 'Avatar Raposa',
    description: 'Um dos avatares que só o nível ou as moedas abrem.',
    price: 90,
    tipo: 'avatar',
    nivelQueLibera: 6,
  },
  {
    id: 'avatar-robo',
    title: 'Avatar Robô',
    description: 'Um dos avatares que só o nível ou as moedas abrem.',
    price: 120,
    tipo: 'avatar',
    nivelQueLibera: 10,
  },
];

export function itemDaLoja(id: string): ItemDaLoja | undefined {
  return ITENS.find((i) => i.id === id);
}

export interface FontesDeMoedas {
  aulas: number;
  projetos: number;
  desafios: number;
  sequencia: number;
  total: number;
}

/**
 * As moedas que o histórico rendeu, por fonte.
 *
 * Os desafios chegam já contados (`desafios.ts` sabe quais foram cumpridos e
 * quando); os marcos de sequência saem das correntes da história, uma vez por
 * corrente.
 */
export function moedasGanhas(entrada: {
  completedLessons: string[];
  completedProjects: string[];
  attempts: Attempt[];
  purchases: Purchase[];
  moedasDeDesafios: number;
  hoje?: Date;
}): FontesDeMoedas {
  const aulas = entrada.completedLessons.length * MOEDAS.porAulaConcluida;
  const projetos = entrada.completedProjects.length * MOEDAS.porProjetoEntregue;

  const congelamentos = entrada.purchases.filter((p) => p.item === 'congelar-sequencia');
  const correntes = correntesDaHistoria(entrada.attempts, congelamentos, entrada.hoje);
  const sequencia = correntes.reduce(
    (soma, dias) =>
      soma + (dias >= 7 ? MOEDAS.porSemanaSeguida : 0) + (dias >= 30 ? MOEDAS.porMesSeguido : 0),
    0
  );

  const desafios = entrada.moedasDeDesafios;
  return { aulas, projetos, desafios, sequencia, total: aulas + projetos + desafios + sequencia };
}

export function moedasGastas(purchases: Purchase[]): number {
  return purchases.reduce((soma, p) => soma + p.price, 0);
}

/** As janelas de dobro de XP: [início, fim) de cada compra. */
export function janelasDeDobro(purchases: Purchase[]): Array<{ inicio: number; fim: number }> {
  return purchases
    .filter((p) => p.item === 'dobro-de-xp')
    .map((p) => {
      const inicio = new Date(p.createdAt).getTime();
      return { inicio, fim: inicio + HORAS_DE_DOBRO * 60 * 60 * 1000 };
    });
}

/** Verdadeiro quando o instante cai dentro de uma janela de dobro. */
export function emDobro(isoOuMs: string | number, janelas: Array<{ inicio: number; fim: number }>): boolean {
  const t = typeof isoOuMs === 'number' ? isoOuMs : new Date(isoOuMs).getTime();
  return janelas.some((j) => t >= j.inicio && t < j.fim);
}

/** O dobro que está valendo agora, e até quando. */
export function dobroAtivo(purchases: Purchase[], agora: Date = new Date()): { ate: Date } | null {
  const janela = janelasDeDobro(purchases).find((j) => agora.getTime() >= j.inicio && agora.getTime() < j.fim);
  return janela ? { ate: new Date(janela.fim) } : null;
}

/**
 * Um cosmético está disponível pelo nível ou por compra. Os consumíveis nunca
 * "pertencem": cada compra é um uso.
 */
export function temItem(item: ItemDaLoja, nivel: number, purchases: Purchase[]): boolean {
  if (item.tipo === 'consumivel') return false;
  if (item.nivelQueLibera !== undefined && nivel >= item.nivelQueLibera) return true;
  return purchases.some((p) => p.item === item.id);
}

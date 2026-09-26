import type { Attempt } from './mastery';
import { correntesComInicio, correntesDaHistoria, diaLocal, somarDias } from './sequencia';
import { fechamentoDasAulas } from './study';

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

/**
 * A categoria do item — o que ele é e onde aparece. Consumível se gasta;
 * o resto é aparência, comprada uma vez. Novas categorias (moldura, fundo,
 * título) entram aqui e na checagem de `store_items` (0009) juntas.
 */
export type TipoDeItem = 'consumivel' | 'tema' | 'avatar';

/**
 * Quão longe na jornada o item mora. Por ora acompanha o nível que o libera
 * (`economia.test.ts` confere): até o 5 é comum, do 6 ao 9 incomum, do 10 em
 * diante raro. Épico e lendário existem para os itens de conquista, que ainda
 * não chegaram. A raridade não mora no banco: nenhuma regra do servidor a lê.
 */
export type Raridade = 'comum' | 'incomum' | 'raro' | 'epico' | 'lendario';

export const RARIDADES: Record<Raridade, { rotulo: string; ordem: number }> = {
  comum: { rotulo: 'Comum', ordem: 0 },
  incomum: { rotulo: 'Incomum', ordem: 1 },
  raro: { rotulo: 'Raro', ordem: 2 },
  epico: { rotulo: 'Épico', ordem: 3 },
  lendario: { rotulo: 'Lendário', ordem: 4 },
};

export interface ItemDaLoja {
  id: string;
  title: string;
  description: string;
  price: number;
  tipo: TipoDeItem;
  raridade: Raridade;
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
    raridade: 'comum',
  },
  {
    id: 'dobro-de-xp',
    title: 'Dobro de XP por 24 horas',
    description:
      'Exercícios, aulas, revisões e desafios rendem o dobro de XP nas 24 horas depois da compra. Começa na hora.',
    price: 80,
    tipo: 'consumivel',
    raridade: 'comum',
  },
  {
    id: 'tema-oceano',
    title: 'Tema Oceano',
    description: 'A cor de destaque em azul-profundo.',
    price: 120,
    tipo: 'tema',
    raridade: 'comum',
    nivelQueLibera: 3,
  },
  {
    id: 'tema-brasa',
    title: 'Tema Brasa',
    description: 'A cor de destaque em laranja-queimado.',
    price: 150,
    tipo: 'tema',
    raridade: 'comum',
    nivelQueLibera: 5,
  },
  {
    id: 'tema-ameixa',
    title: 'Tema Ameixa',
    description: 'A cor de destaque em roxo-ameixa.',
    price: 200,
    tipo: 'tema',
    raridade: 'incomum',
    nivelQueLibera: 8,
  },
  // Os avatares que não vêm de graça, do mais barato ao mais raro. O nível
  // que abre cada um sobe junto com o preço: quem estuda chega neles de
  // qualquer jeito; as moedas só encurtam a espera.
  ...(
    [
      ['cometa', 'Cometa', 'Uma bola de luz com o rastro.', 90, 4, 'comum'],
      ['raposa', 'Raposa', 'Laranja, orelhas em pé, focinho branco.', 90, 5, 'comum'],
      ['coelho', 'Coelho', 'Orelhas compridas e dois dentinhos.', 90, 5, 'comum'],
      ['urso', 'Urso', 'Marrom, redondo, focinho claro.', 100, 6, 'incomum'],
      ['dino', 'Dino', 'Verde-água com a crista amarela.', 100, 7, 'incomum'],
      ['panda', 'Panda', 'Branco e preto, manchas nos olhos.', 110, 8, 'incomum'],
      ['robo', 'Robô', 'Cabeça de aço, olhos de led e antena.', 120, 10, 'raro'],
      ['polvo', 'Polvo', 'Roxo, com os tentáculos embaixo.', 130, 12, 'raro'],
      ['alien', 'Alien', 'Verde, olhos grandes e uma antena.', 150, 15, 'raro'],
    ] as const
  ).map(([id, title, description, price, nivelQueLibera, raridade]) => ({
    id: `avatar-${id}`,
    title: `Avatar ${title}`,
    description,
    price,
    tipo: 'avatar' as const,
    raridade,
    nivelQueLibera,
  })),
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

/** Uma compra, com o saldo que sobrou depois dela. */
export interface LinhaDoHistorico {
  compra: Purchase;
  item: ItemDaLoja | undefined;
  saldoDepois: number;
}

/**
 * O histórico de compras, da mais recente para a mais antiga, com o saldo
 * depois de cada uma.
 *
 * Não há saldo guardado: ele é recontado até o instante da compra. As aulas
 * entram pelo fechamento (`fechamentoDasAulas`), os desafios pelo dia em que
 * foram cumpridos, os marcos de sequência pelo dia em que a corrente os
 * alcançou. Projetos — e aulas concluídas sem tentativa registrada — não têm
 * hora: entram como já ganhos em toda linha, e `semData` diz quantas moedas
 * são assim, para a tela avisar.
 */
export function historicoDeCompras(entrada: {
  completedLessons: string[];
  completedProjects: string[];
  attempts: Attempt[];
  purchases: Purchase[];
  desafiosCumpridos: Array<{ dia: string; recompensa: { moedas: number } }>;
  hoje?: Date;
}): { linhas: LinhaDoHistorico[]; semData: number } {
  const fechamentos = fechamentoDasAulas(entrada.attempts);
  // Em milissegundos: a hora que vem do banco e a do navegador podem ter
  // formatos diferentes (`+00:00`, `Z`), e texto não compara instantes.
  const aulasDatadas: number[] = [];
  let semData = entrada.completedProjects.length * MOEDAS.porProjetoEntregue;
  for (const aula of entrada.completedLessons) {
    const quando = fechamentos.get(aula);
    if (quando) aulasDatadas.push(Date.parse(quando));
    else semData += MOEDAS.porAulaConcluida;
  }

  const congelamentos = entrada.purchases.filter((p) => p.item === 'congelar-sequencia');
  const marcos: Array<{ dia: string; moedas: number }> = [];
  for (const { inicio, dias } of correntesComInicio(entrada.attempts, congelamentos, entrada.hoje)) {
    if (dias >= 7) marcos.push({ dia: somarDias(inicio, 6), moedas: MOEDAS.porSemanaSeguida });
    if (dias >= 30) marcos.push({ dia: somarDias(inicio, 29), moedas: MOEDAS.porMesSeguido });
  }

  const ordenadas = [...entrada.purchases].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  let gastas = 0;
  const linhas = ordenadas.map((compra) => {
    gastas += compra.price;
    const instante = Date.parse(compra.createdAt);
    const dia = diaLocal(new Date(instante));
    const ganhas =
      semData +
      aulasDatadas.filter((quando) => quando <= instante).length * MOEDAS.porAulaConcluida +
      entrada.desafiosCumpridos.filter((d) => d.dia <= dia).reduce((s, d) => s + d.recompensa.moedas, 0) +
      marcos.filter((m) => m.dia <= dia).reduce((s, m) => s + m.moedas, 0);
    return { compra, item: itemDaLoja(compra.item), saldoDepois: ganhas - gastas };
  });

  return { linhas: linhas.reverse(), semData };
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

/**
 * De onde vem um cosmético que a pessoa tem — ou o que falta para ter.
 *
 * `item` ausente é o que nunca esteve à venda (os avatares e a cor de
 * graça): é de todo mundo. A compra vence o nível na origem, porque foi uma
 * escolha da pessoa; um item que abriu pelos dois diz "comprado".
 */
export type Posse =
  | { tem: true; origem: 'livre' | 'nivel' | 'compra' }
  | { tem: false; nivel?: number; preco: number };

export function posseDe(item: ItemDaLoja | undefined, nivel: number, purchases: Purchase[]): Posse {
  if (!item) return { tem: true, origem: 'livre' };
  if (purchases.some((p) => p.item === item.id)) return { tem: true, origem: 'compra' };
  if (item.nivelQueLibera !== undefined && nivel >= item.nivelQueLibera) return { tem: true, origem: 'nivel' };
  return { tem: false, nivel: item.nivelQueLibera, preco: item.price };
}

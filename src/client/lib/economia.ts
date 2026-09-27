import type { Attempt } from './mastery';
import { correntesComInicio, correntesDaHistoria, diaLocal, protecoesDaSequencia, somarDias } from './sequencia';
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
 * o resto é aparência, comprada uma vez. Categoria nova entra aqui e na
 * checagem de `store_items` juntas (a 0011 trouxe moldura e fundo).
 */
export type TipoDeItem = 'consumivel' | 'tema' | 'avatar' | 'moldura' | 'fundo';

/**
 * Quão longe na jornada o item mora — sai do nível que o abre
 * (`raridadeDoNivel`): até o 5 comum, do 6 ao 9 incomum, do 10 ao 14 raro, do
 * 15 em diante épico. Lendário não se vende; os itens de conquista
 * (`exclusivos.ts`) dizem "De conquista" no lugar da raridade, porque o que os
 * marca é a origem. A raridade não mora no banco: nenhuma regra do servidor a lê.
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
  /**
   * Janela de venda, em ISO (UTC), para os sazonais — a mesma de
   * `store_items.disponivel_de`/`disponivel_ate`, que o banco confere na
   * compra. Fora dela o item não se vende; quem comprou continua com ele.
   */
  disponivelDe?: string;
  disponivelAte?: string;
}

/** Se o item está à venda agora: dentro da janela, quando ele tem uma. */
export function aVenda(item: ItemDaLoja, agora: Date = new Date()): boolean {
  const t = agora.getTime();
  if (item.disponivelDe && t < Date.parse(item.disponivelDe)) return false;
  if (item.disponivelAte && t >= Date.parse(item.disponivelAte)) return false;
  return true;
}

/**
 * O que a loja e o inventário mostram: o que está à venda, e o que já é da
 * pessoa mesmo fora da janela. Um sazonal que passou não aparece para quem
 * não o tem — nem como "volta ano que vem", que seria a promessa de um
 * sistema de eventos que não existe.
 */
export function visivel(item: ItemDaLoja, nivel: number, purchases: Purchase[], agora: Date = new Date()): boolean {
  return aVenda(item, agora) || posseDe(item, nivel, purchases).tem;
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

/**
 * O preço de um cosmético, pelo nível que o abre.
 *
 * Calibrado pelo aluno-modelo (`economia.calibragem.test.ts`: cinco aulas por
 * semana, de primeira e sem dica, rodando as contas de verdade sobre o
 * catálogo de verdade). Duas regras, que o teste cobra:
 *
 * - **nunca abre pelo nível antes de caber no saldo** — senão comprar é
 *   jogar moeda fora (era o caso do Tema Oceano: 120 moedas, aberto no nível
 *   3, no segundo dia);
 * - **do nível 6 em diante, comprar encurta a espera de verdade**: cabe entre
 *   um quarto e dois terços do caminho até o nível.
 *
 * Os níveis 3 a 5 chegam nos primeiros dias, então os itens deles custam
 * pouco — a primeira compra, e não uma poupança. Os últimos custam semanas: é
 * para onde as moedas vão depois do começo.
 */
export const PRECO_DO_NIVEL: Readonly<Record<number, number>> = {
  3: 10,
  4: 60,
  5: 90,
  6: 130,
  7: 160,
  8: 300,
  9: 350,
  10: 420,
  11: 600,
  12: 680,
  13: 800,
  14: 950,
  15: 1100,
  16: 1250,
  17: 1400,
};

/** Quão longe na jornada o item mora, pelo nível que o abre. */
export function raridadeDoNivel(nivel: number): Raridade {
  if (nivel <= 5) return 'comum';
  if (nivel <= 9) return 'incomum';
  if (nivel <= 14) return 'raro';
  return 'epico';
}

function cosmetico(id: string, tipo: TipoDeItem, title: string, description: string, nivel: number): ItemDaLoja {
  const price = PRECO_DO_NIVEL[nivel];
  if (price === undefined) throw new Error(`sem preço para o nível ${nivel} (${id})`);
  return { id, title, description, price, tipo, raridade: raridadeDoNivel(nivel), nivelQueLibera: nivel };
}

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
    id: 'recuperar-sequencia',
    title: 'Recuperar a sequência',
    description:
      'Para quem esqueceu de congelar: cobre um dia perdido, se a compra for no dia seguinte (ou no outro, tendo estudado no meio). Uma por semana.',
    price: 90,
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
  // Os cosméticos: só o nível que abre cada um. Preço e raridade saem dele
  // (`PRECO_DO_NIVEL`, `raridadeDoNivel`) — quem estuda chega neles de
  // qualquer jeito; as moedas encurtam a espera.
  ...(
    [
      ['tema-oceano', 'Tema Oceano', 'A cor de destaque em azul-profundo.', 3],
      ['tema-grafite', 'Tema Grafite', 'A cor de destaque em cinza-azulado, sóbria como um editor à noite.', 4],
      ['tema-brasa', 'Tema Brasa', 'A cor de destaque em laranja-queimado.', 5],
      ['tema-meia-noite', 'Tema Meia-noite', 'A cor de destaque em índigo profundo.', 7],
      ['tema-ameixa', 'Tema Ameixa', 'A cor de destaque em roxo-ameixa.', 8],
      ['tema-crepusculo', 'Tema Crepúsculo', 'A cor de destaque em rosa de fim de tarde.', 10],
    ] as const
  ).map(([id, title, description, nivel]) => cosmetico(id, 'tema', title, description, nivel)),
  ...(
    [
      ['cometa', 'Cometa', 'Uma bola de luz com o rastro.', 4],
      ['raposa', 'Raposa', 'Laranja, orelhas em pé, focinho branco.', 5],
      ['coelho', 'Coelho', 'Orelhas compridas e dois dentinhos.', 5],
      ['urso', 'Urso', 'Marrom, redondo, focinho claro.', 6],
      ['dino', 'Dino', 'Verde-água com a crista amarela.', 7],
      ['panda', 'Panda', 'Branco e preto, manchas nos olhos.', 8],
      // A fauna daqui (0014): nomes e desenhos próprios, no mesmo traço.
      ['capivara', 'Capivara', 'Marrom, calma, focinho largo.', 9],
      ['robo', 'Robô', 'Cabeça de aço, olhos de led e antena.', 10],
      ['tucano', 'Tucano', 'Preto, papo branco e o bico laranja enorme.', 11],
      ['polvo', 'Polvo', 'Roxo, com os tentáculos embaixo.', 12],
      ['tartaruga', 'Tartaruga', 'Cabeça verde e o casco de placas atrás.', 13],
      ['alien', 'Alien', 'Verde, olhos grandes e uma antena.', 15],
      ['baleia', 'Baleia', 'Azul, barriga clara e o esguicho em cima.', 17],
    ] as const
  ).map(([id, title, description, nivel]) => cosmetico(`avatar-${id}`, 'avatar', `Avatar ${title}`, description, nivel)),
  // Molduras: um anel pintado na borda do avatar, sem mudar o tamanho dele —
  // cabe dentro do anel de nível do perfil. Desenhos em `ui/Moldura`.
  ...(
    [
      ['minimal', 'Minimal', 'Um fio duplo, sem mais nada.', 3],
      ['terminal', 'Terminal', 'Traços verdes de fósforo, como um cursor piscando.', 4],
      ['pixel', 'Pixel', 'Blocos quadrados em volta, de um jogo antigo.', 6],
      ['neon', 'Neon', 'Dois tubos acesos, rosa e ciano.', 8],
      ['chaves', 'Chaves', 'As chaves de um bloco de código, uma de cada lado.', 9],
      ['ouro', 'Ouro', 'Aro dourado com folhas de louro embaixo.', 12],
      ['prisma', 'Prisma', 'Seis arcos do espectro: a luz aberta em cores.', 14],
    ] as const
  ).map(([id, title, description, nivel]) => cosmetico(`moldura-${id}`, 'moldura', `Moldura ${title}`, description, nivel)),
  // Fundos: a capa do perfil, uma faixa acima do cabeçalho — o texto nunca
  // fica sobre o desenho. Desenhos em `ui/Fundo`.
  ...(
    [
      ['grade', 'Grade', 'Papel quadriculado de caderno de exercícios.', 3],
      ['terminal', 'Terminal', 'A tela preta, o prompt e o cursor piscando.', 5],
      ['circuito', 'Circuito', 'Uma placa verde, com trilhas e soldas.', 6],
      ['por-do-sol', 'Pôr do sol', 'Laranja para roxo, o sol baixando no horizonte.', 9],
      ['aurora', 'Aurora', 'Faixas verdes e violeta num céu de estrelas.', 11],
      ['mar', 'Mar', 'Três ondas, das escuras às claras, e o sol em cima.', 13],
    ] as const
  ).map(([id, title, description, nivel]) => cosmetico(`fundo-${id}`, 'fundo', `Fundo ${title}`, description, nivel)),
  // Só por moedas (0018): épicos sem nível que os abra. O nível abre o último
  // cosmético lá pela semana 13 do aluno-modelo; estes são para onde as
  // moedas vão depois disso (P2-16). O teste de calibragem cobra que somem
  // semanas de estudo, e não dias.
  ...(
    [
      ['avatar-dragao', 'avatar', 'Avatar Dragão', 'Verde, chifres dourados e olhos de fenda.', 1500],
      ['avatar-fenix', 'avatar', 'Avatar Fênix', 'Laranja, com a crista em chamas.', 1400],
      ['moldura-engrenagens', 'moldura', 'Moldura Engrenagens', 'Um aro de metal com dentes, como uma engrenagem.', 1200],
      ['fundo-cidade', 'fundo', 'Fundo Cidade', 'Prédios à noite, a lua e as janelas acesas.', 1300],
    ] as const
  ).map(([id, tipo, title, description, price]): ItemDaLoja => ({ id, tipo, title, description, price, raridade: 'epico' })),
  // Sazonais (0016): só por moedas, só na janela, sem nível que abra. Quem
  // comprou fica com o item depois; a janela não se repete sozinha.
  {
    id: 'fundo-fogos',
    title: 'Fundo Fogos',
    description: 'Fogos de fim de ano num céu de verão.',
    price: 400,
    tipo: 'fundo',
    raridade: 'raro',
    // De 15/12/2026 a 15/01/2027, no horário de Brasília.
    disponivelDe: '2026-12-15T03:00:00.000Z',
    disponivelAte: '2027-01-16T03:00:00.000Z',
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

  const correntes = correntesDaHistoria(entrada.attempts, protecoesDaSequencia(entrada.purchases), entrada.hoje);
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

  const marcos: Array<{ dia: string; moedas: number }> = [];
  for (const { inicio, dias } of correntesComInicio(entrada.attempts, protecoesDaSequencia(entrada.purchases), entrada.hoje)) {
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

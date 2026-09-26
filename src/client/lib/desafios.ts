import type { Attempt } from './mastery';
import type { FlashcardReview } from './review';
import { diaLocal, somarDias } from './sequencia';
import { MOEDAS } from './economia';
import { fechamentoDasAulas } from './study';

/**
 * Desafios diários e semanais.
 *
 * Um desafio é uma meta curta com prazo — "resolva 3 exercícios hoje",
 * "estude em 4 dias desta semana" — e uma recompensa em moedas e XP. Como o
 * resto da gamificação, é **derivado**: o progresso e a conclusão saem do
 * histórico de tentativas e revisões daquele dia ou daquela semana. Não há
 * tabela de desafios aceitos nem de recompensas resgatadas; cumprir é receber.
 *
 * Os desafios de cada dia vêm de um rodízio pela data, então todo mundo vê os
 * mesmos e eles não mudam ao recarregar. O rodízio anda de dois em dois num
 * conjunto de cinco, e por isso dois dias seguidos nunca repetem um desafio.
 * Nenhum deles premia velocidade ou repetição: as metas são sobre exercícios
 * **distintos**, dias distintos, cartões distintos.
 */

export type Periodo = 'dia' | 'semana';

export interface ContextoDoPeriodo {
  /** Tentativas dentro do período. */
  tentativas: Attempt[];
  /** Exercícios com alguma tentativa errada até o fim do período — o "já tinha errado". */
  jaErrados: ReadonlySet<string>;
  revisoes: FlashcardReview[];
  /** Aulas cuja última tentativa certa caiu no período. */
  aulasConcluidas: number;
}

export interface DefinicaoDeDesafio {
  id: string;
  periodo: Periodo;
  title: string;
  /** Uma frase, com a meta escrita. */
  description: string;
  meta: number;
  progresso: (ctx: ContextoDoPeriodo) => number;
}

const exerciciosCertos = (t: Attempt[]) => new Set(t.filter((a) => a.correct).map((a) => a.exerciseId));

export const DESAFIOS_DO_DIA: DefinicaoDeDesafio[] = [
  {
    id: 'dia-resolver-3',
    periodo: 'dia',
    title: 'Três exercícios',
    description: 'Resolva 3 exercícios diferentes hoje.',
    meta: 3,
    progresso: (c) => exerciciosCertos(c.tentativas).size,
  },
  {
    id: 'dia-sem-dica-2',
    periodo: 'dia',
    title: 'Sem abrir dica',
    description: 'Acerte 2 exercícios sem revelar nenhuma dica.',
    meta: 2,
    progresso: (c) => new Set(c.tentativas.filter((a) => a.correct && a.hintsUsed === 0).map((a) => a.exerciseId)).size,
  },
  {
    id: 'dia-revisar-5',
    periodo: 'dia',
    title: 'Cinco cartões',
    description: 'Revise 5 cartões hoje.',
    meta: 5,
    progresso: (c) => new Set(c.revisoes.map((r) => r.flashcardId)).size,
  },
  {
    id: 'dia-insistir-1',
    periodo: 'dia',
    title: 'Voltar e resolver',
    description: 'Resolva um exercício em que você já tinha errado.',
    meta: 1,
    progresso: (c) => [...exerciciosCertos(c.tentativas)].filter((id) => c.jaErrados.has(id)).length,
  },
  {
    id: 'dia-aula-1',
    periodo: 'dia',
    title: 'Uma aula inteira',
    description: 'Conclua uma aula hoje.',
    meta: 1,
    progresso: (c) => c.aulasConcluidas,
  },
];

export const DESAFIOS_DA_SEMANA: DefinicaoDeDesafio[] = [
  {
    id: 'semana-dias-4',
    periodo: 'semana',
    title: 'Quatro dias',
    description: 'Estude em 4 dias diferentes desta semana.',
    meta: 4,
    progresso: (c) => new Set(c.tentativas.map((a) => diaLocal(new Date(a.createdAt)))).size,
  },
  {
    id: 'semana-exercicios-15',
    periodo: 'semana',
    title: 'Quinze exercícios',
    description: 'Resolva 15 exercícios diferentes esta semana.',
    meta: 15,
    progresso: (c) => exerciciosCertos(c.tentativas).size,
  },
  {
    id: 'semana-aulas-3',
    periodo: 'semana',
    title: 'Três aulas',
    description: 'Conclua 3 aulas esta semana.',
    meta: 3,
    progresso: (c) => c.aulasConcluidas,
  },
  {
    id: 'semana-sem-dica-8',
    periodo: 'semana',
    title: 'Oito por conta própria',
    description: 'Acerte 8 exercícios sem revelar dica esta semana.',
    meta: 8,
    progresso: (c) => new Set(c.tentativas.filter((a) => a.correct && a.hintsUsed === 0).map((a) => a.exerciseId)).size,
  },
  {
    id: 'semana-conceitos-5',
    periodo: 'semana',
    title: 'Cinco assuntos',
    description: 'Pratique 5 conceitos diferentes esta semana.',
    meta: 5,
    progresso: (c) => new Set(c.tentativas.flatMap((a) => a.concepts)).size,
  },
  {
    id: 'semana-revisar-20',
    periodo: 'semana',
    title: 'Vinte cartões',
    description: 'Revise 20 cartões esta semana.',
    meta: 20,
    progresso: (c) => new Set(c.revisoes.map((r) => r.flashcardId)).size,
  },
];

export const RECOMPENSA = {
  dia: { moedas: MOEDAS.porDesafioDiario, xp: 30 },
  semana: { moedas: MOEDAS.porDesafioSemanal, xp: 100 },
} as const;

/** Quantos desafios cada período tem. */
export const POR_PERIODO = { dia: 2, semana: 2 } as const;

/** Dias desde 2026-01-01, para o rodízio andar com o calendário. */
function indiceDoDia(dia: string): number {
  const [ano, mes, d] = dia.split('-').map(Number);
  const origem = new Date(2026, 0, 1);
  const data = new Date(ano, mes - 1, d);
  return Math.round((data.getTime() - origem.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Rodízio: o período *i* leva os `quantos` itens a partir de `i · quantos`,
 * dando a volta na lista. Enquanto a lista tiver mais que o dobro de itens
 * por período, dois períodos seguidos nunca compartilham um item.
 */
function escolher(lista: DefinicaoDeDesafio[], quantos: number, indice: number): DefinicaoDeDesafio[] {
  const n = lista.length;
  const inicio = ((indice * quantos) % n + n) % n;
  return Array.from({ length: quantos }, (_, k) => lista[(inicio + k) % n]);
}

/** Segunda-feira da semana de um dia, em AAAA-MM-DD. */
export function inicioDaSemana(dia: string): string {
  const [ano, mes, d] = dia.split('-').map(Number);
  const data = new Date(ano, mes - 1, d);
  // getDay: 0 é domingo. A semana começa na segunda.
  const recuo = (data.getDay() + 6) % 7;
  return somarDias(dia, -recuo);
}

/** Os desafios de um dia (`AAAA-MM-DD`). */
export function desafiosDoDia(dia: string): DefinicaoDeDesafio[] {
  return escolher(DESAFIOS_DO_DIA, POR_PERIODO.dia, indiceDoDia(dia));
}

/** Os desafios de uma semana, pela segunda-feira dela. */
export function desafiosDaSemana(segunda: string): DefinicaoDeDesafio[] {
  return escolher(DESAFIOS_DA_SEMANA, POR_PERIODO.semana, Math.floor(indiceDoDia(segunda) / 7));
}

export interface EstadoDoDesafio {
  desafio: DefinicaoDeDesafio;
  progresso: number;
  concluido: boolean;
  recompensa: { moedas: number; xp: number };
}

export interface EntradaDeDesafios {
  attempts: Attempt[];
  reviews: FlashcardReview[];
  completedLessons: string[];
  hoje?: Date;
}

/**
 * O histórico arrumado por dia local, uma vez só.
 *
 * A versão anterior refazia, para **cada dia** da história, um filtro sobre
 * **todas** as tentativas, convertendo cada data de novo. Com um ano de
 * estudo (~5 mil tentativas) isso era 1,5 s no desktop — e rodava duas vezes
 * por recálculo do painel, travando a tela a cada compra ou troca de perfil.
 * Aqui cada data é convertida uma vez, e um período lê só os seus dias.
 */
interface IndiceDoHistorico {
  tentativasPorDia: Map<string, Attempt[]>;
  revisoesPorDia: Map<string, FlashcardReview[]>;
  /** O primeiro dia em que cada exercício teve uma tentativa errada. */
  primeiroErro: Map<string, string>;
  /** O dia em que cada aula concluída fechou (`fechamentoDasAulas`). */
  conclusoes: string[];
  /** Todos os dias com alguma atividade, em ordem. */
  diasComAtividade: string[];
}

function indexar(entrada: EntradaDeDesafios): IndiceDoHistorico {
  const tentativasPorDia = new Map<string, Attempt[]>();
  const primeiroErro = new Map<string, string>();
  for (const a of entrada.attempts) {
    const dia = diaLocal(new Date(a.createdAt));
    const doDia = tentativasPorDia.get(dia);
    if (doDia) doDia.push(a);
    else tentativasPorDia.set(dia, [a]);
    if (!a.correct) {
      const antes = primeiroErro.get(a.exerciseId);
      if (antes === undefined || dia < antes) primeiroErro.set(a.exerciseId, dia);
    }
  }

  const revisoesPorDia = new Map<string, FlashcardReview[]>();
  for (const r of entrada.reviews) {
    const dia = diaLocal(new Date(r.createdAt));
    const doDia = revisoesPorDia.get(dia);
    if (doDia) doDia.push(r);
    else revisoesPorDia.set(dia, [r]);
  }

  const concluidas = new Set(entrada.completedLessons);
  const conclusoes: string[] = [];
  for (const [aula, instante] of fechamentoDasAulas(entrada.attempts)) {
    if (concluidas.has(aula)) conclusoes.push(diaLocal(new Date(instante)));
  }

  const diasComAtividade = [...new Set([...tentativasPorDia.keys(), ...revisoesPorDia.keys()])].sort();
  return { tentativasPorDia, revisoesPorDia, primeiroErro, conclusoes, diasComAtividade };
}

function contexto(indice: IndiceDoHistorico, de: string, ate: string): ContextoDoPeriodo {
  const tentativas: Attempt[] = [];
  const revisoes: FlashcardReview[] = [];
  for (let dia = de; dia <= ate; dia = somarDias(dia, 1)) {
    const t = indice.tentativasPorDia.get(dia);
    if (t) tentativas.push(...t);
    const r = indice.revisoesPorDia.get(dia);
    if (r) revisoes.push(...r);
  }

  const jaErrados = new Set<string>();
  for (const [exercicio, dia] of indice.primeiroErro) if (dia <= ate) jaErrados.add(exercicio);

  return {
    tentativas,
    jaErrados,
    revisoes,
    aulasConcluidas: indice.conclusoes.filter((d) => d >= de && d <= ate).length,
  };
}

function avaliar(desafio: DefinicaoDeDesafio, ctx: ContextoDoPeriodo): EstadoDoDesafio {
  const progresso = Math.min(desafio.meta, desafio.progresso(ctx));
  return {
    desafio,
    progresso,
    concluido: progresso >= desafio.meta,
    recompensa: RECOMPENSA[desafio.periodo],
  };
}

/** Os desafios de hoje e desta semana, com o progresso atual. */
export function desafiosAtuais(entrada: EntradaDeDesafios): { dia: EstadoDoDesafio[]; semana: EstadoDoDesafio[] } {
  const hoje = diaLocal(entrada.hoje ?? new Date());
  const segunda = inicioDaSemana(hoje);
  const indice = indexar(entrada);

  const ctxDia = contexto(indice, hoje, hoje);
  const ctxSemana = contexto(indice, segunda, somarDias(segunda, 6));

  return {
    dia: desafiosDoDia(hoje).map((d) => avaliar(d, ctxDia)),
    semana: desafiosDaSemana(segunda).map((d) => avaliar(d, ctxSemana)),
  };
}

export interface DesafioConcluido {
  id: string;
  periodo: Periodo;
  /** O dia em que foi cumprido: o último dia do período com atividade. */
  dia: string;
  recompensa: { moedas: number; xp: number };
}

/**
 * Todos os desafios cumpridos desde o primeiro estudo — é daqui que saem as
 * moedas e o XP de desafio. Percorre cada dia e cada semana da história; com
 * um ano de uso são algumas centenas de avaliações sobre listas curtas.
 */
export function desafiosConcluidos(entrada: EntradaDeDesafios): DesafioConcluido[] {
  if (entrada.attempts.length === 0 && entrada.reviews.length === 0) return [];
  const hoje = diaLocal(entrada.hoje ?? new Date());
  const indice = indexar(entrada);
  const dias = indice.diasComAtividade.filter((d) => d <= hoje);
  if (dias.length === 0) return [];

  const concluidos: DesafioConcluido[] = [];

  for (const dia of dias) {
    const ctx = contexto(indice, dia, dia);
    for (const d of desafiosDoDia(dia)) {
      if (avaliar(d, ctx).concluido) concluidos.push({ id: d.id, periodo: 'dia', dia, recompensa: RECOMPENSA.dia });
    }
  }

  for (let segunda = inicioDaSemana(dias[0]); segunda <= hoje; segunda = somarDias(segunda, 7)) {
    const fim = somarDias(segunda, 6);
    const ultimoDia = dias.filter((d) => d >= segunda && d <= fim).pop();
    if (!ultimoDia) continue;
    const ctx = contexto(indice, segunda, fim);
    for (const d of desafiosDaSemana(segunda)) {
      if (avaliar(d, ctx).concluido) {
        concluidos.push({ id: d.id, periodo: 'semana', dia: ultimoDia, recompensa: RECOMPENSA.semana });
      }
    }
  }

  return concluidos;
}

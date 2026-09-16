import type { Attempt } from './mastery';
import type { FlashcardReview } from './review';
import { diaLocal, somarDias } from './sequencia';
import { MOEDAS } from './economia';

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
  /** Todas as tentativas até o fim do período — para saber o que já tinha sido errado antes. */
  historico: Attempt[];
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
    progresso: (c) => {
      const errados = new Set(c.historico.filter((a) => !a.correct).map((a) => a.exerciseId));
      return [...exerciciosCertos(c.tentativas)].filter((id) => errados.has(id)).length;
    },
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

/** O dia em que cada aula concluída foi fechada: a última tentativa certa nela. */
function diaDeConclusaoPorAula(attempts: Attempt[], completedLessons: string[]): Map<string, string> {
  const concluidas = new Set(completedLessons);
  const dia = new Map<string, string>();
  for (const a of attempts) {
    if (!a.correct || !concluidas.has(a.lessonId)) continue;
    const d = diaLocal(new Date(a.createdAt));
    const atual = dia.get(a.lessonId);
    if (atual === undefined || d > atual) dia.set(a.lessonId, d);
  }
  return dia;
}

function contexto(
  entrada: EntradaDeDesafios,
  de: string,
  ate: string,
  conclusoes: Map<string, string>
): ContextoDoPeriodo {
  const dentro = (iso: string) => {
    const d = diaLocal(new Date(iso));
    return d >= de && d <= ate;
  };
  const historico = entrada.attempts.filter((a) => diaLocal(new Date(a.createdAt)) <= ate);
  return {
    tentativas: entrada.attempts.filter((a) => dentro(a.createdAt)),
    historico,
    revisoes: entrada.reviews.filter((r) => dentro(r.createdAt)),
    aulasConcluidas: [...conclusoes.values()].filter((d) => d >= de && d <= ate).length,
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
  const conclusoes = diaDeConclusaoPorAula(entrada.attempts, entrada.completedLessons);

  const ctxDia = contexto(entrada, hoje, hoje, conclusoes);
  const ctxSemana = contexto(entrada, segunda, somarDias(segunda, 6), conclusoes);

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
  const conclusoes = diaDeConclusaoPorAula(entrada.attempts, entrada.completedLessons);

  const datas = [
    ...entrada.attempts.map((a) => diaLocal(new Date(a.createdAt))),
    ...entrada.reviews.map((r) => diaLocal(new Date(r.createdAt))),
  ].sort();
  const primeiro = datas[0];
  const diasComAtividade = new Set(datas);

  const concluidos: DesafioConcluido[] = [];

  for (let dia = primeiro; dia <= hoje; dia = somarDias(dia, 1)) {
    if (!diasComAtividade.has(dia)) continue;
    const ctx = contexto(entrada, dia, dia, conclusoes);
    for (const d of desafiosDoDia(dia)) {
      if (avaliar(d, ctx).concluido) concluidos.push({ id: d.id, periodo: 'dia', dia, recompensa: RECOMPENSA.dia });
    }
  }

  for (let segunda = inicioDaSemana(primeiro); segunda <= hoje; segunda = somarDias(segunda, 7)) {
    const fim = somarDias(segunda, 6);
    const ctx = contexto(entrada, segunda, fim, conclusoes);
    const ultimoDia = [...diasComAtividade].filter((d) => d >= segunda && d <= fim).sort().pop();
    if (!ultimoDia) continue;
    for (const d of desafiosDaSemana(segunda)) {
      if (avaliar(d, ctx).concluido) {
        concluidos.push({ id: d.id, periodo: 'semana', dia: ultimoDia, recompensa: RECOMPENSA.semana });
      }
    }
  }

  return concluidos;
}

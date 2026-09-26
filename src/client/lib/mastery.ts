/**
 * Domínio por conceito, derivado do histórico de tentativas.
 *
 * Duas ideias sustentam este módulo.
 *
 * A primeira é do §78: **aula concluída não é conceito dominado**. Um aluno pode
 * terminar a aula de loops com quatro dicas abertas e ainda não conseguir
 * escrever um loop sozinho. Por isso o domínio olha as tentativas, não a
 * conclusão.
 *
 * A segunda é do §282: o aluno tem direito de saber como a conta é feita. Por
 * isso cada resultado carrega as evidências que o produziram — tentativas,
 * acertos, exercícios distintos resolvidos — e não apenas um rótulo.
 *
 * A terceira veio da auditoria de 2026-09-26: **domínio pede tempo**. Dois
 * exercícios resolvidos na mesma tarde provam que a aula foi entendida, não
 * que ficou — é a memória de curto prazo respondendo. "Dominando" exige
 * acertar de novo depois de alguns dias; e um domínio sem prática há meses
 * continua dominando, mas pede uma revisão.
 *
 * Este é um primeiro modelo, com limiares escolhidos por bom senso e não por
 * dados. Ele deve ser recalibrado quando houver uso real (§423).
 */

import { diaLocal, somarDias } from './sequencia';

export interface Attempt {
  exerciseId: string;
  lessonId: string;
  concepts: string[];
  correct: boolean;
  hintsUsed: number;
  /** ISO 8601. */
  createdAt: string;
}

export type MasteryLevel = 'nao-iniciado' | 'conhecendo' | 'praticando' | 'dominando';

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  'nao-iniciado': 'Não iniciado',
  conhecendo: 'Conhecendo',
  praticando: 'Praticando',
  dominando: 'Dominando',
};

/** Por que o conceito pede revisão — para a tela dizer, e não só marcar. */
export type MotivoDaRevisao = 'pouca-precisao' | 'regressao' | 'tempo';

export const MOTIVOS_DA_REVISAO: Record<MotivoDaRevisao, string> = {
  'pouca-precisao': 'Mais erros que acertos',
  regressao: 'Errou depois de já ter acertado',
  tempo: 'Faz tempo que não pratica',
};

export interface ConceptMastery {
  conceptId: string;
  level: MasteryLevel;
  /** Evidências, para o aluno poder conferir de onde saiu o nível. */
  attempts: number;
  correctAttempts: number;
  /** Exercícios distintos já resolvidos. Repetir o mesmo não vira domínio. */
  exercisesSolved: number;
  /** 0 a 1. Zero tentativas resulta em 0. */
  accuracy: number;
  /** Resolveu sem revelar nenhuma dica ao menos uma vez. */
  solvedUnaided: boolean;
  /**
   * Acertou de novo pelo menos `DIAS_PARA_CONFIRMAR` dias depois do primeiro
   * acerto. Sem isso, o conceito não passa de "praticando".
   */
  confirmadoNoTempo: boolean;
  /**
   * Tem tudo o que "dominando" pede, menos o tempo: a tela diz que falta
   * acertar de novo daqui a alguns dias, em vez de deixar a pessoa adivinhar.
   */
  aguardandoConfirmacao: boolean;
  /** Sinaliza revisão recomendada — ver `motivoDaRevisao`. */
  needsReview: boolean;
  motivoDaRevisao: MotivoDaRevisao | null;
}

/** Acertar de primeira e acertar na quarta dica não são a mesma evidência. */
const DICAS_PARA_CONTAR_COMO_AUTONOMO = 0;

/** Abaixo disso, com histórico suficiente, o conceito entra em revisão. */
const ACERTO_MINIMO = 0.5;
const TENTATIVAS_MINIMAS_PARA_JULGAR = 3;

/** Dois exercícios distintos: um só pode ter sido sorte ou decoreba (§82). */
const EXERCICIOS_PARA_DOMINIO = 2;

/**
 * Dias entre o primeiro acerto e um acerto que confirma. O mesmo primeiro
 * intervalo do caderno de erros (`INTERVALOS_DO_CADERNO`): é a partir daí que
 * lembrar deixa de ser memória de curto prazo.
 */
export const DIAS_PARA_CONFIRMAR = 3;

/** Um domínio sem nenhuma tentativa há tanto tempo pede revisão. */
export const DIAS_PARA_ENVELHECER = 60;

function nivel(
  exercisesSolved: number,
  accuracy: number,
  solvedUnaided: boolean,
  confirmadoNoTempo: boolean
): MasteryLevel {
  if (
    exercisesSolved >= EXERCICIOS_PARA_DOMINIO &&
    accuracy >= ACERTO_MINIMO &&
    solvedUnaided &&
    confirmadoNoTempo
  ) {
    return 'dominando';
  }
  if (exercisesSolved > 0) return 'praticando';
  return 'conhecendo';
}

/**
 * Recomenda revisão quando os dados sugerem que o conceito não ficou.
 *
 * Três gatilhos, na ordem em que pesam: histórico suficiente com pouca
 * precisão; uma regressão — já resolveu antes, mas a tentativa mais recente
 * falhou; ou um domínio parado há `DIAS_PARA_ENVELHECER` dias. O tempo só
 * vale para "dominando": é o rótulo que afirma que ficou, e é ele que precisa
 * continuar verdadeiro. Os outros níveis voltam a ser praticados pela trilha.
 */
function motivoDaRevisao(
  ordenadas: Attempt[],
  accuracy: number,
  exercisesSolved: number,
  level: MasteryLevel,
  hoje: string
): MotivoDaRevisao | null {
  if (ordenadas.length === 0) return null;

  if (ordenadas.length >= TENTATIVAS_MINIMAS_PARA_JULGAR && accuracy < ACERTO_MINIMO) return 'pouca-precisao';

  const ultima = ordenadas[ordenadas.length - 1];
  if (exercisesSolved > 0 && !ultima.correct) return 'regressao';

  const diaDaUltima = diaLocal(new Date(ultima.createdAt));
  if (level === 'dominando' && somarDias(diaDaUltima, DIAS_PARA_ENVELHECER) <= hoje) return 'tempo';

  return null;
}

/**
 * Calcula o domínio de um conceito a partir das tentativas que o exercitaram.
 *
 * `allAttempts` pode conter tentativas de qualquer conceito: a filtragem é feita
 * aqui, para quem chama não precisar conhecer a regra.
 */
export function conceptMastery(conceptId: string, allAttempts: Attempt[], hoje: Date = new Date()): ConceptMastery {
  const doConceito = allAttempts
    .filter((a) => a.concepts.includes(conceptId))
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  if (doConceito.length === 0) {
    return {
      conceptId,
      level: 'nao-iniciado',
      attempts: 0,
      correctAttempts: 0,
      exercisesSolved: 0,
      accuracy: 0,
      solvedUnaided: false,
      confirmadoNoTempo: false,
      aguardandoConfirmacao: false,
      needsReview: false,
      motivoDaRevisao: null,
    };
  }

  const corretas = doConceito.filter((a) => a.correct);
  const exercisesSolved = new Set(corretas.map((a) => a.exerciseId)).size;
  const accuracy = corretas.length / doConceito.length;
  const solvedUnaided = corretas.some((a) => a.hintsUsed <= DICAS_PARA_CONTAR_COMO_AUTONOMO);
  // As corretas já estão em ordem: a primeira e a última bastam.
  const confirmadoNoTempo =
    corretas.length > 1 &&
    somarDias(diaLocal(new Date(corretas[0].createdAt)), DIAS_PARA_CONFIRMAR) <=
      diaLocal(new Date(corretas[corretas.length - 1].createdAt));
  const level = nivel(exercisesSolved, accuracy, solvedUnaided, confirmadoNoTempo);
  const motivo = motivoDaRevisao(doConceito, accuracy, exercisesSolved, level, diaLocal(hoje));

  return {
    conceptId,
    level,
    attempts: doConceito.length,
    correctAttempts: corretas.length,
    exercisesSolved,
    accuracy,
    solvedUnaided,
    confirmadoNoTempo,
    aguardandoConfirmacao: level !== 'dominando' && nivel(exercisesSolved, accuracy, solvedUnaided, true) === 'dominando',
    needsReview: motivo !== null,
    motivoDaRevisao: motivo,
  };
}

/** Domínio de vários conceitos de uma vez, preservando a ordem recebida. */
export function masteryByConcept(conceptIds: string[], attempts: Attempt[], hoje: Date = new Date()): ConceptMastery[] {
  return conceptIds.map((id) => conceptMastery(id, attempts, hoje));
}

/** Conceitos com revisão recomendada, do mais fraco para o mais forte. */
export function conceptsNeedingReview(
  conceptIds: string[],
  attempts: Attempt[],
  hoje: Date = new Date()
): ConceptMastery[] {
  return masteryByConcept(conceptIds, attempts, hoje)
    .filter((m) => m.needsReview)
    .sort((a, b) => a.accuracy - b.accuracy);
}

export interface OverallStats {
  attempts: number;
  correctAttempts: number;
  /** 0 a 1. */
  accuracy: number;
  exercisesSolved: number;
  /** Dias distintos com ao menos uma tentativa. */
  activeDays: number;
}

/** Números gerais para o painel. */
export function overallStats(attempts: Attempt[]): OverallStats {
  const corretas = attempts.filter((a) => a.correct);
  // O dia de quem estuda, não o de Greenwich: às 22h em São Paulo já é amanhã
  // em UTC, e uma noite de estudo contava como dois dias.
  const dias = new Set(attempts.map((a) => diaLocal(new Date(a.createdAt))));

  return {
    attempts: attempts.length,
    correctAttempts: corretas.length,
    accuracy: attempts.length === 0 ? 0 : corretas.length / attempts.length,
    exercisesSolved: new Set(corretas.map((a) => a.exerciseId)).size,
    activeDays: dias.size,
  };
}

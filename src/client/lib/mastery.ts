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
 * Este é um primeiro modelo, com limiares escolhidos por bom senso e não por
 * dados. Ele deve ser recalibrado quando houver uso real (§423).
 */

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
  /** Sinaliza revisão recomendada — ver `precisaRevisar`. */
  needsReview: boolean;
}

/** Acertar de primeira e acertar na quarta dica não são a mesma evidência. */
const DICAS_PARA_CONTAR_COMO_AUTONOMO = 0;

/** Abaixo disso, com histórico suficiente, o conceito entra em revisão. */
const ACERTO_MINIMO = 0.5;
const TENTATIVAS_MINIMAS_PARA_JULGAR = 3;

/** Dois exercícios distintos: um só pode ter sido sorte ou decoreba (§82). */
const EXERCICIOS_PARA_DOMINIO = 2;

function nivel(exercisesSolved: number, accuracy: number, solvedUnaided: boolean): MasteryLevel {
  if (exercisesSolved >= EXERCICIOS_PARA_DOMINIO && accuracy >= ACERTO_MINIMO && solvedUnaided) {
    return 'dominando';
  }
  if (exercisesSolved > 0) return 'praticando';
  return 'conhecendo';
}

/**
 * Recomenda revisão quando os dados sugerem que o conceito não ficou.
 *
 * Dois gatilhos independentes: histórico suficiente com pouca precisão, ou uma
 * regressão — já resolveu antes, mas a tentativa mais recente falhou.
 */
function precisaRevisar(ordenadas: Attempt[], accuracy: number, exercisesSolved: number): boolean {
  if (ordenadas.length === 0) return false;

  const poucaPrecisao =
    ordenadas.length >= TENTATIVAS_MINIMAS_PARA_JULGAR && accuracy < ACERTO_MINIMO;

  const ultima = ordenadas[ordenadas.length - 1];
  const regrediu = exercisesSolved > 0 && !ultima.correct;

  return poucaPrecisao || regrediu;
}

/**
 * Calcula o domínio de um conceito a partir das tentativas que o exercitaram.
 *
 * `allAttempts` pode conter tentativas de qualquer conceito: a filtragem é feita
 * aqui, para quem chama não precisar conhecer a regra.
 */
export function conceptMastery(conceptId: string, allAttempts: Attempt[]): ConceptMastery {
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
      needsReview: false,
    };
  }

  const corretas = doConceito.filter((a) => a.correct);
  const exercisesSolved = new Set(corretas.map((a) => a.exerciseId)).size;
  const accuracy = corretas.length / doConceito.length;
  const solvedUnaided = corretas.some((a) => a.hintsUsed <= DICAS_PARA_CONTAR_COMO_AUTONOMO);

  return {
    conceptId,
    level: nivel(exercisesSolved, accuracy, solvedUnaided),
    attempts: doConceito.length,
    correctAttempts: corretas.length,
    exercisesSolved,
    accuracy,
    solvedUnaided,
    needsReview: precisaRevisar(doConceito, accuracy, exercisesSolved),
  };
}

/** Domínio de vários conceitos de uma vez, preservando a ordem recebida. */
export function masteryByConcept(conceptIds: string[], attempts: Attempt[]): ConceptMastery[] {
  return conceptIds.map((id) => conceptMastery(id, attempts));
}

/** Conceitos com revisão recomendada, do mais fraco para o mais forte. */
export function conceptsNeedingReview(
  conceptIds: string[],
  attempts: Attempt[]
): ConceptMastery[] {
  return masteryByConcept(conceptIds, attempts)
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
  const dias = new Set(attempts.map((a) => a.createdAt.slice(0, 10)));

  return {
    attempts: attempts.length,
    correctAttempts: corretas.length,
    accuracy: attempts.length === 0 ? 0 : corretas.length / attempts.length,
    exercisesSolved: new Set(corretas.map((a) => a.exerciseId)).size,
    activeDays: dias.size,
  };
}

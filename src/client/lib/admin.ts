import type { CodeExercise, Exercise, Lesson, Project } from '../../content/types';

/**
 * Diagnóstico de conteúdo para a administração.
 *
 * O §180 pede identificar conteúdo problemático a partir do uso real: exercício
 * que a maioria erra, que consome muitas dicas ou exige muitas tentativas.
 *
 * A leitura importante, e que a interface precisa comunicar: **taxa baixa de
 * acerto não é veredito de conteúdo ruim.** Um exercício difícil de propósito
 * também tem taxa baixa. O que distingue os dois é o padrão — muitas tentativas
 * com muitas dicas e ainda assim poucos alunos resolvendo sugere enunciado
 * confuso, enquanto poucas tentativas bem-sucedidas depois de erro inicial é
 * exatamente o aprendizado funcionando.
 *
 * Por isso as funções aqui devolvem sinais, não notas.
 */

/** Uma linha da view `exercise_performance`. */
export interface ExercisePerformance {
  exerciseId: string;
  lessonId: string;
  attempts: number;
  correctAttempts: number;
  students: number;
  studentsSolved: number;
  /** 0 a 100. `null` quando não houve tentativa. */
  accuracyPercent: number | null;
  avgHintsUsed: number;
  attemptsPerStudent: number;
}

export type ContentSignal =
  /** Poucos alunos concluem, com muito esforço: suspeita de enunciado confuso. */
  | 'revisar-enunciado'
  /** Quase todos acertam de primeira: pode estar fácil demais (§182). */
  | 'facil-demais'
  /** Dados insuficientes para julgar. */
  | 'sem-dados'
  | 'saudavel';

/** Abaixo disto, qualquer conclusão seria ruído estatístico. */
export const MINIMO_DE_ALUNOS = 5;

/** Fração de alunos que chega a resolver. */
const CONCLUSAO_BAIXA = 0.5;
/** Tentativas por aluno acima disto indica que o caminho não está claro. */
const MUITAS_TENTATIVAS = 4;
/** Acerto quase universal na primeira tentativa. */
const ACERTO_ALTISSIMO = 95;

export interface ExerciseDiagnosis extends ExercisePerformance {
  signal: ContentSignal;
  /** Por que este sinal, em uma frase. Recomendação sem explicação vira palpite. */
  reason: string;
  /** Fração de alunos que resolveu, de 0 a 1. */
  completionRate: number;
}

export function diagnoseExercise(perf: ExercisePerformance): ExerciseDiagnosis {
  const completionRate = perf.students === 0 ? 0 : perf.studentsSolved / perf.students;

  const base = { ...perf, completionRate };

  if (perf.students < MINIMO_DE_ALUNOS) {
    return {
      ...base,
      signal: 'sem-dados',
      reason: `Só ${perf.students} ${
        perf.students === 1 ? 'aluno tentou' : 'alunos tentaram'
      }. Abaixo de ${MINIMO_DE_ALUNOS}, qualquer conclusão seria ruído.`,
    };
  }

  if (completionRate < CONCLUSAO_BAIXA && perf.attemptsPerStudent > MUITAS_TENTATIVAS) {
    return {
      ...base,
      signal: 'revisar-enunciado',
      reason: `Só ${Math.round(completionRate * 100)}% dos alunos resolveram, com ${
        perf.attemptsPerStudent
      } tentativas cada. Muita tentativa e pouca conclusão costuma ser enunciado confuso, não conceito difícil.`,
    };
  }

  if (
    perf.accuracyPercent !== null &&
    perf.accuracyPercent >= ACERTO_ALTISSIMO &&
    perf.avgHintsUsed === 0
  ) {
    return {
      ...base,
      signal: 'facil-demais',
      reason: `${perf.accuracyPercent}% de acerto sem nenhuma dica aberta. Vale conferir se o exercício ainda exige raciocínio.`,
    };
  }

  return {
    ...base,
    signal: 'saudavel',
    reason: `${Math.round(completionRate * 100)}% dos alunos resolveram, em ${
      perf.attemptsPerStudent
    } tentativas em média.`,
  };
}

/** Diagnósticos ordenados por urgência: o que precisa de revisão vem primeiro. */
export function diagnoseAll(performances: ExercisePerformance[]): ExerciseDiagnosis[] {
  const prioridade: Record<ContentSignal, number> = {
    'revisar-enunciado': 0,
    'facil-demais': 1,
    saudavel: 2,
    'sem-dados': 3,
  };

  return performances
    .map(diagnoseExercise)
    .sort(
      (a, b) => prioridade[a.signal] - prioridade[b.signal] || a.completionRate - b.completionRate
    );
}

// ------------------------------------------------------ saúde do catálogo

export interface CatalogHealth {
  lessons: number;
  exercises: number;
  projects: number;
  /** Exercícios de código sem solução de referência: não dá para provar que são resolvíveis. */
  codeExercisesWithoutSolution: string[];
  /** Exercícios sem dica alguma: o aluno travado não tem para onde ir. */
  exercisesWithoutHints: string[];
  /** Projetos sem solução de referência. */
  projectsWithoutSolution: string[];
}

/**
 * Lacunas estruturais do catálogo.
 *
 * Complementa o que o CI já verifica. A suíte prova que o conteúdo publicado
 * funciona; isto mostra onde ele está incompleto — um exercício sem dica passa
 * em todos os testes e ainda assim deixa o aluno sem saída.
 */
export function auditCatalog(
  lessons: Lesson[],
  exercises: Exercise[],
  projects: Project[]
): CatalogHealth {
  const codigo = exercises.filter((e): e is CodeExercise => e.type === 'code');

  return {
    lessons: lessons.length,
    exercises: exercises.length,
    projects: projects.length,
    codeExercisesWithoutSolution: codigo.filter((e) => !e.solution).map((e) => e.id),
    exercisesWithoutHints: exercises.filter((e) => e.hints.length === 0).map((e) => e.id),
    projectsWithoutSolution: projects.filter((p) => !p.referenceSolution).map((p) => p.id),
  };
}

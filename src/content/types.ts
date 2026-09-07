/**
 * Modelo de conteúdo do CodeFlow.
 *
 * Regra que este arquivo existe para sustentar (docs/context §312): nenhum
 * conteúdo didático mora dentro de componente. A interface consome estes tipos;
 * criar uma aula nova é acrescentar um dado, nunca editar uma página.
 *
 * Hoje os dados vivem em módulos TypeScript. Quando migrarem para o banco, só
 * `content/index.ts` muda — as páginas continuam iguais.
 */

/** Ciclo de vida editorial (§319). Só `published` chega ao aluno. */
export type ContentStatus = 'draft' | 'published' | 'archived';

export type Difficulty = 'iniciante' | 'intermediario' | 'avancado';

/**
 * Identificador da linguagem. Coincide com o id usado pelo Monaco, então serve
 * tanto para rotular o conteúdo quanto para configurar o editor.
 * Só JavaScript tem conteúdo hoje; os demais estão previstos no roadmap (§287).
 */
export type LanguageId = 'javascript' | 'typescript' | 'python' | 'sql';

export const LANGUAGE_LABELS: Record<LanguageId, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  sql: 'SQL',
};

/**
 * Unidade de conhecimento. O campo `prerequisites` forma o grafo de dependências
 * pedagógicas (§77) que as trilhas dinâmicas vão consumir mais adiante.
 */
export interface Concept {
  id: string;
  title: string;
  summary: string;
  prerequisites: string[];
  tags: string[];
}

/** Um caso de teste de exercício de código. */
export interface TestCase {
  /** Frase que o aluno lê quando o teste passa. Precisa ser específica. */
  description: string;
  /** JavaScript executado no mesmo escopo do código do aluno; deve lançar ao falhar. */
  assertion: string;
  /** Testes ocultos não aparecem no enunciado (§167). */
  hidden?: boolean;
}

interface ExerciseBase {
  id: string;
  prompt: string;
  /** Conceitos exercitados — alimenta revisão e detecção de lacunas. */
  concepts: string[];
  difficulty: Difficulty;
  /** Dicas em ordem crescente de entrega, da orientação geral à solução (§10). */
  hints: string[];
  tags: string[];
}

/** Escreve código e passa nos testes. */
export interface CodeExercise extends ExerciseBase {
  type: 'code';
  initialCode: string;
  tests: TestCase[];
  /** Solução de referência, para comparação depois do envio (§31). */
  solution?: string;
}

/** Escolhe entre alternativas. */
export interface MultipleChoiceExercise extends ExerciseBase {
  type: 'multiple-choice';
  options: string[];
  correctIndex: number;
  explanation: string;
}

/** Lê um trecho e prevê a saída antes de executar (§94). */
export interface PredictOutputExercise extends ExerciseBase {
  type: 'predict-output';
  code: string;
  expectedOutput: string;
  explanation: string;
}

/**
 * União discriminada por `type`. Acrescentar um tipo novo (ordenação, encontre o
 * erro, arraste e solte…) é estender esta união — nenhuma página precisa saber
 * de todos os tipos, só dos que renderiza (§315).
 */
export type Exercise = CodeExercise | MultipleChoiceExercise | PredictOutputExercise;

/** Blocos que compõem uma aula. Nem toda aula usa todos (§316). */
export type LessonBlock =
  | { kind: 'prose'; markdown: string }
  | { kind: 'example'; language: string; code: string; caption?: string }
  | { kind: 'exercise'; exercise: Exercise }
  | { kind: 'summary'; markdown: string };

export interface Lesson {
  id: string;
  trackId: string;
  title: string;
  /** Linguagem da aula — rotulada na interface e usada para configurar o editor. */
  language: LanguageId;
  /** O que o aluno consegue fazer ao terminar. Aparece no topo da aula. */
  objective: string;
  concepts: string[];
  blocks: LessonBlock[];
  status: ContentStatus;
  estimatedMinutes: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  language: LanguageId;
  concepts: string[];
  /** Enunciado completo em Markdown. */
  brief: string;
  initialCode: string;
  status: ContentStatus;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  concepts: string[];
}

export interface Track {
  id: string;
  title: string;
  description: string;
  language: LanguageId;
  /** Ordem pedagógica das aulas. É esta lista que define "próxima aula". */
  lessonIds: string[];
  status: ContentStatus;
}

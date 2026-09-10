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

/**
 * Os ids de dificuldade são sem acento por serem identificadores; o que o aluno
 * lê não é. Sem este mapa a tela mostrava "intermediario" e "avancado".
 */
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  iniciante: 'iniciante',
  intermediario: 'intermediário',
  avancado: 'avançado',
};

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

/**
 * Uma regra que vale para qualquer entrada, verificada contra casos sorteados.
 *
 * Um teste de caso fixo diz "somar(2, 3) devolve 5", e é passável escrevendo
 * `if (a === 2 && b === 3) return 5`. Uma propriedade diz "somar(a, b) é sempre
 * a + b" e sorteia as entradas: a única forma de passar é resolver o problema, e
 * qualquer implementação que resolva serve.
 */
export interface ExerciseProperty {
  /** O que a propriedade afirma, em uma frase. */
  description: string;
  /** Corpo de função que devolve um caso. Tem `rnd()` — sorteio em [0, 1). */
  generate: string;
  /** Corpo de função que recebe `caso` e lança quando a regra não vale. */
  check: string;
  /** Quantos casos sortear. Padrão 50, teto 200. */
  runs?: number;
}

/** Escreve código e passa nos testes. */
export interface CodeExercise extends ExerciseBase {
  type: 'code';
  initialCode: string;
  tests: TestCase[];
  /**
   * Regras verificadas contra entradas sorteadas, além dos casos fixos.
   *
   * Os dois convivem de propósito: o caso fixo é a mensagem que o aluno entende
   * primeiro ("somarAte(4) devolve 10"), e a propriedade é o que impede de passar
   * decorando esse caso.
   */
  properties?: ExerciseProperty[];
  /** Solução de referência, para comparação depois do envio (§31). */
  solution?: string;
}

/**
 * Preenche as partes que carregam a ideia, com a estrutura já dada.
 *
 * Ocupa o degrau entre a múltipla escolha e o exercício de código: o aluno
 * entende o que precisa acontecer mas ainda não monta a estrutura sozinho.
 *
 * A correção roda os testes contra o código preenchido, e não compara texto com
 * um gabarito. Comparar recusaria `n * 2` porque o gabarito dizia `2 * n`, e
 * ensinaria a adivinhar o que o professor quer.
 */
export interface FillBlankExercise extends ExerciseBase {
  type: 'fill-blank';
  /** Código com as lacunas marcadas: `{{1}}`, `{{2}}`… numeradas a partir de 1. */
  template: string;
  /** Uma entrada por lacuna, na ordem da numeração. */
  blanks: Array<{
    /** Texto de apoio dentro do campo vazio. Nunca a resposta. */
    placeholder?: string;
    /** Largura sugerida em caracteres, para o campo não desalinhar o código. */
    size?: number;
  }>;
  tests: TestCase[];
  properties?: ExerciseProperty[];
  /** Por que a resposta funciona. Aparece depois de acertar. */
  explanation: string;
  solution?: string[];
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
 * Coloca os passos de uma solução na ordem certa.
 *
 * Os outros tipos cobram escrita ou escolha; nenhum cobra **sequência**, que é
 * metade do que separa quem sabe a sintaxe de quem resolve o problema. Um aluno
 * pode conhecer `trim`, `split` e `filter` e ainda assim não saber em que ordem
 * aplicá-los.
 *
 * Como não há o que digitar, o exercício isola o raciocínio de sequência de
 * qualquer dificuldade de escrita — e por isso funciona bem cedo na trilha.
 */
export interface OrderStepsExercise extends ExerciseBase {
  type: 'order-steps';
  steps: Array<{
    id: string;
    /** O passo, como o aluno lê. Uma linha de código, ou uma frase. */
    text: string;
    /**
     * Posição na sequência. Passos com o **mesmo** número podem trocar de lugar
     * entre si — é assim que o exercício aceita mais de uma resposta certa sem
     * enumerar combinações.
     */
    ordem: number;
  }>;
  explanation: string;
}

/**
 * Escreve o teste de uma função que já está pronta.
 *
 * Todos os outros tipos verificam o aluno. Este verifica **a verificação dele**:
 * as asserções que ele escrever são rodadas contra a implementação correta —
 * onde precisam passar — e contra versões sabotadas, onde precisam falhar.
 *
 * É a única forma honesta de ensinar teste, porque a lição central não é a
 * sintaxe: é que um teste que aceita tudo não vale nada. Um arquivo de teste
 * vazio passa em qualquer implementação, e aqui ele reprova o exercício com a
 * mensagem dizendo qual defeito passou despercebido.
 */
export interface WriteTestExercise extends ExerciseBase {
  type: 'write-test';
  /** A implementação correta, mostrada ao aluno. É ela que ele vai testar. */
  subject: string;
  /** Por onde o aluno começa — normalmente um comentário e um exemplo. */
  initialCode: string;
  /**
   * Versões quebradas de propósito.
   *
   * Cada uma precisa ser reprovada pelos testes do aluno. A descrição é o que
   * ele lê quando o teste dele deixa o defeito passar, então ela nomeia o
   * defeito — não a linha alterada.
   */
  mutants: Array<{ description: string; code: string }>;
  explanation: string;
  /** Teste de referência, para o CI provar que o exercício é resolvível. */
  solution?: string;
}

/**
 * União discriminada por `type`. Acrescentar um tipo novo (encontre o erro,
 * refatore…) é estender esta união — nenhuma página precisa saber de todos os
 * tipos, só dos que renderiza (§315).
 */
export type Exercise =
  | CodeExercise
  | FillBlankExercise
  | MultipleChoiceExercise
  | OrderStepsExercise
  | PredictOutputExercise
  | WriteTestExercise;

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

/**
 * Etapa verificável de um projeto (§169).
 *
 * Divide um enunciado grande em marcos que o aluno consegue fechar um a um, e
 * transforma os critérios de aceitação do §228 em algo que a plataforma checa —
 * em vez de um texto que ninguém confere.
 */
export interface ProjectCheckpoint {
  id: string;
  title: string;
  /** O que precisa estar funcionando para este marco fechar. */
  description: string;
  tests: TestCase[];
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
  /** Marcos verificáveis, na ordem sugerida de resolução. */
  checkpoints: ProjectCheckpoint[];
  /**
   * Implementação de referência, usada **apenas** pela suíte de testes para
   * provar que os checkpoints são satisfazíveis. Nunca é exibida ao aluno: o
   * §340 pede que projeto aberto seja avaliado por critério, não comparado a
   * uma solução única.
   */
  referenceSolution?: string;
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

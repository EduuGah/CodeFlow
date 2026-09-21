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
export type LanguageId = 'javascript' | 'typescript' | 'react' | 'python' | 'sql' | 'html' | 'node';

/**
 * Onde o código do aluno roda.
 *
 * `worker` é o sandbox de JavaScript puro: rápido, sem DOM, interrompível. É
 * o padrão. `iframe` é o motor de página: o código vira um documento HTML
 * num `<iframe sandbox>` de origem opaca, e os testes rodam lá dentro com
 * `document` à mão. É o que as aulas de HTML, CSS e DOM usam.
 */
export type Runtime = 'worker' | 'iframe';

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
  /** TSX: TypeScript com JSX, compilado e montado com o React embutido no iframe. */
  react: 'React',
  python: 'Python',
  sql: 'SQL',
  html: 'HTML',
  /** JavaScript do lado do servidor: o mesmo código, rodando no Node de mentira. */
  node: 'Node',
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

/**
 * Um trecho que o compilador de TypeScript precisa aceitar ou recusar.
 *
 * Só existe em aula de TypeScript. É o teste que o sandbox não consegue
 * fazer: um tipo que **impede** o uso errado se prova tentando o uso errado
 * e cobrando a recusa — `somar('a', 1)` roda igual em JavaScript.
 */
export interface TypeTest {
  /** O que o trecho prova, na frase que o aluno lê. */
  description: string;
  /** TypeScript acrescentado ao fim do código do aluno. */
  code: string;
  /** `true` quando o compilador precisa **recusar** o trecho. Padrão: precisa aceitar. */
  rejects?: boolean;
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
  /** Padrão `worker`. Com `iframe`, o código é uma página e os testes veem o DOM. */
  runtime?: Runtime;
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
  /** Trechos que o compilador precisa aceitar ou recusar. Só em TypeScript. */
  typeTests?: TypeTest[];
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
  /** Padrão `worker`. Com `iframe`, o molde preenchido é uma página. */
  runtime?: Runtime;
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
  /** Trechos que o compilador precisa aceitar ou recusar. Só em TypeScript. */
  typeTests?: TypeTest[];
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
 * Aponta a linha onde está o defeito.
 *
 * Já existe exercício de **consertar** — um `code` com o esqueleto quebrado. O
 * que faltava era separar as duas metades, porque localizar e corrigir são
 * habilidades diferentes: quem já sabe corrigir mas não sabe localizar passa
 * horas mexendo na linha errada.
 *
 * E o tipo existe principalmente por uma distinção que a aula de erros ensina e
 * nenhum exercício cobrava: **a linha onde o erro aparece quase nunca é a linha
 * onde o defeito está**. Por isso o exercício declara também a linha do sintoma
 * — a resposta que quase todo mundo dá primeiro — e responde a ela com um
 * retorno próprio, em vez de um "errado" sem explicação.
 */
export interface FindBugExercise extends ExerciseBase {
  type: 'find-bug';
  code: string;
  /** Linha (1-indexada) que **contém** o defeito. */
  buggyLine: number;
  /**
   * A linha corrigida.
   *
   * O CI troca esta linha pela declarada e roda o programa: é a única forma de
   * provar que o número da linha está certo, e um engano de uma linha aqui
   * tornaria o exercício impossível sem nada denunciar.
   */
  fix: string;
  /** Linha onde o erro **aparece**, quando é diferente da causa. */
  symptomLine?: number;
  /** Retorno para quem escolhe a linha do sintoma. Obrigatório quando ela existe. */
  symptomFeedback?: string;
  explanation: string;
}

/** Uma exigência sobre a **forma** do código, não sobre o que ele faz. */
export interface RefactorConstraint {
  /** O que se pede, em uma frase. É o que o aluno lê na lista. */
  description: string;
  /** Trecho que o código **não** pode conter. Busca literal. */
  forbidden?: string;
  /** Trecho que o código **precisa** conter. Busca literal. */
  required?: string;
  /** Teto de linhas de código, sem contar brancos nem comentários. */
  maxLines?: number;
}

/**
 * Melhora a forma de um código que já funciona.
 *
 * O exercício de código pergunta "funciona?". Este pergunta a seguinte:
 * **continua funcionando depois de você melhorar a forma?**
 *
 * É a única maneira de ensinar que código que funciona não é código pronto — e,
 * mais que isso, de ensinar a disciplina do refatoramento: os testes são o
 * contrato do comportamento, e mexer na forma não pode mudar nenhum deles. O
 * aluno recebe um código que já passa em tudo, e precisa continuar passando.
 */
export interface RefactorExercise extends ExerciseBase {
  type: 'refactor';
  /** Código que já funciona, e que o aluno vai reescrever. */
  initialCode: string;
  /** O contrato do comportamento. Precisa continuar passando depois da reescrita. */
  tests: TestCase[];
  properties?: ExerciseProperty[];
  constraints: RefactorConstraint[];
  explanation: string;
  solution?: string;
}

/**
 * Uma verificação de exercício de SQL.
 *
 * O julgamento é sempre o mesmo: dois bancos iguais, um recebe o SQL do aluno
 * e o outro o de referência, e uma consulta rodada nos dois precisa devolver
 * as mesmas linhas. Sem `query`, a consulta é o próprio SQL do aluno — o caso
 * comum, "escreva o SELECT". Com `query`, é uma consulta do exercício sobre o
 * que o aluno deixou no banco — o caso da escrita: "insira o cliente" vira
 * `SELECT nome, cidade FROM clientes`, e as linhas precisam bater.
 *
 * Comparar linhas, e não o texto do SQL, é o que permite aceitar qualquer
 * consulta certa: `preco > 100` ou `100 < preco`, com ou sem apelido.
 */
export interface SqlTest {
  /** Frase que o aluno lê quando a verificação passa. Precisa ser específica. */
  description: string;
  /** Consulta rodada nos dois bancos depois do SQL do aluno / de referência. */
  query?: string;
  /** A ordem das linhas importa. Só quando o enunciado pede ORDER BY. */
  ordered?: boolean;
  /** Os nomes das colunas também precisam bater. Só quando o enunciado pede o apelido. */
  columns?: boolean;
  hidden?: boolean;
}

/**
 * Escreve SQL contra um banco de exemplo, e as linhas devolvidas precisam ser
 * as certas.
 *
 * O banco vem de `src/content/bancos/` e é recriado a cada execução: o aluno
 * pode apagar tudo que o próximo "Executar" encontra o banco inteiro de novo.
 * `setup` é o que o exercício acrescenta antes do aluno — uma tabela vazia
 * para preencher, um índice, uma linha a mais.
 */
export interface SqlExercise extends ExerciseBase {
  type: 'sql';
  /** Id do banco de exemplo. */
  database: string;
  /** SQL rodado depois do banco e antes do aluno. */
  setup?: string;
  initialCode: string;
  tests: SqlTest[];
  /** O SQL de referência: é ele que produz as linhas esperadas. Obrigatório. */
  solution: string;
}

/**
 * União discriminada por `type`. Acrescentar um tipo novo (arrastar e soltar,
 * completar um diagrama…) é estender esta união — nenhuma página precisa saber
 * de todos os tipos, só dos que renderiza (§315).
 */
/**
 * Escreve um servidor e ele responde a pedidos.
 *
 * O código é o de um Express de verdade (`require('express')`, `app.get`,
 * `res.json`…), e roda no servidor simulado (`servidor-core.ts`): nenhuma
 * porta abre, mas cada `pedir(app, 'GET', '/rota')` dos testes passa pelas
 * rotas do aluno e devolve status e corpo. Os testes rodam em série, porque
 * um servidor tem estado — o POST de um é o GET do seguinte.
 */
export interface ServerExercise extends ExerciseBase {
  type: 'server';
  initialCode: string;
  /** JavaScript no escopo do aluno, com `pedir(app, método, caminho, opções)` à mão. */
  tests: TestCase[];
  /** `process.env` do exercício. */
  env?: Record<string, string>;
  /** Arquivos que `require('./nome')` encontra: caminho → código. */
  arquivos?: Record<string, string>;
  /**
   * Onde o arquivo do aluno mora no projeto, para o `require` relativo dele
   * resolver a partir dali — `'./precos/index'` faz `require('./total')`
   * achar `'./precos/total'`. Padrão: a raiz (`'./servidor'`). A tela mostra
   * o caminho acima do editor quando ele é declarado.
   */
  caminho?: string;
  /**
   * O banco do exercício: o SQL que cria as tabelas e os dados iniciais. Com
   * ele, `require('./banco')` existe no servidor do aluno — o SQLite do motor
   * de SQL dentro do mesmo worker, com `consultar` e `executar` assíncronos
   * — e a tela mostra as tabelas depois do programa rodar.
   */
  banco?: string;
  /** Solução de referência. Obrigatória: é ela que prova que o exercício é resolvível. */
  solution: string;
}

export type Exercise =
  | CodeExercise
  | FillBlankExercise
  | FindBugExercise
  | MultipleChoiceExercise
  | OrderStepsExercise
  | PredictOutputExercise
  | RefactorExercise
  | ServerExercise
  | SqlExercise
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

/**
 * Um bloco temático dentro da trilha.
 *
 * Uma trilha de 26 aulas lida como uma lista só é uma parede: a pessoa não
 * sabe onde está nem o que vem depois. As seções dão nome ao terreno — "HTML e
 * CSS", "DOM e eventos", "UI e UX" — e cada uma é curta o bastante para caber
 * numa tela. Juntas, na ordem, elas cobrem exatamente `lessonIds`.
 */
export interface TrackSection {
  title: string;
  /** O que o bloco ensina, em uma frase. */
  description: string;
  lessonIds: string[];
}

export interface Track {
  id: string;
  title: string;
  description: string;
  language: LanguageId;
  /** Ordem pedagógica das aulas. É esta lista que define "próxima aula". */
  lessonIds: string[];
  /**
   * Os blocos da trilha, na ordem. Opcional: uma trilha curta é um bloco só.
   * Quando existe, a concatenação dos `lessonIds` das seções é igual a
   * `lessonIds` — o catálogo confere na carga.
   */
  sections?: TrackSection[];
  status: ContentStatus;
}

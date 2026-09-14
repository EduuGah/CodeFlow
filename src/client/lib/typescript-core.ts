/**
 * Núcleo do motor de TypeScript — a parte que não depende de onde o
 * compilador roda.
 *
 * O código do aluno em TypeScript passa por dois passos antes do sandbox:
 * o **verificador de tipos** (que recusa o programa quando um tipo não bate)
 * e o **transpilador** (que apaga as anotações e devolve JavaScript). O
 * JavaScript que sai daqui entra no mesmo Web Worker dos exercícios de
 * JavaScript: o motor novo é só o passo da frente.
 *
 * O compilador existe em dois lugares, e os dois precisam concordar:
 *
 * - no navegador, é o worker de TypeScript que o Monaco já carrega para
 *   sublinhar erros no editor (`typescript.ts`). Reaproveitá-lo custa zero
 *   bytes a mais — o pacote `typescript` inteiro são 9 MB, e baixá-lo duas
 *   vezes seria o erro mais caro desta fase;
 * - no CI, é o pacote `typescript` do Node (`typescript-node.ts`), que
 *   compila cada exercício do catálogo sem navegador.
 *
 * Este módulo é o contrato entre os dois: as opções do compilador, o que o
 * sandbox declara existir, o formato dos erros e a tradução deles. É puro de
 * propósito, como o `sandbox-core` e o `pagina-core`.
 */

/**
 * As opções do compilador, as mesmas nos dois lados.
 *
 * Os valores numéricos são os das enumerações do TypeScript (`ScriptTarget`,
 * `ModuleKind`), que o Monaco copia com os mesmos números. Ficam como número
 * porque este módulo não pode importar nem o `typescript` (pesado, e o
 * navegador não o tem) nem o Monaco (o Node não o tem). Um teste confere
 * que os números batem com as enumerações de verdade.
 *
 * - `strict`: é o modo que ensina. Sem ele, `function f(x)` compila com `x`
 *   como `any`, e a aula de tipos não teria o que mostrar.
 * - `target` ES2020: o mesmo que o sandbox executa; o transpilador não
 *   precisa reescrever `async`, `?.` nem `??`.
 * - `module` None: o código do aluno é um programa, não um módulo. `import`
 *   vira erro de compilação em vez de erro de execução obscuro no worker.
 * - `lib` só ES2020: o sandbox não tem DOM, então `document` é recusado
 *   pelo compilador — em vez de compilar e explodir com `ReferenceError`. O
 *   que o sandbox tem de fato (`console`, temporizadores) está declarado
 *   em `DECLARACOES_DO_SANDBOX`.
 */
export const OPCOES_DO_COMPILADOR = {
  strict: true,
  /** `ScriptTarget.ES2020` */
  target: 7,
  /** `ModuleKind.None` */
  module: 0,
  lib: ['lib.es2020.d.ts'],
  /**
   * O sandbox roda o código como corpo de função, e o próprio `buildProgram`
   * já abre com `"use strict"`. Sem esta opção o `strict` acrescentaria um
   * segundo prólogo — inofensivo, mas ruído no JavaScript gerado.
   */
  alwaysStrict: false,
  noEmitOnError: false,
  /** O JavaScript gerado é executado, nunca lido; sem comentários ele fica menor. */
  removeComments: true,
} as const;

/**
 * O que existe dentro do sandbox, declarado para o compilador.
 *
 * Com `lib` só de ES2020, `console` não existe para o TypeScript — ele mora
 * na `lib.dom`. Trazer a `lib.dom` inteira mentiria: `document` compilaria e
 * quebraria em execução. Então o sandbox declara exatamente o que oferece.
 * Se o worker ganhar um global novo, ele entra aqui, e em mais lugar nenhum.
 */
export const DECLARACOES_DO_SANDBOX = `
declare var console: {
  log(...dados: unknown[]): void;
  info(...dados: unknown[]): void;
  warn(...dados: unknown[]): void;
  error(...dados: unknown[]): void;
};
declare function setTimeout(funcao: (...args: any[]) => void, ms?: number, ...args: any[]): number;
declare function clearTimeout(id: number | undefined): void;
declare function setInterval(funcao: (...args: any[]) => void, ms?: number, ...args: any[]): number;
declare function clearInterval(id: number | undefined): void;
declare function queueMicrotask(funcao: () => void): void;
declare function structuredClone<T>(valor: T): T;
`;

/** Nome que o arquivo de declarações recebe nos dois compiladores. */
export const ARQUIVO_DE_DECLARACOES = 'codeflow-sandbox.d.ts';

/** Um erro do compilador, já com linha e coluna para o aluno. */
export interface ErroDeCompilacao {
  /** Linha 1-indexada no código do aluno. */
  linha: number;
  coluna: number;
  /** Código numérico do TypeScript (TS2322, por exemplo). */
  codigo: number;
  /** A mensagem original, em inglês — é a que o aluno vai encontrar fora daqui. */
  mensagem: string;
  /** A explicação em português, quando o erro é um dos que a plataforma conhece. */
  explicacao?: string;
}

export interface Compilacao {
  /** O JavaScript gerado. Vazio quando há erros. */
  js: string;
  erros: ErroDeCompilacao[];
}

/** Uma função que compila TypeScript — a do Monaco ou a do Node. */
export type Compilador = (codigo: string) => Promise<Compilacao>;

/**
 * Um trecho que o compilador precisa aceitar ou recusar, depois do código
 * do aluno.
 *
 * É o teste que só TypeScript permite: o exercício pede um tipo que **impeça**
 * o uso errado, e a única forma de verificar é tentar o uso errado e cobrar a
 * recusa. Um teste de comportamento não vê isso — `somar('a', 1)` roda igual
 * em JavaScript.
 */
export interface TrechoDeTipo {
  /** O que o trecho prova, na frase que o aluno lê. */
  description: string;
  /** TypeScript acrescentado ao fim do código do aluno. */
  code: string;
  /** `true` quando o compilador precisa **recusar** o trecho. Padrão: precisa aceitar. */
  rejects?: boolean;
}

export interface ResultadoDeTrecho {
  passed: boolean;
  message: string;
}

/**
 * As mensagens que o aluno vai encontrar com mais frequência, explicadas.
 *
 * A mensagem original fica — é a que aparece em qualquer editor do mundo, e
 * a aula sobre erros do compilador ensina a lê-la. A explicação vem ao lado,
 * na língua da aula, e usa os nomes e tipos que a mensagem traz.
 *
 * Cada entrada casa o texto da mensagem para pescar os tipos entre aspas
 * simples (o TypeScript sempre os cita assim). Quando a mensagem tem um
 * formato que a expressão não previu, vale a explicação genérica do código.
 */
const EXPLICACOES: Record<number, Array<[RegExp, (...grupos: string[]) => string]>> = {
  2322: [
    [
      /^Type '(.+)' is not assignable to type '(.+)'\.$/,
      (de, para) => `Um valor do tipo ${de} não cabe onde se espera ${para}.`,
    ],
    [/./, () => 'O valor é de um tipo, e o lugar onde ele foi posto espera outro.'],
  ],
  2345: [
    [
      /^Argument of type '(.+)' is not assignable to parameter of type '(.+)'\.$/,
      (de, para) => `O argumento é ${de}, e o parâmetro da função pede ${para}.`,
    ],
    [/./, () => 'O argumento passado não é do tipo que a função pede.'],
  ],
  2339: [
    [
      /^Property '(.+)' does not exist on type '(.+)'\.$/,
      (prop, tipo) => `O tipo ${tipo} não tem a propriedade ${prop}.`,
    ],
    [/./, () => 'O objeto não tem essa propriedade, segundo o tipo dele.'],
  ],
  2551: [
    [
      /^Property '(.+)' does not exist on type '(.+)'\. Did you mean '(.+)'\?$/,
      (prop, tipo, sugestao) => `O tipo ${tipo} não tem ${prop}. Você quis dizer ${sugestao}?`,
    ],
    [/./, () => 'A propriedade não existe; o compilador sugere uma parecida.'],
  ],
  2304: [
    [
      /^Cannot find name '(.+)'\.$/,
      (nome) =>
        `O nome ${nome} não existe aqui. Pode ser erro de digitação, uma variável declarada em outro lugar — ou algo que o sandbox não tem, como o DOM.`,
    ],
    [/./, () => 'O nome não existe neste programa.'],
  ],
  2552: [
    [
      /^Cannot find name '(.+)'\. Did you mean '(.+)'\?$/,
      (nome, sugestao) => `O nome ${nome} não existe. Você quis dizer ${sugestao}?`,
    ],
    [/./, () => 'O nome não existe; o compilador sugere um parecido.'],
  ],
  7006: [
    [
      /^Parameter '(.+)' implicitly has an 'any' type\.$/,
      (nome) =>
        `O parâmetro ${nome} está sem tipo, e o modo estrito não deixa o compilador chutar. Declare: ${nome}: tipo.`,
    ],
    [/./, () => 'Um parâmetro ficou sem tipo declarado.'],
  ],
  7031: [
    [
      /^Binding element '(.+)' implicitly has an 'any' type\.$/,
      (nome) => `O ${nome} desestruturado está sem tipo. Declare o tipo do objeto ou do parâmetro inteiro.`,
    ],
    [/./, () => 'Um elemento desestruturado ficou sem tipo.'],
  ],
  7034: [
    [
      /^Variable '(.+)' implicitly has type '(.+)' in some locations/,
      (nome) => `A variável ${nome} foi declarada sem valor nem tipo, e o compilador não consegue deduzir o que ela guarda.`,
    ],
    [/./, () => 'Uma variável ficou sem tipo em parte do programa.'],
  ],
  7005: [
    [
      /^Variable '(.+)' implicitly has an '(.+)' type\.$/,
      (nome) => `A variável ${nome} está sem tipo. Dê um valor inicial ou declare o tipo.`,
    ],
    [/./, () => 'Uma variável ficou sem tipo.'],
  ],
  18048: [
    [
      /^'(.+)' is possibly 'undefined'\.$/,
      (nome) => `${nome} pode ser undefined neste ponto. Confira antes de usar (um if, ou ?.).`,
    ],
    [/./, () => 'O valor pode ser undefined aqui.'],
  ],
  18047: [
    [
      /^'(.+)' is possibly 'null'\.$/,
      (nome) => `${nome} pode ser null neste ponto. Confira antes de usar.`,
    ],
    [/./, () => 'O valor pode ser null aqui.'],
  ],
  2532: [[/./, () => 'O objeto pode ser undefined neste ponto. Confira antes de usar.']],
  2531: [[/./, () => 'O objeto pode ser null neste ponto. Confira antes de usar.']],
  2554: [
    [
      /^Expected (\d+) arguments?, but got (\d+)\.$/,
      (esperado, recebido) => `A função pede ${esperado} argumento(s) e recebeu ${recebido}.`,
    ],
    [/./, () => 'A quantidade de argumentos não é a que a função pede.'],
  ],
  2555: [
    [
      /^Expected at least (\d+) arguments?, but got (\d+)\.$/,
      (esperado, recebido) => `A função pede pelo menos ${esperado} argumento(s) e recebeu ${recebido}.`,
    ],
    [/./, () => 'Faltam argumentos na chamada.'],
  ],
  2741: [
    [
      /^Property '(.+)' is missing in type '(.+)' but required in type '(.+)'\.$/,
      (prop, de, para) => `Falta a propriedade ${prop}: ${para} exige, e ${de} não tem.`,
    ],
    [/./, () => 'Falta uma propriedade obrigatória.'],
  ],
  2739: [
    [
      /^Type '(.+)' is missing the following properties from type '(.+)': (.+)$/,
      (_de, para, props) => `Faltam propriedades que ${para} exige: ${props}.`,
    ],
    [/./, () => 'Faltam propriedades obrigatórias.'],
  ],
  2353: [
    [
      /^Object literal may only specify known properties, and '(.+)' does not exist in type '(.+)'\.$/,
      (prop, tipo) =>
        `${tipo} não tem a propriedade ${prop}. Um objeto escrito na hora não pode ter propriedade a mais — é assim que o compilador pega nome digitado errado.`,
    ],
    [/./, () => 'O objeto tem uma propriedade que o tipo não conhece.'],
  ],
  2561: [
    [
      /^Object literal may only specify known properties, but '(.+)' does not exist in type '(.+)'\. Did you mean to write '(.+)'\?$/,
      (prop, tipo, sugestao) => `${tipo} não tem a propriedade ${prop}. Você quis escrever ${sugestao}?`,
    ],
    [/./, () => 'O objeto tem uma propriedade que o tipo não conhece; o compilador sugere uma parecida.'],
  ],
  18046: [
    [
      /^'(.+)' is of type 'unknown'\.$/,
      (nome) => `${nome} é unknown: o compilador não deixa usar sem antes estreitar (typeof, instanceof, uma verificação).`,
    ],
    [/./, () => 'O valor é unknown: estreite o tipo antes de usar.'],
  ],
  2367: [
    [
      /^This comparison appears to be unintentional because the types '(.+)' and '(.+)' have no overlap\.$/,
      (a, b) => `Comparar ${a} com ${b} nunca dá verdadeiro: os dois tipos não têm valor em comum.`,
    ],
    [/./, () => 'A comparação é entre tipos que nunca coincidem.'],
  ],
  2540: [
    [
      /^Cannot assign to '(.+)' because it is a read-only property\.$/,
      (prop) => `${prop} é somente leitura (readonly): não dá para atribuir depois de criado.`,
    ],
    [/./, () => 'A propriedade é somente leitura.'],
  ],
  2588: [
    [
      /^Cannot assign to '(.+)' because it is a constant\.$/,
      (nome) => `${nome} é const: não pode receber outro valor.`,
    ],
    [/./, () => 'Uma constante não pode receber outro valor.'],
  ],
  2349: [[/./, () => 'Isso não é uma função — não dá para chamar com parênteses.']],
  2571: [
    [/./, () => 'O valor é unknown: estreite o tipo (typeof, instanceof, uma verificação) antes de usar.'],
  ],
  2355: [
    [/./, () => 'A função promete devolver um valor, e há um caminho em que ela termina sem return.'],
  ],
  2366: [
    [/./, () => 'A função promete devolver um valor, e há um caminho em que ela termina sem return.'],
  ],
  2769: [[/./, () => 'Nenhuma das assinaturas da função aceita esses argumentos.']],
  2362: [[/./, () => 'Só número entra em conta, e o lado esquerdo é de outro tipo.']],
  2363: [[/./, () => 'Só número entra em conta, e o lado direito é de outro tipo.']],
  2365: [
    [
      /^Operator '(.+)' cannot be applied to types '(.+)' and '(.+)'\.$/,
      (op, a, b) => `O operador ${op} não vale entre ${a} e ${b}.`,
    ],
    [/./, () => 'O operador não vale entre esses dois tipos.'],
  ],
  2451: [
    [
      /^Cannot redeclare block-scoped variable '(.+)'\.$/,
      (nome) => `${nome} já foi declarada neste escopo.`,
    ],
    [/./, () => 'A variável já foi declarada.'],
  ],
  2300: [
    [/^Duplicate identifier '(.+)'\.$/, (nome) => `O nome ${nome} está declarado duas vezes.`],
    [/./, () => 'Um nome está declarado duas vezes.'],
  ],
  2454: [
    [
      /^Variable '(.+)' is used before being assigned\.$/,
      (nome) => `${nome} é usada antes de receber valor.`,
    ],
    [/./, () => 'A variável é usada antes de receber valor.'],
  ],
  2564: [
    [
      /^Property '(.+)' has no initializer and is not definitely assigned in the constructor\.$/,
      (prop) => `A propriedade ${prop} não recebe valor nem na declaração nem no construtor.`,
    ],
    [/./, () => 'Uma propriedade da classe nunca recebe valor.'],
  ],
  2420: [
    [
      /^Class '(.+)' incorrectly implements interface '(.+)'\./,
      (classe, interface_) => `A classe ${classe} não cumpre tudo o que a interface ${interface_} pede.`,
    ],
    [/./, () => 'A classe não cumpre a interface que declara.'],
  ],
  2820: [
    [
      /^Type '(.+)' is not assignable to type '(.+)'\. Did you mean '(.+)'\?$/,
      (de, para, sugestao) => `${de} não está entre as opções de ${para}. Você quis dizer ${sugestao}?`,
    ],
    [/./, () => 'O valor não está entre as opções permitidas.'],
  ],
  7053: [
    [
      /can't be used to index type '(.+)'\.$/,
      (tipo) => `${tipo} não aceita essa chave. Tipe a chave, ou dê ao objeto um tipo com índice.`,
    ],
    [/./, () => 'O objeto não aceita essa chave.'],
  ],
  1005: [[/^'(.+)' expected\.$/, (token) => `Faltou ${token}.`], [/./, () => 'Faltou um símbolo.']],
  1109: [[/./, () => 'O compilador esperava uma expressão aqui.']],
  1128: [[/./, () => 'O compilador esperava uma declaração ou instrução aqui.']],
  1434: [[/./, () => 'Uma palavra fora do lugar — provavelmente falta um símbolo antes dela.']],
  1003: [[/./, () => 'O compilador esperava um nome aqui.']],
  1002: [[/./, () => 'Uma string ficou sem fechar.']],
  1160: [[/./, () => 'Um template literal (crase) ficou sem fechar.']],
  2503: [[/^Cannot find namespace '(.+)'\.$/, (n) => `O espaço de nomes ${n} não existe.`]],
  2792: [[/./, () => 'Módulos não existem no sandbox: o exercício é um programa só, sem import.']],
  1148: [[/./, () => 'Módulos não existem no sandbox: o exercício é um programa só, sem import nem export.']],
  2307: [[/./, () => 'Módulos não existem no sandbox: o exercício é um programa só, sem import.']],
  2583: [
    [
      /^Cannot find name '(.+)'\. Do you need to change your target library\?/,
      (nome) => `${nome} não existe no sandbox, que é JavaScript puro sem DOM.`,
    ],
    [/./, () => 'Esse nome não existe no sandbox.'],
  ],
  2584: [
    [
      /^Cannot find name '(.+)'\. Do you need to change your target library\?/,
      (nome) => `${nome} não existe no sandbox, que não tem DOM.`,
    ],
    [/./, () => 'Esse nome não existe no sandbox, que não tem DOM.'],
  ],
};

/** A explicação em português de um erro, quando ele é conhecido. */
export function explicarErro(codigo: number, mensagem: string): string | undefined {
  const opcoes = EXPLICACOES[codigo];
  if (!opcoes) return undefined;

  for (const [padrao, explicar] of opcoes) {
    const casou = mensagem.match(padrao);
    if (casou) return explicar(...casou.slice(1));
  }
  return undefined;
}

/**
 * Achata a cadeia de mensagens do TypeScript numa linha só.
 *
 * O compilador devolve uma árvore ("Type A is not assignable to type B." →
 * "Types of property 'x' are incompatible." → …). A primeira frase é o
 * resumo; as seguintes são o caminho até o detalhe. Ficam separadas por
 * seta, com a primeira sempre presente — é ela que as explicações casam.
 */
export function achatarMensagem(
  texto: string | { messageText: string; next?: unknown[] },
  limite = 3
): string {
  if (typeof texto === 'string') return texto;

  type Cadeia = { messageText: string; next?: unknown[] };
  const partes: string[] = [];
  let atual: Cadeia | undefined = texto;
  while (atual && partes.length < limite) {
    partes.push(atual.messageText);
    const proximo: unknown = atual.next?.[0];
    atual =
      proximo && typeof proximo === 'object' && 'messageText' in proximo
        ? (proximo as Cadeia)
        : undefined;
  }
  return partes.join(' → ');
}

/** Linha e coluna (1-indexadas) de um deslocamento no texto. */
export function posicaoNoTexto(texto: string, deslocamento: number): { linha: number; coluna: number } {
  const antes = texto.slice(0, Math.max(0, Math.min(deslocamento, texto.length)));
  const linhas = antes.split('\n');
  return { linha: linhas.length, coluna: linhas[linhas.length - 1].length + 1 };
}

/** Monta um erro a partir do que os dois compiladores devolvem em comum. */
export function montarErro(
  codigo: string,
  diagnostico: { code: number; start?: number; messageText: string | { messageText: string; next?: unknown[] } }
): ErroDeCompilacao {
  const mensagem = achatarMensagem(diagnostico.messageText);
  const primeira = mensagem.split(' → ')[0];
  const { linha, coluna } = posicaoNoTexto(codigo, diagnostico.start ?? 0);
  return {
    linha,
    coluna,
    codigo: diagnostico.code,
    mensagem,
    explicacao: explicarErro(diagnostico.code, primeira),
  };
}

/**
 * O texto que o aluno lê quando o compilador recusa o programa.
 *
 * Um erro por linha, com a linha do código na frente — é o que ele precisa
 * para achar o lugar — e a explicação em português quando existe.
 */
export function formatarErros(erros: ErroDeCompilacao[]): string {
  const linhas = erros.map((erro) => {
    const explicacao = erro.explicacao ? ` — ${erro.explicacao}` : '';
    return `Linha ${erro.linha}: ${erro.mensagem}${explicacao}`;
  });
  const cabecalho =
    erros.length === 1
      ? 'O compilador recusou o programa por 1 erro de tipo:'
      : `O compilador recusou o programa por ${erros.length} erros de tipo:`;
  return [cabecalho, ...linhas].join('\n');
}

/**
 * Verifica os trechos de tipo contra o código do aluno.
 *
 * Cada trecho é compilado **junto** com o código, e o resultado é comparado
 * com o que o exercício espera. Como o código do aluno já compilou sozinho
 * antes de chegar aqui, qualquer erro no conjunto é culpa do encontro entre
 * os dois — que é justamente o que o trecho testa.
 */
export async function verificarTrechos(
  compilar: Compilador,
  codigo: string,
  trechos: TrechoDeTipo[]
): Promise<ResultadoDeTrecho[]> {
  const resultados: ResultadoDeTrecho[] = [];

  for (const trecho of trechos) {
    const { erros } = await compilar(`${codigo}\n${trecho.code}`);
    const recusou = erros.length > 0;

    if (trecho.rejects) {
      resultados.push(
        recusou
          ? { passed: true, message: trecho.description }
          : {
              passed: false,
              message: `${trecho.description} — mas o compilador aceitou. O tipo ainda deixa esse uso passar.`,
            }
      );
    } else {
      const primeiro = erros[0];
      resultados.push(
        recusou
          ? {
              passed: false,
              message: `${trecho.description} — mas o compilador recusou: ${primeiro.mensagem}${
                primeiro.explicacao ? ` (${primeiro.explicacao})` : ''
              }`,
            }
          : { passed: true, message: trecho.description }
      );
    }
  }

  return resultados;
}

import type { SandboxTest, SandboxTestResult } from './sandbox-core';
import { EXECUTION_TIMEOUT_MS } from './sandbox';

/**
 * Núcleo de execução do motor de Python (motor 6, Pyodide).
 *
 * Puro como `sandbox-core.ts` e `sql-core.ts`: não sabe de Worker, DOM, nem de
 * como o Pyodide chegou até aqui — só recebe um `Interprete` já pronto. Isso
 * deixa o worker do navegador e o carregador do Node (`python-node.ts`)
 * chamarem exatamente este código, sem duplicar a montagem do programa nem a
 * tradução dos erros.
 *
 * A diferença mais importante para quem já conhece `sql-core.ts`: recriar um
 * banco custa microssegundos (`new SQL.Database()`), mas recarregar o Pyodide
 * custa segundos — os ~10 MB de WebAssembly e a biblioteca padrão. Por isso o
 * motor de Python reaproveita **um** intérprete entre execuções (aquecido uma
 * vez, como o SQL) e isola cada execução com um dicionário de globais **novo**,
 * em vez de recriar o intérprete inteiro. `pyodide.globals.get('dict')()` cria
 * esse dicionário vazio — com os `builtins` (print, len, range…) já visíveis,
 * porque eles vêm do intérprete, não do dicionário — e uma variável de uma
 * execução nunca vaza para a próxima.
 */

/** A frase que aparece na tela dividida por "traceback" e "linha final". */
export interface ErroDePython {
  /** O nome da classe da exceção: 'NameError', 'AssertionError', 'SyntaxError'… */
  type: string;
  /** O traceback inteiro que o Pyodide devolve, terminando em "Tipo: mensagem". */
  message: string;
}

/**
 * O que este módulo pede do Pyodide — a superfície mínima, para não importar
 * o pacote aqui (ele pesa ~10 MB só de tipos e nunca precisa rodar no Node
 * fora de teste). `python-node.ts` e o worker do navegador passam a instância
 * de verdade; ela satisfaz esta interface sem adaptação.
 */
export interface Interprete {
  runPython(codigo: string, opcoes?: { globals?: DicionarioPython }): unknown;
  globals: { get(nome: string): unknown };
  setStdout(opcoes: { batched: (saida: string) => void }): void;
}

/** Um dicionário Python vivo do lado do JavaScript — o que `dict()` devolve. */
export interface DicionarioPython {
  destroy(): void;
}

export interface ExecucaoPython {
  code: string;
  tests: SandboxTest[];
}

export interface ResultadoPython {
  logs: string[];
  testResults: SandboxTestResult[];
  error?: string;
  /** Só o cliente do navegador preenche: uma execução interrompida por prazo. */
  timedOut?: boolean;
}

/** Indenta cada linha não vazia em 4 espaços — o corpo de um `def`. */
function indentar(codigo: string): string {
  return codigo
    .split('\n')
    .map((linha) => (linha.trim() === '' ? '' : '    ' + linha))
    .join('\n');
}

/**
 * Monta o programa Python inteiro: o código do aluno, uma função por teste
 * (o corpo é a asserção, indentada), e um laço que roda cada uma, pegando a
 * exceção em vez de deixá-la subir — do jeito que `buildProgram`, em
 * `sandbox-core.ts`, monta o equivalente em JavaScript. A última linha é uma
 * chamada a `json.dumps(...)`: o valor de retorno de `runPython` é o valor da
 * última expressão, e ir e voltar por JSON evita lidar com a conversão de
 * `PyProxy` para objeto JavaScript.
 *
 * Tudo — o código do aluno incluído — roda dentro de um `try/finally` com um
 * `sys.settrace` armado: a cada linha executada, ele confere o relógio, e
 * lança `TimeoutError` se estourar `EXECUTION_TIMEOUT_MS`. Isso existe porque,
 * ao contrário do worker do navegador (`python.ts`), que interrompe um laço
 * sem fim de fora, com `worker.terminate()`, o carregador do Node
 * (`python-node.ts`) roda `runPython` de forma síncrona e bloqueante, sem
 * jeito de interromper de fora — um laço sem condição de parada travaria o
 * processo para sempre. O relógio embutido no próprio programa Python resolve
 * os dois lados com o mesmo código, sem depender de quem chamou.
 */
export function montarPrograma(code: string, tests: SandboxTest[]): string {
  const definicoes = tests
    .map((teste, indice) => `def __cf_teste_${indice}():\n${indentar(teste.assertion)}`)
    .join('\n\n');

  const entradas = tests
    .map((teste, indice) => `(${JSON.stringify(teste.description)}, __cf_teste_${indice})`)
    .join(', ');

  const corpo = `${code}

${definicoes}

__cf_testes = [${entradas}]
for __cf_desc, __cf_fn in __cf_testes:
    try:
        __cf_fn()
        __cf_resultados.append({"passed": True, "message": __cf_desc})
    except Exception as __cf_e:
        __cf_msg = str(__cf_e) if str(__cf_e) else type(__cf_e).__name__
        __cf_resultados.append({"passed": False, "message": __cf_msg})`;

  return `import sys as __cf_sys
import time as __cf_time
import json as __cf_json

__cf_inicio = __cf_time.time()
__cf_limite_segundos = ${EXECUTION_TIMEOUT_MS / 1000}

def __cf_watchdog(frame, event, arg):
    if __cf_time.time() - __cf_inicio > __cf_limite_segundos:
        raise TimeoutError('passou de ' + str(__cf_limite_segundos) + ' segundos')
    return __cf_watchdog

__cf_resultados = []
__cf_sys.settrace(__cf_watchdog)
__cf_sys._getframe().f_trace = __cf_watchdog
try:
${indentar(corpo)}
finally:
    __cf_sys.settrace(None)

__cf_json.dumps(__cf_resultados)`;
}

/**
 * Traduz o erro do Pyodide para uma frase que ensina, não que assusta.
 *
 * `erro.type` já vem limpo (o nome da classe); `erro.message` é o traceback
 * inteiro, e a última linha não vazia é a que interessa — "TypeError: não dá
 * pra somar texto com número", por exemplo. Como o Python nomeia bem as
 * próprias exceções, a tradução aqui é mais enxuta que `traduzirErroSql`: na
 * maioria dos casos, o nome do tipo já é a lição.
 */
export function traduzirErroPython(erro: ErroDePython): string {
  const linhas = erro.message.trim().split('\n');
  const ultima = linhas[linhas.length - 1] ?? erro.message;
  // "NomeDoErro: mensagem" ou só "NomeDoErro" quando a exceção não levou texto.
  const doisPontos = ultima.indexOf(':');
  const detalhe = doisPontos === -1 ? '' : ultima.slice(doisPontos + 1).trim();

  switch (erro.type) {
    case 'SyntaxError':
      return `O Python não conseguiu ler o código: ${detalhe || 'a sintaxe está incorreta'}. Confira parênteses, dois-pontos no fim de \`if\`/\`for\`/\`def\`, e aspas fechadas.`;
    case 'IndentationError':
      return `A indentação está inconsistente: ${detalhe || 'linhas no mesmo bloco precisam do mesmo recuo'}. Python usa a indentação para saber o que pertence a um bloco — misturar espaços diferentes na mesma função é o erro mais comum.`;
    case 'NameError':
      return `${detalhe || 'um nome usado não foi definido antes'}. Confira a grafia, e se a variável ou função foi criada antes desta linha rodar.`;
    case 'TypeError':
      return `TypeError: ${detalhe || 'a operação não vale para esses tipos'}. Confira o tipo de cada valor envolvido — \`type(x)\` no meio do código ajuda a descobrir.`;
    case 'ZeroDivisionError':
      return 'Divisão por zero. Confira se o divisor pode ser zero antes de dividir.';
    case 'IndexError':
      return `${detalhe || 'um índice está fora do tamanho da lista'}. Lembre que o último item de uma lista de tamanho N está no índice N-1.`;
    case 'KeyError':
      return `A chave ${detalhe || 'usada'} não existe no dicionário. Confira a grafia da chave, ou use \`.get(chave)\` para um padrão em vez de lançar.`;
    case 'AttributeError':
      return `AttributeError: ${detalhe || 'esse valor não tem esse atributo ou método'}. Confira o tipo do valor — um erro comum é tratar uma lista como se fosse um dicionário, ou o contrário.`;
    case 'ValueError':
      return `ValueError: ${detalhe || 'o valor não serve para essa operação'}.`;
    case 'ModuleNotFoundError':
    case 'ImportError':
      return `${detalhe || 'esse módulo não está disponível'}. O Pyodide já traz boa parte da biblioteca padrão do Python, mas não pacotes de fora dela.`;
    case 'RecursionError':
      return 'A função chamou a si mesma sem parar — confira o caso de parada da recursão.';
    case 'TimeoutError':
      return `O código passou de ${EXECUTION_TIMEOUT_MS / 1000} segundos e foi interrompido. Isso costuma ser um laço sem condição de parada, ou uma recursão que nunca chega ao caso base.`;
    case 'AssertionError':
      return detalhe || 'a condição do assert é falsa.';
    default:
      return `${erro.type}: ${detalhe || 'a execução parou com um erro'}.`;
  }
}

/**
 * Roda o código do aluno contra os testes, num dicionário de globais próprio.
 *
 * `logs` captura o `print()` do aluno via `setStdout` — chamado de novo a
 * cada execução porque o retorno de `setStdout` não expõe um jeito de ler o
 * que já foi configurado, então recriar o callback é mais simples que guardar
 * estado à parte.
 */
export function executarPython(interprete: Interprete, execucao: ExecucaoPython): ResultadoPython {
  const logs: string[] = [];
  interprete.setStdout({ batched: (linha) => logs.push(linha) });

  const globais = interprete.globals.get('dict') as () => DicionarioPython;
  const dicionario = globais();

  try {
    const programa = montarPrograma(execucao.code, execucao.tests);
    const resultadoJson = interprete.runPython(programa, { globals: dicionario }) as string;
    const testResults = JSON.parse(resultadoJson) as SandboxTestResult[];
    return { logs, testResults };
  } catch (erro) {
    const pythonError = erro as ErroDePython;
    return {
      logs,
      testResults: [],
      error: traduzirErroPython(pythonError),
      timedOut: pythonError.type === 'TimeoutError',
    };
  } finally {
    dicionario.destroy();
  }
}

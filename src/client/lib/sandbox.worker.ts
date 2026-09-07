/// <reference lib="webworker" />

/**
 * Worker de execução de código do aluno.
 *
 * Roda numa thread separada, sem acesso ao DOM. Isso garante três coisas que a
 * execução na thread principal não garantia:
 *  1. Um laço infinito não congela a interface — a thread principal continua viva
 *     e consegue chamar terminate().
 *  2. O código do aluno não alcança document, window, localStorage nem os
 *     componentes React.
 *  3. Cada execução usa um worker novo, então nada vaza de uma rodada para a outra.
 */

export interface WorkerRequest {
  code: string;
  tests: string[];
}

export interface WorkerTestResult {
  passed: boolean;
  message: string;
}

export interface WorkerResponse {
  logs: string[];
  testResults: WorkerTestResult[];
  error?: string;
}

/** Teto de logs: um laço que imprime sem parar não pode estourar a memória da aba. */
const MAX_LOGS = 500;
/** Teto por linha, para um único console.log gigante não travar a renderização. */
const MAX_LOG_LENGTH = 2000;

/**
 * Remove as APIs de rede e persistência do escopo do worker.
 *
 * Não é uma barreira de segurança contra código hostil — para isso o navegador já
 * isola o worker. É uma barreira pedagógica e de privacidade: exercícios não devem
 * conseguir fazer requisições externas nem gravar dados a partir do editor.
 */
function lockDownGlobals(): void {
  const blocked = [
    'fetch',
    'XMLHttpRequest',
    'WebSocket',
    'importScripts',
    'indexedDB',
    'caches',
    'Notification',
  ];

  for (const name of blocked) {
    try {
      Object.defineProperty(self, name, {
        value: undefined,
        configurable: false,
        writable: false,
      });
    } catch {
      // Alguns ambientes não permitem redefinir; seguir mesmo assim.
    }
  }
}

function formatArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  if (arg instanceof Error) return `${arg.name}: ${arg.message}`;

  try {
    return JSON.stringify(arg) ?? String(arg);
  } catch {
    // Referência circular, por exemplo.
    return String(arg);
  }
}

/**
 * Monta um único corpo de função com o código do aluno seguido dos testes.
 *
 * Os testes ficam em funções aninhadas dentro do mesmo escopo, então enxergam as
 * variáveis e funções que o aluno declarou — sem precisar saber os nomes de
 * antemão, como a versão anterior fazia ao extrair `pontuacao` e `jogador` na mão.
 */
function buildProgram(code: string, tests: string[]): string {
  const testExpressions = tests
    .map(
      (test, index) => `
        (function () {
          try {
            ${test}
            return { passed: true, message: ${JSON.stringify(`Teste ${index + 1} passou`)} };
          } catch (err) {
            return { passed: false, message: err && err.message ? err.message : String(err) };
          }
        })()`
    )
    .join(',');

  return `"use strict";
${code}
;return [${testExpressions}];`;
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { code, tests } = event.data;

  lockDownGlobals();

  const logs: string[] = [];
  let truncated = false;

  const capture = (...args: unknown[]) => {
    if (logs.length >= MAX_LOGS) {
      if (!truncated) {
        truncated = true;
        logs.push(`… saída interrompida após ${MAX_LOGS} linhas.`);
      }
      return;
    }

    const line = args.map(formatArg).join(' ');
    logs.push(line.length > MAX_LOG_LENGTH ? `${line.slice(0, MAX_LOG_LENGTH)}…` : line);
  };

  console.log = capture;
  console.info = capture;
  console.warn = capture;
  console.error = capture;

  let response: WorkerResponse;

  try {
    const program = new Function(buildProgram(code, tests));
    const testResults = program() as WorkerTestResult[];
    response = { logs, testResults };
  } catch (error) {
    // Erro de sintaxe (na construção) ou de execução do código do aluno.
    response = {
      logs,
      testResults: [],
      error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    };
  }

  self.postMessage(response);
};

/**
 * Núcleo de execução do código do aluno.
 *
 * Puro de propósito: não depende de Worker, DOM nem de nada do navegador. Isso
 * permite que o worker use este módulo em produção e que os testes automatizados
 * o chamem direto no Node, sem duplicar a lógica de montagem do programa —
 * é exatamente o mesmo código que o aluno vai executar que a suíte verifica.
 *
 * O isolamento (thread separada, timeout, bloqueio de rede) é responsabilidade
 * de quem chama, não daqui.
 */

/** Um teste: o JavaScript que verifica, e a frase que o aluno lê quando passa. */
export interface SandboxTest {
  description: string;
  assertion: string;
}

export interface SandboxTestResult {
  passed: boolean;
  message: string;
}

export interface SandboxRunResult {
  logs: string[];
  testResults: SandboxTestResult[];
  error?: string;
}

/** Teto de logs: um laço que imprime sem parar não pode estourar a memória. */
export const MAX_LOGS = 500;
/** Teto por linha, para um único console.log gigante não travar a renderização. */
export const MAX_LOG_LENGTH = 2000;

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
 * antemão.
 */
export function buildProgram(code: string, tests: SandboxTest[]): string {
  const testExpressions = tests
    .map(
      (test) => `
        (function () {
          try {
            ${test.assertion}
            return { passed: true, message: ${JSON.stringify(test.description)} };
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

/**
 * Executa o código do aluno e roda os testes contra ele.
 *
 * Bloqueia até terminar: um laço infinito só é interrompido por quem chama
 * (no navegador, encerrando o worker). Nunca lança — erro de sintaxe ou de
 * execução volta no campo `error`.
 */
export function runProgram(code: string, tests: SandboxTest[]): SandboxRunResult {
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

  const original = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };

  console.log = capture;
  console.info = capture;
  console.warn = capture;
  console.error = capture;

  try {
    const program = new Function(buildProgram(code, tests));
    const testResults = program() as SandboxTestResult[];
    return { logs, testResults };
  } catch (error) {
    // Erro de sintaxe (na construção) ou de execução do código do aluno.
    return {
      logs,
      testResults: [],
      error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    };
  } finally {
    console.log = original.log;
    console.info = original.info;
    console.warn = original.warn;
    console.error = original.error;
  }
}

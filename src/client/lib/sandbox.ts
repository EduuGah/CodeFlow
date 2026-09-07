import SandboxWorker from './sandbox.worker?worker';
import type { SandboxTest, WorkerRequest, WorkerResponse } from './sandbox.worker';

export type { SandboxTest };

export interface TestResult {
  passed: boolean;
  message: string;
}

export interface ExecutionResult {
  /** Saída completa do console, já unida por quebras de linha. */
  output: string;
  /** Cada chamada de console.log como uma entrada separada. */
  logs: string[];
  testResults: TestResult[];
  error?: string;
  /** true quando a execução estourou o tempo limite e o worker foi encerrado. */
  timedOut?: boolean;
}

/**
 * Tempo máximo de execução. Um laço infinito é um erro comum e esperado de quem
 * está aprendendo repetição — precisa virar uma mensagem didática, não uma aba
 * travada que obriga o aluno a perder o código que escreveu.
 */
export const EXECUTION_TIMEOUT_MS = 3000;

function toResult(response: WorkerResponse): ExecutionResult {
  return {
    output: response.logs.join('\n'),
    logs: response.logs,
    testResults: response.testResults,
    error: response.error,
  };
}

/**
 * Executa o código do aluno num Web Worker descartável e resolve com o resultado.
 *
 * O worker é criado por execução e encerrado ao final — inclusive no caminho de
 * timeout, que é o único jeito de interromper um laço infinito em JavaScript.
 */
export function executeCode(code: string, testCases: SandboxTest[] = []): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    let worker: Worker;

    try {
      worker = new SandboxWorker();
    } catch (error) {
      resolve({
        output: '',
        logs: [],
        testResults: [],
        error: `Não foi possível iniciar o ambiente de execução: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
      return;
    }

    let settled = false;

    const finish = (result: ExecutionResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      resolve(result);
    };

    const timer = setTimeout(() => {
      finish({
        output: '',
        logs: [],
        testResults: [],
        timedOut: true,
        error: `Seu código passou de ${
          EXECUTION_TIMEOUT_MS / 1000
        } segundos e foi interrompido. Isso costuma indicar um laço que nunca termina — verifique se a condição de parada realmente chega a ser falsa.`,
      });
    }, EXECUTION_TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => finish(toResult(event.data));

    worker.onerror = (event) => {
      // Evita que o erro suba para o window.onerror da aplicação.
      event.preventDefault();
      finish({
        output: '',
        logs: [],
        testResults: [],
        error: event.message || 'Erro inesperado ao executar o código.',
      });
    };

    const request: WorkerRequest = { code, tests: testCases };
    worker.postMessage(request);
  });
}

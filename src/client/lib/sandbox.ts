import SandboxWorker from './sandbox.worker?worker';
import ServidorBancoWorker from './servidor-banco.worker?worker';
import type { WorkerRequest, WorkerResponse } from './sandbox.worker';
import type { RetratoDeTabela } from './sql-core';
import type { PedidoAoServidor, RespostaDoServidor, Troca as TrocaDoServidor } from './servidor-core';
import type { MensagemDeServico, RespostaDeServico } from './worker-servico';
import type { SandboxProperty, SandboxTest } from './sandbox-core';
import type { ErroDeCompilacao } from './typescript-core';
import type { Troca } from './servidor-core';

export type { SandboxProperty, SandboxTest };

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
  /**
   * Os erros do compilador, quando o programa é TypeScript e ele o recusou.
   * Nesse caso nada rodou: `error` traz o texto, e esta lista traz as linhas.
   */
  compileErrors?: ErroDeCompilacao[];
  /** As trocas HTTP do servidor simulado, quando o programa é um servidor. */
  trocas?: Troca[];
  /** As tabelas do banco do exercício depois do programa, quando ele tem banco. */
  tabelas?: RetratoDeTabela[];
}

/**
 * Tempo máximo de execução. Um laço infinito é um erro comum e esperado de quem
 * está aprendendo repetição — precisa virar uma mensagem didática, não uma aba
 * travada que obriga o aluno a perder o código que escreveu.
 */
export const EXECUTION_TIMEOUT_MS = 3000;

/**
 * Tempo máximo para o worker **existir** — baixar o arquivo, compilar, avisar
 * que está pronto. Não é tempo do aluno: é rede e servidor. Por isso é
 * separado dos 3 segundos, e generoso: numa conexão de celular, o arquivo do
 * worker disputa banda com o editor, que é muito maior.
 */
export const STARTUP_TIMEOUT_MS = 20_000;

/** O worker com banco carrega o SQLite (650 kB) antes de avisar: o prazo do motor de SQL. */
export const STARTUP_COM_BANCO_MS = 40_000;

/**
 * O prazo de execução com banco. Um servidor sobre o SQLite faz dezenas de
 * consultas numa rodada de testes, e o worker divide a máquina com o
 * compilador do editor; a suíte de navegador viu programas de dez linhas
 * passarem dos 3 segundos numa máquina ocupada. Um laço infinito ainda é
 * interrompido — leva 8 segundos em vez de 3.
 */
export const EXECUTION_COM_BANCO_MS = 8000;

function toResult(response: Exclude<WorkerResponse, 'pronto' | RespostaDeServico>): ExecutionResult {
  return {
    output: response.logs.join('\n'),
    logs: response.logs,
    testResults: response.testResults,
    error: response.error,
    ...(response.trocas ? { trocas: response.trocas as Troca[] } : {}),
    ...(response.tabelas ? { tabelas: response.tabelas as RetratoDeTabela[] } : {}),
  };
}

/**
 * Executa o código do aluno num Web Worker descartável e resolve com o resultado.
 *
 * O worker é criado por execução e encerrado ao final — inclusive no caminho de
 * timeout, que é o único jeito de interromper um laço infinito em JavaScript.
 */
export function executeCode(
  code: string,
  testCases: SandboxTest[] = [],
  properties: SandboxProperty[] = [],
  opcoes: { sequencial?: boolean; banco?: string } = {}
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    let worker: Worker;

    try {
      worker = opcoes.banco !== undefined ? new ServidorBancoWorker() : new SandboxWorker();
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
    let timer: ReturnType<typeof setTimeout>;

    const finish = (result: ExecutionResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      resolve(result);
    };

    // Dois relógios, um de cada vez. O primeiro mede a infraestrutura: o
    // worker precisa avisar que existe. Só então começa o relógio do aluno.
    // Contar os 3s desde o `new Worker()` produzia "seu código passou de 3
    // segundos" para programas que nem tinham começado a rodar.
    timer = setTimeout(() => {
      finish({
        output: '',
        logs: [],
        testResults: [],
        error:
          'O ambiente de execução não ficou pronto a tempo. Confira a conexão e tente executar de novo.',
      });
    }, opcoes.banco !== undefined ? STARTUP_COM_BANCO_MS : STARTUP_TIMEOUT_MS);

    const prazo = opcoes.banco !== undefined ? EXECUTION_COM_BANCO_MS : EXECUTION_TIMEOUT_MS;

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      if (typeof event.data === 'object' && 'modo' in event.data) return; // do servidor vivo: não é deste caminho
      if (event.data === 'pronto') {
        clearTimeout(timer);
        timer = setTimeout(() => {
          finish({
            output: '',
            logs: [],
            testResults: [],
            timedOut: true,
            error: `Seu código passou de ${
              prazo / 1000
            } segundos e foi interrompido. Isso costuma indicar um laço que nunca termina — verifique se a condição de parada realmente chega a ser falsa.`,
          });
        }, prazo);
        return;
      }

      finish(toResult(event.data));
    };

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

    const request: WorkerRequest & { banco?: string } = {
      code,
      tests: testCases,
      properties,
      sequencial: opcoes.sequencial,
      ...(opcoes.banco !== undefined ? { banco: opcoes.banco } : {}),
    };
    worker.postMessage(request);
  });
}

/** O servidor vivo visto pela tela: pede, lê as trocas, fecha. */
export interface ServidorVivoNoNavegador {
  /** O que o servidor imprimiu ao subir. */
  logs: string[];
  /** Se o programa quebrou ao subir. Ainda assim `pedir` responde — com 503. */
  error?: string;
  pedir(pedido: PedidoAoServidor): Promise<RespostaDoServidor>;
  trocas(): Promise<TrocaDoServidor[]>;
  fechar(): void;
}

const RESPOSTA_DE_ERRO = (status: number, erro: string): RespostaDoServidor => ({
  status,
  headers: { 'content-type': 'application/json' },
  texto: JSON.stringify({ erro }),
});

/**
 * Sobe o servidor num worker e o deixa de pé: a segunda metade do motor 7.
 *
 * É o `executeCode` sem testes e sem `terminate()` no fim — o worker fica
 * vivo atendendo os pedidos que o `fetch` da página do aluno faz, e só
 * `fechar()` o encerra. Com `banco`, é o worker com o SQLite. Cada pedido
 * tem o seu prazo: um servidor que não responde não pode deixar a página
 * esperando para sempre.
 */
export function abrirServidorVivo(
  code: string,
  opcoes: { banco?: string } = {}
): Promise<ServidorVivoNoNavegador> {
  return new Promise((resolve) => {
    let worker: Worker;
    try {
      worker = opcoes.banco !== undefined ? new ServidorBancoWorker() : new SandboxWorker();
    } catch (error) {
      const mensagem = `Não foi possível iniciar o servidor: ${error instanceof Error ? error.message : String(error)}`;
      resolve({
        logs: [],
        error: mensagem,
        pedir: async () => RESPOSTA_DE_ERRO(503, mensagem),
        trocas: async () => [],
        fechar: () => {},
      });
      return;
    }

    // Os pedidos voltam pelo id — um lento não pode entregar a resposta do
    // seguinte —; as outras perguntas (servir, trocas) voltam na ordem.
    const pendentes = new Map<number, (r: RespostaDoServidor) => void>();
    const fila: Array<(r: RespostaDeServico) => void> = [];
    let proximoId = 1;
    let fechado = false;

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const data = event.data;
      if (typeof data !== 'object' || !('modo' in data)) return;
      if (data.modo === 'resposta') {
        const entregar = pendentes.get(data.id);
        pendentes.delete(data.id);
        entregar?.(data.resposta);
        return;
      }
      fila.shift()?.(data);
    };
    worker.onerror = (event) => {
      event.preventDefault();
      const erro = event.message || 'Erro inesperado no servidor.';
      for (const entregar of fila.splice(0)) entregar({ modo: 'servindo', logs: [], error: erro });
      for (const [id, entregar] of pendentes) {
        pendentes.delete(id);
        entregar(RESPOSTA_DE_ERRO(500, erro));
      }
    };

    const perguntar = <T extends RespostaDeServico>(m: MensagemDeServico, prazoMs: number, aoEstourar: T): Promise<T> =>
      new Promise((ok) => {
        const timer = setTimeout(() => ok(aoEstourar), prazoMs);
        fila.push((r) => {
          clearTimeout(timer);
          ok(r as T);
        });
        worker.postMessage(m);
      });

    const pedir = (pedido: PedidoAoServidor): Promise<RespostaDoServidor> =>
      new Promise((ok) => {
        const id = proximoId++;
        const timer = setTimeout(() => {
          pendentes.delete(id);
          ok(RESPOSTA_DE_ERRO(504, 'o servidor não respondeu a tempo — uma rota que não responde nem chama next()?'));
        }, EXECUTION_COM_BANCO_MS);
        pendentes.set(id, (r) => {
          clearTimeout(timer);
          ok(r);
        });
        worker.postMessage({ modo: 'pedir', id, pedido } satisfies MensagemDeServico);
      });

    const prazoParaSubir = (opcoes.banco !== undefined ? STARTUP_COM_BANCO_MS : STARTUP_TIMEOUT_MS) + EXECUTION_COM_BANCO_MS;
    void perguntar<Extract<RespostaDeServico, { modo: 'servindo' }>>(
      { modo: 'servir', code, ...(opcoes.banco !== undefined ? { banco: opcoes.banco } : {}) },
      prazoParaSubir,
      { modo: 'servindo', logs: [], error: 'O servidor não ficou pronto a tempo. Confira a conexão e tente rodar de novo.' }
    ).then((subiu) => {
      resolve({
        logs: subiu.logs,
        error: subiu.error,
        pedir: (pedido) => (fechado ? Promise.resolve(RESPOSTA_DE_ERRO(503, 'o servidor foi encerrado')) : pedir(pedido)),
        trocas: () =>
          fechado
            ? Promise.resolve([])
            : perguntar<Extract<RespostaDeServico, { modo: 'trocas' }>>({ modo: 'trocas' }, 2000, { modo: 'trocas', trocas: [] }).then(
                (r) => r.trocas
              ),
        fechar: () => {
          if (fechado) return;
          fechado = true;
          worker.terminate();
        },
      });
    });
  });
}

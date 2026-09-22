import PythonWorker from './python.worker?worker';
import type { MensagemDoWorker } from './python.worker';
import type { ExecucaoPython, ResultadoPython } from './python-core';
import { EXECUTION_TIMEOUT_MS } from './sandbox';

export type { ExecucaoPython, ResultadoPython };

/**
 * O motor de Python visto pela tela: uma função, uma promessa, nunca lança.
 *
 * O worker é criado na primeira execução e reaproveitado nas seguintes — o
 * Pyodide carrega uma vez. Ele só é descartado quando uma execução estoura o
 * prazo, que é o único jeito de interromper um laço que não termina; a
 * próxima execução cria outro (e paga o carregamento de novo).
 *
 * As execuções entram em fila, como no motor de SQL: o worker responde a uma
 * mensagem por vez.
 */

/**
 * Prazo para o Pyodide existir: baixar o worker e os ~10 MB de WebAssembly e
 * biblioteca padrão, e descompactá-los. Bem mais que o do SQL (40 s para
 * 650 kB) porque o arquivo é vinte vezes maior — numa conexão de celular,
 * isso ainda pode não bastar na primeira vez, mas o navegador guarda em
 * cache depois.
 */
export const STARTUP_TIMEOUT_MS = 90_000;

let worker: Worker | null = null;
let pronto: Promise<void> | null = null;
let fila: Promise<unknown> = Promise.resolve();

function descartar(): void {
  worker?.terminate();
  worker = null;
  pronto = null;
}

/**
 * Cria o worker e espera o Pyodide carregar. Rejeita se ele não vier.
 *
 * Exportado para o exercício chamar ao montar: o WebAssembly carrega
 * enquanto a pessoa lê o enunciado, e o primeiro "Executar" responde na hora
 * em vez de esperar o download inteiro.
 */
export function prepararMotorPython(): Promise<void> {
  return preparar().catch(() => {
    // Quem executa recebe o erro de novo, com a frase; aqui só se aquece.
  });
}

function preparar(): Promise<void> {
  if (worker && pronto) return pronto;

  const novo = new PythonWorker();
  worker = novo;
  pronto = new Promise<void>((resolve, reject) => {
    const prazo = setTimeout(() => {
      reject(new Error('O Python não ficou pronto a tempo. Confira a conexão e tente executar de novo.'));
    }, STARTUP_TIMEOUT_MS);

    novo.onmessage = (evento: MessageEvent<MensagemDoWorker>) => {
      if (evento.data === 'pronto') {
        clearTimeout(prazo);
        resolve();
      } else if (typeof evento.data === 'object' && 'falha' in evento.data) {
        clearTimeout(prazo);
        reject(new Error(`O Python não carregou: ${evento.data.falha}`));
      }
    };
    novo.onerror = (evento) => {
      evento.preventDefault();
      clearTimeout(prazo);
      reject(new Error(evento.message || 'O Python não carregou.'));
    };
  });
  pronto.catch(() => {
    if (worker === novo) descartar();
  });
  return pronto;
}

function erro(mensagem: string, timedOut = false): ResultadoPython {
  return { logs: [], testResults: [], error: mensagem, timedOut };
}

function executarUma(execucao: ExecucaoPython): Promise<ResultadoPython> {
  return preparar().then(
    () =>
      new Promise<ResultadoPython>((resolve) => {
        const atual = worker!;
        let terminou = false;

        const interromper = () => {
          if (terminou) return;
          terminou = true;
          // Interromper é descartar: um Python no meio de um laço sem fim
          // não tem como ser avisado — e a próxima execução paga o
          // carregamento de novo, o mesmo custo que o motor de SQL aceita.
          descartar();
          resolve(
            erro(
              `O código passou de ${EXECUTION_TIMEOUT_MS / 1000} segundos e foi interrompido. Isso costuma ser um laço sem condição de parada, ou uma recursão que nunca chega ao caso base.`,
              true
            )
          );
        };

        // O relógio só começa no `iniciou`, e não no envio — mesmo motivo do
        // motor de SQL: as duas mensagens do worker chegam juntas na fila
        // desta thread, e contar a partir do envio puniria uma execução
        // rápida pelo tempo que a thread principal estava ocupada.
        let prazo = setTimeout(interromper, STARTUP_TIMEOUT_MS);

        atual.onmessage = (evento: MessageEvent<MensagemDoWorker>) => {
          if (terminou || evento.data === 'pronto') return;
          if (evento.data === 'iniciou') {
            clearTimeout(prazo);
            prazo = setTimeout(interromper, EXECUTION_TIMEOUT_MS);
            return;
          }
          terminou = true;
          clearTimeout(prazo);
          if ('falha' in evento.data) {
            descartar();
            resolve(erro(`O Python falhou: ${evento.data.falha}. Tente executar de novo.`));
            return;
          }
          resolve(evento.data);
        };
        atual.onerror = (evento) => {
          evento.preventDefault();
          if (terminou) return;
          terminou = true;
          clearTimeout(prazo);
          descartar();
          resolve(erro(`O Python falhou: ${evento.message || 'erro inesperado'}. Tente executar de novo.`));
        };

        atual.postMessage(execucao);
      }),
    (falha: unknown) => erro(falha instanceof Error ? falha.message : String(falha))
  );
}

export function executarPythonNoNavegador(execucao: ExecucaoPython): Promise<ResultadoPython> {
  const proxima = fila.then(() => executarUma(execucao));
  fila = proxima.catch(() => {});
  return proxima;
}

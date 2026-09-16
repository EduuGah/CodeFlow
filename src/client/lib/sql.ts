import SqlWorker from './sql.worker?worker';
import type { MensagemDoWorker } from './sql.worker';
import type { ExecucaoSql, ResultadoSql } from './sql-core';
import { EXECUTION_TIMEOUT_MS } from './sandbox';

export type { ExecucaoSql, ResultadoSql };

/**
 * O motor de SQL visto pela tela: uma função, uma promessa, nunca lança.
 *
 * O worker é criado na primeira execução e reaproveitado nas seguintes —
 * o SQLite em WebAssembly compila uma vez. Ele só é descartado quando uma
 * execução estoura o prazo, que é o único jeito de interromper uma consulta
 * que não termina; a próxima execução cria outro.
 *
 * As execuções entram em fila: o worker responde a uma mensagem por vez, e
 * dois cliques rápidos em "Executar" precisam receber cada um o seu
 * resultado, não o do outro.
 */

/**
 * Prazo para o SQLite existir: baixar o worker e os 650 kB de WebAssembly
 * e compilá-los. É o dobro do prazo do sandbox de JavaScript porque o
 * arquivo é sessenta vezes maior, e em desenvolvimento ele disputa o
 * servidor com as centenas de módulos do Monaco.
 */
export const STARTUP_TIMEOUT_MS = 40_000;

let worker: Worker | null = null;
let pronto: Promise<void> | null = null;
let fila: Promise<unknown> = Promise.resolve();

function descartar(): void {
  worker?.terminate();
  worker = null;
  pronto = null;
}

/**
 * Cria o worker e espera o SQLite compilar. Rejeita se ele não vier.
 *
 * Exportado para o exercício chamar ao montar: o WebAssembly compila
 * enquanto a pessoa lê o enunciado, e o primeiro "Executar" responde na
 * hora em vez de esperar o download.
 */
export function prepararMotorSql(): Promise<void> {
  return preparar().catch(() => {
    // Quem executa recebe o erro de novo, com a frase; aqui só se aquece.
  });
}

function preparar(): Promise<void> {
  if (worker && pronto) return pronto;

  const novo = new SqlWorker();
  worker = novo;
  pronto = new Promise<void>((resolve, reject) => {
    const prazo = setTimeout(() => {
      reject(new Error('O banco de dados não ficou pronto a tempo. Confira a conexão e tente executar de novo.'));
    }, STARTUP_TIMEOUT_MS);

    novo.onmessage = (evento: MessageEvent<MensagemDoWorker>) => {
      if (evento.data === 'pronto') {
        clearTimeout(prazo);
        resolve();
      } else if (typeof evento.data === 'object' && 'falha' in evento.data) {
        clearTimeout(prazo);
        reject(new Error(`O banco de dados não carregou: ${evento.data.falha}`));
      }
    };
    novo.onerror = (evento) => {
      evento.preventDefault();
      clearTimeout(prazo);
      reject(new Error(evento.message || 'O banco de dados não carregou.'));
    };
  });
  pronto.catch(() => {
    if (worker === novo) descartar();
  });
  return pronto;
}

function erro(mensagem: string, timedOut = false): ResultadoSql {
  return { saidas: [], testResults: [], error: mensagem, timedOut };
}

function executarUma(execucao: ExecucaoSql): Promise<ResultadoSql> {
  return preparar().then(
    () =>
      new Promise<ResultadoSql>((resolve) => {
        const atual = worker!;
        let terminou = false;

        const interromper = () => {
          if (terminou) return;
          terminou = true;
          // Interromper é descartar: um SQLite no meio de uma consulta sem
          // fim não tem como ser avisado.
          descartar();
          resolve(
            erro(
              `A consulta passou de ${EXECUTION_TIMEOUT_MS / 1000} segundos e foi interrompida. Isso costuma ser um cruzamento de tabelas sem a condição do JOIN — cada linha de uma combinada com cada linha da outra — ou uma consulta recursiva sem parada.`,
              true
            )
          );
        };

        // O relógio da consulta só começa no `iniciou`, e não no envio. As
        // duas mensagens do worker — `iniciou` e o resultado — chegam juntas
        // na fila desta thread; se ela estiver ocupada (o Monaco montando,
        // por exemplo), o relógio disparado no envio venceria antes de a
        // fila andar, e uma consulta de milissegundos leria "passou de 3
        // segundos". Contando a partir do `iniciou`, o resultado que vem
        // logo atrás é processado antes de o relógio ter chance.
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
            resolve(erro(`O banco de dados falhou: ${evento.data.falha}. Tente executar de novo.`));
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
          resolve(erro(`O banco de dados falhou: ${evento.message || 'erro inesperado'}. Tente executar de novo.`));
        };

        atual.postMessage(execucao);
      }),
    (falha: unknown) => erro(falha instanceof Error ? falha.message : String(falha))
  );
}

export function executarSqlNoNavegador(execucao: ExecucaoSql): Promise<ResultadoSql> {
  const proxima = fila.then(() => executarUma(execucao));
  fila = proxima.catch(() => {});
  return proxima;
}

/// <reference lib="webworker" />

import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url';

import { adaptarSqlJs, executarSql, type ExecucaoSql, type ResultadoSql } from './sql-core';

/**
 * Worker do motor de SQL.
 *
 * O SQLite compilado para WebAssembly (`sql.js`, ~650 kB) roda aqui, numa
 * thread própria, pelos mesmos motivos do sandbox de JavaScript: uma consulta
 * que não termina — um `WITH RECURSIVE` sem parada, um produto cartesiano
 * grande demais — não congela a tela, e a thread principal consegue chamar
 * `terminate()`. O `.wasm` é servido do próprio domínio, como o Monaco.
 *
 * Diferente do sandbox de JavaScript, este worker **fica vivo** entre uma
 * execução e outra: compilar o WebAssembly custa centenas de milissegundos
 * num celular, e o aluno executa a mesma consulta dez vezes até acertar. Quem
 * o descarta é o `sql.ts`, quando uma execução estoura o prazo.
 *
 * Não há nada do aluno que persista: cada execução recria o banco inteiro a
 * partir do SQL do exercício.
 */

/**
 * `pronto` quando o SQLite compilou; `iniciou` no instante em que uma
 * execução começa — é quando o relógio da consulta passa a contar do lado
 * de fora —; depois o resultado, ou `falha` se o SQLite não veio.
 */
export type MensagemDoWorker = 'pronto' | 'iniciou' | { falha: string } | ResultadoSql;

const sqlite = initSqlJs({ locateFile: () => wasmUrl });

self.onmessage = async (evento: MessageEvent<ExecucaoSql>) => {
  let SQL: Awaited<typeof sqlite>;
  try {
    SQL = await sqlite;
  } catch {
    // A falha já foi avisada na inicialização; nada a executar.
    return;
  }
  self.postMessage('iniciou' satisfies MensagemDoWorker);
  let resultado: ResultadoSql;
  try {
    resultado = executarSql(() => adaptarSqlJs(new SQL.Database()), evento.data);
  } catch (erro) {
    // O preparo do banco falhou — erro do exercício, não do aluno.
    resultado = {
      saidas: [],
      testResults: [],
      error: `O banco do exercício não pôde ser montado: ${erro instanceof Error ? erro.message : String(erro)}`,
    };
  }
  self.postMessage(resultado satisfies MensagemDoWorker);
};

// Só avisa que está pronto com o SQLite compilado: é a partir daí que o
// relógio da consulta pode contar. A falha também é avisada, com a causa —
// uma rejeição solta aqui dentro não chega ao `onerror` de quem criou o worker.
void sqlite.then(
  () => self.postMessage('pronto' satisfies MensagemDoWorker),
  (erro: unknown) => {
    self.postMessage({ falha: erro instanceof Error ? erro.message : String(erro) } satisfies MensagemDoWorker);
  }
);

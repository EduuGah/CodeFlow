/// <reference lib="webworker" />

import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url';

import { runProgram } from './sandbox-core';
import type { WorkerRequest, WorkerResponse } from './sandbox.worker';
import type { ServidorVivo } from './servidor-core';
import { adaptarSqlJs, retratoDasTabelas, type Banco } from './sql-core';
import { atenderServico, ehMensagemDeServico, type MensagemDeServico } from './worker-servico';

/**
 * O worker do servidor **com banco** — o motor 7 pela metade que já existe.
 *
 * É o sandbox de sempre (`runProgram`, o mesmo do `sandbox.worker.ts`) com
 * o SQLite do motor de SQL carregado antes, no mesmo worker: o servidor do
 * aluno faz `require('./banco')` e consulta o banco do exercício com
 * `await`, como faria com um driver de verdade. Um worker à parte, e não
 * uma opção do sandbox comum, porque o SQLite são 650 kB de WebAssembly
 * que só os exercícios com banco precisam baixar.
 *
 * Como o outro: descartável por execução, rede e persistência apagadas
 * antes de o código do aluno rodar. Ao fim, o retrato das tabelas vai junto
 * com o resultado, para a tela mostrar o banco depois do servidor.
 *
 * O `'pronto'` só sai depois de o SQLite compilar **e** o banco do exercício
 * estar montado: o relógio dos 3 segundos do aluno começa aí. Avisar antes
 * (como o worker de SQL faz) punia o aluno pelo tempo do WebAssembly numa
 * máquina ocupada — a suíte de navegador viu "seu código passou de 3
 * segundos" num programa de dez linhas.
 */

const sqlite = initSqlJs({ locateFile: () => wasmUrl });

function lockDownGlobals(): void {
  for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'importScripts', 'indexedDB', 'caches', 'Notification']) {
    try {
      Object.defineProperty(self, name, { value: undefined, configurable: false, writable: false });
    } catch {
      // Alguns ambientes não permitem redefinir; seguir mesmo assim.
    }
  }
}

/** Abre um banco novo com o SQL do exercício, ou devolve a frase do que falhou. */
async function abrirBanco(setup: string): Promise<{ banco: Banco } | { error: string }> {
  let SQL: Awaited<typeof sqlite>;
  try {
    SQL = await sqlite;
  } catch (erro) {
    return { error: `O banco de dados não pôde ser carregado: ${erro instanceof Error ? erro.message : String(erro)}` };
  }
  const banco = adaptarSqlJs(new SQL.Database());
  try {
    banco.rodar(setup);
  } catch (erro) {
    return { error: `O banco do exercício não pôde ser montado: ${erro instanceof Error ? erro.message : String(erro)}` };
  }
  return { banco };
}

// O servidor vivo do motor 7, quando este worker está servindo uma página.
let servidor: ServidorVivo | null = null;

self.onmessage = async (event: MessageEvent<(WorkerRequest & { banco: string }) | MensagemDeServico>) => {
  if (ehMensagemDeServico(event.data)) {
    const mensagem = event.data;
    let globais: Record<string, unknown> = {};
    if (mensagem.modo === 'servir') {
      const aberto = await abrirBanco(mensagem.banco ?? '');
      if ('error' in aberto) {
        self.postMessage({ modo: 'servindo', logs: [], error: aberto.error } satisfies WorkerResponse);
        return;
      }
      globais = { __cfBancoNativo: aberto.banco };
      lockDownGlobals();
    }
    servidor = await atenderServico(
      mensagem,
      servidor,
      (programa) => runProgram(programa, [], [], { sequencial: true, globais }),
      (m) => self.postMessage(m satisfies WorkerResponse)
    );
    return;
  }

  const { code, tests, properties, sequencial, banco: setup } = event.data;
  const aberto = await abrirBanco(setup);
  if ('error' in aberto) {
    self.postMessage({ logs: [], testResults: [], error: aberto.error } satisfies WorkerResponse);
    return;
  }
  const banco = aberto.banco;

  self.postMessage('pronto' satisfies WorkerResponse);
  lockDownGlobals();
  const resultado = await runProgram(code, tests, properties, { sequencial, globais: { __cfBancoNativo: banco } });
  let tabelas: unknown[] | undefined;
  try {
    tabelas = retratoDasTabelas(banco);
  } catch {
    // Um retrato que falha não tira o resultado do aluno.
  }
  self.postMessage({ ...resultado, ...(tabelas ? { tabelas } : {}) } satisfies WorkerResponse);
};

// Uma falha ao compilar o SQLite não pode ficar em silêncio: o aviso sai
// com a causa, e a execução que chegar depois responde com ela também.
void sqlite.catch((erro: unknown) => {
  self.postMessage({
    logs: [],
    testResults: [],
    error: `O banco de dados não pôde ser carregado: ${erro instanceof Error ? erro.message : String(erro)}`,
  } satisfies WorkerResponse);
});

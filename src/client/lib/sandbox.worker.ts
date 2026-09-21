/// <reference lib="webworker" />

import {
  runProgram,
  type SandboxProperty,
  type SandboxRunResult,
  type SandboxTest,
} from './sandbox-core';
import type { ServidorVivo } from './servidor-core';
import { atenderServico, ehMensagemDeServico, type MensagemDeServico, type RespostaDeServico } from './worker-servico';

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
 *
 * A montagem e execução do programa ficam em `sandbox-core`, que é puro e roda
 * também no Node — é assim que a suíte de testes verifica exatamente o mesmo
 * código que o aluno executa.
 */

export type { SandboxProperty, SandboxTest };

export interface WorkerRequest {
  code: string;
  tests: SandboxTest[];
  properties?: SandboxProperty[];
  /** Testes em série, para programas com estado (o servidor simulado). */
  sequencial?: boolean;
}

/**
 * A primeira mensagem do worker é `'pronto'`, e só depois vem o resultado.
 *
 * É o que permite ao `sandbox.ts` contar os 3 segundos a partir do momento em
 * que o código do aluno de fato começa a rodar — e não a partir do `new
 * Worker()`, que inclui baixar e compilar este arquivo. Numa conexão lenta,
 * ou com o servidor ocupado servindo o editor, essa espera passava de 3s e o
 * aluno lia "seu código passou de 3 segundos" sobre um programa de duas
 * linhas que nem tinha começado.
 */
export type WorkerResponse = 'pronto' | SandboxRunResult | RespostaDeServico;

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

// O servidor vivo do motor 7, quando este worker está servindo uma página.
let servidor: ServidorVivo | null = null;
let trancado = false;

self.onmessage = async (event: MessageEvent<WorkerRequest | MensagemDeServico>) => {
  if (!trancado) {
    lockDownGlobals();
    trancado = true;
  }
  if (ehMensagemDeServico(event.data)) {
    servidor = await atenderServico(
      event.data,
      servidor,
      (programa) => runProgram(programa, [], [], { sequencial: true }),
      (m) => self.postMessage(m satisfies WorkerResponse)
    );
    return;
  }

  const { code, tests, properties, sequencial } = event.data;
  self.postMessage(await runProgram(code, tests, properties, { sequencial }));
};

// Depois de `onmessage` existir, e não antes: a mensagem com o programa pode
// já estar na fila, e ela precisa encontrar o tratador pronto.
self.postMessage('pronto' satisfies WorkerResponse);

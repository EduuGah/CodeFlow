/// <reference lib="webworker" />

import {
  runProgram,
  type SandboxProperty,
  type SandboxRunResult,
  type SandboxTest,
} from './sandbox-core';

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
}

export type WorkerResponse = SandboxRunResult;

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

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { code, tests, properties } = event.data;

  lockDownGlobals();
  self.postMessage(runProgram(code, tests, properties));
};

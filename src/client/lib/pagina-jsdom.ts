import { JSDOM, VirtualConsole } from 'jsdom';

import { interpretarMensagem, montarDocumento, type ResultadoDaPagina } from './pagina-core';
import type { SandboxTest } from './sandbox-core';

/**
 * Roda uma página de exercício no jsdom — o executor do CI.
 *
 * O documento é exatamente o que o navegador do aluno recebe (`montarDocumento`);
 * a diferença é o motor por baixo. No jsdom `window.parent` é a própria janela,
 * então a mensagem que o corredor manda para o pai chega aqui como um evento
 * `message` comum.
 *
 * Limites, que vale conhecer antes de escrever um teste de conteúdo:
 * - não há layout: `getBoundingClientRect` devolve zeros, e `offsetWidth` é 0;
 * - `getComputedStyle` devolve o valor **declarado** (`red`), não o
 *   normalizado (`rgb(255, 0, 0)`) que o navegador devolve. Um teste que
 *   compare cores precisa aceitar os dois — ou ficar para o E2E, que roda no
 *   Chromium de verdade.
 *
 * Nunca use isto em código do aplicativo: é ferramenta de teste.
 */
export function rodarPaginaNoJsdom(
  codigoDoAluno: string,
  tests: SandboxTest[],
  prazoMs = 8000
): Promise<ResultadoDaPagina> {
  return new Promise((resolve, reject) => {
    // O console do aluno já é capturado dentro da página; o do jsdom só
    // repetiria tudo no terminal do teste.
    const virtualConsole = new VirtualConsole();

    const dom = new JSDOM(montarDocumento(codigoDoAluno, tests), {
      runScripts: 'dangerously',
      virtualConsole,
      pretendToBeVisual: true,
    });

    const prazo = setTimeout(() => {
      dom.window.close();
      reject(new Error(`a página não respondeu em ${prazoMs}ms`));
    }, prazoMs);

    dom.window.addEventListener('message', (evento) => {
      const resultado = interpretarMensagem((evento as MessageEvent).data);
      if (!resultado) return;

      clearTimeout(prazo);
      dom.window.close();
      resolve(resultado);
    });
  });
}

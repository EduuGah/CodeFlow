import { JSDOM, VirtualConsole } from 'jsdom';

import { interpretarMensagem, interpretarPedido, mensagemDeResposta, montarDocumento, type ResultadoDaPagina } from './pagina-core';
import { montarDocumentoReact } from './react-core';
import { BIBLIOTECAS_DO_REACT } from './react-umd';
import type { SandboxTest } from './sandbox-core';
import type { PedidoAoServidor, RespostaDoServidor } from './servidor-core';

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
  prazoMs = 8000,
  {
    react = false,
    servidor,
  }: { react?: boolean; servidor?: { pedir(pedido: PedidoAoServidor): Promise<RespostaDoServidor> } } = {}
): Promise<ResultadoDaPagina> {
  return new Promise((resolve, reject) => {
    // O console do aluno já é capturado dentro da página; o do jsdom só
    // repetiria tudo no terminal do teste.
    const virtualConsole = new VirtualConsole();

    // Em React, `codigoDoAluno` já é o JavaScript compilado do TSX.
    const documento = react
      ? montarDocumentoReact(codigoDoAluno, tests, BIBLIOTECAS_DO_REACT)
      : montarDocumento(codigoDoAluno, tests, { comServidor: servidor !== undefined });

    const dom = new JSDOM(documento, {
      runScripts: 'dangerously',
      virtualConsole,
      pretendToBeVisual: true,
    });

    const prazo = setTimeout(() => {
      dom.window.close();
      reject(new Error(`a página não respondeu em ${prazoMs}ms`));
    }, prazoMs);

    let encerrado = false;
    dom.window.addEventListener('message', (evento) => {
      const data = (evento as MessageEvent).data;

      // No jsdom `window.parent` é a própria janela: o pedido do fetch de
      // mentira chega aqui, e a resposta volta pela mesma janela.
      const pedido = interpretarPedido(data);
      if (pedido) {
        if (!servidor) return;
        void servidor.pedir(pedido.pedido).then((resposta) => {
          if (!encerrado) dom.window.postMessage(mensagemDeResposta(pedido.id, resposta), '*');
        });
        return;
      }

      const resultado = interpretarMensagem(data);
      if (!resultado) return;
      encerrado = true;

      clearTimeout(prazo);
      dom.window.close();
      resolve(resultado);
    });
  });
}

/// <reference lib="webworker" />

import { loadPyodide } from 'pyodide';

import { executarPython, type ExecucaoPython, type Interprete, type ResultadoPython } from './python-core';
import { trancarGlobais } from './trancar-globais';

/**
 * Worker do motor de Python (motor 6).
 *
 * O Pyodide — CPython compilado para WebAssembly, com a biblioteca padrão —
 * roda aqui, pelos mesmos motivos do motor de SQL: um laço sem parada não
 * congela a tela, e a thread principal consegue chamar `terminate()`. Os
 * arquivos (`pyodide.asm.wasm`, `python_stdlib.zip`…) são copiados para
 * `/pyodide/` na raiz do site pelo `vite-plugin-static-copy` — servidos do
 * próprio domínio, como o `.wasm` do SQLite.
 *
 * Diferente do SQLite, recriar o intérprete do zero custa segundos, não
 * microssegundos — por isso ele **fica vivo** entre execuções, como o SQL, mas
 * uma execução não recebe um intérprete novo: `executarPython`, em
 * `python-core.ts`, isola cada uma com um dicionário de globais próprio, bem
 * mais barato que recarregar o WebAssembly inteiro.
 */

/**
 * `pronto` quando o Pyodide carregou; `iniciou` no instante em que uma
 * execução começa — é quando o relógio passa a contar do lado de fora —;
 * depois o resultado, ou `falha` se o Pyodide não veio.
 */
export type MensagemDoWorker = 'pronto' | 'iniciou' | { falha: string } | ResultadoPython;

const pyodide = loadPyodide({ indexURL: '/pyodide/' }) as unknown as Promise<Interprete>;

self.onmessage = async (evento: MessageEvent<ExecucaoPython>) => {
  let interprete: Interprete;
  try {
    interprete = await pyodide;
  } catch {
    // A falha já foi avisada na inicialização; nada a executar.
    return;
  }
  self.postMessage('iniciou' satisfies MensagemDoWorker);
  let resultado: ResultadoPython;
  try {
    resultado = executarPython(interprete, evento.data);
  } catch (erro) {
    resultado = {
      logs: [],
      testResults: [],
      error: `O intérprete de Python falhou ao rodar o exercício: ${erro instanceof Error ? erro.message : String(erro)}`,
    };
  }
  self.postMessage(resultado satisfies MensagemDoWorker);
};

// Só avisa que está pronto com o Pyodide carregado: é a partir daí que o
// relógio da execução pode contar. A falha também é avisada, com a causa —
// uma rejeição solta aqui dentro não chega ao `onerror` de quem criou o worker.
//
// A rede é trancada aqui, e não antes: o Pyodide busca os próprios arquivos
// com `fetch` enquanto carrega. Depois disso o código do aluno — que alcança
// o escopo do worker por `import js` — não tem mais `fetch`, `XMLHttpRequest`
// nem o resto (o `e2e/python.spec.ts` prova, rodando `js.fetch` numa aula).
void pyodide.then(
  () => {
    trancarGlobais(self);
    self.postMessage('pronto' satisfies MensagemDoWorker);
  },
  (erro: unknown) => {
    self.postMessage({ falha: erro instanceof Error ? erro.message : String(erro) } satisfies MensagemDoWorker);
  }
);

import { loadPyodide } from 'pyodide';

import { executarPython, type ExecucaoPython, type Interprete, type ResultadoPython } from './python-core';

/**
 * O Pyodide no Node, para o CI.
 *
 * O mesmo pacote `pyodide` que o worker do navegador embute, na mesma
 * versão: o que a suíte de conteúdo prova aqui é o que roda no navegador do
 * aluno. Sem `indexURL`: no Node, o pacote encontra os próprios arquivos
 * (`pyodide.asm.wasm`, `python_stdlib.zip`…) no diretório onde foi instalado.
 *
 * Memoizado como `sql-node.ts` memoiza o SQLite: carregar custa segundos —
 * compilar o WebAssembly e descompactar a biblioteca padrão —, e a suíte
 * inteira reaproveita a mesma instância, isolando cada exercício com um
 * dicionário de globais próprio (`executarPython`, em `python-core.ts`).
 */
let pyodide: Promise<Interprete> | null = null;

export async function prepararPythonNoNode(): Promise<Interprete> {
  pyodide ??= loadPyodide() as unknown as Promise<Interprete>;
  return pyodide;
}

export async function executarPythonNoNode(execucao: ExecucaoPython): Promise<ResultadoPython> {
  const interprete = await prepararPythonNoNode();
  return executarPython(interprete, execucao);
}

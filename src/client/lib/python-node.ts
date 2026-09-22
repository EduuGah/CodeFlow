import { createRequire } from 'node:module';
import path from 'node:path';

import { loadPyodide } from 'pyodide';

import { executarPython, type ExecucaoPython, type Interprete, type ResultadoPython } from './python-core';

/**
 * O Pyodide no Node, para o CI.
 *
 * O mesmo pacote `pyodide` que o worker do navegador embute, na mesma
 * versão: o que a suíte de conteúdo prova aqui é o que roda no navegador do
 * aluno.
 *
 * `indexURL` explícito, porque sem ele o Pyodide tenta achar os próprios
 * arquivos a partir de `import.meta.url` — e o Vitest (como qualquer
 * bundler) reescreve esse valor ao transformar o módulo, então o caminho que
 * o Pyodide calcula sozinho aponta para o lugar errado. `require.resolve`,
 * pela resolução de verdade do Node em vez do `import.meta.url` alterado,
 * acha o `package.json` do pacote — e o diretório dele é onde os arquivos
 * (`pyodide.asm.wasm`, `python_stdlib.zip`…) de fato estão.
 *
 * Memoizado como `sql-node.ts` memoiza o SQLite: carregar custa segundos —
 * compilar o WebAssembly e descompactar a biblioteca padrão —, e a suíte
 * inteira reaproveita a mesma instância, isolando cada exercício com um
 * dicionário de globais próprio (`executarPython`, em `python-core.ts`).
 */
const indexURL = path.dirname(createRequire(import.meta.url).resolve('pyodide/package.json')) + path.sep;

let pyodide: Promise<Interprete> | null = null;

export async function prepararPythonNoNode(): Promise<Interprete> {
  pyodide ??= loadPyodide({ indexURL }) as unknown as Promise<Interprete>;
  return pyodide;
}

export async function executarPythonNoNode(execucao: ExecucaoPython): Promise<ResultadoPython> {
  const interprete = await prepararPythonNoNode();
  return executarPython(interprete, execucao);
}

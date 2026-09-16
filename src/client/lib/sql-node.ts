import initSqlJs from 'sql.js';

import { adaptarSqlJs, type AbrirBanco } from './sql-core';

/**
 * O SQLite no Node, para o CI.
 *
 * O mesmo pacote `sql.js` que o worker embute, na mesma versão: o que a suíte
 * de conteúdo prova aqui é o que roda no navegador do aluno. Só o carregador
 * muda — no Node, o pacote encontra o `.wasm` sozinho no próprio diretório.
 *
 * A fábrica é uma promessa porque o WebAssembly compila uma vez; o resto
 * (`new Database()`) é síncrono e barato.
 */
let sqlite: Promise<Awaited<ReturnType<typeof initSqlJs>>> | null = null;

export async function abrirBancoNoNode(): Promise<AbrirBanco> {
  sqlite ??= initSqlJs();
  const SQL = await sqlite;
  return () => adaptarSqlJs(new SQL.Database());
}

import { describe, expect, it } from 'vitest';

import { MENSAGEM_DO_LACO, NOME_DA_GUARDA, protegerLacos, protegerScripts, scriptDaGuarda } from './protecao-de-laco';

/**
 * A proteção contra laço sem fim da página (P2-6).
 *
 * Duas coisas precisam valer ao mesmo tempo: todo laço de verdade ganha a
 * guarda, e nada que não é laço muda — um texto, um comentário, uma
 * propriedade chamada `while` saem como entraram. Um engano no primeiro
 * congela a aba; no segundo, quebra o código de quem está certo.
 */

const G = NOME_DA_GUARDA;

describe('os laços ganham a guarda na condição', () => {
  it.each([
    ['while (true) {}', `while (${G}() && (true)) {}`],
    ['while (i < 3) i++;', `while (${G}() && (i < 3)) i++;`],
    ['do { x++ } while (x < 10);', `do { x++ } while (${G}() && (x < 10));`],
    ['for (let i = 0; i < n; i++) {}', `for (let i = 0; ${G}() && ( i < n); i++) {}`],
    ['for (;;) { break }', `for (; ${G}();) { break }`],
    ['if (x) while (y) z();', `if (x) while (${G}() && (y)) z();`],
    ['rotulo: for (let i = 0; i < 3; i++) continue rotulo;', `rotulo: for (let i = 0; ${G}() && ( i < 3); i++) continue rotulo;`],
  ])('%s', (entrada, saida) => {
    expect(protegerLacos(entrada)).toBe(saida);
  });

  it('o `;` e o parêntese de dentro de texto, lista e chamada não confundem o cabeçalho', () => {
    expect(protegerLacos('for (let i = 0, j = (1, 2); i < f("a;b", [1;2]); i++) {}')).toBe(
      `for (let i = 0, j = (1, 2); ${G}() && ( i < f("a;b", [1;2])); i++) {}`
    );
  });
});

describe('o que não é laço sai como entrou', () => {
  it.each([
    'for (const x of lista) {}',
    'for (const k in objeto) {}',
    'obj.while(1); a?.for(2); const o = { while: 1, for: 2 };',
    'const o = { while() { return 1 } };',
    'const s = "while (true) {}"; const t = \'for (;;) {}\';',
    '// while (true) {}\n/* for (;;) {} */',
    'const m = `while (true) ${1 + 2} for (;;)`;',
    'const r = /while (\\()/g; const d = a / b / c;',
  ])('%s', (entrada) => {
    expect(protegerLacos(entrada)).toBe(entrada);
  });
});

describe('a guarda', () => {
  /** Roda o código com a guarda num escopo próprio, com relógio e timers falsos. */
  function rodar(codigo: string, relogio: () => number) {
    const escopo: Record<string, unknown> = {};
    const timers: Array<() => void> = [];
    const fn = new Function(
      'window',
      'Date',
      'setTimeout',
      `${scriptDaGuarda(100)}\nvar ${G} = window.${G};\n${protegerLacos(codigo)}`
    );
    return { executar: () => fn(escopo, { now: relogio }, (f: () => void) => timers.push(f)), timers };
  }

  it('interrompe o laço que não solta a thread, com a mensagem para o aluno', () => {
    let agora = 0;
    const { executar } = rodar('while (true) {}', () => (agora += 1));
    expect(executar).toThrow(MENSAGEM_DO_LACO);
  });

  it('um laço longo, mas que termina, passa', () => {
    const { executar } = rodar('var n = 0; for (var i = 0; i < 5000; i++) n++;', () => 0);
    expect(executar).not.toThrow();
  });

  it('um `try` no corpo não engole a guarda: ela mora na condição', () => {
    let agora = 0;
    const { executar } = rodar('while (true) { try { } catch (e) { } }', () => (agora += 1));
    expect(executar).toThrow(MENSAGEM_DO_LACO);
  });
});

describe('os scripts de um documento', () => {
  it('só os `<script>` de JavaScript, sem `src`, são protegidos', () => {
    const html = [
      '<p>while (true) {}</p>',
      '<script>while (a) {}</script>',
      '<script type="module">for (;;) {}</script>',
      '<script type="text/template">while (b) {}</script>',
    ].join('\n');

    const saida = protegerScripts(html);

    expect(saida).toContain('<p>while (true) {}</p>');
    expect(saida).toContain(`<script>while (${G}() && (a)) {}</script>`);
    expect(saida).toContain(`<script type="module">for (; ${G}();) {}</script>`);
    expect(saida).toContain('<script type="text/template">while (b) {}</script>');
  });
});

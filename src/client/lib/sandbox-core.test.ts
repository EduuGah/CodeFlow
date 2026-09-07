import { describe, expect, it } from 'vitest';

import { MAX_LOGS, runProgram } from './sandbox-core';

/**
 * O núcleo do sandbox é o que decide se o aluno vê "aprovado" ou "reprovado".
 * Um erro aqui não quebra a tela — dá o veredito errado, que é pior.
 *
 * O isolamento (thread separada, timeout, bloqueio de rede) não é testado aqui
 * porque não é responsabilidade deste módulo: quem garante isso é o worker.
 */

describe('captura de saída', () => {
  it('registra cada console.log como uma entrada', () => {
    const r = runProgram('console.log("a"); console.log("b");', []);
    expect(r.logs).toEqual(['a', 'b']);
  });

  it('junta os argumentos com espaço, como o console faz', () => {
    expect(runProgram('console.log("x", 1, true);', []).logs).toEqual(['x 1 true']);
  });

  it('serializa objetos em vez de mostrar [object Object]', () => {
    expect(runProgram('console.log({ a: 1 });', []).logs).toEqual(['{"a":1}']);
  });

  it('não quebra com referência circular', () => {
    const r = runProgram('const o = {}; o.self = o; console.log(o);', []);
    expect(r.error).toBeUndefined();
    expect(r.logs).toHaveLength(1);
  });

  it('corta a saída no teto e avisa, em vez de crescer sem limite', () => {
    const r = runProgram(`for (let i = 0; i < ${MAX_LOGS * 3}; i++) console.log(i);`, []);
    expect(r.logs).toHaveLength(MAX_LOGS + 1);
    expect(r.logs[r.logs.length - 1]).toContain('interrompida');
  });

  it('restaura o console depois de executar', () => {
    const antes = console.log;
    runProgram('console.log("oi");', []);
    expect(console.log).toBe(antes);
  });

  it('restaura o console mesmo quando o código lança erro', () => {
    const antes = console.log;
    runProgram('console.log("oi"); throw new Error("boom");', []);
    expect(console.log).toBe(antes);
  });
});

describe('erros do código do aluno', () => {
  it('devolve o erro de sintaxe em vez de lançar', () => {
    const r = runProgram('let x = ;', []);
    expect(r.error).toContain('SyntaxError');
    expect(r.testResults).toEqual([]);
  });

  it('devolve o erro de execução', () => {
    expect(runProgram('naoExiste();', []).error).toContain('ReferenceError');
  });

  it('preserva os logs emitidos antes do erro', () => {
    const r = runProgram('console.log("antes"); throw new Error("boom");', []);
    expect(r.logs).toEqual(['antes']);
    expect(r.error).toContain('boom');
  });
});

describe('execução dos testes', () => {
  const testes = [
    { description: 'x existe', assertion: `if (typeof x === 'undefined') throw new Error("faltou x");` },
    { description: 'x vale 1', assertion: `if (x !== 1) throw new Error("x deveria ser 1");` },
  ];

  it('os testes enxergam as variáveis declaradas pelo aluno', () => {
    const r = runProgram('let x = 1;', testes);
    expect(r.testResults.map((t) => t.passed)).toEqual([true, true]);
  });

  it('usa a descrição do teste como mensagem de sucesso', () => {
    expect(runProgram('let x = 1;', testes).testResults[0].message).toBe('x existe');
  });

  it('usa a mensagem do erro lançado quando falha', () => {
    const r = runProgram('let x = 2;', testes);
    expect(r.testResults[1]).toEqual({ passed: false, message: 'x deveria ser 1' });
  });

  it('um teste que falha não impede os seguintes de rodar', () => {
    const r = runProgram('let x = 2;', testes);
    expect(r.testResults).toHaveLength(2);
    expect(r.testResults[0].passed).toBe(true);
  });

  it('funções declaradas pelo aluno ficam visíveis aos testes', () => {
    const r = runProgram('function dobro(n){ return n*2; }', [
      { description: 'dobro(2) é 4', assertion: `if (dobro(2) !== 4) throw new Error("errado");` },
    ]);
    expect(r.testResults[0].passed).toBe(true);
  });

  it('sem testes, apenas executa e devolve a saída', () => {
    const r = runProgram('console.log("só rodando");', []);
    expect(r.testResults).toEqual([]);
    expect(r.logs).toEqual(['só rodando']);
  });

  it('roda em modo estrito: atribuir a variável não declarada é erro', () => {
    // Sem "use strict", `implicita = 1` criaria uma global silenciosamente.
    expect(runProgram('implicita = 1;', []).error).toContain('ReferenceError');
  });
});

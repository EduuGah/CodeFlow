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
  it('registra cada console.log como uma entrada', async () => {
    const r = await runProgram('console.log("a"); console.log("b");', []);
    expect(r.logs).toEqual(['a', 'b']);
  });

  it('junta os argumentos com espaço, como o console faz', async () => {
    expect((await runProgram('console.log("x", 1, true);', [])).logs).toEqual(['x 1 true']);
  });

  it('serializa objetos em vez de mostrar [object Object]', async () => {
    expect((await runProgram('console.log({ a: 1 });', [])).logs).toEqual(['{"a":1}']);
  });

  it('não quebra com referência circular', async () => {
    const r = await runProgram('const o = {}; o.self = o; console.log(o);', []);
    expect(r.error).toBeUndefined();
    expect(r.logs).toHaveLength(1);
  });

  it('corta a saída no teto e avisa, em vez de crescer sem limite', async () => {
    const r = await runProgram(`for (let i = 0; i < ${MAX_LOGS * 3}; i++) console.log(i);`, []);
    expect(r.logs).toHaveLength(MAX_LOGS + 1);
    expect(r.logs[r.logs.length - 1]).toContain('interrompida');
  });

  it('restaura o console depois de executar', async () => {
    const antes = console.log;
    await runProgram('console.log("oi");', []);
    expect(console.log).toBe(antes);
  });

  it('restaura o console mesmo quando o código lança erro', async () => {
    const antes = console.log;
    await runProgram('console.log("oi"); throw new Error("boom");', []);
    expect(console.log).toBe(antes);
  });
});

describe('erros do código do aluno', () => {
  it('devolve o erro de sintaxe em vez de lançar', async () => {
    const r = await runProgram('let x = ;', []);
    expect(r.error).toContain('SyntaxError');
    expect(r.testResults).toEqual([]);
  });

  it('devolve o erro de execução', async () => {
    expect((await runProgram('naoExiste();', [])).error).toContain('ReferenceError');
  });

  it('preserva os logs emitidos antes do erro', async () => {
    const r = await runProgram('console.log("antes"); throw new Error("boom");', []);
    expect(r.logs).toEqual(['antes']);
    expect(r.error).toContain('boom');
  });
});

describe('execução dos testes', () => {
  const testes = [
    { description: 'x existe', assertion: `if (typeof x === 'undefined') throw new Error("faltou x");` },
    { description: 'x vale 1', assertion: `if (x !== 1) throw new Error("x deveria ser 1");` },
  ];

  it('os testes enxergam as variáveis declaradas pelo aluno', async () => {
    const r = await runProgram('let x = 1;', testes);
    expect(r.testResults.map((t) => t.passed)).toEqual([true, true]);
  });

  it('usa a descrição do teste como mensagem de sucesso', async () => {
    expect((await runProgram('let x = 1;', testes)).testResults[0].message).toBe('x existe');
  });

  it('usa a mensagem do erro lançado quando falha', async () => {
    const r = await runProgram('let x = 2;', testes);
    expect(r.testResults[1]).toEqual({ passed: false, message: 'x deveria ser 1' });
  });

  it('um teste que falha não impede os seguintes de rodar', async () => {
    const r = await runProgram('let x = 2;', testes);
    expect(r.testResults).toHaveLength(2);
    expect(r.testResults[0].passed).toBe(true);
  });

  it('funções declaradas pelo aluno ficam visíveis aos testes', async () => {
    const r = await runProgram('function dobro(n){ return n*2; }', [
      { description: 'dobro(2) é 4', assertion: `if (dobro(2) !== 4) throw new Error("errado");` },
    ]);
    expect(r.testResults[0].passed).toBe(true);
  });

  it('sem testes, apenas executa e devolve a saída', async () => {
    const r = await runProgram('console.log("só rodando");', []);
    expect(r.testResults).toEqual([]);
    expect(r.logs).toEqual(['só rodando']);
  });

  it('roda em modo estrito: atribuir a variável não declarada é erro', async () => {
    // Sem "use strict", `implicita = 1` criaria uma global silenciosamente.
    expect((await runProgram('implicita = 1;', [])).error).toContain('ReferenceError');
  });
});

describe('código assíncrono', () => {
  const ASSINCRONO = `
async function buscarPreco() {
  return new Promise((resolve) => setTimeout(() => resolve(42), 5));
}`;

  it('a asserção pode esperar o resultado', async () => {
    const r = await runProgram(ASSINCRONO, [
      {
        description: 'buscarPreco() resolve para 42',
        assertion: 'if ((await buscarPreco()) !== 42) throw new Error("valor errado");',
      },
    ]);

    expect(r.error).toBeUndefined();
    expect(r.testResults[0].passed).toBe(true);
  });

  it('reprova a resposta errada em vez de passar antes de saber', async () => {
    // Este era o defeito: uma asserção assíncrona reportava sucesso antes de a
    // promise resolver, e o aluno via "correto" para uma resposta errada. Um
    // exercício que mente é pior do que um exercício que falta.
    const r = await runProgram(ASSINCRONO, [
      {
        description: 'espera 99',
        assertion: 'if ((await buscarPreco()) !== 99) throw new Error("esperava 99");',
      },
    ]);

    expect(r.testResults[0].passed).toBe(false);
    expect(r.testResults[0].message).toBe('esperava 99');
  });

  it('promise rejeitada vira falha, não erro solto', async () => {
    const r = await runProgram('async function falhar() { throw new Error("deu ruim"); }', [
      { description: 'falhar() rejeita', assertion: 'await falhar();' },
    ]);

    expect(r.testResults[0].passed).toBe(false);
    expect(r.testResults[0].message).toBe('deu ruim');
  });

  it('a propriedade também espera o código do aluno', async () => {
    const r = await runProgram(
      'async function dobro(n) { return n * 2; }',
      [],
      [
        {
          description: 'dobro(n) é sempre 2n',
          generate: 'return { n: Math.floor(rnd() * 50) };',
          check: 'if ((await dobro(caso.n)) !== caso.n * 2) throw new Error("errado");',
        },
      ]
    );

    expect(r.testResults[0].passed).toBe(true);
  });
});

describe('rejeição sem destino não escapa do sandbox', () => {
  it('promise que rejeita sem catch não derruba quem executou', async () => {
    // Sem contenção isto mata o processo do Node e vaza do worker para a página.
    // Descoberto do jeito ruim: a aula sobre falhas assíncronas demonstra esse
    // caso de propósito, e o CI ficou vermelho por sete commits.
    const r = await runProgram(
      `async function falhar() { throw new Error('quebrou'); }
       falhar();
       console.log('segui em frente');`,
      []
    );

    expect(r.error).toBeUndefined();
    expect(r.logs).toContain('segui em frente');
  });

  it('o programa seguinte roda normalmente', async () => {
    await runProgram(`Promise.reject(new Error('solta'));`, []);

    // A captura é desfeita ao fim de cada execução: se ela vazasse, o ambiente
    // ficaria surdo para problemas de verdade daqui em diante.
    const depois = await runProgram('console.log("ok");', [
      { description: 'roda', assertion: '' },
    ]);

    expect(depois.testResults[0].passed).toBe(true);
    expect(depois.logs).toContain('ok');
  });

  it('o teste que espera a rejeição continua vendo o erro', async () => {
    // Conter não é esconder: quem espera a falha com await continua recebendo.
    const r = await runProgram(`async function falhar() { throw new Error('esperado'); }`, [
      { description: 'falhar() rejeita', assertion: 'await falhar();' },
    ]);

    expect(r.testResults[0].passed).toBe(false);
    expect(r.testResults[0].message).toBe('esperado');
  });
});

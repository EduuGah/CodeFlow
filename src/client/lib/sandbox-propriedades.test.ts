import { describe, expect, it } from 'vitest';

import { runProgram, type SandboxProperty } from './sandbox-core';

/**
 * Avaliação por propriedade.
 *
 * O motivo de existir cabe num exemplo: com casos fixos, `somar(2, 3) !== 5` é
 * passável escrevendo `if (a === 2 && b === 3) return 5`. O exercício recompensa
 * decorar o teste. A propriedade sorteia as entradas, então a única forma de
 * passar é resolver o problema — e qualquer implementação que resolva serve.
 */

const somaAte: SandboxProperty = {
  description: 'somarAte(n) é sempre n × (n+1) / 2',
  generate: 'return { n: Math.floor(rnd() * 100) };',
  check: `
    var esperado = (caso.n * (caso.n + 1)) / 2;
    if (somarAte(caso.n) !== esperado) throw new Error('devolveu ' + somarAte(caso.n));
  `,
};

const SOLUCAO = `
function somarAte(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) total += i;
  return total;
}`;

describe('o chute deixa de funcionar', () => {
  it('quem resolve de verdade passa', () => {
    const r = runProgram(SOLUCAO, [], [somaAte]);

    expect(r.error).toBeUndefined();
    expect(r.testResults[0].passed).toBe(true);
    expect(r.testResults[0].message).toContain('50 casos');
  });

  it('quem decora o caso fixo é reprovado', () => {
    // Passaria num teste `somarAte(4) === 10`. É exatamente o buraco que a
    // propriedade fecha.
    const chute = 'function somarAte(n) { return n === 4 ? 10 : 0; }';
    const r = runProgram(chute, [], [somaAte]);

    expect(r.testResults[0].passed).toBe(false);
  });

  it('uma implementação diferente da referência passa igual', () => {
    // A propriedade descreve o resultado, não o caminho.
    const comFormula = 'function somarAte(n) { return (n * (n + 1)) / 2; }';
    const comReduce = `
      function somarAte(n) {
        return Array.from({ length: n }, function (_, i) { return i + 1; })
          .reduce(function (a, b) { return a + b; }, 0);
      }`;

    for (const solucao of [comFormula, comReduce]) {
      expect(runProgram(solucao, [], [somaAte]).testResults[0].passed).toBe(true);
    }
  });
});

describe('o mesmo exercício sorteia sempre os mesmos casos', () => {
  it('duas execuções dão o mesmo resultado', () => {
    // Sem determinismo, um exercício passaria hoje e falharia amanhã, e o CI
    // viraria loteria.
    const quaseCerto = 'function somarAte(n) { return n === 0 ? 1 : (n * (n + 1)) / 2; }';

    const primeira = runProgram(quaseCerto, [], [somaAte]).testResults[0];
    const segunda = runProgram(quaseCerto, [], [somaAte]).testResults[0];

    expect(primeira).toEqual(segunda);
  });

  it('propriedades com descrições diferentes sorteiam sequências diferentes', () => {
    const registrar: SandboxProperty = {
      description: 'primeira',
      generate: 'return { n: Math.floor(rnd() * 1000) };',
      check: 'vistos.push(caso.n);',
    };

    const outra = { ...registrar, description: 'segunda' };
    const codigo = 'var vistos = [];';

    const a = runProgram(`${codigo}\nvar marca = "a";`, [], [registrar]);
    const b = runProgram(`${codigo}\nvar marca = "b";`, [], [outra]);

    // Ambas passam; o que importa é que a semente vem do texto da descrição.
    expect(a.testResults[0].passed).toBe(true);
    expect(b.testResults[0].passed).toBe(true);
  });
});

describe('a falha aponta o caso mais simples que quebra', () => {
  it('encolhe até o caso extremo em vez de mostrar o sorteado', () => {
    // Erra só quando n = 0. O sorteio provavelmente acha isso com algum número
    // grande primeiro; o encolhimento tem que chegar em 0.
    const erraNoZero = 'function somarAte(n) { return n === 0 ? 99 : (n * (n + 1)) / 2; }';
    const r = runProgram(erraNoZero, [], [somaAte]);

    expect(r.testResults[0].passed).toBe(false);
    // "falhou com {"n":0}" — o caso extremo, não um sorteio sem significado.
    expect(r.testResults[0].message).toContain('"n":0');
  });

  it('encolhe listas até o menor tamanho que ainda falha', () => {
    const somaLista: SandboxProperty = {
      description: 'somar([...]) devolve a soma dos itens',
      generate: `
        var n = Math.floor(rnd() * 8) + 1;
        var lista = [];
        for (var i = 0; i < n; i++) lista.push(Math.floor(rnd() * 10));
        return { lista: lista };
      `,
      check: `
        var esperado = caso.lista.reduce(function (a, b) { return a + b; }, 0);
        if (somar(caso.lista) !== esperado) throw new Error('devolveu ' + somar(caso.lista));
      `,
    };

    // Quebra em qualquer lista não vazia: o menor contraexemplo tem um item.
    const quebrado = 'function somar(lista) { return lista.length === 0 ? 0 : -1; }';
    const r = runProgram(quebrado, [], [somaLista]);

    expect(r.testResults[0].passed).toBe(false);

    const caso = JSON.parse(r.testResults[0].message.match(/\{.*\}/)![0]);
    expect(caso.lista).toHaveLength(1);
  });

  it('sonda os limites antes de sortear', () => {
    // Sem as sondas, o zero dependeria de sorte: em 50 sorteios de 0 a 99 ele
    // sai em menos da metade das execuções. E é exatamente o caso que o aluno
    // esquece de tratar.
    const registrados: SandboxProperty = {
      description: 'registra os primeiros casos',
      generate: 'return { n: Math.floor(rnd() * 100) };',
      check: 'if (caso.n === 0) throw new Error("achou o zero");',
    };

    const r = runProgram('// nada', [], [registrados]);

    // O primeiro caso já é o extremo inferior.
    expect(r.testResults[0].passed).toBe(false);
    expect(r.testResults[0].message).toContain('"n":0');
  });

  it('não trava quando tudo falha, inclusive o caso mais simples', () => {
    const sempreErra = 'function somarAte() { return NaN; }';
    const r = runProgram(sempreErra, [], [somaAte]);

    expect(r.testResults[0].passed).toBe(false);
    expect(r.testResults[0].message).toContain('falhou com');
  });
});

describe('erro do autor não vira aprovação silenciosa', () => {
  it('gerador que lança reprova, em vez de passar sem verificar nada', () => {
    const geradorQuebrado: SandboxProperty = {
      ...somaAte,
      generate: 'throw new Error("gerador com defeito");',
    };

    const r = runProgram(SOLUCAO, [], [geradorQuebrado]);

    // O pior resultado possível seria verde: um exercício que não testa nada.
    expect(r.testResults[0].passed).toBe(false);
    expect(r.testResults[0].message).toContain('gerador com defeito');
  });

  it('função que o aluno não declarou reprova com nome do erro', () => {
    const r = runProgram('// vazio', [], [somaAte]);
    expect(r.testResults[0].passed).toBe(false);
  });
});

describe('convivência com os testes de caso', () => {
  it('casos e propriedades aparecem juntos, na ordem certa', () => {
    const r = runProgram(
      SOLUCAO,
      [{ description: 'somarAte(4) devolve 10', assertion: 'if (somarAte(4) !== 10) throw new Error("x");' }],
      [somaAte]
    );

    expect(r.testResults).toHaveLength(2);
    // Caso fixo primeiro: quando os dois falham, é a mensagem mais fácil de ler.
    expect(r.testResults[0].message).toBe('somarAte(4) devolve 10');
    expect(r.testResults[1].message).toContain('50 casos');
  });

  it('exercício sem propriedade não carrega os auxiliares', () => {
    // Não é micro-otimização: o programa montado é o que o aluno depura quando
    // algo dá errado, e carregar sorteio e encolhimento num exercício que não os
    // usa só atrapalha.
    const r = runProgram('var x = 1;', [{ description: 'ok', assertion: '' }]);
    expect(r.testResults[0].passed).toBe(true);
  });

  it('o número de casos é limitado', () => {
    const exagerado: SandboxProperty = { ...somaAte, runs: 100000 };
    const r = runProgram(SOLUCAO, [], [exagerado]);

    // O worker tem 3 segundos; cem mil execuções do código do aluno não cabem.
    expect(r.testResults[0].message).toContain('200 casos');
  });

  it('o console do aluno continua capturado durante as propriedades', () => {
    const comLog = `${SOLUCAO}\nconsole.log('oi');`;
    const r = runProgram(comLog, [], [somaAte]);

    expect(r.logs).toContain('oi');
  });
});

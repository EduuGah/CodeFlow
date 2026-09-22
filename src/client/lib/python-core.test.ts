import { beforeAll, describe, expect, it } from 'vitest';

import { executarPython, montarPrograma, traduzirErroPython, type Interprete } from './python-core';
import { prepararPythonNoNode } from './python-node';

/**
 * O motor de Python, com o Pyodide de verdade.
 *
 * O que está sob teste é o julgamento — o código do aluno roda, cada teste
 * é uma função isolada cujo corpo é a asserção, uma exceção vira falha com
 * mensagem — e o isolamento entre execuções: uma variável de uma não pode
 * vazar para a próxima, porque o intérprete é reaproveitado (recarregá-lo
 * custa segundos), só o dicionário de globais é recriado.
 */

let interprete: Interprete;

beforeAll(async () => {
  interprete = await prepararPythonNoNode();
}, 60_000);

describe('montarPrograma', () => {
  it('indenta cada asserção como o corpo de uma função própria', () => {
    const programa = montarPrograma('def dobrar(x):\n    return x * 2', [
      { description: 'dobra 2', assertion: 'assert dobrar(2) == 4' },
    ]);

    expect(programa).toContain('def __cf_teste_0():\n        assert dobrar(2) == 4');
  });
});

describe('executarPython', () => {
  it('um teste que passa não aparece como erro', async () => {
    const resultado = executarPython(interprete, {
      code: 'def somar(a, b):\n    return a + b',
      tests: [{ description: 'somar(2, 3) é 5', assertion: 'assert somar(2, 3) == 5' }],
    });

    expect(resultado.error).toBeUndefined();
    expect(resultado.testResults).toEqual([{ passed: true, message: 'somar(2, 3) é 5' }]);
  });

  it('um assert com mensagem vira a mensagem da falha', async () => {
    const resultado = executarPython(interprete, {
      code: 'def somar(a, b):\n    return a - b',
      tests: [{ description: 'somar(2, 3) é 5', assertion: 'assert somar(2, 3) == 5, "a soma está errada"' }],
    });

    expect(resultado.testResults).toEqual([{ passed: false, message: 'a soma está errada' }]);
  });

  it('um erro sem mensagem cai no nome da exceção', async () => {
    const resultado = executarPython(interprete, {
      code: '',
      tests: [{ description: 'divide por zero', assertion: 'x = 1 / 0' }],
    });

    expect(resultado.testResults).toEqual([{ passed: false, message: 'division by zero' }]);
  });

  it('captura o print() do código do aluno', async () => {
    const resultado = executarPython(interprete, {
      code: 'print("oi")\nprint("de novo")',
      tests: [],
    });

    expect(resultado.logs).toEqual(['oi', 'de novo']);
  });

  it('um erro de sintaxe no código do aluno não roda teste nenhum', async () => {
    const resultado = executarPython(interprete, {
      code: 'def f(\n    return 1',
      tests: [{ description: 'nunca roda', assertion: 'assert True' }],
    });

    expect(resultado.testResults).toEqual([]);
    expect(resultado.error).toBeDefined();
  });

  it('cada execução começa com um dicionário de globais próprio — nada vaza de uma para a outra', async () => {
    executarPython(interprete, { code: 'x = 10', tests: [] });

    const resultado = executarPython(interprete, {
      code: '',
      tests: [{ description: 'x não deveria existir aqui', assertion: 'x' }],
    });

    expect(resultado.testResults).toEqual([{ passed: false, message: "name 'x' is not defined" }]);
  });

  it('testes rodam em ordem, e o código do aluno é visível para todos', async () => {
    const resultado = executarPython(interprete, {
      code: 'contador = []\n\ndef marcar(nome):\n    contador.append(nome)\n    return nome',
      tests: [
        { description: 'primeiro', assertion: 'assert marcar("a") == "a"' },
        { description: 'segundo, vê o que o primeiro fez', assertion: 'assert contador == ["a"]' },
      ],
    });

    expect(resultado.testResults).toEqual([
      { passed: true, message: 'primeiro' },
      { passed: true, message: 'segundo, vê o que o primeiro fez' },
    ]);
  });

  it('um laço sem condição de parada é interrompido, em vez de travar o processo', async () => {
    const resultado = executarPython(interprete, {
      code: 'contador = 0\nwhile True:\n    contador = 0',
      tests: [],
    });

    expect(resultado.timedOut).toBe(true);
    expect(resultado.error).toContain('interrompido');
  }, 15_000);
});

describe('traduzirErroPython', () => {
  it('NameError vira uma frase que orienta a conferir a grafia', () => {
    const frase = traduzirErroPython({ type: 'NameError', message: "NameError: name 'x' is not defined" });
    expect(frase).toContain('Confira a grafia');
  });

  it('AssertionError sem mensagem usa a condição como pista', () => {
    const frase = traduzirErroPython({ type: 'AssertionError', message: 'AssertionError' });
    expect(frase).toBe('a condição do assert é falsa.');
  });

  it('tipo desconhecido cai no formato genérico, sem quebrar', () => {
    const frase = traduzirErroPython({ type: 'FooError', message: 'FooError: algo bem específico' });
    expect(frase).toContain('FooError');
    expect(frase).toContain('algo bem específico');
  });
});

import { describe, expect, it } from 'vitest';

import { runProgram } from './sandbox-core';
import { OPCOES_DO_COMPILADOR, verificarTrechos } from './typescript-core';
import { ENUMS, compilarNoNode } from './typescript-node';

describe('o contrato com o Monaco', () => {
  it('os números das opções são as enumerações de verdade', () => {
    // O `typescript-core` não pode importar o pacote, então guarda números.
    // Se uma versão nova renumerar, este é o teste que avisa.
    expect(OPCOES_DO_COMPILADOR.target).toBe(ENUMS.ScriptTarget.ES2020);
    expect(OPCOES_DO_COMPILADOR.module).toBe(ENUMS.ModuleKind.None);
  });
});

describe('compilar no Node', () => {
  it('apaga os tipos e devolve JavaScript que roda no sandbox', async () => {
    const { js, erros } = compilarNoNode(
      'function somar(a: number, b: number): number { return a + b; }\nconsole.log(somar(2, 3));'
    );
    expect(erros).toEqual([]);
    expect(js).not.toMatch(/: number/);
    // O `buildProgram` já abre com "use strict"; o compilador não repete.
    expect(js).not.toMatch(/use strict/);

    const resultado = await runProgram(js, [
      { description: 'soma', assertion: 'if (somar(1, 2) !== 3) throw new Error("errado")' },
    ]);
    expect(resultado.logs).toEqual(['5']);
    expect(resultado.testResults).toEqual([{ passed: true, message: 'soma' }]);
  });

  it('recusa um tipo que não bate, com linha, coluna, código e explicação', () => {
    const { js, erros } = compilarNoNode("const a = 1;\nconst n: number = 'a';");
    expect(js).toBe('');
    expect(erros).toEqual([
      {
        linha: 2,
        coluna: 7,
        codigo: 2322,
        mensagem: "Type 'string' is not assignable to type 'number'.",
        explicacao: 'Um valor do tipo string não cabe onde se espera number.',
      },
    ]);
  });

  it('é estrito: parâmetro sem tipo é recusado', () => {
    const { erros } = compilarNoNode('function f(x) { return x; }');
    expect(erros.map((e) => e.codigo)).toEqual([7006]);
  });

  it('conhece o que o sandbox tem, e só isso', () => {
    // O que existe no worker compila.
    expect(
      compilarNoNode("console.log('a');\nsetTimeout(() => console.warn('b'), 0);\nconst t = setInterval(() => {}, 10);\nclearInterval(t);")
        .erros
    ).toEqual([]);

    // O DOM não existe no worker: é recusado na compilação, com a explicação
    // certa, em vez de compilar e explodir com ReferenceError.
    const { erros } = compilarNoNode('console.log(document.title);');
    expect(erros).toHaveLength(1);
    expect(erros[0].explicacao).toBe('document não existe no sandbox, que não tem DOM.');

    // Rede também não.
    expect(compilarNoNode("fetch('/x');").erros.map((e) => e.codigo)).toEqual([2304]);
  });

  it('recusa import: o exercício é um programa, não um módulo', () => {
    const { erros } = compilarNoNode("import x from 'y';\nconsole.log(x);");
    expect(erros.length).toBeGreaterThan(0);
    expect(erros[0].explicacao).toMatch(/Módulos não existem no sandbox/);
  });

  it('erro de sintaxe também é recusa, na linha certa', () => {
    const { erros } = compilarNoNode("const s = 'abc';\nconst t = s.");
    expect(erros[0].linha).toBe(2);
    expect(erros[0].codigo).toBe(1003);
  });

  it('enum, interface e tipo somem ou viram JavaScript que roda', async () => {
    const { js, erros } = compilarNoNode(
      'interface P { nome: string }\ntype Id = number;\nenum Cor { Vermelho, Verde }\nconst p: P = { nome: "Ana" };\nconst id: Id = Cor.Verde;\nconsole.log(p.nome, id);'
    );
    expect(erros).toEqual([]);
    const resultado = await runProgram(js, []);
    expect(resultado.logs).toEqual(['Ana 1']);
  });

  it('compilações seguidas não vazam declarações de uma para a outra', () => {
    compilarNoNode('const unica = 1;');
    // Se o serviço guardasse o arquivo anterior, `unica` já existiria aqui.
    expect(compilarNoNode('const unica = 2;').erros).toEqual([]);
  });
});

describe('trechos de tipo com o compilador de verdade', () => {
  const compilar = async (c: string) => compilarNoNode(c);
  const solucao = 'function somar(a: number, b: number): number { return a + b; }';
  const semTipo = 'function somar(a: any, b: any): any { return a + b; }';

  it('a solução tipada recusa o uso errado; a sem tipo aceita', async () => {
    const trechos = [
      { description: "recusa somar('a', 1)", code: "somar('a', 1);", rejects: true },
      { description: 'aceita somar(1, 2)', code: 'const r: number = somar(1, 2);' },
    ];

    expect((await verificarTrechos(compilar, solucao, trechos)).map((r) => r.passed)).toEqual([true, true]);
    expect((await verificarTrechos(compilar, semTipo, trechos)).map((r) => r.passed)).toEqual([false, true]);
  });
});

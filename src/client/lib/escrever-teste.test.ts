import { describe, expect, it } from 'vitest';

import { runProgram } from './sandbox-core';
import {
  avaliarTestes,
  montarPrograma,
  problemasDaEscritaDeTeste,
  type Sabotagem,
} from './escrever-teste';

const REFERENCIA = `function somar(lista) {
  let total = 0;
  for (const n of lista) total += n;
  return total;
}`;

const SABOTAGENS: Sabotagem[] = [
  {
    description: 'devolve sempre zero',
    code: 'function somar(lista) { return 0; }',
  },
  {
    description: 'esquece o último item',
    code: `function somar(lista) {
  let total = 0;
  for (let i = 0; i < lista.length - 1; i++) total += lista[i];
  return total;
}`,
  },
];

/** O sandbox de verdade — é o mesmo que roda no navegador do aluno. */
const executar = (programa: string) => runProgram(programa, []);

describe('montar o programa', () => {
  it('põe a implementação antes do teste do aluno', () => {
    const programa = montarPrograma('const x = 1;', 'assert(x === 1);');
    expect(programa.indexOf('const x = 1;')).toBeLessThan(programa.indexOf('assert(x === 1)'));
  });

  it('injeta o assert entre os dois', () => {
    expect(montarPrograma('a', 'b')).toContain('function assert(');
  });
});

describe('avaliar o teste do aluno', () => {
  it('aprova um teste que aceita a correta e pega as duas sabotagens', async () => {
    const veredito = await avaliarTestes(
      REFERENCIA,
      SABOTAGENS,
      `assert(somar([1, 2, 3]) === 6, 'a soma de 1, 2 e 3 é 6');
       assert(somar([5]) === 5, 'um item só');`,
      executar
    );

    expect(veredito.referenciaPassou).toBe(true);
    expect(veredito.sabotagens.every((s) => s.pego)).toBe(true);
    expect(veredito.aprovado).toBe(true);
  });

  /**
   * A lição central do exercício. Um arquivo de teste vazio passa em tudo, e é
   * exatamente por isso que "meus testes passaram" não é resultado nenhum.
   */
  it('reprova um teste vazio, que passaria em qualquer implementação', async () => {
    const veredito = await avaliarTestes(REFERENCIA, SABOTAGENS, '', executar);

    expect(veredito.referenciaPassou).toBe(true);
    expect(veredito.sabotagens.every((s) => !s.pego)).toBe(true);
    expect(veredito.aprovado).toBe(false);
  });

  it('reprova um teste que só chama a função sem verificar o resultado', async () => {
    const veredito = await avaliarTestes(REFERENCIA, SABOTAGENS, 'somar([1, 2, 3]);', executar);
    expect(veredito.aprovado).toBe(false);
  });

  /**
   * Um teste fraco pega uma sabotagem e não pega a outra — e o veredito precisa
   * dizer **qual** passou, senão o aluno não sabe o que acrescentar.
   */
  it('diz exatamente qual sabotagem escapou', async () => {
    const veredito = await avaliarTestes(
      REFERENCIA,
      SABOTAGENS,
      // Verifica só um caso, e de um jeito que a versão "sem o último item"
      // também satisfaz: [7] menos o último é [], que soma 0... então esta pega.
      // Já a que devolve sempre zero é pega também. Um caso que engana as duas
      // é a lista vazia:
      `assert(somar([]) === 0, 'lista vazia soma zero');`,
      executar
    );

    expect(veredito.referenciaPassou).toBe(true);
    expect(veredito.sabotagens.find((s) => s.description === 'devolve sempre zero')?.pego).toBe(
      false
    );
    expect(veredito.aprovado).toBe(false);
  });

  it('reprova um teste que recusa a implementação correta', async () => {
    const veredito = await avaliarTestes(
      REFERENCIA,
      SABOTAGENS,
      `assert(somar([1, 2]) === 99, 'expectativa errada');`,
      executar
    );

    expect(veredito.referenciaPassou).toBe(false);
    expect(veredito.erroNaReferencia).toContain('expectativa errada');
    expect(veredito.aprovado).toBe(false);
  });

  it('um teste que sempre lança também é reprovado', async () => {
    const veredito = await avaliarTestes(
      REFERENCIA,
      SABOTAGENS,
      `throw new Error('sempre falho');`,
      executar
    );

    // Ele "pega" todas as sabotagens, mas recusa a correta — que é o que impede
    // a trapaça de reprovar tudo.
    expect(veredito.sabotagens.every((s) => s.pego)).toBe(true);
    expect(veredito.referenciaPassou).toBe(false);
    expect(veredito.aprovado).toBe(false);
  });

  it('devolve um resultado por sabotagem, na ordem declarada', async () => {
    const veredito = await avaliarTestes(REFERENCIA, SABOTAGENS, '', executar);
    expect(veredito.sabotagens.map((s) => s.description)).toEqual(
      SABOTAGENS.map((s) => s.description)
    );
  });
});

describe('validação do conteúdo', () => {
  it('aceita um exercício bem formado', () => {
    expect(problemasDaEscritaDeTeste({ subject: REFERENCIA, mutants: SABOTAGENS })).toEqual([]);
  });

  it('recusa exercício sem sabotagem, em que um teste vazio passaria', () => {
    expect(
      problemasDaEscritaDeTeste({ subject: REFERENCIA, mutants: [] }).join(' ')
    ).toContain('teste vazio');
  });

  it('recusa sabotagem idêntica à implementação correta', () => {
    const problemas = problemasDaEscritaDeTeste({
      subject: REFERENCIA,
      mutants: [{ description: 'não muda nada', code: REFERENCIA }],
    });

    // Nenhum teste conseguiria pegá-la: o exercício ficaria impossível.
    expect(problemas.join(' ')).toContain('igual à implementação correta');
  });

  it('recusa duas sabotagens com a mesma descrição', () => {
    const problemas = problemasDaEscritaDeTeste({
      subject: REFERENCIA,
      mutants: [SABOTAGENS[0], { ...SABOTAGENS[1], description: SABOTAGENS[0].description }],
    });

    expect(problemas.join(' ')).toContain('duas vezes');
  });
});

import { describe, expect, it } from 'vitest';

import { runProgram } from './sandbox-core';
import {
  contarLacunas,
  dividirMolde,
  estaCompleto,
  preencher,
  problemasDoMolde,
} from './fill-blank';

/**
 * A lacuna é o degrau entre "escolher a alternativa certa" e "escrever a função
 * do zero". Se ela recusar uma resposta correta escrita de outro jeito, ensina o
 * aluno a adivinhar o gabarito — que é pior do que não existir.
 */

const MOLDE = 'function dobro(n) {\n  return n {{1}} 2;\n}';

describe('divisão do molde', () => {
  it('separa texto e lacunas na ordem em que aparecem', async () => {
    expect(dividirMolde(MOLDE)).toEqual([
      { tipo: 'texto', conteudo: 'function dobro(n) {\n  return n ' },
      { tipo: 'lacuna', indice: 0 },
      { tipo: 'texto', conteudo: ' 2;\n}' },
    ]);
  });

  it('a numeração do autor começa em 1, a do código em 0', async () => {
    const segmentos = dividirMolde('a {{1}} b {{2}}');
    const lacunas = segmentos.filter((s) => s.tipo === 'lacuna');

    expect(lacunas).toEqual([
      { tipo: 'lacuna', indice: 0 },
      { tipo: 'lacuna', indice: 1 },
    ]);
  });

  it('molde sem lacuna nenhuma é um texto só', async () => {
    expect(dividirMolde('const x = 1;')).toEqual([{ tipo: 'texto', conteudo: 'const x = 1;' }]);
  });

  it('lacuna repetida conta uma vez só', async () => {
    // O mesmo campo pode aparecer em dois lugares do código.
    expect(contarLacunas('{{1}} e depois {{1}}')).toBe(1);
  });
});

describe('preenchimento', () => {
  it('coloca a resposta no lugar da lacuna', async () => {
    expect(preencher(MOLDE, ['*'])).toBe('function dobro(n) {\n  return n * 2;\n}');
  });

  it('a mesma lacuna repetida recebe a mesma resposta', async () => {
    expect(preencher('{{1}} + {{1}}', ['x'])).toBe('x + x');
  });

  it('lacuna vazia vira espaço, não nada', async () => {
    // Colar os dois lados produziria `returnn` a partir de `return {{1}}n`, e o
    // erro de sintaxe não teria relação com o que o aluno fez.
    expect(preencher('return {{1}}n;', [''])).toBe('return  n;');
  });
});

describe('estado do exercício', () => {
  it('lacuna em branco impede a verificação', async () => {
    expect(estaCompleto('a {{1}} b {{2}}', ['x', ''])).toBe(false);
    expect(estaCompleto('a {{1}} b {{2}}', ['x', '  '])).toBe(false);
  });

  it('todas preenchidas libera', async () => {
    expect(estaCompleto('a {{1}} b {{2}}', ['x', 'y'])).toBe(true);
  });
});

describe('erros de autoria aparecem no CI, não para o aluno', () => {
  it('numeração com buraco é recusada', async () => {
    // {{2}} sem campo na tela deixa o exercício sem solução possível.
    const problemas = problemasDoMolde('a {{1}} b {{3}}', 2);
    expect(problemas.some((p) => p.includes('{{2}}'))).toBe(true);
  });

  it('molde sem lacuna é recusado', async () => {
    expect(problemasDoMolde('const x = 1;', 1)).toHaveLength(1);
  });

  it('contagem declarada diferente da real é recusada', async () => {
    const problemas = problemasDoMolde('a {{1}}', 2);
    expect(problemas.some((p) => p.includes('foram declaradas 2'))).toBe(true);
  });

  it('molde correto não gera problema', async () => {
    expect(problemasDoMolde(MOLDE, 1)).toEqual([]);
  });
});

describe('a correção aceita respostas diferentes que funcionam', () => {
  const testes = [
    {
      description: 'dobro(5) devolve 10',
      assertion: 'if (dobro(5) !== 10) throw new Error("devolveu " + dobro(5));',
    },
  ];

  it.each([['*'], ['* 4 /'], ['* 2 / 2 *']])('aceita "%s", porque o resultado está certo', async (resposta) => {
    // Comparar com um gabarito de texto recusaria as duas últimas. O que
    // interessa é o comportamento.
    const codigo = preencher(MOLDE, [resposta]);
    const r = await runProgram(codigo, testes);

    expect(r.error).toBeUndefined();
    expect(r.testResults[0].passed).toBe(true);
  });

  it('recusa uma resposta que não resolve', async () => {
    const r = await runProgram(preencher(MOLDE, ['+']), testes);
    expect(r.testResults[0].passed).toBe(false);
  });

  it('erro de sintaxe na lacuna vira mensagem, não tela quebrada', async () => {
    const r = await runProgram(preencher(MOLDE, ['*(']), testes);
    expect(r.error).toBeDefined();
  });
});

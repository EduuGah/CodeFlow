import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  achatarMensagem,
  explicarErro,
  formatarErros,
  posicaoNoTexto,
  verificarTrechos,
  type Compilacao,
  type Compilador,
} from './typescript-core';
import { VERSAO_DO_TYPESCRIPT } from './typescript-node';

describe('explicar erro', () => {
  it('traduz a mensagem usando os tipos que ela cita', () => {
    expect(explicarErro(2322, "Type 'string' is not assignable to type 'number'.")).toBe(
      'Um valor do tipo string não cabe onde se espera number.'
    );
    expect(explicarErro(2339, "Property 'nome' does not exist on type 'Pessoa'.")).toBe(
      'O tipo Pessoa não tem a propriedade nome.'
    );
    expect(explicarErro(2554, 'Expected 2 arguments, but got 1.')).toBe(
      'A função pede 2 argumento(s) e recebeu 1.'
    );
  });

  it('cai na explicação genérica quando a mensagem tem um formato que não previu', () => {
    // O TypeScript muda a redação entre versões; a explicação genérica
    // continua valendo, e o aluno não fica sem nada.
    expect(explicarErro(2322, 'Type is weird in a new way.')).toBe(
      'O valor é de um tipo, e o lugar onde ele foi posto espera outro.'
    );
  });

  it('não inventa explicação para código desconhecido', () => {
    expect(explicarErro(99999, 'Whatever.')).toBeUndefined();
  });
});

describe('cadeia de mensagens', () => {
  it('devolve a string como veio', () => {
    expect(achatarMensagem('Simples.')).toBe('Simples.');
  });

  it('une a cadeia com setas, do resumo ao detalhe, com limite', () => {
    const cadeia = {
      messageText: 'A.',
      next: [{ messageText: 'B.', next: [{ messageText: 'C.', next: [{ messageText: 'D.' }] }] }],
    };
    expect(achatarMensagem(cadeia)).toBe('A. → B. → C.');
    expect(achatarMensagem(cadeia, 1)).toBe('A.');
  });
});

describe('posição no texto', () => {
  it('conta linha e coluna a partir de 1', () => {
    expect(posicaoNoTexto('ab\ncd\nef', 0)).toEqual({ linha: 1, coluna: 1 });
    expect(posicaoNoTexto('ab\ncd\nef', 4)).toEqual({ linha: 2, coluna: 2 });
    expect(posicaoNoTexto('ab\ncd\nef', 6)).toEqual({ linha: 3, coluna: 1 });
  });

  it('não estoura com deslocamento fora do texto', () => {
    expect(posicaoNoTexto('ab', 99)).toEqual({ linha: 1, coluna: 3 });
  });
});

describe('formatar erros', () => {
  it('uma linha por erro, com a linha do código e a explicação quando há', () => {
    const texto = formatarErros([
      { linha: 3, coluna: 1, codigo: 2322, mensagem: 'M1', explicacao: 'E1' },
      { linha: 5, coluna: 2, codigo: 1005, mensagem: 'M2' },
    ]);
    expect(texto).toBe(
      'O compilador recusou o programa por 2 erros de tipo:\nLinha 3: M1 — E1\nLinha 5: M2'
    );
  });

  it('usa o singular para um erro só', () => {
    expect(
      formatarErros([{ linha: 1, coluna: 1, codigo: 1, mensagem: 'M' }])
    ).toMatch(/^O compilador recusou o programa por 1 erro de tipo:/);
  });
});

describe('trechos de tipo', () => {
  // Um compilador de mentira: recusa qualquer programa que contenha "RUIM".
  const compilador: Compilador = async (codigo): Promise<Compilacao> =>
    codigo.includes('RUIM')
      ? { js: '', erros: [{ linha: 1, coluna: 1, codigo: 2322, mensagem: 'ruim', explicacao: 'é ruim' }] }
      : { js: codigo, erros: [] };

  it('um trecho que precisa ser recusado passa quando o compilador recusa', async () => {
    const [r] = await verificarTrechos(compilador, 'ok', [
      { description: 'recusa RUIM', code: 'RUIM', rejects: true },
    ]);
    expect(r).toEqual({ passed: true, message: 'recusa RUIM' });
  });

  it('um trecho que precisa ser recusado falha quando o compilador aceita, e diz isso', async () => {
    const [r] = await verificarTrechos(compilador, 'ok', [
      { description: 'recusa X', code: 'X', rejects: true },
    ]);
    expect(r.passed).toBe(false);
    expect(r.message).toBe('recusa X — mas o compilador aceitou. O tipo ainda deixa esse uso passar.');
  });

  it('um trecho que precisa ser aceito falha com o erro do compilador na mensagem', async () => {
    const [r] = await verificarTrechos(compilador, 'ok', [{ description: 'aceita RUIM', code: 'RUIM' }]);
    expect(r.passed).toBe(false);
    expect(r.message).toBe('aceita RUIM — mas o compilador recusou: ruim (é ruim)');
  });

  it('o trecho é compilado junto com o código do aluno', async () => {
    const [r] = await verificarTrechos(compilador, 'RUIM', [{ description: 'aceita', code: 'ok' }]);
    expect(r.passed).toBe(false);
  });
});

describe('os dois compiladores são a mesma versão', () => {
  it('o TypeScript que o Monaco embute é o mesmo do pacote typescript', () => {
    // O navegador compila com o worker do Monaco; o CI, com o pacote. Versões
    // diferentes aceitariam programas diferentes, e o CI deixaria de provar o
    // que o aluno vai ver.
    const metadados = readFileSync(
      'node_modules/monaco-editor/esm/vs/languages/features/typescript/lib/typescriptServicesMetadata.js',
      'utf-8'
    );
    const versaoDoMonaco = metadados.match(/typescriptVersion = "([^"]+)"/)?.[1];
    expect(versaoDoMonaco).toBe(VERSAO_DO_TYPESCRIPT);
  });
});

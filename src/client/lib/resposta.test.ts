import { describe, expect, it } from 'vitest';

import {
  LIMITE_DE_CODIGO,
  LIMITE_DE_LACUNA,
  LIMITE_DE_TEXTO,
  lerResposta,
  primeiraFalha,
  resumirFeedback,
  resumirResposta,
  type RespostaEnviada,
} from './resposta';

describe('a resposta que vai para o banco', () => {
  it('corta cada texto no seu teto, com reticências para dizer que cortou', () => {
    const codigo = resumirResposta({ tipo: 'codigo', codigo: 'a'.repeat(LIMITE_DE_CODIGO + 10) });
    expect(codigo).toEqual({ tipo: 'codigo', codigo: `${'a'.repeat(LIMITE_DE_CODIGO)}…` });

    const previsao = resumirResposta({ tipo: 'previsao', texto: 'b'.repeat(LIMITE_DE_TEXTO + 1) });
    expect(previsao.tipo === 'previsao' && previsao.texto.length).toBe(LIMITE_DE_TEXTO + 1);

    const lacunas = resumirResposta({ tipo: 'lacunas', valores: ['c'.repeat(LIMITE_DE_LACUNA + 5), 'curta'] });
    expect(lacunas).toEqual({ tipo: 'lacunas', valores: [`${'c'.repeat(LIMITE_DE_LACUNA)}…`, 'curta'] });
  });

  it('o que cabe passa sem mudança', () => {
    const casos: RespostaEnviada[] = [
      { tipo: 'alternativa', indice: 2 },
      { tipo: 'linha', linha: 7 },
      { tipo: 'ordem', ids: ['a', 'b', 'c'] },
      { tipo: 'codigo', codigo: 'return 1' },
    ];
    for (const caso of casos) expect(resumirResposta(caso)).toEqual(caso);
  });

  it('o retorno vazio não vai; o longo vai cortado', () => {
    expect(resumirFeedback('   ')).toBeUndefined();
    expect(resumirFeedback(undefined)).toBeUndefined();
    expect(resumirFeedback('x'.repeat(2000))).toHaveLength(LIMITE_DE_TEXTO + 1);
  });

  it('a primeira falha: o erro, se houve; senão, a primeira verificação reprovada', () => {
    expect(primeiraFalha({ error: 'SyntaxError', testResults: [] })).toBe('SyntaxError');
    expect(
      primeiraFalha({
        testResults: [
          { passed: true, message: 'ok' },
          { passed: false, message: 'Esperado 2, recebido 1.' },
          { passed: false, message: 'outra' },
        ],
      })
    ).toBe('Esperado 2, recebido 1.');
    expect(primeiraFalha({ testResults: [{ passed: true, message: 'ok' }] })).toBeUndefined();
  });
});

describe('a resposta que volta do banco', () => {
  it('ida e volta: o que se grava, se lê igual', () => {
    const casos: RespostaEnviada[] = [
      { tipo: 'alternativa', indice: 0 },
      { tipo: 'previsao', texto: '3\n4' },
      { tipo: 'lacunas', valores: ['i < n', ''] },
      { tipo: 'linha', linha: 4 },
      { tipo: 'ordem', ids: ['p2', 'p1'] },
      { tipo: 'codigo', codigo: 'const x = 1;' },
    ];
    for (const caso of casos) expect(lerResposta(JSON.parse(JSON.stringify(resumirResposta(caso))))).toEqual(caso);
  });

  it('o que não tem o formato vira nulo, não um objeto meio lido', () => {
    for (const valor of [
      null,
      'texto',
      [],
      { tipo: 'alternativa', indice: '2' },
      { tipo: 'lacunas', valores: [1, 2] },
      { tipo: 'ordem', ids: 'a,b' },
      { tipo: 'codigo' },
      { tipo: 'desconhecido', codigo: 'x' },
    ]) {
      expect(lerResposta(valor), JSON.stringify(valor)).toBeNull();
    }
  });
});

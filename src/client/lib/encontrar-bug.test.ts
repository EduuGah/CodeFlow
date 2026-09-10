import { describe, expect, it } from 'vitest';

import {
  corrigirLinha,
  linhasNumeradas,
  podeSerResposta,
  problemasDoBug,
} from './encontrar-bug';

const CODIGO = `function dobro(n) {
  return n * 3;
}

console.log(dobro(2));`;

describe('numerar linhas', () => {
  it('começa em 1, como o aluno lê e como o erro reporta', () => {
    const linhas = linhasNumeradas(CODIGO);
    expect(linhas[0]).toEqual({ numero: 1, texto: 'function dobro(n) {' });
  });

  it('mantém as linhas em branco, para a contagem não escorregar', () => {
    const linhas = linhasNumeradas(CODIGO);
    expect(linhas).toHaveLength(5);
    // 1: assinatura, 2: return, 3: fecha, 4: em branco, 5: a chamada.
    expect(linhas[3].texto).toBe('');
  });

  it('preserva a indentação', () => {
    expect(linhasNumeradas(CODIGO)[1].texto).toBe('  return n * 3;');
  });
});

describe('linha que pode ser resposta', () => {
  it('código conta', () => {
    expect(podeSerResposta('  return n * 3;')).toBe(true);
  });

  it('branco e comentário não contam', () => {
    expect(podeSerResposta('')).toBe(false);
    expect(podeSerResposta('   ')).toBe(false);
    expect(podeSerResposta('  // um comentário')).toBe(false);
  });
});

describe('corrigir uma linha', () => {
  it('troca só a linha indicada', () => {
    const corrigido = corrigirLinha(CODIGO, 2, '  return n * 2;');
    expect(corrigido).toContain('return n * 2;');
    expect(corrigido).not.toContain('return n * 3;');
    expect(corrigido.split('\n')).toHaveLength(5);
  });

  it('número fora da faixa devolve o código intacto', () => {
    expect(corrigirLinha(CODIGO, 0, 'x')).toBe(CODIGO);
    expect(corrigirLinha(CODIGO, 99, 'x')).toBe(CODIGO);
  });
});

describe('validação do conteúdo', () => {
  it('aceita um exercício bem formado', () => {
    expect(problemasDoBug({ code: CODIGO, buggyLine: 2, symptomLine: 5 })).toEqual([]);
  });

  it('recusa linha fora do programa', () => {
    expect(problemasDoBug({ code: CODIGO, buggyLine: 99 }).join(' ')).toContain('fora do programa');
    expect(problemasDoBug({ code: CODIGO, buggyLine: 0 }).join(' ')).toContain('fora do programa');
  });

  it('recusa linha em branco ou comentário como resposta', () => {
    // A linha 4 é vazia: apontar para ela é quase sempre um erro de contagem —
    // e escrevi 3 na primeira versão deste teste, que é justamente o engano que
    // esta validação existe para pegar.
    expect(problemasDoBug({ code: CODIGO, buggyLine: 4 }).join(' ')).toContain('em branco');
  });

  /**
   * Se sintoma e defeito fossem a mesma linha, o exercício perderia o motivo de
   * existir: a graça é o erro aparecer num lugar e nascer em outro.
   */
  it('recusa sintoma igual ao defeito', () => {
    expect(problemasDoBug({ code: CODIGO, buggyLine: 2, symptomLine: 2 }).join(' ')).toContain(
      'mesma do defeito'
    );
  });

  it('sintoma é opcional', () => {
    expect(problemasDoBug({ code: CODIGO, buggyLine: 2 })).toEqual([]);
  });
});

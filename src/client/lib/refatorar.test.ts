import { describe, expect, it } from 'vitest';

import {
  avaliarRestricoes,
  linhasDeCodigo,
  problemasDaRefatoracao,
  todasCumpridas,
  type Restricao,
} from './refatorar';

const COM_LACO = `function caros(produtos) {
  const saida = [];

  // percorre tudo
  for (const p of produtos) {
    if (p.preco > 100) saida.push(p.nome);
  }

  return saida;
}`;

const REFATORADO = `function caros(produtos) {
  return produtos.filter((p) => p.preco > 100).map((p) => p.nome);
}`;

describe('contar linhas de código', () => {
  it('ignora branco e comentário', () => {
    // 10 linhas no total; 2 em branco e 1 de comentário ficam de fora.
    expect(linhasDeCodigo(COM_LACO)).toHaveLength(7);
  });

  it('conta o refatorado corretamente', () => {
    expect(linhasDeCodigo(REFATORADO)).toHaveLength(3);
  });

  it('código vazio tem zero linhas', () => {
    expect(linhasDeCodigo('')).toEqual([]);
    expect(linhasDeCodigo('\n\n   \n// só comentário')).toEqual([]);
  });
});

describe('restrição do que não pode aparecer', () => {
  const semLaco: Restricao[] = [{ description: 'sem laço manual', forbidden: 'for (' }];

  it('reprova quando o trecho continua lá', () => {
    const [r] = avaliarRestricoes(COM_LACO, semLaco);
    expect(r.cumprida).toBe(false);
    expect(r.motivo).toContain('for (');
  });

  it('aprova quando o trecho sumiu', () => {
    expect(avaliarRestricoes(REFATORADO, semLaco)[0].cumprida).toBe(true);
  });
});

describe('restrição do que precisa aparecer', () => {
  const comFilter: Restricao[] = [{ description: 'use filter', required: '.filter(' }];

  it('reprova quando falta', () => {
    const [r] = avaliarRestricoes(COM_LACO, comFilter);
    expect(r.cumprida).toBe(false);
    expect(r.motivo).toContain('.filter(');
  });

  it('aprova quando está lá', () => {
    expect(avaliarRestricoes(REFATORADO, comFilter)[0].cumprida).toBe(true);
  });
});

describe('teto de linhas', () => {
  const ateTres: Restricao[] = [{ description: 'no máximo 3 linhas', maxLines: 3 }];

  it('reprova o que passa do teto, dizendo por quanto', () => {
    const [r] = avaliarRestricoes(COM_LACO, ateTres);
    expect(r.cumprida).toBe(false);
    expect(r.motivo).toContain('7 linhas');
    expect(r.motivo).toContain('limite é 3');
  });

  it('aprova o que cabe', () => {
    expect(avaliarRestricoes(REFATORADO, ateTres)[0].cumprida).toBe(true);
  });

  /**
   * Um teto que contasse comentário puniria quem explica o próprio código — o
   * contrário do que a plataforma inteira defende.
   */
  it('comentário não consome o teto', () => {
    const comentado = `// explica o porquê\n${REFATORADO}\n// e o resto`;
    expect(avaliarRestricoes(comentado, ateTres)[0].cumprida).toBe(true);
  });
});

describe('várias restrições juntas', () => {
  const todas: Restricao[] = [
    { description: 'sem laço manual', forbidden: 'for (' },
    { description: 'use filter', required: '.filter(' },
    { description: 'no máximo 3 linhas', maxLines: 3 },
  ];

  it('o refatorado cumpre todas', () => {
    expect(todasCumpridas(avaliarRestricoes(REFATORADO, todas))).toBe(true);
  });

  it('o de partida não cumpre nenhuma, e cada uma diz o porquê', () => {
    const resultados = avaliarRestricoes(COM_LACO, todas);
    expect(resultados.every((r) => !r.cumprida)).toBe(true);
    expect(resultados.every((r) => Boolean(r.motivo))).toBe(true);
  });

  it('devolve um resultado por restrição, na ordem declarada', () => {
    expect(avaliarRestricoes(REFATORADO, todas).map((r) => r.description)).toEqual(
      todas.map((r) => r.description)
    );
  });
});

describe('validação do conteúdo', () => {
  it('aceita um exercício bem formado', () => {
    expect(
      problemasDaRefatoracao({
        initialCode: COM_LACO,
        constraints: [{ description: 'sem laço', forbidden: 'for (' }],
      })
    ).toEqual([]);
  });

  it('recusa exercício sem restrição nenhuma', () => {
    expect(
      problemasDaRefatoracao({ initialCode: COM_LACO, constraints: [] }).join(' ')
    ).toContain('sem restrição');
  });

  it('recusa restrição que não verifica nada', () => {
    const problemas = problemasDaRefatoracao({
      initialCode: COM_LACO,
      constraints: [{ description: 'melhore o código' }],
    });
    expect(problemas.join(' ')).toContain('não verifica nada');
  });

  /**
   * Se o ponto de partida já cumprisse tudo, o aluno apertaria "verificar" e
   * passaria sem tocar no código.
   */
  it('recusa exercício em que o código de partida já está pronto', () => {
    const problemas = problemasDaRefatoracao({
      initialCode: REFATORADO,
      constraints: [{ description: 'sem laço', forbidden: 'for (' }],
    });
    expect(problemas.join(' ')).toContain('já cumpre todas');
  });
});

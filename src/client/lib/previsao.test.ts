import { describe, expect, it } from 'vitest';

import { normalizarSaida, previsaoConfere } from './previsao';

describe('a previsão confere com a saída', () => {
  it('ignora espaços nas pontas das linhas e linhas em branco no fim', () => {
    expect(previsaoConfere('  escuro \nundefined\n\n', 'escuro\nundefined')).toBe(true);
  });

  it('numa lista, o espaço depois da vírgula não conta', () => {
    expect(previsaoConfere('[15, 25, 35]', '[15,25,35]')).toBe(true);
    expect(previsaoConfere('[undefined, undefined, undefined]', '[undefined,undefined,undefined]')).toBe(true);
  });

  it('num objeto, nem o espaço depois dos dois-pontos', () => {
    expect(previsaoConfere('{"x": 1, "y": 2}', '{"x":1,"y":2}')).toBe(true);
  });

  it('o valor continua contando: número errado é previsão errada', () => {
    expect(previsaoConfere('[15, 25, 36]', '[15,25,35]')).toBe(false);
  });

  it('o espaço de dentro dos colchetes conta — é o que a aula de textos mostra', () => {
    // ex-js-9-prever-imutavel imprime `[  Ana  ]` e `[Ana]` para mostrar o trim.
    expect(previsaoConfere('[Ana]', '[  Ana  ]')).toBe(false);
  });

  it('numa frase, a vírgula seguida de espaço é texto, e conta', () => {
    expect(previsaoConfere('Ana,28 anos', 'Ana, 28 anos')).toBe(false);
  });

  it('só a linha que é lista ou objeto relaxa, as outras não', () => {
    expect(normalizarSaida('[1, 2]\na, b')).toBe('[1,2]\na, b');
  });
});

import { describe, expect, it } from 'vitest';

import { trancarGlobais } from './trancar-globais';

/**
 * Um escopo de mentira com o mesmo formato do de um worker: `fetch` e
 * `indexedDB` no protótipo (como em `WorkerGlobalScope.prototype`), e um
 * construtor como propriedade própria (como `XMLHttpRequest`).
 */
function escopoDeWorker() {
  class EscopoGlobal {
    fetch() {
      return 'saiu para a rede';
    }
    get indexedDB() {
      return 'banco do domínio';
    }
  }
  const escopo = Object.create(EscopoGlobal.prototype) as Record<string, unknown>;
  escopo.XMLHttpRequest = function XMLHttpRequest() {};
  return { escopo, prototipo: EscopoGlobal.prototype as unknown as Record<string, unknown> };
}

describe('trancar as globais de um worker', () => {
  it('some do escopo', () => {
    const { escopo } = escopoDeWorker();
    trancarGlobais(escopo);

    expect(escopo.fetch).toBeUndefined();
    expect(escopo.indexedDB).toBeUndefined();
    expect(escopo.XMLHttpRequest).toBeUndefined();
  });

  it('e do protótipo: pedir pelo protótipo não devolve a API', () => {
    // O desvio que a versão antiga deixava aberto.
    const { escopo, prototipo } = escopoDeWorker();
    trancarGlobais(escopo);

    expect(Object.getPrototypeOf(escopo).fetch).toBeUndefined();
    expect(prototipo.fetch).toBeUndefined();
    expect(prototipo.indexedDB).toBeUndefined();
  });

  it('não dá para pôr de volta', () => {
    const { escopo } = escopoDeWorker();
    trancarGlobais(escopo);

    expect(() => {
      'use strict';
      (escopo as { fetch: unknown }).fetch = () => 'de volta';
    }).toThrow(TypeError);
    expect(escopo.fetch).toBeUndefined();
  });

  it('deixa o resto do escopo como estava', () => {
    const { escopo } = escopoDeWorker();
    escopo.postMessage = () => 'ok';
    trancarGlobais(escopo);

    expect((escopo.postMessage as () => string)()).toBe('ok');
  });
});

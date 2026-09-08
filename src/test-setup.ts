import { vi } from 'vitest';

/**
 * Preparação comum das suítes.
 *
 * Roda para todos os testes, inclusive os de lógica pura em ambiente Node — daí
 * a checagem de `window`. Sem ela, os testes de biblioteca quebrariam com
 * "window is not defined" antes mesmo de começar.
 */
if (typeof window !== 'undefined') {
  const { cleanup } = await import('@testing-library/react');
  const { afterEach } = await import('vitest');

  await import('@testing-library/jest-dom/vitest');

  // Cada teste começa com a árvore limpa.
  afterEach(cleanup);

  /**
   * O jsdom não implementa estas duas, e componentes reais dependem delas.
   * Sem os substitutos o teste quebraria por limitação do ambiente, não por
   * defeito do código — que é o pior tipo de teste vermelho.
   */
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  // O jsdom não tem layout, então `scrollTo` lança "Not implemented" e polui o
  // stderr do CI. Ruído constante ensina a ignorar o stderr, que é onde os
  // problemas de verdade aparecem.
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
}

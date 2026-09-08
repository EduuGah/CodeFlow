import { afterEach, describe, expect, it, vi } from 'vitest';

import confetti from 'canvas-confetti';
import { celebrar } from './celebrar';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

/**
 * A regra é uma só, e é sobre saúde, não sobre estética: quem pediu menos
 * movimento ao sistema operacional não recebe a explosão de partículas.
 */

const disparou = vi.mocked(confetti);

/** Substitui `matchMedia` para simular a preferência do sistema. */
function comPreferencia(reduzir: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduzir && query.includes('reduce'),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => {
  disparou.mockClear();
  vi.unstubAllGlobals();
});

describe('respeito à preferência de movimento', () => {
  it('não dispara nada quando a pessoa pediu menos movimento', () => {
    comPreferencia(true);
    celebrar('aula');

    // O `prefers-reduced-motion` do CSS não alcança um canvas desenhado por JS:
    // sem esta checagem, a explosão acontecia mesmo assim.
    expect(disparou).not.toHaveBeenCalled();
  });

  it('dispara quando não há restrição', () => {
    comPreferencia(false);
    celebrar('aula');

    expect(disparou).toHaveBeenCalledTimes(1);
  });

  it('também vale para a conclusão de projeto', () => {
    comPreferencia(true);
    celebrar('projeto');

    expect(disparou).not.toHaveBeenCalled();
  });

  it('sem matchMedia, escolhe o silêncio', () => {
    vi.stubGlobal('matchMedia', undefined);
    celebrar('aula');

    // Não dá para saber a preferência; disparar seria decidir contra quem
    // poderia ser prejudicado.
    expect(disparou).not.toHaveBeenCalled();
  });
});

describe('intensidade', () => {
  it('o projeto comemora mais do que a aula', () => {
    comPreferencia(false);

    celebrar('aula');
    const aula = disparou.mock.calls[0][0]!;

    celebrar('projeto');
    const projeto = disparou.mock.calls[1][0]!;

    // Concluir um projeto é o marco maior dos dois; a diferença é deliberada.
    expect(projeto.particleCount).toBeGreaterThan(aula.particleCount!);
    expect(projeto.spread).toBeGreaterThan(aula.spread!);
  });

  it('usa a paleta do produto', () => {
    comPreferencia(false);
    celebrar('aula');

    expect(disparou.mock.calls[0][0]!.colors).toEqual(['#2b8078', '#d99422', '#2f8f4e']);
  });
});

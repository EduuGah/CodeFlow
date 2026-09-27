import { afterEach, describe, expect, it, vi } from 'vitest';

import confetti from 'canvas-confetti';
import { celebrar, disparosDe } from './celebrar';
import { CELEBRACOES } from './celebracoes';

// A chuva de código desenha caracteres com `shapeFromText`, que precisa de
// canvas: o dublê devolve uma forma marcada com o texto.
vi.mock('canvas-confetti', () => ({
  default: Object.assign(vi.fn(), {
    shapeFromText: vi.fn(({ text }: { text: string }) => ({ type: 'bitmap', texto: text })),
  }),
}));

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
  vi.useRealTimers();
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

describe('as celebrações da loja', () => {
  const particulas = (id: string, intensidade: 'aula' | 'projeto') =>
    disparosDe(id, intensidade).reduce((soma, d) => soma + (d.opcoes.particleCount ?? 0), 0);

  it.each(CELEBRACOES.map((c) => [c.id]))('%s: o projeto comemora mais do que a aula', (id) => {
    expect(particulas(id, 'projeto')).toBeGreaterThan(particulas(id, 'aula'));
  });

  it('cada uma se move do seu jeito — nenhuma é o confete com outro nome', () => {
    const assinaturas = CELEBRACOES.map((c) => JSON.stringify(disparosDe(c.id, 'aula')));
    expect(new Set(assinaturas).size).toBe(CELEBRACOES.length);
  });

  it('sem nada equipado, ou com um id que não existe, toca o confete', () => {
    expect(disparosDe('', 'aula')).toEqual(disparosDe('confete', 'aula'));
    expect(disparosDe('que-nao-existe', 'aula')).toEqual(disparosDe('confete', 'aula'));
  });

  it('a comprada também respeita o menos movimento — nem depois, nos disparos atrasados', () => {
    vi.useFakeTimers();
    comPreferencia(true);
    for (const c of CELEBRACOES) celebrar('projeto', c.id);
    vi.advanceTimersByTime(5000);
    expect(disparou).not.toHaveBeenCalled();
  });

  it('os fogos estouram um depois do outro, não todos juntos', () => {
    vi.useFakeTimers();
    comPreferencia(false);
    celebrar('aula', 'fogos');
    expect(disparou).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(2000);
    expect(disparou).toHaveBeenCalledTimes(3);
  });

  it('as bolhas sobem: gravidade negativa, saindo de baixo', () => {
    for (const { opcoes } of disparosDe('bolhas', 'aula')) {
      expect(opcoes.gravity).toBeLessThan(0);
      expect(opcoes.origin?.y).toBeGreaterThanOrEqual(1);
    }
  });

  it('a chuva de código cai com caracteres de código, desenhados uma vez só', () => {
    vi.useFakeTimers();
    comPreferencia(false);
    celebrar('aula', 'codigo');
    vi.advanceTimersByTime(3000);
    celebrar('aula', 'codigo');
    vi.advanceTimersByTime(3000);

    const textos = vi.mocked(confetti.shapeFromText).mock.calls.map(([arg]) => (arg as { text: string }).text);
    expect(textos).toEqual(['{', '}', '( )', ';', '</>']);
    for (const [opcoes] of disparou.mock.calls) {
      expect(opcoes!.shapes).toHaveLength(5);
      expect(opcoes!.angle).toBe(270);
    }
  });
});

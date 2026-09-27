import confetti from 'canvas-confetti';

import { celebracao } from './celebracoes';

/**
 * A comemoração de uma conquista.
 *
 * O `prefers-reduced-motion` do CSS neutraliza animações e transições, mas o
 * confete é desenhado em canvas por JavaScript e passava por baixo dessa regra.
 * Uma explosão de mais de cem partículas na tela inteira é justamente o tipo de
 * movimento que provoca náusea e tontura em quem tem sensibilidade vestibular —
 * e essa pessoa já pediu ao sistema operacional para não receber isso.
 *
 * Nada se perde ao respeitar o pedido: a confirmação de que a aula foi concluída
 * é o cartão verde com o texto, que continua aparecendo. O confete é ênfase, não
 * informação. A regra vale para todas as celebrações (`celebracoes.ts`), a
 * comprada inclusive.
 */

const CORES = ['#2b8078', '#d99422', '#2f8f4e'];

/** `false` quando a pessoa pediu menos movimento, ou quando não dá para saber. */
export function aceitaMovimento(): boolean {
  // Lido de `globalThis`, e não de `window`: no navegador são o mesmo objeto, e
  // assim a regra também vale onde `window` não existe. Sem `matchMedia` não há
  // como saber a preferência, e o silêncio é a escolha segura.
  if (typeof globalThis.matchMedia !== 'function') return false;

  // Chamada pelo objeto, e não por uma referência solta: desligar `matchMedia`
  // do seu receptor faz o navegador lançar "Illegal invocation".
  return !globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export type Intensidade = 'aula' | 'projeto';

/** Um disparo do confete: quando (ms depois do primeiro) e com que opções. */
export interface Disparo {
  atraso: number;
  opcoes: confetti.Options;
  /** A chuva de código desenha caracteres: as formas saem do texto na hora. */
  formasDeTexto?: boolean;
}

/**
 * Os disparos de cada celebração — puro, para o teste conferir o que cada
 * uma faz sem canvas. O projeto é sempre um pouco mais forte que a aula.
 */
export function disparosDe(id: string, intensidade: Intensidade): Disparo[] {
  const forte = intensidade === 'projeto';
  switch (celebracao(id).id) {
    case 'estrelas':
      return [
        {
          atraso: 0,
          opcoes: {
            shapes: ['star'],
            colors: ['#e5b84a', '#f2cf73', '#c8942c'],
            particleCount: forte ? 80 : 55,
            spread: 110,
            startVelocity: 32,
            gravity: 0.5,
            ticks: 240,
            scalar: 1.3,
            origin: { y: 0.45 },
          },
        },
      ];
    case 'bolhas':
      // Gravidade negativa: sobem da borda de baixo e saem por cima.
      return [0.3, 0.5, 0.7].map((x, i) => ({
        atraso: i * 180,
        opcoes: {
          shapes: ['circle'],
          colors: ['#bfe3ff', '#d9f0ff', '#c8f0e0', '#e3dcff'],
          particleCount: forte ? 22 : 15,
          angle: 90,
          spread: 50,
          startVelocity: forte ? 42 : 36,
          gravity: -0.12,
          drift: 0.2,
          ticks: 260,
          scalar: 1.5,
          origin: { x, y: 1.05 },
        },
      }));
    case 'codigo':
      // Do alto, para baixo, em cinco colunas e duas ondas.
      return [0, 1].flatMap((onda) =>
        [0.1, 0.3, 0.5, 0.7, 0.9].map((x, i) => ({
          atraso: onda * 450 + i * 90,
          formasDeTexto: true,
          opcoes: {
            colors: ['#4f9e8a', '#e07a2f', '#9a5ba8', '#2563a8'],
            particleCount: forte ? 6 : 4,
            angle: 270,
            spread: 25,
            startVelocity: 12,
            gravity: 0.8,
            ticks: 260,
            flat: true,
            scalar: 2.2,
            origin: { x, y: -0.05 },
          },
        }))
      );
    case 'fogos':
      return (
        [
          [0.25, 0.35, '#e0508a'],
          [0.75, 0.3, '#3aa7d9'],
          [0.5, 0.22, '#e5b84a'],
        ] as const
      ).map(([x, y, cor], i) => ({
        atraso: i * 320,
        opcoes: {
          colors: [cor, '#ffffff'],
          particleCount: (forte ? 60 : 42) + (i === 2 ? 20 : 0),
          spread: 360,
          startVelocity: i === 2 ? 30 : 24,
          gravity: 0.9,
          ticks: 90,
          scalar: 0.9,
          origin: { x, y },
        },
      }));
    default:
      return [
        {
          atraso: 0,
          opcoes: {
            particleCount: forte ? 160 : 120,
            spread: forte ? 80 : 70,
            origin: { y: forte ? 0.5 : 0.6 },
            colors: CORES,
          },
        },
      ];
  }
}

let formasDeCodigo: confetti.Shape[] | undefined;

/** Os caracteres da chuva de código, desenhados uma vez só. */
function caracteres(): confetti.Shape[] {
  formasDeCodigo ??= ['{', '}', '( )', ';', '</>'].map((text) => confetti.shapeFromText({ text, scalar: 2.2 }));
  return formasDeCodigo;
}

/** Toca a celebração escolhida (o confete, sem nada equipado) — se a pessoa aceita movimento. */
export function celebrar(intensidade: Intensidade = 'aula', estilo?: string | null): void {
  if (!aceitaMovimento()) return;

  for (const { atraso, opcoes, formasDeTexto } of disparosDe(estilo ?? '', intensidade)) {
    const disparar = () => confetti(formasDeTexto ? { ...opcoes, shapes: caracteres() } : opcoes);
    if (atraso === 0) disparar();
    else setTimeout(disparar, atraso);
  }
}

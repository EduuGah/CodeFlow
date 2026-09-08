import confetti from 'canvas-confetti';

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
 * informação.
 */

const CORES = ['#2b8078', '#d99422', '#2f8f4e'];

/** `false` quando a pessoa pediu menos movimento, ou quando não dá para saber. */
function aceitaMovimento(): boolean {
  // Lido de `globalThis`, e não de `window`: no navegador são o mesmo objeto, e
  // assim a regra também vale onde `window` não existe. Sem `matchMedia` não há
  // como saber a preferência, e o silêncio é a escolha segura.
  if (typeof globalThis.matchMedia !== 'function') return false;

  // Chamada pelo objeto, e não por uma referência solta: desligar `matchMedia`
  // do seu receptor faz o navegador lançar "Illegal invocation".
  return !globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function celebrar(intensidade: 'aula' | 'projeto' = 'aula'): void {
  if (!aceitaMovimento()) return;

  const forte = intensidade === 'projeto';

  confetti({
    particleCount: forte ? 160 : 120,
    spread: forte ? 80 : 70,
    origin: { y: forte ? 0.5 : 0.6 },
    colors: CORES,
  });
}

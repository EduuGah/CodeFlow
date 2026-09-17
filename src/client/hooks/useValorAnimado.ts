import { useEffect, useState } from 'react';

/**
 * Um valor que começa em `inicial` no primeiro quadro e vai para `alvo` no
 * seguinte — para uma barra ou um anel com `transition` encher ao aparecer,
 * em vez de já nascer cheio.
 *
 * É só isso: a transição mora no CSS, e quem pediu menos movimento no
 * sistema já tem as transições zeradas pelo `index.css`. Aqui nada anima;
 * aqui só se muda o valor um quadro depois.
 */
export function useValorAnimado<T>(alvo: T, inicial: T): T {
  const [valor, setValor] = useState(inicial);

  useEffect(() => {
    const quadro = requestAnimationFrame(() => setValor(alvo));
    return () => cancelAnimationFrame(quadro);
  }, [alvo]);

  return valor;
}

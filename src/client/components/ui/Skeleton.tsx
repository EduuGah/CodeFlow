import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * Forma cinza no lugar do conteúdo que ainda não chegou.
 *
 * É decoração: `aria-hidden` para o leitor de tela não anunciar caixas vazias.
 * Quem precisa saber que algo está carregando recebe isso pelo `Carregando`.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-line/80', className)} {...props} />
  );
}

/**
 * Envolve um grupo de esqueletos e anuncia a espera.
 *
 * Sem isto o carregamento é silencioso: quem não vê a tela fica sem saber se a
 * página está trabalhando ou se ficou vazia. O anúncio fica no envelope, e não em
 * cada esqueleto, senão uma tela com três formas anunciaria três vezes.
 *
 * O `data-carregando` é o marcador que os testes de navegador usam para esperar o
 * conteúdo de verdade — sem ele, um teste lê a tela ainda em esqueleto e passa
 * por não encontrar nada de errado.
 */
function Carregando({ o, children }: { o: string; children: ReactNode }) {
  return (
    <div role="status" aria-busy="true" data-carregando="">
      <span className="sr-only">Carregando {o}…</span>
      {children}
    </div>
  );
}

export { Carregando, Skeleton };

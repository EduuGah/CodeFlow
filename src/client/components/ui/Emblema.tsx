import type { ReactNode, SVGProps } from 'react';

import { corDaTrilha } from '../../lib/cores-das-trilhas';

/**
 * O emblema de cada trilha: um símbolo cheio, em branco, sobre a cor dela.
 *
 * A cor já dizia "estou em SQL" no marco, na faixa e no cabeçalho da aula;
 * o emblema diz o assunto para quem ainda não decorou a cor — e dá à faixa
 * da trilha e ao card da aula da vez uma figura, em vez de só um retângulo
 * colorido. Mesma gramática das vinhetas: formas cheias, sem contorno.
 *
 * `semFundo` desenha só o símbolo, para pousar sobre um fundo que já tem a
 * cor (a faixa da trilha usa assim, como marca d'água).
 */
const SIMBOLOS: Record<string, ReactNode> = {
  'track-js-fundamentos': (
    <g fill="currentColor">
      <path d="M19 10c-4.4 0-6.5 2.2-6.5 6v4.2c0 2-1 3-3.5 3.3v4.9c2.5.3 3.5 1.3 3.5 3.3V36c0 3.8 2.1 6 6.5 6h1v-4.2h-.6c-2 0-2.9-.9-2.9-3v-4.6c0-2.3-.8-3.8-2.6-4.4 1.8-.6 2.6-2.1 2.6-4.4v-4.6c0-2.1.9-3 2.9-3h.6V10z" />
      <path d="M29 10c4.4 0 6.5 2.2 6.5 6v4.2c0 2 1 3 3.5 3.3v4.9c-2.5.3-3.5 1.3-3.5 3.3V36c0 3.8-2.1 6-6.5 6h-1v-4.2h.6c2 0 2.9-.9 2.9-3v-4.6c0-2.3.8-3.8 2.6-4.4-1.8-.6-2.6-2.1-2.6-4.4v-4.6c0-2.1-.9-3-2.9-3H28V10z" />
      <circle cx="24" cy="26" r="2.6" />
    </g>
  ),
  'track-logica': (
    <g fill="currentColor">
      <circle cx="24" cy="11" r="4.5" />
      <path d="M22.5 15h3v5h-3z" />
      <path d="M24 19l8 7-8 7-8-7z" />
      <path d="M12 30l4-3 1.5 3.5-4 2z" />
      <path d="M36 30l-4-3-1.5 3.5 4 2z" />
      <circle cx="13" cy="37" r="4" />
      <circle cx="35" cy="37" r="4" />
    </g>
  ),
  'track-web': (
    <g fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
      <circle cx="24" cy="24" r="14" />
      <ellipse cx="24" cy="24" rx="6" ry="14" />
      <path d="M10 24h28M13 17h22M13 31h22" strokeWidth={2.4} />
    </g>
  ),
  'track-pagina': (
    <g fill="currentColor">
      <path d="M8 12a3 3 0 0 1 3-3h26a3 3 0 0 1 3 3v24a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3z" opacity={0.35} />
      <path d="M8 12a3 3 0 0 1 3-3h26a3 3 0 0 1 3 3v5H8z" />
      <rect x="12" y="21" width="10" height="14" rx="1.5" />
      <rect x="25" y="21" width="11" height="3" rx="1.5" />
      <rect x="25" y="26.5" width="11" height="3" rx="1.5" />
      <rect x="25" y="32" width="7" height="3" rx="1.5" />
    </g>
  ),
  'track-typescript': (
    <g>
      <rect x="9" y="9" width="30" height="30" rx="6" fill="currentColor" />
      <path d="M17 17h14v4.5h-4.6V33h-4.8V21.5H17z" fill="var(--emblema-fundo)" />
    </g>
  ),
  'track-react': (
    <g fill="none" stroke="currentColor" strokeWidth={2.6}>
      <ellipse cx="24" cy="24" rx="15" ry="6" />
      <ellipse cx="24" cy="24" rx="15" ry="6" transform="rotate(60 24 24)" />
      <ellipse cx="24" cy="24" rx="15" ry="6" transform="rotate(-60 24 24)" />
      <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" />
    </g>
  ),
  'track-sql': (
    <g fill="currentColor">
      <ellipse cx="24" cy="13" rx="13" ry="5" />
      <path d="M11 17c0 2.8 5.8 5 13 5s13-2.2 13-5v6c0 2.8-5.8 5-13 5s-13-2.2-13-5z" />
      <path d="M11 27c0 2.8 5.8 5 13 5s13-2.2 13-5v6c0 2.8-5.8 5-13 5s-13-2.2-13-5z" />
    </g>
  ),
};

const PADRAO = (
  <g fill="currentColor">
    <path d="M14 14h20v20H14z" opacity={0.5} />
    <path d="M18 18h12v12H18z" />
  </g>
);

export function EmblemaDaTrilha({
  trackId,
  size = 40,
  semFundo = false,
  ...props
}: SVGProps<SVGSVGElement> & { trackId: string; size?: number; semFundo?: boolean }) {
  const cor = corDaTrilha(trackId);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      style={{ color: '#ffffff', ['--emblema-fundo' as string]: cor }}
      {...props}
    >
      {!semFundo && <circle cx="24" cy="24" r="24" fill={cor} />}
      <g transform={semFundo ? undefined : 'translate(6 6) scale(0.75)'}>{SIMBOLOS[trackId] ?? PADRAO}</g>
    </svg>
  );
}

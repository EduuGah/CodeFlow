import type { ReactNode } from 'react';

import { MAXIMO_DE_ADESIVOS } from '../../lib/perfil';
import { P } from './Ilustracao';

/**
 * Os adesivos do perfil: até três, colados no cabeçalho, ao lado do nome.
 *
 * Cada um é uma vinheta pintada (a paleta de `Ilustracao.tsx`) sobre um recorte
 * branco com sombra — um adesivo de verdade, de notebook. Desenhos próprios:
 * o de ramos é um grafo de commits qualquer, não o logotipo do Git.
 *
 * O desenho é fixo (não muda com o tema), como as vinhetas, e decorativo: o
 * nome do adesivo vai no `aria-label` de quem o mostra.
 */

export const ADESIVOS = ['pato', 'ola-mundo', 'bug', 'cafe', 'terminal', 'ramos', 'chaves', 'foguete'] as const;
export type IdDeAdesivo = (typeof ADESIVOS)[number];

const TODOS: readonly string[] = ADESIVOS;

export function ehAdesivo(valor: unknown): valor is IdDeAdesivo {
  return typeof valor === 'string' && TODOS.includes(valor);
}

/**
 * Os adesivos que valem para mostrar: ids conhecidos, sem repetir, até o
 * máximo — o que o banco guardou passa por aqui antes de virar desenho.
 */
export function adesivosValidos(lista: readonly string[] | null | undefined): IdDeAdesivo[] {
  return [...new Set((lista ?? []).filter(ehAdesivo))].slice(0, MAXIMO_DE_ADESIVOS);
}

const MONO = "'JetBrains Mono', monospace";

const ARTE: Record<IdDeAdesivo, ReactNode> = {
  pato: (
    <g>
      <path d="M12 27l-3.5-5 7 2.5z" fill={P.dourado} />
      <ellipse cx="25" cy="30" rx="12.5" ry="8.5" fill={P.dourado} />
      <circle cx="30" cy="18.5" r="7" fill={P.dourado} />
      <path d="M36.5 19c4 0 5.5 1.6 5.5 2.6-2.4 1.2-4.2 1-5.8-.2z" fill={P.laranja} />
      <circle cx="31.8" cy="16.8" r="1.3" fill={P.escuro} />
      <path d="M19 29.5c4 3.6 9 3.6 12.5.2" stroke={P.douradoEscuro} strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </g>
  ),
  'ola-mundo': (
    <g>
      <circle cx="21" cy="28" r="12" fill={P.azulClaro} stroke={P.azul} strokeWidth="1.6" />
      <path d="M13 23c3-1 5 1 4.5 3.5S13 29 11.5 27.5M22 33c2-2.5 6-2 7.5.5-1.5 2.5-5 3.5-7.5-.5zM21 17.5c2 1.5 5 1 6.5-.5" fill={P.verde} stroke={P.verdeEscuro} strokeWidth="1" />
      <rect x="25" y="7" width="17" height="12" rx="4" fill="#ffffff" stroke={P.escuro} strokeWidth="1.4" />
      <path d="M29 18.5l-1.5 3.5 4-3.5" fill="#ffffff" stroke={P.escuro} strokeWidth="1.4" strokeLinejoin="round" />
      <text x="33.5" y="15.8" fontFamily={MONO} fontSize="8" fontWeight="700" fill={P.escuro} textAnchor="middle">
        oi
      </text>
    </g>
  ),
  bug: (
    <g>
      <path d="M19 15.5c-1-3-3.5-4.5-5.5-4M29 15.5c1-3 3.5-4.5 5.5-4" stroke={P.escuro} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M12 26h-3.5M12 31.5l-3 2.5M36 26h3.5M36 31.5l3 2.5" stroke={P.escuro} strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="24" cy="28" rx="12.5" ry="11.5" fill={P.verde} />
      <path d="M24 17v22" stroke={P.verdeEscuro} strokeWidth="1.4" />
      <circle cx="18.5" cy="31" r="2" fill={P.verdeEscuro} />
      <circle cx="29.5" cy="31" r="2" fill={P.verdeEscuro} />
      <path d="M14.5 21a9.5 7 0 0 1 19 0z" fill={P.escuro} />
      <circle cx="20.5" cy="18.5" r="2.4" fill="#ffffff" />
      <circle cx="27.5" cy="18.5" r="2.4" fill="#ffffff" />
      <circle cx="21" cy="19" r="1.1" fill={P.escuro} />
      <circle cx="28" cy="19" r="1.1" fill={P.escuro} />
    </g>
  ),
  cafe: (
    <g>
      <path d="M17 8.5c-1.2 1.5 1.2 2.6 0 4.4M23 7.5c-1.2 1.5 1.2 2.6 0 4.4M29 8.5c-1.2 1.5 1.2 2.6 0 4.4" stroke={P.cinza} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M33.5 21.5h2.5a4.5 4.5 0 0 1 0 9h-3" stroke={P.teal} strokeWidth="3" fill="none" />
      <path d="M11 17h24v12a9 9 0 0 1-9 9h-6a9 9 0 0 1-9-9z" fill={P.teal} />
      <ellipse cx="23" cy="17" rx="12" ry="2.6" fill="#6b4226" />
      <path d="M19 27.5c0-2 3-2.5 4 0 1-2.5 4-2 4 0 0 2.2-4 4.5-4 4.5s-4-2.3-4-4.5z" fill={P.creme} />
    </g>
  ),
  terminal: (
    <g>
      <rect x="8" y="11" width="32" height="26" rx="4" fill={P.escuro} />
      <path d="M8 15a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v2H8z" fill="#4a423c" />
      <circle cx="12.5" cy="14" r="1.1" fill={P.vermelho} />
      <circle cx="16" cy="14" r="1.1" fill={P.dourado} />
      <circle cx="19.5" cy="14" r="1.1" fill={P.verde} />
      <text x="12" y="30.5" fontFamily={MONO} fontSize="11" fontWeight="700" fill="#9af0c0">
        {'>_'}
      </text>
    </g>
  ),
  ramos: (
    <g strokeLinecap="round" fill="none">
      <path d="M17 10v28" stroke={P.teal} strokeWidth="3" />
      <path d="M17 16c0 6 14 4 14 10.5S17 31 17 34" stroke={P.roxo} strokeWidth="3" />
      <circle cx="17" cy="10" r="3.2" fill={P.teal} stroke="none" />
      <circle cx="31" cy="25" r="3.2" fill={P.roxo} stroke="none" />
      <circle cx="17" cy="38" r="3.2" fill={P.teal} stroke="none" />
      <circle cx="17" cy="24" r="2.4" fill="#ffffff" stroke={P.teal} strokeWidth="2" />
    </g>
  ),
  chaves: (
    <text x="24" y="31.5" fontFamily={MONO} fontSize="21" fontWeight="800" fill={P.roxo} textAnchor="middle">
      {'{ }'}
    </text>
  ),
  foguete: (
    <g transform="rotate(40 24 24)">
      <path d="M20.5 36c.8 3.5 2.2 5.5 3.5 6.5 1.3-1 2.7-3 3.5-6.5z" fill={P.laranja} />
      <path d="M22 36c.5 2 1.1 3.2 2 3.9.9-.7 1.5-1.9 2-3.9z" fill={P.dourado} />
      <path d="M18 28l-4.5 4.5V37l5-2.5zM30 28l4.5 4.5V37l-5-2.5z" fill={P.vermelho} />
      <path d="M24 6c4.6 3.4 6.5 8.4 6.5 14.5V36h-13V20.5C17.5 14.4 19.4 9.4 24 6z" fill={P.creme} stroke="#d8cfc4" strokeWidth="1" />
      <path d="M24 6c2.2 1.6 3.8 3.6 4.9 6h-9.8c1.1-2.4 2.7-4.4 4.9-6z" fill={P.vermelho} />
      <circle cx="24" cy="20" r="3.4" fill={P.azulClaro} stroke={P.azul} strokeWidth="1.4" />
    </g>
  ),
};

/** Um adesivo: o recorte branco com sombra, e a arte por cima. */
export function AdesivoDesenhado({ id, size = 40, giro = 0 }: { id: IdDeAdesivo; size?: number; giro?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false" data-adesivo={id}>
      <g transform={giro ? `rotate(${giro} 24 24)` : undefined}>
        <rect x="3" y="4.5" width="42" height="42" rx="12" fill={P.sombra} />
        <rect x="3" y="3" width="42" height="42" rx="12" fill="#ffffff" stroke="#e8e0d6" strokeWidth="1" />
        {ARTE[id]}
      </g>
    </svg>
  );
}

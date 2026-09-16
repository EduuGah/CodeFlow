import { useId, type SVGProps } from 'react';

import { ACENTOS } from '../../lib/tema';

/**
 * Vinhetas: as figuras maiores do perfil e da loja.
 *
 * Os ícones (`Icon.tsx`) cabem em 24 e vivem ao lado de texto. Estas são para
 * abrir uma seção ou apresentar um item — um lugar onde um ícone de 20 px
 * ficaria perdido. A gramática é a mesma (traço arredondado, geometria
 * simples, `currentColor`), com uma diferença: cada figura tem uma forma de
 * fundo preenchida em tom claro, para ter corpo sem virar ilustração
 * "flat" genérica. A cor vem do contexto; a pastilha em volta é do chamador.
 *
 * Grade de 48. Stroke de 2 em 48 é o mesmo peso visual do 1.75 em 24 quando
 * o desenho aparece com o dobro do tamanho.
 */

export type VinhetaProps = SVGProps<SVGSVGElement> & { size?: number };

function Vinheta({ size = 48, children, ...props }: VinhetaProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/** O preenchimento suave que dá corpo às figuras. */
const suave = { fill: 'currentColor', fillOpacity: 0.14, stroke: 'none' } as const;

/** Moedas: uma pilha deitada e uma em pé, com o cifrão de código. */
export const VinhetaMoedas = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <ellipse cx="19" cy="36" rx="12" ry="4.5" {...suave} />
    <path d="M7 30v6c0 2.5 5.4 4.5 12 4.5s12-2 12-4.5v-6" />
    <ellipse cx="19" cy="30" rx="12" ry="4.5" />
    <ellipse cx="19" cy="24" rx="12" ry="4.5" />
    <circle cx="33" cy="18" r="10" fill="var(--color-surface)" />
    <circle cx="33" cy="18" r="10" {...suave} />
    <circle cx="33" cy="18" r="10" />
    <path d="M36 14.5h-4.5a2 2 0 0 0 0 4h3a2 2 0 0 1 0 4H30M33 12.5v2M33 22.5v-2" />
  </Vinheta>
);

/** Paleta: a forma de pintor com as quatro cores de destaque de verdade. */
export const VinhetaPaleta = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <path d="M24 6C13 6 5 14 5 24s7 17 15 17c3 0 4-2 4-4s-1-3 0-4 3-1 5-1h3c6 0 9-4 9-9C41 13 34 6 24 6z" {...suave} />
    <path d="M24 6C13 6 5 14 5 24s7 17 15 17c3 0 4-2 4-4s-1-3 0-4 3-1 5-1h3c6 0 9-4 9-9C41 13 34 6 24 6z" />
    {ACENTOS.map((a, i) => (
      <circle
        key={a.id}
        cx={[15, 21, 29, 35][i]}
        cy={[24, 15, 13, 21][i]}
        r="3.2"
        fill={a.amostra}
        stroke="none"
      />
    ))}
  </Vinheta>
);

/** Medalha com fita, estrela no centro. */
export const VinhetaMedalha = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <path d="M17 22L11 5h9l4 8 4-8h9l-6 17" {...suave} />
    <path d="M17 22L11 5h9l4 8 4-8h9l-6 17" />
    <circle cx="24" cy="30" r="12" fill="var(--color-surface)" />
    <circle cx="24" cy="30" r="12" {...suave} />
    <circle cx="24" cy="30" r="12" />
    <path d="M24 23.5l2 4 4.4.6-3.2 3 .8 4.4-4-2.1-4 2.1.8-4.4-3.2-3 4.4-.6z" />
  </Vinheta>
);

/** Alvo com uma flecha cravada. */
export const VinhetaAlvo = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <circle cx="22" cy="26" r="16" {...suave} />
    <circle cx="22" cy="26" r="16" />
    <circle cx="22" cy="26" r="9.5" />
    <circle cx="22" cy="26" r="3" />
    <path d="M22 26L38 10" />
    <path d="M38 10h-7M38 10v7" />
  </Vinheta>
);

/** Barras subindo com uma bandeirinha no topo da última. */
export const VinhetaGrafico = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <rect x="8" y="28" width="8" height="13" rx="1.5" {...suave} />
    <rect x="20" y="19" width="8" height="22" rx="1.5" {...suave} />
    <rect x="32" y="10" width="8" height="31" rx="1.5" {...suave} />
    <rect x="8" y="28" width="8" height="13" rx="1.5" />
    <rect x="20" y="19" width="8" height="22" rx="1.5" />
    <rect x="32" y="10" width="8" height="31" rx="1.5" />
    <path d="M5 41h38" />
    <path d="M12 22l8-6 8 3 8-10" />
  </Vinheta>
);

/** Floco de neve: a sequência congelada. */
export const VinhetaFloco = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <circle cx="24" cy="24" r="17" {...suave} />
    {[0, 60, 120].map((g) => (
      <g key={g} transform={`rotate(${g} 24 24)`}>
        <path d="M24 8v32" />
        <path d="M24 13l-4-3M24 13l4-3M24 35l-4 3M24 35l4 3" />
      </g>
    ))}
  </Vinheta>
);

/** Raio com o "2×": o dobro de XP. */
export const VinhetaRaioDuplo = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <path d="M26 5L11 26h11l-2 17 16-22H25z" {...suave} />
    <path d="M26 5L11 26h11l-2 17 16-22H25z" />
    <circle cx="37" cy="12" r="8" fill="var(--color-surface)" />
    <circle cx="37" cy="12" r="8" />
    <path d="M33.5 9.5c0-1 .8-1.5 1.5-1.5s1.5.5 1.5 1.5c0 1.5-3 2.5-3 4.5h3.5" strokeWidth={1.6} />
    <path d="M39 12.5l3 3M42 12.5l-3 3" strokeWidth={1.6} />
  </Vinheta>
);

/** Rosto sorridente da pessoa: a foto e o nome. */
export const VinhetaPessoa = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <circle cx="24" cy="24" r="18" {...suave} />
    <circle cx="24" cy="24" r="18" />
    <circle cx="24" cy="19" r="6" />
    <path d="M12.5 37c2-5.5 6.5-8 11.5-8s9.5 2.5 11.5 8" />
  </Vinheta>
);

/**
 * Uma janela em miniatura, pintada como a interface ficaria: fundo, uma
 * barra da cor de destaque, duas linhas de texto e um botão. É a amostra do
 * tema — cor na tela, não um nome de cor.
 */
export function VinhetaJanela({
  acento,
  escuro,
  dividida = false,
  size = 48,
  ...props
}: VinhetaProps & { acento: string; escuro: boolean; dividida?: boolean }) {
  const recorte = useId();
  const claro = { surface: '#ffffff', linha: '#c9c5bb', texto: '#8a8f8c' };
  const noite = { surface: '#1b2220', linha: '#3a4541', texto: '#8b9490' };
  const janela = (cor: typeof claro) => (
    <g>
      <rect x="4" y="8" width="40" height="32" rx="4" fill={cor.surface} stroke={cor.linha} strokeWidth={1.5} />
      <rect x="4" y="8" width="40" height="8" rx="4" fill={acento} stroke="none" />
      <rect x="4" y="12" width="40" height="4" fill={acento} stroke="none" />
      <rect x="10" y="21" width="20" height="2.5" rx="1.25" fill={cor.texto} stroke="none" />
      <rect x="10" y="26" width="28" height="2.5" rx="1.25" fill={cor.linha} stroke="none" />
      <rect x="10" y="32" width="13" height="5" rx="2.5" fill={acento} stroke="none" />
    </g>
  );
  return (
    <Vinheta size={size} {...props}>
      {dividida ? (
        <>
          {janela(claro)}
          <clipPath id={recorte}>
            <path d="M24 0h24v48H24z" />
          </clipPath>
          <g clipPath={`url(#${recorte})`}>{janela(noite)}</g>
          <path d="M24 6v36" stroke="currentColor" strokeDasharray="2 3" strokeWidth={1.5} />
        </>
      ) : (
        janela(escuro ? noite : claro)
      )}
    </Vinheta>
  );
}

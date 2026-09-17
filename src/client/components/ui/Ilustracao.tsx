import { useId, type SVGProps } from 'react';

import { ACENTOS } from '../../lib/tema';

/**
 * Vinhetas: as figuras maiores do produto.
 *
 * Os ícones (`Icon.tsx`) cabem em 24, são de traço e vivem ao lado de texto.
 * Estas são para abrir uma seção, apresentar um item da loja, encher um
 * estado vazio — lugares onde um ícone de 20 px fica perdido. E são de
 * outro tipo: **formas cheias, pintadas**, o objeto em miniatura. Foi a
 * janela do tema, pintada como a interface fica, que mostrou o caminho; a
 * versão de traço fino que existiu antes parecia clip-art genérico.
 *
 * Regras da coleção, para as próximas nascerem coerentes:
 * - grade de 48, sem contorno; a forma se define pelas cores vizinhas
 * - uma paleta só (`P`), a mesma dos avatares: dourado, laranja, azul,
 *   verde, roxo, escuro, creme
 * - cada figura tem uma sombra de base (`P.sombra`, elipse translúcida)
 *   para "pousar" na pastilha em vez de flutuar
 * - a pastilha em volta (cor de fundo) é de quem chama
 */

export type VinhetaProps = SVGProps<SVGSVGElement> & { size?: number };

/** A paleta das figuras. Fixa: uma ilustração não muda de cor com o tema. */
export const P = {
  dourado: '#e5b84a',
  douradoEscuro: '#c8942c',
  laranja: '#e07a2f',
  vermelho: '#d0503f',
  azul: '#2563a8',
  azulClaro: '#9cc8f2',
  verde: '#5daa5a',
  verdeEscuro: '#2f7d4a',
  teal: '#4f9e8a',
  roxo: '#9a5ba8',
  escuro: '#2b2622',
  cinza: '#8b99ad',
  creme: '#fff8f0',
  sombra: 'rgba(43, 38, 34, 0.14)',
} as const;

function Vinheta({ size = 48, children, ...props }: VinhetaProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  );
}

const Sombra = ({ cy = 42, rx = 15 }: { cy?: number; rx?: number }) => (
  <ellipse cx="24" cy={cy} rx={rx} ry="2.5" fill={P.sombra} />
);

/** Moedas: uma pilha e uma de pé, com o cifrão. */
export const VinhetaMoedas = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <Sombra rx={17} />
    <ellipse cx="18" cy="38" rx="13" ry="4.5" fill={P.douradoEscuro} />
    <path d="M5 33v5c0 2.5 5.8 4.5 13 4.5s13-2 13-4.5v-5z" fill={P.douradoEscuro} />
    <ellipse cx="18" cy="33" rx="13" ry="4.5" fill={P.dourado} />
    <path d="M5 28v5c0 2.5 5.8 4.5 13 4.5s13-2 13-4.5v-5z" fill={P.douradoEscuro} />
    <ellipse cx="18" cy="28" rx="13" ry="4.5" fill={P.dourado} />
    <ellipse cx="18" cy="28" rx="8" ry="2.6" fill={P.douradoEscuro} opacity={0.5} />
    <circle cx="33" cy="18" r="11" fill={P.douradoEscuro} />
    <circle cx="32" cy="17" r="10" fill={P.dourado} />
    <circle cx="32" cy="17" r="7" fill="none" stroke={P.douradoEscuro} strokeWidth={1.5} />
    <path
      d="M34.5 13.5H31a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-3.5M32 11.5v2M32 22.5v-2"
      stroke={P.douradoEscuro}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Vinheta>
);

/** Paleta de pintor com as quatro cores de destaque de verdade. */
export const VinhetaPaleta = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <Sombra cy={43} rx={16} />
    <path
      d="M24 5C13 5 4 13 4 24s7 17 15 17c3 0 4.5-2 4.5-4s-1-3 0-4 3-1 5-1h3c6 0 10-4 10-9C41.5 12 34 5 24 5z"
      fill={P.creme}
    />
    <path
      d="M24 5C13 5 4 13 4 24s7 17 15 17c3 0 4.5-2 4.5-4s-1-3 0-4 3-1 5-1h3c6 0 10-4 10-9C41.5 12 34 5 24 5z"
      fill={P.escuro}
      opacity={0.06}
    />
    {ACENTOS.map((a, i) => (
      <circle key={a.id} cx={[13, 19, 28, 35][i]} cy={[24, 14, 11, 19][i]} r="3.6" fill={a.amostra} />
    ))}
    <path d="M30 34l10-14" stroke={P.escuro} strokeWidth={3} strokeLinecap="round" />
    <path d="M39 21l3-4" stroke={P.laranja} strokeWidth={3} strokeLinecap="round" />
  </Vinheta>
);

/** Medalha dourada com a fita e a estrela. */
export const VinhetaMedalha = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <Sombra cy={44} rx={12} />
    <path d="M15 4h8l3 8 3-8h8l-7 18H22z" fill={P.vermelho} />
    <path d="M15 4h8l3 8-4 10H18z" fill="#b8402f" />
    <circle cx="26" cy="30" r="12.5" fill={P.douradoEscuro} />
    <circle cx="25" cy="29" r="11" fill={P.dourado} />
    <circle cx="25" cy="29" r="8" fill="none" stroke={P.douradoEscuro} strokeWidth={1.5} />
    <path d="M25 23l1.9 3.9 4.3.6-3.1 3 .7 4.3-3.8-2-3.8 2 .7-4.3-3.1-3 4.3-.6z" fill={P.creme} />
  </Vinheta>
);

/** Alvo com a flecha cravada no centro. */
export const VinhetaAlvo = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <Sombra rx={16} />
    <circle cx="22" cy="26" r="16" fill={P.vermelho} />
    <circle cx="22" cy="26" r="11.5" fill={P.creme} />
    <circle cx="22" cy="26" r="7" fill={P.vermelho} />
    <circle cx="22" cy="26" r="2.6" fill={P.creme} />
    <path d="M22 26L39 9" stroke={P.escuro} strokeWidth={2.4} strokeLinecap="round" />
    <path d="M39 9l-8 1.5M39 9l-1.5 8" stroke={P.escuro} strokeWidth={2.4} strokeLinecap="round" />
    <path d="M33 11.5l-1.5 1.5 3.5 1M36.5 15l-1.5 1.5 1 3.5" fill="none" stroke={P.laranja} strokeWidth={2} strokeLinecap="round" />
  </Vinheta>
);

/** Barras subindo e uma linha que sobe com elas. */
export const VinhetaGrafico = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <Sombra cy={44} rx={18} />
    <rect x="7" y="27" width="9" height="14" rx="2" fill={P.azulClaro} />
    <rect x="19.5" y="18" width="9" height="23" rx="2" fill={P.azul} />
    <rect x="32" y="8" width="9" height="33" rx="2" fill={P.verde} />
    <path d="M6 41h36" stroke={P.escuro} strokeWidth={2} strokeLinecap="round" />
    <path d="M9 22l10-7 9 3 10-11" stroke={P.creme} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 22l10-7 9 3 10-11" stroke={P.laranja} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="38" cy="7" r="3" fill={P.laranja} />
  </Vinheta>
);

/** Floco de neve: a sequência congelada. */
export const VinhetaFloco = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <circle cx="24" cy="24" r="19" fill={P.azulClaro} opacity={0.5} />
    {[0, 60, 120].map((g) => (
      <g key={g} transform={`rotate(${g} 24 24)`}>
        <path d="M24 7v34" stroke={P.azul} strokeWidth={2.6} strokeLinecap="round" />
        <path d="M24 13l-4.5-3.5M24 13l4.5-3.5M24 35l-4.5 3.5M24 35l4.5 3.5" stroke={P.azul} strokeWidth={2.2} strokeLinecap="round" />
        <path d="M24 19l-3-2M24 19l3-2M24 29l-3 2M24 29l3 2" stroke={P.azul} strokeWidth={1.8} strokeLinecap="round" />
      </g>
    ))}
    <circle cx="24" cy="24" r="3" fill={P.creme} />
  </Vinheta>
);

/** Raio amarelo com o selo "2×". */
export const VinhetaRaioDuplo = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <Sombra cy={44} rx={12} />
    <path d="M27 4L10 27h11l-3 16 19-23H26z" fill={P.dourado} />
    <path d="M27 4L10 27h11l-1 6 12-14h-9z" fill={P.douradoEscuro} opacity={0.35} />
    <circle cx="37" cy="12" r="8.5" fill={P.escuro} />
    <path d="M33.5 9.5c0-1.2.9-2 1.9-2s1.9.8 1.9 2c0 1.8-3.6 3-3.6 5.3h3.8" stroke={P.creme} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M39.5 12.5l3 3M42.5 12.5l-3 3" stroke={P.creme} strokeWidth={1.6} strokeLinecap="round" />
  </Vinheta>
);

/** Cartões de revisão: uma pilha com o de cima virado. */
export const VinhetaCartoes = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <Sombra cy={44} rx={16} />
    <rect x="10" y="16" width="30" height="20" rx="3" transform="rotate(-6 25 26)" fill={P.azul} />
    <rect x="8" y="14" width="30" height="20" rx="3" transform="rotate(4 23 24)" fill={P.creme} />
    <rect x="8" y="14" width="30" height="20" rx="3" transform="rotate(4 23 24)" fill={P.escuro} opacity={0.06} />
    <g transform="rotate(4 23 24)">
      <rect x="13" y="20" width="14" height="2.6" rx="1.3" fill={P.escuro} />
      <rect x="13" y="25" width="19" height="2.2" rx="1.1" fill={P.cinza} />
      <circle cx="33" cy="20.5" r="2.2" fill={P.verde} />
    </g>
  </Vinheta>
);

/** Caixa aberta e vazia: o estado sem dados. */
export const VinhetaCaixa = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <Sombra cy={44} rx={16} />
    <path d="M8 20h32v20a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" fill={P.laranja} />
    <path d="M8 20h32v6H8z" fill="#b8581c" />
    <path d="M8 20L4 12l20-2-4 10zM40 20l4-8-20-2 4 10z" fill="#f2a05a" />
    <path d="M20 12l4 8-4-10zM28 12l-4 8 4-10z" fill="#b8581c" />
    <path d="M20 31h8" stroke={P.creme} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
  </Vinheta>
);

/** Bússola: a página que não existe. */
export const VinhetaBussola = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <Sombra rx={15} />
    <circle cx="24" cy="24" r="18" fill={P.escuro} />
    <circle cx="24" cy="24" r="15" fill={P.creme} />
    <path d="M24 8v3M24 37v3M8 24h3M37 24h3" stroke={P.escuro} strokeWidth={2} strokeLinecap="round" />
    <path d="M24 24l6-13-13 6z" fill={P.vermelho} />
    <path d="M24 24l-6 13 13-6z" fill={P.cinza} />
    <circle cx="24" cy="24" r="2.2" fill={P.creme} />
  </Vinheta>
);

/** Chave: entrar. */
export const VinhetaChave = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <Sombra rx={15} />
    <circle cx="16" cy="18" r="11" fill={P.dourado} />
    <circle cx="16" cy="18" r="10" fill="none" stroke={P.douradoEscuro} strokeWidth={1.2} opacity={0.6} />
    <circle cx="16" cy="18" r="4" fill={P.escuro} />
    <path d="M24 25l15 15" stroke={P.douradoEscuro} strokeWidth={6} strokeLinecap="round" />
    <path d="M24 25l15 15" stroke={P.dourado} strokeWidth={4} strokeLinecap="round" />
    <path d="M33 34l4-4M37 38l4-4" stroke={P.dourado} strokeWidth={4} strokeLinecap="round" />
  </Vinheta>
);

/** Foguete: começar. */
export const VinhetaFoguete = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <path d="M18 34l-4 8 8-4z" fill={P.dourado} />
    <path d="M20 32l-2 6 6-2z" fill={P.laranja} />
    <path d="M28 6c9 2 13 10 12 20l-8 8-8-8c-4-8-2-16 4-20z" fill={P.creme} />
    <path d="M28 6c9 2 13 10 12 20l-4 4c-2-10-4-16-8-24z" fill={P.escuro} opacity={0.08} />
    <circle cx="30" cy="18" r="4" fill={P.azul} />
    <circle cx="30" cy="18" r="2.2" fill={P.azulClaro} />
    <path d="M24 26l-8 2 4 6zM32 34l2 8 6-4z" fill={P.vermelho} />
  </Vinheta>
);

/** Relógio: aulas curtas. */
export const VinhetaRelogio = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <Sombra rx={15} />
    <circle cx="24" cy="24" r="18" fill={P.azul} />
    <circle cx="24" cy="24" r="14.5" fill={P.creme} />
    <path d="M24 12v2M24 34v2M12 24h2M34 24h2" stroke={P.cinza} strokeWidth={2} strokeLinecap="round" />
    <path d="M24 24V15.5" stroke={P.escuro} strokeWidth={2.6} strokeLinecap="round" />
    <path d="M24 24l6 4" stroke={P.escuro} strokeWidth={2.6} strokeLinecap="round" />
    <path d="M24 24l-4.5 8" stroke={P.vermelho} strokeWidth={1.6} strokeLinecap="round" />
    <circle cx="24" cy="24" r="2" fill={P.escuro} />
  </Vinheta>
);

/** Balão de fala com uma marca de certo: a correção que explica. */
export const VinhetaBalao = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <Sombra cy={44} rx={14} />
    <path d="M8 10a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H20l-7 7v-7h-1a4 4 0 0 1-4-4z" fill={P.verde} />
    <path d="M14 18l5 5 10-10" stroke={P.creme} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x="14" y="26" width="10" height="2.4" rx="1.2" fill={P.creme} opacity={0.8} />
  </Vinheta>
);

/** Editor em miniatura com o botão de rodar: código no navegador. */
export const VinhetaEditor = (p: VinhetaProps) => (
  <Vinheta {...p}>
    <Sombra cy={44} rx={17} />
    <rect x="4" y="7" width="40" height="32" rx="4" fill="#1b2220" />
    <rect x="4" y="7" width="40" height="7" rx="4" fill="#2c3733" />
    <rect x="4" y="11" width="40" height="3" fill="#2c3733" />
    <circle cx="9" cy="10.5" r="1.4" fill={P.vermelho} />
    <circle cx="13.5" cy="10.5" r="1.4" fill={P.dourado} />
    <circle cx="18" cy="10.5" r="1.4" fill={P.verde} />
    <rect x="9" y="18" width="10" height="2.4" rx="1.2" fill={P.roxo} />
    <rect x="21" y="18" width="12" height="2.4" rx="1.2" fill={P.azulClaro} />
    <rect x="12" y="23" width="8" height="2.4" rx="1.2" fill={P.dourado} />
    <rect x="22" y="23" width="9" height="2.4" rx="1.2" fill={P.creme} opacity={0.7} />
    <rect x="12" y="28" width="14" height="2.4" rx="1.2" fill={P.azulClaro} />
    <rect x="9" y="33" width="4" height="2.4" rx="1.2" fill={P.roxo} />
    <circle cx="36" cy="31" r="5.5" fill={P.verde} />
    <path d="M34.5 28.5v5l4-2.5z" fill={P.creme} />
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
      <rect x="4" y="8" width="40" height="8" rx="4" fill={acento} />
      <rect x="4" y="12" width="40" height="4" fill={acento} />
      <rect x="10" y="21" width="20" height="2.5" rx="1.25" fill={cor.texto} />
      <rect x="10" y="26" width="28" height="2.5" rx="1.25" fill={cor.linha} />
      <rect x="10" y="32" width="13" height="5" rx="2.5" fill={acento} />
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

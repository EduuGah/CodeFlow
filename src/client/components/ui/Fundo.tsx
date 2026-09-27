import { useId, type ReactNode } from 'react';

import { P } from './Ilustracao';

/**
 * Os fundos do perfil: a capa, uma faixa **acima** do cabeçalho.
 *
 * Nada de texto sobre o desenho — o contraste do nome e do nível não pode
 * depender de qual fundo a pessoa escolheu. A faixa é decorativa
 * (`aria-hidden`), e o desenho é fixo: uma capa não muda de cor com o tema,
 * como as vinhetas (`Ilustracao.tsx`).
 *
 * A grade é de 320 × 80 e o desenho cobre a faixa inteira em qualquer largura
 * (`slice`): o que importa fica no meio.
 */

/** Os da loja. */
export const FUNDOS = ['grade', 'circuito', 'por-do-sol', 'aurora'] as const;
/** Os que não se vendem: abrem por conquista (`lib/exclusivos.ts`). */
export const FUNDOS_DE_CONQUISTA = ['constelacao'] as const;
export type IdDeFundo = (typeof FUNDOS)[number] | (typeof FUNDOS_DE_CONQUISTA)[number];

const TODOS: readonly string[] = [...FUNDOS, ...FUNDOS_DE_CONQUISTA];

export function ehFundo(valor: unknown): valor is IdDeFundo {
  return typeof valor === 'string' && TODOS.includes(valor);
}

/**
 * As estrelas da constelação, e quais se ligam: um mapa de conceitos no céu.
 * Todas na faixa do meio (28 a 52): numa tela larga, o `slice` corta em cima
 * e embaixo.
 */
const ESTRELAS: Array<[number, number]> = [
  [34, 46], [62, 30], [96, 42], [120, 28], [150, 50],
  [188, 34], [214, 52], [246, 30], [272, 46], [300, 34],
];
const LIGACOES: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [5, 6], [5, 7], [7, 8], [8, 9],
];

function Desenho({ id, gradiente }: { id: IdDeFundo; gradiente: string }): ReactNode {
  switch (id) {
    // Papel quadriculado, com a margem vermelha do caderno.
    case 'grade':
      return (
        <>
          <rect width="320" height="80" fill={P.creme} />
          {Array.from({ length: 33 }, (_, i) => (
            <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="80" stroke={P.azulClaro} strokeOpacity="0.55" strokeWidth="1" />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 10} x2="320" y2={i * 10} stroke={P.azulClaro} strokeOpacity="0.55" strokeWidth="1" />
          ))}
          <rect x="28" width="2.5" height="80" fill={P.vermelho} fillOpacity="0.6" />
        </>
      );
    // Placa verde com trilhas em ângulo reto e soldas douradas.
    case 'circuito':
      return (
        <>
          <rect width="320" height="80" fill="#15472f" />
          {[
            'M0 22 H70 V46 H130',
            'M40 80 V60 H110 V30 H190',
            'M150 0 V18 H230 V52 H320',
            'M200 80 V66 H260 V24 H320',
            'M0 64 H24 V40 H56',
          ].map((d, i) => (
            <path key={i} d={d} fill="none" stroke={P.verde} strokeWidth="3" strokeLinejoin="round" />
          ))}
          {[
            [130, 46],
            [190, 30],
            [56, 40],
            [230, 18],
            [260, 24],
            [110, 60],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="5" fill={P.douradoEscuro} />
              <circle cx={x} cy={y} r="2.2" fill="#15472f" />
            </g>
          ))}
          <rect x="146" y="38" width="30" height="18" rx="2" fill={P.escuro} />
        </>
      );
    // Céu em degradê, o sol pela metade e as faixas do horizonte.
    case 'por-do-sol':
      return (
        <>
          <rect width="320" height="80" fill={`url(#${gradiente})`} />
          <circle cx="160" cy="62" r="26" fill={P.dourado} />
          {[58, 64, 70, 76].map((y, i) => (
            <rect key={y} x="0" y={y} width="320" height={2 + i} fill="#5b2a6e" fillOpacity={0.35 + i * 0.12} />
          ))}
        </>
      );
    // Noite funda, duas cortinas de luz e as estrelas.
    case 'aurora':
      return (
        <>
          <rect width="320" height="80" fill="#101a33" />
          <path d="M0 50 C60 20 110 60 170 34 S280 14 320 30 V80 H0 Z" fill="#3ddc84" fillOpacity="0.45" />
          <path d="M0 62 C70 40 130 72 200 50 S290 38 320 48 V80 H0 Z" fill={P.roxo} fillOpacity="0.55" />
          {[
            [24, 12],
            [70, 8],
            [118, 18],
            [182, 10],
            [236, 6],
            [290, 16],
            [150, 26],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 ? 1.2 : 1.8} fill={P.creme} />
          ))}
        </>
      );
    // Céu de tinta com poeira de estrelas, e as maiores ligadas em desenho.
    case 'constelacao':
      return (
        <>
          <rect width="320" height="80" fill="#141836" />
          {Array.from({ length: 28 }, (_, i) => (
            <circle key={`p${i}`} cx={(i * 83) % 320} cy={(i * 37) % 80} r="0.8" fill={P.creme} fillOpacity="0.55" />
          ))}
          {LIGACOES.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={ESTRELAS[a][0]}
              y1={ESTRELAS[a][1]}
              x2={ESTRELAS[b][0]}
              y2={ESTRELAS[b][1]}
              stroke="#8fa8ff"
              strokeOpacity="0.6"
              strokeWidth="1"
            />
          ))}
          {ESTRELAS.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill={P.dourado} fillOpacity="0.25" />
              <circle cx={x} cy={y} r={i % 3 ? 1.8 : 2.4} fill={i % 4 ? P.creme : P.dourado} />
            </g>
          ))}
        </>
      );
  }
}

/** A capa desenhada. Quem chama decide a altura e o arredondamento. */
export function FundoDesenhado({ id, className = '' }: { id: IdDeFundo; className?: string }) {
  const gradiente = `fundo-${useId().replace(/:/g, '')}`;
  return (
    <svg
      viewBox="0 0 320 80"
      preserveAspectRatio="xMidYMid slice"
      className={`block overflow-hidden ${className}`}
      aria-hidden="true"
      focusable="false"
      data-fundo={id}
    >
      <defs>
        <linearGradient id={gradiente} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f08a3c" />
          <stop offset="0.55" stopColor="#d9546f" />
          <stop offset="1" stopColor="#6b3a8c" />
        </linearGradient>
      </defs>
      <Desenho id={id} gradiente={gradiente} />
    </svg>
  );
}

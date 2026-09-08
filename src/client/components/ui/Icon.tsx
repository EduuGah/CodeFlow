import type { SVGProps } from 'react';

/**
 * Conjunto de ícones do CodeFlow.
 *
 * Desenhado aqui em vez de importado de uma biblioteca por três motivos:
 * identidade própria (um ícone de biblioteca popular faz o produto parecer
 * qualquer outro), controle do peso visual, e nenhuma dependência a mais no
 * bundle — usávamos 24 ícones de um pacote inteiro.
 *
 * Regras do conjunto, para os próximos ícones nascerem coerentes:
 * - grade de 24, traço de 1.75, pontas e junções arredondadas
 * - geometria simples: círculo, retângulo, linha reta e diagonal a 45°
 * - metáforas de código quando existirem (colchetes, cursor, ramificação),
 *   nunca metáforas de escritório
 * - o traço herda `currentColor`, então a cor vem do contexto
 */

export type IconProps = SVGProps<SVGSVGElement> & {
  /** Lado do ícone em pixels. */
  size?: number;
};

function Base({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
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

/* ---------------------------------------------------------------- marca */

/** Colchetes com um fluxo entre eles: código que corre. É a marca. */
export const IconLogo = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 4 4 12l4 8" />
    <path d="M16 4l4 8-4 8" />
    <path d="M13.5 8.5c-2 1-3 2-3 3.5s1 2.5 3 3.5" />
  </Base>
);

/* ----------------------------------------------------------- navegação */

/** Início: um marco no caminho. */
export const IconHome = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 20h16" />
    <path d="M7 20v-6" />
    <path d="M12 20V8" />
    <path d="M17 20v-9" />
    <circle cx="12" cy="5" r="2" />
  </Base>
);

/** Trilhas: ramificação, como um grafo de dependências. */
export const IconTrack = (p: IconProps) => (
  <Base {...p}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="18" cy="12" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <path d="M6 8.5v7" />
    <path d="M8.5 6.8c4 .6 6.2 2 7.2 4" />
    <path d="M8.5 17.2c4-.6 6.2-2 7.2-4" />
  </Base>
);

/** Praticar: cursor de código piscando. */
export const IconPractice = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M7 10l2.5 2L7 14" />
    <path d="M12.5 15h4.5" />
  </Base>
);

/** Perfil: figura simples, sem rosto. */
export const IconProfile = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" />
  </Base>
);

/* ------------------------------------------------------------- estados */

export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.5 12.5l5 5 10-11" />
  </Base>
);

export const IconCheckCircle = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.5 2.5L16 9.5" />
  </Base>
);

export const IconClose = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </Base>
);

export const IconCloseCircle = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9l6 6" />
    <path d="M15 9l-6 6" />
  </Base>
);

export const IconAlert = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5" />
    <path d="M12 16.5v.01" />
  </Base>
);

export const IconInfo = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5" />
    <path d="M12 7.5v.01" />
  </Base>
);

export const IconCircle = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="7" />
  </Base>
);

/** Anel de carregamento: o consumidor aplica a rotação. */
export const IconSpinner = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3a9 9 0 1 1-6.4 2.7" opacity={0.85} />
  </Base>
);

/* ------------------------------------------------------------ ações */

export const IconArrowLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 12H5" />
    <path d="M11 6l-6 6 6 6" />
  </Base>
);

export const IconArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </Base>
);

export const IconChevronDown = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 9.5l6 6 6-6" />
  </Base>
);

export const IconPlay = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 5.5l11 6.5-11 6.5V5.5z" />
  </Base>
);

export const IconSend = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.5 12L20 4.5 15.5 20l-4-6.5-7-1.5z" />
  </Base>
);

export const IconRetry = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20 4v4.5h-4.5" />
  </Base>
);

export const IconExit = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" />
    <path d="M17 8l4 4-4 4" />
    <path d="M21 12h-9" />
  </Base>
);

/* ---------------------------------------------------- aprendizado */

/** Dica: uma lâmpada reduzida a círculo e base. */
export const IconHint = (p: IconProps) => (
  <Base {...p}>
    <path d="M9.5 17.5h5" />
    <path d="M10.5 20.5h3" />
    <path d="M8 12.5a4.5 4.5 0 1 1 8 0c0 1.7-1.5 2.6-1.5 5h-5c0-2.4-1.5-3.3-1.5-5z" />
  </Base>
);

/** Aula: página com uma linha de código. */
export const IconLesson = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 4h11l3 3v13H5z" />
    <path d="M9 12l1.5 1.5L9 15" />
    <path d="M12.5 15.5h2.5" />
  </Base>
);

/** Projeto: bloco montado a partir de partes. */
export const IconProject = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <path d="M17 13.5v7" />
    <path d="M13.5 17h7" />
  </Base>
);

/** Revisão: seta que volta sobre um cartão. */
export const IconReview = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="6" width="17" height="12" rx="2" />
    <path d="M12 9.5L9.5 12l2.5 2.5" />
    <path d="M9.5 12h3a2.5 2.5 0 0 1 0 5h-.5" />
  </Base>
);

/** Sequência: chama estilizada, sem virar desenho animado. */
export const IconStreak = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3c3 3.5 5.5 6 5.5 9.5a5.5 5.5 0 0 1-11 0C6.5 9 9 6.5 12 3z" />
    <path d="M12 19a2.5 2.5 0 0 1-1.2-4.7c.6 1 1.2 1.3 1.2 1.3s.6-.3 1.2-1.3A2.5 2.5 0 0 1 12 19z" />
  </Base>
);

/** Conquista: marca de mérito geométrica, não um troféu de esporte. */
export const IconAward = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="9" r="5.5" />
    <path d="M12 6.8l.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9 8.9l2-.3z" />
    <path d="M8.5 14.2L7 21l5-2.2L17 21l-1.5-6.8" />
  </Base>
);

/** Alvo: objetivo da aula. */
export const IconTarget = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.5" />
  </Base>
);

/** Lista verificável: critérios de aceitação. */
export const IconChecklist = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6.5l1.5 1.5L8.5 5" />
    <path d="M4 17.5L5.5 19l3-3" />
    <path d="M12 7h8" />
    <path d="M12 17.5h8" />
  </Base>
);

/** Calendário com marca: nada vencido para revisar. */
export const IconCalendarCheck = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 9.5h17" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
    <path d="M9 14.5l2 2 4-4" />
  </Base>
);

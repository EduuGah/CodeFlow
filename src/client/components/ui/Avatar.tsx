import type { ReactNode } from 'react';

/**
 * Avatares da plataforma, e a foto.
 *
 * Dezenove figuras cheias — formas preenchidas, cor, sem contorno —, cada
 * uma sobre um fundo próprio. É o mesmo padrão das janelas em miniatura da
 * aparência: o objeto em pequeno, pintado, e não um ícone de traço fino. As
 * primeiras versões eram ícones de linha sobre um círculo e pareciam
 * genéricas; um personagem precisa de corpo.
 *
 * Os personagens seguem uma gramática só, para a coleção parecer de uma mão:
 * cabeça de frente ocupando o círculo, olhos de ponto escuro, uma mancha
 * mais clara no focinho, orelhas ou antenas fora da cabeça. Os abstratos
 * (folha, onda, estrela…) são formas cheias em tom claro sobre a cor.
 *
 * Dez são de todo mundo; nove abrem por nível ou pela loja
 * (`lib/economia.ts`). O avatar escolhido é guardado como `preset:<id>`; uma
 * foto enviada é a URL dela; e sem nenhum dos dois, vale a foto do Google ou
 * a inicial do nome.
 */

export interface AvatarPreset {
  id: string;
  title: string;
  /** Cor de fundo do círculo. */
  fundo: string;
  /** O desenho, numa grade de 48 × 48. */
  desenho: ReactNode;
}

/** A tinta dos olhos e narizes, a mesma em todos os personagens. */
const ESCURO = '#2b2622';
const CLARO = '#fff8f0';
const ROSA = '#f2a8b6';

export const AVATARES: AvatarPreset[] = [
  // ----------------------------------------------------------- de graça
  {
    id: 'folha',
    title: 'Folha',
    fundo: '#1f6660',
    desenho: (
      <g>
        <path d="M11 37C11 20 20 11 38 10c0 18-9 27-27 27z" fill="#cfeee3" />
        <path d="M13 35 33 15" stroke="#1f6660" strokeWidth={2} strokeLinecap="round" />
        <path d="M19 29l-4-1M23 25l-5-2M27 21l-5-3" stroke="#1f6660" strokeWidth={1.6} strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'onda',
    title: 'Onda',
    fundo: '#2563a8',
    desenho: (
      <g>
        <path d="M0 20c6 0 6 5 12 5s6-5 12-5 6 5 12 5 6-5 12-5v10c-6 0-6 5-12 5s-6-5-12-5-6 5-12 5-6-5-12-5z" fill="#9cc8f2" />
        <path d="M0 31c6 0 6 5 12 5s6-5 12-5 6 5 12 5 6-5 12-5v17H0z" fill={CLARO} />
      </g>
    ),
  },
  {
    id: 'estrela',
    title: 'Estrela',
    fundo: '#b8761c',
    desenho: (
      <g>
        <path d="M24 7l5.2 10.8 11.8 1.6-8.6 8.2 2.2 11.7L24 33.6l-10.6 5.7 2.2-11.7L7 19.4l11.8-1.6z" fill="#ffe9b3" />
        <circle cx="12" cy="10" r="1.6" fill="#ffe9b3" />
        <circle cx="38" cy="38" r="1.6" fill="#ffe9b3" />
      </g>
    ),
  },
  {
    id: 'cubo',
    title: 'Cubo',
    fundo: '#5b5f8f',
    desenho: (
      <g>
        <path d="M24 8l14 7v16l-14 7-14-7V15z" fill="#a9acdb" />
        <path d="M24 8l14 7-14 7-14-7z" fill="#e4e5f7" />
        <path d="M24 22l14-7v16l-14 7z" fill="#8588c4" />
      </g>
    ),
  },
  {
    id: 'raio',
    title: 'Raio',
    fundo: '#a6473a',
    desenho: <path d="M27 5L10 27h11l-3 16 20-24H27z" fill="#ffd9a0" />,
  },
  {
    id: 'lua',
    title: 'Lua',
    fundo: '#3c4a56',
    desenho: (
      <g>
        <path d="M28 6a17 17 0 1 0 14 26A14 14 0 0 1 28 6z" fill="#f4e6b8" />
        <circle cx="35" cy="12" r="1.8" fill="#f4e6b8" />
        <circle cx="41" cy="20" r="1.2" fill="#f4e6b8" />
      </g>
    ),
  },
  {
    id: 'gato',
    title: 'Gato',
    fundo: '#e6dff2',
    desenho: (
      <g>
        <path d="M12 22L9 6l12 8zM36 22l3-16-12 8z" fill="#8d8d99" />
        <path d="M13.5 19l-2-9.5 7.5 5zM34.5 19l2-9.5-7.5 5z" fill={ROSA} />
        <circle cx="24" cy="28" r="15" fill="#8d8d99" />
        <circle cx="18.5" cy="26" r="2.1" fill={ESCURO} />
        <circle cx="29.5" cy="26" r="2.1" fill={ESCURO} />
        <path d="M22.3 31h3.4L24 33.2z" fill={ROSA} />
        <path d="M20.5 34.5q1.75 1.6 3.5 0 1.75 1.6 3.5 0" stroke={ESCURO} strokeWidth={1.4} fill="none" strokeLinecap="round" />
        <path d="M7 31h6M7 34.5l6-1M41 31h-6M41 34.5l-6-1" stroke="#5f5f6b" strokeWidth={1.3} strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'sapo',
    title: 'Sapo',
    fundo: '#d3ecd9',
    desenho: (
      <g>
        <circle cx="15" cy="16" r="6.5" fill="#5daa5a" />
        <circle cx="33" cy="16" r="6.5" fill="#5daa5a" />
        <ellipse cx="24" cy="30" rx="17" ry="13" fill="#5daa5a" />
        <circle cx="15" cy="16" r="3.6" fill={CLARO} />
        <circle cx="33" cy="16" r="3.6" fill={CLARO} />
        <circle cx="15.6" cy="16.5" r="1.8" fill={ESCURO} />
        <circle cx="33.6" cy="16.5" r="1.8" fill={ESCURO} />
        <path d="M16 30q8 7 16 0" stroke={ESCURO} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <circle cx="12" cy="31" r="2.2" fill={ROSA} opacity={0.8} />
        <circle cx="36" cy="31" r="2.2" fill={ROSA} opacity={0.8} />
      </g>
    ),
  },
  {
    id: 'pinguim',
    title: 'Pinguim',
    fundo: '#cfe0f2',
    desenho: (
      <g>
        <ellipse cx="24" cy="28" rx="16" ry="18" fill="#2b3440" />
        <path d="M24 17c7 0 11 6 11 13 0 8-5 13-11 13S13 38 13 30c0-7 4-13 11-13z" fill={CLARO} />
        <circle cx="19.5" cy="24" r="2.1" fill={ESCURO} />
        <circle cx="28.5" cy="24" r="2.1" fill={ESCURO} />
        <path d="M20 28.5h8L24 33z" fill="#e5953c" />
        <path d="M9 24c-4 4-4 12 1 16 2-5 2-11-1-16zM39 24c4 4 4 12-1 16-2-5-2-11 1-16z" fill="#2b3440" />
      </g>
    ),
  },
  {
    id: 'coruja',
    title: 'Coruja',
    fundo: '#d9e8d3',
    desenho: (
      <g>
        <path d="M11 15l4-9 5 9zM37 15l-4-9-5 9z" fill="#8a5a3c" />
        <ellipse cx="24" cy="28" rx="16" ry="17" fill="#8a5a3c" />
        <circle cx="17.5" cy="25" r="7.5" fill="#e9d3b5" />
        <circle cx="30.5" cy="25" r="7.5" fill="#e9d3b5" />
        <circle cx="17.5" cy="25" r="3.3" fill={ESCURO} />
        <circle cx="30.5" cy="25" r="3.3" fill={ESCURO} />
        <circle cx="18.6" cy="23.9" r="1" fill={CLARO} />
        <circle cx="31.6" cy="23.9" r="1" fill={CLARO} />
        <path d="M21.5 31L24 36l2.5-5z" fill="#e5953c" />
        <path d="M18 40l-2 5M24 41v5M30 40l2 5" stroke="#e5953c" strokeWidth={1.6} strokeLinecap="round" />
      </g>
    ),
  },

  // -------------------------------------------- por nível ou pela loja
  {
    id: 'cometa',
    title: 'Cometa',
    fundo: '#7a3f8a',
    desenho: (
      <g>
        <path d="M35 12L4 30l3 5 30-18z" fill="#b487c4" />
        <path d="M37 15L8 42l4 2 27-24z" fill="#b487c4" opacity={0.6} />
        <path d="M35 12L4 30l29-14z" fill="#d6b8e0" />
        <circle cx="33" cy="15" r="8" fill="#ffe08a" />
        <circle cx="35.5" cy="12.5" r="2.4" fill="#fff5cc" />
      </g>
    ),
  },
  {
    id: 'raposa',
    title: 'Raposa',
    fundo: '#f6dcc7',
    desenho: (
      <g>
        <path d="M9 8l9 11h12l9-11-1 22q-14 16-28 0z" fill="#e07a2f" />
        <path d="M12 12l5 7 3-7zM36 12l-5 7-3-7z" fill="#c8561c" />
        <path d="M13 28q11 14 22 0-11-9-22 0z" fill={CLARO} />
        <circle cx="18" cy="25.5" r="2.1" fill={ESCURO} />
        <circle cx="30" cy="25.5" r="2.1" fill={ESCURO} />
        <path d="M21.5 31.5h5L24 34.5z" fill={ESCURO} />
      </g>
    ),
  },
  {
    id: 'urso',
    title: 'Urso',
    fundo: '#f2e4cf',
    desenho: (
      <g>
        <circle cx="11.5" cy="14" r="6" fill="#a06b45" />
        <circle cx="36.5" cy="14" r="6" fill="#a06b45" />
        <circle cx="11.5" cy="14" r="2.8" fill="#e3c39f" />
        <circle cx="36.5" cy="14" r="2.8" fill="#e3c39f" />
        <circle cx="24" cy="27" r="15.5" fill="#a06b45" />
        <ellipse cx="24" cy="32" rx="7.5" ry="5.5" fill="#e3c39f" />
        <circle cx="18" cy="24.5" r="2.1" fill={ESCURO} />
        <circle cx="30" cy="24.5" r="2.1" fill={ESCURO} />
        <ellipse cx="24" cy="30.5" rx="2.6" ry="1.9" fill={ESCURO} />
      </g>
    ),
  },
  {
    id: 'coelho',
    title: 'Coelho',
    fundo: '#f5e0e6',
    desenho: (
      <g>
        <ellipse cx="17" cy="13" rx="4.8" ry="11" transform="rotate(-8 17 13)" fill="#c9c5cf" />
        <ellipse cx="31" cy="13" rx="4.8" ry="11" transform="rotate(8 31 13)" fill="#c9c5cf" />
        <ellipse cx="17" cy="13" rx="2.3" ry="8" transform="rotate(-8 17 13)" fill={ROSA} />
        <ellipse cx="31" cy="13" rx="2.3" ry="8" transform="rotate(8 31 13)" fill={ROSA} />
        <circle cx="24" cy="30" r="13.5" fill="#c9c5cf" />
        <circle cx="19" cy="28" r="2.1" fill={ESCURO} />
        <circle cx="29" cy="28" r="2.1" fill={ESCURO} />
        <path d="M22.3 32.5h3.4L24 34.7z" fill={ROSA} />
        <rect x="22" y="35.5" width="4" height="3.2" rx="1" fill={CLARO} />
      </g>
    ),
  },
  {
    id: 'dino',
    title: 'Dino',
    fundo: '#f3e4c8',
    desenho: (
      <g>
        <path d="M11 17l3-8 4 7 3-8 4 7 3-8 4 7 3-8 3 11z" fill="#e5b84a" />
        <path d="M9 19a4 4 0 0 1 4-4h22a4 4 0 0 1 4 4v10a10 10 0 0 1-10 10H19A10 10 0 0 1 9 29z" fill="#4f9e8a" />
        <ellipse cx="24" cy="33" rx="9" ry="5" fill="#7fc4b1" />
        <circle cx="17" cy="24" r="2.2" fill={ESCURO} />
        <circle cx="31" cy="24" r="2.2" fill={ESCURO} />
        <circle cx="20" cy="32" r="1.2" fill={ESCURO} />
        <circle cx="28" cy="32" r="1.2" fill={ESCURO} />
      </g>
    ),
  },
  {
    id: 'panda',
    title: 'Panda',
    fundo: '#e0e7ee',
    desenho: (
      <g>
        <circle cx="11.5" cy="14" r="6" fill="#2b2a2e" />
        <circle cx="36.5" cy="14" r="6" fill="#2b2a2e" />
        <circle cx="24" cy="27" r="15.5" fill="#f7f7f5" />
        <ellipse cx="18" cy="25.5" rx="4.2" ry="5.2" transform="rotate(-20 18 25.5)" fill="#2b2a2e" />
        <ellipse cx="30" cy="25.5" rx="4.2" ry="5.2" transform="rotate(20 30 25.5)" fill="#2b2a2e" />
        <circle cx="18.6" cy="26" r="1.5" fill={CLARO} />
        <circle cx="29.4" cy="26" r="1.5" fill={CLARO} />
        <ellipse cx="24" cy="32.5" rx="2.6" ry="1.9" fill="#2b2a2e" />
      </g>
    ),
  },
  {
    id: 'robo',
    title: 'Robô',
    fundo: '#cfe3e0',
    desenho: (
      <g>
        <rect x="22.5" y="8" width="3" height="7" rx="1.5" fill="#8b99ad" />
        <circle cx="24" cy="7" r="3.2" fill="#e5b84a" />
        <rect x="8" y="23" width="4.5" height="9" rx="2" fill="#5f6d80" />
        <rect x="35.5" y="23" width="4.5" height="9" rx="2" fill="#5f6d80" />
        <rect x="11.5" y="14" width="25" height="24" rx="7" fill="#8b99ad" />
        <rect x="16" y="19.5" width="16" height="12.5" rx="4" fill="#243244" />
        <circle cx="20.5" cy="24.5" r="2.1" fill="#7de0c4" />
        <circle cx="27.5" cy="24.5" r="2.1" fill="#7de0c4" />
        <path d="M20.5 29h7" stroke="#7de0c4" strokeWidth={1.6} strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'polvo',
    title: 'Polvo',
    fundo: '#f6d7dc',
    desenho: (
      <g>
        <path d="M8 27a16 16 0 0 1 32 0v8q-2 5-6 1-3 5-7 1-3 5-7 0-4 5-7 0-3 4-5-1z" fill="#9a5ba8" />
        <circle cx="18" cy="25" r="2.4" fill={ESCURO} />
        <circle cx="30" cy="25" r="2.4" fill={ESCURO} />
        <path d="M20.5 30.5q3.5 3 7 0" stroke={ESCURO} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        <circle cx="12.5" cy="29" r="2.2" fill={ROSA} opacity={0.85} />
        <circle cx="35.5" cy="29" r="2.2" fill={ROSA} opacity={0.85} />
      </g>
    ),
  },
  {
    id: 'alien',
    title: 'Alien',
    fundo: '#dfe9d0',
    desenho: (
      <g>
        <path d="M24 9.5v-4" stroke="#7cc36a" strokeWidth={2} strokeLinecap="round" />
        <circle cx="24" cy="4.5" r="2.4" fill="#e5b84a" />
        <path d="M24 10c9 0 14.5 6.5 14.5 14 0 9-8 17-14.5 17S9.5 33 9.5 24c0-7.5 5.5-14 14.5-14z" fill="#7cc36a" />
        <ellipse cx="18" cy="24.5" rx="3.4" ry="5.2" transform="rotate(22 18 24.5)" fill={ESCURO} />
        <ellipse cx="30" cy="24.5" rx="3.4" ry="5.2" transform="rotate(-22 30 24.5)" fill={ESCURO} />
        <path d="M22 34h4" stroke={ESCURO} strokeWidth={1.6} strokeLinecap="round" />
      </g>
    ),
  },
];

/** Avatares que todo mundo tem. Os outros abrem por nível ou compra. */
export const AVATARES_LIVRES = ['folha', 'onda', 'estrela', 'cubo', 'raio', 'lua', 'gato', 'sapo', 'pinguim', 'coruja'];

export function avatarPreset(id: string): AvatarPreset | undefined {
  return AVATARES.find((a) => a.id === id);
}

/** Um avatar desenhado, no tamanho pedido. O círculo recorta o que passa da borda. */
export function AvatarDesenhado({ preset, size = 56, className = '' }: { preset: AvatarPreset; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 rounded-full ${className}`}
      style={{ background: preset.fundo }}
    >
      {preset.desenho}
    </svg>
  );
}

/**
 * O avatar da pessoa: o escolhido (`preset:<id>` ou URL), senão a foto do
 * Google, senão a inicial do nome sobre a cor da marca.
 */
export function Avatar({
  escolhido,
  fotoDoGoogle,
  nome,
  size = 56,
}: {
  escolhido: string | null;
  fotoDoGoogle?: string | null;
  nome: string;
  size?: number;
}) {
  if (escolhido?.startsWith('preset:')) {
    const preset = avatarPreset(escolhido.slice('preset:'.length));
    if (preset) return <AvatarDesenhado preset={preset} size={size} />;
  }

  const url = escolhido && !escolhido.startsWith('preset:') ? escolhido : fotoDoGoogle;
  if (url) {
    return (
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full bg-sunken object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {nome.charAt(0).toUpperCase()}
    </span>
  );
}

import type { ReactNode } from 'react';

/**
 * Avatares da plataforma, e a foto.
 *
 * Nove figuras desenhadas na mesma gramática dos ícones — grade de 24, traço
 * de 1.75, geometria simples —, cada uma sobre uma cor da paleta. Seis são de
 * todo mundo; três abrem por nível ou pela loja (`lib/economia.ts`). O avatar
 * escolhido é guardado como `preset:<id>`; uma foto enviada é a URL dela; e
 * sem nenhum dos dois, vale a foto do Google ou a inicial do nome.
 */

export interface AvatarPreset {
  id: string;
  title: string;
  /** Cor de fundo (token da paleta). */
  fundo: string;
  desenho: ReactNode;
}

const traco = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const AVATARES: AvatarPreset[] = [
  {
    id: 'folha',
    title: 'Folha',
    fundo: 'var(--color-brand-600)',
    desenho: (
      <g {...traco}>
        <path d="M6 18C6 10 10 6 18 6c0 8-4 12-12 12z" />
        <path d="M6 18l7-7" />
      </g>
    ),
  },
  {
    id: 'onda',
    title: 'Onda',
    fundo: '#2563a8',
    desenho: (
      <g {...traco}>
        <path d="M4 9c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2" />
        <path d="M4 15c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2" />
      </g>
    ),
  },
  {
    id: 'estrela',
    title: 'Estrela',
    fundo: '#b8761c',
    desenho: (
      <g {...traco}>
        <path d="M12 4l2.4 5.1 5.6.7-4.1 3.9 1 5.6L12 16.6 7.1 19.3l1-5.6L4 9.8l5.6-.7z" />
      </g>
    ),
  },
  {
    id: 'cubo',
    title: 'Cubo',
    fundo: '#5b5f8f',
    desenho: (
      <g {...traco}>
        <path d="M12 4l7 4v8l-7 4-7-4V8z" />
        <path d="M5 8l7 4 7-4M12 12v8" />
      </g>
    ),
  },
  {
    id: 'raio',
    title: 'Raio',
    fundo: '#a6473a',
    desenho: (
      <g {...traco}>
        <path d="M13 4L6 13h5l-1 7 8-10h-5z" />
      </g>
    ),
  },
  {
    id: 'lua',
    title: 'Lua',
    fundo: '#3c4a56',
    desenho: (
      <g {...traco}>
        <path d="M15 4a8 8 0 1 0 5 14 7 7 0 0 1-5-14z" />
      </g>
    ),
  },
  {
    id: 'cometa',
    title: 'Cometa',
    fundo: '#7a3f8a',
    desenho: (
      <g {...traco}>
        <circle cx="15.5" cy="8.5" r="3" />
        <path d="M13 11l-8 8M11 8.5L5 12M15.5 13l-3 6" />
      </g>
    ),
  },
  {
    id: 'raposa',
    title: 'Raposa',
    fundo: '#c25a2a',
    desenho: (
      <g {...traco}>
        <path d="M5 6l3 4h8l3-4v9a7 4 0 0 1-14 0z" />
        <path d="M9 13h.01M15 13h.01M12 16l-1 1h2z" />
      </g>
    ),
  },
  {
    id: 'robo',
    title: 'Robô',
    fundo: '#2a7a72',
    desenho: (
      <g {...traco}>
        <rect x="5" y="8" width="14" height="11" rx="2" />
        <path d="M12 4v4M9 13h.01M15 13h.01M9 16h6" />
      </g>
    ),
  },
];

/** Avatares que todo mundo tem. Os outros abrem por nível ou compra. */
export const AVATARES_LIVRES = ['folha', 'onda', 'estrela', 'cubo', 'raio', 'lua'];

export function avatarPreset(id: string): AvatarPreset | undefined {
  return AVATARES.find((a) => a.id === id);
}

/** Um avatar desenhado, no tamanho pedido. */
export function AvatarDesenhado({ preset, size = 56 }: { preset: AvatarPreset; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="shrink-0 rounded-full"
      style={{ background: preset.fundo, color: '#ffffff' }}
    >
      <g transform="translate(3 3) scale(0.75)">{preset.desenho}</g>
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

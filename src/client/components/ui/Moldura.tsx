import type { ReactNode } from 'react';

import { P } from './Ilustracao';

/**
 * As molduras do avatar: um anel pintado **sobre a borda** do círculo, sem
 * mudar o tamanho dele. Assim ela cabe dentro do anel de nível do perfil e
 * no avatar pequeno do início, e um avatar com moldura ocupa o mesmo lugar
 * que um sem.
 *
 * Mesma família das vinhetas (`Ilustracao.tsx`): formas cheias, a paleta `P`,
 * nenhum traço fino de clip-art. A grade é de 100 e o avatar é o círculo de
 * raio 50; cada moldura mora entre o raio 42 e o 50.
 */

export const MOLDURAS = ['minimal', 'terminal', 'pixel', 'neon', 'ouro'] as const;
export type IdDeMoldura = (typeof MOLDURAS)[number];

export function ehMoldura(valor: unknown): valor is IdDeMoldura {
  return typeof valor === 'string' && (MOLDURAS as readonly string[]).includes(valor);
}

/** Pontos igualmente espaçados num círculo, a partir do topo. */
function emVolta(n: number, raio: number): Array<{ x: number; y: number; angulo: number }> {
  return Array.from({ length: n }, (_, i) => {
    const angulo = (i / n) * 360 - 90;
    const rad = (angulo * Math.PI) / 180;
    return { x: 50 + raio * Math.cos(rad), y: 50 + raio * Math.sin(rad), angulo: angulo + 90 };
  });
}

const DESENHOS: Record<IdDeMoldura, ReactNode> = {
  // Dois fios, o de fora mais grosso: a moldura que só arruma.
  minimal: (
    <>
      <circle cx="50" cy="50" r="47.5" fill="none" stroke={P.escuro} strokeWidth="4" />
      <circle cx="50" cy="50" r="42.5" fill="none" stroke={P.creme} strokeWidth="2" />
    </>
  ),
  // Aro escuro com traços de fósforo; um deles mais largo, o cursor.
  terminal: (
    <>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#10201a" strokeWidth="8" />
      {emVolta(16, 46).map(({ x, y, angulo }, i) => (
        <rect
          key={i}
          x={x - (i === 0 ? 3.5 : 2)}
          y={y - 1.4}
          width={i === 0 ? 7 : 4}
          height="2.8"
          rx="0.6"
          fill={i === 0 ? '#b8f5c8' : '#3ddc84'}
          transform={`rotate(${angulo} ${x} ${y})`}
        />
      ))}
    </>
  ),
  // Blocos quadrados alternando dourado e laranja, sem girar: é o pixel.
  pixel: (
    <>
      {emVolta(24, 46).map(({ x, y }, i) => (
        <rect key={i} x={x - 3.6} y={y - 3.6} width="7.2" height="7.2" fill={i % 2 ? P.laranja : P.dourado} />
      ))}
    </>
  ),
  // Dois tubos acesos: o brilho é um traço largo e translúcido por baixo.
  neon: (
    <>
      <circle cx="50" cy="50" r="46.5" fill="none" stroke="#ff4fa3" strokeOpacity="0.35" strokeWidth="7" />
      <circle cx="50" cy="50" r="46.5" fill="none" stroke="#ff7cc0" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="42.5" fill="none" stroke="#3fe0ff" strokeOpacity="0.35" strokeWidth="5" />
      <circle cx="50" cy="50" r="42.5" fill="none" stroke="#9af0ff" strokeWidth="1.8" />
    </>
  ),
  // Aro dourado com relevo, e o louro fechando embaixo.
  ouro: (
    <>
      <circle cx="50" cy="50" r="46" fill="none" stroke={P.douradoEscuro} strokeWidth="8" />
      <circle cx="50" cy="50" r="47.5" fill="none" stroke={P.dourado} strokeWidth="3" />
      {[-1, 1].map((lado) =>
        [0, 1, 2, 3].map((i) => {
          const angulo = 90 + lado * (18 + i * 13);
          const rad = (angulo * Math.PI) / 180;
          const x = 50 + 45 * Math.cos(rad);
          const y = 50 + 45 * Math.sin(rad);
          return (
            <ellipse
              key={`${lado}-${i}`}
              cx={x}
              cy={y}
              rx="5.5"
              ry="2.6"
              fill={i % 2 ? P.verde : P.verdeEscuro}
              transform={`rotate(${angulo + lado * 60} ${x} ${y})`}
            />
          );
        })
      )}
      <circle cx="50" cy="95" r="3.2" fill={P.dourado} />
    </>
  ),
};

/** Só o anel, para desenhar sobre um avatar do mesmo tamanho. */
export function MolduraDesenhada({ id, size }: { id: IdDeMoldura; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      focusable="false"
    >
      {DESENHOS[id]}
    </svg>
  );
}

/**
 * O avatar com a moldura por cima, quando há uma. `moldura` é o id curto
 * (`neon`), o que o perfil guarda; um valor que não é moldura não desenha nada.
 */
export function ComMoldura({ moldura, size, children }: { moldura: string | null; size: number; children: ReactNode }) {
  return (
    <span
      className="relative inline-flex shrink-0 rounded-full"
      style={{ width: size, height: size }}
      data-moldura={ehMoldura(moldura) ? moldura : undefined}
    >
      {children}
      {ehMoldura(moldura) && <MolduraDesenhada id={moldura} size={size} />}
    </span>
  );
}

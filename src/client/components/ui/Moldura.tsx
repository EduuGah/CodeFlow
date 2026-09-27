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

/** As da loja. */
export const MOLDURAS = ['minimal', 'terminal', 'pixel', 'chaves', 'neon', 'prisma', 'ouro', 'engrenagens'] as const;
/** As que não se vendem: abrem por conquista (`lib/exclusivos.ts`). */
export const MOLDURAS_DE_CONQUISTA = ['chama', 'orbita'] as const;
export type IdDeMoldura = (typeof MOLDURAS)[number] | (typeof MOLDURAS_DE_CONQUISTA)[number];

const TODAS: readonly string[] = [...MOLDURAS, ...MOLDURAS_DE_CONQUISTA];

export function ehMoldura(valor: unknown): valor is IdDeMoldura {
  return typeof valor === 'string' && TODAS.includes(valor);
}

/** Uma chave `{` na borda esquerda; a da direita é o espelho dela. */
const CHAVE = 'M10 29C6.2 29 5.5 31.5 5.5 35V43C5.5 46.5 4 48.8 1.8 50C4 51.2 5.5 53.5 5.5 57V65C5.5 68.5 6.2 71 10 71';

/** As seis cores do prisma, em arcos iguais a partir do topo. */
const ESPECTRO = ['#e5484d', '#f08a3c', '#e5b84a', '#5daa5a', '#2563a8', '#9a5ba8'];

/** Uma labareda com a ponta para cima, centrada na origem; quem usa gira e escala. */
const LABAREDA = 'M0 -6 C2.6 -2.6 3.6 -0.4 3.6 1.6 A3.6 3.6 0 0 1 -3.6 1.6 C-3.6 -0.4 -2.6 -2.6 0 -6 Z';

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
  // Aro de editor escuro e as duas chaves de um bloco de código, uma de cada lado.
  chaves: (
    <>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#24324a" strokeWidth="6" />
      <circle cx="50" cy="50" r="42.5" fill="none" stroke="#7aa2f7" strokeOpacity="0.5" strokeWidth="1" />
      {[false, true].map((direita) => (
        <path
          key={String(direita)}
          d={CHAVE}
          fill="none"
          stroke={P.dourado}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={direita ? 'translate(100 0) scale(-1 1)' : undefined}
        />
      ))}
      <circle cx="50" cy="4" r="2.4" fill="#7aa2f7" />
      <circle cx="50" cy="96" r="2.4" fill="#7aa2f7" />
    </>
  ),
  // Seis arcos do espectro, e um fio claro por dentro: a luz aberta em cores.
  prisma: (
    <>
      {ESPECTRO.map((cor, i) => {
        const volta = 2 * Math.PI * 46;
        const arco = volta / ESPECTRO.length;
        return (
          <circle
            key={cor}
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={cor}
            strokeWidth="7"
            strokeDasharray={`${arco} ${volta - arco}`}
            strokeDashoffset={volta / 4 - i * arco}
          />
        );
      })}
      <circle cx="50" cy="50" r="42" fill="none" stroke={P.creme} strokeWidth="1.5" />
    </>
  ),
  // Aro de metal com os dentes de uma engrenagem, e um fio de bronze por dentro.
  engrenagens: (
    <>
      {/* Os dentes saem para fora do aro: é o recorte que faz a engrenagem. */}
      {emVolta(18, 47.4).map(({ x, y, angulo }, i) => (
        <rect
          key={i}
          x={x - 3}
          y={y - 2.4}
          width="6"
          height="4.8"
          rx="0.8"
          fill="#7b8794"
          transform={`rotate(${angulo} ${x} ${y})`}
        />
      ))}
      <circle cx="50" cy="50" r="43.6" fill="none" stroke="#7b8794" strokeWidth="5" />
      <circle cx="50" cy="50" r="45.4" fill="none" stroke="#c9d2dc" strokeWidth="1" />
      <circle cx="50" cy="50" r="41.3" fill="none" stroke={P.douradoEscuro} strokeWidth="1.4" />
    </>
  ),
  // Brasa no aro e labaredas para fora, a de dentro mais clara: trinta dias acesos.
  chama: (
    <>
      <circle cx="50" cy="50" r="45" fill="none" stroke="#8a2a1c" strokeWidth="6" />
      {emVolta(14, 45).map(({ x, y, angulo }, i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${angulo})`}>
          <path d={LABAREDA} fill={P.laranja} transform="scale(1.15)" />
          <path d={LABAREDA} fill={P.dourado} transform="translate(0 1.2) scale(0.6)" />
        </g>
      ))}
    </>
  ),
  // Um aro de céu com a órbita tracejada e três planetas nela — um com anel.
  orbita: (
    <>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#1d2748" strokeWidth="7" />
      <circle cx="50" cy="50" r="46" fill="none" stroke="#8fa8ff" strokeWidth="1" strokeDasharray="2.5 3" />
      {[
        { angulo: -60, r: 4.6, cor: P.laranja },
        { angulo: 70, r: 3.6, cor: '#6fd3ff' },
        { angulo: 190, r: 5, cor: P.dourado, anel: true },
      ].map(({ angulo, r, cor, anel }) => {
        const rad = (angulo * Math.PI) / 180;
        const x = 50 + 46 * Math.cos(rad);
        const y = 50 + 46 * Math.sin(rad);
        return (
          <g key={angulo}>
            <circle cx={x} cy={y} r={r} fill={cor} />
            {anel && (
              <ellipse
                cx={x}
                cy={y}
                rx={r + 3}
                ry="1.4"
                fill="none"
                stroke={P.creme}
                strokeWidth="1.2"
                transform={`rotate(-20 ${x} ${y})`}
              />
            )}
          </g>
        );
      })}
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

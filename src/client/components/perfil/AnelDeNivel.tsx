import type { ReactNode } from 'react';

/**
 * O anel de progresso em volta do avatar, com o nível na pastilha.
 *
 * O nível e o quanto falta para o próximo são as duas coisas que o aluno
 * olha primeiro no perfil; em volta da foto, eles são lidos de relance sem
 * ocupar uma linha. O anel é um círculo com `stroke-dasharray`: nada de
 * biblioteca para um arco.
 */
export function AnelDeNivel({
  nivel,
  fracao,
  size = 88,
  children,
}: {
  nivel: number;
  /** De 0 a 1: o XP dentro do nível sobre o que o nível pede. */
  fracao: number;
  size?: number;
  children: ReactNode;
}) {
  const espessura = 4;
  const raio = (size - espessura) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const cheio = Math.max(0, Math.min(1, fracao)) * circunferencia;

  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx={size / 2} cy={size / 2} r={raio} fill="none" stroke="var(--color-line)" strokeWidth={espessura} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={raio}
          fill="none"
          stroke="var(--color-brand-600)"
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeDasharray={`${cheio} ${circunferencia - cheio}`}
          className="transition-[stroke-dasharray] duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center" style={{ padding: espessura + 4 }}>
        {children}
      </span>
      <span
        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded-full border-2 border-surface bg-brand-600 px-2 py-0.5 text-[11px] font-extrabold leading-none text-white"
        aria-hidden="true"
      >
        {nivel}
      </span>
    </span>
  );
}

import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Rótulo curto de estado ou categoria.
 *
 * Cada tom carrega significado (ver docs/design-system.md). O texto é sempre
 * obrigatório: estado indicado apenas por cor exclui quem não a distingue, o que
 * o §3 do documento de design proíbe.
 */
export type BadgeTone = 'neutral' | 'success' | 'caution' | 'danger';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Ícone opcional à esquerda. Reforça o tom, nunca substitui o texto. */
  icon?: React.ReactNode;
}

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-zinc-100 text-zinc-700',
  success: 'bg-emerald-50 text-emerald-700',
  caution: 'bg-amber-50 text-amber-800',
  danger: 'bg-red-50 text-red-700',
};

export function Badge({ tone = 'neutral', icon, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
        tones[tone],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}

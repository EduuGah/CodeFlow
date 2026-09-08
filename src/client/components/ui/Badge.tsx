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
  neutral: 'bg-sunken text-ink-soft',
  success: 'bg-success-50 text-success-700',
  caution: 'bg-energy-50 text-energy-700',
  danger: 'bg-danger-50 text-danger-700',
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

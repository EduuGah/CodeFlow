import { cn } from '../../lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  /** Rótulo acessível. Obrigatório: uma barra sem nome não diz nada a um leitor de tela. */
  label: string;
  /** Mostra "3 de 10" ao lado do rótulo. */
  showCount?: boolean;
  className?: string;
}

/**
 * Barra de progresso.
 *
 * Usa os atributos ARIA de progressbar para que o valor seja anunciado, e não
 * apenas visto — o percentual não pode existir só como largura de um retângulo.
 */
export function ProgressBar({ value, max = 100, label, showCount, className }: ProgressBarProps) {
  const limitado = Math.max(0, Math.min(value, max));
  const percentual = max === 0 ? 0 : Math.round((limitado / max) * 100);

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink-soft">{label}</span>
        <span className="text-xs tabular-nums text-ink-faint">
          {showCount ? `${limitado} de ${max}` : `${percentual}%`}
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={limitado}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-line"
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-500',
            percentual === 100 ? 'bg-success-600' : 'bg-ink'
          )}
          style={{ width: `${percentual}%` }}
        />
      </div>
    </div>
  );
}

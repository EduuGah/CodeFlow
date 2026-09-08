import React from 'react';
import { IconAlert, IconRetry } from './Icon';
import { Button } from './Button';
import { cn } from '../../lib/utils';

/**
 * Estados obrigatórios de tela (§3 do documento de design).
 *
 * Existem para a interface nunca parecer quebrada quando não há dados ou quando
 * algo falhou. A regra dos dois: todo estado diz o que aconteceu **e** o que a
 * pessoa pode fazer a seguir — um sem o outro deixa o aluno parado.
 */

interface EmptyStateProps {
  /** O que está vazio, em uma frase. */
  title: string;
  /** Por que está vazio e o que muda isso. */
  description?: string;
  /** A ação que resolve. Sem ela, o estado vira um beco sem saída. */
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center',
        className
      )}
    >
      {icon && <div className="mb-3 text-ink-faint">{icon}</div>}

      <p className="font-medium text-ink">{title}</p>

      {description && (
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-faint">{description}</p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  /** Mensagem para o aluno — específica, sem jargão de stack trace. */
  message: string;
  onRetry?: () => void;
  /** Texto técnico, escondido por padrão: útil para você, ruído para o iniciante. */
  details?: string;
  className?: string;
}

export function ErrorState({
  title = 'Algo não funcionou',
  message,
  onRetry,
  details,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn('rounded-xl border border-danger-200 bg-danger-50 p-5', className)}
    >
      <div className="flex items-start gap-3">
        <IconAlert size={18} className="mt-0.5 flex-shrink-0 text-danger-500" />

        <div className="min-w-0 flex-1">
          <p className="font-medium text-danger-700">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-danger-700">{message}</p>

          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-4 gap-2 border-danger-200 bg-surface text-danger-700 hover:bg-danger-50"
            >
              <IconRetry size={14} />
              Tentar novamente
            </Button>
          )}

          {details && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-danger-700/80 hover:text-danger-700">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 overflow-x-auto rounded border border-danger-200 bg-surface p-2 text-xs">
                <code className="font-mono text-danger-700">{details}</code>
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
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
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center',
        className
      )}
    >
      {icon && <div className="mb-3 text-zinc-400">{icon}</div>}

      <p className="font-medium text-zinc-900">{title}</p>

      {description && (
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-zinc-500">{description}</p>
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
      className={cn('rounded-xl border border-red-200 bg-red-50 p-5', className)}
    >
      <div className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-500" />

        <div className="min-w-0 flex-1">
          <p className="font-medium text-red-900">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-red-800">{message}</p>

          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-4 gap-2 border-red-200 bg-white text-red-800 hover:bg-red-100"
            >
              <RefreshCw size={14} />
              Tentar novamente
            </Button>
          )}

          {details && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-red-700/80 hover:text-red-900">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 overflow-x-auto rounded border border-red-200 bg-white p-2 text-xs">
                <code className="font-mono text-red-900">{details}</code>
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

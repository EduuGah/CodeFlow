import { Check, Circle, Loader2, X } from 'lucide-react';
import type { ProjectCheckpoint } from '../../../content/types';

/**
 * Critérios de aceitação do projeto (§228), verificados de verdade.
 *
 * Antes o "Submeter Projeto" marcava como entregue sem olhar o código — o aluno
 * podia entregar o arquivo vazio e receber o troféu. Os critérios existiam só no
 * texto do enunciado, e ninguém os conferia.
 */

export interface CheckpointResult {
  /** Falhas do checkpoint. Vazio significa fechado. */
  failures: string[];
  passed: boolean;
}

interface CheckpointListProps {
  checkpoints: ProjectCheckpoint[];
  /** Resultado por id de checkpoint. Ausente = ainda não verificado. */
  results: Map<string, CheckpointResult>;
  verifying: boolean;
}

export function CheckpointList({ checkpoints, results, verifying }: CheckpointListProps) {
  return (
    <ol className="space-y-3">
      {checkpoints.map((checkpoint, indice) => {
        const resultado = results.get(checkpoint.id);
        const estado = verifying
          ? 'verificando'
          : resultado === undefined
            ? 'pendente'
            : resultado.passed
              ? 'ok'
              : 'falhou';

        const estiloDoIcone = {
          verificando: 'bg-zinc-100 text-zinc-400',
          pendente: 'bg-zinc-100 text-zinc-400',
          ok: 'bg-emerald-600 text-white',
          falhou: 'bg-amber-100 text-amber-700',
        }[estado];

        return (
          <li key={checkpoint.id} className="flex gap-3">
            <span
              className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${estiloDoIcone}`}
            >
              {estado === 'verificando' && <Loader2 size={13} className="animate-spin" />}
              {estado === 'pendente' && <Circle size={11} />}
              {estado === 'ok' && <Check size={14} strokeWidth={3} />}
              {estado === 'falhou' && <X size={14} strokeWidth={3} />}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900">
                {indice + 1}. {checkpoint.title}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-zinc-500">
                {checkpoint.description}
              </p>

              {/* Só o que falhou: listar o que passou seria ruído. */}
              {estado === 'falhou' && (
                <ul className="mt-2 space-y-1">
                  {resultado?.failures.map((mensagem, i) => (
                    <li
                      key={i}
                      className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs leading-relaxed text-amber-900"
                    >
                      {mensagem}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

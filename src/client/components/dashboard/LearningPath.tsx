import { Link } from 'react-router-dom';
import { Check, Info } from 'lucide-react';
import type { PathNode } from '../../lib/path';
import { Badge } from '../ui/Badge';

/**
 * Caminho de aprendizado da trilha.
 *
 * Formato inspirado nas trilhas verticais de apps de idioma, mas sem a parte
 * infantil: sem mascote, sem nó pulando, sem cadeado. O §19 pede gamificação
 * que incentive o estudo sem virar jogo, e o §280 proíbe bloquear o aluno — daí
 * toda etapa ser clicável, com aviso no lugar de trava.
 *
 * A linha vertical entre os nós é o que transforma uma lista em caminho: ela
 * mostra que existe uma ordem, e o preenchimento dela mostra o quanto já andou.
 */

const estilosDoNo: Record<PathNode['state'], string> = {
  concluida: 'border-emerald-600 bg-emerald-600 text-white',
  atual: 'border-zinc-900 bg-zinc-900 text-white ring-4 ring-zinc-900/10',
  proxima: 'border-zinc-300 bg-white text-zinc-400',
};

export function LearningPath({ nodes }: { nodes: PathNode[] }) {
  if (nodes.length === 0) return null;

  return (
    <ol className="relative">
      {nodes.map((node, indice) => {
        const ultimo = indice === nodes.length - 1;
        const { lesson, state } = node;

        return (
          <li key={lesson.id} className="relative flex gap-4 pb-2">
            {/* Trilho: ligado até onde o aluno chegou, apagado depois. */}
            {!ultimo && (
              <span
                aria-hidden
                className={`absolute left-[19px] top-10 h-full w-0.5 ${
                  state === 'concluida' ? 'bg-emerald-600' : 'bg-zinc-200'
                }`}
              />
            )}

            <span
              className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${estilosDoNo[state]}`}
            >
              {state === 'concluida' ? <Check size={18} strokeWidth={3} /> : node.position}
            </span>

            <Link
              to={`/lesson/${lesson.id}`}
              className="mb-4 min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-semibold text-zinc-900">{lesson.title}</h3>

                <span className="flex flex-shrink-0 items-center gap-2">
                  <span className="text-xs text-zinc-400">{lesson.estimatedMinutes} min</span>
                  {state === 'concluida' && <Badge tone="success">Concluída</Badge>}
                  {state === 'atual' && <Badge>Você está aqui</Badge>}
                </span>
              </div>

              <p className="mt-1 text-sm leading-relaxed text-zinc-500">{lesson.objective}</p>

              {/* Aviso, não impedimento: a aula continua clicável. */}
              {node.shakyPrerequisites.length > 0 && (
                <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                  <Info size={14} className="mt-0.5 flex-shrink-0 text-amber-600" />
                  <span>
                    Esta aula supõe{' '}
                    <strong className="font-semibold">
                      {node.shakyPrerequisites.map((c) => c.title).join(' e ')}
                    </strong>
                    , que você ainda não praticou. Dá para seguir mesmo assim — só costuma render
                    mais na outra ordem.
                  </span>
                </p>
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

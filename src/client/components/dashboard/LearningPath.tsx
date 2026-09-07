import { Link } from 'react-router-dom';
import { Check, Info } from 'lucide-react';
import type { PathNode } from '../../lib/path';
import { Badge } from '../ui/Badge';

/**
 * Linha do tempo da trilha.
 *
 * Uma linha vertical contínua, com cada aula como um marco sobre ela. O trecho
 * já percorrido fica preenchido, o restante apagado — então o progresso se lê
 * de relance, sem precisar contar itens.
 *
 * As aulas concluídas mostram **quando** foram concluídas. É o que separa uma
 * linha do tempo de uma lista numerada: a sequência tem história, e o aluno vê
 * o próprio ritmo.
 *
 * Como no resto da plataforma, nenhuma etapa é bloqueada (§280) — o que existe
 * é aviso quando os pré-requisitos estão fracos.
 *
 * `isolate` cria contexto de empilhamento próprio, então o z-index dos marcos
 * não escapa e não passa por cima do cabeçalho fixo.
 */

const formatador = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });

function formatarData(iso: string): string {
  return formatador.format(new Date(iso));
}

const estilosDoMarco: Record<PathNode['state'], string> = {
  concluida: 'border-emerald-500 bg-emerald-500 text-white',
  atual: 'border-zinc-900 bg-zinc-900 text-white ring-4 ring-zinc-900/10',
  proxima: 'border-zinc-300 bg-white text-zinc-400',
};

export function LearningPath({ nodes }: { nodes: PathNode[] }) {
  if (nodes.length === 0) return null;

  return (
    <ol className="isolate relative">
      {nodes.map((node, indice) => {
        const { lesson, state } = node;
        const ultimo = indice === nodes.length - 1;
        const temAviso = node.shakyPrerequisites.length > 0;

        return (
          <li key={lesson.id} className="relative flex gap-4 pb-8 last:pb-0">
            {/* A linha propriamente dita, atrás dos marcos. */}
            {!ultimo && (
              <span
                aria-hidden
                className={`absolute left-[15px] top-8 -bottom-0 w-0.5 ${
                  state === 'concluida' ? 'bg-emerald-500' : 'bg-zinc-200'
                }`}
              />
            )}

            <span
              className={`relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${estilosDoMarco[state]}`}
            >
              {state === 'concluida' ? <Check size={16} strokeWidth={3} /> : node.position}
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              {/* A data vem antes do título, como numa linha do tempo de verdade. */}
              <p className="mb-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                {node.completedAt ? (
                  <span>Concluída em {formatarData(node.completedAt)}</span>
                ) : state === 'atual' ? (
                  <Badge>Você está aqui</Badge>
                ) : (
                  <span>{lesson.estimatedMinutes} min</span>
                )}
              </p>

              <Link
                to={`/lesson/${lesson.id}`}
                className="group block rounded-lg py-0.5 transition-colors"
              >
                <h3
                  className={`font-semibold group-hover:text-zinc-950 ${
                    state === 'proxima' ? 'text-zinc-500' : 'text-zinc-900'
                  }`}
                >
                  {lesson.title}
                </h3>
                <p className="mt-0.5 text-sm leading-relaxed text-zinc-500">{lesson.objective}</p>
              </Link>

              {temAviso && (
                <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                  <Info size={13} className="mt-0.5 flex-shrink-0 text-amber-600" />
                  <span>
                    Supõe{' '}
                    <strong className="font-semibold">
                      {node.shakyPrerequisites.map((c) => c.title).join(' e ')}
                    </strong>
                    , que você ainda não praticou. Dá para seguir mesmo assim.
                  </span>
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

import { Link } from 'react-router-dom';
import { BookOpen, Check, Info, Star } from 'lucide-react';
import type { PathNode } from '../../lib/path';

/**
 * Caminho de aprendizado em serpentina.
 *
 * O formato — nós grandes deslocados lateralmente, com um balão marcando onde
 * você está — vem das trilhas de apps de idioma, porque resolve bem o problema
 * de mostrar progresso longo sem virar uma lista. A identidade visual é a do
 * CodeFlow: copiar cores e marca de outro produto seria o que o §403 proíbe.
 *
 * Como no resto da plataforma, **nenhuma etapa é bloqueada** (§280). O que
 * existe é aviso quando os pré-requisitos estão fracos.
 *
 * `isolate` no container cria um contexto de empilhamento próprio, então o
 * z-index dos nós não escapa e não passa por cima do cabeçalho fixo — que foi
 * exatamente o bug de sobreposição.
 */

/** Deslocamento lateral de cada nó, em ciclo, para desenhar a curva. */
const DESLOCAMENTOS = [0, 70, 110, 70, 0, -70, -110, -70];

const estilosDoNo: Record<PathNode['state'], string> = {
  concluida: 'bg-emerald-500 text-white shadow-[0_6px_0_0] shadow-emerald-700',
  atual: 'bg-zinc-900 text-white shadow-[0_6px_0_0] shadow-zinc-950',
  proxima: 'bg-zinc-200 text-zinc-400 shadow-[0_6px_0_0] shadow-zinc-300',
};

export function LearningPath({ nodes }: { nodes: PathNode[] }) {
  if (nodes.length === 0) return null;

  return (
    <div className="isolate flex flex-col items-center py-4">
      {nodes.map((node, indice) => {
        const { lesson, state } = node;
        const deslocamento = DESLOCAMENTOS[indice % DESLOCAMENTOS.length];
        const temAviso = node.shakyPrerequisites.length > 0;

        return (
          <div
            key={lesson.id}
            className="flex flex-col items-center"
            style={{ transform: `translateX(${deslocamento}px)` }}
          >
            {/* Balão do passo atual, no lugar de um rótulo solto. */}
            {state === 'atual' && (
              <span className="relative mb-2 rounded-xl border-2 border-zinc-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-zinc-900">
                Começar
                <span
                  aria-hidden
                  className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border-b-2 border-r-2 border-zinc-200 bg-white"
                />
              </span>
            )}

            <Link
              to={`/lesson/${lesson.id}`}
              // O nome da aula não cabe dentro do círculo, então vai para o
              // rótulo acessível — quem usa leitor de tela ouve o destino real.
              aria-label={`${lesson.title}. ${
                state === 'concluida'
                  ? 'Concluída'
                  : state === 'atual'
                    ? 'Etapa atual'
                    : 'Ainda não concluída'
              }${temAviso ? '. Pré-requisitos ainda não praticados.' : ''}`}
              title={lesson.title}
              className={`flex h-[72px] w-[72px] items-center justify-center rounded-full transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-none ${estilosDoNo[state]}`}
            >
              {state === 'concluida' ? (
                <Check size={28} strokeWidth={3.5} />
              ) : state === 'atual' ? (
                <Star size={28} strokeWidth={2.5} fill="currentColor" />
              ) : (
                <BookOpen size={26} strokeWidth={2.5} />
              )}
            </Link>

            {/* O título fica visível: um caminho só de ícones esconde do aluno
                o que ele vai estudar, e obriga a clicar para descobrir. */}
            <p
              className={`mt-2 max-w-[13rem] text-center text-sm font-medium ${
                state === 'proxima' ? 'text-zinc-400' : 'text-zinc-700'
              }`}
            >
              {lesson.title}
            </p>

            {temAviso && (
              <p className="mt-1 flex max-w-[15rem] items-start gap-1 text-center text-xs leading-relaxed text-amber-700">
                <Info size={12} className="mt-0.5 flex-shrink-0" />
                <span>
                  Supõe {node.shakyPrerequisites.map((c) => c.title).join(' e ')}, que você ainda
                  não praticou.
                </span>
              </p>
            )}

            {/* Trilho entre os nós, colorido até onde o aluno chegou. */}
            {indice < nodes.length - 1 && (
              <span
                aria-hidden
                className={`my-3 h-8 w-1.5 rounded-full ${
                  state === 'concluida' ? 'bg-emerald-500' : 'bg-zinc-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

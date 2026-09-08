import { Link } from 'react-router-dom';

import type { PathNode } from '../../lib/path';
import { IconCheck } from '../ui/Icon';

/**
 * A vizinhança da aula atual.
 *
 * O `LearningPath` da tela de trilhas mostra a jornada inteira, e é isso que se
 * quer lá. Aqui a pergunta é outra e mais estreita: **o que vem depois desta**.
 * Uma trilha de dez aulas ocuparia a tela toda e empurraria o resto para baixo
 * da dobra, competindo com a ação principal em vez de apoiá-la.
 *
 * Então a janela é curta: uma aula concluída antes, para dar o senso de vindo-de,
 * a atual, e as próximas. O caminho completo continua a um toque de distância.
 *
 * Não são cards. Cada aula é uma linha sobre um traço vertical contínuo — o
 * traço é o que faz ler como sequência, e não como lista de opções soltas.
 */

const ANTES = 1;
const DEPOIS = 3;

/** Recorta a janela em volta da aula atual, sem sair dos limites da trilha. */
export function janelaDoCaminho(nodes: PathNode[]): PathNode[] {
  const atual = nodes.findIndex((n) => n.state === 'atual');
  if (atual === -1) return nodes.slice(0, ANTES + DEPOIS + 1);

  const inicio = Math.max(0, atual - ANTES);
  return nodes.slice(inicio, inicio + ANTES + DEPOIS + 1);
}

const marca: Record<PathNode['state'], string> = {
  concluida: 'border-success-600 bg-success-600 text-white',
  atual: 'border-brand-600 bg-brand-600 text-white',
  proxima: 'border-line-strong bg-canvas text-ink-faint',
};

export function PathPreview({ nodes, total }: { nodes: PathNode[]; total: number }) {
  const janela = janelaDoCaminho(nodes);
  if (janela.length === 0) return null;

  const ultima = janela[janela.length - 1];
  const restantes = total - ultima.position;

  return (
    <ol className="relative">
      {janela.map((node, i) => {
        const ehAtual = node.state === 'atual';
        const ehUltima = i === janela.length - 1;

        return (
          <li key={node.lesson.id} className="relative flex gap-3.5 pb-1">
            {/* O traço para na última marca, senão apontaria para o vazio. */}
            {!ehUltima && (
              <span
                aria-hidden="true"
                className={`absolute left-[13px] top-7 h-[calc(100%-1rem)] w-0.5 ${
                  node.state === 'concluida' ? 'bg-success-200' : 'bg-line'
                }`}
              />
            )}

            <span
              aria-hidden="true"
              className={`relative z-10 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[11px] font-medium ${
                marca[node.state]
              }`}
            >
              {node.state === 'concluida' ? <IconCheck size={14} /> : node.position}
            </span>

            <Link
              to={`/lesson/${node.lesson.id}`}
              className="min-w-0 flex-1 rounded-md px-2 py-1.5 transition-colors hover:bg-sunken"
            >
              <span
                className={`block truncate text-sm ${
                  ehAtual ? 'font-bold text-ink' : 'font-medium text-ink-soft'
                }`}
              >
                {node.lesson.title}
              </span>

              {/* O estado é dito em palavra, não só em cor: quem não distingue
                  verde de cinza precisa da mesma informação. */}
              <span className="label-mono text-ink-faint">
                {node.state === 'concluida'
                  ? 'Concluída'
                  : ehAtual
                    ? 'Você está aqui'
                    : `${node.lesson.estimatedMinutes} min`}
              </span>
            </Link>
          </li>
        );
      })}

      {restantes > 0 && (
        <li className="flex gap-3.5">
          <span aria-hidden="true" className="ml-[13px] w-0.5" />
          <span className="px-2 text-sm text-ink-faint">
            e mais {restantes} {restantes === 1 ? 'aula' : 'aulas'} na trilha
          </span>
        </li>
      )}
    </ol>
  );
}

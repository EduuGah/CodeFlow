import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { getLessonsOfTrack, listConcepts, listProjects, listTracks } from '../../../content';
import { DIFFICULTY_LABELS, LANGUAGE_LABELS } from '../../../content/types';
import { useStudentData } from '../../contexts/StudentDataContext';
import { buildPath, summarizePath } from '../../lib/path';
import { TrackCard } from '../../components/dashboard/TrackCard';
import { IconArrowRight, IconAward, IconProject } from '../../components/ui/Icon';
import { cardClasses } from '../../components/ui/Card';
import { Carregando, Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/States';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

/**
 * Trilhas e projetos: a visão geral.
 *
 * Responde "o que existe para eu estudar?" numa tela só: um card por trilha
 * — com o progresso, a aula da vez e o caminho para a lista de aulas — e os
 * projetos logo abaixo. A lista de aulas de cada trilha tem página própria
 * (`TrackDetail`), dividida em blocos por assunto.
 *
 * A versão anterior desenrolava as seis trilhas inteiras aqui, uma linha do
 * tempo atrás da outra: setenta marcos numa coluna, sem dizer de que assunto
 * era cada trecho, e os projetos só no fim de toda essa rolagem.
 */
export function Tracks() {
  useDocumentTitle('Trilhas');
  const { loading, completedLessons, completedProjects, mastery, attempts } = useStudentData();

  const conceitos = listConcepts();
  const trilhas = listTracks();
  const projetos = listProjects();

  // `/app/trilhas#projetos` vindo de outra tela: o roteador troca a página sem
  // recarregar, e o navegador só rola para a âncora numa carga de verdade.
  const { hash } = useLocation();
  useEffect(() => {
    if (loading || !hash) return;
    document.querySelector(hash)?.scrollIntoView();
  }, [hash, loading]);

  if (loading) {
    return (
      <Carregando o="as trilhas">
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      </Carregando>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Trilhas</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Cada trilha é uma sequência de aulas em blocos por assunto; os projetos aplicam o que
          elas ensinaram, sem passo a passo.
        </p>
        {/* Um atalho, porque a pergunta "onde estão os projetos?" já foi feita. */}
        <nav aria-label="Seções desta página" className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <a href="#trilhas" className="font-semibold text-brand-600 hover:text-brand-700">
            {trilhas.length} trilhas
          </a>
          <a href="#projetos" className="font-semibold text-brand-600 hover:text-brand-700">
            {projetos.length} projetos
          </a>
        </nav>
      </div>

      <section id="trilhas" aria-labelledby="titulo-trilhas" className="scroll-mt-20">
        <h2 id="titulo-trilhas" className="label-mono mb-3 text-ink-faint">
          Trilhas
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {trilhas.map((trilha) => {
            const caminho = buildPath(
              getLessonsOfTrack(trilha.id),
              completedLessons,
              conceitos,
              mastery,
              attempts
            );
            return (
              <li key={trilha.id}>
                <TrackCard track={trilha} summary={summarizePath(caminho)} />
              </li>
            );
          })}
        </ul>
      </section>

      <section id="projetos" aria-labelledby="titulo-projetos" className="scroll-mt-20 space-y-4">
        <div>
          <h2 id="titulo-projetos" className="label-mono text-ink-faint">
            Projetos práticos
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            Sem passo a passo: você recebe requisitos e critérios de aceitação, e decide como
            resolver.
          </p>
        </div>

        {projetos.length === 0 ? (
          <EmptyState
            icon={<IconProject size={28} />}
            title="Nenhum projeto disponível ainda"
            description="Os projetos aparecem aqui conforme são publicados."
          />
        ) : (
          <ul className="space-y-3">
            {projetos.map((projeto) => {
              const entregue = completedProjects.includes(projeto.id);

              return (
                <li key={projeto.id}>
                  <Link
                    to={`/project/${projeto.id}`}
                    className={cardClasses({
                      className: 'flex items-center gap-4 transition-colors hover:border-line-strong',
                    })}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                        entregue ? 'bg-success-50 text-success-700' : 'bg-sunken text-ink-soft'
                      }`}
                    >
                      {entregue ? <IconAward size={22} /> : <IconProject size={22} />}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-bold text-ink">{projeto.title}</span>
                        <span className="label-mono text-ink-faint">
                          {DIFFICULTY_LABELS[projeto.difficulty]} · {LANGUAGE_LABELS[projeto.language]}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-ink-soft">
                        {entregue
                          ? 'Entregue — todos os critérios atendidos.'
                          : `${projeto.checkpoints.length} critérios de aceitação`}
                      </span>
                    </span>

                    <IconArrowRight size={18} className="shrink-0 text-ink-faint" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

import { Link } from 'react-router-dom';

import { getLessonsOfTrack, listConcepts, listProjects, listTracks } from '../../../content';
import { LANGUAGE_LABELS } from '../../../content/types';
import { useStudentData } from '../../contexts/StudentDataContext';
import { buildPath, summarizePath } from '../../lib/path';
import { LearningPath } from '../../components/dashboard/LearningPath';
import { TrackBanner } from '../../components/dashboard/TrackBanner';
import { IconArrowRight, IconAward, IconProject } from '../../components/ui/Icon';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/States';

/**
 * Trilhas e projetos.
 *
 * Reúne o que antes estava espalhado no painel: a jornada de cada trilha e os
 * projetos práticos. Ficam juntos porque respondem à mesma pergunta — "o que
 * existe para eu estudar?" — enquanto a tela inicial responde "o que eu faço
 * agora".
 */
export function Tracks() {
  const { loading, completedLessons, completedProjects, mastery, attempts } = useStudentData();

  const conceitos = listConcepts();
  const projetos = listProjects();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {listTracks().map((trilha) => {
        const caminho = buildPath(
          getLessonsOfTrack(trilha.id),
          completedLessons,
          conceitos,
          mastery,
          attempts
        );
        const resumo = summarizePath(caminho);

        return (
          <section key={trilha.id} className="space-y-5">
            <TrackBanner track={trilha} summary={resumo} />

            <ProgressBar
              label="Aulas concluídas"
              value={resumo.completed}
              max={resumo.total}
              showCount
            />

            <LearningPath nodes={caminho} />
          </section>
        );
      })}

      <section className="space-y-4">
        <div>
          <h2 className="label-mono text-ink-faint">Projetos práticos</h2>
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
                    className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong"
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
                          {projeto.difficulty} · {LANGUAGE_LABELS[projeto.language]}
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

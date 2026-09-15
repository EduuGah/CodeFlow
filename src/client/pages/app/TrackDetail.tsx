import { Link, Navigate, useParams } from 'react-router-dom';

import { getLessonsOfTrack, getTrack, listConcepts } from '../../../content';
import type { TrackSection } from '../../../content/types';
import { useStudentData } from '../../contexts/StudentDataContext';
import { buildPath, summarizePath, type PathNode } from '../../lib/path';
import { LearningPath } from '../../components/dashboard/LearningPath';
import { TrackBanner } from '../../components/dashboard/TrackBanner';
import { IconArrowLeft } from '../../components/ui/Icon';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Carregando, Skeleton } from '../../components/ui/Skeleton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

/**
 * Uma trilha por inteiro: os blocos e as aulas de cada um.
 *
 * As aulas vêm agrupadas pelas seções da trilha — "HTML e CSS", "DOM e
 * eventos", "UI e UX" —, cada uma com o que ensina e quantas já foram. É o
 * que a linha do tempo sozinha não dizia: em que assunto a pessoa está, e o
 * que vem depois dele. Uma trilha sem seções declaradas é um bloco só.
 *
 * O estado de cada aula (concluída, atual, próxima) continua vindo do
 * caminho inteiro; as seções só o recortam.
 */
export function TrackDetail() {
  const { trackId = '' } = useParams();
  const trilha = getTrack(trackId);
  useDocumentTitle(trilha ? trilha.title : 'Trilha');

  const { loading, completedLessons, mastery, attempts } = useStudentData();

  if (!trilha) return <Navigate to="/app/trilhas" replace />;

  if (loading) {
    return (
      <Carregando o="a trilha">
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </Carregando>
    );
  }

  const caminho = buildPath(
    getLessonsOfTrack(trilha.id),
    completedLessons,
    listConcepts(),
    mastery,
    attempts
  );
  const resumo = summarizePath(caminho);
  const porId = new Map(caminho.map((n) => [n.lesson.id, n]));

  const secoes: TrackSection[] = trilha.sections ?? [
    { title: 'Aulas', description: trilha.description, lessonIds: trilha.lessonIds },
  ];

  return (
    <div className="space-y-8">
      <Link
        to="/app/trilhas"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        <IconArrowLeft size={16} />
        Todas as trilhas
      </Link>

      <div className="space-y-5">
        <TrackBanner track={trilha} summary={resumo} />
        <ProgressBar label="Aulas concluídas" value={resumo.completed} max={resumo.total} showCount />
      </div>

      {/* O sumário dos blocos: em telas com três seções de oito aulas, é o que
          deixa pular direto para o assunto sem rolar. */}
      {secoes.length > 1 && (
        <nav aria-label="Blocos da trilha">
          <ol className="flex flex-wrap gap-2">
            {secoes.map((secao, i) => {
              const nos = secao.lessonIds.map((id) => porId.get(id)).filter((n): n is PathNode => !!n);
              const feitas = nos.filter((n) => n.state === 'concluida').length;
              return (
                <li key={secao.title}>
                  <a
                    href={`#bloco-${i + 1}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-ink hover:border-line-strong"
                  >
                    <span className="text-ink-faint">{i + 1}</span>
                    {secao.title}
                    <span className="label-mono text-ink-faint">
                      {feitas}/{nos.length}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {secoes.map((secao, i) => {
        const nos = secao.lessonIds.map((id) => porId.get(id)).filter((n): n is PathNode => !!n);
        const feitas = nos.filter((n) => n.state === 'concluida').length;
        const aqui = nos.some((n) => n.state === 'atual');

        return (
          <section
            key={secao.title}
            id={`bloco-${i + 1}`}
            aria-labelledby={`titulo-bloco-${i + 1}`}
            className="scroll-mt-20"
          >
            <header className="mb-4 border-b border-line pb-3">
              <p className="label-mono text-ink-faint">
                Bloco {i + 1} de {secoes.length} · {feitas} de {nos.length} concluídas
                {aqui ? ' · você está aqui' : ''}
              </p>
              <h2 id={`titulo-bloco-${i + 1}`} className="mt-1 text-lg font-bold tracking-tight text-ink">
                {secao.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{secao.description}</p>
            </header>

            <LearningPath nodes={nos} />
          </section>
        );
      })}
    </div>
  );
}

import type { Track } from '../../../content/types';
import type { PathSummary } from '../../lib/path';

/**
 * Faixa de seção no topo do caminho.
 *
 * Dá a âncora que um caminho em serpentina não tem sozinho: qual trilha é esta,
 * em que ponto você está e o que a etapa atual pretende ensinar.
 *
 * Sem botão decorativo. O §310 é explícito: clique que não faz nada é pior que
 * a ausência dele — e é fácil colocar um "Guia" aqui só porque o formato pede.
 */
export function TrackBanner({ track, summary }: { track: Track; summary: PathSummary }) {
  const posicao = summary.current
    ? `Etapa ${summary.current.position} de ${summary.total}`
    : `${summary.total} de ${summary.total} concluídas`;

  return (
    <div className="rounded-2xl bg-zinc-900 px-6 py-5 text-white">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">{posicao}</p>

      <h2 className="mt-1 text-xl font-bold tracking-tight">{track.title}</h2>

      <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
        {summary.current
          ? summary.current.lesson.objective
          : 'Você concluiu todas as aulas desta trilha.'}
      </p>
    </div>
  );
}

import type { ReactNode } from 'react';

import type { Track } from '../../../content/types';
import { corDaTrilha } from '../../lib/cores-das-trilhas';
import type { PathSummary } from '../../lib/path';
import { EmblemaDaTrilha } from '../ui/Emblema';

/**
 * Faixa de seção no topo do caminho.
 *
 * Dá a âncora que um caminho em serpentina não tem sozinho: qual trilha é esta,
 * em que ponto você está e o que a etapa atual pretende ensinar.
 *
 * Sem botão decorativo. O §310 é explícito: clique que não faz nada é pior que
 * a ausência dele — e é fácil colocar um "Guia" aqui só porque o formato pede.
 */
export function TrackBanner({ track, summary, cena }: { track: Track; summary: PathSummary; cena?: ReactNode }) {
  const posicao = summary.current
    ? `Etapa ${summary.current.position} de ${summary.total}`
    : `${summary.total} de ${summary.total} concluídas`;

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-6 py-5 text-white"
      style={{ background: corDaTrilha(track.id) }}
    >
      {/* O emblema da trilha, grande e apagado, atrás do texto: a figura que
          identifica o assunto sem disputar com a leitura. */}
      <EmblemaDaTrilha
        trackId={track.id}
        semFundo
        size={140}
        className="pointer-events-none absolute right-2 -top-7 opacity-20"
      />
      <div className="relative flex items-center gap-6">
        <div className="min-w-0 flex-1">
          <p className="label-mono text-white/70">{posicao}</p>

          <h1 className="mt-1 text-xl font-bold tracking-tight">{track.title}</h1>

          <p className="mt-1.5 text-sm leading-relaxed text-white/85">
            {summary.current
              ? summary.current.lesson.objective
              : 'Você concluiu todas as aulas desta trilha.'}
          </p>
        </div>
        {/* A cena de abertura da trilha: o assunto acontecendo. De md para
            cima, ao lado; no celular, a faixa é do texto. */}
        {cena && <div className="hidden w-64 shrink-0 md:block">{cena}</div>}
      </div>
    </div>
  );
}

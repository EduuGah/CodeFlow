import { Link } from 'react-router-dom';

import type { Track } from '../../../content/types';
import { LANGUAGE_LABELS } from '../../../content/types';
import type { PathSummary } from '../../lib/path';
import { buttonClasses } from '../ui/Button';
import { Card } from '../ui/Card';
import { IconArrowRight, IconCheck } from '../ui/Icon';
import { ProgressBar } from '../ui/ProgressBar';

/**
 * Uma trilha na visão geral.
 *
 * O que a pessoa precisa decidir aqui é "entro nesta ou não" — e, se já está
 * dentro, "continuo de onde parei". Então o card responde só isso: o que a
 * trilha ensina, quanto já foi, qual é a próxima aula, e dois caminhos: ver
 * a trilha inteira (os blocos e as aulas) ou ir direto para a aula da vez.
 *
 * A lista de aulas não mora aqui. Antes morava, para todas as trilhas ao
 * mesmo tempo, e seis trilhas viravam setenta marcos numa coluna só — a
 * pessoa rolava minutos para achar os projetos no fim.
 */
export function TrackCard({ track, summary }: { track: Track; summary: PathSummary }) {
  const concluida = summary.total > 0 && summary.completed === summary.total;
  const comecou = summary.completed > 0;
  const secoes = track.sections?.length ?? 1;

  return (
    <Card as="article" className="flex h-full flex-col gap-4">
      <div className="min-w-0">
        <p className="label-mono text-ink-faint">
          {LANGUAGE_LABELS[track.language]} · {summary.total} aulas
          {secoes > 1 ? ` em ${secoes} blocos` : ''}
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-ink">
          <Link to={`/app/trilhas/${track.id}`} className="hover:text-brand-700">
            {track.title}
          </Link>
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{track.description}</p>
      </div>

      <ProgressBar label="Concluídas" value={summary.completed} max={summary.total} showCount />

      {/* A aula da vez, nomeada: é o que faz "Continuar" significar algo. */}
      <p className="text-sm leading-relaxed text-ink-soft">
        {concluida ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-success-700">
            <IconCheck size={15} strokeWidth={3} />
            Trilha concluída
          </span>
        ) : summary.current ? (
          <>
            <span className="text-ink-faint">{comecou ? 'Próxima' : 'Começa em'}:</span>{' '}
            <span className="font-semibold text-ink">
              {summary.current.position}. {summary.current.lesson.title}
            </span>
          </>
        ) : null}
      </p>

      <div className="mt-auto flex flex-wrap gap-2">
        {summary.current && !concluida && (
          <Link
            to={`/lesson/${summary.current.lesson.id}`}
            className={buttonClasses({ size: 'sm' })}
          >
            {comecou ? 'Continuar' : 'Começar'}
            <IconArrowRight size={16} />
          </Link>
        )}
        <Link
          to={`/app/trilhas/${track.id}`}
          className={buttonClasses({ variant: 'secondary', size: 'sm' })}
        >
          Ver as aulas
        </Link>
      </div>
    </Card>
  );
}

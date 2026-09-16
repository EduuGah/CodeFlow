import type { EstadoDoDesafio } from '../../lib/desafios';
import { IconCheck, IconCoin } from '../ui/Icon';

/**
 * Os desafios de hoje e da semana, com o progresso.
 *
 * Uma lista curta, sem card por desafio: título, a frase da meta, a barra e a
 * recompensa. O concluído fica verde e diz que já rendeu — não há "resgatar":
 * cumprir é receber, e a moeda já entrou no saldo.
 */
export function ListaDeDesafios({ desafios, compacta = false }: { desafios: EstadoDoDesafio[]; compacta?: boolean }) {
  return (
    <ul className="divide-y divide-line">
      {desafios.map(({ desafio, progresso, concluido, recompensa }) => (
        <li key={desafio.id} className={`flex items-center gap-3 ${compacta ? 'py-2.5' : 'py-3'}`}>
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              concluido ? 'bg-success-600 text-white' : 'border-2 border-line-strong text-ink-faint'
            }`}
            aria-hidden
          >
            {concluido ? <IconCheck size={15} strokeWidth={3} /> : <span className="text-xs font-bold tabular-nums">{progresso}</span>}
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-3">
              <span className={`text-sm font-semibold ${concluido ? 'text-success-700' : 'text-ink'}`}>
                {desafio.title}
              </span>
              <span className="label-mono flex shrink-0 items-center gap-1 tabular-nums text-ink-faint">
                <IconCoin size={12} />
                {recompensa.moedas} · {recompensa.xp} XP
              </span>
            </span>
            {!compacta && (
              <span className="block text-sm leading-relaxed text-ink-soft">{desafio.description}</span>
            )}
            <span
              role="progressbar"
              aria-valuenow={progresso}
              aria-valuemin={0}
              aria-valuemax={desafio.meta}
              aria-label={`${desafio.title}: ${progresso} de ${desafio.meta}`}
              className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-sunken"
            >
              <span
                className={`block h-full rounded-full ${concluido ? 'bg-success-600' : 'bg-brand-600'}`}
                style={{ width: `${Math.round((progresso / desafio.meta) * 100)}%` }}
              />
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

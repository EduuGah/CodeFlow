import type { EstadoDoDesafio } from '../../lib/desafios';
import { IconCheck, IconCoin } from '../ui/Icon';
import { iconeDoDesafio } from './icones';

/**
 * Os desafios de hoje e da semana, com o progresso.
 *
 * Uma lista curta, sem card por desafio: o ícone do que se pede, o título,
 * a frase da meta, a barra e a recompensa. O concluído fica verde e diz que
 * já rendeu — não há "resgatar": cumprir é receber, e a moeda já entrou no
 * saldo.
 */
export function ListaDeDesafios({ desafios, compacta = false }: { desafios: EstadoDoDesafio[]; compacta?: boolean }) {
  return (
    <ul className="divide-y divide-line">
      {desafios.map(({ desafio, progresso, concluido, recompensa }) => {
        const Icone = iconeDoDesafio(desafio.id);
        return (
          <li key={desafio.id} className={`flex items-center gap-3 ${compacta ? 'py-2.5' : 'py-3.5'}`}>
            <span
              className={`flex shrink-0 items-center justify-center rounded-xl ${compacta ? 'h-8 w-8' : 'h-11 w-11'} ${
                concluido ? 'bg-success-600 text-white' : 'bg-brand-50 text-brand-700'
              }`}
              aria-hidden
            >
              {concluido ? <IconCheck size={compacta ? 15 : 20} strokeWidth={3} /> : <Icone size={compacta ? 16 : 22} />}
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
              <span className="mt-1.5 flex items-center gap-2">
                <span
                  role="progressbar"
                  aria-valuenow={progresso}
                  aria-valuemin={0}
                  aria-valuemax={desafio.meta}
                  aria-label={`${desafio.title}: ${progresso} de ${desafio.meta}`}
                  className="block h-1.5 flex-1 overflow-hidden rounded-full bg-sunken"
                >
                  <span
                    className={`block h-full rounded-full ${concluido ? 'bg-success-600' : 'bg-brand-600'}`}
                    style={{ width: `${Math.round((progresso / desafio.meta) * 100)}%` }}
                  />
                </span>
                <span className="label-mono shrink-0 tabular-nums text-ink-faint">
                  {concluido ? 'feito' : `${progresso}/${desafio.meta}`}
                </span>
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

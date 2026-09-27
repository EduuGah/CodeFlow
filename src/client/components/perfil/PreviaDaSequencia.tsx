import { estagioDaPlanta, iconeDaSequencia } from '../../lib/icones-da-sequencia';
import { IconeDaSequencia } from '../ui/IconeDaSequencia';

/**
 * O ícone da sequência como ele aparece no início: o selo com os dias de
 * agora. A planta mostra também os outros dois tamanhos e quando chega em
 * cada um — o que se compra é ela crescendo.
 */

function Selo({ id, dias }: { id: string; dias: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-energy-50 px-2.5 py-1.5 text-sm font-bold text-energy-700">
      <IconeDaSequencia icone={id} dias={dias} size={16} />
      {dias} {dias === 1 ? 'dia' : 'dias'}
    </span>
  );
}

const ESTAGIOS = [
  { dias: 1, rotulo: 'broto' },
  { dias: 7, rotulo: 'muda, aos 7 dias' },
  { dias: 30, rotulo: 'árvore, aos 30' },
] as const;

export function PreviaDaSequencia({ id, dias }: { id: string; dias: number }) {
  const planta = iconeDaSequencia(id).id === 'planta';
  return (
    <div className="mt-2 space-y-2">
      <Selo id={id} dias={Math.max(dias, 1)} />
      {planta && (
        <ul className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Como a planta cresce">
          {ESTAGIOS.map((e) => (
            <li
              key={e.dias}
              className={`flex items-center gap-1.5 text-xs ${estagioDaPlanta(dias) === estagioDaPlanta(e.dias) ? 'font-semibold text-ink' : 'text-ink-soft'}`}
            >
              <span className="text-energy-700">
                <IconeDaSequencia icone="planta" dias={e.dias} size={20} />
              </span>
              {e.rotulo}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

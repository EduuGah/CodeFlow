import { itemDaLoja } from '../../lib/economia';
import { adesivosValidos, AdesivoDesenhado } from '../ui/Adesivo';

/**
 * Os adesivos colados no cabeçalho: cada um meio torto, como na tampa de um
 * notebook. A lista diz o nome de cada um a quem usa leitor de tela; sem
 * adesivo, nada aparece.
 */

/** O giro de cada posição — fixo, para o perfil não mudar a cada visita. */
const GIROS = [-6, 5, -3];

export function FileiraDeAdesivos({
  ids,
  size = 36,
  className = '',
}: {
  ids: readonly string[] | null | undefined;
  size?: number;
  className?: string;
}) {
  const adesivos = adesivosValidos(ids);
  if (adesivos.length === 0) return null;

  return (
    <ul aria-label="Adesivos" className={`flex items-center gap-1 ${className}`} data-adesivos>
      {adesivos.map((id, i) => (
        <li key={id}>
          <AdesivoDesenhado id={id} size={size} giro={GIROS[i]} />
          <span className="sr-only">{(itemDaLoja(`adesivo-${id}`)?.title ?? id).replace(/^Adesivo /, '')}</span>
        </li>
      ))}
    </ul>
  );
}

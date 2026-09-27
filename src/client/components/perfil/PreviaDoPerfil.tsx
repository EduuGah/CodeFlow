import { Avatar } from '../ui/Avatar';
import { FundoDesenhado, ehFundo } from '../ui/Fundo';
import { ComMoldura } from '../ui/Moldura';

/**
 * O cabeçalho do perfil em miniatura, para ver um item antes de comprar.
 *
 * Nada aqui grava: a prévia recebe o avatar, a moldura, o fundo e a cor que
 * valeriam se o item fosse equipado, e desenha com eles. A cor não mexe na
 * página — pinta só o botão e o selo de nível daqui, com a amostra dela.
 */
export function PreviaDoPerfil({
  nome,
  nivel,
  avatar,
  fotoDoGoogle,
  moldura,
  fundo,
  cor,
}: {
  nome: string;
  nivel: number;
  avatar: string | null;
  fotoDoGoogle?: string | null;
  moldura: string | null;
  fundo: string | null;
  /** A amostra da cor de destaque, ou `undefined` para a da página. */
  cor?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface" data-previa>
      {ehFundo(fundo) ? (
        <FundoDesenhado id={fundo} className="h-14 w-full" />
      ) : (
        <div className="h-14 bg-sunken" aria-hidden />
      )}
      {/* Num cartão estreito, o botão desce para a linha de baixo em vez de
          espremer o nome até uma letra: o `min-w-24` é o que decide a quebra. */}
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2 px-3 pb-3">
        <span className="-mt-7 rounded-full bg-surface p-1">
          <ComMoldura moldura={moldura} size={52}>
            <Avatar escolhido={avatar} fotoDoGoogle={fotoDoGoogle} nome={nome} size={52} />
          </ComMoldura>
        </span>
        <span className="min-w-24 flex-1 pt-1">
          <span className="block truncate text-sm font-bold text-ink">{nome}</span>
          <span className="label-mono block whitespace-nowrap text-ink-faint">Nível {nivel}</span>
        </span>
        <span
          className="shrink-0 rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-bold text-white"
          style={cor ? { background: cor } : undefined}
          aria-hidden
        >
          Continuar
        </span>
      </div>
    </div>
  );
}

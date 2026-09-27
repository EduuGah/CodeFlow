import type { ItemDaLoja } from '../../lib/economia';
import { ACENTOS } from '../../lib/tema';
import { AVATARES, AvatarDesenhado, avatarPreset } from '../ui/Avatar';
import { FundoDesenhado, ehFundo } from '../ui/Fundo';
import { ComMoldura, ehMoldura } from '../ui/Moldura';
import { VinhetaChamaDeVolta, VinhetaFloco, VinhetaJanela, VinhetaRaioDuplo } from '../ui/Ilustracao';

/**
 * A figura de um item da loja, na cor que ele tem: o floco, o raio, a janela
 * pintada, o avatar — e a moldura num avatar de graça, o fundo como capa.
 */
export function FiguraDoItem({ item }: { item: ItemDaLoja }) {
  if (item.id === 'congelar-sequencia') return <VinhetaFloco size={56} />;
  if (item.id === 'recuperar-sequencia') return <VinhetaChamaDeVolta size={56} />;
  if (item.id === 'dobro-de-xp') return <VinhetaRaioDuplo size={56} />;
  if (item.tipo === 'tema') {
    const acento = ACENTOS.find((a) => a.item === item.id);
    return <VinhetaJanela size={64} acento={acento?.amostra ?? '#1f6660'} escuro={false} />;
  }
  if (item.tipo === 'moldura') {
    const id = item.id.replace('moldura-', '');
    return ehMoldura(id) ? (
      <ComMoldura moldura={id} size={56}>
        <AvatarDesenhado preset={AVATARES[0]} size={56} />
      </ComMoldura>
    ) : null;
  }
  if (item.tipo === 'fundo') {
    const id = item.id.replace('fundo-', '');
    return ehFundo(id) ? <FundoDesenhado id={id} className="h-14 w-24 rounded-lg" /> : null;
  }
  const preset = avatarPreset(item.id.replace('avatar-', ''));
  return preset ? <AvatarDesenhado preset={preset} size={56} /> : null;
}

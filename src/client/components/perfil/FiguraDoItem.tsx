import type { ItemDaLoja } from '../../lib/economia';
import { ACENTOS } from '../../lib/tema';
import { AvatarDesenhado, avatarPreset } from '../ui/Avatar';
import { VinhetaFloco, VinhetaJanela, VinhetaRaioDuplo } from '../ui/Ilustracao';

/** A figura de um item da loja, na cor que ele tem: o floco, o raio, a janela pintada, o avatar. */
export function FiguraDoItem({ item }: { item: ItemDaLoja }) {
  if (item.id === 'congelar-sequencia') return <VinhetaFloco size={56} />;
  if (item.id === 'dobro-de-xp') return <VinhetaRaioDuplo size={56} />;
  if (item.tipo === 'tema') {
    const acento = ACENTOS.find((a) => a.item === item.id);
    return <VinhetaJanela size={64} acento={acento?.amostra ?? '#1f6660'} escuro={false} />;
  }
  const preset = avatarPreset(item.id.replace('avatar-', ''));
  return preset ? <AvatarDesenhado preset={preset} size={56} /> : null;
}

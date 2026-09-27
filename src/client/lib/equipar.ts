import type { ItemDaLoja } from './economia';
import { MAXIMO_DE_ADESIVOS, type MudancasDoPerfil, type Perfil } from './perfil';
import { ACENTOS } from './tema';

/**
 * O que equipar um item muda no perfil — a mesma gravação que o inventário
 * faz, para a loja oferecer "Equipar agora" logo depois da compra e a prévia
 * mostrar o item no lugar certo. Consumível não se equipa: `null`.
 *
 * O adesivo não troca um pelo outro: entra no fim da lista do perfil — e,
 * com ela cheia (ou com ele já lá), não há o que equipar agora: `null`, e a
 * troca é no inventário.
 */
export function mudancaDeEquipar(
  item: ItemDaLoja,
  perfil?: Pick<Perfil, 'adesivos'>
): Partial<MudancasDoPerfil> | null {
  switch (item.tipo) {
    case 'avatar':
      return { avatar: `preset:${item.id.replace(/^avatar-/, '')}` };
    case 'moldura':
      return { moldura: item.id.replace(/^moldura-/, '') };
    case 'fundo':
      return { fundo: item.id.replace(/^fundo-/, '') };
    case 'tema': {
      const acento = ACENTOS.find((a) => a.item === item.id);
      return acento ? { accent: acento.id } : null;
    }
    case 'editor':
      return { temaEditor: item.id.replace(/^editor-/, '') };
    case 'celebracao':
      return { celebracao: item.id.replace(/^celebracao-/, '') };
    case 'sequencia':
      return { iconeSequencia: item.id.replace(/^sequencia-/, '') };
    case 'adesivo': {
      const id = item.id.replace(/^adesivo-/, '');
      const atuais = perfil?.adesivos ?? [];
      if (atuais.includes(id) || atuais.length >= MAXIMO_DE_ADESIVOS) return null;
      return { adesivos: [...atuais, id] };
    }
    case 'consumivel':
      return null;
  }
}

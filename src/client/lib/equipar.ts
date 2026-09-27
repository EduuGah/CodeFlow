import type { ItemDaLoja } from './economia';
import type { MudancasDoPerfil } from './perfil';
import { ACENTOS } from './tema';

/**
 * O que equipar um item muda no perfil — a mesma gravação que o inventário
 * faz, para a loja oferecer "Equipar agora" logo depois da compra e a prévia
 * mostrar o item no lugar certo. Consumível não se equipa: `null`.
 */
export function mudancaDeEquipar(item: ItemDaLoja): Partial<MudancasDoPerfil> | null {
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
    // Adesivo não troca um pelo outro: são até três, escolhidos no inventário.
    case 'adesivo':
    case 'consumivel':
      return null;
  }
}

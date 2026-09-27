import type { Achievement } from './gamification';

/**
 * Cosméticos que não se vendem: cada um abre com uma conquista.
 *
 * O mesmo princípio dos títulos (`titulos.ts`): o que marca um feito não se
 * compra, senão deixaria de marcar. Não estão em `ITENS` nem no catálogo do
 * banco (`store_items`), então `comprar_item` os recusa como "indisponível";
 * a posse é derivada das conquistas, como o resto.
 *
 * Equipar grava o id curto nas colunas `moldura`/`fundo` da 0011, como os
 * da loja — e, como eles, só muda a aparência da própria pessoa.
 */

export interface ItemDeConquista {
  /** O id completo, no padrão dos itens da loja (`moldura-chama`). */
  id: string;
  tipo: 'moldura' | 'fundo';
  /** O id curto, o que o perfil guarda (`chama`). */
  curto: string;
  title: string;
  description: string;
  /** A conquista que abre o item. */
  conquista: string;
}

export const ITENS_DE_CONQUISTA: readonly ItemDeConquista[] = [
  {
    id: 'moldura-chama',
    tipo: 'moldura',
    curto: 'chama',
    title: 'Moldura Chama',
    description: 'Labaredas em volta do avatar: trinta dias seguidos acesos.',
    conquista: 'mes-inteiro',
  },
  {
    id: 'moldura-orbita',
    tipo: 'moldura',
    curto: 'orbita',
    title: 'Moldura Órbita',
    description: 'Três planetas em volta do avatar, para quem fechou a trilha de React.',
    conquista: 'trilha-track-react',
  },
  {
    id: 'fundo-constelacao',
    tipo: 'fundo',
    curto: 'constelacao',
    title: 'Fundo Constelação',
    description: 'Estrelas ligadas em desenho, como os conceitos que você já praticou.',
    conquista: 'vasto',
  },
];

export type PosseDeConquista = { tem: true; origem: 'conquista' } | { tem: false; conquista: Achievement | undefined };

/**
 * A posse de um item de conquista. Uma conquista que sumiu do catálogo deixa
 * o item trancado, em vez de abrir por engano (o teste confere que existem).
 */
export function posseDeConquista(item: ItemDeConquista, conquistas: Achievement[]): PosseDeConquista {
  const conquista = conquistas.find((c) => c.id === item.conquista);
  return conquista?.unlocked ? { tem: true, origem: 'conquista' } : { tem: false, conquista };
}

export function itemDeConquista(tipo: ItemDeConquista['tipo'], curto: string): ItemDeConquista | undefined {
  return ITENS_DE_CONQUISTA.find((i) => i.tipo === tipo && i.curto === curto);
}

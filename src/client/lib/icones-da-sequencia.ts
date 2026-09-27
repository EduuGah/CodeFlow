/**
 * Os ícones da sequência: o que aparece ao lado dos dias seguidos, no início,
 * no perfil e no progresso.
 *
 * Só muda o desenho — a conta da sequência é a mesma (`sequencia.ts`). A
 * chama é de todo mundo. Não há raio: ele já é o "2× XP" do cabeçalho, e os
 * dois lado a lado diriam a mesma coisa. Os desenhos estão em
 * `ui/IconeDaSequencia.tsx`.
 */

export interface IconeDaSequencia {
  /** O id curto, o que o perfil guarda (`foguete`). */
  id: string;
  title: string;
  description: string;
  /** O item da loja que o vende; sem ele, é de todo mundo. */
  item?: string;
}

export const ICONES_DA_SEQUENCIA: readonly IconeDaSequencia[] = [
  { id: 'chama', title: 'Chama', description: 'A de sempre: acesa enquanto você estuda.' },
  { id: 'sol', title: 'Sol', description: 'Um sol que nasce a cada dia estudado.', item: 'sequencia-sol' },
  { id: 'cafe', title: 'Café', description: 'A xícara de todo dia, fumegando.', item: 'sequencia-cafe' },
  { id: 'foguete', title: 'Foguete', description: 'Subindo, um dia de cada vez.', item: 'sequencia-foguete' },
  {
    id: 'planta',
    title: 'Planta que cresce',
    description: 'Broto, muda e árvore: cresce com a sequência, aos 7 e aos 30 dias.',
    item: 'sequencia-planta',
  },
];

export const ICONE_DA_SEQUENCIA_PADRAO = ICONES_DA_SEQUENCIA[0];

export function iconeDaSequencia(id: string | null | undefined): IconeDaSequencia {
  return ICONES_DA_SEQUENCIA.find((i) => i.id === id) ?? ICONE_DA_SEQUENCIA_PADRAO;
}

export type EstagioDaPlanta = 'broto' | 'muda' | 'arvore';

/** A planta cresce com a sequência: os mesmos marcos das moedas (7 e 30 dias). */
export function estagioDaPlanta(dias: number): EstagioDaPlanta {
  if (dias >= 30) return 'arvore';
  if (dias >= 7) return 'muda';
  return 'broto';
}

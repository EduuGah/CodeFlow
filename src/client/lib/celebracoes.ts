/**
 * As celebrações: o que toca na tela quando uma aula ou um projeto fecha.
 *
 * Aqui só o catálogo — o id que o perfil guarda, o nome, o item que vende.
 * Como cada uma se move está em `celebrar.ts`, junto da regra que vale para
 * todas: quem pediu menos movimento ao sistema não recebe nenhuma, nem a
 * comprada. A confirmação da conclusão é o cartão com o texto; a celebração
 * é ênfase.
 *
 * O confete é de todo mundo, e é o que toca sem nada equipado.
 */

export interface Celebracao {
  /** O id curto, o que o perfil guarda (`estrelas`). */
  id: string;
  title: string;
  description: string;
  /** O item da loja que a vende; sem ele, é de todo mundo. */
  item?: string;
}

export const CELEBRACOES: readonly Celebracao[] = [
  { id: 'confete', title: 'Confete', description: 'Papel picado nas cores do CodeFlow — a de sempre.' },
  {
    id: 'estrelas',
    title: 'Estrelas',
    description: 'Estrelas douradas que se abrem no alto e descem devagar.',
    item: 'celebracao-estrelas',
  },
  {
    id: 'bolhas',
    title: 'Bolhas',
    description: 'Bolhas de sabão que sobem da borda da tela, em vez de cair.',
    item: 'celebracao-bolhas',
  },
  {
    id: 'codigo',
    title: 'Chuva de código',
    description: 'Chaves, parênteses e ponto e vírgula caindo do alto.',
    item: 'celebracao-codigo',
  },
  {
    id: 'fogos',
    title: 'Fogos',
    description: 'Três estouros no céu: um de cada lado, e o maior no meio.',
    item: 'celebracao-fogos',
  },
];

export const CELEBRACAO_PADRAO = CELEBRACOES[0];

export function celebracao(id: string | null | undefined): Celebracao {
  return CELEBRACOES.find((c) => c.id === id) ?? CELEBRACAO_PADRAO;
}

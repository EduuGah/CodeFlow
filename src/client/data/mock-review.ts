export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export const mockFlashcards: Flashcard[] = [
  {
    id: 'fc-js-01',
    front: 'O que é uma variável em programação?',
    back: 'Uma variável é como uma "caixa" na memória do computador onde armazenamos dados (como números ou textos) para serem usados ou alterados mais tarde no código.'
  },
  {
    id: 'fc-js-02',
    front: 'Qual a diferença entre "let" e "const" em JavaScript?',
    back: '"let" permite que o valor da variável seja reatribuído no futuro. "const" cria uma constante, ou seja, o valor não pode ser alterado depois de inicializado.'
  },
  {
    id: 'fc-js-03',
    front: 'Se você tentar reatribuir um valor a uma variável declarada com "const", o que acontece?',
    back: 'O JavaScript lançará um erro do tipo TypeError ("Assignment to constant variable"), travando a execução, pois constantes são imutáveis após a atribuição.'
  }
];

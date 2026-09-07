import type { Flashcard } from './types';

export const flashcards: Flashcard[] = [
  {
    id: 'fc-js-01',
    front: 'O que é uma variável em programação?',
    back: 'Um espaço nomeado na memória onde guardamos um valor (número, texto…) para usar ou alterar depois no código.',
    concepts: ['variaveis'],
  },
  {
    id: 'fc-js-02',
    front: 'Qual a diferença entre "let" e "const" em JavaScript?',
    back: '"let" permite reatribuir o valor depois. "const" cria uma constante: o valor não pode ser trocado após a inicialização.',
    concepts: ['variaveis'],
  },
  {
    id: 'fc-js-03',
    front: 'O que acontece ao reatribuir uma variável declarada com "const"?',
    back: 'O JavaScript lança um TypeError ("Assignment to constant variable") e a execução para, porque constantes são imutáveis após a atribuição.',
    concepts: ['variaveis'],
  },
  {
    id: 'fc-js-04',
    front: 'Por que "2" + 3 resulta em "23" e não em 5?',
    back: 'Quando um dos lados do + é uma string, o JavaScript converte o outro em string e junta os dois. Para somar, converta antes com Number().',
    concepts: ['tipos-de-dados', 'operadores'],
  },
];

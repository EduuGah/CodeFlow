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
  {
    id: 'fc-js-05',
    front: 'Qual a diferença entre = e === ?',
    back: '"=" atribui um valor a uma variável. "===" compara dois valores e devolve true ou false, sem converter tipos. Usar "=" dentro de um if é um erro clássico: em vez de comparar, você atribui.',
    concepts: ['operadores', 'condicoes'],
  },
  {
    id: 'fc-js-06',
    front: 'Num if / else if encadeado, o que acontece depois que uma condição é verdadeira?',
    back: 'O bloco dela executa e todos os seguintes são ignorados — nem chegam a ser testados. Por isso a ordem importa: encadeie da faixa mais restritiva para a mais ampla.',
    concepts: ['condicoes'],
  },
  {
    id: 'fc-js-07',
    front: 'O que causa um laço infinito?',
    back: 'Uma condição de parada que nunca se torna falsa — geralmente porque o contador não avança dentro do loop, ou avança na direção errada.',
    concepts: ['loops', 'depuracao'],
  },
  {
    id: 'fc-js-08',
    front: 'Por que declarar o acumulador ANTES do loop, e não dentro?',
    back: 'Declarado dentro, ele é recriado a cada volta e perde o valor acumulado — o resultado final vira apenas a última parcela. Fora do loop, ele sobrevive entre as iterações.',
    concepts: ['loops', 'variaveis'],
  },
  {
    id: 'fc-js-09',
    front: 'Num array de 3 itens, quais índices são válidos?',
    back: '0, 1 e 2. A contagem começa em zero, então o último índice é sempre length - 1. Acessar a posição 3 devolve undefined em silêncio, sem lançar erro.',
    concepts: ['arrays'],
  },
  {
    id: 'fc-js-10',
    front: 'Qual a diferença entre console.log e return dentro de uma função?',
    back: 'console.log mostra algo na tela; return entrega um valor de volta a quem chamou a função. Uma função que só imprime devolve undefined e não pode ter o resultado reaproveitado numa conta.',
    concepts: ['funcoes'],
  },
  {
    id: 'fc-js-11',
    front: 'Por que 0.1 + 0.2 não é exatamente 0.3?',
    back: 'Números decimais são guardados em binário, e frações como 0,1 não têm representação exata — assim como 1/3 não termina em decimal. Em valores monetários, arredonde na exibição (toFixed), lembrando que toFixed devolve texto, não número.',
    concepts: ['tipos-de-dados', 'operadores'],
  },
];

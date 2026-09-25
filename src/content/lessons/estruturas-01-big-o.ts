import type { Lesson } from '../types';

export const lessonEstruturasBigO: Lesson = {
  id: 'lesson-estruturas-1',
  trackId: 'track-estruturas',
  title: 'Big O: Comparar Soluções',
  language: 'javascript',
  objective:
    'Descrever como o tempo de uma solução cresce com o tamanho da entrada, e distinguir O(1), O(n), O(n²) e O(log n) em código real.',
  concepts: ['estruturas-big-o'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Duas funções podem resolver o mesmo problema, devolver a mesma resposta certa, e ainda assim uma ser muito pior que a outra — não porque tem bug, mas porque **cresce mal** conforme a entrada cresce. Big O é a linguagem para falar sobre isso sem cronometrar nada.

## Não é tempo, é crescimento

Big O não mede milissegundos — um computador mais rápido, ou uma entrada pequena, escondem qualquer diferença. O que ele descreve é **como o número de passos cresce** conforme a entrada cresce. Uma função O(n) rodando numa entrada de 10 pode ser mais lenta, no relógio, que uma O(n²) rodando numa entrada de 3 — mas para entradas grandes, a O(n²) sempre perde, e é essa garantia que importa.

## As quatro formas mais comuns

**O(1) — constante.** O número de passos não muda com o tamanho da entrada.

~~~js
function primeiro(lista) {
  return lista[0]; // um passo, sempre — lista de 3 ou de 3 milhões
}
~~~

**O(n) — linear.** Um passo por item da entrada; um loop simples, sem loop dentro dele.

~~~js
function soma(lista) {
  let total = 0;
  for (const item of lista) total += item; // um passo por item
  return total;
}
~~~

**O(n²) — quadrática.** Um loop dentro de outro, ambos sobre (aproximadamente) o mesmo tamanho de entrada — para cada item, percorre todos de novo.

~~~js
function temDuplicado(lista) {
  for (let i = 0; i < lista.length; i++) {
    for (let j = 0; j < lista.length; j++) {
      if (i !== j && lista[i] === lista[j]) return true; // n × n comparações
    }
  }
  return false;
}
~~~

**O(log n) — logarítmica.** Cresce bem mais devagar que O(n): cada passo corta a entrada pela metade, em vez de olhar item por item. A aula de busca binária, mais adiante nesta trilha, é o exemplo central.

## Por que isso importa na prática

\`temDuplicado\` acima funciona — devolve a resposta certa. O problema aparece quando a lista cresce: com 100 itens, são até 10.000 comparações; com 10.000 itens, são até 100 milhões. Uma versão O(n) do mesmo problema, usando um \`Set\` (a aula de Set e Map, mais adiante, mostra como), resolveria com 10.000 passos — dez mil vezes menos. A pergunta que Big O ensina a fazer, antes mesmo de otimizar qualquer coisa, é: **essa solução tem algum loop dentro de outro loop, sobre o tamanho da mesma entrada?** Se tiver, ela é candidata a ficar lenta demais assim que os dados crescerem.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `function contemPar(lista) {       // O(n): um loop só
  return lista.some((n) => n % 2 === 0);
}

function paresIguais(a, b) {      // O(n²): um loop dentro de outro
  for (const x of a) {
    for (const y of b) {
      if (x === y) return true;
    }
  }
  return false;
}`,
      caption: 'A diferença não está em "funciona ou não" — as duas funcionam. Está em quantas comparações cada uma faz conforme a entrada cresce.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-1-o-que-big-o-mede',
        type: 'multiple-choice',
        prompt: 'O que a notação Big O descreve, precisamente?',
        concepts: ['estruturas-big-o'],
        difficulty: 'iniciante',
        tags: ['estruturas-de-dados', 'big-o'],
        options: [
          'Como o número de passos de uma solução cresce conforme o tamanho da entrada cresce — não quantos milissegundos ela leva',
          'Quantos milissegundos uma função leva para rodar num computador específico',
          'Quantas linhas de código a função tem',
          'Se a função tem ou não algum bug',
        ],
        correctIndex: 0,
        explanation:
          'Big O é sobre a forma do crescimento, não sobre tempo de relógio — que varia com o computador, a linguagem, e o tamanho específico da entrada testada. Duas funções corretas podem ter Big O bem diferentes, e a diferença só aparece de verdade quando a entrada cresce.',
        hints: ['Pense em por que a mesma função pode "parecer rápida" num teste pequeno e ficar inutilizável com muitos dados.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-1-classificar-complexidade',
        type: 'multiple-choice',
        prompt: 'Uma função tem um loop `for` percorrendo a lista uma vez, e dentro dele nenhum outro loop. Qual é a complexidade dela?',
        concepts: ['estruturas-big-o'],
        difficulty: 'iniciante',
        tags: ['estruturas-de-dados', 'big-o'],
        options: ['O(n)', 'O(1)', 'O(n²)', 'O(log n)'],
        correctIndex: 0,
        explanation:
          'Um loop simples, sem loop aninhado, faz um número de passos proporcional ao tamanho da entrada — dobrar a entrada dobra o trabalho. Essa é a definição de O(n).',
        hints: ['O(1) não teria loop nenhum sobre a entrada. O(n²) precisaria de um loop dentro de outro.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-1-quadratica-no-codigo',
        type: 'predict-output',
        prompt: 'Quantas vezes a linha dentro dos dois loops roda, para uma lista de tamanho 3?',
        concepts: ['estruturas-big-o'],
        difficulty: 'intermediario',
        tags: ['estruturas-de-dados', 'big-o'],
        code: `let contador = 0;
const lista = ['a', 'b', 'c'];

for (let i = 0; i < lista.length; i++) {
  for (let j = 0; j < lista.length; j++) {
    contador++;
  }
}

console.log(contador);`,
        expectedOutput: '9',
        explanation:
          'Para cada um dos 3 itens do loop externo, o loop interno roda as 3 vezes inteiras — 3 × 3 = 9. É exatamente o padrão n × n que dá nome a O(n²): com 3 itens, 9 passos; com 10 itens, seriam 100.',
        hints: ['O loop de dentro roda inteiro para CADA volta do loop de fora — não uma vez só.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-1-ordenar-por-crescimento',
        type: 'order-steps',
        prompt: 'Coloque as quatro complexidades na ordem de quão RÁPIDO cada uma cresce conforme a entrada aumenta — da que cresce mais devagar para a que cresce mais rápido.',
        concepts: ['estruturas-big-o'],
        difficulty: 'intermediario',
        tags: ['estruturas-de-dados', 'big-o'],
        steps: [
          { id: 'o1', text: 'O(1) — constante: não cresce com a entrada', ordem: 1 },
          { id: 'ologn', text: 'O(log n) — logarítmica: cresce bem devagar, cortando a entrada pela metade a cada passo', ordem: 2 },
          { id: 'on', text: 'O(n) — linear: cresce na mesma proporção da entrada', ordem: 3 },
          { id: 'on2', text: 'O(n²) — quadrática: cresce com o quadrado da entrada', ordem: 4 },
        ],
        explanation:
          'Constante não cresce; logarítmica cresce, mas bem devagar; linear cresce na mesma proporção da entrada; quadrática cresce muito mais rápido que todas as outras, porque compara cada item com todos os outros.',
        hints: ['Pense em qual delas "sente" menos o efeito de dobrar o tamanho da entrada.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-1-tem-duplicado',
        type: 'code',
        prompt: 'Escreva `contarPares(lista)`: devolve quantos números pares existem na lista, percorrendo-a uma única vez (O(n), sem loop dentro de loop).',
        concepts: ['estruturas-big-o'],
        difficulty: 'iniciante',
        tags: ['estruturas-de-dados', 'big-o'],
        initialCode: `function contarPares(lista) {
  // Seu código aqui — um loop só
}`,
        tests: [
          {
            description: 'Conta os pares corretamente',
            assertion: `const r = contarPares([1, 2, 3, 4, 5, 6]);
if (r !== 3) throw new Error('esperava 3, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Lista sem pares devolve zero',
            assertion: `const r = contarPares([1, 3, 5]);
if (r !== 0) throw new Error('esperava 0, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Lista vazia devolve zero',
            assertion: `const r = contarPares([]);
if (r !== 0) throw new Error('esperava 0 para lista vazia, veio ' + JSON.stringify(r));`,
          },
        ],
        solution: `function contarPares(lista) {
  let total = 0;
  for (const n of lista) {
    if (n % 2 === 0) total++;
  }
  return total;
}`,
        hints: [
          'Um único `for` (ou `for...of`) sobre a lista, verificando `n % 2 === 0` a cada volta, já resolve — sem precisar de um segundo loop.',
          '`lista.filter((n) => n % 2 === 0).length` também é O(n) e resolve em uma linha.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Big O descreve como o número de passos cresce com o tamanho da entrada — não quanto tempo de relógio algo leva. O(1) não cresce; O(n) cresce na mesma proporção (um loop); O(n²) cresce com o quadrado (loop dentro de loop, sobre a mesma entrada); O(log n) cresce bem devagar, cortando a entrada pela metade a cada passo.

Nas próximas aulas, esse vocabulário volta para descrever recursão, pilha, fila, busca binária, Set e Map — e explicar por que cada uma escala do jeito que escala.
`.trim(),
    },
  ],
};

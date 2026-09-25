import type { Lesson } from '../types';

export const lessonEstruturasBuscaBinariaSetEMap: Lesson = {
  id: 'lesson-estruturas-4',
  trackId: 'track-estruturas',
  title: 'Busca Binária, Set e Map',
  language: 'javascript',
  objective:
    'Implementar busca binária num array ordenado, e escolher entre array, Set e Map pela forma de acesso que cada problema pede.',
  concepts: ['estruturas-busca-e-mapas'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Esta última aula junta o vocabulário da trilha inteira num exemplo concreto de O(log n), e duas estruturas que resolvem, em O(1), um problema que um array resolve em O(n).

## Busca binária: cortar pela metade

Procurar um valor num array **ordenado** não precisa olhar item por item. Busca binária olha o **meio**: se o valor procurado é maior, o alvo só pode estar na metade de cima; se é menor, só pode estar na de baixo. Cada comparação descarta metade do que sobrava — é exatamente esse corte pela metade, repetido, que dá O(log n).

~~~js
function buscaBinaria(lista, alvo) {
  let inicio = 0;
  let fim = lista.length - 1;

  while (inicio <= fim) {
    const meio = Math.floor((inicio + fim) / 2);
    if (lista[meio] === alvo) return meio;
    if (lista[meio] < alvo) inicio = meio + 1;   // alvo está na metade de cima
    else fim = meio - 1;                          // alvo está na metade de baixo
  }
  return -1; // não encontrado
}
~~~

Numa lista de 1 milhão de itens ordenados, uma busca linear (O(n)) pode precisar de até 1 milhão de comparações; busca binária (O(log n)) resolve em **20** — o número de vezes que dá para cortar 1 milhão pela metade até sobrar 1. O preço é o requisito: só funciona em array **já ordenado**. Ordenar primeiro para poder fazer uma única busca binária não compensa; ordenar uma vez e fazer muitas buscas nesse mesmo array, sim.

## Set: valores únicos, busca rápida

Um \`Set\` guarda valores sem repetição e sem posição — não existe "o item do meio de um Set". A vantagem central é a velocidade de checar se um valor existe: \`array.includes(x)\` é O(n), porque no pior caso percorre o array inteiro; \`set.has(x)\` é O(1) na prática, não importa quantos itens o Set tenha.

~~~js
const vistos = new Set();
vistos.add('a');
vistos.add('b');
vistos.has('a'); // true — O(1), não percorre nada
vistos.add('a'); // sem efeito: 'a' já está lá, Set não duplica
~~~

## Map: pares chave-valor, sem as limitações de um objeto

Um objeto comum já guarda pares chave-valor — mas só aceita chave do tipo string (ou symbol), e não garante ordem de iteração. Um \`Map\` aceita **qualquer tipo** como chave (um objeto, uma função, um número sem virar texto), mantém a ordem de inserção, e tem \`.size\` pronto — sem precisar de \`Object.keys(obj).length\`.

~~~js
const contagem = new Map();
contagem.set('maçã', 3);
contagem.set('pera', 1);
contagem.get('maçã'); // 3
contagem.size;        // 2
~~~
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// O(n): percorre o array inteiro no pior caso.
function temNoArray(lista, alvo) {
  return lista.includes(alvo);
}

// O(1) na prática: Set não precisa percorrer nada para checar.
function temNoSet(set, alvo) {
  return set.has(alvo);
}

const numeros = [1, 2, 3, 4, 5];
const numerosSet = new Set(numeros);
temNoArray(numeros, 5);   // true — comparou até achar
temNoSet(numerosSet, 5);  // true — sem comparar item por item`,
      caption: 'Mesma pergunta, "esse valor está aqui?" — um array responde comparando; um Set responde direto.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-4-requisito-da-busca-binaria',
        type: 'multiple-choice',
        prompt: 'Qual é o requisito para usar busca binária num array?',
        concepts: ['estruturas-busca-e-mapas'],
        difficulty: 'iniciante',
        tags: ['estruturas-de-dados', 'busca-binaria'],
        options: [
          'O array precisa estar ordenado',
          'O array precisa ter menos de 100 itens',
          'Os valores precisam ser todos números',
          'Não há requisito — funciona em qualquer array',
        ],
        correctIndex: 0,
        explanation:
          'Busca binária decide de que lado do meio continuar procurando comparando o alvo com o item do meio — uma decisão que só faz sentido se o array estiver ordenado. Num array desordenado, o alvo pode estar em qualquer posição, e cortar metade descartaria uma região que ainda poderia contê-lo.',
        hints: ['Pense em como a busca binária decide "o alvo está na metade de cima ou na de baixo" — essa decisão depende de quê?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-4-set-vs-array',
        type: 'multiple-choice',
        prompt: 'Por que trocar `lista.includes(x)` por `set.has(x)` (com os mesmos valores num Set) melhora a complexidade de checar se um valor existe?',
        concepts: ['estruturas-busca-e-mapas'],
        difficulty: 'intermediario',
        tags: ['estruturas-de-dados', 'set'],
        options: [
          '`includes` pode precisar comparar com cada item do array (O(n)); `has` de um Set resolve em O(1) na prática, sem percorrer nada',
          'Não há diferença real de desempenho entre os dois',
          '`Set` ordena os valores automaticamente, o que acelera a busca',
          '`includes` só funciona com números, `has` funciona com qualquer tipo',
        ],
        correctIndex: 0,
        explanation:
          'Um array não tem estrutura interna que ajude a localizar um valor — no pior caso, `includes` compara com todos os itens. Um `Set` é construído para responder "isso existe?" sem essa varredura, o que o torna a escolha certa quando esse tipo de checagem acontece muitas vezes (por exemplo, dentro de um loop).',
        hints: ['Pense em quantas comparações `includes` pode precisar fazer no pior caso — quando o valor procurado é o último, ou não existe.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-4-previsao-busca-binaria',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['estruturas-busca-e-mapas'],
        difficulty: 'intermediario',
        tags: ['estruturas-de-dados', 'busca-binaria'],
        code: `function buscaBinaria(lista, alvo) {
  let inicio = 0;
  let fim = lista.length - 1;
  while (inicio <= fim) {
    const meio = Math.floor((inicio + fim) / 2);
    if (lista[meio] === alvo) return meio;
    if (lista[meio] < alvo) inicio = meio + 1;
    else fim = meio - 1;
  }
  return -1;
}

console.log(buscaBinaria([10, 20, 30, 40, 50], 40));
console.log(buscaBinaria([10, 20, 30, 40, 50], 25));`,
        expectedOutput: '3\n-1',
        explanation:
          '40 está no índice 3 do array, e a busca binária o encontra cortando pela metade até chegar lá. 25 não existe no array — a busca termina quando `inicio` ultrapassa `fim`, sem nunca ter encontrado o valor, e devolve -1.',
        hints: ['Para o segundo `console.log`, pense no que acontece quando o valor procurado não está em nenhuma posição do array.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-4-quando-usar-map',
        type: 'order-steps',
        prompt: 'Coloque na ordem certa o raciocínio para decidir entre objeto comum e Map para guardar pares chave-valor.',
        concepts: ['estruturas-busca-e-mapas'],
        difficulty: 'intermediario',
        tags: ['estruturas-de-dados', 'map'],
        steps: [
          { id: 'chave', text: 'Perguntar: a chave precisa ser algo além de string ou symbol — um objeto, um número puro?', ordem: 1 },
          { id: 'ordem', text: 'Se não, perguntar: a ordem de inserção precisa ser garantida ao iterar?', ordem: 2 },
          { id: 'objeto', text: 'Se nenhuma das duas importa, um objeto comum resolve, e é a opção mais familiar', ordem: 3 },
          { id: 'map', text: 'Se alguma das duas importar, Map é a escolha — ele cobre os dois casos que o objeto não cobre bem', ordem: 4 },
        ],
        explanation:
          'A decisão entre objeto e Map não é estética — depende de dois limites concretos do objeto: chave restrita a string/symbol, e ordem de iteração não garantida pela linguagem. Quando nenhum dos dois importa para o problema, o objeto comum continua sendo a opção mais simples.',
        hints: ['A pergunta central é sempre sobre o que um objeto comum NÃO consegue fazer — é aí que o Map se justifica.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-4-contar-com-map',
        type: 'code',
        prompt: 'Escreva `contarOcorrencias(lista)`: devolve um `Map` de cada valor da lista para quantas vezes ele aparece.',
        concepts: ['estruturas-busca-e-mapas'],
        difficulty: 'intermediario',
        tags: ['estruturas-de-dados', 'map'],
        initialCode: `function contarOcorrencias(lista) {
  // Seu código aqui — devolva um Map
}`,
        tests: [
          {
            description: 'Conta as ocorrências de cada valor',
            assertion: `const r = contarOcorrencias(['a', 'b', 'a', 'c', 'b', 'a']);
if (!(r instanceof Map)) throw new Error('deveria devolver um Map, veio ' + typeof r);
if (r.get('a') !== 3) throw new Error('esperava 3 ocorrências de "a", veio ' + r.get('a'));
if (r.get('b') !== 2) throw new Error('esperava 2 ocorrências de "b", veio ' + r.get('b'));
if (r.get('c') !== 1) throw new Error('esperava 1 ocorrência de "c", veio ' + r.get('c'));`,
          },
          {
            description: 'Lista vazia devolve um Map vazio',
            assertion: `const r = contarOcorrencias([]);
if (!(r instanceof Map)) throw new Error('deveria devolver um Map');
if (r.size !== 0) throw new Error('esperava Map vazio, tem tamanho ' + r.size);`,
          },
        ],
        solution: `function contarOcorrencias(lista) {
  const contagem = new Map();
  for (const item of lista) {
    contagem.set(item, (contagem.get(item) ?? 0) + 1);
  }
  return contagem;
}`,
        hints: [
          'Crie um `new Map()`, percorra a lista, e para cada item use `map.get(item)` para saber a contagem atual.',
          '`contagem.get(item) ?? 0` dá zero para um item que ainda não apareceu — assim dá para somar 1 sem checar antes se ele já existe no Map.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Busca binária corta um array **ordenado** pela metade a cada passo — O(log n), contra O(n) de olhar item por item. Set responde "isso existe?" em O(1), contra o O(n) de \`includes\` num array. Map aceita qualquer tipo de chave e garante ordem de inserção, onde um objeto comum não garante nenhum dos dois.

Com isso fecha a trilha de Estruturas de Dados e Big O: o vocabulário para não só resolver um problema, mas saber dizer, com uma palavra, o quanto a solução escala.
`.trim(),
    },
  ],
};

import type { Lesson } from '../types';

export const lessonArrays: Lesson = {
  id: 'lesson-js-6',
  trackId: 'track-js-fundamentos',
  title: 'Arrays: Uma Variável, Vários Valores',
  language: 'javascript',
  objective: 'Guardar uma lista de valores e percorrê-la para calcular um resultado.',
  concepts: ['arrays', 'loops'],
  status: 'published',
  estimatedMinutes: 18,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Uma variável guarda um valor. Quando você precisa de vários — as notas de uma turma, os itens de um carrinho —, criar \`nota1\`, \`nota2\`, \`nota3\` não escala: e se forem trinta?

Um **array** guarda muitos valores sob um nome só, em ordem.

~~~javascript
const notas = [7, 5, 9];

notas.length;   // 3   — quantos itens
notas[0];       // 7   — o primeiro
notas[2];       // 9   — o último
notas[3];       // undefined — não existe, e não dá erro
~~~

## Índices começam em zero

Esta é a fonte do erro de um a mais, e vale internalizar de vez: o primeiro item está na posição **0**, e o último em \`length - 1\`.

~~~javascript
const cores = ['azul', 'verde', 'rosa'];
//   posição:     0        1        2      length é 3
~~~

Por isso o loop que percorre uma lista usa \`<\` e não \`<=\`:

~~~javascript
for (let i = 0; i < cores.length; i++) { ... }   // certo
for (let i = 0; i <= cores.length; i++) { ... }  // uma volta a mais
~~~

A volta extra acessa uma posição que não existe. E o JavaScript **não avisa** — devolve \`undefined\`, que só vira erro mais adiante, longe da causa.

## Acrescentar, remover, procurar

~~~javascript
const lista = ['a'];

lista.push('b');        // acrescenta no fim   -> ['a', 'b']
lista.pop();            // remove do fim       -> ['a']
lista.unshift('z');     // acrescenta no começo -> ['z', 'a']

lista.includes('a');    // true  — está lá?
lista.indexOf('a');     // 1     — em qual posição? (-1 se não achar)
~~~

Repare que \`indexOf\` devolve \`-1\` quando não encontra, e não \`undefined\`. Como \`-1\` é um número válido, esquecer de checar produz um bug silencioso: \`lista[-1]\` devolve \`undefined\` em vez de reclamar.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `const notas = [8, 6, 10];

console.log(notas[0]);        // 8   — primeiro
console.log(notas.length);    // 3   — quantidade
console.log(notas[notas.length - 1]); // 10  — último
console.log(notas[3]);        // undefined — passou do fim

// Percorrendo com o índice:
for (let i = 0; i < notas.length; i++) {
  console.log("posição", i, "vale", notas[i]);
}`,
      caption:
        'Repare na condição do loop: i < notas.length, nunca <=. Com <= você acessa uma posição que não existe.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-6-indice',
        type: 'predict-output',
        prompt: 'O que este código imprime?',
        concepts: ['arrays'],
        difficulty: 'iniciante',
        tags: ['javascript', 'arrays', 'indice'],
        code: `const cores = ["azul", "verde", "vermelho"];
console.log(cores[1]);
console.log(cores[3]);`,
        expectedOutput: 'verde\nundefined',
        explanation:
          'O índice 1 é o **segundo** item, porque a contagem começa em zero. E o índice 3 não existe num array de três itens (válidos: 0, 1 e 2), então o JavaScript devolve `undefined` em silêncio, sem lançar erro.',
        hints: [
          'A contagem dos índices começa em zero.',
          'Quantos itens tem o array? Qual é o maior índice válido?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-6-lacuna-ultimo',
        type: 'fill-blank',
        prompt: 'Complete para a função devolver o **último** item de qualquer lista.',
        concepts: ['arrays'],
        difficulty: 'iniciante',
        tags: ['javascript', 'arrays'],
        template: `function ultimo(lista) {
  return lista[lista.length {{1}}];
}`,
        blanks: [{ placeholder: 'ajuste', size: 4 }],
        tests: [
          {
            description: "ultimo(['a', 'b', 'c']) devolve 'c'",
            assertion: `const r = ultimo(['a','b','c']); if (r !== 'c') throw new Error("Esperava 'c', veio " + JSON.stringify(r) + ". Se veio undefined, o índice passou do fim.");`,
          },
          {
            description: 'funciona com um item só',
            assertion: `const r = ultimo([42]); if (r !== 42) throw new Error("Esperava 42, veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'lista vazia devolve undefined, sem quebrar',
            assertion: `const r = ultimo([]); if (r !== undefined) throw new Error("Numa lista vazia esperava undefined, veio " + JSON.stringify(r) + ".");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'devolve sempre o item da última posição',
            generate: `
              const n = Math.floor(rnd() * 10);
              const lista = [];
              for (let i = 0; i < n; i++) lista.push(Math.floor(rnd() * 100));
              return { lista };
            `,
            check: `
              const esperado = caso.lista.length === 0 ? undefined : caso.lista[caso.lista.length - 1];
              const obtido = ultimo(caso.lista);
              if (obtido !== esperado) {
                throw new Error("com " + JSON.stringify(caso.lista) + " esperava " + JSON.stringify(esperado) + ", veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        explanation:
          'Como o primeiro item está na posição 0, o último está em `length - 1`. Usar `length` direto aponta para uma posição que não existe — e o JavaScript devolve `undefined` em silêncio, em vez de reclamar.',
        hints: [
          'Numa lista de 3 itens, `length` é 3. Em que posição está o último?',
          'A resposta é uma subtração.',
        ],
        solution: ['- 1'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-6-prever-indexof',
        type: 'predict-output',
        prompt: 'O que este programa imprime? Repare no que `indexOf` devolve quando não encontra.',
        concepts: ['arrays', 'casos-extremos'],
        difficulty: 'intermediario',
        tags: ['javascript', 'arrays'],
        code: `const cores = ['azul', 'verde'];

console.log(cores.indexOf('verde'));
console.log(cores.indexOf('rosa'));
console.log(cores[cores.indexOf('rosa')]);`,
        expectedOutput: '1\n-1\nundefined',
        explanation:
          '`indexOf` devolve `-1` quando não encontra, e `-1` é um número válido. Usá-lo como índice sem checar dá `undefined` em vez de erro — o bug aparece bem depois, longe da causa. Por isso a checagem certa é `if (posicao !== -1)`, ou usar `includes` quando você só quer saber se está lá.',
        hints: [
          'O que `indexOf` devolve quando o item não existe? Não é `undefined`.',
          'Qual item está na posição -1 de uma lista?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-6-maior',
        type: 'code',
        prompt: `Crie a função \`maiorNota(notas)\` que recebe um array de números e **retorna** o maior deles.\n\nNão use \`Math.max\` — a ideia é praticar a comparação item a item.`,
        concepts: ['arrays', 'loops', 'condicoes'],
        difficulty: 'iniciante',
        tags: ['javascript', 'arrays', 'loops', 'busca'],
        initialCode: `function maiorNota(notas) {
  // Percorra o array comparando cada item com o maior encontrado até agora
}

console.log(maiorNota([7, 9, 4])); // esperado: 9
`,
        hints: [
          'Guarde numa variável o maior valor encontrado até o momento e vá atualizando.',
          'Comece essa variável com o PRIMEIRO item do array, não com zero — senão notas negativas quebram o resultado.',
          'Dentro do loop: se o item atual for maior que o guardado, troque o guardado por ele.',
          'let maior = notas[0]; for (let i = 1; i < notas.length; i++) { if (notas[i] > maior) maior = notas[i]; } return maior;',
        ],
        tests: [
          {
            description: 'A função maiorNota existe',
            assertion: `if (typeof maiorNota !== 'function') throw new Error("Crie uma função chamada 'maiorNota'.");`,
          },
          {
            description: 'Encontra o maior no meio da lista',
            assertion: `if (maiorNota([7, 9, 4]) !== 9) throw new Error("maiorNota([7, 9, 4]) deveria devolver 9, mas devolveu " + maiorNota([7, 9, 4]) + ".");`,
          },
          {
            description: 'Funciona quando o maior é o último',
            assertion: `if (maiorNota([1, 2, 3]) !== 3) throw new Error("maiorNota([1, 2, 3]) deveria devolver 3, mas devolveu " + maiorNota([1, 2, 3]) + ". Verifique se o loop chega até o fim do array.");`,
          },
          {
            description: 'Funciona com um único item',
            assertion: `if (maiorNota([5]) !== 5) throw new Error("maiorNota([5]) deveria devolver 5, mas devolveu " + maiorNota([5]) + ".");`,
            hidden: true,
          },
          {
            description: 'Funciona com números negativos',
            assertion: `if (maiorNota([-10, -3, -7]) !== -3) throw new Error("maiorNota([-10, -3, -7]) deveria devolver -3, mas devolveu " + maiorNota([-10, -3, -7]) + ". Se você começou a comparação em 0, negativos quebram o resultado.");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'o resultado está na lista e nenhum item é maior que ele',
            generate: `
              const n = Math.floor(rnd() * 12) + 1;
              const notas = [];
              for (let i = 0; i < n; i++) notas.push(Math.round(rnd() * 100) / 10);
              return { notas };
            `,
            check: `
              const r = maiorNota(caso.notas);
              if (!caso.notas.includes(r)) {
                throw new Error("maiorNota devolveu " + r + ", que não está na lista " + JSON.stringify(caso.notas) + ".");
              }
              for (const nota of caso.notas) {
                if (nota > r) {
                  throw new Error("maiorNota devolveu " + r + ", mas " + nota + " é maior e também está na lista.");
                }
              }
            `,
          },
        ],
        solution: `function maiorNota(notas) {
  let maior = notas[0];
  for (let i = 1; i < notas.length; i++) {
    if (notas[i] > maior) {
      maior = notas[i];
    }
  }
  return maior;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Índices começam em **zero**, então o último é \`length - 1\` e a condição do loop é \`i < length\`. Ao procurar o maior valor, comece pelo primeiro item da lista — nunca por zero.`,
    },
  ],
};

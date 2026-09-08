import type { Lesson } from '../types';

export const lessonEscopo: Lesson = {
  id: 'lesson-js-11',
  trackId: 'track-js-fundamentos',
  title: 'Escopo: Onde Cada Nome Existe',
  language: 'javascript',
  objective:
    'Prever onde uma variável existe e onde ela some, e usar isso para explicar erros que parecem mágica.',
  concepts: ['escopo', 'variaveis', 'funcoes'],
  status: 'published',
  estimatedMinutes: 16,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Toda variável tem um **território** onde ela existe. Fora dele, o nome simplesmente não está lá — e o JavaScript reclama com \`ReferenceError\`.

A regra é mais simples do que parece: **as chaves \`{}\` criam um território**. Uma variável declarada com \`let\` ou \`const\` dentro de um bloco vive só ali dentro.

De dentro para fora você enxerga. De fora para dentro, não.

~~~javascript
const nome = 'Ana';        // território de fora

if (true) {
  const idade = 30;        // território de dentro
  console.log(nome);       // funciona: de dentro se enxerga fora
}

console.log(idade);        // ReferenceError: idade is not defined
~~~

Isso não é uma limitação chata — é o que impede um programa grande de virar um caos onde qualquer trecho mexe em qualquer variável. Território fechado significa que você consegue ler uma função e saber o que ela toca.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Cada função é um território novo
function calcularTotal(precos) {
  let soma = 0;                 // existe só dentro de calcularTotal

  for (const preco of precos) {
    const comImposto = preco * 1.1;   // existe só dentro do for
    soma += comImposto;
  }

  // console.log(comImposto);   // ReferenceError: acabou com o for
  return soma;
}

console.log(calcularTotal([10, 20]));  // 33.000000000000004
// console.log(soma);           // ReferenceError: acabou com a função`,
      caption:
        '`soma` precisa nascer FORA do loop: se nascesse dentro, seria uma variável nova a cada volta e o acumulado se perderia.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-11-prever-escopo',
        type: 'predict-output',
        prompt: 'O que este programa imprime? Repare em qual `mensagem` cada `console.log` enxerga.',
        concepts: ['escopo'],
        difficulty: 'iniciante',
        tags: ['javascript', 'escopo'],
        code: `let mensagem = 'fora';

function trocar() {
  let mensagem = 'dentro';
  console.log(mensagem);
}

trocar();
console.log(mensagem);`,
        expectedOutput: 'dentro\nfora',
        explanation:
          'São **duas variáveis diferentes** com o mesmo nome. A de dentro da função não substitui a de fora: ela existe em outro território e some quando a função termina. Por isso o segundo `console.log` ainda vê `fora`.',
        hints: [
          'Existem dois `let mensagem`. Eles criam a mesma variável, ou duas?',
          'A função declara a sua própria `mensagem`. Isso apaga a de fora, ou cria outra?',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## O caso clássico: \`var\` dentro do \`for\`

\`var\` é a forma antiga de declarar, e ela **ignora as chaves**. Uma \`var\` dentro de um \`if\` ou de um \`for\` vaza para a função inteira.

~~~javascript
for (var i = 0; i < 3; i++) { }
console.log(i);   // 3 — a var sobreviveu ao loop

for (let j = 0; j < 3; j++) { }
console.log(j);   // ReferenceError: como deveria ser
~~~

Você vai encontrar \`var\` em código antigo, e precisa reconhecê-la. Mas em código novo, **use \`const\` por padrão e \`let\` quando precisar reatribuir**. \`var\` só traz surpresa.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-11-corrigir-vazamento',
        type: 'fill-blank',
        prompt:
          'Esta função deveria devolver a soma, mas devolve `NaN`. O problema é **onde** o acumulador nasce. Corrija as duas declarações.',
        concepts: ['escopo', 'loops'],
        difficulty: 'iniciante',
        tags: ['javascript', 'escopo'],
        template: `function somar(numeros) {
  {{1}} total = 0;

  for ({{2}} numero of numeros) {
    total += numero;
  }

  return total;
}`,
        blanks: [
          { placeholder: 'declaração', size: 6 },
          { placeholder: 'declaração', size: 6 },
        ],
        tests: [
          {
            description: 'somar([1, 2, 3]) devolve 6',
            assertion: `if (somar([1, 2, 3]) !== 6) throw new Error("somar([1, 2, 3]) deveria devolver 6, mas devolveu " + somar([1, 2, 3]) + ".");`,
          },
          {
            description: 'somar([]) devolve 0, sem quebrar',
            assertion: `if (somar([]) !== 0) throw new Error("Com uma lista vazia o loop não roda, e o total precisa continuar 0. Devolveu " + somar([]) + ".");`,
          },
        ],
        properties: [
          {
            description: 'o resultado é sempre a soma dos itens',
            generate: `
              const n = Math.floor(rnd() * 10);
              const numeros = [];
              for (let i = 0; i < n; i++) numeros.push(Math.floor(rnd() * 100));
              return { numeros };
            `,
            check: `
              const esperado = caso.numeros.reduce((a, b) => a + b, 0);
              const obtido = somar(caso.numeros);
              if (obtido !== esperado) {
                throw new Error("com " + JSON.stringify(caso.numeros) + " esperava " + esperado + ", veio " + obtido + ".");
              }
            `,
          },
        ],
        explanation:
          '`total` precisa nascer **fora** do loop, senão cada volta criaria uma variável nova e o acumulado se perderia. Já `numero` nasce **dentro**, porque muda a cada volta — e `const` funciona aqui justamente por ser um valor novo em cada iteração.',
        hints: [
          'A primeira lacuna declara algo que vai mudar de valor várias vezes.',
          'A segunda declara um nome que recebe um valor novo a cada volta e nunca é reatribuído dentro dela.',
        ],
        solution: ['let', 'const'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-11-contador',
        type: 'code',
        prompt:
          'Crie a função `contarMaioresQue(numeros, limite)`, que devolve **quantos** itens da lista são maiores que o limite.\n\nO objetivo aqui é o escopo: decida com cuidado o que nasce fora do loop e o que nasce dentro.',
        concepts: ['escopo', 'loops', 'funcoes'],
        difficulty: 'iniciante',
        tags: ['javascript', 'escopo'],
        initialCode: `function contarMaioresQue(numeros, limite) {
  // Onde o contador precisa nascer para sobreviver às voltas do loop?
}

console.log(contarMaioresQue([1, 5, 9], 4)); // esperado: 2`,
        hints: [
          'Você precisa de um número que sobreviva a todas as voltas. Ele nasce antes ou dentro do loop?',
          'Dentro do loop, compare cada item com o limite e some 1 quando for maior.',
          'Comece com `let quantidade = 0;` antes do loop e devolva `quantidade` no final.',
        ],
        tests: [
          {
            description: 'A função contarMaioresQue existe',
            assertion: `if (typeof contarMaioresQue !== 'function') throw new Error("Crie uma função chamada 'contarMaioresQue'.");`,
          },
          {
            description: 'contarMaioresQue([1, 5, 9], 4) devolve 2',
            assertion: `if (contarMaioresQue([1, 5, 9], 4) !== 2) throw new Error("Esperava 2 (o 5 e o 9), mas veio " + contarMaioresQue([1, 5, 9], 4) + ".");`,
          },
          {
            description: 'contarMaioresQue([], 0) devolve 0',
            assertion: `if (contarMaioresQue([], 0) !== 0) throw new Error("Com lista vazia o loop não roda, e o contador precisa continuar 0. Veio " + contarMaioresQue([], 0) + ".");`,
            hidden: true,
          },
          {
            description: 'o limite não entra na conta: contarMaioresQue([4], 4) devolve 0',
            assertion: `if (contarMaioresQue([4], 4) !== 0) throw new Error("O enunciado diz MAIOR que o limite, não maior ou igual. Veio " + contarMaioresQue([4], 4) + ".");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'o resultado nunca passa do tamanho da lista, e bate com a contagem real',
            generate: `
              const n = Math.floor(rnd() * 12);
              const numeros = [];
              for (let i = 0; i < n; i++) numeros.push(Math.floor(rnd() * 20) - 5);
              return { numeros, limite: Math.floor(rnd() * 15) - 5 };
            `,
            check: `
              const obtido = contarMaioresQue(caso.numeros, caso.limite);
              const esperado = caso.numeros.filter((x) => x > caso.limite).length;

              if (obtido !== esperado) {
                throw new Error("com " + JSON.stringify(caso.numeros) + " e limite " + caso.limite + " esperava " + esperado + ", veio " + obtido + ".");
              }
            `,
          },
        ],
        solution: `function contarMaioresQue(numeros, limite) {
  let quantidade = 0;

  for (const numero of numeros) {
    if (numero > limite) {
      quantidade += 1;
    }
  }

  return quantidade;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `As chaves \`{}\` criam um território: o que nasce dentro morre ali. De dentro se enxerga fora, nunca o contrário. O que precisa sobreviver ao loop nasce **antes** dele — e essa é a explicação de metade dos acumuladores que devolvem \`NaN\`. Use \`const\` por padrão, \`let\` quando for reatribuir, e reconheça \`var\` sem escrevê-la.`,
    },
  ],
};

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
  estimatedMinutes: 26,
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
      kind: 'prose',
      markdown: `
## O nome existe antes da linha que o declara

Aqui está uma coisa que parece mágica até você saber o motivo:

~~~javascript
console.log(saudar());   // "oi" — antes da declaração!

function saudar() {
  return 'oi';
}
~~~

Antes de rodar qualquer linha, o JavaScript **percorre o território inteiro e anota os nomes que existem nele**. Esse passo se chama *hoisting* — "içar", como se as declarações fossem levantadas para o topo.

Os três tipos de declaração se comportam diferente nesse passo:

| Declaração | Antes da linha |
|---|---|
| \`function\` | já funciona por inteiro |
| \`var\` | o nome existe, valendo \`undefined\` |
| \`let\` e \`const\` | o nome existe, mas **usar dá erro** |

O terceiro caso tem nome: **zona morta temporal**. O nome está reservado, e por isso você não recebe \`is not defined\` — recebe uma mensagem diferente:

~~~javascript
console.log(x);
let x = 1;
// ReferenceError: Cannot access 'x' before initialization
~~~

Essa distinção é útil na prática. \`is not defined\` significa "esse nome não existe em lugar nenhum" — provavelmente erro de digitação. \`Cannot access before initialization\` significa "o nome existe, mas você chegou cedo demais" — provavelmente a ordem das linhas.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-11-prever-hoisting',
        type: 'predict-output',
        prompt:
          'O que este programa imprime? Repare que a função é chamada **antes** de aparecer no código.',
        concepts: ['escopo', 'funcoes'],
        difficulty: 'intermediario',
        tags: ['javascript', 'escopo'],
        code: `console.log(saudar());

function saudar() {
  return 'oi';
}

console.log(contador);
var contador = 10;
console.log(contador);`,
        expectedOutput: 'oi\nundefined\n10',
        explanation:
          'Declarações de função sobem **inteiras**: `saudar` já está pronta antes da primeira linha rodar. Já `var` sobe só o nome, sem o valor — por isso a segunda linha imprime `undefined` em vez de dar erro, e só depois da atribuição o valor aparece. Com `let` ou `const` no lugar do `var`, a segunda linha lançaria `ReferenceError: Cannot access before initialization`, que é um comportamento melhor: erra alto em vez de entregar `undefined` calado.',
        hints: [
          'Antes de rodar, o JavaScript anota os nomes que existem no território. O que ele consegue anotar de uma `function`? E de uma `var`?',
          'A segunda linha dá erro, ou imprime alguma coisa?',
        ],
      },
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
      kind: 'prose',
      markdown: `
## Sombra, e o vizinho que some

Quando um território de dentro declara um nome que já existe fora, o de dentro **cobre** o de fora enquanto durar. Isso se chama sombreamento, e não é erro — é o que faz duas funções poderem usar \`total\` sem uma atrapalhar a outra.

~~~javascript
const usuario = 'Ana';

function saudar() {
  const usuario = 'visitante';   // faz sombra no de fora
  return 'Olá, ' + usuario;      // "Olá, visitante"
}

console.log(saudar());
console.log(usuario);            // "Ana" — intacto
~~~

Vira problema quando é sem querer: você acha que está mexendo na variável de fora e está criando outra. Se a intenção era alterar a de fora, **não declare de novo** — só atribua.

## O oposto: a variável que vaza para todo mundo

Atribuir sem declarar tem um efeito que surpreende:

~~~javascript
function configurar() {
  total = 100;      // sem let, sem const
}
~~~

Em código antigo, isso cria \`total\` no escopo **global** — visível para o programa inteiro, mesmo tendo nascido dentro de uma função. É a fonte clássica de "essa variável mudou sozinha".

A boa notícia é que isso acabou. Dentro de um módulo — que é como todo código moderno roda —, a mesma linha lança \`ReferenceError: total is not defined\`. O comportamento antigo virou erro, e é assim que deveria ter sido desde o começo.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-11-sombra',
        type: 'multiple-choice',
        prompt:
          'Você queria que a função alterasse o `total` de fora, mas ele continua valendo 0 depois da chamada:\n\n```javascript\nlet total = 0;\n\nfunction somar(valor) {\n  let total = total + valor;\n}\n\nsomar(10);\nconsole.log(total); // 0\n```\n\nQual é a correção?',
        concepts: ['escopo', 'variaveis'],
        difficulty: 'intermediario',
        tags: ['javascript', 'escopo'],
        options: [
          'Trocar `let total` por `var total` dentro da função',
          'Remover o `let` de dentro da função, deixando só `total = total + valor`',
          'Declarar `total` como `const` fora da função',
          'Passar `total` como segundo parâmetro da função',
        ],
        correctIndex: 1,
        explanation:
          'O `let` de dentro cria uma variável **nova**, que faz sombra na de fora — por isso a de fora nunca muda. Sem o `let`, a linha vira uma atribuição à variável que já existe no território de cima, que é o que se queria. Trocar por `var` não ajuda: continua sendo uma declaração nova, só que com regras piores. E `const` impediria qualquer alteração.\n\nNa prática, porém, uma função que mexe em variável de fora é difícil de testar e de prever. A quarta opção aponta para o desenho melhor: receber o valor e **retornar** o novo total, em vez de alterar algo de fora.',
        hints: [
          'A função declara um `total` próprio. Ela está alterando o de fora, ou criando outro?',
          'O que acontece se você tirar a palavra `let` da linha de dentro?',
        ],
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
      markdown: `As chaves \`{}\` criam um território: o que nasce dentro morre ali. De dentro se enxerga fora, nunca o contrário. O que precisa sobreviver ao loop nasce **antes** dele — e essa é a explicação de metade dos acumuladores que devolvem \`NaN\`. Antes de rodar, o JavaScript anota os nomes do território: \`function\` sobe inteira, \`var\` sobe valendo \`undefined\`, e \`let\`/\`const\` sobem reservados — daí a mensagem \`Cannot access before initialization\`, que é diferente de \`is not defined\` e aponta para outro tipo de erro. Declarar de novo um nome que já existe fora cria sombra, e não altera o de fora. Use \`const\` por padrão, \`let\` quando for reatribuir, e reconheça \`var\` sem escrevê-la.`,
    },
  ],
};

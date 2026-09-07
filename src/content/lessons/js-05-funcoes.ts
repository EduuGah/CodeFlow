import type { Lesson } from '../types';

export const lessonFuncoes: Lesson = {
  id: 'lesson-js-5',
  trackId: 'track-js-fundamentos',
  title: 'Funções: Nomear um Pedaço de Lógica',
  language: 'javascript',
  objective: 'Escrever funções que recebem dados, devolvem um resultado e podem ser reaproveitadas.',
  concepts: ['funcoes', 'variaveis'],
  status: 'published',
  estimatedMinutes: 16,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Uma **função** é um trecho de lógica com nome. Você a escreve uma vez e usa quantas vezes quiser, com dados diferentes.

Duas partes costumam confundir no começo:

- **parâmetros** — os dados que a função recebe. São variáveis que só existem dentro dela.
- **\`return\`** — o valor que ela devolve para quem a chamou.

\`console.log\` e \`return\` fazem coisas diferentes. O \`console.log\` **mostra** algo na tela; o \`return\` **entrega** um valor de volta ao código. Uma função que só imprime não pode ter o resultado reaproveitado numa conta.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `function dobro(numero) {
  return numero * 2;
}

const resultado = dobro(5) + dobro(10);
console.log(resultado); // 30

// Compare com esta, que imprime mas não devolve nada:
function dobroQueSoImprime(numero) {
  console.log(numero * 2);
}

const nada = dobroQueSoImprime(5); // imprime 10, mas 'nada' fica undefined`,
      caption:
        'Sem return, a função devolve undefined — mesmo que tenha impresso algo no console.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-5-return',
        type: 'predict-output',
        prompt: 'O que este código imprime?',
        concepts: ['funcoes'],
        difficulty: 'iniciante',
        tags: ['javascript', 'funcoes', 'return'],
        code: `function somar(a, b) {
  console.log(a + b);
}

const total = somar(2, 3);
console.log(total);`,
        expectedOutput: '5\nundefined',
        explanation:
          'A função imprime 5 por causa do `console.log` interno. Mas como ela não tem `return`, devolve `undefined` — e é isso que `total` guarda. Imprimir não é devolver.',
        hints: [
          'A função tem console.log, mas não tem return. O que ela entrega de volta?',
          'Serão duas linhas impressas: uma de dentro da função, outra de fora.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-5-media',
        type: 'code',
        prompt: `Crie a função \`media(a, b, c)\` que **retorna** a média aritmética dos três números.\n\nExemplo: \`media(6, 7, 8)\` devolve 7.`,
        concepts: ['funcoes', 'operadores'],
        difficulty: 'iniciante',
        tags: ['javascript', 'funcoes', 'return'],
        initialCode: `function media(a, b, c) {
  // Seu código aqui
}

console.log(media(6, 7, 8)); // esperado: 7
`,
        hints: [
          'Média é a soma dividida pela quantidade de valores.',
          'Some os três primeiro e só depois divida — a ordem das operações importa.',
          'Sem parênteses, a + b + c / 3 divide apenas o c.',
          'return (a + b + c) / 3;',
        ],
        tests: [
          {
            description: 'A função media existe',
            assertion: `if (typeof media !== 'function') throw new Error("Crie uma função chamada 'media'.");`,
          },
          {
            description: 'media(6, 7, 8) devolve 7',
            assertion: `if (media(6, 7, 8) !== 7) throw new Error("media(6, 7, 8) deveria devolver 7, mas devolveu " + media(6, 7, 8) + ". Use return e confira os parênteses da soma.");`,
          },
          {
            description: 'media(10, 10, 10) devolve 10',
            assertion: `if (media(10, 10, 10) !== 10) throw new Error("media(10, 10, 10) deveria devolver 10, mas devolveu " + media(10, 10, 10) + ".");`,
          },
          {
            description: 'Funciona com resultado quebrado',
            assertion: `const r = media(1, 2, 2);
if (Math.abs(r - 1.6666666666666667) > 1e-9) throw new Error("media(1, 2, 2) deveria devolver aproximadamente 1.667, mas devolveu " + r + ". Não arredonde o resultado.");`,
            hidden: true,
          },
        ],
        solution: `function media(a, b, c) {
  return (a + b + c) / 3;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Função recebe por **parâmetros** e devolve por **\`return\`**. Se você só imprime, o valor não volta para quem chamou — e a função não pode ser combinada com outras.`,
    },
  ],
};

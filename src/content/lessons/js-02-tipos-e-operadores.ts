import type { Lesson } from '../types';

export const lessonTiposEOperadores: Lesson = {
  id: 'lesson-js-2',
  trackId: 'track-js-fundamentos',
  title: 'Tipos de Dados e Operadores',
  language: 'javascript',
  objective: 'Distinguir número de texto e prever o resultado de uma operação entre eles.',
  concepts: ['tipos-de-dados', 'operadores'],
  status: 'published',
  estimatedMinutes: 15,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Todo valor em JavaScript tem um **tipo**. Os três que aparecem primeiro são:

- **number** — \`10\`, \`3.5\`, \`-2\`
- **string** — \`"olá"\`, texto entre aspas
- **boolean** — \`true\` ou \`false\`

O tipo importa porque o mesmo operador se comporta de forma diferente conforme o que recebe. O \`+\` soma números, mas **junta** textos.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `console.log(2 + 3);       // 5     — soma\nconsole.log("2" + "3");   // "23"  — junção\nconsole.log("2" + 3);     // "23"  — o número virou texto\nconsole.log(typeof "2");  // "string"`,
      caption: 'Quando um dos lados do + é texto, o outro é convertido em texto.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-2-prever',
        type: 'predict-output',
        prompt: 'Antes de executar: o que este código imprime?',
        concepts: ['tipos-de-dados', 'operadores'],
        difficulty: 'iniciante',
        tags: ['javascript', 'tipos', 'coercao'],
        code: `let a = "10";\nlet b = 5;\nconsole.log(a + b);`,
        expectedOutput: '105',
        explanation:
          'Como `a` é uma string, o `+` junta em vez de somar: "10" seguido de "5" resulta em "105". Para somar de verdade, seria preciso converter `a` com Number(a).',
        hints: [
          'Repare no tipo de cada variável antes de decidir o que o + faz.',
          '`a` está entre aspas. Isso muda o comportamento do operador.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-2-somar',
        type: 'code',
        prompt: `A variável \`precoTexto\` veio de um formulário e chegou como texto. Crie uma variável \`total\` com a **soma numérica** de \`precoTexto\` e \`frete\`.`,
        concepts: ['tipos-de-dados', 'operadores'],
        difficulty: 'iniciante',
        tags: ['javascript', 'tipos', 'conversao'],
        initialCode: `const precoTexto = "40";\nconst frete = 10;\n\n// Crie 'total' com a soma numérica dos dois\n`,
        hints: [
          'Se você somar direto, o + vai juntar os valores em vez de somar.',
          'Existe uma função que converte texto em número.',
          'Number("40") devolve o número 40.',
          'const total = Number(precoTexto) + frete;',
        ],
        tests: [
          {
            description: 'A variável total foi criada',
            assertion: `if (typeof total === 'undefined') throw new Error("A variável 'total' não foi criada.");`,
          },
          {
            description: 'total é um número, não um texto',
            assertion: `if (typeof total !== 'number') throw new Error("'total' ficou como texto. Converta 'precoTexto' antes de somar.");`,
          },
          {
            description: 'total vale 50',
            assertion: `if (total !== 50) throw new Error("Esperado 50, mas 'total' vale " + total + ".");`,
          },
        ],
        solution: `const total = Number(precoTexto) + frete;`,
      },
    },
    {
      kind: 'summary',
      markdown: `O tipo decide o comportamento do operador. Antes de usar \`+\`, pergunte: os dois lados são números? Se um for texto, o resultado é junção, não soma.`,
    },
  ],
};

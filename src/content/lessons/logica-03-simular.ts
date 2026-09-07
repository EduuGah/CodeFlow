import type { Lesson } from '../types';

export const lessonSimular: Lesson = {
  id: 'lesson-logica-3',
  trackId: 'track-logica',
  title: 'Simular na Mão: Rodar o Código na Cabeça',
  language: 'javascript',
  objective: 'Acompanhar a execução linha a linha e prever o estado das variáveis antes de executar.',
  concepts: ['simulacao', 'loops', 'depuracao'],
  status: 'published',
  estimatedMinutes: 22,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Quando um loop devolve o número errado, a tentação é mexer no código até acertar. Isso às vezes funciona — e você aprende nada.

A alternativa é **simular**: percorrer as linhas na ordem em que o computador percorre, anotando o valor de cada variável a cada passo. Uma tabela basta:

| volta | i | total |
|---|---|---|
| antes | — | 0 |
| 1ª | 1 | 1 |
| 2ª | 2 | 3 |
| 3ª | 3 | 6 |

Em três linhas você vê exatamente onde o valor deixou de ser o esperado. Isso é o que um depurador faz, e é uma habilidade que você leva para qualquer linguagem.

A regra prática: **preveja antes de executar**. Escreva o que você acha que vai sair, rode, compare. Quando bate, sua compreensão está correta. Quando não bate, você acabou de encontrar exatamente o ponto onde seu modelo mental está errado — que é a informação mais valiosa que existe.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `let total = 0;
for (let i = 1; i <= 3; i++) {
  total = total + i;
  console.log("volta", i, "| total agora:", total);
}
console.log("final:", total);

// volta 1 | total agora: 1
// volta 2 | total agora: 3
// volta 3 | total agora: 6
// final: 6`,
      caption:
        'Imprimir o estado dentro do loop é a versão executável da tabela. Use enquanto estiver investigando e remova depois.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-3-simular',
        type: 'predict-output',
        prompt:
          'Simule na mão antes de rodar. Anote o valor de `resultado` a cada volta. O que é impresso no final?',
        concepts: ['simulacao', 'loops'],
        difficulty: 'intermediario',
        tags: ['logica', 'simulacao', 'loops'],
        code: `let resultado = 1;
for (let i = 1; i <= 4; i++) {
  resultado = resultado * i;
}
console.log(resultado);`,
        expectedOutput: '24',
        explanation:
          'A cada volta o resultado é multiplicado pelo contador: 1×1 = 1, depois 1×2 = 2, depois 2×3 = 6, depois 6×4 = 24. É o fatorial de 4. Repare que `resultado` começa em **1**, não em 0 — num acumulador de multiplicação, começar em zero zeraria tudo.',
        hints: [
          'Monte a tabela: quatro voltas, e a cada uma anote o novo valor de resultado.',
          'A operação é multiplicação, não soma. Por que o valor inicial é 1?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-3-inverter',
        type: 'code',
        prompt: `Crie \`inverter(texto)\` que **retorna** o texto de trás para frente, usando um loop — sem \`split\`, \`reverse\` ou \`join\`.\n\nSimule na cabeça primeiro: qual índice você lê na primeira volta? E na última?`,
        concepts: ['simulacao', 'loops', 'strings'],
        difficulty: 'intermediario',
        tags: ['logica', 'simulacao', 'strings'],
        initialCode: `function inverter(texto) {
  // Comece de qual índice? Vá até qual? Somando ou subtraindo?
}

console.log(inverter("abc")); // "cba"
`,
        hints: [
          'Você vai montando um texto novo, caractere por caractere.',
          'Crie a variável do resultado ANTES do loop, começando como texto vazio.',
          'O último índice é texto.length - 1. Comece por ele e vá diminuindo até 0.',
          'let saida = ""; for (let i = texto.length - 1; i >= 0; i--) { saida += texto[i]; } return saida;',
        ],
        tests: [
          {
            description: 'A função inverter existe',
            assertion: `if (typeof inverter !== 'function') throw new Error("Crie uma função chamada 'inverter'.");`,
          },
          {
            description: 'Inverte um texto simples',
            assertion: `const r = inverter("abc");
if (r !== "cba") throw new Error("inverter(\\"abc\\") deveria devolver \\"cba\\", mas devolveu " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'Não usa reverse nem split',
            assertion: `const fonte = inverter.toString();
if (/\\.reverse\\s*\\(|\\.split\\s*\\(|\\.join\\s*\\(/.test(fonte)) throw new Error("O objetivo é praticar o loop: resolva sem split, reverse ou join.");`,
          },
          {
            description: 'Texto vazio devolve texto vazio',
            assertion: `const r = inverter("");
if (r !== "") throw new Error("Texto vazio deveria devolver texto vazio, mas devolveu " + JSON.stringify(r) + ". Verifique o valor inicial da variável de saída.");`,
            hidden: true,
          },
          {
            description: 'Funciona com um caractere só',
            assertion: `if (inverter("x") !== "x") throw new Error("Um único caractere invertido é ele mesmo.");`,
            hidden: true,
          },
          {
            description: 'Preserva espaços',
            assertion: `const r = inverter("a b");
if (r !== "b a") throw new Error("inverter(\\"a b\\") deveria devolver \\"b a\\", mas devolveu " + JSON.stringify(r) + ".");`,
            hidden: true,
          },
        ],
        solution: `function inverter(texto) {
  let saida = "";
  for (let i = texto.length - 1; i >= 0; i--) {
    saida += texto[i];
  }
  return saida;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Antes de rodar, **preveja**. Depois compare. Quando a previsão erra, você achou o ponto exato em que seu modelo mental está furado — e corrigir isso vale mais do que acertar o exercício.`,
    },
  ],
};

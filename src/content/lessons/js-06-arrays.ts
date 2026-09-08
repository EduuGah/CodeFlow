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
Uma variável guarda um valor. Um **array** guarda uma lista deles, em ordem.

Cada posição tem um **índice**, e a contagem começa em **zero** — não em um. Essa é a origem de boa parte dos erros de quem está começando: num array de 3 itens, os índices válidos são 0, 1 e 2. Acessar a posição 3 devolve \`undefined\`, não um erro, o que torna o problema silencioso.

Para saber o tamanho, use \`.length\`. Como a contagem começa no zero, o **último índice é sempre \`length - 1\`**.
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

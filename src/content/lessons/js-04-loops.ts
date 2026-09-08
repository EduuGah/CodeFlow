import type { Lesson } from '../types';

export const lessonLoops: Lesson = {
  id: 'lesson-js-4',
  trackId: 'track-js-fundamentos',
  title: 'Repetição: Loops que Terminam',
  language: 'javascript',
  objective: 'Repetir uma instrução muitas vezes e garantir que a repetição termine.',
  concepts: ['loops', 'condicoes'],
  status: 'published',
  estimatedMinutes: 18,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Imagine somar os números de 1 a 100. Escrever cem linhas não é opção. Um **loop** repete o mesmo bloco enquanto uma condição continuar verdadeira.

O \`for\` reúne as três partes da repetição numa linha só:

1. **início** — de onde parte o contador
2. **condição de parada** — enquanto isso for verdade, repete
3. **passo** — como o contador muda a cada volta

A parte que mais causa problema é a segunda. Se a condição nunca ficar falsa, o loop não termina. Aqui na plataforma isso é interrompido em 3 segundos com um aviso — mas em um programa de verdade travaria a página.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `for (let i = 1; i <= 3; i++) {
  console.log("volta", i);
}
// volta 1
// volta 2
// volta 3

// O mesmo com while:
let j = 1;
while (j <= 3) {
  console.log("volta", j);
  j++;    // sem esta linha, j nunca chega a 4 e o loop não termina
}`,
      caption:
        'No while você é responsável por avançar o contador. Esquecer disso é o laço infinito clássico.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-4-voltas',
        type: 'multiple-choice',
        prompt:
          'Quantas vezes este loop imprime algo?\n\n```javascript\nfor (let i = 0; i < 5; i++) {\n  console.log(i);\n}\n```',
        concepts: ['loops'],
        difficulty: 'iniciante',
        tags: ['javascript', 'loops', 'contagem'],
        options: ['4 vezes', '5 vezes', '6 vezes', 'Infinitas vezes'],
        correctIndex: 1,
        explanation:
          'O contador começa em 0 e a condição é `i < 5`, então ele assume 0, 1, 2, 3 e 4 — cinco valores. Com `i <= 5` seriam seis. Começar em zero e usar `<` é a combinação mais comum justamente porque o total bate com o número depois do sinal.',
        hints: [
          'Liste no papel os valores que i assume antes de a condição ficar falsa.',
          'i começa em 0, não em 1. Isso muda a conta.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-4-somar',
        type: 'code',
        prompt: `Crie a função \`somarAte(n)\` que **retorna** a soma de todos os números inteiros de 1 até \`n\`.\n\nExemplo: \`somarAte(4)\` devolve 10, porque 1 + 2 + 3 + 4 = 10.`,
        concepts: ['loops', 'variaveis'],
        difficulty: 'iniciante',
        tags: ['javascript', 'loops', 'acumulador'],
        initialCode: `function somarAte(n) {
  // Dica: você vai precisar de uma variável para acumular o total
}

console.log(somarAte(4)); // esperado: 10
`,
        hints: [
          'Você precisa de uma variável que guarde o total e cresça a cada volta.',
          'Crie o acumulador ANTES do loop, começando em 0. Se criar dentro, ele reinicia toda volta.',
          'Dentro do loop: total = total + i, que também pode ser escrito como total += i.',
          'let total = 0; for (let i = 1; i <= n; i++) { total += i; } return total;',
        ],
        tests: [
          {
            description: 'A função somarAte existe',
            assertion: `if (typeof somarAte !== 'function') throw new Error("Crie uma função chamada 'somarAte'.");`,
          },
          {
            description: 'somarAte(4) devolve 10',
            assertion: `if (somarAte(4) !== 10) throw new Error("somarAte(4) deveria devolver 10, mas devolveu " + somarAte(4) + ". Confira se o acumulador começa em 0 e se o loop inclui o próprio n.");`,
          },
          {
            description: 'somarAte(1) devolve 1',
            assertion: `if (somarAte(1) !== 1) throw new Error("somarAte(1) deveria devolver 1, mas devolveu " + somarAte(1) + ".");`,
          },
          {
            description: 'somarAte(100) devolve 5050',
            assertion: `if (somarAte(100) !== 5050) throw new Error("somarAte(100) deveria devolver 5050, mas devolveu " + somarAte(100) + ".");`,
            hidden: true,
          },
          {
            description: 'somarAte(0) devolve 0, sem travar',
            assertion: `if (somarAte(0) !== 0) throw new Error("somarAte(0) deveria devolver 0. Se o loop não roda nenhuma vez, o acumulador precisa continuar valendo 0.");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'somarAte(n) vale n × (n+1) / 2 para qualquer n',
            generate: `return { n: Math.floor(rnd() * 300) };`,
            check: `
              const esperado = (caso.n * (caso.n + 1)) / 2;
              const obtido = somarAte(caso.n);
              if (obtido !== esperado) {
                throw new Error("somarAte(" + caso.n + ") deveria devolver " + esperado + ", mas devolveu " + obtido + ".");
              }
            `,
          },
        ],
        solution: `function somarAte(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += i;
  }
  return total;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Todo loop precisa de uma condição que **em algum momento fica falsa**. Quando usar um acumulador, declare-o antes do loop — dentro, ele reinicia a cada volta.`,
    },
  ],
};

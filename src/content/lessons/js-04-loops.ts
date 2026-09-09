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

~~~javascript
let total = 0;

for (let i = 1; i <= 100; i++) {
  total = total + i;
}

console.log(total);   // 5050
~~~

O \`for\` reúne as três partes da repetição numa linha só, separadas por ponto e vírgula:

~~~javascript
for (let i = 1 ; i <= 100 ; i++)
//      início   condição   passo
~~~

1. **início** — roda uma vez, antes de tudo. É onde o contador nasce.
2. **condição** — testada **antes de cada volta**. Enquanto for verdadeira, repete.
3. **passo** — roda no fim de cada volta, e é o que faz a condição eventualmente virar falsa.

A ordem importa para prever o resultado. Com \`i = 1\` e condição \`i <= 3\`, a sequência é: testa (1 ≤ 3, verdadeiro), executa o corpo com i=1, passo (i vira 2), testa de novo… até que i vira 4, o teste falha, e o loop termina **sem executar o corpo** naquela última vez.

## O laço que não termina

Se a condição nunca ficar falsa, o programa trava:

~~~javascript
for (let i = 1; i <= 10; i--) {   // i diminui, nunca chega a 10
  console.log(i);
}
~~~

As três causas quase sempre são: o passo vai na direção errada, o passo foi esquecido, ou a condição usa uma variável que o corpo não altera.

Aqui na plataforma um laço infinito é interrompido depois de 3 segundos, e você recebe um aviso em vez de uma aba congelada. Fora daqui, o navegador simplesmente para de responder.
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
        id: 'ex-js-4-prever-sequencia',
        type: 'predict-output',
        prompt:
          'O que este loop imprime? Acompanhe o contador volta a volta, e repare em quando o teste acontece.',
        concepts: ['loops'],
        difficulty: 'iniciante',
        tags: ['javascript', 'loops'],
        code: `for (let i = 0; i < 3; i++) {
  console.log(i);
}

console.log('fim:', 3);`,
        expectedOutput: '0\n1\n2\nfim: 3',
        explanation:
          'O contador começa em 0, e a condição é `i < 3` — então 3 não entra. O corpo roda com 0, 1 e 2, e na quarta verificação o teste falha antes de executar qualquer coisa. Por isso `for (let i = 0; i < n; i++)` roda exatamente `n` vezes.',
        hints: [
          'A condição é testada antes de cada volta, inclusive antes da primeira.',
          'Com `i < 3`, o valor 3 chega a entrar no corpo?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-4-lacuna-percorrer',
        type: 'fill-blank',
        prompt:
          'Complete o loop para percorrer a lista inteira, do primeiro ao último item — sem passar do fim.',
        concepts: ['loops', 'arrays'],
        difficulty: 'iniciante',
        tags: ['javascript', 'loops'],
        template: `function contarItens(lista) {
  let quantos = 0;

  for (let i = {{1}}; i {{2}} lista.length; i++) {
    quantos = quantos + 1;
  }

  return quantos;
}`,
        blanks: [
          { placeholder: 'início', size: 3 },
          { placeholder: 'condição', size: 3 },
        ],
        tests: [
          {
            description: 'conta 3 itens numa lista de 3',
            assertion: `const n = contarItens(['a', 'b', 'c']); if (n !== 3) throw new Error("Esperava 3, veio " + n + ".");`,
          },
          {
            description: 'lista vazia devolve 0',
            assertion: `const n = contarItens([]); if (n !== 0) throw new Error("Esperava 0, veio " + n + ".");`,
          },
          {
            description: 'não passa do fim nem para antes',
            assertion: `
              const n = contarItens([1, 2, 3, 4, 5, 6, 7]);
              if (n === 8) throw new Error("Contou 8 numa lista de 7: a condição está deixando passar do fim.");
              if (n === 6) throw new Error("Contou 6 numa lista de 7: a condição está parando cedo demais.");
              if (n !== 7) throw new Error("Esperava 7, veio " + n + ".");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'a contagem bate com o tamanho da lista',
            generate: `
              const n = Math.floor(rnd() * 15);
              const lista = [];
              for (let i = 0; i < n; i++) lista.push(i);
              return { lista };
            `,
            check: `
              const obtido = contarItens(caso.lista);
              if (obtido !== caso.lista.length) {
                throw new Error("lista de " + caso.lista.length + " itens contou " + obtido + ".");
              }
            `,
          },
        ],
        explanation:
          'Índices começam em **zero**, então o último é `length - 1` — e por isso a condição de parada é `<` e não `<=`. Usar `<=` faria o loop tentar acessar uma posição que não existe, e trocar o início por 1 pularia o primeiro item.',
        hints: [
          'Qual é o índice do primeiro item de uma lista?',
          'Se o último índice é `length - 1`, a condição deve incluir `length` ou parar antes dele?',
        ],
        solution: ['0', '<'],
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

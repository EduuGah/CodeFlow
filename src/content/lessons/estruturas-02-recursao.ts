import type { Lesson } from '../types';

export const lessonEstruturasRecursao: Lesson = {
  id: 'lesson-estruturas-2',
  trackId: 'track-estruturas',
  title: 'Recursão: Uma Função que se Chama',
  language: 'javascript',
  objective:
    'Escrever uma função recursiva com caso base e passo recursivo, e explicar por que uma recursão sem caso base (ou sem encolher o problema) nunca termina.',
  concepts: ['estruturas-recursao'],
  status: 'published',
  estimatedMinutes: 26,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Toda função que você escreveu até aqui chama outras funções. Uma função **recursiva** faz algo a mais: chama **a si mesma**, com um problema um pouco menor a cada vez.

## As duas peças obrigatórias

Uma recursão sempre tem duas partes, e as duas são obrigatórias:

- **Caso base**: a condição mais simples, que a função resolve direto, sem chamar a si mesma de novo. É o freio.
- **Passo recursivo**: a função chama a si mesma com uma versão **menor** do problema, e usa o resultado dessa chamada para montar a resposta do problema atual.

~~~js
function fatorial(n) {
  if (n <= 1) return 1;        // caso base: para de chamar a si mesma
  return n * fatorial(n - 1);  // passo recursivo: problema menor (n - 1)
}

fatorial(4); // 4 * fatorial(3) = 4 * (3 * fatorial(2)) = 4 * (3 * (2 * fatorial(1))) = 4 * 3 * 2 * 1 = 24
~~~

Falte o caso base, ou falte o problema encolher a cada chamada, e a função nunca para de chamar a si mesma — até a memória reservada para chamadas de função se esgotar.

## A pilha de chamadas

Cada chamada de \`fatorial\` não termina antes da próxima começar — ela fica esperando, empilhada, até a chamada de dentro devolver um valor. \`fatorial(4)\` empilha \`fatorial(3)\`, que empilha \`fatorial(2)\`, que empilha \`fatorial(1)\` — e só quando \`fatorial(1)\` devolve \`1\` (o caso base) é que a pilha começa a desempilhar, multiplicando de volta: \`2 * 1\`, depois \`3 * 2\`, depois \`4 * 6\`. Essa pilha tem um limite de tamanho; uma recursão funda demais (por exemplo, \`fatorial(100000)\`) estoura esse limite com um erro do tipo "Maximum call stack size exceeded" — o equivalente, para funções, de um loop que nunca termina.

## Quando vale a pena usar recursão

Recursão brilha quando o próprio problema já é definido em termos de uma versão menor de si mesmo — percorrer uma estrutura aninhada sem profundidade fixa (pastas dentro de pastas, comentários com respostas que têm respostas), por exemplo. Para um percurso simples e plano, um loop resolve igual e sem o risco de estourar a pilha — recursão não é "mais elegante" por padrão, é a ferramenta certa quando a estrutura do problema pede.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `function soma(lista) {
  if (lista.length === 0) return 0;             // caso base: lista vazia soma zero
  return lista[0] + soma(lista.slice(1));        // passo recursivo: primeiro + soma do resto
}

soma([1, 2, 3, 4]); // 1 + soma([2,3,4]) = 1 + (2 + soma([3,4])) = ... = 10`,
      caption: 'O "resto da lista" (lista.slice(1)) é sempre menor que a lista original — é isso que garante que o caso base chega.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-2-duas-pecas',
        type: 'multiple-choice',
        prompt: 'Quais são as duas partes que toda função recursiva precisa ter?',
        concepts: ['estruturas-recursao'],
        difficulty: 'iniciante',
        tags: ['estruturas-de-dados', 'recursao'],
        options: [
          'Um caso base que resolve direto sem chamar a si mesma, e um passo recursivo que chama a si mesma com um problema menor',
          'Um `for` e um `while`',
          'Um parâmetro e um retorno',
          'Uma condição e um `try/catch`',
        ],
        correctIndex: 0,
        explanation:
          'Sem caso base a recursão nunca para; sem o problema encolher a cada chamada recursiva, o caso base nunca é alcançado, mesmo que ele exista. As duas peças juntas são o que garante que a cadeia de chamadas termina.',
        hints: ['Pense no que impede uma função recursiva de chamar a si mesma para sempre.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-2-sem-caso-base',
        type: 'find-bug',
        prompt: 'Esta função deveria somar os números de 1 até n, mas trava o programa. Aponte a linha que precisa mudar.',
        concepts: ['estruturas-recursao'],
        difficulty: 'intermediario',
        tags: ['estruturas-de-dados', 'recursao', 'bug'],
        code: `function somarAte(n) {
  return n + somarAte(n - 1);
}

console.log(somarAte(5));`,
        buggyLine: 2,
        fix: '  if (n <= 0) return 0;\n  return n + somarAte(n - 1);',
        explanation:
          'Falta o caso base: a função chama a si mesma para sempre, com `n` cada vez menor — 5, 4, 3, 2, 1, 0, -1, -2… — sem nunca parar, até estourar a pilha de chamadas. Um `if (n <= 0) return 0;` antes da chamada recursiva dá à cadeia um ponto para parar.',
        hints: [
          'A função chama a si mesma sempre, sem nenhuma condição que a impeça. O que acontece quando `n` chega a 0? E a -1?',
          'Todo caso base é um `if` que devolve um valor direto, sem chamar a função de novo.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-2-previsao-fatorial',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['estruturas-recursao'],
        difficulty: 'intermediario',
        tags: ['estruturas-de-dados', 'recursao'],
        code: `function fatorial(n) {
  if (n <= 1) return 1;
  return n * fatorial(n - 1);
}

console.log(fatorial(3));`,
        expectedOutput: '6',
        explanation:
          '`fatorial(3)` é `3 * fatorial(2)`, que é `3 * (2 * fatorial(1))`, e `fatorial(1)` é o caso base, `1`. Desempilhando: `2 * 1 = 2`, depois `3 * 2 = 6`.',
        hints: ['Desenrole chamada por chamada: `fatorial(3) = 3 * fatorial(2)`, e assim por diante, até o caso base.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-2-ordem-da-pilha',
        type: 'order-steps',
        prompt: 'Para `fatorial(3)`, coloque na ordem em que as chamadas de fato terminam (devolvem um valor) — da primeira a terminar até a última.',
        concepts: ['estruturas-recursao'],
        difficulty: 'intermediario',
        tags: ['estruturas-de-dados', 'recursao', 'pilha-de-chamadas'],
        steps: [
          { id: 'f1', text: 'fatorial(1) termina primeiro, devolvendo 1 — é o caso base', ordem: 1 },
          { id: 'f2', text: 'fatorial(2) termina em seguida, devolvendo 2 * 1 = 2', ordem: 2 },
          { id: 'f3', text: 'fatorial(3) termina por último, devolvendo 3 * 2 = 6', ordem: 3 },
        ],
        explanation:
          'A chamada mais funda (o caso base) é sempre a primeira a devolver um valor — as chamadas de fora ficam esperando o resultado das de dentro antes de poder calcular o próprio. É por isso que a pilha "desempilha" de dentro para fora, na ordem inversa de como foi empilhada.',
        hints: ['A última chamada feita (a mais funda) é a primeira a ter uma resposta pronta, porque é ela que bate no caso base.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-2-soma-recursiva',
        type: 'code',
        prompt: 'Escreva `somaRecursiva(lista)`: soma todos os números da lista usando recursão (sem `for`, `while` nem `reduce`).',
        concepts: ['estruturas-recursao'],
        difficulty: 'intermediario',
        tags: ['estruturas-de-dados', 'recursao'],
        initialCode: `function somaRecursiva(lista) {
  // Seu código aqui — sem for, while ou reduce
}`,
        tests: [
          {
            description: 'Soma uma lista com vários números',
            assertion: `const r = somaRecursiva([1, 2, 3, 4]);
if (r !== 10) throw new Error('esperava 10, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Lista vazia soma zero — é o caso base',
            assertion: `const r = somaRecursiva([]);
if (r !== 0) throw new Error('esperava 0 para lista vazia, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Lista com um item devolve o próprio item',
            assertion: `const r = somaRecursiva([7]);
if (r !== 7) throw new Error('esperava 7, veio ' + JSON.stringify(r));`,
          },
        ],
        solution: `function somaRecursiva(lista) {
  if (lista.length === 0) return 0;
  return lista[0] + somaRecursiva(lista.slice(1));
}`,
        hints: [
          'O caso base é a lista vazia — a soma de nada é zero.',
          'O passo recursivo soma o primeiro item com a soma recursiva do resto (`lista.slice(1)`), que é sempre uma lista menor.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Recursão é uma função que chama a si mesma, sempre com um problema menor, até um caso base que interrompe a cadeia. Cada chamada fica empilhada até a de dentro devolver — e uma recursão sem caso base, ou sem o problema encolher, nunca chega lá e estoura a pilha.

Na próxima aula, duas estruturas que também dependem de disciplina, não de sintaxe nova: pilha e fila.
`.trim(),
    },
  ],
};

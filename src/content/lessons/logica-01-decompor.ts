import type { Lesson } from '../types';

export const lessonDecompor: Lesson = {
  id: 'lesson-logica-1',
  trackId: 'track-logica',
  title: 'Decompor: Quebrar o Problema Antes de Codar',
  language: 'javascript',
  objective: 'Transformar um enunciado grande numa sequência de passos pequenos e verificáveis.',
  concepts: ['decomposicao', 'funcoes'],
  status: 'published',
  estimatedMinutes: 20,
  blocks: [
    {
      kind: 'prose',
      markdown: `
A dificuldade de quem "sabe a sintaxe mas não consegue resolver" quase nunca é a linguagem. É começar a escrever antes de saber **quais são os passos**.

Pegue este enunciado:

> Dada uma frase, descubra qual palavra aparece mais vezes.

Escrito assim, ele parece uma coisa só. Mas são quatro:

1. separar a frase em palavras
2. contar quantas vezes cada palavra aparece
3. descobrir qual tem a maior contagem
4. devolver essa palavra

Cada passo dá para resolver e testar sozinho. É isso que torna o problema tratável — e o que permite descobrir **em qual passo** você errou, em vez de encarar um resultado errado sem pista nenhuma.

A pergunta que destrava quase sempre: *qual é a menor parte disso que eu já saberia fazer agora?* Comece por ela.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Passo 1, isolado e testável:
function separar(frase) {
  return frase.toLowerCase().split(" ");
}
console.log(separar("o rato roeu o rato"));
// ["o", "rato", "roeu", "o", "rato"]

// Passo 2, usando o passo 1 que já sabemos que funciona:
function contar(palavras) {
  const contagem = {};
  for (const p of palavras) {
    contagem[p] = (contagem[p] || 0) + 1;
  }
  return contagem;
}
console.log(contar(separar("o rato roeu o rato")));
// { o: 2, rato: 2, roeu: 1 }`,
      caption:
        'Repare no (contagem[p] || 0): na primeira vez a chave não existe e vale undefined, então usamos 0 como ponto de partida.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-1-ordem',
        type: 'multiple-choice',
        prompt:
          'Você precisa calcular quanto cada pessoa paga numa conta de restaurante dividida igualmente, já com 10% de gorjeta. Qual decomposição faz mais sentido?',
        concepts: ['decomposicao'],
        difficulty: 'iniciante',
        tags: ['logica', 'decomposicao'],
        options: [
          'Dividir a conta pelas pessoas, depois somar 10% ao valor de cada uma',
          'Somar 10% ao total, depois dividir pelo número de pessoas',
          'Somar 10% a cada item do pedido, depois somar tudo e dividir',
          'As três dão exatamente o mesmo resultado, então tanto faz',
        ],
        correctIndex: 3,
        explanation:
          'Aqui as três chegam ao mesmo número, porque multiplicação e divisão são associativas: (T × 1,1) ÷ P é igual a (T ÷ P) × 1,1. Reconhecer quando a ordem **não** importa é tão útil quanto reconhecer quando importa — evita discussão inútil. Mas cuidado: se houvesse arredondamento para centavos em cada etapa, as três passariam a divergir.',
        hints: [
          'Escreva as três como fórmula matemática antes de decidir.',
          'Multiplicação e divisão podem trocar de ordem sem mudar o resultado.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-1-frequente',
        type: 'code',
        prompt: `Complete o problema dos quatro passos: crie \`palavraMaisFrequente(frase)\` que **retorna** a palavra que mais se repete.\n\nIgnore maiúsculas — \`"O"\` e \`"o"\` são a mesma palavra. Em caso de empate, devolva a que aparece primeiro na frase.`,
        concepts: ['decomposicao', 'objetos', 'strings', 'loops'],
        difficulty: 'intermediario',
        tags: ['logica', 'decomposicao', 'contagem'],
        initialCode: `function palavraMaisFrequente(frase) {
  // Passo 1: separar em palavras
  // Passo 2: contar cada uma
  // Passo 3: achar a maior contagem
  // Passo 4: devolver a palavra
}

console.log(palavraMaisFrequente("o rato roeu a roupa do rei de roma o rato"));
`,
        hints: [
          'Resolva um passo por vez e imprima o resultado de cada um antes de seguir.',
          'Para contar, use um objeto onde a chave é a palavra e o valor é quantas vezes apareceu.',
          'Na primeira aparição a chave não existe: contagem[p] = (contagem[p] || 0) + 1 resolve.',
          'Depois de contar, percorra as chaves guardando qual teve o maior valor — como no exercício do maior número.',
        ],
        tests: [
          {
            description: 'A função palavraMaisFrequente existe',
            assertion: `if (typeof palavraMaisFrequente !== 'function') throw new Error("Crie uma função chamada 'palavraMaisFrequente'.");`,
          },
          {
            description: 'Encontra a palavra mais repetida',
            assertion: `const r = palavraMaisFrequente("o rato roeu a roupa do rei de roma o rato");
if (r !== "o") throw new Error("Esperado \\"o\\" (aparece 3 vezes), mas veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'Ignora maiúsculas e minúsculas',
            assertion: `const r = palavraMaisFrequente("Casa casa CASA porta");
if (r !== "casa") throw new Error("\\"Casa\\", \\"casa\\" e \\"CASA\\" são a mesma palavra, então o resultado deveria ser \\"casa\\" em minúsculas. Veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'No empate, devolve a primeira da frase',
            assertion: `const r = palavraMaisFrequente("azul verde azul verde");
if (r !== "azul") throw new Error("Ambas aparecem 2 vezes, então deveria vir \\"azul\\", a primeira. Veio " + JSON.stringify(r) + ". Use > e não >= ao comparar contagens.");`,
            hidden: true,
          },
          {
            description: 'Funciona com uma palavra só',
            assertion: `if (palavraMaisFrequente("sozinha") !== "sozinha") throw new Error("Com uma única palavra, ela mesma é a mais frequente.");`,
            hidden: true,
          },
        ],
        solution: `function palavraMaisFrequente(frase) {
  const palavras = frase.toLowerCase().split(" ");

  const contagem = {};
  for (const p of palavras) {
    contagem[p] = (contagem[p] || 0) + 1;
  }

  let melhor = palavras[0];
  for (const p of palavras) {
    if (contagem[p] > contagem[melhor]) melhor = p;
  }
  return melhor;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Antes de escrever, liste os passos. Cada passo deve ser pequeno o bastante para você testar sozinho — assim, quando o resultado sair errado, você sabe **onde** procurar.`,
    },
  ],
};

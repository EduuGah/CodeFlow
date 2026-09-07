import type { Lesson } from '../types';

export const lessonMetodosArray: Lesson = {
  id: 'lesson-js-8',
  trackId: 'track-js-fundamentos',
  title: 'Transformando Listas: map, filter e reduce',
  language: 'javascript',
  objective: 'Substituir loops manuais por métodos que declaram a intenção do código.',
  concepts: ['arrays', 'funcoes', 'loops'],
  status: 'published',
  estimatedMinutes: 22,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Você já sabe percorrer um array com \`for\`. Agora vem a pergunta que separa código que funciona de código que se lê: **o que esse loop está tentando fazer?**

Três intenções cobrem a maioria dos casos, e cada uma tem um método próprio:

| Intenção | Método | Devolve |
|---|---|---|
| Transformar cada item | \`map\` | array do **mesmo tamanho** |
| Escolher alguns itens | \`filter\` | array **menor ou igual** |
| Reduzir tudo a um valor | \`reduce\` | um **único** valor |

O ganho não é escrever menos. É que \`filter\` anuncia "estou selecionando" antes mesmo de você ler a condição — enquanto um \`for\` com \`if\` dentro poderia estar fazendo qualquer coisa.

Os três **não modificam** o array original: devolvem um novo. Essa é uma diferença importante em relação a métodos como \`push\` e \`sort\`.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `const precos = [10, 25, 40];

// map: transforma cada item
const comDesconto = precos.map(p => p * 0.9);
console.log(comDesconto);   // [9, 22.5, 36]

// filter: escolhe alguns
const caros = precos.filter(p => p > 20);
console.log(caros);         // [25, 40]

// reduce: junta tudo num valor só
const total = precos.reduce((soma, p) => soma + p, 0);
console.log(total);         // 75

console.log(precos);        // [10, 25, 40] — o original continua intacto`,
      caption:
        'O segundo argumento do reduce (o 0) é o valor inicial do acumulador. É o mesmo "let total = 0" que você escrevia antes do for.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-8-escolher',
        type: 'multiple-choice',
        prompt:
          'Você tem uma lista de produtos e quer os **nomes** apenas dos que estão em estoque. Qual combinação faz isso?',
        concepts: ['arrays'],
        difficulty: 'intermediario',
        tags: ['javascript', 'arrays', 'map', 'filter'],
        options: [
          'map para selecionar os em estoque, depois filter para pegar os nomes',
          'filter para selecionar os em estoque, depois map para pegar os nomes',
          'reduce sozinho, porque devolve um valor único',
          'filter duas vezes: uma para o estoque e outra para os nomes',
        ],
        correctIndex: 1,
        explanation:
          'Primeiro você **escolhe** quais produtos interessam — isso é `filter`, e o resultado é uma lista menor. Depois **transforma** cada produto no seu nome — isso é `map`, e o resultado tem o mesmo tamanho da lista filtrada. Inverter a ordem não funcionaria: depois do `map` você só teria nomes, e teria perdido a informação de estoque.',
        hints: [
          'Separe as duas ações: uma seleciona itens, a outra transforma cada item.',
          'Qual método devolve uma lista menor? Qual devolve uma do mesmo tamanho?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-8-aprovados',
        type: 'code',
        prompt: `Dado um array de alunos com \`nome\` e \`nota\`, crie \`nomesAprovados(alunos)\` que **retorna** um array com os nomes de quem tirou 7 ou mais.\n\nUse \`filter\` e \`map\` — não use \`for\`.`,
        concepts: ['arrays', 'funcoes'],
        difficulty: 'intermediario',
        tags: ['javascript', 'arrays', 'map', 'filter'],
        initialCode: `const alunos = [
  { nome: "Ana", nota: 9 },
  { nome: "Bruno", nota: 5 },
  { nome: "Carla", nota: 7 },
];

function nomesAprovados(alunos) {
  // Seu código aqui
}

console.log(nomesAprovados(alunos)); // ["Ana", "Carla"]
`,
        hints: [
          'São duas etapas encadeadas: primeiro selecionar, depois transformar.',
          'filter recebe uma função que devolve true para os itens que ficam.',
          'Você pode encadear direto: alunos.filter(...).map(...)',
          'return alunos.filter(a => a.nota >= 7).map(a => a.nome);',
        ],
        tests: [
          {
            description: 'A função nomesAprovados existe',
            assertion: `if (typeof nomesAprovados !== 'function') throw new Error("Crie uma função chamada 'nomesAprovados'.");`,
          },
          {
            description: 'Devolve apenas os nomes de quem passou',
            assertion: `const r = nomesAprovados([{ nome: "Ana", nota: 9 }, { nome: "Bruno", nota: 5 }, { nome: "Carla", nota: 7 }]);
if (!Array.isArray(r)) throw new Error("A função deveria devolver um array, mas devolveu " + typeof r + ".");
if (JSON.stringify(r) !== JSON.stringify(["Ana", "Carla"])) throw new Error("Esperado [\\"Ana\\",\\"Carla\\"], mas veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'A nota 7 exata é aprovação',
            assertion: `const r = nomesAprovados([{ nome: "Limite", nota: 7 }]);
if (JSON.stringify(r) !== JSON.stringify(["Limite"])) throw new Error("Exatamente 7 deveria ser aprovado. Use >= e não >.");`,
            hidden: true,
          },
          {
            description: 'Lista vazia devolve lista vazia',
            assertion: `const r = nomesAprovados([]);
if (JSON.stringify(r) !== "[]") throw new Error("Com uma lista vazia o resultado deveria ser [], mas veio " + JSON.stringify(r) + ".");`,
            hidden: true,
          },
          {
            description: 'Não modifica o array original',
            assertion: `const entrada = [{ nome: "Ana", nota: 9 }, { nome: "Bruno", nota: 5 }];
nomesAprovados(entrada);
if (entrada.length !== 2) throw new Error("O array original foi modificado. filter e map devolvem novos arrays — não altere a entrada.");`,
            hidden: true,
          },
        ],
        solution: `function nomesAprovados(alunos) {
  return alunos.filter(a => a.nota >= 7).map(a => a.nome);
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `\`map\` transforma, \`filter\` seleciona, \`reduce\` condensa. Escolher o método certo faz o código **anunciar a intenção** — e nenhum dos três altera o array original.`,
    },
  ],
};

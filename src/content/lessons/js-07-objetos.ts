import type { Lesson } from '../types';

export const lessonObjetos: Lesson = {
  id: 'lesson-js-7',
  trackId: 'track-js-fundamentos',
  title: 'Objetos: Dados com Nome',
  language: 'javascript',
  objective: 'Agrupar informações relacionadas numa estrutura só, acessada por nome em vez de posição.',
  concepts: ['objetos', 'variaveis'],
  status: 'published',
  estimatedMinutes: 16,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um array guarda uma lista e você acessa pela **posição**. Mas posição é um péssimo jeito de lembrar o que é cada coisa: em \`["Ana", 28, "ana@email.com"]\`, o que era a posição 1 mesmo?

Um **objeto** resolve isso guardando pares de **chave** e **valor**. Você acessa pelo nome:

\`\`\`javascript
const usuario = { nome: "Ana", idade: 28 };
usuario.nome; // "Ana"
\`\`\`

Duas formas de acessar, e cada uma tem seu momento:

- \`usuario.nome\` — quando você sabe a chave ao escrever o código.
- \`usuario["nome"]\` — quando a chave está numa variável, ou tem espaço/hífen.

Chave que não existe devolve \`undefined\`, sem erro. Isso é a origem do erro mais comum do JavaScript: \`Cannot read properties of undefined\`. Ele aparece quando você acessa dois níveis de uma vez e o primeiro já não existia.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `const produto = {
  nome: "Teclado",
  preco: 250,
  estoque: { quantidade: 4, deposito: "SP" },
};

console.log(produto.nome);                 // "Teclado"
console.log(produto.estoque.quantidade);   // 4
console.log(produto.cor);                  // undefined — chave inexistente

// O erro clássico:
// console.log(produto.fabricante.nome);
// TypeError: Cannot read properties of undefined (reading 'nome')
// produto.fabricante é undefined, e undefined não tem .nome

const chave = "preco";
console.log(produto[chave]);               // 250 — chave vinda de variável`,
      caption:
        'produto.cor devolve undefined em silêncio. O erro só estoura quando você tenta ler algo DENTRO de undefined.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-7-prever',
        type: 'predict-output',
        prompt: 'O que este código imprime?',
        concepts: ['objetos'],
        difficulty: 'iniciante',
        tags: ['javascript', 'objetos', 'undefined'],
        code: `const config = { tema: "escuro" };

console.log(config.tema);
console.log(config.idioma);`,
        expectedOutput: 'escuro\nundefined',
        explanation:
          'A chave `tema` existe e devolve "escuro". A chave `idioma` não existe — e o JavaScript devolve `undefined` em vez de lançar erro. É por isso que erros de digitação em nomes de chave passam despercebidos por muito tempo.',
        hints: [
          'Uma das duas chaves não foi declarada no objeto.',
          'Acessar chave inexistente não gera erro. O que ela devolve?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-7-contato',
        type: 'code',
        prompt: `Crie a função \`descrever(pessoa)\` que **retorna** um texto no formato \`"Ana, 28 anos, São Paulo"\`.\n\nA cidade fica em \`pessoa.endereco.cidade\`. Se a pessoa não tiver \`endereco\`, use \`"cidade não informada"\` no lugar — sem quebrar.`,
        concepts: ['objetos', 'condicoes'],
        difficulty: 'intermediario',
        tags: ['javascript', 'objetos', 'undefined'],
        initialCode: `function descrever(pessoa) {
  // Seu código aqui
}

console.log(descrever({ nome: "Ana", idade: 28, endereco: { cidade: "São Paulo" } }));
console.log(descrever({ nome: "Bruno", idade: 35 }));
`,
        hints: [
          'Monte o texto juntando as partes com +, ou use template string com crases.',
          'O segundo caso não tem endereco. Acessar pessoa.endereco.cidade nele lança TypeError.',
          'Teste se pessoa.endereco existe ANTES de tentar ler a cidade dele.',
          'const cidade = pessoa.endereco ? pessoa.endereco.cidade : "cidade não informada";',
        ],
        tests: [
          {
            description: 'A função descrever existe',
            assertion: `if (typeof descrever !== 'function') throw new Error("Crie uma função chamada 'descrever'.");`,
          },
          {
            description: 'Descreve uma pessoa com endereço',
            assertion: `const r = descrever({ nome: "Ana", idade: 28, endereco: { cidade: "São Paulo" } });
if (r !== "Ana, 28 anos, São Paulo") throw new Error("Esperado \\"Ana, 28 anos, São Paulo\\", mas veio " + JSON.stringify(r) + ". Confira as vírgulas e os espaços.");`,
          },
          {
            description: 'Não quebra quando falta o endereço',
            assertion: `let r;
try {
  r = descrever({ nome: "Bruno", idade: 35 });
} catch (e) {
  throw new Error("A função quebrou com " + e.message + ". Verifique se 'endereco' existe antes de ler a cidade.");
}
if (r !== "Bruno, 35 anos, cidade não informada") throw new Error("Esperado \\"Bruno, 35 anos, cidade não informada\\", mas veio " + JSON.stringify(r) + ".");`,
          },
        ],
        solution: `function descrever(pessoa) {
  const cidade = pessoa.endereco ? pessoa.endereco.cidade : "cidade não informada";
  return pessoa.nome + ", " + pessoa.idade + " anos, " + cidade;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Objetos guardam dados por **nome**, não por posição. Chave inexistente devolve \`undefined\` em silêncio — e o erro só estoura quando você tenta ler algo dentro desse \`undefined\`. Verifique o nível de cima antes de descer.`,
    },
  ],
};

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

~~~javascript
const usuario = { nome: 'Ana', idade: 28, email: 'ana@email.com' };

usuario.nome;    // 'Ana'
usuario.idade;   // 28
~~~

O código passa a dizer o que faz. \`usuario.idade\` se entende sozinho; \`dados[1]\` exige memória ou um comentário.

## Duas formas de acessar

~~~javascript
usuario.nome;        // ponto: quando você SABE a chave ao escrever
usuario['nome'];     // colchete: quando a chave está numa variável

const campo = 'email';
usuario[campo];      // 'ana@email.com'
usuario.campo;       // undefined — procurou a chave literal "campo"
~~~

O colchete também é obrigatório quando a chave tem espaço ou hífen: \`config['modo-escuro']\`.

## Chave que não existe devolve \`undefined\`

Sem erro, sem aviso:

~~~javascript
usuario.telefone;   // undefined
~~~

Isso parece cômodo e é a origem do erro mais comum do JavaScript. Quando você acessa **dois níveis de uma vez** e o primeiro não existe:

~~~javascript
usuario.endereco.rua;
// TypeError: Cannot read properties of undefined (reading 'rua')
~~~

O erro não é sobre \`rua\`: é que \`usuario.endereco\` já era \`undefined\`, e \`undefined\` não tem propriedades. Ler a mensagem com atenção economiza muito tempo — ela diz qual acesso falhou, não qual chave você queria.

A proteção é o **encadeamento opcional**:

~~~javascript
usuario.endereco?.rua;    // undefined, sem quebrar
~~~

O \`?.\` interrompe a cadeia assim que encontra \`undefined\` ou \`null\`, em vez de tentar continuar.

## Objetos dentro de objetos, e listas de objetos

É assim que dados reais chegam de uma API:

~~~javascript
const pedido = {
  cliente: { nome: 'Ana' },
  itens: [
    { produto: 'Pão', quantidade: 2 },
    { produto: 'Leite', quantidade: 1 },
  ],
};

pedido.cliente.nome;         // 'Ana'
pedido.itens.length;         // 2
pedido.itens[0].produto;     // 'Pão'
~~~

Nada de novo aqui: é a mesma regra aplicada em camadas. O que muda é que cada nível é uma chance a mais de encontrar \`undefined\`.
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
        id: 'ex-js-7-prever-encadeado',
        type: 'predict-output',
        prompt:
          'Este programa roda até a última linha? O que ele imprime antes de parar, se parar?',
        concepts: ['objetos', 'casos-extremos'],
        difficulty: 'intermediario',
        tags: ['javascript', 'objetos'],
        code: `const pedido = { cliente: { nome: 'Ana' } };

console.log(pedido.cliente.nome);
console.log(pedido.entrega);
console.log(pedido.entrega?.rua);`,
        expectedOutput: 'Ana\nundefined\nundefined',
        explanation:
          'A segunda linha imprime `undefined` sem erro: chave que não existe simplesmente não existe. A terceira usa `?.`, que interrompe a cadeia ao encontrar `undefined` em vez de tentar ler `rua` dele. Sem o `?.`, aquela linha lançaria `Cannot read properties of undefined`.',
        hints: [
          'Acessar uma chave que não existe dá erro, ou devolve algo?',
          'O que o `?.` faz quando o lado esquerdo é `undefined`?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-7-lacuna-acesso',
        type: 'fill-blank',
        prompt:
          'Complete para a função ler qualquer campo pelo nome recebido, e não quebrar quando o campo não existir.',
        concepts: ['objetos'],
        difficulty: 'iniciante',
        tags: ['javascript', 'objetos'],
        template: `function ler(objeto, campo) {
  return objeto{{1}};
}`,
        blanks: [{ placeholder: 'acesso', size: 9 }],
        tests: [
          {
            description: "ler({ nome: 'Ana' }, 'nome') devolve 'Ana'",
            assertion: `const r = ler({ nome: 'Ana' }, 'nome'); if (r !== 'Ana') throw new Error("Esperava 'Ana', veio " + JSON.stringify(r) + ". Se veio undefined, o acesso procurou a chave literal em vez do valor da variável.");`,
          },
          {
            description: 'funciona com qualquer nome de campo',
            assertion: `const r = ler({ idade: 28 }, 'idade'); if (r !== 28) throw new Error("Esperava 28, veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'campo inexistente devolve undefined, sem quebrar',
            assertion: `const r = ler({ nome: 'Ana' }, 'telefone'); if (r !== undefined) throw new Error("Esperava undefined, veio " + JSON.stringify(r) + ".");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'lê o campo pedido, seja qual for o nome',
            generate: `
              const campos = ['nome', 'idade', 'cidade', 'email'];
              const objeto = {};
              for (const c of campos) if (rnd() < 0.6) objeto[c] = c + '-valor';
              return { objeto, campo: campos[Math.floor(rnd() * campos.length)] };
            `,
            check: `
              const esperado = caso.objeto[caso.campo];
              const obtido = ler(caso.objeto, caso.campo);
              if (obtido !== esperado) {
                throw new Error("lendo '" + caso.campo + "' de " + JSON.stringify(caso.objeto) + " esperava " + JSON.stringify(esperado) + ", veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        explanation:
          '`objeto.campo` procuraria uma chave chamada literalmente `campo`. Quando o nome está numa variável, o acesso precisa ser por colchete — é a forma que **avalia** a expressão de dentro antes de procurar.',
        hints: [
          'O nome do campo está numa variável, não escrito no código.',
          'Ponto ou colchete? Um deles avalia a variável, o outro procura a chave literal.',
        ],
        solution: ['[campo]'],
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

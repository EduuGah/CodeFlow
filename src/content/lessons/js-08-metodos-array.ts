import type { Lesson } from '../types';

export const lessonMetodosArray: Lesson = {
  id: 'lesson-js-8',
  trackId: 'track-js-fundamentos',
  title: 'Transformando Listas: map, filter e reduce',
  language: 'javascript',
  objective: 'Substituir loops manuais por métodos que declaram a intenção do código.',
  concepts: ['arrays', 'funcoes', 'loops'],
  status: 'published',
  estimatedMinutes: 40,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Você já sabe percorrer um array com \`for\`. Mas quase todo \`for\` sobre uma lista faz uma de três coisas — e cada uma tem um método próprio, que faz o laço por você:

| Intenção | Método | Devolve |
|---|---|---|
| Transformar cada item | \`map\` | array do **mesmo tamanho** |
| Escolher alguns itens | \`filter\` | array **menor ou igual** |
| Juntar tudo num valor | \`reduce\` | um **único** valor |

Os três **não modificam** o array original: devolvem um novo. E os três funcionam do mesmo jeito: **você escreve uma função que trata um item só, e o método chama essa função uma vez para cada item da lista.** Entender isso no \`map\` é entender os três.

## map: transformar cada item

Compare o mesmo trabalho feito das duas formas:

~~~javascript
const precos = [10, 25, 40];

// Com for: você cria a lista nova, percorre, e empurra cada resultado
const dobrados = [];
for (const preco of precos) {
  dobrados.push(preco * 2);
}

// Com map: você só diz o que acontece com UM preço
const dobrados2 = precos.map((preco) => preco * 2);   // [20, 50, 80]
~~~

A parte que se repete em todo \`for\` — criar a lista vazia, percorrer, empurrar — o \`map\` faz sozinho. Sobra para você só o miolo: \`preco * 2\`.

## De onde vem o \`preco\`?

É a pergunta que mais trava quem vê o \`map\` pela primeira vez. \`(preco) => preco * 2\` é uma **função** — a mesma função de seta da aula de funções, com um parâmetro chamado \`preco\`. Você não chama essa função: entrega ela ao \`map\`, e **o \`map\` a chama uma vez para cada item**, passando o item como argumento:

| Volta | \`preco\` recebe | a função devolve | a lista nova fica |
|---|---|---|---|
| 1ª | 10 | 20 | \`[20]\` |
| 2ª | 25 | 50 | \`[20, 50]\` |
| 3ª | 40 | 80 | \`[20, 50, 80]\` |

O nome \`preco\` é você que escolhe, como em qualquer parâmetro — poderia ser \`p\` ou \`x\`. Escolha o nome do que **um item** é. E dá para ver que é uma função comum declarando ela antes:

~~~javascript
function dobrar(numero) {
  return numero * 2;
}

precos.map(dobrar);   // [20, 50, 80] — o map chama dobrar(10), dobrar(25), dobrar(40)
~~~

Repare: \`precos.map(dobrar)\`, sem parênteses depois de \`dobrar\`. Com parênteses você chamaria a função na hora, sem argumento; sem eles, entrega a função para o \`map\` chamar.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-8-prever-map',
        type: 'predict-output',
        prompt: 'O que este código imprime?',
        concepts: ['arrays', 'funcoes'],
        difficulty: 'iniciante',
        tags: ['javascript', 'arrays', 'map'],
        code: `const idades = [10, 20, 30];

const daquiACinco = idades.map((idade) => idade + 5);

console.log(daquiACinco);
console.log(idades);`,
        expectedOutput: '[15,25,35]\n[10,20,30]',
        explanation:
          'O `map` chamou a função três vezes: com 10 (devolveu 15), com 20 (25) e com 30 (35), e juntou as respostas numa lista nova, na mesma ordem: `[15,25,35]`. A lista `idades` não mudou — o `map` nunca altera a original.\n\nO `console.log` mostra listas sem espaço depois da vírgula; na sua previsão, tanto faz escrever com ou sem.',
        hints: [
          'O `map` chama a função uma vez para cada item da lista, na ordem, e guarda o que ela devolve numa lista nova.',
          'Na primeira volta, `idade` vale 10 e a função devolve 10 + 5. Faça o mesmo com 20 e com 30.',
          'E a lista `idades`, no fim? O `map` cria uma lista nova — ele não mexe na original.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-8-lacuna-map',
        type: 'fill-blank',
        prompt:
          'O frete é de R$ 10 por produto. Complete para `comFrete(precos)` devolver uma lista nova com cada preço **somado ao frete**.',
        concepts: ['arrays', 'funcoes'],
        difficulty: 'iniciante',
        tags: ['javascript', 'arrays', 'map'],
        template: `function comFrete(precos) {
  return precos.map((preco) => {{1}});
}`,
        blanks: [{ placeholder: 'para um preço', size: 12 }],
        tests: [
          {
            description: 'comFrete([100, 25]) devolve [110, 35]',
            assertion: `const r = comFrete([100, 25]); if (JSON.stringify(r) !== '[110,35]') throw new Error("Esperava [110, 35], veio " + JSON.stringify(r) + ". A lacuna é o que a função devolve para UM preço.");`,
          },
          {
            description: 'lista vazia devolve lista vazia',
            assertion: `const r = comFrete([]); if (JSON.stringify(r) !== '[]') throw new Error("Esperava [], veio " + JSON.stringify(r) + ".");`,
            hidden: true,
          },
          {
            description: 'a lista recebida não muda',
            assertion: `const original = [1, 2]; comFrete(original); if (JSON.stringify(original) !== '[1,2]') throw new Error("A lista recebida mudou para " + JSON.stringify(original) + ".");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'cada preço volta somado a 10, na mesma ordem',
            generate: `
              const n = Math.floor(rnd() * 8);
              const precos = [];
              for (let i = 0; i < n; i++) precos.push(Math.floor(rnd() * 500));
              return { precos };
            `,
            check: `
              const esperado = caso.precos.map((p) => p + 10);
              const obtido = comFrete(caso.precos);
              if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
                throw new Error("com " + JSON.stringify(caso.precos) + " esperava " + JSON.stringify(esperado) + ", veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        explanation:
          'A função da seta recebe **um** preço e devolve esse preço mais 10. Quem chama a função para cada item — e junta as respostas numa lista nova — é o `map`. Você só descreve o que acontece com um item.',
        hints: [
          'A lacuna é o que a função devolve para **um** preço só — o `map` cuida de repetir para a lista inteira.',
          'Na seta curta, sem chaves, a expressão depois de `=>` já é o valor devolvido: não precisa de `return`.',
          'Use o parâmetro `preco` e some o frete a ele.',
        ],
        solution: ['preco + 10'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## map com uma lista de objetos

Na prática, a lista quase nunca é de números: é de objetos — produtos, alunos, pedidos. O \`map\` funciona igual; a diferença é que o parâmetro recebe **o objeto inteiro** a cada volta, e você devolve o pedaço que quer:

~~~javascript
const produtos = [
  { nome: 'Caneta', preco: 3 },
  { nome: 'Caderno', preco: 20 },
];

const nomes = produtos.map((produto) => produto.nome);
console.log(nomes);   // ['Caneta', 'Caderno']
~~~

| Volta | \`produto\` recebe | a função devolve |
|---|---|---|
| 1ª | \`{ nome: 'Caneta', preco: 3 }\` | \`'Caneta'\` |
| 2ª | \`{ nome: 'Caderno', preco: 20 }\` | \`'Caderno'\` |

Dê ao parâmetro o nome de **um** item da lista, no singular: a lista é \`produtos\`, cada item é um \`produto\`. Aí \`produto.nome\` se lê sozinho — "o nome do produto".
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-8-lacuna-map-objetos',
        type: 'fill-blank',
        prompt: 'Complete para `nomesDosProdutos(produtos)` devolver só os **nomes**, na mesma ordem.',
        concepts: ['arrays', 'objetos'],
        difficulty: 'iniciante',
        tags: ['javascript', 'arrays', 'map', 'objetos'],
        template: `function nomesDosProdutos(produtos) {
  return produtos.map((produto) => {{1}});
}`,
        blanks: [{ placeholder: 'para um produto', size: 14 }],
        tests: [
          {
            description: "devolve ['Caneta', 'Caderno']",
            assertion: `const r = nomesDosProdutos([{ nome: 'Caneta', preco: 3 }, { nome: 'Caderno', preco: 20 }]); if (JSON.stringify(r) !== '["Caneta","Caderno"]') throw new Error("Esperava ['Caneta', 'Caderno'], veio " + JSON.stringify(r) + ". Cada volta recebe um produto inteiro; devolva só o nome dele.");`,
          },
          {
            description: 'lista vazia devolve lista vazia',
            assertion: `const r = nomesDosProdutos([]); if (JSON.stringify(r) !== '[]') throw new Error("Esperava [], veio " + JSON.stringify(r) + ".");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'devolve o nome de cada produto, na mesma ordem',
            generate: `
              const n = Math.floor(rnd() * 6);
              const produtos = [];
              for (let i = 0; i < n; i++) produtos.push({ nome: 'item' + Math.floor(rnd() * 1000), preco: Math.floor(rnd() * 100) });
              return { produtos };
            `,
            check: `
              const esperado = caso.produtos.map((p) => p.nome);
              const obtido = nomesDosProdutos(caso.produtos);
              if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
                throw new Error("com " + JSON.stringify(caso.produtos) + " esperava " + JSON.stringify(esperado) + ", veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        explanation:
          'A cada volta, `produto` é um objeto inteiro, e a função devolve só a chave `nome` dele. O `map` junta esses nomes numa lista nova do mesmo tamanho — um nome por produto, na mesma ordem.',
        hints: [
          "A cada volta, `produto` é um objeto inteiro, como `{ nome: 'Caneta', preco: 3 }`. O que a função deve devolver dele?",
          'Você quer uma chave só do objeto — a que guarda o nome.',
          'Leia a chave com ponto, a partir do parâmetro: o nome do parâmetro, um ponto, e o nome da chave.',
        ],
        solution: ['produto.nome'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## filter: ficar só com alguns

\`filter\` também recebe uma função e a chama uma vez por item. A diferença é o que a função devolve: **\`true\` ou \`false\`** — a resposta a uma pergunta sobre o item. Quem responde \`true\` fica na lista nova; quem responde \`false\` sai.

~~~javascript
const precos = [5, 80, 30];

// Com for: criar a lista, perguntar para cada um, empurrar quem passa
const baratos = [];
for (const preco of precos) {
  if (preco < 50) baratos.push(preco);
}

// Com filter: só a pergunta
const baratos2 = precos.filter((preco) => preco < 50);   // [5, 30]
~~~

| Volta | \`preco\` | \`preco < 50\` | na lista nova? |
|---|---|---|---|
| 1ª | 5 | \`true\` | fica |
| 2ª | 80 | \`false\` | sai |
| 3ª | 30 | \`true\` | fica |

O \`filter\` devolve os **próprios itens** que passaram, sem mudar nada neles — transformar é trabalho do \`map\`. Por isso os dois aparecem tanto juntos: primeiro escolher, depois transformar.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-8-lacuna-filter',
        type: 'fill-blank',
        prompt: 'Complete para `baratos(produtos)` devolver só os produtos que custam **menos de 50**.',
        concepts: ['arrays', 'condicoes'],
        difficulty: 'iniciante',
        tags: ['javascript', 'arrays', 'filter'],
        template: `function baratos(produtos) {
  return produtos.filter((produto) => {{1}});
}`,
        blanks: [{ placeholder: 'a pergunta', size: 18 }],
        tests: [
          {
            description: 'fica só com a Caneta e o Caderno',
            assertion: `const r = baratos([{ nome: 'Caneta', preco: 3 }, { nome: 'Mochila', preco: 120 }, { nome: 'Caderno', preco: 20 }]);
if (!Array.isArray(r)) throw new Error("Esperava uma lista, veio " + JSON.stringify(r) + ".");
const nomes = r.map((p) => p && p.nome).join(', ');
if (nomes !== 'Caneta, Caderno') throw new Error("Esperava os produtos Caneta e Caderno, vieram: " + (nomes || 'nenhum') + ".");`,
          },
          {
            description: 'um produto de exatamente 50 não entra — a regra é "menos de 50"',
            assertion: `const r = baratos([{ nome: 'Estojo', preco: 50 }]); if (r.length !== 0) throw new Error("50 não é menos que 50. Use < e não <=.");`,
            hidden: true,
          },
          {
            description: 'lista vazia devolve lista vazia',
            assertion: `const r = baratos([]); if (!Array.isArray(r) || r.length !== 0) throw new Error("Esperava [], veio " + JSON.stringify(r) + ".");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'fica exatamente com os produtos abaixo de 50, na mesma ordem',
            generate: `
              const n = Math.floor(rnd() * 8);
              const produtos = [];
              for (let i = 0; i < n; i++) produtos.push({ nome: 'p' + i, preco: Math.floor(rnd() * 100) });
              return { produtos };
            `,
            check: `
              const esperado = caso.produtos.filter((p) => p.preco < 50).map((p) => p.nome);
              const obtido = baratos(caso.produtos).map((p) => p.nome);
              if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
                throw new Error("com " + JSON.stringify(caso.produtos) + " esperava os produtos " + JSON.stringify(esperado) + ", vieram " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        explanation:
          'A função do `filter` responde, para cada produto, se ele fica: `produto.preco < 50` já é `true` ou `false`, sem precisar de `if`. O `filter` devolve os produtos inteiros que responderam `true`, na ordem em que estavam.',
        hints: [
          'A função do `filter` responde uma pergunta sobre **um** produto: ele fica na lista, ou sai?',
          'A pergunta é sobre o preço do produto. Como se lê o preço a partir do parâmetro?',
          'Compare o preço do produto com 50 usando "menor que". Uma comparação já é `true` ou `false` — não precisa de `if` nem de `return`.',
        ],
        solution: ['produto.preco < 50'],
      },
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
          'Separe as duas ações do enunciado: uma escolhe produtos, a outra transforma cada produto num nome.',
          'Qual método devolve uma lista menor (escolhe)? Qual devolve uma do mesmo tamanho (transforma)?',
          'Pense no que sobra depois de cada etapa: se você transformar tudo em nomes primeiro, ainda dá para saber quais estão em estoque?',
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
  // 1. Fique só com quem tirou 7 ou mais (filter).
  // 2. Transforme cada aluno que sobrou no nome dele (map).
}

console.log(nomesAprovados(alunos)); // ["Ana", "Carla"]
`,
        hints: [
          'São duas etapas, nesta ordem: primeiro escolher quem passou, depois transformar cada aluno no nome dele.',
          'Escolher é `filter`: a função recebe **um** aluno e devolve `true` para quem fica — quem tem `nota` 7 ou mais.',
          'O resultado do `filter` ainda é uma lista de alunos inteiros. Encadeie um `.map(...)` logo depois, devolvendo só o `nome` de cada um: `alunos.filter(...).map(...)`, com um `return` na frente.',
          'return alunos.filter((aluno) => aluno.nota >= 7).map((aluno) => aluno.nome);',
        ],
        tests: [
          {
            description: 'A função nomesAprovados existe',
            assertion: `if (typeof nomesAprovados !== 'function') throw new Error("Crie uma função chamada 'nomesAprovados'.");`,
          },
          {
            description: 'Devolve apenas os nomes de quem passou',
            assertion: `const r = nomesAprovados([{ nome: "Ana", nota: 9 }, { nome: "Bruno", nota: 5 }, { nome: "Carla", nota: 7 }]);
if (!Array.isArray(r)) throw new Error("A função deveria devolver um array, mas devolveu " + typeof r + ". Confira se tem um return na frente.");
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
        properties: [
          {
            description: 'devolve exatamente os nomes de quem tirou 7 ou mais, na mesma ordem',
            generate: `
              const n = Math.floor(rnd() * 10);
              const alunos = [];
              for (let i = 0; i < n; i++) {
                alunos.push({ nome: "aluno" + i, nota: Math.round(rnd() * 100) / 10 });
              }
              return { alunos };
            `,
            check: `
              const r = nomesAprovados(caso.alunos);
              const esperado = caso.alunos.filter(a => a.nota >= 7).map(a => a.nome);

              if (!Array.isArray(r)) throw new Error("nomesAprovados deveria devolver uma lista.");
              if (r.length !== esperado.length || r.some((nome, i) => nome !== esperado[i])) {
                throw new Error("com " + JSON.stringify(caso.alunos) + " esperava " + JSON.stringify(esperado) + ", veio " + JSON.stringify(r) + ".");
              }
            `,
          },
        ],
        solution: `function nomesAprovados(alunos) {
  return alunos.filter((aluno) => aluno.nota >= 7).map((aluno) => aluno.nome);
}`,
      },
    },
    {
      kind: 'prose',
      markdown: `
## reduce: juntar tudo num valor só

\`reduce\` também chama sua função uma vez por item, mas carrega um valor de uma volta para a outra — o **acumulador**. É o mesmo \`let total = 0\` que você escrevia antes de um \`for\`:

~~~javascript
const precos = [10, 25, 40];

// Com for
let total = 0;
for (const preco of precos) {
  total = total + preco;
}

// Com reduce: a função recebe (acumulador, item) e devolve o novo acumulador;
// o valor inicial vem depois da função
const total2 = precos.reduce((soma, preco) => soma + preco, 0);   // 75
~~~

| Volta | \`soma\` (o que já juntou) | \`preco\` | devolve — vira a \`soma\` da próxima volta |
|---|---|---|---|
| 1ª | \`0\` (o valor inicial) | 10 | 10 |
| 2ª | 10 | 25 | 35 |
| 3ª | 35 | 40 | 75 |

Depois da última volta, o \`reduce\` devolve a última soma: **75**. O \`0\` no fim é o ponto de partida — sem ele, o \`reduce\` começa pelo primeiro item, e numa lista vazia não tem por onde começar: lança erro.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-8-escolher-metodo',
        type: 'multiple-choice',
        prompt:
          'Você tem uma lista de produtos e precisa do **valor total** do estoque. Qual método expressa essa intenção?',
        concepts: ['arrays'],
        difficulty: 'iniciante',
        tags: ['javascript', 'arrays'],
        options: [
          '`map`, porque percorre todos os produtos',
          '`filter`, porque separa os que têm valor',
          '`reduce`, porque condensa a lista num número só',
          '`forEach`, porque é o mais simples',
        ],
        correctIndex: 2,
        explanation:
          'A intenção é transformar muitos valores em **um**, e isso é exatamente `reduce`. `map` devolveria uma lista do mesmo tamanho, `filter` uma lista menor, e `forEach` não devolve nada — você teria que acumular numa variável de fora, que é justamente o que o `reduce` evita.',
        hints: [
          'Quantos valores você quer no fim: uma lista, ou um número só?',
          '`map` devolve uma lista do mesmo tamanho; `filter`, uma lista menor. Nenhum dos dois devolve um número só.',
          'O método que junta a lista inteira num valor único carrega um acumulador de volta em volta — como o `let total = 0` antes de um `for`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-8-lacuna-reduce',
        type: 'fill-blank',
        prompt:
          'Complete o `reduce` para somar os preços. Preste atenção no valor inicial — é ele que define o que acontece com uma lista vazia.',
        concepts: ['arrays'],
        difficulty: 'intermediario',
        tags: ['javascript', 'arrays'],
        template: `function totalDoCarrinho(itens) {
  return itens.reduce((soma, item) => soma {{1}} item.preco, {{2}});
}`,
        blanks: [
          { placeholder: 'operação', size: 3 },
          { placeholder: 'início', size: 3 },
        ],
        tests: [
          {
            description: 'soma os preços de três itens',
            assertion: `
              const t = totalDoCarrinho([{ preco: 10 }, { preco: 5 }, { preco: 2 }]);
              if (t !== 17) throw new Error("Esperava 17, veio " + JSON.stringify(t) + ".");
            `,
          },
          {
            description: 'carrinho vazio custa 0, e não quebra',
            assertion: `
              let t;
              try { t = totalDoCarrinho([]); }
              catch (e) { throw new Error("Com lista vazia o reduce lançou erro. Sem valor inicial ele não tem por onde começar."); }
              if (t !== 0) throw new Error("Esperava 0, veio " + JSON.stringify(t) + ".");
            `,
          },
        ],
        properties: [
          {
            description: 'o total é sempre a soma dos preços',
            generate: `
              const n = Math.floor(rnd() * 8);
              const itens = [];
              for (let i = 0; i < n; i++) itens.push({ preco: Math.floor(rnd() * 100) });
              return { itens };
            `,
            check: `
              const esperado = caso.itens.reduce((s, i) => s + i.preco, 0);
              const obtido = totalDoCarrinho(caso.itens);
              if (obtido !== esperado) {
                throw new Error("com " + JSON.stringify(caso.itens) + " esperava " + esperado + ", veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        explanation:
          'O segundo argumento do `reduce` é o valor de partida do acumulador. Sem ele, o `reduce` usa o primeiro item da lista como início — e numa lista vazia não há primeiro item, então ele **lança erro**. Informar o valor inicial resolve o caso vazio de graça.',
        hints: [
          'O `reduce` chama a função uma vez por item: `soma` é o que já foi juntado, e `item` é o item da vez.',
          'A primeira lacuna é a conta que junta o acumulado com o preço do item.',
          'A segunda lacuna é por onde a soma começa: o número que não muda uma soma — o mesmo do `let total = ...` que você escreveria antes de um `for`.',
        ],
        solution: ['+', '0'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Encadear é montar uma linha de montagem

Como \`filter\` e \`map\` devolvem um array, a saída de um vira a entrada do próximo. Dá para ler a expressão como uma frase, de cima para baixo:

~~~javascript
const totalDosCaros = precos
  .filter((p) => p > 20)       // fique só com os caros
  .map((p) => p * 0.9)         // aplique o desconto
  .reduce((a, b) => a + b, 0); // some tudo
~~~

Cada etapa faz uma coisa e passa adiante. Comparado a um \`for\` com três \`if\` dentro, a diferença não é o tamanho — é que aqui dá para apagar uma linha e entender o que muda.

O custo: cada etapa cria um array novo. Para dezenas ou centenas de itens isso é irrelevante. Para milhões, um \`for\` único passa a valer mais — mas essa é uma decisão a tomar quando o problema aparecer, com medição, não por precaução.

## O erro que todo mundo comete com \`map\`

~~~javascript
[1, 2, 3].map((n) => n * 2);       // [2, 4, 6]
[1, 2, 3].map((n) => { n * 2 });   // [undefined, undefined, undefined]
~~~

A diferença é só um par de chaves. Sem chaves, a seta **devolve** a expressão. Com chaves, ela abre um corpo de função comum — e um corpo sem \`return\` devolve \`undefined\`.

O sintoma é sempre o mesmo: um array do tamanho certo, cheio de \`undefined\`. Quando vir isso, procure o \`return\` que falta.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-8-prever-armadilhas',
        type: 'predict-output',
        prompt: 'O que este programa imprime, nas três linhas? Duas delas são armadilhas clássicas.',
        concepts: ['arrays', 'funcoes'],
        difficulty: 'intermediario',
        tags: ['javascript', 'arrays'],
        code: `const numeros = [1, 2, 3];

const dobrados = numeros.map((n) => { n * 2 });
console.log(dobrados);

const grandes = numeros.filter((n) => n > 10);
console.log(grandes.length);
console.log(grandes ? 'achei' : 'nada');`,
        expectedOutput: "[undefined,undefined,undefined]\n0\nachei",
        explanation:
          'Duas armadilhas. A primeira: as chaves em `(n) => { n * 2 }` transformam a seta num corpo de função comum, e sem `return` cada item vira `undefined` — o array mantém o tamanho, mas perde o conteúdo. A segunda: `filter` **sempre** devolve um array, e um array vazio é um valor verdadeiro em JavaScript. Por isso a condição passa mesmo sem nenhum resultado. Para perguntar "achei algum?", compare `length` com zero, ou use `some`.',
        hints: [
          'São duas armadilhas separadas: uma no `map`, outra na última linha.',
          'No `map`, a seta tem chaves e nenhum `return`. O que uma função assim devolve, para cada item?',
          'O `filter` não achou ninguém maior que 10 e devolveu `[]`. Um array vazio, numa condição, conta como verdadeiro ou como falso?',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Os primos de \`filter\`

Quando a pergunta não é "quais itens?" mas "existe algum?" ou "qual é o primeiro?", existem métodos mais diretos:

| Pergunta | Método | Devolve |
|---|---|---|
| Qual é o primeiro que serve? | \`find\` | o **item**, ou \`undefined\` |
| Em que posição ele está? | \`findIndex\` | o índice, ou \`-1\` |
| Existe algum que sirva? | \`some\` | \`true\` / \`false\` |
| Todos servem? | \`every\` | \`true\` / \`false\` |
| Contém exatamente este valor? | \`includes\` | \`true\` / \`false\` |

A diferença entre \`find\` e \`filter\` é a que mais causa bug. \`filter\` devolve **sempre** um array — e um array vazio é verdadeiro em JavaScript:

~~~javascript
if (usuarios.filter((u) => u.admin)) {   // sempre entra, mesmo sem admin nenhum
  ...
}
~~~

\`find\` devolve o item ou \`undefined\`, então a condição diz o que parece dizer. E \`some\` é a escolha quando você só quer o sim ou não — ele para no primeiro que serve, em vez de percorrer a lista inteira.

Um detalhe de \`every\`: numa lista vazia ele devolve \`true\`. Faz sentido logicamente — não há nenhum item que desobedeça —, mas surpreende quem espera \`false\`. É mais um caso de borda para a lista da aula de casos extremos.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-8-find-ou-filter',
        type: 'multiple-choice',
        prompt:
          'Você quer o primeiro usuário com email confirmado, e só quer agir se existir algum. Qual código está correto?',
        concepts: ['arrays', 'condicoes'],
        difficulty: 'intermediario',
        tags: ['javascript', 'arrays'],
        options: [
          'if (usuarios.filter(u => u.confirmado)) { avisar(); }',
          'const u = usuarios.find(x => x.confirmado); if (u) { avisar(u); }',
          'if (usuarios.find(u => u.confirmado).nome) { avisar(); }',
          'if (usuarios.some(u => u.confirmado)) { avisar(usuarios[0]); }',
        ],
        correctIndex: 1,
        explanation:
          '`find` devolve o item ou `undefined`, que é exatamente o que a condição precisa saber. A primeira opção nunca funciona: `filter` sempre devolve um array, e `[]` é verdadeiro — o `avisar()` roda mesmo sem nenhum usuário confirmado. A terceira quebra com `TypeError` quando ninguém está confirmado, porque tenta ler `.nome` de `undefined`. A quarta confirma que existe alguém, mas depois usa `usuarios[0]`, que pode ser justamente um não confirmado.',
        hints: [
          'São duas perguntas: existe alguém confirmado? E quem é? A opção certa precisa acertar as duas.',
          'O que `filter` devolve quando ninguém corresponde? Esse valor é verdadeiro ou falso numa condição?',
          'Uma opção lê `.nome` de algo que pode ser `undefined`; outra confirma que existe alguém, mas depois usa outro usuário. Sobra a que guarda o item achado antes de usar.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-8-refatorar-laco',
        type: 'refactor',
        prompt:
          'Este código **já funciona** — todos os testes passam antes de você tocar nele.\n\nReescreva usando os métodos da aula, mantendo os testes verdes. Os testes são o contrato do comportamento: se algum deles ficar vermelho, a reescrita mudou o que o código faz, e isso não é refatorar.',
        concepts: ['arrays', 'funcoes'],
        difficulty: 'intermediario',
        tags: ['javascript', 'arrays', 'refatoracao'],
        initialCode: `function nomesDosCaros(produtos) {
  const saida = [];

  for (let i = 0; i < produtos.length; i++) {
    if (produtos[i].preco > 100) {
      saida.push(produtos[i].nome);
    }
  }

  return saida;
}`,
        constraints: [
          { description: 'Sem laço manual', forbidden: 'for (' },
          { description: 'Sem empurrar item por item', forbidden: '.push(' },
          { description: 'Selecione com filter', required: '.filter(' },
          { description: 'Transforme com map', required: '.map(' },
        ],
        tests: [
          {
            description: 'devolve os nomes dos produtos acima de 100',
            assertion: `
              const r = nomesDosCaros([
                { nome: 'mesa', preco: 250 },
                { nome: 'caneta', preco: 5 },
                { nome: 'cadeira', preco: 400 },
              ]);
              if (r.join(',') !== 'mesa,cadeira') throw new Error("Esperava ['mesa', 'cadeira'], veio [" + r.join(', ') + "].");
            `,
          },
          {
            description: 'mantém a ordem original',
            assertion: `
              const r = nomesDosCaros([
                { nome: 'z', preco: 200 },
                { nome: 'a', preco: 300 },
              ]);
              if (r.join(',') !== 'z,a') throw new Error("A ordem da lista original precisa ser preservada. Veio [" + r.join(', ') + "].");
            `,
          },
          {
            description: 'lista vazia devolve lista vazia',
            assertion: `const r = nomesDosCaros([]); if (!Array.isArray(r) || r.length !== 0) throw new Error("Esperava [], veio " + JSON.stringify(r) + ".");`,
            hidden: true,
          },
          {
            description: 'exatamente 100 não conta como caro',
            assertion: `
              const r = nomesDosCaros([{ nome: 'x', preco: 100 }]);
              if (r.length !== 0) throw new Error("A regra é ACIMA de 100, e 100 não está acima de 100. Veio [" + r.join(', ') + "].");
            `,
            hidden: true,
          },
          {
            description: 'a lista recebida não é alterada',
            assertion: `
              const original = [{ nome: 'mesa', preco: 250 }, { nome: 'caneta', preco: 5 }];
              nomesDosCaros(original);
              if (original.length !== 2) throw new Error("A lista recebida encolheu de 2 para " + original.length + " itens.");
            `,
            hidden: true,
          },
        ],
        hints: [
          'Duas intenções estão misturadas no mesmo laço: escolher alguns produtos, e pegar um campo de cada um.',
          'Separe as duas: primeiro fique só com os caros, depois transforme cada um no nome.',
          'A saída do primeiro método é a entrada do segundo — dá para encadear numa linha.',
          'return produtos.filter((p) => p.preco > 100).map((p) => p.nome);',
        ],
        solution: `function nomesDosCaros(produtos) {
  return produtos.filter((p) => p.preco > 100).map((p) => p.nome);
}`,
        explanation:
          'O laço original faz duas coisas ao mesmo tempo, e quem lê precisa desmontá-lo mentalmente para descobrir quais. A versão encadeada declara as duas intenções na ordem em que acontecem: **filtrar**, depois **transformar**.\n\nRepare no que não mudou: nenhum teste. É essa a definição de refatorar — o comportamento é o contrato, e os testes existem justamente para você poder mexer na forma sem medo.',
      },
    },
    {
      kind: 'summary',
      markdown: `Os três métodos funcionam do mesmo jeito: **você escreve uma função para um item só, e o método a chama uma vez para cada item** — o parâmetro recebe o item da vez. \`map\` transforma (a função devolve o item novo), \`filter\` seleciona (a função devolve \`true\` para quem fica) e \`reduce\` junta tudo num valor (a função devolve o acumulador da próxima volta, que começa no valor inicial). Nenhum dos três altera o array original. Duas armadilhas para guardar: chaves no corpo da seta sem \`return\` produzem um array cheio de \`undefined\`, e \`filter\` devolve sempre um array — inclusive o vazio, que é verdadeiro numa condição. Quando a pergunta é "existe algum?", use \`some\`; quando é "qual é o primeiro?", use \`find\`.`,
    },
  ],
};

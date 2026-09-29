import type { Lesson } from '../types';

export const lessonObjetos: Lesson = {
  id: 'lesson-js-7',
  trackId: 'track-js-fundamentos',
  title: 'Objetos: Dados com Nome',
  language: 'javascript',
  objective: 'Agrupar informações relacionadas numa estrutura só, acessada por nome em vez de posição.',
  concepts: ['objetos', 'variaveis'],
  status: 'published',
  estimatedMinutes: 20,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um array guarda uma lista e você acessa pela **posição**. Mas posição é um péssimo jeito de lembrar o que é cada coisa: em \`["Ana", 28, "ana@email.com"]\`, o que era a posição 1 mesmo?

Um **objeto** é uma ficha com etiquetas. Cada informação fica guardada sob um nome:

~~~javascript
const usuario = {
  nome: 'Ana',    // chave: nome    valor: 'Ana'
  idade: 28,      // chave: idade   valor: 28
};
~~~

Cada linha é um par **chave: valor**, separado do próximo por vírgula. A chave é a etiqueta; o valor é o que fica guardado nela.

## Ler: objeto, ponto, chave

~~~javascript
console.log(usuario.nome);    // 'Ana'
console.log(usuario.idade);   // 28
~~~

Leia \`usuario.nome\` como "o nome do usuário". O código passa a dizer o que faz — \`usuario.idade\` se entende sozinho; \`dados[1]\` exige memória ou um comentário.

## Mudar e acrescentar: a mesma escrita, com \`=\`

~~~javascript
usuario.idade = 29;                // a chave existe: o valor muda
usuario.email = 'ana@email.com';   // a chave não existe: é criada agora
~~~

Repare que \`usuario\` foi declarado com \`const\` e mesmo assim mudou por dentro. O \`const\` impede trocar o objeto inteiro (\`usuario = outraCoisa\`), não mexer nas chaves dele.

## Chave que não existe: \`undefined\`, sem erro

~~~javascript
console.log(usuario.telefone);   // undefined
~~~

O JavaScript não avisa que a chave não existe: devolve \`undefined\` e segue. Um nome de chave digitado errado (\`usuario.nmoe\`) passa despercebido do mesmo jeito — quando um valor vier \`undefined\` sem motivo, confira primeiro a grafia da chave.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-7-prever-mudar',
        type: 'predict-output',
        prompt: 'O que este código imprime?',
        concepts: ['objetos'],
        difficulty: 'iniciante',
        tags: ['javascript', 'objetos'],
        code: `const carro = { modelo: 'Gol', ano: 2010 };

carro.ano = 2015;
carro.cor = 'azul';

console.log(carro.ano);
console.log(carro.cor);`,
        expectedOutput: '2015\nazul',
        explanation:
          '`carro.ano = 2015` troca o valor de uma chave que já existia; `carro.cor = \'azul\'` cria uma chave nova. As duas usam a mesma escrita — objeto, ponto, chave, `=`. E o `const` não impede nada disso: ele trava a variável `carro` (não dá para fazer `carro = {}`), não o que está dentro do objeto.',
        hints: [
          'Leia de cima para baixo: o objeto muda antes de qualquer `console.log` rodar.',
          '`carro.ano = 2015` troca o valor de uma chave que já existe. E `carro.cor = ...`, numa chave que ainda não existe?',
          'Quando a chave não existe, o `=` cria a chave com aquele valor. O `const` não impede mudar o que está dentro do objeto.',
        ],
      },
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
          'Compare as chaves que o objeto tem com as chaves que o código lê.',
          'O objeto só tem a chave `tema`. A segunda linha lê uma chave que nunca foi criada.',
          'Ler uma chave que não existe não dá erro: devolve o valor que significa "nada aqui". Qual é ele?',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Quando o nome da chave está numa variável

Às vezes você só descobre **qual** chave ler quando o programa roda — ela vem de uma escolha do usuário, de um formulário, do parâmetro de uma função. Aí o nome da chave está guardado numa variável:

~~~javascript
const usuario = { nome: 'Ana', email: 'ana@email.com' };
const campo = 'email';

console.log(usuario[campo]);   // 'ana@email.com'
console.log(usuario.campo);    // undefined
~~~

As duas linhas parecem iguais e fazem coisas diferentes:

| Escrita | O que o JavaScript procura |
|---|---|
| \`usuario.campo\` | uma chave chamada **"campo"**, com essas letras — o ponto nunca lê variável |
| \`usuario[campo]\` | primeiro olha **o que tem dentro** da variável \`campo\` (\`'email'\`), e procura essa chave |

A regra prática: **ponto** quando você sabe o nome da chave enquanto escreve o código; **colchete** quando o nome está numa variável.

Com aspas, o colchete também aceita um nome fixo — \`usuario['nome']\` é o mesmo que \`usuario.nome\`. É o jeito de ler uma chave com espaço ou hífen, que o ponto não aceita: \`config['modo-escuro']\`.
`.trim(),
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
          'O nome do campo não está escrito no código: ele chega na variável `campo`, e muda a cada chamada.',
          'O ponto procuraria uma chave chamada literalmente "campo". Qual das duas escritas olha o valor guardado dentro da variável?',
          'Logo depois de `objeto`, abra um colchete, escreva dentro o nome da variável (sem aspas) e feche o colchete.',
        ],
        solution: ['[campo]'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-7-achar-ponto',
        type: 'find-bug',
        prompt:
          'Este programa quebra com `TypeError: Cannot read properties of undefined (reading \'toUpperCase\')`.\n\nAponte a linha que precisa mudar.',
        concepts: ['objetos'],
        difficulty: 'iniciante',
        tags: ['javascript', 'objetos', 'depuracao'],
        code: `const traducoes = { ola: "hello", tchau: "bye", obrigado: "thanks" };

function traduzir(palavra) {
  const traducao = traducoes.palavra;
  return traducao.toUpperCase();
}

console.log(traduzir("ola"));`,
        buggyLine: 4,
        fix: '  const traducao = traducoes[palavra];',
        symptomLine: 5,
        symptomFeedback:
          'É aqui que o erro aparece, mas esta linha só recebeu `undefined` e tentou usar. A pergunta é de onde veio esse `undefined` — e ele veio da linha de cima, que procurou a tradução no lugar errado.',
        explanation:
          '`traducoes.palavra` procura uma propriedade chamada literalmente **"palavra"** — o ponto não lê a variável, lê o nome que vem depois dele. Como o objeto não tem essa chave, o resultado é `undefined`, sem erro nenhum; o erro só aparece na linha seguinte, quando alguém tenta chamar um método nele.\n\nQuando o nome da propriedade está numa variável, a sintaxe é a de colchetes: `traducoes[palavra]`. É a única forma de o JavaScript usar o **valor** de `palavra` como chave.',
        hints: [
          'O erro aparece numa linha, mas o `undefined` que o causou foi produzido antes. De onde vem o valor de `traducao`?',
          'O objeto tem as chaves `ola`, `tchau` e `obrigado`. A linha que busca a tradução está procurando qual chave, de verdade?',
          'O nome da chave está guardado na variável `palavra`. O ponto não lê variável — qual escrita lê?',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
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
~~~

Um acesso longo se lê **da esquerda para a direita, um passo de cada vez** — cada passo parte do resultado do anterior:

~~~javascript
pedido                     // o objeto inteiro
pedido.itens               // a lista de itens
pedido.itens[0]            // o primeiro item: { produto: 'Pão', quantidade: 2 }
pedido.itens[0].produto    // 'Pão'
~~~

Nada de novo aqui: são o ponto dos objetos e o índice dos arrays, em camadas. O que muda é que cada passo é uma chance a mais de encontrar \`undefined\`.

## O erro mais comum do JavaScript

Se um passo do meio dá \`undefined\`, o passo seguinte quebra:

~~~javascript
pedido.entrega;          // undefined — a chave não existe, sem erro
pedido.entrega.rua;      // TypeError: Cannot read properties of undefined (reading 'rua')
~~~

O erro não é sobre \`rua\`: é que \`pedido.entrega\` já era \`undefined\`, e \`undefined\` não tem chave nenhuma. A mensagem diz qual leitura falhou (\`reading 'rua'\`) — o problema está **um passo antes** dela.

A proteção é o **encadeamento opcional**, \`?.\`:

~~~javascript
pedido.entrega?.rua;     // undefined, sem quebrar
~~~

O \`?.\` olha o lado esquerdo antes de continuar: se for \`undefined\` (ou \`null\`), ele para ali e devolve \`undefined\`, em vez de tentar ler \`rua\` de nada.
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

console.log(produto.fabricante?.nome);     // undefined — o ?. parou antes de quebrar`,
      caption:
        'produto.cor devolve undefined em silêncio. O erro só estoura quando você tenta ler algo DENTRO de undefined.',
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
          'Vá linha por linha. Cada linha é independente, e o programa só para se alguma lançar erro.',
          '`pedido.entrega` não existe. Ler uma chave inexistente dá erro, ou devolve algo?',
          'Na última linha, o `?.` olha o lado esquerdo antes de continuar: se for `undefined`, ele para ali e devolve `undefined` em vez de quebrar.',
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
  // 1. Descubra a cidade — cuidado: nem toda pessoa tem endereco.
  // 2. Monte o texto "nome, idade anos, cidade" e retorne.
}

console.log(descrever({ nome: "Ana", idade: 28, endereco: { cidade: "São Paulo" } }));
console.log(descrever({ nome: "Bruno", idade: 35 }));
`,
        hints: [
          'Separe em duas partes: primeiro descobrir a cidade, depois montar o texto.',
          'O Bruno não tem `endereco`, então `pessoa.endereco.cidade` quebra nele. Pergunte se `pessoa.endereco` existe antes de descer até a cidade.',
          'Guarde a cidade numa variável com um ternário: se `pessoa.endereco` existe, a cidade dele; senão, "cidade não informada". Depois junte `pessoa.nome`, ", ", `pessoa.idade`, " anos, " e a cidade com `+`.',
          'const cidade = pessoa.endereco ? pessoa.endereco.cidade : "cidade não informada";\nreturn pessoa.nome + ", " + pessoa.idade + " anos, " + cidade;',
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
      kind: 'prose',
      markdown: `
## Desestruturação: extrair campos numa linha só

Ler vários campos do mesmo objeto, um por um, repete o nome do objeto várias vezes:

~~~javascript
const usuario = { nome: 'Ana', idade: 28, email: 'ana@email.com' };

const nome = usuario.nome;
const idade = usuario.idade;
~~~

A **desestruturação** faz as duas atribuições numa linha, casando o nome de cada variável com a chave de mesmo nome:

~~~javascript
const { nome, idade } = usuario;
// é o mesmo que:  const nome = usuario.nome;  const idade = usuario.idade;

console.log(nome);   // 'Ana'
console.log(idade);  // 28
~~~

\`{ nome, idade }\` do lado esquerdo não cria um objeto novo — é a sintaxe da desestruturação, que só existe nesse lugar (depois de \`const\`/\`let\`, ou como parâmetro de função). Uma chave que não existe no objeto vira \`undefined\`, do mesmo jeito que \`usuario.telefone\` seria:

~~~javascript
const { telefone } = usuario;
console.log(telefone);   // undefined — sem erro
~~~

Funciona também direto no parâmetro de uma função — muito comum ao receber um objeto:

~~~javascript
function saudar({ nome, idade }) {
  return 'Olá, ' + nome + ', ' + idade + ' anos';
}

saudar(usuario);   // 'Olá, Ana, 28 anos' — sem precisar de usuario.nome dentro da função
~~~
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-7-prever-desestruturar',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['objetos'],
        difficulty: 'iniciante',
        tags: ['javascript', 'objetos', 'desestruturacao'],
        code: `const pedido = { id: 42, total: 99.9, cliente: 'Ana' };

const { id, cupom } = pedido;

console.log(id);
console.log(cupom);`,
        expectedOutput: '42\nundefined',
        explanation:
          '`id` casa com a chave `id` do objeto, e recebe `42`. `cupom` não existe em `pedido` — a desestruturação de uma chave ausente devolve `undefined`, do mesmo jeito que `pedido.cupom` devolveria.',
        hints: [
          '`const { id, cupom } = pedido` cria duas variáveis, cada uma com o valor da chave de mesmo nome em `pedido`.',
          'A chave `id` existe em `pedido`. E a chave `cupom`?',
          'Desestruturar uma chave que não existe é como ler `pedido.cupom`: não dá erro, e o valor é o de uma chave inexistente.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-7-desestruturar',
        type: 'refactor',
        prompt:
          'Reescreva `resumo(produto)` usando **desestruturação** no parâmetro (em vez de `produto.nome` e `produto.preco` no corpo), para devolver `"Caderno: R$ 12.5"`. Os testes continuam os mesmos — só a forma de acessar os campos muda.',
        concepts: ['objetos'],
        difficulty: 'intermediario',
        tags: ['javascript', 'objetos', 'desestruturacao'],
        initialCode: `function resumo(produto) {
  return produto.nome + ': R$ ' + produto.preco;
}`,
        constraints: [
          { description: 'Sem `produto.`', forbidden: 'produto.' },
          { description: 'Usa desestruturação no parâmetro', required: '{ nome' },
        ],
        hints: [
          'Só muda o jeito de receber o objeto: em vez de um nome para o objeto inteiro, a função recebe já os campos que usa.',
          'No lugar do parâmetro `produto`, escreva entre chaves os nomes das duas chaves que o corpo lê.',
          'Com o parâmetro `{ nome, preco }`, o corpo usa `nome` e `preco` direto, sem `produto.` na frente.',
          "function resumo({ nome, preco }) {\n  return nome + ': R$ ' + preco;\n}",
        ],
        tests: [
          {
            description: 'resumo funciona com o desestruturado no parâmetro',
            assertion: `const r = resumo({ nome: 'Caderno', preco: 12.5 }); if (r !== 'Caderno: R$ 12.5') throw new Error("Esperava 'Caderno: R$ 12.5', veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'funciona com outro produto',
            assertion: `const r = resumo({ nome: 'Caneta', preco: 2 }); if (r !== 'Caneta: R$ 2') throw new Error("Esperava 'Caneta: R$ 2', veio " + JSON.stringify(r) + ".");`,
          },
        ],
        solution: `function resumo({ nome, preco }) {
  return nome + ': R$ ' + preco;
}`,
        explanation:
          'Trocar o parâmetro `produto` por `{ nome, preco }` extrai os dois campos direto na entrada da função — o corpo passa a usar `nome` e `preco` como variáveis normais, sem repetir `produto.` em cada acesso. O comportamento não muda: os mesmos testes que passavam antes continuam passando, só a forma de acessar os campos é outra.',
      },
    },
    {
      kind: 'summary',
      markdown: `Objetos guardam dados por **nome**, não por posição: \`objeto.chave\` lê, \`objeto.chave = valor\` muda ou cria. Quando o nome da chave está numa variável, use colchete — \`objeto[variavel]\` —, porque o ponto procura a chave com aquelas letras. Chave inexistente devolve \`undefined\` em silêncio, e o erro só estoura quando você tenta ler algo **dentro** desse \`undefined\`: leia acessos longos um passo de cada vez, e use \`?.\` onde um passo pode faltar. A desestruturação (\`const { chave } = objeto\`) extrai campos numa linha só, e funciona também direto num parâmetro de função.`,
    },
  ],
};

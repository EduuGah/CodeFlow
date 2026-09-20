import type { Lesson } from '../types';

export const lessonTiparApi: Lesson = {
  id: 'lesson-ts-8',
  trackId: 'track-typescript',
  title: 'Tipar uma API: O que Vem de Fora',
  language: 'typescript',
  objective:
    'Tratar o que chega de fora — JSON, formulário, armazenamento — como unknown, validar na fronteira com uma função de guarda, e só então deixar o tipo entrar no programa.',
  concepts: ['ts-api'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Tudo o que você tipou até aqui foi escrito por você. O compilador confere porque **viu** o valor. Mas a maior parte dos dados de um programa real vem de fora: a resposta de uma API, o \`localStorage\`, um formulário. O compilador não viu nada disso — e é aqui que os tipos mais mentem.

~~~typescript
const usuario = JSON.parse(texto);   // any
console.log(usuario.nome.toUpperCase());
~~~

\`JSON.parse\` devolve \`any\`, porque o TypeScript não tem como saber o que está no texto. E \`any\` deixa \`usuario.nome.toUpperCase()\` compilar. Se o servidor mandou \`{ "name": "Ana" }\` (em inglês), ou \`{ "nome": 5 }\`, ou \`null\`, o erro estoura em execução, na frente do usuário — com o compilador tendo dito que estava tudo certo.

## \`unknown\`: o \`any\` honesto

~~~typescript
const dados: unknown = JSON.parse(texto);
dados.nome;                 // recusado: 'dados' is of type 'unknown'
~~~

\`unknown\` também aceita qualquer valor. A diferença é o que ele deixa fazer depois: **nada**, até você estreitar. É o tipo certo para "não sei o que é isto" — e a resposta de uma API é exatamente isso.

## Validar na fronteira

Estreitar \`unknown\` é conferir, em execução, o que o tipo promete:

~~~typescript
interface Usuario {
  nome: string;
  idade: number;
}

function ehUsuario(valor: unknown): valor is Usuario {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'nome' in valor && typeof valor.nome === 'string' &&
    'idade' in valor && typeof valor.idade === 'number'
  );
}
~~~

O retorno \`valor is Usuario\` faz desta função uma **guarda de tipo**: quando ela devolve \`true\`, o compilador estreita o argumento para \`Usuario\` em quem chamou.

~~~typescript
const dados: unknown = JSON.parse(texto);

if (ehUsuario(dados)) {
  console.log(dados.nome.toUpperCase());   // dados é Usuario aqui
} else {
  console.log('resposta inesperada');
}
~~~

É o padrão inteiro: \`unknown\` na entrada, uma guarda que confere de verdade, e o tipo só existe **depois** da guarda. A verificação roda uma vez, na fronteira; dali para dentro, o compilador cuida.

Cada linha da guarda é uma pergunta que \`typeof\` e \`in\` respondem em execução: é objeto? não é \`null\` (que também é \`"object"\`)? tem \`nome\`? é texto? O compilador acompanha cada uma e estreita passo a passo — repare que \`valor.nome\` só compila depois de \`'nome' in valor\`.

## \`as\`: o atalho que mente

~~~typescript
const usuario = JSON.parse(texto) as Usuario;
~~~

\`as\` é uma **asserção**: "confie em mim, é um Usuario". O compilador confia — e não confere nada. É o \`any\` com um nome bonito. Se o JSON vier diferente, o erro estoura em execução, na linha que o compilador aprovou.

\`as\` tem lugar: quando você sabe algo que o compilador não tem como provar e **não pode** validar (\`document.getElementById('email') as HTMLInputElement\`). Numa resposta de rede, você pode validar. Então valide.

## Onde a fronteira fica

\`fetch\` e \`response.json()\` (a próxima trilha), \`JSON.parse\`, \`localStorage.getItem\` (que devolve \`string | null\`), o \`FormData\`, o \`event.target\`. Toda vez que um valor entra no programa vindo de um lugar que o compilador não vê, ele é \`unknown\` — mesmo que a API diga \`any\` — e passa por uma guarda.

Em projetos maiores isso vira biblioteca (Zod, por exemplo, que declara a forma uma vez e gera a guarda e o tipo). O mecanismo por baixo é este.
`.trim(),
    },
    {
      kind: 'example',
      language: 'typescript',
      code: `interface Produto {
  nome: string;
  preco: number;
}

function ehProduto(valor: unknown): valor is Produto {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'nome' in valor && typeof valor.nome === 'string' &&
    'preco' in valor && typeof valor.preco === 'number'
  );
}

function lerProdutos(texto: string): Produto[] {
  const dados: unknown = JSON.parse(texto);
  if (!Array.isArray(dados)) return [];
  return dados.filter(ehProduto);   // só o que passa na guarda entra
}

const resposta = '[{"nome":"Caneta","preco":3.5},{"nome":"Erro","preco":"grátis"},{"name":"Lápis"}]';
const produtos = lerProdutos(resposta);

console.log(produtos.length);           // 1
console.log(produtos[0].preco * 2);     // 7`,
      caption:
        'A resposta veio com três itens e só um está certo. `lerProdutos` devolve `Produto[]` de verdade: cada item passou pela guarda, e `produtos[0].preco * 2` é seguro. Sem a guarda, o segundo item daria `"grátis" * 2 = NaN` num carrinho.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-8-unknown',
        type: 'multiple-choice',
        prompt: 'Qual é a diferença entre `unknown` e `any`?',
        concepts: ['ts-api'],
        difficulty: 'iniciante',
        tags: ['typescript', 'unknown'],
        options: [
          '`unknown` só aceita objetos; `any` aceita tudo',
          'Os dois aceitam qualquer valor; `any` deixa fazer qualquer coisa com ele, `unknown` não deixa fazer nada até você estreitar',
          '`unknown` é `any` em modo estrito — a mesma coisa com outro nome',
          '`any` é verificado em execução; `unknown`, em compilação',
        ],
        correctIndex: 1,
        explanation:
          'Na entrada são iguais: qualquer valor cabe nos dois. Na saída são opostos. `any` desliga o compilador — `x.foo.bar()` compila. `unknown` o liga no máximo — nem `x.foo` compila, até um `typeof`, um `in` ou uma guarda provar o que `x` é. Para o que vem de fora, `unknown` é a única resposta honesta.',
        hints: ['Pense no que acontece na linha seguinte à declaração, quando você tenta usar o valor.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-8-prever',
        type: 'predict-output',
        prompt: 'O que este programa imprime? `JSON.parse` devolve `any`, então tudo compila — inclusive o que não existe.',
        concepts: ['ts-api'],
        difficulty: 'iniciante',
        tags: ['typescript', 'unknown'],
        code: `const dados = JSON.parse('{"nome":"Ana","idade":30}');

console.log(typeof dados);
console.log(dados.nome, dados.idade);
console.log(dados.email);
console.log(typeof dados.telefone);`,
        expectedOutput: 'object\nAna 30\nundefined\nundefined',
        explanation:
          'O texto vira um objeto com `nome` e `idade`. `dados.email` não existe: `undefined`, sem erro nenhum — e `typeof undefined` é `"undefined"`. O compilador aceitou as quatro linhas sem reclamar porque `dados` é `any`. Com `const dados: unknown`, as três últimas não compilariam, e você seria obrigado a conferir o que veio.',
        hints: ['Ler uma propriedade que não existe num objeto não lança. O que devolve?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-8-guarda',
        type: 'code',
        prompt:
          'Escreva a guarda `ehProduto(valor: unknown): valor is Produto`: devolve `true` só se `valor` é um objeto com `nome` texto e `preco` número. Os testes cobram os casos falsos (`null`, número, objeto sem `preco`, `preco` em texto) e que, depois de `if (ehProduto(x))`, o compilador aceite `x.nome` como texto.',
        concepts: ['ts-api'],
        difficulty: 'intermediario',
        tags: ['typescript', 'unknown', 'guarda'],
        initialCode: `interface Produto {
  nome: string;
  preco: number;
}

function ehProduto(valor: unknown): boolean {
  return false;
}
`,
        tests: [
          {
            description: 'um produto válido passa',
            assertion: `if (ehProduto({ nome: 'Caneta', preco: 3.5 }) !== true) throw new Error("ehProduto({ nome: 'Caneta', preco: 3.5 }) deveria ser true.");`,
          },
          {
            description: 'null, número e texto não passam',
            assertion: `for (const v of [null, 5, 'caneta', undefined]) { if (ehProduto(v) !== false) throw new Error('ehProduto(' + JSON.stringify(v) + ') deveria ser false.'); }`,
          },
          {
            description: 'objeto sem preco não passa',
            assertion: `if (ehProduto({ nome: 'Caneta' }) !== false) throw new Error("ehProduto({ nome: 'Caneta' }) deveria ser false: falta preco.");`,
          },
          {
            description: 'preco em texto não passa',
            assertion: `if (ehProduto({ nome: 'Caneta', preco: '3,50' }) !== false) throw new Error("ehProduto({ nome: 'Caneta', preco: '3,50' }) deveria ser false: preco é texto.");`,
          },
          {
            description: 'propriedades a mais não atrapalham',
            assertion: `if (ehProduto({ nome: 'Caneta', preco: 3.5, cor: 'azul' }) !== true) throw new Error('Um objeto com uma propriedade a mais ainda é um produto.');`,
          },
        ],
        typeTests: [
          {
            description: 'depois da guarda, o compilador aceita x.nome como texto',
            code: `const x: unknown = JSON.parse('{}');
if (ehProduto(x)) { const n: string = x.nome; const p: number = x.preco; }`,
          },
        ],
        hints: [
          'O retorno precisa ser `valor is Produto` — é isso que faz o compilador estreitar em quem chama.',
          'Em ordem: é objeto? não é null? tem `nome`? é texto? tem `preco`? é número? Cada pergunta é um `typeof` ou um `in`, unidas por `&&`.',
        ],
        solution: `interface Produto {
  nome: string;
  preco: number;
}

function ehProduto(valor: unknown): valor is Produto {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'nome' in valor && typeof valor.nome === 'string' &&
    'preco' in valor && typeof valor.preco === 'number'
  );
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-8-lacuna-fronteira',
        type: 'fill-blank',
        prompt: 'Complete a fronteira: o tipo do que chega do `JSON.parse`, e a verificação de que a propriedade existe antes de ler.',
        concepts: ['ts-api'],
        difficulty: 'iniciante',
        tags: ['typescript', 'unknown'],
        template: `const texto = '{"nome":"Ana"}';
const dados: {{1}} = JSON.parse(texto);

let nome = 'visitante';
if (typeof dados === 'object' && dados !== null && {{2}} in dados && typeof dados.nome === 'string') {
  nome = dados.nome;
}

console.log(nome);`,
        blanks: [
          { placeholder: 'tipo', size: 8 },
          { placeholder: 'chave', size: 7 },
        ],
        tests: [
          {
            description: "o nome lido é 'Ana'",
            assertion: `if (nome !== 'Ana') throw new Error("nome deveria ser 'Ana', veio '" + nome + "'.");`,
          },
        ],
        typeTests: [
          { description: 'fora da verificação, ler dados.nome é recusado', code: 'console.log(dados.nome);', rejects: true },
          { description: 'fora da verificação, chamar um método em dados é recusado', code: 'dados.toString();', rejects: true },
        ],
        hints: [
          'O tipo honesto para "não sei o que é": aceita tudo e não deixa usar nada.',
          'O operador `in` recebe o nome da propriedade como texto, entre aspas.',
        ],
        solution: ['unknown', "'nome'"],
        explanation:
          '`unknown` é o que faz as duas recusas acontecerem: fora do `if`, `dados` não tem propriedade nem método nenhum para o compilador. Dentro, cada `&&` estreita um pouco — objeto, não nulo, tem `nome`, é texto — até `dados.nome` ser `string`. Com `any` no lugar, tudo compilaria, inclusive `dados.email.length` num JSON que não tem email.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-8-bug-as',
        type: 'find-bug',
        prompt:
          'Este programa **compila** e quebra em execução com `TypeError: usuario.nome.toUpperCase is not a function`. Aponte a linha que precisa mudar.',
        concepts: ['ts-api'],
        difficulty: 'intermediario',
        tags: ['typescript', 'unknown', 'depuracao'],
        code: `interface Usuario {
  nome: string;
}

function validar(valor: unknown): Usuario {
  if (typeof valor === 'object' && valor !== null && 'nome' in valor && typeof valor.nome === 'string') {
    return { nome: valor.nome };
  }
  return { nome: 'visitante' };
}

const texto = '{"nome": 5}';
const usuario = JSON.parse(texto) as Usuario;
console.log(usuario.nome.toUpperCase());`,
        buggyLine: 13,
        fix: 'const usuario = validar(JSON.parse(texto));',
        symptomLine: 14,
        symptomFeedback:
          'É onde o erro aparece: `toUpperCase` num `nome` que veio como número. Mas a linha está certa para um `Usuario` de verdade — o defeito é a linha de cima ter prometido um `Usuario` sem conferir.',
        explanation:
          '`as Usuario` diz ao compilador "confie em mim" — e ele confia: `usuario.nome.toUpperCase()` compila. O JSON trouxe `nome: 5`, e o método não existe em número. A função `validar` está ali para isso: recebe `unknown`, confere em execução, e devolve um `Usuario` garantido (ou um padrão). Com ela, o programa imprime `VISITANTE` em vez de quebrar. `as` numa resposta de fora é o `any` com nome bonito.',
        hints: [
          'O compilador aprovou o programa. Que linha o convenceu de algo que não foi conferido?',
          'Procure a palavra que faz o compilador confiar sem verificar.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-8-quando-as',
        type: 'multiple-choice',
        prompt: 'Em qual destes casos `as` é aceitável?',
        concepts: ['ts-api'],
        difficulty: 'intermediario',
        tags: ['typescript', 'unknown'],
        options: [
          '`JSON.parse(resposta) as Usuario` — para não escrever a guarda',
          '`document.getElementById(\'email\') as HTMLInputElement` — você sabe qual elemento é, e não há como o compilador provar; validar aqui não acrescenta segurança',
          '`(valor as any).qualquerCoisa` — para acessar uma propriedade que o tipo não tem',
          '`dados as number` — para somar um valor que veio de um formulário',
        ],
        correctIndex: 1,
        explanation:
          '`as` serve quando você sabe mais que o compilador **e** não pode validar de forma útil. O elemento do DOM é o caso clássico: o HTML é seu, o id é seu, e uma guarda ali só repetiria o que você já sabe. Nos outros três, o valor vem de fora ou o tipo está sendo forçado a mentir — o erro vai estourar em execução, exatamente onde o `as` prometeu que não. Resposta de API, formulário e JSON se validam.',
        hints: ['A pergunta é: dá para conferir em execução? Se dá, confira. Se não dá, e você sabe, `as`.'],
      },
    },
    {
      kind: 'summary',
      markdown: `O compilador só confere o que viu. O que vem de fora — JSON, rede, armazenamento, formulário — é \`unknown\`: aceita tudo e não deixa usar nada até você estreitar. Uma guarda (\`valor is Usuario\`) confere em execução, uma vez, na fronteira, e dali para dentro o tipo é garantido. \`as\` pula a conferência: só onde você sabe mais que o compilador e não pode validar.`,
    },
  ],
};

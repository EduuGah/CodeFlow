import type { Lesson } from '../types';

export const lessonInterfaces: Lesson = {
  id: 'lesson-ts-3',
  trackId: 'track-typescript',
  title: 'Interfaces: A Forma de um Objeto',
  language: 'typescript',
  objective:
    'Descrever a forma de um objeto com interface — propriedades, opcionais, somente leitura, aninhadas — e usar essa forma como contrato de função.',
  concepts: ['ts-interfaces'],
  status: 'published',
  estimatedMinutes: 26,
  blocks: [
    {
      kind: 'prose',
      markdown: `
\`number\`, \`string\`, \`boolean\` cobrem os valores simples. Mas a maior parte do que um programa carrega são **objetos**: um produto, um usuário, um pedido. Como se diz ao compilador o que um produto tem?

~~~typescript
interface Produto {
  nome: string;
  preco: number;
  emEstoque: boolean;
}

const caneta: Produto = { nome: 'Caneta', preco: 3.5, emEstoque: true };
~~~

Uma **interface** é a forma de um objeto: quais propriedades existem e de que tipo cada uma é. Depois de declarada, ela é um tipo como outro qualquer — serve numa variável, num parâmetro, numa lista (\`Produto[]\`).

E o compilador confere a forma inteira:

~~~typescript
// @recusado
interface Produto {
  nome: string;
  preco: number;
}

const a: Produto = { nome: 'Caneta' };                 // falta preco
const b: Produto = { nome: 'Caneta', preco: '3,50' };   // preco é texto
const c: Produto = { nome: 'Caneta', preco: 3.5, cor: 'azul' };  // cor não existe
~~~

O terceiro caso é o mais útil no dia a dia: um objeto escrito na hora **não pode ter propriedade a mais**. É assim que o compilador pega \`idoma\` no lugar de \`idioma\` — o erro de digitação que em JavaScript vira um \`undefined\` silencioso.

## Opcional e somente leitura

Nem toda propriedade existe sempre. O \`?\` marca as que podem faltar:

~~~typescript
interface Usuario {
  readonly id: number;
  nome: string;
  apelido?: string;
}
~~~

\`apelido?: string\` significa: pode não estar lá; quando está, é texto. Ao ler \`usuario.apelido\`, o compilador lembra disso — o tipo é \`string | undefined\`, e \`usuario.apelido.length\` é recusado até você conferir (\`if (usuario.apelido)\`). A próxima aula é inteira sobre esse conferir.

\`readonly\` marca o que não muda depois de criado: \`usuario.id = 2\` é recusado. O \`id\` de um registro é o caso clássico.

## Formas dentro de formas

Uma propriedade pode ser outra interface, ou uma lista dela:

~~~typescript
interface Endereco {
  rua: string;
  cidade: string;
}

interface Pedido {
  id: number;
  itens: Produto[];
  entrega: Endereco;
}
~~~

\`pedido.entrega.cidade\` e \`pedido.itens[0].preco\` são conferidos até o fim. Prefira interfaces pequenas com nome a um objeto grande descrito inline: \`Endereco\` reaparece em cliente, em fornecedor, em nota — e muda num lugar só.

## Interface como contrato de função

O uso mais importante:

~~~typescript
function descrever(p: Produto): string {
  return p.nome + ': R$ ' + p.preco.toFixed(2);
}
~~~

Quem chama \`descrever\` sabe exatamente o que passar, e dentro da função \`p.preco.toFixed\` é seguro — o compilador garante que \`preco\` existe e é número. Uma função que recebe "um objeto qualquer" não tem nenhuma dessas garantias.

## \`type\` também descreve objetos

Você vai ver \`type Produto = { nome: string; preco: number }\` em código alheio. Para descrever um objeto, \`type\` e \`interface\` fazem o mesmo. \`type\` também serve para coisas que \`interface\` não faz — uniões, que aparecem na aula que vem. A convenção desta trilha: **\`interface\` para objetos, \`type\` para o resto.**

## O que a interface é em execução

Nada. Como toda anotação, ela é apagada. \`interface Produto\` não vira classe, função nem objeto; \`typeof caneta\` continua \`"object"\`. Ela existe para o compilador e para quem lê.
`.trim(),
    },
    {
      kind: 'example',
      language: 'typescript',
      code: `interface Produto {
  nome: string;
  preco: number;
  emEstoque?: boolean;   // ausente = desconhecido
}

interface Pedido {
  readonly id: number;
  itens: Produto[];
  cupom?: string;
}

function total(pedido: Pedido): number {
  let soma = 0;
  for (const item of pedido.itens) {
    soma += item.preco;
  }
  return pedido.cupom === 'DEZ' ? soma * 0.9 : soma;
}

const pedido: Pedido = {
  id: 1042,
  itens: [
    { nome: 'Caderno', preco: 20 },
    { nome: 'Caneta', preco: 3.5, emEstoque: true },
  ],
  cupom: 'DEZ',
};

console.log(total(pedido).toFixed(2));  // 21.15`,
      caption:
        'Duas interfaces, uma dentro da outra. `total` só aceita algo com a forma de `Pedido`, e dentro dela `item.preco` é número garantido. `pedido.id = 5` seria recusado pelo `readonly`; `{ nome: \'Lápis\' }` na lista seria recusado por faltar `preco`.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-3-execucao',
        type: 'multiple-choice',
        prompt: 'O que `interface Produto { … }` vira quando o programa roda?',
        concepts: ['ts-interfaces'],
        difficulty: 'iniciante',
        tags: ['typescript', 'interfaces'],
        options: [
          'Uma classe `Produto`, que os objetos passam a instanciar',
          'Nada: a interface é apagada como qualquer anotação, e os objetos continuam objetos comuns',
          'Uma função que valida objetos em tempo de execução',
          'Um objeto `Produto` com as propriedades vazias',
        ],
        correctIndex: 1,
        explanation:
          'A interface descreve uma forma para o compilador conferir; em execução ela não existe. `const caneta: Produto = {…}` vira `const caneta = {…}`, e `typeof caneta` é `"object"` como sempre foi. É por isso que uma interface não protege de um JSON errado vindo da rede — nesse ponto os tipos já se foram; isso é assunto da aula de tipar uma API.',
        hints: ['Lembre da primeira aula: o que acontece com toda anotação depois de compilar?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-3-prever',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['ts-interfaces'],
        difficulty: 'iniciante',
        tags: ['typescript', 'interfaces'],
        code: `interface Ponto {
  x: number;
  y: number;
  rotulo?: string;
}

const p: Ponto = { x: 1, y: 2 };

console.log(JSON.stringify(p));
console.log(Object.keys(p).length);
console.log(p.rotulo);`,
        expectedOutput: '{"x":1,"y":2}\n2\nundefined',
        explanation:
          'A interface é apagada, então `p` é o objeto literal exato: duas chaves. A propriedade opcional `rotulo` não foi escrita, logo não existe no objeto — `Object.keys` conta 2 e `p.rotulo` é `undefined`. O `?` não cria a propriedade; só avisa ao compilador que ela pode faltar.',
        hints: ['O objeto tem só o que foi escrito nele. A interface não acrescenta nada.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-3-descrever',
        type: 'code',
        prompt:
          'Declare a interface `Produto` com `nome` (texto), `preco` (número) e `emEstoque` (booleano, **opcional**), e escreva `descrever(p: Produto)` devolvendo `"Nome: R$ 0,00"` — o preço com duas casas e vírgula. Os testes cobram a forma: faltar `preco` ou sobrar propriedade é recusado.',
        concepts: ['ts-interfaces'],
        difficulty: 'iniciante',
        tags: ['typescript', 'interfaces', 'funcoes'],
        initialCode: `// Declare a interface Produto aqui.

function descrever(p: any): string {
  return '';
}
`,
        tests: [
          {
            description: "descrever({ nome: 'Caneta', preco: 3.5 }) devolve 'Caneta: R$ 3,50'",
            assertion: `const r = descrever({ nome: 'Caneta', preco: 3.5 }); if (r !== 'Caneta: R$ 3,50') throw new Error("Esperava 'Caneta: R$ 3,50', veio '" + r + "'.");`,
          },
          {
            description: 'o preço sai com duas casas e vírgula',
            assertion: `const r = descrever({ nome: 'Caderno', preco: 20, emEstoque: true }); if (r !== 'Caderno: R$ 20,00') throw new Error("Esperava 'Caderno: R$ 20,00', veio '" + r + "'.");`,
          },
        ],
        typeTests: [
          { description: 'um produto sem emEstoque é aceito', code: "descrever({ nome: 'Lápis', preco: 1 });" },
          { description: 'um produto com emEstoque é aceito', code: "const ok: Produto = { nome: 'Lápis', preco: 1, emEstoque: false };" },
          { description: 'faltar preco é recusado', code: "descrever({ nome: 'Lápis' });", rejects: true },
          { description: 'preco em texto é recusado', code: "descrever({ nome: 'Lápis', preco: '1' });", rejects: true },
          { description: 'uma propriedade a mais é recusada', code: "descrever({ nome: 'Lápis', preco: 1, cor: 'azul' });", rejects: true },
        ],
        hints: [
          'A interface lista cada propriedade com o tipo: `nome: string;`. A opcional leva `?` antes dos dois-pontos.',
          'Troque o `any` do parâmetro pela interface. Para o preço: `p.preco.toFixed(2).replace(\'.\', \',\')`.',
        ],
        solution: `interface Produto {
  nome: string;
  preco: number;
  emEstoque?: boolean;
}

function descrever(p: Produto): string {
  return p.nome + ': R$ ' + p.preco.toFixed(2).replace('.', ',');
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-3-lacuna-usuario',
        type: 'fill-blank',
        prompt:
          'Complete a interface: o `id` não pode mudar depois de criado, o `apelido` pode faltar, e `idade` é número.',
        concepts: ['ts-interfaces'],
        difficulty: 'iniciante',
        tags: ['typescript', 'interfaces'],
        template: `interface Usuario {
  {{1}} id: number;
  nome: string;
  apelido{{2}}: string;
  idade: {{3}};
}

const ana: Usuario = { id: 1, nome: 'Ana', idade: 30 };
console.log(ana.nome, ana.apelido);`,
        blanks: [
          { placeholder: 'modificador', size: 9 },
          { placeholder: '', size: 2 },
          { placeholder: 'tipo', size: 7 },
        ],
        tests: [
          {
            description: 'o objeto ana existe com nome e idade',
            assertion: `if (ana.nome !== 'Ana' || ana.idade !== 30) throw new Error('ana deveria ter nome Ana e idade 30.');`,
          },
        ],
        typeTests: [
          { description: 'um usuário sem apelido é aceito', code: "const u1: Usuario = { id: 2, nome: 'Bia', idade: 25 };" },
          { description: 'um usuário com apelido é aceito', code: "const u2: Usuario = { id: 3, nome: 'Caio', apelido: 'C', idade: 40 };" },
          { description: 'mudar o id é recusado', code: 'ana.id = 9;', rejects: true },
          { description: 'idade em texto é recusada', code: "const u3: Usuario = { id: 4, nome: 'Dé', idade: '40' };", rejects: true },
        ],
        hints: [
          'O modificador de "não muda" vem antes do nome da propriedade; o de "pode faltar" vem depois dele, antes dos dois-pontos.',
          'A idade é um número.',
        ],
        solution: ['readonly', '?', 'number'],
        explanation:
          '`readonly id` impede `ana.id = 9` — o compilador recusa a atribuição, embora em execução nada impeça (é uma garantia de compilação, como tudo aqui). `apelido?` deixa o objeto ser criado sem a propriedade, e quem lê `ana.apelido` recebe `string | undefined`. `idade: number` é a anotação comum.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-3-bug-digitacao',
        type: 'find-bug',
        prompt:
          'O compilador recusa este programa. Em JavaScript ele rodaria e imprimiria `undefined` sem avisar. Aponte a linha que precisa mudar.',
        concepts: ['ts-interfaces'],
        difficulty: 'iniciante',
        tags: ['typescript', 'interfaces', 'depuracao'],
        code: `interface Config {
  tema: string;
  idioma: string;
  fonte: number;
}

const config: Config = {
  tema: 'claro',
  idoma: 'pt-BR',
  fonte: 16,
};

console.log(config.idioma);`,
        buggyLine: 9,
        fix: "  idioma: 'pt-BR',",
        explanation:
          '`idoma` não existe em `Config`. Um objeto escrito na hora não pode ter propriedade que a interface não conhece, e o compilador ainda sugere: `Did you mean to write \'idioma\'?`. Em JavaScript o objeto teria `idoma` e `config.idioma` seria `undefined` — o erro apareceria em outra tela, sem apontar a causa. É o exemplo mais cotidiano do que a interface compra: o erro de digitação vira erro de compilação, na linha certa.',
        hints: [
          'Compare cada propriedade do objeto com as da interface, letra por letra.',
          'O compilador diz que uma propriedade "does not exist in type Config" e sugere outra.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-3-opcional',
        type: 'multiple-choice',
        prompt: 'Com `apelido?: string` na interface, qual é o tipo de `usuario.apelido` ao ler?',
        concepts: ['ts-interfaces'],
        difficulty: 'intermediario',
        tags: ['typescript', 'interfaces'],
        options: [
          '`string`, porque foi declarado como texto',
          '`string | undefined`: pode não existir, e o compilador cobra a verificação antes de usar como texto',
          '`any`, porque a propriedade é opcional',
          "`string` ou `''` (texto vazio) quando falta",
        ],
        correctIndex: 1,
        explanation:
          'O `?` diz que a propriedade pode faltar, e faltar em JavaScript é `undefined`. O compilador carrega isso no tipo: `string | undefined`. Por isso `usuario.apelido.length` é recusado (`\'usuario.apelido\' is possibly \'undefined\'`) até um `if (usuario.apelido)` ou um `?.`. Não vira texto vazio, não vira `any`: vira a verdade, que é "talvez não esteja lá".',
        hints: ['O que o JavaScript devolve ao ler uma propriedade que não existe no objeto?'],
      },
    },
    {
      kind: 'summary',
      markdown: `Uma interface é a forma de um objeto: cada propriedade com o seu tipo, \`?\` nas que podem faltar, \`readonly\` nas que não mudam, outras interfaces e listas dentro. Serve de contrato de função — quem chama sabe o que passar, e dentro dela cada acesso é garantido. Objeto escrito na hora não pode ter propriedade a mais: é assim que o erro de digitação vira erro de compilação. Em execução, a interface não existe.`,
    },
  ],
};

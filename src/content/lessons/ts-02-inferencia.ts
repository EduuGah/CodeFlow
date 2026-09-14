import type { Lesson } from '../types';

export const lessonInferencia: Lesson = {
  id: 'lesson-ts-2',
  trackId: 'track-typescript',
  title: 'Inferência: O que o Compilador Já Sabe',
  language: 'typescript',
  objective:
    'Deixar o compilador deduzir o tipo quando o valor já diz tudo, e anotar só onde ele não tem como saber: parâmetros, listas vazias e variáveis sem valor.',
  concepts: ['ts-inferencia'],
  status: 'published',
  estimatedMinutes: 24,
  blocks: [
    {
      kind: 'prose',
      markdown: `
A aula passada anotou tudo: \`const idade: number = 30\`. Funciona — e é redundante. O valor \`30\` já diz que é um número. O compilador lê o lado direito e **deduz** o tipo do lado esquerdo:

~~~typescript
const idade = 30;            // number
const nome = 'Ana';          // string
const ativo = true;          // boolean
const notas = [7, 8.5, 9];   // number[]
const pessoa = { nome: 'Ana', idade: 30 };  // { nome: string; idade: number }
~~~

Isso se chama **inferência**, e é a maior parte do TypeScript que você vai escrever: código que parece JavaScript e é verificado como TypeScript. \`idade = 'trinta'\` é recusado do mesmo jeito que seria com a anotação — o tipo existe, só não foi escrito.

Passe o mouse sobre uma variável no editor: ele mostra o tipo deduzido. É a forma mais rápida de aprender o que o compilador pensa.

## Onde a inferência não chega

Três lugares em que o compilador **não tem como saber**, e pede:

**1. Parâmetros de função.** Quem chama está longe. \`function dobro(n)\` não diz o que \`n\` é, e o modo estrito recusa: \`Parameter 'n' implicitly has an 'any' type\`. Anote sempre.

~~~typescript
function dobro(n: number) {
  return n * 2;     // o retorno é deduzido: number
}
~~~

Repare que o **retorno** não precisa de anotação: o compilador vê o \`return n * 2\` e sabe. Anotar o retorno é opcional — útil em funções longas, para o erro aparecer no \`return\` errado e não em quem chama.

**2. Lista vazia.** \`const itens = []\` não diz o que vai entrar. Anote: \`const itens: string[] = []\`.

**3. Variável sem valor inicial.** \`let resultado;\` é o mesmo problema. Anote, ou dê o valor logo: \`let resultado = 0\`.

## \`const\` deduz mais fino que \`let\`

~~~typescript
let modo = 'claro';     // string — pode virar qualquer texto
const tema = 'claro';   // 'claro' — só pode ser isso
~~~

Uma \`const\` nunca muda, então o compilador guarda o **valor exato** como tipo: \`'claro'\`, e não \`string\`. Chama-se **tipo literal**, e volta na aula de estreitamento. Por ora, basta saber que \`const\` lembra o valor e \`let\` lembra a categoria.

## A regra

Anote a fronteira — parâmetros, e o retorno quando ajuda a ler. Deixe o compilador deduzir o resto. Uma anotação em \`const x: number = 5\` não acrescenta segurança; acrescenta ruído, e ruído esconde as anotações que importam.

## Erro comum

\`const itens = []\` seguido de \`itens.push(1)\` **compila**: o compilador trata a lista vazia como "ainda vou descobrir" e aprende com o primeiro \`push\`. Parece conveniente, e é uma armadilha: o tipo passa a depender da ordem em que o código roda, e um \`push('a')\` duas linhas depois vira erro numa linha que parecia inocente. Lista vazia se anota.
`.trim(),
    },
    {
      kind: 'example',
      language: 'typescript',
      code: `// Um relatório de vendas: quase nada anotado, tudo verificado.
function totalDe(valores: number[]) {
  let soma = 0;                 // number, deduzido do 0
  for (const v of valores) {
    soma += v;
  }
  return soma;                  // o retorno é number, deduzido
}

const vendas = [120, 80.5, 42]; // number[]
const total = totalDe(vendas);  // number

const resumo = {                // { itens: number; total: number; media: number }
  itens: vendas.length,
  total,
  media: total / vendas.length,
};

console.log(resumo.media.toFixed(2));  // 80.83`,
      caption:
        'A única anotação é o parâmetro `valores`. Todo o resto é deduzido, e ainda assim `resumo.media.toUpperCase()` seria recusado: o compilador sabe que `media` é número.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-2-deduzido',
        type: 'multiple-choice',
        prompt: 'Qual é o tipo que o compilador deduz para `const cores = [\'azul\', \'verde\']`?',
        concepts: ['ts-inferencia'],
        difficulty: 'iniciante',
        tags: ['typescript', 'inferencia'],
        options: [
          '`any[]`, porque não há anotação',
          '`string[]`: uma lista de textos, deduzida dos valores',
          "`['azul', 'verde']`: exatamente esses dois textos",
          '`Array`, sem saber o que há dentro',
        ],
        correctIndex: 1,
        explanation:
          'O compilador olha os valores e deduz o tipo mais útil: os dois são textos, então a lista é `string[]`. `cores.push(\'roxo\')` é aceito; `cores.push(3)` é recusado. Ele não guarda os valores exatos numa lista (isso seria inconveniente: você não poderia acrescentar nada), e só cai em `any` quando não há valor nenhum para olhar — a lista vazia.',
        hints: ['Os valores são todos da mesma categoria. Qual?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-2-bug-reatribuir',
        type: 'find-bug',
        prompt:
          'O compilador recusa este programa. Não há anotação nenhuma — e mesmo assim há um erro de tipo. Aponte a linha.',
        concepts: ['ts-inferencia'],
        difficulty: 'iniciante',
        tags: ['typescript', 'inferencia', 'depuracao'],
        code: `let total = 0;
const precos = [10, 20, 30];

for (const preco of precos) {
  total = total + preco;
}

total = total + ' reais';
console.log(total);`,
        buggyLine: 8,
        fix: "console.log(total + ' reais');",
        explanation:
          '`let total = 0` deduz `number`, e a variável fica presa a isso. `total + \' reais\'` produz um texto (`"60 reais"`), e guardar um texto em `total` é recusado: `Type \'string\' is not assignable to type \'number\'`. A inferência não é menos rígida que a anotação — é a mesma coisa, sem escrever. A correção é não reatribuir: monte o texto na hora de imprimir.',
        hints: [
          'Qual é o tipo de `total`, deduzido na primeira linha? Ele nunca muda.',
          'Procure a linha em que `total` recebe algo que não é número.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-2-lacuna-fronteira',
        type: 'fill-blank',
        prompt:
          'Anote só onde o compilador não tem como saber: o parâmetro e a lista vazia. Os testes cobram que `contar([\'a\'])` é aceito, `contar(3)` é recusado, e que só texto entra em `tags`.',
        concepts: ['ts-inferencia'],
        difficulty: 'iniciante',
        tags: ['typescript', 'inferencia'],
        template: `function contar(itens: {{1}}) {
  return itens.length;
}

const tags: {{2}} = [];
tags.push('novo');
tags.push('urgente');

console.log(contar(tags));`,
        blanks: [
          { placeholder: 'tipo', size: 9 },
          { placeholder: 'tipo', size: 9 },
        ],
        tests: [
          {
            description: 'contar(tags) devolve 2',
            assertion: `if (contar(tags) !== 2) throw new Error('contar(tags) deveria devolver 2, devolveu ' + contar(tags));`,
          },
        ],
        typeTests: [
          { description: 'contar aceita uma lista de textos', code: "contar(['a', 'b']);" },
          { description: 'contar recusa um número', code: 'contar(3);', rejects: true },
          { description: 'o retorno de contar é deduzido como número', code: 'const n: number = contar([]);' },
          { description: 'tags só aceita texto', code: 'tags.push(1);', rejects: true },
        ],
        hints: [
          'Os dois são listas de texto.',
          'O tipo de uma lista de textos é o tipo do item seguido de colchetes.',
        ],
        solution: ['string[]', 'string[]'],
        explanation:
          'O parâmetro `itens` é fronteira: sem anotação, o compilador não sabe o que chega. A lista `tags` nasce vazia: sem anotação, ele não sabe o que vai entrar. Nos dois casos `string[]` resolve — e o resto (o retorno de `contar`, o resultado do `console.log`) é deduzido sem que você escreva nada.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-2-refatorar-ruido',
        type: 'refactor',
        prompt:
          'Este código funciona e está cheio de anotações redundantes. Tire toda anotação que o compilador deduziria sozinho — mantendo as que ele precisa (os parâmetros). O comportamento não pode mudar.',
        concepts: ['ts-inferencia'],
        difficulty: 'intermediario',
        tags: ['typescript', 'inferencia', 'refatoracao'],
        initialCode: `function precoFinal(preco: number, desconto: number): number {
  const fator: number = 1 - desconto / 100;
  const resultado: number = preco * fator;
  return resultado;
}

const loja: string = 'Papelaria Central';
const precos: number[] = [10, 25, 40];
const comDesconto: number[] = precos.map((p: number): number => precoFinal(p, 10));
const aberta: boolean = true;

console.log(loja, comDesconto, aberta);`,
        tests: [
          {
            description: 'precoFinal(100, 10) devolve 90',
            assertion: `if (precoFinal(100, 10) !== 90) throw new Error('precoFinal(100, 10) deveria devolver 90, devolveu ' + precoFinal(100, 10));`,
          },
          {
            description: 'comDesconto tem os três preços com 10% a menos',
            assertion: `if (JSON.stringify(comDesconto) !== '[9,22.5,36]') throw new Error('comDesconto deveria ser [9, 22.5, 36], veio ' + JSON.stringify(comDesconto));`,
          },
          {
            description: 'loja e aberta continuam com os mesmos valores',
            assertion: `if (loja !== 'Papelaria Central' || aberta !== true) throw new Error('loja e aberta deveriam continuar iguais.');`,
          },
        ],
        constraints: [
          { description: 'Nenhuma constante anotada com `: number =`', forbidden: ': number =' },
          { description: 'Nenhuma constante anotada com `: string =`', forbidden: ': string =' },
          { description: 'Nenhuma constante anotada com `: boolean =`', forbidden: ': boolean =' },
          { description: 'Nenhuma constante anotada com `: number[] =`', forbidden: ': number[] =' },
          { description: 'A função de `map` não anota o parâmetro `p`: o compilador sabe que a lista é de números', forbidden: '(p: number)' },
          { description: 'Os parâmetros de `precoFinal` continuam anotados', required: 'preco: number, desconto: number' },
        ],
        explanation:
          'Tudo o que tinha valor do lado direito perdeu a anotação, e o compilador deduz exatamente o que estava escrito: `fator` é número, `loja` é texto, `comDesconto` é `number[]`. Até o `p` do `map` é deduzido, porque o compilador sabe que `precos` é uma lista de números. As duas anotações que ficaram são as de fronteira: `preco` e `desconto`, que a função não tem como adivinhar. O retorno de `precoFinal` pode ir ou ficar — é gosto; em função curta, costuma sair.',
        hints: [
          'Se há um valor do lado direito do `=`, a anotação do lado esquerdo é redundante.',
          'O parâmetro de uma função passada ao `map` também é deduzido, a partir do tipo da lista.',
          'Tire tudo o que estiver depois de um nome de constante até o `=`. Os parâmetros `preco` e `desconto` ficam.',
        ],
        solution: `function precoFinal(preco: number, desconto: number) {
  const fator = 1 - desconto / 100;
  const resultado = preco * fator;
  return resultado;
}

const loja = 'Papelaria Central';
const precos = [10, 25, 40];
const comDesconto = precos.map((p) => precoFinal(p, 10));
const aberta = true;

console.log(loja, comDesconto, aberta);`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-2-const-fino',
        type: 'multiple-choice',
        prompt: "Qual é a diferença entre os tipos deduzidos de `let modo = 'claro'` e `const tema = 'claro'`?",
        concepts: ['ts-inferencia'],
        difficulty: 'intermediario',
        tags: ['typescript', 'inferencia'],
        options: [
          'Nenhuma: os dois são `string`',
          "`modo` é `string`; `tema` é o tipo literal `'claro'`, porque uma `const` nunca vai ser outra coisa",
          "`modo` é `any`; `tema` é `string`",
          "`modo` é `string`; `tema` é `String`, com maiúscula",
        ],
        correctIndex: 1,
        explanation:
          'Uma `let` pode receber outro texto depois, então o compilador guarda a categoria: `string`. Uma `const` nunca muda, então ele guarda o valor exato como tipo: `\'claro\'`. Isso parece detalhe agora e vira ferramenta na aula de estreitamento — é o que permite dizer que uma variável só pode ser `\'claro\'` ou `\'escuro\'`, e recusar `\'azul\'`.',
        hints: ['Pense no que cada declaração permite fazer depois: `let` aceita reatribuição; `const`, não.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-2-quando-anotar',
        type: 'multiple-choice',
        prompt: 'Em qual destas linhas a anotação é **necessária** — sem ela o compilador recusa ou fica sem saber o tipo?',
        concepts: ['ts-inferencia'],
        difficulty: 'iniciante',
        tags: ['typescript', 'inferencia'],
        options: [
          "`const nome: string = 'Ana'`",
          '`const lidos: number[] = []`',
          '`const dobro: number = 2 * 21`',
          '`const ativo: boolean = true`',
        ],
        correctIndex: 1,
        explanation:
          'As outras três têm um valor do lado direito, e o compilador deduz o tipo dele. A lista vazia não tem nada para olhar: sem anotação, o tipo fica "a descobrir" e passa a depender do primeiro `push` — uma armadilha. Os três lugares em que a anotação é necessária: parâmetro de função, lista vazia, variável sem valor inicial.',
        hints: ['Em qual das quatro o lado direito não diz o que a variável guarda?'],
      },
    },
    {
      kind: 'summary',
      markdown: `O compilador deduz o tipo do valor: \`const idade = 30\` já é \`number\`, e é tão rígido quanto se estivesse escrito. Anote a fronteira — parâmetros, e o retorno quando ajuda — e os dois casos sem valor para olhar: lista vazia e variável sem inicial. \`const\` guarda o valor exato como tipo; \`let\`, a categoria. Anotação redundante é ruído, e ruído esconde as que importam.`,
    },
  ],
};

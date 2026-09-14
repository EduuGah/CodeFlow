import type { Lesson } from '../types';

export const lessonEstreitar: Lesson = {
  id: 'lesson-ts-4',
  trackId: 'track-typescript',
  title: 'Estreitar: Um Valor que Pode Ser Duas Coisas',
  language: 'typescript',
  objective:
    'Declarar uniões (`string | number`, `Circulo | Quadrado`, `T | undefined`) e estreitá-las com typeof, verificação e discriminante antes de usar — porque o compilador só deixa usar o que já foi conferido.',
  concepts: ['ts-estreitar'],
  status: 'published',
  estimatedMinutes: 27,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Nem todo valor é uma coisa só. Um id pode ser número ou texto. Uma configuração pode ter tema \`'claro'\` ou \`'escuro'\`. Uma busca pode devolver o usuário — ou nada. TypeScript escreve isso com a barra vertical:

~~~typescript
let id: string | number;
let tema: 'claro' | 'escuro';
let encontrado: Usuario | undefined;
~~~

É uma **união**: o valor é um **ou** outro. E a segunda linha mostra algo novo — \`'claro'\` e \`'escuro'\` são **tipos literais**, os mesmos que a \`const\` deduz. \`tema = 'azul'\` é recusado. Uma união de literais é a forma mais simples de dizer "só estas opções", e você vai usá-la o tempo todo.

## O compilador só deixa usar o que é comum

~~~typescript
// @recusado
function tamanho(valor: string | number) {
  return valor.length;   // Property 'length' does not exist on type 'number'
}
~~~

\`length\` existe em texto, não em número. Enquanto \`valor\` pode ser os dois, o compilador só aceita o que os dois têm. Para usar o que é de um só, você precisa **estreitar**: provar, com código, qual dos dois é.

~~~typescript
function tamanho(valor: string | number) {
  if (typeof valor === 'string') {
    return valor.length;    // aqui valor é string
  }
  return valor.toFixed(0).length;   // aqui só sobrou number
}
~~~

Dentro do \`if\`, o compilador **sabe** que \`valor\` é texto — o \`typeof\` provou. Depois do \`if\`, sabe que só sobrou número. Não há anotação nova; ele acompanha o fluxo do código. Chama-se **estreitamento** (narrowing), e é a ideia central desta aula: o tipo de uma variável muda conforme o que você já verificou sobre ela.

## O caso mais comum: pode não existir

\`T | undefined\` aparece em todo lugar — propriedade opcional, \`find\` que não acha, parâmetro que pode faltar:

~~~typescript
function saudar(nome: string | undefined) {
  // nome.toUpperCase() é recusado: 'nome' is possibly 'undefined'
  if (nome === undefined) return 'Olá!';
  return 'Olá, ' + nome.toUpperCase();   // estreitado: string
}
~~~

Três jeitos de lidar, do mais explícito ao mais curto:

- \`if (nome === undefined) return …\` — trata o caso e sai; o resto da função fica estreitado;
- \`nome?.toUpperCase()\` — chama se existir, devolve \`undefined\` se não;
- \`(nome ?? 'visitante').toUpperCase()\` — um padrão no lugar do vazio.

O compilador força a decisão. Em JavaScript, \`nome.toUpperCase()\` com \`nome\` vazio é o \`TypeError: Cannot read properties of undefined\` mais famoso da linguagem; aqui ele não compila.

## Uniões de objetos: o discriminante

Quando os dois lados são objetos, \`typeof\` não ajuda — os dois são \`"object"\`. O padrão é dar a cada forma uma propriedade **literal** que a identifica:

~~~typescript
interface Circulo { tipo: 'circulo'; raio: number }
interface Quadrado { tipo: 'quadrado'; lado: number }
type Forma = Circulo | Quadrado;

function area(f: Forma): number {
  if (f.tipo === 'circulo') {
    return Math.PI * f.raio * f.raio;   // f é Circulo: raio existe
  }
  return f.lado * f.lado;               // sobrou Quadrado
}
~~~

\`tipo\` é o **discriminante**. Comparar com \`'circulo'\` estreita a união inteira: dentro do \`if\`, \`f.raio\` existe; fora, \`f.lado\`. É o padrão para qualquer coisa que tenha variantes — eventos, respostas de API, estados de uma tela (\`{ estado: 'carregando' } | { estado: 'erro'; mensagem: string } | { estado: 'pronto'; dados: Item[] }\`).

## \`type\` para uniões

\`type Forma = Circulo | Quadrado\` — a união ganha um nome com \`type\`, porque \`interface\` só descreve objetos. É a segunda metade da convenção da aula passada: interface para a forma, \`type\` para o resto.

## O que estreita

\`typeof x === 'string'\`, \`x === undefined\`, \`x !== null\`, \`if (x)\`, \`x.tipo === 'circulo'\`, \`'raio' in x\`, \`x instanceof Date\`, \`Array.isArray(x)\`. Todos são JavaScript comum; o TypeScript só lê o que eles provam.
`.trim(),
    },
    {
      kind: 'example',
      language: 'typescript',
      code: `interface Carregando { estado: 'carregando' }
interface Erro { estado: 'erro'; mensagem: string }
interface Pronto { estado: 'pronto'; itens: string[] }
type Tela = Carregando | Erro | Pronto;

function descrever(tela: Tela): string {
  if (tela.estado === 'carregando') return 'Carregando…';
  if (tela.estado === 'erro') return 'Falhou: ' + tela.mensagem;
  return tela.itens.length + ' itens';       // só sobrou Pronto
}

const telas: Tela[] = [
  { estado: 'carregando' },
  { estado: 'erro', mensagem: 'sem rede' },
  { estado: 'pronto', itens: ['a', 'b'] },
];

for (const t of telas) {
  console.log(descrever(t));
}
// Carregando…
// Falhou: sem rede
// 2 itens`,
      caption:
        'Os estados de uma tela como união discriminada — a mesma ideia da aula "os estados da tela", agora com o compilador cobrando: `tela.mensagem` fora do `if` de erro é recusado, e um estado novo que você acrescente à união faz `descrever` reclamar onde faltar tratamento.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-4-uniao',
        type: 'multiple-choice',
        prompt: "Com `function tamanho(valor: string | number)`, por que `valor.length` é recusado antes de qualquer `if`?",
        concepts: ['ts-estreitar'],
        difficulty: 'iniciante',
        tags: ['typescript', 'uniao'],
        options: [
          'Porque `length` não existe em texto',
          'Porque enquanto `valor` pode ser texto ou número, o compilador só aceita o que os dois têm em comum — e número não tem `length`',
          'Porque uniões não permitem acessar propriedades',
          'Porque falta anotar o retorno da função',
        ],
        correctIndex: 1,
        explanation:
          'A união diz "um ou outro", e o compilador não sabe qual. Então só libera o que é seguro nos dois casos. `length` existe em `string` e não em `number`; logo, recusado — até um `typeof valor === \'string\'` provar de que lado está. Dentro desse `if`, `valor.length` passa a compilar.',
        hints: ['O compilador não sabe qual dos dois chegou. O que ele pode garantir?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-4-prever',
        type: 'predict-output',
        prompt: 'O que este programa imprime? O `typeof` estreita para o compilador — e decide em execução.',
        concepts: ['ts-estreitar'],
        difficulty: 'iniciante',
        tags: ['typescript', 'uniao'],
        code: `function dobrar(v: string | number) {
  if (typeof v === 'number') {
    return v * 2;
  }
  return v + v;
}

console.log(dobrar(4));
console.log(dobrar('4'));
console.log(typeof dobrar('ab'));`,
        expectedOutput: '8\n44\nstring',
        explanation:
          'Com número, `v * 2` é 8. Com texto, o `if` não entra e `v + v` concatena: `\'44\'`. O `typeof` é JavaScript de verdade — roda e escolhe o caminho —, e o TypeScript aproveita a mesma verificação para saber o tipo em cada ramo. A última linha imprime `string` porque `dobrar(\'ab\')` devolve `\'abab\'`.',
        hints: ['`+` entre dois textos não soma.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-4-formatar',
        type: 'code',
        prompt:
          'Escreva `formatar(valor: string | number): string`: um número sai com duas casas e vírgula (`3.5` → `"3,50"`); um texto sai sem espaços nas pontas e em maiúsculas (`" ana "` → `"ANA"`). O compilador vai recusar `toFixed` e `trim` até você estreitar.',
        concepts: ['ts-estreitar'],
        difficulty: 'iniciante',
        tags: ['typescript', 'uniao', 'funcoes'],
        initialCode: `function formatar(valor: string | number): string {
  return String(valor);
}
`,
        tests: [
          {
            description: "formatar(3.5) devolve '3,50'",
            assertion: `if (formatar(3.5) !== '3,50') throw new Error("formatar(3.5) deveria devolver '3,50', devolveu '" + formatar(3.5) + "'.");`,
          },
          {
            description: "formatar(' ana ') devolve 'ANA'",
            assertion: `if (formatar(' ana ') !== 'ANA') throw new Error("formatar(' ana ') deveria devolver 'ANA', devolveu '" + formatar(' ana ') + "'.");`,
          },
          {
            description: 'formatar(10) devolve 10,00',
            assertion: `if (formatar(10) !== '10,00') throw new Error("formatar(10) deveria devolver '10,00', devolveu '" + formatar(10) + "'.");`,
          },
        ],
        hints: [
          'Comece com `if (typeof valor === \'number\')` e trate o número ali dentro, com `return`.',
          'Depois do `if`, só sobrou texto: `valor.trim().toUpperCase()`. Para o número: `valor.toFixed(2).replace(\'.\', \',\')`.',
        ],
        solution: `function formatar(valor: string | number): string {
  if (typeof valor === 'number') {
    return valor.toFixed(2).replace('.', ',');
  }
  return valor.trim().toUpperCase();
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-4-lacuna-forma',
        type: 'fill-blank',
        prompt: 'Complete a união discriminada e o estreitamento: o nome do tipo da união, e a propriedade que identifica cada forma.',
        concepts: ['ts-estreitar'],
        difficulty: 'intermediario',
        tags: ['typescript', 'uniao'],
        template: `interface Circulo { tipo: 'circulo'; raio: number }
interface Quadrado { tipo: 'quadrado'; lado: number }
{{1}} Forma = Circulo | Quadrado;

function area(f: Forma): number {
  if (f.{{2}} === 'circulo') {
    return Math.PI * f.raio * f.raio;
  }
  return f.lado * f.lado;
}

console.log(area({ tipo: 'quadrado', lado: 3 }));`,
        blanks: [
          { placeholder: 'palavra', size: 9 },
          { placeholder: 'propriedade', size: 6 },
        ],
        tests: [
          {
            description: 'a área do quadrado de lado 3 é 9',
            assertion: `if (area({ tipo: 'quadrado', lado: 3 }) !== 9) throw new Error('area do quadrado de lado 3 deveria ser 9.');`,
          },
          {
            description: 'a área do círculo de raio 1 é π',
            assertion: `if (Math.abs(area({ tipo: 'circulo', raio: 1 }) - Math.PI) > 1e-9) throw new Error('area do círculo de raio 1 deveria ser π.');`,
          },
        ],
        typeTests: [
          { description: 'uma forma desconhecida é recusada', code: "area({ tipo: 'triangulo', lado: 1 });", rejects: true },
          { description: 'um círculo sem raio é recusado', code: "area({ tipo: 'circulo' });", rejects: true },
        ],
        hints: [
          'Uma união ganha nome com a palavra que não é `interface` — interface só descreve objeto.',
          'A propriedade que as duas formas têm em comum, com um valor literal diferente em cada uma.',
        ],
        solution: ['type', 'tipo'],
        explanation:
          '`type Forma = Circulo | Quadrado` dá nome à união. `tipo` é o discriminante: as duas interfaces o têm, com literais diferentes, e comparar `f.tipo === \'circulo\'` estreita `f` para `Circulo` dentro do `if` — só ali `f.raio` existe. Depois do `if`, o compilador sabe que sobrou `Quadrado`. Um `{ tipo: \'triangulo\' }` não é nenhuma das duas, e é recusado na chamada.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-4-bug-undefined',
        type: 'find-bug',
        prompt:
          'O compilador recusa este programa com `\'nome\' is possibly \'undefined\'`. Em JavaScript, a segunda chamada quebraria com o `TypeError` mais famoso da linguagem. Aponte a linha.',
        concepts: ['ts-estreitar'],
        difficulty: 'iniciante',
        tags: ['typescript', 'uniao', 'depuracao'],
        code: `function saudacao(nome: string | undefined): string {
  return 'Olá, ' + nome.toUpperCase() + '!';
}

console.log(saudacao('ana'));
console.log(saudacao(undefined));`,
        buggyLine: 2,
        fix: "  return 'Olá, ' + (nome ?? 'visitante').toUpperCase() + '!';",
        explanation:
          '`nome` pode ser `undefined`, e `undefined.toUpperCase()` é o `TypeError: Cannot read properties of undefined` que derruba páginas em produção. O compilador não deixa passar: antes de chamar um método, a união precisa ser estreitada. `nome ?? \'visitante\'` troca o vazio por um padrão e, a partir dali, o tipo é `string`. Um `if (nome === undefined) return \'Olá!\'` na linha anterior resolveria igual.',
        hints: [
          'A assinatura está certa: receber `undefined` é parte do contrato. Onde o valor é usado como se fosse texto garantido?',
          'Procure a chamada de método num valor que pode não existir.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-4-literais',
        type: 'multiple-choice',
        prompt: "Com `type Tema = 'claro' | 'escuro'` e `let tema: Tema`, o que acontece com `tema = 'azul'`?",
        concepts: ['ts-estreitar'],
        difficulty: 'iniciante',
        tags: ['typescript', 'uniao'],
        options: [
          'Compila, porque `\'azul\'` é texto e `Tema` é feito de textos',
          "É recusado: `Tema` só aceita exatamente `'claro'` ou `'escuro'`, e o compilador diz que `'azul'` não cabe",
          'Compila com aviso',
          'É recusado só se `tema` for `const`',
        ],
        correctIndex: 1,
        explanation:
          'Uma união de literais é uma lista fechada de valores permitidos. `\'azul\'` não está nela — `Type \'"azul"\' is not assignable to type \'Tema\'`. É o jeito de transformar "o tema é uma dessas strings" de comentário em regra verificada, e vale para qualquer conjunto pequeno de opções: status de pedido, direção, nível de log.',
        hints: ['Os membros da união não são `string`; são valores exatos.'],
      },
    },
    {
      kind: 'summary',
      markdown: `Uma união (\`A | B\`) diz "um ou outro", e o compilador só libera o que os dois têm em comum. Para usar o que é de um só, estreite: \`typeof\`, \`=== undefined\`, \`if (x)\`, \`?.\`, \`??\`, ou o discriminante (\`f.tipo === 'circulo'\`) numa união de objetos. O tipo acompanha o fluxo do código. Uniões de literais fecham as opções (\`'claro' | 'escuro'\`); \`type\` dá nome a uma união.`,
    },
  ],
};

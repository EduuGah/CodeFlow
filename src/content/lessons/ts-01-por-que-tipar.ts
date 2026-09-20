import type { Lesson } from '../types';

export const lessonPorQueTipar: Lesson = {
  id: 'lesson-ts-1',
  trackId: 'track-typescript',
  title: 'Por que Tipar: O Erro Antes de Rodar',
  language: 'typescript',
  objective:
    'Anotar o tipo de parâmetros, variáveis e retornos, e usar o compilador para pegar o erro que o JavaScript só mostraria em produção.',
  concepts: ['ts-por-que'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Você já escreveu muito JavaScript. Então já viu este erro — ou vai ver:

~~~javascript
function somar(a, b) {
  return a + b;
}

somar(2, 3);     // 5
somar('2', 3);   // '23'
~~~

Nada quebra. Nenhuma mensagem. O programa segue com \`'23'\` no lugar de \`5\`, e o problema só aparece três telas depois, quando alguém tenta pagar R$ 23 por uma compra de R$ 5. O JavaScript **não sabe** que \`somar\` era para receber números — você sabia, mas não escreveu em lugar nenhum.

TypeScript é o lugar onde você escreve.

~~~typescript
function somar(a: number, b: number): number {
  return a + b;
}
~~~

\`a: number\` diz: "\`a\` é um número". O \`: number\` depois dos parênteses diz: "a função devolve um número". E agora \`somar('2', 3)\` não chega a rodar. Antes de qualquer execução, o **compilador** lê o programa inteiro, confere cada uso contra o que foi declarado, e recusa:

~~~
Argument of type 'string' is not assignable to parameter of type 'number'.
~~~

Em português: "o argumento é texto, e o parâmetro pede número". O erro aparece **na linha da chamada errada**, no editor, enquanto você digita — não na tela de alguém, três semanas depois.

## O que o TypeScript é

TypeScript é JavaScript com **anotações de tipo**. Tudo o que você sabe continua valendo: \`const\`, funções, arrays, objetos, promessas. Você acrescenta, nos lugares que importam, o que cada coisa é:

~~~typescript
const nome: string = 'Ana';
const idade: number = 30;
const ativo: boolean = true;
const notas: number[] = [7, 8.5, 9];
~~~

A sintaxe é sempre a mesma: **\`nome: tipo\`**. Os tipos básicos são os que você conhece do \`typeof\` — \`string\`, \`number\`, \`boolean\` — e \`tipo[]\` para uma lista deles.

Quando o programa passa no compilador, as anotações são **apagadas**, e o que roda é JavaScript puro. \`const idade: number = 30\` vira \`const idade = 30\`. O tipo não existe em execução, não deixa o programa mais lento, não muda nenhum resultado. Ele existe só para o compilador — e para quem lê o código.

## Onde anotar

Nem tudo precisa de anotação. A próxima aula mostra o quanto o compilador deduz sozinho. Por ora, a regra é: **anote os parâmetros de função**. É a fronteira: quem chama a função está longe de quem a escreveu, e o tipo do parâmetro é o contrato entre os dois.

~~~typescript
function saudar(nome: string, vezes: number): string {
  return \`Olá, \${nome}! \`.repeat(vezes);
}
~~~

Sem o \`: string\` em \`nome\`, o compilador em modo estrito recusa a função inteira: \`Parameter 'nome' implicitly has an 'any' type\`. Ele não chuta. Se você não disse, ele pede.

## O interruptor de desligar

Existe um tipo que aceita qualquer coisa: \`any\`. \`const x: any = 5\` deixa \`x.foo.bar()\` compilar, e explodir em execução como no JavaScript. É o botão de desligar o TypeScript, e vai aparecer em código alheio. Nesta trilha ele não entra: cada \`any\` é um lugar em que o compilador não pode mais ajudar.

## Como funciona aqui

Nos exercícios desta trilha, "Executar" faz duas coisas. Primeiro o compilador confere os tipos; se recusar, a lista de erros aparece com a linha, a mensagem original em inglês — a mesma que qualquer editor do mundo mostra — e uma explicação. Nada roda. Se aceitar, o JavaScript gerado roda nos mesmos testes de sempre.

E há um teste novo, que só o TypeScript permite: **um trecho que o compilador precisa recusar**. O exercício da soma cobra que \`somar('2', 3)\` seja **rejeitado** — porque um tipo bom se mede pelo que ele impede.
`.trim(),
    },
    {
      kind: 'example',
      language: 'typescript',
      code: `// Um carrinho, com os tipos escritos nos lugares que importam.
function precoComDesconto(preco: number, percentual: number): number {
  return preco * (1 - percentual / 100);
}

function total(precos: number[]): number {
  let soma = 0;
  for (const preco of precos) {
    soma += preco;
  }
  return soma;
}

const itens: number[] = [40, 25.5, 10];
console.log(total(itens));                        // 75.5
console.log(precoComDesconto(total(itens), 10));  // 67.95`,
      caption:
        'Cada função diz o que recebe e o que devolve. `total("40, 25")` — o erro clássico de um valor que chegou como texto de um formulário — é recusado na hora, na linha da chamada.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-1-apagadas',
        type: 'multiple-choice',
        prompt: 'O que acontece com as anotações de tipo (`: number`, `: string`) quando o programa roda?',
        concepts: ['ts-por-que'],
        difficulty: 'iniciante',
        tags: ['typescript', 'tipos'],
        options: [
          'São conferidas de novo a cada chamada, o que deixa o programa um pouco mais lento',
          'São apagadas na compilação: o que roda é JavaScript puro, e o tipo não existe em execução',
          'Viram verificações `typeof` no início de cada função',
          'Ficam guardadas num arquivo à parte que o navegador consulta',
        ],
        correctIndex: 1,
        explanation:
          'O compilador confere os tipos **antes** de o programa existir como JavaScript, e depois os apaga. `const idade: number = 30` vira `const idade = 30`. Por isso o TypeScript não custa nada em execução — e por isso ele não protege de um valor errado que chegue de fora (um formulário, uma API) em tempo de execução: nesse ponto os tipos já se foram.',
        hints: ['Pense em quando o compilador roda: antes ou durante a execução?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-1-prever',
        type: 'predict-output',
        prompt:
          'O que este programa imprime? Lembre que os tipos são apagados antes de rodar.',
        concepts: ['ts-por-que'],
        difficulty: 'iniciante',
        tags: ['typescript', 'tipos'],
        code: `function dobro(n: number): number {
  return n * 2;
}

const resultado: number = dobro(4);
console.log(resultado);
console.log(typeof resultado);
console.log(typeof dobro);`,
        expectedOutput: '8\nnumber\nfunction',
        explanation:
          'Com as anotações apagadas, sobra JavaScript comum: `dobro(4)` é 8, `typeof 8` é `"number"` e `typeof` de uma função é `"function"`. O `: number` não aparece em lugar nenhum da saída — ele já cumpriu o papel dele, no compilador.',
        hints: ['Apague mentalmente cada `: number` e leia o que sobrou.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-1-lacuna-anotar',
        type: 'fill-blank',
        prompt: 'Complete as anotações com o tipo de cada valor.',
        concepts: ['ts-por-que'],
        difficulty: 'iniciante',
        tags: ['typescript', 'tipos'],
        template: `const nome: {{1}} = 'Ana';
const idade: {{2}} = 30;
const ativo: {{3}} = true;
const notas: {{4}} = [7, 8.5, 9];

console.log(nome, idade, ativo, notas.length);`,
        blanks: [
          { placeholder: 'tipo', size: 8 },
          { placeholder: 'tipo', size: 8 },
          { placeholder: 'tipo', size: 8 },
          { placeholder: 'tipo', size: 9 },
        ],
        tests: [
          {
            description: 'o programa roda e imprime os quatro valores',
            assertion: `
              if (nome !== 'Ana' || idade !== 30 || ativo !== true || notas.length !== 3) throw new Error('Os valores deveriam continuar os mesmos: as anotações não mudam o que roda.');
            `,
          },
        ],
        typeTests: [
          { description: 'nome é texto', code: 'const t1: string = nome; t1.toUpperCase();' },
          { description: 'idade é número', code: 'const t2: number = idade; t2.toFixed(0);' },
          { description: 'ativo é booleano', code: 'const t3: boolean = ativo;' },
          { description: 'notas é uma lista de números', code: 'const t4: number = notas[0] + 1;' },
          { description: 'o compilador recusa guardar o nome num número', code: 'const t5: number = nome;', rejects: true },
          { description: 'o compilador recusa uma nota em texto', code: "notas.push('dez');", rejects: true },
        ],
        hints: [
          'Os três primeiros são o que `typeof` diria de cada valor.',
          'Uma lista de números se escreve com o tipo do item seguido de colchetes.',
        ],
        solution: ['string', 'number', 'boolean', 'number[]'],
        explanation:
          'Os tipos básicos têm os nomes do `typeof`: `string`, `number`, `boolean`. Uma lista é o tipo do item com `[]` — `number[]` é "lista de números", e é por isso que `notas.push(\'dez\')` é recusado: o compilador sabe o que a lista guarda e não deixa entrar outra coisa.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-1-somar',
        type: 'code',
        prompt:
          'Anote `somar` de forma que ela só aceite números e declare que devolve número. O teste cobra as duas coisas: `somar(2, 3)` é `5`, e `somar(\'2\', 3)` é **recusado pelo compilador**.',
        concepts: ['ts-por-que'],
        difficulty: 'iniciante',
        tags: ['typescript', 'tipos', 'funcoes'],
        initialCode: `function somar(a: any, b: any): any {
  return a + b;
}
`,
        tests: [
          {
            description: 'somar(2, 3) devolve 5',
            assertion: `if (somar(2, 3) !== 5) throw new Error('somar(2, 3) deveria devolver 5, devolveu ' + somar(2, 3));`,
          },
          {
            description: 'somar(0.1, 0.2) devolve a soma dos dois',
            assertion: `if (Math.abs(somar(0.1, 0.2) - 0.3) > 1e-9) throw new Error('somar(0.1, 0.2) deveria devolver 0.3 (com a imprecisão normal do ponto flutuante).');`,
          },
        ],
        typeTests: [
          { description: "o compilador recusa somar('2', 3)", code: "somar('2', 3);", rejects: true },
          { description: 'o compilador recusa somar(2, true)', code: 'somar(2, true);', rejects: true },
          { description: 'o resultado é aceito como número', code: 'const r: number = somar(1, 2);' },
          { description: 'o resultado é recusado como texto', code: 'const s: string = somar(1, 2);', rejects: true },
        ],
        hints: [
          '`any` aceita tudo — é justamente o que deixa `somar(\'2\', 3)` passar. Troque os três.',
          'O tipo de cada parâmetro vai depois do nome: `a: number`. O tipo do retorno vai depois dos parênteses.',
        ],
        solution: `function somar(a: number, b: number): number {
  return a + b;
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-1-bug-chamada',
        type: 'find-bug',
        prompt:
          'O compilador recusa este programa. Aponte a linha que precisa mudar.',
        concepts: ['ts-por-que'],
        difficulty: 'iniciante',
        tags: ['typescript', 'tipos', 'depuracao'],
        code: `function media(notas: number[]): number {
  let soma = 0;
  for (const nota of notas) {
    soma += nota;
  }
  return soma / notas.length;
}

const boletim = media('7, 8, 9');
console.log(boletim);`,
        buggyLine: 9,
        fix: 'const boletim = media([7, 8, 9]);',
        explanation:
          '`media` declara que recebe `number[]`, uma lista de números, e a chamada passa um texto. Em JavaScript isso rodaria: o `for` percorreria os caracteres, `soma += nota` faria concatenação, e a saída seria um `NaN` difícil de rastrear. O TypeScript para na linha 9, com `Argument of type \'string\' is not assignable to parameter of type \'number[]\'` — o argumento é texto, o parâmetro pede lista de números. É o exemplo da aula: o erro aparece na chamada errada, antes de rodar.',
        hints: [
          'A função está certa. Olhe para quem a chama.',
          'Compare o tipo do parâmetro com o que a chamada passa.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-1-any',
        type: 'multiple-choice',
        prompt: 'O que `const dado: any = obterDado()` faz com o restante do programa?',
        concepts: ['ts-por-que'],
        difficulty: 'iniciante',
        tags: ['typescript', 'tipos'],
        options: [
          'Faz o compilador deduzir o tipo pelo valor devolvido',
          'Desliga a verificação para `dado`: qualquer uso compila, e o erro volta a aparecer só em execução',
          'Aceita qualquer valor, mas ainda avisa quando um método não existe',
          'É o mesmo que `unknown`',
        ],
        correctIndex: 1,
        explanation:
          '`any` é o interruptor de desligar. `dado.qualquer.coisa()` compila, e explode em execução exatamente como no JavaScript. Diferente de `unknown` (que aparece mais adiante na trilha), `any` não pede verificação nenhuma antes de usar. Ele existe para migrar código antigo aos poucos; em código novo, cada `any` é um lugar onde o compilador deixou de ajudar.',
        hints: ['O nome diz: "qualquer". Qualquer valor entra, e qualquer uso sai — sem conferência.'],
      },
    },
    {
      kind: 'summary',
      markdown: `TypeScript é JavaScript com o contrato escrito: \`nome: tipo\` em parâmetros, variáveis e retornos. O compilador confere tudo antes de rodar e recusa o que não bate, na linha do erro; depois apaga as anotações, e o que roda é JavaScript puro. Anote os parâmetros sempre — são a fronteira entre quem escreve e quem chama. \`any\` desliga a verificação; nesta trilha ele não entra.`,
    },
  ],
};

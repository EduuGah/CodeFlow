import type { Lesson } from '../types';

export const lessonFuncoesTipadas: Lesson = {
  id: 'lesson-ts-5',
  trackId: 'track-typescript',
  title: 'Funções: O Contrato Completo',
  language: 'typescript',
  objective:
    'Tipar parâmetros opcionais, valores padrão, retorno (inclusive void) e funções passadas como valor — o contrato inteiro de uma função, dos dois lados.',
  concepts: ['ts-funcoes'],
  status: 'published',
  estimatedMinutes: 26,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Uma função tem dois lados: quem a escreve e quem a chama. O tipo é o contrato entre eles. Você já anota parâmetros; esta aula completa o contrato.

## Parâmetro opcional e valor padrão

~~~typescript
function repetir(texto: string, vezes?: number): string {
  return texto.repeat(vezes ?? 1);
}

function saudar(nome: string, saudacao = 'Olá'): string {
  return saudacao + ', ' + nome + '!';
}
~~~

\`vezes?: number\` pode ser omitido, e dentro da função é \`number | undefined\` — a união da aula passada, com tudo o que ela cobra. \`saudacao = 'Olá'\` é o mesmo, resolvido: o compilador deduz \`string\` do padrão, e dentro da função \`saudacao\` é sempre texto. Quando há um padrão razoável, prefira o valor padrão ao \`?\`: menos \`undefined\` para tratar.

Um opcional só pode vir **depois** dos obrigatórios. \`function f(a?: number, b: number)\` é recusado.

## O retorno

O compilador deduz o retorno, mas anotá-lo tem dois usos. Numa função longa, o erro aparece no \`return\` errado, e não em quem chama. E \`void\` diz que a função **não devolve nada**:

~~~typescript
function registrar(mensagem: string): void {
  console.log('[log]', mensagem);
}
~~~

Quem escrever \`const r = registrar('x')\` e tentar usar \`r\` como texto é recusado. Sem o \`void\`, o compilador deduziria o mesmo — mas escrito, é documentação que o compilador confere.

## Função como valor

Funções passam por parâmetro o tempo todo: \`map\`, \`filter\`, \`addEventListener\`, o \`callback\` da aula de assincronia. O tipo de uma função é a assinatura dela com a seta:

~~~typescript
type Transformar = (n: number) => number;

function aplicar(lista: number[], fn: Transformar): number[] {
  const saida: number[] = [];
  for (const n of lista) {
    saida.push(fn(n));
  }
  return saida;
}

aplicar([1, 2, 3], (n) => n * 2);       // [2, 4, 6]
aplicar([1, 2, 3], (n) => n.toFixed()); // recusado: devolve string
~~~

\`(n: number) => number\` lê-se "recebe um número, devolve um número". E repare: na chamada, \`(n) => n * 2\` **não anota \`n\`**. O compilador sabe, pelo tipo de \`fn\`, que \`n\` é número — a inferência funciona ao contrário, do parâmetro para o argumento. É por isso que \`lista.map((x) => …)\` nunca precisa de anotação.

## Retornos que dependem da entrada

\`function primeiro(lista: string[]): string\` mente: uma lista vazia não tem primeiro. O tipo honesto é \`string | undefined\`, e quem chama vai ter que estreitar. Isso parece chato e é o contrário: a mentira no tipo é o \`undefined\` que estoura em produção. Escreva o retorno que a função pode de fato devolver.

## Os erros

- Chamar com argumentos a menos ou a mais: \`Expected 2 arguments, but got 1\`.
- Passar uma função com a assinatura errada para um parâmetro de função.
- Usar o resultado de uma função \`void\`.
- Opcional antes de obrigatório.
`.trim(),
    },
    {
      kind: 'example',
      language: 'typescript',
      code: `type Comparar = (a: number, b: number) => number;

function ordenar(lista: number[], comparar: Comparar = (a, b) => a - b): number[] {
  return [...lista].sort(comparar);
}

function primeiro(lista: number[]): number | undefined {
  return lista[0];
}

const notas = [7, 10, 8.5];

console.log(ordenar(notas));                 // [7, 8.5, 10]
console.log(ordenar(notas, (a, b) => b - a)); // [10, 8.5, 7]

const maior = primeiro(ordenar(notas, (a, b) => b - a));
if (maior !== undefined) {
  console.log('maior: ' + maior.toFixed(1)); // maior: 10.0
}`,
      caption:
        'Um parâmetro de função com valor padrão; um retorno honesto (`number | undefined`) que obriga o `if` antes do `toFixed`. Sem o `if`, o compilador recusa — e é exatamente o caso da lista vazia que o `if` protege.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-5-opcional',
        type: 'multiple-choice',
        prompt: 'Em `function repetir(texto: string, vezes?: number)`, qual é o tipo de `vezes` dentro da função?',
        concepts: ['ts-funcoes'],
        difficulty: 'iniciante',
        tags: ['typescript', 'funcoes'],
        options: [
          '`number`, porque foi anotado assim',
          '`number | undefined`: quem chama pode omitir, e o compilador cobra a verificação antes de usar como número',
          '`number`, com valor 0 quando omitido',
          '`any`, porque é opcional',
        ],
        correctIndex: 1,
        explanation:
          'O `?` no parâmetro é o mesmo `?` da propriedade opcional: pode faltar, e faltar é `undefined`. Dentro da função, `vezes * 2` é recusado até um `vezes ?? 1` ou um `if`. Se há um padrão razoável, `vezes = 1` resolve os dois problemas de uma vez — o chamador pode omitir, e dentro `vezes` é sempre `number`.',
        hints: ['Lembre da propriedade opcional na interface: o que o `?` acrescenta ao tipo?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-5-prever',
        type: 'predict-output',
        prompt: 'O que este programa imprime? Repare no valor padrão e na última linha.',
        concepts: ['ts-funcoes'],
        difficulty: 'intermediario',
        tags: ['typescript', 'funcoes'],
        code: `function saudar(nome: string, saudacao = 'Olá'): string {
  return saudacao + ', ' + nome + '!';
}

console.log(saudar('Ana'));
console.log(saudar('Bia', 'Oi'));
console.log(saudar.length);`,
        expectedOutput: 'Olá, Ana!\nOi, Bia!\n1',
        explanation:
          'Sem o segundo argumento, `saudacao` vale `\'Olá\'`; com ele, vale o que foi passado. A última linha é JavaScript puro: `funcao.length` conta os parâmetros **antes do primeiro com valor padrão** — só `nome`. O tipo `= \'Olá\'` não muda isso, porque em execução ele nem existe.',
        hints: ['`f.length` de uma função conta parâmetros, mas para no primeiro que tem padrão.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-5-aplicar',
        type: 'code',
        prompt:
          'Tipe `aplicar`: recebe uma lista de números e uma função que transforma um número em outro, e devolve a lista transformada. Os testes cobram o contrato: `(n) => n * 2` é aceito sem anotar `n`; uma função que recebe texto, ou algo que não é função, é recusado.',
        concepts: ['ts-funcoes'],
        difficulty: 'intermediario',
        tags: ['typescript', 'funcoes'],
        initialCode: `function aplicar(lista: any, fn: any): any {
  const saida = [];
  for (const n of lista) {
    saida.push(fn(n));
  }
  return saida;
}
`,
        tests: [
          {
            description: 'aplicar([1, 2, 3], (n) => n * 2) devolve [2, 4, 6]',
            assertion: `const r = aplicar([1, 2, 3], (n) => n * 2); if (JSON.stringify(r) !== '[2,4,6]') throw new Error('Esperava [2, 4, 6], veio ' + JSON.stringify(r));`,
          },
          {
            description: 'com lista vazia devolve lista vazia',
            assertion: `const r = aplicar([], (n) => n + 1); if (JSON.stringify(r) !== '[]') throw new Error('Esperava [], veio ' + JSON.stringify(r));`,
          },
        ],
        typeTests: [
          { description: 'a função passada não precisa anotar o parâmetro', code: 'const dobros: number[] = aplicar([1, 2], (n) => n * 2);' },
          { description: 'uma função que recebe texto é recusada', code: 'aplicar([1], (s: string) => s.length);', rejects: true },
          { description: 'uma função que devolve texto é recusada', code: 'aplicar([1], (n: number) => String(n));', rejects: true },
          { description: 'algo que não é função é recusado', code: "aplicar([1], 'dobro');", rejects: true },
          { description: 'uma lista de textos é recusada', code: "aplicar(['a'], (n: string) => n.length);", rejects: true },
        ],
        hints: [
          'O tipo de uma função é a assinatura com a seta: `(n: number) => number`.',
          'Três anotações: `lista: number[]`, `fn: (n: number) => number`, e o retorno `number[]`. A `saida` também precisa de tipo — é uma lista vazia.',
        ],
        solution: `function aplicar(lista: number[], fn: (n: number) => number): number[] {
  const saida: number[] = [];
  for (const n of lista) {
    saida.push(fn(n));
  }
  return saida;
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-5-lacuna-tipos',
        type: 'fill-blank',
        prompt: 'Complete: o tipo da função guardada em `dobro`, e o retorno de uma função que não devolve nada.',
        concepts: ['ts-funcoes'],
        difficulty: 'iniciante',
        tags: ['typescript', 'funcoes'],
        template: `const dobro: {{1}} = (n) => n * 2;

function registrar(mensagem: string): {{2}} {
  console.log('[log] ' + mensagem);
}

registrar('dobro de 4 é ' + dobro(4));`,
        blanks: [
          { placeholder: 'tipo de função', size: 22 },
          { placeholder: 'tipo', size: 5 },
        ],
        tests: [
          {
            description: 'dobro(4) devolve 8 e a mensagem é registrada',
            assertion: `if (dobro(4) !== 8) throw new Error('dobro(4) deveria devolver 8.');`,
          },
        ],
        typeTests: [
          { description: 'dobro aceita número e devolve número', code: 'const oito: number = dobro(4);' },
          { description: 'dobro recusa texto', code: "dobro('4');", rejects: true },
          { description: 'o resultado de registrar não pode ser usado como texto', code: "const r: string = registrar('x');", rejects: true },
        ],
        hints: [
          'A assinatura com a seta: o que entra entre parênteses, o que sai depois da seta.',
          'Uma função que só faz efeito (imprime) e não devolve nada tem um retorno com nome próprio, de quatro letras.',
        ],
        solution: ['(n: number) => number', 'void'],
        explanation:
          '`(n: number) => number` é o tipo da função: com ele, o `n` da seta é deduzido e `dobro(\'4\')` é recusado. `void` declara que `registrar` não devolve nada — quem tentar guardar o resultado num texto é recusado. Os dois são o contrato escrito dos dois lados: o que a função aceita, o que ela devolve.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-5-bug-map',
        type: 'find-bug',
        prompt:
          'O compilador recusa este programa. A função passada ao `map` devolve o tipo errado para o que a variável declara. Aponte a linha.',
        concepts: ['ts-funcoes'],
        difficulty: 'iniciante',
        tags: ['typescript', 'funcoes', 'depuracao'],
        code: `const nomes = ['ana', 'bia', 'carlos'];

const tamanhos: number[] = nomes.map((nome) => nome.toUpperCase());

for (const t of tamanhos) {
  console.log(t);
}`,
        buggyLine: 3,
        fix: 'const tamanhos: number[] = nomes.map((nome) => nome.length);',
        explanation:
          '`nomes.map(…)` devolve uma lista do que a função devolve. `nome.toUpperCase()` é texto, então o `map` produz `string[]` — e a variável promete `number[]`. O compilador recusa na linha da atribuição: `Type \'string[]\' is not assignable to type \'number[]\'`. O nome da variável diz o que ela queria: o tamanho de cada nome, `nome.length`.',
        hints: [
          'O que a função dentro do `map` devolve? De que tipo é a lista que sai?',
          'Compare o tipo declarado da variável com o que o `map` produz.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-5-void',
        type: 'multiple-choice',
        prompt: 'Uma função anotada com `: void` é chamada e o resultado guardado: `const r = registrar(\'x\')`. O que acontece?',
        concepts: ['ts-funcoes'],
        difficulty: 'iniciante',
        tags: ['typescript', 'funcoes'],
        options: [
          'Erro de compilação na chamada: função `void` não pode ser chamada numa atribuição',
          'Compila; `r` tem tipo `void`, e qualquer uso dele como valor (somar, concatenar, imprimir como texto) é recusado',
          'Compila e `r` é `null`',
          'Erro em execução',
        ],
        correctIndex: 1,
        explanation:
          '`void` é um tipo como outro: "nada útil aqui". Guardar o resultado é permitido — o compilador não proíbe a atribuição —, mas `r` é `void`, e `r + 1`, `r.length` ou `const s: string = r` são recusados. Em execução, a função devolve `undefined` como qualquer função sem `return`. A anotação existe para o leitor e para pegar quem espera um valor onde não há.',
        hints: ['O compilador recusa usos, não atribuições. O que dá para fazer com um valor "vazio"?'],
      },
    },
    {
      kind: 'summary',
      markdown: `O contrato de uma função tem os dois lados: \`param?: T\` ou \`param = padrão\` para o que pode faltar (padrão é melhor, quando há um), o retorno anotado quando ajuda e \`void\` quando não há retorno, e \`(a: A) => B\` como tipo de uma função passada como valor — que deixa o compilador deduzir o parâmetro na chamada. Escreva o retorno que a função pode devolver de verdade, \`| undefined\` incluído.`,
    },
  ],
};

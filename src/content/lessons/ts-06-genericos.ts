import type { Lesson } from '../types';

export const lessonGenericos: Lesson = {
  id: 'lesson-ts-6',
  trackId: 'track-typescript',
  title: 'Genéricos: Uma Função para Vários Tipos',
  language: 'typescript',
  objective:
    'Escrever funções e interfaces que funcionam para qualquer tipo sem perder o tipo — com parâmetros de tipo (`<T>`), restrições (`extends`) e os genéricos que já vêm prontos: Array, Promise, Map.',
  concepts: ['ts-genericos'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Uma função que devolve o primeiro item de uma lista:

~~~typescript
function primeiro(lista: number[]): number | undefined {
  return lista[0];
}
~~~

Funciona para números. Para textos, você escreveria outra igual com \`string\`. Para produtos, outra. A tentação é \`any\`:

~~~typescript
function primeiro(lista: any[]): any {
  return lista[0];
}

const p = primeiro(['a', 'b']);   // p é any — o compilador desistiu
p.toFixed();                       // compila, e explode em execução
~~~

\`any\` aceita tudo e **esquece** tudo: o que entra como lista de textos sai como "qualquer coisa". O compilador deixou de ajudar exatamente onde mais importa.

## O parâmetro de tipo

~~~typescript
function primeiro<T>(lista: T[]): T | undefined {
  return lista[0];
}

const n = primeiro([1, 2, 3]);      // n é number | undefined
const s = primeiro(['a', 'b']);     // s é string | undefined
~~~

\`<T>\` declara um **parâmetro de tipo**: uma variável que vale um tipo, decidida a cada chamada. Na primeira, \`T\` é \`number\`; na segunda, \`string\`. O compilador deduz \`T\` do argumento — você quase nunca escreve \`primeiro<number>([1, 2])\` — e o retorno sai com o tipo certo. A função é uma só, e nada se perde.

\`T\` é só um nome; \`Item\` ou \`Valor\` funcionam igual. A convenção de uma letra vem de longe e é a que você vai encontrar.

## Genéricos que você já usa

\`number[]\` é açúcar para \`Array<number>\`. \`Promise<Usuario>\` é uma promessa que resolve com um usuário — e \`await\` devolve \`Usuario\`. \`Map<string, number>\` guarda chaves texto e valores número. Cada um é uma interface genérica: a mesma estrutura, com o tipo de dentro decidido por você.

E você declara as suas:

~~~typescript
interface Resposta<T> {
  ok: boolean;
  dados: T;
}

const r: Resposta<number[]> = { ok: true, dados: [1, 2, 3] };
~~~

É o formato de toda resposta de API: o envelope é sempre o mesmo; o que vai dentro muda.

## Restringir o tipo

~~~typescript
// @recusado
function nomeDe<T>(item: T): string {
  return item.nome;    // Property 'nome' does not exist on type 'T'
}
~~~

\`T\` pode ser **qualquer** tipo, inclusive \`number\` — e número não tem \`nome\`. Se a função precisa de algo do tipo, diga o mínimo que ele precisa ter:

~~~typescript
function nomeDe<T extends { nome: string }>(item: T): string {
  return item.nome;
}

nomeDe({ nome: 'Ana', idade: 30 });   // aceito: tem nome
nomeDe({ idade: 30 });                // recusado: falta nome
~~~

\`extends\` aqui significa "qualquer tipo que tenha pelo menos isto". O tipo completo do argumento é preservado — é a diferença para simplesmente anotar \`item: { nome: string }\`.

## Tuplas, de passagem

\`[A, B]\` é uma lista de tamanho e tipos fixos: \`[string, number]\` tem exatamente um texto e depois um número. Aparece quando uma função devolve duas coisas — \`function par<A, B>(a: A, b: B): [A, B]\`.

## Quando usar

Um genérico entra quando a função (ou interface) **não se importa** com o tipo de dentro mas precisa **preservá-lo**: o que entra como \`X\` sai como \`X\`. Se a função só aceita um tipo, anote o tipo. Se ela precisa de partes específicas, \`extends\`. Genérico por reflexo é o \`any\` com roupa nova.
`.trim(),
    },
    {
      kind: 'example',
      language: 'typescript',
      code: `interface Resposta<T> {
  ok: boolean;
  dados: T;
}

interface Produto { id: number; nome: string }

function buscarPor<T extends { id: number }>(itens: T[], id: number): T | undefined {
  for (const item of itens) {
    if (item.id === id) return item;
  }
  return undefined;
}

const resposta: Resposta<Produto[]> = {
  ok: true,
  dados: [
    { id: 1, nome: 'Caderno' },
    { id: 2, nome: 'Caneta' },
  ],
};

const achado = buscarPor(resposta.dados, 2);   // Produto | undefined
console.log(achado?.nome ?? 'nenhum');         // Caneta
console.log(buscarPor(resposta.dados, 9)?.nome ?? 'nenhum');  // nenhum`,
      caption:
        '`Resposta<T>` é o envelope; `buscarPor<T extends { id: number }>` serve para qualquer lista de coisas com `id` e devolve o tipo exato da lista — `achado.nome` compila porque `T` é `Produto`. O `?.` e o `??` tratam o `undefined` honesto do retorno.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-6-any-esquece',
        type: 'multiple-choice',
        prompt: 'Qual é o problema de `function primeiro(lista: any[]): any` em comparação com `function primeiro<T>(lista: T[]): T | undefined`?',
        concepts: ['ts-genericos'],
        difficulty: 'iniciante',
        tags: ['typescript', 'genericos'],
        options: [
          'A versão com `any` é mais lenta em execução',
          'A versão com `any` aceita qualquer lista mas devolve "qualquer coisa": o tipo do item se perde, e o compilador deixa de conferir o que se faz com o resultado',
          'A versão com `any` não aceita listas vazias',
          'Não há problema: as duas fazem o mesmo',
        ],
        correctIndex: 1,
        explanation:
          'Em execução as duas são idênticas — os tipos são apagados. A diferença é o que o compilador sabe depois da chamada: com `<T>`, `primeiro([\'a\'])` é `string | undefined`, e `.toFixed()` nele é recusado; com `any`, o resultado é `any`, e qualquer uso compila, inclusive o errado. O genérico preserva o tipo de entrada até a saída.',
        hints: ['Pense no que o compilador sabe sobre o resultado depois de chamar cada versão.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-6-prever',
        type: 'predict-output',
        prompt: 'O que este programa imprime? Os parâmetros de tipo são apagados como qualquer anotação.',
        concepts: ['ts-genericos'],
        difficulty: 'iniciante',
        tags: ['typescript', 'genericos'],
        code: `function par<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}

const p = par('x', 1);
console.log(JSON.stringify(p));
console.log(typeof p[0], typeof p[1]);
console.log(p.length);`,
        expectedOutput: '["x",1]\nstring number\n2',
        explanation:
          '`par` devolve uma lista com os dois valores, e é isso que roda: `["x",1]`. Para o compilador, `p` é a tupla `[string, number]` — `p[0]` é texto, `p[1]` é número, e `p[2]` seria recusado. Em execução é um array comum de tamanho 2. Os `<A, B>` não deixam rastro.',
        hints: ['Apague os tipos e leia: a função devolve um array com dois itens.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-6-ultimo',
        type: 'code',
        prompt:
          'Torne `ultimo` genérica: recebe uma lista de qualquer tipo e devolve o último item — ou `undefined` para lista vazia — **com o tipo preservado**. Os testes cobram que o resultado de `ultimo([1, 2])` seja tratado como número, e que `ultimo(5)` seja recusado.',
        concepts: ['ts-genericos'],
        difficulty: 'intermediario',
        tags: ['typescript', 'genericos'],
        initialCode: `function ultimo(lista: any): any {
  return lista[lista.length - 1];
}
`,
        tests: [
          {
            description: 'ultimo([1, 2, 3]) devolve 3',
            assertion: `if (ultimo([1, 2, 3]) !== 3) throw new Error('ultimo([1, 2, 3]) deveria devolver 3.');`,
          },
          {
            description: "ultimo(['a', 'b']) devolve 'b'",
            assertion: `if (ultimo(['a', 'b']) !== 'b') throw new Error("ultimo(['a', 'b']) deveria devolver 'b'.");`,
          },
          {
            description: 'ultimo([]) devolve undefined',
            assertion: `if (ultimo([]) !== undefined) throw new Error('ultimo([]) deveria devolver undefined.');`,
          },
        ],
        typeTests: [
          { description: 'o resultado de uma lista de números é número (ou undefined)', code: 'const n: number | undefined = ultimo([1, 2]);' },
          { description: 'o resultado de uma lista de textos é texto (ou undefined)', code: "const s: string | undefined = ultimo(['a']);" },
          { description: 'o tipo não se perde: usar o resultado como texto quando a lista era de números é recusado', code: 'const t: string = ultimo([1, 2]);', rejects: true },
          { description: 'o resultado pode ser undefined: usar direto como número é recusado', code: 'const u: number = ultimo([1, 2]);', rejects: true },
          { description: 'algo que não é lista é recusado', code: 'ultimo(5);', rejects: true },
        ],
        hints: [
          'Declare o parâmetro de tipo antes dos parênteses: `function ultimo<T>(…)`.',
          'A lista é `T[]`, e o retorno é `T | undefined` — a lista pode estar vazia.',
        ],
        solution: `function ultimo<T>(lista: T[]): T | undefined {
  return lista[lista.length - 1];
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-6-lacuna-resposta',
        type: 'fill-blank',
        prompt: 'Complete a interface genérica e o uso dela: o envelope de uma resposta, com `dados` do tipo que cada chamada decide.',
        concepts: ['ts-genericos'],
        difficulty: 'iniciante',
        tags: ['typescript', 'genericos'],
        template: `interface Resposta<{{1}}> {
  ok: boolean;
  dados: {{2}};
}

const numeros: Resposta<{{3}}> = { ok: true, dados: [1, 2, 3] };
const nome: Resposta<string> = { ok: true, dados: 'Ana' };

console.log(numeros.dados.length, nome.dados.toUpperCase());`,
        blanks: [
          { placeholder: 'parâmetro', size: 3 },
          { placeholder: 'tipo', size: 3 },
          { placeholder: 'tipo', size: 9 },
        ],
        tests: [
          {
            description: 'os dois envelopes existem com os dados certos',
            assertion: `if (numeros.dados.length !== 3 || nome.dados !== 'Ana') throw new Error('numeros.dados deveria ter 3 itens e nome.dados ser Ana.');`,
          },
        ],
        typeTests: [
          { description: 'dados de outro tipo são recusados', code: "const errado: Resposta<string> = { ok: true, dados: 5 };", rejects: true },
          { description: 'o tipo de dados é preservado ao ler', code: 'const primeiro: number = numeros.dados[0];' },
        ],
        hints: [
          'O parâmetro de tipo é declarado entre `<` e `>` depois do nome, e usado como tipo da propriedade.',
          'Na terceira lacuna vai o tipo concreto dos dados: uma lista de números.',
        ],
        solution: ['T', 'T', 'number[]'],
        explanation:
          '`Resposta<T>` declara o parâmetro; `dados: T` o usa. Cada uso escolhe: `Resposta<number[]>` faz `dados` ser `number[]` e `Resposta<string>` faz ser texto — e o compilador confere cada um (`dados: 5` num `Resposta<string>` é recusado). Uma interface, todos os formatos de resposta.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-6-bug-restricao',
        type: 'find-bug',
        prompt:
          'O compilador recusa: `Property \'nome\' does not exist on type \'T\'`. Aponte a linha que precisa mudar.',
        concepts: ['ts-genericos'],
        difficulty: 'intermediario',
        tags: ['typescript', 'genericos', 'depuracao'],
        code: `function nomeDe<T>(item: T): string {
  return item.nome.toUpperCase();
}

const produto = { id: 1, nome: 'Caderno' };
console.log(nomeDe(produto));`,
        buggyLine: 1,
        fix: 'function nomeDe<T extends { nome: string }>(item: T): string {',
        symptomLine: 2,
        symptomFeedback:
          'É onde o erro aparece: `item.nome` num `T` que pode ser qualquer coisa. Mas a linha está certa — o que falta é a promessa, na declaração de `T`, de que ele tem `nome`.',
        explanation:
          '`<T>` sem restrição é qualquer tipo, inclusive `number` e `boolean`, e neles `nome` não existe. O compilador recusa `item.nome` na linha 2 — o sintoma —, mas a causa está na declaração: `T` prometeu menos do que a função usa. `T extends { nome: string }` diz o mínimo que `T` precisa ter; `nomeDe(produto)` continua aceito (tem `nome`), e `nomeDe(5)` passa a ser recusado na chamada, com a explicação certa.',
        hints: [
          'O erro aparece onde `nome` é usado, mas a pergunta é: o que o compilador sabe sobre `T`?',
          'A restrição de um parâmetro de tipo se escreve na declaração dele, com `extends`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-6-promise',
        type: 'multiple-choice',
        prompt: 'Uma função é declarada como `async function carregar(): Promise<Usuario>`. O que `const u = await carregar()` produz para o compilador?',
        concepts: ['ts-genericos'],
        difficulty: 'iniciante',
        tags: ['typescript', 'genericos', 'promises'],
        options: [
          '`u` é `Promise<Usuario>`, e é preciso chamar `.then` para chegar ao usuário',
          '`u` é `Usuario`: `Promise<T>` é o genérico da promessa, e `await` desembrulha o `T`',
          '`u` é `any`, porque promessas não carregam tipo',
          '`u` é `Usuario | undefined`',
        ],
        correctIndex: 1,
        explanation:
          '`Promise<Usuario>` diz "uma promessa que resolve com um usuário". É uma interface genérica como `Resposta<T>`, e `await` devolve o que está dentro: `Usuario`. Daí `u.nome` compila, e `u.toFixed()` não. É o mesmo mecanismo de `Array<T>` e `Map<K, V>` — o tipo de dentro é decidido por quem declara, e o compilador o carrega até o uso.',
        hints: ['`Promise<T>` é como `Resposta<T>`: o que interessa está no `T`. O que o `await` faz com a promessa?'],
      },
    },
    {
      kind: 'summary',
      markdown: `\`<T>\` é uma variável que vale um tipo, decidida a cada chamada: o que entra como \`T\` sai como \`T\`, e nada se perde — ao contrário de \`any\`, que aceita tudo e esquece tudo. Interfaces também são genéricas (\`Resposta<T>\`, e as prontas: \`Array<T>\`, \`Promise<T>\`, \`Map<K, V>\`). \`T extends { nome: string }\` diz o mínimo que o tipo precisa ter. Genérico só quando a função não se importa com o tipo mas precisa preservá-lo.`,
    },
  ],
};

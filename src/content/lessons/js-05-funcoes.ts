import type { Lesson } from '../types';

export const lessonFuncoes: Lesson = {
  id: 'lesson-js-5',
  trackId: 'track-js-fundamentos',
  title: 'Funções: Nomear um Pedaço de Lógica',
  language: 'javascript',
  objective: 'Escrever funções que recebem dados, devolvem um resultado e podem ser reaproveitadas.',
  concepts: ['funcoes', 'variaveis'],
  status: 'published',
  estimatedMinutes: 16,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Uma **função** é um trecho de lógica com nome. Você a escreve uma vez e usa quantas vezes quiser, com dados diferentes.

~~~javascript
function saudar(nome) {
  return 'Olá, ' + nome;
}

saudar('Ana');     // 'Olá, Ana'
saudar('Bruno');   // 'Olá, Bruno'
~~~

Sem funções, cada uso exigiria repetir a lógica. E quando a regra mudasse, você teria que achar todas as cópias — e a que você esquecesse viraria um bug.

Duas partes costumam confundir no começo:

- **parâmetros** — os dados que a função recebe. São variáveis que **só existem dentro dela**.
- **\`return\`** — o valor que ela devolve para quem chamou.

## \`return\` não é \`console.log\`

Esta é a confusão número um de quem está começando, e ela custa horas:

~~~javascript
function somaImprime(a, b) {
  console.log(a + b);      // MOSTRA na tela
}

function somaDevolve(a, b) {
  return a + b;            // ENTREGA para o código
}

const x = somaImprime(2, 3);   // imprime 5, mas x fica undefined
const y = somaDevolve(2, 3);   // não imprime nada, mas y vale 5

console.log(x * 2);   // NaN  — undefined vezes 2
console.log(y * 2);   // 10
~~~

\`console.log\` é para **você** ver. \`return\` é para o **programa** usar. Uma função que só imprime não pode ter o resultado reaproveitado numa conta.

## O \`return\` encerra a função na hora

Nada depois dele executa:

~~~javascript
function verificar(idade) {
  if (idade < 0) {
    return 'inválida';    // sai aqui mesmo
  }

  return idade >= 18 ? 'adulto' : 'menor';
}
~~~

É por isso que uma sequência de \`return\` dispensa \`else\`: se o primeiro passou, o resto nem é alcançado. Isso deixa o código mais raso e mais fácil de ler.

E uma função sem \`return\` devolve \`undefined\` — não devolve nada por acidente, devolve \`undefined\` de propósito.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `function dobro(numero) {
  return numero * 2;
}

const resultado = dobro(5) + dobro(10);
console.log(resultado); // 30

// Compare com esta, que imprime mas não devolve nada:
function dobroQueSoImprime(numero) {
  console.log(numero * 2);
}

const nada = dobroQueSoImprime(5); // imprime 10, mas 'nada' fica undefined`,
      caption:
        'Sem return, a função devolve undefined — mesmo que tenha impresso algo no console.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-5-return',
        type: 'predict-output',
        prompt: 'O que este código imprime?',
        concepts: ['funcoes'],
        difficulty: 'iniciante',
        tags: ['javascript', 'funcoes', 'return'],
        code: `function somar(a, b) {
  console.log(a + b);
}

const total = somar(2, 3);
console.log(total);`,
        expectedOutput: '5\nundefined',
        explanation:
          'A função imprime 5 por causa do `console.log` interno. Mas como ela não tem `return`, devolve `undefined` — e é isso que `total` guarda. Imprimir não é devolver.',
        hints: [
          'A função tem console.log, mas não tem return. O que ela entrega de volta?',
          'Serão duas linhas impressas: uma de dentro da função, outra de fora.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-5-lacuna-return',
        type: 'fill-blank',
        prompt:
          'A estrutura da função já está pronta. Falta a parte que **devolve** o resultado para quem chamou.',
        concepts: ['funcoes'],
        difficulty: 'iniciante',
        tags: ['javascript', 'funcoes'],
        template: `function areaDoRetangulo(largura, altura) {
  const area = largura {{1}} altura;
  {{2}} area;
}`,
        blanks: [
          { placeholder: 'operador', size: 8 },
          { placeholder: 'palavra-chave', size: 10 },
        ],
        tests: [
          {
            description: 'areaDoRetangulo(3, 4) devolve 12',
            assertion: `if (areaDoRetangulo(3, 4) !== 12) throw new Error("areaDoRetangulo(3, 4) deveria devolver 12, mas devolveu " + areaDoRetangulo(3, 4) + ".");`,
          },
          {
            description: 'areaDoRetangulo(1, 1) devolve 1',
            assertion: `if (areaDoRetangulo(1, 1) !== 1) throw new Error("areaDoRetangulo(1, 1) deveria devolver 1, mas devolveu " + areaDoRetangulo(1, 1) + ".");`,
          },
        ],
        properties: [
          {
            description: 'a área é sempre largura vezes altura',
            generate: `return { largura: Math.floor(rnd() * 50), altura: Math.floor(rnd() * 50) };`,
            check: `
              const esperado = caso.largura * caso.altura;
              const obtido = areaDoRetangulo(caso.largura, caso.altura);
              if (obtido !== esperado) {
                throw new Error("areaDoRetangulo(" + caso.largura + ", " + caso.altura + ") deveria devolver " + esperado + ", mas devolveu " + obtido + ".");
              }
            `,
          },
        ],
        explanation:
          '`return` entrega o valor para quem chamou a função. Sem ele, a função executa, calcula, e devolve `undefined` — o cálculo acontece e se perde.',
        hints: [
          'A primeira lacuna é uma conta: área de retângulo é largura vezes altura.',
          'A segunda é a palavra que faz a função **entregar** um valor de volta.',
        ],
        solution: ['*', 'return'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-5-escolher',
        type: 'multiple-choice',
        prompt:
          'Você precisa do total de uma compra para depois aplicar um desconto sobre ele. Qual função serve?',
        concepts: ['funcoes'],
        difficulty: 'iniciante',
        tags: ['javascript', 'funcoes'],
        options: [
          'function total(a, b) { console.log(a + b); }',
          'function total(a, b) { return a + b; }',
          'function total(a, b) { a + b; }',
          'function total(a, b) { console.log(a + b); return; }',
        ],
        correctIndex: 1,
        explanation:
          'Só a segunda **entrega** o valor para o código continuar usando. A primeira e a quarta mostram na tela e devolvem `undefined`. A terceira calcula e joga o resultado fora — a conta acontece e ninguém recebe.',
        hints: [
          'Você precisa usar o resultado numa conta seguinte. Mostrar na tela resolve isso?',
          'Duas dessas devolvem `undefined`, e uma delas nem guarda o resultado da conta.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-5-prever-escopo',
        type: 'predict-output',
        prompt:
          'O que este programa imprime? Repare em quais nomes existem em cada lugar.',
        concepts: ['funcoes', 'variaveis'],
        difficulty: 'intermediario',
        tags: ['javascript', 'funcoes'],
        code: `let total = 100;

function dobrar(total) {
  total = total * 2;
  return total;
}

console.log(dobrar(5));
console.log(total);`,
        expectedOutput: '10\n100',
        explanation:
          'O parâmetro `total` é uma variável **nova**, que só existe dentro da função — ela apenas tem o mesmo nome da de fora. Alterá-la não toca na externa. Por isso a função devolve 10 e o `total` de fora continua 100.',
        hints: [
          'O parâmetro e a variável de fora têm o mesmo nome. São a mesma variável?',
          'Um parâmetro nasce a cada chamada, com o valor que foi passado.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-5-media',
        type: 'code',
        prompt: `Crie a função \`media(a, b, c)\` que **retorna** a média aritmética dos três números.\n\nExemplo: \`media(6, 7, 8)\` devolve 7.`,
        concepts: ['funcoes', 'operadores'],
        difficulty: 'iniciante',
        tags: ['javascript', 'funcoes', 'return'],
        initialCode: `function media(a, b, c) {
  // Seu código aqui
}

console.log(media(6, 7, 8)); // esperado: 7
`,
        hints: [
          'Média é a soma dividida pela quantidade de valores.',
          'Some os três primeiro e só depois divida — a ordem das operações importa.',
          'Sem parênteses, a + b + c / 3 divide apenas o c.',
          'return (a + b + c) / 3;',
        ],
        tests: [
          {
            description: 'A função media existe',
            assertion: `if (typeof media !== 'function') throw new Error("Crie uma função chamada 'media'.");`,
          },
          {
            description: 'media(6, 7, 8) devolve 7',
            assertion: `if (media(6, 7, 8) !== 7) throw new Error("media(6, 7, 8) deveria devolver 7, mas devolveu " + media(6, 7, 8) + ". Use return e confira os parênteses da soma.");`,
          },
          {
            description: 'media(10, 10, 10) devolve 10',
            assertion: `if (media(10, 10, 10) !== 10) throw new Error("media(10, 10, 10) deveria devolver 10, mas devolveu " + media(10, 10, 10) + ".");`,
          },
          {
            description: 'Funciona com resultado quebrado',
            assertion: `const r = media(1, 2, 2);
if (Math.abs(r - 1.6666666666666667) > 1e-9) throw new Error("media(1, 2, 2) deveria devolver aproximadamente 1.667, mas devolveu " + r + ". Não arredonde o resultado.");`,
            hidden: true,
          },
        ],
        solution: `function media(a, b, c) {
  return (a + b + c) / 3;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Função recebe por **parâmetros** e devolve por **\`return\`**. Se você só imprime, o valor não volta para quem chamou — e a função não pode ser combinada com outras.`,
    },
  ],
};

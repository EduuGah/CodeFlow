import type { Lesson } from '../types';

export const lessonTiposEOperadores: Lesson = {
  id: 'lesson-js-2',
  trackId: 'track-js-fundamentos',
  title: 'Tipos de Dados e Operadores',
  language: 'javascript',
  objective:
    'Distinguir número de texto, prever o resultado de uma operação entre eles, e converter com segurança.',
  concepts: ['tipos-de-dados', 'operadores'],
  status: 'published',
  estimatedMinutes: 20,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Todo valor em JavaScript tem um **tipo**, e o tipo decide o que os operadores fazem com ele. Os que aparecem primeiro:

| Tipo | Exemplos | Para que serve |
| --- | --- | --- |
| \`number\` | \`10\`, \`3.5\`, \`-2\` | contas |
| \`string\` | \`"olá"\`, \`'Ana'\` | texto |
| \`boolean\` | \`true\`, \`false\` | decisões |
| \`undefined\` | \`undefined\` | ainda não tem valor |
| \`null\` | \`null\` | vazio de propósito |

Para descobrir o tipo de qualquer valor, use \`typeof\`:

~~~javascript
typeof 10;        // 'number'
typeof '10';      // 'string'   <- as aspas mudam tudo
typeof true;      // 'boolean'
~~~

Repare em \`10\` e \`'10'\`. Para os seus olhos são a mesma coisa; para o programa, não. E é dessa diferença que vem o bug mais comum de quem está começando.
`.trim(),
    },
    {
      kind: 'prose',
      markdown: `
## O \`+\` faz duas coisas diferentes

Com dois números, \`+\` **soma**. Com texto envolvido, ele **junta**:

~~~javascript
2 + 3;         // 5      — soma
'2' + '3';     // '23'   — junção
'2' + 3;       // '23'   — o número virou texto
'Ana' + ' ' + 'Silva';   // 'Ana Silva'
~~~

Quando um dos lados é texto, o JavaScript converte o outro para texto e junta. Ele não avisa, não reclama — só faz.

O detalhe que torna isso perigoso: **só o \`+\` se comporta assim**. Os outros operadores convertem para número:

~~~javascript
'10' - 5;      // 5    <- subtração converte para número
'10' * 2;      // 20
'10' / 2;      // 5
'10' + 5;      // '105'  <- só o + junta
~~~

Ou seja, \`'10' - 5\` dá 5 e \`'10' + 5\` dá \`'105'\`. Não há lógica a deduzir aqui: é uma regra da linguagem, e o jeito de não ser pego por ela é converter explicitamente antes de operar.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-2-prever',
        type: 'predict-output',
        prompt: 'Antes de executar: o que este código imprime?',
        concepts: ['tipos-de-dados', 'operadores'],
        difficulty: 'iniciante',
        tags: ['javascript', 'tipos', 'coercao'],
        code: `let a = "10";
let b = 5;

console.log(a + b);
console.log(a - b);`,
        expectedOutput: '105\n5',
        explanation:
          'Como `a` é texto, o `+` junta: "10" seguido de "5" dá "105". Já o `-` não tem versão para texto, então o JavaScript converte `a` para número e subtrai normalmente. Duas linhas quase idênticas, dois comportamentos diferentes.',
        hints: [
          'Repare no tipo de cada variável antes de decidir o que o operador faz.',
          '`a` está entre aspas. Isso muda o comportamento do `+`, mas e o do `-`?',
        ],
      },
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Converter TEXTO para NÚMERO
Number('42');      // 42
Number('3.5');     // 3.5
Number('abc');     // NaN   <- não deu, mas não lançou erro
Number('');        // 0     <- cuidado: texto vazio vira zero

// Converter NÚMERO para TEXTO
String(42);        // '42'
(42).toFixed(2);   // '42.00'  — já formatado

// Descobrir se a conversão deu certo
Number.isNaN(Number('abc'));   // true  -> era inválido
Number.isNaN(Number('42'));    // false -> era válido`,
      caption:
        '`Number` nunca lança erro: quando não consegue converter, devolve `NaN` — "não é um número". Como `NaN` se espalha silenciosamente por todas as contas seguintes, conferir logo depois de converter é o que evita um relatório inteiro cheio de `NaN`.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-2-nan',
        type: 'multiple-choice',
        prompt:
          'Um formulário devolveu `""` (texto vazio) no campo de quantidade. O código faz `Number(quantidade) * 10`. Qual é o resultado?',
        concepts: ['tipos-de-dados', 'casos-extremos'],
        difficulty: 'intermediario',
        tags: ['javascript', 'tipos'],
        options: [
          '`NaN`, porque texto vazio não é um número',
          '`0`, porque `Number("")` devolve zero',
          'Um erro, porque o campo estava vazio',
          '`undefined`, porque não havia valor',
        ],
        correctIndex: 1,
        explanation:
          '`Number("")` devolve `0`, não `NaN`. É uma das conversões mais surpreendentes da linguagem, e a consequência prática é séria: um campo que o usuário deixou em branco vira uma quantidade zero válida, em vez de ser recusado. Por isso a checagem de campo vazio precisa vir **antes** da conversão.',
        hints: [
          'Texto vazio é diferente de texto inválido. Os dois convertem para a mesma coisa?',
          'Esta é uma das conversões que surpreendem. Vale testar no console.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-2-lacuna-converter',
        type: 'fill-blank',
        prompt:
          'Os dois valores vieram de um formulário, como texto. Complete para o total ser a **soma numérica**.',
        concepts: ['tipos-de-dados', 'operadores'],
        difficulty: 'iniciante',
        tags: ['javascript', 'conversao'],
        template: `function total(precoTexto, freteTexto) {
  return {{1}}(precoTexto) + {{1}}(freteTexto);
}`,
        blanks: [{ placeholder: 'converte', size: 8 }],
        tests: [
          {
            description: 'total("40", "10") devolve 50',
            assertion: `const t = total('40', '10'); if (t !== 50) throw new Error("Esperava 50, veio " + JSON.stringify(t) + ". Se veio '4010', os textos foram juntados em vez de somados.");`,
          },
          {
            description: 'o resultado é número, não texto',
            assertion: `if (typeof total('1', '2') !== 'number') throw new Error("O resultado precisa ser um número.");`,
          },
          {
            description: 'funciona com decimais',
            assertion: `const t = total('1.5', '2.5'); if (t !== 4) throw new Error("Esperava 4, veio " + t + ".");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'o total é sempre a soma dos dois valores',
            generate: `
              return {
                preco: Math.floor(rnd() * 1000),
                frete: Math.floor(rnd() * 100),
              };
            `,
            check: `
              const obtido = total(String(caso.preco), String(caso.frete));
              const esperado = caso.preco + caso.frete;
              if (obtido !== esperado) {
                throw new Error("com '" + caso.preco + "' e '" + caso.frete + "' esperava " + esperado + ", veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        explanation:
          'Somar os dois textos direto produziria `"4010"` — junção, não soma. Converter cada um antes garante que o `+` receba dois números e faça a conta.',
        hints: [
          'A mesma função entra nas duas lacunas.',
          'É a que transforma texto em número, e tem o nome do tipo.',
        ],
        solution: ['Number'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Comparar: \`==\` e \`===\`

Existem dois operadores de igualdade, e a diferença é a mesma história de antes.

- \`==\` converte antes de comparar
- \`===\` compara valor **e** tipo

~~~javascript
'10' == 10;     // true   — converteu e achou igual
'10' === 10;    // false  — texto não é número

0 == '';        // true   <- surpresa
0 === '';       // false
~~~

O \`==\` produz resultados que ninguém consegue prever de cabeça, e por isso a recomendação universal é: **use sempre \`===\`**. Quando você precisa comparar tipos diferentes, converta explicitamente e deixe a intenção visível no código.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-2-somar',
        type: 'code',
        prompt:
          'Crie `somarSeguro(a, b)`, que soma dois valores que podem vir como texto ou número.\n\nSe **qualquer um** dos dois não for um número válido, devolva `null` em vez de `NaN`. Texto vazio conta como inválido.',
        concepts: ['tipos-de-dados', 'operadores', 'casos-extremos'],
        difficulty: 'intermediario',
        tags: ['javascript', 'tipos', 'conversao'],
        initialCode: `function somarSeguro(a, b) {
  // Converta, confira se deu certo, e só então some.
}

console.log(somarSeguro('40', 10));   // 50
console.log(somarSeguro('abc', 10));  // null
console.log(somarSeguro('', 10));     // null`,
        hints: [
          'Converta os dois primeiro, guardando em variáveis.',
          '`Number("")` devolve 0, então checar só por NaN não basta — confira o texto vazio separado.',
          '`Number.isNaN(valor)` diz se a conversão falhou.',
          'Estrutura: converta, teste os dois casos inválidos, devolva null ou a soma.',
        ],
        tests: [
          {
            description: 'A função somarSeguro existe',
            assertion: `if (typeof somarSeguro !== 'function') throw new Error("Crie uma função chamada 'somarSeguro'.");`,
          },
          {
            description: "somarSeguro('40', 10) devolve 50",
            assertion: `const r = somarSeguro('40', 10); if (r !== 50) throw new Error("Esperava 50, veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: "texto inválido devolve null",
            assertion: `const r = somarSeguro('abc', 10); if (r !== null) throw new Error("Esperava null, veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'texto vazio também é inválido',
            assertion: `const r = somarSeguro('', 10); if (r !== null) throw new Error("Texto vazio virou " + JSON.stringify(r) + ". Lembre que Number('') devolve 0, não NaN.");`,
            hidden: true,
          },
          {
            description: 'nunca devolve NaN',
            assertion: `
              for (const entrada of ['abc', '', null, undefined, {}]) {
                const r = somarSeguro(entrada, 1);
                if (typeof r === 'number' && Number.isNaN(r)) {
                  throw new Error("Com " + JSON.stringify(entrada) + " devolveu NaN. Devolva null nos casos inválidos.");
                }
              }
            `,
            hidden: true,
          },
          {
            description: 'dois números normais funcionam',
            assertion: `const r = somarSeguro(2, 3); if (r !== 5) throw new Error("Esperava 5, veio " + JSON.stringify(r) + ".");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'números válidos somam, e qualquer inválido devolve null',
            generate: `
              const invalidos = ['abc', '', null, undefined, {}];
              const aEhValido = rnd() < 0.6;
              const bEhValido = rnd() < 0.6;

              return {
                a: aEhValido ? Math.floor(rnd() * 100) : invalidos[Math.floor(rnd() * invalidos.length)],
                b: bEhValido ? Math.floor(rnd() * 100) : invalidos[Math.floor(rnd() * invalidos.length)],
                aEhValido,
                bEhValido,
              };
            `,
            check: `
              const obtido = somarSeguro(caso.a, caso.b);

              if (caso.aEhValido && caso.bEhValido) {
                if (obtido !== caso.a + caso.b) {
                  throw new Error("com " + caso.a + " e " + caso.b + " esperava " + (caso.a + caso.b) + ", veio " + JSON.stringify(obtido) + ".");
                }
              } else if (obtido !== null) {
                throw new Error("com " + JSON.stringify(caso.a) + " e " + JSON.stringify(caso.b) + " esperava null, veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        solution: `function somarSeguro(a, b) {
  if (a === '' || b === '' || a === null || b === null) return null;

  const numeroA = Number(a);
  const numeroB = Number(b);

  if (Number.isNaN(numeroA) || Number.isNaN(numeroB)) return null;

  return numeroA + numeroB;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `O tipo decide o comportamento do operador. O \`+\` junta quando um dos lados é texto, enquanto \`-\`, \`*\` e \`/\` convertem para número — por isso \`'10' - 5\` dá 5 e \`'10' + 5\` dá \`'105'\`. \`Number\` nunca lança erro: devolve \`NaN\` quando falha, e devolve \`0\` para texto vazio, que é a conversão que mais surpreende. Converta explicitamente, confira o resultado antes de usar, e compare sempre com \`===\`.`,
    },
  ],
};

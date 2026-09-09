import type { Lesson } from '../types';

export const lessonCasosExtremos: Lesson = {
  id: 'lesson-logica-2',
  trackId: 'track-logica',
  title: 'Casos Extremos: Onde o Código Quebra',
  language: 'javascript',
  objective:
    'Antecipar as entradas que quebram uma solução que "funcionava" nos exemplos, e decidir o que fazer com elas.',
  concepts: ['casos-extremos', 'depuracao', 'condicoes'],
  status: 'published',
  estimatedMinutes: 26,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Sua função passa nos exemplos do enunciado. Isso significa muito menos do que parece.

Exemplos são o **caminho feliz**: dados bem-comportados, do tamanho esperado, no formato certo. Bugs de produção quase nunca moram ali. Eles moram nas bordas.

A lista que vale a pena percorrer sempre:

- **vazio** — array \`[]\`, texto \`""\`, nenhum item
- **um só** — muita lógica de comparação assume "pelo menos dois"
- **o limite exato** — se a regra é "acima de 18", o que acontece com 18?
- **negativo e zero** — especialmente em contadores e comparações
- **repetido** — dois itens empatados, duas chaves iguais
- **tipo errado** — veio texto onde você esperava número

Não é pessimismo: é que cada uma dessas já quebrou algum sistema de verdade. Testar as bordas antes de entregar é mais barato do que descobrir depois.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Parece correta. Passa em [3, 1, 2].
function maior(lista) {
  let m = lista[0];
  for (let i = 1; i < lista.length; i++) {
    if (lista[i] > m) m = lista[i];
  }
  return m;
}

console.log(maior([3, 1, 2]));   // 3   ok
console.log(maior([5]));         // 5   ok
console.log(maior([]));          // undefined  <- e agora?

// [] não tem posição 0. A função não quebra, mas devolve undefined —
// e quem chamou vai usar esse undefined numa conta sem perceber.`,
      caption:
        'O caso perigoso não é o que lança erro: é o que devolve um valor errado em silêncio e contamina o resto do programa.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-2-limite',
        type: 'predict-output',
        prompt:
          'A regra é "desconto de 10% para compras ACIMA de 100 reais". O que este código imprime para uma compra de exatamente 100?',
        concepts: ['casos-extremos', 'condicoes'],
        difficulty: 'iniciante',
        tags: ['logica', 'casos-extremos', 'limites'],
        code: `function desconto(valor) {
  if (valor >= 100) {
    return valor * 0.1;
  }
  return 0;
}

console.log(desconto(100));`,
        expectedOutput: '10',
        explanation:
          'O código dá desconto, mas a regra dizia "acima de 100" — e 100 não está acima de 100. O `>=` deveria ser `>`. É o **erro de um a mais**: a lógica está quase certa, o limite está errado, e só um teste no valor exato revela isso.',
        hints: [
          'Leia a condição do código e compare palavra por palavra com a regra do enunciado.',
          'Qual a diferença entre "acima de 100" e "100 ou mais"?',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## O erro de um a mais

O limite errado por uma unidade é o bug mais comum que existe, e o mais difícil de ver relendo o código — porque a lógica está certa; só a fronteira está deslocada.

Ele nasce de uma tradução malfeita do português para o operador:

| O enunciado diz | O operador é |
|---|---|
| acima de 100, mais de 100 | \`> 100\` |
| a partir de 100, 100 ou mais, no mínimo 100 | \`>= 100\` |
| até 100, no máximo 100 | \`<= 100\` |
| abaixo de 100, menos de 100 | \`< 100\` |

"Até 12 anos" **inclui** o de 12. "A partir de 18" **inclui** o de 18. Uma pessoa de 12 anos e 11 meses ainda tem 12.

O mesmo deslocamento aparece em índices. \`slice(1, 3)\` pega as posições 1 e 2 — o fim fica de fora. E a última posição de um array é \`length - 1\`, então \`lista[lista.length]\` é sempre \`undefined\`.

A defesa é sempre a mesma: **escreva um teste no valor exato do limite**, e outro em cada lado dele. Se a regra é "a partir de 18", teste 17, 18 e 19. Um desses três vai reprovar quando o operador estiver trocado.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-2-prever-fatias',
        type: 'predict-output',
        prompt: 'O que este programa imprime? Preste atenção nas fronteiras.',
        concepts: ['casos-extremos', 'arrays'],
        difficulty: 'intermediario',
        tags: ['logica', 'casos-extremos', 'limites'],
        code: `const notas = [10, 20, 30, 40, 50];

console.log(notas.slice(1, 3));
console.log(notas.slice(3));
console.log(notas[notas.length]);`,
        expectedOutput: '[20,30]\n[40,50]\nundefined',
        explanation:
          '`slice(1, 3)` leva o início e **não** leva o fim: posições 1 e 2, ou seja `20` e `30`. Com um argumento só, vai da posição indicada até o final. E `notas[5]` não existe: as posições vão de 0 a 4, então a última é `length - 1`. Ler uma posição inexistente não dá erro — devolve `undefined`, que só vira problema mais adiante.',
        hints: [
          'Em `slice(inicio, fim)`, a posição `fim` entra no resultado?',
          'Um array de 5 itens tem quais posições válidas?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-2-lacuna-faixa',
        type: 'fill-blank',
        prompt:
          'Complete os dois limites. A regra: **criança até 12 anos**, **adolescente dos 13 aos 17**, **adulto a partir de 18**.',
        concepts: ['casos-extremos', 'condicoes'],
        difficulty: 'intermediario',
        tags: ['logica', 'casos-extremos', 'limites'],
        template: `function faixaEtaria(idade) {
  if (idade < 0) throw new RangeError('idade não pode ser negativa.');

  if (idade {{1}} 12) return 'criança';
  if (idade {{2}} 18) return 'adolescente';

  return 'adulto';
}`,
        blanks: [
          { placeholder: 'até 12', size: 4 },
          { placeholder: 'antes de 18', size: 4 },
        ],
        tests: [
          {
            description: 'os casos do meio de cada faixa',
            assertion: `
              if (faixaEtaria(5) !== 'criança') throw new Error("5 anos é criança, veio " + faixaEtaria(5) + ".");
              if (faixaEtaria(15) !== 'adolescente') throw new Error("15 anos é adolescente, veio " + faixaEtaria(15) + ".");
              if (faixaEtaria(30) !== 'adulto') throw new Error("30 anos é adulto, veio " + faixaEtaria(30) + ".");
            `,
          },
          {
            description: 'a fronteira dos 12 para os 13',
            assertion: `
              if (faixaEtaria(12) !== 'criança') throw new Error("'até 12 anos' inclui quem tem 12. Veio " + faixaEtaria(12) + ".");
              if (faixaEtaria(13) !== 'adolescente') throw new Error("13 anos já é adolescente, veio " + faixaEtaria(13) + ".");
            `,
          },
          {
            description: 'a fronteira dos 17 para os 18',
            assertion: `
              if (faixaEtaria(17) !== 'adolescente') throw new Error("17 anos ainda é adolescente, veio " + faixaEtaria(17) + ".");
              if (faixaEtaria(18) !== 'adulto') throw new Error("'a partir de 18' inclui quem tem 18. Veio " + faixaEtaria(18) + ".");
            `,
          },
          {
            description: 'idade zero é criança',
            assertion: `if (faixaEtaria(0) !== 'criança') throw new Error("Recém-nascido é criança, veio " + faixaEtaria(0) + ".");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'toda idade cai na faixa certa, dos 0 aos 120',
            generate: `
              return { idade: Math.floor(rnd() * 121) };
            `,
            check: `
              const esperado = caso.idade <= 12 ? 'criança' : caso.idade <= 17 ? 'adolescente' : 'adulto';
              const obtido = faixaEtaria(caso.idade);

              if (obtido !== esperado) {
                throw new Error("com " + caso.idade + " anos esperava " + esperado + ", veio " + obtido + ".");
              }
            `,
          },
        ],
        explanation:
          '"Até 12" inclui o 12, então o primeiro é `<=`. "A partir de 18" também inclui o 18 — mas a condição escrita é a do adolescente, que vai **até antes** dos 18, então ali é `<`. Duas frases parecidas, dois operadores diferentes: é exatamente aqui que o erro de um a mais nasce.',
        hints: [
          'Quem tem exatamente 12 anos é criança ou adolescente? E quem tem 18?',
          'O segundo `if` não descreve "adulto a partir de 18": descreve "adolescente até antes de 18".',
        ],
        solution: ['<=', '<'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Falhar alto, ou devolver um padrão?

Achar a borda é metade do trabalho. A outra metade é decidir **o que a função faz** quando ela chega.

Três saídas possíveis, e a escolha não é de gosto:

**Devolver um valor neutro** (\`0\`, \`[]\`, \`""\`) funciona quando esse valor é uma resposta honesta. A soma de uma lista vazia é \`0\` — não há dúvida nem informação perdida.

**Devolver \`null\`** funciona quando não existe resposta, e quem chamou precisa saber disso. O maior de uma lista vazia não é zero: simplesmente não existe.

**Lançar um erro** funciona quando a entrada nunca deveria ter chegado ali. Idade negativa não é um caso a tratar — é um bug em quem chamou, e esconder isso só adia a descoberta.

A escolha errada mais cara é a primeira feita por preguiça. Se \`maior([])\` devolve \`0\`, quem chamou não tem como distinguir "a lista estava vazia" de "o maior valor é zero" — e num sistema de temperaturas as duas coisas acontecem. O valor errado viaja calado até explodir longe da origem.

A pergunta que decide: **esse valor pode ser confundido com uma resposta legítima?** Se pode, ele não serve de padrão.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-2-escolher-padrao',
        type: 'multiple-choice',
        prompt:
          'A função `maiorTemperatura(leituras)` devolve `undefined` com a lista vazia, e você precisa decidir o que ela passa a fazer. Qual é a **pior** escolha?',
        concepts: ['casos-extremos'],
        difficulty: 'intermediario',
        tags: ['logica', 'casos-extremos'],
        options: [
          'Lançar um erro dizendo que não existe maior de uma lista vazia',
          'Devolver `null`, obrigando quem chama a tratar o caso',
          'Devolver `0`, para o resto do programa não quebrar',
          'Manter `undefined` e documentar esse comportamento',
        ],
        correctIndex: 2,
        explanation:
          '`0` é uma temperatura perfeitamente possível. Devolvendo zero, quem chamou fica sem como distinguir "não havia leitura nenhuma" de "a maior leitura foi zero grau" — e as duas situações pedem reações opostas. As outras três preservam a diferença: erro, `null` e `undefined` não podem ser confundidos com uma medição real. A regra é: um valor padrão só serve se ele **não** puder passar por resposta legítima.',
        hints: [
          'Zero é um resultado impossível para uma temperatura?',
          'Quem recebe o resultado consegue diferenciar "vazio" de "o valor é esse mesmo"?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-2-robusta',
        type: 'code',
        prompt: `Crie \`mediaSegura(numeros)\` que **retorna** a média de um array — mas que aguenta as bordas:\n\n- array vazio → \`0\` (não \`NaN\`)\n- itens que não são números → ignorados no cálculo\n- se nenhum item válido sobrar → \`0\`\n\nAqui o \`0\` é aceitável porque a função é usada para exibir um resumo, e "sem dados" e "média zero" aparecem iguais na tela de qualquer jeito.`,
        concepts: ['casos-extremos', 'arrays', 'condicoes'],
        difficulty: 'intermediario',
        tags: ['logica', 'casos-extremos', 'validacao'],
        initialCode: `function mediaSegura(numeros) {
  // Seu código aqui
}

console.log(mediaSegura([2, 4, 6]));        // 4
console.log(mediaSegura([]));               // 0
console.log(mediaSegura([2, "x", 4]));      // 3
`,
        hints: [
          'Primeiro separe os itens válidos, depois calcule a média só deles.',
          'Number.isFinite(x) devolve true só para números de verdade — texto e NaN ficam de fora.',
          'Some os válidos e divida pela quantidade DE VÁLIDOS, não pelo tamanho do array original.',
          'Antes de dividir, verifique se a quantidade de válidos é zero — divisão por zero produz NaN.',
        ],
        tests: [
          {
            description: 'A função mediaSegura existe',
            assertion: `if (typeof mediaSegura !== 'function') throw new Error("Crie uma função chamada 'mediaSegura'.");`,
          },
          {
            description: 'Calcula a média do caso normal',
            assertion: `if (mediaSegura([2, 4, 6]) !== 4) throw new Error("mediaSegura([2, 4, 6]) deveria devolver 4, mas devolveu " + mediaSegura([2, 4, 6]) + ".");`,
          },
          {
            description: 'Array vazio devolve 0, não NaN',
            assertion: `const r = mediaSegura([]);
if (Number.isNaN(r)) throw new Error("Com array vazio veio NaN. Divisão por zero produz NaN — trate esse caso antes de dividir.");
if (r !== 0) throw new Error("Array vazio deveria devolver 0, mas devolveu " + r + ".");`,
          },
          {
            description: 'Ignora itens que não são números',
            assertion: `const r = mediaSegura([2, "x", 4]);
if (r !== 3) throw new Error("Esperado 3 — a média de 2 e 4, ignorando \\"x\\". Veio " + r + ". Divida pela quantidade de itens VÁLIDOS.");`,
          },
          {
            description: 'Só itens inválidos devolve 0',
            assertion: `const r = mediaSegura(["a", null, undefined]);
if (r !== 0) throw new Error("Sem nenhum número válido o resultado deveria ser 0, mas veio " + r + ".");`,
            hidden: true,
          },
          {
            description: 'Funciona com números negativos',
            assertion: `if (mediaSegura([-2, -4]) !== -3) throw new Error("mediaSegura([-2, -4]) deveria devolver -3, mas devolveu " + mediaSegura([-2, -4]) + ".");`,
            hidden: true,
          },
          {
            description: 'A lista recebida não é alterada',
            assertion: `
              const original = [2, "x", 4];
              mediaSegura(original);
              if (original.length !== 3) throw new Error("A lista recebida encolheu de 3 para " + original.length + " itens. Filtrar devolve uma lista nova; remover no lugar altera a de quem chamou.");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'ignora o que não é número e nunca devolve NaN',
            generate: `
              const n = Math.floor(rnd() * 8);
              const lixo = [null, undefined, "abc", NaN, Infinity, {}];
              const numeros = [];
              for (let i = 0; i < n; i++) {
                numeros.push(rnd() < 0.4 ? lixo[Math.floor(rnd() * lixo.length)] : Math.round(rnd() * 200) / 10);
              }
              return { numeros };
            `,
            check: `
              const r = mediaSegura(caso.numeros);
              if (typeof r !== "number" || !Number.isFinite(r)) {
                throw new Error("com " + JSON.stringify(caso.numeros) + " devolveu " + r + ". Nunca devolva NaN nem Infinity.");
              }

              const validos = caso.numeros.filter(n => Number.isFinite(n));
              const esperado = validos.length === 0 ? 0 : validos.reduce((a, b) => a + b, 0) / validos.length;
              if (Math.abs(r - esperado) > 1e-9) {
                throw new Error("com " + JSON.stringify(caso.numeros) + " esperava " + esperado + ", veio " + r + ".");
              }
            `,
          },
        ],
        solution: `function mediaSegura(numeros) {
  const validos = numeros.filter(n => Number.isFinite(n));
  if (validos.length === 0) return 0;

  let soma = 0;
  for (const n of validos) soma += n;
  return soma / validos.length;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Passar nos exemplos é o começo, não o fim. Antes de considerar pronto, teste: vazio, um só, o limite exato, negativo e tipo errado. Traduza o enunciado com cuidado — "acima de" é \`>\`, "a partir de" é \`>=\`, e um teste em cada lado da fronteira revela o operador trocado. Depois de achar a borda, decida o que fazer com ela: valor neutro quando ele é uma resposta honesta, \`null\` quando não existe resposta, erro quando a entrada nunca deveria ter chegado. E lembre que o caso mais perigoso não é o que dá erro — é o que devolve valor errado calado.`,
    },
  ],
};

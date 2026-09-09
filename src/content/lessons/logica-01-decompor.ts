import type { Lesson } from '../types';

export const lessonDecompor: Lesson = {
  id: 'lesson-logica-1',
  trackId: 'track-logica',
  title: 'Decompor: Quebrar o Problema Antes de Codar',
  language: 'javascript',
  objective:
    'Transformar um enunciado grande numa sequência de passos pequenos e verificáveis, e reconhecer quando a divisão ficou ruim.',
  concepts: ['decomposicao', 'funcoes'],
  status: 'published',
  estimatedMinutes: 26,
  blocks: [
    {
      kind: 'prose',
      markdown: `
A dificuldade de quem "sabe a sintaxe mas não consegue resolver" quase nunca é a linguagem. É começar a escrever antes de saber **quais são os passos**.

Pegue este enunciado:

> Dada uma frase, descubra qual palavra aparece mais vezes.

Escrito assim, ele parece uma coisa só. Mas são quatro:

1. separar a frase em palavras
2. contar quantas vezes cada palavra aparece
3. descobrir qual tem a maior contagem
4. devolver essa palavra

Cada passo dá para resolver e testar sozinho. É isso que torna o problema tratável — e o que permite descobrir **em qual passo** você errou, em vez de encarar um resultado errado sem pista nenhuma.

A pergunta que destrava quase sempre: *qual é a menor parte disso que eu já saberia fazer agora?* Comece por ela.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Passo 1, isolado e testável:
function separar(frase) {
  return frase.toLowerCase().split(" ");
}
console.log(separar("o rato roeu o rato"));
// ["o", "rato", "roeu", "o", "rato"]

// Passo 2, usando o passo 1 que já sabemos que funciona:
function contar(palavras) {
  const contagem = {};
  for (const p of palavras) {
    contagem[p] = (contagem[p] || 0) + 1;
  }
  return contagem;
}
console.log(contar(separar("o rato roeu o rato")));
// { o: 2, rato: 2, roeu: 1 }`,
      caption:
        'Repare no `(contagem[p] || 0)`: na primeira vez a chave não existe e vale `undefined`, então usamos 0 como ponto de partida.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-1-ordem',
        type: 'multiple-choice',
        prompt:
          'Você precisa calcular quanto cada pessoa paga numa conta de restaurante dividida igualmente, já com 10% de gorjeta. Qual decomposição faz mais sentido?',
        concepts: ['decomposicao'],
        difficulty: 'iniciante',
        tags: ['logica', 'decomposicao'],
        options: [
          'Dividir a conta pelas pessoas, depois somar 10% ao valor de cada uma',
          'Somar 10% ao total, depois dividir pelo número de pessoas',
          'Somar 10% a cada item do pedido, depois somar tudo e dividir',
          'As três dão exatamente o mesmo resultado, então tanto faz',
        ],
        correctIndex: 3,
        explanation:
          'Aqui as três chegam ao mesmo número, porque multiplicação e divisão são associativas: (T × 1,1) ÷ P é igual a (T ÷ P) × 1,1. Reconhecer quando a ordem **não** importa é tão útil quanto reconhecer quando importa — evita discussão inútil. Mas cuidado: se houvesse arredondamento para centavos em cada etapa, as três passariam a divergir.',
        hints: [
          'Escreva as três como fórmula matemática antes de decidir.',
          'Multiplicação e divisão podem trocar de ordem sem mudar o resultado.',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Resolva à mão antes de codar

Se você não consegue resolver o problema no papel, com um exemplo pequeno, não vai conseguir escrever o código — porque escrever código é justamente descrever o que você faria à mão.

Faça o exercício com \`"o rato roeu o rato"\`, devagar, anotando o que sua cabeça faz:

~~~
o     → nunca vi. anoto: o = 1
rato  → nunca vi. anoto: rato = 1
roeu  → nunca vi. anoto: roeu = 1
o     → já vi. o = 2
rato  → já vi. rato = 2
~~~

Pronto: você acabou de descrever um laço com um objeto de contagem, e descobriu sozinho que precisa tratar o caso "nunca vi" de um jeito diferente de "já vi". Esse "nunca vi" é o \`|| 0\` do exemplo.

Quando o enunciado for confuso, esse é o desbloqueio: **pegue o menor exemplo possível e faça na mão.**

## Nomear é decompor

Um comentário dizendo \`// passo 2: contar\` e uma função chamada \`contar\` parecem a mesma coisa. Não são.

O comentário é uma promessa que ninguém verifica: o código abaixo dele pode fazer outra coisa, ou três coisas. A função é uma fronteira de verdade — ela recebe algo definido, devolve algo definido, e você pode testá-la sozinha.

O nome também funciona como um teste do seu próprio raciocínio. Se você não consegue nomear um passo em duas ou três palavras, provavelmente ele não é um passo — são dois. E se o nome natural tem um "e" no meio, como \`separarEContar\`, isso é a decomposição avisando que ficou faltando um corte.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-1-prever-contagem',
        type: 'predict-output',
        prompt:
          'Este é o passo 2 escrito **sem** o cuidado com a primeira aparição. O que ele imprime?',
        concepts: ['decomposicao', 'objetos'],
        difficulty: 'iniciante',
        tags: ['logica', 'contagem'],
        code: `const contagem = {};
const palavras = ['a', 'b', 'a'];

for (const p of palavras) {
  contagem[p] = contagem[p] + 1;
}

console.log(contagem.a);
console.log(contagem.b);`,
        expectedOutput: 'NaN\nNaN',
        explanation:
          'Na primeira aparição de `a`, a chave ainda não existe: `contagem["a"]` é `undefined`, e `undefined + 1` é `NaN`. A partir daí não há volta — `NaN + 1` continua sendo `NaN`, então nem a segunda aparição conserta. É por isso que o padrão de contagem precisa de um ponto de partida: `(contagem[p] || 0) + 1`, ou `(contagem[p] ?? 0) + 1`.',
        hints: [
          'Quanto vale `contagem["a"]` na primeira volta do laço?',
          'O que acontece quando você soma 1 a `undefined`? E depois, somando 1 nesse resultado?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-1-lacuna-contar',
        type: 'fill-blank',
        prompt:
          'Complete o passo de contagem, tratando corretamente a **primeira** aparição de cada palavra.',
        concepts: ['decomposicao', 'objetos'],
        difficulty: 'iniciante',
        tags: ['logica', 'contagem'],
        template: `function contar(palavras) {
  const contagem = {};

  for (const p of palavras) {
    contagem[p] = ({{1}} || {{2}}) + 1;
  }

  return contagem;
}`,
        blanks: [
          { placeholder: 'valor atual', size: 12 },
          { placeholder: 'começo', size: 3 },
        ],
        tests: [
          {
            description: 'conta repetições corretamente',
            assertion: `
              const r = contar(['a', 'b', 'a']);
              if (r.a !== 2) throw new Error("'a' aparece 2 vezes, veio " + r.a + ".");
              if (r.b !== 1) throw new Error("'b' aparece 1 vez, veio " + r.b + ".");
            `,
          },
          {
            description: 'a primeira aparição vale 1, e não NaN',
            assertion: `
              const r = contar(['sozinha']);
              if (Number.isNaN(r.sozinha)) throw new Error("Deu NaN: a primeira aparição precisa de um ponto de partida numérico.");
              if (r.sozinha !== 1) throw new Error("Esperava 1, veio " + r.sozinha + ".");
            `,
          },
          {
            description: 'lista vazia devolve objeto vazio',
            assertion: `
              const r = contar([]);
              if (Object.keys(r).length !== 0) throw new Error("Sem palavras, a contagem deveria estar vazia.");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'a soma de todas as contagens é o total de palavras',
            generate: `
              const vocabulario = ['o', 'rato', 'roeu', 'a', 'roupa'];
              const quantas = Math.floor(rnd() * 12);

              const palavras = [];
              for (let i = 0; i < quantas; i++) {
                palavras.push(vocabulario[Math.floor(rnd() * vocabulario.length)]);
              }

              return { palavras: palavras };
            `,
            check: `
              const contagem = contar(caso.palavras);

              let total = 0;
              for (const chave of Object.keys(contagem)) {
                if (typeof contagem[chave] !== 'number' || Number.isNaN(contagem[chave])) {
                  throw new Error("a chave " + chave + " veio como " + contagem[chave] + ".");
                }
                total += contagem[chave];
              }

              if (total !== caso.palavras.length) {
                throw new Error("somando as contagens deu " + total + ", mas eram " + caso.palavras.length + " palavras.");
              }
            `,
          },
        ],
        explanation:
          'O padrão `(atual || 0) + 1` diz "se ainda não existe, comece do zero". Sem ele, a primeira soma parte de `undefined` e o resultado vira `NaN` para sempre — sem erro nenhum, o que torna o bug difícil de achar: você só descobre olhando o número final.',
        hints: [
          'A primeira parte é o valor que já está guardado para essa palavra.',
          'A segunda é o número por onde a contagem começa quando ainda não há nada.',
        ],
        solution: ['contagem[p]', '0'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Sinais de que a decomposição ficou ruim

Nem toda divisão ajuda. Três sintomas de que a sua atrapalhou mais do que resolveu:

**O passo precisa de meia dúzia de coisas de fora.** Se \`calcular(a, b, c, d, e, f)\` só faz sentido com todo o contexto junto, ele não é uma parte independente — é um pedaço arrancado do meio.

**Você não consegue dizer o que ele devolve.** Um passo que "mexe em algumas variáveis" não tem fronteira. Um que devolve *a lista de palavras* tem.

**O nome tem um "e".** \`validarESalvar\` são dois passos disfarçados de um. Você percebe na hora em que precisa validar sem salvar.

O contrário também existe: quebrar demais. Uma função de uma linha usada num lugar só costuma dar mais trabalho de ler do que a linha. A medida certa é *"eu consigo testar esse passo sozinho e explicar em uma frase?"* — se sim, está bom.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-1-resumo',
        type: 'code',
        prompt: `Crie \`resumo(numeros)\`, que **retorna** um objeto \`{ menor, maior, media }\` sobre a lista recebida.\n\nSão três perguntas independentes sobre os mesmos dados — decomponha antes de escrever.\n\n- Lista vazia devolve \`null\`: não existe menor nem média de nada.\n- A lista recebida **não pode ser alterada**.`,
        concepts: ['decomposicao', 'arrays', 'loops'],
        difficulty: 'intermediario',
        tags: ['logica', 'decomposicao'],
        initialCode: `function resumo(numeros) {
  // Três perguntas: qual o menor, qual o maior, qual a média.
}

console.log(resumo([3, 1, 4, 1, 5]));  // { menor: 1, maior: 5, media: 2.8 }
console.log(resumo([]));               // null`,
        hints: [
          'Trate a lista vazia primeiro. Depois dessa guarda, o resto pode contar com pelo menos um número.',
          'Comece menor e maior com o PRIMEIRO elemento, nunca com 0 — a lista pode ser toda negativa.',
          'Uma passagem só pelo array resolve as três perguntas ao mesmo tempo.',
          'Média é soma dividida pela quantidade. Nada de arredondar: o teste compara o valor exato.',
        ],
        tests: [
          {
            description: 'A função resumo existe',
            assertion: `if (typeof resumo !== 'function') throw new Error("Crie uma função chamada 'resumo'.");`,
          },
          {
            description: 'responde as três perguntas do exemplo',
            assertion: `
              const r = resumo([3, 1, 4, 1, 5]);
              if (r === null || typeof r !== 'object') throw new Error("Deveria devolver um objeto, veio " + JSON.stringify(r) + ".");
              if (r.menor !== 1) throw new Error("menor deveria ser 1, veio " + r.menor + ".");
              if (r.maior !== 5) throw new Error("maior deveria ser 5, veio " + r.maior + ".");
              if (Math.abs(r.media - 2.8) > 1e-9) throw new Error("media deveria ser 2.8, veio " + r.media + ".");
            `,
          },
          {
            description: 'lista vazia devolve null',
            assertion: `const r = resumo([]); if (r !== null) throw new Error("Sem números não há menor nem média: esperava null, veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'um número só é menor, maior e média ao mesmo tempo',
            assertion: `
              const r = resumo([7]);
              if (r.menor !== 7 || r.maior !== 7 || r.media !== 7) throw new Error("Para [7] os três valores são 7, veio " + JSON.stringify(r) + ".");
            `,
            hidden: true,
          },
          {
            description: 'funciona com números negativos',
            assertion: `
              const r = resumo([-5, -1, -3]);
              if (r.menor !== -5) throw new Error("menor deveria ser -5, veio " + r.menor + ". Começar o menor em 0 quebra com listas negativas.");
              if (r.maior !== -1) throw new Error("maior deveria ser -1, veio " + r.maior + ".");
              if (Math.abs(r.media - (-3)) > 1e-9) throw new Error("media deveria ser -3, veio " + r.media + ".");
            `,
            hidden: true,
          },
          {
            description: 'a lista recebida continua intacta',
            assertion: `
              const original = [3, 1, 2];
              resumo(original);
              if (original.join(',') !== '3,1,2') throw new Error("A lista mudou para [" + original.join(', ') + "]. Métodos como sort() reordenam o array original — copie antes, ou resolva sem ordenar.");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'menor, maior e média valem para qualquer lista de números',
            generate: `
              const quantos = 1 + Math.floor(rnd() * 10);
              const numeros = [];

              for (let i = 0; i < quantos; i++) {
                numeros.push(Math.floor(rnd() * 200) - 100);
              }

              return { numeros: numeros };
            `,
            check: `
              const copia = caso.numeros.slice();
              const obtido = resumo(caso.numeros);

              if (obtido === null) {
                throw new Error("devolveu null para uma lista com " + caso.numeros.length + " números.");
              }

              const esperadoMenor = Math.min.apply(null, copia);
              const esperadoMaior = Math.max.apply(null, copia);

              let soma = 0;
              for (const n of copia) soma += n;
              const esperadaMedia = soma / copia.length;

              if (obtido.menor !== esperadoMenor) {
                throw new Error("para [" + copia.join(', ') + "] o menor é " + esperadoMenor + ", veio " + obtido.menor + ".");
              }
              if (obtido.maior !== esperadoMaior) {
                throw new Error("para [" + copia.join(', ') + "] o maior é " + esperadoMaior + ", veio " + obtido.maior + ".");
              }
              if (Math.abs(obtido.media - esperadaMedia) > 1e-9) {
                throw new Error("para [" + copia.join(', ') + "] a média é " + esperadaMedia + ", veio " + obtido.media + ".");
              }
              if (caso.numeros.join(',') !== copia.join(',')) {
                throw new Error("a lista recebida foi alterada durante o cálculo.");
              }
            `,
          },
        ],
        solution: `function resumo(numeros) {
  if (numeros.length === 0) return null;

  let menor = numeros[0];
  let maior = numeros[0];
  let soma = 0;

  for (const n of numeros) {
    if (n < menor) menor = n;
    if (n > maior) maior = n;
    soma = soma + n;
  }

  return { menor: menor, maior: maior, media: soma / numeros.length };
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-1-frequente',
        type: 'code',
        prompt: `Complete o problema dos quatro passos: crie \`palavraMaisFrequente(frase)\` que **retorna** a palavra que mais se repete.\n\nIgnore maiúsculas — \`"O"\` e \`"o"\` são a mesma palavra. Em caso de empate, devolva a que aparece primeiro na frase.`,
        concepts: ['decomposicao', 'objetos', 'strings', 'loops'],
        difficulty: 'intermediario',
        tags: ['logica', 'decomposicao', 'contagem'],
        initialCode: `function palavraMaisFrequente(frase) {
  // Passo 1: separar em palavras
  // Passo 2: contar cada uma
  // Passo 3: achar a maior contagem
  // Passo 4: devolver a palavra
}

console.log(palavraMaisFrequente("o rato roeu a roupa do rei de roma o rato"));
`,
        hints: [
          'Resolva um passo por vez e imprima o resultado de cada um antes de seguir.',
          'Para contar, use um objeto onde a chave é a palavra e o valor é quantas vezes apareceu.',
          'Na primeira aparição a chave não existe: contagem[p] = (contagem[p] || 0) + 1 resolve.',
          'Depois de contar, percorra as chaves guardando qual teve o maior valor — como no exercício do maior número.',
        ],
        tests: [
          {
            description: 'A função palavraMaisFrequente existe',
            assertion: `if (typeof palavraMaisFrequente !== 'function') throw new Error("Crie uma função chamada 'palavraMaisFrequente'.");`,
          },
          {
            description: 'Encontra a palavra mais repetida',
            assertion: `const r = palavraMaisFrequente("o rato roeu a roupa do rei de roma o rato");
if (r !== "o") throw new Error("Esperado \\"o\\" (aparece 3 vezes), mas veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'Ignora maiúsculas e minúsculas',
            assertion: `const r = palavraMaisFrequente("Casa casa CASA porta");
if (r !== "casa") throw new Error("\\"Casa\\", \\"casa\\" e \\"CASA\\" são a mesma palavra, então o resultado deveria ser \\"casa\\" em minúsculas. Veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'No empate, devolve a primeira da frase',
            assertion: `const r = palavraMaisFrequente("azul verde azul verde");
if (r !== "azul") throw new Error("Ambas aparecem 2 vezes, então deveria vir \\"azul\\", a primeira. Veio " + JSON.stringify(r) + ". Use > e não >= ao comparar contagens.");`,
            hidden: true,
          },
          {
            description: 'Funciona com uma palavra só',
            assertion: `if (palavraMaisFrequente("sozinha") !== "sozinha") throw new Error("Com uma única palavra, ela mesma é a mais frequente.");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'a palavra devolvida é mesmo a de maior contagem',
            generate: `
              const vocabulario = ['o', 'rato', 'roeu', 'roupa', 'rei'];
              const quantas = 1 + Math.floor(rnd() * 12);

              const palavras = [];
              for (let i = 0; i < quantas; i++) {
                palavras.push(vocabulario[Math.floor(rnd() * vocabulario.length)]);
              }

              return { frase: palavras.join(' '), palavras: palavras };
            `,
            check: `
              const contagem = {};
              for (const p of caso.palavras) contagem[p] = (contagem[p] || 0) + 1;

              let maiorContagem = 0;
              for (const chave of Object.keys(contagem)) {
                if (contagem[chave] > maiorContagem) maiorContagem = contagem[chave];
              }

              const obtida = palavraMaisFrequente(caso.frase);

              if (contagem[obtida] !== maiorContagem) {
                throw new Error("para \\"" + caso.frase + "\\" devolveu \\"" + obtida + "\\" (" + contagem[obtida] + " vezes), mas a maior contagem é " + maiorContagem + ".");
              }
            `,
          },
        ],
        solution: `function palavraMaisFrequente(frase) {
  const palavras = frase.toLowerCase().split(" ");

  const contagem = {};
  for (const p of palavras) {
    contagem[p] = (contagem[p] || 0) + 1;
  }

  let melhor = palavras[0];
  for (const p of palavras) {
    if (contagem[p] > contagem[melhor]) melhor = p;
  }
  return melhor;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Antes de escrever, liste os passos — e antes de listar, resolva um exemplo pequeno à mão, porque codar é descrever o que você faria manualmente. Cada passo deve ser pequeno o bastante para você testar sozinho, e ter um nome de duas ou três palavras: se o nome precisa de um "e", ficou faltando um corte. Um comentário dizendo "passo 2" e uma função chamada \`contar\` não são a mesma coisa — só a função é uma fronteira que dá para verificar.`,
    },
  ],
};

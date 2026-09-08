import type { Lesson } from '../types';

export const lessonCasosExtremos: Lesson = {
  id: 'lesson-logica-2',
  trackId: 'track-logica',
  title: 'Casos Extremos: Onde o Código Quebra',
  language: 'javascript',
  objective: 'Antecipar as entradas que quebram uma solução que "funcionava" nos exemplos.',
  concepts: ['casos-extremos', 'depuracao', 'condicoes'],
  status: 'published',
  estimatedMinutes: 20,
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
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-2-robusta',
        type: 'code',
        prompt: `Crie \`mediaSegura(numeros)\` que **retorna** a média de um array — mas que aguenta as bordas:\n\n- array vazio → \`0\` (não \`NaN\`)\n- itens que não são números → ignorados no cálculo\n- se nenhum item válido sobrar → \`0\``,
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
      markdown: `Passar nos exemplos é o começo, não o fim. Antes de considerar pronto, teste: vazio, um só, o limite exato, negativo e tipo errado. O caso mais perigoso não é o que dá erro — é o que devolve valor errado calado.`,
    },
  ],
};

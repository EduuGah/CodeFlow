import type { Lesson } from '../types';

export const lessonSimular: Lesson = {
  id: 'lesson-logica-3',
  trackId: 'track-logica',
  title: 'Simular na Mão: Rodar o Código na Cabeça',
  language: 'javascript',
  objective:
    'Acompanhar a execução linha a linha, prever o estado das variáveis, e usar isso para achar o ponto exato de um bug.',
  concepts: ['simulacao', 'loops', 'depuracao'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Quando um loop devolve o número errado, a tentação é mexer no código até acertar. Isso às vezes funciona — e você aprende nada.

A alternativa é **simular**: percorrer as linhas na ordem em que o computador percorre, anotando o valor de cada variável a cada passo. Uma tabela basta:

| volta | i | total |
|---|---|---|
| antes | — | 0 |
| 1ª | 1 | 1 |
| 2ª | 2 | 3 |
| 3ª | 3 | 6 |

Em três linhas você vê exatamente onde o valor deixou de ser o esperado. Isso é o que um depurador faz, e é uma habilidade que você leva para qualquer linguagem.

A regra prática: **preveja antes de executar**. Escreva o que você acha que vai sair, rode, compare. Quando bate, sua compreensão está correta. Quando não bate, você acabou de encontrar exatamente o ponto onde seu modelo mental está errado — que é a informação mais valiosa que existe.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `let total = 0;
for (let i = 1; i <= 3; i++) {
  total = total + i;
  console.log("volta", i, "| total agora:", total);
}
console.log("final:", total);

// volta 1 | total agora: 1
// volta 2 | total agora: 3
// volta 3 | total agora: 6
// final: 6`,
      caption:
        'Imprimir o estado dentro do loop é a versão executável da tabela. Use enquanto estiver investigando e remova depois.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-3-simular',
        type: 'predict-output',
        prompt:
          'Simule na mão antes de rodar. Anote o valor de `resultado` a cada volta. O que é impresso no final?',
        concepts: ['simulacao', 'loops'],
        difficulty: 'intermediario',
        tags: ['logica', 'simulacao', 'loops'],
        code: `let resultado = 1;
for (let i = 1; i <= 4; i++) {
  resultado = resultado * i;
}
console.log(resultado);`,
        expectedOutput: '24',
        explanation:
          'A cada volta o resultado é multiplicado pelo contador: 1×1 = 1, depois 1×2 = 2, depois 2×3 = 6, depois 6×4 = 24. É o fatorial de 4. Repare que `resultado` começa em **1**, não em 0 — num acumulador de multiplicação, começar em zero zeraria tudo.',
        hints: [
          'Monte a tabela: quatro voltas, e a cada uma anote o novo valor de resultado.',
          'A operação é multiplicação, não soma. Por que o valor inicial é 1?',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## A simulação encontra o bug que a leitura não encontra

Olhe esta função. Ela parece razoável, e passa no primeiro teste que quase todo mundo escreve.

~~~javascript
function contem(lista, alvo) {
  for (const item of lista) {
    if (item === alvo) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}
~~~

Relendo, ela "faz sentido": percorre a lista, devolve verdadeiro se achar. Agora simule com \`contem([1, 2, 3], 3)\`:

| volta | item | o que acontece |
|---|---|---|
| 1ª | 1 | 1 não é 3 → cai no \`else\` → **return false** |

A simulação acaba na primeira linha da tabela, e é isso que denuncia o bug: o \`else\` desiste no **primeiro** item que não bate, sem nunca olhar os outros. A função só acerta quando o alvo é o primeiro elemento.

Repare no que aconteceu: ler o código não revelou nada, porque a intenção estava clara na cabeça de quem lê. Simular revelou na primeira volta, porque a simulação não sabe da intenção — ela só segue o que está escrito.

**Quando um loop faz sentido lendo mas erra rodando, a resposta quase sempre aparece na primeira ou na última volta.**
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-3-prever-desiste',
        type: 'predict-output',
        prompt:
          'Simule as duas chamadas antes de rodar. Acompanhe o que acontece na **primeira** volta de cada uma.',
        concepts: ['simulacao', 'loops'],
        difficulty: 'intermediario',
        tags: ['logica', 'simulacao', 'loops'],
        code: `function contem(lista, alvo) {
  for (const item of lista) {
    if (item === alvo) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}

console.log(contem([1, 2, 3], 1));
console.log(contem([1, 2, 3], 3));`,
        expectedOutput: 'true\nfalse',
        explanation:
          'O `return` dentro do `else` encerra a função na primeira volta, aconteça o que acontecer. Com o alvo `1`, a primeira comparação já bate e devolve `true` — por sorte. Com o alvo `3`, a primeira comparação falha e a função desiste antes de ver o `2` e o `3`. A correção é tirar o `else`: só o `return true` fica dentro do laço, e o `return false` espera o laço terminar.',
        hints: [
          'Quantas voltas o laço chega a dar em cada chamada?',
          'Um `return` dentro do laço encerra só a volta, ou a função inteira?',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Quando são mil voltas

Ninguém simula um laço de mil iterações na mão. Não precisa: três voltas respondem quase tudo.

- **A primeira**, onde moram os valores iniciais errados — o acumulador que começou em zero quando devia começar em um, o índice que começou em 1 quando devia começar em 0.
- **A última**, onde moram os erros de fronteira — a volta a mais, a volta a menos.
- **Uma do meio**, para conferir que o padrão é mesmo o que você imagina.

Existe uma ferramenta que economiza ainda mais: a **invariante** — a frase que precisa continuar verdadeira ao fim de toda volta.

~~~javascript
let soma = 0;
for (let i = 0; i < notas.length; i++) {
  soma = soma + notas[i];
  // invariante: soma é o total das notas de 0 até i
}
~~~

Depois da volta em que \`i\` vale 2, \`soma\` tem que ser \`notas[0] + notas[1] + notas[2]\`. Se você consegue enunciar a invariante, consegue conferir qualquer volta isolada — sem percorrer todas as anteriores.

E se você **não** consegue enunciá-la, esse é o sinal: o laço ainda não está claro na sua cabeça, e é por isso que ele não funciona.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-3-lacuna-palindromo',
        type: 'fill-blank',
        prompt:
          'Esta função compara o texto pelas duas pontas, andando para o meio. Complete a condição de parada e o passo do índice da direita.',
        concepts: ['simulacao', 'loops', 'strings'],
        difficulty: 'intermediario',
        tags: ['logica', 'simulacao'],
        template: `function ehPalindromo(texto) {
  let inicio = 0;
  let fim = texto.length - 1;

  while (inicio {{1}} fim) {
    if (texto[inicio] !== texto[fim]) return false;

    inicio++;
    fim{{2}};
  }

  return true;
}`,
        blanks: [
          { placeholder: 'ainda não se cruzaram', size: 4 },
          { placeholder: 'anda para trás', size: 5 },
        ],
        tests: [
          {
            description: 'reconhece um palíndromo',
            assertion: `if (ehPalindromo('arara') !== true) throw new Error("'arara' é palíndromo e deveria devolver true.");`,
          },
          {
            description: 'recusa um texto comum',
            assertion: `if (ehPalindromo('abc') !== false) throw new Error("'abc' não é palíndromo e deveria devolver false.");`,
          },
          {
            description: 'funciona com tamanho par',
            assertion: `
              if (ehPalindromo('abba') !== true) throw new Error("'abba' é palíndromo e deveria devolver true.");
              if (ehPalindromo('abca') !== false) throw new Error("'abca' não é palíndromo e deveria devolver false.");
            `,
          },
          {
            description: 'texto vazio e de uma letra são palíndromos',
            assertion: `
              if (ehPalindromo('') !== true) throw new Error("Texto vazio é palíndromo por vacuidade: não há par que discorde.");
              if (ehPalindromo('x') !== true) throw new Error("Uma letra sozinha é igual a si mesma de trás para frente.");
            `,
            hidden: true,
          },
          {
            description: 'o laço termina — nada de volta infinita',
            assertion: `
              const antes = Date.now();
              ehPalindromo('abcdefghij');
              if (Date.now() - antes > 500) throw new Error("O laço demorou demais: confira se o índice da direita está realmente diminuindo.");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'concorda com a comparação contra o texto invertido',
            generate: `
              const letras = 'aabbc';
              const n = Math.floor(rnd() * 8);

              let texto = '';
              for (let i = 0; i < n; i++) texto += letras[Math.floor(rnd() * letras.length)];

              // Metade das vezes força um palíndromo, para os dois lados serem testados.
              if (rnd() < 0.5) {
                let espelho = '';
                for (let i = texto.length - 1; i >= 0; i--) espelho += texto[i];
                texto = texto + espelho;
              }

              return { texto: texto };
            `,
            check: `
              let invertido = '';
              for (let i = caso.texto.length - 1; i >= 0; i--) invertido += caso.texto[i];

              const esperado = invertido === caso.texto;
              const obtido = ehPalindromo(caso.texto);

              if (obtido !== esperado) {
                throw new Error("para " + JSON.stringify(caso.texto) + " esperava " + esperado + ", veio " + obtido + ".");
              }
            `,
          },
        ],
        explanation:
          'A invariante aqui é: *tudo que ficou fora do intervalo `inicio..fim` já foi conferido e batia*. Enquanto os dois índices não se encontram, ainda há par para comparar; quando se cruzam, todos os pares bateram. E o índice da direita precisa **diminuir** — se ele ficar parado, o laço nunca termina.',
        hints: [
          'Enquanto os dois índices ainda não se encontraram, sobra par para comparar.',
          'O da esquerda cresce com `++`. Qual é o operador equivalente para o da direita?',
        ],
        solution: ['<', '--'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-3-acumulada',
        type: 'code',
        prompt: `Crie \`somaAcumulada(numeros)\`, que **retorna** um array do mesmo tamanho onde cada posição é a soma de tudo até ali.\n\n- \`somaAcumulada([1, 2, 3])\` → \`[1, 3, 6]\`\n- Lista vazia devolve lista vazia.\n- A lista recebida **não pode ser alterada**.\n\nA invariante: ao fim da volta \`i\`, a saída tem \`i + 1\` itens, e o último deles é o total dos números de 0 até \`i\`.`,
        concepts: ['simulacao', 'loops', 'arrays'],
        difficulty: 'intermediario',
        tags: ['logica', 'simulacao', 'arrays'],
        initialCode: `function somaAcumulada(numeros) {
  // Monte a tabela antes: volta, i, total, saída até aqui.
}

console.log(somaAcumulada([1, 2, 3]));    // [1, 3, 6]
console.log(somaAcumulada([5, -5, 10]));  // [5, 0, 10]
console.log(somaAcumulada([]));           // []`,
        hints: [
          'Você precisa de duas coisas antes do laço: a lista de saída e o total corrente.',
          'A cada volta: some o número atual ao total, e coloque o total na saída.',
          'Não recalcule a soma do zero a cada posição — o total da volta anterior já serve.',
          'let total = 0; const saida = []; for (const n of numeros) { total += n; saida.push(total); } return saida;',
        ],
        tests: [
          {
            description: 'A função somaAcumulada existe',
            assertion: `if (typeof somaAcumulada !== 'function') throw new Error("Crie uma função chamada 'somaAcumulada'.");`,
          },
          {
            description: 'acumula o exemplo corretamente',
            assertion: `
              const r = somaAcumulada([1, 2, 3]);
              if (!Array.isArray(r)) throw new Error("Deveria devolver um array, veio " + JSON.stringify(r) + ".");
              if (r.join(',') !== '1,3,6') throw new Error("Esperava [1, 3, 6], veio [" + r.join(', ') + "].");
            `,
          },
          {
            description: 'a saída tem o mesmo tamanho da entrada',
            assertion: `
              const r = somaAcumulada([4, 4, 4, 4]);
              if (r.length !== 4) throw new Error("Para 4 números a saída deveria ter 4 posições, veio " + r.length + ".");
            `,
          },
          {
            description: 'lista vazia devolve lista vazia',
            assertion: `
              const r = somaAcumulada([]);
              if (!Array.isArray(r) || r.length !== 0) throw new Error("Lista vazia deveria devolver [], veio " + JSON.stringify(r) + ".");
            `,
            hidden: true,
          },
          {
            description: 'números negativos podem fazer o total baixar',
            assertion: `
              const r = somaAcumulada([5, -5, 10]);
              if (r.join(',') !== '5,0,10') throw new Error("Esperava [5, 0, 10], veio [" + r.join(', ') + "].");
            `,
            hidden: true,
          },
          {
            description: 'a lista recebida continua intacta',
            assertion: `
              const original = [1, 2, 3];
              somaAcumulada(original);
              if (original.join(',') !== '1,2,3') throw new Error("A lista recebida virou [" + original.join(', ') + "]. Monte a saída num array novo.");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'cada posição é a anterior mais o número daquela posição',
            generate: `
              const quantos = Math.floor(rnd() * 12);
              const numeros = [];
              for (let i = 0; i < quantos; i++) numeros.push(Math.floor(rnd() * 40) - 20);
              return { numeros: numeros };
            `,
            check: `
              const copia = caso.numeros.slice();
              const saida = somaAcumulada(caso.numeros);

              if (!Array.isArray(saida)) {
                throw new Error("devolveu " + JSON.stringify(saida) + " em vez de um array.");
              }
              if (saida.length !== copia.length) {
                throw new Error("entraram " + copia.length + " números e saíram " + saida.length + " posições.");
              }

              let total = 0;
              for (let i = 0; i < copia.length; i++) {
                total += copia[i];
                if (saida[i] !== total) {
                  throw new Error("na posição " + i + " esperava " + total + ", veio " + saida[i] + ".");
                }
              }

              if (caso.numeros.join(',') !== copia.join(',')) {
                throw new Error("a lista recebida foi alterada durante o cálculo.");
              }
            `,
          },
        ],
        solution: `function somaAcumulada(numeros) {
  const saida = [];
  let total = 0;

  for (const n of numeros) {
    total = total + n;
    saida.push(total);
  }

  return saida;
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-logica-3-inverter',
        type: 'code',
        prompt: `Crie \`inverter(texto)\` que **retorna** o texto de trás para frente, usando um loop — sem \`split\`, \`reverse\` ou \`join\`.\n\nSimule na cabeça primeiro: qual índice você lê na primeira volta? E na última?`,
        concepts: ['simulacao', 'loops', 'strings'],
        difficulty: 'intermediario',
        tags: ['logica', 'simulacao', 'strings'],
        initialCode: `function inverter(texto) {
  // Comece de qual índice? Vá até qual? Somando ou subtraindo?
}

console.log(inverter("abc")); // "cba"
`,
        hints: [
          'Você vai montando um texto novo, caractere por caractere.',
          'Crie a variável do resultado ANTES do loop, começando como texto vazio.',
          'O último índice é texto.length - 1. Comece por ele e vá diminuindo até 0.',
          'let saida = ""; for (let i = texto.length - 1; i >= 0; i--) { saida += texto[i]; } return saida;',
        ],
        tests: [
          {
            description: 'A função inverter existe',
            assertion: `if (typeof inverter !== 'function') throw new Error("Crie uma função chamada 'inverter'.");`,
          },
          {
            description: 'Inverte um texto simples',
            assertion: `const r = inverter("abc");
if (r !== "cba") throw new Error("inverter(\\"abc\\") deveria devolver \\"cba\\", mas devolveu " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'Não usa reverse nem split',
            assertion: `const fonte = inverter.toString();
if (/\\.reverse\\s*\\(|\\.split\\s*\\(|\\.join\\s*\\(/.test(fonte)) throw new Error("O objetivo é praticar o loop: resolva sem split, reverse ou join.");`,
          },
          {
            description: 'Texto vazio devolve texto vazio',
            assertion: `const r = inverter("");
if (r !== "") throw new Error("Texto vazio deveria devolver texto vazio, mas devolveu " + JSON.stringify(r) + ". Verifique o valor inicial da variável de saída.");`,
            hidden: true,
          },
          {
            description: 'Funciona com um caractere só',
            assertion: `if (inverter("x") !== "x") throw new Error("Um único caractere invertido é ele mesmo.");`,
            hidden: true,
          },
          {
            description: 'Preserva espaços',
            assertion: `const r = inverter("a b");
if (r !== "b a") throw new Error("inverter(\\"a b\\") deveria devolver \\"b a\\", mas devolveu " + JSON.stringify(r) + ".");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'inverter duas vezes devolve o texto original',
            generate: `
              const letras = "abcdefg 123";
              const n = Math.floor(rnd() * 15);
              let texto = "";
              for (let i = 0; i < n; i++) texto += letras[Math.floor(rnd() * letras.length)];
              return { texto };
            `,
            check: `
              const umaVez = inverter(caso.texto);
              const duasVezes = inverter(umaVez);
              if (duasVezes !== caso.texto) {
                throw new Error("inverter(inverter(" + JSON.stringify(caso.texto) + ")) deveria voltar ao original, mas deu " + JSON.stringify(duasVezes) + ".");
              }
              if (umaVez.length !== caso.texto.length) {
                throw new Error("o texto invertido tem " + umaVez.length + " caracteres, o original tem " + caso.texto.length + ".");
              }
            `,
          },
        ],
        solution: `function inverter(texto) {
  let saida = "";
  for (let i = texto.length - 1; i >= 0; i--) {
    saida += texto[i];
  }
  return saida;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Antes de rodar, **preveja**. Depois compare. Quando a previsão erra, você achou o ponto exato em que seu modelo mental está furado — e corrigir isso vale mais do que acertar o exercício. Simular funciona onde reler falha, porque a simulação não sabe da sua intenção: ela segue o que está escrito. Em laços longos, três voltas bastam — a primeira, a última e uma do meio. E se você consegue enunciar a **invariante**, a frase que continua verdadeira ao fim de toda volta, consegue conferir qualquer volta sem percorrer as anteriores.`,
    },
  ],
};

import type { Lesson } from '../types';

export const lessonErros: Lesson = {
  id: 'lesson-js-10',
  trackId: 'track-js-fundamentos',
  title: 'Erros: Ler a Mensagem Antes de Chutar',
  language: 'javascript',
  objective: 'Interpretar uma mensagem de erro e usá-la para localizar a causa, em vez de tentar mudanças aleatórias.',
  concepts: ['depuracao', 'objetos', 'variaveis'],
  status: 'published',
  estimatedMinutes: 20,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Errar não é o problema — programar é errar o tempo todo. O que separa quem avança de quem trava é **ler a mensagem** em vez de mudar coisas ao acaso até funcionar.

Toda mensagem tem duas partes úteis: o **tipo** do erro e o **detalhe**. O tipo já reduz muito o campo de busca:

| Tipo | O que aconteceu | Onde olhar |
|---|---|---|
| \`SyntaxError\` | o código nem chegou a rodar | parêntese, chave ou aspas não fechados |
| \`ReferenceError\` | usou um nome que não existe | erro de digitação, ou variável fora de escopo |
| \`TypeError\` | o valor não é do tipo que você supôs | algo é \`undefined\` quando você esperava um objeto |

Repare na diferença entre os dois últimos. \`ReferenceError: x is not defined\` significa que **o nome** não existe. \`TypeError: Cannot read properties of undefined\` significa que o nome existe, mas **o valor dentro dele** é \`undefined\`.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// ReferenceError: usuario is not defined
// console.log(usuario);

// TypeError: existe, mas está undefined dentro
const dados = {};
// console.log(dados.usuario.nome);
// Cannot read properties of undefined (reading 'nome')
// dados.usuario é undefined — e undefined não tem .nome

// O método de investigação: quebre em pedaços e imprima cada um
console.log(dados);          // {}
console.log(dados.usuario);  // undefined  <- a causa está aqui
// console.log(dados.usuario.nome);  <- o erro estoura aqui`,
      caption:
        'O erro estoura numa linha, mas a causa costuma estar antes. Imprima os valores intermediários até achar o primeiro que não é o que você esperava.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-10-tipo',
        type: 'multiple-choice',
        prompt:
          'Seu código exibe `TypeError: pedidos.filtrar is not a function`. Qual é a causa mais provável?',
        concepts: ['depuracao'],
        difficulty: 'intermediario',
        tags: ['javascript', 'debugging', 'erros'],
        options: [
          'A variável pedidos não foi declarada em lugar nenhum',
          'O método se chama filter, não filtrar — o nome digitado não existe nos arrays',
          'Falta um ponto e vírgula na linha anterior',
          'O array pedidos está vazio',
        ],
        correctIndex: 1,
        explanation:
          'O tipo do erro entrega a resposta. Se `pedidos` não existisse, seria `ReferenceError`. Como é `TypeError` dizendo que **não é uma função**, o objeto existe — o que não existe é a propriedade `filtrar`. Acessar uma propriedade inexistente devolve `undefined`, e tentar chamar `undefined()` dá exatamente essa mensagem. Um array vazio também não causaria isso: `[].filter()` funciona normalmente.',
        hints: [
          'Compare: ReferenceError é sobre o nome não existir; TypeError é sobre o valor não ser o esperado.',
          'A mensagem diz "is not a function". O que acontece se você acessa uma propriedade que não existe e tenta chamá-la?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-10-corrigir',
        type: 'code',
        prompt: `A função abaixo deveria devolver o total do carrinho, mas quebra. **Encontre e corrija os dois problemas** sem reescrever tudo do zero.\n\nEla deve devolver 35 para o carrinho de exemplo, e 0 para um carrinho vazio.`,
        concepts: ['depuracao', 'arrays', 'loops'],
        difficulty: 'intermediario',
        tags: ['javascript', 'debugging', 'arrays'],
        initialCode: `function total(carrinho) {
  for (let i = 0; i <= carrinho.length; i++) {
    let soma = 0;
    soma = soma + carrinho[i].preco;
  }
  return soma;
}

console.log(total([{ preco: 10 }, { preco: 25 }])); // esperado: 35
`,
        hints: [
          'Execute e leia o erro. Ele aponta uma linha, mas a causa pode estar na linha de cima.',
          'Primeiro problema: a condição do loop deixa o índice passar do fim do array.',
          'Segundo problema: onde a variável soma está sendo declarada? O que acontece com ela a cada volta?',
          'Use i < carrinho.length e declare let soma = 0 antes do for, não dentro.',
        ],
        tests: [
          {
            description: 'A função total existe',
            assertion: `if (typeof total !== 'function') throw new Error("Mantenha uma função chamada 'total'.");`,
          },
          {
            description: 'Soma o carrinho de exemplo corretamente',
            assertion: `let r;
try {
  r = total([{ preco: 10 }, { preco: 25 }]);
} catch (e) {
  throw new Error("A função ainda quebra: " + e.message + ". Leia o erro e veja qual índice o loop está tentando acessar.");
}
if (r !== 35) throw new Error("Esperado 35, mas veio " + r + ". Onde a variável soma está declarada?");`,
          },
          {
            description: 'Carrinho vazio devolve 0',
            assertion: `let r;
try {
  r = total([]);
} catch (e) {
  throw new Error("Quebrou com carrinho vazio: " + e.message);
}
if (r !== 0) throw new Error("Um carrinho vazio deveria devolver 0, mas devolveu " + r + ".");`,
          },
          {
            description: 'Funciona com um item só',
            assertion: `if (total([{ preco: 7 }]) !== 7) throw new Error("Com um único item de 7, o total deveria ser 7.");`,
            hidden: true,
          },
        ],
        solution: `function total(carrinho) {
  let soma = 0;
  for (let i = 0; i < carrinho.length; i++) {
    soma = soma + carrinho[i].preco;
  }
  return soma;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `O tipo do erro já diz onde procurar: \`SyntaxError\` é escrita, \`ReferenceError\` é nome que não existe, \`TypeError\` é valor diferente do esperado. Quando travar, imprima os valores intermediários até achar **o primeiro** que não é o que você imaginava — a causa está ali, não onde o erro estourou.`,
    },
  ],
};

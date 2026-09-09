import type { Lesson } from '../types';

export const lessonImutabilidade: Lesson = {
  id: 'lesson-js-18',
  trackId: 'track-js-fundamentos',
  title: 'Imutabilidade: Copiar em Vez de Alterar',
  language: 'javascript',
  objective:
    'Reconhecer quando duas variáveis apontam para o mesmo objeto, e criar cópias em vez de alterar o original.',
  concepts: ['imutabilidade', 'arrays', 'objetos'],
  status: 'published',
  estimatedMinutes: 20,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Números e textos são copiados quando você os atribui. Objetos e listas, não — o que se copia é **o endereço**.

~~~javascript
const a = { total: 10 };
const b = a;

b.total = 99;
console.log(a.total);   // 99 — mexer em b mexeu em a
~~~

\`a\` e \`b\` não são dois objetos parecidos: são **dois nomes para o mesmo objeto**. Alterar por um nome altera por todos.

Esse é um dos bugs mais difíceis de rastrear em código real, porque a causa fica longe do sintoma. Uma função recebe uma lista, ordena para conferir alguma coisa, e sem querer reordena a lista de quem a chamou — que só percebe três telas depois.

A saída é uma disciplina simples: **em vez de alterar, produza um valor novo.**
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `const notas = [7, 5, 9];

// ALTERAM o original
notas.sort();      // reordena notas
notas.push(10);    // acrescenta em notas
notas.reverse();   // inverte notas
notas.splice(0, 1);

// PRODUZEM um valor novo
const ordenadas = [...notas].sort();   // copia antes de ordenar
const maiores = notas.map((n) => n + 1);
const aprovadas = notas.filter((n) => n >= 7);
const comExtra = [...notas, 10];

// Com objetos, o mesmo raciocínio
const usuario = { nome: 'Ana', idade: 30 };
const maisVelho = { ...usuario, idade: 31 };   // novo objeto
console.log(usuario.idade);   // 30 — intacto`,
      caption:
        '`sort`, `push`, `reverse` e `splice` alteram no lugar. `map`, `filter` e o espalhamento `...` devolvem outra coisa. Saber de cabeça em qual grupo cada método está evita metade desses bugs.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-18-prever-referencia',
        type: 'predict-output',
        prompt:
          'O que este programa imprime? Repare em quais variáveis apontam para o mesmo objeto.',
        concepts: ['imutabilidade', 'objetos'],
        difficulty: 'iniciante',
        tags: ['javascript', 'imutabilidade'],
        code: `const original = { itens: 2 };

const copia = { ...original };
const apelido = original;

copia.itens = 100;
apelido.itens = 50;

console.log(original.itens);
console.log(copia.itens);`,
        expectedOutput: '50\n100',
        explanation:
          '`copia` é um objeto novo, então mexer nele não afeta `original`. `apelido` é apenas outro nome para o mesmo objeto — por isso `original.itens` virou 50. O espalhamento `...` é o que separa os dois casos.',
        hints: [
          'Qual das duas linhas criou um objeto novo, e qual só criou outro nome?',
          '`{ ...original }` produz um objeto novo. `= original` produz o quê?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-18-lacuna-copia',
        type: 'fill-blank',
        prompt:
          'Esta função ordena a lista, mas está bagunçando a lista de quem a chamou. Complete para ela copiar antes de ordenar.',
        concepts: ['imutabilidade', 'arrays'],
        difficulty: 'iniciante',
        tags: ['javascript', 'imutabilidade'],
        template: `function ordenadas(numeros) {
  return [{{1}}numeros].sort((a, b) => a - b);
}`,
        blanks: [{ placeholder: 'espalhamento', size: 5 }],
        tests: [
          {
            description: 'ordenadas([3, 1, 2]) devolve [1, 2, 3]',
            assertion: `const r = ordenadas([3, 1, 2]); if (JSON.stringify(r) !== '[1,2,3]') throw new Error("Esperava [1,2,3], veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'a lista de quem chamou continua intacta',
            assertion: `
              const minha = [3, 1, 2];
              ordenadas(minha);
              if (JSON.stringify(minha) !== '[3,1,2]') throw new Error("A lista original virou " + JSON.stringify(minha) + ". A função ordenou no lugar em vez de copiar antes.");
            `,
          },
        ],
        properties: [
          {
            description: 'devolve ordenado e não toca no original',
            generate: `
              const n = Math.floor(rnd() * 10);
              const numeros = [];
              for (let i = 0; i < n; i++) numeros.push(Math.floor(rnd() * 100));
              return { numeros };
            `,
            check: `
              const antes = JSON.stringify(caso.numeros);
              const r = ordenadas(caso.numeros);
              const esperado = [...caso.numeros].sort((a, b) => a - b);

              if (JSON.stringify(r) !== JSON.stringify(esperado)) {
                throw new Error("com " + antes + " esperava " + JSON.stringify(esperado) + ", veio " + JSON.stringify(r) + ".");
              }
              if (JSON.stringify(caso.numeros) !== antes) {
                throw new Error("a lista original foi alterada: era " + antes + ", virou " + JSON.stringify(caso.numeros) + ".");
              }
            `,
          },
        ],
        explanation:
          '`sort` ordena no lugar e devolve a mesma lista. Espalhar os itens num array novo antes de ordenar deixa o original onde estava — quem chamou a função não é surpreendido.',
        hints: [
          'Os colchetes já estão ali. Falta o que espalha os itens de `numeros` dentro deles.',
          'São três pontos.',
        ],
        solution: ['...'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## A cópia rasa e o que ela não copia

O espalhamento copia **um nível**. Objetos aninhados continuam compartilhados:

~~~javascript
const config = { tema: 'claro', avancado: { limite: 10 } };
const nova = { ...config };

nova.tema = 'escuro';          // ok, só a cópia muda
nova.avancado.limite = 999;    // altera config.avancado também!

console.log(config.avancado.limite);   // 999
~~~

Para o nível de dentro, você precisa copiá-lo explicitamente:

~~~javascript
const nova = {
  ...config,
  avancado: { ...config.avancado, limite: 999 },
};
~~~

Existe \`structuredClone(config)\`, que copia tudo em profundidade. Ele resolve o
problema, mas cobra: percorre a estrutura inteira. Para um objeto de duas chaves é
desperdício — copie só o caminho que você vai mudar.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-18-atualizar-item',
        type: 'code',
        prompt:
          'Crie `comQuantidade(carrinho, id, quantidade)`, que devolve um **carrinho novo** com a quantidade daquele item alterada.\n\nO carrinho é uma lista de `{ id, nome, quantidade }`. Nem a lista original nem os objetos dentro dela podem ser alterados — se o id não existir, devolva uma cópia sem mudanças.',
        concepts: ['imutabilidade', 'arrays', 'objetos'],
        difficulty: 'intermediario',
        tags: ['javascript', 'imutabilidade'],
        initialCode: `function comQuantidade(carrinho, id, quantidade) {
  // Produza uma lista nova, com um objeto novo no lugar do item alterado.
}

const carrinho = [
  { id: 1, nome: 'Pão', quantidade: 2 },
  { id: 2, nome: 'Leite', quantidade: 1 },
];

console.log(comQuantidade(carrinho, 2, 5));
console.log(carrinho[1].quantidade); // esperado: 1 — o original não muda`,
        hints: [
          '`map` já devolve uma lista nova. O que falta é não devolver o mesmo objeto nos itens que mudam.',
          'Para o item que bate: `{ ...item, quantidade }`. Para os outros, devolva o item como está.',
          'Estrutura: `return carrinho.map((item) => item.id === id ? { ...item, quantidade } : item);`',
        ],
        tests: [
          {
            description: 'A função comQuantidade existe',
            assertion: `if (typeof comQuantidade !== 'function') throw new Error("Crie uma função chamada 'comQuantidade'.");`,
          },
          {
            description: 'altera a quantidade do item certo',
            assertion: `
              const c = [{ id: 1, nome: 'Pão', quantidade: 2 }, { id: 2, nome: 'Leite', quantidade: 1 }];
              const novo = comQuantidade(c, 2, 5);
              if (novo[1].quantidade !== 5) throw new Error("Esperava quantidade 5 no item 2, veio " + novo[1].quantidade + ".");
              if (novo[0].quantidade !== 2) throw new Error("O outro item não deveria mudar.");
            `,
          },
          {
            description: 'a lista original continua intacta',
            assertion: `
              const c = [{ id: 1, nome: 'Pão', quantidade: 2 }];
              comQuantidade(c, 1, 99);
              if (c[0].quantidade !== 2) throw new Error("O objeto original foi alterado: quantidade virou " + c[0].quantidade + ". Crie um objeto novo em vez de mexer no existente.");
            `,
          },
          {
            description: 'devolve uma lista diferente da original',
            assertion: `
              const c = [{ id: 1, nome: 'Pão', quantidade: 2 }];
              if (comQuantidade(c, 1, 5) === c) throw new Error("Devolveu a mesma lista. Produza uma nova.");
            `,
            hidden: true,
          },
          {
            description: 'id inexistente devolve cópia sem mudanças',
            assertion: `
              const c = [{ id: 1, nome: 'Pão', quantidade: 2 }];
              const novo = comQuantidade(c, 99, 5);
              if (JSON.stringify(novo) !== JSON.stringify(c)) throw new Error("Com id inexistente o conteúdo deveria ser igual, veio " + JSON.stringify(novo) + ".");
            `,
            hidden: true,
          },
          {
            description: 'os itens que não mudaram podem ser os mesmos objetos',
            assertion: `
              const c = [{ id: 1, nome: 'Pão', quantidade: 2 }, { id: 2, nome: 'Leite', quantidade: 1 }];
              const novo = comQuantidade(c, 1, 9);
              if (novo[1] !== c[1]) throw new Error("Copiar o que não mudou é desperdício: devolva o próprio item quando o id não bate.");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'só o item do id muda, e o original nunca é tocado',
            generate: `
              const n = Math.floor(rnd() * 5) + 1;
              const carrinho = [];
              for (let i = 1; i <= n; i++) {
                carrinho.push({ id: i, nome: 'item' + i, quantidade: Math.floor(rnd() * 9) + 1 });
              }
              return { carrinho, id: Math.floor(rnd() * (n + 2)), quantidade: Math.floor(rnd() * 20) };
            `,
            check: `
              const antes = JSON.stringify(caso.carrinho);
              const novo = comQuantidade(caso.carrinho, caso.id, caso.quantidade);

              if (JSON.stringify(caso.carrinho) !== antes) {
                throw new Error("o carrinho original foi alterado.");
              }

              const esperado = caso.carrinho.map((i) =>
                i.id === caso.id ? { ...i, quantidade: caso.quantidade } : i
              );

              if (JSON.stringify(novo) !== JSON.stringify(esperado)) {
                throw new Error("com id " + caso.id + " esperava " + JSON.stringify(esperado) + ", veio " + JSON.stringify(novo) + ".");
              }
            `,
          },
        ],
        solution: `function comQuantidade(carrinho, id, quantidade) {
  return carrinho.map((item) =>
    item.id === id ? { ...item, quantidade } : item
  );
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Atribuir um objeto copia o endereço, não o conteúdo: dois nomes, um objeto só. \`sort\`, \`push\`, \`reverse\` e \`splice\` alteram no lugar; \`map\`, \`filter\` e o espalhamento produzem valor novo. Copiar antes de mexer evita o bug cuja causa fica longe do sintoma — uma função que reordena a lista de quem a chamou. E o espalhamento copia **um nível**: o que estiver aninhado continua compartilhado até você copiá-lo também.`,
    },
  ],
};

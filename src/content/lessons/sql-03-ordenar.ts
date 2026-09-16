import type { Lesson } from '../types';

export const lessonOrdenar: Lesson = {
  id: 'lesson-sql-3',
  trackId: 'track-sql',
  title: 'ORDER BY, Expressões e Apelidos',
  language: 'sql',
  objective:
    'Ordenar o resultado por uma ou mais colunas, cortar com LIMIT, calcular colunas novas a partir das existentes, dar nome a elas com AS e tirar repetidos com DISTINCT.',
  concepts: ['sql-ordenar'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Na primeira aula ficou uma promessa: o SQL **não garante** a ordem das linhas. Se a ordem importa, você a pede.

## ORDER BY

~~~sql
SELECT nome, preco
FROM produtos
ORDER BY preco DESC
LIMIT 3;
~~~

| nome | preco |
| --- | --- |
| Teclado mecânico | 349 |
| Mochila escolar | 129.9 |
| Luminária de mesa | 98 |

\`ORDER BY preco DESC\` ordena do maior para o menor; \`ASC\` (o padrão, que pode ficar implícito) vai do menor para o maior. E agora o \`LIMIT 3\` tem significado: são **os três mais caros**, não "três quaisquer". \`ORDER BY\` e \`LIMIT\` juntos são a forma de perguntar "os maiores", "os mais recentes", "os primeiros".

A ordem das cláusulas é fixa, e é esta:

~~~
SELECT …  FROM …  WHERE …  ORDER BY …  LIMIT …
~~~

O \`WHERE\` filtra antes de ordenar; o \`LIMIT\` corta depois. Trocar a ordem das cláusulas é erro de sintaxe — "near LIMIT" ou "near WHERE" na mensagem quase sempre é isso.

Dá para ordenar por mais de uma coluna. A segunda desempata a primeira:

~~~sql
SELECT nome, categoria, preco
FROM produtos
ORDER BY categoria, preco DESC;
~~~

Primeiro por categoria em ordem alfabética; dentro de cada categoria, do mais caro ao mais barato. Cada coluna tem o seu \`ASC\`/\`DESC\`.

Texto ordena em ordem alfabética, número em ordem numérica, e as datas \`AAAA-MM-DD\` — que são texto — ordenam em ordem cronológica, que é o motivo de o formato ser esse. \`NULL\` vem primeiro no \`ASC\` e por último no \`DESC\`, no SQLite.

## Colunas calculadas

O \`SELECT\` não é só uma lista de colunas: é uma lista de **expressões**. Uma coluna é a expressão mais simples; uma conta com colunas é outra:

~~~sql
SELECT nome, preco, preco * estoque
FROM produtos;
~~~

A terceira coluna é o valor parado em estoque, calculado linha a linha. Vale aritmética (\`+ - * /\`), funções de texto (\`LENGTH\`, \`LOWER\`, \`UPPER\`), arredondamento (\`ROUND(x, 2)\`) e concatenação com \`||\`:

~~~sql
SELECT nome || ' (' || estado || ')'
FROM clientes;
~~~

devolve \`Ana Souza (SP)\`. Uma ressalva do SQLite: \`UPPER\` e \`LOWER\` só convertem letras sem acento — \`UPPER('João')\` dá \`JOãO\`. Para textos em português, trate maiúsculas fora do banco, ou não dependa disso.

Cuidado com a divisão: \`7 / 2\` entre inteiros dá \`3\` no SQLite, porque a divisão de inteiros é inteira. \`7 / 2.0\` dá \`3.5\`. Se uma coluna é \`INTEGER\` e você quer decimais, multiplique por \`1.0\` antes.

## AS: dar nome ao que você calculou

A coluna calculada nasce com um nome feio — \`preco * estoque\` — e quem consome o resultado (um programa, uma planilha) precisa de um nome de verdade:

~~~sql
SELECT nome, preco * estoque AS valor_em_estoque
FROM produtos
ORDER BY valor_em_estoque DESC
LIMIT 3;
~~~

| nome | valor_em_estoque |
| --- | --- |
| Fone de ouvido | 3560 |
| Teclado mecânico | 2792 |
| Mochila escolar | 1948.5 |

\`AS\` batiza a coluna — e o apelido pode ser usado no \`ORDER BY\`, como acima. Nos exercícios, quando o enunciado pedir um nome de coluna, a correção confere esse nome; quando não pedir, só as linhas.

## DISTINCT: sem repetir

"Quais categorias existem?" é \`SELECT categoria FROM produtos\` — que devolve doze linhas, uma por produto, com quatro valores repetidos. \`DISTINCT\` tira as repetições:

~~~sql
SELECT DISTINCT categoria FROM produtos;
~~~

Quatro linhas: papelaria, eletrônicos, livros, casa. Com mais de uma coluna, \`DISTINCT\` considera a **combinação**: \`SELECT DISTINCT cidade, estado\` repete "São Paulo" se houver uma em SP e outra em outro estado.
`.trim(),
    },
    {
      kind: 'example',
      language: 'sql',
      code: `-- Os cinco produtos mais baratos que ainda têm estoque, do mais barato ao mais caro.
SELECT nome, preco
FROM produtos
WHERE estoque > 0
ORDER BY preco
LIMIT 5;

-- O que cada item custou no total, com o pedido a que pertence: os três maiores.
SELECT pedido_id, quantidade * preco_unitario AS subtotal
FROM itens
ORDER BY subtotal DESC
LIMIT 3;`,
      caption:
        'WHERE, ORDER BY e LIMIT, nesta ordem. A segunda consulta ordena pelo apelido de uma coluna calculada — e o maior subtotal é o teclado do pedido cancelado, que a próxima aula vai aprender a deixar de fora.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-3-ordem-clausulas',
        type: 'order-steps',
        prompt:
          'Coloque as cláusulas na ordem em que o SQL exige. A consulta é: os nomes dos produtos de papelaria, do mais caro ao mais barato, só os dois primeiros.',
        concepts: ['sql-ordenar'],
        difficulty: 'iniciante',
        tags: ['sql', 'order-by', 'sintaxe'],
        steps: [
          { id: 'select', text: 'SELECT nome', ordem: 0 },
          { id: 'from', text: 'FROM produtos', ordem: 1 },
          { id: 'where', text: "WHERE categoria = 'papelaria'", ordem: 2 },
          { id: 'order', text: 'ORDER BY preco DESC', ordem: 3 },
          { id: 'limit', text: 'LIMIT 2', ordem: 4 },
        ],
        explanation:
          'SELECT, FROM, WHERE, ORDER BY, LIMIT — sempre nesta ordem. É também a ordem lógica de leitura: de onde, quais linhas, em que ordem, quantas. Fora dela é erro de sintaxe.',
        hints: ['Comece pelo par SELECT/FROM. O filtro vem antes de ordenar, e o corte por último.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-3-mais-caros',
        type: 'sql',
        database: 'loja',
        prompt:
          'Devolva o **nome** e o **preço** dos **3 produtos mais caros**, do mais caro ao mais barato.',
        concepts: ['sql-ordenar'],
        difficulty: 'iniciante',
        tags: ['sql', 'order-by', 'limit'],
        initialCode: `SELECT nome, preco
FROM produtos
`,
        tests: [{ description: 'Devolve os 3 mais caros, na ordem: teclado, mochila, luminária', ordered: true }],
        solution: `SELECT nome, preco
FROM produtos
ORDER BY preco DESC
LIMIT 3;`,
        hints: [
          '"Mais caros" é ordenar por preço do maior para o menor; "3" é o LIMIT.',
          '`ORDER BY preco DESC LIMIT 3`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-3-recentes',
        type: 'sql',
        database: 'loja',
        prompt:
          'Devolva o **nome** e a data de **cadastro** dos **3 clientes cadastrados mais recentemente**, do mais recente ao mais antigo.',
        concepts: ['sql-ordenar'],
        difficulty: 'iniciante',
        tags: ['sql', 'order-by', 'datas'],
        initialCode: `
`,
        tests: [{ description: 'Devolve os 3 cadastros mais recentes, do mais novo ao mais antigo', ordered: true }],
        solution: `SELECT nome, cadastro
FROM clientes
ORDER BY cadastro DESC
LIMIT 3;`,
        hints: [
          'As datas são texto AAAA-MM-DD: ordenar como texto é ordenar no tempo.',
          '"Mais recente primeiro" é `DESC`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-3-valor-em-estoque',
        type: 'sql',
        database: 'loja',
        prompt:
          'Para cada produto, devolva o **nome** e o valor parado em estoque (**preço × estoque**), numa coluna chamada **`valor_em_estoque`**. Ordene do maior valor para o menor.',
        concepts: ['sql-ordenar'],
        difficulty: 'intermediario',
        tags: ['sql', 'expressoes', 'as'],
        initialCode: `SELECT nome,
FROM produtos
ORDER BY `,
        tests: [
          {
            description: 'Devolve nome e valor_em_estoque dos 12 produtos, do maior valor ao menor',
            ordered: true,
            columns: true,
          },
        ],
        solution: `SELECT nome, preco * estoque AS valor_em_estoque
FROM produtos
ORDER BY valor_em_estoque DESC;`,
        hints: [
          'A segunda coluna é uma conta com duas colunas da tabela; o `AS` dá o nome.',
          'O apelido serve no ORDER BY: `ORDER BY valor_em_estoque DESC`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-3-categorias',
        type: 'sql',
        database: 'loja',
        prompt:
          'Quais **estados** têm clientes? Devolva cada sigla **uma vez só**, em ordem alfabética.',
        concepts: ['sql-ordenar'],
        difficulty: 'intermediario',
        tags: ['sql', 'distinct'],
        initialCode: `SELECT estado
FROM clientes;`,
        tests: [{ description: 'Devolve as 5 siglas, sem repetir, de MG a SP', ordered: true }],
        solution: `SELECT DISTINCT estado
FROM clientes
ORDER BY estado;`,
        hints: [
          'A consulta como está devolve dez linhas, com SP quatro vezes. A palavra que tira repetidos vai logo depois do SELECT.',
          '`SELECT DISTINCT estado … ORDER BY estado`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-3-com-desconto',
        type: 'sql',
        database: 'loja',
        prompt:
          'A loja vai dar **10% de desconto nos livros**. Devolva o **nome** de cada livro e o preço com desconto, arredondado a **2 casas**, numa coluna chamada **`com_desconto`**.',
        concepts: ['sql-ordenar'],
        difficulty: 'avancado',
        tags: ['sql', 'expressoes', 'round'],
        initialCode: `
`,
        tests: [{ description: 'Devolve os 2 livros com o preço a 90%, arredondado, na coluna com_desconto', columns: true }],
        solution: `SELECT nome, ROUND(preco * 0.9, 2) AS com_desconto
FROM produtos
WHERE categoria = 'livros';`,
        hints: [
          '10% de desconto é multiplicar por 0.9; `ROUND(valor, 2)` arredonda a duas casas.',
          'Filtre a categoria com WHERE, calcule no SELECT, dê o nome com AS.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
- \`ORDER BY coluna [ASC|DESC]\` ordena; várias colunas desempatam da esquerda para a direita.
- A ordem das cláusulas é fixa: \`SELECT\`, \`FROM\`, \`WHERE\`, \`ORDER BY\`, \`LIMIT\`.
- O \`SELECT\` aceita expressões: contas, \`ROUND\`, \`LENGTH\`, \`||\`. Divisão entre inteiros é inteira.
- \`AS\` dá nome a uma coluna calculada, e o apelido serve no \`ORDER BY\`.
- \`DISTINCT\` tira linhas repetidas, considerando todas as colunas listadas.
`.trim(),
    },
  ],
};

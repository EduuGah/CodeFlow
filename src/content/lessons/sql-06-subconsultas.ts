import type { Lesson } from '../types';

export const lessonSubconsultas: Lesson = {
  id: 'lesson-sql-6',
  trackId: 'track-sql',
  title: 'Subconsultas e WITH: Uma Consulta Dentro da Outra',
  language: 'sql',
  objective:
    'Usar o resultado de uma consulta dentro de outra — como valor, como lista e como tabela — e dar nome a etapas com WITH para uma consulta longa continuar legível.',
  concepts: ['sql-subconsultas'],
  status: 'published',
  estimatedMinutes: 35,
  blocks: [
    {
      kind: 'prose',
      markdown: `
"Quais produtos custam mais que a média?" pede duas coisas: a média, e depois o filtro. Em duas consultas, você rodaria \`SELECT AVG(preco) FROM produtos\`, leria 81.45, e escreveria \`WHERE preco > 81.45\`. Funciona até o catálogo mudar. Uma **subconsulta** faz as duas de uma vez:

~~~sql
SELECT nome, preco
FROM produtos
WHERE preco > (SELECT AVG(preco) FROM produtos);
~~~

O que está entre parênteses é uma consulta completa. O banco a roda primeiro, obtém um valor — 81.45 — e usa esse valor no lugar dela. Quatro produtos passam.

## Subconsulta como valor

A forma acima é a mais simples: a subconsulta devolve **uma linha e uma coluna**, e entra onde um valor entraria. \`preco = (SELECT MAX(preco) FROM produtos)\` é "o produto mais caro" — sem \`ORDER BY … LIMIT 1\`, e devolvendo todos em caso de empate. Se a subconsulta devolver mais de uma linha onde só cabia um valor, o SQLite usa a primeira e ignora o resto, sem avisar; outros bancos recusam. Garanta que ela devolve uma.

## Subconsulta como lista

Com \`IN\`, a subconsulta pode devolver **várias linhas** de uma coluna — uma lista:

~~~sql
SELECT nome
FROM clientes
WHERE id IN (
  SELECT p.cliente_id
  FROM pedidos p
  JOIN itens i ON i.pedido_id = p.id
  WHERE i.produto_id = 9
);
~~~

"Quem comprou o produto 9": a lista interna são os \`cliente_id\` dos pedidos com esse item; a consulta de fora pega os clientes cujo \`id\` está na lista. É a mesma pergunta que um \`JOIN\` responde — muitas vezes as duas formas são equivalentes, e a subconsulta lê melhor quando a pergunta é "quem está (ou não está) em tal conjunto".

\`NOT IN\` é o oposto — mas tem uma armadilha: se a lista contiver um \`NULL\`, \`NOT IN\` não devolve **nada**, pela regra de que comparação com \`NULL\` nunca é verdadeira. \`WHERE id NOT IN (SELECT cliente_id FROM pedidos)\` funciona porque \`cliente_id\` é \`NOT NULL\`. Numa coluna que aceita vazio, acrescente \`WHERE coluna IS NOT NULL\` dentro da subconsulta — ou use o \`LEFT JOIN … IS NULL\` da aula de JOIN.

## Subconsulta correlacionada

A subconsulta pode olhar para a linha de fora:

~~~sql
SELECT p.nome, p.categoria, p.preco
FROM produtos p
WHERE p.preco > (SELECT AVG(preco) FROM produtos WHERE categoria = p.categoria);
~~~

"Produtos acima da média **da própria categoria**." A subconsulta usa \`p.categoria\` — o apelido da consulta de fora — e por isso é recalculada para cada linha: a média de papelaria para a mochila, a de livros para o livro de SQL. É poderosa e é cara; numa tabela grande, vale reescrever com \`GROUP BY\` e \`JOIN\`.

## WITH: nomear uma etapa

Quando a subconsulta cresce, a consulta inteira vira parênteses dentro de parênteses. \`WITH\` tira a subconsulta de dentro e dá um nome a ela — uma **tabela temporária** que existe só nesta consulta:

~~~sql
WITH totais AS (
  SELECT pedido_id, SUM(quantidade * preco_unitario) AS total
  FROM itens
  GROUP BY pedido_id
)
SELECT ROUND(AVG(total), 2) AS ticket_medio
FROM totais;
~~~

Primeiro o total de cada pedido; depois a média desses totais — que é o ticket médio da loja, 148.33. Sem o \`WITH\`, seria \`SELECT AVG(total) FROM (SELECT … GROUP BY pedido_id)\`: a mesma coisa, com a etapa importante enterrada. O \`WITH\` (a *expressão de tabela comum*, CTE) lê de cima para baixo, como um programa: monte isto, chame de \`totais\`, agora use.

Dá para encadear várias (\`WITH a AS (…), b AS (…)\`), e uma pode usar a anterior. É a ferramenta que transforma uma consulta de vinte linhas em três parágrafos com nome.
`.trim(),
    },
    {
      kind: 'example',
      language: 'sql',
      code: `-- Quanto cada cliente gastou, sem o pedido cancelado — e quem gastou acima da média.
WITH gastos AS (
  SELECT p.cliente_id, SUM(i.quantidade * i.preco_unitario) AS gasto
  FROM pedidos p
  JOIN itens i ON i.pedido_id = p.id
  WHERE p.status <> 'cancelado'
  GROUP BY p.cliente_id
)
SELECT c.nome, g.gasto
FROM gastos g
JOIN clientes c ON c.id = g.cliente_id
WHERE g.gasto > (SELECT AVG(gasto) FROM gastos)
ORDER BY g.gasto DESC;`,
      caption:
        'A etapa `gastos` é usada duas vezes: como tabela no JOIN e dentro da subconsulta que calcula a média. Sem o WITH, o GROUP BY inteiro apareceria duas vezes.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-6-quando',
        type: 'multiple-choice',
        prompt:
          'Em `WHERE preco > (SELECT AVG(preco) FROM produtos)`, o que acontece se alguém cadastrar um produto novo amanhã?',
        concepts: ['sql-subconsultas'],
        difficulty: 'iniciante',
        tags: ['sql', 'subconsulta'],
        options: [
          'Nada: a média foi calculada quando a consulta foi escrita',
          'A consulta passa a usar a nova média, porque a subconsulta é recalculada a cada execução',
          'A consulta dá erro, porque a média mudou',
          'O produto novo é ignorado até a subconsulta ser reescrita',
        ],
        correctIndex: 1,
        explanation:
          'A subconsulta roda toda vez que a consulta roda, sobre o que estiver na tabela naquele momento. É a diferença entre escrever `> 81.45` (um número que envelhece) e `> (SELECT AVG(preco) …)` (uma pergunta que continua certa).',
        hints: ['Uma subconsulta é uma consulta. Quando ela roda?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-6-acima-da-media',
        type: 'sql',
        database: 'loja',
        prompt:
          'Devolva o **nome** e o **preço** dos produtos com preço **acima da média** de todos os produtos, do mais caro ao mais barato.',
        concepts: ['sql-subconsultas'],
        difficulty: 'iniciante',
        tags: ['sql', 'subconsulta', 'avg'],
        initialCode: `SELECT nome, preco
FROM produtos
WHERE preco >
ORDER BY preco DESC;`,
        tests: [{ description: 'Devolve os 4 produtos acima da média, do mais caro ao mais barato', ordered: true }],
        solution: `SELECT nome, preco
FROM produtos
WHERE preco > (SELECT AVG(preco) FROM produtos)
ORDER BY preco DESC;`,
        hints: [
          'A média é uma consulta: `SELECT AVG(preco) FROM produtos`. Ela entra entre parênteses no lugar do número.',
          '`WHERE preco > (SELECT AVG(preco) FROM produtos)`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-6-quem-comprou',
        type: 'sql',
        database: 'loja',
        prompt:
          'Quem já comprou o **"Livro: SQL para todos"** (produto **10**)? Devolva o **nome** de cada cliente, uma vez só, usando `IN` com uma subconsulta.',
        concepts: ['sql-subconsultas'],
        difficulty: 'intermediario',
        tags: ['sql', 'subconsulta', 'in'],
        initialCode: `SELECT nome
FROM clientes
WHERE id IN (

);`,
        tests: [{ description: 'Devolve os 2 clientes que compraram o produto 10' }],
        solution: `SELECT nome
FROM clientes
WHERE id IN (
  SELECT p.cliente_id
  FROM pedidos p
  JOIN itens i ON i.pedido_id = p.id
  WHERE i.produto_id = 10
);`,
        hints: [
          'A lista interna são os `cliente_id` dos pedidos que têm um item com `produto_id = 10`.',
          'Dentro dos parênteses: `pedidos` juntado com `itens`, filtrado pelo produto, selecionando só `cliente_id`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-6-mais-caro',
        type: 'sql',
        database: 'loja',
        prompt:
          'Devolva o **nome** e o **preço** do produto **mais caro** — sem usar `ORDER BY` nem `LIMIT`.',
        concepts: ['sql-subconsultas'],
        difficulty: 'intermediario',
        tags: ['sql', 'subconsulta', 'max'],
        initialCode: `
`,
        tests: [{ description: 'Devolve o teclado mecânico, o único com o preço máximo' }],
        solution: `SELECT nome, preco
FROM produtos
WHERE preco = (SELECT MAX(preco) FROM produtos);`,
        hints: [
          '"O mais caro" é "aquele cujo preço é igual ao maior preço". O maior preço é uma subconsulta.',
          '`WHERE preco = (SELECT MAX(preco) FROM produtos)` — e, se dois empatassem, os dois viriam.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-6-ticket-medio',
        type: 'sql',
        database: 'loja',
        prompt:
          'Qual o **ticket médio** da loja — a média do valor total dos pedidos? Monte com `WITH` uma etapa `totais` (o total de cada pedido) e devolva a média arredondada a **2 casas**, na coluna **`ticket_medio`**.',
        concepts: ['sql-subconsultas'],
        difficulty: 'avancado',
        tags: ['sql', 'with', 'cte'],
        initialCode: `WITH totais AS (

)
SELECT
FROM totais;`,
        tests: [{ description: 'Devolve o ticket médio dos 15 pedidos, arredondado', columns: true }],
        solution: `WITH totais AS (
  SELECT pedido_id, SUM(quantidade * preco_unitario) AS total
  FROM itens
  GROUP BY pedido_id
)
SELECT ROUND(AVG(total), 2) AS ticket_medio
FROM totais;`,
        hints: [
          'A etapa `totais` é um GROUP BY por `pedido_id` com a SUM dos itens.',
          'Fora: `ROUND(AVG(total), 2) AS ticket_medio`. A média de uma soma por grupo — só dá em duas etapas.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-6-acima-da-categoria',
        type: 'sql',
        database: 'loja',
        prompt:
          'Devolva **nome**, **categoria** e **preço** dos produtos que custam mais que a média **da própria categoria**.',
        concepts: ['sql-subconsultas'],
        difficulty: 'avancado',
        tags: ['sql', 'subconsulta', 'correlacionada'],
        initialCode: `SELECT p.nome, p.categoria, p.preco
FROM produtos p
WHERE p.preco > (SELECT AVG(preco) FROM produtos);`,
        tests: [{ description: 'Devolve os 4 produtos acima da média da sua categoria' }],
        solution: `SELECT p.nome, p.categoria, p.preco
FROM produtos p
WHERE p.preco > (SELECT AVG(preco) FROM produtos WHERE categoria = p.categoria);`,
        hints: [
          'A média que importa muda a cada linha: é a média dos produtos da mesma categoria que o produto de fora.',
          'Dentro da subconsulta, filtre `WHERE categoria = p.categoria` — o `p` é o apelido da consulta de fora.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
- Uma subconsulta entre parênteses é rodada primeiro e o resultado entra no lugar dela — como **valor** (\`> (SELECT AVG…)\`), como **lista** (\`IN (SELECT …)\`) ou como **tabela** (\`FROM (SELECT …)\`).
- \`NOT IN\` com um \`NULL\` na lista não devolve nada. Filtre o vazio dentro, ou use \`LEFT JOIN … IS NULL\`.
- Uma subconsulta **correlacionada** usa a linha de fora e roda para cada linha — poderosa e cara.
- \`WITH nome AS (…)\` dá nome a uma etapa. Lê-se de cima para baixo, e uma etapa pode usar a anterior.
`.trim(),
    },
  ],
};

import type { Lesson } from '../types';

export const lessonAgregacao: Lesson = {
  id: 'lesson-sql-5',
  trackId: 'track-sql',
  title: 'Agregação: Contar, Somar, Agrupar',
  language: 'sql',
  objective:
    'Resumir muitas linhas em poucas com COUNT, SUM, AVG, MIN e MAX; quebrar o resumo por grupo com GROUP BY; filtrar grupos com HAVING — e saber por que WHERE não serve para isso.',
  concepts: ['sql-agregacao'],
  status: 'published',
  estimatedMinutes: 35,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Até aqui toda consulta devolveu **linhas da tabela** — filtradas, ordenadas, juntadas, mas uma linha de saída para cada linha de entrada. As perguntas mais úteis são outras: *quantos* pedidos, *quanto* faturou, o preço *médio*. Uma resposta para muitas linhas.

## Funções de agregação

~~~sql
SELECT COUNT(*) AS total FROM pedidos;
~~~

| total |
| --- |
| 15 |

\`COUNT(*)\` conta linhas. As outras trabalham sobre uma coluna: \`SUM(preco)\` soma, \`AVG(preco)\` tira a média, \`MIN\` e \`MAX\` pegam os extremos. Todas **engolem o \`NULL\`**: \`COUNT(email)\` conta só os clientes com e-mail (8, não 10), e \`AVG\` de uma coluna com vazios é a média dos preenchidos. \`COUNT(DISTINCT cliente_id)\` conta valores diferentes — 9 clientes distintos fizeram os 15 pedidos.

Com \`WHERE\`, a agregação é sobre as linhas que passam no filtro. Quanto a loja faturou, sem contar o pedido cancelado:

~~~sql
SELECT SUM(i.quantidade * i.preco_unitario) AS faturamento
FROM itens i
JOIN pedidos p ON i.pedido_id = p.id
WHERE p.status <> 'cancelado';
~~~

O \`JOIN\` monta as linhas, o \`WHERE\` filtra, a \`SUM\` resume. A resposta é uma linha: 1875.9.

## GROUP BY

"Quantos pedidos em cada status?" é uma pergunta de agregação **por grupo**:

~~~sql
SELECT status, COUNT(*) AS quantidade
FROM pedidos
GROUP BY status;
~~~

| status | quantidade |
| --- | --- |
| entregue | 10 |
| pendente | 2 |
| enviado | 2 |
| cancelado | 1 |

\`GROUP BY status\` divide as linhas em pilhas — uma por valor de \`status\` — e a função de agregação roda **dentro de cada pilha**. Sai uma linha por grupo. Dá para agrupar por mais de uma coluna (\`GROUP BY estado, cidade\`): um grupo por combinação.

A regra que vale decorar: no \`SELECT\` de uma consulta com \`GROUP BY\` só podem aparecer **as colunas do agrupamento** e **funções de agregação**. \`SELECT status, data, COUNT(*) … GROUP BY status\` não faz sentido — o grupo "entregue" tem dez datas; qual seria *a* data? A maioria dos bancos recusa. O SQLite, por permissividade, devolve a data de uma linha qualquer do grupo, sem avisar. Não confie nisso: se está no \`SELECT\`, ou está no \`GROUP BY\` ou está dentro de uma função.

## HAVING: filtrar grupos

\`WHERE\` filtra linhas **antes** de agrupar. Para filtrar os **grupos** — "só os estados com dois ou mais clientes" — a cláusula é \`HAVING\`, que roda depois:

~~~sql
SELECT estado, COUNT(*) AS clientes
FROM clientes
GROUP BY estado
HAVING COUNT(*) >= 2;
~~~

\`WHERE COUNT(*) >= 2\` é erro: na hora do \`WHERE\` ainda não existem grupos para contar — o banco responde \`misuse of aggregate\`. E \`HAVING\` sem \`GROUP BY\` também é erro. Os dois filtros convivem: \`WHERE\` decide quais linhas entram nas pilhas, \`HAVING\` decide quais pilhas saem.

A ordem completa das cláusulas, agora:

~~~
SELECT … FROM … [JOIN … ON …] WHERE … GROUP BY … HAVING … ORDER BY … LIMIT …
~~~

## Agregação com JOIN

O total de cada pedido está espalhado nos itens dele. Juntar e agrupar pelo pedido resume:

~~~sql
SELECT p.id, SUM(i.quantidade * i.preco_unitario) AS total
FROM pedidos p
JOIN itens i ON i.pedido_id = p.id
GROUP BY p.id
ORDER BY total DESC
LIMIT 3;
~~~

| id | total |
| --- | --- |
| 9 | 394 |
| 4 | 349 |
| 5 | 175.9 |

Uma armadilha com \`LEFT JOIN\`: "quantos pedidos cada cliente fez" precisa manter o cliente sem pedido, com zero. \`COUNT(*)\` contaria a linha dele com \`NULL\` como 1; \`COUNT(p.id)\` ignora o \`NULL\` e dá 0. Conte a coluna da tabela da direita, não o asterisco.
`.trim(),
    },
    {
      kind: 'example',
      language: 'sql',
      code: `-- Por categoria: quantos produtos e o preço médio, arredondado.
SELECT categoria, COUNT(*) AS produtos, ROUND(AVG(preco), 2) AS preco_medio
FROM produtos
GROUP BY categoria
ORDER BY preco_medio DESC;

-- Produtos que já venderam 10 unidades ou mais, somando todos os pedidos.
SELECT pr.nome, SUM(i.quantidade) AS unidades
FROM itens i
JOIN produtos pr ON i.produto_id = pr.id
GROUP BY pr.id
HAVING SUM(i.quantidade) >= 10
ORDER BY unidades DESC;`,
      caption:
        'Na segunda, o HAVING repete a expressão da SUM — o apelido `unidades` também serviria no SQLite, mas nem todo banco aceita apelido no HAVING; a expressão inteira funciona em todos.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-5-where-having',
        type: 'multiple-choice',
        prompt:
          '`SELECT estado, COUNT(*) FROM clientes WHERE COUNT(*) >= 2 GROUP BY estado` é recusada com `misuse of aggregate`. Por quê?',
        concepts: ['sql-agregacao'],
        difficulty: 'iniciante',
        tags: ['sql', 'having', 'where'],
        options: [
          'Porque `COUNT(*)` só pode aparecer uma vez por consulta',
          'Porque o WHERE roda antes de agrupar, quando ainda não há grupos para contar; filtrar grupos é HAVING',
          'Porque faltou o `AS` depois do `COUNT(*)`',
          'Porque `estado` deveria vir depois do `COUNT(*)` no SELECT',
        ],
        correctIndex: 1,
        explanation:
          'A ordem de execução é: WHERE filtra linhas, GROUP BY forma os grupos, HAVING filtra os grupos. No WHERE, "contar o grupo" não existe ainda. A consulta certa é `… GROUP BY estado HAVING COUNT(*) >= 2`.',
        hints: ['Em que momento o banco sabe quantas linhas cada estado tem? Antes ou depois de agrupar?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-5-por-status',
        type: 'sql',
        database: 'loja',
        prompt:
          'Quantos pedidos há em cada **status**? Devolva o status e a contagem, numa coluna chamada **`quantidade`**.',
        concepts: ['sql-agregacao'],
        difficulty: 'iniciante',
        tags: ['sql', 'group-by', 'count'],
        initialCode: `SELECT status,
FROM pedidos
`,
        tests: [{ description: 'Devolve os 4 status com a quantidade de pedidos de cada um', columns: true }],
        solution: `SELECT status, COUNT(*) AS quantidade
FROM pedidos
GROUP BY status;`,
        hints: [
          'Uma linha por status é `GROUP BY status`; a contagem dentro de cada grupo é `COUNT(*)`.',
          '`SELECT status, COUNT(*) AS quantidade FROM pedidos GROUP BY status`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-5-faturamento',
        type: 'sql',
        database: 'loja',
        prompt:
          'Quanto a loja faturou com os pedidos **entregues**? Some `quantidade × preco_unitario` de todos os itens desses pedidos, numa coluna chamada **`faturamento`**.',
        concepts: ['sql-agregacao'],
        difficulty: 'intermediario',
        tags: ['sql', 'sum', 'join'],
        initialCode: `
`,
        tests: [{ description: 'Devolve uma linha com o faturamento dos pedidos entregues', columns: true }],
        solution: `SELECT SUM(i.quantidade * i.preco_unitario) AS faturamento
FROM itens i
JOIN pedidos p ON i.pedido_id = p.id
WHERE p.status = 'entregue';`,
        hints: [
          'O status está em `pedidos`; o valor está em `itens`. Junte, filtre com WHERE, some.',
          '`SUM(i.quantidade * i.preco_unitario)` — a soma de uma expressão, linha a linha.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-5-total-por-pedido',
        type: 'sql',
        database: 'loja',
        prompt:
          'Qual o valor total de cada pedido? Devolva o **id do pedido** e a soma dos itens dele, numa coluna **`total`** — só os pedidos com total **acima de 150**, do maior para o menor.',
        concepts: ['sql-agregacao'],
        difficulty: 'intermediario',
        tags: ['sql', 'group-by', 'having', 'order-by'],
        initialCode: `SELECT p.id, SUM(i.quantidade * i.preco_unitario) AS total
FROM pedidos p
JOIN itens i ON i.pedido_id = p.id
`,
        tests: [{ description: 'Devolve os 6 pedidos acima de 150, do maior total ao menor', ordered: true, columns: true }],
        solution: `SELECT p.id, SUM(i.quantidade * i.preco_unitario) AS total
FROM pedidos p
JOIN itens i ON i.pedido_id = p.id
GROUP BY p.id
HAVING SUM(i.quantidade * i.preco_unitario) > 150
ORDER BY total DESC;`,
        hints: [
          'Um grupo por pedido: `GROUP BY p.id`. O filtro é sobre a soma do grupo — que cláusula filtra grupos?',
          '`HAVING SUM(…) > 150`, e depois `ORDER BY total DESC`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-5-pedidos-por-cliente',
        type: 'sql',
        database: 'loja',
        prompt:
          'Quantos pedidos cada cliente fez — **incluindo quem fez zero**? Devolva o **nome** e a contagem na coluna **`pedidos`**, ordenando da maior contagem para a menor e, em caso de empate, por nome.',
        concepts: ['sql-agregacao'],
        difficulty: 'avancado',
        tags: ['sql', 'left-join', 'count', 'group-by'],
        initialCode: `SELECT c.nome, COUNT(*) AS pedidos
FROM clientes c
JOIN pedidos p ON p.cliente_id = c.id
GROUP BY c.id
ORDER BY pedidos DESC, c.nome;`,
        tests: [
          {
            description: 'Devolve os 10 clientes, com Fábio Nunes em 0, de Ana Souza (3) para baixo',
            ordered: true,
            columns: true,
          },
        ],
        solution: `SELECT c.nome, COUNT(p.id) AS pedidos
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id
GROUP BY c.id
ORDER BY pedidos DESC, c.nome;`,
        hints: [
          'Rode como está: Fábio Nunes não aparece. O INNER JOIN some com quem não tem pedido.',
          'Com LEFT JOIN ele aparece — mas `COUNT(*)` conta a linha vazia dele como 1. Conte a coluna do pedido: `COUNT(p.id)`.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
- \`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\` resumem muitas linhas numa. Todas ignoram \`NULL\`; \`COUNT(*)\` conta linhas, \`COUNT(coluna)\` conta preenchidos.
- \`GROUP BY\` forma um grupo por valor, e a agregação roda dentro de cada um. No \`SELECT\`, só colunas do agrupamento ou funções.
- \`WHERE\` filtra linhas antes de agrupar; \`HAVING\` filtra grupos depois.
- Ordem: \`SELECT\`, \`FROM\`, \`JOIN\`, \`WHERE\`, \`GROUP BY\`, \`HAVING\`, \`ORDER BY\`, \`LIMIT\`.
- Com \`LEFT JOIN\`, conte a coluna da direita (\`COUNT(p.id)\`) para o "zero" sair como zero.
`.trim(),
    },
  ],
};

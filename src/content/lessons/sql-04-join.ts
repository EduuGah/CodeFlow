import type { Lesson } from '../types';

export const lessonJoin: Lesson = {
  id: 'lesson-sql-4',
  trackId: 'track-sql',
  title: 'JOIN: Juntar Tabelas',
  language: 'sql',
  objective:
    'Ligar duas ou mais tabelas pela chave estrangeira com JOIN … ON, dar apelidos às tabelas, desfazer ambiguidades — e usar LEFT JOIN para achar quem não tem par.',
  concepts: ['sql-join'],
  status: 'published',
  estimatedMinutes: 35,
  blocks: [
    {
      kind: 'prose',
      markdown: `
A tabela \`pedidos\` não tem o nome de quem comprou. Tem \`cliente_id\`: um número que aponta para a linha certa de \`clientes\`. É uma **chave estrangeira** — e é assim que um banco relacional guarda relações: cada fato numa tabela só, e números ligando as tabelas.

Isso é bom para guardar (o nome do cliente existe num lugar; mudou, mudou para todos os pedidos) e ruim para ler: "o pedido 3 é do cliente 1" não diz nada a uma pessoa. \`JOIN\` faz o caminho de volta.

## INNER JOIN

~~~sql
SELECT pedidos.id, clientes.nome, pedidos.data
FROM pedidos
JOIN clientes ON pedidos.cliente_id = clientes.id;
~~~

| id | nome | data |
| --- | --- | --- |
| 1 | Ana Souza | 2024-03-02 |
| 2 | Bruno Lima | 2024-03-05 |
| 3 | Ana Souza | 2024-03-18 |
| … | … | … |

Lê-se: da tabela \`pedidos\`, **junte** \`clientes\`, **onde** o \`cliente_id\` do pedido é igual ao \`id\` do cliente. Para cada pedido, o banco encontra a linha de \`clientes\` que casa com a condição do \`ON\` e cola as duas lado a lado. O resultado é uma tabela mais larga, com colunas das duas.

\`JOIN\` sozinho quer dizer \`INNER JOIN\`: só entram os pares que **casam**. Um cliente sem pedido não aparece; um pedido com \`cliente_id\` de ninguém (que a chave estrangeira impede) também não.

## Apelidos e ambiguidade

Escrever \`pedidos.cliente_id\` toda hora cansa. Dê um apelido à tabela logo depois do nome:

~~~sql
SELECT p.id, c.nome, p.data
FROM pedidos p
JOIN clientes c ON p.cliente_id = c.id
WHERE c.estado = 'SP';
~~~

O apelido vale na consulta inteira — no \`SELECT\`, no \`ON\`, no \`WHERE\`. E resolve um problema que aparece assim que duas tabelas têm colunas de mesmo nome: as duas têm \`id\`, e \`SELECT id\` faz o banco responder \`ambiguous column name: id\`. Prefixe: \`p.id\` ou \`c.id\`. Boa prática: com mais de uma tabela, **prefixe todas as colunas**, mesmo as que não são ambíguas. Quem lê sabe de onde cada uma veio.

## Três tabelas, ou mais

Cada \`JOIN\` liga mais uma tabela, com o seu próprio \`ON\`. Para saber o que o cliente comprou, o caminho é \`clientes → pedidos → itens → produtos\`:

~~~sql
SELECT c.nome AS cliente, pr.nome AS produto, i.quantidade
FROM itens i
JOIN pedidos p ON i.pedido_id = p.id
JOIN clientes c ON p.cliente_id = c.id
JOIN produtos pr ON i.produto_id = pr.id
WHERE p.id = 9;
~~~

| cliente | produto | quantidade |
| --- | --- | --- |
| Diego Rocha | Teclado mecânico | 1 |
| Diego Rocha | Mouse sem fio | 1 |

Siga as chaves estrangeiras: \`itens.pedido_id → pedidos.id\`, \`pedidos.cliente_id → clientes.id\`, \`itens.produto_id → produtos.id\`. O painel de tabelas diz para onde cada \`_id\` aponta. Aqui \`clientes\` e \`produtos\` têm as duas uma coluna \`nome\` — o \`AS\` dá nomes diferentes às duas na saída.

## O JOIN sem ON

Se você esquecer o \`ON\` — ou escrever \`FROM pedidos, clientes\` sem \`WHERE\` —, o banco combina **cada** pedido com **cada** cliente: 15 × 10 = 150 linhas, quase todas mentira. É o **produto cartesiano**. Com tabelas de milhões de linhas, é a consulta que derruba o servidor. Nos exercícios, é a que estoura o prazo de 3 segundos. Todo \`JOIN\` tem o seu \`ON\`.

## LEFT JOIN: quem não tem par

"Quais clientes nunca fizeram pedido?" O \`INNER JOIN\` não responde: esses clientes justamente não casam com nada, e somem. \`LEFT JOIN\` mantém **todas** as linhas da tabela da esquerda; quando não há par, as colunas da direita vêm \`NULL\`:

~~~sql
SELECT c.nome, p.id
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id;
~~~

Fábio Nunes aparece uma vez, com \`p.id\` igual a \`NULL\`. E aí o filtro da aula passada fecha a pergunta:

~~~sql
WHERE p.id IS NULL
~~~

Esse par — \`LEFT JOIN\` com \`IS NULL\` na chave da direita — é a forma padrão de perguntar "quem não tem". Clientes sem pedido, produtos nunca vendidos, pedidos sem itens.
`.trim(),
    },
    {
      kind: 'example',
      language: 'sql',
      code: `-- Cada item do pedido 1, com o nome do produto em vez do número.
SELECT pr.nome, i.quantidade, i.preco_unitario
FROM itens i
JOIN produtos pr ON i.produto_id = pr.id
WHERE i.pedido_id = 1;

-- Itens vendidos por um preço diferente do preço atual do catálogo.
SELECT pr.nome, pr.preco AS preco_atual, i.preco_unitario AS preco_pago
FROM itens i
JOIN produtos pr ON i.produto_id = pr.id
WHERE i.preco_unitario <> pr.preco;`,
      caption:
        'A segunda consulta compara uma coluna de cada tabela na mesma linha — só possível depois do JOIN. Dois itens foram vendidos por menos que o preço de hoje: o teclado e o fone.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-4-chave-estrangeira',
        type: 'multiple-choice',
        prompt: 'Na tabela `pedidos`, o que a coluna `cliente_id` guarda?',
        concepts: ['sql-join'],
        difficulty: 'iniciante',
        tags: ['sql', 'join', 'chave-estrangeira'],
        options: [
          'Uma cópia do nome do cliente, para o pedido ser lido sem consultar `clientes`',
          'O `id` de uma linha de `clientes`: uma chave estrangeira, que o JOIN usa para achar o cliente',
          'A quantidade de pedidos que aquele cliente já fez',
          'Um número sorteado, sem relação com outra tabela',
        ],
        correctIndex: 1,
        explanation:
          'O nome mora em `clientes`, uma vez. `pedidos.cliente_id` aponta para `clientes.id` — é a chave estrangeira, e a condição do JOIN é exatamente essa igualdade: `ON pedidos.cliente_id = clientes.id`.',
        hints: ['O painel de tabelas diz: "chave estrangeira → clientes".'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-4-pedidos-com-nome',
        type: 'sql',
        database: 'loja',
        prompt:
          'Complete o JOIN para devolver, de cada pedido, o **id do pedido**, o **nome do cliente** e a **data** — nessa ordem.',
        concepts: ['sql-join'],
        difficulty: 'iniciante',
        tags: ['sql', 'join'],
        initialCode: `SELECT p.id, c.nome, p.data
FROM pedidos p
JOIN clientes c ON `,
        tests: [{ description: 'Devolve os 15 pedidos com o nome de quem comprou' }],
        solution: `SELECT p.id, c.nome, p.data
FROM pedidos p
JOIN clientes c ON p.cliente_id = c.id;`,
        hints: [
          'O ON liga a chave estrangeira de um lado à chave primária do outro.',
          '`ON p.cliente_id = c.id`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-4-itens-do-pedido',
        type: 'sql',
        database: 'loja',
        prompt:
          'Devolva o **nome do produto** e a **quantidade** de cada item do **pedido 5**.',
        concepts: ['sql-join'],
        difficulty: 'iniciante',
        tags: ['sql', 'join', 'where'],
        initialCode: `
`,
        tests: [{ description: 'Devolve os 2 itens do pedido 5, com nome do produto e quantidade' }],
        solution: `SELECT pr.nome, i.quantidade
FROM itens i
JOIN produtos pr ON i.produto_id = pr.id
WHERE i.pedido_id = 5;`,
        hints: [
          'Os itens estão em `itens`; o nome está em `produtos`. `itens.produto_id` aponta para `produtos.id`.',
          'O filtro é sobre `pedido_id`, que está em `itens` — nem precisa juntar `pedidos`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-4-ambiguo',
        type: 'multiple-choice',
        prompt:
          'A consulta `SELECT id, nome FROM pedidos JOIN clientes ON pedidos.cliente_id = clientes.id` é recusada com `ambiguous column name: id`. Qual é o conserto?',
        concepts: ['sql-join'],
        difficulty: 'intermediario',
        tags: ['sql', 'join', 'ambiguidade'],
        options: [
          'Trocar `JOIN` por `LEFT JOIN`',
          'Dizer de qual tabela é o `id`: `pedidos.id` ou `clientes.id`',
          'Tirar o `ON`, que está confundindo o banco',
          'Renomear a coluna `id` de uma das tabelas',
        ],
        correctIndex: 1,
        explanation:
          'As duas tabelas têm `id`, e o banco não adivinha qual você quer. `pedidos.id` (ou `p.id`, com apelido) resolve. `nome` não é ambíguo porque só `clientes` tem essa coluna — mas prefixar tudo é a prática que evita o problema antes de ele aparecer.',
        hints: ['Qual `id`: o do pedido ou o do cliente? Diga.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-4-tres-tabelas',
        type: 'sql',
        database: 'loja',
        prompt:
          'Para cada item já vendido, devolva o **nome do cliente** (coluna `cliente`), o **nome do produto** (coluna `produto`) e a **quantidade** — juntando as quatro tabelas.',
        concepts: ['sql-join'],
        difficulty: 'intermediario',
        tags: ['sql', 'join', 'tres-tabelas'],
        initialCode: `SELECT c.nome AS cliente, pr.nome AS produto, i.quantidade
FROM itens i
JOIN pedidos p ON i.pedido_id = p.id
`,
        tests: [{ description: 'Devolve os 25 itens com cliente, produto e quantidade', columns: true }],
        solution: `SELECT c.nome AS cliente, pr.nome AS produto, i.quantidade
FROM itens i
JOIN pedidos p ON i.pedido_id = p.id
JOIN clientes c ON p.cliente_id = c.id
JOIN produtos pr ON i.produto_id = pr.id;`,
        hints: [
          'Faltam dois JOINs: `clientes` (pela chave de `pedidos`) e `produtos` (pela chave de `itens`).',
          '`JOIN clientes c ON p.cliente_id = c.id` e `JOIN produtos pr ON i.produto_id = pr.id`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-4-nunca-vendido',
        type: 'sql',
        database: 'loja',
        prompt:
          'Qual produto **nunca foi vendido** — não aparece em nenhum item? Devolva o **nome** dele.',
        concepts: ['sql-join'],
        difficulty: 'avancado',
        tags: ['sql', 'left-join', 'null'],
        initialCode: `SELECT pr.nome
FROM produtos pr
JOIN itens i ON i.produto_id = pr.id;`,
        tests: [{ description: 'Devolve só o produto que não está em nenhum item' }],
        solution: `SELECT pr.nome
FROM produtos pr
LEFT JOIN itens i ON i.produto_id = pr.id
WHERE i.id IS NULL;`,
        hints: [
          'O INNER JOIN some com quem não casa — e é exatamente quem você quer ver. Precisa de um JOIN que mantenha todos os produtos.',
          'LEFT JOIN a partir de `produtos`, e depois `WHERE i.id IS NULL`: as linhas sem par têm as colunas de `itens` vazias.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
- Uma **chave estrangeira** (\`cliente_id\`) guarda o \`id\` de uma linha de outra tabela. \`JOIN … ON\` refaz a ligação.
- \`JOIN\` (inner) só devolve os pares que casam. Cada tabela a mais é mais um \`JOIN\` com o seu \`ON\`.
- Apelide as tabelas (\`FROM pedidos p\`) e prefixe as colunas: resolve \`ambiguous column name\` e diz de onde cada coluna veio.
- \`JOIN\` sem \`ON\` é o produto cartesiano — toda linha com toda linha.
- \`LEFT JOIN\` mantém todas as linhas da esquerda; \`WHERE direita.id IS NULL\` acha quem não tem par.
`.trim(),
    },
  ],
};

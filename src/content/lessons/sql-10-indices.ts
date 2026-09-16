import type { Lesson } from '../types';

export const lessonIndices: Lesson = {
  id: 'lesson-sql-10',
  trackId: 'track-sql',
  title: 'Índices: Por Que a Consulta Ficou Lenta',
  language: 'sql',
  objective:
    'Entender o que um índice é e o que ele custa, criar o índice certo para um WHERE, um JOIN ou um ORDER BY, ler o plano da consulta com EXPLAIN QUERY PLAN — e fechar a trilha com um relatório de verdade.',
  concepts: ['sql-indices'],
  status: 'published',
  estimatedMinutes: 35,
  blocks: [
    {
      kind: 'prose',
      markdown: `
As consultas desta trilha rodam em milissegundos porque o banco tem quinze pedidos. Com quinze milhões, \`SELECT * FROM pedidos WHERE cliente_id = 3\` leva segundos — o banco lê **todas** as linhas e testa uma a uma. É a **varredura** (*scan*), e é o que acontece por padrão.

## O que um índice é

O índice de um livro é uma lista ordenada de palavras com o número da página. Você não folheia o livro inteiro atrás de "JOIN": abre o índice, acha a letra J, vai à página. Um **índice de banco** é o mesmo: uma estrutura ordenada por uma coluna, com o endereço de cada linha, mantida pelo banco.

~~~sql
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
~~~

Com isto, \`WHERE cliente_id = 3\` deixa de varrer: o banco vai direto às linhas do cliente 3. Numa tabela grande, é a diferença entre segundos e milissegundos — e é, de longe, a causa mais comum de "o sistema ficou lento".

A chave primária **já tem** índice: \`WHERE id = 9\` sempre foi rápido. O que não tem, no SQLite e na maioria dos bancos, é a **chave estrangeira**. \`pedidos.cliente_id\`, \`itens.pedido_id\`, \`itens.produto_id\`: toda coluna que aparece num \`ON\` de \`JOIN\` é candidata a índice, porque o \`JOIN\` faz exatamente essa busca para cada linha.

## Ver o plano

\`EXPLAIN QUERY PLAN\` na frente de uma consulta faz o banco dizer **como** vai executá-la, sem executar:

~~~sql
EXPLAIN QUERY PLAN SELECT * FROM pedidos WHERE cliente_id = 3;
~~~

Sem índice: \`SCAN pedidos\`. Com o índice: \`SEARCH pedidos USING INDEX idx_pedidos_cliente (cliente_id=?)\`. \`SCAN\` é ler tudo; \`SEARCH\` é ir direto. Quando uma consulta está lenta, esta é a primeira coisa a olhar — e o texto muda um pouco de banco para banco, mas a ideia é a mesma em todos.

## O que o índice custa

Se índice acelera, por que não indexar tudo? Porque **cada índice é uma cópia ordenada** que precisa ser atualizada a cada \`INSERT\`, \`UPDATE\` e \`DELETE\`. Uma tabela com dez índices grava dez vezes mais devagar e ocupa mais disco. Índice é para a coluna que aparece em \`WHERE\`, em \`ON\` e em \`ORDER BY\` de consultas que **rodam muito** — não para toda coluna.

E numa tabela pequena ele não ajuda: ler doze produtos inteiros é mais rápido do que consultar um índice. O banco sabe disso e ignora o índice quando não compensa.

## Índice composto

Um índice pode ter mais de uma coluna, e a **ordem importa**:

~~~sql
CREATE INDEX idx_produtos_categoria_preco ON produtos(categoria, preco);
~~~

Serve para \`WHERE categoria = 'livros'\`, para \`WHERE categoria = 'livros' ORDER BY preco\` (o índice já está na ordem certa — some o \`USE TEMP B-TREE FOR ORDER BY\` do plano) e para \`WHERE categoria = 'livros' AND preco > 50\`. **Não** serve para \`WHERE preco > 50\` sozinho: é como procurar no índice de um livro por número de página. A regra: as colunas de igualdade primeiro, depois a de faixa ou de ordenação.

## O que impede o índice

Um índice só serve quando o banco consegue procurar nele **o valor que está na coluna**. Três casos comuns o inutilizam:

- **Função na coluna**: \`WHERE LOWER(email) = 'ana@…'\` — o índice tem o e-mail, não o e-mail em minúsculas. Guarde já normalizado.
- **\`LIKE\` começando com \`%\`**: \`LIKE '%USB%'\` não tem por onde começar a busca. \`LIKE 'Livro%'\` pode usar índice; \`'%Livro'\` não.
- **Conta na coluna**: \`WHERE preco * 1.1 > 100\`. Escreva \`WHERE preco > 100 / 1.1\`.

## Índice único

\`CREATE UNIQUE INDEX\` é uma restrição e um índice ao mesmo tempo: garante que a coluna não repete e acelera a busca por ela. É o que \`UNIQUE\` no \`CREATE TABLE\` faz por baixo. Uma sutileza: \`NULL\` não conta como repetido — dois clientes sem e-mail convivem num índice único de e-mail.

## Fim da trilha

Dez aulas: você lê, junta, agrega, escreve, desenha e acelera um banco. O último exercício é um relatório de verdade — o tipo de consulta que alguém pede numa segunda-feira — e usa a trilha inteira.
`.trim(),
    },
    {
      kind: 'example',
      language: 'sql',
      code: `-- Antes: o plano varre a tabela.
EXPLAIN QUERY PLAN
SELECT nome FROM produtos WHERE categoria = 'livros' ORDER BY preco;

-- O índice composto, e o plano depois dele.
CREATE INDEX idx_produtos_categoria_preco ON produtos(categoria, preco);

EXPLAIN QUERY PLAN
SELECT nome FROM produtos WHERE categoria = 'livros' ORDER BY preco;`,
      caption:
        'Duas tabelas de resultado: a primeira diz SCAN e "USE TEMP B-TREE FOR ORDER BY" (ordenou à parte); a segunda, SEARCH usando o índice — e sem a ordenação extra, porque o índice já está em ordem de preço dentro de cada categoria.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-10-custo',
        type: 'multiple-choice',
        prompt: 'Por que não criar um índice em toda coluna de toda tabela?',
        concepts: ['sql-indices'],
        difficulty: 'iniciante',
        tags: ['sql', 'indices', 'custo'],
        options: [
          'Porque o banco só permite um índice por tabela',
          'Porque cada índice é uma cópia ordenada, atualizada a cada escrita: mais índices, mais lentos ficam INSERT, UPDATE e DELETE, e mais disco',
          'Porque índices só funcionam em colunas de número',
          'Nenhum motivo: quanto mais índices, mais rápido tudo fica',
        ],
        correctIndex: 1,
        explanation:
          'Índice troca escrita por leitura. Vale para colunas de WHERE, ON e ORDER BY de consultas frequentes — a chave estrangeira é a candidata clássica. Para o resto, é custo sem retorno.',
        hints: ['O que o banco precisa fazer com o índice quando uma linha é inserida?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-10-indice-cliente',
        type: 'sql',
        database: 'loja',
        prompt:
          'A consulta "pedidos de um cliente" roda o dia inteiro. Crie o índice **`idx_pedidos_cliente`** na coluna certa de `pedidos` para ela deixar de varrer a tabela.',
        concepts: ['sql-indices'],
        difficulty: 'iniciante',
        tags: ['sql', 'indices', 'create-index'],
        initialCode: `CREATE INDEX `,
        tests: [
          {
            description: 'O índice idx_pedidos_cliente existe em pedidos',
            query: "SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'pedidos' AND name = 'idx_pedidos_cliente'",
          },
          {
            description: 'O plano de "pedidos do cliente 3" usa o índice (SEARCH, não SCAN)',
            query: 'EXPLAIN QUERY PLAN SELECT * FROM pedidos WHERE cliente_id = 3',
          },
        ],
        solution: `CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);`,
        hints: [
          '`CREATE INDEX nome ON tabela(coluna)`. A coluna é a que a consulta filtra.',
          '`ON pedidos(cliente_id)`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-10-composto',
        type: 'sql',
        database: 'loja',
        prompt:
          'A tela de catálogo lista os produtos de **uma categoria, em ordem de preço**. Crie o índice **`idx_produtos_categoria_preco`** com as duas colunas na ordem certa, para a consulta usar o índice e não precisar ordenar à parte.',
        concepts: ['sql-indices'],
        difficulty: 'intermediario',
        tags: ['sql', 'indices', 'composto'],
        initialCode: `CREATE INDEX idx_produtos_categoria_preco ON produtos(preco, categoria);`,
        tests: [
          {
            description: 'O plano de "livros por preço" usa o índice e não ordena à parte',
            query: "EXPLAIN QUERY PLAN SELECT nome FROM produtos WHERE categoria = 'livros' ORDER BY preco",
          },
        ],
        solution: `CREATE INDEX idx_produtos_categoria_preco ON produtos(categoria, preco);`,
        hints: [
          'Rode como está e olhe o plano: com `preco` primeiro, o índice não serve para `categoria = …`. A igualdade vem antes da ordenação.',
          '`ON produtos(categoria, preco)`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-10-impede',
        type: 'multiple-choice',
        prompt:
          'Existe um índice em `clientes(email)`. Qual destas consultas **não** consegue usá-lo?',
        concepts: ['sql-indices'],
        difficulty: 'intermediario',
        tags: ['sql', 'indices', 'funcao'],
        options: [
          "`WHERE email = 'ana@exemplo.com'`",
          "`WHERE email LIKE 'ana%'`",
          "`WHERE LOWER(email) = 'ana@exemplo.com'`",
          '`WHERE email IS NULL`',
        ],
        correctIndex: 2,
        explanation:
          'O índice guarda o e-mail como está. `LOWER(email)` é outro valor, que não está em índice nenhum — o banco calcula a função em cada linha, varrendo tudo. A saída é guardar o e-mail já em minúsculas, ou criar um índice sobre a expressão (que alguns bancos permitem).',
        hints: ['Qual das quatro compara algo que não é o valor guardado na coluna?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-10-unico',
        type: 'sql',
        database: 'loja',
        prompt:
          'Garanta que **não existam dois clientes com o mesmo e-mail** — com um índice único chamado **`idx_clientes_email`**. Clientes sem e-mail continuam permitidos.',
        concepts: ['sql-indices'],
        difficulty: 'intermediario',
        tags: ['sql', 'indices', 'unique'],
        initialCode: `
`,
        tests: [
          {
            description: 'Recusa um segundo cliente com o e-mail da Ana',
            query: "INSERT INTO clientes (nome, email, cidade, estado, cadastro) VALUES ('Outra Ana', 'ana@exemplo.com', 'Santos', 'SP', '2024-08-01')",
          },
          {
            description: 'Aceita mais um cliente sem e-mail',
            query: "INSERT INTO clientes (nome, email, cidade, estado, cadastro) VALUES ('Sem Email', NULL, 'Santos', 'SP', '2024-08-01'); SELECT COUNT(*) FROM clientes WHERE email IS NULL",
          },
          {
            description: 'O índice idx_clientes_email existe',
            query: "SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_clientes_email'",
          },
        ],
        solution: `CREATE UNIQUE INDEX idx_clientes_email ON clientes(email);`,
        hints: [
          '`CREATE UNIQUE INDEX nome ON tabela(coluna)`.',
          'NULL não conta como repetido num índice único — por isso os clientes sem e-mail passam.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-10-relatorio',
        type: 'sql',
        database: 'loja',
        prompt:
          'O relatório de segunda-feira: **faturamento por categoria**, contando só os pedidos **entregues**. Devolva `categoria` e a soma de `quantidade × preco_unitario` numa coluna **`faturamento`**, da categoria que mais faturou para a que menos faturou.',
        concepts: ['sql-indices', 'sql-agregacao', 'sql-join'],
        difficulty: 'avancado',
        tags: ['sql', 'relatorio', 'join', 'group-by'],
        initialCode: `
`,
        tests: [
          {
            description: 'Devolve as 4 categorias com o faturamento dos pedidos entregues, da maior para a menor',
            ordered: true,
            columns: true,
          },
        ],
        solution: `SELECT pr.categoria, SUM(i.quantidade * i.preco_unitario) AS faturamento
FROM itens i
JOIN produtos pr ON pr.id = i.produto_id
JOIN pedidos p ON p.id = i.pedido_id
WHERE p.status = 'entregue'
GROUP BY pr.categoria
ORDER BY faturamento DESC;`,
        hints: [
          'A categoria está em `produtos`, o status em `pedidos`, o valor em `itens`: três tabelas, dois JOINs.',
          'WHERE no status, GROUP BY na categoria, SUM da expressão, ORDER BY no apelido com DESC.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
- Sem índice, o banco **varre** a tabela (\`SCAN\`); com índice, vai direto (\`SEARCH\`). \`EXPLAIN QUERY PLAN\` mostra qual dos dois.
- A chave primária já é indexada; a chave estrangeira não — e é a primeira candidata.
- Cada índice custa em toda escrita e em disco. Indexe o que aparece em \`WHERE\`, \`ON\` e \`ORDER BY\` de consultas frequentes.
- No índice composto, igualdade antes de faixa ou ordenação.
- Função, conta ou \`LIKE '%…'\` sobre a coluna impedem o uso do índice.
- \`CREATE UNIQUE INDEX\` é restrição e índice; \`NULL\` não conta como repetido.
`.trim(),
    },
  ],
};

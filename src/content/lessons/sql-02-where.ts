import type { Lesson } from '../types';

export const lessonWhere: Lesson = {
  id: 'lesson-sql-2',
  trackId: 'track-sql',
  title: 'WHERE: Escolher as Linhas',
  language: 'sql',
  objective:
    'Filtrar linhas com WHERE: comparar, combinar condições com AND, OR e NOT, testar listas e faixas, casar padrões de texto e encontrar o que está vazio.',
  concepts: ['sql-where'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
\`SELECT\` escolhe **colunas**. Para escolher **linhas**, existe o \`WHERE\`:

~~~sql
SELECT nome, preco
FROM produtos
WHERE preco < 10;
~~~

| nome | preco |
| --- | --- |
| Caneta esferográfica azul | 2.3 |
| Lápis 2B | 1.8 |

O banco olha cada linha de \`produtos\`, testa a condição \`preco < 10\`, e só devolve as linhas em que ela é **verdadeira**. É o \`filter\` do JavaScript, escrito como uma frase. E vem **depois** do \`FROM\`: primeiro de onde, depois quais.

## Comparar

Os operadores são os que você conhece, com duas diferenças. Igualdade é **um** sinal de igual, e "diferente" se escreve \`<>\` (ou \`!=\`):

~~~sql
WHERE estado = 'SP'
WHERE status <> 'cancelado'
WHERE estoque >= 10
~~~

Texto vai entre **aspas simples**: \`'SP'\`, \`'cancelado'\`. Aspas duplas em SQL são para nomes de coluna, e \`"SP"\` seria procurado como uma coluna chamada SP — o erro mais comum da primeira semana. Número vai sem aspas, e a comparação é numérica: \`preco < 10\` compara 2.3 com 10, não "2.3" com "10".

Maiúsculas importam no texto: \`'sp'\` não é \`'SP'\`. O banco compara o que está guardado, letra por letra.

## Combinar condições

\`AND\` exige as duas; \`OR\` aceita qualquer uma; \`NOT\` inverte:

~~~sql
SELECT nome, preco
FROM produtos
WHERE categoria = 'eletrônicos' AND preco < 100;
~~~

Três eletrônicos custam menos de 100: o fone, o mouse e o carregador. O teclado, de 349, fica de fora — a linha precisa passar **nas duas** condições.

Misturando \`AND\` e \`OR\`, use parênteses. \`AND\` tem precedência, como a multiplicação sobre a soma, e \`a OR b AND c\` é \`a OR (b AND c)\` — quase nunca o que você quis dizer. Com parênteses, ninguém precisa lembrar a regra.

## Listas e faixas

"O estado é SP ou RJ ou MG" vira uma lista com \`IN\`:

~~~sql
WHERE estado IN ('SP', 'RJ', 'MG')
~~~

E "entre estas datas", uma faixa com \`BETWEEN\`, que inclui as duas pontas:

~~~sql
WHERE data BETWEEN '2024-06-01' AND '2024-06-30'
~~~

As datas deste banco são texto no formato \`AAAA-MM-DD\`. É de propósito: nesse formato, a ordem alfabética é a ordem cronológica, e comparar com \`<\` e \`BETWEEN\` funciona sem função nenhuma.

## Padrões de texto

\`LIKE\` casa um padrão. \`%\` é "qualquer coisa, inclusive nada"; \`_\` é "exatamente um caractere":

~~~sql
WHERE nome LIKE 'Livro%'     -- começa com Livro
WHERE nome LIKE '%USB%'      -- contém USB
WHERE cidade LIKE '%o'       -- termina com o
~~~

No SQLite, \`LIKE\` **não** diferencia maiúsculas para letras sem acento: \`'livro%'\` também acha "Livro: SQL para todos". Outros bancos diferem nesse detalhe — é o tipo de coisa que se confere na documentação do banco que você estiver usando.

## O vazio

Dois clientes não informaram e-mail. Na tabela, o campo deles é \`NULL\`: não é texto vazio, não é zero — é **ausência de valor**. E \`NULL\` não é igual a nada, nem a ele mesmo: \`email = NULL\` é sempre falso, e não devolve linha nenhuma.

Para o vazio, o teste é outro:

~~~sql
WHERE email IS NULL
WHERE email IS NOT NULL
~~~

Guarde isto: **toda comparação com \`NULL\` dá \`NULL\`**, que o \`WHERE\` trata como falso. \`preco > 10\` não devolve uma linha cujo preço é \`NULL\` — nem \`preco <= 10\` devolve. A linha some das duas. É a fonte de metade dos "cadê a linha que eu sei que existe?" da vida real.
`.trim(),
    },
    {
      kind: 'example',
      language: 'sql',
      code: `-- Pedidos que ainda não chegaram: os enviados e os pendentes.
SELECT id, data, status
FROM pedidos
WHERE status IN ('pendente', 'enviado');

-- Papelaria barata, ou qualquer livro — os parênteses dizem o que vai junto.
SELECT nome, categoria, preco
FROM produtos
WHERE (categoria = 'papelaria' AND preco < 5) OR categoria = 'livros';`,
      caption:
        'Sem os parênteses, o AND ganharia do OR e a segunda consulta diria outra coisa. Escreva o que você quer dizer, e não o que a precedência deixa passar.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-2-aspas',
        type: 'multiple-choice',
        prompt:
          'Uma pessoa escreveu `SELECT nome FROM clientes WHERE estado = "SP"` e o banco respondeu `no such column: SP`. Por quê?',
        concepts: ['sql-where'],
        difficulty: 'iniciante',
        tags: ['sql', 'where', 'texto'],
        options: [
          'Porque `estado` é uma coluna de número, e SP não é número',
          'Porque em SQL as aspas duplas nomeiam colunas; texto vai entre aspas simples: `\'SP\'`',
          'Porque a tabela `clientes` não tem a coluna `estado`',
          'Porque faltou o ponto e vírgula no fim',
        ],
        correctIndex: 1,
        explanation:
          '`"SP"` pediu ao banco a coluna chamada SP, que não existe. Texto literal é sempre entre aspas simples: `\'SP\'`. O erro é tão comum que vale ler a mensagem com atenção da próxima vez: "no such column" com um valor no lugar do nome é quase sempre isso.',
        hints: ['Releia a mensagem: o banco procurou uma *coluna* chamada SP.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-2-sp',
        type: 'sql',
        database: 'loja',
        prompt: 'Complete a consulta para devolver o **nome** e a **cidade** dos clientes do estado de **SP**.',
        concepts: ['sql-where'],
        difficulty: 'iniciante',
        tags: ['sql', 'where'],
        initialCode: `SELECT nome, cidade
FROM clientes
WHERE `,
        tests: [{ description: 'Devolve os 4 clientes de SP, com nome e cidade' }],
        solution: `SELECT nome, cidade
FROM clientes
WHERE estado = 'SP';`,
        hints: [
          'A coluna que guarda a sigla é `estado`. Compare com o texto, entre aspas simples.',
          '`WHERE estado = \'SP\'`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-2-eletronicos-baratos',
        type: 'sql',
        database: 'loja',
        prompt:
          'Devolva o **nome** e o **preço** dos produtos da categoria **eletrônicos** que custam **menos de 100**.',
        concepts: ['sql-where'],
        difficulty: 'iniciante',
        tags: ['sql', 'where', 'and'],
        initialCode: `-- Duas condições, as duas obrigatórias.
`,
        tests: [{ description: 'Devolve os 3 eletrônicos abaixo de 100, com nome e preço' }],
        solution: `SELECT nome, preco
FROM produtos
WHERE categoria = 'eletrônicos' AND preco < 100;`,
        hints: [
          'Uma condição sobre `categoria` e outra sobre `preco`, ligadas por `AND`.',
          'A categoria é texto: `\'eletrônicos\'`, com acento, como está na tabela.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-2-sem-email',
        type: 'sql',
        database: 'loja',
        prompt:
          'Alguns clientes não informaram e-mail. Devolva o **nome** de cada um deles.',
        concepts: ['sql-where'],
        difficulty: 'intermediario',
        tags: ['sql', 'where', 'null'],
        initialCode: `SELECT nome
FROM clientes
WHERE email = '';`,
        tests: [{ description: 'Devolve os 2 clientes sem e-mail' }],
        solution: `SELECT nome
FROM clientes
WHERE email IS NULL;`,
        hints: [
          'O campo não é texto vazio: é ausência de valor. A consulta como está não devolve nada — confira executando.',
          'O teste para ausência é `IS NULL`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-2-junho',
        type: 'sql',
        database: 'loja',
        prompt:
          'Devolva o **id** e a **data** dos pedidos feitos em **junho de 2024**, do dia 1 ao dia 30.',
        concepts: ['sql-where'],
        difficulty: 'intermediario',
        tags: ['sql', 'where', 'between'],
        initialCode: `
`,
        tests: [{ description: 'Devolve os 4 pedidos de junho, com id e data' }],
        solution: `SELECT id, data
FROM pedidos
WHERE data BETWEEN '2024-06-01' AND '2024-06-30';`,
        hints: [
          'As datas são texto no formato AAAA-MM-DD, e nesse formato comparar como texto funciona.',
          '`BETWEEN \'2024-06-01\' AND \'2024-06-30\'` — ou duas comparações com `AND`. Um `LIKE \'2024-06%\'` também resolve.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-2-em-estoque-fora-papelaria',
        type: 'sql',
        database: 'loja',
        prompt:
          'Devolva o **nome** dos produtos que **não** são de papelaria **e** têm estoque (**estoque maior que zero**). São 7.',
        concepts: ['sql-where'],
        difficulty: 'intermediario',
        tags: ['sql', 'where', 'not'],
        initialCode: `
`,
        tests: [{ description: 'Devolve os 7 produtos com estoque fora da papelaria' }],
        solution: `SELECT nome
FROM produtos
WHERE categoria <> 'papelaria' AND estoque > 0;`,
        hints: [
          '"Não é papelaria" é uma comparação de diferença; "tem estoque" é uma comparação numérica.',
          '`categoria <> \'papelaria\' AND estoque > 0`. O carregador fica de fora: é eletrônico, mas o estoque é 0.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
- \`WHERE\` testa uma condição em cada linha e devolve as que passam. Vem depois do \`FROM\`.
- Igualdade é \`=\`; diferença é \`<>\`. Texto entre **aspas simples**; número sem aspas.
- \`AND\`, \`OR\`, \`NOT\` — e parênteses sempre que misturar \`AND\` com \`OR\`.
- \`IN (…)\` para listas; \`BETWEEN a AND b\` para faixas, com as pontas incluídas.
- \`LIKE\` casa padrões: \`%\` é qualquer coisa, \`_\` é um caractere.
- \`NULL\` não é igual a nada; o teste é \`IS NULL\` / \`IS NOT NULL\`. Toda comparação com \`NULL\` sai do resultado.
`.trim(),
    },
  ],
};

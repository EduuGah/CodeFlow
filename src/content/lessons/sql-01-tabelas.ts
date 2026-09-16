import type { Lesson } from '../types';

export const lessonTabelas: Lesson = {
  id: 'lesson-sql-1',
  trackId: 'track-sql',
  title: 'Tabelas: Onde os Dados Moram',
  language: 'sql',
  objective:
    'Ler um banco relacional — tabela, linha, coluna, chave — e escrever o primeiro SELECT: quais colunas, de qual tabela.',
  concepts: ['sql-tabelas'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Todo aplicativo que você já usou guarda dados em algum lugar que sobrevive a fechar a aba: o pedido que você fez, o nome que cadastrou, a mensagem que enviou. Na maior parte deles esse lugar é um **banco de dados relacional** — e a linguagem para conversar com ele é o **SQL**.

Você já escreveu JavaScript, uma linguagem em que se diz *como* fazer: percorra a lista, compare cada item, guarde os que passam. SQL é o oposto. Em SQL você diz **o que quer** — "o nome e o preço dos produtos" — e o banco decide como buscar. Uma linha de SQL substitui um laço inteiro.

## A forma dos dados

Um banco relacional é um conjunto de **tabelas**. Uma tabela é uma grade, como uma planilha: **colunas** com nome e tipo, e **linhas** com os dados. Esta é a tabela \`produtos\` do banco que você vai usar na trilha inteira — uma loja pequena de papelaria e eletrônicos:

| id | nome | categoria | preco | estoque |
| --- | --- | --- | --- | --- |
| 1 | Caderno 96 folhas | papelaria | 12.5 | 120 |
| 2 | Caneta esferográfica azul | papelaria | 2.3 | 500 |
| 5 | Fone de ouvido | eletrônicos | 89 | 40 |

Cada **linha** é um produto. Cada **coluna** é uma característica que todo produto tem: \`nome\`, \`preco\`, \`estoque\`. Uma coluna tem um **tipo** — \`preco\` é número com casas decimais (\`REAL\`), \`estoque\` é inteiro (\`INTEGER\`), \`nome\` é texto (\`TEXT\`) — e o banco recusa o que não é do tipo.

A primeira coluna, \`id\`, é a **chave primária**: um número que identifica a linha e nunca se repete. Dois produtos podem se chamar "Caderno"; dois produtos nunca têm o mesmo \`id\`. É por ele que outras tabelas apontam para esta, como você vai ver na aula de JOIN.

O banco da loja tem quatro tabelas: \`clientes\`, \`produtos\`, \`pedidos\` e \`itens\`. Elas ficam listadas **acima do editor** em todo exercício, com as colunas e o que cada uma guarda. Você não precisa decorar nada: olhe lá.

## O SELECT

A pergunta mais simples que se faz a um banco é "me mostre estas colunas desta tabela":

~~~sql
SELECT nome, preco
FROM produtos;
~~~

Lê-se de trás para a frente: **da** tabela \`produtos\` (\`FROM\`), **selecione** as colunas \`nome\` e \`preco\` (\`SELECT\`). O resultado é uma tabela nova — só com essas duas colunas, e com uma linha para cada produto:

| nome | preco |
| --- | --- |
| Caderno 96 folhas | 12.5 |
| Caneta esferográfica azul | 2.3 |
| … | … |

Três coisas para reparar:

- As colunas vêm **na ordem em que você as listou**, separadas por vírgula. \`SELECT preco, nome\` devolve o preço primeiro.
- As palavras-chave (\`SELECT\`, \`FROM\`) não diferenciam maiúsculas: \`select\` funciona. A convenção é escrevê-las em maiúsculas para saltarem aos olhos, e os nomes de tabela e coluna em minúsculas.
- O ponto e vírgula fecha o comando. Com um comando só ele é opcional, mas acostume-se: é o que separa dois comandos no mesmo texto.

Para todas as colunas, o asterisco:

~~~sql
SELECT * FROM produtos;
~~~

\`*\` é útil para **espiar** uma tabela que você não conhece. Em código de verdade, prefira listar as colunas: quem lê a consulta sabe o que ela devolve, e uma coluna nova na tabela não muda o resultado de repente.

## Espiar sem trazer tudo

Uma tabela de verdade tem milhões de linhas. \`LIMIT\` corta o resultado:

~~~sql
SELECT * FROM pedidos LIMIT 3;
~~~

Devolve os três primeiros pedidos. "Primeiros" aqui é na ordem em que o banco os encontra — normalmente a ordem em que foram inseridos, mas o SQL **não promete** isso. Quando a ordem importar, você vai dizê-la, com o \`ORDER BY\` da terceira aula.

## Como funciona aqui

Nos exercícios desta trilha, "Executar consulta" roda o seu SQL num banco de verdade — o SQLite, o mesmo que está dentro do seu celular — e mostra as **linhas devolvidas** numa tabela. A correção compara essas linhas com as que a consulta certa devolve. Não compara o texto: \`SELECT nome, preco\` e \`select nome,preco\` são a mesma resposta, e qualquer consulta que devolva as linhas certas está certa.

O banco é recriado a cada execução. Pode errar à vontade — nada que você faça nele sobrevive ao próximo clique.
`.trim(),
    },
    {
      kind: 'example',
      language: 'sql',
      code: `-- Quem são os clientes: só o que interessa para uma lista de contatos.
SELECT nome, email, cidade
FROM clientes;

-- As três colunas que descrevem um item vendido.
SELECT pedido_id, produto_id, quantidade
FROM itens;`,
      caption:
        'Dois comandos, cada um fechado com ponto e vírgula. O painel de resultado mostra uma tabela para cada SELECT — e a correção olha para a última.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-1-linha-coluna',
        type: 'multiple-choice',
        prompt:
          'Na tabela `clientes`, o que é **uma linha** e o que é **uma coluna**?',
        concepts: ['sql-tabelas'],
        difficulty: 'iniciante',
        tags: ['sql', 'tabelas'],
        options: [
          'Uma linha é um cliente; uma coluna é uma característica que todo cliente tem, como `cidade`',
          'Uma linha é uma característica, como `cidade`; uma coluna é um cliente',
          'Linha e coluna são a mesma coisa vista de ângulos diferentes',
          'Uma linha é uma tabela pequena dentro da tabela grande',
        ],
        correctIndex: 0,
        explanation:
          'A tabela é uma grade: cada linha é um registro (um cliente inteiro) e cada coluna é um campo que todos os registros têm (`nome`, `cidade`, `estado`…). Uma consulta escolhe colunas com `SELECT` e, na próxima aula, linhas com `WHERE`.',
        hints: ['Pense na tabela como uma planilha: cada pessoa ocupa uma linha inteira.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-1-nome-categoria',
        type: 'sql',
        database: 'loja',
        prompt:
          'Complete a consulta para devolver o **nome** e a **categoria** de todos os produtos — nessa ordem.',
        concepts: ['sql-tabelas'],
        difficulty: 'iniciante',
        tags: ['sql', 'select'],
        initialCode: `-- Liste as duas colunas depois do SELECT, separadas por vírgula.
SELECT
FROM produtos;`,
        tests: [{ description: 'Devolve o nome e a categoria de cada um dos 12 produtos' }],
        solution: `SELECT nome, categoria
FROM produtos;`,
        hints: [
          'O SELECT recebe a lista de colunas; os nomes estão no painel de tabelas, em `produtos`.',
          'Duas colunas: `SELECT nome, categoria`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-1-clientes',
        type: 'sql',
        database: 'loja',
        prompt:
          'Escreva uma consulta que devolva o **id**, o **nome** e a **cidade** de todos os clientes.',
        concepts: ['sql-tabelas'],
        difficulty: 'iniciante',
        tags: ['sql', 'select'],
        initialCode: `-- Escreva o SELECT aqui.
`,
        tests: [{ description: 'Devolve id, nome e cidade dos 10 clientes' }],
        solution: `SELECT id, nome, cidade
FROM clientes;`,
        hints: [
          'A forma é sempre `SELECT colunas FROM tabela`.',
          'A tabela é `clientes`; as colunas, `id`, `nome` e `cidade`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-1-asterisco',
        type: 'multiple-choice',
        prompt:
          'Por que a aula recomenda listar as colunas em vez de escrever `SELECT *` em código de verdade?',
        concepts: ['sql-tabelas'],
        difficulty: 'iniciante',
        tags: ['sql', 'select'],
        options: [
          'Porque `SELECT *` só funciona em tabelas pequenas',
          'Porque quem lê a consulta sabe o que ela devolve, e uma coluna nova na tabela não muda o resultado de repente',
          'Porque o asterisco é mais lento de digitar',
          'Porque `SELECT *` devolve as linhas em ordem aleatória',
        ],
        correctIndex: 1,
        explanation:
          '`SELECT *` é ótimo para espiar. Num programa, ele acopla o código à forma atual da tabela: alguém acrescenta uma coluna de 2 MB e toda tela que fazia `SELECT *` passa a trazê-la. Listar as colunas é dizer exatamente o que se precisa.',
        hints: ['A resposta está no parágrafo sobre o asterisco.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-1-espiar',
        type: 'sql',
        database: 'loja',
        prompt:
          'Espie a tabela `pedidos`: devolva **todas as colunas** dos **3 primeiros** pedidos.',
        concepts: ['sql-tabelas'],
        difficulty: 'iniciante',
        tags: ['sql', 'select', 'limit'],
        initialCode: `-- Todas as colunas, três linhas.
`,
        tests: [{ description: 'Devolve as 4 colunas de pedidos, e só os 3 primeiros' }],
        solution: `SELECT * FROM pedidos LIMIT 3;`,
        hints: [
          'Todas as colunas é `*`; a quantidade de linhas é o `LIMIT`.',
          '`SELECT * FROM pedidos LIMIT 3`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-1-itens',
        type: 'sql',
        database: 'loja',
        prompt:
          'Olhe a tabela `itens` no painel. Escreva a consulta que devolve, para cada item vendido, **em qual pedido** ele está, **qual produto** é e **quantas unidades** — nessa ordem. Use os nomes das colunas como estão na tabela.',
        concepts: ['sql-tabelas'],
        difficulty: 'intermediario',
        tags: ['sql', 'select', 'esquema'],
        initialCode: `
`,
        tests: [{ description: 'Devolve pedido_id, produto_id e quantidade dos 25 itens' }],
        solution: `SELECT pedido_id, produto_id, quantidade
FROM itens;`,
        hints: [
          'As três perguntas do enunciado são três colunas de `itens`. Abra a tabela no painel para ver os nomes exatos.',
          '"Em qual pedido" é `pedido_id`; "qual produto" é `produto_id`; "quantas unidades" é `quantidade`.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
- Um banco relacional é um conjunto de **tabelas**; cada tabela tem **colunas** com tipo e **linhas** com dados; a **chave primária** (\`id\`) identifica a linha.
- \`SELECT colunas FROM tabela\` devolve uma tabela nova, com as colunas na ordem em que você as listou.
- \`*\` traz todas as colunas — bom para espiar, ruim em código que outros leem.
- \`LIMIT n\` corta o resultado em *n* linhas; sem \`ORDER BY\`, a ordem não é garantida.
- A correção compara **as linhas devolvidas**, não o texto do SQL.
`.trim(),
    },
  ],
};

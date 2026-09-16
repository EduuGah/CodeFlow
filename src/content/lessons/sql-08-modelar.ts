import type { Lesson } from '../types';

export const lessonModelar: Lesson = {
  id: 'lesson-sql-8',
  trackId: 'track-sql',
  title: 'CREATE TABLE: Desenhar as Tabelas',
  language: 'sql',
  objective:
    'Criar tabelas com os tipos certos e as regras que o banco impõe sozinho — chave primária, NOT NULL, UNIQUE, DEFAULT, CHECK e a chave estrangeira com o que acontece ao apagar.',
  concepts: ['sql-modelar'],
  status: 'published',
  estimatedMinutes: 35,
  blocks: [
    {
      kind: 'prose',
      markdown: `
As quatro tabelas da loja não caíram do céu. Alguém decidiu que \`preco\` é número, que \`nome\` não pode ficar vazio, que \`pedidos.cliente_id\` aponta para \`clientes.id\`. Esta aula é sobre tomar essas decisões — e sobre o fato de que **o banco as impõe**, para todo programa que o use, para sempre.

## CREATE TABLE

~~~sql
CREATE TABLE avaliacoes (
  id INTEGER PRIMARY KEY,
  produto_id INTEGER NOT NULL REFERENCES produtos(id),
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT
);
~~~

Cada linha entre parênteses é uma coluna: **nome**, **tipo**, e as **restrições**. Os tipos do SQLite são poucos: \`INTEGER\` (inteiro), \`REAL\` (com casas decimais), \`TEXT\` (texto) e \`BLOB\` (bytes). Datas são \`TEXT\` no formato \`AAAA-MM-DD\`; valores em dinheiro, quando a precisão importa, costumam ser \`INTEGER\` em centavos — \`REAL\` não representa 0.1 exatamente, o mesmo problema do JavaScript.

## As restrições

- **\`PRIMARY KEY\`** — a chave primária: única, não nula, o endereço da linha. \`INTEGER PRIMARY KEY\` ganha de brinde o número automático no \`INSERT\`.
- **\`NOT NULL\`** — a coluna precisa de valor. Sem isto, qualquer coluna aceita \`NULL\`, e um \`INSERT\` que esqueça o nome passa. Regra prática: tudo é \`NOT NULL\`, exceto o que é **de fato** opcional — como o \`email\` de \`clientes\`.
- **\`UNIQUE\`** — não se repete. Um e-mail de login, um CPF, o nome de uma categoria.
- **\`DEFAULT valor\`** — o que entra quando o \`INSERT\` não diz: \`estoque INTEGER NOT NULL DEFAULT 0\`, \`status TEXT NOT NULL DEFAULT 'pendente'\`.
- **\`CHECK (condição)\`** — uma regra sobre o valor. \`CHECK (nota BETWEEN 1 AND 5)\`, \`CHECK (preco >= 0)\`. O banco recusa a linha que não passa.
- **\`REFERENCES tabela(coluna)\`** — a chave estrangeira. O valor precisa existir lá: um \`produto_id\` 999 é recusado com \`FOREIGN KEY constraint failed\`.

O que estas linhas compram é caro de conseguir de outro jeito: **não importa quantos programas escrevam nesta tabela**, nem quem os escreveu, nenhum consegue guardar uma nota 6 ou uma avaliação de um produto que não existe. A validação no código de um aplicativo vale para aquele aplicativo; a do banco vale para todos.

## Apagar quem é apontado

A chave estrangeira também decide o que acontece quando a linha **apontada** some. O padrão você já viu: o banco recusa apagar um cliente que tem pedidos. Dá para pedir outro comportamento na própria declaração:

~~~sql
cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE
~~~

\`ON DELETE CASCADE\`: apagar o cliente apaga junto os endereços dele. Faz sentido para o que **só existe por causa** da linha apontada — endereços de um cliente, itens de um pedido. Não faz sentido para pedidos de um cliente: um pedido é um fato contábil, e apagar um cliente não pode apagar vendas. Aí o padrão (\`RESTRICT\`: recusar) é o certo, e existe ainda \`ON DELETE SET NULL\`, que desliga a referência sem apagar a linha.

A pergunta a fazer para cada chave estrangeira: *se o pai sumir, o filho deve sumir, ficar sem pai, ou impedir?*

## Mudar uma tabela que existe

\`ALTER TABLE\` acrescenta uma coluna a uma tabela com dados:

~~~sql
ALTER TABLE pedidos ADD COLUMN observacao TEXT NOT NULL DEFAULT '';
~~~

As linhas que já existem recebem o \`DEFAULT\` — por isso uma coluna nova \`NOT NULL\` precisa de um. O SQLite é limitado no \`ALTER TABLE\` (não muda o tipo de uma coluna, por exemplo); nos outros bancos há mais. \`DROP TABLE nome\` apaga a tabela inteira, com os dados. Sem "desfazer".
`.trim(),
    },
    {
      kind: 'example',
      language: 'sql',
      code: `-- Uma tabela nova, e a prova de que as regras valem.
CREATE TABLE cupons (
  id INTEGER PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  desconto INTEGER NOT NULL CHECK (desconto BETWEEN 1 AND 90),
  ativo INTEGER NOT NULL DEFAULT 1
);

INSERT INTO cupons (codigo, desconto) VALUES ('BEMVINDO', 10);
SELECT * FROM cupons;`,
      caption:
        'O INSERT não informou `ativo`, e a linha saiu com 1. Tente acrescentar `INSERT INTO cupons (codigo, desconto) VALUES (\'BEMVINDO\', 5)` — a segunda linha é recusada pelo UNIQUE, e `desconto = 95` pelo CHECK.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-8-onde-validar',
        type: 'multiple-choice',
        prompt:
          'Um aplicativo já confere que a nota está entre 1 e 5 antes de gravar. Por que ainda vale declarar `CHECK (nota BETWEEN 1 AND 5)` na tabela?',
        concepts: ['sql-modelar'],
        difficulty: 'iniciante',
        tags: ['sql', 'check', 'restricoes'],
        options: [
          'Porque o CHECK deixa a consulta mais rápida',
          'Porque a regra do banco vale para todo programa que escrever na tabela — o de hoje, o de amanhã, o script de alguém às pressas',
          'Porque sem o CHECK a coluna não aceita números',
          'Não vale: é a mesma verificação duas vezes',
        ],
        correctIndex: 1,
        explanation:
          'A validação no aplicativo protege aquele caminho. A do banco protege a tabela: outro sistema, uma importação, um comando manual — nada consegue guardar uma nota 6. Dados ruins são mais caros de corrigir do que de impedir.',
        hints: ['Quantos programas vão escrever nessa tabela ao longo dos anos?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-8-categorias',
        type: 'sql',
        database: 'loja',
        prompt:
          'Crie a tabela **`categorias`** com duas colunas: **`id`** (chave primária inteira) e **`nome`** (texto, **obrigatório** e **sem repetição**).',
        concepts: ['sql-modelar'],
        difficulty: 'iniciante',
        tags: ['sql', 'create-table', 'unique'],
        initialCode: `CREATE TABLE categorias (

);`,
        tests: [
          {
            description: 'Aceita inserir uma categoria e devolve o id automático',
            query: "INSERT INTO categorias (nome) VALUES ('livros'); SELECT id, nome FROM categorias",
          },
          {
            description: 'Recusa duas categorias com o mesmo nome',
            query: "INSERT INTO categorias (nome) VALUES ('casa'), ('casa')",
          },
          { description: 'Recusa uma categoria sem nome', query: 'INSERT INTO categorias (nome) VALUES (NULL)' },
        ],
        solution: `CREATE TABLE categorias (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE
);`,
        hints: [
          'Duas linhas entre os parênteses: `id INTEGER PRIMARY KEY` e a de `nome`, com tipo e duas restrições.',
          '`nome TEXT NOT NULL UNIQUE`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-8-avaliacoes',
        type: 'sql',
        database: 'loja',
        prompt:
          'Crie a tabela **`avaliacoes`**: `id` (chave primária), `produto_id` e `cliente_id` (inteiros obrigatórios, **chaves estrangeiras** para `produtos` e `clientes`), `nota` (inteiro obrigatório, **entre 1 e 5**) e `comentario` (texto, opcional).',
        concepts: ['sql-modelar'],
        difficulty: 'intermediario',
        tags: ['sql', 'create-table', 'check', 'chave-estrangeira'],
        initialCode: `CREATE TABLE avaliacoes (
  id INTEGER PRIMARY KEY,
  produto_id INTEGER NOT NULL,
  cliente_id INTEGER NOT NULL,
  nota INTEGER NOT NULL,
  comentario TEXT
);`,
        tests: [
          {
            description: 'Aceita uma avaliação válida, com e sem comentário',
            query:
              "INSERT INTO avaliacoes (produto_id, cliente_id, nota, comentario) VALUES (1, 1, 5, 'ótimo'), (2, 3, 3, NULL); SELECT produto_id, cliente_id, nota, comentario FROM avaliacoes",
          },
          { description: 'Recusa nota 6', query: 'INSERT INTO avaliacoes (produto_id, cliente_id, nota) VALUES (1, 1, 6)' },
          { description: 'Recusa nota 0', query: 'INSERT INTO avaliacoes (produto_id, cliente_id, nota) VALUES (1, 1, 0)' },
          {
            description: 'Recusa um produto que não existe',
            query: 'INSERT INTO avaliacoes (produto_id, cliente_id, nota) VALUES (999, 1, 4)',
          },
          {
            description: 'Recusa um cliente que não existe',
            query: 'INSERT INTO avaliacoes (produto_id, cliente_id, nota) VALUES (1, 999, 4)',
          },
        ],
        solution: `CREATE TABLE avaliacoes (
  id INTEGER PRIMARY KEY,
  produto_id INTEGER NOT NULL REFERENCES produtos(id),
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT
);`,
        hints: [
          'A tabela como está aceita tudo: rode e veja quais verificações reclamam. Faltam as chaves estrangeiras e o CHECK.',
          '`REFERENCES produtos(id)` depois do NOT NULL, e `CHECK (nota BETWEEN 1 AND 5)` na coluna nota.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-8-cascade',
        type: 'multiple-choice',
        prompt:
          'Em qual destas chaves estrangeiras `ON DELETE CASCADE` é a escolha certa?',
        concepts: ['sql-modelar'],
        difficulty: 'intermediario',
        tags: ['sql', 'chave-estrangeira', 'cascade'],
        options: [
          '`pedidos.cliente_id → clientes`: apagar o cliente apaga os pedidos dele',
          '`itens.pedido_id → pedidos`: apagar o pedido apaga os itens dele',
          '`itens.produto_id → produtos`: apagar o produto apaga os itens que o venderam',
          'Em todas: CASCADE evita o erro de chave estrangeira',
        ],
        correctIndex: 1,
        explanation:
          'Um item só existe como parte do pedido; sem o pedido, ele não significa nada — CASCADE. Pedidos e itens vendidos são fatos: apagar um cliente ou um produto não pode apagar vendas, e o padrão (recusar) é o certo. "Evitar o erro" apagando dados é o oposto do que a restrição existe para fazer.',
        hints: ['Qual filho não faz sentido nenhum sem o pai?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-8-observacao',
        type: 'sql',
        database: 'loja',
        prompt:
          'Acrescente à tabela **`pedidos`** uma coluna **`observacao`**: texto, **obrigatória**, com padrão **texto vazio** (`\'\'`). Os pedidos que já existem ficam com o padrão.',
        concepts: ['sql-modelar'],
        difficulty: 'intermediario',
        tags: ['sql', 'alter-table', 'default'],
        initialCode: `ALTER TABLE pedidos `,
        tests: [
          {
            description: 'Os 15 pedidos existentes têm observacao vazia',
            query: "SELECT COUNT(*) FROM pedidos WHERE observacao = ''",
          },
          {
            description: 'Um pedido novo sem observacao recebe o texto vazio',
            query:
              "INSERT INTO pedidos (cliente_id, data, status) VALUES (6, '2024-08-01', 'pendente'); SELECT observacao FROM pedidos WHERE cliente_id = 6",
          },
          {
            description: 'A coluna recusa NULL',
            query: "INSERT INTO pedidos (cliente_id, data, status, observacao) VALUES (6, '2024-08-01', 'pendente', NULL)",
          },
        ],
        solution: `ALTER TABLE pedidos ADD COLUMN observacao TEXT NOT NULL DEFAULT '';`,
        hints: [
          '`ADD COLUMN nome TIPO restrições`. Uma coluna nova obrigatória precisa de DEFAULT, senão as linhas antigas não têm o que receber.',
          "`ADD COLUMN observacao TEXT NOT NULL DEFAULT ''`.",
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-8-enderecos',
        type: 'sql',
        database: 'loja',
        prompt:
          'Crie a tabela **`enderecos`**: `id` (chave primária), `cliente_id` (inteiro obrigatório, chave estrangeira para `clientes`, e **apagar o cliente apaga os endereços dele**), `rua` (texto obrigatório) e `cidade` (texto obrigatório).',
        concepts: ['sql-modelar'],
        difficulty: 'avancado',
        tags: ['sql', 'create-table', 'cascade'],
        initialCode: `
`,
        tests: [
          {
            description: 'Aceita um endereço de um cliente que existe',
            query:
              "INSERT INTO enderecos (cliente_id, rua, cidade) VALUES (6, 'Rua das Flores, 10', 'São Paulo'); SELECT cliente_id, rua, cidade FROM enderecos",
          },
          {
            description: 'Recusa um endereço de cliente inexistente',
            query: "INSERT INTO enderecos (cliente_id, rua, cidade) VALUES (999, 'Rua X', 'Y')",
          },
          {
            description: 'Apagar o cliente 6 apaga o endereço dele junto',
            query:
              "INSERT INTO enderecos (cliente_id, rua, cidade) VALUES (6, 'Rua das Flores, 10', 'São Paulo'); DELETE FROM clientes WHERE id = 6; SELECT COUNT(*) FROM enderecos",
          },
        ],
        solution: `CREATE TABLE enderecos (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  rua TEXT NOT NULL,
  cidade TEXT NOT NULL
);`,
        hints: [
          'A chave estrangeira com o comportamento ao apagar: `REFERENCES clientes(id) ON DELETE CASCADE`.',
          'Fábio Nunes (6) é o único cliente sem pedidos — por isso ele pode ser apagado no teste.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
- \`CREATE TABLE nome (coluna TIPO restrições, …)\`. Tipos: \`INTEGER\`, \`REAL\`, \`TEXT\`, \`BLOB\`; datas como \`TEXT\` \`AAAA-MM-DD\`.
- \`PRIMARY KEY\`, \`NOT NULL\`, \`UNIQUE\`, \`DEFAULT\`, \`CHECK\`, \`REFERENCES\`: regras que o banco impõe a todo programa.
- Quase tudo é \`NOT NULL\`; o opcional é a exceção declarada.
- \`ON DELETE CASCADE\` só para o que não existe sem o pai; o padrão recusa apagar quem tem dependentes.
- \`ALTER TABLE … ADD COLUMN\` numa tabela com dados precisa de \`DEFAULT\` se a coluna for \`NOT NULL\`.
`.trim(),
    },
  ],
};

import type { Lesson } from '../types';

/** A planilha de vendas, como ela chega: tudo numa tabela só, com repetição. */
const PLANILHA = `
CREATE TABLE vendas_planilha (
  id INTEGER PRIMARY KEY,
  cliente_nome TEXT NOT NULL,
  cliente_email TEXT,
  produto_nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  preco REAL NOT NULL
);
INSERT INTO vendas_planilha (cliente_nome, cliente_email, produto_nome, categoria, quantidade, preco) VALUES
  ('Ana Souza', 'ana@exemplo.com', 'Caderno 96 folhas', 'papelaria', 2, 12.50),
  ('Ana Souza', 'ana@exemplo.com', 'Caneta esferográfica azul', 'papelaria', 10, 2.30),
  ('Bruno Lima', 'bruno@exemplo.com', 'Fone de ouvido', 'eletrônicos', 1, 89.00),
  ('Ana Souza', 'ana.souza@exemplo.com', 'Livro: Lógica de programação', 'livros', 1, 58.00),
  ('Carla Mendes', NULL, 'Livro: SQL para todos', 'livros', 1, 72.00),
  ('Bruno Lima', 'bruno@exemplo.com', 'Mouse sem fio', 'eletrônicos', 1, 65.00),
  ('Elisa Prado', 'elisa@exemplo.com', 'Mochila escolar', 'papelaria', 1, 129.90),
  ('Elisa Prado', 'elisa@exemplo.com', 'Caneta esferográfica azul', 'papelaria', 20, 2.30),
  ('Carla Mendes', NULL, 'Livro: Lógica de programação', 'Livros', 1, 58.00);
`;

export const lessonNormalizacao: Lesson = {
  id: 'lesson-sql-9',
  trackId: 'track-sql',
  title: 'Normalização: Cada Fato num Lugar Só',
  language: 'sql',
  objective:
    'Reconhecer a repetição que estraga dados, separar uma planilha em tabelas ligadas por chaves, modelar um-para-muitos e muitos-para-muitos — e saber quando repetir de propósito.',
  concepts: ['sql-normalizacao'],
  status: 'published',
  estimatedMinutes: 35,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Quase todo banco começa como uma planilha. Uma linha por venda, com tudo que a venda tem: o nome do cliente, o e-mail, o produto, a categoria, a quantidade, o preço. Funciona no primeiro mês. Depois:

| cliente_nome | cliente_email | produto_nome | categoria |
| --- | --- | --- | --- |
| Ana Souza | ana@exemplo.com | Caderno 96 folhas | papelaria |
| Ana Souza | ana@exemplo.com | Caneta esferográfica azul | papelaria |
| Ana Souza | ana.souza@exemplo.com | Livro: Lógica de programação | livros |
| Carla Mendes | NULL | Livro: Lógica de programação | Livros |

Ana trocou de e-mail, e alguém atualizou uma linha e esqueceu as outras: agora ela tem dois. "Livros" com maiúscula numa linha e minúscula em outra: um \`GROUP BY categoria\` conta cinco categorias onde há quatro. E se a Carla devolver a compra e a linha for apagada, o banco esquece que o livro existe — o produto só vivia dentro das vendas.

São as três **anomalias** da repetição: de **atualização** (mudar um fato exige mudar N linhas), de **inserção** (não dá para cadastrar um produto sem uma venda) e de **remoção** (apagar uma venda apaga um produto). A causa é uma só: o mesmo fato — "o e-mail da Ana" — guardado em vários lugares.

## Cada fato num lugar só

**Normalizar** é reorganizar as tabelas para que cada fato exista uma vez. O e-mail da Ana fica em \`clientes\`, numa linha; as vendas dela apontam para essa linha pelo \`cliente_id\`. Mudou o e-mail, mudou em um lugar; apagou uma venda, o cliente continua; cadastrou um produto, ele existe sem venda nenhuma.

É exatamente o desenho da loja: \`clientes\`, \`produtos\`, \`pedidos\`, \`itens\`. A planilha de vendas virou quatro tabelas, e o \`JOIN\` da aula 4 é o que remonta a planilha na hora de ler.

A regra, dita de um jeito que se lembra: **toda coluna de uma tabela deve dizer algo sobre a chave da tabela — sobre a chave inteira, e sobre nada além da chave.** \`cliente_email\` não diz nada sobre *a venda*; diz sobre *o cliente*. Então não é coluna de vendas. As formas normais (1FN, 2FN, 3FN) são esta regra com mais precisão; se você guardar a frase, resolve a maioria dos casos.

Um corolário: **nada de listas numa célula**. \`tags = 'escolar,promoção'\` num produto é uma coluna com dois fatos. Procurar "todos os produtos com a tag escolar" vira \`LIKE '%escolar%'\`, que também acha "pré-escolar" e não usa índice. Uma lista é uma tabela.

## Um-para-muitos e muitos-para-muitos

Um cliente tem muitos pedidos; um pedido tem um cliente. **Um-para-muitos**: a chave estrangeira fica do lado do "muitos" (\`pedidos.cliente_id\`). Nunca uma lista de pedidos dentro do cliente.

Um produto tem muitas tags; uma tag está em muitos produtos. **Muitos-para-muitos**: nenhum dos dois lados consegue guardar a chave do outro sem virar lista. A solução é uma terceira tabela, a **tabela de ligação**, com uma linha por par:

~~~sql
CREATE TABLE produto_tags (
  produto_id INTEGER NOT NULL REFERENCES produtos(id),
  tag_id INTEGER NOT NULL REFERENCES tags(id),
  PRIMARY KEY (produto_id, tag_id)
);
~~~

A chave primária **composta** — as duas colunas juntas — impede o mesmo par duas vezes. Foi assim que \`itens\` nasceu: pedidos e produtos são muitos-para-muitos, e \`itens\` é a ligação, com dados próprios (quantidade, preço).

## Repetir de propósito

\`itens.preco_unitario\` repete o preço que está em \`produtos.preco\`. Não é descuido: é **um fato diferente**. \`produtos.preco\` é o preço de hoje; \`preco_unitario\` é o preço **na hora da compra**. O teclado custava 329 no pedido 9 e custa 349 agora; se o item apontasse para o preço atual, a fatura do Diego mudaria sozinha. Quando a mesma coluna guarda fatos diferentes no tempo, copiar é o certo.

A normalização é a regra; a cópia é a exceção que precisa de um motivo escrito no nome da coluna ou num comentário.
`.trim(),
    },
    {
      kind: 'example',
      language: 'sql',
      code: `-- A categoria dos produtos é texto repetido em doze linhas. Virando tabela:
CREATE TABLE categorias (id INTEGER PRIMARY KEY, nome TEXT NOT NULL UNIQUE);
INSERT INTO categorias (nome) SELECT DISTINCT categoria FROM produtos;

-- A coluna que aponta, preenchida a partir do texto antigo:
ALTER TABLE produtos ADD COLUMN categoria_id INTEGER REFERENCES categorias(id);
UPDATE produtos
SET categoria_id = (SELECT id FROM categorias c WHERE c.nome = produtos.categoria);

SELECT p.nome, c.nome AS categoria
FROM produtos p JOIN categorias c ON c.id = p.categoria_id;`,
      caption:
        'Uma migração em quatro comandos: criar a tabela, popular com os valores distintos, criar a chave estrangeira, preencher com uma subconsulta correlacionada. O passo final — apagar a coluna de texto — fica para quando todo código já usar a nova.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-9-anomalia',
        type: 'multiple-choice',
        prompt:
          'Na planilha de vendas, o e-mail do cliente está repetido em cada venda dele. Qual destes problemas isso causa?',
        concepts: ['sql-normalizacao'],
        difficulty: 'iniciante',
        tags: ['sql', 'normalizacao', 'anomalia'],
        options: [
          'A tabela fica mais lenta para ler, porque o texto é longo',
          'Mudar o e-mail de um cliente exige mudar todas as vendas dele — e esquecer uma deixa dois e-mails para a mesma pessoa',
          'O banco recusa e-mails repetidos',
          'Nenhum: repetir é o jeito normal de guardar dados',
        ],
        correctIndex: 1,
        explanation:
          'É a anomalia de atualização: um fato em N lugares só continua verdadeiro se todos os N forem atualizados juntos. Com o e-mail em `clientes`, uma linha, a atualização é uma só. O tamanho da tabela é o menor dos problemas.',
        hints: ['O que acontece quando a Ana troca de e-mail?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-9-emails-inconsistentes',
        type: 'sql',
        database: 'loja',
        setup: PLANILHA,
        prompt:
          'A tabela **`vendas_planilha`** — a planilha da aula, que este exercício acrescenta ao banco (abra "Este exercício acrescenta ao banco…" para ver as colunas) — já tem dados inconsistentes. Encontre os **clientes que aparecem com mais de um e-mail diferente**: devolva `cliente_nome` e a quantidade de e-mails distintos, numa coluna **`emails`**.',
        concepts: ['sql-normalizacao'],
        difficulty: 'intermediario',
        tags: ['sql', 'normalizacao', 'group-by'],
        initialCode: `SELECT cliente_nome, COUNT(DISTINCT cliente_email) AS emails
FROM vendas_planilha
GROUP BY cliente_nome;`,
        tests: [{ description: 'Devolve só Ana Souza, com 2 e-mails', columns: true }],
        solution: `SELECT cliente_nome, COUNT(DISTINCT cliente_email) AS emails
FROM vendas_planilha
GROUP BY cliente_nome
HAVING COUNT(DISTINCT cliente_email) > 1;`,
        hints: [
          'A consulta como está conta os e-mails de todo mundo. Falta ficar só com os grupos em que a contagem passa de 1.',
          'Filtro de grupo é `HAVING COUNT(DISTINCT cliente_email) > 1`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-9-passos',
        type: 'order-steps',
        prompt:
          'Coloque em ordem os passos para tirar a categoria de dentro de `produtos` e transformá-la numa tabela própria, sem perder nenhum dado.',
        concepts: ['sql-normalizacao'],
        difficulty: 'intermediario',
        tags: ['sql', 'normalizacao', 'migracao'],
        steps: [
          { id: 'criar', text: 'Criar a tabela `categorias` com `id` e `nome` único', ordem: 0 },
          { id: 'popular', text: 'Inserir em `categorias` os valores distintos de `produtos.categoria`', ordem: 1 },
          { id: 'coluna', text: 'Acrescentar a coluna `categoria_id` em `produtos`, apontando para `categorias`', ordem: 2 },
          { id: 'preencher', text: 'Preencher `categoria_id` de cada produto a partir do texto da categoria', ordem: 3 },
          { id: 'apagar', text: 'Apagar a coluna de texto `categoria`, quando nada mais a usar', ordem: 4 },
        ],
        explanation:
          'A tabela nova precisa existir e estar cheia antes de a chave estrangeira apontar para ela; a coluna nova precisa existir antes de ser preenchida; e a coluna antiga só sai quando todo código já lê a nova — apagá-la antes quebra o que ainda depende dela.',
        hints: ['Você não pode apontar para o que não existe, nem preencher uma coluna que ainda não foi criada.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-9-categorias',
        type: 'sql',
        database: 'loja',
        prompt:
          'Faça os dois primeiros passos da migração: crie a tabela **`categorias`** (`id` chave primária, `nome` texto obrigatório e único) e **popule-a** com as categorias distintas que existem em `produtos`.',
        concepts: ['sql-normalizacao'],
        difficulty: 'intermediario',
        tags: ['sql', 'normalizacao', 'insert-select'],
        initialCode: `CREATE TABLE categorias (

);
`,
        tests: [
          {
            description: 'categorias tem as 4 categorias dos produtos, uma vez cada',
            query: 'SELECT nome FROM categorias ORDER BY nome',
          },
          { description: 'Recusa uma categoria repetida', query: "INSERT INTO categorias (nome) VALUES ('livros')" },
        ],
        solution: `CREATE TABLE categorias (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE
);
INSERT INTO categorias (nome) SELECT DISTINCT categoria FROM produtos;`,
        hints: [
          'O INSERT pode receber um SELECT no lugar do VALUES: `INSERT INTO categorias (nome) SELECT …`.',
          '`SELECT DISTINCT categoria FROM produtos` são os quatro nomes.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-9-muitos-para-muitos',
        type: 'sql',
        database: 'loja',
        setup: `CREATE TABLE tags (id INTEGER PRIMARY KEY, nome TEXT NOT NULL UNIQUE);
INSERT INTO tags (id, nome) VALUES (1, 'escolar'), (2, 'promoção'), (3, 'presente');`,
        prompt:
          'Já existe a tabela **`tags`** (1 escolar, 2 promoção, 3 presente). Crie a tabela de ligação **`produto_tags`** (`produto_id` → `produtos`, `tag_id` → `tags`, ambos obrigatórios, e **o par não pode se repetir**) e registre: o caderno (1) e a mochila (4) são **escolar**; a mochila (4) e o fone (5) estão em **promoção**.',
        concepts: ['sql-normalizacao'],
        difficulty: 'avancado',
        tags: ['sql', 'normalizacao', 'muitos-para-muitos'],
        initialCode: `CREATE TABLE produto_tags (

);
`,
        tests: [
          {
            description: 'Cada produto aparece com as suas tags',
            query:
              'SELECT p.nome, t.nome FROM produto_tags pt JOIN produtos p ON p.id = pt.produto_id JOIN tags t ON t.id = pt.tag_id ORDER BY p.id, t.id',
          },
          { description: 'Recusa o mesmo par duas vezes', query: 'INSERT INTO produto_tags (produto_id, tag_id) VALUES (1, 1)' },
          { description: 'Recusa uma tag que não existe', query: 'INSERT INTO produto_tags (produto_id, tag_id) VALUES (1, 99)' },
        ],
        solution: `CREATE TABLE produto_tags (
  produto_id INTEGER NOT NULL REFERENCES produtos(id),
  tag_id INTEGER NOT NULL REFERENCES tags(id),
  PRIMARY KEY (produto_id, tag_id)
);
INSERT INTO produto_tags (produto_id, tag_id) VALUES (1, 1), (4, 1), (4, 2), (5, 2);`,
        hints: [
          'Duas chaves estrangeiras e uma chave primária composta: `PRIMARY KEY (produto_id, tag_id)` numa linha própria, depois das colunas.',
          'São quatro pares: (1, 1), (4, 1), (4, 2), (5, 2).',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-9-preco-unitario',
        type: 'multiple-choice',
        prompt:
          '`itens.preco_unitario` repete um valor que já existe em `produtos.preco`. Por que a loja mantém a cópia?',
        concepts: ['sql-normalizacao'],
        difficulty: 'intermediario',
        tags: ['sql', 'normalizacao', 'desnormalizacao'],
        options: [
          'Por descuido: a coluna deveria ser removida e o preço lido pelo JOIN',
          'Porque são fatos diferentes: o preço de hoje e o preço na hora da compra — e a fatura de um pedido antigo não pode mudar quando o catálogo muda',
          'Porque o JOIN com `produtos` seria lento demais',
          'Porque `REAL` não pode ser chave estrangeira',
        ],
        correctIndex: 1,
        explanation:
          'Normalizar é ter cada *fato* uma vez. "Quanto custa o teclado" e "quanto o Diego pagou pelo teclado" são dois fatos, que coincidem no dia da compra e divergem depois. A cópia é deliberada — e o nome `preco_unitario`, diferente de `preco`, é o que avisa.',
        hints: ['O teclado custava 329 no pedido 9 e custa 349 hoje. Qual dos dois a fatura do pedido 9 deve mostrar?'],
      },
    },
    {
      kind: 'summary',
      markdown: `
- Um fato guardado em N lugares causa as três anomalias: atualizar, inserir, remover. **Normalizar** é guardá-lo uma vez e apontar para ele.
- Toda coluna diz algo sobre a chave da tabela — a chave inteira, e nada além da chave. Nada de listas numa célula.
- Um-para-muitos: a chave estrangeira fica no lado "muitos". Muitos-para-muitos: uma tabela de ligação com chave primária composta.
- Migrar: criar a tabela, popular com \`INSERT … SELECT DISTINCT\`, criar a chave estrangeira, preencher, e só então apagar a coluna antiga.
- Repetir de propósito só quando são fatos diferentes no tempo (\`preco_unitario\`), com o nome dizendo isso.
`.trim(),
    },
  ],
};

import type { Lesson } from '../types';

export const lessonEscrita: Lesson = {
  id: 'lesson-sql-7',
  trackId: 'track-sql',
  title: 'INSERT, UPDATE, DELETE: Mudar os Dados',
  language: 'sql',
  objective:
    'Inserir, alterar e apagar linhas — com o WHERE que decide o alcance, a chave estrangeira que impõe a ordem, e a transação que faz várias mudanças virarem uma.',
  concepts: ['sql-escrita'],
  status: 'published',
  estimatedMinutes: 35,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Seis aulas lendo. Agora os três comandos que **mudam** o banco — e que, por isso, merecem mais cuidado do que qualquer \`SELECT\`: um \`SELECT\` errado devolve linhas erradas; um \`UPDATE\` errado estraga as certas.

## INSERT

~~~sql
INSERT INTO produtos (nome, categoria, preco, estoque)
VALUES ('Régua 30 cm', 'papelaria', 4.50, 80);
~~~

Lista as colunas, depois os valores **na mesma ordem**. As colunas que ficaram de fora recebem o padrão: \`id\` é a chave primária inteira, e o SQLite escolhe o próximo número sozinho (13, aqui) — por isso ela quase nunca é informada. Uma coluna \`NOT NULL\` sem padrão precisa estar na lista, senão o banco recusa com \`NOT NULL constraint failed\`.

Várias linhas de uma vez: \`VALUES (…), (…), (…)\`. O painel de resultado mostra \`INSERT — 3 linhas\`.

## UPDATE

~~~sql
UPDATE produtos
SET preco = ROUND(preco * 1.1, 2)
WHERE categoria = 'eletrônicos';
~~~

\`SET\` diz o que muda; a expressão pode usar o valor atual (\`preco * 1.1\`). Várias colunas separam-se por vírgula: \`SET preco = 10, estoque = 0\`. E o \`WHERE\` diz **em quais linhas**.

Agora o aviso mais importante da trilha: **\`UPDATE\` sem \`WHERE\` muda todas as linhas**. \`UPDATE produtos SET preco = 10\` deixa os doze produtos a dez reais, e o banco faz exatamente isso, sem perguntar. Não há "desfazer". A prática de quem trabalha com banco é escrever o \`WHERE\` **antes** do \`SET\` — ou rodar primeiro um \`SELECT\` com o mesmo \`WHERE\`, conferir as linhas, e só então trocar por \`UPDATE\`.

## DELETE

~~~sql
DELETE FROM itens WHERE pedido_id = 4;
DELETE FROM pedidos WHERE id = 4;
~~~

A mesma regra: **sem \`WHERE\`, apaga a tabela inteira** (as linhas; a tabela continua existindo, vazia).

E uma regra nova, que vem da chave estrangeira. O pedido 4 tem itens apontando para ele. Apagar o pedido primeiro deixaria itens órfãos — \`pedido_id = 4\` sem pedido 4 —, e o banco recusa: \`FOREIGN KEY constraint failed\`. A ordem é apagar **quem aponta** antes de **quem é apontado**: os itens, depois o pedido. (Inserir é o contrário: o pedido antes dos itens dele.) Bancos permitem declarar \`ON DELETE CASCADE\` na chave estrangeira para apagar os dependentes sozinhos; é conveniente e perigoso, e a próxima aula fala disso.

## Transação: tudo ou nada

Registrar um pedido são dois comandos: a linha em \`pedidos\` e as linhas em \`itens\`. Se o segundo falhar — a rede caiu, um \`produto_id\` errado — sobra um pedido sem itens. Uma **transação** amarra os dois:

~~~sql
BEGIN;
INSERT INTO pedidos (id, cliente_id, data, status) VALUES (16, 6, '2024-08-01', 'pendente');
INSERT INTO itens (pedido_id, produto_id, quantidade, preco_unitario) VALUES (16, 2, 2, 2.30);
COMMIT;
~~~

Entre \`BEGIN\` e \`COMMIT\`, nada é definitivo. Se algo der errado no meio, \`ROLLBACK\` desfaz tudo que a transação fez, e o banco volta a como estava antes do \`BEGIN\`. É a garantia de que o banco nunca fica num estado pela metade — e é o que um sistema de pagamentos usa para "tirar daqui e pôr ali" ser uma operação só.

Nos exercícios aqui, cada execução já começa do banco original, então o \`ROLLBACK\` não tem o que desfazer. Na vida real, ele é a diferença entre um erro e um estrago.
`.trim(),
    },
    {
      kind: 'example',
      language: 'sql',
      code: `-- Baixa de estoque: o pedido 15 levou 4 cadernos e 2 livros de lógica.
UPDATE produtos SET estoque = estoque - 4 WHERE id = 1;
UPDATE produtos SET estoque = estoque - 2 WHERE id = 9;

-- Conferir: o mesmo WHERE, num SELECT.
SELECT id, nome, estoque FROM produtos WHERE id IN (1, 9);`,
      caption:
        'O SELECT no fim é o hábito: depois de escrever, ler o que ficou. O painel mostra "UPDATE — 1 linha" duas vezes e a tabela com os estoques novos.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-7-sem-where',
        type: 'multiple-choice',
        prompt: 'O que `UPDATE pedidos SET status = \'entregue\'` faz, exatamente como está escrito?',
        concepts: ['sql-escrita'],
        difficulty: 'iniciante',
        tags: ['sql', 'update', 'where'],
        options: [
          'Marca como entregue o pedido mais recente',
          'Marca como entregue todos os 15 pedidos, inclusive o cancelado — sem perguntar',
          'Dá erro, porque falta o WHERE',
          'Não faz nada, porque nenhum pedido foi indicado',
        ],
        correctIndex: 1,
        explanation:
          'Sem WHERE, o UPDATE alcança todas as linhas. O banco não pede confirmação e não tem "desfazer" fora de uma transação. Escreva o WHERE primeiro — ou rode o SELECT com o mesmo WHERE antes.',
        hints: ['O WHERE diz em quais linhas. Sem ele, em quais?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-7-inserir',
        type: 'sql',
        database: 'loja',
        prompt:
          'Cadastre um produto novo: **"Régua 30 cm"**, categoria **papelaria**, preço **4.50**, estoque **80**. Deixe o `id` por conta do banco.',
        concepts: ['sql-escrita'],
        difficulty: 'iniciante',
        tags: ['sql', 'insert'],
        initialCode: `INSERT INTO produtos (nome, categoria, preco, estoque)
VALUES (`,
        tests: [
          {
            description: 'A régua está em produtos, com categoria, preço e estoque certos',
            query: "SELECT nome, categoria, preco, estoque FROM produtos WHERE nome = 'Régua 30 cm'",
          },
          { description: 'Os 12 produtos de antes continuam lá, e há 13 agora', query: 'SELECT COUNT(*) FROM produtos' },
        ],
        solution: `INSERT INTO produtos (nome, categoria, preco, estoque)
VALUES ('Régua 30 cm', 'papelaria', 4.50, 80);`,
        hints: [
          'Um valor por coluna, na ordem da lista: texto entre aspas simples, números sem.',
          "`VALUES ('Régua 30 cm', 'papelaria', 4.50, 80)`.",
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-7-status',
        type: 'sql',
        database: 'loja',
        prompt:
          'O pedido **12** acabou de sair para entrega. Mude o status dele — e **só** dele — para **`enviado`**.',
        concepts: ['sql-escrita'],
        difficulty: 'iniciante',
        tags: ['sql', 'update', 'where'],
        initialCode: `UPDATE pedidos
SET status = 'enviado';`,
        tests: [
          { description: 'O pedido 12 está como enviado', query: 'SELECT status FROM pedidos WHERE id = 12' },
          {
            description: 'Os outros 14 pedidos continuam com o status que tinham',
            query: 'SELECT id, status FROM pedidos WHERE id <> 12 ORDER BY id',
          },
        ],
        solution: `UPDATE pedidos
SET status = 'enviado'
WHERE id = 12;`,
        hints: [
          'Rode como está e olhe a segunda verificação: o comando alcançou todos os pedidos.',
          'Falta o `WHERE id = 12`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-7-reajuste',
        type: 'sql',
        database: 'loja',
        prompt:
          'Reajuste os **eletrônicos** em **10%**: o preço novo é o atual vezes 1.1, arredondado a **2 casas**. Só essa categoria.',
        concepts: ['sql-escrita'],
        difficulty: 'intermediario',
        tags: ['sql', 'update', 'expressao'],
        initialCode: `
`,
        tests: [
          {
            description: 'Os 4 eletrônicos estão 10% mais caros, arredondados',
            query: "SELECT nome, preco FROM produtos WHERE categoria = 'eletrônicos' ORDER BY id",
          },
          {
            description: 'As outras categorias não mudaram',
            query: "SELECT nome, preco FROM produtos WHERE categoria <> 'eletrônicos' ORDER BY id",
          },
        ],
        solution: `UPDATE produtos
SET preco = ROUND(preco * 1.1, 2)
WHERE categoria = 'eletrônicos';`,
        hints: [
          'No SET, a expressão pode usar o valor atual da coluna: `preco * 1.1`.',
          '`SET preco = ROUND(preco * 1.1, 2) WHERE categoria = \'eletrônicos\'`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-7-apagar-pedido',
        type: 'sql',
        database: 'loja',
        prompt:
          'O pedido **4** foi cancelado e vai ser removido do banco. Apague-o — junto com os **itens** dele, na ordem que a chave estrangeira exige.',
        concepts: ['sql-escrita'],
        difficulty: 'intermediario',
        tags: ['sql', 'delete', 'chave-estrangeira'],
        initialCode: `DELETE FROM pedidos WHERE id = 4;`,
        tests: [
          { description: 'O pedido 4 não existe mais', query: 'SELECT COUNT(*) FROM pedidos WHERE id = 4' },
          { description: 'Nenhum item aponta para o pedido 4', query: 'SELECT COUNT(*) FROM itens WHERE pedido_id = 4' },
          {
            description: 'Os outros 14 pedidos e os 24 itens deles continuam lá',
            query: 'SELECT (SELECT COUNT(*) FROM pedidos) AS pedidos, (SELECT COUNT(*) FROM itens) AS itens',
          },
        ],
        solution: `DELETE FROM itens WHERE pedido_id = 4;
DELETE FROM pedidos WHERE id = 4;`,
        hints: [
          'Rode como está: o banco recusa, porque há itens apontando para o pedido. Quem aponta sai primeiro.',
          '`DELETE FROM itens WHERE pedido_id = 4;` e só depois o pedido.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-sql-7-pedido-novo',
        type: 'sql',
        database: 'loja',
        prompt:
          'Fábio Nunes (cliente **6**) fez o primeiro pedido dele. Registre, numa **transação**: o pedido **16**, em **2024-08-01**, status **pendente**, com um item de **2 unidades** do produto **2** (a caneta) a **2.30** cada.',
        concepts: ['sql-escrita'],
        difficulty: 'avancado',
        tags: ['sql', 'insert', 'transacao'],
        initialCode: `BEGIN;

COMMIT;`,
        tests: [
          {
            description: 'O pedido 16 existe, do cliente 6, na data e status pedidos',
            query: 'SELECT cliente_id, data, status FROM pedidos WHERE id = 16',
          },
          {
            description: 'O pedido 16 tem o item: produto 2, 2 unidades a 2.30',
            query: 'SELECT produto_id, quantidade, preco_unitario FROM itens WHERE pedido_id = 16',
          },
          {
            description: 'Nenhum cliente ficou sem pedido',
            query: 'SELECT c.nome FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id WHERE p.id IS NULL',
          },
        ],
        solution: `BEGIN;
INSERT INTO pedidos (id, cliente_id, data, status) VALUES (16, 6, '2024-08-01', 'pendente');
INSERT INTO itens (pedido_id, produto_id, quantidade, preco_unitario) VALUES (16, 2, 2, 2.30);
COMMIT;`,
        hints: [
          'Dois INSERTs entre o BEGIN e o COMMIT: o pedido primeiro (é ele que o item aponta), o item depois.',
          'O pedido precisa do `id` 16 explícito, para o item saber para onde apontar.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
- \`INSERT INTO tabela (colunas) VALUES (valores)\` — na mesma ordem; a chave primária inteira o banco preenche.
- \`UPDATE tabela SET coluna = expressão WHERE …\` — **sem \`WHERE\`, muda tudo.** Escreva o \`WHERE\` primeiro.
- \`DELETE FROM tabela WHERE …\` — sem \`WHERE\`, apaga tudo. Apague quem aponta antes de quem é apontado.
- \`BEGIN … COMMIT\` faz várias mudanças virarem uma; \`ROLLBACK\` desfaz o que a transação fez.
- Depois de escrever, leia: um \`SELECT\` com o mesmo \`WHERE\`.
`.trim(),
    },
  ],
};

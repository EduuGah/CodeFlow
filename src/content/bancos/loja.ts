import type { BancoDeExemplo } from './tipos';

/**
 * A loja: o banco de exemplo da trilha de SQL.
 *
 * Quatro tabelas ligadas do jeito que quase todo sistema real é ligado —
 * quem compra, o que se vende, o pedido e os itens dele. É pequeno o bastante
 * para o aluno conferir uma resposta olhando as linhas, e tem de propósito
 * as irregularidades que as aulas usam: um cliente sem pedido e um produto
 * nunca vendido (para o LEFT JOIN), e-mails em branco (para o `IS NULL`),
 * um pedido cancelado (para o WHERE que não é sobre número), preços que
 * mudaram entre a tabela de produtos e o item vendido (para a normalização).
 *
 * As datas são texto `AAAA-MM-DD`, que é como o SQLite as guarda e ordena.
 */
export const LOJA: BancoDeExemplo = {
  id: 'loja',
  title: 'Loja',
  description:
    'Uma loja pequena de papelaria e eletrônicos: clientes, produtos, pedidos e os itens de cada pedido.',
  sql: `
PRAGMA foreign_keys = ON;

CREATE TABLE clientes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  cadastro TEXT NOT NULL
);

CREATE TABLE produtos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  preco REAL NOT NULL,
  estoque INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE pedidos (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  data TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE itens (
  id INTEGER PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
  produto_id INTEGER NOT NULL REFERENCES produtos(id),
  quantidade INTEGER NOT NULL,
  preco_unitario REAL NOT NULL
);

INSERT INTO clientes (id, nome, email, cidade, estado, cadastro) VALUES
  (1, 'Ana Souza', 'ana@exemplo.com', 'Campinas', 'SP', '2024-01-15'),
  (2, 'Bruno Lima', 'bruno@exemplo.com', 'Rio de Janeiro', 'RJ', '2024-02-03'),
  (3, 'Carla Mendes', NULL, 'Belo Horizonte', 'MG', '2024-02-20'),
  (4, 'Diego Rocha', 'diego@exemplo.com', 'São Paulo', 'SP', '2024-03-08'),
  (5, 'Elisa Prado', 'elisa@exemplo.com', 'Curitiba', 'PR', '2024-03-30'),
  (6, 'Fábio Nunes', NULL, 'São Paulo', 'SP', '2024-04-12'),
  (7, 'Gabriela Reis', 'gabi@exemplo.com', 'Niterói', 'RJ', '2024-05-02'),
  (8, 'Heitor Alves', 'heitor@exemplo.com', 'Campinas', 'SP', '2024-05-19'),
  (9, 'Isabela Costa', 'isa@exemplo.com', 'Porto Alegre', 'RS', '2024-06-07'),
  (10, 'João Pedro Dias', 'jp@exemplo.com', 'Uberlândia', 'MG', '2024-06-25');

INSERT INTO produtos (id, nome, categoria, preco, estoque) VALUES
  (1, 'Caderno 96 folhas', 'papelaria', 12.50, 120),
  (2, 'Caneta esferográfica azul', 'papelaria', 2.30, 500),
  (3, 'Lápis 2B', 'papelaria', 1.80, 300),
  (4, 'Mochila escolar', 'papelaria', 129.90, 15),
  (5, 'Fone de ouvido', 'eletrônicos', 89.00, 40),
  (6, 'Mouse sem fio', 'eletrônicos', 65.00, 25),
  (7, 'Teclado mecânico', 'eletrônicos', 349.00, 8),
  (8, 'Carregador USB-C', 'eletrônicos', 45.00, 0),
  (9, 'Livro: Lógica de programação', 'livros', 58.00, 30),
  (10, 'Livro: SQL para todos', 'livros', 72.00, 12),
  (11, 'Luminária de mesa', 'casa', 98.00, 10),
  (12, 'Garrafa térmica', 'casa', 54.90, 20);

INSERT INTO pedidos (id, cliente_id, data, status) VALUES
  (1, 1, '2024-03-02', 'entregue'),
  (2, 2, '2024-03-05', 'entregue'),
  (3, 1, '2024-03-18', 'entregue'),
  (4, 4, '2024-04-01', 'cancelado'),
  (5, 5, '2024-04-10', 'entregue'),
  (6, 3, '2024-04-22', 'entregue'),
  (7, 2, '2024-05-06', 'entregue'),
  (8, 8, '2024-05-21', 'enviado'),
  (9, 4, '2024-06-02', 'entregue'),
  (10, 9, '2024-06-11', 'entregue'),
  (11, 1, '2024-06-15', 'enviado'),
  (12, 10, '2024-06-28', 'pendente'),
  (13, 5, '2024-07-03', 'entregue'),
  (14, 8, '2024-07-09', 'pendente'),
  (15, 7, '2024-07-14', 'entregue');

INSERT INTO itens (id, pedido_id, produto_id, quantidade, preco_unitario) VALUES
  (1, 1, 1, 2, 12.50),
  (2, 1, 2, 10, 2.30),
  (3, 2, 5, 1, 89.00),
  (4, 2, 3, 5, 1.80),
  (5, 3, 9, 1, 58.00),
  (6, 3, 1, 1, 12.50),
  (7, 4, 7, 1, 349.00),
  (8, 5, 4, 1, 129.90),
  (9, 5, 2, 20, 2.30),
  (10, 6, 10, 1, 72.00),
  (11, 6, 9, 1, 58.00),
  (12, 7, 6, 1, 65.00),
  (13, 7, 8, 2, 45.00),
  (14, 8, 11, 1, 98.00),
  (15, 9, 7, 1, 329.00),
  (16, 9, 6, 1, 65.00),
  (17, 10, 1, 3, 12.50),
  (18, 10, 3, 12, 1.80),
  (19, 11, 5, 2, 85.00),
  (20, 12, 10, 1, 72.00),
  (21, 13, 11, 1, 98.00),
  (22, 13, 2, 5, 2.30),
  (23, 14, 4, 1, 129.90),
  (24, 15, 9, 2, 58.00),
  (25, 15, 1, 4, 12.50);
`,
  tabelas: [
    {
      nome: 'clientes',
      descricao: 'Quem compra na loja. Nem todo cliente informou e-mail.',
      colunas: [
        { nome: 'id', tipo: 'INTEGER', descricao: 'chave primária' },
        { nome: 'nome', tipo: 'TEXT' },
        { nome: 'email', tipo: 'TEXT', descricao: 'pode ser NULL' },
        { nome: 'cidade', tipo: 'TEXT' },
        { nome: 'estado', tipo: 'TEXT', descricao: 'sigla: SP, RJ, MG…' },
        { nome: 'cadastro', tipo: 'TEXT', descricao: 'data AAAA-MM-DD' },
      ],
    },
    {
      nome: 'produtos',
      descricao: 'O catálogo. `estoque` zero é produto esgotado.',
      colunas: [
        { nome: 'id', tipo: 'INTEGER', descricao: 'chave primária' },
        { nome: 'nome', tipo: 'TEXT' },
        { nome: 'categoria', tipo: 'TEXT', descricao: 'papelaria, eletrônicos, livros, casa' },
        { nome: 'preco', tipo: 'REAL', descricao: 'preço atual, em reais' },
        { nome: 'estoque', tipo: 'INTEGER' },
      ],
    },
    {
      nome: 'pedidos',
      descricao: 'Cada compra. `cliente_id` aponta para `clientes.id`.',
      colunas: [
        { nome: 'id', tipo: 'INTEGER', descricao: 'chave primária' },
        { nome: 'cliente_id', tipo: 'INTEGER', descricao: 'chave estrangeira → clientes' },
        { nome: 'data', tipo: 'TEXT', descricao: 'data AAAA-MM-DD' },
        { nome: 'status', tipo: 'TEXT', descricao: 'pendente, enviado, entregue, cancelado' },
      ],
    },
    {
      nome: 'itens',
      descricao:
        'O que foi comprado em cada pedido. `preco_unitario` é o preço na hora da compra — pode diferir do preço atual do produto.',
      colunas: [
        { nome: 'id', tipo: 'INTEGER', descricao: 'chave primária' },
        { nome: 'pedido_id', tipo: 'INTEGER', descricao: 'chave estrangeira → pedidos' },
        { nome: 'produto_id', tipo: 'INTEGER', descricao: 'chave estrangeira → produtos' },
        { nome: 'quantidade', tipo: 'INTEGER' },
        { nome: 'preco_unitario', tipo: 'REAL' },
      ],
    },
  ],
};

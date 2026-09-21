import type { BancoDeExemplo } from './tipos';

/**
 * As tarefas: o banco do projeto final.
 *
 * É a lista de tarefas que o aluno já fez na trilha da página e na de React
 * — agora com conta. Três tabelas: quem usa, a sessão de quem entrou (o
 * token que a página manda em cada pedido) e as tarefas, cada uma com dono.
 * Pequeno de propósito: dá para conferir qualquer resposta olhando as
 * linhas. `feita` é 0 ou 1 porque o SQLite não tem booleano — e a API vai
 * ter que traduzir, o que é uma das lições do projeto.
 */
export const TAREFAS: BancoDeExemplo = {
  id: 'tarefas',
  title: 'Tarefas',
  description: 'A lista de tarefas com conta: usuários, as sessões de quem entrou, e as tarefas de cada um.',
  sql: `
PRAGMA foreign_keys = ON;

CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE sessoes (
  token TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id)
);

CREATE TABLE tarefas (
  id INTEGER PRIMARY KEY,
  titulo TEXT NOT NULL,
  feita INTEGER NOT NULL DEFAULT 0 CHECK (feita IN (0, 1)),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  criada_em TEXT NOT NULL
);

INSERT INTO usuarios (id, nome, email) VALUES
  (1, 'Ana', 'ana@exemplo.com'),
  (2, 'Bia', 'bia@exemplo.com');

INSERT INTO sessoes (token, usuario_id) VALUES
  ('token-da-ana', 1),
  ('token-da-bia', 2);

INSERT INTO tarefas (id, titulo, feita, usuario_id, criada_em) VALUES
  (1, 'Estudar Node', 0, 1, '2026-09-01'),
  (2, 'Fazer a API', 0, 1, '2026-09-02'),
  (3, 'Revisar SQL', 1, 1, '2026-09-03'),
  (4, 'Desenhar a página', 0, 2, '2026-09-04');
`,
  tabelas: [
    {
      nome: 'usuarios',
      descricao: 'Quem usa o aplicativo. O e-mail é único.',
      colunas: [
        { nome: 'id', tipo: 'INTEGER', descricao: 'chave primária' },
        { nome: 'nome', tipo: 'TEXT' },
        { nome: 'email', tipo: 'TEXT', descricao: 'único' },
      ],
    },
    {
      nome: 'sessoes',
      descricao: 'Quem entrou: o token que a página manda em cada pedido, e de quem ele é.',
      colunas: [
        { nome: 'token', tipo: 'TEXT', descricao: 'chave primária' },
        { nome: 'usuario_id', tipo: 'INTEGER', descricao: 'referência a usuarios' },
      ],
    },
    {
      nome: 'tarefas',
      descricao: 'As tarefas, cada uma de um usuário.',
      colunas: [
        { nome: 'id', tipo: 'INTEGER', descricao: 'chave primária' },
        { nome: 'titulo', tipo: 'TEXT' },
        { nome: 'feita', tipo: 'INTEGER', descricao: '0 ou 1 — o SQLite não tem booleano' },
        { nome: 'usuario_id', tipo: 'INTEGER', descricao: 'referência a usuarios' },
        { nome: 'criada_em', tipo: 'TEXT', descricao: 'data AAAA-MM-DD' },
      ],
    },
  ],
};

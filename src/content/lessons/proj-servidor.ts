import { TAREFAS } from '../bancos/tarefas';
import type { ServidorDaPagina } from '../types';

/**
 * Os arquivos do projeto final, prontos, para as aulas que os recebem:
 * o repositório (aula 2), os erros (trilha de Node), o login que lê a
 * sessão no banco (aula 3) e as rotas (aula 3). A aula 3 dá ao aluno os
 * três primeiros e cobra as rotas; as aulas 4 e 5 entregam a API inteira,
 * de pé atrás da página.
 */
export const REPOSITORIO = `// dados/tarefas.js — o único arquivo que sabe SQL (aula 2).
const banco = require('../banco');

async function listarDe(usuarioId) {
  return banco.consultar('SELECT * FROM tarefas WHERE usuario_id = ? ORDER BY id', [usuarioId]);
}

async function buscar(id) {
  const linhas = await banco.consultar('SELECT * FROM tarefas WHERE id = ?', [id]);
  return linhas[0] ?? null;
}

async function criar({ titulo, usuarioId }) {
  const { ultimoId } = await banco.executar(
    "INSERT INTO tarefas (titulo, usuario_id, criada_em) VALUES (?, ?, date('now'))",
    [titulo, usuarioId]
  );
  return buscar(ultimoId);
}

async function alterar(id, { titulo, feita }) {
  if (titulo !== undefined) await banco.executar('UPDATE tarefas SET titulo = ? WHERE id = ?', [titulo, id]);
  if (feita !== undefined) await banco.executar('UPDATE tarefas SET feita = ? WHERE id = ?', [feita ? 1 : 0, id]);
  return buscar(id);
}

async function remover(id) {
  const { linhas } = await banco.executar('DELETE FROM tarefas WHERE id = ?', [id]);
  return linhas > 0;
}

module.exports = { listarDe, buscar, criar, alterar, remover };
`;

export const ERROS = `class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

function tratarErros(erro, req, res, next) {
  const status = erro.status || 500;
  res.status(status).json({ erro: status === 500 ? 'Erro interno' : erro.message });
}

module.exports = { ErroHttp, tratarErros };
`;

export const AUTH = `// auth.js — o token vira pessoa pela tabela sessoes.
const banco = require('./banco');

async function exigirLogin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const linhas = await banco.consultar(
    'SELECT u.id, u.nome FROM sessoes s JOIN usuarios u ON u.id = s.usuario_id WHERE s.token = ?',
    [token]
  );
  if (linhas.length === 0) return res.status(401).json({ erro: 'Não autenticado' });
  req.usuario = linhas[0];
  next();
}

module.exports = { exigirLogin };
`;

/** O começo do servidor.js: o que toda rota usa. */
export const CABECALHO = `const express = require('express');
const repositorio = require('./dados/tarefas');
const { ErroHttp, tratarErros } = require('./erros');
const { exigirLogin } = require('./auth');

const app = express();
app.use(express.json());

// A API entrega feita como booleano; o banco guarda 0/1.
function paraApi(tarefa) {
  return { id: tarefa.id, titulo: tarefa.titulo, feita: tarefa.feita === 1, criadaEm: tarefa.criada_em };
}

async function tarefaDoUsuario(id, usuario) {
  const tarefa = await repositorio.buscar(Number(id));
  if (!tarefa) throw new ErroHttp(404, 'Tarefa não encontrada');
  if (tarefa.usuario_id !== usuario.id) throw new ErroHttp(403, 'Sem permissão');
  return tarefa;
}
`;

/** O fim do servidor.js: o tratamento de erros por último, e a porta. */
export const RODAPE = `
app.use(tratarErros);
app.listen(3000);
`;

/** As rotas da API, como a aula 3 as deixa. */
export const ROTAS = `app.get('/saude', (req, res) => res.json({ ok: true }));

app.get('/tarefas', exigirLogin, async (req, res) => {
  const tarefas = await repositorio.listarDe(req.usuario.id);
  res.json(tarefas.map(paraApi));
});

app.post('/tarefas', exigirLogin, async (req, res) => {
  const { titulo } = req.body;
  if (typeof titulo !== 'string' || titulo.trim() === '') throw new ErroHttp(400, 'titulo é obrigatório');
  const tarefa = await repositorio.criar({ titulo: titulo.trim(), usuarioId: req.usuario.id });
  res.status(201).json(paraApi(tarefa));
});

app.patch('/tarefas/:id', exigirLogin, async (req, res) => {
  const tarefa = await tarefaDoUsuario(req.params.id, req.usuario);
  const { titulo, feita } = req.body;
  if (feita !== undefined && typeof feita !== 'boolean') throw new ErroHttp(400, 'feita precisa ser true ou false');
  if (titulo !== undefined && (typeof titulo !== 'string' || titulo.trim() === '')) throw new ErroHttp(400, 'titulo é obrigatório');
  const alterada = await repositorio.alterar(tarefa.id, { titulo: titulo === undefined ? undefined : titulo.trim(), feita });
  res.json(paraApi(alterada));
});

app.delete('/tarefas/:id', exigirLogin, async (req, res) => {
  const tarefa = await tarefaDoUsuario(req.params.id, req.usuario);
  await repositorio.remover(tarefa.id);
  res.status(204).end();
});
`;

export const ARQUIVOS_DA_API = {
  './dados/tarefas.js': REPOSITORIO,
  './erros.js': ERROS,
  './auth.js': AUTH,
};

/** A API inteira, de pé atrás da página, nas aulas 4 e 5. */
export const API_DE_TAREFAS: ServidorDaPagina = {
  code: `${CABECALHO}\n${ROTAS}${RODAPE}`,
  arquivos: ARQUIVOS_DA_API,
  banco: TAREFAS.sql,
};

export const TOKEN_DA_ANA = 'token-da-ana';
export const TOKEN_DA_BIA = 'token-da-bia';

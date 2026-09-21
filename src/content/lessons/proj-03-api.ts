import { TAREFAS } from '../bancos/tarefas';
import type { Lesson } from '../types';

/**
 * Os arquivos do projeto que a API usa, prontos das aulas anteriores: o
 * repositório (aula 2), os erros (trilha de Node) e, a partir do segundo
 * exercício, o login que lê a sessão no banco (o primeiro exercício desta
 * aula). O aluno escreve as rotas.
 */
const REPOSITORIO = `// dados/tarefas.js — o único arquivo que sabe SQL (aula 2).
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

const ERROS = `class ErroHttp extends Error {
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

const AUTH = `// auth.js — o token vira pessoa pela tabela sessoes.
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

const CABECALHO = `const express = require('express');
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

const RODAPE = `
app.use(tratarErros);
app.listen(3000);
`;

const ANA = { Authorization: 'Bearer token-da-ana' };
const BIA = { Authorization: 'Bearer token-da-bia' };

export const lessonProjApi: Lesson = {
  id: 'lesson-proj-3',
  trackId: 'track-projeto',
  title: 'A API sobre o Banco',
  language: 'node',
  objective:
    'Escrever a camada do meio: o login que lê a sessão no banco, as rotas que chamam o repositório, a validação, o dono conferido em toda rota, a tradução para o formato da página — e o contrato que ela vai usar.',
  concepts: ['proj-api'],
  status: 'published',
  estimatedMinutes: 40,
  blocks: [
    {
      kind: 'prose',
      markdown: `
O repositório está pronto e testado. Agora a camada que a página vai chamar: a API. Você já escreveu todas as peças na trilha de Node — rotas, validação, \`ErroHttp\`, \`exigirLogin\`, o \`servidor.js\` que monta a corrente. O que muda aqui é que **cada peça fala com o banco de verdade**, e que a soma delas é um contrato.

## O login lê o banco

Na trilha de Node, as sessões eram um objeto com dois tokens. Agora são a tabela \`sessoes\`, e descobrir quem pede é uma consulta:

~~~js
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
~~~

O middleware virou \`async\` — o banco é assíncrono —, o token entra por parâmetro (é um valor que veio de fora), e o \`JOIN\` traz o nome junto, para a página cumprimentar a pessoa sem um segundo pedido.

## As rotas compõem

Cada rota é a mesma sequência de sempre — ler, validar, chamar o repositório, responder — com duas responsabilidades que são só dela:

- **O dono.** Toda rota com \`:id\` busca a tarefa, responde \`404\` se não existe e \`403\` se \`tarefa.usuario_id !== req.usuario.id\`. Uma função \`tarefaDoUsuario(id, usuario)\` faz isso num lugar só.
- **A tradução.** O banco entrega \`feita: 0\` e \`criada_em\`; a página quer \`feita: false\` e \`criadaEm\`. A função \`paraApi(tarefa)\` converte, e **toda** resposta passa por ela — a página nunca vê o formato do banco.

~~~js
app.get('/tarefas', exigirLogin, async (req, res) => {
  const tarefas = await repositorio.listarDe(req.usuario.id);
  res.json(tarefas.map(paraApi));
});
~~~

## O contrato

O que a API promete é o que a página vai programar contra. Escrito, antes da página existir:

| Pedido | Resposta |
| --- | --- |
| \`GET /tarefas\` | \`200\` \`[{ id, titulo, feita, criadaEm }]\` |
| \`POST /tarefas\` \`{ titulo }\` | \`201\` a tarefa; \`400\` \`{ erro: "titulo é obrigatório" }\` |
| \`PATCH /tarefas/:id\` \`{ titulo?, feita? }\` | \`200\` a tarefa; \`400\`; \`404\`; \`403\` |
| \`DELETE /tarefas/:id\` | \`204\`; \`404\`; \`403\` |
| qualquer uma sem token válido | \`401\` \`{ erro: "Não autenticado" }\` |

Mudar o SQL, o banco, o nome de uma função do repositório: a página não percebe. Mudar \`feita\` para \`concluida\` na resposta: **toda** tela quebra. O contrato é a parte da API que se muda com cuidado — e, quando precisa mudar, muda com a página junto.

## O que a página vai precisar, além disso

Quando a página for servida de outra origem (o Vite na porta 5173, a API na 3000), o navegador vai exigir **CORS**: a API precisa responder \`Access-Control-Allow-Origin\` — e, para \`PATCH\`, \`DELETE\` e JSON, o pedido de sondagem \`OPTIONS\`. No Node de verdade é um middleware pronto, \`cors()\`, antes das rotas. Aqui, a página e a API vão conversar no mesmo lugar, e o CORS não aparece; na publicação, aparece.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// servidor.js — as rotas compõem o que já existe.
const express = require('express');
const repositorio = require('./dados/tarefas');
const { ErroHttp, tratarErros } = require('./erros');
const { exigirLogin } = require('./auth');

const app = express();
app.use(express.json());

function paraApi(tarefa) {
  return { id: tarefa.id, titulo: tarefa.titulo, feita: tarefa.feita === 1, criadaEm: tarefa.criada_em };
}

app.get('/tarefas', exigirLogin, async (req, res) => {
  res.json((await repositorio.listarDe(req.usuario.id)).map(paraApi));
});

app.post('/tarefas', exigirLogin, async (req, res) => {
  const { titulo } = req.body;
  if (typeof titulo !== 'string' || titulo.trim() === '') throw new ErroHttp(400, 'titulo é obrigatório');
  const tarefa = await repositorio.criar({ titulo: titulo.trim(), usuarioId: req.usuario.id });
  res.status(201).json(paraApi(tarefa));
});

app.use(tratarErros);
app.listen(3000);`,
      caption:
        'Ler, validar, repositório, traduzir, responder. A rota não sabe SQL, o repositório não sabe HTTP, e paraApi é a única que sabe que o banco guarda 0/1.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-3-login',
        type: 'server',
        prompt:
          'Escreva o `exigirLogin` do projeto: lê o token do cabeçalho `Authorization` (`Bearer <token>`), procura na tabela `sessoes` (com `JOIN` em `usuarios`, para trazer `id` e `nome`), responde **401** com `{ erro: "Não autenticado" }` quando não há sessão, e senão guarda `{ id, nome }` em `req.usuario` e segue. `GET /eu` já usa o middleware.',
        concepts: ['proj-api', 'node-middleware'],
        difficulty: 'intermediario',
        tags: ['projeto', 'api', 'autenticacao', 'sql'],
        banco: TAREFAS.sql,
        initialCode: `const express = require('express');
const banco = require('./banco');
const app = express();

async function exigirLogin(req, res, next) {
  // O token do cabeçalho vira pessoa pela tabela sessoes.
  next();
}

app.get('/eu', exigirLogin, (req, res) => res.json(req.usuario));

app.listen(3000);
`,
        tests: [
          {
            description: 'Sem token, GET /eu responde 401 com { erro: "Não autenticado" }',
            assertion: `const res = await pedir(app, 'GET', '/eu');
if (res.status !== 401 || !res.body || res.body.erro !== 'Não autenticado') throw new Error('GET /eu sem token respondeu ' + res.status + ' ' + res.texto + '; esperava 401 {"erro":"Não autenticado"}');`,
          },
          {
            description: 'Com o token da Ana, GET /eu responde { id: 1, nome: "Ana" }; com o da Bia, a Bia',
            assertion: `const ana = await pedir(app, 'GET', '/eu', { headers: ${JSON.stringify(ANA)} });
if (ana.status !== 200 || !ana.body || ana.body.id !== 1 || ana.body.nome !== 'Ana') throw new Error('GET /eu com o token da Ana respondeu ' + ana.status + ' ' + ana.texto + '; esperava 200 {"id":1,"nome":"Ana"} — a consulta precisa do JOIN com usuarios, e do await');
const bia = await pedir(app, 'GET', '/eu', { headers: ${JSON.stringify(BIA)} });
if (!bia.body || bia.body.id !== 2 || bia.body.nome !== 'Bia') throw new Error('GET /eu com o token da Bia respondeu ' + bia.texto + '; esperava {"id":2,"nome":"Bia"}');`,
          },
          {
            description: 'Um token que não está em sessoes responde 401 — e não vira SQL',
            assertion: `const falso = await pedir(app, 'GET', '/eu', { headers: { Authorization: 'Bearer token-falso' } });
if (falso.status !== 401) throw new Error('token inexistente respondeu ' + falso.status + '; esperava 401');
const injecao = await pedir(app, 'GET', '/eu', { headers: { Authorization: "Bearer x' OR '1'='1" } });
if (injecao.status !== 401) throw new Error("um token com aspas e OR respondeu " + injecao.status + '; esperava 401 — o token entra por parâmetro (?), nunca concatenado no SQL');`,
          },
        ],
        solution: `const express = require('express');
const banco = require('./banco');
const app = express();

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

app.get('/eu', exigirLogin, (req, res) => res.json(req.usuario));

app.listen(3000);`,
        hints: [
          'O token: `(req.headers.authorization || "").replace("Bearer ", "")`, como na trilha de Node.',
          'A consulta: `SELECT u.id, u.nome FROM sessoes s JOIN usuarios u ON u.id = s.usuario_id WHERE s.token = ?`, com `[token]` — e `await`.',
          'Sem linhas, 401 com `return`. Com uma, `req.usuario = linhas[0]` e `next()`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-3-ler-criar',
        type: 'server',
        prompt:
          'Com o repositório, os erros e o login prontos (acima do editor), escreva `GET /tarefas` — as tarefas de quem pediu, cada uma passada por `paraApi` — e `POST /tarefas`: `titulo` texto não vazio (senão **400** `"titulo é obrigatório"`), criada com o dono logado, **201** com a tarefa no formato da API.',
        concepts: ['proj-api', 'node-corpo'],
        difficulty: 'intermediario',
        tags: ['projeto', 'api', 'rotas'],
        banco: TAREFAS.sql,
        arquivos: { './dados/tarefas.js': REPOSITORIO, './erros.js': ERROS, './auth.js': AUTH },
        initialCode: `${CABECALHO}
// GET /tarefas

// POST /tarefas
${RODAPE}`,
        tests: [
          {
            description: 'GET /tarefas pela Ana devolve as 3 dela, com feita booleano e criadaEm',
            assertion: `const res = await pedir(app, 'GET', '/tarefas', { headers: ${JSON.stringify(ANA)} });
if (res.status !== 200 || !Array.isArray(res.body) || res.body.length !== 3) throw new Error('GET /tarefas pela Ana respondeu ' + res.status + ' ' + res.texto + '; esperava 200 com 3 tarefas');
const t = res.body[2];
if (t.feita !== true || typeof t.criadaEm !== 'string' || 'usuario_id' in t) throw new Error('cada tarefa precisa passar por paraApi: feita booleano, criadaEm, sem usuario_id — veio ' + JSON.stringify(t));
const semToken = await pedir(app, 'GET', '/tarefas');
if (semToken.status !== 401) throw new Error('GET /tarefas sem token respondeu ' + semToken.status + '; esperava 401');`,
          },
          {
            description: 'POST /tarefas pela Bia cria com o dono dela e responde 201 no formato da API',
            assertion: `const res = await pedir(app, 'POST', '/tarefas', { body: { titulo: '  Publicar  ' }, headers: ${JSON.stringify(BIA)} });
if (res.status !== 201 || !res.body) throw new Error('POST /tarefas pela Bia respondeu ' + res.status + ' ' + res.texto + '; esperava 201');
if (res.body.id !== 5 || res.body.titulo !== 'Publicar' || res.body.feita !== false) throw new Error('esperava {id: 5, titulo: "Publicar", feita: false, criadaEm: …}, veio ' + res.texto);
const dela = await pedir(app, 'GET', '/tarefas', { headers: ${JSON.stringify(BIA)} });
if (!Array.isArray(dela.body) || dela.body.length !== 2 || dela.body[1].titulo !== 'Publicar') throw new Error('depois do POST, a Bia deveria ver 2 tarefas (a nova é dela), veio ' + dela.texto);`,
          },
          {
            description: 'POST sem titulo responde 400 no formato { erro }',
            assertion: `const res = await pedir(app, 'POST', '/tarefas', { body: {}, headers: ${JSON.stringify(ANA)} });
if (res.status !== 400 || !res.body || res.body.erro !== 'titulo é obrigatório') throw new Error('POST sem titulo respondeu ' + res.status + ' ' + res.texto + '; esperava 400 {"erro":"titulo é obrigatório"} — lance ErroHttp(400, …)');`,
          },
        ],
        solution: `${CABECALHO}
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
${RODAPE}`,
        hints: [
          'As duas rotas levam `exigirLogin` e são `async`; o dono é `req.usuario.id`.',
          'GET: `(await repositorio.listarDe(req.usuario.id)).map(paraApi)`.',
          'POST: validar, `await repositorio.criar({ titulo: titulo.trim(), usuarioId: req.usuario.id })`, e `res.status(201).json(paraApi(tarefa))`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-3-alterar-apagar',
        type: 'server',
        prompt:
          'Feche o contrato. `PATCH /tarefas/:id`: a tarefa do usuário (o `tarefaDoUsuario` já resolve 404 e 403); `feita`, se veio, precisa ser booleano (**400** `"feita precisa ser true ou false"`); `titulo`, se veio, texto não vazio (**400** `"titulo é obrigatório"`); `repositorio.alterar` e **200** no formato da API. `DELETE /tarefas/:id`: a tarefa do usuário, `repositorio.remover`, **204**.',
        concepts: ['proj-api', 'node-crud'],
        difficulty: 'avancado',
        tags: ['projeto', 'api', 'patch', 'delete'],
        banco: TAREFAS.sql,
        arquivos: { './dados/tarefas.js': REPOSITORIO, './erros.js': ERROS, './auth.js': AUTH },
        initialCode: `${CABECALHO}
app.get('/tarefas', exigirLogin, async (req, res) => {
  res.json((await repositorio.listarDe(req.usuario.id)).map(paraApi));
});

// PATCH /tarefas/:id

// DELETE /tarefas/:id
${RODAPE}`,
        tests: [
          {
            description: 'PATCH /tarefas/1 pela Ana com { feita: true } responde 200 com feita: true — e fica no banco',
            assertion: `const res = await pedir(app, 'PATCH', '/tarefas/1', { body: { feita: true }, headers: ${JSON.stringify(ANA)} });
if (res.status !== 200 || !res.body || res.body.feita !== true || res.body.titulo !== 'Estudar Node') throw new Error('PATCH /tarefas/1 respondeu ' + res.status + ' ' + res.texto + '; esperava 200 com feita: true e o título de antes');
const lista = await pedir(app, 'GET', '/tarefas', { headers: ${JSON.stringify(ANA)} });
if (!lista.body || lista.body[0].feita !== true) throw new Error('depois do PATCH, GET /tarefas deveria mostrar a tarefa 1 feita, veio ' + lista.texto);`,
          },
          {
            description: 'PATCH com { titulo: "Estudar Express" } renomeia; { feita: "sim" } e { titulo: "" } respondem 400',
            assertion: `const nome = await pedir(app, 'PATCH', '/tarefas/2', { body: { titulo: 'Estudar Express' }, headers: ${JSON.stringify(ANA)} });
if (nome.status !== 200 || !nome.body || nome.body.titulo !== 'Estudar Express') throw new Error('PATCH com titulo respondeu ' + nome.status + ' ' + nome.texto + '; esperava 200 com o título novo');
const sim = await pedir(app, 'PATCH', '/tarefas/2', { body: { feita: 'sim' }, headers: ${JSON.stringify(ANA)} });
if (sim.status !== 400 || !sim.body || sim.body.erro !== 'feita precisa ser true ou false') throw new Error('feita: "sim" respondeu ' + sim.status + ' ' + sim.texto + '; esperava 400 {"erro":"feita precisa ser true ou false"}');
const vazio = await pedir(app, 'PATCH', '/tarefas/2', { body: { titulo: '' }, headers: ${JSON.stringify(ANA)} });
if (vazio.status !== 400 || !vazio.body || vazio.body.erro !== 'titulo é obrigatório') throw new Error('titulo vazio respondeu ' + vazio.status + ' ' + vazio.texto + '; esperava 400 {"erro":"titulo é obrigatório"}');`,
          },
          {
            description: 'A Bia não altera nem apaga a tarefa da Ana (403); tarefa inexistente é 404',
            assertion: `const deOutro = await pedir(app, 'PATCH', '/tarefas/1', { body: { feita: false }, headers: ${JSON.stringify(BIA)} });
if (deOutro.status !== 403 || !deOutro.body || deOutro.body.erro !== 'Sem permissão') throw new Error('PATCH da tarefa da Ana pela Bia respondeu ' + deOutro.status + ' ' + deOutro.texto + '; esperava 403 {"erro":"Sem permissão"}');
const apagarDeOutro = await pedir(app, 'DELETE', '/tarefas/1', { headers: ${JSON.stringify(BIA)} });
if (apagarDeOutro.status !== 403) throw new Error('DELETE da tarefa da Ana pela Bia respondeu ' + apagarDeOutro.status + '; esperava 403');
const nada = await pedir(app, 'DELETE', '/tarefas/9', { headers: ${JSON.stringify(ANA)} });
if (nada.status !== 404 || !nada.body || nada.body.erro !== 'Tarefa não encontrada') throw new Error('DELETE /tarefas/9 respondeu ' + nada.status + ' ' + nada.texto + '; esperava 404 {"erro":"Tarefa não encontrada"}');`,
          },
          {
            description: 'DELETE /tarefas/3 pela Ana responde 204 sem corpo, e a tarefa some do banco',
            assertion: `const res = await pedir(app, 'DELETE', '/tarefas/3', { headers: ${JSON.stringify(ANA)} });
if (res.status !== 204 || res.texto !== '') throw new Error('DELETE /tarefas/3 respondeu ' + res.status + ' "' + res.texto + '"; esperava 204 sem corpo');
const lista = await pedir(app, 'GET', '/tarefas', { headers: ${JSON.stringify(ANA)} });
if (!Array.isArray(lista.body) || lista.body.some((t) => t.id === 3)) throw new Error('depois do DELETE, a tarefa 3 não deveria estar na lista da Ana, veio ' + lista.texto);`,
          },
        ],
        solution: `${CABECALHO}
app.get('/tarefas', exigirLogin, async (req, res) => {
  res.json((await repositorio.listarDe(req.usuario.id)).map(paraApi));
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
${RODAPE}`,
        hints: [
          'As duas rotas começam igual: `const tarefa = await tarefaDoUsuario(req.params.id, req.usuario)` — o 404 e o 403 já estão lá.',
          'No PATCH, valide cada campo **se veio** antes de alterar, e passe os dois ao `repositorio.alterar(tarefa.id, { titulo, feita })`; a resposta é `paraApi(alterada)`.',
          'No DELETE: `await repositorio.remover(tarefa.id)` e `res.status(204).end()`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-3-contrato',
        type: 'multiple-choice',
        prompt: 'Qual destas mudanças na API **quebra a página** que programa contra o contrato?',
        concepts: ['proj-api'],
        difficulty: 'iniciante',
        tags: ['projeto', 'api', 'contrato'],
        options: [
          'Renomear `feita` para `concluida` na resposta de `GET /tarefas`',
          'Trocar o SQL de `listarDe` por um que usa índice',
          'Renomear a função `listarDe` do repositório para `listarDoUsuario`',
          'Trocar o SQLite por outro banco, mantendo o repositório com as mesmas funções',
        ],
        correctIndex: 0,
        explanation:
          'A página só conhece o contrato: rotas, status e o formato do JSON. Tudo o que está atrás — SQL, nomes de funções, o banco — pode mudar sem ela perceber; é para isso que as camadas existem. O nome de um campo na resposta é o contrato: muda com cuidado, e com a página junto.',
        hints: ['Das quatro mudanças, qual a página conseguiria perceber?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-3-fluxo',
        type: 'order-steps',
        prompt: 'Coloque na ordem o que acontece num `PATCH /tarefas/7` com `{ feita: true }`, da chegada à resposta.',
        concepts: ['proj-api'],
        difficulty: 'iniciante',
        tags: ['projeto', 'api', 'fluxo'],
        steps: [
          { id: 'json', text: '`express.json()` lê o corpo e põe `{ feita: true }` em `req.body`', ordem: 1 },
          { id: 'login', text: '`exigirLogin` consulta `sessoes` com o token e põe `{ id, nome }` em `req.usuario`', ordem: 2 },
          { id: 'dono', text: '`tarefaDoUsuario(7, req.usuario)` busca a tarefa: 404 se não existe, 403 se o dono é outro', ordem: 3 },
          { id: 'validar', text: 'A rota valida `feita`: precisa ser booleano, senão 400', ordem: 4 },
          { id: 'repo', text: '`repositorio.alterar(7, { feita: true })` grava `1` no banco e lê a linha de volta', ordem: 5 },
          { id: 'responder', text: '`res.json(paraApi(alterada))` — `feita: true`, `criadaEm`, sem `usuario_id`', ordem: 6 },
        ],
        explanation:
          'A corrente da trilha de Node com o banco dentro: o corpo primeiro, depois quem é, depois se pode, depois se o que veio serve, depois o repositório, depois a tradução. Cada passo pode encerrar com um erro no formato `{ erro }` — e o middleware de erro, por último, é quem responde.',
        hints: ['Antes de saber se pode, é preciso saber quem é; antes de saber quem é, o corpo já foi lido.', 'A tradução para o formato da API é o último passo.'],
      },
    },
    {
      kind: 'summary',
      markdown: `
A API é a camada que **compõe**: o login lê a sessão no banco (por parâmetro, com \`JOIN\`), cada rota lê, valida, chama o repositório e responde — e duas responsabilidades são só dela: **o dono** (404, depois 403, em toda rota com \`:id\`) e **a tradução** (\`paraApi\`: \`feita\` booleano, \`criadaEm\`, sem o que é do banco).

O **contrato** — rotas, status, o formato do JSON — é o que a página vai programar contra. Tudo atrás dele pode mudar; ele muda com cuidado, e com a página junto.

Na próxima aula, a página: o \`fetch\` para esta API, os estados de carregando, erro e vazio, e o formulário que envia.
`.trim(),
    },
  ],
};

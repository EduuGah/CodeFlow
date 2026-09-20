import type { Lesson } from '../types';

/**
 * Os arquivos do projeto, fornecidos aos exercícios em `arquivos`. Cada um é
 * um módulo que o aluno já escreveu em alguma aula da trilha; aqui ele os
 * recebe prontos e escreve o que falta — as rotas, e o arquivo que junta
 * tudo. O painel acima do editor mostra cada um.
 */
const CONFIG = `// Tudo que muda entre máquinas, lido uma vez.
module.exports = Object.freeze({
  porta: Number(process.env.PORTA) || 3000,
  limiteDeItens: Number(process.env.LIMITE_DE_ITENS) || 20,
  emProducao: process.env.NODE_ENV === 'production',
});
`;

const ERROS = `class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

// Por último na corrente: todo erro vira { erro } com o status certo.
function tratarErros(erro, req, res, next) {
  const status = erro.status || 500;
  res.status(status).json({ erro: status === 500 ? 'Erro interno' : erro.message });
}

module.exports = { ErroHttp, tratarErros };
`;

const AUTH = `const sessoes = {
  'token-da-ana': { id: 1, nome: 'Ana' },
  'token-da-bia': { id: 2, nome: 'Bia' },
};

function exigirLogin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const usuario = sessoes[token];
  if (!usuario) return res.status(401).json({ erro: 'Não autenticado' });
  req.usuario = usuario;
  next();
}

module.exports = { exigirLogin };
`;

const REPOSITORIO = `// O banco de mentira: cada função devolve uma Promise. Toda tarefa tem dono.
function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let proximoId = 4;
const tarefas = [
  { id: 1, titulo: 'Estudar Node', feita: false, donoId: 1 },
  { id: 2, titulo: 'Fazer a API', feita: false, donoId: 1 },
  { id: 3, titulo: 'Revisar SQL', feita: true, donoId: 2 },
];

module.exports = {
  async listar(donoId) {
    await esperar(3);
    return tarefas.filter((t) => t.donoId === donoId).map((t) => ({ ...t }));
  },
  async buscar(id) {
    await esperar(3);
    const tarefa = tarefas.find((t) => t.id === id);
    return tarefa ? { ...tarefa } : null;
  },
  async criar(dados) {
    await esperar(3);
    const nova = { id: proximoId++, ...dados };
    tarefas.push(nova);
    return { ...nova };
  },
  async alterar(id, mudancas) {
    await esperar(3);
    const tarefa = tarefas.find((t) => t.id === id);
    if (!tarefa) return null;
    Object.assign(tarefa, mudancas);
    return { ...tarefa };
  },
  async remover(id) {
    await esperar(3);
    const indice = tarefas.findIndex((t) => t.id === id);
    if (indice === -1) return false;
    tarefas.splice(indice, 1);
    return true;
  },
};
`;

const ROTAS = `const { exigirLogin } = require('./auth');
const { ErroHttp } = require('./erros');
const repositorio = require('./repositorio');

// As rotas do recurso, registradas no app que receberem.
function montarRotas(app) {
  app.get('/tarefas', exigirLogin, async (req, res) => {
    res.json(await repositorio.listar(req.usuario.id));
  });

  app.post('/tarefas', exigirLogin, async (req, res) => {
    const { titulo } = req.body;
    if (typeof titulo !== 'string' || titulo.trim() === '') throw new ErroHttp(400, 'titulo é obrigatório');
    const tarefa = await repositorio.criar({ titulo: titulo.trim(), feita: false, donoId: req.usuario.id });
    res.status(201).json(tarefa);
  });

  app.get('/tarefas/:id', exigirLogin, async (req, res) => {
    const tarefa = await repositorio.buscar(Number(req.params.id));
    if (!tarefa) throw new ErroHttp(404, 'Tarefa não encontrada');
    if (tarefa.donoId !== req.usuario.id) throw new ErroHttp(403, 'Sem permissão');
    res.json(tarefa);
  });
}

module.exports = { montarRotas };
`;

const ARQUIVOS_BASE = {
  './config': CONFIG,
  './erros': ERROS,
  './auth': AUTH,
  './repositorio': REPOSITORIO,
};

const CABECALHO = `const express = require('express');
const config = require('./config');
const { ErroHttp, tratarErros } = require('./erros');
const { exigirLogin } = require('./auth');
const repositorio = require('./repositorio');

const app = express();
app.use(express.json());
`;

const RODAPE = `
app.use(tratarErros);
app.listen(config.porta);
`;

const ANA = { Authorization: 'Bearer token-da-ana' };
const BIA = { Authorization: 'Bearer token-da-bia' };

export const lessonNodeProjeto: Lesson = {
  id: 'lesson-node-10',
  trackId: 'track-node',
  title: 'Projeto: A API de Tarefas, Inteira',
  language: 'node',
  objective:
    'Juntar a trilha numa API pequena e completa — recursos desenhados antes do código, um arquivo por responsabilidade, autenticação, validação, erros num lugar só, repositório assíncrono e configuração — do jeito que se entrega.',
  concepts: ['node-projeto'],
  status: 'published',
  estimatedMinutes: 45,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Nove aulas, nove pedaços. Uma API é os pedaços juntos — e, como no projeto da trilha de React, a parte difícil não é nenhum pedaço: é decidir o que mora onde, em que ordem construir, e o que uma pessoa que abrir o repositório amanhã vai encontrar. Esta aula é esse processo. A lista de tarefas é o pretexto; é a mesma da página e do React, agora com um servidor de verdade por trás.

## Primeiro os recursos

Antes de qualquer \`app.get\`, a tabela:

| Pedido | Faz | Precisa de login? |
| --- | --- | --- |
| \`GET /tarefas\` | as tarefas **de quem pediu** | sim |
| \`POST /tarefas\` | cria uma, do dono logado | sim |
| \`GET /tarefas/:id\` | uma; \`404\` se não existe, \`403\` se é de outro | sim |
| \`PATCH /tarefas/:id\` | altera \`titulo\` e/ou \`feita\` | sim |
| \`DELETE /tarefas/:id\` | apaga; \`204\` | sim |
| \`GET /saude\` | \`{ ok: true }\` | não |

Uma decisão nova: **toda tarefa tem dono**, e cada um só vê as suas. Isso muda o \`listar\` (filtra pelo dono), o \`criar\` (grava o dono) e toda rota com \`:id\` (o \`403\` da aula de middleware). Decidir isso agora, na tabela, evita descobrir depois que a lista mostra as tarefas de todo mundo.

## Depois os arquivos

Um arquivo por responsabilidade — e o nome do arquivo diz qual:

~~~
servidor.js        monta a corrente e sobe: json, rotas, erros, listen
config.js          o ambiente, lido uma vez
erros.js           ErroHttp e tratarErros
auth.js            exigirLogin (e as sessões, por ora)
repositorio.js     as funções assíncronas sobre os dados
rotas/tarefas.js   as rotas do recurso: ler, validar, repositório, responder
~~~

A regra que decide onde uma linha mora: **quem precisa mudar quando isto mudar?** Trocar a lista por um banco muda só o \`repositorio.js\`. Trocar o formato do erro muda só o \`erros.js\`. Trocar a porta não muda arquivo nenhum — muda o \`.env\`. As rotas ficam com o que é delas: ler o pedido, validar, chamar o repositório, responder. Nenhuma rota sabe como o dado é guardado; nenhum repositório sabe o que é um \`res\`.

Os arquivos conversam por \`require\`, e a dependência tem **um sentido só**: as rotas dependem do repositório, dos erros e da autenticação; nenhum deles depende das rotas. Se um dia o \`repositorio.js\` precisar de algo do \`rotas/tarefas.js\`, a divisão está errada.

## Depois a ordem de construção

1. \`config.js\` — sobe, imprime a porta. Nada mais.
2. \`erros.js\`, \`repositorio.js\`, \`auth.js\` — cada um sozinho, em qualquer ordem: são independentes.
3. \`GET /saude\` e \`GET /tarefas\` — a primeira rota aberta, a primeira protegida. Dá para pedir.
4. \`POST\` — dá para criar. \`GET /tarefas/:id\` — com o \`403\`.
5. \`PATCH\` e \`DELETE\` — o recurso completo.
6. \`servidor.js\` — a corrente na ordem certa, e a porta da configuração.
7. Pedidos de ponta a ponta: sem token, com token, o \`403\`, o \`404\`, o \`400\`.

Cada passo deixa algo que roda. A regra vem da aula de decompor problemas e vale igual aqui: uma fatia por vez, nunca "todas as rotas, depois todos os erros".

## Como se entrega

Um projeto entregue tem, além do código: um \`README\` que responde **o que é, como rodar, como testar**; o \`.env.example\`; e um jeito de rodar os pedidos de ponta a ponta — aqui é o \`pedir\` dos exercícios; no Node de verdade, uma biblioteca como o \`supertest\` faz o mesmo papel, ou um arquivo de pedidos no editor. O que não se entrega: o \`.env\`, a \`node_modules\`, e um "funciona na minha máquina".

## O que ficou de fora, de propósito

O repositório é uma lista com uma espera na frente. A versão real usa o SQL que a trilha de banco ensinou — e é o projeto final desta plataforma que junta as duas pontas, com a página chamando esta API. As sessões são um objeto com dois tokens fixos; o login de verdade gera tokens com validade e nunca guarda a senha como está. E quando a página chamar esta API de outra origem, o navegador vai exigir o **CORS** — um cabeçalho que a trilha da web explicou e um middleware que resolve. Tudo isso é a próxima etapa, não esta.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// servidor.js — o arquivo que junta tudo. Repare que ele não tem nenhuma regra:
// só a ordem da corrente e a porta.
const express = require('express');
const config = require('./config');
const { tratarErros } = require('./erros');
const { montarRotas } = require('./rotas/tarefas');

const app = express();

app.use(express.json());              // 1. o corpo, para todas as rotas
app.get('/saude', (req, res) => res.json({ ok: true }));
montarRotas(app);                     // 2. as rotas do recurso
app.use(tratarErros);                 // 3. os erros, por último

app.listen(config.porta, () => {
  console.log('API de tarefas na porta ' + config.porta);
});`,
      caption:
        'O servidor.js de um projeto organizado é pequeno: ele monta a corrente na ordem certa e sobe. Toda regra mora no arquivo da sua responsabilidade.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-10-ordem',
        type: 'order-steps',
        prompt: 'Coloque na ordem os passos de construção da API, do papel ao pedido de ponta a ponta.',
        concepts: ['node-projeto'],
        difficulty: 'iniciante',
        tags: ['node', 'projeto', 'planejamento'],
        steps: [
          { id: 'desenho', text: 'Desenhar a tabela de recursos: cada rota, o que faz, e se exige login', ordem: 1 },
          { id: 'config', text: '`config.js`: o ambiente lido uma vez, com padrões e validação', ordem: 2 },
          { id: 'erros', text: '`erros.js`: `ErroHttp` e o middleware de erro', ordem: 3 },
          { id: 'repo', text: '`repositorio.js`: as funções assíncronas sobre os dados', ordem: 3 },
          { id: 'auth', text: '`auth.js`: o `exigirLogin`', ordem: 3 },
          { id: 'rotas', text: '`rotas/tarefas.js`: cada rota lê, valida, chama o repositório e responde', ordem: 4 },
          { id: 'servidor', text: '`servidor.js`: montar a corrente — json, rotas, erros — e `listen(config.porta)`', ordem: 5 },
          { id: 'ponta', text: 'Pedidos de ponta a ponta: sem token, com token, o 403, o 404, o 400', ordem: 6 },
        ],
        explanation:
          'O desenho vem antes de tudo, porque decide o resto (tarefas têm dono?). A configuração vem cedo porque todos dependem dela. Erros, repositório e autenticação são independentes entre si e podem ir em qualquer ordem — mas antes das rotas, que dependem dos três. O servidor.js junta o que existe, e os pedidos de ponta a ponta provam que a corrente está na ordem certa.',
        hints: [
          'O que decide tudo o mais tem que vir primeiro; o que só junta o que existe tem que vir por último.',
          'As rotas usam o repositório, os erros e a autenticação — então dependem deles.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-10-ler',
        type: 'server',
        prompt:
          'Os módulos estão prontos (acima do editor). Escreva as rotas de leitura, protegidas por `exigirLogin`: `GET /tarefas` lista só as tarefas de `req.usuario` (`repositorio.listar(donoId)`); `GET /tarefas/:id` responde a tarefa, ou **404** `"Tarefa não encontrada"`, ou **403** `"Sem permissão"` quando o dono é outro — lançando `ErroHttp`, que o `tratarErros` já responde.',
        concepts: ['node-projeto', 'node-middleware', 'node-async'],
        difficulty: 'intermediario',
        tags: ['node', 'projeto', 'rotas', 'autenticacao'],
        arquivos: ARQUIVOS_BASE,
        initialCode: `${CABECALHO}
app.get('/saude', (req, res) => res.json({ ok: true }));

// GET /tarefas — as do usuário logado.

// GET /tarefas/:id — 404, 403 ou a tarefa.
${RODAPE}`,
        tests: [
          {
            description: 'GET /tarefas sem token responde 401; GET /saude continua aberta',
            assertion: `const semToken = await pedir(app, 'GET', '/tarefas');
if (semToken.status !== 401) throw new Error('GET /tarefas sem token respondeu ' + semToken.status + ' ' + semToken.texto + '; esperava 401 — a rota precisa do exigirLogin');
const saude = await pedir(app, 'GET', '/saude');
if (saude.status !== 200) throw new Error('GET /saude respondeu ' + saude.status + '; esperava 200 sem token');`,
          },
          {
            description: 'A Ana vê as 2 tarefas dela; a Bia vê só a dela',
            assertion: `const ana = await pedir(app, 'GET', '/tarefas', { headers: ${JSON.stringify(ANA)} });
if (ana.status !== 200 || !Array.isArray(ana.body)) throw new Error('GET /tarefas da Ana respondeu ' + ana.status + ' ' + ana.texto + '; esperava 200 com a lista' + (ana.texto === '{}' ? ' — faltou o await' : ''));
if (ana.body.length !== 2 || ana.body.some((t) => t.donoId !== 1)) throw new Error('a Ana deveria ver só as 2 tarefas dela, veio ' + ana.texto + ' — listar recebe o id do dono');
const bia = await pedir(app, 'GET', '/tarefas', { headers: ${JSON.stringify(BIA)} });
if (!Array.isArray(bia.body) || bia.body.length !== 1 || bia.body[0].titulo !== 'Revisar SQL') throw new Error('a Bia deveria ver só "Revisar SQL", veio ' + bia.texto);`,
          },
          {
            description: 'GET /tarefas/1 pela Ana é 200; pela Bia é 403; GET /tarefas/9 é 404',
            assertion: `const dela = await pedir(app, 'GET', '/tarefas/1', { headers: ${JSON.stringify(ANA)} });
if (dela.status !== 200 || !dela.body || dela.body.titulo !== 'Estudar Node') throw new Error('GET /tarefas/1 pela Ana respondeu ' + dela.status + ' ' + dela.texto + '; esperava 200 com a tarefa' + (dela.status === 404 ? ' — buscar recebe um número' : ''));
const deOutro = await pedir(app, 'GET', '/tarefas/1', { headers: ${JSON.stringify(BIA)} });
if (deOutro.status !== 403 || !deOutro.body || deOutro.body.erro !== 'Sem permissão') throw new Error('GET /tarefas/1 pela Bia respondeu ' + deOutro.status + ' ' + deOutro.texto + '; esperava 403 {"erro":"Sem permissão"}');
const nada = await pedir(app, 'GET', '/tarefas/9', { headers: ${JSON.stringify(ANA)} });
if (nada.status !== 404 || !nada.body || nada.body.erro !== 'Tarefa não encontrada') throw new Error('GET /tarefas/9 respondeu ' + nada.status + ' ' + nada.texto + '; esperava 404 {"erro":"Tarefa não encontrada"}');`,
          },
        ],
        solution: `${CABECALHO}
app.get('/saude', (req, res) => res.json({ ok: true }));

app.get('/tarefas', exigirLogin, async (req, res) => {
  res.json(await repositorio.listar(req.usuario.id));
});

app.get('/tarefas/:id', exigirLogin, async (req, res) => {
  const tarefa = await repositorio.buscar(Number(req.params.id));
  if (!tarefa) throw new ErroHttp(404, 'Tarefa não encontrada');
  if (tarefa.donoId !== req.usuario.id) throw new ErroHttp(403, 'Sem permissão');
  res.json(tarefa);
});
${RODAPE}`,
        hints: [
          'As duas rotas levam `exigirLogin` entre o caminho e a função, e a função é `async`.',
          'Na lista: `await repositorio.listar(req.usuario.id)`. No item: `await repositorio.buscar(Number(req.params.id))`, depois o 404, depois o 403 comparando `tarefa.donoId` com `req.usuario.id`.',
          'Lance `new ErroHttp(404, "Tarefa não encontrada")` e `new ErroHttp(403, "Sem permissão")`; quem responde é o `tratarErros`, que já está no fim.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-10-escrever',
        type: 'server',
        prompt:
          'Agora as rotas de escrita, protegidas: `POST /tarefas` valida `titulo` (texto não vazio, senão **400** `"titulo é obrigatório"`) e cria com `repositorio.criar({ titulo, feita: false, donoId })` — **201** com a criada. `PATCH /tarefas/:id`: **404** se não existe, **403** se o dono é outro, **400** se `feita` veio e não é booleano (`"feita precisa ser true ou false"`) ou se `titulo` veio vazio (`"titulo é obrigatório"`); senão `repositorio.alterar(id, mudancas)` e **200** com a alterada.',
        concepts: ['node-projeto', 'node-crud', 'node-async'],
        difficulty: 'avancado',
        tags: ['node', 'projeto', 'post', 'patch'],
        arquivos: ARQUIVOS_BASE,
        initialCode: `${CABECALHO}
async function acharDoUsuario(id, usuario) {
  const tarefa = await repositorio.buscar(Number(id));
  if (!tarefa) throw new ErroHttp(404, 'Tarefa não encontrada');
  if (tarefa.donoId !== usuario.id) throw new ErroHttp(403, 'Sem permissão');
  return tarefa;
}

app.get('/tarefas', exigirLogin, async (req, res) => {
  res.json(await repositorio.listar(req.usuario.id));
});

// POST /tarefas

// PATCH /tarefas/:id
${RODAPE}`,
        tests: [
          {
            description: 'POST /tarefas pela Ana cria com o dono dela e responde 201; sem titulo é 400',
            assertion: `const res = await pedir(app, 'POST', '/tarefas', { body: { titulo: 'Publicar a API' }, headers: ${JSON.stringify(ANA)} });
if (res.status !== 201 || !res.body || res.body.id !== 4 || res.body.titulo !== 'Publicar a API' || res.body.feita !== false || res.body.donoId !== 1) throw new Error('POST /tarefas pela Ana respondeu ' + res.status + ' ' + res.texto + '; esperava 201 {"id":4,"titulo":"Publicar a API","feita":false,"donoId":1}');
const vazio = await pedir(app, 'POST', '/tarefas', { body: {}, headers: ${JSON.stringify(ANA)} });
if (vazio.status !== 400 || !vazio.body || vazio.body.erro !== 'titulo é obrigatório') throw new Error('POST sem titulo respondeu ' + vazio.status + ' ' + vazio.texto + '; esperava 400 {"erro":"titulo é obrigatório"}');
const lista = await pedir(app, 'GET', '/tarefas', { headers: ${JSON.stringify(ANA)} });
if (!Array.isArray(lista.body) || lista.body.length !== 3) throw new Error('a Ana deveria ver 3 tarefas agora, veio ' + lista.texto);`,
          },
          {
            description: 'PATCH /tarefas/1 pela Ana com { feita: true } altera; pela Bia é 403; /tarefas/9 é 404',
            assertion: `const res = await pedir(app, 'PATCH', '/tarefas/1', { body: { feita: true }, headers: ${JSON.stringify(ANA)} });
if (res.status !== 200 || !res.body || res.body.feita !== true || res.body.titulo !== 'Estudar Node') throw new Error('PATCH /tarefas/1 respondeu ' + res.status + ' ' + res.texto + '; esperava 200 com feita: true e o título de antes');
const deOutro = await pedir(app, 'PATCH', '/tarefas/1', { body: { feita: false }, headers: ${JSON.stringify(BIA)} });
if (deOutro.status !== 403) throw new Error('PATCH /tarefas/1 pela Bia respondeu ' + deOutro.status + ' ' + deOutro.texto + '; esperava 403');
const nada = await pedir(app, 'PATCH', '/tarefas/9', { body: { feita: true }, headers: ${JSON.stringify(ANA)} });
if (nada.status !== 404) throw new Error('PATCH /tarefas/9 respondeu ' + nada.status + ' ' + nada.texto + '; esperava 404');`,
          },
          {
            description: 'PATCH com { feita: "sim" } é 400 e não altera; sem token é 401',
            assertion: `const sim = await pedir(app, 'PATCH', '/tarefas/2', { body: { feita: 'sim' }, headers: ${JSON.stringify(ANA)} });
if (sim.status !== 400 || !sim.body || sim.body.erro !== 'feita precisa ser true ou false') throw new Error('PATCH com feita: "sim" respondeu ' + sim.status + ' ' + sim.texto + '; esperava 400 {"erro":"feita precisa ser true ou false"}');
const lida = await pedir(app, 'GET', '/tarefas', { headers: ${JSON.stringify(ANA)} });
const dois = Array.isArray(lida.body) ? lida.body.find((t) => t.id === 2) : null;
if (!dois || dois.feita !== false) throw new Error('depois do 400, a tarefa 2 deveria continuar com feita: false, veio ' + lida.texto + ' — valide antes de alterar');
const semToken = await pedir(app, 'PATCH', '/tarefas/2', { body: { feita: true } });
if (semToken.status !== 401) throw new Error('PATCH sem token respondeu ' + semToken.status + '; esperava 401');`,
          },
        ],
        solution: `${CABECALHO}
async function acharDoUsuario(id, usuario) {
  const tarefa = await repositorio.buscar(Number(id));
  if (!tarefa) throw new ErroHttp(404, 'Tarefa não encontrada');
  if (tarefa.donoId !== usuario.id) throw new ErroHttp(403, 'Sem permissão');
  return tarefa;
}

app.get('/tarefas', exigirLogin, async (req, res) => {
  res.json(await repositorio.listar(req.usuario.id));
});

app.post('/tarefas', exigirLogin, async (req, res) => {
  const { titulo } = req.body;
  if (typeof titulo !== 'string' || titulo.trim() === '') throw new ErroHttp(400, 'titulo é obrigatório');
  const tarefa = await repositorio.criar({ titulo: titulo.trim(), feita: false, donoId: req.usuario.id });
  res.status(201).json(tarefa);
});

app.patch('/tarefas/:id', exigirLogin, async (req, res) => {
  const tarefa = await acharDoUsuario(req.params.id, req.usuario);
  const { titulo, feita } = req.body;
  const mudancas = {};
  if (titulo !== undefined) {
    if (typeof titulo !== 'string' || titulo.trim() === '') throw new ErroHttp(400, 'titulo é obrigatório');
    mudancas.titulo = titulo.trim();
  }
  if (feita !== undefined) {
    if (typeof feita !== 'boolean') throw new ErroHttp(400, 'feita precisa ser true ou false');
    mudancas.feita = feita;
  }
  res.json(await repositorio.alterar(tarefa.id, mudancas));
});
${RODAPE}`,
        hints: [
          'O `acharDoUsuario` já faz o 404 e o 403: `const tarefa = await acharDoUsuario(req.params.id, req.usuario)` é a primeira linha do PATCH.',
          'No POST, o dono vem de `req.usuario.id`, nunca do corpo. No PATCH, monte um objeto `mudancas` campo a campo, validando cada um se veio, e entregue ao `repositorio.alterar`.',
          'Todo erro é `throw new ErroHttp(status, mensagem)` — inclusive os 400.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-10-apagar',
        type: 'server',
        prompt:
          'Feche o recurso: `DELETE /tarefas/:id` (protegida; 404 e 403 pelo `acharDoUsuario`; `repositorio.remover(id)` e **204**). E uma regra de negócio que vem da configuração: `config.limiteDeItens` é o máximo de tarefas por usuário — o `POST` responde **409** com `"limite de tarefas atingido"` quando o usuário já tem esse tanto. O ambiente define `LIMITE_DE_ITENS=3`.',
        concepts: ['node-projeto', 'node-crud', 'node-config'],
        difficulty: 'avancado',
        tags: ['node', 'projeto', 'delete', 'config', '409'],
        env: { LIMITE_DE_ITENS: '3' },
        arquivos: ARQUIVOS_BASE,
        initialCode: `${CABECALHO}
async function acharDoUsuario(id, usuario) {
  const tarefa = await repositorio.buscar(Number(id));
  if (!tarefa) throw new ErroHttp(404, 'Tarefa não encontrada');
  if (tarefa.donoId !== usuario.id) throw new ErroHttp(403, 'Sem permissão');
  return tarefa;
}

app.get('/tarefas', exigirLogin, async (req, res) => {
  res.json(await repositorio.listar(req.usuario.id));
});

app.post('/tarefas', exigirLogin, async (req, res) => {
  const { titulo } = req.body;
  if (typeof titulo !== 'string' || titulo.trim() === '') throw new ErroHttp(400, 'titulo é obrigatório');
  // O limite: 409 quando o usuário já tem config.limiteDeItens tarefas.
  const tarefa = await repositorio.criar({ titulo: titulo.trim(), feita: false, donoId: req.usuario.id });
  res.status(201).json(tarefa);
});

// DELETE /tarefas/:id
${RODAPE}`,
        tests: [
          {
            description: 'A Ana (2 tarefas) cria a terceira; a quarta responde 409 "limite de tarefas atingido"',
            assertion: `const terceira = await pedir(app, 'POST', '/tarefas', { body: { titulo: 'Terceira' }, headers: ${JSON.stringify(ANA)} });
if (terceira.status !== 201) throw new Error('a terceira tarefa da Ana respondeu ' + terceira.status + ' ' + terceira.texto + '; esperava 201 — o limite é 3, e ela tinha 2');
const quarta = await pedir(app, 'POST', '/tarefas', { body: { titulo: 'Quarta' }, headers: ${JSON.stringify(ANA)} });
if (quarta.status !== 409 || !quarta.body || quarta.body.erro !== 'limite de tarefas atingido') throw new Error('a quarta tarefa da Ana respondeu ' + quarta.status + ' ' + quarta.texto + '; esperava 409 {"erro":"limite de tarefas atingido"} — conte as tarefas dela com repositorio.listar e compare com config.limiteDeItens');
const lista = await pedir(app, 'GET', '/tarefas', { headers: ${JSON.stringify(ANA)} });
if (!Array.isArray(lista.body) || lista.body.length !== 3) throw new Error('a Ana deveria ter exatamente 3 tarefas, veio ' + lista.texto);`,
          },
          {
            description: 'A Bia (1 tarefa) ainda pode criar: o limite é por usuário',
            assertion: `const res = await pedir(app, 'POST', '/tarefas', { body: { titulo: 'Da Bia' }, headers: ${JSON.stringify(BIA)} });
if (res.status !== 201) throw new Error('POST pela Bia respondeu ' + res.status + ' ' + res.texto + '; esperava 201 — o limite conta só as tarefas de quem pede');`,
          },
          {
            description: 'DELETE /tarefas/1 pela Ana é 204; de novo é 404; pela Bia em /tarefas/2 é 403; e depois de apagar, ela pode criar de novo',
            assertion: `const res = await pedir(app, 'DELETE', '/tarefas/1', { headers: ${JSON.stringify(ANA)} });
if (res.status !== 204) throw new Error('DELETE /tarefas/1 pela Ana respondeu ' + res.status + ' ' + res.texto + '; esperava 204');
const denovo = await pedir(app, 'DELETE', '/tarefas/1', { headers: ${JSON.stringify(ANA)} });
if (denovo.status !== 404) throw new Error('o segundo DELETE /tarefas/1 respondeu ' + denovo.status + '; esperava 404');
const deOutro = await pedir(app, 'DELETE', '/tarefas/2', { headers: ${JSON.stringify(BIA)} });
if (deOutro.status !== 403) throw new Error('DELETE /tarefas/2 pela Bia respondeu ' + deOutro.status + '; esperava 403');
const nova = await pedir(app, 'POST', '/tarefas', { body: { titulo: 'Cabe de novo' }, headers: ${JSON.stringify(ANA)} });
if (nova.status !== 201) throw new Error('depois de apagar uma, a Ana deveria poder criar (201), veio ' + nova.status + ' ' + nova.texto);`,
          },
        ],
        solution: `${CABECALHO}
async function acharDoUsuario(id, usuario) {
  const tarefa = await repositorio.buscar(Number(id));
  if (!tarefa) throw new ErroHttp(404, 'Tarefa não encontrada');
  if (tarefa.donoId !== usuario.id) throw new ErroHttp(403, 'Sem permissão');
  return tarefa;
}

app.get('/tarefas', exigirLogin, async (req, res) => {
  res.json(await repositorio.listar(req.usuario.id));
});

app.post('/tarefas', exigirLogin, async (req, res) => {
  const { titulo } = req.body;
  if (typeof titulo !== 'string' || titulo.trim() === '') throw new ErroHttp(400, 'titulo é obrigatório');
  const existentes = await repositorio.listar(req.usuario.id);
  if (existentes.length >= config.limiteDeItens) throw new ErroHttp(409, 'limite de tarefas atingido');
  const tarefa = await repositorio.criar({ titulo: titulo.trim(), feita: false, donoId: req.usuario.id });
  res.status(201).json(tarefa);
});

app.delete('/tarefas/:id', exigirLogin, async (req, res) => {
  const tarefa = await acharDoUsuario(req.params.id, req.usuario);
  await repositorio.remover(tarefa.id);
  res.status(204).end();
});
${RODAPE}`,
        hints: [
          'Para o limite: `const existentes = await repositorio.listar(req.usuario.id)`, e `existentes.length >= config.limiteDeItens` é o 409 — lançado com `ErroHttp`.',
          'No DELETE: `acharDoUsuario` primeiro (ele já resolve 404 e 403), depois `await repositorio.remover(tarefa.id)`, depois `res.status(204).end()`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-10-montar',
        type: 'server',
        prompt:
          'O `servidor.js`. As rotas estão em `./rotas` (`montarRotas(app)`), os erros em `./erros`, a porta em `./config`. Monte a corrente na ordem certa — o JSON, as rotas, o tratamento de erros — e suba na porta da configuração. O ambiente define `PORTA=5000`.',
        concepts: ['node-projeto', 'node-middleware'],
        difficulty: 'intermediario',
        tags: ['node', 'projeto', 'servidor', 'ordem'],
        env: { PORTA: '5000' },
        arquivos: { ...ARQUIVOS_BASE, './rotas': ROTAS },
        initialCode: `const express = require('express');
const config = require('./config');
const { tratarErros } = require('./erros');
const { montarRotas } = require('./rotas');

const app = express();

// A corrente, na ordem certa, e a porta da configuração.

app.listen(3000);
`,
        tests: [
          {
            description: 'O servidor escuta na porta da configuração (5000)',
            assertion: `if (app.porta !== 5000) throw new Error('o servidor está na porta ' + JSON.stringify(app.porta) + '; esperava 5000 — a porta é config.porta, não um número fixo');`,
          },
          {
            description: 'POST /tarefas pela Ana cria (o JSON está antes das rotas)',
            assertion: `const res = await pedir(app, 'POST', '/tarefas', { body: { titulo: 'Montada' }, headers: ${JSON.stringify(ANA)} });
if (res.status !== 201 || !res.body || res.body.titulo !== 'Montada') throw new Error('POST /tarefas respondeu ' + res.status + ' ' + res.texto + '; esperava 201' + (res.status === 500 ? ' — req.body veio vazio: o express.json() precisa vir antes de montarRotas(app)' : res.status === 404 ? ' — as rotas não foram montadas' : ''));`,
          },
          {
            description: 'GET /tarefas/9 pela Ana responde 404 no formato { erro } (o tratarErros está depois das rotas)',
            assertion: `const res = await pedir(app, 'GET', '/tarefas/9', { headers: ${JSON.stringify(ANA)} });
if (res.status !== 404 || !res.body || res.body.erro !== 'Tarefa não encontrada') throw new Error('GET /tarefas/9 respondeu ' + res.status + ' ' + res.texto + '; esperava 404 {"erro":"Tarefa não encontrada"}' + (res.status === 500 ? ' — a rota lançou ErroHttp(404), mas quem responde é o tratarErros, registrado depois das rotas' : ''));
const semToken = await pedir(app, 'GET', '/tarefas');
if (semToken.status !== 401) throw new Error('GET /tarefas sem token respondeu ' + semToken.status + '; esperava 401');`,
          },
        ],
        solution: `const express = require('express');
const config = require('./config');
const { tratarErros } = require('./erros');
const { montarRotas } = require('./rotas');

const app = express();

app.use(express.json());
montarRotas(app);
app.use(tratarErros);

app.listen(config.porta);`,
        hints: [
          'Três linhas na ordem da corrente: o que lê o corpo, o que monta as rotas, o que trata os erros.',
          '`app.use(express.json())`, `montarRotas(app)`, `app.use(tratarErros)` — e `app.listen(config.porta)`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-10-cors',
        type: 'multiple-choice',
        prompt:
          'A API está de pé em `http://localhost:3000`. A página, servida em `http://localhost:5173`, faz `fetch("http://localhost:3000/tarefas")` e o navegador bloqueia a resposta com um erro de CORS. O que está acontecendo, e o que resolve?',
        concepts: ['node-projeto'],
        difficulty: 'intermediario',
        tags: ['node', 'cors', 'projeto'],
        options: [
          'São origens diferentes, e o navegador só entrega a resposta se **o servidor** permitir, com o cabeçalho `Access-Control-Allow-Origin` — um middleware de CORS na API resolve',
          'A página precisa mandar o cabeçalho `Access-Control-Allow-Origin` no `fetch`',
          'O servidor precisa rodar na mesma porta da página, porque `fetch` só funciona na mesma porta',
          'É um erro do Express: trocar `res.json` por `res.send` resolve',
        ],
        correctIndex: 0,
        explanation:
          'Portas diferentes são origens diferentes, e a política de mesma origem manda o navegador esconder a resposta — a não ser que o **servidor** diga que aquela origem pode ler, no cabeçalho `Access-Control-Allow-Origin`. É o servidor quem permite, nunca a página: se a página pudesse se autorizar, a política não protegeria nada. Na API, um middleware de CORS (o pacote `cors`, ou `res.set` no cabeçalho) resolve. É o primeiro obstáculo do projeto final, quando a página e a API se encontram.',
        hints: ['Quem decide se uma origem pode ler a resposta: quem pede, ou quem responde?'],
      },
    },
    {
      kind: 'summary',
      markdown: `
Uma API é a trilha inteira junta — e o que a torna um projeto é o que vem antes e depois do código: a **tabela de recursos** desenhada primeiro (com a decisão de que tarefas têm dono), **um arquivo por responsabilidade** (quem precisa mudar quando isto mudar?), a **dependência num sentido só**, a **ordem de construção** em fatias que rodam, e a entrega com \`README\`, \`.env.example\` e pedidos de ponta a ponta.

O \`servidor.js\` de um projeto organizado é pequeno: monta a corrente — JSON, rotas, erros — e sobe na porta da configuração. Toda regra mora no arquivo dela.

O que ficou para a frente: o banco de verdade no lugar do repositório de mentira, o login que gera tokens, o CORS quando a página chamar a API de outra origem, e a publicação. É o projeto final desta plataforma — a página, a API e o banco, juntos.

**Você tem uma API.** A trilha de Node acaba aqui.
`.trim(),
    },
  ],
};

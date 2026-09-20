import type { Lesson } from '../types';

export const lessonNodeMiddleware: Lesson = {
  id: 'lesson-node-6',
  trackId: 'track-node',
  title: 'Middleware e Autenticação',
  language: 'node',
  objective:
    'Entender a corrente de middlewares — o que é `next()`, o que encerra a corrente, a ordem — e usá-la para registrar pedidos, proteger rotas com um token no cabeçalho e saber quem está pedindo.',
  concepts: ['node-middleware'],
  status: 'published',
  estimatedMinutes: 35,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Você já usou dois middlewares sem olhar para eles: o \`express.json()\`, que lê o corpo, e o de erro, que responde às falhas. Hoje a ideia inteira — porque é com ela que se faz quase tudo que não é uma rota: registrar, medir, proteger, identificar.

## A corrente

Um middleware é uma função \`(req, res, next)\`. O Express passa cada pedido pela lista de camadas — middlewares e rotas — **na ordem em que foram registradas**, e cada camada faz uma de duas coisas:

- **responde** (\`res.json\`, \`res.send\`…): a corrente acaba aqui;
- **chama \`next()\`**: "não é comigo, ou já fiz a minha parte — siga para a próxima".

~~~js
app.use((req, res, next) => {
  console.log(req.method, req.path); // registra…
  next();                            // …e passa adiante
});

app.get('/ping', (req, res) => res.send('pong')); // responde: fim
~~~

Uma camada que não faz nenhuma das duas deixa o pedido **pendurado**: a página espera para sempre. É o erro clássico do middleware sem \`next()\`. E depois que uma camada respondeu, as seguintes não rodam — por isso o middleware de erro vai por último, e o \`express.json()\` vai antes das rotas.

## O que um middleware faz com o \`req\`

O \`req\` é o mesmo objeto do começo ao fim da corrente. Um middleware pode **acrescentar** coisas a ele, e as camadas seguintes leem:

~~~js
app.use((req, res, next) => {
  req.recebidoEm = Date.now();
  next();
});
~~~

É assim que o \`express.json()\` entrega \`req.body\`, e é assim que a autenticação vai entregar \`req.usuario\`.

## Onde registrar

- \`app.use(fn)\`: todo pedido.
- \`app.use('/admin', fn)\`: só os que começam com \`/admin\`.
- \`app.get('/perfil', fn, rota)\`: só nesta rota — o middleware vai **entre** o caminho e a função da rota, e pode ser mais de um.

O terceiro é o mais preciso: a rota declara o que exige, e quem lê o arquivo vê \`app.get('/perfil', exigirLogin, …)\` e sabe que \`/perfil\` pede login.

## Autenticação por token

A página, depois do login, guarda um **token** — um texto que identifica a sessão — e o manda em todo pedido, no cabeçalho \`Authorization\`:

~~~
Authorization: Bearer abc123
~~~

O servidor lê o cabeçalho, tira o \`Bearer \`, procura a sessão e descobre **quem** está pedindo:

~~~js
const sessoes = { abc123: { id: 1, nome: 'Ana' } };

function exigirLogin(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.replace('Bearer ', '');
  const usuario = sessoes[token];
  if (!usuario) return res.status(401).json({ erro: 'Não autenticado' });
  req.usuario = usuario;
  next();
}

app.get('/perfil', exigirLogin, (req, res) => res.json(req.usuario));
~~~

Dois detalhes que custam horas: os cabeçalhos chegam em \`req.headers\` com o nome **em minúsculas** (\`authorization\`, não \`Authorization\`); e o \`return\` antes do \`res.status(401)\`, para não chamar \`next()\` depois de recusar.

## 401 e 403 não são a mesma coisa

- **\`401\` Não autenticado**: *não sei quem você é.* Sem token, ou token inválido. A página responde mandando para o login.
- **\`403\` Sem permissão**: *sei quem você é, e você não pode.* A Ana, logada, tentando apagar a tarefa da Bia. Mandar para o login não resolveria nada.

A verificação de quem é fica no middleware; a de **pode ou não** fica na rota, porque depende do recurso: \`if (tarefa.donoId !== req.usuario.id) throw new ErroHttp(403, 'Sem permissão')\`.

Um aviso honesto: aqui as sessões vivem num objeto e o token é um texto fixo. Num sistema real o token é gerado no login, tem validade, e a senha nunca é guardada como está. Isso é assunto da trilha de segurança web; o formato da corrente, do cabeçalho e dos dois status é o mesmo.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `const express = require('express');
const app = express();

// Registra todo pedido, e passa adiante.
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.path);
  next();
});
app.use(express.json());

const sessoes = { 'token-da-ana': { id: 1, nome: 'Ana' } };

function exigirLogin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const usuario = sessoes[token];
  if (!usuario) return res.status(401).json({ erro: 'Não autenticado' });
  req.usuario = usuario;
  next();
}

app.get('/ping', (req, res) => res.send('pong'));                          // aberta
app.get('/perfil', exigirLogin, (req, res) => res.json(req.usuario));       // exige login
app.use('/admin', exigirLogin);                                             // tudo em /admin exige
app.get('/admin/painel', (req, res) => res.json({ ola: req.usuario.nome }));

app.listen(3000);`,
      caption:
        'A corrente: registro para todos, JSON para todos, e o exigirLogin só onde a rota pede — por rota, ou por prefixo. O req.usuario que o middleware preenche é o que a rota lê.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-6-registro',
        type: 'server',
        prompt:
          'Escreva um middleware, antes das rotas, que guarda cada pedido na lista `registros` como texto `"MÉTODO /caminho"` (por exemplo `"GET /ping"`) — e deixa o pedido seguir.',
        concepts: ['node-middleware'],
        difficulty: 'iniciante',
        tags: ['node', 'express', 'middleware', 'next'],
        initialCode: `const express = require('express');
const app = express();

const registros = [];

// O middleware de registro: guarda "MÉTODO /caminho" em registros e segue.

app.get('/ping', (req, res) => res.send('pong'));
app.post('/tarefas', (req, res) => res.status(201).json({ ok: true }));
app.get('/registros', (req, res) => res.json(registros));

app.listen(3000);
`,
        tests: [
          {
            description: 'Depois de GET /ping e POST /tarefas, GET /registros começa com os dois',
            assertion: `await pedir(app, 'GET', '/ping');
await pedir(app, 'POST', '/tarefas', { body: {} });
const res = await pedir(app, 'GET', '/registros');
if (!Array.isArray(res.body)) throw new Error('GET /registros deveria responder a lista, veio ' + res.status + ' ' + res.texto);
if (res.body[0] !== 'GET /ping' || res.body[1] !== 'POST /tarefas') throw new Error('esperava ["GET /ping","POST /tarefas", …], veio ' + res.texto + ' — o texto é req.method, um espaço, req.path');`,
          },
          {
            description: 'As rotas continuam respondendo: o middleware chama next()',
            assertion: `const res = await pedir(app, 'GET', '/ping');
if (res.status !== 200 || res.texto !== 'pong') throw new Error('GET /ping respondeu ' + res.status + ' "' + res.texto + '"; esperava 200 "pong" — depois de registrar, o middleware precisa chamar next()');`,
          },
        ],
        solution: `const express = require('express');
const app = express();

const registros = [];

app.use((req, res, next) => {
  registros.push(req.method + ' ' + req.path);
  next();
});

app.get('/ping', (req, res) => res.send('pong'));
app.post('/tarefas', (req, res) => res.status(201).json({ ok: true }));
app.get('/registros', (req, res) => res.json(registros));

app.listen(3000);`,
        hints: [
          '`app.use((req, res, next) => { … })`, antes do primeiro `app.get`.',
          'Dentro: `registros.push(req.method + " " + req.path)` — e `next()`, senão nenhuma rota responde.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-6-corrente',
        type: 'predict-output',
        prompt:
          'O que este programa imprime, e em que ordem? A última linha é o cliente dos exercícios pedindo `GET /ping` e imprimindo o texto da resposta.',
        concepts: ['node-middleware'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'middleware', 'ordem'],
        code: `const express = require('express');
const app = express();

app.use((req, res, next) => {
  console.log('1: chegou ' + req.method + ' ' + req.path);
  next();
});

app.get('/ping', (req, res) => {
  console.log('2: a rota responde');
  res.send('pong');
});

app.use((req, res, next) => {
  console.log('3: depois da rota');
  next();
});

pedir(app, 'GET', '/ping').then((r) => console.log('4: ' + r.texto));`,
        expectedOutput: `1: chegou GET /ping
2: a rota responde
4: pong`,
        explanation:
          'O primeiro middleware registra e chama `next()`; a rota casa, responde — e **responder encerra a corrente**. O terceiro middleware, registrado depois da rota, nunca é alcançado para este pedido. Ele só rodaria para um caminho que nenhuma rota anterior respondesse — é assim que se faz um 404 personalizado, aliás.',
        hints: ['Depois que uma camada responde, o Express ainda chama as seguintes?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-6-401-403',
        type: 'multiple-choice',
        prompt:
          'A Ana está logada, com um token válido, e pede `DELETE /tarefas/7` — uma tarefa que é da Bia. Qual status o servidor deve responder?',
        concepts: ['node-middleware'],
        difficulty: 'iniciante',
        tags: ['node', 'http', 'autenticacao', '403'],
        options: [
          '`403`: o servidor sabe quem é a Ana, e ela não tem permissão sobre a tarefa da Bia',
          '`401`: qualquer recusa de acesso é "não autenticado"',
          '`404`: para a Ana, a tarefa da Bia não existe',
          '`400`: o pedido está errado, porque o id não é dela',
        ],
        correctIndex: 0,
        explanation:
          '`401` é "não sei quem você é" — e o servidor sabe: o token é válido. O problema é de **permissão**, e isso é `403`. A diferença importa para a página: num 401 ela manda para o login; num 403 ela mostra "você não pode fazer isso", porque logar de novo não resolveria.',
        hints: ['O servidor conseguiu identificar quem pediu? Então o problema não é de identificação.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-6-exigir-login',
        type: 'server',
        prompt:
          'Complete o `exigirLogin`: leia o cabeçalho `Authorization` (formato `Bearer <token>`), procure o token em `sessoes`; sem sessão, responda **401** com `{ erro: "Não autenticado" }`; com sessão, guarde o usuário em `req.usuario` e siga. `GET /perfil` já usa o middleware; `GET /ping` continua aberta.',
        concepts: ['node-middleware'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'autenticacao', '401'],
        initialCode: `const express = require('express');
const app = express();

const sessoes = {
  'token-da-ana': { id: 1, nome: 'Ana' },
  'token-do-caio': { id: 2, nome: 'Caio' },
};

function exigirLogin(req, res, next) {
  // Ler o cabeçalho, achar a sessão, 401 ou req.usuario + next().
  next();
}

app.get('/ping', (req, res) => res.send('pong'));
app.get('/perfil', exigirLogin, (req, res) => res.json(req.usuario));

app.listen(3000);
`,
        tests: [
          {
            description: 'GET /perfil sem cabeçalho responde 401 com { erro: "Não autenticado" }',
            assertion: `const res = await pedir(app, 'GET', '/perfil');
if (res.status !== 401 || !res.body || res.body.erro !== 'Não autenticado') throw new Error('GET /perfil sem token respondeu ' + res.status + ' ' + res.texto + '; esperava 401 {"erro":"Não autenticado"}');`,
          },
          {
            description: 'Um token que não existe também recebe 401',
            assertion: `const res = await pedir(app, 'GET', '/perfil', { headers: { Authorization: 'Bearer token-falso' } });
if (res.status !== 401) throw new Error('GET /perfil com token inválido respondeu ' + res.status + ' ' + res.texto + '; esperava 401 — só tokens que estão em sessoes valem');`,
          },
          {
            description: 'Com o token da Ana, GET /perfil responde { id: 1, nome: "Ana" }; com o do Caio, o Caio',
            assertion: `const ana = await pedir(app, 'GET', '/perfil', { headers: { Authorization: 'Bearer token-da-ana' } });
if (ana.status !== 200 || !ana.body || ana.body.nome !== 'Ana') throw new Error('GET /perfil com o token da Ana respondeu ' + ana.status + ' ' + ana.texto + '; esperava 200 {"id":1,"nome":"Ana"} — o cabeçalho chega em req.headers.authorization, em minúsculas, e tem o "Bearer " na frente');
const caio = await pedir(app, 'GET', '/perfil', { headers: { Authorization: 'Bearer token-do-caio' } });
if (!caio.body || caio.body.nome !== 'Caio') throw new Error('GET /perfil com o token do Caio respondeu ' + caio.texto + '; esperava o Caio');`,
          },
          {
            description: 'GET /ping continua aberta: 200 sem token',
            assertion: `const res = await pedir(app, 'GET', '/ping');
if (res.status !== 200 || res.texto !== 'pong') throw new Error('GET /ping respondeu ' + res.status + '; esperava 200 "pong" — o exigirLogin é só da rota /perfil');`,
          },
        ],
        solution: `const express = require('express');
const app = express();

const sessoes = {
  'token-da-ana': { id: 1, nome: 'Ana' },
  'token-do-caio': { id: 2, nome: 'Caio' },
};

function exigirLogin(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.replace('Bearer ', '');
  const usuario = sessoes[token];
  if (!usuario) return res.status(401).json({ erro: 'Não autenticado' });
  req.usuario = usuario;
  next();
}

app.get('/ping', (req, res) => res.send('pong'));
app.get('/perfil', exigirLogin, (req, res) => res.json(req.usuario));

app.listen(3000);`,
        hints: [
          'O cabeçalho está em `req.headers.authorization` (minúsculas), e pode não existir: `|| ""` antes de mexer nele.',
          'Tire o prefixo com `.replace("Bearer ", "")` e procure: `sessoes[token]`.',
          'Sem usuário: `return res.status(401).json({ erro: "Não autenticado" })`. Com: `req.usuario = usuario; next()`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-6-lacuna',
        type: 'fill-blank',
        prompt: 'Complete o middleware de login e a rota que o usa.',
        concepts: ['node-middleware'],
        difficulty: 'iniciante',
        tags: ['node', 'express', 'autenticacao'],
        template: `const express = require('express');
const app = express();

const sessoes = { abc123: { id: 1, nome: 'Ana' } };

function exigirLogin(req, res, next) {
  const cabecalho = req.headers.{{1}} || '';
  const token = cabecalho.replace('Bearer ', '');
  const usuario = sessoes[token];
  if (!usuario) return res.status({{2}}).json({ erro: 'Não autenticado' });
  req.usuario = usuario;
  {{3}}();
}

app.get('/perfil', {{4}}, (req, res) => res.json(req.usuario));

app.listen(3000);`,
        blanks: [
          { placeholder: 'cabeçalho', size: 14 },
          { placeholder: 'status', size: 4 },
          { placeholder: 'seguir', size: 5 },
          { placeholder: 'middleware', size: 12 },
        ],
        tests: [
          {
            description: 'GET /perfil sem token responde 401',
            assertion: `const res = await pedir(app, 'GET', '/perfil');
if (res.status !== 401) throw new Error('GET /perfil sem token respondeu ' + res.status + '; esperava 401 (não autenticado)');`,
          },
          {
            description: 'GET /perfil com "Bearer abc123" responde a Ana',
            assertion: `const res = await pedir(app, 'GET', '/perfil', { headers: { Authorization: 'Bearer abc123' } });
if (res.status !== 200 || !res.body || res.body.nome !== 'Ana') throw new Error('GET /perfil com o token respondeu ' + res.status + ' ' + res.texto + '; esperava 200 com a Ana');`,
          },
        ],
        explanation:
          'O cabeçalho chega em minúsculas em `req.headers`; sem sessão é 401, "não sei quem você é"; com sessão, o middleware preenche o `req` e chama `next()` para a rota rodar; e a rota declara o middleware entre o caminho e a função.',
        solution: ['authorization', '401', 'next', 'exigirLogin'],
        hints: [
          'Os nomes dos cabeçalhos chegam em `req.headers` todos em minúsculas.',
          'O status de "não sei quem você é" está na tabela da aula passada; a função que passa adiante é o terceiro parâmetro; e na rota vai o nome da função de cima, entre o caminho e a resposta.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-6-ordem',
        type: 'order-steps',
        prompt:
          'Coloque na ordem o arquivo de um servidor com registro de pedidos, JSON, uma área `/admin` protegida e o tratamento de erros.',
        concepts: ['node-middleware'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'middleware', 'ordem'],
        steps: [
          { id: 'app', text: '`const app = express();`', ordem: 1 },
          { id: 'registro', text: '`app.use(registrar);` — todo pedido é registrado', ordem: 2 },
          { id: 'json', text: '`app.use(express.json());` — todo corpo é lido', ordem: 2 },
          { id: 'guarda', text: "`app.use('/admin', exigirLogin);` — daqui em diante, /admin exige login", ordem: 3 },
          { id: 'painel', text: "`app.get('/admin/painel', (req, res) => res.json({ ola: req.usuario.nome }));`", ordem: 4 },
          { id: 'erro', text: '`app.use((erro, req, res, next) => { … });` — o middleware de erro', ordem: 5 },
          { id: 'listen', text: '`app.listen(3000);`', ordem: 6 },
        ],
        explanation:
          'Os middlewares gerais (registro e JSON) vêm antes de tudo, em qualquer ordem entre si. O `exigirLogin` de `/admin` precisa vir **antes** da rota `/admin/painel`, senão a rota responde sem passar por ele — e `req.usuario` nem existiria. O middleware de erro vai por último, porque o erro caminha para a frente. O `listen` fecha.',
        hints: [
          'O que precisa acontecer com um pedido antes de qualquer rota vê-lo? E o que só faz sentido depois de todas?',
          'A guarda de `/admin` tem que vir antes da rota que ela protege.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-6-dono',
        type: 'server',
        prompt:
          'O `exigirLogin` está pronto. Escreva `GET /tarefas/:id`, protegida por ele: se a tarefa não existe, **404** `{ erro: "Tarefa não encontrada" }`; se existe mas o `donoId` não é o do usuário logado, **403** `{ erro: "Sem permissão" }`; senão, a tarefa.',
        concepts: ['node-middleware', 'node-erros'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'autenticacao', '403', '404'],
        initialCode: `const express = require('express');
const app = express();

const sessoes = {
  'token-da-ana': { id: 1, nome: 'Ana' },
  'token-da-bia': { id: 2, nome: 'Bia' },
};

const tarefas = [
  { id: 1, titulo: 'Estudar Node', donoId: 1 },
  { id: 2, titulo: 'Revisar SQL', donoId: 2 },
];

function exigirLogin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const usuario = sessoes[token];
  if (!usuario) return res.status(401).json({ erro: 'Não autenticado' });
  req.usuario = usuario;
  next();
}

// GET /tarefas/:id, com exigirLogin: 404, 403 ou a tarefa.

app.listen(3000);
`,
        tests: [
          {
            description: 'Sem token, GET /tarefas/1 responde 401',
            assertion: `const res = await pedir(app, 'GET', '/tarefas/1');
if (res.status !== 401) throw new Error('GET /tarefas/1 sem token respondeu ' + res.status + ' ' + res.texto + '; esperava 401 — a rota precisa passar pelo exigirLogin');`,
          },
          {
            description: 'A Ana vê a própria tarefa (200)',
            assertion: `const res = await pedir(app, 'GET', '/tarefas/1', { headers: { Authorization: 'Bearer token-da-ana' } });
if (res.status !== 200 || !res.body || res.body.titulo !== 'Estudar Node') throw new Error('a Ana pedindo a tarefa 1 (dela) recebeu ' + res.status + ' ' + res.texto + '; esperava 200 com a tarefa');`,
          },
          {
            description: 'A Ana pedindo a tarefa da Bia recebe 403 com { erro: "Sem permissão" }',
            assertion: `const res = await pedir(app, 'GET', '/tarefas/2', { headers: { Authorization: 'Bearer token-da-ana' } });
if (res.status !== 403 || !res.body || res.body.erro !== 'Sem permissão') throw new Error('a Ana pedindo a tarefa 2 (da Bia) recebeu ' + res.status + ' ' + res.texto + '; esperava 403 {"erro":"Sem permissão"} — compare tarefa.donoId com req.usuario.id');`,
          },
          {
            description: 'Uma tarefa que não existe é 404, mesmo logado',
            assertion: `const res = await pedir(app, 'GET', '/tarefas/9', { headers: { Authorization: 'Bearer token-da-bia' } });
if (res.status !== 404 || !res.body || res.body.erro !== 'Tarefa não encontrada') throw new Error('GET /tarefas/9 respondeu ' + res.status + ' ' + res.texto + '; esperava 404 {"erro":"Tarefa não encontrada"}');`,
          },
        ],
        solution: `const express = require('express');
const app = express();

const sessoes = {
  'token-da-ana': { id: 1, nome: 'Ana' },
  'token-da-bia': { id: 2, nome: 'Bia' },
};

const tarefas = [
  { id: 1, titulo: 'Estudar Node', donoId: 1 },
  { id: 2, titulo: 'Revisar SQL', donoId: 2 },
];

function exigirLogin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const usuario = sessoes[token];
  if (!usuario) return res.status(401).json({ erro: 'Não autenticado' });
  req.usuario = usuario;
  next();
}

app.get('/tarefas/:id', exigirLogin, (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  if (tarefa.donoId !== req.usuario.id) return res.status(403).json({ erro: 'Sem permissão' });
  res.json(tarefa);
});

app.listen(3000);`,
        hints: [
          'A rota declara o middleware: `app.get("/tarefas/:id", exigirLogin, (req, res) => { … })`.',
          'Primeiro o 404 (existe?), depois o 403 (é de quem pediu? `tarefa.donoId !== req.usuario.id`), e só então a tarefa.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Um middleware é \`(req, res, next)\`: ou **responde** e a corrente acaba, ou chama **\`next()\`** e passa adiante. Nem um nem outro é um pedido pendurado. A ordem de registro é a ordem da corrente — os gerais antes das rotas, o de erro por último.

O \`req\` atravessa a corrente inteira, e é nele que um middleware deixa o que descobriu: \`req.body\`, \`req.usuario\`. Registrar em \`app.use\` é para todos; \`app.use('/admin', fn)\` para um prefixo; \`app.get(caminho, fn, rota)\` para uma rota só — e é a forma que mais conta ao leitor.

A autenticação lê \`Authorization: Bearer <token>\` (em \`req.headers.authorization\`, minúsculas), acha a sessão e preenche \`req.usuario\`, ou responde **\`401\`**: não sei quem é. Quem é conhecido mas não pode recebe **\`403\`** — e isso se decide na rota, olhando o recurso.

Na próxima aula, o resto do CRUD: **\`PUT\`, \`PATCH\` e \`DELETE\`**, o \`204\`, e o que "idempotente" quer dizer na prática.
`.trim(),
    },
  ],
};

import type { Lesson } from '../types';

export const lessonNodeRotas: Lesson = {
  id: 'lesson-node-3',
  trackId: 'track-node',
  title: 'Rotas e Parâmetros',
  language: 'node',
  objective:
    'Ler o que vem no caminho (`/aulas/7`) e na consulta (`?feita=true`), responder 404 para o que não existe, e organizar as rotas por recurso.',
  concepts: ['node-rotas'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Uma API real não é uma lista de caminhos fixos. Ela tem **recursos** — aulas, alunos, pedidos — e cada recurso tem uma família de rotas: a lista, um item específico, filtros. O caminho carrega informação: \`/aulas/7\` é "a aula 7", \`/aulas?feita=true\` é "as aulas feitas". Hoje você aprende a ler isso.

## Parâmetros de rota: \`req.params\`

Um segmento do caminho que começa com \`:\` é um **parâmetro**: casa com qualquer valor e o entrega em \`req.params\`.

~~~js
app.get('/aulas/:id', (req, res) => {
  const id = Number(req.params.id);
  res.json({ id });
});
~~~

\`GET /aulas/7\` cai nessa rota com \`req.params.id === '7'\`. Repare no \`Number\`: **tudo que vem do caminho é texto**, e \`'7' === 7\` é falso — uma busca com \`find((a) => a.id === req.params.id)\` nunca encontra nada. Converter na entrada é o hábito que evita esse erro para sempre.

O nome depois do \`:\` é seu: \`:id\`, \`:codigo\`, \`:slug\`. Ele só precisa ser o mesmo no caminho e no \`req.params\`.

## Parâmetros de consulta: \`req.query\`

O que vem depois do \`?\` — \`?feita=true&ordem=titulo\` — não faz parte da rota. É a **consulta** (query string): pares chave=valor, separados por \`&\`, que o Express entrega em \`req.query\`.

~~~js
app.get('/aulas', (req, res) => {
  const feita = req.query.feita; // 'true', 'false' ou undefined
  const lista = feita === undefined ? aulas : aulas.filter((a) => String(a.feita) === feita);
  res.json(lista);
});
~~~

A rota continua sendo \`/aulas\`: \`/aulas?feita=true\` e \`/aulas\` caem na mesma função, e a diferença está em \`req.query\`. A regra prática: **o que identifica** vai no caminho (\`/aulas/7\`); **o que filtra, ordena ou pagina** vai na consulta (\`?feita=true\`).

E de novo: tudo texto. \`req.query.pagina\` é \`'2'\`, não \`2\`; \`req.query.feita\` é \`'true'\`, não \`true\`.

## O que não existe: 404

\`/aulas/999\` cai na rota \`/aulas/:id\`, mas a aula 999 não existe. A rota **existe**; o recurso, não. A resposta certa é \`404\` com uma explicação:

~~~js
app.get('/aulas/:id', (req, res) => {
  const aula = aulas.find((a) => a.id === Number(req.params.id));
  if (!aula) {
    return res.status(404).json({ erro: 'Aula não encontrada' });
  }
  res.json(aula);
});
~~~

Duas coisas aqui. \`res.status(404)\` define o status e devolve o \`res\`, por isso se encadeia com \`.json(…)\`. E o **\`return\`**: sem ele, a função continuaria para o \`res.json(aula)\` de baixo e tentaria responder duas vezes — o Express reclama, e quem pediu recebe lixo. *Respondeu, saiu.*

Responder \`200\` com \`null\` ou com um objeto vazio quando algo não existe é um erro comum: a página do outro lado não tem como distinguir "não existe" de "existe e está vazio". O status é a informação.

## A ordem das rotas

O Express testa as rotas **na ordem em que foram registradas** e usa a primeira que casar. Isso importa quando um caminho fixo e um parâmetro competem:

~~~js
app.get('/aulas/:id', …);    // casa com /aulas/novas também!
app.get('/aulas/novas', …);  // nunca é alcançada
~~~

\`/aulas/novas\` casa com \`/aulas/:id\` (com \`id === 'novas'\`) antes de chegar à rota fixa. A solução é registrar as rotas **fixas antes** das rotas **com parâmetro**.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `const express = require('express');
const app = express();

const alunos = [
  { id: 1, nome: 'Ana', turma: 'manha' },
  { id: 2, nome: 'Bia', turma: 'noite' },
  { id: 3, nome: 'Caio', turma: 'manha' },
];

// A lista, com filtro opcional pela consulta: /alunos?turma=manha
app.get('/alunos', (req, res) => {
  const { turma } = req.query;
  res.json(turma ? alunos.filter((a) => a.turma === turma) : alunos);
});

// Um aluno pelo caminho: /alunos/2 — e 404 quando não existe.
app.get('/alunos/:id', (req, res) => {
  const aluno = alunos.find((a) => a.id === Number(req.params.id));
  if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado' });
  res.json(aluno);
});

app.listen(3000);`,
      caption:
        'Um recurso, duas rotas: a lista (com filtro pela query) e o item (pelo parâmetro). Number(req.params.id) porque o caminho é texto; return no 404 porque respondeu, saiu.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-3-params',
        type: 'server',
        prompt:
          'Escreva `GET /aulas/:id` que devolve, em JSON, a aula com aquele `id` da lista `aulas`. O `id` do caminho chega como texto: converta antes de comparar.',
        concepts: ['node-rotas'],
        difficulty: 'iniciante',
        tags: ['node', 'express', 'params'],
        initialCode: `const express = require('express');
const app = express();

const aulas = [
  { id: 1, titulo: 'Variáveis', minutos: 20 },
  { id: 2, titulo: 'Condições', minutos: 25 },
  { id: 3, titulo: 'Loops', minutos: 30 },
];

// GET /aulas/:id → a aula com aquele id.

app.listen(3000);
`,
        tests: [
          {
            description: 'GET /aulas/2 responde 200 com a aula "Condições"',
            assertion: `const res = await pedir(app, 'GET', '/aulas/2');
if (res.status !== 200) throw new Error('GET /aulas/2 respondeu ' + res.status + '; esperava 200. Corpo: ' + res.texto);
if (!res.body || res.body.titulo !== 'Condições') throw new Error('esperava a aula "Condições", veio ' + res.texto + (res.texto === 'null' || res.texto === '' ? ' — compare Number(req.params.id) com o id, não o texto' : ''));`,
          },
          {
            description: 'GET /aulas/3 responde a aula "Loops", com os 30 minutos',
            assertion: `const res = await pedir(app, 'GET', '/aulas/3');
if (!res.body || res.body.titulo !== 'Loops' || res.body.minutos !== 30) throw new Error('esperava {titulo: "Loops", minutos: 30}, veio ' + res.texto);`,
          },
        ],
        solution: `const express = require('express');
const app = express();

const aulas = [
  { id: 1, titulo: 'Variáveis', minutos: 20 },
  { id: 2, titulo: 'Condições', minutos: 25 },
  { id: 3, titulo: 'Loops', minutos: 30 },
];

app.get('/aulas/:id', (req, res) => {
  const aula = aulas.find((a) => a.id === Number(req.params.id));
  res.json(aula);
});

app.listen(3000);`,
        hints: [
          'O caminho é `/aulas/:id`; o valor chega em `req.params.id`.',
          'Procure com `aulas.find((a) => a.id === Number(req.params.id))`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-3-texto',
        type: 'multiple-choice',
        prompt:
          'Em `GET /aulas/7`, a rota `app.get("/aulas/:id", …)` faz `aulas.find((a) => a.id === req.params.id)` e nunca encontra a aula 7, que existe. Por quê?',
        concepts: ['node-rotas'],
        difficulty: 'iniciante',
        tags: ['node', 'params', 'tipos'],
        options: [
          'Porque `req.params.id` é o texto `"7"`, e `"7" === 7` é falso — tudo que vem do caminho é texto e precisa ser convertido',
          'Porque `find` não funciona dentro de rotas do Express',
          'Porque o parâmetro deveria se chamar `:aulaId` para casar com a lista',
          'Porque o `find` precisa de `await`, já que a rota é assíncrona',
        ],
        correctIndex: 0,
        explanation:
          'O caminho de uma URL é texto, então `req.params.id` é `"7"`. A comparação estrita com o número 7 falha. `Number(req.params.id)` na entrada resolve — e é o hábito que evita esse defeito em toda rota com parâmetro.',
        hints: ['Qual é o tipo de `req.params.id`? E o de `a.id`?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-3-404',
        type: 'server',
        prompt:
          'Complete `GET /aulas/:id`: quando a aula não existe, responda **404** com `{ erro: "Aula não encontrada" }` — e não continue para o `res.json` de baixo.',
        concepts: ['node-rotas'],
        difficulty: 'iniciante',
        tags: ['node', 'express', '404', 'status'],
        initialCode: `const express = require('express');
const app = express();

const aulas = [
  { id: 1, titulo: 'Variáveis' },
  { id: 2, titulo: 'Condições' },
];

app.get('/aulas/:id', (req, res) => {
  const aula = aulas.find((a) => a.id === Number(req.params.id));
  // Se não achou: 404 com { erro: 'Aula não encontrada' }.
  res.json(aula);
});

app.listen(3000);
`,
        tests: [
          {
            description: 'GET /aulas/1 continua respondendo 200 com a aula',
            assertion: `const res = await pedir(app, 'GET', '/aulas/1');
if (res.status !== 200 || !res.body || res.body.titulo !== 'Variáveis') throw new Error('GET /aulas/1 respondeu ' + res.status + ' ' + res.texto + '; esperava 200 com a aula "Variáveis"');`,
          },
          {
            description: 'GET /aulas/99 responde 404 com { erro: "Aula não encontrada" }',
            assertion: `const res = await pedir(app, 'GET', '/aulas/99');
if (res.status !== 404) throw new Error('GET /aulas/99 respondeu ' + res.status + '; esperava 404. Corpo: ' + res.texto);
if (!res.body || res.body.erro !== 'Aula não encontrada') throw new Error('o corpo do 404 deveria ser {"erro":"Aula não encontrada"}, veio ' + res.texto);`,
          },
        ],
        solution: `const express = require('express');
const app = express();

const aulas = [
  { id: 1, titulo: 'Variáveis' },
  { id: 2, titulo: 'Condições' },
];

app.get('/aulas/:id', (req, res) => {
  const aula = aulas.find((a) => a.id === Number(req.params.id));
  if (!aula) {
    return res.status(404).json({ erro: 'Aula não encontrada' });
  }
  res.json(aula);
});

app.listen(3000);`,
        hints: [
          '`if (!aula) { … }` antes do `res.json(aula)`.',
          '`res.status(404).json({ erro: "Aula não encontrada" })` — e `return`, para não responder duas vezes.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-3-query',
        type: 'server',
        prompt:
          'Escreva `GET /aulas`, que devolve a lista inteira — ou, quando vier `?nivel=…` na consulta, só as aulas daquele nível. Sem o parâmetro, tudo; com um nível que ninguém tem, uma lista vazia (isso não é erro).',
        concepts: ['node-rotas'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'query'],
        initialCode: `const express = require('express');
const app = express();

const aulas = [
  { id: 1, titulo: 'Variáveis', nivel: 'iniciante' },
  { id: 2, titulo: 'Closures', nivel: 'intermediario' },
  { id: 3, titulo: 'Loops', nivel: 'iniciante' },
  { id: 4, titulo: 'Promises', nivel: 'intermediario' },
];

// GET /aulas, com filtro opcional por ?nivel=

app.listen(3000);
`,
        tests: [
          {
            description: 'GET /aulas devolve as 4 aulas',
            assertion: `const res = await pedir(app, 'GET', '/aulas');
if (res.status !== 200 || !Array.isArray(res.body) || res.body.length !== 4) throw new Error('GET /aulas respondeu ' + res.status + ' ' + res.texto + '; esperava as 4 aulas');`,
          },
          {
            description: 'GET /aulas?nivel=iniciante devolve só Variáveis e Loops',
            assertion: `const res = await pedir(app, 'GET', '/aulas?nivel=iniciante');
const titulos = Array.isArray(res.body) ? res.body.map((a) => a.titulo) : res.texto;
if (JSON.stringify(titulos) !== '["Variáveis","Loops"]') throw new Error('esperava ["Variáveis","Loops"], veio ' + JSON.stringify(titulos));`,
          },
          {
            description: 'GET /aulas?nivel=avancado devolve uma lista vazia com 200',
            assertion: `const res = await pedir(app, 'GET', '/aulas?nivel=avancado');
if (res.status !== 200 || JSON.stringify(res.body) !== '[]') throw new Error('esperava 200 com [], veio ' + res.status + ' ' + res.texto + ' — filtro sem resultado é lista vazia, não erro');`,
          },
        ],
        solution: `const express = require('express');
const app = express();

const aulas = [
  { id: 1, titulo: 'Variáveis', nivel: 'iniciante' },
  { id: 2, titulo: 'Closures', nivel: 'intermediario' },
  { id: 3, titulo: 'Loops', nivel: 'iniciante' },
  { id: 4, titulo: 'Promises', nivel: 'intermediario' },
];

app.get('/aulas', (req, res) => {
  const { nivel } = req.query;
  if (nivel === undefined) return res.json(aulas);
  res.json(aulas.filter((a) => a.nivel === nivel));
});

app.listen(3000);`,
        hints: [
          'O valor de `?nivel=iniciante` chega em `req.query.nivel`; sem o parâmetro, é `undefined`.',
          'Com o nível, `aulas.filter((a) => a.nivel === nivel)`; sem ele, a lista inteira.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-3-ordem',
        type: 'multiple-choice',
        prompt:
          'As rotas foram registradas nesta ordem: `app.get("/aulas/:id", …)` e depois `app.get("/aulas/novas", …)`. `GET /aulas/novas` responde 404 com "Aula não encontrada". Por quê?',
        concepts: ['node-rotas'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'rotas', 'ordem'],
        options: [
          'Porque `/aulas/novas` casa com `/aulas/:id` (com `id === "novas"`), que foi registrada primeiro — e `Number("novas")` é `NaN`, então nada é encontrado; as rotas fixas precisam vir antes das com parâmetro',
          'Porque o Express não aceita duas rotas que começam com `/aulas`',
          'Porque "novas" tem letras, e parâmetros só aceitam números',
          'Porque a rota `/aulas/novas` precisa de `:novas` para funcionar',
        ],
        correctIndex: 0,
        explanation:
          'O Express testa as rotas na ordem em que foram registradas e usa a primeira que casar. Um parâmetro casa com qualquer valor, inclusive "novas". A solução é registrar `/aulas/novas` antes de `/aulas/:id`.',
        hints: ['Com qual das duas rotas o caminho `/aulas/novas` casa primeiro?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-3-sem-parenteses',
        type: 'find-bug',
        prompt:
          'Este servidor quebra antes de subir: "app.get is not a function". Aponte a linha com o defeito.',
        concepts: ['node-rotas'],
        difficulty: 'iniciante',
        tags: ['node', 'express', 'bug'],
        code: `const express = require('express');
const app = express;

app.get('/aulas', (req, res) => {
  res.json([]);
});

app.listen(3000);`,
        buggyLine: 2,
        fix: 'const app = express();',
        symptomLine: 4,
        symptomFeedback:
          'É aqui que o erro aparece — `app.get` não é uma função —, mas esta linha está certa. O `app` é que não é uma aplicação: veja como ele foi criado.',
        explanation:
          '`express` é a função que **cria** a aplicação; sem os parênteses, `app` recebe a própria função, e a função não tem `.get`. `const app = express()` chama a fábrica e guarda a aplicação. É o mesmo erro de esquecer os parênteses em qualquer chamada.',
        hints: ['`app` deveria ser o resultado de chamar `express`. Ele foi chamado?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-3-recurso',
        type: 'server',
        prompt:
          'Monte o recurso `/produtos` completo, para leitura: `GET /produtos` (lista; com `?categoria=` filtra), `GET /produtos/em-estoque` (só os com `estoque > 0`) e `GET /produtos/:id` (um produto, ou 404 com `{ erro: "Produto não encontrado" }`). Cuidado com a ordem das rotas.',
        concepts: ['node-rotas'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'recurso', 'rotas'],
        initialCode: `const express = require('express');
const app = express();

const produtos = [
  { id: 1, nome: 'Caderno', categoria: 'papelaria', estoque: 12 },
  { id: 2, nome: 'Caneta', categoria: 'papelaria', estoque: 0 },
  { id: 3, nome: 'Fone', categoria: 'eletronicos', estoque: 4 },
];

// As três rotas do recurso.

app.listen(3000);
`,
        tests: [
          {
            description: 'GET /produtos devolve os 3; GET /produtos?categoria=papelaria devolve 2',
            assertion: `const todos = await pedir(app, 'GET', '/produtos');
if (!Array.isArray(todos.body) || todos.body.length !== 3) throw new Error('GET /produtos: esperava 3 produtos, veio ' + todos.texto);
const pap = await pedir(app, 'GET', '/produtos?categoria=papelaria');
if (!Array.isArray(pap.body) || pap.body.length !== 2) throw new Error('GET /produtos?categoria=papelaria: esperava 2, veio ' + pap.texto);`,
          },
          {
            description: 'GET /produtos/em-estoque devolve Caderno e Fone — não cai na rota de :id',
            assertion: `const res = await pedir(app, 'GET', '/produtos/em-estoque');
const nomes = Array.isArray(res.body) ? res.body.map((p) => p.nome) : res.texto;
if (JSON.stringify(nomes) !== '["Caderno","Fone"]') throw new Error('esperava ["Caderno","Fone"], veio ' + res.status + ' ' + JSON.stringify(nomes) + (res.status === 404 ? ' — a rota fixa precisa vir antes de /produtos/:id' : ''));`,
          },
          {
            description: 'GET /produtos/3 devolve o Fone; GET /produtos/9 devolve 404 com a mensagem',
            assertion: `const um = await pedir(app, 'GET', '/produtos/3');
if (!um.body || um.body.nome !== 'Fone') throw new Error('GET /produtos/3: esperava o Fone, veio ' + um.texto);
const nada = await pedir(app, 'GET', '/produtos/9');
if (nada.status !== 404 || !nada.body || nada.body.erro !== 'Produto não encontrado') throw new Error('GET /produtos/9: esperava 404 {"erro":"Produto não encontrado"}, veio ' + nada.status + ' ' + nada.texto);`,
          },
        ],
        solution: `const express = require('express');
const app = express();

const produtos = [
  { id: 1, nome: 'Caderno', categoria: 'papelaria', estoque: 12 },
  { id: 2, nome: 'Caneta', categoria: 'papelaria', estoque: 0 },
  { id: 3, nome: 'Fone', categoria: 'eletronicos', estoque: 4 },
];

app.get('/produtos', (req, res) => {
  const { categoria } = req.query;
  res.json(categoria ? produtos.filter((p) => p.categoria === categoria) : produtos);
});

app.get('/produtos/em-estoque', (req, res) => {
  res.json(produtos.filter((p) => p.estoque > 0));
});

app.get('/produtos/:id', (req, res) => {
  const produto = produtos.find((p) => p.id === Number(req.params.id));
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  res.json(produto);
});

app.listen(3000);`,
        hints: [
          'Três `app.get`: `/produtos`, `/produtos/em-estoque` e `/produtos/:id` — nessa ordem.',
          'Na lista, `req.query.categoria` filtra quando existe.',
          'No item, `Number(req.params.id)` e o 404 com `return`.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
O caminho carrega informação. \`:id\` na rota vira \`req.params.id\`; o que vem depois do \`?\` vira \`req.query\`. **O que identifica** vai no caminho; **o que filtra** vai na consulta. E tudo isso chega como **texto** — \`Number(…)\` na entrada.

Rota que existe para um recurso que não existe responde **404** com uma explicação, e sai com \`return\` — respondeu, saiu. Filtro sem resultado é lista vazia com 200, não erro.

As rotas são testadas **na ordem** em que foram registradas: as fixas (\`/aulas/novas\`) antes das com parâmetro (\`/aulas/:id\`).

Na próxima aula, o outro sentido: dados que chegam **no corpo** do pedido — \`POST\`, JSON e o \`express.json()\`.
`.trim(),
    },
  ],
};

import type { Lesson } from '../types';

export const lessonNodeCrud: Lesson = {
  id: 'lesson-node-7',
  trackId: 'track-node',
  title: 'CRUD: Alterar e Apagar',
  language: 'node',
  objective:
    'Completar o recurso com `PUT`, `PATCH` e `DELETE` — o que cada um muda, o `204` sem corpo, o `404` de sempre — e entender o que "idempotente" quer dizer na prática.',
  concepts: ['node-crud'],
  status: 'published',
  estimatedMinutes: 35,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Ler e criar você já faz. Falta o resto do ciclo de vida de um recurso: **alterar** e **apagar**. Com eles, o recurso fica completo — é o famoso CRUD, *create, read, update, delete* — e todo recurso de toda API que você vai escrever segue o mesmo desenho.

## O desenho de um recurso

| Pedido | Faz | Responde |
| --- | --- | --- |
| \`GET /tarefas\` | lista | \`200\` + a lista |
| \`GET /tarefas/:id\` | uma | \`200\` + a tarefa, ou \`404\` |
| \`POST /tarefas\` | cria | \`201\` + a criada |
| \`PUT /tarefas/:id\` | **substitui** inteira | \`200\` + a nova, ou \`404\` |
| \`PATCH /tarefas/:id\` | **altera parte** | \`200\` + a alterada, ou \`404\` |
| \`DELETE /tarefas/:id\` | apaga | \`204\` sem corpo, ou \`404\` |

O caminho é o mesmo para uma tarefa (\`/tarefas/7\`); o **verbo** diz o que fazer com ela. É por isso que \`GET /tarefas/apagar/7\` está errado: o verbo já existe, e chama-se \`DELETE\`.

## \`PUT\` substitui; \`PATCH\` altera

\`PUT\` manda **a tarefa inteira**, e o servidor troca a antiga pela nova — mantendo o \`id\`, que é do servidor. Por isso o corpo de um \`PUT\` se valida como o de um \`POST\`: todos os campos são obrigatórios.

\`PATCH\` manda **só o que muda** — \`{ feita: true }\` — e o servidor altera esses campos, deixando o resto como está. Cada campo se valida **se veio**:

~~~js
app.patch('/tarefas/:id', (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });

  const { titulo, feita } = req.body;
  if (titulo !== undefined) {
    if (typeof titulo !== 'string' || titulo.trim() === '') {
      return res.status(400).json({ erro: 'titulo é obrigatório' });
    }
    tarefa.titulo = titulo.trim();
  }
  if (feita !== undefined) {
    if (typeof feita !== 'boolean') return res.status(400).json({ erro: 'feita precisa ser true ou false' });
    tarefa.feita = feita;
  }
  res.json(tarefa);
});
~~~

Repare que a rota altera **campo a campo** — não \`Object.assign(tarefa, req.body)\`. Copiar o corpo inteiro deixaria quem pede trocar o \`id\`, ou inventar campos. A regra da aula do \`POST\` continua valendo: nunca confie no corpo.

Para a página, \`PATCH\` é quase sempre o que ela quer: marcar como feita, renomear. \`PUT\` aparece quando ela editou o formulário inteiro.

## \`DELETE\` responde \`204\`

~~~js
app.delete('/tarefas/:id', (req, res) => {
  const indice = tarefas.findIndex((t) => t.id === Number(req.params.id));
  if (indice === -1) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  tarefas.splice(indice, 1);
  res.status(204).end();
});
~~~

**\`204 No Content\`**: deu certo, e não há nada para devolver — a tarefa não existe mais. \`res.status(204).end()\` fecha a resposta sem corpo. Responder \`200\` com a tarefa apagada também se vê por aí, e não está errado; \`204\` é o mais comum, e a página já sabe que não precisa ler nada.

Sobre o \`splice\`: ele **muda** a lista no lugar. A alternativa, \`tarefas = tarefas.filter(…)\`, cria uma lista nova — e só funciona se \`tarefas\` for \`let\`. Com \`const\`, é o erro "Assignment to constant variable", e ele só aparece na primeira remoção.

## Idempotente: repetir não muda o resultado

Uma rede falha. A página manda o pedido, a resposta se perde, ela manda de novo. O que acontece?

- \`GET\`, \`PUT\` e \`DELETE\` são **idempotentes**: dois \`PUT\` iguais deixam a tarefa igual a um; dois \`DELETE\` deixam a tarefa apagada (o segundo responde \`404\`, mas o **estado** é o mesmo).
- \`POST\` **não é**: dois \`POST\` criam duas tarefas.

Por isso repetir um \`GET\` ou um \`DELETE\` é seguro, e repetir um \`POST\` exige cuidado — a página desabilita o botão enquanto espera, ou o servidor recusa a duplicata com \`409\`. O termo assusta; a ideia é só essa: **o estado depois de N pedidos iguais é o mesmo que depois de um.**
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `const express = require('express');
const app = express();
app.use(express.json());

const tarefas = [{ id: 1, titulo: 'Estudar Node', feita: false }];

app.get('/tarefas', (req, res) => res.json(tarefas));

app.patch('/tarefas/:id', (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  const { feita } = req.body;
  if (feita !== undefined) {
    if (typeof feita !== 'boolean') return res.status(400).json({ erro: 'feita precisa ser true ou false' });
    tarefa.feita = feita;
  }
  res.json(tarefa);
});

app.delete('/tarefas/:id', (req, res) => {
  const indice = tarefas.findIndex((t) => t.id === Number(req.params.id));
  if (indice === -1) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  tarefas.splice(indice, 1);
  res.status(204).end();
});

app.listen(3000);`,
      caption:
        'Alterar parte e apagar: a mesma busca com 404 na frente, o campo validado se veio, o splice que muda a lista no lugar, e o 204 sem corpo.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-7-verbo',
        type: 'multiple-choice',
        prompt:
          'A página quer marcar a tarefa 3 como feita, sem mexer no título nem em mais nada. Qual pedido?',
        concepts: ['node-crud'],
        difficulty: 'iniciante',
        tags: ['node', 'http', 'rest', 'patch'],
        options: [
          '`PATCH /tarefas/3` com `{ feita: true }` — altera só o que veio',
          '`PUT /tarefas/3` com `{ feita: true }` — o PUT também serve para alterar um campo',
          '`POST /tarefas/3/feita` — toda ação é um POST',
          '`GET /tarefas/3?feita=true` — a consulta passa o novo valor',
        ],
        correctIndex: 0,
        explanation:
          '`PATCH` é "altere estes campos"; `PUT` é "substitua pela tarefa inteira" — com `{ feita: true }` num PUT bem escrito, faltaria o título e a resposta seria 400. `POST` cria, e `GET` nunca muda nada: um GET que altera é uma armadilha para o navegador, que repete GETs à vontade.',
        hints: ['Qual verbo muda parte de um recurso que já existe?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-7-patch',
        type: 'server',
        prompt:
          'Escreva `PATCH /tarefas/:id`: **404** se não existe; altera `titulo` e/ou `feita` só quando vieram no corpo — `titulo` precisa ser texto não vazio, `feita` precisa ser `true` ou `false`, senão **400** com `{ erro: "titulo é obrigatório" }` ou `{ erro: "feita precisa ser true ou false" }`; responde **200** com a tarefa alterada.',
        concepts: ['node-crud'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'patch', 'validacao'],
        initialCode: `const express = require('express');
const app = express();
app.use(express.json());

const tarefas = [
  { id: 1, titulo: 'Estudar Node', feita: false },
  { id: 2, titulo: 'Revisar SQL', feita: false },
];

app.get('/tarefas/:id', (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  res.json(tarefa);
});

// PATCH /tarefas/:id

app.listen(3000);
`,
        tests: [
          {
            description: 'PATCH /tarefas/1 com { feita: true } marca como feita e mantém o título',
            assertion: `const res = await pedir(app, 'PATCH', '/tarefas/1', { body: { feita: true } });
if (res.status !== 200) throw new Error('PATCH /tarefas/1 respondeu ' + res.status + ' ' + res.texto + '; esperava 200 com a tarefa alterada');
if (!res.body || res.body.feita !== true || res.body.titulo !== 'Estudar Node') throw new Error('esperava {id: 1, titulo: "Estudar Node", feita: true}, veio ' + res.texto + ' — só o que veio no corpo muda');`,
          },
          {
            description: 'PATCH /tarefas/1 com { titulo: "Estudar Express" } troca o título e mantém feita: true',
            assertion: `const res = await pedir(app, 'PATCH', '/tarefas/1', { body: { titulo: 'Estudar Express' } });
if (!res.body || res.body.titulo !== 'Estudar Express' || res.body.feita !== true) throw new Error('esperava {titulo: "Estudar Express", feita: true}, veio ' + res.texto);
const lida = await pedir(app, 'GET', '/tarefas/1');
if (!lida.body || lida.body.titulo !== 'Estudar Express') throw new Error('GET /tarefas/1 deveria mostrar o título novo, veio ' + lida.texto + ' — altere a tarefa da lista, não uma cópia');`,
          },
          {
            description: 'PATCH /tarefas/9 responde 404; { feita: "sim" } e { titulo: "" } respondem 400 com a mensagem certa',
            assertion: `const nada = await pedir(app, 'PATCH', '/tarefas/9', { body: { feita: true } });
if (nada.status !== 404) throw new Error('PATCH /tarefas/9 respondeu ' + nada.status + '; esperava 404');
const sim = await pedir(app, 'PATCH', '/tarefas/2', { body: { feita: 'sim' } });
if (sim.status !== 400 || !sim.body || sim.body.erro !== 'feita precisa ser true ou false') throw new Error('feita: "sim" respondeu ' + sim.status + ' ' + sim.texto + '; esperava 400 {"erro":"feita precisa ser true ou false"}');
const vazio = await pedir(app, 'PATCH', '/tarefas/2', { body: { titulo: '' } });
if (vazio.status !== 400 || !vazio.body || vazio.body.erro !== 'titulo é obrigatório') throw new Error('titulo: "" respondeu ' + vazio.status + ' ' + vazio.texto + '; esperava 400 {"erro":"titulo é obrigatório"}');
const intacta = await pedir(app, 'GET', '/tarefas/2');
if (!intacta.body || intacta.body.feita !== false || intacta.body.titulo !== 'Revisar SQL') throw new Error('depois dos 400, a tarefa 2 deveria estar intacta, veio ' + intacta.texto + ' — valide antes de alterar');`,
          },
        ],
        solution: `const express = require('express');
const app = express();
app.use(express.json());

const tarefas = [
  { id: 1, titulo: 'Estudar Node', feita: false },
  { id: 2, titulo: 'Revisar SQL', feita: false },
];

app.get('/tarefas/:id', (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  res.json(tarefa);
});

app.patch('/tarefas/:id', (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  const { titulo, feita } = req.body;
  if (titulo !== undefined && (typeof titulo !== 'string' || titulo.trim() === '')) {
    return res.status(400).json({ erro: 'titulo é obrigatório' });
  }
  if (feita !== undefined && typeof feita !== 'boolean') {
    return res.status(400).json({ erro: 'feita precisa ser true ou false' });
  }
  if (titulo !== undefined) tarefa.titulo = titulo.trim();
  if (feita !== undefined) tarefa.feita = feita;
  res.json(tarefa);
});

app.listen(3000);`,
        hints: [
          'Comece como o GET: `find` e 404. Depois leia `{ titulo, feita }` do corpo.',
          'Cada campo só interessa se veio: `if (titulo !== undefined) { … }`. Dentro, valide e só então altere `tarefa.titulo`.',
          'Valide os dois campos **antes** de alterar qualquer um — senão um corpo meio certo deixa a tarefa meio alterada.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-7-delete',
        type: 'server',
        prompt:
          'Escreva `DELETE /tarefas/:id`: **404** se não existe; senão, remove da lista e responde **204** sem corpo.',
        concepts: ['node-crud'],
        difficulty: 'iniciante',
        tags: ['node', 'express', 'delete', '204'],
        initialCode: `const express = require('express');
const app = express();

const tarefas = [
  { id: 1, titulo: 'Estudar Node', feita: false },
  { id: 2, titulo: 'Revisar SQL', feita: true },
];

app.get('/tarefas', (req, res) => res.json(tarefas));

// DELETE /tarefas/:id

app.listen(3000);
`,
        tests: [
          {
            description: 'DELETE /tarefas/2 responde 204 sem corpo, e a lista fica só com a 1',
            assertion: `const res = await pedir(app, 'DELETE', '/tarefas/2');
if (res.status !== 204) throw new Error('DELETE /tarefas/2 respondeu ' + res.status + ' ' + res.texto + '; esperava 204');
if (res.texto !== '') throw new Error('um 204 não leva corpo, veio "' + res.texto + '" — feche com res.status(204).end()');
const lista = await pedir(app, 'GET', '/tarefas');
if (!Array.isArray(lista.body) || lista.body.length !== 1 || lista.body[0].id !== 1) throw new Error('depois de apagar a 2, GET /tarefas deveria listar só a 1, veio ' + lista.texto);`,
          },
          {
            description: 'Apagar de novo responde 404 — e a lista continua igual',
            assertion: `const res = await pedir(app, 'DELETE', '/tarefas/2');
if (res.status !== 404 || !res.body || res.body.erro !== 'Tarefa não encontrada') throw new Error('o segundo DELETE /tarefas/2 respondeu ' + res.status + ' ' + res.texto + '; esperava 404 {"erro":"Tarefa não encontrada"}');
const lista = await pedir(app, 'GET', '/tarefas');
if (!Array.isArray(lista.body) || lista.body.length !== 1) throw new Error('a lista deveria continuar com 1 tarefa, veio ' + lista.texto);`,
          },
        ],
        solution: `const express = require('express');
const app = express();

const tarefas = [
  { id: 1, titulo: 'Estudar Node', feita: false },
  { id: 2, titulo: 'Revisar SQL', feita: true },
];

app.get('/tarefas', (req, res) => res.json(tarefas));

app.delete('/tarefas/:id', (req, res) => {
  const indice = tarefas.findIndex((t) => t.id === Number(req.params.id));
  if (indice === -1) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  tarefas.splice(indice, 1);
  res.status(204).end();
});

app.listen(3000);`,
        hints: [
          '`findIndex` em vez de `find`: você precisa da posição para remover. Não achou é `-1`.',
          '`tarefas.splice(indice, 1)` tira uma da lista, no lugar. Depois, `res.status(204).end()`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-7-idempotente',
        type: 'predict-output',
        prompt:
          'O que este programa imprime? A função `rodar` é o cliente dos exercícios fazendo os pedidos, em ordem.',
        concepts: ['node-crud'],
        difficulty: 'intermediario',
        tags: ['node', 'http', 'idempotencia'],
        code: `const express = require('express');
const app = express();
app.use(express.json());

const tarefas = [];

app.post('/tarefas', (req, res) => {
  const tarefa = { id: tarefas.length + 1, titulo: req.body.titulo };
  tarefas.push(tarefa);
  res.status(201).json(tarefa);
});

app.put('/tarefas/:id', (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  tarefa.titulo = req.body.titulo;
  res.json(tarefa);
});

async function rodar() {
  await pedir(app, 'POST', '/tarefas', { body: { titulo: 'Estudar' } });
  await pedir(app, 'POST', '/tarefas', { body: { titulo: 'Estudar' } });
  console.log('depois de dois POST iguais: ' + tarefas.length + ' tarefa(s)');
  await pedir(app, 'PUT', '/tarefas/1', { body: { titulo: 'Revisar' } });
  await pedir(app, 'PUT', '/tarefas/1', { body: { titulo: 'Revisar' } });
  console.log('depois de dois PUT iguais: ' + tarefas.length + ' tarefa(s), a 1 é ' + tarefas[0].titulo);
}
rodar();`,
        expectedOutput: `depois de dois POST iguais: 2 tarefa(s)
depois de dois PUT iguais: 2 tarefa(s), a 1 é Revisar`,
        explanation:
          '`POST` não é idempotente: cada pedido cria uma tarefa, e dois pedidos iguais criam duas. `PUT` é: o segundo deixa a tarefa exatamente como o primeiro deixou. Por isso repetir um PUT (ou um DELETE, ou um GET) depois de uma falha de rede é seguro, e repetir um POST precisa de cuidado.',
        hints: ['Qual dos dois verbos cria algo novo a cada pedido, e qual só deixa o recurso num estado?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-7-constante',
        type: 'find-bug',
        prompt:
          'O servidor quebra antes de subir: "Assignment to constant variable". Aponte a linha que precisa mudar.',
        concepts: ['node-crud'],
        difficulty: 'iniciante',
        tags: ['node', 'delete', 'const', 'bug'],
        code: `const express = require('express');
const app = express();

const tarefas = [];

function adicionar(titulo) {
  tarefas.push({ id: tarefas.length + 1, titulo, feita: false });
}

function remover(id) {
  tarefas = tarefas.filter((t) => t.id !== id);
}

app.delete('/tarefas/:id', (req, res) => {
  remover(Number(req.params.id));
  res.status(204).end();
});

adicionar('Estudar Node');
adicionar('Revisar SQL');
remover(2); // a segunda já foi feita fora do sistema

app.listen(3000);`,
        buggyLine: 4,
        fix: 'let tarefas = [];',
        symptomLine: 11,
        symptomFeedback:
          'É aqui que o erro aparece — a atribuição —, mas a linha em si é uma forma válida de remover: `filter` devolve uma lista nova, e guardá-la no lugar da antiga é a ideia. O que não permite guardar é a **declaração** de `tarefas`. Veja como ela foi declarada.',
        explanation:
          '`push` e `splice` **mudam** a lista no lugar, e funcionam com `const`. `filter` cria uma lista **nova**, e guardá-la em `tarefas` é uma atribuição — proibida para `const`. Ou a variável vira `let`, ou a remoção usa `splice`. As duas formas são corretas; o erro é misturar `const` com reatribuição — e ele só aparece na primeira remoção, longe da declaração.',
        hints: [
          'A mensagem fala de uma constante. Qual variável está sendo reatribuída, e como ela foi declarada?',
          '`push` muda a lista; `filter` devolve outra. Qual das duas coisas o `const` proíbe?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-7-put',
        type: 'server',
        prompt:
          'Escreva `PUT /tarefas/:id`, que **substitui** a tarefa: **404** se não existe; o corpo precisa trazer `titulo` (texto não vazio) e `feita` (`true`/`false`), senão **400** com `{ erro: "titulo é obrigatório" }` ou `{ erro: "feita precisa ser true ou false" }`; responde **200** com a tarefa nova — com o `id` de sempre, mesmo que o corpo traga outro.',
        concepts: ['node-crud'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'put', 'validacao'],
        initialCode: `const express = require('express');
const app = express();
app.use(express.json());

const tarefas = [{ id: 1, titulo: 'Estudar Node', feita: false }];

app.get('/tarefas/:id', (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  res.json(tarefa);
});

// PUT /tarefas/:id

app.listen(3000);
`,
        tests: [
          {
            description: 'PUT /tarefas/1 com { titulo: "Estudar Express", feita: true } responde 200 com a tarefa substituída',
            assertion: `const res = await pedir(app, 'PUT', '/tarefas/1', { body: { titulo: 'Estudar Express', feita: true } });
if (res.status !== 200 || !res.body || res.body.titulo !== 'Estudar Express' || res.body.feita !== true || res.body.id !== 1) throw new Error('PUT /tarefas/1 respondeu ' + res.status + ' ' + res.texto + '; esperava 200 {"id":1,"titulo":"Estudar Express","feita":true}');
const lida = await pedir(app, 'GET', '/tarefas/1');
if (!lida.body || lida.body.titulo !== 'Estudar Express') throw new Error('GET /tarefas/1 deveria mostrar a tarefa nova, veio ' + lida.texto);`,
          },
          {
            description: 'PUT sem feita responde 400; PUT sem titulo responde 400',
            assertion: `const semFeita = await pedir(app, 'PUT', '/tarefas/1', { body: { titulo: 'Só o título' } });
if (semFeita.status !== 400 || !semFeita.body || semFeita.body.erro !== 'feita precisa ser true ou false') throw new Error('PUT sem feita respondeu ' + semFeita.status + ' ' + semFeita.texto + '; esperava 400 {"erro":"feita precisa ser true ou false"} — no PUT, todos os campos são obrigatórios');
const semTitulo = await pedir(app, 'PUT', '/tarefas/1', { body: { feita: false } });
if (semTitulo.status !== 400 || !semTitulo.body || semTitulo.body.erro !== 'titulo é obrigatório') throw new Error('PUT sem titulo respondeu ' + semTitulo.status + ' ' + semTitulo.texto + '; esperava 400 {"erro":"titulo é obrigatório"}');`,
          },
          {
            description: 'O id do corpo é ignorado, e PUT /tarefas/9 responde 404',
            assertion: `const res = await pedir(app, 'PUT', '/tarefas/1', { body: { id: 99, titulo: 'Tentando trocar o id', feita: false } });
if (!res.body || res.body.id !== 1) throw new Error('o id é do servidor: esperava id 1 na resposta, veio ' + res.texto);
const um = await pedir(app, 'GET', '/tarefas/1');
if (um.status !== 200 || !um.body || um.body.id !== 1) throw new Error('GET /tarefas/1 deveria continuar existindo com id 1, veio ' + um.status + ' ' + um.texto);
const nada = await pedir(app, 'PUT', '/tarefas/9', { body: { titulo: 'x', feita: false } });
if (nada.status !== 404) throw new Error('PUT /tarefas/9 respondeu ' + nada.status + '; esperava 404');`,
          },
        ],
        solution: `const express = require('express');
const app = express();
app.use(express.json());

const tarefas = [{ id: 1, titulo: 'Estudar Node', feita: false }];

app.get('/tarefas/:id', (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  res.json(tarefa);
});

app.put('/tarefas/:id', (req, res) => {
  const indice = tarefas.findIndex((t) => t.id === Number(req.params.id));
  if (indice === -1) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  const { titulo, feita } = req.body;
  if (typeof titulo !== 'string' || titulo.trim() === '') {
    return res.status(400).json({ erro: 'titulo é obrigatório' });
  }
  if (typeof feita !== 'boolean') {
    return res.status(400).json({ erro: 'feita precisa ser true ou false' });
  }
  const nova = { id: tarefas[indice].id, titulo: titulo.trim(), feita };
  tarefas[indice] = nova;
  res.json(nova);
});

app.listen(3000);`,
        hints: [
          'A validação é a do POST: os dois campos são obrigatórios, sem `!== undefined`.',
          'Monte a tarefa nova campo a campo, com `id: tarefa.id` (o de sempre), e ponha no lugar da antiga: `tarefas[indice] = nova`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-7-achar',
        type: 'refactor',
        prompt:
          'As três rotas repetem a busca e o 404. Extraia uma função `acharTarefa(id)` que devolve a tarefa ou **lança** `new ErroHttp(404, "Tarefa não encontrada")`, e deixe o middleware de erro responder. Nenhuma rota deve montar o 404 por conta própria.',
        concepts: ['node-crud', 'node-erros'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'refatorar', 'dry'],
        initialCode: `const express = require('express');
const app = express();
app.use(express.json());

class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

const tarefas = [
  { id: 1, titulo: 'Estudar Node', feita: false },
  { id: 2, titulo: 'Revisar SQL', feita: false },
];

app.get('/tarefas/:id', (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  res.json(tarefa);
});

app.patch('/tarefas/:id', (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  if (req.body.feita !== undefined) tarefa.feita = req.body.feita;
  res.json(tarefa);
});

app.delete('/tarefas/:id', (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  tarefas.splice(tarefas.indexOf(tarefa), 1);
  res.status(204).end();
});

app.use((erro, req, res, next) => {
  const status = erro.status || 500;
  res.status(status).json({ erro: status === 500 ? 'Erro interno' : erro.message });
});

app.listen(3000);`,
        tests: [
          {
            description: 'GET /tarefas/1 responde a tarefa; GET /tarefas/9 responde 404 com a mensagem',
            assertion: `const um = await pedir(app, 'GET', '/tarefas/1');
if (um.status !== 200 || !um.body || um.body.titulo !== 'Estudar Node') throw new Error('GET /tarefas/1 respondeu ' + um.status + ' ' + um.texto + '; esperava 200 com a tarefa');
const nada = await pedir(app, 'GET', '/tarefas/9');
if (nada.status !== 404 || !nada.body || nada.body.erro !== 'Tarefa não encontrada') throw new Error('GET /tarefas/9 respondeu ' + nada.status + ' ' + nada.texto + '; esperava 404 {"erro":"Tarefa não encontrada"}');`,
          },
          {
            description: 'PATCH /tarefas/1 altera feita; PATCH /tarefas/9 é 404',
            assertion: `const res = await pedir(app, 'PATCH', '/tarefas/1', { body: { feita: true } });
if (res.status !== 200 || !res.body || res.body.feita !== true) throw new Error('PATCH /tarefas/1 respondeu ' + res.status + ' ' + res.texto + '; esperava 200 com feita: true');
const nada = await pedir(app, 'PATCH', '/tarefas/9', { body: { feita: true } });
if (nada.status !== 404 || !nada.body || nada.body.erro !== 'Tarefa não encontrada') throw new Error('PATCH /tarefas/9 respondeu ' + nada.status + ' ' + nada.texto + '; esperava 404 {"erro":"Tarefa não encontrada"}');`,
          },
          {
            description: 'DELETE /tarefas/2 responde 204 e some; DELETE /tarefas/2 de novo é 404',
            assertion: `const res = await pedir(app, 'DELETE', '/tarefas/2');
if (res.status !== 204) throw new Error('DELETE /tarefas/2 respondeu ' + res.status + ' ' + res.texto + '; esperava 204');
const depois = await pedir(app, 'GET', '/tarefas/2');
if (depois.status !== 404) throw new Error('depois de apagar, GET /tarefas/2 respondeu ' + depois.status + '; esperava 404');
const denovo = await pedir(app, 'DELETE', '/tarefas/2');
if (denovo.status !== 404 || !denovo.body || denovo.body.erro !== 'Tarefa não encontrada') throw new Error('o segundo DELETE respondeu ' + denovo.status + ' ' + denovo.texto + '; esperava 404 {"erro":"Tarefa não encontrada"}');`,
          },
        ],
        constraints: [
          {
            description: 'Existe uma função `acharTarefa` que faz a busca num lugar só',
            required: 'function acharTarefa(',
          },
          {
            description: 'Nenhuma rota monta o 404 por conta própria: quem responde é o middleware de erro',
            forbidden: 'res.status(404)',
          },
        ],
        explanation:
          'Três cópias da mesma busca são três lugares para errar a mensagem, esquecer o `Number`, ou mudar o status em dois e esquecer o terceiro. Uma função que **lança** quando não acha deixa as rotas com uma linha — `const tarefa = acharTarefa(req.params.id)` — e o 404 vira responsabilidade do middleware de erro, junto com todos os outros erros. É o desenho da aula de erros aplicado ao CRUD inteiro.',
        solution: `const express = require('express');
const app = express();
app.use(express.json());

class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

const tarefas = [
  { id: 1, titulo: 'Estudar Node', feita: false },
  { id: 2, titulo: 'Revisar SQL', feita: false },
];

function acharTarefa(id) {
  const tarefa = tarefas.find((t) => t.id === Number(id));
  if (!tarefa) throw new ErroHttp(404, 'Tarefa não encontrada');
  return tarefa;
}

app.get('/tarefas/:id', (req, res) => {
  res.json(acharTarefa(req.params.id));
});

app.patch('/tarefas/:id', (req, res) => {
  const tarefa = acharTarefa(req.params.id);
  if (req.body.feita !== undefined) tarefa.feita = req.body.feita;
  res.json(tarefa);
});

app.delete('/tarefas/:id', (req, res) => {
  const tarefa = acharTarefa(req.params.id);
  tarefas.splice(tarefas.indexOf(tarefa), 1);
  res.status(204).end();
});

app.use((erro, req, res, next) => {
  const status = erro.status || 500;
  res.status(status).json({ erro: status === 500 ? 'Erro interno' : erro.message });
});

app.listen(3000);`,
        hints: [
          'A função recebe o id (pode receber o texto de `req.params.id` e converter dentro), procura, e **lança** se não achou — em vez de responder.',
          'Um erro lançado dentro da rota chega ao middleware de erro, que já responde no formato certo com o status do erro. As rotas ficam sem nenhum `if (!tarefa)`.',
          'Dentro: `const tarefa = tarefas.find((t) => t.id === Number(id)); if (!tarefa) throw new ErroHttp(404, "Tarefa não encontrada"); return tarefa;`',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Um recurso completo é seis rotas no mesmo caminho, e o **verbo** diz o que fazer: \`GET\` lê, \`POST\` cria, \`PUT\` **substitui** (todos os campos obrigatórios), \`PATCH\` **altera parte** (cada campo validado se veio), \`DELETE\` apaga e responde **\`204\` sem corpo**. Toda rota com \`:id\` começa pela mesma busca com \`404\` — e é por isso que ela vira uma função.

Alterar é **campo a campo**, nunca copiando o corpo inteiro: o \`id\` é do servidor. Remover é \`splice\` (muda no lugar) ou \`filter\` com \`let\` (lista nova) — não \`filter\` com \`const\`.

**Idempotente**: o estado depois de N pedidos iguais é o mesmo que depois de um. \`GET\`, \`PUT\` e \`DELETE\` são; \`POST\` não — e é por isso que repetir um POST pede cuidado.

Na próxima aula, o servidor deixa de guardar tudo numa lista: rotas **assíncronas**, \`await\` num repositório, e o que muda nos erros.
`.trim(),
    },
  ],
};

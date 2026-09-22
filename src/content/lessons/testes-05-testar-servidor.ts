import type { Lesson } from '../types';

const SERVIDOR = `const express = require('express');
const app = express();
app.use(express.json());

const tarefas = [
  { id: 1, titulo: 'Estudar', feita: false },
  { id: 2, titulo: 'Revisar', feita: true },
];

app.get('/tarefas', (req, res) => {
  res.json(tarefas);
});

app.post('/tarefas', (req, res) => {
  const { titulo } = req.body;
  if (typeof titulo !== 'string' || titulo.trim() === '') {
    return res.status(400).json({ erro: 'titulo é obrigatório' });
  }
  const tarefa = { id: tarefas.length + 1, titulo: titulo.trim(), feita: false };
  tarefas.push(tarefa);
  res.status(201).json(tarefa);
});

app.get('/tarefas/:id', (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  res.json(tarefa);
});

app.listen(3000);`;

export const lessonTestesServidor: Lesson = {
  id: 'lesson-testes-5',
  trackId: 'track-testes',
  title: 'Testando o Servidor',
  language: 'node',
  objective:
    'Escrever testes de rotas HTTP com `pedir()` como cliente, cobrindo o caminho feliz e os casos de erro de cada rota — sem precisar de um servidor de verdade escutando numa porta.',
  concepts: ['testes-servidor'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Testar uma API parece pedir um servidor de verdade escutando numa porta, e um cliente HTTP de verdade fazendo pedidos a ela. A trilha de Node já resolveu isso: \`pedir(app, método, caminho, opções)\` faz o papel do cliente sem porta nenhuma — é o mesmo mecanismo que os exercícios de servidor usam desde aquela trilha, e é o que a maioria das ferramentas de teste de API faz por trás (o \`supertest\`, no Node de verdade, é exatamente isso).

## O padrão de um teste de rota

~~~js
const res = await pedir(app, 'GET', '/tarefas');

assert(res.status === 200, 'lista as tarefas com status 200');
assert(Array.isArray(res.body), 'o corpo é uma lista');
~~~

\`arrange\` é o \`app\` já com as rotas registradas (o \`subject\` deste exercício); \`act\` é o \`pedir\`; \`assert\` confere \`status\` e \`body\`. A mesma forma da aula 2, com HTTP no lugar de uma chamada de função direta.

## Um teste por rota, e por caso da rota

Cada rota tem, no mínimo, dois comportamentos: o caminho feliz e pelo menos um caso de erro. \`POST /tarefas\` tem dois: cria com título válido, recusa com título vazio.

~~~js
const criada = await pedir(app, 'POST', '/tarefas', { body: { titulo: 'Nova' } });
assert(criada.status === 201, 'cria a tarefa e responde 201');
assert(criada.body.titulo === 'Nova', 'a tarefa criada tem o título enviado');

const semTitulo = await pedir(app, 'POST', '/tarefas', { body: {} });
assert(semTitulo.status === 400, 'sem título, responde 400');
~~~

São dois testes, não um: a mesma regra da aula 3 — um comportamento por teste — vale para rotas.

## O estado entre pedidos

Um servidor tem memória entre um pedido e outro: um \`POST\` de um teste altera o que um \`GET\` seguinte vai encontrar. Isso é uma vantagem para testar fluxos inteiros ("criei, então busco, e a nova está lá") e uma armadilha se os testes não forem pensados na ordem certa:

~~~js
await pedir(app, 'POST', '/tarefas', { body: { titulo: 'Nova' } });
const lista = await pedir(app, 'GET', '/tarefas');
assert(lista.body.length === 3, 'depois do POST, a lista tem uma tarefa a mais');
~~~

Se esse teste rodar antes de outro que espera exatamente 2 tarefas, o segundo vai falhar — não porque o código está errado, mas porque a ordem dos testes importa quando eles compartilham o mesmo servidor. É por isso que os testes deste exercício rodam **em série**, na ordem em que você escreve.

## Testar o status, não só o corpo

Um erro comum é conferir só o \`body\` e esquecer o \`status\`:

~~~js
// Incompleto: e se o servidor respondesse 500 com esse corpo por acidente?
assert(res.body.erro === 'titulo é obrigatório', 'a mensagem de erro está certa');

// Completo: confere os dois.
assert(res.status === 400, 'responde 400');
assert(res.body.erro === 'titulo é obrigatório', 'a mensagem de erro está certa');
~~~

O status é a primeira coisa que quem chama a API lê — e um teste que não confere ele pode aceitar uma rota que responde \`500\` com uma mensagem parecida.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Testando uma rota de busca por id: o caso que existe e o que não existe.
const encontrada = await pedir(app, 'GET', '/tarefas/1');
assert(encontrada.status === 200, 'tarefa existente responde 200');
assert(encontrada.body.titulo === 'Estudar', 'devolve a tarefa certa');

const naoEncontrada = await pedir(app, 'GET', '/tarefas/999');
assert(naoEncontrada.status === 404, 'tarefa inexistente responde 404');
assert(naoEncontrada.body.erro === 'Tarefa não encontrada', 'a mensagem explica o que faltou');`,
      caption:
        'Dois testes para a mesma rota: o id que existe e o que não existe. Cada um confere status e corpo — nunca só um dos dois.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-5-forma',
        type: 'multiple-choice',
        prompt: 'Qual destes é o teste MAIS completo para `GET /tarefas/999` (uma tarefa que não existe)?',
        concepts: ['testes-servidor'],
        difficulty: 'iniciante',
        tags: ['testes', 'servidor', 'http'],
        options: [
          'Conferir `res.status === 404` E `res.body.erro` com a mensagem certa',
          'Conferir só `res.status === 404`',
          'Conferir só `res.body.erro` com a mensagem certa',
          'Não testar esse caso: só o caminho feliz importa',
        ],
        correctIndex: 0,
        explanation:
          'Um teste que confere só o status aceitaria qualquer corpo, inclusive um vazio ou com a mensagem errada. Um que confere só o corpo aceitaria um status 200 por engano, desde que o corpo por acaso batesse. Os dois juntos é que garantem que a rota respondeu exatamente o que deveria.',
        hints: ['O que cada uma das duas checagens sozinha deixaria passar sem perceber?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-5-testar-get',
        type: 'write-test',
        prompt:
          'O servidor abaixo (o `subject`) está **correto**. Escreva testes com `pedir()` para `GET /tarefas` (lista as duas tarefas iniciais) e `GET /tarefas/:id` (a tarefa 2 existe; a tarefa 999 responde 404).',
        concepts: ['testes-servidor'],
        difficulty: 'intermediario',
        tags: ['testes', 'servidor', 'assert'],
        subject: SERVIDOR,
        initialCode: `// Use pedir(app, metodo, caminho, opcoes) e assert.
// GET /tarefas, e GET /tarefas/:id (existente e inexistente).

`,
        mutants: [
          {
            description: 'GET /tarefas/:id nunca responde 404, mesmo para id inexistente',
            code: `const express = require('express');
const app = express();
app.use(express.json());
const tarefas = [{ id: 1, titulo: 'Estudar', feita: false }, { id: 2, titulo: 'Revisar', feita: true }];
app.get('/tarefas', (req, res) => res.json(tarefas));
app.post('/tarefas', (req, res) => {
  const { titulo } = req.body;
  if (typeof titulo !== 'string' || titulo.trim() === '') return res.status(400).json({ erro: 'titulo é obrigatório' });
  const tarefa = { id: tarefas.length + 1, titulo: titulo.trim(), feita: false };
  tarefas.push(tarefa);
  res.status(201).json(tarefa);
});
app.get('/tarefas/:id', (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id)) || tarefas[0];
  res.json(tarefa);
});
app.listen(3000);`,
          },
          {
            description: 'GET /tarefas devolve um objeto ao invés de uma lista',
            code: `const express = require('express');
const app = express();
app.use(express.json());
const tarefas = [{ id: 1, titulo: 'Estudar', feita: false }, { id: 2, titulo: 'Revisar', feita: true }];
app.get('/tarefas', (req, res) => res.json({ tarefas }));
app.post('/tarefas', (req, res) => {
  const { titulo } = req.body;
  if (typeof titulo !== 'string' || titulo.trim() === '') return res.status(400).json({ erro: 'titulo é obrigatório' });
  const tarefa = { id: tarefas.length + 1, titulo: titulo.trim(), feita: false };
  tarefas.push(tarefa);
  res.status(201).json(tarefa);
});
app.get('/tarefas/:id', (req, res) => {
  const tarefa = tarefas.find((t) => t.id === Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  res.json(tarefa);
});
app.listen(3000);`,
          },
        ],
        hints: [
          '`const lista = await pedir(app, "GET", "/tarefas")` — depois, `assert(Array.isArray(lista.body) && lista.body.length === 2, ...)`.',
          'Para a busca por id: um `pedir` com `/tarefas/2` (espera 200 e o título certo) e outro com `/tarefas/999` (espera 404).',
          "const lista = await pedir(app, 'GET', '/tarefas'); assert(Array.isArray(lista.body) && lista.body.length === 2, 'lista as 2 tarefas'); const existe = await pedir(app, 'GET', '/tarefas/2'); assert(existe.status === 200 && existe.body.titulo === 'Revisar', 'acha a tarefa 2'); const naoExiste = await pedir(app, 'GET', '/tarefas/999'); assert(naoExiste.status === 404, 'tarefa inexistente é 404');",
        ],
        solution: `const lista = await pedir(app, 'GET', '/tarefas');
assert(Array.isArray(lista.body) && lista.body.length === 2, 'lista as 2 tarefas');
const existe = await pedir(app, 'GET', '/tarefas/2');
assert(existe.status === 200 && existe.body.titulo === 'Revisar', 'acha a tarefa 2');
const naoExiste = await pedir(app, 'GET', '/tarefas/999');
assert(naoExiste.status === 404, 'tarefa inexistente e 404');`,
        explanation:
          'O primeiro teste (`Array.isArray` e `length === 2`) pega a sabotagem que devolve um objeto em vez de lista. O terceiro (o 404) pega a que nunca responde 404 — ela devolveria a primeira tarefa disfarçada de "encontrada" para qualquer id.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-5-ordem',
        type: 'predict-output',
        prompt:
          'Dois testes rodam em série contra o mesmo servidor, na ordem em que aparecem. O que este programa imprime?',
        concepts: ['testes-servidor'],
        difficulty: 'intermediario',
        tags: ['testes', 'servidor', 'estado'],
        code: `const express = require('express');
const app = express();
app.use(express.json());
const tarefas = [{ id: 1, titulo: 'Estudar' }];
app.get('/tarefas', (req, res) => res.json(tarefas));
app.post('/tarefas', (req, res) => {
  tarefas.push({ id: tarefas.length + 1, titulo: req.body.titulo });
  res.status(201).json({ ok: true });
});
app.listen(3000);

async function rodar() {
  const antes = await pedir(app, 'GET', '/tarefas');
  console.log('antes: ' + antes.body.length);
  await pedir(app, 'POST', '/tarefas', { body: { titulo: 'Nova' } });
  const depois = await pedir(app, 'GET', '/tarefas');
  console.log('depois: ' + depois.body.length);
}
rodar();`,
        expectedOutput: `antes: 1
depois: 2`,
        explanation:
          'O servidor guarda `tarefas` numa variável comum a todos os pedidos — não recria o banco a cada `pedir()`. O `POST` do meio altera essa lista, e o segundo `GET` vê a mudança. É por isso que testes de servidor rodam em série: se dois testes assumissem tamanhos diferentes de lista sem pensar na ordem, um dos dois quebraria.',
        hints: ['O servidor recria a lista `tarefas` a cada pedido, ou ela é compartilhada entre eles?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-5-so-o-corpo',
        type: 'multiple-choice',
        prompt:
          'Este teste confere só o corpo da resposta:\n\n```js\nconst res = await pedir(app, "POST", "/tarefas", { body: {} });\nassert(res.body.erro === "titulo é obrigatório", "a mensagem de erro está certa");\n```\n\nO que esse teste deixaria passar sem perceber?',
        concepts: ['testes-servidor'],
        difficulty: 'intermediario',
        tags: ['testes', 'servidor', 'status'],
        options: [
          'Uma rota que responde `500` (erro interno) por acidente, mas ainda assim com esse corpo específico',
          'Nada — conferir o corpo já garante que a rota está correta',
          'Uma rota que não existe de jeito nenhum',
          'Um `body` que não é um objeto JSON válido',
        ],
        correctIndex: 0,
        explanation:
          'Sem conferir `res.status`, o teste aceitaria qualquer código de status, desde que o corpo batesse — inclusive um `500` genuíno que por acaso tivesse essa mensagem. Quem chama a API real, porém, lê o status primeiro: um `400` (erro do cliente) e um `500` (erro do servidor) pedem reações bem diferentes de quem consome a rota.',
        hints: ['Existe algum `assert` sobre o código de status nesse teste?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-5-dois-casos-uma-rota',
        type: 'predict-output',
        prompt: 'Dois pedidos seguidos, contra a mesma rota. O que este programa imprime?',
        concepts: ['testes-servidor'],
        difficulty: 'iniciante',
        tags: ['testes', 'servidor'],
        code: `const express = require('express');
const app = express();
app.use(express.json());

app.post('/tarefas', (req, res) => {
  const { titulo } = req.body;
  if (typeof titulo !== 'string' || titulo.trim() === '') {
    return res.status(400).json({ erro: 'titulo é obrigatório' });
  }
  res.status(201).json({ titulo });
});

app.listen(3000);

async function rodar() {
  const valido = await pedir(app, 'POST', '/tarefas', { body: { titulo: 'Estudar' } });
  console.log(valido.status);
  const invalido = await pedir(app, 'POST', '/tarefas', { body: {} });
  console.log(invalido.status);
}
rodar();`,
        expectedOutput: '201\n400',
        explanation:
          'O primeiro pedido manda um título válido: a rota cria a tarefa e responde `201`. O segundo manda um corpo vazio — `titulo` é `undefined`, falha a checagem `typeof titulo !== "string"`, e a rota responde `400`. É o caminho feliz e o caso de erro da mesma rota, exatamente os dois comportamentos que merecem um teste cada.',
        hints: ['O que a rota faz quando `titulo` não é uma string — a segunda chamada envia um `titulo`?'],
      },
    },
    {
      kind: 'summary',
      markdown: `
Testar uma rota é **arrange** (o \`app\` já montado), **act** (\`await pedir(app, método, caminho, opções)\`), **assert** (\`status\` e \`body\`, sempre os dois). Um teste por rota **e** por caso da rota — caminho feliz e cada erro.

O servidor tem estado entre pedidos: um \`POST\` altera o que um \`GET\` seguinte encontra, e é por isso que os testes rodam **em série**, na ordem escrita.

Na próxima aula, o outro lado da moeda: o que **não** vale a pena testar, e por que 100% de cobertura não é a meta.
`.trim(),
    },
  ],
};

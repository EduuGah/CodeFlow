import type { Lesson } from '../types';

/**
 * O "banco" das aulas de assincronia: um módulo que o exercício fornece em
 * `arquivos`, com cada função devolvendo uma Promise depois de uma espera
 * pequena — o formato de qualquer acesso a banco de verdade. O aluno o vê no
 * painel de arquivos, acima do editor.
 */
const REPOSITORIO = `// Um banco de mentira: cada função devolve uma Promise, como um banco de verdade.
function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const tarefas = [
  { id: 1, titulo: 'Estudar Node', feita: false },
  { id: 2, titulo: 'Revisar SQL', feita: true },
];

module.exports = {
  async listar() {
    await esperar(5);
    return tarefas.map((t) => ({ ...t }));
  },
  async buscar(id) {
    await esperar(5);
    const tarefa = tarefas.find((t) => t.id === id);
    return tarefa ? { ...tarefa } : null;
  },
  async criar(dados) {
    await esperar(5);
    const nova = { id: tarefas.length + 1, ...dados };
    tarefas.push(nova);
    return { ...nova };
  },
  async remover(id) {
    await esperar(5);
    const indice = tarefas.findIndex((t) => t.id === id);
    if (indice === -1) return false;
    tarefas.splice(indice, 1);
    return true;
  },
};
`;

export const lessonNodeAssincrono: Lesson = {
  id: 'lesson-node-8',
  trackId: 'track-node',
  title: 'Assincronia no Servidor',
  language: 'node',
  objective:
    'Tirar os dados da lista em memória e falar com um repositório assíncrono: rotas `async`, `await` em cada acesso, o que acontece com o erro, e quando buscar em paralelo.',
  concepts: ['node-async'],
  status: 'published',
  estimatedMinutes: 35,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Até agora as tarefas moram numa lista dentro do servidor. Isso serviu para aprender as rotas, mas não sobrevive: reiniciou o processo, sumiu tudo; subiu um segundo servidor, cada um tem a sua lista. Dados de verdade moram num **banco** — e falar com um banco é **assíncrono**: o pedido sai, a resposta chega depois. É o \`await\` que você já conhece, agora dentro das rotas.

## O repositório

O código que fala com o banco fica num módulo próprio, o **repositório**, e o servidor só conhece as funções dele:

~~~js
// repositorio.js
module.exports = {
  async listar() { … },       // → Promise<Tarefa[]>
  async buscar(id) { … },     // → Promise<Tarefa | null>
  async criar(dados) { … },   // → Promise<Tarefa>
  async remover(id) { … },    // → Promise<boolean>
};
~~~

Nesta aula o repositório é de mentira — uma lista com uma espera na frente —, mas a **forma** é a de um banco real: toda função devolve uma Promise. A trilha de SQL ensinou a consulta; a aula do projeto junta as duas pontas. O que importa hoje é que as rotas nunca tocam a lista: elas pedem ao repositório e esperam.

## A rota \`async\`

~~~js
const repositorio = require('./repositorio');

app.get('/tarefas', async (req, res) => {
  const tarefas = await repositorio.listar();
  res.json(tarefas);
});

app.get('/tarefas/:id', async (req, res) => {
  const tarefa = await repositorio.buscar(Number(req.params.id));
  if (!tarefa) throw new ErroHttp(404, 'Tarefa não encontrada');
  res.json(tarefa);
});
~~~

Duas mudanças: a função da rota ganha \`async\`, e cada acesso ganha \`await\`. O resto — validação, 404, status — é igual. O Express espera a rota terminar; enquanto uma espera o banco, ele atende as outras. É por isso que um servidor Node atende milhares de pedidos numa thread só: quase todo o tempo é espera, e esperar não ocupa a thread.

## Esquecer o \`await\`

~~~js
app.get('/tarefas', async (req, res) => {
  const tarefas = repositorio.listar(); // sem await: uma Promise
  res.json(tarefas);                    // → {}
});
~~~

Uma Promise vira \`{}\` no JSON. A rota não quebra, o status é \`200\`, e a página recebe um objeto vazio no lugar da lista — o pior tipo de erro, o silencioso. Quando uma rota responde \`{}\` do nada, procure o \`await\` que faltou.

O sinal no editor: \`await\` só existe dentro de função \`async\`. Uma rota sem \`async\` com um \`await\` dentro é um erro de sintaxe, "await is only valid in async functions" — e ele aponta a linha do \`await\`, não a da função.

## O erro numa rota \`async\`

O repositório falha: a conexão caiu, a consulta tem um erro. A Promise rejeita, o \`await\` lança, e — no Express 5, o atual — o erro segue para o **middleware de erro**, como um \`throw\` comum. As rotas continuam sem \`try/catch\`; o desenho da aula de erros não muda.

Se você encontrar código com \`try { … } catch (erro) { next(erro) }\` em **toda** rota, é herança do Express 4, que não esperava Promises: lá, um erro numa rota \`async\` deixava o pedido pendurado. Hoje não é mais preciso.

## Em série ou em paralelo

~~~js
// Um depende do outro: em série.
const tarefa = await repositorio.buscar(id);
const dono = await usuarios.buscar(tarefa.donoId);

// Independentes: em paralelo, com Promise.all.
const [tarefa, comentarios] = await Promise.all([
  repositorio.buscar(id),
  comentarios.deTarefa(id),
]);
~~~

Dois \`await\` seguidos esperam um **depois** do outro: 50 ms + 50 ms. Quando a segunda busca não precisa do resultado da primeira, \`Promise.all\` dispara as duas e espera as duas: 50 ms. Numa rota que junta três ou quatro fontes, é a diferença entre uma página que abre e uma que arrasta.

## O que não fazer numa rota

Uma coisa a thread única **não** perdoa: trabalho pesado síncrono. Um \`for\` de um bilhão de voltas, um cálculo enorme, um \`while (true)\` — enquanto ele roda, **nenhum** outro pedido é atendido. Esperar o banco libera a thread; calcular não. Trabalho pesado de verdade vai para outro processo; para esta trilha, basta saber que a rota deve esperar muito e calcular pouco.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `const express = require('express');
const repositorio = require('./repositorio');
const app = express();
app.use(express.json());

class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

app.get('/tarefas', async (req, res) => {
  res.json(await repositorio.listar());
});

app.post('/tarefas', async (req, res) => {
  const { titulo } = req.body;
  if (typeof titulo !== 'string' || titulo.trim() === '') throw new ErroHttp(400, 'titulo é obrigatório');
  const tarefa = await repositorio.criar({ titulo: titulo.trim(), feita: false });
  res.status(201).json(tarefa);
});

app.delete('/tarefas/:id', async (req, res) => {
  const removeu = await repositorio.remover(Number(req.params.id));
  if (!removeu) throw new ErroHttp(404, 'Tarefa não encontrada');
  res.status(204).end();
});

app.use((erro, req, res, next) => {
  const status = erro.status || 500;
  res.status(status).json({ erro: status === 500 ? 'Erro interno' : erro.message });
});

app.listen(3000);`,
      caption:
        'As mesmas rotas de sempre, com async na função e await em cada acesso ao repositório. Sem try/catch: o erro do banco vai para o middleware de erro como qualquer outro.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-8-ler',
        type: 'server',
        prompt:
          'O repositório está em `./repositorio` (veja o arquivo acima do editor). Escreva `GET /tarefas`, que responde a lista do repositório, e `GET /tarefas/:id`, que responde a tarefa — ou **404** com `{ erro: "Tarefa não encontrada" }` quando `buscar` devolve `null`. O `buscar` recebe um número.',
        concepts: ['node-async'],
        difficulty: 'iniciante',
        tags: ['node', 'express', 'async', 'await'],
        arquivos: { './repositorio': REPOSITORIO },
        initialCode: `const express = require('express');
const repositorio = require('./repositorio');
const app = express();

// GET /tarefas: a lista do repositório.

// GET /tarefas/:id: a tarefa, ou 404.

app.listen(3000);
`,
        tests: [
          {
            description: 'GET /tarefas responde as 2 tarefas do repositório',
            assertion: `const res = await pedir(app, 'GET', '/tarefas');
if (res.status !== 200) throw new Error('GET /tarefas respondeu ' + res.status + ' ' + res.texto + '; esperava 200');
if (!Array.isArray(res.body) || res.body.length !== 2) throw new Error('esperava a lista com 2 tarefas, veio ' + res.texto + (res.texto === '{}' ? ' — uma Promise vira {} no JSON: faltou o await' : ''));`,
          },
          {
            description: 'GET /tarefas/2 responde "Revisar SQL"; GET /tarefas/9 responde 404',
            assertion: `const dois = await pedir(app, 'GET', '/tarefas/2');
if (dois.status !== 200 || !dois.body || dois.body.titulo !== 'Revisar SQL') throw new Error('GET /tarefas/2 respondeu ' + dois.status + ' ' + dois.texto + '; esperava 200 com "Revisar SQL"' + (dois.status === 404 ? ' — o buscar recebe um número: Number(req.params.id)' : ''));
const nada = await pedir(app, 'GET', '/tarefas/9');
if (nada.status !== 404 || !nada.body || nada.body.erro !== 'Tarefa não encontrada') throw new Error('GET /tarefas/9 respondeu ' + nada.status + ' ' + nada.texto + '; esperava 404 {"erro":"Tarefa não encontrada"}');`,
          },
        ],
        solution: `const express = require('express');
const repositorio = require('./repositorio');
const app = express();

app.get('/tarefas', async (req, res) => {
  const tarefas = await repositorio.listar();
  res.json(tarefas);
});

app.get('/tarefas/:id', async (req, res) => {
  const tarefa = await repositorio.buscar(Number(req.params.id));
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  res.json(tarefa);
});

app.listen(3000);`,
        hints: [
          'A função da rota precisa ser `async (req, res) => { … }` para poder usar `await` dentro.',
          '`const tarefas = await repositorio.listar()`, e `res.json(tarefas)`.',
          'No `:id`: `await repositorio.buscar(Number(req.params.id))`; `null` é 404.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-8-sem-await',
        type: 'predict-output',
        prompt:
          'O que este programa imprime? A última linha é o cliente dos exercícios pedindo `GET /tarefas` e imprimindo o corpo da resposta.',
        concepts: ['node-async'],
        difficulty: 'intermediario',
        tags: ['node', 'async', 'promise', 'json'],
        code: `const express = require('express');
const app = express();

function listar() {
  return new Promise((resolve) => setTimeout(() => resolve([{ id: 1, titulo: 'Estudar' }]), 10));
}

app.get('/tarefas', async (req, res) => {
  const tarefas = listar();
  console.log('tem then? ' + (typeof tarefas.then === 'function'));
  res.json(tarefas);
});

pedir(app, 'GET', '/tarefas').then((r) => console.log('corpo: ' + r.texto));`,
        expectedOutput: `tem then? true
corpo: {}`,
        explanation:
          'Sem `await`, `tarefas` é a Promise, não a lista — e uma Promise tem `then`. `JSON.stringify` de uma Promise é `{}`: nada de erro, status 200, e a página recebe um objeto vazio. É o erro silencioso da assincronia; `const tarefas = await listar()` resolve.',
        hints: ['A função `listar` devolve a lista, ou a promessa de uma lista? E o que o JSON faz com uma promessa?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-8-sintaxe',
        type: 'find-bug',
        prompt:
          'O servidor nem sobe: "await is only valid in async functions" (ou "await is only valid in async functions and the top level bodies of modules"). Aponte a linha que precisa mudar.',
        concepts: ['node-async'],
        difficulty: 'iniciante',
        tags: ['node', 'async', 'await', 'bug'],
        code: `const express = require('express');
const app = express();

const repositorio = {
  async listar() {
    return [{ id: 1, titulo: 'Estudar Node' }];
  },
};

app.get('/tarefas', (req, res) => {
  const tarefas = await repositorio.listar();
  res.json(tarefas);
});

app.listen(3000);`,
        buggyLine: 10,
        fix: "app.get('/tarefas', async (req, res) => {",
        symptomLine: 11,
        symptomFeedback:
          'É esta linha que a mensagem aponta — o `await` —, e ela está certa: esperar o repositório é exatamente o que a rota precisa fazer. O que falta é a **função** em que o `await` está ter permissão para esperar. Veja a linha que abre a rota.',
        explanation:
          '`await` só é aceito dentro de uma função marcada com `async`. A função da rota, `(req, res) => { … }`, não está marcada — e o erro é de sintaxe: o arquivo nem começa a rodar. A mensagem aponta o `await`, mas a correção é na assinatura da função: `async (req, res) => { … }`.',
        hints: [
          'A mensagem diz onde o `await` está, não onde falta algo. Em que função ele está?',
          'O que uma função precisa ter na assinatura para poder usar `await`?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-8-escrever',
        type: 'server',
        prompt:
          'Com o mesmo repositório, escreva `POST /tarefas` — valida `titulo` (texto não vazio, senão **400** `{ erro: "titulo é obrigatório" }`), cria com `repositorio.criar({ titulo, feita: false })` e responde **201** com o que o repositório devolveu — e `DELETE /tarefas/:id`, que usa `repositorio.remover` (devolve `true` ou `false`): **204** sem corpo, ou **404** `{ erro: "Tarefa não encontrada" }`.',
        concepts: ['node-async', 'node-crud'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'async', 'post', 'delete'],
        arquivos: { './repositorio': REPOSITORIO },
        initialCode: `const express = require('express');
const repositorio = require('./repositorio');
const app = express();
app.use(express.json());

app.get('/tarefas', async (req, res) => {
  res.json(await repositorio.listar());
});

// POST /tarefas

// DELETE /tarefas/:id

app.listen(3000);
`,
        tests: [
          {
            description: 'POST /tarefas cria e responde 201 com { id: 3, titulo, feita: false }',
            assertion: `const res = await pedir(app, 'POST', '/tarefas', { body: { titulo: 'Fazer a API' } });
if (res.status !== 201 || !res.body || res.body.id !== 3 || res.body.titulo !== 'Fazer a API' || res.body.feita !== false) throw new Error('POST /tarefas respondeu ' + res.status + ' ' + res.texto + '; esperava 201 {"id":3,"titulo":"Fazer a API","feita":false}' + (res.texto === '{}' ? ' — faltou o await no criar' : ''));
const lista = await pedir(app, 'GET', '/tarefas');
if (!Array.isArray(lista.body) || lista.body.length !== 3) throw new Error('depois do POST, GET /tarefas deveria listar 3, veio ' + lista.texto);`,
          },
          {
            description: 'POST /tarefas sem titulo responde 400, e nada é criado',
            assertion: `const res = await pedir(app, 'POST', '/tarefas', { body: {} });
if (res.status !== 400 || !res.body || res.body.erro !== 'titulo é obrigatório') throw new Error('POST sem titulo respondeu ' + res.status + ' ' + res.texto + '; esperava 400 {"erro":"titulo é obrigatório"}');
const lista = await pedir(app, 'GET', '/tarefas');
if (!Array.isArray(lista.body) || lista.body.length !== 3) throw new Error('a lista deveria continuar com 3, veio ' + lista.texto + ' — valide antes de chamar o repositório');`,
          },
          {
            description: 'DELETE /tarefas/1 responde 204 e some da lista; DELETE /tarefas/1 de novo é 404',
            assertion: `const res = await pedir(app, 'DELETE', '/tarefas/1');
if (res.status !== 204) throw new Error('DELETE /tarefas/1 respondeu ' + res.status + ' ' + res.texto + '; esperava 204' + (res.status === 404 ? ' — o remover recebe um número, e o await está lá?' : ''));
const lista = await pedir(app, 'GET', '/tarefas');
if (!Array.isArray(lista.body) || lista.body.some((t) => t.id === 1)) throw new Error('depois do DELETE, a tarefa 1 não deveria estar na lista, veio ' + lista.texto);
const denovo = await pedir(app, 'DELETE', '/tarefas/1');
if (denovo.status !== 404 || !denovo.body || denovo.body.erro !== 'Tarefa não encontrada') throw new Error('o segundo DELETE respondeu ' + denovo.status + ' ' + denovo.texto + '; esperava 404 {"erro":"Tarefa não encontrada"} — remover devolve false quando não achou');`,
          },
        ],
        solution: `const express = require('express');
const repositorio = require('./repositorio');
const app = express();
app.use(express.json());

app.get('/tarefas', async (req, res) => {
  res.json(await repositorio.listar());
});

app.post('/tarefas', async (req, res) => {
  const { titulo } = req.body;
  if (typeof titulo !== 'string' || titulo.trim() === '') {
    return res.status(400).json({ erro: 'titulo é obrigatório' });
  }
  const tarefa = await repositorio.criar({ titulo: titulo.trim(), feita: false });
  res.status(201).json(tarefa);
});

app.delete('/tarefas/:id', async (req, res) => {
  const removeu = await repositorio.remover(Number(req.params.id));
  if (!removeu) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  res.status(204).end();
});

app.listen(3000);`,
        hints: [
          'Validar vem antes de chamar o repositório — e não precisa de await.',
          'No POST: `const tarefa = await repositorio.criar({ titulo, feita: false })`; é essa `tarefa` (com o id) que vai no 201.',
          'No DELETE: `const removeu = await repositorio.remover(Number(req.params.id))`; `false` é 404, `true` é 204.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-8-paralelo',
        type: 'multiple-choice',
        prompt:
          'A rota `GET /tarefas/:id/detalhes` precisa da tarefa e dos comentários dela, que vêm de duas buscas independentes de 50 ms cada. Qual versão responde em cerca de 50 ms, e não 100?',
        concepts: ['node-async'],
        difficulty: 'intermediario',
        tags: ['node', 'async', 'promise-all'],
        options: [
          '`const [tarefa, comentarios] = await Promise.all([repositorio.buscar(id), comentarios.deTarefa(id)]);`',
          '`const tarefa = await repositorio.buscar(id); const comentarios = await comentarios.deTarefa(id);`',
          '`const tarefa = repositorio.buscar(id); const comentarios = comentarios.deTarefa(id); res.json({ tarefa, comentarios });`',
          'Nenhuma: duas buscas sempre levam o dobro do tempo de uma',
        ],
        correctIndex: 0,
        explanation:
          'Dois `await` seguidos esperam um **depois** do outro: 100 ms. `Promise.all` dispara as duas buscas e espera as duas juntas: 50 ms. A terceira opção não espera nada — responde duas Promises, que viram `{}` no JSON. Quando as buscas dependem uma da outra (a segunda precisa do resultado da primeira), aí sim é em série.',
        hints: ['Qual versão começa a segunda busca antes de a primeira terminar?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-8-detalhes',
        type: 'server',
        prompt:
          'Escreva `GET /tarefas/:id/detalhes`, que responde `{ tarefa, comentarios }` — a tarefa de `repositorio.buscar(id)` e a lista de textos de `repositorio.comentariosDe(id)`, buscadas **em paralelo**. Se a tarefa não existe, **404** com `{ erro: "Tarefa não encontrada" }`. O repositório registra a ordem das chamadas, e o teste olha essa ordem.',
        concepts: ['node-async'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'async', 'promise-all'],
        arquivos: {
          './repositorio': `// Registra a ordem em que as buscas começam e terminam.
const chamadas = [];

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const tarefas = [{ id: 1, titulo: 'Estudar Node', feita: false }];
const comentarios = [
  { tarefaId: 1, texto: 'Começar pelo require' },
  { tarefaId: 1, texto: 'Depois o express()' },
];

module.exports = {
  chamadas,
  async buscar(id) {
    chamadas.push('buscar: início');
    await esperar(10);
    chamadas.push('buscar: fim');
    const tarefa = tarefas.find((t) => t.id === id);
    return tarefa ? { ...tarefa } : null;
  },
  async comentariosDe(id) {
    chamadas.push('comentários: início');
    await esperar(10);
    chamadas.push('comentários: fim');
    return comentarios.filter((c) => c.tarefaId === id).map((c) => c.texto);
  },
};
`,
        },
        initialCode: `const express = require('express');
const repositorio = require('./repositorio');
const app = express();

// GET /tarefas/:id/detalhes → { tarefa, comentarios }, buscados em paralelo.

app.listen(3000);
`,
        tests: [
          {
            description: 'GET /tarefas/1/detalhes responde a tarefa e os 2 comentários',
            assertion: `const res = await pedir(app, 'GET', '/tarefas/1/detalhes');
if (res.status !== 200) throw new Error('GET /tarefas/1/detalhes respondeu ' + res.status + ' ' + res.texto + '; esperava 200');
if (!res.body || !res.body.tarefa || res.body.tarefa.titulo !== 'Estudar Node') throw new Error('esperava tarefa: {titulo: "Estudar Node", …}, veio ' + res.texto + (res.texto.includes('"tarefa":{}') ? ' — uma Promise vira {}: faltou esperar' : ''));
if (!Array.isArray(res.body.comentarios) || res.body.comentarios.length !== 2) throw new Error('esperava comentarios com 2 textos, veio ' + res.texto);`,
          },
          {
            description: 'As duas buscas começaram antes de qualquer uma terminar (em paralelo)',
            assertion: `const ordem = require('./repositorio').chamadas.slice(0, 4);
if (JSON.stringify(ordem) !== JSON.stringify(['buscar: início', 'comentários: início', 'buscar: fim', 'comentários: fim'])) throw new Error('a ordem das chamadas foi ' + JSON.stringify(ordem) + '; em paralelo, as duas começam antes de a primeira terminar — use Promise.all');`,
          },
          {
            description: 'GET /tarefas/9/detalhes responde 404',
            assertion: `const res = await pedir(app, 'GET', '/tarefas/9/detalhes');
if (res.status !== 404 || !res.body || res.body.erro !== 'Tarefa não encontrada') throw new Error('GET /tarefas/9/detalhes respondeu ' + res.status + ' ' + res.texto + '; esperava 404 {"erro":"Tarefa não encontrada"}');`,
          },
        ],
        solution: `const express = require('express');
const repositorio = require('./repositorio');
const app = express();

app.get('/tarefas/:id/detalhes', async (req, res) => {
  const id = Number(req.params.id);
  const [tarefa, comentarios] = await Promise.all([repositorio.buscar(id), repositorio.comentariosDe(id)]);
  if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  res.json({ tarefa, comentarios });
});

app.listen(3000);`,
        hints: [
          'As duas buscas são independentes: uma não precisa do resultado da outra. Isso é caso de `Promise.all`.',
          '`const [tarefa, comentarios] = await Promise.all([repositorio.buscar(id), repositorio.comentariosDe(id)])` — e só depois o `if (!tarefa)`.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Dados de verdade moram num **banco**, e falar com ele é assíncrono. O servidor conhece um **repositório** — funções que devolvem Promises — e as rotas viram \`async\`, com \`await\` em cada acesso. O resto não muda.

Esquecer o \`await\` não quebra: responde \`{}\` com \`200\`, o erro silencioso. \`await\` fora de função \`async\` é erro de sintaxe, e a mensagem aponta o \`await\`, não a função.

O erro numa rota \`async\` vai para o middleware de erro, como qualquer outro — sem \`try/catch\` em cada rota. Buscas independentes vão em **paralelo** com \`Promise.all\`; dependentes, em série. E uma rota deve esperar muito e calcular pouco: a thread é uma só.

Na próxima aula, o que muda entre a sua máquina e a de produção: **configuração e segredos**, \`process.env\`, o \`.env\` e o que nunca vai para o Git.
`.trim(),
    },
  ],
};

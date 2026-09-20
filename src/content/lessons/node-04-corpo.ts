import type { Lesson } from '../types';

export const lessonNodeCorpo: Lesson = {
  id: 'lesson-node-4',
  trackId: 'track-node',
  title: 'Corpo e JSON: O POST',
  language: 'node',
  objective:
    'Receber dados no corpo do pedido com `express.json()`, criar um recurso com `POST`, responder `201` com o que foi criado — e recusar com `400` o que não serve.',
  concepts: ['node-corpo'],
  status: 'published',
  estimatedMinutes: 35,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Até aqui o servidor só **entregou** dados. Mas a página também **envia**: o formulário de nova tarefa, o cadastro, o comentário. Esses dados não cabem no caminho nem na consulta — vão no **corpo** do pedido. Um \`GET\` não tem corpo; um \`POST\` tem. Hoje o outro sentido.

## O corpo chega como texto — e o \`express.json()\` traduz

Quando a página faz \`fetch('/tarefas', { method: 'POST', body: JSON.stringify({ titulo: 'Estudar' }) })\`, o que viaja é **texto**: \`{"titulo":"Estudar"}\`, com o cabeçalho \`Content-Type: application/json\` dizendo o formato. O Express, sozinho, não lê esse texto. Quem lê é um **middleware**:

~~~js
const app = express();
app.use(express.json()); // antes das rotas!

app.post('/tarefas', (req, res) => {
  console.log(req.body); // { titulo: 'Estudar' }
  …
});
~~~

\`app.use(fn)\` quer dizer "todo pedido passa por aqui antes das rotas". O \`express.json()\` olha o \`Content-Type\`, converte o texto com \`JSON.parse\` e põe o resultado em \`req.body\`. **Sem ele, \`req.body\` é \`undefined\`** — o erro mais comum de quem começa, e a mensagem que ele produz não diz "falta o express.json()": diz \`Cannot read properties of undefined (reading 'titulo')\`. Quando vir isso num \`POST\`, é isso.

A ordem importa: o \`app.use\` precisa vir **antes** das rotas, pelo mesmo motivo da aula passada — o Express passa pelas camadas na ordem em que foram registradas.

## \`POST\` cria — e responde \`201\` com o que criou

~~~js
const tarefas = [];

app.post('/tarefas', (req, res) => {
  const tarefa = { id: tarefas.length + 1, titulo: req.body.titulo, feita: false };
  tarefas.push(tarefa);
  res.status(201).json(tarefa);
});
~~~

Três decisões aqui. O **\`id\` é do servidor**: quem cria o identificador é quem guarda, nunca quem pede — dois clientes escolhendo \`id: 1\` ao mesmo tempo é o caos. O status é **\`201 Created\`**, não \`200\`: "deu certo, e existe uma coisa nova". E a resposta é **o recurso criado**, com o \`id\` que ele ganhou — a página precisa dele para mostrar, editar ou apagar a tarefa depois.

## Nunca confie no corpo

\`req.body\` é o que **o outro lado** mandou. Pode vir sem o campo, com o campo vazio, com um número onde era texto, ou com campos que você nunca pediu. Uma rota que guarda \`req.body.titulo\` sem olhar guarda \`undefined\` na lista — e a página quebra três telas depois, longe da causa.

~~~js
app.post('/tarefas', (req, res) => {
  const { titulo } = req.body;
  if (typeof titulo !== 'string' || titulo.trim() === '') {
    return res.status(400).json({ erro: 'titulo é obrigatório' });
  }
  const tarefa = { id: tarefas.length + 1, titulo: titulo.trim(), feita: false };
  tarefas.push(tarefa);
  res.status(201).json(tarefa);
});
~~~

**\`400 Bad Request\`** é "o pedido está errado, e a culpa é de quem pediu" — com uma mensagem que diz **o quê**. E de novo o \`return\`: validou, recusou, saiu. Sem ele, a tarefa inválida entraria na lista mesmo depois do 400.

Repare que a rota monta o objeto **campo a campo** (\`titulo: titulo.trim()\`), em vez de \`tarefas.push(req.body)\`. Guardar o corpo inteiro guarda também o que ninguém pediu — um \`feita: true\` enviado de propósito, um \`id\` inventado.

## O padrão de toda rota que escreve

1. **Ler** o que veio (\`req.body\`, \`req.params\`).
2. **Validar** — e sair com \`400\` se não serve.
3. **Guardar** (na lista hoje; no banco, mais adiante).
4. **Responder** com o status certo e o que foi criado.

É a mesma ordem em toda API que você vai escrever. Vale decorar — ou melhor, entender por que cada passo vem antes do seguinte.

## JSON não é "um objeto JavaScript escrito"

O texto que viaja é **JSON**, e o JSON é mais rígido que um objeto no código: chaves **entre aspas duplas**, textos **entre aspas duplas**, sem vírgula sobrando, sem comentários. \`{ titulo: 'Estudar' }\` é JavaScript válido e JSON inválido. Quando o corpo chega assim, o \`express.json()\` nem chama a sua rota: responde \`400\` sozinho.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `const express = require('express');
const app = express();
app.use(express.json());

const comentarios = [];

// POST /comentarios: ler, validar, guardar, responder.
app.post('/comentarios', (req, res) => {
  const { autor, texto } = req.body;
  if (typeof autor !== 'string' || autor.trim() === '') {
    return res.status(400).json({ erro: 'autor é obrigatório' });
  }
  if (typeof texto !== 'string' || texto.trim() === '') {
    return res.status(400).json({ erro: 'texto é obrigatório' });
  }
  const comentario = { id: comentarios.length + 1, autor: autor.trim(), texto: texto.trim() };
  comentarios.push(comentario);
  res.status(201).json(comentario);
});

app.get('/comentarios', (req, res) => res.json(comentarios));

app.listen(3000);`,
      caption:
        'Um recurso que se escreve: express.json() antes de tudo, a validação campo a campo com 400 e return, o id do servidor, e o 201 com o que foi criado.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-4-criar',
        type: 'server',
        prompt:
          'Escreva `POST /tarefas`: cria `{ id, titulo, feita: false }` com o `titulo` que veio no corpo, guarda em `tarefas` e responde **201** com a tarefa criada. O `id` é a posição na lista mais um. Lembre do que precisa vir antes para o corpo chegar.',
        concepts: ['node-corpo'],
        difficulty: 'iniciante',
        tags: ['node', 'express', 'post', 'json'],
        initialCode: `const express = require('express');
const app = express();

const tarefas = [];

app.get('/tarefas', (req, res) => {
  res.json(tarefas);
});

// POST /tarefas → cria a tarefa e responde 201 com ela.

app.listen(3000);
`,
        tests: [
          {
            description: 'POST /tarefas responde 201 com { id: 1, titulo: "Estudar Node", feita: false }',
            assertion: `const res = await pedir(app, 'POST', '/tarefas', { body: { titulo: 'Estudar Node' } });
if (res.status !== 201) throw new Error('POST /tarefas respondeu ' + res.status + '; esperava 201 (criado). Corpo: ' + res.texto + (res.status === 500 && res.texto.includes('undefined') ? ' — req.body veio vazio: o express.json() precisa estar registrado antes das rotas' : ''));
if (!res.body || res.body.id !== 1 || res.body.titulo !== 'Estudar Node' || res.body.feita !== false) throw new Error('esperava {id: 1, titulo: "Estudar Node", feita: false}, veio ' + res.texto);`,
          },
          {
            description: 'Depois do POST, GET /tarefas lista a tarefa criada',
            assertion: `const res = await pedir(app, 'GET', '/tarefas');
if (!Array.isArray(res.body) || res.body.length !== 1 || res.body[0].titulo !== 'Estudar Node') throw new Error('GET /tarefas deveria listar a tarefa criada, veio ' + res.texto + ' — a rota precisa guardar a tarefa na lista');`,
          },
          {
            description: 'O segundo POST recebe id 2, e a lista passa a ter duas',
            assertion: `const res = await pedir(app, 'POST', '/tarefas', { body: { titulo: 'Fazer a API' } });
if (!res.body || res.body.id !== 2) throw new Error('a segunda tarefa deveria receber id 2, veio ' + res.texto);
const lista = await pedir(app, 'GET', '/tarefas');
if (!Array.isArray(lista.body) || lista.body.length !== 2) throw new Error('GET /tarefas deveria listar 2 tarefas, veio ' + lista.texto);`,
          },
        ],
        solution: `const express = require('express');
const app = express();
app.use(express.json());

const tarefas = [];

app.get('/tarefas', (req, res) => {
  res.json(tarefas);
});

app.post('/tarefas', (req, res) => {
  const tarefa = { id: tarefas.length + 1, titulo: req.body.titulo, feita: false };
  tarefas.push(tarefa);
  res.status(201).json(tarefa);
});

app.listen(3000);`,
        hints: [
          'O corpo só chega em `req.body` se o `express.json()` estiver registrado com `app.use`, antes das rotas.',
          'Monte a tarefa com `{ id: tarefas.length + 1, titulo: req.body.titulo, feita: false }` e dê `push` na lista.',
          'Criou? `res.status(201).json(tarefa)`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-4-sem-json',
        type: 'multiple-choice',
        prompt:
          'A rota `POST /tarefas` faz `const { titulo } = req.body` e o servidor responde 500: "Cannot destructure property \'titulo\' of req.body as it is undefined". A página enviou `{"titulo":"Estudar"}` com `Content-Type: application/json`. O que falta?',
        concepts: ['node-corpo'],
        difficulty: 'iniciante',
        tags: ['node', 'express', 'json', 'middleware'],
        options: [
          '`app.use(express.json())` antes das rotas: sem ele o Express não lê o corpo, e `req.body` fica `undefined`',
          'A página precisa mandar os dados na consulta, `?titulo=Estudar`, porque o corpo não chega em rotas',
          'A rota precisa ser `app.get`, porque só o GET preenche o `req.body`',
          'Falta `await req.body`, porque o corpo chega depois da rota começar',
        ],
        correctIndex: 0,
        explanation:
          'O corpo viaja como texto, e é o middleware `express.json()` que converte o texto em objeto e o põe em `req.body`. Sem ele, o campo nem existe — e o erro aparece na primeira linha que tenta usá-lo, com uma mensagem que não menciona a causa.',
        hints: ['Quem transforma o texto do corpo em `req.body`? Isso está registrado?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-4-ordem',
        type: 'predict-output',
        prompt:
          'O que este programa imprime? A última linha é o cliente dos exercícios fazendo um POST com `{ nome: "Ana" }` no corpo.',
        concepts: ['node-corpo'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'middleware', 'ordem'],
        code: `const express = require('express');
const app = express();

app.post('/eco', (req, res) => {
  console.log(req.body === undefined ? 'req.body está vazio' : 'chegou: ' + req.body.nome);
  res.json({ ok: true });
});

app.use(express.json());

pedir(app, 'POST', '/eco', { body: { nome: 'Ana' } });`,
        expectedOutput: 'req.body está vazio',
        explanation:
          'O `express.json()` foi registrado **depois** da rota. O Express passa pelas camadas na ordem em que foram registradas: o pedido casa com a rota primeiro, a rota responde, e o middleware que leria o corpo nunca é alcançado. `app.use(express.json())` vai antes das rotas — sempre.',
        hints: ['Em que ordem o pedido passa pela rota e pelo middleware? Qual dos dois foi registrado primeiro?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-4-validar',
        type: 'server',
        prompt:
          'A rota cria a tarefa sem olhar o que veio. Valide: se `titulo` não for um texto, ou for vazio (só espaços conta como vazio), responda **400** com `{ erro: "titulo é obrigatório" }` — e a tarefa inválida não pode entrar na lista.',
        concepts: ['node-corpo'],
        difficulty: 'iniciante',
        tags: ['node', 'express', 'validacao', '400'],
        initialCode: `const express = require('express');
const app = express();
app.use(express.json());

const tarefas = [];

app.get('/tarefas', (req, res) => res.json(tarefas));

app.post('/tarefas', (req, res) => {
  const { titulo } = req.body;
  // Validar aqui: 400 se o titulo não serve.
  const tarefa = { id: tarefas.length + 1, titulo, feita: false };
  tarefas.push(tarefa);
  res.status(201).json(tarefa);
});

app.listen(3000);
`,
        tests: [
          {
            description: 'POST /tarefas sem titulo responde 400 com { erro: "titulo é obrigatório" }',
            assertion: `const res = await pedir(app, 'POST', '/tarefas', { body: {} });
if (res.status !== 400) throw new Error('POST sem titulo respondeu ' + res.status + '; esperava 400. Corpo: ' + res.texto);
if (!res.body || res.body.erro !== 'titulo é obrigatório') throw new Error('o corpo do 400 deveria ser {"erro":"titulo é obrigatório"}, veio ' + res.texto);`,
          },
          {
            description: 'Titulo só de espaços, ou um número, também recebem 400',
            assertion: `const espacos = await pedir(app, 'POST', '/tarefas', { body: { titulo: '   ' } });
if (espacos.status !== 400) throw new Error('titulo "   " (só espaços) respondeu ' + espacos.status + '; esperava 400 — use trim() antes de comparar com vazio');
const numero = await pedir(app, 'POST', '/tarefas', { body: { titulo: 42 } });
if (numero.status !== 400) throw new Error('titulo 42 (um número) respondeu ' + numero.status + '; esperava 400 — confira o typeof');`,
          },
          {
            description: 'Um titulo válido responde 201, e só ele entra na lista',
            assertion: `const res = await pedir(app, 'POST', '/tarefas', { body: { titulo: 'Estudar Node' } });
if (res.status !== 201 || !res.body || res.body.titulo !== 'Estudar Node') throw new Error('POST válido respondeu ' + res.status + ' ' + res.texto + '; esperava 201 com a tarefa');
const lista = await pedir(app, 'GET', '/tarefas');
if (!Array.isArray(lista.body) || lista.body.length !== 1) throw new Error('a lista deveria ter só a tarefa válida (1), tem ' + lista.texto + ' — o 400 precisa sair da rota com return, senão a inválida entra');`,
          },
        ],
        solution: `const express = require('express');
const app = express();
app.use(express.json());

const tarefas = [];

app.get('/tarefas', (req, res) => res.json(tarefas));

app.post('/tarefas', (req, res) => {
  const { titulo } = req.body;
  if (typeof titulo !== 'string' || titulo.trim() === '') {
    return res.status(400).json({ erro: 'titulo é obrigatório' });
  }
  const tarefa = { id: tarefas.length + 1, titulo, feita: false };
  tarefas.push(tarefa);
  res.status(201).json(tarefa);
});

app.listen(3000);`,
        hints: [
          'Duas perguntas: é texto? (`typeof titulo !== "string"`) e, sendo texto, sobra algo depois do `trim()`?',
          'Se não serve: `return res.status(400).json({ erro: "titulo é obrigatório" })` — o `return` é o que impede a tarefa de entrar.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-4-fluxo',
        type: 'order-steps',
        prompt:
          'Coloque na ordem as linhas de um servidor com `POST /pedidos`, que cria um pedido a partir do corpo.',
        concepts: ['node-corpo'],
        difficulty: 'iniciante',
        tags: ['node', 'express', 'post', 'fluxo'],
        steps: [
          { id: 'json', text: '`app.use(express.json());` — para o corpo chegar em `req.body`', ordem: 1 },
          { id: 'rota', text: "`app.post('/pedidos', (req, res) => {` — a rota que recebe o pedido", ordem: 2 },
          { id: 'ler', text: '`const { produto, quantidade } = req.body;` — ler o que veio', ordem: 3 },
          {
            id: 'validar',
            text: "`if (!produto || quantidade <= 0) return res.status(400).json({ erro: 'pedido inválido' });` — validar, e sair",
            ordem: 4,
          },
          {
            id: 'montar',
            text: '`const pedido = { id: pedidos.length + 1, produto, quantidade };` — montar, com o id do servidor',
            ordem: 5,
          },
          { id: 'guardar', text: '`pedidos.push(pedido);` — guardar', ordem: 6 },
          { id: 'responder', text: '`res.status(201).json(pedido);` — responder 201 com o que foi criado', ordem: 7 },
          { id: 'listen', text: '`});` e `app.listen(3000);` — fechar a rota e subir o servidor', ordem: 8 },
        ],
        explanation:
          'O middleware vem antes de tudo, senão o corpo não chega. Dentro da rota, a ordem é a de toda escrita: ler, validar (e sair com 400), montar com o id do servidor, guardar, responder 201. Validar depois de guardar deixaria o pedido inválido na lista.',
        hints: [
          'O que precisa existir antes de qualquer rota conseguir ler o corpo?',
          'Dentro da rota: primeiro se lê, depois se decide se serve, e só então se guarda.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-4-json-estrito',
        type: 'find-bug',
        prompt:
          'O servidor nem sobe: "Unexpected token t in JSON at position 3" (ou parecido, dependendo do navegador). Aponte a linha que precisa mudar.',
        concepts: ['node-corpo'],
        difficulty: 'iniciante',
        tags: ['node', 'json', 'bug'],
        code: `const express = require('express');
const app = express();
app.use(express.json());

const tarefas = [];

function criar(titulo) {
  const tarefa = { id: tarefas.length + 1, titulo, feita: false };
  tarefas.push(tarefa);
  return tarefa;
}

app.post('/tarefas', (req, res) => {
  res.status(201).json(criar(req.body.titulo));
});

// As tarefas iniciais vêm de um JSON guardado como texto:
const iniciais = JSON.parse("[{ titulo: 'Estudar Node' }, { titulo: 'Fazer a API' }]");
iniciais.forEach((t) => criar(t.titulo));

app.listen(3000);`,
        buggyLine: 18,
        fix: `const iniciais = JSON.parse('[{ "titulo": "Estudar Node" }, { "titulo": "Fazer a API" }]');`,
        explanation:
          "JSON é mais rígido que um objeto JavaScript: as chaves e os textos vão **entre aspas duplas**, sempre. `{ titulo: 'Estudar Node' }` é JavaScript válido e JSON inválido, e o `JSON.parse` para na primeira letra fora do lugar. É o mesmo texto que uma página envia no corpo — e, quando ele chega assim, o `express.json()` responde 400 antes da rota.",
        hints: [
          'A mensagem diz que o problema é no JSON. Onde há JSON escrito à mão neste arquivo?',
          'Compare o texto dentro do `JSON.parse` com o que um `JSON.stringify` produziria: as aspas são as mesmas?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-4-alunos',
        type: 'server',
        prompt:
          'Monte o cadastro de alunos: `POST /alunos` recebe `{ nome, idade }` e valida — `nome` precisa ser um texto não vazio (senão **400** com `{ erro: "nome é obrigatório" }`), e `idade` precisa ser um número (senão **400** com `{ erro: "idade precisa ser um número" }`); válido, guarda e responde **201** com `{ id, nome, idade }`. E `GET /alunos/:id` devolve o aluno, ou **404** com `{ erro: "Aluno não encontrado" }`.',
        concepts: ['node-corpo', 'node-rotas'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'post', 'validacao', 'recurso'],
        initialCode: `const express = require('express');
const app = express();
app.use(express.json());

const alunos = [];

// POST /alunos: validar nome e idade, guardar, 201.

// GET /alunos/:id: o aluno, ou 404.

app.listen(3000);
`,
        tests: [
          {
            description: 'POST /alunos sem nome responde 400 com { erro: "nome é obrigatório" }',
            assertion: `const res = await pedir(app, 'POST', '/alunos', { body: { idade: 20 } });
if (res.status !== 400 || !res.body || res.body.erro !== 'nome é obrigatório') throw new Error('POST sem nome respondeu ' + res.status + ' ' + res.texto + '; esperava 400 {"erro":"nome é obrigatório"}');`,
          },
          {
            description: 'POST /alunos com idade em texto responde 400 com { erro: "idade precisa ser um número" }',
            assertion: `const res = await pedir(app, 'POST', '/alunos', { body: { nome: 'Ana', idade: 'vinte' } });
if (res.status !== 400 || !res.body || res.body.erro !== 'idade precisa ser um número') throw new Error('POST com idade "vinte" respondeu ' + res.status + ' ' + res.texto + '; esperava 400 {"erro":"idade precisa ser um número"} — typeof idade !== "number"');`,
          },
          {
            description: 'POST válido responde 201 com id 1; GET /alunos/1 devolve o mesmo aluno; GET /alunos/2 é 404',
            assertion: `const criado = await pedir(app, 'POST', '/alunos', { body: { nome: 'Ana', idade: 20 } });
if (criado.status !== 201 || !criado.body || criado.body.id !== 1 || criado.body.nome !== 'Ana' || criado.body.idade !== 20) throw new Error('POST válido respondeu ' + criado.status + ' ' + criado.texto + '; esperava 201 {"id":1,"nome":"Ana","idade":20}');
const um = await pedir(app, 'GET', '/alunos/1');
if (um.status !== 200 || !um.body || um.body.nome !== 'Ana') throw new Error('GET /alunos/1 respondeu ' + um.status + ' ' + um.texto + '; esperava 200 com a Ana — lembre que req.params.id é texto');
const nada = await pedir(app, 'GET', '/alunos/2');
if (nada.status !== 404 || !nada.body || nada.body.erro !== 'Aluno não encontrado') throw new Error('GET /alunos/2 respondeu ' + nada.status + ' ' + nada.texto + '; esperava 404 {"erro":"Aluno não encontrado"}');`,
          },
        ],
        solution: `const express = require('express');
const app = express();
app.use(express.json());

const alunos = [];

app.post('/alunos', (req, res) => {
  const { nome, idade } = req.body;
  if (typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ erro: 'nome é obrigatório' });
  }
  if (typeof idade !== 'number') {
    return res.status(400).json({ erro: 'idade precisa ser um número' });
  }
  const aluno = { id: alunos.length + 1, nome: nome.trim(), idade };
  alunos.push(aluno);
  res.status(201).json(aluno);
});

app.get('/alunos/:id', (req, res) => {
  const aluno = alunos.find((a) => a.id === Number(req.params.id));
  if (!aluno) return res.status(404).json({ erro: 'Aluno não encontrado' });
  res.json(aluno);
});

app.listen(3000);`,
        hints: [
          'No POST: ler `{ nome, idade }` do corpo, um `if` com `return` para cada regra, montar o aluno com `id: alunos.length + 1`, `push`, 201.',
          'Nome: `typeof nome !== "string" || nome.trim() === ""`. Idade: `typeof idade !== "number"`.',
          'No GET: `alunos.find((a) => a.id === Number(req.params.id))`, e 404 com `return` quando não achou.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
O corpo do pedido viaja como **texto JSON**; \`app.use(express.json())\`, **antes das rotas**, é o que o transforma em \`req.body\`. Sem ele, \`req.body\` é \`undefined\` — e o erro aparece longe da causa.

\`POST\` cria: o **id é do servidor**, o status é **\`201\`**, e a resposta é o recurso criado. Antes de guardar, **validar**: o corpo é o que o outro lado mandou, e \`400\` com uma mensagem clara é a resposta para o que não serve — com \`return\`, para o inválido não entrar.

Toda rota que escreve segue a mesma ordem: **ler, validar, guardar, responder**.

Na próxima aula, o que fazer quando algo dá errado **do lado do servidor**: os status por família, o middleware de erro e uma resposta de erro que a página consegue ler.
`.trim(),
    },
  ],
};

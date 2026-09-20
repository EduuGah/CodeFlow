import type { Lesson } from '../types';

export const lessonNodeErros: Lesson = {
  id: 'lesson-node-5',
  trackId: 'track-node',
  title: 'Status e Erros: Falhar Bem',
  language: 'node',
  objective:
    'Escolher o status certo por família, tratar todo erro num lugar só com o middleware de erro, e responder falhas num formato que a página consegue ler — sem vazar o que é interno.',
  concepts: ['node-erros'],
  status: 'published',
  estimatedMinutes: 35,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Quem pede não vê o seu código. Vê **o status e o corpo** da resposta — e é com isso que a página decide se mostra a tarefa, uma mensagem de "não encontrado" ou um "tente de novo". Uma API que responde \`200\` para tudo, com \`{ ok: false }\` no corpo, obriga a página a adivinhar. Hoje: falhar de um jeito que se entende.

## As famílias

O primeiro dígito do status é a família, e a família já diz quase tudo:

| Família | Quer dizer | Os que você vai usar |
| --- | --- | --- |
| \`2xx\` | deu certo | \`200\` OK · \`201\` criado · \`204\` feito, sem corpo |
| \`4xx\` | o pedido está errado — a culpa é de quem pediu | \`400\` pedido inválido · \`401\` sem identificação · \`403\` sem permissão · \`404\` não existe · \`409\` conflito com o que já existe |
| \`5xx\` | o servidor falhou — a culpa é nossa | \`500\` erro interno |

A pergunta que escolhe a família: **quem consertaria?** Se é quem pediu (faltou o título, o id não existe, o e-mail já está cadastrado), \`4xx\`. Se é você (o banco caiu, uma variável veio \`undefined\`, um \`throw\` que ninguém previu), \`5xx\`. Dentro do \`4xx\`, o número diz **o que** está errado: \`400\` o conteúdo, \`404\` o alvo, \`409\` o estado — "esse e-mail já existe" não é um pedido malformado, é um pedido que conflita com o que já está lá.

## O erro que você não previu vira 500

~~~js
app.get('/relatorio', (req, res) => {
  const total = calcularTotal(vendas); // e se vendas for undefined?
  res.json({ total });
});
~~~

Se \`calcularTotal\` lança, o Express captura o erro e responde **\`500\`** sozinho — com uma página de erro em HTML, com o rastro da pilha, que a sua página não sabe ler e que conta ao mundo como o servidor é por dentro. Melhor que travar; longe do bom. O bom é decidir, num lugar só, como todo erro vira resposta.

## O middleware de erro

Um middleware com **quatro** parâmetros é um middleware de erro. O Express o reconhece pelo número de parâmetros, e só o chama quando um erro acontece — seja por \`throw\` dentro de uma rota, seja por \`next(erro)\`:

~~~js
app.use((erro, req, res, next) => {
  console.error(erro);                        // para você: o erro inteiro
  res.status(500).json({ erro: 'Erro interno' }); // para quem pediu: o mínimo
});
~~~

Ele vai **por último**, depois de todas as rotas — o erro caminha para a frente, e um middleware de erro antes das rotas nunca seria alcançado. Repare na divisão: **o detalhe fica no log do servidor; a resposta é genérica.** A mensagem de um erro interno pode conter o nome de uma tabela, um caminho de arquivo, um pedaço de SQL. Nada disso é da conta de quem pediu, e tudo isso ajuda quem quer atacar.

Quando o erro é previsto, o \`next(erro)\` faz o mesmo caminho: a rota decide que não consegue seguir e entrega o erro para a frente. Os middlewares comuns são pulados; só os de erro recebem.

## Erros com status

O middleware acima transforma **tudo** em \`500\` — inclusive um "aula não encontrada", que é \`404\`. A solução é um erro que **carrega o status**:

~~~js
class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

app.get('/aulas/:id', (req, res) => {
  const aula = aulas.find((a) => a.id === Number(req.params.id));
  if (!aula) throw new ErroHttp(404, 'Aula não encontrada');
  res.json(aula);
});

app.use((erro, req, res, next) => {
  const status = erro.status || 500;
  res.status(status).json({ erro: status === 500 ? 'Erro interno' : erro.message });
});
~~~

Agora as rotas só dizem **o que** deu errado (\`throw new ErroHttp(409, 'email já cadastrado')\`), e um único lugar decide **como** isso vira resposta. Erro com status é da família \`4xx\`: a mensagem vai para quem pediu, porque é quem pode consertar. Erro sem status é um acidente: \`500\`, mensagem genérica. As rotas ficam menores, e o formato do erro passa a ser um só.

## Um formato só

\`{ erro: 'texto' }\` em toda resposta de falha. A página aprende a ler \`dados.erro\` uma vez e funciona para \`400\`, \`404\`, \`409\` e \`500\`. APIs que respondem \`{ message }\` numa rota, \`{ error: { msg } }\` em outra e texto puro na terceira obrigam a página a ter um \`if\` por rota — e o primeiro \`if\` esquecido é uma tela em branco.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `const express = require('express');
const app = express();
app.use(express.json());

class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

const aulas = [{ id: 1, titulo: 'Variáveis' }];

app.get('/aulas/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new ErroHttp(400, 'id precisa ser um número');
  const aula = aulas.find((a) => a.id === id);
  if (!aula) throw new ErroHttp(404, 'Aula não encontrada');
  res.json(aula);
});

app.get('/relatorio', (req, res) => {
  throw new Error('tabela vendas não existe'); // um acidente: vira 500 genérico
});

// Por último: todo erro passa aqui, e vira uma resposta no mesmo formato.
app.use((erro, req, res, next) => {
  const status = erro.status || 500;
  if (status === 500) console.error(erro);
  res.status(status).json({ erro: status === 500 ? 'Erro interno' : erro.message });
});

app.listen(3000);`,
      caption:
        'As rotas dizem o que deu errado, com o status no erro; o middleware de erro, por último, decide como isso vira resposta. O acidente do /relatorio vira 500 sem contar o nome da tabela.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-5-familia',
        type: 'multiple-choice',
        prompt:
          '`POST /usuarios` recebe um cadastro completo e bem formado, mas o e-mail já pertence a outro usuário. Qual status responder?',
        concepts: ['node-erros'],
        difficulty: 'iniciante',
        tags: ['node', 'http', 'status'],
        options: [
          '`409 Conflict`: o pedido está bem formado, mas conflita com o que já existe no servidor',
          '`400 Bad Request`: qualquer recusa de cadastro é 400',
          '`500 Internal Server Error`: o servidor não conseguiu cadastrar',
          '`200 OK` com `{ ok: false, motivo: "email repetido" }` no corpo, para a página decidir',
        ],
        correctIndex: 0,
        explanation:
          'Quem consertaria? Quem pediu — então é 4xx, não 500. E o que está errado não é o conteúdo do pedido (isso seria 400), é o estado: o e-mail já está lá. Isso é 409. Responder 200 com um aviso no corpo obriga a página a ler o corpo para descobrir que falhou — e o status existe justamente para isso.',
        hints: ['Primeiro a família: quem consertaria esse problema? Depois, dentro dela: o que está errado é o conteúdo, o alvo, ou o estado?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-5-generico',
        type: 'server',
        prompt:
          'A rota `/relatorio` quebra por um motivo interno, e a resposta padrão conta o motivo para quem pediu. Escreva o middleware de erro, por último: responde **500** com `{ erro: "Erro interno" }` — sem a mensagem original.',
        concepts: ['node-erros'],
        difficulty: 'iniciante',
        tags: ['node', 'express', 'erros', 'middleware'],
        initialCode: `const express = require('express');
const app = express();

app.get('/ping', (req, res) => res.send('pong'));

app.get('/relatorio', (req, res) => {
  // Um acidente: a tabela não existe.
  throw new Error('tabela vendas não existe');
});

// O middleware de erro, por último.

app.listen(3000);
`,
        tests: [
          {
            description: 'GET /relatorio responde 500 com { erro: "Erro interno" }, sem o motivo original',
            assertion: `const res = await pedir(app, 'GET', '/relatorio');
if (res.status !== 500) throw new Error('GET /relatorio respondeu ' + res.status + '; esperava 500. Corpo: ' + res.texto);
if (!res.body || res.body.erro !== 'Erro interno') throw new Error('o corpo deveria ser {"erro":"Erro interno"}, veio ' + res.texto + (res.texto.includes('tabela') ? ' — a mensagem interna vazou para quem pediu' : ''));`,
          },
          {
            description: 'GET /ping continua respondendo "pong" com 200',
            assertion: `const res = await pedir(app, 'GET', '/ping');
if (res.status !== 200 || res.texto !== 'pong') throw new Error('GET /ping respondeu ' + res.status + ' "' + res.texto + '"; esperava 200 "pong" — o middleware de erro não pode interferir nas rotas que dão certo');`,
          },
        ],
        solution: `const express = require('express');
const app = express();

app.get('/ping', (req, res) => res.send('pong'));

app.get('/relatorio', (req, res) => {
  throw new Error('tabela vendas não existe');
});

app.use((erro, req, res, next) => {
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno' });
});

app.listen(3000);`,
        hints: [
          'Um middleware de erro é `app.use((erro, req, res, next) => { … })` — os quatro parâmetros são o que o diferencia dos comuns, mesmo que você não use o último.',
          'Dentro dele: `res.status(500).json({ erro: "Erro interno" })`. O `erro.message` fica no `console.error`, não na resposta.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-5-next',
        type: 'predict-output',
        prompt:
          'O que este programa imprime, e em que ordem? A última linha é o cliente dos exercícios pedindo `GET /x` e imprimindo o status que voltou.',
        concepts: ['node-erros'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'erros', 'next'],
        code: `const express = require('express');
const app = express();

app.get('/x', (req, res, next) => {
  console.log('rota');
  next(new Error('falhou'));
});

app.use((req, res, next) => {
  console.log('middleware comum');
  next();
});

app.use((erro, req, res, next) => {
  console.log('middleware de erro: ' + erro.message);
  res.status(500).json({ erro: 'Erro interno' });
});

pedir(app, 'GET', '/x').then((r) => console.log('status ' + r.status));`,
        expectedOutput: `rota
middleware de erro: falhou
status 500`,
        explanation:
          'Depois de `next(erro)`, o Express pula os middlewares comuns e entrega o erro ao primeiro middleware **de erro** — o de quatro parâmetros. O "middleware comum" nunca roda para este pedido. O de erro responde 500, e é esse status que o cliente imprime.',
        hints: ['Com um erro em mãos, quais middlewares o Express ainda chama: os de três parâmetros, os de quatro, ou os dois?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-5-com-status',
        type: 'server',
        prompt:
          'As rotas já lançam `ErroHttp` com o status certo, e `/relatorio` lança um erro comum. Escreva o middleware de erro que usa o `status` do erro quando ele existe (com a mensagem dele) e responde **500** com `{ erro: "Erro interno" }` quando não existe.',
        concepts: ['node-erros'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'erros', 'status'],
        initialCode: `const express = require('express');
const app = express();

class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

const aulas = [{ id: 1, titulo: 'Variáveis' }];

app.get('/aulas/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new ErroHttp(400, 'id precisa ser um número');
  const aula = aulas.find((a) => a.id === id);
  if (!aula) throw new ErroHttp(404, 'Aula não encontrada');
  res.json(aula);
});

app.get('/relatorio', (req, res) => {
  throw new Error('disco cheio');
});

// O middleware de erro: o status do erro, ou 500 genérico.

app.listen(3000);
`,
        tests: [
          {
            description: 'GET /aulas/99 responde 404 com { erro: "Aula não encontrada" }',
            assertion: `const res = await pedir(app, 'GET', '/aulas/99');
if (res.status !== 404 || !res.body || res.body.erro !== 'Aula não encontrada') throw new Error('GET /aulas/99 respondeu ' + res.status + ' ' + res.texto + '; esperava 404 {"erro":"Aula não encontrada"} — o status vem do erro');`,
          },
          {
            description: 'GET /aulas/abc responde 400 com { erro: "id precisa ser um número" }',
            assertion: `const res = await pedir(app, 'GET', '/aulas/abc');
if (res.status !== 400 || !res.body || res.body.erro !== 'id precisa ser um número') throw new Error('GET /aulas/abc respondeu ' + res.status + ' ' + res.texto + '; esperava 400 {"erro":"id precisa ser um número"}');`,
          },
          {
            description: 'GET /relatorio responde 500 com { erro: "Erro interno" }, sem "disco cheio"',
            assertion: `const res = await pedir(app, 'GET', '/relatorio');
if (res.status !== 500 || !res.body || res.body.erro !== 'Erro interno') throw new Error('GET /relatorio respondeu ' + res.status + ' ' + res.texto + '; esperava 500 {"erro":"Erro interno"}' + (res.texto.includes('disco') ? ' — a mensagem de um erro sem status é interna e não pode sair' : ''));
const ok = await pedir(app, 'GET', '/aulas/1');
if (ok.status !== 200 || !ok.body || ok.body.titulo !== 'Variáveis') throw new Error('GET /aulas/1 deveria continuar respondendo 200 com a aula, veio ' + ok.status + ' ' + ok.texto);`,
          },
        ],
        solution: `const express = require('express');
const app = express();

class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

const aulas = [{ id: 1, titulo: 'Variáveis' }];

app.get('/aulas/:id', (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new ErroHttp(400, 'id precisa ser um número');
  const aula = aulas.find((a) => a.id === id);
  if (!aula) throw new ErroHttp(404, 'Aula não encontrada');
  res.json(aula);
});

app.get('/relatorio', (req, res) => {
  throw new Error('disco cheio');
});

app.use((erro, req, res, next) => {
  const status = erro.status || 500;
  res.status(status).json({ erro: status === 500 ? 'Erro interno' : erro.message });
});

app.listen(3000);`,
        hints: [
          'Comece por `const status = erro.status || 500` — um erro comum não tem `status`.',
          'A mensagem só sai quando o status é da família 4xx; em 500, é sempre "Erro interno".',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-5-chamou',
        type: 'find-bug',
        prompt:
          'O servidor quebra antes de subir: "Cannot read properties of undefined (reading \'status\')". Aponte a linha que precisa mudar.',
        concepts: ['node-erros'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'middleware', 'bug'],
        code: `const express = require('express');
const app = express();

function tratarErros(erro, req, res, next) {
  const status = erro.status || 500;
  res.status(status).json({ erro: status === 500 ? 'Erro interno' : erro.message });
}

app.get('/aulas/:id', (req, res) => {
  const erro = new Error('Aula não encontrada');
  erro.status = 404;
  throw erro;
});

app.use(tratarErros());

app.listen(3000);`,
        buggyLine: 15,
        fix: 'app.use(tratarErros);',
        symptomLine: 5,
        symptomFeedback:
          'É aqui que o erro aparece — `erro` está `undefined` —, mas esta linha está certa: quando o Express chama o middleware, o erro vem preenchido. O problema é que **não foi o Express** que chamou esta função. Veja onde ela foi registrada.',
        explanation:
          '`express.json()` se chama com parênteses porque é uma **fábrica**: a chamada devolve o middleware. `tratarErros` já **é** o middleware — chamá-lo na hora de registrar executa a função sem argumentos, com `erro` vazio, e o `app.use` recebe o que ela devolveu (`undefined`), não ela. Registrar é passar a função: `app.use(tratarErros)`.',
        hints: [
          'A mensagem diz que `erro` está vazio. Quem chamou `tratarErros` sem passar um erro?',
          'Uma coisa é passar uma função para o `app.use`; outra é passar o resultado de chamá-la.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-5-cadastro',
        type: 'server',
        prompt:
          'Monte o cadastro com erros bem escolhidos, tudo lançando `ErroHttp` e um só middleware de erro por último: `POST /usuarios` recebe `{ email }` — sem `email` (texto vazio ou ausente), **400** `"email é obrigatório"`; e-mail já cadastrado, **409** `"email já cadastrado"`; válido, **201** com `{ id, email }`. `GET /usuarios/:id` devolve o usuário, ou **404** `"Usuário não encontrado"`. Toda falha no formato `{ erro }`.',
        concepts: ['node-erros', 'node-corpo'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'erros', '409', 'recurso'],
        initialCode: `const express = require('express');
const app = express();
app.use(express.json());

class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

const usuarios = [];

// POST /usuarios: 400 sem email, 409 se já existe, 201 com { id, email }.

// GET /usuarios/:id: o usuário, ou 404.

// O middleware de erro, por último.

app.listen(3000);
`,
        tests: [
          {
            description: 'POST /usuarios sem email responde 400 com { erro: "email é obrigatório" }',
            assertion: `const res = await pedir(app, 'POST', '/usuarios', { body: {} });
if (res.status !== 400 || !res.body || res.body.erro !== 'email é obrigatório') throw new Error('POST sem email respondeu ' + res.status + ' ' + res.texto + '; esperava 400 {"erro":"email é obrigatório"}');`,
          },
          {
            description: 'POST /usuarios com um email novo responde 201 com { id: 1, email }',
            assertion: `const res = await pedir(app, 'POST', '/usuarios', { body: { email: 'ana@exemplo.com' } });
if (res.status !== 201 || !res.body || res.body.id !== 1 || res.body.email !== 'ana@exemplo.com') throw new Error('POST válido respondeu ' + res.status + ' ' + res.texto + '; esperava 201 {"id":1,"email":"ana@exemplo.com"}');`,
          },
          {
            description: 'O mesmo email de novo responde 409 com { erro: "email já cadastrado" }, e não duplica',
            assertion: `const res = await pedir(app, 'POST', '/usuarios', { body: { email: 'ana@exemplo.com' } });
if (res.status !== 409 || !res.body || res.body.erro !== 'email já cadastrado') throw new Error('POST repetido respondeu ' + res.status + ' ' + res.texto + '; esperava 409 {"erro":"email já cadastrado"} — conflito com o que já existe');
const dois = await pedir(app, 'GET', '/usuarios/2');
if (dois.status !== 404) throw new Error('GET /usuarios/2 respondeu ' + dois.status + '; esperava 404 — o cadastro repetido não pode ter entrado na lista');`,
          },
          {
            description: 'GET /usuarios/1 devolve a Ana; GET /usuarios/9 responde 404 com { erro: "Usuário não encontrado" }',
            assertion: `const um = await pedir(app, 'GET', '/usuarios/1');
if (um.status !== 200 || !um.body || um.body.email !== 'ana@exemplo.com') throw new Error('GET /usuarios/1 respondeu ' + um.status + ' ' + um.texto + '; esperava 200 com a Ana');
const nada = await pedir(app, 'GET', '/usuarios/9');
if (nada.status !== 404 || !nada.body || nada.body.erro !== 'Usuário não encontrado') throw new Error('GET /usuarios/9 respondeu ' + nada.status + ' ' + nada.texto + '; esperava 404 {"erro":"Usuário não encontrado"}');`,
          },
        ],
        solution: `const express = require('express');
const app = express();
app.use(express.json());

class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

const usuarios = [];

app.post('/usuarios', (req, res) => {
  const { email } = req.body;
  if (typeof email !== 'string' || email.trim() === '') throw new ErroHttp(400, 'email é obrigatório');
  if (usuarios.some((u) => u.email === email)) throw new ErroHttp(409, 'email já cadastrado');
  const usuario = { id: usuarios.length + 1, email };
  usuarios.push(usuario);
  res.status(201).json(usuario);
});

app.get('/usuarios/:id', (req, res) => {
  const usuario = usuarios.find((u) => u.id === Number(req.params.id));
  if (!usuario) throw new ErroHttp(404, 'Usuário não encontrado');
  res.json(usuario);
});

app.use((erro, req, res, next) => {
  const status = erro.status || 500;
  res.status(status).json({ erro: status === 500 ? 'Erro interno' : erro.message });
});

app.listen(3000);`,
        hints: [
          'As rotas só lançam: `throw new ErroHttp(400, "email é obrigatório")`, `throw new ErroHttp(409, "email já cadastrado")`, `throw new ErroHttp(404, "Usuário não encontrado")`. Quem responde é o middleware.',
          'Já existe? `usuarios.some((u) => u.email === email)`.',
          'O middleware é o mesmo do exercício anterior: `erro.status || 500`, e a mensagem só nos 4xx.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
O status é a primeira coisa que a página lê. **\`4xx\`** quando quem consertaria é quem pediu — \`400\` conteúdo errado, \`404\` alvo inexistente, \`409\` conflito com o que já existe; **\`5xx\`** quando a culpa é nossa. Nunca \`200\` com "deu errado" no corpo.

Um middleware com **quatro parâmetros** é o middleware de erro: vai por último, recebe tudo que foi lançado ou passado por \`next(erro)\`, e decide num lugar só como um erro vira resposta. Um **erro com \`status\`** deixa a rota dizer só o que deu errado; o middleware usa o status quando existe e responde \`500\` genérico quando não — **a mensagem interna fica no log**, não na resposta.

E um formato só para toda falha: \`{ erro: 'texto' }\`.

Na próxima aula, o middleware como ferramenta geral: registrar pedidos, proteger rotas, e quem é que está pedindo.
`.trim(),
    },
  ],
};

import type { Project, ServidorDaPagina } from '../types';

/** Espera uma condição ficar verdadeira — a resposta do servidor chega depois. */
const ESPERAR = (condicao: string, ms = 3000) =>
  `for (let i = 0; i < ${Math.ceil(ms / 20)} && !(${condicao}); i++) await new Promise((r) => setTimeout(r, 20));`;

const BANCO = `
PRAGMA foreign_keys = ON;

CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE sessoes (
  token TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id)
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  titulo TEXT NOT NULL,
  corpo TEXT NOT NULL,
  autor_id INTEGER NOT NULL REFERENCES usuarios(id),
  criado_em TEXT NOT NULL
);

CREATE TABLE comentarios (
  id INTEGER PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id),
  autor_id INTEGER NOT NULL REFERENCES usuarios(id),
  texto TEXT NOT NULL,
  criado_em TEXT NOT NULL
);

INSERT INTO usuarios (id, nome, email) VALUES
  (1, 'Ana', 'ana@exemplo.com'),
  (2, 'Bia', 'bia@exemplo.com');

INSERT INTO sessoes (token, usuario_id) VALUES
  ('token-da-ana', 1),
  ('token-da-bia', 2);

INSERT INTO posts (id, titulo, corpo, autor_id, criado_em) VALUES
  (1, 'Por que testar', 'Um teste prova só os casos que executa.', 1, '2026-09-01'),
  (2, 'Segredos do SQL', 'JOIN não é tão assustador quanto parece.', 1, '2026-09-05'),
  (3, 'Terminal para iniciantes', 'O shell sempre tem um diretório atual.', 2, '2026-09-10');

INSERT INTO comentarios (id, post_id, autor_id, texto, criado_em) VALUES
  (1, 1, 2, 'Ótimo texto, me ajudou muito!', '2026-09-02');
`;

const REPOSITORIO = `// dados/blog.js — o único arquivo que sabe SQL.
const banco = require('../banco');
const { ErroHttp } = require('../erros');

// Duas consultas simples, unidas em JavaScript — mais fácil de ler do que
// um JOIN com agregação de JSON dentro do SQLite.
async function listarPosts() {
  const posts = await banco.consultar(
    'SELECT posts.*, usuarios.nome AS autor_nome FROM posts JOIN usuarios ON usuarios.id = posts.autor_id ORDER BY posts.id',
    []
  );
  const comentarios = await banco.consultar(
    'SELECT comentarios.*, usuarios.nome AS autor_nome FROM comentarios JOIN usuarios ON usuarios.id = comentarios.autor_id ORDER BY comentarios.id',
    []
  );
  return posts.map((post) => ({
    ...post,
    comentarios: comentarios.filter((c) => c.post_id === post.id),
  }));
}

async function buscarPost(id) {
  const linhas = await banco.consultar('SELECT * FROM posts WHERE id = ?', [id]);
  return linhas[0] ?? null;
}

async function criarPost({ titulo, corpo, autorId }) {
  await banco.executar(
    "INSERT INTO posts (titulo, corpo, autor_id, criado_em) VALUES (?, ?, ?, date('now'))",
    [titulo, corpo, autorId]
  );
}

async function apagarPost(id, usuario) {
  const post = await buscarPost(id);
  if (!post) throw new ErroHttp(404, 'Post não encontrado');
  if (post.autor_id !== usuario.id) throw new ErroHttp(403, 'Só o dono pode apagar este post');
  await banco.executar('DELETE FROM comentarios WHERE post_id = ?', [id]);
  await banco.executar('DELETE FROM posts WHERE id = ?', [id]);
}

async function comentar(postId, { texto, autorId }) {
  const post = await buscarPost(postId);
  if (!post) throw new ErroHttp(404, 'Post não encontrado');
  await banco.executar(
    "INSERT INTO comentarios (post_id, autor_id, texto, criado_em) VALUES (?, ?, ?, date('now'))",
    [postId, autorId, texto]
  );
}

async function criarUsuario({ nome, email }) {
  const existentes = await banco.consultar('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (existentes.length > 0) throw new ErroHttp(400, 'E-mail já cadastrado');
  const { ultimoId } = await banco.executar('INSERT INTO usuarios (nome, email) VALUES (?, ?)', [nome, email]);
  const token = 'token-' + ultimoId + '-' + Math.random().toString(36).slice(2);
  await banco.executar('INSERT INTO sessoes (token, usuario_id) VALUES (?, ?)', [token, ultimoId]);
  return { id: ultimoId, nome, token };
}

module.exports = { listarPosts, buscarPost, criarPost, apagarPost, comentar, criarUsuario };
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

const SERVIDOR = `const express = require('express');
const repositorio = require('./dados/blog');
const { ErroHttp, tratarErros } = require('./erros');
const { exigirLogin } = require('./auth');

const app = express();
app.use(express.json());

function paraApi(post) {
  return {
    id: post.id,
    titulo: post.titulo,
    corpo: post.corpo,
    autorId: post.autor_id,
    autorNome: post.autor_nome,
    comentarios: post.comentarios.map((c) => ({ id: c.id, texto: c.texto, autorNome: c.autor_nome })),
  };
}

app.get('/posts', async (req, res) => {
  const posts = await repositorio.listarPosts();
  res.json(posts.map(paraApi));
});

app.post('/cadastro', async (req, res) => {
  const { nome, email } = req.body;
  if (typeof nome !== 'string' || nome.trim() === '') throw new ErroHttp(400, 'nome é obrigatório');
  if (typeof email !== 'string' || email.trim() === '') throw new ErroHttp(400, 'email é obrigatório');
  const usuario = await repositorio.criarUsuario({ nome: nome.trim(), email: email.trim() });
  res.status(201).json(usuario);
});

app.post('/posts', exigirLogin, async (req, res) => {
  const { titulo, corpo } = req.body;
  if (typeof titulo !== 'string' || titulo.trim() === '') throw new ErroHttp(400, 'titulo é obrigatório');
  if (typeof corpo !== 'string' || corpo.trim() === '') throw new ErroHttp(400, 'corpo é obrigatório');
  await repositorio.criarPost({ titulo: titulo.trim(), corpo: corpo.trim(), autorId: req.usuario.id });
  res.status(201).json({ ok: true });
});

app.delete('/posts/:id', exigirLogin, async (req, res) => {
  await repositorio.apagarPost(Number(req.params.id), req.usuario);
  res.status(204).end();
});

app.post('/posts/:id/comentarios', exigirLogin, async (req, res) => {
  const { texto } = req.body;
  if (typeof texto !== 'string' || texto.trim() === '') throw new ErroHttp(400, 'texto é obrigatório');
  await repositorio.comentar(Number(req.params.id), { texto: texto.trim(), autorId: req.usuario.id });
  res.status(201).json({ ok: true });
});

app.use(tratarErros);
app.listen(3000);
`;

const API_DO_BLOG: ServidorDaPagina = {
  code: SERVIDOR,
  arquivos: { './dados/blog.js': REPOSITORIO, './erros.js': ERROS, './auth.js': AUTH },
  banco: BANCO,
};

const HTML = `<h1>Blog</h1>
<form id="form-cadastro">
  <h2>Criar conta</h2>
  <input id="nome" placeholder="Seu nome" autocomplete="off">
  <input id="email" placeholder="seu@email.com" autocomplete="off">
  <button type="submit">Cadastrar</button>
</form>
<p id="sessao">Você não está logado.</p>
<form id="form-post">
  <input id="titulo" placeholder="Título" autocomplete="off">
  <textarea id="corpo" placeholder="Escreva aqui..."></textarea>
  <button type="submit">Publicar</button>
</form>
<ul id="posts"></ul>`;

/** O cliente da API, dado pronto: põe o token quando existe, fala JSON, e transforma erro em exceção. */
const CLIENTE = `let token = null;

async function pedir(caminho, opcoes = {}) {
  const cabecalhos = { 'Content-Type': 'application/json' };
  if (token) cabecalhos.Authorization = 'Bearer ' + token;
  const resposta = await fetch(caminho, {
    method: opcoes.method || 'GET',
    headers: cabecalhos,
    body: opcoes.body === undefined ? undefined : JSON.stringify(opcoes.body),
  });
  if (resposta.status === 204) return null;
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || 'erro ' + resposta.status);
  return dados;
}`;

export const projetoCapstoneBlog: Project = {
  id: 'proj-capstone-blog',
  title: 'Capstone: Blog com Autenticação',
  description:
    'Recomendado depois de A Página, Node, SQL e Autenticação. Cadastro que já loga, posts que só o dono apaga, e comentários — a autenticação por token de ponta a ponta, numa página só.',
  difficulty: 'avancado',
  language: 'html',
  concepts: ['proj-pagina', 'dom-fetch', 'dom-delegacao'],
  status: 'published',
  runtime: 'iframe',
  servidor: API_DO_BLOG,
  initialCode: `${HTML}
<script>
  ${CLIENTE.replace(/\n/g, '\n  ')}

  function desenharPosts(posts) {
    // Um <li data-id="..."> por post: título, "por <autor>", corpo, um
    // botão "Apagar" (classe "apagar"), a lista de comentários ("texto —
    // autor") e um <form class="form-comentario"> com um <input> e um
    // botão para comentar.
  }

  async function carregarPosts() {
    const posts = await pedir('/posts');
    desenharPosts(posts);
  }

  // #form-cadastro: POST /cadastro com { nome, email }. Sucesso guarda o
  // token recebido e mostra "Logado como <nome>" em #sessao.

  // #form-post: POST /posts com { titulo, corpo } — exige estar logado.
  // Sucesso limpa os campos e recarrega os posts.

  // Delegação em #posts: click no ".apagar" faz DELETE /posts/:id; submit
  // num ".form-comentario" faz POST /posts/:id/comentarios com { texto }.
  // Os dois recarregam depois — e mostram o erro da API em #sessao quando
  // falham (por exemplo, apagar um post que não é seu).

  carregarPosts();
</script>`,
  checkpoints: [
    {
      id: 'cp-capstone-blog-cadastro',
      title: 'Cadastro cria conta e já loga',
      description: 'Enviar o formulário de cadastro cria a conta e guarda o token — sem precisar de uma tela de login separada.',
      tests: [
        {
          description: 'Cadastrar "Carla" mostra "Logado como Carla"',
          assertion: `document.querySelector('#nome').value = 'Carla';
document.querySelector('#email').value = 'carla@exemplo.com';
document.querySelector('#form-cadastro').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
${ESPERAR("document.querySelector('#sessao').textContent.includes('Carla')")}
const sessao = document.querySelector('#sessao').textContent;
if (!sessao.includes('Carla')) throw new Error('esperava "Carla" em #sessao depois do cadastro, veio ' + JSON.stringify(sessao));`,
        },
      ],
    },
    {
      id: 'cp-capstone-blog-listar',
      title: 'Listar posts com autor e comentários',
      description: 'Busca os posts e desenha cada um com o título, o nome de quem escreveu, e os comentários que já existem.',
      tests: [
        {
          description: 'Os 3 posts aparecem, o primeiro com o título e o autor certos',
          assertion: `${ESPERAR("document.querySelectorAll('#posts > li').length >= 3")}
const itens = [...document.querySelectorAll('#posts > li')];
if (itens.length !== 3) throw new Error('esperava 3 posts, veio ' + itens.length);
const primeiro = itens[0].textContent;
if (!primeiro.includes('Por que testar') || !primeiro.includes('Ana')) throw new Error('esperava "Por que testar" e "Ana" no primeiro post, veio ' + JSON.stringify(primeiro));`,
        },
        {
          description: 'O comentário existente aparece dentro do post 1',
          assertion: `const post1 = document.querySelector('#posts li[data-id="1"]');
if (!post1) throw new Error('não achei o post 1 na lista');
if (!post1.textContent.includes('Ótimo texto')) throw new Error('esperava o comentário "Ótimo texto..." dentro do post 1, veio ' + JSON.stringify(post1.textContent));`,
        },
      ],
    },
    {
      id: 'cp-capstone-blog-publicar',
      title: 'Publicar exige login, e o post aparece na lista',
      description: 'Publicar sem estar logado falha; depois de cadastrar, o post criado aparece com o autor certo, e pode ser apagado por quem o criou.',
      tests: [
        {
          description: 'Publicar sem estar logado falha, e não cria post nenhum',
          assertion: `${ESPERAR("document.querySelectorAll('#posts > li').length >= 3")}
document.querySelector('#titulo').value = 'Vai falhar';
document.querySelector('#corpo').value = 'ninguém logado';
document.querySelector('#form-post').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
await new Promise((r) => setTimeout(r, 300));
const posts = await (await fetch('/posts')).json();
if (posts.length !== 3) throw new Error('publicar sem login não deveria criar post — o servidor recusa sem o token');`,
        },
        {
          description: 'Depois de cadastrar, publicar cria o post com o autor certo',
          assertion: `document.querySelector('#nome').value = 'Diego';
document.querySelector('#email').value = 'diego@exemplo.com';
document.querySelector('#form-cadastro').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
${ESPERAR("document.querySelector('#sessao').textContent.includes('Diego')")}
document.querySelector('#titulo').value = 'Meu primeiro post';
document.querySelector('#corpo').value = 'Conteúdo do post';
document.querySelector('#form-post').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
${ESPERAR("document.querySelectorAll('#posts > li').length >= 4")}
const itens = [...document.querySelectorAll('#posts > li')].map((li) => li.textContent);
const novo = itens.find((t) => t.includes('Meu primeiro post'));
if (!novo || !novo.includes('Diego')) throw new Error('esperava um post "Meu primeiro post" de "Diego", veio ' + JSON.stringify(itens));`,
        },
      ],
    },
    {
      id: 'cp-capstone-blog-permissao',
      title: 'Apagar só o dono, e comentar',
      description: 'Quem não é dono do post recebe 403 ao tentar apagar, e o post continua existindo; comentar não exige ser o dono.',
      tests: [
        {
          description: 'Tentar apagar o post de outra pessoa falha, e o post continua na lista',
          assertion: `${ESPERAR("document.querySelectorAll('#posts > li').length >= 3")}
document.querySelector('#nome').value = 'Diego';
document.querySelector('#email').value = 'diego@exemplo.com';
document.querySelector('#form-cadastro').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
${ESPERAR("document.querySelector('#sessao').textContent.includes('Diego')")}
document.querySelector('#posts li[data-id="1"] .apagar').click();
await new Promise((r) => setTimeout(r, 300));
const posts = await (await fetch('/posts')).json();
if (!posts.some((p) => p.id === 1)) throw new Error('o post 1 (de Ana) não deveria ter sido apagado por Diego, que não é o dono');
const sessao = document.querySelector('#sessao').textContent.toLowerCase();
if (!sessao.includes('apagar') && !sessao.includes('dono') && !sessao.includes('403')) throw new Error('esperava alguma mensagem sobre a permissão negada em #sessao, veio ' + JSON.stringify(document.querySelector('#sessao').textContent));`,
        },
        {
          description: 'Comentar não exige ser o dono do post',
          assertion: `const formComentario = document.querySelector('#posts li[data-id="1"] .form-comentario');
formComentario.querySelector('input').value = 'Comentário do Diego';
formComentario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
${ESPERAR("document.querySelector('#posts li[data-id=\"1\"]').textContent.includes('Comentário do Diego')")}
const post1 = document.querySelector('#posts li[data-id="1"]').textContent;
if (!post1.includes('Comentário do Diego')) throw new Error('esperava o novo comentário dentro do post 1, veio ' + JSON.stringify(post1));`,
        },
      ],
    },
  ],
  referenceSolution: `${HTML}
<script>
  ${CLIENTE.replace(/\n/g, '\n  ')}

  function desenharPosts(posts) {
    const lista = document.querySelector('#posts');
    lista.replaceChildren();
    for (const post of posts) {
      const li = document.createElement('li');
      li.dataset.id = post.id;

      const titulo = document.createElement('h3');
      titulo.textContent = post.titulo;

      const autor = document.createElement('p');
      autor.textContent = 'por ' + post.autorNome;

      const corpo = document.createElement('p');
      corpo.textContent = post.corpo;

      const apagar = document.createElement('button');
      apagar.type = 'button';
      apagar.className = 'apagar';
      apagar.textContent = 'Apagar';

      const comentarios = document.createElement('ul');
      comentarios.className = 'comentarios';
      for (const comentario of post.comentarios) {
        const item = document.createElement('li');
        item.textContent = comentario.texto + ' — ' + comentario.autorNome;
        comentarios.append(item);
      }

      const formComentario = document.createElement('form');
      formComentario.className = 'form-comentario';
      const campoComentario = document.createElement('input');
      campoComentario.placeholder = 'Comentar...';
      const botaoComentario = document.createElement('button');
      botaoComentario.type = 'submit';
      botaoComentario.textContent = 'Comentar';
      formComentario.append(campoComentario, botaoComentario);

      li.append(titulo, autor, corpo, apagar, comentarios, formComentario);
      lista.append(li);
    }
  }

  async function carregarPosts() {
    const posts = await pedir('/posts');
    desenharPosts(posts);
  }

  document.querySelector('#form-cadastro').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const nome = document.querySelector('#nome').value.trim();
    const email = document.querySelector('#email').value.trim();
    if (!nome || !email) return;
    try {
      const usuario = await pedir('/cadastro', { method: 'POST', body: { nome, email } });
      token = usuario.token;
      document.querySelector('#sessao').textContent = 'Logado como ' + usuario.nome;
    } catch (erro) {
      document.querySelector('#sessao').textContent = 'Não foi possível cadastrar: ' + erro.message;
    }
  });

  document.querySelector('#form-post').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const campoTitulo = document.querySelector('#titulo');
    const campoCorpo = document.querySelector('#corpo');
    const titulo = campoTitulo.value.trim();
    const corpo = campoCorpo.value.trim();
    if (!titulo || !corpo) return;
    try {
      await pedir('/posts', { method: 'POST', body: { titulo, corpo } });
      campoTitulo.value = '';
      campoCorpo.value = '';
      await carregarPosts();
    } catch (erro) {
      document.querySelector('#sessao').textContent = 'Não foi possível publicar: ' + erro.message;
    }
  });

  document.querySelector('#posts').addEventListener('click', async (evento) => {
    if (!evento.target.classList.contains('apagar')) return;
    const id = evento.target.closest('li').dataset.id;
    try {
      await pedir('/posts/' + id, { method: 'DELETE' });
      await carregarPosts();
    } catch (erro) {
      document.querySelector('#sessao').textContent = 'Não foi possível apagar: ' + erro.message;
    }
  });

  document.querySelector('#posts').addEventListener('submit', async (evento) => {
    if (!evento.target.classList.contains('form-comentario')) return;
    evento.preventDefault();
    const li = evento.target.closest('li');
    const campo = evento.target.querySelector('input');
    const texto = campo.value.trim();
    if (!texto) return;
    try {
      await pedir('/posts/' + li.dataset.id + '/comentarios', { method: 'POST', body: { texto } });
      await carregarPosts();
    } catch (erro) {
      document.querySelector('#sessao').textContent = 'Não foi possível comentar: ' + erro.message;
    }
  });

  carregarPosts();
</script>`,
  brief: `
O terceiro capstone junta autenticação de ponta a ponta: quem cadastra já está logado, só o dono de um post pode apagá-lo, e comentar não exige ser dono de nada — só estar logado. A API e o banco já estão prontos e de pé (o painel acima do editor mostra os arquivos deles).

## O que já existe

- **O banco**: \`usuarios\`, \`sessoes\` (o token de quem entrou), \`posts\` (cada um com um dono) e \`comentarios\`. Ana e Bia já têm posts publicados; há um comentário de Bia no post da Ana.
- **A API**: \`GET /posts\` (todos, com autor e comentários já juntados), \`POST /cadastro\` (\`{ nome, email }\`, cria a conta **e já devolve um token** — não existe uma rota de login separada), \`POST /posts\` (exige token), \`DELETE /posts/:id\` (exige token **e** ser o dono — 403 senão), \`POST /posts/:id/comentarios\` (exige token, qualquer pessoa logada).
- **O cliente da API** (\`pedir\`), já escrito: guarda o token quando existe, o manda no cabeçalho, fala JSON.

## O que construir

1. **Desenhar os posts**: um item por post, com título, autor, corpo, os comentários que já existem, um botão para apagar e um formulário para comentar.
2. **Cadastro**: o formulário de cadastro cria a conta e guarda o token recebido — a partir daí, todo pedido que exige login já sai autenticado.
3. **Publicar**: exige estar logado (o servidor recusa sem token); depois de publicar, recarregar a lista.
4. **Apagar e comentar**: apagar por delegação, exigindo ser o dono (o servidor decide, com 403; a página só mostra o erro); comentar por delegação também, sem checagem de dono.

## A decisão central: cadastro é login

Não existe uma tela de "entrar" separada da de "criar conta" — o \`POST /cadastro\` já devolve o token, e a página usa esse token imediatamente. Isso é uma escolha deliberada para manter o escopo do capstone focado na autenticação por token em si (o que o header \`Authorization\` faz, o que o servidor confere), não numa tela de login com senha.

## Antes de submeter

- Tentar publicar sem ter cadastrado antes mostra um erro claro, sem quebrar a página?
- Apagar o post de outra pessoa mostra a mensagem da API (403), e o post continua na lista?
- Qualquer pessoa logada consegue comentar em qualquer post — mesmo um que não é dela?
`.trim(),
};

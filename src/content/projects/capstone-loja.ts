import { LOJA } from '../bancos/loja';
import type { Project, ServidorDaPagina } from '../types';

/** Espera uma condição ficar verdadeira — a resposta do servidor chega depois. */
const ESPERAR = (condicao: string, ms = 3000) =>
  `for (let i = 0; i < ${Math.ceil(ms / 20)} && !(${condicao}); i++) await new Promise((r) => setTimeout(r, 20));`;

const REPOSITORIO = `// dados/loja.js — o único arquivo que sabe SQL.
const banco = require('../banco');
const { ErroHttp } = require('../erros');

async function listarProdutos() {
  return banco.consultar('SELECT id, nome, categoria, preco, estoque FROM produtos ORDER BY id', []);
}

async function buscarProduto(id) {
  const linhas = await banco.consultar('SELECT * FROM produtos WHERE id = ?', [id]);
  return linhas[0] ?? null;
}

// Confere o estoque de TODOS os itens antes de mexer em qualquer um: um
// pedido com um item sem estoque não pode deixar os outros meio-processados.
async function criarPedido(clienteId, itens) {
  const carrinho = [];
  for (const item of itens) {
    const produto = await buscarProduto(item.produtoId);
    if (!produto) throw new ErroHttp(400, 'Produto ' + item.produtoId + ' não existe');
    if (item.quantidade > produto.estoque) throw new ErroHttp(400, 'Estoque insuficiente para ' + produto.nome);
    carrinho.push({ produto, quantidade: item.quantidade });
  }

  const { ultimoId: pedidoId } = await banco.executar(
    "INSERT INTO pedidos (cliente_id, data, status) VALUES (?, date('now'), 'pendente')",
    [clienteId]
  );

  let total = 0;
  for (const { produto, quantidade } of carrinho) {
    await banco.executar(
      'INSERT INTO itens (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
      [pedidoId, produto.id, quantidade, produto.preco]
    );
    await banco.executar('UPDATE produtos SET estoque = estoque - ? WHERE id = ?', [quantidade, produto.id]);
    total += produto.preco * quantidade;
  }
  return { id: pedidoId, total };
}

module.exports = { listarProdutos, buscarProduto, criarPedido };
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

const SERVIDOR = `const express = require('express');
const repositorio = require('./dados/loja');
const { ErroHttp, tratarErros } = require('./erros');

const app = express();
app.use(express.json());

function paraApi(produto) {
  return { id: produto.id, nome: produto.nome, categoria: produto.categoria, preco: produto.preco, estoque: produto.estoque };
}

app.get('/produtos', async (req, res) => {
  const produtos = await repositorio.listarProdutos();
  res.json(produtos.map(paraApi));
});

app.post('/pedidos', async (req, res) => {
  const { clienteId, itens } = req.body;
  if (typeof clienteId !== 'number') throw new ErroHttp(400, 'clienteId é obrigatório');
  if (!Array.isArray(itens) || itens.length === 0) throw new ErroHttp(400, 'itens é obrigatório');
  const pedido = await repositorio.criarPedido(clienteId, itens);
  res.status(201).json(pedido);
});

app.use(tratarErros);
app.listen(3000);
`;

const API_DA_LOJA: ServidorDaPagina = {
  code: SERVIDOR,
  arquivos: { './dados/loja.js': REPOSITORIO, './erros.js': ERROS },
  banco: LOJA.sql,
};

const HTML = `<h1>Loja</h1>
<label>Cliente
  <select id="cliente">
    <option value="1">Ana Souza</option>
    <option value="2">Bruno Lima</option>
  </select>
</label>
<ul id="catalogo"></ul>
<h2>Carrinho</h2>
<ul id="carrinho"></ul>
<p id="total">Total: R$ 0,00</p>
<button id="finalizar" type="button">Finalizar pedido</button>
<p id="estado"></p>`;

const FORMATAR = `function formatarMoeda(valor) {
  const centavos = Math.round(valor * 100);
  const reais = Math.floor(centavos / 100);
  const resto = String(centavos % 100).padStart(2, '0');
  return 'R$ ' + reais + ',' + resto;
}`;

export const projetoCapstoneLoja: Project = {
  id: 'proj-capstone-loja',
  title: 'Capstone: Loja com Carrinho',
  description:
    'O banco da trilha de SQL virando produto: catálogo, carrinho, pedido — e o estoque que de fato abaixa quando alguém compra.',
  difficulty: 'avancado',
  language: 'html',
  concepts: ['proj-pagina', 'dom-fetch', 'dom-delegacao'],
  status: 'published',
  runtime: 'iframe',
  servidor: API_DA_LOJA,
  initialCode: `${HTML}
<script>
  ${FORMATAR.replace(/\n/g, '\n  ')}

  let produtos = [];
  let carrinho = []; // [{ produtoId, quantidade }]

  function produtoPorId(id) {
    return produtos.find((p) => p.id === id);
  }

  function desenharCatalogo() {
    // Um <li data-id="..."> por produto, com nome, formatarMoeda(preco) e
    // estoque; o botão "Adicionar" vem desabilitado quando estoque é 0.
  }

  function desenharCarrinho() {
    // Um <li data-id="..."> por item do carrinho (nome, quantidade,
    // subtotal) e um botão "Remover"; #total soma tudo.
  }

  async function carregarCatalogo() {
    produtos = await (await fetch('/produtos')).json();
    desenharCatalogo();
    desenharCarrinho();
  }

  // Delegação em #catalogo: "Adicionar" põe (ou soma) o item no carrinho.

  // Delegação em #carrinho: "Remover" tira o item do carrinho.

  // #finalizar: POST /pedidos com { clienteId, itens: carrinho }. Sucesso
  // limpa o carrinho, mostra a confirmação e recarrega o catálogo (o
  // estoque mudou). Falha (ex.: estoque insuficiente) mostra o erro da API
  // e mantém o carrinho como estava.

  carregarCatalogo();
</script>`,
  checkpoints: [
    {
      id: 'cp-capstone-loja-catalogo',
      title: 'Catálogo carregado',
      description: 'Busca os produtos e desenha um item por produto, com preço formatado e o botão desabilitado quando não há estoque.',
      tests: [
        {
          description: 'O catálogo mostra os 12 produtos, com nome e preço formatado',
          assertion: `${ESPERAR("document.querySelectorAll('#catalogo li').length >= 12")}
const itens = [...document.querySelectorAll('#catalogo li')];
if (itens.length !== 12) throw new Error('esperava 12 produtos no catálogo, veio ' + itens.length);
const primeiro = itens[0].textContent;
if (!primeiro.includes('Caderno 96 folhas') || !primeiro.includes('R$ 12,50')) throw new Error('esperava "Caderno 96 folhas" e "R$ 12,50" no primeiro item, veio ' + JSON.stringify(primeiro));`,
        },
        {
          description: 'O produto sem estoque (Carregador USB-C) tem o botão de adicionar desabilitado',
          assertion: `const botao = document.querySelector('#catalogo li[data-id="8"] button');
if (!botao) throw new Error('não achei o item do produto 8 (Carregador USB-C) no catálogo');
if (!botao.disabled) throw new Error('o botão de um produto com estoque 0 deveria estar desabilitado');`,
        },
      ],
    },
    {
      id: 'cp-capstone-loja-carrinho',
      title: 'Adicionar ao carrinho',
      description: 'Adicionar o mesmo produto duas vezes soma a quantidade, e o total reflete o carrinho.',
      tests: [
        {
          description: 'Adicionar o Teclado mecânico duas vezes mostra "x2" e o total certo',
          assertion: `${ESPERAR("document.querySelectorAll('#catalogo li').length >= 12")}
const botao = document.querySelector('#catalogo li[data-id="7"] button');
botao.click();
botao.click();
await new Promise((r) => setTimeout(r, 50));
const item = document.querySelector('#carrinho li[data-id="7"]');
if (!item || !item.textContent.includes('x2')) throw new Error('esperava o item do carrinho com "x2", veio ' + (item ? item.textContent : 'nenhum item'));
const total = document.querySelector('#total').textContent;
if (!total.includes('698,00')) throw new Error('esperava o total "R$ 698,00" (2 × R$ 349,00), veio ' + JSON.stringify(total));`,
        },
      ],
    },
    {
      id: 'cp-capstone-loja-finalizar',
      title: 'Finalizar pedido',
      description: 'Finalizar com estoque suficiente registra o pedido no servidor e diminui o estoque do produto.',
      tests: [
        {
          description: 'Comprar 1 Mochila escolar confirma o pedido e o catálogo volta com estoque 14',
          assertion: `${ESPERAR("document.querySelectorAll('#catalogo li').length >= 12")}
document.querySelector('#catalogo li[data-id="4"] button').click();
await new Promise((r) => setTimeout(r, 50));
document.querySelector('#finalizar').click();
${ESPERAR("document.querySelector('#estado').textContent.includes('129,90')")}
const estado = document.querySelector('#estado').textContent;
if (!estado.toLowerCase().includes('confirm')) throw new Error('esperava uma confirmação em #estado, veio ' + JSON.stringify(estado));
const produtos = await (await fetch('/produtos')).json();
const mochila = produtos.find((p) => p.id === 4);
if (mochila.estoque !== 14) throw new Error('esperava estoque 14 para a Mochila (era 15, comprou 1), veio ' + mochila.estoque);`,
        },
        {
          description: 'Depois de finalizar, o carrinho volta vazio',
          assertion: `const itensNoCarrinho = document.querySelectorAll('#carrinho li');
if (itensNoCarrinho.length !== 0) throw new Error('o carrinho deveria esvaziar depois de finalizar, ainda tem ' + itensNoCarrinho.length + ' item(ns)');`,
        },
      ],
    },
    {
      id: 'cp-capstone-loja-sem-estoque',
      title: 'Recusar sem estoque suficiente',
      description: 'Um pedido com um item sem estoque suficiente é recusado inteiro — nenhum item do pedido é descontado, nem os que tinham estoque.',
      tests: [
        {
          description: 'Pedir 9 Teclados (estoque 8) junto com 1 Mochila falha, e a Mochila não é descontada',
          assertion: `${ESPERAR("document.querySelectorAll('#catalogo li').length >= 12")}
const botaoTeclado = document.querySelector('#catalogo li[data-id="7"] button');
for (let i = 0; i < 9; i++) botaoTeclado.click();
document.querySelector('#catalogo li[data-id="4"] button').click();
await new Promise((r) => setTimeout(r, 50));
document.querySelector('#finalizar').click();
${ESPERAR("document.querySelector('#estado').textContent.toLowerCase().includes('insuficiente')")}
const estado = document.querySelector('#estado').textContent;
if (!estado.toLowerCase().includes('insuficiente')) throw new Error('esperava uma mensagem sobre estoque insuficiente em #estado, veio ' + JSON.stringify(estado));
const produtos = await (await fetch('/produtos')).json();
const mochila = produtos.find((p) => p.id === 4);
if (mochila.estoque !== 15) throw new Error('a Mochila não deveria ter sido descontada — o pedido inteiro deveria ter sido recusado antes de mexer no estoque, veio ' + mochila.estoque);`,
        },
      ],
    },
  ],
  referenceSolution: `${HTML}
<script>
  ${FORMATAR.replace(/\n/g, '\n  ')}

  let produtos = [];
  let carrinho = [];

  function produtoPorId(id) {
    return produtos.find((p) => p.id === id);
  }

  function desenharCatalogo() {
    const lista = document.querySelector('#catalogo');
    lista.replaceChildren();
    for (const produto of produtos) {
      const li = document.createElement('li');
      li.dataset.id = produto.id;
      const texto = document.createElement('span');
      texto.textContent = produto.nome + ' — ' + formatarMoeda(produto.preco) + ' (estoque: ' + produto.estoque + ')';
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.textContent = 'Adicionar';
      botao.disabled = produto.estoque === 0;
      li.append(texto, ' ', botao);
      lista.append(li);
    }
  }

  function desenharCarrinho() {
    const lista = document.querySelector('#carrinho');
    lista.replaceChildren();
    let total = 0;
    for (const item of carrinho) {
      const produto = produtoPorId(item.produtoId);
      const subtotal = produto.preco * item.quantidade;
      total += subtotal;
      const li = document.createElement('li');
      li.dataset.id = produto.id;
      const texto = document.createElement('span');
      texto.textContent = produto.nome + ' x' + item.quantidade + ' — ' + formatarMoeda(subtotal);
      const remover = document.createElement('button');
      remover.type = 'button';
      remover.textContent = 'Remover';
      li.append(texto, ' ', remover);
      lista.append(li);
    }
    document.querySelector('#total').textContent = 'Total: ' + formatarMoeda(total);
  }

  async function carregarCatalogo() {
    produtos = await (await fetch('/produtos')).json();
    desenharCatalogo();
    desenharCarrinho();
  }

  document.querySelector('#catalogo').addEventListener('click', (evento) => {
    if (evento.target.tagName !== 'BUTTON') return;
    const id = Number(evento.target.closest('li').dataset.id);
    const item = carrinho.find((i) => i.produtoId === id);
    if (item) item.quantidade++;
    else carrinho.push({ produtoId: id, quantidade: 1 });
    desenharCarrinho();
  });

  document.querySelector('#carrinho').addEventListener('click', (evento) => {
    if (evento.target.tagName !== 'BUTTON') return;
    const id = Number(evento.target.closest('li').dataset.id);
    carrinho = carrinho.filter((i) => i.produtoId !== id);
    desenharCarrinho();
  });

  document.querySelector('#finalizar').addEventListener('click', async () => {
    const estado = document.querySelector('#estado');
    const clienteId = Number(document.querySelector('#cliente').value);
    try {
      const resposta = await fetch('/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId, itens: carrinho }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'erro ' + resposta.status);
      carrinho = [];
      estado.textContent = 'Pedido confirmado: ' + formatarMoeda(dados.total);
      desenharCarrinho();
      await carregarCatalogo();
    } catch (erro) {
      estado.textContent = 'Não foi possível finalizar: ' + erro.message;
    }
  });

  carregarCatalogo();
</script>`,
  brief: `
O segundo capstone é o banco que a trilha de SQL já ensinou a consultar — \`clientes\`, \`produtos\`, \`pedidos\`, \`itens\` — agora por trás de uma loja de verdade, com a API e o banco já prontos e de pé (o painel acima do editor mostra os arquivos deles).

## O que já existe

- **O banco**: os mesmos quatro da trilha de SQL. Doze produtos, um deles (\`Carregador USB-C\`, id 8) com estoque zero de propósito.
- **A API**: \`GET /produtos\` (o catálogo inteiro) e \`POST /pedidos\` (\`{ clienteId, itens: [{ produtoId, quantidade }] }\`) — que confere o estoque de **todos** os itens antes de gravar qualquer coisa, e recusa o pedido inteiro se um só item não tiver estoque suficiente.

## O que construir

1. **Catálogo**: buscar os produtos e desenhar um item por produto — nome, preço formatado, estoque — com o botão "Adicionar" desabilitado quando o estoque é zero.
2. **Carrinho**: clicar em "Adicionar" põe o produto no carrinho (ou soma a quantidade, se já estiver lá); "Remover" tira. O total é a soma dos subtotais, sempre recalculado.
3. **Finalizar**: enviar o carrinho para \`POST /pedidos\`. Sucesso limpa o carrinho, mostra a confirmação com o total, e recarrega o catálogo — o estoque mudou. Falha (estoque insuficiente) mostra a mensagem da API e **mantém o carrinho como estava**.

## A decisão central: tudo ou nada

A API já garante que um pedido com um item sem estoque não desconta **nenhum** item — nem os que tinham estoque de sobra. Do lado da página, a mesma disciplina vale para a interface: um pedido recusado não deveria parecer "parcialmente aceito". O carrinho continua intacto até a pessoa decidir o que fazer — tirar o item problemático, ou desistir.

## Antes de submeter

- Clicar duas vezes em "Adicionar" no mesmo produto soma a quantidade, ou cria dois itens separados no carrinho?
- Depois de um pedido confirmado, o catálogo mostra o estoque **atualizado** — sem precisar recarregar a página manualmente?
- Um produto com estoque zero realmente não pode ser adicionado?
`.trim(),
};

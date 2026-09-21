import type { Lesson } from '../types';

const DADOS_PEDIDOS = `// dados/pedidos.js — só sabe guardar e buscar. Não sabe o que é HTTP nem moeda.
const pedidos = [
  { id: 1, cliente: 'Ana', itens: [{ nome: 'Caderno', preco: 12.5, quantidade: 2 }] },
  { id: 2, cliente: 'Bia', itens: [{ nome: 'Caneta', preco: 3, quantidade: 4 }, { nome: 'Régua', preco: 5, quantidade: 1 }] },
];

function buscar(id) {
  const pedido = pedidos.find((p) => p.id === id);
  return pedido ? { ...pedido } : null;
}

function listar() {
  return pedidos.map((p) => ({ ...p }));
}

module.exports = { buscar, listar };
`;

const UTIL_MOEDA = `// util/moeda.js — não sabe o que é pedido: recebe um número, devolve texto.
function formatarMoeda(valor) {
  const centavos = Math.round(valor * 100);
  return 'R$ ' + Math.floor(centavos / 100) + ',' + String(centavos % 100).padStart(2, '0');
}

module.exports = { formatarMoeda };
`;

const SERVICO_PEDIDOS = `// servicos/pedidos.js — as regras. Usa os dados e a util; não sabe o que é HTTP.
const dados = require('../dados/pedidos');
const { formatarMoeda } = require('../util/moeda');

function totalDo(pedido) {
  let total = 0;
  for (const item of pedido.itens) total = total + item.preco * item.quantidade;
  return total;
}

function resumoDoPedido(id) {
  const pedido = dados.buscar(id);
  if (!pedido) return null;
  return 'Pedido ' + pedido.id + ' de ' + pedido.cliente + ': ' + formatarMoeda(totalDo(pedido));
}

module.exports = { resumoDoPedido };
`;

export const lessonEngPastas: Lesson = {
  id: 'lesson-eng-3',
  trackId: 'track-engenharia',
  title: 'Pastas por Responsabilidade',
  language: 'node',
  objective:
    'Dividir um projeto em pastas pelo que cada parte faz — não pelo tipo de arquivo —, reconhecer os dois esqueletos mais comuns, e mover um arquivo sem quebrar os `require`.',
  concepts: ['eng-pastas'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Módulos viram pastas quando o projeto cresce. E a primeira pergunta de quem cria uma pasta é a errada: "que tipo de arquivo vai aqui?". A pergunta certa é **"o que muda junto?"**.

## Por tipo, ou por responsabilidade

Há dois jeitos de organizar as mesmas doze funções:

~~~
por tipo                      por responsabilidade
funcoes/                      pedidos/
  calcularFrete.js              rotas.js
  validarPedido.js              servico.js
  formatarMoeda.js              dados.js
classes/                      frete/
  Pedido.js                     servico.js
  Cliente.js                    tabela.js
dados/                        util/
  pedidos.js                    moeda.js
~~~

Na organização **por tipo**, uma mudança em pedidos toca três pastas: a função em \`funcoes/\`, a classe em \`classes/\`, os dados em \`dados/\`. A pasta diz o que o arquivo **é**, não para que serve — e "é uma função" não ajuda ninguém a achar nada.

Na organização **por responsabilidade**, tudo de pedidos está em \`pedidos/\`. Quem vai mexer em pedidos abre uma pasta. Quem quer entender frete, outra. A regra é a mesma da coesão, um nível acima: **o que muda junto fica junto**.

## Os dois esqueletos

Para uma API pequena, a divisão por **camadas** já é por responsabilidade — receber o pedido, decidir, guardar são responsabilidades diferentes:

~~~
servidor.js
rotas/pedidos.js       recebe o HTTP, chama o serviço, responde
servicos/pedidos.js    as regras: validar, calcular
dados/pedidos.js       ler e gravar
util/moeda.js          o que não sabe o que é pedido
~~~

Quando há muitos assuntos, inverte-se: primeiro o **assunto**, depois a camada dentro dele — \`pedidos/rotas.js\`, \`pedidos/servico.js\`, \`pedidos/dados.js\`. Os dois esqueletos são por responsabilidade; a diferença é qual eixo vem primeiro. Comece pelo primeiro; mude para o segundo quando \`servicos/\` tiver dez arquivos e você notar que abre sempre três pastas para mexer numa coisa.

Numa página é igual: \`componentes/\`, \`estado/\`, \`api/\` — ou por tela, \`carrinho/\`, \`catalogo/\`. O critério não muda de lado do servidor.

## A gaveta de bagunça: \`util/\`

Toda pasta \`util/\` começa com uma função e termina com trinta que ninguém sabe onde mais pôr. A regra que segura: só entra em \`util/\` o que **não sabe nada do seu domínio**. \`formatarMoeda\` recebe um número: pode. \`validarPedido\` sabe o que é um pedido: mora em \`pedidos/\`, não em \`util/\`. E quando \`util/\` passa de cinco arquivos, olhe os nomes — geralmente há uma pasta escondida ali (\`util/data.js\`, \`util/texto.js\`… viram \`formatacao/\`).

## O caminho é uma frase

\`servicos/pedidos.js\` se lê "o serviço de pedidos". Dois níveis quase sempre bastam; três é o teto. \`src/modulos/pedidos/servicos/impl/pedidos.js\` é um caminho que ninguém digita e ninguém lê. Na raiz ficam só os arquivos do projeto como um todo: \`servidor.js\`, \`package.json\`, \`README.md\`, \`.env.example\`, \`.gitignore\`.

## Mover sem quebrar

Mover um arquivo muda **os caminhos relativos**, dos dois lados. Se \`pedidos.js\` sai da raiz para \`servicos/\`:

- quem o usava fazia \`require('./pedidos')\` e passa a fazer \`require('./servicos/pedidos')\`;
- dentro dele, \`require('./dados/pedidos')\` vira \`require('../dados/pedidos')\` — um nível acima, porque ele desceu um.

O \`..\` é "a pasta de cima". De \`servicos/pedidos.js\`, \`../util/moeda\` é: suba para a raiz, entre em \`util\`. Mova um arquivo por vez e rode: um \`require\` errado quebra na hora, com "Cannot find module" — o erro mais fácil de consertar, desde que só um arquivo tenha se mexido.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// O esqueleto por camadas, com o require de cada arquivo apontando para baixo.

// servidor.js (raiz)
const { montarRotas } = require('./rotas/pedidos');

// rotas/pedidos.js — um nível abaixo da raiz: o serviço é vizinho de pasta
const { resumoDoPedido } = require('../servicos/pedidos');

// servicos/pedidos.js — dados e util também estão um nível acima
const dados = require('../dados/pedidos');
const { formatarMoeda } = require('../util/moeda');

// dados/pedidos.js — não requer nada do projeto
// util/moeda.js — não requer nada do projeto`,
      caption:
        'Cada arquivo requer só o que está abaixo dele nas camadas, e o caminho diz de onde parte: ./ é a própria pasta, ../ é a de cima.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-3-onde-mora',
        type: 'multiple-choice',
        prompt:
          'Numa API organizada por camadas (`rotas/`, `servicos/`, `dados/`, `util/`), onde mora `calcularFrete(itens, regiao)`, que aplica a tabela de frete da empresa aos itens de um pedido?',
        concepts: ['eng-pastas'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'pastas'],
        options: [
          '`servicos/frete.js` — é uma regra do negócio, e sabe o que é item e região',
          '`util/frete.js` — é uma função de cálculo, e cálculo é utilidade',
          '`rotas/frete.js` — é o que a rota de frete responde',
          '`dados/frete.js` — a tabela de frete é um dado',
        ],
        correctIndex: 0,
        explanation:
          'Regra do negócio mora nos serviços. `util/` é só para o que não sabe nada do domínio — e `calcularFrete` sabe o que é item, região e a tabela da empresa. A rota chama o serviço e responde; ela não calcula. A tabela em si pode ser um dado (`dados/tabelaDeFrete.js`), mas a **aplicação** dela aos itens é regra.',
        hints: ['A função sabe o que é um pedido? Então não é util. Ela responde HTTP? Então não é rota.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-3-por-tipo',
        type: 'multiple-choice',
        prompt:
          'Um projeto tem as pastas `funcoes/`, `classes/`, `constantes/` e `dados/`. Qual é o problema dessa divisão?',
        concepts: ['eng-pastas'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'pastas', 'coesao'],
        options: [
          'Uma mudança num assunto (pedidos, frete) toca todas as pastas, porque elas dizem o que o arquivo **é**, não para que ele serve',
          'São pastas demais: o ideal é um arquivo só',
          'Faltam as pastas `utils/` e `helpers/`',
          'Nenhum: é a divisão padrão do Node',
        ],
        correctIndex: 0,
        explanation:
          'Dividir por tipo espalha cada assunto por todas as pastas: a função de frete numa, a classe de frete noutra, a constante da tabela na terceira. Quem mexe em frete abre três pastas; quem procura "frete" acha pedaços. Por responsabilidade, tudo de frete mora em `frete/` (ou em `servicos/frete.js`), e o caminho já diz o assunto.',
        hints: ['Imagine que a regra de frete mudou. Quantas dessas pastas você abre?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-3-servico',
        type: 'server',
        prompt:
          'O projeto já tem `dados/pedidos.js` e `util/moeda.js` (acima do editor). Escreva `servicos/pedidos.js`: exporte `resumoDoPedido(id)`, que devolve `"Pedido 1 de Ana: R$ 25,00"` — ou `null` quando o pedido não existe. O seu arquivo mora em `servicos/`, então os outros estão **uma pasta acima**.',
        concepts: ['eng-pastas'],
        difficulty: 'intermediario',
        tags: ['engenharia', 'pastas', 'require'],
        caminho: './servicos/pedidos',
        arquivos: {
          './dados/pedidos.js': DADOS_PEDIDOS,
          './util/moeda.js': UTIL_MOEDA,
        },
        initialCode: `// servicos/pedidos.js — as regras. Os dados e a util estão uma pasta acima.

// Exporte resumoDoPedido(id).
`,
        tests: [
          {
            description: 'resumoDoPedido(1) devolve "Pedido 1 de Ana: R$ 25,00"',
            assertion: `if (typeof module.exports.resumoDoPedido !== 'function') throw new Error('module.exports precisa ter resumoDoPedido');
const r = module.exports.resumoDoPedido(1);
if (r !== 'Pedido 1 de Ana: R$ 25,00') throw new Error('esperava "Pedido 1 de Ana: R$ 25,00", veio ' + JSON.stringify(r));`,
          },
          {
            description: 'resumoDoPedido(2) soma os dois itens: "Pedido 2 de Bia: R$ 17,00"',
            assertion: `const r = module.exports.resumoDoPedido(2);
if (r !== 'Pedido 2 de Bia: R$ 17,00') throw new Error('esperava "Pedido 2 de Bia: R$ 17,00", veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Pedido que não existe devolve null',
            assertion: `if (module.exports.resumoDoPedido(9) !== null) throw new Error('resumoDoPedido(9) deveria devolver null, veio ' + JSON.stringify(module.exports.resumoDoPedido(9)));`,
          },
        ],
        solution: SERVICO_PEDIDOS,
        hints: [
          'De `servicos/`, os dados são `require("../dados/pedidos")` e a moeda é `require("../util/moeda")` — o `..` sobe para a raiz.',
          'Busque com `dados.buscar(id)`; se vier `null`, devolva `null`. Senão, some `preco * quantidade` dos itens e formate com `formatarMoeda`.',
          'O texto: `"Pedido " + pedido.id + " de " + pedido.cliente + ": " + formatarMoeda(total)`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-3-rota',
        type: 'server',
        prompt:
          'Agora a camada de cima. Escreva `rotas/pedidos.js`: exporte `montarRotas(app)`, que registra `GET /pedidos/:id` — responde `{ resumo }` com o texto de `resumoDoPedido`, ou **404** com `{ erro: "Pedido não encontrado" }`. A rota não calcula nada: chama o serviço, que está em `servicos/`, uma pasta acima da sua.',
        concepts: ['eng-pastas', 'node-rotas'],
        difficulty: 'intermediario',
        tags: ['engenharia', 'pastas', 'rotas'],
        caminho: './rotas/pedidos',
        arquivos: {
          './dados/pedidos.js': DADOS_PEDIDOS,
          './util/moeda.js': UTIL_MOEDA,
          './servicos/pedidos.js': SERVICO_PEDIDOS,
        },
        initialCode: `// rotas/pedidos.js — recebe o HTTP, chama o serviço, responde.
const express = require('express');
const app = express();

// Exporte montarRotas(app).

// O que servidor.js faria:
if (module.exports.montarRotas) module.exports.montarRotas(app);
`,
        tests: [
          {
            description: 'GET /pedidos/1 responde { resumo: "Pedido 1 de Ana: R$ 25,00" }',
            assertion: `if (typeof module.exports.montarRotas !== 'function') throw new Error('module.exports precisa ter montarRotas(app)');
const res = await pedir(app, 'GET', '/pedidos/1');
if (res.status !== 200 || !res.body || res.body.resumo !== 'Pedido 1 de Ana: R$ 25,00') throw new Error('GET /pedidos/1 respondeu ' + res.status + ' ' + res.texto + '; esperava 200 {"resumo":"Pedido 1 de Ana: R$ 25,00"} — lembre que req.params.id é texto');`,
          },
          {
            description: 'GET /pedidos/9 responde 404 com { erro: "Pedido não encontrado" }',
            assertion: `const res = await pedir(app, 'GET', '/pedidos/9');
if (res.status !== 404 || !res.body || res.body.erro !== 'Pedido não encontrado') throw new Error('GET /pedidos/9 respondeu ' + res.status + ' ' + res.texto + '; esperava 404 {"erro":"Pedido não encontrado"}');`,
          },
        ],
        solution: `const express = require('express');
const { resumoDoPedido } = require('../servicos/pedidos');
const app = express();

function montarRotas(app) {
  app.get('/pedidos/:id', (req, res) => {
    const resumo = resumoDoPedido(Number(req.params.id));
    if (resumo === null) return res.status(404).json({ erro: 'Pedido não encontrado' });
    res.json({ resumo });
  });
}

module.exports = { montarRotas };

if (module.exports.montarRotas) module.exports.montarRotas(app);`,
        hints: [
          'De `rotas/`, o serviço é `require("../servicos/pedidos")`. A rota nunca requer `dados/` direto: isso é pular uma camada.',
          '`montarRotas` recebe o `app` e registra `app.get("/pedidos/:id", …)` nele. Converta o id com `Number`.',
          '`resumoDoPedido` devolve `null` quando não existe: é o 404. Senão, `res.json({ resumo })`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-3-mover',
        type: 'order-steps',
        prompt:
          'O arquivo `pedidos.js` está na raiz e vai para `servicos/`. Coloque na ordem os passos para movê-lo sem deixar o projeto quebrado.',
        concepts: ['eng-pastas'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'pastas', 'require'],
        steps: [
          { id: 'rodar-antes', text: 'Rodar o projeto antes de mexer, para saber que ele estava funcionando', ordem: 1 },
          { id: 'mover', text: 'Criar `servicos/` e mover `pedidos.js` para dentro dela', ordem: 2 },
          { id: 'dentro', text: 'Dentro do arquivo movido, trocar `require("./dados/…")` por `require("../dados/…")` — ele desceu um nível', ordem: 3 },
          { id: 'fora', text: 'Em quem o usava, trocar `require("./pedidos")` por `require("./servicos/pedidos")`', ordem: 3 },
          { id: 'rodar-depois', text: 'Rodar de novo; um "Cannot find module" agora só pode ser um caminho deste arquivo', ordem: 4 },
        ],
        explanation:
          'Rodar antes é o que dá o direito de dizer "foi a mudança" quando quebrar. Mover muda caminhos dos dois lados — dentro do arquivo (que agora está um nível abaixo) e em quem o usa — e tanto faz qual dos dois se conserta primeiro. Rodar depois, com um arquivo só mexido, torna qualquer erro fácil de achar.',
        hints: [
          'O que se faz antes de qualquer mudança, para saber se ela quebrou algo?',
          'Mover muda os caminhos em dois lugares: dentro do arquivo e em quem o usa.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Pastas se organizam **pelo que cada parte faz**, não pelo tipo de arquivo: \`pedidos/\`, \`frete/\` — ou as camadas \`rotas/\`, \`servicos/\`, \`dados/\`, que são responsabilidades também. A regra é a da coesão, um nível acima: **o que muda junto fica junto**. Por tipo (\`funcoes/\`, \`classes/\`), cada assunto se espalha por todas as pastas.

\`util/\` só recebe o que **não sabe nada do domínio**. O caminho é uma frase, com dois níveis quase sempre e três no máximo. Na raiz, só o que é do projeto inteiro.

Mover um arquivo muda os \`require\` dos dois lados — \`./\` é a própria pasta, \`../\` é a de cima — e se faz um por vez, rodando no meio.

Na próxima aula, o que vai **dentro** dos arquivos: os nomes.
`.trim(),
    },
  ],
};

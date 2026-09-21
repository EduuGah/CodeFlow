import type { Lesson } from '../types';
import { API_DE_TAREFAS } from './proj-servidor';

const PARA_API = `function paraApi(tarefa) {
  return {
    id: tarefa.id,
    titulo: tarefa.titulo,
    feita: tarefa.feita === 1,
    criadaEm: tarefa.criada_em,
  };
}`;

const ESPERAR = (condicao: string, ms = 4000) =>
  `for (let i = 0; i < ${Math.ceil(ms / 20)} && !(${condicao}); i++) await new Promise((r) => setTimeout(r, 20));`;

export const lessonProjFechar: Lesson = {
  id: 'lesson-proj-5',
  trackId: 'track-projeto',
  title: 'Fechar: Testar, Documentar, Publicar',
  language: 'node',
  objective:
    'Transformar a lista do "pronto" em pedidos de ponta a ponta, testar o contrato da API, escrever o README que o projeto merece, e saber o que muda — e o que não muda — ao publicar página, API e banco.',
  concepts: ['proj-fechar'],
  status: 'published',
  estimatedMinutes: 35,
  blocks: [
    {
      kind: 'prose',
      markdown: `
A aplicação funciona: a página chama a API, a API consulta o banco. "Funciona" é o que se diz antes de alguém usar. Fechar um projeto é o que vem entre o funciona e o entregue — e são três coisas.

## A lista do "pronto" vira pedidos

Na primeira aula você escreveu o que "pronto" quer dizer: a Ana vê só as tarefas dela; sem token, 401; tarefa de outro, 403; título vazio, 400; criar, marcar e apagar sobrevivem a recarregar. Cada frase dessas é um **pedido com uma resposta esperada** — e um pedido se automatiza:

~~~js
const checagens = [
  { nome: 'sem token responde 401', pedido: ['/tarefas', {}], esperado: 401 },
  { nome: 'a Ana vê 3 tarefas', pedido: ['/tarefas', { headers: { Authorization: 'Bearer token-da-ana' } }], esperado: 200 },
  { nome: 'título vazio responde 400', pedido: ['/tarefas', { method: 'POST', headers: …, body: '{"titulo":""}' }], esperado: 400 },
];
~~~

É o **roteiro de fumaça** (*smoke test*): poucos pedidos, os que provam que as camadas estão de pé e conversando. Roda depois de cada mudança e — o mais importante — **depois de publicar**, contra o endereço de verdade. Um servidor que sobe com a variável de ambiente errada passa em todos os testes de unidade e falha no primeiro pedido real.

## Testar o contrato

Os testes de unidade da trilha de testes cobrem cada camada por dentro. O que este projeto tem de especial é o **contrato**: o formato que a API promete à página. Uma função como \`paraApi\` é onde o contrato nasce, e um teste dela é o que segura o \`feita\` como booleano e o \`criadaEm\` com esse nome — o dia em que alguém "arrumar" o nome do campo, o teste avisa antes da página quebrar.

## O README deste projeto

O da trilha de engenharia, aplicado: **o que é** (a lista de tarefas com conta: página, API e banco), **como rodar** (o Node, o \`npm ci\`, as variáveis do \`.env.example\`, a migração, o \`npm run dev\`), **como testar** (o \`npm test\`, e o roteiro de fumaça contra um servidor de pé), e as **decisões**: \`feita\` é 0/1 no banco e booleano na API; toda tarefa tem dono; os tokens são fixos por enquanto.

## Publicar: o que muda

Cada camada mora num lugar:

| Camada | Vai para | O que muda |
| --- | --- | --- |
| Banco | um Postgres hospedado (o Supabase, como o CodeFlow) | a migração roda lá, uma vez; a URL vira variável de ambiente da API |
| API | um host de Node (Vercel, Railway, um VPS) | \`PORTA\` e \`BANCO_URL\` vêm do painel do host, nunca do código; \`NODE_ENV=production\` |
| Página | um host de arquivos estáticos (a própria Vercel, o Netlify) | a URL da API entra na página na hora de construir; o navegador exige **CORS** da API, e é o \`cors()\` antes das rotas |

E o que **não** muda: nenhuma linha de rota, de repositório ou de página. Se publicar exige mexer no código, a configuração estava no lugar errado — é o que a aula de configuração e segredos avisou.

Três coisas que aparecem só em produção: **HTTPS** (o host dá; a página só chama \`https://\`), **CORS** (a API precisa listar a origem da página), e o **token de verdade** — o login que gera tokens com validade e guarda senha como hash é o primeiro trabalho depois deste projeto, e o desenho da API não muda por causa dele.

## Depois

Você tem uma aplicação inteira, feita camada por camada, com a lista do pronto cumprida. O que vem a seguir são os capstones: a mesma arquitetura com outro domínio — uma loja, um blog —, sem aula segurando a mão. É onde a trilha termina e o trabalho começa.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// roteiro.js — o roteiro de fumaça: poucos pedidos, contra o endereço de verdade.
const API = process.env.API_URL || 'http://localhost:3000';
const ANA = { Authorization: 'Bearer token-da-ana' };

const checagens = [
  { nome: 'saúde', pedir: () => fetch(API + '/saude'), esperado: 200 },
  { nome: 'sem token responde 401', pedir: () => fetch(API + '/tarefas'), esperado: 401 },
  { nome: 'a Ana lista as dela', pedir: () => fetch(API + '/tarefas', { headers: ANA }), esperado: 200 },
  { nome: 'título vazio responde 400', pedir: () => fetch(API + '/tarefas', { method: 'POST', headers: { ...ANA, 'Content-Type': 'application/json' }, body: '{"titulo":""}' }), esperado: 400 },
];

for (const checagem of checagens) {
  const resposta = await checagem.pedir();
  const ok = resposta.status === checagem.esperado;
  console.log((ok ? 'ok     ' : 'FALHOU ') + checagem.nome + ' (' + resposta.status + ')');
}`,
      caption:
        'Cada linha da lista do "pronto" virou um pedido com o status esperado. Roda em segundos, e é a primeira coisa a rodar depois de publicar.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-5-contrato',
        type: 'write-test',
        prompt:
          '`paraApi` é onde o contrato da API nasce: ela recebe a linha do banco e devolve o que a página vê. Escreva os testes dela com `assert(condição, "mensagem")`, um por linha. Pense no que o contrato promete: `feita` é booleano, a data se chama `criadaEm`, e o que é do banco (`usuario_id`) não sai.',
        concepts: ['proj-fechar'],
        difficulty: 'intermediario',
        tags: ['projeto', 'testes', 'contrato'],
        subject: PARA_API,
        initialCode: `// Escreva asserções sobre paraApi. Uma por linha.
//
// const linha = { id: 7, titulo: 'Publicar', feita: 1, usuario_id: 1, criada_em: '2026-09-21' };
// assert(paraApi(linha).id === 7, 'o id passa');

`,
        mutants: [
          {
            description: 'esquece de traduzir: feita sai como 0/1',
            code: `function paraApi(tarefa) {
  return {
    id: tarefa.id,
    titulo: tarefa.titulo,
    feita: tarefa.feita,
    criadaEm: tarefa.criada_em,
  };
}`,
          },
          {
            description: 'a data sai com o nome do banco, criada_em',
            code: `function paraApi(tarefa) {
  return {
    id: tarefa.id,
    titulo: tarefa.titulo,
    feita: tarefa.feita === 1,
    criada_em: tarefa.criada_em,
  };
}`,
          },
          {
            description: 'vaza o usuario_id para a página',
            code: `function paraApi(tarefa) {
  return {
    id: tarefa.id,
    titulo: tarefa.titulo,
    feita: tarefa.feita === 1,
    criadaEm: tarefa.criada_em,
    usuario_id: tarefa.usuario_id,
  };
}`,
          },
        ],
        hints: [
          'Monte uma linha como o banco entrega — com `feita: 1` e `criada_em` — e afirme cada promessa do contrato sobre `paraApi(linha)`.',
          'Uma promessa é o tipo: `paraApi(linha).feita === true` pega a versão que deixa passar o 1.',
          'Outra é o nome do campo, `criadaEm`; e a última é o que **não** pode existir na saída — `"usuario_id" in paraApi(linha)` precisa ser falso.',
          "const linha = { id: 7, titulo: 'Publicar', feita: 1, usuario_id: 1, criada_em: '2026-09-21' }; assert(paraApi(linha).feita === true, 'feita vira booleano'); assert(paraApi(linha).criadaEm === '2026-09-21', 'a data se chama criadaEm'); assert(!('usuario_id' in paraApi(linha)), 'usuario_id não sai');",
        ],
        solution: `const linha = { id: 7, titulo: 'Publicar', feita: 1, usuario_id: 1, criada_em: '2026-09-21' };
assert(paraApi(linha).feita === true, 'feita vira booleano');
assert(paraApi(linha).criadaEm === '2026-09-21', 'a data se chama criadaEm');
assert(!('usuario_id' in paraApi(linha)), 'usuario_id nao sai');`,
        explanation:
          'Três promessas, três testes — e cada um pega exatamente um jeito de quebrar o contrato. Repare no terceiro: testar o que **não** deve existir é tão importante quanto o que deve; é ele que impede o campo do banco de vazar para a página quando alguém "só copiar o objeto inteiro".',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-5-fumaca',
        type: 'code',
        runtime: 'iframe',
        servidor: API_DE_TAREFAS,
        prompt:
          'O roteiro de fumaça como uma página: para cada checagem da lista, faça o pedido e ponha em `#relatorio` um `<li>` com `"ok — <nome>"` ou `"FALHOU — <nome>"` (o status obtido entre parênteses). No fim, `#resumo` diz `"pronto para publicar"` se tudo passou, ou quantas falharam. A API está de pé atrás da página.',
        concepts: ['proj-fechar', 'dom-fetch'],
        difficulty: 'intermediario',
        tags: ['projeto', 'testes', 'fetch'],
        initialCode: `<h1>Roteiro de fumaça</h1>
<ul id="relatorio"></ul>
<p id="resumo">rodando…</p>
<script>
  const ANA = { Authorization: 'Bearer token-da-ana' };
  const BIA = { Authorization: 'Bearer token-da-bia' };

  const checagens = [
    { nome: 'saúde responde 200', pedir: () => fetch('/saude'), esperado: 200 },
    { nome: 'sem token responde 401', pedir: () => fetch('/tarefas'), esperado: 401 },
    { nome: 'a Ana lista as dela', pedir: () => fetch('/tarefas', { headers: ANA }), esperado: 200 },
    { nome: 'título vazio responde 400', pedir: () => fetch('/tarefas', { method: 'POST', headers: { ...ANA, 'Content-Type': 'application/json' }, body: JSON.stringify({ titulo: '' }) }), esperado: 400 },
    { nome: 'tarefa da Ana pela Bia responde 403', pedir: () => fetch('/tarefas/1', { method: 'DELETE', headers: BIA }), esperado: 403 },
  ];

  async function rodar() {
    // Para cada checagem: pedir, comparar o status, um <li>; no fim, o resumo.
  }

  rodar();
</script>`,
        tests: [
          {
            description: 'O relatório tem uma linha por checagem, com ok ou FALHOU e o status',
            assertion: `${ESPERAR("document.querySelectorAll('#relatorio li').length >= 5")}
const linhas = [...document.querySelectorAll('#relatorio li')].map((li) => li.textContent.trim());
if (linhas.length !== 5) throw new Error('esperava 5 linhas no relatório, veio ' + linhas.length);
for (const linha of linhas) {
  if (!/^(ok|FALHOU) — /.test(linha) || !/\\(\\d{3}\\)/.test(linha)) throw new Error('cada linha começa com "ok — " ou "FALHOU — " e traz o status entre parênteses, veio ' + JSON.stringify(linha));
}
if (!linhas[1].startsWith('ok') || !linhas[1].includes('(401)')) throw new Error('a checagem "sem token responde 401" deveria passar, com (401): veio ' + JSON.stringify(linhas[1]));`,
          },
          {
            description: 'Com a API certa, tudo passa e o resumo diz "pronto para publicar"',
            assertion: `${ESPERAR("document.querySelector('#resumo').textContent.includes('pronto')", 2000)}
const resumo = document.querySelector('#resumo').textContent;
if (!resumo.includes('pronto para publicar')) throw new Error('com as 5 checagens passando, #resumo deveria dizer "pronto para publicar", veio ' + JSON.stringify(resumo));`,
          },
          {
            description: 'Uma checagem errada aparece como FALHOU — o relatório não mente',
            assertion: `checagens.push({ nome: 'de propósito: saúde responde 500', pedir: () => fetch('/saude'), esperado: 500 });
document.querySelector('#relatorio').replaceChildren();
await rodar();
${ESPERAR("document.querySelectorAll('#relatorio li').length >= 6", 2000)}
const linhas = [...document.querySelectorAll('#relatorio li')].map((li) => li.textContent.trim());
if (!linhas[5] || !linhas[5].startsWith('FALHOU') || !linhas[5].includes('(200)')) throw new Error('a checagem que espera 500 e recebe 200 deveria aparecer como "FALHOU — … (200)", veio ' + JSON.stringify(linhas[5]));
const resumo = document.querySelector('#resumo').textContent;
if (resumo.includes('pronto para publicar') || !/1/.test(resumo)) throw new Error('com uma falha, #resumo deveria dizer quantas falharam (1), veio ' + JSON.stringify(resumo));`,
          },
        ],
        solution: `<h1>Roteiro de fumaça</h1>
<ul id="relatorio"></ul>
<p id="resumo">rodando…</p>
<script>
  const ANA = { Authorization: 'Bearer token-da-ana' };
  const BIA = { Authorization: 'Bearer token-da-bia' };

  const checagens = [
    { nome: 'saúde responde 200', pedir: () => fetch('/saude'), esperado: 200 },
    { nome: 'sem token responde 401', pedir: () => fetch('/tarefas'), esperado: 401 },
    { nome: 'a Ana lista as dela', pedir: () => fetch('/tarefas', { headers: ANA }), esperado: 200 },
    { nome: 'título vazio responde 400', pedir: () => fetch('/tarefas', { method: 'POST', headers: { ...ANA, 'Content-Type': 'application/json' }, body: JSON.stringify({ titulo: '' }) }), esperado: 400 },
    { nome: 'tarefa da Ana pela Bia responde 403', pedir: () => fetch('/tarefas/1', { method: 'DELETE', headers: BIA }), esperado: 403 },
  ];

  async function rodar() {
    const relatorio = document.querySelector('#relatorio');
    let falhas = 0;
    for (const checagem of checagens) {
      const resposta = await checagem.pedir();
      const ok = resposta.status === checagem.esperado;
      if (!ok) falhas = falhas + 1;
      const li = document.createElement('li');
      li.textContent = (ok ? 'ok' : 'FALHOU') + ' — ' + checagem.nome + ' (' + resposta.status + ')';
      relatorio.append(li);
    }
    document.querySelector('#resumo').textContent =
      falhas === 0 ? 'pronto para publicar' : falhas + ' checagem(ns) falharam';
  }

  rodar();
</script>`,
        hints: [
          'Um `for (const checagem of checagens)` com `await checagem.pedir()` dentro; `ok` é `resposta.status === checagem.esperado`.',
          'O `li`: `(ok ? "ok" : "FALHOU") + " — " + checagem.nome + " (" + resposta.status + ")"`. Conte as falhas.',
          'No fim: `falhas === 0 ? "pronto para publicar" : falhas + " checagem(ns) falharam"` em `#resumo`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-5-publicar',
        type: 'multiple-choice',
        prompt: 'Ao publicar, a página vai para um host de arquivos estáticos e a API para um host de Node, em endereços diferentes. O que precisa mudar?',
        concepts: ['proj-fechar'],
        difficulty: 'intermediario',
        tags: ['projeto', 'publicar', 'cors'],
        options: [
          'Nenhuma rota, repositório ou tela: a URL da API entra na página na construção, a API lê porta e banco do ambiente, e ganha o `cors()` para a origem da página',
          'A página precisa ser reescrita em Node, para rodar no mesmo host da API',
          'A API precisa mudar as rotas para incluir o endereço da página',
          'O banco precisa ficar dentro do host da API, no mesmo arquivo',
        ],
        correctIndex: 0,
        explanation:
          'Se publicar exigisse mexer nas rotas ou na página, a configuração estaria no código — o erro que a aula de configuração avisou. O que muda mora no ambiente (a URL do banco, a porta, a URL da API que a página usa) e na fronteira entre origens: o navegador só deixa a página ler a resposta da API se a API disser que pode, e isso é o middleware de CORS.',
        hints: ['O que a aula de configuração e segredos ensinou sobre o que muda entre máquinas — onde isso mora?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-5-ordem',
        type: 'order-steps',
        prompt: 'Coloque na ordem os passos para publicar a aplicação pela primeira vez.',
        concepts: ['proj-fechar'],
        difficulty: 'iniciante',
        tags: ['projeto', 'publicar'],
        steps: [
          { id: 'banco', text: 'Criar o banco hospedado e rodar a migração nele, uma vez', ordem: 1 },
          { id: 'env', text: 'Definir as variáveis da API no painel do host: `BANCO_URL`, `PORTA`, `NODE_ENV=production`', ordem: 2 },
          { id: 'api', text: 'Publicar a API e conferir `GET /saude` no endereço novo', ordem: 3 },
          { id: 'pagina', text: 'Publicar a página apontando para a URL da API — e a API com `cors()` para a origem da página', ordem: 4 },
          { id: 'fumaca', text: 'Rodar o roteiro de fumaça contra os endereços de verdade', ordem: 5 },
        ],
        explanation:
          'De baixo para cima, como na construção: a API não sobe sem o banco e sem as variáveis; a página não faz sentido sem a API de pé. O `/saude` é a primeira prova de que a API subiu; o roteiro de fumaça no fim é a prova de que as três camadas conversam onde importa — em produção.',
        hints: ['A ordem é a das dependências: o que precisa existir antes de cada camada subir?', 'O que se roda por último prova que tudo conversa no endereço de verdade.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-5-readme',
        type: 'multiple-choice',
        prompt: 'Qual destas frases pertence à seção "decisões que valem saber" do README deste projeto — e não a "como rodar"?',
        concepts: ['proj-fechar'],
        difficulty: 'iniciante',
        tags: ['projeto', 'readme'],
        options: [
          '"`feita` é 0/1 no banco e booleano na API: a tradução mora em `paraApi`, e é a única que sabe disso"',
          '"Copie o `.env.example` para `.env` e preencha `BANCO_URL`"',
          '"`npm ci` e depois `npm run dev`"',
          '"`npm test` roda os testes de unidade; o roteiro de fumaça precisa de um servidor de pé"',
        ],
        correctIndex: 0,
        explanation:
          'As outras três respondem "como rodar" e "como testar" — comandos que quem chega segue. A primeira é uma **decisão**: algo que parece estranho no código (dois formatos para o mesmo campo) e é de propósito. Sem a frase, o próximo dev "corrige" o banco para guardar `true` e quebra a API.',
        hints: ['Qual frase explica um porquê, em vez de dizer o que digitar?'],
      },
    },
    {
      kind: 'summary',
      markdown: `
Fechar um projeto são três coisas. A lista do "pronto" vira **pedidos de ponta a ponta** — o roteiro de fumaça, que roda depois de cada mudança e depois de publicar. O **contrato** da API ganha testes, porque é a parte que a página depende e que alguém vai querer "arrumar". E o **README** responde o que é, como rodar, como testar, e as decisões que parecem estranhas.

Publicar não muda uma linha de rota, repositório ou tela: muda o ambiente (banco, porta, URL da API) e a fronteira entre origens (CORS). O que aparece só em produção — HTTPS, CORS, o token de verdade — se prepara com o roteiro de fumaça no endereço real.

**Você construiu uma aplicação inteira**: a tela, a API e o banco, camada por camada, cada uma testada, e a lista do pronto cumprida. O que vem depois são os capstones — a mesma arquitetura, outro domínio, sem aula segurando a mão.
`.trim(),
    },
  ],
};

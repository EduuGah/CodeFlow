import type { Lesson } from '../types';

export const lessonBuscarEDesenhar: Lesson = {
  id: 'lesson-pagina-18',
  trackId: 'track-pagina',
  title: 'Buscar e Desenhar: Dados que Vêm de Fora',
  language: 'html',
  objective:
    'Buscar dados com fetch, tratar os três estados da tela — carregando, erro, dados — e desenhar o resultado sem nunca deixar a página muda.',
  concepts: ['dom-fetch'],
  status: 'published',
  estimatedMinutes: 32,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Até aqui os dados estavam no próprio script. Numa aplicação de verdade eles vêm de um servidor, pela rede — a rede lenta e não confiável da trilha web. Esta aula junta tudo: \`fetch\` e \`async/await\` da trilha de JavaScript, a função \`desenhar\` do DOM, e uma disciplina nova: a tela **sempre** diz em que estado está.

## fetch, em quatro linhas

~~~js
const resposta = await fetch('/api/produtos');
if (!resposta.ok) throw new Error('Falha: ' + resposta.status);
const produtos = await resposta.json();
desenhar(produtos);
~~~

Duas esperas: uma pela **resposta** chegar, outra pelo **corpo** ser lido e convertido de JSON. E a checagem de \`ok\` no meio, porque \`fetch\` **não lança** em 404 ou 500 — para ele, uma resposta chegou, e isso é sucesso. Só falha de rede (sem conexão, servidor fora) vira exceção.

## Os três estados

Toda tela que busca dados vive em um de três estados, e cada um precisa aparecer:

1. **Carregando** — a pessoa clicou e nada veio ainda. Se a tela não muda, ela clica de novo.
2. **Erro** — a busca falhou. Diga, em texto, e ofereça tentar de novo.
3. **Dados** — chegou; desenhe. Inclusive quando a lista veio **vazia**, que é um dado, não um erro.

~~~js
async function carregar() {
  mostrarEstado('carregando');
  try {
    const resposta = await fetch('/api/produtos');
    if (!resposta.ok) throw new Error('O servidor respondeu ' + resposta.status);
    const produtos = await resposta.json();
    desenhar(produtos);
    mostrarEstado('pronto');
  } catch (erro) {
    mostrarEstado('erro', erro.message);
  }
}
~~~

\`mostrarEstado\` é a função que liga e desliga os pedaços da tela — o aviso "Carregando…", o painel de erro, a lista. Um lugar só, e nenhum estado fica esquecido aceso.

## Botão que espera

Enquanto carrega, o botão que disparou a busca fica desabilitado, como no formulário. É a mesma regra: enquanto o resultado não chega, não aceite outro pedido igual.

## O servidor destes exercícios

A página do exercício não tem rede — de propósito. O \`fetch\` daqui responde com o que a página declarou num objeto chamado \`window.__servidor\`: um caminho, um dado. Você escreve o código **exatamente** como escreveria para um servidor de verdade — a URL, o \`ok\`, o \`json()\` —, e um caminho que não existe devolve 404, como na vida.

~~~js
window.__servidor = {
  '/api/produtos': [{ nome: 'Pão', preco: 8 }],
};
~~~

## Quando a resposta antiga chega depois da nova

A pessoa digita "pa" e depois "pão": duas buscas saem, e a primeira pode voltar **depois** da segunda, sobrescrevendo o resultado certo. A solução mais simples é numerar as buscas e ignorar as que não são a última:

~~~js
let ultima = 0;
async function buscar(termo) {
  const minha = ++ultima;
  const dados = await (await fetch('/api/busca?q=' + termo)).json();
  if (minha !== ultima) return;   // uma busca mais nova já saiu
  desenhar(dados);
}
~~~

## Os erros

- Não checar \`resposta.ok\` e tentar desenhar uma página de erro como se fosse dados.
- Esquecer o estado "carregando": a pessoa clica de novo e de novo.
- Tratar lista vazia como erro.
- Deixar a resposta antiga sobrescrever a nova.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<button id="recarregar">Carregar produtos</button>
<p id="estado" role="status"></p>
<ul id="lista"></ul>

<script>
  window.__servidor = {
    '/api/produtos': [
      { nome: 'Pão', preco: 8 },
      { nome: 'Café', preco: 15 },
    ],
  };

  function desenhar(produtos) {
    const ul = document.querySelector('#lista');
    ul.replaceChildren();
    for (const p of produtos) {
      const li = document.createElement('li');
      li.textContent = p.nome + ' — R$ ' + p.preco.toFixed(2);
      ul.append(li);
    }
  }

  async function carregar() {
    const botao = document.querySelector('#recarregar');
    const estado = document.querySelector('#estado');
    botao.disabled = true;
    estado.textContent = 'Carregando…';
    try {
      const resposta = await fetch('/api/produtos');
      if (!resposta.ok) throw new Error('O servidor respondeu ' + resposta.status);
      const produtos = await resposta.json();
      desenhar(produtos);
      estado.textContent = produtos.length === 0 ? 'Nenhum produto.' : '';
    } catch (erro) {
      estado.textContent = 'Não foi possível carregar: ' + erro.message + ' Tente de novo.';
    } finally {
      botao.disabled = false;
    }
  }

  document.querySelector('#recarregar').addEventListener('click', carregar);
  carregar();
</script>`,
      caption:
        'Os três estados num `#estado` com `role="status"`, o botão desabilitado enquanto carrega e reabilitado no `finally`, e a lista vazia tratada como dado. Troque o caminho para `/api/nada` na pré-visualização e veja o 404 virar mensagem.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-18-ok',
        type: 'multiple-choice',
        prompt: 'O servidor respondeu 500. O que `await fetch(url)` faz?',
        concepts: ['dom-fetch'],
        difficulty: 'iniciante',
        tags: ['dom', 'fetch'],
        options: [
          'Lança um erro, que o `catch` pega',
          'Devolve a resposta normalmente, com `ok` igual a `false` — quem lança é você, depois de checar',
          'Devolve `null`',
          'Tenta de novo sozinho',
        ],
        correctIndex: 1,
        explanation:
          'Para o `fetch`, uma resposta chegou — mesmo que seja um 500 —, e chegar é sucesso. Ele só lança quando **não há resposta**: rede fora, servidor inalcançável. Por isso toda busca checa `resposta.ok` (200 a 299) e lança por conta própria, para o `catch` tratar os dois casos do mesmo jeito.',
        hints: ['Do ponto de vista da rede, um 500 é uma resposta que chegou ou uma que não chegou?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-18-carregar',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Escreva `async function carregar()`: busque `/api/produtos`, cheque `ok`, leia o JSON e desenhe um `<li>` por produto no `#lista` com **nome — R$ preco** (duas casas). Se algo falhar, escreva **Não foi possível carregar.** no `#estado`.\n\nChame `carregar()` no fim.',
        concepts: ['dom-fetch'],
        difficulty: 'iniciante',
        tags: ['dom', 'fetch'],
        initialCode: `<p id="estado" role="status"></p>
<ul id="lista"></ul>

<script>
  window.__servidor = {
    '/api/produtos': [
      { nome: 'Pão', preco: 8 },
      { nome: 'Café', preco: 15.5 },
    ],
  };

  async function carregar() {
    // fetch, ok, json, desenhar; erro em #estado
  }

  carregar();
</script>
`,
        tests: [
          {
            description: 'os produtos aparecem na lista',
            assertion: `
              await new Promise((r) => setTimeout(r, 200));
              const itens = [...document.querySelectorAll('#lista li')].map((li) => li.textContent.trim());
              if (itens.join('|') !== 'Pão — R$ 8.00|Café — R$ 15.50') throw new Error('Esperava "Pão — R$ 8.00" e "Café — R$ 15.50" em #lista; veio [' + itens.join(', ') + '].');
            `,
          },
          {
            description: 'com o caminho fora do ar, a tela avisa em vez de ficar muda',
            assertion: `
              delete window.__servidor['/api/produtos'];
              document.querySelector('#lista').replaceChildren();
              await carregar();
              const e = document.querySelector('#estado').textContent.trim();
              if (e !== 'Não foi possível carregar.') throw new Error('Com 404, #estado precisa dizer "Não foi possível carregar."; veio "' + e + '". Cheque resposta.ok e lance.');
            `,
          },
          {
            description: 'a busca usa fetch e resposta.json()',
            assertion: `
              for (const s of document.querySelectorAll('script')) {
                if (/__codeflow|new Function/.test(s.textContent)) continue;
                if (!/fetch\\(/.test(s.textContent) || !/\\.json\\(\\)/.test(s.textContent)) throw new Error('Busque com fetch e leia o corpo com await resposta.json().');
                if (!/\\.ok\\b/.test(s.textContent)) throw new Error('Cheque resposta.ok: fetch não lança em 404.');
              }
            `,
            hidden: true,
          },
        ],
        hints: [
          'Dentro de `try`: `const resposta = await fetch("/api/produtos"); if (!resposta.ok) throw new Error(...)`.',
          'Depois: `const produtos = await resposta.json()` e o laço de criar `li` da aula de criar; o `catch` escreve em `#estado`.',
          "async function carregar() {\n  try {\n    const resposta = await fetch('/api/produtos');\n    if (!resposta.ok) throw new Error('status ' + resposta.status);\n    const produtos = await resposta.json();\n    const ul = document.querySelector('#lista');\n    ul.replaceChildren();\n    for (const p of produtos) {\n      const li = document.createElement('li');\n      li.textContent = p.nome + ' — R$ ' + p.preco.toFixed(2);\n      ul.append(li);\n    }\n  } catch {\n    document.querySelector('#estado').textContent = 'Não foi possível carregar.';\n  }\n}",
        ],
        solution: `<p id="estado" role="status"></p>
<ul id="lista"></ul>

<script>
  window.__servidor = {
    '/api/produtos': [
      { nome: 'Pão', preco: 8 },
      { nome: 'Café', preco: 15.5 },
    ],
  };

  async function carregar() {
    try {
      const resposta = await fetch('/api/produtos');
      if (!resposta.ok) throw new Error('O servidor respondeu ' + resposta.status);
      const produtos = await resposta.json();

      const ul = document.querySelector('#lista');
      ul.replaceChildren();
      for (const p of produtos) {
        const li = document.createElement('li');
        li.textContent = p.nome + ' — R$ ' + p.preco.toFixed(2);
        ul.append(li);
      }
    } catch {
      document.querySelector('#estado').textContent = 'Não foi possível carregar.';
    }
  }

  carregar();
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-18-lacuna-estados',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt: 'Complete a busca com os três estados: a espera pela resposta, a checagem, a leitura do corpo.',
        concepts: ['dom-fetch'],
        difficulty: 'iniciante',
        tags: ['dom', 'fetch'],
        template: `<p id="estado" role="status"></p>
<p id="total"></p>

<script>
  window.__servidor = { '/api/carrinho': { itens: 3, total: 42.9 } };

  async function carregar() {
    const estado = document.querySelector('#estado');
    estado.textContent = 'Carregando…';
    try {
      const resposta = {{1}} fetch('/api/carrinho');
      if (!resposta.{{2}}) throw new Error('status ' + resposta.status);
      const carrinho = await resposta.{{3}}();
      document.querySelector('#total').textContent = carrinho.itens + ' itens, R$ ' + carrinho.total.toFixed(2);
      estado.textContent = '';
    } catch (erro) {
      estado.textContent = 'Erro: ' + erro.message;
    }
  }

  carregar();
</script>`,
        blanks: [
          { placeholder: 'esperar', size: 5 },
          { placeholder: 'deu certo?', size: 2 },
          { placeholder: 'ler o corpo', size: 4 },
        ],
        tests: [
          {
            description: 'o carrinho foi lido e o estado limpo',
            assertion: `
              await new Promise((r) => setTimeout(r, 200));
              const t = document.querySelector('#total').textContent.trim();
              if (t !== '3 itens, R$ 42.90') throw new Error('Esperava "3 itens, R$ 42.90"; veio "' + t + '".');
              if (document.querySelector('#estado').textContent.trim() !== '') throw new Error('Depois de carregar, #estado precisa ser limpo.');
            `,
          },
        ],
        hints: [
          'A palavra que espera uma promise; a propriedade que diz se o status é 2xx; o método que lê JSON.',
        ],
        solution: ['await', 'ok', 'json'],
        explanation:
          'Duas esperas e uma checagem entre elas: `await fetch` espera a resposta chegar, `ok` diz se o status é de sucesso, `await resposta.json()` espera o corpo ser lido. Os três estados estão todos aqui: "Carregando…" antes, o `catch` com a mensagem, e o `#total` com o dado — e o estado limpo, para não sobrar "Carregando…" aceso.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-18-ordenar-busca',
        type: 'order-steps',
        prompt: 'A pessoa clica em "Carregar". Coloque na ordem o que a tela e o código fazem.',
        concepts: ['dom-fetch'],
        difficulty: 'intermediario',
        tags: ['dom', 'fetch'],
        steps: [
          { id: 'carregando', text: 'O botão é desabilitado e a tela mostra "Carregando…"', ordem: 1 },
          { id: 'fetch', text: '`await fetch(url)` espera a resposta chegar', ordem: 2 },
          { id: 'ok', text: '`resposta.ok` é checado; se falso, lança para o `catch`', ordem: 3 },
          { id: 'json', text: '`await resposta.json()` espera o corpo ser lido', ordem: 4 },
          { id: 'desenha', text: '`desenhar(dados)` mostra o resultado, o estado é limpo, e o `finally` reabilita o botão', ordem: 5 },
        ],
        explanation:
          'O primeiro passo acontece **antes** de qualquer rede, e é o mais esquecido: sem ele, a tela fica muda por até alguns segundos e a pessoa clica de novo. O último tem duas saídas — sucesso ou `catch` —, mas o `finally` reabilita o botão nas duas: uma busca que falhou precisa poder ser tentada de novo.',
        hints: [
          'A tela avisa que está esperando antes de começar a esperar.',
          'Entre a resposta chegar e o corpo ser lido, há uma pergunta.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-18-tres-estados',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Escreva `async function carregar()` com os três estados: ao começar, `#botao` desabilitado e **Carregando…** no `#estado`; no sucesso, a lista desenhada, `#estado` vazio (ou **Nenhum produto.** se a lista vier vazia); na falha, **Falhou: <mensagem>. Tente de novo.**; e o botão reabilitado sempre, no `finally`.',
        concepts: ['dom-fetch'],
        difficulty: 'intermediario',
        tags: ['dom', 'fetch'],
        initialCode: `<button id="botao">Carregar</button>
<p id="estado" role="status"></p>
<ul id="lista"></ul>

<script>
  window.__servidor = {
    '/api/produtos': [{ nome: 'Pão', preco: 8 }],
  };

  function desenhar(produtos) {
    const ul = document.querySelector('#lista');
    ul.replaceChildren();
    for (const p of produtos) {
      const li = document.createElement('li');
      li.textContent = p.nome;
      ul.append(li);
    }
  }

  async function carregar() {
    // carregando → (dados | vazio | erro) → finally
  }

  document.querySelector('#botao').addEventListener('click', carregar);
</script>
`,
        tests: [
          {
            description: 'enquanto carrega, o botão trava e a tela avisa',
            assertion: `
              const p = carregar();
              if (!document.querySelector('#botao').disabled) throw new Error('Assim que carregar() começa, #botao precisa estar desabilitado.');
              if (document.querySelector('#estado').textContent.trim() !== 'Carregando…') throw new Error('Assim que carregar() começa, #estado precisa dizer "Carregando…".');
              await p;
            `,
          },
          {
            description: 'no sucesso: lista desenhada, estado limpo, botão de volta',
            assertion: `
              await carregar();
              if (document.querySelectorAll('#lista li').length !== 1) throw new Error('A lista precisa ter o Pão.');
              if (document.querySelector('#estado').textContent.trim() !== '') throw new Error('Depois do sucesso, #estado precisa ficar vazio; veio "' + document.querySelector('#estado').textContent.trim() + '".');
              if (document.querySelector('#botao').disabled) throw new Error('Depois de terminar, o botão precisa voltar a funcionar.');
            `,
          },
          {
            description: 'lista vazia é dado, não erro',
            assertion: `
              window.__servidor['/api/produtos'] = [];
              await carregar();
              if (document.querySelector('#estado').textContent.trim() !== 'Nenhum produto.') throw new Error('Com a lista vazia, #estado precisa dizer "Nenhum produto."; veio "' + document.querySelector('#estado').textContent.trim() + '".');
            `,
          },
          {
            description: 'na falha, a mensagem convida a tentar de novo e o botão volta',
            assertion: `
              delete window.__servidor['/api/produtos'];
              await carregar();
              const e = document.querySelector('#estado').textContent.trim();
              if (!/^Falhou: .+\\. Tente de novo\\.$/.test(e)) throw new Error('Com 404, #estado precisa dizer "Falhou: <mensagem>. Tente de novo."; veio "' + e + '".');
              if (document.querySelector('#botao').disabled) throw new Error('Mesmo na falha o botão precisa voltar: reabilite no finally.');
            `,
          },
        ],
        hints: [
          'Antes do `try`: `botao.disabled = true; estado.textContent = "Carregando…"`.',
          'No `try`: fetch, ok, json, `desenhar`, e `estado.textContent = produtos.length ? "" : "Nenhum produto."`. No `catch`: a mensagem. No `finally`: `botao.disabled = false`.',
          "async function carregar() {\n  const botao = document.querySelector('#botao');\n  const estado = document.querySelector('#estado');\n  botao.disabled = true;\n  estado.textContent = 'Carregando…';\n  try {\n    const resposta = await fetch('/api/produtos');\n    if (!resposta.ok) throw new Error('o servidor respondeu ' + resposta.status);\n    const produtos = await resposta.json();\n    desenhar(produtos);\n    estado.textContent = produtos.length === 0 ? 'Nenhum produto.' : '';\n  } catch (erro) {\n    estado.textContent = 'Falhou: ' + erro.message + '. Tente de novo.';\n  } finally {\n    botao.disabled = false;\n  }\n}",
        ],
        solution: `<button id="botao">Carregar</button>
<p id="estado" role="status"></p>
<ul id="lista"></ul>

<script>
  window.__servidor = {
    '/api/produtos': [{ nome: 'Pão', preco: 8 }],
  };

  function desenhar(produtos) {
    const ul = document.querySelector('#lista');
    ul.replaceChildren();
    for (const p of produtos) {
      const li = document.createElement('li');
      li.textContent = p.nome;
      ul.append(li);
    }
  }

  async function carregar() {
    const botao = document.querySelector('#botao');
    const estado = document.querySelector('#estado');
    botao.disabled = true;
    estado.textContent = 'Carregando…';
    try {
      const resposta = await fetch('/api/produtos');
      if (!resposta.ok) throw new Error('o servidor respondeu ' + resposta.status);
      const produtos = await resposta.json();
      desenhar(produtos);
      estado.textContent = produtos.length === 0 ? 'Nenhum produto.' : '';
    } catch (erro) {
      estado.textContent = 'Falhou: ' + erro.message + '. Tente de novo.';
    } finally {
      botao.disabled = false;
    }
  }

  document.querySelector('#botao').addEventListener('click', carregar);
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-18-corrida',
        type: 'multiple-choice',
        prompt:
          'Numa busca que dispara a cada tecla, a pessoa digita "pa" e logo "pão". A resposta de "pa" chega por último. O que a tela mostra, e como evitar?',
        concepts: ['dom-fetch'],
        difficulty: 'intermediario',
        tags: ['dom', 'fetch'],
        options: [
          'Os resultados de "pão", porque foi a última busca disparada',
          'Os resultados de "pa", porque a última resposta a chegar sobrescreve — numere as buscas e ignore as que não são a mais recente',
          'Os dois, misturados',
          'Um erro de rede',
        ],
        correctIndex: 1,
        explanation:
          'A rede não garante ordem: a busca antiga pode demorar mais e chegar depois. Quem desenha por último ganha — e a tela mostra "pa" com "pão" no campo. O conserto é barato: um contador incrementado a cada busca, guardado no início, e comparado no fim; se outra busca saiu no meio, o resultado desta é descartado.',
        hints: ['Qual das duas respostas chegou por último?'],
      },
    },
    {
      kind: 'summary',
      markdown: `\`await fetch(url)\`, \`resposta.ok\` (porque \`fetch\` não lança em 404), \`await resposta.json()\`, \`desenhar\`. Três estados sempre visíveis — carregando, erro com "tente de novo", dados (inclusive vazios) — num lugar só, e o botão desabilitado enquanto espera, reabilitado no \`finally\`. E um contador para a resposta antiga não sobrescrever a nova.`,
    },
  ],
};

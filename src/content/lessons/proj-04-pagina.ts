import type { Lesson } from '../types';
import { API_DE_TAREFAS } from './proj-servidor';

/**
 * O esqueleto da página, comum aos exercícios: a lista, o estado, o
 * formulário e o seletor de quem está usando. O aluno escreve o script.
 */
const HTML = `<h1>Minhas tarefas</h1>
<label>Quem sou eu
  <select id="quem">
    <option value="token-da-ana">Ana</option>
    <option value="token-da-bia">Bia</option>
    <option value="token-falso">alguém sem sessão</option>
  </select>
</label>
<form id="nova">
  <input id="titulo" placeholder="Nova tarefa" autocomplete="off">
  <button type="submit">Adicionar</button>
</form>
<p id="estado">Carregando…</p>
<ul id="lista"></ul>`;

/** O cliente da API que a página usa a partir do segundo exercício. */
const CLIENTE = `function tokenAtual() {
  return document.querySelector('#quem').value;
}

// O cliente da API: um lugar só que põe o token, fala JSON e transforma
// resposta de erro em exceção com a mensagem da API.
async function pedir(caminho, opcoes = {}) {
  const resposta = await fetch(caminho, {
    method: opcoes.method || 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tokenAtual() },
    body: opcoes.body === undefined ? undefined : JSON.stringify(opcoes.body),
  });
  if (resposta.status === 204) return null;
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || 'erro ' + resposta.status);
  return dados;
}`;

/** Espera a lista ter N itens (a resposta do servidor chega depois). */
const ESPERAR = (condicao: string, ms = 3000) =>
  `for (let i = 0; i < ${Math.ceil(ms / 20)} && !(${condicao}); i++) await new Promise((r) => setTimeout(r, 20));`;

export const lessonProjPagina: Lesson = {
  id: 'lesson-proj-4',
  trackId: 'track-projeto',
  title: 'A Página sobre a API',
  language: 'node',
  objective:
    'Escrever a camada de cima: a página que busca as tarefas na API com o token, mostra carregando, erro e vazio, envia o formulário, marca e apaga — e recarrega da fonte da verdade depois de cada mudança.',
  concepts: ['proj-pagina'],
  status: 'published',
  estimatedMinutes: 45,
  blocks: [
    {
      kind: 'prose',
      markdown: `
A API está de pé, com o banco atrás. Falta a camada que a pessoa vê. Nesta aula o servidor do projeto roda **de verdade** por trás de cada exercício — o painel acima do editor mostra os arquivos dele —, e o \`fetch\` da sua página chega lá. É a aplicação inteira, num exercício.

## O que a página sabe

Nada, por conta própria. Tudo o que ela mostra veio da API; tudo o que a pessoa faz vira um pedido. Ela guarda só duas coisas: **quem está usando** (o token, que aqui vem de um seletor) e **o que acabou de receber**. Recarregou a página, perdeu as duas — e pede de novo. A fonte da verdade continua sendo o banco.

## O cliente da API

Toda chamada põe o token no cabeçalho, fala JSON e lê a resposta. Escrever isso em cada \`fetch\` é copiar cinco linhas seis vezes — e esquecer o token numa delas. A página ganha o seu próprio "repositório", do lado de cá:

~~~js
async function pedir(caminho, opcoes = {}) {
  const resposta = await fetch(caminho, {
    method: opcoes.method || 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tokenAtual() },
    body: opcoes.body === undefined ? undefined : JSON.stringify(opcoes.body),
  });
  if (resposta.status === 204) return null;
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || 'erro ' + resposta.status);
  return dados;
}
~~~

Três decisões nele: o \`204\` não tem corpo, então não se chama \`json()\`; uma resposta de erro vira **exceção** com a mensagem da API — quem chama trata num lugar só, com \`try/catch\`; e o token sai de uma função, para trocar de usuário sem recarregar.

## Os estados da tela

A trilha de React ensinou: uma tela que busca dados tem quatro estados, e cada um precisa aparecer.

- **Carregando**: entre o pedido e a resposta. Sem ele, a pessoa vê a tela vazia e acha que não tem nada.
- **Erro**: a API respondeu 401, 500, ou nem respondeu. A mensagem da API (\`dados.erro\`) é a que a pessoa lê — foi escrita para isso.
- **Vazio**: a lista veio, e não tem nada. É diferente de carregando e de erro: "Nenhuma tarefa ainda".
- **Lista**: o caso comum.

~~~js
async function carregar() {
  estado.textContent = 'Carregando…';
  try {
    const tarefas = await pedir('/tarefas');
    desenhar(tarefas);
    estado.textContent = tarefas.length === 0 ? 'Nenhuma tarefa ainda' : tarefas.length + ' tarefas';
  } catch (erro) {
    estado.textContent = 'Não foi possível carregar: ' + erro.message;
  }
}
~~~

## Desenhar a partir dos dados

A lista é **função dos dados**: \`desenhar(tarefas)\` esvazia o \`<ul>\` e cria um \`<li>\` por tarefa, com \`textContent\` — nunca \`innerHTML\` com texto que veio de fora, que é a porta do XSS que a trilha da web mostrou. Cada item leva o \`id\` da tarefa (\`li.dataset.id\`), a caixa de marcar e o botão de apagar.

## Depois de mudar, recarregue

Adicionou, marcou, apagou: o jeito mais simples e mais correto de atualizar a tela é **pedir a lista de novo**. A resposta do \`POST\` traz a tarefa criada, e daria para inseri-la na mão — mas aí a tela passa a ter duas fontes (o que a API mandou e o que você montou), e as duas divergem no primeiro detalhe. Uma tela pequena recarrega; uma grande otimiza depois, com medida.

O formulário segue o ritual da trilha da página: \`preventDefault\`, ler o campo, validar o vazio na tela (o servidor valida de novo — a página não é confiável), enviar, limpar o campo, recarregar. O erro do servidor (um \`400\`, por exemplo) aparece no mesmo lugar dos outros.

## Marcar e apagar

A caixa de marcar dispara \`change\`: \`PATCH /tarefas/:id\` com \`{ feita: caixa.checked }\`. O botão de apagar: \`DELETE /tarefas/:id\`. Os dois usam o \`id\` guardado no item — e depois, recarregar. Com delegação de eventos (um ouvinte no \`<ul>\`), os itens criados depois também funcionam.
`.trim(),
    },
    {
      kind: 'example',
      language: 'html',
      code: `<ul id="lista"></ul>
<p id="estado">Carregando…</p>
<script>
  const lista = document.querySelector('#lista');
  const estado = document.querySelector('#estado');

  function desenhar(tarefas) {
    lista.replaceChildren();
    for (const tarefa of tarefas) {
      const li = document.createElement('li');
      li.dataset.id = tarefa.id;
      const caixa = document.createElement('input');
      caixa.type = 'checkbox';
      caixa.checked = tarefa.feita;
      const texto = document.createElement('span');
      texto.textContent = tarefa.titulo;
      li.append(caixa, ' ', texto);
      lista.append(li);
    }
  }

  async function carregar() {
    estado.textContent = 'Carregando…';
    try {
      const tarefas = await pedir('/tarefas');
      desenhar(tarefas);
      estado.textContent = tarefas.length === 0 ? 'Nenhuma tarefa ainda' : tarefas.length + ' tarefas';
    } catch (erro) {
      estado.textContent = 'Não foi possível carregar: ' + erro.message;
    }
  }

  carregar();
</script>`,
      caption:
        'Buscar, desenhar a partir dos dados, e um estado por situação: carregando antes, a contagem ou o vazio depois, a mensagem da API quando falha. O cliente pedir() põe o token e traduz o erro.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-4-listar',
        type: 'code',
        runtime: 'iframe',
        servidor: API_DE_TAREFAS,
        prompt:
          'A página precisa **buscar** as tarefas de quem está usando. Escreva `carregar()`: `fetch("/tarefas")` com o cabeçalho `Authorization: Bearer <token>` (o token está no `#quem`), e para cada tarefa um `<li>` em `#lista` com o `titulo` e uma caixa de marcar (`input type="checkbox"`) marcada quando `feita`. No fim, `#estado` mostra `"3 tarefas"`.',
        concepts: ['proj-pagina', 'dom-fetch'],
        difficulty: 'intermediario',
        tags: ['projeto', 'pagina', 'fetch'],
        initialCode: `${HTML}
<script>
  const lista = document.querySelector('#lista');
  const estado = document.querySelector('#estado');

  async function carregar() {
    // fetch('/tarefas') com o token, e um <li> por tarefa.
  }

  carregar();
</script>`,
        tests: [
          {
            description: 'A lista mostra as 3 tarefas da Ana, com os títulos',
            assertion: `${ESPERAR("document.querySelectorAll('#lista li').length >= 3")}
const itens = [...document.querySelectorAll('#lista li')].map((li) => li.textContent.trim());
if (itens.length !== 3) throw new Error('esperava 3 itens na lista, veio ' + itens.length + ' — o fetch precisa do cabeçalho Authorization, e a resposta é JSON');
if (!itens[0].includes('Estudar Node') || !itens[2].includes('Revisar SQL')) throw new Error('esperava os títulos das tarefas nos itens, veio ' + JSON.stringify(itens));`,
          },
          {
            description: 'A tarefa feita vem com a caixa marcada, e as outras não',
            assertion: `const caixas = [...document.querySelectorAll('#lista li input[type="checkbox"]')];
if (caixas.length !== 3) throw new Error('cada item precisa de uma caixa de marcar, veio ' + caixas.length);
if (caixas[2].checked !== true || caixas[0].checked !== false) throw new Error('a terceira tarefa (Revisar SQL) está feita e as outras não: as caixas deveriam refletir isso');`,
          },
          {
            description: 'O estado diz "3 tarefas"',
            assertion: `${ESPERAR("document.querySelector('#estado').textContent.includes('3 tarefas')", 1000)}
const texto = document.querySelector('#estado').textContent;
if (!texto.includes('3 tarefas')) throw new Error('#estado deveria dizer "3 tarefas", veio ' + JSON.stringify(texto));`,
          },
        ],
        solution: `${HTML}
<script>
  const lista = document.querySelector('#lista');
  const estado = document.querySelector('#estado');

  async function carregar() {
    const token = document.querySelector('#quem').value;
    const resposta = await fetch('/tarefas', { headers: { Authorization: 'Bearer ' + token } });
    const tarefas = await resposta.json();
    lista.replaceChildren();
    for (const tarefa of tarefas) {
      const li = document.createElement('li');
      const caixa = document.createElement('input');
      caixa.type = 'checkbox';
      caixa.checked = tarefa.feita;
      const texto = document.createElement('span');
      texto.textContent = tarefa.titulo;
      li.append(caixa, ' ', texto);
      lista.append(li);
    }
    estado.textContent = tarefas.length + ' tarefas';
  }

  carregar();
</script>`,
        hints: [
          'O token: `document.querySelector("#quem").value`. Ele vai no cabeçalho: `fetch("/tarefas", { headers: { Authorization: "Bearer " + token } })`.',
          'A resposta é JSON: `const tarefas = await resposta.json()`. Depois, um `li` por tarefa com `createElement`, `textContent` e `append`.',
          'A caixa: `caixa.type = "checkbox"; caixa.checked = tarefa.feita`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-4-estados',
        type: 'code',
        runtime: 'iframe',
        servidor: API_DE_TAREFAS,
        prompt:
          'O cliente `pedir()` já está pronto. Faça `carregar()` mostrar os estados: `"Carregando…"` antes do pedido; depois, `"Nenhuma tarefa ainda"` se a lista vier vazia, `"N tarefas"` se não; e, se `pedir` lançar, `"Não foi possível carregar: "` mais a mensagem. Trocar quem está usando no `#quem` recarrega.',
        concepts: ['proj-pagina', 'dom-fetch'],
        difficulty: 'intermediario',
        tags: ['projeto', 'pagina', 'estados'],
        initialCode: `${HTML}
<script>
  const lista = document.querySelector('#lista');
  const estado = document.querySelector('#estado');

  ${CLIENTE.replace(/\n/g, '\n  ')}

  function desenhar(tarefas) {
    lista.replaceChildren();
    for (const tarefa of tarefas) {
      const li = document.createElement('li');
      li.dataset.id = tarefa.id;
      li.textContent = tarefa.titulo;
      lista.append(li);
    }
  }

  async function carregar() {
    const tarefas = await pedir('/tarefas');
    desenhar(tarefas);
  }

  carregar();
</script>`,
        tests: [
          {
            description: 'Antes da resposta, o estado é "Carregando…"; depois, "3 tarefas"',
            assertion: `const antes = document.querySelector('#estado').textContent;
if (!antes.includes('Carregando')) throw new Error('enquanto o pedido não volta, #estado deveria dizer "Carregando…", veio ' + JSON.stringify(antes));
${ESPERAR("document.querySelector('#estado').textContent.includes('3 tarefas')")}
const depois = document.querySelector('#estado').textContent;
if (!depois.includes('3 tarefas')) throw new Error('com a lista carregada, #estado deveria dizer "3 tarefas", veio ' + JSON.stringify(depois));`,
          },
          {
            description: 'Trocar para alguém sem sessão mostra o erro da API: "Não autenticado"',
            assertion: `const quem = document.querySelector('#quem');
quem.value = 'token-falso';
quem.dispatchEvent(new Event('change', { bubbles: true }));
${ESPERAR("document.querySelector('#estado').textContent.includes('Não autenticado')")}
const texto = document.querySelector('#estado').textContent;
if (!texto.includes('Não foi possível carregar') || !texto.includes('Não autenticado')) throw new Error('com o token falso, #estado deveria dizer "Não foi possível carregar: Não autenticado", veio ' + JSON.stringify(texto) + ' — o change do #quem precisa chamar carregar(), e o catch mostra erro.message');`,
          },
          {
            description: 'A Bia tem 1 tarefa; depois de apagá-la pela API, a página diz "Nenhuma tarefa ainda"',
            assertion: `const quem = document.querySelector('#quem');
quem.value = 'token-da-bia';
quem.dispatchEvent(new Event('change', { bubbles: true }));
${ESPERAR("document.querySelector('#estado').textContent.includes('1 tarefa')")}
if (!document.querySelector('#estado').textContent.includes('1 tarefa')) throw new Error('a Bia tem 1 tarefa: #estado deveria dizer "1 tarefas" ou "1 tarefa", veio ' + JSON.stringify(document.querySelector('#estado').textContent));
await fetch('/tarefas/4', { method: 'DELETE', headers: { Authorization: 'Bearer token-da-bia' } });
quem.dispatchEvent(new Event('change', { bubbles: true }));
${ESPERAR("document.querySelector('#estado').textContent.includes('Nenhuma tarefa')")}
if (!document.querySelector('#estado').textContent.includes('Nenhuma tarefa ainda')) throw new Error('sem tarefas, #estado deveria dizer "Nenhuma tarefa ainda", veio ' + JSON.stringify(document.querySelector('#estado').textContent));`,
          },
        ],
        solution: `${HTML}
<script>
  const lista = document.querySelector('#lista');
  const estado = document.querySelector('#estado');

  ${CLIENTE.replace(/\n/g, '\n  ')}

  function desenhar(tarefas) {
    lista.replaceChildren();
    for (const tarefa of tarefas) {
      const li = document.createElement('li');
      li.dataset.id = tarefa.id;
      li.textContent = tarefa.titulo;
      lista.append(li);
    }
  }

  async function carregar() {
    estado.textContent = 'Carregando…';
    try {
      const tarefas = await pedir('/tarefas');
      desenhar(tarefas);
      estado.textContent = tarefas.length === 0 ? 'Nenhuma tarefa ainda' : tarefas.length + ' tarefas';
    } catch (erro) {
      desenhar([]);
      estado.textContent = 'Não foi possível carregar: ' + erro.message;
    }
  }

  document.querySelector('#quem').addEventListener('change', carregar);
  carregar();
</script>`,
        hints: [
          'A primeira linha de `carregar` escreve "Carregando…" no estado; o `try/catch` em volta do `pedir` decide o resto.',
          'No `catch`, `erro.message` é a mensagem da API — o `pedir` a colocou lá.',
          'Vazio é `tarefas.length === 0`. E `document.querySelector("#quem").addEventListener("change", carregar)` recarrega ao trocar de pessoa.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-4-criar',
        type: 'code',
        runtime: 'iframe',
        servidor: API_DE_TAREFAS,
        prompt:
          'O formulário `#nova` cria tarefas. No `submit`: impeça o recarregamento, leia `#titulo`, ignore o vazio, envie `POST /tarefas` com `{ titulo }` pelo `pedir`, limpe o campo e **recarregue a lista**. Se o servidor recusar, a mensagem dele aparece em `#estado`.',
        concepts: ['proj-pagina', 'dom-formularios'],
        difficulty: 'intermediario',
        tags: ['projeto', 'pagina', 'formulario', 'post'],
        initialCode: `${HTML}
<script>
  const lista = document.querySelector('#lista');
  const estado = document.querySelector('#estado');
  const formulario = document.querySelector('#nova');
  const campo = document.querySelector('#titulo');

  ${CLIENTE.replace(/\n/g, '\n  ')}

  function desenhar(tarefas) {
    lista.replaceChildren();
    for (const tarefa of tarefas) {
      const li = document.createElement('li');
      li.dataset.id = tarefa.id;
      li.textContent = tarefa.titulo;
      lista.append(li);
    }
  }

  async function carregar() {
    estado.textContent = 'Carregando…';
    try {
      const tarefas = await pedir('/tarefas');
      desenhar(tarefas);
      estado.textContent = tarefas.length === 0 ? 'Nenhuma tarefa ainda' : tarefas.length + ' tarefas';
    } catch (erro) {
      estado.textContent = 'Não foi possível carregar: ' + erro.message;
    }
  }

  // formulario.addEventListener('submit', …)

  carregar();
</script>`,
        tests: [
          {
            description: 'Enviar o formulário com "Publicar" cria a tarefa e a lista passa a ter 4',
            assertion: `${ESPERAR("document.querySelectorAll('#lista li').length >= 3")}
const campo = document.querySelector('#titulo');
campo.value = 'Publicar';
document.querySelector('#nova').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
${ESPERAR("document.querySelectorAll('#lista li').length >= 4")}
const itens = [...document.querySelectorAll('#lista li')].map((li) => li.textContent.trim());
if (itens.length !== 4 || !itens[3].includes('Publicar')) throw new Error('depois de enviar, a lista deveria ter 4 itens com "Publicar" no fim, veio ' + JSON.stringify(itens) + ' — envie o POST e recarregue a lista');
if (campo.value !== '') throw new Error('o campo deveria ficar vazio depois de enviar, veio ' + JSON.stringify(campo.value));`,
          },
          {
            description: 'A tarefa ficou no servidor: GET /tarefas devolve 4',
            assertion: `const r = await fetch('/tarefas', { headers: { Authorization: 'Bearer token-da-ana' } });
const tarefas = await r.json();
if (tarefas.length !== 4 || tarefas[3].titulo !== 'Publicar') throw new Error('o servidor deveria ter 4 tarefas da Ana, com "Publicar" no fim, veio ' + JSON.stringify(tarefas.map((t) => t.titulo)));`,
          },
          {
            description: 'Enviar vazio não cria nada, e o servidor recusando aparece no estado',
            assertion: `const campo = document.querySelector('#titulo');
campo.value = '   ';
document.querySelector('#nova').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
await new Promise((r) => setTimeout(r, 300));
const r = await fetch('/tarefas', { headers: { Authorization: 'Bearer token-da-ana' } });
if ((await r.json()).length !== 4) throw new Error('um título só de espaços não deveria criar tarefa');`,
          },
        ],
        solution: `${HTML}
<script>
  const lista = document.querySelector('#lista');
  const estado = document.querySelector('#estado');
  const formulario = document.querySelector('#nova');
  const campo = document.querySelector('#titulo');

  ${CLIENTE.replace(/\n/g, '\n  ')}

  function desenhar(tarefas) {
    lista.replaceChildren();
    for (const tarefa of tarefas) {
      const li = document.createElement('li');
      li.dataset.id = tarefa.id;
      li.textContent = tarefa.titulo;
      lista.append(li);
    }
  }

  async function carregar() {
    estado.textContent = 'Carregando…';
    try {
      const tarefas = await pedir('/tarefas');
      desenhar(tarefas);
      estado.textContent = tarefas.length === 0 ? 'Nenhuma tarefa ainda' : tarefas.length + ' tarefas';
    } catch (erro) {
      estado.textContent = 'Não foi possível carregar: ' + erro.message;
    }
  }

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const titulo = campo.value.trim();
    if (titulo === '') return;
    try {
      await pedir('/tarefas', { method: 'POST', body: { titulo } });
      campo.value = '';
      await carregar();
    } catch (erro) {
      estado.textContent = 'Não foi possível criar: ' + erro.message;
    }
  });

  carregar();
</script>`,
        hints: [
          'O ritual do formulário: `evento.preventDefault()`, ler `campo.value.trim()`, sair se vazio.',
          '`await pedir("/tarefas", { method: "POST", body: { titulo } })` — o `pedir` faz o JSON e põe o token.',
          'Depois: `campo.value = ""` e `await carregar()`. O `try/catch` põe `erro.message` no estado.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-4-marcar-apagar',
        type: 'code',
        runtime: 'iframe',
        servidor: API_DE_TAREFAS,
        prompt:
          'Cada item já tem a caixa de marcar e o botão **Apagar**, e o `id` em `li.dataset.id`. Com **um** ouvinte na lista (delegação): `change` numa caixa faz `PATCH /tarefas/:id` com `{ feita: caixa.checked }`; `click` num botão faz `DELETE /tarefas/:id`. Depois de cada um, recarregue.',
        concepts: ['proj-pagina', 'dom-delegacao'],
        difficulty: 'avancado',
        tags: ['projeto', 'pagina', 'patch', 'delete', 'delegacao'],
        initialCode: `${HTML}
<script>
  const lista = document.querySelector('#lista');
  const estado = document.querySelector('#estado');

  ${CLIENTE.replace(/\n/g, '\n  ')}

  function desenhar(tarefas) {
    lista.replaceChildren();
    for (const tarefa of tarefas) {
      const li = document.createElement('li');
      li.dataset.id = tarefa.id;
      const caixa = document.createElement('input');
      caixa.type = 'checkbox';
      caixa.checked = tarefa.feita;
      const texto = document.createElement('span');
      texto.textContent = tarefa.titulo;
      const apagar = document.createElement('button');
      apagar.type = 'button';
      apagar.textContent = 'Apagar';
      li.append(caixa, ' ', texto, ' ', apagar);
      lista.append(li);
    }
  }

  async function carregar() {
    estado.textContent = 'Carregando…';
    try {
      const tarefas = await pedir('/tarefas');
      desenhar(tarefas);
      estado.textContent = tarefas.length === 0 ? 'Nenhuma tarefa ainda' : tarefas.length + ' tarefas';
    } catch (erro) {
      estado.textContent = 'Não foi possível carregar: ' + erro.message;
    }
  }

  // lista.addEventListener('change', …) e lista.addEventListener('click', …)

  carregar();
</script>`,
        tests: [
          {
            description: 'Marcar a caixa da primeira tarefa grava feita: true no servidor',
            assertion: `${ESPERAR("document.querySelectorAll('#lista li').length >= 3")}
const caixa = document.querySelector('#lista li input[type="checkbox"]');
caixa.checked = true;
caixa.dispatchEvent(new Event('change', { bubbles: true }));
${ESPERAR("(await (await fetch('/tarefas', { headers: { Authorization: 'Bearer token-da-ana' } })).json())[0].feita === true")}
const r = await fetch('/tarefas', { headers: { Authorization: 'Bearer token-da-ana' } });
const tarefas = await r.json();
if (tarefas[0].feita !== true) throw new Error('depois de marcar, a tarefa 1 deveria estar feita no servidor — o change precisa fazer PATCH /tarefas/1 com { feita: true }');`,
          },
          {
            description: 'Apagar a segunda tarefa a tira do servidor e da lista',
            assertion: `const botao = document.querySelectorAll('#lista li')[1].querySelector('button');
botao.click();
${ESPERAR("document.querySelectorAll('#lista li').length === 2")}
const itens = [...document.querySelectorAll('#lista li')].map((li) => li.dataset.id);
if (JSON.stringify(itens) !== '["1","3"]') throw new Error('depois de apagar a tarefa 2, a lista deveria ter os ids 1 e 3, veio ' + JSON.stringify(itens) + ' — o click precisa fazer DELETE /tarefas/2 e recarregar');
const r = await fetch('/tarefas', { headers: { Authorization: 'Bearer token-da-ana' } });
if ((await r.json()).length !== 2) throw new Error('o servidor deveria ter 2 tarefas da Ana depois do DELETE');`,
          },
          {
            description: 'Desmarcar a caixa volta feita para false — o mesmo ouvinte serve para os dois sentidos',
            assertion: `const caixa = document.querySelector('#lista li input[type="checkbox"]');
caixa.checked = false;
caixa.dispatchEvent(new Event('change', { bubbles: true }));
${ESPERAR("(await (await fetch('/tarefas', { headers: { Authorization: 'Bearer token-da-ana' } })).json())[0].feita === false")}
const r = await fetch('/tarefas', { headers: { Authorization: 'Bearer token-da-ana' } });
if ((await r.json())[0].feita !== false) throw new Error('desmarcar deveria gravar feita: false — mande caixa.checked, não true fixo');`,
          },
        ],
        solution: `${HTML}
<script>
  const lista = document.querySelector('#lista');
  const estado = document.querySelector('#estado');

  ${CLIENTE.replace(/\n/g, '\n  ')}

  function desenhar(tarefas) {
    lista.replaceChildren();
    for (const tarefa of tarefas) {
      const li = document.createElement('li');
      li.dataset.id = tarefa.id;
      const caixa = document.createElement('input');
      caixa.type = 'checkbox';
      caixa.checked = tarefa.feita;
      const texto = document.createElement('span');
      texto.textContent = tarefa.titulo;
      const apagar = document.createElement('button');
      apagar.type = 'button';
      apagar.textContent = 'Apagar';
      li.append(caixa, ' ', texto, ' ', apagar);
      lista.append(li);
    }
  }

  async function carregar() {
    estado.textContent = 'Carregando…';
    try {
      const tarefas = await pedir('/tarefas');
      desenhar(tarefas);
      estado.textContent = tarefas.length === 0 ? 'Nenhuma tarefa ainda' : tarefas.length + ' tarefas';
    } catch (erro) {
      estado.textContent = 'Não foi possível carregar: ' + erro.message;
    }
  }

  lista.addEventListener('change', async (evento) => {
    const caixa = evento.target;
    if (caixa.type !== 'checkbox') return;
    const id = caixa.closest('li').dataset.id;
    try {
      await pedir('/tarefas/' + id, { method: 'PATCH', body: { feita: caixa.checked } });
      await carregar();
    } catch (erro) {
      estado.textContent = 'Não foi possível alterar: ' + erro.message;
    }
  });

  lista.addEventListener('click', async (evento) => {
    const botao = evento.target.closest('button');
    if (!botao) return;
    const id = botao.closest('li').dataset.id;
    try {
      await pedir('/tarefas/' + id, { method: 'DELETE' });
      await carregar();
    } catch (erro) {
      estado.textContent = 'Não foi possível apagar: ' + erro.message;
    }
  });

  carregar();
</script>`,
        hints: [
          'Delegação: o ouvinte fica no `lista`, e `evento.target` diz em qual caixa ou botão foi. O `id` vem de `evento.target.closest("li").dataset.id`.',
          'PATCH: `pedir("/tarefas/" + id, { method: "PATCH", body: { feita: caixa.checked } })`. DELETE: `pedir("/tarefas/" + id, { method: "DELETE" })` — devolve `null`, e tudo bem.',
          'Depois de cada um, `await carregar()`: a lista volta da fonte da verdade.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-4-fonte',
        type: 'multiple-choice',
        prompt:
          'Depois de um `POST /tarefas` que deu certo, a página tem duas opções: inserir na lista a tarefa que a resposta trouxe, ou pedir `GET /tarefas` de novo. Por que a aula recomenda recarregar?',
        concepts: ['proj-pagina'],
        difficulty: 'iniciante',
        tags: ['projeto', 'pagina', 'estado'],
        options: [
          'Porque a lista passa a ter uma fonte só, o servidor — inserir na mão cria uma segunda versão dos dados, que diverge no primeiro detalhe (ordem, contagem, o que outra aba mudou)',
          'Porque a resposta do POST não traz a tarefa criada',
          'Porque recarregar é sempre mais rápido do que inserir',
          'Porque o navegador não permite alterar a lista sem recarregar',
        ],
        correctIndex: 0,
        explanation:
          'A resposta do POST traz a tarefa, e inserir na mão é mais rápido — mas a tela passa a ter dois donos: o que o servidor mandou e o que você montou. A contagem, a ordem, uma tarefa criada em outra aba: cada um é um jeito de as duas versões divergirem. Recarregar custa um pedido e mantém uma verdade. Telas grandes otimizam depois, medindo; a regra de partida é recarregar.',
        hints: ['Quantas versões da lista existem em cada opção — e o que acontece quando elas discordam?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-4-submit',
        type: 'order-steps',
        prompt: 'Coloque na ordem o que o ouvinte de `submit` do formulário faz.',
        concepts: ['proj-pagina', 'dom-formularios'],
        difficulty: 'iniciante',
        tags: ['projeto', 'pagina', 'formulario'],
        steps: [
          { id: 'prevent', text: '`evento.preventDefault()` — a página não recarrega', ordem: 1 },
          { id: 'ler', text: 'Ler `campo.value.trim()` e sair se estiver vazio', ordem: 2 },
          { id: 'post', text: '`await pedir("/tarefas", { method: "POST", body: { titulo } })` — com o token e o JSON por conta do cliente', ordem: 3 },
          { id: 'limpar', text: 'Limpar o campo', ordem: 4 },
          { id: 'recarregar', text: '`await carregar()` — a lista volta da fonte da verdade', ordem: 5 },
        ],
        explanation:
          'Impedir o recarregamento vem antes de tudo, senão o resto nem roda. Validar o vazio na tela evita um pedido inútil — o servidor valida de novo, porque a página não é confiável. Só depois de o servidor confirmar é que o campo se limpa e a lista se recarrega; se o `pedir` lançar, o `catch` mostra a mensagem e o campo fica como estava.',
        hints: ['Sem o primeiro passo, a página recarrega antes de qualquer outra linha rodar.', 'Limpar o campo antes de o servidor confirmar apagaria o que a pessoa digitou se o pedido falhasse.'],
      },
    },
    {
      kind: 'summary',
      markdown: `
A página **não sabe nada**: mostra o que a API mandou e transforma cada gesto num pedido. Guarda só quem está usando e o que acabou de receber; a verdade mora no banco.

Um **cliente da API** num lugar só — token, JSON, erro virando exceção com a mensagem da API. **Quatro estados**: carregando, erro, vazio, lista. A lista é **função dos dados**, com \`textContent\`, nunca \`innerHTML\` com texto de fora. **Depois de mudar, recarregue**: uma fonte só.

O formulário: \`preventDefault\`, ler, validar o vazio, enviar, limpar, recarregar. Marcar e apagar: delegação no \`<ul>\`, o \`id\` no item, \`PATCH\` e \`DELETE\`, recarregar.

A aplicação está de pé: página, API e banco, conversando. Na última aula, o que falta para entregar: os pedidos de ponta a ponta, o README e a publicação.
`.trim(),
    },
  ],
};

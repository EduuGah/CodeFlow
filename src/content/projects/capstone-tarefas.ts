import { API_DE_TAREFAS } from '../lessons/proj-servidor';
import type { Project } from '../types';

/** Espera uma condição ficar verdadeira — a resposta do servidor chega depois. */
const ESPERAR = (condicao: string, ms = 3000) =>
  `for (let i = 0; i < ${Math.ceil(ms / 20)} && !(${condicao}); i++) await new Promise((r) => setTimeout(r, 20));`;

const HTML = `<h1>Minhas tarefas</h1>
<label>Quem sou eu
  <select id="quem">
    <option value="token-da-ana">Ana</option>
    <option value="token-da-bia">Bia</option>
  </select>
</label>
<form id="nova">
  <input id="titulo" placeholder="Nova tarefa" autocomplete="off">
  <button type="submit">Adicionar</button>
</form>
<label>Mostrar
  <select id="filtro">
    <option value="todas">Todas</option>
    <option value="pendentes">Pendentes</option>
    <option value="feitas">Feitas</option>
  </select>
</label>
<input id="busca" placeholder="Buscar por título" autocomplete="off">
<p id="estado">Carregando…</p>
<ul id="lista"></ul>`;

/** O cliente da API — o mesmo das aulas do projeto final, dado pronto. */
const CLIENTE = `function tokenAtual() {
  return document.querySelector('#quem').value;
}

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

export const projetoCapstoneTarefas: Project = {
  id: 'proj-capstone-tarefas',
  title: 'Capstone: Lista de Tarefas com Conta',
  description:
    'Página, API e banco juntos: cada pessoa vê só as suas tarefas, filtra por feitas e pendentes, e busca por título.',
  difficulty: 'avancado',
  language: 'html',
  concepts: ['proj-pagina', 'dom-fetch', 'dom-delegacao'],
  status: 'published',
  runtime: 'iframe',
  servidor: API_DE_TAREFAS,
  initialCode: `${HTML}
<script>
  ${CLIENTE.replace(/\n/g, '\n  ')}

  let tarefas = [];

  function tarefasFiltradas() {
    // Cruze o valor de #filtro (todas/pendentes/feitas) com o de #busca
    // (substring do título, sem diferenciar maiúsculas) sobre o array
    // "tarefas" já carregado — sem fazer outro fetch.
    return tarefas;
  }

  function desenhar() {
    // Um <li> por tarefa de tarefasFiltradas(): checkbox marcada quando
    // feita, o título, e um botão "Apagar". Guarde o id em li.dataset.id.
  }

  async function carregar() {
    // GET /tarefas, guarda em "tarefas", desenha, e atualiza #estado
    // ("Carregando…", a contagem, "Nenhuma tarefa ainda", ou o erro).
  }

  // Trocar de usuário (#quem) recarrega. Mudar #filtro ou digitar em
  // #busca redesenha sem recarregar — os dados já estão em "tarefas".

  // O formulário #nova cria (POST) e recarrega.

  // Delegação em #lista: o change de uma caixa faz PATCH { feita }; o
  // click num botão "Apagar" faz DELETE. Os dois recarregam depois.

  carregar();
</script>`,
  checkpoints: [
    {
      id: 'cp-capstone-tarefas-listar',
      title: 'Carregar e listar',
      description: 'Busca as tarefas de quem está em #quem e desenha um <li> por tarefa, com a contagem em #estado.',
      tests: [
        {
          description: 'A lista mostra as 3 tarefas da Ana, na ordem, com a contagem em #estado',
          assertion: `${ESPERAR("document.querySelectorAll('#lista li').length >= 3")}
const itens = [...document.querySelectorAll('#lista li')].map((li) => li.textContent.trim());
if (itens.length !== 3) throw new Error('esperava 3 itens na lista, veio ' + itens.length + ' — confira o fetch com o token e a renderização');
if (!itens[0].includes('Estudar Node') || !itens[2].includes('Revisar SQL')) throw new Error('esperava os títulos das tarefas da Ana nos itens, veio ' + JSON.stringify(itens));
const estado = document.querySelector('#estado').textContent;
if (!estado.includes('3')) throw new Error('#estado deveria mostrar a contagem "3 tarefas", veio ' + JSON.stringify(estado));`,
        },
        {
          description: 'A tarefa feita vem com a caixa marcada, e as outras não',
          assertion: `const caixas = [...document.querySelectorAll('#lista li input[type="checkbox"]')];
if (caixas.length !== 3) throw new Error('cada item precisa de uma caixa de marcar, veio ' + caixas.length);
if (caixas[2].checked !== true || caixas[0].checked !== false) throw new Error('a terceira tarefa (Revisar SQL) está feita e as outras não: as caixas deveriam refletir isso');`,
        },
      ],
    },
    {
      id: 'cp-capstone-tarefas-adicionar',
      title: 'Adicionar tarefa',
      description: 'Enviar o formulário cria a tarefa no servidor e a lista é recarregada.',
      tests: [
        {
          description: 'Enviar "Publicar" cria a tarefa e a lista passa a ter 4, com o campo limpo',
          assertion: `${ESPERAR("document.querySelectorAll('#lista li').length >= 3")}
const campo = document.querySelector('#titulo');
campo.value = 'Publicar';
document.querySelector('#nova').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
${ESPERAR("document.querySelectorAll('#lista li').length >= 4")}
const itens = [...document.querySelectorAll('#lista li')].map((li) => li.textContent.trim());
if (itens.length !== 4 || !itens[3].includes('Publicar')) throw new Error('depois de enviar, a lista deveria ter 4 itens com "Publicar" no fim, veio ' + JSON.stringify(itens));
if (campo.value !== '') throw new Error('o campo deveria ficar vazio depois de enviar, veio ' + JSON.stringify(campo.value));`,
        },
        {
          description: 'A tarefa ficou no servidor: GET /tarefas devolve 4',
          assertion: `const r = await fetch('/tarefas', { headers: { Authorization: 'Bearer token-da-ana' } });
const tarefas = await r.json();
if (tarefas.length !== 4 || tarefas[3].titulo !== 'Publicar') throw new Error('o servidor deveria ter 4 tarefas da Ana, com "Publicar" no fim, veio ' + JSON.stringify(tarefas.map((t) => t.titulo)));`,
        },
        {
          description: 'Enviar só espaços não cria nada',
          assertion: `const campo = document.querySelector('#titulo');
campo.value = '   ';
document.querySelector('#nova').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
await new Promise((r) => setTimeout(r, 300));
const r = await fetch('/tarefas', { headers: { Authorization: 'Bearer token-da-ana' } });
// Os testes deste critério compartilham a página: a esta altura já existem
// as 3 originais mais "Publicar", do teste anterior.
if ((await r.json()).length !== 4) throw new Error('um título só de espaços não deveria criar tarefa');`,
          hidden: true,
        },
      ],
    },
    {
      id: 'cp-capstone-tarefas-marcar-apagar',
      title: 'Marcar e apagar',
      description: 'Marcar a caixa grava "feita" no servidor; o botão Apagar remove a tarefa — os dois por delegação, na lista.',
      tests: [
        {
          description: 'Marcar a caixa da primeira tarefa grava feita: true no servidor',
          assertion: `${ESPERAR("document.querySelectorAll('#lista li').length >= 3")}
const caixa = document.querySelector('#lista li input[type="checkbox"]');
caixa.checked = true;
caixa.dispatchEvent(new Event('change', { bubbles: true }));
${ESPERAR("(await (await fetch('/tarefas', { headers: { Authorization: 'Bearer token-da-ana' } })).json())[0].feita === true")}
const tarefas = await (await fetch('/tarefas', { headers: { Authorization: 'Bearer token-da-ana' } })).json();
if (tarefas[0].feita !== true) throw new Error('depois de marcar, a tarefa 1 deveria estar feita no servidor — o change precisa fazer PATCH /tarefas/1 com { feita: true }');`,
        },
        {
          description: 'Apagar a segunda tarefa a tira do servidor e da lista',
          assertion: `const botao = document.querySelectorAll('#lista li')[1].querySelector('button');
botao.click();
${ESPERAR("document.querySelectorAll('#lista li').length === 2")}
const itens = [...document.querySelectorAll('#lista li')].map((li) => li.dataset.id);
if (JSON.stringify(itens) !== '["1","3"]') throw new Error('depois de apagar a tarefa 2, a lista deveria ter os ids 1 e 3, veio ' + JSON.stringify(itens));
const r = await fetch('/tarefas', { headers: { Authorization: 'Bearer token-da-ana' } });
if ((await r.json()).length !== 2) throw new Error('o servidor deveria ter 2 tarefas da Ana depois do DELETE');`,
        },
      ],
    },
    {
      id: 'cp-capstone-tarefas-filtrar-buscar',
      title: 'Filtrar e buscar',
      description: 'O filtro (todas/pendentes/feitas) e a busca por título redesenham a lista sem outro fetch, e combinam entre si.',
      tests: [
        {
          description: 'Filtrar por "Feitas" mostra só a tarefa concluída, sem novo fetch',
          assertion: `${ESPERAR("document.querySelectorAll('#lista li').length >= 3")}
const filtro = document.querySelector('#filtro');
filtro.value = 'feitas';
filtro.dispatchEvent(new Event('change', { bubbles: true }));
await new Promise((r) => setTimeout(r, 50));
const itens = [...document.querySelectorAll('#lista li')].map((li) => li.textContent.trim());
if (itens.length !== 1 || !itens[0].includes('Revisar SQL')) throw new Error('filtrando por "Feitas" deveria sobrar só "Revisar SQL", veio ' + JSON.stringify(itens));`,
        },
        {
          description: 'Buscar "node" (minúsculo) encontra "Estudar Node", ignorando maiúsculas',
          assertion: `const filtro = document.querySelector('#filtro');
filtro.value = 'todas';
filtro.dispatchEvent(new Event('change', { bubbles: true }));
const busca = document.querySelector('#busca');
busca.value = 'node';
busca.dispatchEvent(new Event('input', { bubbles: true }));
await new Promise((r) => setTimeout(r, 50));
const itens = [...document.querySelectorAll('#lista li')].map((li) => li.textContent.trim());
if (itens.length !== 1 || !itens[0].includes('Estudar Node')) throw new Error('buscando "node" deveria sobrar só "Estudar Node", veio ' + JSON.stringify(itens));`,
        },
        {
          description: 'Filtro e busca combinados: "pendentes" + "sql" não encontra nada (Revisar SQL já está feita)',
          assertion: `const filtro = document.querySelector('#filtro');
filtro.value = 'pendentes';
filtro.dispatchEvent(new Event('change', { bubbles: true }));
const busca = document.querySelector('#busca');
busca.value = 'sql';
busca.dispatchEvent(new Event('input', { bubbles: true }));
await new Promise((r) => setTimeout(r, 50));
const itens = document.querySelectorAll('#lista li');
if (itens.length !== 0) throw new Error('"pendentes" + "sql" não deveria mostrar nada, veio ' + itens.length + ' item(ns) — o filtro e a busca precisam se combinar, não substituir um ao outro');`,
          hidden: true,
        },
      ],
    },
  ],
  referenceSolution: `${HTML}
<script>
  ${CLIENTE.replace(/\n/g, '\n  ')}

  let tarefas = [];

  function tarefasFiltradas() {
    const filtro = document.querySelector('#filtro').value;
    const busca = document.querySelector('#busca').value.trim().toLowerCase();
    return tarefas.filter((tarefa) => {
      if (filtro === 'pendentes' && tarefa.feita) return false;
      if (filtro === 'feitas' && !tarefa.feita) return false;
      if (busca && !tarefa.titulo.toLowerCase().includes(busca)) return false;
      return true;
    });
  }

  function desenhar() {
    const lista = document.querySelector('#lista');
    lista.replaceChildren();
    for (const tarefa of tarefasFiltradas()) {
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
    const estado = document.querySelector('#estado');
    estado.textContent = 'Carregando…';
    try {
      tarefas = await pedir('/tarefas');
      desenhar();
      estado.textContent = tarefas.length === 0 ? 'Nenhuma tarefa ainda' : tarefas.length + ' tarefas';
    } catch (erro) {
      estado.textContent = 'Não foi possível carregar: ' + erro.message;
    }
  }

  document.querySelector('#quem').addEventListener('change', carregar);
  document.querySelector('#filtro').addEventListener('change', desenhar);
  document.querySelector('#busca').addEventListener('input', desenhar);

  document.querySelector('#nova').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const campo = document.querySelector('#titulo');
    const titulo = campo.value.trim();
    if (titulo === '') return;
    try {
      await pedir('/tarefas', { method: 'POST', body: { titulo } });
      campo.value = '';
      await carregar();
    } catch (erro) {
      document.querySelector('#estado').textContent = 'Não foi possível criar: ' + erro.message;
    }
  });

  document.querySelector('#lista').addEventListener('change', async (evento) => {
    if (evento.target.type !== 'checkbox') return;
    const id = evento.target.closest('li').dataset.id;
    await pedir('/tarefas/' + id, { method: 'PATCH', body: { feita: evento.target.checked } });
    await carregar();
  });

  document.querySelector('#lista').addEventListener('click', async (evento) => {
    if (evento.target.tagName !== 'BUTTON') return;
    const id = evento.target.closest('li').dataset.id;
    await pedir('/tarefas/' + id, { method: 'DELETE' });
    await carregar();
  });

  carregar();
</script>`,
  brief: `
O capstone junta as três camadas que a plataforma ensinou separadas: a página (Fase 2), a API (Fase 4) e o banco (Fase 3) — agora como um projeto aberto, sem passo a passo. A API e o banco já estão prontos e de pé atrás da página (o painel acima do editor mostra os arquivos deles); o que falta construir é a camada que a pessoa vê.

## O que já existe

- **O banco**: três tabelas — \`usuarios\`, \`sessoes\` (o token de quem entrou) e \`tarefas\` (cada uma com dono). A Ana (\`token-da-ana\`) já tem três tarefas; a Bia (\`token-da-bia\`), uma.
- **A API**: \`GET /tarefas\` (as do usuário do token), \`POST /tarefas\`, \`PATCH /tarefas/:id\` (\`{ feita }\` e/ou \`{ titulo }\`), \`DELETE /tarefas/:id\` — todas exigindo o cabeçalho \`Authorization: Bearer <token>\`, e recusando mexer na tarefa de outra pessoa.
- **O cliente da API** (\`pedir\`), já escrito no esqueleto: põe o token, fala JSON, e transforma resposta de erro em exceção.

## O que construir

1. **Carregar e listar**: buscar as tarefas de quem está em \`#quem\`, desenhar um \`<li>\` por tarefa (título e caixa de marcar), e mostrar a contagem (ou o vazio, ou o erro) em \`#estado\`.
2. **Adicionar**: o formulário cria a tarefa e recarrega a lista da fonte da verdade.
3. **Marcar e apagar**: por delegação (um ouvinte só na lista), a caixa grava \`feita\` e o botão apaga.
4. **Filtrar e buscar**: um seletor (todas/pendentes/feitas) e um campo de busca por título — **sem fazer outro fetch**: os dois filtram o array que já está em memória, e se combinam (pendente **e** contém o termo).

## A decisão central: onde mora o filtro

O servidor devolve **todas** as tarefas do usuário; filtrar e buscar acontecem inteiramente na página, sobre os dados já carregados. Isso significa guardar a lista completa numa variável (fora de qualquer função), e ter uma função que a esse array aplica os dois critérios antes de desenhar — chamada tanto depois de carregar quanto a cada mudança no filtro ou na busca, sem nunca pedir os dados de novo.

## Antes de submeter

- Trocar de usuário no \`#quem\` busca as tarefas da pessoa certa, do zero?
- Filtro e busca continuam combinados depois de marcar ou apagar uma tarefa (que recarrega a lista completa)?
- Um título só de espaços realmente não cria nada — nem no servidor?
`.trim(),
};

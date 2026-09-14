import type { Lesson } from '../types';

export const lessonEstadosDaTela: Lesson = {
  id: 'lesson-pagina-22',
  trackId: 'track-pagina',
  title: 'Os Estados da Tela: Vazio, Carregando, Erro',
  language: 'html',
  objective:
    'Desenhar cada estado que uma tela pode ter — vazio, carregando, erro, sucesso — de forma que a pessoa sempre saiba o que está acontecendo e o que pode fazer.',
  concepts: ['ui-estados-tela'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Toda tela é desenhada primeiro com dados bonitos: uma lista cheia, um perfil completo. E é assim que ela fica nas maquetes. Mas a maior parte do tempo real de uma tela é passada **nos outros estados** — antes de os dados chegarem, quando não há dados, quando algo deu errado. Uma tela que só existe no estado feliz é uma tela que a pessoa vai encontrar quebrada.

## Os cinco estados

Toda tela que mostra dados tem, no mínimo:

1. **Carregando** — o pedido saiu, nada voltou.
2. **Vazio** — voltou, e não há nada: a lista nova, a busca sem resultado.
3. **Erro** — não voltou, ou voltou com falha.
4. **Com dados** — o estado das maquetes.
5. **Parcial** — chegou um pouco, o resto vem (paginação, "carregar mais").

Você viu os três primeiros no código, na aula de buscar dados. Aqui é sobre **como cada um se parece**.

## Vazio não é nada

Uma lista vazia que mostra uma área em branco parece **bug**. O estado vazio precisa dizer três coisas: que está vazio, por quê, e **o que fazer**:

~~~html
<div class="vazio">
  <p>Você ainda não tem tarefas.</p>
  <p class="suave">Crie a primeira e ela aparece aqui.</p>
  <button class="primario">Nova tarefa</button>
</div>
~~~

O botão é o que separa um estado vazio de um beco: a pessoa sai dali com um caminho. E a busca sem resultado é outro vazio: "Nenhum resultado para *xyz*" — com o termo, para ela ver o que digitou — e a sugestão de tentar outro.

## Carregando: mostre a forma

Um spinner no meio do nada é honesto, mas dá a sensação de que a tela **toda** está travada. O **esqueleto** — caixas cinzas na forma do que vai chegar — é melhor: a pessoa vê a estrutura, sabe que uma lista está vindo, e o salto quando os dados chegam é menor. Você já viu isso neste aplicativo, no painel.

~~~html
<ul class="lista" aria-busy="true">
  <li class="esqueleto"></li>
  <li class="esqueleto"></li>
</ul>
~~~

\`aria-busy="true"\` avisa o leitor de tela que a região está mudando. E, se demora mais de uns segundos, um texto: "Carregando as tarefas…".

## Erro: o que houve e o que fazer

Uma mensagem de erro tem duas frases: **o que aconteceu**, em linguagem de gente, e **o que fazer**. "Não foi possível carregar as tarefas. Tente de novo." — com o botão de tentar de novo ali. "Erro 500" não diz nada a ninguém; "algo deu errado" diz menos ainda. E nunca esconda o que a pessoa já tinha: se a lista antiga está na tela, mantenha-a, com o aviso em cima.

## Sucesso: confirme e saia

Depois de salvar, uma confirmação breve — "Salvo." — que some sozinha, ou o próprio conteúdo atualizado. Um modal "Sucesso!" com botão de OK é um clique a mais para dizer o que a tela já mostra.

## Um lugar para os avisos

Estados que mudam sozinhos — "carregando", "salvo", "falhou" — vão num elemento com \`role="status"\` (ou \`aria-live="polite"\`): o leitor de tela anuncia a mudança sem roubar o foco. Um só, na tela, que você atualiza.

## Os erros

- Área em branco no lugar do estado vazio.
- Spinner que trava a tela inteira, quando só a lista carrega.
- "Erro 500" ou "algo deu errado", sem ação.
- Modal de sucesso.
- Estado que muda em silêncio para quem não vê.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  .esqueleto { height: 20px; margin: 8px 0; background: #e6e5df; border-radius: 4px; list-style: none; }
  .vazio { padding: 24px; text-align: center; border: 1px dashed #cbd5d1; }
  .suave { color: #5f625d; }
  .erro { padding: 12px; background: #fde7e4; color: #7a1c14; }
  .primario { background: #1f6660; color: white; border: 0; padding: 12px 16px; }
</style>

<p id="estado" role="status"></p>

<ul id="lista" aria-busy="true">
  <li class="esqueleto"></li>
  <li class="esqueleto"></li>
</ul>

<div id="vazio" class="vazio" hidden>
  <p>Você ainda não tem tarefas.</p>
  <p class="suave">Crie a primeira e ela aparece aqui.</p>
  <button class="primario">Nova tarefa</button>
</div>

<div id="erro" class="erro" hidden>
  <p>Não foi possível carregar as tarefas.</p>
  <button id="tentar">Tentar de novo</button>
</div>

<script>
  window.__servidor = { '/api/tarefas': [] };

  async function carregar() {
    const lista = document.querySelector('#lista');
    lista.setAttribute('aria-busy', 'true');
    document.querySelector('#erro').hidden = true;
    try {
      const resposta = await fetch('/api/tarefas');
      if (!resposta.ok) throw new Error(resposta.status);
      const tarefas = await resposta.json();
      lista.replaceChildren();
      for (const t of tarefas) { const li = document.createElement('li'); li.textContent = t; lista.append(li); }
      document.querySelector('#vazio').hidden = tarefas.length > 0;
    } catch {
      lista.replaceChildren();
      document.querySelector('#erro').hidden = false;
    } finally {
      lista.setAttribute('aria-busy', 'false');
    }
  }

  document.querySelector('#tentar').addEventListener('click', carregar);
  carregar();
</script>`,
      caption:
        'Os quatro estados desenhados, cada um num elemento próprio, e a função `carregar` decide qual aparece. O servidor devolve uma lista vazia, então você vê o estado vazio — com um caminho. Troque para `/api/nada` e veja o erro, com o botão de tentar de novo.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-22-branco',
        type: 'multiple-choice',
        prompt: 'A lista de pedidos de uma pessoa nova é vazia, e a tela mostra uma área em branco. O que ela conclui?',
        concepts: ['ui-estados-tela'],
        difficulty: 'iniciante',
        tags: ['ui', 'estados'],
        options: [
          'Que não tem pedidos',
          'Que a tela quebrou ou ainda está carregando — em branco não diz nada; o estado vazio precisa dizer que está vazio e o que fazer',
          'Que precisa recarregar',
          'Nada; ela espera',
        ],
        correctIndex: 1,
        explanation:
          'Branco é ambíguo: pode ser bug, pode ser carregando, pode ser vazio. A pessoa não tem como saber, e a reação mais comum é recarregar ou ir embora. O estado vazio explícito — "Você ainda não fez pedidos", com um botão para a loja — transforma o beco num começo.',
        hints: ['O que diferencia, para quem olha, uma tela vazia de uma tela quebrada?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-22-vazio',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'A função `desenhar` só desenha a lista. Complete-a: quando `tarefas` estiver vazia, mostre o `#vazio` (que precisa ter uma frase e um botão **Nova tarefa**); quando houver itens, esconda-o. Chame `desenhar([])` no fim.',
        concepts: ['ui-estados-tela'],
        difficulty: 'iniciante',
        tags: ['ui', 'estados'],
        initialCode: `<style>
  .vazio { padding: 24px; text-align: center; border: 1px dashed #cbd5d1; }
  .primario { background: #1f6660; color: white; border: 0; padding: 12px 16px; }
</style>

<ul id="lista"></ul>

<div id="vazio" class="vazio" hidden>
  <!-- uma frase dizendo que não há tarefas, e um botão "Nova tarefa" -->
</div>

<script>
  function desenhar(tarefas) {
    const ul = document.querySelector('#lista');
    ul.replaceChildren();
    for (const t of tarefas) {
      const li = document.createElement('li');
      li.textContent = t;
      ul.append(li);
    }
    // mostre ou esconda #vazio
  }

  desenhar([]);
</script>
`,
        tests: [
          {
            description: 'com a lista vazia, o estado vazio aparece com frase e ação',
            assertion: `
              const vazio = document.querySelector('#vazio');
              if (vazio.hidden) throw new Error('Com desenhar([]), #vazio precisa aparecer (hidden = false).');
              if (!vazio.querySelector('p') || vazio.querySelector('p').textContent.trim().length < 10) throw new Error('#vazio precisa de uma frase dizendo que não há tarefas.');
              const b = vazio.querySelector('button');
              if (!b || !/Nova tarefa/.test(b.textContent)) throw new Error('#vazio precisa de um botão "Nova tarefa" — um estado vazio dá um caminho.');
            `,
          },
          {
            description: 'com itens, o estado vazio some',
            assertion: `
              desenhar(['Comprar pão']);
              if (!document.querySelector('#vazio').hidden) throw new Error('Com itens na lista, #vazio precisa ficar oculto.');
              if (document.querySelectorAll('#lista li').length !== 1) throw new Error('A lista precisa mostrar o item.');
              desenhar([]);
              if (document.querySelector('#vazio').hidden) throw new Error('Ao voltar a zero itens, #vazio reaparece.');
            `,
          },
        ],
        hints: [
          'Uma linha no fim de `desenhar`: `document.querySelector("#vazio").hidden = tarefas.length > 0`.',
          'No HTML do `#vazio`: um `<p>` e um `<button class="primario">Nova tarefa</button>`.',
        ],
        solution: `<style>
  .vazio { padding: 24px; text-align: center; border: 1px dashed #cbd5d1; }
  .primario { background: #1f6660; color: white; border: 0; padding: 12px 16px; }
</style>

<ul id="lista"></ul>

<div id="vazio" class="vazio" hidden>
  <p>Você ainda não tem tarefas.</p>
  <button class="primario">Nova tarefa</button>
</div>

<script>
  function desenhar(tarefas) {
    const ul = document.querySelector('#lista');
    ul.replaceChildren();
    for (const t of tarefas) {
      const li = document.createElement('li');
      li.textContent = t;
      ul.append(li);
    }
    document.querySelector('#vazio').hidden = tarefas.length > 0;
  }

  desenhar([]);
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-22-lacuna-status',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt: 'Complete: o elemento de avisos que o leitor de tela anuncia, a marcação de "ocupado" enquanto carrega, e o atributo que esconde o painel de erro.',
        concepts: ['ui-estados-tela'],
        difficulty: 'iniciante',
        tags: ['ui', 'estados', 'acessibilidade'],
        template: `<p id="estado" {{1}}="status"></p>
<ul id="lista" {{2}}="true"></ul>
<div id="erro" {{3}}>Não foi possível carregar. <button>Tentar de novo</button></div>

<script>
  document.querySelector('#estado').textContent = 'Carregando as tarefas…';
</script>`,
        blanks: [
          { placeholder: 'papel', size: 4 },
          { placeholder: 'ocupado', size: 9 },
          { placeholder: 'oculto', size: 6 },
        ],
        tests: [
          {
            description: 'o aviso é uma região de status',
            assertion: `if (document.querySelector('#estado').getAttribute('role') !== 'status') throw new Error('role="status" faz o leitor de tela anunciar as mudanças do #estado sem roubar o foco.');`,
          },
          {
            description: 'a lista está marcada como ocupada',
            assertion: `if (document.querySelector('#lista').getAttribute('aria-busy') !== 'true') throw new Error('aria-busy="true" diz que a região está carregando.');`,
          },
          {
            description: 'o painel de erro começa oculto',
            assertion: `if (!document.querySelector('#erro').hidden) throw new Error('O painel de erro só aparece quando há erro: comece com o atributo hidden.');`,
          },
        ],
        hints: [
          'O atributo que dá um papel a um elemento; o `aria-` de "ocupado"; e o atributo de HTML que esconde.',
        ],
        solution: ['role', 'aria-busy', 'hidden'],
        explanation:
          'Três atributos que custam quase nada e fazem os estados existirem para quem não vê a tela: `role="status"` anuncia o que muda no `#estado`; `aria-busy` diz que a lista está em obras; `hidden` mantém o erro fora da tela e da árvore de acessibilidade até ser preciso.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-22-ordenar-estados',
        type: 'order-steps',
        prompt: 'A tela de uma lista, da abertura ao primeiro uso, no caminho feliz. Coloque na ordem os estados por que ela passa.',
        concepts: ['ui-estados-tela'],
        difficulty: 'intermediario',
        tags: ['ui', 'estados'],
        steps: [
          { id: 'esqueleto', text: 'Carregando: esqueletos na forma da lista, `aria-busy="true"`', ordem: 1 },
          { id: 'vazio', text: 'Vazio: "Você ainda não tem tarefas", com o botão de criar a primeira', ordem: 2 },
          { id: 'cria', text: 'A pessoa cria uma tarefa; o estado vazio some e a lista aparece com um item', ordem: 3 },
          { id: 'salvo', text: 'Sucesso: "Salvo." no `role="status"`, breve, sem modal', ordem: 4 },
          { id: 'dados', text: 'Com dados: a lista, o estado das maquetes — o último a aparecer', ordem: 5 },
        ],
        explanation:
          'Repare que o estado "com dados" — o único que as maquetes desenham — é o **último** que a pessoa vê, e ela só chega a ele passando pelos outros. Uma tela que não desenhou o carregando e o vazio recebe a pessoa com um branco e depois com um bug aparente. Os estados "feios" são a primeira impressão.',
        hints: [
          'Antes de qualquer dado, há uma espera.',
          'A lista com dados só existe depois que alguém criou alguma coisa.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-22-erro',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Escreva a mensagem de erro certa: quando `carregar()` falhar, o `#erro` aparece com duas frases — **o que houve** ("Não foi possível carregar as tarefas.") e **o que fazer** — e um botão **Tentar de novo** que chama `carregar()` outra vez. Enquanto carrega, `#lista` fica com `aria-busy="true"`; ao terminar, `"false"`.',
        concepts: ['ui-estados-tela'],
        difficulty: 'intermediario',
        tags: ['ui', 'estados'],
        initialCode: `<style>
  .erro { padding: 12px; background: #fde7e4; color: #7a1c14; }
</style>

<ul id="lista" aria-busy="false"></ul>
<div id="erro" class="erro" hidden>
  <!-- o que houve, o que fazer, e o botão Tentar de novo -->
</div>

<script>
  window.__servidor = {};   // sem /api/tarefas: a busca vai falhar

  async function carregar() {
    const lista = document.querySelector('#lista');
    // aria-busy true; esconda #erro; fetch; se falhar, mostre #erro; no fim, aria-busy false
  }

  carregar();
</script>
`,
        tests: [
          {
            description: 'na falha, o erro aparece com o que houve e o que fazer',
            assertion: `
              await new Promise((r) => setTimeout(r, 250));
              const erro = document.querySelector('#erro');
              if (erro.hidden) throw new Error('Com a busca falhando, #erro precisa aparecer.');
              const texto = erro.textContent;
              if (!/Não foi possível carregar as tarefas\\./.test(texto)) throw new Error('A primeira frase diz o que houve: "Não foi possível carregar as tarefas."');
              if (!/Tentar de novo/.test(texto)) throw new Error('Falta o botão "Tentar de novo".');
            `,
          },
          {
            description: 'o botão tenta de novo — e some quando dá certo',
            // Os testes rodam ao mesmo tempo; este espera a busca inicial
            // (que falha) terminar antes de consertar o servidor e tentar de
            // novo — senão a falha inicial chega depois e cobre o sucesso.
            assertion: `
              await new Promise((r) => setTimeout(r, 300));
              window.__servidor['/api/tarefas'] = ['Comprar pão'];
              const botao = [...document.querySelectorAll('#erro button')].find((b) => /Tentar de novo/.test(b.textContent));
              if (!botao) throw new Error('Falta o botão "Tentar de novo" dentro de #erro.');
              botao.click();
              await new Promise((r) => setTimeout(r, 250));
              if (!document.querySelector('#erro').hidden) throw new Error('Depois de tentar de novo com sucesso, #erro precisa sumir.');
              if (document.querySelectorAll('#lista li').length !== 1) throw new Error('E a lista precisa mostrar a tarefa que chegou.');
            `,
          },
          {
            description: 'a lista avisa que está ocupada enquanto carrega, e livre depois',
            assertion: `
              await new Promise((r) => setTimeout(r, 700));
              const lista = document.querySelector('#lista');
              const p = carregar();
              if (lista.getAttribute('aria-busy') !== 'true') throw new Error('Assim que carregar() começa, #lista precisa ter aria-busy="true".');
              await p;
              if (lista.getAttribute('aria-busy') !== 'false') throw new Error('Ao terminar, aria-busy volta a "false" — no finally, para valer também na falha.');
            `,
          },
        ],
        hints: [
          'HTML do `#erro`: dois `<p>` e um `<button id="tentar">Tentar de novo</button>`; registre o clique com `addEventListener("click", carregar)`.',
          'Na função: `setAttribute("aria-busy", "true")`, `erro.hidden = true`, `try { fetch… desenhar } catch { erro.hidden = false } finally { setAttribute("aria-busy", "false") }`.',
          "async function carregar() {\n  const lista = document.querySelector('#lista');\n  const erro = document.querySelector('#erro');\n  lista.setAttribute('aria-busy', 'true');\n  erro.hidden = true;\n  try {\n    const resposta = await fetch('/api/tarefas');\n    if (!resposta.ok) throw new Error(resposta.status);\n    const tarefas = await resposta.json();\n    lista.replaceChildren();\n    for (const t of tarefas) { const li = document.createElement('li'); li.textContent = t; lista.append(li); }\n  } catch {\n    erro.hidden = false;\n  } finally {\n    lista.setAttribute('aria-busy', 'false');\n  }\n}\ndocument.querySelector('#tentar').addEventListener('click', carregar);",
        ],
        solution: `<style>
  .erro { padding: 12px; background: #fde7e4; color: #7a1c14; }
</style>

<ul id="lista" aria-busy="false"></ul>
<div id="erro" class="erro" hidden>
  <p>Não foi possível carregar as tarefas.</p>
  <p>Confira a conexão e tente de novo.</p>
  <button id="tentar">Tentar de novo</button>
</div>

<script>
  window.__servidor = {};

  async function carregar() {
    const lista = document.querySelector('#lista');
    const erro = document.querySelector('#erro');
    lista.setAttribute('aria-busy', 'true');
    erro.hidden = true;
    try {
      const resposta = await fetch('/api/tarefas');
      if (!resposta.ok) throw new Error(resposta.status);
      const tarefas = await resposta.json();
      lista.replaceChildren();
      for (const t of tarefas) {
        const li = document.createElement('li');
        li.textContent = t;
        lista.append(li);
      }
    } catch {
      erro.hidden = false;
    } finally {
      lista.setAttribute('aria-busy', 'false');
    }
  }

  document.querySelector('#tentar').addEventListener('click', carregar);
  carregar();
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-22-modal',
        type: 'multiple-choice',
        prompt: 'Depois de salvar, a tela abre um modal "Sucesso!" com um botão OK. Qual é o problema?',
        concepts: ['ui-estados-tela'],
        difficulty: 'iniciante',
        tags: ['ui', 'estados'],
        options: [
          'Nenhum; confirmar é importante',
          'É um clique a mais para dizer o que a tela já mostra — uma confirmação breve num `role="status"`, ou o próprio conteúdo atualizado, basta',
          'Modais não funcionam em celular',
          'Deveria ser um modal vermelho',
        ],
        correctIndex: 1,
        explanation:
          'Sucesso é o caminho comum — acontece dezenas de vezes por dia. Interromper cada um com um modal que exige OK cobra um clique por sucesso e ensina a pessoa a fechar sem ler. Uma linha "Salvo." que some, ou o item novo aparecendo na lista, confirma sem interromper. Modal fica para o que precisa de decisão.',
        hints: ['Quantas vezes por dia a pessoa vai ver essa confirmação?'],
      },
    },
    {
      kind: 'summary',
      markdown: `Uma tela tem cinco estados, e as maquetes desenham um. Vazio diz que está vazio, por quê, e o que fazer — com um botão. Carregando mostra a forma (esqueleto) e marca \`aria-busy\`. Erro diz o que houve em linguagem de gente e o que fazer, com o botão de tentar de novo. Sucesso confirma breve e sai. E as mudanças passam por um \`role="status"\`, para existirem também para quem não vê.`,
    },
  ],
};

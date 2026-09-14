import type { Lesson } from '../types';

export const lessonTeclado: Lesson = {
  id: 'lesson-pagina-23',
  trackId: 'track-pagina',
  title: 'Acessível pelo Teclado: A Página Sem Mouse',
  language: 'html',
  objective:
    'Fazer a página inteira funcionar só com Tab, Enter, espaço e Escape — usando os elementos certos, dando nome ao que é só ícone, e cuidando de onde o foco vai depois de cada ação.',
  concepts: ['ui-teclado'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Tire o mouse da mesa e tente usar a sua página. Tab para avançar, Shift+Tab para voltar, Enter ou espaço para acionar, Escape para fechar. Se alguma coisa não dá para fazer assim, ela não existe para quem usa leitor de tela, para quem tem lesão nas mãos, para quem está num teclado sem trackpad — e para você, daqui a uns anos. A boa notícia: o HTML certo já faz quase tudo.

## O elemento certo já é acessível

Um \`<button>\` recebe foco com Tab, aciona com Enter e espaço, anuncia-se como "botão", e aparece na lista de controles do leitor de tela. Um \`<div onclick>\` não faz **nenhuma** dessas quatro coisas. Recriar tudo isso à mão — \`tabindex\`, \`role\`, \`keydown\` para Enter e espaço — é possível, dá trabalho, e sai pior.

A regra é curta:

- Faz alguma coisa na página: \`<button>\`.
- Leva a outro lugar: \`<a href>\`.
- Recebe dados: \`<input>\`, \`<select>\`, \`<textarea>\`, com \`<label>\`.

Um \`<a>\` sem \`href\` não recebe foco. Um \`<div>\` bonito com \`class="botao"\` não é botão.

## A ordem do Tab é a ordem do HTML

O foco anda pela página na ordem em que os elementos aparecem no código. Se o CSS mudou a ordem visual — um \`order\` no flex, um \`grid-area\` —, o Tab continua na ordem do HTML, e a pessoa pula de um canto a outro sem entender. Mantenha a ordem do código igual à ordem visual.

\`tabindex\` tem dois usos e um proibido:

- \`tabindex="0"\`: põe na ordem do Tab um elemento que não é focável por natureza (raro; quase sempre o certo é trocar o elemento).
- \`tabindex="-1"\`: focável por script (\`el.focus()\`), mas fora do Tab. Para mover o foco a um título ou a um painel.
- **\`tabindex="1"\` ou maior: nunca.** Reordena o Tab na mão e cria um caos que ninguém consegue prever.

## Nome para o que é só ícone

Um botão com só um "×" ou um ícone de lixeira é anunciado como "botão" — e nada mais. \`aria-label\` dá o nome:

~~~html
<button aria-label="Fechar">×</button>
<button aria-label="Remover Comprar pão">🗑</button>
~~~

O nome diz **o que faz**, e inclui o alvo quando há vários iguais: dez botões "Remover" não ajudam; "Remover Comprar pão" sim.

## Para onde vai o foco

Cada ação deixa o foco em algum lugar, e o lugar importa:

- **Abriu um painel ou diálogo**: o foco vai para dentro dele (o primeiro campo, ou o título com \`tabindex="-1"\`). Escape fecha e **devolve** o foco ao botão que abriu.
- **Removeu um item**: o foco vai para o item seguinte, ou para o título da lista — nunca para o \`body\`, que é onde ele cai quando o elemento focado some.
- **Enviou um formulário com erro**: o foco vai para o primeiro campo com erro.

Você já viu isso neste aplicativo: ao acertar um exercício, o botão "verificar" some e o foco é movido para o retorno — senão cairia no nada.

## O link para pular

A primeira coisa focável de uma página com menu longo é um link "Pular para o conteúdo", invisível até receber foco, que leva ao \`<main>\`. Quem usa teclado não precisa passar por vinte links de menu em cada página.

~~~html
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
…
<main id="conteudo" tabindex="-1">
~~~

## Os erros

- \`<div>\` ou \`<span>\` clicável.
- \`<a>\` sem \`href\`.
- \`tabindex\` positivo.
- Botão de ícone sem nome.
- Foco que cai no \`body\` depois de uma ação.
- Diálogo que Escape não fecha.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  .pular { position: absolute; left: -999px; }
  .pular:focus { left: 8px; top: 8px; background: white; padding: 8px; }
  button:focus-visible, a:focus-visible { outline: 3px solid #1f6660; outline-offset: 2px; }
</style>

<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<nav><a href="#">Início</a> <a href="#">Aulas</a> <a href="#">Perfil</a></nav>

<main id="conteudo" tabindex="-1">
  <h1 id="titulo-lista" tabindex="-1">Tarefas</h1>
  <ul id="lista">
    <li>Comprar pão <button aria-label="Remover Comprar pão" data-acao="remover">×</button></li>
    <li>Estudar <button aria-label="Remover Estudar" data-acao="remover">×</button></li>
  </ul>
</main>

<script>
  document.querySelector('#lista').addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-acao="remover"]');
    if (!botao) return;
    const li = botao.closest('li');
    const proximo = li.nextElementSibling || li.previousElementSibling;
    li.remove();
    // O foco não pode cair no body: vai para o próximo item, ou para o título.
    (proximo ? proximo.querySelector('button') : document.querySelector('#titulo-lista')).focus();
  });
</script>`,
      caption:
        'Use Tab na pré-visualização: o link de pular aparece primeiro; os botões × têm nome; e ao remover um item, o foco vai para o × do item seguinte — ou para o título, quando era o último. Nunca para o nada.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-23-div',
        type: 'multiple-choice',
        prompt: 'Um `<div class="botao" onclick="salvar()">Salvar</div>` funciona com o mouse. O que falta para o teclado e o leitor de tela?',
        concepts: ['ui-teclado'],
        difficulty: 'iniciante',
        tags: ['ui', 'teclado', 'acessibilidade'],
        options: [
          'Nada; `onclick` responde a Enter também',
          'Tudo: foco por Tab, acionar por Enter e espaço, o papel "botão" e o nome — e trocar por `<button>` resolve as quatro coisas de uma vez',
          'Só o `tabindex="0"`',
          'Só o `role="button"`',
        ],
        correctIndex: 1,
        explanation:
          'Um `div` não recebe foco, não reage a Enter nem espaço, e o leitor de tela o anuncia como texto comum. Dá para remendar com `tabindex`, `role` e um `keydown` — e cada remendo é um jeito de errar. `<button>` tem os quatro comportamentos de fábrica, e ainda funciona dentro de `<form>`.',
        hints: ['Quantas coisas um `<button>` faz sozinho que um `<div>` não faz?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-23-consertar-elementos',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Conserte a barra: o "botão" é um `<div>`, o link não tem `href`, o botão de fechar é só um × sem nome, e há um `tabindex="2"`. Use os elementos certos, dê `href="#"` ao link, `aria-label="Fechar"` ao ×, e tire o `tabindex` positivo.',
        concepts: ['ui-teclado'],
        difficulty: 'iniciante',
        tags: ['ui', 'teclado', 'acessibilidade'],
        initialCode: `<style>
  .botao { background: #1f6660; color: white; padding: 12px 16px; display: inline-block; }
</style>

<div class="botao" id="salvar">Salvar</div>
<a id="ajuda">Ajuda</a>
<button id="fechar" tabindex="2">×</button>
`,
        tests: [
          {
            description: 'o Salvar é um <button>',
            assertion: `
              const s = document.querySelector('#salvar');
              if (!s || s.tagName !== 'BUTTON') throw new Error('Faz alguma coisa na página: precisa ser um <button>, não um <div>.');
            `,
          },
          {
            description: 'o link tem href, e por isso recebe foco',
            assertion: `
              const a = document.querySelector('#ajuda');
              if (!a || a.tagName !== 'A' || !a.hasAttribute('href')) throw new Error('Um <a> sem href não entra na ordem do Tab. Dê um href ao link Ajuda.');
            `,
          },
          {
            description: 'o botão de fechar tem nome',
            assertion: `
              const f = document.querySelector('#fechar');
              if (!f.getAttribute('aria-label') || !/fechar/i.test(f.getAttribute('aria-label'))) throw new Error('Um botão só com × é anunciado como "botão" e nada mais: aria-label="Fechar".');
            `,
          },
          {
            description: 'nenhum tabindex positivo',
            assertion: `
              for (const el of document.querySelectorAll('[tabindex]')) {
                if (Number(el.getAttribute('tabindex')) > 0) throw new Error('tabindex positivo reordena o Tab na mão: tire o tabindex="' + el.getAttribute('tabindex') + '".');
              }
            `,
          },
        ],
        hints: [
          'Troque a tag do Salvar (a classe pode ficar), acrescente `href="#"`, `aria-label="Fechar"`, e apague o `tabindex`.',
        ],
        solution: `<style>
  .botao { background: #1f6660; color: white; padding: 12px 16px; display: inline-block; border: 0; }
</style>

<button class="botao" id="salvar">Salvar</button>
<a id="ajuda" href="#">Ajuda</a>
<button id="fechar" aria-label="Fechar">×</button>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-23-lacuna-pular',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt: 'Complete o link de pular para o conteúdo e o alvo dele — focável por script, fora do Tab.',
        concepts: ['ui-teclado'],
        difficulty: 'iniciante',
        tags: ['ui', 'teclado', 'acessibilidade'],
        template: `<style>
  .pular { position: absolute; left: -999px; }
  .pular:focus { left: 8px; }
</style>

<a class="pular" {{1}}="#conteudo">Pular para o conteúdo</a>
<nav><a href="#">Início</a> <a href="#">Aulas</a></nav>

<main {{2}}="conteudo" tabindex="{{3}}">
  <h1>Conteúdo</h1>
</main>`,
        blanks: [
          { placeholder: 'destino', size: 4 },
          { placeholder: 'âncora', size: 2 },
          { placeholder: 'fora do Tab', size: 2 },
        ],
        tests: [
          {
            description: 'o link aponta para o conteúdo',
            assertion: `
              const a = document.querySelector('.pular');
              if (a.getAttribute('href') !== '#conteudo') throw new Error('O link precisa de href="#conteudo".');
            `,
          },
          {
            description: 'o main é o alvo, focável por script e fora do Tab',
            assertion: `
              const m = document.querySelector('main');
              if (m.id !== 'conteudo') throw new Error('O main precisa de id="conteudo", o alvo do link.');
              if (m.getAttribute('tabindex') !== '-1') throw new Error('tabindex="-1": o main recebe foco quando o link é acionado, mas não entra na ordem do Tab.');
              m.focus();
              if (document.activeElement !== m) throw new Error('O main precisa conseguir receber foco.');
            `,
          },
        ],
        hints: [
          'O atributo de destino de um link; o atributo que dá um id ao alvo; e o valor de `tabindex` que permite foco por script sem entrar no Tab.',
        ],
        solution: ['href', 'id', '-1'],
        explanation:
          'O link é a primeira coisa focável da página, escondido fora da tela até receber foco. Ao acionar, o navegador move o foco para o `#conteudo` — e é o `tabindex="-1"` que permite a um `<main>` receber esse foco sem aparecer na sequência do Tab. Vinte links de menu deixam de ser um pedágio.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-23-ordenar-dialogo',
        type: 'order-steps',
        prompt: 'Abrir e fechar um diálogo pelo teclado, do jeito certo. Coloque na ordem.',
        concepts: ['ui-teclado'],
        difficulty: 'intermediario',
        tags: ['ui', 'teclado', 'acessibilidade'],
        steps: [
          { id: 'abre', text: 'A pessoa aciona o botão "Editar" com Enter; o diálogo aparece', ordem: 1 },
          { id: 'entra', text: 'O foco é movido para dentro do diálogo — o primeiro campo, ou o título', ordem: 2 },
          { id: 'usa', text: 'Tab circula só entre os controles do diálogo; o fundo fica fora', ordem: 3 },
          { id: 'esc', text: 'Escape fecha o diálogo', ordem: 4 },
          { id: 'volta', text: 'O foco é devolvido ao botão "Editar", de onde a pessoa saiu', ordem: 5 },
        ],
        explanation:
          'Dois movimentos de foco que o código precisa fazer: entrar ao abrir, voltar ao fechar. Sem o primeiro, a pessoa aperta Tab e continua navegando a página escondida atrás do diálogo; sem o segundo, o foco cai no `body` e ela precisa achar o lugar de novo. O elemento `<dialog>` nativo faz a maior parte disso sozinho, inclusive o Escape.',
        hints: [
          'O foco precisa acompanhar a abertura — e a devolução vem por último.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-23-foco-remover',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Ao remover um item pelo botão ×, o foco não pode cair no nada. Complete o ouvinte: depois de remover o `<li>`, mova o foco para o × do **item seguinte** — ou, se era o último, para o `#titulo` (que já tem `tabindex="-1"`). Os botões também precisam de `aria-label` com o nome do item.',
        concepts: ['ui-teclado'],
        difficulty: 'intermediario',
        tags: ['ui', 'teclado', 'acessibilidade'],
        initialCode: `<h1 id="titulo" tabindex="-1">Tarefas</h1>
<ul id="lista">
  <li>Comprar pão <button data-acao="remover">×</button></li>
  <li>Estudar <button data-acao="remover">×</button></li>
  <li>Ligar para a Ana <button data-acao="remover">×</button></li>
</ul>

<script>
  // dê a cada botão aria-label "Remover <texto do item>"

  document.querySelector('#lista').addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-acao="remover"]');
    if (!botao) return;
    const li = botao.closest('li');
    // guarde o vizinho, remova, e mova o foco
    li.remove();
  });
</script>
`,
        tests: [
          {
            description: 'cada botão tem o nome do item',
            assertion: `
              const nomes = [...document.querySelectorAll('#lista button')].map((b) => b.getAttribute('aria-label') || '');
              if (nomes[0] !== 'Remover Comprar pão' || nomes[1] !== 'Remover Estudar') throw new Error('Esperava aria-label "Remover Comprar pão", "Remover Estudar", …; veio ' + JSON.stringify(nomes) + '.');
            `,
          },
          {
            description: 'remover um item do meio leva o foco ao × do seguinte',
            assertion: `
              const botoes = document.querySelectorAll('#lista button');
              botoes[0].focus();
              botoes[0].click();
              const ativo = document.activeElement;
              if (!ativo || ativo.tagName !== 'BUTTON' || ativo.getAttribute('aria-label') !== 'Remover Estudar') throw new Error('Depois de remover Comprar pão, o foco precisa estar no × de Estudar; está em ' + (ativo ? ativo.tagName + ' ' + (ativo.getAttribute('aria-label') || ativo.id || '') : 'lugar nenhum') + '.');
            `,
          },
          {
            description: 'remover o último leva o foco ao título',
            assertion: `
              const botoes = document.querySelectorAll('#lista button');
              botoes[botoes.length - 1].focus();
              botoes[botoes.length - 1].click();
              if (document.activeElement !== document.querySelector('#titulo') && document.activeElement.tagName !== 'BUTTON') throw new Error('Ao remover o último, o foco vai para o item anterior ou para o #titulo — nunca para o body.');
              const restante = document.querySelectorAll('#lista button');
              restante[0].focus();
              restante[0].click();
              if (document.activeElement !== document.querySelector('#titulo')) throw new Error('Sem mais itens, o foco precisa ir para o #titulo; está em ' + document.activeElement.tagName + '.');
            `,
          },
        ],
        hints: [
          'Antes de remover: `const proximo = li.nextElementSibling || li.previousElementSibling`.',
          'Depois: `(proximo ? proximo.querySelector("button") : document.querySelector("#titulo")).focus()`.',
          "for (const li of document.querySelectorAll('#lista li')) {\n  li.querySelector('button').setAttribute('aria-label', 'Remover ' + li.firstChild.textContent.trim());\n}\n// no ouvinte:\nconst proximo = li.nextElementSibling || li.previousElementSibling;\nli.remove();\n(proximo ? proximo.querySelector('button') : document.querySelector('#titulo')).focus();",
        ],
        solution: `<h1 id="titulo" tabindex="-1">Tarefas</h1>
<ul id="lista">
  <li>Comprar pão <button data-acao="remover">×</button></li>
  <li>Estudar <button data-acao="remover">×</button></li>
  <li>Ligar para a Ana <button data-acao="remover">×</button></li>
</ul>

<script>
  for (const li of document.querySelectorAll('#lista li')) {
    li.querySelector('button').setAttribute('aria-label', 'Remover ' + li.firstChild.textContent.trim());
  }

  document.querySelector('#lista').addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-acao="remover"]');
    if (!botao) return;
    const li = botao.closest('li');
    const proximo = li.nextElementSibling || li.previousElementSibling;
    li.remove();
    (proximo ? proximo.querySelector('button') : document.querySelector('#titulo')).focus();
  });
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-23-tabindex',
        type: 'multiple-choice',
        prompt: 'Um formulário tem `tabindex="1"`, `"2"`, `"3"` nos campos "para garantir a ordem". Qual é o efeito?',
        concepts: ['ui-teclado'],
        difficulty: 'intermediario',
        tags: ['ui', 'teclado', 'acessibilidade'],
        options: [
          'A ordem fica garantida; é a forma recomendada',
          'Esses campos passam na frente de tudo o que não tem tabindex — inclusive do menu e do link de pular —, e a ordem do resto da página vira um quebra-cabeça',
          'Nenhum; o navegador ignora',
          'Só afeta leitores de tela',
        ],
        correctIndex: 1,
        explanation:
          '`tabindex` positivo cria uma fila prioritária: tudo com número vem antes de tudo sem número, na ordem dos números. O Tab sai do topo da página direto para o campo 1, pulando menu e cabeçalho, e só depois volta ao começo. A ordem natural — a do HTML — é a única que as pessoas conseguem prever. Se ela está errada, conserta-se o HTML.',
        hints: ['O que acontece com os elementos que não têm tabindex?'],
      },
    },
    {
      kind: 'summary',
      markdown: `Tire o mouse e teste. \`<button>\` faz, \`<a href>\` leva, \`<input>\` com \`<label>\` recebe — e um \`<div>\` clicável não faz nada disso. A ordem do Tab é a do HTML; \`tabindex\` só \`0\` ou \`-1\`, nunca positivo. Botão de ícone tem \`aria-label\` com o alvo. E o foco tem destino depois de cada ação: para dentro do que abriu, de volta ao que abriu, para o item seguinte do que foi removido — nunca para o nada.`,
    },
  ],
};

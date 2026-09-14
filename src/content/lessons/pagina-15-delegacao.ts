import type { Lesson } from '../types';

export const lessonDelegacao: Lesson = {
  id: 'lesson-pagina-15',
  trackId: 'track-pagina',
  title: 'Delegação: Um Ouvinte para Muitos',
  language: 'html',
  objective:
    'Usar a propagação dos eventos para escutar uma lista inteira num ouvinte só — inclusive os itens que ainda não existem — e identificar a ação pelo elemento clicado.',
  concepts: ['dom-delegacao'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Uma lista de tarefas com um botão "remover" em cada item. A primeira ideia é dar um \`addEventListener\` a cada botão. Funciona — até a lista ganhar um item novo, criado depois, que ficou sem ouvinte. E até a lista ter mil itens, com mil ouvintes iguais. Existe um jeito melhor, e ele depende de uma coisa que o navegador já faz.

## Os eventos sobem

Quando você clica num botão dentro de um \`li\` dentro de um \`ul\`, o evento **não acontece só no botão**: ele nasce lá e **sobe** pela árvore — botão, \`li\`, \`ul\`, \`body\`, \`document\`. Cada ancestral tem a chance de reagir. Chama-se *bubbling* (borbulhar), e é o padrão de quase todo evento.

Então basta **um ouvinte no \`ul\`** para receber os cliques de todos os botões que existem e que virão a existir:

~~~js
document.querySelector('#lista').addEventListener('click', (evento) => {
  // evento.target é onde o clique aconteceu: o botão, um texto, o li…
});
~~~

Isso é **delegação**: o pai cuida dos filhos.

## Descobrir o que foi clicado

Dentro do ouvinte, \`evento.target\` é o elemento exato — que pode ser o botão, ou um ícone dentro dele, ou o texto do item. \`closest\` resolve: sobe a partir do alvo até achar algo que case com um seletor.

~~~js
const botao = evento.target.closest('button');
if (!botao) return;   // clicou fora de qualquer botão
~~~

E para saber **qual** botão, o \`data-\` que você já conhece:

~~~html
<li data-id="7">
  Comprar pão
  <button data-acao="remover">×</button>
</li>
~~~

~~~js
lista.addEventListener('click', (evento) => {
  const botao = evento.target.closest('[data-acao]');
  if (!botao) return;

  const item = botao.closest('li');
  const id = Number(item.dataset.id);

  if (botao.dataset.acao === 'remover') remover(id);
});
~~~

Repare na forma: \`data-acao\` diz **o que fazer**; \`data-id\` no item diz **com quem**. O ouvinte lê os dois e chama a função certa. Acrescentar uma ação nova é acrescentar um botão com outro \`data-acao\` e um \`if\` — nenhum ouvinte novo.

## Com a função desenhar

Delegação e a função \`desenhar\` da aula de criar são feitas uma para a outra. \`desenhar\` recria os itens do zero — os ouvintes deles morreriam a cada redesenho. Com o ouvinte no pai, que **não** é recriado, nada se perde:

~~~js
function remover(id) {
  tarefas = tarefas.filter((t) => t.id !== id);
  desenhar();
}
~~~

Estado muda, tela é redesenhada, e o ouvinte do pai continua lá.

## target e currentTarget

\`evento.target\` é onde o evento **nasceu**; \`evento.currentTarget\` é o elemento onde **este ouvinte** está — o \`ul\`, na delegação. Quase sempre você quer o \`target\` (com \`closest\`). E \`stopPropagation()\` interrompe a subida: raramente é a resposta, e costuma esconder o problema de outro ouvinte que deveria estar ouvindo.

## Os erros

- Um ouvinte por item, e os itens novos surdos.
- Comparar \`evento.target\` direto com o botão, e falhar quando o clique foi no ícone dentro dele. Use \`closest\`.
- Esquecer o \`if (!botao) return\` e quebrar em cliques no texto.
- \`stopPropagation\` "para garantir".
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<ul id="lista"></ul>
<button id="nova">Nova tarefa</button>

<script>
  let tarefas = [
    { id: 1, texto: 'Comprar pão', feita: false },
    { id: 2, texto: 'Ligar para a Ana', feita: true },
  ];
  let proximoId = 3;

  function desenhar() {
    const ul = document.querySelector('#lista');
    ul.replaceChildren();
    for (const t of tarefas) {
      const li = document.createElement('li');
      li.dataset.id = t.id;
      li.textContent = (t.feita ? '✓ ' : '') + t.texto + ' ';

      const feita = document.createElement('button');
      feita.dataset.acao = 'alternar';
      feita.textContent = t.feita ? 'Reabrir' : 'Concluir';

      const remover = document.createElement('button');
      remover.dataset.acao = 'remover';
      remover.textContent = '×';

      li.append(feita, remover);
      ul.append(li);
    }
  }

  // Um ouvinte, para todos os botões — inclusive os que ainda não existem.
  document.querySelector('#lista').addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-acao]');
    if (!botao) return;
    const id = Number(botao.closest('li').dataset.id);

    if (botao.dataset.acao === 'remover') tarefas = tarefas.filter((t) => t.id !== id);
    if (botao.dataset.acao === 'alternar') tarefas = tarefas.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t));
    desenhar();
  });

  document.querySelector('#nova').addEventListener('click', () => {
    tarefas.push({ id: proximoId++, texto: 'Tarefa ' + proximoId, feita: false });
    desenhar();
  });

  desenhar();
</script>`,
      caption:
        'Dois `data-acao`, um ouvinte. `desenhar` recria a lista inteira a cada mudança — e nenhum ouvinte se perde, porque o único que existe está no `ul`. Crie tarefas novas na pré-visualização e repare que os botões delas já funcionam.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-15-surdo',
        type: 'multiple-choice',
        prompt:
          'Você deu `addEventListener("click", …)` a cada botão "remover" quando a página carregou. A pessoa cria uma tarefa nova, e o botão dela não faz nada. Por quê?',
        concepts: ['dom-delegacao'],
        difficulty: 'iniciante',
        tags: ['dom', 'delegacao'],
        options: [
          'Botões criados por JavaScript não aceitam eventos',
          'O botão novo nasceu depois do laço que registrou os ouvintes, e ninguém registrou nele — a delegação no pai resolve para todos, presentes e futuros',
          'Faltou `evento.preventDefault()`',
          'É preciso chamar `addEventListener` duas vezes',
        ],
        correctIndex: 1,
        explanation:
          'O laço rodou uma vez, sobre os botões que existiam naquele momento. O novo não estava lá. Você poderia registrar de novo a cada criação — e esquecer numa delas —, ou colocar **um** ouvinte no pai, que recebe os cliques de qualquer filho, novo ou velho, porque os eventos sobem.',
        hints: ['Quando o laço de `addEventListener` rodou, o botão novo existia?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-15-remover',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Um ouvinte só, no `#lista`: ao clicar num botão com `data-acao="remover"`, remova o `<li>` que o contém. Cliques fora de um botão não fazem nada.\n\nUse `closest`.',
        concepts: ['dom-delegacao'],
        difficulty: 'iniciante',
        tags: ['dom', 'delegacao'],
        initialCode: `<ul id="lista">
  <li>Comprar pão <button data-acao="remover">×</button></li>
  <li>Ligar para a Ana <button data-acao="remover">×</button></li>
  <li>Estudar <button data-acao="remover">×</button></li>
</ul>

<script>
  // um addEventListener no #lista, com closest para achar o botão e o li
</script>
`,
        tests: [
          {
            description: 'clicar no × do segundo item remove só ele',
            assertion: `
              document.querySelectorAll('#lista li')[1].querySelector('button').click();
              const textos = [...document.querySelectorAll('#lista li')].map((li) => li.firstChild.textContent.trim());
              if (textos.join(',') !== 'Comprar pão,Estudar') throw new Error('Esperava sobrar Comprar pão e Estudar; veio [' + textos.join(', ') + '].');
            `,
          },
          {
            description: 'um item criado depois também é removível — o ouvinte está no pai',
            assertion: `
              const li = document.createElement('li');
              li.textContent = 'Novo ';
              const b = document.createElement('button');
              b.dataset.acao = 'remover';
              b.textContent = '×';
              li.append(b);
              document.querySelector('#lista').append(li);
              b.click();
              if ([...document.querySelectorAll('#lista li')].some((x) => /Novo/.test(x.textContent))) throw new Error('O item criado depois não foi removido: o ouvinte precisa estar no #lista, não em cada botão.');
            `,
          },
          {
            description: 'clicar no texto do item não remove nada',
            assertion: `
              const antes = document.querySelectorAll('#lista li').length;
              document.querySelector('#lista li').click();
              if (document.querySelectorAll('#lista li').length !== antes) throw new Error('Clicar no li (fora do botão) não pode remover: confira o if (!botao) return.');
            `,
          },
          {
            description: 'há exatamente um ouvinte, no #lista',
            assertion: `
              for (const s of document.querySelectorAll('script')) {
                if (/__codeflow|new Function/.test(s.textContent)) continue;
                const n = (s.textContent.match(/addEventListener/g) || []).length;
                if (n !== 1) throw new Error('Um ouvinte só, no #lista. Encontrei ' + n + '.');
                if (!/closest/.test(s.textContent)) throw new Error('Use closest para achar o botão e o li a partir de evento.target.');
              }
            `,
            hidden: true,
          },
        ],
        hints: [
          'No ouvinte: `const botao = evento.target.closest("[data-acao]"); if (!botao) return;`.',
          'Depois: `botao.closest("li").remove()`.',
          "document.querySelector('#lista').addEventListener('click', (evento) => {\n  const botao = evento.target.closest('[data-acao=\"remover\"]');\n  if (!botao) return;\n  botao.closest('li').remove();\n});",
        ],
        solution: `<ul id="lista">
  <li>Comprar pão <button data-acao="remover">×</button></li>
  <li>Ligar para a Ana <button data-acao="remover">×</button></li>
  <li>Estudar <button data-acao="remover">×</button></li>
</ul>

<script>
  document.querySelector('#lista').addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-acao="remover"]');
    if (!botao) return;
    botao.closest('li').remove();
  });
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-15-lacuna-closest',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt: 'Complete o ouvinte delegado: ache o botão a partir do alvo, leia a ação e o id, e chame a função.',
        concepts: ['dom-delegacao'],
        difficulty: 'iniciante',
        tags: ['dom', 'delegacao'],
        template: `<ul id="lista">
  <li data-id="1">Pão <button data-acao="remover">×</button></li>
  <li data-id="2">Café <button data-acao="remover">×</button></li>
</ul>
<p id="log"></p>

<script>
  function remover(id) {
    document.querySelector('[data-id="' + id + '"]').remove();
    document.querySelector('#log').textContent = 'removido ' + id;
  }

  document.querySelector('#lista').addEventListener('click', (evento) => {
    const botao = evento.{{1}}.{{2}}('[data-acao]');
    if (!botao) return;
    const id = Number(botao.closest('li').{{3}}.id);
    if (botao.dataset.acao === 'remover') remover(id);
  });
</script>`,
        blanks: [
          { placeholder: 'onde nasceu', size: 6 },
          { placeholder: 'sobe até casar', size: 7 },
          { placeholder: 'os data-', size: 7 },
        ],
        tests: [
          {
            description: 'clicar no × do café remove o item 2',
            assertion: `
              document.querySelector('[data-id="2"] button').click();
              if (document.querySelector('[data-id="2"]')) throw new Error('O item 2 precisava ter sido removido.');
              if (document.querySelector('#log').textContent.trim() !== 'removido 2') throw new Error('remover(2) precisava ter sido chamada; o log diz "' + document.querySelector('#log').textContent + '".');
            `,
          },
        ],
        hints: [
          'O elemento onde o clique nasceu, e o método que sobe a árvore até casar com um seletor.',
          'Os atributos `data-` de um elemento ficam numa propriedade que você já usou.',
        ],
        solution: ['target', 'closest', 'dataset'],
        explanation:
          '`target` é o alvo exato — pode ser o botão ou algo dentro dele; `closest` sobe até o primeiro elemento com `data-acao`; `dataset` lê o `data-id` do `li`. Três palavras que aparecem em todo ouvinte delegado, sempre nessa ordem: achar, identificar, agir.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-15-ordenar-subida',
        type: 'order-steps',
        prompt:
          'Um clique no `×` dentro de `<ul id="lista"><li><button>×</button></li></ul>`, com o ouvinte no `ul`. Coloque na ordem.',
        concepts: ['dom-delegacao'],
        difficulty: 'intermediario',
        tags: ['dom', 'delegacao'],
        steps: [
          { id: 'nasce', text: 'O evento nasce no `button`: ele é o `target`', ordem: 1 },
          { id: 'li', text: 'O evento sobe para o `li`, que não tem ouvinte e deixa passar', ordem: 2 },
          { id: 'ul', text: 'Chega ao `ul`, que tem o ouvinte: o manipulador roda, com `currentTarget` sendo o `ul`', ordem: 3 },
          { id: 'closest', text: 'Dentro do manipulador, `evento.target.closest("[data-acao]")` acha o botão', ordem: 4 },
          { id: 'age', text: 'A ação é lida do `data-acao`, o id do `li`, e a função certa é chamada', ordem: 5 },
        ],
        explanation:
          'O evento passa por cada ancestral, e só quem tem ouvinte reage. É por isso que **um** ouvinte no `ul` basta para qualquer botão dentro dele, hoje ou amanhã; e é por isso que `target` e `currentTarget` são coisas diferentes — o primeiro é onde nasceu, o segundo é onde está sendo ouvido.',
        hints: [
          'O evento começa no elemento mais interno e vai subindo.',
          'O manipulador só roda quando o evento chega ao elemento que tem o ouvinte.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-15-acoes',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Duas ações num ouvinte só, no `#lista`: `data-acao="mais"` soma 1 à quantidade do item, `data-acao="menos"` subtrai 1 (nunca abaixo de 0). O estado está em `itens`; depois de mudar, chame `desenhar()`.',
        concepts: ['dom-delegacao'],
        difficulty: 'intermediario',
        tags: ['dom', 'delegacao'],
        initialCode: `<ul id="lista"></ul>

<script>
  let itens = [
    { id: 1, nome: 'Pão', quantidade: 1 },
    { id: 2, nome: 'Café', quantidade: 0 },
  ];

  function desenhar() {
    const ul = document.querySelector('#lista');
    ul.replaceChildren();
    for (const item of itens) {
      const li = document.createElement('li');
      li.dataset.id = item.id;
      li.textContent = item.nome + ': ' + item.quantidade + ' ';
      const menos = document.createElement('button');
      menos.dataset.acao = 'menos';
      menos.textContent = '−';
      const mais = document.createElement('button');
      mais.dataset.acao = 'mais';
      mais.textContent = '+';
      li.append(menos, mais);
      ul.append(li);
    }
  }

  // um ouvinte no #lista: mais / menos por data-acao, id pelo li, e desenhar()

  desenhar();
</script>
`,
        tests: [
          {
            description: '+ no pão leva a 2',
            assertion: `
              document.querySelector('[data-id="1"] [data-acao="mais"]').click();
              if (itens[0].quantidade !== 2) throw new Error('Depois de + no pão, itens[0].quantidade precisa ser 2; veio ' + itens[0].quantidade + '.');
              if (!/Pão: 2/.test(document.querySelector('[data-id="1"]').textContent)) throw new Error('A tela precisa ser redesenhada depois da mudança: chame desenhar().');
            `,
          },
          {
            description: '− no café não vai abaixo de 0',
            assertion: `
              document.querySelector('[data-id="2"] [data-acao="menos"]').click();
              if (itens[1].quantidade !== 0) throw new Error('O café estava em 0 e − não pode levar a negativo; veio ' + itens[1].quantidade + '.');
            `,
          },
          {
            description: 'os botões continuam funcionando depois de vários redesenhos',
            assertion: `
              for (let i = 0; i < 3; i++) document.querySelector('[data-id="2"] [data-acao="mais"]').click();
              document.querySelector('[data-id="2"] [data-acao="menos"]').click();
              if (itens[1].quantidade !== 2) throw new Error('Depois de +,+,+,− no café esperava 2; veio ' + itens[1].quantidade + '. Se parou de responder, o ouvinte estava nos botões que desenhar() recria — coloque no #lista.');
            `,
          },
        ],
        hints: [
          'Ache o botão com `closest("[data-acao]")` e o item com `itens.find(i => i.id === id)`.',
          'Um `if` por ação; no `menos`, `Math.max(0, …)`; no fim, `desenhar()`.',
          "document.querySelector('#lista').addEventListener('click', (evento) => {\n  const botao = evento.target.closest('[data-acao]');\n  if (!botao) return;\n  const id = Number(botao.closest('li').dataset.id);\n  const item = itens.find((i) => i.id === id);\n  if (botao.dataset.acao === 'mais') item.quantidade += 1;\n  if (botao.dataset.acao === 'menos') item.quantidade = Math.max(0, item.quantidade - 1);\n  desenhar();\n});",
        ],
        solution: `<ul id="lista"></ul>

<script>
  let itens = [
    { id: 1, nome: 'Pão', quantidade: 1 },
    { id: 2, nome: 'Café', quantidade: 0 },
  ];

  function desenhar() {
    const ul = document.querySelector('#lista');
    ul.replaceChildren();
    for (const item of itens) {
      const li = document.createElement('li');
      li.dataset.id = item.id;
      li.textContent = item.nome + ': ' + item.quantidade + ' ';
      const menos = document.createElement('button');
      menos.dataset.acao = 'menos';
      menos.textContent = '−';
      const mais = document.createElement('button');
      mais.dataset.acao = 'mais';
      mais.textContent = '+';
      li.append(menos, mais);
      ul.append(li);
    }
  }

  document.querySelector('#lista').addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-acao]');
    if (!botao) return;
    const id = Number(botao.closest('li').dataset.id);
    const item = itens.find((i) => i.id === id);
    if (botao.dataset.acao === 'mais') item.quantidade += 1;
    if (botao.dataset.acao === 'menos') item.quantidade = Math.max(0, item.quantidade - 1);
    desenhar();
  });

  desenhar();
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-15-target',
        type: 'multiple-choice',
        prompt:
          'O botão "remover" tem um ícone `<svg>` dentro. A pessoa clica exatamente no ícone. O que `evento.target` é, e como achar o botão?',
        concepts: ['dom-delegacao'],
        difficulty: 'intermediario',
        tags: ['dom', 'delegacao'],
        options: [
          'O botão; o navegador sempre entrega o elemento clicável',
          'O `<svg>`, onde o clique nasceu; `evento.target.closest("button")` sobe até o botão',
          'O `ul`, onde o ouvinte está',
          'Depende do navegador',
        ],
        correctIndex: 1,
        explanation:
          '`target` é o elemento mais interno sob o cursor — o ícone. Comparar `evento.target === botao` falharia justamente nos cliques certeiros. `closest` sobe do ícone até o botão (ou devolve `null`, se o clique foi fora). E o `ul` seria o `currentTarget`, não o `target`.',
        hints: ['Qual é o elemento mais interno debaixo do cursor nesse clique?'],
      },
    },
    {
      kind: 'summary',
      markdown: `Os eventos sobem pela árvore, então um ouvinte no pai recebe os cliques de todos os filhos — os de hoje e os de amanhã. Dentro dele: \`evento.target.closest(seletor)\` acha o elemento que interessa (ou \`null\`), \`data-acao\` diz o que fazer e \`data-id\` diz com quem. Combinado com \`desenhar\`, que recria os itens, é o único jeito de nenhum ouvinte se perder.`,
    },
  ],
};

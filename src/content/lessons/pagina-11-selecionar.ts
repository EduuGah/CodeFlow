import type { Lesson } from '../types';

export const lessonSelecionar: Lesson = {
  id: 'lesson-pagina-11',
  trackId: 'track-pagina',
  title: 'O DOM: A Página Viva',
  language: 'html',
  objective:
    'Entender que o HTML vira uma árvore de objetos que o JavaScript enxerga, e usar querySelector, textContent e dataset para ler e mudar a página.',
  concepts: ['dom'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Você escreveu HTML e CSS. Agora entra o JavaScript que você já sabe — e a primeira surpresa é que ele **não vê o HTML**. O que ele vê é o **DOM**: a árvore de objetos que o navegador monta a partir do HTML, e que continua existindo depois que o texto do arquivo foi lido. Mudar o DOM muda a tela, na hora. Mudar o arquivo não muda nada até recarregar.

## Cada tag vira um objeto

~~~html
<article id="post">
  <h1 class="titulo">Receita de pão</h1>
  <p>Farinha, água, sal e fermento.</p>
</article>
~~~

Para o JavaScript, isso é um objeto \`article\` que contém um \`h1\` e um \`p\`. Cada um tem propriedades — \`textContent\`, \`id\`, \`className\` — e métodos. A porta de entrada é \`document\`: o objeto que representa a página inteira.

## Encontrar um elemento

\`document.querySelector\` recebe um **seletor de CSS** — o mesmo que você usou nas aulas de estilo — e devolve o **primeiro** elemento que casa:

~~~js
const titulo = document.querySelector('.titulo');   // pela classe
const post   = document.querySelector('#post');     // pelo id
const p      = document.querySelector('article p'); // pelo contexto
~~~

Se nada casa, devolve \`null\` — e a próxima linha, \`titulo.textContent\`, quebra com o erro que você já viu na aula de erros: *Cannot read properties of null*. Quando isso acontecer, o seletor está errado ou o elemento ainda não existe (mais sobre isso abaixo).

\`querySelectorAll\` devolve **todos** os que casam, numa lista que aceita \`forEach\` e \`for...of\`:

~~~js
const itens = document.querySelectorAll('li');
for (const item of itens) {
  console.log(item.textContent);
}
console.log(itens.length);
~~~

## Ler e mudar o texto

\`textContent\` é o texto de dentro do elemento. Ler é ler; atribuir muda a tela:

~~~js
titulo.textContent = 'Receita de pão de fermentação natural';
~~~

Existe também \`innerHTML\`, que lê e escreve **HTML** em vez de texto. Ela tem um uso: montar um pedaço de página a partir de uma string que **você** escreveu. E tem um perigo: se a string veio de uma pessoa — um nome, um comentário —, qualquer \`<script>\` ou \`<img onerror>\` dentro dela **roda**. É a injeção da aula de segurança, do lado do navegador. A regra: texto de gente vai em \`textContent\`, sempre.

## Ler atributos

\`getAttribute('href')\` lê qualquer atributo. Para dados que você mesmo pôs no HTML, há o padrão \`data-\`:

~~~html
<button data-produto="pao" data-preco="8.5">Comprar</button>
~~~

~~~js
const botao = document.querySelector('button');
botao.dataset.produto;   // "pao"
Number(botao.dataset.preco);   // 8.5 — atributo é sempre texto; converta
~~~

## Quando o script roda

Um \`<script>\` roda **no momento em que o navegador chega nele**. Se ele está no \`<head>\`, o \`<body>\` ainda não existe, e todo \`querySelector\` devolve \`null\`. Duas soluções, escolha uma:

- **O script no fim do \`<body>\`** — o jeito mais simples, e o que os exercícios desta trilha usam.
- \`<script defer src="...">\` — o navegador baixa o arquivo enquanto lê o HTML e roda depois que a página está montada.

## Os erros

- \`querySelector\` com um seletor que não casa, e o \`null\` que quebra na linha seguinte. Confira o seletor no CSS antes.
- \`innerHTML\` com texto que veio de alguém.
- Script no \`<head>\` sem \`defer\`, procurando elementos que ainda não existem.
- Esquecer que \`dataset\` e \`getAttribute\` devolvem **texto**, e somar \`"8.5" + "2"\`.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<article id="post">
  <h1 class="titulo">Receita de pão</h1>
  <p>Farinha, água, sal e fermento.</p>
  <ul>
    <li data-preco="8.5">Pão</li>
    <li data-preco="4">Manteiga</li>
  </ul>
  <p id="total"></p>
</article>

<script>
  const titulo = document.querySelector('.titulo');
  titulo.textContent = titulo.textContent + ' (testada)';

  let total = 0;
  for (const item of document.querySelectorAll('li')) {
    total += Number(item.dataset.preco);
  }
  document.querySelector('#total').textContent = 'Total: R$ ' + total.toFixed(2);
</script>`,
      caption:
        'O script está no fim, depois de tudo que ele procura. `querySelector` acha pelo seletor de CSS; `textContent` lê e escreve texto; `dataset` lê os `data-` — como texto, daí o `Number()`. Nada de `innerHTML`.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-11-um-ou-todos',
        type: 'multiple-choice',
        prompt: 'Uma página tem três `<li>`. O que `document.querySelector("li")` devolve?',
        concepts: ['dom'],
        difficulty: 'iniciante',
        tags: ['dom', 'selecionar'],
        options: [
          'Uma lista com os três',
          'O primeiro `<li>` só',
          'O último `<li>`',
          '`null`, porque há mais de um',
        ],
        correctIndex: 1,
        explanation:
          '`querySelector` devolve **o primeiro** que casa — um elemento só. Para os três, é `querySelectorAll`, que devolve uma lista. A confusão entre os dois é a causa de muito `forEach is not a function` (chamou `forEach` num elemento) e de muito "só mudou o primeiro".',
        hints: ['O nome tem "All" ou não tem?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-11-preencher',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'No `<script>`, selecione o `#saudacao` e escreva nele o texto **Olá, Ana!**; depois conte quantos `<li>` a lista tem e escreva **N itens** no `#total` (com o número no lugar de N).\n\nUse `textContent`.',
        concepts: ['dom'],
        difficulty: 'iniciante',
        tags: ['dom', 'selecionar'],
        initialCode: `<h1 id="saudacao"></h1>

<ul>
  <li>Pão</li>
  <li>Manteiga</li>
  <li>Café</li>
</ul>

<p id="total"></p>

<script>
  // 1. selecione #saudacao e escreva "Olá, Ana!"

  // 2. conte os <li> e escreva "3 itens" em #total
</script>
`,
        tests: [
          {
            description: 'a saudação está no h1',
            assertion: `
              const h = document.querySelector('#saudacao');
              if (h.textContent.trim() !== 'Olá, Ana!') throw new Error('#saudacao precisa conter exatamente "Olá, Ana!", veio "' + h.textContent.trim() + '".');
            `,
          },
          {
            description: 'o total conta os itens da lista',
            assertion: `
              const t = document.querySelector('#total').textContent.trim();
              if (t !== '3 itens') throw new Error('#total precisa conter "3 itens", veio "' + t + '".');
            `,
          },
          {
            description: 'o número vem da lista, não de um 3 digitado',
            assertion: `
              const ul = document.querySelector('ul');
              const li = document.createElement('li');
              li.textContent = 'Leite';
              ul.appendChild(li);
              // Roda o script do aluno de novo com quatro itens.
              for (const s of document.querySelectorAll('script')) {
                if (/#total|total/.test(s.textContent) && !/__codeflow|new Function/.test(s.textContent)) new Function(s.textContent)();
              }
              const t = document.querySelector('#total').textContent.trim();
              if (t !== '4 itens') throw new Error('Com um quarto item na lista, #total precisa dizer "4 itens" — conte com querySelectorAll(...).length. Veio "' + t + '".');
            `,
            hidden: true,
          },
          {
            description: 'sem innerHTML',
            assertion: `
              for (const s of document.querySelectorAll('script')) {
                if (/__codeflow|new Function/.test(s.textContent)) continue;
                if (/innerHTML/.test(s.textContent)) throw new Error('Texto vai em textContent; innerHTML é para HTML que você mesmo escreveu, e aqui não há.');
              }
            `,
            hidden: true,
          },
        ],
        hints: [
          'Duas linhas para a saudação: selecionar, atribuir `textContent`.',
          '`document.querySelectorAll("li").length` é a contagem; junte com o texto usando `+`.',
          "document.querySelector('#saudacao').textContent = 'Olá, Ana!';\nconst quantos = document.querySelectorAll('li').length;\ndocument.querySelector('#total').textContent = quantos + ' itens';",
        ],
        solution: `<h1 id="saudacao"></h1>

<ul>
  <li>Pão</li>
  <li>Manteiga</li>
  <li>Café</li>
</ul>

<p id="total"></p>

<script>
  document.querySelector('#saudacao').textContent = 'Olá, Ana!';

  const quantos = document.querySelectorAll('li').length;
  document.querySelector('#total').textContent = quantos + ' itens';
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-11-lacuna-todos',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt:
          'Complete: selecione **todos** os itens, percorra a lista, e escreva o texto de cada um em maiúsculas.',
        concepts: ['dom'],
        difficulty: 'iniciante',
        tags: ['dom', 'selecionar'],
        template: `<ul>
  <li>pão</li>
  <li>manteiga</li>
  <li>café</li>
</ul>

<script>
  const itens = document.{{1}}('li');

  for (const item of itens) {
    item.{{2}} = item.{{2}}.{{3}}();
  }
</script>`,
        blanks: [
          { placeholder: 'método', size: 16 },
          { placeholder: 'propriedade', size: 11 },
          { placeholder: 'método', size: 11 },
        ],
        tests: [
          {
            description: 'os três itens ficaram em maiúsculas',
            assertion: `
              const textos = [...document.querySelectorAll('li')].map((li) => li.textContent.trim());
              if (textos.join(',') !== 'PÃO,MANTEIGA,CAFÉ') throw new Error('Esperava PÃO, MANTEIGA e CAFÉ; veio ' + textos.join(', ') + '. Todos precisam mudar, não só o primeiro.');
            `,
          },
        ],
        hints: [
          'Um item só seria `querySelector`; todos é o método com "All" no nome.',
          'A propriedade que lê e escreve o texto de dentro de um elemento apareceu na aula inteira; maiúsculas é o método de string que você já conhece.',
        ],
        solution: ['querySelectorAll', 'textContent', 'toUpperCase'],
        explanation:
          '`querySelectorAll` devolve a lista; `for...of` percorre; `textContent` lê e escreve o texto de cada um. Repare que `toUpperCase` é o mesmo método de string da trilha de JavaScript — o DOM não tem métodos novos para texto, ele entrega strings comuns.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-11-ordenar-carga',
        type: 'order-steps',
        prompt:
          'Do arquivo HTML ao texto mudado na tela. Coloque na ordem o que o navegador faz.',
        concepts: ['dom'],
        difficulty: 'iniciante',
        tags: ['dom'],
        steps: [
          { id: 'le', text: 'Lê o HTML de cima para baixo e monta a árvore de objetos — o DOM', ordem: 1 },
          { id: 'script', text: 'Chega no `<script>` no fim do `<body>` e roda o código, com a árvore já montada', ordem: 2 },
          { id: 'acha', text: '`querySelector` procura na árvore e devolve o objeto do elemento', ordem: 3 },
          { id: 'muda', text: 'A atribuição a `textContent` muda o objeto', ordem: 4 },
          { id: 'pinta', text: 'O navegador repinta a tela a partir da árvore alterada', ordem: 5 },
        ],
        explanation:
          'O passo que explica o `null` mais comum do DOM é o segundo: o script roda **quando o navegador chega nele**. No fim do `body`, a árvore está pronta; no `head`, ainda não existe nada para achar. E o último passo diz por que mudar o DOM muda a tela sem recarregar — a tela é sempre pintada a partir da árvore.',
        hints: [
          'Antes de qualquer script rodar, o navegador precisa ter construído alguma coisa.',
          'Achar vem antes de mudar; mudar vem antes de mostrar.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-11-dataset',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Cada `<li>` tem o preço num atributo `data-preco`. Some todos e escreva **Total: R$ 12.50** no `#total` — com duas casas decimais, via `toFixed(2)`.\n\nLembre: atributo é texto.',
        concepts: ['dom'],
        difficulty: 'intermediario',
        tags: ['dom', 'selecionar'],
        initialCode: `<ul>
  <li data-preco="8.5">Pão</li>
  <li data-preco="4">Manteiga</li>
</ul>

<p id="total"></p>

<script>
  // some os data-preco e escreva "Total: R$ 12.50" em #total
</script>
`,
        tests: [
          {
            description: 'o total está certo, com duas casas',
            assertion: `
              const t = document.querySelector('#total').textContent.trim();
              if (t !== 'Total: R$ 12.50') throw new Error('Esperava "Total: R$ 12.50", veio "' + t + '". Se veio "8.54", os preços foram colados como texto: converta com Number().');
            `,
          },
          {
            description: 'o total vem dos atributos, não de um número digitado',
            assertion: `
              document.querySelector('li').dataset.preco = '10';
              for (const s of document.querySelectorAll('script')) {
                if (/__codeflow|new Function/.test(s.textContent)) continue;
                new Function(s.textContent)();
              }
              const t = document.querySelector('#total').textContent.trim();
              if (t !== 'Total: R$ 14.00') throw new Error('Com o pão a 10, o total precisa ser R$ 14.00 — leia os data-preco com dataset. Veio "' + t + '".');
            `,
            hidden: true,
          },
        ],
        hints: [
          '`item.dataset.preco` lê o atributo `data-preco` — como texto.',
          'Some com `Number()` em cada um; depois `total.toFixed(2)` para as duas casas.',
          "let total = 0;\nfor (const item of document.querySelectorAll('li')) {\n  total += Number(item.dataset.preco);\n}\ndocument.querySelector('#total').textContent = 'Total: R$ ' + total.toFixed(2);",
        ],
        solution: `<ul>
  <li data-preco="8.5">Pão</li>
  <li data-preco="4">Manteiga</li>
</ul>

<p id="total"></p>

<script>
  let total = 0;
  for (const item of document.querySelectorAll('li')) {
    total += Number(item.dataset.preco);
  }
  document.querySelector('#total').textContent = 'Total: R$ ' + total.toFixed(2);
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-11-innerhtml',
        type: 'multiple-choice',
        prompt:
          'O nome do usuário vem de um campo de formulário e vai aparecer num `<p>`. Qual linha é segura?',
        concepts: ['dom', 'seguranca-web'],
        difficulty: 'intermediario',
        tags: ['dom', 'seguranca'],
        options: [
          '`p.innerHTML = nome`',
          '`p.innerHTML = "<strong>" + nome + "</strong>"`',
          '`p.textContent = nome`',
          'Tanto faz: o navegador escapa sozinho',
        ],
        correctIndex: 2,
        explanation:
          '`innerHTML` interpreta a string como HTML. Se o "nome" for `<img src=x onerror="…">`, isso roda — no navegador de **outra** pessoa, se o nome for salvo e mostrado depois. `textContent` escreve a string como texto, tags inclusive, sem interpretar nada. O negrito do segundo caso se faz com um `<strong>` criado por você e o nome em `textContent` dentro dele.',
        hints: ['Qual das duas propriedades trata a string como texto e qual trata como HTML?'],
      },
    },
    {
      kind: 'summary',
      markdown: `O JavaScript não vê o HTML: vê o DOM, a árvore de objetos que o navegador montou. \`document.querySelector\` acha o primeiro elemento por um seletor de CSS; \`querySelectorAll\` acha todos. \`textContent\` lê e escreve texto — e é sempre ele para texto que veio de gente; \`innerHTML\` só para HTML seu. \`dataset\` lê os \`data-\`, como texto. E o script no fim do \`body\`, para a árvore já existir quando ele procurar.`,
    },
  ],
};

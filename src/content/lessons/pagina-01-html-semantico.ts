import type { Lesson } from '../types';

export const lessonHtmlSemantico: Lesson = {
  id: 'lesson-pagina-1',
  trackId: 'track-pagina',
  title: 'HTML Semântico: A Página que se Explica',
  language: 'html',
  objective:
    'Escrever a estrutura de uma página com as tags que dizem o que cada parte é — e entender por que isso importa mais do que a aparência.',
  concepts: ['html'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Tudo o que você fez até aqui rodou num console. A partir desta aula, o seu código vira **uma página** — e a primeira coisa a entender é que HTML não descreve como a página **parece**. Descreve o que cada pedaço dela **é**.

Um documento HTML é feito de **elementos**. Cada elemento tem uma tag de abertura, um conteúdo e uma tag de fechamento:

~~~html
<p>Este é um parágrafo.</p>
~~~

O \`p\` não diz "texto em fonte de 16 pixels com espaço embaixo". Diz **"isto é um parágrafo"**. O navegador, o leitor de tela de uma pessoa cega, o buscador que indexa a página e o seu próprio CSS de amanhã — todos leem essa palavra e sabem o que fazer com ela.

## O esqueleto

Toda página tem a mesma armação:

~~~html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <title>Minha página</title>
  </head>
  <body>
    <!-- o que aparece na tela fica aqui -->
  </body>
</html>
~~~

\`head\` é o que a página **sabe sobre si**: o título que vai na aba, a codificação, o idioma no \`lang\` — que é o que faz um leitor de tela pronunciar português em vez de inglês. \`body\` é o que **aparece**. Nos exercícios desta trilha você escreve o conteúdo do \`body\`; a armação já vem montada.

## As partes de uma página têm nome

Uma página comum tem um cabeçalho com o logotipo e o menu, uma área principal, talvez uma coluna lateral, e um rodapé. HTML tem uma tag para cada uma dessas partes:

| Tag | O que é |
| --- | --- |
| \`<header>\` | O cabeçalho: logotipo, título do site, menu |
| \`<nav>\` | Um grupo de links de navegação |
| \`<main>\` | O conteúdo principal — **um só por página** |
| \`<article>\` | Um conteúdo que faz sentido sozinho: um post, uma notícia, um produto |
| \`<section>\` | Uma seção temática, normalmente com um título próprio |
| \`<aside>\` | Conteúdo relacionado mas à parte: uma barra lateral, um "veja também" |
| \`<footer>\` | O rodapé: créditos, contato, links secundários |

Chamam-se **elementos semânticos** porque carregam significado. Um leitor de tela permite pular direto para o \`main\`; um buscador entende que o \`article\` é o assunto da página e o \`aside\` não; e o seu CSS pode dizer "o título dentro de \`article\`" sem precisar inventar uma classe.

## Títulos são uma hierarquia, não um tamanho

\`h1\` até \`h6\` são níveis de título, como os capítulos e seções de um livro. A regra é simples: **um \`h1\` por página**, que é o assunto dela; \`h2\` para as seções; \`h3\` para as subseções de uma seção. Nunca pule níveis, e nunca escolha um \`h3\` "porque a fonte fica do tamanho certo" — tamanho é trabalho do CSS, e um leitor de tela que lista os títulos da página para navegar precisa que a hierarquia faça sentido.

## A sopa de div

O erro mais comum de quem começa é este:

~~~html
<div class="cabecalho">
  <div class="menu">...</div>
</div>
<div class="conteudo">
  <div class="titulo">Receita de pão</div>
  <div class="texto">...</div>
</div>
~~~

Funciona? Aparece na tela. Mas para todo mundo que não é um olho humano — leitor de tela, buscador, o seu próprio código daqui a um mês — essa página é uma pilha de caixas sem nome. \`div\` e \`span\` existem para quando **nenhuma** tag semântica serve: são o último recurso, não o primeiro.

Compare com a mesma página dita com as palavras certas:

~~~html
<header>
  <nav>...</nav>
</header>
<main>
  <article>
    <h1>Receita de pão</h1>
    <p>...</p>
  </article>
</main>
~~~

Mesma tela. Só que agora a página **se explica**.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<main>
  <article>
    <h1>Receita de pão</h1>
    <p>Farinha, água, sal e fermento. O resto é tempo.</p>

    <section>
      <h2>Ingredientes</h2>
      <ul>
        <li>500 g de farinha</li>
        <li>350 ml de água</li>
      </ul>
    </section>

    <section>
      <h2>Modo de preparo</h2>
      <ol>
        <li>Misture tudo.</li>
        <li>Espere crescer.</li>
      </ol>
    </section>
  </article>
</main>`,
      caption:
        'Um artigo com duas seções. Repare na hierarquia: um `h1` para o assunto, um `h2` para cada seção — e listas com `ul` (sem ordem) e `ol` (com ordem), porque "ingredientes" é um conjunto e "modo de preparo" é uma sequência.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-1-titulo',
        type: 'multiple-choice',
        prompt:
          'Você quer que "Receita de pão" seja o título principal da página. Qual é a marcação certa?',
        concepts: ['html'],
        difficulty: 'iniciante',
        tags: ['html', 'semantica'],
        options: [
          '<b>Receita de pão</b>',
          '<h1>Receita de pão</h1>',
          '<div class="titulo">Receita de pão</div>',
          '<strong>Receita de pão</strong>',
        ],
        correctIndex: 1,
        explanation:
          '`h1` diz **o que o texto é**: o título principal. `b` e `strong` dizem "negrito" e "importante" — são ênfase dentro de um texto, não um título. E `div` com classe só diz "uma caixa": o nome `titulo` é para você, o navegador não lê classes como significado. Um leitor de tela que lista os títulos da página acha o `h1`; não acha nenhuma das outras três.',
        hints: [
          'Pense em quem lê a página sem ver a tela. Qual dessas quatro opções diz "título"?',
          'Negrito é aparência. Título é papel.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-1-artigo',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Escreva um artigo: um `<article>` contendo um `<h1>` com o texto exato **Receita de pão** e ao menos um `<p>` com uma frase.\n\nA armação da página (`html`, `head`, `body`) já está montada; você escreve só o conteúdo.',
        concepts: ['html'],
        difficulty: 'iniciante',
        tags: ['html', 'semantica'],
        initialCode: `<!-- Escreva o artigo aqui -->
`,
        tests: [
          {
            description: 'há um <article> envolvendo o conteúdo',
            assertion: `if (!document.querySelector('article')) throw new Error('A página precisa de um <article> envolvendo o conteúdo.');`,
          },
          {
            description: 'o título é um <h1> dentro do <article>, com o texto certo',
            assertion: `
              const h = document.querySelector('article h1');
              if (!h) throw new Error('Falta um <h1> dentro do <article>.');
              if (h.textContent.trim() !== 'Receita de pão') throw new Error('O texto do <h1> precisa ser exatamente "Receita de pão", veio "' + h.textContent.trim() + '".');
            `,
          },
          {
            description: 'há um parágrafo com uma frase dentro do <article>',
            assertion: `
              const p = document.querySelector('article p');
              if (!p || p.textContent.trim().length < 10) throw new Error('Falta um <p> com pelo menos uma frase dentro do <article>.');
            `,
          },
          {
            description: 'a página tem um título principal só',
            assertion: `if (document.querySelectorAll('h1').length !== 1) throw new Error('Uma página tem um título principal só: exatamente um <h1>. Aqui há ' + document.querySelectorAll('h1').length + '.');`,
            hidden: true,
          },
        ],
        hints: [
          'Três elementos, um dentro do outro: o artigo envolve o título e o parágrafo.',
          'Toda tag que abre fecha: `<article>` ... `</article>`.',
          '<article>\n  <h1>Receita de pão</h1>\n  <p>Farinha, água, sal e fermento.</p>\n</article>',
        ],
        solution: `<article>
  <h1>Receita de pão</h1>
  <p>Farinha, água, sal e fermento. O resto é tempo.</p>
</article>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-1-lacuna-marcos',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt:
          'Complete as tags das três partes da página. Cada lacuna aparece duas vezes — na abertura e no fechamento — e recebe o mesmo nome.',
        concepts: ['html'],
        difficulty: 'iniciante',
        tags: ['html', 'semantica'],
        template: `<{{1}}>
  <nav>
    <a href="#inicio">Início</a>
    <a href="#contato">Contato</a>
  </nav>
</{{1}}>

<{{2}}>
  <h1>Bem-vindo</h1>
  <p>O conteúdo principal da página fica aqui.</p>
</{{2}}>

<{{3}}>
  <p>Feito com cuidado em 2026.</p>
</{{3}}>`,
        blanks: [
          { placeholder: 'cabeçalho', size: 8 },
          { placeholder: 'principal', size: 8 },
          { placeholder: 'rodapé', size: 8 },
        ],
        tests: [
          {
            description: 'o menu está dentro de um <header>',
            assertion: `if (!document.querySelector('header > nav')) throw new Error('O <nav> precisa estar dentro de um <header>: é o cabeçalho da página.');`,
          },
          {
            description: 'o conteúdo principal está num <main>',
            assertion: `if (!document.querySelector('main > h1')) throw new Error('O <h1> e o parágrafo principal precisam estar dentro de um <main>.');`,
          },
          {
            description: 'o crédito está num <footer>',
            assertion: `if (!document.querySelector('footer > p')) throw new Error('O crédito do fim da página fica num <footer>.');`,
          },
          {
            description: 'nada de div no lugar das partes com nome',
            assertion: `if (document.querySelector('div')) throw new Error('Cada uma dessas partes tem uma tag própria; <div> é o último recurso, não o primeiro.');`,
            hidden: true,
          },
        ],
        hints: [
          'As três partes são: o cabeçalho com o menu, o conteúdo principal, e o rodapé. Cada uma tem uma tag na tabela da aula.',
          'Escreva só o nome da tag, sem os sinais de menor e maior — eles já estão no molde.',
        ],
        solution: ['header', 'main', 'footer'],
        explanation:
          '`header`, `main` e `footer` nomeiam as três regiões que quase toda página tem. Com elas, um leitor de tela oferece "ir para o conteúdo principal" sem que você programe nada, e o CSS pode estilizar o rodapé sem precisar de uma classe `rodape`. As mesmas três regiões feitas com `div` apareceriam iguais na tela — e seriam invisíveis para todo o resto.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-1-ordenar-aninhamento',
        type: 'order-steps',
        prompt:
          'Uma página de notícia, de fora para dentro. Coloque os elementos na ordem em que um envolve o outro — o primeiro é o mais externo.',
        concepts: ['html'],
        difficulty: 'iniciante',
        tags: ['html', 'semantica'],
        steps: [
          { id: 'html', text: '`<html>`: o documento inteiro', ordem: 1 },
          { id: 'body', text: '`<body>`: tudo o que aparece na tela', ordem: 2 },
          { id: 'main', text: '`<main>`: o conteúdo principal da página', ordem: 3 },
          { id: 'article', text: '`<article>`: a notícia, que faz sentido sozinha', ordem: 4 },
          { id: 'h1', text: '`<h1>`: o título da notícia', ordem: 5 },
        ],
        explanation:
          'HTML é uma árvore: cada elemento fica dentro de outro, e a posição diz o papel. O `h1` dentro do `article` é o título **daquela notícia**; o mesmo `h1` solto no `body` seria o título da página inteira. É por isso que a ordem de aninhamento não é detalhe de formatação — é o que dá sentido a cada tag.',
        hints: [
          'Comece pelo que contém tudo, e vá entrando.',
          'Um título pertence ao artigo, e o artigo pertence ao conteúdo principal.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-1-pagina-inteira',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Monte a estrutura de uma página de blog com as quatro regiões — `header` com um `nav` dentro, `main`, `aside` e `footer` — e, dentro do `main`, um `article` com o `h1` **Meu blog** e uma `section` com um `h2`.\n\nO conteúdo de texto é livre; a estrutura, não.',
        concepts: ['html'],
        difficulty: 'intermediario',
        tags: ['html', 'semantica'],
        initialCode: `<header>
  <!-- o menu fica aqui -->
</header>

<!-- continue a página -->
`,
        tests: [
          {
            description: 'o cabeçalho tem um menu de navegação',
            assertion: `if (!document.querySelector('header nav')) throw new Error('Falta um <nav> dentro do <header>.');`,
          },
          {
            description: 'há um <main>, e só um',
            assertion: `const n = document.querySelectorAll('main').length; if (n !== 1) throw new Error('A página precisa de exatamente um <main>; há ' + n + '.');`,
          },
          {
            description: 'o artigo está no <main>, com o h1 "Meu blog"',
            assertion: `
              const h = document.querySelector('main article h1');
              if (!h) throw new Error('Falta um <article> dentro do <main>, com um <h1> dentro dele.');
              if (h.textContent.trim() !== 'Meu blog') throw new Error('O <h1> precisa dizer "Meu blog", veio "' + h.textContent.trim() + '".');
            `,
          },
          {
            description: 'o artigo tem uma seção com título de segundo nível',
            assertion: `if (!document.querySelector('main article section h2')) throw new Error('Falta uma <section> com um <h2> dentro do <article>.');`,
          },
          {
            description: 'há um <aside> e um <footer>',
            assertion: `if (!document.querySelector('aside')) throw new Error('Falta o <aside>.'); if (!document.querySelector('footer')) throw new Error('Falta o <footer>.');`,
          },
          {
            description: 'a hierarquia de títulos não pula do h1 para o h3',
            assertion: `if (document.querySelector('h3') && !document.querySelector('h2')) throw new Error('Há um <h3> sem nenhum <h2> antes: os níveis de título não pulam.');`,
            hidden: true,
          },
          {
            description: 'nenhuma região foi feita com <div>',
            assertion: `if (document.querySelector('div')) throw new Error('Todas as regiões desta página têm tag própria; não use <div> aqui.');`,
            hidden: true,
          },
        ],
        hints: [
          'Quatro regiões irmãs, uma embaixo da outra: cabeçalho, principal, lateral, rodapé.',
          'Dentro do `main` vai o `article`; dentro do `article`, o `h1` e depois a `section` com o `h2`.',
          '<header>\n  <nav><a href="#">Início</a></nav>\n</header>\n<main>\n  <article>\n    <h1>Meu blog</h1>\n    <section>\n      <h2>Primeiro post</h2>\n      <p>Olá.</p>\n    </section>\n  </article>\n</main>\n<aside>\n  <p>Sobre mim</p>\n</aside>\n<footer>\n  <p>2026</p>\n</footer>',
        ],
        solution: `<header>
  <nav>
    <a href="#inicio">Início</a>
    <a href="#sobre">Sobre</a>
  </nav>
</header>

<main>
  <article>
    <h1>Meu blog</h1>
    <section>
      <h2>Primeiro post</h2>
      <p>Hoje comecei a escrever aqui.</p>
    </section>
  </article>
</main>

<aside>
  <p>Sobre mim: escrevo sobre o que estou aprendendo.</p>
</aside>

<footer>
  <p>Feito à mão em 2026.</p>
</footer>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-1-div',
        type: 'multiple-choice',
        prompt: 'Quando `<div>` é a escolha certa?',
        concepts: ['html'],
        difficulty: 'iniciante',
        tags: ['html', 'semantica'],
        options: [
          'Sempre: é a tag mais flexível, e as classes dizem o resto',
          'Para o cabeçalho e o rodapé, que não têm tag própria',
          'Quando nenhuma tag com significado serve — por exemplo, uma caixa só para agrupar e estilizar',
          'Nunca: toda parte de uma página tem uma tag semântica',
        ],
        correctIndex: 2,
        explanation:
          '`div` é a caixa sem significado, e há casos legítimos para ela: agrupar dois elementos para posicioná-los juntos, criar um fundo, um contêiner de layout. O erro não é usar `div`; é usá-la **no lugar** de uma tag que existe. Cabeçalho e rodapé têm tag própria (`header`, `footer`) — e "sempre" é justamente a sopa de div.',
        hints: ['Releia a frase da aula sobre "último recurso".'],
      },
    },
    {
      kind: 'summary',
      markdown: `HTML descreve o que cada parte da página **é**, não como ela parece. \`header\`, \`nav\`, \`main\`, \`article\`, \`section\`, \`aside\` e \`footer\` nomeiam as regiões; \`h1\` a \`h6\` formam uma hierarquia com um único \`h1\`; e \`div\` fica para quando nenhuma dessas serve. Uma página escrita assim se explica para quem não a vê — leitores de tela, buscadores e o seu CSS de amanhã.`,
    },
  ],
};

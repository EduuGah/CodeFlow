import type { Lesson } from '../types';

export const lessonCaixa: Lesson = {
  id: 'lesson-pagina-2',
  trackId: 'track-pagina',
  title: 'A Caixa: Como o CSS Mede Cada Elemento',
  language: 'html',
  objective:
    'Entender que todo elemento é uma caixa com quatro camadas, prever a largura que ela vai ocupar, e usar box-sizing para a conta bater.',
  concepts: ['css-caixa'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Na aula passada você escreveu o que cada parte da página **é**. Agora entra o CSS, que diz como cada parte **se apresenta** — e a primeira coisa que ele precisa saber é o tamanho de cada coisa.

Uma regra de CSS tem três partes: um **seletor** (quem), uma **propriedade** (o quê) e um **valor** (quanto):

~~~css
p {
  color: #1f6660;
}
~~~

Isto se lê "todo \`p\` tem a cor \`#1f6660\`". Dentro de uma página, as regras ficam num \`<style>\` — e é assim que os exercícios desta trilha funcionam: HTML e CSS no mesmo arquivo.

## Todo elemento é uma caixa

Não importa se é um parágrafo, uma imagem ou um botão: para o navegador, cada elemento é um retângulo com **quatro camadas**, de dentro para fora:

1. **Conteúdo** — o texto ou a imagem em si. É o que \`width\` e \`height\` medem, por padrão.
2. **\`padding\`** — o espaço interno, entre o conteúdo e a borda. Tem a cor de fundo do elemento.
3. **\`border\`** — a linha em volta. Tem espessura, estilo e cor: \`2px solid #333\`.
4. **\`margin\`** — o espaço externo, entre esta caixa e as vizinhas. É transparente.

~~~css
.cartao {
  width: 200px;
  padding: 16px;
  border: 2px solid #333;
  margin: 8px;
}
~~~

Pergunta: quanto essa caixa ocupa de largura na tela? A resposta intuitiva é 200. A resposta certa é **236**: 200 de conteúdo, mais 16 de cada lado de \`padding\`, mais 2 de cada lado de borda. A margem não entra na conta da caixa — mas entra na conta do espaço que ela pede aos vizinhos.

## box-sizing: a conta que bate

Esse comportamento — \`width\` medir só o conteúdo — se chama \`content-box\`, e é o padrão por motivos históricos. Quase ninguém quer isso: quando você escreve \`width: 200px\`, quer uma caixa de 200 pixels.

\`box-sizing: border-box\` muda a régua: \`width\` passa a medir **do lado de fora da borda**, e o padding e a borda ficam **dentro** dos 200. A regra que quase todo projeto começa é esta:

~~~css
* {
  box-sizing: border-box;
}
~~~

Com ela, uma caixa de \`width: 200px\` ocupa 200 pixels, com qualquer padding. Os exercícios desta aula usam \`border-box\`, e é o que você deve usar sempre.

## Bloco e linha

Nem toda caixa se comporta igual. Há dois jeitos de ocupar espaço:

- **\`display: block\`** — a caixa ocupa a linha inteira e empurra o que vem depois para baixo. \`p\`, \`h1\`, \`div\`, \`section\` são assim por padrão. Aceita \`width\`, \`height\`, e margens em todas as direções.
- **\`display: inline\`** — a caixa fica no fluxo do texto, lado a lado com as palavras. \`a\`, \`span\`, \`strong\` são assim. **Ignora \`width\` e \`height\`**, e a margem vertical não afasta as linhas.

Há um terceiro, que junta o melhor dos dois: **\`inline-block\`** fica lado a lado como o texto, mas aceita largura, altura e padding como um bloco. É o jeito clássico de transformar links de menu em "botões".

## O que dá errado

Três coisas que todo mundo faz nas primeiras semanas:

- **Dar \`width\` a um \`span\` e nada acontecer.** Elemento inline ignora largura. Ou troque o \`display\`, ou use um elemento de bloco.
- **A largura sair maior do que o número que você escreveu.** É o \`content-box\`. Ative \`border-box\`.
- **Dois parágrafos com \`margin: 20px\` ficarem a 20 de distância, e não 40.** Margens verticais de blocos vizinhos **se fundem**: vale a maior, não a soma. Não é bug — é a regra, e ela existe para textos ficarem com espaçamento regular.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  * {
    box-sizing: border-box;
  }

  .cartao {
    width: 240px;
    padding: 16px;
    border: 1px solid #cbd5d1;
    margin: 8px;
    background: #ffffff;
  }

  nav a {
    display: inline-block;
    padding: 8px 12px;
  }
</style>

<nav>
  <a href="#">Início</a>
  <a href="#">Sobre</a>
</nav>

<div class="cartao">
  <h2>Uma caixa de 240 pixels</h2>
  <p>Com border-box, o padding e a borda ficam dentro dos 240.</p>
</div>`,
      caption:
        'A regra `*` no topo vale para todos os elementos. O cartão ocupa exatamente 240 pixels de largura; os links do menu viraram alvos de toque com `inline-block` e `padding` — um `a` comum ignoraria o padding vertical.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-2-largura',
        type: 'multiple-choice',
        prompt:
          'Sem nenhuma regra de `box-sizing`, quanto ocupa de largura uma caixa com `width: 200px; padding: 20px; border: 5px solid;`?',
        concepts: ['css-caixa'],
        difficulty: 'iniciante',
        tags: ['css', 'caixa'],
        options: ['200px', '225px', '250px', '300px'],
        correctIndex: 2,
        explanation:
          'No padrão (`content-box`), `width` mede só o conteúdo. Padding e borda entram **dos dois lados**: 200 + 20 + 20 + 5 + 5 = 250. A margem não entra na largura da caixa. Com `box-sizing: border-box` a resposta seria 200 — que é o que quase sempre se quer.',
        hints: [
          'Padding e borda existem à esquerda **e** à direita.',
          'Some: conteúdo + 2 × padding + 2 × borda.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-2-ordenar-camadas',
        type: 'order-steps',
        prompt:
          'As quatro camadas de uma caixa, de dentro para fora. O primeiro é o mais interno.',
        concepts: ['css-caixa'],
        difficulty: 'iniciante',
        tags: ['css', 'caixa'],
        steps: [
          { id: 'conteudo', text: 'Conteúdo: o texto ou a imagem, o que `width` mede por padrão', ordem: 1 },
          { id: 'padding', text: '`padding`: o espaço interno, com a cor de fundo do elemento', ordem: 2 },
          { id: 'border', text: '`border`: a linha em volta, com espessura, estilo e cor', ordem: 3 },
          { id: 'margin', text: '`margin`: o espaço externo, transparente, entre esta caixa e as vizinhas', ordem: 4 },
        ],
        explanation:
          'A ordem importa para duas coisas. A cor de fundo vai até a borda — pinta o padding, não a margem. E a conta da largura, no `content-box`, soma de dentro para fora: conteúdo, padding, borda; a margem fica de fora da caixa e só afasta os vizinhos.',
        hints: [
          'O fundo do elemento pinta quais camadas? Isso diz o que está dentro e o que está fora.',
          'A borda separa o que é da caixa do que é espaço entre caixas.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-2-cartao',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Estilize o cartão. A regra `.cartao` precisa ter: `width` de **240px**, `padding` de **16px**, uma borda de **1px** sólida, e `box-sizing: border-box` — para a caixa ocupar exatamente 240 pixels.\n\nO HTML já está pronto; escreva só o CSS dentro do `<style>`.',
        concepts: ['css-caixa'],
        difficulty: 'iniciante',
        tags: ['css', 'caixa'],
        initialCode: `<style>
  .cartao {
    /* escreva as propriedades aqui */
  }
</style>

<div class="cartao">
  <h2>Meu cartão</h2>
  <p>Uma caixa com padding, borda e largura definida.</p>
</div>
`,
        tests: [
          {
            description: 'o cartão tem largura de 240px',
            assertion: `
              const c = document.querySelector('.cartao');
              if (!c) throw new Error('O elemento .cartao sumiu do HTML.');
              const w = getComputedStyle(c).width;
              if (w !== '240px') throw new Error('Esperava width de 240px, veio ' + w + '.');
            `,
          },
          {
            description: 'o padding é de 16px nos quatro lados',
            assertion: `
              const s = getComputedStyle(document.querySelector('.cartao'));
              for (const lado of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) {
                if (s[lado] !== '16px') throw new Error('Esperava padding de 16px em todos os lados; ' + lado + ' está em ' + s[lado] + '.');
              }
            `,
          },
          {
            description: 'há uma borda sólida de 1px',
            assertion: `
              const s = getComputedStyle(document.querySelector('.cartao'));
              if (s.borderLeftWidth !== '1px' || s.borderLeftStyle !== 'solid') throw new Error('Esperava uma borda de 1px sólida (border: 1px solid <cor>), veio ' + s.borderLeftWidth + ' ' + s.borderLeftStyle + '.');
            `,
          },
          {
            description: 'a régua é border-box, então os 240px incluem padding e borda',
            assertion: `
              const s = getComputedStyle(document.querySelector('.cartao'));
              if (s.boxSizing !== 'border-box') throw new Error('Sem box-sizing: border-box, a caixa ocuparia 274px (240 + 32 de padding + 2 de borda).');
            `,
          },
        ],
        hints: [
          'Quatro propriedades, uma por linha, cada uma terminando em ponto e vírgula.',
          'A borda precisa de três valores: espessura, estilo e cor — `1px solid #cccccc`.',
          '.cartao {\n  width: 240px;\n  padding: 16px;\n  border: 1px solid #cccccc;\n  box-sizing: border-box;\n}',
        ],
        solution: `<style>
  .cartao {
    width: 240px;
    padding: 16px;
    border: 1px solid #cccccc;
    box-sizing: border-box;
  }
</style>

<div class="cartao">
  <h2>Meu cartão</h2>
  <p>Uma caixa com padding, borda e largura definida.</p>
</div>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-2-lacuna-regra',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt:
          'Complete a regra que todo projeto começa, e a caixa do aviso. As lacunas são nomes de propriedade ou de valor.',
        concepts: ['css-caixa'],
        difficulty: 'iniciante',
        tags: ['css', 'caixa'],
        template: `<style>
  * {
    box-sizing: {{1}};
  }

  .aviso {
    {{2}}: 12px;
    {{3}}: 2px dashed #b45309;
    margin: 16px;
  }
</style>

<p class="aviso">Este aviso tem espaço interno, uma borda tracejada e espaço externo.</p>`,
        blanks: [
          { placeholder: 'régua', size: 10 },
          { placeholder: 'espaço interno', size: 8 },
          { placeholder: 'a linha', size: 7 },
        ],
        tests: [
          {
            description: 'a régua de todos os elementos é border-box',
            assertion: `if (getComputedStyle(document.querySelector('.aviso')).boxSizing !== 'border-box') throw new Error('O valor de box-sizing que faz width medir do lado de fora da borda é border-box.');`,
          },
          {
            description: 'o aviso tem 12px de espaço interno',
            assertion: `const s = getComputedStyle(document.querySelector('.aviso')); if (s.paddingLeft !== '12px') throw new Error('O espaço interno, entre o texto e a borda, é o padding. Veio ' + s.paddingLeft + '.');`,
          },
          {
            description: 'o aviso tem uma borda tracejada de 2px',
            assertion: `const s = getComputedStyle(document.querySelector('.aviso')); if (s.borderTopWidth !== '2px' || s.borderTopStyle !== 'dashed') throw new Error('A linha em volta é a border. Veio ' + s.borderTopWidth + ' ' + s.borderTopStyle + '.');`,
          },
        ],
        hints: [
          'A primeira lacuna é o valor que faz `width` medir do lado de fora da linha em volta.',
          'A segunda é a camada entre o conteúdo e a linha em volta; a terceira é a própria linha.',
        ],
        solution: ['border-box', 'padding', 'border'],
        explanation:
          '`box-sizing: border-box` na regra `*` vale para todos os elementos de uma vez — é a primeira linha de quase todo CSS profissional. `padding` é o espaço interno; `border` é a linha, que aqui tem estilo `dashed`. A `margin` já estava preenchida: é a única das três camadas que fica **fora** da borda.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-2-menu',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Os links do menu são elementos inline, e por isso o `padding` vertical não está fazendo nada — eles continuam apertados demais para tocar.\n\nFaça cada `nav a` virar um alvo de toque: `display: inline-block` e `padding` de **12px** em cima e embaixo, **16px** dos lados.',
        concepts: ['css-caixa'],
        difficulty: 'intermediario',
        tags: ['css', 'caixa', 'display'],
        initialCode: `<style>
  nav a {
    /* os links são inline: padding vertical é ignorado */
  }
</style>

<nav>
  <a href="#inicio">Início</a>
  <a href="#aulas">Aulas</a>
  <a href="#contato">Contato</a>
</nav>
`,
        tests: [
          {
            description: 'os links deixaram de ser inline',
            assertion: `
              const a = document.querySelector('nav a');
              if (!a) throw new Error('Os links do nav sumiram.');
              const d = getComputedStyle(a).display;
              if (d !== 'inline-block' && d !== 'block') throw new Error('Um link inline ignora padding vertical; troque o display para inline-block. Veio ' + d + '.');
            `,
          },
          {
            description: 'o padding é 12px em cima e embaixo',
            assertion: `
              const s = getComputedStyle(document.querySelector('nav a'));
              if (s.paddingTop !== '12px' || s.paddingBottom !== '12px') throw new Error('Esperava 12px de padding em cima e embaixo, veio ' + s.paddingTop + ' e ' + s.paddingBottom + '.');
            `,
          },
          {
            description: 'o padding é 16px dos lados',
            assertion: `
              const s = getComputedStyle(document.querySelector('nav a'));
              if (s.paddingLeft !== '16px' || s.paddingRight !== '16px') throw new Error('Esperava 16px de padding dos lados, veio ' + s.paddingLeft + ' e ' + s.paddingRight + '.');
            `,
          },
          {
            description: 'todos os três links receberam o estilo',
            assertion: `
              const links = document.querySelectorAll('nav a');
              if (links.length !== 3) throw new Error('O menu precisa continuar com os três links.');
              for (const a of links) if (getComputedStyle(a).paddingTop !== '12px') throw new Error('O estilo precisa valer para todos os links do nav, não só para o primeiro.');
            `,
            hidden: true,
          },
        ],
        hints: [
          'Duas propriedades: uma muda como a caixa ocupa espaço, a outra dá o espaço interno.',
          '`padding` com dois valores é "vertical horizontal": `padding: 12px 16px`.',
          'nav a {\n  display: inline-block;\n  padding: 12px 16px;\n}',
        ],
        solution: `<style>
  nav a {
    display: inline-block;
    padding: 12px 16px;
  }
</style>

<nav>
  <a href="#inicio">Início</a>
  <a href="#aulas">Aulas</a>
  <a href="#contato">Contato</a>
</nav>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-2-margem',
        type: 'multiple-choice',
        prompt:
          'Dois parágrafos, um embaixo do outro, cada um com `margin: 20px`. Qual é a distância entre eles?',
        concepts: ['css-caixa'],
        difficulty: 'intermediario',
        tags: ['css', 'caixa'],
        options: [
          '40px — a margem de baixo do primeiro mais a de cima do segundo',
          '20px — as margens verticais de blocos vizinhos se fundem, e vale a maior',
          '0px — margem não afasta elementos de bloco',
          'Depende da largura da página',
        ],
        correctIndex: 1,
        explanation:
          'Margens verticais de blocos vizinhos **se fundem** (*margin collapse*): o espaço entre os dois é a maior das duas margens, não a soma. Se um tivesse 20 e o outro 30, a distância seria 30. A regra existe para texto corrido ter espaçamento regular, e é uma das que mais surpreendem — até você saber que ela existe. Margens **horizontais** não se fundem.',
        hints: [
          'A aula fala de um caso em que "20 e 20 dá 20".',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `Todo elemento é uma caixa com quatro camadas — conteúdo, \`padding\`, \`border\`, \`margin\` — e a largura que ela ocupa depende da régua: no \`content-box\` padrão, \`width\` mede só o conteúdo; com \`box-sizing: border-box\`, mede até a borda e a conta bate. Elementos de bloco ocupam a linha e aceitam largura; inline ficam no fluxo do texto e ignoram; \`inline-block\` junta os dois, e é o que transforma links em alvos de toque. E margens verticais vizinhas se fundem: vale a maior.`,
    },
  ],
};

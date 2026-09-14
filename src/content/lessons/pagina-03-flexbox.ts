import type { Lesson } from '../types';

export const lessonFlexbox: Lesson = {
  id: 'lesson-pagina-3',
  trackId: 'track-pagina',
  title: 'Flexbox: Coisas Lado a Lado',
  language: 'html',
  objective:
    'Colocar elementos lado a lado, alinhá-los e distribuir o espaço entre eles com flexbox — sabendo o que vai no contêiner e o que vai nos itens.',
  concepts: ['css-flexbox'],
  status: 'published',
  estimatedMinutes: 32,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Por padrão, blocos empilham: cada \`div\`, \`section\` ou \`p\` ocupa a linha inteira e o próximo vai para baixo. Mas quase toda interface precisa de coisas **lado a lado** — um logotipo à esquerda e um menu à direita, três cartões numa linha, uma barra lateral ao lado do conteúdo. Durante anos isso exigia truques. Hoje é uma linha:

~~~css
.barra {
  display: flex;
}
~~~

Com \`display: flex\` no **contêiner**, os filhos diretos dele viram **itens** e se alinham lado a lado, na mesma linha. É só isso que a propriedade faz — e é a base de tudo o que vem depois.

## Contêiner e itens: quem manda em quê

Esta é a distinção que resolve 80% dos problemas com flexbox. Há dois grupos de propriedades:

- **No contêiner**, você decide a direção, o alinhamento e o espaço **entre** os itens.
- **Nos itens**, você decide quanto cada um cresce, encolhe ou mede.

Escrever \`justify-content\` num item não faz nada. É o erro número um — e é silencioso.

## Os dois eixos

Um contêiner flex tem um **eixo principal** (por padrão, horizontal — a direção em que os itens se enfileiram) e um **eixo cruzado** (o outro). As duas propriedades de alinhamento se dividem entre eles:

- \`justify-content\` — distribui os itens **no eixo principal**. \`flex-start\` (padrão), \`center\`, \`space-between\` (o primeiro na ponta, o último na outra, o resto espalhado), \`space-around\`.
- \`align-items\` — alinha os itens **no eixo cruzado**. \`stretch\` (padrão: todos com a mesma altura), \`center\`, \`flex-start\`, \`flex-end\`.

\`flex-direction: column\` gira os eixos: os itens empilham, e \`justify-content\` passa a distribuir na vertical.

~~~css
.barra {
  display: flex;
  justify-content: space-between;  /* logotipo numa ponta, menu na outra */
  align-items: center;             /* os dois na mesma linha de centro */
}
~~~

## Espaço entre os itens

\`gap\` põe espaço **entre** os itens, e só entre eles — nunca sobra nas pontas. Antes do \`gap\`, o jeito era dar margem a cada item e tirar a do último; hoje é uma propriedade no contêiner:

~~~css
.cartoes {
  display: flex;
  gap: 16px;
}
~~~

## Quando não cabe: flex-wrap

Por padrão, os itens **não quebram linha**: se são muitos, eles encolhem até ficarem ilegíveis, e depois estouram o contêiner. \`flex-wrap: wrap\` deixa os que não cabem descerem para a linha seguinte. Numa lista de cartões que precisa funcionar no celular, é quase sempre o que se quer.

## Quanto cada item mede

Nos itens, a propriedade que importa é \`flex\`. Ela junta três coisas — quanto cresce, quanto encolhe, e o tamanho base — e dois valores cobrem a maioria dos casos:

- \`flex: 1\` — "ocupe o espaço que sobrar". Dois itens com \`flex: 1\` dividem a linha ao meio; três, em terços.
- \`flex: 0 0 200px\` — "meça 200px, não cresça, não encolha". É a barra lateral de largura fixa.

O layout clássico de barra lateral mais conteúdo é exatamente esses dois juntos:

~~~css
.layout { display: flex; gap: 24px; }
aside   { flex: 0 0 200px; }
main    { flex: 1; }
~~~

## Os três erros

1. **A propriedade no lugar errado.** \`justify-content\`, \`align-items\`, \`gap\` e \`flex-wrap\` vão no **contêiner**; \`flex\` vai no **item**.
2. **Esquecer o \`flex-wrap\`** e descobrir no celular que os cartões viraram tiras.
3. **Usar margem para espaçar** o que \`gap\` espaçaria em uma linha, e ficar corrigindo a margem do último.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  .barra {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #cbd5d1;
  }

  .barra nav {
    display: flex;
    gap: 16px;
  }

  .cartoes {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding: 16px;
  }

  .cartao {
    flex: 1 1 200px;
    padding: 16px;
    border: 1px solid #cbd5d1;
  }
</style>

<header class="barra">
  <strong>Minha loja</strong>
  <nav>
    <a href="#">Produtos</a>
    <a href="#">Carrinho</a>
  </nav>
</header>

<section class="cartoes">
  <article class="cartao">Um</article>
  <article class="cartao">Dois</article>
  <article class="cartao">Três</article>
</section>`,
      caption:
        'Dois contêineres flex com papéis diferentes: a barra separa as pontas com `space-between`; a grade de cartões quebra linha com `wrap`, e cada cartão parte de 200px e cresce para preencher a linha (`flex: 1 1 200px`). Repare que o `nav` é ao mesmo tempo item da barra e contêiner dos links.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-3-eixo',
        type: 'multiple-choice',
        prompt:
          'Numa barra com `display: flex`, você quer o logotipo encostado à esquerda e o menu encostado à direita. Que propriedade faz isso, e onde ela vai?',
        concepts: ['css-flexbox'],
        difficulty: 'iniciante',
        tags: ['css', 'flexbox'],
        options: [
          '`align-items: space-between`, no contêiner',
          '`justify-content: space-between`, no contêiner',
          '`justify-content: space-between`, em cada item',
          '`margin-left: auto` no logotipo',
        ],
        correctIndex: 1,
        explanation:
          'Distribuir ao longo da linha é trabalho do **eixo principal**, e a propriedade dele é `justify-content`. `align-items` cuida do outro eixo (a altura). E a propriedade vai no **contêiner** — num item ela é ignorada em silêncio. (`margin-left: auto` no *menu* também funcionaria, e é um truque útil; no logotipo, empurraria o logotipo para a direita.)',
        hints: [
          'Um eixo é o da fila; o outro é o da altura. Qual dos dois é "esquerda e direita"?',
          'Quem decide a distribuição dos itens: o contêiner ou cada item?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-3-barra',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Monte a barra do topo: o título de um lado, o menu do outro, os dois alinhados no centro da altura.\n\nA regra `.barra` precisa de `display: flex`, `justify-content: space-between` e `align-items: center`. O HTML está pronto.',
        concepts: ['css-flexbox'],
        difficulty: 'iniciante',
        tags: ['css', 'flexbox'],
        initialCode: `<style>
  .barra {
    padding: 12px 16px;
    border-bottom: 1px solid #cbd5d1;
    /* faça o título e o menu ficarem lado a lado, nas pontas */
  }
</style>

<header class="barra">
  <strong>Minha loja</strong>
  <nav>
    <a href="#produtos">Produtos</a>
    <a href="#carrinho">Carrinho</a>
  </nav>
</header>
`,
        tests: [
          {
            description: 'a barra é um contêiner flex',
            assertion: `
              const b = document.querySelector('.barra');
              if (!b) throw new Error('O elemento .barra sumiu do HTML.');
              if (getComputedStyle(b).display !== 'flex') throw new Error('Sem display: flex na .barra, o título e o menu continuam empilhados.');
            `,
          },
          {
            description: 'o título e o menu ficam nas pontas',
            assertion: `
              const jc = getComputedStyle(document.querySelector('.barra')).justifyContent;
              if (jc !== 'space-between') throw new Error('Para um item em cada ponta, justify-content precisa ser space-between. Veio ' + jc + '.');
            `,
          },
          {
            description: 'os dois estão alinhados no centro da altura',
            assertion: `
              const ai = getComputedStyle(document.querySelector('.barra')).alignItems;
              if (ai !== 'center') throw new Error('align-items: center alinha título e menu na mesma linha de centro. Veio ' + ai + '.');
            `,
          },
          {
            description: 'as propriedades estão no contêiner, não nos itens',
            assertion: `
              const nav = document.querySelector('.barra nav');
              if (nav && getComputedStyle(nav).justifyContent === 'space-between' && getComputedStyle(document.querySelector('.barra')).justifyContent !== 'space-between') throw new Error('justify-content foi parar no nav, que é um item. Ela precisa estar na .barra, que é o contêiner.');
            `,
            hidden: true,
          },
        ],
        hints: [
          'Três propriedades, todas na regra `.barra`.',
          'Primeiro o `display`; depois uma para o eixo da fila, outra para o eixo da altura.',
          '.barra {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}',
        ],
        solution: `<style>
  .barra {
    padding: 12px 16px;
    border-bottom: 1px solid #cbd5d1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>

<header class="barra">
  <strong>Minha loja</strong>
  <nav>
    <a href="#produtos">Produtos</a>
    <a href="#carrinho">Carrinho</a>
  </nav>
</header>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-3-lacuna-cartoes',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt:
          'Complete a grade de cartões: lado a lado, com 16px entre eles, e descendo de linha quando não couberem.',
        concepts: ['css-flexbox'],
        difficulty: 'iniciante',
        tags: ['css', 'flexbox'],
        template: `<style>
  .cartoes {
    display: {{1}};
    gap: {{2}};
    flex-wrap: {{3}};
  }

  .cartao {
    flex: 1 1 200px;
    padding: 16px;
    border: 1px solid #cbd5d1;
  }
</style>

<section class="cartoes">
  <article class="cartao">Um</article>
  <article class="cartao">Dois</article>
  <article class="cartao">Três</article>
</section>`,
        blanks: [
          { placeholder: 'tipo de caixa', size: 6 },
          { placeholder: 'espaço', size: 5 },
          { placeholder: 'quebrar?', size: 5 },
        ],
        tests: [
          {
            description: 'os cartões ficam lado a lado',
            assertion: `const d = getComputedStyle(document.querySelector('.cartoes')).display; if (d !== 'flex') throw new Error('O display que enfileira os filhos é flex. Veio ' + d + '.');`,
          },
          {
            description: 'há 16px entre os cartões',
            assertion: `const g = getComputedStyle(document.querySelector('.cartoes')).gap; if (g !== '16px') throw new Error('O espaço entre os itens é o gap, e aqui ele precisa ser 16px. Veio ' + g + '.');`,
          },
          {
            description: 'os cartões descem de linha quando não cabem',
            assertion: `const w = getComputedStyle(document.querySelector('.cartoes')).flexWrap; if (w !== 'wrap') throw new Error('flex-wrap: wrap deixa os itens que não cabem descerem para a linha seguinte. Veio ' + w + '.');`,
          },
        ],
        hints: [
          'A primeira lacuna é o valor de `display` desta aula inteira.',
          'A segunda é uma medida em pixels; a terceira é a palavra que permite quebrar linha.',
        ],
        solution: ['flex', '16px', 'wrap'],
        explanation:
          '`display: flex` enfileira; `gap: 16px` espaça só entre os itens; `flex-wrap: wrap` deixa a fila virar duas quando o espaço acaba. Com `flex: 1 1 200px` em cada cartão, eles partem de 200px, crescem para preencher a linha e descem quando nem 200px cabem — é a grade responsiva mais simples que existe, sem nenhuma media query.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-3-ordenar-espaco',
        type: 'order-steps',
        prompt:
          'Como o navegador monta uma linha flex. Coloque na ordem o que ele decide, do primeiro passo ao último.',
        concepts: ['css-flexbox'],
        difficulty: 'intermediario',
        tags: ['css', 'flexbox'],
        steps: [
          {
            id: 'container',
            text: '`display: flex` no contêiner: os filhos diretos viram itens e entram na mesma linha',
            ordem: 1,
          },
          {
            id: 'base',
            text: 'Cada item recebe o tamanho base — o `flex-basis`, ou o tamanho natural do conteúdo',
            ordem: 2,
          },
          {
            id: 'grow',
            text: 'O espaço que sobra na linha é repartido entre os itens conforme o `flex-grow` de cada um',
            ordem: 3,
          },
          {
            id: 'justify',
            text: 'Se ainda sobra espaço (ninguém cresce), `justify-content` decide onde ele fica',
            ordem: 4,
          },
          {
            id: 'align',
            text: '`align-items` posiciona cada item no eixo cruzado, dentro da altura da linha',
            ordem: 5,
          },
        ],
        explanation:
          'A ordem explica dois comportamentos que parecem misteriosos. Com `flex: 1` nos itens, `justify-content` "não faz nada" — porque o espaço foi todo consumido no passo do `flex-grow`, antes de ele ter vez. E `align-items` vem por último porque só depois de a linha existir é que há uma altura para alinhar dentro.',
        hints: [
          'Antes de repartir espaço, o navegador precisa saber quanto cada item pede.',
          'O alinhamento no eixo cruzado só faz sentido depois de a linha ter altura.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-3-lateral',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'O layout clássico: uma barra lateral de **200px** fixos e o conteúdo ocupando **todo o resto**, com **24px** entre os dois.\n\nEscreva as regras de `.layout`, `aside` e `main`.',
        concepts: ['css-flexbox'],
        difficulty: 'intermediario',
        tags: ['css', 'flexbox'],
        initialCode: `<style>
  /* .layout: o contêiner */

  /* aside: 200px fixos, sem crescer nem encolher */

  /* main: o que sobrar */
</style>

<div class="layout">
  <aside>Menu lateral</aside>
  <main>
    <h1>Conteúdo</h1>
    <p>Ocupa todo o espaço que a barra lateral deixar.</p>
  </main>
</div>
`,
        tests: [
          {
            description: 'o layout é um contêiner flex com 24px entre as colunas',
            assertion: `
              const l = document.querySelector('.layout');
              if (!l) throw new Error('O elemento .layout sumiu do HTML.');
              const s = getComputedStyle(l);
              if (s.display !== 'flex') throw new Error('.layout precisa de display: flex para as duas colunas ficarem lado a lado.');
              if (s.gap !== '24px') throw new Error('O espaço entre as colunas é gap: 24px no contêiner. Veio ' + s.gap + '.');
            `,
          },
          {
            description: 'a barra lateral mede 200px e não cresce',
            assertion: `
              const s = getComputedStyle(document.querySelector('aside'));
              if (s.flexBasis !== '200px') throw new Error('O tamanho base do aside precisa ser 200px (flex: 0 0 200px). Veio ' + s.flexBasis + '.');
              if (s.flexGrow !== '0') throw new Error('O aside não pode crescer: flex-grow precisa ser 0. Veio ' + s.flexGrow + '.');
            `,
          },
          {
            description: 'a barra lateral não encolhe quando falta espaço',
            assertion: `
              const s = getComputedStyle(document.querySelector('aside'));
              if (s.flexShrink !== '0') throw new Error('Com flex-shrink 1 (o padrão), o aside encolheria antes de o conteúdo quebrar. Use flex: 0 0 200px.');
            `,
            hidden: true,
          },
          {
            description: 'o conteúdo ocupa o que sobra',
            assertion: `
              const s = getComputedStyle(document.querySelector('main'));
              if (s.flexGrow !== '1') throw new Error('main precisa crescer para ocupar o resto: flex: 1. Veio flex-grow ' + s.flexGrow + '.');
            `,
          },
        ],
        hints: [
          'São três regras: uma para o contêiner (com o `gap`), uma para cada coluna.',
          'A barra lateral usa a forma de três valores: crescer, encolher, tamanho base.',
          '.layout { display: flex; gap: 24px; }\naside { flex: 0 0 200px; }\nmain { flex: 1; }',
        ],
        solution: `<style>
  .layout {
    display: flex;
    gap: 24px;
  }

  aside {
    flex: 0 0 200px;
  }

  main {
    flex: 1;
  }
</style>

<div class="layout">
  <aside>Menu lateral</aside>
  <main>
    <h1>Conteúdo</h1>
    <p>Ocupa todo o espaço que a barra lateral deixar.</p>
  </main>
</div>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-3-nao-centraliza',
        type: 'multiple-choice',
        prompt:
          'Você escreveu `justify-content: center` e nada mudou. Qual é a causa mais provável?',
        concepts: ['css-flexbox'],
        difficulty: 'intermediario',
        tags: ['css', 'flexbox'],
        options: [
          'A propriedade está num item, e não no contêiner com `display: flex`',
          '`justify-content` só funciona com `flex-direction: column`',
          'Faltou `!important`',
          'Os itens precisam ter `width` definida para centralizar',
        ],
        correctIndex: 0,
        explanation:
          'É o erro número um, e ele é silencioso: `justify-content` escrita num item é simplesmente ignorada. Ela pertence ao contêiner — o elemento com `display: flex`. Outra causa comum, quando a propriedade está no lugar certo: os itens têm `flex: 1` e consumiram todo o espaço, então não sobra nada para centralizar.',
        hints: ['Releia a seção "quem manda em quê".'],
      },
    },
    {
      kind: 'summary',
      markdown: `\`display: flex\` no contêiner enfileira os filhos. No contêiner ficam a direção, o alinhamento no eixo principal (\`justify-content\`), no eixo cruzado (\`align-items\`), o espaço entre itens (\`gap\`) e a quebra de linha (\`flex-wrap\`). Nos itens fica só quanto cada um mede: \`flex: 1\` para "o que sobrar", \`flex: 0 0 200px\` para "fixo". Propriedade no lugar errado é ignorada em silêncio — quando nada muda, é a primeira coisa a conferir.`,
    },
  ],
};

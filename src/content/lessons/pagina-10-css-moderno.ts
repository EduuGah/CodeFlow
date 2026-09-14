import type { Lesson } from '../types';

import { AJUDANTES_CSS } from './_ajudantes-css';

// clamp(), min(), propriedades lógicas e aspect-ratio são lidos na folha de
// estilo: o navegador resolve clamp() em px e o jsdom mantém o texto; o que
// é igual nos dois é o que o aluno escreveu. Veja `_ajudantes-css.ts`.
//
// Nada aqui usa aninhamento nativo (`.a { & span { } }`): o analisador de CSS
// do jsdom, que o CI usa, recusa a folha inteira ao encontrá-lo. A aula cita
// o recurso; os exercícios não dependem dele.
const AJUDANTES = `${AJUDANTES_CSS}
  function semEspacos(texto) { return String(texto || '').replace(/\\s+/g, ''); }
  function regraPorSeletorSemEspacos(seletor) {
    const alvo = semEspacos(seletor);
    for (const folha of document.styleSheets) for (const r of folha.cssRules) {
      if (r.selectorText && semEspacos(r.selectorText) === alvo) return r.style;
    }
    return null;
  }
`;

export const lessonCssModerno: Lesson = {
  id: 'lesson-pagina-10',
  trackId: 'track-pagina',
  title: 'CSS Moderno: Menos Código, Mais Intenção',
  language: 'html',
  objective:
    'Usar as funções e propriedades que substituíram truques antigos — clamp, min, propriedades lógicas, :is, aspect-ratio — e reconhecer o que ainda é cedo demais para depender.',
  concepts: ['css-moderno'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Muito do CSS que se lê por aí é de uma época em que faltavam ferramentas: media queries para cada tamanho de título, margens negativas para compensar espaçamento, \`padding-top\` em porcentagem para manter a proporção de um vídeo. Tudo isso tem hoje uma propriedade ou função que diz a intenção diretamente. Esta aula fecha o bloco de CSS com as que mais mudam o código do dia a dia.

## clamp(): um valor com piso e teto

\`clamp(mínimo, preferido, máximo)\` devolve o preferido, desde que ele caiba entre os dois limites. Com um preferido em \`vw\` — porcentagem da largura da janela —, o tamanho acompanha a tela sem media query nenhuma:

~~~css
h1 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
}
~~~

Numa tela de 360px, \`4vw\` são 14px — abaixo do piso, então vale \`1.5rem\`. Numa de 1200px, \`4vw\` são 48px — acima do teto, vale \`2.5rem\`. No meio, o título cresce com a janela. Uma linha substitui três media queries, e o resultado é mais suave que qualquer degrau.

O mesmo vale para espaçamento: \`padding: clamp(16px, 4vw, 48px)\`.

## min() e max()

\`min(100%, 60ch)\` é "60 caracteres, mas nunca mais que o espaço disponível" — a medida de linha da aula de tipografia, escrita numa expressão só, sem precisar de \`width\` mais \`max-width\`. \`max()\` é o oposto: um piso.

## Propriedades lógicas

\`margin-left\` é físico: esquerda. \`margin-inline-start\` é lógico: **o começo da linha**, que é a esquerda em português e a direita em árabe ou hebraico. Como todo texto tem direção, as propriedades lógicas fazem a página funcionar nas duas sem código duplicado:

| Físico | Lógico |
| --- | --- |
| \`padding-left\` + \`padding-right\` | \`padding-inline\` |
| \`margin-top\` + \`margin-bottom\` | \`margin-block\` |
| \`width\` | \`inline-size\` |
| \`margin-left\` | \`margin-inline-start\` |

Mesmo que você nunca traduza a página, \`padding-inline: 16px\` é mais curto que dois \`padding\` — e diz o que quer dizer: "dos lados".

## :is(): um seletor para vários

~~~css
:is(h1, h2, h3) { line-height: 1.2; }
:is(header, footer) a { color: white; }
~~~

Sem \`:is()\`, a segunda regra seria \`header a, footer a\` — repetindo o que vem depois para cada item. Com listas longas, a diferença é grande.

## aspect-ratio

Um vídeo, um mapa, uma capa de cartão: coisas que precisam manter proporção enquanto a largura muda. Antes, \`padding-top: 56.25%\` num contêiner e posicionamento absoluto do conteúdo. Hoje:

~~~css
.video {
  width: 100%;
  aspect-ratio: 16 / 9;
}
~~~

## gap em tudo

\`gap\` não é só do grid e do flex: é a forma de espaçar irmãos sem margem nenhuma neles. Se você se pega escrevendo \`margin-right\` em cada item e zerando o último, é \`gap\` no contêiner.

## O reset moderno

Cinco linhas que todo projeto começa, cada uma consertando um padrão antigo do navegador:

~~~css
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; line-height: 1.5; }
img, video { max-width: 100%; height: auto; display: block; }
h1, h2, h3, p { margin-block: 0 0.75em; }
button, input { font: inherit; }
~~~

\`font: inherit\` nos controles é a que mais surpreende: por padrão, botões e campos **não herdam** a fonte da página, e ficam com a do sistema, menor.

## O que ainda é cedo

**Aninhamento** (\`.cartao { & h2 { … } }\`) e **container queries** (\`@container\`) já funcionam nos navegadores atuais e valem a pena conhecer. Mas uma ferramenta que processa o seu CSS pode ainda não entender aninhamento — e "funciona no meu navegador" não é a mesma coisa que "funciona no de todo mundo". A regra: use o que a maioria dos seus usuários tem; confira antes.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.5; padding-inline: clamp(16px, 4vw, 48px); }

  h1 { font-size: clamp(1.5rem, 4vw, 2.5rem); }
  :is(h1, h2, h3) { line-height: 1.2; }

  p { max-width: min(100%, 60ch); }

  .video { width: 100%; aspect-ratio: 16 / 9; background: #cbd5d1; }

  .tags { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; list-style: none; }
  .tags li { padding-inline: 12px; padding-block: 4px; background: #e6efec; border-radius: 999px; }
</style>

<h1>Um título que acompanha a tela</h1>
<p>Este parágrafo nunca passa de sessenta caracteres nem do espaço disponível — o menor dos dois.</p>
<div class="video"></div>
<ul class="tags">
  <li>clamp</li><li>min</li><li>lógicas</li><li>:is</li><li>aspect-ratio</li>
</ul>`,
      caption:
        'Nenhuma media query, e a página se adapta: o título por `clamp()`, a medida por `min()`, o espaçamento lateral por `clamp()` em `padding-inline`. O retângulo cinza mantém 16:9 em qualquer largura, e as etiquetas se espaçam por `gap`, sem margem em nenhuma delas.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-10-clamp',
        type: 'multiple-choice',
        prompt: 'Com `font-size: clamp(1rem, 2.5vw, 1.5rem)`, qual é o tamanho numa janela de 1600px de largura?',
        concepts: ['css-moderno'],
        difficulty: 'iniciante',
        tags: ['css', 'moderno'],
        options: ['1rem', '2.5vw, que são 40px', '1.5rem', 'Depende da altura'],
        correctIndex: 2,
        explanation:
          '`2.5vw` de 1600px são 40px — acima do teto de `1.5rem` (24px), então o teto vence. O preferido só vale enquanto cabe entre o piso e o teto; fora disso, o limite mais próximo é o resultado. É o que faz `clamp()` substituir media queries: os degraus viram limites.',
        hints: ['Calcule o preferido primeiro; depois veja se ele cabe entre o mínimo e o máximo.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-10-fluido',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Sem media query: o `h1` com `font-size` em `clamp()` — piso **1.5rem**, preferido **4vw**, teto **2.5rem** —, e o `p` com `max-width: min(100%, 60ch)`.',
        concepts: ['css-moderno'],
        difficulty: 'iniciante',
        tags: ['css', 'moderno'],
        initialCode: `<style>
  body { font-family: system-ui, sans-serif; line-height: 1.5; }

  h1 {
    /* clamp(piso, preferido, teto) */
  }

  p {
    /* min(o espaço disponível, a medida de linha) */
  }
</style>

<h1>Um título que acompanha a tela</h1>
<p>Um parágrafo que nunca passa de sessenta caracteres por linha, nem do espaço que a tela dá.</p>
`,
        tests: [
          {
            description: 'o h1 usa clamp com piso 1.5rem, preferido em vw e teto 2.5rem',
            assertion: `${AJUDANTES}
              const v = declarado('h1', 'font-size');
              const m = /^clamp\\(\\s*([^,]+),\\s*([^,]+),\\s*([^)]+)\\)$/.exec(v);
              if (!m) throw new Error('font-size do h1 precisa ser clamp(piso, preferido, teto). Veio "' + (v || '(nada)') + '".');
              const [piso, pref, teto] = [m[1], m[2], m[3]].map((x) => x.trim());
              if (piso !== '1.5rem') throw new Error('O piso é 1.5rem. Veio "' + piso + '".');
              if (!/^4vw$/.test(pref)) throw new Error('O preferido é 4vw — é o que faz o tamanho acompanhar a tela. Veio "' + pref + '".');
              if (teto !== '2.5rem') throw new Error('O teto é 2.5rem. Veio "' + teto + '".');
            `,
          },
          {
            description: 'o p usa min(100%, 60ch)',
            assertion: `${AJUDANTES}
              const v = declarado('p', 'max-width').replace(/\\s+/g, '');
              if (v !== 'min(100%,60ch)' && v !== 'min(60ch,100%)') throw new Error('max-width do p é min(100%, 60ch): o menor entre o espaço e a medida de linha. Veio "' + (declarado('p', 'max-width') || '(nada)') + '".');
            `,
          },
          {
            description: 'nenhuma media query',
            assertion: `
              for (const folha of document.styleSheets) for (const r of folha.cssRules) {
                if (r.media) throw new Error('O ponto do exercício é resolver sem @media: clamp() e min() fazem o degrau virar limite.');
              }
            `,
            hidden: true,
          },
        ],
        hints: [
          '`clamp()` recebe três valores separados por vírgula, nesta ordem: mínimo, preferido, máximo.',
          '`min()` recebe dois e usa o menor. Aqui, o espaço todo ou a medida em `ch`.',
          'h1 { font-size: clamp(1.5rem, 4vw, 2.5rem); }\np { max-width: min(100%, 60ch); }',
        ],
        solution: `<style>
  body { font-family: system-ui, sans-serif; line-height: 1.5; }

  h1 {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
  }

  p {
    max-width: min(100%, 60ch);
  }
</style>

<h1>Um título que acompanha a tela</h1>
<p>Um parágrafo que nunca passa de sessenta caracteres por linha, nem do espaço que a tela dá.</p>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-10-lacuna-logicas',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt:
          'Complete com propriedades lógicas e o seletor de lista: espaço **dos lados** do cartão, espaço **em cima e embaixo** do parágrafo, e uma regra só para os três níveis de título.',
        concepts: ['css-moderno'],
        difficulty: 'iniciante',
        tags: ['css', 'moderno'],
        template: `<style>
  .cartao { padding-{{1}}: 16px; border: 1px solid #cbd5d1; }
  p { margin-{{2}}: 8px; }
  :{{3}}(h1, h2, h3) { line-height: 1.2; }
</style>

<article class="cartao">
  <h2>Propriedades lógicas</h2>
  <p>Dos lados é inline; em cima e embaixo é block.</p>
</article>`,
        blanks: [
          { placeholder: 'dos lados', size: 6 },
          { placeholder: 'cima e baixo', size: 5 },
          { placeholder: 'seletor', size: 2 },
        ],
        tests: [
          {
            description: 'o cartão usa padding-inline para os lados',
            assertion: `${AJUDANTES}
              const v = declarado('.cartao', 'padding-inline');
              if (v !== '16px') throw new Error('"Dos lados", na direção da linha, é padding-inline. Veio "' + (v || '(nada)') + '".');
            `,
          },
          {
            description: 'o parágrafo usa margin-block para cima e embaixo',
            assertion: `${AJUDANTES}
              const v = declarado('p', 'margin-block');
              if (v !== '8px') throw new Error('"Em cima e embaixo", na direção dos blocos, é margin-block. Veio "' + (v || '(nada)') + '".');
            `,
          },
          {
            description: 'os três níveis de título compartilham uma regra com :is()',
            assertion: `${AJUDANTES}
              const r = regraPorSeletorSemEspacos(':is(h1,h2,h3)');
              if (!r) throw new Error('O seletor que agrupa é :is(h1, h2, h3).');
              if (r.getPropertyValue('line-height').trim() !== '1.2') throw new Error('A regra :is() precisa manter line-height: 1.2.');
            `,
          },
        ],
        hints: [
          'Há um nome para a direção em que o texto corre e outro para a direção em que os blocos se empilham; a tabela da aula tem os dois, e a propriedade termina com eles.',
          'O seletor de lista tem duas letras e começa com i.',
        ],
        solution: ['inline', 'block', 'is'],
        explanation:
          '`padding-inline` é "dos lados" e `margin-block` é "em cima e embaixo" — nomes que dizem a intenção, e que trocam de lado sozinhos numa língua escrita da direita para a esquerda. `:is(h1, h2, h3)` é uma regra para três seletores sem repetir nada. Nenhuma das três é "avançada": são só as versões novas de coisas que você já escrevia.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-10-ordenar-clamp',
        type: 'order-steps',
        prompt:
          'Como o navegador resolve `font-size: clamp(1.5rem, 4vw, 2.5rem)` numa janela de 500px. Coloque na ordem.',
        concepts: ['css-moderno'],
        difficulty: 'intermediario',
        tags: ['css', 'moderno'],
        steps: [
          { id: 'pref', text: 'Calcula o preferido: 4vw de 500px são 20px', ordem: 1 },
          { id: 'piso', text: 'Compara com o piso: 1.5rem são 24px, e 20 é menor que 24', ordem: 2 },
          { id: 'usa', text: 'O piso vence: o título fica em 24px', ordem: 3 },
          { id: 'cresce', text: 'A janela cresce para 800px: 4vw viram 32px, entre o piso e o teto, e é isso que vale', ordem: 4 },
          { id: 'teto', text: 'A janela passa de 1000px: 4vw passam de 40px, o teto de 2.5rem (40px) segura', ordem: 5 },
        ],
        explanation:
          'Três valores, uma regra: o preferido vale enquanto cabe. Abaixo do piso, o piso; acima do teto, o teto. O título é fluido só na faixa em que faz sentido — de 600px a 1000px de janela, neste caso — e trava nos extremos, que é exatamente o que as três media queries antigas tentavam fazer em degraus.',
        hints: [
          'Primeiro se calcula o que a janela pede; depois se confere contra os limites.',
          'Conforme a janela cresce, o valor passa por três situações: abaixo do piso, no meio, acima do teto.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-10-proporcao',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Dois consertos modernos: o `.video` ocupa **100%** da largura e mantém a proporção **16 / 9** com `aspect-ratio`; e as etiquetas se espaçam com **gap de 8px** no contêiner `.tags`, em vez de margem em cada `li`.',
        concepts: ['css-moderno'],
        difficulty: 'intermediario',
        tags: ['css', 'moderno'],
        initialCode: `<style>
  .video {
    background: #cbd5d1;
    /* largura total, proporção 16 por 9 */
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    padding: 0;
    /* o espaço entre as etiquetas */
  }

  .tags li {
    padding: 4px 12px;
    background: #e6efec;
    margin-right: 8px;   /* <- a forma antiga: tire isto */
  }
</style>

<div class="video"></div>
<ul class="tags">
  <li>um</li><li>dois</li><li>três</li>
</ul>
`,
        tests: [
          {
            description: 'o vídeo ocupa a largura toda e mantém 16 por 9',
            assertion: `${AJUDANTES}
              const w = declarado('.video', 'width');
              if (w !== '100%') throw new Error('width: 100% no .video. Veio "' + (w || '(nada)') + '".');
              const ar = declarado('.video', 'aspect-ratio').replace(/\\s+/g, '');
              if (ar !== '16/9') throw new Error('aspect-ratio: 16 / 9 mantém a proporção em qualquer largura. Veio "' + (declarado('.video', 'aspect-ratio') || '(nada)') + '".');
            `,
          },
          {
            description: 'as etiquetas se espaçam com gap no contêiner',
            assertion: `
              const g = getComputedStyle(document.querySelector('.tags')).gap;
              if (g !== '8px') throw new Error('gap: 8px no contêiner .tags. Veio ' + g + '.');
            `,
          },
          {
            description: 'nenhuma etiqueta tem margem: o gap substitui',
            assertion: `
              for (const li of document.querySelectorAll('.tags li')) {
                // '' é o que o jsdom devolve para uma margem nunca declarada;
                // o navegador devolve '0px'. Os dois querem dizer "sem margem".
                const m = getComputedStyle(li).marginRight;
                if (m !== '0px' && m !== '') throw new Error('Com gap no contêiner, a margem de cada li sai: veio margin-right ' + m + '.');
              }
            `,
          },
          {
            description: 'sem truque de padding-top para a proporção',
            assertion: `${AJUDANTES}
              const pt = declarado('.video', 'padding-top');
              if (/%$/.test(pt)) throw new Error('padding-top em porcentagem é o truque antigo; aspect-ratio diz a intenção.');
            `,
            hidden: true,
          },
        ],
        hints: [
          'Duas propriedades no `.video`; uma no `.tags`; e uma linha a menos no `.tags li`.',
          '`aspect-ratio` recebe largura e altura separadas por barra.',
          '.video { width: 100%; aspect-ratio: 16 / 9; }\n.tags { gap: 8px; }\n/* e tire o margin-right do .tags li */',
        ],
        solution: `<style>
  .video {
    background: #cbd5d1;
    width: 100%;
    aspect-ratio: 16 / 9;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    padding: 0;
    gap: 8px;
  }

  .tags li {
    padding: 4px 12px;
    background: #e6efec;
  }
</style>

<div class="video"></div>
<ul class="tags">
  <li>um</li><li>dois</li><li>três</li>
</ul>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-10-logica',
        type: 'multiple-choice',
        prompt:
          'Um ícone fica antes do texto do botão, com `margin-right: 8px`. A página é traduzida para árabe, que se escreve da direita para a esquerda. O que acontece, e qual é a propriedade certa?',
        concepts: ['css-moderno'],
        difficulty: 'intermediario',
        tags: ['css', 'moderno'],
        options: [
          'Nada muda; `margin-right` é a propriedade certa',
          'O ícone passa para a direita do texto, mas a margem continua à direita, colada na borda: o certo é `margin-inline-end`',
          'O navegador inverte `margin-right` sozinho',
          'É preciso uma folha de estilo separada para árabe',
        ],
        correctIndex: 1,
        explanation:
          'Em árabe o começo da linha é a direita, então o ícone vai para lá — mas `margin-right` continua sendo "direita" e a margem fica do lado errado, entre o ícone e a borda. `margin-inline-end` é "o fim da linha, seja qual for": esquerda em árabe, direita em português. Uma propriedade, as duas direções.',
        hints: ['"Direita" é físico. "Fim da linha" é lógico.'],
      },
    },
    {
      kind: 'summary',
      markdown: `Cada truque antigo tem uma propriedade que diz a intenção: \`clamp()\` no lugar de degraus de media query, \`min()\` no lugar de \`width\` mais \`max-width\`, \`padding-inline\` e \`margin-block\` no lugar de pares físicos, \`:is()\` no lugar de seletores repetidos, \`aspect-ratio\` no lugar de \`padding-top\` em porcentagem, \`gap\` no lugar de margem em cada item. E o reset de cinco linhas que todo projeto começa. Aninhamento e container queries vêm aí — confira o suporte antes de depender.`,
    },
  ],
};

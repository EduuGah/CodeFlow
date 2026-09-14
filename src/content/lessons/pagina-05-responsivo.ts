import type { Lesson } from '../types';

import { AJUDANTES_CSS } from './_ajudantes-css';

// Os testes desta aula leem a folha de estilo, não o estilo computado: uma
// media query depende da largura do iframe, e o jsdom ignora @media. Veja
// `_ajudantes-css.ts`.
const AJUDANTES = AJUDANTES_CSS;

export const lessonResponsivo: Lesson = {
  id: 'lesson-pagina-5',
  trackId: 'track-pagina',
  title: 'Responsivo: Uma Página, Todas as Telas',
  language: 'html',
  objective:
    'Escrever CSS que funciona no celular primeiro e ganha colunas em telas maiores — com unidades fluidas, max-width e media queries de min-width.',
  concepts: ['css-responsivo'],
  status: 'published',
  estimatedMinutes: 32,
  blocks: [
    {
      kind: 'prose',
      markdown: `
A mesma página vai abrir num telefone de 360 pixels de largura e num monitor de 1920. Não existem duas páginas; existe **um CSS que se adapta**. E a surpresa de quem começa é que a página já nasce adaptável — é o CSS de larguras fixas que a estraga.

## O que já é fluido

Um parágrafo sem largura definida ocupa a largura disponível e quebra linha sozinho. Um bloco sem \`width\` também. O HTML puro, sem CSS nenhum, **é responsivo**. O trabalho é não quebrar isso:

- **Nunca \`width\` fixa em pixels** em contêineres de texto. Use \`max-width\`: a caixa encolhe quando a tela é menor, e para de crescer quando é maior.
- **Imagens precisam de \`max-width: 100%\`**, senão uma foto de 1200px estoura a tela de 360. Com \`height: auto\`, a proporção se mantém.
- **Texto legível tem linha curta.** Entre 45 e 75 caracteres por linha; \`max-width: 60ch\` diz isso em CSS — \`ch\` é a largura do caractere "0" da fonte.

~~~css
img { max-width: 100%; height: auto; }
p   { max-width: 60ch; }
~~~

## A tag que liga tudo

No \`<head>\`, uma linha sem a qual nada disto funciona no celular:

~~~html
<meta name="viewport" content="width=device-width, initial-scale=1">
~~~

Sem ela, o telefone finge ter 980 pixels de largura, desenha a página em miniatura, e as media queries nunca casam. As páginas dos exercícios já vêm com ela.

## Media queries: CSS condicional

Quando a adaptação natural não basta — três colunas de cartões não cabem em 360px —, entra a media query: um bloco de regras que só vale **se** a condição for verdadeira.

~~~css
.cartoes {
  display: grid;
  grid-template-columns: 1fr;       /* celular: uma coluna */
  gap: 16px;
}

@media (min-width: 600px) {
  .cartoes {
    grid-template-columns: repeat(3, 1fr);   /* a partir de 600px: três */
  }
}
~~~

Repare na ordem: as regras **base** são as do celular, e o \`@media\` **acrescenta** para telas maiores. Chama-se *mobile-first*, e não é preferência — é o jeito que produz menos CSS e menos bug: a tela pequena é a mais restrita, e o que funciona nela funciona em qualquer uma; a maior só ganha colunas.

O contrário — escrever para o desktop e ir corrigindo com \`max-width\` — acumula regras que desfazem regras.

## Onde colocar o ponto de quebra

Não nos tamanhos de aparelhos. Aparelhos mudam todo ano, e "tablet" não quer dizer nada. O ponto de quebra vai **onde o layout quebra**: estreite a janela até os cartões ficarem apertados, e esse é o número. Costuma cair em poucos valores — 600, 900, 1200 — mas quem manda é o conteúdo.

## Reescrevendo a página inteira

Lembra das áreas nomeadas da aula de grid? É aqui que elas brilham. No celular, tudo empilhado; a partir de 700px, o menu vai para o lado — e o HTML não muda uma linha:

~~~css
.pagina {
  display: grid;
  grid-template-areas:
    "cabecalho"
    "menu"
    "conteudo"
    "rodape";
}

@media (min-width: 700px) {
  .pagina {
    grid-template-columns: 200px 1fr;
    grid-template-areas:
      "cabecalho cabecalho"
      "menu      conteudo"
      "rodape    rodape";
  }
}
~~~

## Os erros

- **Largura fixa em pixels** num contêiner de texto. Troque por \`max-width\`.
- **Esquecer o \`max-width: 100%\` das imagens**, e só descobrir no telefone.
- **Desktop-first**: começar largo e ir consertando com \`max-width\` — cada tela nova é uma regra a mais desfazendo a anterior.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  * { box-sizing: border-box; }

  img { max-width: 100%; height: auto; }
  p   { max-width: 60ch; }

  .cartoes {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  @media (min-width: 600px) {
    .cartoes {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .cartao {
    padding: 16px;
    border: 1px solid #cbd5d1;
  }
</style>

<section class="cartoes">
  <article class="cartao">Um</article>
  <article class="cartao">Dois</article>
  <article class="cartao">Três</article>
</section>

<p>Este parágrafo nunca passa de sessenta caracteres por linha, seja qual for a largura da tela.</p>`,
      caption:
        'Mobile-first: a regra base tem uma coluna, e o `@media` acrescenta as três a partir de 600px. Redimensione a pré-visualização mentalmente: abaixo de 600 valem só as regras de fora; acima, as de dentro se somam por cima delas.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-5-mobile-first',
        type: 'multiple-choice',
        prompt: 'O que "mobile-first" quer dizer, na prática do CSS?',
        concepts: ['css-responsivo'],
        difficulty: 'iniciante',
        tags: ['css', 'responsivo'],
        options: [
          'Escrever as regras base para telas pequenas e usar `@media (min-width)` para acrescentar o que telas maiores ganham',
          'Escrever para o desktop e usar `@media (max-width)` para consertar o celular',
          'Fazer duas folhas de estilo, uma para cada aparelho',
          'Usar só unidades em pixels, porque o celular tem tamanho conhecido',
        ],
        correctIndex: 0,
        explanation:
          'A tela pequena é a mais restrita: o que funciona nela funciona em qualquer uma. Então ela vira a **base**, e as maiores só **acrescentam** — colunas, espaço, uma barra lateral — com `min-width`. O caminho contrário (desktop-first, com `max-width`) acumula regras que desfazem regras, e cada tela nova vira um conserto.',
        hints: [
          'Qual das duas telas tem menos espaço? Ela é a que mais restringe — e por isso a que vem primeiro.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-5-fluido',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Deixe a página fluida: a imagem nunca pode passar da largura disponível (mantendo a proporção), e os parágrafos precisam ter linhas de no máximo **60 caracteres**.\n\nEscreva as regras `img` e `p`.',
        concepts: ['css-responsivo'],
        difficulty: 'iniciante',
        tags: ['css', 'responsivo'],
        initialCode: `<style>
  /* img: nunca mais larga que o espaço, com a proporção mantida */

  /* p: linhas de no máximo 60 caracteres */
</style>

<img alt="Um retângulo largo" width="1200" height="300" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='300'%3E%3Crect width='1200' height='300' fill='%23a7b8b3'/%3E%3C/svg%3E">

<p>Uma linha de texto que segue por muitas e muitas palavras acaba cansando quem lê, porque o olho perde o começo da linha seguinte no caminho de volta. Sessenta caracteres é uma boa medida.</p>
`,
        tests: [
          {
            description: 'a imagem tem max-width de 100%',
            assertion: `${AJUDANTES}
              const r = regraBase('img');
              if (!r) throw new Error('Não encontrei uma regra com o seletor img.');
              if (r.getPropertyValue('max-width').trim() !== '100%') throw new Error('A imagem precisa de max-width: 100% para nunca passar do espaço disponível. Veio "' + (r.getPropertyValue('max-width') || '(nada)') + '".');
            `,
          },
          {
            description: 'a altura da imagem acompanha a largura',
            assertion: `${AJUDANTES}
              const r = regraBase('img');
              if (!r || r.getPropertyValue('height').trim() !== 'auto') throw new Error('Com o atributo height="300" no HTML, a imagem encolheria só na largura e ficaria esmagada; height: auto mantém a proporção.');
            `,
          },
          {
            description: 'os parágrafos têm linhas de no máximo 60 caracteres',
            assertion: `${AJUDANTES}
              const r = regraBase('p');
              if (!r) throw new Error('Não encontrei uma regra com o seletor p.');
              const v = r.getPropertyValue('max-width').trim();
              const m = /^(\\d+(?:\\.\\d+)?)ch$/.exec(v);
              if (!m || Number(m[1]) !== 60) throw new Error('A medida de "caracteres por linha" é ch: max-width: 60ch. Veio "' + (v || '(nada)') + '".');
            `,
          },
          {
            description: 'nada de largura fixa em pixels no parágrafo',
            assertion: `${AJUDANTES}
              const r = regraBase('p');
              if (r && /px$/.test(r.getPropertyValue('width').trim())) throw new Error('width fixa em pixels quebra no celular; o limite é max-width, e em ch.');
            `,
            hidden: true,
          },
        ],
        hints: [
          'Duas regras, duas propriedades cada — e a unidade do parágrafo é a que mede caracteres.',
          'Para a imagem: um limite de largura em porcentagem, e a altura calculada.',
          'img { max-width: 100%; height: auto; }\np { max-width: 60ch; }',
        ],
        solution: `<style>
  img { max-width: 100%; height: auto; }
  p { max-width: 60ch; }
</style>

<img alt="Um retângulo largo" width="1200" height="300" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='300'%3E%3Crect width='1200' height='300' fill='%23a7b8b3'/%3E%3C/svg%3E">

<p>Uma linha de texto que segue por muitas e muitas palavras acaba cansando quem lê, porque o olho perde o começo da linha seguinte no caminho de volta. Sessenta caracteres é uma boa medida.</p>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-5-lacuna-media',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt:
          'Complete a grade mobile-first: uma coluna por padrão, e **três** a partir de **600px** de largura.',
        concepts: ['css-responsivo'],
        difficulty: 'iniciante',
        tags: ['css', 'responsivo'],
        template: `<style>
  .cartoes {
    display: grid;
    grid-template-columns: {{1}};
    gap: 16px;
  }

  @media ({{2}}: 600px) {
    .cartoes {
      grid-template-columns: repeat({{3}}, 1fr);
    }
  }

  .cartao { padding: 16px; border: 1px solid #cbd5d1; }
</style>

<section class="cartoes">
  <article class="cartao">Um</article>
  <article class="cartao">Dois</article>
  <article class="cartao">Três</article>
</section>`,
        blanks: [
          { placeholder: 'colunas no celular', size: 4 },
          { placeholder: 'condição', size: 9 },
          { placeholder: 'quantas', size: 2 },
        ],
        tests: [
          {
            description: 'no celular, uma coluna só',
            assertion: `${AJUDANTES}
              const r = regraBase('.cartoes');
              if (!r) throw new Error('A regra base .cartoes sumiu.');
              const n = trilhas(r.getPropertyValue('grid-template-columns')).length;
              if (n !== 1) throw new Error('A regra base é a do celular: uma coluna (1fr). Encontrei ' + n + '.');
            `,
          },
          {
            description: 'a media query é de min-width, mobile-first',
            assertion: `${AJUDANTES}
              const r = regraEmMedia((t) => minWidthPx(t) === 600, '.cartoes');
              if (!r) throw new Error('Esperava um @media (min-width: 600px) com uma regra .cartoes dentro. Mobile-first acrescenta com min-width, não desfaz com max-width.');
            `,
          },
          {
            description: 'a partir de 600px, três colunas',
            assertion: `${AJUDANTES}
              const r = regraEmMedia((t) => minWidthPx(t) === 600, '.cartoes');
              const n = r ? trilhas(r.getPropertyValue('grid-template-columns')).length : 0;
              if (n !== 3) throw new Error('Dentro do @media, .cartoes precisa de três colunas: repeat(3, 1fr). Encontrei ' + n + '.');
            `,
          },
        ],
        hints: [
          'No celular, os cartões empilham: quantas colunas é isso?',
          'A condição que "acrescenta a partir de" uma largura começa com min.',
        ],
        solution: ['1fr', 'min-width', '3'],
        explanation:
          '`1fr` na base é a coluna única do celular. `@media (min-width: 600px)` lê-se "a partir de 600 pixels de largura" — e dentro dela, `repeat(3, 1fr)` vira três colunas. Abaixo de 600 a regra de dentro nem existe; acima, ela se soma por cima da base. É toda a mecânica do mobile-first em nove linhas.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-5-ordenar-avaliacao',
        type: 'order-steps',
        prompt:
          'O que o navegador de um telefone faz com o seu CSS. Coloque na ordem.',
        concepts: ['css-responsivo'],
        difficulty: 'intermediario',
        tags: ['css', 'responsivo'],
        steps: [
          {
            id: 'viewport',
            text: 'Lê a meta `viewport` e adota a largura real da tela como largura de layout',
            ordem: 1,
          },
          {
            id: 'base',
            text: 'Aplica as regras que estão fora de qualquer `@media` — a base, a do celular',
            ordem: 2,
          },
          {
            id: 'avalia',
            text: 'Avalia a condição de cada `@media` contra a largura atual',
            ordem: 3,
          },
          {
            id: 'soma',
            text: 'As que casam aplicam suas regras por cima da base, na ordem em que aparecem',
            ordem: 4,
          },
          {
            id: 'gira',
            text: 'Ao girar o aparelho ou redimensionar a janela, reavalia os `@media` e reaplica',
            ordem: 5,
          },
        ],
        explanation:
          'Sem a meta `viewport`, o primeiro passo dá errado — o telefone finge ter 980px — e nenhum `@media (min-width: 600px)` casa como você esperava. O último passo é o que faz a página responder a uma janela sendo arrastada: a reavaliação é contínua, e é por isso que se chama responsivo.',
        hints: [
          'Antes de decidir qualquer regra, o navegador precisa saber quanto de largura tem.',
          'As regras condicionais só fazem sentido depois das incondicionais.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-5-pagina',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'A página inteira, mobile-first. No celular, as quatro regiões **empilhadas** numa coluna, nesta ordem: cabecalho, menu, conteudo, rodape. A partir de **700px**, duas colunas (**200px** e **1fr**) com o cabeçalho e o rodapé atravessando as duas, e o menu ao lado do conteúdo.\n\nAs regras de `grid-area` já estão prontas; escreva a `.pagina` base e a media query.',
        concepts: ['css-responsivo'],
        difficulty: 'intermediario',
        tags: ['css', 'responsivo', 'grid'],
        initialCode: `<style>
  .pagina {
    display: grid;
    gap: 12px;
    /* celular: uma coluna, quatro áreas empilhadas */
  }

  /* a partir de 700px: duas colunas, cabeçalho e rodapé atravessando */

  header { grid-area: cabecalho; }
  nav    { grid-area: menu; }
  main   { grid-area: conteudo; }
  footer { grid-area: rodape; }
</style>

<div class="pagina">
  <header>Cabeçalho</header>
  <nav>Menu</nav>
  <main>Conteúdo</main>
  <footer>Rodapé</footer>
</div>
`,
        tests: [
          {
            description: 'no celular, as quatro áreas empilham numa coluna',
            assertion: `${AJUDANTES}
              const r = regraBase('.pagina');
              if (!r) throw new Error('A regra base .pagina sumiu.');
              const areas = r.getPropertyValue('grid-template-areas').replace(/\\s+/g, ' ').trim();
              const esperado = '"cabecalho" "menu" "conteudo" "rodape"';
              if (areas !== esperado) throw new Error('Na base, grid-template-areas tem quatro linhas de uma célula: "cabecalho" "menu" "conteudo" "rodape". Veio ' + (areas || '(nada)') + '.');
            `,
          },
          {
            description: 'há uma media query de min-width: 700px para a página',
            assertion: `${AJUDANTES}
              if (!regraEmMedia((t) => minWidthPx(t) === 700, '.pagina')) throw new Error('Esperava um @media (min-width: 700px) com uma regra .pagina dentro.');
            `,
          },
          {
            description: 'a partir de 700px, duas colunas de 200px e 1fr',
            assertion: `${AJUDANTES}
              const r = regraEmMedia((t) => minWidthPx(t) === 700, '.pagina');
              const cols = r ? trilhas(r.getPropertyValue('grid-template-columns')) : [];
              if (cols.length !== 2 || cols[0] !== '200px') throw new Error('Dentro do @media, .pagina precisa de grid-template-columns: 200px 1fr. Veio "' + cols.join(' ') + '".');
            `,
          },
          {
            description: 'a partir de 700px, cabeçalho e rodapé atravessam as duas colunas',
            assertion: `${AJUDANTES}
              const r = regraEmMedia((t) => minWidthPx(t) === 700, '.pagina');
              const areas = r ? r.getPropertyValue('grid-template-areas').replace(/\\s+/g, ' ').trim() : '';
              const esperado = '"cabecalho cabecalho" "menu conteudo" "rodape rodape"';
              if (areas !== esperado) throw new Error('Dentro do @media, as áreas são "cabecalho cabecalho" / "menu conteudo" / "rodape rodape". Veio ' + (areas || '(nada)') + '.');
            `,
          },
          {
            description: 'mobile-first: nenhuma media query de max-width',
            assertion: `${AJUDANTES}
              for (const folha of document.styleSheets) for (const r of folha.cssRules) {
                if (r.media && /max-width/.test(r.media.mediaText)) throw new Error('A base já é a do celular; a media query só acrescenta, com min-width.');
              }
            `,
            hidden: true,
          },
        ],
        hints: [
          'A base tem `grid-template-areas` com quatro strings de uma palavra cada.',
          'O `@media (min-width: 700px)` repete a regra `.pagina` com as colunas e as áreas da aula de grid.',
          '.pagina {\n  display: grid;\n  gap: 12px;\n  grid-template-areas:\n    "cabecalho"\n    "menu"\n    "conteudo"\n    "rodape";\n}\n@media (min-width: 700px) {\n  .pagina {\n    grid-template-columns: 200px 1fr;\n    grid-template-areas:\n      "cabecalho cabecalho"\n      "menu conteudo"\n      "rodape rodape";\n  }\n}',
        ],
        solution: `<style>
  .pagina {
    display: grid;
    gap: 12px;
    grid-template-areas:
      "cabecalho"
      "menu"
      "conteudo"
      "rodape";
  }

  @media (min-width: 700px) {
    .pagina {
      grid-template-columns: 200px 1fr;
      grid-template-areas:
        "cabecalho cabecalho"
        "menu      conteudo"
        "rodape    rodape";
    }
  }

  header { grid-area: cabecalho; }
  nav    { grid-area: menu; }
  main   { grid-area: conteudo; }
  footer { grid-area: rodape; }
</style>

<div class="pagina">
  <header>Cabeçalho</header>
  <nav>Menu</nav>
  <main>Conteúdo</main>
  <footer>Rodapé</footer>
</div>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-5-breakpoint',
        type: 'multiple-choice',
        prompt: 'Como escolher em que largura colocar uma media query?',
        concepts: ['css-responsivo'],
        difficulty: 'intermediario',
        tags: ['css', 'responsivo'],
        options: [
          'Pelos tamanhos dos aparelhos mais vendidos no ano',
          'Sempre 768px, que é o padrão de tablet',
          'Estreitando a janela até o layout quebrar: o ponto de quebra é onde o conteúdo pede',
          'Uma para cada 100px, para cobrir todos os casos',
        ],
        correctIndex: 2,
        explanation:
          'Aparelhos mudam todo ano e "tablet" não é uma largura. O que não muda é o conteúdo: três cartões de 200px precisam de uns 650px para caber lado a lado, e é isso que decide o número. Costuma cair em poucos valores redondos — mas porque o conteúdo pediu, não porque um aparelho mandou.',
        hints: ['Quem manda no ponto de quebra: o aparelho ou o que está na tela?'],
      },
    },
    {
      kind: 'summary',
      markdown: `A página nasce fluida; o trabalho é não quebrá-la: \`max-width\` em vez de \`width\`, \`max-width: 100%\` nas imagens, \`60ch\` para o texto. A meta \`viewport\` faz o telefone usar a largura real. E quando a adaptação natural não basta, media queries **mobile-first**: a base é a do celular, e \`@media (min-width: …)\` acrescenta colunas onde o conteúdo pede — nunca onde um aparelho manda.`,
    },
  ],
};

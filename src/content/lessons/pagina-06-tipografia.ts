import type { Lesson } from '../types';

import { AJUDANTES_CSS } from './_ajudantes-css';

// Tamanhos em rem, line-height sem unidade, ch: o navegador resolve tudo em
// px, o jsdom devolve o declarado. Os testes leem a folha de estilo, onde o
// valor é o que o aluno escreveu nos dois. Veja `_ajudantes-css.ts`.
const AJUDANTES = AJUDANTES_CSS;

export const lessonTipografia: Lesson = {
  id: 'lesson-pagina-6',
  trackId: 'track-pagina',
  title: 'Tipografia: O Texto que se Lê Sem Esforço',
  language: 'html',
  objective:
    'Escolher fonte, tamanho, entrelinha e medida de linha com as unidades certas — e montar uma escala de títulos que o leitor sente antes de perceber.',
  concepts: ['css-tipografia'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Noventa por cento de uma página é texto. Se o texto está bom, a página parece bem-feita antes de qualquer cor ou imagem; se está ruim, nada salva. E "bom" aqui não é gosto: são quatro decisões com regras conhecidas.

## 1. A fonte

\`font-family\` recebe uma **lista**: o navegador usa a primeira que existir no aparelho, e vai descendo. Por isso a lista sempre termina numa **família genérica** — \`sans-serif\`, \`serif\` ou \`monospace\` —, que todo aparelho tem:

~~~css
body {
  font-family: system-ui, sans-serif;
}
code {
  font-family: ui-monospace, monospace;
}
~~~

\`system-ui\` é a fonte da interface do próprio sistema: bonita, já instalada, sem download. Fontes da web (Google Fonts e afins) são um arquivo a mais para baixar; nas páginas desta trilha, que não têm rede, a lista é o que há — e é o que basta.

## 2. O tamanho: rem, nunca px

O navegador tem um tamanho base de texto: 16 pixels, por padrão. Quem tem dificuldade de leitura **aumenta esse número** nas configurações — e um site em \`px\` ignora a escolha da pessoa. \`rem\` é "vezes o tamanho base": \`1rem\` são os 16px de quem não mexeu em nada, e 20px de quem pediu texto maior.

~~~css
body { font-size: 1rem; }      /* o texto corrido: nunca menos que isto */
small { font-size: 0.875rem; } /* 14px: o mínimo para algo que se lê */
~~~

A regra: **texto corrido em \`1rem\`**, e nada que se leia abaixo de \`0.875rem\`.

## 3. A entrelinha: um número sem unidade

\`line-height\` é a altura de cada linha. Para texto corrido, entre **1.4 e 1.6** — e sem unidade:

~~~css
body { line-height: 1.5; }
h1   { line-height: 1.1; }
~~~

Sem unidade, o valor é um **multiplicador do tamanho da fonte do próprio elemento**: um \`h1\` grande ganha uma entrelinha proporcional. Com \`px\` ou \`rem\`, os filhos herdam um valor fixo, e um título de \`2rem\` fica com entrelinha de parágrafo — as linhas se sobrepõem. É o erro mais comum de entrelinha, e o mais silencioso.

Títulos pedem menos: \`1.1\` a \`1.2\`. Linhas grandes com muito espaço entre elas parecem soltas.

## 4. A medida: 45 a 75 caracteres

Uma linha longa demais cansa: o olho perde o começo da próxima. \`max-width: 60ch\` no bloco de texto resolve, e você já usou na aula passada. É a decisão tipográfica que mais gente esquece, e a que mais se sente.

## A escala de títulos

Títulos não são "texto maior": são uma **hierarquia**, e a hierarquia precisa de saltos claros. Uma escala simples, que funciona:

~~~css
h1 { font-size: 2rem;    font-weight: 700; line-height: 1.1; }
h2 { font-size: 1.5rem;  font-weight: 700; line-height: 1.2; }
h3 { font-size: 1.25rem; font-weight: 600; line-height: 1.3; }
~~~

Cada nível é visivelmente diferente do vizinho. Se dois níveis ficam parecidos, o leitor não percebe a estrutura — e a estrutura era o ponto.

## Detalhes que fazem diferença

- **Rótulos em maiúsculas** (\`text-transform: uppercase\`) precisam de \`letter-spacing\` — \`0.06em\` a \`0.1em\` — porque maiúsculas juntas ficam apertadas. É o mesmo "sotaque" dos rótulos monoespaçados deste aplicativo.
- **\`text-wrap: balance\`** em títulos evita a última linha com uma palavra sozinha. É recente e cai bem em todo título curto.
- **Nunca justifique** (\`text-align: justify\`) na web: os espaços irregulares entre palavras são piores que a margem irregular.

## Os erros

- \`font-size\` em \`px\`: ignora quem aumentou o texto do sistema.
- \`line-height: 1\` ou com unidade: linhas grudadas, ou títulos com entrelinha de parágrafo.
- Linha sem limite de largura numa tela larga: 150 caracteres por linha, ninguém lê.
- Quatro fontes na mesma página. Uma para o texto, no máximo outra para os títulos, e a monoespaçada para código.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  body {
    font-family: system-ui, sans-serif;
    font-size: 1rem;
    line-height: 1.5;
    max-width: 60ch;
    margin: 0 auto;
    padding: 16px;
  }

  h1 { font-size: 2rem; line-height: 1.1; text-wrap: balance; }
  h2 { font-size: 1.5rem; line-height: 1.2; }

  .rotulo {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #4b5f5a;
  }
</style>

<p class="rotulo">Receita</p>
<h1>Pão de fermentação natural em casa</h1>
<p>Farinha, água, sal e tempo. O resto é paciência, e um pouco de atenção à temperatura da cozinha.</p>
<h2>Ingredientes</h2>
<p>500 g de farinha, 350 ml de água, 10 g de sal e 100 g de fermento natural ativo.</p>`,
      caption:
        'Quatro decisões, no `body`: a lista de fontes com a genérica no fim, `1rem`, `line-height: 1.5` sem unidade, `60ch` de medida. O rótulo em maiúsculas ganha `letter-spacing`, e o título ganha `text-wrap: balance` para não sobrar uma palavra sozinha na última linha.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-6-rem',
        type: 'multiple-choice',
        prompt:
          'Uma pessoa configurou o navegador para texto maior (20px em vez de 16px). Que declaração respeita essa escolha?',
        concepts: ['css-tipografia'],
        difficulty: 'iniciante',
        tags: ['css', 'tipografia'],
        options: [
          '`font-size: 16px`',
          '`font-size: 1rem`',
          '`font-size: 12pt`',
          '`font-size: 100vw`',
        ],
        correctIndex: 1,
        explanation:
          '`rem` é relativo ao tamanho base do navegador: `1rem` vira 20px para quem pediu texto maior, e 16px para quem não mexeu. `px` e `pt` são absolutos e ignoram a pessoa. `vw` é relativo à largura da tela — nada a ver com a preferência de leitura, e `100vw` daria letras do tamanho da janela.',
        hints: ['Qual unidade é "vezes o tamanho que a pessoa escolheu"?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-6-corpo',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Configure o texto do `body`: uma lista de fontes que termine em `sans-serif`, tamanho de **1rem**, entrelinha de **1.5** sem unidade, e medida de **60ch**.',
        concepts: ['css-tipografia'],
        difficulty: 'iniciante',
        tags: ['css', 'tipografia'],
        initialCode: `<style>
  body {
    /* fonte, tamanho, entrelinha, medida */
  }
</style>

<h1>Sobre entrelinhas</h1>
<p>Uma entrelinha generosa deixa o olho voltar ao começo da linha seguinte sem se perder. Entre 1.4 e 1.6 costuma ser o ponto certo para texto corrido, e é o que este parágrafo usa.</p>
<p>Um segundo parágrafo, para a medida de linha aparecer: repare que o texto para de crescer antes de a janela acabar.</p>
`,
        tests: [
          {
            description: 'a lista de fontes termina numa família genérica sans-serif',
            assertion: `${AJUDANTES}
              const v = declarado('body', 'font-family');
              if (!v) throw new Error('Falta font-family no body.');
              const partes = v.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
              if (partes[partes.length - 1] !== 'sans-serif') throw new Error('A lista precisa terminar em sans-serif, a família genérica que todo aparelho tem. Veio "' + v + '".');
            `,
          },
          {
            description: 'o tamanho é 1rem',
            assertion: `${AJUDANTES}
              const v = declarado('body', 'font-size');
              if (v !== '1rem') throw new Error('O texto corrido é 1rem — em rem, para respeitar quem aumentou o texto. Veio "' + (v || '(nada)') + '".');
            `,
          },
          {
            description: 'a entrelinha é 1.5, sem unidade',
            assertion: `${AJUDANTES}
              const v = declarado('body', 'line-height');
              if (v !== '1.5') throw new Error('line-height: 1.5, sem unidade, para os títulos herdarem um multiplicador e não um valor fixo. Veio "' + (v || '(nada)') + '".');
            `,
          },
          {
            description: 'a medida de linha é 60ch',
            assertion: `${AJUDANTES}
              const v = declarado('body', 'max-width');
              if (v !== '60ch') throw new Error('max-width: 60ch limita cada linha a uns 60 caracteres. Veio "' + (v || '(nada)') + '".');
            `,
          },
        ],
        hints: [
          'Quatro propriedades: `font-family`, `font-size`, `line-height`, `max-width`.',
          'A entrelinha é um número puro — sem px, sem rem.',
          'body {\n  font-family: system-ui, sans-serif;\n  font-size: 1rem;\n  line-height: 1.5;\n  max-width: 60ch;\n}',
        ],
        solution: `<style>
  body {
    font-family: system-ui, sans-serif;
    font-size: 1rem;
    line-height: 1.5;
    max-width: 60ch;
  }
</style>

<h1>Sobre entrelinhas</h1>
<p>Uma entrelinha generosa deixa o olho voltar ao começo da linha seguinte sem se perder. Entre 1.4 e 1.6 costuma ser o ponto certo para texto corrido, e é o que este parágrafo usa.</p>
<p>Um segundo parágrafo, para a medida de linha aparecer: repare que o texto para de crescer antes de a janela acabar.</p>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-6-lacuna-escala',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt:
          'Complete a escala de títulos: `h1` com **2rem**, `h2` com **1.5rem**, e a entrelinha dos títulos mais apertada que a do texto — **1.1** no `h1`.',
        concepts: ['css-tipografia'],
        difficulty: 'iniciante',
        tags: ['css', 'tipografia'],
        template: `<style>
  body { font-size: 1rem; line-height: 1.5; }

  h1 { font-size: {{1}}; line-height: {{3}}; }
  h2 { font-size: {{2}}; line-height: 1.2; }
</style>

<h1>Um título de primeiro nível</h1>
<p>O texto corrido, em 1rem.</p>
<h2>Um título de segundo nível</h2>
<p>Mais texto corrido.</p>`,
        blanks: [
          { placeholder: 'h1', size: 6 },
          { placeholder: 'h2', size: 6 },
          { placeholder: 'entrelinha', size: 4 },
        ],
        tests: [
          {
            description: 'o h1 tem 2rem',
            assertion: `${AJUDANTES}
              const v = declarado('h1', 'font-size');
              if (v !== '2rem') throw new Error('h1 é o maior salto da escala: 2rem. Veio "' + (v || '(nada)') + '".');
            `,
          },
          {
            description: 'o h2 tem 1.5rem',
            assertion: `${AJUDANTES}
              const v = declarado('h2', 'font-size');
              if (v !== '1.5rem') throw new Error('h2 fica entre o h1 e o texto: 1.5rem. Veio "' + (v || '(nada)') + '".');
            `,
          },
          {
            description: 'a entrelinha do h1 é 1.1',
            assertion: `${AJUDANTES}
              const v = declarado('h1', 'line-height');
              if (v !== '1.1') throw new Error('Título grande pede entrelinha apertada: 1.1, sem unidade. Veio "' + (v || '(nada)') + '".');
            `,
          },
        ],
        hints: [
          'Os dois tamanhos são em rem; a entrelinha é um número puro.',
          'A escala da aula: 2, 1.5, 1.25 — o h1 e o h2 são os dois primeiros.',
        ],
        solution: ['2rem', '1.5rem', '1.1'],
        explanation:
          'Cada nível da escala é visivelmente diferente do vizinho: 2rem, 1.5rem e o texto em 1rem. E a entrelinha acompanha ao contrário — quanto maior a letra, mais apertada a entrelinha, porque o espaço que fica bom em 16px fica solto em 32. Por ser um multiplicador sem unidade, `1.1` no `h1` vale 1.1 vezes os 2rem dele, não 1.1 vezes o texto.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-6-ordenar-cascata',
        type: 'order-steps',
        prompt:
          'Como o navegador chega ao tamanho final de um `h2` com `font-size: 1.5rem` numa página cujo `body` tem `font-size: 1rem`, para uma pessoa que configurou o texto do navegador em 20px. Coloque os passos na ordem.',
        concepts: ['css-tipografia'],
        difficulty: 'intermediario',
        tags: ['css', 'tipografia'],
        steps: [
          { id: 'pref', text: 'A pessoa definiu 20px como tamanho de texto nas configurações do navegador', ordem: 1 },
          { id: 'raiz', text: 'O elemento raiz (`html`) passa a ter 20px como tamanho base — é isso que `1rem` significa', ordem: 2 },
          { id: 'body', text: '`body { font-size: 1rem }` resolve para 20px', ordem: 3 },
          { id: 'h2', text: '`h2 { font-size: 1.5rem }` resolve para 30px: 1.5 vezes a raiz, e não 1.5 vezes o `body`', ordem: 4 },
          { id: 'lh', text: 'A entrelinha sem unidade do `h2` é calculada sobre esses 30px', ordem: 5 },
        ],
        explanation:
          'O `r` de `rem` é *root*: a raiz. Tudo se ancora no tamanho que a pessoa escolheu, e é isso que faz a página inteira crescer junto quando ela pede texto maior — sem nenhum código seu. O último passo é o motivo de a entrelinha ser um número sem unidade: ela é recalculada sobre o tamanho final de cada elemento.',
        hints: [
          'Tudo começa numa escolha que não é sua.',
          '`rem` mede a partir da raiz, e a raiz vem antes do `body`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-6-rotulo',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Faça o rótulo acima do título virar um rótulo de verdade: maiúsculas (`text-transform`), **letter-spacing** entre 0.05em e 0.12em, tamanho de **0.75rem** e peso **700**.\n\nEscreva a regra `.rotulo`.',
        concepts: ['css-tipografia'],
        difficulty: 'intermediario',
        tags: ['css', 'tipografia'],
        initialCode: `<style>
  body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 60ch; }
  h1 { font-size: 2rem; line-height: 1.1; }

  .rotulo {
    /* maiúsculas, espaçadas, pequenas e fortes */
  }
</style>

<p class="rotulo">Receita</p>
<h1>Pão de fermentação natural em casa</h1>
<p>Farinha, água, sal e tempo.</p>
`,
        tests: [
          {
            description: 'o rótulo está em maiúsculas',
            assertion: `
              const r = document.querySelector('.rotulo');
              if (!r) throw new Error('O elemento .rotulo sumiu do HTML.');
              if (getComputedStyle(r).textTransform !== 'uppercase') throw new Error('text-transform: uppercase põe o rótulo em maiúsculas sem mudar o texto no HTML.');
            `,
          },
          {
            description: 'as maiúsculas estão espaçadas',
            assertion: `${AJUDANTES}
              const v = declarado('.rotulo', 'letter-spacing');
              const m = /^(\\d*\\.?\\d+)em$/.exec(v);
              if (!m || Number(m[1]) < 0.05 || Number(m[1]) > 0.12) throw new Error('Maiúsculas juntas ficam apertadas: letter-spacing entre 0.05em e 0.12em. Veio "' + (v || '(nada)') + '".');
            `,
          },
          {
            description: 'o tamanho é 0.75rem',
            assertion: `${AJUDANTES}
              const v = declarado('.rotulo', 'font-size');
              if (v !== '0.75rem') throw new Error('Um rótulo é discreto: 0.75rem. Veio "' + (v || '(nada)') + '".');
            `,
          },
          {
            description: 'o peso é 700',
            assertion: `
              const w = getComputedStyle(document.querySelector('.rotulo')).fontWeight;
              if (w !== '700' && w !== 'bold') throw new Error('Pequeno e discreto, mas forte: font-weight: 700. Veio ' + w + '.');
            `,
          },
        ],
        hints: [
          'Quatro propriedades: a transformação do texto, o espaço entre letras, o tamanho, o peso.',
          'O espaço entre letras é em `em`, porque acompanha o tamanho da própria letra.',
          '.rotulo {\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n  font-size: 0.75rem;\n  font-weight: 700;\n}',
        ],
        solution: `<style>
  body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 60ch; }
  h1 { font-size: 2rem; line-height: 1.1; }

  .rotulo {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.75rem;
    font-weight: 700;
  }
</style>

<p class="rotulo">Receita</p>
<h1>Pão de fermentação natural em casa</h1>
<p>Farinha, água, sal e tempo.</p>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-6-sobrepostas',
        type: 'multiple-choice',
        prompt:
          'O `body` tem `line-height: 24px`. Os títulos `h1`, de 2rem, aparecem com as linhas sobrepostas. Por quê?',
        concepts: ['css-tipografia'],
        difficulty: 'intermediario',
        tags: ['css', 'tipografia'],
        options: [
          'Porque 24px é pouco para qualquer texto',
          'Porque o h1 herdou os 24px fixos — entrelinha de parágrafo numa letra de 32px. Sem unidade, ele herdaria um multiplicador',
          'Porque títulos não aceitam line-height',
          'Porque falta `text-wrap: balance`',
        ],
        correctIndex: 1,
        explanation:
          'Com unidade, o valor **calculado** (24px) é o que os filhos herdam: o `h1` de 32px recebe uma entrelinha menor que a própria letra, e as linhas se sobrepõem. Sem unidade, o que se herda é o **fator** (1.5), recalculado sobre o tamanho de cada elemento — o `h1` ficaria com 48px. É por isso que a aula insiste: `line-height` sem unidade, sempre.',
        hints: ['O que o h1 herda do body: um número fixo, ou uma proporção?'],
      },
    },
    {
      kind: 'summary',
      markdown: `Quatro decisões fazem o texto: a lista de fontes com a genérica no fim; o tamanho em \`rem\` (\`1rem\` para o corpo, nunca abaixo de \`0.875rem\`); a entrelinha como número sem unidade (\`1.5\` no texto, \`1.1\` nos títulos); e a medida de 45 a 75 caracteres com \`max-width: 60ch\`. Títulos formam uma escala com saltos claros, rótulos em maiúsculas ganham \`letter-spacing\`, e nada se justifica.`,
    },
  ],
};

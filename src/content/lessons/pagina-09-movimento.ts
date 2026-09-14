import type { Lesson } from '../types';

import { AJUDANTES_CSS } from './_ajudantes-css';

/**
 * Movimento não se observa de dentro de um teste — uma transição de 200ms
 * é, para a asserção, um valor final. Os testes leem a folha de estilo: o
 * `transition` declarado (o Chromium serializa "200ms" como "0.2s", o jsdom
 * mantém como escrito — `duracoesMs` aceita os dois), o `@keyframes` pelo
 * nome, e o `@media (prefers-reduced-motion: reduce)` pela condição.
 */
const AJUDANTES = `${AJUDANTES_CSS}
  function duracoesMs(texto) {
    const achados = [];
    const re = /(\\d*\\.?\\d+)(ms|s)\\b/g;
    let m;
    while ((m = re.exec(String(texto || '')))) achados.push(m[2] === 's' ? Number(m[1]) * 1000 : Number(m[1]));
    return achados;
  }
  function keyframes(nome) {
    for (const folha of document.styleSheets) for (const r of folha.cssRules) {
      if (r.name === nome && r.cssRules) return r;
    }
    return null;
  }
`;

export const lessonMovimento: Lesson = {
  id: 'lesson-pagina-9',
  trackId: 'track-pagina',
  title: 'Movimento: Transições que Explicam',
  language: 'html',
  objective:
    'Usar transições e animações curtas para explicar o que mudou na tela — animando só o que é barato, e respeitando quem pediu menos movimento.',
  concepts: ['css-movimento'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Movimento numa interface tem uma função só: **explicar o que mudou**. Um botão que escurece de repente parece um erro de renderização; o mesmo botão escurecendo em 150 milissegundos parece responder ao toque. A diferença não é enfeite — é a tela dizendo "eu entendi".

## Transição: a mudança com duração

\`transition\` faz uma propriedade ir do valor antigo ao novo ao longo do tempo, em vez de pular:

~~~css
.botao {
  background: var(--marca);
  transition: background-color 150ms ease;
}
.botao:hover {
  background: var(--marca-escura);   /* agora leva 150ms para escurecer */
}
~~~

Três partes: **a propriedade** que se anima, **a duração**, e **a curva** — \`ease\` (acelera e desacelera, o padrão sensato), \`ease-out\` (começa rápido e assenta: bom para coisas que aparecem), \`linear\` (quase nunca; parece mecânico).

A transição fica no estado **de repouso**, não no \`:hover\`. Assim ela vale para ir e para voltar.

## O que animar — e o que não

Duas propriedades são baratas para o navegador animar: \`transform\` e \`opacity\`. Ele as trata na placa de vídeo, sem recalcular o layout da página. Tudo o mais — \`width\`, \`height\`, \`margin\`, \`top\` — obriga a recalcular a posição de todo mundo a cada quadro, e engasga no celular.

Então: para mover, \`transform: translateY(-2px)\`; para crescer, \`transform: scale(1.05)\`; para aparecer, \`opacity\`. Cor também é aceitável, porque é barata de pintar.

~~~css
.cartao {
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.cartao:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
}
~~~

E **nunca \`transition: all\`**: anima o que você não pediu, inclusive o layout, e um dia a página inteira desliza quando uma classe muda.

## Quanto tempo

Interface é rápida. **100 a 200ms** para respostas a toque (hover, foco, pressionar); **200 a 300ms** para coisas que entram ou saem (um menu, um aviso). Acima de 400ms a pessoa espera a animação em vez de usar a tela — e ela vai fazer isso centenas de vezes por dia.

## Animação: movimento sem gatilho

\`transition\` precisa de uma mudança de estado. Para algo que se move sozinho — um aviso que desliza ao entrar, um indicador de carregamento —, \`@keyframes\` descreve os quadros e \`animation\` os aplica:

~~~css
@keyframes aparecer {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.aviso {
  animation: aparecer 250ms ease-out;
}
~~~

## Quem pediu menos movimento

Movimento enjoa e desorienta uma parte das pessoas — há uma configuração no sistema para isso, e o CSS enxerga:

~~~css
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none;
    animation: none;
  }
}
~~~

Não é opcional. Este aplicativo faz exatamente isso com o confete de conclusão: quem pediu menos movimento não recebe confete. Toda página com movimento leva esse bloco.

## Os erros

- \`transition: all\`.
- Animar \`width\`, \`height\`, \`margin\` ou \`top\`. Use \`transform\`.
- Durações longas: 500ms num hover é uma eternidade.
- Esquecer \`prefers-reduced-motion\`.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  :root { --marca: #1f6660; --marca-escura: #164d48; }

  .botao {
    background: var(--marca);
    color: white;
    padding: 12px 16px;
    border: 0;
    border-radius: 8px;
    transition: background-color 150ms ease, transform 150ms ease;
  }
  .botao:hover { background: var(--marca-escura); }
  .botao:active { transform: translateY(1px); }

  @keyframes aparecer {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .aviso {
    padding: 12px 16px;
    background: #e6efec;
    animation: aparecer 250ms ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .botao, .aviso { transition: none; animation: none; }
  }
</style>

<button class="botao">Salvar</button>
<p class="aviso">Alterações salvas.</p>`,
      caption:
        'A transição vive no repouso do botão, e cobre ida e volta. O aviso entra com uma animação de 250ms — só `opacity` e `transform`, as duas propriedades baratas. E o bloco de `prefers-reduced-motion` desliga tudo para quem pediu.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-9-onde',
        type: 'multiple-choice',
        prompt: 'Para o botão escurecer suavemente ao passar o mouse **e** clarear suavemente ao sair, onde vai a `transition`?',
        concepts: ['css-movimento'],
        difficulty: 'iniciante',
        tags: ['css', 'movimento'],
        options: [
          'Em `.botao:hover`',
          'Em `.botao`, o estado de repouso',
          'Nos dois, com durações diferentes',
          'Em `:root`, para valer para tudo',
        ],
        correctIndex: 1,
        explanation:
          'A transição no repouso vale para **qualquer** mudança de estado, na ida e na volta. Em `.botao:hover` ela só existiria enquanto o mouse está em cima: a ida seria suave, e a volta — quando o `:hover` deixa de casar e a regra some — pularia. Em `:root` não faz nada: `transition` não é herdada.',
        hints: ['Quando o mouse sai, a regra de `:hover` ainda está valendo?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-9-botao',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Dê ao botão uma resposta suave: `transition` de **background-color** com **150ms** e curva `ease`, declarada no estado de repouso. O `:hover` já existe.\n\nSem `transition: all`.',
        concepts: ['css-movimento'],
        difficulty: 'iniciante',
        tags: ['css', 'movimento'],
        initialCode: `<style>
  :root { --marca: #1f6660; --marca-escura: #164d48; }

  .botao {
    background: var(--marca);
    color: white;
    padding: 12px 16px;
    border: 0;
    /* a transição vai aqui */
  }

  .botao:hover { background: var(--marca-escura); }
</style>

<button class="botao">Salvar</button>
`,
        tests: [
          {
            description: 'o botão tem uma transição de background-color',
            assertion: `${AJUDANTES}
              const t = declarado('.botao', 'transition');
              if (!t) throw new Error('Falta transition na regra .botao — no repouso, não no :hover.');
              if (!/background(-color)?/.test(t)) throw new Error('A propriedade que muda no hover é a cor de fundo: transition: background-color … . Veio "' + t + '".');
            `,
          },
          {
            description: 'a duração é 150ms',
            assertion: `${AJUDANTES}
              const d = duracoesMs(declarado('.botao', 'transition'));
              if (!d.includes(150)) throw new Error('Resposta a toque leva de 100 a 200ms; aqui, 150ms. Veio "' + declarado('.botao', 'transition') + '".');
            `,
          },
          {
            description: 'a curva é ease',
            assertion: `${AJUDANTES}
              // O Chromium omite "ease" ao serializar, porque é o padrão: a
              // curva certa é ease escrito, ou nenhuma curva escrita.
              const t = declarado('.botao', 'transition');
              const curva = (t.match(/\\b(ease-in-out|ease-in|ease-out|ease|linear|step-start|step-end|steps\\([^)]*\\)|cubic-bezier\\([^)]*\\))/) || [])[1];
              if (curva && curva !== 'ease') throw new Error('A curva ease acelera e desacelera — é o padrão sensato. Veio "' + t + '".');
            `,
          },
          {
            description: 'sem transition: all',
            assertion: `${AJUDANTES}
              if (/\\ball\\b/.test(declarado('.botao', 'transition'))) throw new Error('transition: all anima o que você não pediu, inclusive o layout. Nomeie a propriedade.');
            `,
            hidden: true,
          },
          {
            description: 'a transição está no repouso, não no :hover',
            assertion: `${AJUDANTES}
              if (declarado('.botao:hover', 'transition')) throw new Error('No :hover a transição só vale na ida; no repouso (.botao) vale para ir e voltar.');
            `,
            hidden: true,
          },
        ],
        hints: [
          'Uma linha na regra `.botao`: propriedade, duração, curva.',
          'A propriedade que muda é a cor de fundo; o nome longo dela é `background-color`.',
          '.botao { transition: background-color 150ms ease; }',
        ],
        solution: `<style>
  :root { --marca: #1f6660; --marca-escura: #164d48; }

  .botao {
    background: var(--marca);
    color: white;
    padding: 12px 16px;
    border: 0;
    transition: background-color 150ms ease;
  }

  .botao:hover { background: var(--marca-escura); }
</style>

<button class="botao">Salvar</button>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-9-lacuna-cartao',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt:
          'Complete o cartão que "levanta" ao passar o mouse: a propriedade barata para mover, a função que desloca na vertical, e a duração adequada a um hover.',
        concepts: ['css-movimento'],
        difficulty: 'iniciante',
        tags: ['css', 'movimento'],
        template: `<style>
  .cartao {
    padding: 16px;
    border: 1px solid #cbd5d1;
    transition: {{1}} {{3}} ease;
  }

  .cartao:hover {
    {{1}}: {{2}}(-4px);
  }
</style>

<article class="cartao">
  <h2>Um cartão</h2>
  <p>Passe o mouse por cima.</p>
</article>`,
        blanks: [
          { placeholder: 'propriedade', size: 9 },
          { placeholder: 'função', size: 10 },
          { placeholder: 'duração', size: 5 },
        ],
        tests: [
          {
            description: 'o cartão anima a propriedade barata, transform',
            assertion: `${AJUDANTES}
              const t = declarado('.cartao', 'transition');
              if (!/\\btransform\\b/.test(t)) throw new Error('Mover é transform — a propriedade que o navegador anima sem recalcular o layout. Veio "' + t + '".');
            `,
          },
          {
            description: 'no hover, o cartão sobe 4px com translateY',
            assertion: `${AJUDANTES}
              const v = declarado('.cartao:hover', 'transform');
              if (!/translateY\\(\\s*-4px\\s*\\)/.test(v)) throw new Error('Deslocar na vertical é translateY(-4px). Veio "' + (v || '(nada)') + '".');
            `,
          },
          {
            description: 'a duração fica entre 100 e 300ms',
            assertion: `${AJUDANTES}
              const d = duracoesMs(declarado('.cartao', 'transition'));
              if (!d.length) throw new Error('Falta a duração na transição.');
              if (d[0] < 100 || d[0] > 300) throw new Error('Um hover responde em 100 a 300ms; ' + d[0] + 'ms está fora disso.');
            `,
          },
        ],
        hints: [
          'A mesma palavra preenche a primeira lacuna nos dois lugares: é a propriedade que se anima e que muda no hover.',
          'A função que move no eixo Y tem o Y no nome. A duração vai em ms, na faixa de resposta a toque.',
        ],
        solution: ['transform', 'translateY', '200ms'],
        explanation:
          '`transform` no lugar de `top` ou `margin-top`: o cartão se move sem que nada em volta precise ser recalculado, e a animação fica lisa até em celular fraco. `translateY(-4px)` é "quatro pixels para cima". E 200ms é o suficiente para o olho perceber o movimento como resposta, e curto o suficiente para não atrasar ninguém.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-9-ordenar-quadro',
        type: 'order-steps',
        prompt:
          'O que acontece quando o mouse entra num botão com `transition: background-color 150ms`. Coloque na ordem.',
        concepts: ['css-movimento'],
        difficulty: 'intermediario',
        tags: ['css', 'movimento'],
        steps: [
          { id: 'hover', text: '`:hover` passa a casar e a regra dele entra em vigor', ordem: 1 },
          { id: 'novo', text: 'O navegador calcula o novo valor de `background-color`', ordem: 2 },
          { id: 'transicao', text: 'Como há uma `transition` para essa propriedade, ele não pula: interpola do valor antigo ao novo', ordem: 3 },
          { id: 'quadros', text: 'A cada quadro (uns 60 por segundo) pinta uma cor intermediária, seguindo a curva', ordem: 4 },
          { id: 'fim', text: 'Passados 150ms, a cor final fica; se o mouse sair antes, a transição inverte de onde estava', ordem: 5 },
        ],
        explanation:
          'A transição é uma interpolação entre dois valores computados, quadro a quadro. É por isso que só propriedades com valores interpoláveis animam (cor, número, comprimento — e não `display`), e por isso que uma transição interrompida no meio volta do ponto em que estava, sem pular: o navegador só troca o destino.',
        hints: [
          'Antes de animar, o navegador precisa saber para onde vai.',
          'A interpolação acontece em quadros, não de uma vez.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-9-aviso',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'O aviso precisa **entrar** na tela: crie um `@keyframes aparecer` que vai de `opacity: 0` a `opacity: 1`, aplique em `.aviso` com **250ms** e `ease-out`, e desligue tudo para quem pediu menos movimento com `@media (prefers-reduced-motion: reduce)`.',
        concepts: ['css-movimento'],
        difficulty: 'intermediario',
        tags: ['css', 'movimento', 'acessibilidade'],
        initialCode: `<style>
  .aviso {
    padding: 12px 16px;
    background: #e6efec;
    /* animation */
  }

  /* @keyframes aparecer */

  /* @media (prefers-reduced-motion: reduce) */
</style>

<p class="aviso">Alterações salvas.</p>
`,
        tests: [
          {
            description: 'existe um @keyframes aparecer que vai de opacity 0 a 1',
            assertion: `${AJUDANTES}
              const k = keyframes('aparecer');
              if (!k) throw new Error('Falta o @keyframes aparecer.');
              const quadros = [...k.cssRules].map((q) => (q.keyText || '') + '{' + q.style.getPropertyValue('opacity') + '}');
              const de = [...k.cssRules].find((q) => /^(from|0%)$/.test(q.keyText));
              const ate = [...k.cssRules].find((q) => /^(to|100%)$/.test(q.keyText));
              if (!de || de.style.getPropertyValue('opacity').trim() !== '0') throw new Error('O quadro inicial (from) precisa ter opacity: 0. Quadros: ' + quadros.join(' '));
              if (!ate || ate.style.getPropertyValue('opacity').trim() !== '1') throw new Error('O quadro final (to) precisa ter opacity: 1. Quadros: ' + quadros.join(' '));
            `,
          },
          {
            description: 'o aviso usa a animação com 250ms e ease-out',
            assertion: `${AJUDANTES}
              const a = declarado('.aviso', 'animation') || declarado('.aviso', 'animation-name');
              if (!/\\baparecer\\b/.test(a)) throw new Error('.aviso precisa de animation: aparecer 250ms ease-out. Veio "' + (a || '(nada)') + '".');
              const d = duracoesMs(declarado('.aviso', 'animation') || declarado('.aviso', 'animation-duration'));
              if (!d.includes(250)) throw new Error('A duração de algo que entra é de 200 a 300ms; aqui, 250ms. Veio "' + declarado('.aviso', 'animation') + '".');
              if (!/ease-out/.test(declarado('.aviso', 'animation') + ' ' + declarado('.aviso', 'animation-timing-function'))) throw new Error('Coisas que aparecem assentam com ease-out.');
            `,
          },
          {
            description: 'quem pediu menos movimento não recebe a animação',
            assertion: `${AJUDANTES}
              let ok = false;
              for (const folha of document.styleSheets) for (const r of folha.cssRules) {
                if (!r.media || !/prefers-reduced-motion:\\s*reduce/.test(r.media.mediaText)) continue;
                for (const interna of r.cssRules) {
                  const sel = (interna.selectorText || '').replace(/\\s+/g, '');
                  if (!/(^|,)(\\*|\\.aviso)(,|$)/.test(sel)) continue;
                  const v = interna.style.getPropertyValue('animation') || interna.style.getPropertyValue('animation-name');
                  if (/none/.test(v)) ok = true;
                }
              }
              if (!ok) throw new Error('Falta @media (prefers-reduced-motion: reduce) com .aviso { animation: none; } — movimento enjoa e desorienta uma parte das pessoas, e elas pediram.');
            `,
          },
        ],
        hints: [
          'Três blocos: o `@keyframes` com `from` e `to`, a `animation` no `.aviso`, e o `@media` que zera a animação.',
          '`animation` recebe o nome do keyframes, a duração e a curva — como `transition`, mas com nome no lugar da propriedade.',
          '@keyframes aparecer { from { opacity: 0; } to { opacity: 1; } }\n.aviso { animation: aparecer 250ms ease-out; }\n@media (prefers-reduced-motion: reduce) { .aviso { animation: none; } }',
        ],
        solution: `<style>
  .aviso {
    padding: 12px 16px;
    background: #e6efec;
    animation: aparecer 250ms ease-out;
  }

  @keyframes aparecer {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .aviso { animation: none; }
  }
</style>

<p class="aviso">Alterações salvas.</p>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-9-largura',
        type: 'multiple-choice',
        prompt:
          'Um painel lateral abre com `transition: width 300ms`. No celular a animação engasga. Por quê, e o que fazer?',
        concepts: ['css-movimento'],
        difficulty: 'intermediario',
        tags: ['css', 'movimento'],
        options: [
          '300ms é pouco; aumente para 600ms',
          '`width` obriga a recalcular o layout de toda a página a cada quadro; anime `transform: translateX()` no lugar',
          'Celular não suporta transições',
          'Falta `will-change: width`',
        ],
        correctIndex: 1,
        explanation:
          'Mudar `width` move tudo o que está ao lado, e o navegador refaz o layout da página inteira sessenta vezes por segundo. `transform` não mexe no layout: o painel é deslocado como uma imagem, na placa de vídeo, e fica liso em qualquer aparelho. A regra: mover e escalar é `transform`; aparecer é `opacity`; o resto, evite animar.',
        hints: ['Quais duas propriedades a aula chama de baratas?'],
      },
    },
    {
      kind: 'summary',
      markdown: `Movimento explica o que mudou. \`transition\` no estado de repouso, com propriedade nomeada (nunca \`all\`), 100 a 300ms e curva \`ease\` ou \`ease-out\`. Anime \`transform\` e \`opacity\` — as baratas — e não \`width\`, \`height\` ou \`top\`. \`@keyframes\` + \`animation\` para o que se move sem gatilho. E \`@media (prefers-reduced-motion: reduce)\` desliga tudo para quem pediu: não é opcional.`,
    },
  ],
};

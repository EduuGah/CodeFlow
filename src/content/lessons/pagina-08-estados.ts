import type { Lesson } from '../types';

import { AJUDANTES_CSS } from './_ajudantes-css';

// Pseudo-classes de interação (:hover, :focus-visible) não têm como ser
// disparadas de dentro de um teste, e o jsdom não computa pseudo-elementos:
// essas regras são lidas na folha de estilo. As estruturais (:nth-child,
// :not, :disabled, :checked) casam nos dois motores e são lidas computadas.
const AJUDANTES = AJUDANTES_CSS;

export const lessonEstados: Lesson = {
  id: 'lesson-pagina-8',
  trackId: 'track-pagina',
  title: 'Estados: A Página que Reage',
  language: 'html',
  objective:
    'Dar a cada controle os seus estados — hover, foco, pressionado, desabilitado, marcado — com as pseudo-classes certas, sem nunca apagar o anel de foco.',
  concepts: ['css-estados'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um botão não é uma cor: é um conjunto de **estados**. Em repouso, sob o mouse, com o foco do teclado, pressionado, desabilitado. Uma interface que só desenha o repouso parece morta — e, pior, esconde de quem usa teclado onde ele está.

CSS descreve estados com **pseudo-classes**: um dois-pontos e um nome depois do seletor.

## Os estados de interação

~~~css
.botao { background: var(--marca); color: white; }

.botao:hover  { background: var(--marca-escura); }   /* o mouse está em cima */
.botao:active { transform: translateY(1px); }        /* está sendo pressionado */

.botao:focus-visible {                                /* tem o foco, por teclado */
  outline: 3px solid var(--marca);
  outline-offset: 2px;
}

.botao:disabled {                                     /* não pode ser usado agora */
  opacity: 0.5;
  cursor: not-allowed;
}
~~~

Quatro pseudo-classes, quatro momentos. Duas regras sobre elas que não se negociam:

**\`:hover\` é um bônus, nunca a única forma.** Telefone não tem mouse. Um menu que só aparece no hover não existe para metade das pessoas.

**\`:focus-visible\` nunca some.** Quem navega por teclado — por escolha, por lesão, por leitor de tela — só sabe onde está pelo anel de foco. \`outline: none\` sem substituto é a forma mais comum de tornar um site inutilizável para essas pessoas. Se o anel padrão não combina com o design, **troque-o por outro**; não apague.

Por que \`:focus-visible\` e não \`:focus\`? \`:focus\` casa também no clique do mouse, e o anel aparecendo a cada clique incomoda — foi por isso que tanta gente apagou. \`:focus-visible\` casa só quando o navegador entende que o foco veio do teclado. É o melhor dos dois.

## Estados de formulário

\`:checked\` casa em caixas e rádios marcados, e com o combinador \`+\` (o irmão logo depois) estiliza o rótulo:

~~~css
input:checked + label { font-weight: 700; }
~~~

\`:disabled\`, \`:required\`, \`:invalid\` seguem a mesma ideia — o estado do controle vira seletor, sem nenhum JavaScript.

## Estados de posição

Não é só interação. A **posição** de um elemento entre os irmãos também é estado:

~~~css
li:nth-child(odd) { background: #f1f4f2; }   /* linhas zebradas: 1ª, 3ª, 5ª… */
li:last-child     { border-bottom: 0; }      /* a última não precisa de separador */
a:not(.ativo)     { color: var(--marca); }    /* todos, menos o da página atual */
~~~

\`:nth-child\` aceita \`odd\`, \`even\` ou uma fórmula (\`3n\`: a cada três). \`:not()\` inverte. E \`:first-child\` / \`:last-child\` resolvem o eterno "tirar a margem do último".

## Pseudo-elementos: o que não está no HTML

Dois-pontos duplos criam conteúdo **decorativo** que não existe no HTML:

~~~css
.tag::before { content: "#"; }
.externo::after { content: " ↗"; }
~~~

\`content\` é obrigatório, mesmo vazio. E "decorativo" é a palavra: o que vai em \`::before\` não é lido de forma confiável por leitores de tela, então nunca ponha ali informação que importa — só enfeite.

## Os erros

- \`outline: none\` sem substituto. Nunca.
- Informação que só aparece no \`:hover\`.
- Estilizar \`:focus\` em vez de \`:focus-visible\` e, cansado do anel a cada clique, apagá-lo.
- Texto importante em \`::before\`.
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
  }
  .botao:hover { background: var(--marca-escura); }
  .botao:active { transform: translateY(1px); }
  .botao:focus-visible { outline: 3px solid var(--marca); outline-offset: 2px; }
  .botao:disabled { opacity: 0.5; cursor: not-allowed; }

  li:nth-child(odd) { background: #f1f4f2; }
  li:last-child { border-bottom: 0; }
  li { padding: 8px; border-bottom: 1px solid #ddd; list-style: none; }

  input:checked + label { font-weight: 700; }
  .tag::before { content: "#"; color: #5f625d; }
</style>

<button class="botao">Salvar</button>
<button class="botao" disabled>Enviando…</button>

<ul>
  <li>Primeira linha</li>
  <li>Segunda linha</li>
  <li>Terceira linha</li>
</ul>

<input type="checkbox" id="ok" checked> <label for="ok">Concordo</label>
<p><span class="tag">css</span> <span class="tag">estados</span></p>`,
      caption:
        'Cada controle com os seus estados. Use Tab na pré-visualização e repare no anel do `:focus-visible`; clique com o mouse e repare que ele não aparece. O botão desabilitado não é só mais claro — o cursor também avisa.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-8-outline',
        type: 'multiple-choice',
        prompt:
          'O anel de foco padrão "não combina com o design". O que fazer?',
        concepts: ['css-estados'],
        difficulty: 'iniciante',
        tags: ['css', 'estados', 'acessibilidade'],
        options: [
          '`outline: none` — o design vem primeiro',
          'Trocar por um anel próprio em `:focus-visible`: `outline: 3px solid <cor>; outline-offset: 2px`',
          'Deixar o anel só em `:hover`',
          'Remover o `outline` e aumentar o `padding`, que já mostra que o botão é clicável',
        ],
        correctIndex: 1,
        explanation:
          'O anel é a única forma de quem navega por teclado saber onde está. Apagar sem substituir torna a página inutilizável para essas pessoas; o que se faz é **desenhar outro** — uma linha na cor da marca, afastada com `outline-offset`. E em `:focus-visible`, para o anel não aparecer a cada clique de mouse, que é o que levava tanta gente a apagá-lo.',
        hints: ['Quem usa só o teclado: como sabe qual botão está selecionado?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-8-botao',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Dê ao botão os seus estados. Escreva três regras:\n\n- `.botao:hover` com `background: var(--marca-escura)`\n- `.botao:focus-visible` com um `outline` sólido de **3px** e `outline-offset` de **2px**\n- `.botao:disabled` com `opacity: 0.5` e `cursor: not-allowed`',
        concepts: ['css-estados'],
        difficulty: 'iniciante',
        tags: ['css', 'estados'],
        initialCode: `<style>
  :root { --marca: #1f6660; --marca-escura: #164d48; }

  .botao {
    background: var(--marca);
    color: white;
    padding: 12px 16px;
    border: 0;
  }

  /* :hover, :focus-visible, :disabled */
</style>

<button class="botao">Salvar</button>
<button class="botao" disabled>Enviando…</button>
`,
        tests: [
          {
            description: 'sob o mouse, o botão escurece',
            assertion: `${AJUDANTES}
              const v = declarado('.botao:hover', 'background') || declarado('.botao:hover', 'background-color');
              if (!/var\\(--marca-escura\\)/.test(v)) throw new Error('Falta a regra .botao:hover com background: var(--marca-escura). Veio "' + (v || '(nada)') + '".');
            `,
          },
          {
            description: 'com foco do teclado, há um anel de 3px afastado do botão',
            assertion: `${AJUDANTES}
              const r = regraBase('.botao:focus-visible');
              if (!r) throw new Error('Falta a regra .botao:focus-visible — é ela que mostra onde o foco do teclado está.');
              const outline = r.getPropertyValue('outline');
              const largura = r.getPropertyValue('outline-width') || (outline.match(/(\\d+)px/) || [])[1];
              const estilo = r.getPropertyValue('outline-style') || (/solid/.test(outline) ? 'solid' : '');
              if (String(largura).replace('px', '') !== '3' || estilo !== 'solid') throw new Error('O anel precisa ser outline: 3px solid <cor>. Veio "' + (outline || '(nada)') + '".');
              if (r.getPropertyValue('outline-offset').trim() !== '2px') throw new Error('outline-offset: 2px afasta o anel da borda do botão. Veio "' + (r.getPropertyValue('outline-offset') || '(nada)') + '".');
            `,
          },
          {
            description: 'desabilitado, o botão fica translúcido e o cursor avisa',
            assertion: `
              const b = document.querySelector('.botao[disabled]');
              if (!b) throw new Error('O botão desabilitado sumiu do HTML.');
              const s = getComputedStyle(b);
              if (s.opacity !== '0.5') throw new Error('.botao:disabled precisa de opacity: 0.5. Veio ' + s.opacity + '.');
              if (s.cursor !== 'not-allowed') throw new Error('.botao:disabled precisa de cursor: not-allowed. Veio ' + s.cursor + '.');
            `,
          },
          {
            description: 'o anel de foco nunca é apagado',
            assertion: `${AJUDANTES}
              for (const sel of ['.botao:focus', '.botao:focus-visible', '.botao', 'button', '*']) {
                const r = regraBase(sel);
                if (r && /^(none|0)$/.test(r.getPropertyValue('outline').trim())) throw new Error('outline: none em ' + sel + ' apaga o único sinal de foco de quem usa teclado.');
              }
            `,
            hidden: true,
          },
        ],
        hints: [
          'Três regras, cada uma com o seletor `.botao` seguido de dois-pontos e o estado.',
          '`outline` recebe espessura, estilo e cor, como `border`.',
          '.botao:hover { background: var(--marca-escura); }\n.botao:focus-visible { outline: 3px solid var(--marca); outline-offset: 2px; }\n.botao:disabled { opacity: 0.5; cursor: not-allowed; }',
        ],
        solution: `<style>
  :root { --marca: #1f6660; --marca-escura: #164d48; }

  .botao {
    background: var(--marca);
    color: white;
    padding: 12px 16px;
    border: 0;
  }

  .botao:hover { background: var(--marca-escura); }
  .botao:focus-visible { outline: 3px solid var(--marca); outline-offset: 2px; }
  .botao:disabled { opacity: 0.5; cursor: not-allowed; }
</style>

<button class="botao">Salvar</button>
<button class="botao" disabled>Enviando…</button>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-8-lacuna-posicao',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt:
          'Complete as pseudo-classes de posição: linhas ímpares zebradas, a última sem separador, e todos os links **exceto** o ativo na cor da marca.',
        concepts: ['css-estados'],
        difficulty: 'iniciante',
        tags: ['css', 'estados'],
        template: `<style>
  li { padding: 8px; border-bottom: 1px solid #ddd; list-style: none; }

  li:nth-child({{1}}) { background: #f1f4f2; }
  li:{{2}} { border-bottom: 0; }
  a:{{3}}(.ativo) { color: #1f6660; }
</style>

<ul>
  <li>Primeira</li>
  <li>Segunda</li>
  <li>Terceira</li>
</ul>

<nav>
  <a href="#">Início</a>
  <a href="#" class="ativo">Aulas</a>
</nav>`,
        blanks: [
          { placeholder: 'ímpares', size: 4 },
          { placeholder: 'a última', size: 10 },
          { placeholder: 'exceto', size: 3 },
        ],
        tests: [
          {
            description: 'as linhas ímpares têm fundo; as pares, não',
            assertion: `
              const itens = document.querySelectorAll('li');
              const fundo = (i) => getComputedStyle(itens[i]).backgroundColor;
              if (fundo(0) !== 'rgb(241, 244, 242)' || fundo(2) !== 'rgb(241, 244, 242)') throw new Error('A primeira e a terceira linha (ímpares) precisam do fundo: nth-child(odd).');
              if (fundo(1) === 'rgb(241, 244, 242)') throw new Error('A segunda linha é par e não pode ter o fundo.');
            `,
          },
          {
            description: 'a última linha não tem separador',
            assertion: `
              const itens = document.querySelectorAll('li');
              const ultima = getComputedStyle(itens[itens.length - 1]).borderBottomWidth;
              if (ultima !== '0px') throw new Error('A última linha precisa de border-bottom: 0 — a pseudo-classe é last-child. Veio ' + ultima + '.');
              if (getComputedStyle(itens[0]).borderBottomWidth === '0px') throw new Error('Só a última perde o separador; a primeira precisa manter.');
            `,
          },
          {
            description: 'os links que não são o ativo ficam na cor da marca',
            assertion: `
              const links = document.querySelectorAll('nav a');
              if (getComputedStyle(links[0]).color !== 'rgb(31, 102, 96)') throw new Error('O link que NÃO é o ativo precisa da cor da marca: a:not(.ativo).');
              if (getComputedStyle(links[1]).color === 'rgb(31, 102, 96)') throw new Error('O link .ativo fica de fora: é o :not que exclui.');
            `,
          },
        ],
        hints: [
          'A primeira lacuna é uma palavra em inglês para "ímpar"; a segunda, a posição "última filha".',
          'A terceira inverte o seletor entre parênteses.',
        ],
        solution: ['odd', 'last-child', 'not'],
        explanation:
          'Três estados de **posição**, nenhum de interação: `:nth-child(odd)` casa na 1ª, 3ª, 5ª; `:last-child`, na última; `:not(.ativo)`, em tudo que não tem a classe. São o fim das classes `.par`, `.ultimo` e `.inativo` que se punha no HTML só para o CSS achar os elementos — a posição já diz.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-8-ordenar-foco',
        type: 'order-steps',
        prompt:
          'Uma pessoa navega por teclado até um botão e o aciona. Coloque na ordem o que acontece com os estados.',
        concepts: ['css-estados'],
        difficulty: 'intermediario',
        tags: ['css', 'estados', 'acessibilidade'],
        steps: [
          { id: 'tab', text: 'Tab move o foco para o botão', ordem: 1 },
          { id: 'fv', text: '`:focus-visible` passa a casar, e o anel aparece — o foco veio do teclado', ordem: 2 },
          { id: 'active', text: 'Enquanto Enter ou espaço está pressionado, `:active` casa', ordem: 3 },
          { id: 'click', text: 'Ao soltar, o evento de clique dispara e o botão faz o que faz', ordem: 4 },
          { id: 'fica', text: 'O foco continua no botão, com o anel, até a pessoa mover para outro lugar', ordem: 5 },
        ],
        explanation:
          'Repare no que **não** aconteceu: `:hover` nunca casou — não há mouse. Uma ação que dependesse de hover teria sido invisível. E o anel fica até o próximo Tab: é a âncora visual de toda a navegação por teclado, e é por isso que apagá-lo quebra tanto. Com o mouse a sequência é outra: `:focus` casa no clique, mas `:focus-visible` não — o navegador sabe que a pessoa está vendo o cursor.',
        hints: [
          'Antes de qualquer estado, o foco precisa chegar.',
          'Pressionar e soltar são dois momentos, e o clique só existe no segundo.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-8-marcado',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Sem JavaScript: quando a caixa estiver marcada, o rótulo logo depois dela fica em **negrito (700)** e ganha um " ✓" no fim, como enfeite.\n\nDuas regras: uma com `:checked` e o combinador `+`, outra com `::after`.',
        concepts: ['css-estados'],
        difficulty: 'intermediario',
        tags: ['css', 'estados'],
        initialCode: `<style>
  label { padding: 8px; }

  /* input:checked + label — negrito */

  /* input:checked + label::after — content: " ✓" */
</style>

<input type="checkbox" id="ok" checked>
<label for="ok">Concordo com os termos</label>
`,
        tests: [
          {
            description: 'com a caixa marcada, o rótulo fica em negrito',
            assertion: `
              const label = document.querySelector('label');
              const w = getComputedStyle(label).fontWeight;
              if (w !== '700' && w !== 'bold') throw new Error('input:checked + label precisa de font-weight: 700. Veio ' + w + '.');
            `,
          },
          {
            description: 'a regra usa :checked e o combinador +, sem classe no HTML',
            assertion: `${AJUDANTES}
              let achou = false;
              for (const folha of document.styleSheets) for (const r of folha.cssRules) {
                if (r.selectorText && /:checked\\s*\\+\\s*label/.test(r.selectorText) && !/::after/.test(r.selectorText)) achou = true;
              }
              if (!achou) throw new Error('O seletor é input:checked + label: o estado do controle vira seletor, sem JavaScript e sem classe.');
              if (document.querySelector('label').className) throw new Error('Nada de classe no rótulo — o :checked já diz o estado.');
            `,
          },
          {
            description: 'o enfeite " ✓" vem de um ::after com content',
            assertion: `${AJUDANTES}
              let conteudo = '';
              for (const folha of document.styleSheets) for (const r of folha.cssRules) {
                if (r.selectorText && /:checked\\s*\\+\\s*label::after/.test(r.selectorText)) conteudo = r.style.getPropertyValue('content');
              }
              if (!/✓/.test(conteudo)) throw new Error('Falta a regra input:checked + label::after com content: " ✓". Veio "' + (conteudo || '(nada)') + '".');
            `,
          },
        ],
        hints: [
          '`+` seleciona o irmão que vem logo depois: o `label` que segue o `input`.',
          'Pseudo-elemento precisa de `content`, e o texto vai entre aspas.',
          'input:checked + label { font-weight: 700; }\ninput:checked + label::after { content: " ✓"; }',
        ],
        solution: `<style>
  label { padding: 8px; }

  input:checked + label { font-weight: 700; }
  input:checked + label::after { content: " ✓"; }
</style>

<input type="checkbox" id="ok" checked>
<label for="ok">Concordo com os termos</label>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-8-hover-toque',
        type: 'multiple-choice',
        prompt:
          'O botão "Excluir" de cada item da lista só aparece com `:hover` sobre o item. Qual é o problema?',
        concepts: ['css-estados'],
        difficulty: 'iniciante',
        tags: ['css', 'estados'],
        options: [
          'Nenhum: é um padrão comum e fica limpo',
          'No celular não existe hover, então o botão nunca aparece — a ação some para metade das pessoas',
          '`:hover` é lento em listas grandes',
          'Deveria ser `:focus`, que é mais moderno',
        ],
        correctIndex: 1,
        explanation:
          'Telefone não tem cursor. Um controle que só existe no hover não existe no toque — e também não existe para quem navega por teclado até o item. Hover pode **destacar** o botão que já está lá; não pode ser a única forma de ele aparecer.',
        hints: ['Como você passa o mouse sobre alguma coisa num telefone?'],
      },
    },
    {
      kind: 'summary',
      markdown: `Um controle é um conjunto de estados: \`:hover\` (bônus, nunca a única forma), \`:focus-visible\` (o anel que nunca some — troca-se, não se apaga), \`:active\`, \`:disabled\`, \`:checked\`. A posição também é estado: \`:nth-child\`, \`:last-child\`, \`:not()\` dispensam classes no HTML. E \`::before\`/\`::after\` criam enfeite que não está no HTML — só enfeite, nunca informação.`,
    },
  ],
};

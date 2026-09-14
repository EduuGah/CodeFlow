import type { Lesson } from '../types';

export const lessonClasses: Lesson = {
  id: 'lesson-pagina-13',
  trackId: 'track-pagina',
  title: 'Classes: O Estado Vira Aparência',
  language: 'html',
  objective:
    'Mudar a aparência de um elemento trocando classes e atributos — o JavaScript decide o estado, o CSS decide como ele se parece.',
  concepts: ['dom-classes'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um item fica selecionado, um painel abre, a página vira escura. Cada uma dessas mudanças tem duas metades: **o estado** — o que aconteceu — e **a aparência** — como isso se mostra. O erro clássico é o JavaScript fazer as duas: \`item.style.background = 'teal'; item.style.color = 'white'; item.style.fontWeight = '700'\`… e três linhas depois, para desfazer, mais três. O jeito certo é dividir: o JavaScript **troca uma classe**; o CSS **sabe como a classe se parece**.

~~~css
.item.selecionado { background: var(--marca); color: white; }
~~~

~~~js
item.classList.add('selecionado');
~~~

## classList

\`classList\` é o conjunto de classes do elemento, com quatro métodos que cobrem tudo:

~~~js
el.classList.add('aberto');        // põe (se já tinha, nada muda)
el.classList.remove('aberto');     // tira (se não tinha, nada muda)
el.classList.toggle('aberto');     // inverte: põe se não tinha, tira se tinha
el.classList.contains('aberto');   // true ou false
~~~

\`toggle\` aceita um segundo argumento que decide: \`el.classList.toggle('escuro', temaEscuro)\` põe se \`temaEscuro\` for verdadeiro, tira se falso. É a forma de **sincronizar** uma classe com uma variável, sem \`if\`.

Nunca escreva em \`el.className = '...'\`: isso apaga todas as outras classes que o elemento tinha.

## Um estado, vários elementos

Abas: uma ativa, as outras não. O padrão é tirar de todas e pôr na escolhida:

~~~js
function ativar(indice) {
  const abas = document.querySelectorAll('.aba');
  abas.forEach((aba, i) => aba.classList.toggle('ativa', i === indice));
}
~~~

Uma linha por aba, e a classe reflete a comparação. Impossível ficar com duas ativas.

## Mostrar e esconder

Para sumir com algo, o atributo \`hidden\` — é HTML, o navegador entende, e leitores de tela também:

~~~js
painel.hidden = true;    // some
painel.hidden = false;   // volta
~~~

Se o seu CSS define \`display\` no elemento, ele pode vencer o \`hidden\`; nesse caso, uma classe \`.fechado { display: none }\` faz o mesmo papel.

## Atributos como estado

Alguns estados têm nome oficial, e o nome é um atributo \`aria-\`: um botão que liga e desliga tem \`aria-pressed\`; um que abre um painel tem \`aria-expanded\`. Mantê-los certos custa uma linha e é o que faz um leitor de tela dizer "pressionado" em vez de nada:

~~~js
botao.setAttribute('aria-pressed', String(ligado));
~~~

\`setAttribute\` escreve qualquer atributo; \`removeAttribute\` tira. Para \`data-\`, \`dataset\` continua valendo, também para escrever.

## style: o último recurso

\`el.style.transform = 'translateX(' + x + 'px)'\` — quando o valor **é calculado** pelo JavaScript e muda a cada quadro, \`style\` é o lugar. Fora disso, é classe.

## Os erros

- Pintar com \`style\` o que uma classe descreveria — e ter que despintar à mão.
- \`className =\` em vez de \`classList\`, apagando as outras classes.
- Esquecer o \`aria-\` quando o estado tem nome.
- Duas abas ativas, porque a antiga não foi desativada. Use \`toggle\` com a condição.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  .aba { padding: 8px 12px; border: 0; background: none; }
  .aba.ativa { border-bottom: 2px solid #1f6660; font-weight: 700; }
  .escuro { background: #1c1c1a; color: #f7f6f2; }
</style>

<button class="aba ativa">Início</button>
<button class="aba">Aulas</button>
<button class="aba">Perfil</button>

<button id="tema" aria-pressed="false">Tema escuro</button>

<script>
  function ativar(indice) {
    document.querySelectorAll('.aba').forEach((aba, i) => {
      aba.classList.toggle('ativa', i === indice);
    });
  }

  function alternarTema() {
    const escuro = document.body.classList.toggle('escuro');
    document.querySelector('#tema').setAttribute('aria-pressed', String(escuro));
  }

  ativar(1);
  alternarTema();
</script>`,
      caption:
        'Duas funções, nenhuma linha de `style`. `ativar` sincroniza a classe de cada aba com uma comparação; `alternarTema` usa o valor que `toggle` devolve para manter o `aria-pressed` certo. O CSS decide o que "ativa" e "escuro" significam.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-13-por-que-classe',
        type: 'multiple-choice',
        prompt: 'Por que trocar uma classe em vez de escrever `el.style.background = "teal"`?',
        concepts: ['dom-classes'],
        difficulty: 'iniciante',
        tags: ['dom', 'classes'],
        options: [
          'Porque `style` é mais lento',
          'Porque a aparência fica no CSS, num lugar só, e desfazer é tirar a classe — em vez de reescrever cada propriedade à mão',
          'Porque `style` não funciona em todos os navegadores',
          'Não há diferença; é questão de gosto',
        ],
        correctIndex: 1,
        explanation:
          'Com `style`, o JavaScript precisa saber cada propriedade da aparência e também cada valor original para desfazer. Com uma classe, ele só sabe o **estado** ("selecionado"); o CSS sabe o resto, e trocar de design não toca no JavaScript. `style` fica para valores calculados em tempo real.',
        hints: ['Quem deveria saber que "selecionado" é teal: o JavaScript ou o CSS?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-13-abas',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Escreva `function ativar(indice)`: a aba na posição `indice` recebe a classe `ativa`, e **todas as outras** a perdem. No fim, chame `ativar(1)`.',
        concepts: ['dom-classes'],
        difficulty: 'iniciante',
        tags: ['dom', 'classes'],
        initialCode: `<style>
  .aba { padding: 8px 12px; border: 0; background: none; }
  .aba.ativa { border-bottom: 2px solid #1f6660; font-weight: 700; }
</style>

<button class="aba ativa">Início</button>
<button class="aba">Aulas</button>
<button class="aba">Perfil</button>

<script>
  function ativar(indice) {
    // a aba indice fica ativa; as outras, não
  }

  ativar(1);
</script>
`,
        tests: [
          {
            description: 'depois de ativar(1), só a segunda aba está ativa',
            assertion: `
              const ativas = [...document.querySelectorAll('.aba')].map((a) => a.classList.contains('ativa'));
              if (ativas.join(',') !== 'false,true,false') throw new Error('Esperava só a segunda aba com a classe ativa; veio [' + ativas.join(', ') + ']. A primeira precisa perder a classe.');
            `,
          },
          {
            description: 'ativar(2) move a classe de novo, sem deixar duas',
            assertion: `
              ativar(2);
              const ativas = [...document.querySelectorAll('.aba')].map((a) => a.classList.contains('ativa'));
              if (ativas.join(',') !== 'false,false,true') throw new Error('Depois de ativar(2): [' + ativas.join(', ') + ']. Nunca pode haver duas ativas.');
            `,
          },
          {
            description: 'a classe aba continua em todas',
            assertion: `
              ativar(0);
              for (const a of document.querySelectorAll('button')) {
                if (!a.classList.contains('aba')) throw new Error('Um botão perdeu a classe aba — className = "..." apaga as outras classes; use classList.');
              }
            `,
            hidden: true,
          },
        ],
        hints: [
          'Percorra todas as `.aba`; para cada uma, a classe `ativa` depende de a posição dela ser igual a `indice`.',
          '`forEach` entrega o índice como segundo argumento; `toggle` aceita a condição como segundo argumento.',
          "function ativar(indice) {\n  document.querySelectorAll('.aba').forEach((aba, i) => {\n    aba.classList.toggle('ativa', i === indice);\n  });\n}",
        ],
        solution: `<style>
  .aba { padding: 8px 12px; border: 0; background: none; }
  .aba.ativa { border-bottom: 2px solid #1f6660; font-weight: 700; }
</style>

<button class="aba ativa">Início</button>
<button class="aba">Aulas</button>
<button class="aba">Perfil</button>

<script>
  function ativar(indice) {
    document.querySelectorAll('.aba').forEach((aba, i) => {
      aba.classList.toggle('ativa', i === indice);
    });
  }

  ativar(1);
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-13-lacuna-toggle',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt:
          'Complete a função que abre e fecha o painel: inverte a classe, e usa o resultado para manter o `aria-expanded` do botão certo.',
        concepts: ['dom-classes'],
        difficulty: 'iniciante',
        tags: ['dom', 'classes'],
        template: `<style>
  #painel { display: none; }
  #painel.aberto { display: block; }
</style>

<button id="abrir" aria-expanded="false">Detalhes</button>
<div id="painel">Conteúdo do painel.</div>

<script>
  function alternar() {
    const painel = document.querySelector('#painel');
    const aberto = painel.classList.{{1}}('aberto');
    document.querySelector('#abrir').{{2}}('aria-expanded', {{3}}(aberto));
  }

  alternar();
</script>`,
        blanks: [
          { placeholder: 'inverter', size: 6 },
          { placeholder: 'escrever atributo', size: 12 },
          { placeholder: 'para texto', size: 6 },
        ],
        tests: [
          {
            description: 'depois de uma chamada, o painel está aberto e o botão diz isso',
            assertion: `
              if (!document.querySelector('#painel').classList.contains('aberto')) throw new Error('Depois de alternar(), o painel precisa ter a classe aberto.');
              if (document.querySelector('#abrir').getAttribute('aria-expanded') !== 'true') throw new Error('aria-expanded precisa ser "true" (texto) quando o painel está aberto.');
            `,
          },
          {
            description: 'a segunda chamada fecha',
            assertion: `
              alternar();
              if (document.querySelector('#painel').classList.contains('aberto')) throw new Error('A segunda chamada precisa tirar a classe: é isso que inverter quer dizer.');
              if (document.querySelector('#abrir').getAttribute('aria-expanded') !== 'false') throw new Error('E aria-expanded volta a "false".');
            `,
          },
        ],
        hints: [
          'O método que põe se não tem e tira se tem devolve `true` quando pôs.',
          'Atributo é texto: `true` (booleano) precisa virar `"true"`.',
        ],
        solution: ['toggle', 'setAttribute', 'String'],
        explanation:
          '`toggle` faz o trabalho e **conta o que fez**: devolve `true` se a classe entrou. Esse retorno vira o `aria-expanded`, convertido para texto porque atributo é sempre string. Uma função, três linhas, e o estado visual e o estado para leitores de tela nunca discordam — porque saem do mesmo valor.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-13-ordenar-estado',
        type: 'order-steps',
        prompt:
          'A pessoa liga o tema escuro. Coloque na ordem o que acontece entre o clique e a tela mudar.',
        concepts: ['dom-classes'],
        difficulty: 'intermediario',
        tags: ['dom', 'classes'],
        steps: [
          { id: 'decide', text: 'O JavaScript decide o novo estado: escuro passa a ser verdadeiro', ordem: 1 },
          { id: 'classe', text: '`body.classList.toggle("escuro", escuro)` sincroniza a classe com o estado', ordem: 2 },
          { id: 'aria', text: 'O botão recebe `aria-pressed="true"`, para o estado ter nome também para leitores de tela', ordem: 3 },
          { id: 'css', text: 'O CSS de `.escuro` passa a casar, e as cores de fundo e texto mudam', ordem: 4 },
          { id: 'pinta', text: 'A tela é repintada; nenhuma propriedade de estilo foi escrita pelo JavaScript', ordem: 5 },
        ],
        explanation:
          'O JavaScript tocou em duas coisas: uma classe e um atributo. Tudo que é **aparência** aconteceu no CSS, que já sabia o que "escuro" significa. É a divisão que faz o tema poder mudar de paleta sem uma linha de JavaScript, e que faz o botão anunciar o estado certo sem código extra.',
        hints: [
          'Primeiro se decide o estado; depois se comunica.',
          'O CSS só reage depois que a classe existe.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-13-tema',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Escreva `function alternarTema()`: inverte a classe `escuro` no `<body>` e mantém o `aria-pressed` do `#tema` igual ao estado (`"true"` ou `"false"`). Sem `style`.',
        concepts: ['dom-classes'],
        difficulty: 'intermediario',
        tags: ['dom', 'classes', 'acessibilidade'],
        initialCode: `<style>
  body { background: #f7f6f2; color: #1c1c1a; }
  body.escuro { background: #1c1c1a; color: #f7f6f2; }
</style>

<button id="tema" aria-pressed="false">Tema escuro</button>
<p>Um pouco de texto para o tema aparecer.</p>

<script>
  function alternarTema() {
    // inverta a classe escuro no body e atualize aria-pressed em #tema
  }
</script>
`,
        tests: [
          {
            description: 'a primeira chamada liga o tema e marca o botão',
            assertion: `
              if (typeof alternarTema !== 'function') throw new Error('A função alternarTema precisa existir.');
              alternarTema();
              if (!document.body.classList.contains('escuro')) throw new Error('Depois de alternarTema(), o body precisa ter a classe escuro.');
              if (document.querySelector('#tema').getAttribute('aria-pressed') !== 'true') throw new Error('aria-pressed do #tema precisa ser "true".');
            `,
          },
          {
            description: 'a segunda chamada desliga',
            assertion: `
              alternarTema();
              if (document.body.classList.contains('escuro')) throw new Error('A segunda chamada precisa tirar a classe escuro.');
              if (document.querySelector('#tema').getAttribute('aria-pressed') !== 'false') throw new Error('aria-pressed do #tema precisa voltar a "false".');
            `,
          },
          {
            description: 'a aparência vem do CSS, não de style',
            assertion: `
              if (document.body.getAttribute('style')) throw new Error('Nada de style no body: o CSS de .escuro já sabe as cores.');
              for (const s of document.querySelectorAll('script')) {
                if (/__codeflow|new Function/.test(s.textContent)) continue;
                if (/\\.style\\./.test(s.textContent)) throw new Error('Sem style no JavaScript: troque a classe e deixe o CSS decidir.');
              }
            `,
            hidden: true,
          },
        ],
        hints: [
          '`toggle` devolve se a classe entrou; guarde esse valor.',
          '`setAttribute("aria-pressed", String(valor))` — atributo é texto.',
          "function alternarTema() {\n  const escuro = document.body.classList.toggle('escuro');\n  document.querySelector('#tema').setAttribute('aria-pressed', String(escuro));\n}",
        ],
        solution: `<style>
  body { background: #f7f6f2; color: #1c1c1a; }
  body.escuro { background: #1c1c1a; color: #f7f6f2; }
</style>

<button id="tema" aria-pressed="false">Tema escuro</button>
<p>Um pouco de texto para o tema aparecer.</p>

<script>
  function alternarTema() {
    const escuro = document.body.classList.toggle('escuro');
    document.querySelector('#tema').setAttribute('aria-pressed', String(escuro));
  }
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-13-classname',
        type: 'multiple-choice',
        prompt:
          'Um botão tem `class="botao primario"`. Depois de `botao.className = "ativo"`, quais classes ele tem?',
        concepts: ['dom-classes'],
        difficulty: 'iniciante',
        tags: ['dom', 'classes'],
        options: [
          '`botao primario ativo`',
          'Só `ativo` — `className =` substitui a lista inteira',
          '`botao ativo`',
          'Dá erro, porque `className` é só leitura',
        ],
        correctIndex: 1,
        explanation:
          '`className` é a string inteira do atributo `class`; atribuir a ela **substitui** tudo. O botão perde `botao` e `primario`, e com elas todo o estilo. `classList.add("ativo")` acrescenta sem tocar nas outras — é por isso que a aula só usa `classList`.',
        hints: ['`className` é uma lista ou uma string?'],
      },
    },
    {
      kind: 'summary',
      markdown: `Estado é do JavaScript; aparência é do CSS. \`classList.add\`, \`remove\`, \`toggle\` (com a condição como segundo argumento, para sincronizar) e \`contains\` — nunca \`className =\`. \`hidden\` para sumir, \`setAttribute\` para os estados com nome (\`aria-pressed\`, \`aria-expanded\`), e \`style\` só para valores calculados em tempo real.`,
    },
  ],
};

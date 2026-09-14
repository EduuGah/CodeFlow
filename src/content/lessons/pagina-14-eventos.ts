import type { Lesson } from '../types';

export const lessonEventos: Lesson = {
  id: 'lesson-pagina-14',
  trackId: 'track-pagina',
  title: 'Eventos: A Página Escuta',
  language: 'html',
  objective:
    'Reagir a cliques, digitação e teclas com addEventListener, ler o evento, e manter o estado numa variável que a tela redesenha.',
  concepts: ['dom-eventos'],
  status: 'published',
  estimatedMinutes: 32,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Tudo o que você fez com o DOM até agora rodou **uma vez**, quando a página carregou. Uma interface de verdade espera: alguém clica, digita, aperta uma tecla — e o código responde. O mecanismo é o **evento**: o navegador avisa que algo aconteceu, e você diz o que fazer.

## addEventListener

~~~js
const botao = document.querySelector('#salvar');

botao.addEventListener('click', () => {
  console.log('clicou');
});
~~~

Três partes: o elemento que escuta, o **nome do evento**, e a função que roda — o **manipulador** (*handler*). A função não é chamada agora; é guardada, e chamada a cada clique. É o callback da trilha de JavaScript, no lugar onde ele nasceu.

Os eventos que você mais vai usar:

| Evento | Quando |
| --- | --- |
| \`click\` | clique ou toque num elemento — botões, links, qualquer coisa |
| \`input\` | o valor de um campo mudou, a cada tecla |
| \`change\` | o valor mudou e o campo perdeu o foco (ou uma caixa foi marcada) |
| \`keydown\` | uma tecla foi pressionada |
| \`submit\` | um formulário foi enviado — assunto da aula de formulários |

Não use o atributo \`onclick="..."\` no HTML: mistura comportamento com estrutura, só aceita um manipulador, e o código dentro de aspas não tem nem sintaxe destacada. \`addEventListener\` no script, sempre.

## O objeto do evento

O manipulador recebe um argumento com tudo sobre o que aconteceu:

~~~js
campo.addEventListener('input', (evento) => {
  console.log(evento.target.value);   // o que está no campo agora
});

document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') { /* … */ }
});
~~~

\`evento.target\` é o elemento onde o evento aconteceu; \`evento.key\` é a tecla; e \`evento.preventDefault()\` cancela o comportamento padrão — um link que não deve navegar, um formulário que não deve recarregar a página.

## Estado na variável, tela pela função

Um contador com dois botões. A tentação é mexer no texto do número direto: ler, somar, escrever. Funciona com um botão; com cinco lugares mexendo no mesmo número, desanda. A forma que escala é a da aula de criar: **uma variável guarda o estado, uma função desenha, os eventos só mudam a variável e chamam a função**.

~~~js
let contagem = 0;

function desenhar() {
  document.querySelector('#numero').textContent = contagem;
}

document.querySelector('#mais').addEventListener('click', () => {
  contagem += 1;
  desenhar();
});
document.querySelector('#menos').addEventListener('click', () => {
  contagem -= 1;
  desenhar();
});

desenhar();
~~~

O número na tela **nunca** é lido de volta: a verdade é \`contagem\`. Se amanhã o número aparecer em dois lugares, \`desenhar\` escreve nos dois, e os botões não mudam.

## Funções nomeadas

Quando o manipulador cresce, dê nome a ele: \`botao.addEventListener('click', salvar)\`. Fica legível, testável, e dá para tirar depois com \`removeEventListener('click', salvar)\` — o que uma função anônima não permite.

## Os erros

- \`botao.addEventListener('click', salvar())\` — com parênteses, você **chama** \`salvar\` agora e passa o resultado. Sem parênteses: passa a função.
- Ler o estado da tela em vez da variável.
- \`onclick\` no HTML.
- Esquecer \`preventDefault\` num formulário, e a página recarregar "sozinha".
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<p>Contagem: <strong id="numero">0</strong></p>
<button id="menos">−</button>
<button id="mais">+</button>

<label>Nome <input id="nome"></label>
<p id="previa"></p>

<script>
  let contagem = 0;

  function desenhar() {
    document.querySelector('#numero').textContent = contagem;
  }

  document.querySelector('#mais').addEventListener('click', () => {
    contagem += 1;
    desenhar();
  });

  document.querySelector('#menos').addEventListener('click', () => {
    contagem -= 1;
    desenhar();
  });

  document.querySelector('#nome').addEventListener('input', (evento) => {
    document.querySelector('#previa').textContent = 'Olá, ' + evento.target.value + '!';
  });

  desenhar();
</script>`,
      caption:
        'Os botões não tocam na tela: mudam `contagem` e chamam `desenhar`. O campo usa `input`, que dispara a cada tecla, e lê o valor de `evento.target`. Clique e digite na pré-visualização.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-14-parenteses',
        type: 'multiple-choice',
        prompt:
          'Qual é a diferença entre `botao.addEventListener("click", salvar)` e `botao.addEventListener("click", salvar())`?',
        concepts: ['dom-eventos'],
        difficulty: 'iniciante',
        tags: ['dom', 'eventos'],
        options: [
          'Nenhuma; os parênteses são opcionais',
          'A primeira passa a função para ser chamada a cada clique; a segunda chama `salvar` agora, uma vez, e passa o que ela devolveu',
          'A segunda é a forma correta, porque funções precisam de parênteses',
          'A primeira só funciona com funções anônimas',
        ],
        correctIndex: 1,
        explanation:
          'Sem parênteses, `salvar` é um valor — a função — e o navegador a guarda para chamar depois. Com parênteses, `salvar()` **executa** na hora e o resultado (provavelmente `undefined`) é o que vai para o `addEventListener`; o clique não faz nada. É o mesmo callback da trilha de JavaScript: passa-se a função, não o resultado dela.',
        hints: ['O que `salvar()` vale, como expressão, antes de o clique acontecer?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-14-contador',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Faça o contador funcionar: `#mais` soma 1, `#menos` subtrai 1, e o `#numero` mostra o valor. Guarde o estado numa variável e escreva uma função `desenhar` — os botões só mudam a variável e chamam a função.',
        concepts: ['dom-eventos'],
        difficulty: 'iniciante',
        tags: ['dom', 'eventos'],
        initialCode: `<p>Contagem: <strong id="numero">0</strong></p>
<button id="menos">−</button>
<button id="mais">+</button>

<script>
  let contagem = 0;

  function desenhar() {
    // escreva contagem em #numero
  }

  // escute os cliques de #mais e #menos

  desenhar();
</script>
`,
        tests: [
          {
            description: 'três cliques em + mostram 3',
            assertion: `
              const mais = document.querySelector('#mais');
              mais.click(); mais.click(); mais.click();
              const n = document.querySelector('#numero').textContent.trim();
              if (n !== '3') throw new Error('Depois de três cliques em +, #numero precisa mostrar 3; veio "' + n + '".');
            `,
          },
          {
            description: 'um clique em − volta para 2',
            assertion: `
              document.querySelector('#menos').click();
              const n = document.querySelector('#numero').textContent.trim();
              if (n !== '2') throw new Error('Depois de −, esperava 2; veio "' + n + '".');
            `,
          },
          {
            description: 'a verdade está na variável, não na tela',
            assertion: `
              document.querySelector('#numero').textContent = '99';
              document.querySelector('#mais').click();
              const n = document.querySelector('#numero').textContent.trim();
              if (n !== '3') throw new Error('A tela foi alterada por fora para 99 e um clique em + mostrou "' + n + '". Não leia o número da tela: some na variável contagem e redesenhe.');
            `,
            hidden: true,
          },
        ],
        hints: [
          '`desenhar` é uma linha: `textContent = contagem`.',
          'Dois `addEventListener("click", …)`: cada um muda `contagem` e chama `desenhar()`.',
          "function desenhar() {\n  document.querySelector('#numero').textContent = contagem;\n}\ndocument.querySelector('#mais').addEventListener('click', () => { contagem += 1; desenhar(); });\ndocument.querySelector('#menos').addEventListener('click', () => { contagem -= 1; desenhar(); });",
        ],
        solution: `<p>Contagem: <strong id="numero">0</strong></p>
<button id="menos">−</button>
<button id="mais">+</button>

<script>
  let contagem = 0;

  function desenhar() {
    document.querySelector('#numero').textContent = contagem;
  }

  document.querySelector('#mais').addEventListener('click', () => {
    contagem += 1;
    desenhar();
  });

  document.querySelector('#menos').addEventListener('click', () => {
    contagem -= 1;
    desenhar();
  });

  desenhar();
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-14-lacuna-input',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt: 'Complete: a cada tecla no campo, a prévia mostra "Olá, <nome>!".',
        concepts: ['dom-eventos'],
        difficulty: 'iniciante',
        tags: ['dom', 'eventos'],
        template: `<label>Nome <input id="nome"></label>
<p id="previa"></p>

<script>
  document.querySelector('#nome').addEventListener('{{1}}', (evento) => {
    const nome = evento.{{2}}.{{3}};
    document.querySelector('#previa').textContent = 'Olá, ' + nome + '!';
  });
</script>`,
        blanks: [
          { placeholder: 'evento', size: 6 },
          { placeholder: 'quem', size: 6 },
          { placeholder: 'o quê', size: 5 },
        ],
        tests: [
          {
            description: 'digitar atualiza a prévia a cada tecla',
            assertion: `
              const campo = document.querySelector('#nome');
              campo.value = 'Ana';
              campo.dispatchEvent(new Event('input', { bubbles: true }));
              const p = document.querySelector('#previa').textContent.trim();
              if (p !== 'Olá, Ana!') throw new Error('Depois de digitar Ana, a prévia precisa dizer "Olá, Ana!"; veio "' + p + '". O evento que dispara a cada tecla é input.');
            `,
          },
        ],
        hints: [
          'O evento que dispara a cada tecla está na tabela da aula; `change` só dispara ao sair do campo.',
          'O elemento onde o evento aconteceu, e o que está escrito nele.',
        ],
        solution: ['input', 'target', 'value'],
        explanation:
          '`input` dispara a cada mudança no valor — cada tecla, cada colagem. `evento.target` é o próprio campo, e `.value` é o que está nele agora. É o trio de toda reação a digitação, e a base da busca que filtra enquanto você escreve.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-14-ordenar-fluxo',
        type: 'order-steps',
        prompt: 'Do toque no botão à tela nova. Coloque na ordem.',
        concepts: ['dom-eventos'],
        difficulty: 'intermediario',
        tags: ['dom', 'eventos'],
        steps: [
          { id: 'registra', text: 'Ao carregar, o script registra o manipulador com `addEventListener` — sem chamá-lo', ordem: 1 },
          { id: 'clica', text: 'A pessoa toca no botão; o navegador cria um evento `click` com o botão como `target`', ordem: 2 },
          { id: 'chama', text: 'O navegador chama o manipulador, passando o evento', ordem: 3 },
          { id: 'estado', text: 'O manipulador muda a variável de estado e chama `desenhar`', ordem: 4 },
          { id: 'pinta', text: '`desenhar` escreve no DOM, e a tela é repintada', ordem: 5 },
        ],
        explanation:
          'O primeiro passo é o que confunde no começo: registrar não é rodar. O manipulador fica guardado, às vezes por minutos, até o evento acontecer — e pode rodar mil vezes. Por isso ele não deve depender de nada que só valia no momento do registro; ele lê o estado **na hora** em que roda.',
        hints: [
          'O manipulador precisa existir antes do clique — mas existir não é rodar.',
          'A tela só muda depois que o estado mudou.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-14-enter',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Ao apertar **Enter** no campo, o texto digitado vira um novo `<li>` no `#lista` e o campo é esvaziado. Enter com o campo vazio não faz nada.\n\nUse `keydown` e `evento.key`.',
        concepts: ['dom-eventos'],
        difficulty: 'intermediario',
        tags: ['dom', 'eventos'],
        initialCode: `<label>Nova tarefa <input id="nova"></label>
<ul id="lista"></ul>

<script>
  // keydown em #nova: se a tecla for Enter e houver texto,
  // crie um <li> com o texto em #lista e esvazie o campo
</script>
`,
        tests: [
          {
            description: 'Enter com texto cria o item e limpa o campo',
            assertion: `
              const campo = document.querySelector('#nova');
              campo.value = 'Comprar pão';
              campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
              const itens = [...document.querySelectorAll('#lista li')].map((li) => li.textContent.trim());
              if (itens.join(',') !== 'Comprar pão') throw new Error('Depois de Enter, #lista precisa ter um li "Comprar pão"; veio [' + itens.join(', ') + '].');
              if (campo.value !== '') throw new Error('Depois de adicionar, o campo precisa ficar vazio.');
            `,
          },
          {
            description: 'outras teclas não adicionam',
            assertion: `
              const campo = document.querySelector('#nova');
              campo.value = 'x';
              campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
              if (document.querySelectorAll('#lista li').length !== 1) throw new Error('A tecla "a" não pode adicionar item: confira evento.key === "Enter".');
            `,
          },
          {
            description: 'Enter com o campo vazio não adiciona',
            assertion: `
              const campo = document.querySelector('#nova');
              campo.value = '   ';
              campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
              if (document.querySelectorAll('#lista li').length !== 1) throw new Error('Enter com o campo vazio (ou só espaços) não pode criar item.');
            `,
            hidden: true,
          },
        ],
        hints: [
          'Dentro do manipulador de `keydown`: `if (evento.key !== "Enter") return;`.',
          'Leia `campo.value.trim()`; se vazio, saia. Senão, crie o `li` (aula passada) e faça `campo.value = ""`.',
          "const campo = document.querySelector('#nova');\ncampo.addEventListener('keydown', (evento) => {\n  if (evento.key !== 'Enter') return;\n  const texto = campo.value.trim();\n  if (!texto) return;\n  const li = document.createElement('li');\n  li.textContent = texto;\n  document.querySelector('#lista').append(li);\n  campo.value = '';\n});",
        ],
        solution: `<label>Nova tarefa <input id="nova"></label>
<ul id="lista"></ul>

<script>
  const campo = document.querySelector('#nova');

  campo.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Enter') return;
    const texto = campo.value.trim();
    if (!texto) return;

    const li = document.createElement('li');
    li.textContent = texto;
    document.querySelector('#lista').append(li);
    campo.value = '';
  });
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-14-onclick',
        type: 'multiple-choice',
        prompt: 'Por que `<button onclick="salvar()">` é desaconselhado?',
        concepts: ['dom-eventos'],
        difficulty: 'iniciante',
        tags: ['dom', 'eventos'],
        options: [
          'Porque não funciona em celulares',
          'Porque mistura comportamento com estrutura, aceita um manipulador só, e o código fica numa string sem ferramentas — `addEventListener` no script resolve as três',
          'Porque `onclick` é mais lento que `addEventListener`',
          'Não é desaconselhado; é a forma recomendada',
        ],
        correctIndex: 1,
        explanation:
          'O atributo funciona — o problema é o que ele custa. O HTML passa a depender de uma função global com aquele nome; só cabe um manipulador; e o código dentro de aspas não tem destaque, formatação nem verificação. `addEventListener` mantém o comportamento no script, permite vários manipuladores e permite removê-los.',
        hints: ['Onde deveria morar o comportamento: no HTML ou no script?'],
      },
    },
    {
      kind: 'summary',
      markdown: `\`addEventListener(nome, função)\` guarda a função para chamar a cada evento — sem parênteses. O manipulador recebe o evento: \`target\` é onde aconteceu, \`key\` é a tecla, \`preventDefault()\` cancela o padrão. \`click\` para toques, \`input\` para cada tecla num campo, \`keydown\` para teclas. E o padrão que escala: estado numa variável, uma função que desenha, eventos que só mudam a variável e chamam a função.`,
    },
  ],
};

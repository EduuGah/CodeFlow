import type { Lesson } from '../types';

export const lessonArmazenamento: Lesson = {
  id: 'lesson-pagina-17',
  trackId: 'track-pagina',
  title: 'Armazenamento Local: Lembrar Entre Visitas',
  language: 'html',
  objective:
    'Guardar preferências e rascunhos no navegador com localStorage e JSON, carregar ao abrir, e saber o que nunca deve ser guardado ali.',
  concepts: ['dom-armazenamento'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Tudo o que a página faz some quando a aba fecha: a lista de tarefas, o tema escuro, o texto que a pessoa estava digitando. Para lembrar entre uma visita e outra, o navegador oferece um lugar pequeno e simples: o **localStorage**.

## A API inteira em quatro linhas

~~~js
localStorage.setItem('tema', 'escuro');    // guarda
localStorage.getItem('tema');              // lê: 'escuro' — ou null, se não há
localStorage.removeItem('tema');           // apaga
localStorage.clear();                      // apaga tudo deste site
~~~

Chave e valor, os dois **texto**. O dado fica na máquina da pessoa, por site, e sobrevive a recarregar a página, fechar a aba e desligar o computador. Só some se ela limpar os dados do navegador — ou se você apagar.

## Só texto: entra o JSON

\`setItem\` converte qualquer coisa em string do jeito burro: um array vira \`"a,b,c"\`, um objeto vira \`"[object Object]"\`. Para guardar estrutura, você serializa com o JSON da trilha de JavaScript:

~~~js
const tarefas = [{ id: 1, texto: 'Pão', feita: false }];

localStorage.setItem('tarefas', JSON.stringify(tarefas));     // salvar
const lidas = JSON.parse(localStorage.getItem('tarefas'));    // carregar
~~~

## O par carregar/salvar

O padrão que organiza tudo: **duas funções**, e o resto do código nem sabe que existe armazenamento.

~~~js
function carregar() {
  const texto = localStorage.getItem('tarefas');
  if (texto === null) return [];         // primeira visita: nada guardado
  try {
    return JSON.parse(texto);
  } catch {
    return [];                           // dado corrompido: não quebre a página
  }
}

function salvar(tarefas) {
  localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

let tarefas = carregar();   // ao abrir
desenhar();

// …em toda mudança de estado:
tarefas.push(nova);
salvar(tarefas);
desenhar();
~~~

O \`try/catch\` não é paranoia: o texto guardado pode ter vindo de uma versão antiga do seu código, ou ter sido editado à mão. Uma página que quebra ao abrir por causa de um dado velho é a pior falha possível — a pessoa não consegue nem chegar ao botão de limpar.

## O que guardar — e o que nunca

Guarde o que é **da pessoa e sem valor para mais ninguém**: tema, idioma, filtros escolhidos, o rascunho de um comentário, uma lista de tarefas local.

**Nunca** guarde segredos: senhas, tokens de sessão, dados de cartão. O \`localStorage\` é legível por qualquer script que rode na página — inclusive um injetado por uma vulnerabilidade, o cenário da aula de segurança da trilha web. Sessão fica em cookie \`HttpOnly\`, que o script não alcança.

E não guarde o que o servidor já tem: o \`localStorage\` é uma máquina só; a pessoa abre no telefone e os dados não estão lá.

## Limites

Uns 5 MB por site, e \`setItem\` **lança** quando estoura — outro motivo para embrulhar em \`try/catch\` quando o dado pode crescer. \`sessionStorage\` tem a mesma API e dura só a aba: bom para um rascunho que não deve sobreviver ao fechamento.

Uma nota sobre esta trilha: a pré-visualização dos exercícios zera a cada execução — o \`localStorage\` que você vê aqui dura uma rodada. Num site de verdade, o que você guardar hoje está lá amanhã.

## Os erros

- Guardar um objeto sem \`JSON.stringify\` e ler \`[object Object]\`.
- \`JSON.parse\` sem \`try/catch\`, e a página quebrar ao abrir.
- Token de sessão no \`localStorage\`.
- Esquecer o caso da primeira visita (\`getItem\` devolve \`null\`).
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<label>Nova tarefa <input id="nova"></label>
<ul id="lista"></ul>

<script>
  function carregar() {
    const texto = localStorage.getItem('tarefas');
    if (texto === null) return [];
    try { return JSON.parse(texto); } catch { return []; }
  }

  function salvar() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
  }

  function desenhar() {
    const ul = document.querySelector('#lista');
    ul.replaceChildren();
    for (const t of tarefas) {
      const li = document.createElement('li');
      li.textContent = t;
      ul.append(li);
    }
  }

  let tarefas = carregar();
  desenhar();

  document.querySelector('#nova').addEventListener('keydown', (evento) => {
    if (evento.key !== 'Enter' || !evento.target.value.trim()) return;
    tarefas.push(evento.target.value.trim());
    evento.target.value = '';
    salvar();
    desenhar();
  });
</script>`,
      caption:
        '`carregar` na abertura, `salvar` em cada mudança, `desenhar` em ambas. O resto do código não sabe que há armazenamento — só chama `salvar()` depois de mudar `tarefas`. Repare no `try/catch` e no `null` da primeira visita.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-17-object',
        type: 'multiple-choice',
        prompt:
          '`localStorage.setItem("config", { tema: "escuro" })` e depois `localStorage.getItem("config")`. O que vem?',
        concepts: ['dom-armazenamento'],
        difficulty: 'iniciante',
        tags: ['dom', 'armazenamento'],
        options: [
          'O objeto `{ tema: "escuro" }`',
          'A string `"[object Object]"` — o objeto foi convertido do jeito burro; é preciso `JSON.stringify` ao guardar e `JSON.parse` ao ler',
          '`null`, porque objetos não são aceitos',
          'Um erro',
        ],
        correctIndex: 1,
        explanation:
          '`localStorage` só guarda texto, e converte o que recebe com `String()`: um objeto vira `"[object Object]"`, sem erro nenhum — o dado se perde em silêncio. `JSON.stringify` produz o texto que representa o objeto, e `JSON.parse` reconstrói ao ler. Sempre os dois, ou nenhum.',
        hints: ['O que `String({ tema: "escuro" })` devolve?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-17-par',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Escreva o par: `salvar(lista)` guarda a lista em `localStorage` sob a chave `compras`, como JSON; `carregar()` lê e devolve a lista — ou `[]` se não há nada guardado ou se o texto não for JSON válido.',
        concepts: ['dom-armazenamento'],
        difficulty: 'iniciante',
        tags: ['dom', 'armazenamento'],
        initialCode: `<script>
  function salvar(lista) {
    // JSON.stringify e setItem, chave "compras"
  }

  function carregar() {
    // getItem; null vira []; JSON inválido vira []
  }
</script>
`,
        tests: [
          {
            description: 'o que salvar guarda, carregar devolve igual',
            assertion: `
              salvar(['Pão', 'Café']);
              const lida = carregar();
              if (!Array.isArray(lida) || lida.join(',') !== 'Pão,Café') throw new Error('Depois de salvar(["Pão", "Café"]), carregar() precisa devolver a mesma lista; veio ' + JSON.stringify(lida) + '.');
            `,
          },
          {
            description: 'está guardado como JSON, sob a chave compras',
            assertion: `
              const cru = localStorage.getItem('compras');
              if (cru === null) throw new Error('Nada sob a chave "compras" no localStorage.');
              if (cru === 'Pão,Café' || cru === '[object Object]') throw new Error('Guardado sem JSON.stringify: veio "' + cru + '". Assim o carregar não consegue reconstruir a lista.');
              JSON.parse(cru);
            `,
          },
          {
            description: 'sem nada guardado, carregar devolve []',
            assertion: `
              localStorage.removeItem('compras');
              const lida = carregar();
              if (!Array.isArray(lida) || lida.length !== 0) throw new Error('Na primeira visita getItem devolve null, e carregar() precisa devolver []; veio ' + JSON.stringify(lida) + '.');
            `,
          },
          {
            description: 'com texto corrompido, carregar devolve [] em vez de quebrar',
            assertion: `
              localStorage.setItem('compras', '{isto não é json');
              let lida;
              try { lida = carregar(); } catch (e) { throw new Error('carregar() lançou com um dado corrompido: ' + e.message + '. Embrulhe o JSON.parse em try/catch.'); }
              if (!Array.isArray(lida) || lida.length !== 0) throw new Error('Com JSON inválido, carregar() devolve []; veio ' + JSON.stringify(lida) + '.');
            `,
            hidden: true,
          },
        ],
        hints: [
          '`salvar` é uma linha: `setItem` com `JSON.stringify(lista)`.',
          '`carregar`: leia; se `null`, `return []`; senão `try { return JSON.parse(texto) } catch { return [] }`.',
          "function salvar(lista) {\n  localStorage.setItem('compras', JSON.stringify(lista));\n}\nfunction carregar() {\n  const texto = localStorage.getItem('compras');\n  if (texto === null) return [];\n  try { return JSON.parse(texto); } catch { return []; }\n}",
        ],
        solution: `<script>
  function salvar(lista) {
    localStorage.setItem('compras', JSON.stringify(lista));
  }

  function carregar() {
    const texto = localStorage.getItem('compras');
    if (texto === null) return [];
    try {
      return JSON.parse(texto);
    } catch {
      return [];
    }
  }
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-17-lacuna-json',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt: 'Complete o ciclo: serializar ao guardar, ler pela chave, reconstruir ao carregar.',
        concepts: ['dom-armazenamento'],
        difficulty: 'iniciante',
        tags: ['dom', 'armazenamento'],
        template: `<p id="saida"></p>

<script>
  const config = { tema: 'escuro', fonte: 18 };

  localStorage.setItem('config', JSON.{{1}}(config));

  const texto = localStorage.{{2}}('config');
  const lida = JSON.{{3}}(texto);

  document.querySelector('#saida').textContent = lida.tema + ' / ' + (lida.fonte + 2);
</script>`,
        blanks: [
          { placeholder: 'objeto → texto', size: 9 },
          { placeholder: 'ler', size: 7 },
          { placeholder: 'texto → objeto', size: 5 },
        ],
        tests: [
          {
            description: 'o objeto sobreviveu à ida e volta, com o número ainda número',
            assertion: `
              const s = document.querySelector('#saida').textContent.trim();
              if (s !== 'escuro / 20') throw new Error('Esperava "escuro / 20"; veio "' + s + '". Se veio "182", a fonte virou texto no caminho — o JSON preserva o número.');
            `,
          },
        ],
        hints: [
          'Os dois métodos de JSON: um produz texto, o outro lê texto.',
          'O método de `localStorage` que lê pela chave.',
        ],
        solution: ['stringify', 'getItem', 'parse'],
        explanation:
          'JSON é o formato que atravessa o `localStorage` sem perder a estrutura: `stringify` na ida, `parse` na volta, e `fonte` continua sendo o número 18 — daí `20`, e não `"182"`. É o mesmo par que atravessa a rede na trilha de JavaScript; aqui ele atravessa o tempo.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-17-ordenar-ciclo',
        type: 'order-steps',
        prompt: 'A vida de uma lista de tarefas guardada localmente, da abertura da página a uma mudança. Coloque na ordem.',
        concepts: ['dom-armazenamento'],
        difficulty: 'intermediario',
        tags: ['dom', 'armazenamento'],
        steps: [
          { id: 'abre', text: 'A página abre e `carregar()` lê o `localStorage` — `null` na primeira visita vira `[]`', ordem: 1 },
          { id: 'desenha', text: '`desenhar()` mostra a lista carregada', ordem: 2 },
          { id: 'muda', text: 'A pessoa adiciona uma tarefa: o array em memória muda', ordem: 3 },
          { id: 'salva', text: '`salvar()` escreve o array inteiro de volta, como JSON', ordem: 4 },
          { id: 'redesenha', text: '`desenhar()` de novo; na próxima visita, `carregar()` encontra a tarefa lá', ordem: 5 },
        ],
        explanation:
          'A verdade continua sendo o array em memória — o `localStorage` é uma cópia que se escreve depois de cada mudança e se lê uma vez, na abertura. Manter essa direção (memória → disco, nunca o contrário no meio do uso) é o que evita a lista na tela discordar da lista guardada.',
        hints: [
          'Antes de mostrar qualquer coisa, a página precisa saber o que estava guardado.',
          'Guardar vem depois de mudar, e antes de redesenhar não importa — mas sempre depois de mudar.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-17-tema',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'O tema precisa ser lembrado. Ao abrir, se `localStorage` tiver `tema` igual a `escuro`, aplique a classe `escuro` no `body`. Ao clicar em `#alternar`, inverta a classe e guarde o tema atual (`"escuro"` ou `"claro"`).',
        concepts: ['dom-armazenamento'],
        difficulty: 'intermediario',
        tags: ['dom', 'armazenamento'],
        initialCode: `<style>
  body.escuro { background: #1c1c1a; color: #f7f6f2; }
</style>

<button id="alternar">Alternar tema</button>
<p>Texto para o tema aparecer.</p>

<script>
  // ao abrir: aplique o tema guardado

  // ao clicar: inverta e guarde
</script>
`,
        tests: [
          {
            description: 'clicar liga o tema e guarda "escuro"',
            assertion: `
              document.querySelector('#alternar').click();
              if (!document.body.classList.contains('escuro')) throw new Error('Depois do clique, o body precisa ter a classe escuro.');
              if (localStorage.getItem('tema') !== 'escuro') throw new Error('localStorage precisa guardar tema = "escuro"; veio ' + JSON.stringify(localStorage.getItem('tema')) + '.');
            `,
          },
          {
            description: 'clicar de novo desliga e guarda "claro"',
            assertion: `
              document.querySelector('#alternar').click();
              if (document.body.classList.contains('escuro')) throw new Error('O segundo clique precisa tirar a classe.');
              if (localStorage.getItem('tema') !== 'claro') throw new Error('localStorage precisa guardar tema = "claro"; veio ' + JSON.stringify(localStorage.getItem('tema')) + '.');
            `,
          },
          {
            description: 'ao abrir com "escuro" guardado, o tema já vem aplicado',
            assertion: `
              localStorage.setItem('tema', 'escuro');
              document.body.classList.remove('escuro');
              for (const s of document.querySelectorAll('script')) {
                if (/__codeflow|new Function/.test(s.textContent)) continue;
                new Function(s.textContent)();
              }
              if (!document.body.classList.contains('escuro')) throw new Error('Com tema = "escuro" guardado, a página precisa abrir já com a classe escuro no body.');
            `,
            hidden: true,
          },
        ],
        hints: [
          'Ao abrir: `if (localStorage.getItem("tema") === "escuro") document.body.classList.add("escuro")`.',
          'No clique: `const escuro = body.classList.toggle("escuro")`; depois `setItem("tema", escuro ? "escuro" : "claro")`.',
          "if (localStorage.getItem('tema') === 'escuro') document.body.classList.add('escuro');\ndocument.querySelector('#alternar').addEventListener('click', () => {\n  const escuro = document.body.classList.toggle('escuro');\n  localStorage.setItem('tema', escuro ? 'escuro' : 'claro');\n});",
        ],
        solution: `<style>
  body.escuro { background: #1c1c1a; color: #f7f6f2; }
</style>

<button id="alternar">Alternar tema</button>
<p>Texto para o tema aparecer.</p>

<script>
  if (localStorage.getItem('tema') === 'escuro') {
    document.body.classList.add('escuro');
  }

  document.querySelector('#alternar').addEventListener('click', () => {
    const escuro = document.body.classList.toggle('escuro');
    localStorage.setItem('tema', escuro ? 'escuro' : 'claro');
  });
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-17-segredo',
        type: 'multiple-choice',
        prompt: 'Qual destes dados NÃO pode ir para o `localStorage`?',
        concepts: ['dom-armazenamento', 'seguranca-web'],
        difficulty: 'intermediario',
        tags: ['dom', 'armazenamento', 'seguranca'],
        options: [
          'O tema escolhido pela pessoa',
          'O rascunho de um comentário que ela ainda não enviou',
          'O token de sessão que identifica a pessoa no servidor',
          'Os filtros que ela deixou marcados numa lista',
        ],
        correctIndex: 2,
        explanation:
          'O `localStorage` é legível por qualquer script na página — inclusive um injetado por uma falha de segurança. Um token ali é uma sessão roubável. Sessão fica em cookie `HttpOnly`, que o JavaScript não alcança. Os outros três são da pessoa, sem valor para um atacante, e são exatamente o tipo de coisa para que o `localStorage` existe.',
        hints: ['Qual dos quatro daria a um atacante acesso à conta da pessoa?'],
      },
    },
    {
      kind: 'summary',
      markdown: `\`localStorage\` guarda texto por site, entre visitas: \`setItem\`, \`getItem\` (que devolve \`null\` na primeira vez), \`removeItem\`. Estrutura passa por \`JSON.stringify\` e \`JSON.parse\` — este dentro de um \`try/catch\`, porque a página não pode quebrar ao abrir. O par \`carregar()\`/\`salvar()\` esconde tudo isso do resto do código. E nunca um segredo ali: qualquer script lê.`,
    },
  ],
};

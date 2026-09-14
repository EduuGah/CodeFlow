import type { Lesson } from '../types';

export const lessonCriarRemover: Lesson = {
  id: 'lesson-pagina-12',
  trackId: 'track-pagina',
  title: 'Criar e Remover: A Página Feita de Dados',
  language: 'html',
  objective:
    'Criar elementos a partir de dados, colocá-los na página, removê-los — e escrever a função "desenhar" que transforma uma lista em HTML toda vez que ela muda.',
  concepts: ['dom-criar'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Até aqui o HTML estava escrito no arquivo e o JavaScript só mudava textos. Mas a maior parte do que uma página mostra **não está no arquivo**: a lista de produtos, as mensagens, os resultados de busca chegam como dados, e alguém precisa transformá-los em elementos. Esse alguém é você.

## Três passos: criar, preencher, colocar

~~~js
const li = document.createElement('li');   // 1. cria, ainda fora da página
li.textContent = 'Pão';                    // 2. preenche
document.querySelector('ul').append(li);   // 3. coloca dentro de um pai
~~~

Um elemento criado com \`createElement\` **existe, mas não aparece** até ser colocado na árvore. \`append\` põe no fim do pai; \`prepend\` põe no começo. Você pode configurar tudo antes de colocar — classe, atributos, filhos — e a página só muda uma vez, no \`append\`.

## De uma lista de dados para uma lista na tela

O padrão que você vai escrever mil vezes: um laço sobre os dados, um elemento por item.

~~~js
const compras = ['Pão', 'Manteiga', 'Café'];
const ul = document.querySelector('#lista');

for (const nome of compras) {
  const li = document.createElement('li');
  li.textContent = nome;
  ul.append(li);
}
~~~

Repare que o nome vai em \`textContent\`. Se \`compras\` veio de uma pessoa — e sempre vem —, é a única forma segura. \`innerHTML\` com uma string montada a partir de dados é exatamente a injeção da aula passada.

## Remover

\`elemento.remove()\` tira o elemento da árvore. Ele deixa de aparecer e deixa de existir para o \`querySelector\`. É diferente de esconder com CSS (\`display: none\`): escondido, ele ainda está lá — ainda ocupa memória, ainda casa em seletores, ainda é lido por leitor de tela em alguns casos. Se a coisa acabou, remova.

Para limpar um contêiner inteiro: \`ul.replaceChildren()\` — sem argumentos, remove todos os filhos.

## A função "desenhar"

Aqui está a ideia que organiza todo código de interface: **os dados são a verdade; a tela é uma função deles**. Em vez de mexer na tela pedacinho por pedacinho conforme os dados mudam, escreva uma função que **limpa e redesenha tudo** a partir dos dados atuais:

~~~js
function desenhar(itens) {
  const ul = document.querySelector('#lista');
  ul.replaceChildren();                 // limpa
  for (const item of itens) {           // redesenha
    const li = document.createElement('li');
    li.textContent = item;
    ul.append(li);
  }
}

desenhar(['Pão', 'Manteiga']);
desenhar(['Pão', 'Manteiga', 'Café']);   // muda os dados, chama de novo
~~~

Parece desperdício redesenhar tudo — e para listas de milhares de itens é. Para as de dezenas, que são quase todas, é o código mais simples e o mais difícil de deixar inconsistente: não existe "esqueci de atualizar aquele pedaço", porque tudo vem dos dados, toda vez. É a ideia central do React, que você verá numa fase seguinte, feita à mão.

## Quando innerHTML é aceitável

Para montar um **pedaço de HTML fixo**, que você escreveu, sem nenhum dado de fora:

~~~js
aviso.innerHTML = '<strong>Atenção:</strong> revise antes de enviar.';
~~~

A linha entre os dois casos é simples: se há uma variável com texto de gente dentro da string, não é \`innerHTML\`.

## Os erros

- Criar o elemento e esquecer de colocar: nada aparece, e nenhum erro avisa.
- Montar HTML com \`innerHTML\` e dados de pessoas.
- Esconder com CSS o que devia ser removido, e o \`querySelectorAll\` continuar contando.
- Atualizar a tela "no lugar" e esquecer um pedaço. Redesenhe a partir dos dados.
`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<ul id="lista"></ul>
<p id="vazio" hidden>Nada na lista.</p>

<script>
  function desenhar(itens) {
    const ul = document.querySelector('#lista');
    ul.replaceChildren();

    for (const item of itens) {
      const li = document.createElement('li');
      li.textContent = item.nome;
      if (item.feito) li.classList.add('feito');
      ul.append(li);
    }

    document.querySelector('#vazio').hidden = itens.length > 0;
  }

  desenhar([
    { nome: 'Pão', feito: true },
    { nome: 'Manteiga', feito: false },
  ]);
</script>`,
      caption:
        'A tela é uma função dos dados: `desenhar` limpa e reconstrói. Até o aviso de "nada na lista" é decidido a partir dos dados, no mesmo lugar — não há como ele ficar dessincronizado.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-12-nao-aparece',
        type: 'multiple-choice',
        prompt:
          'Este código roda sem erro, mas nada aparece:\n\n~~~js\nconst li = document.createElement("li");\nli.textContent = "Pão";\n~~~\n\nPor quê?',
        concepts: ['dom-criar'],
        difficulty: 'iniciante',
        tags: ['dom', 'criar'],
        options: [
          'Faltou `document.createElement("ul")` antes',
          'O elemento foi criado mas nunca colocado na árvore: falta `append` num pai',
          '`textContent` não funciona em elementos novos',
          'Faltou `return li`',
        ],
        correctIndex: 1,
        explanation:
          '`createElement` cria um elemento **solto**: existe na memória, não na página. Ele só aparece quando entra na árvore, por `append`, `prepend` ou `before/after` de um elemento que já está lá. É o erro mais silencioso do DOM, porque nada quebra — só não acontece.',
        hints: ['Criar e colocar são dois passos. Qual dos dois falta?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-12-lista',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Transforme o array `compras` numa lista na tela: um `<li>` por item, dentro do `#lista`, com o nome em `textContent`.',
        concepts: ['dom-criar'],
        difficulty: 'iniciante',
        tags: ['dom', 'criar'],
        initialCode: `<ul id="lista"></ul>

<script>
  const compras = ['Pão', 'Manteiga', 'Café'];

  // um <li> por item, dentro de #lista
</script>
`,
        tests: [
          {
            description: 'há um li por item, na ordem',
            assertion: `
              const textos = [...document.querySelectorAll('#lista li')].map((li) => li.textContent.trim());
              if (textos.join(',') !== 'Pão,Manteiga,Café') throw new Error('Esperava os três itens em ordem dentro de #lista; veio [' + textos.join(', ') + '].');
            `,
          },
          {
            description: 'os elementos são criados a partir do array, não escritos no HTML',
            assertion: `
              const html = document.querySelector('#lista').outerHTML;
              for (const s of document.querySelectorAll('script')) {
                if (/__codeflow|new Function/.test(s.textContent)) continue;
                if (!/createElement/.test(s.textContent)) throw new Error('Crie os elementos com document.createElement a partir do array.');
                if (/innerHTML/.test(s.textContent)) throw new Error('Nomes são dados: vão em textContent, não em innerHTML.');
              }
            `,
            hidden: true,
          },
        ],
        hints: [
          'Um `for...of` sobre `compras`; dentro dele, os três passos: criar, preencher, colocar.',
          '`document.createElement("li")`, depois `textContent`, depois `append` no `#lista`.',
          "const ul = document.querySelector('#lista');\nfor (const nome of compras) {\n  const li = document.createElement('li');\n  li.textContent = nome;\n  ul.append(li);\n}",
        ],
        solution: `<ul id="lista"></ul>

<script>
  const compras = ['Pão', 'Manteiga', 'Café'];

  const ul = document.querySelector('#lista');
  for (const nome of compras) {
    const li = document.createElement('li');
    li.textContent = nome;
    ul.append(li);
  }
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-12-lacuna-criar',
        type: 'fill-blank',
        runtime: 'iframe',
        prompt: 'Complete os três passos: criar o elemento, preencher o texto, colocar no fim da lista.',
        concepts: ['dom-criar'],
        difficulty: 'iniciante',
        tags: ['dom', 'criar'],
        template: `<ul id="lista">
  <li>Pão</li>
</ul>

<script>
  const novo = document.{{1}}('li');
  novo.{{2}} = 'Café';
  document.querySelector('#lista').{{3}}(novo);
</script>`,
        blanks: [
          { placeholder: 'criar', size: 13 },
          { placeholder: 'texto', size: 11 },
          { placeholder: 'colocar no fim', size: 6 },
        ],
        tests: [
          {
            description: 'o café entrou no fim da lista',
            assertion: `
              const textos = [...document.querySelectorAll('#lista li')].map((li) => li.textContent.trim());
              if (textos.join(',') !== 'Pão,Café') throw new Error('Esperava Pão e depois Café; veio [' + textos.join(', ') + '].');
            `,
          },
        ],
        hints: [
          'Criar é um método de `document`; colocar no fim é um método do pai.',
          'O texto de dentro é a mesma propriedade da aula passada.',
        ],
        solution: ['createElement', 'textContent', 'append'],
        explanation:
          'Criar, preencher, colocar — sempre nessa ordem, e o elemento só aparece no terceiro passo. `append` coloca no fim; `prepend` colocaria antes do pão. E o texto vai em `textContent`, mesmo sendo "Café" digitado por você: é o hábito que protege quando o texto vier de alguém.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-12-ordenar-desenhar',
        type: 'order-steps',
        prompt:
          'Uma função `desenhar(itens)` é chamada de novo com dados novos. Coloque na ordem o que ela faz.',
        concepts: ['dom-criar'],
        difficulty: 'intermediario',
        tags: ['dom', 'criar'],
        steps: [
          { id: 'limpa', text: 'Limpa o contêiner: `ul.replaceChildren()` remove todos os filhos', ordem: 1 },
          { id: 'laco', text: 'Percorre os dados atuais, um item de cada vez', ordem: 2 },
          { id: 'cria', text: 'Para cada item, cria um elemento e preenche o texto a partir do item', ordem: 3 },
          { id: 'coloca', text: 'Coloca o elemento no contêiner com `append`', ordem: 4 },
          { id: 'pinta', text: 'A tela mostra exatamente o que os dados dizem — nada a mais, nada a menos', ordem: 5 },
        ],
        explanation:
          'Limpar antes de redesenhar é o que torna a função correta por construção: não importa o que estava na tela, o resultado é uma função só dos dados atuais. É a ideia que o React industrializa; aqui ela cabe em dez linhas e é suficiente para a maioria das telas.',
        hints: [
          'Antes de construir a versão nova, o que se faz com a antiga?',
          'Só há tela nova depois que todos os itens foram colocados.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-12-desenhar',
        type: 'code',
        runtime: 'iframe',
        prompt:
          'Escreva `function desenhar(itens)`: limpa o `#lista` e cria um `<li>` por item com `textContent`. Se a lista estiver vazia, o `#vazio` deixa de estar oculto (`hidden = false`); senão, fica oculto.\n\nChame `desenhar(compras)` no fim.',
        concepts: ['dom-criar'],
        difficulty: 'intermediario',
        tags: ['dom', 'criar'],
        initialCode: `<ul id="lista"></ul>
<p id="vazio" hidden>Nada na lista.</p>

<script>
  const compras = ['Pão', 'Manteiga'];

  function desenhar(itens) {
    // limpe, redesenhe, e decida o #vazio
  }

  desenhar(compras);
</script>
`,
        tests: [
          {
            description: 'a primeira chamada desenha os dois itens',
            assertion: `
              const textos = [...document.querySelectorAll('#lista li')].map((li) => li.textContent.trim());
              if (textos.join(',') !== 'Pão,Manteiga') throw new Error('Esperava Pão e Manteiga em #lista; veio [' + textos.join(', ') + '].');
              if (!document.querySelector('#vazio').hidden) throw new Error('Com itens na lista, #vazio precisa continuar oculto.');
            `,
          },
          {
            description: 'chamar de novo redesenha do zero, sem acumular',
            assertion: `
              if (typeof desenhar !== 'function') throw new Error('A função desenhar precisa existir.');
              desenhar(['Café']);
              const textos = [...document.querySelectorAll('#lista li')].map((li) => li.textContent.trim());
              if (textos.join(',') !== 'Café') throw new Error('Depois de desenhar(["Café"]), a lista precisa ter só Café — limpe antes de redesenhar. Veio [' + textos.join(', ') + '].');
            `,
          },
          {
            description: 'com a lista vazia, o aviso aparece',
            assertion: `
              desenhar([]);
              if (document.querySelectorAll('#lista li').length !== 0) throw new Error('Com [] a lista precisa ficar vazia.');
              if (document.querySelector('#vazio').hidden) throw new Error('Com a lista vazia, #vazio precisa aparecer: hidden = false.');
              desenhar(['Pão']);
              if (!document.querySelector('#vazio').hidden) throw new Error('E ao voltar a ter itens, #vazio se esconde de novo.');
            `,
          },
        ],
        hints: [
          'Comece por `ul.replaceChildren()`; sem isso, a segunda chamada acumula.',
          '`#vazio` é decidido a partir de `itens.length`, dentro da mesma função — é o que mantém tudo coerente.',
          "function desenhar(itens) {\n  const ul = document.querySelector('#lista');\n  ul.replaceChildren();\n  for (const item of itens) {\n    const li = document.createElement('li');\n    li.textContent = item;\n    ul.append(li);\n  }\n  document.querySelector('#vazio').hidden = itens.length > 0;\n}",
        ],
        solution: `<ul id="lista"></ul>
<p id="vazio" hidden>Nada na lista.</p>

<script>
  const compras = ['Pão', 'Manteiga'];

  function desenhar(itens) {
    const ul = document.querySelector('#lista');
    ul.replaceChildren();
    for (const item of itens) {
      const li = document.createElement('li');
      li.textContent = item;
      ul.append(li);
    }
    document.querySelector('#vazio').hidden = itens.length > 0;
  }

  desenhar(compras);
</script>`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-pagina-12-remover',
        type: 'multiple-choice',
        prompt: 'Uma notificação foi lida e não deve mais existir. `remove()` ou `style.display = "none"`?',
        concepts: ['dom-criar'],
        difficulty: 'iniciante',
        tags: ['dom', 'criar'],
        options: [
          '`display: none`: é mais rápido',
          '`remove()`: se a coisa acabou, ela sai da árvore — escondida, ainda conta em seletores e ocupa memória',
          'Tanto faz, o resultado visual é o mesmo',
          '`display: none`, porque `remove()` não pode ser desfeito',
        ],
        correctIndex: 1,
        explanation:
          'Esconder é para o que volta: um menu, um painel. O que acabou, sai. Escondido, o elemento continua na árvore — `querySelectorAll(".notificacao").length` ainda o conta, e o "3 notificações" do contador fica errado. `remove()` resolve o estado, e não só a aparência.',
        hints: ['A notificação vai voltar a aparecer algum dia?'],
      },
    },
    {
      kind: 'summary',
      markdown: `Criar, preencher, colocar: \`createElement\`, \`textContent\`, \`append\` — e o elemento só aparece no terceiro passo. O que veio de gente vai em \`textContent\`; \`innerHTML\` só para HTML seu. \`remove()\` para o que acabou, e não \`display: none\`. E a função \`desenhar(dados)\`, que limpa e reconstrói: os dados são a verdade, a tela é uma função deles.`,
    },
  ],
};

import type { Lesson } from '../types';

export const lessonListas: Lesson = {
  id: 'lesson-react-3',
  trackId: 'track-react',
  title: 'Listas: Um Componente por Item',
  language: 'react',
  objective:
    'Desenhar uma lista com map e uma key estável, acrescentar e remover itens sem mutar, e derivar a lista filtrada ou ordenada na renderização em vez de guardá-la.',
  concepts: ['react-listas'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Quase toda tela tem uma lista: tarefas, mensagens, produtos, resultados. Em React, uma lista na tela é uma lista de dados passada por \`map\`:

~~~tsx
interface Tarefa {
  id: number;
  titulo: string;
}

function Lista({ tarefas }: { tarefas: Tarefa[] }) {
  return (
    <ul>
      {tarefas.map((tarefa) => (
        <li key={tarefa.id}>{tarefa.titulo}</li>
      ))}
    </ul>
  );
}
~~~

\`map\` transforma cada dado num elemento, e o JSX aceita uma lista de elementos entre chaves. É a mesma ideia da função \`desenhar\` da trilha da página — só que o React a chama a cada mudança.

## A \`key\`

O \`key={tarefa.id}\` é obrigatório, e não é decoração. Quando a lista muda, o React precisa saber **qual item é qual**: o que foi removido, o que só mudou de posição, o que é novo. A \`key\` é a identidade de cada item entre uma renderização e a seguinte.

Sem \`key\`, o React avisa no console e compara pela posição. Com o **índice** como \`key\` (\`key={i}\`), a posição vira identidade — e aí remover o primeiro item faz o React pensar que todos os outros mudaram: o segundo "virou" o primeiro, e qualquer estado ou campo de formulário dentro dos itens fica com o item errado. A regra:

- **\`key\` é um id estável do dado**: o id do banco, um código, algo que não muda quando a lista muda.
- **O índice serve** só para listas que nunca mudam de ordem nem perdem itens — uma lista fixa de opções.
- \`key\` é única **entre irmãos**, não no mundo: dois \`map\` diferentes podem repetir ids.

## Acrescentar, remover, alterar: sempre uma lista nova

~~~tsx
setTarefas([...tarefas, nova]);                             // acrescentar
setTarefas(tarefas.filter((t) => t.id !== id));             // remover
setTarefas(tarefas.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t)));  // alterar uma
~~~

\`push\`, \`splice\` e \`t.feita = true\` mutam o que o React já conhece, e ele não vê a mudança. \`[...]\`, \`filter\` e \`map\` devolvem listas novas; o \`{ ...t, feita: !t.feita }\` devolve um objeto novo só para o item que mudou.

## Um componente por item

Quando o \`<li>\` cresce — um botão de remover, uma caixa de marcar, uma classe condicional —, ele vira componente:

~~~tsx
function Item({ tarefa, aoRemover }: { tarefa: Tarefa; aoRemover: (id: number) => void }) {
  return (
    <li>
      {tarefa.titulo}
      <button onClick={() => aoRemover(tarefa.id)}>Remover</button>
    </li>
  );
}

{tarefas.map((t) => <Item key={t.id} tarefa={t} aoRemover={remover} />)}
~~~

A \`key\` vai no componente, na chamada do \`map\` — não dentro dele. E a função de remover é uma prop: o item avisa, o pai (dono da lista) decide. Esse padrão — dados descem, eventos sobem — volta na aula de composição.

## Filtrar e ordenar: derive, não guarde

~~~tsx
const [tarefas, setTarefas] = React.useState<Tarefa[]>([]);
const [filtro, setFiltro] = React.useState<'todas' | 'pendentes'>('todas');

const visiveis = filtro === 'todas' ? tarefas : tarefas.filter((t) => !t.feita);
~~~

Dois estados — os dados e o filtro — e a lista visível é **calculada** a cada renderização. Guardar \`visiveis\` num terceiro estado obrigaria a atualizá-lo em cada lugar que muda \`tarefas\` ou \`filtro\`, e um deles seria esquecido. O mesmo vale para ordenar: \`[...tarefas].sort(...)\` na renderização (a cópia é obrigatória — \`sort\` muta).

## Lista vazia

\`{tarefas.length === 0 && <p>Nenhuma tarefa ainda.</p>}\` — a aula de estados da tela ensinou que o vazio precisa dizer o que fazer. Uma \`<ul>\` sem filhos não diz nada.
`.trim(),
    },
    {
      kind: 'example',
      language: 'tsx',
      code: `interface Tarefa {
  id: number;
  titulo: string;
  feita: boolean;
}

function Item({ tarefa, aoAlternar }: { tarefa: Tarefa; aoAlternar: (id: number) => void }) {
  return (
    <li className={tarefa.feita ? 'feita' : ''}>
      <label>
        <input type="checkbox" checked={tarefa.feita} onChange={() => aoAlternar(tarefa.id)} />
        {tarefa.titulo}
      </label>
    </li>
  );
}

function App() {
  const [tarefas, setTarefas] = React.useState<Tarefa[]>([
    { id: 1, titulo: 'Estudar listas', feita: true },
    { id: 2, titulo: 'Praticar', feita: false },
  ]);
  const [soPendentes, setSoPendentes] = React.useState(false);

  // Derivado: a lista visível nunca é guardada.
  const visiveis = soPendentes ? tarefas.filter((t) => !t.feita) : tarefas;
  const pendentes = tarefas.filter((t) => !t.feita).length;

  function alternar(id: number) {
    setTarefas(tarefas.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t)));
  }

  return (
    <div>
      <label>
        <input type="checkbox" checked={soPendentes} onChange={(e) => setSoPendentes(e.target.checked)} />
        Só pendentes
      </label>
      <p>{pendentes} pendente(s)</p>
      {visiveis.length === 0 && <p>Nada por aqui.</p>}
      <ul>
        {visiveis.map((t) => (
          <Item key={t.id} tarefa={t} aoAlternar={alternar} />
        ))}
      </ul>
    </div>
  );
}`,
      caption:
        'Um componente por item com a `key` no `map`; a lista visível e a contagem derivadas; `alternar` troca só o objeto que mudou, com `map` e espalhamento. Marcar as duas tarefas com o filtro ligado mostra o estado vazio.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-3-key',
        type: 'multiple-choice',
        prompt: 'Para que serve a `key` num `map` de elementos?',
        concepts: ['react-listas'],
        difficulty: 'iniciante',
        tags: ['react', 'listas'],
        options: [
          'Para o CSS conseguir selecionar cada item',
          'Para o React saber qual item é qual entre uma renderização e a seguinte — o que saiu, o que mudou de lugar, o que é novo',
          'Para ordenar a lista automaticamente',
          'É opcional; só evita um aviso no console',
        ],
        correctIndex: 1,
        explanation:
          'A `key` é a identidade do item. Sem ela (ou com o índice), o React compara pela posição: remover o primeiro faz o segundo "virar" o primeiro, e qualquer estado dentro dos itens — um campo digitado, uma caixa marcada — fica com o item errado. O aviso no console existe porque o problema é real, não porque o React é chato.',
        hints: ['Pense em remover o primeiro de três itens: como o React decide o que fazer com os outros dois?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-3-remover',
        type: 'code',
        prompt:
          'Escreva `App` com uma lista de frutas — Maçã, Banana, Uva — em `<li>`, cada uma com um botão `Remover` que a tira da lista. Quando não sobrar nenhuma, mostre `<p>Lista vazia</p>`. Use um id estável como `key`, não o índice.',
        concepts: ['react-listas'],
        difficulty: 'iniciante',
        tags: ['react', 'listas', 'estado'],
        initialCode: `interface Fruta {
  id: number;
  nome: string;
}

const INICIAIS: Fruta[] = [
  { id: 1, nome: 'Maçã' },
  { id: 2, nome: 'Banana' },
  { id: 3, nome: 'Uva' },
];

function App() {
  return <ul></ul>;
}
`,
        tests: [
          {
            description: 'começa com as três frutas',
            assertion: `const t = textos('li').map((x) => x.replace(/Remover$/, '').trim()); if (JSON.stringify(t) !== JSON.stringify(['Maçã', 'Banana', 'Uva'])) throw new Error('Esperava Maçã, Banana e Uva em <li>, veio ' + JSON.stringify(t));`,
          },
          {
            description: 'cada item tem um botão Remover',
            assertion: `const botoes = document.querySelectorAll('li button'); if (botoes.length !== 3) throw new Error('Esperava um botão Remover em cada <li>, encontrei ' + botoes.length + '.');`,
          },
          {
            description: 'remover a Banana deixa Maçã e Uva',
            assertion: `const alvo = Array.from(document.querySelectorAll('li')).find((li) => li.textContent.includes('Banana')); await clicar(alvo.querySelector('button')); const t = textos('li').map((x) => x.replace(/Remover$/, '').trim()); if (JSON.stringify(t) !== JSON.stringify(['Maçã', 'Uva'])) throw new Error('Depois de remover a Banana esperava Maçã e Uva, veio ' + JSON.stringify(t));`,
          },
          {
            description: 'remover as duas que sobraram mostra Lista vazia',
            assertion: `await clicar(document.querySelector('li button')); await clicar(document.querySelector('li button')); if (document.querySelectorAll('li').length !== 0) throw new Error('Deveria não sobrar nenhum <li>.'); if (texto('p') !== 'Lista vazia') throw new Error('Esperava <p>Lista vazia</p>, veio ' + JSON.stringify(texto('p')));`,
          },
        ],
        hints: [
          'O estado começa com `INICIAIS`: `const [frutas, setFrutas] = React.useState(INICIAIS)`.',
          'Remover é `setFrutas(frutas.filter((f) => f.id !== id))`. O `map` faz `<li key={f.id}>{f.nome} <button onClick={() => remover(f.id)}>Remover</button></li>`.',
        ],
        solution: `interface Fruta {
  id: number;
  nome: string;
}

const INICIAIS: Fruta[] = [
  { id: 1, nome: 'Maçã' },
  { id: 2, nome: 'Banana' },
  { id: 3, nome: 'Uva' },
];

function App() {
  const [frutas, setFrutas] = React.useState(INICIAIS);

  function remover(id: number) {
    setFrutas(frutas.filter((f) => f.id !== id));
  }

  return (
    <div>
      {frutas.length === 0 && <p>Lista vazia</p>}
      <ul>
        {frutas.map((f) => (
          <li key={f.id}>
            {f.nome} <button onClick={() => remover(f.id)}>Remover</button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-3-lacuna-alternar',
        type: 'fill-blank',
        prompt: 'Complete: a `key` estável, e a troca de **um** item sem mutar a lista nem o objeto.',
        concepts: ['react-listas'],
        difficulty: 'intermediario',
        tags: ['react', 'listas', 'imutabilidade'],
        template: `interface Tarefa { id: number; titulo: string; feita: boolean }

function App() {
  const [tarefas, setTarefas] = React.useState<Tarefa[]>([
    { id: 1, titulo: 'Ler', feita: false },
    { id: 2, titulo: 'Escrever', feita: false },
  ]);

  function alternar(id: number) {
    setTarefas(tarefas.{{1}}((t) => (t.id === id ? { {{2}}, feita: !t.feita } : t)));
  }

  return (
    <ul>
      {tarefas.map((t) => (
        <li key={{{3}}} className={t.feita ? 'feita' : ''}>
          <button onClick={() => alternar(t.id)}>{t.titulo}</button>
        </li>
      ))}
    </ul>
  );
}`,
        blanks: [
          { placeholder: 'método', size: 6 },
          { placeholder: 'espalhar', size: 4 },
          { placeholder: 'key', size: 5 },
        ],
        tests: [
          {
            description: 'os dois itens aparecem sem a classe feita',
            assertion: `const lis = document.querySelectorAll('li'); if (lis.length !== 2) throw new Error('Esperava 2 <li>.'); if (Array.from(lis).some((li) => li.classList.contains('feita'))) throw new Error('Nenhum item deveria começar feito.');`,
          },
          {
            description: 'clicar em Escrever marca só ele',
            assertion: `await clicar(botao('Escrever')); const classes = Array.from(document.querySelectorAll('li')).map((li) => li.classList.contains('feita')); if (JSON.stringify(classes) !== '[false,true]') throw new Error('Esperava só o segundo com a classe feita, veio ' + JSON.stringify(classes));`,
          },
          {
            description: 'clicar de novo desmarca',
            assertion: `await clicar(botao('Escrever')); const classes = Array.from(document.querySelectorAll('li')).map((li) => li.classList.contains('feita')); if (JSON.stringify(classes) !== '[false,false]') throw new Error('Esperava os dois desmarcados, veio ' + JSON.stringify(classes));`,
          },
        ],
        hints: [
          'O método que devolve uma lista nova com o mesmo tamanho, transformando cada item.',
          'O objeto novo copia o antigo com o espalhamento e sobrescreve `feita`. A key é o id do dado.',
        ],
        solution: ['map', '...t', 't.id'],
        explanation:
          '`map` devolve uma lista nova; `{ ...t, feita: !t.feita }` devolve um objeto novo só para o item alvo, e os outros passam intactos. O React vê uma lista diferente e redesenha. `key={t.id}` é a identidade estável: se fosse o índice, remover ou reordenar confundiria os itens.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-3-bug-mutacao',
        type: 'find-bug',
        prompt:
          "O estado é `readonly string[]`, e por isso o compilador recusa: `Property 'push' does not exist on type 'readonly string[]'`. Sem o readonly, o programa rodaria — e clicar em Adicionar não faria nada aparecer, sem erro nenhum. Aponte a linha do defeito.",
        concepts: ['react-listas'],
        difficulty: 'intermediario',
        tags: ['react', 'listas', 'depuracao'],
        code: `function App() {
  const [itens, setItens] = React.useState<readonly string[]>([]);

  function adicionar() {
    itens.push('item ' + (itens.length + 1));
    setItens(itens);
  }

  return (
    <div>
      <button onClick={adicionar}>Adicionar</button>
      <ul>
        {itens.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {itens.length === 0 && <p>vazio</p>}
    </div>
  );
}`,
        buggyLine: 5,
        fix: "    setItens([...itens, 'item ' + (itens.length + 1)]);",
        symptomLine: 6,
        symptomFeedback:
          'É a linha em que o React não redesenha — mas ela está certa para uma lista nova. O defeito é a linha de cima ter mudado a lista **por dentro**, e entregado a mesma referência.',
        explanation:
          '`push` muta a lista que o React já tem. `setItens(itens)` entrega a **mesma** referência, e o React compara por identidade: "é o mesmo objeto, nada mudou", e não redesenha. O item está lá dentro — se qualquer outra coisa provocasse uma renderização, ele apareceria —, o que torna o bug traiçoeiro. Declarar o estado como `readonly string[]` é o que transforma o bug silencioso em erro de compilação: `push` deixa de existir, e sobra o caminho certo, a lista nova com `[...itens, novo]`. (A linha 6 fica redundante depois; `setItens` com a lista nova já a substitui.)',
        hints: [
          'O compilador aponta o método que uma lista somente leitura não tem. Por que ele não deveria existir aqui?',
          'Como o React decide se a lista mudou? O que `push` faz com a referência?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-3-indice',
        type: 'multiple-choice',
        prompt: 'Uma lista de campos de texto usa `key={i}` (o índice). A pessoa digita no primeiro campo e remove o primeiro item. O que acontece?',
        concepts: ['react-listas'],
        difficulty: 'intermediario',
        tags: ['react', 'listas'],
        options: [
          'O campo digitado some junto com o item, como esperado',
          'O texto digitado aparece no campo do item seguinte: pela `key`, o índice 0 continua existindo, e o React reaproveita o campo — só troca o rótulo',
          'O React lança um erro de key duplicada',
          'A lista inteira é redesenhada do zero',
        ],
        correctIndex: 1,
        explanation:
          'Com o índice como identidade, remover o primeiro item não remove a `key` 0 — o segundo item passa a ter índice 0. O React conclui que o item 0 continua lá (com outro rótulo) e mantém o `<input>` com o texto digitado. É o defeito clássico, e ele só aparece em listas com estado dentro dos itens ou que mudam de ordem. Um id estável faz o React remover exatamente o campo do item que saiu.',
        hints: ['Depois da remoção, quem passa a ter índice 0? A key desse item mudou?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-3-filtro',
        type: 'code',
        prompt:
          'Escreva `App` com uma lista de produtos e um campo de busca com rótulo `Buscar`: a lista mostra só os produtos cujo nome contém o texto digitado (sem diferenciar maiúsculas). Com o campo vazio, mostra todos. Sem resultado, mostra `<p>Nenhum produto</p>`. A lista filtrada é derivada — não guarde um segundo estado.',
        concepts: ['react-listas'],
        difficulty: 'intermediario',
        tags: ['react', 'listas', 'derivado'],
        initialCode: `const PRODUTOS = ['Caderno', 'Caneta', 'Lápis', 'Borracha', 'Cola'];

function App() {
  return (
    <div>
      <label>
        Buscar <input />
      </label>
      <ul></ul>
    </div>
  );
}
`,
        tests: [
          {
            description: 'com o campo vazio, os cinco produtos aparecem',
            assertion: `if (document.querySelectorAll('li').length !== 5) throw new Error('Esperava 5 <li>, encontrei ' + document.querySelectorAll('li').length + '.');`,
          },
          {
            description: "digitar 'ca' deixa Caderno e Caneta",
            assertion: `await digitar(campo('Buscar'), 'ca'); const t = textos('li'); if (JSON.stringify(t) !== JSON.stringify(['Caderno', 'Caneta'])) throw new Error("Com 'ca' esperava Caderno e Caneta, veio " + JSON.stringify(t));`,
          },
          {
            description: 'a busca não diferencia maiúsculas',
            assertion: `await digitar(campo('Buscar'), 'LÁP'); const t = textos('li'); if (JSON.stringify(t) !== JSON.stringify(['Lápis'])) throw new Error("Com 'LÁP' esperava só Lápis, veio " + JSON.stringify(t));`,
          },
          {
            description: 'sem resultado, aparece Nenhum produto',
            assertion: `await digitar(campo('Buscar'), 'zzz'); if (document.querySelectorAll('li').length !== 0 || texto('p') !== 'Nenhum produto') throw new Error('Sem resultado esperava nenhum <li> e um <p>Nenhum produto</p>.');`,
          },
          {
            description: 'apagar a busca traz todos de volta',
            assertion: `await digitar(campo('Buscar'), ''); if (document.querySelectorAll('li').length !== 5) throw new Error('Com o campo vazio de novo, esperava os 5 produtos.');`,
          },
        ],
        hints: [
          'Um único estado: o texto da busca. `const [busca, setBusca] = React.useState(\'\')`, ligado ao input com `value` e `onChange`.',
          'A lista visível é calculada: `PRODUTOS.filter((p) => p.toLowerCase().includes(busca.toLowerCase()))`. Depois, `map` com `key={p}` e o `<p>` quando o tamanho é 0.',
        ],
        solution: `const PRODUTOS = ['Caderno', 'Caneta', 'Lápis', 'Borracha', 'Cola'];

function App() {
  const [busca, setBusca] = React.useState('');
  const visiveis = PRODUTOS.filter((p) => p.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div>
      <label>
        Buscar <input value={busca} onChange={(e) => setBusca(e.target.value)} />
      </label>
      {visiveis.length === 0 && <p>Nenhum produto</p>}
      <ul>
        {visiveis.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Uma lista na tela é \`dados.map((d) => <Item key={d.id} … />)\`, com a \`key\` no \`map\` e vinda de um id estável — o índice confunde o React quando a lista muda. Acrescentar, remover e alterar são sempre uma lista nova (\`[...]\`, \`filter\`, \`map\` com \`{ ...t }\`); \`push\` e \`sort\` mutam e o React não vê. Filtrada e ordenada se derivam na renderização, nunca se guardam. E o vazio diz o que fazer.`,
    },
  ],
};

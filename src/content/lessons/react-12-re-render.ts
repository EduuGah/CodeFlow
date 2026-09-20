import type { Lesson } from '../types';

export const lessonReRender: Lesson = {
  id: 'lesson-react-12',
  trackId: 'track-react',
  title: 'Re-render: O que Faz o React Redesenhar',
  language: 'react',
  objective:
    'Saber o que dispara uma renderização, por que isso quase nunca é problema, e as três ferramentas para quando é — memo, useMemo, useCallback — e a key que zera um componente.',
  concepts: ['react-render'],
  status: 'published',
  estimatedMinutes: 27,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Você já sabe a regra: muda o estado, o React roda o componente de novo. Esta aula é sobre **quem mais** roda, quando isso importa, e o que fazer quando importa — que é menos vezes do que parece.

## Quem renderiza de novo

Quando um componente renderiza, **todos os filhos dele renderizam também**, recebam props novas ou não. \`setBusca\` no \`App\` roda o \`App\`, a \`Lista\`, cada \`Item\`. O React então compara o JSX novo com o anterior e toca só no DOM que mudou — renderizar é calcular JSX, e calcular é barato.

Isso é o comportamento certo na maior parte do tempo. Uma lista de cem itens renderiza em menos de um milissegundo. **Não otimize o que não mediu.**

## Quando pesa

Dois casos reais:

1. Uma conta cara na renderização — ordenar dez mil itens, filtrar com uma expressão complexa — repetida a cada tecla num campo que não tem nada a ver com ela.
2. Um filho grande (uma tabela, um gráfico) redesenhado a cada tecla de um campo do pai.

Para cada um há uma ferramenta, e as três dependem da mesma ideia: **o React compara por identidade**. Um valor primitivo igual é igual; um objeto, lista ou função novos são "diferentes" mesmo com o mesmo conteúdo.

## \`useMemo\`: lembrar um valor

~~~tsx
const ordenados = React.useMemo(
  () => [...itens].sort((a, b) => a.nome.localeCompare(b.nome)),
  [itens]
);
~~~

Roda a função na primeira vez e guarda o resultado; nas renderizações seguintes, **só recalcula se algum item da lista mudou**. A lista de dependências é a mesma do \`useEffect\`, com a mesma regra: tudo o que a função lê vai nela. Digitar na busca não reordena; mudar \`itens\`, sim.

## \`memo\`: pular o filho

~~~tsx
const Tabela = React.memo(function Tabela({ linhas }: { linhas: Linha[] }) {
  return <table>…</table>;
});
~~~

\`React.memo\` envolve um componente e diz: se as props forem **as mesmas** (por identidade) da renderização anterior, não rode. O pai renderiza a cada tecla; a \`Tabela\` só quando \`linhas\` muda.

E aqui mora a armadilha: se o pai passa \`aoSelecionar={(id) => …}\`, a função é criada de novo a cada renderização — identidade nova, \`memo\` inútil.

## \`useCallback\`: a mesma função

~~~tsx
const aoSelecionar = React.useCallback((id: number) => setSelecionado(id), []);
~~~

Guarda a função e devolve a **mesma** entre renderizações, enquanto as dependências não mudam. Existe só para isto: entregar uma prop estável a um filho com \`memo\` (ou a uma lista de dependências). Sem um \`memo\` do outro lado, \`useCallback\` é ruído.

Os três juntos: \`useMemo\` para o valor, \`useCallback\` para a função, \`memo\` no filho que os recebe. Um sem os outros costuma não fazer nada.

## \`key\` para zerar

Um uso diferente da \`key\` da aula de listas: **trocar a key remonta o componente**, com estado novo.

~~~tsx
<FormularioDeEdicao key={usuario.id} usuario={usuario} />
~~~

Ao selecionar outro usuário, a key muda, o formulário antigo é desmontado e um novo nasce com os campos do usuário novo — sem efeito para "resetar" o estado, sem sincronizar props com estado. É a forma certa de "começar de novo" um componente quando o dado que ele edita muda.

## O objeto do Provider

\`<Contexto.Provider value={{ usuario, sair }}>\` cria um objeto novo a cada renderização do \`App\` — e todo consumidor renderiza. Se isso pesar (muitos consumidores, \`App\` renderizando muito), \`useMemo\` no objeto: \`const valor = React.useMemo(() => ({ usuario, sair }), [usuario, sair])\`.

## A regra

Escreva sem \`memo\` nenhum. Quando algo ficar lento **e você medir** (o Profiler do React, ou um contador de renderizações), aplique a ferramenta certa no lugar certo. Otimizar por reflexo enche o código de \`useCallback\` que não protege nada.
`.trim(),
    },
    {
      kind: 'example',
      language: 'tsx',
      code: `interface Item { id: number; nome: string }

let rendersDaLista = 0;

const Lista = React.memo(function Lista({ itens, aoRemover }: { itens: Item[]; aoRemover: (id: number) => void }) {
  rendersDaLista += 1;
  return (
    <ul>
      {itens.map((i) => (
        <li key={i.id}>
          {i.nome} <button onClick={() => aoRemover(i.id)}>Remover</button>
        </li>
      ))}
    </ul>
  );
});

function App() {
  const [itens, setItens] = React.useState<Item[]>([{ id: 1, nome: 'Caderno' }, { id: 2, nome: 'Caneta' }]);
  const [busca, setBusca] = React.useState('');

  // A mesma função enquanto nada mudar: a Lista com memo não renderiza à toa.
  const aoRemover = React.useCallback((id: number) => {
    setItens((atuais) => atuais.filter((i) => i.id !== id));
  }, []);

  return (
    <div>
      <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite: a Lista não redesenha" />
      <Lista itens={itens} aoRemover={aoRemover} />
      <p>Renderizações da lista: {rendersDaLista}</p>
    </div>
  );
}`,
      caption:
        'Digitar no campo renderiza o `App`, mas a `Lista` — com `memo` e recebendo `itens` (mesmo estado) e `aoRemover` (mesma função, por `useCallback`) — não. Remover um item muda `itens`, e aí sim ela renderiza. O contador é a medição; sem ele, você estaria otimizando no escuro.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-12-quem',
        type: 'multiple-choice',
        prompt: 'O `App` tem um campo de busca e renderiza `<Tabela linhas={linhas} />`, sem `memo`. A pessoa digita uma letra. O que renderiza de novo?',
        concepts: ['react-render'],
        difficulty: 'iniciante',
        tags: ['react', 'render'],
        options: [
          'Só o campo de busca',
          'O `App` e a `Tabela` — todo filho renderiza junto com o pai, receba props novas ou não; o DOM só muda onde o JSX mudou',
          'Só o `App`, porque as props da `Tabela` não mudaram',
          'Nada, até a pessoa parar de digitar',
        ],
        correctIndex: 1,
        explanation:
          'Renderizar é rodar a função e produzir JSX; o filho roda sempre que o pai roda. Depois o React compara o JSX com o anterior e toca só no que mudou no DOM — por isso, na maior parte dos casos, isso não custa nada perceptível. `memo` é o que faz a `Tabela` pular a renderização quando as props são as mesmas, e só vale a pena se a tabela for pesada e você tiver medido.',
        hints: ['Sem `memo`, o que decide se um filho roda de novo: as props dele, ou o pai ter rodado?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-12-memo',
        type: 'code',
        prompt:
          'O `App` tem um campo de busca (rótulo `Buscar`) e uma `Lista` com botão `Remover` em cada item. A `Lista` conta as próprias renderizações na variável `rendersDaLista`. Faça a `Lista` **não** renderizar quando a pessoa digita na busca — mas renderizar quando um item é removido. Use `React.memo` e `useCallback`; a busca aqui é só um campo, não filtra a lista.',
        concepts: ['react-render'],
        difficulty: 'intermediario',
        tags: ['react', 'render', 'memo'],
        initialCode: `interface Item {
  id: number;
  nome: string;
}

let rendersDaLista = 0;

function Lista({ itens, aoRemover }: { itens: Item[]; aoRemover: (id: number) => void }) {
  rendersDaLista += 1;
  return (
    <ul>
      {itens.map((i) => (
        <li key={i.id}>
          {i.nome} <button onClick={() => aoRemover(i.id)}>Remover</button>
        </li>
      ))}
    </ul>
  );
}

function App() {
  const [itens, setItens] = React.useState<Item[]>([
    { id: 1, nome: 'Caderno' },
    { id: 2, nome: 'Caneta' },
    { id: 3, nome: 'Lápis' },
  ]);
  const [busca, setBusca] = React.useState('');

  function aoRemover(id: number) {
    setItens(itens.filter((i) => i.id !== id));
  }

  return (
    <div>
      <label>
        Buscar <input value={busca} onChange={(e) => setBusca(e.target.value)} />
      </label>
      <Lista itens={itens} aoRemover={aoRemover} />
    </div>
  );
}
`,
        tests: [
          {
            description: 'a lista aparece com os três itens',
            assertion: `if (document.querySelectorAll('li').length !== 3) throw new Error('Esperava 3 <li>.');`,
          },
          {
            description: 'digitar três letras na busca não renderiza a Lista',
            assertion: `const antes = rendersDaLista; await digitar(campo('Buscar'), 'a'); await digitar(campo('Buscar'), 'ab'); await digitar(campo('Buscar'), 'abc'); const depois = rendersDaLista; if (depois !== antes) throw new Error('Digitar renderizou a Lista ' + (depois - antes) + ' vez(es). Com memo na Lista e a mesma função aoRemover (useCallback), ela não deveria renderizar.');`,
          },
          {
            description: 'remover um item renderiza a Lista (as props mudaram de verdade)',
            assertion: `const antes = rendersDaLista; await clicar(document.querySelector('li button')); if (document.querySelectorAll('li').length !== 2) throw new Error('Remover deveria tirar um item.'); if (rendersDaLista <= antes) throw new Error('Com itens diferentes, a Lista precisa renderizar.');`,
          },
        ],
        hints: [
          'Envolva o componente: `const Lista = React.memo(function Lista(...) { ... })`. Só isso não basta: `aoRemover` é uma função nova a cada renderização do App.',
          '`const aoRemover = React.useCallback((id: number) => setItens((atuais) => atuais.filter((i) => i.id !== id)), [])` — a forma com função no `setItens` é o que deixa a lista de dependências vazia.',
        ],
        solution: `interface Item {
  id: number;
  nome: string;
}

let rendersDaLista = 0;

const Lista = React.memo(function Lista({ itens, aoRemover }: { itens: Item[]; aoRemover: (id: number) => void }) {
  rendersDaLista += 1;
  return (
    <ul>
      {itens.map((i) => (
        <li key={i.id}>
          {i.nome} <button onClick={() => aoRemover(i.id)}>Remover</button>
        </li>
      ))}
    </ul>
  );
});

function App() {
  const [itens, setItens] = React.useState<Item[]>([
    { id: 1, nome: 'Caderno' },
    { id: 2, nome: 'Caneta' },
    { id: 3, nome: 'Lápis' },
  ]);
  const [busca, setBusca] = React.useState('');

  const aoRemover = React.useCallback((id: number) => {
    setItens((atuais) => atuais.filter((i) => i.id !== id));
  }, []);

  return (
    <div>
      <label>
        Buscar <input value={busca} onChange={(e) => setBusca(e.target.value)} />
      </label>
      <Lista itens={itens} aoRemover={aoRemover} />
    </div>
  );
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-12-lacuna-key',
        type: 'fill-blank',
        prompt: 'Complete: o formulário de edição precisa começar do zero quando o usuário selecionado muda — sem efeito, sem sincronizar.',
        concepts: ['react-render'],
        difficulty: 'intermediario',
        tags: ['react', 'render', 'key'],
        template: `interface Usuario { id: number; nome: string }

const USUARIOS: Usuario[] = [
  { id: 1, nome: 'Ana' },
  { id: 2, nome: 'Bruno' },
];

function Formulario({ usuario }: { usuario: Usuario }) {
  const [nome, setNome] = React.useState(usuario.nome);
  return (
    <label>
      Nome <input value={nome} onChange={(e) => setNome(e.target.value)} />
    </label>
  );
}

function App() {
  const [selecionado, setSelecionado] = React.useState(USUARIOS[0]);
  return (
    <div>
      {USUARIOS.map((u) => (
        <button key={u.id} onClick={() => setSelecionado(u)}>{u.nome}</button>
      ))}
      <Formulario {{1}}={selecionado.{{2}}} usuario={selecionado} />
    </div>
  );
}`,
        blanks: [
          { placeholder: 'prop', size: 3 },
          { placeholder: 'campo', size: 2 },
        ],
        tests: [
          {
            description: 'começa com a Ana no campo',
            assertion: `if (campo('Nome').value !== 'Ana') throw new Error('Esperava "Ana" no campo.');`,
          },
          {
            description: 'trocar para Bruno zera o formulário, mesmo depois de digitar',
            assertion: `await digitar(campo('Nome'), 'Ana Maria'); await clicar(botao('Bruno')); if (campo('Nome').value !== 'Bruno') throw new Error('Ao selecionar Bruno o campo deveria mostrar "Bruno" — o formulário precisa nascer de novo. Veio ' + JSON.stringify(campo('Nome').value));`,
          },
          {
            description: 'voltar para Ana também recomeça',
            assertion: `await clicar(botao('Ana')); if (campo('Nome').value !== 'Ana') throw new Error('De volta à Ana, esperava "Ana" (o "Ana Maria" digitado se perdeu porque o componente foi remontado).');`,
          },
        ],
        hints: [
          'A prop especial que identifica um elemento entre renderizações — quando ela muda, o componente é desmontado e montado de novo.',
          'O valor precisa ser diferente para cada usuário: o identificador dele.',
        ],
        solution: ['key', 'id'],
        explanation:
          '`useState(usuario.nome)` só lê o inicial na montagem — trocar a prop depois não muda o estado. Com `key={selecionado.id}`, trocar de usuário troca a key, e o React desmonta o formulário antigo e monta um novo, que lê o nome novo. Zero efeitos, zero sincronização: a key diz "isto é outra instância".',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-12-bug-usememo',
        type: 'find-bug',
        prompt:
          "O compilador recusa: `Property 'toFixed' does not exist on type 'void'`. Aponte a linha que precisa mudar.",
        concepts: ['react-render'],
        difficulty: 'intermediario',
        tags: ['react', 'render', 'depuracao'],
        code: `function App() {
  const [precos] = React.useState([10, 20, 30]);
  const [busca, setBusca] = React.useState('');

  const total = React.useMemo(() => {
    precos.reduce((soma, p) => soma + p, 0);
  }, [precos]);

  return (
    <div>
      <input value={busca} onChange={(e) => setBusca(e.target.value)} />
      <p>Total: {total.toFixed(2)}</p>
    </div>
  );
}`,
        buggyLine: 6,
        fix: '    return precos.reduce((soma, p) => soma + p, 0);',
        symptomLine: 12,
        symptomFeedback:
          'É onde o erro aparece: `total.toFixed` num `total` que é `void`. Mas a linha está certa para um número — o problema é a função do `useMemo` não devolver o que calculou.',
        explanation:
          '`useMemo` devolve o que a função devolve. Com chaves e sem `return`, a função calcula a soma e a joga fora — `total` é `void`, e o compilador recusa o `toFixed`. É o mesmo erro do `map` com chaves sem `return`, da trilha de JavaScript, agora num hook. Ou `return` na frente, ou a forma sem chaves: `() => precos.reduce(...)`.',
        hints: [
          'O erro aparece no `toFixed`, mas o que `useMemo` devolve? De onde vem esse valor?',
          'Uma função com chaves precisa de `return` para devolver algo.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-12-quando',
        type: 'multiple-choice',
        prompt: 'Um componente de formulário com três campos renderiza a cada tecla, e você não mediu lentidão nenhuma. O que a aula recomenda?',
        concepts: ['react-render'],
        difficulty: 'iniciante',
        tags: ['react', 'render'],
        options: [
          'Envolver todos os filhos em `memo` e todas as funções em `useCallback`, por garantia',
          'Nada: renderizar é barato, e otimizar sem medir enche o código de proteção que não protege nada; meça antes, otimize onde pesa',
          'Mover os campos para `useRef` para evitar renderizações',
          'Trocar `useState` por contexto',
        ],
        correctIndex: 1,
        explanation:
          'Três campos renderizando a cada tecla é o React funcionando como deve — em menos de um milissegundo. `memo` e `useCallback` têm custo (comparar props, guardar funções, ler o código) e só pagam quando há algo pesado do outro lado, medido. A ordem é: escrever simples, medir, e aplicar a ferramenta no lugar exato.',
        hints: ['Qual é o problema que se está tentando resolver? Ele foi medido?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-12-usememo',
        type: 'code',
        prompt:
          'O `App` ordena uma lista de nomes a cada renderização, e conta quantas vezes ordenou na variável `ordenacoes`. Faça a ordenação acontecer só quando a lista muda — não quando a pessoa digita no campo `Filtro` (que é só um campo aqui). Um botão `Adicionar` acrescenta `Zé` à lista, e aí sim reordena.',
        concepts: ['react-render'],
        difficulty: 'intermediario',
        tags: ['react', 'render', 'usememo'],
        initialCode: `let ordenacoes = 0;

function ordenar(nomes: string[]): string[] {
  ordenacoes += 1;
  return [...nomes].sort((a, b) => a.localeCompare(b));
}

function App() {
  const [nomes, setNomes] = React.useState(['Carla', 'Ana', 'Bruno']);
  const [filtro, setFiltro] = React.useState('');

  const ordenados = ordenar(nomes);

  return (
    <div>
      <label>
        Filtro <input value={filtro} onChange={(e) => setFiltro(e.target.value)} />
      </label>
      <button onClick={() => setNomes([...nomes, 'Zé'])}>Adicionar</button>
      <ul>
        {ordenados.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}
`,
        tests: [
          {
            description: 'a lista aparece ordenada',
            assertion: `if (JSON.stringify(textos('li')) !== JSON.stringify(['Ana', 'Bruno', 'Carla'])) throw new Error('Esperava Ana, Bruno, Carla em ordem, veio ' + JSON.stringify(textos('li')));`,
          },
          {
            description: 'digitar no filtro não reordena',
            assertion: `const antes = ordenacoes; await digitar(campo('Filtro'), 'x'); await digitar(campo('Filtro'), 'xy'); if (ordenacoes !== antes) throw new Error('Digitar ordenou ' + (ordenacoes - antes) + ' vez(es); com useMemo dependendo só de nomes, não deveria.');`,
          },
          {
            description: 'adicionar um nome reordena uma vez',
            assertion: `const antes = ordenacoes; await clicar(botao('Adicionar')); if (ordenacoes !== antes + 1) throw new Error('Adicionar deveria ordenar exatamente uma vez, ordenou ' + (ordenacoes - antes) + '.'); if (JSON.stringify(textos('li')) !== JSON.stringify(['Ana', 'Bruno', 'Carla', 'Zé'])) throw new Error('Esperava Zé no fim, em ordem.');`,
          },
        ],
        hints: [
          '`const ordenados = React.useMemo(() => ordenar(nomes), [nomes]);` — a função só roda quando `nomes` muda.',
          'Tudo o que a função lê vai na lista: aqui, só `nomes`. `filtro` não entra, e é por isso que digitar não reordena.',
        ],
        solution: `let ordenacoes = 0;

function ordenar(nomes: string[]): string[] {
  ordenacoes += 1;
  return [...nomes].sort((a, b) => a.localeCompare(b));
}

function App() {
  const [nomes, setNomes] = React.useState(['Carla', 'Ana', 'Bruno']);
  const [filtro, setFiltro] = React.useState('');

  const ordenados = React.useMemo(() => ordenar(nomes), [nomes]);

  return (
    <div>
      <label>
        Filtro <input value={filtro} onChange={(e) => setFiltro(e.target.value)} />
      </label>
      <button onClick={() => setNomes([...nomes, 'Zé'])}>Adicionar</button>
      <ul>
        {ordenados.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Quando um componente renderiza, os filhos renderizam junto — e isso é barato e certo na maior parte do tempo; o DOM só muda onde o JSX mudou. Quando pesa, e você mediu: \`useMemo\` lembra um valor, \`memo\` pula o filho com as mesmas props, \`useCallback\` mantém a função igual para o \`memo\` funcionar — os três comparam por identidade. Trocar a \`key\` remonta um componente com estado novo. Otimizar sem medir é ruído.`,
    },
  ],
};

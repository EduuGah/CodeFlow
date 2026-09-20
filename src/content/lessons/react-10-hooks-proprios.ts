import type { Lesson } from '../types';

export const lessonHooksProprios: Lesson = {
  id: 'lesson-react-10',
  trackId: 'track-react',
  title: 'Hooks Próprios: Extrair a Lógica, Deixar a Tela',
  language: 'react',
  objective:
    'Extrair estado e efeitos repetidos para uma função `useAlgo`, entender as duas regras dos hooks e por quê, e reconhecer que um hook não compartilha estado — compartilha lógica.',
  concepts: ['react-hooks'],
  status: 'published',
  estimatedMinutes: 27,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Na aula de estados de erro, dois componentes buscavam dados com o mesmo bloco de vinte linhas: o estado de três formas, o efeito com \`ativo\`, o contador de tentativa. Copiar era o jeito de seguir em frente. Esta aula é o jeito de parar de copiar.

## Uma função que usa hooks

~~~tsx
function useContador(inicial: number) {
  const [valor, setValor] = React.useState(inicial);
  const mais = () => setValor((v) => v + 1);
  const menos = () => setValor((v) => v - 1);
  const zerar = () => setValor(inicial);
  return { valor, mais, menos, zerar };
}

function Placar() {
  const casa = useContador(0);
  const fora = useContador(0);
  return (
    <p>
      <button onClick={casa.mais}>Casa: {casa.valor}</button>
      <button onClick={fora.mais}>Fora: {fora.valor}</button>
    </p>
  );
}
~~~

\`useContador\` é uma função comum que chama \`useState\` por dentro. É tudo o que um **hook próprio** é: lógica com estado ou efeitos, extraída para uma função cujo nome começa com \`use\`. O componente fica com a tela; o hook fica com o comportamento.

Repare em \`casa\` e \`fora\`: **duas chamadas, dois estados**. Um hook não compartilha estado entre quem o usa — cada chamada tem o seu \`useState\`, como se o código estivesse copiado ali. O que se compartilha é a lógica. (Compartilhar estado é o contexto, da aula passada.)

## O exemplo que vale a aula

~~~tsx
type Tela<T> = { estado: 'carregando' } | { estado: 'erro' } | { estado: 'pronto'; dados: T };

function useBusca<T>(caminho: string) {
  const [tela, setTela] = React.useState<Tela<T>>({ estado: 'carregando' });
  const [tentativa, setTentativa] = React.useState(0);

  React.useEffect(() => {
    let ativo = true;
    setTela({ estado: 'carregando' });
    async function carregar() {
      try {
        const r = await fetch(caminho);
        if (!r.ok) throw new Error('status ' + r.status);
        const dados: T = await r.json();
        if (ativo) setTela({ estado: 'pronto', dados });
      } catch {
        if (ativo) setTela({ estado: 'erro' });
      }
    }
    void carregar();
    return () => { ativo = false; };
  }, [caminho, tentativa]);

  return { tela, tentarDeNovo: () => setTentativa((t) => t + 1) };
}

function Perfil() {
  const { tela, tentarDeNovo } = useBusca<{ nome: string }>('/api/perfil');
  if (tela.estado === 'carregando') return <p>Carregando…</p>;
  if (tela.estado === 'erro') return <button onClick={tentarDeNovo}>Tentar de novo</button>;
  return <h2>{tela.dados.nome}</h2>;
}
~~~

As vinte linhas moram num lugar. \`Perfil\`, \`Notificacoes\`, \`Lista\` viram três linhas cada: o que mostrar em cada estado. E o hook é genérico — \`useBusca<T>\` devolve dados do tipo que quem chama declara, como a aula de genéricos ensinou.

## As duas regras

Hooks têm duas regras, e as duas vêm do mesmo fato: **o React identifica cada \`useState\` pela ordem em que é chamado**. Ele não sabe nomes; sabe "o primeiro, o segundo, o terceiro".

1. **Só no topo.** Nunca dentro de \`if\`, laço ou depois de um \`return\`. Um \`useState\` dentro de \`if\` chamado numa renderização e não na outra desloca a ordem — e o React entrega o estado errado a cada hook seguinte.
2. **Só em componentes e em outros hooks.** Uma função comum não tem "renderização" — não há ordem para contar.

O nome \`use\` é o que deixa o React (e as ferramentas) aplicar essas regras: uma função que começa com \`use\` é tratada como hook.

## O que extrair

Extraia quando o mesmo par estado + efeito aparece em dois componentes, ou quando um componente tem tanta lógica que a tela sumiu no meio dela. Nomes típicos: \`useBusca\`, \`useArmazenamento\`, \`useLarguraDaJanela\`, \`useFormulario\`. O hook devolve o que o componente precisa — valor e funções, num objeto ou numa tupla como o \`useState\`.

Não extraia por reflexo: um \`useState\` sozinho num componente só não é lógica repetida, é o componente.

## Erros

- Hook dentro de \`if\` ou depois de um \`return\` antecipado.
- Esperar que dois componentes com o mesmo hook vejam o mesmo estado.
- Nome sem \`use\`: as regras deixam de ser verificadas.
- Hook que devolve o \`set\` cru quando poderia devolver ações com nome (\`mais\`, \`zerar\`).
`.trim(),
    },
    {
      kind: 'example',
      language: 'tsx',
      code: `function useArmazenado(chave: string, inicial: string): [string, (v: string) => void] {
  const [valor, setValor] = React.useState(() => localStorage.getItem(chave) ?? inicial);

  React.useEffect(() => {
    localStorage.setItem(chave, valor);
  }, [chave, valor]);

  return [valor, setValor];
}

function App() {
  const [nome, setNome] = useArmazenado('nome', '');
  const [tema, setTema] = useArmazenado('tema', 'claro');

  return (
    <div className={tema}>
      <label>
        Nome <input value={nome} onChange={(e) => setNome(e.target.value)} />
      </label>
      <button onClick={() => setTema(tema === 'claro' ? 'escuro' : 'claro')}>Tema: {tema}</button>
      <p>{nome ? 'Olá, ' + nome : 'Digite seu nome'}</p>
    </div>
  );
}`,
      caption:
        'Um hook com estado e efeito: lê o armazenamento uma vez (a função no `useState` só roda na montagem) e grava a cada mudança. Duas chamadas, dois valores independentes. Devolve uma tupla, como o `useState`, para o componente nomear o par como quiser.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-10-compartilha',
        type: 'multiple-choice',
        prompt: 'Dois componentes chamam o mesmo `useContador(0)`. O primeiro clica em `mais`. O que acontece no segundo?',
        concepts: ['react-hooks'],
        difficulty: 'iniciante',
        tags: ['react', 'hooks'],
        options: [
          'Ele também sobe, porque o hook é compartilhado',
          'Nada: cada chamada do hook tem o próprio `useState`; o hook compartilha a lógica, não o estado',
          'Ele sobe só se estiver dentro do mesmo pai',
          'Depende de o hook ter sido declarado fora ou dentro dos componentes',
        ],
        correctIndex: 1,
        explanation:
          'Um hook próprio é uma função que chama hooks do React; cada componente que a chama recebe os próprios `useState` e `useEffect`, exatamente como se o código estivesse escrito ali dentro. Dois `useContador` são dois contadores. Para dois componentes verem o **mesmo** estado, o estado sobe (props) ou vai para um contexto.',
        hints: ['Pense no hook como código copiado para dentro de cada componente. O que acontece com o `useState` de cada cópia?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-10-alternar',
        type: 'code',
        prompt:
          'Escreva o hook `useAlternar(inicial: boolean)`, que devolve `{ ligado, alternar, ligar, desligar }`. Em `App`, use-o duas vezes — um painel `Menu` e um painel `Ajuda`, cada um com um botão `Abrir Menu`/`Fechar Menu` (idem Ajuda) e um `<p>` com o conteúdo só quando aberto — e prove que são independentes.',
        concepts: ['react-hooks'],
        difficulty: 'intermediario',
        tags: ['react', 'hooks', 'estado'],
        initialCode: `function App() {
  const [menuAberto, setMenuAberto] = React.useState(false);
  const [ajudaAberta, setAjudaAberta] = React.useState(false);

  return (
    <div>
      <button onClick={() => setMenuAberto(!menuAberto)}>{menuAberto ? 'Fechar Menu' : 'Abrir Menu'}</button>
      {menuAberto && <p>Conteúdo do Menu</p>}
      <button onClick={() => setAjudaAberta(!ajudaAberta)}>{ajudaAberta ? 'Fechar Ajuda' : 'Abrir Ajuda'}</button>
      {ajudaAberta && <p>Conteúdo da Ajuda</p>}
    </div>
  );
}
`,
        tests: [
          {
            description: 'os dois painéis começam fechados',
            assertion: `botao('Abrir Menu'); botao('Abrir Ajuda'); if (document.querySelectorAll('p').length !== 0) throw new Error('Fechados, não deveria haver <p>.');`,
          },
          {
            description: 'abrir o Menu não abre a Ajuda: os dois hooks são independentes',
            assertion: `await clicar(botao('Abrir Menu')); botao('Fechar Menu'); botao('Abrir Ajuda'); const p = textos('p'); if (JSON.stringify(p) !== '["Conteúdo do Menu"]') throw new Error('Esperava só o conteúdo do Menu aberto, veio ' + JSON.stringify(p));`,
          },
          {
            description: 'existe o hook useAlternar, e o App o usa em vez de useState direto',
            assertion: `if (typeof window.useAlternar !== 'function') throw new Error('Declare o hook com function useAlternar(...).'); const app = String(window.App); if (/useState/.test(app)) throw new Error('O App não deveria chamar useState direto: o estado dos painéis mora no hook useAlternar.'); if (!/useAlternar/.test(app)) throw new Error('O App deveria chamar useAlternar.'); const hook = String(window.useAlternar); if (!/useState/.test(hook)) throw new Error('O hook precisa guardar o estado com useState.');`,
          },
        ],
        hints: [
          'O hook: `const [ligado, setLigado] = React.useState(inicial)` e três funções que chamam `setLigado`. Devolva um objeto com os quatro.',
          'No `App`: `const menu = useAlternar(false); const ajuda = useAlternar(false);` e use `menu.ligado` e `menu.alternar` (idem ajuda).',
        ],
        solution: `function useAlternar(inicial: boolean) {
  const [ligado, setLigado] = React.useState(inicial);
  return {
    ligado,
    alternar: () => setLigado((v) => !v),
    ligar: () => setLigado(true),
    desligar: () => setLigado(false),
  };
}

function App() {
  const menu = useAlternar(false);
  const ajuda = useAlternar(false);

  return (
    <div>
      <button onClick={menu.alternar}>{menu.ligado ? 'Fechar Menu' : 'Abrir Menu'}</button>
      {menu.ligado && <p>Conteúdo do Menu</p>}
      <button onClick={ajuda.alternar}>{ajuda.ligado ? 'Fechar Ajuda' : 'Abrir Ajuda'}</button>
      {ajuda.ligado && <p>Conteúdo da Ajuda</p>}
    </div>
  );
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-10-lacuna-busca',
        type: 'fill-blank',
        prompt: 'Complete o hook de busca genérico: o parâmetro de tipo, o tipo dos dados lidos, e o que o hook devolve.',
        concepts: ['react-hooks'],
        difficulty: 'intermediario',
        tags: ['react', 'hooks', 'genericos'],
        template: `window.__servidor = { '/api/perfil': { nome: 'Ana' } };

type Tela<T> = { estado: 'carregando' } | { estado: 'erro' } | { estado: 'pronto'; dados: T };

function useBusca{{1}}(caminho: string) {
  const [tela, setTela] = React.useState<Tela<T>>({ estado: 'carregando' });

  React.useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        const r = await fetch(caminho);
        if (!r.ok) throw new Error('status ' + r.status);
        const dados: {{2}} = await r.json();
        if (ativo) setTela({ estado: 'pronto', dados });
      } catch {
        if (ativo) setTela({ estado: 'erro' });
      }
    }
    void carregar();
    return () => { ativo = false; };
  }, [caminho]);

  return {{3}};
}

function App() {
  const tela = useBusca<{ nome: string }>('/api/perfil');
  if (tela.estado === 'carregando') return <p>Carregando…</p>;
  if (tela.estado === 'erro') return <p role="alert">Erro</p>;
  return <h2>{tela.dados.nome}</h2>;
}`,
        blanks: [
          { placeholder: 'genérico', size: 3 },
          { placeholder: 'tipo', size: 1 },
          { placeholder: 'valor', size: 4 },
        ],
        tests: [
          {
            description: 'o hook busca e o App mostra o nome',
            assertion: `if (texto('p') !== 'Carregando…') throw new Error('Antes da resposta esperava "Carregando…".'); await esperar(150); if (texto('h2') !== 'Ana') throw new Error('Esperava <h2>Ana</h2>, veio ' + JSON.stringify(texto('h2')));`,
          },
        ],
        hints: [
          'O parâmetro de tipo vai entre sinais de menor e maior logo depois do nome do hook, com o mesmo nome de uma letra que a `Tela` usa.',
          'Os dados lidos são desse tipo; e o componente estreita pelo `estado`, então o hook devolve o objeto que tem esse campo.',
        ],
        solution: ['<T>', 'T', 'tela'],
        explanation:
          '`useBusca<T>` é genérico como qualquer função: `T` é decidido por quem chama (`useBusca<{ nome: string }>`), e é o tipo de `dados` no `pronto`. O hook devolve `tela`, e o componente estreita pelo `estado` — `tela.dados.nome` só compila dentro do `pronto`. Um hook, qualquer tipo de dado.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-10-bug-tupla',
        type: 'find-bug',
        prompt:
          "O compilador recusa: `Type 'number | (() => void)' is not assignable to type '(evento: MouseEvent<any>) => void'`. Aponte a linha que precisa mudar.",
        concepts: ['react-hooks'],
        difficulty: 'intermediario',
        tags: ['react', 'hooks', 'depuracao'],
        code: `function useContador(inicial: number) {
  const [valor, setValor] = React.useState(inicial);
  const mais = () => setValor((v) => v + 1);
  return [valor, mais];
}

function App() {
  const [valor, mais] = useContador(0);
  return <button onClick={mais}>Cliques: {valor}</button>;
}`,
        buggyLine: 4,
        fix: '  return [valor, mais] as const;',
        symptomLine: 9,
        symptomFeedback:
          'É onde o erro aparece: `mais` chegando ao `onClick` como "número ou função". Mas o componente está certo — o problema é o que o hook declarou devolver, três linhas acima.',
        explanation:
          '`[valor, mais]` sem anotação é deduzido como `(number | (() => void))[]`: uma lista em que **qualquer** posição pode ser número ou função. Ao desestruturar, `mais` vira `number | (() => void)`, e o `onClick` recusa. `as const` transforma a expressão numa tupla somente leitura — a primeira posição é `number`, a segunda é a função —, e é assim que o próprio `useState` é tipado. Anotar o retorno (`: [number, () => void]`) resolve igual. Ou devolva um objeto com nomes, que nunca tem esse problema.',
        hints: [
          'O erro aparece no `onClick`, mas de onde vem o tipo de `mais`? Olhe o que o hook devolve.',
          'Uma lista com dois tipos misturados não é o mesmo que "número na primeira posição, função na segunda". Há duas formas de dizer isso ao compilador.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-10-quando',
        type: 'multiple-choice',
        prompt: 'Qual destas situações pede um hook próprio?',
        concepts: ['react-hooks'],
        difficulty: 'iniciante',
        tags: ['react', 'hooks'],
        options: [
          'Um componente com um único `useState` para o texto de um campo',
          'Três componentes que repetem o mesmo estado de "largura da janela" com o mesmo efeito de `resize` e a mesma limpeza',
          'Uma função que formata uma data para exibir',
          'Um componente que precisa compartilhar o usuário logado com a árvore inteira',
        ],
        correctIndex: 1,
        explanation:
          'Estado + efeito + limpeza repetidos em três lugares é a definição do que se extrai: `useLarguraDaJanela()`. Um `useState` sozinho é só o componente; formatar data é uma função comum (não usa hooks, não precisa do `use`); compartilhar estado com a árvore é contexto. O hook próprio extrai **lógica com hooks dentro** que se repete.',
        hints: ['Hook próprio = lógica repetida que usa hooks. Qual das quatro tem as duas coisas?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-10-armazenado',
        type: 'code',
        prompt:
          'Escreva o hook `useArmazenado(chave: string, inicial: string)`, que devolve `[valor, setValor]` como o `useState`, lê o valor inicial de `localStorage` (ou usa `inicial` se não houver) e grava a cada mudança. Em `App`, use-o para um campo de rótulo `Apelido` e mostre `Apelido: X` num `<p>`.',
        concepts: ['react-hooks'],
        difficulty: 'intermediario',
        tags: ['react', 'hooks', 'efeitos'],
        initialCode: `function App() {
  const [apelido, setApelido] = React.useState('');

  return (
    <div>
      <label>
        Apelido <input value={apelido} onChange={(e) => setApelido(e.target.value)} />
      </label>
      <p>Apelido: {apelido}</p>
    </div>
  );
}
`,
        tests: [
          {
            description: 'sem nada guardado, começa com o inicial',
            assertion: `if (texto('p') !== 'Apelido:') throw new Error('Com o armazenamento vazio esperava "Apelido:" (inicial vazio), veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: 'digitar grava no armazenamento',
            assertion: `await digitar(campo('Apelido'), 'aninha'); await esperar(); if (localStorage.getItem('apelido') !== 'aninha') throw new Error('Depois de digitar, localStorage deveria ter apelido = "aninha" (a chave é "apelido"), veio ' + JSON.stringify(localStorage.getItem('apelido')));`,
          },
          {
            description: 'ao montar de novo com algo guardado, o hook lê do armazenamento',
            assertion: `localStorage.setItem('apelido', 'bia'); window.__raiz.unmount(); await esperar(); const raiz = ReactDOM.createRoot(document.getElementById('root')); ReactDOM.flushSync(() => raiz.render(React.createElement(App))); window.__raiz = raiz; if (texto('p') !== 'Apelido: bia') throw new Error('Montando de novo com "bia" guardado, esperava "Apelido: bia", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: 'o App usa useArmazenado em vez de useState direto',
            assertion: `if (typeof window.useArmazenado !== 'function') throw new Error('Declare o hook com function useArmazenado(...).'); if (/useState/.test(String(window.App))) throw new Error('O App deveria usar useArmazenado, não useState direto.');`,
          },
        ],
        hints: [
          'No hook: `React.useState(() => localStorage.getItem(chave) ?? inicial)` — a função só roda na montagem. E um efeito `[chave, valor]` que faz `localStorage.setItem(chave, valor)`.',
          'Devolva `[valor, setValor]` com o tipo `[string, (v: string) => void]`. No `App`: `const [apelido, setApelido] = useArmazenado(\'apelido\', \'\')`.',
        ],
        solution: `function useArmazenado(chave: string, inicial: string): [string, (v: string) => void] {
  const [valor, setValor] = React.useState(() => localStorage.getItem(chave) ?? inicial);

  React.useEffect(() => {
    localStorage.setItem(chave, valor);
  }, [chave, valor]);

  return [valor, setValor];
}

function App() {
  const [apelido, setApelido] = useArmazenado('apelido', '');

  return (
    <div>
      <label>
        Apelido <input value={apelido} onChange={(e) => setApelido(e.target.value)} />
      </label>
      <p>Apelido: {apelido}</p>
    </div>
  );
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Um hook próprio é uma função \`useAlgo\` que chama hooks: o componente fica com a tela, o hook com o comportamento. Cada chamada tem o próprio estado — o hook compartilha lógica, não dados. Duas regras, pela ordem em que o React conta os hooks: só no topo, só em componentes e hooks. Extraia quando estado + efeito se repetem ou quando a tela sumiu no meio da lógica; devolva ações com nome.`,
    },
  ],
};

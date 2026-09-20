import type { Lesson } from '../types';

export const lessonContexto: Lesson = {
  id: 'lesson-react-9',
  trackId: 'track-react',
  title: 'Contexto: O Dado que Todo Mundo Precisa',
  language: 'react',
  objective:
    'Compartilhar um dado com uma subárvore inteira — tema, usuário logado, idioma — com createContext, Provider e useContext, e saber quando isso é a ferramenta certa e quando é exagero.',
  concepts: ['react-contexto'],
  status: 'published',
  estimatedMinutes: 26,
  blocks: [
    {
      kind: 'prose',
      markdown: `
A aula de composição terminou num problema: o tema da interface (claro ou escuro) é decidido no topo e usado num botão quatro níveis abaixo. Os três componentes do meio recebem \`tema\` só para repassar. Isso é **prop drilling**, e o remédio é o **contexto**: um dado que fica disponível para uma subárvore inteira, sem passar de mão em mão.

## Criar, prover, consumir

~~~tsx
type Tema = 'claro' | 'escuro';

const TemaContexto = React.createContext<Tema>('claro');

function App() {
  const [tema, setTema] = React.useState<Tema>('claro');
  return (
    <TemaContexto.Provider value={tema}>
      <Pagina />
      <button onClick={() => setTema(tema === 'claro' ? 'escuro' : 'claro')}>Alternar tema</button>
    </TemaContexto.Provider>
  );
}

function Pagina() { return <Cabecalho />; }          // não sabe do tema
function Cabecalho() { return <BotaoDeAcao />; }     // não sabe do tema

function BotaoDeAcao() {
  const tema = React.useContext(TemaContexto);       // lê direto
  return <button className={'botao ' + tema}>Salvar</button>;
}
~~~

Três peças. \`createContext(padrao)\` cria o canal — o valor padrão só vale quando não há \`Provider\` acima. \`<Provider value={…}>\` **entrega** um valor para tudo o que está dentro dele. \`useContext(canal)\` **lê** o valor mais próximo acima, de qualquer profundidade. \`Pagina\` e \`Cabecalho\` não tocam no tema.

E o contexto é reativo: quando o \`value\` do Provider muda, todo componente que fez \`useContext\` desse canal renderiza de novo. Alternar o tema no \`App\` redesenha o \`BotaoDeAcao\` lá embaixo.

## Valor e função juntos

Quase sempre quem lê também quer mudar. O valor do contexto pode ser um objeto com os dois:

~~~tsx
interface Sessao {
  usuario: { nome: string } | null;
  entrar: (nome: string) => void;
  sair: () => void;
}

const SessaoContexto = React.createContext<Sessao>({
  usuario: null,
  entrar: () => {},
  sair: () => {},
});
~~~

O \`App\` guarda o estado e provê \`{ usuario, entrar, sair }\`; qualquer tela faz \`const { usuario, sair } = useContext(SessaoContexto)\`. Continua sendo "dados descem, eventos sobem" — só que o canal é o contexto em vez das props.

## Um hook para não expor o canal

\`useContext(SessaoContexto)\` em vinte lugares repete o nome do canal. Um hook pequeno esconde isso e é o lugar para conferir o Provider:

~~~tsx
function useSessao() {
  return React.useContext(SessaoContexto);
}
~~~

É o padrão que a próxima aula generaliza.

## Quando usar — e quando não

Contexto é para o dado que **muitos componentes, em profundidades diferentes**, precisam, e que muda **pouco**: tema, usuário logado, idioma, configuração. Três sinais de que é exagero:

- Dois componentes precisam do dado, e são pai e filho: props.
- O dado muda a cada tecla (o texto de um campo): tudo o que consome renderiza a cada tecla.
- O componente do meio só precisava de um buraco para o conteúdo: \`children\` resolve sem contexto.

Contexto não é um "estado global" para tudo. É um atalho para o que é, de fato, de todos.

## Erros

- Esquecer o \`Provider\`: \`useContext\` devolve o padrão, em silêncio, e o botão de sair não faz nada.
- \`value={{ usuario, sair }}\` cria um objeto novo a cada renderização do \`App\` — e redesenha todos os consumidores. Em telas grandes isso pesa; a aula de re-render trata.
- Contexto para o estado de um formulário.
`.trim(),
    },
    {
      kind: 'example',
      language: 'tsx',
      code: `interface Sessao {
  usuario: string | null;
  entrar: (nome: string) => void;
  sair: () => void;
}

const SessaoContexto = React.createContext<Sessao>({ usuario: null, entrar: () => {}, sair: () => {} });

function useSessao() {
  return React.useContext(SessaoContexto);
}

function Cabecalho() {
  const { usuario, sair } = useSessao();
  return (
    <header>
      <span>{usuario ? 'Olá, ' + usuario : 'Visitante'}</span>
      {usuario && <button onClick={sair}>Sair</button>}
    </header>
  );
}

function Entrada() {
  const { usuario, entrar } = useSessao();
  if (usuario) return <p>Bem-vinda, {usuario}.</p>;
  return <button onClick={() => entrar('Ana')}>Entrar como Ana</button>;
}

function App() {
  const [usuario, setUsuario] = React.useState<string | null>(null);
  const sessao: Sessao = { usuario, entrar: setUsuario, sair: () => setUsuario(null) };

  return (
    <SessaoContexto.Provider value={sessao}>
      <Cabecalho />
      <main>
        <Entrada />
      </main>
    </SessaoContexto.Provider>
  );
}`,
      caption:
        'Um canal com valor e funções, um hook que o esconde, e dois consumidores em lugares diferentes da árvore que mudam juntos quando o `App` troca o estado. `Cabecalho` e `Entrada` não recebem prop nenhuma.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-9-tres-pecas',
        type: 'multiple-choice',
        prompt: 'O que `useContext(TemaContexto)` devolve num componente que **não** está dentro de nenhum `<TemaContexto.Provider>`?',
        concepts: ['react-contexto'],
        difficulty: 'iniciante',
        tags: ['react', 'contexto'],
        options: [
          'Lança um erro dizendo que falta o Provider',
          'O valor padrão passado a `createContext`, em silêncio — o que costuma esconder o esquecimento do Provider',
          '`undefined`, sempre',
          'O valor do último Provider que existiu na página',
        ],
        correctIndex: 1,
        explanation:
          'O padrão do `createContext` é exatamente para esse caso, e é o que torna o Provider esquecido um bug silencioso: o tema fica "claro" para sempre, o botão de sair chama uma função vazia. Um hook próprio (`useSessao`) é o lugar para trocar esse silêncio por um erro claro, quando fizer sentido.',
        hints: ['Para que serve o argumento de `createContext`?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-9-tema',
        type: 'code',
        prompt:
          'Escreva um contexto de tema. `App` guarda o tema (`claro` no início) e provê-o; um botão `Alternar tema` no `App` troca entre `claro` e `escuro`. `Painel` renderiza `Botao` sem receber prop nenhuma; `Botao` lê o tema pelo contexto e renderiza `<button class="botao TEMA">Salvar</button>`. Um `<p>` no `App` mostra `Tema: TEMA`.',
        concepts: ['react-contexto'],
        difficulty: 'intermediario',
        tags: ['react', 'contexto'],
        initialCode: `type Tema = 'claro' | 'escuro';

function Botao() {
  return <button className="botao claro">Salvar</button>;
}

function Painel() {
  return <Botao />;
}

function App() {
  return (
    <div>
      <p>Tema: claro</p>
      <Painel />
      <button>Alternar tema</button>
    </div>
  );
}
`,
        tests: [
          {
            description: 'começa no tema claro, no <p> e no botão Salvar',
            assertion: `if (texto('p') !== 'Tema: claro') throw new Error('Esperava "Tema: claro".'); if (!botao('Salvar').classList.contains('claro')) throw new Error('O botão Salvar deveria ter a classe claro.');`,
          },
          {
            description: 'alternar muda o <p> e o botão Salvar lá embaixo, pelo contexto',
            assertion: `await clicar(botao('Alternar tema')); if (texto('p') !== 'Tema: escuro') throw new Error('Depois de alternar esperava "Tema: escuro", veio ' + JSON.stringify(texto('p'))); const b = botao('Salvar'); if (!b.classList.contains('escuro') || b.classList.contains('claro')) throw new Error('O botão Salvar deveria ter a classe escuro (e não claro) — ele lê o tema pelo contexto.');`,
          },
          {
            description: 'Painel não recebe o tema por prop',
            assertion: `if (typeof window.Painel !== 'function') throw new Error('Declare Painel com function.'); if (/tema/i.test(String(window.Painel))) throw new Error('Painel não deveria saber do tema — nem receber, nem repassar. É o Botao que lê o contexto.');`,
          },
        ],
        hints: [
          '`const TemaContexto = React.createContext<Tema>(\'claro\')` fora dos componentes. No `App`: `const [tema, setTema] = React.useState<Tema>(\'claro\')` e tudo dentro de `<TemaContexto.Provider value={tema}>`.',
          'No `Botao`: `const tema = React.useContext(TemaContexto)` e `className={\'botao \' + tema}`. O `Painel` fica como está.',
        ],
        solution: `type Tema = 'claro' | 'escuro';

const TemaContexto = React.createContext<Tema>('claro');

function Botao() {
  const tema = React.useContext(TemaContexto);
  return <button className={'botao ' + tema}>Salvar</button>;
}

function Painel() {
  return <Botao />;
}

function App() {
  const [tema, setTema] = React.useState<Tema>('claro');
  return (
    <TemaContexto.Provider value={tema}>
      <div>
        <p>Tema: {tema}</p>
        <Painel />
        <button onClick={() => setTema(tema === 'claro' ? 'escuro' : 'claro')}>Alternar tema</button>
      </div>
    </TemaContexto.Provider>
  );
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-9-lacuna-sessao',
        type: 'fill-blank',
        prompt: 'Complete o contexto de sessão: a criação do canal com o padrão, a leitura no consumidor, e o valor entregue pelo Provider.',
        concepts: ['react-contexto'],
        difficulty: 'intermediario',
        tags: ['react', 'contexto'],
        template: `interface Sessao {
  usuario: string | null;
  sair: () => void;
}

const SessaoContexto = React.{{1}}<Sessao>({ usuario: null, sair: () => {} });

function Cabecalho() {
  const { usuario, sair } = React.{{2}}(SessaoContexto);
  return (
    <header>
      <span>{usuario ?? 'Visitante'}</span>
      {usuario && <button onClick={sair}>Sair</button>}
    </header>
  );
}

function App() {
  const [usuario, setUsuario] = React.useState<string | null>('Ana');
  return (
    <SessaoContexto.Provider value={{ {{3}} }}>
      <Cabecalho />
    </SessaoContexto.Provider>
  );
}`,
        blanks: [
          { placeholder: 'função', size: 13 },
          { placeholder: 'hook', size: 10 },
          { placeholder: 'valor', size: 40 },
        ],
        tests: [
          {
            description: 'o cabeçalho mostra Ana e o botão Sair',
            assertion: `if (texto('span') !== 'Ana') throw new Error('Esperava "Ana" no cabeçalho, veio ' + JSON.stringify(texto('span'))); botao('Sair');`,
          },
          {
            description: 'Sair chega ao estado do App e o cabeçalho vira Visitante',
            assertion: `await clicar(botao('Sair')); if (texto('span') !== 'Visitante') throw new Error('Depois de Sair esperava "Visitante", veio ' + JSON.stringify(texto('span')) + '. O sair do Provider precisa mudar o estado do App.'); if (document.querySelector('button')) throw new Error('Sem usuário, o botão Sair some.');`,
          },
        ],
        hints: [
          'As duas funções do React que criam e leem um canal.',
          'O valor é um objeto com a forma de `Sessao`: o usuário do estado e uma função que o zera.',
        ],
        solution: ['createContext', 'useContext', 'usuario, sair: () => setUsuario(null)'],
        explanation:
          '`createContext` cria o canal com o padrão (só usado sem Provider); `useContext` lê o valor mais próximo acima. O `value` do Provider é um objeto que cumpre `Sessao`: o `usuario` do estado e um `sair` que chama o setter do `App`. É por isso que clicar em Sair, dentro do `Cabecalho`, muda o estado que mora no `App`.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-9-bug-provider',
        type: 'find-bug',
        prompt:
          'O compilador recusa: `Type \'string\' is not assignable to type \'Tema\'`. Aponte a linha que precisa mudar.',
        concepts: ['react-contexto'],
        difficulty: 'iniciante',
        tags: ['react', 'contexto', 'depuracao'],
        code: `type Tema = 'claro' | 'escuro';

const TemaContexto = React.createContext<Tema>('claro');

function Rodape() {
  const tema = React.useContext(TemaContexto);
  return <footer className={tema}>Feito com React</footer>;
}

function App() {
  const [tema, setTema] = React.useState('claro');
  return (
    <TemaContexto.Provider value={tema}>
      <Rodape />
      <button onClick={() => setTema('escuro')}>Escurecer</button>
    </TemaContexto.Provider>
  );
}`,
        buggyLine: 11,
        fix: "  const [tema, setTema] = React.useState<Tema>('claro');",
        symptomLine: 13,
        symptomFeedback:
          'É onde o erro aparece: o `value` do Provider recebendo um `string`. Mas o Provider está certo — o problema é o estado ter sido declarado largo demais, duas linhas acima.',
        explanation:
          '`useState(\'claro\')` deduz `string`, não `Tema` — a inferência guarda a categoria, e `string` inclui `\'azul\'`. O Provider exige `Tema`, e o compilador recusa na linha do `value`. A correção é na origem: `useState<Tema>(\'claro\')` estreita o estado para as duas opções, e de quebra `setTema(\'azul\')` passa a ser recusado. É a aula de inferência: `const` deduz o literal, `useState` com texto deduz `string`, e onde o tipo é uma união de literais é preciso dizer.',
        hints: [
          'O erro aparece no Provider, mas de onde vem o valor que ele recebe? Que tipo o compilador deduziu para ele?',
          '`useState` aceita um parâmetro de tipo.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-9-quando',
        type: 'multiple-choice',
        prompt: 'Em qual destes casos o contexto é a ferramenta certa?',
        concepts: ['react-contexto'],
        difficulty: 'intermediario',
        tags: ['react', 'contexto'],
        options: [
          'O texto de um campo de busca, lido pela lista logo abaixo dele',
          'O usuário logado, mostrado no cabeçalho, no rodapé e numa tela quatro níveis abaixo, e que muda ao entrar e ao sair',
          'O valor de um contador que dois botões irmãos alteram',
          'Uma lista de itens que o componente pai passa para o filho direto',
        ],
        correctIndex: 1,
        explanation:
          'Contexto é para o dado de muitos, em profundidades diferentes, que muda pouco — o usuário logado é o exemplo clássico. O campo de busca muda a cada tecla e tem um consumidor: props. O contador e a lista são pai e filhos diretos: props. Usar contexto neles troca uma prop explícita por um canal invisível, sem ganhar nada.',
        hints: ['Três perguntas: quantos consomem? a que distância? com que frequência muda?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-9-carrinho',
        type: 'code',
        prompt:
          'Escreva um contexto de carrinho com `itens` (lista de nomes) e `adicionar(nome)`. `App` guarda o estado e provê os dois. `Contador` (dentro de `Cabecalho`) mostra `Carrinho: N`. `Produto` recebe `nome` por prop e tem um botão `Adicionar` que chama `adicionar` do contexto. `App` renderiza `Cabecalho` e dois `Produto` (`Caderno` e `Caneta`). Nem `Cabecalho` nem `Produto` recebem o carrinho por prop.',
        concepts: ['react-contexto'],
        difficulty: 'avancado',
        tags: ['react', 'contexto', 'estado'],
        initialCode: `interface Carrinho {
  itens: string[];
  adicionar: (nome: string) => void;
}

function Produto({ nome }: { nome: string }) {
  return (
    <div>
      {nome} <button>Adicionar</button>
    </div>
  );
}

function App() {
  return (
    <div>
      <Produto nome="Caderno" />
      <Produto nome="Caneta" />
    </div>
  );
}
`,
        tests: [
          {
            description: 'começa com Carrinho: 0 no cabeçalho',
            assertion: `if (texto('header') !== 'Carrinho: 0') throw new Error('Esperava <header> com "Carrinho: 0", veio ' + JSON.stringify(texto('header')));`,
          },
          {
            description: 'adicionar o Caderno e a Caneta chega a Carrinho: 2',
            assertion: `const botoes = Array.from(document.querySelectorAll('button')).filter((b) => b.textContent.trim() === 'Adicionar'); if (botoes.length !== 2) throw new Error('Esperava dois botões Adicionar.'); await clicar(botoes[0]); await clicar(botoes[1]); if (texto('header') !== 'Carrinho: 2') throw new Error('Depois de dois Adicionar esperava "Carrinho: 2", veio ' + JSON.stringify(texto('header')));`,
          },
          {
            description: 'adicionar de novo conta de novo',
            assertion: `const botoes = Array.from(document.querySelectorAll('button')).filter((b) => b.textContent.trim() === 'Adicionar'); await clicar(botoes[0]); if (texto('header') !== 'Carrinho: 3') throw new Error('Esperava "Carrinho: 3".');`,
          },
          {
            description: 'Cabecalho e Produto não recebem o carrinho por prop',
            assertion: `if (typeof window.Cabecalho !== 'function' || typeof window.Produto !== 'function') throw new Error('Declare Cabecalho e Produto com function.'); if (!/useContext/.test(String(window.Produto))) throw new Error('Produto deveria pegar adicionar do contexto, com useContext — não por prop.'); if (/itens|adicionar/.test(String(window.Cabecalho))) throw new Error('Cabecalho não deveria saber do carrinho: ele só renderiza o Contador, que lê o contexto.');`,
          },
        ],
        hints: [
          '`const CarrinhoContexto = React.createContext<Carrinho>({ itens: [], adicionar: () => {} })`. No `App`, o estado `itens` e `adicionar = (nome) => setItens([...itens, nome])`, providos juntos.',
          '`Contador` faz `const { itens } = React.useContext(CarrinhoContexto)` e mostra `itens.length`; `Produto` pega `adicionar` do mesmo contexto. `Cabecalho` só renderiza `<header><Contador /></header>`.',
        ],
        solution: `interface Carrinho {
  itens: string[];
  adicionar: (nome: string) => void;
}

const CarrinhoContexto = React.createContext<Carrinho>({ itens: [], adicionar: () => {} });

function Contador() {
  const { itens } = React.useContext(CarrinhoContexto);
  return <span>Carrinho: {itens.length}</span>;
}

function Cabecalho() {
  return (
    <header>
      <Contador />
    </header>
  );
}

function Produto({ nome }: { nome: string }) {
  const { adicionar } = React.useContext(CarrinhoContexto);
  return (
    <div>
      {nome} <button onClick={() => adicionar(nome)}>Adicionar</button>
    </div>
  );
}

function App() {
  const [itens, setItens] = React.useState<string[]>([]);
  const carrinho: Carrinho = { itens, adicionar: (nome) => setItens([...itens, nome]) };

  return (
    <CarrinhoContexto.Provider value={carrinho}>
      <div>
        <Cabecalho />
        <Produto nome="Caderno" />
        <Produto nome="Caneta" />
      </div>
    </CarrinhoContexto.Provider>
  );
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Contexto é o canal para o dado que muitos componentes, em profundidades diferentes, precisam e que muda pouco: \`createContext\` cria (com um padrão que só vale sem Provider), \`<Provider value>\` entrega, \`useContext\` lê — e quando o valor muda, os consumidores redesenham. Valor e funções vão juntos no mesmo objeto; um hook pequeno esconde o canal. Pai e filho diretos, ou um dado que muda a cada tecla: props.`,
    },
  ],
};

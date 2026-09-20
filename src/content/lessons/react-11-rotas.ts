import type { Lesson } from '../types';

export const lessonRotas: Lesson = {
  id: 'lesson-react-11',
  trackId: 'track-react',
  title: 'Rotas: Uma Tela por Endereço',
  language: 'react',
  objective:
    'Trocar de tela sem recarregar — a rota como estado, links que não navegam, parâmetros no caminho, a tela de "não encontrado" — e entender o que um roteador de verdade acrescenta.',
  concepts: ['react-rotas'],
  status: 'published',
  estimatedMinutes: 27,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um aplicativo tem várias telas — início, produtos, um produto, sobre — e a pessoa espera que cada uma tenha um **endereço**: dá para voltar, dá para mandar o link. Numa página tradicional, cada endereço é um HTML novo do servidor. Num aplicativo React, o HTML é um só, e trocar de tela é **trocar o que o \`App\` renderiza**. O que decide qual tela é a **rota**.

## A rota é estado

~~~tsx
type Rota = '/' | '/produtos' | '/sobre';

function App() {
  const [rota, setRota] = React.useState<Rota>('/');

  return (
    <>
      <nav>
        <Link para="/" rota={rota} navegar={setRota}>Início</Link>
        <Link para="/produtos" rota={rota} navegar={setRota}>Produtos</Link>
        <Link para="/sobre" rota={rota} navegar={setRota}>Sobre</Link>
      </nav>
      <main>
        {rota === '/' && <Inicio />}
        {rota === '/produtos' && <Produtos />}
        {rota === '/sobre' && <Sobre />}
      </main>
    </>
  );
}
~~~

Isso é um roteador: um estado com o caminho atual e um \`if\` por tela. A união de literais \`Rota\` fecha o conjunto de caminhos válidos — \`setRota('/contato')\` é recusado pelo compilador, e é assim que um link para uma tela que não existe vira erro antes de rodar.

## O link que não recarrega

~~~tsx
function Link({ para, rota, navegar, children }: {
  para: Rota;
  rota: Rota;
  navegar: (r: Rota) => void;
  children: React.ReactNode;
}) {
  return (
    <a
      href={para}
      aria-current={rota === para ? 'page' : undefined}
      onClick={(e) => {
        e.preventDefault();   // sem isto o navegador carrega a URL e o estado morre
        navegar(para);
      }}
    >
      {children}
    </a>
  );
}
~~~

Continua sendo um \`<a href>\` — a aula de teclado explicou por quê: é o elemento que o Tab alcança, que o leitor de tela anuncia como link, que o botão direito abre em nova aba. O \`preventDefault\` impede a navegação de verdade, e o \`navegar\` troca o estado. \`aria-current="page"\` marca o link da tela atual — é o que o CSS estiliza e o leitor de tela anuncia.

## Parâmetros no caminho

\`/produtos/2\` não cabe numa união de literais. O caminho vira texto, e a tela lê o parâmetro dele:

~~~tsx
function App() {
  const [rota, setRota] = React.useState('/');

  if (rota.startsWith('/produtos/')) {
    const id = Number(rota.slice('/produtos/'.length));
    return <Produto id={id} voltar={() => setRota('/produtos')} />;
  }
  if (rota === '/produtos') return <Produtos abrir={(id) => setRota('/produtos/' + id)} />;
  if (rota === '/') return <Inicio />;
  return <NaoEncontrado voltar={() => setRota('/')} />;
}
~~~

O último \`return\` é a tela de **não encontrado** — a aula de estados da tela: todo caminho fora do mapa precisa de uma tela que diga isso e ofereça a volta. A ordem dos \`if\` importa: o mais específico (\`/produtos/2\`) antes do geral (\`/produtos\`).

## O que o roteador de verdade acrescenta

Neste sandbox a rota vive só no estado — a barra de endereço não muda. Num projeto real, uma biblioteca (React Router é a mais usada) faz exatamente o que você escreveu aqui, e mais: **sincroniza com a barra de endereço** (\`history.pushState\`, sem recarregar), faz o botão de voltar do navegador funcionar, lê parâmetros com \`useParams()\`, e aninha rotas (um layout com a barra lateral, e dentro dele as telas). Os conceitos são estes: a rota é estado, o link não recarrega, o parâmetro vem do caminho, e o desconhecido tem tela.

## Erros

- \`<a href>\` sem \`preventDefault\`: a página recarrega e o estado some.
- \`<span onClick>\` no lugar do link: sem teclado, sem leitor de tela.
- Caminho fora do mapa sem tela de não encontrado (tela em branco).
- \`if\` geral antes do específico: \`/produtos/2\` cai em \`/produtos\`.
`.trim(),
    },
    {
      kind: 'example',
      language: 'tsx',
      code: `type Rota = '/' | '/sobre' | '/contato';

interface LinkProps {
  para: Rota;
  rota: Rota;
  navegar: (r: Rota) => void;
  children: React.ReactNode;
}

function Link({ para, rota, navegar, children }: LinkProps) {
  return (
    <a
      href={para}
      aria-current={rota === para ? 'page' : undefined}
      onClick={(e) => {
        e.preventDefault();
        navegar(para);
      }}
    >
      {children}
    </a>
  );
}

function App() {
  const [rota, setRota] = React.useState<Rota>('/');

  return (
    <>
      <nav>
        <Link para="/" rota={rota} navegar={setRota}>Início</Link>
        <Link para="/sobre" rota={rota} navegar={setRota}>Sobre</Link>
        <Link para="/contato" rota={rota} navegar={setRota}>Contato</Link>
      </nav>
      <main>
        {rota === '/' && <h1>Bem-vinda</h1>}
        {rota === '/sobre' && <h1>Sobre nós</h1>}
        {rota === '/contato' && <h1>Fale conosco</h1>}
      </main>
    </>
  );
}`,
      caption:
        'Três telas, uma rota no estado, um `Link` que é `<a>` de verdade mas não recarrega, e `aria-current` no link da tela atual. `<Link para="/blog">` seria recusado pelo compilador: o caminho não está na união.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-11-link',
        type: 'multiple-choice',
        prompt: 'Por que o `Link` é um `<a href>` com `preventDefault`, e não um `<span onClick>` ou um `<a>` comum?',
        concepts: ['react-rotas'],
        difficulty: 'iniciante',
        tags: ['react', 'rotas', 'acessibilidade'],
        options: [
          'Porque `<span>` não aceita `onClick`',
          'O `<a href>` é o elemento que o teclado alcança, o leitor de tela anuncia como link e o botão direito abre em nova aba; o `preventDefault` só impede a recarga, que apagaria o estado',
          'Porque o React exige `<a>` para navegação',
          'Um `<a>` comum funcionaria igual; o `preventDefault` é opcional',
        ],
        correctIndex: 1,
        explanation:
          'O elemento certo dá a semântica de graça (Tab, Enter, leitor de tela, nova aba, "copiar endereço"); o `preventDefault` tira só o comportamento que não serve aqui — a navegação de verdade, que recarregaria a página e perderia todo o estado. `<span onClick>` teria o clique e nada mais.',
        hints: ['Lembre da aula de teclado: o que um `<a>` faz que um `<span>` não faz?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-11-roteador',
        type: 'code',
        prompt:
          'Escreva um roteador: `App` guarda a rota (`/` no início) e mostra um `<nav>` com três links — `Início` (`/`), `Produtos` (`/produtos`), `Sobre` (`/sobre`) — que trocam a tela sem recarregar; o link da tela atual tem `aria-current="page"`. As telas são `<h1>` com `Bem-vinda`, `Nossos produtos` e `Sobre nós`.',
        concepts: ['react-rotas'],
        difficulty: 'intermediario',
        tags: ['react', 'rotas'],
        initialCode: `type Rota = '/' | '/produtos' | '/sobre';

function App() {
  return (
    <div>
      <nav>
        <a href="/">Início</a>
        <a href="/produtos">Produtos</a>
        <a href="/sobre">Sobre</a>
      </nav>
      <main>
        <h1>Bem-vinda</h1>
      </main>
    </div>
  );
}
`,
        tests: [
          {
            description: 'começa no início, com o link Início marcado como atual',
            assertion: `if (texto('h1') !== 'Bem-vinda') throw new Error('Esperava <h1>Bem-vinda</h1>.'); const atual = document.querySelector('nav a[aria-current="page"]'); if (!atual || atual.textContent.trim() !== 'Início') throw new Error('O link Início deveria ter aria-current="page".');`,
          },
          {
            description: 'clicar em Produtos troca a tela e o link atual — sem recarregar',
            assertion: `const link = Array.from(document.querySelectorAll('nav a')).find((a) => a.textContent.trim() === 'Produtos'); await clicar(link); if (texto('h1') !== 'Nossos produtos') throw new Error('Depois de clicar em Produtos esperava <h1>Nossos produtos</h1>, veio ' + JSON.stringify(texto('h1'))); const atual = document.querySelector('nav a[aria-current="page"]'); if (!atual || atual.textContent.trim() !== 'Produtos') throw new Error('Agora o link Produtos deveria ser o atual.'); if (document.querySelectorAll('nav a[aria-current="page"]').length !== 1) throw new Error('Só um link é o atual.');`,
          },
          {
            description: 'Sobre e de volta ao Início',
            assertion: `const sobre = Array.from(document.querySelectorAll('nav a')).find((a) => a.textContent.trim() === 'Sobre'); await clicar(sobre); if (texto('h1') !== 'Sobre nós') throw new Error('Esperava <h1>Sobre nós</h1>.'); const inicio = Array.from(document.querySelectorAll('nav a')).find((a) => a.textContent.trim() === 'Início'); await clicar(inicio); if (texto('h1') !== 'Bem-vinda') throw new Error('De volta ao Início esperava <h1>Bem-vinda</h1>.');`,
          },
          {
            description: 'os links continuam sendo <a href>, com o caminho',
            assertion: `const hrefs = Array.from(document.querySelectorAll('nav a')).map((a) => a.getAttribute('href')); if (JSON.stringify(hrefs) !== JSON.stringify(['/', '/produtos', '/sobre'])) throw new Error('Os três links deveriam ser <a href> com /, /produtos e /sobre; veio ' + JSON.stringify(hrefs));`,
          },
        ],
        hints: [
          '`const [rota, setRota] = React.useState<Rota>(\'/\')`. Cada `<a>` ganha `onClick={(e) => { e.preventDefault(); setRota(\'/produtos\'); }}` e `aria-current={rota === \'/produtos\' ? \'page\' : undefined}`.',
          'Extraia um componente `Link` com `para`, `rota`, `navegar` e `children` para não repetir três vezes. As telas: `{rota === \'/\' && <h1>Bem-vinda</h1>}` etc.',
        ],
        solution: `type Rota = '/' | '/produtos' | '/sobre';

function Link({ para, rota, navegar, children }: { para: Rota; rota: Rota; navegar: (r: Rota) => void; children: React.ReactNode }) {
  return (
    <a
      href={para}
      aria-current={rota === para ? 'page' : undefined}
      onClick={(e) => {
        e.preventDefault();
        navegar(para);
      }}
    >
      {children}
    </a>
  );
}

function App() {
  const [rota, setRota] = React.useState<Rota>('/');

  return (
    <div>
      <nav>
        <Link para="/" rota={rota} navegar={setRota}>Início</Link>
        <Link para="/produtos" rota={rota} navegar={setRota}>Produtos</Link>
        <Link para="/sobre" rota={rota} navegar={setRota}>Sobre</Link>
      </nav>
      <main>
        {rota === '/' && <h1>Bem-vinda</h1>}
        {rota === '/produtos' && <h1>Nossos produtos</h1>}
        {rota === '/sobre' && <h1>Sobre nós</h1>}
      </main>
    </div>
  );
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-11-lacuna-parametro',
        type: 'fill-blank',
        prompt: 'Complete o roteador com parâmetro: a leitura do id a partir do caminho, e a tela de não encontrado no fim.',
        concepts: ['react-rotas'],
        difficulty: 'intermediario',
        tags: ['react', 'rotas'],
        template: `const PRODUTOS: Record<number, string> = { 1: 'Caderno', 2: 'Caneta' };

function App() {
  const [rota, setRota] = React.useState('/produtos/2');

  if (rota.startsWith('/produtos/')) {
    const id = Number(rota.{{1}}('/produtos/'.length));
    const nome = PRODUTOS[id];
    if (!nome) return <p>Produto não encontrado</p>;
    return (
      <div>
        <h1>{nome}</h1>
        <button onClick={() => setRota('/produtos')}>Voltar</button>
      </div>
    );
  }
  if (rota === '/produtos') {
    return (
      <ul>
        <li><button onClick={() => setRota('/produtos/1')}>Caderno</button></li>
        <li><button onClick={() => setRota('/produtos/9')}>Misterioso</button></li>
      </ul>
    );
  }
  {{2}} <p>{{3}}</p>;
}`,
        blanks: [
          { placeholder: 'método', size: 6 },
          { placeholder: 'palavra', size: 6 },
          { placeholder: 'texto', size: 22 },
        ],
        tests: [
          {
            description: 'começa em /produtos/2 e mostra a Caneta',
            assertion: `if (texto('h1') !== 'Caneta') throw new Error('Em /produtos/2 esperava <h1>Caneta</h1>, veio ' + JSON.stringify(texto('h1')));`,
          },
          {
            description: 'Voltar leva à lista, e o Caderno abre o produto 1',
            assertion: `await clicar(botao('Voltar')); if (document.querySelectorAll('li').length !== 2) throw new Error('Esperava a lista com 2 itens.'); await clicar(botao('Caderno')); if (texto('h1') !== 'Caderno') throw new Error('Esperava <h1>Caderno</h1>.');`,
          },
          {
            description: 'um id que não existe cai na tela de produto não encontrado',
            assertion: `await clicar(botao('Voltar')); await clicar(botao('Misterioso')); if (texto('p') !== 'Produto não encontrado') throw new Error('Com /produtos/9 esperava "Produto não encontrado", veio ' + JSON.stringify(texto('p')));`,
          },
        ],
        hints: [
          'O método de texto que devolve o pedaço a partir de uma posição.',
          'O último caminho é o que sobra quando nenhum `if` casou: a função devolve a tela de não encontrado — a palavra que devolve, e uma frase que diga isso.',
        ],
        solution: ['slice', 'return', 'Página não encontrada'],
        explanation:
          '`rota.slice(\'/produtos/\'.length)` pega o que vem depois do prefixo — o parâmetro. O `if` mais específico vem antes do geral, senão `/produtos/2` cairia em `/produtos`. E o `return` final é a tela de não encontrado: sem ele o componente devolveria `undefined` para qualquer caminho fora do mapa, e o compilador recusaria — um componente sempre devolve algo.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-11-bug-rota',
        type: 'find-bug',
        prompt:
          "O compilador recusa: `Type '\"/sobr\"' is not assignable to type 'Rota'`. Aponte a linha que precisa mudar.",
        concepts: ['react-rotas'],
        difficulty: 'iniciante',
        tags: ['react', 'rotas', 'depuracao'],
        code: `type Rota = '/' | '/sobre';

function Link({ para, navegar, children }: { para: Rota; navegar: (r: Rota) => void; children: React.ReactNode }) {
  return <a href={para} onClick={(e) => { e.preventDefault(); navegar(para); }}>{children}</a>;
}

function App() {
  const [rota, setRota] = React.useState<Rota>('/');
  return (
    <div>
      <nav>
        <Link para="/" navegar={setRota}>Início</Link>
        <Link para="/sobr" navegar={setRota}>Sobre</Link>
      </nav>
      {rota === '/' ? <h1>Início</h1> : <h1>Sobre</h1>}
    </div>
  );
}`,
        buggyLine: 13,
        fix: '        <Link para="/sobre" navegar={setRota}>Sobre</Link>',
        explanation:
          '`Rota` é uma união de literais: só `\'/\'` e `\'/sobre\'` existem. `\'/sobr\'` é um erro de digitação que, com a rota tipada como `string`, viraria um link que leva para uma tela em branco — e ninguém saberia até alguém clicar. Com a união, o compilador aponta a linha antes de rodar. É o motivo de fechar o conjunto de caminhos num tipo: todo link é conferido contra o mapa.',
        hints: [
          'Compare cada `para` com os caminhos que `Rota` permite, letra por letra.',
          'O compilador diz qual texto não cabe em `Rota`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-11-ordem',
        type: 'multiple-choice',
        prompt: 'O roteador tem `if (rota.startsWith(\'/produtos\'))` antes de `if (rota.startsWith(\'/produtos/\'))`. O que acontece com `/produtos/2`?',
        concepts: ['react-rotas'],
        difficulty: 'intermediario',
        tags: ['react', 'rotas'],
        options: [
          'Abre o produto 2, porque o segundo `if` é mais específico',
          'Cai no primeiro `if` — `/produtos/2` também começa com `/produtos` — e mostra a lista em vez do produto; o específico precisa vir antes do geral',
          'Dá erro de compilação',
          'Mostra as duas telas',
        ],
        correctIndex: 1,
        explanation:
          'Os `if` são testados na ordem, e o primeiro que casa ganha. `/produtos/2` começa com `/produtos`, então a lista aparece e o segundo `if` nunca roda. Regra de todo roteador, com biblioteca ou sem: da rota mais específica para a mais geral, e o "não encontrado" por último.',
        hints: ['`"/produtos/2".startsWith("/produtos")` é verdadeiro ou falso?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-11-produtos',
        type: 'code',
        prompt:
          'Escreva `App` com três caminhos: `/` mostra `<h1>Loja</h1>` e um link `Ver produtos`; `/produtos` mostra os produtos em `<li>` com um link `Detalhes` para `/produtos/ID` em cada um; `/produtos/ID` mostra `<h1>NOME</h1>`, `<p>R$ PRECO</p>` e um link `Voltar` para `/produtos`. Qualquer outro caminho mostra `<p>Página não encontrada</p>` com um link `Início`. Os links são `<a href>` que não recarregam. `App` aceita uma prop opcional `rotaInicial` (padrão `/`) — o teste a usa para começar num caminho inexistente.',
        concepts: ['react-rotas'],
        difficulty: 'avancado',
        tags: ['react', 'rotas'],
        initialCode: `interface Produto {
  id: number;
  nome: string;
  preco: number;
}

const PRODUTOS: Produto[] = [
  { id: 1, nome: 'Caderno', preco: 20 },
  { id: 2, nome: 'Caneta', preco: 3.5 },
];

function App() {
  return <h1>Loja</h1>;
}
`,
        tests: [
          {
            description: 'começa na Loja com o link Ver produtos',
            assertion: `if (texto('h1') !== 'Loja') throw new Error('Esperava <h1>Loja</h1>.'); const link = Array.from(document.querySelectorAll('a')).find((a) => a.textContent.trim() === 'Ver produtos'); if (!link || link.getAttribute('href') !== '/produtos') throw new Error('Esperava um <a href="/produtos">Ver produtos</a>.');`,
          },
          {
            description: 'Ver produtos lista os dois, cada um com o link Detalhes para /produtos/ID',
            assertion: `await clicar(Array.from(document.querySelectorAll('a')).find((a) => a.textContent.trim() === 'Ver produtos')); if (document.querySelectorAll('li').length !== 2) throw new Error('Esperava 2 <li>.'); const hrefs = Array.from(document.querySelectorAll('li a')).map((a) => a.getAttribute('href')); if (JSON.stringify(hrefs) !== JSON.stringify(['/produtos/1', '/produtos/2'])) throw new Error('Esperava links Detalhes para /produtos/1 e /produtos/2, veio ' + JSON.stringify(hrefs));`,
          },
          {
            description: 'Detalhes da Caneta mostra nome, preço e Voltar',
            assertion: `await clicar(document.querySelector('li a[href="/produtos/2"]')); if (texto('h1') !== 'Caneta') throw new Error('Esperava <h1>Caneta</h1>, veio ' + JSON.stringify(texto('h1'))); if (!/3[.,]50?/.test(texto('p') || '')) throw new Error('Esperava o preço 3.50 no <p>, veio ' + JSON.stringify(texto('p'))); const voltar = Array.from(document.querySelectorAll('a')).find((a) => a.textContent.trim() === 'Voltar'); if (!voltar) throw new Error('Falta o link Voltar.'); await clicar(voltar); if (document.querySelectorAll('li').length !== 2) throw new Error('Voltar deveria mostrar a lista de novo.');`,
          },
          {
            description: 'um caminho fora do mapa mostra a tela de não encontrado com o link Início',
            assertion: `if (typeof window.App !== 'function') throw new Error('Declare App com function.'); window.__raiz.unmount(); await esperar(); const raiz = ReactDOM.createRoot(document.getElementById('root')); ReactDOM.flushSync(() => raiz.render(React.createElement(App, { rotaInicial: '/nada' }))); window.__raiz = raiz; if (texto('p') !== 'Página não encontrada') throw new Error('Com a rota inicial /nada esperava "Página não encontrada" (App aceita a prop opcional rotaInicial), veio ' + JSON.stringify(texto('p'))); const inicio = Array.from(document.querySelectorAll('a')).find((a) => a.textContent.trim() === 'Início'); if (!inicio) throw new Error('Falta o link Início na tela de não encontrado.'); await clicar(inicio); if (texto('h1') !== 'Loja') throw new Error('Início deveria levar à Loja.');`,
          },
        ],
        hints: [
          '`function App({ rotaInicial = \'/\' }: { rotaInicial?: string })` e `const [rota, setRota] = React.useState(rotaInicial)`. Um `Link` fora do `App`, com `para` (texto), `navegar` e `children`, que faz `preventDefault` e chama `navegar(para)`.',
          'Na ordem: `if (rota.startsWith(\'/produtos/\'))` (acha o produto pelo id; se não achar, cai no não encontrado), depois `if (rota === \'/produtos\')`, depois `if (rota === \'/\')`, e por fim o `return` de não encontrado.',
        ],
        solution: `interface Produto {
  id: number;
  nome: string;
  preco: number;
}

const PRODUTOS: Produto[] = [
  { id: 1, nome: 'Caderno', preco: 20 },
  { id: 2, nome: 'Caneta', preco: 3.5 },
];

function Link({ para, navegar, children }: { para: string; navegar: (r: string) => void; children: React.ReactNode }) {
  return (
    <a href={para} onClick={(e) => { e.preventDefault(); navegar(para); }}>
      {children}
    </a>
  );
}

function App({ rotaInicial = '/' }: { rotaInicial?: string }) {
  const [rota, setRota] = React.useState(rotaInicial);

  if (rota.startsWith('/produtos/')) {
    const id = Number(rota.slice('/produtos/'.length));
    const produto = PRODUTOS.find((p) => p.id === id);
    if (produto) {
      return (
        <div>
          <h1>{produto.nome}</h1>
          <p>R$ {produto.preco.toFixed(2)}</p>
          <Link para="/produtos" navegar={setRota}>Voltar</Link>
        </div>
      );
    }
  }

  if (rota === '/produtos') {
    return (
      <ul>
        {PRODUTOS.map((p) => (
          <li key={p.id}>
            {p.nome} <Link para={'/produtos/' + p.id} navegar={setRota}>Detalhes</Link>
          </li>
        ))}
      </ul>
    );
  }

  if (rota === '/') {
    return (
      <div>
        <h1>Loja</h1>
        <Link para="/produtos" navegar={setRota}>Ver produtos</Link>
      </div>
    );
  }

  return (
    <div>
      <p>Página não encontrada</p>
      <Link para="/" navegar={setRota}>Início</Link>
    </div>
  );
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `A rota é estado, e cada tela é um \`if\`; uma união de literais fecha o mapa e o compilador confere cada link. O link é um \`<a href>\` com \`preventDefault\` — semântica de graça, sem recarga — e \`aria-current="page"\` no atual. Parâmetros vêm do caminho como texto; o específico antes do geral; o desconhecido tem tela e saída. Um roteador de verdade acrescenta a barra de endereço, o voltar e as rotas aninhadas — os conceitos são estes.`,
    },
  ],
};

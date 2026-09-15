import type { Lesson } from '../types';

export const lessonBuscarDados: Lesson = {
  id: 'lesson-react-6',
  trackId: 'track-react',
  title: 'Buscar Dados: Os Três Estados e a Resposta Atrasada',
  language: 'react',
  objective:
    'Buscar dados num efeito, modelar a tela como carregando, erro ou pronto, refazer a busca quando o parâmetro muda, e ignorar a resposta que chegou tarde.',
  concepts: ['react-dados'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Quase todo componente que importa mostra dados que vêm de fora. Buscar é efeito — é o mundo fora do React —, e a aula anterior deixou uma pendência: a função do efeito não pode ser \`async\`. Esta aula resolve isso e o resto: o que a tela mostra enquanto espera, o que mostra quando falha, e o que fazer com a resposta que chega depois de ninguém mais querer.

## A forma

~~~tsx
interface Usuario { id: number; nome: string }

type Tela =
  | { estado: 'carregando' }
  | { estado: 'erro'; mensagem: string }
  | { estado: 'pronto'; usuarios: Usuario[] };

function App() {
  const [tela, setTela] = React.useState<Tela>({ estado: 'carregando' });

  React.useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const r = await fetch('/api/usuarios');
        if (!r.ok) throw new Error('O servidor respondeu ' + r.status);
        const usuarios: Usuario[] = await r.json();
        if (ativo) setTela({ estado: 'pronto', usuarios });
      } catch (e) {
        if (ativo) setTela({ estado: 'erro', mensagem: 'Não foi possível carregar.' });
      }
    }

    void carregar();
    return () => { ativo = false; };
  }, []);

  if (tela.estado === 'carregando') return <p>Carregando…</p>;
  if (tela.estado === 'erro') return <p role="alert">{tela.mensagem}</p>;
  return <ul>{tela.usuarios.map((u) => <li key={u.id}>{u.nome}</li>)}</ul>;
}
~~~

Quatro decisões aqui, cada uma com motivo.

**A função assíncrona vive dentro do efeito.** \`useEffect(async () => …)\` é recusado: um efeito devolve a limpeza ou nada, e uma função \`async\` devolve uma promessa. Então a função é declarada dentro e chamada — \`void carregar()\` diz ao compilador que você não vai esperar o resultado ali.

**Um estado só, com três formas.** É a união discriminada da trilha de TypeScript e a aula de estados da tela juntas: \`carregando\`, \`erro\` e \`pronto\` não podem coexistir, e um objeto com três booleanos (\`carregando\`, \`erro\`, \`dados\`) deixaria coexistir. Com a união, \`tela.usuarios\` só existe depois de \`tela.estado === 'pronto'\` — o compilador cobra.

**\`ok\` é conferido.** \`fetch\` não lança em 404 nem em 500; só em falha de rede. \`if (!r.ok) throw\` é o que transforma um servidor com problema num erro que o \`catch\` vê — a aula de buscar da trilha da página, agora com o tipo garantindo a tela.

**A resposta que chegou tarde é ignorada.** \`ativo\` começa \`true\`; a limpeza o torna \`false\`. Se o componente saiu da tela (ou o efeito vai rodar de novo) antes de a resposta chegar, o \`setTela\` não acontece. Sem isso, o React avisa de uma atualização num componente desmontado — e, pior, no caso seguinte, mostra dado errado.

## Quando o parâmetro muda

~~~tsx
React.useEffect(() => {
  let ativo = true;
  setTela({ estado: 'carregando' });
  async function carregar() { const r = await fetch('/api/usuarios/' + id); … }
  void carregar();
  return () => { ativo = false; };
}, [id]);
~~~

\`[id]\` na lista: mudou o id, nova busca — e a limpeza da busca anterior roda antes, desativando-a. É aqui que o \`ativo\` deixa de ser cautela e vira necessidade: a pessoa escolhe o usuário 1, muda para o 2, e a resposta do 1 chega **depois** da do 2. Sem o \`ativo\`, a tela mostraria o 1 com o 2 selecionado. Com ele, a resposta atrasada é descartada.

Repare no \`setTela({ estado: 'carregando' })\` no começo: ao trocar o parâmetro, a tela volta a "carregando" em vez de mostrar o dado antigo como se fosse o novo.

## Tentar de novo

O estado de erro precisa de saída — a aula de estados da tela foi clara. Um botão "Tentar de novo" que dispara a busca outra vez: ou chamando a mesma função (extraída para fora do efeito), ou mudando um estado do qual o efeito depende (\`const [tentativa, setTentativa] = useState(0)\` na lista, e o botão faz \`setTentativa(t => t + 1)\`).

## O servidor destes exercícios

Como na trilha da página: não há rede, e o \`fetch\` responde com o que o código declarou em \`window.__servidor\` — um caminho, um dado; caminho desconhecido é 404. O código do componente é o mesmo que você escreveria para um servidor de verdade.

## Erros

- \`async\` direto no \`useEffect\`.
- Não conferir \`r.ok\`: o 404 vira "pronto" com um objeto de erro dentro.
- Três booleanos em vez de uma união: telas impossíveis (carregando e erro ao mesmo tempo).
- Esquecer o \`ativo\`: resposta atrasada sobrescreve a atual.
- Estado de erro sem botão de tentar de novo.
`.trim(),
    },
    {
      kind: 'example',
      language: 'tsx',
      code: `window.__servidor = {
  '/api/produtos': [
    { id: 1, nome: 'Caderno', preco: 20 },
    { id: 2, nome: 'Caneta', preco: 3.5 },
  ],
};

interface Produto { id: number; nome: string; preco: number }

type Tela =
  | { estado: 'carregando' }
  | { estado: 'erro' }
  | { estado: 'pronto'; produtos: Produto[] };

function App() {
  const [tela, setTela] = React.useState<Tela>({ estado: 'carregando' });
  const [tentativa, setTentativa] = React.useState(0);

  React.useEffect(() => {
    let ativo = true;
    setTela({ estado: 'carregando' });

    async function carregar() {
      try {
        const r = await fetch('/api/produtos');
        if (!r.ok) throw new Error('status ' + r.status);
        const produtos: Produto[] = await r.json();
        if (ativo) setTela({ estado: 'pronto', produtos });
      } catch {
        if (ativo) setTela({ estado: 'erro' });
      }
    }

    void carregar();
    return () => { ativo = false; };
  }, [tentativa]);

  if (tela.estado === 'carregando') return <p>Carregando…</p>;
  if (tela.estado === 'erro') {
    return (
      <div>
        <p role="alert">Não foi possível carregar os produtos.</p>
        <button onClick={() => setTentativa((t) => t + 1)}>Tentar de novo</button>
      </div>
    );
  }
  return (
    <ul>
      {tela.produtos.map((p) => (
        <li key={p.id}>{p.nome} — R$ {p.preco.toFixed(2)}</li>
      ))}
    </ul>
  );
}`,
      caption:
        'A união de três estados, a busca dentro do efeito com `ativo`, o `ok` conferido, e "Tentar de novo" implementado como um contador na lista de dependências: cada tentativa roda o efeito de novo, com a limpeza da anterior antes.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-6-async',
        type: 'multiple-choice',
        prompt: 'Por que `React.useEffect(async () => { … }, [])` é recusado?',
        concepts: ['react-dados'],
        difficulty: 'iniciante',
        tags: ['react', 'efeitos', 'async'],
        options: [
          'Porque efeitos não podem usar `await`',
          'Porque a função de um efeito devolve a limpeza ou nada, e uma função `async` sempre devolve uma promessa — o React não saberia o que fazer com ela',
          'Porque `fetch` só funciona fora de efeitos',
          'Não é recusado; é só um aviso de estilo',
        ],
        correctIndex: 1,
        explanation:
          'O valor devolvido por um efeito tem um significado: é a função de limpeza. Uma função `async` devolve `Promise<void>`, que não é uma função — o compilador recusa, e o React ignoraria a promessa e nunca teria a limpeza. O padrão é declarar a função assíncrona **dentro** do efeito e chamá-la: `void carregar()`. O `await` fica lá dentro, onde pode.',
        hints: ['O que uma função `async` devolve, sempre? E o que o React espera receber de volta de um efeito?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-6-lista',
        type: 'code',
        prompt:
          'Escreva `App` que busca `/api/usuarios` ao montar e mostra: `<p>Carregando…</p>` enquanto espera; a lista de nomes em `<li>` quando chega; e, se a resposta não for `ok`, um `<p role="alert">Não foi possível carregar.</p>` com um botão `Tentar de novo` que busca outra vez. Um botão `Recarregar` fica visível quando a lista está na tela.',
        concepts: ['react-dados'],
        difficulty: 'intermediario',
        tags: ['react', 'dados', 'efeitos'],
        initialCode: `window.__servidor = {
  '/api/usuarios': [
    { id: 1, nome: 'Ana' },
    { id: 2, nome: 'Bruno' },
    { id: 3, nome: 'Carla' },
  ],
};

interface Usuario {
  id: number;
  nome: string;
}

function App() {
  return <p>Carregando…</p>;
}
`,
        tests: [
          {
            description: 'começa mostrando Carregando…',
            assertion: `if (texto('p') !== 'Carregando…') throw new Error('Antes de a resposta chegar esperava "Carregando…", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: 'os três nomes aparecem quando a resposta chega',
            assertion: `await esperar(150); const t = textos('li'); if (JSON.stringify(t) !== JSON.stringify(['Ana', 'Bruno', 'Carla'])) throw new Error('Esperava Ana, Bruno e Carla em <li>, veio ' + JSON.stringify(t)); if (document.querySelector('p') && texto('p') === 'Carregando…') throw new Error('O "Carregando…" deveria sumir quando a lista chega.');`,
          },
          {
            description: 'com o servidor fora do ar, Recarregar mostra o erro e o botão de tentar de novo',
            assertion: `delete window.__servidor['/api/usuarios']; await clicar(botao('Recarregar')); await esperar(150); const alerta = document.querySelector('[role="alert"]'); if (!alerta || alerta.textContent.trim() !== 'Não foi possível carregar.') throw new Error('Com 404 esperava <p role="alert">Não foi possível carregar.</p>. Confira resposta.ok.'); botao('Tentar de novo');`,
          },
          {
            description: 'com o servidor de volta, Tentar de novo traz a lista',
            assertion: `window.__servidor['/api/usuarios'] = [{ id: 9, nome: 'Dani' }]; await clicar(botao('Tentar de novo')); await esperar(150); const t = textos('li'); if (JSON.stringify(t) !== '["Dani"]') throw new Error('Depois de tentar de novo esperava a lista nova (Dani), veio ' + JSON.stringify(t));`,
          },
        ],
        hints: [
          'Um estado `tela` com três formas (`carregando`, `erro`, `pronto`) e um contador `tentativa` na lista de dependências do efeito; Recarregar e Tentar de novo fazem `setTentativa((t) => t + 1)`.',
          'No efeito: `setTela({ estado: \'carregando\' })`, uma função `async carregar()` com `try`, `if (!r.ok) throw`, e `setTela` só `if (ativo)`. A limpeza põe `ativo = false`.',
        ],
        solution: `window.__servidor = {
  '/api/usuarios': [
    { id: 1, nome: 'Ana' },
    { id: 2, nome: 'Bruno' },
    { id: 3, nome: 'Carla' },
  ],
};

interface Usuario {
  id: number;
  nome: string;
}

type Tela =
  | { estado: 'carregando' }
  | { estado: 'erro' }
  | { estado: 'pronto'; usuarios: Usuario[] };

function App() {
  const [tela, setTela] = React.useState<Tela>({ estado: 'carregando' });
  const [tentativa, setTentativa] = React.useState(0);

  React.useEffect(() => {
    let ativo = true;
    setTela({ estado: 'carregando' });

    async function carregar() {
      try {
        const r = await fetch('/api/usuarios');
        if (!r.ok) throw new Error('status ' + r.status);
        const usuarios: Usuario[] = await r.json();
        if (ativo) setTela({ estado: 'pronto', usuarios });
      } catch {
        if (ativo) setTela({ estado: 'erro' });
      }
    }

    void carregar();
    return () => { ativo = false; };
  }, [tentativa]);

  const recarregar = () => setTentativa((t) => t + 1);

  if (tela.estado === 'carregando') return <p>Carregando…</p>;
  if (tela.estado === 'erro') {
    return (
      <div>
        <p role="alert">Não foi possível carregar.</p>
        <button onClick={recarregar}>Tentar de novo</button>
      </div>
    );
  }
  return (
    <div>
      <ul>
        {tela.usuarios.map((u) => (
          <li key={u.id}>{u.nome}</li>
        ))}
      </ul>
      <button onClick={recarregar}>Recarregar</button>
    </div>
  );
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-6-lacuna-ativo',
        type: 'fill-blank',
        prompt: 'Complete a busca por parâmetro: a bandeira que ignora a resposta atrasada, a conferência da resposta, e a dependência do efeito.',
        concepts: ['react-dados'],
        difficulty: 'intermediario',
        tags: ['react', 'dados', 'efeitos'],
        template: `window.__servidor = {
  '/api/usuarios/1': { nome: 'Ana' },
  '/api/usuarios/2': { nome: 'Bruno' },
};

function App() {
  const [id, setId] = React.useState(1);
  const [nome, setNome] = React.useState<string | null>(null);

  React.useEffect(() => {
    let {{1}} = true;
    setNome(null);
    async function carregar() {
      const r = await fetch('/api/usuarios/' + id);
      if (!r.{{2}}) return;
      const dados: { nome: string } = await r.json();
      if ({{1}}) setNome(dados.nome);
    }
    void carregar();
    return () => { {{1}} = false; };
  }, {{3}});

  return (
    <div>
      <label>
        Usuário
        <select value={id} onChange={(e) => setId(Number(e.target.value))}>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
      </label>
      <p>{nome ?? 'Carregando…'}</p>
    </div>
  );
}`,
        blanks: [
          { placeholder: 'bandeira', size: 6 },
          { placeholder: 'campo', size: 3 },
          { placeholder: 'lista', size: 5 },
        ],
        tests: [
          {
            description: 'o usuário 1 carrega ao montar',
            assertion: `await esperar(150); if (texto('p') !== 'Ana') throw new Error('Esperava "Ana" depois de carregar, veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: 'trocar para o usuário 2 busca de novo',
            assertion: `await digitar(campo('Usuário'), '2'); await esperar(150); if (texto('p') !== 'Bruno') throw new Error('Com o usuário 2 esperava "Bruno", veio ' + JSON.stringify(texto('p')) + '. O efeito depende do id?');`,
          },
        ],
        hints: [
          'A bandeira é uma variável do efeito — começa verdadeira e a limpeza a derruba. Ela aparece três vezes.',
          'O campo da resposta que diz se deu certo; e a lista com o valor que, ao mudar, deve refazer a busca.',
        ],
        solution: ['ativo', 'ok', '[id]'],
        explanation:
          '`ativo` é a bandeira: `true` enquanto o efeito vale, `false` quando a limpeza roda — e a limpeza roda **antes** do efeito seguinte, então a resposta da busca anterior encontra `ativo = false` e é ignorada. `r.ok` é a conferência que `fetch` não faz. `[id]` refaz a busca a cada troca; sem ele o efeito rodaria uma vez e o `<select>` não teria efeito nenhum.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-6-bug-async',
        type: 'find-bug',
        prompt:
          "O compilador recusa: `Argument of type '() => Promise<void>' is not assignable to parameter of type '() => void | (() => void)'`. Aponte a linha do defeito.",
        concepts: ['react-dados'],
        difficulty: 'iniciante',
        tags: ['react', 'dados', 'depuracao'],
        code: `window.__servidor = { '/api/contagem': { total: 42 } };

function App() {
  const [total, setTotal] = React.useState<number | null>(null);

  async function carregar() {
    const r = await fetch('/api/contagem');
    if (!r.ok) return;
    const dados: { total: number } = await r.json();
    setTotal(dados.total);
  }

  React.useEffect(carregar, []);

  return <p>{total === null ? 'Carregando…' : total + ' itens'}</p>;
}`,
        buggyLine: 13,
        fix: '  React.useEffect(() => { void carregar(); }, []);',
        explanation:
          '`carregar` é `async`, então devolve uma promessa — e o efeito precisa devolver a limpeza ou nada. Passá-la direto ao `useEffect` entrega a promessa como "limpeza", e o compilador recusa. O jeito é uma função comum que chama a assíncrona sem esperá-la: `() => { void carregar(); }`. O `void` diz ao leitor e ao compilador que a promessa é intencionalmente deixada de lado ali.',
        hints: [
          'O que `carregar` devolve, por ser `async`? O que o `useEffect` aceita de volta?',
          'Embrulhe a chamada numa função comum.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-6-tres-booleanos',
        type: 'multiple-choice',
        prompt: 'Qual é o problema de modelar a tela com `carregando: boolean`, `erro: string | null` e `dados: Usuario[] | null` em vez de uma união de três estados?',
        concepts: ['react-dados'],
        difficulty: 'intermediario',
        tags: ['react', 'dados', 'tipos'],
        options: [
          'Nenhum; é só uma questão de gosto',
          'Os três podem se contradizer — carregando e com erro ao mesmo tempo, dados e erro juntos — e o JSX precisa de `if`s para cada combinação impossível; a união torna as combinações impossíveis inexpressáveis',
          'Booleanos são mais lentos que uniões',
          'O React não aceita três estados no mesmo componente',
        ],
        correctIndex: 1,
        explanation:
          'Com três campos independentes existem oito combinações, e só três fazem sentido. Cada `if` do JSX precisa lidar com as outras cinco, e um esquecimento vira uma tela que mostra "carregando" por cima de um erro. A união discriminada tem exatamente três formas; `tela.usuarios` só existe em `pronto`, e o compilador recusa o acesso fora dela. É a aula de estreitar aplicada à tela.',
        hints: ['Quantas combinações três campos independentes permitem? Quantas fazem sentido?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-6-detalhe',
        type: 'code',
        prompt:
          'Escreva `App` com um `<select>` de rótulo `Usuário` (opções 1 e 2) que busca `/api/usuarios/ID` sempre que o id muda e mostra num `<p>`: `Carregando…` enquanto espera, `NOME (EMAIL)` quando chega, e `Usuário não encontrado` quando a resposta não é `ok`. Inclua a opção 3, que não existe no servidor. Ignore respostas atrasadas.',
        concepts: ['react-dados'],
        difficulty: 'intermediario',
        tags: ['react', 'dados', 'efeitos'],
        initialCode: `window.__servidor = {
  '/api/usuarios/1': { nome: 'Ana', email: 'ana@x.com' },
  '/api/usuarios/2': { nome: 'Bruno', email: 'bruno@x.com' },
};

interface Usuario {
  nome: string;
  email: string;
}

function App() {
  const [id, setId] = React.useState(1);

  return (
    <div>
      <label>
        Usuário
        <select value={id} onChange={(e) => setId(Number(e.target.value))}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </label>
      <p>Carregando…</p>
    </div>
  );
}
`,
        tests: [
          {
            description: 'ao montar, mostra Carregando… e depois o usuário 1',
            assertion: `if (texto('p') !== 'Carregando…') throw new Error('Antes da resposta esperava "Carregando…", veio ' + JSON.stringify(texto('p'))); await esperar(150); if (texto('p') !== 'Ana (ana@x.com)') throw new Error('Esperava "Ana (ana@x.com)", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: 'trocar para 2 busca o usuário 2',
            assertion: `await digitar(campo('Usuário'), '2'); await esperar(150); if (texto('p') !== 'Bruno (bruno@x.com)') throw new Error('Com o 2 esperava "Bruno (bruno@x.com)", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: 'o usuário 3 não existe: 404 vira mensagem',
            assertion: `await digitar(campo('Usuário'), '3'); await esperar(150); if (texto('p') !== 'Usuário não encontrado') throw new Error('Com o 3 (404) esperava "Usuário não encontrado", veio ' + JSON.stringify(texto('p')) + '. Confira resposta.ok.');`,
          },
          {
            description: 'voltar para 1 carrega de novo',
            assertion: `await digitar(campo('Usuário'), '1'); await esperar(150); if (texto('p') !== 'Ana (ana@x.com)') throw new Error('De volta ao 1 esperava "Ana (ana@x.com)", veio ' + JSON.stringify(texto('p')));`,
          },
        ],
        hints: [
          'Um estado `tela` com as três formas e um efeito com `[id]` na lista, que começa com `setTela({ estado: \'carregando\' })`.',
          'Dentro: `let ativo = true`, `fetch(\'/api/usuarios/\' + id)`, `if (!r.ok)` → erro, senão `pronto` com o usuário; `setTela` só `if (ativo)`; limpeza `ativo = false`.',
        ],
        solution: `window.__servidor = {
  '/api/usuarios/1': { nome: 'Ana', email: 'ana@x.com' },
  '/api/usuarios/2': { nome: 'Bruno', email: 'bruno@x.com' },
};

interface Usuario {
  nome: string;
  email: string;
}

type Tela =
  | { estado: 'carregando' }
  | { estado: 'erro' }
  | { estado: 'pronto'; usuario: Usuario };

function App() {
  const [id, setId] = React.useState(1);
  const [tela, setTela] = React.useState<Tela>({ estado: 'carregando' });

  React.useEffect(() => {
    let ativo = true;
    setTela({ estado: 'carregando' });

    async function carregar() {
      const r = await fetch('/api/usuarios/' + id);
      if (!r.ok) {
        if (ativo) setTela({ estado: 'erro' });
        return;
      }
      const usuario: Usuario = await r.json();
      if (ativo) setTela({ estado: 'pronto', usuario });
    }

    void carregar();
    return () => { ativo = false; };
  }, [id]);

  return (
    <div>
      <label>
        Usuário
        <select value={id} onChange={(e) => setId(Number(e.target.value))}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </label>
      <p>
        {tela.estado === 'carregando'
          ? 'Carregando…'
          : tela.estado === 'erro'
            ? 'Usuário não encontrado'
            : tela.usuario.nome + ' (' + tela.usuario.email + ')'}
      </p>
    </div>
  );
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Buscar é efeito: a função \`async\` vive dentro dele e é chamada com \`void\`. A tela é uma união de três estados — carregando, erro, pronto —, nunca três booleanos. \`fetch\` não lança em 404: confira \`ok\`. A bandeira \`ativo\`, derrubada na limpeza, descarta a resposta que chegou tarde — e vira obrigatória quando o parâmetro muda. Erro sem "Tentar de novo" é tela sem saída.`,
    },
  ],
};

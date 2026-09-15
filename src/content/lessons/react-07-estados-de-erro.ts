import type { Lesson } from '../types';

export const lessonEstadosDeErro: Lesson = {
  id: 'lesson-react-7',
  trackId: 'track-react',
  title: 'Estados de Erro: A Tela que Não Cai',
  language: 'react',
  objective:
    'Tratar o vazio como um estado próprio, o erro de uma ação sem perder o que a pessoa fez, o erro de uma parte da tela sem derrubar o resto — e sempre com uma saída.',
  concepts: ['react-erros'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
A aula anterior modelou a busca com três estados. Uma tela de verdade tem mais situações que isso, e cada uma que você não desenhar vai aparecer como uma tela em branco, um botão que não volta, ou um texto digitado que sumiu. Esta aula é o catálogo do que pode dar errado — e do que a pessoa vê em cada caso.

## O vazio é um estado

\`pronto\` com uma lista vazia não é o mesmo que carregando, e não é erro. É o quarto estado, e o mais esquecido: a busca deu certo e **não havia nada**.

~~~tsx
if (tela.estado === 'pronto' && tela.tarefas.length === 0) {
  return (
    <div>
      <p>Nenhuma tarefa ainda.</p>
      <button onClick={criar}>Criar a primeira</button>
    </div>
  );
}
~~~

A aula de estados da tela já disse: o vazio diz o que fazer. Uma \`<ul>\` sem filhos diz "quebrou".

## Erro numa ação

Buscar é uma coisa; **salvar** é outra. Quando um clique dispara uma requisição, há três coisas a proteger:

~~~tsx
const [salvando, setSalvando] = React.useState(false);
const [erro, setErro] = React.useState<string | null>(null);

async function salvar() {
  setSalvando(true);
  setErro(null);
  try {
    const r = await fetch('/api/notas', { method: 'POST', body: JSON.stringify({ texto }) });
    if (!r.ok) throw new Error('status ' + r.status);
    setTexto('');
  } catch {
    setErro('Não foi possível salvar. Tente de novo.');
  } finally {
    setSalvando(false);
  }
}

<button onClick={salvar} disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</button>
{erro && <p role="alert">{erro}</p>}
~~~

1. **O botão volta.** \`finally\` garante \`setSalvando(false)\` no sucesso e no erro. Sem ele, um erro deixa o botão preso em "Salvando…" para sempre.
2. **O que a pessoa digitou fica.** O \`setTexto('')\` só roda no sucesso. Apagar o campo antes de confirmar é o jeito mais rápido de fazer alguém desistir.
3. **O erro é local e diz o que fazer.** Ao lado do botão, com \`role="alert"\` para o leitor de tela anunciar, e com a saída na frase.

O \`catch\` sem variável (\`catch {\`) é proposital: a mensagem para a pessoa não é a mensagem técnica. Se precisar do erro, ele chega como \`unknown\` — \`catch (e)\` — e a aula de tipar uma API ensinou: \`e instanceof Error ? e.message : '…'\`.

## Erro em uma parte, não na tela inteira

Uma tela costuma ter várias fontes: o perfil, as notificações, a lista. Se cada uma é um componente com o **seu** estado, uma falha derruba só o pedaço dela — e o pedaço mostra o seu erro, com o seu "Tentar de novo". Um estado só para a tela inteira transforma o 404 das notificações numa página em branco.

~~~tsx
function App() {
  return (
    <>
      <Perfil />          {/* busca /api/perfil, com os seus três estados */}
      <Notificacoes />    {/* busca /api/notificacoes, com os dela */}
    </>
  );
}
~~~

É o primeiro motivo real para dividir componentes por **dado**, e não só por aparência.

## O erro que ninguém previu

Um componente que lança durante a renderização (um \`undefined.nome\`) derruba a árvore inteira: o React desmonta tudo. A proteção é um **error boundary** — um componente que envolve uma parte da tela e mostra uma mensagem no lugar dela quando algo lá dentro lança. Ele precisa ser uma classe (um detalhe histórico do React), e por isso não aparece nos exercícios daqui; bibliotecas como \`react-error-boundary\` fazem isso por você. O que vale saber: existe, envolve por região, e a mensagem que ele mostra segue as mesmas regras — o que houve, o que fazer.

## A mensagem

A aula de escrever a interface vale inteira: o que houve + o que fazer, sem culpa, sem jargão. "Erro 500" não é mensagem. "Não foi possível salvar. Tente de novo em instantes." é.

## Os erros

- Vazio tratado como carregando (o "Carregando…" que nunca sai).
- Botão preso em "Salvando…" porque o \`finally\` faltou.
- Campo apagado antes de a resposta confirmar.
- Um estado de erro para a tela inteira.
- Mensagem técnica na tela.
`.trim(),
    },
    {
      kind: 'example',
      language: 'tsx',
      code: `window.__servidor = {
  '/api/notas': (opcoes: { method?: string }) => (opcoes.method === 'POST' ? { ok: true } : []),
};

function App() {
  const [texto, setTexto] = React.useState('');
  const [salvando, setSalvando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [salvas, setSalvas] = React.useState<string[]>([]);

  async function salvar() {
    setSalvando(true);
    setErro(null);
    try {
      const r = await fetch('/api/notas', { method: 'POST', body: JSON.stringify({ texto }) });
      if (!r.ok) throw new Error('status ' + r.status);
      setSalvas([...salvas, texto]);
      setTexto('');                       // só no sucesso
    } catch {
      setErro('Não foi possível salvar. Tente de novo.');
    } finally {
      setSalvando(false);                 // sempre
    }
  }

  return (
    <div>
      <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Nota" />
      <button onClick={salvar} disabled={salvando || texto.trim() === ''}>
        {salvando ? 'Salvando…' : 'Salvar'}
      </button>
      {erro && <p role="alert">{erro}</p>}
      {salvas.length === 0 ? <p>Nenhuma nota ainda.</p> : <ul>{salvas.map((n, i) => <li key={i}>{n}</li>)}</ul>}
    </div>
  );
}`,
      caption:
        'Salvar com as três proteções: o botão volta pelo `finally`, o campo só limpa no sucesso, o erro é local e diz o que fazer. E o vazio tem frase própria. O servidor de mentira responde a uma função quando o caminho é uma função — aqui, diferente para POST e GET.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-7-vazio',
        type: 'multiple-choice',
        prompt: 'A busca de tarefas terminou com sucesso e devolveu `[]`. O que a tela deve mostrar?',
        concepts: ['react-erros'],
        difficulty: 'iniciante',
        tags: ['react', 'estados'],
        options: [
          'Continuar em "Carregando…", porque ainda não há dados',
          'Uma `<ul>` vazia — é o que os dados são',
          'O estado vazio: uma frase dizendo que não há tarefas e o que fazer para criar a primeira',
          'A mensagem de erro, porque uma lista vazia é uma resposta inesperada',
        ],
        correctIndex: 2,
        explanation:
          'Lista vazia é sucesso sem conteúdo — o quarto estado. Não é carregando (a resposta chegou), não é erro (deu certo) e uma `<ul>` sem filhos parece defeito. A pessoa precisa saber que está tudo bem e o que pode fazer agora. É o "vazio que diz o que fazer" da aula de estados da tela, agora dentro do `pronto`.',
        hints: ['A busca deu certo. O problema é só o que aparece na tela quando não há nada.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-7-vazio-lista',
        type: 'code',
        prompt:
          'Escreva `App` que busca `/api/tarefas` ao montar (o servidor devolve uma lista vazia). Mostre `Carregando…` enquanto espera; quando chegar vazio, mostre `<p>Nenhuma tarefa ainda.</p>` e um botão `Criar a primeira`, que acrescenta a tarefa `Nova tarefa` à lista local. Com tarefas, mostre-as em `<li>` — e o estado vazio some.',
        concepts: ['react-erros'],
        difficulty: 'intermediario',
        tags: ['react', 'estados', 'dados'],
        initialCode: `window.__servidor = {
  '/api/tarefas': [],
};

function App() {
  return <p>Carregando…</p>;
}
`,
        tests: [
          {
            description: 'começa carregando e, com a resposta vazia, mostra o estado vazio',
            assertion: `if (texto('p') !== 'Carregando…') throw new Error('Antes da resposta esperava "Carregando…".'); await esperar(150); if (texto('p') !== 'Nenhuma tarefa ainda.') throw new Error('Com a lista vazia esperava "Nenhuma tarefa ainda.", veio ' + JSON.stringify(texto('p'))); botao('Criar a primeira');`,
          },
          {
            description: 'criar a primeira tarefa troca o vazio pela lista',
            assertion: `await clicar(botao('Criar a primeira')); const t = textos('li'); if (JSON.stringify(t) !== '["Nova tarefa"]') throw new Error('Esperava um <li> "Nova tarefa", veio ' + JSON.stringify(t)); if (document.querySelector('p') && texto('p') === 'Nenhuma tarefa ainda.') throw new Error('Com uma tarefa, o estado vazio deveria sumir.');`,
          },
        ],
        hints: [
          'Um estado `tarefas: string[] | null` (null = ainda carregando) resolve: `null` mostra Carregando…, `[]` mostra o vazio, o resto mostra a lista.',
          'O efeito busca e faz `setTarefas(await r.json())`. Criar é `setTarefas([...tarefas, \'Nova tarefa\'])`.',
        ],
        solution: `window.__servidor = {
  '/api/tarefas': [],
};

function App() {
  const [tarefas, setTarefas] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    let ativo = true;
    async function carregar() {
      const r = await fetch('/api/tarefas');
      if (!r.ok) return;
      const dados: string[] = await r.json();
      if (ativo) setTarefas(dados);
    }
    void carregar();
    return () => { ativo = false; };
  }, []);

  if (tarefas === null) return <p>Carregando…</p>;

  if (tarefas.length === 0) {
    return (
      <div>
        <p>Nenhuma tarefa ainda.</p>
        <button onClick={() => setTarefas([...tarefas, 'Nova tarefa'])}>Criar a primeira</button>
      </div>
    );
  }

  return (
    <ul>
      {tarefas.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-7-lacuna-salvar',
        type: 'fill-blank',
        prompt: 'Complete o salvar que não deixa o botão preso nem apaga o que foi digitado: o bloco que captura, o bloco que sempre roda, e o que ele faz.',
        concepts: ['react-erros'],
        difficulty: 'intermediario',
        tags: ['react', 'estados', 'async'],
        template: `window.__servidor = {};

function App() {
  const [texto, setTexto] = React.useState('');
  const [salvando, setSalvando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  async function salvar() {
    setSalvando(true);
    setErro(null);
    {{1}} {
      const r = await fetch('/api/notas', { method: 'POST', body: texto });
      if (!r.ok) throw new Error('status ' + r.status);
      setTexto('');
    } catch {
      setErro('Não foi possível salvar. Tente de novo.');
    } {{2}} {
      setSalvando({{3}});
    }
  }

  return (
    <div>
      <label>
        Nota <input value={texto} onChange={(e) => setTexto(e.target.value)} />
      </label>
      <button onClick={salvar} disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</button>
      {erro && <p role="alert">{erro}</p>}
    </div>
  );
}`,
        blanks: [
          { placeholder: 'bloco', size: 4 },
          { placeholder: 'bloco', size: 7 },
          { placeholder: 'valor', size: 5 },
        ],
        tests: [
          {
            description: 'com o servidor fora do ar, o erro aparece, o botão volta e o texto fica',
            assertion: `await digitar(campo('Nota'), 'lembrar do leite'); await clicar(botao('Salvar')); await esperar(150); const alerta = document.querySelector('[role="alert"]'); if (!alerta) throw new Error('Com 404 esperava a mensagem de erro.'); if (botao('Salvar').disabled) throw new Error('Depois do erro o botão deveria voltar a ficar habilitado — é o finally.'); if (campo('Nota').value !== 'lembrar do leite') throw new Error('O texto digitado deveria continuar no campo depois do erro.');`,
          },
          {
            description: 'com o servidor de volta, salvar limpa o campo e some com o erro',
            assertion: `window.__servidor['/api/notas'] = { ok: true }; await clicar(botao('Salvar')); await esperar(150); if (campo('Nota').value !== '') throw new Error('No sucesso o campo deveria ser limpo.'); if (document.querySelector('[role="alert"]')) throw new Error('No sucesso a mensagem de erro deveria sumir.');`,
          },
        ],
        hints: [
          'A estrutura de três blocos do JavaScript: o que tenta, o que captura, o que roda sempre.',
          'O terceiro bloco devolve o botão ao normal: o estado de "salvando" volta ao valor inicial.',
        ],
        solution: ['try', 'finally', 'false'],
        explanation:
          '`try` envolve o que pode falhar; `catch` traduz a falha numa mensagem; `finally` roda nos dois caminhos — e é ali que `setSalvando(false)` precisa estar, senão o erro deixa o botão preso em "Salvando…". O `setTexto(\'\')` fica dentro do `try`, depois do `ok`: só o sucesso apaga o que a pessoa digitou.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-7-bug-unknown',
        type: 'find-bug',
        prompt:
          "O compilador recusa: `Argument of type 'unknown' is not assignable to parameter of type 'SetStateAction<string | null>'`. Aponte a linha do defeito.",
        concepts: ['react-erros'],
        difficulty: 'intermediario',
        tags: ['react', 'estados', 'depuracao'],
        code: `window.__servidor = {};

function App() {
  const [erro, setErro] = React.useState<string | null>(null);

  async function enviar() {
    setErro(null);
    try {
      const r = await fetch('/api/pedidos', { method: 'POST' });
      if (!r.ok) throw new Error('O servidor respondeu ' + r.status + '.');
    } catch (e) {
      setErro(e);
    }
  }

  return (
    <div>
      <button onClick={enviar}>Enviar pedido</button>
      {erro && <p role="alert">{erro}</p>}
    </div>
  );
}`,
        buggyLine: 12,
        fix: "      setErro(e instanceof Error ? e.message : 'Não foi possível enviar. Tente de novo.');",
        explanation:
          'O que chega num `catch` é `unknown`: pode ser um `Error`, um texto, qualquer coisa que alguém tenha lançado. O estado `erro` é texto, e o compilador não deixa guardar um `unknown` nele — é a aula de tipar o que vem de fora, dentro do componente. Estreite: `e instanceof Error ? e.message : \'…\'`. E lembre que a mensagem técnica raramente é a mensagem para a pessoa; muitas vezes o melhor é ignorar `e` e escrever a frase certa.',
        hints: [
          'Qual é o tipo de `e` num `catch`? O que `setErro` aceita?',
          'Estreite com `instanceof Error` antes de ler `.message`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-7-texto-fica',
        type: 'multiple-choice',
        prompt: 'A pessoa escreve um comentário longo, clica em Enviar, e o servidor falha. O que a tela deve fazer com o texto?',
        concepts: ['react-erros'],
        difficulty: 'iniciante',
        tags: ['react', 'estados', 'ux'],
        options: [
          'Limpar o campo, para a pessoa tentar de novo do zero',
          'Manter o texto no campo, mostrar o erro ao lado do botão e habilitar o botão de novo — só o sucesso apaga o que foi digitado',
          'Recarregar a página',
          'Mostrar um `alert()` com o erro técnico',
        ],
        correctIndex: 1,
        explanation:
          'Apagar o que a pessoa escreveu é a forma mais rápida de perdê-la. O `setTexto(\'\')` fica depois do `ok`, dentro do `try`; o erro aparece perto da ação, com o que fazer; o `finally` devolve o botão. A pessoa tenta de novo com um clique, não com uma redigitação.',
        hints: ['Qual é o custo, para a pessoa, de cada opção?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-7-parcial',
        type: 'code',
        prompt:
          'Escreva `App` com dois componentes independentes: `Perfil` busca `/api/perfil` e mostra `<h2>` com o nome; `Notificacoes` busca `/api/notificacoes` e mostra as mensagens em `<li>`. Cada um tem o **seu** `Carregando…`, o **seu** erro (`<p role="alert">` com um botão `Tentar de novo`) — o servidor não tem o caminho das notificações no início — e a falha de um não afeta o outro.',
        concepts: ['react-erros'],
        difficulty: 'avancado',
        tags: ['react', 'estados', 'composicao'],
        initialCode: `window.__servidor = {
  '/api/perfil': { nome: 'Ana' },
};

function App() {
  return <p>Carregando…</p>;
}
`,
        tests: [
          {
            description: 'o perfil carrega e mostra o nome, mesmo com as notificações fora do ar',
            assertion: `await esperar(150); if (texto('h2') !== 'Ana') throw new Error('Esperava <h2>Ana</h2> do perfil, veio ' + JSON.stringify(texto('h2')));`,
          },
          {
            description: 'as notificações mostram o próprio erro, com Tentar de novo, sem derrubar o perfil',
            assertion: `const alerta = document.querySelector('[role="alert"]'); if (!alerta) throw new Error('Com /api/notificacoes fora do ar esperava um <p role="alert"> só nas notificações.'); botao('Tentar de novo'); if (texto('h2') !== 'Ana') throw new Error('O perfil deveria continuar na tela apesar do erro das notificações.');`,
          },
          {
            description: 'com o servidor de volta, Tentar de novo carrega as notificações',
            assertion: `window.__servidor['/api/notificacoes'] = ['Bem-vinda', 'Nova mensagem']; await clicar(botao('Tentar de novo')); await esperar(150); const t = textos('li'); if (JSON.stringify(t) !== JSON.stringify(['Bem-vinda', 'Nova mensagem'])) throw new Error('Esperava as duas notificações em <li>, veio ' + JSON.stringify(t)); if (document.querySelector('[role="alert"]')) throw new Error('Depois de carregar, o erro deveria sumir.');`,
          },
        ],
        hints: [
          'Dois componentes, cada um com o seu `useState<Tela>` e o seu efeito — o mesmo padrão da aula anterior, duas vezes. `App` só os põe lado a lado.',
          'Em cada um, um contador `tentativa` na lista do efeito, e o botão faz `setTentativa((t) => t + 1)`.',
        ],
        solution: `window.__servidor = {
  '/api/perfil': { nome: 'Ana' },
};

type Tela<T> = { estado: 'carregando' } | { estado: 'erro' } | { estado: 'pronto'; dados: T };

function usarBusca<T>(caminho: string): [Tela<T>, () => void] {
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

  return [tela, () => setTentativa((t) => t + 1)];
}

function Perfil() {
  const [tela, tentar] = usarBusca<{ nome: string }>('/api/perfil');
  if (tela.estado === 'carregando') return <p>Carregando…</p>;
  if (tela.estado === 'erro') return <div><p role="alert">Não foi possível carregar o perfil.</p><button onClick={tentar}>Tentar de novo</button></div>;
  return <h2>{tela.dados.nome}</h2>;
}

function Notificacoes() {
  const [tela, tentar] = usarBusca<string[]>('/api/notificacoes');
  if (tela.estado === 'carregando') return <p>Carregando…</p>;
  if (tela.estado === 'erro') return <div><p role="alert">Não foi possível carregar as notificações.</p><button onClick={tentar}>Tentar de novo</button></div>;
  return <ul>{tela.dados.map((n) => <li key={n}>{n}</li>)}</ul>;
}

function App() {
  return (
    <>
      <Perfil />
      <Notificacoes />
    </>
  );
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `O vazio é um estado, com frase e ação. Uma ação que falha protege três coisas: o botão volta (\`finally\`), o texto fica (limpar só no sucesso) e o erro é local, com a saída na frase. Cada parte da tela que busca dados tem o próprio estado — uma falha derruba só o pedaço dela. O \`catch\` recebe \`unknown\`; estreite, ou escreva a mensagem para a pessoa. Mensagem técnica não é mensagem.`,
    },
  ],
};

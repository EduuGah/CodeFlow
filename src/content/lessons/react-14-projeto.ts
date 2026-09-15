import type { Lesson } from '../types';

export const lessonProjetoReact: Lesson = {
  id: 'lesson-react-14',
  trackId: 'track-react',
  title: 'Projeto: A Lista de Tarefas, Inteira',
  language: 'react',
  objective:
    'Juntar a trilha num aplicativo pequeno e completo — estado desenhado antes do código, componentes por responsabilidade, formulário, lista, filtro, persistência e estados da tela — do jeito que se faz um projeto de verdade.',
  concepts: ['react-projeto'],
  status: 'published',
  estimatedMinutes: 40,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Treze aulas, treze pedaços. Um aplicativo é os pedaços juntos — e a parte difícil de um projeto nunca é um pedaço: é decidir a ordem, o que mora onde, e o que fazer primeiro. Esta aula é esse processo, com a lista de tarefas como pretexto. É o mesmo aplicativo da trilha da página, agora em React, e comparar os dois no fim vale a aula.

## Primeiro o estado, depois a tela

Antes de escrever JSX, escreva o que o aplicativo **guarda**:

~~~tsx
interface Tarefa {
  id: number;
  titulo: string;
  feita: boolean;
}

type Filtro = 'todas' | 'pendentes' | 'feitas';
~~~

E o que ele **não** guarda, porque deriva: a lista filtrada, a contagem de pendentes, se está vazio. Dois estados — \`tarefas: Tarefa[]\` e \`filtro: Filtro\` — mais o texto do campo. Tudo o mais é calculado na renderização.

Desenhar o estado antes é o que evita o formulário com um estado por campo, a contagem guardada que se desencontra, o filtro que muda a lista original. A aula de estado disse; o projeto cobra.

## Depois os componentes, por responsabilidade

- \`App\`: dono do estado, cola.
- \`NovaTarefa\`: o formulário; recebe \`aoAdicionar\`.
- \`Filtros\`: os três botões; recebe \`filtro\` e \`aoMudar\`; o ativo tem \`aria-pressed\`.
- \`Lista\`: recebe \`tarefas\` (já filtradas), \`aoAlternar\`, \`aoRemover\`; mostra o vazio.
- \`Item\`: uma tarefa, com a caixa de marcar e o botão de remover.

Dados descem, eventos sobem. Nenhum filho guarda estado que o pai precisa. O \`Item\` nem sabe que existe filtro.

## Depois a ordem de construção

1. O estado e o tipo — compila, não mostra nada.
2. A lista, com dados fixos — dá para ver.
3. Adicionar — dá para usar.
4. Marcar e remover — a lista vive.
5. O filtro — derivado, com o botão ativo marcado.
6. A persistência — um efeito que grava, um \`useState\` que lê.
7. Os estados da tela — vazio geral, vazio do filtro.

Cada passo deixa o aplicativo funcionando. É a ordem que a aula de decompor problemas ensinou: uma fatia vertical por vez, nunca "todo o estado, depois toda a tela".

## O que a persistência muda

\`localStorage\` guarda texto: \`JSON.stringify\` ao gravar, \`JSON.parse\` ao ler — e o que se lê é \`unknown\`, como a aula de tipar uma API avisou. Uma guarda simples (\`Array.isArray\`) na leitura evita que um dado corrompido derrube o aplicativo na abertura. A leitura vai na função inicial do \`useState\` (roda uma vez); a gravação, num efeito que depende de \`tarefas\`.

## Pronto é quando

Um projeto pequeno está pronto quando: cada estado da tela tem cara (vazio, com itens, filtro sem resultado); cada ação tem resposta visível; o teclado percorre tudo; recarregar não perde nada; e o código cabe na cabeça — cada componente numa tela. O que sobra é o que você acrescentaria depois: editar o título, ordenar, sincronizar com um servidor. Termine antes de crescer.
`.trim(),
    },
    {
      kind: 'example',
      language: 'tsx',
      code: `// O esqueleto do projeto: o estado desenhado, os componentes com as props
// decididas, e o App como cola — antes de qualquer comportamento.
interface Tarefa {
  id: number;
  titulo: string;
  feita: boolean;
}

type Filtro = 'todas' | 'pendentes' | 'feitas';

function NovaTarefa({ aoAdicionar }: { aoAdicionar: (titulo: string) => void }) {
  const [titulo, setTitulo] = React.useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (titulo.trim() === '') return;
        aoAdicionar(titulo.trim());
        setTitulo('');
      }}
    >
      <label>
        Nova tarefa <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </label>
      <button type="submit">Adicionar</button>
    </form>
  );
}

function Filtros({ filtro, aoMudar }: { filtro: Filtro; aoMudar: (f: Filtro) => void }) {
  const opcoes: Filtro[] = ['todas', 'pendentes', 'feitas'];
  return (
    <div>
      {opcoes.map((f) => (
        <button key={f} aria-pressed={filtro === f} onClick={() => aoMudar(f)}>
          {f}
        </button>
      ))}
    </div>
  );
}

function App() {
  const [tarefas, setTarefas] = React.useState<Tarefa[]>([]);
  const [filtro, setFiltro] = React.useState<Filtro>('todas');

  const visiveis = tarefas.filter((t) =>
    filtro === 'todas' ? true : filtro === 'feitas' ? t.feita : !t.feita
  );

  return (
    <div>
      <NovaTarefa aoAdicionar={(titulo) => setTarefas([...tarefas, { id: Date.now(), titulo, feita: false }])} />
      <Filtros filtro={filtro} aoMudar={setFiltro} />
      <ul>
        {visiveis.map((t) => (
          <li key={t.id}>{t.titulo}</li>
        ))}
      </ul>
    </div>
  );
}`,
      caption:
        'Os passos 1 a 3 e o 5: o estado, o formulário controlado que sobe o título, os filtros com `aria-pressed` no ativo, e a lista derivada. O que falta — marcar, remover, persistir, os vazios — é o exercício.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-14-ordem',
        type: 'order-steps',
        prompt: 'Coloque na ordem em que a aula recomenda construir o projeto.',
        concepts: ['react-projeto'],
        difficulty: 'iniciante',
        tags: ['react', 'projeto'],
        steps: [
          { id: 'estado', text: 'Escrever o tipo `Tarefa`, o tipo `Filtro` e os estados do `App` — sem tela ainda', ordem: 1 },
          { id: 'lista', text: 'Mostrar a lista com dados fixos, para ter o que ver', ordem: 2 },
          { id: 'adicionar', text: 'O formulário que adiciona uma tarefa', ordem: 3 },
          { id: 'alternar', text: 'Marcar como feita e remover', ordem: 4 },
          { id: 'filtro', text: 'O filtro, derivado, com o botão ativo marcado', ordem: 5 },
          { id: 'persistir', text: 'Gravar no armazenamento a cada mudança e ler na abertura', ordem: 6 },
          { id: 'vazios', text: 'Os estados vazios: sem tarefa nenhuma, e filtro sem resultado', ordem: 7 },
        ],
        explanation:
          'Uma fatia por vez, cada uma deixando o aplicativo funcionando: primeiro o que se guarda, depois o que se vê, depois cada ação, e por fim o que raramente aparece (persistência, vazios). Começar pela tela inteira ou por "todo o estado" é a ordem em que nada roda até o fim.',
        hints: ['O primeiro passo não mostra nada; o último é o que quase ninguém vê.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-14-estado',
        type: 'multiple-choice',
        prompt: 'Qual destas coisas deve ser **estado** na lista de tarefas?',
        concepts: ['react-projeto'],
        difficulty: 'iniciante',
        tags: ['react', 'projeto', 'estado'],
        options: [
          'A quantidade de tarefas pendentes',
          'A lista de tarefas visíveis depois do filtro',
          'O filtro escolhido (`todas`, `pendentes` ou `feitas`)',
          'Se a lista está vazia',
        ],
        correctIndex: 2,
        explanation:
          'O filtro é uma escolha da pessoa — não se deduz de nada. Os outros três se calculam a partir de `tarefas` e `filtro` a cada renderização: a contagem é um `filter().length`, a lista visível é um `filter`, o vazio é um `length === 0`. Guardá-los seria criar estados que precisam ser sincronizados — e que se desencontram.',
        hints: ['Estado é o que a pessoa fez e não se deduz do resto.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-14-nucleo',
        type: 'code',
        prompt:
          'O núcleo do projeto. `App` com: um formulário (campo de rótulo `Nova tarefa`, botão `Adicionar`) que acrescenta a tarefa e limpa o campo, ignorando texto vazio; cada tarefa num `<li>` com uma caixa de marcar (`<input type="checkbox">`) que alterna `feita` (o `<li>` ganha a classe `feita`) e um botão `Remover`; um `<p>` com `N pendente(s)`; e, sem tarefas, `<p>Nenhuma tarefa. Adicione a primeira.</p>`. Separe ao menos `NovaTarefa` e `Item` do `App`.',
        concepts: ['react-projeto'],
        difficulty: 'avancado',
        tags: ['react', 'projeto'],
        initialCode: `interface Tarefa {
  id: number;
  titulo: string;
  feita: boolean;
}

function App() {
  return <p>Nenhuma tarefa. Adicione a primeira.</p>;
}
`,
        tests: [
          {
            description: 'começa vazia, com a mensagem e 0 pendente(s)',
            assertion: `const ps = textos('p'); if (!ps.includes('Nenhuma tarefa. Adicione a primeira.')) throw new Error('Sem tarefas esperava "Nenhuma tarefa. Adicione a primeira.".'); if (!ps.includes('0 pendente(s)')) throw new Error('Esperava um <p> com "0 pendente(s)".');`,
          },
          {
            description: 'adicionar duas tarefas pelo formulário',
            assertion: `await digitar(campo('Nova tarefa'), 'Estudar'); await clicar(botao('Adicionar')); await digitar(campo('Nova tarefa'), 'Praticar'); await enviar('form'); const t = textos('li').map((x) => x.replace(/Remover$/, '').trim()); if (JSON.stringify(t) !== JSON.stringify(['Estudar', 'Praticar'])) throw new Error('Esperava Estudar e Praticar em <li>, veio ' + JSON.stringify(t)); if (campo('Nova tarefa').value !== '') throw new Error('Depois de adicionar, o campo deveria ficar vazio.'); if (!textos('p').includes('2 pendente(s)')) throw new Error('Esperava "2 pendente(s)".'); if (textos('p').includes('Nenhuma tarefa. Adicione a primeira.')) throw new Error('Com tarefas, o vazio some.');`,
          },
          {
            description: 'texto vazio não adiciona',
            assertion: `await digitar(campo('Nova tarefa'), '   '); await clicar(botao('Adicionar')); if (document.querySelectorAll('li').length !== 2) throw new Error('Texto vazio (ou só espaços) não deveria virar tarefa.');`,
          },
          {
            description: 'marcar a primeira como feita: classe no <li> e contagem',
            assertion: `await clicar(document.querySelector('li input[type="checkbox"]')); const li = document.querySelector('li'); if (!li.classList.contains('feita')) throw new Error('O <li> da tarefa feita deveria ter a classe feita.'); if (!document.querySelector('li input[type="checkbox"]').checked) throw new Error('A caixa deveria estar marcada.'); if (!textos('p').includes('1 pendente(s)')) throw new Error('Com uma feita, esperava "1 pendente(s)".');`,
          },
          {
            description: 'desmarcar e remover',
            assertion: `await clicar(document.querySelector('li input[type="checkbox"]')); if (document.querySelector('li').classList.contains('feita')) throw new Error('Desmarcar tira a classe.'); await clicar(document.querySelector('li button')); const t = textos('li').map((x) => x.replace(/Remover$/, '').trim()); if (JSON.stringify(t) !== '["Praticar"]') throw new Error('Depois de remover a primeira esperava só Praticar, veio ' + JSON.stringify(t)); await clicar(document.querySelector('li button')); if (!textos('p').includes('Nenhuma tarefa. Adicione a primeira.')) throw new Error('Sem tarefas de novo, o vazio volta.');`,
          },
          {
            description: 'os componentes NovaTarefa e Item existem',
            assertion: `for (const n of ['NovaTarefa', 'Item']) { if (typeof window[n] !== 'function') throw new Error('Declare o componente ' + n + ' com function.'); }`,
          },
        ],
        hints: [
          'Estado no App: `tarefas`. `NovaTarefa` tem o próprio `titulo` (é dele) e chama `aoAdicionar(titulo.trim())` no `onSubmit` com `preventDefault`; ignore vazio. `Item` recebe `tarefa`, `aoAlternar`, `aoRemover`.',
          'Alternar: `setTarefas(tarefas.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t)))`. Remover: `filter`. Pendentes: `tarefas.filter((t) => !t.feita).length`. Id: `Date.now()`.',
        ],
        solution: `interface Tarefa {
  id: number;
  titulo: string;
  feita: boolean;
}

function NovaTarefa({ aoAdicionar }: { aoAdicionar: (titulo: string) => void }) {
  const [titulo, setTitulo] = React.useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (titulo.trim() === '') return;
        aoAdicionar(titulo.trim());
        setTitulo('');
      }}
    >
      <label>
        Nova tarefa <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </label>
      <button type="submit">Adicionar</button>
    </form>
  );
}

function Item({ tarefa, aoAlternar, aoRemover }: { tarefa: Tarefa; aoAlternar: (id: number) => void; aoRemover: (id: number) => void }) {
  return (
    <li className={tarefa.feita ? 'feita' : ''}>
      <label>
        <input type="checkbox" checked={tarefa.feita} onChange={() => aoAlternar(tarefa.id)} />
        {tarefa.titulo}
      </label>
      <button onClick={() => aoRemover(tarefa.id)}>Remover</button>
    </li>
  );
}

function App() {
  const [tarefas, setTarefas] = React.useState<Tarefa[]>([]);
  const pendentes = tarefas.filter((t) => !t.feita).length;

  function adicionar(titulo: string) {
    setTarefas([...tarefas, { id: Date.now() + Math.random(), titulo, feita: false }]);
  }
  function alternar(id: number) {
    setTarefas(tarefas.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t)));
  }
  function remover(id: number) {
    setTarefas(tarefas.filter((t) => t.id !== id));
  }

  return (
    <div>
      <NovaTarefa aoAdicionar={adicionar} />
      <p>{pendentes} pendente(s)</p>
      {tarefas.length === 0 ? (
        <p>Nenhuma tarefa. Adicione a primeira.</p>
      ) : (
        <ul>
          {tarefas.map((t) => (
            <Item key={t.id} tarefa={t} aoAlternar={alternar} aoRemover={remover} />
          ))}
        </ul>
      )}
    </div>
  );
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-14-lacuna-persistir',
        type: 'fill-blank',
        prompt: 'Complete a persistência: a leitura na função inicial (com a guarda), e o efeito que grava.',
        concepts: ['react-projeto'],
        difficulty: 'intermediario',
        tags: ['react', 'projeto', 'armazenamento'],
        template: `interface Tarefa { id: number; titulo: string; feita: boolean }

function lerTarefas(): Tarefa[] {
  const texto = localStorage.getItem('tarefas');
  if (!texto) return [];
  const dados: unknown = JSON.parse(texto);
  return {{1}}(dados) ? (dados as Tarefa[]) : [];
}

function App() {
  const [tarefas, setTarefas] = React.useState<Tarefa[]>({{2}});

  React.useEffect(() => {
    localStorage.setItem('tarefas', {{3}}(tarefas));
  }, [tarefas]);

  return (
    <div>
      <button onClick={() => setTarefas([...tarefas, { id: Date.now(), titulo: 'Tarefa ' + (tarefas.length + 1), feita: false }])}>Adicionar</button>
      <ul>{tarefas.map((t) => <li key={t.id}>{t.titulo}</li>)}</ul>
    </div>
  );
}`,
        blanks: [
          { placeholder: 'guarda', size: 13 },
          { placeholder: 'inicial', size: 10 },
          { placeholder: 'função', size: 14 },
        ],
        tests: [
          {
            description: 'adicionar grava no armazenamento',
            assertion: `await clicar(botao('Adicionar')); await esperar(); const gravado = JSON.parse(localStorage.getItem('tarefas') || 'null'); if (!Array.isArray(gravado) || gravado.length !== 1) throw new Error('Depois de adicionar, localStorage.tarefas deveria ter 1 tarefa em JSON, veio ' + localStorage.getItem('tarefas'));`,
          },
          {
            description: 'ao montar de novo, lê o que estava gravado',
            assertion: `window.__raiz.unmount(); await esperar(); const raiz = ReactDOM.createRoot(document.getElementById('root')); ReactDOM.flushSync(() => raiz.render(React.createElement(App))); window.__raiz = raiz; if (document.querySelectorAll('li').length !== 1) throw new Error('Montando de novo, a tarefa gravada deveria aparecer.');`,
          },
          {
            description: 'dado corrompido no armazenamento não derruba o aplicativo',
            assertion: `localStorage.setItem('tarefas', '{"nao":"lista"}'); window.__raiz.unmount(); await esperar(); const raiz = ReactDOM.createRoot(document.getElementById('root')); ReactDOM.flushSync(() => raiz.render(React.createElement(App))); window.__raiz = raiz; if (document.querySelectorAll('li').length !== 0) throw new Error('Com um objeto em vez de lista, a guarda deveria devolver [].');`,
          },
        ],
        hints: [
          'A guarda pergunta se o que veio é uma lista; o inicial do estado é a função que lê (só o nome, para rodar uma vez).',
          'Gravar exige texto: a função do JSON que transforma em texto.',
        ],
        solution: ['Array.isArray', 'lerTarefas', 'JSON.stringify'],
        explanation:
          '`Array.isArray` é a guarda mínima sobre o `unknown` do `JSON.parse` — sem ela, um dado corrompido viraria `tarefas.map is not a function` na abertura. `useState(lerTarefas)` passa a função, não o resultado: o React a chama uma vez, na montagem. E o efeito grava `JSON.stringify(tarefas)` a cada mudança. Recarregar não perde nada.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-14-filtro',
        type: 'code',
        prompt:
          'A extensão: acrescente ao núcleo os filtros `todas`, `pendentes` e `feitas` — três botões com esses textos, o ativo com `aria-pressed="true"` —, a lista visível derivada, e o vazio do filtro: `<p>Nada por aqui neste filtro.</p>` quando há tarefas mas nenhuma passa. Comece com duas tarefas fixas: `Estudar` (feita) e `Praticar` (pendente).',
        concepts: ['react-projeto'],
        difficulty: 'avancado',
        tags: ['react', 'projeto'],
        initialCode: `interface Tarefa {
  id: number;
  titulo: string;
  feita: boolean;
}

type Filtro = 'todas' | 'pendentes' | 'feitas';

const INICIAIS: Tarefa[] = [
  { id: 1, titulo: 'Estudar', feita: true },
  { id: 2, titulo: 'Praticar', feita: false },
];

function App() {
  const [tarefas, setTarefas] = React.useState(INICIAIS);

  return (
    <div>
      <ul>
        {tarefas.map((t) => (
          <li key={t.id} className={t.feita ? 'feita' : ''}>
            <label>
              <input type="checkbox" checked={t.feita} onChange={() => setTarefas(tarefas.map((x) => (x.id === t.id ? { ...x, feita: !x.feita } : x)))} />
              {t.titulo}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
        tests: [
          {
            description: 'começa em todas, com os três botões e o ativo marcado',
            assertion: `for (const f of ['todas', 'pendentes', 'feitas']) botao(f); if (botao('todas').getAttribute('aria-pressed') !== 'true') throw new Error('O filtro "todas" deveria começar ativo, com aria-pressed="true".'); if (document.querySelectorAll('li').length !== 2) throw new Error('Em todas, as 2 tarefas aparecem.');`,
          },
          {
            description: 'pendentes mostra só Praticar; feitas mostra só Estudar',
            assertion: `await clicar(botao('pendentes')); let t = textos('li'); if (JSON.stringify(t) !== '["Praticar"]') throw new Error('Em pendentes esperava só Praticar, veio ' + JSON.stringify(t)); if (botao('pendentes').getAttribute('aria-pressed') !== 'true' || botao('todas').getAttribute('aria-pressed') === 'true') throw new Error('Só o filtro ativo tem aria-pressed="true".'); await clicar(botao('feitas')); t = textos('li'); if (JSON.stringify(t) !== '["Estudar"]') throw new Error('Em feitas esperava só Estudar, veio ' + JSON.stringify(t));`,
          },
          {
            description: 'o filtro é derivado: marcar Estudar como pendente a tira de feitas, e o vazio do filtro aparece',
            assertion: `await clicar(document.querySelector('li input[type="checkbox"]')); if (document.querySelectorAll('li').length !== 0) throw new Error('Desmarcada, Estudar sai do filtro feitas.'); if (!textos('p').includes('Nada por aqui neste filtro.')) throw new Error('Com tarefas mas nenhuma no filtro, esperava "Nada por aqui neste filtro.".'); await clicar(botao('todas')); if (document.querySelectorAll('li').length !== 2) throw new Error('Em todas, as duas continuam existindo — o filtro não muda a lista original.');`,
          },
        ],
        hints: [
          '`const [filtro, setFiltro] = React.useState<Filtro>(\'todas\')` e `const visiveis = tarefas.filter(...)` conforme o filtro. Renderize `visiveis`, não `tarefas`.',
          'Os botões: `(["todas", "pendentes", "feitas"] as Filtro[]).map((f) => <button key={f} aria-pressed={filtro === f} onClick={() => setFiltro(f)}>{f}</button>)`. O vazio: `tarefas.length > 0 && visiveis.length === 0`.',
        ],
        solution: `interface Tarefa {
  id: number;
  titulo: string;
  feita: boolean;
}

type Filtro = 'todas' | 'pendentes' | 'feitas';

const INICIAIS: Tarefa[] = [
  { id: 1, titulo: 'Estudar', feita: true },
  { id: 2, titulo: 'Praticar', feita: false },
];

const FILTROS: Filtro[] = ['todas', 'pendentes', 'feitas'];

function App() {
  const [tarefas, setTarefas] = React.useState(INICIAIS);
  const [filtro, setFiltro] = React.useState<Filtro>('todas');

  const visiveis = tarefas.filter((t) =>
    filtro === 'todas' ? true : filtro === 'feitas' ? t.feita : !t.feita
  );

  function alternar(id: number) {
    setTarefas(tarefas.map((x) => (x.id === id ? { ...x, feita: !x.feita } : x)));
  }

  return (
    <div>
      <div>
        {FILTROS.map((f) => (
          <button key={f} aria-pressed={filtro === f} onClick={() => setFiltro(f)}>
            {f}
          </button>
        ))}
      </div>
      {tarefas.length > 0 && visiveis.length === 0 && <p>Nada por aqui neste filtro.</p>}
      <ul>
        {visiveis.map((t) => (
          <li key={t.id} className={t.feita ? 'feita' : ''}>
            <label>
              <input type="checkbox" checked={t.feita} onChange={() => alternar(t.id)} />
              {t.titulo}
            </label>
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
        id: 'ex-react-14-pronto',
        type: 'multiple-choice',
        prompt: 'A lista de tarefas adiciona, marca, remove, filtra e persiste. Você tem uma tarde livre. O que a aula recomenda?',
        concepts: ['react-projeto'],
        difficulty: 'iniciante',
        tags: ['react', 'projeto'],
        options: [
          'Começar a sincronização com um servidor, porque é o próximo recurso',
          'Conferir o que "pronto" significa: cada estado da tela tem cara, cada ação tem resposta, o teclado percorre tudo, recarregar não perde nada — e só depois crescer',
          'Reescrever com contexto e `useReducer`, porque é mais profissional',
          'Adicionar `memo` em todos os componentes',
        ],
        correctIndex: 1,
        explanation:
          'Terminar vem antes de crescer. Os critérios de pronto são os das aulas de UI: estados com cara, respostas visíveis, teclado, persistência. Um projeto que cresce antes de terminar acumula meio-recursos. Reescrever a arquitetura sem motivo e otimizar sem medir são os dois reflexos que a trilha inteira desaconselhou.',
        hints: ['O que separa "funciona" de "pronto"?'],
      },
    },
    {
      kind: 'summary',
      markdown: `Um projeto é ordem: o estado desenhado antes da tela (e o que deriva, fora dele), componentes por responsabilidade com dados descendo e eventos subindo, e fatias verticais que deixam o aplicativo funcionando a cada passo. Persistir é \`JSON\` com uma guarda na leitura. Pronto é quando cada estado tem cara, cada ação tem resposta, o teclado percorre tudo e recarregar não perde nada — e é aí que a trilha de React termina e o seu próximo projeto começa.`,
    },
  ],
};

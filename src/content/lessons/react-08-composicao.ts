import type { Lesson } from '../types';

export const lessonComposicao: Lesson = {
  id: 'lesson-react-8',
  trackId: 'track-react',
  title: 'Composição: Dados Descem, Eventos Sobem',
  language: 'react',
  objective:
    'Compor componentes com children, subir o estado para o pai quando dois irmãos precisam dele, e fazer um componente controlado pelo pai — sem duplicar estado.',
  concepts: ['react-composicao'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um componente é pequeno porque outros fazem o resto. Esta aula é sobre como eles se encaixam: o que passa de um para outro, em que direção, e onde o estado mora quando dois precisam dele.

## \`children\`: o que vai dentro

~~~tsx
function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="cartao">
      <h2>{titulo}</h2>
      {children}
    </section>
  );
}

<Cartao titulo="Perfil">
  <p>Ana, design</p>
  <button>Editar</button>
</Cartao>
~~~

O que você escreve entre a tag de abrir e a de fechar chega como a prop \`children\`. É como se faz um componente de **moldura** — cartão, modal, painel, layout — que não sabe o que vai dentro e não precisa saber. O \`Cartao\` cuida do título e da borda; o conteúdo é de quem usa.

## Dados descem, eventos sobem

~~~tsx
function Contador({ valor, aoMudar }: { valor: number; aoMudar: (novo: number) => void }) {
  return (
    <div>
      <button onClick={() => aoMudar(valor - 1)}>-</button>
      <span>{valor}</span>
      <button onClick={() => aoMudar(valor + 1)}>+</button>
    </div>
  );
}
~~~

Este \`Contador\` **não tem estado**. Recebe o valor por prop e avisa por prop quando quer mudar. Quem tem o estado é o pai:

~~~tsx
function App() {
  const [quantidade, setQuantidade] = React.useState(1);
  return (
    <>
      <Contador valor={quantidade} aoMudar={setQuantidade} />
      <p>Total: R$ {(quantidade * 3.5).toFixed(2)}</p>
    </>
  );
}
~~~

A regra tem nome: **dados descem por props, eventos sobem por funções**. O filho nunca muda o que recebe — ele pede, e o pai decide. Um componente assim se chama **controlado** pelo pai, exatamente como o \`<input value onChange>\` da aula de formulários é controlado pelo componente.

## Subir o estado

Quando dois irmãos precisam do mesmo dado — o \`Contador\` e o \`<p>\` do total —, o estado não pode ficar em nenhum deles: fica no **pai comum mais próximo**, e desce para os dois. É a decisão que resolve "como o componente A avisa o componente B?": não avisa; os dois olham para o pai.

Subir o estado é o padrão. Duplicá-lo — um estado no pai e uma cópia no filho, sincronizados por efeito — é o anti-padrão: duas fontes de verdade que vão se desencontrar.

## Um componente por responsabilidade

Um \`App\` de 200 linhas com filtro, lista, formulário e resumo é uma função de 200 linhas: a mesma regra das funções vale. Corte por **responsabilidade**: o filtro é um componente que recebe \`valor\` e \`aoMudar\`; a lista recebe \`itens\` e \`aoRemover\`; o formulário recebe \`aoAdicionar\`. O \`App\` fica sendo só o dono do estado e a cola entre eles — e cabe numa tela.

Sinais de que é hora de cortar: um trecho do JSX pede comentário; um pedaço tem estado próprio que o resto não usa (o "aberto" de um painel); um pedaço aparece duas vezes.

## Props demais

Se um dado precisa passar por três componentes que não o usam só para chegar ao quarto, isso tem nome — \`prop drilling\` — e tem remédio, que é a próxima aula: contexto. Antes de chegar lá, confira se \`children\` não resolve: muitas vezes o componente do meio só precisava de um buraco para o conteúdo passar.

## Erros

- Estado duplicado no pai e no filho.
- Filho que muta a prop que recebeu.
- Um componente para cada tag (cortar de menos é ruim; de mais também).
- \`children\` esquecido no tipo das props: \`<Cartao>…</Cartao>\` é recusado até você declará-lo.
`.trim(),
    },
    {
      kind: 'example',
      language: 'tsx',
      code: `interface Item { id: number; nome: string; preco: number }

function Painel({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2>{titulo}</h2>
      {children}
    </section>
  );
}

function Quantidade({ valor, aoMudar }: { valor: number; aoMudar: (n: number) => void }) {
  return (
    <span>
      <button onClick={() => aoMudar(Math.max(0, valor - 1))}>-</button>
      {valor}
      <button onClick={() => aoMudar(valor + 1)}>+</button>
    </span>
  );
}

function App() {
  const itens: Item[] = [
    { id: 1, nome: 'Caderno', preco: 20 },
    { id: 2, nome: 'Caneta', preco: 3.5 },
  ];
  const [quantidades, setQuantidades] = React.useState<Record<number, number>>({ 1: 1, 2: 2 });

  const total = itens.reduce((soma, item) => soma + item.preco * (quantidades[item.id] ?? 0), 0);

  function mudar(id: number, n: number) {
    setQuantidades({ ...quantidades, [id]: n });
  }

  return (
    <Painel titulo="Carrinho">
      <ul>
        {itens.map((item) => (
          <li key={item.id}>
            {item.nome} <Quantidade valor={quantidades[item.id] ?? 0} aoMudar={(n) => mudar(item.id, n)} />
          </li>
        ))}
      </ul>
      <p>Total: R$ {total.toFixed(2)}</p>
    </Painel>
  );
}`,
      caption:
        '`Painel` é moldura: não sabe o que vai dentro. `Quantidade` é controlado: recebe o valor, pede a mudança. O estado — as quantidades — mora no `App`, que é o pai comum da lista e do total; o total é derivado dele.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-8-onde',
        type: 'multiple-choice',
        prompt: 'Um `Filtro` e uma `Lista` são irmãos, e a lista precisa saber o texto do filtro. Onde o estado do filtro mora?',
        concepts: ['react-composicao'],
        difficulty: 'iniciante',
        tags: ['react', 'composicao'],
        options: [
          'No `Filtro`, que avisa a `Lista` diretamente',
          'No pai comum dos dois: ele guarda o texto, passa `valor` e `aoMudar` ao `Filtro` e o texto (ou a lista já filtrada) à `Lista`',
          'Nos dois, sincronizados por um efeito',
          'Numa variável global fora dos componentes',
        ],
        correctIndex: 1,
        explanation:
          'Componentes irmãos não se falam. O dado que dois precisam sobe para o pai comum mais próximo e desce por props: o `Filtro` recebe o valor e a função para pedir mudança; a `Lista` recebe o que precisa mostrar. Duplicar em dois estados sincronizados cria duas fontes de verdade; a variável global some com a reatividade — o React não redesenha quando ela muda.',
        hints: ['Quem é o pai comum mais próximo? É lá que o estado fica.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-8-children',
        type: 'code',
        prompt:
          'Escreva `Cartao`, um componente de moldura: recebe `titulo` e `children`, e devolve uma `<section class="cartao">` com um `<h2>` do título e, abaixo, o conteúdo. Em `App`, use-o duas vezes: "Perfil" contendo `<p>Ana</p>` e "Ajuda" contendo um `<button>Falar com alguém</button>`.',
        concepts: ['react-composicao'],
        difficulty: 'iniciante',
        tags: ['react', 'composicao', 'children'],
        initialCode: `function App() {
  return (
    <section className="cartao">
      <h2>Perfil</h2>
      <p>Ana</p>
    </section>
  );
}
`,
        tests: [
          {
            description: 'há duas seções com a classe cartao, com os títulos Perfil e Ajuda',
            assertion: `const s = document.querySelectorAll('section.cartao'); if (s.length !== 2) throw new Error('Esperava duas <section class="cartao">, encontrei ' + s.length + '.'); const t = textos('section.cartao > h2'); if (JSON.stringify(t) !== JSON.stringify(['Perfil', 'Ajuda'])) throw new Error('Esperava os títulos Perfil e Ajuda, veio ' + JSON.stringify(t));`,
          },
          {
            description: 'o conteúdo de cada cartão é o que foi passado entre as tags',
            assertion: `const [a, b] = document.querySelectorAll('section.cartao'); if (!a.querySelector('p') || texto(a.querySelector('p')) !== 'Ana') throw new Error('O cartão Perfil deveria conter <p>Ana</p>.'); if (!b.querySelector('button') || texto(b.querySelector('button')) !== 'Falar com alguém') throw new Error('O cartão Ajuda deveria conter o botão "Falar com alguém".');`,
          },
        ],
        hints: [
          '`function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode })` — e renderize `{children}` depois do `<h2>`.',
          'No `App`: `<Cartao titulo="Perfil"><p>Ana</p></Cartao>` — o que vai entre as tags chega em `children`.',
        ],
        solution: `function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="cartao">
      <h2>{titulo}</h2>
      {children}
    </section>
  );
}

function App() {
  return (
    <>
      <Cartao titulo="Perfil">
        <p>Ana</p>
      </Cartao>
      <Cartao titulo="Ajuda">
        <button>Falar com alguém</button>
      </Cartao>
    </>
  );
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-8-lacuna-controlado',
        type: 'fill-blank',
        prompt: 'Complete o componente controlado e o pai que o controla: o tipo da função que sobe, a chamada dela, e o estado que desce.',
        concepts: ['react-composicao'],
        difficulty: 'intermediario',
        tags: ['react', 'composicao'],
        template: `function Alternar({ ligado, aoMudar }: { ligado: boolean; aoMudar: {{1}} }) {
  return (
    <button onClick={() => {{2}}}>{ligado ? 'Ligado' : 'Desligado'}</button>
  );
}

function App() {
  const [notificacoes, setNotificacoes] = React.useState(false);
  return (
    <div>
      <Alternar ligado={{{3}}} aoMudar={setNotificacoes} />
      <p>{notificacoes ? 'Você receberá avisos.' : 'Sem avisos.'}</p>
    </div>
  );
}`,
        blanks: [
          { placeholder: 'tipo', size: 24 },
          { placeholder: 'chamada', size: 16 },
          { placeholder: 'estado', size: 13 },
        ],
        tests: [
          {
            description: 'começa desligado, e o texto do pai concorda',
            assertion: `botao('Desligado'); if (texto('p') !== 'Sem avisos.') throw new Error('Esperava "Sem avisos.", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: 'clicar liga: o botão e o texto do pai mudam juntos',
            assertion: `await clicar(botao('Desligado')); botao('Ligado'); if (texto('p') !== 'Você receberá avisos.') throw new Error('Esperava "Você receberá avisos.", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: 'clicar de novo desliga',
            assertion: `await clicar(botao('Ligado')); botao('Desligado'); if (texto('p') !== 'Sem avisos.') throw new Error('Esperava "Sem avisos." de novo.');`,
          },
        ],
        hints: [
          'A função que sobe recebe o valor novo (um booleano) e não devolve nada: uma assinatura com seta.',
          'O filho pede o contrário do que tem; o pai passa o próprio estado para baixo.',
        ],
        solution: ['(ligado: boolean) => void', 'aoMudar(!ligado)', 'notificacoes'],
        explanation:
          '`Alternar` não tem estado: mostra `ligado` e, no clique, pede `aoMudar(!ligado)`. O pai é dono de `notificacoes`, passa-o para baixo e entrega o próprio `setNotificacoes` como `aoMudar` — dados descem, eventos sobem. O `<p>` do pai e o botão do filho mudam juntos porque leem a mesma fonte.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-8-bug-children',
        type: 'find-bug',
        prompt:
          "O compilador recusa: `Type '{ children: Element; titulo: string; }' is not assignable to type 'IntrinsicAttributes & { titulo: string; }'`. Aponte a linha que precisa mudar.",
        concepts: ['react-composicao'],
        difficulty: 'iniciante',
        tags: ['react', 'composicao', 'depuracao'],
        code: `function Painel({ titulo }: { titulo: string }) {
  return (
    <section>
      <h2>{titulo}</h2>
    </section>
  );
}

function App() {
  return (
    <Painel titulo="Resumo">
      <p>Três itens no carrinho.</p>
    </Painel>
  );
}`,
        buggyLine: 1,
        fix: 'function Painel({ titulo, children }: { titulo: string; children: React.ReactNode }) {',
        symptomLine: 11,
        symptomFeedback:
          'É onde o erro aparece: o `<Painel>` sendo usado com conteúdo dentro. Mas a linha está certa — o problema é a declaração do `Painel` não prever conteúdo nenhum.',
        explanation:
          'O que vai entre `<Painel>` e `</Painel>` chega como a prop `children`, e o tipo das props do `Painel` não a declara — o compilador recusa o uso, como recusaria qualquer prop desconhecida. Declarar `children: React.ReactNode` (e renderizá-lo com `{children}`) é o que transforma o `Painel` numa moldura. Repare que só declarar já faz o erro sumir; sem o `{children}` no JSX, o conteúdo chegaria e não apareceria.',
        hints: [
          'O conteúdo entre as tags chega por uma prop com nome fixo. Ela está declarada?',
          'Olhe as props que o `Painel` diz aceitar.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-8-duplicado',
        type: 'multiple-choice',
        prompt: 'Um `Slider` recebe `valor` por prop e também guarda `const [interno, setInterno] = useState(valor)`, sincronizando os dois com um efeito. O que a aula diz disso?',
        concepts: ['react-composicao'],
        difficulty: 'intermediario',
        tags: ['react', 'composicao', 'estado'],
        options: [
          'É o padrão correto para componentes controlados',
          'É estado duplicado: duas fontes de verdade que se desencontram (o efeito atrasa uma renderização, e uma mudança interna não chega ao pai); o `Slider` deve só mostrar `valor` e pedir a mudança por `aoMudar`',
          'Funciona, desde que o efeito não tenha lista de dependências',
          'É necessário sempre que a prop pode mudar',
        ],
        correctIndex: 1,
        explanation:
          'A cópia interna nasce igual à prop e diverge na primeira mudança que não passar pelo efeito — e, quando passa, há uma renderização com o valor velho antes de o efeito corrigir. O componente controlado não guarda nada: o valor vem de cima e a mudança sobe. Uma fonte de verdade, no pai.',
        hints: ['Quantos lugares guardam o valor? Quantos deveriam?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-8-subir',
        type: 'code',
        prompt:
          'Escreva três componentes e o `App` que os cola. `Busca` é controlado: recebe `valor` e `aoMudar`, e renderiza um campo de rótulo `Buscar`. `Lista` recebe `itens` (texto) e mostra-os em `<li>`. `Resumo` recebe `total` e mostra `N resultado(s)`. O `App` guarda o texto da busca, filtra `PRODUTOS` (sem diferenciar maiúsculas) e passa a lista filtrada para os dois irmãos.',
        concepts: ['react-composicao'],
        difficulty: 'intermediario',
        tags: ['react', 'composicao', 'estado'],
        initialCode: `const PRODUTOS = ['Caderno', 'Caneta', 'Lápis', 'Borracha'];

function App() {
  return (
    <div>
      <label>
        Buscar <input />
      </label>
      <ul></ul>
      <p>0 resultado(s)</p>
    </div>
  );
}
`,
        tests: [
          {
            description: 'sem busca, os quatro produtos e o resumo 4 resultado(s)',
            assertion: `if (document.querySelectorAll('li').length !== 4) throw new Error('Esperava 4 <li>.'); if (texto('p') !== '4 resultado(s)') throw new Error('Esperava "4 resultado(s)", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: "digitar 'ca' filtra a lista e o resumo concorda",
            assertion: `await digitar(campo('Buscar'), 'ca'); const t = textos('li'); if (JSON.stringify(t) !== JSON.stringify(['Caderno', 'Caneta'])) throw new Error("Com 'ca' esperava Caderno e Caneta, veio " + JSON.stringify(t)); if (texto('p') !== '2 resultado(s)') throw new Error('Esperava "2 resultado(s)", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: 'o campo é controlado pelo App',
            assertion: `if (campo('Buscar').value !== 'ca') throw new Error('O campo deveria mostrar o valor que o App guarda.'); await digitar(campo('Buscar'), ''); if (document.querySelectorAll('li').length !== 4) throw new Error('Apagar a busca deveria trazer os 4 de volta.');`,
          },
          {
            description: 'existem os três componentes, e só o App tem o estado',
            assertion: `for (const nome of ['Busca', 'Lista', 'Resumo']) { if (typeof window[nome] !== 'function') throw new Error('Falta o componente ' + nome + ' (declare com function).'); } const fonte = String(window.Busca) + String(window.Lista) + String(window.Resumo); if (/useState/.test(fonte)) throw new Error('Busca, Lista e Resumo não guardam estado: o estado mora no App e desce por props.');`,
          },
        ],
        hints: [
          'No `App`: `const [busca, setBusca] = React.useState(\'\')` e `const visiveis = PRODUTOS.filter(...)`. `Busca` recebe `valor={busca} aoMudar={setBusca}`; `Lista` recebe `itens={visiveis}`; `Resumo` recebe `total={visiveis.length}`.',
          'Declare os três com `function` no topo do arquivo. `Busca` renderiza `<label>Buscar <input value={valor} onChange={(e) => aoMudar(e.target.value)} /></label>`.',
        ],
        solution: `const PRODUTOS = ['Caderno', 'Caneta', 'Lápis', 'Borracha'];

function Busca({ valor, aoMudar }: { valor: string; aoMudar: (v: string) => void }) {
  return (
    <label>
      Buscar <input value={valor} onChange={(e) => aoMudar(e.target.value)} />
    </label>
  );
}

function Lista({ itens }: { itens: string[] }) {
  return (
    <ul>
      {itens.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Resumo({ total }: { total: number }) {
  return <p>{total} resultado(s)</p>;
}

function App() {
  const [busca, setBusca] = React.useState('');
  const visiveis = PRODUTOS.filter((p) => p.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div>
      <Busca valor={busca} aoMudar={setBusca} />
      <Lista itens={visiveis} />
      <Resumo total={visiveis.length} />
    </div>
  );
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `\`children\` faz a moldura: o componente não sabe o que vai dentro. Dados descem por props, eventos sobem por funções; o filho nunca muda o que recebe — pede, e o pai decide. O que dois irmãos precisam mora no pai comum mais próximo, uma vez só: duplicar e sincronizar é o anti-padrão. Corte por responsabilidade, e deixe o \`App\` ser dono do estado e cola entre as partes.`,
    },
  ],
};

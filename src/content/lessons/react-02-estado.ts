import type { Lesson } from '../types';

export const lessonEstado: Lesson = {
  id: 'lesson-react-2',
  trackId: 'track-react',
  title: 'Estado: A Tela como Função dos Dados',
  language: 'react',
  objective:
    'Guardar o que muda com useState, atualizar por eventos, e deixar o React redesenhar — sem tocar no DOM, sem mutar o estado, e sem guardar o que se calcula.',
  concepts: ['react-estado'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um componente que só recebe props é uma foto. Uma interface de verdade muda: o contador sobe, o campo recebe texto, o painel abre. Em React, o que muda se chama **estado**, e a regra inteira cabe numa frase: **você muda o estado, o React redesenha.**

## \`useState\`

~~~tsx
function Contador() {
  const [contagem, setContagem] = React.useState(0);

  return (
    <button onClick={() => setContagem(contagem + 1)}>
      Cliques: {contagem}
    </button>
  );
}
~~~

\`useState(0)\` declara um valor que o componente lembra entre renderizações, começando em 0. Devolve um par: o valor atual e a função que o troca. Chamar \`setContagem(5)\` faz duas coisas: guarda o 5 e **pede ao React que rode o componente de novo**. Na nova execução, \`contagem\` vale 5, o JSX é produzido de novo, e o React aplica no DOM só o que mudou — o texto do botão.

Repare no que **não** acontece: ninguém procura o botão com \`querySelector\` para trocar o texto. Na trilha da página, a função \`desenhar\` era chamada à mão depois de cada mudança; aqui, o React a chama por você. O componente inteiro é a função \`desenhar\`.

## Eventos

\`onClick={() => setContagem(contagem + 1)}\` — o manipulador vai entre chaves, e é uma **função**, não uma chamada. \`onClick={setContagem(1)}\` chamaria na hora de renderizar, mudaria o estado, renderizaria de novo, chamaria de novo: laço infinito. É o erro mais comum da primeira semana.

O evento chega como argumento quando você precisa dele: \`onChange={(e) => setNome(e.target.value)}\`.

## O estado é do componente

Cada componente montado tem o seu. Três \`<Contador />\` são três contagens independentes; quando um some da tela, o estado dele some junto. Estado que precisa ser compartilhado sobe para o pai — assunto da aula de composição.

## Nunca mute; substitua

~~~tsx
// @recusado
const [itens, setItens] = React.useState<string[]>([]);

itens.push('novo');          // muta a lista que o React já conhece
setItens(itens);             // "nada mudou": mesma referência, sem redesenho
~~~

O React decide se redesenha comparando o valor novo com o antigo por **identidade**. A lista mutada é o mesmo objeto, então ele conclui que nada mudou. A regra da aula de imutabilidade vale aqui como lei: crie um valor novo.

~~~tsx
setItens([...itens, 'novo']);                       // lista nova
setUsuario({ ...usuario, nome: 'Ana' });            // objeto novo
setItens(itens.filter((i) => i !== 'velho'));       // filter devolve nova
~~~

## Atualizar a partir do anterior

~~~tsx
setContagem(contagem + 1);
setContagem(contagem + 1);   // ainda vê o valor antigo: sobe 1, não 2
~~~

\`contagem\` é o valor da renderização atual — uma foto. Duas chamadas seguidas leem a mesma foto. Quando o novo valor depende do anterior, passe uma função: \`setContagem((atual) => atual + 1)\`. O React a chama com o valor mais recente, na ordem, e as duas somam.

## Não guarde o que se calcula

~~~tsx
// @recusado
const [itens, setItens] = React.useState<string[]>([]);
const [total, setTotal] = React.useState(0);   // redundante: é itens.length
~~~

Dois estados que precisam andar juntos vão se desencontrar. Se dá para calcular a partir do que já existe, calcule na renderização: \`const total = itens.length\`. Estado é só o que **não** se deduz — o que a pessoa fez.

## Erros

- \`onClick={f()}\` em vez de \`onClick={f}\` ou \`onClick={() => f()}\`.
- Mutar e depois \`set\` com o mesmo objeto.
- \`set\` duas vezes com o valor da foto, esperando somar.
- Estado para valor derivado.
- Mexer no DOM por fora (\`document.querySelector(...).textContent = …\`): o React sobrescreve na próxima renderização.
`.trim(),
    },
    {
      kind: 'example',
      language: 'tsx',
      code: `function App() {
  const [itens, setItens] = React.useState<string[]>([]);
  const [novo, setNovo] = React.useState('');

  // Derivado, não guardado: recalculado a cada renderização.
  const total = itens.length;

  function adicionar() {
    if (novo.trim() === '') return;
    setItens([...itens, novo.trim()]);   // lista nova, nunca push
    setNovo('');
  }

  return (
    <div>
      <input value={novo} onChange={(e) => setNovo(e.target.value)} placeholder="Item" />
      <button onClick={adicionar}>Adicionar</button>
      <p>{total} {total === 1 ? 'item' : 'itens'}</p>
      <ul>
        {itens.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}`,
      caption:
        'Dois estados — a lista e o texto do campo — e um valor derivado. `adicionar` cria uma lista nova e limpa o campo; o React redesenha o `<p>` e o `<ul>`. A `key` do `map` é assunto da próxima aula.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-2-set',
        type: 'multiple-choice',
        prompt: 'O que acontece quando você chama `setContagem(5)`?',
        concepts: ['react-estado'],
        difficulty: 'iniciante',
        tags: ['react', 'estado'],
        options: [
          'A variável `contagem` muda na hora, e o DOM é atualizado por você em seguida',
          'O React guarda o 5 e agenda uma nova execução do componente; na próxima renderização, `contagem` vale 5 e o JSX novo é aplicado ao DOM',
          'O React troca o texto do botão diretamente, sem rodar o componente',
          'A função devolve o JSX atualizado',
        ],
        correctIndex: 1,
        explanation:
          '`setContagem` não muda a variável da renderização atual — `contagem` continua 0 até o fim desta execução. Ela guarda o valor novo e pede outra execução. É nela que `contagem` vale 5, o JSX sai diferente, e o React compara com o anterior e toca só no que mudou. Você nunca atualiza o DOM: você descreve a tela para um estado, e troca o estado.',
        hints: ['Lembre da função `desenhar` da trilha da página: quem a chama agora?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-2-contador',
        type: 'code',
        prompt:
          'Escreva `App` com um contador: um `<p>` mostrando `Contagem: N`, um botão `+1`, um botão `-1` e um botão `Zerar`. A contagem começa em 0.',
        concepts: ['react-estado'],
        difficulty: 'iniciante',
        tags: ['react', 'estado', 'eventos'],
        initialCode: `function App() {
  return <p>Contagem: 0</p>;
}
`,
        tests: [
          {
            description: 'começa em Contagem: 0',
            assertion: `if (texto('p') !== 'Contagem: 0') throw new Error('Esperava "Contagem: 0", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: '+1 três vezes chega a 3',
            assertion: `await clicar(botao('+1')); await clicar(botao('+1')); await clicar(botao('+1')); if (texto('p') !== 'Contagem: 3') throw new Error('Depois de três +1 esperava "Contagem: 3", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: '-1 desce e Zerar volta a 0',
            assertion: `await clicar(botao('-1')); if (texto('p') !== 'Contagem: 2') throw new Error('Depois de -1 esperava "Contagem: 2", veio ' + JSON.stringify(texto('p'))); await clicar(botao('Zerar')); if (texto('p') !== 'Contagem: 0') throw new Error('Depois de Zerar esperava "Contagem: 0", veio ' + JSON.stringify(texto('p')));`,
          },
        ],
        hints: [
          '`const [contagem, setContagem] = React.useState(0);` e o `<p>` mostra `{contagem}`.',
          'Cada botão tem um `onClick` com uma função: `() => setContagem(contagem + 1)`, `() => setContagem(contagem - 1)`, `() => setContagem(0)`.',
        ],
        solution: `function App() {
  const [contagem, setContagem] = React.useState(0);
  return (
    <div>
      <p>Contagem: {contagem}</p>
      <button onClick={() => setContagem(contagem + 1)}>+1</button>
      <button onClick={() => setContagem(contagem - 1)}>-1</button>
      <button onClick={() => setContagem(0)}>Zerar</button>
    </div>
  );
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-2-lacuna-lista',
        type: 'fill-blank',
        prompt: 'Complete: o estado inicial da lista, a atualização **sem mutar**, e o valor derivado.',
        concepts: ['react-estado'],
        difficulty: 'iniciante',
        tags: ['react', 'estado', 'imutabilidade'],
        template: `function App() {
  const [itens, setItens] = React.useState<string[]>({{1}});
  const total = {{2}};

  function adicionar() {
    setItens({{3}});
  }

  return (
    <div>
      <button onClick={adicionar}>Adicionar</button>
      <p>{total} itens</p>
      <ul>{itens.map((item, i) => <li key={i}>{item}</li>)}</ul>
    </div>
  );
}`,
        blanks: [
          { placeholder: 'inicial', size: 4 },
          { placeholder: 'derivado', size: 14 },
          { placeholder: 'lista nova', size: 20 },
        ],
        tests: [
          {
            description: 'começa com 0 itens',
            assertion: `if (texto('p') !== '0 itens') throw new Error('Esperava "0 itens", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: 'cada clique acrescenta um item, e a contagem acompanha',
            assertion: `await clicar(botao('Adicionar')); await clicar(botao('Adicionar')); if (document.querySelectorAll('li').length !== 2) throw new Error('Esperava 2 <li> depois de dois cliques, encontrei ' + document.querySelectorAll('li').length); if (texto('p') !== '2 itens') throw new Error('Esperava "2 itens", veio ' + JSON.stringify(texto('p')));`,
          },
        ],
        hints: [
          'A lista começa vazia; o total é uma propriedade da lista, calculada na hora.',
          'Uma lista nova com os itens antigos mais um: espalhamento com `...` e um texto qualquer no fim.',
        ],
        solution: ['[]', 'itens.length', "[...itens, 'novo']"],
        explanation:
          '`[]` é o estado inicial; `itens.length` é derivado — recalculado a cada renderização, nunca guardado num segundo estado que poderia se desencontrar; e `[...itens, \'novo\']` é uma lista **nova**, que o React reconhece como mudança. `itens.push(\'novo\')` seguido de `setItens(itens)` não redesenharia nada: mesma referência, "nada mudou".',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-2-bug-chamada',
        type: 'find-bug',
        prompt:
          "O compilador recusa este componente: `Type 'void' is not assignable to type '(evento: MouseEvent) => void'`. Em JavaScript sem tipos ele travaria a página, e o React interromperia com \"Too many re-renders\". Aponte a linha que precisa mudar.",
        concepts: ['react-estado'],
        difficulty: 'iniciante',
        tags: ['react', 'estado', 'depuracao'],
        code: `function App() {
  const [aberto, setAberto] = React.useState(false);

  return (
    <div>
      <button onClick={setAberto(!aberto)}>
        {aberto ? 'Fechar' : 'Abrir'}
      </button>
      {aberto && <p>Conteúdo do painel</p>}
    </div>
  );
}`,
        buggyLine: 6,
        fix: '      <button onClick={() => setAberto(!aberto)}>',
        explanation:
          '`onClick={setAberto(!aberto)}` **chama** `setAberto` durante a renderização, e passa o resultado (`undefined`, tipo `void`) como manipulador — e o compilador recusa, porque `onClick` pede uma função. Sem tipos, o programa rodaria: chamar `set` na renderização agenda outra renderização, que chama de novo, que agenda de novo, até o React desistir com "Too many re-renders". O manipulador precisa ser uma função que o React chama **no clique**: `() => setAberto(!aberto)`. É a diferença entre entregar a receita e entregar o bolo.',
        hints: [
          'O manipulador de evento precisa ser uma função. O que há entre as chaves do `onClick`?',
          'Compare com o exemplo da aula: `onClick={() => …}`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-2-anterior',
        type: 'multiple-choice',
        prompt: 'Com `contagem` valendo 0, um clique executa `setContagem(contagem + 1); setContagem(contagem + 1);`. Quanto vale a contagem depois?',
        concepts: ['react-estado'],
        difficulty: 'intermediario',
        tags: ['react', 'estado'],
        options: [
          '2',
          '1: as duas chamadas leem o mesmo `contagem` da renderização atual (0) e pedem 1; para somar duas vezes, passe uma função: `setContagem((atual) => atual + 1)`',
          '0, porque duas atualizações se cancelam',
          'Depende do navegador',
        ],
        correctIndex: 1,
        explanation:
          '`contagem` é o valor desta renderização — uma foto, e ela não muda no meio do clique. As duas chamadas dizem "o novo valor é 0 + 1". A forma com função recebe o valor mais recente a cada vez: a primeira faz 0 → 1, a segunda 1 → 2. Regra: quando o novo depende do anterior, `set((atual) => …)`.',
        hints: ['O que `contagem` vale na segunda chamada? A variável mudou?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-2-alternar',
        type: 'code',
        prompt:
          'Escreva `App` com um painel que abre e fecha: um botão cujo texto é `Abrir` quando o painel está fechado e `Fechar` quando está aberto; o `<p>` com `Conteúdo secreto` só existe no DOM enquanto o painel está aberto. Começa fechado.',
        concepts: ['react-estado'],
        difficulty: 'iniciante',
        tags: ['react', 'estado', 'condicional'],
        initialCode: `function App() {
  return <button>Abrir</button>;
}
`,
        tests: [
          {
            description: 'começa fechado: botão Abrir e nenhum <p>',
            assertion: `botao('Abrir'); if (document.querySelector('p')) throw new Error('Fechado, o <p> não deveria existir no DOM.');`,
          },
          {
            description: 'clicar abre: o botão vira Fechar e o conteúdo aparece',
            assertion: `await clicar(botao('Abrir')); botao('Fechar'); if (texto('p') !== 'Conteúdo secreto') throw new Error('Aberto, esperava um <p> com "Conteúdo secreto", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: 'clicar de novo fecha',
            assertion: `await clicar(botao('Fechar')); botao('Abrir'); if (document.querySelector('p')) throw new Error('Depois de fechar, o <p> deveria sumir do DOM.');`,
          },
        ],
        hints: [
          'Um estado booleano: `const [aberto, setAberto] = React.useState(false)`.',
          'O texto do botão é um ternário; o conteúdo entra com `{aberto && <p>…</p>}` — `false` no JSX não renderiza nada.',
        ],
        solution: `function App() {
  const [aberto, setAberto] = React.useState(false);
  return (
    <div>
      <button onClick={() => setAberto(!aberto)}>{aberto ? 'Fechar' : 'Abrir'}</button>
      {aberto && <p>Conteúdo secreto</p>}
    </div>
  );
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Estado é o que muda: \`useState\` devolve o valor e a função que o troca, e trocar pede ao React que rode o componente de novo — o componente inteiro é a função \`desenhar\`. Manipulador é função, não chamada. Nunca mute: crie a lista ou o objeto novo. Quando o novo depende do anterior, \`set((atual) => …)\`. Não guarde o que se calcula. E nunca toque no DOM por fora: o React sobrescreve.`,
    },
  ],
};

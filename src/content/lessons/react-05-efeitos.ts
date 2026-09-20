import type { Lesson } from '../types';

export const lessonEfeitos: Lesson = {
  id: 'lesson-react-5',
  trackId: 'track-react',
  title: 'Efeitos: O que Acontece Fora da Tela',
  language: 'react',
  objective:
    'Usar useEffect para sincronizar o componente com o mundo de fora — título, temporizadores, armazenamento —, declarar as dependências certas, limpar o que foi criado, e reconhecer o que não é efeito.',
  concepts: ['react-efeitos'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Renderizar é calcular JSX a partir de props e estado. Um componente puro faz só isso — e é por isso que o React pode chamá-lo quantas vezes quiser. Mas um aplicativo precisa tocar o mundo de fora: mudar o título da aba, ligar um temporizador, guardar no armazenamento, buscar dados. Isso é **efeito**, e tem lugar próprio.

## \`useEffect\`

~~~tsx
function Contador() {
  const [n, setN] = React.useState(0);

  React.useEffect(() => {
    document.title = 'Cliques: ' + n;
  }, [n]);

  return <button onClick={() => setN(n + 1)}>+1</button>;
}
~~~

\`useEffect(funcao, dependencias)\`: o React roda a função **depois** de aplicar a renderização no DOM, e só quando algum item das dependências mudou. Aqui, sempre que \`n\` muda, o título acompanha. O componente descreve a tela; o efeito sincroniza o que está fora dela.

## As dependências

A lista diz **quando** rodar:

- \`[n]\` — depois da primeira renderização e sempre que \`n\` mudar.
- \`[]\` — só depois da primeira renderização (montagem).
- sem lista — depois de **toda** renderização. Quase nunca é o que você quer.

A regra: tudo o que o efeito lê de props ou estado vai na lista. Deixar de fora é um bug clássico — o efeito roda com um valor velho, porque a função que o React guardou "lembra" a renderização em que foi criada. Se \`n\` é lido, \`n\` está na lista.

## Limpar

Um efeito que **cria** algo devolve a função que o desfaz:

~~~tsx
React.useEffect(() => {
  const id = setInterval(() => setSegundos((s) => s + 1), 1000);
  return () => clearInterval(id);
}, []);
~~~

O React chama a limpeza antes de rodar o efeito de novo e quando o componente sai da tela. Sem ela, o temporizador continua vivo depois que o relógio some — e um segundo relógio cria um segundo temporizador, e o estado sobe dois por segundo. Vale para \`setInterval\`, \`addEventListener\`, assinaturas, conexões: o que abre, fecha.

Repare no \`setSegundos((s) => s + 1)\`: dentro de um efeito com \`[]\`, \`segundos\` seria sempre o valor da primeira renderização. A forma com função lê o valor atual.

## O que **não** é efeito

O erro mais comum é usar \`useEffect\` para calcular estado a partir de estado:

~~~tsx
// @recusado
const [itens, setItens] = React.useState<string[]>([]);
const [total, setTotal] = React.useState(0);
React.useEffect(() => { setTotal(itens.length); }, [itens]);
~~~

Isso renderiza duas vezes (uma com o total velho, outra com o novo) e cria um estado que pode se desencontrar. Se dá para calcular, calcule na renderização: \`const total = itens.length\`. Também não é efeito o que acontece **em resposta a um evento** — enviar um formulário, salvar ao clicar: isso vai no manipulador do evento.

Efeito é para sincronizar com algo que **não é o React**: o DOM fora do componente, temporizadores, armazenamento, rede.

## A ordem das coisas

1. O componente roda e produz JSX.
2. O React aplica no DOM.
3. Os efeitos cuja lista mudou rodam (a limpeza do anterior antes).

Um \`console.log\` no corpo do componente aparece antes do que está no efeito. E o efeito nunca roda durante a renderização — é por isso que pode tocar o DOM com segurança: ele já está pronto.

## Erros

- Dependência faltando: o efeito lê um valor velho.
- Sem limpeza: temporizadores e ouvintes acumulam.
- \`setState\` num efeito sem dependências: laço infinito (renderiza → efeito → estado → renderiza…).
- Efeito para valor derivado.
- \`async\` direto no \`useEffect\` (a função do efeito não pode devolver uma promessa; a próxima aula mostra o jeito certo).
`.trim(),
    },
    {
      kind: 'example',
      language: 'tsx',
      code: `function App() {
  const [segundos, setSegundos] = React.useState(0);
  const [rodando, setRodando] = React.useState(true);

  // Sincroniza o título com o estado: roda sempre que segundos muda.
  React.useEffect(() => {
    document.title = segundos + 's';
  }, [segundos]);

  // Cria o temporizador só enquanto rodando; a limpeza o desliga.
  React.useEffect(() => {
    if (!rodando) return;
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [rodando]);

  return (
    <div>
      <p>{segundos}s</p>
      <button onClick={() => setRodando(!rodando)}>{rodando ? 'Pausar' : 'Continuar'}</button>
      <button onClick={() => setSegundos(0)}>Zerar</button>
    </div>
  );
}`,
      caption:
        'Dois efeitos, um por preocupação. O do temporizador depende só de `rodando`: pausar roda a limpeza (o intervalo morre), continuar roda o efeito de novo. O `setSegundos((s) => s + 1)` lê o valor atual mesmo com a lista `[rodando]`.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-5-quando',
        type: 'multiple-choice',
        prompt: 'Com `React.useEffect(() => { … }, [busca])`, quando a função roda?',
        concepts: ['react-efeitos'],
        difficulty: 'iniciante',
        tags: ['react', 'efeitos'],
        options: [
          'Durante a renderização, antes de o JSX ser calculado',
          'Depois de a renderização ser aplicada no DOM — na primeira vez, e depois só quando `busca` mudar',
          'A cada renderização, sempre',
          'Só quando `busca` mudar; nunca na primeira renderização',
        ],
        correctIndex: 1,
        explanation:
          'O efeito é o que acontece **depois** da tela estar no DOM. Na montagem ele roda sempre; nas seguintes, só se algum item da lista mudou. Com `[]` roda uma vez; sem lista, sempre. A lista não é uma otimização opcional: é a declaração do que o efeito depende, e faltar um item significa rodar com um valor velho.',
        hints: ['A lista de dependências responde "quando"; e "antes ou depois da tela" é sempre a mesma resposta.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-5-titulo',
        type: 'code',
        prompt:
          'Escreva `App` com um campo de rótulo `Título` e um efeito que mantém `document.title` igual ao que está digitado — e igual a `Sem título` quando o campo está vazio. Mostre o mesmo texto num `<p>`.',
        concepts: ['react-efeitos'],
        difficulty: 'iniciante',
        tags: ['react', 'efeitos'],
        initialCode: `function App() {
  const [titulo, setTitulo] = React.useState('');

  return (
    <div>
      <label>
        Título <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </label>
      <p>Sem título</p>
    </div>
  );
}
`,
        tests: [
          {
            description: 'no início, o título da página é Sem título',
            assertion: `await esperar(); if (document.title !== 'Sem título') throw new Error('Esperava document.title "Sem título", veio ' + JSON.stringify(document.title)); if (texto('p') !== 'Sem título') throw new Error('O <p> deveria mostrar "Sem título".');`,
          },
          {
            description: 'digitar muda o título da página e o <p>',
            assertion: `await digitar(campo('Título'), 'Minha página'); if (document.title !== 'Minha página') throw new Error('Esperava document.title "Minha página", veio ' + JSON.stringify(document.title)); if (texto('p') !== 'Minha página') throw new Error('O <p> deveria acompanhar.');`,
          },
          {
            description: 'apagar volta a Sem título',
            assertion: `await digitar(campo('Título'), ''); if (document.title !== 'Sem título') throw new Error('Com o campo vazio esperava "Sem título", veio ' + JSON.stringify(document.title));`,
          },
        ],
        hints: [
          'Derive o texto primeiro: `const texto = titulo.trim() === \'\' ? \'Sem título\' : titulo;` — e use nos dois lugares.',
          'O efeito: `React.useEffect(() => { document.title = texto; }, [texto]);`.',
        ],
        solution: `function App() {
  const [titulo, setTitulo] = React.useState('');
  const textoDoTitulo = titulo.trim() === '' ? 'Sem título' : titulo;

  React.useEffect(() => {
    document.title = textoDoTitulo;
  }, [textoDoTitulo]);

  return (
    <div>
      <label>
        Título <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </label>
      <p>{textoDoTitulo}</p>
    </div>
  );
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-5-lacuna-relogio',
        type: 'fill-blank',
        prompt: 'Complete o relógio: a atualização que lê o valor atual, a limpeza do temporizador e a lista de dependências da montagem.',
        concepts: ['react-efeitos'],
        difficulty: 'intermediario',
        tags: ['react', 'efeitos'],
        template: `function App() {
  const [segundos, setSegundos] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setSegundos({{1}}), 50);
    return () => {{2}};
  }, {{3}});

  return <p>{segundos}</p>;
}`,
        blanks: [
          { placeholder: 'função', size: 12 },
          { placeholder: 'limpeza', size: 16 },
          { placeholder: 'lista', size: 2 },
        ],
        tests: [
          {
            description: 'o contador sobe sozinho, e continua subindo (não fica preso em 1)',
            assertion: `await esperar(120); const a = Number(texto('p')); await esperar(120); const b = Number(texto('p')); if (!(b > a && a >= 1)) throw new Error('Esperava o contador subindo a cada intervalo (leituras: ' + a + ', ' + b + '). Se ele para em 1, o setter está lendo o valor da primeira renderização.');`,
          },
        ],
        hints: [
          'Dentro de um efeito de montagem, a variável do estado é a foto da primeira renderização: use a forma com função.',
          'A limpeza cancela o intervalo pelo id; a lista vazia faz o efeito rodar uma vez.',
        ],
        solution: ['(s) => s + 1', 'clearInterval(id)', '[]'],
        explanation:
          'Com `[]`, o efeito roda uma vez, e a função que ele guardou lembra `segundos = 0` para sempre — `setSegundos(segundos + 1)` ficaria preso em 1. A forma `(s) => s + 1` recebe o valor atual do React. `clearInterval(id)` na limpeza é o que impede o temporizador de sobreviver ao componente.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-5-bug-limpeza',
        type: 'find-bug',
        prompt:
          "O compilador recusa: `Type 'number' is not assignable to type 'void | (() => void)'`. Aponte a linha que precisa mudar.",
        concepts: ['react-efeitos'],
        difficulty: 'intermediario',
        tags: ['react', 'efeitos', 'depuracao'],
        code: `function App() {
  const [segundos, setSegundos] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return id;
  }, []);

  return <p>{segundos}s</p>;
}`,
        buggyLine: 6,
        fix: '    return () => clearInterval(id);',
        explanation:
          'O que um efeito devolve é a **função de limpeza** — o React a chama quando o componente sai. Devolver o id do intervalo não desliga nada: é um número, e o React não sabe o que fazer com ele (o compilador recusa por isso). A limpeza é a função que cancela: `() => clearInterval(id)`. Sem ela, o temporizador sobrevive ao componente e tenta atualizar um estado que não existe mais.',
        hints: [
          'O que o React faz com o valor devolvido por um efeito? Que tipo ele precisa ter?',
          'Cancelar um intervalo é `clearInterval(id)` — e isso precisa estar dentro de uma função.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-5-nao-efeito',
        type: 'multiple-choice',
        prompt: 'Qual destas quatro coisas é caso para `useEffect`?',
        concepts: ['react-efeitos'],
        difficulty: 'intermediario',
        tags: ['react', 'efeitos'],
        options: [
          'Calcular `total = itens.length` sempre que `itens` mudar',
          'Enviar o formulário quando a pessoa clica em Salvar',
          'Manter `document.title` igual ao nome da tela atual',
          'Filtrar a lista pelo texto da busca',
        ],
        correctIndex: 2,
        explanation:
          'Só o título é algo **fora do React** que precisa ser sincronizado com o estado — o caso do efeito. O total e a lista filtrada são derivados: uma linha no corpo do componente, recalculada a cada renderização, sem segundo estado e sem renderização dupla. O envio acontece em resposta a um evento: vai no manipulador do clique, não num efeito que observa um estado "enviando".',
        hints: ['Efeito é para sincronizar com o mundo de fora. Qual das quatro toca algo que não é props nem estado?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-react-5-ouvinte',
        type: 'code',
        prompt:
          'Escreva `App` que mostra a tecla pressionada por último: um `<p>` com `Última tecla: X` (e `Última tecla: nenhuma` no início). Ouça o `keydown` no `window` dentro de um efeito de montagem, com a limpeza que remove o ouvinte.',
        concepts: ['react-efeitos'],
        difficulty: 'intermediario',
        tags: ['react', 'efeitos', 'eventos'],
        initialCode: `function App() {
  const [tecla, setTecla] = React.useState<string | null>(null);

  return <p>Última tecla: {tecla ?? 'nenhuma'}</p>;
}
`,
        tests: [
          {
            description: 'começa com nenhuma',
            assertion: `if (texto('p') !== 'Última tecla: nenhuma') throw new Error('Esperava "Última tecla: nenhuma", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: 'uma tecla pressionada no window aparece',
            assertion: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' })); await esperar(); if (texto('p') !== 'Última tecla: a') throw new Error('Depois de keydown com key "a" esperava "Última tecla: a", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: 'a tecla seguinte substitui',
            assertion: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); await esperar(); if (texto('p') !== 'Última tecla: Enter') throw new Error('Esperava "Última tecla: Enter", veio ' + JSON.stringify(texto('p')));`,
          },
          {
            description: 'o efeito devolve uma limpeza que remove o ouvinte',
            assertion: `let removidos = 0; const original = window.removeEventListener; window.removeEventListener = function (tipo, ...resto) { if (tipo === 'keydown') removidos += 1; return original.call(window, tipo, ...resto); }; window.__raiz.unmount(); await esperar(); window.removeEventListener = original; if (removidos < 1) throw new Error('Ao desmontar, o ouvinte de keydown deveria ser removido — devolva a limpeza no efeito.');`,
          },
        ],
        hints: [
          'No efeito: `function aoTeclar(e: KeyboardEvent) { setTecla(e.key); }` e `window.addEventListener(\'keydown\', aoTeclar)`.',
          'A limpeza é `return () => window.removeEventListener(\'keydown\', aoTeclar)`, e a lista é `[]`. Para remover, a função precisa ser a **mesma** — por isso ela ganha nome.',
        ],
        solution: `function App() {
  const [tecla, setTecla] = React.useState<string | null>(null);

  React.useEffect(() => {
    function aoTeclar(e: { key: string }) {
      setTecla(e.key);
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  return <p>Última tecla: {tecla ?? 'nenhuma'}</p>;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Efeito é o que acontece fora da tela — título, temporizador, ouvinte, armazenamento, rede — e roda **depois** de a renderização estar no DOM, quando algo da lista de dependências mudou. Tudo o que o efeito lê vai na lista. O que ele cria, a limpeza desfaz. Dentro de um efeito de montagem, use \`set((atual) => …)\`. E o que se calcula de props e estado não é efeito: é uma linha no corpo do componente.`,
    },
  ],
};

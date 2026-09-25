import type { Lesson } from '../types';

export const lessonEstruturasPilhaEFila: Lesson = {
  id: 'lesson-estruturas-3',
  trackId: 'track-estruturas',
  title: 'Pilha e Fila',
  language: 'javascript',
  objective:
    'Implementar pilha (LIFO) e fila (FIFO) com um array comum, e reconhecer qual disciplina de acesso um problema pede.',
  concepts: ['estruturas-pilha-fila'],
  status: 'published',
  estimatedMinutes: 24,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Pilha e fila não são estruturas novas da linguagem — são um **array usado com uma disciplina específica**: de que lado se coloca, e de que lado se tira.

## Pilha: o último que entra é o primeiro que sai

Numa pilha (LIFO — *last in, first out*), tanto colocar quanto tirar acontece no mesmo topo. Empilhe pratos: o último que você colocou é o primeiro que você tira.

~~~js
const pilha = [];
pilha.push('a'); // ['a']
pilha.push('b'); // ['a', 'b']
pilha.push('c'); // ['a', 'b', 'c']
pilha.pop();     // 'c' — o último que entrou foi o primeiro a sair
~~~

O botão "voltar" do navegador é uma pilha: cada página visitada é empilhada, e voltar tira a do topo — a mais recente. A própria pilha de chamadas de uma recursão, da aula anterior, é uma pilha nesse sentido exato.

## Fila: o primeiro que entra é o primeiro que sai

Numa fila (FIFO — *first in, first out*), o que entra primeiro sai primeiro — um lado para entrar, o outro para sair. Uma fila de atendimento é o exemplo óbvio: quem chegou primeiro é atendido primeiro.

~~~js
const fila = [];
fila.push('a');   // ['a']       — entra no fim
fila.push('b');   // ['a', 'b']
fila.shift();     // 'a' — o primeiro que entrou é o primeiro que sai
~~~

## Por que a diferença importa

Usar \`pop()\` (tira do fim) numa situação que precisa de ordem de chegada — uma fila de tarefas a processar, por exemplo — inverte a ordem: a última tarefa adicionada seria processada primeiro, e uma tarefa antiga poderia nunca ser alcançada se novas continuassem chegando. A pergunta que decide qual das duas usar é sempre a mesma: **o que importa mais, o que chegou por último, ou o que chegou primeiro?**
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Pilha: histórico de "voltar" de um navegador.
const historico = [];
historico.push('inicio');
historico.push('produtos');
historico.push('carrinho');
historico.pop(); // 'carrinho' — sai a página mais recente

// Fila: pedidos de uma cozinha, na ordem de chegada.
const pedidos = [];
pedidos.push('mesa 1');
pedidos.push('mesa 2');
pedidos.shift(); // 'mesa 1' — sai o pedido mais antigo`,
      caption: 'Mesmo array, dois métodos diferentes de tirar — pop() para pilha, shift() para fila.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-3-lifo-ou-fifo',
        type: 'multiple-choice',
        prompt: 'Numa pilha (LIFO), qual item sai primeiro quando se remove um?',
        concepts: ['estruturas-pilha-fila'],
        difficulty: 'iniciante',
        tags: ['estruturas-de-dados', 'pilha'],
        options: [
          'O último que entrou',
          'O primeiro que entrou',
          'O do meio, sempre',
          'Depende da ordem alfabética dos valores',
        ],
        correctIndex: 0,
        explanation:
          'LIFO significa "last in, first out" — o último a entrar é o primeiro a sair. É o comportamento de `push`/`pop` num array: os dois mexem no mesmo topo (o fim do array).',
        hints: ['A própria sigla LIFO já responde: "last in" é o quê, "first out"?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-3-metodo-errado-na-fila',
        type: 'find-bug',
        prompt: 'Esta função deveria processar pedidos na ordem de chegada (uma fila), mas está processando na ordem errada. Aponte a linha que precisa mudar.',
        concepts: ['estruturas-pilha-fila'],
        difficulty: 'intermediario',
        tags: ['estruturas-de-dados', 'fila', 'bug'],
        code: `function proximoPedido(fila) {
  return fila.pop();
}

const pedidos = ['mesa 1', 'mesa 2', 'mesa 3'];
if (proximoPedido(pedidos) !== 'mesa 1') throw new Error('deveria atender mesa 1 primeiro');`,
        buggyLine: 2,
        fix: '  return fila.shift();',
        explanation:
          '`pop()` tira do fim do array — o último item, "mesa 3" — quando o que a fila precisa é tirar do início, o primeiro que chegou. `shift()` é o método certo para o comportamento FIFO de uma fila: tira sempre o item mais antigo.',
        hints: [
          '`pop()` e `shift()` tiram de lados opostos do array. Qual lado tem o item que chegou primeiro?',
          'Uma fila de atendimento real nunca atenderia o último a chegar primeiro.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-3-qual-estrutura',
        type: 'multiple-choice',
        prompt: 'Um sistema de impressão processa documentos na ordem em que foram enviados — o primeiro documento enviado é o primeiro impresso. Que estrutura descreve esse comportamento?',
        concepts: ['estruturas-pilha-fila'],
        difficulty: 'iniciante',
        tags: ['estruturas-de-dados', 'fila'],
        options: ['Fila (FIFO)', 'Pilha (LIFO)', 'Nenhuma das duas — a ordem é sempre aleatória', 'As duas servem igualmente bem'],
        correctIndex: 0,
        explanation:
          'O primeiro documento a entrar na fila de impressão é o primeiro a sair (ser impresso) — exatamente a disciplina FIFO de uma fila. Uma pilha inverteria a ordem, imprimindo sempre o documento mais recente primeiro.',
        hints: ['Pense em qual documento você esperaria ver impresso primeiro: o que você mandou agora, ou o que já estava esperando há mais tempo?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-3-historico-de-navegacao',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['estruturas-pilha-fila'],
        difficulty: 'intermediario',
        tags: ['estruturas-de-dados', 'pilha'],
        code: `const historico = [];
historico.push('inicio');
historico.push('produtos');
historico.push('carrinho');
console.log(historico.pop());
console.log(historico.pop());`,
        expectedOutput: 'carrinho\nprodutos',
        explanation:
          'Cada `pop()` tira o item mais recentemente empilhado. O primeiro `pop()` tira "carrinho" (o último `push`); o segundo tira "produtos" — "inicio" continua na pilha, sem ter sido removido ainda.',
        hints: ['`pop()` sempre tira o item que entrou por último — o topo da pilha, o fim do array.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-estruturas-3-fila-de-atendimento',
        type: 'code',
        prompt: 'Escreva `atenderProximo(fila)`: remove e devolve o próximo da fila a ser atendido — o que chegou primeiro (comportamento FIFO).',
        concepts: ['estruturas-pilha-fila'],
        difficulty: 'iniciante',
        tags: ['estruturas-de-dados', 'fila'],
        initialCode: `function atenderProximo(fila) {
  // Seu código aqui
}`,
        tests: [
          {
            description: 'Atende na ordem de chegada: o primeiro da lista',
            assertion: `const fila = ['ana', 'bruno', 'carla'];
const r = atenderProximo(fila);
if (r !== 'ana') throw new Error('esperava "ana" (primeiro a chegar), veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Remove o atendido da fila — ela encolhe',
            assertion: `const fila = ['ana', 'bruno'];
atenderProximo(fila);
if (fila.length !== 1) throw new Error('a fila deveria ter 1 pessoa depois de atender, tem ' + fila.length);
if (fila[0] !== 'bruno') throw new Error('deveria sobrar "bruno" na fila');`,
          },
        ],
        solution: `function atenderProximo(fila) {
  return fila.shift();
}`,
        hints: ['Uma fila tira do início — o método que remove e devolve o primeiro item de um array é `shift()`.'],
      },
    },
    {
      kind: 'summary',
      markdown: `
Pilha e fila são o mesmo array, usado com disciplinas opostas: pilha tira do topo com \`pop()\` (o último que entrou), fila tira do início com \`shift()\` (o primeiro que entrou). A escolha certa depende de uma pergunta só: o que importa mais, o mais recente ou o mais antigo?

Na próxima e última aula da trilha, busca binária — o exemplo concreto de O(log n) — e Set e Map, as estruturas que trocam O(n) de procurar num array por O(1) na prática.
`.trim(),
    },
  ],
};

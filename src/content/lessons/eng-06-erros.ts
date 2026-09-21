import type { Lesson } from '../types';

export const lessonEngErros: Lesson = {
  id: 'lesson-eng-6',
  trackId: 'track-engenharia',
  title: 'Erros como Contrato',
  language: 'node',
  objective:
    'Decidir como cada função falha — devolver ou lançar —, falhar cedo com mensagens que explicam, criar erros com nome para quem trata decidir pelo tipo, e tratar num lugar só, sem engolir.',
  concepts: ['eng-erros'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
O contrato de uma função não é só o que ela devolve quando dá certo. É também **como ela avisa quando não dá** — e essa metade costuma ser decidida por acidente: uma função devolve \`null\`, outra devolve \`-1\`, a terceira lança, a quarta imprime no console e segue. Quem chama precisa adivinhar. Esta aula é sobre decidir de propósito.

## Devolver ou lançar

Duas perguntas separam os casos:

- **É um resultado esperado?** \`buscarPedido(id)\` não achar é normal — pedidos somem. Devolva \`null\`, e quem chama decide (a rota vira 404; o relatório pula). Lançar aqui obrigaria todo mundo a \`try/catch\` para um caso comum.
- **A função consegue continuar?** \`calcularTotal(itens)\` com \`itens\` que não é lista não tem como seguir. Não há resultado razoável para devolver: **lance**. Devolver \`0\` esconderia o defeito e o relatório sairia zerado, sem ninguém saber por quê.

A regra: \`null\`/\`undefined\` para o "não tem", **lançar** para o "não dá". E o que a função escolher, ela documenta no nome ou no comentário, e mantém.

## Falhar cedo

Um valor inválido que entra viaja: passa por três funções, é gravado, e quebra dois dias depois num relatório, longe da causa. A guarda na **entrada** — a primeira linha de quem recebe o valor — para o problema onde ele ainda tem nome:

~~~js
function calcularTotal(itens) {
  if (!Array.isArray(itens)) {
    throw new Error('itens precisa ser uma lista, veio ' + typeof itens);
  }
  …
}
~~~

É a mesma validação da aula de POST, agora como hábito geral: **quem recebe, confere**.

## A mensagem é para quem lê

\`throw new Error('erro')\` conta que algo deu errado e mais nada. A mensagem útil diz **o quê, onde e o que se esperava**: \`'preco precisa ser um número maior que zero, veio -3'\`. Quem lê o log às três da manhã conserta sem abrir o código.

E sempre \`new Error(...)\`, nunca \`throw 'texto'\`: um texto lançado não tem rastro de pilha (onde aconteceu), não tem \`instanceof\`, e quebra qualquer código que espere \`erro.message\`.

## Erros com nome

Quem trata um erro precisa decidir **o que ele é** — validação? não encontrado? banco fora? Ler a mensagem para isso é frágil (mudou o texto, quebrou o \`if\`). O jeito é um erro com **tipo**:

~~~js
class ErroDeValidacao extends Error {
  constructor(campo, mensagem) {
    super(mensagem);
    this.name = 'ErroDeValidacao';
    this.campo = campo;
  }
}

throw new ErroDeValidacao('preco', 'preco precisa ser maior que zero');
~~~

Agora quem trata pergunta \`if (erro instanceof ErroDeValidacao)\` e usa \`erro.campo\` para marcar o campo na tela. O \`ErroHttp\` da trilha de Node era isso: um erro que carrega o status. Dois ou três tipos bastam para um projeto pequeno: validação, não encontrado, e o resto.

## Tratar num lugar só

Onde vai o \`try/catch\`? **Na camada que tem o que fazer com o erro.** A rota transforma em 400 ou 404; o script de linha de comando imprime e sai; a tela mostra a mensagem. As camadas do meio — serviço, repositório — **deixam passar**: um \`catch\` que só relança (\`catch (erro) { throw erro; }\`) é ruído, e um que engole (\`catch (erro) {}\`) é o pior defeito silencioso que existe: o programa segue com dados errados e ninguém fica sabendo.

Só se pega o erro no meio do caminho para **acrescentar** algo: contexto ("ao gravar o pedido 7: …"), ou uma tradução (o erro do banco vira um erro seu, sem vazar detalhes). Fora isso, deixa subir.

## Duas plateias

O mesmo erro tem dois leitores: o desenvolvedor, que precisa do detalhe (mensagem completa, pilha, no log), e a pessoa usando, que precisa de uma frase que a ajude ("o preço precisa ser maior que zero") e nunca do detalhe interno. A camada que trata decide o que vai para cada um — foi a lição do 500 genérico, e vale para qualquer programa com tela.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `class ErroDeValidacao extends Error {
  constructor(campo, mensagem) {
    super(mensagem);
    this.name = 'ErroDeValidacao';
    this.campo = campo;
  }
}

// O serviço falha cedo, com nome e mensagem — e não trata: não tem o que fazer.
function criarItem({ nome, preco, quantidade }) {
  if (typeof nome !== 'string' || nome.trim() === '') throw new ErroDeValidacao('nome', 'nome é obrigatório');
  if (typeof preco !== 'number' || preco <= 0) throw new ErroDeValidacao('preco', 'preco precisa ser maior que zero, veio ' + preco);
  if (!Number.isInteger(quantidade) || quantidade < 1) throw new ErroDeValidacao('quantidade', 'quantidade precisa ser um inteiro a partir de 1');
  return { nome: nome.trim(), preco, quantidade };
}

// A camada de cima é quem trata: decide pelo tipo, não pela mensagem.
function tentarCriar(dados) {
  try {
    return { ok: true, item: criarItem(dados) };
  } catch (erro) {
    if (erro instanceof ErroDeValidacao) return { ok: false, campo: erro.campo, mensagem: erro.message };
    throw erro; // não é validação: não é comigo, sobe
  }
}`,
      caption:
        'O serviço lança com tipo e mensagem completa; quem chama decide pelo instanceof, usa o campo para marcar a tela, e deixa subir o que não sabe tratar.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-6-devolver-ou-lancar',
        type: 'multiple-choice',
        prompt:
          '`buscarPedido(id)` procura na lista e o pedido não está lá. `calcularTotal(itens)` recebe `itens` que não é uma lista. Como cada uma deve falhar?',
        concepts: ['eng-erros'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'erros', 'contrato'],
        options: [
          '`buscarPedido` devolve `null` (não achar é esperado, quem chama decide); `calcularTotal` lança (não tem como continuar)',
          'As duas lançam: erro é erro',
          'As duas devolvem `null`: lançar é agressivo demais',
          '`buscarPedido` lança (o pedido deveria existir); `calcularTotal` devolve `0` (é o total de uma lista vazia)',
        ],
        correctIndex: 0,
        explanation:
          'Não achar um pedido é um resultado comum: `null` deixa a rota virar 404 e o relatório pular, sem `try/catch` em toda parte. Já `calcularTotal` com algo que não é lista não tem resultado razoável — devolver `0` esconderia o defeito, e o relatório sairia zerado sem ninguém saber por quê. **"Não tem" devolve; "não dá" lança.**',
        hints: ['Para cada função: o caso é esperado ou é um defeito? Existe um resultado razoável para devolver?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-6-classe',
        type: 'server',
        prompt:
          'Escreva `ErroDeValidacao` (estende `Error`, com `name` igual a `"ErroDeValidacao"` e a propriedade `campo`) e `validarItem(item)`: lança `ErroDeValidacao("preco", …)` se `preco` não for um número maior que zero, `ErroDeValidacao("quantidade", …)` se `quantidade` não for inteiro a partir de 1 — com mensagens que digam o que se esperava — e devolve o item quando está certo. Exporte os dois.',
        concepts: ['eng-erros'],
        difficulty: 'intermediario',
        tags: ['engenharia', 'erros', 'classe'],
        initialCode: `// class ErroDeValidacao extends Error { … }

// function validarItem(item) { … }

module.exports = {};
`,
        tests: [
          {
            description: 'Um item válido volta como está',
            assertion: `const { validarItem, ErroDeValidacao } = module.exports;
if (typeof validarItem !== 'function' || typeof ErroDeValidacao !== 'function') throw new Error('exporte validarItem e ErroDeValidacao');
const item = { nome: 'Caderno', preco: 12.5, quantidade: 2 };
if (validarItem(item) !== item) throw new Error('validarItem deveria devolver o próprio item quando está certo');`,
          },
          {
            description: 'Preço -3 lança ErroDeValidacao com campo "preco", name e mensagem',
            assertion: `const { validarItem, ErroDeValidacao } = module.exports;
let erro = null;
try { validarItem({ nome: 'Caderno', preco: -3, quantidade: 1 }); } catch (e) { erro = e; }
if (!erro) throw new Error('preco -3 deveria lançar');
if (!(erro instanceof ErroDeValidacao) || !(erro instanceof Error)) throw new Error('o erro precisa ser um ErroDeValidacao (que estende Error), veio ' + (erro && erro.constructor && erro.constructor.name));
if (erro.campo !== 'preco') throw new Error('erro.campo deveria ser "preco", veio ' + JSON.stringify(erro.campo));
if (erro.name !== 'ErroDeValidacao') throw new Error('erro.name deveria ser "ErroDeValidacao", veio ' + JSON.stringify(erro.name));
if (typeof erro.message !== 'string' || erro.message.length < 15) throw new Error('a mensagem precisa explicar o que se esperava, veio ' + JSON.stringify(erro.message));`,
          },
          {
            description: 'Quantidade 0 ou 1.5 lança com campo "quantidade"; texto no preço também é recusado',
            assertion: `const { validarItem } = module.exports;
for (const quantidade of [0, 1.5, 'dois']) {
  let erro = null;
  try { validarItem({ nome: 'Caneta', preco: 3, quantidade }); } catch (e) { erro = e; }
  if (!erro || erro.campo !== 'quantidade') throw new Error('quantidade ' + JSON.stringify(quantidade) + ' deveria lançar com campo "quantidade", veio ' + (erro ? JSON.stringify(erro.campo) : 'nada'));
}
let erro = null;
try { validarItem({ nome: 'Caneta', preco: '3', quantidade: 1 }); } catch (e) { erro = e; }
if (!erro || erro.campo !== 'preco') throw new Error('preco "3" (texto) deveria lançar com campo "preco"');`,
          },
        ],
        solution: `class ErroDeValidacao extends Error {
  constructor(campo, mensagem) {
    super(mensagem);
    this.name = 'ErroDeValidacao';
    this.campo = campo;
  }
}

function validarItem(item) {
  if (typeof item.preco !== 'number' || item.preco <= 0) {
    throw new ErroDeValidacao('preco', 'preco precisa ser um número maior que zero, veio ' + JSON.stringify(item.preco));
  }
  if (!Number.isInteger(item.quantidade) || item.quantidade < 1) {
    throw new ErroDeValidacao('quantidade', 'quantidade precisa ser um inteiro a partir de 1, veio ' + JSON.stringify(item.quantidade));
  }
  return item;
}

module.exports = { ErroDeValidacao, validarItem };`,
        hints: [
          'A classe: `constructor(campo, mensagem)` chama `super(mensagem)` primeiro, e só então define `this.name` e `this.campo`.',
          'Preço: `typeof item.preco !== "number" || item.preco <= 0`. Quantidade: `!Number.isInteger(item.quantidade) || item.quantidade < 1`.',
          'A mensagem diz o que se esperava e o que veio: `"preco precisa ser maior que zero, veio " + item.preco`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-6-cedo',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['eng-erros'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'erros', 'falhar-cedo'],
        code: `function criarPedido(itens) {
  if (!Array.isArray(itens)) {
    throw new Error('itens precisa ser uma lista, veio ' + typeof itens);
  }
  return { itens, quantidade: itens.length };
}

try {
  console.log(criarPedido('caderno').quantidade);
} catch (erro) {
  console.log('erro: ' + erro.message);
}

try {
  console.log(criarPedido(['caderno', 'caneta']).quantidade);
} catch (erro) {
  console.log('erro: ' + erro.message);
}`,
        expectedOutput: `erro: itens precisa ser uma lista, veio string
2`,
        explanation:
          'A guarda na entrada pega o texto onde ele ainda se chama `itens`, e a mensagem diz o que veio. Sem a guarda, `"caderno".length` daria 7, o pedido seria criado com "sete itens", e o defeito apareceria muito depois — num relatório, sem pista de onde nasceu.',
        hints: ['Na primeira chamada, `itens` é uma lista? E o que a mensagem inclui?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-6-deixar-subir',
        type: 'refactor',
        prompt:
          'Cada camada pega o erro só para relançá-lo. Tire os `try/catch` que não fazem nada com o erro: quem não tem o que fazer com ele **deixa passar**. Só `executar` — a camada de cima — trata, e continua tratando do mesmo jeito.',
        concepts: ['eng-erros'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'erros', 'refatorar'],
        initialCode: `function buscarPreco(produto) {
  try {
    if (produto === 'caneta') return 3;
    if (produto === 'caderno') return 12.5;
    throw new Error('produto desconhecido: ' + produto);
  } catch (erro) {
    throw erro;
  }
}

function calcularTotal(produto, quantidade) {
  try {
    return buscarPreco(produto) * quantidade;
  } catch (erro) {
    throw erro;
  }
}

function executar(produto, quantidade) {
  try {
    return 'Total: ' + calcularTotal(produto, quantidade);
  } catch (erro) {
    return 'Não foi possível calcular: ' + erro.message;
  }
}`,
        tests: [
          {
            description: 'executar("caderno", 2) devolve "Total: 25"',
            assertion: `if (executar('caderno', 2) !== 'Total: 25') throw new Error('esperava "Total: 25", veio ' + JSON.stringify(executar('caderno', 2)));`,
          },
          {
            description: 'Produto desconhecido chega à camada de cima com a mensagem inteira',
            assertion: `const r = executar('borracha', 1);
if (r !== 'Não foi possível calcular: produto desconhecido: borracha') throw new Error('esperava "Não foi possível calcular: produto desconhecido: borracha", veio ' + JSON.stringify(r));`,
          },
          {
            description: 'calcularTotal continua lançando quando o produto não existe',
            assertion: `let lancou = false;
try { calcularTotal('borracha', 1); } catch (e) { lancou = true; }
if (!lancou) throw new Error('calcularTotal("borracha") deveria deixar o erro subir');`,
          },
        ],
        constraints: [
          { description: 'Nenhum `catch` que só relança: `throw erro;` some', forbidden: 'throw erro;' },
          { description: 'O tratamento de cima fica: `executar` continua com o seu `catch`', required: 'Não foi possível calcular: ' },
        ],
        explanation:
          'Um `catch` que só faz `throw erro` é ruído: o erro subiria sozinho, e o leitor gasta tempo entendendo um bloco que não faz nada. `buscarPreco` e `calcularTotal` ficaram com o que é delas; o único `try/catch` está em `executar`, a camada que tem o que fazer com o erro — transformá-lo numa frase.',
        solution: `function buscarPreco(produto) {
  if (produto === 'caneta') return 3;
  if (produto === 'caderno') return 12.5;
  throw new Error('produto desconhecido: ' + produto);
}

function calcularTotal(produto, quantidade) {
  return buscarPreco(produto) * quantidade;
}

function executar(produto, quantidade) {
  try {
    return 'Total: ' + calcularTotal(produto, quantidade);
  } catch (erro) {
    return 'Não foi possível calcular: ' + erro.message;
  }
}`,
        hints: [
          'Um `catch` que só faz `throw erro` é o mesmo que não ter `try`: o erro sobe sozinho.',
          'Tire o `try/catch` de `buscarPreco` e de `calcularTotal`; o corpo de cada uma fica como estava dentro do `try`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-6-super',
        type: 'find-bug',
        prompt:
          'Este programa quebra ao rodar: "Must call super constructor in derived class before accessing \'this\'". Aponte a linha que precisa mudar.',
        concepts: ['eng-erros'],
        difficulty: 'intermediario',
        tags: ['engenharia', 'erros', 'classe', 'bug'],
        code: `class ErroDeValidacao extends Error {
  constructor(campo, mensagem) {
    this.campo = campo;
  }
}

function validar(pedido) {
  const erros = [];
  if (!(pedido.preco > 0)) erros.push(new ErroDeValidacao('preco', 'preco precisa ser maior que zero'));
  if (!(pedido.quantidade >= 1)) erros.push(new ErroDeValidacao('quantidade', 'quantidade precisa ser ao menos 1'));
  return erros;
}

console.log(validar({ preco: -3, quantidade: 0 }).map((erro) => erro.campo + ': ' + erro.message));`,
        buggyLine: 3,
        fix: '    super(mensagem); this.campo = campo;',
        explanation:
          'Uma classe que estende outra precisa chamar `super(...)` **antes** de usar `this` — é o construtor de `Error` quem cria o objeto e guarda a `message`. Sem o `super(mensagem)`, além do erro na hora, a mensagem se perderia: `erro.message` seria vazio. Toda classe de erro começa com `super(mensagem)`.',
        hints: [
          'A mensagem fala do construtor da classe-mãe. Ele está sendo chamado?',
          'Em `extends`, o `this` só existe depois de `super(...)`. E é o `super` que recebe a mensagem.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-6-lacuna',
        type: 'fill-blank',
        prompt: 'Complete a classe de erro com nome.',
        concepts: ['eng-erros'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'erros', 'classe'],
        template: `class ErroNaoEncontrado extends {{1}} {
  constructor(recurso, id) {
    {{2}}(recurso + ' ' + id + ' não encontrado');
    this.name = 'ErroNaoEncontrado';
    this.recurso = recurso;
  }
}

const erro = new ErroNaoEncontrado('Pedido', 7);`,
        blanks: [
          { placeholder: 'a classe-mãe', size: 6 },
          { placeholder: 'chamar a mãe', size: 6 },
        ],
        tests: [
          {
            description: 'O erro é um Error de verdade, com a mensagem montada',
            assertion: `if (!(erro instanceof Error)) throw new Error('ErroNaoEncontrado precisa estender a classe de erro do JavaScript');
if (erro.message !== 'Pedido 7 não encontrado') throw new Error('a mensagem deveria ser "Pedido 7 não encontrado", veio ' + JSON.stringify(erro.message));`,
          },
          {
            description: 'Nome e recurso ficam no erro, para quem trata decidir pelo tipo',
            assertion: `if (erro.name !== 'ErroNaoEncontrado' || erro.recurso !== 'Pedido') throw new Error('esperava name "ErroNaoEncontrado" e recurso "Pedido", veio ' + erro.name + ' / ' + erro.recurso);`,
          },
        ],
        explanation:
          'Estende a classe de erro da linguagem, e a primeira coisa no construtor é chamar o construtor dela com a mensagem — é ele quem cria o objeto e guarda a `message`. Só depois o `this` existe para receber `name` e `recurso`.',
        solution: ['Error', 'super'],
        hints: [
          'A primeira lacuna é a classe de erro que o JavaScript já tem — a mesma de `new ...("mensagem")`.',
          'A segunda é a palavra que chama o construtor da classe-mãe; vem antes de qualquer `this`.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Como uma função falha faz parte do contrato dela. **"Não tem" devolve** \`null\`; **"não dá" lança**. E o que ela escolher, mantém.

**Falhe cedo**, na entrada, com uma mensagem que diz o quê, onde e o que se esperava — sempre \`new Error(...)\`, nunca um texto solto. **Erros com nome** (\`class ErroDeValidacao extends Error\`, com \`super(mensagem)\` primeiro) deixam quem trata decidir por \`instanceof\`, não pela mensagem.

Trate **num lugar só**: a camada que tem o que fazer com o erro. As do meio deixam passar — \`catch\` que só relança é ruído, \`catch\` vazio é o defeito silencioso. Duas plateias: detalhe para o log, frase para a pessoa.

Na próxima aula, o que o projeto **depende**: o \`package.json\`, as versões e o que entra no Git.
`.trim(),
    },
  ],
};

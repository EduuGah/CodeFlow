import type { Lesson } from '../types';

export const lessonEngFuncoesPequenas: Lesson = {
  id: 'lesson-eng-5',
  trackId: 'track-engenharia',
  title: 'Funções Pequenas',
  language: 'node',
  objective:
    'Reconhecer a função que faz mais de uma coisa, extrair com segurança, trocar cópia por parâmetro, tirar o aninhamento com retornos cedo — e saber quando não extrair.',
  concepts: ['eng-funcoes'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Uma função de sessenta linhas não é errada por ser longa. É errada porque, para entender a linha 40, você precisa carregar na cabeça as 39 anteriores. Funções pequenas existem para o leitor: cada uma cabe na tela, tem um nome que diz o que faz, e pode ser entendida sozinha.

## Uma coisa só

O teste mais simples: **dá para nomear a função sem "e"?** \`validarESalvarPedido\` são duas. \`calcularTotalEEnviarEmail\` são duas — e de assuntos diferentes. Se o nome precisa de "e", o corpo tem uma costura, e a costura é onde se corta.

O outro sinal é o **comentário de seção** dentro da função:

~~~js
function processarPedido(pedido) {
  // validar
  …
  // calcular o total
  …
  // aplicar o desconto
  …
}
~~~

Cada comentário desses é o nome de uma função esperando para nascer: \`validarPedido\`, \`calcularTotal\`, \`aplicarDesconto\`. E \`processarPedido\` vira a lista das três chamadas — que se lê como o sumário do que acontece.

## Extrair

Extrair um pedaço é mecânico, e a mecânica é o que evita quebrar:

1. Escolha o bloco e **dê um nome** a ele (se não conseguir nomear, o bloco está mal cortado).
2. Crie a função com esse nome e mova o bloco para dentro.
3. O que o bloco **usava** de fora vira parâmetro; o que ele **produzia** vira retorno.
4. No lugar do bloco, a chamada.
5. Rode.

O passo 3 é o que ensina: se o bloco precisa de sete parâmetros, ele não era um pedaço com um assunto — era metade de outra coisa.

## Parâmetro em vez de cópia

~~~js
function descontoEstudante(preco) { return preco - preco * 0.1; }
function descontoIdoso(preco) { return preco - preco * 0.15; }
~~~

Duas funções iguais com um número diferente são **uma função com um parâmetro**: \`aplicarDesconto(preco, percentual)\`. A cópia custa na hora de mudar — a regra de arredondamento muda, e você lembra de uma e esquece a outra.

Mas há a **regra dos três**: copiar uma vez é aceitável; na segunda cópia, você começa a desconfiar; na terceira, extrai. Extrair na primeira, antes de saber o que de fato se repete, costuma produzir uma função genérica que não serve bem a nenhum dos usos.

## Retorne cedo

~~~js
// aninhado: o caso feliz está três níveis para dentro
function calcular(pedido) {
  if (pedido) {
    if (pedido.itens.length > 0) {
      return somar(pedido.itens);
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}

// com retornos cedo: os casos que não servem saem primeiro
function calcular(pedido) {
  if (!pedido) return 0;
  if (pedido.itens.length === 0) return 0;
  return somar(pedido.itens);
}
~~~

Os \`if\` do começo são **guardas**: tratam o que não serve e saem. O que sobra é o caminho principal, na margem esquerda, sem \`else\`. A ordem das guardas importa — a mais básica (existe?) vem antes da que depende dela (está vazio?).

## Quantos parâmetros

Até três se lê. A partir de quatro, quem chama precisa lembrar a ordem — \`criarPedido(cliente, itens, true, false, 15)\` não diz o que os três últimos são. Um objeto resolve: \`criarPedido({ cliente, itens, urgente: true, presente: false, frete: 15 })\`. O nome de cada campo vai junto.

## Quando não extrair

Extrair também custa: mais um nome, mais um salto para quem lê. Não vale a pena quando:

- o bloco tem três linhas, é usado **uma** vez e se lê bem onde está;
- a função nova precisaria de cinco parâmetros;
- o nome que você acha é \`ajudar\`, \`processar\`, \`fazerCoisas\` — sinal de que o corte está errado.

A meta não é "funções de cinco linhas". É **cada função com um assunto, e o leitor entendendo sem rolar**.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// A função grande virou o sumário das pequenas.
function processarPedido(pedido) {
  const erro = validarPedido(pedido);
  if (erro) return { ok: false, erro };

  const subtotal = calcularSubtotal(pedido.itens);
  const total = aplicarFrete(subtotal);
  return { ok: true, total };
}

// Cada uma com um assunto, guardas na frente, sem else.
function validarPedido(pedido) {
  if (!pedido || !Array.isArray(pedido.itens)) return 'pedido inválido';
  if (pedido.itens.length === 0) return 'pedido sem itens';
  return null;
}

function calcularSubtotal(itens) {
  let subtotal = 0;
  for (const item of itens) subtotal = subtotal + item.preco * item.quantidade;
  return subtotal;
}

function aplicarFrete(subtotal) {
  return subtotal > 100 ? subtotal : subtotal + 15;
}`,
      caption:
        'Lê-se de cima: validar, somar, aplicar o frete. Quem quiser saber a regra do frete abre uma função de uma linha, em vez de procurá-la no meio de quarenta.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-5-nome-com-e',
        type: 'multiple-choice',
        prompt: 'Qual destas funções está fazendo mais de uma coisa — e deveria virar duas?',
        concepts: ['eng-funcoes'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'funcoes'],
        options: [
          '`validarESalvarPedido(pedido)`: valida e, se estiver certo, grava no banco',
          '`calcularSubtotal(itens)`: percorre os itens somando preço vezes quantidade',
          '`formatarMoeda(valor)`: arredonda os centavos e monta o texto "R$ 12,50"',
          '`buscarPedido(id)`: procura na lista e devolve o pedido ou `null`',
        ],
        correctIndex: 0,
        explanation:
          'O nome já entrega: precisa de "e". Validar e salvar são assuntos diferentes, com razões diferentes para mudar — e quem quiser só validar (num formulário, por exemplo) não consegue. `formatarMoeda` arredonda **para** formatar: dois passos de uma coisa só. As outras duas fazem exatamente o que o nome diz.',
        hints: ['Tente nomear cada função sem usar "e". Qual não deixa?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-5-extrair',
        type: 'refactor',
        prompt:
          '`processarPedido` faz tudo, com três níveis de `if`/`else`. Extraia `validarPedido(pedido)` (devolve a mensagem de erro, ou `null`) e `calcularSubtotal(itens)`, e reescreva a validação com **retornos cedo** — sem nenhum `else`. O comportamento não pode mudar.',
        concepts: ['eng-funcoes'],
        difficulty: 'intermediario',
        tags: ['engenharia', 'funcoes', 'refatorar', 'guardas'],
        initialCode: `function processarPedido(pedido) {
  if (pedido && Array.isArray(pedido.itens)) {
    if (pedido.itens.length > 0) {
      let subtotal = 0;
      for (const item of pedido.itens) {
        subtotal = subtotal + item.preco * item.quantidade;
      }
      if (subtotal > 100) {
        return { ok: true, total: subtotal };
      } else {
        return { ok: true, total: subtotal + 15 };
      }
    } else {
      return { ok: false, erro: 'pedido sem itens' };
    }
  } else {
    return { ok: false, erro: 'pedido inválido' };
  }
}`,
        tests: [
          {
            description: 'Pedido de R$ 40 sai com frete: { ok: true, total: 55 }',
            assertion: `const r = processarPedido({ itens: [{ preco: 20, quantidade: 2 }] });
if (JSON.stringify(r) !== '{"ok":true,"total":55}') throw new Error('esperava {ok: true, total: 55}, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Pedido de R$ 120 tem frete grátis: { ok: true, total: 120 }',
            assertion: `const r = processarPedido({ itens: [{ preco: 60, quantidade: 2 }] });
if (JSON.stringify(r) !== '{"ok":true,"total":120}') throw new Error('esperava {ok: true, total: 120}, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Sem itens: { ok: false, erro: "pedido sem itens" }; sem pedido: "pedido inválido"',
            assertion: `const vazio = processarPedido({ itens: [] });
if (JSON.stringify(vazio) !== '{"ok":false,"erro":"pedido sem itens"}') throw new Error('com itens: [] esperava o erro "pedido sem itens", veio ' + JSON.stringify(vazio));
const nada = processarPedido(null);
if (JSON.stringify(nada) !== '{"ok":false,"erro":"pedido inválido"}') throw new Error('com null esperava o erro "pedido inválido", veio ' + JSON.stringify(nada));
const semLista = processarPedido({ itens: 'x' });
if (JSON.stringify(semLista) !== '{"ok":false,"erro":"pedido inválido"}') throw new Error('com itens que não é lista esperava "pedido inválido", veio ' + JSON.stringify(semLista));`,
          },
        ],
        constraints: [
          { description: 'Existe `validarPedido(pedido)`, que devolve a mensagem de erro ou `null`', required: 'function validarPedido(' },
          { description: 'Existe `calcularSubtotal(itens)`', required: 'function calcularSubtotal(' },
          { description: 'Nenhum `else`: os casos que não servem saem com `return` antes', forbidden: 'else' },
        ],
        explanation:
          'A função grande virou o sumário: valida, soma, aplica o frete. As guardas de `validarPedido` tratam o que não serve e saem, na ordem em que uma depende da outra (existe? é lista? tem itens?), e o caminho principal ficou na margem esquerda. Sem `else`, cada linha se lê sozinha.',
        solution: `function validarPedido(pedido) {
  if (!pedido || !Array.isArray(pedido.itens)) return 'pedido inválido';
  if (pedido.itens.length === 0) return 'pedido sem itens';
  return null;
}

function calcularSubtotal(itens) {
  let subtotal = 0;
  for (const item of itens) {
    subtotal = subtotal + item.preco * item.quantidade;
  }
  return subtotal;
}

function processarPedido(pedido) {
  const erro = validarPedido(pedido);
  if (erro) return { ok: false, erro };
  const subtotal = calcularSubtotal(pedido.itens);
  if (subtotal > 100) return { ok: true, total: subtotal };
  return { ok: true, total: subtotal + 15 };
}`,
        hints: [
          'Comece pelas guardas: o que não serve sai primeiro, com `return`. A condição de cada `else` vira a condição negada de um `if` no começo.',
          'O laço da soma é o segundo bloco com nome: recebe os itens, devolve o número.',
          '`processarPedido` termina com quatro linhas: pega o erro (e sai se houver), calcula o subtotal, aplica o frete, devolve.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-5-guardas',
        type: 'predict-output',
        prompt: 'O que este programa imprime? A ordem das guardas decide.',
        concepts: ['eng-funcoes'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'funcoes', 'guardas'],
        code: `function classificar(pedido) {
  if (!pedido) return 'inválido';
  if (pedido.itens.length === 0) return 'vazio';
  if (pedido.total > 100) return 'grande';
  return 'normal';
}

console.log(classificar(null));
console.log(classificar({ itens: [], total: 500 }));
console.log(classificar({ itens: ['caderno'], total: 500 }));
console.log(classificar({ itens: ['caneta'], total: 3 }));`,
        expectedOutput: `inválido
vazio
grande
normal`,
        explanation:
          'Cada guarda sai assim que a condição bate, e as seguintes nem rodam. O segundo pedido tem total 500, mas a guarda de "vazio" vem antes da de "grande" — e é isso que se quer: um pedido sem itens é vazio, não importa o total. Guardas em ordem de dependência: existe? tem itens? só então, quanto?',
        hints: ['Para o pedido com `itens: []` e `total: 500`, qual guarda é a primeira a bater?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-5-parametro',
        type: 'refactor',
        prompt:
          'Três funções, três cópias da mesma conta com um número diferente. Escreva `aplicarDesconto(preco, percentual)` e faça as três usarem-na — elas continuam existindo, porque quem as chama não muda.',
        concepts: ['eng-funcoes'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'funcoes', 'refatorar', 'parametro'],
        initialCode: `function descontoEstudante(preco) {
  return Math.round((preco - preco * 0.1) * 100) / 100;
}

function descontoIdoso(preco) {
  return Math.round((preco - preco * 0.15) * 100) / 100;
}

function descontoFuncionario(preco) {
  return Math.round((preco - preco * 0.3) * 100) / 100;
}`,
        tests: [
          {
            description: 'descontoEstudante(50) é 45; descontoIdoso(50) é 42.5; descontoFuncionario(50) é 35',
            assertion: `if (descontoEstudante(50) !== 45) throw new Error('descontoEstudante(50) deveria ser 45, veio ' + descontoEstudante(50));
if (descontoIdoso(50) !== 42.5) throw new Error('descontoIdoso(50) deveria ser 42.5, veio ' + descontoIdoso(50));
if (descontoFuncionario(50) !== 35) throw new Error('descontoFuncionario(50) deveria ser 35, veio ' + descontoFuncionario(50));`,
          },
          {
            description: 'O arredondamento continua: descontoIdoso(19.99) é 16.99',
            assertion: `if (descontoIdoso(19.99) !== 16.99) throw new Error('descontoIdoso(19.99) deveria ser 16.99, veio ' + descontoIdoso(19.99));`,
          },
        ],
        constraints: [
          { description: 'Existe `aplicarDesconto(preco, percentual)`', required: 'function aplicarDesconto(' },
          { description: 'As três funções não fazem mais a conta: chamam `aplicarDesconto` com o percentual', forbidden: 'preco * 0.' },
        ],
        explanation:
          'Três cópias viraram uma função com um parâmetro. O dia em que o arredondamento mudar — ou o desconto passar a ter um teto — a mudança é num lugar, e as três continuam certas. As três funções de fachada continuam existindo porque o resto do projeto as chama; por dentro, cada uma virou uma linha.',
        solution: `function aplicarDesconto(preco, percentual) {
  return Math.round((preco - preco * (percentual / 100)) * 100) / 100;
}

function descontoEstudante(preco) {
  return aplicarDesconto(preco, 10);
}

function descontoIdoso(preco) {
  return aplicarDesconto(preco, 15);
}

function descontoFuncionario(preco) {
  return aplicarDesconto(preco, 30);
}`,
        hints: [
          'O que muda entre as três é um número. Esse número vira o segundo parâmetro.',
          'Cada função antiga vira uma linha: a chamada de `aplicarDesconto` com o seu percentual.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-5-passos',
        type: 'order-steps',
        prompt: 'Coloque na ordem os passos para extrair um bloco de código para uma função, sem quebrar nada.',
        concepts: ['eng-funcoes'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'funcoes', 'processo'],
        steps: [
          { id: 'nome', text: 'Escolher o bloco e dar um nome a ele — se não dá para nomear, o corte está errado', ordem: 1 },
          { id: 'mover', text: 'Criar a função com esse nome e mover o bloco para dentro', ordem: 2 },
          { id: 'params', text: 'O que o bloco usava de fora vira parâmetro; o que ele produzia vira retorno', ordem: 3 },
          { id: 'chamar', text: 'No lugar do bloco, a chamada da função nova', ordem: 4 },
          { id: 'rodar', text: 'Rodar os testes', ordem: 5 },
        ],
        explanation:
          'O nome vem primeiro porque é o teste do corte: um bloco que não tem nome não é um pedaço com um assunto. Só depois de mover é que se vê o que ele usava de fora — e se forem sete coisas, o passo 1 estava errado. A chamada substitui o bloco, e os testes provam que nada mudou.',
        hints: [
          'O que decide se o bloco merece virar função vem antes de qualquer mudança.',
          'Parâmetros e retorno só ficam claros depois de o bloco estar dentro da função nova.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-5-guarda-sem-return',
        type: 'find-bug',
        prompt:
          'Este programa quebra ao rodar: "Cannot read properties of null (reading \'itens\')". Aponte a linha que precisa mudar.',
        concepts: ['eng-funcoes'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'funcoes', 'guardas', 'bug'],
        code: `function descreverPedido(pedido) {
  if (!pedido) 'sem pedido';
  return pedido.itens.length + ' itens: ' + pedido.itens.map((i) => i.nome).join(', ');
}

console.log(descreverPedido({ itens: [{ nome: 'Caderno' }, { nome: 'Caneta' }] }));
console.log(descreverPedido(null));`,
        buggyLine: 2,
        fix: "  if (!pedido) return 'sem pedido';",
        symptomLine: 3,
        symptomFeedback:
          'É aqui que o erro aparece — `pedido` é `null` —, mas esta linha é o caminho principal, e está certa para um pedido de verdade. O problema é que o caso do `null` deveria ter saído **antes** de chegar aqui. Veja a guarda.',
        explanation:
          'Uma guarda é `if (condição) return …`. Sem o `return`, a linha avalia o texto `"sem pedido"` e o descarta — e a função segue para o caminho principal com `pedido` nulo. É um erro fácil de cometer e difícil de ver, porque a linha parece uma guarda. A regra: guarda sem `return` (ou `throw`) não é guarda.',
        hints: [
          'Uma guarda precisa fazer a função **sair**. O que faz uma função sair?',
          "A expressão `'sem pedido'` sozinha numa linha não faz nada: é avaliada e jogada fora.",
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Função pequena é a que **cabe na cabeça de quem lê**: um assunto, um nome sem "e", nenhum comentário de seção por dentro. Cada comentário desses é uma função esperando para nascer.

Extrair é mecânico — nome, mover, parâmetros e retorno, chamada, rodar — e o número de parâmetros que o bloco precisa diz se o corte estava certo. **Cópia com um número diferente é uma função com um parâmetro**; mas a regra dos três vale: extraia quando a repetição aparecer de verdade, não antes.

**Retorne cedo**: guardas na frente, em ordem de dependência, e o caminho principal na margem esquerda, sem \`else\`. Uma guarda sem \`return\` não é guarda. Até três parâmetros; depois, um objeto com nomes.

Na próxima aula, como as funções **falham**: erros como contrato.
`.trim(),
    },
  ],
};

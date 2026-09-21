import type { Lesson } from '../types';

export const lessonEngNomes: Lesson = {
  id: 'lesson-eng-4',
  trackId: 'track-engenharia',
  title: 'Nomes',
  language: 'node',
  objective:
    'Escolher nomes que dizem o que a coisa é e faz — verbos para funções, substantivos para dados, perguntas para booleanos —, sem abreviação, sem mentira, e uma palavra só por conceito no projeto inteiro.',
  concepts: ['eng-nomes'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um nome é escrito uma vez e lido cem. Toda vez que alguém lê \`calc(p)\`, gasta um segundo traduzindo — e às vezes traduz errado. \`calcularTotalComFrete(pedido)\` custa dois segundos a mais para escrever e zero para ler. Esta aula é sobre onde ir buscar esses nomes.

## Verbos, substantivos, perguntas

A gramática já resolve metade:

- **Função é um verbo**: faz alguma coisa. \`calcularTotal\`, \`buscarPedido\`, \`enviarConfirmacao\`, \`formatarMoeda\`. Uma função chamada \`total\` ou \`pedido\` esconde que age.
- **Dado é um substantivo**: \`pedido\`, \`totalComFrete\`, \`clientesAtivos\`. Uma variável chamada \`calcular\` esconde que é um valor.
- **Booleano é uma pergunta** que se responde com sim ou não: \`estaAtivo\`, \`temEstoque\`, \`podeEditar\`, \`venceu\`. \`if (podeEditar)\` se lê sozinho; \`if (edicao)\` obriga a olhar o que \`edicao\` guarda.

Com isso, \`const clientesAtivos = filtrarAtivos(clientes)\` se lê como frase. É o teste: **um trecho com bons nomes se lê em voz alta**.

## Sem abreviação

\`qtd\`, \`usr\`, \`calc\`, \`tmp\`, \`aux\`, \`res2\`, \`dataFmt\`. Cada uma economiza três letras para quem escreve e cobra uma tradução de quem lê — inclusive de você, daqui a um mês. Escreva \`quantidade\`, \`usuario\`, \`calcular\`. O editor completa; o leitor não.

As exceções são as abreviações que **o mundo inteiro** usa e ninguém precisa traduzir: \`id\`, \`url\`, \`html\`, \`i\` num laço de três linhas, \`req\` e \`res\` no Express. A régua é essa: se um colega que nunca viu o projeto lê sem parar, pode.

## Sem mentira

O nome é uma **promessa**. \`buscarUsuario\` promete só buscar; se também cria quando não acha, quem lê \`buscarUsuario(email)\` numa lista de chamadas nunca vai desconfiar que um cadastro apareceu. \`lista\` que é um objeto, \`total\` que é um subtotal, \`pedidosAtivos\` que inclui os cancelados: cada um é um bug esperando o leitor que confiou no nome.

Quando a função passa a fazer mais, ou o nome cresce (\`buscarOuCriarUsuario\`) ou a função se divide. O que não pode é o nome ficar velho.

## Uma palavra por conceito

Se apagar é \`remover\` num arquivo, \`apagar\` noutro e \`excluir\` no terceiro, quem procura a função de apagar precisa tentar três palavras. O projeto escolhe **uma** e usa em toda parte: \`buscar\` (um), \`listar\` (vários), \`criar\`, \`alterar\`, \`remover\`. O mesmo vale para o idioma: ou tudo em português (\`calcularTotal\`) ou tudo em inglês (\`calculateTotal\`); \`getPedido\` é o pior dos dois.

## Tamanho proporcional ao alcance

\`i\` num laço de três linhas está ótimo — o leitor vê a declaração e o uso na mesma tela. \`i\` numa função de quarenta linhas obriga a rolar para lembrar. Regra: **quanto mais longe o nome viaja, mais ele precisa dizer**. Variável local curta, função exportada completa, módulo dizendo o assunto.

## O nome do arquivo

O arquivo se chama pelo que exporta: \`moeda.js\` exporta \`formatarMoeda\`; \`pedidos.js\` exporta o que é de pedidos. Nomes que dizem "não sei onde pôr" — \`utils.js\`, \`helpers.js\`, \`misc.js\`, \`funcoes.js\`, \`novo.js\`, \`final2.js\` — são os arquivos em que tudo acaba caindo e nada é achado.

## Renomear é barato

Com testes, renomear é a mudança mais segura que existe: mude a definição, rode, e cada erro "não está definido" aponta um uso que faltou. Por isso não vale a pena viver com um nome ruim "porque já está em todo lugar": em todo lugar é exatamente onde o erro vai apontar.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// ANTES: cada nome cobra uma tradução.
function calc(p) {
  let t = 0;
  for (const i of p.itens) t = t + i.preco * i.qtd;
  const f = t > 100 ? 0 : 15;
  return t + f;
}

// DEPOIS: lê-se em voz alta, e a regra do frete grátis ficou visível.
const FRETE_PADRAO = 15;
const MINIMO_PARA_FRETE_GRATIS = 100;

function calcularSubtotal(itens) {
  let subtotal = 0;
  for (const item of itens) subtotal = subtotal + item.preco * item.quantidade;
  return subtotal;
}

function calcularTotalComFrete(pedido) {
  const subtotal = calcularSubtotal(pedido.itens);
  const temFreteGratis = subtotal > MINIMO_PARA_FRETE_GRATIS;
  return subtotal + (temFreteGratis ? 0 : FRETE_PADRAO);
}`,
      caption:
        'Verbo na função, substantivo no dado, pergunta no booleano, e os números mágicos com nome. O código ficou maior e passou a se explicar — o comentário que faltava virou nome.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-4-booleano',
        type: 'multiple-choice',
        prompt:
          'Uma função recebe um usuário e um post e devolve `true` quando o usuário tem permissão para editar aquele post. Qual é o melhor nome?',
        concepts: ['eng-nomes'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'nomes', 'booleano'],
        options: [
          '`podeEditar(usuario, post)` — uma pergunta que se responde com sim ou não',
          '`permissao(usuario, post)` — o que ela verifica',
          '`checkEdit(usuario, post)` — curto e direto',
          '`editar(usuario, post)` — o que está em jogo',
        ],
        correctIndex: 0,
        explanation:
          'Quem lê `if (podeEditar(usuario, post))` entende sem abrir a função. `permissao` é substantivo: parece devolver um objeto de permissão. `checkEdit` mistura idiomas e abrevia. `editar` é uma mentira grave — promete editar, e só pergunta.',
        hints: ['A função responde sim ou não. Qual dos nomes se lê como uma pergunta dentro de um `if`?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-4-renomear',
        type: 'refactor',
        prompt:
          'A porta do módulo já tem o nome certo, `calcularTotalComFrete`; o de dentro está em código secreto. Renomeie tudo o que estiver abreviado ou sem significado — a função, as variáveis, o `qtd` — até o trecho se ler em voz alta. Os números mágicos (100 e 15) ganham constantes com nome.',
        concepts: ['eng-nomes'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'nomes', 'refatorar'],
        initialCode: `function calc(p) {
  let t = 0;
  for (const i of p.itens) {
    const qtd = i.quantidade;
    t = t + i.preco * qtd;
  }
  const f = t > 100 ? 0 : 15;
  return t + f;
}

module.exports = { calcularTotalComFrete: calc };`,
        tests: [
          {
            description: 'Pedido de R$ 40 paga R$ 15 de frete: total 55',
            assertion: `const r = module.exports.calcularTotalComFrete({ itens: [{ preco: 20, quantidade: 2 }] });
if (r !== 55) throw new Error('esperava 55 (40 + 15 de frete), veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Pedido acima de R$ 100 tem frete grátis: 120 fica 120',
            assertion: `const r = module.exports.calcularTotalComFrete({ itens: [{ preco: 60, quantidade: 2 }] });
if (r !== 120) throw new Error('esperava 120 (frete grátis acima de 100), veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Exatamente R$ 100 ainda paga frete: 115',
            assertion: `const r = module.exports.calcularTotalComFrete({ itens: [{ preco: 100, quantidade: 1 }] });
if (r !== 115) throw new Error('esperava 115 (100 não passa de 100), veio ' + JSON.stringify(r));`,
          },
        ],
        constraints: [
          { description: 'A função se chama `calcularTotalComFrete`, e não `calc`', required: 'function calcularTotalComFrete(' },
          { description: 'Nada de `qtd`: é `quantidade`', forbidden: 'qtd' },
          { description: 'O acumulador não se chama `t`', forbidden: 'let t ' },
          { description: 'O frete não se chama `f`', forbidden: 'const f ' },
          { description: 'Os números 100 e 15 têm nome: constantes em maiúsculas', required: 'const ' },
        ],
        explanation:
          'Renomear não mudou nenhum teste — é a mudança mais segura que existe — e mudou tudo para quem lê: `subtotal`, `frete`, `item.quantidade`, `FRETE_PADRAO`, `MINIMO_PARA_FRETE_GRATIS`. A regra do negócio ("acima de 100 o frete é grátis") estava escondida em `t > 100 ? 0 : 15` e agora está escrita.',
        solution: `const FRETE_PADRAO = 15;
const MINIMO_PARA_FRETE_GRATIS = 100;

function calcularTotalComFrete(pedido) {
  let subtotal = 0;
  for (const item of pedido.itens) {
    subtotal = subtotal + item.preco * item.quantidade;
  }
  const frete = subtotal > MINIMO_PARA_FRETE_GRATIS ? 0 : FRETE_PADRAO;
  return subtotal + frete;
}

module.exports = { calcularTotalComFrete };`,
        hints: [
          'Leia cada nome e pergunte o que ele guarda: `p` é o pedido, `t` é o que se acumula, `i` é cada item, `f` é o frete.',
          'Os números 100 e 15 são regras do negócio: uma constante com nome para cada, fora da função.',
          'Depois de renomear a função, a porta vira `module.exports = { calcularTotalComFrete }` — sem o apelido.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-4-mentira',
        type: 'predict-output',
        prompt: 'O que este programa imprime? Leia o nome da função, e depois o que ela faz.',
        concepts: ['eng-nomes'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'nomes'],
        code: `const pedidos = [];

function obterPedidos() {
  pedidos.push({ id: pedidos.length + 1 });
  return pedidos;
}

console.log(obterPedidos().length);
console.log(obterPedidos().length);
console.log(pedidos.length);`,
        expectedOutput: `1
2
2`,
        explanation:
          '`obter` promete só ler — e a função cria um pedido a cada chamada. Quem lê `obterPedidos()` duas vezes espera o mesmo resultado, e recebe uma lista que cresce. O nome mente, e é o tipo de mentira que ninguém procura: o bug vai ser caçado em qualquer lugar menos numa função chamada `obter`.',
        hints: ['O que a função faz **antes** de devolver a lista? Isso acontece a cada chamada?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-4-arquivo',
        type: 'multiple-choice',
        prompt: 'Um módulo exporta `formatarMoeda` e `formatarData`. Como deve se chamar o arquivo?',
        concepts: ['eng-nomes'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'nomes', 'arquivos'],
        options: [
          '`formatacao.js` — o assunto que as duas têm em comum',
          '`utils.js` — são funções utilitárias',
          '`funcoes.js` — são funções',
          '`moedaEData.js` — os dois nomes juntos',
        ],
        correctIndex: 0,
        explanation:
          'O arquivo se chama pelo assunto que exporta. `utils.js` e `funcoes.js` dizem "não sei onde pôr": viram a gaveta em que tudo cai. `moedaEData.js` não aguenta a terceira função — `formatarPercentual` faria o nome mentir. `formatacao.js` diz o que há dentro e cabe o que vier.',
        hints: ['Que palavra descreve as duas funções — e a terceira que aparecer?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-4-maiuscula',
        type: 'find-bug',
        prompt: 'Este programa quebra ao rodar: "calcularSubTotal is not defined". Aponte a linha que precisa mudar.',
        concepts: ['eng-nomes'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'nomes', 'bug'],
        code: `const FRETE_PADRAO = 15;

function calcularSubtotal(itens) {
  let subtotal = 0;
  for (const item of itens) subtotal = subtotal + item.preco * item.quantidade;
  return subtotal;
}

function calcularTotalComFrete(pedido) {
  return calcularSubTotal(pedido.itens) + FRETE_PADRAO;
}

console.log(calcularTotalComFrete({ itens: [{ preco: 20, quantidade: 2 }] }));`,
        buggyLine: 10,
        fix: '  return calcularSubtotal(pedido.itens) + FRETE_PADRAO;',
        explanation:
          'A função existe, mas o nome usado tem um **T** maiúsculo a mais: `calcularSubTotal` e `calcularSubtotal` são identificadores diferentes. É o custo de um conceito escrito de dois jeitos — "subtotal" é uma palavra, e o projeto precisa escrevê-la de um jeito só, em toda parte. Um editor com autocompletar evita; uma convenção escrita evita mais.',
        hints: [
          'A mensagem diz que o nome não existe. Compare, letra por letra, o nome chamado com o nome definido.',
          '"Subtotal" é uma palavra ou duas? O projeto precisa decidir uma vez.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Um nome é escrito uma vez e lido cem. **Função é verbo**, **dado é substantivo**, **booleano é pergunta** — e o trecho com bons nomes se lê em voz alta.

**Sem abreviação** (fora as universais: \`id\`, \`url\`, \`i\` de três linhas), **sem mentira** (o nome é uma promessa: \`obter\` não cria), **uma palavra por conceito** no projeto inteiro e um idioma só. O tamanho do nome cresce com a distância que ele viaja. O arquivo se chama pelo que exporta — nunca \`utils.js\`.

Renomear é a mudança mais segura que existe: os erros apontam cada uso que faltou.

Na próxima aula, o tamanho das funções: uma coisa só, e quando extrair — e quando não.
`.trim(),
    },
  ],
};

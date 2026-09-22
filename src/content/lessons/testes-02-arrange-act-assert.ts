import type { Lesson } from '../types';

const CARRINHO = `function totalDoCarrinho(itens) {
  const semDesconto = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  const temDesconto = semDesconto > 200;
  return temDesconto ? Math.round(semDesconto * 0.9 * 100) / 100 : semDesconto;
}`;

export const lessonTestesArrangeActAssert: Lesson = {
  id: 'lesson-testes-2',
  trackId: 'track-testes',
  title: 'Arrange, Act, Assert',
  language: 'javascript',
  objective:
    'Reconhecer e escrever testes na forma arrange/act/assert, e entender por que separar as três partes torna um teste mais fácil de ler e de consertar.',
  concepts: ['testes-aaa'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um teste bem escrito conta uma história em três atos, sempre na mesma ordem — e quem já leu um teste assim reconhece a forma dos outros mil.

## As três partes

~~~js
// Arrange (preparar): monta o cenário.
const itens = [{ preco: 50, quantidade: 2 }];

// Act (agir): faz a única coisa que este teste verifica.
const total = totalDoCarrinho(itens);

// Assert (verificar): afirma o que deveria ter acontecido.
assert(total === 100, 'dois itens de 50 somam 100');
~~~

**Arrange** é tudo que o teste precisa **antes** de agir: os dados de entrada, um objeto, uma lista. **Act** é a chamada que o teste está de fato testando — geralmente uma linha só. **Assert** é a afirmação sobre o resultado.

## Por que separar

Um teste que mistura as três partes é mais difícil de consertar quando falha:

~~~js
// Tudo misturado — difícil de saber o que está sendo testado
assert(totalDoCarrinho([{ preco: 50, quantidade: 2 }]) === 100, 'ok');
~~~

Comparado com a versão separada, o de cima não é *errado* — mas quando ele falhar, quem lê precisa desmontar a linha inteira para entender o que era esperado, com o quê, e por quê. Com as três partes visíveis, cada uma se lê e se corrige sozinha: o \`arrange\` diz o cenário, o \`act\` diz o que foi chamado, o \`assert\` diz o que se esperava.

## Um "act" por teste

Um sinal de que um teste está fazendo demais: mais de uma chamada de \`act\` antes do \`assert\`.

~~~js
// Dois "acts": qual dos dois o assert está verificando?
const total1 = totalDoCarrinho([{ preco: 50, quantidade: 1 }]);
const total2 = totalDoCarrinho([{ preco: 300, quantidade: 1 }]);
assert(total1 === 50 && total2 === 270, 'os dois cálculos batem');
~~~

Se esse teste falhar, a mensagem não diz **qual** dos dois cálculos errou. Dois testes separados, cada um com seu \`arrange\`/\`act\`/\`assert\`, apontam o problema exato:

~~~js
const semDesconto = totalDoCarrinho([{ preco: 50, quantidade: 1 }]);
assert(semDesconto === 50, 'carrinho de 50 não tem desconto');

const comDesconto = totalDoCarrinho([{ preco: 300, quantidade: 1 }]);
assert(comDesconto === 270, 'carrinho acima de 200 tem 10% de desconto');
~~~

## O arrange pode ser simples

Nem todo \`arrange\` precisa de uma variável: quando o cenário cabe na própria chamada, ele desaparece dentro do \`act\` e ainda assim as três partes existem — só que a primeira é implícita:

~~~js
assert(totalDoCarrinho([]) === 0, 'carrinho vazio soma zero');
~~~

Aqui \`[]\` é o arrange (o cenário: nenhum item), a chamada é o act, e o \`assert\` fecha. A forma continua valendo mesmo compacta.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `function calcularIdade(anoDeNascimento, anoAtual) {
  return anoAtual - anoDeNascimento;
}

// Arrange
const nascimento = 1990;
const agora = 2024;

// Act
const idade = calcularIdade(nascimento, agora);

// Assert
assert(idade === 34, 'nascido em 1990, em 2024 tem 34 anos');`,
      caption:
        'As três partes, cada uma numa linha (ou grupo de linhas) própria. Quando o teste falhar, dá para ver de cara qual das três não bateu.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-2-identificar',
        type: 'order-steps',
        prompt: 'Coloque estas linhas de um teste na ordem arrange, act, assert.',
        concepts: ['testes-aaa'],
        difficulty: 'iniciante',
        tags: ['testes', 'aaa'],
        steps: [
          { id: 'arrange', text: 'const pedido = { itens: [{ preco: 10, quantidade: 3 }] }; — monta o cenário', ordem: 1 },
          { id: 'act', text: 'const total = calcularTotal(pedido); — faz a chamada que está sendo testada', ordem: 2 },
          { id: 'assert', text: "assert(total === 30, 'três itens de 10 somam 30'); — afirma o resultado esperado", ordem: 3 },
        ],
        explanation:
          'O cenário vem antes de qualquer chamada — sem ele, não haveria o que passar para a função. A chamada vem antes da verificação, porque é o resultado dela que o assert confere. A ordem arrange/act/assert nunca muda, mesmo quando alguma das três partes é só uma linha.',
        hints: ['O que precisa existir antes de a função poder ser chamada?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-2-um-act',
        type: 'multiple-choice',
        prompt:
          'Um teste faz duas chamadas de `totalDoCarrinho` com carrinhos diferentes, e um `assert` só no fim conferindo os dois resultados com `&&`. Esse teste falha. O que há de errado com ele — além do resultado errado em si?',
        concepts: ['testes-aaa'],
        difficulty: 'intermediario',
        tags: ['testes', 'aaa'],
        options: [
          'A mensagem de falha não diz qual das duas chamadas errou — os dois "acts" deveriam ser dois testes separados',
          'JavaScript não permite duas chamadas de função antes de um assert',
          'O `&&` dentro do assert é sintaxe inválida',
          'Não há nada de errado: um teste pode verificar quantas coisas quiser de uma vez',
        ],
        correctIndex: 0,
        explanation:
          'O problema não é a sintaxe — é o diagnóstico. Quando esse teste falha, "os dois cálculos batem" não diz qual dos dois carrinhos deu o resultado errado. Um teste, um "act", uma pergunta clara: é assim que a falha aponta direto para a causa.',
        hints: ['Se esse teste falhar amanhã, o que a mensagem vai te dizer sobre qual dos dois carrinhos quebrou?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-2-testar-carrinho',
        type: 'write-test',
        prompt:
          'A função `totalDoCarrinho(itens)` abaixo está **correta**: soma preço vezes quantidade, e aplica 10% de desconto quando o total passa de 200. Escreva testes na forma arrange/act/assert — um sem desconto, um com desconto, e um exatamente em 200 (o limite não entra no desconto).',
        concepts: ['testes-aaa'],
        difficulty: 'intermediario',
        tags: ['testes', 'aaa', 'assert'],
        subject: CARRINHO,
        initialCode: `// Um teste por bloco, na forma arrange / act / assert.

`,
        mutants: [
          {
            description: 'aplica o desconto sempre, mesmo abaixo de 200',
            code: `function totalDoCarrinho(itens) {
  const semDesconto = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  return Math.round(semDesconto * 0.9 * 100) / 100;
}`,
          },
          {
            description: 'usa >= 200 em vez de > 200 (o limite exato entra no desconto)',
            code: `function totalDoCarrinho(itens) {
  const semDesconto = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  const temDesconto = semDesconto >= 200;
  return temDesconto ? Math.round(semDesconto * 0.9 * 100) / 100 : semDesconto;
}`,
          },
          {
            description: 'ignora a quantidade, soma só os preços únicos',
            code: `function totalDoCarrinho(itens) {
  const semDesconto = itens.reduce((soma, item) => soma + item.preco, 0);
  const temDesconto = semDesconto > 200;
  return temDesconto ? Math.round(semDesconto * 0.9 * 100) / 100 : semDesconto;
}`,
          },
        ],
        hints: [
          'Um carrinho com total abaixo de 200 não deveria ter desconto; um acima de 200, sim.',
          'Teste também com quantidade maior que 1 num item — isso pega quem esquece de multiplicar.',
          'O limite exato, 200, é o que separa `>` de `>=`: com exatamente 200, não deveria haver desconto.',
          "const abaixo = [{ preco: 50, quantidade: 2 }]; assert(totalDoCarrinho(abaixo) === 100, 'sem desconto abaixo de 200'); const acima = [{ preco: 100, quantidade: 3 }]; assert(totalDoCarrinho(acima) === 270, 'com desconto acima de 200'); const noLimite = [{ preco: 100, quantidade: 2 }]; assert(totalDoCarrinho(noLimite) === 200, 'exatamente 200 não entra no desconto');",
        ],
        solution: `const abaixo = [{ preco: 50, quantidade: 2 }];
assert(totalDoCarrinho(abaixo) === 100, 'sem desconto abaixo de 200');
const acima = [{ preco: 100, quantidade: 3 }];
assert(totalDoCarrinho(acima) === 270, 'com desconto acima de 200 (300 * 0.9)');
const noLimite = [{ preco: 100, quantidade: 2 }];
assert(totalDoCarrinho(noLimite) === 200, 'exatamente 200 nao entra no desconto');`,
        explanation:
          'O primeiro teste (100, sem desconto) pega a sabotagem que aplica desconto sempre e a que ignora a quantidade — 100 exige multiplicar 50 por 2. O terceiro, exatamente em 200, é o único que distingue `>` de `>=`: com a implementação correta o resultado é 200 (sem desconto); com `>=`, seria 180. Testar só o meio de cada faixa (100 e 300) não pegaria essa troca de operador — é por isso que o limite exato é o teste que mais vale.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-2-implicito',
        type: 'predict-output',
        prompt:
          'O `arrange` deste teste é só o argumento `[]`, sem variável própria. O que este programa imprime?',
        concepts: ['testes-aaa'],
        difficulty: 'iniciante',
        tags: ['testes', 'aaa'],
        code: `function totalDoCarrinho(itens) {
  return itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
}

try {
  assert(totalDoCarrinho([]) === 0, 'carrinho vazio soma zero');
  console.log('passou');
} catch (erro) {
  console.log('falhou: ' + erro.message);
}

function assert(condicao, mensagem) {
  if (!condicao) throw new Error(mensagem);
}`,
        expectedOutput: 'passou',
        explanation:
          '`reduce` numa lista vazia devolve o valor inicial passado (`0`), então `totalDoCarrinho([])` é `0` — a afirmação é verdadeira e o teste passa. O arrange (uma lista vazia) está ali, só que dentro da própria chamada em vez de numa variável separada; a forma das três partes continua presente.',
        hints: ['O que `reduce` devolve quando a lista está vazia e há um valor inicial?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-2-arrange-tardio',
        type: 'multiple-choice',
        prompt:
          'Este teste passa — mas passaria mesmo se `adicionarItem` estivesse quebrada. O que há de errado?\n\n```javascript\nfunction adicionarItem(carrinho, item) {\n  carrinho.push(item);\n  return carrinho;\n}\n\nconst carrinho = [\'caneta\'];\nconst resultado = adicionarItem(carrinho, \'caderno\');\nassert(carrinho.length === 2, \'depois de adicionar, tem dois itens\');\n```',
        concepts: ['testes-aaa'],
        difficulty: 'intermediario',
        tags: ['testes', 'aaa'],
        options: [
          'O assert confere `carrinho`, a variável do arrange — não `resultado`, o que o act (a chamada) devolveu',
          'Falta um segundo item no array inicial',
          '`push` não existe em JavaScript',
          'A mensagem do assert está em português, e deveria estar em inglês',
        ],
        correctIndex: 0,
        explanation:
          'O **act** foi `adicionarItem(carrinho, \'caderno\')`, cujo resultado é `resultado` — é ele que o teste deveria conferir. Como `push` também altera o array original por efeito colateral, o teste passa por acidente. Se `adicionarItem` fosse reescrita para devolver uma cópia nova (sem alterar `carrinho`), esse teste continuaria "passando" mesmo com a função quebrada, porque `carrinho` nunca mudaria. Um assert precisa verificar o valor que o act devolveu, não uma variável que só por coincidência também mudou.',
        hints: [
          'Qual variável guarda o valor de retorno da função que está sendo testada — o "act"?',
          'Um teste que confere a variável errada pode passar mesmo quando a função está quebrada.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
**Arrange** monta o cenário, **act** faz a chamada que está sendo testada, **assert** afirma o resultado. Separar as três partes — mesmo quando alguma cabe numa palavra — é o que faz a falha apontar direto para a causa.

**Um "act" por teste**: duas chamadas antes de um só assert escondem qual das duas quebrou. Quando dois cenários merecem ser testados, são dois testes.

Na próxima aula, a outra metade da clareza: um teste por comportamento, e nomes que documentam o que o código faz.
`.trim(),
    },
  ],
};

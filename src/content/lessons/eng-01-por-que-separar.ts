import type { Lesson } from '../types';

export const lessonEngPorQueSeparar: Lesson = {
  id: 'lesson-eng-1',
  trackId: 'track-engenharia',
  title: 'Por Que Separar',
  language: 'node',
  objective:
    'Reconhecer o custo de um arquivo que faz tudo, entender coesão e acoplamento em palavras simples, e dividir um programa com segurança — uma responsabilidade por vez.',
  concepts: ['eng-separar'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Todo projeto começa num arquivo só. É certo que comece assim: vinte linhas não precisam de estrutura. O problema é que ele não avisa quando cresce. Um dia o \`app.js\` tem 400 linhas, e cada mudança pequena custa uma tarde. Esta trilha é sobre o que fazer a partir daí — e a primeira aula é sobre **por que** fazer.

## O arquivo que faz tudo

Imagine o \`app.js\` de uma lojinha: lê a configuração, define as rotas, valida o pedido, calcula o frete, formata o preço, grava no banco, monta o e-mail de confirmação, e ainda tem três funções que ninguém lembra para que servem. Funciona. E:

- **Achar** qualquer coisa é rolar a tela. "Onde está a regra do frete?" vira uma busca por \`frete\` com doze resultados.
- **Mudar** uma coisa arrisca outra. A função do frete usa a mesma variável \`total\` que a do desconto; mexeu numa, a outra mudou junto — e ninguém percebe até o cliente reclamar.
- **Entender** exige ler tudo. Para saber se pode apagar uma função, você precisa conferir as 400 linhas, porque qualquer uma pode usá-la.
- **Trabalhar em dupla** é impossível: os dois editam o mesmo arquivo e o Git reclama a cada commit.

Nada disso aparece quando o arquivo nasce. Aparece na terceira semana, e piora a cada dia. "Funciona" não é a régua; a régua é **quanto custa a próxima mudança**.

## Duas palavras: coesão e acoplamento

A engenharia tem dois nomes para o que está acontecendo ali, e eles vão aparecer a trilha inteira:

**Coesão** é o quanto as coisas dentro de um arquivo (ou função, ou pasta) **têm a ver umas com as outras**. Um arquivo coeso tem um assunto: tudo nele muda pelo mesmo motivo. O \`app.js\` da lojinha tem coesão baixa — frete, e-mail e banco mudam por motivos diferentes, em dias diferentes, a pedido de pessoas diferentes.

**Acoplamento** é o quanto uma parte **precisa saber da outra** para funcionar. A função do frete que lê a variável \`total\` da função do desconto está acoplada a ela: não dá para mudar uma sem entender a outra. Acoplamento alto é o que faz uma mudança em A quebrar B, longe dali.

O que se quer é o par: **coesão alta, acoplamento baixo**. Cada arquivo com um assunto, e conversando com os outros pelo mínimo — uma função que recebe o que precisa e devolve o resultado, em vez de uma variável compartilhada.

## A regra: uma razão para mudar

O critério mais útil para saber se algo devia estar junto: **quem pede a mudança?** A regra do frete muda quando o time de logística muda a tabela. O formato do preço muda quando o design pede. O e-mail muda quando o marketing pede. Três pedidos diferentes, três lugares diferentes. Se um arquivo muda por três motivos, são três arquivos esperando para nascer.

O mesmo vale para uma função. \`relatorioDeVendas\` que soma, formata a moeda e monta o texto tem três razões para mudar. Quando a soma ganhar imposto, você vai mexer no meio de um código de formatação — e é ali que os erros entram.

## Como dividir sem quebrar

Separar é uma mudança como qualquer outra, e a regra de toda mudança vale: **uma coisa de cada vez, conferindo no meio**.

1. Tenha um jeito de saber que continua funcionando: os testes, ou ao menos um roteiro ("cadastro, pedido, relatório").
2. Leia o arquivo e **liste as responsabilidades** — os assuntos. Não mexa em nada ainda.
3. Extraia **uma** responsabilidade para uma função (ou um arquivo) com nome claro.
4. Rode. Se quebrou, foi esta extração: desfaça ou conserte, e só então siga.
5. Repita. Pare quando cada pedaço tiver um assunto.

O erro clássico é o passo 3 virar "reorganizo tudo de uma vez": duas horas depois nada roda e não se sabe qual das vinte mudanças quebrou. Separar bem é chato de propósito.

## O que separar custa

Mais arquivos, mais \`require\`, mais nomes para escolher. Isso é custo de verdade, e é por isso que um script de vinte linhas não deve ser dividido em cinco arquivos — a estrutura tem que ser proporcional ao problema. A hora de separar é quando você sente os sintomas da lista lá de cima: rolar para achar, mudar com medo, ler tudo para entender.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// ANTES: uma função, três assuntos. Muda por três motivos.
function relatorioDeVendas(vendas) {
  let total = 0;
  for (const venda of vendas) total = total + venda.preco * venda.quantidade;
  const centavos = Math.round(total * 100);
  const texto = 'R$ ' + Math.floor(centavos / 100) + ',' + String(centavos % 100).padStart(2, '0');
  return 'Total: ' + texto + ' em ' + vendas.length + ' vendas';
}

// DEPOIS: cada função com um assunto, e o relatório só compõe.
function calcularTotal(vendas) {
  let total = 0;
  for (const venda of vendas) total = total + venda.preco * venda.quantidade;
  return total;
}

function formatarMoeda(valor) {
  const centavos = Math.round(valor * 100);
  return 'R$ ' + Math.floor(centavos / 100) + ',' + String(centavos % 100).padStart(2, '0');
}

function relatorioDeVendas(vendas) {
  return 'Total: ' + formatarMoeda(calcularTotal(vendas)) + ' em ' + vendas.length + ' vendas';
}`,
      caption:
        'O mesmo comportamento, separado por razão de mudar: imposto entra em calcularTotal, o design mexe em formatarMoeda, e o texto do relatório fica onde diz. Cada uma cabe na tela e tem um nome que diz o que faz.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-1-sintoma',
        type: 'multiple-choice',
        prompt:
          'Qual destes é o sinal mais claro de que um arquivo tem **coesão baixa** e precisa ser dividido?',
        concepts: ['eng-separar'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'coesao'],
        options: [
          'Ele muda por motivos diferentes: uma semana pelo pedido do design, na outra pela tabela de frete, na outra pelo banco',
          'Ele tem mais de 100 linhas',
          'Ele tem muitos comentários',
          'Ele usa `require` de vários outros arquivos',
        ],
        correctIndex: 0,
        explanation:
          'Tamanho é um sintoma fraco: 100 linhas sobre um assunto só são coesas. O sinal forte é a **razão de mudar**: se pedidos de pessoas diferentes, sobre assuntos diferentes, caem no mesmo arquivo, ele está juntando o que não tem a ver. Usar vários `require` é o contrário — sinal de que as responsabilidades já moram em outros lugares.',
        hints: ['Coesão é sobre as coisas dentro do arquivo terem a ver umas com as outras. Qual opção mostra que não têm?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-1-tres-assuntos',
        type: 'refactor',
        prompt:
          '`relatorioDeVendas` soma, formata a moeda e monta o texto — três razões para mudar. Separe em três funções: `calcularTotal(vendas)` devolve o número, `formatarMoeda(valor)` devolve o texto `R$ 25,50`, e `relatorioDeVendas` só compõe as duas. O texto final não pode mudar.',
        concepts: ['eng-separar'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'refatorar', 'coesao'],
        initialCode: `function relatorioDeVendas(vendas) {
  let total = 0;
  for (const venda of vendas) {
    total = total + venda.preco * venda.quantidade;
  }
  const centavos = Math.round(total * 100);
  const reais = Math.floor(centavos / 100);
  const resto = String(centavos % 100).padStart(2, '0');
  return 'Total: R$ ' + reais + ',' + resto + ' em ' + vendas.length + ' vendas';
}`,
        tests: [
          {
            description: 'relatorioDeVendas com duas vendas devolve "Total: R$ 25,50 em 2 vendas"',
            assertion: `const r = relatorioDeVendas([{ preco: 10, quantidade: 2 }, { preco: 5.5, quantidade: 1 }]);
if (r !== 'Total: R$ 25,50 em 2 vendas') throw new Error('esperava "Total: R$ 25,50 em 2 vendas", veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Sem vendas, devolve "Total: R$ 0,00 em 0 vendas"',
            assertion: `const r = relatorioDeVendas([]);
if (r !== 'Total: R$ 0,00 em 0 vendas') throw new Error('esperava "Total: R$ 0,00 em 0 vendas", veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Centavos com um dígito ganham o zero: R$ 3,05',
            assertion: `const r = relatorioDeVendas([{ preco: 3.05, quantidade: 1 }]);
if (r !== 'Total: R$ 3,05 em 1 vendas') throw new Error('esperava "Total: R$ 3,05 em 1 vendas", veio ' + JSON.stringify(r));`,
          },
        ],
        constraints: [
          { description: 'Existe `calcularTotal(vendas)`, que só soma', required: 'function calcularTotal(' },
          { description: 'Existe `formatarMoeda(valor)`, que só formata', required: 'function formatarMoeda(' },
        ],
        explanation:
          'Cada função ficou com uma razão para mudar: imposto e desconto entram em `calcularTotal`; o design da moeda, em `formatarMoeda`; o texto do relatório, em `relatorioDeVendas`. E as duas primeiras viraram reutilizáveis — a próxima tela que mostrar um preço vai usar `formatarMoeda` em vez de copiar as três linhas dos centavos.',
        solution: `function calcularTotal(vendas) {
  let total = 0;
  for (const venda of vendas) {
    total = total + venda.preco * venda.quantidade;
  }
  return total;
}

function formatarMoeda(valor) {
  const centavos = Math.round(valor * 100);
  const reais = Math.floor(centavos / 100);
  const resto = String(centavos % 100).padStart(2, '0');
  return 'R$ ' + reais + ',' + resto;
}

function relatorioDeVendas(vendas) {
  return 'Total: ' + formatarMoeda(calcularTotal(vendas)) + ' em ' + vendas.length + ' vendas';
}`,
        hints: [
          'Leia a função e marque onde cada assunto começa: o laço é a soma, as três linhas dos centavos são a formatação, o return é o texto.',
          'Extraia um de cada vez e rode os testes no meio. Comece pela soma: ela recebe `vendas` e devolve o número.',
          'No fim, `relatorioDeVendas` vira uma linha só: o texto com `formatarMoeda(calcularTotal(vendas))` dentro.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-1-estado-compartilhado',
        type: 'predict-output',
        prompt: 'O que este programa imprime? Repare em quem lê e quem escreve a variável `desconto`.',
        concepts: ['eng-separar'],
        difficulty: 'intermediario',
        tags: ['engenharia', 'acoplamento'],
        code: `let desconto = 0;

function aplicarCupom(codigo) {
  if (codigo === 'DEZ') desconto = 10;
}

function precoFinal(preco) {
  return preco - desconto;
}

console.log(precoFinal(100));
aplicarCupom('DEZ');
console.log(precoFinal(100));
console.log(precoFinal(50));`,
        expectedOutput: `100
90
40`,
        explanation:
          'As duas funções estão **acopladas por uma variável compartilhada**: `aplicarCupom` escreve em `desconto`, `precoFinal` lê. Depois do cupom, **todo** preço sai com desconto — inclusive o de 50, que ninguém pediu para descontar. Nada na chamada `precoFinal(50)` avisa que o resultado depende de algo que aconteceu antes. O desenho com acoplamento baixo passa o desconto como parâmetro: `precoFinal(preco, desconto)`.',
        hints: ['Depois de `aplicarCupom("DEZ")`, o que `precoFinal` vê quando lê `desconto` — e para quais chamadas?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-1-ordem',
        type: 'order-steps',
        prompt: 'Coloque na ordem os passos para dividir um arquivo grande sem quebrar o programa.',
        concepts: ['eng-separar'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'refatorar', 'processo'],
        steps: [
          { id: 'rede', text: 'Garantir um jeito de saber que continua funcionando: os testes, ou um roteiro de uso', ordem: 1 },
          { id: 'ler', text: 'Ler o arquivo inteiro e listar as responsabilidades — sem mexer em nada', ordem: 2 },
          { id: 'extrair', text: 'Extrair **uma** responsabilidade para uma função ou arquivo com nome claro', ordem: 3 },
          { id: 'rodar', text: 'Rodar. Se quebrou, foi esta extração: desfazer ou consertar antes de seguir', ordem: 4 },
          { id: 'repetir', text: 'Repetir com a próxima responsabilidade, até cada pedaço ter um assunto só', ordem: 5 },
        ],
        explanation:
          'A rede de segurança vem antes de qualquer mudança, senão não há como saber o que quebrou. Ler e listar antes de extrair evita "reorganizar tudo de uma vez" — o erro clássico, em que vinte mudanças sem conferir deixam o programa parado e ninguém sabe qual delas foi. Uma extração, uma rodada.',
        hints: [
          'O que precisa existir antes de qualquer mudança, para você saber se ela quebrou algo?',
          'Entre extrair e repetir, há um passo que confere.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-1-fronteira',
        type: 'server',
        prompt:
          'O módulo `./precos` (acima do editor) já sabe calcular o total e formatar moeda. Escreva o módulo do relatório: exporte `linhaDoRelatorio(vendas)`, que devolve `"Total: R$ 25,50 em 2 vendas"` — usando o que `./precos` exporta, sem reescrever a soma nem a formatação.',
        concepts: ['eng-separar'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'modulos', 'require'],
        arquivos: {
          './precos': `// O assunto deste arquivo é dinheiro: somar e mostrar.
function calcularTotal(vendas) {
  let total = 0;
  for (const venda of vendas) total = total + venda.preco * venda.quantidade;
  return total;
}

function formatarMoeda(valor) {
  const centavos = Math.round(valor * 100);
  return 'R$ ' + Math.floor(centavos / 100) + ',' + String(centavos % 100).padStart(2, '0');
}

module.exports = { calcularTotal, formatarMoeda };
`,
        },
        initialCode: `// O assunto deste arquivo é o relatório. O dinheiro fica em ./precos.

// Exporte linhaDoRelatorio(vendas).
`,
        tests: [
          {
            description: 'linhaDoRelatorio com duas vendas devolve "Total: R$ 25,50 em 2 vendas"',
            assertion: `if (typeof module.exports.linhaDoRelatorio !== 'function') throw new Error('module.exports precisa ter a função linhaDoRelatorio');
const r = module.exports.linhaDoRelatorio([{ preco: 10, quantidade: 2 }, { preco: 5.5, quantidade: 1 }]);
if (r !== 'Total: R$ 25,50 em 2 vendas') throw new Error('esperava "Total: R$ 25,50 em 2 vendas", veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Sem vendas: "Total: R$ 0,00 em 0 vendas"',
            assertion: `const r = module.exports.linhaDoRelatorio([]);
if (r !== 'Total: R$ 0,00 em 0 vendas') throw new Error('esperava "Total: R$ 0,00 em 0 vendas", veio ' + JSON.stringify(r));`,
          },
          {
            description: 'O módulo exporta só o relatório: somar e formatar continuam sendo assunto de ./precos',
            assertion: `const chaves = Object.keys(module.exports);
if (chaves.length !== 1 || chaves[0] !== 'linhaDoRelatorio') throw new Error('o módulo exporta ' + JSON.stringify(chaves) + '; deveria exportar só linhaDoRelatorio — o que é de dinheiro fica em ./precos');`,
          },
        ],
        solution: `const { calcularTotal, formatarMoeda } = require('./precos');

function linhaDoRelatorio(vendas) {
  return 'Total: ' + formatarMoeda(calcularTotal(vendas)) + ' em ' + vendas.length + ' vendas';
}

module.exports = { linhaDoRelatorio };`,
        hints: [
          'Traga as duas funções com `const { calcularTotal, formatarMoeda } = require("./precos")`.',
          'A função do relatório é uma linha: o texto com `formatarMoeda(calcularTotal(vendas))` dentro. Exporte-a com `module.exports = { linhaDoRelatorio }`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-1-de-dentro',
        type: 'find-bug',
        prompt:
          'Este programa quebra ao rodar: "somar is not defined". Aponte a linha que precisa mudar.',
        concepts: ['eng-separar'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'escopo', 'bug'],
        code: `function calcularTotal(vendas) {
  function somar(acumulado, venda) {
    return acumulado + venda.preco * venda.quantidade;
  }
  return vendas.reduce(somar, 0);
}

function calcularMedia(vendas) {
  if (vendas.length === 0) return 0;
  return vendas.reduce(somar, 0) / vendas.length;
}

console.log(calcularMedia([{ preco: 10, quantidade: 1 }, { preco: 20, quantidade: 1 }]));`,
        buggyLine: 10,
        fix: '  return calcularTotal(vendas) / vendas.length;',
        explanation:
          '`somar` é um detalhe **de dentro** de `calcularTotal` — existe só ali, e é assim que deve ser: o resto do programa não precisa saber como a soma é feita. `calcularMedia` tentou usar o detalhe interno de outra função; o certo é usar a **porta** dela, `calcularTotal(vendas)`, que é o que ela oferece ao mundo. Reutilizar pela porta é acoplamento baixo; alcançar o de dentro, quando dá certo, é acoplamento alto — e aqui nem deu.',
        hints: [
          'Onde `somar` foi definida? Quem consegue enxergá-la a partir dali?',
          '`calcularMedia` precisa do total. Já existe uma função que devolve o total.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Um arquivo que faz tudo funciona — e custa caro a cada mudança: achar, mudar sem quebrar, entender, trabalhar em dupla. A régua não é "funciona"; é **quanto custa a próxima mudança**.

**Coesão** é o quanto as coisas de um arquivo têm a ver umas com as outras; **acoplamento** é o quanto uma parte precisa saber da outra. Quer-se coesão alta e acoplamento baixo: cada arquivo com um assunto, conversando pelo mínimo — parâmetros e retornos, não variáveis compartilhadas.

O critério para separar: **uma razão para mudar** por arquivo, por função. E o jeito: rede de segurança, listar, extrair **uma**, rodar, repetir. Estrutura proporcional ao problema — vinte linhas não viram cinco arquivos.

Na próxima aula, a fronteira entre arquivos: o que um módulo **mostra** e o que **esconde**.
`.trim(),
    },
  ],
};

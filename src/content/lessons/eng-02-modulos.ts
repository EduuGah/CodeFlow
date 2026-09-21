import type { Lesson } from '../types';

export const lessonEngModulos: Lesson = {
  id: 'lesson-eng-2',
  trackId: 'track-engenharia',
  title: 'Módulos como Fronteiras',
  language: 'node',
  objective:
    'Decidir o que um módulo mostra e o que esconde, usar o `index.js` como porta de uma pasta, e manter a dependência num sentido só — sem ciclos.',
  concepts: ['eng-modulos'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Na aula passada, separar foi cortar um arquivo em pedaços com um assunto cada. Mas um pedaço não é só "um arquivo menor": é uma **fronteira**. Tem um lado de fora — o que os outros arquivos veem — e um lado de dentro, que só ele conhece. Desenhar bem essa fronteira é o que faz a separação valer a pena.

## A porta e o que fica atrás dela

Um módulo tem uma **porta**: o que ele põe em \`module.exports\`. Tudo o mais é interno. Compare:

~~~js
// precos.js — exporta tudo
module.exports = { calcularTotal, arredondar, somarItem, TAXA };

// precos.js — exporta a porta
module.exports = { calcularTotal };
~~~

Na primeira versão, \`arredondar\` e \`somarItem\` viraram **promessas**: qualquer arquivo do projeto pode passar a usá-las, e no dia em que você quiser trocar o jeito de arredondar, vai ter que procurar quem depende disso. Na segunda, você é livre para reescrever o de dentro inteiro — só \`calcularTotal(vendas)\` precisa continuar devolvendo o mesmo.

A regra: **exporte o mínimo que os outros precisam**, não o máximo que você tem. Uma função auxiliar que só o próprio arquivo usa fica sem exportar. E se dois módulos precisarem da mesma auxiliar, ela ganha um módulo próprio — não vira exportação de um deles.

## A porta é um contrato

O nome da função, o que ela recebe e o que devolve: isso é o **contrato** do módulo. Quem usa \`calcularTotal(vendas)\` confia que ela recebe uma lista e devolve um número. Mudar o contrato — renomear, trocar a ordem dos parâmetros, passar a devolver texto — muda **todos** os arquivos que o usam. Mudar o de dentro não muda ninguém.

Por isso a porta pequena importa tanto: cada função exportada é um contrato que você assinou com o resto do projeto.

## \`index.js\`: a porta de uma pasta

Quando um assunto cresce, vira uma pasta: \`precos/total.js\`, \`precos/moeda.js\`, \`precos/desconto.js\`. Quem usa não deveria precisar saber dessa divisão interna. O Node tem uma convenção para isso: \`require('./precos')\` procura \`precos/index.js\`, e esse arquivo é a porta da pasta:

~~~js
// precos/index.js
const { calcularTotal } = require('./total');
const { formatarMoeda } = require('./moeda');

module.exports = { calcularTotal, formatarMoeda };
~~~

Do lado de fora, \`require('./precos')\` entrega as duas funções, e a pasta pode se reorganizar por dentro à vontade — juntar arquivos, separar, renomear — sem que ninguém fora dela perceba. O \`index.js\` que reexporta **tudo** de todos os arquivos perde essa vantagem: vira a mesma porta escancarada, só que maior.

## Dependência num sentido só

\`relatorio.js\` requer \`precos.js\`. Pode \`precos.js\` requerer \`relatorio.js\`? Não — e não é só regra de estilo. Quando A requer B e B requer A, o Node carrega A, começa B, B pede A... que ainda está pela metade. B recebe um \`module.exports\` **incompleto** (na prática, um objeto vazio) e quebra em algum lugar, mais tarde, com uma mensagem que não fala de ciclo nenhum.

Um ciclo é sempre sinal de que a fronteira está no lugar errado: ou os dois arquivos são um assunto só (junte), ou há um terceiro assunto escondido que os dois precisam (extraia um módulo que nenhum dos dois requer). Num projeto bem dividido, as dependências formam **camadas**: as rotas usam os serviços, os serviços usam os dados, e ninguém requer para cima. Isso vai ser o assunto da próxima aula.

## Onde passa a fronteira

Duas perguntas para saber se uma função merece ser a porta de um módulo:

- **Outro programa reutilizaria isto?** \`formatarMoeda\` sim: qualquer tela com preço. \`montarLinhaDoRelatorioDeVendasDeSetembro\`, não.
- **Ela muda por um motivo próprio?** Se muda junto com quem a chama, provavelmente é parte de quem a chama.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// frete/index.js — a porta da pasta de frete.
// Por dentro há três arquivos; por fora, uma função.
const { pesoTotal } = require('./peso');
const { tabelaPorRegiao } = require('./tabela');

function calcularFrete(itens, regiao) {
  const faixa = tabelaPorRegiao(regiao);
  return faixa.base + faixa.porKg * pesoTotal(itens);
}

module.exports = { calcularFrete };

// servidor.js — quem usa não sabe que existem peso.js e tabela.js.
const { calcularFrete } = require('./frete');`,
      caption:
        'A pasta tem três arquivos e uma porta. Se amanhã a tabela vier de um banco em vez de um objeto, muda tabela.js e mais nada — servidor.js continua chamando calcularFrete(itens, regiao).',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-2-minimo',
        type: 'server',
        prompt:
          'Este módulo exporta tudo o que tem. Só `calcularFrete(itens, regiao)` é usado fora dele; o resto é detalhe de dentro. Ajuste a porta: exporte só o que os outros precisam, sem mudar o comportamento.',
        concepts: ['eng-modulos'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'modulos', 'exports'],
        initialCode: `const TABELA = { sul: { base: 12, porKg: 2 }, norte: { base: 20, porKg: 3.5 } };

function pesoTotal(itens) {
  let peso = 0;
  for (const item of itens) peso = peso + item.pesoKg * item.quantidade;
  return peso;
}

function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

function calcularFrete(itens, regiao) {
  const faixa = TABELA[regiao];
  return arredondar(faixa.base + faixa.porKg * pesoTotal(itens));
}

module.exports = { TABELA, pesoTotal, arredondar, calcularFrete };
`,
        tests: [
          {
            description: 'calcularFrete continua funcionando: 2 kg para o sul custa 16',
            assertion: `const f = module.exports.calcularFrete;
if (typeof f !== 'function') throw new Error('calcularFrete precisa continuar exportada — é a porta do módulo');
const r = f([{ pesoKg: 1, quantidade: 2 }], 'sul');
if (r !== 16) throw new Error('calcularFrete([1 kg x2], "sul") deveria devolver 16, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'A porta é só calcularFrete: os detalhes ficam dentro',
            assertion: `const chaves = Object.keys(module.exports).sort();
if (JSON.stringify(chaves) !== '["calcularFrete"]') throw new Error('o módulo exporta ' + JSON.stringify(chaves) + '; deveria exportar só calcularFrete — tabela, peso e arredondamento são detalhes de dentro');`,
          },
        ],
        solution: `const TABELA = { sul: { base: 12, porKg: 2 }, norte: { base: 20, porKg: 3.5 } };

function pesoTotal(itens) {
  let peso = 0;
  for (const item of itens) peso = peso + item.pesoKg * item.quantidade;
  return peso;
}

function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

function calcularFrete(itens, regiao) {
  const faixa = TABELA[regiao];
  return arredondar(faixa.base + faixa.porKg * pesoTotal(itens));
}

module.exports = { calcularFrete };`,
        hints: [
          'Pergunte de cada nome: alguém fora deste arquivo precisa dele? Se não, ele não entra no `module.exports`.',
          'Só a última linha muda.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-2-porta',
        type: 'multiple-choice',
        prompt:
          'O módulo `usuarios.js` tem `cadastrar(dados)`, `validarEmail(email)` (usada só por `cadastrar`), `normalizarNome(nome)` (usada só por `cadastrar`) e a lista `usuarios` onde tudo é guardado. Qual deve ser a porta dele?',
        concepts: ['eng-modulos'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'modulos', 'exports'],
        options: [
          'Só `cadastrar`: as duas auxiliares são detalhes de como cadastrar, e a lista é o estado interno',
          'Tudo, para o resto do projeto poder reutilizar o que quiser',
          '`cadastrar` e a lista `usuarios`, para os outros arquivos lerem os cadastros direto',
          '`validarEmail` e `normalizarNome`, que são as funções mais reutilizáveis',
        ],
        correctIndex: 0,
        explanation:
          'Exportar a lista entrega o estado interno: qualquer arquivo poderia dar `push` nela pulando a validação. Exportar as auxiliares transforma detalhes em contratos. Se outro módulo vier a precisar de `validarEmail`, ela ganha um módulo próprio (`validacao.js`), em vez de sair pela porta de `usuarios.js`. Quando os outros precisarem ler os cadastros, o módulo ganha uma função para isso — `listar()` — e continua dono da lista.',
        hints: ['O que os outros arquivos precisam **fazer** com usuários? É isso que sai pela porta — e nada do jeito como é feito.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-2-index',
        type: 'server',
        prompt:
          'A pasta `precos/` tem dois arquivos, `total.js` e `moeda.js` (acima do editor). Escreva o `precos/index.js`: a porta da pasta, que reexporta `calcularTotal` e `formatarMoeda` — e só elas. O seu arquivo mora dentro da pasta, então o `require` é relativo a ela.',
        concepts: ['eng-modulos'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'modulos', 'index'],
        caminho: './precos/index',
        arquivos: {
          './precos/total.js': `function somarItem(acumulado, venda) {
  return acumulado + venda.preco * venda.quantidade;
}

function calcularTotal(vendas) {
  return vendas.reduce(somarItem, 0);
}

module.exports = { calcularTotal, somarItem };
`,
          './precos/moeda.js': `function formatarMoeda(valor) {
  const centavos = Math.round(valor * 100);
  return 'R$ ' + Math.floor(centavos / 100) + ',' + String(centavos % 100).padStart(2, '0');
}

module.exports = { formatarMoeda };
`,
        },
        initialCode: `// precos/index.js — a porta da pasta.
`,
        tests: [
          {
            description: 'require("./precos") entrega calcularTotal e formatarMoeda funcionando',
            assertion: `const { calcularTotal, formatarMoeda } = module.exports;
if (typeof calcularTotal !== 'function' || typeof formatarMoeda !== 'function') throw new Error('a porta precisa ter calcularTotal e formatarMoeda, veio ' + JSON.stringify(Object.keys(module.exports)));
if (calcularTotal([{ preco: 2, quantidade: 3 }]) !== 6) throw new Error('calcularTotal([{2 x3}]) deveria devolver 6');
if (formatarMoeda(6) !== 'R$ 6,00') throw new Error('formatarMoeda(6) deveria devolver "R$ 6,00", veio ' + JSON.stringify(formatarMoeda(6)));`,
          },
          {
            description: 'somarItem não sai pela porta: é detalhe de total.js',
            assertion: `const chaves = Object.keys(module.exports).sort();
if (JSON.stringify(chaves) !== '["calcularTotal","formatarMoeda"]') throw new Error('a porta da pasta é ' + JSON.stringify(chaves) + '; deveria ser só calcularTotal e formatarMoeda');`,
          },
        ],
        solution: `const { calcularTotal } = require('./total');
const { formatarMoeda } = require('./moeda');

module.exports = { calcularTotal, formatarMoeda };`,
        hints: [
          'De dentro de `precos/`, os arquivos vizinhos são `./total` e `./moeda`.',
          'Pegue só o que vai reexportar: `const { calcularTotal } = require("./total")`. O `somarItem` fica onde está.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-2-ciclo',
        type: 'multiple-choice',
        prompt:
          '`pedidos.js` faz `require("./clientes")` e `clientes.js` faz `require("./pedidos")`. O programa começa por `pedidos.js`. O que `clientes.js` recebe quando pede `./pedidos`?',
        concepts: ['eng-modulos'],
        difficulty: 'intermediario',
        tags: ['engenharia', 'modulos', 'ciclo'],
        options: [
          'O `module.exports` de `pedidos.js` **como está naquele momento** — pela metade, na prática um objeto vazio, porque `pedidos.js` ainda não terminou de rodar',
          'Um erro na hora: "Circular dependency detected"',
          'O módulo completo: o Node termina `pedidos.js` antes de entregar',
          '`undefined`, porque o Node se recusa a carregar o segundo',
        ],
        correctIndex: 0,
        explanation:
          'O Node não avisa. `pedidos.js` começa, chama `require("./clientes")`, `clientes.js` roda e pede `./pedidos` — que está no meio do carregamento, com `module.exports` ainda vazio. `clientes.js` guarda esse objeto vazio e quebra depois, numa chamada qualquer, com "x is not a function". Ciclo é sinal de fronteira no lugar errado: junte os dois, ou extraia o que os dois precisam para um terceiro módulo que nenhum deles requer.',
        hints: ['Quando `clientes.js` pede `./pedidos`, o que já aconteceu em `pedidos.js` — e o que ainda não?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-2-camadas',
        type: 'order-steps',
        prompt:
          'Estes quatro arquivos formam camadas: cada um requer só o de baixo. Coloque-os na ordem **de quem não depende de ninguém até quem depende de todos** — a ordem em que dá para carregá-los sem ciclo.',
        concepts: ['eng-modulos'],
        difficulty: 'intermediario',
        tags: ['engenharia', 'modulos', 'camadas'],
        steps: [
          { id: 'dados', text: '`dados/pedidos.js` — lê e grava pedidos; não requer nenhum arquivo do projeto', ordem: 1 },
          { id: 'servico', text: '`servicos/pedidos.js` — as regras (validar, calcular); requer `dados/pedidos`', ordem: 2 },
          { id: 'rota', text: '`rotas/pedidos.js` — recebe o pedido HTTP e responde; requer `servicos/pedidos`', ordem: 3 },
          { id: 'servidor', text: '`servidor.js` — monta a corrente; requer `rotas/pedidos`', ordem: 4 },
        ],
        explanation:
          'A dependência aponta num sentido só: servidor → rotas → serviços → dados. O arquivo de baixo não sabe que os de cima existem — `dados/pedidos.js` não tem ideia do que é um pedido HTTP. É isso que permite testar os dados sem servidor, trocar o banco sem tocar nas rotas, e nunca ter ciclo.',
        hints: [
          'Comece por quem não faz `require` de nada do projeto.',
          'Cada arquivo seguinte requer só o anterior.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-2-lacuna',
        type: 'fill-blank',
        prompt: 'Complete a porta do módulo: só o que os outros arquivos vão usar sai por ela.',
        concepts: ['eng-modulos'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'modulos', 'exports'],
        template: `function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

function calcularDesconto(preco, percentual) {
  return arredondar(preco * (percentual / 100));
}

{{1}}.exports = { {{2}} };`,
        blanks: [
          { placeholder: 'o arquivo', size: 8 },
          { placeholder: 'a porta', size: 18 },
        ],
        tests: [
          {
            description: 'calcularDesconto sai pela porta: calcularDesconto(200, 15) é 30',
            assertion: `if (typeof module.exports.calcularDesconto !== 'function') throw new Error('calcularDesconto precisa sair pela porta do módulo');
if (module.exports.calcularDesconto(200, 15) !== 30) throw new Error('calcularDesconto(200, 15) deveria devolver 30');`,
          },
          {
            description: 'arredondar fica dentro: é detalhe de como o desconto é calculado',
            assertion: `if (Object.keys(module.exports).length !== 1) throw new Error('a porta deveria ter uma função só; veio ' + JSON.stringify(Object.keys(module.exports)));`,
          },
        ],
        explanation:
          'O objeto que representa o arquivo é `module`, e `module.exports` é a porta. `arredondar` só interessa a quem calcula o desconto — fica dentro, livre para mudar.',
        solution: ['module', 'calcularDesconto'],
        hints: [
          'A primeira lacuna é o objeto que representa este arquivo para o Node.',
          'Na segunda vai só a função que o resto do projeto chama; a de arredondar é detalhe de dentro.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-2-typo',
        type: 'find-bug',
        prompt:
          'A última linha simula o que outro arquivo receberia deste módulo — e quebra: "calcularDesconto is not a function". Aponte a linha que precisa mudar.',
        concepts: ['eng-modulos'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'modulos', 'bug'],
        code: `function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

function calcularDesconto(preco, percentual) {
  return arredondar(preco * (percentual / 100));
}

module.export = { calcularDesconto };

console.log(module.exports.calcularDesconto(200, 15));`,
        buggyLine: 9,
        fix: 'module.exports = { calcularDesconto };',
        symptomLine: 11,
        symptomFeedback:
          'É aqui que o erro aparece — `module.exports.calcularDesconto` não existe —, mas esta linha só lê a porta. Veja a linha que deveria ter escrito nela.',
        explanation:
          'A porta é `module.exports`, com **s**. `module.export = …` cria uma propriedade nova, que o `require` ignora, e a porta de verdade continua `{}`. É um erro silencioso: nada avisa na hora da atribuição, só na primeira chamada de quem usa o módulo.',
        hints: [
          'A porta ficou vazia. Compare o nome que foi escrito com o nome que o `require` lê.',
          'A propriedade que o Node entrega ao `require` tem uma letra a mais do que a que foi escrita.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Um módulo é uma **fronteira**: a porta é o \`module.exports\`, e tudo o mais é de dentro. **Exporte o mínimo** que os outros precisam — cada função exportada é um contrato assinado com o resto do projeto, e o que fica dentro é livre para mudar.

Uma pasta tem porta também: o \`index.js\`, que \`require('./pasta')\` encontra sozinho, e que reexporta só o que a pasta oferece.

A dependência aponta **num sentido só**. Um ciclo entrega um módulo pela metade, sem aviso — e é sinal de fronteira no lugar errado: junte, ou extraia o que os dois precisam para um terceiro.

Na próxima aula, as fronteiras viram pastas: onde cada arquivo mora, e por que a divisão é por **responsabilidade**, não por tipo.
`.trim(),
    },
  ],
};

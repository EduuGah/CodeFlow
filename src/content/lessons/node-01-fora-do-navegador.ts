import type { Lesson } from '../types';

export const lessonNodeForaDoNavegador: Lesson = {
  id: 'lesson-node-1',
  trackId: 'track-node',
  title: 'Node: JavaScript Fora do Navegador',
  language: 'node',
  objective:
    'Entender o que muda quando o JavaScript roda no Node — sem página, com arquivos e ambiente — e dividir um programa em módulos com module.exports e require.',
  concepts: ['node-modulos'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Até aqui todo JavaScript que você escreveu rodou **dentro de uma página**: tinha \`document\` para mexer na tela, \`window\` para o tamanho da janela, \`fetch\` para pedir coisas a um servidor. Agora você vai escrever **o servidor**.

Um servidor não tem página. Ele roda numa máquina que ninguém está olhando — um computador num data center, ou o seu próprio, num terminal — e fica esperando pedidos. Para o JavaScript rodar nesse lugar existe o **Node**: o mesmo motor que o Chrome usa para executar JavaScript (o V8), arrancado do navegador e posto num programa de linha de comando.

## O que muda

O idioma é o mesmo: \`const\`, funções, arrays, \`async/await\`, tudo igual. O que muda é o que existe em volta:

| No navegador | No Node |
| --- | --- |
| \`document\`, \`window\`, \`alert\` | não existem — não há tela |
| \`fetch\` para pedir a um servidor | \`fetch\` também, e o servidor pode ser você |
| \`localStorage\` | arquivos de verdade, no disco |
| \`console.log\` aparece no DevTools | \`console.log\` aparece no **terminal** |
| \`import\` nos \`<script type="module">\` | \`require\` e \`module.exports\` (e \`import\` também, nos projetos mais novos) |

E existe uma coisa nova: \`process\`, o objeto que representa **o programa rodando**. \`process.env\` são as **variáveis de ambiente** — configurações que vêm de fora do código, como a porta em que o servidor deve escutar ou a senha do banco. Você vai voltar a elas numa aula própria; por ora, saiba que \`process.env.PORT\` é "o que o ambiente disse sobre a porta", e que pode não ter dito nada (\`undefined\`).

## Módulos: um programa em vários arquivos

Um servidor de verdade não cabe num arquivo só. Você separa: as rotas num lugar, as regras de negócio noutro, o acesso ao banco noutro. Cada arquivo é um **módulo**: ele **exporta** o que quer mostrar e **importa** o que precisa dos outros.

No Node clássico isso se escreve assim. Um arquivo \`precos.js\`:

~~~js
function comDesconto(preco, cupom) {
  if (cupom === 'DEZ') return preco * 0.9;
  return preco;
}

module.exports = { comDesconto };
~~~

E outro arquivo que o usa:

~~~js
const { comDesconto } = require('./precos');

console.log(comDesconto(100, 'DEZ')); // 90
~~~

Duas regras que resolvem quase todo erro de módulo:

- **\`module.exports\` é o que sai.** Tudo que não está nele fica privado ao arquivo — uma variável, uma função de apoio. É assim que se esconde o que não interessa a quem usa.
- **\`require('./x')\` é o que entra**, com \`./\` para dizer "arquivo ao lado". Sem o \`./\` o Node procura um **pacote instalado** (\`require('express')\`, na próxima aula), não um arquivo seu.

Um detalhe que pega muita gente: \`exports = { … }\` **não funciona**. \`exports\` é só um atalho para \`module.exports\`; ao trocar a variável inteira, você quebra o atalho e o arquivo exporta \`{}\`. Ou você preenche o objeto (\`exports.comDesconto = …\`) ou troca o \`module.exports\`.

## Como funciona aqui

Nos exercícios desta trilha o seu código roda num **Node de mentira**, dentro do navegador: \`require\`, \`module.exports\`, \`process.env\` e, a partir da próxima aula, o Express — tudo se comporta como no Node de verdade, e o código que você escrever aqui é o mesmo que rodaria num terminal. A diferença é que não há disco nem porta aberta: os arquivos que o exercício fornece aparecem **acima do editor**, e os testes chamam o que você exportou.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// mensagens.js — um módulo: exporta duas funções, esconde a lista.
const SAUDACOES = { manha: 'Bom dia', noite: 'Boa noite' };

function saudar(nome, periodo) {
  return \`\${SAUDACOES[periodo] ?? 'Olá'}, \${nome}!\`;
}

function despedir(nome) {
  return \`Até logo, \${nome}.\`;
}

module.exports = { saudar, despedir };

// app.js — usa o módulo.
const { saudar } = require('./mensagens');
console.log(saudar('Ana', 'manha')); // Bom dia, Ana!`,
      caption:
        'SAUDACOES não está no module.exports, então quem faz require("./mensagens") não a vê — e não precisa. A porta de um módulo é o que ele exporta.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-1-o-que-muda',
        type: 'multiple-choice',
        prompt: 'Um programa em Node tenta fazer `document.querySelector("h1")`. O que acontece?',
        concepts: ['node-modulos'],
        difficulty: 'iniciante',
        tags: ['node', 'ambiente'],
        options: [
          'Dá erro: no Node não existe `document`, porque não há página — o programa roda num terminal, não numa aba',
          'Funciona, mas devolve `null` porque a página ainda não carregou',
          'Funciona normalmente: o Node é o Chrome sem a interface',
          'Dá erro só se o arquivo não terminar em `.js`',
        ],
        correctIndex: 0,
        explanation:
          'O Node é o motor de JavaScript (o V8) fora do navegador. O idioma é o mesmo, mas o que existe em volta muda: não há `document`, `window` nem `alert`, e em compensação há `process`, arquivos e a capacidade de ser o servidor.',
        hints: ['Onde um servidor roda? Alguém está olhando uma página nele?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-1-exportar',
        type: 'code',
        prompt:
          'Escreva um módulo que exporte a função `saudar(nome)`, que devolve `"Olá, <nome>!"`. Quem fizer `require` deste arquivo precisa receber um objeto com `saudar` dentro.',
        concepts: ['node-modulos'],
        difficulty: 'iniciante',
        tags: ['node', 'modulos'],
        initialCode: `function saudar(nome) {
  return \`Olá, \${nome}!\`;
}

// Exporte a função para os outros arquivos.
`,
        tests: [
          {
            description: 'O módulo exporta saudar, e saudar("Ana") devolve "Olá, Ana!"',
            assertion: `if (typeof module.exports.saudar !== 'function') throw new Error('module.exports não tem a função saudar — é ela que precisa sair do arquivo.');
if (module.exports.saudar('Ana') !== 'Olá, Ana!') throw new Error('saudar("Ana") deveria devolver "Olá, Ana!", devolveu ' + JSON.stringify(module.exports.saudar('Ana')));`,
          },
          {
            description: 'Só saudar sai do módulo: nada a mais é exportado',
            assertion: `const chaves = Object.keys(module.exports);
if (chaves.length !== 1) throw new Error('o módulo exporta ' + JSON.stringify(chaves) + '; deveria exportar só saudar.');`,
          },
        ],
        solution: `function saudar(nome) {
  return \`Olá, \${nome}!\`;
}

module.exports = { saudar };`,
        hints: [
          'O que sai de um módulo é o que está em `module.exports`.',
          'Um objeto com a função: `module.exports = { saudar };`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-1-importar',
        type: 'server',
        prompt:
          'O arquivo `./cupons` (acima do editor) exporta a tabela de cupons. Importe-a e exporte `totalComDesconto(total, cupom)`: aplica o desconto do cupom ao total, e devolve o total sem mudar quando o cupom não existe. Arredonde para duas casas com `Math.round(x * 100) / 100`.',
        concepts: ['node-modulos'],
        difficulty: 'iniciante',
        tags: ['node', 'modulos', 'require'],
        arquivos: {
          './cupons': `// A fração de desconto de cada cupom.
module.exports = {
  CUPONS: { DEZ: 0.1, VINTE: 0.2, MEIA: 0.5 },
};`,
        },
        initialCode: `// Importe CUPONS do arquivo ./cupons.

function totalComDesconto(total, cupom) {
  // Sem cupom válido, o total não muda.
}

module.exports = { totalComDesconto };
`,
        tests: [
          {
            description: 'totalComDesconto(100, "DEZ") devolve 90, e (80, "MEIA") devolve 40',
            assertion: `const f = module.exports.totalComDesconto;
if (typeof f !== 'function') throw new Error('o módulo precisa exportar totalComDesconto.');
if (f(100, 'DEZ') !== 90) throw new Error('totalComDesconto(100, "DEZ") deveria ser 90, veio ' + f(100, 'DEZ'));
if (f(80, 'MEIA') !== 40) throw new Error('totalComDesconto(80, "MEIA") deveria ser 40, veio ' + f(80, 'MEIA'));`,
          },
          {
            description: 'Cupom inexistente ou ausente não muda o total',
            assertion: `const f = module.exports.totalComDesconto;
if (f(100, 'NADA') !== 100) throw new Error('cupom inexistente deveria manter 100, veio ' + f(100, 'NADA'));
if (f(37.5) !== 37.5) throw new Error('sem cupom deveria manter 37.5, veio ' + f(37.5));`,
          },
          {
            description: 'A tabela vem do arquivo ./cupons, não de uma cópia no seu código',
            assertion: `const { CUPONS } = require('./cupons');
CUPONS.TESTE = 0.25;
const f = module.exports.totalComDesconto;
if (f(100, 'TESTE') !== 75) throw new Error('um cupom acrescentado à tabela de ./cupons não foi aplicado — o módulo precisa ler a tabela importada, não uma cópia.');
delete CUPONS.TESTE;`,
          },
        ],
        solution: `const { CUPONS } = require('./cupons');

function totalComDesconto(total, cupom) {
  const fracao = CUPONS[cupom];
  if (fracao === undefined) return total;
  return Math.round(total * (1 - fracao) * 100) / 100;
}

module.exports = { totalComDesconto };`,
        hints: [
          'A primeira linha: `const { CUPONS } = require("./cupons");` — com o `./`, porque é um arquivo ao lado.',
          'Procure a fração pelo nome do cupom: `CUPONS[cupom]`. Se for `undefined`, devolva o total.',
          'Com fração `f`, o total vira `total * (1 - f)`; arredonde com `Math.round(x * 100) / 100`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-1-porta',
        type: 'predict-output',
        prompt:
          'Este programa roda num ambiente onde **ninguém definiu** a variável `PORT`. O que ele imprime?',
        concepts: ['node-modulos'],
        difficulty: 'iniciante',
        tags: ['node', 'process', 'env'],
        code: `const porta = process.env.PORT ?? 3000;

console.log(typeof process.env.PORT);
console.log(porta);`,
        expectedOutput: `undefined
3000`,
        explanation:
          '`process.env` é o objeto das variáveis de ambiente. Uma que não foi definida é `undefined` — e o `??` escolhe o padrão, 3000. É o padrão de todo servidor: "use a porta que o ambiente mandar; se não mandar, esta". Repare que, quando definida, uma variável de ambiente é sempre **texto** ("3000", não 3000).',
        hints: ['O que `??` faz quando o lado esquerdo é `undefined`?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-1-exports-quebrado',
        type: 'find-bug',
        prompt:
          'Este módulo deveria exportar `somar`, mas a última linha — que simula o que outro arquivo receberia com `require` — quebra com "somar is not a function". Aponte a linha que precisa mudar.',
        concepts: ['node-modulos'],
        difficulty: 'intermediario',
        tags: ['node', 'modulos', 'exports'],
        code: `function somar(a, b) {
  return a + b;
}

exports = { somar };

console.log(module.exports.somar(2, 3));`,
        buggyLine: 5,
        fix: 'module.exports = { somar };',
        symptomLine: 7,
        symptomFeedback:
          'É aqui que o erro aparece — `module.exports.somar` não existe —, mas esta linha só lê o que o módulo exportou. O defeito está em quem deveria ter exportado.',
        explanation:
          '`exports` é só um atalho para `module.exports`. Trocar a variável inteira (`exports = …`) quebra o atalho: o `module.exports` continua sendo o objeto vazio original, e é ele que o `require` devolve. Ou se preenche o atalho (`exports.somar = somar`) ou se troca o original (`module.exports = { somar }`).',
        hints: ['Qual objeto o `require` devolve — `exports` ou `module.exports`?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-1-ambiente',
        type: 'server',
        prompt:
          'O ambiente (acima do editor) define `LIMITE_DE_ITENS`. Exporte `limiteDeItens()`, que devolve esse valor **como número** — e devolve `10` quando a variável não existe. Lembre: variável de ambiente é sempre texto.',
        concepts: ['node-modulos'],
        difficulty: 'intermediario',
        tags: ['node', 'process', 'env'],
        env: { LIMITE_DE_ITENS: '25' },
        initialCode: `function limiteDeItens() {
  // Leia process.env.LIMITE_DE_ITENS; sem ela, 10.
}

module.exports = { limiteDeItens };
`,
        tests: [
          {
            description: 'Com LIMITE_DE_ITENS=25 no ambiente, limiteDeItens() devolve o número 25',
            assertion: `const v = module.exports.limiteDeItens();
if (v !== 25) throw new Error('esperava o número 25, veio ' + JSON.stringify(v) + (v === '25' ? ' (texto — converta com Number)' : ''));`,
          },
          {
            description: 'Sem a variável no ambiente, devolve 10',
            assertion: `const guardado = process.env.LIMITE_DE_ITENS;
delete process.env.LIMITE_DE_ITENS;
try {
  const v = module.exports.limiteDeItens();
  if (v !== 10) throw new Error('sem a variável, esperava 10, veio ' + JSON.stringify(v));
} finally {
  process.env.LIMITE_DE_ITENS = guardado;
}`,
          },
        ],
        solution: `function limiteDeItens() {
  const valor = process.env.LIMITE_DE_ITENS;
  if (valor === undefined) return 10;
  return Number(valor);
}

module.exports = { limiteDeItens };`,
        hints: [
          'Leia com `process.env.LIMITE_DE_ITENS`; se for `undefined`, devolva 10.',
          'O valor vem como texto: `Number(valor)` transforma "25" em 25.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
O **Node** é o JavaScript fora do navegador: mesmo idioma, outro ambiente — sem \`document\` nem \`window\`, com \`process\`, arquivos e a capacidade de ser o servidor. O \`console.log\` vai para o terminal.

Um programa se divide em **módulos**: cada arquivo exporta o que quer mostrar em \`module.exports\` e importa o que precisa com \`require('./arquivo')\` — o \`./\` diz "arquivo ao lado"; sem ele, o Node procura um pacote instalado. \`exports = …\` quebra o atalho e exporta nada; use \`module.exports = …\`.

\`process.env\` são as variáveis de ambiente: configuração que vem de fora do código, sempre como **texto**, e que pode não existir — daí o padrão com \`??\` e a conversão com \`Number\`.

Na próxima aula, o primeiro servidor: um programa que escuta numa porta e responde a quem pedir.
`.trim(),
    },
  ],
};

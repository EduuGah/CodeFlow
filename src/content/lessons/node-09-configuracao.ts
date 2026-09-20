import type { Lesson } from '../types';

export const lessonNodeConfiguracao: Lesson = {
  id: 'lesson-node-9',
  trackId: 'track-node',
  title: 'Configuração e Segredos',
  language: 'node',
  objective:
    'Tirar do código o que muda entre a sua máquina e a de produção — porta, banco, chaves — com `process.env`, o `.env`, um módulo de configuração que valida na largada, e as regras do que nunca vai para o Git.',
  concepts: ['node-config'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
O mesmo servidor roda na sua máquina, na do colega e em produção — e em cada lugar a porta é outra, o banco é outro, a chave da API de pagamento é outra. Se isso estiver **no código**, cada lugar precisa de um código diferente, e a chave de produção acaba num commit, visível para sempre no histórico. A solução é antiga e simples: o que muda entre máquinas vem **do ambiente**.

## \`process.env\`, e as duas regras

Você já leu \`process.env\` na primeira aula. As duas regras continuam: **tudo é texto**, e **pode não existir**.

~~~js
const porta = Number(process.env.PORTA) || 3000;
~~~

\`'3000' + 1\` é \`'30001'\` — por isso o \`Number\`. E o \`|| 3000\` é o **padrão**: na sua máquina, sem nada configurado, o servidor sobe na 3000. Padrão é para o que é seguro ter padrão: porta, limite de itens, modo. Uma **chave** não tem padrão. Sem ela, o servidor não deve subir:

~~~js
if (!process.env.CHAVE_DA_API) {
  throw new Error('CHAVE_DA_API não definida. Veja o .env.example.');
}
~~~

**Falhar cedo**: um servidor que sobe sem a chave e só quebra na primeira compra, às três da manhã, é muito pior que um que se recusa a subir e diz o que falta.

## O \`.env\`

Definir variáveis no terminal antes de cada \`node servidor.js\` cansa. A convenção é um arquivo \`.env\` na raiz do projeto, uma variável por linha:

~~~
PORTA=3000
CHAVE_DA_API=sk_teste_abc123
BANCO_URL=postgres://localhost/tarefas
~~~

O pacote \`dotenv\` (ou o próprio Node, com \`node --env-file=.env\`) lê esse arquivo na largada e põe cada linha em \`process.env\`. O código não muda: continua lendo \`process.env.PORTA\`, sem saber de onde veio.

E aqui a regra que não tem exceção: **o \`.env\` não vai para o Git.** Ele está no \`.gitignore\` desde o primeiro commit. O que vai é um **\`.env.example\`**, com os nomes e sem os valores:

~~~
PORTA=
CHAVE_DA_API=
BANCO_URL=
~~~

Quem clona o projeto copia o exemplo, preenche, e pronto. É exatamente o que este site faz: o \`README\` manda copiar o \`.env.example\`, e o \`.env\` de verdade nunca esteve no repositório.

## Um módulo de configuração

Espalhar \`process.env.X\` pelas rotas espalha também as conversões e os padrões — e o dia em que \`PORTA\` vira \`PORT\` é um dia de procurar. O padrão é ler **uma vez**, num módulo só:

~~~js
// config.js
const config = Object.freeze({
  porta: Number(process.env.PORTA) || 3000,
  limiteDeItens: Number(process.env.LIMITE_DE_ITENS) || 20,
  emProducao: process.env.NODE_ENV === 'production',
  chaveDaApi: process.env.CHAVE_DA_API,
});

if (!config.chaveDaApi) throw new Error('CHAVE_DA_API não definida');

module.exports = config;
~~~

O resto do servidor faz \`const config = require('./config')\` e usa \`config.porta\`, já número, já com padrão. O \`Object.freeze\` é de propósito: configuração se muda **no ambiente**, nunca no código em tempo de execução — e com o objeto congelado, um \`config.porta = 4000\` escondido num canto quebra na hora, em vez de valer só naquela máquina.

\`NODE_ENV\` é a variável que os servidores de verdade definem como \`production\`. É com ela que o middleware de erro decide mostrar o rastro do erro (em desenvolvimento) ou só "Erro interno" (em produção).

## Segredo é segredo

Uma chave que vaza é uma chave de outra pessoa. Regras:

- Nunca no código, nunca no Git — nem "só neste commit".
- Nunca num \`console.log\`, nem numa resposta da API, nem numa URL (URLs ficam em logs e históricos).
- Se vazou, não adianta apagar o commit: **troque a chave** no serviço. O histórico do Git é para sempre, e há robôs lendo repositórios públicos atrás de chaves.
- O que vai para o navegador é **público**. Uma chave dentro do JavaScript da página está nas mãos de qualquer visitante — por isso este site só põe no cliente a chave *publishable* do Supabase, e a chave secreta fica onde só o servidor a lê.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Tudo que muda entre máquinas, num lugar só — e validado na largada.
const config = Object.freeze({
  porta: Number(process.env.PORTA) || 3000,
  limiteDeItens: Number(process.env.LIMITE_DE_ITENS) || 20,
  emProducao: process.env.NODE_ENV === 'production',
  chaveDaApi: process.env.CHAVE_DA_API,
});

if (!config.chaveDaApi) {
  throw new Error('CHAVE_DA_API não definida. Copie o .env.example para .env e preencha.');
}

const express = require('express');
const app = express();

app.get('/saude', (req, res) => {
  // O que é seguro contar: porta e limite. A chave, nunca.
  res.json({ ok: true, porta: config.porta, limiteDeItens: config.limiteDeItens });
});

app.use((erro, req, res, next) => {
  res.status(500).json({ erro: config.emProducao ? 'Erro interno' : erro.message });
});

app.listen(config.porta, () => console.log('ouvindo na porta ' + config.porta));`,
      caption:
        'A configuração lida uma vez, convertida, com padrões para o que pode ter padrão e um erro claro para o que não pode. O resto do arquivo só conhece config.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-9-porta',
        type: 'server',
        prompt:
          'O ambiente (acima do editor) define `PORTA`. Escreva `portaDoServidor()`, que devolve essa variável **como número** — ou `3000` quando ela não existe — e use-a no `listen`.',
        concepts: ['node-config'],
        difficulty: 'iniciante',
        tags: ['node', 'process', 'env', 'porta'],
        env: { PORTA: '8080' },
        initialCode: `const express = require('express');
const app = express();

function portaDoServidor() {
  // process.env.PORTA como número; sem ela, 3000.
}

app.get('/ping', (req, res) => res.send('pong'));

app.listen(3000);
`,
        tests: [
          {
            description: 'Com PORTA=8080 no ambiente, o servidor escuta na porta 8080 (número)',
            assertion: `if (app.porta !== 8080) throw new Error('o servidor está escutando em ' + JSON.stringify(app.porta) + '; esperava o número 8080' + (app.porta === '8080' ? ' — veio texto: converta com Number' : ' — o listen precisa usar portaDoServidor()'));`,
          },
          {
            description: 'Sem PORTA no ambiente, portaDoServidor() devolve 3000',
            assertion: `const guardada = process.env.PORTA;
delete process.env.PORTA;
try {
  const p = portaDoServidor();
  if (p !== 3000) throw new Error('sem PORTA no ambiente, esperava 3000, veio ' + JSON.stringify(p) + (Number.isNaN(p) ? ' — Number(undefined) é NaN; o padrão precisa entrar' : ''));
} finally {
  process.env.PORTA = guardada;
}`,
          },
        ],
        solution: `const express = require('express');
const app = express();

function portaDoServidor() {
  return Number(process.env.PORTA) || 3000;
}

app.get('/ping', (req, res) => res.send('pong'));

app.listen(portaDoServidor());`,
        hints: [
          '`Number(process.env.PORTA)` converte; sem a variável, dá `NaN`, que é falso — então `|| 3000` entra.',
          'E o `listen` precisa receber `portaDoServidor()`, não o 3000 fixo.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-9-texto',
        type: 'multiple-choice',
        prompt: 'No `.env` está `PORTA=3000`. O que `process.env.PORTA + 1` vale?',
        concepts: ['node-config'],
        difficulty: 'iniciante',
        tags: ['node', 'env', 'tipos'],
        options: [
          '`"30001"` — variável de ambiente é sempre texto, e texto + número concatena',
          '`3001` — o Node converte números do `.env` automaticamente',
          '`NaN` — não se pode somar uma variável de ambiente',
          '`undefined` — o `.env` não entra em `process.env` sem `await`',
        ],
        correctIndex: 0,
        explanation:
          'Tudo em `process.env` é texto, venha do terminal ou do `.env`. `"3000" + 1` é `"30001"`, pela regra de sempre do `+` com texto. Por isso a configuração converte na entrada — `Number(process.env.PORTA)` — e o resto do código nunca mais pensa nisso.',
        hints: ['Qual é o tipo de todo valor em `process.env`? E o que `+` faz com esse tipo?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-9-config',
        type: 'server',
        prompt:
          'Escreva `carregarConfig()`, que lê o ambiente e devolve `{ porta, limiteDeItens, chaveDaApi, emProducao }` — `porta` e `limiteDeItens` como números, com padrões `3000` e `20`; `emProducao` é `NODE_ENV === "production"`; e sem `CHAVE_DA_API` a função **lança** um `Error` cuja mensagem cita `CHAVE_DA_API`. Depois, `GET /saude` responde `{ ok: true, porta, limiteDeItens }` — sem a chave.',
        concepts: ['node-config'],
        difficulty: 'intermediario',
        tags: ['node', 'env', 'config', 'segredos'],
        env: { PORTA: '4000', CHAVE_DA_API: 'segredo-123' },
        initialCode: `const express = require('express');
const app = express();

function carregarConfig() {
  // porta, limiteDeItens, chaveDaApi, emProducao — e o erro sem a chave.
}

const config = carregarConfig();

// GET /saude: { ok: true, porta, limiteDeItens }

app.listen(3000);
`,
        tests: [
          {
            description: 'carregarConfig() lê PORTA=4000, usa 20 como limite padrão, guarda a chave e emProducao: false',
            assertion: `const c = carregarConfig();
if (!c || typeof c !== 'object') throw new Error('carregarConfig() deveria devolver um objeto, devolveu ' + JSON.stringify(c));
if (c.porta !== 4000) throw new Error('porta: esperava o número 4000, veio ' + JSON.stringify(c.porta));
if (c.limiteDeItens !== 20) throw new Error('limiteDeItens: sem LIMITE_DE_ITENS no ambiente, esperava o padrão 20, veio ' + JSON.stringify(c.limiteDeItens));
if (c.chaveDaApi !== 'segredo-123') throw new Error('chaveDaApi: esperava "segredo-123", veio ' + JSON.stringify(c.chaveDaApi));
if (c.emProducao !== false) throw new Error('emProducao: sem NODE_ENV, esperava false, veio ' + JSON.stringify(c.emProducao));`,
          },
          {
            description: 'Sem CHAVE_DA_API no ambiente, carregarConfig() lança um erro que diz o que falta',
            assertion: `const guardada = process.env.CHAVE_DA_API;
delete process.env.CHAVE_DA_API;
let lancou = null;
try { carregarConfig(); } catch (e) { lancou = e; } finally { process.env.CHAVE_DA_API = guardada; }
if (!lancou) throw new Error('sem a chave, carregarConfig() deveria lançar — o servidor não pode subir sem ela');
if (!String(lancou.message).includes('CHAVE_DA_API')) throw new Error('a mensagem do erro deveria citar CHAVE_DA_API, para quem for configurar saber o que falta; veio "' + lancou.message + '"');`,
          },
          {
            description: 'GET /saude responde porta e limite, e não vaza a chave',
            assertion: `const res = await pedir(app, 'GET', '/saude');
if (res.status !== 200 || !res.body || res.body.ok !== true || res.body.porta !== 4000 || res.body.limiteDeItens !== 20) throw new Error('GET /saude respondeu ' + res.status + ' ' + res.texto + '; esperava 200 {"ok":true,"porta":4000,"limiteDeItens":20}');
if (res.texto.includes('segredo')) throw new Error('a resposta contém a chave da API — segredo nunca sai numa resposta');`,
          },
        ],
        solution: `const express = require('express');
const app = express();

function carregarConfig() {
  if (!process.env.CHAVE_DA_API) {
    throw new Error('CHAVE_DA_API não definida. Veja o .env.example.');
  }
  return Object.freeze({
    porta: Number(process.env.PORTA) || 3000,
    limiteDeItens: Number(process.env.LIMITE_DE_ITENS) || 20,
    chaveDaApi: process.env.CHAVE_DA_API,
    emProducao: process.env.NODE_ENV === 'production',
  });
}

const config = carregarConfig();

app.get('/saude', (req, res) => {
  res.json({ ok: true, porta: config.porta, limiteDeItens: config.limiteDeItens });
});

app.listen(config.porta);`,
        hints: [
          'Os números seguem o padrão da porta: `Number(process.env.X) || padrão`.',
          'A chave não tem padrão: `if (!process.env.CHAVE_DA_API) throw new Error("CHAVE_DA_API não definida")`.',
          'No `/saude`, monte o objeto campo a campo — só `ok`, `porta` e `limiteDeItens`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-9-git',
        type: 'multiple-choice',
        prompt: 'Num projeto com `.env`, o que vai para o repositório Git?',
        concepts: ['node-config'],
        difficulty: 'iniciante',
        tags: ['node', 'env', 'git', 'segredos'],
        options: [
          'Um `.env.example` com os nomes das variáveis e sem os valores; o `.env` fica no `.gitignore`',
          'O `.env` inteiro, para quem clonar já sair rodando',
          'O `.env` só com as chaves de desenvolvimento; as de produção ficam fora',
          'Nada: o `.env` e o `.env.example` são locais, e cada um descobre as variáveis lendo o código',
        ],
        correctIndex: 0,
        explanation:
          'O `.env` tem segredos, e o histórico do Git é para sempre — uma chave "de desenvolvimento" que vaza ainda é uma chave que vaza. O `.env.example` resolve o outro lado: quem clona vê quais variáveis existem, copia, preenche. É o que este site faz.',
        hints: ['O que acontece com um segredo que entrou num commit e foi apagado no commit seguinte?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-9-congelado',
        type: 'find-bug',
        prompt:
          'O servidor quebra antes de subir: "Cannot assign to read only property \'limiteDeItens\'". Aponte a linha com o defeito.',
        concepts: ['node-config'],
        difficulty: 'iniciante',
        tags: ['node', 'config', 'freeze', 'bug'],
        code: `const express = require('express');
const app = express();

const config = Object.freeze({
  porta: Number(process.env.PORTA) || 3000,
  limiteDeItens: Number(process.env.LIMITE_DE_ITENS) || 20,
});

app.get('/itens', (req, res) => {
  res.json({ limite: config.limiteDeItens });
});

config.limiteDeItens = 50; // só para testar com mais itens

app.listen(config.porta);`,
        buggyLine: 13,
        fix: '// para testar com mais itens: LIMITE_DE_ITENS=50 no .env',
        explanation:
          'O `Object.freeze` está lá para isto: configuração se muda **no ambiente**, não no código. Uma atribuição escondida "só para testar" valeria nesta máquina, sumiria na outra e ninguém saberia por que os limites diferem. Com o objeto congelado, a tentativa quebra na hora — que é o que se quer. O conserto não é destravar o objeto: é pôr `LIMITE_DE_ITENS=50` no `.env`.',
        hints: [
          'A mensagem fala de uma propriedade somente leitura. O que deixou o objeto assim, e onde alguém tenta escrever nele?',
          'A pergunta certa não é "como escrever nesse objeto", e sim "onde esse valor deveria ser mudado".',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-9-lacuna',
        type: 'fill-blank',
        prompt: 'Complete a função que monta a configuração a partir de um ambiente.',
        concepts: ['node-config'],
        difficulty: 'iniciante',
        tags: ['node', 'config', 'env'],
        template: `function carregarConfig(env) {
  return Object.{{1}}({
    porta: {{2}}(env.PORTA) || 3000,
    emProducao: env.NODE_ENV === {{3}},
  });
}`,
        blanks: [
          { placeholder: 'travar', size: 7 },
          { placeholder: 'converter', size: 7 },
          { placeholder: 'modo', size: 12 },
        ],
        tests: [
          {
            description: 'carregarConfig({ PORTA: "8080", NODE_ENV: "production" }) devolve porta 8080 (número) e emProducao true',
            assertion: `const c = carregarConfig({ PORTA: '8080', NODE_ENV: 'production' });
if (c.porta !== 8080) throw new Error('porta: esperava o número 8080, veio ' + JSON.stringify(c.porta));
if (c.emProducao !== true) throw new Error('emProducao: com NODE_ENV=production, esperava true, veio ' + JSON.stringify(c.emProducao));`,
          },
          {
            description: 'Sem nada no ambiente: porta 3000, emProducao false — e o objeto é congelado',
            assertion: `const c = carregarConfig({});
if (c.porta !== 3000 || c.emProducao !== false) throw new Error('com ambiente vazio, esperava {porta: 3000, emProducao: false}, veio ' + JSON.stringify(c));
if (!Object.isFrozen(c)) throw new Error('o objeto de configuração deveria estar congelado, para ninguém mudá-lo em tempo de execução');`,
          },
        ],
        explanation:
          'O objeto sai congelado para configuração só mudar no ambiente; a porta é convertida porque variável de ambiente é texto; e `"production"` é o valor que os servidores de verdade dão ao `NODE_ENV`.',
        solution: ['freeze', 'Number', "'production'"],
        hints: [
          'A primeira lacuna é o método que deixa o objeto somente leitura; a segunda, a função que transforma texto em valor numérico.',
          'A terceira é o valor que `NODE_ENV` recebe em produção, entre aspas — a aula o cita duas vezes.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
O que muda entre máquinas — porta, banco, chaves, modo — vem do **ambiente**, nunca do código. \`process.env\` é sempre texto e pode não existir: **converta** na entrada e dê **padrão** ao que pode ter padrão. Chave não tem padrão: sem ela, o servidor **se recusa a subir** e diz o que falta.

O \`.env\` guarda as variáveis na sua máquina e **não vai para o Git**; o \`.env.example\` vai, com os nomes e sem os valores. Um **módulo de configuração** lê tudo uma vez, converte, valida e exporta um objeto congelado — o resto do servidor só conhece \`config\`.

Segredo não entra em código, commit, log, resposta nem URL. Se vazou, troca-se a chave. E o que vai para o navegador é público.

Na próxima aula, tudo junto: a API de tarefas inteira, em arquivos separados, com autenticação, validação, erros e configuração — do jeito que se entrega.
`.trim(),
    },
  ],
};

import type { Lesson } from '../types';

export const lessonNodeServidor: Lesson = {
  id: 'lesson-node-2',
  trackId: 'track-node',
  title: 'O Primeiro Servidor',
  language: 'node',
  objective:
    'Subir um servidor HTTP com Express, responder a um pedido com texto e com JSON, e entender o que é uma porta.',
  concepts: ['node-servidor'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Na trilha "Como a Web Funciona" você viu o pedido sair do navegador, atravessar a rede e voltar com uma resposta. Do outro lado da rede havia um programa esperando: o **servidor**. Hoje você escreve esse programa.

## O que um servidor faz

Três coisas, e só três:

1. **Escuta** numa **porta** — um número que identifica, dentro de uma máquina, qual programa recebe os pedidos que chegam. Um site na porta 80 (ou 443, com HTTPS), o seu servidor em desenvolvimento na 3000. Duas coisas não podem escutar na mesma porta ao mesmo tempo.
2. **Recebe um pedido**: um método (\`GET\`, \`POST\`…), um caminho (\`/\`, \`/aulas\`, \`/aulas/7\`), cabeçalhos e, às vezes, um corpo.
3. **Responde**: um **status** (\`200\` deu certo, \`404\` não achei…), cabeçalhos e um corpo — texto, HTML, JSON.

E volta a esperar. Um servidor é um programa que **não termina**: ele fica de pé até alguém derrubá-lo.

## Express

O Node sabe fazer isso sozinho, com o módulo \`http\`, mas o código é cru. Quase todo servidor em Node usa o **Express**, uma biblioteca pequena que organiza o trabalho em **rotas**: "quando chegar \`GET /\`, rode esta função". É um pacote instalado, então o \`require\` é sem \`./\`:

~~~js
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Olá, mundo!');
});

app.listen(3000, () => {
  console.log('Servidor ouvindo na porta 3000');
});
~~~

Linha a linha:

- \`express()\` cria a **aplicação**: o objeto que guarda as rotas e sabe despachar cada pedido para a rota certa.
- \`app.get('/', função)\` registra uma rota: método \`GET\`, caminho \`/\`. A função recebe **dois objetos**: \`req\` (o pedido — o que chegou) e \`res\` (a resposta — o que você vai devolver).
- \`res.send('Olá, mundo!')\` responde com texto e status 200. **Toda rota precisa responder**: uma rota que termina sem \`send\`, \`json\` ou parecido deixa quem pediu esperando para sempre.
- \`app.listen(3000, callback)\` abre a porta 3000 e fica escutando. O callback roda quando a porta estiver aberta — **depois** do resto do arquivo, porque abrir uma porta é assíncrono.

Repare que \`req\` e \`res\` são só nomes: você poderia chamá-los de \`pedido\` e \`resposta\`. A convenção do Express é \`req\`/\`res\`, e você vai encontrá-la em todo código por aí.

## Texto ou JSON

\`res.send('texto')\` responde texto. Mas quem chama uma API quase nunca quer texto solto: quer **dados**, que a página vai ler e mostrar. Para isso, \`res.json\`:

~~~js
app.get('/info', (req, res) => {
  res.json({ nome: 'CodeFlow', versao: 1 });
});
~~~

\`res.json\` faz duas coisas: transforma o objeto em texto JSON (\`{"nome":"CodeFlow","versao":1}\`) e avisa no cabeçalho \`Content-Type\` que o corpo é \`application/json\` — o que permite ao \`fetch\` da página fazer \`resposta.json()\` e receber o objeto de volta. É a mesma ponte que você atravessou na aula de JSON, agora pelo outro lado.

## Como funciona aqui

Não há porta aberta dentro do navegador, então os exercícios fazem os pedidos por você: cada verificação chama \`pedir(app, 'GET', '/')\` e olha o status e o corpo que o **seu** servidor devolveu. Abaixo do veredito aparece a lista de **pedidos e respostas**, como num cliente de API — é lá que você vê o que o servidor respondeu de fato, e não só se passou.

O \`app.listen\` continua funcionando (o callback roda), só não abre porta nenhuma. E o \`console.log\` aparece no "terminal do servidor".
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `const express = require('express');
const app = express();

// Duas rotas, dois tipos de resposta.
app.get('/', (req, res) => {
  res.send('A API das aulas está no ar.');
});

app.get('/aulas', (req, res) => {
  res.json([
    { id: 1, titulo: 'Variáveis' },
    { id: 2, titulo: 'Condições' },
  ]);
});

app.listen(3000, () => console.log('ouvindo na porta 3000'));`,
      caption:
        'GET / devolve texto; GET /aulas devolve JSON — uma lista, que a página vai percorrer com map. O console.log do listen roda por último, quando a porta abre.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-2-ola',
        type: 'server',
        prompt:
          'Crie a aplicação com `express()` e responda `Olá, mundo!` (texto) para `GET /`. Depois, ponha o servidor para escutar na porta 3000.',
        concepts: ['node-servidor'],
        difficulty: 'iniciante',
        tags: ['node', 'express', 'servidor'],
        initialCode: `const express = require('express');

// Crie o app, registre a rota GET / e chame listen.
`,
        tests: [
          {
            description: 'GET / responde 200 com o texto "Olá, mundo!"',
            assertion: `if (typeof app === 'undefined') throw new Error('crie a aplicação numa variável chamada app: const app = express();');
const res = await pedir(app, 'GET', '/');
if (res.status !== 200) throw new Error('GET / respondeu ' + res.status + '; esperava 200. Corpo: ' + res.texto);
if (res.texto !== 'Olá, mundo!') throw new Error('GET / respondeu "' + res.texto + '"; esperava "Olá, mundo!"');`,
          },
          {
            description: 'O servidor escuta na porta 3000',
            assertion: `if (app.porta !== 3000) throw new Error('app.listen(3000) não foi chamado — a porta registrada é ' + app.porta);`,
          },
        ],
        solution: `const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Olá, mundo!');
});

app.listen(3000);`,
        hints: [
          'A aplicação: `const app = express();`.',
          'Uma rota é `app.get(caminho, (req, res) => { … })`, e a resposta em texto é `res.send(texto)`.',
          'No fim, `app.listen(3000);`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-2-porta',
        type: 'multiple-choice',
        prompt: 'O que a porta (o `3000` do `app.listen(3000)`) identifica?',
        concepts: ['node-servidor'],
        difficulty: 'iniciante',
        tags: ['node', 'porta', 'http'],
        options: [
          'Qual programa, dentro de uma máquina, recebe os pedidos que chegam — dois programas não podem escutar na mesma porta ao mesmo tempo',
          'Quantos pedidos por segundo o servidor aguenta',
          'A versão do Node que está rodando',
          'O tamanho máximo de cada resposta, em bytes',
        ],
        correctIndex: 0,
        explanation:
          'Um endereço de rede chega até a máquina; a porta diz qual programa, nela, atende. Sites usam 80 e 443; em desenvolvimento cada servidor escolhe uma (3000, 8080…), e a segunda tentativa de abrir uma porta já ocupada falha com "address in use".',
        hints: ['Se duas coisas rodam na mesma máquina, como o pedido sabe para qual ir?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-2-duas-rotas',
        type: 'server',
        prompt:
          'Registre duas rotas: `GET /` responde `Início` e `GET /sobre` responde `Uma API para praticar`. Cada caminho é uma rota; a mesma função não serve para as duas.',
        concepts: ['node-servidor'],
        difficulty: 'iniciante',
        tags: ['node', 'express', 'rotas'],
        initialCode: `const express = require('express');
const app = express();

// Duas rotas GET, cada uma com o seu texto.

app.listen(3000);
`,
        tests: [
          {
            description: 'GET / responde "Início"',
            assertion: `const res = await pedir(app, 'GET', '/');
if (res.status !== 200 || res.texto !== 'Início') throw new Error('GET / respondeu ' + res.status + ' "' + res.texto + '"; esperava 200 "Início"');`,
          },
          {
            description: 'GET /sobre responde "Uma API para praticar"',
            assertion: `const res = await pedir(app, 'GET', '/sobre');
if (res.status !== 200 || res.texto !== 'Uma API para praticar') throw new Error('GET /sobre respondeu ' + res.status + ' "' + res.texto + '"; esperava 200 "Uma API para praticar"');`,
          },
          {
            description: 'Um caminho que não existe, como /nada, não é atendido (404)',
            assertion: `const res = await pedir(app, 'GET', '/nada');
if (res.status !== 404) throw new Error('GET /nada respondeu ' + res.status + '; um caminho sem rota deveria dar 404');`,
          },
        ],
        solution: `const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Início');
});

app.get('/sobre', (req, res) => {
  res.send('Uma API para praticar');
});

app.listen(3000);`,
        hints: [
          'Duas chamadas a `app.get`, uma com `/` e outra com `/sobre`.',
          'O Express responde 404 sozinho para o que não tem rota — você não precisa fazer nada para /nada.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-2-json',
        type: 'server',
        prompt:
          'Responda `GET /info` com JSON: um objeto com `nome` igual a `"CodeFlow"`, `versao` igual a `1` (número) e `aulas` igual a `["Node", "APIs"]`.',
        concepts: ['node-servidor'],
        difficulty: 'iniciante',
        tags: ['node', 'express', 'json'],
        initialCode: `const express = require('express');
const app = express();

app.get('/info', (req, res) => {
  // Responda com res.json(...)
});

app.listen(3000);
`,
        tests: [
          {
            description: 'GET /info responde 200 com Content-Type application/json',
            assertion: `const res = await pedir(app, 'GET', '/info');
if (res.status !== 200) throw new Error('GET /info respondeu ' + res.status + '; esperava 200');
if (!String(res.headers['content-type']).startsWith('application/json')) throw new Error('o Content-Type é "' + res.headers['content-type'] + '"; res.json marca application/json, res.send de texto não');`,
          },
          {
            description: 'O corpo tem nome "CodeFlow", versao 1 (número) e aulas ["Node", "APIs"]',
            assertion: `const res = await pedir(app, 'GET', '/info');
const b = res.body;
if (!b || typeof b !== 'object') throw new Error('o corpo não é um objeto JSON: ' + res.texto);
if (b.nome !== 'CodeFlow') throw new Error('nome deveria ser "CodeFlow", veio ' + JSON.stringify(b.nome));
if (b.versao !== 1) throw new Error('versao deveria ser o número 1, veio ' + JSON.stringify(b.versao));
if (JSON.stringify(b.aulas) !== '["Node","APIs"]') throw new Error('aulas deveria ser ["Node","APIs"], veio ' + JSON.stringify(b.aulas));`,
          },
        ],
        solution: `const express = require('express');
const app = express();

app.get('/info', (req, res) => {
  res.json({ nome: 'CodeFlow', versao: 1, aulas: ['Node', 'APIs'] });
});

app.listen(3000);`,
        hints: [
          '`res.json(objeto)` converte para JSON e marca o Content-Type.',
          'Os tipos importam: `versao: 1` (número), não `"1"`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-2-ordem',
        type: 'predict-output',
        prompt: 'O que este programa imprime, **e em que ordem**?',
        concepts: ['node-servidor'],
        difficulty: 'intermediario',
        tags: ['node', 'express', 'assincronia'],
        code: `const express = require('express');
const app = express();

console.log('registrando rotas');

app.get('/', (req, res) => res.send('oi'));

app.listen(3000, () => {
  console.log('ouvindo na porta 3000');
});

console.log('fim do arquivo');`,
        expectedOutput: `registrando rotas
fim do arquivo
ouvindo na porta 3000`,
        explanation:
          'Abrir uma porta é assíncrono: o `listen` agenda o callback e devolve na hora, e o programa segue até o fim do arquivo. Só depois, quando a porta está aberta, o callback roda. É o mesmo padrão dos callbacks e promises que você viu em JavaScript — o servidor é um programa que fica de pé esperando eventos.',
        hints: ['O callback do `listen` roda quando a porta abre. Isso é imediato ou depois?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-node-2-lacuna',
        type: 'fill-blank',
        prompt:
          'Complete o servidor: a rota `GET /ping` responde com o texto `pong`, e a aplicação escuta na porta 3000.',
        concepts: ['node-servidor'],
        difficulty: 'iniciante',
        tags: ['node', 'express'],
        template: `const express = require('express');
const app = express();

app.{{1}}('/ping', (req, res) => {
  res.{{2}}('pong');
});

app.{{3}}(3000);`,
        blanks: [{ placeholder: 'método' }, { placeholder: 'responder' }, { placeholder: 'escutar' }],
        tests: [
          {
            description: 'GET /ping responde "pong" com status 200',
            assertion: `const res = await pedir(app, 'GET', '/ping');
if (res.status !== 200 || res.texto !== 'pong') throw new Error('GET /ping respondeu ' + res.status + ' "' + res.texto + '"; esperava 200 "pong"');`,
          },
          {
            description: 'O servidor escuta na porta 3000',
            assertion: `if (app.porta !== 3000) throw new Error('a aplicação não está escutando na porta 3000');`,
          },
        ],
        explanation:
          'Método `get`, resposta em texto com `send`, e `listen` para abrir a porta. São as três palavras de todo servidor Express mínimo.',
        solution: ['get', 'send', 'listen'],
        hints: [
          'O método HTTP vira o nome do método do app, em minúsculas.',
          'Texto sai pelo mesmo método que "Olá, mundo!" usou na primeira tarefa; a porta abre pelo método que recebe o número dela.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Um servidor **escuta numa porta**, **recebe pedidos** e **responde** — e não termina. Com o Express, isso é \`const app = express()\`, uma rota por \`app.get(caminho, (req, res) => …)\` e \`app.listen(porta)\`.

\`req\` é o que chegou; \`res\` é o que você devolve. \`res.send\` responde texto; \`res.json\` responde dados e marca o \`Content-Type\` como JSON — a ponte para o \`fetch\` da página. **Toda rota precisa responder**, senão quem pediu fica esperando.

O callback do \`listen\` roda depois do resto do arquivo: abrir uma porta é assíncrono. E o que não tem rota recebe 404 sem você fazer nada.

Nos exercícios, \`pedir(app, 'GET', '/')\` faz o pedido que um navegador faria; a lista de pedidos e respostas mostra o que o seu servidor devolveu. Na próxima aula, rotas com parâmetros: \`/aulas/7\`, \`/aulas?feita=true\`.
`.trim(),
    },
  ],
};

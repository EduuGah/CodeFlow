import { TAREFAS } from '../bancos/tarefas';
import type { Lesson } from '../types';

export const lessonProjBanco: Lesson = {
  id: 'lesson-proj-2',
  trackId: 'track-projeto',
  title: 'O Banco e o Repositório',
  language: 'node',
  objective:
    'Montar a camada de baixo: as tabelas com as restrições que se defendem sozinhas, e o repositório — o único módulo que sabe SQL — com uma função por operação, parâmetros no lugar de concatenação, e testável sem servidor.',
  concepts: ['proj-banco'],
  status: 'published',
  estimatedMinutes: 35,
  blocks: [
    {
      kind: 'prose',
      markdown: `
A camada de baixo é a que **sobrevive**: o servidor reinicia, a página fecha, o banco continua lá. Por isso ela se defende sozinha — as regras que valem para sempre ficam nas tabelas — e por isso o acesso a ela passa por um lugar só.

## As tabelas se defendem

Você já escreveu \`CREATE TABLE\` na trilha de SQL. No projeto, cada restrição é uma regra que **nenhum defeito na API consegue violar**:

~~~sql
CREATE TABLE tarefas (
  id INTEGER PRIMARY KEY,
  titulo TEXT NOT NULL,
  feita INTEGER NOT NULL DEFAULT 0 CHECK (feita IN (0, 1)),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  criada_em TEXT NOT NULL
);
~~~

\`NOT NULL\` no título, \`CHECK\` no \`feita\`, a chave estrangeira no dono. Se um dia a API tentar gravar uma tarefa sem dono, o banco recusa — e é melhor um erro na hora que uma linha órfã para sempre.

O SQL que cria as tabelas é a **migração**: um arquivo no projeto (\`migracoes/001-inicial.sql\`), no Git, rodado uma vez em cada banco. Mudou a estrutura? Nova migração (\`002-…\`), nunca uma edição à mão na tabela — quem clonar o projeto precisa chegar ao mesmo banco rodando os mesmos arquivos.

## O repositório: um módulo, uma responsabilidade

Só um arquivo do projeto sabe SQL: \`dados/tarefas.js\`, o repositório. A API chama funções com nomes do domínio — \`listarDe(usuarioId)\`, \`criar\`, \`marcar\`, \`remover\` — e nunca vê uma consulta. É a fronteira da trilha de engenharia aplicada: trocar o SQLite por outro banco muda um arquivo.

~~~js
const banco = require('./banco');

async function listarDe(usuarioId) {
  return banco.consultar('SELECT * FROM tarefas WHERE usuario_id = ? ORDER BY id', [usuarioId]);
}

async function buscar(id) {
  const linhas = await banco.consultar('SELECT * FROM tarefas WHERE id = ?', [id]);
  return linhas[0] ?? null;
}
~~~

\`banco.consultar(sql, params)\` devolve uma lista de objetos, uma chave por coluna; \`banco.executar(sql, params)\` roda um \`INSERT\`, \`UPDATE\` ou \`DELETE\` e devolve \`{ linhas, ultimoId }\`. As duas são assíncronas — como todo driver de banco de verdade —, e é por isso que o repositório é \`async\` e a API usa \`await\`.

## Parâmetros, nunca concatenação

~~~js
// NUNCA:
banco.consultar("SELECT * FROM tarefas WHERE titulo = '" + titulo + "'");
// SEMPRE:
banco.consultar('SELECT * FROM tarefas WHERE titulo = ?', [titulo]);
~~~

Com concatenação, um título digitado como \`x' OR '1'='1\` vira parte do SQL — e a consulta passa a devolver todas as tarefas de todo mundo. É a **injeção de SQL**, o ataque mais antigo e ainda mais comum da web. Com \`?\`, o valor é entregue ao banco **como valor**: aspas, ponto e vírgula, \`OR\`, tudo é só texto dentro da coluna. Não há exceção à regra: se um valor vem de fora, ele entra por parâmetro.

## O que o repositório devolve

- **Listar** devolve a lista, vazia se não há nada — nunca \`null\`.
- **Buscar** devolve o objeto, ou \`null\` — "não tem" devolve, como a aula de erros ensinou.
- **Criar** devolve a linha criada, **lida de volta** do banco depois do \`INSERT\` (com o \`id\` que o banco escolheu e os padrões que ele preencheu) — não o objeto que você montou na mão.
- **Marcar** e **remover** devolvem \`true\` se mexeram numa linha, \`false\` se o id não existia: é \`executar(...).linhas > 0\`.

E as linhas saem **como o banco as tem**: \`feita\` em 0/1. A tradução para booleano é da API, que conhece a página. O repositório não sabe que existe página.

## Testar sem servidor

O repositório é só funções: chame-as num teste, com um banco recém-criado, e confira o que voltou. É a camada mais fácil de testar do projeto — e a que mais vale testar, porque um SQL errado aqui corrompe dados, não uma tela.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// dados/tarefas.js — o único arquivo que sabe SQL.
const banco = require('./banco');

async function criar({ titulo, usuarioId }) {
  const { ultimoId } = await banco.executar(
    "INSERT INTO tarefas (titulo, usuario_id, criada_em) VALUES (?, ?, date('now'))",
    [titulo, usuarioId]
  );
  return buscar(ultimoId); // lida de volta: com o id e os padrões do banco
}

async function marcar(id, feita) {
  const { linhas } = await banco.executar('UPDATE tarefas SET feita = ? WHERE id = ?', [feita ? 1 : 0, id]);
  return linhas > 0;
}

async function remover(id) {
  const { linhas } = await banco.executar('DELETE FROM tarefas WHERE id = ?', [id]);
  return linhas > 0;
}`,
      caption:
        'Cada função um SQL com parâmetros, e o que ela devolve é o contrato com a API: a linha criada, ou se mexeu em alguma. O booleano da página vira 0/1 aqui, na entrada do banco.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-2-inserir',
        type: 'sql',
        database: 'tarefas',
        prompt:
          'Crie a tarefa **"Publicar o projeto"** para a usuária de id **2**, criada em **2026-09-05**. Deixe o `id` e o `feita` por conta do banco — o padrão é o certo.',
        concepts: ['proj-banco', 'sql-escrita'],
        difficulty: 'iniciante',
        tags: ['projeto', 'sql', 'insert'],
        initialCode: `INSERT INTO tarefas (titulo, usuario_id, criada_em)
VALUES (`,
        tests: [
          {
            description: 'A tarefa existe, pendente, da usuária 2',
            query: "SELECT titulo, feita, usuario_id, criada_em FROM tarefas WHERE titulo = 'Publicar o projeto'",
          },
          { description: 'As 4 tarefas de antes continuam lá, e há 5 agora', query: 'SELECT COUNT(*) FROM tarefas' },
        ],
        solution: `INSERT INTO tarefas (titulo, usuario_id, criada_em)
VALUES ('Publicar o projeto', 2, '2026-09-05');`,
        hints: [
          'Três valores, na ordem das colunas: texto entre aspas simples, número sem, data como texto.',
          "`VALUES ('Publicar o projeto', 2, '2026-09-05')`.",
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-2-marcar',
        type: 'sql',
        database: 'tarefas',
        prompt: 'A tarefa **2** foi feita. Marque-a — e **só** ela.',
        concepts: ['proj-banco', 'sql-escrita'],
        difficulty: 'iniciante',
        tags: ['projeto', 'sql', 'update'],
        initialCode: `UPDATE tarefas
SET feita = 1;`,
        tests: [
          { description: 'A tarefa 2 está feita', query: 'SELECT feita FROM tarefas WHERE id = 2' },
          { description: 'As outras três continuam como estavam', query: 'SELECT id, feita FROM tarefas WHERE id <> 2 ORDER BY id' },
        ],
        solution: `UPDATE tarefas
SET feita = 1
WHERE id = 2;`,
        hints: ['Rode como está e olhe a segunda verificação: o comando alcançou todas as tarefas.', 'Falta o `WHERE id = 2`.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-2-injecao',
        type: 'predict-output',
        prompt: 'O que este programa imprime? A função monta o SQL concatenando o que veio da página.',
        concepts: ['proj-banco'],
        difficulty: 'iniciante',
        tags: ['projeto', 'sql', 'seguranca'],
        code: `function montarConsulta(titulo) {
  return "SELECT * FROM tarefas WHERE titulo = '" + titulo + "'";
}

console.log(montarConsulta('Estudar Node'));
console.log(montarConsulta("x' OR '1'='1"));`,
        expectedOutput: `SELECT * FROM tarefas WHERE titulo = 'Estudar Node'
SELECT * FROM tarefas WHERE titulo = 'x' OR '1'='1'`,
        explanation:
          'A segunda consulta é válida — e devolve **todas** as tarefas, de todo mundo, porque `\'1\'=\'1\'` é sempre verdadeiro. Quem digitou o título escreveu SQL, e o programa executou. É a injeção de SQL. Com `consultar("... WHERE titulo = ?", [titulo])`, o texto inteiro, aspas e `OR` incluídos, vira o valor da comparação — e não acha tarefa nenhuma.',
        hints: ['Cole o segundo argumento no lugar do `+ titulo +` e leia o SQL que sai.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-2-ler',
        type: 'server',
        prompt:
          'Escreva o começo do repositório: exporte `listarDe(usuarioId)`, que devolve as tarefas daquele usuário em ordem de `id`, e `buscar(id)`, que devolve a tarefa ou `null`. Use `require("./banco")` — o banco do exercício está acima do editor — e parâmetros com `?`.',
        concepts: ['proj-banco'],
        difficulty: 'intermediario',
        tags: ['projeto', 'repositorio', 'sql'],
        banco: TAREFAS.sql,
        initialCode: `// dados/tarefas.js — o único arquivo que sabe SQL.
const banco = require('./banco');

// async function listarDe(usuarioId) { … }
// async function buscar(id) { … }

module.exports = {};
`,
        tests: [
          {
            description: 'listarDe(1) devolve as 3 tarefas da Ana, em ordem de id',
            assertion: `const { listarDe } = module.exports;
if (typeof listarDe !== 'function') throw new Error('exporte listarDe(usuarioId)');
const lista = await listarDe(1);
if (!Array.isArray(lista)) throw new Error('listarDe deveria devolver uma lista, veio ' + JSON.stringify(lista) + (lista && typeof lista.then === 'function' ? ' — faltou o await no consultar' : ''));
if (lista.length !== 3 || lista.map((t) => t.id).join(',') !== '1,2,3') throw new Error('esperava as tarefas 1, 2 e 3 da Ana, veio ' + JSON.stringify(lista.map((t) => t.id)));
if (lista[0].titulo !== 'Estudar Node' || lista[0].feita !== 0) throw new Error('cada linha é um objeto com as colunas: esperava {titulo: "Estudar Node", feita: 0, …}, veio ' + JSON.stringify(lista[0]));`,
          },
          {
            description: 'listarDe(2) devolve só a tarefa da Bia; listarDe(9) devolve uma lista vazia',
            assertion: `const { listarDe } = module.exports;
const bia = await listarDe(2);
if (bia.length !== 1 || bia[0].titulo !== 'Desenhar a página') throw new Error('listarDe(2) deveria devolver só "Desenhar a página", veio ' + JSON.stringify(bia));
const ninguem = await listarDe(9);
if (!Array.isArray(ninguem) || ninguem.length !== 0) throw new Error('listarDe(9) deveria devolver [], veio ' + JSON.stringify(ninguem));`,
          },
          {
            description: 'buscar(3) devolve a tarefa 3; buscar(9) devolve null',
            assertion: `const { buscar } = module.exports;
if (typeof buscar !== 'function') throw new Error('exporte buscar(id)');
const tres = await buscar(3);
if (!tres || tres.titulo !== 'Revisar SQL' || tres.feita !== 1) throw new Error('buscar(3) deveria devolver a tarefa "Revisar SQL" (feita: 1), veio ' + JSON.stringify(tres));
const nada = await buscar(9);
if (nada !== null) throw new Error('buscar(9) deveria devolver null, veio ' + JSON.stringify(nada) + ' — "não tem" devolve null');`,
          },
        ],
        solution: `const banco = require('./banco');

async function listarDe(usuarioId) {
  return banco.consultar('SELECT * FROM tarefas WHERE usuario_id = ? ORDER BY id', [usuarioId]);
}

async function buscar(id) {
  const linhas = await banco.consultar('SELECT * FROM tarefas WHERE id = ?', [id]);
  return linhas[0] ?? null;
}

module.exports = { listarDe, buscar };`,
        hints: [
          '`banco.consultar(sql, params)` devolve uma Promise com a lista de linhas: `await` nela.',
          'listarDe: `SELECT * FROM tarefas WHERE usuario_id = ? ORDER BY id`, com `[usuarioId]`.',
          'buscar: a mesma consulta com `WHERE id = ?`; a tarefa é a primeira linha, e sem linhas é `null`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-2-escrever',
        type: 'server',
        prompt:
          'O resto do repositório. `criar({ titulo, usuarioId })` insere (com `criada_em` = `date(\'now\')`) e devolve a tarefa **lida de volta** do banco; `marcar(id, feita)` grava `1` ou `0` e devolve `true` se alterou alguma linha; `remover(id)` apaga e devolve `true` se apagou. `listarDe` e `buscar` já estão prontas.',
        concepts: ['proj-banco'],
        difficulty: 'intermediario',
        tags: ['projeto', 'repositorio', 'sql', 'escrita'],
        banco: TAREFAS.sql,
        initialCode: `const banco = require('./banco');

async function listarDe(usuarioId) {
  return banco.consultar('SELECT * FROM tarefas WHERE usuario_id = ? ORDER BY id', [usuarioId]);
}

async function buscar(id) {
  const linhas = await banco.consultar('SELECT * FROM tarefas WHERE id = ?', [id]);
  return linhas[0] ?? null;
}

// async function criar({ titulo, usuarioId }) { … }
// async function marcar(id, feita) { … }
// async function remover(id) { … }

module.exports = { listarDe, buscar };
`,
        tests: [
          {
            description: 'criar devolve a tarefa lida do banco: id 5, feita 0, criada_em de hoje',
            assertion: `const { criar } = module.exports;
if (typeof criar !== 'function') throw new Error('exporte criar({ titulo, usuarioId })');
const nova = await criar({ titulo: 'Publicar', usuarioId: 2 });
if (!nova || nova.id !== 5) throw new Error('criar deveria devolver a tarefa com o id que o banco escolheu (5), veio ' + JSON.stringify(nova));
if (nova.titulo !== 'Publicar' || nova.usuario_id !== 2 || nova.feita !== 0) throw new Error('esperava {id: 5, titulo: "Publicar", feita: 0, usuario_id: 2, …}, veio ' + JSON.stringify(nova) + ' — leia a linha de volta com buscar(ultimoId)');
if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(String(nova.criada_em))) throw new Error('criada_em deveria ser a data de hoje no formato AAAA-MM-DD, veio ' + JSON.stringify(nova.criada_em) + " — use date('now') no INSERT");`,
          },
          {
            description: 'marcar(1, true) grava feita = 1 e devolve true; marcar(9, true) devolve false',
            assertion: `const { marcar, buscar } = module.exports;
if (typeof marcar !== 'function') throw new Error('exporte marcar(id, feita)');
const ok = await marcar(1, true);
if (ok !== true) throw new Error('marcar(1, true) deveria devolver true, veio ' + JSON.stringify(ok));
const um = await buscar(1);
if (um.feita !== 1) throw new Error('depois de marcar(1, true), a tarefa 1 deveria ter feita = 1 no banco, veio ' + JSON.stringify(um.feita) + ' — o banco guarda 0 ou 1, não true');
const desfeita = await marcar(1, false);
if (desfeita !== true || (await buscar(1)).feita !== 0) throw new Error('marcar(1, false) deveria voltar feita para 0');
const nada = await marcar(9, true);
if (nada !== false) throw new Error('marcar(9, true) deveria devolver false (nenhuma linha alterada), veio ' + JSON.stringify(nada));`,
          },
          {
            description: 'remover(4) apaga e devolve true; remover(4) de novo devolve false',
            assertion: `const { remover, buscar } = module.exports;
if (typeof remover !== 'function') throw new Error('exporte remover(id)');
if ((await remover(4)) !== true) throw new Error('remover(4) deveria devolver true');
if ((await buscar(4)) !== null) throw new Error('depois de remover(4), buscar(4) deveria devolver null');
if ((await remover(4)) !== false) throw new Error('remover(4) de novo deveria devolver false');`,
          },
        ],
        solution: `const banco = require('./banco');

async function listarDe(usuarioId) {
  return banco.consultar('SELECT * FROM tarefas WHERE usuario_id = ? ORDER BY id', [usuarioId]);
}

async function buscar(id) {
  const linhas = await banco.consultar('SELECT * FROM tarefas WHERE id = ?', [id]);
  return linhas[0] ?? null;
}

async function criar({ titulo, usuarioId }) {
  const { ultimoId } = await banco.executar(
    "INSERT INTO tarefas (titulo, usuario_id, criada_em) VALUES (?, ?, date('now'))",
    [titulo, usuarioId]
  );
  return buscar(ultimoId);
}

async function marcar(id, feita) {
  const { linhas } = await banco.executar('UPDATE tarefas SET feita = ? WHERE id = ?', [feita ? 1 : 0, id]);
  return linhas > 0;
}

async function remover(id) {
  const { linhas } = await banco.executar('DELETE FROM tarefas WHERE id = ?', [id]);
  return linhas > 0;
}

module.exports = { listarDe, buscar, criar, marcar, remover };`,
        hints: [
          '`banco.executar(sql, params)` devolve `{ linhas, ultimoId }`. No INSERT, o `ultimoId` é o id da tarefa nova — e `buscar(ultimoId)` a lê de volta.',
          'O booleano vira número na entrada do banco: `feita ? 1 : 0`.',
          'Alterou ou apagou alguma linha? `linhas > 0`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-2-criar-passos',
        type: 'order-steps',
        prompt: 'Coloque na ordem o que `criar({ titulo, usuarioId })` faz no repositório.',
        concepts: ['proj-banco'],
        difficulty: 'iniciante',
        tags: ['projeto', 'repositorio'],
        steps: [
          { id: 'insert', text: '`await banco.executar(…)` com o INSERT em `tarefas` e os parâmetros `[titulo, usuarioId]`', ordem: 1 },
          { id: 'id', text: 'Pegar o `ultimoId` do que `executar` devolveu — o id que o banco escolheu', ordem: 2 },
          { id: 'ler', text: 'Ler a linha de volta com `buscar(ultimoId)`', ordem: 3 },
          { id: 'devolver', text: 'Devolver a tarefa lida — com o id, o `feita` padrão e a data que o banco preencheu', ordem: 4 },
        ],
        explanation:
          'O id só existe depois do INSERT, e vem em `ultimoId`. Ler a linha de volta, em vez de montar o objeto na mão, garante que o que a API devolve é exatamente o que ficou no banco — inclusive o que o banco preencheu sozinho.',
        hints: ['O id da tarefa só existe depois de o banco criá-la.', 'A tarefa devolvida vem do banco, não de um objeto montado na mão.'],
      },
    },
    {
      kind: 'summary',
      markdown: `
As tabelas **se defendem**: \`NOT NULL\`, \`CHECK\`, a chave estrangeira — regras que nenhum defeito na API viola. O SQL que as cria é a **migração**, no Git, rodada uma vez por banco.

O **repositório** é o único módulo que sabe SQL: uma função por operação, com nomes do domínio, \`async\`, e **parâmetros com \`?\` — nunca concatenação**, porque um valor concatenado vira SQL nas mãos de quem digitou. Listar devolve lista; buscar devolve ou \`null\`; criar devolve a linha lida de volta; marcar e remover devolvem se mexeram. As linhas saem como o banco as tem — \`feita\` em 0/1.

Na próxima aula, a camada do meio: a API sobre o repositório, com login pelo banco, validação e o contrato que a página vai usar.
`.trim(),
    },
  ],
};

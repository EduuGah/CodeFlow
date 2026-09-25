import type { Lesson } from '../types';

export const lessonOrmQueriesEOSqlPorBaixo: Lesson = {
  id: 'lesson-orm-3',
  trackId: 'track-orm',
  title: 'Queries de um ORM, e o SQL por Baixo',
  language: 'javascript',
  objective:
    'Traduzir os métodos mais comuns de um ORM (findMany, create, update, delete) para o SQL equivalente, e reconhecer o problema de N+1 consultas.',
  concepts: ['orm-queries'],
  status: 'published',
  estimatedMinutes: 26,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Cada método comum de um ORM tem uma tradução direta para SQL — e saber essa tradução é o que separa usar a ferramenta de depender cegamente dela.

## Os métodos e o SQL equivalente

~~~js
usuario.findMany()                          // SELECT * FROM Usuario
usuario.findUnique({ where: { id } })       // SELECT * FROM Usuario WHERE id = ?
usuario.create({ data: { nome, email } })   // INSERT INTO Usuario (nome, email) VALUES (?, ?)
usuario.update({ where: { id }, data })     // UPDATE Usuario SET ... WHERE id = ?
usuario.delete({ where: { id } })           // DELETE FROM Usuario WHERE id = ?
~~~

Um filtro (\`where\`) vira \`WHERE\`; pedir campos específicos (\`select\`) vira a lista depois do \`SELECT\` em vez de \`*\`. A tradução não é mágica — é o mesmo SQL que a trilha de SQL já ensinou, só que montado pelo ORM a partir de um objeto JavaScript.

## Pedir uma relação junto

Lembra do \`model Post { autor Usuario @relation(...) }\` da aula anterior? Buscar um post e o nome de quem o escreveu, sem o ORM, seria um \`JOIN\`. Com o ORM, é pedir a relação explicitamente:

~~~js
post.findMany({ include: { autor: true } })
// equivalente a: SELECT * FROM Post JOIN Usuario ON Post.autorId = Usuario.id
~~~

## O problema de N+1

Aqui mora a armadilha mais comum de quem usa um ORM sem saber o que roda por baixo. Buscar uma lista de posts e, **para cada um**, buscar o autor separadamente, dentro de um loop:

~~~js
const posts = await post.findMany();               // 1 consulta
for (const p of posts) {
  const autor = await usuario.findUnique({ where: { id: p.autorId } }); // 1 consulta POR post
}
~~~

Com 100 posts, isso é **1 consulta para a lista + 100 consultas, uma por post** — 101 consultas para o que poderia ser feito em uma. É o "N+1": 1 consulta inicial, mais N consultas (uma por item da lista). O código funciona, devolve a resposta certa, e mesmo assim é lento — exatamente o tipo de defeito que só aparece quando os dados crescem, como a aula de Big O também descreveu para loops aninhados.

A correção é pedir a relação **junto**, na mesma consulta:

~~~js
const posts = await post.findMany({ include: { autor: true } }); // 1 consulta só, com o JOIN embutido
~~~
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Simulação: contar quantas "consultas" cada abordagem faria.
function consultasSemInclude(numPosts) {
  return 1 + numPosts; // 1 para a lista, 1 por post para o autor
}

function consultasComInclude(numPosts) {
  return 1; // tudo numa consulta só, com o JOIN embutido
}

consultasSemInclude(100); // 101
consultasComInclude(100); // 1`,
      caption: 'O número de consultas cresce com a lista num caso, e fica constante no outro — a mesma lógica de O(n) contra O(1) da trilha de Big O.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-orm-3-traduzir-findmany',
        type: 'multiple-choice',
        prompt: 'A qual comando SQL `usuario.findMany({ where: { ativo: true } })` corresponde?',
        concepts: ['orm-queries'],
        difficulty: 'iniciante',
        tags: ['orm', 'sql'],
        options: [
          'SELECT * FROM Usuario WHERE ativo = true',
          'INSERT INTO Usuario (ativo) VALUES (true)',
          'DELETE FROM Usuario WHERE ativo = true',
          'UPDATE Usuario SET ativo = true',
        ],
        correctIndex: 0,
        explanation:
          '`findMany` busca várias linhas — o `SELECT` — e o `where` vira a cláusula `WHERE` que filtra pela condição, exatamente como na trilha de SQL.',
        hints: ['`find` já indica busca — qual comando SQL busca linhas?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-orm-3-o-que-e-n-mais-1',
        type: 'multiple-choice',
        prompt: 'O que é o problema de "N+1 consultas"?',
        concepts: ['orm-queries'],
        difficulty: 'intermediario',
        tags: ['orm', 'n+1', 'performance'],
        options: [
          'Buscar uma lista com 1 consulta e, para cada um dos N itens, fazer mais uma consulta separada dentro de um loop — N+1 consultas onde 1 bastaria',
          'Um erro de sintaxe que acontece quando o schema tem mais de N tabelas',
          'O limite máximo de consultas simultâneas que um banco aceita',
          'Uma consulta que sempre devolve N+1 linhas a mais do que o esperado',
        ],
        correctIndex: 0,
        explanation:
          '"N+1" descreve o padrão exato: 1 consulta para buscar a lista, mais N consultas (uma por item) para buscar algo relacionado a cada um — em vez de pedir tudo junto numa única consulta com JOIN.',
        hints: ['O nome descreve uma contagem: 1 consulta, mais quantas depois?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-orm-3-corrigir-n-mais-1',
        type: 'find-bug',
        prompt: 'Este código busca posts e o autor de cada um, mas faz uma consulta a mais para cada post — o problema de N+1. Aponte a linha que precisa mudar.',
        concepts: ['orm-queries'],
        difficulty: 'intermediario',
        tags: ['orm', 'n+1', 'bug'],
        code: `function carregarPostsComAutor(post, usuario) {
  const posts = post.findMany({ include: { autor: true } });
  for (const p of posts) {
    p.autorCarregado = usuario.findUnique({ where: { id: p.autorId } });
  }
  return posts;
}

let chamadas = 0;
const post = { findMany: () => { chamadas++; return [{ autorId: 1 }, { autorId: 2 }, { autorId: 3 }]; } };
const usuario = { findUnique: () => { chamadas++; return {}; } };

carregarPostsComAutor(post, usuario);
if (chamadas !== 1) throw new Error('esperava 1 chamada ao banco (o include já traz o autor), foram ' + chamadas);`,
        buggyLine: 4,
        fix: '    // o autor já veio junto pelo include — nada a buscar aqui',
        explanation:
          'A busca já pede `include: { autor: true }` — o autor de cada post vem embutido na mesma consulta. Mesmo assim, o loop busca o autor de novo, post por post, com `usuario.findUnique`: é a consulta extra do N+1, feita por engano mesmo depois de já ter pedido o dado certo na busca original.',
        hints: [
          'A busca já usa `include: { autor: true }` — o que o loop faz logo depois, então, é necessário?',
          'Se o autor já veio junto na busca, buscar de novo dentro do loop é trabalho repetido — e é exatamente esse trabalho repetido que conta como consulta a mais.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-orm-3-contar-consultas',
        type: 'code',
        prompt: 'Escreva `contarConsultas(numItens, usaInclude)`: devolve o número de consultas que a busca faria — `1` se `usaInclude` for `true` (tudo numa consulta), ou `1 + numItens` se for `false` (uma consulta por item, além da lista).',
        concepts: ['orm-queries'],
        difficulty: 'iniciante',
        tags: ['orm', 'n+1'],
        initialCode: `function contarConsultas(numItens, usaInclude) {
  // Seu código aqui
}`,
        tests: [
          {
            description: 'Com include, é sempre 1 consulta',
            assertion: `const r = contarConsultas(100, true);
if (r !== 1) throw new Error('esperava 1, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Sem include, é 1 + numItens',
            assertion: `const r = contarConsultas(100, false);
if (r !== 101) throw new Error('esperava 101, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Sem include e zero itens, é só a consulta da lista',
            assertion: `const r = contarConsultas(0, false);
if (r !== 1) throw new Error('esperava 1, veio ' + JSON.stringify(r));`,
          },
        ],
        solution: `function contarConsultas(numItens, usaInclude) {
  return usaInclude ? 1 : 1 + numItens;
}`,
        hints: ['Um `if`/`else` (ou um operador ternário) escolhendo entre `1` e `1 + numItens` conforme `usaInclude` resolve.'],
      },
    },
    {
      kind: 'summary',
      markdown: `
Os métodos de um ORM traduzem direto para SQL: findMany/findUnique para SELECT, create para INSERT, update para UPDATE, delete para DELETE, e where para WHERE. Pedir uma relação com include evita o problema de N+1 — uma consulta a mais por item de uma lista, em vez de trazer tudo junto numa consulta só.

Com isso fecha a trilha de ORM: o que ele resolve, como schema e migrations se conectam, e a tradução para o SQL que continua rodando por baixo de cada método.
`.trim(),
    },
  ],
};

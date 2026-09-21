import type { Lesson } from '../types';

export const lessonProjDesenho: Lesson = {
  id: 'lesson-proj-1',
  trackId: 'track-projeto',
  title: 'O Desenho Antes do Código',
  language: 'node',
  objective:
    'Decidir, antes de escrever, o que cada camada faz, quais são os dados, quais são os recursos da API e as telas — e em que ordem construir para cada passo deixar algo rodando.',
  concepts: ['proj-desenho'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Você já fez a lista de tarefas duas vezes: como página, na trilha da página, e como componente, na de React. As duas guardavam as tarefas no navegador — fechou a aba em outro computador, sumiram. Este projeto é a terceira, e a de verdade: **cada pessoa tem as suas tarefas, guardadas num banco, atrás de uma API**. É a aplicação inteira que a plataforma prometeu desde a primeira aula — e ela começa sem código.

## As três camadas, e quem faz o quê

| Camada | Faz | Não faz |
| --- | --- | --- |
| **Página** (navegador) | mostra, pede, envia o que a pessoa digitou | não decide nada: qualquer regra na página pode ser pulada por quem abrir o console |
| **API** (servidor) | decide, protege, valida, traduz | não guarda: cada pedido começa do zero |
| **Banco** | guarda, garante o que a tabela promete | não sabe o que é HTTP nem quem está logado |

A regra que organiza tudo: **a verdade mora no banco, só a API toca nele, e a página nunca confia em si mesma.** Se a tarefa "pertence a quem a criou", isso é conferido na API, em toda rota, e garantido no banco pela chave estrangeira — a página só mostra o que recebeu.

## Os dados

Três tabelas, e a razão de cada uma:

~~~sql
usuarios (id, nome, email UNIQUE)
sessoes  (token PRIMARY KEY, usuario_id → usuarios)
tarefas  (id, titulo, feita 0|1, usuario_id → usuarios, criada_em)
~~~

\`sessoes\` existe porque a página precisa dizer **quem** está pedindo, e ela diz isso com um token no cabeçalho — a tabela é o que transforma o token em pessoa. \`feita\` é \`0\` ou \`1\` porque o SQLite não tem booleano; a API vai traduzir para \`true\`/\`false\` antes de a página ver. \`usuario_id NOT NULL REFERENCES usuarios\` é a garantia de que não existe tarefa sem dono, mesmo que a API tenha um defeito.

Neste projeto os tokens são fixos (\`token-da-ana\`, \`token-da-bia\`): o login de verdade — senha, hash, validade — fica de fora, e o desenho é o mesmo.

## Os recursos da API

| Pedido | Faz | Login? |
| --- | --- | --- |
| \`GET /tarefas\` | as tarefas de quem pediu | sim |
| \`POST /tarefas\` | cria uma, do dono logado | sim |
| \`PATCH /tarefas/:id\` | altera \`titulo\` e/ou \`feita\` | sim, e só do dono |
| \`DELETE /tarefas/:id\` | apaga | sim, e só do dono |
| \`GET /saude\` | \`{ ok: true }\` | não |

É a tabela do projeto da trilha de Node — o contrato que a página vai usar. Cada resposta de erro no formato \`{ erro }\`; cada tarefa devolvida com \`feita\` já booleano.

## As telas

Uma tela só: a lista, o formulário de nova tarefa, um filtro (todas, pendentes, feitas), e o botão de marcar e o de apagar em cada item. E os **estados** que a trilha de React ensinou a não esquecer: carregando, erro (com como tentar de novo), vazio. Como o login é fixo, a tela tem um seletor de quem você é — Ana ou Bia — que troca o token.

## A ordem de construção

1. **O banco**: as tabelas e alguns dados. Dá para consultar.
2. **O repositório**: as funções que a API vai chamar, cada uma um SQL com parâmetros. Dá para testar sem servidor.
3. **A API**: as rotas sobre o repositório, com login, validação e erros. Dá para pedir.
4. **A página**: o \`fetch\` para a API, os estados, o formulário. Dá para usar.
5. **Fechar**: pedidos de ponta a ponta, README, publicar.

Cada passo deixa algo que roda e que se testa. É a regra de sempre — fatias que funcionam — aplicada ao projeto inteiro: nunca "toda a página, depois toda a API".

## O que "pronto" quer dizer

Antes de começar, a lista que decide se acabou: a Ana vê só as tarefas dela; criar, marcar e apagar funcionam e sobrevivem a recarregar a página; sem token, a API responde 401; tarefa de outro, 403; título vazio, 400; a página mostra carregando, erro e vazio. Sem essa lista, "pronto" vira opinião.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Um pedido atravessa as três camadas — e cada uma faz só a sua parte.

// página: pede, com o token de quem está usando
fetch('/tarefas', { headers: { Authorization: 'Bearer token-da-ana' } });

// API: descobre quem é, chama o repositório, traduz e responde
app.get('/tarefas', exigirLogin, async (req, res) => {
  const tarefas = await repositorio.listarDe(req.usuario.id);
  res.json(tarefas.map((t) => ({ ...t, feita: t.feita === 1 })));
});

// repositório: um SQL com parâmetro, nada mais
async function listarDe(usuarioId) {
  return banco.consultar('SELECT * FROM tarefas WHERE usuario_id = ? ORDER BY id', [usuarioId]);
}`,
      caption:
        'A página não sabe SQL; o repositório não sabe HTTP; a API é a única que sabe quem está pedindo. É esse desenho que as próximas aulas constroem, uma camada por vez.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-1-onde-mora',
        type: 'multiple-choice',
        prompt: 'A regra "uma tarefa só pode ser vista, alterada e apagada por quem a criou" mora onde?',
        concepts: ['proj-desenho'],
        difficulty: 'iniciante',
        tags: ['projeto', 'camadas', 'seguranca'],
        options: [
          'Na API, que confere o dono em toda rota — e no banco, que não aceita tarefa sem dono; a página só mostra o que recebeu',
          'Na página: ela filtra a lista e só mostra as tarefas do usuário logado',
          'Só no banco: uma chave estrangeira resolve',
          'No token: quem tem o token tem as tarefas',
        ],
        correctIndex: 0,
        explanation:
          'Qualquer regra que exista só na página pode ser pulada por quem abrir o console e chamar a API direto. A API é a camada que decide — e ela confere `tarefa.usuario_id === req.usuario.id` em cada rota. O banco garante o que é da estrutura (toda tarefa tem dono), mas não sabe quem está pedindo. O token só diz quem é; não diz o que pode.',
        hints: ['Qual camada é a única que sabe quem está pedindo **e** pode ser confiada?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-1-pendentes',
        type: 'sql',
        database: 'tarefas',
        prompt:
          'Antes de qualquer código, confira que o banco responde o que a tela vai precisar: as tarefas **pendentes** da usuária de id **1**, com o `titulo` e o `nome` de quem criou, da mais antiga para a mais nova.',
        concepts: ['proj-desenho', 'sql-join'],
        difficulty: 'iniciante',
        tags: ['projeto', 'sql', 'join'],
        initialCode: `SELECT titulo, nome
FROM tarefas
`,
        tests: [
          {
            description: 'Duas tarefas pendentes da Ana, na ordem em que foram criadas',
            ordered: true,
          },
        ],
        solution: `SELECT t.titulo, u.nome
FROM tarefas t
JOIN usuarios u ON u.id = t.usuario_id
WHERE t.feita = 0 AND t.usuario_id = 1
ORDER BY t.criada_em;`,
        hints: [
          'O nome está em `usuarios`; a tarefa aponta para ela por `usuario_id`. É um JOIN.',
          'Pendente é `feita = 0`. A ordem é por `criada_em`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-1-camadas',
        type: 'predict-output',
        prompt: 'O que este programa imprime, e em que ordem? É um pedido atravessando as camadas, cada uma avisando que passou.',
        concepts: ['proj-desenho'],
        difficulty: 'iniciante',
        tags: ['projeto', 'camadas'],
        code: `const banco = {
  consultar(sql, params) {
    console.log('banco: ' + sql + ' com ' + JSON.stringify(params));
    return [{ id: 1, titulo: 'Estudar Node', feita: 0 }];
  },
};

const repositorio = {
  listarDe(usuarioId) {
    console.log('repositório: listarDe(' + usuarioId + ')');
    return banco.consultar('SELECT * FROM tarefas WHERE usuario_id = ?', [usuarioId]);
  },
};

function rota(req) {
  console.log('rota: ' + req.method + ' ' + req.path + ' de ' + req.usuario.nome);
  const tarefas = repositorio.listarDe(req.usuario.id);
  console.log('resposta: ' + tarefas.length + ' tarefa(s), feita=' + (tarefas[0].feita === 1));
}

rota({ method: 'GET', path: '/tarefas', usuario: { id: 1, nome: 'Ana' } });`,
        expectedOutput: `rota: GET /tarefas de Ana
repositório: listarDe(1)
banco: SELECT * FROM tarefas WHERE usuario_id = ? com [1]
resposta: 1 tarefa(s), feita=false`,
        explanation:
          'A rota sabe quem pediu e chama o repositório com o id; o repositório sabe SQL e chama o banco com o parâmetro; o banco devolve linhas. A resposta é montada na rota — inclusive a tradução de `feita` de 0/1 para booleano, que é da API, não do banco nem da página.',
        hints: ['Siga as chamadas de cima para baixo: quem chama quem? Cada função imprime antes de chamar a próxima.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-1-ordem',
        type: 'order-steps',
        prompt: 'Coloque na ordem as etapas de construção do projeto — cada uma deixa algo que roda.',
        concepts: ['proj-desenho'],
        difficulty: 'iniciante',
        tags: ['projeto', 'planejamento'],
        steps: [
          { id: 'banco', text: 'O banco: as tabelas com as restrições, e alguns dados para consultar', ordem: 1 },
          { id: 'repo', text: 'O repositório: cada função um SQL com parâmetros, testável sem servidor', ordem: 2 },
          { id: 'api', text: 'A API: as rotas sobre o repositório, com login, validação e erros', ordem: 3 },
          { id: 'pagina', text: 'A página: o fetch para a API, os estados de carregando, erro e vazio, o formulário', ordem: 4 },
          { id: 'fechar', text: 'Fechar: pedidos de ponta a ponta, README, publicar', ordem: 5 },
        ],
        explanation:
          'De baixo para cima, porque cada camada só depende da de baixo: o repositório precisa das tabelas, a API do repositório, a página da API. E cada etapa se testa sozinha — o repositório sem servidor, a API com pedidos, a página contra a API pronta. Começar pela página obrigaria a inventar respostas falsas para ela.',
        hints: [
          'Cada camada depende da de baixo. Qual não depende de nenhuma?',
          'A página é a última a existir, porque só se testa contra uma API que responde.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-proj-1-booleano',
        type: 'multiple-choice',
        prompt: 'O banco guarda `feita` como `0` ou `1`. A página quer `true` ou `false`. Onde a tradução acontece?',
        concepts: ['proj-desenho'],
        difficulty: 'iniciante',
        tags: ['projeto', 'camadas', 'api'],
        options: [
          'Na API, ao montar a resposta: a página recebe `feita: true` no JSON, e nunca sabe que o banco usa números',
          'Na página, que faz `feita === 1` em cada lugar que usa',
          'No banco: basta declarar a coluna como `BOOLEAN`',
          'Não precisa traduzir: `1` e `true` são a mesma coisa no `if`',
        ],
        correctIndex: 0,
        explanation:
          'A API é a camada que traduz — é o contrato dela com a página. Deixar para a página espalharia `=== 1` por todo canto, e um dia alguém escreveria `feita === true` e nada funcionaria. O SQLite aceita a palavra `BOOLEAN`, mas guarda número mesmo assim. E `1 == true` até funciona no `if`, mas `JSON.stringify` e `===` não perdoam.',
        hints: ['Quem conhece os dois lados — o jeito do banco e o jeito da página?'],
      },
    },
    {
      kind: 'summary',
      markdown: `
Três camadas, três papéis: a **página** mostra e pede; a **API** decide, protege e traduz; o **banco** guarda e garante. A verdade mora no banco, só a API o toca, e a página nunca confia em si mesma.

Os dados são três tabelas — \`usuarios\`, \`sessoes\` (o token vira pessoa), \`tarefas\` (com dono, e \`feita\` em 0/1 que a API traduz). A API é o contrato que a página vai usar; a tela é uma, com os estados de carregando, erro e vazio.

A ordem: banco, repositório, API, página, fechar — cada passo rodando. E a lista do que "pronto" quer dizer, escrita antes.

Na próxima aula, o primeiro passo de verdade: o banco e o repositório que a API vai chamar.
`.trim(),
    },
  ],
};

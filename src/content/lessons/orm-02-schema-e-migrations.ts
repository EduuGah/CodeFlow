import type { Lesson } from '../types';

export const lessonOrmSchemaEMigrations: Lesson = {
  id: 'lesson-orm-2',
  trackId: 'track-orm',
  title: 'Schema e Migrations de um ORM',
  language: 'javascript',
  objective:
    'Ler um schema de ORM (modelos, campos, relações) e explicar como uma migration nasce da diferença entre o schema novo e o anterior.',
  concepts: ['orm-schema-migrations'],
  status: 'published',
  estimatedMinutes: 24,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um ORM precisa saber que tabelas existem e como elas se relacionam. Essa descrição mora num arquivo próprio — o **schema** — escrito numa linguagem específica do ORM, não em SQL direto.

## O schema descreve os modelos

No Prisma (o ORM mais comum no ecossistema Node hoje, usado aqui como referência), um schema descreve cada tabela como um **modelo**:

~~~prisma
model Usuario {
  id     Int      @id @default(autoincrement())
  nome   String
  email  String   @unique
  posts  Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  titulo    String
  autor     Usuario @relation(fields: [autorId], references: [id])
  autorId   Int
}
~~~

Cada campo tem um tipo (\`Int\`, \`String\`) e pode ter atributos (\`@id\`, \`@unique\`, \`@default\`) — o equivalente direto de \`PRIMARY KEY\`, \`UNIQUE\` e \`DEFAULT\` na aula de modelagem SQL. \`posts Post[]\` e \`autor Usuario @relation(...)\` declaram a relação 1:N entre as duas tabelas — um usuário tem vários posts, um post pertence a um usuário — sem escrever o \`JOIN\` que a busca vai precisar; o ORM monta isso sozinho quando pedido.

## Migration: a diferença entre dois schemas

Quando o schema muda — um campo novo, uma tabela nova, uma relação nova — o ORM compara a versão nova com a anterior e **gera** a migration: o SQL (\`ALTER TABLE\`, \`CREATE TABLE\`) que leva o banco de um estado ao outro. É a mesma disciplina da aula de banco em produção — mudança de schema registrada e revisável, nunca um comando solto — só que agora a ferramenta escreve o SQL a partir da diferença, em vez de alguém escrevê-lo à mão.

~~~
schema anterior:  model Usuario { id, nome, email }
schema novo:       model Usuario { id, nome, email, criadoEm DateTime @default(now()) }
                          ↓ gera
migration:         ALTER TABLE Usuario ADD COLUMN criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP;
~~~

Isso não elimina a responsabilidade de revisar antes de aplicar em produção — uma migration gerada automaticamente ainda pode ter um efeito que exige backup antes, como remover uma coluna com dados. A ferramenta automatiza a **geração** do SQL; a decisão de quando e como aplicar continua sendo de quem está publicando.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Simulação: uma migration nasce da comparação entre dois schemas.
function camposNovos(schemaAntigo, schemaNovo) {
  return schemaNovo.filter((campo) => !schemaAntigo.includes(campo));
}

camposNovos(['id', 'nome', 'email'], ['id', 'nome', 'email', 'criadoEm']);
// ['criadoEm'] — é esse campo que vira um ALTER TABLE ADD COLUMN`,
      caption: 'A migration é gerada a partir do que mudou entre um schema e o outro — não escrita do zero.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-orm-2-o-que-e-schema',
        type: 'multiple-choice',
        prompt: 'O que um schema de ORM descreve?',
        concepts: ['orm-schema-migrations'],
        difficulty: 'iniciante',
        tags: ['orm', 'schema'],
        options: [
          'Os modelos (tabelas), os campos de cada um e as relações entre eles, numa linguagem própria do ORM',
          'O SQL exato que vai rodar em cada consulta',
          'As credenciais de acesso ao banco de produção',
          'Os testes automatizados do projeto',
        ],
        correctIndex: 0,
        explanation:
          'O schema é a fonte da verdade sobre a estrutura dos dados — tabelas, campos, tipos, relações — escrita numa sintaxe própria do ORM (não SQL). É a partir dele que o ORM gera tanto as migrations quanto os métodos de consulta tipados.',
        hints: ['Pense no que precisa existir antes de o ORM conseguir gerar qualquer SQL — de onde ele "sabe" quais tabelas e campos existem.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-orm-2-de-onde-vem-a-migration',
        type: 'multiple-choice',
        prompt: 'De onde uma ferramenta de ORM tira o SQL de uma migration nova?',
        concepts: ['orm-schema-migrations'],
        difficulty: 'intermediario',
        tags: ['orm', 'migration'],
        options: [
          'Da diferença entre o schema novo e o schema anterior — o que mudou vira o ALTER TABLE ou CREATE TABLE gerado',
          'De um arquivo de configuração separado que lista comandos SQL manualmente',
          'A ferramenta pergunta ao desenvolvedor, campo por campo, que SQL gerar',
          'Do histórico de commits do Git',
        ],
        correctIndex: 0,
        explanation:
          'A ferramenta compara a versão atual do schema com a anterior (guardada no histórico de migrations do projeto) e gera o SQL correspondente à diferença — um campo novo vira `ADD COLUMN`, uma tabela nova vira `CREATE TABLE`, e assim por diante.',
        hints: ['Pense em "migration" como o registro de uma mudança — mudança em relação a quê?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-orm-2-gerar-nao-elimina-revisao',
        type: 'multiple-choice',
        prompt: 'Uma migration foi gerada automaticamente pelo ORM a partir de uma mudança no schema que remove um campo. Isso significa que ela pode ser aplicada direto em produção, sem revisão?',
        concepts: ['orm-schema-migrations'],
        difficulty: 'intermediario',
        tags: ['orm', 'migration', 'producao'],
        options: [
          'Não: a migration pode remover uma coluna com dados reais, e isso continua exigindo backup e revisão antes de aplicar, mesmo tendo sido gerada automaticamente',
          'Sim: qualquer migration gerada pela ferramenta já é segura por padrão',
          'Sim, mas só se o schema tiver menos de 10 campos',
          'Não, porque ORMs nunca conseguem gerar migrations que removem colunas',
        ],
        correctIndex: 0,
        explanation:
          'A automação está na geração do SQL a partir da diferença de schema — não na avaliação do risco daquela mudança. Remover uma coluna com dados continua sendo uma operação que pede backup antes, exatamente como a aula de banco em produção descreveu, gerada à mão ou pela ferramenta.',
        hints: ['Pense no que muda, e no que NÃO muda, quando é a ferramenta (em vez de uma pessoa) que escreve o SQL da migration.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-orm-2-campos-que-mudaram',
        type: 'code',
        prompt: 'Escreva `camposNovos(schemaAntigo, schemaNovo)`: devolve um array com os nomes de campo que existem em `schemaNovo` mas não existiam em `schemaAntigo` — os que uma migration precisaria adicionar.',
        concepts: ['orm-schema-migrations'],
        difficulty: 'iniciante',
        tags: ['orm', 'migration'],
        initialCode: `function camposNovos(schemaAntigo, schemaNovo) {
  // Seu código aqui
}`,
        tests: [
          {
            description: 'Identifica o campo que foi adicionado',
            assertion: `const r = camposNovos(['id', 'nome'], ['id', 'nome', 'email']);
if (JSON.stringify(r) !== JSON.stringify(['email'])) throw new Error('esperava ["email"], veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Nenhum campo novo devolve array vazio',
            assertion: `const r = camposNovos(['id', 'nome'], ['id', 'nome']);
if (r.length !== 0) throw new Error('esperava array vazio, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Vários campos novos, todos identificados',
            assertion: `const r = camposNovos(['id'], ['id', 'nome', 'email']);
if (JSON.stringify(r) !== JSON.stringify(['nome', 'email'])) throw new Error('esperava ["nome","email"], veio ' + JSON.stringify(r));`,
          },
        ],
        solution: `function camposNovos(schemaAntigo, schemaNovo) {
  return schemaNovo.filter((campo) => !schemaAntigo.includes(campo));
}`,
        hints: ['`Array.prototype.filter`, mantendo só os campos de `schemaNovo` que `schemaAntigo.includes(...)` não encontra.'],
      },
    },
    {
      kind: 'summary',
      markdown: `
O schema descreve modelos, campos e relações numa linguagem própria do ORM — não SQL direto. Uma migration nasce da diferença entre o schema novo e o anterior, gerada pela ferramenta, mas revisada com a mesma disciplina de sempre: mudança arriscada pede backup, gerada automaticamente ou não.

Na última aula da trilha, os métodos mais comuns de consulta — e o SQL que cada um produz por baixo.
`.trim(),
    },
  ],
};

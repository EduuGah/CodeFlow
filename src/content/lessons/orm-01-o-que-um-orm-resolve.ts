import type { Lesson } from '../types';

export const lessonOrmOQueUmOrmResolve: Lesson = {
  id: 'lesson-orm-1',
  trackId: 'track-orm',
  title: 'O que um ORM Resolve',
  language: 'javascript',
  objective:
    'Explicar o que um ORM poupa (SQL repetitivo, linha virando objeto) e o que ele custa (uma camada a mais, que pode esconder demais o que roda de fato).',
  concepts: ['orm-mapeamento'],
  status: 'published',
  estimatedMinutes: 22,
  blocks: [
    {
      kind: 'prose',
      markdown: `
A trilha de SQL ensinou a escrever a consulta certa. Na maioria dos empregos de hoje, porém, o código do dia a dia não escreve \`SELECT * FROM usuarios WHERE id = ?\` direto — ele chama algo como \`usuario.findUnique({ where: { id } })\`. Entre o código e o banco mora um **ORM** (Object-Relational Mapper — mapeador objeto-relacional), e esta aula explica o que ele resolve antes das próximas mostrarem como ele funciona por dentro.

## O que "mapear" quer dizer

Um banco relacional guarda linhas e colunas; JavaScript pensa em objetos. Um ORM traduz de um lado para o outro automaticamente: uma linha da tabela \`usuarios\` vira um objeto \`{ id: 1, nome: 'Ana', email: 'ana@ex.com' }\`, e um objeto novo, criado no código, vira uma linha inserida. Sem essa tradução, cada função que fala com o banco reescreveria à mão o mesmo padrão — montar o SQL, rodar, transformar as linhas devolvidas em objetos — para cada tabela do sistema.

~~~js
// Sem ORM: o padrão se repete a cada tabela.
async function buscarUsuario(id) {
  const linhas = await banco.consultar('SELECT * FROM usuarios WHERE id = ?', [id]);
  return linhas[0] ?? null;
}

// Com ORM: o mapeamento já está pronto.
async function buscarUsuario(id) {
  return usuario.findUnique({ where: { id } });
}
~~~

## O preço: uma camada a mais

Um ORM não é grátis. Ele é uma camada entre o código e o banco, e camada demais entre você e o que de fato acontece tem um custo real: fica mais fácil escrever algo que parece inofensivo — buscar uma lista, e para cada item buscar algo relacionado — e sem perceber gerar centenas de consultas onde uma só bastaria (o problema de N+1, que a última aula desta trilha detalha). Um ORM bom **poupa repetição**; ele não substitui entender o que está acontecendo no banco por baixo. Por isso a trilha de SQL veio antes desta: sem saber como seria a consulta manual, não dá para perceber quando o ORM está gerando uma consulta ruim.

## Quando vale a pena

Para CRUD comum — criar, buscar, atualizar, apagar, com filtros simples — um ORM poupa bastante código repetitivo com pouco risco. Para uma consulta complexa (agregações pesadas, relatórios), muitas vezes SQL direto continua sendo mais claro e mais controlável do que forçar o ORM a produzir aquele SQL específico.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// A mesma operação, dois jeitos.
const semOrm = {
  buscar: (id) => \`SELECT * FROM produtos WHERE id = \${id}\`,
  criar: (p) => \`INSERT INTO produtos (nome, preco) VALUES ('\${p.nome}', \${p.preco})\`,
};

const comOrm = {
  buscar: (id) => produto.findUnique({ where: { id } }),
  criar: (p) => produto.create({ data: p }),
};`,
      caption: 'O ORM não faz uma operação diferente — ele poupa escrever (e reescrever) o SQL para a mesma operação de sempre.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-orm-1-o-que-orm-resolve',
        type: 'multiple-choice',
        prompt: 'Qual é o papel central de um ORM?',
        concepts: ['orm-mapeamento'],
        difficulty: 'iniciante',
        tags: ['orm'],
        options: [
          'Mapear linha de tabela para objeto e objeto para linha, poupando o SQL repetitivo do CRUD comum',
          'Tornar o banco de dados mais rápido automaticamente',
          'Substituir a necessidade de modelar tabelas e relacionamentos',
          'Rodar o banco de dados dentro do próprio código do servidor',
        ],
        correctIndex: 0,
        explanation:
          'Um ORM traduz entre o mundo de linhas e colunas do banco e o mundo de objetos do código — e com isso evita reescrever, para cada tabela, o mesmo padrão de montar SQL e transformar o resultado. Ele não muda a modelagem nem a velocidade do banco em si.',
        hints: ['Pense no nome: Object-Relational *Mapper*. O que ele está mapeando, de onde para onde?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-orm-1-por-que-sql-antes',
        type: 'multiple-choice',
        prompt: 'Por que faz sentido aprender SQL antes de aprender a usar um ORM, em vez do contrário?',
        concepts: ['orm-mapeamento'],
        difficulty: 'intermediario',
        tags: ['orm', 'sql'],
        options: [
          'Sem saber como seria a consulta manual, fica difícil perceber quando o ORM está gerando uma consulta ruim ou ineficiente por baixo',
          'Um ORM não funciona sem o SQL ser escrito antes, à mão, toda vez',
          'Não há relação entre os dois — a ordem é só convenção do curso',
          'Porque ORMs estão desaparecendo do mercado',
        ],
        correctIndex: 0,
        explanation:
          'O ORM esconde o SQL, não o elimina. Quem nunca escreveu a consulta manual não tem como julgar se o que o ORM está gerando por baixo é razoável — e é exatamente esse julgamento que evita problemas como consultas redundantes em produção.',
        hints: ['Pense no que significa "confiar" numa ferramenta sem entender o que ela faz por dentro.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-orm-1-quando-nao-usar',
        type: 'multiple-choice',
        prompt: 'Em qual situação usar SQL direto, em vez de forçar o ORM, tende a ser a escolha melhor?',
        concepts: ['orm-mapeamento'],
        difficulty: 'intermediario',
        tags: ['orm'],
        options: [
          'Numa consulta complexa de relatório, com agregações pesadas, onde forçar o ORM a produzir aquele SQL específico fica mais confuso do que escrevê-lo direto',
          'Ao buscar um único registro por id',
          'Ao criar um registro novo numa tabela simples',
          'Nunca — o ORM sempre deve substituir o SQL direto',
        ],
        correctIndex: 0,
        explanation:
          'Para CRUD comum, o ORM poupa repetição com pouco custo. Para consultas complexas — relatórios, agregações específicas — o ganho de usar o ORM diminui, e o SQL direto costuma ficar mais claro e mais fácil de ajustar.',
        hints: ['Pense em qual tipo de consulta o ORM foi feito para simplificar: a comum e repetitiva, ou a rara e específica?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-orm-1-linha-vira-objeto',
        type: 'predict-output',
        prompt: 'Esta função simula o que um ORM faz ao "mapear" uma linha de banco (um array de valores) para um objeto, usando os nomes das colunas. O que ela imprime?',
        concepts: ['orm-mapeamento'],
        difficulty: 'intermediario',
        tags: ['orm', 'mapeamento'],
        code: `function mapearLinha(colunas, valores) {
  const objeto = {};
  colunas.forEach((coluna, i) => {
    objeto[coluna] = valores[i];
  });
  return objeto;
}

const linha = mapearLinha(['id', 'nome'], [1, 'Ana']);
console.log(JSON.stringify(linha));`,
        expectedOutput: '{"id":1,"nome":"Ana"}',
        explanation:
          'A função associa cada nome de coluna ao valor da mesma posição no array — `id` com `1`, `nome` com `\'Ana\'` — produzindo o objeto `{ id: 1, nome: \'Ana\' }`. É exatamente esse tipo de tradução, feita automaticamente para cada linha, que um ORM faz por baixo.',
        hints: ['`colunas[0]` e `valores[0]` andam juntos; `colunas[1]` e `valores[1]`, também.'],
      },
    },
    {
      kind: 'summary',
      markdown: `
Um ORM mapeia linha de tabela para objeto e objeto para linha, poupando o SQL repetitivo do CRUD comum — mas é uma camada a mais, que pode esconder consultas ruins de quem não sabe o que está rodando por baixo. Ele vale mais para CRUD simples do que para relatórios complexos.

Na próxima aula, como um ORM descreve as tabelas e seus relacionamentos — o schema — e como ele gera migrations a partir dele.
`.trim(),
    },
  ],
};

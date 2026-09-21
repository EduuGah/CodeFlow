import type { Lesson } from '../types';

export const lessonGitPullRequestERevisao: Lesson = {
  id: 'lesson-git-3',
  trackId: 'track-git',
  title: 'Pull Request e Revisão',
  language: 'javascript',
  objective:
    'Entender o que um pull request propõe, por que uma segunda pessoa revisar pega o que quem escreveu não vê mais, e o que torna um PR fácil (ou impossível) de revisar.',
  concepts: ['git-pr'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Uma branch pronta não vai direto para o \`main\`. Ela passa por um **pull request** (PR): uma proposta formal de "incorporar isto aqui", com uma descrição do que muda e por quê, aberta para outra pessoa ler antes de qualquer coisa acontecer.

## Por que uma segunda pessoa lê antes

Quem escreveu o código acabou de passar horas olhando para ele — e é exatamente por isso que não é a pessoa certa para pegar os próprios erros. Depois de reler a mesma função dez vezes, o cérebro passa a ver o que **deveria** estar ali, não o que **está**. Uma segunda pessoa chega sem esse desgaste, e pega três coisas que quem escreveu não pega sozinho:

- **Bugs de lógica** que os testes não cobriram — porque quem escreveu os testes tinha o mesmo ponto cego que escreveu o código.
- **Decisões de desenho** que fazem sentido isoladas mas não encaixam com o resto do projeto.
- **Conhecimento compartilhado**: quem revisa aprende o que mudou, e na próxima vez que aquele código quebrar, mais de uma pessoa sabe por onde procurar.

Revisão não é sobre desconfiar de quem escreveu. É sobre reconhecer que ninguém enxerga os próprios pontos cegos sozinho — isso não é falha pessoal, é como a atenção humana funciona.

## O que faz um PR fácil de revisar

Um PR de 40 arquivos misturando três assuntos diferentes não é revisado — é **aprovado sem ler**, porque ninguém tem tempo de entender tudo aquilo de uma vez. É a mesma lição do commit atômico e da branch de assunto único, agora na escala do PR inteiro:

- **Pequeno e focado**: um assunto, poucos arquivos. Revisão de verdade cabe numa sessão de atenção.
- **Descrição que explica o porquê**: não "mudei X", mas "por que X precisava mudar" — o que o revisor não consegue adivinhar só olhando o diff.
- **Commits atômicos**: um PR com commits bem separados deixa o revisor seguir o raciocínio passo a passo, em vez de decifrar um único commit gigante.

## Responder à revisão

Um comentário pedindo mudança não é um veredito — é o começo de uma conversa. Discordar é normal e saudável: explique o porquê da sua escolha. O que não funciona é ignorar o comentário em silêncio, ou ficar na defensiva em vez de discutir o argumento. E do lado de quem revisa: um comentário que só diz "isso está errado" não ensina nada; um que explica o porquê e sugere um caminho, sim.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Um PR simulado como objeto: arquivos tocados e a descrição.
const pr = {
  titulo: 'Corrige cálculo de frete para CEP vazio',
  descricao:
    'Pedidos sem CEP caíam no frete padrão por engano. Este PR ' +
    'valida o campo antes de calcular.',
  arquivosTocados: ['frete.js', 'frete.test.js'],
};

function ehFocado(pr) {
  return pr.arquivosTocados.length <= 5;
}

function temContexto(pr) {
  return pr.descricao.length > 20;
}`,
      caption:
        'Um PR pequeno e com descrição que explica o porquê — os dois sinais mais simples de que ele vai ser revisado de verdade, e não só aprovado por cansaço.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-3-por-que-revisar',
        type: 'multiple-choice',
        prompt: 'Por que uma segunda pessoa revisar o código pega erros que quem escreveu não pega sozinho?',
        concepts: ['git-pr'],
        difficulty: 'iniciante',
        tags: ['git', 'pr', 'revisao'],
        options: [
          'Quem escreveu já olhou tanto para o próprio código que passa a ver o que "deveria" estar ali, não o que de fato está',
          'Quem escreveu é sempre pior programador que quem revisa',
          'A revisão existe só para cumprir uma regra da empresa',
          'Testes automatizados não são confiáveis, então precisam de revisão humana no lugar',
        ],
        correctIndex: 0,
        explanation:
          'É um limite da atenção humana, não uma questão de habilidade: depois de horas na mesma função, o cérebro preenche os buracos com o que espera ver. Uma segunda pessoa, sem esse desgaste, enxerga o que realmente está escrito. Revisão e teste automatizado não competem — pegam tipos diferentes de erro.',
        hints: ['Pense em reler um texto que você mesmo escreveu há uma hora, contra reler um de outra pessoa.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-3-pr-revisavel',
        type: 'multiple-choice',
        prompt: 'Qual destes PRs tem mais chance de receber uma revisão de verdade, em vez de ser aprovado sem ler?',
        concepts: ['git-pr'],
        difficulty: 'iniciante',
        tags: ['git', 'pr'],
        options: [
          'Um PR com 3 arquivos, focado em corrigir o cálculo de frete, com descrição explicando o motivo',
          'Um PR com 45 arquivos, misturando o conserto do frete, uma atualização de dependências e uma reorganização de pastas',
          'Um PR sem descrição, só o título "ajustes"',
          'Um PR com um commit só chamado "wip final v2"',
        ],
        correctIndex: 0,
        explanation:
          'Pequeno, focado e com descrição do porquê é o que cabe numa sessão de atenção de quem revisa. Um PR gigante misturando assuntos, sem descrição, tende a ser aprovado por cansaço — ninguém consegue revisar de verdade 45 arquivos de três assuntos diferentes de uma vez.',
        hints: ['A mesma pergunta do commit atômico e da branch de assunto: quantas razões de mudar cabem aqui?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-3-tamanho-do-pr',
        type: 'code',
        prompt:
          'Escreva `ehFacilDeRevisar(pr)`: recebe um PR simulado (`{ arquivosTocados, descricao }`) e devolve `true` só quando ele toca **até 8 arquivos** E tem uma descrição com **mais de 20 caracteres**.',
        concepts: ['git-pr'],
        difficulty: 'iniciante',
        tags: ['git', 'pr'],
        initialCode: `function ehFacilDeRevisar(pr) {
  return true;
}`,
        tests: [
          {
            description: 'PR pequeno com boa descrição é fácil de revisar',
            assertion: `const r = ehFacilDeRevisar({ arquivosTocados: ['frete.js', 'frete.test.js'], descricao: 'Corrige o cálculo de frete para pedidos sem CEP preenchido.' });
if (r !== true) throw new Error('esperava true para um PR pequeno e com contexto');`,
          },
          {
            description: 'PR com muitos arquivos não é fácil de revisar, mesmo com boa descrição',
            assertion: `const r = ehFacilDeRevisar({ arquivosTocados: Array.from({ length: 20 }, (_, i) => 'arquivo' + i + '.js'), descricao: 'Reorganização grande do projeto inteiro, várias mudanças.' });
if (r !== false) throw new Error('esperava false para um PR com 20 arquivos');`,
          },
          {
            description: 'PR pequeno sem descrição de verdade não é fácil de revisar',
            assertion: `const r = ehFacilDeRevisar({ arquivosTocados: ['a.js'], descricao: 'ajustes' });
if (r !== false) throw new Error('esperava false para uma descrição curta demais');`,
          },
        ],
        solution: `function ehFacilDeRevisar(pr) {
  return pr.arquivosTocados.length <= 8 && pr.descricao.length > 20;
}`,
        hints: [
          'Duas condições precisam ser verdadeiras ao mesmo tempo: use `&&`.',
          '`pr.arquivosTocados.length <= 8` e `pr.descricao.length > 20`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-3-ordem-revisao',
        type: 'order-steps',
        prompt: 'Coloque na ordem os passos de um pull request, da branch pronta até o main.',
        concepts: ['git-pr'],
        difficulty: 'iniciante',
        tags: ['git', 'pr', 'processo'],
        steps: [
          { id: 'abrir', text: 'Abrir o PR com uma descrição que explica por que a mudança é necessária', ordem: 1 },
          { id: 'revisar', text: 'Pedir revisão de outra pessoa', ordem: 2 },
          { id: 'comentarios', text: 'Ler os comentários e responder — ajustando o código ou explicando a decisão', ordem: 3 },
          { id: 'aprovar', text: 'Receber a aprovação depois que os comentários forem resolvidos', ordem: 4 },
          { id: 'incorporar', text: 'Incorporar a branch ao main', ordem: 5 },
        ],
        explanation:
          'A aprovação vem depois de resolver os comentários, não antes — um PR "aprovado com ressalvas não resolvidas" é revisão só de fachada. E a descrição precisa existir antes de pedir revisão: sem ela, quem revisa começa sem saber o porquê.',
        hints: [
          'A descrição existe para quem revisa. Ela precisa vir antes ou depois do pedido de revisão?',
          'Aprovar antes de resolver os comentários apagaria o sentido de tê-los feito.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-3-discordar',
        type: 'multiple-choice',
        prompt: 'Um revisor pede uma mudança que você acha que vai piorar o código. O que fazer?',
        concepts: ['git-pr'],
        difficulty: 'intermediario',
        tags: ['git', 'pr', 'revisao'],
        options: [
          'Responder ao comentário explicando por que você escolheu esse caminho, e discutir até chegar a um acordo',
          'Fazer a mudança pedida mesmo discordando, sem dizer nada, para não criar atrito',
          'Ignorar o comentário e aprovar o próprio PR sozinho',
          'Fechar o PR e nunca mais mexer nesse trecho de código',
        ],
        correctIndex: 0,
        explanation:
          'Um comentário de revisão é o começo de uma conversa, não uma ordem nem uma agressão. Explicar o raciocínio às vezes muda a opinião do revisor, às vezes muda a sua — e as duas coisas são o ponto da revisão. Concordar em silêncio contra a própria avaliação técnica desperdiça exatamente o que a revisão deveria pegar.',
        hints: ['Revisão é uma conversa entre duas pessoas técnicas, não um veredito de uma só direção.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-3-contando-arquivos',
        type: 'find-bug',
        prompt:
          'Esta função deveria contar quantos arquivos de teste (que terminam com `.test.js`) um PR toca, mas quebra ao rodar. Aponte a linha que precisa mudar.',
        concepts: ['git-pr'],
        difficulty: 'intermediario',
        tags: ['git', 'pr', 'bug'],
        code: `function contarArquivosDeTeste(pr) {
  return pr.arquivos.filter((a) => a.endsWith('.test.js')).length;
}

const pr = { arquivosTocados: ['frete.js', 'frete.test.js'] };
console.log(contarArquivosDeTeste(pr));`,
        buggyLine: 2,
        fix: '  return pr.arquivosTocados.filter((a) => a.endsWith(\'.test.js\')).length;',
        symptomLine: 6,
        symptomFeedback:
          'Aqui é onde o erro aparece no console — mas a causa é o nome do campo lido dentro da função, não a chamada.',
        explanation:
          'O objeto `pr` guarda a lista em `arquivosTocados`, não em `arquivos`. `pr.arquivos` vale `undefined`, e chamar `.filter` em `undefined` lança "Cannot read properties of undefined". O nome certo do campo aparece tanto na criação do objeto `pr` quanto seria o esperado dentro da função — só a função usa o nome errado.',
        hints: [
          'Confira o nome exato do campo no objeto `pr`, na linha onde ele é criado.',
          'A função lê um campo que não existe nesse objeto — ela precisa ler o mesmo nome que foi usado para criar o `pr`.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Um PR propõe incorporar uma branch, com uma descrição que explica **por quê**. A revisão de uma segunda pessoa pega o que quem escreveu não vê mais — não por falta de habilidade, mas porque a atenção humana passa a ver o que espera, não o que está escrito.

PR pequeno, focado, com descrição de contexto e commits atômicos é revisável; PR de 40 arquivos e três assuntos é aprovado por cansaço. Um comentário de revisão é o começo de uma conversa, não um veredito.

Na próxima aula, o que acontece quando duas branches mudaram a mesma coisa de jeitos diferentes: o **conflito** — e por que ele não é motivo de pânico.
`.trim(),
    },
  ],
};

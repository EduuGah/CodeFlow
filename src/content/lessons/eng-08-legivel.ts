import type { Lesson } from '../types';

export const lessonEngLegivel: Lesson = {
  id: 'lesson-eng-8',
  trackId: 'track-engenharia',
  title: 'O Projeto que Outra Pessoa Lê',
  language: 'node',
  objective:
    'Deixar o projeto no estado em que outra pessoa o entende sem você por perto: um README que responde as três perguntas, comentários que dizem o porquê, estilo decidido por ferramenta, e revisão de código como conversa.',
  concepts: ['eng-legivel'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Tudo nesta trilha foi para uma pessoa: **quem abre o projeto sem você por perto**. Um colega novo, quem vai manter o sistema depois, ou você mesmo daqui a seis meses — que é o caso mais comum, e o que mais se esquece. Esta última aula é sobre o que essa pessoa encontra ao abrir a pasta.

## O README responde três perguntas

Antes de qualquer arquivo de código, quem chega lê o \`README.md\`. Ele existe para responder, nesta ordem:

1. **O que é isto?** Um parágrafo. Para quem, e o que faz.
2. **Como rodar?** Os comandos, na ordem, e o que precisa antes (\`.env.example\`, versão do Node).
3. **Como testar?** O comando, e o que os testes cobrem.

Depois, se houver: a estrutura das pastas em meia tela, e as decisões que valem saber ("os preços são inteiros em centavos"; "as sessões vivem em memória por enquanto"). Nada de manual de vinte páginas: o README que ninguém lê inteiro é o que ninguém atualiza.

E é essa a regra dele: **um README desatualizado é pior que nenhum**. Quem segue "rode \`npm start\`" e recebe um erro para de confiar em tudo o mais. Cada mudança no jeito de rodar é uma mudança no README, no mesmo commit.

## Comentários dizem por quê

~~~js
// soma o preço vezes a quantidade
total = total + item.preco * item.quantidade;
~~~

O comentário repete o código, e quem lê código já leu. Pior: no dia em que a linha mudar e o comentário não, ele passa a **mentir** — e quem lê acredita no comentário. Bons nomes fazem o trabalho desse tipo de comentário sem risco de envelhecer.

O comentário que vale é o que o código **não consegue dizer**: o porquê.

~~~js
// Arredondamos antes de gravar: o banco guarda centavos como inteiro,
// e 0.1 + 0.2 daria 0.30000000000000004 no relatório.
return Math.round(total * 100) / 100;
~~~

Um leitor entende a decisão, e não a "corrige" achando que o arredondamento é um capricho. Outros porquês que merecem comentário: o motivo de um caso estranho, a referência de onde uma regra veio, o aviso de que algo parece errado mas é de propósito.

Código comentado (\`// const antigo = …\`) não é comentário: é lixo com sintaxe. Apague. O Git guarda o histórico — é para isso que existe.

## Estilo se decide por ferramenta

Aspas simples ou duplas, ponto e vírgula, quatro espaços ou dois: cada uma dessas discussões custa uma reunião e não muda o programa. A resposta é **um formatador** (Prettier, ou o do editor) com uma configuração no repositório, rodando ao salvar. Ninguém mais decide, ninguém mais discute, e todo arquivo do projeto parece escrito pela mesma mão.

Um **linter** (ESLint) vai um passo além: aponta o que provavelmente é erro — variável não usada, \`==\`, \`await\` esquecido. Os dois entram no projeto no primeiro dia, e no CI.

## Revisão de código é uma conversa

Quando outra pessoa lê a sua mudança antes de ela entrar, o projeto ganha um segundo par de olhos — e a pessoa que revisa aprende o que mudou. Funciona quando os dois lados tratam como conversa:

- **Quem escreve** explica, na descrição, o **porquê** da mudança e o que ficou de fora. Mudanças pequenas: uma revisão de 800 linhas não é revisão, é aprovação por cansaço.
- **Quem revisa** pergunta e sugere, com o motivo: "se a validação fosse separada, o formulário poderia reutilizá-la — o que acha?" diz mais que "separa isso". Separa o que **precisa** mudar do que é preferência ("nit: eu chamaria de \`itens\`").
- Nenhum dos dois leva para o pessoal. A revisão é sobre o código; o código não é a pessoa.

## Apagar também é organizar

Função que ninguém chama, arquivo que ninguém importa, rota que ninguém acessa: cada um é uma linha que o próximo leitor vai ler, entender e descobrir que não servia. Apague. Se um dia for necessário, está no Git.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// ANTES: comentários que repetem, e código morto guardado "por via das dúvidas".
// Calcula o total
function calcularTotal(itens) {
  // começa em zero
  let total = 0;
  // percorre os itens
  for (const item of itens) total = total + item.preco * item.quantidade; // soma
  // return total;
  return Math.round(total * 100) / 100;
}

// DEPOIS: os nomes dizem o que; o único comentário diz por quê.
function calcularTotal(itens) {
  let total = 0;
  for (const item of itens) total = total + item.preco * item.quantidade;
  // Arredondamos aqui porque o banco guarda centavos como inteiro,
  // e sem isto 0.1 + 0.2 chega ao relatório como 0.30000000000000004.
  return Math.round(total * 100) / 100;
}`,
      caption:
        'Cinco comentários viraram um — o único que contava algo que o código não conta. Os outros envelheceriam junto com a próxima mudança.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-8-porque',
        type: 'multiple-choice',
        prompt: 'Qual destes comentários vale a pena manter no código?',
        concepts: ['eng-legivel'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'comentarios'],
        options: [
          '`// O prazo é 48 h e não 24 porque o correio só coleta em dias úteis; ver o contrato de 2024`',
          '`// incrementa o contador` acima de `contador = contador + 1`',
          '`// função que calcula o total` acima de `function calcularTotal(itens)`',
          '`// const totalAntigo = somar(itens);` — a versão anterior, caso precise voltar',
        ],
        correctIndex: 0,
        explanation:
          'O primeiro conta o **porquê** de um número que parece errado — sem ele, alguém "corrige" o 48 para 24 no mês que vem. Os dois seguintes repetem o que o código já diz, e vão mentir na primeira mudança. O último é código morto: o Git guarda a versão anterior; o arquivo não precisa.',
        hints: ['Qual comentário diz algo que você **não** descobriria lendo o código?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-8-limpar',
        type: 'refactor',
        prompt:
          'Limpe o arquivo: apague os comentários que repetem o código, o código comentado e a função que ninguém usa. Fica só o comentário que diz um porquê. O comportamento de `calcularTotal` não muda.',
        concepts: ['eng-legivel'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'comentarios', 'refatorar'],
        initialCode: `// Calcula o total
function calcularTotal(itens) {
  // começa em zero
  let total = 0;
  // percorre os itens
  for (const item of itens) {
    // soma o preço vezes a quantidade
    total = total + item.preco * item.quantidade;
  }
  // Arredondamos antes de devolver: o banco guarda centavos como inteiro,
  // e sem isto 0.1 + 0.2 chegaria ao relatório como 0.30000000000000004.
  return Math.round(total * 100) / 100;
}

// function calcularTotalAntigo(itens) {
//   return itens.reduce((t, i) => t + i.preco, 0);
// }

// helper que sobrou de um teste
function dobrar(x) {
  return x * 2;
}`,
        tests: [
          {
            description: 'calcularTotal soma preço vezes quantidade: 2 x 3 + 0.5 x 1 = 6.5',
            assertion: `const r = calcularTotal([{ preco: 2, quantidade: 3 }, { preco: 0.5, quantidade: 1 }]);
if (r !== 6.5) throw new Error('esperava 6.5, veio ' + r);`,
          },
          {
            description: 'O arredondamento continua: 0.1 + 0.2 sai como 0.3',
            assertion: `const r = calcularTotal([{ preco: 0.1, quantidade: 1 }, { preco: 0.2, quantidade: 1 }]);
if (r !== 0.3) throw new Error('esperava 0.3, veio ' + r + ' — o arredondamento precisa continuar');`,
          },
        ],
        constraints: [
          { description: 'Nenhum comentário que repete o código: "começa em zero", "percorre", "soma o preço", "Calcula o total"', forbidden: '// começa em zero' },
          { description: 'Nem "percorre os itens"', forbidden: '// percorre' },
          { description: 'Nem "soma o preço"', forbidden: '// soma o preço' },
          { description: 'Nem "Calcula o total" — o nome da função já diz', forbidden: '// Calcula o total' },
          { description: 'O código comentado some: o Git guarda a versão antiga', forbidden: 'calcularTotalAntigo' },
          { description: 'A função que ninguém usa some', forbidden: 'function dobrar' },
          { description: 'O comentário que diz o porquê do arredondamento fica', required: 'o banco guarda centavos' },
        ],
        explanation:
          'O que sobrou é o que o próximo leitor precisa: a função, e um comentário que explica uma decisão que parece estranha. Os comentários que repetiam o código só iriam envelhecer; o código morto e a função sem uso eram linhas para ler, entender e descartar. Apagar é uma das formas de organizar.',
        solution: `function calcularTotal(itens) {
  let total = 0;
  for (const item of itens) {
    total = total + item.preco * item.quantidade;
  }
  // Arredondamos antes de devolver: o banco guarda centavos como inteiro,
  // e sem isto 0.1 + 0.2 chegaria ao relatório como 0.30000000000000004.
  return Math.round(total * 100) / 100;
}`,
        hints: [
          'Para cada comentário, pergunte: ele diz algo que o código não diz? Só um deles diz.',
          'Código comentado e função sem uso saem inteiros — o Git guarda o histórico.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-8-mentira',
        type: 'predict-output',
        prompt: 'O que este programa imprime? Leia o comentário, e depois o código.',
        concepts: ['eng-legivel'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'comentarios'],
        code: `// devolve o preço com 10% de desconto
function precoComDesconto(preco) {
  return preco * 0.85;
}

console.log(precoComDesconto(100));`,
        expectedOutput: '85',
        explanation:
          'O código é a verdade; o comentário ficou para trás numa promoção que mudou o desconto para 15%. Quem confiou no comentário calculou 90 e errou. É o risco de todo comentário que descreve o **quê**: ele não roda, então ninguém percebe quando mente. Uma constante `DESCONTO = 0.15` diria a verdade sem comentário nenhum.',
        hints: ['O comentário diz uma coisa e o número no código diz outra. Qual dos dois o programa executa?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-8-readme',
        type: 'order-steps',
        prompt: 'Coloque na ordem as seções de um README, do que quem chega precisa primeiro ao que precisa por último.',
        concepts: ['eng-legivel'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'readme'],
        steps: [
          { id: 'oque', text: 'O que é: um parágrafo — para quem, e o que faz', ordem: 1 },
          { id: 'rodar', text: 'Como rodar: o que precisa antes (Node, `.env.example`) e os comandos, na ordem', ordem: 2 },
          { id: 'testar', text: 'Como testar: o comando, e o que os testes cobrem', ordem: 3 },
          { id: 'estrutura', text: 'Estrutura: as pastas em meia tela, cada uma com uma linha', ordem: 4 },
          { id: 'decisoes', text: 'Decisões que valem saber: o que parece estranho e é de propósito', ordem: 5 },
        ],
        explanation:
          'A ordem é a das perguntas de quem chega: primeiro saber se é o projeto certo, depois vê-lo rodando, depois conferir que está funcionando — e só então entender por dentro. Quem só quer rodar para nas três primeiras; quem vai mexer lê até o fim.',
        hints: [
          'A primeira pergunta de quem abre um repositório é "o que é isto?".',
          'Entender a estrutura só interessa a quem já viu o projeto rodar.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-8-revisao',
        type: 'multiple-choice',
        prompt:
          'Você está revisando a mudança de um colega, e uma função valida e grava o pedido no mesmo lugar. Qual comentário de revisão ajuda mais?',
        concepts: ['eng-legivel'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'revisao'],
        options: [
          '"Esta função valida e grava; se a validação fosse separada, o formulário poderia reutilizá-la sem gravar. O que acha?"',
          '"Errado. Separa isso."',
          '"Eu faria diferente."',
          '"Ok." — o código funciona, e não é o seu',
        ],
        correctIndex: 0,
        explanation:
          'O primeiro diz **o que** viu, **por que** importa (reutilização) e abre a conversa — o colega pode ter um motivo, ou concordar em dez segundos. "Errado" não explica; "eu faria diferente" não diz como nem por quê; e aprovar sem ler desperdiça o único momento em que um segundo par de olhos vê a mudança.',
        hints: ['Qual comentário permite ao colega entender o motivo — e discordar, se tiver um motivo melhor?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-8-comentario-aberto',
        type: 'find-bug',
        prompt:
          'O arquivo nem carrega: "SyntaxError: Invalid or unexpected token" (ou "Unterminated comment"). Aponte a linha que precisa mudar.',
        concepts: ['eng-legivel'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'comentarios', 'bug'],
        code: `function calcularTotal(itens) {
  let total = 0; /* versão antiga: for (const item of itens) total += item.preco;
  for (const item of itens) {
    total = total + item.preco * item.quantidade;
  }
  return Math.round(total * 100) / 100;
}

console.log(calcularTotal([{ preco: 2, quantidade: 3 }]));`,
        buggyLine: 2,
        fix: '  let total = 0;',
        explanation:
          'O `/*` abriu um comentário que nunca fechou, e o resto do arquivo inteiro virou comentário — inclusive o `}` da função. A causa de fundo é a "versão antiga" guardada no código: ela não servia para nada e ainda quebrou o arquivo. Código velho mora no Git, não em comentários.',
        hints: [
          'Um comentário de bloco tem começo e fim. Ache o começo e procure o fim.',
          'O que aquela versão antiga está fazendo no arquivo? Quem precisar dela encontra no histórico.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Tudo é para **quem abre o projeto sem você por perto** — inclusive você daqui a seis meses. O README responde, nesta ordem, **o que é, como rodar, como testar**; e um README desatualizado é pior que nenhum.

Comentários dizem **por quê**, nunca o quê — o quê os nomes já dizem, e o comentário que repete envelhece e mente. Código comentado e função sem uso se apagam: o Git lembra.

Estilo se decide por ferramenta (formatador e linter), não em reunião. Revisão de código é conversa: o autor explica o porquê, quem revisa pergunta e sugere com motivo, ninguém leva para o pessoal.

**A trilha acaba aqui.** O que você aprendeu não muda o que o programa faz — muda quanto custa a próxima mudança. É a diferença entre código que roda e projeto que se mantém.
`.trim(),
    },
  ],
};

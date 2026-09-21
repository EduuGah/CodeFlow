import type { Lesson } from '../types';

export const lessonGitBranchPorAssunto: Lesson = {
  id: 'lesson-git-2',
  trackId: 'track-git',
  title: 'Uma Branch por Assunto',
  language: 'javascript',
  objective:
    'Entender por que isolar um trabalho em andamento numa branch, escolher um nome que diz o assunto, e reconhecer quando uma branch já devia ter morrido.',
  concepts: ['git-branch'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Todo commit precisa morar em algum lugar. Enquanto um trabalho ainda não está pronto para a linha principal — o \`main\` — ele mora numa **branch**: uma linha de commits própria, separada, que pode virar \`main\` mais tarde ou ser descartada sem afetar ninguém.

## Por que não commitar direto no main

Sem branch, todo trabalho em andamento fica misturado com o que já está pronto. Duas pessoas mexendo no \`main\` ao mesmo tempo pisam uma na outra a cada commit; um trabalho pela metade que quebra alguma coisa quebra para todo mundo que atualizar. A branch resolve isso separando **o que está pronto** (o \`main\`) de **o que está em andamento** (a branch): você experimenta, comita passos intermediários, até erra — e nada disso chega a quem só quer o que já funciona.

## Uma branch, um assunto

A mesma regra do commit atômico vale aqui, num nível acima: **uma branch, uma razão para existir**. Uma branch que conserta o frete e, no caminho, "aproveita e" reorganiza o CSS inteiro virou duas branches disfarçadas de uma — e quem for revisar não consegue separar as duas ideias.

- \`conserta-frete-cep-vazio\` — um assunto, dá para revisar e incorporar sozinho.
- \`ajustes\` ou \`nova-branch\` — não diz nada; daqui a uma semana, nem quem criou lembra o que tem lá dentro.

## Nasce da branch atualizada, vive pouco

Uma branch nasce a partir do estado atual do \`main\` — herda tudo que já existe até ali. Se o \`main\` andar muito enquanto a branch está aberta, as duas divergem, e quanto mais divergem, mais difícil (e mais arriscado) é juntar de volta. Por isso branches de vida curta — abertas, trabalhadas, incorporadas em dias, não meses — são a prática mais segura: menos tempo para divergir, menos coisa para revisar de uma vez, menos chance de conflito.

Uma branch que vive meses parada, "para terminar depois", geralmente significa uma das duas coisas: o trabalho é grande demais para uma branch só (e devia virar várias, cada uma com seu assunto) ou não é urgente (e não devia ter sido começado ainda).

## O nome diz o assunto

O nome de uma branch é a primeira coisa que outra pessoa vê antes mesmo de abrir o que tem dentro. Convenções comuns usam um prefixo do tipo de trabalho — \`feature/\`, \`fix/\`, \`chore/\` — seguido do assunto, em palavras separadas por hífen: \`fix/frete-cep-vazio\`, \`feature/exportar-relatorio-pdf\`. O prefixo não é obrigatório em todo projeto, mas o assunto, sempre.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Um repositório simulado: cada branch é uma lista de commits, e todas
// nasceram do main em algum ponto — aqui, representado como o índice
// de onde a branch se separou.
const repo = {
  main: ['inicial', 'adiciona login', 'adiciona checkout'],
  branches: {
    'fix/frete-cep-vazio': { nasceuDe: 2, commits: ['valida CEP antes de calcular'] },
  },
};

function commitsDaBranch(repo, nome) {
  if (nome === 'main') return repo.main;
  const branch = repo.branches[nome];
  return [...repo.main.slice(0, branch.nasceuDe), ...branch.commits];
}`,
      caption:
        'A branch enxerga tudo que existia no main até o ponto em que nasceu, mais os commits próprios dela — o main não vê os commits da branch até ela ser incorporada.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-2-por-que-isolar',
        type: 'multiple-choice',
        prompt: 'Qual é a razão principal para trabalhar numa branch, em vez de commitar direto no `main`?',
        concepts: ['git-branch'],
        difficulty: 'iniciante',
        tags: ['git', 'branch'],
        options: [
          'Separar o que está pronto (main) do que está em andamento — um trabalho incompleto não afeta quem só quer o que já funciona',
          'Branches deixam o código mais rápido de rodar',
          'É obrigatório: o Git não deixa commitar direto no main',
          'Só serve para times grandes; sozinho não faz diferença',
        ],
        correctIndex: 0,
        explanation:
          'A branch existe para isolar trabalho em andamento do que já está pronto. Não é sobre performance nem uma trava técnica do Git — é uma prática que evita que um trabalho pela metade, ou um experimento que deu errado, chegue a quem depende do `main`.',
        hints: ['Pense no que aconteceria se todo mundo commitasse direto no main, inclusive pela metade de um trabalho.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-2-nome-da-branch',
        type: 'multiple-choice',
        prompt: 'Qual destes nomes de branch diz o assunto do trabalho de forma mais clara?',
        concepts: ['git-branch'],
        difficulty: 'iniciante',
        tags: ['git', 'branch'],
        options: [
          'fix/frete-cep-vazio',
          'ajustes',
          'branch2',
          'joao-trabalhando',
        ],
        correctIndex: 0,
        explanation:
          '"fix/frete-cep-vazio" diz o tipo de trabalho e o assunto exato. Os outros três não dizem nada sobre o que está sendo feito — "ajustes" e "branch2" ficam indistinguíveis de qualquer outra branch parecida, e "joao-trabalhando" descreve quem, não o quê.',
        hints: ['O nome precisa sobreviver à pergunta: "o que tem nessa branch?", sem abrir para olhar.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-2-vida-curta',
        type: 'predict-output',
        prompt:
          'Uma branch nasceu do `main` no commit 1 (índice 1). Depois disso, o `main` recebeu mais três commits, e a branch recebeu dois próprios. O que este programa imprime — quantos commits o `main` tem "a mais" que a branch não viu quando nasceu?',
        concepts: ['git-branch'],
        difficulty: 'intermediario',
        tags: ['git', 'branch'],
        code: `const main = ['inicial', 'login', 'checkout', 'frete', 'cupom'];
const nasceuDe = 1;
const commitsQueAMainGanhouDepois = main.length - 1 - nasceuDe;

console.log(commitsQueAMainGanhouDepois);`,
        expectedOutput: '3',
        explanation:
          'A branch nasceu vendo só até o índice 1 (`inicial`, `login`). Depois disso o `main` ganhou mais três commits (`checkout`, `frete`, `cupom`) que a branch não tem. Quanto mais esse número cresce enquanto a branch continua aberta, mais ela diverge do `main` — e mais arriscado fica juntar de volta.',
        hints: ['`main.length - 1` é o índice do último commit do main. Subtraia de onde a branch nasceu.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-2-criar-branch',
        type: 'code',
        prompt:
          'Escreva `criarBranch(repo, nome)`: recebe o repositório simulado (com `repo.main`, um array de commits, e `repo.branches`, um objeto) e acrescenta uma branch nova em `repo.branches[nome]`, no formato `{ nasceuDe: <índice do último commit do main>, commits: [] }`. Devolva o próprio `repo`.',
        concepts: ['git-branch'],
        difficulty: 'iniciante',
        tags: ['git', 'branch'],
        initialCode: `function criarBranch(repo, nome) {
  return repo;
}`,
        tests: [
          {
            description: 'A branch nova aparece em repo.branches',
            assertion: `const repo = { main: ['inicial', 'login'], branches: {} };
const r = criarBranch(repo, 'fix/algo');
if (!r.branches['fix/algo']) throw new Error('esperava repo.branches["fix/algo"] definido');`,
          },
          {
            description: 'nasceuDe aponta para o último commit do main no momento da criação',
            assertion: `const repo = { main: ['inicial', 'login', 'checkout'], branches: {} };
const r = criarBranch(repo, 'feature/x');
if (r.branches['feature/x'].nasceuDe !== 2) throw new Error('esperava nasceuDe 2 (índice de "checkout"), veio ' + JSON.stringify(r.branches['feature/x'].nasceuDe));`,
          },
          {
            description: 'A branch nova começa sem nenhum commit próprio',
            assertion: `const repo = { main: ['inicial'], branches: {} };
const r = criarBranch(repo, 'fix/y');
if (r.branches['fix/y'].commits.length !== 0) throw new Error('esperava commits vazio, veio ' + JSON.stringify(r.branches['fix/y'].commits));`,
          },
        ],
        solution: `function criarBranch(repo, nome) {
  repo.branches[nome] = { nasceuDe: repo.main.length - 1, commits: [] };
  return repo;
}`,
        hints: [
          'O índice do último commit do main é `repo.main.length - 1`.',
          'Monte o objeto `{ nasceuDe, commits: [] }` e atribua a `repo.branches[nome]` antes de devolver `repo`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-2-ordem-branch',
        type: 'order-steps',
        prompt: 'Coloque na ordem os passos para começar um trabalho novo numa branch.',
        concepts: ['git-branch'],
        difficulty: 'iniciante',
        tags: ['git', 'branch', 'processo'],
        steps: [
          { id: 'atualizar', text: 'Atualizar a cópia local do main antes de começar', ordem: 1 },
          { id: 'criar', text: 'Criar a branch a partir do main atualizado, com um nome que diz o assunto', ordem: 2 },
          { id: 'trabalhar', text: 'Trabalhar e registrar commits atômicos na branch', ordem: 3 },
          { id: 'incorporar', text: 'Incorporar a branch de volta ao main quando o assunto estiver pronto e revisado', ordem: 4 },
          { id: 'apagar', text: 'Apagar a branch — o assunto dela já está no main, ela não serve mais', ordem: 5 },
        ],
        explanation:
          'Atualizar antes de criar evita que a branch já nasça divergente do main. Apagar depois de incorporar não é limpeza opcional: uma branch morta que continua existindo confunde quem procura o trabalho em andamento de verdade.',
        hints: [
          'A branch precisa herdar o main mais recente — isso acontece antes ou depois de criá-la?',
          'O último passo é sobre o que fazer com uma branch cujo assunto já terminou.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-2-nasceu-de-errado',
        type: 'find-bug',
        prompt:
          'Esta função deveria dizer quantos commits do main a branch ainda não incorporou, mas quebra ao rodar. Aponte a linha que precisa mudar.',
        concepts: ['git-branch'],
        difficulty: 'intermediario',
        tags: ['git', 'branch', 'bug'],
        code: `function commitsNaoIncorporados(repo, nomeDaBranch) {
  const branch = repo.branches[nomeDaBranch];
  return repo.main.length - 1 - branch.nasceuDe;
}

const repo = { main: ['inicial', 'login'], branches: {} };
console.log(commitsNaoIncorporados(repo, 'fix/algo'));`,
        buggyLine: 7,
        fix: "console.log(commitsNaoIncorporados({ main: ['inicial', 'login'], branches: { 'fix/algo': { nasceuDe: 0, commits: [] } } }, 'fix/algo'));",
        explanation:
          'O `repo` de teste nunca criou a branch `fix/algo` — `repo.branches` está vazio. Dentro da função, `repo.branches[nomeDaBranch]` vale `undefined`, e a linha seguinte tenta ler `branch.nasceuDe`, ou seja, `undefined.nasceuDe` — e ler uma propriedade de `undefined` lança "Cannot read properties of undefined". A causa não é a função: é chamá-la com um repositório que não tem a branch que se está perguntando sobre.',
        hints: [
          'A função em si está correta. O que falta no `repo` de teste para a branch existir?',
          '`repo.branches[nomeDaBranch]` só existe se alguém a criou antes com `criarBranch`.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Uma branch isola trabalho em andamento do que já está pronto no \`main\`. Nasce do main atualizado, carrega **um assunto** — a mesma disciplina do commit atômico, um nível acima —, e vive pouco: quanto mais tempo aberta, mais ela diverge, e mais arriscado fica juntar de volta.

O nome diz o assunto, sem precisar abrir a branch para saber o que tem dentro.

Na próxima aula, o que acontece quando o trabalho da branch está pronto para virar main: o **pull request**, e a revisão que ele pede.
`.trim(),
    },
  ],
};

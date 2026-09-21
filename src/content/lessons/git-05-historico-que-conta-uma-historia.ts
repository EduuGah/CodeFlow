import type { Lesson } from '../types';

const SQUASH = `function squash(commits) {
  const resumos = commits.map((c) => c.resumo).join('; ');
  return { resumo: resumos, corpo: commits.map((c) => c.corpo).filter(Boolean).join('\\n\\n') };
}`;

export const lessonGitHistoricoQueContaUmaHistoria: Lesson = {
  id: 'lesson-git-5',
  trackId: 'track-git',
  title: 'Histórico Que Conta Uma História',
  language: 'javascript',
  objective:
    'Entender para quem o histórico de commits é escrito, por que juntar (squash) os passos de um mesmo trabalho antes de incorporar, e a regra de nunca reescrever histórico que outras pessoas já têm.',
  concepts: ['git-historico'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
O histórico de commits (\`git log\`) tem um leitor específico: alguém tentando entender **por que** o código está do jeito que está, geralmente enquanto caça um bug — e frequentemente essa pessoa é você mesmo, um ano depois, sem lembrar de nada.

## Para quem o histórico é escrito

Imagine \`git blame\` numa linha suspeita, e o commit que a trouxe se chama \`wip\`. Isso não ajuda: não diz o que mudou, nem por quê. Um histórico com \`wip\`, \`mais um\`, \`correção\`, \`funciona agora\` obriga quem lê a abrir o diff de cada um e reconstruir a história sozinho — o trabalho que a mensagem deveria ter feito.

Um histórico legível é uma sequência de decisões, cada uma com sua razão: \`adiciona validação de CEP\`, \`corrige cálculo de frete para pedidos internacionais\`, \`remove validação duplicada de e-mail\`. Cada linha do \`git log\` já responde "o que mudou aqui", sem abrir nada.

## Squash: juntar os passos de um trabalho

Enquanto você trabalha numa branch, é normal commitar em passos pequenos e até "errados de propósito" — um checkpoint, uma correção do checkpoint anterior, mais um ajuste. Isso é bom **durante** o trabalho: permite desfazer um passo sem perder os outros. Mas esses passos intermediários não interessam a quem lê o histórico do \`main\` depois — \`tenta de outro jeito\` e \`desfaz o que tentei antes\` não são decisões, são o processo de chegar numa decisão.

**Squash** é juntar vários commits em um só, com uma mensagem que descreve o resultado final, não o caminho. Uma branch com sete commits (\`wip\`, \`tenta X\`, \`desfaz X\`, \`tenta Y\`, \`funciona\`, \`typo\`, \`ajuste final\`) pode virar um único commit no \`main\`: \`adiciona validação de CEP vazio no cálculo de frete\`. O histórico da branch, cheio de tentativas, não precisa sobreviver — o resultado, sim.

## A regra de ouro: nunca reescrever histórico público

Squash e outras formas de reescrever commits (mudar mensagens, juntar, reordenar) mudam a **identidade** dos commits — para o Git, viram commits diferentes. Isso é seguro numa branch que só existe na sua máquina. É perigoso numa branch (ou no \`main\`) que outras pessoas já baixaram: os commits antigos delas e os novos, reescritos, não batem mais, e o Git não sabe combinar as duas histórias sozinho — a reescrita gera um estrago maior que qualquer commit malfeito que ela tentava consertar.

A regra prática: **reescreva histórico que só você tem. Nunca reescreva histórico que já foi compartilhado.**
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Sete commits de trabalho, na branch — vão virar um só antes de incorporar.
const commitsDaBranch = [
  { resumo: 'wip', corpo: '' },
  { resumo: 'tenta validar CEP com regex', corpo: '' },
  { resumo: 'desfaz regex, não cobria todos os formatos', corpo: '' },
  { resumo: 'valida CEP checando se está vazio', corpo: 'Formatos variam demais entre estados; checar vazio já resolve o bug relatado.' },
];

function squash(commits) {
  const resumos = commits.map((c) => c.resumo).join('; ');
  return { resumo: resumos, corpo: commits.map((c) => c.corpo).filter(Boolean).join('\\n\\n') };
}`,
      caption:
        'Esta versão ingênua de `squash` junta os resumos com ponto e vírgula — o que preserva todo o ruído do processo (`wip; tenta...; desfaz...`). O exercício a seguir pede uma versão que escreve o resultado final, não o caminho.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-5-para-quem',
        type: 'multiple-choice',
        prompt: 'O histórico de commits (`git log`) é escrito, acima de tudo, para quem?',
        concepts: ['git-historico'],
        difficulty: 'iniciante',
        tags: ['git', 'historico'],
        options: [
          'Para quem for tentar entender por que o código está assim, meses ou anos depois — inclusive você mesmo',
          'Para o Git conseguir versionar os arquivos, sem outro propósito',
          'Para nenhuma pessoa; é um registro técnico que ninguém lê de verdade',
          'Só para quem está revisando o pull request no dia em que ele é aberto',
        ],
        correctIndex: 0,
        explanation:
          'O histórico sobrevive muito além da revisão do PR: é onde alguém caçando um bug daqui a um ano vai procurar "por que essa linha existe". Uma mensagem específica responde essa pergunta sem precisar abrir o diff e reconstruir o raciocínio do zero.',
        hints: ['Pense em quem abre `git log` — e quando: quase sempre enquanto procura um problema, não enquanto tudo vai bem.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-5-por-que-squash',
        type: 'multiple-choice',
        prompt:
          'Uma branch tem sete commits: `wip`, `tenta X`, `desfaz X`, `tenta Y`, `funciona`, `typo`, `ajuste final`. Por que juntar (squash) tudo isso num commit só antes de incorporar ao main?',
        concepts: ['git-historico'],
        difficulty: 'iniciante',
        tags: ['git', 'historico'],
        options: [
          'Porque os passos intermediários interessam a quem trabalhou na branch, mas não a quem lê o histórico do main depois — só o resultado importa ali',
          'Porque o Git tem um limite de commits por branch',
          'Porque commits pequenos deixam o repositório mais lento',
          'Não há razão real; é só um costume sem efeito prático',
        ],
        correctIndex: 0,
        explanation:
          'Commits pequenos e "errados de propósito" são úteis enquanto você trabalha — permitem desfazer um passo sem perder os outros. Mas eles registram o **processo** de chegar numa decisão, não a decisão em si; squash troca sete passos de tentativa e erro por um commit que já entrega o resultado, com uma mensagem que faz sentido sozinha.',
        hints: ['Separe duas fases: enquanto você trabalha na branch, e depois que ela vira parte do main.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-5-regra-de-ouro',
        type: 'multiple-choice',
        prompt: 'Qual destas situações é segura para reescrever (squash, reordenar, mudar mensagens) o histórico?',
        concepts: ['git-historico'],
        difficulty: 'intermediario',
        tags: ['git', 'historico'],
        options: [
          'Uma branch de trabalho que só existe na sua máquina, ainda não compartilhada com ninguém',
          'O main, depois que várias pessoas já atualizaram a cópia local delas',
          'Uma branch que outra pessoa já baixou para revisar e comentar',
          'Qualquer branch, a qualquer momento, sem restrição',
        ],
        correctIndex: 0,
        explanation:
          'Reescrever muda a identidade dos commits — para o Git, viram commits diferentes dos que existiam antes. Isso é seguro só quando ninguém mais tem uma cópia da versão antiga. Reescrever histórico que já foi compartilhado faz os commits antigos de quem baixou e os novos, reescritos, deixarem de bater — um estrago maior que qualquer commit malfeito que a reescrita tentava consertar.',
        hints: ['A regra depende de uma coisa: alguém além de você já tem essa versão do histórico?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-5-ordem-squash',
        type: 'order-steps',
        prompt: 'Coloque na ordem os passos para limpar o histórico de uma branch antes de abrir o pull request.',
        concepts: ['git-historico'],
        difficulty: 'iniciante',
        tags: ['git', 'historico', 'processo'],
        steps: [
          { id: 'revisar', text: 'Revisar os commits da branch, do primeiro ao último', ordem: 1 },
          { id: 'agrupar', text: 'Identificar quais são passos do mesmo trabalho (tentativas, correções de digitação, checkpoints)', ordem: 2 },
          { id: 'squash', text: 'Juntar esses passos num commit só por decisão real tomada', ordem: 3 },
          { id: 'reescrever', text: 'Reescrever o resumo de cada commit final para descrever o resultado, não o caminho', ordem: 4 },
          { id: 'conferir', text: 'Conferir que o comportamento final do código não mudou nada', ordem: 5 },
        ],
        explanation:
          'Agrupar antes de juntar evita misturar dois assuntos diferentes num squash só — o mesmo cuidado do commit atômico, aplicado à limpeza. E conferir o comportamento por último garante que a reescrita não alterou nada além da forma do histórico.',
        hints: [
          'Antes de juntar qualquer coisa, é preciso saber quais commits pertencem ao mesmo trabalho.',
          'O último passo confirma que só a forma do histórico mudou — não o comportamento do código.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-5-testar-squash',
        type: 'write-test',
        prompt:
          'A função `squash(commits)` abaixo está **correta**: recebe um array de commits `{ resumo, corpo }` e devolve um único commit, com os resumos juntados por `"; "` e os corpos (ignorando os vazios) juntados por linha em branco. Escreva ao menos dois testes com `assert`: um caso com dois commits com corpo, e um caso onde todos os corpos estão vazios.',
        concepts: ['git-historico'],
        difficulty: 'intermediario',
        tags: ['git', 'historico', 'assert'],
        subject: SQUASH,
        initialCode: `// Escreva testes sobre squash. Um por linha.
//
// const r = squash([{ resumo: 'a', corpo: '' }, { resumo: 'b', corpo: '' }]);
// assert(r.resumo === 'a; b', 'junta os resumos com ponto e vírgula');

`,
        mutants: [
          {
            description: 'junta os resumos com vírgula em vez de ponto e vírgula',
            code: `function squash(commits) {
  const resumos = commits.map((c) => c.resumo).join(', ');
  return { resumo: resumos, corpo: commits.map((c) => c.corpo).filter(Boolean).join('\\n\\n') };
}`,
          },
          {
            description: 'não filtra os corpos vazios, deixando linhas em branco a mais',
            code: `function squash(commits) {
  const resumos = commits.map((c) => c.resumo).join('; ');
  return { resumo: resumos, corpo: commits.map((c) => c.corpo).join('\\n\\n') };
}`,
          },
          {
            description: 'usa só o primeiro corpo, ignorando os demais',
            code: `function squash(commits) {
  const resumos = commits.map((c) => c.resumo).join('; ');
  return { resumo: resumos, corpo: commits[0] ? commits[0].corpo : '' };
}`,
          },
        ],
        hints: [
          'Comece testando o resumo: `squash([{resumo: "a", corpo: ""}, {resumo: "b", corpo: ""}]).resumo` deveria ser `"a; b"`.',
          'O segundo caso: quando nenhum commit tem corpo, o corpo final deveria ser uma string vazia — os corpos vazios são filtrados antes de juntar.',
          "assert(squash([{ resumo: 'a', corpo: '' }, { resumo: 'b', corpo: '' }]).resumo === 'a; b', 'junta os resumos com ponto e vírgula'); assert(squash([{ resumo: 'a', corpo: '' }, { resumo: 'b', corpo: '' }]).corpo === '', 'sem corpos, o corpo final é vazio'); assert(squash([{ resumo: 'a', corpo: 'motivo a' }, { resumo: 'b', corpo: 'motivo b' }]).corpo === 'motivo a\\n\\nmotivo b', 'junta os corpos não vazios');",
        ],
        solution: `assert(squash([{ resumo: 'a', corpo: '' }, { resumo: 'b', corpo: '' }]).resumo === 'a; b', 'junta os resumos com ponto e virgula');
assert(squash([{ resumo: 'a', corpo: '' }, { resumo: 'b', corpo: '' }]).corpo === '', 'sem corpos, o corpo final e vazio');
assert(squash([{ resumo: 'a', corpo: 'motivo a' }, { resumo: 'b', corpo: 'motivo b' }]).corpo === 'motivo a\\n\\nmotivo b', 'junta os corpos nao vazios, separados por linha em branco');`,
        explanation:
          'Três casos, três defeitos pegos: juntar com vírgula em vez de ponto e vírgula já erra no primeiro teste; não filtrar corpos vazios só aparece quando há um caso sem nenhum corpo — o segundo teste; e usar só o primeiro corpo escapa dos dois primeiros testes (ambos têm corpo vazio ou um só relevante) e só é pego testando dois corpos não vazios ao mesmo tempo.',
      },
    },
    {
      kind: 'summary',
      markdown: `
O histórico é lido por quem caça um bug meses ou anos depois — inclusive você. \`wip\` e \`ajuste final\` não dizem nada; uma mensagem específica poupa quem lê de reconstruir o raciocínio sozinho no diff.

**Squash** troca os passos de tentativa e erro de uma branch por commits que já entregam o resultado. E a regra de ouro: reescreva histórico que só você tem — nunca o que já foi compartilhado, porque a reescrita quebra a combinação com quem já tem a versão antiga.

Na última aula da trilha, o que nunca deveria ter entrado no repositório para começar: o **\`.gitignore\`**.
`.trim(),
    },
  ],
};

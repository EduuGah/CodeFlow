import type { Lesson } from '../types';

export const lessonGitCommitComoFrase: Lesson = {
  id: 'lesson-git-1',
  trackId: 'track-git',
  title: 'O Commit Como Frase',
  language: 'javascript',
  objective:
    'Entender o que faz um commit ser atômico, escrever um resumo no imperativo que cabe em 50 caracteres, e separar o "o quê" (o diff) do "por quê" (o corpo da mensagem).',
  concepts: ['git-commit'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Esta plataforma não tem um Git de verdade rodando por trás — não existe motor para executar \`git commit\`. O que esta trilha ensina é a disciplina por trás do comando: **o que separa um commit útil de um inútil** é uma decisão, não uma sintaxe, e essa decisão vale em qualquer ferramenta de controle de versão que você usar na vida.

## Um commit é uma mudança lógica

Um commit salva um instantâneo do projeto com uma mensagem. A pergunta que decide se um commit está bem feito não é "quanto código mudou", é: **essa mudança tem uma razão só para existir?** É a mesma pergunta da trilha de Engenharia sobre arquivos e funções — "uma razão para mudar" —, aplicada ao commit.

- \`corrige o cálculo de frete para CEP vazio\` — uma razão. Bom commit.
- \`corrige frete, atualiza dependências e ajusta o CSS do rodapé\` — três razões, uma só mensagem. Se o frete quebrar algo, ninguém sabe se foi ele, a dependência ou o CSS.

Um commit atômico também é **revertível sozinho**: se descobrirem amanhã que o conserto do frete tinha um bug, dá para desfazer só ele — sem levar junto a atualização de dependências que estava certa.

## O resumo, no imperativo

A primeira linha da mensagem (o "resumo") segue uma convenção simples, e ela existe por um motivo prático: o \`git log\` e as telas de revisão mostram só essa linha numa lista. Ela precisa caber e precisar dizer a coisa.

- **Imperativo, no presente**: "corrige", "adiciona", "remove" — como uma ordem, não "corrigido" ou "corrigia". Pense em completar a frase "este commit vai **\\_\\_\\_**".
- **Até uns 50 caracteres**. Força a resumir; o que não cabe vai para o corpo.
- **Sem ponto final**. É um título, não uma frase.
- **Específico**. "corrige bug" não diz qual; "corrige cálculo de frete para CEP vazio" diz.

Mensagens ruins que aparecem cedo ou tarde em todo projeto: \`wip\`, \`fix\`, \`mais um commit\`, \`ajustes\`, \`corrigido o que a Ana pediu\`. Nenhuma delas sobrevive a uma pergunta simples seis meses depois: **o que esse commit fez?**

## O corpo explica o porquê, não o quê

O \`git diff\` já mostra **o quê** mudou — linha por linha. Repetir isso na mensagem ("mudei a linha 40 para somar o imposto") é redundante. O que o diff não mostra é **por quê**: por que essa mudança, por que agora, o que aconteceria sem ela.

~~~
adiciona validação de CEP vazio no cálculo de frete

Pedidos sem CEP estavam caindo no frete padrão de R$ 15, mesmo
para clientes que preenchiam o campo errado por engano. Agora o
formulário recusa o pedido antes de calcular, com uma mensagem
clara. Relacionado ao chamado #482.
~~~

Uma linha em branco separa o resumo do corpo — é assim que ferramentas de Git sabem onde um termina e o outro começa.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// A mensagem de commit tem a mesma estrutura de um objeto com duas partes.
const mensagem = {
  resumo: 'adiciona validação de CEP vazio no cálculo de frete',
  corpo: 'Pedidos sem CEP caíam no frete padrão por engano.\\nAgora o formulário recusa antes de calcular.',
};

function textoCompleto(mensagem) {
  if (!mensagem.corpo) return mensagem.resumo;
  return mensagem.resumo + '\\n\\n' + mensagem.corpo;
}`,
      caption:
        'Resumo e corpo são duas ideias diferentes, separadas por uma linha em branco — a mesma estrutura que este exercício vai processar em JavaScript comum.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-1-atomico',
        type: 'multiple-choice',
        prompt:
          'Você corrigiu um bug no cálculo de frete e, no mesmo intervalo, atualizou uma dependência que não tinha nada a ver. Qual é o commit mais atômico?',
        concepts: ['git-commit'],
        difficulty: 'iniciante',
        tags: ['git', 'commit'],
        options: [
          'Dois commits: um só com o conserto do frete, outro só com a atualização da dependência',
          'Um commit só, com os dois: "corrige frete e atualiza dependência"',
          'Um commit com a atualização, e o conserto do frete embutido "por economia de tempo"',
          'Não importa, desde que os dois acabem no repositório',
        ],
        correctIndex: 0,
        explanation:
          'Duas razões de mudar, dois commits. Separados, cada um pode ser revertido sozinho se algo der errado, e o histórico mostra exatamente qual mudança fez o quê — a mesma lógica de "uma razão por arquivo" da trilha de Engenharia, aplicada ao commit.',
        hints: ['Pergunte: se um dos dois precisar ser desfeito amanhã, o outro devia ir junto?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-1-resumo-ruim',
        type: 'multiple-choice',
        prompt: 'Qual destes resumos de commit segue a convenção (imperativo, específico, sem ponto final)?',
        concepts: ['git-commit'],
        difficulty: 'iniciante',
        tags: ['git', 'commit'],
        options: [
          'remove validação duplicada de e-mail no formulário de cadastro',
          'removido a validação duplicada.',
          'correções diversas no formulário',
          'estava validando e-mail duas vezes então tirei uma',
        ],
        correctIndex: 0,
        explanation:
          'A primeira é imperativa ("remove"), específica (diz o quê e onde) e não termina em ponto. A segunda usa particípio e termina com ponto; a terceira não diz nada específico; a quarta é uma frase corrida, do jeito que se fala, não um título.',
        hints: ['Complete a frase "este commit vai ___" com cada opção. Só uma continua fazendo sentido gramatical.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-1-ordem-commit',
        type: 'order-steps',
        prompt: 'Coloque na ordem os passos de registrar uma mudança bem feita.',
        concepts: ['git-commit'],
        difficulty: 'iniciante',
        tags: ['git', 'commit', 'processo'],
        steps: [
          { id: 'ver', text: 'Ver o que de fato mudou no projeto, arquivo por arquivo', ordem: 1 },
          { id: 'selecionar', text: 'Selecionar só as mudanças que pertencem a esta razão — deixar o resto de fora', ordem: 2 },
          { id: 'resumo', text: 'Escrever o resumo no imperativo, curto e específico', ordem: 3 },
          { id: 'corpo', text: 'Se a razão não for óbvia, explicar o porquê no corpo, depois de uma linha em branco', ordem: 4 },
          { id: 'registrar', text: 'Registrar o commit', ordem: 5 },
        ],
        explanation:
          'Ver antes de selecionar evita incluir uma mudança de outro assunto por engano; selecionar antes de escrever o resumo é o que torna o commit atômico — sem essa etapa, "o que mudou" vira "tudo que estava aberto no editor".',
        hints: [
          'O que precisa acontecer antes de decidir o que entra neste commit e o que fica para outro?',
          'O resumo vem antes do corpo — e o corpo só existe quando o resumo sozinho não basta.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-1-primeira-linha',
        type: 'code',
        prompt:
          'Escreva `resumoDaMensagem(mensagem)`: recebe o texto completo de uma mensagem de commit (resumo, e às vezes um corpo separado por uma linha em branco) e devolve só o resumo — a primeira linha.',
        concepts: ['git-commit'],
        difficulty: 'iniciante',
        tags: ['git', 'commit', 'strings'],
        initialCode: `function resumoDaMensagem(mensagem) {
  return mensagem;
}`,
        tests: [
          {
            description: 'Mensagem só com resumo devolve o próprio texto',
            assertion: `const r = resumoDaMensagem('remove validação duplicada de e-mail');
if (r !== 'remove validação duplicada de e-mail') throw new Error('esperava o resumo sozinho, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Mensagem com corpo devolve só a primeira linha',
            assertion: `const r = resumoDaMensagem('adiciona validação de CEP\\n\\nPedidos sem CEP caíam no frete padrão.');
if (r !== 'adiciona validação de CEP') throw new Error('esperava só a primeira linha, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Corpo com várias linhas não vaza para o resumo',
            assertion: `const r = resumoDaMensagem('corrige frete\\n\\nlinha um do corpo\\nlinha dois do corpo');
if (r !== 'corrige frete') throw new Error('esperava só o resumo, veio ' + JSON.stringify(r));`,
          },
        ],
        solution: `function resumoDaMensagem(mensagem) {
  return mensagem.split('\\n')[0];
}`,
        hints: [
          '`split(\'\\n\')` separa o texto por linha. O resumo é sempre a primeira.',
          '`mensagem.split(\'\\n\')[0]` já resolve, mesmo quando não existe corpo nenhum.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-1-comeca-minusculo',
        type: 'find-bug',
        prompt:
          'Esta função deveria dizer se o resumo começa com letra minúscula (a convenção do imperativo: "adiciona", não "Adiciona"). Ela quebra ao rodar. Aponte a linha que precisa mudar.',
        concepts: ['git-commit'],
        difficulty: 'intermediario',
        tags: ['git', 'commit', 'bug'],
        code: `function comecaComMinuscula(resumo) {
  const primeira = resumo.charAt(0);
  return primeira === primeira.toLowercase();
}

console.log(comecaComMinuscula('adiciona validação de CEP vazio'));`,
        buggyLine: 3,
        fix: '  return primeira === primeira.toLowerCase();',
        explanation:
          'O método existe, mas com outro nome de capitalização: `toLowerCase`, com "C" maiúsculo. `primeira.toLowercase` (tudo minúsculo) não existe no objeto string, vale `undefined`, e chamar `undefined()` lança "is not a function". JavaScript não avisa sobre nomes de método errados até a linha rodar — e diferente de uma variável, que ao menos existiria como `undefined` sozinha, aqui o erro só aparece na hora de **chamar**.',
        hints: [
          'O erro é sobre chamar algo que não é uma função. Qual parte do `return` é uma chamada de método?',
          'Métodos de string em JavaScript têm letras maiúsculas no meio do nome — confira a grafia exata.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Um commit vale por ter **uma razão para existir** — o que o torna revertível e legível sozinho. O resumo é uma frase no imperativo, curta e específica; o corpo, quando existe, explica **por quê**, não **o quê** — o diff já mostra o quê.

"wip", "fix" e "ajustes" não sobrevivem à pergunta de daqui a seis meses: o que esse commit fez? Um resumo específico, sim.

Na próxima aula, onde um commit mora enquanto uma ideia ainda não está pronta para a linha principal: a **branch**.
`.trim(),
    },
  ],
};

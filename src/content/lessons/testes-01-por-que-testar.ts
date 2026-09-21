import type { Lesson } from '../types';

const DESCONTO = `function aplicarDesconto(preco, percentual) {
  if (percentual < 0 || percentual > 100) {
    throw new Error('percentual precisa estar entre 0 e 100');
  }
  return Math.round((preco - preco * (percentual / 100)) * 100) / 100;
}`;

export const lessonTestesPorQueTestar: Lesson = {
  id: 'lesson-testes-1',
  trackId: 'track-testes',
  title: 'Por Que Testar',
  language: 'javascript',
  objective:
    'Entender o que um teste prova (e o que não prova), o custo real de não testar, e escrever os primeiros testes com `assert`.',
  concepts: ['testes-por-que'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Você já resolveu centenas de exercícios nesta plataforma, e em todos eles quem escreveu o teste foi outra pessoa. Esta trilha vira a mesa: a partir de agora, **você** escreve os testes — dos seus programas, e dos programas dos outros.

## O que "funciona na minha máquina" não prova

Você escreve uma função, chama ela uma vez no console, o resultado parece certo, e segue em frente. Isso prova que a função funciona **para aquela entrada, naquele momento**. Não prova que funciona para a lista vazia, para o número negativo, para o texto com acento — e não avisa quando, três semanas depois, alguém muda uma linha e quebra um caso que você nunca tentou de novo.

Um teste é essa tentativa, **guardada**. Escrita uma vez, rodada para sempre, a cada mudança.

## O que um teste prova — e o que não prova

~~~js
function media(notas) {
  return notas.reduce((soma, n) => soma + n, 0) / notas.length;
}

assert(media([10, 10]) === 10, 'a média de duas notas 10 é 10');
~~~

Esse teste **passar** prova uma coisa: para a entrada \`[10, 10]\`, a função devolve \`10\`. Não prova que a função está certa em geral — a lista vazia (\`0/0 = NaN\`) nem foi tentada. Um teste só fala sobre os casos que ele de fato executa. É por isso que "todos os meus testes passam" não é o mesmo que "meu código está certo": pode ser que ninguém tenha testado o caso que quebra.

## O custo de não testar

Sem testes, cada mudança é um salto de fé: você muda uma função, roda o programa inteiro na mão, olha se "parece" certo, e torce para não ter quebrado algo longe dali. Em um programa pequeno isso é lento; em um programa com cem funções que se chamam, é impossível — ninguém consegue reconferir tudo à mão a cada mudança.

Com testes, a pergunta "eu quebrei alguma coisa?" tem uma resposta objetiva, em segundos: roda a suíte. É a mesma vantagem que o CI desta plataforma tem sobre "peço para alguém testar na mão antes de publicar".

## Quando não vale a pena

Testar não é de graça: cada teste é código a mais para escrever, ler e manter. Um script de dez linhas que você vai rodar uma vez e apagar não pede teste. Um protótipo para decidir se uma ideia funciona, também não — o objetivo dele é ser descartado. O teste vale a pena quando o código **vai continuar existindo** e **vai continuar mudando**: é aí que a rede de segurança paga o que custou.

## Como este exercício funciona

Você vai receber uma função **correta**, e vai escrever afirmações sobre ela com \`assert(condição, mensagem)\`:

~~~js
assert(condição, 'mensagem para quando a condição for falsa');
~~~

Se a condição for falsa, o teste falha com essa mensagem. Seus testes rodam contra a função correta (precisam **aceitar**) e contra versões erradas de propósito (precisam **reprovar**). Um teste vazio aceita tudo — inclusive o errado — e por isso reprova o exercício.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `function dobrar(numeros) {
  return numeros.map((n) => n * 2);
}

// Prova um caso: a lista [1, 2, 3] dobrada é [2, 4, 6].
assert(JSON.stringify(dobrar([1, 2, 3])) === JSON.stringify([2, 4, 6]), 'dobra cada número da lista');

// Prova o caso extremo: lista vazia continua vazia.
assert(JSON.stringify(dobrar([])) === JSON.stringify([]), 'lista vazia dobrada continua vazia');`,
      caption:
        'Dois testes, dois casos diferentes provados. Nenhum dos dois prova que a função funciona para todo tipo de entrada — só para os casos que de fato chamou.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-1-prova',
        type: 'multiple-choice',
        prompt:
          'Um teste chama `dobrar([1, 2, 3])` e afirma que o resultado é `[2, 4, 6]`. O teste passa. O que isso prova?',
        concepts: ['testes-por-que'],
        difficulty: 'iniciante',
        tags: ['testes', 'conceito'],
        options: [
          'Que a função dobra corretamente a lista `[1, 2, 3]` — nada foi provado sobre outras entradas',
          'Que a função está correta para qualquer lista de números',
          'Que a função nunca vai quebrar em produção',
          'Que a função foi revisada por outra pessoa',
        ],
        correctIndex: 0,
        explanation:
          'Um teste só fala sobre os casos que ele executa. Passar com `[1, 2, 3]` não diz nada sobre `[]`, sobre uma lista com texto misturado, ou sobre uma lista de um milhão de itens — cada um desses precisaria do seu próprio teste para estar coberto.',
        hints: ['Repare exatamente na entrada que o teste usou. O que ele testou além dela?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-1-nao-prova',
        type: 'predict-output',
        prompt:
          'Esta função tem um defeito para listas vazias. O que este programa imprime?',
        concepts: ['testes-por-que'],
        difficulty: 'iniciante',
        tags: ['testes', 'casos-extremos'],
        code: `function media(notas) {
  return notas.reduce((soma, n) => soma + n, 0) / notas.length;
}

console.log(media([10, 10]));
console.log(media([]));`,
        expectedOutput: `10
NaN`,
        explanation:
          'O primeiro teste (com `[10, 10]`) passaria sem problema — e não avisaria nada sobre o segundo caso. `0 / 0` é `NaN` em JavaScript, e uma função "testada" que nunca tentou a lista vazia esconde esse defeito até alguém encontrá-lo em produção.',
        hints: ['`reduce` numa lista vazia devolve o valor inicial, `0`. E `0` dividido por `0`?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-1-vale-a-pena',
        type: 'multiple-choice',
        prompt: 'Em qual destas situações escrever testes vale MENOS a pena?',
        concepts: ['testes-por-que'],
        difficulty: 'iniciante',
        tags: ['testes', 'conceito'],
        options: [
          'Um script de uma vez só, para renomear alguns arquivos hoje, que você vai apagar depois',
          'Uma função de cálculo de frete que o site inteiro usa e que muda de regra a cada promoção',
          'Uma função de validação de e-mail usada em três formulários diferentes',
          'Uma função que várias pessoas da equipe vão modificar ao longo dos próximos meses',
        ],
        correctIndex: 0,
        explanation:
          'O teste paga o que custou quando o código continua existindo e mudando: aí ele confere, de novo e de novo, que a mudança não quebrou nada. Um script descartável não tem esse futuro — o teste seria escrito, rodaria uma vez, e seria apagado junto.',
        hints: ['A pergunta que decide: esse código vai continuar existindo e mudando?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-1-testar-desconto',
        type: 'write-test',
        prompt:
          'A função `aplicarDesconto(preco, percentual)` abaixo está **correta**. Escreva ao menos três testes com `assert`: um caso comum, o percentual `0` (sem desconto) e o percentual `100` (fica de graça). Seus testes rodam contra esta versão, onde precisam **passar**, e contra três versões quebradas, onde precisam **falhar**.',
        concepts: ['testes-por-que'],
        difficulty: 'intermediario',
        tags: ['testes', 'assert'],
        subject: DESCONTO,
        initialCode: `// Escreva testes sobre aplicarDesconto. Um por linha.
//
// assert(aplicarDesconto(100, 10) === 90, '10% de desconto em 100 é 90');

`,
        mutants: [
          {
            description: 'soma o desconto em vez de subtrair',
            code: `function aplicarDesconto(preco, percentual) {
  if (percentual < 0 || percentual > 100) {
    throw new Error('percentual precisa estar entre 0 e 100');
  }
  return Math.round((preco + preco * (percentual / 100)) * 100) / 100;
}`,
          },
          {
            description: 'usa o percentual como se já fosse a fração (não divide por 100)',
            code: `function aplicarDesconto(preco, percentual) {
  if (percentual < 0 || percentual > 100) {
    throw new Error('percentual precisa estar entre 0 e 100');
  }
  return Math.round((preco - preco * percentual) * 100) / 100;
}`,
          },
          {
            description: 'devolve sempre o preço original, ignorando o desconto',
            code: `function aplicarDesconto(preco, percentual) {
  if (percentual < 0 || percentual > 100) {
    throw new Error('percentual precisa estar entre 0 e 100');
  }
  return preco;
}`,
          },
        ],
        hints: [
          'Escolha um preço e um percentual comuns, e calcule o resultado esperado de cabeça: `aplicarDesconto(100, 10)` deveria ser `90`.',
          'O percentual `0` é um caso extremo: o preço não deveria mudar nada. O percentual `100` é outro: o preço deveria virar `0`.',
          "assert(aplicarDesconto(100, 10) === 90, '10% em 100 é 90'); assert(aplicarDesconto(50, 0) === 50, '0% não muda o preço'); assert(aplicarDesconto(80, 100) === 0, '100% zera o preço');",
        ],
        solution: `assert(aplicarDesconto(100, 10) === 90, '10% em 100 e 90');
assert(aplicarDesconto(50, 0) === 50, '0% nao muda o preco');
assert(aplicarDesconto(80, 100) === 0, '100% zera o preco');`,
        explanation:
          'Três casos, três defeitos pegos: o desconto somado em vez de subtraído já erra no caso comum; o percentual tratado como fração já erra em `10` (viraria um desconto de 1000%); e devolver sempre o preço original só é pego pelo caso comum ou pelo de 100% — o de 0% sozinho não perceberia esse defeito, porque coincide com o preço original.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-1-vazio-nao-testa',
        type: 'predict-output',
        prompt:
          'Um teste vazio (sem nenhum `assert`) roda contra `aplicarDesconto`. O que acontece — ele passa, ou falha?',
        concepts: ['testes-por-que'],
        difficulty: 'iniciante',
        tags: ['testes', 'conceito'],
        code: `function testeVazio() {
  // nenhum assert aqui
}

testeVazio();
console.log('terminou sem lançar nada');`,
        expectedOutput: 'terminou sem lançar nada',
        explanation:
          'Um teste vazio não lança erro nenhum — ele "passa" contra qualquer implementação, certa ou errada, porque nunca afirma nada. É por isso que este exercício reprova um teste que aceita a implementação correta mas não pega nenhuma das sabotagens: um teste que aceita tudo não verifica nada.',
        hints: ['Sem nenhum `assert`, existe algo que poderia fazer a função lançar um erro?'],
      },
    },
    {
      kind: 'summary',
      markdown: `
Um teste **prova só o que ele executa** — passar não significa "está certo", significa "está certo para estes casos". O custo de não testar é o salto de fé a cada mudança; o de testar é escrever e manter o teste — e vale a pena quando o código vai continuar existindo e mudando.

\`assert(condição, mensagem)\` é a ferramenta: uma condição falsa lança um erro com a mensagem. Um teste vazio "passa" em tudo, e é exatamente por isso que não vale nada.

Na próxima aula, a forma que todo teste segue: **arrange, act, assert**.
`.trim(),
    },
  ],
};

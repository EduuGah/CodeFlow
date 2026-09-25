import type { Lesson } from '../types';

export const lessonTerminalLerASaidaDeErro: Lesson = {
  id: 'lesson-terminal-4',
  trackId: 'track-terminal',
  title: 'O Que Ler numa Saída de Erro',
  language: 'javascript',
  objective:
    'Entender o que um código de saída diz, encontrar a linha do stack trace que aponta para o próprio código, e ler a mensagem de erro inteira antes de tentar corrigir.',
  concepts: ['terminal-erros'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um comando termina com um **código de saída**: \`0\` significa sucesso, qualquer outro número significa algum tipo de falha (\`1\` é o genérico; \`127\`, por exemplo, costuma indicar "comando não encontrado"). É esse número que \`&&\` verifica para decidir se continua a corrente — a mesma ideia da aula anterior.

## Duas saídas, não uma

Todo programa de terminal tem, na verdade, **dois** fluxos de saída, não um: **stdout** (saída padrão), para o resultado normal, e **stderr** (saída de erro), separada, para mensagens de erro e aviso. É por isso que \`console.log\` (vai para stdout) e \`console.error\` (vai para stderr) existem como funções diferentes, mesmo as duas "imprimindo na tela" — no terminal, os dois fluxos aparecem misturados, mas são canais distintos por baixo.

A separação importa na prática porque dá para redirecionar cada um para um lugar diferente:

~~~
node script.js > saida.txt        # só o stdout vai para o arquivo
node script.js 2> erros.txt       # só o stderr vai para o arquivo
node script.js > saida.txt 2>&1   # os dois juntos no mesmo arquivo
~~~

Um script que usa \`console.error\` para avisos consegue ter sua saída "de verdade" redirecionada para um arquivo sem misturar os avisos junto — e é assim que ferramentas de linha de comando decidem, internamente, o que é resultado e o que é diagnóstico.

## Ler antes de reagir

O instinto mais comum diante de uma tela cheia de texto vermelho é rolar até o fim procurando "a resposta" — ou, pior, copiar só a primeira linha e ignorar o resto. As duas coisas perdem informação. Uma mensagem de erro tem duas partes que interessam:

- **O quê**: o tipo do erro e a descrição — "TypeError: Cannot read properties of undefined".
- **Onde**: o arquivo, a linha e a coluna de cada passo até chegar ali.

## Lendo um stack trace

Um *stack trace* lista, de cima para baixo, o caminho que o programa percorreu até o erro acontecer: a primeira linha é onde o erro foi lançado; cada linha seguinte é quem chamou a função de cima. Numa aplicação real, boa parte dessas linhas está dentro de bibliotecas (\`node_modules\`) — código que você não escreveu e, na maioria das vezes, não é onde o defeito está.

O que vale procurar é a **primeira linha de cima para baixo que está dentro do seu próprio projeto** — não em \`node_modules\`. É o ponto mais próximo de onde o seu código, de fato, causou ou expôs o problema.

~~~
TypeError: Cannot read properties of undefined (reading 'total')
    at calcularFrete (/home/ana/projeto/src/carrinho.js:12:5)
    at Array.map (<anonymous>)
    at Object.<anonymous> (/home/ana/projeto/node_modules/alguma-lib/index.js:40:10)
~~~

Aqui, a linha de \`carrinho.js\` é o ponto de partida certo — mesmo a pilha continuando por mais uma linha, dentro de uma biblioteca.

## Um roteiro para não se perder

1. Leia a mensagem inteira, sem pular direto para tentar uma correção.
2. Ache a primeira linha do stack que é do seu próprio código.
3. Abra o arquivo naquela linha exata e confira o que está ali.
4. Se ainda não fizer sentido, reproduza o erro com o menor exemplo possível — corte tudo que não for necessário para ele acontecer.
5. Se mesmo assim travar, pesquise a mensagem de erro **exata**, entre aspas — é provável que não seja a primeira pessoa a ver aquele erro.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `const stack = [
  'TypeError: Cannot read properties of undefined',
  '    at calcularFrete (/home/ana/projeto/src/carrinho.js:12:5)',
  '    at Array.map (<anonymous>)',
  '    at Object.<anonymous> (/home/ana/projeto/node_modules/alguma-lib/index.js:40:10)',
];

function primeiraLinhaDoProprioCodigo(linhas, pastaDoProjeto) {
  return linhas.find((linha) => linha.includes(pastaDoProjeto)) ?? null;
}

primeiraLinhaDoProprioCodigo(stack, 'projeto/src');
// '    at calcularFrete (/home/ana/projeto/src/carrinho.js:12:5)'`,
      caption:
        'Procurar por `projeto/src` (e não só `projeto`) já distingue o código próprio do `node_modules`, que também mora dentro da pasta do projeto.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-4-codigo-de-saida',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['terminal-erros'],
        difficulty: 'iniciante',
        tags: ['terminal', 'erros'],
        code: `function estaOk(codigoDeSaida) {
  return codigoDeSaida === 0;
}

console.log(estaOk(0));
console.log(estaOk(1));
console.log(estaOk(127));`,
        expectedOutput: `true
false
false`,
        explanation:
          'Só `0` significa sucesso. Qualquer outro número — `1`, o genérico, ou `127`, que costuma indicar "comando não encontrado" — é algum tipo de falha, e `estaOk` trata os dois casos igual: nem todo código diferente de zero precisa de um tratamento especial para a pergunta "deu certo?".',
        hints: ['Só existe um valor que conta como sucesso; compare cada entrada contra ele.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-4-onde-procurar',
        type: 'multiple-choice',
        prompt:
          'Um stack trace tem cinco linhas: a mensagem, duas linhas dentro do seu projeto, e duas dentro de `node_modules`, nessa ordem. Por onde começar a procurar o defeito?',
        concepts: ['terminal-erros'],
        difficulty: 'intermediario',
        tags: ['terminal', 'erros'],
        options: [
          'Pela primeira linha (de cima para baixo) que está dentro do seu próprio projeto, não numa biblioteca',
          'Sempre pela primeira linha do stack, seja de onde for',
          'Sempre pela última linha do stack, seja de onde for',
          'Por qualquer linha de dentro de node_modules, porque bibliotecas têm mais bugs',
        ],
        correctIndex: 0,
        explanation:
          'A primeira linha do stack é sempre onde o erro foi lançado tecnicamente — às vezes dentro de uma biblioteca reagindo a um dado que o seu código passou errado. A linha mais útil para investigar é a mais próxima do topo que ainda é **seu** código: é ali que a causa, não só o sintoma, costuma estar.',
        hints: ['A pergunta não é "onde o erro apareceu primeiro", é "onde está o código que eu posso corrigir".'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-4-achar-linha-propria',
        type: 'code',
        prompt:
          'Escreva `primeiraLinhaDoProprioCodigo(linhas, pastaDoProjeto)`: recebe um stack trace como array de strings e devolve a primeira linha que contém `pastaDoProjeto`, ou `null` se nenhuma contiver.',
        concepts: ['terminal-erros'],
        difficulty: 'intermediario',
        tags: ['terminal', 'erros'],
        initialCode: `function primeiraLinhaDoProprioCodigo(linhas, pastaDoProjeto) {
  return linhas[0];
}`,
        tests: [
          {
            description: 'Encontra a linha do próprio código, ignorando a mensagem e as de node_modules',
            assertion: `const stack = [
  'TypeError: Cannot read properties of undefined',
  '    at calcularFrete (/home/ana/projeto/src/carrinho.js:12:5)',
  '    at Object.<anonymous> (/home/ana/projeto/node_modules/lib/index.js:40:10)',
];
const r = primeiraLinhaDoProprioCodigo(stack, 'projeto/src');
if (r !== '    at calcularFrete (/home/ana/projeto/src/carrinho.js:12:5)') throw new Error('esperava a linha de carrinho.js, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Sem nenhuma linha do próprio código, devolve null',
            assertion: `const stack = [
  'Error: falhou',
  '    at Object.<anonymous> (/home/ana/projeto/node_modules/lib/index.js:5:1)',
];
const r = primeiraLinhaDoProprioCodigo(stack, 'projeto/src');
if (r !== null) throw new Error('esperava null, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Entre duas linhas do próprio código, devolve a primeira (mais próxima do topo)',
            assertion: `const stack = [
  'Error: falhou',
  '    at f (/home/ana/projeto/src/a.js:1:1)',
  '    at g (/home/ana/projeto/src/b.js:2:2)',
];
const r = primeiraLinhaDoProprioCodigo(stack, 'projeto/src');
if (r !== '    at f (/home/ana/projeto/src/a.js:1:1)') throw new Error('esperava a linha de a.js, veio ' + JSON.stringify(r));`,
          },
        ],
        solution: `function primeiraLinhaDoProprioCodigo(linhas, pastaDoProjeto) {
  return linhas.find((linha) => linha.includes(pastaDoProjeto)) ?? null;
}`,
        hints: [
          '`Array.prototype.find` devolve o primeiro elemento que satisfaz uma condição, e `undefined` se nenhum satisfizer.',
          '`linhas.find((linha) => linha.includes(pastaDoProjeto)) ?? null` já resolve, inclusive o caso de não achar nada.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-4-ordem-de-investigacao',
        type: 'order-steps',
        prompt: 'Coloque na ordem os passos para investigar um erro que você não entendeu de primeira.',
        concepts: ['terminal-erros'],
        difficulty: 'iniciante',
        tags: ['terminal', 'erros', 'processo'],
        steps: [
          { id: 'ler', text: 'Ler a mensagem de erro inteira, sem pular direto para tentar uma correção', ordem: 1 },
          { id: 'achar', text: 'Achar a primeira linha do stack que é do seu próprio código, não de uma biblioteca', ordem: 2 },
          { id: 'abrir', text: 'Abrir o arquivo nessa linha exata e conferir o que está ali', ordem: 3 },
          { id: 'reproduzir', text: 'Se ainda não fizer sentido, reproduzir o erro com o menor exemplo possível', ordem: 4 },
          { id: 'pesquisar', text: 'Pesquisar a mensagem de erro exata, entre aspas', ordem: 5 },
        ],
        explanation:
          'Pesquisar a mensagem antes de tentar entender o próprio código é uma aposta — funciona às vezes, mas pula o raciocínio que resolveria a maioria dos casos sem depender de encontrar alguém com o mesmo problema exato.',
        hints: ['O primeiro passo é sempre entender o que está na sua frente, antes de qualquer ação.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-4-stck-com-erro-de-digitacao',
        type: 'find-bug',
        prompt:
          'Esta função deveria devolver a primeira linha do stack de um erro, mas quebra ao rodar. Aponte a linha que precisa mudar.',
        concepts: ['terminal-erros'],
        difficulty: 'iniciante',
        tags: ['terminal', 'erros', 'bug'],
        code: `function resumoDoErro(erro) {
  const primeiraLinha = erro.stck.split('\\n')[0];
  return primeiraLinha.trim();
}

console.log(resumoDoErro(new Error('deu ruim')));`,
        buggyLine: 2,
        fix: "  const primeiraLinha = erro.stack.split('\\n')[0];",
        explanation:
          'A propriedade certa de um objeto `Error` chama-se `stack`, não `stck` — uma letra faltando. `erro.stck` não existe, vale `undefined`, e chamar `.split` nele lança "Cannot read properties of undefined". Um erro de digitação no nome de uma propriedade só aparece quando a linha de fato roda.',
        hints: [
          'O erro é sobre chamar um método numa propriedade que não existe. Releia o nome da propriedade lida de `erro`, letra por letra.',
          'Todo objeto `Error` tem uma propriedade `stack` com o texto do stack trace inteiro.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Código de saída \`0\` é sucesso; qualquer outro é falha. Um stack trace lista de onde o erro foi lançado até quem chamou por cima — a primeira linha do seu próprio código (não de uma biblioteca) é o ponto certo para começar a investigar, e a mensagem inteira vale mais que só a primeira linha dela.

Na última aula da trilha, juntando tudo: diagnosticar por que um comando falhou, combinando código de saída, stack trace e variável de ambiente.
`.trim(),
    },
  ],
};

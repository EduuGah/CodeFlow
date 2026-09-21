import type { Lesson } from '../types';

export const lessonGitConflitoSemPanico: Lesson = {
  id: 'lesson-git-4',
  trackId: 'track-git',
  title: 'Conflito Sem Pânico',
  language: 'javascript',
  objective:
    'Entender por que um conflito de merge acontece, ler os marcadores de conflito, e resolver combinando as duas intenções em vez de escolher uma às cegas.',
  concepts: ['git-conflito'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um conflito de merge assusta quem nunca viu um — a tela cheia de símbolos estranhos parece um erro grave. Não é: é o Git dizendo "duas pessoas mudaram a mesma coisa, e eu não sei qual das duas versões você quer — decida você". É o esperado, de vez em quando, quando várias pessoas trabalham no mesmo projeto. Não é sinal de que alguém fez algo errado.

## Por que um conflito nasce

O Git junta duas branches automaticamente na maior parte do tempo, porque a maioria das mudanças acontece em partes diferentes do arquivo. O conflito aparece quando as duas branches mudaram **a mesma linha** (ou uma editou uma linha que a outra apagou) de jeitos diferentes: o Git não tem como adivinhar qual das duas você quer, ou se quer as duas, combinadas.

## Os marcadores

Quando o Git não consegue decidir sozinho, ele escreve **as duas versões**, no meio do arquivo, entre marcadores:

~~~
<<<<<<< HEAD
function calcularFrete(pedido) {
  return pedido.peso * 2.5;
}
=======
function calcularFrete(pedido) {
  if (!pedido.cep) throw new Error('CEP obrigatório');
  return pedido.peso * 2.5;
}
>>>>>>> fix/frete-cep-vazio
~~~

- \`<<<<<<< HEAD\` até \`=======\`: a versão da branch em que você está agora.
- \`=======\` até \`>>>>>>> nome-da-outra-branch\`: a versão que está sendo incorporada.

O arquivo **não roda** enquanto os marcadores estiverem lá — eles não são JavaScript válido. Isso é intencional: o Git força você a resolver antes de continuar.

## Resolver é entender as duas intenções

O erro mais comum é apagar um lado sem ler o outro, "para o arquivo compilar de novo". Isso descarta silenciosamente uma mudança que alguém fez por um motivo. O caminho certo:

1. Leia as duas versões e entenda **por que cada uma existe**.
2. Decida o resultado: às vezes é uma das duas, às vezes é uma combinação das duas.
3. Escreva esse resultado no lugar das duas versões.
4. Apague os três marcadores (\`<<<<<<<\`, \`=======\`, \`>>>>>>>\`) — nenhum deles pode sobrar.
5. Rode os testes antes de considerar resolvido. Um conflito resolvido errado ainda "parece" resolvido — o arquivo compila, mas o comportamento pode estar quebrado.
6. Registre um commit da resolução.

No exemplo acima, a versão certa provavelmente combina as duas: a validação de CEP **e** o cálculo do frete continuam existindo juntos — não é escolher uma branch, é juntar as duas intenções.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Um arquivo com marcadores de conflito, como texto.
const arquivoComConflito = \`function saudacao(nome) {
<<<<<<< HEAD
  return 'Olá, ' + nome + '!';
=======
  return 'Oi, ' + nome + '! Bem-vindo.';
>>>>>>> feature/boas-vindas
}\`;

function temMarcadoresDeConflito(texto) {
  return texto.includes('<<<<<<<');
}`,
      caption:
        'O texto entre `<<<<<<<` e `=======` é a versão local; entre `=======` e `>>>>>>>` é a versão que está sendo incorporada. Nenhum dos dois é o arquivo final — os dois precisam virar um só.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-4-por-que-conflito',
        type: 'multiple-choice',
        prompt: 'O que faz um conflito de merge acontecer?',
        concepts: ['git-conflito'],
        difficulty: 'iniciante',
        tags: ['git', 'conflito'],
        options: [
          'Duas branches mudaram a mesma linha (ou uma editou o que a outra apagou) de jeitos diferentes, e o Git não sabe qual versão manter',
          'Alguém cometeu um erro grave que precisa ser revertido',
          'O repositório está corrompido',
          'Duas pessoas mudaram arquivos completamente diferentes',
        ],
        correctIndex: 0,
        explanation:
          'Um conflito é uma decisão que o Git não pode tomar sozinho: quando a mesma linha muda de dois jeitos diferentes em duas branches, cabe a uma pessoa decidir o resultado. Mudanças em arquivos ou trechos diferentes juntam sozinhas, sem conflito nenhum — é exatamente por isso que a maioria dos merges nem aparece na tela.',
        hints: ['Pense no que o Git conseguiria decidir sozinho, e no que ele não teria como adivinhar.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-4-detectar',
        type: 'code',
        prompt:
          'Escreva `temMarcadoresDeConflito(texto)`: devolve `true` se o texto contém o marcador de início de conflito, `<<<<<<<` (sete sinais de "menor que").',
        concepts: ['git-conflito'],
        difficulty: 'iniciante',
        tags: ['git', 'conflito', 'strings'],
        initialCode: `function temMarcadoresDeConflito(texto) {
  return false;
}`,
        tests: [
          {
            description: 'Texto com marcador de conflito devolve true',
            assertion: `const r = temMarcadoresDeConflito('function f() {\\n<<<<<<< HEAD\\n  return 1;\\n=======\\n  return 2;\\n>>>>>>> outra\\n}');
if (r !== true) throw new Error('esperava true para um texto com conflito');`,
          },
          {
            description: 'Texto sem marcador devolve false',
            assertion: `const r = temMarcadoresDeConflito('function f() {\\n  return 1;\\n}');
if (r !== false) throw new Error('esperava false para um texto sem conflito');`,
          },
          {
            description: 'Só o marcador de fim, sem o de início, não conta como conflito não resolvido aqui',
            assertion: `const r = temMarcadoresDeConflito('>>>>>>> outra\\nfunction f() { return 1; }');
if (r !== false) throw new Error('esperava false quando não há o marcador de início <<<<<<<');`,
          },
        ],
        solution: `function temMarcadoresDeConflito(texto) {
  return texto.includes('<<<<<<<');
}`,
        hints: [
          '`String.prototype.includes` diz se um texto contém outro dentro.',
          'O marcador de início é sempre `<<<<<<<`, sete caracteres iguais.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-4-ordem-resolucao',
        type: 'order-steps',
        prompt: 'Coloque na ordem os passos para resolver um conflito de merge.',
        concepts: ['git-conflito'],
        difficulty: 'iniciante',
        tags: ['git', 'conflito', 'processo'],
        steps: [
          { id: 'ler', text: 'Ler as duas versões e entender por que cada uma existe', ordem: 1 },
          { id: 'decidir', text: 'Decidir o resultado — uma das duas versões, ou uma combinação das duas', ordem: 2 },
          { id: 'escrever', text: 'Escrever esse resultado no lugar das duas versões', ordem: 3 },
          { id: 'remover', text: 'Remover os três marcadores de conflito, sem deixar nenhum para trás', ordem: 4 },
          { id: 'testar', text: 'Rodar os testes para confirmar que a resolução funciona de verdade', ordem: 5 },
          { id: 'commitar', text: 'Registrar um commit com a resolução', ordem: 6 },
        ],
        explanation:
          'Testar depois de resolver — e antes de commitar — é o que separa "o arquivo compila" de "a resolução está certa": um arquivo sem marcadores ainda pode ter um comportamento errado se as duas intenções foram combinadas incorretamente.',
        hints: [
          'Decidir antes de entender as duas versões seria escolher às cegas — o que vem primeiro?',
          'Um passo confere que a resolução funciona de verdade, não só que o arquivo voltou a ser JavaScript válido.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-4-resolver',
        type: 'code',
        prompt:
          'Escreva `extrairVersaoLocal(texto)`: devolve só o texto entre `<<<<<<< HEAD` e `=======` (sem os marcadores, sem espaços nas pontas) — a versão que existia na sua branch antes do merge.',
        concepts: ['git-conflito'],
        difficulty: 'intermediario',
        tags: ['git', 'conflito'],
        initialCode: `function extrairVersaoLocal(texto) {
  return texto.trim();
}`,
        tests: [
          {
            description: 'Extrai só a versão local, sem os marcadores',
            assertion: `const texto = "<<<<<<< HEAD\\n  return 'Olá';\\n=======\\n  return 'Oi';\\n>>>>>>> outra";
const r = extrairVersaoLocal(texto);
if (r !== "return 'Olá';") throw new Error('esperava "return \\'Olá\\';", veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Funciona com várias linhas na versão local',
            assertion: `const texto = "<<<<<<< HEAD\\nlinha um\\nlinha dois\\n=======\\noutra versão\\n>>>>>>> outra";
const r = extrairVersaoLocal(texto);
if (r !== 'linha um\\nlinha dois') throw new Error('esperava as duas linhas locais, veio ' + JSON.stringify(r));`,
          },
        ],
        solution: `function extrairVersaoLocal(texto) {
  const inicio = texto.indexOf('\\n', texto.indexOf('<<<<<<<')) + 1;
  const fim = texto.indexOf('=======');
  return texto.slice(inicio, fim).trim();
}`,
        hints: [
          'Ache a posição do fim da linha `<<<<<<< HEAD` (o primeiro `\\n` depois dela) e a posição de `=======`.',
          '`texto.slice(inicio, fim).trim()` corta o miolo e tira as quebras de linha nas pontas.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-4-contar-conflitos',
        type: 'code',
        prompt: 'Escreva `contarConflitos(texto)`: devolve quantos conflitos existem num arquivo — um por bloco `<<<<<<<`.',
        concepts: ['git-conflito'],
        difficulty: 'iniciante',
        tags: ['git', 'conflito'],
        initialCode: `function contarConflitos(texto) {
  const marcadores = texto.match(/<<<<<<<|=======/g) || [];
  return marcadores.length;
}`,
        tests: [
          {
            description: 'Um arquivo com dois conflitos conta 2',
            assertion: `const texto = '<<<<<<< HEAD\\na\\n=======\\nb\\n>>>>>>> outra\\n<<<<<<< HEAD\\nc\\n=======\\nd\\n>>>>>>> outra';
const r = contarConflitos(texto);
if (r !== 2) throw new Error('esperava 2 conflitos, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Um arquivo sem conflito nenhum conta 0',
            assertion: `const r = contarConflitos('function f() {\\n  return 1;\\n}');
if (r !== 0) throw new Error('esperava 0 conflitos, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Um arquivo com um conflito só conta 1',
            assertion: `const texto = '<<<<<<< HEAD\\na\\n=======\\nb\\n>>>>>>> outra';
const r = contarConflitos(texto);
if (r !== 1) throw new Error('esperava 1 conflito, veio ' + JSON.stringify(r));`,
          },
        ],
        solution: `function contarConflitos(texto) {
  const marcadores = texto.match(/<<<<<<</g) || [];
  return marcadores.length;
}`,
        hints: [
          'Cada conflito tem exatamente um marcador de início e um de fim de cada tipo — contar os dois tipos juntos conta cada conflito duas vezes.',
          'Um único marcador basta para identificar o começo de cada conflito, sem risco de contar em dobro.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Um conflito nasce quando duas branches mudam a mesma linha de jeitos diferentes — o Git não decide sozinho, e escreve as duas versões entre marcadores (\`<<<<<<<\`, \`=======\`, \`>>>>>>>\`) para uma pessoa decidir.

Resolver é entender as duas intenções, escrever o resultado combinado, remover os três marcadores, e **testar antes de considerar resolvido** — um arquivo sem marcadores ainda pode estar errado.

Na próxima aula, o que um histórico bem cuidado ensina para quem vai ler depois — inclusive você, daqui a um ano.
`.trim(),
    },
  ],
};

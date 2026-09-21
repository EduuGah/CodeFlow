import type { Lesson } from '../types';

export const lessonTerminalShellECaminhos: Lesson = {
  id: 'lesson-terminal-1',
  trackId: 'track-terminal',
  title: 'O Shell e o Caminho',
  language: 'javascript',
  objective:
    'Entender o que um shell faz, a diferença entre caminho absoluto e relativo, e resolver um caminho relativo a partir de onde você está.',
  concepts: ['terminal-shell'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
O terminal é uma janela de texto; o **shell** é o programa que roda dentro dela, lendo o que você digita e executando como comando. Ele sempre tem um **diretório atual** — a pasta onde ele "está" agora — e é em relação a ela que a maioria dos comandos faz sentido.

## Os três comandos que você usa o tempo todo

- \`pwd\` (*print working directory*): mostra o diretório atual.
- \`cd caminho\` (*change directory*): muda o diretório atual para \`caminho\`.
- \`ls\` (*list*): lista o que existe dentro do diretório atual.

Praticamente toda sessão de terminal é uma sequência desses três: olhar onde está, olhar o que tem, e se mover.

## Caminho absoluto e caminho relativo

Um **caminho absoluto** começa na raiz do sistema de arquivos (\`/\`, no Linux e no macOS) e não depende de onde você está — \`/home/ana/projeto/src\` sempre aponta para o mesmo lugar, de qualquer diretório.

Um **caminho relativo** parte de onde você está agora. Se o diretório atual é \`/home/ana/projeto\`, o caminho relativo \`src\` aponta para \`/home/ana/projeto/src\` — mas o mesmo \`src\`, digitado de outro diretório, aponta para outro lugar completamente diferente.

Três símbolos especiais aparecem nos caminhos relativos:

- \`.\` — o diretório atual. \`./script.sh\` é o mesmo que \`script.sh\`.
- \`..\` — o diretório **pai**, um nível acima. De \`/home/ana/projeto/src\`, \`..\` é \`/home/ana/projeto\`.
- \`~\` — a pasta pessoal do usuário (\`/home/ana\`, por exemplo), um atalho que funciona de qualquer lugar.

## Por que isso importa em código, não só no terminal

A mesma lógica de caminho absoluto e relativo já apareceu na trilha de Engenharia: \`require('./precos')\` é um caminho relativo — resolvido a partir de onde o arquivo que faz o \`require\` está, não de onde você rodou o comando. Entender como um caminho relativo se resolve no terminal é a mesma habilidade que entender como ele se resolve dentro do código.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Resolver um caminho relativo é juntar o diretório atual com o caminho,
// e processar "." e ".." depois.
function resolverCaminho(cwd, caminho) {
  if (caminho.startsWith('/')) return caminho; // já é absoluto

  const partes = (cwd + '/' + caminho).split('/').filter(Boolean);
  const resultado = [];
  for (const parte of partes) {
    if (parte === '.') continue;
    if (parte === '..') resultado.pop();
    else resultado.push(parte);
  }
  return '/' + resultado.join('/');
}

resolverCaminho('/home/ana/projeto', 'src'); // '/home/ana/projeto/src'
resolverCaminho('/home/ana/projeto/src', '..'); // '/home/ana/projeto'`,
      caption:
        '`..` remove o último segmento já acumulado — a mesma ideia de "subir um nível" que `cd ..` faz no terminal de verdade.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-1-ponto-ponto',
        type: 'multiple-choice',
        prompt: 'Você está em `/home/ana/projeto/src`. O que `cd ..` faz?',
        concepts: ['terminal-shell'],
        difficulty: 'iniciante',
        tags: ['terminal', 'caminhos'],
        options: [
          'Move para `/home/ana/projeto` — um nível acima do diretório atual',
          'Move para `/home/ana` — a pasta pessoal',
          'Não faz nada, porque `..` não é um comando válido',
          'Apaga o diretório atual',
        ],
        correctIndex: 0,
        explanation:
          '`..` sempre significa "um nível acima de onde estou agora" — o diretório pai direto, não a pasta pessoal nem qualquer outro lugar fixo.',
        hints: ['`..` é relativo a onde você está, não um destino fixo.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-1-absoluto-ou-relativo',
        type: 'multiple-choice',
        prompt: 'Qual destes é um caminho absoluto?',
        concepts: ['terminal-shell'],
        difficulty: 'iniciante',
        tags: ['terminal', 'caminhos'],
        options: [
          '/home/ana/projeto/src/app.js',
          'src/app.js',
          './app.js',
          '../projeto/app.js',
        ],
        correctIndex: 0,
        explanation:
          'Só o primeiro começa na raiz (`/`) e aponta para o mesmo lugar de qualquer diretório atual. Os outros três dependem de onde você está quando os usa — todos são relativos.',
        hints: ['Um caminho absoluto não muda de significado dependendo de onde você está. Qual das opções tem essa propriedade?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-1-resolver',
        type: 'code',
        prompt:
          'Escreva `resolverCaminho(cwd, caminho)`: se `caminho` começa com `/`, devolva-o como está (já é absoluto); senão, junte `cwd` e `caminho`, e resolva os segmentos `.` (ignorar) e `..` (remover o segmento anterior).',
        concepts: ['terminal-shell'],
        difficulty: 'intermediario',
        tags: ['terminal', 'caminhos', 'strings'],
        initialCode: `function resolverCaminho(cwd, caminho) {
  return cwd + '/' + caminho;
}`,
        tests: [
          {
            description: 'Caminho relativo simples junta com o diretório atual',
            assertion: `const r = resolverCaminho('/home/ana/projeto', 'src');
if (r !== '/home/ana/projeto/src') throw new Error('esperava /home/ana/projeto/src, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Caminho absoluto não muda',
            assertion: `const r = resolverCaminho('/home/ana', '/etc/config');
if (r !== '/etc/config') throw new Error('esperava /etc/config, veio ' + JSON.stringify(r));`,
          },
          {
            description: '".." sobe um nível',
            assertion: `const r = resolverCaminho('/home/ana/projeto/src', '..');
if (r !== '/home/ana/projeto') throw new Error('esperava /home/ana/projeto, veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Combinação de "." e ".." no meio do caminho',
            assertion: `const r = resolverCaminho('/home/ana/projeto', './src/../lib');
if (r !== '/home/ana/projeto/lib') throw new Error('esperava /home/ana/projeto/lib, veio ' + JSON.stringify(r));`,
          },
        ],
        solution: `function resolverCaminho(cwd, caminho) {
  if (caminho.startsWith('/')) return caminho;

  const partes = (cwd + '/' + caminho).split('/').filter(Boolean);
  const resultado = [];
  for (const parte of partes) {
    if (parte === '.') continue;
    if (parte === '..') resultado.pop();
    else resultado.push(parte);
  }
  return '/' + resultado.join('/');
}`,
        hints: [
          'Primeiro trate o caso absoluto: se `caminho` já começa com `/`, devolva-o sem tocar em nada.',
          'Junte `cwd` e `caminho` com `/`, separe por `/` (`.filter(Boolean)` tira os pedaços vazios), e percorra: `..` remove o último acumulado (`pop`), `.` é ignorado, qualquer outra coisa é acumulada.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-1-navegar',
        type: 'order-steps',
        prompt:
          'Você está em `/home/ana`. Coloque na ordem os comandos para chegar até `/home/ana/projeto/src` e listar o que tem lá.',
        concepts: ['terminal-shell'],
        difficulty: 'iniciante',
        tags: ['terminal', 'caminhos'],
        steps: [
          { id: 'cd-projeto', text: '`cd projeto` — entra na pasta do projeto', ordem: 1 },
          { id: 'cd-src', text: '`cd src` — entra na pasta do código-fonte, dentro do projeto', ordem: 2 },
          { id: 'ls', text: '`ls` — lista o que existe no diretório atual', ordem: 3 },
        ],
        explanation:
          'Cada `cd` é relativo a onde você já está: depois do primeiro `cd projeto`, o diretório atual passou a ser `/home/ana/projeto`, e é dali que `cd src` parte — não seria possível fazer os dois `cd` na ordem inversa e chegar ao mesmo lugar.',
        hints: ['Cada comando parte de onde o anterior deixou você — a ordem entre os dois `cd` importa.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-1-juntar-barra-dupla',
        type: 'find-bug',
        prompt:
          'Esta função deveria juntar um diretório e um nome de arquivo com uma única barra entre eles, mas quebra ao rodar. Aponte a linha que precisa mudar.',
        concepts: ['terminal-shell'],
        difficulty: 'iniciante',
        tags: ['terminal', 'caminhos', 'bug'],
        code: `function juntarCaminho(diretorio, arquivo) {
  return diretorio + '/' + arquivo.trim().toUpperCase().charAt(0).lowercase();
}

console.log(juntarCaminho('/home/ana', 'notas.txt'));`,
        buggyLine: 2,
        fix: "  return diretorio + '/' + arquivo;",
        explanation:
          'A função tenta uma cadeia de chamadas para "normalizar" o nome do arquivo, mas `lowercase` não existe como método de string — o certo seria `toLowerCase`, e mesmo assim toda essa cadeia reduziria o nome a uma única letra (`charAt(0)`), nada parecido com o objetivo. A função não precisa mexer no nome do arquivo: só juntar os dois pedaços com uma barra.',
        hints: [
          'O erro é sobre chamar algo que não é uma função. Releia a cadeia de chamadas depois de `arquivo`, uma por uma.',
          'A função só precisa concatenar `diretorio`, uma barra, e `arquivo` — nada mais.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
O shell sempre tem um diretório atual; \`pwd\` mostra, \`cd\` muda, \`ls\` lista. Um caminho **absoluto** começa em \`/\` e aponta para o mesmo lugar sempre; um **relativo** parte de onde você está — e \`.\`, \`..\` e \`~\` são os atalhos mais comuns dentro dele.

A mesma lógica de resolução vale para \`require('./x')\` dentro do código, não só para comandos no terminal.

Na próxima aula, o que configura um programa sem tocar no código dele: as **variáveis de ambiente**.
`.trim(),
    },
  ],
};

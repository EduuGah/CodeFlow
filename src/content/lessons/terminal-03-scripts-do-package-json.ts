import type { Lesson } from '../types';

export const lessonTerminalScriptsDoPackageJson: Lesson = {
  id: 'lesson-terminal-3',
  trackId: 'track-terminal',
  title: 'Scripts do package.json na Prática',
  language: 'javascript',
  objective:
    'Entender como `npm run` encontra e roda um script, como os hooks `pre`/`post` se encaixam sozinhos, e como `&&` encadeia comandos que dependem do sucesso um do outro.',
  concepts: ['terminal-scripts'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
O campo \`scripts\` do \`package.json\` (já visto na trilha de Engenharia, na aula sobre dependências) guarda um mapa de nome para comando:

~~~json
{
  "scripts": {
    "test": "vitest run",
    "build": "vite build",
    "lint": "eslint src"
  }
}
~~~

\`npm run test\` procura \`test\` nesse mapa e roda o comando associado, \`vitest run\`. (\`start\` e \`test\` têm um atalho: \`npm test\` funciona sem o \`run\`.)

## Por que guardar o comando, em vez de digitá-lo

\`vitest run --coverage --reporter=verbose\` é comprido, fácil de digitar errado, e cada pessoa do time lembraria (ou não) das mesmas opções. Um script guarda o comando certo **uma vez**, versionado junto com o código — todo mundo roda \`npm test\` e recebe o mesmo comando, sem precisar lembrar dos detalhes.

## Os hooks pre e post

O \`npm\` reconhece um padrão de nome: se existir um script chamado \`pre<nome>\`, ele roda **antes** de \`<nome>\`; se existir \`post<nome>\`, roda **depois** — sem precisar chamar nenhum dos dois explicitamente:

~~~json
{
  "scripts": {
    "pretest": "eslint src",
    "test": "vitest run",
    "posttest": "echo 'testes concluídos'"
  }
}
~~~

\`npm run test\` roda os três, na ordem: \`pretest\`, depois \`test\`, depois \`posttest\`. Se \`pretest\` falhar, o \`npm\` para ali — \`test\` nunca chega a rodar.

## Encadear com &&

Dentro de um único script, \`&&\` roda o próximo comando **só se** o anterior teve sucesso (código de saída zero):

~~~json
{
  "scripts": {
    "verificar": "npm run lint && npm test && npm run build"
  }
}
~~~

Se \`lint\` falhar, nem \`test\` nem \`build\` chegam a rodar — é a mesma lógica dos hooks \`pre\`/\`post\`, mas escrita explicitamente. \`;\` (ponto e vírgula), em contraste, roda o próximo comando de qualquer jeito, dando certo ou não o anterior — raramente é o que se quer numa sequência de verificações.

## Passando argumentos extras com --

\`npm run test -- --watch\` roda o script \`test\` (\`vitest run\`, por exemplo) e **acrescenta** \`--watch\` no fim do comando de verdade — como se você tivesse escrito \`vitest run --watch\` direto no terminal.

~~~
npm run test -- --watch
                 └────┘
                 vai depois do comando do script, não substitui nada
~~~

O \`--\` sozinho é o sinal: tudo **antes** dele é argumento do \`npm\`; tudo **depois** é repassado para o comando do script, sem o \`npm\` tentar interpretar nada. Sem o \`--\`, \`npm run test --watch\` tentaria passar \`--watch\` como opção do próprio \`npm\`, não do \`vitest\` — e na maioria das vezes isso não faz o que parece que faria.

\`npm run\`, sem nenhum nome depois, também tem um uso à parte: lista todos os scripts disponíveis no \`package.json\` — útil quando você chega num projeto novo e não sabe o que já existe.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Os scripts de um package.json, como um objeto comum.
const scripts = {
  pretest: 'eslint src',
  test: 'vitest run',
  posttest: "echo 'ok'",
  build: 'vite build',
};

function scriptsNaOrdem(nome, scripts) {
  const ordem = [];
  if (scripts['pre' + nome]) ordem.push(scripts['pre' + nome]);
  ordem.push(scripts[nome]);
  if (scripts['post' + nome]) ordem.push(scripts['post' + nome]);
  return ordem;
}

scriptsNaOrdem('test', scripts);  // ['eslint src', 'vitest run', "echo 'ok'"]
scriptsNaOrdem('build', scripts); // ['vite build'] — sem hooks, só o script`,
      caption:
        'Os hooks só entram na lista quando de fato existem — um script sem `pre` ou `post` associado roda sozinho.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-3-npm-run',
        type: 'multiple-choice',
        prompt: 'O `package.json` tem `"scripts": { "build": "vite build" }`. O que `npm run build` faz?',
        concepts: ['terminal-scripts'],
        difficulty: 'iniciante',
        tags: ['terminal', 'scripts'],
        options: [
          'Procura "build" no mapa de scripts e roda o comando associado, `vite build`',
          'Instala o pacote chamado "build"',
          'Cria um novo script chamado "build"',
          'Roda todos os scripts do projeto, um atrás do outro',
        ],
        correctIndex: 0,
        explanation:
          '`npm run <nome>` é uma busca seguida de execução: procura `<nome>` como chave em `scripts`, e roda o valor associado como se fosse digitado direto no terminal.',
        hints: ['O "run" no comando é literal: ele roda algo que já está escrito em algum lugar.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-3-ordem-dos-hooks',
        type: 'multiple-choice',
        prompt:
          'O `package.json` tem `pretest`, `test` e `posttest`. Ao rodar `npm test`, em que ordem eles executam?',
        concepts: ['terminal-scripts'],
        difficulty: 'iniciante',
        tags: ['terminal', 'scripts'],
        options: [
          'pretest, depois test, depois posttest',
          'test, depois pretest, depois posttest',
          'posttest, depois pretest, depois test',
          'Todos ao mesmo tempo, em paralelo',
        ],
        correctIndex: 0,
        explanation:
          'O `npm` reconhece o prefixo `pre` como "antes" e `post` como "depois" do script de mesmo nome — sempre nessa ordem, e sempre em sequência, nunca em paralelo.',
        hints: ['Os prefixos "pre" e "post" já dizem a posição relativa ao script principal.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-3-scripts-na-ordem',
        type: 'code',
        prompt:
          'Escreva `scriptsNaOrdem(nome, scripts)`: devolve um array com os comandos a rodar, na ordem — `pre<nome>` (se existir), depois `scripts[nome]`, depois `post<nome>` (se existir). Hooks que não existem não entram no array.',
        concepts: ['terminal-scripts'],
        difficulty: 'intermediario',
        tags: ['terminal', 'scripts'],
        initialCode: `function scriptsNaOrdem(nome, scripts) {
  return [scripts['pre' + nome], scripts[nome], scripts['post' + nome]];
}`,
        tests: [
          {
            description: 'Com os dois hooks, os três comandos entram na ordem certa',
            assertion: `const r = scriptsNaOrdem('test', { pretest: 'lint', test: 'vitest', posttest: 'coverage' });
if (JSON.stringify(r) !== JSON.stringify(['lint', 'vitest', 'coverage'])) throw new Error('esperava ["lint","vitest","coverage"], veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Sem nenhum hook, só o script principal entra',
            assertion: `const r = scriptsNaOrdem('build', { build: 'vite build' });
if (JSON.stringify(r) !== JSON.stringify(['vite build'])) throw new Error('esperava ["vite build"], veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Só com o hook de depois, o de antes não aparece',
            assertion: `const r = scriptsNaOrdem('test', { test: 'vitest', posttest: 'coverage' });
if (JSON.stringify(r) !== JSON.stringify(['vitest', 'coverage'])) throw new Error('esperava ["vitest","coverage"], veio ' + JSON.stringify(r));`,
          },
        ],
        solution: `function scriptsNaOrdem(nome, scripts) {
  const ordem = [];
  if (scripts['pre' + nome]) ordem.push(scripts['pre' + nome]);
  ordem.push(scripts[nome]);
  if (scripts['post' + nome]) ordem.push(scripts['post' + nome]);
  return ordem;
}`,
        hints: [
          'Monte um array vazio e vá acrescentando: primeiro cheque se `scripts["pre" + nome]` existe antes de acrescentar.',
          'O script principal (`scripts[nome]`) sempre entra; os hooks só entram quando existem de verdade — teste com `if` antes de dar `push`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-3-encadeamento',
        type: 'predict-output',
        prompt:
          'Este programa simula `npm run lint && npm test && npm run build`, onde `test` falha. O que ele imprime?',
        concepts: ['terminal-scripts'],
        difficulty: 'intermediario',
        tags: ['terminal', 'scripts'],
        code: `function rodar(nome, sucesso) {
  console.log('rodando ' + nome);
  return sucesso;
}

function encadear(passos) {
  for (const passo of passos) {
    const ok = rodar(passo.nome, passo.sucesso);
    if (!ok) {
      console.log('parou em ' + passo.nome);
      return;
    }
  }
  console.log('tudo certo');
}

encadear([
  { nome: 'lint', sucesso: true },
  { nome: 'test', sucesso: false },
  { nome: 'build', sucesso: true },
]);`,
        expectedOutput: `rodando lint
rodando test
parou em test`,
        explanation:
          '`&&` para na primeira falha: `lint` roda e passa, `test` roda e falha, e `build` nunca chega a rodar — exatamente como `npm run lint && npm test && npm run build` se comportaria de verdade.',
        hints: ['O laço para assim que `ok` é falso — o que vem depois na lista nunca é alcançado.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-3-comando-inexistente',
        type: 'find-bug',
        prompt:
          'Esta função deveria devolver o comando de um script pelo nome, mas quebra ao rodar. Aponte a linha que precisa mudar.',
        concepts: ['terminal-scripts'],
        difficulty: 'iniciante',
        tags: ['terminal', 'scripts', 'bug'],
        code: `function comandoDoScript(scripts, nome) {
  return scripts[nome].trim();
}

console.log(comandoDoScript({ build: 'vite build' }, 'deploy'));`,
        buggyLine: 2,
        fix: "  return scripts[nome] ? scripts[nome].trim() : null;",
        explanation:
          'O `package.json` de teste não tem um script chamado "deploy" — `scripts["deploy"]` vale `undefined`, e chamar `.trim()` nele lança "Cannot read properties of undefined". Assim como uma variável de ambiente pode não existir, um script pedido pelo nome também pode não existir — a função precisa checar antes de assumir que o valor está lá.',
        hints: [
          'A função assume que todo nome pedido existe em `scripts`. O que acontece quando não existe?',
          'Confira se `scripts[nome]` está definido antes de chamar um método nele.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-3-dois-tracos',
        type: 'multiple-choice',
        prompt:
          'O `package.json` tem `"scripts": { "test": "vitest run" }`. Você quer rodar os testes em modo observador (a opção `--watch` do vitest). Qual comando faz isso?',
        concepts: ['terminal-scripts'],
        difficulty: 'intermediario',
        tags: ['terminal', 'scripts'],
        options: [
          '`npm run test -- --watch`',
          '`npm run test --watch`',
          '`npm --watch run test`',
          'Não dá para passar opções extras para um script do npm',
        ],
        correctIndex: 0,
        explanation:
          'O `--` marca onde terminam os argumentos do `npm` e começam os do comando de verdade — tudo depois dele é repassado sem interpretação, então `vitest run` recebe `--watch` como se tivesse sido digitado ali. Sem o `--`, o `npm` tentaria entender `--watch` como opção dele mesmo, não do vitest.',
        hints: ['Existe um sinal específico que separa "argumentos do npm" de "argumentos do comando do script".'],
      },
    },
    {
      kind: 'summary',
      markdown: `
Um script guarda um comando uma vez, para todo o time rodar igual. \`pre<nome>\` e \`post<nome>\` entram sozinhos, antes e depois; \`&&\` encadeia comandos que só continuam se o anterior teve sucesso, e para na primeira falha. \`npm run <nome> -- <opções>\` repassa argumentos extras para o comando de verdade — tudo depois do \`--\` vai direto, sem o \`npm\` tentar interpretar.

Na próxima aula, o que ler quando um desses comandos falha de verdade: a **saída de erro**.
`.trim(),
    },
  ],
};

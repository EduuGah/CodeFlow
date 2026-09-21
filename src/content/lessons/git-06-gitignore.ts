import type { Lesson } from '../types';

export const lessonGitGitignore: Lesson = {
  id: 'lesson-git-6',
  trackId: 'track-git',
  title: 'O Que Não Entra no Repositório',
  language: 'javascript',
  objective:
    'Reconhecer o que não deveria ser versionado (gerado, secreto, específico de máquina), escrever padrões de `.gitignore`, e saber o que fazer quando um segredo já foi commitado por engano.',
  concepts: ['git-gitignore'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Nem tudo que existe na pasta de um projeto é código-fonte. Alguma coisa ali é **gerada** a partir do código (a pasta \`dist\`, o \`node_modules\`), alguma coisa é **secreta** (chaves de API, senhas de banco), e alguma coisa é **da sua máquina**, não do projeto (\`.DS_Store\`, as configurações do seu editor). Nenhuma dessas três categorias deveria ir para o repositório.

## Por que não versionar o que é gerado

\`node_modules\` pode ter dezenas de milhares de arquivos, reconstruídos a qualquer momento com \`npm install\` a partir do \`package.json\`. Versionar isso infla o repositório sem necessidade e cria conflitos de merge em arquivos que ninguém escreveu manualmente. O mesmo vale para uma pasta \`dist\` ou \`build\`: é o resultado de rodar o build, não a fonte da verdade — versionar as duas coisas junto (o código-fonte e o gerado a partir dele) é redundante e, pior, pode fazer alguém confiar num \`dist\` desatualizado.

## Por que não versionar segredos

Uma chave de API, uma senha de banco, um token de acesso: nada disso deveria estar em texto no repositório, porque **todo mundo com acesso ao repositório passa a ter acesso ao segredo** — inclusive, se o repositório for público ou vazar, qualquer pessoa. A prática correta é ler esses valores de variáveis de ambiente (um arquivo \`.env\`, por exemplo), e colocar o **arquivo** \`.env\` no \`.gitignore\` — só o formato (\`.env.example\`, sem valores reais) é versionado.

## \`.gitignore\`: padrões, não uma lista de arquivos

O arquivo \`.gitignore\`, na raiz do projeto, lista **padrões** que o Git para de rastrear:

~~~
node_modules/
dist/
.env
*.log
.DS_Store
~~~

- Um nome exato (\`.env\`) ignora esse arquivo específico.
- Um nome terminado em \`/\` (\`node_modules/\`) ignora a pasta inteira, com tudo dentro.
- Um \`*\` no começo (\`*.log\`) ignora qualquer arquivo com aquela extensão, em qualquer lugar do projeto.

## Um segredo já commitado não se resolve só com \`.gitignore\`

Colocar \`.env\` no \`.gitignore\` **depois** de já ter commitado uma chave de verdade não apaga a chave: ela continua em algum commit do histórico, e se o repositório já foi enviado a um servidor remoto (\`git push\`), pode já ter sido baixado por outra pessoa ou até indexado por um serviço automático que varre repositórios em busca de chaves expostas. O \`.gitignore\` evita o problema **daqui para frente**; o problema que já aconteceu se resolve **trocando a chave** — gerando uma nova e invalidando a antiga. Reescrever o histórico para tirar o commit é possível, mas não é suficiente sozinho: só a troca da chave garante que ela parou de funcionar para quem a viu.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Um casador de padrões simplificado, do jeito que o .gitignore funciona.
function correspondeAoPadrao(caminho, padrao) {
  if (padrao.endsWith('/')) return caminho.startsWith(padrao);
  if (padrao.startsWith('*.')) return caminho.endsWith(padrao.slice(1));
  return caminho === padrao;
}

correspondeAoPadrao('node_modules/react/index.js', 'node_modules/'); // true
correspondeAoPadrao('debug.log', '*.log'); // true
correspondeAoPadrao('src/app.js', 'node_modules/'); // false`,
      caption:
        'Três formas de padrão: pasta inteira (termina em `/`), extensão (começa com `*.`), e nome exato — as mais comuns num `.gitignore` real.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-6-o-que-ignorar',
        type: 'multiple-choice',
        prompt: 'Qual destes arquivos NÃO deveria estar no `.gitignore` — ou seja, deveria ser versionado?',
        concepts: ['git-gitignore'],
        difficulty: 'iniciante',
        tags: ['git', 'gitignore'],
        options: [
          'src/frete.js — o código-fonte que implementa uma regra de negócio',
          'node_modules/ — as dependências instaladas pelo npm',
          '.env — as chaves de API e senhas do ambiente local',
          'dist/ — o resultado compilado, gerado a partir do código-fonte',
        ],
        correctIndex: 0,
        explanation:
          'Código-fonte é exatamente o que o repositório existe para guardar. Os outros três são gerados (`node_modules`, `dist`, reconstruíveis a qualquer momento) ou secretos (`.env`) — nenhum dos dois deveria ser versionado.',
        hints: ['Pergunte: isso é a fonte da verdade, ou pode ser reconstruído / é específico da minha máquina?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-6-segredo-vazou',
        type: 'multiple-choice',
        prompt:
          'Você commitou (e já deu `git push`) um arquivo com uma chave de API de verdade. Adicionou `.env` ao `.gitignore` na hora. O que MAIS precisa ser feito?',
        concepts: ['git-gitignore'],
        difficulty: 'intermediario',
        tags: ['git', 'gitignore', 'seguranca'],
        options: [
          'Trocar a chave (gerar uma nova e invalidar a antiga) — a antiga continua no histórico e pode já ter sido vista',
          'Nada; o `.gitignore` já impede que a chave seja lida a partir de agora',
          'Só apagar o arquivo do commit mais recente, sem mexer no histórico nem na chave',
          'Renomear o arquivo de `.env` para outro nome',
        ],
        correctIndex: 0,
        explanation:
          'O `.gitignore` impede commits futuros com aquele arquivo — não apaga o que já está no histórico, e um `push` significa que a versão com a chave pode já estar em outro computador, ou indexada por um serviço automático. A única forma de garantir que a chave parou de funcionar é trocá-la.',
        hints: ['O `.gitignore` age só sobre o que ainda não foi commitado. O que já foi enviado, ele não alcança.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-6-corresponde',
        type: 'code',
        prompt:
          'Escreva `correspondeAoPadrao(caminho, padrao)`, um casador de padrões simplificado de `.gitignore`: se `padrao` termina com `/`, verdadeiro quando `caminho` começa com `padrao` (uma pasta inteira); se `padrao` começa com `*.`, verdadeiro quando `caminho` termina com o resto do padrão (uma extensão); senão, verdadeiro só quando são exatamente iguais.',
        concepts: ['git-gitignore'],
        difficulty: 'intermediario',
        tags: ['git', 'gitignore', 'strings'],
        initialCode: `function correspondeAoPadrao(caminho, padrao) {
  return caminho === padrao;
}`,
        tests: [
          {
            description: 'Padrão de pasta ignora qualquer coisa dentro dela',
            assertion: `const r = correspondeAoPadrao('node_modules/react/index.js', 'node_modules/');
if (r !== true) throw new Error('esperava true: o arquivo está dentro de node_modules/');`,
          },
          {
            description: 'Padrão de pasta não afeta arquivos fora dela',
            assertion: `const r = correspondeAoPadrao('src/app.js', 'node_modules/');
if (r !== false) throw new Error('esperava false: src/app.js não está em node_modules/');`,
          },
          {
            description: 'Padrão de extensão ignora qualquer arquivo com aquele final',
            assertion: `const r = correspondeAoPadrao('debug.log', '*.log');
if (r !== true) throw new Error('esperava true: debug.log termina em .log');`,
          },
          {
            description: 'Padrão de extensão não confunde um nome parecido',
            assertion: `const r = correspondeAoPadrao('debug.log.txt', '*.log');
if (r !== false) throw new Error('esperava false: debug.log.txt não termina em .log');`,
          },
          {
            description: 'Nome exato só bate com o mesmo caminho',
            assertion: `const r = correspondeAoPadrao('.env', '.env');
if (r !== true) throw new Error('esperava true: mesmo nome exato');`,
          },
        ],
        solution: `function correspondeAoPadrao(caminho, padrao) {
  if (padrao.endsWith('/')) return caminho.startsWith(padrao);
  if (padrao.startsWith('*.')) return caminho.endsWith(padrao.slice(1));
  return caminho === padrao;
}`,
        hints: [
          'Trate os dois casos especiais primeiro (pasta e extensão), e deixe a comparação exata por último, como padrão.',
          '`padrao.endsWith(\'/\')` mais `caminho.startsWith(padrao)` resolve a pasta; `padrao.startsWith(\'*.\')` mais `caminho.endsWith(padrao.slice(1))` resolve a extensão.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-6-ordem-remover',
        type: 'order-steps',
        prompt:
          'Um arquivo que deveria ter sido ignorado já foi commitado várias vezes. Coloque na ordem os passos para parar de rastreá-lo sem apagá-lo do disco de ninguém.',
        concepts: ['git-gitignore'],
        difficulty: 'intermediario',
        tags: ['git', 'gitignore', 'processo'],
        steps: [
          { id: 'padrao', text: 'Adicionar o padrão do arquivo ao `.gitignore`', ordem: 1 },
          { id: 'destrackear', text: 'Remover o arquivo do índice do Git, mantendo-o no disco (`git rm --cached`)', ordem: 2 },
          { id: 'commitar', text: 'Registrar um commit com essa remoção e a mudança no `.gitignore`', ordem: 3 },
          { id: 'avisar', text: 'Avisar a equipe, porque quem já tinha o arquivo rastreado localmente pode reintroduzi-lo sem perceber', ordem: 4 },
        ],
        explanation:
          'Adicionar ao `.gitignore` sozinho não tira um arquivo que já está rastreado — o Git continua acompanhando o que já conhece. `git rm --cached` é o passo que de fato para de rastrear, mantendo o arquivo físico intacto para quem precisa dele localmente (como um `.env` com valores da própria máquina).',
        hints: [
          'O `.gitignore` sozinho não afeta arquivos que o Git já está rastreando — falta um passo específico para isso.',
          'O arquivo continua sendo útil localmente (pense num `.env`); só o rastreamento pelo Git deveria parar.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-6-predizer-ignorados',
        type: 'predict-output',
        prompt: 'Com estes padrões, quais dos cinco caminhos abaixo o programa marca como "ignorado"? O que ele imprime?',
        concepts: ['git-gitignore'],
        difficulty: 'intermediario',
        tags: ['git', 'gitignore'],
        code: `function correspondeAoPadrao(caminho, padrao) {
  if (padrao.endsWith('/')) return caminho.startsWith(padrao);
  if (padrao.startsWith('*.')) return caminho.endsWith(padrao.slice(1));
  return caminho === padrao;
}

const padroes = ['node_modules/', '*.log', '.env'];
const caminhos = ['node_modules/react/index.js', 'src/app.js', 'debug.log', '.env', 'README.md'];

for (const caminho of caminhos) {
  const ignorado = padroes.some((p) => correspondeAoPadrao(caminho, p));
  console.log(caminho + ': ' + (ignorado ? 'ignorado' : 'rastreado'));
}`,
        expectedOutput: `node_modules/react/index.js: ignorado
src/app.js: rastreado
debug.log: ignorado
.env: ignorado
README.md: rastreado`,
        explanation:
          'Cada caminho é testado contra os três padrões com `some` — basta um bater para ser ignorado. `node_modules/react/index.js` bate com o padrão de pasta; `debug.log` com o de extensão; `.env` com o nome exato. `src/app.js` e `README.md` não batem com nenhum, e continuam rastreados.',
        hints: ['`some` percorre os padrões e para no primeiro que bater — o resultado é `true` se qualquer um bater.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-git-6-typo-extensao',
        type: 'find-bug',
        prompt:
          'Esta função deveria devolver a extensão de um arquivo, mas quebra ao rodar. Aponte a linha que precisa mudar.',
        concepts: ['git-gitignore'],
        difficulty: 'iniciante',
        tags: ['git', 'gitignore', 'bug'],
        code: `function obterExtensao(caminho) {
  const partes = caminho.spit('.');
  return partes[partes.length - 1];
}

console.log(obterExtensao('debug.log'));`,
        buggyLine: 2,
        fix: "  const partes = caminho.split('.');",
        explanation:
          'O método de string chama-se `split`, não `spit` — uma letra faltando. `caminho.spit` não existe em nenhuma string, vale `undefined`, e chamar `undefined(\'.\')` lança "is not a function". Um erro de digitação num nome de método só aparece quando a linha de fato roda, nunca antes.',
        hints: [
          'O erro é sobre chamar algo que não é uma função. Releia o nome do método usado para separar a string, letra por letra.',
          'O método certo para separar uma string em pedaços por um caractere é `split`.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
O que é **gerado** (\`node_modules\`, \`dist\`), **secreto** (chaves, senhas) ou **da máquina** (\`.DS_Store\`) não deveria ir para o repositório. \`.gitignore\` lista padrões — nome exato, pasta inteira terminada em \`/\`, extensão começando com \`*.\` — que o Git para de rastrear.

Um segredo já commitado não se resolve só apagando a linha ou ignorando o arquivo depois: o histórico guarda a versão antiga, e um \`push\` pode já ter exposto o valor. A única correção de verdade é **trocar o segredo**.

Isso fecha a trilha de Git e Equipe: commits com uma razão, branches por assunto, revisão que pega o que ninguém vê sozinho, conflitos resolvidos com as duas intenções em mente, um histórico que conta uma história, e um repositório que só guarda o que é de fato código-fonte.
`.trim(),
    },
  ],
};

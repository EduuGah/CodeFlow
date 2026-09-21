import type { Lesson } from '../types';

const SATISFAZ_CARET = `// satisfazCaret('^1.4.2', '1.9.0') → true: mesmo major, e não abaixo do mínimo.
function satisfazCaret(intervalo, versao) {
  const minimo = intervalo.slice(1).split('.').map(Number);
  const atual = versao.split('.').map(Number);
  if (atual[0] !== minimo[0]) return false;
  for (let i = 0; i < 3; i++) {
    if (atual[i] > minimo[i]) return true;
    if (atual[i] < minimo[i]) return false;
  }
  return true;
}`;

export const lessonEngDependencias: Lesson = {
  id: 'lesson-eng-7',
  trackId: 'track-engenharia',
  title: 'Dependências e o package.json',
  language: 'node',
  objective:
    'Ler e escrever o `package.json`, entender o que uma versão `^1.4.2` promete, saber por que o lockfile vai para o Git e o `node_modules` não — e decidir quando depender e quando escrever.',
  concepts: ['eng-dependencias'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
\`require('express')\` traz para dentro do seu processo milhares de linhas que você não escreveu e não leu. Isso é uma dependência: **código de outra pessoa rodando como se fosse seu**, com os mesmos poderes. Um projeto pequeno tem dez; contando o que cada uma traz, centenas. Esta aula é sobre tratar isso de propósito.

## O \`package.json\`

É o arquivo que descreve o projeto para o \`npm\` e para as pessoas:

~~~json
{
  "name": "loja-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "node --watch servidor.js",
    "test": "vitest run"
  },
  "dependencies": {
    "express": "^5.1.0"
  },
  "devDependencies": {
    "vitest": "^2.1.0"
  }
}
~~~

- \`scripts\`: os comandos do projeto, com nome. \`npm run dev\`, \`npm test\`. Quem clona não precisa adivinhar como rodar.
- \`dependencies\`: o que o programa precisa **para rodar** — o Express vai para produção.
- \`devDependencies\`: o que só existe **para desenvolver** — o Vitest não vai para produção; quem instala com \`--omit=dev\` nem o baixa.

\`npm install express\` escreve em \`dependencies\`; \`npm install -D vitest\` escreve em \`devDependencies\`. A regra de qual é qual: **isso roda quando o usuário usa o programa?**

## O que \`^1.4.2\` promete

Versões seguem o **semver**: \`major.minor.patch\` — \`1.4.2\`.

- **patch** muda quando se conserta um defeito sem mudar comportamento: \`1.4.2\` → \`1.4.3\`.
- **minor** muda quando entra algo novo, sem quebrar o que existia: \`1.4.2\` → \`1.5.0\`.
- **major** muda quando **algo que existia quebra**: \`1.4.2\` → \`2.0.0\`. É a promessa de que você vai ter que mexer no seu código.

O \`^\` no \`package.json\` diz "aceito atualizações que não quebram": \`^1.4.2\` aceita \`1.4.3\`, \`1.9.0\`, mas não \`2.0.0\`. O \`~1.4.2\` é mais estreito: só \`1.4.x\`. Sem nada, \`1.4.2\` é exatamente essa. A exceção: antes do \`1.0.0\`, tudo pode quebrar — \`^0.3.1\` só aceita \`0.3.x\`.

Uma consequência que engana: versão é **três números**, não um texto. \`1.10.0\` é maior que \`1.9.0\` — e comparada como texto, "1.10" vem antes de "1.9".

## O lockfile: a mesma coisa em toda máquina

\`^1.4.2\` aceita várias versões; qual foi instalada? A resposta está no \`package-lock.json\`: a versão **exata** de cada pacote, e de cada pacote que cada pacote trouxe — a árvore inteira. Ele vai para o Git, para que a máquina do colega e o servidor instalem **exatamente** o mesmo que a sua.

Dois comandos que parecem iguais:

- \`npm install\` lê o \`package.json\`, resolve os intervalos e **pode atualizar** o lock.
- \`npm ci\` lê o \`package-lock.json\` e instala **exatamente** o que está lá — ou falha se o lock e o \`package.json\` discordam. É o comando do CI e de quem acabou de clonar.

O \`node_modules\` é o resultado da instalação: centenas de megabytes que se recriam com um comando. **Nunca vai para o Git** — está no \`.gitignore\` desde o primeiro commit, junto com o \`.env\`.

## Antes de instalar

Cada dependência é uma promessa de um estranho: que vai continuar funcionando, que vai ser mantida, que não tem nada escondido. Antes de \`npm install\`:

- **Dá para escrever em vinte linhas?** Então escreva. Um pacote famoso de onze linhas (\`left-pad\`) foi apagado pelo autor em 2016 e parou milhares de projetos por uma manhã.
- **Está viva?** Última versão há quanto tempo, problemas abertos sem resposta, uma pessoa só mantendo.
- **Quanto pesa, e o que traz junto?** Uma dependência de 2 MB para formatar uma data, quando o navegador já tem \`Intl\`.
- **Que licença?** MIT e similares permitem quase tudo; outras têm condições.
- **O que já existe na plataforma?** \`fetch\`, \`structuredClone\`, \`Intl\`, \`crypto.randomUUID\` — muita coisa que era pacote hoje vem no Node e no navegador.

## Manter

Dependências envelhecem. \`npm outdated\` lista o que tem versão nova; \`npm audit\` lista vulnerabilidades conhecidas. Atualize **em passos pequenos e frequentes** — subir um minor por mês é trivial; subir três majors depois de dois anos é um projeto. E cada atualização é um commit próprio, com os testes rodando: se quebrou, sabe-se qual foi.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Versão é três números. Comparar como texto dá errado; comparar como números, certo.
function compararVersoes(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

compararVersoes('1.10.0', '1.9.0');  // 1  — 10 > 9
'1.10.0' > '1.9.0';                  // false — como texto, "1" < "9"

// É por isso que o ^ precisa entender semver: ^1.4.2 aceita 1.10.0, não 2.0.0.`,
      caption:
        'A comparação numérica, campo a campo. Todo gerenciador de pacotes faz isso por baixo dos intervalos — e é o que separa "1.10" de "1.9" na ordem certa.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-7-dev',
        type: 'multiple-choice',
        prompt:
          'O projeto usa `express` (o servidor), `vitest` (os testes) e `eslint` (o verificador de estilo). O que vai em `dependencies` e o que vai em `devDependencies`?',
        concepts: ['eng-dependencias'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'dependencias', 'package.json'],
        options: [
          '`express` em `dependencies`; `vitest` e `eslint` em `devDependencies` — só o servidor roda quando o usuário usa o programa',
          'Os três em `dependencies`: o projeto precisa dos três',
          'Os três em `devDependencies`: tudo foi instalado durante o desenvolvimento',
          '`express` e `vitest` em `dependencies`, porque os testes provam que o servidor funciona',
        ],
        correctIndex: 0,
        explanation:
          'A pergunta é "isso roda quando o usuário usa o programa?". O servidor, sim. Os testes e o verificador de estilo existem para quem desenvolve — em produção ninguém roda `vitest`. A divisão importa: o servidor de produção instala só `dependencies`, menor e com menos superfície para vulnerabilidades.',
        hints: ['Para cada pacote: ele roda em produção, ou só na sua máquina e no CI?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-7-texto',
        type: 'predict-output',
        prompt: 'O que este programa imprime? Versões são três números — mas aqui elas são texto.',
        concepts: ['eng-dependencias'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'semver', 'strings'],
        code: `const versoes = ['1.10.0', '1.9.0', '1.2.0'];

console.log([...versoes].sort().join(' < '));
console.log('1.10.0' > '1.9.0');`,
        expectedOutput: `1.10.0 < 1.2.0 < 1.9.0
false`,
        explanation:
          'Texto se compara caractere a caractere: "1.1…" vem antes de "1.2…", que vem antes de "1.9…" — o "10" nunca é lido como dez. Por isso comparar versões exige separar os três números e comparar campo a campo. Todo gerenciador de pacotes faz isso; quem escreve `if (versao > "1.9.0")` na mão, não.',
        hints: ['Compare "1.10.0" e "1.9.0" caractere por caractere. Em que posição elas diferem, e qual caractere é "menor"?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-7-comparar',
        type: 'code',
        prompt:
          'Escreva `compararVersoes(a, b)`, que recebe duas versões no formato `"major.minor.patch"` e devolve `-1` se `a` é menor, `1` se é maior, `0` se são iguais — comparando **número a número**, não como texto.',
        concepts: ['eng-dependencias'],
        difficulty: 'intermediario',
        tags: ['engenharia', 'semver', 'strings'],
        initialCode: `function compararVersoes(a, b) {
  // Separe em três números e compare campo a campo.
}

console.log(compararVersoes('1.10.0', '1.9.0')); // 1
console.log(compararVersoes('2.0.0', '2.0.0'));  // 0`,
        tests: [
          {
            description: '"1.10.0" é maior que "1.9.0" (10 > 9, mesmo que como texto pareça menor)',
            assertion: `const r = compararVersoes('1.10.0', '1.9.0');
if (r !== 1) throw new Error('compararVersoes("1.10.0", "1.9.0") deveria devolver 1, veio ' + JSON.stringify(r) + (r === -1 ? ' — comparou como texto? Converta cada parte com Number' : ''));`,
          },
          {
            description: 'Versões iguais devolvem 0; "1.4.2" é menor que "1.4.10"',
            assertion: `if (compararVersoes('2.0.0', '2.0.0') !== 0) throw new Error('versões iguais deveriam devolver 0');
if (compararVersoes('1.4.2', '1.4.10') !== -1) throw new Error('compararVersoes("1.4.2", "1.4.10") deveria devolver -1');`,
          },
          {
            description: 'O major decide antes do minor: "2.0.0" é maior que "1.99.99"',
            assertion: `if (compararVersoes('2.0.0', '1.99.99') !== 1) throw new Error('compararVersoes("2.0.0", "1.99.99") deveria devolver 1 — o primeiro número decide');
if (compararVersoes('1.99.99', '2.0.0') !== -1) throw new Error('compararVersoes("1.99.99", "2.0.0") deveria devolver -1');`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'para qualquer par de versões, o resultado bate com a comparação numérica campo a campo',
            generate: `
              const v = () => [Math.floor(rnd() * 3), Math.floor(rnd() * 12), Math.floor(rnd() * 12)];
              const a = v(); const b = rnd() < 0.2 ? [...a] : v();
              return { a: a.join('.'), b: b.join('.'), pa: a, pb: b };
            `,
            check: `
              let esperado = 0;
              for (let i = 0; i < 3; i++) {
                if (caso.pa[i] !== caso.pb[i]) { esperado = caso.pa[i] > caso.pb[i] ? 1 : -1; break; }
              }
              const obtido = compararVersoes(caso.a, caso.b);
              if (obtido !== esperado) throw new Error('compararVersoes("' + caso.a + '", "' + caso.b + '") deveria devolver ' + esperado + ', veio ' + JSON.stringify(obtido));
            `,
          },
        ],
        solution: `function compararVersoes(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}`,
        hints: [
          '`"1.10.0".split(".")` dá três textos; `.map(Number)` transforma em três números.',
          'Compare o primeiro campo: se diferem, a resposta está decidida. Só se forem iguais passe ao segundo, e depois ao terceiro.',
          'Se os três forem iguais, é 0.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-7-testar-caret',
        type: 'write-test',
        prompt:
          'A função `satisfazCaret(intervalo, versao)` abaixo está **correta**: diz se uma versão cabe num intervalo `^x.y.z` — mesmo major, e não abaixo do mínimo. Escreva os testes dela com `assert(condição, "mensagem")`, um por linha. Pense nos três jeitos de uma implementação errar: aceitar outro major, recusar um minor maior, aceitar uma versão abaixo do mínimo.',
        concepts: ['eng-dependencias'],
        difficulty: 'intermediario',
        tags: ['engenharia', 'semver', 'testes'],
        subject: SATISFAZ_CARET,
        initialCode: `// Escreva asserções sobre satisfazCaret. Uma por linha.
//
// assert(satisfazCaret('^1.4.2', '1.4.2') === true, 'a própria versão mínima cabe');

`,
        mutants: [
          {
            description: 'ignora o major: aceita 2.0.0 para ^1.4.2',
            code: `function satisfazCaret(intervalo, versao) {
  const minimo = intervalo.slice(1).split('.').map(Number);
  const atual = versao.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (atual[i] > minimo[i]) return true;
    if (atual[i] < minimo[i]) return false;
  }
  return true;
}`,
          },
          {
            description: 'exige o mesmo minor: recusa 1.9.0 para ^1.4.2',
            code: `function satisfazCaret(intervalo, versao) {
  const minimo = intervalo.slice(1).split('.').map(Number);
  const atual = versao.split('.').map(Number);
  if (atual[0] !== minimo[0]) return false;
  if (atual[1] !== minimo[1]) return false;
  return atual[2] >= minimo[2];
}`,
          },
          {
            description: 'não confere o mínimo: aceita 1.2.0 para ^1.4.2',
            code: `function satisfazCaret(intervalo, versao) {
  const minimo = intervalo.slice(1).split('.').map(Number);
  const atual = versao.split('.').map(Number);
  return atual[0] === minimo[0];
}`,
          },
        ],
        hints: [
          'Um teste por jeito de errar. Comece por uma versão de outro major: ela precisa ser recusada.',
          'Depois, uma versão com o minor maior que o mínimo: ^1.4.2 precisa aceitar 1.9.0.',
          'Por fim, uma versão abaixo do mínimo, com o mesmo major: ^1.4.2 precisa recusar 1.2.0.',
          "assert(satisfazCaret('^1.4.2', '2.0.0') === false, 'outro major não cabe'); assert(satisfazCaret('^1.4.2', '1.9.0') === true, 'minor maior cabe'); assert(satisfazCaret('^1.4.2', '1.2.0') === false, 'abaixo do mínimo não cabe');",
        ],
        solution: `assert(satisfazCaret('^1.4.2', '2.0.0') === false, 'outro major nao cabe');
assert(satisfazCaret('^1.4.2', '1.9.0') === true, 'minor maior cabe');
assert(satisfazCaret('^1.4.2', '1.2.0') === false, 'abaixo do minimo nao cabe');`,
        explanation:
          'Três regras, três testes — e cada um pega exatamente uma versão errada. É o mesmo raciocínio de escolher dependências: saber o que `^` promete (não quebrar) e o que não promete (ficar parado) é o que evita tanto o `2.0.0` que quebra o projeto quanto o `~` que trava numa versão com defeito conhecido.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-7-ci',
        type: 'multiple-choice',
        prompt:
          'No CI e na máquina de quem acabou de clonar o projeto, qual comando instala as dependências — e por quê?',
        concepts: ['eng-dependencias'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'dependencias', 'lockfile'],
        options: [
          '`npm ci`: instala exatamente o que está no `package-lock.json`, e falha se o lock e o `package.json` discordam — todo mundo com a mesma árvore',
          '`npm install`: é o comando padrão, e resolve as versões mais novas dentro dos intervalos',
          '`npm update`: garante que tudo está na versão mais recente',
          'Tanto faz: os dois leem o `package.json`',
        ],
        correctIndex: 0,
        explanation:
          '`npm install` pode escolher versões diferentes das que você testou (dentro do `^`) e reescrever o lock; no CI isso é um teste rodando contra uma árvore que ninguém viu. `npm ci` reproduz o lock à risca, e por isso o lock vai para o Git: é ele que garante que a sua máquina, a do colega e o servidor têm a mesma coisa.',
        hints: ['Qual dos dois comandos lê o arquivo que guarda as versões exatas?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-7-antes',
        type: 'order-steps',
        prompt: 'Coloque na ordem os passos para adicionar uma dependência a um projeto de forma responsável.',
        concepts: ['eng-dependencias'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'dependencias', 'processo'],
        steps: [
          { id: 'precisa', text: 'Perguntar se dá para escrever em vinte linhas, ou se a plataforma já tem (fetch, Intl, crypto) — e só seguir se não', ordem: 1 },
          { id: 'avaliar', text: 'Olhar o pacote: última versão, problemas abertos, tamanho, o que traz junto, licença', ordem: 2 },
          { id: 'instalar', text: '`npm install nome` (ou `-D`, se for só para desenvolver)', ordem: 3 },
          { id: 'commit', text: 'Commitar `package.json` e `package-lock.json` juntos, num commit só disso', ordem: 4 },
          { id: 'atualizar', text: 'Depois, ao longo do tempo: `npm outdated` e `npm audit`, atualizando em passos pequenos', ordem: 5 },
        ],
        explanation:
          'A primeira pergunta elimina metade das instalações. A avaliação vem antes do `install` porque depois é mais difícil tirar. O commit leva o lock junto — é ele que fixa a versão para todo mundo. E a manutenção não é um evento: é a rotina de olhar o que envelheceu, um pouco de cada vez.',
        hints: [
          'O que decide se a dependência sequer entra vem antes de qualquer comando.',
          'O lock só existe depois de instalar, e vai para o Git junto com o `package.json`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-eng-7-lacuna',
        type: 'fill-blank',
        prompt: 'Complete o `package.json` (aqui como um objeto JavaScript): o servidor roda em produção; os testes, não.',
        concepts: ['eng-dependencias'],
        difficulty: 'iniciante',
        tags: ['engenharia', 'package.json'],
        template: `const pacote = {
  name: 'loja-api',
  version: '1.0.0',
  scripts: { dev: 'node --watch servidor.js', test: 'vitest run' },
  {{1}}: { express: '^5.1.0' },
  {{2}}: { vitest: '^2.1.0' },
};

module.exports = pacote;`,
        blanks: [
          { placeholder: 'para rodar', size: 16 },
          { placeholder: 'para desenvolver', size: 16 },
        ],
        tests: [
          {
            description: 'O express está no campo do que roda em produção',
            assertion: `if (!module.exports.dependencies || module.exports.dependencies.express !== '^5.1.0') throw new Error('o express precisa estar no campo das dependências de produção');`,
          },
          {
            description: 'O vitest está no campo do que só existe para desenvolver',
            assertion: `if (!module.exports.devDependencies || module.exports.devDependencies.vitest !== '^2.1.0') throw new Error('o vitest precisa estar no campo das dependências de desenvolvimento');`,
          },
        ],
        explanation:
          'Os dois campos separam o que o programa precisa para rodar do que só a equipe precisa para trabalhar nele. O servidor de produção instala só o primeiro.',
        solution: ['dependencies', 'devDependencies'],
        hints: [
          'Os dois nomes são os que o `npm install` e o `npm install -D` escrevem — em inglês, como o `package.json` exige.',
          'O segundo é o primeiro com um prefixo de três letras que quer dizer "desenvolvimento".',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Uma dependência é **código de outra pessoa rodando como seu**. O \`package.json\` a declara — \`dependencies\` roda em produção, \`devDependencies\` só para desenvolver — e o \`scripts\` diz como o projeto se usa.

Versão é **\`major.minor.patch\`**: conserto, novidade, quebra. \`^1.4.2\` aceita o que não quebra; \`1.10.0\` é maior que \`1.9.0\`, e comparar como texto erra. O \`package-lock.json\` fixa a árvore exata e **vai para o Git**; \`npm ci\` o reproduz à risca; \`node_modules\` nunca entra.

Antes de instalar: dá para escrever? a plataforma já tem? está viva? quanto pesa? que licença? Depois: \`npm outdated\`, \`npm audit\`, passos pequenos.

Na última aula, o projeto visto por quem chega: README, comentários e revisão.
`.trim(),
    },
  ],
};

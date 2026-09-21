import type { Lesson } from '../types';

export const lessonTerminalVariaveisDeAmbiente: Lesson = {
  id: 'lesson-terminal-2',
  trackId: 'track-terminal',
  title: 'Variáveis de Ambiente',
  language: 'javascript',
  objective:
    'Entender o que uma variável de ambiente é e por que ela vive fora do código, ler uma com um valor padrão seguro, e entender como o PATH decide qual comando roda.',
  concepts: ['terminal-env'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Uma variável comum, dentro do código, é definida pelo próprio código: \`const porta = 3000\`. Uma **variável de ambiente** é o contrário — definida por fora (pelo shell, por um arquivo, pela plataforma que hospeda o projeto) e **lida** pelo código, através de \`process.env\` em Node. O código não decide o valor; só reage a ele.

## Por que configurar por fora do código

O mesmo programa roda diferente dependendo de onde está: no seu computador, ele fala com um banco de dados de teste; em produção, com o de verdade. Se o endereço do banco estivesse escrito direto no código, mudar de ambiente exigiria mudar e reenviar o código — e, pior, colocaria a senha do banco de produção dentro do repositório, visível para qualquer pessoa com acesso a ele (a mesma preocupação da aula de \`.gitignore\`, na trilha de Git).

Com variável de ambiente, o código é sempre o mesmo — \`process.env.DATABASE_URL\` — e quem muda é o valor que cada ambiente define. Dev, teste e produção rodam o mesmo programa, configurado três jeitos diferentes.

## Lendo com um valor padrão

Nem toda variável de ambiente precisa existir sempre. Uma prática comum é ler com um **padrão** para quando ela não estiver definida:

~~~js
const porta = process.env.PORTA || 3000;
~~~

Mas repare num detalhe: \`||\` cai no padrão para **qualquer** valor falso — inclusive uma string vazia (\`''\`), que pode ser uma configuração válida e proposital (por exemplo, "sem prefixo"). Para distinguir "não foi definida" de "foi definida como vazia", o certo é checar contra \`undefined\`:

~~~js
const prefixo = process.env.PREFIXO !== undefined ? process.env.PREFIXO : '';
~~~

## PATH: onde o shell procura um comando

Quando você digita \`npm\` no terminal, o shell não sabe de cor onde o programa \`npm\` está instalado — ele procura numa lista de pastas guardada na variável de ambiente \`PATH\`, na **ordem** em que aparecem, e usa a primeira que tiver um arquivo com esse nome. É por isso que ter duas versões de uma ferramenta instaladas em pastas diferentes pode dar um resultado surpreendente: a que "vence" é a que aparece primeiro no \`PATH\`, não necessariamente a mais nova.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// process.env, simulado como um objeto comum.
const env = { PORTA: '3000', AMBIENTE: 'producao' };

function valorOuPadrao(env, nome, padrao) {
  return env[nome] !== undefined ? env[nome] : padrao;
}

valorOuPadrao(env, 'PORTA', '8080'); // '3000' — estava definida
valorOuPadrao(env, 'DEBUG', 'nao');  // 'nao' — não estava definida, usa o padrão`,
      caption:
        'Checar contra `undefined`, em vez de usar `||`, é o que permite uma variável definida como string vazia continuar sendo lida como "definida".',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-2-por-que-ambiente',
        type: 'multiple-choice',
        prompt: 'Por que colocar o endereço do banco de dados numa variável de ambiente, em vez de escrevê-lo direto no código?',
        concepts: ['terminal-env'],
        difficulty: 'iniciante',
        tags: ['terminal', 'ambiente'],
        options: [
          'Porque o mesmo código passa a rodar em ambientes diferentes (dev, produção) sem mudar, e o valor sensível não fica exposto no repositório',
          'Porque variáveis de ambiente deixam o programa mais rápido',
          'Porque o Node exige que endereços de banco sejam variáveis de ambiente',
          'Não há diferença real; é só um costume sem efeito prático',
        ],
        correctIndex: 0,
        explanation:
          'A vantagem é dupla: o código não muda entre ambientes (só o valor que o ambiente define muda), e um segredo como uma senha de banco não fica em texto dentro do repositório, visível para quem tiver acesso a ele.',
        hints: ['Pense no que aconteceria se o endereço do banco de produção estivesse escrito no código e o repositório vazasse.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-2-para-que-serve-path',
        type: 'multiple-choice',
        prompt: 'Para que serve a variável de ambiente `PATH`?',
        concepts: ['terminal-env'],
        difficulty: 'iniciante',
        tags: ['terminal', 'ambiente'],
        options: [
          'Lista as pastas onde o shell procura o programa de um comando, na ordem — a primeira pasta com esse comando é usada',
          'Guarda o caminho do diretório atual do usuário',
          'Define quais arquivos ficam visíveis para o `ls`',
          'Configura o endereço do banco de dados do projeto',
        ],
        correctIndex: 0,
        explanation:
          'Quando você digita um comando, o shell não sabe de antemão onde o programa correspondente está instalado — ele varre as pastas listadas em `PATH`, em ordem, e usa a primeira que tiver um executável com aquele nome.',
        hints: ['Pense no que precisa acontecer entre você digitar `npm` e o programa `npm` de fato rodar.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-2-valor-ou-padrao',
        type: 'code',
        prompt:
          'Escreva `valorOuPadrao(env, nome, padrao)`: devolve `env[nome]` quando ela está definida (mesmo que seja uma string vazia), e `padrao` só quando ela é `undefined`.',
        concepts: ['terminal-env'],
        difficulty: 'intermediario',
        tags: ['terminal', 'ambiente'],
        initialCode: `function valorOuPadrao(env, nome, padrao) {
  return env[nome] || padrao;
}`,
        tests: [
          {
            description: 'Variável definida devolve o próprio valor',
            assertion: `const r = valorOuPadrao({ PORTA: '3000' }, 'PORTA', '8080');
if (r !== '3000') throw new Error('esperava "3000", veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Variável ausente devolve o padrão',
            assertion: `const r = valorOuPadrao({}, 'PORTA', '8080');
if (r !== '8080') throw new Error('esperava "8080", veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Variável definida como string vazia continua sendo "definida" — não cai no padrão',
            assertion: `const r = valorOuPadrao({ PREFIXO: '' }, 'PREFIXO', 'padrao');
if (r !== '') throw new Error('esperava uma string vazia, veio ' + JSON.stringify(r));`,
          },
        ],
        solution: `function valorOuPadrao(env, nome, padrao) {
  return env[nome] !== undefined ? env[nome] : padrao;
}`,
        hints: [
          '`||` cai no padrão para qualquer valor "falso" em JavaScript — inclusive uma string vazia, que aqui deveria contar como definida.',
          'Compare `env[nome]` contra `undefined` explicitamente, em vez de testar se é "verdadeiro".',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-2-ordem-de-precedencia',
        type: 'order-steps',
        prompt:
          'Coloque na ordem, da menor para a maior prioridade, de onde o valor final de uma configuração (como a porta do servidor) pode vir.',
        concepts: ['terminal-env'],
        difficulty: 'intermediario',
        tags: ['terminal', 'ambiente', 'processo'],
        steps: [
          { id: 'padrao', text: 'O valor padrão escrito no próprio código, que vale se nada mais disser o contrário', ordem: 1 },
          { id: 'arquivo-env', text: 'Um arquivo `.env`, lido em desenvolvimento, que sobrescreve o padrão do código', ordem: 2 },
          { id: 'variavel-real', text: 'Uma variável de ambiente de verdade, exportada no terminal ou definida pela plataforma de produção, que sobrescreve as duas anteriores', ordem: 3 },
        ],
        explanation:
          'O padrão do código é a rede de segurança de última instância; o `.env` é conveniência para desenvolvimento; e o ambiente real — o que a plataforma de produção de fato define — é a fonte da verdade quando o programa está no ar, e por isso vence as outras duas.',
        hints: ['Pense em qual delas você confiaria mais para saber o valor real usado em produção.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-2-porta-sem-padrao',
        type: 'find-bug',
        prompt:
          'Esta função deveria ler a porta do ambiente, mas quebra quando a variável não está definida. Aponte a linha que precisa mudar.',
        concepts: ['terminal-env'],
        difficulty: 'iniciante',
        tags: ['terminal', 'ambiente', 'bug'],
        code: `function lerPorta(env) {
  return parseInt(env.PORTA.trim(), 10);
}

console.log(lerPorta({}));`,
        buggyLine: 2,
        fix: "  return parseInt((env.PORTA || '3000').trim(), 10);",
        explanation:
          'Quando `env.PORTA` não está definida, ela vale `undefined` — e `undefined.trim()` lança "Cannot read properties of undefined". A função supõe que a variável sempre existe, mas variáveis de ambiente são exatamente o tipo de valor que pode faltar (um ambiente esqueceu de configurar, ou um novo ambiente ainda não tem). Um valor padrão evita o programa inteiro cair por causa de uma configuração ausente.',
        hints: [
          'O erro acontece ao chamar um método numa variável que não foi definida. Qual variável é essa?',
          'Um valor padrão, como `env.PORTA || \'3000\'`, evita chamar um método em `undefined`.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Uma variável de ambiente vive fora do código e é lida por ele — o mesmo programa roda diferente em dev e produção sem mudar uma linha, e um segredo não precisa ficar em texto no repositório. Ler com \`!== undefined\`, em vez de \`||\`, distingue "não definida" de "definida como vazia".

O \`PATH\` é a lista de pastas onde o shell procura um comando, na ordem — a primeira que tiver o programa vence.

Na próxima aula, os atalhos que todo projeto guarda para não digitar o mesmo comando toda vez: os **scripts do \`package.json\`**.
`.trim(),
    },
  ],
};

import type { Lesson } from '../types';

export const lessonTerminalDiagnosticar: Lesson = {
  id: 'lesson-terminal-5',
  trackId: 'track-terminal',
  title: 'Diagnosticar um Comando que Falhou',
  language: 'javascript',
  objective:
    'Combinar código de saída, stack trace e variável de ambiente ausente para diagnosticar por que um comando falhou, corrigindo uma coisa de cada vez.',
  concepts: ['terminal-fechamento'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Esta trilha ensinou quatro habilidades separadas: navegar por caminhos, ler e configurar por variável de ambiente, rodar os scripts certos, e ler uma saída de erro. Na prática, um problema de verdade raramente vem etiquetado com qual das quatro é a causa — você roda \`npm run build\`, ele falha, e o trabalho é descobrir **qual** delas está em jogo.

## Um diagnóstico de verdade, em ordem

1. **O código de saída diz que algo falhou** — mas não diz o quê. É só o sinal de "pare e investigue", não o diagnóstico.
2. **O stack trace aponta onde.** A primeira linha do seu próprio código (aula anterior) é o lugar mais barato para olhar primeiro.
3. **A causa mais comum, e a mais rápida de conferir, é uma variável de ambiente que devia estar definida e não está.** Antes de duvidar da lógica do programa, vale confirmar que a configuração que ele espera de fato chegou até ele.

Essa ordem não é arbitrária: cada passo é mais barato de checar que o seguinte, e a maioria dos problemas do dia a dia se resolve nos dois primeiros.

## Um exemplo, do começo ao fim

\`npm run build\` falha com \`Error: a variável de ambiente DATABASE_URL não está definida\`, código de saída \`1\`. O stack trace mostra que o erro nasceu dentro do seu \`src/config.js\`, não de uma biblioteca. A mensagem já nomeia a causa provável — uma variável de ambiente ausente — e o próximo passo não é reler o código de \`config.js\` looking por um bug de lógica: é conferir se \`DATABASE_URL\` está de fato definida no ambiente onde o comando rodou (um \`.env\` que não foi criado, uma variável que a plataforma esqueceu de configurar).

## Uma correção de cada vez

Depois de identificar a causa, resista à tentação de mudar várias coisas ao mesmo tempo "já que está mexendo". Corrija uma coisa, rode de novo, confirme que o erro mudou ou sumiu — a mesma disciplina de "uma extração por vez" da trilha de Engenharia, aplicada a consertar em vez de refatorar.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// As duas funções das aulas anteriores, compostas.
function resolverCaminho(cwd, caminho) {
  if (caminho.startsWith('/')) return caminho;
  const partes = (cwd + '/' + caminho).split('/').filter(Boolean);
  const resultado = [];
  for (const parte of partes) {
    if (parte === '.') continue;
    if (parte === '..') resultado.pop();
    else resultado.push(parte);
  }
  return '/' + resultado.join('/');
}

function valorOuPadrao(env, nome, padrao) {
  return env[nome] !== undefined ? env[nome] : padrao;
}

const env = {};
const ambiente = valorOuPadrao(env, 'AMBIENTE', 'dev');
const caminhoDoConfig = resolverCaminho('/home/ana/projeto/scripts', '../config/' + ambiente + '.json');
// '/home/ana/projeto/config/dev.json' — sem AMBIENTE definida, cai no config de dev`,
      caption:
        'Duas habilidades separadas, uma resolvendo caminho e outra lendo ambiente, compostas numa única decisão: qual arquivo de configuração carregar.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-5-por-onde-comecar',
        type: 'multiple-choice',
        prompt:
          '`npm run build` falhou. Antes de reler o código procurando um bug de lógica, qual é o passo mais barato para descartar primeiro?',
        concepts: ['terminal-fechamento'],
        difficulty: 'intermediario',
        tags: ['terminal', 'diagnostico'],
        options: [
          'Conferir se as variáveis de ambiente que o comando espera estão de fato definidas',
          'Reescrever a função inteira do zero',
          'Apagar o node_modules e reinstalar tudo, por precaução',
          'Trocar de versão do Node, sem outra evidência de que o problema é de versão',
        ],
        correctIndex: 0,
        explanation:
          'Uma variável de ambiente ausente é a causa mais comum e a mais rápida de conferir — bem mais barata que reescrever código, reinstalar dependências ou trocar de versão sem nenhuma evidência apontando para isso. As outras opções são ações grandes, e nenhuma delas é o primeiro passo de um diagnóstico.',
        hints: ['Ordene as opções pelo custo de tentar cada uma. Qual é praticamente grátis de conferir?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-5-ordem-do-diagnostico',
        type: 'order-steps',
        prompt: 'Coloque na ordem os passos de um diagnóstico completo, de "o comando falhou" até "está corrigido".',
        concepts: ['terminal-fechamento'],
        difficulty: 'intermediario',
        tags: ['terminal', 'diagnostico', 'processo'],
        steps: [
          { id: 'saida', text: 'Conferir o código de saída — confirmar que de fato houve falha', ordem: 1 },
          { id: 'mensagem', text: 'Ler a mensagem de erro inteira', ordem: 2 },
          { id: 'stack', text: 'Achar a primeira linha do stack que é do seu próprio código', ordem: 3 },
          { id: 'ambiente', text: 'Conferir se alguma variável de ambiente esperada está de fato definida', ordem: 4 },
          { id: 'corrigir', text: 'Corrigir uma coisa de cada vez, rodando de novo depois de cada mudança', ordem: 5 },
        ],
        explanation:
          'O diagnóstico anda do mais barato para o mais específico: primeiro confirma que houve falha, depois lê o que ela diz, localiza onde no seu código, confere a causa mais comum, e só então corrige — uma mudança por vez, para saber qual delas resolveu.',
        hints: ['O último passo é sobre corrigir; tudo antes dele é sobre entender o problema primeiro.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-5-diagnosticar',
        type: 'code',
        prompt:
          'Escreva `diagnosticar(resultado)`: recebe `{ codigoDeSaida, mensagemDeErro }` e devolve `\'sucesso\'` quando `codigoDeSaida` é `0`; `\'comando-nao-encontrado\'` quando é `127`; `\'variavel-de-ambiente-faltando\'` quando `mensagemDeErro` contém `\'não está definida\'`; senão, se `codigoDeSaida` é diferente de zero, `\'erro-no-codigo\'`.',
        concepts: ['terminal-fechamento'],
        difficulty: 'avancado',
        tags: ['terminal', 'diagnostico'],
        initialCode: `function diagnosticar(resultado) {
  return 'desconhecido';
}`,
        tests: [
          {
            description: 'Código de saída 0 é sucesso',
            assertion: `const r = diagnosticar({ codigoDeSaida: 0, mensagemDeErro: '' });
if (r !== 'sucesso') throw new Error('esperava "sucesso", veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Código de saída 127 é comando não encontrado',
            assertion: `const r = diagnosticar({ codigoDeSaida: 127, mensagemDeErro: 'comando não encontrado' });
if (r !== 'comando-nao-encontrado') throw new Error('esperava "comando-nao-encontrado", veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Mensagem citando variável não definida vence sobre um código de saída genérico',
            assertion: `const r = diagnosticar({ codigoDeSaida: 1, mensagemDeErro: 'a variável de ambiente DATABASE_URL não está definida' });
if (r !== 'variavel-de-ambiente-faltando') throw new Error('esperava "variavel-de-ambiente-faltando", veio ' + JSON.stringify(r));`,
          },
          {
            description: 'Falha genérica sem menção a variável de ambiente é erro no código',
            assertion: `const r = diagnosticar({ codigoDeSaida: 1, mensagemDeErro: 'TypeError: x is not a function' });
if (r !== 'erro-no-codigo') throw new Error('esperava "erro-no-codigo", veio ' + JSON.stringify(r));`,
          },
        ],
        solution: `function diagnosticar(resultado) {
  if (resultado.codigoDeSaida === 0) return 'sucesso';
  if (resultado.codigoDeSaida === 127) return 'comando-nao-encontrado';
  if (resultado.mensagemDeErro.includes('não está definida')) return 'variavel-de-ambiente-faltando';
  if (resultado.codigoDeSaida !== 0) return 'erro-no-codigo';
  return 'desconhecido';
}`,
        hints: [
          'Trate os casos mais específicos primeiro: 0 e 127 são valores exatos de `codigoDeSaida`.',
          'Depois, cheque a mensagem por "não está definida" antes de cair no caso genérico de erro no código.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-5-caminho-do-config',
        type: 'predict-output',
        prompt: 'O que este programa imprime, sem `AMBIENTE` definida no ambiente?',
        concepts: ['terminal-fechamento'],
        difficulty: 'intermediario',
        tags: ['terminal', 'diagnostico'],
        code: `function resolverCaminho(cwd, caminho) {
  if (caminho.startsWith('/')) return caminho;
  const partes = (cwd + '/' + caminho).split('/').filter(Boolean);
  const resultado = [];
  for (const parte of partes) {
    if (parte === '.') continue;
    if (parte === '..') resultado.pop();
    else resultado.push(parte);
  }
  return '/' + resultado.join('/');
}

function valorOuPadrao(env, nome, padrao) {
  return env[nome] !== undefined ? env[nome] : padrao;
}

const env = {};
const ambiente = valorOuPadrao(env, 'AMBIENTE', 'dev');
const caminhoDoConfig = resolverCaminho('/home/ana/projeto/scripts', '../config/' + ambiente + '.json');

console.log(ambiente);
console.log(caminhoDoConfig);`,
        expectedOutput: `dev
/home/ana/projeto/config/dev.json`,
        explanation:
          'Sem `AMBIENTE` no objeto `env`, `valorOuPadrao` cai no padrão `\'dev\'`. `resolverCaminho` então junta o diretório atual (`.../scripts`) com `../config/dev.json`, e o `..` sobe um nível — de `scripts` para a raiz do projeto — antes de descer para `config/dev.json`.',
        hints: ['Resolva primeiro o valor de `ambiente`, depois substitua na string do segundo argumento de `resolverCaminho`.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-terminal-5-config-sem-padrao',
        type: 'find-bug',
        prompt:
          'Esta função deveria montar o nome do arquivo de configuração a partir do ambiente, mas quebra quando `AMBIENTE` não está definida. Aponte a linha que precisa mudar.',
        concepts: ['terminal-fechamento'],
        difficulty: 'intermediario',
        tags: ['terminal', 'diagnostico', 'bug'],
        code: `function nomeDoArquivoDeConfig(env) {
  const ambiente = env.AMBIENTE.trim();
  return ambiente + '.json';
}

console.log(nomeDoArquivoDeConfig({}));`,
        buggyLine: 2,
        fix: "  const ambiente = (env.AMBIENTE || 'dev').trim();",
        explanation:
          'Sem `AMBIENTE` definida, `env.AMBIENTE` vale `undefined`, e `.trim()` nele lança "Cannot read properties of undefined" — o mesmo formato de bug da aula sobre variáveis de ambiente, agora dentro de uma função de diagnóstico. Um valor padrão (`env.AMBIENTE || \'dev\'`) evita que a ausência de uma única variável derrube a função inteira.',
        hints: [
          'Este é o mesmo tipo de bug de uma aula anterior: um método chamado numa variável de ambiente que pode não existir.',
          'Um valor padrão, como `env.AMBIENTE || \'dev\'`, resolve antes de chamar `.trim()`.',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
Um diagnóstico de verdade combina as três habilidades da trilha, na ordem do mais barato para o mais específico: o código de saída diz que algo falhou, o stack trace aponta onde no seu código, e a variável de ambiente ausente é a causa mais comum e mais rápida de conferir. Corrigir uma coisa de cada vez, e rodar de novo, fecha o ciclo.

Isso fecha a trilha de Terminal e Ferramentas — e, com ela, o que faltava da Fase 5: navegar por caminhos, configurar sem tocar no código, rodar os scripts certos, ler o que uma saída de erro está tentando dizer, e juntar tudo isso na hora de diagnosticar.
`.trim(),
    },
  ],
};

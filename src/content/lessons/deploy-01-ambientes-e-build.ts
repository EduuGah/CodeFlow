import type { Lesson } from '../types';

export const lessonDeployAmbientesEBuild: Lesson = {
  id: 'lesson-deploy-1',
  trackId: 'track-deploy',
  title: 'Ambientes: Desenvolvimento e Produção',
  language: 'javascript',
  objective:
    'Distinguir o que muda entre rodar no seu computador e rodar em produção, e entender o que é o "build" — e por que ele roda antes do deploy, de propósito.',
  concepts: ['deploy-ambientes'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Até aqui, todo código rodou num sandbox: um exercício, um "Executar", um resultado na hora. Uma aplicação de verdade tem um destino diferente — uma pessoa desconhecida, num computador que não é o seu, abrindo uma URL às três da manhã. Esta aula é sobre o que muda entre um mundo e o outro.

## Dois ambientes, o mesmo código

**Desenvolvimento** é onde você escreve e testa: dados de mentira, erros mostrados com todo o detalhe (a pilha de chamadas inteira, a linha exata), recarregamento automático a cada salvamento. **Produção** é onde a aplicação atende gente de verdade: dados reais, e os detalhes do erro **não aparecem** para quem está usando — um erro de banco de dados mostrando a estrutura das suas tabelas na tela é um vazamento de informação, não uma cortesia.

O código é o mesmo nos dois lugares. O que muda é o valor de configuração que diz qual dos dois está rodando — o \`NODE_ENV\` que a aula de configuração já apresentou:

~~~js
function mensagemDeErro(env, erro) {
  if (env.NODE_ENV === 'production') return 'Algo deu errado. Tente novamente.';
  return erro.stack; // detalhe completo — só em desenvolvimento
}
~~~

## O que é o "build"

O código que você escreve — com \`import\`, JSX, TypeScript, comentários, nomes de variável longos — quase nunca é o código que roda em produção. Entre um e outro existe um passo chamado **build**: um programa (o Vite, no caso do CodeFlow) lê o código-fonte inteiro e produz um conjunto de arquivos prontos para rodar — JavaScript puro, sem tipos, sem JSX, minificado (nomes curtos, sem espaço, sem comentário), muitas vezes um punhado de arquivos só, em vez de centenas.

~~~
src/App.tsx, src/styles.css, 40 outros arquivos   →  build  →  dist/index.html, dist/assets/index-a1b2c3.js
~~~

Duas razões para isso existir. Primeiro, o navegador não entende TypeScript nem JSX diretamente — alguém precisa traduzir antes. Segundo, arquivo pequeno chega mais rápido: minificar e juntar arquivos é o que faz uma página carregar em vez de travar numa tela branca.

## Por que o build roda antes do deploy, e não depois

Um erro de sintaxe, um tipo que não bate, um \`import\` de um arquivo que não existe — todos esses defeitos **impedem o build de terminar**. E isso é uma rede de segurança de propósito: se o build quebrasse só depois de publicado, o defeito apareceria para quem está usando a aplicação, na hora errada, do jeito errado. Rodar o build **antes** do deploy — e recusar publicar se ele falhar — é o que garante que um erro desse tipo pare no seu computador (ou no pipeline do time), nunca na tela de um usuário.

É por isso que "funciona no meu computador, mas o build falha" é, ao mesmo tempo, frustrante e o comportamento certo: o build está fazendo exatamente o trabalho que existe para fazer.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Simulação: o mesmo código, dois ambientes.
function respostaDeErro(env, erro) {
  if (env.NODE_ENV === 'production') {
    return { status: 500, corpo: { erro: 'Algo deu errado.' } };
  }
  return { status: 500, corpo: { erro: erro.message, pilha: erro.stack } };
}

respostaDeErro({ NODE_ENV: 'development' }, new Error('banco fora do ar'));
// { status: 500, corpo: { erro: 'banco fora do ar', pilha: '...' } }

respostaDeErro({ NODE_ENV: 'production' }, new Error('banco fora do ar'));
// { status: 500, corpo: { erro: 'Algo deu errado.' } } — sem detalhe nenhum`,
      caption: 'O ambiente decide quanto detalhe do erro sai — nunca se o erro é ou não tratado.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-1-o-que-e-build',
        type: 'multiple-choice',
        prompt: 'O que é, precisamente, o "build" de um projeto frontend?',
        concepts: ['deploy-ambientes'],
        difficulty: 'iniciante',
        tags: ['deploy', 'build'],
        options: [
          'O passo que transforma o código-fonte (TypeScript, JSX, vários arquivos) nos arquivos prontos que o navegador de fato executa',
          'O passo que sobe os arquivos do projeto para o servidor',
          'Um sinônimo de "salvar o arquivo"',
          'O passo que apaga os dados de teste antes de ir para produção',
        ],
        correctIndex: 0,
        explanation:
          'Build é tradução e empacotamento: o que você escreveu vira o que o navegador (ou o Node, no backend) consegue rodar direto, sem precisar entender TypeScript ou JSX. Subir os arquivos é o deploy — um passo separado, que normalmente vem depois.',
        hints: ['Pense no que muda entre o arquivo `App.tsx` que você edita e o arquivo que o navegador do usuário final baixa.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-1-por-que-build-antes',
        type: 'multiple-choice',
        prompt: 'Por que o build roda antes do deploy — e a publicação é recusada quando ele falha — em vez de publicar sempre e deixar o erro aparecer se aparecer?',
        concepts: ['deploy-ambientes'],
        difficulty: 'intermediario',
        tags: ['deploy', 'build'],
        options: [
          'Porque um erro que impede o build (sintaxe, tipo, import quebrado) é melhor descoberto no seu computador do que na tela de quem está usando a aplicação',
          'Porque o build é mais rápido de rodar antes do que depois',
          'Porque a maioria dos hosts cobra por cada tentativa de deploy',
          'Não há um motivo técnico — é só uma convenção arbitrária',
        ],
        correctIndex: 0,
        explanation:
          'O build funciona como uma rede de segurança: qualquer defeito que o impeça de terminar nunca chega a virar um problema em produção, porque a publicação inteira é recusada antes disso. É a mesma ideia por trás de rodar os testes antes de aceitar um Pull Request.',
        hints: ['Pense em quem descobre o erro primeiro em cada cenário: você, ou a pessoa usando a aplicação.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-1-ordem-do-deploy',
        type: 'order-steps',
        prompt: 'Coloque na ordem certa o caminho entre escrever uma linha de código e uma pessoa vê-la funcionando em produção.',
        concepts: ['deploy-ambientes'],
        difficulty: 'iniciante',
        tags: ['deploy', 'build', 'processo'],
        steps: [
          { id: 'escrever', text: 'Escrever e salvar a mudança no código-fonte', ordem: 1 },
          { id: 'build', text: 'Rodar o build, que traduz o código-fonte em arquivos prontos para rodar', ordem: 2 },
          { id: 'publicar', text: 'Publicar os arquivos gerados pelo build no host de produção', ordem: 3 },
          { id: 'acessar', text: 'A pessoa acessa a URL e o host entrega o que foi publicado', ordem: 4 },
        ],
        explanation:
          'O build sempre fica entre o código-fonte e a publicação — nunca depois dela. Publicar o código-fonte direto, sem build, deixaria o navegador tentando rodar TypeScript e JSX que ele não entende.',
        hints: ['O build produz o que vai ser publicado — ele não pode vir depois da publicação.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-1-detalhe-do-erro-invertido',
        type: 'multiple-choice',
        prompt: `Esta função deveria esconder o detalhe do erro em produção, mas está fazendo o oposto — mostra a pilha completa só em produção:

~~~js
function respostaDeErro(env, erro) {
  if (env.NODE_ENV === 'production') {
    return { status: 500, corpo: { erro: erro.stack } };
  }
  return { status: 500, corpo: { erro: 'Algo deu errado.' } };
}
~~~

Qual é o defeito?`,
        concepts: ['deploy-ambientes'],
        difficulty: 'intermediario',
        tags: ['deploy', 'ambientes', 'bug'],
        options: [
          'A condição do `if` está invertida: deveria devolver o detalhe completo quando NÃO for produção, e a mensagem genérica quando for',
          'A função deveria receber `erro` antes de `env`',
          '`erro.stack` não existe em JavaScript',
          'Falta um `try/catch` em volta do `if`',
        ],
        correctIndex: 0,
        explanation:
          'A condição estava invertida: mostrava a pilha completa exatamente no ambiente em que ninguém deveria vê-la (produção), e escondia o detalhe justamente onde ele ajuda a depurar (desenvolvimento). O detalhe do erro é uma ferramenta de quem está desenvolvendo, não uma informação para quem está usando a aplicação.',
        hints: ['Compare qual ramo do `if` devolve o detalhe completo e qual devolve a mensagem genérica — e em qual ambiente cada um deveria acontecer.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-1-previsao-ambiente',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['deploy-ambientes'],
        difficulty: 'iniciante',
        tags: ['deploy', 'ambientes'],
        code: `function mensagem(env) {
  return env.NODE_ENV === 'production' ? 'modo produção' : 'modo desenvolvimento';
}

console.log(mensagem({ NODE_ENV: 'production' }));
console.log(mensagem({}));`,
        expectedOutput: 'modo produção\nmodo desenvolvimento',
        explanation:
          'A primeira chamada tem `NODE_ENV` igual a `\'production\'` e cai no primeiro ramo. A segunda não define `NODE_ENV` nenhuma — `undefined` não é igual a `\'production\'` — e cai no padrão, "modo desenvolvimento", que é exatamente o comportamento que se espera quando ninguém configurou nada.',
        hints: ['`env.NODE_ENV` no objeto vazio vale `undefined`. Isso é igual a `\'production\'`?'],
      },
    },
    {
      kind: 'summary',
      markdown: `
Dev e produção rodam o mesmo código com configurações diferentes: dados de teste contra dados reais, erro detalhado contra erro genérico. O **build** traduz o código-fonte no que de fato roda, e falha **antes** do deploy de propósito — um defeito que impede o build de terminar nunca chega a aparecer para quem usa a aplicação.

Na próxima aula, o outro lado da configuração: onde um segredo — uma senha, uma chave de API — deveria morar quando ele não pode morar no código.
`.trim(),
    },
  ],
};

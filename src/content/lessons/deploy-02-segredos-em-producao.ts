import type { Lesson } from '../types';

export const lessonDeploySegredosEmProducao: Lesson = {
  id: 'lesson-deploy-2',
  trackId: 'track-deploy',
  title: 'Segredos em Produção',
  language: 'javascript',
  objective:
    'Saber onde um segredo de produção deve morar quando não pode morar no código, e distinguir uma variável pública (embutida no que o navegador baixa) de uma que só o servidor enxerga.',
  concepts: ['deploy-segredos'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
A aula de configuração já disse: segredo não entra em código, nem em commit, nem em log. Falta responder a pergunta que sobra depois disso — se não é no código, **onde** um segredo de produção mora de verdade?

## Onde um segredo vive quando não pode viver no código

Em desenvolvimento, o \`.env\` local resolve — um arquivo na sua máquina, fora do Git, que ninguém mais vê. Em produção não existe "sua máquina": existe um host, e é o **painel dele** (ou um gerenciador de segredos dedicado, em times maiores) que guarda o valor. Você digita a chave lá, uma vez, e o processo do servidor a recebe como variável de ambiente quando sobe — o código nunca muda, só o valor que o ambiente fornece, exatamente como a aula de variáveis de ambiente descreveu.

~~~
Local:      .env (arquivo, fora do Git)         → process.env.DATABASE_URL
Produção:   painel do host / secret manager      → process.env.DATABASE_URL
~~~

## Duas categorias de variável, dois destinos diferentes

Aqui mora uma armadilha específica de aplicações com frontend e backend juntos. Existem dois tipos de variável de ambiente, e eles **não** são igualmente privados:

- **Variável de build** (no Vite, prefixada com \`VITE_\`): é lida na hora do build e fica **embutida no arquivo JavaScript** que o navegador baixa. Ela é pública — qualquer pessoa que abrir as ferramentas de desenvolvedor do navegador a vê, mesmo com o código minificado. Minificar não é esconder; é só deixar difícil de ler, não impossível.
- **Variável de servidor** (lida só no backend, com \`process.env\` do Node): nunca é enviada ao navegador. Só existe na memória do processo que roda no host.

Colocar a chave secreta de um serviço de pagamento numa variável \`VITE_STRIPE_SECRET_KEY\` é o erro mais comum dessa categoria — o nome sugere "variável de ambiente, então está protegida", mas o prefixo \`VITE_\` é exatamente o que a torna pública. A chave secreta (a que pode cobrar, reembolsar, mover dinheiro) pertence ao servidor; só a chave **pública**, feita para ser exposta, vai para o frontend.

## O que fazer quando um segredo vaza

Se uma chave acabou commitada por engano — mesmo que só por um instante, mesmo que já tenha sido removida num commit seguinte — ela precisa ser **trocada**, não apenas apagada do arquivo. O histórico do Git guarda o commit antigo para sempre (a menos que se reescreva o histórico inteiro, o que tem seus próprios riscos), e qualquer pessoa com acesso ao repositório consegue voltar e ler o valor vazado. Apagar do arquivo atual resolve a aparência; trocar a chave no serviço de origem resolve o problema de verdade.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Duas variáveis, dois destinos.
const configDoFrontend = {
  VITE_API_URL: 'https://api.meuapp.com',      // vai para o navegador — pública
  VITE_STRIPE_PUBLIC_KEY: 'pk_live_abc123',    // "pública" está no nome: feita para ser exposta
};

const configDoServidor = {
  DATABASE_URL: 'postgres://usuario:senha@host/banco',  // nunca sai do processo do servidor
  STRIPE_SECRET_KEY: 'sk_live_xyz789',                  // secreta de verdade: nunca vai ao frontend
};`,
      caption: 'O prefixo VITE_ não é decoração: é o que decide se a variável embute no pacote que o navegador baixa.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-2-onde-mora-o-segredo',
        type: 'multiple-choice',
        prompt: 'Uma aplicação vai para produção e precisa da senha de acesso ao banco de dados real. Onde essa senha deve ser configurada?',
        concepts: ['deploy-segredos'],
        difficulty: 'iniciante',
        tags: ['deploy', 'segredos'],
        options: [
          'No painel de variáveis de ambiente do host de produção (ou num gerenciador de segredos), nunca no código nem num arquivo commitado',
          'Direto no código, numa constante bem documentada',
          'Num arquivo `.env` commitado, para o time inteiro ver o valor de produção',
          'Em um comentário no topo do arquivo do servidor, para não se perder',
        ],
        correctIndex: 0,
        explanation:
          'O painel do host (ou um gerenciador de segredos dedicado) é o lugar equivalente, em produção, ao `.env` local em desenvolvimento: um valor configurado fora do código-fonte, que o processo recebe como variável de ambiente ao subir.',
        hints: ['Pense no que o `.env` local resolve em desenvolvimento — e onde existe o equivalente disso quando não há mais "sua máquina".'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-2-variavel-de-build-e-publica',
        type: 'multiple-choice',
        prompt: 'Por que uma variável de ambiente prefixada com `VITE_` NÃO é um lugar seguro para uma chave secreta?',
        concepts: ['deploy-segredos'],
        difficulty: 'intermediario',
        tags: ['deploy', 'segredos', 'build'],
        options: [
          'Porque esse tipo de variável é lida no build e embutida no arquivo JavaScript que o navegador baixa — qualquer pessoa consegue lê-la, mesmo minificada',
          'Porque o prefixo `VITE_` é reservado e causa erro de build',
          'Não há problema: variáveis de build também ficam só no servidor',
          'Porque essas variáveis expiram sozinhas depois de um tempo',
        ],
        correctIndex: 0,
        explanation:
          'Uma variável de build vira parte do pacote entregue ao navegador. "Minificado" muda a legibilidade, não a visibilidade: o valor está lá, em texto, para quem abrir as ferramentas de desenvolvedor. Uma chave secreta de verdade só pode viver numa variável lida exclusivamente pelo servidor.',
        hints: ['Pense em quem, fisicamente, executa o código depois que ele sai do build: o navegador de quem está usando, ou o servidor?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-2-chave-secreta-exposta',
        type: 'multiple-choice',
        prompt: `Este trecho de configuração do frontend está expondo uma chave que deveria ficar só no servidor:

~~~js
const config = {
  VITE_API_URL: 'https://api.meuapp.com',
  VITE_STRIPE_SECRET_KEY: 'sk_live_xyz789',
  VITE_STRIPE_PUBLIC_KEY: 'pk_live_abc123',
};
~~~

Qual é o defeito?`,
        concepts: ['deploy-segredos'],
        difficulty: 'intermediario',
        tags: ['deploy', 'segredos', 'bug'],
        options: [
          '`VITE_STRIPE_SECRET_KEY` tem o prefixo `VITE_`, então essa chave (que move dinheiro) acaba embutida no pacote que o navegador baixa — deveria ser lida só pelo servidor, sem o prefixo',
          'A URL da API nunca deveria ser uma variável de ambiente',
          '`VITE_STRIPE_PUBLIC_KEY` é que está exposta indevidamente',
          'Faltam aspas simples em um dos valores',
        ],
        correctIndex: 0,
        explanation:
          'A chave secreta do Stripe (a que autoriza cobranças e reembolsos) está com o prefixo `VITE_`, que embute a variável no pacote enviado ao navegador. Sem o prefixo, ela deixaria de ser lida pelo build do frontend e passaria a existir só como variável de ambiente do servidor — exatamente onde uma chave que move dinheiro precisa ficar. A chave "PUBLIC" é diferente: ela é feita para ser exposta, então o prefixo nela está correto.',
        hints: ['Das três variáveis, uma tem "SECRET" no próprio nome. O prefixo dela bate com o que o nome promete?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-2-segredo-vazou',
        type: 'order-steps',
        prompt: 'Uma chave de API acabou de ser commitada por engano num repositório público. Coloque as ações na ordem certa.',
        concepts: ['deploy-segredos'],
        difficulty: 'intermediario',
        tags: ['deploy', 'segredos', 'git'],
        steps: [
          { id: 'revogar', text: 'Revogar (invalidar) a chave vazada no painel do serviço que a emitiu', ordem: 1 },
          { id: 'gerar', text: 'Gerar uma chave nova para substituir a antiga', ordem: 2 },
          { id: 'atualizar', text: 'Atualizar a variável de ambiente em produção com a chave nova', ordem: 3 },
          { id: 'remover', text: 'Remover a chave antiga do arquivo no repositório, num commit novo', ordem: 4 },
        ],
        explanation:
          'A prioridade é tirar o poder da chave vazada o quanto antes — por isso revogar vem primeiro, antes até de gerar a substituta. Remover a linha do arquivo é o último passo, e o menos importante dos quatro: o commit antigo com a chave continua no histórico do Git de qualquer jeito, então o que protege de verdade é a chave ter deixado de funcionar.',
        hints: ['A ação que realmente neutraliza o vazamento não mexe no código — mexe no serviço que emitiu a chave.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-2-so-remover-nao-basta',
        type: 'multiple-choice',
        prompt: 'Depois de remover, num commit novo, uma senha que tinha sido commitada por engano dois commits atrás, o repositório está seguro?',
        concepts: ['deploy-segredos'],
        difficulty: 'intermediario',
        tags: ['deploy', 'segredos', 'git'],
        options: [
          'Não: o commit antigo com a senha continua no histórico, e qualquer pessoa com acesso ao repositório consegue voltar e lê-la — a senha precisa ser trocada',
          'Sim: uma vez removida do arquivo atual, o valor desaparece do projeto',
          'Sim, desde que o commit de remoção tenha uma mensagem clara',
          'Não, mas só é um problema se o repositório for público',
        ],
        correctIndex: 0,
        explanation:
          'O Git guarda todo o histórico, não só o estado atual — remover uma linha cria um commit novo, mas o commit antigo, com o valor exposto, continua acessível para quem tiver acesso ao repositório (público ou privado: qualquer colega com acesso já viu). A única forma de neutralizar de verdade é trocar o segredo na origem.',
        hints: ['Pense no que `git log` e `git show` de um commit antigo ainda mostram, mesmo depois de um commit mais novo remover a linha.'],
      },
    },
    {
      kind: 'summary',
      markdown: `
Um segredo de produção mora no painel do host (ou num gerenciador de segredos), nunca no código. Variável de build (\`VITE_\` no Vite) fica embutida no que o navegador baixa — é pública, mesmo minificada; variável de servidor nunca sai do processo. E um segredo que vazou no histórico do Git precisa ser **trocado** — remover a linha não apaga o commit antigo que ainda o expõe.

Na próxima aula, o outro lado da moeda: como o frontend e o backend, depois do build e configurados, de fato chegam a uma URL que alguém consegue acessar.
`.trim(),
    },
  ],
};

import type { Lesson } from '../types';

export const lessonDeployPublicarAAplicacao: Lesson = {
  id: 'lesson-deploy-3',
  trackId: 'track-deploy',
  title: 'Publicar o Frontend e o Backend',
  language: 'javascript',
  objective:
    'Entender por que o frontend publicado é servido como arquivo estático e o backend publicado é um processo em pé, e por que esse processo precisa ler a porta do ambiente em vez de escolher uma fixa.',
  concepts: ['deploy-publicar'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Frontend e backend chegam ao ar de dois jeitos bem diferentes — e confundir os dois é uma fonte comum de confusão em quem está publicando pela primeira vez.

## Frontend: arquivo estático

Depois do build, um frontend vira um punhado de arquivos — \`index.html\`, alguns \`.js\`, alguns \`.css\` — que não mudam sozinhos e não "rodam" em lugar nenhum: eles só existem, prontos para serem entregues. Um host de arquivos estáticos os guarda e, a cada pedido, devolve o arquivo pedido — o mesmo trabalho que um servidor de arquivos qualquer faz, sem executar nada a cada vez. É por isso que hospedar um frontend costuma ser rápido e barato: não há processo rodando esperando pedidos, só arquivos sendo entregues.

## Backend: um processo em pé

Um backend é diferente: o código dele **roda continuamente**, ouvindo uma porta, pronto para responder a cada pedido que chega — exatamente como a aula do primeiro servidor descreveu. Em produção, esse processo:

- é **iniciado** pelo host, rodando o comando de start do projeto;
- **fica de pé** indefinidamente, não termina depois de responder um pedido;
- é **reiniciado automaticamente** pelo host se cair (um erro não tratado, por exemplo);
- tem tudo que escreve com \`console.log\` guardado como **log**, consultável depois — é a única janela para o que aconteceu num servidor que ninguém está olhando ao vivo.

## A porta não é escolha sua

No seu computador, escolher \`app.listen(3000)\` é natural — é a sua máquina, você decide a porta. Em produção, isso quebra: o host decide qual porta está disponível para o seu processo, e informa esse número através de uma variável de ambiente, \`process.env.PORT\`. Um servidor que ignora essa variável e insiste numa porta fixa simplesmente não recebe nenhum pedido em produção — o host está encaminhando o tráfego para uma porta diferente da que o processo está escutando.

~~~js
const porta = process.env.PORT || 3000; // 3000 só quando NÃO houver PORT — ou seja, em dev
app.listen(porta);
~~~

Repare que o padrão (\`3000\`) continua existindo — ele só nunca é usado em produção, porque lá \`PORT\` sempre vem definida pelo host.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Simulação: como o host decide a porta do processo.
function iniciar(env, ouvirEm) {
  const porta = env.PORT || 3000;
  ouvirEm(porta);
  return porta;
}

iniciar({}, (p) => {});             // 3000 — desenvolvimento, sem PORT definida
iniciar({ PORT: '8080' }, (p) => {}); // '8080' — produção, o host decidiu`,
      caption: 'process.env.PORT muda a cada deploy; o número fixo no código nunca deveria ser usado fora de desenvolvimento.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-3-frontend-vs-backend',
        type: 'multiple-choice',
        prompt: 'Qual a diferença central entre publicar um frontend e publicar um backend?',
        concepts: ['deploy-publicar'],
        difficulty: 'iniciante',
        tags: ['deploy', 'frontend', 'backend'],
        options: [
          'O frontend vira arquivos estáticos, só entregues sob pedido; o backend é um processo que fica de pé, executando continuamente e ouvindo uma porta',
          'Não há diferença real: os dois são "subidos" da mesma forma',
          'O frontend precisa de um processo em pé; o backend não',
          'O backend é sempre mais lento de publicar que o frontend',
        ],
        correctIndex: 0,
        explanation:
          'Um frontend, depois do build, é conteúdo estático — arquivos que não executam nada, só são entregues. Um backend precisa de um processo rodando o tempo todo para responder a cada pedido, e por isso depende de coisas que um arquivo estático não precisa: porta, reinício automático, log.',
        hints: ['Pense no que acontece quando ninguém está acessando a aplicação: o frontend "faz" alguma coisa? E o backend?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-3-porta-fixa-nao-funciona',
        type: 'multiple-choice',
        prompt: 'Um servidor tem `app.listen(3000)` escrito direto no código, com o número fixo. O que tende a acontecer quando ele é publicado num host de produção?',
        concepts: ['deploy-publicar'],
        difficulty: 'intermediario',
        tags: ['deploy', 'porta'],
        options: [
          'O processo escuta na porta 3000, mas o host encaminha o tráfego para a porta que ele mesmo atribuiu — diferente de 3000 — e nenhum pedido chega ao servidor',
          'Funciona normalmente: 3000 é a porta padrão de todo host',
          'O host altera automaticamente o código do aluno para usar a porta certa',
          'O deploy falha imediatamente, antes mesmo do processo iniciar',
        ],
        correctIndex: 0,
        explanation:
          'O host de produção decide qual porta está disponível para aquele processo, e informa esse número através de `process.env.PORT`. Um código que ignora essa variável e escuta um número fixo continua rodando — só que numa porta para a qual nenhum pedido está sendo encaminhado.',
        hints: ['O processo não trava nem dá erro. O problema é mais sutil: ele simplesmente não recebe tráfego nenhum.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-3-ordem-do-backend',
        type: 'order-steps',
        prompt: 'Coloque na ordem certa o que acontece quando um backend é publicado num host.',
        concepts: ['deploy-publicar'],
        difficulty: 'iniciante',
        tags: ['deploy', 'backend', 'processo'],
        steps: [
          { id: 'instala', text: 'O host instala as dependências do projeto', ordem: 1 },
          { id: 'inicia', text: 'O host roda o comando de start, iniciando o processo do servidor', ordem: 2 },
          { id: 'porta', text: 'O processo lê `process.env.PORT` e começa a ouvir nessa porta', ordem: 3 },
          { id: 'atende', text: 'O host encaminha os pedidos que chegam na URL pública para essa porta', ordem: 4 },
        ],
        explanation:
          'As dependências precisam existir antes do processo poder iniciar; o processo precisa estar ouvindo a porta certa antes do host poder encaminhar qualquer coisa para ele. Inverter essa ordem — por exemplo, tentar atender pedidos antes de escutar a porta certa — não tem como funcionar.',
        hints: ['Pense em qual passo é pré-requisito físico do seguinte: dá para escutar uma porta sem o processo já estar rodando?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-3-servidor-com-porta-fixa',
        type: 'multiple-choice',
        prompt: `Este servidor funciona no computador de quem o escreveu, mas não recebe nenhum pedido depois de publicado:

~~~js
function iniciarServidor(env, ouvirNaPorta) {
  ouvirNaPorta(3000);
}
~~~

Qual é o defeito?`,
        concepts: ['deploy-publicar'],
        difficulty: 'intermediario',
        tags: ['deploy', 'porta', 'bug'],
        options: [
          'A porta está fixa em 3000 em vez de ler `env.PORT` (com 3000 só como padrão) — em produção o host atribui outra porta, e o tráfego nunca chega a 3000',
          'A função deveria se chamar `listen`, não `iniciarServidor`',
          '`ouvirNaPorta` deveria ser chamado duas vezes',
          'Não há nada de errado; o problema está em outro lugar do sistema',
        ],
        correctIndex: 0,
        explanation:
          'A porta 3000 fixa no código é exatamente a certa em desenvolvimento, mas quase nunca a que o host de produção atribui. Lendo `env.PORT` primeiro, com 3000 como padrão (`env.PORT || 3000`), o mesmo código funciona nos dois ambientes: usa o que o host mandar quando houver um, e cai no padrão só quando não houver.',
        hints: ['Quem decide a porta certa em produção — o código, ou o host?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-deploy-3-por-que-reiniciar-sozinho',
        type: 'multiple-choice',
        prompt: 'Por que um host de produção reinicia automaticamente o processo do backend quando ele cai, em vez de esperar alguém perceber e reiniciar manualmente?',
        concepts: ['deploy-publicar'],
        difficulty: 'intermediario',
        tags: ['deploy', 'backend', 'confiabilidade'],
        options: [
          'Porque ninguém está olhando o processo o tempo todo, e o tempo entre a queda e um humano perceber vira tempo em que a aplicação inteira fica fora do ar para quem está usando',
          'Porque reiniciar sozinho é mais barato para o host',
          'Porque um processo que caiu nunca tem uma causa que valha a pena investigar',
          'Não é uma prática real; todo reinício em produção é manual',
        ],
        correctIndex: 0,
        explanation:
          'O reinício automático existe para reduzir o tempo fora do ar — sem ele, a aplicação ficaria indisponível até alguém notar e agir manualmente, o que pode levar minutos ou horas. Isso não substitui investigar por que o processo caiu; só evita que a indisponibilidade dure mais do que precisa.',
        hints: ['Pense na diferença de tempo entre "o processo caiu e reinicia sozinho em segundos" e "o processo caiu e alguém precisa perceber primeiro".'],
      },
    },
    {
      kind: 'summary',
      markdown: `
Frontend publicado é arquivo estático — sem processo rodando, só entrega sob pedido. Backend publicado é um processo em pé, iniciado pelo host, reiniciado automaticamente se cair, e com tudo que ele registra guardado como log. A porta não é escolhida no código: o host a atribui em \`process.env.PORT\`, e um servidor que ignora essa variável simplesmente não recebe tráfego.

Na próxima e última aula da trilha, o que falta para a aplicação inteira: o banco em produção, o domínio que aponta para ela, e o HTTPS que protege o que trafega até lá.
`.trim(),
    },
  ],
};

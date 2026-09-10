import type { Lesson } from '../types';

export const lessonAutenticacao: Lesson = {
  id: 'lesson-web-5',
  trackId: 'track-web',
  title: 'Autenticação: Provar Quem Você É',
  language: 'javascript',
  objective:
    'Separar autenticação de autorização, e entender por que a decisão de permissão só vale no servidor.',
  concepts: ['autenticacao', 'seguranca-web'],
  status: 'published',
  estimatedMinutes: 26,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Duas palavras parecidas, dois problemas diferentes — e confundi-las produz bugs de segurança de verdade.

**Autenticação** responde *"quem é você?"*. É o login.

**Autorização** responde *"você pode fazer isto?"*. É a permissão.

A ordem importa: primeiro se descobre quem é, depois se decide o que pode. Os códigos de status já separavam os dois casos, e agora o nome faz sentido:

- **\`401 Unauthorized\`** — não sei quem você é. Faça login. (O nome do padrão é enganoso: apesar de "unauthorized", ele é sobre autenticação.)
- **\`403 Forbidden\`** — sei quem você é, e você não pode. Fazer login de novo não muda nada.

Se a sua API responde \`401\` para um usuário logado que tentou acessar algo alheio, o cliente vai mandá-lo para a tela de login — e ele vai entrar de novo, tentar de novo, e receber \`401\` de novo. O status errado vira um laço sem saída.

## HTTP não lembra de você

Cada pedido HTTP é independente. O servidor não tem memória de que você fez login no pedido anterior — **cada pedido precisa se identificar sozinho**.

É por isso que existe algo para carregar junto. Duas formas, e elas resolvem o mesmo problema por caminhos diferentes:

**Sessão com cookie.** O servidor guarda os dados da sua sessão e te dá um identificador. O navegador manda esse cookie sozinho, em todo pedido, sem você escrever uma linha. Simples, e o servidor pode encerrar a sessão quando quiser — ele é o dono do registro.

**Token.** O servidor te dá um crachá assinado com as informações dentro. Você o guarda e o manda no cabeçalho \`Authorization\` em cada pedido. O servidor não guarda nada: ele confere a assinatura e confia no conteúdo. Mais fácil de escalar, e o assunto da próxima aula.

A diferença prática está em quem guarda o estado. Sessão: o servidor lembra, e por isso consegue esquecer. Token: ninguém lembra, e por isso **revogar é difícil** — um crachá válido continua válido até vencer.

## A regra que não tem exceção

**A decisão de permissão acontece no servidor. Sempre.**

O cliente pode — e deve — esconder o que a pessoa não pode fazer: um botão que leva a um \`403\` é uma promessa quebrada. Mas isso é **experiência**, não proteção. Quem abre o console do navegador muda qualquer variável, e quem sabe o endereço chama direto sem passar pela sua tela.

Toda vez que o servidor recebe um pedido, ele precisa perguntar de novo: *quem é este, e ele pode fazer isto com este recurso?* Não basta checar que a pessoa está logada — é preciso checar que **este** pedido, sobre **este** item, é permitido para **ela**.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// No cliente: identificar-se em cada pedido
await fetch(API + '/pedidos/42', {
  headers: { Authorization: 'Bearer ' + token },
});

// No servidor, o esqueleto de toda rota protegida:
function apagarPedido(pedidoId, usuario) {
  if (!usuario) {
    return { status: 401 };          // não sei quem é você
  }

  const pedido = banco.buscarPedido(pedidoId);
  if (!pedido) {
    return { status: 404 };
  }

  // A pergunta que se esquece: não basta estar logado.
  // Este pedido é DESTE usuário?
  if (pedido.usuarioId !== usuario.id && usuario.papel !== 'admin') {
    return { status: 403 };          // sei quem é você, e não pode
  }

  banco.apagar(pedidoId);
  return { status: 204 };
}`,
      caption:
        'A falha mais comum de autorização não é esquecer o login — é checar só o login. Um usuário autenticado chamando `/pedidos/99` com o id de outra pessoa é o teste que quase nenhuma API passa na primeira versão.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-5-401-ou-403',
        type: 'multiple-choice',
        prompt:
          'Uma usuária logada tenta abrir `/pedidos/99`, que pertence a outra pessoa. O que o servidor deve responder?',
        concepts: ['autenticacao', 'http'],
        difficulty: 'intermediario',
        tags: ['web', 'autenticacao'],
        options: [
          '`401`, porque ela não tem autorização para esse pedido',
          '`403` ou `404`, porque ela é conhecida e simplesmente não pode',
          '`200` com o pedido, já que ela fez login',
          '`400`, porque o id do pedido está errado para ela',
        ],
        correctIndex: 1,
        explanation:
          'Ela **está** autenticada: o servidor sabe quem é. Falta permissão, e isso é `403`. Responder `401` mandaria o cliente para a tela de login, ela entraria de novo e receberia `401` outra vez — um laço sem saída. O `404` também é uma resposta legítima aqui, e às vezes preferível: dizer "não existe" evita confirmar a um estranho que o pedido 99 existe. O `400` é sobre o pedido estar malformado, o que não é o caso.',
        hints: [
          'O servidor sabe quem ela é? Então o problema é de identidade ou de permissão?',
          'Se a resposta manda o cliente refazer o login, o que acontece na segunda tentativa?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-5-prever-permissao',
        type: 'predict-output',
        prompt:
          'Esta checagem de permissão tem um defeito. O que ela imprime nos três casos?',
        concepts: ['autenticacao', 'condicoes'],
        difficulty: 'intermediario',
        tags: ['web', 'autenticacao'],
        code: `function podeVer(pedido, usuario) {
  if (!usuario) return false;
  return true;
}

const pedidoDaAna = { id: 42, usuarioId: 1 };

console.log(podeVer(pedidoDaAna, null));
console.log(podeVer(pedidoDaAna, { id: 1 }));
console.log(podeVer(pedidoDaAna, { id: 2 }));`,
        expectedOutput: 'false\ntrue\ntrue',
        explanation:
          'A terceira linha é o defeito. O usuário `2` não tem nada a ver com o pedido da Ana, e a função libera — porque ela só pergunta se **existe alguém logado**, nunca se esse alguém é o dono. É a falha de autorização mais comum que existe, e ela não aparece em nenhum teste que use só a conta certa: você precisa testar com a conta de outra pessoa. A correção é comparar `pedido.usuarioId` com `usuario.id`.',
        hints: [
          'A função compara o usuário com o pedido em algum momento?',
          'O terceiro caso é uma pessoa diferente da dona do pedido. A função percebe?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-5-lacuna-dono',
        type: 'fill-blank',
        prompt:
          'Complete a checagem. Pode ver quem é **dono** do pedido, e também qualquer administrador.',
        concepts: ['autenticacao', 'condicoes'],
        difficulty: 'intermediario',
        tags: ['web', 'autenticacao'],
        template: `function podeVer(pedido, usuario) {
  if (!usuario) return false;

  const ehDono = pedido.usuarioId {{1}} usuario.id;
  const ehAdmin = usuario.papel === 'admin';

  return ehDono {{2}} ehAdmin;
}`,
        blanks: [
          { placeholder: 'compara', size: 4 },
          { placeholder: 'basta um', size: 3 },
        ],
        tests: [
          {
            description: 'o dono pode ver',
            assertion: `if (podeVer({ id: 42, usuarioId: 1 }, { id: 1, papel: 'cliente' }) !== true) throw new Error("O dono do pedido deveria poder ver.");`,
          },
          {
            description: 'outra pessoa não pode',
            assertion: `if (podeVer({ id: 42, usuarioId: 1 }, { id: 2, papel: 'cliente' }) !== false) throw new Error("Um usuário que não é dono e não é admin não pode ver o pedido alheio.");`,
          },
          {
            description: 'administrador pode ver o de qualquer um',
            assertion: `if (podeVer({ id: 42, usuarioId: 1 }, { id: 9, papel: 'admin' }) !== true) throw new Error("Administrador pode ver qualquer pedido.");`,
          },
          {
            description: 'sem usuário, ninguém vê',
            assertion: `
              if (podeVer({ id: 42, usuarioId: 1 }, null) !== false) throw new Error("Sem usuário autenticado, a resposta é false.");
              if (podeVer({ id: 42, usuarioId: 1 }, undefined) !== false) throw new Error("Sem usuário autenticado, a resposta é false.");
            `,
            hidden: true,
          },
          {
            description: 'ids de tipos diferentes não passam por iguais',
            assertion: `
              if (podeVer({ id: 42, usuarioId: 1 }, { id: '1', papel: 'cliente' }) !== false) throw new Error("O id '1' em texto não é o mesmo que o número 1. Uma comparação frouxa deixaria passar — e o dia em que os ids virarem texto, isso libera acesso indevido.");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'só o dono e os administradores passam',
            generate: `
              const donoId = Math.floor(rnd() * 5);
              const usuarioId = Math.floor(rnd() * 5);
              const papel = rnd() < 0.25 ? 'admin' : 'cliente';

              return { donoId: donoId, usuarioId: usuarioId, papel: papel };
            `,
            check: `
              const pedido = { id: 42, usuarioId: caso.donoId };
              const usuario = { id: caso.usuarioId, papel: caso.papel };

              const esperado = caso.donoId === caso.usuarioId || caso.papel === 'admin';
              const obtido = podeVer(pedido, usuario);

              if (obtido !== esperado) {
                throw new Error("dono " + caso.donoId + ", usuário " + caso.usuarioId + " (" + caso.papel + "): esperava " + esperado + ", veio " + obtido + ".");
              }
            `,
          },
        ],
        explanation:
          'A comparação estrita é o ponto: com a frouxa, `1` e `"1"` passariam por iguais — e no dia em que os identificadores virarem texto vindo de uma URL, uma comparação distraída libera acesso indevido. Já o operador da segunda lacuna é `||` porque as duas condições são caminhos alternativos: basta ser dono **ou** administrador. Trocar por `&&` exigiria as duas ao mesmo tempo, e nenhum cliente conseguiria ver o próprio pedido.',
        hints: [
          'É a comparação que não converte tipo antes de comparar.',
          'Basta ser dono OU administrador — qual operador significa "basta um dos dois"?',
        ],
        solution: ['===', '||'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-5-ordenar-guardas',
        type: 'order-steps',
        prompt:
          'Uma rota protegida faz as checagens numa ordem específica, e trocá-las produz o status errado. Coloque as guardas na ordem certa.',
        concepts: ['autenticacao', 'http'],
        difficulty: 'intermediario',
        tags: ['web', 'autenticacao'],
        steps: [
          { id: 'quem', text: 'Sem usuário identificado, responder 401', ordem: 1 },
          { id: 'existe', text: 'Sem o recurso no banco, responder 404', ordem: 2 },
          { id: 'pode', text: 'Se não for dono nem administrador, responder 403', ordem: 3 },
          { id: 'fazer', text: 'Executar a operação e responder o status de sucesso', ordem: 4 },
        ],
        explanation:
          'Identidade antes de existência: sem saber quem está pedindo, responder `404` já contaria a um estranho que aquele recurso não existe — e responder `403` afirmaria que ele existe. E permissão só depois de existência, porque decidir se alguém é dono exige ter o recurso em mãos para comparar. A operação vem por último, quando as três perguntas já foram respondidas.',
        hints: [
          'Antes de dizer se algo existe, faz sentido saber com quem você está falando?',
          'Para decidir se a pessoa é dona do recurso, você precisa do recurso.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-5-autorizar',
        type: 'code',
        prompt: `Crie \`autorizar(pedido, usuario, acao)\`, que **retorna** o status HTTP que o servidor deve responder.\n\n- Sem usuário → \`401\`.\n- Pedido inexistente (\`null\`) → \`404\`.\n- Ler (\`"ler"\`): dono ou admin → \`200\`; qualquer outro → \`403\`.\n- Apagar (\`"apagar"\`): **só** admin → \`204\`; qualquer outro, inclusive o dono → \`403\`.\n- Ação desconhecida → \`400\`.\n\nA ordem das checagens importa: identidade antes de existência, existência antes de permissão.`,
        concepts: ['autenticacao', 'http'],
        difficulty: 'intermediario',
        tags: ['web', 'autenticacao'],
        initialCode: `function autorizar(pedido, usuario, acao) {
  // Guardas na ordem: quem é você, existe isso, você pode.
}

console.log(autorizar({ id: 42, usuarioId: 1 }, null, 'ler'));                       // 401
console.log(autorizar(null, { id: 1, papel: 'cliente' }, 'ler'));                    // 404
console.log(autorizar({ id: 42, usuarioId: 1 }, { id: 1, papel: 'cliente' }, 'ler')); // 200`,
        hints: [
          'Comece pelas guardas de saída rápida: sem usuário, e sem pedido.',
          'Depois calcule uma vez se é dono e se é admin, e use isso nas duas ações.',
          'Apagar é mais restrito que ler: nem o dono pode.',
          'A ação desconhecida cai no fim, depois de todas as conhecidas.',
        ],
        tests: [
          {
            description: 'A função autorizar existe',
            assertion: `if (typeof autorizar !== 'function') throw new Error("Crie uma função chamada 'autorizar'.");`,
          },
          {
            description: 'sem usuário responde 401, mesmo com pedido inexistente',
            assertion: `
              if (autorizar({ id: 42, usuarioId: 1 }, null, 'ler') !== 401) throw new Error("Sem usuário, a resposta é 401.");
              if (autorizar(null, null, 'ler') !== 401) throw new Error("A identidade é checada ANTES da existência: sem usuário, 401 mesmo que o pedido não exista.");
            `,
          },
          {
            description: 'pedido inexistente responde 404',
            assertion: `if (autorizar(null, { id: 1, papel: 'cliente' }, 'ler') !== 404) throw new Error("Usuário conhecido e pedido inexistente: 404.");`,
          },
          {
            description: 'o dono lê e recebe 200; o estranho recebe 403',
            assertion: `
              if (autorizar({ id: 42, usuarioId: 1 }, { id: 1, papel: 'cliente' }, 'ler') !== 200) throw new Error("O dono pode ler: 200.");
              if (autorizar({ id: 42, usuarioId: 1 }, { id: 2, papel: 'cliente' }, 'ler') !== 403) throw new Error("Quem não é dono nem admin recebe 403.");
            `,
          },
          {
            description: 'apagar é só do admin — nem o dono pode',
            assertion: `
              if (autorizar({ id: 42, usuarioId: 1 }, { id: 9, papel: 'admin' }, 'apagar') !== 204) throw new Error("Admin apagando recebe 204.");
              if (autorizar({ id: 42, usuarioId: 1 }, { id: 1, papel: 'cliente' }, 'apagar') !== 403) throw new Error("Nem o dono pode apagar: 403.");
            `,
            hidden: true,
          },
          {
            description: 'o admin lê qualquer pedido',
            assertion: `if (autorizar({ id: 42, usuarioId: 1 }, { id: 9, papel: 'admin' }, 'ler') !== 200) throw new Error("Admin pode ler qualquer pedido: 200.");`,
            hidden: true,
          },
          {
            description: 'ação desconhecida responde 400',
            assertion: `if (autorizar({ id: 42, usuarioId: 1 }, { id: 9, papel: 'admin' }, 'teletransportar') !== 400) throw new Error("Ação que a API não conhece é pedido malformado: 400.");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'a resposta segue a tabela de permissões, em qualquer combinação',
            generate: `
              const acoes = ['ler', 'apagar', 'teletransportar'];

              return {
                temUsuario: rnd() < 0.85,
                temPedido: rnd() < 0.85,
                donoId: Math.floor(rnd() * 3),
                usuarioId: Math.floor(rnd() * 3),
                papel: rnd() < 0.3 ? 'admin' : 'cliente',
                acao: acoes[Math.floor(rnd() * acoes.length)],
              };
            `,
            check: `
              const pedido = caso.temPedido ? { id: 42, usuarioId: caso.donoId } : null;
              const usuario = caso.temUsuario ? { id: caso.usuarioId, papel: caso.papel } : null;

              let esperado;
              if (!caso.temUsuario) esperado = 401;
              else if (!caso.temPedido) esperado = 404;
              else {
                const ehDono = caso.donoId === caso.usuarioId;
                const ehAdmin = caso.papel === 'admin';

                if (caso.acao === 'ler') esperado = ehDono || ehAdmin ? 200 : 403;
                else if (caso.acao === 'apagar') esperado = ehAdmin ? 204 : 403;
                else esperado = 400;
              }

              const obtido = autorizar(pedido, usuario, caso.acao);

              if (obtido !== esperado) {
                throw new Error(
                  "usuário " + (caso.temUsuario ? caso.usuarioId + '/' + caso.papel : 'nenhum') +
                  ", pedido " + (caso.temPedido ? 'do ' + caso.donoId : 'inexistente') +
                  ", ação " + caso.acao + ": esperava " + esperado + ", veio " + obtido + "."
                );
              }
            `,
          },
        ],
        solution: `function autorizar(pedido, usuario, acao) {
  if (!usuario) return 401;
  if (!pedido) return 404;

  const ehDono = pedido.usuarioId === usuario.id;
  const ehAdmin = usuario.papel === 'admin';

  if (acao === 'ler') return ehDono || ehAdmin ? 200 : 403;
  if (acao === 'apagar') return ehAdmin ? 204 : 403;

  return 400;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `**Autenticação** é quem você é; **autorização** é o que você pode. O \`401\` diz "não sei quem é você" e o \`403\` diz "sei, e você não pode" — trocar os dois cria um laço em que a pessoa faz login de novo para receber o mesmo erro. HTTP não lembra de nada, então cada pedido se identifica sozinho: por cookie de sessão, em que o servidor guarda o registro e por isso consegue encerrá-lo, ou por token, em que ninguém guarda nada e por isso revogar é difícil. E a regra sem exceção: a decisão de permissão acontece no servidor, a cada pedido, sobre **aquele** recurso. Checar só que a pessoa está logada é a falha de autorização mais comum que existe — e ela nunca aparece nos testes feitos com a conta certa.`,
    },
  ],
};

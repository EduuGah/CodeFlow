import type { Lesson } from '../types';

const NOTIFICAR = `function notificarPedidoEnviado(pedido, enviarEmail) {
  if (!pedido.email) return false;
  enviarEmail(pedido.email, 'Seu pedido ' + pedido.id + ' foi enviado!');
  return true;
}`;

export const lessonTestesDubles: Lesson = {
  id: 'lesson-testes-4',
  trackId: 'track-testes',
  title: 'Dublês: Substituir para Testar',
  language: 'javascript',
  objective:
    'Entender por que uma função que depende de algo externo (e-mail, relógio, banco) precisa de um substituto para ser testada isoladamente, e escrever um dublê simples.',
  concepts: ['testes-dubles'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
\`notificarPedidoEnviado\` manda um e-mail de verdade. Testá-la "de verdade" mandaria um e-mail de verdade a cada execução da suíte — para um endereço que talvez nem exista, centenas de vezes ao dia. É disso que os dublês salvam.

## O problema: dependências externas

Uma função que fala com o mundo de fora — envia e-mail, grava no banco, consulta o relógio, chama outra API — é difícil de testar isoladamente, porque cada teste teria que de fato fazer aquilo. Lento, caro, e às vezes destrutivo (imagine testar \`apagarConta\` contra o banco de produção).

## A saída: receber a dependência por fora

A técnica chama-se **injeção de dependência**, e o nome é mais complicado que a ideia: em vez de a função **decidir sozinha** como enviar o e-mail, ela **recebe** a função de enviar como parâmetro.

~~~js
function notificarPedidoEnviado(pedido, enviarEmail) {
  if (!pedido.email) return false;
  enviarEmail(pedido.email, 'Seu pedido ' + pedido.id + ' foi enviado!');
  return true;
}
~~~

Em produção, alguém chama com a função de e-mail de verdade: \`notificarPedidoEnviado(pedido, enviarEmailDeVerdade)\`. No teste, chama com um **dublê**: uma função falsa que faz o papel da de verdade, sem os efeitos dela.

## O dublê mais simples: o espião

~~~js
function criarEspiao() {
  const chamadas = [];
  function espiao(...args) {
    chamadas.push(args);
  }
  espiao.chamadas = chamadas;
  return espiao;
}

const enviarEmail = criarEspiao();
notificarPedidoEnviado({ id: 7, email: 'ana@exemplo.com' }, enviarEmail);

assert(enviarEmail.chamadas.length === 1, 'chamou o envio de e-mail uma vez');
assert(enviarEmail.chamadas[0][0] === 'ana@exemplo.com', 'enviou para o e-mail do pedido');
~~~

O **espião** não faz nada além de **guardar** como foi chamado — quantas vezes, com quais argumentos. É o dublê mais comum, porque a maioria dos testes só quer confirmar "isso foi chamado do jeito certo", sem se importar com o que a chamada de verdade faria.

Bibliotecas de teste como o Vitest (usado nesta plataforma) já vêm com essa fábrica pronta: \`vi.fn()\` cria exatamente esse espião — com \`.mock.calls\` no lugar do \`.chamadas\` caseiro daqui. A ideia é idêntica; só o nome muda.

## Quando o dublê precisa "responder"

Às vezes a função testada usa o **retorno** da dependência, não só chama ela. Aí o dublê precisa devolver algo:

~~~js
function buscarDesconto(usuarioId, consultarBanco) {
  const usuario = consultarBanco(usuarioId);
  return usuario.vip ? 0.2 : 0;
}

function dubleDoBanco(usuarioId) {
  return { vip: true }; // sempre devolve um VIP, para este teste
}

assert(buscarDesconto(1, dubleDoBanco) === 0.2, 'usuário vip tem 20% de desconto');
~~~

Este dublê nem guarda chamadas — ele só devolve um valor fixo, controlado pelo teste, no lugar de uma consulta real ao banco.

## O que NÃO virar dublê

Só as dependências **externas** — e-mail, banco, relógio, rede — merecem dublê. A lógica que a própria função contém deveria ser testada de verdade, chamando a função de verdade. Um dublê para tudo esconderia justamente o que o teste deveria provar.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `function processarPagamento(valor, cobrarCartao) {
  if (valor <= 0) return { sucesso: false, motivo: 'valor inválido' };
  const aprovado = cobrarCartao(valor);
  return aprovado ? { sucesso: true } : { sucesso: false, motivo: 'cartão recusado' };
}

// Dublê que sempre aprova.
function cartaoQueAprova(valor) {
  return true;
}

// Dublê que sempre recusa.
function cartaoQueRecusa(valor) {
  return false;
}

assert(processarPagamento(100, cartaoQueAprova).sucesso === true, 'cartão aprovado gera sucesso');
assert(processarPagamento(100, cartaoQueRecusa).sucesso === false, 'cartão recusado não gera sucesso');
assert(processarPagamento(-10, cartaoQueAprova).sucesso === false, 'valor inválido nem chega a cobrar o cartão');`,
      caption:
        'Dois dublês simples — um que sempre aprova, outro que sempre recusa — testam os dois caminhos de processarPagamento sem depender de uma operadora de cartão de verdade.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-4-por-que',
        type: 'multiple-choice',
        prompt:
          'Por que testar `notificarPedidoEnviado` chamando a função de enviar e-mail de verdade é uma má ideia?',
        concepts: ['testes-dubles'],
        difficulty: 'iniciante',
        tags: ['testes', 'dubles'],
        options: [
          'Porque enviaria um e-mail de verdade a cada execução da suíte de testes, para um endereço que pode nem existir',
          'Porque JavaScript não permite chamar funções que enviam e-mail',
          'Porque a função de enviar e-mail sempre lança um erro em testes',
          'Porque não há problema nenhum: é assim que se deve testar',
        ],
        correctIndex: 0,
        explanation:
          'O problema é o efeito colateral real: a suíte de testes roda dezenas ou centenas de vezes ao dia (a cada commit, no CI), e cada rodada mandaria e-mails de verdade. O mesmo vale para gravar no banco de produção ou cobrar um cartão de crédito de verdade.',
        hints: ['Pense em quantas vezes a suíte de testes roda por dia, e o que aconteceria a cada rodada.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-4-espiao',
        type: 'code',
        prompt:
          'Escreva `criarEspiao()`: devolve uma função que guarda os argumentos de cada chamada numa lista acessível por `.chamadas`. Cada chamada guardada é a lista de argumentos daquela chamada.',
        concepts: ['testes-dubles'],
        difficulty: 'intermediario',
        tags: ['testes', 'dubles', 'espiao'],
        initialCode: `function criarEspiao() {
  // Devolva uma função com uma propriedade .chamadas (lista de listas de argumentos).
}

const espiao = criarEspiao();
espiao('a', 1);
espiao('b', 2);
console.log(espiao.chamadas.length); // 2
console.log(espiao.chamadas[0]); // ['a', 1]`,
        tests: [
          {
            description: 'Um espião novo começa sem chamadas',
            assertion: `const e = criarEspiao();
if (e.chamadas.length !== 0) throw new Error('um espião recém-criado deveria ter 0 chamadas, tem ' + e.chamadas.length);`,
          },
          {
            description: 'Cada chamada é guardada, na ordem, com os argumentos certos',
            assertion: `const e = criarEspiao();
e('primeira');
e('segunda', 42);
if (e.chamadas.length !== 2) throw new Error('esperava 2 chamadas guardadas, tem ' + e.chamadas.length);
if (JSON.stringify(e.chamadas[0]) !== '["primeira"]') throw new Error('a primeira chamada deveria ser ["primeira"], veio ' + JSON.stringify(e.chamadas[0]));
if (JSON.stringify(e.chamadas[1]) !== '["segunda",42]') throw new Error('a segunda chamada deveria ser ["segunda",42], veio ' + JSON.stringify(e.chamadas[1]));`,
          },
          {
            description: 'O espião pode ser chamado como qualquer função (não lança erro)',
            assertion: `const e = criarEspiao();
e();
e(1, 2, 3);
if (e.chamadas.length !== 2) throw new Error('esperava 2 chamadas, tem ' + e.chamadas.length);`,
          },
        ],
        solution: `function criarEspiao() {
  const chamadas = [];
  function espiao(...args) {
    chamadas.push(args);
  }
  espiao.chamadas = chamadas;
  return espiao;
}`,
        hints: [
          'A lista de chamadas precisa existir fora da função, num escopo que ela consegue alcançar — e que quem chama `criarEspiao()` também consegue ler.',
          'Use `...args` para capturar qualquer quantidade de argumentos, e dê `push` na lista dentro da função.',
          'No fim, pendure a lista na própria função com `espiao.chamadas = chamadas` antes de devolvê-la.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-4-testar-notificar',
        type: 'write-test',
        prompt:
          '`notificarPedidoEnviado(pedido, enviarEmail)` abaixo está **correta**: só envia o e-mail se o pedido tiver um. Escreva um dublê (um espião simples, como na aula) e teste os dois casos: pedido com e-mail (o dublê é chamado) e sem e-mail (não é chamado).',
        concepts: ['testes-dubles'],
        difficulty: 'avancado',
        tags: ['testes', 'dubles', 'assert'],
        subject: NOTIFICAR,
        initialCode: `// Escreva um dublê (função que guarda as chamadas) e use-o para testar
// notificarPedidoEnviado nos dois casos: com e-mail e sem e-mail.

`,
        mutants: [
          {
            description: 'envia o e-mail mesmo quando o pedido não tem endereço',
            code: `function notificarPedidoEnviado(pedido, enviarEmail) {
  enviarEmail(pedido.email, 'Seu pedido ' + pedido.id + ' foi enviado!');
  return true;
}`,
          },
          {
            description: 'nunca envia o e-mail, mesmo quando o pedido tem endereço',
            code: `function notificarPedidoEnviado(pedido, enviarEmail) {
  if (!pedido.email) return false;
  return true;
}`,
          },
        ],
        hints: [
          'Comece criando o dublê: `let chamadas = []; function espiao(...args) { chamadas.push(args); }`.',
          'Chame `notificarPedidoEnviado({ id: 1, email: "x@y.com" }, espiao)` e afirme que `chamadas.length === 1`.',
          'Depois chame com um pedido sem `email` e afirme que `chamadas.length` continua `0` — o dublê não deveria ter sido chamado.',
        ],
        solution: `let chamadas = [];
function espiao(...args) { chamadas.push(args); }
notificarPedidoEnviado({ id: 1, email: 'ana@exemplo.com' }, espiao);
assert(chamadas.length === 1, 'com email, o envio e chamado uma vez');

chamadas = [];
notificarPedidoEnviado({ id: 2 }, espiao);
assert(chamadas.length === 0, 'sem email, o envio nunca e chamado');`,
        explanation:
          'O dublê não sabe nada sobre e-mail de verdade — ele só guarda se foi chamado. Isso basta para verificar as duas regras: "com e-mail, envia" (pega a sabotagem que nunca envia) e "sem e-mail, não envia" (pega a que envia sempre, inclusive sem endereço).',
      },
    },
    {
      kind: 'summary',
      markdown: `
Uma função que depende de algo externo — e-mail, banco, relógio, rede — recebe essa dependência **por fora** (injeção de dependência), e o teste passa um **dublê** no lugar da coisa de verdade.

O dublê mais comum é o **espião**: uma função que só guarda como foi chamada, para o teste conferir depois. \`vi.fn()\` no Vitest faz exatamente isso, pronto. Um dublê pode também **devolver** um valor fixo, quando a função testada usa o retorno da dependência.

Só dependências externas merecem dublê — a lógica da própria função se testa de verdade.

Na próxima aula, testar um servidor inteiro: as rotas, com \`pedir()\` fazendo o papel de cliente HTTP.
`.trim(),
    },
  ],
};

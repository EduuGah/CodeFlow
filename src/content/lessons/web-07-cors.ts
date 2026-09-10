import type { Lesson } from '../types';

export const lessonCors: Lesson = {
  id: 'lesson-web-7',
  trackId: 'track-web',
  title: 'CORS: Por Que o Navegador Recusou',
  language: 'javascript',
  objective:
    'Entender o que é uma origem, por que o navegador separa sites por ela, e onde fica a correção.',
  concepts: ['cors', 'seguranca-web'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Esta é a mensagem de erro mais confusa do desenvolvimento web:

~~~
Access to fetch at 'https://api.exemplo.com/pedidos' from origin
'http://localhost:3000' has been blocked by CORS policy
~~~

Ela confunde por três motivos, e desfazer os três é a aula inteira:

1. **Não é um erro do seu código.** É uma regra de segurança do navegador.
2. **O pedido normalmente chegou ao servidor.** Ele foi executado. O que o navegador bloqueou foi a **resposta**, antes de você poder lê-la.
3. **A correção não fica no cliente.** Nada que você escreva no \`fetch\` resolve isso.

## A regra que causa tudo

O navegador guarda os seus cookies e a sua sessão. Se qualquer página pudesse fazer pedidos para qualquer servidor **usando esses cookies e lendo a resposta**, um site malicioso abriria uma aba, chamaria o seu banco com a sua sessão, e leria o seu saldo.

A **política de mesma origem** impede isso: por padrão, o JavaScript de uma origem não lê respostas de outra.

E **origem** é aquela palavra da primeira aula: **protocolo + host + porta**. Os três precisam bater.

| A | B | Mesma origem? |
|---|---|---|
| \`https://x.com/a\` | \`https://x.com/b\` | sim — caminho não conta |
| \`https://x.com\` | \`http://x.com\` | **não** — protocolo diferente |
| \`https://x.com\` | \`https://api.x.com\` | **não** — host diferente |
| \`http://x.com:3000\` | \`http://x.com:4000\` | **não** — porta diferente |
| \`https://x.com\` | \`https://x.com:443\` | sim — 443 é a porta padrão do https |

A quarta linha é o que faz todo desenvolvedor encontrar CORS no primeiro dia: front na porta 3000, API na 8080, mesma máquina, origens diferentes.

## Como o servidor libera

O servidor responde com um cabeçalho dizendo quem pode ler:

~~~
Access-Control-Allow-Origin: https://meusite.com
~~~

O navegador confere: se a origem da página estiver liberada, a resposta é entregue. Senão, ele a descarta e escreve aquela mensagem no console.

Repare em quem faz o quê. O servidor **permite**; o navegador **obedece**. É por isso que a correção é sempre no servidor — ou, em desenvolvimento, num proxy que faz a chamada parecer da mesma origem.

E é por isso também que CORS **não protege o servidor**: qualquer programa que não seja um navegador — um script, um \`curl\`, o seu backend — ignora a regra completamente, porque não há navegador nenhum para obedecê-la. Quem protege o servidor é a autenticação da aula anterior. CORS protege **o usuário**, do site que ele abriu sem querer.

## A verificação prévia

Pedidos simples — um \`GET\`, ou um \`POST\` de formulário — saem direto. Mas se o pedido tiver algo fora do comum (um método como \`DELETE\`, um \`Content-Type: application/json\`, um cabeçalho \`Authorization\`), o navegador manda antes um pedido \`OPTIONS\` perguntando: *"posso mandar isto?"*.

Só depois de uma resposta afirmativa ele manda o pedido de verdade. Por isso, na aba de rede, aparecem **dois** pedidos — e se o \`OPTIONS\` falhar, o segundo nunca acontece. Uma API que trata \`GET\` e \`POST\` mas ignora \`OPTIONS\` funciona pela metade, de um jeito que parece aleatório.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Isto NÃO resolve CORS. Nada aqui resolve.
await fetch(API + '/pedidos', {
  headers: { 'Access-Control-Allow-Origin': '*' },   // cabeçalho de RESPOSTA
});

// A resposta é que precisa trazer o cabeçalho, e ela vem do servidor:
//   Access-Control-Allow-Origin: https://meusite.com
//   Access-Control-Allow-Methods: GET, POST, DELETE
//   Access-Control-Allow-Headers: Content-Type, Authorization

// Para mandar cookies junto, os DOIS lados precisam concordar:
await fetch(API + '/pedidos', { credentials: 'include' });
// e o servidor precisa responder:
//   Access-Control-Allow-Credentials: true
//   Access-Control-Allow-Origin: https://meusite.com   <- origem explícita

// Com credentials, o "*" deixa de valer. É proposital: liberar
// "qualquer site pode ler isto COM os cookies do usuário" seria
// exatamente o ataque que a regra existe para impedir.`,
      caption:
        'Pôr `Access-Control-Allow-Origin` no pedido é a tentativa mais comum, e ela nunca funciona: esse é um cabeçalho de resposta. O cliente não tem como se autorizar.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-7-onde-corrigir',
        type: 'multiple-choice',
        prompt:
          'Seu front em `http://localhost:3000` chama uma API em `http://localhost:8080` e o navegador bloqueia por CORS. O que resolve?',
        concepts: ['cors'],
        difficulty: 'iniciante',
        tags: ['web', 'cors'],
        options: [
          'Acrescentar `Access-Control-Allow-Origin: *` aos cabeçalhos do `fetch`',
          'O servidor da API responder com `Access-Control-Allow-Origin` liberando `http://localhost:3000`',
          'Trocar o `fetch` por `XMLHttpRequest`, que não passa por CORS',
          'Usar `POST` em vez de `GET`, já que a regra só vale para leitura',
        ],
        correctIndex: 1,
        explanation:
          '`Access-Control-Allow-Origin` é um cabeçalho de **resposta**: quem permite é o servidor. Mandá-lo no pedido é o cliente tentando se autorizar sozinho, o que não faria sentido nenhum — se funcionasse, a regra não protegeria de nada. Trocar de API do navegador também não muda: a política é do navegador, não do `fetch`. E o método não tem relação; se algo, um `DELETE` piora, porque dispara uma verificação prévia. Em desenvolvimento existe um atalho legítimo: um proxy no servidor de front que repassa `/api` para a porta 8080, fazendo tudo sair da mesma origem.',
        hints: [
          'Esse cabeçalho aparece no pedido ou na resposta? Quem escreve as respostas?',
          'Se o próprio cliente pudesse se liberar, a regra protegeria alguma coisa?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-7-prever-origem',
        type: 'predict-output',
        prompt:
          'Origem é protocolo, host e porta — os três. O que esta comparação simplificada imprime?',
        concepts: ['cors', 'strings'],
        difficulty: 'iniciante',
        tags: ['web', 'cors'],
        code: `function origemBruta(url) {
  const partes = url.split('/');
  return partes[0] + '//' + partes[2];
}

console.log(origemBruta('https://x.com/a/b'));
console.log(origemBruta('https://x.com/a/b') === origemBruta('https://x.com/z'));
console.log(origemBruta('http://x.com') === origemBruta('https://x.com'));
console.log(origemBruta('http://x.com:3000') === origemBruta('http://x.com:4000'));`,
        expectedOutput: 'https://x.com\ntrue\nfalse\nfalse',
        explanation:
          'Quebrar por barra deixa o protocolo em `partes[0]` (com os dois-pontos), um vazio em `partes[1]`, e o host com a porta em `partes[2]` — o caminho fica de fora, que é o certo: caminho não faz parte da origem. As três comparações mostram a regra: caminho diferente é a **mesma** origem; protocolo diferente e porta diferente são origens **diferentes**. A última linha é a que todo desenvolvedor encontra no primeiro dia, com o front numa porta e a API em outra.',
        hints: [
          'Depois de `split("/")`, o que fica em cada posição de `https://x.com/a/b`?',
          'Quais das três comparações mudam alguma das três partes da origem?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-7-lacuna-preflight',
        type: 'fill-blank',
        prompt:
          'Complete a regra da verificação prévia. Um pedido é **simples** — e sai sem `OPTIONS` — quando o método é GET, HEAD ou POST **e** não traz cabeçalho fora da lista permitida.',
        concepts: ['cors', 'condicoes'],
        difficulty: 'intermediario',
        tags: ['web', 'cors'],
        template: `const METODOS_SIMPLES = ['GET', 'HEAD', 'POST'];
const CABECALHOS_SIMPLES = ['accept', 'content-type'];

function precisaDeVerificacaoPrevia(metodo, cabecalhos) {
  if (!METODOS_SIMPLES.includes(metodo)) return true;

  return cabecalhos.{{1}}((nome) => !CABECALHOS_SIMPLES.includes(nome.{{2}}()));
}`,
        blanks: [
          { placeholder: 'existe algum?', size: 6 },
          { placeholder: 'iguala caixa', size: 12 },
        ],
        tests: [
          {
            description: 'GET sem cabeçalho especial sai direto',
            assertion: `if (precisaDeVerificacaoPrevia('GET', []) !== false) throw new Error("Um GET sem cabeçalhos é o pedido mais simples que existe.");`,
          },
          {
            description: 'DELETE sempre precisa de verificação',
            assertion: `if (precisaDeVerificacaoPrevia('DELETE', []) !== true) throw new Error("DELETE não está entre os métodos simples.");`,
          },
          {
            description: 'Authorization dispara a verificação',
            assertion: `if (precisaDeVerificacaoPrevia('GET', ['Authorization']) !== true) throw new Error("Authorization não está na lista de cabeçalhos simples, então o navegador pergunta antes.");`,
          },
          {
            description: 'a caixa do nome do cabeçalho não muda a resposta',
            assertion: `
              if (precisaDeVerificacaoPrevia('POST', ['Content-Type']) !== false) throw new Error("'Content-Type' é simples, escrito em qualquer caixa.");
              if (precisaDeVerificacaoPrevia('POST', ['CONTENT-TYPE', 'accept']) !== false) throw new Error("Os dois são simples; a caixa não deveria importar.");
            `,
            hidden: true,
          },
          {
            description: 'basta um cabeçalho fora da lista',
            assertion: `if (precisaDeVerificacaoPrevia('POST', ['Content-Type', 'X-Meu-Cabecalho']) !== true) throw new Error("Um único cabeçalho fora da lista já obriga a verificação prévia.");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'a resposta bate com a definição de pedido simples',
            generate: `
              const metodos = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'];
              const nomes = ['Accept', 'content-type', 'Authorization', 'X-Token'];

              const metodo = metodos[Math.floor(rnd() * metodos.length)];
              const quantos = Math.floor(rnd() * 3);

              const cabecalhos = [];
              for (let i = 0; i < quantos; i++) {
                cabecalhos.push(nomes[Math.floor(rnd() * nomes.length)]);
              }

              return { metodo: metodo, cabecalhos: cabecalhos };
            `,
            check: `
              const simples = ['GET', 'HEAD', 'POST'];
              const permitidos = ['accept', 'content-type'];

              let esperado = !simples.includes(caso.metodo);
              if (!esperado) {
                for (const nome of caso.cabecalhos) {
                  if (!permitidos.includes(nome.toLowerCase())) { esperado = true; break; }
                }
              }

              const obtido = precisaDeVerificacaoPrevia(caso.metodo, caso.cabecalhos);
              if (obtido !== esperado) {
                throw new Error(caso.metodo + " com " + JSON.stringify(caso.cabecalhos) + ": esperava " + esperado + ", veio " + obtido + ".");
              }
            `,
          },
        ],
        explanation:
          'A pergunta é "existe **algum** cabeçalho fora da lista?" — e o método que responde a isso parando no primeiro achado já apareceu na aula de métodos de array. A normalização da caixa é a mesma da aula de cabeçalhos: `Content-Type` e `content-type` são o mesmo, e comparar sem normalizar faria um pedido perfeitamente simples disparar uma verificação prévia.',
        hints: [
          'A pergunta é "existe algum que...?", não "quais são os que...?".',
          'Nome de cabeçalho não diferencia maiúsculas — normalize antes de comparar, como na aula anterior.',
        ],
        solution: ['some', 'toLowerCase'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-7-mesma-origem',
        type: 'code',
        prompt: `Crie \`mesmaOrigem(a, b)\`, que **retorna** \`true\` quando as duas URLs têm a mesma origem.\n\nOrigem é **protocolo + host + porta**. O caminho e a consulta não contam.\n\nA porta padrão fica implícita: \`https://x.com\` e \`https://x.com:443\` são a mesma origem, e o mesmo vale para \`http\` com a porta 80.`,
        concepts: ['cors', 'strings'],
        difficulty: 'intermediario',
        tags: ['web', 'cors'],
        initialCode: `function mesmaOrigem(a, b) {
  // Reduza cada URL a "protocolo://host:porta" com a porta sempre explícita,
  // e aí compare os dois textos.
}

console.log(mesmaOrigem('https://x.com/a', 'https://x.com/b'));       // true
console.log(mesmaOrigem('https://x.com', 'http://x.com'));            // false
console.log(mesmaOrigem('https://x.com', 'https://x.com:443'));       // true
console.log(mesmaOrigem('http://x.com:3000', 'http://x.com:4000'));   // false`,
        hints: [
          'Escreva primeiro uma função auxiliar que devolve a origem normalizada de uma URL só.',
          'Separe o protocolo pelo "://", e depois corte o resto na primeira barra.',
          'Se o que sobrou não tiver ":", a porta é a padrão: 443 para https, 80 para http.',
          'Com as duas origens normalizadas do mesmo jeito, a comparação é uma igualdade de textos.',
        ],
        tests: [
          {
            description: 'A função mesmaOrigem existe',
            assertion: `if (typeof mesmaOrigem !== 'function') throw new Error("Crie uma função chamada 'mesmaOrigem'.");`,
          },
          {
            description: 'caminho diferente é a mesma origem',
            assertion: `if (mesmaOrigem('https://x.com/a', 'https://x.com/b/c?d=1') !== true) throw new Error("Caminho e consulta não fazem parte da origem.");`,
          },
          {
            description: 'protocolo diferente é outra origem',
            assertion: `if (mesmaOrigem('https://x.com', 'http://x.com') !== false) throw new Error("http e https são origens diferentes, mesmo com o mesmo host.");`,
          },
          {
            description: 'host diferente é outra origem',
            assertion: `if (mesmaOrigem('https://x.com', 'https://api.x.com') !== false) throw new Error("Um subdomínio é outro host, e portanto outra origem.");`,
          },
          {
            description: 'porta diferente é outra origem',
            assertion: `if (mesmaOrigem('http://localhost:3000', 'http://localhost:8080') !== false) throw new Error("Portas diferentes são origens diferentes — é o caso que todo mundo encontra no primeiro dia.");`,
          },
          {
            description: 'a porta padrão do https fica implícita',
            assertion: `
              if (mesmaOrigem('https://x.com', 'https://x.com:443') !== true) throw new Error("443 é a porta padrão do https: escrever ou omitir dá na mesma.");
              if (mesmaOrigem('https://x.com', 'https://x.com:80') !== false) throw new Error("80 não é a porta padrão do https, então essa é outra origem.");
            `,
            hidden: true,
          },
          {
            description: 'a porta padrão do http fica implícita',
            assertion: `if (mesmaOrigem('http://x.com/a', 'http://x.com:80/b') !== true) throw new Error("80 é a porta padrão do http.");`,
            hidden: true,
          },
          {
            description: 'a URL igual a si mesma é sempre a mesma origem',
            assertion: `
              for (const u of ['https://x.com', 'http://localhost:3000/a?b=1', 'https://api.x.com:8443/v1']) {
                if (mesmaOrigem(u, u) !== true) throw new Error("A URL " + u + " deveria ter a mesma origem que ela mesma.");
              }
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'só protocolo, host e porta decidem — e a padrão é implícita',
            generate: `
              const protocolo = rnd() < 0.5 ? 'http' : 'https';
              const padrao = protocolo === 'https' ? '443' : '80';
              const host = ['x.com', 'api.x.com', 'localhost'][Math.floor(rnd() * 3)];

              // Metade das vezes a porta é a padrão, escrita ou omitida.
              const usaPadrao = rnd() < 0.5;
              const porta = usaPadrao ? padrao : String(3000 + Math.floor(rnd() * 3));

              const escrever = (comPorta) =>
                protocolo + '://' + host + (comPorta ? ':' + porta : '') +
                (rnd() < 0.5 ? '/caminho' : '') + (rnd() < 0.3 ? '?q=1' : '');

              // Quando a porta é a padrão, escrever ou não dá na mesma origem.
              const a = escrever(!usaPadrao || rnd() < 0.5);
              const b = escrever(!usaPadrao || rnd() < 0.5);

              return { a: a, b: b, esperado: true, protocolo: protocolo, host: host };
            `,
            check: `
              const obtido = mesmaOrigem(caso.a, caso.b);
              if (obtido !== caso.esperado) {
                throw new Error("mesmaOrigem(" + JSON.stringify(caso.a) + ", " + JSON.stringify(caso.b) + ") deveria ser " + caso.esperado + ", veio " + obtido + ".");
              }

              // E trocar o protocolo tem que mudar a resposta.
              const outro = caso.protocolo === 'https' ? 'http' : 'https';
              const trocado = caso.a.replace(caso.protocolo + '://', outro + '://');
              if (mesmaOrigem(caso.a, trocado) !== false) {
                throw new Error("trocar o protocolo de " + JSON.stringify(caso.a) + " deveria dar origens diferentes.");
              }
            `,
          },
        ],
        solution: `function mesmaOrigem(a, b) {
  const PADRAO = { http: '80', https: '443' };

  function origemDe(url) {
    const partes = url.split('://');
    const protocolo = partes[0];

    const resto = partes[1];
    const barra = resto.indexOf('/');
    const autoridade = barra === -1 ? resto : resto.slice(0, barra);

    const doisPontos = autoridade.indexOf(':');
    const host = doisPontos === -1 ? autoridade : autoridade.slice(0, doisPontos);
    const porta = doisPontos === -1 ? PADRAO[protocolo] : autoridade.slice(doisPontos + 1);

    return protocolo + '://' + host + ':' + porta;
  }

  return origemDe(a) === origemDe(b);
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `CORS não é um erro do seu código: é o navegador obedecendo à **política de mesma origem**, que existe para um site qualquer não conseguir ler a resposta do seu banco usando os seus cookies. Origem é **protocolo + host + porta**, e os três precisam bater — daí front na 3000 e API na 8080 serem origens diferentes. O pedido normalmente **chega** ao servidor; o que o navegador descarta é a resposta, quando falta o cabeçalho \`Access-Control-Allow-Origin\`. Por isso a correção é sempre do lado do servidor, ou num proxy que faça tudo sair da mesma origem. E CORS **não protege o servidor**: um script fora do navegador ignora a regra por completo — quem protege o servidor é a autenticação. Pedidos fora do comum ainda disparam um \`OPTIONS\` antes, e uma API que ignora esse método funciona pela metade de um jeito que parece aleatório.`,
    },
  ],
};

import type { Lesson } from '../types';

export const lessonHttp: Lesson = {
  id: 'lesson-web-2',
  trackId: 'track-web',
  title: 'HTTP: O Formato do Pedido e da Resposta',
  language: 'javascript',
  objective:
    'Ler um pedido e uma resposta HTTP, escolher o método certo e interpretar um código de status.',
  concepts: ['http'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Cliente e servidor precisam combinar como conversam. Esse combinado é o **HTTP**, e ele é mais simples do que o nome sugere: cada troca tem exatamente duas mensagens de texto, com uma forma fixa.

**O pedido**, do cliente para o servidor:

~~~
POST /v1/pedidos HTTP/1.1
Host: api.exemplo.com
Content-Type: application/json
Authorization: Bearer eyJhbGci...

{"produto":"café","quantidade":2}
~~~

A primeira linha diz **o que fazer** (\`POST\`) e **com o quê** (\`/v1/pedidos\`). Depois vêm os **cabeçalhos**, um por linha, no formato \`Nome: valor\`. Uma linha em branco separa os cabeçalhos do **corpo** — o dado em si, que aqui é JSON.

**A resposta**, de volta:

~~~
HTTP/1.1 201 Created
Content-Type: application/json

{"id":42,"produto":"café","quantidade":2}
~~~

Mesma estrutura, com uma diferença: a primeira linha traz um **código de status** em vez de um método.

É só isso. Toda chamada de API que você fizer na vida tem essa forma — o que muda é o conteúdo.

## Os métodos

O método diz a **intenção** do pedido. Cinco cobrem quase tudo:

| Método | Serve para | Tem corpo? |
|---|---|---|
| \`GET\` | ler | não |
| \`POST\` | criar, ou disparar uma ação | sim |
| \`PUT\` | substituir por inteiro | sim |
| \`PATCH\` | alterar alguns campos | sim |
| \`DELETE\` | apagar | normalmente não |

Duas propriedades separam esses métodos, e elas importam mais do que a lista:

**Seguro** quer dizer que o pedido **não muda nada**. Só \`GET\` é seguro. É por isso que o navegador pode repetir um \`GET\` à vontade — ao voltar uma página, ao pré-carregar um link — sem perguntar nada a ninguém. Um \`GET\` que apaga alguma coisa é um bug esperando um robô de busca passar por ele.

**Idempotente** quer dizer que repetir dá no mesmo. \`PUT\` e \`DELETE\` são: mandar duas vezes "o preço agora é 10" ou "apague o pedido 42" tem o mesmo efeito final que mandar uma. \`POST\` **não é** — dois \`POST\` iguais criam dois pedidos.

É essa a diferença que decide se dá para tentar de novo automaticamente depois de uma falha de rede.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Ler: método padrão, sem corpo
const resposta = await fetch('https://api.exemplo.com/pedidos/42');

// A resposta traz o status, e ele NÃO vira erro sozinho
console.log(resposta.status);   // 404, por exemplo
console.log(resposta.ok);       // false — ok é status entre 200 e 299

// A armadilha: fetch só rejeita quando a rede falha.
// Um 404 ou um 500 chegam como resposta normal.
if (!resposta.ok) {
  throw new Error('O servidor respondeu ' + resposta.status);
}

const pedido = await resposta.json();

// Criar: método, cabeçalho de tipo, e corpo em texto
await fetch('https://api.exemplo.com/pedidos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ produto: 'café', quantidade: 2 }),
});`,
      caption:
        'O `body` vai como **texto** — daí o `JSON.stringify`. E `fetch` considerar um 500 como sucesso surpreende quase todo mundo: para ele, "deu certo" significa que a resposta chegou, não que ela é boa.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-2-metodo',
        type: 'multiple-choice',
        prompt:
          'Sua API precisa de um endereço para **marcar um pedido como pago**. Qual escolha é a melhor?',
        concepts: ['http', 'rest'],
        difficulty: 'intermediario',
        tags: ['web', 'http'],
        options: [
          '`GET /pedidos/42/pagar`',
          '`POST /pedidos/42/pagamento`',
          '`GET /pagar?pedido=42`',
          '`DELETE /pedidos/42/pendencia`',
        ],
        correctIndex: 1,
        explanation:
          'A operação **muda** alguma coisa, então `GET` está fora: ele é o único método seguro, e o navegador se sente livre para repeti-lo sozinho — um `GET` que cobra é um pagamento que acontece porque alguém apertou "voltar". Entre as duas restantes, `POST` num sub-recurso (`/pedidos/42/pagamento`) descreve o que aconteceu: nasceu um pagamento. O `DELETE` da última opção funciona tecnicamente, mas força quem lê a decifrar que apagar uma "pendência" significa pagar.',
        hints: [
          'Qual desses métodos promete não mudar nada? Ele serve para uma operação que cobra?',
          'O navegador pode repetir um GET por conta própria. Que efeito isso teria aqui?',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Os códigos de status

O status vem em três dígitos, e **o primeiro já diz quase tudo**:

| Faixa | Significa | Exemplos |
|---|---|---|
| \`2xx\` | deu certo | \`200 OK\`, \`201 Created\`, \`204 No Content\` |
| \`3xx\` | está em outro lugar | \`301\`, \`304 Not Modified\` |
| \`4xx\` | **você** errou | \`400\`, \`401\`, \`403\`, \`404\`, \`409\`, \`422\` |
| \`5xx\` | **o servidor** errou | \`500\`, \`502\`, \`503\` |

A divisão entre \`4xx\` e \`5xx\` é a mais importante de todas, porque ela diz **de quem é o problema**. Um \`4xx\` significa "não adianta insistir, o pedido está errado". Um \`5xx\` significa "o pedido estava certo, eu é que falhei" — e esse pode valer uma nova tentativa.

Quatro deles se confundem o tempo todo:

- **\`400 Bad Request\`** — o pedido está malformado. Faltou um campo, o JSON está quebrado.
- **\`401 Unauthorized\`** — eu não sei quem você é. O nome é enganoso: é sobre **autenticação**, não autorização. Faça login.
- **\`403 Forbidden\`** — eu sei quem você é, e você não pode. Fazer login de novo não resolve.
- **\`404 Not Found\`** — não existe nada nesse endereço.

Vale notar que \`403\` e \`404\` às vezes são intercambiáveis de propósito: responder \`404\` para um recurso que existe mas não é seu evita confirmar a um estranho que ele existe.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-2-prever-status',
        type: 'predict-output',
        prompt:
          'Esta função decide o que fazer com base na faixa do status. O que ela imprime para cada caso?',
        concepts: ['http'],
        difficulty: 'iniciante',
        tags: ['web', 'http'],
        code: `function faixa(status) {
  return Math.floor(status / 100);
}

console.log(faixa(204));
console.log(faixa(404));
console.log(faixa(503));
console.log(faixa(200) === faixa(201));`,
        expectedOutput: '2\n4\n5\ntrue',
        explanation:
          'Dividir por 100 e descartar o resto é o jeito direto de chegar ao primeiro dígito, que é o que carrega o significado. `204` e `200` e `201` caem todos na mesma faixa — todos são sucesso, com nuances diferentes. É por isso que a maioria do código de aplicação decide pela faixa e só olha o código exato quando precisa distinguir `401` de `403`.',
        hints: [
          '`Math.floor(204 / 100)` dá quanto?',
          'Os três códigos de sucesso do exemplo começam com o mesmo dígito?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-2-lacuna-ok',
        type: 'fill-blank',
        prompt:
          'Complete a função que diz se uma resposta deu certo. Sucesso é qualquer status **da faixa 2xx** — de 200 a 299.',
        concepts: ['http', 'condicoes'],
        difficulty: 'iniciante',
        tags: ['web', 'http'],
        template: `function deuCerto(status) {
  return status >= {{1}} && status {{2}} 300;
}`,
        blanks: [
          { placeholder: 'começo', size: 4 },
          { placeholder: 'antes de 300', size: 3 },
        ],
        tests: [
          {
            description: 'os sucessos comuns passam',
            assertion: `
              for (const s of [200, 201, 204, 299]) {
                if (deuCerto(s) !== true) throw new Error(s + " é sucesso e deveria devolver true.");
              }
            `,
          },
          {
            description: 'erros e redirecionamentos não passam',
            assertion: `
              for (const s of [301, 400, 404, 500]) {
                if (deuCerto(s) !== false) throw new Error(s + " não é sucesso e deveria devolver false.");
              }
            `,
          },
          {
            description: 'as fronteiras exatas',
            assertion: `
              if (deuCerto(199) !== false) throw new Error("199 está abaixo da faixa e não é sucesso.");
              if (deuCerto(200) !== true) throw new Error("200 é o primeiro sucesso.");
              if (deuCerto(299) !== true) throw new Error("299 ainda é sucesso.");
              if (deuCerto(300) !== false) throw new Error("300 já é redirecionamento, não sucesso.");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'concorda com a faixa em todo status de 100 a 599',
            generate: `
              return { status: 100 + Math.floor(rnd() * 500) };
            `,
            check: `
              const esperado = Math.floor(caso.status / 100) === 2;
              const obtido = deuCerto(caso.status);

              if (obtido !== esperado) {
                throw new Error("para o status " + caso.status + " esperava " + esperado + ", veio " + obtido + ".");
              }
            `,
          },
        ],
        explanation:
          'É a mesma armadilha de fronteira da aula de casos extremos, agora com um número que aparece todo dia. A faixa 2xx vai **até 299**, então o limite de cima é "antes de 300" — `< 300`, e não `<= 300`. Trocar por `<=` faria um `300 Multiple Choices` passar por sucesso.',
        hints: [
          'Qual é o menor status de sucesso?',
          '299 é sucesso e 300 não é. Qual operador separa esses dois?',
        ],
        solution: ['200', '<'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-2-classificar',
        type: 'code',
        prompt: `Crie \`analisarStatus(status)\`, que **retorna** um objeto \`{ faixa, culpa, valeTentarDeNovo }\` para um código HTTP.\n\n- \`faixa\` — \`"sucesso"\`, \`"redirecionamento"\`, \`"erro do cliente"\` ou \`"erro do servidor"\`.\n- \`culpa\` — \`"ninguem"\` na faixa 2xx e 3xx, \`"cliente"\` na 4xx, \`"servidor"\` na 5xx.\n- \`valeTentarDeNovo\` — \`true\` só para \`5xx\`, mais o caso especial \`429\` (pedidos demais: espere e tente de novo).\n\nStatus fora da faixa 100–599 devolve \`null\`.`,
        concepts: ['http', 'condicoes'],
        difficulty: 'intermediario',
        tags: ['web', 'http'],
        initialCode: `function analisarStatus(status) {
  // O primeiro dígito decide quase tudo.
}

console.log(analisarStatus(201));
console.log(analisarStatus(404));
console.log(analisarStatus(503));
console.log(analisarStatus(429));`,
        hints: [
          'Comece pela guarda: fora de 100 a 599 não é um status HTTP.',
          '`Math.floor(status / 100)` dá o primeiro dígito, que decide a faixa e a culpa.',
          'O 429 é a exceção da regra: é 4xx, mas vale tentar de novo depois de esperar.',
          'A faixa 1xx existe (respostas informativas), mas nenhuma das três categorias pedidas a cobre — trate-a como não sendo erro nem sucesso.',
        ],
        tests: [
          {
            description: 'A função analisarStatus existe',
            assertion: `if (typeof analisarStatus !== 'function') throw new Error("Crie uma função chamada 'analisarStatus'.");`,
          },
          {
            description: 'classifica um sucesso',
            assertion: `
              const r = analisarStatus(201);
              if (r === null || typeof r !== 'object') throw new Error("Deveria devolver um objeto, veio " + JSON.stringify(r) + ".");
              if (r.faixa !== 'sucesso') throw new Error("201 é sucesso, veio " + JSON.stringify(r.faixa) + ".");
              if (r.culpa !== 'ninguem') throw new Error("Num sucesso não há culpa, veio " + JSON.stringify(r.culpa) + ".");
              if (r.valeTentarDeNovo !== false) throw new Error("Não se repete um pedido que deu certo.");
            `,
          },
          {
            description: 'a culpa do 4xx é do cliente, e não adianta repetir',
            assertion: `
              const r = analisarStatus(404);
              if (r.faixa !== 'erro do cliente') throw new Error("404 é erro do cliente, veio " + JSON.stringify(r.faixa) + ".");
              if (r.culpa !== 'cliente') throw new Error("A culpa do 404 é de quem pediu, veio " + JSON.stringify(r.culpa) + ".");
              if (r.valeTentarDeNovo !== false) throw new Error("Repetir um 404 devolve outro 404.");
            `,
          },
          {
            description: 'a culpa do 5xx é do servidor, e vale repetir',
            assertion: `
              const r = analisarStatus(503);
              if (r.faixa !== 'erro do servidor') throw new Error("503 é erro do servidor, veio " + JSON.stringify(r.faixa) + ".");
              if (r.culpa !== 'servidor') throw new Error("A culpa do 503 é do servidor, veio " + JSON.stringify(r.culpa) + ".");
              if (r.valeTentarDeNovo !== true) throw new Error("Um 5xx costuma ser passageiro: vale tentar de novo.");
            `,
          },
          {
            description: 'o 429 é a exceção da faixa 4xx',
            assertion: `
              const r = analisarStatus(429);
              if (r.faixa !== 'erro do cliente') throw new Error("429 continua sendo 4xx.");
              if (r.valeTentarDeNovo !== true) throw new Error("429 quer dizer 'pedidos demais': espere e tente de novo. Veio " + r.valeTentarDeNovo + ".");
            `,
            hidden: true,
          },
          {
            description: 'redirecionamento não tem culpado',
            assertion: `
              const r = analisarStatus(301);
              if (r.faixa !== 'redirecionamento') throw new Error("301 é redirecionamento, veio " + JSON.stringify(r.faixa) + ".");
              if (r.culpa !== 'ninguem') throw new Error("Num redirecionamento não há culpa, veio " + JSON.stringify(r.culpa) + ".");
            `,
            hidden: true,
          },
          {
            description: 'fora da faixa devolve null',
            assertion: `
              if (analisarStatus(99) !== null) throw new Error("99 não é status HTTP: deveria devolver null.");
              if (analisarStatus(600) !== null) throw new Error("600 não é status HTTP: deveria devolver null.");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'faixa e culpa saem sempre do primeiro dígito',
            generate: `
              return { status: 200 + Math.floor(rnd() * 400) };
            `,
            check: `
              const primeiro = Math.floor(caso.status / 100);
              const faixas = { 2: 'sucesso', 3: 'redirecionamento', 4: 'erro do cliente', 5: 'erro do servidor' };
              const culpas = { 2: 'ninguem', 3: 'ninguem', 4: 'cliente', 5: 'servidor' };

              const r = analisarStatus(caso.status);
              if (r === null) throw new Error("o status " + caso.status + " é válido e devolveu null.");

              if (r.faixa !== faixas[primeiro]) {
                throw new Error("para " + caso.status + " a faixa veio " + JSON.stringify(r.faixa) + ", esperava " + JSON.stringify(faixas[primeiro]) + ".");
              }
              if (r.culpa !== culpas[primeiro]) {
                throw new Error("para " + caso.status + " a culpa veio " + JSON.stringify(r.culpa) + ", esperava " + JSON.stringify(culpas[primeiro]) + ".");
              }

              const esperaRepetir = primeiro === 5 || caso.status === 429;
              if (r.valeTentarDeNovo !== esperaRepetir) {
                throw new Error("para " + caso.status + " valeTentarDeNovo veio " + r.valeTentarDeNovo + ", esperava " + esperaRepetir + ".");
              }
            `,
          },
        ],
        solution: `function analisarStatus(status) {
  if (status < 100 || status > 599) return null;

  const primeiro = Math.floor(status / 100);

  const faixas = {
    2: 'sucesso',
    3: 'redirecionamento',
    4: 'erro do cliente',
    5: 'erro do servidor',
  };

  const culpas = { 2: 'ninguem', 3: 'ninguem', 4: 'cliente', 5: 'servidor' };

  return {
    faixa: faixas[primeiro] ?? 'desconhecida',
    culpa: culpas[primeiro] ?? 'ninguem',
    valeTentarDeNovo: primeiro === 5 || status === 429,
  };
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Todo pedido HTTP é texto com uma forma fixa: linha de método e caminho, cabeçalhos, linha em branco, corpo. A resposta é igual, com um **status** no lugar do método. O método declara a intenção, e duas propriedades dele decidem o que se pode fazer: só \`GET\` é **seguro** (não muda nada, e o navegador o repete sozinho), e \`PUT\`/\`DELETE\` são **idempotentes** (repetir dá no mesmo) enquanto \`POST\` não é. No status, o primeiro dígito diz quase tudo — e a divisão entre \`4xx\` e \`5xx\` diz de quem é a culpa, que é o que decide se vale tentar de novo. Cuidado com o \`fetch\`: um \`500\` chega como resposta normal, porque para ele "deu certo" significa que a resposta chegou.`,
    },
  ],
};

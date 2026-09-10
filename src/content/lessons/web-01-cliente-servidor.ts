import type { Lesson } from '../types';

export const lessonClienteServidor: Lesson = {
  id: 'lesson-web-1',
  trackId: 'track-web',
  title: 'Cliente e Servidor: Quem Pede e Quem Responde',
  language: 'javascript',
  objective:
    'Entender que o seu código roda em dois lugares diferentes, com poderes diferentes, e saber o que cabe em cada um.',
  concepts: ['cliente-servidor', 'assincronia'],
  status: 'published',
  estimatedMinutes: 26,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Até agora todo o seu código rodava num lugar só. Numa aplicação web, ele roda em **dois** — e essa é a ideia que organiza tudo o que vem depois.

**O cliente** é o navegador da pessoa. Ele desenha a tela, responde aos cliques, e roda o JavaScript que você escreveu para a interface. Ele está na máquina de alguém que você não conhece, e por isso: qualquer código que chega lá **pode ser lido e alterado** por quem quiser.

**O servidor** é um computador que você controla. Ele guarda os dados, decide quem pode o quê, e responde a pedidos. Ninguém vê o código dele nem o que ele tem dentro.

Entre os dois existe a rede, e a rede tem duas propriedades que mudam como se escreve código:

- **É lenta.** Um pedido leva de dezenas a centenas de milissegundos. Comparado a uma operação em memória, é uma eternidade — e é por isso que tudo que atravessa a rede é assíncrono.
- **Não é confiável.** O sinal cai, o servidor reinicia, o pacote se perde. Um pedido que dá certo dez mil vezes vai falhar na décima mil e uma.

## A pergunta que se faz o tempo todo

**"Isso roda de que lado?"**

Boa parte dos bugs de iniciante em web é uma resposta errada a essa pergunta. Alguns exemplos que decidem sozinhos:

| Tarefa | Onde |
|---|---|
| Validar um formulário para dar retorno rápido | cliente |
| Validar o mesmo formulário para valer | **servidor** |
| Guardar uma chave de API | **servidor** |
| Decidir se este usuário pode apagar um pedido | **servidor** |
| Formatar uma data para exibir | cliente |

Repare no padrão: o cliente serve para **experiência**, o servidor para **verdade**. Validar no cliente deixa a tela rápida e agradável, mas qualquer pessoa consegue desligar esse JavaScript e mandar o que quiser. A validação que protege os dados é a do servidor — e ela não substitui a outra, elas fazem trabalhos diferentes.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// No cliente: pedir, e continuar vivendo enquanto a resposta não chega
async function carregarPedidos() {
  mostrarCarregando(true);

  try {
    const resposta = await fetch('https://api.exemplo.com/pedidos');
    const pedidos = await resposta.json();
    desenhar(pedidos);
  } catch (erro) {
    // A rede não é confiável: a falha é um caso previsto, não um acidente.
    mostrarAviso('Não foi possível carregar. Tente de novo.');
  } finally {
    mostrarCarregando(false);
  }
}

// O que NUNCA vai no cliente:
const CHAVE = 'sk_live_9f3a...';   // qualquer visitante lê isso no navegador`,
      caption:
        'Todo pedido de rede é `async`, tem um caminho de falha, e mexe no estado visível da tela nas duas pontas. Esses três elementos aparecem juntos em praticamente toda função que fala com um servidor.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-1-onde-roda',
        type: 'multiple-choice',
        prompt:
          'Sua aplicação tem uma tela de administração que só administradores podem abrir. Qual destas checagens **impede de verdade** que outra pessoa veja os dados?',
        concepts: ['cliente-servidor', 'seguranca-web'],
        difficulty: 'iniciante',
        tags: ['web', 'seguranca'],
        options: [
          'Esconder o botão "Administração" quando o usuário não for admin',
          'O servidor recusar o pedido com 403 quando quem pede não for admin',
          'Redirecionar para a tela inicial se `usuario.admin` for falso no JavaScript da página',
          'Guardar `ehAdmin: false` no navegador e checar antes de carregar a tela',
        ],
        correctIndex: 1,
        explanation:
          'As outras três acontecem no **cliente**, e tudo que acontece no cliente está na máquina de quem está usando: dá para abrir as ferramentas do navegador, mudar a variável, chamar o endereço direto. Elas continuam valendo — esconder o botão é boa experiência, porque não oferece um caminho que não leva a lugar nenhum. Mas quem protege os dados é o servidor, que é o único lado que a pessoa não controla.',
        hints: [
          'Qual dessas checagens acontece numa máquina que o usuário controla?',
          'Se alguém abrir o console do navegador e mudar uma variável, quais delas deixam de funcionar?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-1-prever-ordem',
        type: 'predict-output',
        prompt:
          'Uma busca de rede é assíncrona. Simulando com uma promise, o que este programa imprime — e em que ordem?',
        concepts: ['cliente-servidor', 'assincronia'],
        difficulty: 'iniciante',
        tags: ['web', 'assincronia'],
        code: `function buscar() {
  return Promise.resolve(['pedido 1', 'pedido 2']);
}

async function carregar() {
  console.log('mostrando carregando');
  const pedidos = await buscar();
  console.log('recebi', pedidos.length);
}

carregar();
console.log('a tela continua respondendo');`,
        expectedOutput: 'mostrando carregando\na tela continua respondendo\nrecebi 2',
        explanation:
          'A função roda de forma síncrona até o `await` — por isso "mostrando carregando" sai primeiro. No `await` ela devolve o controle, e a linha de baixo roda **antes** de a resposta chegar. É exatamente isso que se quer: enquanto o pedido viaja, a tela continua respondendo a cliques. O `recebi` sai por último, quando a promise resolve. Repare que nem precisou haver demora de verdade: é o `await` que agenda a continuação.',
        hints: [
          'Até que linha a função `carregar` roda antes de devolver o controle?',
          'A linha depois de `carregar()` espera a busca terminar?',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## O endereço do pedido

Todo pedido tem um destino, e esse destino é uma **URL**. Ela tem partes com nomes, e vale conhecê-los porque eles voltam em todas as aulas seguintes:

~~~
https://api.exemplo.com:8080/v1/pedidos?status=aberto&pagina=2
└─┬─┘   └──────┬───────┘└┬─┘└────┬────┘└──────────┬──────────┘
protocolo    host      porta   caminho          consulta
~~~

- **Protocolo** — como falar. Hoje, sempre \`https\`. O \`http\` sem o "s" trafega em texto puro, e qualquer um no caminho consegue ler.
- **Host** — com quem falar.
- **Porta** — qual programa naquele computador. Fica implícita quase sempre: \`https\` assume 443, \`http\` assume 80.
- **Caminho** — o que se quer. É onde mora o desenho da sua API, assunto da aula sobre REST.
- **Consulta** — os detalhes do pedido, em pares \`chave=valor\` separados por \`&\`, depois de um \`?\`.

As três primeiras partes juntas — protocolo, host e porta — formam a **origem**. Guarde essa palavra: é dela que sai a regra de segurança do navegador que causa o erro mais confuso do desenvolvimento web, e que tem uma aula só para ela.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-1-lacuna-consulta',
        type: 'fill-blank',
        prompt:
          'Complete a função que separa a parte de consulta de uma URL. Ela devolve só o que vem **depois** do `?`, ou texto vazio quando não há consulta.',
        concepts: ['cliente-servidor', 'strings'],
        difficulty: 'iniciante',
        tags: ['web', 'strings'],
        template: `function consultaDe(url) {
  const posicao = url.indexOf('?');

  if (posicao === {{1}}) return '';

  return url.{{2}}(posicao + 1);
}`,
        blanks: [
          { placeholder: 'não achou', size: 3 },
          { placeholder: 'daqui até o fim', size: 6 },
        ],
        tests: [
          {
            description: 'devolve a consulta quando ela existe',
            assertion: `const r = consultaDe('https://api.exemplo.com/pedidos?status=aberto&pagina=2'); if (r !== 'status=aberto&pagina=2') throw new Error("Esperava 'status=aberto&pagina=2', veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'devolve texto vazio quando não há consulta',
            assertion: `const r = consultaDe('https://api.exemplo.com/pedidos'); if (r !== '') throw new Error("Sem '?' na URL, o resultado deveria ser texto vazio, veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'a interrogação sozinha no fim devolve vazio',
            assertion: `const r = consultaDe('https://api.exemplo.com/pedidos?'); if (r !== '') throw new Error("Só a interrogação, sem nada depois, também é consulta vazia. Veio " + JSON.stringify(r) + ".");`,
            hidden: true,
          },
          {
            description: 'o próprio ? não entra no resultado',
            assertion: `const r = consultaDe('https://x.com/a?b=1'); if (r.indexOf('?') !== -1) throw new Error("O resultado " + JSON.stringify(r) + " ainda tem a interrogação. Comece um caractere depois dela.");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'o resultado é sempre o trecho depois da primeira interrogação',
            generate: `
              const caminhos = ['/pedidos', '/v1/usuarios', '/a/b/c'];
              const consultas = ['', 'a=1', 'a=1&b=2', 'busca=teste&pagina=3'];

              const caminho = caminhos[Math.floor(rnd() * caminhos.length)];
              const consulta = consultas[Math.floor(rnd() * consultas.length)];
              const url = 'https://exemplo.com' + caminho + (consulta === '' ? '' : '?' + consulta);

              return { url: url, esperado: consulta };
            `,
            check: `
              const obtido = consultaDe(caso.url);
              if (obtido !== caso.esperado) {
                throw new Error("para " + JSON.stringify(caso.url) + " esperava " + JSON.stringify(caso.esperado) + ", veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        explanation:
          '`indexOf` devolve `-1` quando não encontra, e é essa a checagem de "não tem consulta". O `+ 1` existe para o próprio `?` ficar de fora: a consulta começa no caractere seguinte. Em código de produção você usaria `new URL(url).search`, que trata casos que este trecho não trata — mas saber o que a função pronta faz por dentro é o que permite depurá-la quando ela devolve algo inesperado.',
        hints: [
          'O que `indexOf` devolve quando não encontra o que procurava?',
          'O método que pega um trecho a partir de uma posição já apareceu na aula de textos.',
        ],
        solution: ['-1', 'slice'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-web-1-separar-url',
        type: 'code',
        prompt: `Crie \`separarUrl(url)\`, que **retorna** um objeto \`{ protocolo, host, caminho }\` a partir de uma URL simples.\n\n- \`separarUrl("https://api.exemplo.com/v1/pedidos")\` → \`{ protocolo: "https", host: "api.exemplo.com", caminho: "/v1/pedidos" }\`\n- Sem caminho, o caminho é \`"/"\`.\n- A consulta (o que vem depois de \`?\`) **não** entra no caminho.`,
        concepts: ['cliente-servidor', 'strings'],
        difficulty: 'intermediario',
        tags: ['web', 'strings'],
        initialCode: `function separarUrl(url) {
  // O protocolo termina em "://". O host vai até a próxima barra.
}

console.log(separarUrl("https://api.exemplo.com/v1/pedidos"));
console.log(separarUrl("http://localhost"));
console.log(separarUrl("https://x.com/a?b=1"));`,
        hints: [
          'Comece separando pelo "://" — o que vem antes é o protocolo.',
          'No que sobrou, a primeira barra marca o fim do host e o começo do caminho.',
          'Se não houver barra nenhuma depois do host, o caminho é "/".',
          'Descarte a consulta antes de tudo: corte a URL na primeira interrogação.',
        ],
        tests: [
          {
            description: 'A função separarUrl existe',
            assertion: `if (typeof separarUrl !== 'function') throw new Error("Crie uma função chamada 'separarUrl'.");`,
          },
          {
            description: 'separa uma URL completa',
            assertion: `
              const r = separarUrl('https://api.exemplo.com/v1/pedidos');
              if (r === null || typeof r !== 'object') throw new Error("Deveria devolver um objeto, veio " + JSON.stringify(r) + ".");
              if (r.protocolo !== 'https') throw new Error("protocolo deveria ser 'https', veio " + JSON.stringify(r.protocolo) + ".");
              if (r.host !== 'api.exemplo.com') throw new Error("host deveria ser 'api.exemplo.com', veio " + JSON.stringify(r.host) + ".");
              if (r.caminho !== '/v1/pedidos') throw new Error("caminho deveria ser '/v1/pedidos', veio " + JSON.stringify(r.caminho) + ".");
            `,
          },
          {
            description: 'sem caminho, o caminho é a barra',
            assertion: `
              const r = separarUrl('http://localhost');
              if (r.protocolo !== 'http') throw new Error("protocolo deveria ser 'http', veio " + JSON.stringify(r.protocolo) + ".");
              if (r.host !== 'localhost') throw new Error("host deveria ser 'localhost', veio " + JSON.stringify(r.host) + ".");
              if (r.caminho !== '/') throw new Error("Sem caminho na URL, o caminho é '/'. Veio " + JSON.stringify(r.caminho) + ".");
            `,
          },
          {
            description: 'a consulta fica de fora do caminho',
            assertion: `
              const r = separarUrl('https://x.com/a?b=1');
              if (r.caminho !== '/a') throw new Error("O que vem depois de '?' não é caminho. Esperava '/a', veio " + JSON.stringify(r.caminho) + ".");
            `,
            hidden: true,
          },
          {
            description: 'a porta continua fazendo parte do host',
            assertion: `
              const r = separarUrl('http://localhost:3000/api');
              if (r.host !== 'localhost:3000') throw new Error("A porta faz parte do host aqui. Esperava 'localhost:3000', veio " + JSON.stringify(r.host) + ".");
              if (r.caminho !== '/api') throw new Error("caminho deveria ser '/api', veio " + JSON.stringify(r.caminho) + ".");
            `,
            hidden: true,
          },
          {
            description: 'caminho com várias barras continua inteiro',
            assertion: `
              const r = separarUrl('https://exemplo.com/a/b/c');
              if (r.caminho !== '/a/b/c') throw new Error("Esperava '/a/b/c', veio " + JSON.stringify(r.caminho) + ". Só a PRIMEIRA barra depois do host separa.");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'remontar as três partes devolve a URL original, sem a consulta',
            generate: `
              const protocolos = ['http', 'https'];
              const hosts = ['exemplo.com', 'api.exemplo.com', 'localhost:3000'];
              const caminhos = ['/', '/pedidos', '/v1/usuarios/7', '/a/b/c'];

              const protocolo = protocolos[Math.floor(rnd() * 2)];
              const host = hosts[Math.floor(rnd() * hosts.length)];
              const caminho = caminhos[Math.floor(rnd() * caminhos.length)];
              const consulta = rnd() < 0.4 ? '?a=1&b=2' : '';

              // Caminho "/" pode aparecer escrito ou omitido: os dois valem "/".
              const escrito = caminho === '/' && rnd() < 0.5 ? '' : caminho;

              return {
                url: protocolo + '://' + host + escrito + consulta,
                protocolo: protocolo,
                host: host,
                caminho: caminho,
              };
            `,
            check: `
              const r = separarUrl(caso.url);

              if (r === null || typeof r !== 'object') {
                throw new Error("para " + JSON.stringify(caso.url) + " devolveu " + JSON.stringify(r) + ".");
              }
              if (r.protocolo !== caso.protocolo) {
                throw new Error("para " + JSON.stringify(caso.url) + " o protocolo veio " + JSON.stringify(r.protocolo) + ", esperava " + JSON.stringify(caso.protocolo) + ".");
              }
              if (r.host !== caso.host) {
                throw new Error("para " + JSON.stringify(caso.url) + " o host veio " + JSON.stringify(r.host) + ", esperava " + JSON.stringify(caso.host) + ".");
              }
              if (r.caminho !== caso.caminho) {
                throw new Error("para " + JSON.stringify(caso.url) + " o caminho veio " + JSON.stringify(r.caminho) + ", esperava " + JSON.stringify(caso.caminho) + ".");
              }
            `,
          },
        ],
        solution: `function separarUrl(url) {
  const semConsulta = url.split('?')[0];

  const partes = semConsulta.split('://');
  const protocolo = partes[0];
  const resto = partes[1];

  const barra = resto.indexOf('/');
  if (barra === -1) {
    return { protocolo: protocolo, host: resto, caminho: '/' };
  }

  return {
    protocolo: protocolo,
    host: resto.slice(0, barra),
    caminho: resto.slice(barra) || '/',
  };
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Seu código roda em dois lugares com poderes diferentes. O **cliente** está na máquina de alguém que você não controla: tudo que chega lá pode ser lido e alterado, então ele serve para experiência — retorno rápido, formatação, esconder caminhos que não levam a lugar nenhum. O **servidor** é o único lado que decide a verdade: permissão, validação que vale, e qualquer segredo. Entre os dois está a rede, que é lenta — daí todo pedido ser assíncrono — e não confiável — daí todo pedido ter um caminho de falha. E o destino de um pedido é uma **URL**, cujas três primeiras partes (protocolo, host e porta) formam a **origem**, palavra que volta na aula sobre CORS.`,
    },
  ],
};

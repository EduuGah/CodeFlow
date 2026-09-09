import type { Lesson } from '../types';

export const lessonErrosAsync: Lesson = {
  id: 'lesson-js-16',
  trackId: 'track-js-fundamentos',
  title: 'Falhas Assíncronas: O Erro que Some',
  language: 'javascript',
  objective:
    'Impedir que uma falha assíncrona desapareça em silêncio, e decidir entre desistir na primeira ou seguir com o resto.',
  concepts: ['promises', 'assincronia', 'depuracao'],
  status: 'published',
  estimatedMinutes: 18,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um erro síncrono é barulhento: o programa para e a mensagem aparece. Um erro assíncrono pode simplesmente **sumir**.

O caso mais comum é chamar uma função \`async\` e não esperar por ela:

~~~javascript
async function salvar() {
  throw new Error('o banco recusou');
}

salvar();                 // ninguém espera, ninguém trata
console.log('salvo!');    // mente para o usuário
~~~

A função rejeitou, mas não havia \`await\` nem \`.catch\` para receber a falha. Dependendo do ambiente, isso vira um aviso discreto no console, ou nada. E o programa segue como se tivesse dado certo.

A regra prática: **toda promise precisa de um destino**. Ou você a espera com \`await\` dentro de um \`try\`, ou encadeia um \`.catch\`. Deixar solta é escolher não saber.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// 1. O catch vazio: pior que não ter catch
try {
  await salvar();
} catch (erro) {
  // silêncio — o programa segue achando que deu certo
}

// 2. O catch que engole e devolve algo plausível
async function buscarSaldo() {
  try {
    return await consultarBanco();
  } catch (erro) {
    return 0;    // "saldo zero" e "não consegui consultar" NÃO são a mesma coisa
  }
}

// 3. O jeito honesto: tratar o que você sabe tratar, e deixar subir o resto
async function buscarSaldo2() {
  try {
    return await consultarBanco();
  } catch (erro) {
    if (erro.code === 'SEM_CONTA') return 0;   // isso eu sei o que significa
    throw erro;                                 // isso não — que suba
  }
}`,
      caption:
        'Devolver um valor de reserva esconde a diferença entre "o valor é zero" e "não consegui saber". Quando o valor de reserva mente sobre a realidade, é melhor deixar o erro subir.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-16-prever-erro',
        type: 'predict-output',
        prompt:
          'O que este programa imprime? Preste atenção em quem espera o quê — e no que acontece com o erro.',
        concepts: ['promises', 'depuracao'],
        difficulty: 'intermediario',
        tags: ['javascript', 'assincronia'],
        code: `async function falhar() {
  throw new Error('quebrou');
}

async function principal() {
  try {
    falhar();
    console.log('A');
  } catch (e) {
    console.log('B', e.message);
  }
}

principal();`,
        expectedOutput: 'A',
        explanation:
          'O `try/catch` não pega nada porque falta o `await`. Sem ele, `falhar()` só devolve uma promise e a função segue para o `console.log("A")` — a rejeição acontece depois, quando o `try` já terminou. O `catch` só funciona se você **esperar** dentro dele.',
        hints: [
          'O `try` chega a esperar por `falhar()`, ou só a chama?',
          'Quando a promise rejeita, o bloco `try` ainda está em execução?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-16-lacuna-catch',
        type: 'fill-blank',
        prompt:
          'Este código captura o erro mas o esconde. Complete para que ele **relance** a falha depois de registrar.',
        concepts: ['promises', 'depuracao'],
        difficulty: 'intermediario',
        tags: ['javascript', 'assincronia'],
        template: `async function consultar(id) {
  if (id <= 0) throw new Error('id inválido');
  return { id, saldo: id * 100 };
}

async function consultarComRegistro(id) {
  try {
    return {{1}} consultar(id);
  } catch (erro) {
    console.log('falhou para o id', id);
    {{2}} erro;
  }
}`,
        blanks: [
          { placeholder: 'espera', size: 7 },
          { placeholder: 'relança', size: 7 },
        ],
        tests: [
          {
            description: 'com id válido, devolve o objeto',
            assertion: `const r = await consultarComRegistro(5); if (r.saldo !== 500) throw new Error("Esperava saldo 500, veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'com id inválido, a falha continua chegando a quem chamou',
            assertion: `
              let subiu = false;
              try { await consultarComRegistro(-1); } catch (e) { subiu = e instanceof Error; }
              if (!subiu) throw new Error("O erro foi engolido: quem chamou recebeu undefined em vez da falha.");
            `,
          },
          {
            description: 'o erro é registrado antes de subir',
            assertion: `
              const impressas = [];
              const original = console.log;
              console.log = (...args) => impressas.push(args.join(' '));
              try { await consultarComRegistro(-2); } catch (e) {}
              console.log = original;
              if (!impressas.some((l) => l.includes('falhou para o id'))) throw new Error("O registro não aconteceu antes de relançar.");
            `,
            hidden: true,
          },
        ],
        explanation:
          'Sem o `await`, o `try` não teria o que capturar. E sem o `throw`, a função devolveria `undefined` depois de imprimir — quem chamou acharia que deu certo e receberia um valor vazio. Registrar e relançar mantém as duas coisas: o rastro e a falha.',
        hints: [
          'A primeira lacuna é a mesma palavra que faz o `try` conseguir capturar.',
          'A segunda é a palavra que faz um erro subir para quem chamou.',
        ],
        solution: ['await', 'throw'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Quando uma falha não pode derrubar o resto

\`Promise.all\` desiste na primeira rejeição. Isso é o certo quando você precisa de tudo — mas errado quando uma falha isolada não deveria custar o restante.

~~~javascript
const resultados = await Promise.allSettled([
  buscarPreco('café'),
  buscarPreco(''),        // esta vai falhar
  buscarPreco('leite'),
]);

// [{ status: 'fulfilled', value: 19.9 },
//  { status: 'rejected',  reason: Error },
//  { status: 'fulfilled', value: 8.5  }]
~~~

\`allSettled\` **nunca rejeita**. Ela devolve o estado de cada uma, e você decide o que fazer com as que falharam: ignorar, avisar, tentar de novo.

A escolha entre as duas é uma decisão de produto, não de estilo. Carregar o perfil e o avatar do usuário: se o avatar falhar, a tela ainda funciona — \`allSettled\`. Cobrar um cartão e dar baixa no estoque: se um falhar, o outro não pode valer — \`all\`.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-16-resistente',
        type: 'code',
        prompt:
          'A função `buscarPreco(produto)` já existe: resolve com um preço, ou **rejeita** quando o nome é vazio.\n\nCrie `precosDisponiveis(produtos)`, que devolve uma promise com a lista dos preços **que deram certo**, na ordem original. Os que falharem são simplesmente omitidos — uma falha não pode custar o resto.',
        concepts: ['promises', 'arrays', 'depuracao'],
        difficulty: 'intermediario',
        tags: ['javascript', 'assincronia'],
        initialCode: `// Já pronta.
function buscarPreco(produto) {
  return new Promise((resolver, rejeitar) => {
    setTimeout(() => {
      if (!produto) rejeitar(new Error('produto sem nome'));
      else resolver(produto.length * 2);
    }, 10);
  });
}

async function precosDisponiveis(produtos) {
  // Promise.all desistiria na primeira falha. Aqui isso não pode acontecer.
}

precosDisponiveis(['pao', '', 'leite']).then(console.log); // esperado: [6, 10]`,
        hints: [
          '`Promise.all` rejeita quando qualquer uma rejeita. Existe outro método que espera todas sem desistir.',
          '`Promise.allSettled` devolve objetos com `status`, e `value` só nos que deram certo.',
          'Filtre por `status === "fulfilled"` e depois pegue o `value` de cada um.',
        ],
        tests: [
          {
            description: 'A função precosDisponiveis existe',
            assertion: `if (typeof precosDisponiveis !== 'function') throw new Error("Crie uma função chamada 'precosDisponiveis'.");`,
          },
          {
            description: "precosDisponiveis(['pao', '', 'leite']) devolve [6, 10]",
            assertion: `
              const r = await precosDisponiveis(['pao', '', 'leite']);
              if (JSON.stringify(r) !== '[6,10]') throw new Error("Esperava [6,10], veio " + JSON.stringify(r) + ".");
            `,
          },
          {
            description: 'uma falha no meio não derruba a busca inteira',
            assertion: `
              let estourou = false;
              try { await precosDisponiveis(['', '', 'ovo']); } catch (e) { estourou = true; }
              if (estourou) throw new Error("A função rejeitou. Uma falha isolada não pode custar o resto — use Promise.allSettled.");
            `,
          },
          {
            description: 'lista só de falhas devolve lista vazia',
            assertion: `
              const r = await precosDisponiveis(['', '']);
              if (JSON.stringify(r) !== '[]') throw new Error("Esperava [], veio " + JSON.stringify(r) + ".");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'devolve exatamente os preços dos produtos com nome, na ordem',
            generate: `
              const nomes = ['a', 'ab', 'abc', ''];
              const n = Math.floor(rnd() * 6);
              const produtos = [];
              for (let i = 0; i < n; i++) produtos.push(nomes[Math.floor(rnd() * nomes.length)]);
              return { produtos };
            `,
            check: `
              const esperado = caso.produtos.filter((p) => p).map((p) => p.length * 2);
              const obtido = await precosDisponiveis(caso.produtos);

              if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
                throw new Error("com " + JSON.stringify(caso.produtos) + " esperava " + JSON.stringify(esperado) + ", veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        solution: `async function precosDisponiveis(produtos) {
  const resultados = await Promise.allSettled(produtos.map(buscarPreco));

  return resultados
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Uma promise sem destino é uma falha que some: ou você a espera dentro de um \`try\`, ou encadeia um \`.catch\`. O \`try/catch\` só captura o que ele **espera** — sem \`await\`, a rejeição acontece depois que o bloco já terminou. Um \`catch\` que devolve um valor de reserva esconde a diferença entre "o valor é zero" e "não consegui saber": trate o que você sabe tratar e deixe subir o resto. E escolher entre \`all\` e \`allSettled\` é decidir se uma falha isolada invalida o conjunto.`,
    },
  ],
};

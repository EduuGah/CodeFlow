import type { Lesson } from '../types';

export const lessonPromises: Lesson = {
  id: 'lesson-js-14',
  trackId: 'track-js-fundamentos',
  title: 'Promises: Um Valor que Ainda Não Chegou',
  language: 'javascript',
  objective:
    'Criar e encadear promises, e separar o caminho do sucesso do caminho da falha sem aninhar callbacks.',
  concepts: ['promises', 'assincronia', 'funcoes'],
  status: 'published',
  estimatedMinutes: 20,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Callbacks resolvem o problema de esperar. Só que encadear várias tarefas com eles produz isto:

~~~javascript
buscarUsuario(1, function (erro, usuario) {
  if (erro) return tratar(erro);

  buscarPedidos(usuario.id, function (erro, pedidos) {
    if (erro) return tratar(erro);

    buscarItens(pedidos[0].id, function (erro, itens) {
      if (erro) return tratar(erro);
      console.log(itens);
    });
  });
});
~~~

Cada passo empurra o próximo para a direita, e o tratamento de erro se repete em cada nível. Com cinco passos vira ilegível.

A **promise** é a resposta a isso. Ela representa um valor que **ainda não chegou**, com dois destinos possíveis já definidos: deu certo, ou deu errado.

~~~javascript
const promessa = new Promise(function (resolver, rejeitar) {
  setTimeout(function () {
    resolver(42);          // deu certo, o valor é 42
    // rejeitar(new Error('falhou'));   // ou deu errado
  }, 100);
});

promessa.then(function (valor) {
  console.log(valor);      // 42
});
~~~

Três estados, e a transição é definitiva: **pendente** enquanto espera, depois **resolvida** ou **rejeitada**. Uma promise nunca volta atrás nem muda de valor.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// O mesmo encadeamento, sem a escada
buscarUsuario(1)
  .then(function (usuario) {
    return buscarPedidos(usuario.id);   // devolver uma promise encadeia
  })
  .then(function (pedidos) {
    return buscarItens(pedidos[0].id);
  })
  .then(function (itens) {
    console.log(itens);
  })
  .catch(function (erro) {
    console.log('falhou:', erro.message);  // UM tratamento para a cadeia toda
  });

// A regra que faz o encadeamento funcionar:
// o que você devolve de dentro de um .then vira a entrada do próximo.
Promise.resolve(2)
  .then((n) => n * 10)      // devolve 20
  .then((n) => n + 1)       // recebe 20, devolve 21
  .then((n) => console.log(n));  // 21`,
      caption:
        'O código desce em vez de indentar, e o `catch` no fim pega a falha de qualquer etapa. Um erro no meio da cadeia pula direto para lá — os `then` seguintes não rodam.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-14-prever-cadeia',
        type: 'predict-output',
        prompt:
          'O que este programa imprime? Preste atenção no que cada `.then` devolve — e no que acontece depois do erro.',
        concepts: ['promises'],
        difficulty: 'intermediario',
        tags: ['javascript', 'promises'],
        code: `Promise.resolve(5)
  .then((n) => {
    console.log('A', n);
    return n * 2;
  })
  .then((n) => {
    console.log('B', n);
    throw new Error('parou');
  })
  .then(() => {
    console.log('C');
  })
  .catch((e) => {
    console.log('D', e.message);
  });`,
        expectedOutput: 'A 5\nB 10\nD parou',
        explanation:
          '`C` nunca aparece. Quando um `.then` lança, a cadeia **pula todos os `.then` seguintes** e vai direto para o primeiro `.catch`. É o que substitui o `if (erro) return` repetido em cada nível dos callbacks.',
        hints: [
          'O que o primeiro `.then` devolve? Esse valor chega em qual lugar?',
          'Depois de um `throw` no meio da cadeia, os `.then` seguintes rodam ou são pulados?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-14-lacuna-promise',
        type: 'fill-blank',
        prompt:
          'Complete a função para que ela **resolva** com o dobro quando o número for válido, e **rejeite** com um `Error` quando não for.',
        concepts: ['promises', 'condicoes'],
        difficulty: 'intermediario',
        tags: ['javascript', 'promises'],
        template: `function dobrar(numero) {
  return new Promise(function (resolver, rejeitar) {
    if (typeof numero !== 'number') {
      {{1}}(new Error('não é número'));
      return;
    }

    {{2}}(numero * 2);
  });
}`,
        blanks: [
          { placeholder: 'caminho da falha', size: 10 },
          { placeholder: 'caminho do sucesso', size: 10 },
        ],
        tests: [
          {
            description: 'dobrar(21) resolve com 42',
            assertion: `const v = await dobrar(21); if (v !== 42) throw new Error("Esperava 42, veio " + v + ".");`,
          },
          {
            description: 'dobrar("x") rejeita com um Error',
            assertion: `
              let rejeitou = false;
              try { await dobrar('x'); } catch (e) { rejeitou = e instanceof Error; }
              if (!rejeitou) throw new Error("Com entrada inválida a promise precisa rejeitar com um Error.");
            `,
          },
        ],
        properties: [
          {
            description: 'número resolve com o dobro, o resto rejeita',
            generate: `
              const ehNumero = rnd() < 0.5;
              return { valor: ehNumero ? Math.floor(rnd() * 100) - 50 : 'texto' };
            `,
            check: `
              if (typeof caso.valor === 'number') {
                const v = await dobrar(caso.valor);
                if (v !== caso.valor * 2) throw new Error("dobrar(" + caso.valor + ") deveria resolver com " + caso.valor * 2 + ", veio " + v + ".");
              } else {
                let rejeitou = false;
                try { await dobrar(caso.valor); } catch (e) { rejeitou = true; }
                if (!rejeitou) throw new Error("dobrar(" + JSON.stringify(caso.valor) + ") deveria rejeitar.");
              }
            `,
          },
        ],
        explanation:
          'A função recebida por `new Promise` ganha dois caminhos: o primeiro parâmetro entrega o valor, o segundo entrega a falha. Chamar um deles fecha a promise para sempre — chamar o outro depois não faz nada.',
        hints: [
          'Os dois parâmetros da função dentro de `new Promise` têm nomes que dizem o que fazem.',
          'Erro vai pelo primeiro parâmetro ou pelo segundo? Leia os nomes.',
        ],
        solution: ['rejeitar', 'resolver'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Várias tarefas ao mesmo tempo

Quando as tarefas não dependem uma da outra, esperar em fila é desperdício. \`Promise.all\` dispara todas juntas e espera o conjunto:

~~~javascript
const [usuario, config, avisos] = await Promise.all([
  buscarUsuario(1),
  buscarConfig(),
  buscarAvisos(),
]);
~~~

Três buscas de 100ms levam 100ms no total, não 300ms.

O detalhe que pega quem está começando: **se uma rejeitar, o conjunto rejeita**. Quando você quer o resultado de todas mesmo que alguma falhe, o método é \`Promise.allSettled\`, que devolve o estado de cada uma em vez de desistir na primeira falha.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-14-buscar-todos',
        type: 'code',
        prompt:
          'A função `buscarPreco(produto)` já existe e devolve uma promise. Crie `precoTotal(produtos)`, que devolve uma promise com a **soma** dos preços.\n\nBusque todos ao mesmo tempo, não um de cada vez.',
        concepts: ['promises', 'arrays', 'assincronia'],
        difficulty: 'intermediario',
        tags: ['javascript', 'promises'],
        initialCode: `// Já pronta: devolve uma promise com o preço (o dobro do tamanho do nome).
function buscarPreco(produto) {
  return new Promise((resolver) => {
    setTimeout(() => resolver(produto.length * 2), 25);
  });
}

function precoTotal(produtos) {
  // Dispare todas as buscas juntas e some o que voltar.
}

precoTotal(['pao', 'leite']).then((t) => console.log(t)); // esperado: 16`,
        hints: [
          '`produtos.map(buscarPreco)` devolve uma lista de promises, não de preços.',
          '`Promise.all` recebe essa lista e devolve uma promise com a lista de valores.',
          'Depois de ter os preços, some com `reduce`.',
        ],
        tests: [
          {
            description: 'A função precoTotal existe',
            assertion: `if (typeof precoTotal !== 'function') throw new Error("Crie uma função chamada 'precoTotal'.");`,
          },
          {
            description: "precoTotal(['pao', 'leite']) devolve 16",
            assertion: `const t = await precoTotal(['pao', 'leite']); if (t !== 16) throw new Error("Esperava 16 (3×2 + 5×2), veio " + t + ".");`,
          },
          {
            description: 'lista vazia devolve 0',
            assertion: `const t = await precoTotal([]); if (t !== 0) throw new Error("Sem produtos o total é 0, mas veio " + t + ". Confira o valor inicial do reduce.");`,
            hidden: true,
          },
          {
            description: 'as buscas acontecem juntas, não em fila',
            assertion: `
              const inicio = Date.now();
              await precoTotal(['a', 'b', 'c', 'd', 'e', 'f']);
              const gasto = Date.now() - inicio;
              if (gasto > 90) throw new Error("Levou " + gasto + "ms para 6 buscas de 25ms. Em fila daria 150ms; juntas, cerca de 25ms. Use Promise.all para dispará-las ao mesmo tempo.");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'o total é sempre a soma dos preços de cada produto',
            generate: `
              const nomes = ['a', 'ab', 'abc', 'abcd', 'abcde'];
              const n = Math.floor(rnd() * 5);
              const produtos = [];
              for (let i = 0; i < n; i++) produtos.push(nomes[Math.floor(rnd() * nomes.length)]);
              return { produtos };
            `,
            check: `
              const esperado = caso.produtos.reduce((s, p) => s + p.length * 2, 0);
              const obtido = await precoTotal(caso.produtos);
              if (obtido !== esperado) {
                throw new Error("com " + JSON.stringify(caso.produtos) + " esperava " + esperado + ", veio " + obtido + ".");
              }
            `,
          },
        ],
        solution: `function precoTotal(produtos) {
  return Promise.all(produtos.map(buscarPreco)).then((precos) =>
    precos.reduce((soma, preco) => soma + preco, 0)
  );
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Uma promise é um valor que ainda não chegou, com dois destinos definidos desde o início. O que um \`.then\` devolve vira a entrada do próximo, e é isso que troca a escada de callbacks por uma sequência que desce. Um erro em qualquer etapa pula direto para o \`.catch\`, então o tratamento deixa de se repetir em cada nível. Tarefas independentes vão juntas com \`Promise.all\` — e ele desiste na primeira que rejeitar.`,
    },
  ],
};

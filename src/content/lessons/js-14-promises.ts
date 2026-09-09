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
  estimatedMinutes: 30,
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
      kind: 'prose',
      markdown: `
## O que sai de um \`.then\` entra no próximo

A cadeia só funciona porque cada \`.then\` **devolve uma promise nova**, e o que você retorna dentro dele vira o valor dessa promise. Três casos, e vale conhecer os três:

~~~javascript
.then((n) => n * 2)              // valor comum → o próximo recebe o dobro
.then((n) => buscarNome(n))      // outra promise → o próximo espera ELA resolver
.then((n) => { n * 2; })         // sem return → o próximo recebe undefined
~~~

O segundo caso é o que evita o aninhamento: quando você devolve uma promise de dentro de um \`.then\`, a cadeia **espera** por ela antes de seguir, em vez de passar adiante um objeto de promise. É o que permite escrever passos dependentes um embaixo do outro em vez de um dentro do outro.

O terceiro é o bug mais comum de toda a aula. Chaves no corpo da seta sem \`return\` — exatamente a mesma armadilha do \`map\` —, e o passo seguinte recebe \`undefined\` sem nenhum aviso. Se um \`.then\` no meio da sua cadeia está recebendo \`undefined\`, olhe o \`return\` do anterior antes de qualquer outra coisa.

E existe o \`.finally\`, que roda nos dois desfechos e **não** altera o valor que passa por ele. É o lugar de esconder o "carregando".
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-14-prever-sem-return',
        type: 'predict-output',
        prompt:
          'Repare no corpo de cada `.then`. O que este programa imprime, nas três linhas?',
        concepts: ['promises'],
        difficulty: 'intermediario',
        tags: ['javascript', 'promises'],
        code: `Promise.resolve(2)
  .then((n) => {
    console.log('A', n);
    n * 10;
  })
  .then((n) => {
    console.log('B', n);
    return 'fim';
  })
  .then((v) => {
    console.log('C', v);
  });`,
        expectedOutput: 'A 2\nB undefined\nC fim',
        explanation:
          'O primeiro `.then` calcula `n * 10` e joga fora: com chaves no corpo, a seta precisa de `return` explícito. Como ele não devolve nada, a promise seguinte resolve com `undefined`, e é isso que o segundo `.then` recebe. O segundo devolve `"fim"`, e aí o terceiro recebe o valor certo. Um `undefined` inesperado no meio de uma cadeia quase sempre é um `return` que faltou no passo anterior.',
        hints: [
          'O primeiro `.then` tem chaves no corpo. Ele devolve alguma coisa?',
          'O valor que um `.then` recebe é o que o anterior retornou.',
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
            // Cada caso espera um temporizador de verdade. Cinquenta deles somam
            // mais de um segundo, e o prazo por teste é de dois — o CI, mais lento
            // que a máquina de quem escreve, estourava. O espaço de entrada aqui é
            // pequeno, e as sondas de limite já cobrem os extremos.
            runs: 12,
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
## Onde o \`.catch\` fica muda o que ele faz

Um \`.catch\` pega erros do que veio **antes** dele na cadeia. Nunca do que vem depois.

~~~javascript
buscar()
  .catch(tratar)          // pega só as falhas de buscar()
  .then(usar);            // um erro AQUI não é pego por ninguém
~~~

E tem uma segunda parte, mais sutil: depois que um \`.catch\` trata o erro, **a cadeia volta a estar bem**. Ela segue resolvida, com o valor que o \`catch\` retornou — \`undefined\`, se ele não retornou nada. No exemplo acima, \`usar\` roda mesmo quando a busca falhou, recebendo \`undefined\`.

Por isso a posição padrão do \`.catch\` é **no fim**:

~~~javascript
buscar()
  .then(usar)
  .catch(tratar);         // pega falha de buscar() E de usar()
~~~

Um \`.catch\` no meio só se justifica quando você quer mesmo continuar, e nesse caso retorne um valor de reserva de propósito: \`.catch(() => [])\` deixa claro que o passo seguinte vai receber uma lista vazia.

O caso que sobra é o pior: uma promise que rejeita e **ninguém** trata. Ela não derruba o programa na hora — vira um aviso de "unhandled rejection" no console, fácil de não ver. Uma cadeia sem \`.catch\` no fim é uma falha esperando para acontecer em silêncio.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-14-onde-catch',
        type: 'multiple-choice',
        prompt:
          'Quando a busca falha, este código imprime "erro" — e logo depois quebra dentro de `usar`:\n\n```javascript\nbuscar()\n  .catch((e) => console.log("erro"))\n  .then((dados) => usar(dados));\n```\n\nPor quê?',
        concepts: ['promises', 'depuracao'],
        difficulty: 'intermediario',
        tags: ['javascript', 'promises'],
        options: [
          'Porque `.catch` precisa receber uma função assíncrona para funcionar',
          'Porque depois de o `.catch` tratar o erro a cadeia segue resolvida, então o `.then` roda com o que o `catch` retornou — `undefined`',
          'Porque `.catch` no meio da cadeia não pega erro nenhum',
          'Porque falta um `.finally` para encerrar a cadeia',
        ],
        correctIndex: 1,
        explanation:
          'Tratar um erro **conserta** a cadeia: a partir do `.catch` ela volta a estar resolvida, com o valor que o `catch` retornou. Como esse `catch` só imprime e não retorna nada, o `.then` seguinte recebe `undefined` e chama `usar(undefined)`. Duas saídas: mover o `.catch` para o fim, e aí ele pega tanto a falha da busca quanto a de `usar`; ou, se a intenção era mesmo seguir, retornar um valor de reserva explícito — `.catch(() => [])`.',
        hints: [
          'Depois que o `.catch` roda, a cadeia continua rejeitada ou volta a estar resolvida?',
          'O que a função dentro do `.catch` retorna? É esse valor que o `.then` recebe.',
        ],
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
            // Cada caso espera um temporizador de verdade. Cinquenta deles somam
            // mais de um segundo, e o prazo por teste é de dois — o CI, mais lento
            // que a máquina de quem escreve, estourava. O espaço de entrada aqui é
            // pequeno, e as sondas de limite já cobrem os extremos.
            runs: 12,
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
      markdown: `Uma promise é um valor que ainda não chegou, com dois destinos definidos desde o início. O que um \`.then\` devolve vira a entrada do próximo — e devolver **outra promise** faz a cadeia esperar por ela, que é o que troca a escada de callbacks por uma sequência que desce. Chaves no corpo da seta sem \`return\` entregam \`undefined\` ao passo seguinte, e é a primeira coisa a conferir quando um \`.then\` recebe algo inesperado. Um erro em qualquer etapa pula direto para o \`.catch\`, então o tratamento deixa de se repetir em cada nível; por isso o lugar dele é no fim, já que ele só alcança o que veio antes e, depois de tratar, devolve a cadeia ao estado resolvido. Tarefas independentes vão juntas com \`Promise.all\` — e ele desiste na primeira que rejeitar.`,
    },
  ],
};

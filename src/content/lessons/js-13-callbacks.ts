import type { Lesson } from '../types';

export const lessonCallbacks: Lesson = {
  id: 'lesson-js-13',
  trackId: 'track-js-fundamentos',
  title: 'Callbacks: Código que Espera',
  language: 'javascript',
  objective:
    'Entender por que o programa não para para esperar, e escrever uma função que avisa quando terminou.',
  concepts: ['assincronia', 'closures', 'funcoes'],
  status: 'published',
  estimatedMinutes: 30,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Algumas coisas não terminam na hora: buscar dados de um servidor, ler um arquivo, esperar o usuário clicar. Se o programa parasse até cada uma acabar, a tela congelaria.

Então o JavaScript faz diferente: ele **agenda** a tarefa e segue em frente. Quando ela termina, chama uma função que você deixou preparada. Essa função é o **callback** — literalmente, "chame de volta".

O resultado surpreende quem está começando:

~~~javascript
console.log('primeiro');

setTimeout(function () {
  console.log('terceiro');    // agendado para daqui a 0ms
}, 0);

console.log('segundo');
~~~

A saída é \`primeiro\`, \`segundo\`, \`terceiro\` — mesmo com o atraso zerado. O \`setTimeout\` não pausa nada: ele deixa a função na fila e o programa continua. O que estava agendado só roda quando o código atual termina.

Não é lentidão. É a diferença entre **agendar** e **executar**.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// O erro clássico: tentar usar o resultado antes de ele existir
function buscarUsuario(id, aoTerminar) {
  setTimeout(function () {
    aoTerminar({ id: id, nome: 'Ana' });
  }, 100);
}

let usuario;
buscarUsuario(1, function (resultado) {
  usuario = resultado;
});

console.log(usuario);  // undefined — a busca ainda não terminou!

// O jeito certo: usar o valor DENTRO do callback
buscarUsuario(1, function (resultado) {
  console.log(resultado.nome);  // Ana
});`,
      caption:
        'O `console.log` de fora roda antes de a busca terminar. Tudo que depende do resultado precisa acontecer dentro do callback — que, por ser uma closure, ainda enxerga as variáveis de onde foi criado.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-13-prever-ordem',
        type: 'predict-output',
        prompt: 'Em que ordem estas linhas aparecem? Repare que o atraso do `setTimeout` é zero.',
        concepts: ['assincronia'],
        difficulty: 'iniciante',
        tags: ['javascript', 'assincronia'],
        code: `console.log('A');

setTimeout(() => console.log('B'), 0);

console.log('C');`,
        expectedOutput: 'A\nC\nB',
        explanation:
          'Atraso zero não significa "agora". O `setTimeout` coloca a função na fila, e a fila só é atendida depois que o código atual termina. Por isso `C` vem antes de `B`, mesmo tendo sido escrito depois.',
        hints: [
          'O `setTimeout` executa a função na hora, ou agenda para depois?',
          'O programa chega ao fim antes de atender qualquer coisa agendada.',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## A pilha e a fila

Para prever a ordem das coisas, basta entender dois lugares.

A **pilha** é onde o código roda. Só cabe uma coisa por vez, e o JavaScript não sai dali até terminar tudo que está em andamento.

A **fila** é onde esperam as funções agendadas — as de \`setTimeout\`, as respostas de rede, os cliques do usuário.

A regra que liga os dois é curta: **enquanto a pilha não esvaziar, nada sai da fila.**

Por isso \`setTimeout(f, 0)\` não significa "agora". Significa "assim que a pilha esvaziar". Se ainda houver dez linhas para rodar, essas dez rodam primeiro. O zero é o tempo **mínimo** de espera, não o momento.

E daí vem uma consequência importante: um laço demorado no meio do caminho **trava tudo**.

~~~javascript
setTimeout(function () {
  console.log('vou rodar quando der');
}, 0);

// enquanto este laço roda, nada da fila anda — nem o clique do usuário
for (let i = 0; i < 1e9; i++) { }
~~~

Como só existe uma pilha, ela é também a única coisa que desenha a tela. Um cálculo pesado feito de uma vez congela a interface — o botão não responde, a animação para. É por isso que "não bloquear a pilha" é uma preocupação constante em JavaScript, e não uma sutileza acadêmica.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-13-prever-fila',
        type: 'predict-output',
        prompt:
          'Todos os atrasos são zero. Simule a pilha e a fila antes de rodar: o que sai, e em que ordem?',
        concepts: ['assincronia'],
        difficulty: 'intermediario',
        tags: ['javascript', 'assincronia'],
        code: `console.log('A');

setTimeout(function () {
  console.log('B');
  setTimeout(function () { console.log('C'); }, 0);
  console.log('D');
}, 0);

setTimeout(function () { console.log('E'); }, 0);

console.log('F');`,
        expectedOutput: 'A\nF\nB\nD\nE\nC',
        explanation:
          'Primeiro roda tudo que está na pilha: `A` e `F`. Os dois `setTimeout` só foram **agendados**. Com a pilha vazia, a fila começa a andar na ordem em que entrou: o primeiro agendamento imprime `B`, agenda mais um, e imprime `D` — repare que o `C` não sai no meio, porque ele foi para o fim da fila. Depois vem `E`, que já esperava. E `C` por último, porque entrou na fila depois de todo mundo.',
        hints: [
          'Nada sai da fila enquanto ainda houver código rodando na pilha.',
          'O `setTimeout` de dentro entra na fila em que momento — antes ou depois do que já estava lá?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-13-lacuna-callback',
        type: 'fill-blank',
        prompt:
          'Esta função deveria avisar o resultado, mas está tentando devolvê-lo. Complete a chamada do callback.',
        concepts: ['assincronia', 'funcoes'],
        difficulty: 'iniciante',
        tags: ['javascript', 'assincronia'],
        template: `function dobrarDepois(numero, aoTerminar) {
  setTimeout(function () {
    {{1}}(numero * 2);
  }, 10);
}`,
        blanks: [{ placeholder: 'quem avisa', size: 12 }],
        tests: [
          {
            description: 'dobrarDepois(5, ...) entrega 10 ao callback',
            assertion: `
              const resultado = await new Promise((resolve) => dobrarDepois(5, resolve));
              if (resultado !== 10) throw new Error("Esperava 10, veio " + resultado + ".");
            `,
          },
          {
            description: 'o callback é chamado depois, não durante',
            assertion: `
              let chamouNaHora = true;
              const espera = new Promise((resolve) => dobrarDepois(1, resolve));
              chamouNaHora = false;
              await espera;
              if (chamouNaHora) throw new Error("O callback foi chamado imediatamente. Ele precisa ficar dentro do setTimeout.");
            `,
          },
        ],
        explanation:
          'A função não tem como devolver o resultado com `return`: quando o `setTimeout` dispara, quem chamou já foi embora há muito tempo. Por isso ela **avisa** — chama a função que recebeu como parâmetro, entregando o valor.',
        hints: [
          'O segundo parâmetro da função é uma função. O que se faz com ela?',
          'Chame o parâmetro que recebeu, passando o resultado.',
        ],
        solution: ['aoTerminar'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## O \`return\` que não volta para você

Este é o erro que todo mundo comete ao tentar transformar uma tarefa demorada numa função normal:

~~~javascript
function buscarUsuario(id) {
  setTimeout(function () {
    return { id: id, nome: 'Ana' };   // devolve para quem?
  }, 100);
}

console.log(buscarUsuario(1));   // undefined
~~~

O \`return\` está dentro da função anônima que o \`setTimeout\` vai chamar daqui a 100ms. Ele devolve o valor **para o \`setTimeout\`**, que não faz nada com ele.

Enquanto isso, \`buscarUsuario\` chegou ao fim da própria última linha e devolveu \`undefined\` — imediatamente, muito antes de os 100ms passarem. Não há como ser diferente: para retornar o usuário, ela precisaria esperar, e esperar é justamente o que ela não faz.

A saída disponível aqui é entregar o resultado por callback:

~~~javascript
function buscarUsuario(id, aoTerminar) {
  setTimeout(function () {
    aoTerminar({ id: id, nome: 'Ana' });
  }, 100);
}
~~~

Guarde a forma da pergunta, porque ela reaparece: **uma função não consegue retornar um valor que ainda não chegou.** A próxima aula devolve outra coisa no lugar — um objeto que representa a promessa desse valor — e é isso que finalmente permite escrever \`return\` de novo.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-13-return-perdido',
        type: 'multiple-choice',
        prompt:
          'Este código imprime `undefined`:\n\n```javascript\nfunction buscar(id) {\n  setTimeout(function () {\n    return { id: id };\n  }, 100);\n}\n\nconsole.log(buscar(1));\n```\n\nPor quê?',
        concepts: ['assincronia', 'funcoes'],
        difficulty: 'intermediario',
        tags: ['javascript', 'assincronia'],
        options: [
          'Porque `setTimeout` não aceita funções que usam `return`',
          'O `return` devolve o valor para a função anônima que o `setTimeout` chama, e `buscar` já terminou sem devolver nada',
          'Porque o atraso de 100ms é curto demais para o objeto ficar pronto',
          'Porque `buscar` precisaria ter sido declarada como função de seta',
        ],
        correctIndex: 1,
        explanation:
          'São duas funções, e o `return` pertence à de dentro. `buscar` só agenda e chega ao fim — devolvendo `undefined` na mesma hora, cerca de 100ms antes de o `return` sequer acontecer. Aumentar o atraso não muda nada, e nenhuma sintaxe de declaração resolve: **uma função não consegue retornar um valor que ainda não chegou**. A saída é receber um callback e chamá-lo com o resultado, ou devolver uma promise — que é o assunto da próxima aula.',
        hints: [
          'Quantas funções existem nesse trecho? A que função o `return` pertence?',
          'Em que momento `buscar` chega ao fim: antes ou depois dos 100ms?',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Erro no meio do caminho

Se a tarefa pode falhar, o callback precisa saber disso. A convenção mais antiga do JavaScript é passar **o erro primeiro**:

~~~javascript
function buscarPreco(produto, aoTerminar) {
  setTimeout(function () {
    if (!produto) {
      aoTerminar(new Error('produto não informado'), null);
      return;
    }
    aoTerminar(null, 19.9);
  }, 10);
}

buscarPreco('café', function (erro, preco) {
  if (erro) {
    console.log('falhou:', erro.message);
    return;
  }
  console.log('preço:', preco);
});
~~~

O \`return\` depois de tratar o erro é essencial. Sem ele, o código continua e tenta usar um \`preco\` que não existe.

Essa forma funciona, mas encadear várias tarefas assim produz o famoso aninhamento em escada — callback dentro de callback dentro de callback. É exatamente o problema que a próxima aula resolve.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-13-validar-async',
        type: 'code',
        prompt:
          'Crie a função `verificarIdade(idade, aoTerminar)`, que responde **depois de um instante**, seguindo a convenção erro-primeiro:\n\n- se `idade` não for um número, chame `aoTerminar(new Error("idade inválida"), null)`\n- se for menor que 18, chame `aoTerminar(null, false)`\n- caso contrário, chame `aoTerminar(null, true)`\n\nUse `setTimeout` para responder depois, não na hora.',
        concepts: ['assincronia', 'funcoes', 'condicoes'],
        difficulty: 'intermediario',
        tags: ['javascript', 'assincronia'],
        initialCode: `function verificarIdade(idade, aoTerminar) {
  // Responda de dentro de um setTimeout, chamando aoTerminar(erro, resultado).
}

verificarIdade(20, function (erro, podeEntrar) {
  console.log(erro, podeEntrar); // esperado: null true
});`,
        hints: [
          'Tudo acontece dentro do `setTimeout`: a verificação e a chamada do callback.',
          'Para checar se é número: `typeof idade !== "number"`.',
          'Erro primeiro: quando dá certo, o primeiro argumento é `null`.',
        ],
        tests: [
          {
            description: 'A função verificarIdade existe',
            assertion: `if (typeof verificarIdade !== 'function') throw new Error("Crie uma função chamada 'verificarIdade'.");`,
          },
          {
            description: 'idade 20 devolve true, sem erro',
            assertion: `
              const r = await new Promise((resolve) => verificarIdade(20, (erro, valor) => resolve({ erro, valor })));
              if (r.erro !== null) throw new Error("Quando dá certo, o primeiro argumento precisa ser null, mas veio " + r.erro + ".");
              if (r.valor !== true) throw new Error("Com 20 anos esperava true, veio " + r.valor + ".");
            `,
          },
          {
            description: 'idade 17 devolve false, sem erro',
            assertion: `
              const r = await new Promise((resolve) => verificarIdade(17, (erro, valor) => resolve({ erro, valor })));
              if (r.valor !== false) throw new Error("Com 17 anos esperava false, veio " + r.valor + ".");
            `,
          },
          {
            description: 'texto no lugar de número vira erro',
            assertion: `
              const r = await new Promise((resolve) => verificarIdade('vinte', (erro, valor) => resolve({ erro, valor })));
              if (!(r.erro instanceof Error)) throw new Error("Com uma entrada inválida, o primeiro argumento precisa ser um Error. Veio " + r.erro + ".");
              if (r.valor !== null) throw new Error("Quando há erro, o resultado precisa ser null. Veio " + r.valor + ".");
            `,
            hidden: true,
          },
          {
            description: 'a resposta vem depois, não durante a chamada',
            assertion: `
              let jaSaiu = false;
              const espera = new Promise((resolve) => verificarIdade(30, () => resolve(jaSaiu)));
              jaSaiu = true;
              const respondeuDepois = await espera;
              if (!respondeuDepois) throw new Error("O callback foi chamado na hora. Ele precisa ficar dentro do setTimeout.");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'a decisão bate com a idade para qualquer número',
            generate: `return { idade: Math.floor(rnd() * 40) };`,
            // Cada caso espera um temporizador de verdade. Cinquenta deles somam
            // mais de um segundo, e o prazo por teste é de dois — o CI, mais lento
            // que a máquina de quem escreve, estourava. O espaço de entrada aqui é
            // pequeno, e as sondas de limite já cobrem os extremos.
            runs: 12,
            check: `
              const r = await new Promise((resolve) => verificarIdade(caso.idade, (erro, valor) => resolve({ erro, valor })));
              const esperado = caso.idade >= 18;

              if (r.erro !== null) throw new Error("idade " + caso.idade + " é um número válido, mas veio erro: " + r.erro);
              if (r.valor !== esperado) {
                throw new Error("com idade " + caso.idade + " esperava " + esperado + ", veio " + r.valor + ".");
              }
            `,
          },
        ],
        solution: `function verificarIdade(idade, aoTerminar) {
  setTimeout(function () {
    if (typeof idade !== 'number') {
      aoTerminar(new Error('idade inválida'), null);
      return;
    }

    aoTerminar(null, idade >= 18);
  }, 10);
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `O JavaScript **agenda** em vez de esperar: o programa segue, e o que foi agendado roda depois que o código atual termina. A regra que prevê a ordem cabe numa frase — enquanto a pilha não esvaziar, nada sai da fila —, e é dela que vem tanto o \`setTimeout(f, 0)\` que não é "agora" quanto o laço pesado que congela a tela. Quem precisa do resultado de uma tarefa demorada usa um **callback**, e tudo que depende desse resultado acontece dentro dele: uma função não consegue retornar um valor que ainda não chegou. A convenção erro-primeiro reserva o primeiro argumento para a falha, e o \`return\` depois de tratá-la evita seguir com um valor que não existe.`,
    },
  ],
};

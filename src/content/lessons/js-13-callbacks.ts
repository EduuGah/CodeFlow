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
  estimatedMinutes: 18,
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
      markdown: `O JavaScript **agenda** em vez de esperar: o programa segue, e o que foi agendado roda depois que o código atual termina. Por isso atraso zero não significa "agora". Quem precisa do resultado de uma tarefa demorada usa um **callback** — e tudo que depende desse resultado acontece dentro dele, nunca fora. A convenção erro-primeiro reserva o primeiro argumento para a falha, e o \`return\` depois de tratá-la evita seguir com um valor que não existe.`,
    },
  ],
};

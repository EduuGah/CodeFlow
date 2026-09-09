import type { Lesson } from '../types';

export const lessonAsyncAwait: Lesson = {
  id: 'lesson-js-15',
  trackId: 'track-js-fundamentos',
  title: 'async e await: Esperar Sem Aninhar',
  language: 'javascript',
  objective:
    'Escrever código assíncrono que se lê de cima para baixo, e tratar falhas com try/catch.',
  concepts: ['promises', 'assincronia', 'depuracao'],
  status: 'published',
  estimatedMinutes: 32,
  blocks: [
    {
      kind: 'prose',
      markdown: `
As promises resolveram o aninhamento, mas o código ainda não se parece com o raciocínio. Você pensa "busque o usuário, depois os pedidos, depois os itens" — e escreve três \`.then\` encadeados.

\`async\` e \`await\` deixam escrever exatamente o que você pensou:

~~~javascript
async function mostrarItens() {
  const usuario = await buscarUsuario(1);
  const pedidos = await buscarPedidos(usuario.id);
  const itens = await buscarItens(pedidos[0].id);
  console.log(itens);
}
~~~

Três regras, e só:

1. \`await\` só funciona dentro de uma função marcada com \`async\`.
2. \`await\` pausa **aquela função** até a promise resolver — o resto do programa continua rodando.
3. Uma função \`async\` **sempre devolve uma promise**, mesmo que você retorne um número.

Essa última é a que mais confunde. \`async function dobro(n) { return n * 2; }\` não devolve um número: devolve uma promise que resolve para um número. Quem chamar precisa de \`await\` ou \`.then\`.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Erro comum: esquecer o await
async function buscarNome() {
  return 'Ana';
}

console.log(buscarNome());        // Promise { 'Ana' }  <- não é o nome!
console.log(await buscarNome());  // Ana

// Erro comum: esperar em fila o que podia ir junto
async function lento() {
  const a = await tarefa();   // 100ms
  const b = await tarefa();   // + 100ms = 200ms no total
  return a + b;
}

async function rapido() {
  // As duas disparam juntas; o await espera o conjunto.
  const [a, b] = await Promise.all([tarefa(), tarefa()]);  // 100ms
  return a + b;
}`,
      caption:
        '`await` em sequência só faz sentido quando o segundo passo **depende** do primeiro. Quando não depende, encadear é desperdício — dispare junto.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-15-prever-async',
        type: 'predict-output',
        prompt:
          'O que este programa imprime? Lembre que uma função `async` sempre devolve uma promise.',
        concepts: ['promises', 'assincronia'],
        difficulty: 'intermediario',
        tags: ['javascript', 'assincronia'],
        code: `async function valor() {
  return 7;
}

async function principal() {
  console.log('A');
  const n = await valor();
  console.log('B', n);
}

principal();
console.log('C');`,
        expectedOutput: 'A\nC\nB 7',
        explanation:
          '`await` pausa **apenas** a função `principal`. Quando ela para para esperar, o programa continua e imprime `C`. Só depois, com a promise resolvida, `principal` retoma e imprime `B 7`.',
        hints: [
          'O `await` pausa o programa inteiro, ou só a função onde ele está?',
          'Enquanto `principal` espera, o que o resto do programa está fazendo?',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## \`await\` pausa a função, não o programa

A regra 2 merece um exemplo, porque ela é a que decide a ordem de tudo.

Uma função \`async\` roda **normalmente, de forma síncrona**, até encontrar o primeiro \`await\`. Nesse ponto ela é suspensa e devolve o controle a quem a chamou. O resto do corpo dela fica agendado para quando a promise resolver.

~~~javascript
async function um() {
  console.log('A');
  await null;          // daqui em diante, fica para depois
  console.log('B');
}

console.log('1');
um();
console.log('2');
// 1, A, 2, B
~~~

O \`A\` sai antes do \`2\` porque a função começou a rodar na hora. O \`B\` sai por último porque o \`await\` mandou o restante para a fila — mesmo esperando por \`null\`, que já está pronto.

Duas consequências práticas:

**Chamar sem \`await\` não é erro de sintaxe.** \`um()\` sozinho dispara a função e segue em frente. Às vezes é o que você quer; quase sempre não é, e o sintoma é o código depois rodar cedo demais.

**A função devolve uma promise para o mundo.** Quem chama decide se espera. É por isso que a regra 3 existe, e é por isso que uma função \`async\` nunca "vira" síncrona por dentro.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-15-prever-ordem',
        type: 'predict-output',
        prompt:
          'Nenhum temporizador aqui — a ordem é totalmente previsível. O que sai, e em que sequência?',
        concepts: ['assincronia'],
        difficulty: 'intermediario',
        tags: ['javascript', 'assincronia'],
        code: `async function um() {
  console.log('A');
  await null;
  console.log('B');
}

console.log('1');
um();
console.log('2');`,
        expectedOutput: '1\nA\n2\nB',
        explanation:
          'Uma função `async` roda de forma **síncrona** até o primeiro `await` — por isso o `A` sai logo depois do `1`, antes do `2`. No `await` ela é suspensa e devolve o controle: o `2` roda, e só quando a pilha esvazia o corpo restante volta a rodar, imprimindo `B`. Repare que o `await null` não espera nada de verdade e mesmo assim adia o resto: é o `await`, e não a demora, que agenda a continuação.',
        hints: [
          'A função começa a rodar no momento da chamada, ou só depois?',
          'A partir de qual linha o corpo da função é adiado?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-15-lacuna-async',
        type: 'fill-blank',
        prompt:
          'Complete as duas palavras que faltam para esta função esperar o resultado antes de somar.',
        concepts: ['promises', 'assincronia'],
        difficulty: 'iniciante',
        tags: ['javascript', 'assincronia'],
        template: `function buscarNota() {
  return new Promise((resolver) => setTimeout(() => resolver(8), 10));
}

{{1}} function media() {
  const primeira = {{2}} buscarNota();
  const segunda = {{2}} buscarNota();
  return (primeira + segunda) / 2;
}`,
        blanks: [
          { placeholder: 'marca a função', size: 7 },
          { placeholder: 'espera', size: 7 },
        ],
        tests: [
          {
            description: 'media() resolve para 8',
            assertion: `const m = await media(); if (m !== 8) throw new Error("Esperava 8, veio " + m + ". Se veio NaN, as notas não foram esperadas antes da conta.");`,
          },
          {
            description: 'media() devolve uma promise, como toda função async',
            assertion: `const r = media(); if (typeof r.then !== 'function') throw new Error("Uma função async sempre devolve uma promise.");`,
          },
        ],
        explanation:
          'Sem `await`, `primeira` receberia a promise em vez do número — e somar duas promises dá `NaN`. E `await` só é permitido dentro de uma função marcada com `async`: as duas palavras andam juntas.',
        hints: [
          'A primeira lacuna marca a função inteira. A segunda aparece duas vezes, antes de cada chamada.',
          'Uma delas permite a outra: sem a primeira, a segunda é erro de sintaxe.',
        ],
        solution: ['async', 'await'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## \`await\` dentro de laço, e o laço que não espera

Percorrer uma lista fazendo uma tarefa assíncrona em cada item tem três formas, e elas fazem coisas bem diferentes.

**Em sequência**, uma de cada vez:

~~~javascript
for (const id of ids) {
  const dado = await buscar(id);
  console.log(dado);
}
~~~

Correto, e às vezes é exatamente o que se quer — quando um passo depende do anterior, ou quando disparar tudo junto sobrecarregaria o servidor. O custo é o tempo: dez buscas de 100ms levam um segundo.

**Em paralelo**, todas ao mesmo tempo:

~~~javascript
const dados = await Promise.all(ids.map((id) => buscar(id)));
~~~

Dispara todas e espera o conjunto. As mesmas dez buscas levam 100ms.

**E a forma que não funciona:**

~~~javascript
ids.forEach(async (id) => {
  const dado = await buscar(id);
  console.log(dado);
});

console.log('acabou');   // sai primeiro, sempre
~~~

\`forEach\` **descarta** o que a função devolve. Cada chamada devolve uma promise, e nenhuma delas é esperada por ninguém — o laço termina na hora e o programa segue como se as buscas já tivessem acabado. Pior: se alguma rejeitar, vira rejeição não tratada.

A regra para levar: **\`await\` dentro de \`forEach\` não espera nada.** Quando precisar esperar, use \`for...of\` ou \`Promise.all\`.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-15-foreach-async',
        type: 'multiple-choice',
        prompt:
          'Neste código, "acabou" aparece antes de qualquer dado, e o array `saida` chega vazio na linha seguinte:\n\n```javascript\nconst saida = [];\n\nids.forEach(async (id) => {\n  saida.push(await buscar(id));\n});\n\nconsole.log("acabou", saida.length); // acabou 0\n```\n\nQual é a correção?',
        concepts: ['assincronia', 'arrays'],
        difficulty: 'intermediario',
        tags: ['javascript', 'assincronia'],
        options: [
          'Colocar `await` antes de `ids.forEach(...)`',
          'Trocar por `for (const id of ids) { saida.push(await buscar(id)); }`, ou por `const saida = await Promise.all(ids.map(buscar))`',
          'Declarar `saida` com `let` em vez de `const`',
          'Mover o `console.log` para dentro do `forEach`',
        ],
        correctIndex: 1,
        explanation:
          '`forEach` descarta o valor devolvido pela função que recebe. Como uma função `async` devolve uma promise, o `forEach` joga fora exatamente a coisa que permitiria esperar — ele termina imediatamente e o programa segue. Pôr `await` antes do `forEach` não ajuda: ele devolve `undefined`, e esperar por `undefined` não espera pelas buscas. As duas saídas certas são `for...of`, que espera uma de cada vez, e `Promise.all` com `map`, que dispara todas juntas e espera o conjunto.',
        hints: [
          'O que o `forEach` faz com o valor que a função dele devolve?',
          'Uma função `async` devolve o quê, mesmo quando o corpo não tem `return`?',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Falhas voltam a ser \`try/catch\`

Com \`await\`, uma promise rejeitada **lança** — igual a qualquer outro erro. Então o tratamento volta a ser o que você já conhece:

~~~javascript
async function mostrarPreco(produto) {
  try {
    const preco = await buscarPreco(produto);
    console.log(preco);
  } catch (erro) {
    console.log('não deu:', erro.message);
  } finally {
    console.log('terminou');   // roda nos dois casos
  }
}
~~~

Isso é uma simplificação real: um \`try/catch\` cobre várias chamadas seguidas, do mesmo jeito que cobriria código síncrono. Sem \`await\`, cada promise precisaria do próprio \`.catch\`.

**A armadilha** é chamar uma função \`async\` sem \`await\` e sem \`.catch\`. Se ela rejeitar, o erro não tem para onde ir — vira uma rejeição não tratada, que some do console em alguns ambientes e derruba o processo em outros.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-15-buscar-com-erro',
        type: 'code',
        prompt:
          'A função `buscarUsuario(id)` já existe: resolve com um objeto quando o id é positivo, e **rejeita** quando não é.\n\nCrie `nomeDoUsuario(id)`, uma função `async` que devolve:\n\n- o `nome` do usuário, quando a busca dá certo\n- a string `"desconhecido"`, quando a busca falha\n\nNão deixe o erro escapar.',
        concepts: ['promises', 'assincronia', 'depuracao'],
        difficulty: 'intermediario',
        tags: ['javascript', 'assincronia'],
        initialCode: `// Já pronta.
function buscarUsuario(id) {
  return new Promise((resolver, rejeitar) => {
    setTimeout(() => {
      if (id > 0) resolver({ id, nome: 'Usuário ' + id });
      else rejeitar(new Error('id inválido'));
    }, 10);
  });
}

async function nomeDoUsuario(id) {
  // Espere o resultado, e trate a falha em vez de deixá-la escapar.
}

nomeDoUsuario(3).then(console.log);   // esperado: Usuário 3
nomeDoUsuario(-1).then(console.log);  // esperado: desconhecido`,
        hints: [
          'Envolva a chamada num `try`, e devolva o valor de reserva no `catch`.',
          'Sem `await` você guardaria a promise, não o objeto — e `.nome` daria `undefined`.',
          'Estrutura: `try { const u = await buscarUsuario(id); return u.nome; } catch { return "desconhecido"; }`',
        ],
        tests: [
          {
            description: 'A função nomeDoUsuario existe',
            assertion: `if (typeof nomeDoUsuario !== 'function') throw new Error("Crie uma função chamada 'nomeDoUsuario'.");`,
          },
          {
            description: 'com id válido, devolve o nome',
            assertion: `const n = await nomeDoUsuario(3); if (n !== 'Usuário 3') throw new Error("Esperava 'Usuário 3', veio " + JSON.stringify(n) + ".");`,
          },
          {
            description: 'com id inválido, devolve "desconhecido" em vez de estourar',
            assertion: `
              let n;
              try { n = await nomeDoUsuario(-1); }
              catch (e) { throw new Error("O erro escapou da função. Trate-o com try/catch e devolva 'desconhecido'."); }
              if (n !== 'desconhecido') throw new Error("Esperava 'desconhecido', veio " + JSON.stringify(n) + ".");
            `,
          },
          {
            description: 'devolve o nome, não a promise inteira',
            assertion: `const n = await nomeDoUsuario(1); if (typeof n !== 'string') throw new Error("Esperava um texto, veio " + typeof n + ". Faltou o await antes de buscarUsuario?");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'id positivo devolve o nome, o resto devolve desconhecido',
            generate: `return { id: Math.floor(rnd() * 20) - 10 };`,
            // Cada caso espera um temporizador de verdade. Cinquenta deles somam
            // mais de um segundo, e o prazo por teste é de dois — o CI, mais lento
            // que a máquina de quem escreve, estourava. O espaço de entrada aqui é
            // pequeno, e as sondas de limite já cobrem os extremos.
            runs: 12,
            check: `
              const esperado = caso.id > 0 ? 'Usuário ' + caso.id : 'desconhecido';
              const obtido = await nomeDoUsuario(caso.id);
              if (obtido !== esperado) {
                throw new Error("com id " + caso.id + " esperava " + JSON.stringify(esperado) + ", veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        solution: `async function nomeDoUsuario(id) {
  try {
    const usuario = await buscarUsuario(id);
    return usuario.nome;
  } catch (erro) {
    return 'desconhecido';
  }
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `\`await\` pausa só a função onde está, e por isso o código assíncrono passa a se ler de cima para baixo. A função roda de forma síncrona até o primeiro \`await\` e só então devolve o controle — é isso que explica a ordem de qualquer programa assíncrono. Toda função \`async\` devolve uma promise, mesmo quando o \`return\` é um número, então quem chama precisa esperar. Falhas voltam a ser \`try/catch\`, e um bloco só cobre várias chamadas seguidas. Em laços: \`for...of\` com \`await\` espera uma de cada vez, \`Promise.all\` com \`map\` espera todas juntas, e \`forEach\` com \`async\` **não espera nada** — ele descarta a promise que permitiria esperar.`,
    },
  ],
};

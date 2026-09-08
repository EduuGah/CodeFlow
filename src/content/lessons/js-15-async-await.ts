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
  estimatedMinutes: 20,
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
      markdown: `\`await\` pausa só a função onde está, e por isso o código assíncrono passa a se ler de cima para baixo. Toda função \`async\` devolve uma promise — mesmo quando o \`return\` é um número —, então quem chama precisa esperar. Falhas voltam a ser \`try/catch\`, e um bloco só cobre várias chamadas seguidas. Encadeie \`await\` quando um passo depende do anterior; quando não depende, \`Promise.all\` faz em um o que a fila faria em três.`,
    },
  ],
};

import type { Lesson } from '../types';

export const lessonJson: Lesson = {
  id: 'lesson-js-17',
  trackId: 'track-js-fundamentos',
  title: 'JSON: Dados que Atravessam a Rede',
  language: 'javascript',
  objective:
    'Converter entre objeto e texto com segurança, e reconhecer o que se perde na travessia.',
  concepts: ['json', 'objetos', 'strings'],
  status: 'published',
  estimatedMinutes: 28,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um objeto JavaScript só existe dentro do seu programa. Para mandá-lo por rede ou guardá-lo em disco, ele precisa virar **texto** — e o formato combinado para isso é o JSON.

Duas funções fazem a travessia:

~~~javascript
const usuario = { nome: 'Ana', idade: 30, ativo: true };

const texto = JSON.stringify(usuario);
// '{"nome":"Ana","idade":30,"ativo":true}'   <- isto é uma string

const devolta = JSON.parse(texto);
// { nome: 'Ana', idade: 30, ativo: true }    <- isto é um objeto de novo
~~~

Repare que \`texto\` é uma string. Ele **parece** um objeto, e é justamente essa semelhança que confunde: \`texto.nome\` é \`undefined\`, porque strings não têm propriedades suas. Só depois do \`parse\` você volta a ter um objeto.

O JSON é deliberadamente pobre. Ele conhece apenas seis coisas: **texto, número, booleano, \`null\`, lista e objeto**. Nada além disso atravessa.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// O que NÃO sobrevive à travessia
const original = {
  nome: 'Ana',
  criadoEm: new Date('2026-01-15'),   // vira texto
  calcular: () => 42,                  // some
  vazio: undefined,                    // some
  nada: null,                          // sobrevive
};

const volta = JSON.parse(JSON.stringify(original));
console.log(volta);
// { nome: 'Ana', criadoEm: '2026-01-15T00:00:00.000Z', nada: null }

console.log(typeof volta.criadoEm);   // string, não Date!
console.log(volta.calcular);          // undefined

// Ler JSON de fora SEMPRE pode falhar
try {
  const dados = JSON.parse('{"quebrado": }');
} catch (erro) {
  console.log('JSON inválido:', erro.message);
}`,
      caption:
        'Funções e `undefined` desaparecem sem aviso. Datas viram texto e não voltam sozinhas — reconstruí-las é trabalho de quem lê. E todo `parse` de texto externo precisa de `try/catch`: você não controla o que chega.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-17-prever-json',
        type: 'predict-output',
        prompt: 'O que este programa imprime? Pense no que sobrevive à ida e volta.',
        concepts: ['json', 'objetos'],
        difficulty: 'iniciante',
        tags: ['javascript', 'json'],
        code: `const config = {
  tema: 'escuro',
  itens: [1, 2],
  aplicar: function () {},
  extra: undefined,
};

const volta = JSON.parse(JSON.stringify(config));

console.log(Object.keys(volta).length);
console.log(volta.tema);
console.log(volta.aplicar);`,
        expectedOutput: '2\nescuro\nundefined',
        explanation:
          'Só `tema` e `itens` atravessam — por isso `Object.keys` devolve 2. Funções e `undefined` não têm representação em JSON, então `stringify` simplesmente os omite. Nenhum erro é lançado: eles somem em silêncio.',
        hints: [
          'Quais das quatro chaves o JSON consegue representar?',
          'Uma função tem como virar texto JSON? E `undefined`?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-17-lacuna-json',
        type: 'fill-blank',
        prompt:
          'Complete as duas conversões: uma transforma o objeto em texto para guardar, a outra traz de volta.',
        concepts: ['json'],
        difficulty: 'iniciante',
        tags: ['javascript', 'json'],
        template: `function guardar(objeto) {
  return JSON.{{1}}(objeto);
}

function recuperar(texto) {
  return JSON.{{2}}(texto);
}`,
        blanks: [
          { placeholder: 'objeto → texto', size: 10 },
          { placeholder: 'texto → objeto', size: 8 },
        ],
        tests: [
          {
            description: 'guardar devolve texto',
            assertion: `const t = guardar({ a: 1 }); if (typeof t !== 'string') throw new Error("guardar deveria devolver uma string, veio " + typeof t + ".");`,
          },
          {
            description: 'recuperar devolve objeto',
            assertion: `const o = recuperar('{"a":1}'); if (typeof o !== 'object' || o.a !== 1) throw new Error("recuperar deveria devolver um objeto com a === 1, veio " + JSON.stringify(o) + ".");`,
          },
        ],
        properties: [
          {
            description: 'guardar e recuperar em sequência devolvem o valor original',
            generate: `
              return {
                dado: {
                  nome: 'item' + Math.floor(rnd() * 100),
                  quantidade: Math.floor(rnd() * 50),
                  ativo: rnd() < 0.5,
                },
              };
            `,
            check: `
              const volta = recuperar(guardar(caso.dado));
              if (JSON.stringify(volta) !== JSON.stringify(caso.dado)) {
                throw new Error("a ida e volta mudou o valor: " + JSON.stringify(caso.dado) + " virou " + JSON.stringify(volta) + ".");
              }
            `,
          },
        ],
        explanation:
          'Os nomes dizem a direção: `stringify` produz uma **string**, `parse` **analisa** uma string e reconstrói o valor. Trocar os dois é o engano mais comum, e o sintoma é um `[object Object]` aparecendo na tela.',
        hints: [
          'Uma das duas tem "string" no nome. Qual direção ela faz?',
          'A outra analisa um texto para reconstruir o valor.',
        ],
        solution: ['stringify', 'parse'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## A cópia profunda de pobre

Existe um truque que você vai encontrar em muito código:

~~~javascript
const copia = JSON.parse(JSON.stringify(original));
~~~

Ida e volta pelo texto. Como \`parse\` constrói tudo do zero, nada fica compartilhado com o original — nem os objetos aninhados. Resolve num golpe o problema da cópia rasa.

O preço é tudo que o JSON não sabe representar, e o preço é alto:

| No original | Depois da ida e volta |
|---|---|
| \`undefined\` | a chave **some** |
| função | a chave **some** |
| \`Date\` | vira texto |
| \`NaN\`, \`Infinity\` | viram \`null\` |
| referência circular | \`stringify\` **lança** |

Nenhuma dessas perdas avisa. O objeto volta parecendo certo, e o defeito aparece depois — na linha em que alguém chama \`.getFullYear()\` num texto.

Hoje existe a ferramenta feita para isso: \`structuredClone(original)\` copia em profundidade preservando datas, \`Map\`, \`Set\` e até referências circulares. Quando a intenção é copiar, use ela. O truque do JSON continua útil só para o que ele foi feito: **transportar**.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-17-prever-copia',
        type: 'predict-output',
        prompt:
          'Este objeto dá uma volta pelo JSON e retorna. O que sobrou dele?',
        concepts: ['json', 'objetos'],
        difficulty: 'intermediario',
        tags: ['javascript', 'json'],
        code: `const original = {
  nome: 'Ana',
  criadoEm: new Date(2026, 0, 1),
  apelido: undefined,
  saudar: function () { return 'oi'; },
  tags: ['a', 'b'],
};

const copia = JSON.parse(JSON.stringify(original));

console.log(Object.keys(copia).length);
console.log(typeof copia.criadoEm);
console.log(copia.tags === original.tags);`,
        expectedOutput: '3\nstring\nfalse',
        explanation:
          'Das cinco chaves, duas não sobreviveram: `apelido` valia `undefined` e `saudar` era uma função, e o JSON não representa nenhum dos dois — as chaves somem sem aviso. A data virou texto, então `typeof` responde `"string"` e qualquer `.getFullYear()` adiante vai quebrar. Já o array é uma cópia de verdade, construída do zero pelo `parse`: por isso a comparação por identidade dá `false`, que é justamente o efeito desejado quando o objetivo era copiar.',
        hints: [
          'Quais tipos de valor o JSON não sabe escrever? O que acontece com essas chaves?',
          'A data volta como `Date`, ou como outra coisa?',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Todo JSON que vem de fora é suspeito

Quando o texto vem de um servidor, de um arquivo ou do navegador do usuário, você não controla o conteúdo. \`JSON.parse\` **lança** ao receber algo malformado, e um \`parse\` sem proteção derruba a tela por causa de um dado ruim.

~~~javascript
function lerConfig(texto) {
  try {
    return JSON.parse(texto);
  } catch (erro) {
    return null;    // aqui o valor de reserva é honesto: "não consegui ler"
  }
}
~~~

Existe um segundo cuidado, menos óbvio: **JSON válido não significa dados válidos**. \`'{"idade":"trinta"}'\` analisa sem erro nenhum e produz um objeto com uma idade em texto. O \`parse\` garante a forma, nunca o conteúdo — conferir os campos continua sendo trabalho seu.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-17-ler-seguro',
        type: 'code',
        prompt:
          'Crie `lerProduto(texto)`, que recebe um JSON vindo de fora e devolve:\n\n- o objeto, quando o texto é JSON válido **e** tem `nome` (texto não vazio) e `preco` (número)\n- `null` em qualquer outro caso\n\nA função não pode lançar, aconteça o que acontecer com a entrada.',
        concepts: ['json', 'depuracao', 'condicoes'],
        difficulty: 'intermediario',
        tags: ['javascript', 'json'],
        initialCode: `function lerProduto(texto) {
  // JSON válido ainda pode trazer dados inválidos. Confira as duas coisas.
}

console.log(lerProduto('{"nome":"Café","preco":19.9}')); // { nome: 'Café', preco: 19.9 }
console.log(lerProduto('{quebrado'));                    // null
console.log(lerProduto('{"nome":"","preco":10}'));       // null`,
        hints: [
          'Comece protegendo o `JSON.parse` com `try/catch`.',
          'Depois de analisar, confira: `typeof dados.nome === "string"`, nome não vazio, e `typeof dados.preco === "number"`.',
          'Cuidado com `null`: `JSON.parse("null")` funciona e devolve `null`, que não tem propriedades.',
        ],
        tests: [
          {
            description: 'A função lerProduto existe',
            assertion: `if (typeof lerProduto !== 'function') throw new Error("Crie uma função chamada 'lerProduto'.");`,
          },
          {
            description: 'JSON válido e completo devolve o objeto',
            assertion: `const p = lerProduto('{"nome":"Café","preco":19.9}'); if (!p || p.nome !== 'Café' || p.preco !== 19.9) throw new Error("Esperava o produto, veio " + JSON.stringify(p) + ".");`,
          },
          {
            description: 'texto malformado devolve null em vez de estourar',
            assertion: `
              let r;
              try { r = lerProduto('{quebrado'); }
              catch (e) { throw new Error("A função lançou. Proteja o JSON.parse com try/catch."); }
              if (r !== null) throw new Error("Esperava null, veio " + JSON.stringify(r) + ".");
            `,
          },
          {
            description: 'nome vazio devolve null',
            assertion: `if (lerProduto('{"nome":"","preco":10}') !== null) throw new Error("Nome vazio não é nome válido.");`,
            hidden: true,
          },
          {
            description: 'preço em texto devolve null',
            assertion: `if (lerProduto('{"nome":"Pão","preco":"dez"}') !== null) throw new Error("JSON válido não significa dados válidos: confira o tipo de preco.");`,
            hidden: true,
          },
          {
            description: 'o texto "null" devolve null, sem quebrar',
            assertion: `
              let r;
              try { r = lerProduto('null'); }
              catch (e) { throw new Error("Lançou ao receber 'null'. JSON.parse('null') funciona e devolve null, que não tem propriedades."); }
              if (r !== null) throw new Error("Esperava null, veio " + JSON.stringify(r) + ".");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'aceita só o que tem nome preenchido e preço numérico',
            generate: `
              const nome = rnd() < 0.3 ? '' : 'produto' + Math.floor(rnd() * 50);
              const precoNumero = rnd() < 0.7;
              const preco = precoNumero ? Math.floor(rnd() * 100) : 'caro';
              return { nome, preco, valido: nome !== '' && precoNumero };
            `,
            check: `
              const texto = JSON.stringify({ nome: caso.nome, preco: caso.preco });
              const r = lerProduto(texto);

              if (caso.valido) {
                if (!r || r.nome !== caso.nome || r.preco !== caso.preco) {
                  throw new Error("com " + texto + " esperava o objeto, veio " + JSON.stringify(r) + ".");
                }
              } else if (r !== null) {
                throw new Error("com " + texto + " esperava null, veio " + JSON.stringify(r) + ".");
              }
            `,
          },
        ],
        solution: `function lerProduto(texto) {
  let dados;

  try {
    dados = JSON.parse(texto);
  } catch (erro) {
    return null;
  }

  if (typeof dados !== 'object' || dados === null) return null;
  if (typeof dados.nome !== 'string' || dados.nome === '') return null;
  if (typeof dados.preco !== 'number') return null;

  return dados;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `\`stringify\` transforma objeto em texto, \`parse\` traz de volta — e o texto no meio **parece** um objeto sem ser um. Funções, \`undefined\` e datas não atravessam: as duas primeiras somem em silêncio, e a terceira volta como string. É por isso que a ida e volta pelo JSON, usada como cópia profunda, cobra caro — quando a intenção é copiar, \`structuredClone\` é a ferramenta feita para isso. Todo \`parse\` de origem externa precisa de \`try/catch\`, porque você não controla o que chega. E JSON válido não é dado válido: a análise garante a forma, conferir o conteúdo continua sendo seu trabalho.`,
    },
  ],
};

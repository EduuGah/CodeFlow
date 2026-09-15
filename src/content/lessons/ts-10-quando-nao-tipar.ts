import type { Lesson } from '../types';

export const lessonQuandoNaoTipar: Lesson = {
  id: 'lesson-ts-10',
  trackId: 'track-typescript',
  title: 'Quando Não Tipar: O Tipo que Ajuda e o que Atrapalha',
  language: 'typescript',
  objective:
    'Decidir onde um tipo vale o que custa — a fronteira, a forma compartilhada, o estado com variantes — e onde ele só faz ruído; e migrar código JavaScript para TypeScript sem parar o projeto.',
  concepts: ['ts-quando'],
  status: 'published',
  estimatedMinutes: 26,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Nove aulas ensinaram a escrever tipos. Esta ensina a não escrever — porque um tipo custa: tempo de escrever, tempo de ler, e uma linha a mais para manter quando o código muda. Um tipo vale quando **compra** algo. Quando não compra, é ruído, e ruído esconde os tipos que importam.

## O que um tipo compra

Três coisas, e só três:

1. **Um erro antes de rodar.** O compilador recusa \`somar('2', 3)\`.
2. **Documentação que não mente.** \`function buscar(id: number): Promise<Usuario | undefined>\` diz mais que qualquer comentário, e não envelhece.
3. **Autocompletar e refatorar.** Renomear uma propriedade e ter cada uso apontado.

Um tipo que não compra nenhuma das três é ruído.

## Onde tipar

- **A fronteira de toda função**: parâmetros, sempre; retorno, quando a função é longa ou pública.
- **A forma que atravessa funções**: se um objeto sai de uma função e entra em outra, ele tem uma interface com nome.
- **O que vem de fora**: \`unknown\` e uma guarda.
- **Estados com variantes**: uma união discriminada, e não três booleanos que podem se contradizer.
- **Lista vazia e variável sem valor inicial.**

## Onde não tipar

- **Constantes locais com valor**: \`const total = 0\`, \`const nome = usuario.nome\`. O compilador deduz o mesmo que você escreveria.
- **Parâmetros de funções passadas para \`map\`, \`filter\`, \`forEach\`**: deduzidos do tipo da lista.
- **Retorno de funções curtas**: um \`return\` que cabe numa linha se explica sozinho.
- **Tipos derivados escritos à mão**: se é "\`Usuario\` sem \`id\`", é \`Omit\`, não uma interface nova.

## O tipo que atrapalha

~~~typescript
type Resultado<T> = { ok: true; dados: T } | { ok: false; erro: string };
type Carregador<T, P extends unknown[]> = (...params: P) => Promise<Resultado<T>>;
~~~

Isto pode ser ótimo — numa biblioteca usada por cinquenta funções. Numa que tem duas, é um quebra-cabeça que a próxima pessoa vai levar dez minutos para ler. A regra de ouro: **o tipo deve ser mais fácil de ler que o código que ele descreve.** Se não é, simplifique — uma interface com nome, uma união de literais, um \`Partial\`. Genérico aninhado é a última ferramenta, não a primeira.

Do outro lado, \`as\` e \`any\` para calar o compilador não são "não tipar": são tipar errado. Um \`any\` no meio do programa desliga a verificação em tudo o que ele toca.

## Migrar JavaScript

Um projeto em JavaScript não vira TypeScript de uma vez. O caminho que funciona:

1. Renomeie **um arquivo** para \`.ts\` e compile. Os erros que aparecem são reais: são os \`undefined\` e os tipos trocados que estavam lá o tempo todo.
2. Anote os parâmetros — a fronteira — e deixe o compilador deduzir o resto.
3. Extraia interfaces para os objetos que atravessam funções.
4. Onde um valor vem de um módulo ainda em JavaScript, aceite um \`any\` **com comentário** (\`// legado: tipar quando pedidos.js migrar\`). É a exceção: o \`any\` que tem prazo.
5. Repita com o próximo arquivo, começando pelos que mais mudam.

O modo estrito desde o primeiro arquivo. Migrar sem \`strict\` e ligar depois é migrar duas vezes.

## O hábito

Antes de escrever uma função que cruza uma fronteira — recebe de fora, devolve para outro módulo, guarda estado —, escreva a interface primeiro. Não porque o compilador exige, mas porque desenhar a forma antes do código é o momento em que você descobre que "o pedido tem um cliente ou um id de cliente?" ainda não foi decidido. O tipo é onde a decisão fica escrita.
`.trim(),
    },
    {
      kind: 'example',
      language: 'typescript',
      code: `// Tipado na medida: a fronteira, a forma compartilhada, a união de estados.
interface Item { nome: string; preco: number; quantidade: number }

type Carrinho =
  | { estado: 'vazio' }
  | { estado: 'aberto'; itens: Item[] }
  | { estado: 'fechado'; itens: Item[]; total: number };

function total(itens: Item[]) {
  let soma = 0;                       // deduzido
  for (const item of itens) {
    soma += item.preco * item.quantidade;
  }
  return soma;                        // deduzido: number
}

function fechar(carrinho: Carrinho): Carrinho {
  if (carrinho.estado !== 'aberto') return carrinho;
  return { estado: 'fechado', itens: carrinho.itens, total: total(carrinho.itens) };
}

const aberto: Carrinho = {
  estado: 'aberto',
  itens: [{ nome: 'Caderno', preco: 20, quantidade: 2 }],
};

const fechado = fechar(aberto);
console.log(fechado.estado === 'fechado' ? fechado.total : 0);  // 40`,
      caption:
        'Duas anotações de fronteira, uma interface para a forma que atravessa as funções, uma união para os estados. Nenhum `: number` em constante local, nenhum genérico. `fechado.total` só existe depois de conferir o estado — e é o compilador quem lembra disso.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-10-vale',
        type: 'multiple-choice',
        prompt: 'Qual destas anotações compra alguma coisa — erro antes de rodar, documentação, ou autocompletar?',
        concepts: ['ts-quando'],
        difficulty: 'iniciante',
        tags: ['typescript', 'criterio'],
        options: [
          '`const total: number = 0`',
          '`itens.map((item: Item) => item.nome)` numa lista já tipada como `Item[]`',
          '`function buscar(id: number): Promise<Usuario | undefined>`',
          "`const nome: string = usuario.nome` com `usuario: Usuario`",
        ],
        correctIndex: 2,
        explanation:
          'A assinatura de `buscar` é a fronteira: quem chama descobre o que passar e o que volta — inclusive que pode não voltar nada —, e o compilador cobra o `undefined` em cada uso. As outras três repetem o que o compilador já deduz do valor ou do tipo da lista: não pegam erro nenhum a mais, não documentam nada que não esteja a um centímetro de distância, e cada uma é uma linha a mais para manter.',
        hints: ['Qual das quatro diz algo que o leitor não veria olhando o lado direito do `=`?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-10-refatorar-ruido',
        type: 'refactor',
        prompt:
          'Este código funciona e está tipado de menos e de mais ao mesmo tempo: anotações redundantes em toda constante, um `as` calando um erro, um objeto que atravessa duas funções sem nome. Deixe só os tipos que compram algo: uma `interface` com nome para o pedido, os parâmetros anotados, nenhum `as`, nenhuma constante local anotada. O comportamento não muda.',
        concepts: ['ts-quando'],
        difficulty: 'intermediario',
        tags: ['typescript', 'criterio', 'refatoracao'],
        initialCode: `function subtotal(pedido: { itens: { preco: number; quantidade: number }[]; cupom?: string }): number {
  let soma: number = 0;
  for (const item of pedido.itens) {
    const parcial: number = item.preco * item.quantidade;
    soma = soma + parcial;
  }
  return soma;
}

function totalComCupom(pedido: { itens: { preco: number; quantidade: number }[]; cupom?: string }): number {
  const base: number = subtotal(pedido);
  const desconto: number = (pedido.cupom as string) === 'DEZ' ? 0.1 : 0;
  return base * (1 - desconto);
}

const pedido = { itens: [{ preco: 10, quantidade: 2 }, { preco: 5, quantidade: 1 }], cupom: 'DEZ' };
console.log(totalComCupom(pedido));`,
        tests: [
          {
            description: 'subtotal soma preço vezes quantidade',
            assertion: `if (subtotal({ itens: [{ preco: 10, quantidade: 2 }, { preco: 5, quantidade: 1 }] }) !== 25) throw new Error('subtotal deveria devolver 25.');`,
          },
          {
            description: 'totalComCupom aplica 10% com o cupom DEZ',
            assertion: `if (Math.abs(totalComCupom({ itens: [{ preco: 10, quantidade: 2 }, { preco: 5, quantidade: 1 }], cupom: 'DEZ' }) - 22.5) > 1e-9) throw new Error('totalComCupom com DEZ deveria devolver 22.5.');`,
          },
          {
            description: 'totalComCupom sem cupom não desconta',
            assertion: `if (totalComCupom({ itens: [{ preco: 10, quantidade: 1 }] }) !== 10) throw new Error('totalComCupom sem cupom deveria devolver 10.');`,
          },
        ],
        constraints: [
          { description: 'O pedido tem uma `interface` com nome', required: 'interface ' },
          { description: 'Nenhum `as`', forbidden: ' as ' },
          { description: 'Nenhuma constante ou variável local anotada com `: number =`', forbidden: ': number =' },
          { description: 'A forma do pedido não é repetida inline nos parâmetros', forbidden: 'pedido: { itens' },
        ],
        explanation:
          'A forma do pedido atravessa duas funções: ela tem nome, e as duas assinaturas passam a ler `pedido: Pedido`. As constantes locais perdem a anotação — `soma`, `parcial`, `base`, `desconto` são deduzidas dos valores. E o `as string` saiu porque estava calando um erro real: `cupom` pode ser `undefined`, e comparar `undefined === \'DEZ\'` é falso, o que é exatamente o comportamento certo — o `as` não comprava nada, só escondia a união. O que ficou é o que compra algo: a interface e os parâmetros.',
        hints: [
          'Primeiro dê nome à forma do pedido com uma interface (itens e o cupom opcional), e use o nome dela nos dois parâmetros.',
          'Depois tire cada `: number =`. Por fim, o `as string`: `pedido.cupom === \'DEZ\'` compila sem ele, porque comparar com `undefined` é permitido.',
          'A interface dos itens pode ser outra (`Item`) ou ficar inline dentro de `Pedido`; as duas formas cumprem as restrições.',
        ],
        solution: `interface Item {
  preco: number;
  quantidade: number;
}

interface Pedido {
  itens: Item[];
  cupom?: string;
}

function subtotal(pedido: Pedido): number {
  let soma = 0;
  for (const item of pedido.itens) {
    const parcial = item.preco * item.quantidade;
    soma = soma + parcial;
  }
  return soma;
}

function totalComCupom(pedido: Pedido): number {
  const base = subtotal(pedido);
  const desconto = pedido.cupom === 'DEZ' ? 0.1 : 0;
  return base * (1 - desconto);
}

const pedido = { itens: [{ preco: 10, quantidade: 2 }, { preco: 5, quantidade: 1 }], cupom: 'DEZ' };
console.log(totalComCupom(pedido));`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-10-ordenar-migrar',
        type: 'order-steps',
        prompt: 'Um arquivo JavaScript vai virar TypeScript. Coloque os passos na ordem que a aula recomenda.',
        concepts: ['ts-quando'],
        difficulty: 'iniciante',
        tags: ['typescript', 'migracao'],
        steps: [
          { id: 'renomear', text: 'Renomear o arquivo para `.ts`, com o modo estrito ligado, e compilar', ordem: 1 },
          { id: 'ler', text: 'Ler os erros: são os `undefined` e os tipos trocados que já estavam lá', ordem: 2 },
          { id: 'parametros', text: 'Anotar os parâmetros das funções — a fronteira — e deixar o resto ser deduzido', ordem: 3 },
          { id: 'interfaces', text: 'Extrair interfaces para os objetos que atravessam funções', ordem: 4 },
          { id: 'legado', text: 'Onde um valor vem de um módulo ainda em JavaScript, aceitar um `any` com comentário e prazo', ordem: 5 },
          { id: 'proximo', text: 'Repetir com o próximo arquivo, começando pelos que mais mudam', ordem: 6 },
        ],
        explanation:
          'Um arquivo por vez, estrito desde o primeiro. Os erros da primeira compilação não são culpa do TypeScript: são os defeitos que o JavaScript deixava passar. A fronteira primeiro, as formas com nome depois, e o `any` só onde o outro lado ainda não migrou — com o comentário que diz quando ele sai.',
        hints: ['Antes de anotar qualquer coisa, é preciso ver o que o compilador acha do arquivo como está.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-10-agrupar',
        type: 'code',
        prompt:
          'O último exercício junta a trilha: migre `agrupar` de JavaScript. Ela recebe uma lista de objetos e o nome de uma propriedade, e devolve um objeto que agrupa os itens pelo valor dessa propriedade. Tipe-a de forma que funcione para **qualquer** objeto, só aceite propriedades que **existem** nele, e devolva um mapa de listas do tipo original.',
        concepts: ['ts-quando'],
        difficulty: 'avancado',
        tags: ['typescript', 'genericos', 'utilitarios'],
        initialCode: `function agrupar(itens, chave) {
  const grupos = {};
  for (const item of itens) {
    const valor = String(item[chave]);
    if (!grupos[valor]) grupos[valor] = [];
    grupos[valor].push(item);
  }
  return grupos;
}
`,
        tests: [
          {
            description: 'agrupa produtos por categoria',
            assertion: `const g = agrupar([{ nome: 'Caneta', cat: 'papel' }, { nome: 'Maçã', cat: 'fruta' }, { nome: 'Lápis', cat: 'papel' }], 'cat'); if (Object.keys(g).length !== 2 || g.papel.length !== 2 || g.fruta[0].nome !== 'Maçã') throw new Error('Esperava dois grupos: papel com 2 e fruta com 1, veio ' + JSON.stringify(g));`,
          },
          {
            description: 'lista vazia devolve objeto vazio',
            assertion: `if (Object.keys(agrupar([], 'x')).length !== 0) throw new Error('Com lista vazia, agrupar deveria devolver {}.');`,
          },
          {
            description: 'agrupa por número também',
            assertion: `const g = agrupar([{ n: 1 }, { n: 2 }, { n: 1 }], 'n'); if (g['1'].length !== 2 || g['2'].length !== 1) throw new Error('Esperava g["1"] com 2 e g["2"] com 1, veio ' + JSON.stringify(g));`,
          },
        ],
        typeTests: [
          {
            description: 'a chave precisa existir no objeto',
            code: "agrupar([{ nome: 'a', cat: 'x' }], 'cor');",
            rejects: true,
          },
          {
            description: 'os grupos preservam o tipo dos itens',
            code: "const g = agrupar([{ nome: 'a', cat: 'x' }], 'cat'); const primeiro = g['x']?.[0]; if (primeiro) { const n: string = primeiro.nome; }",
          },
          {
            description: 'algo que não é lista é recusado',
            code: "agrupar('abc', 'length');",
            rejects: true,
          },
        ],
        hints: [
          'Um parâmetro de tipo para o item (`<T>`), a lista como `T[]`, e a chave como `keyof T`.',
          'O retorno é um mapa de texto para lista de `T`: `Record<string, T[]>` — e `grupos` precisa dessa anotação, porque nasce vazio.',
          'Dentro do laço, `grupos[valor]` pode ser `undefined` para o compilador: trate antes do `push` (um `??`, ou o `if` que já existe seguido do acesso).',
        ],
        solution: `function agrupar<T>(itens: T[], chave: keyof T): Record<string, T[]> {
  const grupos: Record<string, T[]> = {};
  for (const item of itens) {
    const valor = String(item[chave]);
    const grupo = grupos[valor] ?? [];
    grupo.push(item);
    grupos[valor] = grupo;
  }
  return grupos;
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-10-any-com-prazo',
        type: 'multiple-choice',
        prompt: 'Durante uma migração, `carregarPedidos()` ainda vive num arquivo JavaScript e devolve dados sem tipo. O que a aula recomenda para o lado TypeScript?',
        concepts: ['ts-quando'],
        difficulty: 'intermediario',
        tags: ['typescript', 'migracao'],
        options: [
          'Espalhar `as Pedido[]` em cada uso, para o código compilar',
          'Parar a migração até `carregarPedidos` virar TypeScript',
          'Um `any` (ou `unknown` com guarda, se o dado vem de fora) **com comentário e prazo**: `// legado: tipar quando pedidos.js migrar` — a exceção que tem data para sair',
          'Desligar o modo estrito no arquivo',
        ],
        correctIndex: 2,
        explanation:
          'A migração é um arquivo por vez, e nas costuras com o que ainda é JavaScript um valor chega sem tipo. O `as` em cada uso multiplica mentiras; parar a migração é não migrar; desligar o `strict` é migrar duas vezes. O `any` com comentário é honesto: diz que ali o compilador não confere **ainda**, e diz quando vai conferir. Se o dado vem de fora do programa (rede, arquivo), é `unknown` com guarda, como na aula da API.',
        hints: ['A resposta certa é a única que deixa escrito quando o problema vai ser resolvido.'],
      },
    },
    {
      kind: 'summary',
      markdown: `Um tipo compra três coisas — erro antes de rodar, documentação que não mente, autocompletar — ou é ruído. Tipe a fronteira das funções, a forma que atravessa funções, o que vem de fora, os estados com variantes, a lista vazia. Não tipe o que o compilador deduz do valor. O tipo deve ser mais fácil de ler que o código; genérico aninhado é a última ferramenta. Migre um arquivo por vez, estrito desde o primeiro, com o \`any\` só nas costuras e com prazo.`,
    },
  ],
};

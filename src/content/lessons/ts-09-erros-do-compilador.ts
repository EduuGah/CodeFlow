import type { Lesson } from '../types';

export const lessonErrosDoCompilador: Lesson = {
  id: 'lesson-ts-9',
  trackId: 'track-typescript',
  title: 'Erros do Compilador: Como Ler',
  language: 'typescript',
  objective:
    'Ler uma mensagem do compilador de ponta a ponta — código, linha, o que era esperado e o que veio, a cadeia — e corrigir a causa em vez de calar o sintoma.',
  concepts: ['ts-erros'],
  status: 'published',
  estimatedMinutes: 26,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Você já leu dezenas de mensagens do compilador nesta trilha. Esta aula é sobre lê-las **de propósito**: uma mensagem do TypeScript tem uma anatomia fixa, e quem a conhece resolve o erro em segundos em vez de tentar coisas até o vermelho sumir.

## A anatomia

~~~
aluno.ts(4,7): error TS2322: Type 'string' is not assignable to type 'number'.
~~~

Quatro partes, sempre nesta ordem:

1. **Onde**: arquivo, linha 4, coluna 7. Vá até lá antes de ler o resto.
2. **O código**: \`TS2322\`. Cada tipo de erro tem um número fixo; pesquisar "TS2322" acha a explicação em qualquer língua.
3. **O que veio**: \`Type 'string'\` — o tipo do valor que você escreveu.
4. **O que era esperado**: \`type 'number'\` — o tipo do lugar onde ele foi posto.

A frase é sempre "X is not assignable to Y": **X é o que você deu, Y é o que o lugar pedia.** Nesta plataforma o "onde" vira "Linha 4" e a explicação em português vem ao lado; fora daqui, é essa a frase.

## As cinco famílias

Quase todo erro que você vai ver cai numa delas:

| Mensagem | O que diz |
| --- | --- |
| \`Type 'X' is not assignable to type 'Y'\` | Você pôs um X onde cabia um Y. Confira de onde o valor veio. |
| \`Argument of type 'X' is not assignable to parameter of type 'Y'\` | O mesmo, numa chamada: o argumento é X, o parâmetro pede Y. |
| \`Property 'p' does not exist on type 'T'\` | \`T\` não tem \`p\`. Erro de digitação, ou o tipo está errado, ou falta estreitar uma união. |
| \`'x' is possibly 'undefined'\` | \`x\` pode não existir aqui. Confira antes (\`if\`, \`?.\`, \`??\`). |
| \`Parameter 'x' implicitly has an 'any' type\` | Falta anotar o parâmetro. |

E as ajudas: \`Did you mean 'nome'?\` é o compilador achando um nome parecido — quase sempre é isso mesmo. \`Expected 2 arguments, but got 1\` conta os argumentos por você.

## A cadeia

Erros em objetos vêm em cadeia, do geral ao específico:

~~~
Type '{ nome: string; preco: string; }' is not assignable to type 'Produto'.
  Types of property 'preco' are incompatible.
    Type 'string' is not assignable to type 'number'.
~~~

Leia **de baixo para cima**: a última linha é o detalhe (\`preco\` veio texto, pedia número); a primeira é só o contexto (o objeto inteiro não serve). Aqui a cadeia aparece numa linha, com setas.

## Cascata: o primeiro erro manda

Um erro produz outros. \`const precos = ['10', '20']\` (com aspas por engano) faz \`totalDe(precos)\` reclamar, \`precos[0] * 2\` reclamar, e \`media(precos)\` reclamar — três mensagens, **uma** causa. Corrija a primeira linha em que o valor nasceu errado e recompile: as outras somem.

Regra: leia o **primeiro** erro, vá à linha, pergunte "de onde este valor veio?", corrija lá. Não corrija os sintomas um a um.

## O que não fazer

Todo erro de tipo tem duas saídas que calam o compilador sem consertar nada: \`as\` e \`any\`. \`precos as number[]\` faz o vermelho sumir e deixa o texto lá dentro, para estourar em execução. O compilador reclamou porque encontrou um problema real; a pergunta é sempre "por que este valor tem este tipo?", nunca "como faço o erro sumir?".

## Quando o compilador está errado

Raramente — mas acontece: uma biblioteca com tipos desatualizados, um caso que a inferência não alcança. Aí \`as\` é a ferramenta certa, com um comentário dizendo por quê. Se você não consegue escrever o porquê, não é um desses casos.
`.trim(),
    },
    {
      kind: 'example',
      language: 'typescript',
      code: `// @recusado
// Um erro, três mensagens. A causa está na primeira linha com valor errado.
interface Produto { nome: string; preco: number }

const precos = ['10', '20', '30'];          // aspas por engano: string[]

function totalDe(valores: number[]): number {
  let soma = 0;
  for (const v of valores) soma += v;
  return soma;
}

console.log(totalDe(precos));               // Argument of type 'string[]'…
console.log(precos[0] * 2);                 // The left-hand side of an arithmetic…
const p: Produto = { nome: 'A', preco: precos[1] };  // Type 'string' is not assignable…`,
      caption:
        'Três erros, todos consequência das aspas na linha 4. Quem corrige de baixo para cima passa a tarde; quem pergunta "de onde `precos` veio?" corrige uma linha. Este exemplo é marcado como recusado de propósito — o CI confere que ele não compila.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-9-ler',
        type: 'multiple-choice',
        prompt: "Na mensagem `Argument of type 'string' is not assignable to parameter of type 'number'`, o que cada tipo representa?",
        concepts: ['ts-erros'],
        difficulty: 'iniciante',
        tags: ['typescript', 'erros'],
        options: [
          'A função devolve texto, e o código esperava número',
          'O valor passado na chamada é texto; o parâmetro da função pede número',
          'O parâmetro é texto, e o argumento passado é número',
          'A função aceita texto ou número, e recebeu os dois',
        ],
        correctIndex: 1,
        explanation:
          'A frase é sempre "o que veio is not assignable to o que era esperado". `Argument of type \'string\'` é o que você passou; `parameter of type \'number\'` é o que a função declarou. A correção começa na chamada — de onde veio esse texto? — e não na função, que está dizendo exatamente o que quer.',
        hints: ['Argument é o que quem chama passa; parameter é o que a função declara.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-9-cadeia',
        type: 'multiple-choice',
        prompt:
          "O compilador diz: `Type '{ nome: string; preco: string; }' is not assignable to type 'Produto'. → Types of property 'preco' are incompatible. → Type 'string' is not assignable to type 'number'.` Qual é a correção?",
        concepts: ['ts-erros'],
        difficulty: 'iniciante',
        tags: ['typescript', 'erros'],
        options: [
          'Mudar `Produto` para aceitar `preco: string`',
          'O objeto inteiro está errado: trocar por outro objeto',
          'O `preco` do objeto veio como texto, e `Produto` pede número: converter na origem (ou consertar de onde o texto veio)',
          "Acrescentar `as Produto` no final do objeto",
        ],
        correctIndex: 2,
        explanation:
          'A cadeia se lê de baixo para cima: o detalhe é a última linha — `preco` texto onde cabia número. As linhas de cima só situam (é a propriedade `preco`; é por isso que o objeto não serve como `Produto`). Mudar a interface para aceitar texto esconderia o problema em todo lugar que usa `preco`; `as` esconderia só aqui. A correção é onde o texto nasceu.',
        hints: ['A última linha da cadeia é a mais específica. O que ela diz?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-9-ordenar',
        type: 'order-steps',
        prompt: 'O compilador mostrou três erros. Coloque na ordem o jeito de resolver que a aula ensina.',
        concepts: ['ts-erros'],
        difficulty: 'iniciante',
        tags: ['typescript', 'erros'],
        steps: [
          { id: 'primeiro', text: 'Ler o primeiro erro: a linha, o código e a frase "X is not assignable to Y"', ordem: 1 },
          { id: 'linha', text: 'Ir até a linha e identificar o valor que tem o tipo errado', ordem: 2 },
          { id: 'origem', text: 'Perguntar de onde esse valor veio, e seguir até a linha em que ele nasceu com o tipo errado', ordem: 3 },
          { id: 'causa', text: 'Corrigir a causa nessa linha — sem `as` nem `any`', ordem: 4 },
          { id: 'recompilar', text: 'Recompilar: os erros em cascata somem; se sobrou algum, voltar ao primeiro', ordem: 5 },
        ],
        explanation:
          'A ordem existe porque um erro produz outros: consertar os sintomas de baixo para cima é trabalho perdido quando a causa está numa linha só. Ler o primeiro, seguir o valor até a origem, corrigir lá, recompilar — e o que sobrar é um erro novo, com a mesma receita.',
        hints: ['Antes de corrigir qualquer coisa, é preciso saber de onde o valor errado veio.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-9-bug-cascata',
        type: 'find-bug',
        prompt:
          'O compilador mostra **três** erros neste programa, em três linhas diferentes. Todos têm uma causa só. Aponte a linha que precisa mudar.',
        concepts: ['ts-erros'],
        difficulty: 'intermediario',
        tags: ['typescript', 'erros', 'depuracao'],
        code: `function totalDe(valores: number[]): number {
  let soma = 0;
  for (const v of valores) {
    soma += v;
  }
  return soma;
}

const notas = ['7', '8', '9'];
const total: number = totalDe(notas);
const maior: number = notas[2];
console.log(total, notas[2] * 2, maior);`,
        buggyLine: 9,
        fix: 'const notas = [7, 8, 9];',
        symptomLine: 10,
        symptomFeedback:
          'É onde o primeiro erro aparece: `totalDe(notas)` com `notas` sendo `string[]`. Mas a chamada está certa para uma lista de números — o defeito é a lista ter nascido com aspas, uma linha acima.',
        explanation:
          '`[\'7\', \'8\', \'9\']` é `string[]`. Daí `totalDe(notas)` é recusado (argumento `string[]`, parâmetro `number[]`), `notas[2]` não cabe num `number`, e `notas[2] * 2` é conta com texto — o compilador aponta cada uso. Uma causa, três mensagens. Tirar as aspas na linha em que a lista nasceu resolve as três; corrigir os usos um a um (com `Number(...)` em cada) seria consertar o sintoma e manter a mentira.',
        hints: [
          'Os três erros usam a mesma variável. Onde ela é declarada?',
          'Que tipo o compilador deduziu para a lista? Compare com o que `totalDe` pede.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-9-consertar-tudo',
        type: 'code',
        prompt:
          'Este programa tem **quatro** erros de tipo diferentes, de quatro famílias da aula. Leia cada mensagem, corrija a causa (sem `as`, sem `any`) e faça o programa compilar e passar nos testes. A saída certa é `Ana tem 3 pedidos, o último de R$ 45.00`.',
        concepts: ['ts-erros'],
        difficulty: 'intermediario',
        tags: ['typescript', 'erros'],
        initialCode: `interface Cliente {
  nome: string;
  pedidos: number[];
}

function ultimoPedido(pedidos: number[]): number | undefined {
  return pedidos[pedidos.length - 1];
}

function descrever(cliente) {
  const ultimo = ultimoPedido(cliente.pedidos);
  return cliente.nome + ' tem ' + cliente.pedidos.length + ' pedidos, o último de R$ ' + ultimo.toFixed(2);
}

const ana: Cliente = { nome: 'Ana', pedidos: [10, 20, '45'] };
console.log(descrever(ana, true));
`,
        tests: [
          {
            description: 'descrever(ana) devolve a frase certa',
            assertion: `const r = descrever({ nome: 'Ana', pedidos: [10, 20, 45] }); if (r !== 'Ana tem 3 pedidos, o último de R$ 45.00') throw new Error("Esperava 'Ana tem 3 pedidos, o último de R$ 45.00', veio '" + r + "'.");`,
          },
          {
            description: 'um cliente sem pedidos não quebra',
            assertion: `const r = descrever({ nome: 'Bia', pedidos: [] }); if (typeof r !== 'string' || !r.startsWith('Bia tem 0 pedidos')) throw new Error("Com lista vazia, descrever deveria devolver um texto começando com 'Bia tem 0 pedidos', veio '" + r + "'.");`,
          },
        ],
        typeTests: [
          { description: 'descrever aceita um Cliente', code: "descrever({ nome: 'Caio', pedidos: [1] });" },
          { description: 'descrever recusa um argumento a mais', code: "descrever({ nome: 'Caio', pedidos: [1] }, true);", rejects: true },
          { description: 'descrever recusa algo que não é Cliente', code: 'descrever(5);', rejects: true },
        ],
        hints: [
          'Os quatro, na ordem em que aparecem: parâmetro sem tipo; um valor que pode ser undefined usado como número; um texto numa lista de números; um argumento a mais na chamada.',
          '`cliente: Cliente`; trate o `undefined` de `ultimo` (um `?? 0`, ou um `if` que devolve outra frase); tire as aspas do `\'45\'`; tire o `true`.',
        ],
        solution: `interface Cliente {
  nome: string;
  pedidos: number[];
}

function ultimoPedido(pedidos: number[]): number | undefined {
  return pedidos[pedidos.length - 1];
}

function descrever(cliente: Cliente) {
  const ultimo = ultimoPedido(cliente.pedidos);
  if (ultimo === undefined) {
    return cliente.nome + ' tem 0 pedidos';
  }
  return cliente.nome + ' tem ' + cliente.pedidos.length + ' pedidos, o último de R$ ' + ultimo.toFixed(2);
}

const ana: Cliente = { nome: 'Ana', pedidos: [10, 20, 45] };
console.log(descrever(ana));`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-ts-9-calar',
        type: 'multiple-choice',
        prompt: 'O compilador reclama de `total: string` onde `Pedido` pede `number`. Um colega sugere `total: valor as number`. Por que isso é a correção errada?',
        concepts: ['ts-erros'],
        difficulty: 'iniciante',
        tags: ['typescript', 'erros'],
        options: [
          'Porque `as` não compila em objetos',
          'Porque `as` cala a mensagem e deixa o texto dentro de `total`: o erro que o compilador achou continua lá, e vai estourar em execução',
          'Porque o certo seria `as any`',
          'Não é errada: `as` converte o texto em número',
        ],
        correctIndex: 1,
        explanation:
          '`as` não converte nada — é uma afirmação para o compilador, sem efeito em execução. O valor continua texto; só a reclamação some. Quem somar `total + 5` depois vai obter `"305"` e descobrir o problema longe daqui. A mensagem apontou um valor com o tipo errado; a pergunta é de onde ele veio, e a correção é lá (um `Number(...)` na origem, ou consertar quem produziu o texto).',
        hints: ['O que `as` faz em execução? Nada. Então o que mudou de verdade?'],
      },
    },
    {
      kind: 'summary',
      markdown: `Uma mensagem tem onde, código, o que veio e o que era esperado — sempre "X is not assignable to Y", com X sendo o que você deu. A cadeia se lê de baixo para cima. Erros vêm em cascata: leia o primeiro, siga o valor até onde nasceu errado, corrija lá, recompile. \`as\` e \`any\` calam o compilador sem consertar; só valem quando você sabe mais que ele e consegue escrever por quê.`,
    },
  ],
};

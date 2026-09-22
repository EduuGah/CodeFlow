import type { Lesson } from '../types';

export const lessonTestesFragil: Lesson = {
  id: 'lesson-testes-7',
  trackId: 'track-testes',
  title: 'Testes Frágeis',
  language: 'javascript',
  objective:
    'Reconhecer um teste que verifica a implementação em vez do comportamento, entender por que ele quebra sem motivo, e escrever testes que sobrevivem a uma refatoração.',
  concepts: ['testes-fragil'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Um teste **frágil** quebra quando o código muda **de forma**, mesmo que o comportamento continue certo. É o oposto do que um teste deveria fazer: dar segurança para mudar o código, não impedir a mudança.

## O comportamento é o contrato; o "como" não é

~~~js
function somarLista(numeros) {
  let total = 0;
  for (const n of numeros) total = total + n;
  return total;
}
~~~

O **comportamento** de \`somarLista\` é: recebe uma lista de números, devolve a soma. O **como** — um \`for\`, um \`reduce\`, uma recursão — é detalhe de implementação, e a aula de funções pequenas já ensinou: o de dentro é livre para mudar, desde que o de fora continue prometendo o mesmo.

~~~js
// Teste do comportamento: sobrevive a qualquer reescrita por dentro.
assert(somarLista([1, 2, 3]) === 6, 'soma os números da lista');
~~~

Esse teste não sabe se há um \`for\` ou um \`reduce\` lá dentro — só chama a função e confere o resultado. Reescrever \`somarLista\` para usar \`reduce\` não muda uma vírgula deste teste.

## O que torna um teste frágil

Um teste fica frágil quando ele espia o **de dentro** da função, em vez de só usar a porta dela:

~~~js
// Frágil: examina o texto do código-fonte da função.
assert(somarLista.toString().includes('for'), 'usa um laço for');

// Frágil: depende de uma variável interna que o teste não deveria conhecer.
assert(somarLista.totalInterno === undefined, 'não deixou vazamento');
~~~

O primeiro quebra assim que alguém trocar o \`for\` por \`reduce\` — mesmo a soma continuando certa. O segundo depende de um detalhe que nem faz parte do contrato da função. Os dois têm o mesmo problema: testam **como**, não **o quê**.

## Outro jeito de ficar frágil: depender de ordem que não é garantida

~~~js
function buscarTags(produto) {
  return new Set(produto.tags); // um Set não garante ordem
}

// Frágil: um Set pode reordenar por dentro.
assert(JSON.stringify([...buscarTags(produto)]) === '["novo","promocao"]', 'as tags na ordem certa');

// Robusto: confere o conjunto, não a ordem.
const tags = [...buscarTags(produto)];
assert(tags.includes('novo') && tags.includes('promocao') && tags.length === 2, 'tem as duas tags');
~~~

Se a função nunca prometeu uma ordem, o teste não deveria exigir uma — senão ele quebra por uma mudança que nem é um bug.

## O sinal de alerta

Depois de refatorar uma função **sem mudar o que ela faz**, os testes dela deveriam continuar passando **sem editar nenhum**. Se um teste quebrou, pergunte: o comportamento mudou de verdade, ou o teste estava espiando o "como"? Só no primeiro caso o teste está certo em reclamar.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// ANTES: com for.
function nomesMaiores(pessoas, idadeMinima) {
  const nomes = [];
  for (const pessoa of pessoas) {
    if (pessoa.idade >= idadeMinima) nomes.push(pessoa.nome);
  }
  return nomes;
}

// DEPOIS: reescrito com filter e map. Comportamento idêntico.
function nomesMaiores2(pessoas, idadeMinima) {
  return pessoas.filter((p) => p.idade >= idadeMinima).map((p) => p.nome);
}

// O MESMO teste vale para as duas versões — porque testa o comportamento.
const pessoas = [{ nome: 'Ana', idade: 20 }, { nome: 'Bia', idade: 15 }];
assert(JSON.stringify(nomesMaiores(pessoas, 18)) === '["Ana"]', 'só maiores de idade');
assert(JSON.stringify(nomesMaiores2(pessoas, 18)) === '["Ana"]', 'a versão reescrita se comporta igual');`,
      caption:
        'As duas versões passam no mesmo teste, porque o teste verifica o resultado — nunca o for, o filter ou o map por dentro.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-7-identificar',
        type: 'multiple-choice',
        prompt: 'Qual destes testes é FRÁGIL — quebraria numa refatoração que não muda o comportamento?',
        concepts: ['testes-fragil'],
        difficulty: 'iniciante',
        tags: ['testes', 'fragil'],
        options: [
          '`assert(calcularTotal.toString().includes("reduce"), "usa reduce")`',
          '`assert(calcularTotal([10, 20]) === 30, "soma os valores")`',
          '`assert(calcularTotal([]) === 0, "lista vazia soma zero")`',
          '`assert(calcularTotal([-5]) === -5, "aceita valores negativos")`',
        ],
        correctIndex: 0,
        explanation:
          'O primeiro examina o **código-fonte** da função (`.toString()`) em vez do resultado — se alguém trocar `reduce` por um `for`, o teste quebra mesmo que a soma continue certa. Os outros três chamam a função e conferem o que ela devolve: sobrevivem a qualquer reescrita por dentro.',
        hints: ['Qual desses testes olha para "como o código foi escrito" em vez de "o que ele devolve"?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-7-refatorar',
        type: 'refactor',
        prompt:
          'Esta função soma os preços de uma lista de itens, usando um `for` com uma variável mutável. Reescreva-a usando `reduce`, sem `for` e sem `let`. Os testes (que verificam só o **comportamento**) precisam continuar passando sem que você mude uma linha deles.',
        concepts: ['testes-fragil'],
        difficulty: 'intermediario',
        tags: ['testes', 'refatorar', 'reduce'],
        initialCode: `function somarPrecos(itens) {
  let total = 0;
  for (let i = 0; i < itens.length; i++) {
    total = total + itens[i].preco;
  }
  return total;
}`,
        tests: [
          {
            description: 'soma os preços de uma lista com itens',
            assertion: `const r = somarPrecos([{ preco: 10 }, { preco: 20 }, { preco: 5 }]);
if (r !== 35) throw new Error('esperava 35, veio ' + r);`,
          },
          {
            description: 'lista vazia soma zero',
            assertion: `const r = somarPrecos([]);
if (r !== 0) throw new Error('esperava 0, veio ' + r);`,
          },
          {
            description: 'funciona com um item só',
            assertion: `const r = somarPrecos([{ preco: 42 }]);
if (r !== 42) throw new Error('esperava 42, veio ' + r);`,
          },
        ],
        constraints: [
          { description: 'Sem `for`', forbidden: 'for' },
          { description: 'Sem `let`', forbidden: 'let' },
          { description: 'Usa `reduce`', required: 'reduce' },
        ],
        explanation:
          'Os três testes verificam só o resultado — nenhum deles sabe se há um `for` ou um `reduce` por dentro. É exatamente por isso que a refatoração pôde trocar a implementação inteira sem que um único teste precisasse mudar: eles testavam o comportamento, não a forma.',
        solution: `function somarPrecos(itens) {
  return itens.reduce((total, item) => total + item.preco, 0);
}`,
        hints: [
          '`reduce` recebe uma função que combina o acumulado com cada item, e um valor inicial.',
          'O valor inicial do acumulador é `0` — é ele que faz a lista vazia somar zero sem precisar de um caso especial.',
          'A função dentro do `reduce` é `(total, item) => total + item.preco`.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-7-ordem-set',
        type: 'predict-output',
        prompt:
          'Um teste depende da ordem dos itens dentro de um `Set` — algo que o `Set` nunca prometeu. O que este programa imprime?',
        concepts: ['testes-fragil'],
        difficulty: 'intermediario',
        tags: ['testes', 'fragil', 'set'],
        code: `const tags = new Set(['b', 'a', 'c']);
console.log([...tags].join(','));
console.log(tags.has('a') && tags.has('b') && tags.has('c') && tags.size === 3);`,
        expectedOutput: `b,a,c
true`,
        explanation:
          'Um `Set` em JavaScript preserva a ordem de inserção neste motor — mas essa não é uma garantia da estrutura de dados em todo lugar, e um teste que depender dela está apostando num detalhe que não faz parte do contrato de "conjunto". A segunda linha testa o que de fato importa: quais elementos estão lá, sem se importar com a ordem.',
        hints: ['Qual das duas linhas verifica "o que está no conjunto" e qual verifica "em que ordem"?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-7-variavel-interna',
        type: 'multiple-choice',
        prompt:
          'Uma função de cache guarda os resultados numa variável interna `_cache` — um detalhe de implementação, não uma promessa da função. Qual teste é frágil por causa dela?',
        concepts: ['testes-fragil'],
        difficulty: 'intermediario',
        tags: ['testes', 'fragil'],
        options: [
          'assert(buscarPreco._cache["1"] === 42, "guardou o preço no cache")',
          'assert(buscarPreco(1) === 42, "busca o preço do produto 1")',
          'assert(buscarPreco(1) === buscarPreco(1), "a segunda chamada devolve o mesmo valor")',
          'assert(typeof buscarPreco(1) === "number", "devolve um número")',
        ],
        correctIndex: 0,
        explanation:
          'Acessar `_cache` diretamente prende o teste a um detalhe interno — se alguém trocar o cache por outra estrutura de dados (um `Map`, ou nenhum cache), esse teste quebra mesmo que `buscarPreco` continue devolvendo o preço certo. Os outros três testam o comportamento observável de fora: o valor devolvido, e a consistência dele entre chamadas.',
        hints: ['Qual desses testes acessa algo que não faz parte do que a função promete devolver?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-7-quando-deveria-quebrar',
        type: 'multiple-choice',
        prompt:
          'Você refatorou `calcularDesconto` e um teste dela quebrou. Antes de mexer no teste, o que você deveria checar primeiro?',
        concepts: ['testes-fragil'],
        difficulty: 'iniciante',
        tags: ['testes', 'fragil'],
        options: [
          'Se o comportamento (o valor que a função devolve para cada entrada) realmente mudou, ou se o teste só espiava o "como"',
          'Apagar o teste, já que ele está atrapalhando a refatoração',
          'Trocar o valor esperado no teste para o que a função passou a devolver, sem investigar',
          'Nada — um teste que quebra depois de uma refatoração está sempre errado',
        ],
        correctIndex: 0,
        explanation:
          'Um teste quebrar depois de uma mudança não é, por si só, prova de que o teste está errado — pode ser um bug de verdade introduzido na refatoração. A pergunta certa é sempre "o comportamento mudou de propósito, ou o teste dependia de um detalhe de implementação?". Só quando a resposta é a segunda o teste é que precisa ser corrigido, não a função.',
        hints: ['Um teste que quebra pode estar certo (pegou um bug de verdade) ou errado (era frágil). Como diferenciar os dois casos?'],
      },
    },
    {
      kind: 'summary',
      markdown: `
Um teste **frágil** verifica **como** o código faz algo — o texto-fonte, uma variável interna, uma ordem que nunca foi prometida — e por isso quebra numa refatoração que não mudou o comportamento.

Um teste **robusto** verifica **o quê**: chama a função pela porta de fora e confere o resultado. Depois de refatorar sem mudar comportamento, os testes robustos continuam passando sem editar nenhum.

Na próxima aula, o teste mais valioso de todos: o que pega o bug de ontem antes que ele volte.
`.trim(),
    },
  ],
};

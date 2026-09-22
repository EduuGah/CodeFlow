import type { Lesson } from '../types';

const FORMATAR = `function formatarMoeda(valor) {
  const centavos = Math.round(valor * 100);
  const reais = Math.floor(Math.abs(centavos) / 100);
  const resto = String(Math.abs(centavos) % 100).padStart(2, '0');
  const sinal = centavos < 0 ? '-' : '';
  return sinal + 'R$ ' + reais + ',' + resto;
}`;

export const lessonTestesCobertura: Lesson = {
  id: 'lesson-testes-6',
  trackId: 'track-testes',
  title: 'O Que Não Testar',
  language: 'javascript',
  objective:
    'Entender cobertura de código como uma pista (o que nunca rodou) e não como uma meta (100% não significa correto), e escolher os casos que realmente valem a pena testar.',
  concepts: ['testes-cobertura'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Ferramentas de teste sabem dizer qual porcentagem do código foi **executada** pelos testes — a "cobertura". É uma métrica útil, e uma das mais mal-entendidas da profissão.

## O que cobertura mede — e o que não mede

Cobertura de 100% quer dizer: **toda linha do código rodou** durante os testes. Não quer dizer que os testes **verificaram** o que aquela linha fazia.

~~~js
function dividir(a, b) {
  return a / b;
}

// Cobertura: 100%. A linha rodou.
dividir(10, 2);
~~~

Essa chamada dá 100% de cobertura — a única linha da função executou — e não afirma **nada** sobre o resultado. Um teste sem \`assert\` nenhum pode ter cobertura total e não provar coisa alguma. É a mesma armadilha da primeira aula: cobertura mede execução, não verificação.

## Cobertura é pista, não meta

Uma cobertura baixa **aponta** onde não há teste nenhum — é uma pista honesta de onde a rede de segurança tem buracos. Perseguir 100% como objetivo, porém, empurra para testar o que não vale a pena:

~~~js
function getNome() {
  return this.nome;
}
~~~

Um getter de uma linha, sem lógica nenhuma, "cobre" fácil com um teste — e esse teste não vai pegar bug nenhum, porque não há onde um bug se esconder ali. O tempo gasto nele é tempo que não foi para um caso de verdade.

## Onde testar vale a pena

O critério não é "toda linha", é **onde a lógica decide algo**:

- **Condições** (\`if\`, \`? :\`, \`&&\`, \`||\`) — cada ramo é um comportamento diferente.
- **Limites** (a aula 3 já mostrou: \`< \` vira \`<=\` por engano).
- **Casos extremos** (lista vazia, número negativo, texto vazio).
- **Regras do negócio** (o desconto, o status, a validação) — o que faz o programa **este** programa, e não outro qualquer.

E onde testar vale **menos**:

- Código que só chama outra função já testada, sem lógica própria.
- Getters e setters simples.
- Código de terceiros (a biblioteca já tem os testes dela).

## Testar demais também é um problema

Um teste que verifica **como** uma função faz algo, em vez de **o quê** ela faz, quebra a cada refatoração — mesmo quando o comportamento continua certo:

~~~js
// Testa o "como": quebra se alguém trocar reduce por um for
assert(implementacaoUsaReduce(somarLista.toString()), 'usa reduce internamente');

// Testa o "o quê": continua valendo não importa como foi escrito por dentro
assert(somarLista([1, 2, 3]) === 6, 'soma os itens da lista');
~~~

Testar a implementação em vez do comportamento é o assunto da aula 7 — aqui fica o aviso: cobertura alta com testes do tipo errado não protege contra nada, só atrapalha quem for melhorar o código depois.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `function calcularFrete(peso, distancia) {
  if (peso <= 0 || distancia <= 0) throw new Error('peso e distância precisam ser positivos');
  const base = 10;
  const porKm = distancia > 500 ? 0.05 : 0.08; // regra do negócio: frete longo tem km mais barato
  return Math.round((base + peso * 0.5 + distancia * porKm) * 100) / 100;
}

// Vale testar: a condição do negócio (o limite de 500 km).
assert(calcularFrete(1, 400) === Math.round((10 + 0.5 + 400 * 0.08) * 100) / 100, 'distância curta usa a tarifa cheia');
assert(calcularFrete(1, 600) === Math.round((10 + 0.5 + 600 * 0.05) * 100) / 100, 'distância longa usa a tarifa reduzida');

// Vale testar: o caso extremo que lança erro.
try {
  calcularFrete(-1, 100);
  assert(false, 'deveria ter lançado um erro para peso negativo');
} catch (erro) {
  assert(erro.message.includes('positivos'), 'a mensagem explica o problema');
}`,
      caption:
        'Os dois testes que importam: a condição que muda o comportamento (o limite de 500 km) e o caso extremo que a função rejeita. Nenhum dos dois testa "como" a conta é feita por dentro.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-6-nao-mede',
        type: 'predict-output',
        prompt:
          'Este "teste" não tem nenhum `assert`. Ele passa (não lança erro), e a linha da função roda inteira — 100% de cobertura. O que ele de fato prova sobre o resultado?',
        concepts: ['testes-cobertura'],
        difficulty: 'iniciante',
        tags: ['testes', 'cobertura'],
        code: `function dividir(a, b) {
  return a / b;
}

dividir(10, 0); // roda, cobertura 100% — mas nada foi verificado
console.log('nada provado sobre o resultado');`,
        expectedOutput: 'nada provado sobre o resultado',
        explanation:
          'A linha `return a / b` executou — cobertura 100% —, mas ninguém verificou o que ela devolveu. `dividir(10, 0)` é `Infinity` em JavaScript, e um teste sem `assert` não perceberia se isso fosse um defeito ou o esperado. Cobertura mede execução; só o `assert` mede verificação.',
        hints: ['Existe algum `assert` neste código? O que a cobertura de 100% garante sem ele?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-6-vale-a-pena',
        type: 'multiple-choice',
        prompt: 'Qual destes trechos MAIS vale a pena testar?',
        concepts: ['testes-cobertura'],
        difficulty: 'iniciante',
        tags: ['testes', 'cobertura'],
        options: [
          '`const desconto = compras > 5 ? 0.15 : compras > 2 ? 0.1 : 0;` — uma regra de negócio com duas condições e três resultados',
          '`function getNome() { return this.nome; }` — um getter que só devolve um campo',
          '`export { calcularTotal, formatarMoeda };` — uma linha de exportação',
          '`const PI = 3.14159;` — a declaração de uma constante',
        ],
        correctIndex: 0,
        explanation:
          'É onde há decisão — três resultados possíveis dependendo de uma condição — que um bug se esconde: uma troca de `>` por `>=`, ou dos dois `else` invertidos. As outras três opções não têm lógica nenhuma para testar: não há onde um comportamento errado aconteceria.',
        hints: ['Em qual desses trechos existe uma decisão que poderia estar errada?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-6-testar-limites',
        type: 'write-test',
        prompt:
          '`formatarMoeda(valor)` abaixo está **correta**: formata um número como `"R$ 12,50"`, cuidando do sinal negativo e do zero à esquerda nos centavos. Escreva testes para os casos que realmente decidem algo: um valor comum, um negativo, e um com centavos de um dígito só (que precisam do zero à esquerda).',
        concepts: ['testes-cobertura'],
        difficulty: 'intermediario',
        tags: ['testes', 'cobertura', 'assert'],
        subject: FORMATAR,
        initialCode: `// Teste os casos que decidem algo: negativo, e centavos com um dígito só.

`,
        mutants: [
          {
            description: 'não trata o sinal negativo',
            code: `function formatarMoeda(valor) {
  const centavos = Math.round(valor * 100);
  const reais = Math.floor(centavos / 100);
  const resto = String(centavos % 100).padStart(2, '0');
  return 'R$ ' + reais + ',' + resto;
}`,
          },
          {
            description: 'não coloca o zero à esquerda nos centavos',
            code: `function formatarMoeda(valor) {
  const centavos = Math.round(valor * 100);
  const reais = Math.floor(Math.abs(centavos) / 100);
  const resto = String(Math.abs(centavos) % 100);
  const sinal = centavos < 0 ? '-' : '';
  return sinal + 'R$ ' + reais + ',' + resto;
}`,
          },
        ],
        hints: [
          'Um valor comum primeiro: `formatarMoeda(12.5)` deveria ser `"R$ 12,50"`.',
          'Um negativo: `formatarMoeda(-12.5)` deveria trazer o sinal antes do "R$".',
          'Um valor com centavos de um dígito só, como `12.05`, testa o zero à esquerda: `"R$ 12,05"`, não `"R$ 12,5"`.',
        ],
        solution: `assert(formatarMoeda(12.5) === 'R$ 12,50', 'valor comum');
assert(formatarMoeda(-12.5) === '-R$ 12,50', 'valor negativo traz o sinal');
assert(formatarMoeda(12.05) === 'R$ 12,05', 'centavos de um digito ganham zero a esquerda');`,
        explanation:
          'O segundo teste pega a sabotagem que ignora o sinal — sem o negativo testado, `-12.5` sairia como `"R$ 12,50"`, sem o menos, e ninguém perceberia. O terceiro pega a que esquece o `padStart`: `12.05` sairia como `"R$ 12,5"`, um valor diferente do que parece.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-6-como-vs-o-que',
        type: 'multiple-choice',
        prompt:
          'Uma função que soma uma lista foi reescrita: trocaram um `for` por `.reduce()`, mas o resultado continua idêntico para qualquer entrada. Qual destes testes quebra com a reescrita, mesmo sem nenhum bug?',
        concepts: ['testes-cobertura'],
        difficulty: 'intermediario',
        tags: ['testes', 'cobertura', 'implementacao'],
        options: [
          'Um teste que inspeciona o código-fonte da função (via `toString()`) procurando a palavra "reduce"',
          'assert(somarLista([1, 2, 3]) === 6, \'soma os itens\')',
          "assert(somarLista([]) === 0, 'lista vazia soma zero')",
          'assert(somarLista([5]) === 5, \'um item só soma ele mesmo\')',
        ],
        correctIndex: 0,
        explanation:
          'Testar "como" a função foi escrita por dentro (procurando `reduce` no código-fonte) prende o teste a um detalhe de implementação que não afeta o resultado — ele quebra na troca de `for` por `reduce` mesmo que a soma continue certa. Os outros três testam "o quê" a função devolve, e continuam válidos não importa como ela é escrita por dentro.',
        hints: ['Qual destes testes olha para dentro da função, em vez de olhar só para o que ela devolve?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-6-cobertura-enganosa',
        type: 'multiple-choice',
        prompt:
          'Este "teste" dá 100% de cobertura de `aplicarDesconto` — toda linha dela roda — e passaria mesmo com o desconto calculado errado. O que falta?\n\n```javascript\nfunction aplicarDesconto(preco, percentual) {\n  return preco - preco * (percentual / 100);\n}\n\nconst resultado = aplicarDesconto(100, 20);\nconsole.log(\'rodou sem lançar erro\');\n```',
        concepts: ['testes-cobertura'],
        difficulty: 'intermediario',
        tags: ['testes', 'cobertura'],
        options: [
          'Um `assert` que confira se `resultado` vale 80 — sem ele, nada verifica o valor devolvido',
          'Nada — cobertura de 100% já garante que a função está correta',
          'Um `console.log` a mais, mostrando o valor de `resultado`',
          'Trocar `preco` por `precoOriginal` para ficar mais claro',
        ],
        correctIndex: 0,
        explanation:
          'A função inteira executa (cobertura 100%), mas nada confere se `resultado` vale 80. Uma versão com bug — por exemplo, `preco - percentual` em vez do cálculo do percentual — passaria por este "teste" do mesmo jeito, porque não há `assert` nenhum. Cobertura alta não substitui uma verificação de resultado; `console.log` mostra o valor, mas não afirma que ele está certo — só um `assert` faz isso.',
        hints: ['O código roda até o fim sem erro — mas isso prova alguma coisa sobre o valor de `resultado`?'],
      },
    },
    {
      kind: 'summary',
      markdown: `
**Cobertura mede execução, não verificação**: uma linha "coberta" pode não ter sido conferida por nenhum \`assert\`. **Cobertura é pista** de onde não há teste nenhum — não é meta a perseguir até 100%.

Vale testar onde há **decisão**: condições, limites, casos extremos, regras do negócio. Vale menos testar código sem lógica própria — getters, exportações, constantes.

Na próxima aula, o oposto de testar de menos: testes que quebram sem o comportamento ter mudado — os testes frágeis.
`.trim(),
    },
  ],
};

import type { Lesson } from '../types';

const CLASSIFICAR = `function classificarIdade(idade) {
  if (idade < 0) throw new Error('idade não pode ser negativa');
  if (idade < 12) return 'criança';
  if (idade < 18) return 'adolescente';
  return 'adulto';
}`;

export const lessonTestesUmComportamento: Lesson = {
  id: 'lesson-testes-3',
  trackId: 'track-testes',
  title: 'Um Teste por Comportamento',
  language: 'javascript',
  objective:
    'Dividir uma função com várias regras em um teste por regra, e escrever nomes de teste que funcionam como documentação de quem lê sem abrir o código.',
  concepts: ['testes-comportamento'],
  status: 'published',
  estimatedMinutes: 25,
  blocks: [
    {
      kind: 'prose',
      markdown: `
\`classificarIdade\` tem quatro comportamentos: rejeita idade negativa, classifica criança, adolescente e adulto. Um teste que tenta verificar os quatro de uma vez é difícil de escrever e pior de consertar.

## Um comportamento, um teste

~~~js
// Quatro testes — um por regra da função.
assert(classificarIdade(5) === 'criança', 'menor de 12 é criança');
assert(classificarIdade(15) === 'adolescente', 'entre 12 e 17 é adolescente');
assert(classificarIdade(30) === 'adulto', '18 ou mais é adulto');
~~~

Cada \`assert\` prova uma regra. Se a regra do adolescente quebrar amanhã, a segunda linha falha — e só ela. As outras três continuam passando, dizendo "o resto continua certo". Um teste gigante que tentasse tudo numa afirmação só apontaria "algo quebrou", sem dizer o quê.

## Os limites são o teste que importa

\`idade < 12\` e \`idade < 18\` têm uma fronteira exata: \`11\` é criança, \`12\` já é adolescente. É ali que os erros de "um a mais ou um a menos" (\`<\` no lugar de \`<=\`) se escondem — e é ali que um teste vale mais:

~~~js
assert(classificarIdade(11) === 'criança', '11 ainda é criança');
assert(classificarIdade(12) === 'adolescente', '12 já é adolescente');
~~~

Testar só \`5\` e \`30\` (bem no meio de cada faixa) não pegaria uma troca de \`<\` por \`<=\`. Testar o limite exato, sim.

## Nomes que documentam

A mensagem do \`assert\` não é decoração — é o que alguém lê quando o teste falha, e o que alguém lê para entender a regra sem abrir o código da função:

~~~js
// Ruim: repete o código, não explica a regra
assert(classificarIdade(15) === 'adolescente', 'classificarIdade(15) === adolescente');

// Bom: nomeia a regra do negócio
assert(classificarIdade(15) === 'adolescente', 'entre 12 e 17 anos é considerado adolescente');
~~~

Um bom nome de teste responde "o que esta regra faz", não "o que esta linha de código faz". É a mesma lição de nomes da trilha de engenharia, aplicada às mensagens dos testes: quem lê a suíte de testes de uma função deveria conseguir reconstruir as regras dela sem olhar a implementação.

## O sinal de que é hora de dividir

Se a mensagem do seu teste tem "e" no meio ("verifica que a função funciona e não lança erro e devolve o tipo certo"), são três testes, não um — a mesma regra da trilha de engenharia sobre nomes de função vale para nomes de teste.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `function statusDoPedido(pedido) {
  if (pedido.cancelado) return 'cancelado';
  if (pedido.entregue) return 'entregue';
  if (pedido.enviado) return 'enviado';
  return 'pendente';
}

// Um teste por comportamento, cada mensagem nomeando a regra.
assert(statusDoPedido({ cancelado: true }) === 'cancelado', 'pedido cancelado tem prioridade sobre qualquer outro estado');
assert(statusDoPedido({ entregue: true }) === 'entregue', 'pedido entregue e não cancelado mostra entregue');
assert(statusDoPedido({ enviado: true }) === 'enviado', 'pedido enviado, ainda não entregue, mostra enviado');
assert(statusDoPedido({}) === 'pendente', 'pedido sem nenhuma flag é pendente');`,
      caption:
        'Quatro regras, quatro testes. Cada mensagem explica a regra do negócio, não repete a condição do código — quem lê os quatro asserts entende a prioridade sem abrir a função.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-3-um-de-cada',
        type: 'multiple-choice',
        prompt:
          'Uma função tem três regras. Qual destas é a MELHOR forma de testá-las?',
        concepts: ['testes-comportamento'],
        difficulty: 'iniciante',
        tags: ['testes', 'comportamento'],
        options: [
          'Três testes separados, um por regra, cada um com uma mensagem que nomeia a regra',
          'Um teste só, com os três casos dentro de um `&&`',
          'Um teste que chama a função três vezes e só verifica a última chamada',
          'Não testar as três: testar só a mais usada é suficiente',
        ],
        correctIndex: 0,
        explanation:
          'Separar por regra é o que faz a falha apontar direto para qual regra quebrou. As outras opções escondem informação: `&&` não diz qual dos três falhou, testar só a última chamada ignora as duas primeiras, e testar "só a mais usada" deixa as outras sem rede de segurança nenhuma.',
        hints: ['Pense no dia em que uma das três regras quebrar. Qual opção te diz exatamente qual foi?'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-3-nome-ruim',
        type: 'find-bug',
        prompt:
          'Este teste quebra ao rodar — e, quando quebra, a mensagem não ajuda ninguém a entender a regra que falhou. Aponte a linha que precisa mudar.',
        concepts: ['testes-comportamento'],
        difficulty: 'intermediario',
        tags: ['testes', 'nomes', 'bug'],
        code: `function podeAlugar(idade, temCarteira) {
  return idade > 18 && temCarteira;
}

const resultado = podeAlugar(18, true);
if (resultado !== true) throw new Error('resultado !== true');
console.log('passou');`,
        buggyLine: 2,
        fix: `  return idade >= 18 && temCarteira;`,
        symptomLine: 6,
        symptomFeedback:
          'É aqui que o erro aparece — e repare que a mensagem, "resultado !== true", não diz qual regra falhou. Mas a linha em si está certa: o problema é que `podeAlugar` recusa quem faz 18 anos hoje. Veja como a idade é comparada.',
        explanation:
          'A regra é "maior de idade **ou igual** a 18"; a função usa `>`, que exclui quem tem exatamente 18. Com `idade > 18`, `podeAlugar(18, true)` devolve `false`, e o teste (que espera `true`) lança. Note que, mesmo corrigido o bug, a mensagem `"resultado !== true"` continuaria sem valor — ela repete a comparação, não nomeia a regra ("maior de idade com carteira pode alugar"). Os dois problemas — o `>` e a mensagem muda — costumam andar juntos: quem não nomeia a regra no teste também tem mais dificuldade de notar que a implementou errado.',
        hints: [
          'A mensagem de erro não ajuda a entender o que se esperava — mas o defeito de verdade está em outra linha.',
          'Alguém com exatamente 18 anos já é maior de idade. O que a comparação `>` faz com esse caso?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-3-limites',
        type: 'write-test',
        prompt:
          '`classificarIdade(idade)` abaixo está **correta**. Escreva testes para as três faixas e, principalmente, para os **limites exatos** entre elas (11/12 e 17/18) — é onde um erro de `<` por `<=` se esconde.',
        concepts: ['testes-comportamento'],
        difficulty: 'intermediario',
        tags: ['testes', 'limites', 'assert'],
        subject: CLASSIFICAR,
        initialCode: `// Um teste por regra — e teste os limites exatos entre as faixas.

`,
        mutants: [
          {
            description: 'usa <= em vez de < no limite de criança (12 ainda seria criança)',
            code: `function classificarIdade(idade) {
  if (idade < 0) throw new Error('idade não pode ser negativa');
  if (idade <= 12) return 'criança';
  if (idade < 18) return 'adolescente';
  return 'adulto';
}`,
          },
          {
            description: 'usa <= em vez de < no limite de adolescente (18 ainda seria adolescente)',
            code: `function classificarIdade(idade) {
  if (idade < 0) throw new Error('idade não pode ser negativa');
  if (idade < 12) return 'criança';
  if (idade <= 18) return 'adolescente';
  return 'adulto';
}`,
          },
          {
            description: 'inverte adolescente e adulto',
            code: `function classificarIdade(idade) {
  if (idade < 0) throw new Error('idade não pode ser negativa');
  if (idade < 12) return 'criança';
  if (idade < 18) return 'adulto';
  return 'adolescente';
}`,
          },
        ],
        hints: [
          'Teste um valor bem no meio de cada faixa primeiro: 5, 15, 30.',
          'Depois teste os limites exatos: 11 e 12; 17 e 18. É isso que separa `<` de `<=`.',
          "assert(classificarIdade(11) === 'criança', '11 ainda é criança'); assert(classificarIdade(12) === 'adolescente', '12 já é adolescente'); assert(classificarIdade(17) === 'adolescente', '17 ainda é adolescente'); assert(classificarIdade(18) === 'adulto', '18 já é adulto');",
        ],
        solution: `assert(classificarIdade(11) === 'criança', '11 ainda e crianca');
assert(classificarIdade(12) === 'adolescente', '12 ja e adolescente');
assert(classificarIdade(17) === 'adolescente', '17 ainda e adolescente');
assert(classificarIdade(18) === 'adulto', '18 ja e adulto');`,
        explanation:
          'Os quatro testes nos limites exatos pegam as três sabotagens: a que troca `<` por `<=` no 12 é pega por `classificarIdade(12)`; a que troca no 18, por `classificarIdade(18)`; e a que inverte adolescente com adulto é pega por qualquer um dos dois últimos. Testar só o meio de cada faixa (5, 15, 30) não pegaria nenhuma das duas trocas de operador.',
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-3-sinal-de-dividir',
        type: 'multiple-choice',
        prompt:
          'Qual destas mensagens de teste é sinal de que deveria virar dois testes, não um?',
        concepts: ['testes-comportamento'],
        difficulty: 'iniciante',
        tags: ['testes', 'nomes'],
        options: [
          '"calcula o desconto certo e não deixa o total ficar negativo"',
          '"aplica 10% de desconto sobre o preço"',
          '"idade negativa lança erro"',
          '"lista vazia devolve zero"',
        ],
        correctIndex: 0,
        explanation:
          'O "e" no meio junta duas regras diferentes — calcular o desconto certo é uma regra; não deixar o total negativo é outra, provavelmente um caso extremo separado. Se qualquer uma das duas quebrar, a mesma mensagem aparece, e quem lê a falha não sabe qual das duas foi. As outras três descrevem uma regra só, cada uma.',
        hints: ['Procure a conjunção "e" ligando duas afirmações diferentes dentro da mesma mensagem.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-testes-3-qual-quebrou',
        type: 'predict-output',
        prompt:
          'As quatro linhas abaixo testam `classificarIdade` (a mesma da aula, mas com um bug: alguém trocou `idade < 18` por `idade < 17`). O que cada `console.log` imprime?',
        concepts: ['testes-comportamento'],
        difficulty: 'intermediario',
        tags: ['testes', 'limites'],
        code: `function classificarIdade(idade) {
  if (idade < 0) throw new Error('idade não pode ser negativa');
  if (idade < 12) return 'criança';
  if (idade < 17) return 'adolescente';   // deveria ser 18
  return 'adulto';
}

console.log(classificarIdade(11) === 'criança');
console.log(classificarIdade(15) === 'adolescente');
console.log(classificarIdade(17) === 'adolescente');
console.log(classificarIdade(30) === 'adulto');`,
        expectedOutput: 'true\ntrue\nfalse\ntrue',
        explanation:
          'Só o teste do limite (17) percebe o bug: com `idade < 17`, `classificarIdade(17)` já cai em "adulto", não "adolescente". Os testes de 11, 15 e 30 — todos no meio de uma faixa — continuam passando normalmente, porque a troca de `18` por `17` só muda o resultado bem no limite. É exatamente por isso que testar os limites exatos vale mais do que testar o meio de cada faixa.',
        hints: [
          'Só um destes quatro números está na faixa que mudou de dono.',
          '17 deveria ser "adolescente" pela regra original — o que a versão com bug devolve para 17?',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `
**Um teste por comportamento**: quando a mensagem de um teste teria "e" no meio, são dois testes. Cada falha aponta direto para a regra que quebrou.

**Os limites importam mais que o meio**: é onde \`<\` vira \`<=\` por engano, e onde um teste no meio da faixa não percebe nada.

**O nome do teste é documentação**: a mensagem nomeia a regra do negócio, não repete a expressão do código.

Na próxima aula, o que fazer quando uma função depende de outra coisa — o banco, o relógio, uma API — para poder testá-la isoladamente: os dublês.
`.trim(),
    },
  ],
};

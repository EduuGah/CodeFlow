import type { Lesson } from '../types';

export const lessonCondicoes: Lesson = {
  id: 'lesson-js-3',
  trackId: 'track-js-fundamentos',
  title: 'Condições: Escolhendo Caminhos',
  language: 'javascript',
  objective:
    'Fazer o programa tomar decisões conforme os dados que recebe, na ordem certa e sem armadilhas de comparação.',
  concepts: ['condicoes', 'operadores'],
  status: 'published',
  estimatedMinutes: 20,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Até agora seu código executava sempre na mesma ordem, de cima para baixo. Uma **condição** quebra isso: ela pergunta algo e escolhe um caminho conforme a resposta.

~~~javascript
const idade = 20;

if (idade >= 18) {
  console.log('pode entrar');
} else {
  console.log('não pode entrar');
}
~~~

A pergunta dentro do \`if\` precisa resultar em \`true\` ou \`false\`. Para formulá-la, usamos operadores de comparação:

| Operador | Pergunta |
| --- | --- |
| \`>\` \`<\` | maior / menor que |
| \`>=\` \`<=\` | maior / menor ou igual |
| \`===\` | é exatamente igual? |
| \`!==\` | é diferente? |

**Use sempre \`===\`, nunca \`=\`.** Um sinal só **atribui** um valor; três **comparam**. Trocar os dois é dos erros mais comuns de quem está começando, e o resultado é traiçoeiro:

~~~javascript
let status = 'inativo';

if (status = 'ativo') {      // ATRIBUIU em vez de comparar
  console.log('entrou');     // e isto sempre roda
}
~~~

O código acima muda o valor de \`status\` e depois avalia \`'ativo'\`, que não é vazio e por isso conta como verdadeiro. A condição passa **sempre**, independentemente do valor original.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Encadear: else if testa só quando o anterior falhou
const nota = 7;

if (nota >= 9) {
  console.log('excelente');
} else if (nota >= 7) {
  console.log('aprovado');       // <- para aqui
} else if (nota >= 5) {
  console.log('recuperação');    // nunca chega, mesmo sendo verdadeiro
} else {
  console.log('reprovado');
}

// Combinar perguntas
const temIngresso = true;
const idade = 20;

if (idade >= 18 && temIngresso) console.log('entra');   // E: os dois
if (idade < 12 || idade > 65) console.log('meia');      // OU: pelo menos um
if (!temIngresso) console.log('compre um');             // NÃO: inverte`,
      caption:
        'O JavaScript testa de cima para baixo e **para na primeira condição verdadeira**. Com nota 7, tanto `>= 7` quanto `>= 5` são verdadeiras — mas só a primeira roda.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-3-ordem',
        type: 'predict-output',
        prompt: 'A ordem das condições foi invertida. O que este código imprime?',
        concepts: ['condicoes'],
        difficulty: 'iniciante',
        tags: ['javascript', 'condicoes'],
        code: `const nota = 9;

if (nota >= 5) {
  console.log('Recuperação');
} else if (nota >= 7) {
  console.log('Aprovado');
} else if (nota >= 9) {
  console.log('Excelente');
}`,
        expectedOutput: 'Recuperação',
        explanation:
          'Nota 9 satisfaz as três condições, mas o JavaScript para na primeira verdadeira — e a primeira é a mais **ampla**. Por isso encadeamentos vão da faixa mais restritiva para a mais ampla: invertida, a ordem torna as condições seguintes inalcançáveis.',
        hints: [
          'Nota 9 é maior ou igual a 5? E o que acontece depois que uma condição passa?',
          'As condições seguintes são testadas, ou puladas?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-3-lacuna-ordem',
        type: 'fill-blank',
        prompt:
          'Complete os dois limites para a classificação funcionar. Lembre que a checagem vai da faixa mais restritiva para a mais ampla.',
        concepts: ['condicoes'],
        difficulty: 'iniciante',
        tags: ['javascript', 'condicoes'],
        template: `function faixa(nota) {
  if (nota >= {{1}}) return 'excelente';
  if (nota >= {{2}}) return 'aprovado';
  return 'reprovado';
}`,
        blanks: [
          { placeholder: 'maior', size: 3 },
          { placeholder: 'menor', size: 3 },
        ],
        tests: [
          {
            description: 'nota 9 é excelente',
            assertion: `if (faixa(9) !== 'excelente') throw new Error("faixa(9) deveria ser 'excelente', veio '" + faixa(9) + "'.");`,
          },
          {
            description: 'nota 7 é aprovado',
            assertion: `if (faixa(7) !== 'aprovado') throw new Error("faixa(7) deveria ser 'aprovado', veio '" + faixa(7) + "'.");`,
          },
          {
            description: 'nota 4 é reprovado',
            assertion: `if (faixa(4) !== 'reprovado') throw new Error("faixa(4) deveria ser 'reprovado', veio '" + faixa(4) + "'.");`,
          },
          {
            description: 'a nota 8.9 ainda é aprovado, não excelente',
            assertion: `if (faixa(8.9) !== 'aprovado') throw new Error("faixa(8.9) deveria ser 'aprovado', veio '" + faixa(8.9) + "'. Confira o limite do excelente.");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'cada nota cai na faixa correta',
            generate: `return { nota: Math.round(rnd() * 100) / 10 };`,
            check: `
              const esperado = caso.nota >= 9 ? 'excelente' : caso.nota >= 7 ? 'aprovado' : 'reprovado';
              const obtido = faixa(caso.nota);
              if (obtido !== esperado) {
                throw new Error("nota " + caso.nota + " deveria ser '" + esperado + "', veio '" + obtido + "'.");
              }
            `,
          },
        ],
        explanation:
          'Com a checagem partindo da faixa mais alta, quem tem 9 nunca chega na linha do 7. Se a ordem fosse invertida, a segunda condição seria inalcançável — o código rodaria sem erro e daria a resposta errada.',
        hints: [
          'A primeira condição é a mais restritiva: qual nota separa excelente de aprovado?',
          'Excelente começa em 9, aprovado em 7.',
        ],
        solution: ['9', '7'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Valores que já valem como verdadeiro ou falso

Nem toda condição precisa de comparação. Qualquer valor colocado num \`if\` é avaliado como verdadeiro ou falso.

São **falsos** apenas seis valores: \`false\`, \`0\`, \`''\` (texto vazio), \`null\`, \`undefined\` e \`NaN\`. Todo o resto é verdadeiro — inclusive \`'0'\`, \`'false'\`, \`[]\` e \`{}\`.

~~~javascript
if (nome) { ... }        // roda se nome não for vazio nem undefined
if (!lista.length) { ... }   // roda se a lista estiver vazia
~~~

Isso é prático, mas tem uma armadilha séria com o número zero:

~~~javascript
function aplicarDesconto(valor, desconto) {
  if (!desconto) return valor;    // "sem desconto"
  return valor - desconto;
}

aplicarDesconto(100, 0);   // 100, correto por acaso
aplicarDesconto(100);      // 100, correto
~~~

Aqui funciona. Mas troque por uma quantidade:

~~~javascript
if (!quantidade) return 'informe a quantidade';
~~~

Uma quantidade **zero** — legítima, o usuário digitou 0 — cai no mesmo caminho de "não informou". Quando o zero é um valor válido, teste o que você realmente quer saber: \`quantidade === undefined\`.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-3-prever-zero',
        type: 'predict-output',
        prompt: 'O que este programa imprime? Preste atenção nos valores que são avaliados como falsos.',
        concepts: ['condicoes', 'casos-extremos'],
        difficulty: 'intermediario',
        tags: ['javascript', 'condicoes'],
        code: `const valores = [0, '', 'abc', [], null];

for (const v of valores) {
  if (v) console.log('verdadeiro:', JSON.stringify(v));
}`,
        expectedOutput: 'verdadeiro: "abc"\nverdadeiro: []',
        explanation:
          '`0`, `\'\'` e `null` são falsos. Já `[]` é uma lista **vazia**, mas continua sendo um objeto — e todo objeto é verdadeiro. Para saber se uma lista tem itens, teste `lista.length`, não a lista em si.',
        hints: [
          'São seis os valores falsos. Quais desta lista estão entre eles?',
          'Uma lista vazia é falsa, ou é um objeto que por acaso não tem itens?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-3-classificar',
        type: 'code',
        prompt:
          'Crie a função `classificar(idade)` que **retorna** um texto:\n\n- menor que 12 → `"criança"`\n- de 12 a 17 → `"adolescente"`\n- 18 ou mais → `"adulto"`\n\nSe `idade` não for um número, ou for negativa, retorne `"idade inválida"`.',
        concepts: ['condicoes'],
        difficulty: 'iniciante',
        tags: ['javascript', 'condicoes'],
        initialCode: `function classificar(idade) {
  // Cheque o caso inválido primeiro, depois as faixas.
}

console.log(classificar(15));   // adolescente
console.log(classificar(-1));   // idade inválida`,
        hints: [
          'Comece recusando o que não serve: assim as faixas seguintes só recebem números válidos.',
          'Para checar o tipo: `typeof idade !== "number"`.',
          'Depois, encadeie as faixas da mais restritiva para a mais ampla.',
          'Como cada caminho tem `return`, você nem precisa de `else`.',
        ],
        tests: [
          {
            description: 'A função classificar existe',
            assertion: `if (typeof classificar !== 'function') throw new Error("Crie uma função chamada 'classificar'.");`,
          },
          {
            description: 'idade 8 é criança',
            assertion: `if (classificar(8) !== 'criança') throw new Error("classificar(8) deveria devolver 'criança', veio '" + classificar(8) + "'.");`,
          },
          {
            description: 'idade 15 é adolescente',
            assertion: `if (classificar(15) !== 'adolescente') throw new Error("classificar(15) deveria devolver 'adolescente', veio '" + classificar(15) + "'.");`,
          },
          {
            description: 'idade 30 é adulto',
            assertion: `if (classificar(30) !== 'adulto') throw new Error("classificar(30) deveria devolver 'adulto', veio '" + classificar(30) + "'.");`,
          },
          {
            description: 'os limites exatos caem na faixa certa',
            assertion: `
              if (classificar(12) !== 'adolescente') throw new Error("Aos 12 já é adolescente, veio '" + classificar(12) + "'.");
              if (classificar(17) !== 'adolescente') throw new Error("Aos 17 ainda é adolescente, veio '" + classificar(17) + "'.");
              if (classificar(18) !== 'adulto') throw new Error("Aos 18 já é adulto, veio '" + classificar(18) + "'.");
            `,
            hidden: true,
          },
          {
            description: 'idade zero é criança, não inválida',
            assertion: `if (classificar(0) !== 'criança') throw new Error("Um recém-nascido tem 0 anos e é criança, veio '" + classificar(0) + "'. Cuidado: 0 é avaliado como falso.");`,
            hidden: true,
          },
          {
            description: 'entradas inválidas são recusadas',
            assertion: `
              for (const entrada of [-1, 'abc', null, undefined]) {
                const r = classificar(entrada);
                if (r !== 'idade inválida') throw new Error("classificar(" + JSON.stringify(entrada) + ") deveria devolver 'idade inválida', veio '" + r + "'.");
              }
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'toda idade válida cai na faixa correta',
            generate: `return { idade: Math.floor(rnd() * 100) };`,
            check: `
              const esperado = caso.idade < 12 ? 'criança' : caso.idade < 18 ? 'adolescente' : 'adulto';
              const obtido = classificar(caso.idade);
              if (obtido !== esperado) {
                throw new Error("idade " + caso.idade + " deveria ser '" + esperado + "', veio '" + obtido + "'.");
              }
            `,
          },
        ],
        solution: `function classificar(idade) {
  if (typeof idade !== 'number' || idade < 0) return 'idade inválida';
  if (idade < 12) return 'criança';
  if (idade < 18) return 'adolescente';
  return 'adulto';
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Condições escolhem caminhos, e o JavaScript **para na primeira verdadeira** — por isso encadeamentos vão da faixa mais restritiva para a mais ampla. Compare com \`===\`, nunca com \`=\`, que atribui e faz a condição passar sempre. Qualquer valor pode ir num \`if\`: só seis são falsos, e o zero entre eles é a armadilha — quando zero é uma resposta legítima, teste \`=== undefined\` em vez de \`!valor\`.`,
    },
  ],
};

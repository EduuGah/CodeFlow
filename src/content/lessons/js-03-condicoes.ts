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

## Ternário: um if/else que cabe numa expressão

Quando as duas únicas coisas que um \`if\`/\`else\` faz são **devolver** ou **atribuir** um valor, o operador ternário (\`condição ? seVerdadeiro : seFalso\`) diz a mesma coisa numa linha:

~~~javascript
// Com if/else — duas linhas para uma decisão simples
let status;
if (idade >= 18) {
  status = 'adulto';
} else {
  status = 'menor';
}

// Com ternário — a mesma decisão, numa expressão
const status2 = idade >= 18 ? 'adulto' : 'menor';
~~~

O nome vem de ter **três** partes: a condição, o valor se verdadeira, o valor se falsa — separadas por \`?\` e \`:\`. Dá para encadear, como um \`else if\`, mas fica difícil de ler passando de dois ou três:

~~~javascript
const faixa = nota >= 9 ? 'excelente' : nota >= 7 ? 'aprovado' : 'reprovado';
~~~

Use ternário para uma decisão curta que produz um valor; volte para \`if\`/\`else if\`/\`else\` quando o corpo de cada caminho faz mais de uma coisa, ou quando o encadeamento passaria de duas perguntas.

## switch: uma variável, muitos valores possíveis

Uma sequência de \`if\`/\`else if\` que compara a **mesma variável** contra vários valores tem uma forma alternativa, o \`switch\`:

~~~javascript
const dia = 3;
let nome;

switch (dia) {
  case 1:
    nome = 'segunda';
    break;
  case 2:
    nome = 'terça';
    break;
  case 3:
    nome = 'quarta';
    break;
  default:
    nome = 'dia inválido';
}

console.log(nome); // quarta
~~~

\`switch (dia)\` compara \`dia\` com \`===\` contra cada \`case\`, na ordem, até achar um igual; \`default\` roda se nenhum \`case\` bateu — é o \`else\` do \`switch\`, e não é obrigatório, mas evitar deixá-lo de fora é mais seguro.

**\`break\` é o detalhe que mais gera bug em quem começa com \`switch\`.** Sem ele, a execução **continua** para o próximo \`case\`, mesmo que a condição dele não tenha sido testada — chamado de "fall-through":

~~~javascript
switch (dia) {
  case 1:
    nome = 'segunda';
  case 2:                    // sem break acima, cai aqui também
    nome = 'terça';
    break;
  default:
    nome = 'dia inválido';
}
// com dia = 1, "nome" termina como 'terça', não 'segunda' — o break faltou no case 1
~~~

Fora casos raros e intencionais (vários \`case\` seguidos sem \`break\`, para tratar o mesmo jeito), todo \`case\` deveria terminar em \`break\` ou \`return\`. \`switch\` vale a pena quando há **três ou mais** valores para a mesma variável; para duas opções, um \`if\`/\`else\` simples já resolve mais curto.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-3-prever-zero',
        type: 'predict-output',
        prompt:
          'O que este programa imprime? Cada `if` testa um valor diferente — preste atenção nos que são avaliados como falsos.',
        concepts: ['condicoes', 'casos-extremos'],
        difficulty: 'intermediario',
        tags: ['javascript', 'condicoes'],
        code: `const zero = 0;
const vazio = '';
const texto = 'abc';
const lista = [];
const nada = null;

if (zero) console.log('zero passou');
if (vazio) console.log('texto vazio passou');
if (texto) console.log('abc passou');
if (lista) console.log('lista vazia passou');
if (nada) console.log('null passou');`,
        expectedOutput: 'abc passou\nlista vazia passou',
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
      kind: 'exercise',
      exercise: {
        id: 'ex-js-3-achar-atribuicao',
        type: 'find-bug',
        prompt:
          'Este programa tem um teste no fim, e ele está falhando: um visitante está sendo tratado como administrador.\n\nAponte a linha que precisa mudar.',
        concepts: ['condicoes', 'operadores'],
        difficulty: 'iniciante',
        tags: ['javascript', 'condicoes', 'depuracao'],
        code: `function ehAdministrador(usuario) {
  if (usuario.papel = "admin") {
    return true;
  }
  return false;
}

const visitante = { nome: "Ana", papel: "visitante" };
const resultado = ehAdministrador(visitante);

if (resultado !== false) throw new Error("um visitante foi tratado como administrador");`,
        buggyLine: 2,
        fix: '  if (usuario.papel === "admin") {',
        symptomLine: 11,
        symptomFeedback:
          'O teste só está contando o que aconteceu: `ehAdministrador` devolveu `true` para um visitante. A decisão de devolver `true` vem de dentro da função — releia a condição dela com atenção a cada caractere.',
        explanation:
          'Um `=` só. A linha não **compara** o papel com `"admin"`: ela **atribui** `"admin"` ao papel, e o resultado de uma atribuição é o valor atribuído — `"admin"`, que conta como verdadeiro. O `if` entra sempre, e de quebra o visitante saiu da função promovido.\n\nÉ um dos bugs mais silenciosos que existem, porque a linha parece uma comparação e o JavaScript aceita sem reclamar. Comparação é `===`, sempre com três; e se você ler um `=` sozinho dentro de um `if`, desconfie antes de qualquer outra coisa.',
        hints: [
          'A função devolve `true` para todo mundo. O que faz um `if` entrar sempre?',
          'Conte os sinais de igual na condição.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-3-ternario',
        type: 'predict-output',
        prompt: 'O que este programa imprime?',
        concepts: ['condicoes'],
        difficulty: 'iniciante',
        tags: ['javascript', 'ternario'],
        code: `const idades = [10, 18, 25];

for (const idade of idades) {
  const status = idade >= 18 ? 'adulto' : 'menor';
  console.log(idade, status);
}`,
        expectedOutput: '10 menor\n18 adulto\n25 adulto',
        explanation:
          'O ternário `idade >= 18 ? \'adulto\' : \'menor\'` é avaliado a cada volta: 10 é menor que 18 (menor), 18 já satisfaz `>=` (adulto), 25 também (adulto). É a mesma lógica de um `if`/`else` de duas linhas, só que como uma expressão que já produz o valor de `status`.',
        hints: ['Antes do `?` está a condição; entre `?` e `:` o valor se verdadeira; depois de `:` o valor se falsa.'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-3-switch-fall-through',
        type: 'predict-output',
        prompt:
          'Este `switch` deveria imprimir "dia de semana" para os dias 1 a 5, e "fim de semana" para 6 e 7. O que ele realmente imprime? Preste atenção no `case 5`.',
        concepts: ['condicoes'],
        difficulty: 'intermediario',
        tags: ['javascript', 'switch'],
        code: `const dia = 5;
let tipo;

switch (dia) {
  case 5:
    tipo = 'dia de semana';
  case 6:
    tipo = 'fim de semana';
    break;
  case 7:
    tipo = 'fim de semana';
    break;
  default:
    tipo = 'dia de semana';
}

console.log(tipo);`,
        expectedOutput: 'fim de semana',
        explanation:
          'O `case 5` não termina em `break` — a execução "cai" (fall-through) direto para o `case 6`, que sobrescreve `tipo` para `\'fim de semana\'`. Sem erro nenhum: o `switch` roda até o fim normalmente, só que com o valor errado. Faltou um `break` depois de `tipo = \'dia de semana\';` no `case 5`, para a execução parar ali em vez de continuar para o próximo caso.',
        hints: [
          'O que acontece quando um `case` não termina em `break`?',
          'Compare o `case 5` com os outros dois — o que ele tem a menos?',
        ],
      },
    },
    {
      kind: 'summary',
      markdown: `Condições escolhem caminhos, e o JavaScript **para na primeira verdadeira** — por isso encadeamentos vão da faixa mais restritiva para a mais ampla. Compare com \`===\`, nunca com \`=\`, que atribui e faz a condição passar sempre. Qualquer valor pode ir num \`if\`: só seis são falsos, e o zero entre eles é a armadilha — quando zero é uma resposta legítima, teste \`=== undefined\` em vez de \`!valor\`. O ternário (\`? :\`) resolve um if/else curto numa expressão só; o \`switch\` compara uma variável contra vários valores — e todo \`case\` precisa de \`break\`, ou a execução "cai" para o próximo.`,
    },
  ],
};

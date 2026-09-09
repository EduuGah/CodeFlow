import type { Lesson } from '../types';

export const lessonRegex: Lesson = {
  id: 'lesson-js-20',
  trackId: 'track-js-fundamentos',
  title: 'Expressões Regulares: Descrever um Formato',
  language: 'javascript',
  objective:
    'Escrever padrões para validar e extrair texto, e reconhecer quando uma expressão regular é a ferramenta errada.',
  concepts: ['strings', 'casos-extremos', 'depuracao'],
  status: 'published',
  estimatedMinutes: 22,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Uma expressão regular descreve **um formato**, não um texto exato. Em vez de "é igual a isto", ela diz "tem esta forma".

~~~javascript
const cep = /^\\d{5}-\\d{3}$/;

cep.test('01310-100');   // true
cep.test('01310100');    // false — falta o traço
~~~

Lendo em partes: \`^\` é o começo do texto, \`\\d\` é um dígito, \`{5}\` são cinco deles, \`-\` é o traço literal, e \`$\` é o fim. As âncoras \`^\` e \`$\` são o que separa "contém" de "é": sem elas, \`"meu cep é 01310-100 ok"\` também passaria.

O vocabulário que resolve a maioria dos casos:

| | |
| --- | --- |
| \`\\d\` \`\\w\` \`\\s\` | dígito, letra ou número, espaço |
| \`.\` | qualquer caractere |
| \`+\` \`*\` \`?\` | um ou mais, zero ou mais, opcional |
| \`{3}\` \`{2,5}\` | quantidade exata, ou faixa |
| \`[abc]\` \`[^abc]\` | um destes, nenhum destes |
| \`(...)\` | grupo, e captura o trecho |
| \`\\|\` | ou |

Os métodos: \`test\` devolve verdadeiro ou falso, \`match\` devolve o que casou, \`replace\` troca.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `// Validar
/^\\d{5}-\\d{3}$/.test('01310-100');       // true

// Extrair com grupos
const data = '2026-03-10';
const [, ano, mes, dia] = data.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
console.log(dia, mes, ano);   // 10 03 2026

// Trocar
'olá   mundo'.replace(/\\s+/g, ' ');       // 'olá mundo'
'R$ 1.234,56'.replace(/[^\\d,]/g, '');     // '1234,56'

// Pegar todas as ocorrências
'a1b22c333'.match(/\\d+/g);                // ['1', '22', '333']

// Guloso vs preguiçoso — a diferença é o ?
'<b>oi</b>'.match(/<.+>/)[0];             // '<b>oi</b>'  pega o máximo
'<b>oi</b>'.match(/<.+?>/)[0];            // '<b>'        para no primeiro`,
      caption:
        '`+` e `*` são gulosos: vão até o último casamento possível e voltam. O `?` depois deles inverte isso. Essa é a causa mais comum de "meu padrão pegou texto demais".',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-20-prever-guloso',
        type: 'predict-output',
        prompt: 'O que este programa imprime? Repare na diferença entre os dois padrões.',
        concepts: ['strings'],
        difficulty: 'intermediario',
        tags: ['javascript', 'regex'],
        code: `const texto = 'nome: Ana; idade: 30;';

console.log(texto.match(/:.+;/)[0]);
console.log(texto.match(/:.+?;/)[0]);`,
        expectedOutput: ': Ana; idade: 30;\n: Ana;',
        explanation:
          'O primeiro `.+` é guloso: vai até o **último** ponto e vírgula do texto. O segundo tem `?`, que o torna preguiçoso — para no primeiro que servir. Quando um padrão "pega demais", quase sempre é isso.',
        hints: [
          'O `.+` sozinho para no primeiro `;` que encontra, ou vai até o último?',
          'O `?` depois do `+` muda o comportamento para qual dos dois?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-20-lacuna-ancoras',
        type: 'fill-blank',
        prompt:
          'Este padrão aceita qualquer texto que **contenha** três dígitos. Complete para ele só aceitar textos que **sejam** exatamente três dígitos.',
        concepts: ['strings', 'casos-extremos'],
        difficulty: 'iniciante',
        tags: ['javascript', 'regex'],
        template: `function ehCodigo(texto) {
  return /{{1}}\\d{3}{{2}}/.test(texto);
}`,
        blanks: [
          { placeholder: 'começo', size: 3 },
          { placeholder: 'fim', size: 3 },
        ],
        tests: [
          {
            description: '"123" é aceito',
            assertion: `if (!ehCodigo('123')) throw new Error("'123' deveria ser aceito.");`,
          },
          {
            description: '"abc123def" é recusado',
            assertion: `if (ehCodigo('abc123def')) throw new Error("'abc123def' contém três dígitos, mas não É três dígitos. Faltam as âncoras.");`,
          },
          {
            description: '"1234" é recusado',
            assertion: `if (ehCodigo('1234')) throw new Error("'1234' tem quatro dígitos e foi aceito. A âncora do fim está faltando.");`,
            hidden: true,
          },
          {
            description: '"12" é recusado',
            assertion: `if (ehCodigo('12')) throw new Error("'12' tem dois dígitos e foi aceito.");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'aceita exatamente três dígitos, e nada além disso',
            generate: `
              const tamanho = Math.floor(rnd() * 6);
              let texto = '';
              for (let i = 0; i < tamanho; i++) texto += String(Math.floor(rnd() * 10));
              if (rnd() < 0.3) texto = 'x' + texto;
              return { texto };
            `,
            check: `
              const esperado = /^[0-9]{3}$/.test(caso.texto);
              const obtido = ehCodigo(caso.texto);
              if (obtido !== esperado) {
                throw new Error("para " + JSON.stringify(caso.texto) + " esperava " + esperado + ", veio " + obtido + ".");
              }
            `,
          },
        ],
        explanation:
          'Sem âncoras, `test` procura o padrão em qualquer posição do texto. `^` prende no começo e `$` no fim — juntos, transformam "contém" em "é". Esquecer disso é a falha de validação mais comum com expressões regulares.',
        hints: [
          'Um símbolo marca o começo do texto, outro marca o fim.',
          'São `^` e `$`. Qual vai em cada lacuna?',
        ],
        solution: ['^', '$'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## A armadilha do \`g\` com \`test\`

Uma expressão regular com a marca \`g\` **guarda onde parou**. Chamar \`test\` duas vezes na mesma expressão dá resultados diferentes:

~~~javascript
const padrao = /\\d+/g;

padrao.test('123');   // true
padrao.test('123');   // false  <- o mesmo texto!
~~~

Não é bug do JavaScript: o \`g\` existe para percorrer várias ocorrências, e para isso a expressão guarda um \`lastIndex\`. Depois do primeiro casamento ela continua a partir dali, não acha mais nada, e zera.

O sintoma em produção é cruel: a validação funciona no primeiro item de uma lista e falha no segundo, alternadamente.

**A regra:** não use \`g\` com \`test\`. Se precisar dos dois, crie a expressão dentro da função, ou zere o \`lastIndex\` antes de cada uso.

## Quando não usar

Expressão regular é ótima para formato e péssima para estrutura aninhada. **Não** tente validar HTML, JSON ou e-mail com uma. O padrão oficial de e-mail tem centenas de caracteres e ainda erra — para e-mail, verifique se há um \`@\` com texto dos dois lados e mande a confirmação por mensagem, que é o único teste que vale.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-20-extrair-telefones',
        type: 'code',
        prompt:
          'Crie `extrairTelefones(texto)`, que devolve todos os telefones encontrados, no formato `(11) 91234-5678`.\n\nO DDD tem 2 dígitos entre parênteses, depois um espaço, depois 4 ou 5 dígitos, um traço, e 4 dígitos. Devolve uma lista vazia quando não encontra nada.',
        concepts: ['strings', 'arrays'],
        difficulty: 'intermediario',
        tags: ['javascript', 'regex'],
        initialCode: `function extrairTelefones(texto) {
  // O metodo match com a marca g devolve todas as ocorrencias, ou null quando nao acha.
}

console.log(extrairTelefones('ligue (11) 91234-5678 ou (21) 3456-7890'));
// esperado: ['(11) 91234-5678', '(21) 3456-7890']`,
        hints: [
          'Parênteses têm significado especial no padrão. Para casar o caractere literal, escape com barra invertida.',
          'Para "4 ou 5 dígitos", use a faixa `{4,5}`.',
          '`match` com `g` devolve `null` quando não encontra nada — não uma lista vazia.',
        ],
        tests: [
          {
            description: 'A função extrairTelefones existe',
            assertion: `if (typeof extrairTelefones !== 'function') throw new Error("Crie uma função chamada 'extrairTelefones'.");`,
          },
          {
            description: 'encontra celular e fixo no mesmo texto',
            assertion: `
              const r = extrairTelefones('ligue (11) 91234-5678 ou (21) 3456-7890');
              if (JSON.stringify(r) !== JSON.stringify(['(11) 91234-5678', '(21) 3456-7890'])) {
                throw new Error("Esperava os dois telefones, veio " + JSON.stringify(r) + ".");
              }
            `,
          },
          {
            description: 'texto sem telefone devolve lista vazia',
            assertion: `
              const r = extrairTelefones('nenhum número aqui');
              if (!Array.isArray(r) || r.length !== 0) throw new Error("Esperava [], veio " + JSON.stringify(r) + ". Lembre que match devolve null quando não acha.");
            `,
          },
          {
            description: 'não aceita formato errado',
            assertion: `
              const r = extrairTelefones('11 91234-5678 e (11)912345678');
              if (r.length !== 0) throw new Error("Esses formatos não batem com o pedido, mas foram aceitos: " + JSON.stringify(r) + ".");
            `,
            hidden: true,
          },
          {
            description: 'chamar duas vezes dá o mesmo resultado',
            assertion: `
              const texto = 'ligue (11) 91234-5678';
              const a = extrairTelefones(texto);
              const b = extrairTelefones(texto);
              if (JSON.stringify(a) !== JSON.stringify(b)) {
                throw new Error("A segunda chamada deu outro resultado. Uma expressão com g criada fora da função guarda onde parou.");
              }
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'encontra exatamente os telefones bem formados do texto',
            generate: `
              const quantos = Math.floor(rnd() * 4);
              const telefones = [];
              for (let i = 0; i < quantos; i++) {
                const ddd = String(Math.floor(rnd() * 90) + 10);
                const tamanho = rnd() < 0.5 ? 4 : 5;
                let inicio = '';
                for (let j = 0; j < tamanho; j++) inicio += String(Math.floor(rnd() * 10));
                let fim = '';
                for (let j = 0; j < 4; j++) fim += String(Math.floor(rnd() * 10));
                telefones.push('(' + ddd + ') ' + inicio + '-' + fim);
              }
              return { telefones, ruido: rnd() < 0.5 ? 'contato: ' : '' };
            `,
            check: `
              const texto = caso.ruido + caso.telefones.join(' ou ');
              const obtido = extrairTelefones(texto);

              if (JSON.stringify(obtido) !== JSON.stringify(caso.telefones)) {
                throw new Error("em " + JSON.stringify(texto) + " esperava " + JSON.stringify(caso.telefones) + ", veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        solution: `function extrairTelefones(texto) {
  const padrao = /\\(\\d{2}\\) \\d{4,5}-\\d{4}/g;
  return texto.match(padrao) || [];
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Uma expressão regular descreve formato, não conteúdo exato. \`^\` e \`$\` são o que separa "contém" de "é", e esquecê-los é a falha de validação mais comum. \`+\` e \`*\` são gulosos até você acrescentar \`?\`. A marca \`g\` guarda onde parou, então \`test\` com \`g\` alterna entre verdadeiro e falso na mesma entrada — não misture os dois. E para estrutura aninhada, como HTML ou e-mail, a ferramenta certa é outra.`,
    },
  ],
};

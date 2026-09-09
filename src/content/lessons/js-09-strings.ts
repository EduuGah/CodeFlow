import type { Lesson } from '../types';

export const lessonStrings: Lesson = {
  id: 'lesson-js-9',
  trackId: 'track-js-fundamentos',
  title: 'Textos: Limpar, Validar e Formatar',
  language: 'javascript',
  objective:
    'Tratar o texto que chega de uma pessoa antes de confiar nele: limpar, recortar, validar e formatar.',
  concepts: ['strings', 'condicoes', 'funcoes'],
  status: 'published',
  estimatedMinutes: 26,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Todo dado digitado por uma pessoa chega sujo. Espaço sobrando no fim, porque o dedo escorregou na barra. Maiúscula onde não devia, porque o teclado do celular capitaliza sozinho. Um copiar-e-colar que trouxe junto um espaço invisível do site de origem.

Isso não é descuido do usuário — é o normal. E é por isso que quase todo bug de "não encontrei sua conta" acaba sendo um \`" ana@email.com"\` com um espaço na frente sendo comparado com \`"ana@email.com"\`.

Os métodos que resolvem a maior parte disso:

| Método | O que faz |
|---|---|
| \`.trim()\` | remove espaços do começo e do fim |
| \`.toLowerCase()\` | tudo em minúsculo |
| \`.includes(x)\` | contém esse trecho? |
| \`.startsWith(x)\` / \`.endsWith(x)\` | começa / termina com isso? |
| \`.split(x)\` | quebra em array por um separador |
| \`.length\` | quantidade de caracteres |

## A armadilha: texto não muda

Aqui está o detalhe que pega quase todo mundo uma vez. **Strings são imutáveis.** Nenhum método altera o texto original — todos devolvem um texto **novo**.

~~~javascript
let email = "  Ana@Email.COM  ";

email.trim();          // devolve "Ana@Email.COM", e joga fora
console.log(email);    // "  Ana@Email.COM  " — nada mudou
~~~

A linha rodou, o método funcionou, e o resultado foi descartado porque ninguém guardou. O programa não reclama: a expressão é válida, só é inútil.

O jeito certo é guardar o retorno:

~~~javascript
email = email.trim().toLowerCase();   // agora sim
~~~

É o mesmo erro de chamar \`array.map()\` sem usar o resultado — e vale para \`toUpperCase\`, \`replace\`, \`slice\`, \`padStart\`, todos.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `let email = "  Ana@Email.COM  ";

// Encadear funciona porque cada método devolve um texto novo
email = email.trim().toLowerCase();
console.log(email);                 // "ana@email.com"

// Perguntar sobre o conteúdo
console.log(email.includes("@"));       // true
console.log(email.endsWith(".com"));    // true
console.log(email.length);              // 13

// Quebrar em pedaços
console.log(email.split("@"));          // ["ana", "email.com"]

// Cuidado com o vazio: texto vazio e texto com espaço são diferentes
console.log("".length);                 // 0
console.log(" ".length);                // 1
console.log(" ".trim().length);         // 0`,
      caption:
        'Encadear (`.trim().toLowerCase()`) funciona porque cada método devolve um texto novo para o seguinte trabalhar. O que não funciona é chamar sem guardar.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-9-prever-imutavel',
        type: 'predict-output',
        prompt: 'O que este programa imprime? Repare no que os métodos de texto devolvem.',
        concepts: ['strings', 'imutabilidade'],
        difficulty: 'iniciante',
        tags: ['javascript', 'strings'],
        code: `let nome = '  Ana  ';

nome.trim();
console.log('[' + nome + ']');

nome = nome.trim();
console.log('[' + nome + ']');`,
        expectedOutput: '[  Ana  ]\n[Ana]',
        explanation:
          'Texto em JavaScript é **imutável**: nenhum método altera o original. A primeira chamada a `trim` produziu `"Ana"` e jogou fora, porque ninguém guardou o retorno. A segunda guardou. O programa não avisa da primeira — a expressão é válida, só não serve para nada.',
        hints: [
          'A primeira chamada a `trim` guarda o resultado em algum lugar?',
          'Métodos de texto alteram o original, ou devolvem um novo?',
        ],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Recortar pedaços

Cada caractere de um texto tem uma posição, contada a partir do **zero** — igual a um array.

~~~javascript
const cpf = "12345678900";

cpf[0];        // "1"  — primeiro
cpf.at(-1);    // "0"  — último, contando de trás
cpf.length;    // 11
~~~

Para pegar um trecho inteiro, \`slice(inicio, fim)\`. O início entra, o fim **não**:

~~~javascript
cpf.slice(0, 3);    // "123"  — posições 0, 1 e 2
cpf.slice(3);       // "45678900" — do 3 até o fim
cpf.slice(-2);      // "00" — os dois últimos
~~~

O número negativo conta de trás para a frente, e é o que torna \`slice(-4)\` a forma natural de dizer "os quatro últimos" sem precisar saber o tamanho do texto.

Para achar onde algo está, \`indexOf\` devolve a posição — ou **\`-1\`** quando não achou:

~~~javascript
"ana@email.com".indexOf("@");    // 3
"sem-arroba".indexOf("@");       // -1
~~~

Esse \`-1\` já causou muito bug: \`if (texto.indexOf("@"))\` é verdadeiro para 1, 2, 3… e para \`-1\` também. Só é falso quando a posição é 0. Quando a pergunta é "contém?", use \`includes\`, que responde com \`true\` ou \`false\` e não tem essa armadilha.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-9-imutavel',
        type: 'multiple-choice',
        prompt:
          'Você quer checar se um texto contém uma arroba. Qual destas linhas está **errada**?',
        concepts: ['strings', 'condicoes'],
        difficulty: 'intermediario',
        tags: ['javascript', 'strings'],
        options: [
          'if (texto.includes("@"))',
          'if (texto.indexOf("@") !== -1)',
          'if (texto.indexOf("@"))',
          'if (texto.indexOf("@") >= 0)',
        ],
        correctIndex: 2,
        explanation:
          '`indexOf` devolve a **posição**, e `-1` quando não encontra. Usada direto numa condição, ela mente duas vezes: `-1` é um número diferente de zero, então "não encontrei" passa como verdadeiro; e a posição `0` — arroba logo no primeiro caractere — passa como falso. As outras três comparam explicitamente com a posição, ou usam `includes`, que já responde `true`/`false`.',
        hints: [
          'Quais números são falsos em JavaScript? Só o zero.',
          '`indexOf` devolve -1 quando não acha. -1 é verdadeiro ou falso numa condição?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-9-lacuna-mascarar',
        type: 'fill-blank',
        prompt:
          'Complete a função que esconde um cartão, deixando visíveis só os quatro últimos dígitos. A entrada pode vir com espaços entre os grupos.',
        concepts: ['strings'],
        difficulty: 'intermediario',
        tags: ['javascript', 'strings'],
        template: `function mascarar(cartao) {
  const limpo = cartao.{{1}}(' ', '');

  return '**** **** **** ' + limpo.{{2}}(-4);
}`,
        blanks: [
          { placeholder: 'tira TODOS os espaços', size: 12 },
          { placeholder: 'últimos 4', size: 8 },
        ],
        tests: [
          {
            description: 'esconde tudo menos os quatro últimos',
            assertion: `const r = mascarar('4111 1111 1111 1234'); if (r !== '**** **** **** 1234') throw new Error("Esperava '**** **** **** 1234', veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'funciona também sem espaços na entrada',
            assertion: `const r = mascarar('4111111111119999'); if (r !== '**** **** **** 9999') throw new Error("Esperava '**** **** **** 9999', veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'nenhum espaço sobra do meio do número',
            assertion: `
              const r = mascarar('4111 1111 1111 12 34');
              if (r !== '**** **** **** 1234') throw new Error("Sobrou espaço: veio " + JSON.stringify(r) + ". Um método que troca só a primeira ocorrência deixa os outros espaços para trás.");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'os quatro últimos dígitos sempre aparecem, e nada mais',
            generate: `
              let digitos = '';
              for (let i = 0; i < 16; i++) digitos += Math.floor(rnd() * 10);
              // Espaços em posições sorteadas, para o teste não valer só para o formato bonito.
              let comEspacos = '';
              for (let i = 0; i < digitos.length; i++) {
                comEspacos += digitos[i];
                if (rnd() < 0.25) comEspacos += ' ';
              }
              return { digitos: digitos, entrada: comEspacos };
            `,
            check: `
              const obtido = mascarar(caso.entrada);
              const esperado = '**** **** **** ' + caso.digitos.slice(-4);

              if (obtido !== esperado) {
                throw new Error("para " + JSON.stringify(caso.entrada) + " esperava " + JSON.stringify(esperado) + ", veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        explanation:
          'Duas ideias juntas. `replaceAll` troca **todas** as ocorrências — `replace` com um texto trocaria só a primeira, e o número ficaria com espaços no meio. E `slice(-4)` diz "os quatro últimos" sem precisar saber o tamanho: contar de trás continua certo se o cartão tiver 15 ou 19 dígitos.',
        hints: [
          'Um dos métodos precisa alcançar todos os espaços, não só o primeiro.',
          'Para pegar os últimos quatro sem saber o tamanho, o número negativo resolve.',
        ],
        solution: ['replaceAll', 'slice'],
      },
    },
    {
      kind: 'prose',
      markdown: `
## Montar texto

Somar textos com \`+\` funciona, mas fica ilegível assim que há mais de duas partes:

~~~javascript
const linha = "Olá, " + nome + "! Você tem " + total + " itens.";
~~~

O **template literal** — crase em vez de aspas, com \`\${}\` para os valores — resolve isso:

~~~javascript
const linha = \`Olá, \${nome}! Você tem \${total} itens.\`;
~~~

Dentro de \`\${}\` cabe qualquer expressão, não só um nome: \`\${total * 2}\`, \`\${itens.length}\`, \`\${vip ? "VIP" : "comum"}\`. E a crase permite quebrar linha de verdade, sem \`\\n\`.

Dois métodos completam o kit de formatação:

~~~javascript
String(7).padStart(2, "0");        // "07" — completa até o tamanho pedido
"ana maria".replace("a", "A");     // "Ana maria"  — só a PRIMEIRA
"ana maria".replaceAll("a", "A");  // "AnA mAriA"  — todas
~~~

\`replace\` trocar só a primeira ocorrência é intencional, não um defeito — mas é fonte constante de bug em quem espera o contrário. Quando a intenção é "todas", diga \`replaceAll\`.
`.trim(),
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-9-prever-replace',
        type: 'predict-output',
        prompt: 'O que este programa imprime, nas três linhas?',
        concepts: ['strings'],
        difficulty: 'intermediario',
        tags: ['javascript', 'strings'],
        code: `const frase = 'a casa e a arvore';

console.log(frase.replace('a', 'A'));
console.log(frase.replaceAll('a', 'A'));
console.log(frase);`,
        expectedOutput: 'A casa e a arvore\nA cAsA e A Arvore\na casa e a arvore',
        explanation:
          '`replace` com um texto troca apenas a **primeira** ocorrência — só o `a` inicial virou maiúsculo. `replaceAll` alcança todas, inclusive os `a` dentro de "casa" e "arvore". E a terceira linha mostra a imutabilidade de novo: `frase` nunca mudou, porque nenhum dos dois retornos foi guardado.',
        hints: [
          'Quantas ocorrências `replace` troca quando recebe um texto?',
          'A última linha imprime a variável original. Alguma das linhas anteriores a alterou?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-9-lacuna-normalizar',
        type: 'fill-blank',
        prompt:
          'Complete para a comparação funcionar independentemente de espaços e de maiúsculas.',
        concepts: ['strings'],
        difficulty: 'iniciante',
        tags: ['javascript', 'strings'],
        template: `function mesmoTexto(a, b) {
  return a.{{1}}().{{2}}() === b.{{1}}().{{2}}();
}`,
        blanks: [
          { placeholder: 'tira espaços', size: 12 },
          { placeholder: 'iguala caixa', size: 12 },
        ],
        tests: [
          {
            description: "'  Ana ' e 'ana' são o mesmo texto",
            assertion: `if (!mesmoTexto('  Ana ', 'ana')) throw new Error("Deveria considerar iguais: espaços e maiúsculas não deveriam contar.");`,
          },
          {
            description: "'Ana' e 'Bruno' são diferentes",
            assertion: `if (mesmoTexto('Ana', 'Bruno')) throw new Error("Textos diferentes não podem ser considerados iguais.");`,
          },
          {
            description: 'textos vazios são iguais',
            assertion: `if (!mesmoTexto('   ', '')) throw new Error("Só espaços, depois de limpos, é texto vazio.");`,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'a comparação ignora espaços nas pontas e caixa',
            generate: `
              const base = ['ana', 'bruno', 'carla'][Math.floor(rnd() * 3)];
              const enfeitar = (t) => (rnd() < 0.5 ? '  ' : '') + (rnd() < 0.5 ? t.toUpperCase() : t) + (rnd() < 0.5 ? ' ' : '');
              return { a: enfeitar(base), b: enfeitar(rnd() < 0.7 ? base : 'outro') };
            `,
            check: `
              const esperado = caso.a.trim().toLowerCase() === caso.b.trim().toLowerCase();
              const obtido = mesmoTexto(caso.a, caso.b);
              if (obtido !== esperado) {
                throw new Error("comparando " + JSON.stringify(caso.a) + " com " + JSON.stringify(caso.b) + " esperava " + esperado + ", veio " + obtido + ".");
              }
            `,
          },
        ],
        explanation:
          'Comparar texto que veio de um formulário sem normalizar é uma fonte silenciosa de bug: `"Ana "` e `"ana"` são valores diferentes para o computador, mas a mesma coisa para quem digitou.',
        hints: [
          'Uma remove os espaços das pontas. A outra deixa tudo na mesma caixa.',
          'As duas foram apresentadas no exemplo desta aula, e nenhuma recebe argumento.',
        ],
        solution: ['trim', 'toLowerCase'],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-9-iniciais',
        type: 'code',
        prompt: `Crie \`iniciais(nome)\`, que **retorna** as iniciais de cada palavra do nome, em maiúsculas e sem separador.\n\n- \`iniciais("ana maria souza")\` → \`"AMS"\`\n- A entrada pode vir com espaços a mais, nas pontas ou no meio.\n- Nome vazio (ou só espaços) devolve texto vazio.`,
        concepts: ['strings', 'funcoes'],
        difficulty: 'intermediario',
        tags: ['javascript', 'strings'],
        initialCode: `function iniciais(nome) {
  // Quebre em palavras, pegue a primeira letra de cada uma.
}

console.log(iniciais("ana maria souza"));  // "AMS"
console.log(iniciais("  ana   maria  "));  // "AM"
console.log(iniciais(""));                 // ""`,
        hints: [
          'Limpe as pontas antes de quebrar: senão o primeiro pedaço vem vazio.',
          '`split(" ")` num texto com espaços seguidos produz pedaços vazios no meio. Descarte-os.',
          'A primeira letra de uma palavra é `palavra[0]`.',
          'Encadeie: trim, split, filter para tirar os vazios, map para a inicial, join para juntar.',
        ],
        tests: [
          {
            description: 'A função iniciais existe',
            assertion: `if (typeof iniciais !== 'function') throw new Error("Crie uma função chamada 'iniciais'.");`,
          },
          {
            description: 'três nomes viram três letras maiúsculas',
            assertion: `const r = iniciais('ana maria souza'); if (r !== 'AMS') throw new Error("Esperava 'AMS', veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'um nome só vira uma letra',
            assertion: `const r = iniciais('joana'); if (r !== 'J') throw new Error("Esperava 'J', veio " + JSON.stringify(r) + ".");`,
          },
          {
            description: 'espaços a mais não viram iniciais vazias',
            assertion: `const r = iniciais('  ana   maria  '); if (r !== 'AM') throw new Error("Esperava 'AM', veio " + JSON.stringify(r) + ". Espaços seguidos produzem pedaços vazios ao quebrar o texto.");`,
            hidden: true,
          },
          {
            description: 'texto vazio devolve texto vazio',
            assertion: `
              const a = iniciais('');
              if (a !== '') throw new Error("Nome vazio deveria devolver '', veio " + JSON.stringify(a) + ".");
              const b = iniciais('   ');
              if (b !== '') throw new Error("Só espaços deveria devolver '', veio " + JSON.stringify(b) + ".");
            `,
            hidden: true,
          },
          {
            description: 'o nome original não é alterado',
            assertion: `
              const nome = 'ana maria';
              iniciais(nome);
              if (nome !== 'ana maria') throw new Error("A função alterou o texto recebido. Strings são imutáveis; isso só aconteceria se você reatribuísse algo global.");
            `,
            hidden: true,
          },
        ],
        properties: [
          {
            description: 'uma inicial para cada palavra, sempre em maiúscula',
            generate: `
              const palavras = ['ana', 'bruno', 'carla', 'diego', 'eva'];
              const quantas = 1 + Math.floor(rnd() * 4);

              const escolhidas = [];
              for (let i = 0; i < quantas; i++) {
                escolhidas.push(palavras[Math.floor(rnd() * palavras.length)]);
              }

              // Espaçamento irregular de propósito: é assim que o nome chega.
              let entrada = rnd() < 0.5 ? ' ' : '';
              for (let i = 0; i < escolhidas.length; i++) {
                entrada += escolhidas[i];
                if (i < escolhidas.length - 1) entrada += rnd() < 0.5 ? '  ' : ' ';
              }
              entrada += rnd() < 0.5 ? '  ' : '';

              return { entrada: entrada, palavras: escolhidas };
            `,
            check: `
              const esperado = caso.palavras.map((p) => p[0].toUpperCase()).join('');
              const obtido = iniciais(caso.entrada);

              if (obtido !== esperado) {
                throw new Error("para " + JSON.stringify(caso.entrada) + " esperava " + JSON.stringify(esperado) + ", veio " + JSON.stringify(obtido) + ".");
              }
            `,
          },
        ],
        solution: `function iniciais(nome) {
  return String(nome)
    .trim()
    .split(' ')
    .filter((parte) => parte !== '')
    .map((parte) => parte[0].toUpperCase())
    .join('');
}`,
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-9-validar',
        type: 'code',
        prompt: `Crie \`normalizarEmail(entrada)\` que **retorna** o email limpo — sem espaços nas pontas e em minúsculas.\n\nSe a entrada não for um texto válido de email (precisa conter \`"@"\` e ter algo antes e depois dele), retorne \`null\`.`,
        concepts: ['strings', 'condicoes'],
        difficulty: 'intermediario',
        tags: ['javascript', 'strings', 'validacao'],
        initialCode: `function normalizarEmail(entrada) {
  // Seu código aqui
}

console.log(normalizarEmail("  Ana@Email.COM  ")); // "ana@email.com"
console.log(normalizarEmail("sem-arroba"));        // null
`,
        hints: [
          'Limpe primeiro, valide depois — senão um espaço no fim atrapalha a checagem.',
          'Use trim() e toLowerCase() e guarde o resultado numa variável.',
          'Para garantir que há algo antes e depois do @, split("@") ajuda: você quer exatamente 2 partes, nenhuma vazia.',
          'const limpo = String(entrada).trim().toLowerCase(); const partes = limpo.split("@"); if (partes.length !== 2 || !partes[0] || !partes[1]) return null; return limpo;',
        ],
        tests: [
          {
            description: 'A função normalizarEmail existe',
            assertion: `if (typeof normalizarEmail !== 'function') throw new Error("Crie uma função chamada 'normalizarEmail'.");`,
          },
          {
            description: 'Limpa espaços e converte para minúsculas',
            assertion: `const r = normalizarEmail("  Ana@Email.COM  ");
if (r !== "ana@email.com") throw new Error("Esperado \\"ana@email.com\\", mas veio " + JSON.stringify(r) + ". Lembre de guardar o retorno de trim() e toLowerCase().");`,
          },
          {
            description: 'Recusa texto sem arroba',
            assertion: `if (normalizarEmail("sem-arroba") !== null) throw new Error("Um texto sem @ deveria devolver null, mas devolveu " + JSON.stringify(normalizarEmail("sem-arroba")) + ".");`,
          },
          {
            description: 'Recusa quando falta algo antes ou depois do @',
            assertion: `if (normalizarEmail("@email.com") !== null) throw new Error("\\"@email.com\\" não tem nada antes do @ e deveria devolver null.");
if (normalizarEmail("ana@") !== null) throw new Error("\\"ana@\\" não tem nada depois do @ e deveria devolver null.");`,
            hidden: true,
          },
          {
            description: 'Recusa texto com mais de um arroba',
            assertion: `if (normalizarEmail("a@b@c.com") !== null) throw new Error("Um email com dois @ é inválido e deveria devolver null.");`,
            hidden: true,
          },
          {
            description: 'Recusa um texto só de espaços',
            assertion: `if (normalizarEmail("   ") !== null) throw new Error("Só espaços não é email; deveria devolver null.");`,
            hidden: true,
          },
        ],
        solution: `function normalizarEmail(entrada) {
  const limpo = String(entrada).trim().toLowerCase();
  const partes = limpo.split("@");
  if (partes.length !== 2 || !partes[0] || !partes[1]) return null;
  return limpo;
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Strings são **imutáveis**: todo método devolve um texto novo, então guarde o retorno — chamar \`texto.trim()\` sozinho não limpa nada. Limpe antes de validar, porque um espaço invisível no fim já invalida uma comparação correta. Para recortar, \`slice\` aceita posição negativa e resolve "os últimos N" sem saber o tamanho. Para perguntar "contém?", prefira \`includes\` a \`indexOf\`, que devolve \`-1\` — um número verdadeiro numa condição. E quando a intenção for trocar todas as ocorrências, diga \`replaceAll\`: \`replace\` com texto só alcança a primeira.`,
    },
  ],
};

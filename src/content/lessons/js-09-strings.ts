import type { Lesson } from '../types';

export const lessonStrings: Lesson = {
  id: 'lesson-js-9',
  trackId: 'track-js-fundamentos',
  title: 'Textos: Limpar, Validar e Formatar',
  language: 'javascript',
  objective: 'Tratar o texto que chega de um formulário antes de confiar nele.',
  concepts: ['strings', 'condicoes', 'funcoes'],
  status: 'published',
  estimatedMinutes: 18,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Todo dado digitado por uma pessoa chega sujo: espaço sobrando no fim, maiúscula onde não devia, acento faltando. Validar antes de usar é rotina em qualquer sistema real.

Os métodos que resolvem a maior parte disso:

| Método | O que faz |
|---|---|
| \`.trim()\` | remove espaços do começo e do fim |
| \`.toLowerCase()\` | tudo em minúsculo |
| \`.includes(x)\` | contém esse trecho? |
| \`.split(x)\` | quebra em array por um separador |
| \`.length\` | quantidade de caracteres |

Um detalhe que pega muita gente: **strings são imutáveis**. \`texto.trim()\` não limpa a variável — ele devolve um texto novo. Se você não guardar o retorno, nada muda.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `let email = "  Ana@Email.COM  ";

email.trim();          // devolve "Ana@Email.COM"
console.log(email);    // "  Ana@Email.COM  " — a variável NÃO mudou

email = email.trim().toLowerCase();
console.log(email);    // "ana@email.com" — agora sim

console.log(email.includes("@"));   // true
console.log(email.split("@"));      // ["ana", "email.com"]
console.log("".length);             // 0 — texto vazio é diferente de espaço`,
      caption:
        'Os métodos devolvem um texto novo. Sem reatribuir, a variável original continua exatamente como estava.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-9-imutavel',
        type: 'predict-output',
        prompt: 'O que este código imprime?',
        concepts: ['strings'],
        difficulty: 'iniciante',
        tags: ['javascript', 'strings', 'imutabilidade'],
        code: `let nome = "  Ana  ";
nome.trim();
console.log("[" + nome + "]");`,
        expectedOutput: '[  Ana  ]',
        explanation:
          'O `trim()` foi chamado, mas o resultado foi descartado — ninguém guardou o retorno. Como strings são imutáveis, a variável `nome` continua com os espaços. O correto seria `nome = nome.trim()`.',
        hints: [
          'Repare que o resultado do trim() não foi atribuído a nada.',
          'Strings são imutáveis: o método devolve um texto novo em vez de alterar o existente.',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-9-prever-imutavel',
        type: 'predict-output',
        prompt: 'O que este programa imprime? Repare no que os métodos de texto devolvem.',
        concepts: ['strings', 'imutabilidade'],
        difficulty: 'intermediario',
        tags: ['javascript', 'strings'],
        code: `let nome = '  Ana  ';

nome.trim();
console.log('[' + nome + ']');

nome = nome.trim();
console.log('[' + nome + ']');`,
        expectedOutput: '[  Ana  ]\n[Ana]',
        explanation:
          'Texto em JavaScript é **imutável**: nenhum método altera o original. `trim`, `toUpperCase` e `replace` devolvem um texto **novo** — se você não guardar o retorno, o trabalho é jogado fora. É o mesmo erro de chamar `array.map` sem usar o resultado.',
        hints: [
          'A primeira chamada a `trim` guarda o resultado em algum lugar?',
          'Métodos de texto alteram o original, ou devolvem um novo?',
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
      markdown: `Strings são **imutáveis**: todo método devolve um texto novo, então guarde o retorno. E limpe antes de validar — um espaço invisível no fim já invalida uma comparação correta.`,
    },
  ],
};

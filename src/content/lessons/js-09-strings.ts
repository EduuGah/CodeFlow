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

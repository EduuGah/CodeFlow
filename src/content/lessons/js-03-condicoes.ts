import type { Lesson } from '../types';

export const lessonCondicoes: Lesson = {
  id: 'lesson-js-3',
  trackId: 'track-js-fundamentos',
  title: 'Condições: Escolhendo Caminhos',
  language: 'javascript',
  objective: 'Fazer o programa tomar decisões diferentes conforme os dados que recebe.',
  concepts: ['condicoes', 'operadores'],
  status: 'published',
  estimatedMinutes: 15,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Até agora seu código executava sempre na mesma ordem, de cima para baixo. Uma **condição** quebra isso: ela pergunta algo e escolhe um caminho conforme a resposta.

A pergunta precisa resultar em \`true\` ou \`false\`. Para isso usamos operadores de comparação:

| Operador | Pergunta |
|---|---|
| \`>\` \`<\` | maior / menor que |
| \`>=\` \`<=\` | maior / menor ou igual |
| \`===\` | é exatamente igual? |
| \`!==\` | é diferente? |

Use sempre \`===\` para comparar, nunca \`=\`. Um sinal só **atribui** um valor; três **comparam**. Trocar os dois é um dos erros mais comuns de quem está começando.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `const nota = 7;

if (nota >= 7) {
  console.log("Aprovado");
} else if (nota >= 5) {
  console.log("Recuperação");
} else {
  console.log("Reprovado");
}`,
      caption:
        'O JavaScript testa de cima para baixo e para no primeiro que for verdadeiro. Por isso a ordem importa.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-3-ordem',
        type: 'predict-output',
        prompt: 'A ordem das condições foi invertida. O que este código imprime?',
        concepts: ['condicoes'],
        difficulty: 'iniciante',
        tags: ['javascript', 'condicoes', 'ordem'],
        code: `const nota = 9;

if (nota >= 5) {
  console.log("Recuperação");
} else if (nota >= 7) {
  console.log("Aprovado");
}`,
        expectedOutput: 'Recuperação',
        explanation:
          'Como 9 já satisfaz `nota >= 5`, o primeiro bloco executa e os demais são ignorados — a segunda condição nunca chega a ser testada. Ao encadear faixas, comece sempre pela mais restritiva.',
        hints: [
          'O JavaScript testa as condições em ordem e para na primeira verdadeira.',
          'Pergunte-se: 9 é maior ou igual a 5? O que acontece depois disso?',
        ],
      },
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-3-classificar',
        type: 'code',
        prompt: `Crie a função \`classificar(idade)\` que **retorna** um texto:\n\n- menor que 12 → \`"criança"\`\n- de 12 a 17 → \`"adolescente"\`\n- 18 ou mais → \`"adulto"\``,
        concepts: ['condicoes', 'funcoes'],
        difficulty: 'iniciante',
        tags: ['javascript', 'condicoes', 'funcoes'],
        initialCode: `function classificar(idade) {
  // Seu código aqui
}

console.log(classificar(15));
`,
        hints: [
          'Você precisa de três caminhos, então pense em if / else if / else.',
          'Comece testando a faixa mais baixa: idade < 12.',
          'Use return, não console.log — o teste verifica o valor devolvido pela função.',
          'if (idade < 12) return "criança"; else if (idade < 18) return "adolescente"; else return "adulto";',
        ],
        tests: [
          {
            description: 'A função classificar existe',
            assertion: `if (typeof classificar !== 'function') throw new Error("Crie uma função chamada 'classificar'.");`,
          },
          {
            description: '5 anos é criança',
            assertion: `if (classificar(5) !== "criança") throw new Error("classificar(5) deveria retornar \\"criança\\", mas retornou " + JSON.stringify(classificar(5)) + ". Lembre de usar return.");`,
          },
          {
            description: '15 anos é adolescente',
            assertion: `if (classificar(15) !== "adolescente") throw new Error("classificar(15) deveria retornar \\"adolescente\\", mas retornou " + JSON.stringify(classificar(15)) + ".");`,
          },
          {
            description: '30 anos é adulto',
            assertion: `if (classificar(30) !== "adulto") throw new Error("classificar(30) deveria retornar \\"adulto\\", mas retornou " + JSON.stringify(classificar(30)) + ".");`,
          },
          {
            description: 'Os limites 12 e 18 caem na faixa certa',
            assertion: `if (classificar(12) !== "adolescente") throw new Error("Exatamente 12 anos deveria ser \\"adolescente\\". Verifique se usou < ou <=.");
if (classificar(18) !== "adulto") throw new Error("Exatamente 18 anos deveria ser \\"adulto\\". Verifique o limite superior.");`,
            hidden: true,
          },
        ],
        solution: `function classificar(idade) {
  if (idade < 12) return "criança";
  else if (idade < 18) return "adolescente";
  else return "adulto";
}`,
      },
    },
    {
      kind: 'summary',
      markdown: `Condições escolhem caminhos. O JavaScript para na primeira que for verdadeira, então encadeie da faixa mais restritiva para a mais ampla. E compare com \`===\`, nunca com \`=\`.`,
    },
  ],
};

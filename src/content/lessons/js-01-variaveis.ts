import type { Lesson } from '../types';

export const lessonVariaveis: Lesson = {
  id: 'lesson-js-1',
  trackId: 'track-js-fundamentos',
  title: 'Variáveis: Caixas na Memória',
  language: 'javascript',
  objective: 'Guardar valores na memória e recuperá-los pelo nome.',
  concepts: ['variaveis'],
  status: 'published',
  estimatedMinutes: 12,
  blocks: [
    {
      kind: 'prose',
      markdown: `
Para programar, precisamos armazenar dados. Pense na memória do computador como um armazém cheio de caixas. Uma **variável** é a etiqueta que colamos numa dessas caixas para encontrá-la depois.

No JavaScript moderno usamos \`let\` para um valor que pode mudar e \`const\` para um que não muda.
`.trim(),
    },
    {
      kind: 'example',
      language: 'javascript',
      code: `let idade = 25;\nconst nome = "Maria";\n\nidade = 26;      // permitido: let\n// nome = "Ana"; // erro: const não aceita reatribuição`,
      caption: 'A diferença entre let e const aparece na hora de reatribuir.',
    },
    {
      kind: 'exercise',
      exercise: {
        id: 'ex-js-1-declarar',
        type: 'code',
        prompt: `1. Crie uma variável \`pontuacao\` com \`let\` e o valor \`100\`.\n2. Crie uma constante \`jogador\` com \`const\` e o seu nome.`,
        concepts: ['variaveis'],
        difficulty: 'iniciante',
        tags: ['javascript', 'variaveis', 'let', 'const'],
        initialCode: `// Escreva seu código abaixo\n\n`,
        hints: [
          'Uma variável que pode mudar começa com a palavra let.',
          'A sintaxe é: let nomeDaVariavel = valor;',
          'Para o seu nome, use const — e lembre que texto fica entre aspas.',
          'Você precisa de duas linhas: uma com let pontuacao = 100; e outra com const jogador = "seu nome";',
        ],
        tests: [
          {
            description: 'A variável pontuacao foi criada',
            assertion: `if (typeof pontuacao === 'undefined') throw new Error("A variável 'pontuacao' não foi criada.");`,
          },
          {
            description: 'pontuacao vale 100',
            // typeof antes da comparação: sem isso, o teste vaza um
            // ReferenceError cru quando a variável nem foi declarada.
            assertion: `if (typeof pontuacao === 'undefined' || pontuacao !== 100) throw new Error("A variável 'pontuacao' deve ter o valor 100.");`,
          },
          {
            description: 'A constante jogador foi criada',
            assertion: `if (typeof jogador === 'undefined') throw new Error("A constante 'jogador' não foi criada.");`,
          },
          {
            description: 'jogador guarda um texto',
            assertion: `if (typeof jogador !== 'string') throw new Error("A constante 'jogador' deve guardar um texto, entre aspas.");`,
            hidden: true,
          },
        ],
        solution: `let pontuacao = 100;\nconst jogador = "Eduardo";`,
      },
    },
    {
      kind: 'summary',
      markdown: `\`let\` cria um valor que pode mudar; \`const\` cria um que não pode. O nome é como você encontra o valor depois — escolha nomes que digam o que guardam.`,
    },
  ],
};

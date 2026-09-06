export const mockLesson = {
  id: 'lesson-js-1',
  title: 'Variáveis: Caixas na Memória',
  markdownContent: `
Bem-vindo à sua primeira aula de JavaScript!

Para programar, precisamos armazenar dados. Pense na memória do computador como um grande armazém cheio de caixas. Uma **variável** é como uma etiqueta que colamos em uma dessas caixas para podermos encontrá-la depois.

### Criando sua primeira variável

No JavaScript moderno, usamos a palavra \`let\` para criar uma variável cujo valor pode mudar, e \`const\` para valores que nunca mudam.

\`\`\`javascript
let idade = 25;
const nome = "Maria";
\`\`\`

### Sua Tarefa
1. Crie uma variável chamada \`pontuacao\` usando \`let\` e atribua a ela o valor \`100\`.
2. Crie uma constante chamada \`jogador\` usando \`const\` e atribua a ela o seu nome.
  `,
  initialCode: `// Escreva seu código abaixo\n\n`,
  hints: [
    "Lembre-se da sintaxe: para criar uma variável que muda, use 'let nomeDaVariavel = valor;'",
    "Para a segunda tarefa, uma constante deve ser criada com a palavra 'const'. O seu nome deve estar entre aspas, por ser um texto (string)!"
  ]
};

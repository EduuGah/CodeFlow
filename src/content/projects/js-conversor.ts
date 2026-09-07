import type { Project } from '../types';

export const projetoConversor: Project = {
  id: 'proj-js-conversor',
  title: 'Conversor de Temperatura',
  description:
    'Converta Celsius para Fahrenheit e trate a entrada inválida, como todo formulário real precisa fazer.',
  difficulty: 'iniciante',
  language: 'javascript',
  concepts: ['funcoes', 'condicoes', 'operadores'],
  status: 'published',
  initialCode: `function celsiusParaFahrenheit(celsius) {
  // Seu código aqui
}

console.log(celsiusParaFahrenheit(0));    // 32
console.log(celsiusParaFahrenheit(100));  // 212
console.log(celsiusParaFahrenheit("abc")); // e agora?
`,
  brief: `
Todo formulário recebe lixo mais cedo ou mais tarde. Este projeto é sobre a conversão — e sobre o que fazer quando o dado não é o esperado.

## Requisitos

1. Crie \`celsiusParaFahrenheit(celsius)\`, usando a fórmula \`celsius * 9 / 5 + 32\`.
2. A função deve **retornar** o número convertido.
3. Se o valor recebido não for um número, retorne \`null\` em vez de devolver \`NaN\`.

## Por que o item 3 importa

Se você somar 32 a um texto, o JavaScript não reclama: devolve \`NaN\` ou uma string estranha, e o erro só aparece muito mais tarde, longe da causa. Decidir explicitamente o que fazer com entrada inválida é o que separa um exercício de um programa que aguenta uso real.

## Como testar

Rode com \`0\` (deve dar 32), \`100\` (deve dar 212) e \`-40\` — que é o ponto onde as duas escalas se encontram. Depois teste com \`"abc"\` e confira o que a sua função devolve.

Dica: \`typeof valor === "number"\` diz se é número, mas \`NaN\` também é do tipo number. \`Number.isFinite(valor)\` cobre os dois casos.
`.trim(),
};

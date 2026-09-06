export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  markdownContent: string;
  initialCode: string;
}

export const mockProjects: Project[] = [
  {
    id: 'proj-js-imc',
    title: 'Calculadora de IMC',
    description: 'Crie uma função que calcula o Índice de Massa Corporal (IMC) e retorna a classificação de saúde.',
    difficulty: 'Fácil',
    markdownContent: `
# 🛠️ Projeto: Calculadora de IMC

No mundo real, desenvolvedores frequentemente transformam fórmulas matemáticas em código para aplicativos de saúde.

Sua missão é construir uma função \`calcularIMC(peso, altura)\` que receba o peso (em kg) e a altura (em metros) de uma pessoa, calcule o IMC e exiba a categoria correspondente usando \`console.log\`.

## 📋 Especificações (Requisitos)

1. Crie uma função chamada \`calcularIMC(peso, altura)\`.
2. A fórmula do IMC é: \`peso / (altura * altura)\`.
3. A função deve exibir no console uma das seguintes mensagens dependendo do resultado:
   - Menor que 18.5: \`"Abaixo do peso"\`
   - Entre 18.5 e 24.9: \`"Peso normal"\`
   - Entre 25.0 e 29.9: \`"Sobrepeso"\`
   - 30.0 ou mais: \`"Obesidade"\`

## 🧪 Como testar seu código?
No final do seu código, chame sua função com valores de teste. Exemplo:
\`calcularIMC(70, 1.75);\`

Clique em **Rodar Código** para ver se as saídas no console estão corretas. Quando estiver satisfeito com o resultado, clique em **Submeter Projeto**.
    `,
    initialCode: `// 1. Crie a função calcularIMC
function calcularIMC(peso, altura) {
  // Seu código aqui
}

// 2. Teste sua função
calcularIMC(70, 1.75); // Deve resultar em "Peso normal"
`
  }
];

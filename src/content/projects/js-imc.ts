import type { Project } from '../types';

export const projetoImc: Project = {
  id: 'proj-js-imc',
  title: 'Calculadora de IMC',
  description:
    'Transforme uma fórmula de saúde em código: calcule o IMC e classifique o resultado.',
  difficulty: 'iniciante',
  language: 'javascript',
  concepts: ['variaveis', 'operadores', 'condicoes', 'funcoes'],
  status: 'published',
  initialCode: `// 1. Crie a função calcularIMC
function calcularIMC(peso, altura) {
  // Seu código aqui
}

// 2. Teste sua função
calcularIMC(70, 1.75); // Deve resultar em "Peso normal"
`,
  brief: `
Desenvolvedores transformam fórmulas em código o tempo todo. Sua missão é construir \`calcularIMC(peso, altura)\`, que recebe peso em kg e altura em metros, calcula o IMC e exibe a categoria com \`console.log\`.

## Requisitos

1. Crie uma função chamada \`calcularIMC(peso, altura)\`.
2. A fórmula é \`peso / (altura * altura)\`.
3. A função deve exibir no console uma destas mensagens:
   - Menor que 18.5 — \`"Abaixo do peso"\`
   - De 18.5 a 24.9 — \`"Peso normal"\`
   - De 25.0 a 29.9 — \`"Sobrepeso"\`
   - 30.0 ou mais — \`"Obesidade"\`

## Como testar

Chame sua função com valores conhecidos no final do arquivo, por exemplo \`calcularIMC(70, 1.75)\`. Clique em **Rodar Código** para ver o console. Antes de submeter, teste também os limites: o que acontece exatamente com 18.5 e com 25?
`.trim(),
};

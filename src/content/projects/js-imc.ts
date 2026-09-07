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
  checkpoints: [
    {
      id: 'cp-imc-funcao',
      title: 'A função existe e calcula',
      description: 'calcularIMC(peso, altura) devolve o IMC pela fórmula peso / (altura * altura).',
      tests: [
        {
          description: 'calcularIMC foi criada',
          assertion: `if (typeof calcularIMC !== 'function') throw new Error("Crie a função 'calcularIMC(peso, altura)'.");`,
        },
      ],
    },
    {
      id: 'cp-imc-classifica',
      title: 'Classifica as quatro faixas',
      description: 'Exibe no console a categoria correta para cada faixa de IMC.',
      tests: [
        {
          description: 'IMC 17.3 é "Abaixo do peso"',
          assertion: `const saida = [];
const original = console.log;
console.log = (...a) => saida.push(a.join(' '));
try { calcularIMC(50, 1.70); } finally { console.log = original; }
if (!saida.join(' ').includes('Abaixo do peso')) throw new Error('Com peso 50 e altura 1.70 o IMC é 17.3, e nada de "Abaixo do peso" foi exibido. Veio: ' + JSON.stringify(saida.join(' ')));`,
        },
        {
          description: 'IMC 22.9 é "Peso normal"',
          assertion: `const saida = [];
const original = console.log;
console.log = (...a) => saida.push(a.join(' '));
try { calcularIMC(70, 1.75); } finally { console.log = original; }
if (!saida.join(' ').includes('Peso normal')) throw new Error('Com peso 70 e altura 1.75 o IMC é 22.9, e nada de "Peso normal" foi exibido. Veio: ' + JSON.stringify(saida.join(' ')));`,
        },
        {
          description: 'IMC 27.8 é "Sobrepeso"',
          assertion: `const saida = [];
const original = console.log;
console.log = (...a) => saida.push(a.join(' '));
try { calcularIMC(85, 1.75); } finally { console.log = original; }
if (!saida.join(' ').includes('Sobrepeso')) throw new Error('Com peso 85 e altura 1.75 o IMC é 27.8, e nada de "Sobrepeso" foi exibido. Veio: ' + JSON.stringify(saida.join(' ')));`,
        },
        {
          description: 'IMC 34.7 é "Obesidade"',
          assertion: `const saida = [];
const original = console.log;
console.log = (...a) => saida.push(a.join(' '));
try { calcularIMC(106, 1.75); } finally { console.log = original; }
if (!saida.join(' ').includes('Obesidade')) throw new Error('Com peso 106 e altura 1.75 o IMC é 34.6, e nada de "Obesidade" foi exibido. Veio: ' + JSON.stringify(saida.join(' ')));`,
        },
      ],
    },
    {
      id: 'cp-imc-limites',
      title: 'Acerta os limites das faixas',
      description: 'Os valores exatos 18.5, 25 e 30 caem na faixa certa.',
      tests: [
        {
          description: 'IMC exatamente 18.5 já é "Peso normal"',
          assertion: `const saida = [];
const original = console.log;
console.log = (...a) => saida.push(a.join(' '));
try { calcularIMC(18.5, 1); } finally { console.log = original; }
const texto = saida.join(' ');
if (texto.includes('Abaixo do peso')) throw new Error('IMC exatamente 18.5 deveria ser "Peso normal", não "Abaixo do peso". Verifique se usou < ou <=.');
if (!texto.includes('Peso normal')) throw new Error('IMC exatamente 18.5 deveria exibir "Peso normal". Veio: ' + JSON.stringify(texto));`,
          hidden: true,
        },
        {
          description: 'IMC exatamente 30 já é "Obesidade"',
          assertion: `const saida = [];
const original = console.log;
console.log = (...a) => saida.push(a.join(' '));
try { calcularIMC(30, 1); } finally { console.log = original; }
const texto = saida.join(' ');
if (!texto.includes('Obesidade')) throw new Error('IMC exatamente 30 deveria exibir "Obesidade". Veio: ' + JSON.stringify(texto));`,
          hidden: true,
        },
      ],
    },
  ],
  referenceSolution: `function calcularIMC(peso, altura) {
  const imc = peso / (altura * altura);
  if (imc < 18.5) console.log("Abaixo do peso");
  else if (imc < 25) console.log("Peso normal");
  else if (imc < 30) console.log("Sobrepeso");
  else console.log("Obesidade");
}`,
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

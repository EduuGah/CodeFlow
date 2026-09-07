import type { Project } from '../types';

export const projetoCaixa: Project = {
  id: 'proj-js-caixa',
  title: 'Caixa da Padaria',
  description:
    'Some um carrinho de compras, aplique desconto por faixa e calcule o troco — com os arredondamentos que dinheiro exige.',
  difficulty: 'intermediario',
  language: 'javascript',
  concepts: ['arrays', 'loops', 'condicoes', 'funcoes', 'operadores'],
  status: 'published',
  initialCode: `const carrinho = [
  { item: "pão francês", preco: 0.75, quantidade: 10 },
  { item: "café", preco: 18.90, quantidade: 1 },
  { item: "leite", preco: 5.49, quantidade: 2 },
];

function subtotal(carrinho) {
  // Soma preco * quantidade de cada item
}

function desconto(valor) {
  // Acima de 50: 10%. Acima de 20: 5%. Abaixo disso: nenhum.
}

function troco(total, pago) {
  // Quanto devolver? E se o cliente pagou menos que o total?
}

console.log(subtotal(carrinho));
`,
  brief: `
Dinheiro é um ótimo primeiro contato com um problema que parece simples e não é: o computador não representa 0,1 com exatidão.

## Requisitos

1. \`subtotal(carrinho)\` — soma \`preco * quantidade\` de todos os itens.
2. \`desconto(valor)\` — devolve o **valor do desconto**: 10% acima de R$ 50, 5% acima de R$ 20, nenhum abaixo disso.
3. \`troco(total, pago)\` — devolve quanto devolver ao cliente.

## O detalhe que morde

Execute \`console.log(0.1 + 0.2)\` no editor. O resultado não é \`0.3\`.

Números decimais são guardados em binário, e frações como 0,1 não têm representação exata — do mesmo jeito que 1/3 não termina em decimal. Em valores monetários isso vira centavo perdido.

Uma saída comum é arredondar na hora de exibir, com \`valor.toFixed(2)\`. Repare que \`toFixed\` devolve **texto**, não número — então nunca some dois resultados de \`toFixed\`.

## Decida antes de codar

O que sua função \`troco\` faz se o cliente pagou menos do que deve? Devolver um número negativo é uma escolha; recusar a operação é outra. As duas se defendem — a única resposta ruim é não ter pensado no caso.
`.trim(),
};

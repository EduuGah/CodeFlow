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
  checkpoints: [
    {
      id: 'cp-caixa-subtotal',
      title: 'Soma o carrinho',
      description: 'subtotal soma preco * quantidade de todos os itens.',
      tests: [
        {
          description: 'A funcao subtotal existe',
          assertion: `if (typeof subtotal !== 'function') throw new Error("Crie a funcao 'subtotal(carrinho)'.");`,
        },
        {
          description: 'Multiplica preco por quantidade',
          assertion: `const r = subtotal([{ item: "a", preco: 2, quantidade: 3 }, { item: "b", preco: 10, quantidade: 1 }]);
if (Math.abs(r - 16) > 1e-9) throw new Error('2x3 + 10x1 = 16, mas veio ' + r + '. Nao esqueca de multiplicar pela quantidade.');`,
        },
        {
          description: 'Carrinho vazio soma zero',
          assertion: `const r = subtotal([]);
if (r !== 0) throw new Error('Carrinho vazio deveria somar 0, mas veio ' + r + '.');`,
          hidden: true,
        },
      ],
    },
    {
      id: 'cp-caixa-desconto',
      title: 'Aplica desconto por faixa',
      description: '10% acima de R$ 50, 5% acima de R$ 20, nenhum abaixo disso.',
      tests: [
        {
          description: 'A funcao desconto existe',
          assertion: `if (typeof desconto !== 'function') throw new Error("Crie a funcao 'desconto(valor)'.");`,
        },
        {
          description: 'Acima de 50 desconta 10%',
          assertion: `const r = desconto(100);
if (Math.abs(r - 10) > 1e-9) throw new Error('O desconto de 100 deveria ser 10, mas veio ' + r + '. Devolva o VALOR do desconto, nao o total ja descontado.');`,
        },
        {
          description: 'Entre 20 e 50 desconta 5%',
          assertion: `const r = desconto(40);
if (Math.abs(r - 2) > 1e-9) throw new Error('O desconto de 40 deveria ser 2, que e 5%, mas veio ' + r + '.');`,
        },
        {
          description: 'Abaixo de 20 nao ha desconto',
          assertion: `const r = desconto(10);
if (r !== 0) throw new Error('Abaixo de 20 nao ha desconto, mas veio ' + r + '.');`,
          hidden: true,
        },
      ],
    },
    {
      id: 'cp-caixa-troco',
      title: 'Calcula o troco',
      description: 'troco devolve quanto entregar ao cliente.',
      tests: [
        {
          description: 'A funcao troco existe',
          assertion: `if (typeof troco !== 'function') throw new Error("Crie a funcao 'troco(total, pago)'.");`,
        },
        {
          description: 'Devolve a diferenca',
          assertion: `const r = troco(35, 50);
if (Math.abs(r - 15) > 1e-9) throw new Error('Pagando 50 num total de 35, o troco e 15, mas veio ' + r + '.');`,
        },
        {
          description: 'Pagamento exato nao gera troco',
          assertion: `const r = troco(35, 35);
if (Math.abs(r) > 1e-9) throw new Error('Pagamento exato deveria dar troco 0, mas veio ' + r + '.');`,
          hidden: true,
        },
      ],
    },
  ],
  referenceSolution: `function subtotal(carrinho) {
  let total = 0;
  for (const linha of carrinho) total += linha.preco * linha.quantidade;
  return total;
}

function desconto(valor) {
  if (valor > 50) return valor * 0.10;
  if (valor > 20) return valor * 0.05;
  return 0;
}

function troco(total, pago) {
  return pago - total;
}`,
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

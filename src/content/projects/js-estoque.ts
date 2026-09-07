import type { Project } from '../types';

export const projetoEstoque: Project = {
  id: 'proj-js-estoque',
  title: 'Controle de Estoque',
  description:
    'Requisitos incompletos, como chegam na vida real: você precisa decidir o que o enunciado não diz.',
  difficulty: 'avancado',
  language: 'javascript',
  concepts: ['objetos', 'arrays', 'funcoes', 'casos-extremos', 'condicoes'],
  status: 'published',
  initialCode: `const estoque = [
  { sku: "PAO-001", nome: "Pão francês", quantidade: 120, minimo: 50 },
  { sku: "LEI-002", nome: "Leite integral", quantidade: 8, minimo: 20 },
  { sku: "CAF-003", nome: "Café 500g", quantidade: 0, minimo: 10 },
];

function darBaixa(estoque, sku, quantidade) {
  // ...
}

function repor(estoque, sku, quantidade) {
  // ...
}

function abaixoDoMinimo(estoque) {
  // ...
}

function relatorio(estoque) {
  // ...
}
`,
  brief: `
Um comerciante te procura e diz:

> "Preciso de um sistema pra controlar meu estoque. Quando o produto tá acabando eu quero saber, e não pode vender o que não tem."

É tudo que ele disse. Note quanta coisa **não** foi dita.

## Antes de escrever qualquer código

Responda por escrito, num comentário no topo do arquivo:

1. O que significa "tá acabando"? Abaixo do mínimo, ou já no zero?
2. Se alguém tenta dar baixa de 10 unidades e só há 3, o que acontece? Recusa tudo, ou vende as 3?
3. Dar baixa de quantidade negativa deveria ser aceito como devolução, ou recusado?
4. E se o SKU não existir no estoque?

Nenhuma dessas tem resposta única. O que se espera de um desenvolvedor é **perceber que a pergunta existe** — e não descobrir na produção.

## Requisitos

1. \`darBaixa(estoque, sku, quantidade)\` — retira do estoque conforme a regra que você definiu.
2. \`repor(estoque, sku, quantidade)\` — devolve unidades ao estoque.
3. \`abaixoDoMinimo(estoque)\` — lista os produtos que precisam de reposição.
4. \`relatorio(estoque)\` — devolve \`{ totalItens, produtosEmFalta, produtosCriticos }\`.

## Critérios de aceitação

- Nenhuma operação pode deixar a quantidade negativa.
- \`abaixoDoMinimo\` inclui produtos com quantidade zero.
- Chamar qualquer função com um SKU inexistente não pode quebrar o programa.
- Suas quatro decisões acima estão documentadas no código e o comportamento bate com o que você escreveu.

Esse último critério é o mais importante do projeto. Código que faz uma coisa e documenta outra é pior que código sem documentação.
`.trim(),
};

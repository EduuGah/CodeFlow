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
  checkpoints: [
    {
      id: 'cp-est-baixa',
      title: 'Dar baixa no estoque',
      description: 'darBaixa reduz a quantidade e nunca deixa o estoque negativo.',
      tests: [
        {
          description: 'A funcao darBaixa existe',
          assertion: `if (typeof darBaixa !== 'function') throw new Error("Crie a funcao 'darBaixa(estoque, sku, quantidade)'.");`,
        },
        {
          description: 'Reduz a quantidade do produto certo',
          assertion: `const e = [{ sku: "A", nome: "a", quantidade: 10, minimo: 2 }, { sku: "B", nome: "b", quantidade: 5, minimo: 2 }];
darBaixa(e, "A", 3);
if (e[0].quantidade !== 7) throw new Error('Depois de dar baixa de 3 em 10, a quantidade deveria ser 7, mas ficou ' + e[0].quantidade + '.');
if (e[1].quantidade !== 5) throw new Error('A baixa mexeu no produto errado: B foi de 5 para ' + e[1].quantidade + '.');`,
        },
        {
          description: 'Nunca deixa a quantidade negativa',
          assertion: `const e = [{ sku: "A", nome: "a", quantidade: 3, minimo: 2 }];
darBaixa(e, "A", 10);
if (e[0].quantidade < 0) throw new Error('A quantidade ficou negativa (' + e[0].quantidade + '). Decida o que fazer quando falta estoque, mas negativo nao pode.');`,
        },
        {
          description: 'SKU inexistente nao quebra',
          assertion: `const e = [{ sku: "A", nome: "a", quantidade: 3, minimo: 2 }];
try { darBaixa(e, "NAO-EXISTE", 1); } catch (err) { throw new Error('Dar baixa num SKU inexistente quebrou: ' + err.message); }`,
          hidden: true,
        },
      ],
    },
    {
      id: 'cp-est-repor',
      title: 'Repor estoque',
      description: 'repor devolve unidades ao produto.',
      tests: [
        {
          description: 'A funcao repor existe',
          assertion: `if (typeof repor !== 'function') throw new Error("Crie a funcao 'repor(estoque, sku, quantidade)'.");`,
        },
        {
          description: 'Aumenta a quantidade',
          assertion: `const e = [{ sku: "A", nome: "a", quantidade: 4, minimo: 2 }];
repor(e, "A", 6);
if (e[0].quantidade !== 10) throw new Error('Repondo 6 em 4, a quantidade deveria ser 10, mas ficou ' + e[0].quantidade + '.');`,
        },
      ],
    },
    {
      id: 'cp-est-minimo',
      title: 'Produtos abaixo do minimo',
      description: 'abaixoDoMinimo lista quem precisa de reposicao, incluindo quem esta zerado.',
      tests: [
        {
          description: 'A funcao abaixoDoMinimo existe',
          assertion: `if (typeof abaixoDoMinimo !== 'function') throw new Error("Crie a funcao 'abaixoDoMinimo(estoque)'.");`,
        },
        {
          description: 'Inclui abaixo do minimo e exclui quem esta acima',
          assertion: `const e = [
  { sku: "OK", nome: "ok", quantidade: 50, minimo: 10 },
  { sku: "BAIXO", nome: "baixo", quantidade: 3, minimo: 10 },
];
const r = abaixoDoMinimo(e);
if (!Array.isArray(r)) throw new Error('Deveria devolver um array, mas devolveu ' + typeof r + '.');
const skus = r.map(p => p.sku);
if (!skus.includes("BAIXO")) throw new Error('O produto com 3 unidades e minimo 10 deveria estar na lista.');
if (skus.includes("OK")) throw new Error('O produto com 50 unidades e minimo 10 nao deveria estar na lista.');`,
        },
        {
          description: 'Produto zerado tambem entra',
          assertion: `const e = [{ sku: "ZERO", nome: "zero", quantidade: 0, minimo: 5 }];
if (abaixoDoMinimo(e).length !== 1) throw new Error('Produto com quantidade zero precisa de reposicao e deveria estar na lista.');`,
          hidden: true,
        },
      ],
    },
    {
      id: 'cp-est-relatorio',
      title: 'Relatorio',
      description: 'relatorio devolve totalItens, produtosEmFalta e produtosCriticos.',
      tests: [
        {
          description: 'A funcao relatorio existe',
          assertion: `if (typeof relatorio !== 'function') throw new Error("Crie a funcao 'relatorio(estoque)'.");`,
        },
        {
          description: 'Traz os tres campos',
          assertion: `const e = [
  { sku: "A", nome: "a", quantidade: 10, minimo: 2 },
  { sku: "B", nome: "b", quantidade: 0, minimo: 5 },
];
const r = relatorio(e);
if (!r || typeof r !== 'object') throw new Error('relatorio deveria devolver um objeto.');
for (const campo of ['totalItens', 'produtosEmFalta', 'produtosCriticos']) {
  if (r[campo] === undefined) throw new Error('Faltou o campo ' + campo + ' no relatorio.');
}`,
        },
      ],
    },
  ],
  referenceSolution: `function achar(estoque, sku) {
  return estoque.find(p => p.sku === sku);
}

function darBaixa(estoque, sku, quantidade) {
  const produto = achar(estoque, sku);
  if (!produto) return false;
  if (quantidade <= 0) return false;

  // Decisao documentada: vende o que houver, nunca deixa negativo.
  produto.quantidade = Math.max(0, produto.quantidade - quantidade);
  return true;
}

function repor(estoque, sku, quantidade) {
  const produto = achar(estoque, sku);
  if (!produto || quantidade <= 0) return false;
  produto.quantidade += quantidade;
  return true;
}

function abaixoDoMinimo(estoque) {
  return estoque.filter(p => p.quantidade < p.minimo);
}

function relatorio(estoque) {
  let totalItens = 0;
  for (const p of estoque) totalItens += p.quantidade;

  return {
    totalItens,
    produtosEmFalta: estoque.filter(p => p.quantidade === 0).length,
    produtosCriticos: abaixoDoMinimo(estoque).length,
  };
}`,
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

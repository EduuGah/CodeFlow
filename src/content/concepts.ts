import type { Concept } from './types';

/**
 * Grafo de conceitos (§76/§77). `prerequisites` diz o que precisa vir antes;
 * é isso que permitirá recomendar revisão e montar trilhas sem hardcode.
 */
export const concepts: Concept[] = [
  {
    id: 'variaveis',
    title: 'Variáveis',
    summary: 'Espaços nomeados que guardam valores na memória durante a execução.',
    prerequisites: [],
    tags: ['javascript', 'fundamentos'],
  },
  {
    id: 'tipos-de-dados',
    title: 'Tipos de dados',
    summary: 'Números, textos e booleanos: o que cada valor representa e como se comporta.',
    prerequisites: ['variaveis'],
    tags: ['javascript', 'fundamentos'],
  },
  {
    id: 'operadores',
    title: 'Operadores',
    summary: 'Aritméticos, de comparação e lógicos — como combinar e comparar valores.',
    prerequisites: ['tipos-de-dados'],
    tags: ['javascript', 'fundamentos'],
  },
  {
    id: 'condicoes',
    title: 'Condições',
    summary: 'Executar caminhos diferentes conforme uma expressão seja verdadeira ou falsa.',
    prerequisites: ['operadores'],
    tags: ['javascript', 'logica'],
  },
  {
    id: 'funcoes',
    title: 'Funções',
    summary: 'Blocos de código nomeados que recebem entradas e devolvem um resultado.',
    prerequisites: ['variaveis'],
    tags: ['javascript', 'fundamentos'],
  },
];

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
  {
    id: 'loops',
    title: 'Estruturas de repetição',
    summary: 'Repetir instruções enquanto uma condição continuar verdadeira, sem duplicar código.',
    prerequisites: ['condicoes'],
    tags: ['javascript', 'logica'],
  },
  {
    id: 'arrays',
    title: 'Arrays',
    summary: 'Listas ordenadas de valores, acessadas por índice e percorridas com repetição.',
    prerequisites: ['variaveis', 'loops'],
    tags: ['javascript', 'estruturas-de-dados'],
  },
  {
    id: 'depuracao',
    title: 'Depuração',
    summary: 'Ler a mensagem de erro, formular hipótese e testar até encontrar a causa.',
    prerequisites: ['variaveis'],
    tags: ['javascript', 'debugging'],
  },
  {
    id: 'objetos',
    title: 'Objetos',
    summary: 'Agrupar dados relacionados em pares de chave e valor, acessados por nome.',
    prerequisites: ['variaveis', 'arrays'],
    tags: ['javascript', 'estruturas-de-dados'],
  },
  {
    id: 'strings',
    title: 'Textos',
    summary: 'Limpar, validar e formatar o texto que chega de fora do programa.',
    prerequisites: ['tipos-de-dados'],
    tags: ['javascript', 'fundamentos'],
  },
  {
    id: 'decomposicao',
    title: 'Decomposição',
    summary: 'Quebrar um problema grande em passos pequenos e verificáveis um a um.',
    prerequisites: [],
    tags: ['logica', 'resolucao-de-problemas'],
  },
  {
    id: 'casos-extremos',
    title: 'Casos extremos',
    summary: 'As entradas de borda — vazio, limite exato, negativo — que quebram o caminho feliz.',
    prerequisites: ['condicoes'],
    tags: ['logica', 'qualidade'],
  },
  {
    id: 'simulacao',
    title: 'Simulação de execução',
    summary: 'Acompanhar linha a linha o estado das variáveis para prever o resultado.',
    prerequisites: ['loops'],
    tags: ['logica', 'debugging'],
  },
];

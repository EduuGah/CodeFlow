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
  {
    id: 'escopo',
    title: 'Escopo',
    summary: 'Onde cada nome existe, e por que uma variável some fora do bloco onde nasceu.',
    prerequisites: ['variaveis', 'funcoes'],
    tags: ['javascript', 'fundamentos'],
  },
  {
    id: 'closures',
    title: 'Closures',
    summary: 'Uma função que lembra do escopo onde foi criada, mesmo depois que ele terminou.',
    prerequisites: ['escopo', 'funcoes'],
    tags: ['javascript', 'intermediario'],
  },
  {
    id: 'assincronia',
    title: 'Código que espera',
    summary: 'Operações que não terminam na hora, e como o programa continua enquanto elas rodam.',
    prerequisites: ['funcoes'],
    tags: ['javascript', 'intermediario'],
  },
  {
    id: 'promises',
    title: 'Promises',
    summary: 'Um valor que ainda não chegou, com um lugar definido para o sucesso e para a falha.',
    prerequisites: ['assincronia'],
    tags: ['javascript', 'intermediario'],
  },
  {
    id: 'json',
    title: 'JSON',
    summary: 'O formato de texto que carrega dados entre programas, e a fronteira onde eles viram objetos.',
    prerequisites: ['objetos', 'strings'],
    tags: ['javascript', 'dados'],
  },
  {
    id: 'imutabilidade',
    title: 'Imutabilidade',
    summary: 'Criar um valor novo em vez de alterar o existente, e por que isso evita bugs à distância.',
    prerequisites: ['arrays', 'objetos'],
    tags: ['javascript', 'intermediario'],
  },
  {
    id: 'datas',
    title: 'Datas',
    summary: 'Representar instantes, e os enganos de fuso e de mês que quase todo mundo comete.',
    prerequisites: ['tipos-de-dados'],
    tags: ['javascript', 'dados'],
  },
  {
    id: 'expressoes-regulares',
    title: 'Expressões regulares',
    summary: 'Descrever um padrão de texto para buscar, validar e extrair.',
    prerequisites: ['strings'],
    tags: ['javascript', 'intermediario'],
  },
  {
    id: 'cliente-servidor',
    title: 'Cliente e servidor',
    summary:
      'Os dois lugares onde o código de uma aplicação web roda, e o que cada um pode e não pode fazer.',
    prerequisites: ['assincronia'],
    tags: ['web', 'fundamentos'],
  },
  {
    id: 'http',
    title: 'HTTP',
    summary: 'O formato de um pedido e de uma resposta: método, caminho, cabeçalhos, corpo e status.',
    prerequisites: ['cliente-servidor'],
    tags: ['web', 'fundamentos'],
  },
  {
    id: 'rest',
    title: 'REST',
    summary: 'Desenhar endereços e métodos que descrevem recursos, em vez de ações avulsas.',
    prerequisites: ['http'],
    tags: ['web', 'intermediario'],
  },
  {
    id: 'autenticacao',
    title: 'Autenticação e autorização',
    summary: 'Provar quem é quem, e decidir o que cada um pode — sempre do lado que ninguém controla.',
    prerequisites: ['http'],
    tags: ['web', 'seguranca'],
  },
  {
    id: 'cors',
    title: 'CORS e origem',
    summary:
      'A regra do navegador que separa sites por origem, e por que a correção fica no servidor.',
    prerequisites: ['http'],
    tags: ['web', 'seguranca'],
  },
  {
    id: 'seguranca-web',
    title: 'Segurança na web',
    summary: 'Não confiar no cliente, escapar o que vem de fora, e nunca guardar segredo no navegador.',
    prerequisites: ['http'],
    tags: ['web', 'seguranca'],
  },
  {
    id: 'html',
    title: 'HTML semântico',
    summary:
      'A estrutura de uma página dita com as tags que carregam significado: regiões, títulos em hierarquia, listas.',
    // Sem pré-requisito de propósito: HTML não depende de JavaScript, e a
    // trilha da página pode ser a primeira de quem chega pelo visual.
    prerequisites: [],
    tags: ['pagina', 'fundamentos'],
  },
  {
    id: 'css-caixa',
    title: 'O modelo de caixa',
    summary:
      'Conteúdo, padding, borda e margem; box-sizing; bloco, inline e inline-block; margens que se fundem.',
    prerequisites: ['html'],
    tags: ['pagina', 'css'],
  },
  {
    id: 'css-flexbox',
    title: 'Flexbox',
    summary:
      'Itens lado a lado: contêiner e itens, os dois eixos, justify-content, align-items, gap, flex-wrap e flex.',
    prerequisites: ['css-caixa'],
    tags: ['pagina', 'css'],
  },
  {
    id: 'css-grid',
    title: 'Grid',
    summary:
      'Layout em duas dimensões: colunas com fr e repeat, itens espalhados com grid-column, a página desenhada com grid-template-areas.',
    prerequisites: ['css-flexbox'],
    tags: ['pagina', 'css'],
  },
  {
    id: 'css-responsivo',
    title: 'Responsivo',
    summary:
      'Unidades fluidas, max-width, a meta viewport, e media queries mobile-first com min-width onde o conteúdo pede.',
    prerequisites: ['css-grid'],
    tags: ['pagina', 'css'],
  },
  {
    id: 'css-tipografia',
    title: 'Tipografia',
    summary:
      'Lista de fontes, tamanho em rem, entrelinha sem unidade, medida em ch, e uma escala de títulos com saltos claros.',
    prerequisites: ['css-caixa'],
    tags: ['pagina', 'css'],
  },
  {
    id: 'css-cores',
    title: 'Cores',
    summary:
      'Formatos de cor, uma paleta de papéis em variáveis de CSS, contraste de 4.5:1, e cor nunca como único sinal.',
    prerequisites: ['css-caixa'],
    tags: ['pagina', 'css', 'acessibilidade'],
  },
  {
    id: 'css-estados',
    title: 'Estados e pseudo-classes',
    summary:
      ':hover, :focus-visible, :active, :disabled, :checked; posição com :nth-child, :last-child, :not; e ::before/::after.',
    prerequisites: ['css-cores'],
    tags: ['pagina', 'css', 'acessibilidade'],
  },
  {
    id: 'css-movimento',
    title: 'Movimento',
    summary:
      'transition no repouso, transform e opacity como as propriedades baratas, @keyframes, e prefers-reduced-motion.',
    prerequisites: ['css-estados'],
    tags: ['pagina', 'css', 'acessibilidade'],
  },
  {
    id: 'css-moderno',
    title: 'CSS moderno',
    summary:
      'clamp(), min(), propriedades lógicas, :is(), aspect-ratio, gap em tudo e o reset de cinco linhas.',
    prerequisites: ['css-responsivo', 'css-tipografia'],
    tags: ['pagina', 'css'],
  },
  {
    id: 'dom',
    title: 'O DOM',
    summary:
      'A árvore de objetos que o navegador monta do HTML: querySelector, textContent, dataset, e quando o script roda.',
    prerequisites: ['html', 'funcoes', 'arrays'],
    tags: ['pagina', 'dom'],
  },
  {
    id: 'dom-criar',
    title: 'Criar e remover elementos',
    summary:
      'createElement, textContent, append e remove; a função desenhar(dados) que limpa e reconstrói a tela a partir dos dados.',
    prerequisites: ['dom'],
    tags: ['pagina', 'dom'],
  },
  {
    id: 'dom-classes',
    title: 'Classes e atributos',
    summary:
      'classList (add, remove, toggle com condição, contains), hidden, setAttribute para aria-*, e style só para valores calculados.',
    prerequisites: ['dom', 'css-estados'],
    tags: ['pagina', 'dom', 'acessibilidade'],
  },
  {
    id: 'dom-eventos',
    title: 'Eventos',
    summary:
      'addEventListener, o objeto do evento (target, key, preventDefault), click, input e keydown, e estado na variável com a tela redesenhada.',
    prerequisites: ['dom-criar', 'assincronia'],
    tags: ['pagina', 'dom'],
  },
  {
    id: 'dom-delegacao',
    title: 'Delegação de eventos',
    summary:
      'Os eventos sobem: um ouvinte no pai para todos os filhos, closest para achar o alvo, data-acao e data-id para agir.',
    prerequisites: ['dom-eventos'],
    tags: ['pagina', 'dom'],
  },
];

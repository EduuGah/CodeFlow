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
    id: 'estruturas-big-o',
    title: 'Big O: comparar soluções',
    summary:
      'O(1) não muda com o tamanho da entrada; O(n) cresce junto (um loop simples); O(n²) cresce com o quadrado (um loop dentro de outro, cada um sobre a mesma entrada); O(log n) cresce bem mais devagar, cortando a entrada pela metade a cada passo. Big O descreve como o tempo cresce, não quantos milissegundos algo leva.',
    prerequisites: ['loops', 'arrays'],
    tags: ['estruturas-de-dados', 'algoritmos'],
  },
  {
    id: 'estruturas-recursao',
    title: 'Recursão',
    summary:
      'Uma função que chama a si mesma, sempre com um problema menor, até um caso base que para a cadeia sem chamar de novo — sem caso base, ou sem o problema encolher a cada chamada, a recursão nunca termina. Cada chamada empilha na pilha de chamadas; uma cadeia funda demais estoura essa pilha.',
    prerequisites: ['estruturas-big-o', 'funcoes'],
    tags: ['estruturas-de-dados', 'algoritmos'],
  },
  {
    id: 'estruturas-pilha-fila',
    title: 'Pilha e fila',
    summary:
      'Pilha (LIFO): o último que entra é o primeiro que sai — push/pop no mesmo topo, como o histórico de "voltar" do navegador. Fila (FIFO): o primeiro que entra é o primeiro que sai — entra num lado, sai no outro, como uma fila de atendimento. As duas são um array usado com uma disciplina específica, não uma estrutura nova da linguagem.',
    prerequisites: ['arrays'],
    tags: ['estruturas-de-dados'],
  },
  {
    id: 'estruturas-busca-e-mapas',
    title: 'Busca binária, Set e Map',
    summary:
      'Busca binária corta pela metade a cada passo — O(log n) — mas só funciona em array ordenado. Set guarda valores únicos, sem posição; Map é um par chave-valor com qualquer tipo de chave (um objeto comum só aceita string ou symbol) e mantém a ordem de inserção — os dois com busca em O(1) na prática, contra O(n) de percorrer um array procurando.',
    prerequisites: ['estruturas-big-o', 'objetos'],
    tags: ['estruturas-de-dados'],
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
  {
    id: 'dom-formularios',
    title: 'Formulários',
    summary:
      'label, name, type e required; o evento submit com preventDefault; FormData; mensagens de erro que ajudam; um envio só.',
    prerequisites: ['dom-eventos'],
    tags: ['pagina', 'dom', 'acessibilidade'],
  },
  {
    id: 'dom-armazenamento',
    title: 'Armazenamento local',
    summary:
      'localStorage com JSON, o par carregar/salvar com try/catch, o null da primeira visita, e o que nunca se guarda ali.',
    prerequisites: ['dom-eventos', 'json'],
    tags: ['pagina', 'dom', 'seguranca'],
  },
  {
    id: 'dom-fetch',
    title: 'Buscar e desenhar',
    summary:
      'fetch, resposta.ok, resposta.json(); os três estados da tela — carregando, erro, dados —; e a resposta antiga que não pode sobrescrever a nova.',
    prerequisites: ['dom-criar', 'promises', 'http'],
    tags: ['pagina', 'dom', 'web'],
  },
  {
    id: 'ui-hierarquia',
    title: 'Hierarquia visual',
    summary:
      'Uma ação principal por tela, títulos em escala, perto é junto, espaço no lugar de bordas, e o teste do olho semicerrado.',
    prerequisites: ['css-tipografia', 'css-cores'],
    tags: ['pagina', 'ui'],
  },
  {
    id: 'ui-texto',
    title: 'Texto legível',
    summary:
      'Alinhado ao início, parágrafos curtos separados por margem, listas para enumerações, números tabulares à direita, maiúsculas só em rótulos.',
    prerequisites: ['css-tipografia', 'ui-hierarquia'],
    tags: ['pagina', 'ui'],
  },
  {
    id: 'ui-cor',
    title: 'Cor na interface',
    summary:
      'Cor de estado como vocabulário, sempre com um segundo sinal; contraste nos lugares que ninguém mede; tema escuro com a marca clareada.',
    prerequisites: ['css-cores', 'ui-hierarquia'],
    tags: ['pagina', 'ui', 'acessibilidade'],
  },
  {
    id: 'ui-estados-tela',
    title: 'Os estados da tela',
    summary:
      'Carregando com esqueleto, vazio com um caminho, erro com o que houve e o que fazer, sucesso breve, e role=status para as mudanças.',
    prerequisites: ['dom-fetch', 'ui-hierarquia'],
    tags: ['pagina', 'ui', 'acessibilidade'],
  },
  {
    id: 'ui-teclado',
    title: 'Acessível pelo teclado',
    summary:
      'O elemento certo já é acessível; a ordem do Tab é a do HTML; tabindex só 0 ou -1; aria-label para ícones; e o foco com destino depois de cada ação.',
    prerequisites: ['dom-delegacao', 'css-estados'],
    tags: ['pagina', 'ui', 'acessibilidade'],
  },
  {
    id: 'ui-formularios',
    title: 'Formulários que ajudam',
    summary:
      'Pedir menos; uma coluna com rótulo em cima; type, inputmode e autocomplete; validar na hora e no lugar certos; nunca apagar o que foi digitado.',
    prerequisites: ['dom-formularios', 'ui-hierarquia'],
    tags: ['pagina', 'ui', 'acessibilidade'],
  },
  {
    id: 'ui-texto-interface',
    title: 'Escrever a interface',
    summary:
      'Botões com verbo e objeto, confirmações que nomeiam a consequência, erros com o que houve e o que fazer, títulos que dizem onde, e uma palavra para cada coisa.',
    prerequisites: ['ui-hierarquia', 'ui-estados-tela'],
    tags: ['pagina', 'ui'],
  },
  {
    id: 'ui-polegar',
    title: 'Feito para a mão',
    summary:
      'Alvos de 44px com espaço entre eles, a ação principal numa barra fixa no rodapé, campos com 16px, :active respondendo ao toque, e nada que só exista no hover ou no arrastar.',
    prerequisites: ['ui-estados-tela', 'ui-formularios', 'css-responsivo'],
    tags: ['pagina', 'ui', 'acessibilidade'],
  },
  {
    id: 'ts-por-que',
    title: 'Por que tipar',
    summary:
      'Anotações de tipo em parâmetros, variáveis e retornos; o compilador recusa antes de rodar e apaga os tipos depois; any desliga a verificação.',
    prerequisites: ['funcoes', 'tipos-de-dados'],
    tags: ['typescript'],
  },
  {
    id: 'ts-inferencia',
    title: 'Inferência',
    summary:
      'O compilador deduz o tipo do valor; anotar só a fronteira (parâmetros), a lista vazia e a variável sem valor; const guarda o valor exato, let a categoria.',
    prerequisites: ['ts-por-que'],
    tags: ['typescript'],
  },
  {
    id: 'ts-interfaces',
    title: 'Interfaces',
    summary:
      'A forma de um objeto: propriedades tipadas, opcionais com ?, readonly, formas aninhadas e listas; objeto literal não pode ter propriedade a mais; interface como contrato de função.',
    prerequisites: ['ts-inferencia', 'objetos'],
    tags: ['typescript'],
  },
  {
    id: 'ts-estreitar',
    title: 'Estreitar',
    summary:
      'Uniões (A | B, literais, T | undefined) e o estreitamento por typeof, verificação de undefined, ?. e ??, e discriminante em uniões de objetos; type dá nome à união.',
    prerequisites: ['ts-interfaces'],
    tags: ['typescript'],
  },
  {
    id: 'ts-funcoes',
    title: 'Funções tipadas',
    summary:
      'Parâmetro opcional e valor padrão, retorno anotado e void, o tipo de uma função (a: A) => B como valor, e o retorno honesto com | undefined.',
    prerequisites: ['ts-estreitar', 'funcoes'],
    tags: ['typescript'],
  },
  {
    id: 'ts-genericos',
    title: 'Genéricos',
    summary:
      'Parâmetro de tipo <T> em funções e interfaces, deduzido a cada chamada e preservado até a saída; restrição com extends; Array<T>, Promise<T>, Map<K, V>; tuplas.',
    prerequisites: ['ts-funcoes'],
    tags: ['typescript'],
  },
  {
    id: 'ts-utilitarios',
    title: 'Tipos utilitários',
    summary:
      'Derivar um tipo de outro: Partial, Pick, Omit, Readonly, Record e keyof; typeof em posição de tipo; uma forma canônica e o resto derivado dela.',
    prerequisites: ['ts-genericos'],
    tags: ['typescript'],
  },
  {
    id: 'ts-api',
    title: 'Tipar o que vem de fora',
    summary:
      'unknown na entrada, guarda de tipo (valor is T) que confere em execução na fronteira, e o tipo só depois dela; as como asserção que não confere.',
    prerequisites: ['ts-estreitar', 'ts-interfaces', 'json'],
    tags: ['typescript'],
  },
  {
    id: 'ts-erros',
    title: 'Erros do compilador',
    summary:
      'A anatomia da mensagem (onde, código, o que veio, o que era esperado), a cadeia lida de baixo para cima, a cascata resolvida na causa, e por que as e any calam sem consertar.',
    prerequisites: ['ts-por-que', 'depuracao'],
    tags: ['typescript'],
  },
  {
    id: 'ts-quando',
    title: 'Quando não tipar',
    summary:
      'O tipo que compra algo (erro antes de rodar, documentação, autocompletar) e o que é ruído; tipar a fronteira, a forma compartilhada e os estados; migrar um arquivo por vez, estrito, com any só nas costuras e com prazo.',
    prerequisites: ['ts-utilitarios', 'ts-api', 'ts-erros'],
    tags: ['typescript'],
  },
  {
    id: 'react-componentes',
    title: 'Componentes',
    summary:
      'Uma função que recebe props e devolve JSX; JSX vira React.createElement; nome com maiúscula, uma raiz ou fragmento, className; compor componentes pequenos.',
    prerequisites: ['dom-criar', 'ts-interfaces'],
    tags: ['react'],
  },
  {
    id: 'react-estado',
    title: 'Estado',
    summary:
      'useState: o valor e a função que o troca; trocar redesenha; manipulador é função; nunca mutar, substituir; set com função quando depende do anterior; não guardar o derivado.',
    prerequisites: ['react-componentes', 'imutabilidade'],
    tags: ['react'],
  },
  {
    id: 'react-listas',
    title: 'Listas',
    summary:
      'map com key estável (nunca o índice numa lista que muda); acrescentar, remover e alterar como lista nova; um componente por item, com a função de remover como prop; filtrar e ordenar derivados na renderização.',
    prerequisites: ['react-estado'],
    tags: ['react'],
  },
  {
    id: 'react-formularios',
    title: 'Formulários em React',
    summary:
      'Campo controlado (value + onChange), onSubmit com preventDefault, erro derivado mostrado depois do onBlur, envio desabilitado enquanto inválido, muitos campos num objeto com um onChange por name.',
    prerequisites: ['react-estado', 'dom-formularios', 'ui-formularios'],
    tags: ['react'],
  },
  {
    id: 'react-efeitos',
    title: 'Efeitos',
    summary:
      'useEffect roda depois da tela estar no DOM, quando a lista de dependências muda; tudo o que lê vai na lista; o que cria, a limpeza desfaz; derivado não é efeito, e resposta a evento também não.',
    prerequisites: ['react-estado', 'assincronia'],
    tags: ['react'],
  },
  {
    id: 'react-dados',
    title: 'Buscar dados em React',
    summary:
      'A busca dentro do efeito com a função async chamada por void; a tela como união carregando/erro/pronto; ok conferido; a bandeira ativo que descarta a resposta atrasada; refazer por parâmetro; tentar de novo.',
    prerequisites: ['react-efeitos', 'dom-fetch', 'ts-estreitar'],
    tags: ['react'],
  },
  {
    id: 'react-erros',
    title: 'Estados de erro em React',
    summary:
      'O vazio como estado; a ação que falha com botão que volta (finally), texto que fica e erro local; um estado por parte da tela; catch recebe unknown; a mensagem que diz o que fazer.',
    prerequisites: ['react-dados', 'ui-estados-tela', 'ui-texto-interface'],
    tags: ['react'],
  },
  {
    id: 'react-composicao',
    title: 'Composição',
    summary:
      'children como moldura; dados descem por props e eventos sobem por funções; o componente controlado pelo pai; subir o estado para o pai comum, nunca duplicar; cortar por responsabilidade.',
    prerequisites: ['react-estado', 'react-listas'],
    tags: ['react'],
  },
  {
    id: 'react-contexto',
    title: 'Contexto',
    summary:
      'createContext, Provider e useContext para o dado de muitos em profundidades diferentes que muda pouco; valor e funções juntos; um hook que esconde o canal; quando é exagero.',
    prerequisites: ['react-composicao'],
    tags: ['react'],
  },
  {
    id: 'react-hooks',
    title: 'Hooks próprios',
    summary:
      'Uma função useAlgo que chama hooks: compartilha lógica, não estado; as duas regras pela ordem de chamada; quando extrair; devolver ações com nome ou uma tupla como o useState.',
    prerequisites: ['react-efeitos', 'react-contexto', 'ts-genericos'],
    tags: ['react'],
  },
  {
    id: 'react-rotas',
    title: 'Rotas',
    summary:
      'A rota como estado e uma tela por if; o link que é <a href> com preventDefault e aria-current; parâmetros lidos do caminho, o específico antes do geral, a tela de não encontrado; o que um roteador de verdade acrescenta.',
    prerequisites: ['react-composicao', 'ui-teclado'],
    tags: ['react'],
  },
  {
    id: 'react-render',
    title: 'Re-render',
    summary:
      'Filho renderiza com o pai e isso é barato; quando pesa e foi medido: useMemo lembra um valor, memo pula o filho, useCallback mantém a função — todos por identidade; key remonta; não otimizar sem medir.',
    prerequisites: ['react-hooks', 'react-listas'],
    tags: ['react'],
  },
  {
    id: 'react-testes',
    title: 'Acessível e testável',
    summary:
      'O teste acha as coisas como a pessoa (papel, rótulo, texto, alert/status), e o que ele acha o leitor de tela anuncia; testar comportamento, nunca implementação; o DOM no efeito ou pelo ref.',
    prerequisites: ['react-formularios', 'ui-teclado'],
    tags: ['react'],
  },
  {
    id: 'react-projeto',
    title: 'Projeto em React',
    summary:
      'O estado desenhado antes da tela (e o que deriva, fora dele); componentes por responsabilidade; fatias verticais que deixam o aplicativo funcionando; persistir com JSON e uma guarda; o que pronto significa.',
    prerequisites: ['react-rotas', 'react-testes', 'decomposicao'],
    tags: ['react'],
  },
  {
    id: 'sql-tabelas',
    title: 'Tabelas e SELECT',
    summary:
      'O banco relacional: tabela, linha, coluna, tipo e chave primária; SELECT colunas FROM tabela, o asterisco e o LIMIT; a correção por linhas devolvidas.',
    prerequisites: ['cliente-servidor'],
    tags: ['sql'],
  },
  {
    id: 'sql-where',
    title: 'WHERE',
    summary:
      'Filtrar linhas: comparações (= e <>, texto entre aspas simples), AND/OR/NOT com parênteses, IN e BETWEEN, LIKE com % e _, e o NULL que não é igual a nada — IS NULL.',
    prerequisites: ['sql-tabelas'],
    tags: ['sql'],
  },
  {
    id: 'sql-ordenar',
    title: 'ORDER BY e expressões',
    summary:
      'Ordenar por uma ou mais colunas, ASC/DESC, LIMIT com sentido; a ordem fixa das cláusulas; expressões no SELECT (aritmética, ROUND, ||), AS e o apelido no ORDER BY; DISTINCT.',
    prerequisites: ['sql-where'],
    tags: ['sql'],
  },
  {
    id: 'sql-join',
    title: 'JOIN',
    summary:
      'Chave estrangeira e INNER JOIN … ON; apelidos de tabela e a coluna ambígua; três ou mais tabelas seguindo as chaves; o produto cartesiano do JOIN sem ON; LEFT JOIN com IS NULL para achar quem não tem par.',
    prerequisites: ['sql-where'],
    tags: ['sql'],
  },
  {
    id: 'sql-agregacao',
    title: 'Agregação',
    summary:
      'COUNT, SUM, AVG, MIN, MAX e o NULL que elas ignoram; GROUP BY e a regra do SELECT; WHERE antes de agrupar, HAVING depois; agregação sobre JOIN e o COUNT(coluna) no LEFT JOIN.',
    prerequisites: ['sql-join'],
    tags: ['sql'],
  },
  {
    id: 'sql-subconsultas',
    title: 'Subconsultas e WITH',
    summary:
      'Uma consulta dentro da outra: como valor, como lista (IN, e a armadilha do NOT IN com NULL), correlacionada; WITH para nomear etapas e ler de cima para baixo.',
    prerequisites: ['sql-agregacao'],
    tags: ['sql'],
  },
  {
    id: 'sql-escrita',
    title: 'INSERT, UPDATE e DELETE',
    summary:
      'Inserir com a lista de colunas; alterar com SET e o WHERE que decide o alcance (sem ele, tudo); apagar respeitando a chave estrangeira; BEGIN/COMMIT/ROLLBACK para várias mudanças virarem uma.',
    prerequisites: ['sql-join'],
    tags: ['sql'],
  },
  {
    id: 'sql-modelar',
    title: 'CREATE TABLE e restrições',
    summary:
      'Tipos do SQLite; PRIMARY KEY, NOT NULL, UNIQUE, DEFAULT, CHECK e REFERENCES como regras que o banco impõe a todo programa; ON DELETE CASCADE só para o que não existe sem o pai; ALTER TABLE ADD COLUMN com DEFAULT.',
    prerequisites: ['sql-escrita'],
    tags: ['sql'],
  },
  {
    id: 'sql-normalizacao',
    title: 'Normalização',
    summary:
      'As três anomalias da repetição; cada fato num lugar só, e a coluna que fala da chave inteira; um-para-muitos e a tabela de ligação com chave composta; migrar com INSERT … SELECT DISTINCT; repetir de propósito quando são fatos diferentes no tempo.',
    prerequisites: ['sql-modelar'],
    tags: ['sql'],
  },
  {
    id: 'sql-indices',
    title: 'Índices',
    summary:
      'Varredura contra busca; o que um índice é e o que custa em escrita; a chave primária já indexada e a estrangeira não; EXPLAIN QUERY PLAN (SCAN e SEARCH); índice composto e a ordem das colunas; o que impede o uso do índice; índice único.',
    prerequisites: ['sql-modelar'],
    tags: ['sql'],
  },
  {
    id: 'node-modulos',
    title: 'Node e módulos',
    summary:
      'O JavaScript fora do navegador: sem window nem document, com process e arquivos; module.exports e require; process.env; o mesmo código que roda no Node de verdade, rodando aqui num Node de mentira.',
    prerequisites: ['cliente-servidor', 'funcoes', 'objetos'],
    tags: ['node'],
  },
  {
    id: 'node-servidor',
    title: 'Servidor HTTP com Express',
    summary:
      'O que um servidor faz: escuta numa porta, recebe pedidos, responde; express(), app.get, req e res, res.send e res.json, app.listen; o pedir() dos exercícios.',
    prerequisites: ['node-modulos', 'http'],
    tags: ['node'],
  },
  {
    id: 'node-rotas',
    title: 'Rotas e parâmetros',
    summary:
      'Uma rota por recurso; :parametro em req.params, ?chave=valor em req.query; a ordem das rotas; 404 para o que não existe; res.status.',
    prerequisites: ['node-servidor', 'rest'],
    tags: ['node'],
  },
  {
    id: 'node-corpo',
    title: 'Corpo, JSON e POST',
    summary:
      'O corpo viaja como texto JSON e express.json() o põe em req.body (antes das rotas); POST cria e responde 201 com o recurso, com o id do servidor; validar o corpo e recusar com 400 e return; ler, validar, guardar, responder.',
    prerequisites: ['node-rotas', 'json'],
    tags: ['node'],
  },
  {
    id: 'node-erros',
    title: 'Status e erros',
    summary:
      'As famílias de status e a pergunta que escolhe (quem consertaria?); 400, 404, 409 e 500; o middleware de erro de quatro parâmetros, por último; next(erro); erro com status; a mensagem interna fica no log; um formato só para toda falha.',
    prerequisites: ['node-corpo', 'http'],
    tags: ['node'],
  },
  {
    id: 'node-middleware',
    title: 'Middleware e autenticação',
    summary:
      'A corrente (req, res, next): responder encerra, next() passa adiante, nenhum dos dois pendura; a ordem de registro; o req que atravessa a corrente; app.use geral, por prefixo e por rota; Authorization: Bearer, req.headers em minúsculas, req.usuario; 401 (quem é?) contra 403 (não pode).',
    prerequisites: ['node-erros', 'autenticacao'],
    tags: ['node'],
  },
  {
    id: 'node-crud',
    title: 'CRUD: PUT, PATCH e DELETE',
    summary:
      'O desenho de um recurso, seis rotas num caminho e o verbo decide; PUT substitui (tudo obrigatório), PATCH altera parte (cada campo validado se veio), DELETE responde 204 sem corpo; alterar campo a campo; splice contra filter com let; idempotência: o estado depois de N pedidos iguais é o de um.',
    prerequisites: ['node-corpo', 'rest'],
    tags: ['node'],
  },
  {
    id: 'node-async',
    title: 'Assincronia no servidor',
    summary:
      'O repositório: funções que devolvem Promises, a forma de todo acesso a banco; rotas async com await em cada acesso; esquecer o await responde {} com 200; await fora de async é erro de sintaxe; o erro da rota async vai ao middleware de erro (Express 5); Promise.all para buscas independentes; a thread é uma só.',
    prerequisites: ['node-crud', 'promises'],
    tags: ['node'],
  },
  {
    id: 'node-config',
    title: 'Configuração e segredos',
    summary:
      'O que muda entre máquinas vem do ambiente: process.env é texto e pode faltar, converter e dar padrão ao que pode ter padrão, falhar cedo sem a chave; o .env fora do Git e o .env.example dentro; um módulo de configuração lido uma vez e congelado; NODE_ENV; segredo não entra em código, commit, log, resposta nem URL, e o que vai ao navegador é público.',
    prerequisites: ['node-modulos', 'seguranca-web'],
    tags: ['node'],
  },
  {
    id: 'node-projeto',
    title: 'Projeto: a API inteira',
    summary:
      'A tabela de recursos antes do código (e a decisão de que todo recurso tem dono); um arquivo por responsabilidade e a regra "quem muda quando isto mudar?"; dependência num sentido só; a ordem de construção em fatias que rodam; o servidor.js que só monta a corrente; a entrega com README e .env.example; CORS quando a página chamar de outra origem.',
    prerequisites: ['node-config', 'node-async', 'node-middleware', 'cors'],
    tags: ['node'],
  },
  {
    id: 'orm-mapeamento',
    title: 'O que um ORM resolve',
    summary:
      'Um ORM mapeia linha de tabela para objeto e objeto para linha, poupando o SQL repetitivo de todo CRUD; o preço é uma camada a mais entre o código e o banco, que pode esconder demais o que de fato roda — inclusive gerar mais consultas do que parece (o problema de N+1).',
    prerequisites: ['sql-modelar', 'node-servidor'],
    tags: ['orm'],
  },
  {
    id: 'orm-schema-migrations',
    title: 'Schema e migrations de um ORM',
    summary:
      'O schema descreve os modelos (e as relações entre eles) numa linguagem própria, não em SQL direto; uma migration nasce da diferença entre o schema novo e o anterior, gerada pela ferramenta, revisada antes de rodar — a mesma disciplina de migration da aula de banco em produção, agora automatizada a partir do schema.',
    prerequisites: ['orm-mapeamento'],
    tags: ['orm'],
  },
  {
    id: 'orm-queries',
    title: 'Queries de um ORM, e o SQL por baixo',
    summary:
      'Métodos como findMany, create, update e delete traduzem para SELECT, INSERT, UPDATE e DELETE — saber essa tradução evita depender do ORM sem entender o que ele está fazendo. Buscar uma lista e, para cada item, buscar algo relacionado num loop gera uma consulta por item (N+1); pedir a relação junto na mesma busca resolve com uma consulta só.',
    prerequisites: ['orm-schema-migrations', 'sql-join'],
    tags: ['orm'],
  },
  {
    id: 'eng-separar',
    title: 'Por que separar',
    summary:
      'O custo do arquivo que faz tudo (achar, mudar, entender, trabalhar em dupla); coesão (as coisas de um arquivo têm a ver umas com as outras) e acoplamento (o quanto uma parte precisa saber da outra); uma razão para mudar por arquivo e por função; dividir com rede de segurança, uma extração por vez; estrutura proporcional ao problema.',
    prerequisites: ['funcoes', 'node-modulos'],
    tags: ['engenharia'],
  },
  {
    id: 'eng-modulos',
    title: 'Módulos como fronteiras',
    summary:
      'A porta é o module.exports e tudo o mais é de dentro; exportar o mínimo, porque cada exportação é um contrato; index.js como porta de uma pasta; dependência num sentido só, e o ciclo que entrega um módulo pela metade; onde passa a fronteira (outro programa reutilizaria? muda por motivo próprio?).',
    prerequisites: ['eng-separar', 'node-modulos'],
    tags: ['engenharia'],
  },
  {
    id: 'eng-pastas',
    title: 'Pastas por responsabilidade',
    summary:
      'Por tipo espalha cada assunto por todas as pastas; por responsabilidade, o que muda junto fica junto; os dois esqueletos (camadas rotas/servicos/dados/util, ou por assunto com a camada dentro); util só para o que não sabe do domínio; o caminho é uma frase de dois níveis; mover muda os require dos dois lados, um arquivo por vez.',
    prerequisites: ['eng-modulos'],
    tags: ['engenharia'],
  },
  {
    id: 'eng-nomes',
    title: 'Nomes',
    summary:
      'Função é verbo, dado é substantivo, booleano é pergunta; sem abreviação fora as universais; o nome é uma promessa (obter não cria); uma palavra por conceito e um idioma só; tamanho proporcional ao alcance; o arquivo se chama pelo que exporta, nunca utils.js; renomear é a mudança mais segura.',
    prerequisites: ['eng-separar'],
    tags: ['engenharia'],
  },
  {
    id: 'eng-funcoes',
    title: 'Funções pequenas',
    summary:
      'Uma coisa só: o nome sem "e", o comentário de seção que é uma função esperando; extrair em cinco passos, e o número de parâmetros como teste do corte; parâmetro em vez de cópia, com a regra dos três; retornos cedo, guardas em ordem de dependência, sem else; até três parâmetros; quando não extrair.',
    prerequisites: ['eng-nomes', 'funcoes'],
    tags: ['engenharia'],
  },
  {
    id: 'eng-erros',
    title: 'Erros como contrato',
    summary:
      'Como a função falha é parte do contrato: não tem devolve null, não dá lança; falhar cedo na entrada com mensagem que diz o quê, onde e o que se esperava; sempre new Error, nunca texto solto; erros com nome (extends Error, super primeiro) para tratar por instanceof; tratar num lugar só, deixar passar no meio, nunca engolir; duas plateias (log e pessoa).',
    prerequisites: ['eng-funcoes', 'node-erros'],
    tags: ['engenharia'],
  },
  {
    id: 'eng-dependencias',
    title: 'Dependências e o package.json',
    summary:
      'Dependência é código de outra pessoa rodando como seu; package.json com scripts, dependencies e devDependencies; semver (major.minor.patch) e o que ^ promete; versão é três números, não texto; o lockfile vai para o Git, npm ci o reproduz, node_modules nunca entra; antes de instalar (dá para escrever? a plataforma já tem? está viva? pesa? licença?); npm outdated e audit em passos pequenos.',
    prerequisites: ['eng-modulos', 'node-config'],
    tags: ['engenharia'],
  },
  {
    id: 'eng-legivel',
    title: 'O projeto que outra pessoa lê',
    summary:
      'Tudo é para quem abre o projeto sem você por perto; o README responde o que é, como rodar, como testar, e desatualizado é pior que nenhum; comentários dizem por quê, nunca o quê, e código comentado se apaga; estilo por formatador e linter; revisão de código como conversa (o porquê, mudanças pequenas, sugestão com motivo, nada pessoal); apagar também é organizar.',
    prerequisites: ['eng-nomes', 'eng-dependencias'],
    tags: ['engenharia'],
  },
  {
    id: 'proj-desenho',
    title: 'O desenho da aplicação',
    summary:
      'As três camadas e o papel de cada uma (a página mostra, a API decide e traduz, o banco guarda e garante); a verdade mora no banco, só a API o toca, a página nunca confia em si mesma; os dados, os recursos da API como contrato, a tela com seus estados; a ordem de construção de baixo para cima; a lista do que "pronto" quer dizer.',
    prerequisites: ['node-projeto', 'eng-pastas', 'sql-modelar', 'dom-fetch'],
    tags: ['projeto'],
  },
  {
    id: 'proj-banco',
    title: 'O banco e o repositório',
    summary:
      'As tabelas se defendem (NOT NULL, CHECK, chave estrangeira) e a migração as cria; o repositório é o único módulo que sabe SQL, uma função async por operação; parâmetros com ? e nunca concatenação (injeção de SQL); o que cada função devolve (lista, ou null, a linha lida de volta, se mexeu); as linhas saem como o banco as tem; testar sem servidor.',
    prerequisites: ['proj-desenho', 'sql-escrita', 'node-async'],
    tags: ['projeto'],
  },
  {
    id: 'proj-api',
    title: 'A API sobre o banco',
    summary:
      'O login lê a sessão no banco (async, por parâmetro, com JOIN); as rotas compõem: ler, validar, repositório, responder; o dono conferido em toda rota com :id (404, depois 403) num lugar só; a tradução paraApi (feita booleano, criadaEm) em toda resposta; o contrato (rotas, status, formato) é o que a página programa contra, e muda com cuidado; CORS na publicação.',
    prerequisites: ['proj-banco', 'node-projeto'],
    tags: ['projeto'],
  },
  {
    id: 'proj-pagina',
    title: 'A página sobre a API',
    summary:
      'A página não sabe nada: mostra o que a API mandou e transforma cada gesto num pedido; o cliente da API num lugar só (token, JSON, erro virando exceção); os quatro estados (carregando, erro, vazio, lista); a lista como função dos dados, com textContent; depois de mudar, recarregar — uma fonte só; o formulário, e marcar e apagar por delegação.',
    prerequisites: ['proj-api', 'dom-fetch', 'dom-formularios', 'dom-delegacao'],
    tags: ['projeto'],
  },
  {
    id: 'proj-fechar',
    title: 'Fechar: testar, documentar, publicar',
    summary:
      'A lista do "pronto" vira pedidos de ponta a ponta (o roteiro de fumaça, que roda depois de publicar); testar o contrato da API; o README do projeto com as decisões; publicar muda o ambiente e a fronteira entre origens (CORS), nunca uma linha de rota, repositório ou tela; o que aparece só em produção.',
    prerequisites: ['proj-pagina', 'eng-legivel', 'eng-dependencias'],
    tags: ['projeto'],
  },
  {
    id: 'testes-por-que',
    title: 'Por que testar',
    summary:
      'O que um teste prova (só os casos que executa) e o que não prova; o custo de não testar contra o custo de escrever e manter; quando não vale a pena; assert(condição, mensagem).',
    prerequisites: ['funcoes'],
    tags: ['testes'],
  },
  {
    id: 'testes-aaa',
    title: 'Arrange, Act, Assert',
    summary:
      'A forma de todo teste: preparar o cenário, agir uma vez, afirmar o resultado; por que separar as três partes ajuda a consertar quando falha; um "act" por teste.',
    prerequisites: ['testes-por-que'],
    tags: ['testes'],
  },
  {
    id: 'testes-comportamento',
    title: 'Um teste por comportamento',
    summary:
      'Dividir uma função com várias regras num teste por regra; testar os limites exatos, não só o meio da faixa; nomes de teste que documentam a regra do negócio, não repetem o código.',
    prerequisites: ['testes-aaa'],
    tags: ['testes'],
  },
  {
    id: 'testes-dubles',
    title: 'Dublês',
    summary:
      'Injeção de dependência: receber por fora o que fala com o mundo externo (e-mail, banco, relógio); o espião como dublê mais comum (vi.fn faz o mesmo pronto); só dependências externas merecem dublê.',
    prerequisites: ['testes-comportamento'],
    tags: ['testes'],
  },
  {
    id: 'testes-servidor',
    title: 'Testando o servidor',
    summary:
      'pedir() como cliente HTTP dos testes; um teste por rota e por caso da rota; o servidor tem estado entre pedidos, por isso os testes rodam em série; testar status e corpo, sempre os dois.',
    prerequisites: ['testes-aaa', 'node-rotas'],
    tags: ['testes'],
  },
  {
    id: 'testes-cobertura',
    title: 'O que não testar',
    summary:
      'Cobertura mede execução, não verificação; é pista de onde não há teste, nunca meta de 100%; vale testar onde há decisão (condições, limites, casos extremos, regras do negócio), vale menos código sem lógica própria.',
    prerequisites: ['testes-comportamento'],
    tags: ['testes'],
  },
  {
    id: 'testes-fragil',
    title: 'Testes frágeis',
    summary:
      'Um teste verifica o comportamento (a porta de fora), nunca a implementação (o como); testes que espiam código-fonte, variáveis internas ou ordem não garantida quebram numa refatoração sem motivo.',
    prerequisites: ['testes-cobertura', 'eng-funcoes'],
    tags: ['testes'],
  },
  {
    id: 'testes-regressao',
    title: 'O teste que pega o bug de ontem',
    summary:
      'O ritual: reproduzir o bug num teste que falha antes de consertar, ver o conserto fazer o teste passar, manter o teste para sempre; a mensagem nomeia a combinação que causou o bug, não um número de chamado.',
    prerequisites: ['testes-fragil'],
    tags: ['testes'],
  },
  {
    id: 'git-commit',
    title: 'O commit como frase',
    summary:
      'Um commit é uma mudança lógica só, com uma razão para existir; resumo no imperativo, até 50 caracteres, sem ponto final; o corpo explica por quê, não o quê — o diff já mostra o quê.',
    prerequisites: ['funcoes'],
    tags: ['git'],
  },
  {
    id: 'git-branch',
    title: 'Uma branch por assunto',
    summary:
      'Uma branch isola um trabalho em andamento da linha principal; nasce da branch atualizada, tem um nome que diz o assunto, vive pouco e morre ao ser incorporada — mais de um assunto por branch mistura revisões.',
    prerequisites: ['git-commit'],
    tags: ['git'],
  },
  {
    id: 'git-pr',
    title: 'Pull request e revisão',
    summary:
      'Um PR propõe incorporar uma branch, com descrição do porquê; revisão é a segunda pessoa que lê antes de ir para todo mundo — pega o que quem escreveu não vê mais; PR pequeno e focado é revisável, PR de 40 arquivos não é.',
    prerequisites: ['git-branch'],
    tags: ['git'],
  },
  {
    id: 'git-conflito',
    title: 'Conflito sem pânico',
    summary:
      'Um conflito nasce quando duas branches mudam a mesma linha de jeitos diferentes; os marcadores `<<<<<<<`, `=======` e `>>>>>>>` mostram as duas versões; resolver é entender as duas intenções e escrever o resultado combinado, nunca escolher às cegas.',
    prerequisites: ['git-branch'],
    tags: ['git'],
  },
  {
    id: 'git-historico',
    title: 'Histórico que conta uma história',
    summary:
      'O histórico é lido por quem vai depurar um bug daqui a um ano — inclusive você; commits "wip" e "correção" não dizem nada; juntar (squash) os passos de um mesmo trabalho antes de incorporar deixa cada commit como uma unidade que faz sentido sozinha.',
    prerequisites: ['git-commit', 'git-pr'],
    tags: ['git'],
  },
  {
    id: 'git-gitignore',
    title: 'O que não entra no repositório',
    summary:
      'Arquivo gerado, segredo e configuração de máquina não são código-fonte e não deveriam ser versionados; `.gitignore` lista padrões que o Git para de rastrear; um segredo já commitado precisa ser trocado, porque tirá-lo do arquivo não apaga o histórico.',
    prerequisites: ['git-commit'],
    tags: ['git'],
  },
  {
    id: 'terminal-shell',
    title: 'O shell e o caminho',
    summary:
      'O shell lê comandos e os roda, sempre a partir de um diretório atual (`pwd`); `cd` muda esse diretório, `ls` lista o que existe; caminho absoluto começa na raiz, relativo parte de onde você está; `.` é o diretório atual, `..` o pai, `~` a casa do usuário.',
    prerequisites: ['funcoes'],
    tags: ['terminal'],
  },
  {
    id: 'terminal-env',
    title: 'Variáveis de ambiente',
    summary:
      'Um valor que vive fora do código, definido pelo shell ou pela plataforma e lido pelo programa (`process.env`); permite o mesmo código rodar diferente em ambientes diferentes, sem editar nada; PATH é a lista de pastas onde o shell procura um comando, na ordem — a primeira que tiver o comando vence.',
    prerequisites: ['terminal-shell'],
    tags: ['terminal'],
  },
  {
    id: 'terminal-scripts',
    title: 'Scripts do package.json na prática',
    summary:
      '`npm run nome` procura `nome` em `scripts` e roda o comando associado; `pre<nome>` e `post<nome>` rodam automaticamente antes e depois, se existirem; `&&` encadeia comandos e para no primeiro que falhar (código de saída diferente de zero); scripts guardam o comando certo uma vez, para todo mundo do projeto usar igual.',
    prerequisites: ['eng-dependencias', 'terminal-env'],
    tags: ['terminal'],
  },
  {
    id: 'terminal-erros',
    title: 'O que ler numa saída de erro',
    summary:
      'Código de saída zero é sucesso, qualquer outro é falha; um stack trace lista de onde o erro foi lançado até quem chamou por cima — a primeira linha do seu próprio código (não de uma biblioteca) é onde procurar; ler a mensagem inteira antes de tentar corrigir, em vez de adivinhar pelo começo dela.',
    prerequisites: ['depuracao', 'terminal-shell'],
    tags: ['terminal'],
  },
  {
    id: 'terminal-fechamento',
    title: 'Diagnosticar um comando que falhou',
    summary:
      'Um diagnóstico de verdade combina as três habilidades: o código de saída diz se falhou, o stack trace aponta onde, e a variável de ambiente ausente costuma ser a causa mais comum e mais rápida de conferir — nessa ordem, uma coisa corrigida por vez.',
    prerequisites: ['terminal-scripts', 'terminal-erros'],
    tags: ['terminal'],
  },
  {
    id: 'deploy-ambientes',
    title: 'Ambientes e build',
    summary:
      'Dev roda com dados de teste e erros detalhados; produção roda com dados reais e some com os detalhes do erro na tela de quem usa. Build é o passo que transforma o código-fonte no que roda de fato — minificado, sem comentários — e roda antes do deploy de propósito: um erro no build pára ali, antes que qualquer pessoa veja.',
    prerequisites: ['node-config'],
    tags: ['deploy'],
  },
  {
    id: 'deploy-segredos',
    title: 'Segredos em produção',
    summary:
      'Um segredo de produção vive no painel do host ou num gerenciador de segredos, nunca no código nem no `.env` commitado. Variável de build (embutida no pacote enviado ao navegador) é pública mesmo minificada; variável lida só pelo servidor em produção nunca chega ao cliente — a diferença entre as duas é a diferença entre exposto e protegido.',
    prerequisites: ['deploy-ambientes'],
    tags: ['deploy'],
  },
  {
    id: 'deploy-publicar',
    title: 'Publicar o frontend e o backend',
    summary:
      'Frontend publicado é arquivo estático (HTML, CSS, JS já compilados) servido por um host de arquivos; backend publicado é um processo que fica de pé, ouvindo a porta que o host atribui em `process.env.PORT` — nunca um número fixo escolhido no código. O host reinicia o processo quando ele cai e guarda o que ele escreve como log.',
    prerequisites: ['deploy-ambientes', 'node-projeto'],
    tags: ['deploy'],
  },
  {
    id: 'deploy-banco-dominio',
    title: 'Banco em produção, domínio e HTTPS',
    summary:
      'Mudar o schema de um banco em produção é uma migration registrada e revisável, nunca um ALTER TABLE digitado direto; dado real pede backup antes de qualquer mudança arriscada. Um domínio existe porque o DNS traduz um nome para o endereço de um servidor; HTTPS cifra o que trafega entre o navegador e ele, com um certificado que a maioria dos hosts hoje emite sozinha.',
    prerequisites: ['deploy-publicar', 'sql-modelar'],
    tags: ['deploy'],
  },
  {
    id: 'py-intro',
    title: 'Python depois de JavaScript',
    summary:
      'Indentação em vez de chaves define o bloco — errar o recuo é erro de sintaxe, não de estilo; `print()` no lugar de `console.log`; tipos dinâmicos como no JavaScript, mas sem coerção implícita entre eles; comentário com `#`; sem `;` no fim da linha; `None` no lugar de `null`/`undefined`, um só.',
    prerequisites: ['variaveis', 'funcoes'],
    tags: ['python'],
  },
  {
    id: 'py-condicoes',
    title: 'Condições e laços em Python',
    summary:
      '`and`/`or`/`not` no lugar de `&&`/`||`/`!`; `for item in colecao` percorre direto, sem índice; `range(inicio, fim, passo)` gera a sequência de números; `while` e `break`/`continue` iguais; valores "falsy" incluem `0`, `""`, `[]`, `None` — mais casos que o JavaScript considera falso.',
    prerequisites: ['py-intro', 'condicoes', 'loops'],
    tags: ['python'],
  },
  {
    id: 'py-funcoes',
    title: 'Funções em Python',
    summary:
      'Parâmetros nomeados (`funcao(nome=valor)`) chamam por nome, em qualquer ordem; valor padrão parecido com JavaScript, mas cuidado com padrão mutável (lista/dicionário) compartilhado entre chamadas; `return a, b` devolve uma tupla — "múltiplos retornos" sem objeto; docstring como primeira linha do corpo documenta a função.',
    prerequisites: ['py-condicoes'],
    tags: ['python'],
  },
  {
    id: 'py-listas',
    title: 'Listas e compreensões',
    summary:
      'Lista é o array do Python: `append`, fatiar com `[a:b]`, `len()`. Compreensão de lista (`[expressao for item in colecao if condicao]`) é o `map`/`filter` do Python, numa linha só — a mesma ideia de transformar uma coleção sem loop explícito.',
    prerequisites: ['py-funcoes'],
    tags: ['python'],
  },
  {
    id: 'py-dicionarios',
    title: 'Dicionários e conjuntos',
    summary:
      '`dict` é o objeto do Python — chave e valor, `dicionario[chave]`, `.get(chave, padrao)` para não lançar; `set` é o `Set` — únicos, sem ordem garantida, união e interseção com `|`/`&`; iterar um dicionário com `.items()` dá chave e valor juntos.',
    prerequisites: ['py-listas'],
    tags: ['python'],
  },
  {
    id: 'py-strings',
    title: 'Strings e f-strings',
    summary:
      'Fatiar com `[a:b]`, como lista; `f"texto {expressao}"` interpola, como o template literal do JavaScript; `split`/`join` — `join` é método da string separadora, não da lista, na ordem trocada em relação ao JavaScript.',
    prerequisites: ['py-listas'],
    tags: ['python'],
  },
  {
    id: 'py-erros',
    title: 'Erros em Python',
    summary:
      '`try/except/finally` no lugar de `try/catch/finally`; `except TipoDoErro as nome` pega só aquele tipo, deixa os outros subirem; `raise` lança, `raise ErroProprio("mensagem")` com uma classe que herda de `Exception` nomeia o erro, como `extends Error` no JavaScript.',
    prerequisites: ['py-funcoes', 'depuracao'],
    tags: ['python'],
  },
  {
    id: 'py-classes',
    title: 'Classes em Python',
    summary:
      '`__init__` é o construtor; `self` é o `this` explícito — todo método o recebe como primeiro parâmetro, por escrito; método é função dentro da classe, chamada com `objeto.metodo()`; uma classe vale a pena quando dados e comportamento andam sempre juntos, não para agrupar funções soltas.',
    prerequisites: ['py-funcoes'],
    tags: ['python'],
  },
  {
    id: 'py-modulos',
    title: 'Módulos e a biblioteca padrão',
    summary:
      '`import modulo` ou `from modulo import nome`, no lugar do `import` do JavaScript; a biblioteca padrão já traz `json` (igual a `JSON.parse`/`stringify`), `datetime` (datas), `math`, `random` — sem precisar instalar nada.',
    prerequisites: ['py-classes'],
    tags: ['python'],
  },
  {
    id: 'py-projeto',
    title: 'Projeto em Python: ler, transformar, escrever',
    summary:
      'Um script comum tem três partes — ler os dados de entrada, transformar com funções puras, produzir a saída — a mesma forma de qualquer programa que processa dados, agora juntando tudo que a trilha ensinou: listas, dicionários, strings, erros.',
    prerequisites: ['py-modulos', 'py-erros'],
    tags: ['python'],
  },
];

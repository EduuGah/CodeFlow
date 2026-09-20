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
];

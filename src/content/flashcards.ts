import type { Flashcard } from './types';

export const flashcards: Flashcard[] = [
  {
    id: 'fc-js-01',
    front: 'O que é uma variável em programação?',
    back: 'Um espaço nomeado na memória onde guardamos um valor (número, texto…) para usar ou alterar depois no código.',
    concepts: ['variaveis'],
  },
  {
    id: 'fc-js-02',
    front: 'Qual a diferença entre "let" e "const" em JavaScript?',
    back: '"let" permite reatribuir o valor depois. "const" cria uma constante: o valor não pode ser trocado após a inicialização.',
    concepts: ['variaveis'],
  },
  {
    id: 'fc-js-03',
    front: 'O que acontece ao reatribuir uma variável declarada com "const"?',
    back: 'O JavaScript lança um TypeError ("Assignment to constant variable") e a execução para, porque constantes são imutáveis após a atribuição.',
    concepts: ['variaveis'],
  },
  {
    id: 'fc-js-04',
    front: 'Por que "2" + 3 resulta em "23" e não em 5?',
    back: 'Quando um dos lados do + é uma string, o JavaScript converte o outro em string e junta os dois. Para somar, converta antes com Number().',
    concepts: ['tipos-de-dados', 'operadores'],
  },
  {
    id: 'fc-js-05',
    front: 'Qual a diferença entre = e === ?',
    back: '"=" atribui um valor a uma variável. "===" compara dois valores e devolve true ou false, sem converter tipos. Usar "=" dentro de um if é um erro clássico: em vez de comparar, você atribui.',
    concepts: ['operadores', 'condicoes'],
  },
  {
    id: 'fc-js-06',
    front: 'Num if / else if encadeado, o que acontece depois que uma condição é verdadeira?',
    back: 'O bloco dela executa e todos os seguintes são ignorados — nem chegam a ser testados. Por isso a ordem importa: encadeie da faixa mais restritiva para a mais ampla.',
    concepts: ['condicoes'],
  },
  {
    id: 'fc-js-07',
    front: 'O que causa um laço infinito?',
    back: 'Uma condição de parada que nunca se torna falsa — geralmente porque o contador não avança dentro do loop, ou avança na direção errada.',
    concepts: ['loops', 'depuracao'],
  },
  {
    id: 'fc-js-08',
    front: 'Por que declarar o acumulador ANTES do loop, e não dentro?',
    back: 'Declarado dentro, ele é recriado a cada volta e perde o valor acumulado — o resultado final vira apenas a última parcela. Fora do loop, ele sobrevive entre as iterações.',
    concepts: ['loops', 'variaveis'],
  },
  {
    id: 'fc-js-09',
    front: 'Num array de 3 itens, quais índices são válidos?',
    back: '0, 1 e 2. A contagem começa em zero, então o último índice é sempre length - 1. Acessar a posição 3 devolve undefined em silêncio, sem lançar erro.',
    concepts: ['arrays'],
  },
  {
    id: 'fc-js-10',
    front: 'Qual a diferença entre console.log e return dentro de uma função?',
    back: 'console.log mostra algo na tela; return entrega um valor de volta a quem chamou a função. Uma função que só imprime devolve undefined e não pode ter o resultado reaproveitado numa conta.',
    concepts: ['funcoes'],
  },
  {
    id: 'fc-js-11',
    front: 'Por que 0.1 + 0.2 não é exatamente 0.3?',
    back: 'Números decimais são guardados em binário, e frações como 0,1 não têm representação exata — assim como 1/3 não termina em decimal. Em valores monetários, arredonde na exibição (toFixed), lembrando que toFixed devolve texto, não número.',
    concepts: ['tipos-de-dados', 'operadores'],
  },
  {
    id: 'fc-js-12',
    front: 'Por que "Cannot read properties of undefined" acontece?',
    back: 'Porque você tentou ler algo DENTRO de um valor que é undefined. O nome existe, mas o conteúdo não — então verifique o nível de cima antes de descer mais um.',
    concepts: ['objetos', 'depuracao'],
  },
  {
    id: 'fc-js-13',
    front: 'Qual a diferença entre ReferenceError e TypeError?',
    back: 'ReferenceError: o NOME não existe (erro de digitação ou escopo). TypeError: o nome existe, mas o VALOR não é do tipo que você supôs.',
    concepts: ['depuracao'],
  },
  {
    id: 'fc-js-14',
    front: 'Quando usar map, filter e reduce?',
    back: 'map transforma cada item e devolve um array do mesmo tamanho. filter seleciona e devolve um menor ou igual. reduce condensa tudo num único valor. Nenhum dos três altera o array original.',
    concepts: ['arrays'],
  },
  {
    id: 'fc-js-15',
    front: 'Para pegar os nomes só dos itens aprovados, qual a ordem: map ou filter primeiro?',
    back: 'filter primeiro, map depois. Se você transformar em nomes antes, perde a informação usada para filtrar.',
    concepts: ['arrays'],
  },
  {
    id: 'fc-js-16',
    front: 'Por que texto.trim() sozinho não limpa a variável?',
    back: 'Strings são imutáveis: o método devolve um texto NOVO em vez de alterar o existente. É preciso guardar o retorno — texto = texto.trim().',
    concepts: ['strings'],
  },
  {
    id: 'fc-js-17',
    front: 'Quais casos extremos testar antes de considerar uma função pronta?',
    back: 'Vazio, um único item, o limite exato da regra, negativo e zero, valores repetidos e tipo errado. O caso mais perigoso não é o que dá erro — é o que devolve valor errado em silêncio.',
    concepts: ['casos-extremos'],
  },
  {
    id: 'fc-js-18',
    front: 'A regra diz "acima de 100". Devo usar > ou >= ?',
    back: '> apenas. "Acima de 100" exclui o próprio 100. Confundir os dois é o erro de um a mais, e só um teste no valor exato do limite revela.',
    concepts: ['casos-extremos', 'condicoes'],
  },
  {
    id: 'fc-js-19',
    front: 'Num acumulador de multiplicação, qual o valor inicial?',
    back: '1, não 0. Começar em zero zera todo o resultado na primeira multiplicação. Para soma o inicial é 0; para produto é 1.',
    concepts: ['loops', 'simulacao'],
  },
  {
    id: 'fc-js-20',
    front: 'Qual é o primeiro passo ao receber um problema grande?',
    back: 'Listar os passos menores antes de escrever código, e perguntar: qual é a menor parte disso que eu já saberia fazer agora? Cada passo deve ser testável sozinho.',
    concepts: ['decomposicao'],
  },
  {
    id: 'fc-js-21',
    front: 'Por que prever a saída antes de executar o código?',
    back: 'Quando a previsão bate, sua compreensão está correta. Quando não bate, você encontrou o ponto exato onde seu modelo mental está errado — a informação mais valiosa que existe para aprender.',
    concepts: ['simulacao'],
  },
  {
    id: 'fc-js-22',
    front: 'Por que remover itens com splice dentro de um loop pula elementos?',
    back: 'Porque splice altera o array durante a iteração: os índices seguintes deslizam para trás enquanto o contador avança. Prefira filter, que devolve uma lista nova.',
    concepts: ['arrays', 'depuracao'],
  },

  // TypeScript
  {
    id: 'fc-ts-01',
    front: 'Qual a diferença entre o erro de tipo do TypeScript e um erro em tempo de execução?',
    back: 'O erro de tipo aparece ao compilar, antes de qualquer linha rodar. Um erro em tempo de execução só aparece quando o código de fato roda — e pode ser tarde demais, em produção.',
    concepts: ['ts-por-que'],
  },
  {
    id: 'fc-ts-02',
    front: 'Por que anotar `let total: number = 0` costuma ser redundante?',
    back: 'O TypeScript já infere o tipo pelo valor inicial — `0` já diz "number". Anotar de novo não erra, mas não ajuda em nada; a anotação vale quando o tipo não pode ser inferido sozinho.',
    concepts: ['ts-inferencia'],
  },
  {
    id: 'fc-ts-03',
    front: 'O que uma interface descreve?',
    back: 'A forma de um objeto: quais propriedades existem e de que tipo é cada uma. Não é uma classe — não tem implementação, só o contrato que um valor precisa cumprir.',
    concepts: ['ts-interfaces'],
  },
  {
    id: 'fc-ts-04',
    front: 'O que é "estreitar" um tipo?',
    back: 'Reduzir uma união de tipos (`string | number`) a um só, dentro de um bloco, através de uma checagem como `typeof` ou `if`. O compilador usa essa checagem para saber qual dos dois tipos vale dali para frente.',
    concepts: ['ts-estreitar'],
  },
  {
    id: 'fc-ts-05',
    front: 'Para que serve um genérico, como o `T` em `function primeiro<T>(lista: T[]): T`?',
    back: 'Para escrever uma função que funciona com qualquer tipo, sem perder a informação de qual tipo é — o retorno continua amarrado ao tipo da entrada, em vez de virar `any`.',
    concepts: ['ts-genericos'],
  },

  // React
  {
    id: 'fc-react-01',
    front: 'Por que um componente React não deve alterar `props` diretamente?',
    back: 'Props vêm de quem usa o componente e são só leitura — alterá-las não avisa quem as passou, e a próxima renderização do pai sobrescreve a mudança de qualquer jeito. Para algo que muda, use estado.',
    concepts: ['react-componentes'],
  },
  {
    id: 'fc-react-02',
    front: 'Por que `setEstado(estado + 1)` chamado duas vezes seguidas não soma dois?',
    back: 'As duas chamadas leem o mesmo `estado` da renderização atual — a segunda não vê o efeito da primeira ainda. Para acumular corretamente, use a forma função: `setEstado((atual) => atual + 1)`.',
    concepts: ['react-estado'],
  },
  {
    id: 'fc-react-03',
    front: 'Por que cada item de uma lista renderizada em React precisa de uma `key`?',
    back: 'A key diz ao React qual elemento é qual entre uma renderização e outra — sem ela (ou usando o índice como key numa lista que reordena), o React pode reaproveitar o elemento errado e misturar o estado interno dos itens.',
    concepts: ['react-listas'],
  },
  {
    id: 'fc-react-04',
    front: 'O que `useEffect` sincroniza?',
    back: 'O componente com algo de fora do React — uma assinatura, um timer, uma busca de dados. Ele roda depois da renderização, não durante, e a função que ele devolve é a limpeza, chamada antes do próximo efeito ou ao desmontar.',
    concepts: ['react-efeitos'],
  },
  {
    id: 'fc-react-05',
    front: 'Buscando dados com `useEffect`, por que os três estados (carregando, erro, dados) importam?',
    back: 'Uma busca é assíncrona: existe um instante em que a resposta ainda não chegou. Sem um estado de carregando, a tela mostra "nada" (ou o dado antigo) até a resposta chegar — e sem um de erro, uma falha de rede vira uma tela vazia sem explicação.',
    concepts: ['react-dados'],
  },

  // Node e APIs
  {
    id: 'fc-node-01',
    front: 'O que `app.get(\'/produtos/:id\', ...)` faz com o `:id` na URL?',
    back: 'Captura o trecho da URL naquela posição como parâmetro, disponível em `req.params.id` dentro do handler — é assim que uma rota responde a `/produtos/1`, `/produtos/2` etc. com o mesmo código.',
    concepts: ['node-rotas'],
  },
  {
    id: 'fc-node-02',
    front: 'Por que um servidor confere de novo, no backend, um dado que o frontend já validou?',
    back: 'Porque o pedido não precisa vir da sua tela — qualquer um monta um POST direto, sem passar pela validação do navegador. Validação no cliente é experiência; validação no servidor é a única que protege de verdade.',
    concepts: ['node-corpo'],
  },
  {
    id: 'fc-node-03',
    front: 'O que um middleware de autenticação faz antes da rota de verdade rodar?',
    back: 'Confere se o pedido tem uma identidade válida (um token, uma sessão) e, se não tiver, responde 401 e nunca deixa a rota seguinte executar — a rota em si pode supor que quem chegou até ela já está autenticado.',
    concepts: ['node-middleware'],
  },
  {
    id: 'fc-node-04',
    front: 'Por que a porta de um servidor em produção vem de `process.env.PORT`, e não de um número fixo no código?',
    back: 'Porque quem decide a porta disponível é o host, não o código — um número fixo funciona em desenvolvimento e simplesmente não recebe tráfego nenhum quando publicado, já que o host atribui outra porta.',
    concepts: ['node-config'],
  },

  // SQL
  {
    id: 'fc-sql-01',
    front: 'Qual a diferença entre INNER JOIN e LEFT JOIN?',
    back: 'INNER JOIN só traz linhas que têm par nas duas tabelas. LEFT JOIN traz todas as linhas da tabela da esquerda, com NULL nas colunas da direita quando não há par — é como se acha quem não tem correspondência.',
    concepts: ['sql-join'],
  },
  {
    id: 'fc-sql-02',
    front: 'Por que GROUP BY precisa vir com uma função de agregação, como COUNT ou SUM?',
    back: 'GROUP BY junta várias linhas num grupo só; sem uma agregação, o banco não sabe qual valor mostrar de uma coluna que tem valores diferentes dentro do mesmo grupo. A agregação diz como resumir esses valores.',
    concepts: ['sql-agregacao'],
  },
  {
    id: 'fc-sql-03',
    front: 'Por que uma FOREIGN KEY existe numa tabela?',
    back: 'Para garantir que o valor daquela coluna corresponde a uma linha que de fato existe na tabela referenciada — impede, por exemplo, um pedido apontando para um cliente que não existe no banco.',
    concepts: ['sql-modelar'],
  },
  {
    id: 'fc-sql-04',
    front: 'Por que um índice acelera uma consulta com WHERE, mas custa alguma coisa?',
    back: 'O índice organiza os valores de uma coluna para busca rápida, em vez do banco varrer linha por linha. O custo aparece em INSERT/UPDATE/DELETE: cada mudança na tabela também precisa atualizar o índice.',
    concepts: ['sql-indices'],
  },

  // Git e Equipe
  {
    id: 'fc-git-01',
    front: 'O que faz um commit ser "atômico"?',
    back: 'Ele representa uma mudança lógica só, com uma razão para existir — não uma mistura de assuntos diferentes. Um commit atômico é revisável, e reverter um problema não arrasta mudanças de outro assunto junto.',
    concepts: ['git-commit'],
  },
  {
    id: 'fc-git-02',
    front: 'Por que uma branch deveria durar pouco tempo?',
    back: 'Quanto mais tempo uma branch vive separada da principal, mais ela diverge — e maior a chance de um conflito grande na hora de juntar. Uma branch curta, de um assunto só, incorpora antes de divergir demais.',
    concepts: ['git-branch'],
  },
  {
    id: 'fc-git-03',
    front: 'O que os marcadores `<<<<<<<`, `=======` e `>>>>>>>` significam num conflito de merge?',
    back: 'Duas versões da mesma linha, de branches diferentes: a de cima do `=======` é a sua (ou a atual), a de baixo é a que está sendo incorporada. Resolver é entender as duas intenções e escrever o resultado combinado.',
    concepts: ['git-conflito'],
  },
  {
    id: 'fc-git-04',
    front: 'Por que um segredo já commitado precisa ser trocado, e não só removido do arquivo?',
    back: 'O Git guarda o histórico inteiro — um commit novo removendo a linha não apaga o commit antigo, que continua acessível a quem tiver acesso ao repositório. Só trocar o segredo na origem neutraliza o vazamento de verdade.',
    concepts: ['git-gitignore'],
  },

  // Terminal
  {
    id: 'fc-terminal-01',
    front: 'Qual a diferença entre um caminho absoluto e um relativo no terminal?',
    back: 'O absoluto começa na raiz e sempre aponta para o mesmo lugar, não importa de onde você rode o comando. O relativo parte de onde você está (`pwd`) — o mesmo caminho relativo pode apontar para lugares diferentes.',
    concepts: ['terminal-shell'],
  },
  {
    id: 'fc-terminal-02',
    front: 'Por que ler uma variável de ambiente com `env.PORTA || 3000` pode dar um resultado inesperado?',
    back: '`||` cai no padrão para qualquer valor "falso" em JavaScript — inclusive uma string vazia, que poderia ser uma configuração válida e proposital. Checar contra `undefined` explicitamente evita essa armadilha.',
    concepts: ['terminal-env'],
  },
  {
    id: 'fc-terminal-03',
    front: 'O que o código de saída de um comando (0 ou diferente de 0) informa?',
    back: 'Se o comando terminou com sucesso (0) ou falhou (qualquer outro número). É esse código que decide se um `&&` entre comandos continua para o próximo ou para ali mesmo.',
    concepts: ['terminal-erros'],
  },

  // Engenharia
  {
    id: 'fc-eng-01',
    front: 'O que "coesão" e "acoplamento" significam ao decidir separar um arquivo?',
    back: 'Coesão é o quanto as coisas de um arquivo têm a ver umas com as outras — alta coesão é bom. Acoplamento é o quanto uma parte precisa saber dos detalhes de outra — baixo acoplamento é bom. Separar bem aumenta a primeira sem aumentar a segunda.',
    concepts: ['eng-separar'],
  },
  {
    id: 'fc-eng-02',
    front: 'Por que um nome de variável como `d` ou `tmp` custa caro num projeto que cresce?',
    back: 'Porque quem lê o código depois — inclusive você, meses depois — precisa reconstruir o significado a partir do uso, em vez de ler o nome. Um nome que diz a verdade poupa esse trabalho toda vez que alguém passa pelo trecho.',
    concepts: ['eng-nomes'],
  },
  {
    id: 'fc-eng-03',
    front: 'Por que uma função pequena, com uma responsabilidade só, é mais fácil de testar?',
    back: 'Porque ela tem menos caminhos possíveis e menos coisas que podem dar errado ao mesmo tempo — um teste cobre o comportamento inteiro dela sem precisar simular um monte de cenários combinados.',
    concepts: ['eng-funcoes'],
  },

  // Testes
  {
    id: 'fc-testes-01',
    front: 'O que "Arrange, Act, Assert" organiza num teste?',
    back: 'Arrange prepara o cenário (os dados, o estado inicial); Act executa a ação sendo testada, uma vez só; Assert confere o resultado. Separar as três partes deixa claro o que quebrou quando o teste falha.',
    concepts: ['testes-aaa'],
  },
  {
    id: 'fc-testes-02',
    front: 'Por que um teste vazio (sem nenhuma asserção) é pior do que não ter teste nenhum?',
    back: 'Porque ele passa sempre, dá a aparência de cobertura, e esconde que aquele comportamento nunca foi de fato verificado — alguém vê "testado" na tela e confia num código que não foi checado.',
    concepts: ['testes-por-que'],
  },
  {
    id: 'fc-testes-03',
    front: 'Quando vale a pena usar um dublê (mock/spy) num teste?',
    back: 'Só para dependências externas de verdade — banco, e-mail, relógio, uma API de fora. Substituir uma função pura, sem efeito colateral, por um dublê esconde justamente o que o teste deveria estar verificando.',
    concepts: ['testes-dubles'],
  },
  {
    id: 'fc-testes-04',
    front: 'Por que um teste que verifica uma variável interna, em vez do comportamento, é frágil?',
    back: 'Porque ele quebra quando a implementação muda, mesmo que o comportamento continue correto para quem usa a função — o teste deveria checar a porta de fora (entrada e saída), não como o código chega lá.',
    concepts: ['testes-fragil'],
  },

  // Segurança web
  {
    id: 'fc-seg-01',
    front: 'Qual é o mecanismo comum por trás de injeção de SQL e XSS?',
    back: 'Um dado que veio de fora foi lido como se fosse instrução — colado direto no meio de um SQL ou de um HTML. A defesa não é caçar caracteres perigosos, é separar o canal do dado do canal da instrução.',
    concepts: ['seguranca-web'],
  },
  {
    id: 'fc-seg-02',
    front: 'O que os atributos HttpOnly, Secure e SameSite de um cookie protegem, cada um?',
    back: 'HttpOnly impede que JavaScript leia o cookie (mesmo um XSS já rodando). Secure impede que ele viaje por HTTP sem cifra. SameSite impede que ele acompanhe um pedido vindo de outro site — a defesa central contra CSRF.',
    concepts: ['seguranca-csrf-cookies'],
  },

  // ORM
  {
    id: 'fc-orm-01',
    front: 'O que um ORM traduz, de um lado e de outro?',
    back: 'Uma linha de tabela vira objeto, e um objeto novo vira linha inserida — poupando o SQL repetitivo do CRUD comum. Ele não substitui saber o que está acontecendo no banco por baixo.',
    concepts: ['orm-mapeamento'],
  },
  {
    id: 'fc-orm-02',
    front: 'O que é o problema de "N+1 consultas"?',
    back: 'Buscar uma lista com 1 consulta e, para cada um dos N itens, fazer mais uma consulta separada dentro de um loop — N+1 consultas onde uma só, pedindo a relação junto, bastaria.',
    concepts: ['orm-queries'],
  },

  // Deploy
  {
    id: 'fc-deploy-01',
    front: 'Por que o build de um projeto roda antes do deploy, e a publicação é recusada se ele falhar?',
    back: 'Um erro que impede o build de terminar é melhor descoberto no seu computador do que na tela de quem está usando a aplicação — o build funciona como uma rede de segurança antes da publicação.',
    concepts: ['deploy-ambientes'],
  },
  {
    id: 'fc-deploy-02',
    front: 'Por que uma variável de ambiente prefixada com VITE_ não é lugar seguro para uma chave secreta?',
    back: 'Esse tipo de variável é lida no build e embutida no arquivo que o navegador baixa — ela fica pública, mesmo minificada. Uma chave secreta de verdade só pode viver numa variável lida exclusivamente pelo servidor.',
    concepts: ['deploy-segredos'],
  },

  // Estruturas de Dados e Big O
  {
    id: 'fc-estruturas-01',
    front: 'O que Big O descreve — tempo de relógio ou outra coisa?',
    back: 'Como o número de passos de uma solução cresce conforme a entrada cresce — não quantos milissegundos ela leva. Duas soluções corretas podem crescer de formas bem diferentes.',
    concepts: ['estruturas-big-o'],
  },
  {
    id: 'fc-estruturas-02',
    front: 'Quais são as duas partes obrigatórias de uma função recursiva?',
    back: 'Um caso base, que resolve direto sem chamar a si mesma, e um passo recursivo, que chama a si mesma com um problema menor. Sem as duas, a recursão nunca termina.',
    concepts: ['estruturas-recursao'],
  },
  {
    id: 'fc-estruturas-03',
    front: 'Qual a diferença entre uma pilha (LIFO) e uma fila (FIFO)?',
    back: 'Numa pilha, o último item a entrar é o primeiro a sair (push/pop no mesmo topo). Numa fila, o primeiro a entrar é o primeiro a sair (push de um lado, shift do outro).',
    concepts: ['estruturas-pilha-fila'],
  },
  {
    id: 'fc-estruturas-04',
    front: 'Por que busca binária só funciona num array ordenado?',
    back: 'Ela decide de que lado do meio continuar procurando comparando o alvo com o item do meio — essa decisão só faz sentido se o array estiver ordenado; num desordenado, o alvo pode estar em qualquer lado.',
    concepts: ['estruturas-busca-e-mapas'],
  },

  // Python
  {
    id: 'fc-py-01',
    front: 'O que define um bloco de código em Python, já que não há chaves?',
    back: 'A indentação. Errar o recuo é erro de sintaxe, não só de estilo — o interpretador usa o espaçamento para saber onde um bloco (de um if, de um for) começa e termina.',
    concepts: ['py-intro'],
  },
  {
    id: 'fc-py-02',
    front: 'O que uma compreensão de lista faz, em uma linha?',
    back: '`[expressao for item in colecao if condicao]` transforma (e opcionalmente filtra) uma coleção sem escrever um loop explícito — o equivalente Python de encadear map e filter.',
    concepts: ['py-listas'],
  },
  {
    id: 'fc-py-03',
    front: 'Qual a diferença entre `dicionario[chave]` e `dicionario.get(chave, padrao)`?',
    back: 'Colchetes lançam uma exceção se a chave não existir. `.get()` devolve um valor padrão nesse caso, sem lançar — útil quando a ausência da chave é uma possibilidade normal, não um erro.',
    concepts: ['py-dicionarios'],
  },
];

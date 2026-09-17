# Currículo: até a base de um dev júnior

Roadmap de conteúdo **e** de plataforma. A versão navegável está publicada como
artifact; este arquivo é a fonte canônica e deve ser atualizado no mesmo commit
que conclui uma fase.

## Onde estamos

**Fases 1, 2 e 3 de 8 concluídas · Fase 4 pela metade: SQL 10 de 10 · publicado**

```
Fase 0  Fundamentos e lógica      ██████████████████████  13/13  pronto
Fase 1  JavaScript real          ██████████████████████  10/10  pronto
        Como a web funciona      ██████████████████████   8/8  pronto
        Plataforma                ██████████████████████   7/7  pronto
Fase 2  A página                 ██████████████████████  26/26  pronto
Fase 3  Tipos e componentes      ██████████████████████  24/24  pronto
Fase 4  Back-end e dados         ███████████░░░░░░░░░░░  10/20  SQL pronto
Fase 5  Profissionalização       ░░░░░░░░░░░░░░░░░░░░░░   0/19
Fase 6  Python                   ░░░░░░░░░░░░░░░░░░░░░░   0/10
Fase 7  Projeto final            ░░░░░░░░░░░░░░░░░░░░░░   0/5
```

| | Hoje | Previsto | Feito |
| --- | ---: | ---: | ---: |
| Aulas | **91** | 135 | 67% |
| Exercícios | **532** | ~700 | 76% |
| Tipos de exercício | **9** | 11 | 82% |
| Motores de execução | **5** | 7 | 71% |
| Projetos | **7** | ~30 | 23% |

**Último trabalho** (2026-09-16): o motor de SQL — o sql.js num worker, o
exercício julgado pelas linhas devolvidas — e a trilha "SQL e Bancos de
Dados" inteira, 10 aulas e 43 exercícios de SQL sobre o banco de uma loja.
É a primeira trilha em que o aluno não escreve JavaScript. Metade da Fase 4;
o dono do projeto escolheu o SQL antes do servidor simulado. No mesmo dia,
a partir do retorno dele: a tela inicial e a de trilhas viraram o percurso
em três etapas, o exercício de ordenar ganhou arrasto, e o de escrever o
teste passou a explicar o `assert` antes do editor.

## Aprofundamento das aulas antigas

As primeiras aulas nasceram magras e foram ficando melhores com o tempo — o que
significa que o iniciante encontrava as piores. Medido, antes desta rodada: a
aula 1 tinha 77 palavras e **um** exercício para 12 minutos. Hoje a aula mais
curta do catálogo tem 304 palavras, e a média está em 570.

O padrão novo é: 500 a 900 palavras, e cinco a sete exercícios em dificuldade
crescente — múltipla escolha ou prever saída para verificar a compreensão, lacuna
para dar a estrutura, código do zero, e por fim **um dos quatro tipos de
prática de dev** (encontrar o bug, ordenar passos, escrever o teste ou
refatorar), que pede o conceito de um ângulo que o exercício de código não pede.

```
Aula 1  Variáveis                ██████████  77 → 508 palavras,  1 → 5 exercícios
Aula 2  Tipos e operadores       ██████████  82 → 700 palavras,  2 → 5 exercícios
Aula 3  Condições                ██████████  135 → 429 palavras, 2 → 4 exercícios
Aula 4  Loops                    ██████████  132 → 304 palavras, 2 → 4 exercícios
Aula 5  Funções                  ██████████  119 → 327 palavras, 3 → 5 exercícios
Aula 6  Arrays                   ██████████  124 → 317 palavras, 2 → 4 exercícios
Aula 7  Objetos                  ██████████  171 → 375 palavras, 2 → 4 exercícios
Aula 8  map, filter e reduce     ██████████  167 → 504 palavras, 2 → 6 exercícios
Aula 9  Strings                  ██████████  143 → 688 palavras, 2 → 7 exercícios
Aula 10 Erros                    ██████████  210 → 832 palavras, 2 → 7 exercícios
Lógica 1 Decompor                ██████████  159 → 634 palavras, 2 → 5 exercícios
Lógica 2 Casos extremos          ██████████  182 → 654 palavras, 2 → 5 exercícios
Lógica 3 Simular                 ██████████  198 → 660 palavras, 2 → 5 exercícios
```

**Aprofundamento concluído para as 23 aulas publicadas.** Não há aula pendente.
O bloco assíncrono — callbacks, promises e async/await — ficou entre 780 e 810
palavras cada, porque é o assunto que mais custa e o que mais rende explicação.

```
Aula 11 Escopo                   ██████████  296 → 782 palavras, 3 → 5 exercícios
Aula 12 Closures                 ██████████  292 → 671 palavras, 3 → 5 exercícios
Aula 13 Callbacks                ██████████  327 → 782 palavras, 3 → 5 exercícios
Aula 14 Promises                 ██████████  324 → 808 palavras, 3 → 5 exercícios
Aula 15 async e await            ██████████  349 → 784 palavras, 3 → 5 exercícios
Aula 16 Falhas assíncronas       ██████████  351 → 651 palavras, 3 → 4 exercícios
Aula 17 JSON                     ██████████  329 → 534 palavras, 3 → 4 exercícios
Aula 18 Imutabilidade            ██████████  314 → 553 palavras, 3 → 4 exercícios
Aula 19 Datas                    ██████████  399 → 634 palavras, 3 → 4 exercícios
Aula 20 Expressões regulares     ██████████  435 palavras, 3 → 4 exercícios
```

As contagens acima são da rodada de aprofundamento e ficam como registro dela.
Em 2026-09-14 cada aula que ainda não tinha um dos quatro tipos de prática de
dev ganhou **mais um** exercício — 23 aulas, todas menos as 8, 9, 10, 18,
Lógica 1, Lógica 2, Web 5 e Web 8, que já tinham. Hoje nenhuma aula tem menos
de cinco exercícios, e a mais cheia (Strings, Erros) tem oito.

_Atualizado em 2026-09-14. Este bloco é atualizado sempre que um item muda de
estado._

## Fluxo das atividades — refeito em 2026-09-09

O conteúdo estava crescendo mais rápido que a mecânica que o entrega, e a
mecânica tinha três defeitos que nenhum dos 521 testes de então pegava:

- **múltipla escolha e prever-saída nunca avisavam que tinham sido resolvidas** —
  36 dos 78 exercícios. O rodapé continuava oferecendo "Pular por ora" a quem
  acabara de acertar;
- **acertar um exercício concluía a aula inteira**, com confete no meio dela;
- **o resumo afirmava "Aula concluída — seu progresso foi salvo"** mesmo para
  quem tinha pulado tudo.

E um quarto, achado testando: **passar de uma aula para a seguinte dava tela
branca** sempre que a próxima era mais curta.

Os quatro tipos passam a reportar um estado único — `inicial`, `respondendo`,
`verificando`, `errou`, `acertou` — e a aula lê esse estado em vez de adivinhar.
Conclusão agora exige todos os exercícios resolvidos, e o cabeçalho mostra o
placar. Detalhes em `src/client/lib/exercise-state.ts`.

## A restrição que ordena tudo

O código do aluno roda num Web Worker descartável, com 3s de limite e **sem
acesso ao DOM**. Ótimo para lógica pura — um laço infinito não congela a tela — e
por isso mesmo inútil para DOM, HTML, CSS ou React: não existe página lá dentro.

Cada ambiente novo exige um executor próprio, e um executor destrava vários
blocos de uma vez. As fases estão na ordem em que os motores se pagam, do mais
barato para o mais caro. Construir na ordem errada é pagar duas vezes.

## Aceitar soluções diversas

**O que já funciona.** Exercício de código é corrigido por asserções sobre o
comportamento, nunca sobre o texto escrito. Quem resolve com `for`, `reduce` ou
recursão passa igual.

**O que falha.** As asserções são casos fixos (`somar(2, 3) !== 5`). Deixa passar
quem chuta o caso específico e recompensa decorar o teste.

Quatro mudanças, em ordem de impacto:

1. **Testes por propriedade** — sorteia dezenas de entradas e compara com uma
   regra, em vez de conferir três casos escolhidos a dedo. Acaba com o chute.
2. **Múltiplas saídas válidas** — o exercício declara o conjunto do aceitável.
3. **Reconhecer a abordagem** — o retorno comenta qual caminho o aluno tomou e o
   que ele troca. Não é nota.
4. **Restrição opcional** — o mesmo exercício, sem usar `for`. Segundo desafio
   sobre um problema já entendido.

## Tipos de exercício

Existem oito: escrever o código, múltipla escolha, prever a saída, completar a
lacuna, ordenar os passos, escrever o teste, encontrar o bug, refatorar. Os
quatro últimos nasceram na Fase 1 e são independentes de motor. **Toda aula
publicada tem ao menos um deles** (2026-09-14): 14 de encontrar o bug, 9 de
ordenar passos, 5 de escrever o teste, 4 de refatorar — 32 no total, sendo 23
novos, um por aula que não tinha. Cada um sai do conceito da própria aula: o
`const` reatribuído em variáveis, o `=` no `if` em condições, o `<=` no laço, o
`getMonth()` sem `+ 1`, o `exp` em segundos contra `Date.now()` em
milissegundos.

Restrição que vale saber ao escrever mais: **encontrar o bug** exige que o
programa lance de verdade — o CI roda o código como está e cobra um erro. Bug
silencioso de lógica entra com um teste na última linha (`if (x !== y) throw`),
que é também a linha do sintoma. E o sandbox silencia rejeição de promise sem
destino, então o defeito de um exercício assíncrono precisa estourar de forma
síncrona (`.then` em `undefined`, por exemplo).

A construir, cada um preso a um motor de fase posterior: consertar a tela
(iframe, Fase 2), consulta ao banco (sql.js, Fase 4), construir do zero
(capstone, Fase 7).

Cada exercício em três níveis de apoio: **guiado** (esqueleto quase pronto),
**livre** (enunciado e testes) e **desafio** (caso extremo ou restrição, sempre
opcional).

## Fases

### Fase 0 — Fundamentos e lógica · PRONTO
13 aulas, 7 projetos. Motor: Web Worker sem DOM.

### Fase 1 — Aprofundar o que já roda · 18 aulas · PRONTO
Motor: **nenhum novo**.

**JavaScript real — 10 de 10, concluído**

| Aula | Estado |
| --- | --- |
| Escopo | feita |
| Closures | feita |
| Callbacks | feita |
| Promises | feita |
| async e await | feita |
| Falhas assíncronas | feita |
| JSON | feita |
| Imutabilidade | feita |
| Datas e fuso | feita |
| Expressões regulares | feita |

Módulos saiu do bloco: `import`/`export` é erro de sintaxe no sandbox, porque
`new Function` não aceita módulos. Volta quando houver um executor que entenda,
ou entra como aula conceitual. O lugar dele na contagem foi ocupado por escopo e
closures, que a versão original tratava como uma aula só e na prática pediam duas.

**Como a web funciona — 8 de 8, concluído.** Trilha própria, `track-web`, com
40 exercícios. Nenhum deles precisa de rede: URL, status, cabeçalho e token são
tratados como o que de fato são — texto com estrutura —, o que deixa a trilha
inteira caber no motor que já existe.

| Aula | Assunto | Exercícios |
| --- | --- | ---: |
| 1 | Cliente e servidor, e as partes de uma URL | 5 |
| 2 | HTTP: métodos, seguro e idempotente, status | 5 |
| 3 | Cabeçalhos, e por que normalizar os dois lados | 5 |
| 4 | REST: o caminho nomeia, o método age | 5 |
| 5 | Autenticação contra autorização, 401 contra 403 | 5 |
| 6 | Tokens: base64 não é segredo, e o exp em segundos | 5 |
| 7 | CORS: origem, verificação prévia, e onde corrigir | 5 |
| 8 | Injeção, escape de HTML, e nunca confiar no cliente | 5 |

**Plataforma**

| Item | Estado |
| --- | --- |
| Testes por propriedade | feito |
| Exercício de lacuna | feito |
| Ordenar passos | feito |
| Escrever o teste | feito |
| Encontrar o bug | feito |
| Refatorar | feito |
| Servir o editor do próprio domínio | feito — chunk próprio, sob demanda; o E2E bloqueia toda rede externa e o editor monta assim mesmo |
| Publicar de verdade | feito — Vercel, deploy automático a cada push no `main` |

**Todos os tipos de exercício que cabem no motor atual estão prontos.** Os três
que faltam — arrastar e soltar, completar diagrama, e o de banco de dados —
dependem de fases posteriores.

Duas correções que a Fase 1 exigiu e que não estavam previstas: o sandbox era
síncrono, e uma asserção assíncrona reportava sucesso antes de a promise resolver
— qualquer exercício de assíncrono diria ao aluno que a resposta errada estava
certa. E não havia prazo por teste, então um exercício de callback travava para
sempre quando o aluno esquecia de chamar o callback.

### Fase 2 — A página · 26 aulas · PRONTO (2026-09-14)
Motor **1: executor em iframe isolado** — **pronto** (2026-09-14). Destrava
três blocos, sem download extra.

Como o motor funciona, para quem for escrever as aulas: o código do aluno é o
conteúdo do `body` de um documento nosso, num `<iframe sandbox>` de origem
opaca e sem rede. Os testes são as mesmas asserções dos outros exercícios,
só que rodam **dentro** da página e enxergam `document` — `querySelector`,
`textContent`, `click()`, `getComputedStyle`. Um exercício vira "de página"
com `runtime: 'iframe'`, nos tipos `code` e `fill-blank`; a solução de página
é o documento inteiro, não um acréscimo ao esqueleto. O CI prova cada um no
jsdom (sem layout; cor vem como declarada, não normalizada) e o E2E prova a
aula inteira no Chromium.

Cada aula tem 6 exercícios, 3 deles de página, e o E2E conclui todas as 26 no
Chromium, em celular e desktop. Duas coisas que o motor ganhou para os blocos
de DOM e UI: `localStorage`/`sessionStorage` em memória (a origem opaca lança
ao tocar nos reais) e um `fetch` dublê que responde a partir de
`window.__servidor`, definido pelo exercício, com 404 para o resto — sem rede,
mas com armazenamento e busca de dados de verdade para ensinar.

**HTML e CSS — 10 de 10.**

| Aula | Assunto |
| --- | --- |
| 1 | HTML semântico: regiões, hierarquia de títulos, a sopa de div |
| 2 | A caixa: as quatro camadas, box-sizing, bloco e inline, margens que se fundem |
| 3 | Flexbox: contêiner e itens, os dois eixos, gap, flex-wrap, flex |
| 4 | Grid: fr e repeat, grid-column, a página desenhada com áreas |
| 5 | Responsivo: fluidez, max-width, viewport, media queries mobile-first |
| 6 | Tipografia: fontes, rem, entrelinha sem unidade, ch, escala de títulos |
| 7 | Cores: formatos, paleta de papéis em variáveis, contraste 4.5:1, cor nunca sozinha |
| 8 | Estados: hover, focus-visible que nunca some, disabled, checked, nth-child, ::before |
| 9 | Movimento: transition no repouso, transform e opacity, keyframes, reduced-motion |
| 10 | CSS moderno: clamp, min, propriedades lógicas, :is, aspect-ratio, o reset |

**DOM e eventos — 8 de 8.**

| Aula | Assunto |
| --- | --- |
| 11 | O DOM: a árvore de objetos, querySelector, o null, textContent, dataset |
| 12 | Criar e remover: createElement, append, remove, a função desenhar que transforma a lista em HTML |
| 13 | Classes: classList e atributos — o JavaScript decide o estado, o CSS decide a aparência |
| 14 | Eventos: addEventListener, o objeto do evento, o estado numa variável que a tela redesenha |
| 15 | Delegação: o evento que sobe, um ouvinte para a lista inteira, itens que ainda não existem |
| 16 | Formulários: interceptar o envio, FormData, validação com mensagens que ajudam, envio duplo |
| 17 | Armazenamento local: localStorage e JSON, carregar ao abrir, o que nunca vai lá |
| 18 | Buscar e desenhar: fetch, os três estados, desenhar a partir dos dados, erro na tela |

**UI e UX — 8 de 8.**

| Aula | Assunto |
| --- | --- |
| 19 | Hierarquia: uma ação principal por tela, títulos em escala, grupos por proximidade |
| 20 | Texto legível: alinhamento, parágrafos, listas e números para quem lê depressa e no celular |
| 21 | Cor na interface: cor como estado consistente, nada que dependa só dela, tema escuro com contraste |
| 22 | Os estados da tela: vazio, carregando, erro e sucesso, cada um dizendo o que fazer |
| 23 | Teclado: Tab, Enter, espaço e Escape; os elementos certos; nome para o que é só ícone; para onde o foco vai |
| 24 | Formulários que ajudam: menos campos, uma coluna, rótulos visíveis, teclado certo no celular, erros na hora e no lugar |
| 25 | Escrever a interface: botões, títulos, erros, confirmações e estados vazios que dizem o que vai acontecer |
| 26 | O polegar: alvos de 44px, ação principal no rodapé, 16px nos campos, :active |

Plataforma: exercício julgado pela tela renderizada — **feito**. Mapa de
tópicos e busca — **não feito**; é o único item da fase que ficou, e cabe em
qualquer momento, porque não depende de motor.

### Fase 3 — Tipos e componentes · 24 aulas · PRONTO (2026-09-15)
Motor **2: o compilador de TypeScript** — **pronto** (2026-09-14). Motor **3:
React no iframe** — **pronto** (2026-09-15).

Como o motor 2 funciona, para quem for escrever as aulas: em aula com
`language: 'typescript'`, o código do aluno passa pelo compilador antes do
sandbox. No navegador é o worker de TypeScript que o Monaco já carrega para
sublinhar erros, numa segunda instância só para compilar — zero bytes a mais.
No CI é o pacote `typescript`, na mesma versão. Os dois leem as mesmas opções
e as mesmas declarações do sandbox de `typescript-core.ts`: estrito, ES2020,
sem módulos, sem DOM (`document` é recusado na compilação, com explicação). A
recusa vira uma lista com linha, a mensagem original em inglês e a explicação
em português dos erros mais comuns; nada roda. O JavaScript que sobra entra
no mesmo sandbox, com os mesmos testes.

O que só o TypeScript permite: **`typeTests`**, trechos acrescentados ao
código do aluno que o compilador precisa aceitar ou recusar (`rejects:
true`). Um tipo bom se prova pelo uso errado que ele impede, e `somar('2',
3)` roda igual em JavaScript. Entram na mesma lista de resultados, e o CI
cobra que todo trecho `rejects` seja aceito sem o trabalho do aluno — senão
a recusa não testa nada. Exemplo (`example`) de TypeScript precisa compilar,
ou declarar `// @recusado` na primeira linha, e aí o CI cobra a recusa.

**TypeScript — 10 de 10.** Cada aula com 6 exercícios, e o find-bug com
erro de compilação vale: o CI trata a recusa do compilador como "o programa
quebra".

| Aula | Assunto |
| --- | --- |
| 1 | Por que tipar: `nome: tipo`, o erro antes de rodar, tipos apagados, any |
| 2 | Inferência: o compilador deduz do valor; anotar a fronteira, a lista vazia, a variável sem valor; const vs let |
| 3 | Interfaces: a forma de um objeto, `?`, `readonly`, aninhadas, objeto literal sem propriedade a mais |
| 4 | Estreitar: uniões, literais, `T \| undefined`, typeof/`?.`/`??`, discriminante |
| 5 | Funções: opcional e padrão, retorno e void, `(a: A) => B` como valor, retorno honesto |
| 6 | Genéricos: `<T>` deduzido e preservado, `extends`, Array/Promise/Map, tuplas |
| 7 | Utilitários: Partial, Pick, Omit, Readonly, Record, keyof, typeof em tipo |
| 8 | Tipar uma API: unknown na fronteira, guarda `valor is T`, `as` como asserção |
| 9 | Erros do compilador: anatomia da mensagem, cadeia, cascata, corrigir a causa |
| 10 | Quando não tipar: o tipo que compra algo, migrar um arquivo por vez, any com prazo |

Como o motor 3 funciona, para quem for escrever as aulas: em aula com
`language: 'react'`, o exercício é um componente em TSX. O compilador do
motor 2 (com `jsx` ligado, e as declarações do React e do DOM do iframe que
só entram aqui) verifica os tipos e emite `React.createElement`; o
JavaScript entra no documento do motor de página com o React e o ReactDOM
embutidos como texto (a CSP não deixa carregar nada de fora), e o componente
**`App`** é montado com `flushSync` antes de os testes rodarem. Os testes são
os do motor de página, em série, com ajudantes para usar o componente como a
pessoa: `clicar`, `digitar`, `enviar`, `botao(texto)`, `campo(rótulo)`,
`texto`, `textos`, `esperar`. O servidor de mentira (`window.__servidor`) e o
armazenamento em memória valem aqui também. Só os tipos `code`, `fill-blank`,
`multiple-choice`, `order-steps` e `find-bug` entram numa aula de React — os
outros rodam no Worker, que não tem DOM.

**React — 14 de 14.** Cada aula com 6 exercícios; o find-bug quebra em
compilação ou na primeira montagem.

| Aula | Assunto |
| --- | --- |
| 1 | Componentes: função que recebe props e devolve JSX; o que o JSX vira; compor |
| 2 | Estado: useState, eventos, nunca mutar, set com função, não guardar o derivado |
| 3 | Listas: map com key estável, acrescentar/remover/alterar como lista nova, filtro derivado |
| 4 | Formulários: campo controlado, onSubmit, erro na hora certa, muitos campos num objeto |
| 5 | Efeitos: useEffect, dependências, limpeza, o que não é efeito |
| 6 | Buscar dados: async dentro do efeito, os três estados, ok, a bandeira ativo, tentar de novo |
| 7 | Estados de erro: o vazio, a ação que falha (finally, texto que fica), erro por parte da tela |
| 8 | Composição: children, dados descem e eventos sobem, subir o estado, controlado pelo pai |
| 9 | Contexto: createContext/Provider/useContext, valor e funções, quando é exagero |
| 10 | Hooks próprios: extrair lógica, compartilha lógica e não estado, as duas regras |
| 11 | Rotas: a rota como estado, o link que não recarrega, parâmetros, não encontrado |
| 12 | Re-render: quem renderiza, useMemo/memo/useCallback com medição, key que remonta |
| 13 | Acessível e testável: achar por papel e rótulo, testar comportamento, o DOM no efeito |
| 14 | Projeto: o estado antes da tela, fatias verticais, persistência com guarda, pronto |

Plataforma da fase — tutor com IA — **não feita**. O **painel do aluno** saiu
em 2026-09-16, junto com a gamificação que ele precisava: perfil editável,
moedas e loja, desafios do dia e da semana, conquistas por categoria, modo
escuro e cores de destaque — cada assunto numa página própria do perfil, com
vinhetas e ícones desenhados para a plataforma.

### Fase 4 — Back-end e dados · 20 aulas
Motores **4 (servidor simulado)** e **5 (sql.js, ~1,5 MB)**.

- **Node e back-end** (10): Node fora do navegador, pacotes, servidor HTTP,
  rotas, corpo da requisição, middleware, erros e status, autenticação, variáveis
  de ambiente, projeto de API.
- **SQL e modelagem** (10): tabelas, SELECT/WHERE, ordenar, JOIN, agregação,
  subconsultas, escrita, modelar domínio, normalização, índices.

Plataforma: exercício julgado pelo conjunto de linhas devolvido — **feita**.

Como o motor 5 funciona, para quem for escrever mais aulas: em aula com
`language: 'sql'`, o exercício é do tipo `sql` e aponta para um banco de
exemplo (`database: 'loja'`, em `src/content/bancos/`), recriado a cada
execução, mais um `setup` opcional. Cada verificação em `tests` roda uma
consulta em dois bancos — o que recebeu o SQL do aluno e o que recebeu o de
referência — e as linhas precisam bater: sem `query`, a consulta é o próprio
SELECT do aluno; com `query`, é uma consulta sobre o que ficou no banco (o
caso da escrita e da modelagem). `ordered` cobra a ordem (e exige ORDER BY na
referência), `columns` cobra os nomes. Quando a referência é recusada pelo
banco, o aluno precisa ser recusado também — é como se testam NOT NULL,
CHECK, UNIQUE e chave estrangeira. Só os tipos `sql`, `multiple-choice` e
`order-steps` entram numa aula de SQL.

**SQL e modelagem — 10 de 10.** Cada aula com 6 exercícios, num banco de
loja com quatro tabelas (clientes, produtos, pedidos, itens) e as
irregularidades de propósito: um cliente sem pedido, um produto nunca
vendido, e-mails vazios, um pedido cancelado, preços que mudaram.

| Aula | Assunto |
| --- | --- |
| 1 | Tabelas: linha, coluna, tipo, chave primária; SELECT colunas FROM tabela, `*`, LIMIT |
| 2 | WHERE: comparações e aspas simples, AND/OR/NOT, IN, BETWEEN, LIKE, IS NULL |
| 3 | ORDER BY e LIMIT, a ordem fixa das cláusulas, expressões, AS, DISTINCT |
| 4 | JOIN: chave estrangeira, INNER JOIN ON, apelidos e ambiguidade, três tabelas, produto cartesiano, LEFT JOIN + IS NULL |
| 5 | Agregação: COUNT/SUM/AVG/MIN/MAX, GROUP BY, HAVING vs WHERE, COUNT(coluna) no LEFT JOIN |
| 6 | Subconsultas: como valor, como lista (NOT IN e NULL), correlacionada; WITH |
| 7 | INSERT, UPDATE e DELETE: o WHERE que decide o alcance, a ordem da chave estrangeira, BEGIN/COMMIT/ROLLBACK |
| 8 | CREATE TABLE: tipos, PRIMARY KEY, NOT NULL, UNIQUE, DEFAULT, CHECK, REFERENCES, ON DELETE CASCADE, ALTER TABLE |
| 9 | Normalização: as três anomalias, cada fato num lugar, 1:N e N:N com tabela de ligação, migrar, repetir de propósito |
| 10 | Índices: SCAN vs SEARCH, EXPLAIN QUERY PLAN, o custo, índice composto, o que impede o índice, índice único; o relatório final |

**Node e back-end — 0 de 10.** Motor 4 (servidor simulado) por fazer.

## O que o dono do projeto pediu em 2026-09-17

Depois de uma rodada inteira de plataforma (gamificação, perfil, temas,
figuras, cenas), a ordem foi **voltar às aulas**, com três alvos:

1. **Do zero a uma aplicação completa**: página + API + banco, integrados.
   É a Fase 4 que falta (Node e back-end, motor 4) mais o capstone da Fase
   7 — a página que já se sabe fazer chamando a API que se vai aprender a
   escrever, sobre o SQL que já se sabe consultar.
2. **Uma área de engenharia**: como dividir os arquivos em pastas, boas
   práticas, o que faz um projeto ser legível por outra pessoa. Vira uma
   trilha própria na Fase 5 ("Engenharia: organizar um projeto"), sem motor
   novo — módulos e `import/export`, pastas por responsabilidade, nomes,
   funções pequenas, erros, configuração e segredos, README, revisão.
3. **Mais linguagens**, mais adiante — Python (Fase 6) é a primeira.

A ordem escolhida: motor 4 e a trilha de Node (é o pedaço que falta para a
aplicação completa), depois a trilha de engenharia, depois o capstone.

Também saiu o "Pular por ora": um exercício sem resposta verificada não deixa
avançar; responder errado libera ("Continuar assim mesmo").

### Fase 5 — Profissionalização · 19 aulas
Motor: **nenhum novo**. Encaixa em qualquer buraco entre as outras fases.

- **Testes e qualidade** (8), **Git e equipe** (6), **Terminal e ferramentas** (5).

### Fase 6 — Python · 10 aulas
Motor **6: Pyodide, ~10 MB**. Por último pelo peso, não pela importância.

### Fase 7 — Projeto final · 5 aulas, 3 capstones
Front-end, API, banco, testes e publicação. O aluno sai com algo que dá para
mostrar numa entrevista.

Plataforma: fechar as pontas do CodeFlow — desempenho do pacote, revisão num
telefone real, passagem final de acessibilidade.

## Sobre tamanho

As 91 aulas de hoje levaram bastante tempo para ficar no padrão do projeto. As
44 restantes são muitas vezes esse trabalho, e os ~170 exercícios novos são a
maior parte dele. Por isso a unidade é a fase: cada uma termina numa versão do
produto que dá para usar. O roadmap escolhe a ordem; não promete prazo.

A Fase 1 foi o primeiro passo por um motivo concreto: era a única que não
precisava de motor nenhum, e é onde estão os testes por propriedade e os
quatro tipos de prática de dev — que mudam a qualidade de todos os exercícios
que vierem depois. A Fase 2 veio em seguida pela mesma lógica invertida: era a
primeira que precisava de um motor novo, e o iframe é o mais barato dos seis. A
Fase 3 veio depois porque os dois motores dela se apoiaram nos anteriores: o
compilador de TypeScript saiu quase de graça, porque o worker do Monaco já
sabia compilar, e o React entrou no iframe do motor de página. A Fase 4 é a
primeira que precisa de motores sem parentesco com os que existem: o sql.js
entrou primeiro, por escolha do dono do projeto, e é um pacote fechado — o
SQLite inteiro num worker; o servidor simulado (Node) é a metade que falta.

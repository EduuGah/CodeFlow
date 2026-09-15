# Currículo: até a base de um dev júnior

Roadmap de conteúdo **e** de plataforma. A versão navegável está publicada como
artifact; este arquivo é a fonte canônica e deve ser atualizado no mesmo commit
que conclui uma fase.

## Onde estamos

**Fases 1 e 2 de 8 concluídas · Fase 3: TypeScript 10 de 10, React 0 de 14 · publicado**

```
Fase 0  Fundamentos e lógica      ██████████████████████  13/13  pronto
Fase 1  JavaScript real          ██████████████████████  10/10  pronto
        Como a web funciona      ██████████████████████   8/8  pronto
        Plataforma                ██████████████████████   7/7  pronto
Fase 2  A página                 ██████████████████████  26/26  pronto
Fase 3  Tipos e componentes      █████████░░░░░░░░░░░░░  10/24  TypeScript pronto
Fase 4  Back-end e dados         ░░░░░░░░░░░░░░░░░░░░░░   0/20
Fase 5  Profissionalização       ░░░░░░░░░░░░░░░░░░░░░░   0/19
Fase 6  Python                   ░░░░░░░░░░░░░░░░░░░░░░   0/10
Fase 7  Projeto final            ░░░░░░░░░░░░░░░░░░░░░░   0/5
```

| | Hoje | Previsto | Feito |
| --- | ---: | ---: | ---: |
| Aulas | **67** | 135 | 50% |
| Exercícios | **389** | ~700 | 56% |
| Tipos de exercício | **8** | 11 | 73% |
| Motores de execução | **3** | 7 | 43% |
| Projetos | **7** | ~30 | 23% |

**Último trabalho** (2026-09-14): o motor de TypeScript — o compilador na
frente do sandbox, sem download a mais — e a trilha "TypeScript" inteira, 10
aulas e 59 exercícios, com o teste que só existe aqui: o trecho que o
compilador precisa recusar. Antes disso, no mesmo dia, a Fase 2 inteira.

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

### Fase 3 — Tipos e componentes · 24 aulas · EM ANDAMENTO (10 de 24)
Motor **2: o compilador de TypeScript** — **pronto** (2026-09-14). Motor **3
(React no iframe)** — não iniciado.

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

**React — 0 de 14.** Componentes, estado, listas, formulários, efeitos,
buscar dados, estados de erro, composição, contexto, hooks próprios, rotas,
re-render, testar componente, projeto. Depende do motor 3: React e o JSX
transpilado dentro do iframe do motor de página.

Plataforma: tutor com IA; painel do aluno.

### Fase 4 — Back-end e dados · 20 aulas
Motores **4 (servidor simulado)** e **5 (sql.js, ~1,5 MB)**.

- **Node e back-end** (10): Node fora do navegador, pacotes, servidor HTTP,
  rotas, corpo da requisição, middleware, erros e status, autenticação, variáveis
  de ambiente, projeto de API.
- **SQL e modelagem** (10): tabelas, SELECT/WHERE, ordenar, JOIN, agregação,
  subconsultas, escrita, modelar domínio, normalização, índices.

Plataforma: exercício julgado pelo conjunto de linhas devolvido.

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

As 67 aulas de hoje levaram bastante tempo para ficar no padrão do projeto. As
68 restantes são muitas vezes esse trabalho, e os ~310 exercícios novos são a
maior parte dele. Por isso a unidade é a fase: cada uma termina numa versão do
produto que dá para usar. O roadmap escolhe a ordem; não promete prazo.

A Fase 1 foi o primeiro passo por um motivo concreto: era a única que não
precisava de motor nenhum, e é onde estão os testes por propriedade e os
quatro tipos de prática de dev — que mudam a qualidade de todos os exercícios
que vierem depois. A Fase 2 veio em seguida pela mesma lógica invertida: era a
primeira que precisava de um motor novo, e o iframe é o mais barato dos seis. A
Fase 3 está no meio: o compilador de TypeScript saiu quase de graça, porque o
worker do Monaco já sabia compilar; o React no iframe é o próximo motor, e se
apoia no motor de página que já existe.

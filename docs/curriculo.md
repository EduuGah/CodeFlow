# Currículo: até a base de um dev júnior

Roadmap de conteúdo **e** de plataforma. A versão navegável está publicada como
artifact; este arquivo é a fonte canônica e deve ser atualizado no mesmo commit
que conclui uma fase.

## Onde estamos

**Fases 1, 2, 3, 4, 5 e 7 de 8 concluídas · Fase 6 (Python): motor pronto, 1/10 aulas · publicado**

```
Fase 0  Fundamentos e lógica      ██████████████████████  13/13  pronto
Fase 1  JavaScript real          ██████████████████████  10/10  pronto
        Como a web funciona      ██████████████████████   8/8  pronto
        Plataforma                ██████████████████████   7/7  pronto
Fase 2  A página                 ██████████████████████  26/26  pronto
Fase 3  Tipos e componentes      ██████████████████████  24/24  pronto
Fase 4  Back-end e dados         ██████████████████████  20/20  pronto
Fase 5  Profissionalização       ██████████████████████  27/27  pronto
Fase 6  Python                   ██░░░░░░░░░░░░░░░░░░░░   1/10  motor 8 pronto; falta o resto das aulas
Fase 7  Projeto final            ██████████████████████   5/5   pronto; motor 7 inteiro; 3 capstones prontos
```

| | Hoje | Previsto | Feito |
| --- | ---: | ---: | ---: |
| Aulas | **134** | ~150 | 89% |
| Exercícios | **763** | ~800 | 95% |
| Tipos de exercício | **10** | 13 | 77% |
| Motores de execução | **8** | 8 | 100% |
| Projetos | **10** | ~20 | 50% |

**Último trabalho** (2026-09-22): a **Fase 6 começou** — o motor 8,
**Pyodide** (CPython em WebAssembly, ~13,5 MB), e a primeira aula da
trilha de Python. Arquitetura em quatro arquivos, como o motor de SQL
(`python-core.ts` puro, `python.worker.ts`, `python.ts` no cliente,
`python-node.ts` no CI), com uma diferença: recriar o intérprete custa
segundos, não microssegundos, então ele fica vivo entre execuções e cada
uma ganha só um **dicionário de globais novo** — isolado, sem pagar o
carregamento de novo. Duas armadilhas de bundler resolvidas no
`vite.config.ts`: os arquivos do Pyodide não entram por `?url` como o
`.wasm` do sql.js (ele busca os próprios arquivos por um `indexURL` em
tempo de execução, então `vite-plugin-static-copy` os copia para
`/pyodide/`), e o formato padrão do worker no build (`iife`) não suporta
o código dividido que o `pyodide.mjs` carrega dinamicamente — `worker:
{ format: 'es' }` resolve, sem quebrar o motor de SQL (confirmado por
`e2e/sql.spec.ts` de novo, depois da mudança). `track-python`, oitava
etapa do percurso; a aula 1 ("Python Depois de JavaScript") prova o
motor inteiro — `e2e/python.spec.ts`, no Chromium e no celular. Faltam
as outras 9 aulas do roadmap. Antes (mesmo dia): os outros dois
capstones, **Loja com
Carrinho** (`proj-capstone-loja`) e **Blog com Autenticação**
(`proj-capstone-blog`) — fecham os três capstones do projeto final. A
loja reaproveita o banco `loja` da trilha de SQL; o pedido confere
estoque de **todos** os itens do carrinho antes de gravar qualquer um,
para um item sem estoque não descontar os outros ("tudo ou nada"). O
blog tem banco próprio (`usuarios`, `sessoes`, `posts`, `comentarios`):
`POST /cadastro` já devolve o token — não existe tela de login separada
—, e só o dono de um post pode apagá-lo (403 senão); comentar não exige
ser dono de nada. Os dois seguem exatamente o padrão de
`proj-capstone-tarefas` (mesmo dia, veja abaixo): `runtime: 'iframe'`,
`servidor`, checkpoints isolados por servidor novo.
`e2e/capstone-loja.spec.ts` e `e2e/capstone-blog.spec.ts` provam as
soluções de referência no Chromium e no celular. **Os três capstones da
Fase 7 estão prontos.** Antes (mesmo dia): o primeiro capstone, **Lista
de Tarefas com Conta** (`proj-capstone-tarefas`) — o primeiro projeto
aberto de três camadas (página + API + banco), em vez de só JavaScript
puro. Para isso o tipo `Project` ganhou `runtime` e `servidor` (os
mesmos campos que o exercício `code` de página já tinha);
`ProjectWorkspace.tsx` ganhou o painel do servidor, o iframe da página,
e uma versão de `executar`/`verificar` que sobe um servidor novo por
checkpoint (a API e o banco `tarefas` já prontos da trilha do projeto
final, sem nenhuma mudança neles). `e2e/capstone-tarefas.spec.ts` prova
a solução de referência fechando os 4 critérios no Chromium e no
celular. Antes (2026-09-21, noite): a trilha **Terminal e
Ferramentas**, inteira — 5 aulas e 25 exercícios sobre o shell e caminhos,
variáveis de ambiente, os scripts do `package.json` na prática, o que ler
numa saída de erro, e uma aula de fechamento que diagnostica um comando
que falhou combinando as três anteriores. `track-terminal`, mesma etapa do
percurso ("A profissão"). Fecha a **Fase 5 inteira** — Engenharia, Testes,
Git e Terminal, as quatro trilhas. Como Git, sem motor: os exercícios
simulam caminhos, variáveis de ambiente, scripts e stack traces como texto
e objetos JavaScript comuns. `e2e/terminal.spec.ts` conclui cada aula.
Antes (2026-09-21, tarde): a trilha **Git e Equipe**, inteira
— 6 aulas e 33 exercícios sobre commit atômico, branch por assunto, pull
request e revisão, conflito e seus marcadores, squash e a regra de nunca
reescrever histórico compartilhado, e o que nunca deveria entrar no
repositório. `track-git`, sétima etapa do percurso ("A profissão"), ao lado
de Testes e Qualidade. Sem motor novo: como não existe Git de verdade no
sandbox, os exercícios simulam o raciocínio (mensagens, branches e
conflitos como texto e objetos JavaScript comuns) nos tipos já existentes.
Antes (2026-09-21, madrugada): a trilha **Testes e
Qualidade**, inteira — 8 aulas e 41 exercícios sobre arrange/act/assert, um
comportamento por teste, dublês, testar o servidor com `pedir`, cobertura
como pista, testes frágeis e o teste de regressão. `track-testes`, mesma
etapa do percurso. Isso exigiu um conserto no próprio motor
do exercício `escrever o teste`: o teste do aluno agora entra como uma
verificação assíncrona do sandbox (a mesma forma que os exercícios de
código já usavam), em vez de texto colado dentro do programa — o que
faltava para `assert` com `await pedir(...)` funcionar, e é o que a aula 5
usa. Antes (2026-09-21, noite): o **projeto final ficou completo** —
as aulas 4 e 5 ("A Página sobre a API", "Fechar: Testar, Documentar,
Publicar") e a segunda metade do **motor 7**: o servidor do exercício sobe
num worker e fica de pé (`abrirServidorVivo`), e o `fetch` de mentira do
iframe manda cada pedido ao pai por mensagem, que o entrega ao worker e
devolve a resposta — a página do aluno lista, cria, marca e apaga tarefas
numa API de verdade sobre o SQLite, sem porta nenhuma. O CI faz o mesmo no
jsdom com o servidor no Node. O exercício `code` de página ganhou o campo
`servidor` (código, arquivos, env, banco); a tela mostra o servidor antes e
os pedidos que a página fez depois. À tarde: as três primeiras aulas (o
desenho; o banco e o repositório; a API sobre o banco) e a primeira metade
do motor — o SQLite dentro do worker do servidor, `require('./banco')`, o
campo `banco`, o banco de exemplo `tarefas`. De manhã: a trilha
**Engenharia: Organizar um Projeto**, inteira — 8 aulas e 48 exercícios sobre coesão e acoplamento,
módulos como fronteiras, pastas por responsabilidade, nomes, funções
pequenas, erros como contrato, dependências e o `package.json`, e o projeto
que outra pessoa lê. Roda no motor 4, que ganhou o que a trilha precisava:
`require` resolvido como no Node (`../` relativo a quem pede, pasta com
`index.js`) e o `caminho` do arquivo do aluno (`'./precos/index'`), para ele
escrever um arquivo de dentro de uma pasta com os vizinhos à vista. Abre a
quinta etapa do percurso, "O ofício". No mesmo dia, três retornos do dono do
projeto: o encontrar-o-bug passou a fazer uma pergunta só ("a linha que
precisa mudar") sem entregar o diagnóstico, o NaN ganhou explicação antes do
uso, e um exercício da aula 3 de JavaScript deixou de usar `for` antes da
aula de laços. Antes disso (2026-09-20): as sete aulas que faltavam de "Node e
APIs" — corpo e JSON, status e erros, middleware e autenticação, CRUD,
assincronia no servidor, configuração e segredos, e o projeto da API inteira
— 45 exercícios, 21 deles de servidor. A Fase 4 fechou. As aulas 8 a 10
fornecem módulos prontos em `arquivos` (um repositório assíncrono, `auth`,
`erros`, `config`, `rotas`) e o aluno escreve o que falta; o projeto termina
com o `servidor.js` que só monta a corrente. Antes disso (2026-09-17): o
motor 4, o **servidor simulado** — um Node de mentira dentro do sandbox de
sempre, com um Express pequeno, `require` de arquivos do exercício,
`process.env` e o `pedir()` dos testes — e as três primeiras aulas. E antes
(2026-09-16): o motor de SQL — o sql.js num worker, o
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

- **Node e APIs** (10) — **feita**: Node fora do navegador, o servidor, rotas,
  corpo e JSON, status e erros, middleware e autenticação, CRUD, assincronia,
  configuração e segredos, projeto de API.
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

**Node e APIs — 10 de 10.** Motor 4 (servidor simulado) — **pronto**
(2026-09-17); as dez aulas, 2026-09-20. A trilha `track-node` abre a quarta
etapa do percurso, "A aplicação inteira", em quatro blocos: o servidor (1–3),
escrever e falhar bem (4–5), proteger e completar (6–7), do protótipo ao real
(8–10). 64 exercícios, 30 de servidor.

Como o motor 4 funciona, para quem for escrever mais aulas: em aula com
`language: 'node'`, todo exercício roda no sandbox de sempre com o prelúdio
de `servidor-core.ts` na frente — `require('express')` devolve o Express
pequeno, `require('./x')` acha o que o exercício pôs em `arquivos`,
`process.env` é o `env` do exercício, `module.exports` funciona, e os testes
rodam **em série**. O exercício `server` é o `code` com `arquivos`, `env` e
a tela de pedidos e respostas; os testes chamam `pedir(app, 'GET', '/rota',
{ body, headers })` e leem `status`, `body` (JSON já convertido) e `texto`.
Um exercício `server` sem `pedir` nos testes é um exercício de módulo (o
botão diz "Executar código"). O que o Express pequeno tem: rotas com
`:parametro`, `req.query`, `req.body` só depois de `express.json()`,
`res.status/json/send/set`, `app.use` com prefixo, `next`, middleware de
erro com quatro argumentos, 404 e 500 padrão, `listen` com callback
assíncrono. O que não tem: `require` de qualquer outro pacote, disco,
rede. O CI prova que a solução de cada `server` responde tudo, que o código
inicial não passa, e que toda verificação com `pedir` fez o pedido.

| Aula | Assunto |
| --- | --- |
| 1 | Node fora do navegador: o que muda, `process.env`, `module.exports`/`require`, `exports =` que não funciona |
| 2 | O primeiro servidor: porta, `express()`, `app.get`, `req`/`res`, `res.send`/`res.json`, `listen` assíncrono |
| 3 | Rotas e parâmetros: `req.params` (texto!), `req.query`, 404 com `return`, a ordem das rotas |
| 4 | Corpo e JSON: `express.json()` antes das rotas, POST e 201 com o criado, o id do servidor, validar e recusar com 400 e `return`, ler-validar-guardar-responder, JSON estrito |
| 5 | Status e erros: as famílias e "quem consertaria?", 400/404/409/500, o middleware de erro de quatro parâmetros por último, `next(erro)`, `ErroHttp` com status, a mensagem interna fica no log, um formato só |
| 6 | Middleware e autenticação: a corrente (responder encerra, `next()` passa, nenhum dos dois pendura), o `req` que atravessa, `app.use` geral/por prefixo/por rota, `Authorization: Bearer` e `req.headers` em minúsculas, 401 contra 403 |
| 7 | CRUD: PUT substitui, PATCH altera parte (campo validado se veio), DELETE e 204 sem corpo, campo a campo, `splice` contra `filter` com `let`, idempotência; refatorar a busca com 404 para uma função |
| 8 | Assincronia no servidor: o repositório (funções que devolvem Promises, fornecido em `arquivos`), rotas `async` com `await`, esquecer o `await` responde `{}`, `await` fora de `async` é erro de sintaxe, o erro cai no middleware (Express 5), `Promise.all` para buscas independentes |
| 9 | Configuração e segredos: `process.env` é texto e pode faltar, converter e dar padrão, falhar cedo sem a chave, `.env` fora do Git e `.env.example` dentro, módulo de configuração congelado, `NODE_ENV`, segredo não entra em código/commit/log/resposta/URL |
| 10 | Projeto: a tabela de recursos antes do código (toda tarefa tem dono), um arquivo por responsabilidade, dependência num sentido só, a ordem de construção, o `servidor.js` que só monta a corrente, CORS quando a página chamar; módulos prontos em `arquivos` e o aluno escreve as rotas e o servidor |

## O que o dono do projeto pediu em 2026-09-17

Depois de uma rodada inteira de plataforma (gamificação, perfil, temas,
figuras, cenas), a ordem foi **voltar às aulas**, com três alvos:

1. **Do zero a uma aplicação completa**: página + API + banco, integrados.
   Era a Fase 4 que faltava (Node e APIs, motor 4 — feita em 2026-09-20)
   mais o capstone da Fase 7 — a página que já se sabe fazer chamando a API
   que agora se sabe escrever, sobre o SQL que já se sabe consultar.
2. **Uma área de engenharia**: como dividir os arquivos em pastas, boas
   práticas, o que faz um projeto ser legível por outra pessoa. Vira uma
   trilha própria na Fase 5 ("Engenharia: organizar um projeto"), sem motor
   novo — módulos e `import/export`, pastas por responsabilidade, nomes,
   funções pequenas, erros, configuração e segredos, README, revisão.
3. **Mais linguagens**, mais adiante — Python (Fase 6) é a primeira.

A ordem escolhida: motor 4 e a trilha de Node (era o pedaço que faltava para
a aplicação completa — feito), depois a trilha de engenharia, depois o
capstone.

Também saiu o "Pular por ora": um exercício sem resposta verificada não deixa
avançar; responder errado libera ("Continuar assim mesmo").

### Fase 5 — Profissionalização · 27 aulas
Motor: **nenhum novo**. Encaixa em qualquer buraco entre as outras fases. Foi
o dono do projeto quem pediu a primeira trilha desta fase, em 2026-09-17:
"uma área que explica engenharia, como dividir os arquivos em pastas, boas
práticas".

**Engenharia: organizar um projeto — 8 de 8** (2026-09-21). Trilha própria,
`track-engenharia`, linguagem `node` (o motor 4: `require`/`module.exports`,
vários arquivos por exercício). Em três blocos: Dividir (1–3), Escrever
(4–6), Entregar (7–8). O aluno recebe projetos pequenos já escritos e
escreve ou reescreve **um arquivo por vez** — a porta de um módulo, o
`index.js` de uma pasta, o serviço que fica em `servicos/` e requer
`../dados/` —, com os vizinhos à vista acima do editor. A correção é por
comportamento (os testes chamam o que o módulo exporta, ou fazem `pedir`)
mais as restrições de forma do exercício de refatorar (`required`,
`forbidden`), que é o tipo mais usado aqui: 6 dos 13 do catálogo. O que o
motor 4 ganhou para isto: `require` resolvido relativo a quem pede, com
`../` e pasta com `index.js`, e o campo `caminho` do exercício `server`, que
diz onde o arquivo do aluno mora.

| Aula | Assunto |
| --- | --- |
| 1 | Por que separar: o custo do arquivo que faz tudo; coesão e acoplamento em palavras simples; uma razão para mudar; dividir com rede de segurança, uma extração por vez |
| 2 | Módulos como fronteiras: a porta é o `module.exports`, exportar o mínimo; `index.js` como porta da pasta; dependência num sentido só e o ciclo que entrega um módulo pela metade |
| 3 | Pastas por responsabilidade: por tipo espalha cada assunto; os dois esqueletos; `util/` só para o que não sabe do domínio; mover um arquivo muda os `require` dos dois lados |
| 4 | Nomes: verbo, substantivo, pergunta; sem abreviação, sem mentira; uma palavra por conceito; o arquivo se chama pelo que exporta; renomear é barato |
| 5 | Funções pequenas: o nome sem "e"; extrair em cinco passos; parâmetro em vez de cópia e a regra dos três; retornos cedo, sem `else`; quando não extrair |
| 6 | Erros como contrato: "não tem" devolve, "não dá" lança; falhar cedo com mensagem que explica; erros com nome (`extends Error`, `super` primeiro); tratar num lugar só, nunca engolir |
| 7 | Dependências e o `package.json`: `dependencies` e `devDependencies`, semver e o que `^` promete, versão é três números, o lockfile e `npm ci`, antes de instalar, `npm outdated`/`audit` |
| 8 | O projeto que outra pessoa lê: README (o que é, como rodar, como testar); comentários dizem por quê; formatador e linter; revisão como conversa; apagar também é organizar |

A aula 7 mudou em relação ao plano: configuração e segredos já é a aula 9
de Node, então aqui entrou o que faltava — as dependências. O item de `npm`
sai da trilha de Terminal.

**Testes e qualidade — 8 de 8** (2026-09-21). Trilha própria,
`track-testes`; a maioria em JavaScript puro (motor 1), a aula 5 em `node`
(motor 4). O tipo central é o `write-test`, que já existia desde a trilha
de arrays: o aluno recebe uma implementação correta e escreve `assert`s
sobre ela, verificados contra a implementação **e** contra sabotagens. Foi
preciso mudar `escrever-teste.ts`: o teste do aluno virou uma `SandboxTest`
própria (com o corredor assíncrono e o prazo por verificação que os
exercícios de código já tinham), em vez de texto concatenado dentro do
programa — sem isso, `await pedir(...)` dentro do teste do aluno era um
erro de sintaxe (`await` fora de função `async`). O outro tipo de prática
usado: `refactor` (testes que sobrevivem a uma reescrita) e `find-bug`
(um teste com mensagem ruim que também não pega o bug certo).

| Aula | Assunto |
| --- | --- |
| 1 | Por que testar: o que um teste prova (só os casos que executa) e o que não prova; o custo de não testar; quando não vale a pena; `assert` |
| 2 | Arrange, Act, Assert: a forma de todo teste; um "act" por teste; o arrange implícito |
| 3 | Um teste por comportamento: dividir por regra, testar os limites exatos, nomes que documentam a regra do negócio |
| 4 | Dublês: injeção de dependência, o espião como dublê mais comum (`vi.fn` faz o mesmo pronto), quando o dublê precisa devolver algo |
| 5 | Testando o servidor: `pedir()` como cliente, um teste por rota e por caso, o servidor tem estado entre pedidos (testes em série) |
| 6 | O que não testar: cobertura mede execução não verificação, é pista não meta; onde há decisão vale testar, código sem lógica vale menos |
| 7 | Testes frágeis: comportamento (a porta) contra implementação (o como); código-fonte, variável interna e ordem não garantida como armadilhas |
| 8 | O teste que pega o bug de ontem: reproduzir antes de consertar, ver falhar primeiro, manter para sempre; nomear a combinação, não o chamado |

**Git e equipe — 6 de 6** (2026-09-21). Trilha própria, `track-git`, em
JavaScript puro (motor 1) — não existe motor de Git; os exercícios simulam
o raciocínio (mensagens como texto, branches como listas, conflitos como
marcadores num arquivo), porque a habilidade ensinada é a decisão, não a
sintaxe do comando. Sétima etapa do percurso, "A profissão", ao lado de
Testes e Qualidade. Mistura os tipos já existentes — `code`, `find-bug`,
`multiple-choice`, `order-steps`, `predict-output` e um `write-test`
(escrever asserções sobre um `squash` de commits correto) — sem exigir
nenhum novo.

| Aula | Assunto |
| --- | --- |
| 1 | O commit como frase: mudança lógica só, uma razão para existir; resumo no imperativo até 50 caracteres; o corpo explica o porquê, o diff já mostra o quê |
| 2 | Uma branch por assunto: isola trabalho em andamento do main; nasce da branch atualizada, vive pouco; o nome diz o assunto |
| 3 | Pull request e revisão: por que uma segunda pessoa pega o que quem escreveu não vê mais; PR pequeno e focado é revisável, PR de 40 arquivos não é |
| 4 | Conflito sem pânico: nasce quando duas branches mudam a mesma linha; os marcadores `<<<<<<<`/`=======`/`>>>>>>>`; resolver é combinar as duas intenções, sempre testando depois |
| 5 | Histórico que conta uma história: para quem o `git log` é escrito; squash junta os passos de um trabalho; a regra de ouro — nunca reescrever histórico já compartilhado |
| 6 | O que não entra no repositório: gerado, secreto ou da máquina não é código-fonte; padrões do `.gitignore`; um segredo já commitado se resolve trocando a chave, não só ignorando o arquivo |

**Terminal e ferramentas — 5 de 5** (2026-09-21). Trilha própria,
`track-terminal`, em JavaScript puro — como Git, sem motor de terminal de
verdade: os exercícios simulam caminhos, variáveis de ambiente, scripts e
stack traces em JavaScript comum. Mesma etapa do percurso que Git e
Testes, "A profissão". O `package.json`, o semver e o lockfile já são a
aula 7 de Engenharia; esta trilha cobre o resto — navegar, configurar,
rodar os scripts do dia a dia, e ler o que deu errado.

| Aula | Assunto |
| --- | --- |
| 1 | O shell e o caminho: `pwd`/`cd`/`ls`; absoluto (começa em `/`) contra relativo (parte de onde você está); `.`, `..`, `~`; resolver um caminho relativo, a mesma lógica de `require('./x')` |
| 2 | Variáveis de ambiente: definidas por fora, lidas por `process.env`; o mesmo código roda diferente por ambiente; ler com `!== undefined`, não `\|\|`, para não confundir "ausente" com "vazio"; PATH como lista ordenada de pastas |
| 3 | Scripts do package.json na prática: `npm run` procura e roda; `pre`/`post` entram sozinhos; `&&` encadeia e para na primeira falha |
| 4 | O que ler numa saída de erro: código de saída 0 é sucesso; um stack trace aponta de onde para quem chamou; a primeira linha do próprio código é onde procurar, não a de uma biblioteca |
| 5 | Diagnosticar um comando que falhou: junta as três anteriores — código de saída diz que falhou, stack trace aponta onde, variável de ambiente ausente é a causa mais comum e mais barata de conferir |

Fecha a Fase 5 inteira.

### Fase 6 — Python · 10 aulas, 1 de 10 feita
Motor **8: Pyodide, ~13,5 MB** — pronto (2026-09-22). Por último entre os
motores pelo peso, não pela importância — é a primeira linguagem pedida
pelo dono do projeto ("futuramente quero mais linguagens"). Carregado sob
demanda, só em aula de Python, com aquecimento ao montar, como o SQL. A
correção continua sendo por comportamento: os testes são `assert` em
Python rodando no mesmo Pyodide — uma função por teste, o corpo é a
asserção, e uma exceção vira falha com mensagem, sem derrubar os outros
testes.

Arquitetura em quatro arquivos, como o motor de SQL: `python-core.ts`
(puro), `python.worker.ts` (o Pyodide no navegador), `python.ts` (fila e
prazos, no cliente), `python-node.ts` (o mesmo pacote no CI). A diferença
que o SQL não tinha: recriar o intérprete custa segundos, não
microssegundos, então ele fica vivo entre execuções — mas cada uma ganha
um **dicionário de globais novo**, não um intérprete novo, isolando uma
da outra sem pagar o carregamento de novo. No `vite.config.ts`: os
arquivos do Pyodide são copiados para `/pyodide/` por
`vite-plugin-static-copy` (ele busca os próprios arquivos por um
`indexURL`, diferente do `?url` do sql.js), e o worker passou a compilar
como módulo ES (`worker: { format: 'es' }`) porque o `pyodide.mjs`
carrega código dividido, que o formato padrão do build não suporta —
mudança que não afetou o motor de SQL.

| Aula | Assunto |
| --- | --- |
| 1 | Python depois de JavaScript: indentação, `print`, tipos, o que muda e o que é igual — **feita** |
| 2 | Condições e laços: `if/elif/else`, `for` sobre coleções, `range`, `while` |
| 3 | Funções: parâmetros nomeados, valores padrão, retorno múltiplo, docstring |
| 4 | Listas e compreensões: o `map`/`filter` do Python |
| 5 | Dicionários e conjuntos: o objeto e o `Set`, e o que muda |
| 6 | Strings e f-strings: fatiar, formatar, `split`/`join` |
| 7 | Erros: `try/except/finally`, exceções com nome, `raise` |
| 8 | Classes: `__init__`, métodos, `self`, quando uma classe vale a pena |
| 9 | Módulos e a biblioteca padrão: `import`, `json`, `datetime` |
| 10 | Projeto: um script que lê dados, transforma e escreve um relatório |

### Fase 7 — Projeto final · 5 aulas, 3 capstones
Do zero a uma aplicação completa, o pedido central do dono do projeto:
**página + API + banco, integrados**. A página que se aprendeu a fazer na
Fase 2 chamando a API que se aprendeu a escrever na Fase 4, sobre o SQL que
se aprendeu a consultar.

Plataforma: o **motor 7, a aplicação inteira** — o servidor simulado (motor
4) e o SQLite (motor 5) no mesmo worker, e a página do motor 1 fazendo
`fetch` para ele. É a única fase que junta motores, e **está feito**
(2026-09-21). A primeira metade: `servidor-banco.worker.ts` carrega o
SQLite e roda o sandbox de sempre com o banco injetado (`runProgram` ganhou
`globais`); o prelúdio do servidor entrega `require('./banco')` —
`consultar(sql, params)` e `executar(sql, params)`, Promises, parâmetros
com `?` —; o exercício `server` tem o campo `banco`; a tela mostra
`banco.sql` entre os arquivos e "O banco depois" com as tabelas; o CI roda
o mesmo `sql.js` no Node; o prazo de execução com banco é 8 s. A segunda
metade: o worker atende um protocolo de serviço (`worker-servico.ts`:
`servir`, `pedir`, `trocas`) e fica de pé (`abrirServidorVivo`, em
`sandbox.ts`); o prelúdio deixa o último `app` e o `pedir` em `globalThis`
(`subirServidor`, em `servidor-core.ts`); o documento da página ganha, só
com servidor, um `fetch` que manda o pedido ao pai por `postMessage` e
recebe a resposta pelo id (`PONTE`, em `pagina-core.ts`); `executarPagina`
e `rodarPaginaNoJsdom` encaminham os pedidos ao servidor vivo. O exercício
`code` de página tem o campo `servidor` (código, arquivos, env, banco), e
o CI sobe esse servidor no Node antes de rodar a página no jsdom — o mesmo
caminho do navegador, só que sem worker.

**Trilha `track-projeto` — 5 de 5.** Linguagem `node`; é a única trilha
em que exercícios de SQL, de servidor e de página convivem na mesma aula
(o CI abre a exceção do SQL só para ela). O banco de exemplo `tarefas`
(usuários, sessões, tarefas com dono) serve às aulas de SQL e aos
exercícios com `banco`; os arquivos da API ficam em
`lessons/proj-servidor.ts`, reaproveitados pelas aulas 3, 4 e 5.

| Aula | Assunto |
| --- | --- |
| 1 | O desenho antes do código: as três camadas e o papel de cada uma (a verdade mora no banco, só a API o toca, a página nunca confia em si), os dados, os recursos como contrato, a tela e seus estados, a ordem de baixo para cima, o que "pronto" quer dizer — **feita** |
| 2 | O banco e o repositório: tabelas que se defendem, a migração, o repositório como único módulo que sabe SQL, parâmetros e nunca concatenação (a injeção mostrada), o que cada função devolve, `feita` em 0/1 — **feita** |
| 3 | A API sobre o banco: o login que lê `sessoes` com `JOIN`, as rotas que compõem, o dono conferido num lugar só, `paraApi` em toda resposta, o contrato e o que o quebra, CORS na publicação — **feita** |
| 4 | A página sobre a API: a página não sabe nada, o cliente da API num lugar só (token, JSON, erro virando exceção), os quatro estados, a lista como função dos dados, recarregar depois de mudar, o formulário, marcar e apagar por delegação — cada exercício com a API de pé atrás da página — **feita** |
| 5 | Fechar: a lista do "pronto" vira o roteiro de fumaça (uma página que faz os pedidos e relata), o teste do contrato (`paraApi` com sabotagens), o README com as decisões, publicar (o que muda: ambiente e CORS; o que não muda: nenhuma linha), a ordem de publicar — **feita** |

**Os três capstones estão feitos (2026-09-22)**: a forma escolhida foi
estender o tipo `Project` (não um tipo novo de vários arquivos) — ele
ganhou `runtime` e `servidor`, os mesmos campos do exercício `code` de
página, e `ProjectWorkspace.tsx` ganhou o painel do servidor, o iframe e
uma `verificar()` que sobe um servidor (com banco) novo por checkpoint.

- **Lista de tarefas com conta** — tarefas por usuário, feitas e pendentes, filtro e busca — **feito**: `proj-capstone-tarefas`, reaproveitando a API e o banco `tarefas` prontos das aulas 3–5, sem mexer neles; a página soma filtro por estado e busca por título, os dois no cliente, sobre os dados já carregados.
- **Loja com carrinho** — o banco da trilha de SQL virando produto: catálogo, carrinho, pedido, estoque que abaixa — **feito**: `proj-capstone-loja`, reaproveitando o banco `loja` da trilha de SQL (`clientes`, `produtos`, `pedidos`, `itens`) sem mudar nada nele; `POST /pedidos` confere o estoque de **todos** os itens antes de gravar qualquer um — um item sem estoque recusa o pedido inteiro, sem descontar os que tinham estoque de sobra.
- **Blog com autenticação** — cadastro, login com token, posts só do dono, comentários — **feito**: `proj-capstone-blog`, com banco próprio (`usuarios`, `sessoes`, `posts`, `comentarios`); `POST /cadastro` já devolve o token — a decisão deliberada foi não ter uma tela de login separada, para manter o escopo focado no que o cabeçalho `Authorization` faz — e `DELETE /posts/:id` responde 403 para quem não é o dono, enquanto comentar não exige ser dono de nada.

Plataforma, além do motor 7: fechar as pontas do CodeFlow — desempenho do
pacote, revisão num telefone real, passagem final de acessibilidade.

### Depois: mais linguagens
Cada linguagem nova custa um motor que a rode no navegador, e o motor decide
a ordem. Candidatas, com o custo conhecido hoje:

| Linguagem | Motor possível | Custo | Quando |
| --- | --- | --- | --- |
| Python | Pyodide (CPython em WebAssembly) | ~13,5 MB, sob demanda | Fase 6 — motor pronto, em andamento |
| C# | .NET em WebAssembly (o mesmo do Blazor) | ~15 MB | depois da Fase 7 |
| Go | TinyGo compilando para WebAssembly num worker | compilação pesada no navegador; a alternativa como serviço precisaria de um servidor, o que o projeto evita | depois da Fase 7 |
| Java | CheerpJ ou TeaVM | ~20 MB, licença a conferir | a decidir |
| Rust | o compilador não roda no navegador; só serviço externo | não cabe na regra "tudo no navegador" | não previsto |

A regra que já valeu para SQL e Node vale para todas: **o código que o aluno
escreve aqui é o mesmo que rodaria fora**, e a correção é por comportamento.
Uma linguagem cujo motor exigiria um servidor no meio quebra a regra e fica
para depois.

### Tipos de exercício que faltam
Um por fase, cada um preso ao motor dela:

- **Consertar a tela** (motor 1): a página está errada, o aluno corrige o
  CSS ou o DOM até o teste ver o que espera. Cabe na Fase 2 a qualquer
  momento.
- **Reorganizar o projeto** (motor 4, vários arquivos editáveis): mover,
  renomear, extrair entre arquivos, com testes de comportamento e restrições
  de forma. A trilha de engenharia saiu sem ele — os exercícios editam um
  arquivo por vez, com os vizinhos fornecidos — e é o que a tornaria mais
  forte: um editor com abas sobre os `arquivos` do exercício.
- **Construir do zero** (motor 7): o capstone, com critérios de aceitação em
  três camadas.

## Sobre tamanho

As 134 aulas de hoje levaram bastante tempo para ficar no padrão do projeto.
As ~9 restantes (o resto de Python) são muitas vezes esse trabalho. Por
isso a unidade é a fase: cada uma termina numa versão do produto que dá
para usar. O roadmap escolhe a ordem; não promete prazo.

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

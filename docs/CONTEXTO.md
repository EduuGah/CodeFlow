# CONTEXTO — CodeFlow

Documento de retomada. Escrito para alguém — ou alguma sessão — que não viu nada
do que veio antes e precisa continuar sem redescobrir tudo.

Atualizado em 2026-09-16. **Mantenha-o atualizado no mesmo commit que muda o que
ele descreve.** Um documento de contexto desatualizado é pior que nenhum: induz a
decisões erradas com aparência de informação.

---

## 1. O que é

Plataforma de ensino de programação em português. Aulas curtas em passos, código
do aluno rodando no navegador, correção que explica o porquê do erro — não apenas
se acertou.

Repositório: `EduuGah/CodeFlow`. Trabalho direto no `main`, com push autorizado
pelo usuário. CI obrigatório a cada push.

## 2. Pilha

- React 18 + Vite 5 + TypeScript + Tailwind v4 (tokens em `@theme`)
- Express apenas para servir (tsx em dev, esbuild no build)
- Supabase: autenticação Google + Postgres com RLS
- Vitest (unidade e componente) + Playwright (navegador)
- Monaco como editor, servido do próprio domínio num chunk sob demanda
- sql.js (SQLite em WebAssembly) para a trilha de SQL, num worker próprio

## 3. Estado atual

Números lidos do catálogo, não de memória.

| | |
| --- | --- |
| Trilhas | 7 — Fundamentos de JavaScript (20 aulas), Lógica (3), Como a Web Funciona (8), A Página (26), TypeScript (10), React (14), SQL e Bancos de Dados (10) |
| Aulas | 91, somando 2.556 minutos, em blocos por assunto (`Track.sections`) |
| Exercícios | 532, em 9 tipos — 142 de múltipla escolha, 124 de código, 80 de lacuna, 56 de prever saída, 43 de SQL, 40 de ordenar passos, 36 de encontrar o bug, 6 de refatorar, 5 de escrever o teste. 78 exercícios de página (`runtime: 'iframe'`), 42 de componente React (a aula é `language: 'react'`), 16 com trechos de tipo (`typeTests`). **Toda aula tem ao menos um dos quatro tipos de prática de dev** |
| Verificação | 731 casos fixos + 58 propriedades + 66 verificações de SQL (por linhas devolvidas) |
| Projetos | 7, com 22 critérios de aceitação |
| Conceitos | 87, com grafo de pré-requisitos |
| Flashcards | 22 |
| Testes | 2.104 de unidade + 278 de navegador |
| Pacote | 2.385 kB (667 kB comprimido) no chunk principal — o conteúdo vai junto; o Monaco são mais 3.362 kB (869 kB) num chunk à parte, baixado só quando o primeiro editor monta, e o worker de TypeScript (7 MB) só quando um modelo JS/TS abre. O motor de TypeScript não acrescentou arquivo; o de React acrescentou um chunk de 143 kB (47 kB) com o React e o ReactDOM como texto, baixado só por um exercício de React; o de SQL acrescentou o worker (49 kB) e o SQLite em WebAssembly (658 kB), baixados só por um exercício de SQL |

## 4. Decisões que não devem ser desfeitas sem motivo forte

Cada uma tem uma razão que não é óbvia lendo o código.

**Conteúdo é código, não linhas no banco.** Aulas, exercícios e projetos vivem em
módulos TypeScript sob `src/content/`, validados por Zod na carga. O CI prova que
cada exercício é resolvível — rodando a solução de referência no sandbox de
verdade — e que o esqueleto **não** passa. Um formulário gravando no banco jogaria
fora essas três garantias. Por isso a tela de administração **gera o módulo** para
revisão em pull request, em vez de escrever no banco.

**Quase nada é contador.** XP, nível, sequência, domínio por conceito, cartões
vencidos, **moedas ganhas e desafios cumpridos** são todos derivados do
histórico append-only (`exercise_attempts`, `flashcard_reviews`, e agora
`purchases`). Contador desnormalizado é uma segunda fonte de verdade que
diverge no primeiro erro de escrita — e ninguém descobre, porque número errado não
quebra nada.

**A economia é derivada, e a loja não vende aprendizado.** As moedas ganhas
(`lib/economia.ts`) saem de aulas, projetos, desafios cumpridos e marcos de
sequência; as gastas são a tabela `purchases`, append-only; o saldo é a
diferença. O que se compra: **congelar a sequência** (um dia sem estudar não
zera; consumido sozinho no primeiro dia perdido depois da compra —
`lib/sequencia.ts` reconta a corrente com os congelamentos), **dobro de XP por
24 h** (a compra é um fato com hora, e `computeXp` dobra o que aconteceu na
janela — exercício pelo primeiro acerto, aula pelo fechamento, revisão pela
primeira; projeto não tem hora e não dobra), e cosméticos (temas e avatares)
que também abrem por nível. Nada compra resposta, dica nem avanço. Os
**desafios** (`lib/desafios.ts`) são um rodízio pela data — dois por dia de
cinco, dois por semana de seis; dias seguidos nunca repetem — e cumprir é
receber: não há tabela de resgate. Os **níveis não têm teto**: o mínimo do
nível *n* é `75·n·(n−1)`, e os títulos marcam faixas (Explorador… Mestre).

**Tema e cor de destaque são variáveis de CSS, não classes.** Todo token de
cor do `@theme inline` aponta para uma variável em `:root`; o modo escuro e as
quatro cores de destaque (Floresta, Oceano, Brasa, Ameixa) só redefinem as
variáveis conforme `data-theme` e `data-accent` no `<html>`. Os papéis da
escala da marca se mantêm entre os modos (50/100 fundo, 600 preenchimento com
texto branco, 700 texto sobre fundo claro, e `brand-hover` para o hover da
ação primária — o 700 do escuro é cor de texto). A preferência mora no
`localStorage` (o `index.html` pinta antes do React) e no perfil (vence ao
carregar). Cada trilha tem uma cor própria (`lib/cores-das-trilhas.ts`) no
percurso, na faixa e no cabeçalho da aula.

**O avanço nunca é bloqueado.** O caminho avisa quando um pré-requisito está
fraco; não tranca. Transformar dificuldade em parede é o oposto do objetivo.

**A correção julga comportamento, nunca texto.** Qualquer implementação que
funcione passa. Comparar com gabarito ensinaria a adivinhar o que o professor
quer, em vez de resolver o problema.

**A página do aluno roda num iframe de origem opaca.** `sandbox="allow-scripts
allow-modals"` — sem `allow-same-origin` — e uma CSP com `default-src 'none'`.
Nada lá dentro alcança a sessão do Supabase, o `localStorage` da aplicação ou
a rede. Os testes rodam **dentro** do iframe, com `document` à mão, e voltam
por `postMessage`; o pai só aceita a mensagem cuja `source` é a janela do seu
próprio iframe. `'unsafe-eval'` está na CSP porque as asserções passam por
`new Function` — o Chromium recusava sem ele, e o jsdom, que ignora CSP, não
tinha como avisar. Dentro da página, `localStorage` e `sessionStorage` são
uma versão em memória (a origem opaca lança ao tocar nos reais) e `fetch` é
um dublê que responde a partir de `window.__servidor`, que o próprio
exercício define — 404 para o resto, 30 ms de atraso para os estados de
carregamento existirem. Nada disso alcança a rede nem o armazenamento da
aplicação; o E2E de isolamento prova.

**O TypeScript compila no worker que o Monaco já carrega.** O pacote
`typescript` inteiro são 9 MB; o worker de TypeScript do editor já os tem, e
sabe emitir JavaScript. O motor cria uma **segunda instância** desse worker
só para compilar (`typescript.ts`), porque o serviço do editor enxerga todos
os modelos como um programa só e o código do aluno colidia com a cópia da
compilação. No CI é o pacote `typescript` no Node, na mesma versão — um teste
confere. Opções, declarações do sandbox e o formato dos erros vivem em
`typescript-core.ts`, puro; os dois compiladores só concordam porque leem
dali. O JavaScript gerado entra no sandbox comum: o motor novo é só o passo
da frente.

**O React do aluno roda dentro do iframe do motor de página, embutido.** O
componente em TSX passa pelo compilador do motor 2 com `jsx` ligado — com
declarações do React e do DOM escritas à mão em `react-core.ts`, que só
entram em aula de React (em TypeScript puro, `document` continua recusado) —
e o JavaScript vai para o documento do iframe junto com o texto dos builds
UMD do React 18 (o `exports` do react-dom não expõe a pasta `umd`; o import é
pelo caminho, com `?raw`). `App` é montado com `flushSync`. Os testes de
página rodam **em série** (`buildProgram` com `sequencial`), porque
compartilham o DOM. O iframe tem `allow-forms`: sem ele o Chromium não
dispara o `submit` no clique nem no Enter, e a pré-visualização ficava muda
num formulário certo.

**O SQL roda num SQLite de verdade, dentro de um worker que fica vivo.** O
`sql.js` (SQLite compilado para WebAssembly, 658 kB, servido do próprio
domínio) roda em `sql.worker.ts`; o worker é criado no primeiro exercício de
SQL — o componente o aquece ao montar, para o primeiro "Executar" responder
na hora — e reaproveitado, porque compilar o WebAssembly custa centenas de
milissegundos num celular. É descartado só quando uma consulta estoura os 3
segundos (o único jeito de interromper um `WITH RECURSIVE` sem fim). O
julgamento é por **linhas devolvidas** (`sql-core.ts`, puro): dois bancos
iguais recebem o SQL do aluno e o de referência, e uma consulta rodada nos
dois — a própria do aluno, ou a `query` da verificação — precisa devolver
as mesmas linhas. Nunca se compara o texto do SQL; a ordem só conta com
`ordered`, o nome da coluna só com `columns`, e uma verificação em que a
referência é **recusada** pelo banco cobra a mesma recusa do aluno — é como
se testa NOT NULL, CHECK e chave estrangeira. Cada verificação parte de um
banco novo, para um teste que escreve não contaminar o seguinte. O banco de
exemplo (`bancos/loja.ts`) é recriado a cada execução, e o CI confere que o
painel de tabelas descreve exatamente o que o SQL cria.

**A tela inicial e a de trilhas mostram o percurso, não a trilha padrão.**
`content/percurso.ts` nomeia três etapas ("A base", "A web", "As ferramentas
do trabalho") na ordem de `listTracks()`, e `lib/percurso.ts` monta o
percurso do aluno — cada trilha com caminho, resumo e estado — e responde
"em qual trilha eu estou" (`trilhaDaVez`: a da última atividade, senão a
primeira começada, senão a primeira). A inicial é a aula da vez dessa
trilha mais o percurso inteiro numa lista; a de trilhas é o percurso em
etapas, uma trilha por linha, um botão só (o da trilha da vez) e os
projetos numa aba. Veio da segunda reclamação do dono do projeto sobre as
duas telas: a grade de sete cards iguais não dizia por onde começar, e a
inicial só conhecia JavaScript.

**O sandbox é descartável.** Worker novo por execução, 3 segundos de limite,
`terminate()` no fim. `fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts`,
`indexedDB`, `caches` e `Notification` são apagados antes de qualquer código do
aluno rodar. A lógica fica em `sandbox-core.ts`, puro, para os testes exercitarem
exatamente o mesmo código que roda em produção.

## 5. Mapa do código

```
src/content/            Aulas, exercícios, projetos, conceitos, flashcards
  types.ts              Tipos (Exercise é união discriminada por `type`)
  percurso.ts           As três etapas do percurso, na ordem das trilhas
  bancos/               Os bancos de exemplo da trilha de SQL (`loja`): o SQL
                        que cria, e a descrição que o aluno lê
  schema.ts             Espelhos Zod; valida na carga e falha alto em DEV
  index.ts              Única fronteira de leitura do conteúdo
  content.test.ts       Integridade: 1.082 checagens sobre o catálogo
  lessons/              Uma aula por arquivo
  tracks/               A ORDEM da trilha vive aqui, não nos arquivos de aula

src/client/lib/         Lógica pura e testada
  sandbox-core.ts       Monta e roda o programa do aluno. ASSÍNCRONO.
  sandbox.worker.ts     Worker: bloqueia rede e chama o core
  sandbox.ts            executeCode(). Dois relógios: 20s para o worker
                        existir, e só então os 3s do código do aluno
  pagina-core.ts        Motor de página, parte pura: monta o documento
                        (CSP, captura de console, testes no load) e lê a
                        mensagem de volta. Roda no Node com jsdom
  pagina.ts             executarPagina(): escreve o documento num <iframe
                        sandbox>, espera a mensagem, cuida do prazo
  pagina-jsdom.ts       O executor do CI: mesmo documento, no jsdom. Sem
                        layout e sem cor normalizada — o E2E é o árbitro
  typescript-core.ts    Motor de TypeScript, parte pura: opções do compilador,
                        o que o sandbox declara existir, formato e tradução
                        dos erros, e os trechos de tipo (typeTests)
  typescript.ts         O compilador no navegador: segunda instância do worker
                        de TypeScript do Monaco, modelos temporários
  typescript-node.ts    O compilador do CI: pacote `typescript`, serviço de
                        linguagem para não repagar as libs a cada exercício
  executar.ts           executarNaLinguagem(): JavaScript vai direto ao
                        sandbox; TypeScript compila antes — todo componente
                        de exercício passa por aqui
  react-core.ts         Motor de React, parte pura: as declarações do React e
                        do DOM para o compilador, o documento com o React
                        embutido e a montagem de App, e os ajudantes dos
                        testes (clicar, digitar, enviar, botao, campo…)
  react-umd.ts          O React e o ReactDOM como texto (?raw), num chunk
                        próprio que só um exercício de React baixa
  sql-core.ts           Motor de SQL, parte pura: o contrato `Banco`, o
                        adaptador do sql.js (comando a comando, com colunas
                        até de um SELECT vazio), o julgamento por linhas e as
                        frases de diferença, a tradução dos erros do SQLite
  sql.worker.ts         O SQLite em WebAssembly, num worker que fica vivo
  sql.ts                executarSqlNoNavegador(): fila, aquecimento, prazo
                        contado a partir do `iniciou` do worker
  sql-node.ts           O mesmo sql.js no Node, para o CI
  fill-blank.ts         Molde com lacunas: dividir, preencher, validar
  mastery.ts            Domínio por conceito, em 4 níveis
  review.ts             Repetição espaçada, Leitner [1,3,7,14,30,60] dias
  gamification.ts       XP, níveis, conquistas
  path.ts               Caminho da trilha; nunca bloqueia, só avisa
  percurso.ts           O percurso do aluno: trilhas por etapa, estado de
                        cada uma, e qual é a trilha da vez
  economia.ts           Moedas ganhas por fonte, a loja (itens, preços, o que
                        o nível libera), janelas de dobro de XP
  sequencia.ts          A sequência de dias com congelamentos; as correntes
                        da história, para os marcos valerem uma vez
  desafios.ts           Desafios diários e semanais: rodízio, progresso,
                        os cumpridos desde o primeiro estudo
  perfil.ts             Perfil editável (nome, avatar, tema), compras, foto
                        (redimensionada no navegador, Storage `avatars`)
  tema.ts               Aplicar e guardar tema e cor de destaque
  cores-das-trilhas.ts  Uma cor por trilha
  study.ts              Sequência, retomada, exercícios abandonados
  celebrar.ts           Confete que respeita prefers-reduced-motion
  monaco.ts             O Monaco do próprio domínio: recursos escolhidos a
                        dedo, 4 linguagens, workers, tema `codeflow`. Só entra
                        pela import() do CodeEditor

src/client/pages/       Telas
src/client/components/  Componentes
  ui/Button.tsx         O botão — o único. Variantes × tamanhos, `loading`,
                        ícones; `buttonClasses()` para um <Link> ser botão
  ui/Card.tsx           A superfície: tons com significado, `cardClasses()`,
                        e `SectionLabel`, o rótulo monoespaçado das seções
  ui/CodeEditor.tsx     O editor — o único. Carrega o Monaco sob demanda,
                        mostra o código enquanto espera, cai num textarea se
                        o chunk não vier
  ui/Avatar.tsx         Os nove avatares desenhados, e a foto
  perfil/               O perfil em partes: editar (nome, avatar, foto), a
                        loja, os desafios, as conquistas por categoria, a
                        aparência (modo e cor)
  lesson/               Um componente por tipo de exercício; `ExerciseAction`
                        e `ExerciseFeedback` são o botão e o retorno de todos
  lesson/SqlExerciseStep  O exercício de SQL: painel de tabelas do banco (e o
                        `setup` do exercício), editor, resultado em tabela
  dashboard/Percurso    O percurso na tela: compacto (inicial) e detalhado
                        (trilhas), com o marco da linha do tempo das aulas
src/client/pages/app/   Início é a aula da vez + o percurso; Trilhas é o
  TrackDetail.tsx       percurso em etapas com os projetos numa aba; uma
                        trilha inteira, em blocos por assunto
e2e/                    Playwright; `fixtures.ts` tem o dublê do Supabase
supabase/migrations/    0001 a 0007, aplicadas em ordem (0007: perfil, loja, fotos)
docs/curriculo.md       Roadmap de conteúdo — fonte canônica
```

## 6. Como verificar

```bash
npm run typecheck   # inclui e2e/ e playwright.config.ts
npm test            # 2.104 testes
npm run test:e2e    # 278 no navegador (antes: npx playwright install chromium)
npm run build
```

CI: tipos → testes → build, e o E2E num job separado depois.

**Método que tem funcionado, e vale manter:**

1. **Medir, não olhar.** `getBoundingClientRect`, `elementFromPoint`,
   `getComputedStyle`. Screenshot não prova layout.
2. **Sabotar para provar que o teste pega.** Quebre a correção de propósito,
   confirme o vermelho, reverta. Três testes meus passaram vazios até eu fazer
   isso — e um deles cobria escalada de privilégio.
3. **Escrever o teste antes da correção**, para ele apontar o problema real em
   vez do que eu imaginei.
4. **Olhar a tela renderizada** antes de dizer que uma mudança de interface está
   pronta. Os testes provam comportamento; não julgam se um número faz sentido
   para quem lê.
5. **Conferir a execução do CI de verdade**, e não só os testes locais. O CI já
   ficou vermelho por sete commits enquanto eu dizia que estava verde.
6. **Percorrer o fluxo do aluno no navegador**, do começo ao fim. A tela branca ao
   trocar de aula e o botão "Pular por ora" depois de acertar viveram meses numa
   base com mais de quinhentos testes: nenhum deles olhava para o que o aluno lê
   depois de responder.

## 7. Armadilhas já pagas

Cada uma custou tempo. Não repita.

- **Asserção com `.then()` sem `await` passa falsamente** — reporta sucesso antes
  de a promise resolver. O CI recusa esse padrão hoje.
- **`every` com `await` dentro devolve promessa, que é sempre verdadeira.** Um
  teste assim aprova qualquer conteúdo. Use laço.
- **`[\s\S]` dentro de template string vira `[sS]`** — quebrou um teste em
  silêncio.
- **Barra invertida a mais antes de crase no markdown** aparece na tela do aluno.
  O CI checa.
- **jsdom não tem layout.** `:focus` nem casa sem foco de janela. Layout se
  verifica no Playwright.
- **`window` não existe nos testes `.test.ts`** (ambiente node). Leia de
  `globalThis`.
- **Contagem fixa em teste quebra com conteúdo novo.** Leia do catálogo.
- **Teste de data que depende do fuso passa aqui e falha no CI**, que roda em
  UTC. Construa com partes locais (`new Date(ano, mes, dia)`) e compare
  componentes, nunca timestamps. O CI roda o conteúdo em Pacific/Kiritimati
  (UTC+14) justamente para pegar isso.
- **Script com regex sobre muitos arquivos causa dano colateral.** Um meu removeu
  `async` de seis testes sem relação com a mudança. Confira o `git diff` antes de
  seguir.
- **Rejeição de promise sem destino escapa do sandbox** e derruba o processo do
  Node, ou vaza do worker para a página. `runProgram` contém isso enquanto o
  código do aluno roda. Foi o que deixou o CI vermelho por sete commits.
- **O log do CI exige autenticação; a anotação, não.** O passo de testes emite as
  falhas como `::error::` para que o motivo seja legível pela API pública.
- **O Write herda a codificação do arquivo que substitui.** Um README em UTF-16
  produziu acentos corrompidos. Apague antes de reescrever.
- **O sandbox roda em modo estrito.** Atribuir a uma propriedade congelada
  lança `TypeError` em vez de falhar em silêncio, e isso muda a saída esperada
  de um exercício. Rode o trecho pelo `runProgram` antes de escrever o
  `expectedOutput` em vez de deduzir.
- **`\d` dentro de template literal vira `d`.** Mesma família do `[\s\S]` já
  registrado abaixo, e ela morde ao escrever exercício de expressão regular:
  use `[0-9]` no campo `code`, ou dobre a barra.
- **`JSON.stringify` mente sobre `NaN`, infinitos e `undefined`** — os dois
  primeiros viram `null`, o terceiro some de dentro de objeto e vira `null`
  dentro de array. Num sandbox de ensino isso manda o aluno procurar por um
  valor nulo que ele nunca criou. `formatArg` trata esses casos; se for mexer
  nela, os testes de "valores que o JSON não representa" descrevem o contrato.
- **Resetar estado em `useEffect` quando a rota muda de parâmetro é tarde
  demais.** `/lesson/a` → `/lesson/b` não desmonta o componente: renderiza a aula
  nova com o índice da anterior, e `steps[indice]` vira `undefined`. Foi tela
  branca em produção. Ajuste o estado **durante o render** (`if (idAtual !== id)
  { setId(id); ... }`), que é o padrão do React para isso.
- **`useAuth()` devolve um objeto de contexto novo a cada render.** Um efeito que
  depende dele roda sempre; se o efeito produz array ou objeto novo em `setState`,
  vira laço infinito. Dependa de `user?.id`, e faça o `setState` devolver o valor
  anterior quando nada mudou.
- **`height="100%"` no Monaco precisa de um pai com altura de verdade.**
  `min-height` não conta: com `min-h-[320px]` e altura automática, o editor do
  projeto media 5px no celular — invisível, e ninguém conseguia escrever código
  num projeto pelo telefone. No celular a altura é fixa (`h-[360px]`); no
  desktop o flex da linha basta. O E2E cobre os dois.
- **O painel do navegador do Claude nem sempre pinta.** Quando está oculto, o
  `ResizeObserver` não dispara e o Monaco fica em 5×5 em TODAS as telas — o que
  parece um bug do produto e não é. `layout()` manual funciona porque o DOM tem
  geometria. Antes de concluir que um editor quebrou, rode o E2E: o Chromium
  headless renderiza de verdade.
- **O Monaco 0.56 tem mapa de `exports`, e os caminhos antigos não resolvem.**
  `monaco-editor/esm/vs/editor/editor.worker` — o que todo guia de Vite
  ensina — cai em `esm/vs/esm/vs/...` e falha. Os pontos de entrada com
  suporte são `monaco-editor/editor`, `monaco-editor/features/<x>/register`,
  `monaco-editor/languages/definitions/<x>/register`,
  `monaco-editor/languages/features/typescript/register`, e os workers em
  `monaco-editor/editor/editor.worker` e
  `monaco-editor/languages/features/typescript/ts.worker`. O worker de
  TypeScript tem 7 MB; é por isso que ele é um arquivo à parte e só sobe
  quando um modelo JS ou TS abre.
- **Em desenvolvimento, o Vite embute um sourcemap com o conteúdo inteiro em
  cada módulo de `node_modules`.** Para os dois arquivos gigantes do serviço
  de TypeScript do Monaco (9 MB e 3 MB) isso dava 47 MB e 16 MB por
  requisição, e o worker do sandbox ficava 20 segundos na fila atrás deles —
  o aluno lia "seu código passou de 3 segundos" sobre um programa de duas
  linhas. Duas correções, as duas necessárias: o plugin
  `semSourcemapNosGigantes` no `vite.config.ts` (só em `serve`), e o sandbox
  passou a contar os 3s a partir do `'pronto'` do worker, e não do `new
  Worker()`. O E2E roda no servidor de desenvolvimento, então ele sente isso
  antes do aluno.
- **`vi.mock` com fábrica assíncrona é avaliado uma vez por arquivo**, mesmo
  com `vi.resetModules()` entre os testes. Um dublê cuja promessa o teste
  controla (resolve num, rejeita noutro) só funciona com `vi.doMock` antes de
  cada `import()` — foi assim que o teste do textarea de contingência passou a
  falhar de verdade quando a contingência é sabotada.
- **O jsdom não aplica CSP, e o Chromium aplica.** O motor de página passou
  em 12 testes no jsdom e falhou na primeira página de verdade: `new
  Function` exige `'unsafe-eval'` na CSP. Todo motor novo precisa de um teste
  no navegador antes de ser dado por pronto; o jsdom prova o conteúdo, não a
  plataforma.
- **Um rádio `sr-only` não recebe `check()` do Playwright.** O ponto de 1px
  fica em cima do número da linha, que intercepta o clique — 240 tentativas
  até o timeout. Clique no `<label>`, como o aluno faz.
- **O jsdom e o Chromium divergem no estilo computado de formas que só
  aparecem escrevendo os testes.** Medido, aula a aula: `rem`, `ch`, `1fr`
  e `line-height` sem unidade voltam resolvidos em px no Chromium e
  declarados no jsdom; cores literais voltam `rgb()` nos dois, mas `var()`
  não é resolvido no jsdom; `@media` é ignorado pelo jsdom; pseudo-elemento
  em `getComputedStyle` lança; o Chromium omite `ease` (o padrão) ao
  serializar `transition`; colunas `1fr` resolvem com diferenças de
  centésimos; margem nunca declarada é `''` num e `'0px'` no outro; e o
  **aninhamento nativo de CSS derruba o analisador do jsdom** — a folha
  inteira some. A regra que saiu disso: o que o aluno **escreveu** se lê na
  folha de estilo (`document.styleSheets`), igual nos dois; o computado só
  quando é literal e portátil (`display`, px declarados, `rgb()` de hex).
- **O jsdom não tem `innerText`, e o `textContent` do `body` inclui os
  scripts do próprio motor.** Um teste que procurava uma palavra proibida no
  texto da página achou `item` dentro de `getItem` do dublê de
  armazenamento. Para ler o que o aluno escreveu, percorra os nós de texto
  com `TreeWalker` pulando `SCRIPT` e `STYLE`.
- **Os testes de página rodam no `load`, e o trabalho assíncrono do aluno
  pode ainda não ter acabado.** Um exercício que busca dados no dublê de
  `fetch` (30 ms) precisa esperar dentro da asserção antes de ler o
  resultado — e duas asserções que disparam a mesma busca ao mesmo tempo
  disputam o DOM. Sequencie com esperas explícitas e teste o estado final,
  não o intermediário.
- **Teste que mede tempo é intermitente sob carga.** "As buscas acontecem
  juntas" comparava milissegundos e falhava quando a máquina estava ocupada
  com o E2E. A versão certa conta quantas chamadas estão em voo ao mesmo
  tempo, e a sabotagem (`for await` em vez de `Promise.all`) prova que o
  teste falha quando deve.
- **O serviço de TypeScript do Monaco se registra depois do primeiro modelo
  TypeScript, e de forma assíncrona.** `getTypeScriptWorker()` antes disso
  rejeita com "TypeScript not registered!", e o primeiro "prever a saída" da
  trilha — onde nenhum editor tinha montado — travava em "Executando…". Toda
  chamada ao compilador no navegador fica dentro de um `try` que vira erro
  legível; o botão nunca fica preso.
- **Todos os modelos sincronizados ao serviço do editor são um programa só.**
  O modelo temporário da compilação e o modelo do editor, com o mesmo código,
  viravam "Cannot redeclare block-scoped variable" um contra o outro. Por isso
  o motor tem uma instância própria do worker, que só recebe os modelos que
  ele cria e descarta.
- **O serviço do editor valida todo modelo `typescript` que aparece** e o
  sincroniza para o worker dele — e aí a função do aluno existia duas vezes
  lá dentro, e o editor sublinhava "Duplicate function implementation" num
  código certo. O modelo temporário da compilação é `plaintext` com URI
  `.ts`: o worker de compilação decide pelo sufixo, o editor não o vê.
- **`ts.createProgram` por compilação repaga as libs.** 200 ms por exercício
  só relendo a `lib.es2020` e a cadeia atrás dela. O compilador do CI usa o
  serviço de linguagem, como o Monaco: entre uma compilação e a seguinte só o
  arquivo do aluno muda, e cai para 60 ms.
- **Os testes de uma página rodavam todos ao mesmo tempo.** O `Promise.all`
  do sandbox de Worker, onde os testes são independentes, servia à página —
  até a aula de estado do React, em que o teste que clica em "+1" três vezes
  e o que clica em "-1" disputavam o mesmo contador. `buildProgram` ganhou
  `sequencial`; a armadilha no caminho foi `return` seguido de quebra de
  linha, que é `return;` — os resultados vinham nulos até os parênteses.
- **Mudar o hash num iframe de `srcdoc` recarrega o documento no Chromium.**
  A aula de rotas ia usar `location.hash`; a sonda no navegador mostrou o
  componente sumindo no primeiro clique (no jsdom funciona). A rota vive no
  estado, e a aula diz o que a barra de endereço acrescentaria.
- **Sem `allow-forms`, o Chromium não dispara o `submit` no clique do botão
  nem no Enter.** Os testes de página sempre despacharam o evento à mão, e
  por isso ninguém viu que a pré-visualização ficava muda num formulário
  certo. O sandbox ganhou `allow-forms`; um formulário sem `preventDefault`
  passa a navegar o iframe, como a página de verdade faria.
- **`window.X = 0` num exercício de React é erro de tipo**, porque o `window`
  declarado para o compilador não tem índice. Um contador que o teste
  precisa ler é `let contador = 0` no topo do script: o motor de página
  resolve `let` e `const` do topo a partir dos testes.
- **Dois passos seguidos do mesmo tipo de exercício reaproveitavam a
  instância do componente.** O segundo nascia com a resposta do primeiro já
  enviada — "Resposta correta" para uma pergunta que ninguém respondeu — e,
  como o estado derivado não mudava, a aula nunca ficava sabendo dele: 5/6
  para sempre. Nenhuma das 57 aulas anteriores tinha dois seguidos. Cada
  componente de exercício tem `key={exercise.id}`; o teste
  `Lesson.passos-seguidos` prova o defeito sem a `key`.
- **"O Tab pula para o botão" era o editor de contingência, não o Monaco.**
  Quando o chunk do Monaco não chega — rede, ou uma aba aberta de antes de
  um deploy que trocou os nomes dos arquivos — entra o `<textarea>`, e nele
  o Tab do navegador sai do campo. As sondas no Chromium mostravam o Monaco
  recuando direito; o relato do usuário só fazia sentido na contingência. O
  textarea trata Tab (recua), Shift+Tab (desfaz) e Esc (solta o foco), com a
  dica escrita embaixo; `main.tsx` recarrega uma vez por sessão no
  `vite:preloadError`; e a falha do Monaco vai ao `console.error` — antes
  era silenciosa, e a contingência parecia o editor normal.
- **`db.exec` do sql.js devolve nada para um SELECT sem linhas.** "A
  consulta não devolveu nenhuma linha" e "não há SELECT" ficavam iguais, e o
  aluno perdia as colunas de uma consulta vazia. O adaptador roda comando a
  comando (`iterateStatements`) e lê as colunas antes do primeiro `step`.
- **O relógio da consulta de SQL disparado no envio vencia com a thread
  principal ocupada.** Sob carga (dois Chromium do E2E e o Monaco montando),
  o `iniciou` e o resultado do worker chegavam juntos na fila, depois de o
  prazo de 3 s vencer — e uma consulta de milissegundos lia "passou de 3
  segundos". O relógio começa no `iniciou`; o resultado logo atrás na fila é
  processado antes de ele ter chance.
- **O otimizador do Vite só descobria o `sql.js` na primeira consulta**, e
  recarregava a página inteira no meio do exercício. `optimizeDeps.include`.
- **`getRowsModified` do SQLite fala do último INSERT/UPDATE/DELETE**, não
  do último comando: depois de um CREATE TABLE ele ainda mostra o número
  anterior. O painel só o lê quando o verbo do comando é de escrita.
- **A tabela de Markdown estourava a largura no celular.** O `prose` não a
  faz rolar; a primeira aula de SQL, toda tabelas, foi a primeira a ter uma
  com quatro colunas. `MarkdownReader` embrulha `table` num `overflow-x-auto`.
- **Uma verificação com ordem sem ORDER BY na referência cobraria do aluno
  uma ordem que o SQLite não garante.** O CI recusa `ordered` sem ORDER BY, e
  todo enunciado que pede ordem diz o critério de desempate.
- **`@theme` do Tailwind v4 é estático; `@theme inline` com `var()` não é.**
  Para o modo escuro trocar os tokens, cada `--color-x` aponta para uma
  `--cf-x` de `:root`, e só as `--cf-` mudam. E a variante `dark:` precisa
  ser declarada (`@custom-variant`) para seguir o atributo, não o sistema.
- **`bg-ink` não é "fundo escuro".** No escuro, `ink` vira claro: um bloco
  de código com `bg-ink text-white` ficava branco sobre branco. Superfície
  escura fixa é `bg-editor`; um preenchimento "tinta" leva `text-canvas`,
  que inverte junto.
- **As variáveis do `prose` precisam vencer o plugin.** O `.prose` gera as
  cores em `@layer utilities`; um override em `base` perde. As variáveis
  `--tw-prose-*` estão em `utilities`, depois do plugin.
- **O hover do botão primário usava o 700.** No escuro o 700 é texto claro;
  o botão em hover virava azul-claro com texto branco. Token próprio
  (`brand-hover`), sempre um tom mais escuro que o 600.
- **`text-brand-600` não é texto.** No claro passava (4.6:1); no escuro o
  600 é preenchimento e cai a 2.4:1. Texto da marca é o 700. Foi o teste
  de contraste (`lib/contrast.test.ts`), que confere cada par nas oito
  variantes — dois modos × quatro cores — que apontou isso, junto com o
  verde do escuro e três cores de trilha claras demais para texto branco.
- **Reordenar a lista solta a captura do ponteiro.** O arrastar do exercício
  de ordenar reorganiza os passos ao vivo, e reordenar é tirar o elemento do
  DOM e pô-lo de volta — o navegador libera o `setPointerCapture` nesse
  instante, e o resto do movimento ia para o passo que estivesse embaixo do
  ponteiro: o passo andava uma casa e parava. Os eventos de mover e soltar
  são ouvidos na janela enquanto dura o arrasto. E o destino é decidido
  contra a geometria medida no início (os meios dos outros passos), não
  contra a atual: passos de alturas diferentes trocando de lugar mudam as
  fronteiras, e o passo ia e voltava no mesmo movimento.
- **`touch-action: none` só na pega.** Arrastar pela linha inteira disputa
  com a rolagem da página no celular — foi por isso que a primeira versão
  não tinha arrasto. Na pega (⋮⋮), o dedo arrasta; no resto da linha, rola.
- **O aviso de pré-requisito em toda aula futura era ruído.** "Supõe
  Variáveis, que você ainda não praticou" em dezenove aulas de vinte, para
  quem acabou de entrar: sempre verdade, nunca informação. Só a aula atual
  avisa — é onde o aviso diz algo que só acontece fora de ordem.
- **As ligaduras da JetBrains Mono viravam `===` num "≡".** Para quem está
  aprendendo a digitar os três sinais, é um símbolo que o teclado não tem.
  `font-variant-ligatures: none` em `code`, `pre` e `.font-mono`, e
  `fontLigatures: false` no Monaco.
- **Uma prop opcional é um contrato que ninguém garante.** `onSolved` era opcional
  e dois dos quatro tipos de exercício simplesmente não a recebiam — 36 dos 78
  exercícios nunca conseguiam avisar que tinham sido resolvidos, e nenhum dos 521
  testes viu. Quando quatro componentes respondem à mesma pergunta, o tipo
  compartilhado (`ExerciseState`) vale mais que a prop.

## 8. O que falta

### Bloqueios técnicos

- **As fontes vêm do Google Fonts.** É o último recurso externo em tempo de
  execução (o Monaco já é servido do próprio domínio). Sem rede, o texto cai
  para a fonte do sistema — degrada, mas funciona. Servir do próprio domínio
  é um `@font-face` e dois arquivos `.woff2`; ainda não foi feito.
- **`import`/`export` é erro de sintaxe no sandbox** — `new Function` não aceita
  módulos. A aula de módulos terá que ser conceitual, ou esperar outro executor.
- **Publicado na Vercel** (2026-09-14) pela integração com o GitHub: cada
  push no `main` vira um deploy de produção — dá para ver em
  `api.github.com/repos/EduuGah/CodeFlow/deployments`. A URL por deploy
  (`codeflow-<hash>-….vercel.app`) exige login na Vercel; a pública é o domínio
  de produção do projeto. O `vercel.json` só tem as rewrites de SPA; o build é
  o `npm run build` padrão, e o `dist/server.cjs` que ele gera não é usado lá.
- **Nada testado em telefone real.** O E2E emula um Pixel 7.
- **Sem tutor com IA.** A rota foi removida enquanto a integração não existe.

### Roadmap

O mapa completo está em `docs/curriculo.md`: 8 fases, 135 aulas previstas, ~700
exercícios, 6 motores de execução. A ordem das fases é imposta pelos motores, não
por preferência de assunto.

**Fase 0 — completa.** Fundamentos e lógica, 13 aulas.

**Fase 1 — completa.** Conteúdo, tipos de exercício, plataforma e publicação.

| Item | Estado |
| --- | --- |
| Bloco *JavaScript real* | **10 de 10, concluído** — escopo, closures, callbacks, promises, async/await, falhas assíncronas, JSON, imutabilidade, datas, expressões regulares |
| Bloco *Como a web funciona* | **8 de 8, concluído** — cliente e servidor, HTTP, cabeçalhos, REST, autenticação, tokens, CORS, segurança |
| Testes por propriedade | **feito** |
| Exercício de lacuna | **feito** |
| Outros tipos de exercício | **feito** — ordenar passos, escrever o teste, encontrar o bug, refatorar |
| Publicar | **feito** — Vercel, deploy automático a cada push no `main` |
| Monaco do próprio domínio | **feito** — chunk próprio, sob demanda; o E2E bloqueia toda rede externa e o editor monta assim mesmo |

**Aprofundamento das aulas antigas — em andamento.** As primeiras aulas nasceram
magras e foram melhorando com o tempo, o que fazia o iniciante encontrar as
piores: a aula 1 tinha 77 palavras e um exercício. O padrão novo é 500 a 900
palavras e cinco a seis exercícios em dificuldade crescente — múltipla escolha ou
prever saída, depois lacuna, depois código do zero. **Concluído para as 31 aulas
publicadas.** A mais curta tem 304 palavras; o bloco assíncrono, que é o mais
difícil do curso, tem entre 650 e 810 palavras por aula. Nenhuma aula publicada
está pendente de aprofundamento.

**Fase 2 — completa (2026-09-14).** O motor iframe está pronto e provado nos
dois lados (jsdom no CI, Chromium no E2E), com `runtime: 'iframe'` nos tipos
`code` e `fill-blank`, HTML e CSS no editor. A trilha **A Página** tem as 26
aulas previstas — 10 de HTML e CSS, 8 de DOM e eventos, 8 de UI e UX — com
156 exercícios, 78 deles de página. O E2E `e2e/pagina.spec.ts` conclui cada
aula da trilha no navegador, em celular e desktop; uma aula nova entra nele
sozinha. Os ajudantes que as asserções de CSS colam no início (`trilhas`,
`regraBase`, `regraEmMedia`, `declarado`) estão em
`src/content/lessons/_ajudantes-css.ts`, cada um com o motivo medido. Do lado
da plataforma ficou um item da fase: mapa de tópicos e busca — não depende de
motor e cabe em qualquer momento.

**Fase 3 — completa (2026-09-15).** Dois motores. O de TypeScript
(`language: 'typescript'`): o compilador antes do sandbox, nos dois lados
(pacote `typescript` no CI, worker do Monaco no E2E), com os `typeTests` como
o teste que só existe aqui; trilha de 10 aulas e 59 exercícios. O de React
(`language: 'react'`): o componente em TSX compilado e montado com o React
embutido no iframe do motor de página, testes em série que usam o componente
como a pessoa; trilha de 14 aulas e 84 exercícios. As duas trilhas são
concluídas no Chromium em celular e desktop (`e2e/typescript.spec.ts`,
`e2e/react.spec.ts`). Da plataforma da fase ficou o tutor com IA e o painel
do aluno — como o mapa de tópicos da Fase 2, não dependem de motor.

**Fase 4 — pela metade (2026-09-16).** O motor de SQL está pronto: o sql.js
num worker, o julgamento por linhas devolvidas (`sql-core.ts`), o tipo de
exercício `sql` com verificações por consulta própria, o banco de exemplo
`loja` e o painel de tabelas. A trilha **SQL e Bancos de Dados** tem as 10
aulas previstas — 6 de consulta (tabelas, WHERE, ORDER BY e expressões, JOIN,
agregação, subconsultas e WITH) e 4 de escrita e modelagem (INSERT/UPDATE/
DELETE e transação, CREATE TABLE e restrições, normalização, índices) — com
43 exercícios de SQL e 66 verificações. `e2e/sql.spec.ts` conclui cada aula
no Chromium, em celular e desktop, e prova o erro traduzido e a consulta sem
fim interrompida. Falta a outra metade da fase: o **servidor simulado (Node)**
e as 10 aulas de back-end — motor sem parentesco com os cinco que existem.
Decisão do dono do projeto (2026-09-16): o SQL veio antes do Node.

**Fases 5 a 7 — não iniciadas.** Pyodide (Python) é o último motor.
Investimentos grandes o bastante para a escolha ser do dono do projeto —
pergunte antes de começar o servidor simulado ou qualquer outra fase.

## 9. Pendências do lado do usuário

- **Rodar `supabase/migrations/0007_perfil_e_loja.sql` no SQL Editor.** Ela
  acrescenta as colunas do perfil (`display_name`, `avatar`, `theme`,
  `accent`), cria a tabela `purchases` (a loja) e o bucket `avatars` do
  Storage com as políticas (leitura pública, escrita só na própria pasta).
  Sem ela, salvar o perfil, comprar na loja e enviar foto falham com a
  mensagem da tela — o resto continua funcionando.
- Rodar `supabase/migrations/0006_promote_admin.sql` no SQL Editor, se ainda não
  rodou. Ela conserta o gatilho que impedia promover alguém a administrador.
- Para virar administrador: `select public.set_user_role('SEU-EMAIL', 'admin');`
- Conferir o aplicativo publicado num telefone de verdade — inclusive um
  exercício de código, que agora depende do editor servido pela Vercel, uma
  aula da trilha "A Página" (a página do aluno num iframe) e uma de React (o
  componente montado no mesmo iframe).
- Informar a URL pública de produção, para entrar aqui e no README.

## 10. Preferências já estabelecidas

- **Português** em tudo: código, comentários, commits, interface.
- **Sem Lucide Icons.** Os ícones são SVG próprios em
  `components/ui/Icon.tsx` — grade 24, traço 1.75, `currentColor`.
- **Mobile-first**, com identidade visual própria. Nada de gradiente agressivo,
  bento grid, glassmorphism, emoji na interface, roxo com preto, orbes, sparkles.
- **Nenhum recurso falso.** Botão que não faz nada, número que não significa nada
  e teste que passa vazio já foram removidos várias vezes.
- **Modo escuro e quatro cores de destaque existem** (2026-09-16), a pedido do
  dono do projeto — "o site está muito seco". A regra continua: cor com
  significado; as cores extras são de destaque, não de fundo.
- Prioridade declarada: clareza > facilidade de uso > experiência de aprendizado >
  responsividade > consistência visual > qualidade dos exercícios > progressão >
  gamificação.
- Push direto no `main` está autorizado. Commits explicam **por que**, não o quê.
- **Botão e card são componentes, não classes copiadas.** A base é uma matriz
  pequena, no padrão das bibliotecas que funcionam (shadcn, 21st.dev): `Button`
  com 5 variantes × 3 tamanhos, todos ≥ 40px, `md` = 44px; `Card` com tons que
  carregam significado (`success` acerto, `caution` erro de resposta, `danger`
  falha). Antes eram 19 botões e 25 cards escritos à mão, cada um envelhecendo
  sozinho. Hoje: zero botões primários inline (o E2E do painel conta os
  `bg-brand-600`), e os `<button>` crus que restam são os que têm motivo —
  setas de reordenar com ref, abas, disclosure. Se um estilo novo parecer
  necessário, é uma variante nova, não uma classe copiada.

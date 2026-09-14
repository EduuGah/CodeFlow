# CONTEXTO — CodeFlow

Documento de retomada. Escrito para alguém — ou alguma sessão — que não viu nada
do que veio antes e precisa continuar sem redescobrir tudo.

Atualizado em 2026-09-14. **Mantenha-o atualizado no mesmo commit que muda o que
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
- Monaco como editor — **vindo de CDN externo**, ver seção 8

## 3. Estado atual

Números lidos do catálogo, não de memória.

| | |
| --- | --- |
| Trilhas | 4 — Fundamentos de JavaScript (20 aulas), Lógica (3), Como a Web Funciona (8), A Página (26) |
| Aulas | 57, somando 1.564 minutos |
| Exercícios | 330, em 8 tipos — 87 de código, 49 de prever saída, 78 de múltipla escolha, 58 de lacuna, 35 de ordenar passos, 14 de encontrar o bug, 5 de escrever o teste, 4 de refatorar. 78 exercícios de página (`runtime: 'iframe'`). **Toda aula tem ao menos um dos quatro tipos de prática de dev** |
| Verificação | 561 casos fixos + 58 propriedades |
| Projetos | 7, com 22 critérios de aceitação |
| Conceitos | 53, com grafo de pré-requisitos |
| Flashcards | 22 |
| Testes | 1.431 de unidade + 190 de navegador |
| Pacote | 1.856 kB (518 kB comprimido) no chunk principal — o conteúdo vai junto, e a trilha da página mais os exercícios de prática de dev o fizeram crescer 500 kB; o Monaco são mais 3.362 kB (868 kB) num chunk à parte, baixado só quando o primeiro editor monta |

## 4. Decisões que não devem ser desfeitas sem motivo forte

Cada uma tem uma razão que não é óbvia lendo o código.

**Conteúdo é código, não linhas no banco.** Aulas, exercícios e projetos vivem em
módulos TypeScript sob `src/content/`, validados por Zod na carga. O CI prova que
cada exercício é resolvível — rodando a solução de referência no sandbox de
verdade — e que o esqueleto **não** passa. Um formulário gravando no banco jogaria
fora essas três garantias. Por isso a tela de administração **gera o módulo** para
revisão em pull request, em vez de escrever no banco.

**Quase nada é contador.** XP, nível, sequência, domínio por conceito e cartões
vencidos são todos derivados do histórico append-only (`exercise_attempts`,
`flashcard_reviews`). Contador desnormalizado é uma segunda fonte de verdade que
diverge no primeiro erro de escrita — e ninguém descobre, porque número errado não
quebra nada.

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

**O sandbox é descartável.** Worker novo por execução, 3 segundos de limite,
`terminate()` no fim. `fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts`,
`indexedDB`, `caches` e `Notification` são apagados antes de qualquer código do
aluno rodar. A lógica fica em `sandbox-core.ts`, puro, para os testes exercitarem
exatamente o mesmo código que roda em produção.

## 5. Mapa do código

```
src/content/            Aulas, exercícios, projetos, conceitos, flashcards
  types.ts              Tipos (Exercise é união discriminada por `type`)
  schema.ts             Espelhos Zod; valida na carga e falha alto em DEV
  index.ts              Única fronteira de leitura do conteúdo
  content.test.ts       Integridade: 664 checagens sobre o catálogo
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
  fill-blank.ts         Molde com lacunas: dividir, preencher, validar
  mastery.ts            Domínio por conceito, em 4 níveis
  review.ts             Repetição espaçada, Leitner [1,3,7,14,30,60] dias
  gamification.ts       XP, níveis, conquistas
  path.ts               Caminho da trilha; nunca bloqueia, só avisa
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
  lesson/               Um componente por tipo de exercício; `ExerciseAction`
                        e `ExerciseFeedback` são o botão e o retorno de todos
e2e/                    Playwright; `fixtures.ts` tem o dublê do Supabase
supabase/migrations/    0001 a 0006, aplicadas em ordem
docs/curriculo.md       Roadmap de conteúdo — fonte canônica
```

## 6. Como verificar

```bash
npm run typecheck   # inclui e2e/ e playwright.config.ts
npm test            # 1.431 testes
npm run test:e2e    # 190 no navegador (antes: npx playwright install chromium)
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

**Fases 3 a 7 — não iniciadas.** Cada uma depende de um motor: transpilador
(TypeScript), React, servidor simulado (Node), sql.js (SQL), Pyodide (Python).
A Fase 3 é a próxima: os dois motores dela (transpilador e React no iframe) se
apoiam no motor de página. É investimento grande o bastante para a escolha ser
do dono do projeto — pergunte antes de começar.

## 9. Pendências do lado do usuário

- Rodar `supabase/migrations/0006_promote_admin.sql` no SQL Editor, se ainda não
  rodou. Ela conserta o gatilho que impedia promover alguém a administrador.
- Para virar administrador: `select public.set_user_role('SEU-EMAIL', 'admin');`
- Conferir o aplicativo publicado num telefone de verdade — inclusive um
  exercício de código, que agora depende do editor servido pela Vercel, e uma
  aula da trilha "A Página", que renderiza a página do aluno num iframe.
- Informar a URL pública de produção, para entrar aqui e no README.

## 10. Preferências já estabelecidas

- **Português** em tudo: código, comentários, commits, interface.
- **Sem Lucide Icons.** Os ícones são SVG próprios em
  `components/ui/Icon.tsx` — grade 24, traço 1.75, `currentColor`.
- **Mobile-first**, com identidade visual própria. Nada de gradiente agressivo,
  bento grid, glassmorphism, emoji na interface, roxo com preto, orbes, sparkles.
- **Nenhum recurso falso.** Botão que não faz nada, número que não significa nada
  e teste que passa vazio já foram removidos várias vezes.
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

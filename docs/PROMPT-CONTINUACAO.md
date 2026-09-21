# Prompt de continuação — CodeFlow

Cole o bloco abaixo numa sessão nova, com o repositório aberto. Ele é escrito
para quem não viu nada do que veio antes.

Mantenha-o atualizado quando o estado do projeto mudar de forma relevante — um
prompt de retomada desatualizado induz a decisões erradas com aparência de
informação.

---

Você vai continuar o **CodeFlow**, uma plataforma de ensino de programação em
português que já está em produção de conteúdo. Aja como uma pessoa desenvolvedora
sênior de full-stack, com atenção especial a UX, acessibilidade e qualidade de
teste. Trabalhe com autonomia: leia o código antes de opinar, decida o que for
decisão de rotina, e me pergunte apenas quando leituras diferentes levariam a
trabalhos materialmente diferentes.

## 1. Leia isto primeiro

Antes de qualquer coisa, leia nesta ordem:

1. `docs/CONTEXTO.md` — documento de retomada. É a fonte de verdade sobre
   arquitetura, decisões, armadilhas já pagas e estado atual.
2. `docs/curriculo.md` — roadmap de conteúdo, com o painel de progresso.
3. `AGENTS.md` — convenções do repositório.

Não confie na sua memória do que "normalmente" um projeto assim faz. Este tem
decisões deliberadas e contraintuitivas, e todas estão documentadas com o motivo.

## 2. O que o produto é

Plataforma de ensino de programação em português. Aulas curtas divididas em
passos, o código do aluno rodando no navegador dentro de um sandbox, e correção
que **explica o porquê do erro** — não apenas se acertou.

O público é quem nunca programou. A prioridade declarada, nesta ordem:
clareza > facilidade de uso > experiência de aprendizado > responsividade >
consistência visual > qualidade dos exercícios > progressão > gamificação.

## 3. Pilha

- React 18 + Vite 5 + TypeScript + Tailwind v4 (tokens em `@theme`)
- Express só para servir (tsx em dev, esbuild no build)
- Supabase: login com Google + Postgres com RLS
- Vitest (unidade e componente) + Playwright (navegador)
- Monaco como editor, servido do próprio domínio num chunk sob demanda (`lib/monaco.ts`, `ui/CodeEditor.tsx`)
- sql.js (SQLite em WebAssembly) num worker, para a trilha de SQL (`lib/sql*.ts`)
- Repositório `EduuGah/CodeFlow`, trabalho direto no `main`, push autorizado, CI
  obrigatório a cada push

## 4. O que JÁ FOI FEITO

### Conteúdo

| | |
| --- | --- |
| Trilhas | 7 — Fundamentos de JavaScript (20 aulas), Lógica (3), Como a Web Funciona (8), A Página (26), TypeScript (10), React (14), SQL e Bancos de Dados (10) |
| Aulas | 91, somando 2.556 minutos, em blocos por assunto |
| Exercícios | 532, em 9 tipos; 78 são de página (`runtime: 'iframe'`), 42 de componente React, 43 de SQL, e 16 têm trechos de tipo (`typeTests`) |
| Verificação | 731 casos fixos + 58 testes por propriedade + 66 verificações de SQL |
| Projetos | 7, com 22 critérios de aceitação |
| Conceitos | 87, com grafo de pré-requisitos |
| Flashcards | 22 |
| Testes | 2.104 de unidade + 278 de navegador |

Todas as 91 aulas publicadas estão no padrão de profundidade: 300 a 900 palavras
e de 4 a 7 exercícios em dificuldade crescente, ao menos um deles de prática de
dev. Nenhuma está pendente de aprofundamento.

### Os 9 tipos de exercício

Todos implementados, testados, e com validação de conteúdo que roda no CI:

1. **código** — escreve a função, testes verificam comportamento
2. **prever a saída** — escreve o que acha que sai, depois executa e compara
3. **lacuna** — completa as partes que carregam a ideia
4. **múltipla escolha**
5. **ordenar passos** — arruma passos embaralhados; passos com a mesma `ordem`
   trocam livremente, o que aceita mais de uma resposta certa
6. **escrever o teste** — o aluno escreve asserções, e elas são rodadas contra a
   implementação correta (precisam passar) e contra versões sabotadas (precisam
   falhar). Ensina que um teste que aceita tudo não vale nada
7. **encontrar o bug** — aponta **a linha que precisa mudar** (a que o `fix`
   troca). Declara também a linha do **sintoma**, que recebe um retorno
   próprio: "é onde o erro aparece — não a que precisa mudar". O enunciado
   descreve o sintoma e termina com "Aponte a linha que precisa mudar."; nunca
   o diagnóstico — o CI cobra (2026-09-20, pedido do dono do projeto)
8. **refatorar** — código que já passa nos testes, e precisa continuar passando
   depois de cumprir restrições sobre a forma
9. **SQL** — escreve SQL contra um banco de exemplo num SQLite de verdade; a
   correção compara as **linhas devolvidas** com as da consulta de referência
   (ou o que ficou no banco, via uma consulta de verificação), nunca o texto

### Plataforma

Autenticação com Google, progresso derivado de histórico append-only, revisão
espaçada (Leitner), XP e níveis derivados (sem teto), painel inicial que
responde "o que faço agora / onde isso está no todo / como estou indo", área
de administração que **gera módulos TypeScript** para revisão em PR em vez de
escrever no banco, sandbox descartável com bloqueio de rede, testes por
propriedade com sementes e sondas de borda, CI com anotações legíveis, E2E em
celular e desktop. **Gamificação derivada** (2026-09-16): moedas ganhas por
aulas, projetos, desafios e sequência; loja (congelar a sequência, dobro de XP
por 24 h, temas e avatares que também abrem por nível) com as compras como
único fato guardado; desafios diários e semanais por rodízio; 30 conquistas em
quatro categorias. **Perfil editável** (nome, avatar desenhado ou foto enviada
ao Storage), **modo escuro** e **quatro cores de destaque**, uma cor por
trilha. O perfil é uma família de páginas (`/app/perfil`, `/desafios`, `/loja`,
`/conquistas`, `/aparencia`, `/progresso`), cada uma com a sua vinheta. As
figuras são **cheias e pintadas** (`components/ui/Ilustracao.tsx`, paleta
`P`), os 19 avatares também (`ui/Avatar.tsx`), cada trilha tem um emblema
(`ui/Emblema.tsx`) e há sete **cenas** desenhadas e animadas (`ui/Cena.tsx`:
editor, aulas, página, correção, cartões, percurso, projeto) na página pública,
nas trilhas, nos projetos e na revisão — o dono do projeto gostou muito da
primeira e pediu mais nesse estilo. Nada vem de banco de imagens e não há emoji na interface.
**Motor 4, o servidor simulado** (2026-09-17): `servidor-core.ts` é um Node de
mentira que roda no sandbox de sempre — `require('express')` devolve um
Express pequeno, `require('./x')` acha os `arquivos` do exercício,
`process.env` vem do exercício, `pedir(app, 'GET', '/rota')` é o cliente
HTTP dos testes, que rodam em série. A trilha "Node e APIs" (`track-node`,
linguagem `node`, exercício `server`) está **completa** (2026-09-20): 10
aulas, 64 exercícios — corpo e JSON, status e erros, middleware e
autenticação, CRUD, assincronia, configuração e segredos, e o projeto da API.
As aulas 8 a 10 fornecem módulos prontos em `arquivos` (repositório
assíncrono, `auth`, `erros`, `config`, `rotas`); os testes podem fazer
`require('./modulo')` para olhar o estado dele. A Fase 4 fechou; o próximo
passo do roadmap é a Fase 5 — a trilha "Engenharia: organizar um projeto",
que o dono do projeto pediu — em `docs/curriculo.md`. O "Pular por ora" saiu:
exercício sem resposta verificada não deixa avançar.
**Avisos de novidade** (`lib/novidades.ts` + `layout/Novidades.tsx`): subir de
nível, abrir conquista e cumprir desafio são avisados ao voltar ao aplicativo,
comparando o estado derivado com o que a pessoa já viu (guardado no aparelho —
o banco só guarda fatos, e "viu" não é um).

### Correções grandes já feitas — não reintroduza

- **Tela branca ao trocar de aula.** Resetar estado em `useEffect` quando a rota
  muda de parâmetro é tarde demais: o React renderiza a aula nova com o índice da
  anterior. Ajuste estado **durante o render**.
- **Metade dos exercícios não conseguia avisar que fora resolvida.** Uma prop
  opcional (`onSolved`) que dois dos quatro tipos não recebiam. Hoje existe um
  tipo compartilhado, `ExerciseState`, e a aula **lê** em vez de adivinhar.
- **A aula era concluída no primeiro exercício**, com confete no meio dela. Hoje
  conclui quando todos fecham.
- **O resumo afirmava "progresso salvo" para quem pulou tudo.**
- **`console.log(NaN)` mostrava `null`** — `JSON.stringify` mente sobre `NaN`,
  infinitos e `undefined`.
- **A tela inicial só conhecia a trilha de JavaScript, e a de trilhas era uma
  grade de cards iguais.** Hoje as duas mostram o **percurso**
  (`content/percurso.ts`, `lib/percurso.ts`): cinco etapas na ordem em que
  uma trilha prepara a outra, o ponto atual marcado, um botão só. Não volte à
  grade.
- **Ordenar passos só tinha setas; escrever o teste não explicava `assert`.**
  O arrasto existe (pela pega, com as setas mantidas para teclado) e o
  `assert` tem um painel "Como escrever um teste" antes do editor.

## 5. O que ESTÁ SENDO FEITO agora

**Nada em andamento.** O último commit fecha a trilha de Testes e
Qualidade (veja B9) — 8 aulas, o conserto do motor `write-test` para
aceitar `await` no teste do aluno —, o CI está verde, e a árvore está
limpa. Você começa num ponto estável.

O que falta na Fase 5: Git e Equipe (6 aulas) e Terminal e Ferramentas
(5 aulas), nenhuma exigindo motor novo.

## 6. O que VAI SER FEITO — e a decisão que precisa ser tomada

O projeto está em **~67%**. A porcentagem por aula (91 de 135, 67%) anda
junto com os motores: 5 dos 7 prontos, e os dois que faltam são o servidor
simulado (Node) e o Pyodide.

Há três caminhos, e eles **não são equivalentes**:

### A) Publicar — FEITO em 2026-09-14

Está no ar na Vercel, pela integração com o GitHub: cada push no `main` vira
um deploy de produção. O que ainda vale fazer, do lado do usuário:
1. Abrir num telefone de verdade e percorrer uma aula inteira, inclusive um
   exercício de código — o editor agora é servido pela própria Vercel.
2. Conferir que o login com Google volta para a URL de produção (as *Redirect
   URLs* do Supabase precisam incluí-la).

Boa parte disso depende do dono do projeto, não de quem programa. Se for este o
caminho, escreva o passo a passo exato e peça a ele que execute.

### B) Motor de iframe isolado — FEITO em 2026-09-14

O motor está pronto e provado nos dois lados. O que existe:

- `lib/pagina-core.ts` (puro): monta o documento — CSP com `default-src
  'none'`, captura de console e erros antes do aluno, testes no `load` — e lê
  a mensagem de volta. `lib/pagina.ts`: escreve o documento num `<iframe
  sandbox="allow-scripts allow-modals">` e espera a resposta com prazo.
  `lib/pagina-jsdom.ts`: o mesmo documento no jsdom, para o CI.
- `runtime: 'iframe'` nos tipos `code` e `fill-blank`; `CodeExerciseStep` e
  `FillBlank` mostram a página num painel entre o editor e a ação.
- Dentro da página, `localStorage`/`sessionStorage` em memória e um `fetch`
  dublê servido por `window.__servidor`, que o exercício define — sem rede,
  com armazenamento e busca de dados para ensinar.
- Trilha `track-pagina` completa: **26 aulas, 156 exercícios, 78 de página**
  — 10 de HTML e CSS, 8 de DOM e eventos, 8 de UI e UX. O E2E
  `e2e/pagina.spec.ts` conclui **toda** aula da trilha no Chromium e prova o
  isolamento (sem `localStorage`, CSP ativa) — cada aula nova entra nele
  sozinha.

As armadilhas do jsdom contra o Chromium (CSP ignorada, `rem`/`var()`/`@media`
não resolvidos, aninhamento de CSS que derruba o analisador, `innerText`
ausente) estão medidas no `CONTEXTO.md` §7, e os ajudantes que as asserções de
CSS usam em `src/content/lessons/_ajudantes-css.ts`.

A Fase 2 está **fechada**. Ficou um item de plataforma, sem dependência de
motor: mapa de tópicos e busca.

### B2) Motor de TypeScript — FEITO em 2026-09-14

- `lib/typescript-core.ts` (puro): opções do compilador, o que o sandbox
  declara existir (`console`, temporizadores — sem DOM), formato e tradução
  dos erros, e os trechos de tipo. `lib/typescript.ts`: segunda instância do
  worker de TypeScript do Monaco, modelos temporários `plaintext` com URI
  `.ts`. `lib/typescript-node.ts`: o pacote `typescript` no CI, mesma versão.
  `lib/executar.ts`: `executarNaLinguagem()`, por onde todo componente de
  exercício passa.
- `typeTests` em `code` e `fill-blank`: trechos que o compilador precisa
  aceitar ou recusar (`rejects: true`). O CI cobra que todo `rejects` seja
  aceito sem o trabalho do aluno.
- Trilha `track-typescript`, 10 aulas, 59 exercícios; `e2e/typescript.spec.ts`
  conclui cada aula no Chromium.

As armadilhas do worker do Monaco (registro assíncrono, um programa só para
todos os modelos, validação de todo modelo `typescript`) estão no
`CONTEXTO.md` §7 — cada uma custou uma rodada do E2E.

### B3) Motor de React — FEITO em 2026-09-15

- `lib/react-core.ts` (puro): as declarações do React e do DOM do iframe
  para o compilador (escritas à mão, só em aula de React), o documento com o
  React e o ReactDOM embutidos como texto e a montagem de `App` com
  `flushSync`, e os ajudantes dos testes (`clicar`, `digitar`, `enviar`,
  `botao`, `campo`, `texto`, `textos`, `esperar`). `lib/react-umd.ts`: os
  builds UMD importados pelo caminho com `?raw`, num chunk próprio.
- `language: 'react'` na aula liga tudo: editor em `.tsx`, compilação com
  `jsx`, `executarPagina` com `react: true`. O CI cobra que uma aula de React
  só use os tipos que o motor roda.
- Os testes de página rodam em série (`buildProgram` com `sequencial`), e o
  iframe tem `allow-forms`.
- Trilha `track-react`, 14 aulas, 84 exercícios; `e2e/react.spec.ts` conclui
  cada aula no Chromium e prova o componente interativo dentro do iframe.

### B4) A tela de trilhas — FEITO em 2026-09-15

`/app/trilhas` é a visão geral (um card por trilha, projetos logo abaixo) e
`/app/trilhas/:trackId` a trilha inteira em blocos por assunto
(`Track.sections`, conferidos na carga). Veio de uma reclamação do dono do
projeto: seis trilhas desenroladas numa coluna eram uma parede.

### B5) Motor de SQL — FEITO em 2026-09-16

- `lib/sql-core.ts` (puro): o contrato `Banco`, o adaptador do `sql.js`
  comando a comando, o julgamento por linhas devolvidas com as frases de
  diferença ("faltou a linha…", "na ordem errada — confira o ORDER BY"), e
  a tradução dos erros do SQLite. `lib/sql.worker.ts`: o SQLite em
  WebAssembly (658 kB, do próprio domínio) num worker que fica vivo entre
  execuções e é descartado no prazo. `lib/sql.ts`: fila, aquecimento ao
  montar, relógio a partir do `iniciou`. `lib/sql-node.ts`: o mesmo pacote
  no CI.
- Tipo de exercício `sql`: `database` (um de `src/content/bancos/`), `setup`
  opcional, `tests` com `query` opcional (sem ela, compara o SELECT do aluno;
  com ela, o que ficou no banco), `ordered`, `columns`. A referência recusada
  pelo banco cobra a mesma recusa — é como se testam as restrições.
- Trilha `track-sql`, 10 aulas em dois blocos, 43 exercícios de SQL;
  `e2e/sql.spec.ts` conclui cada aula no Chromium.

### B6) Motor 4 e a trilha de Node — feito (2026-09-17 e 2026-09-20)

- `lib/servidor-core.ts`: o prelúdio do Node de mentira (`require`,
  `process.env`, `module.exports`, o Express pequeno, `pedir()`); o sandbox
  ganhou `sequencial` e devolve as `trocas`. `lib/servidor.ts` no cliente.
- Tipo de exercício `server`: `initialCode`, `tests` com `pedir(app, método,
  caminho, { body, headers })`, `env`, `arquivos` (módulos que
  `require('./nome')` encontra — os testes também podem fazer `require`),
  `solution` obrigatória. O CI prova a solução, o inicial que não passa, e que
  toda verificação com `pedir` fez o pedido.
- Trilha `track-node`, 10 aulas em quatro blocos, 64 exercícios (30 de
  servidor); `e2e/node.spec.ts` conclui cada aula no Chromium e prova o painel
  de pedidos e respostas.

### B7) A trilha de engenharia — feito (2026-09-21)

- `track-engenharia`, "Engenharia: Organizar um Projeto", 8 aulas em três
  blocos, 48 exercícios, na quinta etapa do percurso ("O ofício"). Pedida pelo
  dono do projeto em 2026-09-17.
- O motor 4 ganhou: `require` resolvido relativo a quem pede (`../`, pasta
  com `index.js`, ciclo devolve o parcial) e o campo `caminho` do exercício
  `server` — onde o arquivo do aluno mora; a tela mostra "pasta/arquivo.js — o
  seu arquivo" acima do editor.
- `e2e/engenharia.spec.ts` conclui cada aula no Chromium.

### B8) O projeto final, metade — feito (2026-09-21)

- `track-projeto`, "Projeto Final: A Aplicação Inteira", aulas 1–3 (desenho;
  banco e repositório; API sobre o banco), 16 exercícios, sexta etapa do
  percurso. SQL e servidor na mesma aula (exceção do CI só para esta trilha);
  banco de exemplo `tarefas` em `content/bancos/`.
- Motor 7, primeira metade: `lib/servidor-banco.worker.ts` (sandbox + SQLite
  no mesmo worker), `require('./banco')` no prelúdio (`consultar`/`executar`
  com `?`, Promises), `ServerExercise.banco`, `runProgram({ globais })`,
  `retratoDasTabelas`, a tela com `banco.sql` antes e "O banco depois". Prazo
  de execução com banco: 8 s (`EXECUTION_COM_BANCO_MS`).
- A segunda metade (mesmo dia): `worker-servico.ts` (o protocolo servir /
  pedir / trocas nos dois workers), `abrirServidorVivo` em `sandbox.ts`,
  `subirServidor` em `servidor-core.ts` (o último `app` e o `pedir` ficam em
  `globalThis`), a `PONTE` em `pagina-core.ts` (o `fetch` do iframe que manda
  o pedido ao pai por `postMessage` e recebe a resposta pelo id),
  `executarPagina`/`rodarPaginaNoJsdom` com `servidor`, e
  `CodeExercise.servidor` — a tela mostra o servidor antes e os pedidos da
  página depois. Aulas 4 e 5 escritas; `e2e/projeto.spec.ts` prova a ponte no
  Chromium. Os arquivos da API ficam em `lessons/proj-servidor.ts`.
- Faltam os três capstones (a lista de tarefas completa, a loja, o blog).

### B9) A trilha de Testes e Qualidade — feito (2026-09-21)

- `track-testes`, "Testes e Qualidade", 8 aulas em dois blocos ("A forma de
  um teste"; "Testar sem travar"), 41 exercícios (14 de escrever o teste no
  catálogo, 7 aqui — o tipo central da trilha), na sétima etapa do percurso,
  "A profissão", pedida pelo dono do projeto como parte do resto da Fase 5.
- A aula 5 ensina a testar um servidor (motor 4) com `await pedir(...)`
  **dentro do próprio teste que o aluno escreve** — e isso expôs uma
  limitação real do motor `write-test`: o código do aluno era colado como
  texto solto num programa síncrono (`new Function`), então `await` no topo
  era `SyntaxError`. Consertado em `lib/escrever-teste.ts`: o teste do aluno
  virou uma `SandboxTest` própria, passando pelo mesmo corredor assíncrono
  com prazo (`expressaoDeTeste` em `sandbox-core.ts`) que os exercícios de
  código e servidor já usavam. `avaliarTestes()` agora recebe um `executar`
  que roda `SandboxTest[]` de verdade, em vez de só o texto do programa —
  toda a suíte de unidade (2.856 testes) confirma que nenhum `write-test`
  existente quebrou com a mudança.
- `e2e/testes.spec.ts` conclui cada aula no Chromium e prova, com um teste
  correto e um vazio, que a tela nomeia cada sabotagem pega e cada defeito
  que escapou.

### C) Mais projetos com o motor atual — barato, sem currículo novo

Existem 7 projetos e o roadmap prevê ~30. Eles usam a mecânica que já existe e
dão prática aplicada. É o caminho de menor risco e menor retorno.

### Recomendação

A, B, B2, B3, B4, B5, B6, B7, B8 e B9 estão feitos: as Fases 1 a 4 completas,
a Fase 5 com engenharia e testes prontos (falta Git e equipe, e Terminal), e
a Fase 7 — o projeto final, o pedido central do dono do projeto — está
completa, com o motor 7 inteiro. O que vem agora: os **três capstones** da
Fase 7 (a plataforma existe; falta decidir a forma), o resto da **Fase 5**
(Git e equipe — 6 aulas —, Terminal — 5 aulas) ou a Fase 6 (Python, o
Pyodide). Pergunte ao dono do projeto. Ou C, ou os itens de plataforma que
ficaram (mapa de tópicos e busca, tutor com IA, painel do aluno). Antes de
qualquer um, vale o que só o dono do projeto pode fazer: usar o aplicativo
publicado num telefone de verdade, inclusive uma aula de Node.

Se o dono do projeto não indicar o caminho, pergunte antes de começar uma
fase ou C — são investimentos grandes o bastante para a escolha ser dele.

## 7. Como trabalhar

### Verificação obrigatória antes de dizer que terminou

```bash
npm run typecheck   # inclui e2e/ e playwright.config.ts
npm test            # 2.856 testes
npm run test:e2e    # 378 no navegador (antes: npx playwright install chromium)
npm run build
```

E **confira a execução do CI de verdade** depois do push. O CI deste projeto já
ficou vermelho por sete commits enquanto a sessão anterior afirmava que estava
verde, porque só olhava os testes locais.

### Método que tem funcionado — mantenha

1. **Medir, não olhar.** `getBoundingClientRect`, `elementFromPoint`,
   `getComputedStyle`. Screenshot não prova layout.
2. **Sabotar para provar que o teste pega.** Quebre a correção de propósito,
   confirme o vermelho, reverta. Três testes já passaram vazios até alguém fazer
   isso — um deles cobria escalada de privilégio.
3. **Escrever o teste antes da correção**, para ele apontar o problema real em
   vez do que você imaginou.
4. **Olhar a tela renderizada** antes de dizer que uma mudança de interface está
   pronta.
5. **Percorrer o fluxo do aluno no navegador**, do começo ao fim. A tela branca
   ao trocar de aula viveu meses numa base com mais de quinhentos testes.

### Armadilhas que já custaram tempo

Estão todas em `docs/CONTEXTO.md`, seção 7. As que mais mordem:

- `\d` e `[\s\S]` dentro de template literal viram `d` e `[sS]`. Use `[0-9]`, ou
  dobre a barra.
- O sandbox roda em **modo estrito**: atribuir a propriedade congelada lança.
  Rode o trecho pelo `runProgram` antes de escrever um `expectedOutput`.
- Teste de data que depende de fuso passa localmente e falha no CI. O CI roda o
  conteúdo em Pacific/Kiritimati (UTC+14) de propósito.
- Asserção com `.then()` sem `await` reporta sucesso antes de a promise resolver.
- `useAuth()` devolve objeto novo a cada render: dependa de `user?.id`.

### Convenções

- **Português em tudo**: código, comentários, commits, interface.
- **Sem Lucide Icons** — os ícones são SVG próprios em `components/ui/Icon.tsx`,
  grade 24, traço 1.75, `currentColor`.
- **Mobile-first**, com identidade própria: nada de gradiente agressivo, bento
  grid, glassmorphism, emoji na interface, roxo com preto, orbes, sparkles.
- **Nenhum recurso falso.** Botão que não faz nada, número que não significa nada
  e teste que passa vazio já foram removidos várias vezes.
- Commits explicam **por que**, não o quê.
- Atualize `docs/CONTEXTO.md` e `docs/curriculo.md` **no mesmo commit** que muda
  o que eles descrevem.

### Ao acrescentar conteúdo

Aula nova precisa de: arquivo em `src/content/lessons/`, entrada no array de
`src/content/index.ts`, e o id na ordem da trilha em `src/content/tracks/`. O
validador Zod falha alto se faltar qualquer um.

Exercício novo precisa passar pelas checagens de `src/content/content.test.ts`,
que provam — rodando no sandbox de verdade — que a solução de referência resolve
e que o esqueleto **não** resolve.

## 8. Primeira coisa a fazer nesta sessão

1. Ler `docs/CONTEXTO.md` e `docs/curriculo.md`.
2. Rodar `npm run typecheck && npm test && npm run build` para confirmar que a
   base está sã antes de mexer em qualquer coisa.
3. Me dizer qual dos três caminhos da seção 6 você recomenda e por quê — em
   poucas linhas, sem enrolar — e esperar minha confirmação antes de começar B
   ou C. Se eu já tiver indicado o caminho, siga direto.

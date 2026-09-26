# Auditoria do CodeFlow — 2026-09-26

Vistoria de 100% do repositório: código, conteúdo, migrações, testes, CI,
documentação e a aplicação rodando no Chromium. O roadmap que sai daqui está em
[`ROADMAP_AUDITORIA.md`](ROADMAP_AUDITORIA.md). Os P0 e a maior parte dos P1
**já foram corrigidos nesta mesma rodada** — cada item diz o seu estado.

---

## Resumo executivo

O CodeFlow é um projeto muito acima da média de um projeto pessoal: oito motores
de execução no navegador bem isolados, conteúdo como código provado pelo CI
(cada exercício tem a solução de referência executada e o esqueleto reprovado),
estado derivado de histórico append-only, 3.300+ testes de unidade e 400+ de
navegador, e uma identidade visual própria e consistente. Nada disso deve ser
desfeito.

Os problemas sérios estão **todos na fronteira com o banco**, que é a parte que
os testes não viam (a camada `progress.ts`/`perfil.ts` não tinha um teste
sequer):

1. **Perda de progresso.** Concluir uma aula fazia *ler → acrescentar →
   regravar a lista inteira*. Se a leitura falhasse (rede), ela voltava vazia e
   a regravação **apagava todas as aulas concluídas** do aluno.
2. **Histórico congelado em 1.000 linhas.** O Supabase corta toda resposta em
   `max-rows` (1.000) sem avisar. Um aluno ativo passa disso em poucas semanas:
   a partir daí XP, sequência, desafios e moedas paravam no passado — a ordem é
   crescente, então o que se perdia era justamente o mais recente.
3. **Vazamento de dados pessoais.** A conta de demonstração `admin`/`admin` tem
   a senha impressa na tela de login, e a policy de admin permitia ler a tabela
   `users` inteira: qualquer visitante lia **e-mail e nome de todas as pessoas
   cadastradas**. Qualquer visitante também podia trocar a senha das contas de
   demonstração.
4. **A economia confiava no navegador.** A compra era um `INSERT` com o preço
   que o cliente mandasse (preço 0 passava), sem trava contra duas abas, sem
   impedir cosmético duplicado, e o saldo só era conferido na tela.
5. **Exploits e regressões de progresso:** reabrir uma aula antiga durante o
   "dobro de XP" dobrava de novo o XP dela (e de todas as outras); exercícios
   resolvidos em visitas anteriores "desresolviam" ao reabrir a aula; a tela
   dizia "progresso salvo" e "projeto entregue" mesmo quando a gravação falhava.

Todos esses foram corrigidos, com teste que falha sem a correção (a sabotagem
foi feita para cada um). A migração `0009_integridade.sql` precisa ser aplicada
no SQL Editor — até lá o aplicativo cai no caminho antigo, já sem a perda de
dados.

O que fica para as próximas fases, em ordem de valor: **performance de
carregamento** (o pacote principal tem 3,5 MB / 972 kB comprimido e leva o
catálogo inteiro até para a página pública), **a experiência de revisão**
(não existe caminho para refazer um exercício errado; 62% dos conceitos não têm
flashcard; 85% dos exercícios têm uma ou duas dicas, e a diretriz pede quatro),
e **a economia**, cujo lado cosmético se esgota em ~8 semanas de estudo — base
para a Loja 2.0.

### Números da vistoria

| | Antes | Depois desta rodada |
| --- | --- | --- |
| Typecheck | ok | ok |
| Testes de unidade | 3.317 (52 arquivos) | 3.353 (56 arquivos) |
| Build | ok, chunk principal 3.512 kB (972 kB gz) | ok |
| CI do `main` | **vermelho** desde 09-25 (`trilhas.spec`, ver CI/CD) | teste corrigido |
| E2E dos fluxos tocados (17 arquivos: perfil, loja, aula, teclado, celular, admin, painel, novidades, trilhas, projeto e os 3 capstones…) | — | 151 passam (8 pulados por projeto, de propósito); os 3 vermelhos restantes são do ambiente deste contêiner e falham igual no commit original (ver CI/CD) |
| Rolagem horizontal, 13 telas × 9 larguras (320 → 1920) | medida | **nenhuma** |
| Lint | **não existe** no projeto | não existe (ver P2-12) |

---

## Como a auditoria foi feita

- Leitura de `docs/CONTEXTO.md`, `docs/context/01…05`, `docs/design-system.md`,
  `docs/curriculo.md` (cabeçalho), README, e de todo o código fora de
  `src/content/lessons/` (o conteúdo foi medido por script).
- `npm run typecheck`, `npm test`, `npm run build`, `npm audit`.
- Script de exports sem uso (varre `src` e `e2e` por referência fora do arquivo).
- Script de conteúdo: tipos de exercício, dicas por exercício, conceitos sem
  flashcard, XP por aula.
- Simulação da economia com o catálogo real (ver "Economia").
- Playwright com o dublê do Supabase: 13 telas × 9 larguras, medindo
  `scrollWidth`, elementos fora da viewport, alvos de toque e `<h1>` por tela,
  com capturas em 320, 390 e 1366.
- Para cada defeito corrigido: teste escrito antes, falhando pelo motivo certo,
  e a correção sabotada depois para provar que o teste pega.

---

## Mapa da arquitetura

```
Navegador (React 18 + Vite, SPA)                       Supabase
────────────────────────────────                       ────────
AuthContext ── supabase-js (sessão no localStorage) ── Auth (Google OAuth; senha só p/ demo)
TemaContext (localStorage + perfil)
StudentDataContext (só dentro do AppShell)
  └─ lê TUDO: users, exercise_attempts, ──────────────  Postgres + RLS
     flashcard_reviews, purchases, perfil               users (listas de concluídas, perfil, papel)
  └─ deriva: XP, nível, sequência, moedas,              exercise_attempts (append-only)
     desafios, conquistas, domínio, revisão             flashcard_reviews (append-only)
Lesson / Project / Review (fora do AppShell)            purchases (append-only)
  └─ gravam: tentativa, conclusão, revisão ───────────  store_items + funções (0009)
Motores de execução (workers e iframe) ── nada vai ao servidor
Conteúdo: módulos TS em src/content, validados por Zod, empacotados no JS
Express (server.ts): só serve o dist; na Vercel nem isso
```

- **Frontend → backend.** Não há API própria: o navegador fala direto com o
  PostgREST do Supabase. A autorização é o RLS (cada um lê e escreve só as
  próprias linhas) mais funções `security definer` com `revoke`. O `server.ts`
  e o `/api/health` não são usados em produção.
- **Autenticação.** Google OAuth via Supabase, com `/auth/callback` para
  esperar a troca do código. Contas de demonstração por senha (0008). Papel de
  admin na coluna `role`, protegido por gatilho (0001/0006).
- **Persistência e modelo de dados.** Quatro tabelas de fatos. Quase nada é
  contador: XP, nível, sequência, domínio, moedas ganhas, desafios cumpridos e
  conquistas são **derivados** no navegador a cada carga. As duas exceções são
  as listas `completed_lessons` / `completed_projects` em `users`.
- **Estados globais.** `AuthContext` (sessão), `TemaContext` (aparência) e
  `StudentDataContext` (histórico + todas as derivações num `useMemo` só).
- **Progresso.** Aula conclui quando todos os exercícios dela foram resolvidos
  (qualquer resposta libera o avanço; só o acerto conta). Tentativa é gravada
  por exercício (`useRecordAttempt`, sem bloquear). Projeto conclui quando
  todos os critérios passam.
- **XP** (`gamification.ts`): 20 por exercício distinto (+10 sem dica, +5 depois
  de errar), 50 por aula, 150 por projeto, 5 por cartão revisado, XP de
  desafio; dobro de XP por janela de 24 h. Nível *n* a partir de `75·n·(n−1)`.
- **Moedas** (`economia.ts`): 10 por aula, 40 por projeto, 15/50 por desafio
  diário/semanal, 30/100 por corrente de 7/30 dias. Gastas = soma de
  `purchases`. Saldo = diferença.
- **Compras.** Agora pela função `comprar_item` (0009): preço do catálogo do
  banco, uma compra por vez por pessoa, cosmético uma vez, teto de gasto.
- **Exercícios.** Dez tipos, um componente cada, contrato comum
  `ExerciseState` reportado à aula; correção por comportamento nos motores.
- **Projetos.** `ProjectWorkspace` roda cada critério isolado; capstones sobem
  servidor + banco + página (motor 7).
- **Desafios** (`desafios.ts`): rodízio determinístico pela data, 2 de 5 por dia,
  2 de 6 por semana; cumprir é receber, sem tabela de resgate.
- **Conquistas** (`gamification.ts`): 67, derivadas, em 5 categorias.

### Avaliação por parte

| Estado | Partes |
| --- | --- |
| **Bem estruturadas** | Motores de execução (núcleo puro + casca de navegador + casca de CI); conteúdo como código com CI provando cada exercício; `ExerciseState`; design system (`Button`, `Card`, tokens testados por contraste); migrações idempotentes e testadas estaticamente |
| **Aceitáveis** | Desafios, sequência, domínio, revisão espaçada — lógica pura e testada, mas com custo O(dias × tentativas) recalculado a cada mudança |
| **Frágeis** (corrigido nesta rodada) | Camada de persistência sem testes; conclusão por leitura-e-regravação; leituras sem paginação; erros de leitura silenciosos |
| **Excessivamente acopladas** | `StudentDataContext`: uma leitura, um `loading`, um valor gigante para todas as telas — qualquer mudança re-renderiza tudo que o consome; toda tela depende do histórico inteiro |
| **Complexas demais** | `Lesson.tsx` (10 blocos quase idênticos, um por tipo de exercício); `desafiosConcluidos` (reavalia cada dia da história filtrando todas as tentativas); o `index.ts` do conteúdo (validação + consultas + referências num arquivo de 560 linhas) |

---

## Documentação × implementação

| Documento | O que está desatualizado |
| --- | --- |
| `docs/context/04-architecture-security.md` | Fala em PostgreSQL Cloud SQL "via AI Studio" com Drizzle/Prisma e Firebase Auth; a aplicação é Supabase (Postgres + RLS + Auth), sem ORM. Recomenda DOMPurify para o markdown — o `react-markdown` sem `rehype-raw` já não renderiza HTML, o que basta. Fala em containers para Python/SQL — ambos rodam em WebAssembly no navegador |
| `docs/context/05-roadmap-and-workflow.md` | Diz "Fase 1: Planejamento (Atual)"; o projeto passou de todas as 19 fases listadas, exceto IA |
| `docs/CONTEXTO.md` §3 e §6 | "Atualizado em 2026-09-16", 14 trilhas / 143 aulas / 823 exercícios, "2.321 testes"; o catálogo tem 17 / 154 / 888 e a suíte 3.3 mil. §5 omite `perfil`, `purchases` mais recentes e as migrações 0009 (atualizado nesta rodada) |
| `README.md` | Tabela de migrações parava na 0008 (atualizado nesta rodada) |
| `metadata.json`, `firebase-*.json` | Sobras do scaffold do AI Studio, com a configuração de um projeto Firebase que o código nunca usou (removidos nesta rodada) |
| `docs/design-system.md` | Correto e útil; só não menciona as vinhetas pintadas que substituíram os ícones de traço nos estados vazios |

---

## Problemas por prioridade

Legenda de estado: **Corrigido** (com teste, nesta rodada), **Parcial**,
**Pendente** (no roadmap).

### Resumo

| ID | Problema | Estado |
| --- | --- | --- |
| P0-1 | Concluir aula/projeto com a leitura falhando apagava todo o progresso | Corrigido |
| P0-2 | Histórico truncado em 1.000 linhas (tentativas, revisões, compras) | Corrigido |
| P0-3 | Conta demo `admin`/`admin` lia e-mail e nome de todos os usuários | Corrigido (0009) |
| P1-1 | Senha/e-mail das contas demo podiam ser trocados por qualquer visitante | Corrigido (0009) |
| P1-2 | Compra com preço do cliente, sem trava, cosmético duplicável, saldo só na tela | Corrigido (0009) |
| P1-3 | Conclusões simultâneas (duas abas) perdiam uma das duas | Corrigido (0009) |
| P1-4 | Exercício resolvido em visita anterior "desresolvia" ao reabrir a aula | Corrigido |
| P1-5 | Farm de XP com o dobro; desafio "conclua uma aula" cumprido refazendo; moedas retroativas instáveis | Corrigido |
| P1-6 | Falhas de leitura silenciosas: saldo inflado e loja vendendo sobre ele | Corrigido |
| P1-7 | "Progresso salvo" / "Entregue" afirmados sem a gravação ter acontecido; confete repetido ao revisitar | Corrigido |
| P1-8 | Renovação de token recarregava todos os dados e reembaralhava a revisão | Corrigido |
| P1-9 | Sem limite de ritmo de escrita; sem validação de formato das tentativas | Corrigido (0009) |
| P1-10 | O progresso é autoridade do navegador (tentativas e conclusões forjáveis) | Pendente — arquitetural |
| P2-1 | Pacote principal de 3,5 MB com o catálogo inteiro, até na página pública | Parcial |
| P2-2 | Derivações O(dias × tentativas) recalculadas a cada mudança de estado | Corrigido |
| P2-3 | O histórico inteiro é baixado a cada entrada no aplicativo | Pendente |
| P2-4 | Bloqueio de rede dos workers contornável pelo protótipo; código duplicado | Corrigido |
| P2-5 | Motor de Python sem bloqueio de rede (`from js import fetch`) | Corrigido |
| P2-6 | Laço infinito numa página do aluno pode congelar a aba no celular | Pendente |
| P2-7 | Sem cabeçalhos de segurança HTTP | Parcial |
| P2-8 | `service_role` legada não era reconhecida como chave secreta | Corrigido |
| P2-9 | Ferramentas de dev com vulnerabilidades (Vite 5, Vitest 2); DOMPurify via Monaco | Pendente |
| P2-10 | Fontes servidas pelo Google (terceiro, privacidade, falha offline) | Corrigido |
| P2-11 | Quatro telas sem `<h1>` (trilha, aula, revisão, projeto) | Corrigido |
| P2-12 | Sem ESLint | Corrigido |
| P2-13 | Camada de persistência e `StudentDataContext` sem testes | Corrigido |
| P2-14 | 85% dos exercícios com ≤ 2 dicas; a diretriz pede 4 níveis | Pendente |
| P2-15 | Nenhum caminho para refazer um exercício errado; 62% dos conceitos sem flashcard | Pendente |
| P2-16 | Economia: cosméticos esgotam em ~8 semanas e competem com a liberação por nível | Pendente (Loja 2.0) |
| P2-17 | Documentação de arquitetura desatualizada | Parcial |
| P2-18 | Observabilidade: só `console.error` | Pendente |
| P3-1 | Código morto (funções, ícones, constantes) | Parcial |
| P3-2 | Dependências sem uso e sobras do AI Studio | Corrigido |
| P3-3 | Dois lockfiles (`bun.lock` e `package-lock.json`) | Pendente — investigar |
| P3-4 | `Lesson.tsx` repete dez blocos quase iguais | Corrigido |
| P3-5 | Links soltos com 20 px de altura (WCAG 2.5.8) | Corrigido |
| P3-6 | Nome e avatar sem limite no banco | Corrigido (0009) |
| P3-7 | Login ignorava a rota de origem | Corrigido |
| P3-8 | Validação Zod de todo o catálogo roda em produção | Corrigido |
| P3-9 | Texto de erro do provedor OAuth refletido da URL | Corrigido |
| P3-10 | "Novidades" vistas guardadas por aparelho | Pendente |
| P3-11 | Rótulo ambíguo no cartão de XP do perfil | Corrigido |

### P0 — crítico

#### P0-1 · Concluir com a leitura falhando apagava todo o progresso — Corrigido
- **Arquivo:** `src/client/lib/progress.ts` (`appendToProgress`)
- **Por quê:** `fetchProgress` nunca lança — numa falha devolve listas vazias com
  `error`. `appendToProgress` ignorava o `error`, acrescentava o id à lista vazia
  e fazia `upsert` da lista inteira: `completed_lessons = ['a-aula-de-agora']`.
- **Impacto:** perda silenciosa de todas as aulas (ou projetos) concluídos, com
  XP, moedas, conquistas e percurso junto. Basta uma oscilação de rede no
  segundo em que a aula fecha.
- **Solução:** função `concluir(p_coluna, p_id)` no banco (0009), que acrescenta
  com `array_append` num único `UPDATE` (atômico, `security invoker`, valida o
  formato do id). Sem a 0009, o caminho antigo continua — mas **lança** se a
  leitura falhou, em vez de regravar. Teste: `progress.test.ts` ("uma leitura
  que falha NÃO vira lista vazia regravada").

#### P0-2 · Histórico truncado em 1.000 linhas — Corrigido
- **Arquivo:** `src/client/lib/progress.ts` (`fetchAttempts`,
  `fetchFlashcardReviews`), `src/client/lib/perfil.ts` (`fetchPurchases`)
- **Por quê:** o PostgREST do Supabase corta toda resposta em `max-rows`
  (1.000 por padrão) sem erro. As consultas não paginavam e ordenavam de forma
  crescente.
- **Impacto:** com ~5,8 exercícios por aula e várias tentativas por exercício, um
  aluno ativo passa de mil tentativas em algumas semanas. Dali em diante tudo o
  que é derivado para no passado: sequência quebra, XP e desafios param de
  subir, moedas param de entrar — e ninguém vê erro nenhum.
- **Solução:** `lerTodasAsPaginas` — páginas de 1.000 com `.range()`, contagem
  exata na primeira página, ordem estável (`created_at, id`), trava de 200
  páginas; devolve `{ dados, erro }` para quem chama saber de uma leitura
  incompleta. Testes cobrem 2.037 linhas, número redondo e página que falha.

#### P0-3 · A conta demo de admin lia os dados pessoais de todos — Corrigido (0009)
- **Arquivos:** `supabase/migrations/0005_admin.sql`, `0008_contas_demo.sql`,
  `src/client/lib/demo.ts`
- **Por quê:** a 0005 dá ao admin `select` em `users`, `exercise_attempts` e
  `flashcard_reviews` inteiras. A 0008 cria `admin`/`admin` com a senha impressa
  na tela de login. Qualquer visitante entrava e chamava
  `/rest/v1/users?select=email,name`.
- **Impacto:** exposição de e-mail e nome de todos os usuários (LGPD), e de todo
  o histórico de estudo.
- **Solução:** as três policies amplas saem. O painel passa a ler a função
  `desempenho_por_exercicio()` (`security definer`, só números por exercício,
  só para admin). O cliente usa a função e cai na view antiga num banco sem a
  0009. Teste estático em `supabase/migrations.test.ts`.

### P1 — alto

#### P1-1 · Contas de demonstração sequestráveis — Corrigido (0009)
- **Arquivo:** `supabase/migrations/0008_contas_demo.sql`
- **Por quê:** qualquer sessão pode chamar `auth.updateUser({ password })`.
- **Impacto:** um visitante tranca a demonstração para todos os outros.
- **Solução:** gatilho `proteger_contas_demo` em `auth.users` desfaz troca de
  senha, e-mail e telefone das contas `@demo.codeflow.app`, exceto quando a
  marca local `app.allow_demo_reset` está ligada (só a 0008 liga). A foto de
  perfil também não sobe dessas contas (bucket público = hospedagem anônima), e
  a tela explica isso antes da tentativa.

#### P1-2 · Compra decidida no navegador — Corrigido (0009)
- **Arquivos:** `src/client/lib/perfil.ts` (`recordPurchase`),
  `StudentDataContext.tsx` (`comprar`), policy `purchases_insert_own` (0007)
- **Por quê:** o `INSERT` levava o `price` do cliente (`>= 0` era a única
  regra), sem trava entre abas nem regra de cosmético único; o saldo só era
  conferido no botão.
- **Impacto:** item de graça pelo console; dois cliques/abas gastando o mesmo
  saldo; cosmético comprado duas vezes (moedas perdidas).
- **Solução:** tabela `store_items` (catálogo com `ativo`, `disponivel_de`,
  `disponivel_ate` — base dos itens sazonais) e função `comprar_item(p_item)`:
  preço do banco, `pg_advisory_xact_lock` por pessoa, cosmético uma vez só e
  gasto total limitado por `teto_de_moedas` — um teto que nenhum histórico real
  ultrapassa em nenhum fuso (o saldo exato depende do dia local, que o banco
  não conhece). O `INSERT` direto é revogado. O teste de migrações confere que o
  catálogo do banco é o mesmo de `ITENS` e que o teto usa os números de
  `MOEDAS`. No cliente, `comprar` recusa com histórico incompleto e com uma
  compra já em andamento.

#### P1-3 · Conclusões simultâneas se perdiam — Corrigido (0009)
- **Arquivo:** `progress.ts` · **Por quê:** leitura e escrita separadas (*lost
  update*). **Impacto:** duas abas, ou aula + projeto juntos, perdiam uma
  conclusão. **Solução:** a mesma função `concluir` de P0-1.

#### P1-4 · Exercício resolvido antes "desresolvia" ao reabrir a aula — Corrigido
- **Arquivo:** `src/client/pages/Lesson.tsx`
- **Por quê:** os resolvidos de visitas anteriores eram injetados no mesmo mapa
  que os componentes atualizam; ao montar, o componente avisa `'inicial'` e
  apagava o `'acertou'` antigo.
- **Impacto:** o contador caía (5/6 → 4/6), o botão voltava a "Responda para
  continuar" e, se a pessoa errasse agora, a aula nunca mais fechava.
- **Solução:** `resolvidosAntes` num estado à parte; um exercício resolvido
  antes libera o avanço e conta para a conclusão, com a nota "Você já resolveu
  este exercício". Teste: `Lesson.retomada.test.tsx`.

#### P1-5 · Farm de XP e desafios instáveis — Corrigido
- **Arquivos:** `gamification.ts` (`computeXp`), `desafios.ts`
  (`diaDeConclusaoPorAula`)
- **Por quê:** a aula era datada pela **última** tentativa certa nela.
- **Impacto:** comprar o dobro de XP (80 moedas) e refazer um exercício de cada
  aula antiga dobrava os 50 XP de todas — 100 aulas = +5.000 XP. O desafio
  "conclua uma aula hoje" se cumpria refazendo um exercício, e o dia original
  perdia o desafio (e as moedas) retroativamente — o saldo podia até ficar
  negativo depois de gasto.
- **Solução:** `fechamentoDasAulas` (`study.ts`): o instante em que o último
  exercício da aula foi resolvido **pela primeira vez** — fixo, refazer não move.
  Testes nos dois módulos, escolhendo dias em que o desafio está no rodízio
  (sem isso o teste seria vazio).

#### P1-6 · Falhas de leitura silenciosas — Corrigido
- **Arquivos:** `StudentDataContext.tsx`, `Loja.tsx`
- **Por quê:** só a falha de `users` era exposta; tentativas, revisões e compras
  viravam `[]` sem aviso.
- **Impacto:** compras não lidas = saldo inflado, com o botão de comprar
  liberado; tentativas não lidas = sequência zerada e XP errado, sem explicação.
- **Solução:** `incompleto` no contexto, mensagem "Parte do seu histórico não
  carregou", a loja mostra "saldo indisponível" e só volta a vender depois de
  "Carregar de novo". E2E novo em `perfil.spec.ts`.

#### P1-7 · Sucesso afirmado sem gravação; confete repetido — Corrigido
- **Arquivos:** `Lesson.tsx`, `ProjectWorkspace.tsx`
- **Por quê:** a falha de `markLessonCompleted`/`markProjectCompleted` ia só ao
  console; e, na aula, se a lista de resolvidos chegasse antes da de concluídas,
  uma aula já concluída parecia recém-fechada.
- **Impacto:** "Seu progresso foi salvo" e "Entregue" mentiam numa falha de rede;
  confete e gravação repetidos a cada visita de uma aula concluída.
- **Solução:** aula mostra "Salvando…", "salvo" ou "não foi salva — Tentar de
  novo"; espera a lista de concluídas antes de comemorar. Projeto grava antes de
  comemorar e mostra a falha com nova tentativa. Testes em
  `Lesson.retomada.test.tsx`.

#### P1-8 · Renovação de token recarregava tudo — Corrigido
- **Arquivos:** `AuthContext.tsx`, `StudentDataContext.tsx`, `Review.tsx`,
  `useUserRole.ts`, `ProjectWorkspace.tsx`
- **Por quê:** o supabase-js entrega um objeto `User` novo a cada renovação (de
  hora em hora e ao voltar para a aba); efeitos dependiam do objeto. O
  `CONTEXTO.md` já registrava a armadilha, e ela tinha voltado em cinco lugares.
- **Impacto:** esqueleto de carregamento por cima da tela sem nada ter mudado;
  a sessão de revisão era remontada e **reembaralhada** com o índice parado.
- **Solução:** `mesmoUsuario` mantém a referência quando id, e-mail,
  `updated_at` e metadados não mudaram; os efeitos passam a depender do id.

#### P1-9 · Sem limite de ritmo nem de formato — Corrigido (0009)
- **Por quê:** um laço no console gravava milhões de tentativas.
- **Solução:** gatilho `limitar_ritmo` (120 escritas/minuto por pessoa em
  tentativas e revisões) e `check` de tamanho de ids, conceitos e dicas (`not
  valid`, para não reprovar linhas antigas).

#### P1-10 · O progresso é autoridade do navegador — Pendente (arquitetural)
- **Arquivos:** policies de `insert` em `exercise_attempts`, `update` em `users`
- **Por quê:** a correção roda no navegador (é o desenho do produto: oito
  motores, nenhum servidor). Quem tem a própria sessão pode gravar `correct:
  true` ou acrescentar ids a `completed_lessons` pela API.
- **Impacto:** hoje, **só sobre a própria conta** — não há ranking, perfil
  público nem prêmio real. O painel de admin, porém, conta essas tentativas.
- **Solução proposta** (Fase 2 do roadmap): tabela `catalogo_exercicios`
  gerada do conteúdo no CI; `registrar_tentativa` e `concluir` validando que o
  exercício existe e pertence à aula, e que a aula só conclui com todos os
  exercícios dela acertados no histórico. Não impede forjar `correct`, mas fecha
  ids inventados e conclusões sem tentativa. Reexecutar o código do aluno no
  servidor só se justifica se um dia houver competição ou certificado.

### P2 — médio

#### P2-1 · Pacote principal de 3,5 MB — Parcial
- **Arquivo:** `src/content/index.ts` (importa as 154 aulas), `App.tsx` (sem
  divisão por rota)
- **Por quê:** o conteúdo inteiro (3,2 MB de fonte) entra no chunk principal, que
  a página pública também baixa. Medido: `index-*.js` 3.512 kB, 972 kB gzip.
- **Impacto:** em 3G/4G fraco e Android de entrada, vários segundos de download
  e parse antes da primeira tela (LCP e INP).
- **Feito:** medido módulo a módulo, o chunk tinha 47% de corpo de aula,
  ~750 kB de Supabase, 239 kB de Zod (só para validar o catálogo) e ~250 kB de
  Markdown (só usado em aula e projeto). `Lesson`, `Review`,
  `ProjectWorkspace` e o admin viraram rotas sob demanda (o Markdown, os
  componentes de exercício e o Zod do gerador saem do pacote inicial), a
  validação do catálogo roda só em desenvolvimento (P3-8), e o `AppShell`
  adianta o chunk da aula quando a tela fica ociosa. **3.512 → 3.080 kB
  (972 → 847 kB gzip, −13%).**
- **Falta:** separar o catálogo em **índice** (ids, títulos, ordem, ids de
  exercícios e conceitos — o que as telas de orientação usam) e **corpo** de
  aula por trilha, carregado por `import()` quando a aula abre. `content/index`
  continua sendo a única fronteira; ganha uma variante assíncrona para o corpo.

#### P2-2 · Derivações caras recalculadas a cada mudança — Corrigido
- **Arquivos:** `desafios.ts` (`desafiosConcluidos` filtra todas as tentativas
  para cada dia da história — e roda duas vezes por recálculo, uma dentro de
  `computeXp`), `mastery.ts` (filtra todas as tentativas para cada um dos 151
  conceitos, duas vezes: domínio e "para retomar"), `gamification.ts`
  (`aulaSemErro` filtra por aula).
- **Impacto, medido depois do relatório:** com um ano de estudo sintético
  (~5.100 tentativas em 300 dias), `desafiosConcluidos` levava **1,5 s no
  desktop** e rodava duas vezes por recálculo — ~3 s de thread principal
  travada a cada compra ou troca de perfil; no celular, várias vezes isso.
  Pior que a estimativa inicial, por isso subiu na fila.
- **Feito:** índice por dia local, calculado uma vez (cada data convertida uma
  vez só); o período lê só os seus dias; `computeXp` recebe os desafios já
  calculados. **1.525 → 22 ms; o recálculo inteiro do painel, 3.150 → 71 ms.**
  Um teste compara a versão rápida com a conta ingênua antiga em oito
  históricos sorteados — sabotado duas vezes, fica vermelho.

#### P2-3 · O histórico inteiro a cada entrada no aplicativo — Pendente
- **Por quê:** o `StudentDataProvider` vive no `AppShell`; sair de uma aula e
  voltar remonta tudo e rebaixa o histórico inteiro.
- **Solução:** curto prazo — manter o provider acima das rotas e atualizar o
  estado local depois de uma conclusão/tentativa, com revalidação em segundo
  plano (sem esqueleto). Longo prazo — views agregadas no banco (tentativas por
  dia, primeiros acertos por exercício) para a carga não crescer com o tempo.

#### P2-4 · Bloqueio de rede dos workers contornável — Corrigido
- **Arquivos:** `sandbox.worker.ts`, `servidor-banco.worker.ts`
- **Por quê:** redefinia só `self.fetch`; `fetch`, `indexedDB` e `caches` moram
  em `WorkerGlobalScope.prototype`, e
  `Object.getPrototypeOf(self).fetch.call(self, url)` saía para a rede. Duas
  cópias da mesma função.
- **Solução:** `trancar-globais.ts`, um módulo só, que tranca a cadeia inteira
  de protótipos e acrescenta `EventSource`, `Worker`, `SharedWorker` e
  `BroadcastChannel`. Testado no Node com um escopo de mesmo formato.

#### P2-5 · Python sem bloqueio de rede — Corrigido
- **Arquivo:** `python.worker.ts`, `python-core.ts`
- **Por quê:** o Pyodide expõe o escopo do worker ao Python (`import js`,
  `pyodide.http.pyfetch`).
- **Solução:** depois de o Pyodide carregar (ele precisa de `fetch` para os
  próprios arquivos), `trancarGlobais(self)`. Provado no navegador: um teste
  novo em `e2e/python.spec.ts` roda `js.fetch(...)` numa aula — antes a saída
  dizia "REDE: aberta", agora "fechada" —, e as 10 aulas continuam fechando.

#### P2-6 · Laço infinito no motor de página — Pendente
- **Arquivo:** `pagina.ts`
- **Por quê:** o iframe `sandbox` de `srcdoc` roda no mesmo processo da página
  na maior parte dos celulares (o isolamento de iframes sandbox é de desktop).
  O prazo de `pagina.ts` só dispara se a thread principal estiver livre.
- **Impacto:** um `while (true) {}` num exercício de página pode congelar a aba.
- **Solução:** instrumentar laços do código do aluno (checar o relógio a cada
  volta e lançar ao passar do prazo) usando o compilador que o motor 2 já
  carrega, como fazem CodePen e JS Bin.

#### P2-7 · Sem cabeçalhos de segurança — Parcial
- **Arquivo:** `vercel.json`
- **Feito:** `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  strict-origin-when-cross-origin` e `Permissions-Policy` (câmera, microfone,
  localização, pagamento e periféricos desligados) em `vercel.json`.
- **Falta:** depois de
  confirmar que ninguém embute o site (portfólio?), `frame-ancestors 'none'`.
  Uma CSP da aplicação precisa listar o Supabase, `wasm-unsafe-eval` (sql.js,
  Pyodide), `blob:`/`worker-src` e as fontes; testar em produção em modo
  `Report-Only` primeiro.

#### P2-8 · `service_role` legada não reconhecida — Corrigido
- **Arquivo:** `src/client/lib/supabase.ts`
- **Por quê:** a recusa olhava o prefixo; a `service_role` legada é um JWT que
  começa com `eyJ` como a `anon`. **Solução:** lê o `role` de dentro do JWT.

#### P2-9 · Vulnerabilidades em dependências — Pendente
- `npm audit`: Vite 5 (alta — *path traversal* no servidor de dev), Vitest 2
  (crítica — só com a UI do Vitest aberta), esbuild do Vite (moderada — servidor
  de dev), DOMPurify via Monaco (moderada, em produção, mas o markdown do Monaco
  vem do próprio aplicativo). Nenhuma alcança o aluno hoje.
- **Solução:** Vite 6/7 + Vitest 3 numa etapa própria (quebra de API; o
  `semSourcemapNosGigantes` e o `worker.format` precisam ser revalidados) e
  Monaco 0.57 quando a quebra for avaliada.

#### P2-10 · Fontes do Google — Corrigido
- **Arquivo:** `index.html`
- **Por quê:** terceiro em tempo de execução (o IP do aluno vai ao Google, tema
  de LGPD), falha offline, e é o único pedido externo. Neste contêiner o proxy
  derruba o certificado e o E2E "o console não acumula erro" fica vermelho por
  isso.
- **Feito:** as duas são fontes variáveis — um `.woff2` por família (27 kB e
  31 kB, subconjunto latino) cobre todos os pesos — em `public/fontes/` com a
  licença OFL, `@font-face` com `font-display: swap`, `preload` da fonte de
  texto e cache de um ano na Vercel. Um E2E confere que nenhum pedido vai ao
  Google e que as duas carregam; o teste do console, que falhava neste
  contêiner só por isso, voltou a passar.

#### P2-11 · Telas sem `<h1>` — Corrigido
Trilha (`TrackBanner`), aula, revisão e projeto não tinham título de nível 1 —
leitor de tela navega por títulos. Agora têm, sem mudança visual.

#### P2-12 · Sem lint — Corrigido
Não havia ESLint nem script `lint`. Entrou o mínimo — `eslint` +
`typescript-eslint` recomendado + `eslint-plugin-react-hooks` com
`exhaustive-deps` como erro —, `npm run lint`, e o passo no CI antes dos
testes. Achou três coisas: dois falsos positivos (o `use` das fixtures do
Playwright) e uma interface vazia. Correção de uma afirmação desta
auditoria: o `exhaustive-deps` **não** teria pegado o P1-8 — ele aponta
dependência esquecida, não dependência a mais (depender do objeto `user`
inteiro passa; conferido com um arquivo de prova). Para o P1-8, a proteção
é o `AuthContext` mantendo a referência do usuário.

#### P2-13 · Persistência sem testes — Corrigido
`progress.ts` e `perfil.ts` ganharam 16 testes com um cliente dublado, e o
`StudentDataContext` 6 (histórico incompleto, recarga, compra dupla, recusa do
banco, sessão renovada com o mesmo id, troca de pessoa), todos sabotados.
Seguem sem teste de componente próprio, cobertos pelo E2E: `Novidades`,
`Aparencia`, `EditarPerfil`, `Review`.

#### P2-14 · Dicas rasas — Pendente (conteúdo)
Medido no catálogo: 328 exercícios com 1 dica, 429 com 2, 98 com 3, **33 com
4**. A diretriz (`03-learning-experience.md` §3) pede quatro níveis:
orientação conceitual → específica → parte da solução → solução explicada.
O CI pode cobrar ao menos três para exercícios de produção (código, SQL,
servidor, teste, refatorar).

#### P2-15 · Não há como refazer o que se errou — Pendente
- "Praticar" diz "N exercícios tentados e não resolvidos… siga pela trilha" e
  não leva a eles. A revisão espaçada só conhece flashcards: 67 cartões para
  151 conceitos — **93 conceitos sem cartão**.
- As tentativas não guardam a resposta enviada, então um "Caderno de erros" não
  tem o que mostrar.
- **Solução:** Fase 6 do roadmap — coluna `resposta` (resumo limitado) e
  `feedback` em `exercise_attempts`, fila de revisão por exercício errado com
  prioridade por frequência de erro, tempo e pré-requisitos.

#### P2-16 · Economia se esgota e compete com o nível — Pendente (Loja 2.0)
Ver a seção "Economia". Em resumo: ~175 moedas/semana, todos os cosméticos em
~8 semanas (o catálogo dura ~31), e a maioria dos cosméticos abre por nível
quase ao mesmo tempo em que fica comprável — o Tema Oceano abre por nível
**antes** de caber no saldo.

#### P2-17 · Documentação de arquitetura desatualizada — Parcial
`CONTEXTO.md` e `README.md` atualizados nesta rodada. Falta reescrever
`docs/context/04` e `05` (ver tabela acima).

#### P2-18 · Observabilidade — Pendente
Só `console.error`. Proposta na seção "Observabilidade".

### P3 — baixo

- **P3-1 · Código morto — Parcial.** Removidos: `getPrimaryCodeExercise`, a
  cópia antiga da sequência (`currentStreak`, com os testes portados para
  `calcularSequencia`) e a cópia de `diaLocal`/`somarDias` em `study.ts`. Lista
  do resto na seção "Código morto".
- **P3-2 · Dependências sem uso — Corrigido.** `firebase`, `react-hook-form`,
  `@hookform/resolvers` (nenhum import) e `metadata.json`,
  `firebase-applet-config.json`, `firebase-blueprint.json` (scaffold do AI
  Studio; o último guardava a configuração de um projeto Firebase nunca usado).
- **P3-3 · Dois lockfiles — Pendente.** `bun.lock` e `package-lock.json`
  divergem com o tempo; o CI usa `npm ci`. Confirmar se alguém usa Bun e ficar
  com um.
- **P3-4 · `Lesson.tsx` repetitivo — Corrigido.** Os dez blocos
  `passo.exercise.type === 'x' && <X key … />` viraram `ExercicioDoPasso`, um
  `switch` exaustivo (o compilador recusa um 11º tipo sem componente) com a
  `key` num lugar só; `Lesson.tsx` caiu de 569 para 494 linhas.
- **P3-5 · Alvos de toque de 20 px — Corrigido.** Links "← Perfil", "Ver as
  trilhas", "Todas as trilhas", "Desafios da semana", "Ver as cores na loja" e
  os títulos de trilha em Progresso mediam 20–22 px de altura no celular.
  WCAG 2.2 (2.5.8) pede 24 px para controles isolados. Agora têm, e um E2E
  percorre as dez telas de orientação cobrando isso de todo link e botão fora
  de texto corrido (sabotado, pega).
- **P3-6 · Tamanho de nome e avatar — Corrigido (0009).** `check` de 60
  caracteres e formato do avatar (`preset:` ou `https://`).
- **P3-7 · Login ignorava a rota de origem — Corrigido.** Um link direto para
  uma aula voltava sempre para `/app`; agora volta à rota guardada (só caminhos
  internos).
- **P3-8 · Zod em produção — Corrigido.** A validação do catálogo roda só em
  desenvolvimento e nos testes (o CI já prova o conteúdo), e `schema.ts` é
  marcado sem efeitos colaterais no `vite.config.ts` para o Rollup poder
  deixá-lo — e o Zod — fora do pacote principal.
- **P3-9 · Texto do provedor refletido — Corrigido.** `AuthCallback` mostrava o
  `error_description` da URL (escapado pelo React, então não era XSS, mas
  permitia texto enganoso num link). Agora só frases nossas, por código; o
  detalhe vai ao console. As mensagens do Supabase em inglês também deixaram
  de ser concatenadas na tela do login.
- **P3-10 · Novidades por aparelho — Pendente.** O "já visto" mora no
  `localStorage`; o mesmo aviso reaparece em outro aparelho.
- **P3-11 · Rótulo do XP no perfil — Corrigido.** "Praticante no nível 5"
  embaixo do XP de quem é Iniciante no nível 3 lia como estado atual; agora
  diz "próximo título: Praticante, no nível 5".

---

## Código morto

**Pode remover com segurança** (zero referências fora do arquivo):
- `IconShop` (`ui/Icon.tsx`) — mantido de propósito: o atalho da loja e do
  inventário da Loja 2.0 vai usá-lo
- ~~`LINHAS_DO_PRELUDIO`~~ (`servidor-core.ts`) — removido
- ~~`VERSAO_DO_TYPESCRIPT_NO_NAVEGADOR`~~ (`typescript.ts`) — removido; o
  comentário dizia que a suíte o comparava com o pacote `typescript`, mas o
  teste de versão lê os metadados do Monaco direto
- ~~`getPrimaryCodeExercise`~~, ~~`currentStreak`~~, ~~`firebase`~~,
  ~~`react-hook-form`~~, ~~`@hookform/resolvers`~~, ~~arquivos do AI Studio~~ —
  removidos nesta rodada

**Pode simplificar:**
- `getDefaultTrack` só é usado por teste — o percurso substituiu a trilha padrão
- `lockDownGlobals` duplicado — ~~unificado em `trancar-globais.ts`~~
- `server.ts`: `express.json()` e `/api/health` não servem a nada hoje; a Vercel
  não usa o Express

**Precisa investigar antes de remover:**
- `VinhetaRelogio`, `VinhetaBalao` (`ui/Ilustracao.tsx`) — desenhos prontos sem
  uso; podem servir aos estados vazios novos (Caderno de erros, Inventário)
- `bun.lock`
- a view `user_summary` (0004) — nenhuma tela a lê; útil no SQL Editor
- a view `exercise_performance` (0005) — substituída pela função na 0009, mas o
  cliente ainda a usa como contingência num banco sem a 0009

**Exports usados só em testes** (aceitável, listados para decisão consciente):
`contarLacunas`, `countInteractiveSteps`, `corrigirLinha`, `compose`,
`contrastOfHex`, `extractColorTokens`, `executarPythonNoNode`, `compilarNoNode`,
`abrirBancoNoNode`, `rodarPaginaNoJsdom` (esses quatro são os motores do CI — ok).

## Duplicações

| O quê | Onde | Ação |
| --- | --- | --- |
| Sequência de dias (duas implementações) | `study.ts` × `sequencia.ts` | **Removida** a de `study.ts` |
| `diaLocal` / `somarDias` | `study.ts` × `sequencia.ts` | **Unificado** |
| Bloqueio de globais do worker | `sandbox.worker.ts` × `servidor-banco.worker.ts` | **Unificado** |
| Dez blocos de exercício | `Lesson.tsx` | **Unificado** em `ExercicioDoPasso` |
| Leitura com `useAuth()` + efeito + `ativo` | `Review`, `ProjectWorkspace`, `AdminContent`, `useUserRole`, `Lesson` | Aceitável; se crescer, um `useLeitura(fn, deps)` |
| Mensagem de erro em `<p role="alert" className="rounded-lg border border-danger-200 …">` | `Loja`, `EditarPerfil`, `Aparencia` | Um `Card tone="danger"` já existe — usar |
| Faixa "Perfil ←" + cabeçalho de seção | páginas do perfil | já é `CabecalhoDaSecao` — ok |

Loading, empty state e erro já são componentes (`Skeleton`/`Carregando`,
`EmptyState`, `ErrorState`). Botão e card, idem. Não há abstração prematura a
desfazer.

## Bugs — outros pontos verificados

Verificados sem defeito: conta recém-criada sem linha em `users` (a `concluir`
cria), nível 1 / XP 0 / moedas 0 / sequência 0, progresso vazio, trilha
completa (o banner troca de texto), todas as conquistas (sem divisão por zero
nas barras), cosmético liberado por nível depois de comprado (continua seu; a
compra não é devolvida — a loja avisa "ou de graça no nível N" antes),
virada de dia e de mês, horário de verão (datas locais montadas por partes),
`/lesson/a` → `/lesson/b` (estado ajustado no render), sessão expirada
(`ProtectedRoute` → `/login`, e agora de volta à rota).

Promessas sem tratamento: nenhuma perigosa — os `fetch*` não lançam por
contrato e o sandbox contém rejeições. Botões de ação têm `loading`/`disabled`;
a compra agora também tem trava no contexto e no banco.

## Segurança (OWASP)

| Categoria | Situação |
| --- | --- |
| A01 Controle de acesso | RLS em todas as tabelas, views com `security_invoker`, gatilho contra autopromoção. **Corrigido:** admin lia PII (P0-3), compra sem regra (P1-2), demo sequestrável (P1-1). **Pendente:** P1-10 |
| A02 Criptografia | Nada próprio; Supabase/HTTPS. A URL tem de ser `https://` (validado) |
| A03 Injeção | Sem SQL montado no cliente (PostgREST); `format('%I')` no gatilho de ritmo; markdown sem HTML cru; `new Function` só dentro dos sandboxes |
| A04 Design inseguro | Economia no cliente (mitigada: P1-2) |
| A05 Configuração | Sem cabeçalhos HTTP (P2-7); a chave `service_role` agora é recusada em todos os formatos (P2-8) |
| A06 Componentes vulneráveis | P2-9 (dev) |
| A07 Autenticação | Google OAuth; contas demo com senha pública **de propósito** — agora imutáveis e sem acesso a PII |
| A08 Integridade | Sem CDN de script (Monaco e Pyodide servidos do próprio domínio) |
| A09 Log e monitoramento | Inexistente (P2-18) |
| A10 SSRF | Não há servidor que busque URL |
| Abuso | Ritmo de escrita limitado (P1-9); a compra serializa por pessoa |
| Segredos | Nenhum no repositório (a chave Firebase do scaffold era pública por natureza e saiu); `.env` no `.gitignore` |

## Execução de código

| Motor | Isolamento | Prazo | Rede | Observação |
| --- | --- | --- | --- | --- |
| Sandbox JS | Worker descartável | 3 s depois do `pronto` + 2 s por teste | trancada (**agora na cadeia inteira**) | sem DOM; `postMessage` forjável só engana o próprio aluno |
| Página/React | iframe `sandbox` sem `allow-same-origin`, CSP `default-src 'none'` | prazo na thread principal | CSP + `fetch` dublado | laço infinito pode congelar a aba no celular (P2-6); `allow-modals` permite `alert` em laço (autoinfligido) |
| TypeScript | compilação no worker do Monaco, execução no sandbox JS | idem | idem | — |
| SQL | worker vivo com sql.js | 3 s, worker descartado ao estourar | sem rede | — |
| Servidor/aplicação | sandbox JS ou worker com SQLite | idem | trancada (agora na cadeia) | — |
| Python | worker vivo com Pyodide, dicionário de globais novo por execução | `sys.settrace` com relógio + `terminate()` | **aberta** (P2-5) | memória do intérprete compartilhada entre execuções (aceitável) |

Nada roda no backend. Memória: um laço que aloca sem parar derruba só o worker
(o navegador mata o worker; o prazo cobre).

## Performance

- **Pacote:** P2-1. Números do build: principal 3.512 kB (972 kB gz); Monaco
  3.362 kB (869 kB) sob demanda; worker de TS 7 MB sob demanda; Pyodide
  ~13,5 MB sob demanda. Os pesados já são sob demanda — o problema é o
  principal.
- **Renderização:** P2-2 (derivações), `StudentDataContext` como um valor só.
  Memoização de componente não resolveria: o custo está no cálculo, não na
  árvore.
- **Rede:** cinco leituras em paralelo na entrada (sem cascata); P2-3.
- **Banco:** índices `(user_id, created_at desc)` cobrem as leituras; a
  paginação usa `order by created_at, id` (o `id` desempata). O teto de moedas
  faz um `count distinct` sobre as tentativas da pessoa — barato no índice.
- **Imagens/ícones:** SVG inline, sem bibliotecas; foto reduzida a 256 px no
  navegador antes do envio. Nada a fazer.
- **Fontes:** P2-10 (e `display=swap` já está ligado).

## UX/UI

A identidade está firme: pedra quente, teal, âmbar como "ainda não", tipografia
Plus Jakarta + JetBrains Mono nos rótulos, vinhetas pintadas. Não parece
template. Pontos:

- **Loja:** 14 cartões iguais numa coluna — 3.500 px no celular; nenhuma
  prévia além da figura; nada diz o que é raro ou especial; o saldo fica no
  topo e some na rolagem. Base para a Loja 2.0.
- **Perfil:** limpo, mas raso para quem quer mostrar o que fez — sem conquistas
  em destaque, atividade recente, linguagens estudadas ou projetos entregues.
- **Praticar:** a seção "Exercícios" é informativa e não acionável (P2-15).
- **Estados vazios:** bons em geral ("Nada vencido hoje…" explica por quê). A
  mensagem genérica que restava — "Não foi possível carregar seu progresso" —
  agora diz o que ficou incompleto e oferece recarregar.
- **Erros técnicos crus:** o `AuthCallback` e o `describeAuthError` concatenam a
  mensagem do Supabase ("Não foi possível entrar: <mensagem em inglês>"). Trocar
  por frases por código de erro e mandar o detalhe para o registro.
- **Microinterações:** existem `animar-pousar`, `animar-pop`, confete e o anel
  animado, todos com `prefers-reduced-motion`. Faltam: moeda "voando" para o
  saldo ao comprar, pulso curto no contador de sequência ao estudar no dia,
  aviso de nível com o anel enchendo — todos curtos e com o mesmo respeito ao
  movimento reduzido.

## Responsividade (medida)

13 telas (início, trilhas, trilha, praticar, perfil e suas 5 páginas, aula,
revisão, projeto) em 320, 360, 375, 390, 430, 768, 1024, 1366 e 1920 px:
**nenhuma rolagem horizontal, nenhum elemento fora da viewport** (o único
"fora" é a região ARIA do Monaco, fora da tela de propósito). O editor tem
altura fixa no celular (armadilha já paga). O que achar: alvos de 20 px (P3-5)
e a loja longa demais no celular.

## Acessibilidade

Pontos fortes: foco visível global, link de pular, ordem de tabulação testada,
contraste testado token a token nas oito variantes, estado nunca só por cor,
arrastar com alternativa por setas no "ordenar", `aria-live` no contador da
aula. Corrigidos: `<h1>` em quatro telas. Pendentes: P3-5; o `radio` de 13 px
da Aparência (o rótulo em volta é o alvo, então passa, mas o círculo sozinho
não); e todo exercício novo (Caderno de erros, Revisar) nascendo com o mesmo
contrato de teclado.

## Testes

- **Qualidade:** alta. Testes de comportamento, não de implementação; o método
  de sabotagem está documentado e é seguido; contagens lidas do catálogo.
- **Frágeis:** os de navegador que dependem de rede externa (fontes) e os que
  rodam enquanto o Vite recarrega (edite, espere, rode).
- **Redundantes:** a antiga `currentStreak` testava a mesma regra que
  `calcularSequencia` — portados e unificados.
- **Fluxos sem cobertura antes desta rodada:** persistência inteira (agora 16
  testes), retomada de aula e falha de gravação (3), exploit do dobro (2), desafio reancorado (1),
  catálogo do banco × código e teto × economia (4), bloqueio de rede (4), chave
  `service_role` (3), rota de retorno do login (2), loja com histórico
  incompleto (E2E). **Ainda sem:** `StudentDataContext` isolado, a função
  `comprar_item` num Postgres de verdade (ver CI).

## CI/CD

`typecheck → testes (+ conteúdo em UTC+14) → build`, depois E2E no Chromium,
a cada push no `main` e em pull requests, com cancelamento de execuções
obsoletas e anotações legíveis sem login.

**O CI do `main` estava vermelho desde 2026-09-25** (três pushes seguidos): o
teste "a visão geral é o percurso em etapas" procurava cada trilha por
`hasText`, que casa por pedaço e sem distinguir maiúsculas — "ORM" achava
também "plataforma" e "informação". Corrigido nesta rodada (nome exato). Os
outros dois vermelhos que aparecem ao rodar o E2E neste contêiner não são do
produto: o do console é o certificado do Google Fonts através do proxy
(P2-10), e o de "foco atrás das barras fixas" só falha no Chromium antigo
daqui — no CI, com o Chromium do Playwright, passa.

Falta:
- **lint** (P2-12);
- ~~**migrações num Postgres de verdade**~~ — feito depois do relatório: job
  `banco` com `postgres:16` de serviço (`supabase/verificacao/`), migrações
  aplicadas duas vezes e verificação de comportamento com os papéis da API;
- **orçamento de pacote**: falhar o build se o chunk principal crescer mais que
  X% (evita P2-1 voltar).

## Observabilidade (proposta leve)

Sem dependência nova:
1. `lib/registro.ts` com `registrar(evento, dados)` — lista branca de campos
   (tipo do erro, rota, id do exercício, motor, duração, código do Postgres),
   **nunca** e-mail, token, código do aluno ou texto livre.
2. Tabela `eventos` (0010) com `insert` para `authenticated` e ritmo limitado,
   sem `select` para ninguém além de uma função de admin agregada.
3. Ganchos: `ErrorBoundary`, `window.onerror`/`unhandledrejection`, falhas de
   `progress.ts`/`perfil.ts` (já centralizadas), estouro de prazo e falha de
   carga dos motores (`sandbox.ts`, `sql.ts`, `python.ts`), consultas lentas
   (> 2 s) medidas no cliente.
4. Painel de admin ganha "saúde": erros por tipo e por dia, motores que mais
   estouram prazo, exercícios que mais falham por erro de plataforma (não de
   resposta).

## Experiência pedagógica

- **Ordem das trilhas:** boa depois da auditoria de currículo de 09-24 (Git cedo,
  Testes antes do capstone). Estruturas de Dados com 4 aulas e ORM com 3 são
  finas perto do resto.
- **Tipos de exercício:** 260 de múltipla escolha (29%) — reconhecimento, não
  produção. Ok como aquecimento; a meta de "aula com ao menos um de prática de
  dev" já existe e vale estender para "no máximo 1/3 de múltipla escolha".
- **Dicas:** P2-14.
- **Feedback:** forte — a correção explica por comportamento; o "encontrar o
  bug" pergunta uma coisa só. As mensagens de erro de cada motor são traduzidas
  para frases que ensinam.
- **Repetição e revisão:** P2-15. O domínio por conceito já existe em quatro
  níveis (não iniciado, conhecendo, praticando, dominando), com a evidência à
  vista — é a forma certa de evitar falsa precisão. Falta o tempo: "dominando"
  hoje é para sempre; a evidência deveria envelhecer e uma revisão acertada
  depois de N dias confirmar o domínio.
- **Projetos:** 10, com critérios de aceitação executáveis; os capstones são
  o ponto alto. Faltam projetos intermediários para as trilhas de TypeScript e
  React.

## Gamificação

- **XP:** bem desenhado contra farm (exercício distinto, sem bônus de
  velocidade, bônus de persistência). O furo era P1-5 — fechado.
- **Níveis:** sem teto; o catálogo inteiro rende ~34 mil XP → nível 21.
- **Sequência:** "hoje ou ontem" e congelamento consumido sozinho — gentil.
- **Desafios:** 2 diários de 5 e 2 semanais de 6, determinísticos. Bom
  para "missões"; faltam os de debugging e de revisão de erros.
- **Conquistas:** 67 em cinco categorias, sem níveis (bronze → platina) e sem
  recompensa além do aviso. "Coruja" (meia-noite às cinco) premia estudar de
  madrugada — vale trocar por algo que não incentive perder sono.
- **Novidades:** bom desenho (compara estado derivado com o visto); P3-10.

## Economia (medida com o catálogo real)

Aluno-modelo: 5 aulas por semana, tudo de primeira e sem dica, 1 dos 2 desafios
do dia e 1 dos 2 da semana.

| | Valor |
| --- | --- |
| XP médio por aula | 223 |
| Por semana | ~1.365 XP, **175 moedas** |
| Todos os cosméticos (1.450 moedas) | **8,3 semanas** |
| Catálogo inteiro (154 aulas) | ~31 semanas |

| Item | Preço | Cabe no saldo em | Abre por nível em |
| --- | ---: | --- | --- |
| Tema Oceano | 120 | 0,7 semana | **0,3 semana** (nível 3) |
| Tema Brasa | 150 | 0,9 | 1,1 (nível 5) |
| Avatar Cometa | 90 | 0,5 | 0,7 (nível 4) |
| Avatar Alien | 150 | 0,9 | 11,5 (nível 15) |

Leitura:
1. **O Tema Oceano abre por nível antes de caber no saldo** — comprá-lo é
   sempre desperdício. Vários outros abrem por nível poucos dias depois.
2. **Da 9ª semana em diante as moedas não têm destino** além de 60/80 em
   consumíveis. Inflação: o saldo só cresce.
3. **Nenhum item é impossível ou caro demais**; nenhum é aspiracional.
4. Não há *grind*: as moedas saem de aulas e metas distintas, não de repetição.
   Isso está certo e deve ficar.

Direção para a Loja 2.0: separar **como se obtém** (moedas, nível, conquista,
trilha) em vez de tudo ser "moeda ou nível"; itens por conquista fora da
compra; preços em faixas por raridade (comum ~1 semana, lendário ~6 semanas) e
catálogo que cresça com o conteúdo; consumíveis sem *pay-to-win*.

## Loja

Hoje: três grupos (consumíveis, cores, avatares), cartão com figura, confirmação
em linha, sem prévia, sem inventário, sem histórico, sem raridade, sem itens
exclusivos de conquista, catálogo fixo no código. A fundação no servidor
(`store_items` com janela de disponibilidade e `comprar_item`) entrou nesta
rodada. O desenho completo da Loja 2.0 está no roadmap (Fase 8).

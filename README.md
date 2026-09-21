# CodeFlow

Plataforma de ensino de programação em português, do zero até uma aplicação
completa — e até o projeto que outra pessoa consegue manter. Aulas curtas em
passos, código do aluno rodando **dentro do navegador** — JavaScript,
TypeScript, React, HTML/CSS, SQL e Node — e correção que explica o porquê do
erro, não apenas se acertou.

> Você não aprende a programar lendo. Aprende resolvendo.

## O que tem hoje

**10 trilhas, 112 aulas, 660 exercícios em 10 tipos, 7 projetos, 108 conceitos.**
Tudo é contado do catálogo; a página pública mostra os mesmos números.

| Etapa | Trilha | Linguagem | Aulas | Exercícios |
| --- | --- | --- | ---: | ---: |
| 1 · A base | Fundamentos de JavaScript | JavaScript | 20 | 115 |
| 1 · A base | Lógica e Resolução de Problemas | JavaScript | 3 | 19 |
| 2 · A web | Como a Web Funciona | JavaScript | 8 | 40 |
| 2 · A web | A Página (HTML, CSS, DOM) | HTML | 26 | 156 |
| 3 · As ferramentas do trabalho | TypeScript | TypeScript | 10 | 59 |
| 3 · As ferramentas do trabalho | React | React (TSX) | 14 | 84 |
| 3 · As ferramentas do trabalho | SQL e Bancos de Dados | SQL | 10 | 59 |
| 4 · A aplicação inteira | Node e APIs | Node | 10 | 64 |
| 5 · O ofício | Engenharia: Organizar um Projeto | Node | 8 | 48 |
| 6 · O projeto final | Projeto Final: A Aplicação Inteira | Node + SQL | 3 de 5 | 16 |

**Os dez tipos de exercício**: escrever o código (126), múltipla escolha (170),
prever a saída (71), completar a lacuna (86), ordenar os passos (52),
encontrar o bug (49), escrever o teste (6), refatorar (13), consulta SQL (46)
e servidor (41). Toda aula tem ao menos um dos quatro "de prática de dev" —
bug, ordenar, teste, refatorar — que pedem o conceito de outro ângulo.

**Os sete motores de execução**, todos no navegador, nenhum servidor no meio:

| Motor | O que roda | Como |
| --- | --- | --- |
| Sandbox | JavaScript puro | Web Worker descartável, 3 s de limite, sem rede |
| Página | HTML, CSS, DOM | `<iframe sandbox>` de origem opaca; os testes veem o `document` |
| TypeScript | TypeScript | o compilador (o mesmo do editor) na frente do sandbox; os erros de tipo viram retorno |
| React | componentes TSX | compilado e montado no iframe da página, com o React embutido |
| SQL | consultas e modelagem | o SQLite em WebAssembly (sql.js) num worker que fica vivo; a correção compara **linhas devolvidas** |
| Servidor | Node e Express, e projetos de vários arquivos | um Node de mentira no sandbox: `require` (do Express pequeno e dos arquivos que o exercício fornece, resolvido como no Node — `../`, pasta com `index.js`), `process.env`, e um cliente HTTP para os testes; a tela mostra pedidos e respostas, e onde o arquivo do aluno mora |
| Servidor com banco | a API sobre o SQLite | o mesmo sandbox com o SQLite do motor de SQL carregado no mesmo worker: `require('./banco')` dá `consultar` e `executar` com parâmetros, assíncronos; a tela mostra o SQL do banco antes e as tabelas depois |

**O que acompanha o aluno**: percurso em etapas com o ponto atual, revisão
espaçada (Leitner), XP e níveis sem teto, sequência de dias com congelamento,
moedas e loja (dobro de XP, temas, avatares), desafios do dia e da semana,
30 conquistas, perfil com nome e foto, modo escuro e quatro cores de destaque,
avisos de novidade ao voltar — tudo **derivado do histórico**, nada é contador.

## Rodando o projeto

Requer Node 22.

```bash
npm ci
cp .env.example .env   # preencha as duas variáveis, veja abaixo
npm run dev            # http://localhost:3000
```

### Variáveis de ambiente

As duas são obrigatórias e ficam no `.env` da raiz. Sem elas a aplicação não
quebra: ela sobe e mostra uma instrução na tela de login.

| Variável | Onde encontrar |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase › Project Settings › Data API › Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase › Project Settings › API Keys › chave **publishable** (ou a `anon` legada) |

A chave publishable começa com `sb_publishable_`; a legada é um JWT de três
blocos. A aplicação recusa explicitamente uma chave `sb_secret_` ou
`service_role`: ela iria parar no pacote servido ao navegador, onde qualquer
visitante a leria, e ignora as políticas de RLS.

### Banco de dados

As migrações estão em `supabase/migrations/` e são aplicadas em ordem, coladas
no SQL Editor do Supabase. Todas são idempotentes.

| Arquivo | O que cria |
| --- | --- |
| `0001_users_progress.sql` | Tabela `users` com aulas e projetos concluídos |
| `0002_exercise_attempts.sql` | Histórico de tentativas, base de quase tudo |
| `0003_flashcard_reviews.sql` | Histórico de revisões espaçadas |
| `0004_user_summary.sql` | View de resumo por aluno |
| `0005_admin.sql` | Papel de administrador e view de desempenho |
| `0006_promote_admin.sql` | Conserta o gatilho que impedia promover alguém a administrador |
| `0007_perfil_e_loja.sql` | Perfil editável (nome, avatar, tema), a tabela `purchases` da loja e o bucket `avatars` do Storage para a foto |

Sem a 0007, o aplicativo carrega, mas editar o perfil, comprar na loja e
enviar foto falham — e a própria tela diz qual migração rodar.

Para se tornar administrador depois de entrar pela primeira vez:

```sql
update public.users set role = 'admin' where email = 'SEU-EMAIL';
```

O login é Google OAuth pelo Supabase. Em Authentication › URL Configuration,
adicione a origem da aplicação (`http://localhost:3000` em desenvolvimento) às
Redirect URLs.

## Testes

```bash
npm run typecheck   # tipos, incluindo os testes de navegador
npm test            # 2.746 testes de unidade, propriedade e componente (Vitest)
npm run test:e2e    # 352 testes de navegador (Playwright, Chromium, celular e desktop)
```

O E2E precisa do Chromium uma vez: `npx playwright install chromium`.

As duas suítes cobrem coisas diferentes de propósito. O Vitest usa jsdom, que
não tem layout nem CSS — ele verifica lógica, semântica e ordem de tabulação.
O Playwright roda num navegador de verdade e cobre o que só existe lá: barra
fixa cobrindo o elemento focado, o editor de código conseguindo se dimensionar,
o `:focus` de fato casando, a preferência de menos movimento, o confete, e
cada motor rodando o código do aluno num Chromium real.

O conteúdo também é testado: para **cada** exercício, o CI roda a solução de
referência no mesmo motor que o aluno usa (o sandbox no Node, o jsdom para a
página, o compilador para TypeScript, o sql.js para SQL, o servidor simulado
para Node) e cobra que ela passe, que o código inicial não passe, e que toda
mensagem de falha oriente. Um exercício de "encontrar o bug" precisa de fato
quebrar como está e parar de quebrar com a linha corrigida.

O CI (`.github/workflows/ci.yml`) roda tipos, testes, build e depois o E2E, a
cada push e pull request.

## Decisões que valem conhecer antes de mexer

**O conteúdo é código, não linhas no banco.** Aulas, exercícios e projetos
vivem em módulos TypeScript sob `src/content/`, validados por Zod no
carregamento. Um exercício malformado quebra na hora, e o CI prova que cada um
é resolvível. A tela de administração gera o módulo para revisão em pull
request, em vez de escrever no banco.

**O código do aluno roda no navegador, isolado.** Num Web Worker descartável
(com `fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts`, `indexedDB`,
`caches` e `Notification` apagados antes de qualquer coisa executar), num
`<iframe sandbox>` de origem opaca, ou num worker com o SQLite. A lógica de
execução fica em módulos puros (`sandbox-core.ts`, `pagina-core.ts`,
`sql-core.ts`, `servidor-core.ts`), sem dependência de navegador, para os
testes exercitarem exatamente o mesmo código que roda em produção.

**Quase nada é contador.** XP, nível, moedas, sequência, desafios cumpridos,
conquistas, domínio por conceito e cartões vencidos são derivados do histórico
de tentativas, revisões e compras, que é append-only. Um contador
desnormalizado é uma segunda fonte de verdade que começa a divergir no
primeiro erro de escrita.

**A correção julga comportamento, nunca texto.** Qualquer implementação que
funcione passa — com `for`, `reduce` ou recursão; com qualquer SQL que devolva
as mesmas linhas; com qualquer servidor que responda o esperado. Testes por
propriedade sorteiam dezenas de entradas para ninguém passar decorando o caso.

**Dificuldade não vira parede; mas o exercício pede uma resposta.** Trilha e
aula nunca trancam. Dentro da aula, um exercício sem resposta verificada não
deixa avançar; qualquer resposta libera, certa ou errada.

**Sem banco de imagens, sem Lucide, sem emoji.** Ícones, vinhetas, avatares,
emblemas de trilha e as cenas animadas são SVG desenhados no projeto, numa
paleta só. O movimento tem motivo e respeita `prefers-reduced-motion`.

**Português em tudo**: código, comentários, commits, interface, documentação.

## Estrutura

```
src/content/        Aulas, exercícios, projetos, conceitos, percurso + schema Zod
  lessons/          Uma aula por arquivo (js-, logica-, web-, pagina-, ts-, react-, sql-, node-, eng-, proj-)
  tracks/           As trilhas e a ordem das aulas
  bancos/           Os bancos de exemplo do SQL e do projeto final
src/client/lib/     Lógica derivada e os motores: sandbox, página, TypeScript,
                    React, SQL, servidor; domínio, revisão, XP, economia, desafios
src/client/         Telas, componentes, contextos, ícones e cenas
e2e/                Testes de navegador (Playwright); fixtures.ts dubla o Supabase
supabase/           Migrações SQL
docs/               CONTEXTO.md (o mapa do projeto), curriculo.md (o roadmap),
                    PROMPT-CONTINUACAO.md (para retomar o trabalho)
```

## Para onde vai

O roadmap completo, com o estado de cada aula e o custo de cada motor, está em
[`docs/curriculo.md`](docs/curriculo.md). Em resumo, na ordem:

1. **O resto da Fase 5** — **Testes e qualidade**, **Git e equipe** e
   **Terminal**, ao lado da trilha de engenharia que já existe.
2. **Python** — a primeira linguagem nova, com o Pyodide (Fase 6).
3. **Projeto final** — do zero a uma aplicação completa: página + API + banco,
   com testes e publicação (Fase 7).
4. **Mais linguagens**, uma por vez, cada uma com o motor que a roda no
   navegador.

O projeto final já começou: o banco e a API (aulas 1 a 3) estão no ar; a
página que chama a API e o fechamento vêm em seguida.

## Licença

Ainda não definida. Até lá, o código é do autor.

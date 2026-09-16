# CodeFlow

Plataforma de ensino de programação em português. Aulas curtas em passos, código
do aluno rodando no navegador, e correção que explica o porquê do erro — não
apenas se acertou.

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

As migrações estão em `supabase/migrations/` e são aplicadas em ordem, coladas no
SQL Editor do Supabase:

| Arquivo | O que cria |
| --- | --- |
| `0001_users_progress.sql` | Tabela `users` com aulas e projetos concluídos |
| `0002_exercise_attempts.sql` | Histórico de tentativas, base de quase tudo |
| `0003_flashcard_reviews.sql` | Histórico de revisões espaçadas |
| `0004_user_summary.sql` | View de resumo por aluno |
| `0005_admin.sql` | Papel de administrador e view de desempenho |
| `0006_promote_admin.sql` | Conserta o gatilho que impedia promover alguém a administrador |
| `0007_perfil_e_loja.sql` | Perfil editável (nome, avatar, tema), a tabela `purchases` da loja e o bucket `avatars` do Storage para a foto |

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
npm test            # 337 testes de unidade e componente (Vitest)
npm run test:e2e    # 62 testes de navegador (Playwright, Chromium)
```

O E2E precisa do Chromium uma vez: `npx playwright install chromium`.

As duas suítes cobrem coisas diferentes de propósito. O Vitest usa jsdom, que não
tem layout nem CSS — ele verifica lógica, semântica e ordem de tabulação. O
Playwright roda num navegador de verdade e cobre o que só existe lá: barra fixa
cobrindo o elemento focado, o editor de código conseguindo se dimensionar, o
`:focus` de fato casando, e a preferência de menos movimento do sistema.

O CI roda tipos, testes, build e depois o E2E, a cada push e pull request.

## Decisões que valem conhecer antes de mexer

**O conteúdo é código, não linhas no banco.** Aulas, exercícios e projetos vivem
em módulos TypeScript sob `src/content/`, validados por Zod no carregamento. Um
exercício malformado quebra na hora, e o CI prova que cada exercício de código é
resolvível rodando a solução de referência no sandbox de verdade. Um formulário
que gravasse conteúdo direto no banco jogaria fora essas três garantias em troca
de conveniência — por isso a tela de administração gera o módulo para revisão em
pull request, em vez de escrever no banco.

**O código do aluno roda num Web Worker descartável**, com limite de 3 segundos e
`terminate()` no fim. `fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts`,
`indexedDB`, `caches` e `Notification` são apagados antes de qualquer coisa do
aluno executar. A lógica de execução fica em `sandbox-core.ts`, sem dependência de
navegador, para os testes exercitarem exatamente o mesmo código que roda em
produção.

**Quase nada é contador.** XP, nível, sequência de estudos, domínio por conceito e
cartões vencidos são todos derivados do histórico de tentativas e revisões, que é
append-only. Um contador desnormalizado é uma segunda fonte de verdade que
começa a divergir no primeiro erro de escrita.

**O avanço nunca é bloqueado.** O caminho da trilha avisa quando um pré-requisito
está fraco, mas não tranca a porta: transformar dificuldade em parede é o oposto
do que a plataforma existe para fazer.

## O que ainda não está pronto

- **O editor de código vem de um CDN externo** (`cdn.jsdelivr.net`) em tempo de
  execução. Rede que bloqueie CDN deixa o aluno sem onde escrever, e não funciona
  offline. Servir do próprio domínio exige carga sob demanda para não engordar o
  pacote inicial.
- **Não há tutor com IA.** A rota existia e foi removida enquanto a integração não
  está disponível — um botão que não faz nada é pior do que sua ausência.
- **Nada foi conferido num telefone real.** O E2E emula a viewport de um Pixel 7,
  o que pega estouro de largura e alvos de toque pequenos, mas não substitui o
  aparelho.

## Estrutura

```
src/content/     Aulas, exercícios, projetos e conceitos + schema Zod
src/client/lib/  Lógica derivada: domínio, revisão, XP, caminho, sandbox
src/client/      Telas, componentes e contextos
e2e/             Testes de navegador (Playwright)
supabase/        Migrações SQL
docs/context/    Visão de produto, design, pedagogia, arquitetura, roadmap
```

Hoje: 7 trilhas, 91 aulas, 532 exercícios em 9 tipos (78 deles de página, num
iframe isolado; 59 de TypeScript, com o compilador na frente do sandbox; 84 de
React, com o componente montado no mesmo iframe; 43 de SQL, num SQLite de
verdade dentro de um worker), 7 projetos com 22 critérios de aceitação, e 87
conceitos.

# CONTEXTO — CodeFlow

Documento de retomada. Escrito para alguém — ou alguma sessão — que não viu nada
do que veio antes e precisa continuar sem redescobrir tudo.

Atualizado em 2026-09-09. **Mantenha-o atualizado no mesmo commit que muda o que
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
| Trilhas | 2 — Fundamentos de JavaScript (20 aulas), Lógica (3) |
| Aulas | 23, somando 422 minutos |
| Exercícios | 56 — 23 de código, 18 de prever saída, 11 de lacuna, 4 de múltipla escolha |
| Verificação | 135 casos fixos + 23 propriedades |
| Projetos | 7, com 22 critérios de aceitação |
| Conceitos | 21, com grafo de pré-requisitos |
| Flashcards | 22 |
| Testes | 484 de unidade + 110 de navegador |
| Pacote | 949 kB (276 kB comprimido) |

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
  content.test.ts       Integridade: 144 checagens sobre o catálogo
  lessons/              Uma aula por arquivo
  tracks/               A ORDEM da trilha vive aqui, não nos arquivos de aula

src/client/lib/         Lógica pura e testada
  sandbox-core.ts       Monta e roda o programa do aluno. ASSÍNCRONO.
  sandbox.worker.ts     Worker: bloqueia rede e chama o core
  sandbox.ts            executeCode(), com timeout de 3s
  fill-blank.ts         Molde com lacunas: dividir, preencher, validar
  mastery.ts            Domínio por conceito, em 4 níveis
  review.ts             Repetição espaçada, Leitner [1,3,7,14,30,60] dias
  gamification.ts       XP, níveis, conquistas
  path.ts               Caminho da trilha; nunca bloqueia, só avisa
  study.ts              Sequência, retomada, exercícios abandonados
  celebrar.ts           Confete que respeita prefers-reduced-motion

src/client/pages/       Telas
src/client/components/  Componentes
e2e/                    Playwright; `fixtures.ts` tem o dublê do Supabase
supabase/migrations/    0001 a 0006, aplicadas em ordem
docs/curriculo.md       Roadmap de conteúdo — fonte canônica
```

## 6. Como verificar

```bash
npm run typecheck   # inclui e2e/ e playwright.config.ts
npm test            # 484 testes
npm run test:e2e    # 110 no navegador (antes: npx playwright install chromium)
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
- **O Write herda a codificação do arquivo que substitui.** Um README em UTF-16
  produziu acentos corrompidos. Apague antes de reescrever.

## 8. O que falta

### Bloqueios técnicos

- **Monaco vem de `cdn.jsdelivr.net` em tempo de execução** — cerca de 15
  arquivos por aluno. Rede que bloqueia CDN deixa o aluno sem editor, e não
  funciona offline. Servir do próprio domínio exige carga sob demanda, senão o
  pacote inicial estoura.
- **`import`/`export` é erro de sintaxe no sandbox** — `new Function` não aceita
  módulos. A aula de módulos terá que ser conceitual, ou esperar outro executor.
- **Nada publicado.** Existe `vercel.json` com as rewrites de SPA, mas nenhum
  deploy. Ao publicar, definir `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no
  painel da Vercel.
- **Nada testado em telefone real.** O E2E emula um Pixel 7.
- **Sem tutor com IA.** A rota foi removida enquanto a integração não existe.

### Roadmap

O mapa completo está em `docs/curriculo.md`: 8 fases, 135 aulas previstas, ~700
exercícios, 6 motores de execução. A ordem das fases é imposta pelos motores, não
por preferência de assunto.

**Fase 0 — completa.** Fundamentos e lógica, 13 aulas.

**Fase 1 — em andamento.** Aprofundar o que já roda, sem motor novo.

| Item | Estado |
| --- | --- |
| Bloco *JavaScript real* | **10 de 10, concluído** — escopo, closures, callbacks, promises, async/await, falhas assíncronas, JSON, imutabilidade, datas, expressões regulares |
| Bloco *Como a web funciona* | **0 de 8** — HTTP, REST, autenticação, CORS, segurança |
| Testes por propriedade | **feito** |
| Exercício de lacuna | **feito** |
| Outros tipos de exercício | encontrar o bug, ordenar passos, refatorar, escrever o teste |
| Publicar | **não feito** |
| Monaco do próprio domínio | **não feito** |

**Fases 2 a 7 — não iniciadas.** Cada uma depende de um motor: iframe isolado
(DOM, CSS, UI), transpilador (TypeScript), React, servidor simulado (Node),
sql.js (SQL), Pyodide (Python).

## 9. Pendências do lado do usuário

- Rodar `supabase/migrations/0006_promote_admin.sql` no SQL Editor, se ainda não
  rodou. Ela conserta o gatilho que impedia promover alguém a administrador.
- Para virar administrador: `select public.set_user_role('SEU-EMAIL', 'admin');`
- Conferir o aplicativo num telefone de verdade.

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

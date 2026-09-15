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
- Repositório `EduuGah/CodeFlow`, trabalho direto no `main`, push autorizado, CI
  obrigatório a cada push

## 4. O que JÁ FOI FEITO

### Conteúdo

| | |
| --- | --- |
| Trilhas | 5 — Fundamentos de JavaScript (20 aulas), Lógica (3), Como a Web Funciona (8), A Página (26), TypeScript (10) |
| Aulas | 67, somando 1.826 minutos |
| Exercícios | 389, em 8 tipos; 78 são de página (`runtime: 'iframe'`) e 16 têm trechos de tipo (`typeTests`) |
| Verificação | 600 casos fixos + 58 testes por propriedade |
| Projetos | 7, com 22 critérios de aceitação |
| Conceitos | 63, com grafo de pré-requisitos |
| Flashcards | 22 |
| Testes | 1.618 de unidade + 214 de navegador |

Todas as 67 aulas publicadas estão no padrão de profundidade: 300 a 900 palavras
e de 4 a 7 exercícios em dificuldade crescente, ao menos um deles de prática de
dev. Nenhuma está pendente de aprofundamento.

### Os 8 tipos de exercício

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
7. **encontrar o bug** — aponta a linha do defeito. Declara também a linha do
   **sintoma**, que recebe um retorno próprio: "é onde o erro aparece, não onde
   ele nasce"
8. **refatorar** — código que já passa nos testes, e precisa continuar passando
   depois de cumprir restrições sobre a forma

### Plataforma

Autenticação com Google, progresso derivado de histórico append-only, revisão
espaçada (Leitner), XP e níveis derivados, painel inicial que responde "onde
estou / o que faço agora / como estou evoluindo", área de administração que
**gera módulos TypeScript** para revisão em PR em vez de escrever no banco,
sandbox descartável com bloqueio de rede, testes por propriedade com sementes e
sondas de borda, CI com anotações legíveis, E2E em celular e desktop.

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

## 5. O que ESTÁ SENDO FEITO agora

**Fase 3 no meio.** O último commit fecha o bloco de TypeScript — o motor
(compilador na frente do sandbox) e as 10 aulas da trilha —, o CI está verde,
e a árvore está limpa. Você começa num ponto estável.

O que falta da fase: as **14 aulas de React**, que dependem do motor 3 (React
e JSX dentro do iframe do motor de página). O transpilador já existe — o
worker de TypeScript emite JSX com `jsx: 'react'` —; falta embutir o React
no documento do iframe, decidir como os testes enxergam o componente
renderizado, e escrever as aulas.

## 6. O que VAI SER FEITO — e a decisão que precisa ser tomada

O projeto está em **~50%**. A porcentagem por aula (67 de 135, 50%) bate com
o resto: 3 dos 7 motores prontos, e o quarto (React) é o próximo.

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

### C) Mais projetos com o motor atual — barato, sem currículo novo

Existem 7 projetos e o roadmap prevê ~30. Eles usam a mecânica que já existe e
dão prática aplicada. É o caminho de menor risco e menor retorno.

### Recomendação

A, B e B2 estão feitos. O que vem agora é o **motor 3: React no iframe** — e
as 14 aulas de React que fecham a Fase 3 — ou C. Antes de qualquer um, vale o
que só o dono do projeto pode fazer: usar o aplicativo publicado num telefone
de verdade, inclusive uma aula de TypeScript.

Se o dono do projeto não indicar o caminho, pergunte antes de começar o motor
3 ou C — são investimentos grandes o bastante para a escolha ser dele.

## 7. Como trabalhar

### Verificação obrigatória antes de dizer que terminou

```bash
npm run typecheck   # inclui e2e/ e playwright.config.ts
npm test            # 1.618 testes
npm run test:e2e    # 214 no navegador (antes: npx playwright install chromium)
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

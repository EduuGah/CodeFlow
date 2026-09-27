# Arquitetura, Engenharia e Segurança

> Reescrito em 2026-09-27 para descrever o que existe (P2-17 da auditoria).
> A primeira versão descrevia o plano de antes da construção — Express com
> banco próprio, ORM, execução de Python em contêineres — e mandava quem a
> lesse tomar decisões para um sistema que não existe. Os princípios ficaram;
> os fatos mudaram. O detalhe vivo está em `docs/CONTEXTO.md`.

## 1. Stack

- **Frontend:** React 18, Vite 5, TypeScript, Tailwind v4 com tokens próprios
  em `@theme` (nada de template). Monaco como editor, servido do próprio
  domínio, sob demanda.
- **Backend:** não há servidor de aplicação. O Express só serve os arquivos
  estáticos (e em produção é a Vercel). Toda regra que precisa de autoridade
  mora no banco.
- **Banco e autenticação:** Supabase — Postgres com RLS em todas as tabelas,
  funções `security definer` para o que precisa de regra, autenticação Google
  (e senha só nas contas de demonstração). Migrações numeradas em
  `supabase/migrations/`, idempotentes, coladas no SQL Editor.
- **RBAC:** `users.role` (`student`/`admin`), trocado só por função de banco;
  o gatilho impede a autopromoção.

## 2. Regras de arquitetura e código

- **Conteúdo é código.** Aulas, exercícios, projetos e o catálogo da loja
  vivem em módulos TypeScript (`src/content/`, `src/client/lib/economia.ts`),
  validados por Zod em desenvolvimento e provados no CI — a solução de
  referência passa, o esqueleto não. As telas de administração **geram** o
  código para revisão em pull request; não escrevem no banco.
- **Quase nada é contador.** XP, nível, sequência, moedas, desafios, domínio
  e revisão são derivados do histórico append-only (`exercise_attempts`,
  `flashcard_reviews`, `purchases`). Não há saldo guardado para dessincronizar.
- **Organização:** `src/client/lib` (lógica pura, testada sem navegador),
  `components` (por domínio: `lesson`, `perfil`, `ui`…), `pages`, `contexts`.
  Cada motor tem uma parte pura (`*-core.ts`) separada da parte que toca o
  navegador.
- **Qualidade:** componentes pequenos, sem `any` para calar o TypeScript, sem
  `try/catch` vazio, ESLint no CI, e erro sempre dito à pessoa com o que fazer.

## 3. Execução segura de código

*Crítico, e continua valendo:* o código do aluno nunca roda num servidor.

Tudo roda **no navegador de quem estuda**, isolado da página:

- JavaScript num **Web Worker** sem acesso ao DOM nem à sessão, com a rede
  bloqueada na cadeia de protótipos, e tempo máximo (`EXECUTION_TIMEOUT_MS`,
  3 s) — o worker é destruído, não "avisado".
- TypeScript compilado pelo serviço do Monaco numa instância própria, e o
  JavaScript gerado vai para o mesmo worker.
- Página (HTML, CSS, DOM) e React num **iframe `sandbox`** sem
  `allow-same-origin`, com guarda de laço sem fim em cada laço dos scripts do
  aluno (`protecao-de-laco.ts`, 1,5 s).
- SQL no **sql.js** (SQLite em WebAssembly) num worker próprio; Node e APIs
  num prelúdio que imita o Node dentro do worker, com ou sem o SQLite ao lado.
- Python no **Pyodide**, num worker, com a rede trancada depois da carga.

"Linguagens futuras em contêiner" deixou de ser o plano: rodar no navegador
não custa servidor, não tem fila e não expõe infraestrutura. Rodar de novo o
código do aluno num servidor só se justificaria se um dia houvesse
competição ou certificado.

## 4. Segurança da plataforma

- **Não confiar no cliente para o que tem valor.** A compra é a função
  `comprar_item` (preço do catálogo do banco, uma de cada vez, cosmético único,
  gasto abaixo de um teto que o histórico permite); a conclusão de aula é
  `concluir`, atômica; a escrita tem limite de ritmo e formato conferido.
- **Autorização:** cada pessoa lê e escreve só o que é dela (RLS). O admin
  vê agregados, nunca e-mail, nome ou tentativas de outra pessoa. As contas de
  demonstração têm senha e e-mail imutáveis, não sobem foto nem guardam texto
  livre, e a conta admin de demonstração não mexe na loja.
- **O que ainda é autoridade do navegador:** a correção. Quem tem a própria
  sessão consegue gravar um acerto que não fez — hoje só sobre a própria
  conta, sem ranking nem prêmio real (P1-10 da auditoria, aberto).
- **Frontend:** nada de `dangerouslySetInnerHTML`; o Markdown das aulas passa
  pelo `react-markdown` sem HTML cru. Cabeçalhos em `vercel.json` (nosniff,
  referrer, permissions); a CSP da aplicação está pendente (P2-7).
- **Dados:** mínimo necessário, nada de senha, token, código do aluno ou
  mensagem de erro no registro de eventos.

## 5. Testes e observabilidade

- **Camadas:** Vitest para lógica e componentes; Playwright para os fluxos no
  navegador (celular e desktop, com um dublê do Supabase); e as migrações
  aplicadas duas vezes num Postgres de verdade, com verificações de
  comportamento nos papéis da API (`supabase/verificacao/`).
- **Testes pedagógicos:** todo exercício de código tem solução de referência
  que o CI roda de verdade; o esqueleto não pode passar. Não existe exercício
  com feedback errado sem um teste falhando.
- **Um teste só vale se foi visto falhar:** cada regra nova é sabotada uma vez
  para provar que o teste a pega.
- **Monitoramento:** `lib/registro.ts` manda eventos com lista branca de
  campos — tipo, rota, operação, motor, nome e código do erro, duração —
  para a tabela `eventos` (0019), que só recebe `insert` e ninguém lê pela
  API. **Nunca a mensagem do erro**: ela carrega o que o aluno escreveu. A
  administração vê o agregado ("Saúde", no painel).

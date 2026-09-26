# Roadmap da auditoria — 2026-09-26

Sai do [`AUDIT_REPORT.md`](AUDIT_REPORT.md); os IDs (P0-1, P2-3…) apontam para
lá. Cada fase fecha com `npm run typecheck`, `npm test`, `npm run build` e o
E2E das telas tocadas — verde antes de começar a seguinte. Cada etapa resolve
um problema, com o teste escrito antes e sabotado depois.

Regra de dependências: antes de instalar um pacote, a pergunta é "isso precisa
de uma dependência?". Nesta lista, só o ESLint (Fase 3) passa por ela.

---

## Fase 1 — Bugs críticos · **feita nesta rodada**

- [x] P0-1 concluir não apaga mais o progresso numa leitura que falha
- [x] P0-2 leitura paginada do histórico (tentativas, revisões, compras)
- [x] P1-4 exercício resolvido em visita anterior não regride
- [x] P1-5 fechamento de aula estável (farm do dobro; desafio reancorado)
- [x] P1-6 falha de leitura visível; loja não vende sobre saldo incompleto
- [x] P1-7 "salvo"/"entregue" só depois de gravar; sem confete repetido
- [x] P1-8 renovação de token não recarrega tudo nem reembaralha a revisão

**Ação do dono do projeto:** rodar `supabase/migrations/0009_integridade.sql`
no SQL Editor. Até lá o aplicativo usa o caminho antigo (já sem a perda de
dados), e o painel de admin continua lendo a view.

## Fase 2 — Segurança

Feito nesta rodada (na 0009 e no cliente):
- [x] P0-3 admin sem leitura de PII; painel por agregado
- [x] P1-1 contas demo imutáveis; foto não sobe de conta demo
- [x] P1-2 compra só pela função do banco (catálogo, trava, cosmético único, teto)
- [x] P1-3 conclusão atômica
- [x] P1-9 limite de ritmo e formato das tentativas
- [x] P2-4 bloqueio de rede na cadeia de protótipos dos workers
- [x] P2-8 `service_role` legada recusada

A fazer, nesta ordem:
1. **P2-5** trancar a rede do motor de Python depois da carga do Pyodide;
   `sys.modules['js'] = None`. Prova: `e2e/python.spec.ts` inteiro + um teste
   que tenta `from js import fetch`.
2. **P2-7** cabeçalhos em `vercel.json` (nosniff, referrer, permissions); CSP em
   `Report-Only` por uma semana antes de valer.
3. **P1-10** catálogo de exercícios no banco, gerado do conteúdo pelo CI
   (`supabase/seed/catalogo.sql`, conferido por teste como o `store_items`), e
   `registrar_tentativa`/`concluir` validando id e pertinência à aula; `concluir`
   de aula exige todos os exercícios dela acertados no histórico.
4. **P2-9** Vite 6+ e Vitest 3+ numa etapa própria; revalidar
   `semSourcemapNosGigantes`, `worker.format` e o E2E dos oito motores.
5. **P3-9** mensagens do OAuth por código, sem texto da URL.

## Fase 3 — Código e arquitetura

1. **P2-12** ESLint mínimo (`typescript-eslint` + `react-hooks`), no CI antes
   dos testes; corrigir o que ele apontar, sem desligar regra.
2. **P2-13** testes do `StudentDataContext` (derivação, `incompleto`, compra
   dupla, recarga) com os `fetch*` dublados.
3. **Migrações num Postgres de verdade no CI** (job com `postgres` de serviço e
   schemas `auth`/`storage` mínimos): aplica 0001→0009 duas vezes (idempotência)
   e chama `concluir`, `comprar_item` (preço, duplicado, teto, trava) e
   `desempenho_por_exercicio` (admin × aluno).
4. **P3-4** mapa tipo → componente em `Lesson.tsx`.
5. **P3-1** remover `IconShop`, `LINHAS_DO_PRELUDIO`,
   `VERSAO_DO_TYPESCRIPT_NO_NAVEGADOR`, `getDefaultTrack`; decidir `bun.lock`
   (P3-3).
6. **P2-17** reescrever `docs/context/04` e `05` para o que existe.

## Fase 4 — Performance

1. **P2-1a** `React.lazy` por rota: `Landing`/`Login` num chunk,
   `Lesson`/`ProjectWorkspace`/`Review`/admin em outros. Medir antes/depois.
2. **P2-1b** índice × corpo do catálogo: `content/indice.ts` (ids, títulos,
   ordem, exercícios, conceitos — gerado ou derivado) no chunk principal;
   corpo de cada trilha por `import()`. Meta: chunk principal < 400 kB gz.
3. **Orçamento de pacote no CI** para a meta não escorregar.
4. **P2-2** agrupar tentativas por dia/conceito/aula uma vez; `desafiosConcluidos`
   calculado uma vez e passado ao XP.
5. **P2-3** provider acima das rotas; atualização local após concluir/tentar;
   revalidação sem esqueleto.
6. **P2-10** fontes do próprio domínio.
7. **P3-8** validação Zod só em DEV/teste.

## Fase 5 — UX/UI

1. Erros técnicos crus → frases por código (login, callback, motores); o detalhe
   vai para o registro (Fase 3 da observabilidade, abaixo).
2. **P3-5** alvos de 24 px nos links soltos.
3. **P3-11** rótulo do XP no perfil.
4. **P2-6** laço infinito no motor de página: guarda de laço no código do aluno.
5. Microinterações curtas, todas atrás de `prefers-reduced-motion`: moeda indo
   ao saldo na compra; pulso no contador de sequência no primeiro estudo do dia;
   anel de nível enchendo no aviso de nível.
6. **Observabilidade leve** (P2-18): `lib/registro.ts` com lista branca, tabela
   `eventos` (0010) só com `insert` e ritmo, ganchos no `ErrorBoundary`,
   `unhandledrejection` e motores; "saúde" no painel de admin.

## Fase 6 — Aprendizado

1. **Caderno de erros** (P2-15). Migração: `exercise_attempts.resposta jsonb`
   (resumo limitado a ~2 kB: alternativa escolhida, lacunas, linha apontada, ou
   as primeiras linhas do código) e `feedback text` (a primeira falha, como o
   aluno a leu). Tela `/app/praticar/erros`: questão, conceito, o que foi
   enviado, a explicação, quando, quantas vezes errou, se já dominou (acertou
   depois). Sem texto livre de terceiros, sem nada além do próprio aluno.
2. **Revisar** (fila de exercícios). Um exercício errado entra na fila;
   prioridade = frequência de erro × tempo desde a última tentativa × peso do
   conceito no grafo de pré-requisitos (conceito que destrava muitos pesa
   mais). Intervalos de Leitner como nos cartões; acertar de novo depois do
   intervalo o tira da fila. Reusa os componentes de exercício existentes.
3. **Domínio com tempo**: a evidência envelhece; "dominando" pede um acerto
   depois de N dias. Mantém os quatro níveis e a evidência à vista — nada de
   porcentagem com casas decimais.
4. **P2-14** dicas: CI cobra ≥ 3 níveis nos exercícios de produção; rodada de
   conteúdo trilha por trilha, começando por Fundamentos de JavaScript.
5. Flashcards para os 93 conceitos sem cartão, começando pelos que são
   pré-requisito de mais aulas.
6. Projetos intermediários de TypeScript e React.

## Fase 7 — Gamificação

1. **Missões** (evolução dos desafios, mesma derivação, sem tabela de resgate):
   diárias com "corrigir 1 bug" (`find-bug`), "revisar 3 do caderno de erros";
   semanais com "estudar 4 dias", "20 exercícios", "entregar um projeto".
   Recompensas em XP e moedas; sem punição por não cumprir; nada que premie
   velocidade ou volume repetido.
2. **Conquistas por níveis** (bronze, prata, ouro, platina) nas de contagem,
   em categorias novas: debugging, projetos, desafios, linguagens, revisão.
   Algumas liberam cosméticos exclusivos (Fase 8). Trocar "Coruja".
3. **Perfil**: conquistas favoritas (até 3, escolhidas — coluna
   `users.conquistas_em_destaque text[]`), badges e título equipados,
   linguagens estudadas, projetos entregues, atividade recente (derivada).
4. Novidades sincronizadas entre aparelhos (P3-10) — `users.visto jsonb`.

## Fase 8 — Loja 2.0

Evolução, não substituição: o que existe (consumíveis, temas, avatares, a
confirmação em linha, as vinhetas pintadas) continua. A fundação no servidor
(`store_items` com janela de disponibilidade, `comprar_item`) já entrou na 0009.

### Modelo

```ts
type Categoria = 'avatar' | 'moldura' | 'fundo' | 'tema' | 'badge' | 'titulo' | 'efeito' | 'consumivel';
type Raridade = 'comum' | 'incomum' | 'raro' | 'epico' | 'lendario';
type Requisito =
  | { tipo: 'nivel'; nivel: number }
  | { tipo: 'conquista'; conquistaId: string }
  | { tipo: 'trilha'; trackId: string }
  | { tipo: 'projeto'; projectId: string }
  | { tipo: 'sequencia'; dias: number };

interface ItemDaLoja {
  id: string;
  categoria: Categoria;
  raridade: Raridade;
  title: string;
  description: string;
  /** Ausente = não se compra (item de conquista). */
  price?: number;
  /** Todos precisam valer para comprar/equipar. */
  requisitos?: Requisito[];
  /** Como se obtém de graça, se houver (hoje: `nivelQueLibera`). */
  liberadoPor?: Requisito;
  disponivelDe?: string;   // sazonal
  disponivelAte?: string;
  novo?: boolean;          // alimenta "Destaques" e Novidades
}
```

`store_items` ganha `categoria`, `raridade`, `requisitos jsonb`; o teste de
migrações já confere que banco e código dizem a mesma coisa. Equipar vira
colunas em `users` (`moldura`, `fundo`, `badges text[]`, `titulo`, `efeito`),
validadas por uma função `equipar(p_categoria, p_item)` que confere posse
(compra, nível ou conquista derivável no banco — as de contagem simples).

### Etapas (cada uma com teste, E2E e o seu commit)

1. **Catálogo com categoria e raridade**, sem item novo: os 14 itens atuais
   reclassificados; filtros `Todos · Avatares · Temas · Consumíveis`; saldo fixo
   no topo com atalho para o inventário. Nenhuma mudança de preço ainda.
2. **Inventário** (`/app/perfil/inventario`): o que é seu, por categoria, com
   `Possuído · Equipado · Bloqueado` e o que abre cada bloqueado.
3. **Histórico de compras** na loja: item, preço, data, saldo depois. O "saldo
   antes/depois" é derivado recontando as moedas até o instante da compra
   (aulas pelo fechamento, desafios pelo dia; projetos não têm hora — entram
   como "até a data"), e o texto diz isso.
4. **Prévia**: `Visualizar` aplica o item no próprio cabeçalho do perfil (ou na
   janela pintada, para tema) sem gravar; `Comprar`; `Equipar agora` no retorno
   da compra, com a moeda indo ao saldo (movimento curto, reduzível).
5. **Molduras e fundos** (novas vinhetas no padrão pintado): Terminal, Neon,
   Pixel, Minimal, Ouro; fundos terminal, grade, circuito, pôr do sol, aurora.
   Interpretações próprias — nada de identidade de terceiros.
6. **Temas novos** como pares de tokens (`data-accent`) com o teste de
   contraste cobrindo cada um nas duas variantes: leituras próprias de "escuro
   de editor", "Drácula", "Nord", "Tokyo Night", "Solarized", "Matrix" — nomes
   próprios se a paleta lembrar demais a original.
7. **Badges e títulos**: "Caçador de Bugs" (conquista de 100 `find-bug`), "Mestre
   dos Loops", "Full Stack Apprentice" (trilhas da etapa 5)… Título aparece
   ao lado do nome (`Carlos — Caçador de Bugs`).
8. **Itens exclusivos de conquista** (sem preço): "Chama de 30 dias", "Moldura
   React" (trilha React completa).
9. **Consumíveis novos**, sem pay-to-win: *recuperar a sequência* (cobre um dia
   perdido nos últimos 2 dias, uma vez por semana, derivado como o
   congelamento); *booster de moedas* (+25% nas moedas de aula e desafio por
   24 h, janela como o dobro). "Passe de revisão" só se a Fase 6 criar alguma
   penalidade — hoje não há, e ele não deve existir sem motivo.
10. **Economia recalibrada** com a simulação da auditoria como teste: comum ≈ 1
    semana de estudo, incomum ≈ 2, raro ≈ 3–4, épico ≈ 5–6, lendário só por
    conquista ou evento. Um cosmético nunca abre por nível **antes** de caber
    no saldo de quem estuda no ritmo-modelo (o teste falha se abrir).
11. **Destaques desta semana** (rodízio determinístico como os desafios, 3
    itens, sem contagem regressiva nem "últimas unidades") e integração com
    Novidades ("5 avatares novos chegaram à loja").
12. **Sazonais**: `disponivelDe`/`disponivelAte` já valem no servidor; a tela
    mostra "até <data>" sem pressão. Nada de sistema de eventos.
13. **Admin da loja**: mesma decisão do conteúdo — a tela **gera** a linha do
    catálogo (TS + SQL) para revisão em pull request, em vez de escrever no
    banco. Ativar/desativar pode ser um `update` de `ativo` por função de admin.

Fora de escopo por decisão: loot box, sorteio pago com moeda, compra com
dinheiro real de qualquer coisa que toque progresso (XP, nível, resposta,
conclusão, conquista).

## Fase 9 — Polimento

- Telemetria de produto mínima e anônima (sobre a tabela `eventos`): abandono
  por aula (entrou × concluiu), erro por exercício (já existe no painel),
  tipos de exercício por taxa de conclusão, itens comprados, recursos usados.
  Sem identificador além do `user_id` já existente; agregados no painel.
- Estados vazios revistos com a regra "diz o que está vazio e o próximo
  passo", incluindo os novos (inventário, caderno, histórico).
- Carregamento: esqueleto só onde a forma do conteúdo é conhecida; nada de
  tela piscando entre rotas (depende de P2-3).
- Passada de acessibilidade com leitor de tela real nas telas novas.
- Teste em telefone de verdade (continua pendente desde 09-14).

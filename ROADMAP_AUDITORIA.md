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
1. [x] **P2-5** rede do motor de Python trancada depois da carga do Pyodide;
   `e2e/python.spec.ts` inteiro verde e um teste que roda `js.fetch`.
2. [x] **P2-7** cabeçalhos em `vercel.json` (nosniff, referrer, permissions).
   Falta a CSP da aplicação (em `Report-Only` primeiro) e decidir
   `frame-ancestors` — depende de saber se algum portfólio embute o site.
3. **P1-10** catálogo de exercícios no banco, gerado do conteúdo pelo CI
   (`supabase/seed/catalogo.sql`, conferido por teste como o `store_items`), e
   `registrar_tentativa`/`concluir` validando id e pertinência à aula; `concluir`
   de aula exige todos os exercícios dela acertados no histórico.
4. **P2-9** Vite 6+ e Vitest 3+ numa etapa própria; revalidar
   `semSourcemapNosGigantes`, `worker.format` e o E2E dos oito motores.
5. [x] **P3-9** mensagens do OAuth por código, sem texto da URL.

## Fase 3 — Código e arquitetura

1. [x] **P2-12** ESLint mínimo (`typescript-eslint` + `react-hooks`), no CI
   antes dos testes; três achados corrigidos, nenhuma regra desligada fora o
   `rules-of-hooks` nas fixtures do Playwright (o `use` de lá não é hook).
2. [x] **P2-13** testes do `StudentDataContext` (`incompleto`, recarga, compra
   dupla, recusa do banco, sessão renovada).
3. [x] **Migrações num Postgres de verdade no CI** — `supabase/verificacao/`:
   o mínimo do Supabase (papéis, `auth.uid()`, `auth.users`, `storage`),
   todas as migrações aplicadas duas vezes, e as verificações de comportamento
   com os papéis da API (conclusão, compra, painel de admin, anônimo, ritmo,
   formato, caderno, foto, contas demo). Sabotado: a policy ampla de admin, o gatilho das contas
   demo e o INSERT direto em compras, de volta, são pegos.
4. [x] **P3-4** `ExercicioDoPasso`: `switch` exaustivo no lugar dos dez blocos.
5. [x] **P3-1** removidos `LINHAS_DO_PRELUDIO` e
   `VERSAO_DO_TYPESCRIPT_NO_NAVEGADOR`; `IconShop` fica para a Loja 2.0;
   `getDefaultTrack` fica (o E2E do painel usa). Falta decidir `bun.lock` (P3-3).
6. [x] **P2-17** reescrever `docs/context/04` e `05` para o que existe.
   Feito: o `04` diz a pilha real e onde cada regra mora; o `05` manteve as
   regras de trabalho e trocou a lista de fases do plano original por onde
   o roadmap está.

## Fase 4 — Performance

1. [x] **P2-1a** `React.lazy` para `Lesson`/`ProjectWorkspace`/`Review`/admin,
   o chunk da aula adiantado no ócio: 972 → 847 kB gzip, com o item 7.
2. **P2-1b** índice × corpo do catálogo: `content/indice.ts` (ids, títulos,
   ordem, exercícios, conceitos — gerado ou derivado) no chunk principal;
   corpo de cada trilha por `import()`. Meta: chunk principal < 400 kB gz.
3. **Orçamento de pacote no CI** para a meta não escorregar.
4. [x] **P2-2** índice por dia nos desafios (1,5 s → 22 ms com um ano de
   histórico) e calculados uma vez só por recálculo do painel.
5. [x] **P2-3** provider acima das rotas; voltar ao app revalida sem esqueleto.
   Falta a leitura agregada no banco, para a carga não crescer com o tempo.
6. [x] **P2-10** fontes do próprio domínio (dois `.woff2` variáveis, 58 kB).
7. [x] **P3-8** validação Zod só em DEV/teste; Zod fora do pacote principal.

## Fase 5 — UX/UI

1. Erros técnicos crus → frases por código (login, callback, motores); o detalhe
   vai para o registro (Fase 3 da observabilidade, abaixo).
2. [x] **P3-5** alvos de 24 px nos links soltos, com E2E de guarda.
3. [x] **P3-11** rótulo do XP no perfil.
4. [x] **P2-6** laço infinito no motor de página: guarda na condição de cada
   laço dos `<script>` do aluno (`lib/protecao-de-laco.ts`), 1,5 s.
5. Microinterações curtas, todas atrás de `prefers-reduced-motion`: moeda indo
   ao saldo na compra; pulso no contador de sequência no primeiro estudo do dia;
   anel de nível enchendo no aviso de nível.
6. [x] **Observabilidade leve** (P2-18): `lib/registro.ts` com lista branca, tabela
   `eventos` (0011) só com `insert` e ritmo, ganchos no `ErrorBoundary`,
   `unhandledrejection` e motores; "saúde" no painel de admin.
   Feito assim (0019): a lista branca é o tipo, a rota (sem busca nem
   âncora), a operação, o motor, a etapa, o nome do erro, o código do
   Postgres, a duração e o id do exercício — **nunca** a mensagem, que
   carrega o que o aluno escreveu. O banco confere de novo (chaves e 1 KiB),
   o cliente só escreve `tipo` e `dados` (o `user_id` é sempre o
   `auth.uid()`), ninguém lê as linhas pela API, e mais de 30 por minuto da
   mesma pessoa somem em silêncio. Ganchos: `ErrorBoundary`, erros e
   promessas sem tratamento deste site, as leituras e gravações de
   `progress.ts`/`perfil.ts`, leitura paginada acima de 2 s, falha de
   criação, partida, carga ou erro dos motores (o prazo estourado pelo
   código do aluno **não** entra: é o laço dele, não a plataforma). A
   administração vê "Saúde · últimos 14 dias" por tipo e onde, sem quem.

## Fase 6 — Aprendizado

1. [x] **Caderno de erros** (P2-15). 0010: `exercise_attempts.resposta jsonb`
   (a alternativa, a previsão, as lacunas, a linha, a ordem, ou o código —
   cortados no navegador, teto de 16 KiB no banco, o pior caso medido contra o
   teto em teste) e `feedback text` (a primeira falha, como o aluno a leu),
   gravados só quando errou. Tela `/app/praticar/erros`: o enunciado, a aula,
   o que foi enviado no formato do exercício, o retorno, quando e quantas
   vezes errou, o estado na revisão. Sem texto livre na conta de demonstração
   (gatilho), nada além do próprio aluno (RLS). Desvio do plano: a explicação
   da resposta certa **não** aparece no caderno — vem ao acertar, como na
   aula; lida antes, vira resposta decorada.
2. [x] **Revisar** (fila de exercícios, `lib/caderno.ts` + `/refazer`). Um
   exercício errado entra pendente; acertar depois o põe na revisão em 3, 7 e
   21 dias (só conta o acerto que chega na data; erro novo recomeça); passar
   pelas três o deixa dominado. Ordem da fila: pendentes antes de vencidos;
   entre pendentes, mais erros, depois o conceito que sustenta mais conceitos,
   depois o erro mais antigo. Desvio do plano: ordem lexicográfica, não um
   produto — um produto de grandezas sem unidade comum dá uma ordem que
   ninguém consegue explicar ao aluno. Sessões de até 10, com os componentes
   da aula e a regra dela (sem "pular").
3. [x] **Domínio com tempo**: "dominando" pede um acerto 3 dias (ou mais)
   depois do primeiro; parado 60 dias, continua dominando e pede revisão
   (motivo "tempo"). Os motivos da revisão (pouca precisão, regressão, tempo)
   aparecem na tela, e quem só espera o tempo lê "falta acertar de novo daqui
   a alguns dias". Mantidos os quatro níveis e a evidência à vista. De
   carona: dia de estudo contado no fuso de quem estuda, e `src/client/lib`
   também em UTC+14 no CI.
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

1. [x] **Catálogo com categoria e raridade**, sem item novo: os 14 itens atuais
   reclassificados; filtros `Todos · Avatares · Temas · Consumíveis`; saldo fixo
   no topo com atalho para o inventário. Nenhuma mudança de preço ainda.
   Feito assim: a categoria é o `tipo` que já existia (os valores são os do
   modelo; a união cresce com as categorias novas, junto da checagem de
   `store_items`); a raridade acompanha o nível que libera (até 5 comum, 6–9
   incomum, 10+ raro; consumível sempre comum; épico e lendário reservados às
   conquistas) e **não vai ao banco** — nenhuma regra do servidor a lê, e uma
   migração a mais sem regra seria SQL para rodar sem ganho. O atalho para o
   inventário entra com o inventário (etapa 2).
2. [x] **Inventário** (`/app/perfil/inventario`): o que é seu, por categoria, com
   `Possuído · Equipado · Bloqueado` e o que abre cada bloqueado.
   Feito assim: avatares (os de graça incluídos) e cores, cada um com a
   origem — de graça, pelo nível, comprado (`posseDe`; a compra vence na
   origem, porque foi escolha) — e **Equipar** num toque; o trancado diz o
   nível e o preço e leva à loja (nada no inventário vende); os consumíveis
   dizem quantos estão guardados e se o dobro está ativo. Porta no perfil e
   atalho na barra da loja. Equipar ainda não é conferido no banco (a
   `equipar()` do modelo): hoje só muda a aparência da própria pessoa.
3. [x] **Histórico de compras** na loja: item, preço, data, saldo depois. O "saldo
   antes/depois" é derivado recontando as moedas até o instante da compra
   (aulas pelo fechamento, desafios pelo dia; projetos não têm hora — entram
   como "até a data"), e o texto diz isso.
   Feito assim: `historicoDeCompras` (economia.ts) reconta até o instante de
   cada compra — aulas pelo fechamento, desafios pelo dia, marcos de
   sequência pelo dia em que a corrente os alcançou (`correntesComInicio`);
   projetos, sem hora, entram como já ganhos em todas as linhas, e a tela
   diz quantas moedas são assim. A linha mais recente é, por teste, o saldo
   de hoje.
4. [x] **Prévia**: `Visualizar` aplica o item no próprio cabeçalho do perfil (ou na
   janela pintada, para tema) sem gravar; `Comprar`; `Equipar agora` no retorno
   da compra, com a moeda indo ao saldo (movimento curto, reduzível).
   Feito assim: "Ver no meu perfil" abre, dentro do cartão, o cabeçalho do
   perfil em miniatura com o item no lugar do que está equipado
   (`PreviaDoPerfil`) — nome, nível, avatar, moldura, capa e, para cor, o
   botão pintado com a amostra, sem mexer na página. Nada grava (o teste de
   navegador confere que nenhuma escrita em `users` sai da prévia). Depois
   da compra, "Equipar agora" grava num toque (`mudancaDeEquipar`, a mesma
   tradução item → perfil para os quatro tipos). O movimento da moeda ficou
   de fora: o saldo preso no topo já muda na hora, e o movimento seria
   enfeite.
5. [x] **Molduras e fundos** (novas vinhetas no padrão pintado): Terminal, Neon,
   Pixel, Minimal, Ouro; fundos terminal, grade, circuito, pôr do sol, aurora.
   Interpretações próprias — nada de identidade de terceiros.
   Feito assim (0011): cinco molduras (Minimal, Terminal, Pixel, Neon, Ouro)
   como anel pintado **sobre a borda** do avatar, sem mudar o tamanho — cabe
   dentro do anel de nível; quatro fundos (Grade, Circuito, Pôr do sol,
   Aurora) como capa **acima** do cabeçalho do perfil, nunca atrás de texto.
   Inventário com "Sem moldura"/"Sem fundo"; a leitura do perfil tolera banco
   sem a 0011. De carona: as migrações perderam o cifrão dentro de texto
   (o editor do Supabase se confunde), com teste.
6. [x] **Temas novos** como pares de tokens (`data-accent`) com o teste de
   contraste cobrindo cada um nas duas variantes: leituras próprias de "escuro
   de editor", "Drácula", "Nord", "Tokyo Night", "Solarized", "Matrix" — nomes
   próprios se a paleta lembrar demais a original.
   Feito assim (0011): Grafite (cinza-azulado), Meia-noite (índigo) e
   Crepúsculo (rosa) — nomes e paletas próprios, geradas da Floresta em
   OKLCH (mesma luminosidade por degrau, outro matiz). Verde, âmbar e
   vermelho ficaram de fora de propósito: são sucesso, "ainda não" e erro.
   O teste de contraste itera `ACENTOS` (as sete × os dois modos).
7. [x] **Badges e títulos**: "Caçador de Bugs" (conquista de 100 `find-bug`), "Mestre
   dos Loops", "Full Stack Apprentice" (trilhas da etapa 5)… Título aparece
   ao lado do nome (`Carlos — Caçador de Bugs`).
   Feito assim (0012): doze títulos (`lib/titulos.ts`), cada um aberto por
   uma ou mais conquistas — três conquistas novas para isso (vinte e cinco
   bugs, quinze laços, dez testes escritos; o catálogo só tem 74 `find-bug`,
   então "100" nunca abriria, e um teste confere que cada contagem cabe no
   catálogo). Nomes que servem a qualquer pessoa: "Detetive de Bugs",
   "Mestre dos Laços", "Aprendiz Full Stack" (as etapas da web, das
   ferramentas e da aplicação — conferido pelas trilhas, não pelo índice).
   Escolhe-se no inventário; aparece ao lado do nome no perfil; as
   conquistas dizem "Dá o título …". Nenhum título está na loja (teste e
   verificação no banco).
8. [x] **Itens exclusivos de conquista** (sem preço): "Chama de 30 dias", "Moldura
   React" (trilha React completa).
   Feito assim (`lib/exclusivos.ts`, sem migração — as colunas da 0011 já
   servem): Moldura Chama (um mês seguido), Moldura Órbita (a trilha de
   React completa — órbita e planetas, desenho próprio, nada do logotipo
   do React) e Fundo Constelação (vinte e cinco conceitos). Fora de `ITENS`
   e do catálogo do banco: `comprar_item` os recusa (verificação no banco),
   e a loja não os mostra. No inventário, "De conquista" no lugar da
   raridade; o trancado diz a conquista e o progresso e leva às
   conquistas, que dizem "Dá a Moldura Chama".
9. [x] **Consumíveis novos**, sem pay-to-win: *recuperar a sequência* (cobre um dia
   perdido nos últimos 2 dias, uma vez por semana, derivado como o
   congelamento); *booster de moedas* (+25% nas moedas de aula e desafio por
   24 h, janela como o dobro). "Passe de revisão" só se a Fase 6 criar alguma
   penalidade — hoje não há, e ele não deve existir sem motivo.
   Feito assim (0013): **recuperar a sequência** (90 moedas) — a compra no
   dia seguinte ao dia perdido (ou no outro, se entre eles houve estudo)
   cobre aquele dia; o congelamento, comprado antes, vem primeiro; uma
   recuperação por semana, contada pelo dia da compra. A loja só vende
   quando ela salva alguma coisa (`efeitoDeRecuperar`: a mesma conta, com a
   compra de mentira acrescentada) e diz "cobre ontem: a sequência volta a
   N dias". O teto do servidor soma a recuperação como soma o congelamento
   (um dia coberto pode fechar um marco que rende moedas).
   **O booster de moedas ficou de fora, por decisão**: moeda que rende moeda
   faz da loja um investimento — quem tem mais ganha mais, e a pergunta
   deixa de ser "o que eu quero" para "quanto rende". Não volta sem um
   motivo pedagógico. O passe de revisão continua sem motivo para existir.
10. [x] **Economia recalibrada** com a simulação da auditoria como teste: comum ≈ 1
    semana de estudo, incomum ≈ 2, raro ≈ 3–4, épico ≈ 5–6, lendário só por
    conquista ou evento. Um cosmético nunca abre por nível **antes** de caber
    no saldo de quem estuda no ritmo-modelo (o teste falha se abrir).
    Feito assim (0015): a simulação virou `economia.calibragem.test.ts` — o
    aluno-modelo roda as contas de verdade (`computeXp`, `desafiosConcluidos`,
    `moedasGanhas`) sobre o catálogo de verdade, em cinco datas de início.
    Medido: ~220 moedas por semana (os desafios reais rendem mais que a
    estimativa de 175), nível 5 no dia 4, 10 na semana 4, 17 na 13. O preço
    passou a sair do nível (`PRECO_DO_NIVEL`, 10 a 1.400) e a raridade também
    (épico do 15 em diante). Regras cobradas no pior caso: nada abre pelo
    nível antes de caber no saldo; do nível 6 em diante, cabe entre um quarto
    e dois terços do caminho até o nível; épico custa 5 a 7 semanas;
    consumível, menos de meia. As faixas "comum ≈ 1 semana" não couberam: os
    níveis 3 a 5 chegam nos primeiros dias, e o que abre no dia 2 não pode
    custar uma semana — custa 10 a 90. **Nenhum nível subiu**: ninguém perde o
    que já abriu; só o preço muda, e uma compra feita guarda o que foi pago.
11. [x] **Destaques desta semana** (rodízio determinístico como os desafios, 3
    itens, sem contagem regressiva nem "últimas unidades") e integração com
    Novidades ("5 avatares novos chegaram à loja").
    Feito assim: `lib/destaques.ts` — os cosméticos numa ordem fixa
    (embaralhada pelo id, para as categorias se alternarem) e, a cada semana,
    a janela seguinte de três, pulando o que a pessoa já tem; comprar um
    destaque troca só aquele. Todo cosmético passa pela vitrine em ~11
    semanas (teste). Na loja, a vitrine são links para o cartão do item, não
    cópias dele — cada item mora numa seção só —, e o texto diz que nada fica
    mais barato nem some. Nas Novidades, "Chegou à loja: 4 avatares, 2
    molduras e 1 fundo", um aviso só; quem já usava o aplicativo antes do
    aviso existir compara com o catálogo de antes da Loja 2.0.
12. [x] **Sazonais**: `disponivelDe`/`disponivelAte` já valem no servidor; a tela
    mostra "até <data>" sem pressão. Nada de sistema de eventos.
    Feito assim (0016): a janela mora também em `ITENS` (`aVenda`,
    `visivel`), e um teste confere que é a mesma do banco. Fora dela o item
    some da loja, do inventário, da vitrine e da contagem — para quem não o
    tem; quem comprou continua com ele. O cartão diz "à venda até 15 de
    janeiro · depois, quem comprou fica com ele", no horário de Brasília, e
    nada mais. Sazonal não abre por nível e cabe no saldo em metade da
    janela (teste de calibragem). O primeiro é o Fundo Fogos (15/12 a 15/01),
    e o aviso de "chegou à loja" o anuncia quando a janela abre, não quando o
    código chega.
13. [x] **Admin da loja**: mesma decisão do conteúdo — a tela **gera** a linha do
    catálogo (TS + SQL) para revisão em pull request, em vez de escrever no
    banco. Ativar/desativar pode ser um `update` de `ativo` por função de admin.
    Feito assim (0017, `/admin/loja`): a tela põe o banco ao lado do código
    (`compararCatalogo`) e diz cada divergência — preço antigo, item que o
    banco não tem, janela diferente —, que quase sempre é uma migração que
    não rodou; tira um item da venda e devolve por `definir_item_ativo`, que
    recusa quem não é admin **e a conta admin de demonstração** (é pública:
    tirar item da loja de todo mundo não pode estar a um clique de qualquer
    visitante); e gera a tupla de `ITENS` e a linha do `insert`, com preço e
    raridade do nível. A loja esconde o que saiu da venda (menos para quem já
    tem). O teste de segurança das migrações passou a aceitar função de admin
    liberada ao cliente só se a recusa a não-admin vier antes da primeira
    escrita.

Com isso a Loja 2.0 fecha as treze etapas. Depois delas, o passo que ficou
registrado — o nível abre o último cosmético na semana ~13 (P2-16) — virou a
0018: quatro épicos **só por moedas**, sem nível que os abra (Avatar Dragão,
Avatar Fênix, Moldura Engrenagens, Fundo Cidade), de 1.200 a 1.500 moedas. O
teste de calibragem cobra que os itens só por moedas somem pelo menos 18
semanas do aluno-modelo: as moedas têm destino até perto do fim do catálogo
de aulas.

### Depois da Loja 2.0: itens além do perfil (0020)

Avatar, moldura, fundo e cor mudam o perfil. As categorias novas mudam o
lugar onde se estuda — uma de cada vez, todas numa migração só (a 0020, que
cresce e roda de novo):

1. [x] **Temas do editor**: as cores do código nos exercícios e projetos.
   Feito assim: cinco paletas à venda (Noturno, Papel, Floresta à noite,
   Giz, Neon — nomes e cores próprios), preço e raridade do nível como os
   outros cosméticos, e duas de graça: o padrão e o **alto contraste**
   (acessibilidade não se vende). Cada cor de token é conferida contra o
   fundo (AA; o alto contraste, AAA). A loja mostra um trecho de código na
   paleta ("Ver no editor") sem carregar o Monaco; o inventário troca num
   toque. Só o editor muda: os blocos de código da aula ficam no padrão.
2. [x] **Celebração ao concluir**: o efeito ao fechar uma aula ou projeto.
   Feito assim: quatro à venda (Estrelas, Bolhas, Chuva de código, Fogos) e
   o confete de todo mundo. Cada uma é uma lista de disparos do
   `canvas-confetti` (`disparosDe`, puro e testado: o projeto é sempre mais
   forte que a aula, nenhuma é o confete com outro nome, as bolhas sobem, os
   fogos estouram em sequência, a chuva de código cai com caracteres de
   verdade). **Nenhuma toca para quem pediu menos movimento — a comprada
   inclusive**, nem nos disparos atrasados; a loja diz isso no lugar de tocar
   escondido. A prévia toca no clique de quem pediu, não ao montar.
3. [x] **Ícone da sequência**: a chama, ou outro, onde a sequência aparece.
   Feito assim: Sol, Café, Foguete e **Planta que cresce** (broto, muda aos
   7 dias, árvore aos 30 — os marcos que já rendem moedas), e a chama de
   todo mundo; no traço dos outros ícones, com a cor do lugar onde está. No
   início, no perfil e no progresso; a conta da sequência não muda. **Sem
   raio**: ele já é o "2× XP" do cabeçalho, e os dois lado a lado diriam a
   mesma coisa.
4. [ ] **Adesivos no perfil**: até três, escolhidos no inventário, no
   cabeçalho do perfil.

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

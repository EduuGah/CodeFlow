-- Integridade do progresso, da loja e das contas de demonstração.
--
-- Saiu da auditoria de 2026-09-26. Cinco problemas, todos do mesmo tipo: o
-- banco confiava numa conta que só o navegador fazia.
--
-- 1. Concluir uma aula lia a lista de concluídas, acrescentava no navegador e
--    regravava a lista inteira. Duas abas concluindo ao mesmo tempo perdiam
--    uma das duas; e uma leitura que falhava (rede) virava lista vazia, e a
--    regravação apagava todo o progresso da pessoa. Agora o banco acrescenta,
--    num comando só, sem ler antes.
-- 2. A conta de demonstração `admin`/`admin` tem a senha impressa na tela de
--    login, e a policy de admin da 0005 deixava ler a tabela `users` inteira —
--    e-mail e nome de todo mundo que já entrou. O painel só precisa do
--    agregado por exercício: ele sai por uma função que devolve números, e as
--    policies de leitura ampla saem.
-- 3. Quem entrava numa conta de demonstração podia trocar a senha dela e
--    trancar a porta para os próximos visitantes. As credenciais delas agora
--    só mudam por esta migração ou pela 0008.
-- 4. A compra era um INSERT do navegador com o preço que ele mandasse: preço
--    zero passava, duas abas gastavam o mesmo saldo, e um cosmético podia ser
--    comprado duas vezes. Agora a compra é uma função do banco, que lê o preço
--    do catálogo, compra uma de cada vez por pessoa, recusa cosmético repetido
--    e recusa gastar mais do que qualquer histórico possível renderia.
-- 5. Nenhuma tabela limitava o ritmo de escrita: um laço no console enchia o
--    banco de tentativas. Agora há um teto por minuto, folgado para quem
--    estuda e apertado para quem abusa.
--
-- Idempotente, como as outras: pode rodar de novo.

-- ------------------------------------------------------------ 1. conclusão

/**
 * Acrescenta um id a `completed_lessons` ou `completed_projects`, sem
 * duplicar e sem ler antes. `security invoker`: roda com o RLS de quem chama,
 * então só alcança a própria linha (policy `users_update_own`).
 *
 * O UPDATE de uma linha trava a linha até o fim do comando; duas conclusões
 * simultâneas viram uma depois da outra, e as duas ficam.
 */
create or replace function public.concluir(p_coluna text, p_id text)
returns text[]
language plpgsql
security invoker
set search_path = public
as $$
declare
  lista text[];
begin
  if auth.uid() is null then
    raise exception 'sem_sessao' using errcode = '28000';
  end if;

  -- Os ids do catálogo: minúsculas, dígitos e hífen. Qualquer outra coisa é
  -- lixo que viraria moeda e XP (cada aula concluída rende os dois).
  if p_id is null or p_id !~ '^[a-z0-9][a-z0-9-]{0,99}$' then
    raise exception 'id_invalido' using errcode = '22023';
  end if;

  if p_coluna = 'completed_lessons' then
    update public.users
       set completed_lessons = case
             when p_id = any(completed_lessons) then completed_lessons
             else array_append(completed_lessons, p_id)
           end
     where id = auth.uid()
    returning completed_lessons into lista;
  elsif p_coluna = 'completed_projects' then
    update public.users
       set completed_projects = case
             when p_id = any(completed_projects) then completed_projects
             else array_append(completed_projects, p_id)
           end
     where id = auth.uid()
    returning completed_projects into lista;
  else
    raise exception 'coluna_invalida' using errcode = '22023';
  end if;

  -- Sem linha ainda (o gatilho da 0001 não rodou para esta conta): cria.
  if lista is null then
    if p_coluna = 'completed_lessons' then
      insert into public.users (id, completed_lessons) values (auth.uid(), array[p_id])
      on conflict (id) do update
        set completed_lessons = case
              when p_id = any(public.users.completed_lessons) then public.users.completed_lessons
              else array_append(public.users.completed_lessons, p_id)
            end
      returning completed_lessons into lista;
    else
      insert into public.users (id, completed_projects) values (auth.uid(), array[p_id])
      on conflict (id) do update
        set completed_projects = case
              when p_id = any(public.users.completed_projects) then public.users.completed_projects
              else array_append(public.users.completed_projects, p_id)
            end
      returning completed_projects into lista;
    end if;
  end if;

  return lista;
end;
$$;

revoke all on function public.concluir(text, text) from public, anon;
grant execute on function public.concluir(text, text) to authenticated;

-- ------------------------------------------------------------ 2. admin sem PII

-- Leitura ampla de linhas cruas: sai. O que o painel usa é o agregado abaixo.
drop policy if exists "users_select_admin" on public.users;
drop policy if exists "reviews_select_admin" on public.flashcard_reviews;
drop policy if exists "attempts_select_admin" on public.exercise_attempts;

/**
 * Desempenho por exercício, para o painel de administração.
 *
 * `security definer` porque precisa agregar as tentativas de todos — mas
 * devolve só números por exercício, nunca uma linha de aluno, e só para quem
 * é admin (para os outros, nada). A view `exercise_performance` da 0005
 * continua existindo e, sem a policy ampla, mostra a cada um só o próprio.
 */
create or replace function public.desempenho_por_exercicio()
returns table (
  exercise_id text,
  lesson_id text,
  attempts bigint,
  correct_attempts bigint,
  students bigint,
  students_solved bigint,
  accuracy_percent numeric,
  avg_hints_used numeric,
  attempts_per_student numeric,
  last_attempt_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.exercise_id,
    a.lesson_id,
    count(*) as attempts,
    count(*) filter (where a.correct) as correct_attempts,
    count(distinct a.user_id) as students,
    count(distinct a.user_id) filter (where a.correct) as students_solved,
    round(100.0 * count(*) filter (where a.correct) / nullif(count(*), 0), 1) as accuracy_percent,
    round(avg(a.hints_used), 2) as avg_hints_used,
    round(count(*)::numeric / nullif(count(distinct a.user_id), 0), 2) as attempts_per_student,
    max(a.created_at) as last_attempt_at
  from public.exercise_attempts a
  where public.is_admin()
  group by a.exercise_id, a.lesson_id;
$$;

revoke all on function public.desempenho_por_exercicio() from public, anon;
grant execute on function public.desempenho_por_exercicio() to authenticated;

-- ------------------------------------------------------------ 3. contas demo

/**
 * As contas de demonstração não mudam de senha, de e-mail nem de telefone
 * pela API. A senha delas está impressa na tela de login: quem entrasse e a
 * trocasse trancaria os próximos visitantes — e, na de admin, ficaria com o
 * painel só para si.
 *
 * Mesmo desenho da 0006: o gatilho desfaz a mudança, a não ser que uma marca
 * local à transação esteja ligada — e só a 0008 (ao recriar as contas) a
 * liga. Desfazer em silêncio é de propósito aqui: o GoTrue responde sucesso,
 * e quem tentou não aprende nada sobre a proteção.
 */
create or replace function public.proteger_contas_demo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(old.email, '')) like '%@demo.codeflow.app'
     and coalesce(current_setting('app.allow_demo_reset', true), 'off') <> 'on'
  then
    new.encrypted_password := old.encrypted_password;
    new.email := old.email;
    new.email_change := old.email_change;
    new.email_change_token_new := old.email_change_token_new;
    new.email_change_token_current := old.email_change_token_current;
    new.phone := old.phone;
    new.phone_change := old.phone_change;
  end if;
  return new;
end;
$$;

drop trigger if exists proteger_contas_demo on auth.users;
create trigger proteger_contas_demo
  before update on auth.users
  for each row execute function public.proteger_contas_demo();

-- A foto vai para um bucket de leitura pública. Numa conta que qualquer
-- visitante usa, isso seria hospedagem de imagem anônima; a demonstração usa
-- os avatares desenhados.
drop policy if exists "avatars_write_own_folder" on storage.objects;
create policy "avatars_write_own_folder" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
    and lower(coalesce(auth.jwt() ->> 'email', '')) not like '%@demo.codeflow.app'
  );

drop policy if exists "avatars_update_own_folder" on storage.objects;
create policy "avatars_update_own_folder" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
    and lower(coalesce(auth.jwt() ->> 'email', '')) not like '%@demo.codeflow.app'
  );

-- Tamanhos que a tela já respeita (nome até 40), agora também no banco, com
-- folga. `not valid`: não reprova linhas antigas, só as escritas daqui em diante.
alter table public.users drop constraint if exists users_display_name_tamanho;
alter table public.users add constraint users_display_name_tamanho
  check (display_name is null or char_length(display_name) <= 60) not valid;

alter table public.users drop constraint if exists users_avatar_formato;
alter table public.users add constraint users_avatar_formato
  check (avatar is null or avatar ~ '^preset:[a-z0-9-]{1,40}$' or avatar ~ '^https://') not valid;

-- ------------------------------------------------------------ 4. loja

/**
 * O catálogo, espelho de `ITENS` em `src/client/lib/economia.ts` — o teste
 * `supabase/migrations.test.ts` confere que os dois dizem o mesmo preço e o
 * mesmo tipo para cada item. É daqui que a compra lê o preço: o que o
 * navegador manda não conta.
 *
 * `disponivel_de`/`disponivel_ate` preparam os itens sazonais: fora da
 * janela, o item não se compra (quem já tem continua tendo).
 */
create table if not exists public.store_items (
  id text primary key,
  price integer not null check (price >= 0),
  tipo text not null check (tipo in ('consumivel', 'tema', 'avatar')),
  ativo boolean not null default true,
  disponivel_de timestamptz,
  disponivel_ate timestamptz
);

alter table public.store_items enable row level security;

drop policy if exists "store_items_select_all" on public.store_items;
create policy "store_items_select_all" on public.store_items
  for select using (true);
-- Sem policy de escrita: o catálogo muda por migração, não pela API.

insert into public.store_items (id, price, tipo) values
  ('congelar-sequencia', 60, 'consumivel'),
  ('dobro-de-xp', 80, 'consumivel'),
  ('tema-oceano', 120, 'tema'),
  ('tema-brasa', 150, 'tema'),
  ('tema-ameixa', 200, 'tema'),
  ('avatar-cometa', 90, 'avatar'),
  ('avatar-raposa', 90, 'avatar'),
  ('avatar-coelho', 90, 'avatar'),
  ('avatar-urso', 100, 'avatar'),
  ('avatar-dino', 100, 'avatar'),
  ('avatar-panda', 110, 'avatar'),
  ('avatar-robo', 120, 'avatar'),
  ('avatar-polvo', 130, 'avatar'),
  ('avatar-alien', 150, 'avatar')
on conflict (id) do update
  set price = excluded.price,
      tipo = excluded.tipo;

/**
 * O teto de moedas que o histórico de alguém poderia ter rendido.
 *
 * O saldo exato é derivado no navegador (`lib/economia.ts`), e depende do
 * fuso de quem estuda — o desafio "de hoje" é o do dia local. O banco não
 * sabe o fuso, então não recalcula o saldo: calcula um **teto** que nenhum
 * histórico real ultrapassa, em qualquer fuso, e recusa a compra que
 * passaria dele. Uma compra legítima nunca é recusada por isto; um preço
 * forjado, duas abas gastando o mesmo saldo além do possível, ou moeda sem
 * estudo nenhum, são.
 *
 * Os números vêm de `MOEDAS`, `RECOMPENSA` e `POR_PERIODO` (o teste de
 * migrações confere):
 * - aula concluída 10, projeto 40 — exatos;
 * - desafios do dia: 2 × 15 por dia local com atividade; um dia UTC toca no
 *   máximo 2 dias locais, então 2 × 2 × 15 = 60 por dia UTC;
 * - desafios da semana: 2 × 50 por semana local; idem, × 2 por semana UTC;
 * - marcos de sequência: 30 + 100 por corrente de 7 dias ou mais; as
 *   correntes cabem em (dias locais + dias congelados) / 7.
 */
create or replace function public.teto_de_moedas(p_uid uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  with progresso as (
    select
      coalesce(array_length(completed_lessons, 1), 0) as aulas,
      coalesce(array_length(completed_projects, 1), 0) as projetos
    from public.users
    where id = p_uid
  ),
  atividade as (
    select created_at from public.exercise_attempts where user_id = p_uid
    union all
    select created_at from public.flashcard_reviews where user_id = p_uid
  ),
  dias as (
    select
      count(distinct (created_at at time zone 'utc')::date) as d,
      count(distinct date_trunc('week', created_at at time zone 'utc')) as w
    from atividade
  ),
  congelamentos as (
    select count(*) as f
    from public.purchases
    where user_id = p_uid and item = 'congelar-sequencia'
  )
  select (
      coalesce((select aulas from progresso), 0) * 10
    + coalesce((select projetos from progresso), 0) * 40
    + dias.d * 2 * 2 * 15
    + dias.w * 2 * 2 * 50
    + ceil((dias.d * 2 + congelamentos.f) / 7.0)::integer * (30 + 100)
  )::integer
  from dias, congelamentos;
$$;

revoke all on function public.teto_de_moedas(uuid) from public, anon, authenticated;

/**
 * Compra um item da loja. É a única porta de escrita em `purchases`.
 *
 * - O preço vem de `store_items`, não de quem chama.
 * - Uma compra por vez por pessoa (trava de transação): dois cliques ou duas
 *   abas viram uma depois da outra, e a segunda vê o gasto da primeira.
 * - Cosmético se compra uma vez; consumível, quantas quiser.
 * - O gasto total não passa do teto de `teto_de_moedas`.
 *
 * Os erros são códigos curtos que o navegador traduz (`lib/perfil.ts`).
 */
create or replace function public.comprar_item(p_item text)
returns public.purchases
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_item public.store_items;
  v_gasto integer;
  v_compra public.purchases;
begin
  if v_uid is null then
    raise exception 'sem_sessao' using errcode = '28000';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('comprar:' || v_uid::text, 0));

  select * into v_item
    from public.store_items
   where id = p_item
     and ativo
     and (disponivel_de is null or disponivel_de <= now())
     and (disponivel_ate is null or disponivel_ate > now());
  if not found then
    raise exception 'item_indisponivel' using errcode = 'P0001';
  end if;

  if v_item.tipo <> 'consumivel'
     and exists (select 1 from public.purchases where user_id = v_uid and item = v_item.id)
  then
    raise exception 'item_ja_possuido' using errcode = 'P0001';
  end if;

  select coalesce(sum(price), 0) into v_gasto from public.purchases where user_id = v_uid;
  if v_gasto + v_item.price > public.teto_de_moedas(v_uid) then
    raise exception 'saldo_insuficiente' using errcode = 'P0001';
  end if;

  insert into public.purchases (user_id, item, price)
  values (v_uid, v_item.id, v_item.price)
  returning * into v_compra;

  return v_compra;
end;
$$;

revoke all on function public.comprar_item(text) from public, anon;
grant execute on function public.comprar_item(text) to authenticated;

-- O INSERT direto sai: a compra só entra pela função acima.
drop policy if exists "purchases_insert_own" on public.purchases;

-- ------------------------------------------------------------ 5. ritmo

/**
 * Teto de escritas por minuto, por pessoa e por tabela.
 *
 * Um aluno de verdade não faz 120 tentativas num minuto; um laço no console
 * faz milhares. O índice (user_id, created_at desc) das duas tabelas torna a
 * contagem barata.
 */
create or replace function public.limitar_ritmo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recentes integer;
begin
  execute format(
    'select count(*) from public.%I where user_id = $1 and created_at > now() - interval ''1 minute''',
    tg_table_name
  ) into recentes using new.user_id;

  if recentes >= 120 then
    raise exception 'ritmo_excedido' using errcode = '54000';
  end if;
  return new;
end;
$$;

drop trigger if exists limitar_ritmo on public.exercise_attempts;
create trigger limitar_ritmo
  before insert on public.exercise_attempts
  for each row execute function public.limitar_ritmo();

drop trigger if exists limitar_ritmo on public.flashcard_reviews;
create trigger limitar_ritmo
  before insert on public.flashcard_reviews
  for each row execute function public.limitar_ritmo();

-- O formato do que se grava numa tentativa: ids do catálogo, poucos conceitos.
alter table public.exercise_attempts drop constraint if exists exercise_attempts_formato;
alter table public.exercise_attempts add constraint exercise_attempts_formato
  check (
    char_length(exercise_id) <= 100
    and char_length(lesson_id) <= 100
    and coalesce(array_length(concepts, 1), 0) <= 20
    and hints_used <= 20
  ) not valid;

-- Recuperar a sequência: um consumível novo, e o teto de moedas que o conhece.
--
-- A recuperação cobre um dia perdido, comprada depois dele (no dia seguinte,
-- ou no outro se entre eles houve estudo), uma por semana. Quem conta isso é
-- o navegador (`src/client/lib/sequencia.ts`), como o congelamento: o banco
-- não sabe o dia local de ninguém.
--
-- O que o banco precisa saber: um dia coberto pode fechar um marco de
-- sequência (sete dias, trinta dias), e o marco rende moedas. O teto da 0009
-- já soma um dia por congelamento comprado; aqui ele passa a somar um por
-- recuperação também — senão uma compra legítima, depois de uma recuperação
-- que fechou um marco, seria recusada como acima do teto.
--
-- Idempotente, sem `… into variável` e sem cifrão dentro de texto, como as
-- outras (`migrations.test.ts` confere).

-- ------------------------------------------------------------ catálogo

-- Espelho de `ITENS` em `src/client/lib/economia.ts`.
insert into public.store_items (id, price, tipo) values
  ('recuperar-sequencia', 90, 'consumivel')
on conflict (id) do update
  set price = excluded.price,
      tipo = excluded.tipo;

-- ------------------------------------------------------------ teto

-- O mesmo cálculo da 0009, com as duas proteções da sequência no último termo.
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
  protecoes as (
    select count(*) as f
    from public.purchases
    where user_id = p_uid and item in ('congelar-sequencia', 'recuperar-sequencia')
  )
  select (
      coalesce((select aulas from progresso), 0) * 10
    + coalesce((select projetos from progresso), 0) * 40
    + dias.d * 2 * 2 * 15
    + dias.w * 2 * 2 * 50
    + ceil((dias.d * 2 + protecoes.f) / 7.0)::integer * (30 + 100)
  )::integer
  from dias, protecoes;
$$;

revoke all on function public.teto_de_moedas(uuid) from public, anon, authenticated;

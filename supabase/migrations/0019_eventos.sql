-- Registro de eventos: o que quebrou, onde, e com que frequência — sem PII.
--
-- Até aqui o único registro era o `console.error` no navegador de quem
-- estava estudando: ninguém ficava sabendo que o banco de dados de uma aula
-- não carregava, ou que uma leitura estourava o tempo toda noite (P2-18).
--
-- O que entra é só o que a lista branca de `src/client/lib/registro.ts`
-- deixa passar: o tipo do evento, a rota, a operação, o motor, o nome do
-- erro (`TypeError`), o código do Postgres, uma duração, o id do exercício.
-- **Nunca** a mensagem do erro (carrega o que o aluno escreveu, e às vezes
-- um e-mail), nem código, nem token. O banco confere de novo: chaves fora da
-- lista, ou mais de 1 KiB, são recusadas.
--
-- A tabela só recebe `insert` de quem está logado, da própria conta, e no
-- máximo 30 por minuto — o excesso é descartado em silêncio, para um laço de
-- erro na tela não virar enxurrada nem erro novo. Ninguém lê a tabela pela
-- API: a administração vê o agregado (`saude_da_plataforma`), por dia e por
-- tipo, sem saber quem.
--
-- Idempotente, sem `… into variável` e sem cifrão dentro de texto, como as
-- outras (`migrations.test.ts` confere).

create or replace function public.dados_de_evento_validos(d jsonb)
returns boolean
language sql
immutable
as $$
  select case
    when d is null or jsonb_typeof(d) <> 'object' then false
    when octet_length(d::text) > 1024 then false
    else not exists (
      select 1 from jsonb_object_keys(d) as k
       where k not in ('rota', 'operacao', 'motor', 'etapa', 'nome', 'codigo', 'duracao_ms', 'exercicio')
    )
  end
$$;

create table if not exists public.eventos (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  user_id uuid not null default auth.uid(),
  tipo text not null,
  dados jsonb not null default '{}'::jsonb
);

-- Espelho de `TIPOS_DE_EVENTO` em `registro.ts` (o teste de migrações confere).
alter table public.eventos drop constraint if exists eventos_tipo_check;
alter table public.eventos add constraint eventos_tipo_check
  check (tipo in (
    'erro_de_tela', 'erro_nao_tratado', 'promessa_rejeitada',
    'falha_de_leitura', 'falha_de_escrita', 'consulta_lenta', 'falha_do_motor'
  ));

alter table public.eventos drop constraint if exists eventos_dados_formato;
alter table public.eventos add constraint eventos_dados_formato
  check (public.dados_de_evento_validos(dados));

create index if not exists eventos_por_dia on public.eventos (criado_em);
create index if not exists eventos_por_pessoa on public.eventos (user_id, criado_em);

alter table public.eventos enable row level security;

drop policy if exists "eventos_insert_own" on public.eventos;
create policy "eventos_insert_own" on public.eventos
  for insert to authenticated
  with check (user_id = auth.uid());
-- Sem policy de select, update ou delete: pela API, ninguém lê nem apaga.

-- O Supabase dá tudo a `authenticated` por padrão; sem o revoke, o grant por
-- coluna não restringiria nada. Assim, o cliente só escreve `tipo` e `dados`:
-- `user_id` é sempre o `auth.uid()` do padrão, e ninguém lê pela API.
revoke all on public.eventos from anon, authenticated;
grant insert (tipo, dados) on public.eventos to authenticated;

-- ------------------------------------------------------------ ritmo

-- Mais de 30 por minuto da mesma pessoa: descartado em silêncio (return null).
-- Recusar com erro faria o registro gerar erro — o contrário do que se quer.
create or replace function public.limitar_eventos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recentes integer;
begin
  recentes := (
    select count(*) from public.eventos
     where user_id = new.user_id and criado_em > now() - interval '1 minute'
  );
  if recentes >= 30 then
    return null;
  end if;
  return new;
end;
$$;

revoke all on function public.limitar_eventos() from public, anon, authenticated;

drop trigger if exists limitar_eventos on public.eventos;
create trigger limitar_eventos
  before insert on public.eventos
  for each row execute function public.limitar_eventos();

-- ------------------------------------------------------------ saúde

-- O agregado para a administração: por dia, tipo e a chave que diz onde
-- (o motor, a operação, ou a rota), com quantos eventos e quantas pessoas —
-- nunca quem.
create or replace function public.saude_da_plataforma(p_dias integer default 14)
returns table (dia date, tipo text, chave text, eventos bigint, pessoas bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'apenas_admin' using errcode = '42501';
  end if;
  return query
    select (e.criado_em at time zone 'America/Sao_Paulo')::date as dia,
           e.tipo,
           coalesce(e.dados ->> 'motor', e.dados ->> 'operacao', e.dados ->> 'rota', '') as chave,
           count(*) as eventos,
           count(distinct e.user_id) as pessoas
      from public.eventos e
     where e.criado_em > now() - make_interval(days => least(greatest(p_dias, 1), 90))
     group by 1, 2, 3
     order by 1 desc, 4 desc;
end;
$$;

revoke all on function public.saude_da_plataforma(integer) from public, anon;
grant execute on function public.saude_da_plataforma(integer) to authenticated;

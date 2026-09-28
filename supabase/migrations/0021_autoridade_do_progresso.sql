-- A autoridade do progresso (P1-10 da auditoria).
--
-- Três portas que ainda deixavam o navegador decidir o que o banco guarda:
--
-- 1. A hora de uma tentativa ou revisão era a que o cliente mandasse. Uma
--    tentativa datada de ontem escapava do limite de ritmo da 0009 (ele conta
--    o último minuto), e cada dia inventado somava ao teto de moedas. Agora,
--    pela API, a hora é a do servidor. Quem insere direto no banco (as contas
--    de demonstração da 0008, a verificação) continua datando o que quiser.
-- 2. A policy da própria linha deixava o cliente regravar `completed_lessons`
--    e `completed_projects` inteiras, por fora da `concluir`. Agora o cliente
--    escreve em `users` só as colunas do perfil (o teste de migrações confere
--    que são as que `lib/perfil.ts` grava), e as listas só mudam pela
--    `concluir` — que passa a rodar como dona, e só sobre `auth.uid()`.
-- 3. A `concluir` aceitava qualquer id bem formado, e o teto contava todos:
--    mil aulas inventadas eram dez mil moedas. Agora cada lista tem um limite
--    acima do catálogo inteiro (400 aulas, 50 projetos — o teste confere que
--    o catálogo cabe), e o teto conta no máximo isso.
--
-- O que continua sendo do navegador, por desenho: a correção. O código do
-- aluno roda no navegador dele, então quem forja uma conclusão forja as
-- tentativas também. O banco não tenta adivinhar o acerto; ele garante que
-- o teto nunca passe do que o catálogo inteiro renderia a quem estudasse de
-- verdade, e que ninguém encha as tabelas por fora do ritmo.
--
-- Idempotente, sem `… into variável` e sem cifrão dentro de texto, como as
-- outras (`migrations.test.ts` confere).

-- ------------------------------------------------------------ 1. hora do servidor

/**
 * Pela API (`auth.uid()` presente), a hora da linha é a do servidor.
 * `security invoker`: não precisa de privilégio nenhum, só troca um campo.
 */
create or replace function public.hora_do_servidor()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is not null then
    new.created_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists hora_do_servidor on public.exercise_attempts;
create trigger hora_do_servidor
  before insert on public.exercise_attempts
  for each row execute function public.hora_do_servidor();

drop trigger if exists hora_do_servidor on public.flashcard_reviews;
create trigger hora_do_servidor
  before insert on public.flashcard_reviews
  for each row execute function public.hora_do_servidor();

-- ------------------------------------------------------------ 2. o que o cliente escreve em users

-- O Supabase dá tudo a `authenticated` por padrão: o grant por coluna só vale
-- depois do revoke (a 0019 aprendeu isso com `eventos`). O `id` entra porque
-- o upsert do perfil o manda; a policy da 0001 (`auth.uid() = id`) continua
-- impedindo tocar a linha de outra pessoa.
revoke insert, update on public.users from anon, authenticated;
grant insert (id, display_name, avatar, theme, accent, moldura, fundo, titulo, tema_editor, celebracao, icone_sequencia, adesivos)
  on public.users to authenticated;
grant update (id, display_name, avatar, theme, accent, moldura, fundo, titulo, tema_editor, celebracao, icone_sequencia, adesivos)
  on public.users to authenticated;

-- ------------------------------------------------------------ 3. concluir, como dona e com limite

/**
 * Se a lista de quem chama já está no limite e o id ainda não está nela.
 * Um id que já está passa sempre: concluir de novo não é erro. Os limites
 * ficam acima do catálogo inteiro (o teste de migrações confere).
 *
 * Função SQL à parte, e não um bloco dentro da `concluir`: o corpo da
 * `concluir` fica igual ao da 0009, que o editor do Supabase já aceitou.
 */
create or replace function public.lista_cheia(p_coluna text, p_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select not (p_id = any(lista)) and cardinality(lista) >= limite
      from (
        select
          case when p_coluna = 'completed_lessons' then completed_lessons else completed_projects end as lista,
          case when p_coluna = 'completed_lessons' then 400 else 50 end as limite
        from public.users
        where id = auth.uid() and p_coluna in ('completed_lessons', 'completed_projects')
      ) atual
  ), false);
$$;

revoke all on function public.lista_cheia(text, text) from public, anon, authenticated;

/**
 * A mesma `concluir` da 0009 — acrescenta sem duplicar e sem ler antes —,
 * agora `security definer` (o cliente não escreve mais nas listas) e sem
 * passar do limite de `lista_cheia`.
 */
create or replace function public.concluir(p_coluna text, p_id text)
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  lista text[];
begin
  if auth.uid() is null then
    raise exception 'sem_sessao' using errcode = '28000';
  end if;

  if p_id is null or p_id !~ '^[a-z0-9]' or p_id ~ '[^a-z0-9-]' or char_length(p_id) > 100 then
    raise exception 'id_invalido' using errcode = '22023';
  end if;

  if public.lista_cheia(p_coluna, p_id) then
    raise exception 'lista_cheia' using errcode = '54000';
  end if;

  if p_coluna = 'completed_lessons' then
    update public.users
       set completed_lessons = case
             when p_id = any(completed_lessons) then completed_lessons
             else array_append(completed_lessons, p_id)
           end
     where id = auth.uid();
    if not found then
      insert into public.users (id, completed_lessons) values (auth.uid(), array[p_id])
      on conflict (id) do update
        set completed_lessons = case
              when p_id = any(public.users.completed_lessons) then public.users.completed_lessons
              else array_append(public.users.completed_lessons, p_id)
            end;
    end if;
    lista := (select completed_lessons from public.users where id = auth.uid());
  elsif p_coluna = 'completed_projects' then
    update public.users
       set completed_projects = case
             when p_id = any(completed_projects) then completed_projects
             else array_append(completed_projects, p_id)
           end
     where id = auth.uid();
    if not found then
      insert into public.users (id, completed_projects) values (auth.uid(), array[p_id])
      on conflict (id) do update
        set completed_projects = case
              when p_id = any(public.users.completed_projects) then public.users.completed_projects
              else array_append(public.users.completed_projects, p_id)
            end;
    end if;
    lista := (select completed_projects from public.users where id = auth.uid());
  else
    raise exception 'coluna_invalida' using errcode = '22023';
  end if;

  return lista;
end;
$$;

revoke all on function public.concluir(text, text) from public, anon;
grant execute on function public.concluir(text, text) to authenticated;

-- ------------------------------------------------------------ teto

-- O mesmo cálculo da 0013, com as listas contadas até o limite da `concluir`
-- (uma lista antiga, de antes desta migração, também não passa dele).
create or replace function public.teto_de_moedas(p_uid uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  with progresso as (
    select
      least(coalesce(array_length(completed_lessons, 1), 0), 400) as aulas,
      least(coalesce(array_length(completed_projects, 1), 0), 50) as projetos
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

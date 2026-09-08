-- Administração: leitura ampla para quem tem papel de admin, e agregado de
-- desempenho por exercício.
--
-- Até aqui todas as policies eram "cada aluno vê o próprio dado". Um
-- administrador precisa enxergar o conjunto para responder à pergunta que o
-- §180 faz: quais exercícios a maioria erra? Sem isso não há como distinguir
-- "conteúdo difícil de propósito" de "enunciado mal escrito".

/**
 * Verifica se o usuário atual é admin.
 *
 * security definer de propósito: a função precisa ler public.users mesmo
 * quando a policy que a chama está avaliando outra tabela. O search_path fixo
 * evita que um schema no caminho de busca sequestre a consulta.
 */
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Admin lê todas as tentativas. A policy do aluno continua existindo: as duas
-- são avaliadas em OR, então cada um enxerga o que lhe cabe.
drop policy if exists "attempts_select_admin" on public.exercise_attempts;
create policy "attempts_select_admin" on public.exercise_attempts
  for select using (public.is_admin());

drop policy if exists "reviews_select_admin" on public.flashcard_reviews;
create policy "reviews_select_admin" on public.flashcard_reviews
  for select using (public.is_admin());

drop policy if exists "users_select_admin" on public.users;
create policy "users_select_admin" on public.users
  for select using (public.is_admin());

-- Nenhuma policy de escrita para admin: o papel serve para observar o uso, não
-- para alterar o progresso de alguém. Um administrador que pudesse editar
-- tentativas destruiria a confiabilidade de todo o histórico.

/**
 * Desempenho por exercício.
 *
 * É a base do §180: identificar conteúdo que a maioria erra, consome muitas
 * dicas ou exige muitas tentativas. Um exercício com taxa de acerto muito baixa
 * costuma ser enunciado ruim, não conceito difícil — e sem este número ninguém
 * descobre.
 */
create or replace view public.exercise_performance
with (security_invoker = true) as
select
  exercise_id,
  lesson_id,
  count(*) as attempts,
  count(*) filter (where correct) as correct_attempts,
  count(distinct user_id) as students,
  count(distinct user_id) filter (where correct) as students_solved,
  round(100.0 * count(*) filter (where correct) / nullif(count(*), 0), 1) as accuracy_percent,
  round(avg(hints_used), 2) as avg_hints_used,
  -- Quantas tentativas, em media, cada aluno precisou.
  round(count(*)::numeric / nullif(count(distinct user_id), 0), 2) as attempts_per_student,
  max(created_at) as last_attempt_at
from public.exercise_attempts
group by exercise_id, lesson_id;

comment on view public.exercise_performance is
  'Desempenho agregado por exercicio. Respeita RLS: aluno ve o proprio, admin ve tudo.';

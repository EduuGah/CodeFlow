-- Resumo por usuário: quantas aulas, exercícios e revisões cada aluno fez.
--
-- Deliberadamente uma VIEW, e não colunas de contador na tabela `users`.
-- Contadores denormalizados precisam ser incrementados em toda escrita e saem
-- de sincronia no primeiro erro de rede ou registro perdido — e ninguém
-- descobre, porque um número errado não quebra nada. Como o histórico completo
-- já está gravado, a contagem exata é uma agregação, sempre coerente com os
-- fatos que a originaram.
--
-- Consulta típica:
--   select * from public.user_summary;                    -- o próprio aluno
--   select * from public.user_summary order by exercises_solved desc;

create or replace view public.user_summary
with (security_invoker = true) as
select
  u.id as user_id,
  u.email,
  u.name,
  u.role,

  -- Trilha: vem das listas em `users`, mantidas pela conclusão de aula.
  coalesce(array_length(u.completed_lessons, 1), 0) as lessons_completed,
  coalesce(array_length(u.completed_projects, 1), 0) as projects_completed,

  -- Exercícios: derivados do histórico de tentativas.
  coalesce(a.attempts, 0) as exercise_attempts,
  coalesce(a.correct_attempts, 0) as correct_attempts,
  coalesce(a.exercises_solved, 0) as exercises_solved,
  -- Precisão em pontos percentuais; null quando não há tentativa, para não
  -- confundir "nunca tentou" com "errou tudo".
  case
    when coalesce(a.attempts, 0) = 0 then null
    else round(100.0 * a.correct_attempts / a.attempts, 1)
  end as accuracy_percent,
  coalesce(a.active_days, 0) as active_days,
  a.last_attempt_at,

  -- Revisão espaçada.
  coalesce(r.reviews, 0) as flashcard_reviews,
  coalesce(r.cards_reviewed, 0) as flashcards_seen,

  u.created_at

-- Não existe `last_login_at` aqui de propósito. Ela exigiria uma escrita a cada
-- login, e `last_attempt_at` acima responde melhor à pergunta que interessa:
-- entrar e não fazer nada não é atividade. O Supabase já guarda o último acesso
-- em `auth.users.last_sign_in_at`, mas juntar essa tabela quebraria a view para
-- o aluno, que não tem permissão de ler o schema `auth`.

from public.users u

left join (
  select
    user_id,
    count(*) as attempts,
    count(*) filter (where correct) as correct_attempts,
    count(distinct exercise_id) filter (where correct) as exercises_solved,
    count(distinct date(created_at)) as active_days,
    max(created_at) as last_attempt_at
  from public.exercise_attempts
  group by user_id
) a on a.user_id = u.id

left join (
  select
    user_id,
    count(*) as reviews,
    count(distinct flashcard_id) as cards_reviewed
  from public.flashcard_reviews
  group by user_id
) r on r.user_id = u.id;

-- security_invoker faz a view respeitar o RLS das tabelas de origem: cada aluno
-- só enxerga a própria linha. Sem isso, a view rodaria com os privilégios de
-- quem a criou e vazaria o progresso de todo mundo.
comment on view public.user_summary is
  'Resumo de atividade por aluno, agregado do historico. Respeita RLS via security_invoker.';

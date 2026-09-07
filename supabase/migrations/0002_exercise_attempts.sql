-- Histórico de tentativas de exercício.
--
-- Append-only de propósito: cada tentativa é um fato que aconteceu, e é da
-- sequência delas que sai taxa de acerto, erro recorrente e domínio por
-- conceito. Guardar apenas o estado final ("acertou") jogaria fora justamente
-- a informação que diz *como* o aluno chegou lá — se de primeira ou na quinta
-- tentativa, com dica ou sem.
create table if not exists public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  exercise_id text not null,
  lesson_id text not null,

  -- Copiados do conteúdo no momento da tentativa. Desnormalizado de propósito:
  -- se um exercício mudar de conceito depois, o histórico continua descrevendo
  -- o que o aluno de fato praticou naquele dia.
  concepts text[] not null default '{}',

  correct boolean not null,
  -- Quantas dicas estavam reveladas quando respondeu. Acertar sem dica e
  -- acertar na quarta dica são evidências de domínio bem diferentes.
  hints_used integer not null default 0 check (hints_used >= 0),

  created_at timestamptz not null default now()
);

-- Consultas do painel: sempre "as tentativas deste aluno", por data.
create index if not exists exercise_attempts_user_created_idx
  on public.exercise_attempts (user_id, created_at desc);

alter table public.exercise_attempts enable row level security;

-- Autorização: o aluno só enxerga e grava as próprias tentativas.
drop policy if exists "attempts_select_own" on public.exercise_attempts;
create policy "attempts_select_own" on public.exercise_attempts
  for select using (auth.uid() = user_id);

drop policy if exists "attempts_insert_own" on public.exercise_attempts;
create policy "attempts_insert_own" on public.exercise_attempts
  for insert with check (auth.uid() = user_id);

-- Sem policy de update nem delete: histórico não se reescreve. Um aluno que
-- pudesse apagar os próprios erros destruiria a base do sistema de revisão.

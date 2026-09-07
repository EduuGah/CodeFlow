-- Histórico de revisões de flashcard.
--
-- Mesma escolha da tabela de tentativas: append-only, e o estado atual do cartão
-- (intervalo, próxima data) é derivado da sequência. Guardar só "próxima
-- revisão em 7 dias" perderia como o aluno chegou ali, que é justamente o que
-- permite recalibrar o modelo depois.
create table if not exists public.flashcard_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  flashcard_id text not null,

  -- Autoavaliação do aluno ao ver a resposta.
  rating text not null check (rating in ('dificil', 'medio', 'facil')),

  created_at timestamptz not null default now()
);

create index if not exists flashcard_reviews_user_card_idx
  on public.flashcard_reviews (user_id, flashcard_id, created_at desc);

alter table public.flashcard_reviews enable row level security;

drop policy if exists "reviews_select_own" on public.flashcard_reviews;
create policy "reviews_select_own" on public.flashcard_reviews
  for select using (auth.uid() = user_id);

drop policy if exists "reviews_insert_own" on public.flashcard_reviews;
create policy "reviews_insert_own" on public.flashcard_reviews
  for insert with check (auth.uid() = user_id);

-- Sem update nem delete: histórico de estudo não se reescreve.

-- Perfil editável, loja de moedas e foto de perfil.
--
-- Três coisas que a versão anterior não tinha, todas pedidas pelo dono do
-- projeto depois de usar a plataforma:
--
-- 1. O aluno escolhe o próprio nome e a própria foto. `name` e `avatar_url`
--    continuam sendo o que veio do Google no primeiro login; `display_name` e
--    `avatar` são o que a pessoa escolheu, e valem por cima quando existem.
-- 2. Preferências de aparência (modo escuro, cor de destaque) viajam com a
--    conta, para o celular e o computador abrirem do mesmo jeito.
-- 3. A loja. As moedas **ganhas** são derivadas do histórico, como o XP — não
--    há saldo guardado. O que precisa de tabela é o que foi **gasto**: cada
--    compra é um fato, append-only, e o saldo é ganhas menos gastas.

-- ------------------------------------------------------------ perfil
alter table public.users add column if not exists display_name text;
-- `preset:<id>` para um avatar desenhado da plataforma, ou a URL pública da
-- foto enviada para o Storage.
alter table public.users add column if not exists avatar text;
alter table public.users add column if not exists theme text
  check (theme in ('sistema', 'claro', 'escuro'));
alter table public.users add column if not exists accent text
  check (accent in ('floresta', 'oceano', 'brasa', 'ameixa'));

-- ------------------------------------------------------------ compras
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- O id do item no catálogo da aplicação (`lib/economia.ts`): o preço vem
  -- copiado para o histórico dizer quanto custou na época, mesmo que mude.
  item text not null,
  price integer not null check (price >= 0),
  created_at timestamptz not null default now()
);

create index if not exists purchases_user_created_idx
  on public.purchases (user_id, created_at desc);

alter table public.purchases enable row level security;

drop policy if exists "purchases_select_own" on public.purchases;
create policy "purchases_select_own" on public.purchases
  for select using (auth.uid() = user_id);

drop policy if exists "purchases_insert_own" on public.purchases;
create policy "purchases_insert_own" on public.purchases
  for insert with check (auth.uid() = user_id);

-- Sem update nem delete: compra feita é fato. Quem pudesse apagar a própria
-- compra teria o item e as moedas de volta.

-- ------------------------------------------------------------ fotos
-- Um bucket público para leitura (a foto aparece em qualquer tela sem token)
-- e restrito para escrita: cada pessoa só grava dentro da própria pasta,
-- `<uid>/...`. As fotos chegam redimensionadas pelo navegador (256 px), então
-- o limite de tamanho é folgado.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_write_own_folder" on storage.objects;
create policy "avatars_write_own_folder" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_update_own_folder" on storage.objects;
create policy "avatars_update_own_folder" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_delete_own_folder" on storage.objects;
create policy "avatars_delete_own_folder" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

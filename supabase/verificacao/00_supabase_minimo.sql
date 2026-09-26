-- O mínimo do Supabase que as migrações tocam, num Postgres comum.
--
-- Não é o Supabase: é o suficiente para as migrações rodarem de verdade — e
-- não só serem lidas por regex — e para a verificação de comportamento
-- (`10_comportamento.sql`) exercitar RLS, funções e gatilhos com os papéis
-- que a API usa. Cada peça imita o que o Supabase cria num projeto novo:
--
-- - os papéis `anon`, `authenticated` e `service_role`, com os privilégios
--   padrão que o Supabase concede no schema `public` (a autorização de verdade
--   fica com o RLS, como lá);
-- - `auth.uid()` e `auth.jwt()`, lidos de `request.jwt.claims`, que é onde o
--   PostgREST põe o token de quem chama;
-- - `auth.users` e `auth.identities` com as colunas que 0001, 0008 e 0009 usam;
-- - `storage.buckets`, `storage.objects` (com RLS) e `storage.foldername`;
-- - o `pgcrypto` no schema `extensions`.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end;
$$;

create schema if not exists extensions;
create extension if not exists pgcrypto schema extensions;

-- ------------------------------------------------------------ auth
create schema if not exists auth;

create table if not exists auth.users (
  instance_id uuid,
  id uuid primary key,
  aud text,
  role text,
  email text,
  encrypted_password text,
  email_confirmed_at timestamptz,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  confirmation_token text,
  recovery_token text,
  email_change_token_new text,
  email_change text,
  email_change_token_current text,
  phone text,
  phone_change text,
  phone_change_token text,
  reauthentication_token text,
  banned_until timestamptz
);

create table if not exists auth.identities (
  id uuid primary key,
  user_id uuid references auth.users (id) on delete cascade,
  provider_id text,
  provider text,
  identity_data jsonb,
  last_sign_in_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
);

create or replace function auth.jwt() returns jsonb
language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb;
$$;

create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(auth.jwt() ->> 'sub', '')::uuid;
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid(), auth.jwt() to anon, authenticated, service_role;

-- ------------------------------------------------------------ storage
create schema if not exists storage;

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text not null,
  owner uuid default auth.uid(),
  created_at timestamptz default now()
);
alter table storage.objects enable row level security;

create or replace function storage.foldername(name text) returns text[]
language plpgsql immutable as $$
declare
  partes text[];
begin
  partes := string_to_array(name, '/');
  return partes[1:array_length(partes, 1) - 1];
end;
$$;

grant usage on schema storage to anon, authenticated, service_role;
grant all on all tables in schema storage to anon, authenticated, service_role;
grant execute on function storage.foldername(text) to anon, authenticated, service_role;

-- ------------------------------------------------------------ public
-- Os privilégios padrão de um projeto Supabase: tudo em `public` é acessível
-- aos papéis da API, e quem decide o que cada um vê é o RLS.
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

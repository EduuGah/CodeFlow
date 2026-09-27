-- Loja 2.0: molduras e fundos (categorias novas), três cores de destaque
-- novas, e o que o perfil guarda de tudo isso.
--
-- A compra continua sendo só a `comprar_item` da 0009: ela lê o preço de
-- `store_items`, recusa cosmético repetido e o gasto acima do teto. O que
-- muda aqui é o catálogo — duas categorias novas e os itens delas — e duas
-- colunas no perfil para o que a pessoa equipou.
--
-- Equipar ainda não é conferido no banco: moldura e fundo só mudam a
-- aparência da própria pessoa. A conferência de posse entra quando alguma
-- categoria precisar dela (o `equipar()` do roadmap da Loja 2.0).
--
-- Idempotente, como as outras: pode rodar de novo. Sem `… into variável` e
-- sem cifrão dentro de texto — o SQL Editor do Supabase se confunde com as
-- duas coisas (`migrations.test.ts` confere).

-- ------------------------------------------------------------ catálogo

-- A checagem do tipo nasceu na 0009 com três categorias; aqui ganha duas.
alter table public.store_items drop constraint if exists store_items_tipo_check;
alter table public.store_items add constraint store_items_tipo_check
  check (tipo in ('consumivel', 'tema', 'avatar', 'moldura', 'fundo'));

-- Espelho de `ITENS` em `src/client/lib/economia.ts` (o teste de migrações
-- confere preço e tipo de cada um).
insert into public.store_items (id, price, tipo) values
  ('moldura-minimal', 90, 'moldura'),
  ('moldura-terminal', 110, 'moldura'),
  ('moldura-pixel', 140, 'moldura'),
  ('moldura-neon', 170, 'moldura'),
  ('moldura-ouro', 240, 'moldura'),
  ('fundo-grade', 100, 'fundo'),
  ('fundo-circuito', 150, 'fundo'),
  ('fundo-por-do-sol', 180, 'fundo'),
  ('fundo-aurora', 220, 'fundo'),
  ('tema-grafite', 130, 'tema'),
  ('tema-meia-noite', 170, 'tema'),
  ('tema-crepusculo', 220, 'tema')
on conflict (id) do update
  set price = excluded.price,
      tipo = excluded.tipo;

-- ------------------------------------------------------------ perfil

-- As cores de destaque que o perfil aceita: as quatro da 0007 e as três
-- novas (`src/client/lib/tema.ts`).
alter table public.users drop constraint if exists users_accent_check;
alter table public.users add constraint users_accent_check
  check (accent in ('floresta', 'oceano', 'brasa', 'ameixa', 'grafite', 'meia-noite', 'crepusculo'));

-- O id curto do que está equipado (`neon`, `aurora`), ou nulo.
alter table public.users add column if not exists moldura text;
alter table public.users add column if not exists fundo text;

alter table public.users drop constraint if exists users_moldura_formato;
alter table public.users add constraint users_moldura_formato
  check (moldura is null or (moldura <> '' and moldura !~ '[^a-z0-9-]' and char_length(moldura) <= 40));

alter table public.users drop constraint if exists users_fundo_formato;
alter table public.users add constraint users_fundo_formato
  check (fundo is null or (fundo <> '' and fundo !~ '[^a-z0-9-]' and char_length(fundo) <= 40));

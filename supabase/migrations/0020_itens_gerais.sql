-- Itens gerais: quatro categorias novas na loja, e onde o perfil as guarda.
--
-- - `editor`: o tema do editor de código (as cores do código nas aulas);
-- - `celebracao`: o efeito ao concluir uma aula ou projeto;
-- - `sequencia`: o ícone da sequência de dias;
-- - `adesivo`: até três adesivos no cabeçalho do perfil.
--
-- Todas só mudam a aparência da própria pessoa, como a moldura e o fundo
-- (0011): equipar não é conferido no banco. A compra continua sendo a
-- `comprar_item` da 0009, com o preço daqui.
--
-- Idempotente, sem `… into variável` e sem cifrão dentro de texto, como as
-- outras (`migrations.test.ts` confere). Pode rodar de novo — e deve, se o
-- arquivo tiver crescido desde a última vez: cada categoria acrescenta os
-- itens dela aqui.

-- ------------------------------------------------------------ catálogo

alter table public.store_items drop constraint if exists store_items_tipo_check;
alter table public.store_items add constraint store_items_tipo_check
  check (tipo in ('consumivel', 'tema', 'avatar', 'moldura', 'fundo', 'editor', 'celebracao', 'sequencia', 'adesivo'));

-- Espelho de `ITENS` em `src/client/lib/economia.ts` (o teste de migrações
-- confere preço e tipo de cada um). O padrão e o alto contraste do editor são
-- de todo mundo e não estão à venda.
insert into public.store_items (id, price, tipo) values
  ('editor-noturno', 60, 'editor'),
  ('editor-papel', 130, 'editor'),
  ('editor-floresta', 300, 'editor'),
  ('editor-giz', 420, 'editor'),
  ('editor-neon', 800, 'editor')
on conflict (id) do update
  set price = excluded.price,
      tipo = excluded.tipo;

-- ------------------------------------------------------------ perfil

alter table public.users add column if not exists tema_editor text;
alter table public.users add column if not exists celebracao text;
alter table public.users add column if not exists icone_sequencia text;
alter table public.users add column if not exists adesivos text[];

-- O id curto, como a moldura: letras minúsculas, dígitos e hífen.
alter table public.users drop constraint if exists users_tema_editor_formato;
alter table public.users add constraint users_tema_editor_formato
  check (tema_editor is null or (tema_editor <> '' and tema_editor !~ '[^a-z0-9-]' and char_length(tema_editor) <= 40));

alter table public.users drop constraint if exists users_celebracao_formato;
alter table public.users add constraint users_celebracao_formato
  check (celebracao is null or (celebracao <> '' and celebracao !~ '[^a-z0-9-]' and char_length(celebracao) <= 40));

alter table public.users drop constraint if exists users_icone_sequencia_formato;
alter table public.users add constraint users_icone_sequencia_formato
  check (icone_sequencia is null or (icone_sequencia <> '' and icone_sequencia !~ '[^a-z0-9-]' and char_length(icone_sequencia) <= 40));

-- Até três, cada um no formato de id. Sem subconsulta num `check`, a lista é
-- conferida junta: unida por vírgula, só tem o formato dos ids e vírgulas; e
-- separada de novo, dá os mesmos tantos — um elemento com vírgula dentro daria
-- mais, um nulo (que a união pula) daria menos.
alter table public.users drop constraint if exists users_adesivos_formato;
alter table public.users add constraint users_adesivos_formato
  check (
    adesivos is null
    or (
      coalesce(array_ndims(adesivos), 1) = 1
      and cardinality(adesivos) <= 3
      and array_position(adesivos, '') is null
      and array_to_string(adesivos, ',') !~ '[^a-z0-9,-]'
      and cardinality(string_to_array(array_to_string(adesivos, ','), ',')) = cardinality(adesivos)
      and char_length(array_to_string(adesivos, ',')) <= 125
    )
  );

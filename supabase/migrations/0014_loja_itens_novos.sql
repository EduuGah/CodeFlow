-- Itens novos na loja: quatro avatares, duas molduras, dois fundos.
--
-- Só catálogo: as categorias e as colunas do perfil já existem (0007, 0011),
-- e a compra continua sendo a `comprar_item` da 0009, que lê o preço daqui.
-- Os desenhos moram no navegador (`ui/Avatar`, `ui/Moldura`, `ui/Fundo`).
--
-- Idempotente, como as outras: pode rodar de novo.

-- Espelho de `ITENS` em `src/client/lib/economia.ts` (o teste de migrações
-- confere preço e tipo de cada um).
insert into public.store_items (id, price, tipo) values
  ('avatar-capivara', 110, 'avatar'),
  ('avatar-tucano', 130, 'avatar'),
  ('avatar-tartaruga', 140, 'avatar'),
  ('avatar-baleia', 160, 'avatar'),
  ('moldura-chaves', 150, 'moldura'),
  ('moldura-prisma', 200, 'moldura'),
  ('fundo-terminal', 120, 'fundo'),
  ('fundo-mar', 200, 'fundo')
on conflict (id) do update
  set price = excluded.price,
      tipo = excluded.tipo;

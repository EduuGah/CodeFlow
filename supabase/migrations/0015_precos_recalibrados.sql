-- Preços recalibrados: o preço de um cosmético sai do nível que o abre.
--
-- A tabela é `PRECO_DO_NIVEL` em `src/client/lib/economia.ts`, calibrada pelo
-- aluno-modelo em `economia.calibragem.test.ts` (as contas de verdade sobre o
-- catálogo de verdade, em cinco datas de início). Duas regras:
--
-- - nenhum cosmético abre pelo nível antes de caber no saldo — o Tema Oceano
--   custava 120 e abria no segundo dia, então comprá-lo era jogar moeda fora;
-- - do nível 6 em diante, comprar encurta a espera de verdade, e os últimos
--   custam semanas: é para onde as moedas vão depois do começo.
--
-- Só muda o preço de agora em diante. Uma compra já feita guarda o preço que
-- foi pago (`purchases.price`), e o histórico e o saldo contam com ele. Nenhum
-- nível subiu: ninguém perde o que já abriu.
--
-- Idempotente, como as outras: pode rodar de novo.

-- Espelho de `ITENS` (o teste de migrações confere preço e tipo de cada um).
insert into public.store_items (id, price, tipo) values
  ('tema-oceano', 10, 'tema'),
  ('tema-grafite', 60, 'tema'),
  ('tema-brasa', 90, 'tema'),
  ('tema-meia-noite', 160, 'tema'),
  ('tema-ameixa', 300, 'tema'),
  ('tema-crepusculo', 420, 'tema'),
  ('avatar-cometa', 60, 'avatar'),
  ('avatar-raposa', 90, 'avatar'),
  ('avatar-coelho', 90, 'avatar'),
  ('avatar-urso', 130, 'avatar'),
  ('avatar-dino', 160, 'avatar'),
  ('avatar-panda', 300, 'avatar'),
  ('avatar-capivara', 350, 'avatar'),
  ('avatar-robo', 420, 'avatar'),
  ('avatar-tucano', 600, 'avatar'),
  ('avatar-polvo', 680, 'avatar'),
  ('avatar-tartaruga', 800, 'avatar'),
  ('avatar-alien', 1100, 'avatar'),
  ('avatar-baleia', 1400, 'avatar'),
  ('moldura-minimal', 10, 'moldura'),
  ('moldura-terminal', 60, 'moldura'),
  ('moldura-pixel', 130, 'moldura'),
  ('moldura-neon', 300, 'moldura'),
  ('moldura-chaves', 350, 'moldura'),
  ('moldura-ouro', 680, 'moldura'),
  ('moldura-prisma', 950, 'moldura'),
  ('fundo-grade', 10, 'fundo'),
  ('fundo-terminal', 90, 'fundo'),
  ('fundo-circuito', 130, 'fundo'),
  ('fundo-por-do-sol', 350, 'fundo'),
  ('fundo-aurora', 600, 'fundo'),
  ('fundo-mar', 800, 'fundo')
on conflict (id) do update
  set price = excluded.price,
      tipo = excluded.tipo;

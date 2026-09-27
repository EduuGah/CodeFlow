-- Itens só por moedas: quatro épicos sem nível que os abra.
--
-- O nível abre o último cosmético lá pela semana 13 de quem estuda no ritmo
-- do aluno-modelo; dali em diante as moedas só tinham os consumíveis (P2-16).
-- Estes são o destino delas: custam de 5 a 7 semanas cada, e o teste de
-- calibragem (`economia.calibragem.test.ts`) cobra que somem semanas de
-- estudo. Só catálogo: a compra é a mesma `comprar_item` da 0009.
--
-- Idempotente, como as outras: pode rodar de novo.

-- Espelho de `ITENS` em `src/client/lib/economia.ts`.
insert into public.store_items (id, price, tipo) values
  ('avatar-dragao', 1500, 'avatar'),
  ('avatar-fenix', 1400, 'avatar'),
  ('moldura-engrenagens', 1200, 'moldura'),
  ('fundo-cidade', 1300, 'fundo')
on conflict (id) do update
  set price = excluded.price,
      tipo = excluded.tipo;

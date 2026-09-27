-- Sazonais: o primeiro item com janela de venda.
--
-- As colunas `disponivel_de`/`disponivel_ate` existem desde a 0009, e a
-- `comprar_item` já recusa fora delas ("item_indisponivel"). O que entra aqui
-- é o primeiro item que as usa, espelho de `ITENS` em `economia.ts` — onde a
-- mesma janela esconde o item da loja fora dela.
--
-- Um sazonal só se compra com moedas, só na janela, e não abre por nível.
-- Quem comprou fica com ele depois. A janela não se repete sozinha: não há
-- sistema de eventos, e o texto da loja não promete volta.
--
-- Idempotente, como as outras: pode rodar de novo.

insert into public.store_items (id, price, tipo) values
  ('fundo-fogos', 400, 'fundo')
on conflict (id) do update
  set price = excluded.price,
      tipo = excluded.tipo;

-- De 15/12/2026 a 15/01/2027, no horário de Brasília (o fim é exclusivo).
update public.store_items
   set disponivel_de = '2026-12-15T03:00:00Z',
       disponivel_ate = '2027-01-16T03:00:00Z'
 where id = 'fundo-fogos';

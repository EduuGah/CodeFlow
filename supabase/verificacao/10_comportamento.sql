-- O que as migrações prometem, conferido num Postgres de verdade.
--
-- Roda depois de `00_supabase_minimo.sql` e das migrações. Cada verificação
-- entra no papel que a API usaria (`authenticated` com o `sub` de alguém, ou
-- `anon`) e confere o que acontece — o RLS, as funções e os gatilhos de
-- verdade, não uma leitura do texto do SQL. Qualquer falha interrompe o
-- script com "FALHOU: <o quê>".
--
-- Tudo acontece dentro de uma transação desfeita no fim: o banco sai como
-- entrou, e o script pode rodar de novo.

begin;

create schema verificacao;
grant usage on schema verificacao to anon, authenticated;

create function verificacao.ok(condicao boolean, mensagem text) returns void
language plpgsql as $$
begin
  if condicao is not true then
    raise exception 'FALHOU: %', mensagem;
  end if;
end;
$$;

/** Roda `comando` como quem está no papel atual e exige que ele falhe com `esperado`. */
create function verificacao.recusa(comando text, esperado text, mensagem text) returns void
language plpgsql as $$
declare
  lancou boolean := false;
  erro text;
begin
  begin
    execute comando;
  exception when others then
    lancou := true;
    erro := sqlerrm;
  end;
  if not lancou then
    raise exception 'FALHOU: % (não foi recusado)', mensagem;
  end if;
  if erro not ilike '%' || esperado || '%' then
    raise exception 'FALHOU: % (esperado "%", veio "%")', mensagem, esperado, erro;
  end if;
end;
$$;

grant execute on all functions in schema verificacao to anon, authenticated;

-- ------------------------------------------------------------ as pessoas
-- A: aluno com 20 aulas concluídas (200 moedas de teto, sem atividade).
-- B: aluno novo. C: conta sem linha em public.users. D: o do ritmo.
-- E: conta sem nada — nem aula, nem atividade. ADM: administrador.
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-4000-8000-00000000000a', 'a@teste.local', '{"full_name": "Aluno A"}'),
  ('00000000-0000-4000-8000-00000000000b', 'b@teste.local', '{"full_name": "Aluno B"}'),
  ('00000000-0000-4000-8000-00000000000c', 'c@teste.local', '{}'),
  ('00000000-0000-4000-8000-00000000000d', 'd@teste.local', '{}'),
  ('00000000-0000-4000-8000-00000000000e', 'e@teste.local', '{}'),
  ('00000000-0000-4000-8000-0000000000ad', 'adm@teste.local', '{}');

delete from public.users where id = '00000000-0000-4000-8000-00000000000c';
update public.users
   set completed_lessons = array(select 'aula-' || n from generate_series(1, 20) n)
 where id = '00000000-0000-4000-8000-00000000000a';
select public.set_user_role('adm@teste.local', 'admin');

-- Tentativas antigas de C e D no mesmo exercício, para o painel agregar. Não
-- em A nem em B: atividade soma ao teto de moedas, e os testes da compra
-- contam com A = 200 exatas e B = 0.
insert into public.exercise_attempts (user_id, exercise_id, lesson_id, correct, created_at) values
  ('00000000-0000-4000-8000-00000000000c', 'ex-1', 'aula-1', false, now() - interval '400 days'),
  ('00000000-0000-4000-8000-00000000000c', 'ex-1', 'aula-1', true, now() - interval '400 days'),
  ('00000000-0000-4000-8000-00000000000d', 'ex-1', 'aula-1', false, now() - interval '400 days');

-- ------------------------------------------------------------ concluir
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-00000000000b", "email": "b@teste.local"}', true);

select public.concluir('completed_lessons', 'lesson-js-1');
select public.concluir('completed_lessons', 'lesson-js-1');
select public.concluir('completed_lessons', 'lesson-js-2');
select public.concluir('completed_projects', 'proj-js-imc');
select verificacao.ok(
  (select completed_lessons from public.users where id = auth.uid()) = array['lesson-js-1', 'lesson-js-2'],
  'concluir acrescenta sem duplicar'
);
select verificacao.ok(
  (select completed_projects from public.users where id = auth.uid()) = array['proj-js-imc'],
  'concluir projeto'
);
select verificacao.recusa($$select public.concluir('completed_lessons', 'Aula Inventada!')$$, 'id_invalido', 'id fora do formato do catálogo');
select verificacao.recusa($$select public.concluir('completed_lessons', '-comeca-com-hifen')$$, 'id_invalido', 'id que não começa por letra ou dígito');
select verificacao.recusa($$select public.concluir('completed_lessons', repeat('a', 101))$$, 'id_invalido', 'id acima de 100 caracteres');
select verificacao.recusa($$select public.concluir('completed_lessons', '')$$, 'id_invalido', 'id vazio');
select public.concluir('completed_lessons', repeat('a', 100));
select verificacao.ok(
  (select repeat('a', 100) = any(completed_lessons) from public.users where id = auth.uid()),
  'id de 100 caracteres ainda vale'
);
select verificacao.recusa($$select public.concluir('role', 'admin')$$, 'coluna_invalida', 'concluir só mexe nas duas listas');

-- Autopromoção continua barrada.
update public.users set role = 'admin' where id = auth.uid();
select verificacao.ok((select role from public.users where id = auth.uid()) = 'student', 'aluno não se promove a admin');

-- C não tem linha em public.users: concluir cria.
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-00000000000c", "email": "c@teste.local"}', true);
select public.concluir('completed_lessons', 'lesson-js-1');
select verificacao.ok(
  (select completed_lessons from public.users where id = auth.uid()) = array['lesson-js-1'],
  'concluir cria a linha que faltava'
);

-- ------------------------------------------------------------ comprar
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-00000000000a", "email": "a@teste.local"}', true);

select verificacao.recusa(
  $$insert into public.purchases (user_id, item, price) values (auth.uid(), 'tema-oceano', 0)$$,
  'row-level security', 'o INSERT direto em purchases não existe mais'
);

select public.comprar_item('tema-brasa');
select verificacao.ok(
  (select price from public.purchases where user_id = auth.uid() and item = 'tema-brasa') = 90,
  'o preço vem do catálogo do banco (o da 0015, a mais nova)'
);
select verificacao.recusa($$select public.comprar_item('tema-brasa')$$, 'item_ja_possuido', 'cosmético não se compra duas vezes');
select public.comprar_item('dobro-de-xp');
-- 90 + 80 = 170 de um teto de 200. O congelamento (60) passaria dele.
select verificacao.recusa($$select public.comprar_item('congelar-sequencia')$$, 'saldo_insuficiente', 'gasto acima do teto');
select verificacao.recusa($$select public.comprar_item('item-que-nao-existe')$$, 'item_indisponivel', 'item fora do catálogo');

-- E não tem aula concluída nem atividade: teto zero.
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-00000000000e", "email": "e@teste.local"}', true);
select verificacao.recusa($$select public.comprar_item('congelar-sequencia')$$, 'saldo_insuficiente', 'moeda sem estudo não existe');

-- O teto por fora: só funções do banco o chamam.
select verificacao.recusa($$select public.teto_de_moedas(auth.uid())$$, 'permission denied', 'teto não é chamável pela API');

reset role;

-- O teto conta a recuperação da sequência (0013) como conta o congelamento:
-- um dia coberto a mais, que pode fechar um marco. D tem um dia de atividade:
-- 1·2·2·15 + 1·2·2·50 + ceil(2/7)·130 = 390; com seis proteções, ceil(8/7) = 2.
select verificacao.ok(public.teto_de_moedas('00000000-0000-4000-8000-00000000000d') = 390, 'teto de D sem proteções');
insert into public.purchases (user_id, item, price)
  select '00000000-0000-4000-8000-00000000000d', 'recuperar-sequencia', 90 from generate_series(1, 6);
select verificacao.ok(
  public.teto_de_moedas('00000000-0000-4000-8000-00000000000d') = 520,
  'recuperação soma ao teto como o congelamento'
);
delete from public.purchases where user_id = '00000000-0000-4000-8000-00000000000d';
select verificacao.ok(
  (select price from public.store_items where id = 'recuperar-sequencia') = 90,
  'recuperar a sequência está no catálogo'
);
-- O sazonal (0016) chega com a janela; fora dela a compra é recusada pelo
-- mesmo caminho do avatar-cometa, logo abaixo. A conferência não depende da
-- data em que roda.
select verificacao.ok(
  (select disponivel_de = '2026-12-15T03:00:00Z' and disponivel_ate = '2027-01-16T03:00:00Z'
     from public.store_items where id = 'fundo-fogos'),
  'o sazonal tem a janela de dezembro a janeiro'
);

-- Fora da janela de disponibilidade, o item não se vende.
update public.store_items set disponivel_ate = now() - interval '1 day' where id = 'avatar-cometa';
update public.users set completed_lessons = array(select 'aula-' || n from generate_series(1, 50) n)
 where id = '00000000-0000-4000-8000-00000000000b';
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-00000000000b", "email": "b@teste.local"}', true);
select verificacao.recusa($$select public.comprar_item('avatar-cometa')$$, 'item_indisponivel', 'item sazonal fora da janela');
select public.comprar_item('avatar-raposa');
select verificacao.ok(
  (select count(*) from public.purchases where user_id = auth.uid()) = 1,
  'dentro da janela, com saldo, compra'
);
-- A função devolve a linha gravada (relida pelo id, sem `returning` numa variável).
select verificacao.ok(
  (select (c).item = 'moldura-neon' and (c).price = 300 from (select public.comprar_item('moldura-neon') as c) x),
  'comprar moldura devolve a compra com o preço do catálogo'
);
select verificacao.recusa($$select public.comprar_item('moldura-neon')$$, 'item_ja_possuido', 'moldura também se compra uma vez');
select public.comprar_item('fundo-grade');
select verificacao.ok(
  (select count(*) from public.purchases where user_id = auth.uid()) = 3,
  'fundo se compra como os outros cosméticos'
);

-- ------------------------------------------------------------ admin
-- Aluno: o agregado não responde, e só a própria linha é visível.
select verificacao.ok((select count(*) from public.desempenho_por_exercicio()) = 0, 'aluno não vê o agregado');
select verificacao.ok((select count(*) from public.users) = 1, 'aluno vê só a própria linha');

select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-0000000000ad", "email": "adm@teste.local"}', true);
select verificacao.ok(
  (select students from public.desempenho_por_exercicio() where exercise_id = 'ex-1') = 2,
  'admin vê o agregado de todos'
);
select verificacao.ok((select count(*) from public.users) = 1, 'admin NÃO lê a linha (e-mail, nome) de mais ninguém');
select verificacao.ok((select count(*) from public.exercise_attempts) = 0, 'admin NÃO lê as tentativas cruas dos outros');

-- Admin da loja (0017): tira da venda e devolve; a compra respeita.
select public.definir_item_ativo('avatar-urso', false);
select verificacao.ok((select not ativo from public.store_items where id = 'avatar-urso'), 'admin tira um item da venda');
select verificacao.recusa(
  $$select public.definir_item_ativo('item-que-nao-existe', false)$$,
  'item_desconhecido', 'item fora do catálogo do banco'
);
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-00000000000b", "email": "b@teste.local"}', true);
select verificacao.recusa($$select public.comprar_item('avatar-urso')$$, 'item_indisponivel', 'item fora da venda não se compra');
select verificacao.recusa(
  $$select public.definir_item_ativo('avatar-urso', true)$$,
  'apenas_admin', 'aluno não mexe na loja'
);
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-0000000000ad", "email": "adm@teste.local"}', true);
select public.definir_item_ativo('avatar-urso', true);
select verificacao.ok((select ativo from public.store_items where id = 'avatar-urso'), 'admin devolve o item à venda');
-- Nem com o papel de admin a escrita direta passa: não há policy de escrita.
update public.store_items set ativo = false where id = 'avatar-urso';
select verificacao.ok((select ativo from public.store_items where id = 'avatar-urso'), 'a loja não muda por UPDATE direto');

-- ------------------------------------------------------------ eventos (0019)
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-00000000000b", "email": "b@teste.local"}', true);
insert into public.eventos (tipo, dados) values ('falha_de_leitura', '{"operacao": "fetchAttempts", "codigo": "57014"}');
select verificacao.recusa($$select count(*) from public.eventos$$, 'permission denied', 'o aluno grava o evento e não lê nenhum (nem o próprio)');
select verificacao.recusa(
  $$insert into public.eventos (tipo, dados) values ('falha_de_leitura', '{"mensagem": "aluno@exemplo.com"}')$$,
  'eventos_dados_formato', 'chave fora da lista branca'
);
select verificacao.recusa(
  $$insert into public.eventos (tipo, dados) values ('falha_de_leitura', jsonb_build_object('rota', repeat('a', 1100)))$$,
  'eventos_dados_formato', 'evento acima de 1 KiB'
);
select verificacao.recusa(
  $$insert into public.eventos (tipo, dados) values ('qualquer_coisa', '{}')$$,
  'eventos_tipo_check', 'tipo que não existe'
);
select verificacao.recusa(
  $$insert into public.eventos (user_id, tipo, dados) values ('00000000-0000-4000-8000-00000000000a', 'erro_de_tela', '{}')$$,
  'permission denied', 'evento em nome de outra pessoa'
);
-- Um laço de erro na tela: o excesso some em silêncio, sem erro de volta.
insert into public.eventos (tipo, dados) select 'erro_de_tela', '{}' from generate_series(1, 40);
select verificacao.recusa($$select public.saude_da_plataforma(14)$$, 'apenas_admin', 'aluno não lê a saúde');

select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-0000000000ad", "email": "adm@teste.local"}', true);
select verificacao.ok(
  (select sum(eventos) from public.saude_da_plataforma(14)) = 30,
  'no máximo 30 por minuto da mesma pessoa (1 + 29 do laço)'
);
select verificacao.ok(
  (select eventos = 1 and pessoas = 1 and chave = 'fetchAttempts'
     from public.saude_da_plataforma(14) where tipo = 'falha_de_leitura'),
  'a saúde agrega por tipo e onde, com quantas pessoas — sem dizer quem'
);
select verificacao.recusa($$select count(*) from public.eventos$$, 'permission denied', 'nem o admin lê as linhas do registro');

-- ------------------------------------------------------------ anônimo
set local role anon;
select set_config('request.jwt.claims', '{}', true);
select verificacao.recusa($$select public.comprar_item('dobro-de-xp')$$, 'permission denied', 'anônimo não compra');
select verificacao.recusa($$select public.concluir('completed_lessons', 'lesson-js-1')$$, 'permission denied', 'anônimo não conclui');
select verificacao.recusa($$select public.desempenho_por_exercicio()$$, 'permission denied', 'anônimo não lê o painel');
select verificacao.recusa($$select public.set_user_role('a@teste.local', 'admin')$$, 'permission denied', 'anônimo não promove ninguém');
select verificacao.recusa($$select public.definir_item_ativo('avatar-urso', false)$$, 'permission denied', 'anônimo não mexe na loja');
select verificacao.recusa(
  $$insert into public.eventos (tipo, dados) values ('erro_de_tela', '{}')$$,
  'permission denied', 'anônimo não grava evento'
);
select verificacao.recusa($$select public.saude_da_plataforma(14)$$, 'permission denied', 'anônimo não lê a saúde');

-- ------------------------------------------------------------ ritmo
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-00000000000d", "email": "d@teste.local"}', true);
select verificacao.recusa(
  $$insert into public.exercise_attempts (user_id, exercise_id, lesson_id, correct, concepts) values (auth.uid(), repeat('x', 101), 'aula-1', true, '{}')$$,
  'exercise_attempts_formato', 'id de exercício fora do tamanho'
);
insert into public.exercise_attempts (user_id, exercise_id, lesson_id, correct)
select auth.uid(), 'ex-' || n, 'aula-1', true from generate_series(1, 120) n;
select verificacao.recusa(
  $$insert into public.exercise_attempts (user_id, exercise_id, lesson_id, correct) values (auth.uid(), 'ex-121', 'aula-1', true)$$,
  'ritmo_excedido', 'a 121ª tentativa no mesmo minuto'
);

-- ------------------------------------------------------------ caderno
-- A (não D: o ritmo dele acabou de estourar) grava o que respondeu.
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-00000000000a", "email": "a@teste.local"}', true);
insert into public.exercise_attempts (user_id, exercise_id, lesson_id, correct, resposta, feedback)
values (auth.uid(), 'ex-cad', 'aula-1', false, '{"tipo": "codigo", "codigo": "return 1"}', 'Esperado 2, recebido 1.');
select verificacao.ok(
  (select resposta->>'codigo' from public.exercise_attempts where user_id = auth.uid() and exercise_id = 'ex-cad') = 'return 1',
  'a tentativa guarda o que foi enviado'
);
select verificacao.recusa(
  $$insert into public.exercise_attempts (user_id, exercise_id, lesson_id, correct, resposta) values (auth.uid(), 'ex-cad', 'aula-1', false, jsonb_build_object('tipo', 'codigo', 'codigo', repeat('x', 20000)))$$,
  'exercise_attempts_resposta_formato', 'resposta acima do teto em bytes'
);
select verificacao.recusa(
  $$insert into public.exercise_attempts (user_id, exercise_id, lesson_id, correct, resposta) values (auth.uid(), 'ex-cad', 'aula-1', false, '[1, 2]')$$,
  'exercise_attempts_resposta_formato', 'resposta que não é objeto'
);
select verificacao.recusa(
  $$insert into public.exercise_attempts (user_id, exercise_id, lesson_id, correct, feedback) values (auth.uid(), 'ex-cad', 'aula-1', false, repeat('x', 601))$$,
  'exercise_attempts_resposta_formato', 'retorno acima do teto'
);
-- Sem policy de update, o RLS não deixa a linha ser alcançada: o UPDATE passa
-- e não muda nada.
update public.exercise_attempts set resposta = null, feedback = null where user_id = auth.uid();
select verificacao.ok(
  (select resposta is not null and feedback is not null from public.exercise_attempts where user_id = auth.uid() and exercise_id = 'ex-cad'),
  'a evidência não se reescreve'
);

-- Um aluno não lê o caderno de outro.
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-00000000000b", "email": "b@teste.local"}', true);
select verificacao.ok(
  (select count(*) from public.exercise_attempts where exercise_id = 'ex-cad') = 0,
  'o caderno de A não aparece para B'
);

-- A conta de demonstração (a da 0008): o que é texto livre não fica.
reset role;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', (select id from auth.users where email = 'aluno@demo.codeflow.app'), 'email', 'aluno@demo.codeflow.app')::text,
  true
);
set local role authenticated;
insert into public.exercise_attempts (user_id, exercise_id, lesson_id, correct, resposta, feedback) values
  (auth.uid(), 'ex-codigo', 'aula-1', false, '{"tipo": "codigo", "codigo": "o que um visitante escreveu"}', 'recebido: o que um visitante escreveu'),
  (auth.uid(), 'ex-escolha', 'aula-1', false, '{"tipo": "alternativa", "indice": 2}', 'Quase.');
select verificacao.ok(
  (select resposta is null and feedback is null from public.exercise_attempts where user_id = auth.uid() and exercise_id = 'ex-codigo'),
  'demo: código e retorno não ficam'
);
select verificacao.ok(
  (select resposta->>'indice' = '2' and feedback is null from public.exercise_attempts where user_id = auth.uid() and exercise_id = 'ex-escolha'),
  'demo: a alternativa fica; o retorno, não'
);

-- De volta a D, que é quem as verificações seguintes usam.
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-00000000000d", "email": "d@teste.local"}', true);

-- ------------------------------------------------------------ perfil
select verificacao.recusa(
  $$update public.users set display_name = repeat('n', 61) where id = auth.uid()$$,
  'users_display_name_tamanho', 'nome de 61 caracteres'
);
select verificacao.recusa(
  $$update public.users set avatar = 'javascript:alert(1)' where id = auth.uid()$$,
  'users_avatar_formato', 'avatar fora do formato'
);
update public.users set avatar = 'preset:raposa', display_name = 'D' where id = auth.uid();
select verificacao.recusa(
  $$update public.users set avatar = 'preset:Raposa!' where id = auth.uid()$$,
  'users_avatar_formato', 'preset fora do formato'
);

-- ------------------------------------------------------------ molduras e fundos (0011)
update public.users set moldura = 'neon', fundo = 'aurora' where id = auth.uid();
select verificacao.ok(
  (select moldura = 'neon' and fundo = 'aurora' from public.users where id = auth.uid()),
  'moldura e fundo equipados'
);
select verificacao.recusa(
  $$update public.users set moldura = '<script>' where id = auth.uid()$$,
  'users_moldura_formato', 'moldura fora do formato'
);
select verificacao.recusa(
  $$update public.users set fundo = repeat('a', 41) where id = auth.uid()$$,
  'users_fundo_formato', 'fundo acima do tamanho'
);
select verificacao.ok(
  (select count(*) from public.store_items where tipo in ('moldura', 'fundo')) = 16,
  'o catálogo tem as molduras e os fundos (9 da 0011, 4 da 0014, 1 da 0016, 2 da 0018)'
);
select verificacao.ok(
  (select count(*) from public.store_items where id in ('avatar-capivara', 'avatar-tucano', 'avatar-tartaruga', 'avatar-baleia')) = 4,
  'os avatares da 0014 estão no catálogo'
);
select verificacao.ok(
  (select count(*) from public.store_items where id in ('avatar-dragao', 'avatar-fenix') and price >= 1400) = 2,
  'os épicos só por moedas da 0018 estão no catálogo'
);
-- Os itens de conquista (`lib/exclusivos.ts`) não estão no catálogo: a
-- compra os recusa, e equipar usa as mesmas colunas.
select verificacao.recusa(
  $$select public.comprar_item('moldura-chama')$$,
  'item_indisponivel', 'item de conquista não se compra'
);
update public.users set moldura = 'chama', fundo = 'constelacao' where id = auth.uid();
select verificacao.ok(
  (select moldura = 'chama' and fundo = 'constelacao' from public.users where id = auth.uid()),
  'item de conquista se equipa nas mesmas colunas'
);

-- ------------------------------------------------------------ títulos (0012)
update public.users set titulo = 'coruja' where id = auth.uid();
select verificacao.ok((select titulo = 'coruja' from public.users where id = auth.uid()), 'título escolhido');
select verificacao.recusa(
  $$update public.users set titulo = 'Rei do Universo' where id = auth.uid()$$,
  'users_titulo_formato', 'título fora do formato'
);
select verificacao.recusa(
  $$update public.users set titulo = '' where id = auth.uid()$$,
  'users_titulo_formato', 'título vazio (tirar é nulo)'
);
update public.users set titulo = null where id = auth.uid();
select verificacao.ok((select titulo is null from public.users where id = auth.uid()), 'sem título');
select verificacao.ok(
  not exists (select 1 from public.store_items where id like 'titulo-%'),
  'nenhum título à venda'
);

update public.users set accent = 'meia-noite' where id = auth.uid();
select verificacao.ok((select accent = 'meia-noite' from public.users where id = auth.uid()), 'cor nova aceita no perfil');
select verificacao.recusa(
  $$update public.users set accent = 'arco-iris' where id = auth.uid()$$,
  'users_accent_check', 'cor que não existe'
);

-- ------------------------------------------------------------ itens gerais (0020)
update public.users
   set tema_editor = 'noturno', celebracao = 'estrelas', icone_sequencia = 'foguete', adesivos = array['pato', 'cafe']
 where id = auth.uid();
select verificacao.ok(
  (select tema_editor = 'noturno' and celebracao = 'estrelas' and icone_sequencia = 'foguete'
          and adesivos = array['pato', 'cafe'] from public.users where id = auth.uid()),
  'tema do editor, celebração, ícone da sequência e adesivos ficam no perfil'
);
select verificacao.ok(
  (select count(*) from public.store_items where tipo = 'editor') = 5,
  'os temas do editor estão no catálogo do banco'
);
select verificacao.ok(
  (select count(*) from public.store_items where tipo = 'celebracao') = 4
    and not exists (select 1 from public.store_items where id = 'celebracao-confete'),
  'as celebrações estão no catálogo do banco, e o confete (de todo mundo) não'
);
select verificacao.ok(
  (select count(*) from public.store_items where tipo = 'sequencia') = 4
    and not exists (select 1 from public.store_items where id = 'sequencia-chama'),
  'os ícones da sequência estão no catálogo do banco, e a chama (de todo mundo) não'
);
select verificacao.recusa(
  $$update public.users set tema_editor = 'Noturno!' where id = auth.uid()$$,
  'users_tema_editor_formato', 'tema do editor fora do formato'
);
select verificacao.recusa(
  $$update public.users set celebracao = '' where id = auth.uid()$$,
  'users_celebracao_formato', 'celebração vazia (tirar é nulo)'
);
select verificacao.recusa(
  $$update public.users set icone_sequencia = repeat('a', 41) where id = auth.uid()$$,
  'users_icone_sequencia_formato', 'ícone da sequência acima de 40 caracteres'
);
select verificacao.recusa(
  $$update public.users set adesivos = array['a', 'b', 'c', 'd'] where id = auth.uid()$$,
  'users_adesivos_formato', 'quatro adesivos'
);
select verificacao.recusa(
  $$update public.users set adesivos = array['pato', ''] where id = auth.uid()$$,
  'users_adesivos_formato', 'adesivo vazio'
);
select verificacao.recusa(
  $$update public.users set adesivos = array['pato,cafe'] where id = auth.uid()$$,
  'users_adesivos_formato', 'dois adesivos disfarçados de um, com vírgula'
);
select verificacao.recusa(
  $$update public.users set adesivos = array['pato', null] where id = auth.uid()$$,
  'users_adesivos_formato', 'adesivo nulo no meio da lista'
);
select verificacao.recusa(
  $$update public.users set adesivos = array['<b>'] where id = auth.uid()$$,
  'users_adesivos_formato', 'adesivo fora do formato'
);
update public.users set adesivos = '{}' where id = auth.uid();
select verificacao.ok((select cardinality(adesivos) = 0 from public.users where id = auth.uid()), 'lista vazia de adesivos');

-- ------------------------------------------------------------ foto
insert into storage.objects (bucket_id, name) values ('avatars', '00000000-0000-4000-8000-00000000000d/foto.jpg');
select verificacao.recusa(
  $$insert into storage.objects (bucket_id, name) values ('avatars', '00000000-0000-4000-8000-00000000000a/foto.jpg')$$,
  'row-level security', 'foto na pasta de outra pessoa'
);

reset role;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', (select id from auth.users where email = 'aluno@demo.codeflow.app'), 'email', 'aluno@demo.codeflow.app')::text,
  true
);
set local role authenticated;
select verificacao.recusa(
  $$insert into storage.objects (bucket_id, name) values ('avatars', auth.uid()::text || '/foto.jpg')$$,
  'row-level security', 'conta demo não sobe foto'
);

-- O admin de demonstração é admin (0008), mas é público: não mexe na loja.
reset role;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', (select id from auth.users where email = 'admin@demo.codeflow.app'), 'email', 'admin@demo.codeflow.app')::text,
  true
);
set local role authenticated;
select verificacao.ok(public.is_admin(), 'a conta admin de demonstração é admin');
select verificacao.recusa(
  $$select public.definir_item_ativo('avatar-urso', false)$$,
  'conta_demo', 'o admin de demonstração não tira item da loja de ninguém'
);

-- ------------------------------------------------------------ contas demo
-- O GoTrue grava em auth.users com o papel dele; aqui, o dono do banco
-- faz o mesmo UPDATE que um `auth.updateUser({ password })` faria.
reset role;
update auth.users
   set encrypted_password = extensions.crypt('trocada', extensions.gen_salt('bf')),
       email = 'sequestro@fora.local'
 where email = 'admin@demo.codeflow.app';
select verificacao.ok(
  (select encrypted_password = extensions.crypt('admin', encrypted_password)
     from auth.users where email = 'admin@demo.codeflow.app'),
  'a senha da conta demo não muda pela API'
);
select verificacao.ok(
  exists (select 1 from auth.users where email = 'admin@demo.codeflow.app'),
  'o e-mail da conta demo não muda pela API'
);

-- Com a marca da 0008 ligada, a senha volta a poder ser redefinida.
select set_config('app.allow_demo_reset', 'on', true);
update auth.users set encrypted_password = extensions.crypt('nova', extensions.gen_salt('bf'))
 where email = 'aluno@demo.codeflow.app';
select verificacao.ok(
  (select encrypted_password = extensions.crypt('nova', encrypted_password) from auth.users where email = 'aluno@demo.codeflow.app'),
  'a 0008 ainda redefine a senha'
);
select set_config('app.allow_demo_reset', 'off', true);

-- Uma conta comum troca a senha normalmente.
update auth.users set encrypted_password = 'outra' where email = 'a@teste.local';
select verificacao.ok(
  (select encrypted_password from auth.users where email = 'a@teste.local') = 'outra',
  'conta comum não é afetada pela proteção'
);

select 'verificação de comportamento: tudo certo' as resultado;

rollback;

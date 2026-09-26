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

select public.comprar_item('tema-oceano');
select verificacao.ok(
  (select price from public.purchases where user_id = auth.uid() and item = 'tema-oceano') = 120,
  'o preço vem do catálogo do banco'
);
select verificacao.recusa($$select public.comprar_item('tema-oceano')$$, 'item_ja_possuido', 'cosmético não se compra duas vezes');
select public.comprar_item('dobro-de-xp');
-- 120 + 80 = 200: o teto de A. Mais um consumível passaria dele.
select verificacao.recusa($$select public.comprar_item('congelar-sequencia')$$, 'saldo_insuficiente', 'gasto acima do teto');
select verificacao.recusa($$select public.comprar_item('item-que-nao-existe')$$, 'item_indisponivel', 'item fora do catálogo');

-- E não tem aula concluída nem atividade: teto zero.
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-00000000000e", "email": "e@teste.local"}', true);
select verificacao.recusa($$select public.comprar_item('congelar-sequencia')$$, 'saldo_insuficiente', 'moeda sem estudo não existe');

-- O teto por fora: só funções do banco o chamam.
select verificacao.recusa($$select public.teto_de_moedas(auth.uid())$$, 'permission denied', 'teto não é chamável pela API');

reset role;

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

-- ------------------------------------------------------------ anônimo
set local role anon;
select set_config('request.jwt.claims', '{}', true);
select verificacao.recusa($$select public.comprar_item('dobro-de-xp')$$, 'permission denied', 'anônimo não compra');
select verificacao.recusa($$select public.concluir('completed_lessons', 'lesson-js-1')$$, 'permission denied', 'anônimo não conclui');
select verificacao.recusa($$select public.desempenho_por_exercicio()$$, 'permission denied', 'anônimo não lê o painel');
select verificacao.recusa($$select public.set_user_role('a@teste.local', 'admin')$$, 'permission denied', 'anônimo não promove ninguém');

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

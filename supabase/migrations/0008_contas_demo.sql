-- Contas de demonstração: quem chega pelo portfólio entra sem conta Google.
--
--   usuário aluno   senha aluno   -> aluno (progresso compartilhado entre visitantes)
--   usuário admin   senha admin   -> administrador (o painel é só leitura: 0005)
--
-- A tela de login transforma o usuário curto no endereço interno
-- (`src/client/lib/demo.ts`): "admin" vira admin@demo.codeflow.app.
--
-- Requer o provedor Email ligado em Authentication › Providers › Email (vem
-- ligado por padrão). Pode rodar de novo: as senhas voltam ao padrão.

create or replace function pg_temp.conta_demo(p_email text, p_senha text, p_nome text)
returns uuid
language plpgsql
as $$
declare
  v_id uuid;
begin
  select id into v_id from auth.users where lower(email) = lower(p_email);

  if v_id is null then
    v_id := gen_random_uuid();

    -- Os tokens vazios (e não nulos) são exigidos pelo GoTrue: com NULL o
    -- login falha com "Database error querying schema".
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      email_change_token_current, phone_change, phone_change_token, reauthentication_token
    )
    values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', p_email,
      extensions.crypt(p_senha, extensions.gen_salt('bf')), now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('full_name', p_nome), now(), now(),
      '', '', '', '', '', '', '', ''
    );

    insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (
      gen_random_uuid(), v_id, v_id::text, 'email',
      jsonb_build_object('sub', v_id::text, 'email', p_email, 'email_verified', true),
      now(), now(), now()
    );
  else
    update auth.users
       set encrypted_password = extensions.crypt(p_senha, extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           banned_until = null,
           updated_at = now()
     where id = v_id;
  end if;

  -- O gatilho `handle_new_user` (0001) já cria o perfil; isto cobre quem
  -- rodar a migração num banco em que ele ainda não existia.
  insert into public.users (id, email, name)
  values (v_id, p_email, p_nome)
  on conflict (id) do nothing;

  return v_id;
end;
$$;

select pg_temp.conta_demo('aluno@demo.codeflow.app', 'aluno', 'Aluno (demonstração)');
select pg_temp.conta_demo('admin@demo.codeflow.app', 'admin', 'Admin (demonstração)');

-- O papel passa pelo mesmo caminho de `set_user_role` (0006): a marca liberada
-- só dentro deste bloco (uma transação), para o gatilho
-- `prevent_role_escalation` deixar passar.
do $$
begin
  perform set_config('app.allow_role_change', 'on', true);
  update public.users set role = 'admin' where email = 'admin@demo.codeflow.app';
  update public.users set role = 'student' where email = 'aluno@demo.codeflow.app';
  perform set_config('app.allow_role_change', 'off', true);
end;
$$;

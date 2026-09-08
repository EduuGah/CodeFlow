-- Promoção a administrador, com o gatilho de proteção intacto.
--
-- O `users_guard_role` da 0001 impede que `role` mude num UPDATE. A intenção era
-- barrar um aluno que chamasse a API direto: a policy `users_update_own` permite
-- que ele altere a própria linha, e sem o gatilho um PATCH com `{"role":"admin"}`
-- funcionaria.
--
-- Só que o gatilho não distinguia quem estava atualizando. Ele desfazia a mudança
-- para todo mundo, inclusive para o dono do banco no SQL Editor — e em silêncio,
-- porque um BEFORE trigger que reescreve NEW não gera erro nenhum: o UPDATE
-- reporta sucesso e o valor volta a 'student'.
--
-- A saída aqui é uma porta única e explícita. O gatilho continua dizendo não a
-- qualquer UPDATE, exceto quando uma marca local à transação estiver ligada — e a
-- única coisa que liga essa marca é a função abaixo, cuja execução é negada aos
-- papéis do cliente.
--
-- A alternativa seria o gatilho inspecionar `current_user` ou `session_user` para
-- adivinhar se a chamada veio da API. Isso depende de detalhes sutis: dentro de
-- uma função `security definer`, `current_user` é o dono da função e não quem
-- chamou. Uma proteção de privilégio que depende de um detalhe assim é uma
-- proteção que ninguém consegue reler e ter certeza.

-- A marca não existe por padrão, e `current_setting(..., true)` devolve NULL
-- quando ela nunca foi definida: na dúvida, o gatilho barra.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and coalesce(current_setting('app.allow_role_change', true), 'off') <> 'on'
  then
    new.role := old.role;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

/**
 * Define o papel de um aluno pelo e-mail.
 *
 * `set_config` com o terceiro argumento em `true` faz a marca valer só até o fim
 * da transação — ela não sobrevive para o próximo comando nem vaza para outra
 * conexão. E é desligada logo depois do UPDATE, para o restante da transação
 * voltar ao comportamento normal.
 *
 * Devolve a linha alterada, ou nada quando o e-mail não existe. Um `update` que
 * não encontra ninguém reporta sucesso e não muda nada, o que já custou tempo de
 * gente procurando o erro no lugar errado.
 */
create or replace function public.set_user_role(target_email text, new_role text)
returns public.users
language plpgsql
security definer
set search_path = public
as $$
declare
  alterado public.users;
begin
  if new_role not in ('student', 'admin') then
    raise exception 'papel inválido: %. Use student ou admin.', new_role;
  end if;

  perform set_config('app.allow_role_change', 'on', true);

  update public.users
     set role = new_role
   where email = target_email
  returning * into alterado;

  perform set_config('app.allow_role_change', 'off', true);

  if alterado.id is null then
    raise exception 'nenhum usuário com o e-mail %. Ele já entrou na aplicação ao menos uma vez?', target_email;
  end if;

  return alterado;
end;
$$;

-- A função é a porta; o cadeado é este revoke. Sem ele, um aluno chamaria
-- `/rest/v1/rpc/set_user_role` e o gatilho deixaria passar, porque a marca
-- estaria ligada.
revoke all on function public.set_user_role(text, text) from public, anon, authenticated;

comment on function public.set_user_role(text, text) is
  'Define o papel de um aluno. Executavel apenas por postgres ou service_role: '
  'o revoke acima e o que impede um aluno de se autopromover pela API.';

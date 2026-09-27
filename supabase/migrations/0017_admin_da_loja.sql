-- Admin da loja: tirar um item da venda (e devolver), sem migração.
--
-- O catálogo continua mudando por migração revisada em pull request — preço,
-- tipo, item novo. O que a administração faz pela tela é só ligar e desligar
-- `ativo`: um item com defeito sai da venda na hora, e volta quando o
-- conserto chegar. A `comprar_item` (0009) já recusa item inativo.
--
-- Só administrador, e nunca a conta de demonstração: o `admin`/`admin` é
-- público, e tirar itens da loja de todo mundo não pode estar a um clique de
-- qualquer visitante.
--
-- Idempotente, sem `… into variável` e sem cifrão dentro de texto, como as
-- outras (`migrations.test.ts` confere).

create or replace function public.definir_item_ativo(p_item text, p_ativo boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'apenas_admin' using errcode = '42501';
  end if;
  if lower(coalesce(auth.jwt() ->> 'email', '')) like '%@demo.codeflow.app' then
    raise exception 'conta_demo' using errcode = '42501';
  end if;

  update public.store_items set ativo = p_ativo where id = p_item;
  if not found then
    raise exception 'item_desconhecido' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.definir_item_ativo(text, boolean) from public, anon;
grant execute on function public.definir_item_ativo(text, boolean) to authenticated;

-- O que o aluno respondeu em cada tentativa, para o Caderno de Erros.
--
-- Até aqui a tentativa guardava só "errou" ou "acertou". O caderno precisa
-- mostrar o erro de verdade: a alternativa marcada, a linha apontada, o código
-- enviado, o retorno que a pessoa leu. Duas colunas novas, opcionais — as
-- tentativas antigas ficam sem, e o navegador que ainda não conhece a coluna
-- continua gravando.
--
-- É dado do aluno, e só ele lê: nenhuma policy nova (a 0002 dá ao aluno as
-- próprias linhas, e a 0009 tirou do admin a leitura das tentativas cruas).
-- Sem policy de update, como antes: a evidência não se reescreve.
--
-- Idempotente, como as outras: pode rodar de novo.

alter table public.exercise_attempts add column if not exists resposta jsonb;
alter table public.exercise_attempts add column if not exists feedback text;

-- Pequeno de propósito. O navegador corta antes de mandar (`resposta.ts`:
-- 4.000 caracteres de código, 500 de texto); aqui o teto é em bytes do JSON,
-- com folga para acento e escape. Quem passa disso não é o aplicativo.
alter table public.exercise_attempts drop constraint if exists exercise_attempts_resposta_formato;
alter table public.exercise_attempts add constraint exercise_attempts_resposta_formato
  check (
    (resposta is null or (jsonb_typeof(resposta) = 'object' and octet_length(resposta::text) <= 16384))
    and (feedback is null or char_length(feedback) <= 600)
  );

-- A conta de demonstração `aluno` é uma só para todo visitante. O que um
-- escreve (código, previsão, lacuna — e o retorno, que pode repetir a saída
-- do código) apareceria no caderno do próximo, que pode ser quem está
-- avaliando o portfólio. Ali fica só o que não é texto livre: a alternativa,
-- a linha, a ordem.
create or replace function public.resposta_da_demo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.resposta is not null or new.feedback is not null)
     and exists (
       select 1 from auth.users
        where id = new.user_id and lower(email) like '%@demo.codeflow.app'
     ) then
    new.feedback := null;
    if coalesce(new.resposta->>'tipo', '') not in ('alternativa', 'linha', 'ordem') then
      new.resposta := null;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.resposta_da_demo() from public, anon, authenticated;

drop trigger if exists resposta_da_demo on public.exercise_attempts;
create trigger resposta_da_demo
  before insert on public.exercise_attempts
  for each row execute function public.resposta_da_demo();

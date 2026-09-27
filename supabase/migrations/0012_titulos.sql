-- Títulos: o que aparece ao lado do nome, ganho por conquista.
--
-- O perfil guarda só qual título a pessoa escolheu. Se ela tem o título é
-- derivado das conquistas no navegador (`src/client/lib/titulos.ts`), como a
-- moldura e o fundo da 0011: o título só aparece para a própria pessoa, e a
-- tela não mostra um título que as conquistas não abrem — gravar um id à mão
-- não mostra nada.
--
-- Nenhum título está no catálogo da loja, e nenhum entra: título não se
-- compra (`titulos.test.ts` confere).
--
-- Idempotente, sem `… into variável` e sem cifrão dentro de texto, como as
-- outras (`migrations.test.ts` confere).

alter table public.users add column if not exists titulo text;

alter table public.users drop constraint if exists users_titulo_formato;
alter table public.users add constraint users_titulo_formato
  check (titulo is null or (titulo <> '' and titulo !~ '[^a-z0-9-]' and char_length(titulo) <= 40));

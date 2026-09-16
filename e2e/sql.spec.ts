import { getLessonsOfTrack } from '../src/content';
import { concluirAula, expect, irAteOEditor, test } from './fixtures';

/**
 * O motor de SQL, no navegador de verdade.
 *
 * O CI roda cada exercício com o `sql.js` no Node. Aqui é o Chromium: o
 * SQLite em WebAssembly chega pelo worker, servido pelo próprio domínio, e o
 * aluno vê as linhas numa tabela — inclusive o que só existe no navegador,
 * como o prazo que descarta o worker no meio de uma consulta sem fim.
 *
 * Em série: o worker compila o WebAssembly uma vez por página, e dividir a
 * máquina com outros testes já fez o editor levar mais de 40s.
 */
test.describe.configure({ mode: 'serial' });

const AULA = 'lesson-sql-1';

// Toda aula da trilha: cada aula nova de SQL entra aqui sozinha.
for (const aula of getLessonsOfTrack('track-sql')) {
  test(`${aula.id}: a aula inteira é concluída no navegador, exercício por exercício`, async ({
    logado: page,
    banco,
  }) => {
    test.setTimeout(180_000);

    await concluirAula(page, aula.id);

    await expect
      .poll(
        () =>
          banco.escritas.filter(
            (e) =>
              e.tabela === 'users' &&
              ((e.corpo as { completed_lessons?: string[] })?.completed_lessons ?? []).includes(
                aula.id
              )
          ).length,
        { timeout: 15_000, message: 'a aula não foi marcada como concluída' }
      )
      .toBeGreaterThan(0);
  });
}

async function escrever(page: Parameters<typeof irAteOEditor>[0], sql: string) {
  await page.evaluate((valor) => {
    window.monaco!.editor.getModels()[0].setValue(valor);
  }, sql);
  await page.getByRole('button', { name: /Executar consulta|Executar de novo/ }).click();
}

test('o erro do SQLite chega traduzido, e as linhas devolvidas aparecem numa tabela', async ({
  logado: page,
}) => {
  test.setTimeout(120_000);

  await page.goto(`/lesson/${AULA}`);
  await irAteOEditor(page);

  // As tabelas do banco estão à vista antes de qualquer execução.
  await expect(page.getByText('Tabelas do banco')).toBeVisible();
  await expect(page.getByText('preco_unitario').first()).toBeVisible();

  await escrever(page, 'SELECT nome, categori FROM produtos;');
  await page.getByText(/A coluna "categori" não existe/).waitFor({ timeout: 60_000 });

  await escrever(page, 'SELECT nome, categoria FROM produtos WHERE categoria = \'livros\';');
  await page.getByText(/verificação falhou/).waitFor({ timeout: 30_000 });
  // A tabela de resultado: cabeçalho e as duas linhas de livros.
  const tabela = page.getByRole('table');
  await expect(tabela.getByRole('columnheader', { name: 'categoria' })).toBeVisible();
  await expect(tabela.getByRole('row')).toHaveCount(3);
  await expect(page.getByText(/Eram esperadas 12 linhas e vieram 2/)).toBeVisible();
});

test('uma consulta sem fim é interrompida em 3 segundos, e a próxima roda normalmente', async ({
  logado: page,
}) => {
  test.setTimeout(120_000);

  await page.goto(`/lesson/${AULA}`);
  await irAteOEditor(page);

  await escrever(
    page,
    'WITH RECURSIVE c(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM c) SELECT COUNT(*) FROM c;'
  );
  await page.getByText(/passou de 3 segundos/).waitFor({ timeout: 60_000 });

  // O worker foi descartado; o seguinte compila o SQLite de novo e responde.
  await escrever(page, 'SELECT nome, categoria FROM produtos;');
  await page.getByText('As linhas são as esperadas').waitFor({ timeout: 60_000 });
});

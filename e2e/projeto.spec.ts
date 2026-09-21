import { getLessonsOfTrack } from '../src/content';
import { concluirAula, expect, irAteOExercicio, test } from './fixtures';

/**
 * O projeto final, no navegador de verdade.
 *
 * É a única trilha em que dois motores rodam na mesma aula: o SQL (o worker
 * do SQLite) e o servidor **com banco** — o sandbox de sempre com o SQLite
 * carregado dentro do mesmo worker (`servidor-banco.worker.ts`), que o CI
 * só prova no Node. Aqui é o Chromium concluindo cada aula, e a tela
 * mostrando o banco depois de o servidor rodar.
 *
 * Em série: dois SQLites em WebAssembly disputando a máquina com outro
 * teste já fez o editor passar do prazo.
 */
test.describe.configure({ mode: 'serial' });

for (const aula of getLessonsOfTrack('track-projeto')) {
  test(`${aula.id}: a aula inteira é concluída no navegador, exercício por exercício`, async ({
    logado: page,
    banco,
  }) => {
    test.setTimeout(240_000);

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

test('o servidor com banco mostra o SQL do banco antes, e as tabelas depois de rodar', async ({
  logado: page,
}) => {
  test.setTimeout(150_000);

  // A aula do repositório: o primeiro exercício de servidor tem banco.
  await page.goto('/lesson/lesson-proj-2');
  await irAteOExercicio(page, (e) => e.type === 'server' && e.banco !== undefined);

  // O banco do exercício está à vista, como mais um arquivo do projeto.
  await expect(page.getByText('banco.sql')).toBeVisible();

  await page.locator('.monaco-editor').first().waitFor({ timeout: 90_000 });
  await page.waitForFunction(
    () => {
      const m = (window as unknown as { monaco?: { editor: { getModels(): unknown[] } } }).monaco;
      return !!m && m.editor.getModels().length > 0;
    },
    undefined,
    { timeout: 40_000 }
  );

  // Um repositório que consulta o banco de verdade — o SQLite dentro do worker.
  await page.evaluate(() => {
    window.monaco!.editor.getModels()[0].setValue(
      [
        "const banco = require('./banco');",
        'async function listarDe(usuarioId) {',
        "  return banco.consultar('SELECT * FROM tarefas WHERE usuario_id = ? ORDER BY id', [usuarioId]);",
        '}',
        'async function buscar(id) {',
        "  const linhas = await banco.consultar('SELECT * FROM tarefas WHERE id = ?', [id]);",
        '  return linhas[0] ?? null;',
        '}',
        'module.exports = { listarDe, buscar };',
      ].join('\n')
    );
  });
  await page.getByRole('button', { name: 'Executar código' }).click();
  // O SQLite chega pelo worker na primeira execução: o prazo é o do motor de SQL.
  await expect(page.getByText('Todos os testes passaram')).toBeVisible({ timeout: 60_000 });

  // O banco depois: as três tabelas, com as linhas de agora.
  const depois = page.getByText('O banco depois').locator('..').locator('..');
  await expect(depois).toBeVisible();
  for (const tabela of ['usuarios', 'sessoes', 'tarefas']) {
    await expect(depois.getByText(tabela, { exact: true })).toBeVisible();
  }
  await expect(depois.getByText('Estudar Node')).toBeVisible();
});

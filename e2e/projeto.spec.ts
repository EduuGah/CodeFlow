import { getLesson, getLessonsOfTrack } from '../src/content';
import { concluirAula, expect, irAteOExercicio, test } from './fixtures';

/**
 * O projeto final, no navegador de verdade.
 *
 * É a única trilha em que os motores se juntam: o SQL (o worker do SQLite),
 * o servidor **com banco** (o sandbox com o SQLite dentro do mesmo worker,
 * `servidor-banco.worker.ts`) e, nas aulas 4 e 5, a página do iframe fazendo
 * `fetch` para esse servidor de pé — a ponte do motor 7, que o CI só prova
 * no jsdom. Aqui é o Chromium concluindo cada aula, a tela mostrando o
 * banco depois de o servidor rodar, e os pedidos que a página fez.
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

test('a página chama o servidor de pé: o painel do servidor antes, e os pedidos do fetch depois', async ({
  logado: page,
}) => {
  test.setTimeout(150_000);

  await page.goto('/lesson/lesson-proj-4');
  await irAteOExercicio(page, (e) => e.type === 'code' && e.servidor !== undefined);

  // O servidor por trás da página fica à vista, com o banco e os arquivos.
  const painel = page.getByText('O servidor por trás da página').locator('..').locator('..');
  await expect(painel).toBeVisible();
  for (const nome of ['banco.sql', 'servidor.js', './dados/tarefas.js']) {
    await expect(painel.getByText(nome, { exact: true })).toBeVisible();
  }

  await page.locator('.monaco-editor').first().waitFor({ timeout: 90_000 });
  await page.waitForFunction(
    () => {
      const m = (window as unknown as { monaco?: { editor: { getModels(): unknown[] } } }).monaco;
      return !!m && m.editor.getModels().length > 0;
    },
    undefined,
    { timeout: 40_000 }
  );

  // A solução de referência do primeiro exercício: a página que lista as tarefas.
  const aula = getLesson('lesson-proj-4')!;
  const exercicio = aula.blocks.find((b) => b.kind === 'exercise' && b.exercise.type === 'code' && b.exercise.servidor !== undefined);
  const solucao = exercicio && exercicio.kind === 'exercise' && exercicio.exercise.type === 'code' ? exercicio.exercise.solution! : '';
  await page.evaluate((codigo) => {
    window.monaco!.editor.getModels()[0].setValue(codigo);
  }, solucao);
  await page.getByRole('button', { name: 'Rodar a página' }).click();
  // O servidor sobe num worker com o SQLite antes de a página rodar.
  await expect(page.getByText('Todos os testes passaram')).toBeVisible({ timeout: 90_000 });

  // A página de verdade, dentro do iframe, com a lista que veio da API.
  const iframe = page.frameLocator('iframe[title="Pré-visualização da página"]');
  await expect(iframe.locator('#lista li')).toHaveCount(3);
  await expect(iframe.locator('#estado')).toHaveText(/3 tarefas/);

  // E o que passou pelo servidor: o GET que o fetch da página fez.
  const trocas = page.getByText('Pedidos e respostas').locator('..').locator('..');
  await expect(trocas).toBeVisible();
  await expect(trocas.getByText('GET', { exact: true }).first()).toBeVisible();
  await expect(trocas.getByText('/tarefas', { exact: true }).first()).toBeVisible();
  await expect(trocas.getByText('200', { exact: true }).first()).toBeVisible();
});

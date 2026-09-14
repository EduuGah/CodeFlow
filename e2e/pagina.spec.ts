import { getLesson, getLessonsOfTrack } from '../src/content';
import { buildLessonSteps } from '../src/client/lib/lesson-steps';
import { concluirAula, expect, irAteOEditor, test } from './fixtures';

/**
 * O motor de página, no navegador de verdade.
 *
 * O jsdom prova no CI que cada exercício de página é resolvível — mas não tem
 * layout, e não tem o `sandbox` do iframe. Aqui o Chromium renderiza a página
 * do aluno de fato: a origem é opaca, a CSP vale, e o que os testes veem é o
 * DOM que o navegador montou.
 *
 * Em série pelo mesmo motivo dos outros testes de sandbox: cada página tem um
 * prazo, e disputar a CPU com outro teste transformaria contenção em reprovação.
 */
test.describe.configure({ mode: 'serial' });

const AULA = 'lesson-pagina-1';

// Toda aula da trilha, e não só a primeira: cada aula nova de página entra
// aqui sozinha, e é percorrida no Chromium antes de chegar a um aluno.
for (const aula of getLessonsOfTrack('track-pagina')) {
  test(`${aula.id}: a aula inteira é concluída no navegador, exercício por exercício`, async ({
    logado: page,
    banco,
  }) => {
    test.setTimeout(180_000);

    await concluirAula(page, aula.id);

    // A conclusão chegou ao banco: é a prova de que todos os exercícios — os
    // de página inclusive — foram lidos como resolvidos.
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

test('a página do aluno aparece no iframe, isolada e sem rede', async ({ logado: page }) => {
  test.setTimeout(120_000);

  await page.goto(`/lesson/${AULA}`);
  await irAteOEditor(page);

  // Antes de rodar, o aviso; o iframe existe, mas coberto.
  await expect(page.getByText('A página aparece aqui quando você rodar o código.')).toBeVisible();

  const iframe = page.locator('iframe[title="Pré-visualização da página"]');
  await expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-modals');

  await page.evaluate(() => {
    window.monaco!.editor
      .getModels()[0]
      .setValue(
        '<article><h1>Receita de pão</h1><p>Farinha, água, sal e fermento. O resto é tempo.</p></article>'
      );
  });
  await page.getByRole('button', { name: /Rodar a página/ }).click();

  // O que o aluno vê: o texto dele, renderizado dentro do iframe.
  const quadro = page.frameLocator('iframe[title="Pré-visualização da página"]');
  await expect(quadro.locator('h1')).toHaveText('Receita de pão');
  await expect(page.getByText('Todos os testes passaram')).toBeVisible({ timeout: 20_000 });

  // A origem é opaca: de dentro da página do aluno, `localStorage` (onde a
  // sessão do Supabase mora) nem existe para ser lido.
  const isolada = await quadro.locator('body').evaluate(() => {
    try {
      void window.localStorage;
      return false;
    } catch {
      return true;
    }
  });
  expect(isolada, 'o iframe consegue ler o localStorage da aplicação').toBe(true);
});

test('um <script> que quebra vira mensagem, e não trava a aula', async ({ logado: page }) => {
  test.setTimeout(120_000);

  await page.goto(`/lesson/${AULA}`);
  await irAteOEditor(page);

  await page.evaluate(() => {
    window.monaco!.editor
      .getModels()[0]
      .setValue('<article><h1>Receita de pão</h1><p>Uma frase inteira aqui.</p></article><script>naoExiste();</script>');
  });
  await page.getByRole('button', { name: /Rodar a página/ }).click();

  await expect(page.getByText(/naoExiste is not defined/)).toBeVisible({ timeout: 20_000 });
  // Os testes sobre o DOM ainda rodaram: a página existia antes do erro.
  await expect(page.getByText('Todos os testes passaram')).toBeVisible();
});

test('toda aula da trilha tem ao menos um exercício de página', () => {
  // Uma trilha "da página" cujas aulas rodassem só no Worker seria a trilha
  // errada; o motor existe para ser usado.
  for (const aula of getLessonsOfTrack('track-pagina')) {
    const passos = buildLessonSteps(getLesson(aula.id)!);
    const dePagina = passos.filter(
      (p) => p.kind === 'exercise' && 'runtime' in p.exercise && p.exercise.runtime === 'iframe'
    );
    expect(dePagina.length, `${aula.id} não tem exercício de página`).toBeGreaterThan(0);
  }
});

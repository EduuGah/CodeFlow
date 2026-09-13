import { expect, test } from './fixtures';

/**
 * Confere o próprio andaime antes de qualquer coisa.
 *
 * Se a sessão dublada não convencer o `ProtectedRoute`, toda a suíte testaria a
 * tela de login sem avisar — o pior modo de falha possível, porque tudo passa.
 */

test('o aluno dublado entra no aplicativo', async ({ logado: page }) => {
  await page.goto('/app');

  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toBeVisible();
});

test('nenhuma chamada ao Supabase escapa da interceptação', async ({ logado: page }) => {
  const falhas: string[] = [];

  page.on('response', (r) => {
    if (r.url().includes('supabase.co') && r.status() >= 400) {
      falhas.push(`${r.status()} ${r.request().method()} ${new URL(r.url()).pathname}`);
    }
  });

  await page.goto('/app');
  await page.getByRole('navigation', { name: 'Navegação principal' }).waitFor();

  // O dublê responde 500 a rota não prevista, justamente para aparecer aqui.
  expect(falhas).toEqual([]);
});

test('o console não acumula erro durante a navegação', async ({ logado: page }) => {
  const erros: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') erros.push(m.text());
  });
  page.on('pageerror', (e) => erros.push(e.message));

  await page.goto('/app');
  for (const aba of ['Trilhas', 'Praticar', 'Perfil']) {
    await page.getByRole('link', { name: aba }).first().click();
    await expect(page).toHaveURL(new RegExp(aba.toLowerCase()));
  }

  expect(erros).toEqual([]);
});

/**
 * O editor do projeto no desktop.
 *
 * A versão de celular tem teste próprio, porque lá o contêiner precisa de altura
 * fixa. Aqui o que se confere é o oposto: que a altura flexível do layout em
 * duas colunas continua dando ao editor um tamanho de verdade — um `md:h-auto`
 * escorregando para `h-0` deixaria o desktop com o mesmo editor invisível que
 * o celular tinha.
 */
test('o editor do projeto se dimensiona no desktop', async ({ logado: page }) => {
  test.skip(page.viewportSize()!.width < 768, 'só no projeto de desktop');
  test.setTimeout(90_000);

  await page.goto('/project/js-imc');

  const editor = page.locator('.monaco-editor').first();
  await editor.waitFor({ timeout: 40_000 });

  await expect
    .poll(async () => (await editor.boundingBox())?.height ?? 0, { timeout: 15_000 })
    .toBeGreaterThan(300);

  const caixa = (await editor.boundingBox())!;
  // Metade da tela é do enunciado; o editor fica com a outra metade.
  expect(caixa.width).toBeGreaterThan(page.viewportSize()!.width * 0.4);
});

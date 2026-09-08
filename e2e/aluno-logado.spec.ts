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

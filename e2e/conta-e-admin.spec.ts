import { esperarConteudo, expect, test } from './fixtures';

/**
 * Sair da conta e chegar à administração.
 *
 * Duas coisas que existiam mas ninguém encontrava. O botão de sair ficava no fim
 * do perfil, depois de toda a lista de conceitos — numa página com centenas de
 * pixels de rolagem, sair virava uma caça. E a área de administração não tinha
 * entrada nenhuma na interface: só existia para quem digitasse a URL.
 */

test('sair da conta aparece sem rolar a página', async ({ logado: page }) => {
  await page.goto('/app/perfil');
  await esperarConteudo(page);

  const sair = page.getByRole('button', { name: /^Sair/ });
  await expect(sair).toBeInViewport();

  const caixa = (await sair.boundingBox())!;
  const janela = page.viewportSize()!;

  // Visível na primeira tela, sem depender do tamanho do conteúdo abaixo.
  expect(caixa.y).toBeLessThan(janela.height / 3);
});

test('o alvo de toque do sair cabe num polegar', async ({ logado: page }) => {
  await page.goto('/app/perfil');
  await esperarConteudo(page);

  const caixa = (await page.getByRole('button', { name: /^Sair/ }).boundingBox())!;

  // O mesmo mínimo que a barra de navegação já respeita. A primeira versão saiu
  // com 32px de altura, que é o tamanho padrão do botão pequeno.
  expect(caixa.height).toBeGreaterThanOrEqual(44);
});

test('o aluno comum não vê caminho para a administração', async ({ logado: page, banco }) => {
  banco.role = 'student';

  await page.goto('/app/perfil');
  await esperarConteudo(page);

  // Sem estardalhaço: não é uma porta trancada, é uma porta que não aparece.
  await expect(page.getByRole('link', { name: /Administração/ })).toHaveCount(0);
});

test('o administrador tem um caminho visível e ele funciona', async ({ logado: page, banco }) => {
  banco.role = 'admin';

  await page.goto('/app/perfil');
  await esperarConteudo(page);

  const entrada = page.getByRole('link', { name: /Administração/ });
  await expect(entrada).toBeVisible();

  await entrada.click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Administração' })).toBeVisible();
});

test('o aluno comum que force a URL é mandado de volta', async ({ logado: page, banco }) => {
  banco.role = 'student';

  await page.goto('/admin');

  await expect(page).toHaveURL(/\/app$/);
});

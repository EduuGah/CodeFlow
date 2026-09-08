import { expect, test } from './fixtures';

/**
 * Endereço que não existe, e as telas de entrada.
 *
 * O comportamento anterior era o pior tipo de silêncio: qualquer URL desconhecida
 * redirecionava para a página de marketing, com `replace`. Um aluno logado caía
 * numa tela de "conheça o CodeFlow", sem o endereço no histórico para entender o
 * que tinha acontecido — a leitura natural era ter sido deslogado.
 */

const INEXISTENTES = ['/app/nao-existe', '/lixo', '/lesson/nao-existe-mesmo/x'];

for (const rota of INEXISTENTES) {
  test(`${rota} explica em vez de redirecionar`, async ({ logado: page }) => {
    await page.goto(rota);

    // O endereço errado continua na barra: é o que permite entender o engano.
    expect(new URL(page.url()).pathname).toBe(rota);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/não existe/i);
    await expect(page).toHaveTitle(/não encontrada/i);
  });
}

test('quem está logado é levado de volta ao aplicativo', async ({ logado: page }) => {
  await page.goto('/app/nao-existe');

  const saida = page.getByRole('link', { name: /Voltar ao aplicativo/i });
  await expect(saida).toBeVisible();

  await saida.click();
  await expect(page).toHaveURL(/\/app$/);
});

test('quem não está logado é levado à apresentação', async ({ page }) => {
  await page.goto('/lixo');

  const saida = page.getByRole('link', { name: /Ir para o início/i });
  await expect(saida).toBeVisible();

  await saida.click();
  await expect(page).toHaveURL(/localhost:\d+\/$/);
});

test('as telas de entrada têm marco principal e título', async ({ page }) => {
  for (const [rota, titulo] of [
    ['/', /^CodeFlow$/],
    ['/login', /Entrar/],
  ] as const) {
    await page.goto(rota);

    // Sem `<main>`, a navegação por marcos não tem onde parar e o link de pulo
    // não teria destino.
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page).toHaveTitle(titulo);
  }
});

test('voltar do aplicativo para a apresentação atualiza o título', async ({ logado: page }) => {
  await page.goto('/app');
  await expect(page).toHaveTitle(/Início/);

  await page.goto('/');
  // Sem reset, a aba continuaria dizendo "Início · CodeFlow" na página de entrada.
  await expect(page).toHaveTitle(/^CodeFlow$/);
});

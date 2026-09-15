import { listProjects, listTracks } from '../src/content';
import { expect, test } from './fixtures';

/**
 * A tela de trilhas, depois de deixar de ser uma parede.
 *
 * O que motivou: seis trilhas desenroladas numa coluna só — setenta marcos
 * sem dizer de que assunto era cada trecho — e os projetos só no fim de toda
 * a rolagem. Agora a visão geral é um card por trilha e os projetos logo
 * abaixo; a lista de aulas tem página própria, em blocos por assunto.
 */

test('a visão geral é um card por trilha, com os projetos logo abaixo', async ({ logado: page }) => {
  await page.goto('/app/trilhas');
  await page.getByRole('heading', { level: 1, name: 'Trilhas' }).waitFor();

  // Um card por trilha, cada um com o seu progresso e a aula da vez.
  for (const trilha of listTracks()) {
    const card = page.getByRole('article').filter({ hasText: trilha.title });
    await expect(card).toHaveCount(1);
    await expect(card.getByRole('progressbar')).toBeVisible();
    await expect(card.getByRole('link', { name: 'Ver as aulas' })).toBeVisible();
  }

  // Nenhuma lista de aulas aqui: é o que fazia a tela rolar por minutos.
  await expect(page.locator('a[href^="/lesson/"]')).toHaveCount(listTracks().length);

  // Os projetos estão na mesma tela, e o atalho no topo leva até eles.
  const projetos = page.getByRole('heading', { name: 'Projetos práticos' });
  await expect(projetos).toBeAttached();
  await page.getByRole('link', { name: `${listProjects().length} projetos` }).click();
  await expect(projetos).toBeInViewport();
});

test('a página de uma trilha agrupa as aulas em blocos por assunto', async ({ logado: page }) => {
  await page.goto('/app/trilhas');
  await page
    .getByRole('article')
    .filter({ hasText: 'A Página' })
    .getByRole('link', { name: 'Ver as aulas' })
    .click();

  await expect(page).toHaveURL(/\/app\/trilhas\/track-pagina$/);

  // Os três blocos, cada um com o seu cabeçalho e a sua contagem.
  for (const bloco of ['HTML e CSS', 'DOM e eventos', 'UI e UX']) {
    await expect(page.getByRole('heading', { level: 2, name: bloco })).toBeVisible();
  }
  await expect(page.getByText('Bloco 1 de 3')).toBeVisible();

  // E as 26 aulas, todas, numeradas na ordem da trilha.
  const aulas = page.locator('a[href^="/lesson/lesson-pagina-"]');
  await expect(aulas).toHaveCount(26);
  await expect(aulas.first()).toHaveAttribute('href', '/lesson/lesson-pagina-1');
  await expect(aulas.last()).toHaveAttribute('href', '/lesson/lesson-pagina-26');

  // O sumário dos blocos pula direto para o assunto.
  await page.getByRole('link', { name: /UI e UX/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'UI e UX' })).toBeInViewport();

  // E dá para voltar.
  await page.getByRole('link', { name: 'Todas as trilhas' }).click();
  await expect(page).toHaveURL(/\/app\/trilhas$/);
});

test('uma trilha que não existe volta para a visão geral', async ({ logado: page }) => {
  await page.goto('/app/trilhas/track-inexistente');
  await expect(page).toHaveURL(/\/app\/trilhas$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Trilhas' })).toBeVisible();
});

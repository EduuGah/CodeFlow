import { listProjects, listTracks } from '../src/content';
import { ETAPAS_DO_PERCURSO } from '../src/content/percurso';
import { expect, test } from './fixtures';

/**
 * A tela de trilhas.
 *
 * Duas versões ficaram para trás: a parede (seis trilhas desenroladas numa
 * coluna, setenta marcos sem assunto) e a grade (sete cards iguais, dois
 * botões cada, sem dizer por onde começar). Agora é o percurso: três etapas
 * nomeadas, uma trilha por linha na ordem em que uma prepara a outra, um
 * botão só — o da trilha da vez — e os projetos numa aba, a um toque.
 */

test('a visão geral é o percurso em etapas, com um botão só', async ({ logado: page }) => {
  await page.goto('/app/trilhas');
  await page.getByRole('heading', { level: 1, name: 'Trilhas' }).waitFor();

  // As etapas, com nome, na ordem.
  for (const etapa of ETAPAS_DO_PERCURSO) {
    await expect(page.getByRole('heading', { level: 2, name: new RegExp(etapa.title) })).toBeVisible();
  }

  // Toda trilha aparece, numerada e com o tamanho dela.
  const trilhas = listTracks();
  for (const trilha of trilhas) {
    // Pelo nome exato: `hasText` casa por pedaço, sem distinguir maiúsculas, e
    // "ORM" achava também "plataforma" e "informação" nas descrições — o CI
    // ficou vermelho assim desde que a trilha de ORM entrou.
    const linha = page
      .getByRole('listitem')
      .filter({ has: page.getByText(trilha.title, { exact: true }) });
    await expect(linha).toHaveCount(1);
    await expect(linha).toContainText(`${trilha.lessonIds.length} aulas`);
  }

  // Um botão de aula na página inteira: o da trilha da vez, que para quem
  // nunca entrou é a primeira. As outras se abrem pelo nome.
  const aulas = page.locator('a[href^="/lesson/"]');
  await expect(aulas).toHaveCount(1);
  await expect(aulas).toHaveText(/Começar: 1\./);
  await expect(page.locator('[aria-current="step"]')).toContainText(trilhas[0].title);
});

test('os projetos ficam numa aba, e a aba abre pela URL', async ({ logado: page }) => {
  await page.goto('/app/trilhas');
  await page.getByRole('heading', { level: 1, name: 'Trilhas' }).waitFor();

  await page.getByRole('tab', { name: /Projetos/ }).click();
  await expect(page).toHaveURL(/#projetos$/);
  await expect(page.locator('a[href^="/project/"]')).toHaveCount(listProjects().length);
  // A lista de trilhas saiu de cena: é uma coisa ou outra.
  await expect(page.locator('a[href^="/lesson/"]')).toHaveCount(0);

  // O link das outras telas continua valendo.
  await page.goto('/app/trilhas#projetos');
  await expect(page.getByRole('tab', { name: /Projetos/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('a[href^="/project/"]').first()).toBeVisible();
});

test('a página de uma trilha agrupa as aulas em blocos por assunto', async ({ logado: page }) => {
  await page.goto('/app/trilhas');
  await page.getByRole('link', { name: 'A Página' }).click();

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

  // Para quem nunca entrou, nenhuma aula vem em âmbar: o aviso de
  // pré-requisito só faz sentido fora de ordem, e aqui não há ordem quebrada.
  await expect(page.getByText(/que você ainda não praticou/)).toHaveCount(0);

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

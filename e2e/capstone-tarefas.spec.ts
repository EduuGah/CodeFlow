import { getProject } from '../src/content';
import { escreverNoEditor, expect, test } from './fixtures';

/**
 * O primeiro capstone, no navegador de verdade.
 *
 * É o primeiro projeto de página + API + banco (motor 7) — antes, todo
 * projeto era JavaScript puro, avaliado num Web Worker. Este spec prova o
 * que o `content.test.ts` não alcança: que a página de verdade sobe num
 * `<iframe sandbox>`, o servidor sobe atrás dela, e os quatro critérios
 * fecham com a solução de referência, no Chromium.
 */
test('capstone: lista de tarefas com conta fecha todos os critérios com a solução de referência', async ({
  logado: page,
}) => {
  test.setTimeout(120_000);

  const project = getProject('proj-capstone-tarefas');
  if (!project) throw new Error('projeto proj-capstone-tarefas não encontrado no catálogo');

  await page.goto('/project/proj-capstone-tarefas');
  // O projeto chega sob demanda: sem esperar a tela, o `isVisible()` da aba
  // abaixo respondia "não" durante o carregamento, e no celular o editor
  // ficava escondido na aba que ninguém abriu.
  await page.getByRole('button', { name: /Verificar critérios/ }).waitFor();

  // No celular o editor mora numa aba separada, escondida por CSS até a
  // pessoa trocar de aba — sem isso o Monaco fica oculto (display: none).
  const abaCodigo = page.getByRole('tab', { name: 'Código' });
  if (await abaCodigo.isVisible()) await abaCodigo.click();

  await escreverNoEditor(page, project.referenceSolution ?? '');

  // A página do servidor de verdade, visível para quem está resolvendo.
  await expect(page.getByText('O servidor por trás da página')).toBeVisible();

  await page.getByRole('button', { name: /Verificar critérios/ }).click();

  const abaEnunciado = page.getByRole('tab', { name: 'Enunciado' });
  if (await abaEnunciado.isVisible()) await abaEnunciado.click();

  await expect(
    page.getByText(`${project.checkpoints.length} de ${project.checkpoints.length}`)
  ).toBeVisible({ timeout: 40_000 });
});

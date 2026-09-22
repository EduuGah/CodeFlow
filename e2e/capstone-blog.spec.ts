import { getProject } from '../src/content';
import { escreverNoEditor, expect, test } from './fixtures';

/**
 * O terceiro capstone, no navegador de verdade — ver `capstone-tarefas.spec.ts`.
 * Este prova a autenticação por token: cadastro que já loga, e um 403 de
 * verdade quando alguém tenta apagar o post de outra pessoa.
 */
test('capstone: blog com autenticação fecha todos os critérios com a solução de referência', async ({
  logado: page,
}) => {
  test.setTimeout(120_000);

  const project = getProject('proj-capstone-blog');
  if (!project) throw new Error('projeto proj-capstone-blog não encontrado no catálogo');

  await page.goto('/project/proj-capstone-blog');

  const abaCodigo = page.getByRole('tab', { name: 'Código' });
  if (await abaCodigo.isVisible()) await abaCodigo.click();

  await escreverNoEditor(page, project.referenceSolution ?? '');

  await expect(page.getByText('O servidor por trás da página')).toBeVisible();

  await page.getByRole('button', { name: /Verificar critérios/ }).click();

  const abaEnunciado = page.getByRole('tab', { name: 'Enunciado' });
  if (await abaEnunciado.isVisible()) await abaEnunciado.click();

  await expect(
    page.getByText(`${project.checkpoints.length} de ${project.checkpoints.length}`)
  ).toBeVisible({ timeout: 40_000 });
});

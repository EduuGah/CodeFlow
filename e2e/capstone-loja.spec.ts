import { getProject } from '../src/content';
import { escreverNoEditor, expect, test } from './fixtures';

/**
 * O segundo capstone, no navegador de verdade — ver `capstone-tarefas.spec.ts`.
 * Este prova, além do fetch comum, que o servidor recusa um pedido inteiro
 * quando um item não tem estoque, sem descontar os outros.
 */
test('capstone: loja com carrinho fecha todos os critérios com a solução de referência', async ({
  logado: page,
}) => {
  test.setTimeout(120_000);

  const project = getProject('proj-capstone-loja');
  if (!project) throw new Error('projeto proj-capstone-loja não encontrado no catálogo');

  await page.goto('/project/proj-capstone-loja');

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

import { getLessonsOfTrack } from '../src/content';
import { concluirAula, escreverNoEditor, expect, irAteOExercicio, test } from './fixtures';

/**
 * A trilha de Testes e Qualidade, no navegador de verdade.
 *
 * O tipo central, `write-test`, já existia desde a trilha de arrays — aqui
 * ele é o assunto da trilha inteira, e a aula 5 o combina com o motor 4 (o
 * aluno escreve `pedir()` com `await` dentro do próprio teste). É a prova de
 * que o exercício de escrever o teste passou a rodar a verificação do aluno
 * dentro do corredor assíncrono do sandbox — o mesmo que os exercícios de
 * código usam — em vez de bater-la crua no meio do programa.
 */
test.describe.configure({ mode: 'serial' });

for (const aula of getLessonsOfTrack('track-testes')) {
  test(`${aula.id}: a aula inteira é concluída no navegador, exercício por exercício`, async ({
    logado: page,
    banco,
  }) => {
    test.setTimeout(180_000);

    await concluirAula(page, aula.id);

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

test('um teste que aceita a implementação e pega cada sabotagem, nomeada', async ({ logado: page }) => {
  test.setTimeout(120_000);

  await page.goto('/lesson/lesson-testes-1');
  await irAteOExercicio(page, (e) => e.type === 'write-test');

  await escreverNoEditor(
    page,
    "assert(aplicarDesconto(100, 10) === 90, '10% em 100 e 90'); assert(aplicarDesconto(50, 0) === 50, '0% nao muda o preco'); assert(aplicarDesconto(80, 100) === 0, '100% zera o preco');"
  );
  await page.getByRole('button', { name: /Rodar meus testes|Rodar de novo/ }).click();

  await expect(page.getByText('Seus testes pegam todos os defeitos')).toBeVisible({ timeout: 40_000 });
  // Cada sabotagem nomeada, para o aluno ver exatamente o que o teste dele cobre.
  await expect(page.getByText(/Pegam:.*soma o desconto em vez de subtrair/)).toBeVisible();
});

test('um teste vazio é reprovado — a lição central da trilha', async ({ logado: page }) => {
  test.setTimeout(120_000);

  await page.goto('/lesson/lesson-testes-1');
  await irAteOExercicio(page, (e) => e.type === 'write-test');

  // O initialCode já é o comentário vazio — só roda.
  await page.getByRole('button', { name: /Rodar meus testes|Rodar de novo/ }).click();

  await expect(page.getByText(/defeitos passaram pelos seus testes/)).toBeVisible({ timeout: 40_000 });
  await expect(page.getByText('Aceitam a implementação correta')).toBeVisible();
});

import { getLesson } from '../src/content';
import { buildLessonSteps } from '../src/client/lib/lesson-steps';
import { expect, irAteOEditor, test } from './fixtures';

/**
 * Do aluno logado até a lição concluída, na aplicação de verdade.
 *
 * É o percurso que nenhum teste anterior cobria de ponta a ponta: o código do
 * aluno roda no Web Worker de verdade, os testes do exercício rodam de verdade, e
 * o progresso vai de verdade para a camada de persistência — que aqui é o dublê,
 * onde dá para inspecionar exatamente o que foi gravado.
 *
 * A solução é escrita no modelo do Monaco em vez de digitada. Digitar disputaria
 * com a indentação automática e o fechamento de parênteses do editor, e o que
 * está sob teste é o caminho do exercício, não a mecânica de digitação.
 */

const AULA = 'lesson-js-4';

// O Monaco vem do CDN em tempo de execução; o padrão de 30s não cobre a primeira
// carga somada à execução do worker.
test.setTimeout(90_000);

/**
 * O exercício de código da aula, tirado do próprio conteúdo.
 *
 * Lança em vez de pular o teste: se a aula deixar de ter exercício de código, o
 * percurso mais importante do produto passaria a não ser testado em silêncio.
 */
function exercicioDeCodigo() {
  for (const passo of buildLessonSteps(getLesson(AULA)!)) {
    if (passo.kind === 'exercise' && passo.exercise.type === 'code') return passo.exercise;
  }

  throw new Error(`${AULA} não tem exercício de código; escolha outra aula para este teste`);
}

test('resolver o exercício conclui a aula e grava o progresso', async ({ logado: page, banco }) => {
  const exercicio = exercicioDeCodigo();

  await page.goto(`/lesson/${AULA}`);
  await irAteOEditor(page);

  // A solução de referência do próprio conteúdo, a mesma que o CI usa para provar
  // que o exercício é resolvível.
  await page.evaluate(
    (codigo) => {
      const monaco = (window as unknown as { monaco?: { editor: { getModels(): Array<{ setValue(v: string): void }> } } })
        .monaco;
      if (!monaco) throw new Error('monaco não exposto na window');
      monaco.editor.getModels()[0].setValue(codigo);
    },
    `${exercicio.initialCode}\n${exercicio.solution}`
  );

  await page.getByRole('button', { name: 'Executar código' }).click();

  // Cada teste e cada propriedade viram um item; o Web Worker é o de verdade.
  const itens = page.locator('ul li');
  await expect(itens.first()).toBeVisible({ timeout: 20_000 });
  await expect(itens).toHaveCount(exercicio.tests.length + (exercicio.properties?.length ?? 0));

  // A dica sai de cena quando o exercício é resolvido — consequência observável
  // de `passouTudo`, e sinal de que a execução foi lida como acerto.
  await expect(page.getByRole('button', { name: /Precisa de uma dica/ })).toHaveCount(0);

  // Confetes e um selo verde não são progresso: o que conta é o que chegou ao
  // banco. Foi exatamente esse tipo de "conclusão" falsa que já apareceu aqui.
  await expect
    .poll(
      () =>
        banco.escritas.filter(
          (e) => e.tabela === 'exercise_attempts' && (e.corpo as { correct?: boolean })?.correct === true
        ).length,
      { timeout: 15_000, message: 'nenhuma tentativa correta registrada' }
    )
    .toBeGreaterThan(0);

  await expect
    .poll(
      () =>
        banco.escritas.some(
          (e) =>
            e.tabela === 'users' &&
            ((e.corpo as { completed_lessons?: string[] })?.completed_lessons ?? []).includes(AULA)
        ),
      { timeout: 15_000, message: `escritas: ${JSON.stringify(banco.escritas)}` }
    )
    .toBe(true);

  // E o aluno chega ao fim da aula.
  await page.getByRole('button', { name: /Continuar|Pular por ora/ }).click();
  await expect(page.getByText('Aula concluída')).toBeVisible();
});

test('errar registra a tentativa e não conclui a aula', async ({ logado: page, banco }) => {
  await page.goto(`/lesson/${AULA}`);
  await irAteOEditor(page);

  await page.evaluate(() => {
    const monaco = (window as unknown as { monaco?: { editor: { getModels(): Array<{ setValue(v: string): void }> } } })
      .monaco;
    monaco!.editor.getModels()[0].setValue('// nada que resolva\n');
  });

  await page.getByRole('button', { name: 'Executar código' }).click();
  await expect(page.getByRole('button', { name: 'Executar código' })).toBeEnabled({
    timeout: 10_000,
  });

  await expect(page.getByText('Aula concluída')).toHaveCount(0);

  // A tentativa errada é evidência tão útil quanto a certa: é dela que sai o
  // sinal de exercício com enunciado confuso.
  await expect
    .poll(() => banco.escritas.filter((e) => e.tabela === 'exercise_attempts').length, {
      timeout: 10_000,
    })
    .toBeGreaterThan(0);

  const escritasDeAula = banco.escritas.filter((e) => e.tabela === 'users');
  expect(escritasDeAula, 'aula marcada como concluída sem resolver nada').toEqual([]);
});

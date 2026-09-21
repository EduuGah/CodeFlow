import { getLessonsOfTrack } from '../src/content';
import { concluirAula, expect, irAteOExercicio, test } from './fixtures';

/**
 * A trilha de engenharia, no navegador de verdade.
 *
 * Ela roda no motor 4 como a de Node, mas com o que a trilha acrescentou ao
 * motor: o arquivo do aluno pode morar numa pasta (`caminho`), e o `require`
 * dele resolve `../` a partir dali. O CI prova cada exercício no Node; aqui
 * é o Chromium concluindo cada aula, e a tela mostrando onde o arquivo mora.
 */
test.describe.configure({ mode: 'serial' });

// Toda aula da trilha: cada aula nova entra aqui sozinha.
for (const aula of getLessonsOfTrack('track-engenharia')) {
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

test('o exercício diz onde o arquivo do aluno mora, e mostra os arquivos vizinhos', async ({
  logado: page,
}) => {
  test.setTimeout(120_000);

  // A aula de módulos: o index.js da pasta precos/.
  await page.goto('/lesson/lesson-eng-2');
  await irAteOExercicio(page, (e) => e.type === 'server' && e.caminho !== undefined);

  // A etiqueta acima do editor — o caminho aparece também no enunciado e no
  // próprio código, por isso o filtro pela frase inteira.
  await expect(page.getByText('precos/index.js — o seu arquivo')).toBeVisible();
  // Os vizinhos que o require encontra ficam à vista, acima do editor.
  await expect(page.getByText('./precos/total.js')).toBeVisible();
  await expect(page.getByText('./precos/moeda.js')).toBeVisible();
});

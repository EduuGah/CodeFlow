import { getLessonsOfTrack } from '../src/content';
import { concluirAula, escreverNoEditor, expect, irAteOEditor, test } from './fixtures';

/**
 * A trilha de Python (motor 6, Pyodide), no navegador de verdade.
 *
 * O que só o Chromium prova: o worker carrega o WebAssembly de verdade a
 * partir de `/pyodide/` (servido do próprio domínio), e o código do aluno
 * roda no CPython de verdade, não numa simulação.
 */
test.describe.configure({ mode: 'serial' });

for (const aula of getLessonsOfTrack('track-python')) {
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

/**
 * O código do aluno em Python não alcança a rede.
 *
 * O Pyodide expõe o escopo do worker ao Python (`import js`), e o worker
 * precisa de `fetch` para carregar os próprios arquivos — então a rede só é
 * trancada depois da carga, e este teste prova as duas coisas: o intérprete
 * continua funcionando, e `js.fetch` não existe mais para o aluno.
 */
test('o código Python não alcança a rede pelo escopo do worker', async ({ logado: page }) => {
  test.setTimeout(180_000);
  await page.goto('/lesson/lesson-py-1');
  await irAteOEditor(page);

  await escreverNoEditor(
    page,
    [
      'import js',
      'try:',
      '    js.fetch("https://example.com/")',
      // Montadas na execução: a frase inteira só existe na saída, não no
      // código que o editor mostra.
      '    print("REDE: " + "aber" + "ta")',
      'except Exception:',
      '    print("REDE: " + "fech" + "ada")',
    ].join('\n')
  );
  await page.getByRole('button', { name: /Executar código|Executar de novo/ }).click();

  await expect(page.getByText('REDE: fechada')).toBeVisible({ timeout: 120_000 });
  await expect(page.getByText('REDE: aberta')).toHaveCount(0);
});

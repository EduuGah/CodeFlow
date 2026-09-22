import { getLessonsOfTrack } from '../src/content';
import { concluirAula, expect, test } from './fixtures';

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

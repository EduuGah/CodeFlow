import { getLessonsOfTrack } from '../src/content';
import { concluirAula, expect, test } from './fixtures';

/**
 * A trilha de Terminal e Ferramentas, no navegador de verdade.
 *
 * Como em Git, não existe motor de terminal — os exercícios simulam o
 * raciocínio (caminhos, variáveis de ambiente, scripts, stack traces) em
 * JavaScript comum, nos tipos já provados nas outras trilhas. Este spec
 * prova que cada aula conclui de ponta a ponta, exercício por exercício, no
 * Chromium. Fecha a Fase 5.
 */
test.describe.configure({ mode: 'serial' });

for (const aula of getLessonsOfTrack('track-terminal')) {
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

import { getLessonsOfTrack } from '../src/content';
import { concluirAula, expect, test } from './fixtures';

/**
 * A trilha de Git e Equipe, no navegador de verdade.
 *
 * Não existe um motor de Git — os exercícios simulam o raciocínio (commits,
 * branches, conflitos) em JavaScript comum, nos mesmos tipos de exercício já
 * provados nas outras trilhas (código, encontrar o bug, escrever o teste,
 * múltipla escolha, ordenar passos). Este spec prova que cada aula conclui
 * de ponta a ponta, exercício por exercício, no Chromium.
 */
test.describe.configure({ mode: 'serial' });

for (const aula of getLessonsOfTrack('track-git')) {
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

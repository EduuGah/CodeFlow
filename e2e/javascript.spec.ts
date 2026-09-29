import { getLessonsOfTrack } from '../src/content/catalogo';
import { concluirAula, expect, test } from './fixtures';

/**
 * A trilha de Fundamentos de JavaScript, no navegador de verdade.
 *
 * É a primeira trilha do percurso e a que mais muda: as aulas ganham degraus
 * novos (o `map` sozinho antes do `filter` com `map`, os objetos em partes)
 * conforme quem estuda aponta onde travou. Os testes de conteúdo provam cada
 * solução no sandbox do Node; este spec prova que cada aula conclui de ponta
 * a ponta no Chromium, exercício por exercício — inclusive a previsão de uma
 * lista, que o `console.log` do navegador escreve sem espaço depois da
 * vírgula.
 */
test.describe.configure({ mode: 'serial' });

for (const aula of getLessonsOfTrack('track-js-fundamentos')) {
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

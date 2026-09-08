import { esperarConteudo, expect, irAteOEditor, test } from './fixtures';
import { getLesson } from '../src/content';
import { buildLessonSteps } from '../src/client/lib/lesson-steps';

/**
 * Comemoração e a preferência por menos movimento.
 *
 * O `prefers-reduced-motion` do CSS não alcança um canvas desenhado por
 * JavaScript, então o confete passava por baixo dele. Este é o único lugar onde a
 * regra pode ser conferida de verdade: o Playwright emula a preferência do
 * sistema, coisa que nenhum teste de unidade faz.
 */

const AULA = 'lesson-js-4';

function solucao(): string {
  for (const passo of buildLessonSteps(getLesson(AULA)!)) {
    if (passo.kind === 'exercise' && passo.exercise.type === 'code' && passo.exercise.solution) {
      return passo.exercise.solution;
    }
  }

  // Solução de referência é o que o CI usa para provar que o exercício é
  // resolvível; sem ela, este teste não teria como concluir a aula.
  throw new Error(`${AULA} não tem exercício de código com solução de referência`);
}

/**
 * Conta os canvas do confete.
 *
 * Contar `canvas` sem qualificar não serve: o Monaco cria três por conta própria
 * (a barra de rolagem e o minimapa), e um teste assim passa medindo o editor em
 * vez da comemoração. O confete é o único que a biblioteca pendura direto no
 * `body`.
 */
async function canvasDeConfete(page: import('@playwright/test').Page) {
  return page.evaluate(
    () => [...document.querySelectorAll('canvas')].filter((c) => c.parentElement === document.body).length
  );
}

async function resolver(page: import('@playwright/test').Page) {
  await page.goto(`/lesson/${AULA}`);
  await irAteOEditor(page);
  await page.evaluate((c) => {
    (window as unknown as { monaco: { editor: { getModels(): Array<{ setValue(v: string): void }> } } })
      .monaco.editor.getModels()[0].setValue(c);
  }, solucao());
  await page.getByRole('button', { name: 'Executar código' }).click();
  await expect(page.getByRole('button', { name: /Precisa de uma dica/ })).toHaveCount(0);
}

test.describe('sem restrição de movimento', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('a conclusão comemora', async ({ logado: page }) => {
    test.setTimeout(90_000);
    await resolver(page);

    await expect.poll(() => canvasDeConfete(page), { timeout: 8_000 }).toBeGreaterThan(0);
  });
});

test.describe('com menos movimento pedido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('a conclusão não dispara partículas', async ({ logado: page }) => {
    test.setTimeout(90_000);
    await resolver(page);

    // A confirmação continua: o que some é a explosão, não a notícia.
    await expect(page.getByRole('button', { name: /Continuar|Pular por ora/ })).toBeVisible();
    await page.waitForTimeout(2500);

    expect(await canvasDeConfete(page)).toBe(0);
  });

  test('as telas continuam navegáveis', async ({ logado: page }) => {
    await page.goto('/app');
    await esperarConteudo(page);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

import { AULA_CURTA, concluirAula, esperarConteudo, expect, test } from './fixtures';

/**
 * Comemoração e a preferência por menos movimento.
 *
 * O `prefers-reduced-motion` do CSS não alcança um canvas desenhado por
 * JavaScript, então o confete passava por baixo dele. Este é o único lugar onde a
 * regra pode ser conferida de verdade: o Playwright emula a preferência do
 * sistema, coisa que nenhum teste de unidade faz.
 */

/**
 * Em série, como o `resolver-exercicio`.
 *
 * Os dois testes daqui concluem uma aula inteira, o que significa três
 * execuções no sandbox cada um. Rodando ao mesmo tempo, na mesma máquina, eles
 * estouravam o limite de 3s do sandbox e o relatório acusava "laço que nunca
 * termina" numa solução de referência que leva dezenas de milissegundos.
 */
test.describe.configure({ mode: 'serial' });

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

/**
 * Conclui a aula inteira.
 *
 * A comemoração deixou de acontecer no primeiro exercício resolvido — soltar o
 * confete de aula concluída no meio dela dava a maior recompensa do produto no
 * momento errado, e deixava o fim da aula sem nada. Agora ela depende de todos
 * os exercícios fecharem, então o teste precisa fechar todos.
 */
async function resolver(page: import('@playwright/test').Page) {
  await concluirAula(page, AULA_CURTA);
}

test.describe('sem restrição de movimento', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('a conclusão comemora', async ({ logado: page }) => {
    test.setTimeout(150_000);
    await resolver(page);

    await expect.poll(() => canvasDeConfete(page), { timeout: 8_000 }).toBeGreaterThan(0);
  });
});

test.describe('com menos movimento pedido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('a conclusão não dispara partículas', async ({ logado: page }) => {
    test.setTimeout(150_000);
    await resolver(page);

    // A confirmação continua: o que some é a explosão, não a notícia.
    await expect(page.getByText('Aula concluída')).toBeVisible();
    await page.waitForTimeout(2500);

    expect(await canvasDeConfete(page)).toBe(0);
  });

  test('as telas continuam navegáveis', async ({ logado: page }) => {
    await page.goto('/app');
    await esperarConteudo(page);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

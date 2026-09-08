import { esperarConteudo, expect, irAteOEditor, test } from './fixtures';

/**
 * O que só se vê num navegador com largura de celular.
 *
 * O produto é mobile-first, e três coisas aqui nunca puderam ser conferidas: se o
 * editor consegue se dimensionar, se a barra inferior não come o fim do conteúdo,
 * e se algo estoura a largura da tela. Nenhuma delas existe em jsdom, e no painel
 * oculto o Monaco não recebe frame para se medir.
 */

test.describe('celular', () => {
  test.skip(({ isMobile }) => !isMobile, 'só no projeto de celular');

  test('nada estoura a largura da tela', async ({ logado: page }) => {
    for (const rota of ['/app', '/app/trilhas', '/app/praticar', '/app/perfil']) {
      await page.goto(rota);
      await esperarConteudo(page);

      const estouros = await page.evaluate(() => {
        const largura = document.documentElement.clientWidth;
        const culpados: string[] = [];

        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width === 0) continue;

          // Rolagem horizontal no celular é quase sempre um descuido de largura,
          // e o sintoma é a página inteira balançando de lado.
          if (r.right > largura + 1 || r.left < -1) {
            culpados.push(`${el.tagName}.${String(el.className).slice(0, 50)}`);
          }
        }

        return { culpados: culpados.slice(0, 5), rolaDeLado: document.documentElement.scrollWidth > largura + 1 };
      });

      expect(estouros.culpados, `em ${rota}`).toEqual([]);
      expect(estouros.rolaDeLado, `em ${rota}`).toBe(false);
    }
  });

  test('a barra inferior não esconde o fim do conteúdo', async ({ logado: page }) => {
    await page.goto('/app/trilhas');
    await esperarConteudo(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const medida = await page.evaluate(() => {
      const barras = [...document.querySelectorAll('nav[aria-label="Navegação principal"]')]
        .map((n) => n.getBoundingClientRect())
        .filter((r) => r.height > 0);

      const inferior = barras.sort((a, b) => b.top - a.top)[0];
      if (!inferior) return { temBarra: false, cobertos: [] as string[] };

      // O que interessa não é a altura da barra, é se ela come alguma coisa que o
      // aluno precisa alcançar. `pb-24` no main existe justamente para isso.
      const cobertos: string[] = [];

      for (const el of document.querySelectorAll('main a, main button')) {
        const r = el.getBoundingClientRect();
        if (r.height === 0) continue;

        const meio = r.top + r.height / 2;
        if (meio > inferior.top && meio < inferior.bottom) {
          cobertos.push(`${el.textContent?.trim().slice(0, 30) || el.tagName}`);
        }
      }

      return { temBarra: true, cobertos };
    });

    expect(medida.temBarra).toBe(true);
    expect(medida.cobertos, 'controles escondidos atrás da barra inferior').toEqual([]);
  });

  test('o editor de código se dimensiona na tela do celular', async ({ logado: page }) => {
    await page.goto('/lesson/lesson-js-4');
    await esperarConteudo(page);

    await irAteOEditor(page);

    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible();

    const caixa = (await editor.boundingBox())!;
    const largura = page.viewportSize()!.width;

    // O Monaco mede a si mesmo por ResizeObserver. Se o contêiner tiver altura
    // indefinida, ele colapsa para poucos pixels e o aluno não consegue digitar.
    expect(caixa.height).toBeGreaterThan(180);
    expect(caixa.width).toBeGreaterThan(largura * 0.8);
  });

  test('os alvos de toque têm tamanho de dedo', async ({ logado: page }) => {
    await page.goto('/app');
    await esperarConteudo(page);

    const pequenos = await page.evaluate(() => {
      const fora: string[] = [];

      for (const el of document.querySelectorAll('nav a, nav button')) {
        const r = el.getBoundingClientRect();
        if (r.height === 0) continue;

        // 44px é o mínimo recomendado para o polegar; abaixo disso o erro de
        // toque começa a aparecer.
        if (r.height < 44 || r.width < 44) {
          fora.push(`${el.textContent?.trim() || el.tagName}: ${Math.round(r.width)}x${Math.round(r.height)}`);
        }
      }

      return fora;
    });

    expect(pequenos).toEqual([]);
  });
});

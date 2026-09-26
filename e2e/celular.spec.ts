import { botaoDeAvanco, esperarConteudo, expect, irAteOEditor, responderErrado, test } from './fixtures';

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
    // Sete telas em sequência, cada uma esperando os dados do aluno.
    test.setTimeout(120_000);
    for (const rota of [
      '/app',
      '/app/trilhas',
      '/app/trilhas/track-pagina',
      '/app/praticar',
      '/app/perfil',
      '/app/perfil/loja',
      '/app/perfil/aparencia',
    ]) {
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
    // O Monaco são 3 MB: com a máquina ocupada por outro teste, o chunk pode
    // levar mais que os 30 s padrão só para chegar. O mesmo prazo do teste
    // do projeto, logo abaixo.
    test.setTimeout(90_000);
    await page.goto('/lesson/lesson-js-4');
    await esperarConteudo(page);

    await irAteOEditor(page);

    const editor = page.locator('.monaco-editor').first();
    await editor.waitFor({ timeout: 40_000 });
    await expect(editor).toBeVisible();

    const caixa = (await editor.boundingBox())!;
    const largura = page.viewportSize()!.width;

    // O Monaco mede a si mesmo por ResizeObserver. Se o contêiner tiver altura
    // indefinida, ele colapsa para poucos pixels e o aluno não consegue digitar.
    expect(caixa.height).toBeGreaterThan(180);
    expect(caixa.width).toBeGreaterThan(largura * 0.8);
  });

  /**
   * O projeto tem o mesmo editor da aula, mas com `height="100%"` dentro de
   * uma aba que começa oculta. São duas armadilhas que a aula não tem: um pai
   * sem altura definida colapsa o 100%, e um editor montado em `display:none`
   * não se mede sozinho. Este teste não existia, e o editor do projeto nunca
   * tinha sido conferido num navegador de verdade.
   */
  test('o editor do projeto se dimensiona depois de abrir a aba Código', async ({
    logado: page,
  }) => {
    await page.goto('/project/js-imc');
    await page.getByRole('tab', { name: 'Código' }).click();

    const editor = page.locator('.monaco-editor').first();
    await editor.waitFor({ timeout: 40_000 });

    // O Monaco pode aparecer antes de se medir: espera a caixa ter tamanho.
    await expect
      .poll(async () => (await editor.boundingBox())?.height ?? 0, { timeout: 15_000 })
      .toBeGreaterThan(180);

    const caixa = (await editor.boundingBox())!;
    expect(caixa.width).toBeGreaterThan(page.viewportSize()!.width * 0.8);

    // E dá para escrever nele: o modelo existe e aceita valor.
    await page.waitForFunction(
      () => {
        const m = (window as unknown as { monaco?: { editor: { getModels(): unknown[] } } })
          .monaco;
        return !!m && m.editor.getModels().length > 0;
      },
      undefined,
      { timeout: 40_000 }
    );
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

  test('nenhum link ou botão solto fica abaixo de 24 px', async ({ logado: page }) => {
    // WCAG 2.2, critério 2.5.8. A auditoria de 2026-09-26 mediu "← Perfil",
    // "Ver as trilhas" e os nomes de trilha do progresso com 20 a 22 px. Link
    // dentro de texto corrido fica de fora, como a própria regra permite.
    test.setTimeout(90_000);
    const telas = ['/app', '/app/trilhas', '/app/trilhas/track-js-fundamentos', '/app/praticar', '/app/praticar/erros', '/app/perfil',
      '/app/perfil/loja', '/app/perfil/desafios', '/app/perfil/conquistas', '/app/perfil/aparencia', '/app/perfil/progresso'];
    const pequenos: string[] = [];

    for (const tela of telas) {
      await page.goto(tela);
      await esperarConteudo(page);
      const daTela = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('a, button')]
          .filter((el) => !el.closest('p, .prose, .sr-only') && !el.classList.contains('sr-only'))
          .map((el) => ({ el, r: el.getBoundingClientRect() }))
          .filter(({ r }) => r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24))
          .map(({ el, r }) => `"${(el.textContent ?? '').trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`)
      );
      pequenos.push(...daTela.map((d) => `${tela}: ${d}`));
    }

    expect(pequenos).toEqual([]);
  });

  test('a aula não corta texto nem estoura a largura em nenhum passo', async ({
    logado: page,
  }) => {
    test.setTimeout(150_000);
    const { getLesson } = await import('../src/content');
    const { buildLessonSteps } = await import('../src/client/lib/lesson-steps');
    const passos = buildLessonSteps(getLesson('lesson-js-1')!);

    await page.goto('/lesson/lesson-js-1');
    await page.getByText(/Passo 1 de/).waitFor();

    const total = Number(
      (await page.getByText(/Passo \d+ de \d+/).textContent())!.match(/de (\d+)/)![1]
    );

    for (let passo = 1; passo <= total; passo++) {
      const problemas = await page.evaluate(() => {
        const largura = document.documentElement.clientWidth;
        const estouram: string[] = [];
        const cortados: string[] = [];

        /**
         * Bloco de código pode ser mais largo que a tela — desde que role.
         *
         * Quebrar linha de código à força prejudica a leitura, então esses
         * blocos ganham rolagem própria de propósito. O que não pode é
         * conteúdo largo **sem** rolagem: aí ele simplesmente some.
         */
        const dentroDeAlgoQueRola = (el: Element) => {
          for (let p = el.parentElement; p && p.tagName !== 'MAIN'; p = p.parentElement) {
            const ox = getComputedStyle(p).overflowX;
            if (ox === 'auto' || ox === 'scroll') return true;
          }
          return false;
        };

        for (const el of document.querySelectorAll('main *')) {
          const r = el.getBoundingClientRect();

          // Fora: o que não ocupa espaço, e o que é só para leitor de tela — o
          // padrão `sr-only` recorta o elemento a 1px, então ele "corta" texto
          // por construção.
          if (r.width <= 1 || r.height <= 1 || dentroDeAlgoQueRola(el)) continue;

          if (r.right > largura + 1 || r.left < -1) {
            estouram.push(`${el.tagName}.${String(el.className).slice(0, 40)}`);
          }

          // Texto largo demais para a própria caixa, sem rolagem própria.
          // Foi assim que uma alternativa de múltipla escolha ficou ilegível no
          // celular: o nome de variável longo é uma palavra só, e sem
          // `overflow-wrap` ele era simplesmente cortado.
          const estilo = getComputedStyle(el);
          const rola = estilo.overflowX === 'auto' || estilo.overflowX === 'scroll';
          if (!rola && el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
            cortados.push(
              `${el.tagName}: "${(el.textContent ?? '').slice(0, 40)}" ${el.scrollWidth}>${el.clientWidth}`
            );
          }
        }

        return { estouram: estouram.slice(0, 4), cortados: cortados.slice(0, 4) };
      });

      expect(problemas.estouram, `passo ${passo}`).toEqual([]);
      expect(problemas.cortados, `passo ${passo}`).toEqual([]);

      // O exercício do passo precisa de uma resposta para liberar o seguinte.
      const atual = passos[passo - 1];
      if (atual.kind === 'exercise') await responderErrado(page, atual.exercise);
      const avancar = botaoDeAvanco(page);
      if (!(await avancar.count())) break;
      await avancar.click();
    }
  });

  test('os controles da aula têm tamanho de dedo', async ({ logado: page }) => {
    await page.goto('/lesson/lesson-js-1');
    await page.getByText(/Passo 1 de/).waitFor();

    // Até a múltipla escolha, que é o passo com mais controles.
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('radio').first().waitFor();

    const pequenos = await page.evaluate(() => {
      const fora: string[] = [];

      for (const el of document.querySelectorAll('button, a[href], label')) {
        const r = el.getBoundingClientRect();
        if (r.height === 0) continue;

        if (r.height < 44 || r.width < 44) {
          fora.push(
            `${el.textContent?.trim().slice(0, 30) || el.getAttribute('aria-label')}: ${Math.round(r.width)}x${Math.round(r.height)}`
          );
        }
      }

      return fora;
    });

    expect(pequenos).toEqual([]);
  });
});

import { esperarConteudo, expect, test } from './fixtures';

/**
 * A aula percorrida por teclado num navegador de verdade.
 *
 * O Vitest já cobre a ordem de tabulação e o foco. O que ele não pode cobrir é
 * tudo que depende de layout e CSS: se o cabeçalho fixo cobre o elemento focado,
 * se o anel de foco realmente aparece, se o link de pulo sai do `sr-only`. Em
 * jsdom nada disso existe — `:focus` chega a não casar sem foco de janela.
 */

const AULA = 'lesson-js-4';

test('o link de pulo aparece de verdade quando recebe foco', async ({ logado: page }) => {
  await page.goto('/app');

  const pulo = page.getByRole('link', { name: 'Pular para o conteúdo' });

  // Escondido enquanto ninguém precisa dele.
  await expect(pulo).not.toBeInViewport();

  await page.keyboard.press('Tab');
  await expect(pulo).toBeFocused();

  // O teste que só o navegador faz: o `focus:not-sr-only` vence o `sr-only`?
  await expect(pulo).toBeInViewport();

  const caixa = (await pulo.boundingBox())!;
  expect(caixa.width).toBeGreaterThan(80);
  expect(caixa.height).toBeGreaterThan(24);

  // E ele fica por cima, não atrás da lateral.
  const noTopo = await page.evaluate(([x, y]) => {
    const alvo = document.elementFromPoint(x, y);
    return alvo?.closest('a')?.textContent?.trim();
  }, [caixa.x + caixa.width / 2, caixa.y + caixa.height / 2] as const);

  expect(noTopo).toBe('Pular para o conteúdo');
});

test('o pulo leva o foco ao conteúdo, não só a rolagem', async ({ logado: page }) => {
  await page.goto('/app');

  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');

  // Sem `tabindex="-1"` no <main>, a âncora rolaria e o foco continuaria no menu.
  await expect(page.locator('main#conteudo')).toBeFocused();
});

test('nenhum elemento focado fica escondido atrás das barras fixas', async ({ logado: page }) => {
  await page.goto(`/lesson/${AULA}`);
  await esperarConteudo(page);

  const problemas: string[] = [];

  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');

    const relato = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;

      // Os controles das próprias barras moram dentro delas; só o conteúdo pode
      // ser encoberto.
      if (el.closest('header') || el.closest('footer')) return null;

      const caixa = el.getBoundingClientRect();
      if (caixa.width === 0 || caixa.height === 0) return null;

      const cabecalho = document.querySelector('header')!.getBoundingClientRect();
      const rodape = document.querySelector('footer')!.getBoundingClientRect();

      const nome = (el.getAttribute('aria-label') || el.textContent || el.tagName)
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 40);

      return {
        nome,
        // O navegador rola o elemento focado até a borda da janela e não conta as
        // barras fixas. Medido: um bloco de código rolável ficava 73px atrás do
        // rodapé — exatamente a altura dele.
        atrasDoRodape: Math.max(0, Math.round(caixa.bottom - rodape.top)),
        atrasDoCabecalho: Math.max(0, Math.round(cabecalho.bottom - caixa.top)),
        alturaVisivel: Math.round(
          Math.min(caixa.bottom, rodape.top) - Math.max(caixa.top, cabecalho.bottom)
        ),
        altura: Math.round(caixa.height),
        // Espaço livre entre as barras: é o que o navegador tem para trabalhar.
        espacoEntreBarras: Math.round(rodape.top - cabecalho.bottom),
        forcaRolagemLateral: Math.round(Math.max(0, caixa.right - window.innerWidth)),
      };
    });

    if (!relato) continue;

    // Se o elemento cabe entre as barras, ele tem que estar inteiro à vista: o
    // navegador tinha espaço e escolheu rolar para debaixo de uma delas.
    if (relato.altura <= relato.espacoEntreBarras) {
      if (relato.atrasDoRodape > 0) {
        problemas.push(`"${relato.nome}" ${relato.atrasDoRodape}px atrás do rodapé (cabia inteiro)`);
      }
      if (relato.atrasDoCabecalho > 0) {
        problemas.push(
          `"${relato.nome}" ${relato.atrasDoCabecalho}px atrás do cabeçalho (cabia inteiro)`
        );
      }
    } else if (relato.alturaVisivel < relato.espacoEntreBarras - 4) {
      // Maior que o espaço livre: aí o mínimo é ocupar todo o espaço que existe.
      problemas.push(
        `"${relato.nome}" mostra ${relato.alturaVisivel}px de ${relato.espacoEntreBarras}px disponíveis`
      );
    }

    if (relato.forcaRolagemLateral > 1) {
      problemas.push(`"${relato.nome}" ${relato.forcaRolagemLateral}px fora da largura da tela`);
    }
  }

  expect(problemas).toEqual([]);
});

test('o elemento focado tem indicador visível', async ({ logado: page }) => {
  await page.goto(`/lesson/${AULA}`);
  await esperarConteudo(page);

  const semAnel: string[] = [];

  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');

    const relato = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body || el.tabIndex < 0) return null;

      const cs = getComputedStyle(el);
      const largura = parseFloat(cs.outlineWidth) || 0;
      const temAnel =
        (largura > 0 && cs.outlineStyle !== 'none') || cs.boxShadow !== 'none';

      return {
        nome: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 40),
        temAnel,
      };
    });

    if (relato && !relato.temAnel) semAnel.push(relato.nome);
  }

  // Sem indicador, quem navega por teclado não sabe onde está.
  expect(semAnel).toEqual([]);
});

test('a aula inteira se percorre sem mouse', async ({ logado: page }) => {
  await page.goto(`/lesson/${AULA}`);

  const contador = page.getByText(/Passo \d+ de \d+/);
  await contador.waitFor();

  const total = Number((await contador.textContent())!.match(/de (\d+)/)![1]);
  expect(total).toBeGreaterThan(1);

  // Avança até o fim usando só o teclado, tabulando até a ação principal.
  for (let passo = 1; passo < total; passo++) {
    const acao = page.getByRole('button', { name: /Continuar|Pular por ora/ });
    await acao.waitFor();

    for (let i = 0; i < 20 && !(await acao.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press('Tab');
    }

    await expect(acao).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(contador).toContainText(`Passo ${passo + 1} de ${total}`);

    // A cada troca o foco vai para o conteúdo novo.
    await expect(page.getByRole('main')).toBeFocused();
  }

  await expect(page.getByText('Aula concluída')).toBeVisible();
});

test('o cabeçalho fixo não cobre o conteúdo ao rolar', async ({ logado: page }) => {
  await page.goto(`/lesson/${AULA}`);
  await esperarConteudo(page);

  await page.mouse.wheel(0, 400);

  const sobreposicao = await page.evaluate(() => {
    const cabecalho = document.querySelector('header')!.getBoundingClientRect();
    const rodape = document.querySelector('footer')!.getBoundingClientRect();

    return {
      cabecalhoNoTopo: Math.round(cabecalho.top),
      rodapeEncostado: Math.round(window.innerHeight - rodape.bottom),
    };
  });

  // Tolerância de 1px: a medida vem de subtração de floats arredondada, e a
  // exigência é "a barra está encostada", não um inteiro exato.
  expect(Math.abs(sobreposicao.cabecalhoNoTopo)).toBeLessThanOrEqual(1);
  expect(Math.abs(sobreposicao.rodapeEncostado)).toBeLessThanOrEqual(1);
});

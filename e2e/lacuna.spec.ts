import { esperarConteudo, expect, test } from './fixtures';

/**
 * Exercício de lacuna, no navegador.
 *
 * Os campos moram dentro de um bloco `<pre>`, o que é justamente o que nenhum
 * teste de DOM consegue avaliar: se o código continua legível como código, se a
 * indentação sobrevive à digitação, e se o campo cabe num toque de polegar.
 */

const AULA = 'lesson-js-5';

/** Avança pelos passos até o exercício de lacuna aparecer. */
async function irAteALacuna(page: import('@playwright/test').Page) {
  await page.goto(`/lesson/${AULA}`);
  await esperarConteudo(page);

  const verificar = page.getByRole('button', { name: /Verificar|Preencha todas as lacunas/ });

  for (let i = 0; i < 12 && !(await verificar.count()); i++) {
    const acao = page.getByRole('button', { name: /Continuar|Pular por ora/ });
    if (!(await acao.count())) break;
    await acao.click();
  }

  await verificar.waitFor({ timeout: 10_000 });
}

test('as lacunas viram campos dentro do código', async ({ logado: page }) => {
  await irAteALacuna(page);

  const campos = page.getByRole('textbox', { name: /Lacuna \d+ de \d+/ });
  await expect(campos).toHaveCount(2);

  // Dentro do bloco de código, não num formulário separado: é o que faz o aluno
  // ler o programa em vez de preencher um cadastro.
  const dentro = await page.evaluate(() =>
    [...document.querySelectorAll('input[aria-label^="Lacuna"]')].every((i) => !!i.closest('pre'))
  );
  expect(dentro).toBe(true);
});

test('o botão só libera quando tudo está preenchido', async ({ logado: page }) => {
  await irAteALacuna(page);

  const botao = page.getByRole('button', { name: /Preencha todas as lacunas/ });
  await expect(botao).toBeDisabled();

  const campos = page.getByRole('textbox', { name: /Lacuna/ });
  await campos.nth(0).fill('*');
  await expect(botao).toBeDisabled();

  await campos.nth(1).fill('return');
  await expect(page.getByRole('button', { name: 'Verificar' })).toBeEnabled();
});

test('uma resposta que funciona é aceita, mesmo escrita de outro jeito', async ({
  logado: page,
}) => {
  await irAteALacuna(page);

  const campos = page.getByRole('textbox', { name: /Lacuna/ });
  // A solução de referência é `*`. Isto calcula o mesmo resultado por outro
  // caminho — e a correção roda os testes, não compara com um gabarito.
  await campos.nth(0).fill('* 2 / 2 *');
  await campos.nth(1).fill('return');

  await page.getByRole('button', { name: 'Verificar' }).click();

  await expect(page.getByRole('status')).toContainText('devolve 12', { timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Verificar' })).toHaveCount(0);
});

test('resposta errada explica, e deixa tentar de novo', async ({ logado: page }) => {
  await irAteALacuna(page);

  const campos = page.getByRole('textbox', { name: /Lacuna/ });
  await campos.nth(0).fill('+');
  await campos.nth(1).fill('return');
  await page.getByRole('button', { name: 'Verificar' }).click();

  await expect(page.getByRole('status')).toContainText('deveria devolver 12', { timeout: 15_000 });
  // O botão continua: errar não encerra o exercício.
  await expect(page.getByRole('button', { name: 'Verificar' })).toBeVisible();
});

test('mexer numa lacuna descarta o resultado anterior', async ({ logado: page }) => {
  await irAteALacuna(page);

  const campos = page.getByRole('textbox', { name: /Lacuna/ });
  await campos.nth(0).fill('+');
  await campos.nth(1).fill('return');
  await page.getByRole('button', { name: 'Verificar' }).click();
  await expect(page.getByRole('status')).toBeVisible({ timeout: 15_000 });

  await campos.nth(0).fill('*');

  // Manter o resultado na tela enquanto o código já é outro seria mentira.
  await expect(page.getByRole('status')).toHaveCount(0);
});

test('o código continua legível e não estoura a largura', async ({ logado: page }) => {
  await irAteALacuna(page);

  const medida = await page.evaluate(() => {
    const pre = document.querySelector('pre')!;
    const caixa = pre.getBoundingClientRect();
    const campos = [...document.querySelectorAll('input[aria-label^="Lacuna"]')].map((i) => {
      const r = i.getBoundingClientRect();
      return { alt: Math.round(r.height), larg: Math.round(r.width) };
    });

    return {
      preDentroDaTela: caixa.right <= window.innerWidth + 1,
      rolagemLateralDaPagina: document.documentElement.scrollWidth > window.innerWidth + 1,
      campos,
    };
  });

  expect(medida.preDentroDaTela).toBe(true);
  expect(medida.rolagemLateralDaPagina).toBe(false);

  for (const campo of medida.campos) {
    // Campo minúsculo dentro de um bloco de código é fácil de errar no toque.
    expect(campo.alt).toBeGreaterThanOrEqual(24);
    expect(campo.larg).toBeGreaterThanOrEqual(32);
  }
});

test('dá para preencher e verificar só com o teclado', async ({ logado: page }) => {
  await irAteALacuna(page);

  const primeiro = page.getByRole('textbox', { name: 'Lacuna 1 de 2' });
  await primeiro.focus();
  await page.keyboard.type('*');
  await page.keyboard.press('Tab');

  await expect(page.getByRole('textbox', { name: 'Lacuna 2 de 2' })).toBeFocused();
  await page.keyboard.type('return');
  await page.keyboard.press('Tab');

  await expect(page.getByRole('button', { name: 'Verificar' })).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('status')).toBeVisible({ timeout: 15_000 });

  // O botão some ao acertar. Sem resgate, o foco cai no corpo do documento e a
  // tabulação seguinte recomeça do topo da página.
  const focoNoRetorno = await page.evaluate(() => {
    const status = document.querySelector('[role="status"]');
    const ativo = document.activeElement;
    return !!status && !!ativo && ativo !== document.body && status.contains(ativo);
  });

  expect(focoNoRetorno).toBe(true);
});

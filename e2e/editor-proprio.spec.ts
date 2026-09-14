import { expect, irAteOEditor, test } from './fixtures';

/**
 * O editor vem do próprio domínio, e funciona sem nenhuma rede além dele.
 *
 * O Monaco vinha de `cdn.jsdelivr.net` em tempo de execução. Numa rede que
 * bloqueia CDN — a de muita escola — o aluno abria o exercício e encontrava um
 * retângulo vazio. Este teste é a rede da escola: toda requisição que sai do
 * domínio do aplicativo é abortada, e o editor precisa aparecer assim mesmo.
 *
 * Roda em série: o Monaco em modo de desenvolvimento são centenas de módulos,
 * e dividir a máquina com outros testes já fez o editor levar mais de 40s.
 */
test.describe.configure({ mode: 'serial' });

test('o editor monta com toda rede externa bloqueada', async ({ logado: page }) => {
  test.setTimeout(120_000);

  const externas: string[] = [];

  await page.route('**/*', async (rota) => {
    const url = new URL(rota.request().url());
    const propria = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    // As rotas rodam na ordem inversa do registro: esta vê tudo primeiro. O
    // dublê do Supabase precisa continuar recebendo o que é dele.
    const supabase = url.hostname.endsWith('supabase.co');
    if (propria || supabase) return rota.fallback();

    // O resto — fonte, CDN, o que mais alguém adicionar no futuro — é a rede
    // da escola bloqueando.
    externas.push(url.hostname);
    return rota.abort('blockedbyclient');
  });

  await page.goto('/lesson/lesson-js-1');
  await irAteOEditor(page);

  // Não é só o elemento: o modelo existe, então o editor está de pé de verdade.
  const modelos = await page.evaluate(
    () => window.monaco?.editor.getModels().length ?? 0
  );
  expect(modelos).toBeGreaterThan(0);

  // E nenhuma tentativa de buscar o editor fora de casa.
  expect(externas.filter((h) => h.includes('jsdelivr'))).toEqual([]);
});

test('o serviço de linguagem roda — o erro de sintaxe é sublinhado antes de executar', async ({
  logado: page,
}) => {
  test.setTimeout(120_000);

  await page.goto('/lesson/lesson-js-1');
  await irAteOEditor(page);

  // Um programa que não compila. O worker de TypeScript é quem marca isso, e
  // ele é um arquivo à parte — se o caminho dele estivesse errado, o editor
  // apareceria normalmente e ficaria mudo.
  await page.evaluate(() => {
    window.monaco!.editor.getModels()[0].setValue('const = ;');
  });

  await expect
    .poll(
      () =>
        page.evaluate(() =>
          window.monaco!.editor.getModelMarkers({}).filter((m) => m.severity === 8).length
        ),
      { timeout: 30_000 }
    )
    .toBeGreaterThan(0);
});

test('o editor tem a cor dos blocos de código da aula', async ({ logado: page }) => {
  test.setTimeout(120_000);

  await page.goto('/lesson/lesson-js-1');
  await irAteOEditor(page);

  // `--color-editor` do index.css. O tema `codeflow` existe para o editor e o
  // `<pre>` ao lado dele serem a mesma superfície; se alguém voltar ao
  // `vs-dark`, aparece o cinza #1e1e1e aqui.
  const fundo = await page.evaluate(() => {
    const el = document.querySelector('.monaco-editor .monaco-editor-background')!;
    return getComputedStyle(el).backgroundColor;
  });
  expect(fundo).toBe('rgb(23, 33, 31)');
});

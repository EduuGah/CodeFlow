import { getLessonsOfTrack } from '../src/content';
import { concluirAula, expect, irAteOEditor, test } from './fixtures';

/**
 * O motor de React, no navegador de verdade.
 *
 * O CI compila o TSX e monta o componente no jsdom. Aqui é o Chromium: o
 * worker do Monaco compila, o React embutido monta dentro do `<iframe
 * sandbox>` — com a CSP valendo, o que o jsdom não prova — e o aluno vê o
 * componente na pré-visualização.
 *
 * Em série, como os outros motores: o worker de TypeScript e o React
 * embutido disputam a máquina com qualquer outro teste.
 */
test.describe.configure({ mode: 'serial' });

const AULA = 'lesson-react-1';

// Toda aula da trilha: cada aula nova de React entra aqui sozinha.
for (const aula of getLessonsOfTrack('track-react')) {
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

test('o componente aparece no iframe, e um clique nele atualiza a tela', async ({
  logado: page,
}) => {
  test.setTimeout(120_000);

  await page.goto(`/lesson/${AULA}`);
  await irAteOEditor(page);

  await expect(page.getByText('O componente aparece aqui quando você rodar o código.')).toBeVisible();

  await page.evaluate(() => {
    window.monaco!.editor.getModels()[0].setValue(
      [
        'function App() {',
        '  const [n, setN] = React.useState(0);',
        '  return <button onClick={() => setN(n + 1)}>Cliques: {n}</button>;',
        '}',
      ].join('\n')
    );
  });
  await page.getByRole('button', { name: 'Rodar o componente' }).click();

  // O componente montou dentro do iframe, e é interativo de verdade: o clique
  // é do usuário, não do teste de conteúdo.
  const iframe = page.frameLocator('iframe[title="Pré-visualização da página"]');
  const botao = iframe.getByRole('button', { name: /Cliques: 0/ });
  await botao.waitFor({ timeout: 60_000 });
  await botao.click();
  await expect(iframe.getByRole('button', { name: /Cliques: 1/ })).toBeVisible();

  // A CSP vale lá dentro: nenhum script de fora, nem do próprio domínio.
  await expect(page.locator('iframe[title="Pré-visualização da página"]')).toHaveAttribute(
    'sandbox',
    'allow-scripts allow-modals allow-forms'
  );
});

test('um erro de tipo no componente é recusado antes de montar', async ({ logado: page }) => {
  test.setTimeout(120_000);

  await page.goto(`/lesson/${AULA}`);
  await irAteOEditor(page);

  await page.evaluate(() => {
    window.monaco!.editor.getModels()[0].setValue(
      [
        'function Saudacao({ nome }: { nome: string }) { return <h1>{nome}</h1>; }',
        'function App() { return <Saudacao />; }',
      ].join('\n')
    );
  });
  await page.getByRole('button', { name: 'Rodar o componente' }).click();

  await page.getByText(/O compilador recusou o programa/).waitFor({ timeout: 60_000 });
  await expect(page.getByText('Linha 2')).toBeVisible();
  await expect(page.getByText(/Property 'nome' is missing/)).toBeVisible();

  // E o editor concorda: o único marcador está na linha 2.
  await expect
    .poll(() =>
      page.evaluate(() =>
        window
          .monaco!.editor.getModelMarkers({})
          .filter((m) => m.severity === 8)
          .map((m) => m.startLineNumber)
      )
    )
    .toEqual([2]);
});

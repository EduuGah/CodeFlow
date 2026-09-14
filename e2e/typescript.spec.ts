import { getLessonsOfTrack } from '../src/content';
import { concluirAula, expect, irAteOEditor, test } from './fixtures';

/**
 * O motor de TypeScript, no navegador de verdade.
 *
 * O CI compila cada exercício com o pacote `typescript` no Node. Aqui é o
 * outro compilador — o worker do Monaco — que precisa recusar e aceitar as
 * mesmas coisas, e mostrar a recusa ao aluno de um jeito que se lê.
 *
 * Em série: o worker de TypeScript em modo de desenvolvimento é o arquivo
 * mais pesado do aplicativo, e dividir a máquina com outro teste já fez o
 * editor demorar mais que o prazo.
 */
test.describe.configure({ mode: 'serial' });

const AULA = 'lesson-ts-1';

// Toda aula da trilha: cada aula nova de TypeScript entra aqui sozinha.
for (const aula of getLessonsOfTrack('track-typescript')) {
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

test('um erro de tipo é recusado antes de rodar, com linha e explicação', async ({
  logado: page,
}) => {
  test.setTimeout(120_000);

  await page.goto(`/lesson/${AULA}`);
  await irAteOEditor(page);

  await page.evaluate(() => {
    window.monaco!.editor
      .getModels()[0]
      .setValue("function somar(a: number, b: number): number {\n  return a + b;\n}\nconst x: number = 'a';\nconsole.log('rodou');");
  });
  await page.getByRole('button', { name: /Executar código|Executar de novo/ }).click();

  // A recusa, com a mensagem original e a explicação em português, na linha certa.
  const recusa = page.getByText(/O compilador recusou o programa/);
  await recusa.waitFor({ timeout: 60_000 });
  await expect(page.getByText('Linha 4')).toBeVisible();
  await expect(page.getByText("Type 'string' is not assignable to type 'number'.")).toBeVisible();
  await expect(page.getByText('Um valor do tipo string não cabe onde se espera number.')).toBeVisible();

  // Nada rodou: não há painel de saída nem veredito de testes.
  await expect(page.getByText('Saída', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Todos os testes passaram')).toHaveCount(0);

  // E o editor continua sublinhando só o erro de verdade. Compilar num
  // modelo temporário já fez o serviço do editor ver a função duas vezes e
  // marcar "Duplicate function implementation" num código certo.
  await expect
    .poll(() =>
      page.evaluate(() =>
        window
          .monaco!.editor.getModelMarkers({})
          .filter((m) => m.severity === 8)
          .map((m) => m.startLineNumber)
      )
    )
    .toEqual([4]);
});

test('o trecho que precisa ser recusado reprova o tipo frouxo e aprova o certo', async ({
  logado: page,
}) => {
  test.setTimeout(120_000);

  await page.goto(`/lesson/${AULA}`);
  await irAteOEditor(page);

  // O esqueleto com `any` roda e passa nos testes de comportamento — mas o
  // compilador aceita somar('2', 3), e é isso que o trecho reprova.
  await page.getByRole('button', { name: /Executar código/ }).click();
  await page.getByText(/testes? falh/).waitFor({ timeout: 60_000 });
  await expect(page.getByText(/mas o compilador aceitou/).first()).toBeVisible();
  await expect(page.getByText('somar(2, 3) devolve 5')).toBeVisible();

  await page.evaluate(() => {
    window.monaco!.editor
      .getModels()[0]
      .setValue('function somar(a: number, b: number): number {\n  return a + b;\n}');
  });
  await page.getByRole('button', { name: /Executar de novo/ }).click();
  await page.getByText('Todos os testes passaram').waitFor({ timeout: 60_000 });
  await expect(page.getByText("o compilador recusa somar('2', 3)")).toBeVisible();
});

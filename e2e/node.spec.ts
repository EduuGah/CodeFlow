import { getLessonsOfTrack } from '../src/content';
import { concluirAula, expect, irAteOExercicio, test } from './fixtures';

/**
 * O motor 4, o servidor simulado, no navegador de verdade.
 *
 * O CI roda cada exercício de servidor no Node, com o mesmo prelúdio. Aqui é
 * o Chromium: o Node de mentira vai dentro do worker descartável, os testes
 * rodam em série contra o servidor do aluno, e a tela mostra cada pedido e
 * cada resposta — o que só existe no navegador.
 *
 * Em série, como os outros motores: o Monaco e o worker disputam a máquina
 * com qualquer outro teste.
 */
test.describe.configure({ mode: 'serial' });

// Toda aula da trilha: cada aula nova de Node entra aqui sozinha.
for (const aula of getLessonsOfTrack('track-node')) {
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

test('os pedidos e as respostas aparecem como num cliente de API, com o status de cada um', async ({
  logado: page,
}) => {
  test.setTimeout(120_000);

  // A aula do POST: o primeiro exercício de servidor cria tarefas.
  await page.goto('/lesson/lesson-node-4');
  await irAteOExercicio(page, (e) => e.type === 'server');

  // Os arquivos e o ambiente do exercício ficam à vista antes de rodar; este
  // não tem nenhum, mas o editor e o botão do servidor precisam estar lá.
  await page.locator('.monaco-editor').first().waitFor({ timeout: 90_000 });
  await page.waitForFunction(
    () => {
      const m = (window as unknown as { monaco?: { editor: { getModels(): unknown[] } } }).monaco;
      return !!m && m.editor.getModels().length > 0;
    },
    undefined,
    { timeout: 40_000 }
  );

  // O código inicial não tem a rota: o POST cai no 404 padrão do Express
  // pequeno, e a tela mostra o pedido, o corpo enviado e o status vermelho.
  await page.getByRole('button', { name: 'Rodar o servidor' }).click();
  await expect(page.getByText(/verificaç(ão|ões) falh(ou|aram)/)).toBeVisible({ timeout: 40_000 });
  const trocas = page.getByText('Pedidos e respostas').locator('..').locator('..');
  await expect(trocas).toBeVisible();
  await expect(trocas.getByText('POST', { exact: true }).first()).toBeVisible();
  await expect(trocas.getByText('/tarefas', { exact: true }).first()).toBeVisible();
  await expect(trocas.getByText('404', { exact: true }).first()).toBeVisible();
  await expect(trocas.getByText('→ {"titulo":"Estudar Node"}')).toBeVisible();

  // Com a rota escrita, o mesmo pedido responde 201, e o veredito muda.
  await page.evaluate(() => {
    window.monaco!.editor.getModels()[0].setValue(
      [
        "const express = require('express');",
        'const app = express();',
        'app.use(express.json());',
        'const tarefas = [];',
        "app.get('/tarefas', (req, res) => res.json(tarefas));",
        "app.post('/tarefas', (req, res) => {",
        '  const tarefa = { id: tarefas.length + 1, titulo: req.body.titulo, feita: false };',
        '  tarefas.push(tarefa);',
        '  res.status(201).json(tarefa);',
        '});',
        'app.listen(3000);',
      ].join('\n')
    );
  });
  await page.getByRole('button', { name: 'Rodar de novo' }).click();
  await expect(page.getByText('O servidor respondeu tudo como esperado')).toBeVisible({ timeout: 40_000 });
  await expect(trocas.getByText('201', { exact: true }).first()).toBeVisible();
  await expect(trocas.getByText('← {"id":1,"titulo":"Estudar Node","feita":false}')).toBeVisible();
});

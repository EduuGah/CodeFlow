import { getLesson } from '../src/content';
import { esperarConteudo, expect, test, type BancoFalso } from './fixtures';

/**
 * O Caderno de Erros no navegador: o erro aparece com o que foi respondido, e
 * refazer grava a tentativa nova — com a resposta, para o próximo erro também
 * ter evidência.
 *
 * Dois exercícios de verdade do catálogo: uma múltipla escolha errada e ainda
 * sem conserto, e um de código errado e depois acertado (em dia, volta em três
 * dias).
 */

const ESCOLHA = 'ex-js-4-voltas';
const CODIGO = 'ex-js-2-somar';

function semear(banco: BancoFalso) {
  const dia = (n: number, h: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(h, 0, 0, 0);
    return d.toISOString();
  };
  banco.attempts = [
    {
      exercise_id: ESCOLHA,
      lesson_id: 'lesson-js-4',
      concepts: ['lacos'],
      correct: false,
      hints_used: 0,
      created_at: dia(2, 9),
      resposta: { tipo: 'alternativa', indice: 2 },
      feedback: null,
    },
    {
      exercise_id: CODIGO,
      lesson_id: 'lesson-js-2',
      concepts: ['tipos'],
      correct: false,
      hints_used: 0,
      created_at: dia(1, 9),
      resposta: { tipo: 'codigo', codigo: 'function somar(a, b) {\n  return a + b;\n}' },
      feedback: 'Esperado 5, recebido "23".',
    },
    { exercise_id: CODIGO, lesson_id: 'lesson-js-2', concepts: ['tipos'], correct: true, hints_used: 0, created_at: dia(1, 10) },
  ];
}

test('Praticar leva ao caderno, que mostra o erro com o que foi respondido', async ({ logado: page, banco }) => {
  semear(banco);
  await page.goto('/app/praticar');
  await esperarConteudo(page);

  await page.getByRole('link', { name: /1 exercício para refazer/ }).click();
  await expect(page).toHaveURL(/\/app\/praticar\/erros$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Caderno de erros' })).toBeVisible();

  // A múltipla escolha: o texto da alternativa marcada, não o índice.
  const escolha = page.getByRole('article').filter({ hasText: 'Para refazer' });
  await expect(escolha.getByText('O que você respondeu')).toBeVisible();
  await expect(escolha.getByText('6 vezes', { exact: true })).toBeVisible();

  // O de código: em dia, com o código enviado e o retorno que a pessoa leu.
  const codigo = page.getByRole('article').filter({ hasText: 'Em dia' });
  await expect(codigo.getByText('return a + b;')).toBeVisible();
  await expect(codigo.getByText('Esperado 5, recebido "23".')).toBeVisible();
  await expect(codigo.getByText(/volta em/)).toBeVisible();
  await expect(codigo.getByRole('link', { name: /^Refazer/ })).toHaveAttribute('href', `/refazer?exercicio=${CODIGO}`);

  // Código longo e alternativas não podem empurrar a página para o lado.
  const rolaDeLado = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );
  expect(rolaDeLado).toBe(false);
});

test('refazer grava o que foi enviado; o acerto fecha a sessão', async ({ logado: page, banco }) => {
  semear(banco);
  const aula = getLesson('lesson-js-4')!;
  await page.goto('/app/praticar/erros');
  await esperarConteudo(page);

  await page.getByRole('link', { name: /Refazer agora/ }).click();
  await expect(page).toHaveURL(/\/refazer$/);
  await expect(page.getByText('1 de 1')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(aula.title)).toBeVisible();

  // Errar de novo: a tentativa vai com a alternativa marcada.
  await page.getByRole('radio', { name: '4 vezes' }).check();
  await page.getByRole('button', { name: 'Verificar resposta' }).click();
  await expect
    .poll(
      () =>
        banco.escritas.find(
          (e) => e.tabela === 'exercise_attempts' && (e.corpo as { correct?: boolean }).correct === false
        )?.corpo,
      { timeout: 10_000 }
    )
    .toMatchObject({ exercise_id: ESCOLHA, resposta: { tipo: 'alternativa', indice: 0 } });

  // Acertar: a tentativa certa vai sem resposta (o caderno só mostra erro).
  await page.getByRole('radio', { name: '5 vezes' }).check();
  await page.getByRole('button', { name: /Verificar/ }).click();
  await expect(page.getByText('Resposta correta')).toBeVisible();
  await expect
    .poll(() =>
      banco.escritas.find((e) => e.tabela === 'exercise_attempts' && (e.corpo as { correct?: boolean }).correct === true)
    )
    .toBeTruthy();
  const certa = banco.escritas.find(
    (e) => e.tabela === 'exercise_attempts' && (e.corpo as { correct?: boolean }).correct === true
  )!.corpo;
  expect(certa).not.toHaveProperty('resposta');

  await page.getByRole('button', { name: 'Terminar' }).click();
  await expect(page.getByRole('heading', { name: 'Sessão concluída' })).toBeVisible();
  await expect(page.getByText(/Você acertou o exercício/)).toBeVisible();

  await page.getByRole('link', { name: 'Voltar ao caderno', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/praticar\/erros$/);
});

test('sem erro nenhum, o caderno diz como ele se enche', async ({ logado: page }) => {
  await page.goto('/app/praticar/erros');
  await esperarConteudo(page);

  await expect(page.getByText('Nenhum erro por aqui')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ir para as trilhas' })).toBeVisible();
});

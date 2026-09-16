import { esperarConteudo, expect, test, type BancoFalso } from './fixtures';

/**
 * O perfil: nome e avatar, a loja, os desafios e a aparência.
 *
 * O que só o navegador prova: a compra sai do saldo na hora (sem recarregar),
 * o tema escolhido chega ao `<html>` e sobrevive à recarga, o avatar bloqueado
 * não é escolhível, e o nome novo aparece na tela inicial.
 */

/** Um histórico de quatro dias, com 60 moedas ganhas (três aulas e um desafio, digamos). */
function semear(banco: BancoFalso) {
  const hoje = new Date();
  const dia = (n: number, h = 10) => {
    const d = new Date(hoje);
    d.setDate(d.getDate() - n);
    d.setHours(h, 0, 0, 0);
    return d.toISOString();
  };
  banco.completed_lessons = ['lesson-js-1', 'lesson-js-2', 'lesson-js-3'];
  banco.attempts = [
    ...['a', 'b', 'c'].map((s, i) => ({ exercise_id: `ex-js-1-${s}`, lesson_id: 'lesson-js-1', concepts: ['variaveis'], correct: true, hints_used: 0, created_at: dia(3, 9 + i) })),
    ...['a', 'b'].map((s, i) => ({ exercise_id: `ex-js-2-${s}`, lesson_id: 'lesson-js-2', concepts: ['tipos'], correct: true, hints_used: 1, created_at: dia(2, 9 + i) })),
    { exercise_id: 'ex-js-3-a', lesson_id: 'lesson-js-3', concepts: ['condicoes'], correct: false, hints_used: 0, created_at: dia(1, 9) },
    { exercise_id: 'ex-js-3-a', lesson_id: 'lesson-js-3', concepts: ['condicoes'], correct: true, hints_used: 0, created_at: dia(1, 10) },
    { exercise_id: 'ex-js-3-b', lesson_id: 'lesson-js-3', concepts: ['condicoes'], correct: true, hints_used: 0, created_at: dia(0, 9) },
  ];
}

test('nome e avatar escolhidos valem por cima dos do Google, na tela inicial também', async ({
  logado: page,
  banco,
}) => {
  // Duas cargas completas em desenvolvimento, com o dublê do Supabase no meio.
  test.setTimeout(90_000);
  await page.goto('/app/perfil');
  await esperarConteudo(page);
  await expect(page.getByRole('heading', { level: 1, name: 'Aluno de Teste' })).toBeVisible();

  await page.getByRole('button', { name: 'Editar' }).click();
  await page.getByLabel('Como você quer ser chamado').fill('Edu');
  await page.getByRole('button', { name: 'Avatar Onda' }).click();
  // Um avatar que ainda não abriu não é escolhível — e diz o que o abre.
  const trancado = page.getByRole('button', { name: /Avatar Robô — abre no nível/ });
  await expect(trancado).toBeDisabled();
  await page.getByRole('button', { name: 'Salvar' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Edu' })).toBeVisible();
  const gravacao = banco.escritas.find((e) => e.tabela === 'users' && (e.corpo as { display_name?: string }).display_name === 'Edu');
  expect(gravacao).toBeDefined();
  expect((gravacao!.corpo as { avatar: string }).avatar).toBe('preset:onda');

  await page.goto('/app');
  await esperarConteudo(page);
  await expect(page.getByRole('heading', { level: 1, name: /Edu/ })).toBeVisible();
});

test('comprar sai do saldo na hora, e o congelamento fica guardado', async ({ logado: page, banco }) => {
  semear(banco);
  await page.goto('/app/perfil');
  await esperarConteudo(page);

  // 30 das aulas + o que os desafios renderam: ao menos 60.
  const saldo = page.getByRole('heading', { name: /\d+ moedas/ });
  await expect(saldo).toBeVisible();
  const antes = Number((await saldo.textContent())!.match(/\d+/)![0]);
  expect(antes).toBeGreaterThanOrEqual(60);

  // Congelar custa 60: confirmação em linha, depois a compra.
  const congelar = page.getByRole('listitem').filter({ hasText: 'Congelar a sequência' });
  await congelar.getByRole('button', { name: '60' }).click();
  await congelar.getByRole('button', { name: /Confirmar por 60/ }).click();

  await expect(page.getByRole('status').filter({ hasText: 'Comprado: Congelar a sequência' })).toBeVisible();
  await expect(saldo).toHaveText(new RegExp(`^${antes - 60} moedas`));
  await expect(congelar.getByText('1 guardado')).toBeVisible();
  expect(banco.purchases.map((p) => p.item)).toEqual(['congelar-sequencia']);

  // Sem saldo para o dobro (80), o botão fica trancado e diz quanto falta.
  const dobro = page.getByRole('listitem').filter({ hasText: 'Dobro de XP' });
  const botao = dobro.getByRole('button', { name: '80' });
  if (antes - 60 < 80) {
    await expect(botao).toBeDisabled();
    await expect(botao).toHaveAttribute('title', /Faltam \d+ moedas/);
  }
});

test('o tema escolhido chega ao html e sobrevive à recarga', async ({ logado: page, banco }) => {
  await page.goto('/app/perfil');
  await esperarConteudo(page);

  await page.getByRole('radio', { name: /Escuro/ }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'escuro');
  expect(banco.perfil.theme).toBe('escuro');

  // Recarrega: o `index.html` pinta escuro antes do React, pelo localStorage.
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'escuro');
  await esperarConteudo(page);
  await expect(page.getByRole('radio', { name: /Escuro/ })).toBeChecked();

  // A cor de destaque trancada diz o que a abre, e não muda nada.
  const oceano = page.getByRole('button', { name: /Oceano/ });
  await expect(oceano).toBeDisabled();
  await expect(oceano).toContainText('Abre no nível 3');
  await expect(page.locator('html')).not.toHaveAttribute('data-accent', 'oceano');

  await page.getByRole('radio', { name: /Claro/ }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'claro');
});

test('o tema da conta vence o deste aparelho', async ({ logado: page, banco }) => {
  banco.perfil.theme = 'escuro';
  banco.perfil.accent = 'floresta';
  await page.goto('/app');
  await esperarConteudo(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'escuro');
});

test('os desafios do dia aparecem no início, e as conquistas por categoria no perfil', async ({
  logado: page,
  banco,
}) => {
  semear(banco);
  await page.goto('/app');
  await esperarConteudo(page);
  const hoje = page.getByRole('region', { name: 'Para hoje' });
  await expect(hoje.getByRole('progressbar')).toHaveCount(2);

  await page.goto('/app/perfil');
  await esperarConteudo(page);
  for (const categoria of ['Hábitos', 'Habilidades', 'Trilhas', 'Marcos']) {
    await expect(page.getByRole('heading', { level: 3, name: new RegExp(`^${categoria}`) })).toBeVisible();
  }
  // Errou e resolveu o mesmo exercício: a conquista abriu.
  await expect(page.getByText('Não desistiu')).toBeVisible();
  await expect(page.getByRole('heading', { name: /\d+ XP/ })).toBeVisible();
});

import { esperarConteudo, expect, test, type BancoFalso } from './fixtures';

/**
 * O perfil e as suas páginas: nome e avatar, a loja, os desafios, as
 * conquistas e a aparência.
 *
 * O que só o navegador prova: a compra sai do saldo na hora (sem recarregar),
 * o tema escolhido chega ao `<html>` e sobrevive à recarga, o avatar bloqueado
 * não é escolhível, o nome novo aparece na tela inicial, e cada porta do
 * perfil leva à página certa.
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
  // A porta da loja diz o saldo e leva à página dela.
  await page.getByRole('link', { name: /Loja/ }).click();
  await expect(page).toHaveURL(/\/app\/perfil\/loja$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Loja' })).toBeVisible();

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

test('sem as compras carregadas, a loja não vende: o saldo pode estar errado', async ({ logado: page, banco }) => {
  // O defeito: a leitura de compras falhava, virava lista vazia, e o saldo
  // aparecia inflado — com o botão de comprar liberado sobre ele.
  semear(banco);
  banco.falhas = ['/rest/v1/purchases'];
  await page.goto('/app/perfil/loja');
  await esperarConteudo(page);

  await expect(page.getByText(/Parte do seu histórico não carregou/)).toBeVisible();
  const congelar = page.getByRole('listitem').filter({ hasText: 'Congelar a sequência' });
  await expect(congelar.getByRole('button', { name: '60' })).toBeDisabled();
  await expect(congelar.getByText('saldo indisponível')).toBeVisible();

  // Voltando a rede, "Carregar de novo" devolve a loja.
  banco.falhas = [];
  await page.getByRole('button', { name: 'Carregar de novo' }).click();
  await expect(page.getByText(/Parte do seu histórico não carregou/)).toHaveCount(0);
  await expect(congelar.getByRole('button', { name: '60' })).toBeEnabled();
});

test('o tema escolhido chega ao html e sobrevive à recarga', async ({ logado: page, banco }) => {
  await page.goto('/app/perfil/aparencia');
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

  await page.goto('/app/perfil/conquistas');
  await esperarConteudo(page);
  for (const categoria of ['Hábitos', 'Habilidades', 'Trilhas', 'Marcos']) {
    await expect(page.getByRole('heading', { level: 2, name: new RegExp(`^${categoria}`) })).toBeVisible();
  }
  // Errou e resolveu o mesmo exercício: a conquista abriu.
  await expect(page.getByText('Não desistiu')).toBeVisible();

  // O XP, com a partição, mora no progresso.
  await page.goto('/app/perfil/progresso');
  await esperarConteudo(page);
  await expect(page.getByRole('heading', { name: /\d+ XP/ })).toBeVisible();
  await expect(page.getByText('exercícios', { exact: true })).toBeVisible();
});

test('o perfil abre com o anel do nível e uma porta por assunto', async ({ logado: page, banco }) => {
  semear(banco);
  await page.goto('/app/perfil');
  await esperarConteudo(page);

  const portas = page.getByRole('list', { name: 'Seções do perfil' });
  for (const nome of ['Desafios', 'Loja', 'Conquistas', 'Aparência', 'Progresso']) {
    await expect(portas.getByRole('link', { name: new RegExp(nome) })).toBeVisible();
  }
  // A porta dos desafios já diz quantos foram feitos hoje.
  await expect(portas.getByRole('link', { name: /Desafios/ })).toContainText(/\d de \d hoje/);

  await portas.getByRole('link', { name: /Desafios/ }).click();
  await expect(page).toHaveURL(/\/app\/perfil\/desafios$/);
  await expect(page.getByRole('heading', { level: 2, name: 'Hoje' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Esta semana' })).toBeVisible();

  // O caminho de volta.
  await page.getByRole('link', { name: 'Perfil' }).first().click();
  await expect(page).toHaveURL(/\/app\/perfil$/);
});

test('o domínio diz o que falta: três acertos na mesma manhã ainda não são domínio', async ({
  logado: page,
  banco,
}) => {
  // "variaveis": três exercícios resolvidos sem dica, mas todos num dia só.
  // É a memória de curto prazo respondendo; "dominando" pede voltar dias depois.
  semear(banco);
  await page.goto('/app/perfil/progresso');
  await esperarConteudo(page);

  const { getConcept } = await import('../src/content');
  const linha = page.getByRole('listitem').filter({ hasText: getConcept('variaveis')!.title });
  await expect(linha.getByText('Praticando', { exact: true })).toBeVisible();
  await expect(linha).toContainText('falta acertar de novo daqui a alguns dias');
});

test('a loja filtra por categoria, mostra a raridade, e o saldo acompanha a rolagem', async ({
  logado: page,
  banco,
}) => {
  semear(banco);
  await page.goto('/app/perfil/loja');
  await esperarConteudo(page);

  const filtros = page.getByRole('group', { name: 'Mostrar' });
  await expect(filtros.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true');

  // Avatares: só a seção deles, cada um com a raridade escrita.
  await filtros.getByRole('button', { name: 'Avatares' }).click();
  await expect(filtros.getByRole('button', { name: 'Avatares' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('region', { name: 'Avatares' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Para usar' })).toHaveCount(0);
  const alien = page.getByRole('listitem').filter({ hasText: 'Avatar Alien' });
  await expect(alien.getByText('Raro', { exact: true })).toBeVisible();

  // O saldo fica à vista no topo depois de rolar até o fim da lista.
  await page.getByRole('region', { name: 'Avatares' }).getByRole('listitem').last().scrollIntoViewIfNeeded();
  const saldoPreso = page.getByText('moedas de saldo');
  await expect(saldoPreso).toBeAttached();
  const caixa = await saldoPreso.locator('..').boundingBox();
  expect(caixa!.y, 'o saldo saiu da tela ao rolar').toBeGreaterThanOrEqual(-1);
  expect(caixa!.y).toBeLessThan(80);

  await filtros.getByRole('button', { name: 'Todos' }).click();
  await expect(page.getByRole('region', { name: 'Para usar' })).toBeVisible();
});

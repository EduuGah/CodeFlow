import { esperarConteudo, expect, test } from './fixtures';

/**
 * O registro de eventos (0019): o que quebrou chega ao banco — sem a mensagem,
 * sem PII — e a administração vê o agregado.
 *
 * O que só o navegador prova: a falha real de uma leitura, no caminho real da
 * tela, sai como evento com o tipo e a operação, e nada do texto do erro vai
 * junto; e a seção de saúde do painel mostra o agregado dito.
 */

test('uma leitura que falha vira evento — com a operação, sem a mensagem', async ({ logado: page, banco }) => {
  banco.falhas = ['/rest/v1/exercise_attempts'];

  await page.goto('/app');
  await esperarConteudo(page);

  await expect.poll(() => banco.eventos?.find((e) => e.tipo === 'falha_de_leitura')).toBeTruthy();
  const evento = banco.eventos!.find((e) => e.tipo === 'falha_de_leitura')!;
  expect(evento.dados).toMatchObject({ operacao: 'fetchAttempts', rota: '/app' });
  // O dublê responde "falha simulada": essa frase não pode ter saído daqui.
  expect(JSON.stringify(banco.eventos)).not.toContain('falha simulada');
  for (const e of banco.eventos!) {
    expect(Object.keys(e.dados).every((k) => ['rota', 'operacao', 'motor', 'etapa', 'nome', 'codigo', 'duracao_ms', 'exercicio'].includes(k))).toBe(
      true
    );
  }
});

test('sem falha, nada é registrado', async ({ logado: page, banco }) => {
  await page.goto('/app');
  await esperarConteudo(page);
  await page.goto('/app/perfil');
  await esperarConteudo(page);
  expect(banco.eventos ?? []).toEqual([]);
});

test('o painel de administração mostra a saúde agregada', async ({ logado: page, banco }) => {
  banco.role = 'admin';
  banco.saude = [
    { dia: '2026-09-27', tipo: 'falha_do_motor', chave: 'python', eventos: 7, pessoas: 3 },
    { dia: '2026-09-26', tipo: 'falha_do_motor', chave: 'python', eventos: 5, pessoas: 2 },
    { dia: '2026-09-27', tipo: 'consulta_lenta', chave: 'fetchAttempts', eventos: 2, pessoas: 2 },
  ];

  await page.goto('/admin');
  const saude = page.locator('[data-saude]');
  await expect(saude).toBeVisible();
  const motor = saude.getByRole('listitem').filter({ hasText: 'Motor que não subiu' });
  await expect(motor).toContainText('12 vezes · até 3 pessoas num dia');
  await expect(motor).toContainText('python (12)');
  await expect(saude.getByRole('listitem').first()).toContainText('Motor que não subiu');
});

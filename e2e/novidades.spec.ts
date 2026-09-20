import { ALUNO, esperarConteudo, expect, test, type BancoFalso } from './fixtures';

/**
 * Os avisos de novidade: conquista aberta, nível, desafio cumprido.
 *
 * Não há evento gravado: o aplicativo compara o que a pessoa já viu (neste
 * aparelho) com o estado derivado do histórico. O que só o navegador prova:
 * na primeira visita não há aviso nenhum; com um estado antigo guardado, o
 * aviso aparece, um de cada vez, e some ao fechar.
 */

function semear(banco: BancoFalso) {
  const hoje = new Date();
  const dia = (n: number, h = 10) => {
    const d = new Date(hoje);
    d.setDate(d.getDate() - n);
    d.setHours(h, 0, 0, 0);
    return d.toISOString();
  };
  banco.completed_lessons = ['lesson-js-1'];
  banco.attempts = [
    { exercise_id: 'ex-js-1-a', lesson_id: 'lesson-js-1', concepts: ['variaveis'], correct: false, hints_used: 0, created_at: dia(1, 9) },
    { exercise_id: 'ex-js-1-a', lesson_id: 'lesson-js-1', concepts: ['variaveis'], correct: true, hints_used: 0, created_at: dia(1, 10) },
    { exercise_id: 'ex-js-1-b', lesson_id: 'lesson-js-1', concepts: ['variaveis'], correct: true, hints_used: 0, created_at: dia(0, 9) },
  ];
}

test('na primeira visita não há aviso; tudo o que existe já é "visto"', async ({ logado: page, banco }) => {
  semear(banco);
  await page.goto('/app');
  await esperarConteudo(page);

  // O estado é guardado assim que os dados chegam — no celular, um pouco
  // depois do conteúdo aparecer.
  await expect
    .poll(() => page.evaluate((id) => localStorage.getItem(`codeflow:visto:${id}`), ALUNO.id), {
      timeout: 10_000,
    })
    .not.toBeNull();
  await expect(page.getByText('Conquista aberta')).toHaveCount(0);
  await expect(page.getByText('Subiu de nível')).toHaveCount(0);

  const guardado = await page.evaluate((id) => localStorage.getItem(`codeflow:visto:${id}`), ALUNO.id);
  expect(JSON.parse(guardado!).conquistas).toContain('persistente');
});

test('com um estado antigo guardado, a conquista nova é avisada e o aviso fecha', async ({ logado: page, banco }) => {
  semear(banco);
  // A pessoa já tinha visto "primeiro código", mas não "não desistiu".
  await page.addInitScript((id) => {
    localStorage.setItem(
      `codeflow:visto:${id}`,
      JSON.stringify({ nivel: 1, conquistas: ['primeiro-codigo'], desafios: [] })
    );
  }, ALUNO.id);

  await page.goto('/app');
  await esperarConteudo(page);

  // Um aviso de cada vez; o primeiro diz quantos faltam. Fechar traz o
  // seguinte; fechar todos deixa a tela limpa. O que vem primeiro depende do
  // dia: o desafio do dia sorteado pode estar cumprido pela semeadura, e o
  // XP dele sobe o nível — aí a primeira notícia é o nível, não a conquista.
  const avisos = page.getByRole('status');
  await expect(avisos.first()).toBeVisible();
  await expect(avisos.first()).toContainText(/mais \d+ novidades?/);

  const conquista = avisos.filter({ hasText: 'Conquista aberta' }).filter({ hasText: 'Não desistiu' });
  for (let fechados = 0; (await conquista.count()) === 0; fechados++) {
    expect(fechados, 'a conquista "Não desistiu" nunca apareceu').toBeLessThan(8);
    await page.getByRole('button', { name: 'Fechar aviso' }).first().click();
  }
  await expect(conquista).toBeVisible();
  await conquista.getByRole('button', { name: 'Fechar aviso' }).click();
  await expect(conquista).toHaveCount(0);

  while ((await page.getByRole('button', { name: 'Fechar aviso' }).count()) > 0) {
    await page.getByRole('button', { name: 'Fechar aviso' }).click();
  }
  await expect(page.getByRole('button', { name: 'Fechar aviso' })).toHaveCount(0);

  // O que foi mostrado ficou como visto neste aparelho — na próxima visita
  // não repete. (Recarregar aqui não prova isso: o `addInitScript` do teste
  // reescreveria o estado antigo.)
  const guardado = await page.evaluate((id) => localStorage.getItem(`codeflow:visto:${id}`), ALUNO.id);
  expect(JSON.parse(guardado!).conquistas).toContain('persistente');
});

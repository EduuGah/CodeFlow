import { getDefaultTrack, getLessonsOfTrack, listTracks } from '../src/content';
import { esperarConteudo, expect, test } from './fixtures';

/**
 * O painel inicial.
 *
 * Ele existe para responder três perguntas: o que faço agora, onde isso está
 * no todo, como estou indo. A versão anterior conhecia só a trilha padrão —
 * quem terminava JavaScript e começava TypeScript continuava vendo "20 de
 * 20" — e não mostrava que existiam outras seis. O mapa é o percurso: todas
 * as trilhas, na ordem, com o ponto atual marcado.
 */

const DUAS_AULAS = ['lesson-js-1', 'lesson-js-2'];

// Lido do catálogo, não fixado: a trilha cresce a cada aula publicada, e um
// número escrito à mão aqui quebraria o teste por conteúdo novo, não por defeito.
const TOTAL = getLessonsOfTrack(getDefaultTrack().id).length;

test.describe('o que faço agora', () => {
  test('quem nunca entrou é convidado a começar pela primeira aula', async ({ logado: page }) => {
    await page.goto('/app');
    await esperarConteudo(page);

    await expect(page.getByText(/Comece por aqui/)).toBeVisible();
    await expect(page.getByRole('link', { name: /Começar a primeira aula/ })).toBeVisible();
    // E sabe que existe mais do que uma trilha.
    await expect(page.getByText(new RegExp(`em ${listTracks().length} trilhas`))).toBeVisible();
  });

  test('quem já concluiu aulas não é tratado como novato', async ({ logado: page, banco }) => {
    banco.completed_lessons = DUAS_AULAS;

    await page.goto('/app');
    await esperarConteudo(page);

    // O defeito antigo: `primeiraVez` vinha só de tentativas registradas, então
    // duas aulas concluídas ainda mostravam "Comece por aqui".
    await expect(page.getByText(/Comece por aqui/)).toHaveCount(0);
    await expect(page.getByText(new RegExp(`aula 3 de ${TOTAL}`, 'i')).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Continuar a aula/ })).toBeVisible();
  });

  test('a aula da vez segue a pessoa para a trilha em que ela está', async ({ logado: page, banco }) => {
    // Terminou JavaScript inteiro e fez a primeira de TypeScript: a ação é a
    // segunda de TypeScript, não "JavaScript, 20 de 20".
    banco.completed_lessons = [...getLessonsOfTrack('track-js-fundamentos').map((l) => l.id), 'lesson-ts-1'];

    await page.goto('/app');
    await esperarConteudo(page);

    const acao = page.getByRole('link', { name: /Continuar a aula/ });
    await expect(acao).toHaveAttribute('href', '/lesson/lesson-ts-2');
    await expect(page.getByText(/aula 2 de 10 de TypeScript/)).toBeVisible();
  });

  test('a ação principal está na primeira tela e é única', async ({ logado: page }) => {
    await page.goto('/app');
    await esperarConteudo(page);

    const principal = page.getByRole('link', { name: /Começar a primeira aula|Continuar a aula/ });
    await expect(principal).toBeInViewport();

    // Um só botão com peso de ação primária: dois competiriam pela mesma decisão.
    const destaques = await page.locator('main a.bg-brand-600, main button.bg-brand-600').count();
    expect(destaques).toBe(1);
  });

  test('nunca chama de vencido um cartão que o aluno nunca viu', async ({ logado: page }) => {
    await page.goto('/app');
    await esperarConteudo(page);

    const texto = await page.locator('main').innerText();

    // 22 cartões "vencidos" no primeiro acesso era uma dívida que a pessoa não
    // contraiu — e "22 cartões novos" também não é decisão para a tela inicial.
    expect(texto).not.toMatch(/vencid/i);
    expect(texto).not.toMatch(/cartões novos/i);
  });
});

test.describe('onde isso está no todo', () => {
  test('o percurso lista todas as trilhas, na ordem, com o ponto atual', async ({
    logado: page,
    banco,
  }) => {
    banco.completed_lessons = DUAS_AULAS;

    await page.goto('/app');
    await esperarConteudo(page);

    const percurso = page.getByRole('region', { name: 'Seu percurso' });
    const itens = percurso.getByRole('listitem');
    await expect(itens).toHaveCount(listTracks().length);

    // Na ordem do catálogo, cada uma com o seu progresso.
    const nomes = await itens.allInnerTexts();
    listTracks().forEach((trilha, i) => {
      expect(nomes[i]).toContain(trilha.title);
    });
    expect(nomes[0]).toContain(`2/${TOTAL}`);

    // O ponto atual é marcado para a máquina também, não só pela cor.
    await expect(percurso.locator('a[aria-current="step"]')).toHaveText(/Fundamentos de JavaScript/);

    // E os projetos estão a um toque, sem rolar sete trilhas.
    await expect(percurso.getByRole('link', { name: /projetos práticos/ })).toBeVisible();
  });

  test('cada trilha do percurso leva à página dela', async ({ logado: page }) => {
    await page.goto('/app');
    await esperarConteudo(page);

    await page.getByRole('region', { name: 'Seu percurso' }).getByRole('link', { name: /SQL e Bancos de Dados/ }).click();
    await expect(page).toHaveURL(/\/app\/trilhas\/track-sql$/);
  });
});

test.describe('como estou indo', () => {
  test('sem histórico, não mostra zeros', async ({ logado: page }) => {
    await page.goto('/app');
    await esperarConteudo(page);

    // Três zeros lado a lado não informam nada a quem ainda não começou.
    await expect(page.getByText('Exercícios resolvidos')).toHaveCount(0);
  });
});

test.describe('composição', () => {
  test('a primeira tela não fica com um terço vazio', async ({ logado: page }) => {
    await page.goto('/app');
    await esperarConteudo(page);

    const medida = await page.evaluate(() => {
      const main = document.querySelector('main')!.getBoundingClientRect();
      return { conteudo: Math.round(main.height), janela: window.innerHeight };
    });

    expect(medida.conteudo).toBeGreaterThan(medida.janela * 0.85);
  });

  test('um card só, e ele é a ação', async ({ logado: page, banco }) => {
    banco.completed_lessons = DUAS_AULAS;

    await page.goto('/app');
    await esperarConteudo(page);

    // Quando tudo é card, nada tem destaque. O percurso é uma lista, os
    // números são um rodapé.
    const cards = await page.locator('main > div > section.rounded-xl.border').count();
    expect(cards).toBe(1);
  });

  test('a hierarquia de títulos não pula níveis', async ({ logado: page, banco }) => {
    banco.completed_lessons = DUAS_AULAS;

    await page.goto('/app');
    await esperarConteudo(page);

    const niveis = await page.evaluate(() =>
      [...document.querySelectorAll('main h1, main h2, main h3')].map((h) => Number(h.tagName[1]))
    );

    expect(niveis[0]).toBe(1);
    for (let i = 1; i < niveis.length; i++) {
      expect(niveis[i] - niveis[i - 1]).toBeLessThanOrEqual(1);
    }
  });
});

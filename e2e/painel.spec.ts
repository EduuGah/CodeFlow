import { getDefaultTrack, getLessonsOfTrack } from '../src/content';
import { esperarConteudo, expect, test } from './fixtures';

/**
 * O painel inicial.
 *
 * Ele existe para responder três perguntas, e a versão anterior respondia uma.
 * Medido antes da reformulação: 285px da primeira tela ficavam vazios, e um
 * aluno com duas aulas concluídas via a mesma tela de quem nunca entrou —
 * inclusive o rótulo "Comece por aqui" e o botão "Começar aula".
 */

const DUAS_AULAS = ['lesson-js-1', 'lesson-js-2'];

// Lido do catálogo, não fixado: a trilha cresce a cada aula publicada, e um
// número escrito à mão aqui quebraria o teste por conteúdo novo, não por defeito.
const TOTAL = getLessonsOfTrack(getDefaultTrack().id).length;

test.describe('onde estou', () => {
  test('a posição na trilha aparece sem precisar rolar', async ({ logado: page, banco }) => {
    banco.completed_lessons = DUAS_AULAS;

    await page.goto('/app');
    await esperarConteudo(page);

    const barra = page.getByRole('progressbar', { name: /Progresso em/ });
    await expect(barra).toBeInViewport();
    await expect(barra).toHaveAttribute('aria-valuenow', '2');

    await expect(page.getByText(`2 de ${TOTAL} aulas`)).toBeVisible();
  });

  test('quem já concluiu aulas não é tratado como novato', async ({ logado: page, banco }) => {
    banco.completed_lessons = DUAS_AULAS;

    await page.goto('/app');
    await esperarConteudo(page);

    // O defeito: `primeiraVez` vinha só de tentativas registradas, então duas
    // aulas concluídas ainda mostravam "Comece por aqui" e "Começar aula".
    await expect(page.getByText('Comece por aqui')).toHaveCount(0);
    await expect(page.getByText(`Aula 3 de ${TOTAL}`)).toBeVisible();
    await expect(page.getByRole('link', { name: /Continuar aprendendo/ })).toBeVisible();
  });

  test('quem nunca entrou é convidado a começar', async ({ logado: page }) => {
    await page.goto('/app');
    await esperarConteudo(page);

    await expect(page.getByText('Comece por aqui')).toBeVisible();
    await expect(page.getByRole('link', { name: /Começar a primeira aula/ })).toBeVisible();
  });
});

test.describe('o que faço agora', () => {
  test('a ação principal está na primeira tela e é única', async ({ logado: page }) => {
    await page.goto('/app');
    await esperarConteudo(page);

    const principal = page.getByRole('link', { name: /Começar a primeira aula|Continuar aprendendo/ });
    await expect(principal).toBeInViewport();

    // Um só botão com peso de ação primária: dois competiriam pela mesma decisão.
    const destaques = await page.locator('main a.bg-ink, main button.bg-ink').count();
    expect(destaques).toBe(1);
  });

  test('nunca chama de vencido um cartão que o aluno nunca viu', async ({ logado: page }) => {
    await page.goto('/app');
    await esperarConteudo(page);

    const texto = await page.locator('main').innerText();

    // 22 cartões "vencidos" no primeiro acesso era uma dívida que a pessoa não
    // contraiu — e foi o que a tela dizia.
    expect(texto).not.toMatch(/vencid/i);
  });

  test('a lista de atividades não vira um catálogo', async ({ logado: page, banco }) => {
    banco.completed_lessons = DUAS_AULAS;

    await page.goto('/app');
    await esperarConteudo(page);

    const itens = await page.locator('main section ul li').count();
    expect(itens).toBeGreaterThan(0);
    expect(itens).toBeLessThanOrEqual(6);
  });
});

test.describe('o que vem depois', () => {
  test('o caminho mostra a vizinhança da aula atual, não a trilha inteira', async ({
    logado: page,
    banco,
  }) => {
    banco.completed_lessons = DUAS_AULAS;

    await page.goto('/app');
    await esperarConteudo(page);

    await expect(page.getByRole('heading', { name: 'Seu caminho' })).toBeVisible();

    // A janela é curta de propósito, senão empurraria o resto da página para
    // baixo da dobra — independentemente do tamanho da trilha.
    const passos = await page.locator('main ol li').count();
    expect(passos).toBeGreaterThanOrEqual(3);
    expect(passos).toBeLessThanOrEqual(6);

    await expect(page.getByText('Você está aqui')).toBeVisible();
  });

  test('o estado de cada aula é dito em palavra, não só em cor', async ({ logado: page, banco }) => {
    banco.completed_lessons = DUAS_AULAS;

    await page.goto('/app');
    await esperarConteudo(page);

    // Quem não distingue verde de cinza precisa da mesma informação.
    await expect(page.getByText('Concluída').first()).toBeVisible();
    await expect(page.getByText('Você está aqui')).toBeVisible();
  });
});

test.describe('como estou evoluindo', () => {
  test('sem histórico, mostra o que existe pela frente em vez de zeros', async ({
    logado: page,
  }) => {
    await page.goto('/app');
    await esperarConteudo(page);

    // Três zeros lado a lado não informam nada a quem ainda não começou.
    await expect(page.getByText(/A trilha tem/)).toBeVisible();
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

    // Antes: 554px de conteúdo numa janela de 839px.
    expect(medida.conteudo).toBeGreaterThan(medida.janela * 0.85);
  });

  test('um card só, e ele é a ação', async ({ logado: page, banco }) => {
    banco.completed_lessons = DUAS_AULAS;

    await page.goto('/app');
    await esperarConteudo(page);

    // Quando tudo é card, nada tem destaque. O caminho é uma sequência, as
    // atividades são uma lista, os números são um rodapé.
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

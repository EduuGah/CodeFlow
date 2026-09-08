import { esperarConteudo, expect, test } from './fixtures';

/**
 * O que toda tela tem que ter, e que passa despercebido justamente por ser
 * estrutural: idioma, título, um cabeçalho de primeiro nível e nenhum controle
 * anônimo. Nada disso aparece num screenshot, e cada item tem consequência real
 * para quem usa leitor de tela.
 *
 * Esta suíte nasceu de uma auditoria que encontrou os quatro problemas de uma vez:
 * `lang="en"` num produto em português, título "CodeFlow" em todas as telas,
 * uma tela sem `<h1>`, e "intermediario" sem acento na cara do aluno.
 */

const TELAS = [
  { rota: '/app', titulo: 'Início' },
  { rota: '/app/trilhas', titulo: 'Trilhas' },
  { rota: '/app/praticar', titulo: 'Praticar' },
  { rota: '/app/perfil', titulo: 'Perfil' },
];

test('o documento declara português', async ({ logado: page }) => {
  await page.goto('/app');

  // O leitor de tela escolhe a fonética por este atributo. Português lido com
  // fonética inglesa fica quase incompreensível.
  const idioma = await page.evaluate(() => document.documentElement.lang);
  expect(idioma).toMatch(/^pt(-BR)?$/);
});

for (const { rota, titulo } of TELAS) {
  test(`${rota} tem título próprio e um h1`, async ({ logado: page }) => {
    await page.goto(rota);
    await esperarConteudo(page);

    // Título igual em todas as telas deixa abas e histórico indistinguíveis, e o
    // leitor de tela não confirma que a navegação aconteceu.
    await expect(page).toHaveTitle(new RegExp(titulo));

    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).not.toBeEmpty();
  });
}

test('a hierarquia de cabeçalhos não pula níveis', async ({ logado: page }) => {
  const problemas: string[] = [];

  for (const { rota } of TELAS) {
    await page.goto(rota);
    await esperarConteudo(page);

    const pulos = await page.evaluate(() => {
      const niveis = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({
        n: Number(h.tagName[1]),
        t: (h.textContent || '').trim().slice(0, 30),
      }));

      const achados: string[] = [];
      for (let i = 1; i < niveis.length; i++) {
        // Pular de h2 para h4 faz a navegação por cabeçalhos perder o fio.
        if (niveis[i].n - niveis[i - 1].n > 1) {
          achados.push(`h${niveis[i - 1].n} para h${niveis[i].n} em "${niveis[i].t}"`);
        }
      }
      return achados;
    });

    for (const p of pulos) problemas.push(`${rota}: ${p}`);
  }

  expect(problemas).toEqual([]);
});

test('nenhuma tela mostra identificador de código ao aluno', async ({ logado: page }) => {
  const problemas: string[] = [];

  for (const { rota } of TELAS) {
    await page.goto(rota);
    await esperarConteudo(page);

    // `innerText` devolve o texto **renderizado**, e `.label-mono` aplica
    // `uppercase` por CSS: sem normalizar, a busca por "intermediario" nunca
    // encontraria o "INTERMEDIARIO" que está na tela.
    const texto = (await page.locator('main').innerText()).toLowerCase();

    // Ids são sem acento porque são identificadores. Se aparecerem crus, alguém
    // esqueceu de passar pelo mapa de rótulos — e a forma acentuada, que é a
    // correta, não casa com estas strings.
    for (const cru of ['intermediario', 'avancado', 'revisao', 'funcoes', 'variaveis']) {
      if (texto.includes(cru)) problemas.push(`${rota} mostra "${cru}"`);
    }
  }

  expect(problemas).toEqual([]);
});

test('nenhum controle chega ao aluno sem nome acessível', async ({ logado: page }) => {
  const problemas: string[] = [];

  for (const { rota } of TELAS) {
    await page.goto(rota);
    await esperarConteudo(page);

    const anonimos = await page.evaluate(() =>
      [...document.querySelectorAll('a, button, input, select, textarea')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.height === 0) return false;

          const nome =
            el.getAttribute('aria-label') ||
            el.getAttribute('title') ||
            (el.textContent || '').trim();

          return !nome;
        })
        // Botão só de ícone é o caso comum: vira "botão" e mais nada.
        .map((el) => `${el.tagName}.${String(el.className).slice(0, 40)}`)
    );

    for (const a of anonimos) problemas.push(`${rota}: ${a}`);
  }

  expect(problemas).toEqual([]);
});

import { ITENS } from '../src/client/lib/economia';
import { esperarConteudo, expect, test } from './fixtures';

/**
 * A administração da loja: o banco ao lado do código, tirar da venda, e o
 * gerador das linhas de um item novo.
 *
 * O que só o navegador prova: a divergência aparece dita (e aponta a
 * migração que falta), o botão chama a função do banco e a loja do aluno
 * deixa de mostrar o item, e o gerador escreve as duas linhas para o pull
 * request sem gravar nada.
 */

const catalogoEmDia = () =>
  ITENS.map((i) => ({
    id: i.id,
    price: i.price,
    tipo: i.tipo,
    ativo: true,
    disponivel_de: i.disponivelDe ?? null,
    disponivel_ate: i.disponivelAte ?? null,
  }));

test('mostra onde o banco discorda do código — a migração que não rodou', async ({ logado: page, banco }) => {
  banco.role = 'admin';
  // O banco ainda com o preço de antes da recalibragem.
  banco.storeItems = catalogoEmDia().map((l) => (l.id === 'tema-oceano' ? { ...l, price: 120 } : l));

  await page.goto('/admin');
  await page.getByRole('link', { name: 'Loja' }).click();
  await expect(page).toHaveURL(/\/admin\/loja$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Loja' })).toBeVisible();

  const divergencias = page.locator('[data-divergencias]');
  await expect(divergencias).toContainText('tema-oceano: o banco cobra 120, a loja mostra 10');
  await expect(divergencias).toContainText('Falta rodar a migração');
});

test('com o banco em dia, diz isso; tirar da venda chega à loja do aluno', async ({ logado: page, banco }) => {
  banco.role = 'admin';
  banco.storeItems = catalogoEmDia();

  await page.goto('/admin/loja');
  await expect(page.getByText('O banco vende exatamente o que a loja mostra')).toBeVisible();

  const urso = page.locator('[data-item="avatar-urso"]');
  await urso.getByRole('button', { name: 'Tirar da venda: Avatar Urso' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Avatar Urso saiu da venda.' })).toBeVisible();
  await expect(urso).toContainText('Fora da venda');
  expect(banco.storeItems.find((l) => l.id === 'avatar-urso')?.ativo).toBe(false);

  // Na loja, quem não tem o Urso não o vê mais; os outros continuam.
  await page.goto('/app/perfil/loja');
  await esperarConteudo(page);
  const avatares = page.getByRole('region', { name: 'Avatares' });
  await expect(avatares.getByRole('listitem').filter({ hasText: 'Avatar Dino' })).toBeVisible();
  await expect(avatares.getByRole('listitem').filter({ hasText: 'Avatar Urso' })).toHaveCount(0);

  // E volta.
  await page.goto('/admin/loja');
  await page.locator('[data-item="avatar-urso"]').getByRole('button', { name: 'Devolver à venda: Avatar Urso' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Avatar Urso voltou à venda.' })).toBeVisible();
  expect(banco.storeItems.find((l) => l.id === 'avatar-urso')?.ativo).toBe(true);
});

test('o gerador escreve as duas linhas do item novo, e recusa o que o CI recusaria', async ({ logado: page, banco }) => {
  banco.role = 'admin';
  await page.goto('/admin/loja');

  const novo = page.getByRole('region', { name: 'Item novo' });
  await novo.getByLabel('Id curto').fill('capivara');
  await novo.getByLabel('Título').fill('Capivara');
  await novo.getByLabel('Descrição').fill('Outra capivara.');
  await expect(novo.getByRole('alert')).toContainText('Já existe um item avatar-capivara.');

  await novo.getByLabel('Id curto').fill('jabuti');
  await novo.getByLabel('Título').fill('Jabuti');
  await novo.getByLabel('Descrição').fill('Casco alto e passo sem pressa.');
  await novo.getByLabel('Nível que abre').selectOption('11');

  const gerado = novo.locator('[data-gerado]');
  await expect(gerado).toContainText("['jabuti', 'Jabuti', 'Casco alto e passo sem pressa.', 11],");
  await expect(gerado).toContainText("('avatar-jabuti', 600, 'avatar')");
  await expect(gerado).toContainText('src/client/components/ui/Avatar.tsx');

  // Gerar não grava nada.
  expect(banco.escritas).toEqual([]);
});

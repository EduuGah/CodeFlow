import { describe, expect, it } from 'vitest';

import { ITENS, itemDaLoja, PRECO_DO_NIVEL } from './economia';
import { compararCatalogo, gerarLinhas, type LinhaDoBanco, type RascunhoDeItem } from './loja-admin';

/** O banco espelhando o código, como fica depois de todas as migrações. */
const bancoEmDia = (): LinhaDoBanco[] =>
  ITENS.map((i) => ({
    id: i.id,
    price: i.price,
    tipo: i.tipo,
    ativo: true,
    disponivel_de: i.disponivelDe ?? null,
    disponivel_ate: i.disponivelAte ?? null,
  }));

describe('o banco ao lado do código', () => {
  it('em dia, nenhuma divergência', () => {
    expect(compararCatalogo(ITENS, bancoEmDia())).toEqual([]);
  });

  it('um preço antigo no banco — a migração da recalibragem não rodou', () => {
    const banco = bancoEmDia().map((l) => (l.id === 'tema-oceano' ? { ...l, price: 120 } : l));
    expect(compararCatalogo(ITENS, banco)).toEqual([{ id: 'tema-oceano', tipo: 'preco', codigo: 10, banco: 120 }]);
  });

  it('um item que o banco não tem, e um que só o banco tem', () => {
    const banco = bancoEmDia().filter((l) => l.id !== 'fundo-mar');
    banco.push({ id: 'avatar-antigo', price: 50, tipo: 'avatar', ativo: true, disponivel_de: null, disponivel_ate: null });
    expect(compararCatalogo(ITENS, banco)).toEqual([
      { id: 'fundo-mar', tipo: 'falta_no_banco' },
      { id: 'avatar-antigo', tipo: 'so_no_banco' },
    ]);
  });

  it('a janela compara instantes, não o texto: o "Z" do código e o "+00:00" do PostgREST são o mesmo', () => {
    const banco = bancoEmDia().map((l) =>
      l.id === 'fundo-fogos' ? { ...l, disponivel_de: '2026-12-15T03:00:00+00:00', disponivel_ate: '2027-01-16T03:00:00+00:00' } : l
    );
    expect(compararCatalogo(ITENS, banco)).toEqual([]);
    const semJanela = bancoEmDia().map((l) => (l.id === 'fundo-fogos' ? { ...l, disponivel_de: null, disponivel_ate: null } : l));
    expect(compararCatalogo(ITENS, semJanela)).toEqual([{ id: 'fundo-fogos', tipo: 'janela' }]);
  });

  it('ativo não é divergência: é a administração que liga e desliga', () => {
    const banco = bancoEmDia().map((l) => (l.id === 'avatar-urso' ? { ...l, ativo: false } : l));
    expect(compararCatalogo(ITENS, banco)).toEqual([]);
  });
});

describe('o gerador da linha do catálogo', () => {
  const rascunho = (over: Partial<RascunhoDeItem> = {}): RascunhoDeItem => ({
    tipo: 'avatar',
    curto: 'jabuti',
    titulo: 'Jabuti',
    descricao: 'Casco alto e passo sem pressa.',
    nivel: 11,
    ...over,
  });

  it('gera a tupla do código e a linha do banco, com o preço do nível', () => {
    const { problemas, ts, sql } = gerarLinhas(rascunho(), ITENS);
    expect(problemas).toEqual([]);
    expect(ts).toBe("['jabuti', 'Jabuti', 'Casco alto e passo sem pressa.', 11],");
    expect(sql).toBe(`('avatar-jabuti', ${PRECO_DO_NIVEL[11]}, 'avatar')`);
  });

  it('escapa aspas e barras na tupla — o texto vira código', () => {
    const { ts } = gerarLinhas(rascunho({ descricao: "O d'água \\ e mais" }), ITENS);
    expect(ts).toBe("['jabuti', 'Jabuti', 'O d\\'água \\\\ e mais', 11],");
  });

  it('recusa id fora do formato, id repetido, texto vazio e nível sem preço calibrado', () => {
    expect(gerarLinhas(rascunho({ curto: 'Jabuti!' }), ITENS).problemas).toHaveLength(1);
    expect(gerarLinhas(rascunho({ curto: 'capivara' }), ITENS).problemas).toEqual(['Já existe um item avatar-capivara.']);
    expect(gerarLinhas(rascunho({ titulo: '  ', descricao: '' }), ITENS).problemas).toHaveLength(2);
    const semPreco = gerarLinhas(rascunho({ nivel: 40 }), ITENS);
    expect(semPreco.problemas[0]).toMatch(/Não há preço calibrado para o nível 40/);
  });

  it('o id gerado é o mesmo formato que o banco aceita para moldura e fundo', () => {
    const { sql } = gerarLinhas(rascunho({ tipo: 'moldura', curto: 'ondas-2' }), ITENS);
    expect(sql).toMatch(/^\('moldura-ondas-2', \d+, 'moldura'\)$/);
    expect(itemDaLoja('moldura-ondas-2')).toBeUndefined();
  });
});

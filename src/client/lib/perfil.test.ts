import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Leitura e gravação do perfil num banco que pode estar atrás das migrações.
 *
 * Cada migração de perfil (0011, 0012) acrescenta colunas; quem ainda não a
 * rodou não pode perder o perfil que já tinha — nome, avatar, cor. A leitura
 * pede as colunas mais novas e, se o banco não as conhece, pede as de antes.
 */

type Resposta = { data: unknown; error: { code?: string; message: string } | null };

const dublê = vi.hoisted(() => {
  const estado = {
    selecionadas: [] as string[],
    gravadas: [] as unknown[],
    /** As colunas que o banco conhece; pedir outra dá o erro do PostgREST. */
    conhecidas: new Set<string>(),
    erroNaGravacao: null as Resposta['error'],
  };

  const cliente = {
    from: () => {
      let resposta: Resposta = { data: null, error: null };
      const construtor = {
        select(colunas: string) {
          estado.selecionadas.push(colunas);
          const desconhecida = colunas.split(', ').find((c) => !estado.conhecidas.has(c));
          resposta = desconhecida
            ? { data: null, error: { code: '42703', message: `column users.${desconhecida} does not exist` } }
            : {
                data: Object.fromEntries(colunas.split(', ').map((c) => [c, c === 'display_name' ? 'Ana' : `valor-${c}`])),
                error: null,
              };
          return construtor;
        },
        eq: () => construtor,
        maybeSingle: () => construtor,
        upsert(linha: unknown) {
          estado.gravadas.push(linha);
          resposta = { data: null, error: estado.erroNaGravacao };
          return construtor;
        },
        then(resolver: (r: Resposta) => unknown) {
          return Promise.resolve(resposta).then(resolver);
        },
      };
      return construtor;
    },
  };
  return { estado, cliente };
});

vi.mock('./supabase', () => ({ supabase: dublê.cliente }));

const registro = vi.hoisted(() => ({ registrar: vi.fn() }));
vi.mock('./registro', async (original) => ({
  ...(await original<typeof import('./registro')>()),
  registrar: registro.registrar,
}));

import { fetchPerfil, updatePerfil } from './perfil';

const ATE_A_0007 = ['display_name', 'avatar', 'theme', 'accent'];
const DA_0011 = ['moldura', 'fundo'];
const DA_0012 = ['titulo'];

beforeEach(() => {
  dublê.estado.selecionadas = [];
  dublê.estado.gravadas = [];
  dublê.estado.erroNaGravacao = null;
  vi.spyOn(console, 'error').mockImplementation(() => {});
  registro.registrar.mockClear();
});

describe('a leitura do perfil acompanha o banco', () => {
  it('com todas as migrações, lê tudo numa consulta só', async () => {
    dublê.estado.conhecidas = new Set([...ATE_A_0007, ...DA_0011, ...DA_0012]);
    const perfil = await fetchPerfil('u1');
    expect(dublê.estado.selecionadas).toHaveLength(1);
    expect(perfil).toMatchObject({ displayName: 'Ana', moldura: 'valor-moldura', titulo: 'valor-titulo' });
    expect(perfil.error).toBeUndefined();
  });

  it('sem a 0012, o perfil continua valendo — só sem título', async () => {
    dublê.estado.conhecidas = new Set([...ATE_A_0007, ...DA_0011]);
    const perfil = await fetchPerfil('u1');
    expect(perfil).toMatchObject({ displayName: 'Ana', moldura: 'valor-moldura', fundo: 'valor-fundo', titulo: null });
    expect(perfil.error).toBeUndefined();
  });

  it('sem a 0011 nem a 0012, ainda lê nome, avatar e cor', async () => {
    dublê.estado.conhecidas = new Set(ATE_A_0007);
    const perfil = await fetchPerfil('u1');
    expect(dublê.estado.selecionadas).toHaveLength(3);
    expect(perfil).toMatchObject({ displayName: 'Ana', accent: 'valor-accent', moldura: null, titulo: null });
    expect(perfil.error).toBeUndefined();
  });

  it('um banco sem nem a 0007 dá erro dito, não um perfil vazio calado', async () => {
    dublê.estado.conhecidas = new Set();
    const perfil = await fetchPerfil('u1');
    expect(perfil.error).toBe('Não foi possível carregar seu perfil.');
  });
});

describe('a gravação diz qual migração falta', () => {
  const semColuna = { code: 'PGRST204', message: "Could not find the 'titulo' column of 'users' in the schema cache" };

  it('grava só o que veio', async () => {
    await updatePerfil('u1', { titulo: 'coruja' });
    expect(dublê.estado.gravadas).toEqual([{ id: 'u1', titulo: 'coruja' }]);
  });

  it('título sem a 0012 pede a 0012 — e a falha vai para o registro, só com o código', async () => {
    dublê.estado.erroNaGravacao = semColuna;
    const { error } = await updatePerfil('u1', { titulo: 'coruja' });
    expect(error).toContain('0012_titulos.sql');
    expect(registro.registrar).toHaveBeenCalledWith('falha_de_escrita', { operacao: 'updatePerfil', codigo: 'PGRST204' });
    expect(JSON.stringify(registro.registrar.mock.calls)).not.toMatch(/schema cache/);
  });

  it('moldura sem a 0011 pede a 0011', async () => {
    dublê.estado.erroNaGravacao = semColuna;
    const { error } = await updatePerfil('u1', { moldura: 'neon' });
    expect(error).toContain('0011_loja_molduras_fundos_cores.sql');
  });

  it('um erro que não é de migração não manda rodar nada', async () => {
    dublê.estado.erroNaGravacao = { code: '23514', message: 'violates check constraint' };
    const { error } = await updatePerfil('u1', { titulo: 'Coruja!' });
    expect(error).toBe('Não foi possível salvar. Tente de novo.');
  });
});

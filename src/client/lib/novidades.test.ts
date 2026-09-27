import { describe, expect, it } from 'vitest';

import type { EstadoDoDesafio } from './desafios';
import type { Achievement } from './gamification';
import { ITENS, itemDaLoja, type ItemDaLoja } from './economia';
import { CATALOGO_ANTES_DA_LOJA_2, estadoAtual, novidades, resumoDosItens } from './novidades';

const conquista = (id: string, unlocked: boolean): Achievement => ({
  id,
  title: id,
  description: '',
  categoria: 'habitos',
  unlocked,
});

const desafio = (id: string, concluido: boolean): EstadoDoDesafio => ({
  desafio: { id, periodo: 'dia', title: id, description: '', meta: 1, progresso: () => 0 },
  progresso: concluido ? 1 : 0,
  concluido,
  recompensa: { moedas: 15, xp: 30 },
});

describe('estadoAtual', () => {
  it('guarda só o que abriu, e os desafios com o dia do período', () => {
    const estado = estadoAtual({
      nivel: 3,
      achievements: [conquista('a', true), conquista('b', false)],
      desafios: { dia: [desafio('d1', true), desafio('d2', false)], semana: [desafio('s1', true)] },
      hoje: '2026-09-17',
      segunda: '2026-09-14',
    });
    expect(estado).toEqual({ nivel: 3, conquistas: ['a'], desafios: ['2026-09-17:d1', '2026-09-14:s1'] });
  });
});

describe('novidades', () => {
  const achievements = [conquista('a', true), conquista('b', true)];
  const desafios = [desafio('d1', true)];
  const contexto = { achievements, desafios, tituloDoNivel: 'Iniciante' };

  it('sem estado guardado não há novidade — tudo seria novo', () => {
    const atual = { nivel: 3, conquistas: ['a', 'b'], desafios: ['2026-09-17:d1'] };
    expect(novidades(null, atual, contexto)).toEqual([]);
  });

  it('conta o nível primeiro, depois conquistas, depois desafios', () => {
    const visto = { nivel: 2, conquistas: ['a'], desafios: [] };
    const atual = { nivel: 3, conquistas: ['a', 'b'], desafios: ['2026-09-17:d1'] };
    const lista = novidades(visto, atual, contexto);
    expect(lista.map((n) => n.tipo)).toEqual(['nivel', 'conquista', 'desafio']);
    expect(lista[0]).toEqual({ tipo: 'nivel', nivel: 3, titulo: 'Iniciante' });
    expect(lista[1]).toMatchObject({ tipo: 'conquista', conquista: { id: 'b' } });
    expect(lista[2]).toMatchObject({ tipo: 'desafio', estado: { desafio: { id: 'd1' } } });
  });

  it('o mesmo desafio cumprido noutro dia é novidade de novo; no mesmo dia, não', () => {
    const visto = { nivel: 3, conquistas: ['a', 'b'], desafios: ['2026-09-16:d1'] };
    expect(novidades(visto, { ...visto, desafios: ['2026-09-17:d1'] }, contexto)).toHaveLength(1);
    expect(novidades(visto, visto, contexto)).toEqual([]);
  });

  it('descer de nível ou perder uma conquista não é notícia', () => {
    const visto = { nivel: 4, conquistas: ['a', 'b', 'c'], desafios: [] };
    const atual = { nivel: 3, conquistas: ['a'], desafios: [] };
    expect(novidades(visto, atual, contexto)).toEqual([]);
  });
});

describe('o que chegou à loja', () => {
  const contexto = { achievements: [], desafios: [], tituloDoNivel: 'Iniciante' };
  const base = { nivel: 3, conquistas: [], desafios: [] };
  const todos = ITENS.map((i) => i.id);

  it('pela primeira vez, nada é novo — nem a loja inteira', () => {
    expect(novidades(null, { ...base, loja: todos }, contexto)).toEqual([]);
  });

  it('quem usava antes deste aviso fica sabendo de tudo o que chegou depois da Loja 2.0, num aviso só', () => {
    const lista = novidades(base, { ...base, loja: todos }, contexto);
    expect(lista).toHaveLength(1);
    const [aviso] = lista;
    expect(aviso.tipo).toBe('loja');
    const ids = aviso.tipo === 'loja' ? aviso.itens.map((i) => i.id) : [];
    expect(ids).toContain('avatar-capivara');
    expect(ids).toContain('moldura-neon');
    // O que já existia não é notícia.
    for (const antigo of CATALOGO_ANTES_DA_LOJA_2) expect(ids).not.toContain(antigo);
  });

  it('com o catálogo já visto, só o item que entrou depois é novo', () => {
    const visto = { ...base, loja: todos.filter((id) => id !== 'fundo-mar') };
    const lista = novidades(visto, { ...base, loja: todos }, contexto);
    expect(lista).toEqual([{ tipo: 'loja', itens: [itemDaLoja('fundo-mar')] }]);
    expect(novidades({ ...base, loja: todos }, { ...base, loja: todos }, contexto)).toEqual([]);
  });

  it('um item que sai do catálogo não é notícia', () => {
    const visto = { ...base, loja: [...todos, 'avatar-que-saiu'] };
    expect(novidades(visto, { ...base, loja: todos }, contexto)).toEqual([]);
  });

  it('o catálogo de antes ainda existe inteiro no de agora', () => {
    // Senão a base apontaria para um id que sumiu, e a conta mudaria em silêncio.
    for (const id of CATALOGO_ANTES_DA_LOJA_2) expect(todos, id).toContain(id);
  });

  it('resume por tipo, no singular e no plural', () => {
    const item = (id: string) => itemDaLoja(id) as ItemDaLoja;
    expect(resumoDosItens([item('avatar-capivara')])).toBe('1 avatar');
    expect(
      resumoDosItens([item('avatar-capivara'), item('avatar-tucano'), item('moldura-prisma'), item('fundo-mar')])
    ).toBe('2 avatares, 1 moldura e 1 fundo');
    expect(resumoDosItens([item('tema-grafite'), item('recuperar-sequencia')])).toBe('1 cor e 1 item para usar');
  });
});

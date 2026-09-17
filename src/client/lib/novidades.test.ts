import { describe, expect, it } from 'vitest';

import type { EstadoDoDesafio } from './desafios';
import type { Achievement } from './gamification';
import { estadoAtual, novidades } from './novidades';

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

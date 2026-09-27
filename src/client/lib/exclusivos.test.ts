import { describe, expect, it } from 'vitest';

import { FUNDOS, FUNDOS_DE_CONQUISTA } from '../components/ui/Fundo';
import { MOLDURAS, MOLDURAS_DE_CONQUISTA } from '../components/ui/Moldura';
import { ITENS } from './economia';
import { itemDeConquista, ITENS_DE_CONQUISTA, posseDeConquista } from './exclusivos';
import { computeAchievements, type GamificationInput } from './gamification';
import type { Attempt } from './mastery';

function entrada(attempts: Attempt[] = []): GamificationInput {
  return { attempts, completedLessons: [], completedProjects: [], reviews: [], hoje: new Date('2026-03-31T15:00:00') };
}

/** Um acerto por dia, `dias` dias seguidos até 31/03. */
function diasSeguidos(dias: number): Attempt[] {
  return Array.from({ length: dias }, (_, i) => {
    const dia = new Date(2026, 2, 31 - i, 10);
    return {
      exerciseId: `ex-${i}`,
      lessonId: 'lesson-1',
      concepts: ['loops'],
      correct: true,
      hintsUsed: 0,
      createdAt: dia.toISOString(),
    };
  });
}

describe('o catálogo de itens de conquista', () => {
  it('toda conquista citada existe', () => {
    const ids = new Set(computeAchievements(entrada()).map((c) => c.id));
    for (const item of ITENS_DE_CONQUISTA) expect(ids.has(item.conquista), `${item.id} → ${item.conquista}`).toBe(true);
  });

  it('o id é o tipo e o id curto, no formato que o banco aceita', () => {
    for (const item of ITENS_DE_CONQUISTA) {
      expect(item.id).toBe(`${item.tipo}-${item.curto}`);
      // O formato de `users_moldura_formato` e `users_fundo_formato` (0011).
      expect(item.curto).toMatch(/^[a-z0-9-]{1,40}$/);
    }
  });

  it('cada item tem desenho, e cada desenho de conquista tem item — nos dois sentidos', () => {
    const molduras = ITENS_DE_CONQUISTA.filter((i) => i.tipo === 'moldura').map((i) => i.curto);
    const fundos = ITENS_DE_CONQUISTA.filter((i) => i.tipo === 'fundo').map((i) => i.curto);
    expect([...molduras].sort()).toEqual([...MOLDURAS_DE_CONQUISTA].sort());
    expect([...fundos].sort()).toEqual([...FUNDOS_DE_CONQUISTA].sort());
  });

  it('nenhum está à venda, nem divide id com um da loja', () => {
    const daLoja = new Set(ITENS.map((i) => i.id));
    for (const item of ITENS_DE_CONQUISTA) expect(daLoja.has(item.id), item.id).toBe(false);
    for (const id of MOLDURAS_DE_CONQUISTA) expect((MOLDURAS as readonly string[]).includes(id)).toBe(false);
    for (const id of FUNDOS_DE_CONQUISTA) expect((FUNDOS as readonly string[]).includes(id)).toBe(false);
  });

  it('acha o item pelo tipo e pelo id curto', () => {
    expect(itemDeConquista('moldura', 'chama')?.id).toBe('moldura-chama');
    expect(itemDeConquista('fundo', 'chama')).toBeUndefined();
  });
});

describe('a posse vem da conquista', () => {
  const chama = itemDeConquista('moldura', 'chama')!;

  it('trinta dias seguidos abrem a Moldura Chama; vinte e nove, não — e dizem quanto falta', () => {
    expect(posseDeConquista(chama, computeAchievements(entrada(diasSeguidos(30))))).toEqual({
      tem: true,
      origem: 'conquista',
    });
    const quase = posseDeConquista(chama, computeAchievements(entrada(diasSeguidos(29))));
    expect(quase.tem).toBe(false);
    expect(!quase.tem && quase.conquista?.progresso).toEqual({ atual: 29, meta: 30 });
  });

  it('uma conquista ausente deixa o item trancado, em vez de abrir por engano', () => {
    const semAConquista = computeAchievements(entrada(diasSeguidos(30))).filter((c) => c.id !== 'mes-inteiro');
    expect(posseDeConquista(chama, semAConquista).tem).toBe(false);
  });
});

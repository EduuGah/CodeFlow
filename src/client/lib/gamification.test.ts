import { describe, expect, it } from 'vitest';

import type { Attempt } from './mastery';
import type { FlashcardReview } from './review';
import {
  computeAchievements,
  computeXp,
  levelFromXp,
  NIVEIS,
  XP,
  type GamificationInput,
} from './gamification';

/**
 * O risco desta área não é bug de cálculo — é incentivo errado. Um XP que
 * recompensa repetição ensina o aluno a repetir; um que recompensa velocidade
 * ensina a chutar. Boa parte destes testes existe para travar esses caminhos.
 */

function t(over: Partial<Attempt> = {}): Attempt {
  return {
    exerciseId: 'ex-1',
    lessonId: 'lesson-1',
    concepts: ['loops'],
    correct: true,
    hintsUsed: 0,
    createdAt: '2026-03-10T10:00:00.000Z',
    ...over,
  };
}

function entrada(over: Partial<GamificationInput> = {}): GamificationInput {
  return {
    attempts: [],
    completedLessons: [],
    completedProjects: [],
    reviews: [],
    hoje: new Date('2026-03-10T15:00:00'),
    ...over,
  };
}

describe('XP não é farmável', () => {
  it('sem atividade, o XP é zero', () => {
    expect(computeXp(entrada()).total).toBe(0);
  });

  it('resolver o mesmo exercício várias vezes rende uma vez só', () => {
    const uma = computeXp(entrada({ attempts: [t()] })).exercicios;
    const cem = computeXp(
      entrada({ attempts: Array.from({ length: 100 }, () => t()) })
    ).exercicios;

    expect(cem).toBe(uma);
  });

  it('tentativas erradas sozinhas não geram XP', () => {
    const xp = computeXp(entrada({ attempts: [t({ correct: false }), t({ correct: false })] }));
    expect(xp.exercicios).toBe(0);
  });

  it('revisar o mesmo cartão de novo não gera XP extra', () => {
    const review = (id: string): FlashcardReview => ({
      flashcardId: id,
      rating: 'facil',
      createdAt: '2026-03-10T10:00:00.000Z',
    });

    const uma = computeXp(entrada({ reviews: [review('fc-1')] })).revisao;
    const dez = computeXp(
      entrada({ reviews: Array.from({ length: 10 }, () => review('fc-1')) })
    ).revisao;

    expect(dez).toBe(uma);
  });
});

describe('XP recompensa qualidade, não velocidade', () => {
  it('resolver sem dica rende mais que resolver com dica', () => {
    const semDica = computeXp(entrada({ attempts: [t({ hintsUsed: 0 })] })).exercicios;
    const comDica = computeXp(entrada({ attempts: [t({ hintsUsed: 2 })] })).exercicios;

    expect(semDica).toBe(XP.exercicioResolvido + XP.bonusSemDica);
    expect(comDica).toBe(XP.exercicioResolvido);
    expect(semDica).toBeGreaterThan(comDica);
  });

  it('quem erra e depois acerta ganha bônus de persistência', () => {
    const dePrimeira = computeXp(entrada({ attempts: [t()] })).exercicios;
    const insistindo = computeXp(
      entrada({
        attempts: [t({ correct: false }), t({ correct: false }), t({ correct: true })],
      })
    ).exercicios;

    // Errar e voltar é o hábito que a plataforma quer reforçar (§174).
    expect(insistindo).toBe(dePrimeira + XP.bonusPersistencia);
  });

  it('não existe bônus por tempo: duas tentativas idênticas em datas diferentes valem igual', () => {
    const rapido = computeXp(entrada({ attempts: [t({ createdAt: '2026-03-10T10:00:00.000Z' })] }));
    const lento = computeXp(entrada({ attempts: [t({ createdAt: '2026-03-10T10:59:00.000Z' })] }));

    expect(rapido.total).toBe(lento.total);
  });

  it('projeto vale mais que aula, que vale mais que exercício', () => {
    expect(XP.porProjetoEntregue).toBeGreaterThan(XP.porAulaConcluida);
    expect(XP.porAulaConcluida).toBeGreaterThan(XP.exercicioResolvido);
  });

  it('soma as quatro fontes no total', () => {
    const xp = computeXp(
      entrada({
        attempts: [t({ exerciseId: 'a' }), t({ exerciseId: 'b' })],
        completedLessons: ['l1'],
        completedProjects: ['p1'],
        reviews: [{ flashcardId: 'fc-1', rating: 'facil', createdAt: '2026-03-10T10:00:00.000Z' }],
      })
    );

    expect(xp.exercicios).toBe(2 * (XP.exercicioResolvido + XP.bonusSemDica));
    expect(xp.aulas).toBe(XP.porAulaConcluida);
    expect(xp.projetos).toBe(XP.porProjetoEntregue);
    expect(xp.revisao).toBe(XP.porCartaoRevisado);
    expect(xp.total).toBe(xp.exercicios + xp.aulas + xp.projetos + xp.revisao);
  });
});

describe('níveis', () => {
  it('começa no primeiro nível com zero XP', () => {
    const info = levelFromXp(0);
    expect(info.level).toBe(1);
    expect(info.title).toBe('Explorador');
    expect(info.xpIntoLevel).toBe(0);
  });

  it('sobe de nível ao cruzar o limiar', () => {
    const abaixo = levelFromXp(NIVEIS[1].minXp - 1);
    const exato = levelFromXp(NIVEIS[1].minXp);

    expect(abaixo.level).toBe(1);
    expect(exato.level).toBe(2);
  });

  it('informa quanto falta para o próximo', () => {
    const info = levelFromXp(NIVEIS[1].minXp);
    expect(info.xpForNextLevel).toBe(NIVEIS[2].minXp - NIVEIS[1].minXp);
    expect(info.nextTitle).toBe(NIVEIS[2].title);
  });

  it('no último nível não promete um próximo que não existe', () => {
    const info = levelFromXp(999999);
    expect(info.level).toBe(NIVEIS[NIVEIS.length - 1].level);
    expect(info.xpForNextLevel).toBeNull();
    expect(info.nextTitle).toBeNull();
  });

  it('os limiares são crescentes', () => {
    for (let i = 1; i < NIVEIS.length; i++) {
      expect(NIVEIS[i].minXp).toBeGreaterThan(NIVEIS[i - 1].minXp);
    }
  });
});

describe('conquistas', () => {
  const idsDesbloqueados = (input: GamificationInput) =>
    computeAchievements(input)
      .filter((a) => a.unlocked)
      .map((a) => a.id);

  it('sem atividade, nenhuma conquista', () => {
    expect(idsDesbloqueados(entrada())).toEqual([]);
  });

  it('a lista de conquistas é sempre completa, com as travadas visíveis', () => {
    const todas = computeAchievements(entrada());
    expect(todas.length).toBeGreaterThan(5);
    expect(todas.every((a) => a.title && a.description)).toBe(true);
  });

  it('errar já conta como primeiro código executado', () => {
    expect(idsDesbloqueados(entrada({ attempts: [t({ correct: false })] }))).toContain(
      'primeiro-codigo'
    );
  });

  it('"resolveu sozinho" exige acerto sem dica', () => {
    expect(idsDesbloqueados(entrada({ attempts: [t({ hintsUsed: 3 })] }))).not.toContain(
      'sem-ajuda'
    );
    expect(idsDesbloqueados(entrada({ attempts: [t({ hintsUsed: 0 })] }))).toContain('sem-ajuda');
  });

  it('"não desistiu" exige falha ANTES do acerto no mesmo exercício', () => {
    const soAcerto = idsDesbloqueados(entrada({ attempts: [t({ exerciseId: 'a' })] }));
    expect(soAcerto).not.toContain('persistente');

    const errouEmOutro = idsDesbloqueados(
      entrada({ attempts: [t({ exerciseId: 'a' }), t({ exerciseId: 'b', correct: false })] })
    );
    // Errar num exercício e acertar outro não é persistência.
    expect(errouEmOutro).not.toContain('persistente');

    const insistiu = idsDesbloqueados(
      entrada({
        attempts: [t({ exerciseId: 'a', correct: false }), t({ exerciseId: 'a', correct: true })],
      })
    );
    expect(insistiu).toContain('persistente');
  });

  it('"abrangente" conta conceitos distintos, não tentativas', () => {
    const muitasNoMesmo = idsDesbloqueados(
      entrada({ attempts: Array.from({ length: 20 }, () => t({ concepts: ['loops'] })) })
    );
    expect(muitasNoMesmo).not.toContain('abrangente');

    const cincoConceitos = idsDesbloqueados(
      entrada({
        attempts: ['a', 'b', 'c', 'd', 'e'].map((c) => t({ concepts: [c] })),
      })
    );
    expect(cincoConceitos).toContain('abrangente');
  });

  it('"três dias seguidos" usa a sequência real', () => {
    const attempts = ['2026-03-08', '2026-03-09', '2026-03-10'].map((d) =>
      t({ createdAt: new Date(`${d}T10:00:00`).toISOString() })
    );
    expect(idsDesbloqueados(entrada({ attempts }))).toContain('constante');
  });
});

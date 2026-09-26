import { describe, expect, it } from 'vitest';

import type { Attempt } from './mastery';
import type { FlashcardReview } from './review';
import {
  computeAchievements,
  computeXp,
  levelFromXp,
  tituloDoNivel,
  xpMinimoDoNivel,
  XP,
  type GamificationInput,
} from './gamification';
import { desafiosDoDia, RECOMPENSA } from './desafios';
import { listTracks } from '../../content';

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

  it('soma as cinco fontes no total', () => {
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
    expect(xp.total).toBe(xp.exercicios + xp.aulas + xp.projetos + xp.revisao + xp.desafios);
  });

  it('um desafio cumprido rende o XP dele', () => {
    // 2026-03-10 é um dos dias em que "sem abrir dica" está sorteado: dois
    // exercícios sem dica cumprem a meta. Lido do sorteio, não fixado.
    const dia = desafiosDoDia('2026-03-10').find((d) => d.id === 'dia-sem-dica-2');
    if (!dia) return; // o sorteio deste dia não tem o desafio: nada a provar aqui

    const xp = computeXp(
      entrada({ attempts: [t({ exerciseId: 'a', createdAt: '2026-03-10T13:00:00' }), t({ exerciseId: 'b', createdAt: '2026-03-10T13:05:00' })] })
    );
    expect(xp.desafios).toBeGreaterThanOrEqual(RECOMPENSA.dia.xp);
  });
});

describe('dobro de XP', () => {
  const compra = (quando: string) => ({ item: 'dobro-de-xp', price: 80, createdAt: quando });

  it('o que acontece nas 24 horas depois da compra vale o dobro', () => {
    const dentro = computeXp(
      entrada({
        attempts: [t({ createdAt: '2026-03-10T12:00:00.000Z' })],
        purchases: [compra('2026-03-10T10:00:00.000Z')],
      })
    );
    expect(dentro.exercicios).toBe(2 * (XP.exercicioResolvido + XP.bonusSemDica));
    expect(dentro.dobrado).toBe(XP.exercicioResolvido + XP.bonusSemDica);
  });

  it('fora da janela, vale o de sempre — antes e depois', () => {
    const antes = computeXp(
      entrada({ attempts: [t({ createdAt: '2026-03-10T09:00:00.000Z' })], purchases: [compra('2026-03-10T10:00:00.000Z')] })
    );
    const depois = computeXp(
      entrada({ attempts: [t({ createdAt: '2026-03-11T10:00:00.000Z' })], purchases: [compra('2026-03-10T10:00:00.000Z')] })
    );
    expect(antes.dobrado).toBe(0);
    expect(depois.dobrado).toBe(0);
  });

  it('resolver de novo dentro da janela um exercício antigo não dobra nada', () => {
    // O XP é do primeiro acerto; a janela só vale para o que rende XP nela.
    const xp = computeXp(
      entrada({
        attempts: [t({ createdAt: '2026-03-01T10:00:00.000Z' }), t({ createdAt: '2026-03-10T12:00:00.000Z' })],
        purchases: [compra('2026-03-10T10:00:00.000Z')],
      })
    );
    expect(xp.dobrado).toBe(0);
  });

  it('reabrir uma aula já concluída dentro da janela não dobra os 50 XP dela', () => {
    // O exploit da auditoria de 2026-09-26: a aula era datada pela ÚLTIMA
    // tentativa certa, então comprar o dobro e refazer um exercício de cada
    // aula antiga dobrava o XP de todas as aulas já concluídas.
    const xp = computeXp(
      entrada({
        completedLessons: ['lesson-1'],
        attempts: [
          t({ exerciseId: 'a', createdAt: '2026-03-01T10:00:00.000Z' }),
          t({ exerciseId: 'b', createdAt: '2026-03-01T10:05:00.000Z' }),
          t({ exerciseId: 'a', createdAt: '2026-03-10T12:00:00.000Z' }),
        ],
        purchases: [compra('2026-03-10T10:00:00.000Z')],
      })
    );
    expect(xp.aulas).toBe(XP.porAulaConcluida);
    expect(xp.dobrado).toBe(0);
  });

  it('a aula que fecha dentro da janela dobra: o último exercício foi resolvido nela', () => {
    const xp = computeXp(
      entrada({
        completedLessons: ['lesson-1'],
        attempts: [
          t({ exerciseId: 'a', createdAt: '2026-03-01T10:00:00.000Z' }),
          t({ exerciseId: 'b', createdAt: '2026-03-10T12:00:00.000Z' }),
        ],
        purchases: [compra('2026-03-10T10:00:00.000Z')],
      })
    );
    expect(xp.aulas).toBe(2 * XP.porAulaConcluida);
  });

  it('projeto não dobra: não tem hora registrada', () => {
    const xp = computeXp(entrada({ completedProjects: ['p1'], purchases: [compra('2026-03-10T10:00:00.000Z')] }));
    expect(xp.projetos).toBe(XP.porProjetoEntregue);
  });
});

describe('níveis', () => {
  it('começa no primeiro nível com zero XP', () => {
    const info = levelFromXp(0);
    expect(info.level).toBe(1);
    expect(info.title).toBe('Explorador');
    expect(info.xpIntoLevel).toBe(0);
    expect(info.xpForNextLevel).toBe(150);
  });

  it('sobe de nível ao cruzar o limiar', () => {
    expect(levelFromXp(xpMinimoDoNivel(2) - 1).level).toBe(1);
    expect(levelFromXp(xpMinimoDoNivel(2)).level).toBe(2);
    expect(levelFromXp(xpMinimoDoNivel(10)).level).toBe(10);
  });

  it('informa quanto falta para o próximo, e se o título muda', () => {
    const dois = levelFromXp(xpMinimoDoNivel(2));
    expect(dois.xpForNextLevel).toBe(xpMinimoDoNivel(3) - xpMinimoDoNivel(2));
    expect(dois.nextTitle).toBe('Iniciante');
    expect(dois.proximoMudaTitulo).toBe(true);

    const tres = levelFromXp(xpMinimoDoNivel(3));
    expect(tres.proximoMudaTitulo).toBe(false);
  });

  it('não tem teto: XP alto continua subindo de nível', () => {
    const alto = levelFromXp(999999);
    expect(alto.level).toBeGreaterThan(25);
    expect(alto.title).toBe('Mestre');
    expect(alto.xpForNextLevel).toBeGreaterThan(0);
  });

  it('cada nível pede mais XP que o anterior, e o catálogo inteiro não cabe em seis', () => {
    for (let n = 2; n < 40; n++) {
      expect(xpMinimoDoNivel(n + 1) - xpMinimoDoNivel(n)).toBeGreaterThan(xpMinimoDoNivel(n) - xpMinimoDoNivel(n - 1));
    }
    // Uns 25 mil XP no catálogo de hoje: a versão anterior parava no nível 6 com 3.200.
    expect(levelFromXp(25000).level).toBeGreaterThanOrEqual(15);
  });

  it('os títulos vêm em faixas crescentes', () => {
    expect(tituloDoNivel(1)).toBe('Explorador');
    expect(tituloDoNivel(4)).toBe('Iniciante');
    expect(tituloDoNivel(12)).toBe('Desenvolvedor');
    expect(tituloDoNivel(40)).toBe('Mestre');
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
    expect(todas.length).toBeGreaterThan(20);
    expect(todas.every((a) => a.title && a.description && a.categoria)).toBe(true);
    // Ids únicos: duas conquistas com o mesmo id se sobreporiam na tela.
    expect(new Set(todas.map((a) => a.id)).size).toBe(todas.length);
  });

  it('as de contagem mostram o progresso, limitado à meta', () => {
    const dez = computeAchievements(
      entrada({ attempts: Array.from({ length: 30 }, (_, i) => t({ exerciseId: `ex-${i}` })) })
    );
    const autonomo = dez.find((a) => a.id === 'autonomo')!;
    expect(autonomo.unlocked).toBe(true);
    expect(autonomo.progresso).toEqual({ atual: 10, meta: 10 });
    const cinquenta = dez.find((a) => a.id === 'cinquenta')!;
    expect(cinquenta.progresso).toEqual({ atual: 30, meta: 50 });
  });

  it('a conquista de trilha só abre com todas as aulas dela', () => {
    const trilha = listTracks()[0];
    const quase = computeAchievements(entrada({ completedLessons: trilha.lessonIds.slice(1) }));
    expect(quase.find((a) => a.id === `trilha-${trilha.id}`)!.unlocked).toBe(false);
    const toda = computeAchievements(entrada({ completedLessons: trilha.lessonIds }));
    expect(toda.find((a) => a.id === `trilha-${trilha.id}`)!.unlocked).toBe(true);
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

import { describe, expect, it } from 'vitest';

import type { Flashcard } from '../../content/types';
import {
  buildReviewSession,
  cardState,
  describeNextInterval,
  dueCount,
  INTERVALOS_EM_DIAS,
  type FlashcardReview,
} from './review';

/**
 * A repetição espaçada decide o que o aluno vê e quando. Errar o cálculo do
 * intervalo não quebra tela nenhuma: só faz o cartão sumir por tempo demais, ou
 * voltar tantas vezes que a revisão vira punição.
 */

function revisao(flashcardId: string, rating: FlashcardReview['rating'], dia: string): FlashcardReview {
  return { flashcardId, rating, createdAt: new Date(`${dia}T10:00:00`).toISOString() };
}

function card(id: string, concepts: string[] = ['loops']): Flashcard {
  return { id, front: `frente ${id}`, back: `verso ${id}`, concepts };
}

const hoje = new Date('2026-03-10T15:00:00');

describe('estado do cartão', () => {
  it('cartão nunca revisado não tem data de retorno', () => {
    const s = cardState('fc-1', []);
    expect(s.step).toBe(-1);
    expect(s.reviews).toBe(0);
    expect(s.dueOn).toBeNull();
  });

  it('primeira revisão "fácil" avança um degrau', () => {
    const s = cardState('fc-1', [revisao('fc-1', 'facil', '2026-03-10')]);
    expect(s.step).toBe(1);
    expect(s.dueOn).toBe('2026-03-13'); // 3 dias
  });

  it('"médio" mantém o degrau em vez de avançar', () => {
    const s = cardState('fc-1', [revisao('fc-1', 'medio', '2026-03-10')]);
    expect(s.step).toBe(0);
    expect(s.dueOn).toBe('2026-03-11'); // 1 dia
  });

  it('"difícil" reinicia o cartão, mesmo depois de vários acertos', () => {
    const s = cardState('fc-1', [
      revisao('fc-1', 'facil', '2026-01-01'),
      revisao('fc-1', 'facil', '2026-01-05'),
      revisao('fc-1', 'facil', '2026-01-15'),
      revisao('fc-1', 'dificil', '2026-03-10'),
    ]);
    // Esticar o intervalo de algo que o aluno não lembrou garantiria o
    // esquecimento na próxima vez.
    expect(s.step).toBe(0);
    expect(s.dueOn).toBe('2026-03-11');
  });

  it('acertos seguidos alargam o intervalo progressivamente', () => {
    const s = cardState('fc-1', [
      revisao('fc-1', 'facil', '2026-01-01'),
      revisao('fc-1', 'facil', '2026-01-05'),
      revisao('fc-1', 'facil', '2026-01-15'),
    ]);
    expect(s.step).toBe(3);
    expect(INTERVALOS_EM_DIAS[s.step]).toBe(14);
  });

  it('o intervalo não cresce além do último degrau', () => {
    const muitas = Array.from({ length: 20 }, (_, i) =>
      revisao('fc-1', 'facil', `2026-01-${String(i + 1).padStart(2, '0')}`)
    );
    const s = cardState('fc-1', muitas);
    expect(s.step).toBe(INTERVALOS_EM_DIAS.length - 1);
  });

  it('revisões de outro cartão não interferem', () => {
    const s = cardState('fc-1', [revisao('fc-2', 'facil', '2026-03-10')]);
    expect(s.reviews).toBe(0);
  });

  it('a ordem cronológica vale, não a ordem do array', () => {
    const s = cardState('fc-1', [
      revisao('fc-1', 'dificil', '2026-03-10'),
      revisao('fc-1', 'facil', '2026-03-01'),
    ]);
    // A "difícil" é a mais recente, então o cartão reinicia.
    expect(s.step).toBe(0);
  });
});

describe('montagem da sessão', () => {
  const cards = [card('fc-1'), card('fc-2'), card('fc-3')];

  it('sem histórico, todos os cartões entram', () => {
    expect(buildReviewSession(cards, [], [], hoje)).toHaveLength(3);
  });

  it('cartão ainda não vencido fica de fora', () => {
    // Revisado ontem como fácil: volta só em 3 dias.
    const reviews = [revisao('fc-1', 'facil', '2026-03-09')];
    const ids = buildReviewSession(cards, reviews, [], hoje).map((d) => d.card.id);

    expect(ids).not.toContain('fc-1');
    expect(ids).toHaveLength(2);
  });

  it('cartão vencido volta para a sessão', () => {
    const reviews = [revisao('fc-1', 'dificil', '2026-03-01')];
    const ids = buildReviewSession(cards, reviews, [], hoje).map((d) => d.card.id);
    expect(ids).toContain('fc-1');
  });

  it('cartão que vence hoje entra na sessão', () => {
    // Difícil ontem: intervalo de 1 dia, vence exatamente hoje.
    const reviews = [revisao('fc-1', 'dificil', '2026-03-09')];
    const ids = buildReviewSession(cards, reviews, [], hoje).map((d) => d.card.id);
    expect(ids).toContain('fc-1');
  });

  it('conceito com desempenho ruim nos exercícios vem primeiro', () => {
    const mistos = [card('fc-a', ['arrays']), card('fc-b', ['loops']), card('fc-c', ['arrays'])];
    const sessao = buildReviewSession(mistos, [], ['arrays'], hoje);

    expect(sessao.slice(0, 2).map((d) => d.card.id).sort()).toEqual(['fc-a', 'fc-c']);
    expect(sessao[0].priority).toBe(true);
    expect(sessao[2].card.id).toBe('fc-b');
  });

  it('entre vencidos, o mais atrasado vem antes', () => {
    const reviews = [
      revisao('fc-1', 'dificil', '2026-03-05'),
      revisao('fc-2', 'dificil', '2026-03-01'),
    ];
    const ids = buildReviewSession(cards, reviews, [], hoje).map((d) => d.card.id);
    expect(ids.slice(0, 2)).toEqual(['fc-2', 'fc-1']);
  });

  it('cartão nunca visto vai para o fim da fila', () => {
    const reviews = [revisao('fc-1', 'dificil', '2026-03-01')];
    const sessao = buildReviewSession(cards, reviews, [], hoje);
    // Reforçar o que já falhou rende mais do que introduzir material novo.
    expect(sessao[0].card.id).toBe('fc-1');
  });

  it('sessão vazia quando tudo já foi revisado recentemente', () => {
    const reviews = cards.map((c) => revisao(c.id, 'facil', '2026-03-09'));
    expect(buildReviewSession(cards, reviews, [], hoje)).toEqual([]);
  });

  it('dueCount concorda com o tamanho da sessão', () => {
    const reviews = [revisao('fc-1', 'facil', '2026-03-09')];
    expect(dueCount(cards, reviews, hoje)).toBe(2);
  });
});

describe('descrição do próximo intervalo', () => {
  const novo = cardState('fc-1', []);

  it('difícil traz o cartão de volta amanhã', () => {
    expect(describeNextInterval(novo, 'dificil')).toBe('volta amanhã');
  });

  it('fácil num cartão novo adia alguns dias', () => {
    expect(describeNextInterval(novo, 'facil')).toBe('volta em 3 dias');
  });

  it('cartão maduro ganha intervalo em meses', () => {
    const maduro = cardState('fc-1', [
      revisao('fc-1', 'facil', '2026-01-01'),
      revisao('fc-1', 'facil', '2026-01-05'),
      revisao('fc-1', 'facil', '2026-01-15'),
      revisao('fc-1', 'facil', '2026-02-01'),
    ]);
    expect(describeNextInterval(maduro, 'facil')).toContain('meses');
  });
});

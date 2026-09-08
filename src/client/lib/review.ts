import type { Flashcard } from '../../content/types';

/**
 * Repetição espaçada dos flashcards (§200 e §201).
 *
 * O modelo é de degraus fixos, no espírito do sistema Leitner, e **não** uma
 * imitação de SM-2. A razão é a transparência do §282: o aluno consegue entender
 * "acertei fácil, então volta daqui a uma semana" — mas não consegue auditar um
 * fator de facilidade com casas decimais. Um modelo simples que a pessoa entende
 * vale mais do que um sofisticado em que ela precisa acreditar.
 *
 * Os intervalos foram escolhidos por convenção, não por dados deste produto, e
 * devem ser recalibrados com uso real (§423).
 */

export type ReviewRating = 'dificil' | 'medio' | 'facil';

export interface FlashcardReview {
  flashcardId: string;
  rating: ReviewRating;
  /** ISO 8601. */
  createdAt: string;
}

/** Dias até a próxima revisão, por degrau. O último degrau se repete. */
export const INTERVALOS_EM_DIAS = [1, 3, 7, 14, 30, 60];

export interface CardState {
  flashcardId: string;
  /** Índice em INTERVALOS_EM_DIAS. -1 quando nunca foi revisado. */
  step: number;
  reviews: number;
  lastReviewedAt: string | null;
  /** Dia (AAAA-MM-DD) em que o cartão volta a aparecer. `null` = nunca visto. */
  dueOn: string | null;
}

function diaLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function somarDias(dia: string, delta: number): string {
  const [ano, mes, d] = dia.split('-').map(Number);
  return diaLocal(new Date(ano, mes - 1, d + delta));
}

/**
 * Avança, mantém ou reinicia o degrau conforme a autoavaliação.
 *
 * "Difícil" volta ao começo de propósito: se o aluno não lembrou, esticar o
 * intervalo garante que ele também não vai lembrar da próxima vez.
 */
function proximoDegrau(atual: number, rating: ReviewRating): number {
  if (rating === 'dificil') return 0;
  if (rating === 'medio') return Math.max(0, atual);
  return Math.min(atual + 1, INTERVALOS_EM_DIAS.length - 1);
}

/** Estado atual de um cartão, dobrando o histórico dele em ordem cronológica. */
export function cardState(flashcardId: string, reviews: FlashcardReview[]): CardState {
  const doCartao = reviews
    .filter((r) => r.flashcardId === flashcardId)
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  if (doCartao.length === 0) {
    return { flashcardId, step: -1, reviews: 0, lastReviewedAt: null, dueOn: null };
  }

  let step = -1;
  for (const r of doCartao) {
    step = proximoDegrau(step === -1 ? 0 : step, r.rating);
  }

  const ultima = doCartao[doCartao.length - 1];
  const diaDaUltima = diaLocal(new Date(ultima.createdAt));

  return {
    flashcardId,
    step,
    reviews: doCartao.length,
    lastReviewedAt: ultima.createdAt,
    dueOn: somarDias(diaDaUltima, INTERVALOS_EM_DIAS[step]),
  };
}

export interface DueCard {
  card: Flashcard;
  state: CardState;
  /** Cartão de um conceito que o aluno vem errando nos exercícios (§202). */
  priority: boolean;
}

/**
 * Monta a sessão de revisão.
 *
 * A ordem não é aleatória nem fixa: primeiro os cartões de conceitos que o aluno
 * vem errando **nos exercícios** — porque a revisão deve responder ao desempenho
 * real, não só ao calendário. Depois os vencidos há mais tempo, e por último os
 * nunca vistos.
 */
export function buildReviewSession(
  cards: Flashcard[],
  reviews: FlashcardReview[],
  conceptsToPrioritize: string[],
  hoje: Date = new Date()
): DueCard[] {
  const hojeStr = diaLocal(hoje);
  const prioritarios = new Set(conceptsToPrioritize);

  return cards
    .map((card) => {
      const state = cardState(card.id, reviews);
      return {
        card,
        state,
        priority: card.concepts.some((c) => prioritarios.has(c)),
      };
    })
    .filter(({ state }) => state.dueOn === null || state.dueOn <= hojeStr)
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority ? -1 : 1;

      // Nunca visto vai para o fim: reforçar o que já falhou rende mais do que
      // introduzir material novo numa sessão de revisão.
      if (a.state.dueOn === null || b.state.dueOn === null) {
        return a.state.dueOn === null ? 1 : -1;
      }

      return a.state.dueOn.localeCompare(b.state.dueOn);
    });
}

/**
 * Separa o que venceu do que nunca foi visto.
 *
 * A contagem única misturava os dois, e a tela chamava tudo de "vencido". Para
 * quem acabou de chegar isso é falso e soa como cobrança: 22 cartões vencidos no
 * primeiro acesso é uma dívida que a pessoa não contraiu. São coisas diferentes —
 * um é reforço de algo que já se viu, o outro é material novo.
 */
export function countCards(
  cards: Flashcard[],
  reviews: FlashcardReview[],
  hoje: Date = new Date()
): { vencidos: number; novos: number; total: number } {
  const sessao = buildReviewSession(cards, reviews, [], hoje);
  const novos = sessao.filter(({ state }) => state.dueOn === null).length;

  return { vencidos: sessao.length - novos, novos, total: sessao.length };
}

/** Quantos cartões estão disponíveis para revisar hoje. */
export function dueCount(
  cards: Flashcard[],
  reviews: FlashcardReview[],
  hoje: Date = new Date()
): number {
  return buildReviewSession(cards, reviews, [], hoje).length;
}

/** Texto do intervalo, para o aluno saber o efeito da resposta que vai dar. */
export function describeNextInterval(state: CardState, rating: ReviewRating): string {
  const base = state.step === -1 ? 0 : state.step;
  const dias = INTERVALOS_EM_DIAS[proximoDegrau(base, rating)];

  if (dias === 1) return 'volta amanhã';
  if (dias < 30) return `volta em ${dias} dias`;
  return `volta em ${Math.round(dias / 30)} ${dias >= 60 ? 'meses' : 'mês'}`;
}

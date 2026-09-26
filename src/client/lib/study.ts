import type { Attempt } from './mastery';
import { diaLocal } from './sequencia';

/**
 * Estatísticas de sessão de estudo, derivadas do histórico de tentativas.
 *
 * Separado de `mastery.ts` de propósito: lá o assunto é *o que* o aluno domina;
 * aqui é *quando* e *onde* ele estava — informação de retomada e de ritmo.
 */

function diaDaTentativa(attempt: Attempt): string {
  return diaLocal(new Date(attempt.createdAt));
}

function diasDistintos(attempts: Attempt[]): string[] {
  return [...new Set(attempts.map(diaDaTentativa))].sort();
}

// A sequência de dias mora em `sequencia.ts` (`calcularSequencia`), com os
// congelamentos da loja. Havia uma segunda cópia aqui, sem eles — e com a
// própria cópia de `diaLocal` —, que nada na aplicação usava mais.

/** Dias desde a última atividade. `null` quando nunca houve nenhuma. */
export function daysSinceLastStudy(attempts: Attempt[], hoje: Date = new Date()): number | null {
  const dias = diasDistintos(attempts);
  if (dias.length === 0) return null;

  const ultimo = new Date(`${dias[dias.length - 1]}T00:00:00`);
  const referencia = new Date(`${diaLocal(hoje)}T00:00:00`);

  const msPorDia = 24 * 60 * 60 * 1000;
  return Math.round((referencia.getTime() - ultimo.getTime()) / msPorDia);
}

export interface ResumePoint {
  lessonId: string;
  exerciseId: string;
  createdAt: string;
  /** A última tentativa deu certo? Muda o convite: "continuar" ou "tentar de novo". */
  wasCorrect: boolean;
}

/**
 * Onde o aluno estava da última vez (§108).
 *
 * Mais preciso que "próxima aula da trilha": leva de volta ao ponto exato em que
 * a pessoa parou, que raramente é o começo de uma aula nova.
 */
export function lastActivity(attempts: Attempt[]): ResumePoint | null {
  if (attempts.length === 0) return null;

  const maisRecente = attempts.reduce((a, b) => (a.createdAt >= b.createdAt ? a : b));

  return {
    lessonId: maisRecente.lessonId,
    exerciseId: maisRecente.exerciseId,
    createdAt: maisRecente.createdAt,
    wasCorrect: maisRecente.correct,
  };
}

/**
 * Exercícios que o aluno ainda não resolveu.
 *
 * Inclui tanto os nunca tentados quanto os tentados sem sucesso — os dois são
 * trabalho pendente, e distingui-los aqui não mudaria a ação recomendada.
 */
export function unsolvedExerciseIds(allExerciseIds: string[], attempts: Attempt[]): string[] {
  const resolvidos = new Set(attempts.filter((a) => a.correct).map((a) => a.exerciseId));
  return allExerciseIds.filter((id) => !resolvidos.has(id));
}

/**
 * Exercícios que o aluno tentou e deixou para trás.
 *
 * Diferente de `unsolvedExerciseIds`, que devolve tudo que ainda não foi
 * resolvido — inclusive exercícios de aulas que a pessoa nem abriu. Mostrar esse
 * número na tela inicial transforma o catálogo inteiro em dívida: um aluno na
 * terceira aula via "26 exercícios em aberto", contando material que ele não
 * tinha como ter feito.
 *
 * Aqui a conta é estreita e acionável: tentou ao menos uma vez, nunca acertou.
 */
export function abandonedExerciseIds(attempts: Attempt[]): string[] {
  const tentados = new Set(attempts.map((a) => a.exerciseId));
  const resolvidos = new Set(attempts.filter((a) => a.correct).map((a) => a.exerciseId));

  return [...tentados].filter((id) => !resolvidos.has(id));
}

/**
 * Quando cada aula fechou: o instante em que o último dos exercícios dela foi
 * resolvido **pela primeira vez**.
 *
 * É o momento em que a aula passou a contar, e ele não muda depois. A versão
 * anterior datava a aula pela última tentativa certa — e refazer um exercício
 * antigo "reconcluía" a aula: dentro de um dobro de XP, os 50 XP dela
 * dobravam de novo (comprar o dobro e refazer um exercício de cada aula
 * antiga dobrava todas), e o desafio "conclua uma aula hoje" se cumpria sem
 * aula nova nenhuma, desfazendo o do dia original.
 *
 * Devolve só aulas com algum acerto; quem precisa das concluídas filtra.
 */
export function fechamentoDasAulas(attempts: Attempt[]): Map<string, string> {
  const primeiroAcerto = new Map<string, Attempt>();
  for (const a of attempts) {
    if (!a.correct) continue;
    const atual = primeiroAcerto.get(a.exerciseId);
    if (!atual || a.createdAt < atual.createdAt) primeiroAcerto.set(a.exerciseId, a);
  }

  const fechamento = new Map<string, string>();
  for (const a of primeiroAcerto.values()) {
    const atual = fechamento.get(a.lessonId);
    if (atual === undefined || a.createdAt > atual) fechamento.set(a.lessonId, a.createdAt);
  }
  return fechamento;
}

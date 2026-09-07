import type { Attempt } from './mastery';

/**
 * Estatísticas de sessão de estudo, derivadas do histórico de tentativas.
 *
 * Separado de `mastery.ts` de propósito: lá o assunto é *o que* o aluno domina;
 * aqui é *quando* e *onde* ele estava — informação de retomada e de ritmo.
 */

/** Data local no formato AAAA-MM-DD. Usar UTC viraria erro de um dia no Brasil. */
function diaLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function diaDaTentativa(attempt: Attempt): string {
  return diaLocal(new Date(attempt.createdAt));
}

function diasDistintos(attempts: Attempt[]): string[] {
  return [...new Set(attempts.map(diaDaTentativa))].sort();
}

function somarDias(dia: string, delta: number): string {
  const [ano, mes, d] = dia.split('-').map(Number);
  const data = new Date(ano, mes - 1, d + delta);
  return diaLocal(data);
}

/**
 * Sequência de dias consecutivos estudados.
 *
 * A sequência continua viva se a última atividade foi hoje **ou ontem** (§176).
 * Zerar às 00:00 puniria quem estuda à noite e ainda não abriu o app hoje —
 * transformando a sequência em fonte de ansiedade em vez de incentivo.
 */
export function currentStreak(attempts: Attempt[], hoje: Date = new Date()): number {
  const dias = new Set(diasDistintos(attempts));
  if (dias.size === 0) return 0;

  const hojeStr = diaLocal(hoje);
  const ontemStr = somarDias(hojeStr, -1);

  // Ponto de partida: hoje, se estudou; senão ontem. Mais que isso, quebrou.
  let cursor = dias.has(hojeStr) ? hojeStr : dias.has(ontemStr) ? ontemStr : null;
  if (cursor === null) return 0;

  let total = 0;
  while (dias.has(cursor)) {
    total += 1;
    cursor = somarDias(cursor, -1);
  }

  return total;
}

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

import { supabase } from './supabase';
import type { Attempt } from './mastery';

export interface UserProgress {
  completedLessons: string[];
  completedProjects: string[];
  /**
   * Preenchido quando a leitura falhou.
   *
   * Sem isto, uma falha de rede era indistinguível de "aluno sem progresso": o
   * painel mostrava tudo zerado como se fosse verdade, e quem já tinha concluído
   * aulas via o próprio avanço desaparecer sem explicação.
   */
  error?: string;
}

const EMPTY_PROGRESS: UserProgress = { completedLessons: [], completedProjects: [] };

/**
 * Lê o progresso do aluno na tabela `users`.
 * Nunca lança: se a leitura falhar, devolve progresso vazio para não travar a tela.
 */
export async function fetchProgress(userId: string): Promise<UserProgress> {
  if (!supabase) return { ...EMPTY_PROGRESS, error: 'Supabase não configurado.' };

  // maybeSingle() em vez de single(): um aluno recém-cadastrado ainda não tem linha,
  // e single() trataria isso como erro.
  const { data, error } = await supabase
    .from('users')
    .select('completed_lessons, completed_projects')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Falha ao buscar progresso do aluno:', error.message);
    return { ...EMPTY_PROGRESS, error: 'Não foi possível carregar seu progresso.' };
  }

  return {
    completedLessons: data?.completed_lessons ?? [],
    completedProjects: data?.completed_projects ?? [],
  };
}

/** Acrescenta um id a uma das listas de progresso, sem duplicar. */
async function appendToProgress(
  userId: string,
  column: 'completed_lessons' | 'completed_projects',
  id: string
): Promise<void> {
  if (!supabase) return;

  const current = await fetchProgress(userId);
  const list = column === 'completed_lessons' ? current.completedLessons : current.completedProjects;

  if (list.includes(id)) return;

  const { error } = await supabase
    .from('users')
    .upsert({ id: userId, [column]: [...list, id] }, { onConflict: 'id' });

  if (error) throw new Error(error.message);
}

export function markLessonCompleted(userId: string, lessonId: string): Promise<void> {
  return appendToProgress(userId, 'completed_lessons', lessonId);
}

export function markProjectCompleted(userId: string, projectId: string): Promise<void> {
  return appendToProgress(userId, 'completed_projects', projectId);
}

// ------------------------------------------------------- tentativas

/** O que o registrador precisa saber sobre uma tentativa. */
export interface AttemptInput {
  exerciseId: string;
  lessonId: string;
  concepts: string[];
  correct: boolean;
  hintsUsed: number;
}

/**
 * Registra uma tentativa.
 *
 * Nunca lança e nunca bloqueia: se a gravação falhar, o aluno segue estudando e
 * o erro fica no console. Perder um registro de telemetria é aceitável;
 * interromper a aula por causa dele não é.
 */
export async function recordAttempt(userId: string, attempt: AttemptInput): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('exercise_attempts').insert({
    user_id: userId,
    exercise_id: attempt.exerciseId,
    lesson_id: attempt.lessonId,
    concepts: attempt.concepts,
    correct: attempt.correct,
    hints_used: attempt.hintsUsed,
  });

  if (error) console.error('Falha ao registrar tentativa:', error.message);
}

/** Histórico de tentativas do aluno, do mais antigo para o mais recente. */
export async function fetchAttempts(userId: string): Promise<Attempt[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('exercise_attempts')
    .select('exercise_id, lesson_id, concepts, correct, hints_used, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Falha ao buscar tentativas:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    exerciseId: row.exercise_id,
    lessonId: row.lesson_id,
    concepts: row.concepts ?? [],
    correct: row.correct,
    hintsUsed: row.hints_used ?? 0,
    createdAt: row.created_at,
  }));
}

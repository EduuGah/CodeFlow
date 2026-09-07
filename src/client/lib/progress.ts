import { supabase } from './supabase';

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

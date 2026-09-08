import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getExercises, getLessonsOfTrack, listConcepts, listFlashcards, listTracks } from '../../content';
import { useAuth } from './AuthContext';
import { fetchAttempts, fetchFlashcardReviews, fetchProgress } from '../lib/progress';
import { conceptsNeedingReview, masteryByConcept, overallStats, type Attempt, type ConceptMastery } from '../lib/mastery';
import { computeAchievements, computeXp, levelFromXp } from '../lib/gamification';
import { dueCount, type FlashcardReview } from '../lib/review';
import { currentStreak, daysSinceLastStudy, lastActivity, unsolvedExerciseIds, type ResumePoint } from '../lib/study';

/**
 * Dados do aluno, buscados uma vez e compartilhados pelas abas.
 *
 * Antes cada tela fazia as próprias consultas. Com a navegação em abas isso
 * viraria três requisições a cada troca, e o aluno veria esqueleto de
 * carregamento toda vez que voltasse para o início — a sensação oposta de um
 * aplicativo.
 *
 * Aqui também ficam as derivações que mais de uma aba usa. Cada tela consome o
 * que precisa, sem recalcular nem conhecer a origem dos dados.
 */

interface StudentData {
  loading: boolean;
  /** Falha de leitura, para a interface poder dizer em vez de mostrar zero. */
  error: string | null;
  reload: () => void;

  completedLessons: string[];
  completedProjects: string[];
  attempts: Attempt[];
  reviews: FlashcardReview[];

  mastery: ConceptMastery[];
  conceptsToReview: ConceptMastery[];
  stats: ReturnType<typeof overallStats>;

  streak: number;
  daysAway: number | null;
  resume: ResumePoint | null;

  /** Exercícios ainda não resolvidos, e o total publicado. */
  pendingExercises: string[];
  totalExercises: number;
  /** Cartões vencidos hoje. */
  dueCards: number;

  xp: ReturnType<typeof computeXp>;
  level: ReturnType<typeof levelFromXp>;
  achievements: ReturnType<typeof computeAchievements>;
}

const StudentDataContext = createContext<StudentData | undefined>(undefined);

export function StudentDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [completedProjects, setCompletedProjects] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [reviews, setReviews] = useState<FlashcardReview[]>([]);
  const [versao, setVersao] = useState(0);

  const reload = useCallback(() => setVersao((v) => v + 1), []);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const [progresso, historico, revisoes] = await Promise.all([
        fetchProgress(user.id),
        fetchAttempts(user.id),
        fetchFlashcardReviews(user.id),
      ]);
      if (!ativo) return;

      setCompletedLessons(progresso.completedLessons);
      setCompletedProjects(progresso.completedProjects);
      setAttempts(historico);
      setReviews(revisoes);
      setError(progresso.error ?? null);
      setLoading(false);
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [user, versao]);

  const valor = useMemo<StudentData>(() => {
    const conceptIds = listConcepts().map((c) => c.id);
    const todosExercicios = listTracks()
      .flatMap((t) => getLessonsOfTrack(t.id))
      .flatMap((l) => getExercises(l))
      .map((e) => e.id);

    const entradaDeJogo = { attempts, completedLessons, completedProjects, reviews };
    const xp = computeXp(entradaDeJogo);

    return {
      loading,
      error,
      reload,
      completedLessons,
      completedProjects,
      attempts,
      reviews,
      mastery: masteryByConcept(conceptIds, attempts),
      conceptsToReview: conceptsNeedingReview(conceptIds, attempts),
      stats: overallStats(attempts),
      streak: currentStreak(attempts),
      daysAway: daysSinceLastStudy(attempts),
      resume: lastActivity(attempts),
      pendingExercises: unsolvedExerciseIds(todosExercicios, attempts),
      totalExercises: todosExercicios.length,
      dueCards: dueCount(listFlashcards(), reviews),
      xp,
      level: levelFromXp(xp.total),
      achievements: computeAchievements(entradaDeJogo),
    };
  }, [loading, error, reload, completedLessons, completedProjects, attempts, reviews]);

  return <StudentDataContext.Provider value={valor}>{children}</StudentDataContext.Provider>;
}

export function useStudentData() {
  const contexto = useContext(StudentDataContext);
  if (contexto === undefined) {
    throw new Error('useStudentData deve ser usado dentro de um StudentDataProvider');
  }
  return contexto;
}

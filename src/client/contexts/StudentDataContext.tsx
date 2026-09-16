import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getExercises, getLessonsOfTrack, listConcepts, listFlashcards, listTracks } from '../../content';
import { useAuth } from './AuthContext';
import { useTemaOpcional } from './TemaContext';
import { fetchAttempts, fetchFlashcardReviews, fetchProgress } from '../lib/progress';
import { fetchPerfil, fetchPurchases, recordPurchase, updatePerfil, type Acento, type Perfil, type Tema } from '../lib/perfil';
import { conceptsNeedingReview, masteryByConcept, overallStats, type Attempt, type ConceptMastery } from '../lib/mastery';
import { computeAchievements, computeXp, levelFromXp } from '../lib/gamification';
import { countCards, dueCount, type FlashcardReview } from '../lib/review';
import {
  abandonedExerciseIds,
  daysSinceLastStudy,
  lastActivity,
  unsolvedExerciseIds,
  type ResumePoint,
} from '../lib/study';
import { calcularSequencia, type Sequencia } from '../lib/sequencia';
import { desafiosAtuais, desafiosConcluidos, type EstadoDoDesafio } from '../lib/desafios';
import { dobroAtivo, itemDaLoja, moedasGanhas, moedasGastas, type FontesDeMoedas, type Purchase } from '../lib/economia';

/**
 * Dados do aluno, buscados uma vez e compartilhados pelas abas.
 *
 * Antes cada tela fazia as próprias consultas. Com a navegação em abas isso
 * viraria três requisições a cada troca, e o aluno veria esqueleto de
 * carregamento toda vez que voltasse para o início — a sensação oposta de um
 * aplicativo.
 *
 * Aqui também ficam as derivações que mais de uma aba usa. Cada tela consome o
 * que precisa, sem recalcular nem conhecer a origem dos dados. As duas
 * escritas que passam por aqui — comprar e salvar o perfil — atualizam o
 * estado local na hora, para a tela não esperar uma recarga.
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
  purchases: Purchase[];
  perfil: Perfil;

  mastery: ConceptMastery[];
  conceptsToReview: ConceptMastery[];
  stats: ReturnType<typeof overallStats>;

  /** A sequência de dias, com congelamentos. `streak` é o atalho para `sequencia.atual`. */
  sequencia: Sequencia;
  streak: number;
  daysAway: number | null;
  resume: ResumePoint | null;

  /** Exercícios ainda não resolvidos, e o total publicado. */
  pendingExercises: string[];
  /** Tentados e nunca resolvidos. É o que "em aberto" quer dizer para o aluno. */
  abandonedExercises: string[];
  totalExercises: number;
  /** Cartões vencidos hoje. */
  dueCards: number;
  /**
   * Separação entre reforço e material novo.
   *
   * `dueCards` junta os dois, e chamar tudo de "vencido" é falso para quem
   * acabou de chegar — vira uma dívida que a pessoa não contraiu.
   */
  cards: { vencidos: number; novos: number; total: number };

  xp: ReturnType<typeof computeXp>;
  level: ReturnType<typeof levelFromXp>;
  achievements: ReturnType<typeof computeAchievements>;

  desafios: { dia: EstadoDoDesafio[]; semana: EstadoDoDesafio[] };
  moedas: { ganhas: FontesDeMoedas; gastas: number; saldo: number };
  /** O dobro de XP que está valendo agora, se houver. */
  dobro: { ate: Date } | null;

  /** Compra um item da loja. Devolve a mensagem de erro, se houver. */
  comprar: (itemId: string) => Promise<{ error?: string }>;
  salvarPerfil: (mudancas: Partial<{ displayName: string | null; avatar: string | null; theme: Tema; accent: Acento }>) => Promise<{ error?: string }>;
}

const StudentDataContext = createContext<StudentData | undefined>(undefined);

const PERFIL_VAZIO: Perfil = { displayName: null, avatar: null, theme: null, accent: null };

export function StudentDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const adotar = useTemaOpcional()?.adotar;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [completedProjects, setCompletedProjects] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [reviews, setReviews] = useState<FlashcardReview[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_VAZIO);
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
      const [progresso, historico, revisoes, compras, dados] = await Promise.all([
        fetchProgress(user.id),
        fetchAttempts(user.id),
        fetchFlashcardReviews(user.id),
        fetchPurchases(user.id),
        fetchPerfil(user.id),
      ]);
      if (!ativo) return;

      setCompletedLessons(progresso.completedLessons);
      setCompletedProjects(progresso.completedProjects);
      setAttempts(historico);
      setReviews(revisoes);
      setPurchases(compras);
      setPerfil(dados);
      // O tema da conta vence o que estava guardado neste aparelho.
      adotar?.({ theme: dados.theme, accent: dados.accent });
      setError(progresso.error ?? null);
      setLoading(false);
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [user, versao, adotar]);

  const comprar = useCallback(
    async (itemId: string): Promise<{ error?: string }> => {
      const item = itemDaLoja(itemId);
      if (!user || !item) return { error: 'Item desconhecido.' };
      const resultado = await recordPurchase(user.id, item.id, item.price);
      if (resultado.error || !resultado.purchase) return { error: resultado.error };
      setPurchases((atual) => [...atual, resultado.purchase!]);
      return {};
    },
    [user]
  );

  const salvarPerfil = useCallback(
    async (mudancas: Partial<{ displayName: string | null; avatar: string | null; theme: Tema; accent: Acento }>) => {
      if (!user) return { error: 'Sem sessão.' };
      const resultado = await updatePerfil(user.id, mudancas);
      if (resultado.error) return resultado;
      setPerfil((atual) => ({
        ...atual,
        ...(mudancas.displayName !== undefined ? { displayName: mudancas.displayName } : {}),
        ...(mudancas.avatar !== undefined ? { avatar: mudancas.avatar } : {}),
        ...(mudancas.theme !== undefined ? { theme: mudancas.theme } : {}),
        ...(mudancas.accent !== undefined ? { accent: mudancas.accent } : {}),
      }));
      return {};
    },
    [user]
  );

  const valor = useMemo<StudentData>(() => {
    const conceptIds = listConcepts().map((c) => c.id);
    const todosExercicios = listTracks()
      .flatMap((t) => getLessonsOfTrack(t.id))
      .flatMap((l) => getExercises(l))
      .map((e) => e.id);

    const entradaDeJogo = { attempts, completedLessons, completedProjects, reviews, purchases };
    const xp = computeXp(entradaDeJogo);
    const concluidos = desafiosConcluidos({ attempts, reviews, completedLessons });
    const ganhas = moedasGanhas({
      completedLessons,
      completedProjects,
      attempts,
      purchases,
      moedasDeDesafios: concluidos.reduce((s, d) => s + d.recompensa.moedas, 0),
    });
    const gastas = moedasGastas(purchases);
    const sequencia = calcularSequencia(
      attempts,
      purchases.filter((p) => p.item === 'congelar-sequencia')
    );

    return {
      loading,
      error,
      reload,
      completedLessons,
      completedProjects,
      attempts,
      reviews,
      purchases,
      perfil,
      mastery: masteryByConcept(conceptIds, attempts),
      conceptsToReview: conceptsNeedingReview(conceptIds, attempts),
      stats: overallStats(attempts),
      sequencia,
      streak: sequencia.atual,
      daysAway: daysSinceLastStudy(attempts),
      resume: lastActivity(attempts),
      pendingExercises: unsolvedExerciseIds(todosExercicios, attempts),
      abandonedExercises: abandonedExerciseIds(attempts),
      totalExercises: todosExercicios.length,
      dueCards: dueCount(listFlashcards(), reviews),
      cards: countCards(listFlashcards(), reviews),
      xp,
      level: levelFromXp(xp.total),
      achievements: computeAchievements(entradaDeJogo, concluidos),
      desafios: desafiosAtuais({ attempts, reviews, completedLessons }),
      moedas: { ganhas, gastas, saldo: ganhas.total - gastas },
      dobro: dobroAtivo(purchases),
      comprar,
      salvarPerfil,
    };
  }, [loading, error, reload, completedLessons, completedProjects, attempts, reviews, purchases, perfil, comprar, salvarPerfil]);

  return <StudentDataContext.Provider value={valor}>{children}</StudentDataContext.Provider>;
}

export function useStudentData() {
  const contexto = useContext(StudentDataContext);
  if (contexto === undefined) {
    throw new Error('useStudentData deve ser usado dentro de um StudentDataProvider');
  }
  return contexto;
}

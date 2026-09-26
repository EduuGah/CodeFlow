import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { getExercises, getLessonsOfTrack, listConcepts, listFlashcards, listTracks, localizarExercicio } from '../../content';
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
import { dependentesPorConceito, montarCaderno, type EntradaDoCaderno } from '../lib/caderno';

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
  /** Só a primeira carga de cada pessoa: as seguintes revalidam por baixo. */
  loading: boolean;
  /** Falha de leitura, para a interface poder dizer em vez de mostrar zero. */
  error: string | null;
  /**
   * Alguma parte do histórico não chegou (tentativas, revisões ou compras).
   * Os números derivados — saldo, sequência, XP — podem estar menores ou
   * maiores do que são, então a loja não vende enquanto isto for verdade.
   */
  incompleto: boolean;
  reload: () => void;
  /**
   * Relê o histórico sem esqueleto — a tela continua com o que tinha até o
   * novo chegar. Não faz nada antes da primeira carga (ela já está a caminho).
   */
  revalidar: () => void;

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
  /** Todo exercício do catálogo já errado, com o estado da revisão espaçada (`caderno.ts`). */
  caderno: EntradaDoCaderno[];
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
  /** Quantos já foram cumpridos desde o começo, por período. */
  desafiosCumpridos: { dia: number; semana: number };
  moedas: { ganhas: FontesDeMoedas; gastas: number; saldo: number };
  /** O dobro de XP que está valendo agora, se houver. */
  dobro: { ate: Date } | null;

  /** Compra um item da loja. Devolve a mensagem de erro, se houver. */
  comprar: (itemId: string) => Promise<{ error?: string }>;
  salvarPerfil: (mudancas: Partial<{ displayName: string | null; avatar: string | null; theme: Tema; accent: Acento }>) => Promise<{ error?: string }>;
}

const StudentDataContext = createContext<StudentData | undefined>(undefined);

/** O grafo de pré-requisitos não muda com o aluno: conta-se uma vez. */
let dependentes: Map<string, number> | undefined;
const DEPENDENTES = () => (dependentes ??= dependentesPorConceito(listConcepts()));

const PERFIL_VAZIO: Perfil = { displayName: null, avatar: null, theme: null, accent: null };

export function StudentDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const adotar = useTemaOpcional()?.adotar;

  /**
   * De quem são os dados na tela. "Carregando" é derivado daqui, e não uma
   * flag: o provider vive acima das rotas e monta antes de a sessão resolver.
   * Com uma flag, esse intervalo (sem usuário) valia "carregado, e vazio" — e
   * as novidades gravavam o vazio como já visto, para depois anunciar como
   * novo tudo o que a pessoa já tinha.
   */
  const [dadosDe, setDadosDe] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [completedProjects, setCompletedProjects] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [reviews, setReviews] = useState<FlashcardReview[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_VAZIO);
  const [incompleto, setIncompleto] = useState(false);
  const [versao, setVersao] = useState(0);

  const reload = useCallback(() => setVersao((v) => v + 1), []);

  // De quem é o histórico já carregado. Com ele na mão, reler não apaga a
  // tela: o provider vive acima das rotas, e voltar de uma aula para o
  // início só atualiza os números — antes, o `AppShell` remontava o provider
  // e o histórico inteiro era rebaixado com esqueleto por cima de tudo.
  const carregadoPara = useRef<string | null>(null);
  const revalidar = useCallback(() => {
    if (carregadoPara.current !== null) setVersao((v) => v + 1);
  }, []);

  // O id, não o objeto: o supabase-js entrega um `user` novo a cada renovação
  // do token (e ao voltar para a aba). Depender do objeto recarregava tudo —
  // com esqueleto de carregamento por cima da tela — sem nada ter mudado.
  const userId = user?.id;

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!userId) {
        carregadoPara.current = null;
        setDadosDe(null);
        return;
      }

      const [progresso, historico, revisoes, compras, dados] = await Promise.all([
        fetchProgress(userId),
        fetchAttempts(userId),
        fetchFlashcardReviews(userId),
        fetchPurchases(userId),
        fetchPerfil(userId),
      ]);
      if (!ativo) return;

      setCompletedLessons(progresso.completedLessons);
      setCompletedProjects(progresso.completedProjects);
      setAttempts(historico.dados);
      setReviews(revisoes.dados);
      setPurchases(compras.dados);
      setPerfil(dados);
      // O tema da conta vence o que estava guardado neste aparelho.
      adotar?.({ theme: dados.theme, accent: dados.accent });

      const falhas = [progresso.error, historico.erro, revisoes.erro, compras.erro].filter(Boolean);
      setIncompleto(falhas.length > 0);
      setError(
        progresso.error ??
          (falhas.length > 0 ? 'Parte do seu histórico não carregou. Os números podem estar incompletos.' : null)
      );
      carregadoPara.current = userId;
      setDadosDe(userId);
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [userId, versao, adotar]);

  // Uma compra por vez. O botão já fica em "carregando", mas dois toques
  // rápidos chegam antes de o React pintar o botão desabilitado.
  const comprando = useRef(false);

  const comprar = useCallback(
    async (itemId: string): Promise<{ error?: string }> => {
      const item = itemDaLoja(itemId);
      if (!userId || !item) return { error: 'Item desconhecido.' };
      if (incompleto) {
        return { error: 'Seu histórico não carregou inteiro, então o saldo pode estar errado. Recarregue antes de comprar.' };
      }
      if (comprando.current) return { error: 'Uma compra já está em andamento.' };

      comprando.current = true;
      try {
        const resultado = await recordPurchase(userId, item.id, item.price);
        if (resultado.error || !resultado.purchase) return { error: resultado.error };
        setPurchases((atual) => [...atual, resultado.purchase!]);
        return {};
      } finally {
        comprando.current = false;
      }
    },
    [userId, incompleto]
  );

  const salvarPerfil = useCallback(
    async (mudancas: Partial<{ displayName: string | null; avatar: string | null; theme: Tema; accent: Acento }>) => {
      if (!userId) return { error: 'Sem sessão.' };
      const resultado = await updatePerfil(userId, mudancas);
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
    [userId]
  );

  // Só a primeira carga de cada pessoa: reler a mesma pessoa não apaga a tela.
  const loading = userId !== undefined && dadosDe !== userId;

  const valor = useMemo<StudentData>(() => {
    const conceptIds = listConcepts().map((c) => c.id);
    const todosExercicios = listTracks()
      .flatMap((t) => getLessonsOfTrack(t.id))
      .flatMap((l) => getExercises(l))
      .map((e) => e.id);

    const entradaDeJogo = { attempts, completedLessons, completedProjects, reviews, purchases };
    // A derivação mais cara do painel: uma vez, para XP, moedas e conquistas.
    const concluidos = desafiosConcluidos({ attempts, reviews, completedLessons });
    const xp = computeXp(entradaDeJogo, concluidos);
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
      incompleto,
      reload,
      revalidar,
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
      // Exercício que saiu do catálogo não tem como ser mostrado nem refeito.
      caderno: montarCaderno(attempts, DEPENDENTES()).filter((e) => localizarExercicio(e.exerciseId)),
      totalExercises: todosExercicios.length,
      dueCards: dueCount(listFlashcards(), reviews),
      cards: countCards(listFlashcards(), reviews),
      xp,
      level: levelFromXp(xp.total),
      achievements: computeAchievements(entradaDeJogo, concluidos),
      desafios: desafiosAtuais({ attempts, reviews, completedLessons }),
      desafiosCumpridos: {
        dia: concluidos.filter((d) => d.periodo === 'dia').length,
        semana: concluidos.filter((d) => d.periodo === 'semana').length,
      },
      moedas: { ganhas, gastas, saldo: ganhas.total - gastas },
      dobro: dobroAtivo(purchases),
      comprar,
      salvarPerfil,
    };
  }, [loading, error, incompleto, reload, revalidar, completedLessons, completedProjects, attempts, reviews, purchases, perfil, comprar, salvarPerfil]);

  return <StudentDataContext.Provider value={valor}>{children}</StudentDataContext.Provider>;
}

export function useStudentData() {
  const contexto = useContext(StudentDataContext);
  if (contexto === undefined) {
    throw new Error('useStudentData deve ser usado dentro de um StudentDataProvider');
  }
  return contexto;
}

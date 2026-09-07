import type { Attempt } from './mastery';
import type { FlashcardReview } from './review';
import { currentStreak } from './study';

/**
 * XP, níveis e conquistas.
 *
 * O §175 é explícito sobre o risco: gamificação mal desenhada faz o aluno
 * estudar para ganhar ponto, responder rápido e pular conteúdo. As regras aqui
 * foram escolhidas para tornar isso impossível ou inútil:
 *
 * - **Nada é farmável.** XP de exercício conta uma vez por exercício distinto.
 *   Repetir o mesmo cem vezes rende o mesmo que resolver uma.
 * - **Velocidade não vale nada.** Não existe bônus por tempo (§174).
 * - **Persistência vale.** Quem resolve depois de errar várias vezes ganha um
 *   bônus que quem acerta de primeira não ganha — errar e insistir é o
 *   comportamento que a plataforma quer reforçar.
 * - **Autonomia vale.** Resolver sem revelar dica rende mais.
 *
 * Tudo é derivado do histórico que já existe. Não há tabela de pontos: o XP é
 * uma leitura dos fatos, então não pode ficar dessincronizado deles.
 */

export const XP = {
  /** Por exercício distinto resolvido. */
  exercicioResolvido: 20,
  /** Adicional por ter resolvido sem revelar nenhuma dica. */
  bonusSemDica: 10,
  /** Adicional por ter resolvido depois de pelo menos uma falha. */
  bonusPersistencia: 5,
  porAulaConcluida: 50,
  porProjetoEntregue: 150,
  /** Por cartão distinto revisado ao menos uma vez. */
  porCartaoRevisado: 5,
} as const;

export interface XpBreakdown {
  exercicios: number;
  aulas: number;
  projetos: number;
  revisao: number;
  total: number;
}

export interface GamificationInput {
  attempts: Attempt[];
  completedLessons: string[];
  completedProjects: string[];
  reviews: FlashcardReview[];
  hoje?: Date;
}

export function computeXp({
  attempts,
  completedLessons,
  completedProjects,
  reviews,
}: GamificationInput): XpBreakdown {
  // Agrupa por exercício para pontuar cada um uma única vez.
  const porExercicio = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const lista = porExercicio.get(a.exerciseId) ?? [];
    lista.push(a);
    porExercicio.set(a.exerciseId, lista);
  }

  let exercicios = 0;
  for (const tentativas of porExercicio.values()) {
    const acertos = tentativas.filter((t) => t.correct);
    if (acertos.length === 0) continue;

    exercicios += XP.exercicioResolvido;
    if (acertos.some((t) => t.hintsUsed === 0)) exercicios += XP.bonusSemDica;
    if (tentativas.some((t) => !t.correct)) exercicios += XP.bonusPersistencia;
  }

  const aulas = completedLessons.length * XP.porAulaConcluida;
  const projetos = completedProjects.length * XP.porProjetoEntregue;
  const revisao = new Set(reviews.map((r) => r.flashcardId)).size * XP.porCartaoRevisado;

  return { exercicios, aulas, projetos, revisao, total: exercicios + aulas + projetos + revisao };
}

/**
 * Níveis do §6.
 *
 * Os limiares crescem, mas sem a escalada agressiva de jogos: o objetivo é
 * marcar progresso, não criar uma esteira que exija moer conteúdo.
 */
export const NIVEIS = [
  { level: 1, title: 'Explorador', minXp: 0 },
  { level: 2, title: 'Iniciante', minXp: 150 },
  { level: 3, title: 'Praticante', minXp: 400 },
  { level: 4, title: 'Desenvolvedor', minXp: 900 },
  { level: 5, title: 'Desenvolvedor intermediário', minXp: 1800 },
  { level: 6, title: 'Desenvolvedor avançado', minXp: 3200 },
] as const;

export interface LevelInfo {
  level: number;
  title: string;
  xp: number;
  /** XP acumulado dentro do nível atual. */
  xpIntoLevel: number;
  /** XP necessário para fechar o nível. `null` no último. */
  xpForNextLevel: number | null;
  nextTitle: string | null;
}

export function levelFromXp(xp: number): LevelInfo {
  let indice = 0;
  for (let i = 0; i < NIVEIS.length; i++) {
    if (xp >= NIVEIS[i].minXp) indice = i;
  }

  const atual = NIVEIS[indice];
  const proximo = NIVEIS[indice + 1] ?? null;

  return {
    level: atual.level,
    title: atual.title,
    xp,
    xpIntoLevel: xp - atual.minXp,
    xpForNextLevel: proximo ? proximo.minXp - atual.minXp : null,
    nextTitle: proximo ? proximo.title : null,
  };
}

export interface Achievement {
  id: string;
  title: string;
  /** O que o aluno fez para merecer — ou o que falta fazer. */
  description: string;
  unlocked: boolean;
}

/**
 * Conquistas pedagógicas (§173).
 *
 * Marcam habilidades e hábitos, não volume: "resolveu sem dica" e "voltou depois
 * de errar" dizem algo sobre o aluno. "Fez 100 exercícios" só diz que ele
 * clicou bastante.
 */
export function computeAchievements(input: GamificationInput): Achievement[] {
  const { attempts, completedLessons, completedProjects, reviews } = input;

  const acertos = attempts.filter((a) => a.correct);
  const exerciciosResolvidos = new Set(acertos.map((a) => a.exerciseId));

  // Persistência: resolveu um exercício em que já havia falhado.
  const falhouAntes = new Set(attempts.filter((a) => !a.correct).map((a) => a.exerciseId));
  const insistiu = [...exerciciosResolvidos].some((id) => falhouAntes.has(id));

  const conceitosPraticados = new Set(attempts.flatMap((a) => a.concepts));
  const cartoesRevisados = new Set(reviews.map((r) => r.flashcardId));
  const streak = currentStreak(attempts, input.hoje);

  return [
    {
      id: 'primeiro-codigo',
      title: 'Primeiro código executado',
      description: 'Você rodou código na plataforma pela primeira vez.',
      unlocked: attempts.length > 0,
    },
    {
      id: 'primeiro-acerto',
      title: 'Primeiro exercício resolvido',
      description: 'Um exercício passou em todos os testes.',
      unlocked: exerciciosResolvidos.size > 0,
    },
    {
      id: 'sem-ajuda',
      title: 'Resolveu sozinho',
      description: 'Você resolveu um exercício sem abrir nenhuma dica.',
      unlocked: acertos.some((a) => a.hintsUsed === 0),
    },
    {
      id: 'persistente',
      title: 'Não desistiu',
      description: 'Você errou, voltou e resolveu — o hábito que mais importa aqui.',
      unlocked: insistiu,
    },
    {
      id: 'primeira-aula',
      title: 'Primeira aula concluída',
      description: 'Você fechou uma aula inteira.',
      unlocked: completedLessons.length > 0,
    },
    {
      id: 'primeiro-projeto',
      title: 'Primeiro projeto entregue',
      description: 'Você atendeu todos os critérios de aceitação de um projeto.',
      unlocked: completedProjects.length > 0,
    },
    {
      id: 'revisor',
      title: 'Voltou para revisar',
      description: 'Você revisou pelo menos cinco cartões — revisão é onde o conteúdo fixa.',
      unlocked: cartoesRevisados.size >= 5,
    },
    {
      id: 'constante',
      title: 'Três dias seguidos',
      description: 'Você estudou em três dias consecutivos.',
      unlocked: streak >= 3,
    },
    {
      id: 'abrangente',
      title: 'Cinco conceitos praticados',
      description: 'Você exercitou cinco conceitos diferentes.',
      unlocked: conceitosPraticados.size >= 5,
    },
  ];
}

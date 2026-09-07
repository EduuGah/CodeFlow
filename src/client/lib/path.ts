import type { Concept, Lesson } from '../../content/types';
import type { Attempt, ConceptMastery } from './mastery';

/**
 * Caminho de aprendizado: a trilha como uma sequência visual de etapas.
 *
 * Decisão que vale registrar: **não há bloqueio**. Um caminho no estilo do
 * Duolingo normalmente tranca as etapas seguintes, mas o §280 pede o contrário —
 * o aluno pode pular, revisar ou ignorar a recomendação. Quem já sabe condições
 * não deveria ser obrigado a refazer variáveis para chegar em loops.
 *
 * No lugar da trava, um aviso: quando os pré-requisitos de uma aula ainda estão
 * fracos, dizemos quais e por quê, e deixamos a escolha com o aluno (§281 —
 * recomendação sem explicação vira misticismo).
 */

export type PathNodeState =
  /** Já concluída pelo aluno. */
  | 'concluida'
  /** Primeira não concluída — o passo sugerido agora. */
  | 'atual'
  /** Disponível, mas ainda não alcançada na ordem sugerida. */
  | 'proxima';

export interface PathNode {
  lesson: Lesson;
  state: PathNodeState;
  /** Posição na trilha, começando em 1. */
  position: number;
  /**
   * Conceitos pré-requisito que o aluno ainda não praticou.
   * Aviso, nunca impedimento.
   */
  shakyPrerequisites: Concept[];
  /**
   * Quando a aula foi concluída, em ISO 8601.
   *
   * Derivado do último acerto registrado nela: a lista de aulas concluídas
   * guarda só ids, sem data. É uma aproximação honesta — a data em que o aluno
   * de fato resolveu o exercício da aula.
   */
  completedAt?: string;
}

/** Níveis que ainda não sustentam o próximo conceito. */
const NIVEIS_FRACOS: ReadonlyArray<ConceptMastery['level']> = ['nao-iniciado', 'conhecendo'];

/**
 * Pré-requisitos frágeis de uma aula.
 *
 * Só considera conceitos que alguma aula realmente ensina: avisar sobre algo que
 * a plataforma nunca cobriu deixaria o aluno sem ação possível. E ignora os
 * conceitos que a própria aula introduz — não são pré-requisito dela mesma.
 */
function prerequisitosFracos(
  lesson: Lesson,
  concepts: Concept[],
  mastery: Map<string, ConceptMastery>,
  ensinados: Set<string>
): Concept[] {
  const porId = new Map(concepts.map((c) => [c.id, c]));
  const daPropriaAula = new Set(lesson.concepts);

  const ids = new Set<string>();
  for (const conceptId of lesson.concepts) {
    for (const prereq of porId.get(conceptId)?.prerequisites ?? []) {
      if (daPropriaAula.has(prereq)) continue;
      if (!ensinados.has(prereq)) continue;

      const nivel = mastery.get(prereq)?.level ?? 'nao-iniciado';
      if (NIVEIS_FRACOS.includes(nivel)) ids.add(prereq);
    }
  }

  return [...ids].map((id) => porId.get(id)).filter((c): c is Concept => c !== undefined);
}

/**
 * Monta o caminho de uma trilha.
 *
 * `lessons` deve vir na ordem pedagógica da trilha — é ela que define a
 * sequência e, portanto, qual é a etapa atual.
 */
export function buildPath(
  lessons: Lesson[],
  completedLessonIds: string[],
  concepts: Concept[],
  mastery: ConceptMastery[],
  attempts: Attempt[] = []
): PathNode[] {
  // Data de conclusão por aula: o acerto mais recente registrado nela.
  const concluidaEm = new Map<string, string>();
  for (const a of attempts) {
    if (!a.correct) continue;
    const atual = concluidaEm.get(a.lessonId);
    if (atual === undefined || a.createdAt > atual) concluidaEm.set(a.lessonId, a.createdAt);
  }

  const concluidas = new Set(completedLessonIds);
  const porConceito = new Map(mastery.map((m) => [m.conceptId, m]));
  const ensinados = new Set(lessons.flatMap((l) => l.concepts));

  let jaMarcouAtual = false;

  return lessons.map((lesson, indice) => {
    const concluida = concluidas.has(lesson.id);

    let state: PathNodeState;
    if (concluida) {
      state = 'concluida';
    } else if (!jaMarcouAtual) {
      state = 'atual';
      jaMarcouAtual = true;
    } else {
      state = 'proxima';
    }

    return {
      lesson,
      state,
      position: indice + 1,
      // Não faz sentido avisar sobre pré-requisito de algo que o aluno já fez.
      shakyPrerequisites: concluida
        ? []
        : prerequisitosFracos(lesson, concepts, porConceito, ensinados),
      completedAt: concluida ? concluidaEm.get(lesson.id) : undefined,
    };
  });
}

export interface PathSummary {
  total: number;
  completed: number;
  percentage: number;
  /** A etapa sugerida agora, se a trilha não acabou. */
  current: PathNode | undefined;
}

export function summarizePath(nodes: PathNode[]): PathSummary {
  const completed = nodes.filter((n) => n.state === 'concluida').length;

  return {
    total: nodes.length,
    completed,
    percentage: nodes.length === 0 ? 0 : Math.round((completed / nodes.length) * 100),
    current: nodes.find((n) => n.state === 'atual'),
  };
}

import type { Concept, Lesson, Track } from '../../content/types';
import type { EtapaDoPercurso } from '../../content/percurso';
import type { Attempt, ConceptMastery } from './mastery';
import { buildPath, summarizePath, type PathNode, type PathSummary } from './path';

/**
 * O percurso do aluno: as trilhas em etapas, cada uma com o caminho e o
 * resumo dela, e a resposta para "em qual trilha eu estou".
 *
 * Puro, como `path.ts`: recebe o catálogo e o histórico, devolve dados. A
 * tela inicial e a de trilhas leem daqui, para as duas contarem a mesma
 * história — antes, a inicial só conhecia a trilha padrão, e quem terminava
 * JavaScript e começava TypeScript continuava vendo "Fundamentos de
 * JavaScript, 20 de 20".
 */

export type EstadoDaTrilha = 'concluida' | 'em-andamento' | 'nao-iniciada';

export interface TrilhaNoPercurso {
  track: Track;
  /** Posição no percurso inteiro, começando em 1. */
  posicao: number;
  caminho: PathNode[];
  resumo: PathSummary;
  estado: EstadoDaTrilha;
  /** Soma dos minutos estimados das aulas. */
  minutos: number;
}

export interface EtapaMontada {
  etapa: EtapaDoPercurso;
  /** 1, 2, 3… */
  numero: number;
  trilhas: TrilhaNoPercurso[];
}

export function montarPercurso(
  etapas: EtapaDoPercurso[],
  trackPorId: (id: string) => Track | undefined,
  aulasDaTrilha: (trackId: string) => Lesson[],
  completedLessonIds: string[],
  concepts: Concept[],
  mastery: ConceptMastery[],
  attempts: Attempt[] = []
): EtapaMontada[] {
  let posicao = 0;

  return etapas.map((etapa, i) => ({
    etapa,
    numero: i + 1,
    trilhas: etapa.trackIds
      .map((id) => trackPorId(id))
      .filter((t): t is Track => t !== undefined)
      .map((track) => {
        const aulas = aulasDaTrilha(track.id);
        const caminho = buildPath(aulas, completedLessonIds, concepts, mastery, attempts);
        const resumo = summarizePath(caminho);
        posicao += 1;

        const estado: EstadoDaTrilha =
          resumo.total > 0 && resumo.completed === resumo.total
            ? 'concluida'
            : resumo.completed > 0
              ? 'em-andamento'
              : 'nao-iniciada';

        return {
          track,
          posicao,
          caminho,
          resumo,
          estado,
          minutos: aulas.reduce((soma, l) => soma + l.estimatedMinutes, 0),
        };
      }),
  }));
}

/**
 * A trilha em que a pessoa está.
 *
 * Primeiro a da última atividade (quem parou no meio de um exercício quer
 * voltar para lá), desde que ela não esteja concluída; depois a primeira
 * que já começou e não terminou; depois a primeira que ainda não começou —
 * que, para quem nunca fez nada, é a primeira do percurso. Sem nenhuma, o
 * percurso inteiro está feito.
 */
export function trilhaDaVez(
  percurso: EtapaMontada[],
  ultimaAulaId?: string | null
): TrilhaNoPercurso | undefined {
  const todas = percurso.flatMap((e) => e.trilhas);

  if (ultimaAulaId) {
    const daUltima = todas.find(
      (t) => t.estado !== 'concluida' && t.track.lessonIds.includes(ultimaAulaId)
    );
    if (daUltima) return daUltima;
  }

  return (
    todas.find((t) => t.estado === 'em-andamento') ??
    todas.find((t) => t.estado === 'nao-iniciada')
  );
}

/** "20 min", "1 h 30 min", "~7 h": a duração como a pessoa a estima. */
export function formatarDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas >= 3) return `~${Math.round(minutos / 60)} h`;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

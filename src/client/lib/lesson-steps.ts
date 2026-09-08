import type { Exercise, Lesson, LessonBlock } from '../../content/types';

/**
 * Divide uma aula em passos.
 *
 * A aula era uma página só, com todo o conteúdo de uma vez. Isso tem dois
 * problemas: no celular vira uma rolagem longa sem referência de onde se está,
 * e cognitivamente entrega tudo junto quando o material foi escrito para ser
 * consumido em sequência.
 *
 * As regras de agrupamento:
 *
 * - Blocos de leitura **consecutivos** (texto e exemplo) viram um passo só. Um
 *   passo contendo apenas três linhas de código seria uma parede a mais para
 *   atravessar, não uma etapa de aprendizado.
 * - Cada exercício é um passo próprio, porque exige ação e tem ritmo próprio.
 * - O resumo fecha a aula em passo separado: é a consolidação, e misturá-lo com
 *   o último exercício apagaria essa função.
 */

export type LessonStep =
  | { kind: 'reading'; id: string; blocks: LessonBlock[] }
  | { kind: 'exercise'; id: string; exercise: Exercise }
  | { kind: 'summary'; id: string; markdown: string };

export function buildLessonSteps(lesson: Lesson): LessonStep[] {
  const passos: LessonStep[] = [];
  let leituraAberta: LessonBlock[] = [];

  const fecharLeitura = () => {
    if (leituraAberta.length === 0) return;
    passos.push({ kind: 'reading', id: `leitura-${passos.length}`, blocks: leituraAberta });
    leituraAberta = [];
  };

  for (const bloco of lesson.blocks) {
    switch (bloco.kind) {
      case 'prose':
      case 'example':
        leituraAberta.push(bloco);
        break;

      case 'exercise':
        fecharLeitura();
        passos.push({ kind: 'exercise', id: bloco.exercise.id, exercise: bloco.exercise });
        break;

      case 'summary':
        fecharLeitura();
        passos.push({ kind: 'summary', id: `resumo-${passos.length}`, markdown: bloco.markdown });
        break;
    }
  }

  fecharLeitura();
  return passos;
}

/**
 * Passos que exigem ação do aluno.
 *
 * Usado para medir o avanço real: uma aula de dez passos em que oito são
 * leitura não é oito décimos de aprendizado. O progresso mostrado conta os
 * passos, mas a conclusão da aula depende dos exercícios.
 */
export function countInteractiveSteps(steps: LessonStep[]): number {
  return steps.filter((s) => s.kind === 'exercise').length;
}

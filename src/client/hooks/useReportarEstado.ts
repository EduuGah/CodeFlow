import { useEffect, useRef } from 'react';

import type { ExerciseState, OnExerciseState } from '../lib/exercise-state';

/**
 * Avisa a aula quando o estado do exercício muda.
 *
 * O estado é derivado, não guardado: cada componente já sabe se o aluno mexeu,
 * se está verificando e se passou. Duplicar isso num `useState` criaria uma
 * segunda fonte de verdade capaz de discordar da primeira — que é exatamente o
 * tipo de bug que este contrato veio resolver.
 *
 * O aviso sai por `useEffect` com dependência só no estado, e a função vive num
 * `ref`. Sem o `ref`, quem chama precisaria memorizar a função: um `onEstado`
 * novo a cada render dispararia o efeito a cada render.
 */
export function useReportarEstado(estado: ExerciseState, onEstado?: OnExerciseState) {
  const ultimo = useRef(onEstado);
  ultimo.current = onEstado;

  useEffect(() => {
    ultimo.current?.(estado);
  }, [estado]);
}

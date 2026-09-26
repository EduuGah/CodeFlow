import type { Exercise, LanguageId } from '../../../content/types';
import type { OnExerciseState } from '../../lib/exercise-state';
import { CodeExerciseStep } from './CodeExerciseStep';
import { FillBlank } from './FillBlank';
import { FindBug } from './FindBug';
import { MultipleChoice } from './MultipleChoice';
import { OrderSteps } from './OrderSteps';
import { PredictOutput } from './PredictOutput';
import { Refactor } from './Refactor';
import { ServerExerciseStep } from './ServerExerciseStep';
import { SqlExerciseStep } from './SqlExerciseStep';
import { WriteTest } from './WriteTest';

/**
 * O componente de cada tipo de exercício, escolhido por um `switch`
 * exaustivo.
 *
 * A aula repetia dez blocos `tipo === 'x' && <X key … />` com as mesmas
 * props. Aqui o compilador recusa um tipo novo sem componente (o `never` do
 * fim), e quem chama põe a `key={exercise.id}` uma vez só — sem ela, dois
 * exercícios seguidos do mesmo tipo reaproveitam a instância, e o segundo
 * nasce com a resposta do primeiro (`Lesson.passos-seguidos.test.tsx`).
 */
export function ExercicioDoPasso({
  exercise,
  lessonId,
  language,
  onEstado,
}: {
  exercise: Exercise;
  lessonId: string;
  language: LanguageId;
  onEstado: OnExerciseState;
}) {
  const comuns = { lessonId, onEstado };

  switch (exercise.type) {
    case 'code':
      return <CodeExerciseStep exercise={exercise} language={language} {...comuns} />;
    case 'fill-blank':
      return <FillBlank exercise={exercise} language={language} {...comuns} />;
    case 'multiple-choice':
      return <MultipleChoice exercise={exercise} {...comuns} />;
    case 'order-steps':
      return <OrderSteps exercise={exercise} {...comuns} />;
    case 'sql':
      return <SqlExerciseStep exercise={exercise} {...comuns} />;
    case 'server':
      return <ServerExerciseStep exercise={exercise} {...comuns} />;
    case 'refactor':
      return <Refactor exercise={exercise} language={language} {...comuns} />;
    case 'find-bug':
      return <FindBug exercise={exercise} {...comuns} />;
    case 'write-test':
      return <WriteTest exercise={exercise} language={language} {...comuns} />;
    case 'predict-output':
      return <PredictOutput exercise={exercise} language={language} {...comuns} />;
    default: {
      const tipo: never = exercise;
      throw new Error(`Tipo de exercício sem componente: ${(tipo as { type: string }).type}`);
    }
  }
}

import { useState } from 'react';
import { IconCheckCircle, IconCloseCircle } from '../ui/Icon';
import type { MultipleChoiceExercise } from '../../../content/types';
import { Button } from '../ui/Button';
import { MarkdownReader } from '../ui/MarkdownReader';
import { HintPanel } from './HintPanel';
import { useRecordAttempt } from '../../hooks/useRecordAttempt';

/**
 * Exercício de múltipla escolha.
 *
 * Errar não encerra o exercício: a explicação aparece nos dois casos, e quem
 * errou pode tentar de novo. O objetivo é entender o porquê, não pontuar.
 */
export function MultipleChoice({
  exercise,
  lessonId,
}: {
  exercise: MultipleChoiceExercise;
  lessonId: string;
}) {
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [enviada, setEnviada] = useState(false);
  const [dicasAbertas, setDicasAbertas] = useState(0);
  // Evita inflar o histórico quando o aluno clica em "verificar" de novo sem
  // ter mudado nada: isso não é uma tentativa nova.
  const [ultimaRegistrada, setUltimaRegistrada] = useState<number | null>(null);

  const registrar = useRecordAttempt();
  const acertou = selecionada === exercise.correctIndex;

  const verificar = () => {
    setEnviada(true);

    if (selecionada === null || selecionada === ultimaRegistrada) return;

    setUltimaRegistrada(selecionada);
    registrar({
      exerciseId: exercise.id,
      lessonId,
      concepts: exercise.concepts,
      correct: selecionada === exercise.correctIndex,
      hintsUsed: dicasAbertas,
    });
  };

  return (
    <section className="rounded-lg border border-line bg-surface p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">
        Exercício
      </h3>

      <div className="mb-4">
        <MarkdownReader content={exercise.prompt} />
      </div>

      <fieldset className="space-y-2" disabled={enviada && acertou}>
        <legend className="sr-only">Escolha uma alternativa</legend>

        {exercise.options.map((opcao, i) => {
          const escolhida = selecionada === i;
          const revelarCerta = enviada && i === exercise.correctIndex;
          const revelarErrada = enviada && escolhida && !acertou;

          // Estado por texto e ícone, não apenas por cor (acessibilidade).
          let estilo = 'border-line hover:border-line-strong hover:bg-canvas';
          if (revelarCerta) estilo = 'border-success-200 bg-success-50';
          else if (revelarErrada) estilo = 'border-danger-200 bg-danger-50';
          else if (escolhida) estilo = 'border-ink bg-canvas';

          return (
            <label
              key={i}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${estilo}`}
            >
              <input
                type="radio"
                name={exercise.id}
                className="mt-0.5 accent-zinc-900"
                checked={escolhida}
                onChange={() => {
                  setSelecionada(i);
                  setEnviada(false);
                }}
              />
              <span className="flex-1 text-ink">{opcao}</span>
              {revelarCerta && <IconCheckCircle size={16} className="mt-0.5 text-success-600" />}
              {revelarErrada && <IconCloseCircle size={16} className="mt-0.5 text-danger-500" />}
            </label>
          );
        })}
      </fieldset>

      {!(enviada && acertou) && (
        <Button
          size="sm"
          className="mt-4 w-full"
          disabled={selecionada === null}
          onClick={verificar}
        >
          {enviada ? 'Verificar de novo' : 'Verificar resposta'}
        </Button>
      )}

      {enviada && (
        <div
          role="status"
          className={`mt-4 rounded-lg border p-3 ${
            acertou ? 'border-success-200 bg-success-50' : 'border-energy-200 bg-energy-50'
          }`}
        >
          <p
            className={`mb-1 flex items-center gap-1.5 text-sm font-semibold ${
              acertou ? 'text-success-700' : 'text-energy-700'
            }`}
          >
            {acertou ? <IconCheckCircle size={15} /> : <IconCloseCircle size={15} />}
            {acertou ? 'Correto' : 'Ainda não é essa — veja o porquê'}
          </p>
          <MarkdownReader
            content={exercise.explanation}
            className="prose-p:my-0 prose-p:text-sm prose-p:leading-relaxed"
          />
        </div>
      )}

      {!acertou && (
        <HintPanel hints={exercise.hints} className="mt-3" onRevealedChange={setDicasAbertas} />
      )}
    </section>
  );
}

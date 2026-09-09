import { useRef, useState } from 'react';
import { IconCheckCircle, IconCloseCircle } from '../ui/Icon';
import type { MultipleChoiceExercise } from '../../../content/types';
import type { ExerciseState, OnExerciseState } from '../../lib/exercise-state';
import { MarkdownReader } from '../ui/MarkdownReader';
import { ExerciseAction, ExerciseFeedback } from './ExerciseAction';
import { HintPanel } from './HintPanel';
import { useRecordAttempt } from '../../hooks/useRecordAttempt';
import { useFocusRescue } from '../../hooks/useFocusRescue';
import { useReportarEstado } from '../../hooks/useReportarEstado';

/**
 * Exercício de múltipla escolha.
 *
 * Errar não encerra o exercício: a explicação aparece nos dois casos, e quem
 * errou pode tentar de novo. O objetivo é entender o porquê, não pontuar.
 */
export function MultipleChoice({
  exercise,
  lessonId,
  onEstado,
}: {
  exercise: MultipleChoiceExercise;
  lessonId: string;
  /** Avisa a aula em que ponto o exercício está. Sem isto o rodapé da aula
      continuaria oferecendo "pular" a quem acabou de acertar. */
  onEstado?: OnExerciseState;
}) {
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [enviada, setEnviada] = useState(false);
  const [dicasAbertas, setDicasAbertas] = useState(0);
  // Evita inflar o histórico quando o aluno clica em "verificar" de novo sem
  // ter mudado nada: isso não é uma tentativa nova.
  const [ultimaRegistrada, setUltimaRegistrada] = useState<number | null>(null);

  const registrar = useRecordAttempt();
  const acertou = selecionada === exercise.correctIndex;

  const estado: ExerciseState = enviada
    ? acertou
      ? 'acertou'
      : 'errou'
    : selecionada === null
      ? 'inicial'
      : 'respondendo';

  useReportarEstado(estado, onEstado);

  // Acertar remove o botão de verificar; o retorno assume o lugar dele na ordem
  // de tabulação para o foco não cair no corpo do documento.
  const retornoRef = useRef<HTMLDivElement>(null);
  useFocusRescue(retornoRef, enviada && acertou);

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
    <section className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <h2 className="label-mono mb-3 text-brand-600">Escolha a alternativa</h2>

      <div className="mb-4">
        <MarkdownReader content={exercise.prompt} />
      </div>

      {/* `min-w-0` no fieldset não é enfeite: o elemento tem
          `min-inline-size: min-content` embutido no navegador e se recusa a
          encolher abaixo da maior palavra que contém. Como as alternativas são
          código, um identificador longo empurrava o fieldset para além da
          largura da tela do celular e a alternativa aparecia cortada. */}
      <fieldset className="min-w-0 space-y-2" disabled={enviada && acertou}>
        <legend className="sr-only">Escolha uma alternativa</legend>

        {exercise.options.map((opcao, i) => {
          const escolhida = selecionada === i;
          const revelarCerta = enviada && i === exercise.correctIndex;
          const revelarErrada = enviada && escolhida && !acertou;

          // Estado por texto e ícone, não apenas por cor (acessibilidade).
          let estilo = 'border-line hover:border-line-strong hover:bg-canvas';
          if (revelarCerta) estilo = 'border-success-200 bg-success-50';
          else if (revelarErrada) estilo = 'border-energy-200 bg-energy-50';
          else if (escolhida) estilo = 'border-ink bg-canvas';

          return (
            <label
              key={i}
              // `min-h-11` mantém o alvo de toque acima do mínimo mesmo quando a
              // alternativa cabe em uma linha curta.
              className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${estilo}`}
            >
              <input
                type="radio"
                name={exercise.id}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600"
                checked={escolhida}
                onChange={() => {
                  setSelecionada(i);
                  setEnviada(false);
                }}
              />
              {/* `min-w-0` e `break-words` porque as alternativas costumam ser
                  trechos de código: um identificador longo é uma palavra só, e
                  sem isto ele estourava a caixa e ficava cortado na tela do
                  celular — a alternativa virava ilegível justamente quando o
                  ponto do exercício era o comprimento do nome. */}
              <span className="min-w-0 flex-1 break-words text-ink">{opcao}</span>
              {revelarCerta && <IconCheckCircle size={16} className="mt-0.5 text-success-600" />}
              {revelarErrada && <IconCloseCircle size={16} className="mt-0.5 text-danger-500" />}
            </label>
          );
        })}
      </fieldset>

      {!(enviada && acertou) && (
        <ExerciseAction className="mt-4" disabled={selecionada === null} onClick={verificar}>
          {enviada ? 'Verificar de novo' : 'Verificar resposta'}
        </ExerciseAction>
      )}

      {enviada && (
        <div className="mt-4">
          <ExerciseFeedback
            estado={acertou ? 'acertou' : 'errou'}
            titulo={acertou ? 'Resposta correta' : 'Ainda não é essa — veja o porquê'}
            refDoBloco={retornoRef}
          >
            <MarkdownReader
              content={exercise.explanation}
              className="prose-p:my-0 prose-p:text-sm prose-p:leading-relaxed"
            />
          </ExerciseFeedback>
        </div>
      )}

      {!acertou && (
        <HintPanel hints={exercise.hints} className="mt-3" onRevealedChange={setDicasAbertas} />
      )}
    </section>
  );
}

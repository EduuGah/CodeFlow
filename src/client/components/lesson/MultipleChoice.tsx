import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { MultipleChoiceExercise } from '../../../content/types';
import { Button } from '../ui/Button';
import { MarkdownReader } from '../ui/MarkdownReader';
import { HintPanel } from './HintPanel';

/**
 * Exercício de múltipla escolha.
 *
 * Errar não encerra o exercício: a explicação aparece nos dois casos, e quem
 * errou pode tentar de novo. O objetivo é entender o porquê, não pontuar.
 */
export function MultipleChoice({ exercise }: { exercise: MultipleChoiceExercise }) {
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [enviada, setEnviada] = useState(false);

  const acertou = selecionada === exercise.correctIndex;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
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
          let estilo = 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50';
          if (revelarCerta) estilo = 'border-emerald-300 bg-emerald-50';
          else if (revelarErrada) estilo = 'border-red-300 bg-red-50';
          else if (escolhida) estilo = 'border-zinc-900 bg-zinc-50';

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
              <span className="flex-1 text-zinc-800">{opcao}</span>
              {revelarCerta && <CheckCircle2 size={16} className="mt-0.5 text-emerald-600" />}
              {revelarErrada && <XCircle size={16} className="mt-0.5 text-red-500" />}
            </label>
          );
        })}
      </fieldset>

      {!(enviada && acertou) && (
        <Button
          size="sm"
          className="mt-4 w-full"
          disabled={selecionada === null}
          onClick={() => setEnviada(true)}
        >
          {enviada ? 'Verificar de novo' : 'Verificar resposta'}
        </Button>
      )}

      {enviada && (
        <div
          role="status"
          className={`mt-4 rounded-lg border p-3 ${
            acertou ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
          }`}
        >
          <p
            className={`mb-1 flex items-center gap-1.5 text-sm font-semibold ${
              acertou ? 'text-emerald-800' : 'text-amber-900'
            }`}
          >
            {acertou ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
            {acertou ? 'Correto' : 'Ainda não é essa — veja o porquê'}
          </p>
          <MarkdownReader
            content={exercise.explanation}
            className="prose-p:my-0 prose-p:text-sm prose-p:leading-relaxed"
          />
        </div>
      )}

      {!acertou && <HintPanel hints={exercise.hints} className="mt-3" />}
    </section>
  );
}

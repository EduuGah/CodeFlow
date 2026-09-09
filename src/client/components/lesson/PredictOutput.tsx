import { useRef, useState } from 'react';
import type { PredictOutputExercise } from '../../../content/types';
import type { ExerciseState, OnExerciseState } from '../../lib/exercise-state';
import { executeCode } from '../../lib/sandbox';
import { MarkdownReader } from '../ui/MarkdownReader';
import { ExerciseAction, ExerciseFeedback } from './ExerciseAction';
import { HintPanel } from './HintPanel';
import { useRecordAttempt } from '../../hooks/useRecordAttempt';
import { useFocusRescue } from '../../hooks/useFocusRescue';
import { useReportarEstado } from '../../hooks/useReportarEstado';

/**
 * Exercício de previsão de saída (§94).
 *
 * O aluno escreve o que acha que vai acontecer ANTES de executar. Depois o
 * código roda de verdade no sandbox e as duas saídas aparecem lado a lado.
 *
 * Quando a previsão bate, a compreensão está correta. Quando não bate, o aluno
 * encontrou o ponto exato em que o modelo mental dele está errado — que é a
 * informação mais útil que um exercício pode dar.
 */

/** Compara ignorando espaços nas pontas e linhas em branco no fim. */
function normalizar(texto: string): string {
  return texto
    .split('\n')
    .map((linha) => linha.trim())
    .join('\n')
    .trim();
}

export function PredictOutput({
  exercise,
  lessonId,
  onEstado,
}: {
  exercise: PredictOutputExercise;
  lessonId: string;
  /** Avisa a aula em que ponto o exercício está. Sem isto o rodapé da aula
      continuaria oferecendo "pular" a quem acabou de acertar. */
  onEstado?: OnExerciseState;
}) {
  const [previsao, setPrevisao] = useState('');
  const [saidaReal, setSaidaReal] = useState<string | null>(null);
  const [executando, setExecutando] = useState(false);
  const [dicasAbertas, setDicasAbertas] = useState(0);
  const [ultimaRegistrada, setUltimaRegistrada] = useState<string | null>(null);

  const registrar = useRecordAttempt();
  const acertou = saidaReal !== null && normalizar(previsao) === normalizar(saidaReal);

  const estado: ExerciseState = executando
    ? 'verificando'
    : saidaReal === null
      ? previsao.trim() === ''
        ? 'inicial'
        : 'respondendo'
      : acertou
        ? 'acertou'
        : 'errou';

  useReportarEstado(estado, onEstado);

  const retornoRef = useRef<HTMLDivElement>(null);
  useFocusRescue(retornoRef, saidaReal !== null);

  const verificar = async () => {
    setExecutando(true);
    const resultado = await executeCode(exercise.code);
    const real = resultado.error ? `Erro: ${resultado.error}` : resultado.output;
    setSaidaReal(real);
    setExecutando(false);

    // Reenviar a mesma previsão não é uma tentativa nova.
    if (normalizar(previsao) === ultimaRegistrada) return;

    setUltimaRegistrada(normalizar(previsao));
    registrar({
      exerciseId: exercise.id,
      lessonId,
      concepts: exercise.concepts,
      correct: normalizar(previsao) === normalizar(real),
      hintsUsed: dicasAbertas,
    });
  };

  return (
    <section className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <h2 className="label-mono mb-3 text-brand-600">Preveja antes de executar</h2>

      <div className="mb-3">
        <MarkdownReader content={exercise.prompt} />
      </div>

      <pre className="mb-4 overflow-x-auto rounded-lg bg-editor p-4 text-sm leading-relaxed">
        <code className="font-mono text-white/90">{exercise.code}</code>
      </pre>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink-soft">
          O que você acha que será impresso?
        </span>
        <textarea
          value={previsao}
          onChange={(e) => {
            setPrevisao(e.target.value);
            // Mexer na previsão invalida a comparação anterior: manter "correto"
            // na tela enquanto o texto já é outro seria mentira.
            setSaidaReal(null);
          }}
          rows={3}
          spellCheck={false}
          placeholder="Uma linha para cada saída"
          className="w-full rounded-lg border border-control bg-canvas p-3 font-mono text-sm text-ink outline-none transition-colors focus:border-brand-500 focus:bg-surface"
        />
      </label>

      <ExerciseAction
        className="mt-3"
        disabled={previsao.trim() === '' || executando}
        carregando={executando}
        onClick={verificar}
      >
        {executando
          ? 'Executando…'
          : saidaReal === null
            ? 'Executar e comparar'
            : 'Comparar de novo'}
      </ExerciseAction>

      {saidaReal !== null && (
        <div className="mt-4 space-y-3">
          <ExerciseFeedback
            estado={acertou ? 'acertou' : 'errou'}
            titulo={acertou ? 'Previsão correta' : 'Diferente do que você esperava'}
            refDoBloco={retornoRef}
          >
            <p className="text-sm leading-relaxed text-ink-soft">
              {acertou
                ? 'Seu modelo mental do código está certo. Siga em frente.'
                : 'Compare as duas saídas abaixo: a diferença aponta exatamente onde a sua leitura do código diverge do que ele faz.'}
            </p>
          </ExerciseFeedback>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="label-mono mb-1 text-ink-faint">Sua previsão</p>
              <pre className="overflow-x-auto rounded-lg border border-line bg-canvas p-3 text-sm">
                <code className="font-mono text-ink-soft">{previsao.trim() || '(vazio)'}</code>
              </pre>
            </div>
            <div>
              <p className="label-mono mb-1 text-ink-faint">Resultado real</p>
              <pre
                className={`overflow-x-auto rounded-lg border p-3 text-sm ${
                  acertou ? 'border-success-200 bg-success-50' : 'border-energy-200 bg-energy-50'
                }`}
              >
                <code className="font-mono text-ink">{saidaReal || '(nenhuma saída)'}</code>
              </pre>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-canvas p-3">
            <p className="label-mono mb-1 text-ink-faint">Por quê</p>
            <MarkdownReader
              content={exercise.explanation}
              className="prose-p:my-0 prose-p:text-sm prose-p:leading-relaxed"
            />
          </div>
        </div>
      )}

      {!acertou && (
        <HintPanel hints={exercise.hints} className="mt-3" onRevealedChange={setDicasAbertas} />
      )}
    </section>
  );
}

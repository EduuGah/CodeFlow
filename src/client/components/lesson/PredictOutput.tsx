import { useState } from 'react';
import { IconCheckCircle, IconCloseCircle, IconSpinner } from '../ui/Icon';
import type { PredictOutputExercise } from '../../../content/types';
import { executeCode } from '../../lib/sandbox';
import { Button } from '../ui/Button';
import { MarkdownReader } from '../ui/MarkdownReader';
import { HintPanel } from './HintPanel';
import { useRecordAttempt } from '../../hooks/useRecordAttempt';

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
}: {
  exercise: PredictOutputExercise;
  lessonId: string;
}) {
  const [previsao, setPrevisao] = useState('');
  const [saidaReal, setSaidaReal] = useState<string | null>(null);
  const [executando, setExecutando] = useState(false);
  const [dicasAbertas, setDicasAbertas] = useState(0);
  const [ultimaRegistrada, setUltimaRegistrada] = useState<string | null>(null);

  const registrar = useRecordAttempt();
  const acertou = saidaReal !== null && normalizar(previsao) === normalizar(saidaReal);

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
    <section className="rounded-lg border border-line bg-surface p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">
        Preveja antes de executar
      </h3>

      <div className="mb-3">
        <MarkdownReader content={exercise.prompt} />
      </div>

      <pre className="mb-4 overflow-x-auto rounded-lg bg-ink p-4 text-sm leading-relaxed">
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
            setSaidaReal(null);
          }}
          rows={3}
          spellCheck={false}
          placeholder="Uma linha para cada saída"
          className="w-full rounded-lg border border-line bg-canvas p-3 font-mono text-sm text-ink outline-none transition-colors focus:border-line-strong focus:bg-surface"
        />
      </label>

      <Button
        size="sm"
        className="mt-3 w-full gap-2"
        disabled={previsao.trim() === '' || executando}
        onClick={verificar}
      >
        {executando && <IconSpinner size={15} className="animate-spin" />}
        {saidaReal === null ? 'Executar e comparar' : 'Comparar de novo'}
      </Button>

      {saidaReal !== null && (
        <div className="mt-4 space-y-3">
          <div
            role="status"
            className={`flex items-center gap-1.5 text-sm font-semibold ${
              acertou ? 'text-success-700' : 'text-energy-700'
            }`}
          >
            {acertou ? <IconCheckCircle size={15} /> : <IconCloseCircle size={15} />}
            {acertou ? 'Sua previsão bateu com a execução' : 'Diferente do que você esperava'}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-faint">
                Sua previsão
              </p>
              <pre className="overflow-x-auto rounded-lg border border-line bg-canvas p-3 text-sm">
                <code className="font-mono text-ink-soft">{previsao.trim() || '(vazio)'}</code>
              </pre>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-faint">
                Resultado real
              </p>
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
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Por quê
            </p>
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

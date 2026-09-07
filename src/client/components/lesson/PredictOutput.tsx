import { useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import type { PredictOutputExercise } from '../../../content/types';
import { executeCode } from '../../lib/sandbox';
import { Button } from '../ui/Button';
import { MarkdownReader } from '../ui/MarkdownReader';
import { HintPanel } from './HintPanel';

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

export function PredictOutput({ exercise }: { exercise: PredictOutputExercise }) {
  const [previsao, setPrevisao] = useState('');
  const [saidaReal, setSaidaReal] = useState<string | null>(null);
  const [executando, setExecutando] = useState(false);

  const acertou = saidaReal !== null && normalizar(previsao) === normalizar(saidaReal);

  const verificar = async () => {
    setExecutando(true);
    const resultado = await executeCode(exercise.code);
    setSaidaReal(resultado.error ? `Erro: ${resultado.error}` : resultado.output);
    setExecutando(false);
  };

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Preveja antes de executar
      </h3>

      <div className="mb-3">
        <MarkdownReader content={exercise.prompt} />
      </div>

      <pre className="mb-4 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm leading-relaxed">
        <code className="font-mono text-zinc-100">{exercise.code}</code>
      </pre>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-zinc-700">
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
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-sm text-zinc-800 outline-none transition-colors focus:border-zinc-400 focus:bg-white"
        />
      </label>

      <Button
        size="sm"
        className="mt-3 w-full gap-2"
        disabled={previsao.trim() === '' || executando}
        onClick={verificar}
      >
        {executando && <Loader2 size={15} className="animate-spin" />}
        {saidaReal === null ? 'Executar e comparar' : 'Comparar de novo'}
      </Button>

      {saidaReal !== null && (
        <div className="mt-4 space-y-3">
          <div
            role="status"
            className={`flex items-center gap-1.5 text-sm font-semibold ${
              acertou ? 'text-emerald-700' : 'text-amber-800'
            }`}
          >
            {acertou ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
            {acertou ? 'Sua previsão bateu com a execução' : 'Diferente do que você esperava'}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Sua previsão
              </p>
              <pre className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm">
                <code className="font-mono text-zinc-700">{previsao.trim() || '(vazio)'}</code>
              </pre>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Resultado real
              </p>
              <pre
                className={`overflow-x-auto rounded-lg border p-3 text-sm ${
                  acertou ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
                }`}
              >
                <code className="font-mono text-zinc-800">{saidaReal || '(nenhuma saída)'}</code>
              </pre>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Por quê
            </p>
            <MarkdownReader
              content={exercise.explanation}
              className="prose-p:my-0 prose-p:text-sm prose-p:leading-relaxed"
            />
          </div>
        </div>
      )}

      {!acertou && <HintPanel hints={exercise.hints} className="mt-3" />}
    </section>
  );
}

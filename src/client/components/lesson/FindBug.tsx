import { useEffect, useRef, useState } from 'react';

import type { FindBugExercise } from '../../../content/types';
import type { ExerciseState, OnExerciseState } from '../../lib/exercise-state';
import { linhasNumeradas, podeSerResposta } from '../../lib/encontrar-bug';
import { useRecordAttempt } from '../../hooks/useRecordAttempt';
import { useFocusRescue } from '../../hooks/useFocusRescue';
import { useReportarEstado } from '../../hooks/useReportarEstado';
import { MarkdownReader } from '../ui/MarkdownReader';
import { ExerciseAction, ExerciseFeedback } from './ExerciseAction';
import { HintPanel } from './HintPanel';

/**
 * Exercício de encontrar o bug.
 *
 * O programa aparece numerado, e cada linha de código é uma alternativa. Linhas
 * em branco e comentários ficam visíveis mas não selecionáveis — elas fazem
 * parte da leitura, e oferecê-las como resposta seria ruído.
 *
 * O retorno tem três desfechos, e não dois. Acertar a linha do defeito, errar
 * numa linha qualquer, e — o caso que dá sentido ao tipo — apontar a linha onde
 * o erro **aparece**, que é a resposta que quase todo mundo dá primeiro. Essa
 * terceira recebe uma explicação própria, porque quem a escolheu não chutou:
 * leu a mensagem de erro e acreditou nela.
 */
export function FindBug({
  exercise,
  lessonId,
  onEstado,
}: {
  exercise: FindBugExercise;
  lessonId: string;
  onEstado?: OnExerciseState;
}) {
  const [escolhida, setEscolhida] = useState<number | null>(null);
  const [enviada, setEnviada] = useState(false);
  const [dicasAbertas, setDicasAbertas] = useState(0);
  const [ultimaRegistrada, setUltimaRegistrada] = useState<number | null>(null);

  const registrar = useRecordAttempt();
  const linhas = linhasNumeradas(exercise.code);
  const acertou = escolhida === exercise.buggyLine;
  const escolheuSintoma = enviada && !acertou && escolhida === exercise.symptomLine;

  const estado: ExerciseState = enviada
    ? acertou
      ? 'acertou'
      : 'errou'
    : escolhida === null
      ? 'inicial'
      : 'respondendo';

  useReportarEstado(estado, onEstado);

  const retornoRef = useRef<HTMLDivElement>(null);
  useFocusRescue(retornoRef, enviada && acertou);

  useEffect(() => {
    setEscolhida(null);
    setEnviada(false);
    setUltimaRegistrada(null);
    setDicasAbertas(0);
  }, [exercise.id]);

  const verificar = () => {
    setEnviada(true);

    if (escolhida === null || escolhida === ultimaRegistrada) return;

    setUltimaRegistrada(escolhida);
    registrar({
      exerciseId: exercise.id,
      lessonId,
      concepts: exercise.concepts,
      correct: escolhida === exercise.buggyLine,
      hintsUsed: dicasAbertas,
    });
  };

  return (
    <section className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <h2 className="label-mono mb-3 text-brand-600">Encontre o defeito</h2>

      <div className="mb-4">
        <MarkdownReader content={exercise.prompt} />
      </div>

      {/* Superfície escura, como o editor: é programa que se lê. As linhas
          selecionáveis são rádios de verdade, para o teclado e o leitor de tela
          funcionarem sem nenhum caminho separado. */}
      <fieldset
        className="min-w-0 overflow-x-auto rounded-xl bg-editor py-3"
        disabled={enviada && acertou}
      >
        <legend className="sr-only">Escolha a linha que contém o defeito</legend>

        {linhas.map((linha) => {
          const selecionavel = podeSerResposta(linha.texto);
          const escolhidaAgora = escolhida === linha.numero;
          const revelarCerta = enviada && linha.numero === exercise.buggyLine;
          const revelarErrada = enviada && escolhidaAgora && !acertou;

          let estilo = 'hover:bg-white/5';
          if (revelarCerta) estilo = 'bg-success-600/25';
          else if (revelarErrada) estilo = 'bg-energy-500/25';
          else if (escolhidaAgora) estilo = 'bg-white/10';

          const conteudo = (
            <>
              <span
                className={`w-7 shrink-0 select-none text-right font-mono text-xs ${
                  revelarCerta ? 'text-success-200' : 'text-white/35'
                }`}
              >
                {linha.numero}
              </span>
              <code className="whitespace-pre font-mono text-sm leading-relaxed text-white/90">
                {linha.texto || ' '}
              </code>
            </>
          );

          if (!selecionavel) {
            // Em branco ou comentário: continua na tela, porque faz parte da
            // leitura, mas não é oferecida como resposta.
            return (
              <div key={linha.numero} className="flex items-start gap-3 px-3 py-0.5 opacity-70">
                {conteudo}
              </div>
            );
          }

          return (
            <label
              key={linha.numero}
              className={`flex cursor-pointer items-start gap-3 px-3 py-0.5 transition-colors ${estilo}`}
            >
              <input
                type="radio"
                name={exercise.id}
                className="sr-only"
                checked={escolhidaAgora}
                onChange={() => {
                  setEscolhida(linha.numero);
                  setEnviada(false);
                }}
                aria-label={`Linha ${linha.numero}: ${linha.texto.trim()}`}
              />
              {conteudo}
            </label>
          );
        })}
      </fieldset>

      {!(enviada && acertou) && (
        <ExerciseAction className="mt-4" disabled={escolhida === null} onClick={verificar}>
          {escolhida === null
            ? 'Escolha uma linha'
            : enviada
              ? 'Verificar de novo'
              : `Apontar a linha ${escolhida}`}
        </ExerciseAction>
      )}

      {enviada && (
        <div className="mt-4">
          <ExerciseFeedback
            estado={acertou ? 'acertou' : 'errou'}
            titulo={
              acertou
                ? `A linha ${exercise.buggyLine} é onde o defeito está`
                : escolheuSintoma
                  ? `A linha ${escolhida} é onde o erro aparece — não onde ele nasce`
                  : 'Não é essa linha'
            }
            refDoBloco={retornoRef}
          >
            <MarkdownReader
              content={
                acertou
                  ? exercise.explanation
                  : escolheuSintoma && exercise.symptomFeedback
                    ? exercise.symptomFeedback
                    : 'Leia de novo o que cada linha assume que já aconteceu. O defeito está onde uma dessas suposições é falsa.'
              }
              className="prose-p:my-0 prose-p:text-sm prose-p:leading-relaxed"
            />
          </ExerciseFeedback>
        </div>
      )}

      {!acertou && (
        <HintPanel
          key={exercise.id}
          hints={exercise.hints}
          className="mt-3"
          onRevealedChange={setDicasAbertas}
        />
      )}
    </section>
  );
}

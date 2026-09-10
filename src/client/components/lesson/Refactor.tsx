import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

import type { LanguageId, RefactorExercise } from '../../../content/types';
import type { ExerciseState, OnExerciseState } from '../../lib/exercise-state';
import { avaliarRestricoes, todasCumpridas, type ResultadoDeRestricao } from '../../lib/refatorar';
import { executeCode, type ExecutionResult } from '../../lib/sandbox';
import { useRecordAttempt } from '../../hooks/useRecordAttempt';
import { useReportarEstado } from '../../hooks/useReportarEstado';
import { IconCheck, IconClose, IconPlay } from '../ui/Icon';
import { MarkdownReader } from '../ui/MarkdownReader';
import { ExerciseAction, ExerciseFeedback } from './ExerciseAction';
import { HintPanel } from './HintPanel';

/**
 * Exercício de refatorar.
 *
 * O retorno tem duas metades, e mostrá-las separadas é o ponto pedagógico: em
 * cima, o comportamento — os testes que precisam continuar passando; embaixo, a
 * forma — as restrições que precisam ser cumpridas. Passar numa e falhar na
 * outra são situações opostas, e cada uma pede uma ação diferente.
 *
 * As restrições ficam visíveis **antes** de verificar, como uma lista de
 * tarefas. Escondê-las até a primeira tentativa transformaria o exercício em
 * adivinhação do que o autor queria.
 */
export function Refactor({
  exercise,
  lessonId,
  language,
  onEstado,
}: {
  exercise: RefactorExercise;
  lessonId: string;
  language: LanguageId;
  onEstado?: OnExerciseState;
}) {
  const [codigo, setCodigo] = useState(exercise.initialCode);
  const [rodando, setRodando] = useState(false);
  const [resultado, setResultado] = useState<ExecutionResult | null>(null);
  const [dicasAbertas, setDicasAbertas] = useState(0);
  const [codigoVerificado, setCodigoVerificado] = useState<string | null>(null);

  const registrar = useRecordAttempt();

  useEffect(() => {
    setCodigo(exercise.initialCode);
    setResultado(null);
    setCodigoVerificado(null);
    setDicasAbertas(0);
  }, [exercise.id, exercise.initialCode]);

  // A forma é conferida no que está no editor agora — não custa nada, e assim a
  // lista de tarefas vai sendo marcada enquanto o aluno escreve.
  const restricoes: ResultadoDeRestricao[] = avaliarRestricoes(codigo, exercise.constraints);
  const formaOk = todasCumpridas(restricoes);

  const comportamentoOk =
    resultado !== null &&
    resultado.testResults.length > 0 &&
    resultado.testResults.every((t) => t.passed);

  const desatualizado = resultado !== null && codigo !== codigoVerificado;
  const aprovado = comportamentoOk && formaOk && !desatualizado;

  const estado: ExerciseState = rodando
    ? 'verificando'
    : resultado === null
      ? codigo.trim() === exercise.initialCode.trim()
        ? 'inicial'
        : 'respondendo'
      : desatualizado
        ? 'respondendo'
        : aprovado
          ? 'acertou'
          : 'errou';

  useReportarEstado(estado, onEstado);

  const executar = async () => {
    setRodando(true);

    const enviado = codigo;
    const execucao = await executeCode(enviado, exercise.tests, exercise.properties);

    setResultado(execucao);
    setCodigoVerificado(enviado);
    setRodando(false);

    const passouTudo =
      execucao.testResults.length > 0 && execucao.testResults.every((t) => t.passed);

    if (enviado !== codigoVerificado) {
      registrar({
        exerciseId: exercise.id,
        lessonId,
        concepts: exercise.concepts,
        correct: passouTudo && todasCumpridas(avaliarRestricoes(enviado, exercise.constraints)),
        hintsUsed: dicasAbertas,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
        <h2 className="label-mono mb-2 text-brand-600">Refatore</h2>
        <MarkdownReader content={exercise.prompt} />
      </div>

      {/* A lista de tarefas, marcada em tempo real. Escondê-la até a primeira
          tentativa transformaria o exercício em adivinhação. */}
      <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
        <p className="label-mono mb-3 text-ink-faint">A forma que se pede</p>
        <ul className="space-y-2">
          {restricoes.map((restricao) => (
            <li
              key={restricao.description}
              className={`flex items-start gap-2.5 text-sm leading-relaxed ${
                restricao.cumprida ? 'text-success-700' : 'text-ink-soft'
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {restricao.cumprida ? (
                  <IconCheck size={15} />
                ) : (
                  <span className="block h-[15px] w-[15px] rounded-full border border-control" />
                )}
              </span>
              <span>
                {restricao.description}
                {!restricao.cumprida && restricao.motivo ? (
                  <span className="block text-ink-faint">{restricao.motivo}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`overflow-hidden rounded-xl border transition-colors ${
          aprovado ? 'border-success-200' : 'border-line'
        }`}
      >
        <Editor
          height="300px"
          language={language}
          theme="vs-dark"
          value={codigo}
          onChange={(valor) => setCodigo(valor ?? '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            padding: { top: 14, bottom: 14 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            lineNumbersMinChars: 3,
            automaticLayout: true,
            scrollbar: { alwaysConsumeMouseWheel: false },
          }}
        />
      </div>

      <ExerciseAction onClick={executar} disabled={rodando} carregando={rodando}>
        {!rodando && <IconPlay size={18} />}
        {rodando
          ? 'Rodando os testes…'
          : resultado === null
            ? 'Rodar os testes'
            : 'Rodar de novo'}
      </ExerciseAction>

      {desatualizado && (
        <p className="rounded-lg border border-line bg-sunken px-4 py-3 text-sm leading-relaxed text-ink-soft">
          O código mudou depois desta execução. Rode de novo para conferir a versão atual.
        </p>
      )}

      {resultado && !desatualizado && (
        <div role="status" className="space-y-3">
          <ExerciseFeedback
            anunciar={false}
            estado={aprovado ? 'acertou' : 'errou'}
            titulo={
              aprovado
                ? 'Mesma coisa, escrita melhor'
                : !comportamentoOk
                  ? 'A reescrita mudou o comportamento'
                  : 'O comportamento está intacto — falta a forma'
            }
          >
            <p className="text-sm leading-relaxed text-ink-soft">
              {aprovado
                ? 'Os testes continuam passando e a forma mudou. É exatamente isto que refatorar significa: melhorar como o código está escrito sem mexer no que ele faz.'
                : !comportamentoOk
                  ? 'Algum teste que passava antes parou de passar. Numa refatoração isso nunca é aceitável: o comportamento é o contrato, e os testes existem para você poder mexer na forma com segurança.'
                  : 'Os testes estão verdes, então o comportamento se manteve. Volte à lista acima: ainda falta alguma coisa na forma.'}
            </p>
          </ExerciseFeedback>

          {resultado.error && (
            <p className="rounded-lg border border-danger-200 bg-danger-50 p-4 font-mono text-sm leading-relaxed text-danger-700">
              {resultado.error}
            </p>
          )}

          {resultado.testResults.length > 0 && (
            <ul className="space-y-2">
              {resultado.testResults.map((teste, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2.5 rounded-lg border p-3 text-sm leading-relaxed ${
                    teste.passed
                      ? 'border-success-200 bg-success-50 text-success-700'
                      : 'border-energy-200 bg-energy-50 text-energy-700'
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    {teste.passed ? <IconCheck size={15} /> : <IconClose size={15} />}
                  </span>
                  {teste.message}
                </li>
              ))}
            </ul>
          )}

          {aprovado && (
            <div className="rounded-lg border border-success-200 bg-success-50 p-4">
              <MarkdownReader
                content={exercise.explanation}
                className="prose-p:my-0 prose-p:text-sm prose-p:leading-relaxed"
              />
            </div>
          )}
        </div>
      )}

      {!aprovado && (
        <HintPanel key={exercise.id} hints={exercise.hints} onRevealedChange={setDicasAbertas} />
      )}
    </div>
  );
}

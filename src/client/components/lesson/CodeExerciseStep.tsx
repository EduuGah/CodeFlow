import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

import type { CodeExercise, LanguageId } from '../../../content/types';
import { executeCode, type ExecutionResult } from '../../lib/sandbox';
import { useRecordAttempt } from '../../hooks/useRecordAttempt';
import { IconCheck, IconClose, IconPlay, IconSpinner } from '../ui/Icon';
import { MarkdownReader } from '../ui/MarkdownReader';
import { HintPanel } from './HintPanel';

/**
 * Exercício de código como passo da aula.
 *
 * A versão anterior era um split-screen de altura fixa: enunciado à esquerda,
 * editor à direita, ambos travados na altura da janela. No celular isso deixava
 * o editor com poucos centímetros de altura e o console fora da tela.
 *
 * Aqui tudo empilha numa coluna: enunciado, editor com altura própria, ação e
 * resultado. Funciona no celular por construção, e no desktop ganha largura sem
 * precisar de outro layout.
 */

interface CodeExerciseStepProps {
  exercise: CodeExercise;
  lessonId: string;
  language: LanguageId;
  /** Chamado quando todos os testes passam, para a aula liberar o avanço. */
  onSolved: () => void;
}

export function CodeExerciseStep({
  exercise,
  lessonId,
  language,
  onSolved,
}: CodeExerciseStepProps) {
  const [code, setCode] = useState(exercise.initialCode);
  const [rodando, setRodando] = useState(false);
  const [resultado, setResultado] = useState<ExecutionResult | null>(null);
  const [dicasAbertas, setDicasAbertas] = useState(0);

  const registrar = useRecordAttempt();

  // Trocar de exercício reaproveita o componente: sem isto, o código anterior
  // continuaria no editor.
  useEffect(() => {
    setCode(exercise.initialCode);
    setResultado(null);
    setDicasAbertas(0);
  }, [exercise.id, exercise.initialCode]);

  const passouTudo =
    resultado !== null &&
    resultado.testResults.length > 0 &&
    resultado.testResults.every((t) => t.passed);

  const executar = async () => {
    setRodando(true);
    setResultado(null);

    const execucao = await executeCode(code, exercise.tests);
    setResultado(execucao);
    setRodando(false);

    const acertou =
      execucao.testResults.length > 0 && execucao.testResults.every((t) => t.passed);

    registrar({
      exerciseId: exercise.id,
      lessonId,
      concepts: exercise.concepts,
      correct: acertou,
      hintsUsed: dicasAbertas,
    });

    if (acertou) onSolved();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
        <h2 className="label-mono mb-2 text-brand-600">Sua tarefa</h2>
        <MarkdownReader content={exercise.prompt} />
      </div>

      {/* Altura fixa e generosa: o editor precisa de espaço previsível, e rolar
          dentro dele é melhor do que espremê-lo contra a janela. */}
      <div className="overflow-hidden rounded-xl border border-line">
        <Editor
          height="280px"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(valor) => setCode(valor ?? '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            padding: { top: 14, bottom: 14 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            lineNumbersMinChars: 3,
            // Sem isto o Monaco mede o contêiner uma unica vez, ao montar. Como
            // o passo entra em cena junto com o layout, ele media cedo demais e
            // ficava travado em 5x5 pixels — editor invisivel no celular.
            automaticLayout: true,
            // No celular a rolagem da página precisa funcionar por cima do
            // editor, senão o aluno fica preso dentro dele.
            scrollbar: { alwaysConsumeMouseWheel: false },
          }}
        />
      </div>

      <button
        type="button"
        onClick={executar}
        disabled={rodando}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3.5 font-bold text-white transition-colors hover:bg-brand-900 active:translate-y-px disabled:opacity-60"
      >
        {rodando ? <IconSpinner size={18} className="animate-spin" /> : <IconPlay size={18} />}
        {rodando ? 'Executando…' : 'Executar código'}
      </button>

      {resultado && (
        <div className="space-y-3">
          {/* Tempo esgotado não é erro do aluno: é laço sem fim, e merece tom próprio. */}
          {resultado.timedOut ? (
            <p className="rounded-lg border border-energy-200 bg-energy-50 p-4 text-sm leading-relaxed text-energy-700">
              {resultado.error}
            </p>
          ) : (
            resultado.error && (
              <p className="rounded-lg border border-danger-200 bg-danger-50 p-4 font-mono text-sm leading-relaxed text-danger-700">
                {resultado.error}
              </p>
            )
          )}

          {resultado.output && (
            <div className="overflow-hidden rounded-lg bg-terminal">
              <p className="label-mono border-b border-white/10 px-4 py-2 text-white/40">Saída</p>
              <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
                <code className="font-mono text-white/90">{resultado.output}</code>
              </pre>
            </div>
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
        </div>
      )}

      {/* A dica some quando o exercício é resolvido: já cumpriu a função. */}
      {!passouTudo && (
        <HintPanel key={exercise.id} hints={exercise.hints} onRevealedChange={setDicasAbertas} />
      )}
    </div>
  );
}

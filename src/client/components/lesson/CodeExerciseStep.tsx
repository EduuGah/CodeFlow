import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

import type { CodeExercise, LanguageId } from '../../../content/types';
import type { ExerciseState, OnExerciseState } from '../../lib/exercise-state';
import { executeCode, type ExecutionResult } from '../../lib/sandbox';
import { useRecordAttempt } from '../../hooks/useRecordAttempt';
import { useReportarEstado } from '../../hooks/useReportarEstado';
import { IconCheck, IconClose, IconPlay } from '../ui/Icon';
import { MarkdownReader } from '../ui/MarkdownReader';
import { ExerciseAction, ExerciseFeedback } from './ExerciseAction';
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
  /** Avisa a aula em que ponto o exercício está. */
  onEstado?: OnExerciseState;
}

export function CodeExerciseStep({
  exercise,
  lessonId,
  language,
  onEstado,
}: CodeExerciseStepProps) {
  const [code, setCode] = useState(exercise.initialCode);
  const [rodando, setRodando] = useState(false);
  const [resultado, setResultado] = useState<ExecutionResult | null>(null);
  const [dicasAbertas, setDicasAbertas] = useState(0);
  const [verSolucao, setVerSolucao] = useState(false);
  /**
   * O código exato que gerou o resultado na tela.
   *
   * Sem isto, editar depois de passar deixaria o rodapé da aula dizendo
   * "Continuar" para um código que ninguém verificou — o painel continuaria
   * verde enquanto o editor já contém outra coisa.
   */
  const [codigoVerificado, setCodigoVerificado] = useState<string | null>(null);

  const registrar = useRecordAttempt();

  // Trocar de exercício reaproveita o componente: sem isto, o código anterior
  // continuaria no editor.
  useEffect(() => {
    setCode(exercise.initialCode);
    setResultado(null);
    setCodigoVerificado(null);
    setDicasAbertas(0);
    setVerSolucao(false);
  }, [exercise.id, exercise.initialCode]);

  const passouTudo =
    resultado !== null &&
    resultado.testResults.length > 0 &&
    resultado.testResults.every((t) => t.passed);

  const desatualizado = resultado !== null && code !== codigoVerificado;

  const estado: ExerciseState = rodando
    ? 'verificando'
    : resultado === null
      ? code.trim() === exercise.initialCode.trim()
        ? 'inicial'
        : 'respondendo'
      : desatualizado
        ? 'respondendo'
        : passouTudo
          ? 'acertou'
          : 'errou';

  useReportarEstado(estado, onEstado);

  const executar = async () => {
    setRodando(true);
    setResultado(null);

    const enviado = code;
    const execucao = await executeCode(enviado, exercise.tests, exercise.properties);
    setResultado(execucao);
    setCodigoVerificado(enviado);
    setRodando(false);

    const acertou =
      execucao.testResults.length > 0 && execucao.testResults.every((t) => t.passed);

    // Rodar de novo o mesmo código não é uma tentativa nova. Sem esta guarda,
    // clicar três vezes gravava três erros e derrubava a taxa de acerto do
    // aluno sem ele ter feito nada diferente.
    if (enviado !== codigoVerificado) {
      registrar({
        exerciseId: exercise.id,
        lessonId,
        concepts: exercise.concepts,
        correct: acertou,
        hintsUsed: dicasAbertas,
      });
    }
  };

  const falhas = resultado?.testResults.filter((t) => !t.passed) ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
        <h2 className="label-mono mb-2 text-brand-600">Sua tarefa</h2>
        <MarkdownReader content={exercise.prompt} />
      </div>

      {/* Altura fixa e generosa: o editor precisa de espaço previsível, e rolar
          dentro dele é melhor do que espremê-lo contra a janela. */}
      <div
        className={`overflow-hidden rounded-xl border transition-colors ${
          estado === 'acertou' ? 'border-success-200' : 'border-line'
        }`}
      >
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

      <ExerciseAction onClick={executar} disabled={rodando} carregando={rodando}>
        {!rodando && <IconPlay size={18} />}
        {rodando ? 'Executando…' : resultado === null ? 'Executar código' : 'Executar de novo'}
      </ExerciseAction>

      {desatualizado && (
        <p className="rounded-lg border border-line bg-sunken px-4 py-3 text-sm leading-relaxed text-ink-soft">
          O código mudou depois desta execução. Rode de novo para conferir a versão atual.
        </p>
      )}

      {resultado && (
        <div className="space-y-3">
          {/* O veredito vem antes das evidências: a primeira pergunta é sempre
              "eu acertei?", e antes o aluno tinha que deduzir isso de uma lista
              de linhas verdes. */}
          {!desatualizado && resultado.testResults.length > 0 && (
            <ExerciseFeedback
              estado={passouTudo ? 'acertou' : 'errou'}
              titulo={
                passouTudo
                  ? 'Todos os testes passaram'
                  : `${falhas.length} de ${resultado.testResults.length} ${
                      resultado.testResults.length === 1 ? 'teste falhou' : 'testes falharam'
                    }`
              }
            >
              <p className="text-sm leading-relaxed text-ink-soft">
                {passouTudo
                  ? 'Sua solução vale para todos os casos verificados, e não só para o exemplo do enunciado.'
                  : 'Cada linha abaixo diz o que era esperado. Comece pela primeira que falhou.'}
              </p>
            </ExerciseFeedback>
          )}

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

          {/* A solução de referência só depois de resolver: comparar abordagens
              ensina, e entregá-la antes tiraria o exercício. */}
          {passouTudo && !desatualizado && exercise.solution && (
            <div className="rounded-lg border border-line bg-surface p-4">
              {verSolucao ? (
                <>
                  <p className="label-mono mb-2 text-ink-faint">Uma solução de referência</p>
                  <pre className="overflow-x-auto rounded-lg bg-editor p-4 text-sm leading-relaxed">
                    <code className="font-mono text-white/90">{exercise.solution}</code>
                  </pre>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Não é a única resposta certa — os testes aceitam qualquer código que resolva o
                    problema. Serve para comparar caminhos.
                  </p>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setVerSolucao(true)}
                  className="min-h-11 w-full rounded-lg text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
                >
                  Comparar com uma solução de referência
                </button>
              )}
            </div>
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

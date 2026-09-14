import { useEffect, useRef, useState } from 'react';

import type { CodeExercise, LanguageId } from '../../../content/types';
import type { ExerciseState, OnExerciseState } from '../../lib/exercise-state';
import { executarNaLinguagem } from '../../lib/executar';
import { executarPagina } from '../../lib/pagina';
import { SANDBOX_DO_IFRAME } from '../../lib/pagina-core';
import type { ExecutionResult } from '../../lib/sandbox';
import { useRecordAttempt } from '../../hooks/useRecordAttempt';
import { useReportarEstado } from '../../hooks/useReportarEstado';
import { Button } from '../ui/Button';
import { Card, SectionLabel } from '../ui/Card';
import { CodeEditor } from '../ui/CodeEditor';
import { IconCheck, IconClose, IconPlay } from '../ui/Icon';
import { MarkdownReader } from '../ui/MarkdownReader';
import { ErrosDoCompilador } from './ErrosDoCompilador';
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
 *
 * Dois motores, uma tela. Com `runtime: 'iframe'` o código é uma página: ela
 * é renderizada num `<iframe sandbox>` que fica visível entre o editor e a
 * ação — é o que o aluno quer ver —, e os testes rodam lá dentro. O resto
 * (veredito, saída, lista de testes, dicas) é o mesmo.
 *
 * Em aula de TypeScript há um passo antes do sandbox: o compilador. Se ele
 * recusa, a lista de erros aparece no lugar do veredito, com linha e
 * explicação, e nada roda.
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
  const ehPagina = exercise.runtime === 'iframe';
  const iframeRef = useRef<HTMLIFrameElement>(null);
  /** A página já foi renderizada ao menos uma vez neste exercício. */
  const [paginaRenderizada, setPaginaRenderizada] = useState(false);

  // Trocar de exercício reaproveita o componente: sem isto, o código anterior
  // continuaria no editor.
  useEffect(() => {
    setCode(exercise.initialCode);
    setResultado(null);
    setCodigoVerificado(null);
    setDicasAbertas(0);
    setVerSolucao(false);
    setPaginaRenderizada(false);
    if (iframeRef.current) iframeRef.current.srcdoc = '';
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
    const execucao =
      ehPagina && iframeRef.current
        ? await executarPagina(iframeRef.current, enviado, exercise.tests)
        : await executarNaLinguagem({
            language,
            code: enviado,
            tests: exercise.tests,
            properties: exercise.properties,
            typeTests: exercise.typeTests,
          });
    if (ehPagina) setPaginaRenderizada(true);
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
      <Card>
        <SectionLabel tone="brand" className="mb-2">
          Sua tarefa
        </SectionLabel>
        <MarkdownReader content={exercise.prompt} />
      </Card>

      {/* Altura fixa e generosa: o editor precisa de espaço previsível, e rolar
          dentro dele é melhor do que espremê-lo contra a janela. */}
      <div
        className={`overflow-hidden rounded-xl border transition-colors ${
          estado === 'acertou' ? 'border-success-200' : 'border-line'
        }`}
      >
        <CodeEditor
          height="280px"
          language={language}
          value={code}
          onChange={setCode}
        />
      </div>

      {ehPagina && (
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <SectionLabel as="p">Página</SectionLabel>
            {paginaRenderizada && (
              <span className="text-xs text-ink-faint">como o navegador mostra</span>
            )}
          </div>
          {/* O iframe existe desde o início — o motor escreve nele — mas fica
              coberto por um aviso até a primeira execução, para o retângulo
              branco vazio não parecer um erro. */}
          <div className="relative h-[280px] bg-white">
            <iframe
              ref={iframeRef}
              title="Pré-visualização da página"
              sandbox={SANDBOX_DO_IFRAME}
              className="h-full w-full border-0"
            />
            {!paginaRenderizada && (
              <div className="absolute inset-0 flex items-center justify-center bg-canvas px-6 text-center text-sm text-ink-faint">
                A página aparece aqui quando você rodar o código.
              </div>
            )}
          </div>
        </Card>
      )}

      <ExerciseAction onClick={executar} disabled={rodando} carregando={rodando}>
        {!rodando && <IconPlay size={18} />}
        {rodando
          ? ehPagina
            ? 'Rodando a página…'
            : 'Executando…'
          : resultado === null
            ? ehPagina
              ? 'Rodar a página'
              : 'Executar código'
            : ehPagina
              ? 'Rodar de novo'
              : 'Executar de novo'}
      </ExerciseAction>

      {desatualizado && (
        <p className="rounded-lg border border-line bg-sunken px-4 py-3 text-sm leading-relaxed text-ink-soft">
          O código mudou depois desta execução. Rode de novo para conferir a versão atual.
        </p>
      )}

      {resultado && (
        <div role="status" className="space-y-3">
          {/* O veredito vem antes das evidências: a primeira pergunta é sempre
              "eu acertei?", e antes o aluno tinha que deduzir isso de uma lista
              de linhas verdes. */}
          {!desatualizado && resultado.testResults.length > 0 && (
            <ExerciseFeedback
              anunciar={false}
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
          ) : resultado.compileErrors ? (
            <ErrosDoCompilador erros={resultado.compileErrors} />
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
                <Button
                  variant="ghost"
                  block
                  onClick={() => setVerSolucao(true)}
                  className="text-brand-600 hover:bg-brand-50 hover:text-brand-700"
                >
                  Comparar com uma solução de referência
                </Button>
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

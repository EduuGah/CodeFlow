import { useEffect, useState } from 'react';

import type { ServerExercise } from '../../../content/types';
import type { ExerciseState, OnExerciseState } from '../../lib/exercise-state';
import type { ExecutionResult } from '../../lib/sandbox';
import { executarServidor } from '../../lib/servidor';
import type { Troca } from '../../lib/servidor-core';
import { useRecordAttempt } from '../../hooks/useRecordAttempt';
import { useReportarEstado } from '../../hooks/useReportarEstado';
import { Button } from '../ui/Button';
import { Card, SectionLabel } from '../ui/Card';
import { CodeEditor } from '../ui/CodeEditor';
import { IconCheck, IconClose, IconPlay } from '../ui/Icon';
import { MarkdownReader } from '../ui/MarkdownReader';
import { ExerciseAction, ExerciseFeedback } from './ExerciseAction';
import { HintPanel } from './HintPanel';

/**
 * Exercício de servidor como passo da aula.
 *
 * A mesma coluna do exercício de código — enunciado, editor, ação, veredito,
 * evidências, dicas — com o que só existe aqui:
 *
 * 1. **Os arquivos e o ambiente, antes do editor.** Quando o exercício traz
 *    outros módulos (`require('./tarefas')`) ou variáveis de ambiente, eles
 *    ficam à vista: ninguém importa um arquivo que não sabe que existe.
 * 2. **As trocas HTTP em vez de um console.** Cada pedido que os testes
 *    fizeram aparece como um cliente de API mostraria — método, caminho,
 *    corpo enviado, status e resposta. É olhando o `404` ao lado do `GET
 *    /tarefas/9` que a pessoa entende o que o servidor dela respondeu.
 *
 * O `console.log` do servidor continua aparecendo, como o terminal em que
 * o Node roda.
 */

interface ServerExerciseStepProps {
  exercise: ServerExercise;
  lessonId: string;
  onEstado?: OnExerciseState;
}

const COR_DO_STATUS = (status: number) =>
  status < 300 ? 'bg-success-600 text-white' : status < 500 ? 'bg-energy-500 text-white' : 'bg-danger-500 text-white';

function Trocas({ trocas }: { trocas: Troca[] }) {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-2">
        <SectionLabel as="p">Pedidos e respostas</SectionLabel>
        <span className="text-xs text-ink-faint">
          {trocas.length} {trocas.length === 1 ? 'troca' : 'trocas'}, na ordem
        </span>
      </div>
      <ol className="divide-y divide-line">
        {trocas.map((t, i) => (
          <li key={i} className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
              <span className="font-bold text-ink">{t.metodo}</span>
              <span className="min-w-0 break-all text-ink-soft">{t.caminho}</span>
              <span className={`ml-auto rounded-md px-2 py-0.5 text-xs font-bold ${COR_DO_STATUS(t.status)}`}>
                {t.status}
              </span>
            </div>
            {t.corpo !== undefined && (
              <pre className="mt-2 overflow-x-auto rounded-md bg-sunken px-3 py-2 text-xs leading-relaxed text-ink-soft">
                <code className="font-mono">→ {t.corpo}</code>
              </pre>
            )}
            <pre className="mt-2 overflow-x-auto rounded-md bg-editor px-3 py-2 text-xs leading-relaxed">
              <code className="font-mono text-white/90">← {t.resposta === '' ? '(sem corpo)' : t.resposta}</code>
            </pre>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function ServerExerciseStep({ exercise, lessonId, onEstado }: ServerExerciseStepProps) {
  const [code, setCode] = useState(exercise.initialCode);
  const [rodando, setRodando] = useState(false);
  const [resultado, setResultado] = useState<ExecutionResult | null>(null);
  const [dicasAbertas, setDicasAbertas] = useState(0);
  const [verSolucao, setVerSolucao] = useState(false);
  /** O código exato que gerou o resultado na tela — ver `CodeExerciseStep`. */
  const [codigoVerificado, setCodigoVerificado] = useState<string | null>(null);

  const registrar = useRecordAttempt();
  const arquivos = Object.entries(exercise.arquivos ?? {});
  const env = Object.entries(exercise.env ?? {});
  // Um exercício de módulo (sem pedido HTTP nenhum) roda no mesmo Node de
  // mentira, mas o botão não pode prometer um servidor que não existe.
  const temServidor = exercise.tests.some((t) => t.assertion.includes('pedir('));

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
    const execucao = await executarServidor(enviado, exercise);
    setResultado(execucao);
    setCodigoVerificado(enviado);
    setRodando(false);

    const acertou = execucao.testResults.length > 0 && execucao.testResults.every((t) => t.passed);

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
  const visiveis = resultado?.testResults ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <SectionLabel tone="brand" className="mb-2">
          Sua tarefa
        </SectionLabel>
        <MarkdownReader content={exercise.prompt} />
      </Card>

      {(arquivos.length > 0 || env.length > 0) && (
        <Card padding="none" className="overflow-hidden">
          <div className="border-b border-line px-4 py-2">
            <SectionLabel as="p">O que já existe no projeto</SectionLabel>
          </div>
          {env.length > 0 && (
            <div className="border-b border-line px-4 py-3">
              <p className="label-mono mb-1.5 text-ink-faint">Variáveis de ambiente</p>
              <ul className="space-y-1 font-mono text-sm">
                {env.map(([nome, valor]) => (
                  <li key={nome} className="text-ink-soft">
                    <span className="text-ink">{nome}</span>={valor}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {arquivos.map(([nome, fonte]) => (
            <details key={nome} className="border-b border-line last:border-b-0">
              <summary className="cursor-pointer px-4 py-2.5 font-mono text-sm text-ink hover:bg-sunken">{nome}</summary>
              <pre className="overflow-x-auto border-t border-line bg-editor p-4 text-xs leading-relaxed">
                <code className="font-mono text-white/90">{fonte.trim()}</code>
              </pre>
            </details>
          ))}
        </Card>
      )}

      <div
        className={`overflow-hidden rounded-xl border transition-colors ${
          estado === 'acertou' ? 'border-success-200' : 'border-line'
        }`}
      >
        <CodeEditor height="280px" language="javascript" value={code} onChange={setCode} />
      </div>

      <ExerciseAction onClick={executar} disabled={rodando} carregando={rodando}>
        {!rodando && <IconPlay size={18} />}
        {rodando
          ? temServidor
            ? 'Subindo o servidor…'
            : 'Executando…'
          : resultado === null
            ? temServidor
              ? 'Rodar o servidor'
              : 'Executar código'
            : temServidor
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
          {!desatualizado && visiveis.length > 0 && (
            <ExerciseFeedback
              anunciar={false}
              estado={passouTudo ? 'acertou' : 'errou'}
              titulo={
                passouTudo
                  ? temServidor
                    ? 'O servidor respondeu tudo como esperado'
                    : 'Todos os testes passaram'
                  : `${falhas.length} de ${visiveis.length} ${
                      visiveis.length === 1 ? 'verificação falhou' : 'verificações falharam'
                    }`
              }
            >
              <p className="text-sm leading-relaxed text-ink-soft">
                {passouTudo
                  ? 'O código pode ser diferente do de referência, e não faz diferença: o que conta é o que ele responde.'
                  : temServidor
                    ? 'Compare cada pedido com a resposta que o seu servidor deu, logo abaixo. Comece pelo primeiro que falhou.'
                    : 'Cada linha abaixo diz o que era esperado. Comece pela primeira que falhou.'}
              </p>
            </ExerciseFeedback>
          )}

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

          {visiveis.length > 0 && (
            <ul className="space-y-2">
              {visiveis.map((teste, i) => (
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

          {resultado.trocas && resultado.trocas.length > 0 && <Trocas trocas={resultado.trocas} />}

          {resultado.output && (
            <div className="overflow-hidden rounded-lg bg-terminal">
              <p className="label-mono border-b border-white/10 px-4 py-2 text-white/40">Terminal do servidor</p>
              <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
                <code className="font-mono text-white/90">{resultado.output}</code>
              </pre>
            </div>
          )}

          {passouTudo && !desatualizado && (
            <div className="rounded-lg border border-line bg-surface p-4">
              {verSolucao ? (
                <>
                  <p className="label-mono mb-2 text-ink-faint">Uma solução de referência</p>
                  <pre className="overflow-x-auto rounded-lg bg-editor p-4 text-sm leading-relaxed">
                    <code className="font-mono text-white/90">{exercise.solution}</code>
                  </pre>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    Não é a única resposta certa — os pedidos aceitam qualquer servidor que responda o
                    esperado. Serve para comparar caminhos.
                  </p>
                </>
              ) : (
                <Button
                  variant="ghost"
                  block
                  onClick={() => setVerSolucao(true)}
                  className="text-brand-700 hover:bg-brand-50 hover:text-brand-700"
                >
                  Comparar com uma solução de referência
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {!passouTudo && (
        <HintPanel key={exercise.id} hints={exercise.hints} onRevealedChange={setDicasAbertas} />
      )}
    </div>
  );
}

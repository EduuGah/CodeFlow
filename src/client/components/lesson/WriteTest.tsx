import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';

import type { LanguageId, WriteTestExercise } from '../../../content/types';
import type { ExerciseState, OnExerciseState } from '../../lib/exercise-state';
import { avaliarTestes, type VereditoDeTeste } from '../../lib/escrever-teste';
import { executeCode } from '../../lib/sandbox';
import { useRecordAttempt } from '../../hooks/useRecordAttempt';
import { useReportarEstado } from '../../hooks/useReportarEstado';
import { IconCheck, IconClose, IconPlay } from '../ui/Icon';
import { MarkdownReader } from '../ui/MarkdownReader';
import { ExerciseAction, ExerciseFeedback } from './ExerciseAction';
import { HintPanel } from './HintPanel';

/**
 * Exercício de escrever o teste.
 *
 * A inversão que dá nome ao tipo: aqui a plataforma não verifica a resposta do
 * aluno, ela verifica **a verificação** dele. Por isso o retorno tem uma linha
 * por implementação — a correta, que os testes precisam aceitar, e cada
 * sabotagem, que eles precisam reprovar.
 *
 * Mostrar as sabotagens pelo **defeito**, e não pelo código alterado, é o que
 * transforma a lista num roteiro: "seus testes não percebem uma função que
 * devolve sempre zero" diz o que falta escrever. Mostrar a linha trocada
 * entregaria o caso de teste pronto.
 */
export function WriteTest({
  exercise,
  lessonId,
  language,
  onEstado,
}: {
  exercise: WriteTestExercise;
  lessonId: string;
  language: LanguageId;
  onEstado?: OnExerciseState;
}) {
  const [codigo, setCodigo] = useState(exercise.initialCode);
  const [rodando, setRodando] = useState(false);
  const [veredito, setVeredito] = useState<VereditoDeTeste | null>(null);
  const [dicasAbertas, setDicasAbertas] = useState(0);
  /**
   * O texto exato que gerou o veredito na tela.
   *
   * Serve para duas coisas: não gravar a mesma tentativa duas vezes, e avisar
   * quando o resultado exibido já não corresponde ao que está no editor.
   */
  const [codigoAvaliado, setCodigoAvaliado] = useState<string | null>(null);

  const registrar = useRecordAttempt();

  useEffect(() => {
    setCodigo(exercise.initialCode);
    setVeredito(null);
    setCodigoAvaliado(null);
    setDicasAbertas(0);
  }, [exercise.id, exercise.initialCode]);

  const desatualizado = veredito !== null && codigo !== codigoAvaliado;
  const aprovado = veredito?.aprovado === true && !desatualizado;

  const estado: ExerciseState = rodando
    ? 'verificando'
    : veredito === null
      ? codigo.trim() === exercise.initialCode.trim()
        ? 'inicial'
        : 'respondendo'
      : desatualizado
        ? 'respondendo'
        : veredito.aprovado
          ? 'acertou'
          : 'errou';

  useReportarEstado(estado, onEstado);

  const retornoRef = useRef<HTMLDivElement>(null);

  const verificar = async () => {
    setRodando(true);

    const enviado = codigo;
    const resultado = await avaliarTestes(exercise.subject, exercise.mutants, enviado, (programa) =>
      executeCode(programa)
    );

    setVeredito(resultado);
    setCodigoAvaliado(enviado);
    setRodando(false);

    // Rodar de novo o mesmo texto não é uma tentativa nova.
    if (enviado !== codigoAvaliado) {
      registrar({
        exerciseId: exercise.id,
        lessonId,
        concepts: exercise.concepts,
        correct: resultado.aprovado,
        hintsUsed: dicasAbertas,
      });
    }
  };

  const escaparam = veredito?.sabotagens.filter((s) => !s.pego) ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
        <h2 className="label-mono mb-2 text-brand-600">Escreva o teste</h2>
        <MarkdownReader content={exercise.prompt} />
      </div>

      {/* A função sob teste fica visível o tempo todo: ela é o enunciado, não
          um detalhe. Superfície escura porque é código que se lê, não se edita. */}
      <div>
        <p className="label-mono mb-1 text-ink-faint">A função que você vai testar</p>
        <pre className="overflow-x-auto rounded-xl bg-editor p-4 text-sm leading-relaxed sm:p-5">
          <code className="font-mono text-white/90">{exercise.subject}</code>
        </pre>
      </div>

      <div
        className={`overflow-hidden rounded-xl border transition-colors ${
          aprovado ? 'border-success-200' : 'border-line'
        }`}
      >
        <Editor
          height="240px"
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

      <ExerciseAction onClick={verificar} disabled={rodando} carregando={rodando}>
        {!rodando && <IconPlay size={18} />}
        {rodando ? 'Rodando seus testes…' : veredito === null ? 'Rodar meus testes' : 'Rodar de novo'}
      </ExerciseAction>

      {desatualizado && (
        <p className="rounded-lg border border-line bg-sunken px-4 py-3 text-sm leading-relaxed text-ink-soft">
          O teste mudou depois desta execução. Rode de novo para conferir a versão atual.
        </p>
      )}

      {veredito && !desatualizado && (
        <div ref={retornoRef} tabIndex={-1} role="status" className="space-y-3">
          <ExerciseFeedback
            anunciar={false}
            estado={veredito.aprovado ? 'acertou' : 'errou'}
            titulo={
              veredito.aprovado
                ? 'Seus testes pegam todos os defeitos'
                : !veredito.referenciaPassou
                  ? 'Seus testes recusam a implementação correta'
                  : escaparam.length === 1
                    ? 'Um defeito passou pelos seus testes'
                    : `${escaparam.length} defeitos passaram pelos seus testes`
            }
          >
            <p className="text-sm leading-relaxed text-ink-soft">
              {veredito.aprovado
                ? 'Eles aceitam a versão certa e reprovam cada versão quebrada — é isso que faz um teste valer alguma coisa.'
                : !veredito.referenciaPassou
                  ? 'Antes de pegar defeito, um teste precisa aceitar o código que está certo. Confira o valor que você esperava.'
                  : 'Um teste que não reprova nada aceita qualquer implementação. Acrescente uma verificação que estas versões não conseguiriam satisfazer.'}
            </p>
          </ExerciseFeedback>

          <ul className="space-y-2">
            <li
              className={`flex items-start gap-2.5 rounded-lg border p-3 text-sm leading-relaxed ${
                veredito.referenciaPassou
                  ? 'border-success-200 bg-success-50 text-success-700'
                  : 'border-energy-200 bg-energy-50 text-energy-700'
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {veredito.referenciaPassou ? <IconCheck size={15} /> : <IconClose size={15} />}
              </span>
              {veredito.referenciaPassou
                ? 'Aceitam a implementação correta'
                : `Recusam a implementação correta — ${veredito.erroNaReferencia}`}
            </li>

            {veredito.sabotagens.map((sabotagem) => (
              <li
                key={sabotagem.description}
                className={`flex items-start gap-2.5 rounded-lg border p-3 text-sm leading-relaxed ${
                  sabotagem.pego
                    ? 'border-success-200 bg-success-50 text-success-700'
                    : 'border-energy-200 bg-energy-50 text-energy-700'
                }`}
              >
                <span className="mt-0.5 shrink-0">
                  {sabotagem.pego ? <IconCheck size={15} /> : <IconClose size={15} />}
                </span>
                {sabotagem.pego
                  ? `Pegam: ${sabotagem.description}`
                  : `Não percebem: ${sabotagem.description}`}
              </li>
            ))}
          </ul>

          {veredito.aprovado && (
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

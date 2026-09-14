import { useEffect, useRef, useState } from 'react';

import type { FillBlankExercise, LanguageId } from '../../../content/types';
import { executarNaLinguagem } from '../../lib/executar';
import type { ExerciseState, OnExerciseState } from '../../lib/exercise-state';
import { dividirMolde, estaCompleto, preencher } from '../../lib/fill-blank';
import { executarPagina } from '../../lib/pagina';
import { SANDBOX_DO_IFRAME } from '../../lib/pagina-core';
import type { ExecutionResult } from '../../lib/sandbox';
import { useRecordAttempt } from '../../hooks/useRecordAttempt';
import { useFocusRescue } from '../../hooks/useFocusRescue';
import { useReportarEstado } from '../../hooks/useReportarEstado';
import { IconCheck, IconClose, IconPlay } from '../ui/Icon';
import { Card, SectionLabel } from '../ui/Card';
import { MarkdownReader } from '../ui/MarkdownReader';
import { ErrosDoCompilador } from './ErrosDoCompilador';
import { ExerciseAction, ExerciseFeedback } from './ExerciseAction';
import { HintPanel } from './HintPanel';

/**
 * Exercício de lacuna.
 *
 * O código aparece inteiro, com campos no lugar das partes que carregam a ideia.
 * O aluno vê a estrutura e preenche o que importa — é o degrau entre escolher
 * uma alternativa e escrever a função do zero.
 *
 * Os campos moram dentro do bloco de código, na mesma monoespaçada, para o aluno
 * ler o programa e não um formulário. Cada campo cresce com o que se digita, para
 * a indentação não desmontar enquanto ele escreve.
 *
 * A verificação roda os testes contra o código preenchido, igual ao exercício de
 * código: qualquer resposta que funcione é aceita.
 */
export function FillBlank({
  exercise,
  lessonId,
  language = 'javascript',
  onEstado,
}: {
  exercise: FillBlankExercise;
  lessonId: string;
  /** A linguagem da aula: em TypeScript o molde preenchido passa pelo compilador. */
  language?: LanguageId;
  /** Avisa a aula em que ponto o exercício está. */
  onEstado?: OnExerciseState;
}) {
  const [respostas, setRespostas] = useState<string[]>(() => exercise.blanks.map(() => ''));
  const [rodando, setRodando] = useState(false);
  const [resultado, setResultado] = useState<ExecutionResult | null>(null);
  const [dicasAbertas, setDicasAbertas] = useState(0);
  /** As respostas exatas já registradas, para não gravar a mesma tentativa duas vezes. */
  const [ultimaRegistrada, setUltimaRegistrada] = useState<string | null>(null);

  const registrar = useRecordAttempt();
  const segmentos = dividirMolde(exercise.template);
  const completo = estaCompleto(exercise.template, respostas);

  const passouTudo =
    resultado !== null &&
    resultado.testResults.length > 0 &&
    resultado.testResults.every((t) => t.passed);

  const estado: ExerciseState = rodando
    ? 'verificando'
    : resultado === null
      ? respostas.every((r) => r.trim() === '')
        ? 'inicial'
        : 'respondendo'
      : passouTudo
        ? 'acertou'
        : 'errou';

  useReportarEstado(estado, onEstado);

  // Acertar tira o botão de verificar; o retorno assume o lugar dele na ordem de
  // tabulação para o foco não cair no corpo do documento.
  const retornoRef = useRef<HTMLDivElement>(null);
  useFocusRescue(retornoRef, passouTudo);

  // Trocar de exercício reaproveita o componente: sem isto as respostas
  // anteriores continuariam nos campos.
  const ehPagina = exercise.runtime === 'iframe';
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [paginaRenderizada, setPaginaRenderizada] = useState(false);

  useEffect(() => {
    setRespostas(exercise.blanks.map(() => ''));
    setResultado(null);
    setUltimaRegistrada(null);
    setDicasAbertas(0);
    setPaginaRenderizada(false);
    if (iframeRef.current) iframeRef.current.srcdoc = '';
  }, [exercise.id, exercise.blanks]);

  const responder = (indice: number, valor: string) => {
    setRespostas((atual) => atual.map((r, i) => (i === indice ? valor : r)));
    // Mexer numa lacuna invalida o resultado anterior: manter o "correto" na tela
    // enquanto o código já é outro seria mentira.
    setResultado(null);
  };

  const verificar = async () => {
    setRodando(true);

    const enviado = JSON.stringify(respostas);
    const preenchido = preencher(exercise.template, respostas);
    const execucao =
      ehPagina && iframeRef.current
        ? await executarPagina(iframeRef.current, preenchido, exercise.tests)
        : await executarNaLinguagem({
            language,
            code: preenchido,
            tests: exercise.tests,
            properties: exercise.properties,
            typeTests: exercise.typeTests,
          });
    if (ehPagina) setPaginaRenderizada(true);

    setResultado(execucao);
    setRodando(false);

    const acertou =
      execucao.testResults.length > 0 && execucao.testResults.every((t) => t.passed);

    // Verificar de novo sem mudar nada não é uma tentativa nova.
    if (enviado !== ultimaRegistrada) {
      setUltimaRegistrada(enviado);
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
          Complete o código
        </SectionLabel>
        <MarkdownReader content={exercise.prompt} />
      </Card>

      {/* O código com os campos embutidos. Superfície escura, como o editor: é a
          troca de superfície que sinaliza "aqui você escreve". */}
      <div className="overflow-x-auto rounded-xl bg-editor p-4 sm:p-5">
        <pre className="font-mono text-sm leading-[2.4] text-white/90">
          <code>
            {segmentos.map((segmento, i) =>
              segmento.tipo === 'texto' ? (
                <span key={i}>{segmento.conteudo}</span>
              ) : (
                <input
                  key={i}
                  type="text"
                  value={respostas[segmento.indice] ?? ''}
                  onChange={(e) => responder(segmento.indice, e.target.value)}
                  placeholder={exercise.blanks[segmento.indice]?.placeholder ?? '?'}
                  aria-label={`Lacuna ${segmento.indice + 1} de ${exercise.blanks.length}`}
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                  // O campo cresce com o texto para a indentação não desmontar
                  // enquanto o aluno digita.
                  size={Math.max(
                    exercise.blanks[segmento.indice]?.size ?? 4,
                    (respostas[segmento.indice] ?? '').length + 1
                  )}
                  className="mx-0.5 min-h-10 rounded border-b-2 border-energy-500 bg-white/10 px-2 py-2 font-mono text-sm text-white placeholder:text-white/35 focus:border-energy-200 focus:bg-white/20 focus:outline-none"
                />
              )
            )}
          </code>
        </pre>
      </div>

      {/* Na lacuna de página, o molde preenchido vira uma página de verdade,
          e vê-la é metade do retorno: um <h1> no lugar errado se nota antes
          de qualquer teste dizer. */}
      {ehPagina && (
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <SectionLabel as="p">Página</SectionLabel>
            {paginaRenderizada && (
              <span className="text-xs text-ink-faint">como o navegador mostra</span>
            )}
          </div>
          <div className="relative h-[220px] bg-white">
            <iframe
              ref={iframeRef}
              title="Pré-visualização da página"
              sandbox={SANDBOX_DO_IFRAME}
              className="h-full w-full border-0"
            />
            {!paginaRenderizada && (
              <div className="absolute inset-0 flex items-center justify-center bg-canvas px-6 text-center text-sm text-ink-faint">
                A página aparece aqui quando você verificar.
              </div>
            )}
          </div>
        </Card>
      )}

      {!passouTudo && (
        <ExerciseAction onClick={verificar} disabled={rodando || !completo} carregando={rodando}>
          {!rodando && <IconPlay size={18} />}
          {rodando ? 'Verificando…' : completo ? 'Verificar' : 'Preencha todas as lacunas'}
        </ExerciseAction>
      )}

      {/* A região viva envolve veredito e evidências: quem usa leitor de tela
          precisa da mensagem de cada teste, não só do placar. */}
      {resultado && (
        <div ref={retornoRef} tabIndex={-1} role="status" className="space-y-3">
          {resultado.testResults.length > 0 && (
            <ExerciseFeedback
              anunciar={false}
              estado={passouTudo ? 'acertou' : 'errou'}
              titulo={
                passouTudo
                  ? 'Resposta correta'
                  : `${falhas.length} de ${resultado.testResults.length} ${
                      resultado.testResults.length === 1 ? 'teste falhou' : 'testes falharam'
                    }`
              }
            >
              {/* A explicação vem depois de acertar: entregá-la antes tiraria o
                  raciocínio que o exercício existe para provocar. */}
              {passouTudo ? (
                <MarkdownReader
                  content={exercise.explanation}
                  className="prose-p:my-0 prose-p:text-sm prose-p:leading-relaxed"
                />
              ) : (
                <p className="text-sm leading-relaxed text-ink-soft">
                  Cada linha abaixo diz o que era esperado. Ajuste as lacunas e verifique de novo.
                </p>
              )}
            </ExerciseFeedback>
          )}

          {resultado.compileErrors ? (
            <ErrosDoCompilador erros={resultado.compileErrors} />
          ) : (
            resultado.error && (
              <p className="rounded-lg border border-danger-200 bg-danger-50 p-4 font-mono text-sm leading-relaxed text-danger-700">
                {resultado.error}
              </p>
            )
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

      {!passouTudo && (
        <HintPanel key={exercise.id} hints={exercise.hints} onRevealedChange={setDicasAbertas} />
      )}
    </div>
  );
}

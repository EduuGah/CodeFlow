import { useEffect, useMemo, useRef, useState } from 'react';

import type { OrderStepsExercise } from '../../../content/types';
import type { ExerciseState, OnExerciseState } from '../../lib/exercise-state';
import { embaralhar, estaOrdenado, mover, primeiroErro } from '../../lib/ordenar';
import { useRecordAttempt } from '../../hooks/useRecordAttempt';
import { useFocusRescue } from '../../hooks/useFocusRescue';
import { useReportarEstado } from '../../hooks/useReportarEstado';
import { IconChevronDown } from '../ui/Icon';
import { MarkdownReader } from '../ui/MarkdownReader';
import { ExerciseAction, ExerciseFeedback } from './ExerciseAction';
import { HintPanel } from './HintPanel';

/**
 * Exercício de ordenar passos.
 *
 * ## Por que botões, e não arrastar
 *
 * Arrastar é o gesto óbvio e é a escolha errada aqui. Ele não funciona por
 * teclado sem uma implementação paralela inteira, é impreciso num dedo, e
 * disputa com a rolagem da página no celular — justamente onde a lista fica
 * mais alta que a tela.
 *
 * Dois botões por linha resolvem os três problemas de uma vez: funcionam por
 * toque, por mouse e por teclado sem nenhum caminho separado, e não competem
 * com a rolagem. O que se perde em elegância se ganha em ninguém ficar de fora.
 *
 * O foco acompanha o passo que se moveu. Sem isso, quem navega por teclado
 * aperta "descer" e o foco fica na posição antiga, agora ocupada por outro
 * passo — o segundo toque moveria o item errado.
 */
export function OrderSteps({
  exercise,
  lessonId,
  onEstado,
}: {
  exercise: OrderStepsExercise;
  lessonId: string;
  onEstado?: OnExerciseState;
}) {
  // A ordem inicial é semeada pelo id do exercício: a mesma toda vez que o
  // aluno abre, e garantidamente diferente da resposta.
  const inicial = useMemo(() => embaralhar(exercise.steps, exercise.id), [exercise]);

  const [arranjo, setArranjo] = useState(inicial);
  const [enviado, setEnviado] = useState(false);
  const [dicasAbertas, setDicasAbertas] = useState(0);
  /** A arrumação exata já registrada, para não gravar a mesma tentativa duas vezes. */
  const [ultimaRegistrada, setUltimaRegistrada] = useState<string | null>(null);
  /**
   * O que o leitor de tela anuncia depois de cada movimento.
   *
   * Sem isto, quem não vê a tela aperta o botão e não recebe nenhuma
   * confirmação: a lista mudou em silêncio. Anunciar a lista inteira também
   * não serve — seria insuportável. O que informa é a posição nova do passo
   * que acabou de se mexer.
   */
  const [anuncio, setAnuncio] = useState('');

  const registrar = useRecordAttempt();
  const acertou = estaOrdenado(arranjo);
  const quebra = primeiroErro(arranjo);

  const estado: ExerciseState = enviado
    ? acertou
      ? 'acertou'
      : 'errou'
    : arranjo.map((p) => p.id).join() === inicial.map((p) => p.id).join()
      ? 'inicial'
      : 'respondendo';

  useReportarEstado(estado, onEstado);

  const retornoRef = useRef<HTMLDivElement>(null);
  useFocusRescue(retornoRef, enviado && acertou);

  // Trocar de exercício reaproveita o componente: sem isto a arrumação anterior
  // continuaria na tela.
  useEffect(() => {
    setArranjo(inicial);
    setEnviado(false);
    setAnuncio('');
    setUltimaRegistrada(null);
    setDicasAbertas(0);
  }, [inicial]);

  /**
   * O foco precisa seguir o passo, não a posição.
   *
   * Guardamos qual botão reconquistar depois do render: sem isso, apertar
   * "descer" duas vezes moveria dois passos diferentes.
   */
  const focoPendente = useRef<string | null>(null);
  const botoesRef = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    if (focoPendente.current === null) return;
    botoesRef.current.get(focoPendente.current)?.focus();
    focoPendente.current = null;
  });

  const moverPasso = (indice: number, direcao: 'cima' | 'baixo') => {
    const proximo = mover(arranjo, indice, direcao);
    if (proximo === arranjo) return;

    const passo = arranjo[indice];
    const destino = direcao === 'cima' ? indice : indice + 2;

    focoPendente.current = `${passo.id}:${direcao}`;
    setArranjo(proximo);
    setAnuncio(`${passo.text}, posição ${destino} de ${arranjo.length}`);
    // Mexer na ordem invalida o retorno anterior: manter "correto" na tela
    // enquanto a sequência já é outra seria mentira.
    setEnviado(false);
  };

  const verificar = () => {
    setEnviado(true);

    const enviadoAgora = arranjo.map((p) => p.id).join();
    if (enviadoAgora === ultimaRegistrada) return;

    setUltimaRegistrada(enviadoAgora);
    registrar({
      exerciseId: exercise.id,
      lessonId,
      concepts: exercise.concepts,
      correct: acertou,
      hintsUsed: dicasAbertas,
    });
  };

  const travado = enviado && acertou;

  return (
    <section className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <h2 className="label-mono mb-3 text-brand-600">Coloque na ordem</h2>

      <div className="mb-4">
        <MarkdownReader content={exercise.prompt} />
      </div>

      <p className="label-mono mb-2 text-ink-faint">
        {arranjo.length} passos · use as setas para reordenar
      </p>

      {/* A região viva fica fora da lista: anunciar a lista inteira a cada
          movimento tornaria o exercício insuportável no leitor de tela. */}
      <p role="status" aria-live="polite" className="sr-only">
        {anuncio}
      </p>

      <ol className="space-y-2">
        {arranjo.map((passo, i) => {
          // Depois de verificar e errar, marcamos onde a sequência quebra —
          // apontar o ponto é pista; dizer quais estão errados entregaria o
          // gabarito por eliminação.
          const marcado = enviado && !acertou && i === quebra;

          return (
            <li
              key={passo.id}
              className={`flex items-stretch gap-2 rounded-lg border transition-colors ${
                travado
                  ? 'border-success-200 bg-success-50'
                  : marcado
                    ? 'border-energy-500 bg-energy-50'
                    : 'border-line bg-canvas'
              }`}
            >
              <span className="label-mono flex w-8 shrink-0 items-center justify-center text-ink-faint">
                {i + 1}
              </span>

              {/* Fonte de leitura, e não monoespaçada: os passos são frases, e
                  três linhas de mono no celular custam legibilidade sem
                  comunicar nada que o contexto já não diga. */}
              <span className="flex-1 self-center break-words py-3 pr-1 text-sm leading-relaxed text-ink">
                {passo.text}
              </span>

              {/* 44px de altura cada, que é o mínimo para o polegar. Dois
                  empilhados deixam a linha alta — é o preço de o exercício
                  funcionar por toque e por teclado com os mesmos controles. */}
              <span className="flex shrink-0 flex-col justify-center py-1">
                <button
                  type="button"
                  ref={(el) => {
                    if (el) botoesRef.current.set(`${passo.id}:cima`, el);
                    else botoesRef.current.delete(`${passo.id}:cima`);
                  }}
                  onClick={() => moverPasso(i, 'cima')}
                  disabled={i === 0 || travado}
                  aria-label={`Mover "${passo.text}" para cima`}
                  className="flex h-11 w-11 items-center justify-center rounded text-ink-soft transition-colors hover:bg-sunken disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <IconChevronDown size={16} className="rotate-180" />
                </button>
                <button
                  type="button"
                  ref={(el) => {
                    if (el) botoesRef.current.set(`${passo.id}:baixo`, el);
                    else botoesRef.current.delete(`${passo.id}:baixo`);
                  }}
                  onClick={() => moverPasso(i, 'baixo')}
                  disabled={i === arranjo.length - 1 || travado}
                  aria-label={`Mover "${passo.text}" para baixo`}
                  className="flex h-11 w-11 items-center justify-center rounded text-ink-soft transition-colors hover:bg-sunken disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <IconChevronDown size={16} />
                </button>
              </span>
            </li>
          );
        })}
      </ol>

      {!travado && (
        <ExerciseAction className="mt-4" onClick={verificar}>
          {enviado ? 'Verificar de novo' : 'Verificar ordem'}
        </ExerciseAction>
      )}

      {enviado && (
        <div className="mt-4">
          <ExerciseFeedback
            estado={acertou ? 'acertou' : 'errou'}
            titulo={
              acertou
                ? 'Sequência correta'
                : `A ordem quebra no passo ${quebra + 1}`
            }
            refDoBloco={retornoRef}
          >
            {acertou ? (
              <MarkdownReader
                content={exercise.explanation}
                className="prose-p:my-0 prose-p:text-sm prose-p:leading-relaxed"
              />
            ) : (
              <p className="text-sm leading-relaxed text-ink-soft">
                Esse passo não pode vir depois do anterior. Pergunte o que ele precisa que já
                tenha acontecido — e mova um dos dois.
              </p>
            )}
          </ExerciseFeedback>
        </div>
      )}

      {!travado && (
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

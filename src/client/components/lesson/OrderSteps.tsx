import { useEffect, useMemo, useRef, useState } from 'react';

import type { OrderStepsExercise } from '../../../content/types';
import type { ExerciseState, OnExerciseState } from '../../lib/exercise-state';
import {
  embaralhar,
  estaOrdenado,
  mover,
  moverPara,
  primeiroErro,
  textoDoPasso,
  trechosDoPasso,
} from '../../lib/ordenar';
import { useRecordAttempt } from '../../hooks/useRecordAttempt';
import { useFocusRescue } from '../../hooks/useFocusRescue';
import { useReportarEstado } from '../../hooks/useReportarEstado';
import { IconChevronDown, IconGrip } from '../ui/Icon';
import { Card, SectionLabel } from '../ui/Card';
import { MarkdownReader } from '../ui/MarkdownReader';
import { ExerciseAction, ExerciseFeedback } from './ExerciseAction';
import { HintPanel } from './HintPanel';

/**
 * Exercício de ordenar passos.
 *
 * ## Arrastar e setas, os dois
 *
 * A primeira versão só tinha as setas, por três motivos reais: arrastar não
 * funciona por teclado, é impreciso no dedo, e disputa com a rolagem da
 * página no celular. O que ela não previu foi o aluno procurar o gesto e
 * não encontrar — "não tem como arrastar" foi a primeira reclamação de quem
 * usou. O gesto óbvio precisa existir.
 *
 * Então os dois convivem, e cada um resolve o que o outro não resolve. A
 * pega (⋮⋮) à esquerda arrasta com mouse ou dedo — só ela tem
 * `touch-action: none`, então o resto da linha continua rolando a página. As
 * setas continuam para quem usa teclado ou leitor de tela, e para quem
 * prefere precisão. Nada de HTML5 drag-and-drop: ele não dispara em toque.
 *
 * Durante o arrasto a lista se reorganiza ao vivo: quando o ponteiro cruza
 * o meio de outro passo, o arrastado toma o lugar dele. Sem sombras nem
 * transformações — o passo simplesmente muda de posição, que é o que o
 * aluno quer ver.
 *
 * O foco acompanha o passo que se moveu pelas setas. Sem isso, quem navega
 * por teclado aperta "descer" e o foco fica na posição antiga, agora ocupada
 * por outro passo — o segundo toque moveria o item errado.
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
  /** O id do passo sendo arrastado, enquanto o ponteiro está apertado. */
  const [arrastando, setArrastando] = useState<string | null>(null);
  /**
   * O meio de cada um dos outros passos, medido quando o arrasto começa.
   *
   * A lista reorganiza ao vivo, e os passos têm alturas diferentes — um de
   * duas linhas trocado com um de uma muda todas as fronteiras. Decidir o
   * destino contra a geometria do início, e não contra a atual, é o que
   * impede o passo de ir e voltar no mesmo movimento.
   */
  const meiosNoInicio = useRef<number[]>([]);

  const registrar = useRecordAttempt();
  const acertou = estaOrdenado(arranjo);
  const quebra = primeiroErro(arranjo);
  const travado = enviado && acertou;

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
    setArrastando(null);
  }, [inicial]);

  /**
   * O foco precisa seguir o passo, não a posição.
   *
   * Guardamos qual botão reconquistar depois do render: sem isso, apertar
   * "descer" duas vezes moveria dois passos diferentes.
   */
  const focoPendente = useRef<string | null>(null);
  const botoesRef = useRef(new Map<string, HTMLButtonElement>());
  const itensRef = useRef(new Map<string, HTMLLIElement>());

  useEffect(() => {
    if (focoPendente.current === null) return;
    botoesRef.current.get(focoPendente.current)?.focus();
    focoPendente.current = null;
  });

  const anunciarPosicao = (id: string, posicao: number) => {
    const passo = arranjo.find((p) => p.id === id) ?? exercise.steps.find((p) => p.id === id);
    if (passo) setAnuncio(`${textoDoPasso(passo.text)}, posição ${posicao} de ${arranjo.length}`);
  };

  const moverPasso = (indice: number, direcao: 'cima' | 'baixo') => {
    const proximo = mover(arranjo, indice, direcao);
    if (proximo === arranjo) return;

    const passo = arranjo[indice];
    const destino = direcao === 'cima' ? indice : indice + 2;

    focoPendente.current = `${passo.id}:${direcao}`;
    setArranjo(proximo);
    setAnuncio(`${textoDoPasso(passo.text)}, posição ${destino} de ${arranjo.length}`);
    // Mexer na ordem invalida o retorno anterior: manter "correto" na tela
    // enquanto a sequência já é outra seria mentira.
    setEnviado(false);
  };

  /**
   * O arrasto, do ponteiro apertado até solto.
   *
   * A cada movimento, o destino é a posição cujo passo tem o meio abaixo do
   * ponteiro — o primeiro que o ponteiro ainda não ultrapassou. Quando muda,
   * a lista já reorganiza; ao soltar, não há mais nada a fazer além de
   * anunciar onde o passo ficou.
   */
  const comecarArrasto = (id: string) => (evento: React.PointerEvent<HTMLElement>) => {
    if (travado) return;
    // Sem isto o arrasto seleciona o texto dos passos pelo caminho.
    evento.preventDefault();
    meiosNoInicio.current = arranjo
      .filter((p) => p.id !== id)
      .map((p) => itensRef.current.get(p.id)?.getBoundingClientRect())
      .filter((caixa): caixa is DOMRect => !!caixa)
      .map((caixa) => caixa.top + caixa.height / 2);
    setArrastando(id);
  };

  /**
   * Enquanto um passo está sendo arrastado, o movimento e o soltar são
   * ouvidos na janela, não na pega.
   *
   * A captura de ponteiro (`setPointerCapture`) seria o jeito canônico — e
   * foi a primeira versão. Só que a lista reorganiza ao vivo, e reordenar é
   * tirar o elemento do documento e pô-lo de volta: o navegador solta a
   * captura nesse instante, e o resto do movimento ia para o passo que
   * estivesse embaixo do ponteiro. Ouvir na janela não depende de onde a
   * pega está.
   */
  const arranjoRef = useRef(arranjo);
  arranjoRef.current = arranjo;

  useEffect(() => {
    if (arrastando === null) return;
    const id = arrastando;

    const mover = (evento: PointerEvent) => {
      // O destino é quantos dos outros passos o ponteiro já ultrapassou.
      const para = meiosNoInicio.current.filter((meio) => evento.clientY > meio).length;
      const de = arranjoRef.current.findIndex((p) => p.id === id);
      if (de === -1 || de === para) return;
      setArranjo(moverPara(arranjoRef.current, de, para));
      setEnviado(false);
    };
    const soltar = () => {
      setArrastando(null);
      const posicao = arranjoRef.current.findIndex((p) => p.id === id) + 1;
      anunciarPosicao(id, posicao);
    };

    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', soltar);
    return () => {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('pointercancel', soltar);
    };
    // `anunciarPosicao` lê o arranjo do momento; o efeito só precisa renascer
    // quando o arrasto começa ou termina.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrastando]);

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

  return (
    <Card as="section">
      <SectionLabel tone="brand" className="mb-3">
        Coloque na ordem
      </SectionLabel>

      <div className="mb-4">
        <MarkdownReader content={exercise.prompt} />
      </div>

      {/* A instrução diz o que "ordem" significa aqui — o primeiro em cima — e
          como mexer. A versão anterior dizia só "use as setas", e a pessoa
          ficava sem saber se a lista lia de cima para baixo. */}
      <p className="mb-3 text-sm leading-relaxed text-ink-soft">
        Os passos estão fora de ordem. Arrume-os de cima para baixo — o que acontece{' '}
        <strong className="font-semibold text-ink">primeiro fica no topo</strong>. Arraste pela pega{' '}
        <IconGrip size={14} className="inline-block align-[-2px] text-ink-faint" aria-hidden /> ou use as
        setas.
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
          const emArrasto = arrastando === passo.id;

          return (
            <li
              key={passo.id}
              ref={(el) => {
                if (el) itensRef.current.set(passo.id, el);
                else itensRef.current.delete(passo.id);
              }}
              className={`flex items-stretch gap-1 rounded-lg border transition-colors ${
                emArrasto
                  ? 'border-brand-500 bg-brand-50 shadow-md'
                  : travado
                    ? 'border-success-200 bg-success-50'
                    : marcado
                      ? 'border-energy-500 bg-energy-50'
                      : 'border-line bg-canvas'
              }`}
            >
              {/* A pega: só ela captura o toque, então a página continua
                  rolando pelo resto da linha. `touch-action: none` é o que
                  faz o dedo arrastar em vez de rolar. */}
              <span
                onPointerDown={comecarArrasto(passo.id)}
                aria-hidden
                className={`flex w-9 shrink-0 select-none items-center justify-center rounded-l-lg text-ink-faint ${
                  travado ? '' : 'cursor-grab touch-none hover:bg-sunken active:cursor-grabbing'
                }`}
              >
                <IconGrip size={16} />
              </span>

              <span className="label-mono flex w-6 shrink-0 items-center justify-center text-ink-faint">
                {i + 1}
              </span>

              {/* Fonte de leitura, e não monoespaçada: os passos são frases, e
                  três linhas de mono no celular custam legibilidade sem
                  comunicar nada que o contexto já não diga. */}
              <span className="flex-1 self-center break-words py-3 pl-1 pr-1 text-sm leading-relaxed text-ink">
                {trechosDoPasso(passo.text).map((trecho, j) =>
                  j % 2 === 1 ? (
                    <code
                      key={j}
                      className="rounded-md bg-sunken px-1.5 py-0.5 font-mono text-[0.85em]"
                    >
                      {trecho}
                    </code>
                  ) : (
                    <span key={j}>{trecho}</span>
                  )
                )}
              </span>

              {/* 44px de altura cada, que é o mínimo para o polegar. Dois
                  empilhados deixam a linha alta — é o preço de o exercício
                  funcionar por teclado com os mesmos controles. */}
              <span className="flex shrink-0 flex-col justify-center py-1">
                <button
                  type="button"
                  ref={(el) => {
                    if (el) botoesRef.current.set(`${passo.id}:cima`, el);
                    else botoesRef.current.delete(`${passo.id}:cima`);
                  }}
                  onClick={() => moverPasso(i, 'cima')}
                  disabled={i === 0 || travado}
                  aria-label={`Mover "${textoDoPasso(passo.text)}" para cima`}
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
                  aria-label={`Mover "${textoDoPasso(passo.text)}" para baixo`}
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
                O passo {quebra + 1} não pode vir logo depois do passo {quebra}. Pergunte o que
                ele precisa que já tenha acontecido — e mova um dos dois.
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
    </Card>
  );
}

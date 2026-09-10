import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { getLesson, getLessonAfter } from '../../content';
import { LANGUAGE_LABELS } from '../../content/types';
import { useAuth } from '../contexts/AuthContext';
import { fetchProgress, fetchSolvedExercises, markLessonCompleted } from '../lib/progress';
import { buildLessonSteps } from '../lib/lesson-steps';
import {
  estaResolvido,
  pendentes,
  rotuloDeAvanco,
  type ExerciseState,
} from '../lib/exercise-state';
import { celebrar } from '../lib/celebrar';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { CodeExerciseStep } from '../components/lesson/CodeExerciseStep';
import { FillBlank } from '../components/lesson/FillBlank';
import { FindBug } from '../components/lesson/FindBug';
import { LessonBlocks } from '../components/lesson/LessonBlocks';
import { MultipleChoice } from '../components/lesson/MultipleChoice';
import { OrderSteps } from '../components/lesson/OrderSteps';
import { PredictOutput } from '../components/lesson/PredictOutput';
import { Refactor } from '../components/lesson/Refactor';
import { WriteTest } from '../components/lesson/WriteTest';
import { MarkdownReader } from '../components/ui/MarkdownReader';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconCheckCircle,
  IconClose,
  IconTarget,
} from '../components/ui/Icon';

/**
 * Aula em passos.
 *
 * A versão anterior era uma página só: todo o conteúdo de uma vez, em
 * split-screen de altura fixa. No celular virava uma rolagem longa sem
 * referência de onde se estava, e o editor ficava com poucos centímetros.
 *
 * Agora é um passo por vez, com a barra de progresso mostrando quanto falta
 * **dentro da aula**. Essa é a mudança que dá a sensação de avanço mesmo num
 * conceito difícil: o aluno fecha etapas pequenas em vez de encarar um bloco.
 *
 * O avanço nunca é travado. Quem quiser pular um exercício e voltar depois
 * pode — bloquear seria transformar dificuldade em parede.
 *
 * ## O estado das atividades
 *
 * A aula não adivinha se um exercício foi resolvido: cada componente reporta o
 * próprio estado por `onEstado`, e o mapa abaixo é a única fonte de verdade.
 *
 * Antes eram duas coisas frouxas — uma prop `onSolved` que só dois dos quatro
 * tipos recebiam, e uma conclusão de aula disparada pelo **primeiro** exercício
 * resolvido. O efeito na tela era o aluno acertar uma múltipla escolha e o
 * rodapé continuar oferecendo "Pular por ora", ou resolver um exercício de nove
 * passos e ver o confete de aula concluída ali mesmo.
 *
 * Trocar de passo move o foco para o conteúdo. Sem isso o botão "Continuar"
 * fica no rodapé com o foco parado nele enquanto a tela toda mudou acima: quem
 * navega por teclado ou leitor de tela não tem como saber o que apareceu, e a
 * rolagem ainda estaria no meio do passo anterior.
 */
export function Lesson() {
  const { id } = useParams();
  const { user } = useAuth();

  const lesson = id ? getLesson(id) : undefined;
  const steps = useMemo(() => (lesson ? buildLessonSteps(lesson) : []), [lesson]);

  const exerciseIds = useMemo(
    () => steps.flatMap((p) => (p.kind === 'exercise' ? [p.exercise.id] : [])),
    [steps]
  );

  useDocumentTitle(lesson?.title);

  const [indice, setIndice] = useState(0);
  const conteudoRef = useRef<HTMLElement>(null);
  // O primeiro passo não move o foco: roubar o foco de quem acabou de chegar na
  // página é pior do que deixá-lo no começo do documento.
  const montado = useRef(false);
  const [estados, setEstados] = useState<Map<string, ExerciseState>>(new Map());
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  /**
   * Trocar de aula reaproveita o componente, então o passo atual precisa voltar
   * para o começo. Isto acontece **durante o render**, não num efeito.
   *
   * Num efeito, era tela branca: `/lesson/a` → `/lesson/b` troca o parâmetro e
   * renderiza a aula nova imediatamente, enquanto `indice` ainda guarda o passo
   * da aula anterior. Quem terminava a aula 1 (nove passos) e ia para a 2 (oito)
   * caía em `steps[8]`, que é `undefined`, e a página inteira quebrava em
   * `passo.kind`. O aluno via branco e só recuperava recarregando.
   *
   * O padrão do React para isto é ajustar o estado no render: o React descarta
   * a saída e refaz o render na hora, antes de pintar.
   */
  const [aulaRenderizada, setAulaRenderizada] = useState(id);
  if (aulaRenderizada !== id) {
    setAulaRenderizada(id);
    setIndice(0);
    setEstados(new Map());
  }

  useEffect(() => {
    if (!montado.current) {
      montado.current = true;
      return;
    }

    conteudoRef.current?.focus();
    // O passo novo começa do começo. Sem isto, sair de um passo longo de leitura
    // deixa o passo seguinte já rolado até o meio.
    window.scrollTo({ top: 0 });
  }, [indice]);

  const userId = user?.id;
  const lessonId = lesson?.id;

  /*
   * As dependências são os identificadores, não os objetos.
   *
   * `useAuth()` devolve um objeto de contexto novo a cada render; depender dele
   * fazia este efeito rodar sempre, e cada volta produzia um array novo em
   * `setCompletedLessons` — estado novo, render novo, efeito de novo. Laço.
   * Pelo mesmo motivo os dois `setState` abaixo devolvem o valor anterior
   * quando nada mudou.
   */
  useEffect(() => {
    let ativo = true;
    if (!userId || !lessonId) return;

    // A lista do servidor entra **somada** ao que já está na tela. Sobrescrever
    // apagava uma conclusão feita enquanto esta leitura estava no ar.
    fetchProgress(userId).then((p) => {
      if (!ativo) return;

      setCompletedLessons((atuais) => {
        const novos = p.completedLessons.filter((id) => !atuais.includes(id));
        return novos.length === 0 ? atuais : [...atuais, ...novos];
      });
    });

    // O que o aluno já resolveu nesta aula em visitas anteriores. Sem isto ele
    // teria que refazer tudo numa sessão só para a aula fechar.
    fetchSolvedExercises(userId, lessonId).then((resolvidos) => {
      if (!ativo) return;

      setEstados((atual) => {
        const novos = resolvidos.filter((id) => !atual.has(id));
        if (novos.length === 0) return atual;

        const proximo = new Map(atual);
        for (const exerciseId of novos) proximo.set(exerciseId, 'acertou');
        return proximo;
      });
    });

    return () => {
      ativo = false;
    };
  }, [userId, lessonId]);

  /**
   * Guarda o estado reportado por um exercício.
   *
   * Devolver o mesmo mapa quando nada mudou faz o React descartar o render: sem
   * isso, um componente que reporta o mesmo estado a cada render entraria em
   * laço.
   */
  const registrarEstado = useCallback((exerciseId: string, estado: ExerciseState) => {
    setEstados((atual) => {
      if (atual.get(exerciseId) === estado) return atual;
      return new Map(atual).set(exerciseId, estado);
    });
  }, []);

  const jaConcluida = lesson ? completedLessons.includes(lesson.id) : false;
  const faltando = pendentes(exerciseIds, estados);
  const tudoResolvido = exerciseIds.length > 0 && faltando.length === 0;

  /**
   * Conclusão da aula: todos os exercícios resolvidos.
   *
   * Antes bastava o primeiro. A aula ficava marcada como feita com um quinto do
   * trabalho entregue, e a maior recompensa do produto — o confete — caía no
   * meio do caminho, deixando o fim da aula sem nada.
   */
  useEffect(() => {
    if (!lessonId || !tudoResolvido || jaConcluida) return;

    celebrar('aula');
    setCompletedLessons((ids) => (ids.includes(lessonId) ? ids : [...ids, lessonId]));

    // Visitante sem sessão conclui a aula na tela; só não gera histórico.
    if (!userId) return;

    markLessonCompleted(userId, lessonId).catch((erro) => {
      console.error('Falha ao salvar progresso da aula:', erro);
    });
  }, [lessonId, tudoResolvido, jaConcluida, userId]);

  if (!lesson || steps.length === 0) {
    return <Navigate to="/app" replace />;
  }

  // Trava de segurança: nenhum índice fora da faixa pode virar tela branca no
  // meio de uma aula. O ajuste no render já resolve a troca de aula; isto cobre
  // qualquer caminho que ainda venha a errar a conta.
  const posicao = Math.min(Math.max(indice, 0), steps.length - 1);
  const passo = steps[posicao];
  const ultimo = posicao === steps.length - 1;
  const proximaAula = getLessonAfter(lesson.id);

  const estadoDoPasso = passo.kind === 'exercise' ? estados.get(passo.exercise.id) : undefined;
  const resolvido = estaResolvido(estadoDoPasso);

  const avancar = () => setIndice((i) => Math.min(i + 1, steps.length - 1));
  const voltar = () => setIndice((i) => Math.max(i - 1, 0));

  /** Leva ao primeiro exercício que ficou para trás. */
  const irParaPendente = () => {
    const alvo = steps.findIndex((p) => p.kind === 'exercise' && p.exercise.id === faltando[0]);
    if (alvo !== -1) setIndice(alvo);
  };

  return (
    <div className="rolagem-com-barras flex min-h-screen flex-col bg-canvas">
      {/* Cabeçalho fixo: a barra de progresso precisa ficar visível durante a
          rolagem, porque é ela que responde "quanto falta". */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            to="/app"
            aria-label="Sair da aula"
            className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-sunken hover:text-ink"
          >
            <IconClose size={20} />
          </Link>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{lesson.title}</p>
            {/* O próprio contador é a região viva: duplicá-lo num span oculto
                faria o leitor de tela anunciar a mesma informação duas vezes. */}
            <p className="label-mono text-ink-faint" aria-live="polite">
              Passo {posicao + 1} de {steps.length} · {LANGUAGE_LABELS[lesson.language]}
            </p>
          </div>

          {/* Quantos exercícios já fecharam. É a resposta a "quanto falta para
              esta aula contar", que a barra de passos sozinha não dá — oito
              passos de leitura e um exercício não são oito nonos de aprendizado. */}
          {exerciseIds.length > 0 && (
            <p
              className="label-mono shrink-0 text-ink-faint"
              aria-label={`${exerciseIds.length - faltando.length} de ${exerciseIds.length} exercícios resolvidos`}
            >
              <IconCheck size={13} className="mr-1 inline align-[-1px]" />
              {exerciseIds.length - faltando.length}/{exerciseIds.length}
            </p>
          )}
        </div>

        <div
          role="progressbar"
          aria-valuenow={posicao + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-label="Progresso da aula"
          className="h-1 w-full bg-sunken"
        >
          <div
            className="h-full bg-brand-500 transition-[width] duration-300"
            style={{ width: `${((posicao + 1) / steps.length) * 100}%` }}
          />
        </div>
      </header>

      {/* `tabIndex={-1}` torna o conteúdo alvo de foco por script sem entrar na
          ordem de tabulação. O anel fica suprimido porque um contorno em volta de
          toda a área de conteúdo lê como falha de renderização, não como pista:
          o indicador que orienta é o dos controles dentro dela. */}
      <main
        ref={conteudoRef}
        tabIndex={-1}
        aria-label={`Passo ${posicao + 1} de ${steps.length}`}
        className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-6 focus-visible:outline-none"
      >
        {posicao === 0 && (
          <p className="mb-5 flex items-start gap-2 rounded-lg bg-brand-50 p-3 text-sm leading-relaxed text-brand-700">
            <IconTarget size={17} className="mt-0.5 shrink-0" />
            {lesson.objective}
          </p>
        )}

        {passo.kind === 'reading' && <LessonBlocks blocks={passo.blocks} lessonId={lesson.id} />}

        {passo.kind === 'summary' && (
          <div className="space-y-5">
            <div className="rounded-xl border border-line bg-surface p-5">
              <h2 className="label-mono mb-2 text-ink-faint">Em resumo</h2>
              <MarkdownReader content={passo.markdown} />
            </div>

            {/* O fecho diz o que de fato aconteceu. A versão anterior afirmava
                "Aula concluída — seu progresso foi salvo" para todo mundo,
                inclusive para quem tinha pulado todos os exercícios e não tinha
                salvo nada. */}
            {tudoResolvido || jaConcluida ? (
              <div className="rounded-xl border border-success-200 bg-success-50 p-5 text-center">
                <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-success-600 text-white">
                  <IconCheckCircle size={24} />
                </span>
                <p className="font-bold text-success-700">Aula concluída</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {proximaAula
                    ? 'Seu progresso foi salvo. A próxima aula continua daqui.'
                    : 'Você chegou ao fim desta trilha.'}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-energy-200 bg-energy-50 p-5">
                <p className="font-bold text-energy-700">
                  {faltando.length === 1
                    ? 'Falta 1 exercício para fechar esta aula'
                    : `Faltam ${faltando.length} exercícios para fechar esta aula`}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  Você leu a aula até o fim — isso já vale. Mas ela só entra no seu progresso
                  quando os exercícios estiverem resolvidos, porque é neles que o conceito sai
                  do texto e vira coisa que você sabe fazer.
                </p>
                <button
                  type="button"
                  onClick={irParaPendente}
                  className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 font-bold text-white transition-colors hover:bg-brand-700 active:translate-y-px"
                >
                  Voltar ao exercício que ficou
                  <IconArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {passo.kind === 'exercise' && passo.exercise.type === 'code' && (
          <CodeExerciseStep
            exercise={passo.exercise}
            lessonId={lesson.id}
            language={lesson.language}
            onEstado={(estado) => registrarEstado(passo.exercise.id, estado)}
          />
        )}

        {passo.kind === 'exercise' && passo.exercise.type === 'fill-blank' && (
          <FillBlank
            exercise={passo.exercise}
            lessonId={lesson.id}
            onEstado={(estado) => registrarEstado(passo.exercise.id, estado)}
          />
        )}

        {passo.kind === 'exercise' && passo.exercise.type === 'multiple-choice' && (
          <MultipleChoice
            exercise={passo.exercise}
            lessonId={lesson.id}
            onEstado={(estado) => registrarEstado(passo.exercise.id, estado)}
          />
        )}

        {passo.kind === 'exercise' && passo.exercise.type === 'order-steps' && (
          <OrderSteps
            exercise={passo.exercise}
            lessonId={lesson.id}
            onEstado={(estado) => registrarEstado(passo.exercise.id, estado)}
          />
        )}

        {passo.kind === 'exercise' && passo.exercise.type === 'refactor' && (
          <Refactor
            exercise={passo.exercise}
            lessonId={lesson.id}
            language={lesson.language}
            onEstado={(estado) => registrarEstado(passo.exercise.id, estado)}
          />
        )}

        {passo.kind === 'exercise' && passo.exercise.type === 'find-bug' && (
          <FindBug
            exercise={passo.exercise}
            lessonId={lesson.id}
            onEstado={(estado) => registrarEstado(passo.exercise.id, estado)}
          />
        )}

        {passo.kind === 'exercise' && passo.exercise.type === 'write-test' && (
          <WriteTest
            exercise={passo.exercise}
            lessonId={lesson.id}
            language={lesson.language}
            onEstado={(estado) => registrarEstado(passo.exercise.id, estado)}
          />
        )}

        {passo.kind === 'exercise' && passo.exercise.type === 'predict-output' && (
          <PredictOutput
            exercise={passo.exercise}
            lessonId={lesson.id}
            onEstado={(estado) => registrarEstado(passo.exercise.id, estado)}
          />
        )}
      </main>

      {/* Rodapé fixo: no celular a ação principal precisa estar no polegar, não
          no fim de uma rolagem que muda de tamanho a cada passo. */}
      <footer className="sticky bottom-0 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={voltar}
            disabled={posicao === 0}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors hover:bg-sunken disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label="Passo anterior"
          >
            <IconArrowLeft size={20} />
          </button>

          {ultimo ? (
            <Link
              to={proximaAula ? `/lesson/${proximaAula.id}` : '/app'}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 font-bold text-white transition-colors hover:bg-brand-700"
            >
              {proximaAula ? 'Próxima aula' : 'Voltar ao início'}
              <IconArrowRight size={18} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={avancar}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 font-bold text-white transition-colors hover:bg-brand-700 active:translate-y-px"
            >
              {/* Um check antes do rótulo, e não um botão verde: verde já quer
                  dizer "você acertou" no retorno do exercício, e repetir a cor
                  num controle faria a mesma cor significar duas coisas. */}
              {resolvido && <IconCheck size={17} />}
              {passo.kind === 'exercise' ? rotuloDeAvanco(estadoDoPasso) : 'Continuar'}
              <IconArrowRight size={18} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

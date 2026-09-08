import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';

import { getLesson, getNextLesson } from '../../content';
import { LANGUAGE_LABELS } from '../../content/types';
import { useAuth } from '../contexts/AuthContext';
import { fetchProgress, markLessonCompleted } from '../lib/progress';
import { buildLessonSteps } from '../lib/lesson-steps';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { CodeExerciseStep } from '../components/lesson/CodeExerciseStep';
import { LessonBlocks } from '../components/lesson/LessonBlocks';
import { MultipleChoice } from '../components/lesson/MultipleChoice';
import { PredictOutput } from '../components/lesson/PredictOutput';
import { MarkdownReader } from '../components/ui/MarkdownReader';
import {
  IconArrowLeft,
  IconArrowRight,
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

  useDocumentTitle(lesson?.title);

  const [indice, setIndice] = useState(0);
  const conteudoRef = useRef<HTMLElement>(null);
  // O primeiro passo não move o foco: roubar o foco de quem acabou de chegar na
  // página é pior do que deixá-lo no começo do documento.
  const montado = useRef(false);
  const [resolvidos, setResolvidos] = useState<Set<string>>(new Set());
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Trocar de aula reaproveita o componente: sem isto o passo atual persistiria.
  useEffect(() => {
    setIndice(0);
    setResolvidos(new Set());
  }, [id]);

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

  useEffect(() => {
    let ativo = true;
    if (!user) return;

    fetchProgress(user.id).then((p) => {
      if (ativo) setCompletedLessons(p.completedLessons);
    });

    return () => {
      ativo = false;
    };
  }, [user]);

  if (!lesson || steps.length === 0) {
    return <Navigate to="/app" replace />;
  }

  const passo = steps[indice];
  const ultimo = indice === steps.length - 1;
  const jaConcluida = completedLessons.includes(lesson.id);
  const proximaAula = getNextLesson(lesson.trackId, [...completedLessons, lesson.id]);

  const concluir = async () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2b8078', '#d99422', '#2f8f4e'],
    });

    setCompletedLessons((ids) => (ids.includes(lesson.id) ? ids : [...ids, lesson.id]));

    if (user) {
      try {
        await markLessonCompleted(user.id, lesson.id);
      } catch (erro) {
        console.error('Falha ao salvar progresso da aula:', erro);
      }
    }
  };

  const marcarResolvido = (exerciseId: string) => {
    setResolvidos((atual) => new Set(atual).add(exerciseId));
    if (!jaConcluida) void concluir();
  };

  const avancar = () => setIndice((i) => Math.min(i + 1, steps.length - 1));
  const voltar = () => setIndice((i) => Math.max(i - 1, 0));

  return (
    <div className="rolagem-com-barras flex min-h-screen flex-col bg-canvas">
      {/* Cabeçalho fixo: a barra de progresso precisa ficar visível durante a
          rolagem, porque é ela que responde "quanto falta". */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            to="/app"
            aria-label="Sair da aula"
            className="-ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-sunken hover:text-ink"
          >
            <IconClose size={20} />
          </Link>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{lesson.title}</p>
            {/* O próprio contador é a região viva: duplicá-lo num span oculto
                faria o leitor de tela anunciar a mesma informação duas vezes. */}
            <p className="label-mono text-ink-faint" aria-live="polite">
              Passo {indice + 1} de {steps.length} · {LANGUAGE_LABELS[lesson.language]}
            </p>
          </div>
        </div>

        <div
          role="progressbar"
          aria-valuenow={indice + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-label="Progresso da aula"
          className="h-1 w-full bg-sunken"
        >
          <div
            className="h-full bg-brand-500 transition-[width] duration-300"
            style={{ width: `${((indice + 1) / steps.length) * 100}%` }}
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
        aria-label={`Passo ${indice + 1} de ${steps.length}`}
        className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 focus-visible:outline-none"
      >
        {indice === 0 && (
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

            <div className="rounded-xl border border-success-200 bg-success-50 p-5 text-center">
              <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-success-600 text-white">
                <IconCheckCircle size={24} />
              </span>
              <p className="font-bold text-success-700">Aula concluída</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                {proximaAula && proximaAula.id !== lesson.id
                  ? 'Seu progresso foi salvo. A próxima aula continua daqui.'
                  : 'Você chegou ao fim desta trilha.'}
              </p>
            </div>
          </div>
        )}

        {passo.kind === 'exercise' && passo.exercise.type === 'code' && (
          <CodeExerciseStep
            exercise={passo.exercise}
            lessonId={lesson.id}
            language={lesson.language}
            onSolved={() => marcarResolvido(passo.exercise.id)}
          />
        )}

        {passo.kind === 'exercise' && passo.exercise.type === 'multiple-choice' && (
          <MultipleChoice exercise={passo.exercise} lessonId={lesson.id} />
        )}

        {passo.kind === 'exercise' && passo.exercise.type === 'predict-output' && (
          <PredictOutput exercise={passo.exercise} lessonId={lesson.id} />
        )}
      </main>

      {/* Rodapé fixo: no celular a ação principal precisa estar no polegar, não
          no fim de uma rolagem que muda de tamanho a cada passo. */}
      <footer className="sticky bottom-0 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={voltar}
            disabled={indice === 0}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors hover:bg-sunken disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label="Passo anterior"
          >
            <IconArrowLeft size={20} />
          </button>

          {ultimo ? (
            <Link
              to={proximaAula && proximaAula.id !== lesson.id ? `/lesson/${proximaAula.id}` : '/app'}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-ink font-bold text-white transition-colors hover:bg-brand-900"
            >
              {proximaAula && proximaAula.id !== lesson.id ? 'Próxima aula' : 'Voltar ao início'}
              <IconArrowRight size={18} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={avancar}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-ink font-bold text-white transition-colors hover:bg-brand-900 active:translate-y-px"
            >
              {passo.kind === 'exercise' && !resolvidos.has(passo.id) ? 'Pular por ora' : 'Continuar'}
              <IconArrowRight size={18} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

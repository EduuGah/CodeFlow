import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { localizarExercicio } from '../../content';
import { useStudentData } from '../contexts/StudentDataContext';
import { INTERVALOS_DO_CADERNO, sessaoDeRefazer, type EntradaDoCaderno } from '../lib/caderno';
import { avancoLiberado, rotuloDeAvanco, type ExerciseState } from '../lib/exercise-state';
import { ExercicioDoPasso } from '../components/lesson/ExercicioDoPasso';
import { Button, buttonClasses } from '../components/ui/Button';
import { IconArrowRight, IconCheck, IconClose, IconSpinner } from '../components/ui/Icon';
import { VinhetaAlvo } from '../components/ui/Ilustracao';
import { EmptyState } from '../components/ui/States';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/**
 * Refazer o que se errou: os exercícios do caderno, um de cada vez, com os
 * mesmos componentes da aula.
 *
 * Tela de foco, como a aula e a revisão: sem a navegação do aplicativo. A
 * fila é tirada uma vez, na entrada — o histórico que chega no meio (cada
 * resposta daqui grava uma tentativa) não reembaralha a sessão. O caderno se
 * atualiza ao voltar para ele, quando o aplicativo relê o histórico.
 *
 * Como na aula, não há "pular": avança quem respondeu, certo ou errado. Sair
 * é o botão do canto.
 */
export function Refazer() {
  useDocumentTitle('Refazer erros');
  const { loading, caderno } = useStudentData();
  const [params] = useSearchParams();
  const pedido = params.get('exercicio');

  const [sessao, setSessao] = useState<EntradaDoCaderno[] | null>(null);
  const [indice, setIndice] = useState(0);
  const [estados, setEstados] = useState<ReadonlyMap<string, ExerciseState>>(new Map());
  const conteudoRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (loading || sessao !== null) return;
    setSessao(sessaoDeRefazer(caderno, pedido, (id) => localizarExercicio(id) !== undefined));
  }, [loading, sessao, caderno, pedido]);

  // O foco acompanha o exercício novo, como na aula: sem isto, quem navega por
  // teclado fica no botão do rodapé, abaixo de um conteúdo que trocou inteiro.
  useEffect(() => {
    if (indice > 0) conteudoRef.current?.focus();
  }, [indice]);

  if (sessao === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas" role="status" aria-label="Carregando">
        <IconSpinner size={32} className="animate-spin text-ink-faint" />
      </div>
    );
  }

  const terminou = indice >= sessao.length;
  const atual = terminou ? undefined : sessao[indice];
  const local = atual ? localizarExercicio(atual.exerciseId) : undefined;
  const estadoAtual = atual ? estados.get(atual.exerciseId) : undefined;
  const acertos = sessao.filter((e) => estados.get(e.exerciseId) === 'acertou').length;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-10 border-b border-line bg-surface">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center gap-3 px-4">
          <Link
            to="/app/praticar/erros"
            aria-label="Sair e voltar ao caderno"
            className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-sunken hover:text-ink"
          >
            <IconClose size={20} />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-bold text-ink">Refazer erros</h1>
            {local && <p className="label-mono truncate text-ink-faint">{local.lesson.title}</p>}
          </div>
          <p className="label-mono shrink-0 text-ink-faint" aria-live="polite">
            {sessao.length === 0 || terminou ? 'Concluído' : `${indice + 1} de ${sessao.length}`}
          </p>
        </div>
      </header>

      <main
        ref={conteudoRef}
        tabIndex={-1}
        className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-6 outline-none"
      >
        {sessao.length === 0 ? (
          <EmptyState
            vinheta={<VinhetaAlvo size={48} />}
            title="Nada para refazer agora"
            description="Os erros consertados voltam na data marcada para você confirmar que ficou. Até lá, siga pelas trilhas."
            action={
              <Link to="/app/praticar/erros" className={buttonClasses({ size: 'sm' })}>
                Voltar ao caderno
              </Link>
            }
          />
        ) : terminou ? (
          <div className="mx-auto max-w-md space-y-6 pt-6 text-center">
            <div className="animar-pop mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-success-50" aria-hidden>
              <VinhetaAlvo size={60} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink">Sessão concluída</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">
                {acertos === sessao.length
                  ? `Você acertou ${sessao.length === 1 ? 'o exercício' : `os ${sessao.length}`}.`
                  : `Você acertou ${acertos} de ${sessao.length}.`}{' '}
                {acertos > 0
                  ? `Cada acerto volta em ${INTERVALOS_DO_CADERNO[0]} dias para confirmar — é o espaçamento que mostra que ficou.`
                  : 'Os que não passaram continuam no topo do caderno.'}
              </p>
            </div>
            <Link to="/app/praticar/erros" className={buttonClasses({ size: 'lg', block: true })}>
              Voltar ao caderno
            </Link>
          </div>
        ) : (
          atual &&
          local && (
            <>
              <p className="text-sm text-ink-soft">
                {atual.vezesErrado === 1
                  ? 'Você errou este exercício uma vez.'
                  : `Você errou este exercício ${atual.vezesErrado} vezes.`}{' '}
                {atual.estado === 'pendente' ? 'Com calma: o que mudou desde então?' : 'Revisão: confira que ficou.'}
              </p>
              <ExercicioDoPasso
                key={atual.exerciseId}
                exercise={local.exercise}
                lessonId={local.lesson.id}
                language={local.lesson.language}
                onEstado={(estado) => setEstados((antes) => new Map(antes).set(atual.exerciseId, estado))}
              />
            </>
          )
        )}
      </main>

      {atual && (
        <footer className="sticky bottom-0 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto flex w-full max-w-2xl items-center px-4 py-3">
            <Button
              size="lg"
              block
              onClick={() => setIndice((i) => i + 1)}
              disabled={!avancoLiberado(estadoAtual)}
              icon={estadoAtual === 'acertou' ? <IconCheck size={17} /> : undefined}
              iconRight={<IconArrowRight size={18} />}
            >
              {indice === sessao.length - 1 && avancoLiberado(estadoAtual) ? 'Terminar' : rotuloDeAvanco(estadoAtual)}
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}

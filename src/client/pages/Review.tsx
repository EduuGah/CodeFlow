import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  IconCalendarCheck,
  IconCheckCircle,
  IconClose,
  IconSpinner,
} from '../components/ui/Icon';

import { listConcepts, listFlashcards } from '../../content';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchAttempts,
  fetchFlashcardReviews,
  recordFlashcardReview,
} from '../lib/progress';
import { conceptsNeedingReview } from '../lib/mastery';
import {
  buildReviewSession,
  describeNextInterval,
  type DueCard,
  type ReviewRating,
} from '../lib/review';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/States';

/**
 * Sessão de revisão com repetição espaçada (§200).
 *
 * A versão anterior mostrava todos os cartões, sempre na mesma ordem, e os
 * botões Difícil/Médio/Fácil chamavam exatamente a mesma função — o aluno
 * achava que informava dificuldade e nada acontecia.
 *
 * Agora a autoavaliação define quando o cartão volta, e a fila prioriza os
 * conceitos que o aluno vem errando nos exercícios (§202).
 */

const AVALIACOES: Array<{ rating: ReviewRating; label: string; classe: string }> = [
  { rating: 'dificil', label: 'Difícil', classe: 'text-danger-700 hover:border-danger-200 hover:bg-danger-50' },
  { rating: 'medio', label: 'Médio', classe: 'text-energy-700 hover:border-energy-200 hover:bg-energy-50' },
  { rating: 'facil', label: 'Fácil', classe: 'text-success-700 hover:border-success-200 hover:bg-success-50' },
];

export function Review() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sessao, setSessao] = useState<DueCard[] | null>(null);
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function montar() {
      const cards = listFlashcards();

      // Sem sessão, a revisão continua utilizável — só não persiste nem prioriza.
      if (!user) {
        if (ativo) setSessao(buildReviewSession(cards, [], []));
        return;
      }

      const [reviews, attempts] = await Promise.all([
        fetchFlashcardReviews(user.id),
        fetchAttempts(user.id),
      ]);
      if (!ativo) return;

      const fracos = conceptsNeedingReview(
        listConcepts().map((c) => c.id),
        attempts
      ).map((m) => m.conceptId);

      setSessao(buildReviewSession(cards, reviews, fracos));
    }

    montar();
    return () => {
      ativo = false;
    };
  }, [user]);

  if (sessao === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <IconSpinner size={32} className="animate-spin text-ink-faint" />
      </div>
    );
  }

  const atual = sessao[indice];
  const terminou = indice >= sessao.length;

  const avaliar = (rating: ReviewRating) => {
    if (user && atual) void recordFlashcardReview(user.id, atual.card.id, rating);
    setVirado(false);
    setIndice((i) => i + 1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-14 items-center justify-between border-b border-line bg-surface px-4">
        <div className="flex items-center gap-4">
          <Link
            to="/app/praticar"
            aria-label="Sair da revisão"
            className="-ml-2 flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-sunken hover:text-ink"
          >
            <IconClose size={20} />
          </Link>
          <span className="text-sm font-bold text-ink">Sessão de revisão</span>
        </div>

        <span className="label-mono text-ink-faint">
          {sessao.length === 0 || terminou ? 'Concluído' : `${indice + 1} de ${sessao.length}`}
        </span>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        {sessao.length === 0 ? (
          <EmptyState
            className="max-w-md"
            icon={<IconCalendarCheck size={28} />}
            title="Nada para revisar hoje"
            description="Todos os cartões já foram revisados e ainda não venceram. Voltar antes da hora atrapalha mais do que ajuda — o intervalo existe para o esquecimento começar a agir."
            action={
              <Link to="/app">
                <Button size="sm">Voltar ao painel</Button>
              </Link>
            }
          />
        ) : terminou ? (
          <div className="max-w-md space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success-600">
              <IconCheckCircle size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink">Revisão concluída</h2>
              <p className="mt-2 text-ink-faint">
                {sessao.length} {sessao.length === 1 ? 'cartão revisado' : 'cartões revisados'}. Cada
                um volta numa data diferente, conforme o quanto você lembrou dele.
              </p>
            </div>
            <Button size="lg" className="w-full" onClick={() => navigate('/app')}>
              Voltar ao Painel
            </Button>
          </div>
        ) : (
          <div className="flex w-full max-w-xl flex-col gap-8">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setVirado((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setVirado((v) => !v);
                }
              }}
              className="flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-line bg-surface p-10 text-center transition-colors hover:border-line-strong"
            >
              {!virado ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                      Conceito
                    </span>
                    {/* O aluno merece saber por que este cartão veio primeiro. */}
                    {atual.priority && <Badge tone="caution">Você vem errando isto</Badge>}
                  </div>
                  <h2 className="text-2xl font-medium leading-tight text-ink md:text-3xl">
                    {atual.card.front}
                  </h2>
                  <p className="pt-6 text-sm text-ink-faint">Clique no card para revelar a resposta</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-success-600">
                    Resposta
                  </span>
                  <p className="text-xl leading-relaxed text-ink-soft md:text-2xl">
                    {atual.card.back}
                  </p>
                  <p className="pt-4 text-sm text-ink-faint">Clique de novo para rever a pergunta</p>
                </div>
              )}
            </div>

            {virado && (
              <div className="flex flex-col gap-3">
                <p className="mb-1 text-center text-sm font-medium text-ink-faint">
                  Como foi para lembrar disso?
                </p>

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {AVALIACOES.map(({ rating, label, classe }) => (
                    <Button
                      key={rating}
                      variant="outline"
                      className={`flex-col py-3 ${classe}`}
                      onClick={() => avaliar(rating)}
                    >
                      <span>{label}</span>
                      {/* Consequência à vista: a resposta muda quando o cartão volta. */}
                      <span className="text-xs font-normal text-ink-faint">
                        {describeNextInterval(atual.state, rating)}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

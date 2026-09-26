import { Link } from 'react-router-dom';

import { getConcept } from '../../../content';
import { useStudentData } from '../../contexts/StudentDataContext';
import { MASTERY_LABELS } from '../../lib/mastery';
import { resumoDoCaderno, type EntradaDoCaderno } from '../../lib/caderno';
import { IconArrowRight, IconPractice } from '../../components/ui/Icon';
import { CenaCartoes } from '../../components/ui/Cena';
import { VinhetaAlvo, VinhetaCartoes, VinhetaEditor } from '../../components/ui/Ilustracao';
import { Badge } from '../../components/ui/Badge';
import { Card, cardClasses } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Carregando, Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/States';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

/**
 * Praticar.
 *
 * Junta as formas de reforçar o que já foi visto: revisão espaçada, o
 * caderno de erros, conceitos com desempenho fraco e exercícios ainda não
 * resolvidos.
 *
 * A ordem não é arbitrária. Revisão e caderno vêm primeiro porque são os que
 * têm prazo — um cartão vencido perde valor a cada dia, e um erro sem
 * conserto é o que mais pesa adiante. Depois os conceitos fracos, que apontam
 * onde o aluno está de fato travado. Por último a contagem de pendentes, que
 * é informação, não urgência.
 */
export function Practice() {
  useDocumentTitle('Praticar');
  const { loading, dueCards, cards, conceptsToReview, pendingExercises, totalExercises, stats, caderno } =
    useStudentData();

  if (loading) {
    return (
      <Carregando o="a prática">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </Carregando>
    );
  }

  const resolvidos = totalExercises - pendingExercises.length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Praticar</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Reforçar o que já foi visto rende mais do que avançar sobre base frágil.
        </p>
      </header>

      <section>
        <h2 className="label-mono mb-3 text-ink-faint">Revisão espaçada</h2>

        {dueCards === 0 ? (
          <EmptyState
            cena={<CenaCartoes />}
            title="Nada vencido hoje"
            description="Os cartões voltam na data em que o esquecimento começa a agir. Revisar antes da hora atrapalha mais do que ajuda."
          />
        ) : (
          <Link
            to="/review"
            className={cardClasses({
              className: 'flex items-center gap-4 transition-colors hover:border-line-strong',
            })}
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-energy-50 sm:hidden" aria-hidden>
              <VinhetaCartoes size={40} />
            </span>
            {/* A cena do cartão virando, onde cabe; no celular, a vinheta. */}
            <CenaCartoes className="hidden w-36 shrink-0 sm:block" />
            <span className="min-w-0 flex-1">
              {/* Vencido e novo são coisas diferentes, e o painel já separa os
                  dois. Chamar de "para revisar" 22 cartões que a pessoa nunca
                  viu era cobrar uma dívida que ela não contraiu. */}
              <span className="block font-bold text-ink">
                {cards.vencidos > 0
                  ? `${cards.vencidos} ${cards.vencidos === 1 ? 'cartão vencido' : 'cartões vencidos'}`
                  : `${cards.novos} ${cards.novos === 1 ? 'cartão novo para conhecer' : 'cartões novos para conhecer'}`}
              </span>
              <span className="block text-sm leading-relaxed text-ink-soft">
                {cards.vencidos > 0 && cards.novos > 0
                  ? `Mais ${cards.novos} ${cards.novos === 1 ? 'novo' : 'novos'} esperando. ${
                      conceptsToReview.length > 0
                        ? 'Os conceitos que você vem errando entram primeiro.'
                        : 'Os vencidos entram primeiro.'
                    }`
                  : conceptsToReview.length > 0
                    ? 'Os conceitos que você vem errando entram primeiro na fila.'
                    : cards.vencidos > 0
                      ? 'Um cartão vencido perde valor a cada dia. Sessão curta.'
                      : 'Sem pressa: são os primeiros, não estão atrasados.'}
              </span>
            </span>
            <IconArrowRight size={18} className="shrink-0 text-ink-faint" />
          </Link>
        )}
      </section>

      {caderno.length > 0 && <ResumoDoCaderno caderno={caderno} />}

      {conceptsToReview.length > 0 && (
        <section>
          <h2 className="label-mono mb-1 text-ink-faint">Conceitos para retomar</h2>
          <p className="mb-3 text-sm leading-relaxed text-ink-soft">
            Calculado pelas suas tentativas nos exercícios, não pelas aulas concluídas — dá para
            terminar uma aula sem dominar o conceito dela.
          </p>

          <Card as="ul" padding="none" className="divide-y divide-line overflow-hidden">
            {conceptsToReview.map((m) => (
              <li key={m.conceptId} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">
                    {getConcept(m.conceptId)?.title ?? m.conceptId}
                  </span>
                  {/* A evidência, não só o veredito. */}
                  <span className="block text-sm text-ink-soft">
                    {m.correctAttempts} de {m.attempts}{' '}
                    {m.attempts === 1 ? 'tentativa' : 'tentativas'}
                  </span>
                </span>
                <Badge tone="caution">{MASTERY_LABELS[m.level]}</Badge>
              </li>
            ))}
          </Card>
        </section>
      )}

      <section>
        <h2 className="label-mono mb-3 text-ink-faint">Exercícios</h2>

        <Card className="flex gap-4">
          <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sunken sm:flex" aria-hidden>
            <VinhetaEditor size={40} />
          </span>
          <div className="min-w-0 flex-1">
            <ProgressBar label="Resolvidos" value={resolvidos} max={totalExercises} showCount />

            <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-ink-soft">
              <IconPractice size={17} className="mt-0.5 shrink-0 text-ink-faint" />
              {pendingExercises.length === 0
                ? 'Você resolveu todos os exercícios publicados.'
                : `${pendingExercises.length} ainda não resolvidos. Eles vivem dentro das aulas — siga pela trilha para chegar neles.`}
            </p>

            {stats.attempts > 0 && (
              <p className="mt-3 border-t border-line pt-3 text-sm text-ink-faint">
                {Math.round(stats.accuracy * 100)}% de acerto em {stats.attempts}{' '}
                {stats.attempts === 1 ? 'tentativa' : 'tentativas'} · {stats.activeDays}{' '}
                {stats.activeDays === 1 ? 'dia de estudo' : 'dias de estudo'}
              </p>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

/** O caderno de erros em uma linha: quanto há para refazer, e a porta para ele. */
function ResumoDoCaderno({ caderno }: { caderno: EntradaDoCaderno[] }) {
  const resumo = resumoDoCaderno(caderno);
  const aRefazer = resumo.pendente + resumo.revisar;

  return (
    <section>
      <h2 className="label-mono mb-3 text-ink-faint">Caderno de erros</h2>
      <Link
        to="/app/praticar/erros"
        className={cardClasses({ className: 'flex items-center gap-4 transition-colors hover:border-line-strong' })}
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-energy-50" aria-hidden>
          <VinhetaAlvo size={40} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-ink">
            {aRefazer === 0
              ? 'Nada para refazer hoje'
              : `${aRefazer} ${aRefazer === 1 ? 'exercício para refazer' : 'exercícios para refazer'}`}
          </span>
          <span className="block text-sm leading-relaxed text-ink-soft">
            {resumo.pendente > 0
              ? 'Veja o que você respondeu e tente de novo, com o erro à vista.'
              : resumo.revisar > 0
                ? 'Revisões do dia: acertar de novo, com intervalo, é o que mostra que ficou.'
                : `${resumo['em-dia']} em dia, ${resumo.dominado} ${resumo.dominado === 1 ? 'dominado' : 'dominados'}. Cada um volta na data marcada.`}
          </span>
        </span>
        <IconArrowRight size={18} className="shrink-0 text-ink-faint" />
      </Link>
    </section>
  );
}

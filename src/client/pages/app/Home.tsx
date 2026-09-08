import { Link } from 'react-router-dom';

import { getDefaultTrack, getLesson, getNextLesson } from '../../../content';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentData } from '../../contexts/StudentDataContext';
import { IconArrowRight, IconReview, IconStreak, IconTarget } from '../../components/ui/Icon';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/States';

/**
 * Tela inicial.
 *
 * Responde uma pergunta só: **o que eu faço agora?**
 *
 * A versão anterior era um painel com seis seções competindo — nível,
 * estatísticas, conceitos, linha do tempo, projetos e revisão. O próximo passo
 * ficava enterrado no meio, e o aluno tinha que procurar o que deveria estar
 * gritando.
 *
 * Aqui existe um card primário, grande, com uma ação. O resto é apoio: só
 * aparece quando há algo de fato pendente, e some quando não há.
 */
export function Home() {
  const { user } = useAuth();
  const {
    loading,
    error,
    reload,
    completedLessons,
    resume,
    streak,
    daysAway,
    dueCards,
    conceptsToReview,
  } = useStudentData();

  const primeiroNome =
    (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'Estudante';

  const trilha = getDefaultTrack();
  const aulaDaRetomada = resume ? getLesson(resume.lessonId) : undefined;
  const destino = aulaDaRetomada ?? getNextLesson(trilha.id, completedLessons);

  const voltandoDepoisDeAusencia = daysAway !== null && daysAway >= 7;
  const primeiraVez = resume === null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-mono text-ink-faint">
            {primeiraVez ? 'Bem-vindo' : voltandoDepoisDeAusencia ? 'Bem-vindo de volta' : 'Olá'}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {primeiroNome}
          </h1>
        </div>

        {/* A sequência só aparece quando existe. Mostrar "0 dias" seria cobrança. */}
        {streak > 0 && (
          <span
            className="flex items-center gap-1.5 rounded-full bg-energy-50 px-3 py-1.5 text-sm font-bold text-energy-700"
            title="Dias seguidos com pelo menos um exercício"
          >
            <IconStreak size={17} />
            {streak} {streak === 1 ? 'dia' : 'dias'}
          </span>
        )}
      </header>

      {error && (
        <ErrorState
          title="Seu progresso não carregou"
          message={`${error} As aulas continuam acessíveis, mas o que você já concluiu pode não aparecer marcado.`}
          onRetry={reload}
        />
      )}

      {/* O card primário: uma ação, sem concorrência visual. */}
      {loading ? (
        <Skeleton className="h-56 w-full rounded-xl" />
      ) : destino ? (
        <section className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="bg-brand-600 px-5 py-4 text-white sm:px-6">
            <p className="label-mono text-brand-100">
              {primeiraVez ? 'Comece por aqui' : 'Continue de onde parou'}
            </p>
            <h2 className="mt-1 text-xl font-bold leading-tight sm:text-2xl">{destino.title}</h2>
          </div>

          <div className="px-5 py-5 sm:px-6">
            <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft">
              <IconTarget size={17} className="mt-0.5 shrink-0 text-brand-500" />
              {destino.objective}
            </p>

            {voltandoDepoisDeAusencia && (
              <p className="mt-3 rounded-lg bg-energy-50 px-3 py-2 text-sm leading-relaxed text-energy-700">
                Faz {daysAway} dias desde o último estudo. Uma revisão rápida antes de avançar
                costuma render mais do que retomar direto.
              </p>
            )}

            {resume && !resume.wasCorrect && (
              <p className="mt-3 rounded-lg bg-energy-50 px-3 py-2 text-sm leading-relaxed text-energy-700">
                Sua última tentativa aqui ainda não passou.
              </p>
            )}

            <Link
              to={`/lesson/${destino.id}`}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3.5 font-bold text-white transition-colors hover:bg-brand-900 active:translate-y-px"
            >
              {primeiraVez ? 'Começar aula' : 'Retomar'}
              <IconArrowRight size={18} />
            </Link>

            <p className="mt-3 text-center text-xs text-ink-faint">
              {destino.estimatedMinutes} minutos · {trilha.title}
            </p>
          </div>
        </section>
      ) : null}

      {/* Apoio: só aparece se houver algo pendente de verdade. */}
      {!loading && (dueCards > 0 || conceptsToReview.length > 0) && (
        <Link
          to="/app/praticar"
          className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-energy-50 text-energy-700">
            <IconReview size={22} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block font-bold text-ink">Praticar antes de avançar</span>
            <span className="block text-sm leading-relaxed text-ink-soft">
              {dueCards > 0 && `${dueCards} ${dueCards === 1 ? 'cartão vencido' : 'cartões vencidos'}`}
              {dueCards > 0 && conceptsToReview.length > 0 && ' · '}
              {conceptsToReview.length > 0 &&
                `${conceptsToReview.length} ${
                  conceptsToReview.length === 1 ? 'conceito fraco' : 'conceitos fracos'
                }`}
            </span>
          </span>

          <IconArrowRight size={18} className="shrink-0 text-ink-faint" />
        </Link>
      )}
    </div>
  );
}

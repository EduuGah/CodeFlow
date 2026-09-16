import { Link } from 'react-router-dom';

import { getConcept, getLesson, getLessonsOfTrack, getTrack, listConcepts, listProjects } from '../../../content';
import { ETAPAS_DO_PERCURSO } from '../../../content/percurso';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentData } from '../../contexts/StudentDataContext';
import { montarPercurso, trilhaDaVez } from '../../lib/percurso';
import { PercursoCompacto } from '../../components/dashboard/Percurso';
import {
  IconArrowRight,
  IconCheck,
  IconPractice,
  IconReview,
  IconStreak,
  IconTarget,
} from '../../components/ui/Icon';
import { buttonClasses } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Carregando, Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/States';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

/**
 * Tela inicial.
 *
 * Três perguntas, nesta ordem: **o que faço agora**, **onde isso está no
 * todo**, **como estou indo**. E o mínimo para respondê-las.
 *
 * A versão anterior só conhecia a trilha padrão: mostrava a próxima aula de
 * JavaScript, a vizinhança dela e "22 cartões novos" — para quem tinha
 * acabado de entrar e não sabia que existiam sete trilhas nem por onde
 * começar. O que faltava era o mapa. Agora a ação principal é a aula da vez
 * (da trilha em que a pessoa de fato está), e logo abaixo vem o percurso
 * inteiro: sete trilhas em três etapas, com o ponto atual marcado. A
 * vizinhança da aula mora na tela da trilha, a um toque; os cartões novos
 * moram em Praticar. Aqui só entra o que é preciso decidir agora.
 */
export function Home() {
  useDocumentTitle('Início');
  const { user } = useAuth();
  const {
    loading,
    error,
    reload,
    completedLessons,
    completedProjects,
    attempts,
    mastery,
    stats,
    resume,
    streak,
    daysAway,
    cards,
    conceptsToReview,
    abandonedExercises,
  } = useStudentData();

  const primeiroNome =
    (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'Estudante';

  const percurso = montarPercurso(
    ETAPAS_DO_PERCURSO,
    getTrack,
    getLessonsOfTrack,
    completedLessons,
    listConcepts(),
    mastery,
    attempts
  );
  const trilha = trilhaDaVez(percurso, resume?.lessonId);
  const trilhas = percurso.flatMap((e) => e.trilhas);
  const totalDeAulas = trilhas.reduce((s, t) => s + t.resumo.total, 0);

  // A aula da retomada tem prioridade sobre a próxima da trilha: quem parou no
  // meio de um exercício quer voltar para lá, não avançar.
  const aulaDaRetomada = resume ? getLesson(resume.lessonId) : undefined;
  const aulaDaVez =
    aulaDaRetomada && trilha?.track.lessonIds.includes(aulaDaRetomada.id)
      ? aulaDaRetomada
      : trilha?.resumo.current?.lesson;
  const noDaVez = trilha?.caminho.find((n) => n.lesson.id === aulaDaVez?.id);
  const depoisDaVez = noDaVez ? trilha?.caminho[noDaVez.position] : undefined;

  const primeiraVez = resume === null && completedLessons.length === 0;
  const voltandoDepoisDeAusencia = daysAway !== null && daysAway >= 7;
  const semHistorico = stats.attempts === 0;
  const conceitosDominados = mastery.filter((m) => m.level === 'dominando').length;
  const projetos = listProjects();

  /** O que vale fazer hoje, além de avançar. Só entra o que tem prazo ou ficou para trás. */
  const paraHoje = [
    cards.vencidos > 0 && {
      chave: 'revisar',
      para: '/review',
      Icone: IconReview,
      texto: `${cards.vencidos} ${cards.vencidos === 1 ? 'cartão voltou' : 'cartões voltaram'} para revisão`,
    },
    conceptsToReview.length > 0 && {
      chave: 'reforcar',
      para: '/app/praticar',
      Icone: IconTarget,
      texto: `Reforçar ${conceptsToReview
        .slice(0, 2)
        .map((c) => getConcept(c.conceptId)?.title ?? c.conceptId)
        .join(' e ')}: você vem errando mais do que acertando`,
    },
    abandonedExercises.length > 0 && {
      chave: 'pendentes',
      para: '/app/praticar',
      Icone: IconPractice,
      texto: `${abandonedExercises.length} ${
        abandonedExercises.length === 1 ? 'exercício tentado e não resolvido' : 'exercícios tentados e não resolvidos'
      }`,
    },
  ].filter((a): a is Exclude<typeof a, false> => a !== false);

  return (
    <div className="space-y-9">
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[1.75rem]">
            {primeiraVez ? `Bem-vindo, ${primeiroNome}` : `Olá, ${primeiroNome}`}
          </h1>
          <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">
            {loading
              ? ' '
              : primeiraVez
                ? `${totalDeAulas} aulas curtas em ${trilhas.length} trilhas, uma preparando a outra. Comece pela primeira: é a base de tudo que vem depois.`
                : voltandoDepoisDeAusencia
                  ? `Faz ${daysAway} dias. Uma revisão curta antes de avançar costuma render mais.`
                  : trilha && noDaVez
                    ? `Você está na aula ${noDaVez.position} de ${trilha.resumo.total} de ${trilha.track.title}.`
                    : 'Continue de onde você parou.'}
          </p>
        </div>

        {/* Só aparece quando existe. "0 dias" seria cobrança, não informação. */}
        {streak > 0 && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-energy-50 px-2.5 py-1.5 text-sm font-bold text-energy-700">
            <IconStreak size={16} />
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

      {/* O QUE FAÇO AGORA — o único card da página, e a única ação primária. */}
      {loading ? (
        <Carregando o="sua próxima aula">
          <Skeleton className="h-52 w-full rounded-xl" />
        </Carregando>
      ) : trilha && aulaDaVez ? (
        <Card as="section" padding="none" className="overflow-hidden" aria-labelledby="aula-da-vez">
          <div className="bg-brand-600 px-5 py-4 text-white sm:px-6">
            <p className="label-mono text-brand-100">
              {primeiraVez ? 'Comece por aqui' : trilha.estado === 'nao-iniciada' ? 'Próxima trilha' : 'Continuar'}
              {noDaVez ? ` · aula ${noDaVez.position} de ${trilha.resumo.total}` : ''} · {aulaDaVez.estimatedMinutes} min
            </p>
            <h2 id="aula-da-vez" className="mt-1 text-xl font-bold leading-tight sm:text-2xl">
              {aulaDaVez.title}
            </h2>
            <p className="mt-0.5 text-sm text-brand-100">{trilha.track.title}</p>
          </div>

          <div className="px-5 py-5 sm:px-6">
            <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft">
              <IconTarget size={17} className="mt-0.5 shrink-0 text-brand-500" />
              {aulaDaVez.objective}
            </p>

            {resume && aulaDaRetomada?.id === aulaDaVez.id && !resume.wasCorrect && (
              <p className="mt-3 rounded-lg bg-energy-50 px-3 py-2 text-sm leading-relaxed text-energy-700">
                Sua última tentativa aqui ainda não passou. Voltar com a cabeça fria costuma resolver.
              </p>
            )}

            <Link
              to={`/lesson/${aulaDaVez.id}`}
              className={buttonClasses({ size: 'lg', block: true, className: 'mt-5' })}
            >
              {primeiraVez ? 'Começar a primeira aula' : trilha.estado === 'nao-iniciada' ? 'Começar esta trilha' : 'Continuar a aula'}
              <IconArrowRight size={18} />
            </Link>

            {depoisDaVez && (
              <p className="mt-3 text-center text-xs text-ink-faint">
                Depois: {depoisDaVez.lesson.title}
              </p>
            )}
          </div>
        </Card>
      ) : (
        !loading && (
          <Card as="section" tone="success" padding="lg" className="text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success-600 text-white">
              <IconCheck size={24} />
            </span>
            <h2 className="font-bold text-success-700">Percurso concluído</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-soft">
              Você terminou todas as trilhas. Os projetos são o próximo passo natural: eles não têm
              passo a passo, só requisitos.
            </p>
            <Link to="/app/trilhas#projetos" className={buttonClasses({ className: 'mt-4' })}>
              Ver projetos
              <IconArrowRight size={17} />
            </Link>
          </Card>
        )
      )}

      {/* ONDE ISSO ESTÁ NO TODO — o percurso inteiro, numa lista. */}
      {!loading && (
        <section aria-labelledby="titulo-percurso">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <h2 id="titulo-percurso" className="label-mono text-ink-faint">
              Seu percurso
            </h2>
            <Link to="/app/trilhas" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              Ver as trilhas
            </Link>
          </div>

          <PercursoCompacto etapas={percurso} atualId={trilha?.track.id} />

          <Link
            to="/app/trilhas#projetos"
            className="-mx-2 mt-1 flex items-center gap-3.5 rounded-lg border-t border-line px-2 py-3 text-sm transition-colors hover:bg-sunken"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center text-ink-faint" aria-hidden>
              +
            </span>
            <span className="flex-1 text-ink-soft">
              {projetos.length} projetos práticos, sem passo a passo
              {completedProjects.length > 0 ? ` · ${completedProjects.length} entregues` : ''}
            </span>
            <IconArrowRight size={16} className="text-ink-faint" />
          </Link>
        </section>
      )}

      {/* PARA HOJE — só o que tem prazo ou ficou para trás. */}
      {!loading && paraHoje.length > 0 && (
        <section aria-labelledby="titulo-hoje">
          <h2 id="titulo-hoje" className="label-mono mb-1 text-ink-faint">
            Para hoje
          </h2>
          <ul className="divide-y divide-line">
            {paraHoje.map(({ chave, para, Icone, texto }) => (
              <li key={chave}>
                <Link
                  to={para}
                  className="-mx-2 flex items-center gap-3.5 rounded-lg px-2 py-3 text-sm transition-colors hover:bg-sunken"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-energy-50 text-energy-700">
                    <Icone size={18} />
                  </span>
                  <span className="flex-1 text-ink">{texto}</span>
                  <IconArrowRight size={16} className="shrink-0 text-ink-faint" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* COMO ESTOU INDO — números discretos, e só quando existem. */}
      {!loading && !semHistorico && (
        <footer className="border-t border-line pt-5">
          <dl className="flex flex-wrap gap-x-8 gap-y-4">
            {[
              ['Exercícios resolvidos', stats.exercisesSolved],
              ['Conceitos dominados', conceitosDominados],
              ['Dias de prática', stats.activeDays],
            ].map(([rotulo, valor]) => (
              <div key={rotulo}>
                <dd className="text-xl font-extrabold tabular-nums text-ink">{valor}</dd>
                <dt className="label-mono text-ink-faint">{rotulo}</dt>
              </div>
            ))}
          </dl>
        </footer>
      )}
    </div>
  );
}

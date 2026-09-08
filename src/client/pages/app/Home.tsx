import { Link } from 'react-router-dom';

import { getDefaultTrack, getLesson, getLessonsOfTrack, listConcepts } from '../../../content';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentData } from '../../contexts/StudentDataContext';
import { buildPath, summarizePath } from '../../lib/path';
import { PathPreview } from '../../components/dashboard/PathPreview';
import {
  IconArrowRight,
  IconCheck,
  IconPractice,
  IconReview,
  IconStreak,
  IconTarget,
} from '../../components/ui/Icon';
import { Carregando, Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/States';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

/**
 * Tela inicial.
 *
 * Responde três perguntas, nesta ordem de destaque: **onde estou**, **o que faço
 * agora**, **como estou evoluindo**.
 *
 * A versão anterior respondia só a segunda. Medido: 285px da primeira tela
 * ficavam vazios, e dois alunos — um zerado e outro com duas aulas concluídas —
 * viam telas idênticas fora o título da aula. O progresso existia no contexto
 * (posição na trilha, exercícios resolvidos, conceitos dominados) e nenhum
 * chegava à tela.
 *
 * A composição é uma coluna com um só card. Isso é deliberado: quando tudo é
 * card, nada tem destaque. A posição é uma linha de texto com uma barra fina, o
 * caminho é uma sequência sobre um traço, as atividades são uma lista com
 * divisores, e os números ficam num rodapé discreto. O card único é a ação — e
 * ele é o único elemento que se parece com um botão grande na página.
 */
export function Home() {
  useDocumentTitle('Início');
  const { user } = useAuth();
  const {
    loading,
    error,
    reload,
    completedLessons,
    attempts,
    mastery,
    stats,
    resume,
    streak,
    daysAway,
    cards,
    conceptsToReview,
    pendingExercises,
  } = useStudentData();

  const primeiroNome =
    (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'Estudante';

  const trilha = getDefaultTrack();
  const aulas = getLessonsOfTrack(trilha.id);
  const caminho = buildPath(aulas, completedLessons, listConcepts(), mastery, attempts);
  const resumo = summarizePath(caminho);

  // A aula da retomada tem prioridade sobre a próxima da trilha: quem parou no
  // meio de um exercício quer voltar para lá, não avançar.
  const aulaDaRetomada = resume ? getLesson(resume.lessonId) : undefined;
  const destino = aulaDaRetomada ?? resumo.current?.lesson;
  const posicaoDoDestino = caminho.find((n) => n.lesson.id === destino?.id)?.position;

  // Aula concluída também é progresso. Derivar isto só de tentativas fazia quem
  // tinha duas aulas feitas ver "Comece por aqui" e um botão "Começar aula".
  const primeiraVez = resume === null && completedLessons.length === 0;
  const voltandoDepoisDeAusencia = daysAway !== null && daysAway >= 7;
  const semHistorico = stats.attempts === 0;

  const conceitosDominados = mastery.filter((m) => m.level === 'dominando').length;

  /** O que vale fazer agora, em ordem de urgência. Só entra o que é real. */
  const atividades = [
    cards.vencidos > 0 && {
      chave: 'revisar',
      para: '/app/praticar',
      Icone: IconReview,
      tom: 'energy' as const,
      titulo: 'Revisar o que já viu',
      detalhe: `${cards.vencidos} ${cards.vencidos === 1 ? 'cartão voltou' : 'cartões voltaram'} para revisão hoje`,
    },
    conceptsToReview.length > 0 && {
      chave: 'reforcar',
      para: '/app/praticar',
      Icone: IconTarget,
      tom: 'energy' as const,
      titulo: 'Reforçar onde travou',
      detalhe: conceptsToReview
        .slice(0, 3)
        .map((c) => c.conceptId)
        .join(', '),
    },
    pendingExercises.length > 0 && {
      chave: 'pendentes',
      para: '/app/praticar',
      Icone: IconPractice,
      tom: 'brand' as const,
      titulo: 'Exercícios em aberto',
      detalhe: `${pendingExercises.length} ainda sem solução aceita`,
    },
    cards.novos > 0 && {
      chave: 'novos',
      para: '/app/praticar',
      Icone: IconPractice,
      tom: 'brand' as const,
      titulo: 'Cartões que você ainda não viu',
      detalhe: `${cards.novos} ${cards.novos === 1 ? 'cartão novo' : 'cartões novos'}`,
    },
  ].filter((a): a is Exclude<typeof a, false> => a !== false);

  return (
    <div className="space-y-9">
      {/* ONDE ESTOU — uma linha, não um card. */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[1.75rem]">
              {primeiraVez ? `Bem-vindo, ${primeiroNome}` : `Olá, ${primeiroNome}`}
            </h1>
            <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">
              {primeiraVez
                ? 'Comece pela primeira aula. Cada uma leva alguns minutos e termina com código rodando.'
                : voltandoDepoisDeAusencia
                  ? `Faz ${daysAway} dias. Uma revisão curta antes de avançar costuma render mais.`
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
        </div>

        {!loading && (
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="label-mono text-ink-faint">{trilha.title}</span>
              <span className="label-mono tabular-nums text-ink-faint">
                {resumo.completed} de {resumo.total} aulas
              </span>
            </div>

            <div
              role="progressbar"
              aria-valuenow={resumo.completed}
              aria-valuemin={0}
              aria-valuemax={resumo.total}
              aria-label={`Progresso em ${trilha.title}`}
              className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-sunken"
            >
              <div
                className="h-full rounded-full bg-brand-600 transition-[width] duration-500"
                style={{ width: `${resumo.percentage}%` }}
              />
            </div>
          </div>
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
          <Skeleton className="h-56 w-full rounded-xl" />
        </Carregando>
      ) : destino ? (
        <section className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="bg-brand-600 px-5 py-4 text-white sm:px-6">
            <p className="label-mono text-brand-100">
              {primeiraVez
                ? 'Comece por aqui'
                : posicaoDoDestino
                  ? `Aula ${posicaoDoDestino} de ${resumo.total}`
                  : 'Continue de onde parou'}
            </p>
            <h2 className="mt-1 text-xl font-bold leading-tight sm:text-2xl">{destino.title}</h2>
          </div>

          <div className="px-5 py-5 sm:px-6">
            <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft">
              <IconTarget size={17} className="mt-0.5 shrink-0 text-brand-500" />
              {destino.objective}
            </p>

            {resume && !resume.wasCorrect && (
              <p className="mt-3 rounded-lg bg-energy-50 px-3 py-2 text-sm leading-relaxed text-energy-700">
                Sua última tentativa aqui ainda não passou. Voltar com a cabeça fria costuma
                resolver.
              </p>
            )}

            <Link
              to={`/lesson/${destino.id}`}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3.5 font-bold text-white transition-colors hover:bg-brand-900 active:translate-y-px"
            >
              {primeiraVez ? 'Começar a primeira aula' : 'Continuar aprendendo'}
              <IconArrowRight size={18} />
            </Link>

            <p className="mt-3 text-center text-xs text-ink-faint">
              {destino.estimatedMinutes} minutos
            </p>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-success-200 bg-success-50 p-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success-600 text-white">
            <IconCheck size={24} />
          </span>
          <h2 className="font-bold text-success-700">Trilha concluída</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-soft">
            Você terminou {trilha.title}. Os projetos são o próximo passo natural: eles não têm
            passo a passo, só requisitos.
          </p>
          <Link
            to="/app/trilhas"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-900"
          >
            Ver projetos
            <IconArrowRight size={17} />
          </Link>
        </section>
      )}

      {/* O QUE VEM DEPOIS — sequência sobre um traço, não uma grade de cards. */}
      {!loading && caminho.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="label-mono text-ink-faint">Seu caminho</h2>
            <Link
              to="/app/trilhas"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Ver a trilha inteira
            </Link>
          </div>

          <PathPreview nodes={caminho} total={resumo.total} />
        </section>
      )}

      {/* AGORA — lista com divisores. Só o que é real, em ordem de urgência. */}
      {!loading && atividades.length > 0 && (
        <section>
          <h2 className="label-mono mb-1 text-ink-faint">Também vale fazer</h2>

          <ul className="divide-y divide-line">
            {atividades.map(({ chave, para, Icone, tom, titulo, detalhe }) => (
              <li key={chave}>
                <Link
                  to={para}
                  className="-mx-2 flex items-center gap-3.5 rounded-lg px-2 py-3.5 transition-colors hover:bg-sunken"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      tom === 'energy'
                        ? 'bg-energy-50 text-energy-700'
                        : 'bg-brand-50 text-brand-700'
                    }`}
                  >
                    <Icone size={20} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{titulo}</span>
                    <span className="block truncate text-sm text-ink-soft">{detalhe}</span>
                  </span>

                  <IconArrowRight size={17} className="shrink-0 text-ink-faint" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* COMO ESTOU EVOLUINDO — números discretos, sem cards de métrica. */}
      {!loading && (
        <footer className="border-t border-line pt-5">
          {semHistorico ? (
            // Zeros não informam nada a quem ainda não começou. O que ajuda é
            // saber o tamanho do que existe pela frente.
            <p className="text-sm leading-relaxed text-ink-soft">
              A trilha tem{' '}
              <strong className="font-semibold text-ink">{resumo.total} aulas</strong>, e cada uma
              termina com exercícios que rodam no navegador. Seu progresso aparece aqui conforme
              você avança.
            </p>
          ) : (
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
          )}
        </footer>
      )}
    </div>
  );
}

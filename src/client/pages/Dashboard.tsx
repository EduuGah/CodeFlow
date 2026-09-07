import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchAttempts, fetchFlashcardReviews, fetchProgress } from '../lib/progress';
import { dueCount, type FlashcardReview } from '../lib/review';
import { conceptsNeedingReview, masteryByConcept, overallStats, type Attempt } from '../lib/mastery';
import { ConceptProgress } from '../components/dashboard/ConceptProgress';
import { ResumeCard } from '../components/dashboard/ResumeCard';
import { currentStreak, daysSinceLastStudy, lastActivity, unsolvedExerciseIds } from '../lib/study';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState, ErrorState } from '../components/ui/States';
import { LogOut, Code2, Target, LayoutDashboard, FolderCode, Trophy, CheckCircle2 } from 'lucide-react';
import { LANGUAGE_LABELS } from '../../content/types';
import {
  getDefaultTrack,
  getNextLesson,
  getTrackProgress,
  listFlashcards,
  getLessonsOfTrack,
  listTracks,
  listConcepts,
  getExercises,
  listProjects,
} from '../../content';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [completedProjects, setCompletedProjects] = useState<string[]>([]);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [cardReviews, setCardReviews] = useState<FlashcardReview[]>([]);

  useEffect(() => {
    let active = true;

    async function fetchUserData() {
      if (!user) return;

      const [progress, historico, revisoes] = await Promise.all([
        fetchProgress(user.id),
        fetchAttempts(user.id),
        fetchFlashcardReviews(user.id),
      ]);
      if (!active) return;

      setAttempts(historico);
      setCardReviews(revisoes);

      setCompletedLessons(progress.completedLessons);
      setCompletedProjects(progress.completedProjects);
      setProgressError(progress.error ?? null);
      setIsLoadingData(false);
    }

    fetchUserData();
    return () => {
      active = false;
    };
  }, [user]);

  const fullName = user?.user_metadata?.full_name as string | undefined;
  const firstName = fullName?.split(' ')[0] || 'Estudante';
  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'Estudante')}&background=random`;
  
  // Progresso e próxima aula saem da trilha, não de ifs encadeados: acrescentar
  // uma aula ao conteúdo passa a bastar para o painel refletir a mudança.
  const track = getDefaultTrack();
  const { percentage: progressPercentage } = getTrackProgress(track.id, completedLessons);
  const nextLesson = getNextLesson(track.id, completedLessons);
  const projects = listProjects();

  // Uma seção por trilha, com o progresso de cada uma.
  const tracks = listTracks();
  // Cartões efetivamente vencidos hoje, não o total do catálogo.
  const cartoesVencidos = dueCount(listFlashcards(), cardReviews);

  // Domínio derivado do histórico de tentativas — aula concluída não é conceito
  // dominado (§78), então estes números são independentes do progresso da trilha.
  const conceptIds = listConcepts().map((c) => c.id);
  const mastery = masteryByConcept(conceptIds, attempts);
  const paraRevisar = conceptsNeedingReview(conceptIds, attempts);
  const stats = overallStats(attempts);

  // Retomada e ritmo (§108 e §176).
  const streak = currentStreak(attempts);
  const daysAway = daysSinceLastStudy(attempts);
  const resume = lastActivity(attempts);

  const todosExercicios = tracks
    .flatMap((t) => getLessonsOfTrack(t.id))
    .flatMap((l) => getExercises(l))
    .map((e) => e.id);
  const pendentes = unsolvedExerciseIds(todosExercicios, attempts);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2 text-zinc-900 font-semibold tracking-tight">
          <Code2 size={24} className="text-zinc-900" />
          <span>CodeFlow</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-700 hidden sm:block">
            {fullName || user?.email}
          </span>
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className="w-8 h-8 rounded-full bg-zinc-200"
          />
          <Button variant="ghost" size="sm" onClick={logout} className="text-zinc-500 hover:text-zinc-900 px-2">
            <LogOut size={18} />
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
        <div>
          {isLoadingData ? (
            <div className="space-y-3">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Bom retorno, {firstName}!</h1>
              <p className="text-zinc-500 mt-2 text-lg">
                Você concluiu <strong className="text-zinc-700 font-semibold">{progressPercentage}%</strong> da trilha {track.title} ({LANGUAGE_LABELS[track.language]}). Continue de onde parou.
              </p>
            </>
          )}
        </div>

        {progressError && (
          <ErrorState
            title="Seu progresso não carregou"
            message={`${progressError} As aulas continuam acessíveis, mas o que você já concluiu pode não aparecer marcado.`}
            onRetry={() => window.location.reload()}
          />
        )}

        {isLoadingData ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : (
          <ResumeCard
            resume={resume}
            nextLesson={nextLesson}
            streak={streak}
            daysAway={daysAway}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Desafio Diário */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-start">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 mb-4">
              <Target size={20} />
            </div>
            {isLoadingData ? (
              <div className="w-full space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full mt-4" />
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-zinc-900">Exercícios pendentes</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  {pendentes.length === 0
                    ? 'Você resolveu todos os exercícios publicados.'
                    : `${pendentes.length} de ${todosExercicios.length} ainda não resolvidos`}
                </p>
                <ProgressBar
                  label="Resolvidos"
                  value={todosExercicios.length - pendentes.length}
                  max={todosExercicios.length}
                  showCount
                  className="mt-6 w-full"
                />
              </>
            )}
          </div>

          {/* Card: Revisão */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-start">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
              <LayoutDashboard size={20} />
            </div>
            {isLoadingData ? (
              <div className="w-full space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full mt-4" />
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-zinc-900">Revisão</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  {cartoesVencidos === 0
                    ? 'Nada vencido hoje — os cartões voltam na data certa.'
                    : `${cartoesVencidos} ${cartoesVencidos === 1 ? 'cartão disponível' : 'cartões disponíveis'}`}
                  {paraRevisar.length > 0 &&
                    `, com ${paraRevisar.length} ${paraRevisar.length === 1 ? 'conceito fraco' : 'conceitos fracos'} priorizados`}
                </p>
                <Link to="/review" className="w-full mt-6">
                  <Button variant="secondary" size="sm" className="w-full">Revisar agora</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Secao de Projetos Praticos */}
        {tracks.map((currentTrack) => {
          const lessonsOfTrack = getLessonsOfTrack(currentTrack.id);
          const trackProgress = getTrackProgress(currentTrack.id, completedLessons);

          return (
            <div key={currentTrack.id} className="pt-6">
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900">
                {currentTrack.title}
              </h2>
              <p className="mb-4 max-w-2xl text-sm leading-relaxed text-zinc-500">
                {currentTrack.description}
              </p>
              <ProgressBar
                label="Aulas concluídas"
                value={trackProgress.completed}
                max={trackProgress.total}
                showCount
                className="mb-5 max-w-sm"
              />

              <ol className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                {lessonsOfTrack.map((lesson, index) => {
                  const done = completedLessons.includes(lesson.id);

                  return (
                    <li key={lesson.id}>
                      <Link
                        to={`/lesson/${lesson.id}`}
                        className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-zinc-50"
                      >
                        <span
                          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            done ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                          }`}
                        >
                          {done ? <CheckCircle2 size={16} /> : index + 1}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-zinc-900">
                            {lesson.title}
                          </span>
                          <span className="block truncate text-sm text-zinc-500">
                            {lesson.objective}
                          </span>
                        </span>

                        <span className="flex flex-shrink-0 items-center gap-3">
                          <span className="hidden text-xs text-zinc-400 sm:inline">
                            {lesson.estimatedMinutes} min
                          </span>
                          <Badge tone={done ? 'success' : 'neutral'}>
                            {done ? 'Concluída' : 'Pendente'}
                          </Badge>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}

        <div className="pt-6">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900">
            Seus conceitos
          </h2>
          <p className="mb-5 max-w-2xl text-sm leading-relaxed text-zinc-500">
            Calculado a partir das suas tentativas, não das aulas concluídas — dá para terminar uma
            aula sem dominar o conceito dela.
          </p>

          {isLoadingData ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (
            <ConceptProgress mastery={mastery} />
          )}

          {stats.attempts > 0 && (
            <p className="mt-3 text-sm text-zinc-500">
              {stats.exercisesSolved}{' '}
              {stats.exercisesSolved === 1 ? 'exercício resolvido' : 'exercícios resolvidos'} ·{' '}
              {Math.round(stats.accuracy * 100)}% de acerto em {stats.attempts}{' '}
              {stats.attempts === 1 ? 'tentativa' : 'tentativas'} · {stats.activeDays}{' '}
              {stats.activeDays === 1 ? 'dia de estudo' : 'dias de estudo'}
            </p>
          )}
        </div>

        <div className="pt-6">
          <div className="flex items-center gap-2 mb-6">
            <FolderCode size={24} className="text-zinc-700" />
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Projetos Práticos</h2>
          </div>
          {projects.length === 0 ? (
            <EmptyState
              icon={<FolderCode size={28} />}
              title="Nenhum projeto disponível ainda"
              description="Os projetos aparecem aqui conforme são publicados. Enquanto isso, siga pelas aulas da trilha."
            />
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const isCompleted = completedProjects.includes(project.id);

              return (
                <div
                  key={project.id}
                  className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>Nível {project.difficulty}</Badge>
                      <Badge className="bg-transparent ring-1 ring-inset ring-zinc-200">
                        {LANGUAGE_LABELS[project.language]}
                      </Badge>
                    </div>
                    {isCompleted && (
                      <Badge tone="success" icon={<Trophy size={13} />}>
                        Entregue
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">{project.title}</h3>
                  <p className="text-zinc-500 text-sm mb-6 line-clamp-2">{project.description}</p>
                  <Link to={`/project/${project.id}`}>
                    <Button variant={isCompleted ? 'outline' : 'primary'} className="w-full">
                      {isCompleted ? 'Revisar Projeto' : 'Iniciar Projeto'}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </main>
    </div>
  );
}

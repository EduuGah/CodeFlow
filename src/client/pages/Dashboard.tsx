import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchProgress } from '../lib/progress';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState, ErrorState } from '../components/ui/States';
import { LogOut, Code2, BookOpen, Target, LayoutDashboard, ArrowRight, FolderCode, Trophy, CheckCircle2 } from 'lucide-react';
import { LANGUAGE_LABELS } from '../../content/types';
import {
  getDefaultTrack,
  getNextLesson,
  getTrackProgress,
  listFlashcards,
  getLessonsOfTrack,
  listTracks,
  listProjects,
} from '../../content';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [completedProjects, setCompletedProjects] = useState<string[]>([]);
  const [progressError, setProgressError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchUserData() {
      if (!user) return;

      const progress = await fetchProgress(user.id);
      if (!active) return;

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
  const reviewCount = listFlashcards().length;

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card: Trilha Atual */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-start">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 mb-4">
              <BookOpen size={20} />
            </div>
            {isLoadingData ? (
              <div className="w-full space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full mt-4" />
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-zinc-900">Seu próximo passo:</h3>
                <p className="text-sm text-zinc-500 mt-1">{nextLesson?.title ?? 'Trilha concluída'}</p>
                <Link to={`/lesson/${nextLesson?.id ?? ''}`} className="w-full mt-6">
                  <Button size="sm" className="w-full gap-2">
                    Continuar aula <ArrowRight size={16} />
                  </Button>
                </Link>
              </>
            )}
          </div>

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
                <h3 className="font-semibold text-zinc-900">Desafio Diário</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Ainda não disponível. Enquanto isso, os projetos abaixo cumprem o mesmo papel de
                  praticar fora da aula.
                </p>
                {/* Sem botão: um clique que não faz nada é pior que a ausência dele. */}
                <Badge className="mt-6">Em desenvolvimento</Badge>
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
                <p className="text-sm text-zinc-500 mt-1">{reviewCount} cartões disponíveis para revisão</p>
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

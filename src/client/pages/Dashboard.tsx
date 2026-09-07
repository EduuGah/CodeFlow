import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchProgress } from '../lib/progress';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { LogOut, Code2, BookOpen, Target, LayoutDashboard, ArrowRight, FolderCode, Trophy } from 'lucide-react';
import {
  getDefaultTrack,
  getNextLesson,
  getTrackProgress,
  listFlashcards,
  listProjects,
} from '../../content';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [completedProjects, setCompletedProjects] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    async function fetchUserData() {
      if (!user) return;

      const progress = await fetchProgress(user.id);
      if (!active) return;

      setCompletedLessons(progress.completedLessons);
      setCompletedProjects(progress.completedProjects);
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
                Você concluiu <strong className="text-zinc-700 font-semibold">{progressPercentage}%</strong> da trilha {track.title}. Continue de onde parou.
              </p>
            </>
          )}
        </div>

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
                <p className="text-sm text-zinc-500 mt-1">Em breve: desafios diários</p>
                <Button variant="outline" size="sm" className="w-full mt-6">Resolver desafio</Button>
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
        <div className="pt-6">
          <div className="flex items-center gap-2 mb-6">
            <FolderCode size={24} className="text-zinc-700" />
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Projetos Práticos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {projects.map((project) => {
              const isCompleted = completedProjects.includes(project.id);

              return (
                <div
                  key={project.id}
                  className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded uppercase tracking-wider">
                      Nível {project.difficulty}
                    </span>
                    {isCompleted && (
                      <span className="text-emerald-500" title="Projeto Entregue">
                        <Trophy size={20} />
                      </span>
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

            {/* Placeholder de Projeto futuro */}
            <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-75">
              <div className="w-12 h-12 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-400 mb-3">
                <LogOut size={24} className="rotate-180" />
              </div>
              <h3 className="text-zinc-600 font-medium">Bloqueado</h3>
              <p className="text-zinc-400 text-sm mt-1">Complete a Lição 3 para desbloquear este projeto.</p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { LogOut, Code2, BookOpen, Target, LayoutDashboard, ArrowRight } from 'lucide-react';
import { mockProgress } from '../data/mock-progress';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    // Simulando o carregamento dos dados de progresso da API
    const timer = setTimeout(() => {
      setIsLoadingData(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const firstName = user?.displayName?.split(' ')[0] || 'Estudante';

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2 text-zinc-900 font-semibold tracking-tight">
          <Code2 size={24} className="text-zinc-900" />
          <span>CodeFlow</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-700 hidden sm:block">
            {user?.displayName || user?.email}
          </span>
          <img 
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || user?.email}&background=random`} 
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
              <p className="text-zinc-500 mt-2 text-lg">Você concluiu <strong className="text-zinc-700 font-semibold">{mockProgress.currentPath.progressPercentage}%</strong> da trilha de JavaScript. Continue de onde parou.</p>
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
                <p className="text-sm text-zinc-500 mt-1">{mockProgress.currentPath.nextLesson}</p>
                <Button size="sm" className="w-full mt-6 gap-2">
                  Continuar aula <ArrowRight size={16} />
                </Button>
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
                <p className="text-sm text-zinc-500 mt-1">{mockProgress.dailyChallenge.title}</p>
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
                <p className="text-sm text-zinc-500 mt-1">{mockProgress.reviews.pendingCount} conceitos aguardam revisão</p>
                <Button variant="secondary" size="sm" className="w-full mt-6">Revisar agora</Button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

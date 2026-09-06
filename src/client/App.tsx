import { Routes, Route, Link } from 'react-router-dom';
import { Code2, ArrowRight } from 'lucide-react';
import { Button } from './components/ui/Button';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

function Landing() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-6">
        <div className="flex items-center gap-2 text-zinc-900 font-semibold tracking-tight">
          <Code2 size={24} className="text-zinc-900" />
          <span>CodeFlow</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <Link to="/login">
            <Button variant="primary" size="sm">Começar</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-2xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900">
              Aprenda a programar resolvendo problemas.
            </h1>
            <p className="text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed">
              Uma plataforma interativa focada em prática real. Sem memorização, sem atalhos. Construa projetos, entenda seus erros e escreva código de verdade.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="gap-2">
                Começar agora
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;

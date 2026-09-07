import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

import { fetchProgress, markProjectCompleted } from '../lib/progress';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { MarkdownReader } from '../components/ui/MarkdownReader';
import { AITutorChat } from '../components/AITutorChat';
import { getProject, listProjects } from '../../content';
import { executeCode, ExecutionResult } from '../lib/sandbox';

export function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const project = (id ? getProject(id) : undefined) ?? listProjects()[0];
  
  const [code, setCode] = useState(project.initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Check if already completed
  useEffect(() => {
    let active = true;

    async function checkStatus() {
      if (!user) return;

      const progress = await fetchProgress(user.id);
      if (active && progress.completedProjects.includes(project.id)) {
        setIsCompleted(true);
      }
    }

    checkStatus();
    return () => {
      active = false;
    };
  }, [user, project.id]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setResult(null);

    // Projetos não têm testes rígidos no MVP: executamos e mostramos o console.
    const execResult = await executeCode(code);
    setResult(execResult);
    setIsRunning(false);
  };

  const handleSubmitProject = async () => {
    if (isCompleted) return;

    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#0ea5e9', '#38bdf8', '#0284c7']
    });

    setIsCompleted(true);

    if (user) {
      try {
        await markProjectCompleted(user.id, project.id);
      } catch (error) {
        console.error('Falha ao salvar conclusão do projeto:', error);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-50 overflow-hidden">
      {/* Top Navigation */}
      <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="px-2 text-zinc-500" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded uppercase tracking-wider">Projeto</span>
            <span className="text-sm font-semibold text-zinc-900">{project.title}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isCompleted && (
            <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 mr-2 bg-emerald-50 px-2 py-1 rounded">
              <CheckCircle2 size={16} /> Entregue
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2" 
            onClick={handleRunCode}
            disabled={isRunning}
          >
            <Play size={16} className={isRunning ? "animate-pulse text-zinc-400" : "text-zinc-700"} />
            {isRunning ? 'Rodando...' : 'Rodar Código'}
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            className="gap-2 bg-blue-600 hover:bg-blue-700" 
            onClick={handleSubmitProject}
            disabled={isCompleted}
          >
            <Send size={16} />
            Submeter Projeto
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* Left Side: Specifications */}
        <div className="w-full md:w-5/12 lg:w-1/3 flex-shrink-0 border-b md:border-b-0 md:border-r border-zinc-200 bg-white overflow-y-auto flex flex-col">
          <div className="p-6 md:p-8 flex-1">
            <MarkdownReader content={project.brief} />
          </div>
        </div>

        {/* Right Side: Code Editor & Console */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="light"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 24,
                padding: { top: 24 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                }
              }}
            />
          </div>

          {/* Console Area */}
          <div className="h-64 border-t border-zinc-200 bg-white flex flex-col">
            <div className="h-10 border-b border-zinc-100 flex items-center px-4 bg-zinc-50 flex-shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Terminal (Console)</span>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-[#1e1e1e] text-zinc-300 font-mono text-sm">
              {!result ? (
                <div className="text-zinc-500 italic">Clique em "Rodar Código" para ver as saídas aqui...</div>
              ) : (
                <div className="space-y-1">
                  {result.logs.length === 0 ? (
                    <div className="text-zinc-500 italic">Nenhum log gerado.</div>
                  ) : (
                    result.logs.map((log, i) => (
                      <div key={i} className="whitespace-pre-wrap">{log}</div>
                    ))
                  )}
                  {result.error && (
                    <div className="text-red-400 mt-4 whitespace-pre-wrap">Erro de Execução: {result.error}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tutor IA Flutuante */}
      <AITutorChat codeContext={code} />
    </div>
  );
}

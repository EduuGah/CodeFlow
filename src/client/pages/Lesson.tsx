import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, ArrowLeft, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';

import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { MarkdownReader } from '../components/ui/MarkdownReader';
import { AITutorChat } from '../components/AITutorChat';
import { mockLesson } from '../data/mock-lesson';
import { executeCodeInWorker, ExecutionResult } from '../lib/sandbox';

export function Lesson() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [code, setCode] = useState(mockLesson.initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  
  // Hints state
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

  // Testes simulados mockados para a Lição 1
  const lessonTests = [
    `if (typeof pontuacao === 'undefined') throw new Error("A variável 'pontuacao' não foi criada.");`,
    `if (pontuacao !== 100) throw new Error("A variável 'pontuacao' deve ter o valor 100.");`,
    `if (typeof jogador === 'undefined') throw new Error("A constante 'jogador' não foi criada.");`
  ];

  const handleRunCode = () => {
    setIsRunning(true);
    setResult(null);
    
    // Pequeno timeout para simular a ida ao Worker
    setTimeout(async () => {
      const execResult = executeCodeInWorker(code, lessonTests);
      setResult(execResult);
      setIsRunning(false);

      // Fase 11 e 14: Salvar progresso e disparar confetes se tudo passar
      if (execResult.testResults.length > 0 && execResult.testResults.every(t => t.passed)) {
        triggerSuccess();
      }
    }, 400);
  };

  const triggerSuccess = async () => {
    // Fase 14: Gamificação visual
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#059669', '#34d399', '#10b981']
    });

    // Fase 11: Salvar Progresso
    if (user) {
      try {
        const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
        const currentLessons = data?.completedLessons || [];
        const currentProjects = data?.completedProjects || [];
        
        if (!currentLessons.includes(mockLesson.id)) {
          await supabase.from('users').upsert({
            id: user.id,
            completedLessons: [...currentLessons, mockLesson.id],
            completedProjects: currentProjects
          });
        }
      } catch (error) {
        console.error('Falha ao salvar progresso (Supabase):', error);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-50 overflow-hidden">
      {/* Top Navigation */}
      <header className="h-14 flex-shrink-0 border-b border-zinc-200 bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="px-2">
            <ArrowLeft size={18} />
          </Button>
          <span className="font-medium text-zinc-900">{mockLesson.title}</span>
        </div>
        
        <Button 
          size="sm" 
          onClick={handleRunCode} 
          disabled={isRunning}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isRunning ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Play size={16} />}
          Executar Código
        </Button>
      </header>

      {/* Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* Left Side: Content */}
        <div className="w-full md:w-5/12 lg:w-1/3 flex-shrink-0 border-b md:border-b-0 md:border-r border-zinc-200 bg-white overflow-y-auto flex flex-col">
          <div className="p-6 md:p-8 flex-1">
            <MarkdownReader content={mockLesson.markdownContent} />
          </div>
          
          {/* Hint Section */}
          {mockLesson.hints && mockLesson.hints.length > 0 && (
            <div className="border-t border-zinc-100 bg-zinc-50/50 p-6">
              {!showHint ? (
                <Button 
                  variant="outline" 
                  className="w-full gap-2 text-zinc-600"
                  onClick={() => setShowHint(true)}
                >
                  <Lightbulb size={16} className="text-amber-500" />
                  Precisa de uma dica?
                </Button>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 font-medium text-amber-800 mb-2">
                    <Lightbulb size={16} className="text-amber-500" />
                    Dica {currentHintIndex + 1} de {mockLesson.hints.length}
                  </div>
                  <p className="text-amber-900 text-sm leading-relaxed">
                    {mockLesson.hints[currentHintIndex]}
                  </p>
                  
                  {currentHintIndex < mockLesson.hints.length - 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-3 text-amber-700 hover:text-amber-800 hover:bg-amber-100 w-full"
                      onClick={() => setCurrentHintIndex(i => i + 1)}
                    >
                      Próxima dica
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Code Editor & Console */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e]">
          <div className="flex-1 min-h-0 relative">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
              }}
            />
          </div>
          
          {/* Terminal / Output Console */}
          <div className="h-56 flex-shrink-0 bg-zinc-950 border-t border-zinc-800 p-4 font-mono text-sm overflow-y-auto">
            <div className="text-zinc-500 mb-2">// Saída do Console & Testes</div>
            
            {!result && !isRunning && (
              <div className="text-zinc-400 flex items-center gap-2">
                Pronto para executar. Pressione "Executar Código".
              </div>
            )}

            {isRunning && (
              <div className="text-zinc-400">Executando ambiente isolado...</div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Erro de Sintaxe / Execução Crítica */}
                {result.error && (
                  <div className="text-red-400 whitespace-pre-wrap">
                    Erro de Sintaxe: {result.error}
                  </div>
                )}
                
                {/* Console Output */}
                {result.output && (
                  <div>
                    <span className="text-zinc-600 mr-2">{'>'}</span>
                    <span className="text-zinc-300 whitespace-pre-wrap">{result.output}</span>
                  </div>
                )}

                {/* Resultados dos Testes */}
                {result.testResults.length > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-zinc-800">
                    {result.testResults.map((test, idx) => (
                      <div key={idx} className={`flex items-start gap-2 ${test.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                        {test.passed ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <XCircle size={16} className="mt-0.5 shrink-0" />}
                        <span>{test.message}</span>
                      </div>
                    ))}
                    
                    {/* Mensagem Final de Sucesso */}
                    {result.testResults.every(t => t.passed) && (
                      <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-md text-emerald-400 font-sans text-center font-medium">
                        🎉 Parabéns! Você concluiu a lição.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
      </div>

      {/* Tutor IA Flutuante */}
      <AITutorChat codeContext={code} />
    </div>
  );
}

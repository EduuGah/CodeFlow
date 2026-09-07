import { useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

import { markLessonCompleted } from '../lib/progress';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { LessonBlocks } from '../components/lesson/LessonBlocks';
import { HintPanel } from '../components/lesson/HintPanel';
import { AITutorChat } from '../components/AITutorChat';
import { getLesson, getNextLesson, getPrimaryCodeExercise } from '../../content';
import { LANGUAGE_LABELS } from '../../content/types';
import { fetchProgress } from '../lib/progress';
import { executeCode, ExecutionResult } from '../lib/sandbox';

export function Lesson() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  // A aula vem da rota. Antes esta página ignorava o :id e sempre mostrava a
  // Lição 1 — o link para a lição 2 no Dashboard abria o conteúdo errado.
  const lesson = id ? getLesson(id) : undefined;
  const exercise = lesson ? getPrimaryCodeExercise(lesson) : undefined;

  const [code, setCode] = useState(exercise?.initialCode ?? '');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  // Conclusão precisa sobreviver ao recarregamento: vem do progresso salvo,
  // não apenas do confete disparado nesta sessão.
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    if (!user) return;

    fetchProgress(user.id).then((progress) => {
      if (active) setCompletedLessons(progress.completedLessons);
    });

    return () => {
      active = false;
    };
  }, [user]);

  // Trocar de aula reaproveita este componente: sem isto, o código da aula
  // anterior continuaria no editor.
  useEffect(() => {
    setCode(exercise?.initialCode ?? '');
    setResult(null);
  }, [exercise?.id, exercise?.initialCode]);

  // Id inexistente ou aula ainda em rascunho: volta ao painel em vez de quebrar.
  if (!lesson || !exercise) {
    return <Navigate to="/dashboard" replace />;
  }

  const hints = exercise.hints;
  const isCompleted = completedLessons.includes(lesson.id);

  // Depois de concluir, o aluno precisa saber para onde ir (§108). A próxima aula
  // sai da lista real de concluídas — usar só a aula atual faria a lição 2
  // apontar de volta para a lição 1.
  const nextLesson = getNextLesson(lesson.trackId, completedLessons);
  const hasNextLesson = nextLesson !== undefined && nextLesson.id !== lesson.id;

  const handleRunCode = async () => {
    setIsRunning(true);
    setResult(null);

    // executeCode roda num Web Worker e já tem timeout próprio.
    const execResult = await executeCode(code, exercise.tests);
    setResult(execResult);
    setIsRunning(false);

    // Fase 11 e 14: Salvar progresso e disparar confetes se tudo passar
    if (execResult.testResults.length > 0 && execResult.testResults.every(t => t.passed)) {
      triggerSuccess();
    }
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
        setCompletedLessons((ids) => (ids.includes(lesson.id) ? ids : [...ids, lesson.id]));
        await markLessonCompleted(user.id, lesson.id);
      } catch (error) {
        console.error('Falha ao salvar progresso da aula:', error);
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
          <span className="font-medium text-zinc-900">{lesson.title}</span>
          <span className="hidden rounded border border-zinc-200 px-1.5 py-0.5 text-xs font-medium text-zinc-500 sm:inline">
            {LANGUAGE_LABELS[lesson.language]}
          </span>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={13} />
              Concluída
            </span>
          )}
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
          <div className="p-6 md:p-8 flex-1 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Objetivo
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">{lesson.objective}</p>
            </div>

            <LessonBlocks blocks={lesson.blocks} />

            <div className="rounded-lg border border-zinc-200 p-4">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Sua tarefa
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                {exercise.prompt}
              </p>
            </div>
          </div>
          
          {/* Dicas do exercício de código; os demais exercícios têm as suas. */}
          <div className="border-t border-zinc-100 bg-zinc-50/50 p-6">
            {/* key: o painel guarda estado próprio e precisa reiniciar em outra aula. */}
            <HintPanel key={exercise.id} hints={hints} />
          </div>
        </div>

        {/* Right Side: Code Editor & Console */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e]">
          <div className="flex-1 min-h-0 relative">
            <Editor
              height="100%"
              language={lesson.language}
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
                {/* Timeout tem tratamento próprio: não é erro do código, é laço sem fim. */}
                {result.timedOut ? (
                  <div className="text-amber-400 whitespace-pre-wrap">
                    Execução interrompida: {result.error}
                  </div>
                ) : (
                  result.error && (
                    <div className="text-red-400 whitespace-pre-wrap">
                      Erro na execução: {result.error}
                    </div>
                  )
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
                    
                    {/* Conclusão: estado claro e um próximo passo explícito. */}
                    {result.testResults.every((t) => t.passed) && (
                      <div className="mt-4 rounded-md border border-emerald-900/50 bg-emerald-950/30 p-4 font-sans">
                        <div className="flex items-center gap-2 font-semibold text-emerald-400">
                          <CheckCircle2 size={18} />
                          Aula concluída
                        </div>
                        <p className="mt-1 text-sm text-emerald-200/70">
                          Todos os testes passaram e seu progresso foi salvo.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {hasNextLesson && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 text-white hover:bg-emerald-700"
                              onClick={() => navigate(`/lesson/${nextLesson.id}`)}
                            >
                              Próxima aula: {nextLesson.title}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-900/60 bg-transparent text-emerald-300 hover:bg-emerald-900/30"
                            onClick={() => navigate('/dashboard')}
                          >
                            Voltar ao painel
                          </Button>
                        </div>
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

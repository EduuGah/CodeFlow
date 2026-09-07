import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { listFlashcards } from '../../content';

export function Review() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  const cards = listFlashcards();
  const currentCard = cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Top Navigation */}
      <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="px-2 text-zinc-500" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} />
          </Button>
          <div className="text-sm font-semibold text-zinc-900">
            Sessão de Revisão
          </div>
        </div>
        <div className="text-sm font-medium text-zinc-500">
          {!completed ? `${currentIndex + 1} / ${cards.length}` : 'Concluído'}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        {completed ? (
          <div className="text-center max-w-md space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">Revisão Concluída!</h2>
              <p className="text-zinc-500 mt-2">Você fortaleceu suas conexões neurais para {cards.length} conceitos. A repetição espaçada é o segredo do aprendizado real.</p>
            </div>
            <Button size="lg" className="w-full" onClick={() => navigate('/dashboard')}>
              Voltar ao Painel
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-xl flex flex-col gap-8">
            {/* Flashcard */}
            <div 
              className="bg-white border border-zinc-200 rounded-2xl p-10 min-h-[300px] shadow-sm flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300"
              onClick={() => setIsFlipped(true)}
            >
              {!isFlipped ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <span className="text-xs font-bold tracking-wider uppercase text-zinc-400">Conceito</span>
                  <h2 className="text-2xl md:text-3xl font-medium text-zinc-900 leading-tight">
                    {currentCard.front}
                  </h2>
                  <p className="text-sm text-zinc-400 mt-8">(Clique no card para revelar a resposta)</p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <span className="text-xs font-bold tracking-wider uppercase text-emerald-500">Resposta</span>
                  <p className="text-xl md:text-2xl text-zinc-700 leading-relaxed">
                    {currentCard.back}
                  </p>
                </div>
              )}
            </div>

            {/* Confidence Buttons */}
            {isFlipped && (
              <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4 fade-in duration-500">
                <p className="text-center text-sm font-medium text-zinc-500 mb-2">Como foi para lembrar disso?</p>
                <div className="grid grid-cols-3 gap-4">
                  <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:border-red-200" onClick={handleNext}>
                    Difícil
                  </Button>
                  <Button variant="outline" className="text-amber-600 hover:bg-amber-50 hover:border-amber-200" onClick={handleNext}>
                    Médio
                  </Button>
                  <Button variant="outline" className="text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200" onClick={handleNext}>
                    Fácil
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

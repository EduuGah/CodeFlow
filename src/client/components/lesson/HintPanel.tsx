import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * Dicas progressivas (§10): o aluno pede uma de cada vez, e elas vão da
 * orientação geral até a solução explicada. Entregar tudo de uma vez elimina
 * justamente o raciocínio que o exercício existe para provocar.
 */
interface HintPanelProps {
  hints: string[];
  className?: string;
  /**
   * Quantas dicas ficaram visíveis. Quem registra a tentativa precisa disso:
   * acertar sem dica e acertar na quarta dica são evidências bem diferentes.
   */
  onRevealedChange?: (count: number) => void;
}

export function HintPanel({ hints, className = '', onRevealedChange }: HintPanelProps) {
  const [visivel, setVisivel] = useState(false);
  const [indice, setIndice] = useState(0);

  const revelar = (novoIndice: number) => {
    setVisivel(true);
    setIndice(novoIndice);
    onRevealedChange?.(novoIndice + 1);
  };

  if (hints.length === 0) return null;

  if (!visivel) {
    return (
      <Button
        variant="outline"
        className={`w-full gap-2 text-zinc-600 ${className}`}
        onClick={() => revelar(0)}
      >
        <Lightbulb size={16} className="text-amber-500" />
        Precisa de uma dica?
      </Button>
    );
  }

  const ultima = indice >= hints.length - 1;

  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 p-4 ${className}`}>
      <div className="mb-2 flex items-center gap-2 font-medium text-amber-800">
        <Lightbulb size={16} className="text-amber-500" />
        Dica {indice + 1} de {hints.length}
      </div>

      <p className="text-sm leading-relaxed text-amber-900">{hints[indice]}</p>

      {!ultima && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full text-amber-700 hover:bg-amber-100 hover:text-amber-800"
          onClick={() => revelar(indice + 1)}
        >
          Próxima dica
        </Button>
      )}
    </div>
  );
}

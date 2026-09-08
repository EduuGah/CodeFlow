import { useState } from 'react';
import { IconHint } from '../ui/Icon';
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
        className={`w-full gap-2 text-ink-soft ${className}`}
        onClick={() => revelar(0)}
      >
        <IconHint size={16} className="text-energy-500" />
        Precisa de uma dica?
      </Button>
    );
  }

  const ultima = indice >= hints.length - 1;

  return (
    <div className={`rounded-lg border border-energy-200 bg-energy-50 p-4 ${className}`}>
      <div className="mb-2 flex items-center gap-2 font-medium text-energy-700">
        <IconHint size={16} className="text-energy-500" />
        Dica {indice + 1} de {hints.length}
      </div>

      <p className="text-sm leading-relaxed text-energy-700">{hints[indice]}</p>

      {!ultima && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full text-energy-700 hover:bg-energy-50 hover:text-energy-700"
          onClick={() => revelar(indice + 1)}
        >
          Próxima dica
        </Button>
      )}
    </div>
  );
}

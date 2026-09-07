import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * Dicas progressivas (§10): o aluno pede uma de cada vez, e elas vão da
 * orientação geral até a solução explicada. Entregar tudo de uma vez elimina
 * justamente o raciocínio que o exercício existe para provocar.
 */
export function HintPanel({ hints, className = '' }: { hints: string[]; className?: string }) {
  const [visivel, setVisivel] = useState(false);
  const [indice, setIndice] = useState(0);

  if (hints.length === 0) return null;

  if (!visivel) {
    return (
      <Button
        variant="outline"
        className={`w-full gap-2 text-zinc-600 ${className}`}
        onClick={() => setVisivel(true)}
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
          onClick={() => setIndice((i) => i + 1)}
        >
          Próxima dica
        </Button>
      )}
    </div>
  );
}

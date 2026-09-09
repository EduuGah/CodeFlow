import { useRef, useState } from 'react';
import { IconHint } from '../ui/Icon';
import { Button } from '../ui/Button';
import { useFocusRescue } from '../../hooks/useFocusRescue';

/**
 * Dicas progressivas (§10): o aluno pede uma de cada vez, e elas vão da
 * orientação geral até a solução explicada. Entregar tudo de uma vez elimina
 * justamente o raciocínio que o exercício existe para provocar.
 *
 * A dica revelada precisa ser **anunciada**, não só desenhada. Quem usa leitor de
 * tela clica em "Precisa de uma dica?" e, sem a região viva, ouve apenas o botão
 * mudar de rótulo — o texto da dica aparece fora do caminho da leitura.
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

  // Na última dica o botão sai da tela. O painel recebe o foco no lugar dele,
  // senão a tabulação seguinte recomeça do topo do documento.
  const painelRef = useRef<HTMLDivElement>(null);
  const ultima = indice >= hints.length - 1;
  useFocusRescue(painelRef, visivel && ultima);

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
        aria-expanded={false}
        className={`min-h-11 w-full gap-2 text-ink-soft ${className}`}
        onClick={() => revelar(0)}
      >
        <IconHint size={16} className="text-energy-500" />
        Precisa de uma dica?
      </Button>
    );
  }

  return (
    <div
      ref={painelRef}
      tabIndex={-1}
      className={`rounded-lg border border-energy-200 bg-energy-50 p-4 ${className}`}
    >
      <div className="mb-2 flex items-center gap-2 font-medium text-energy-700">
        <IconHint size={16} className="text-energy-500" />
        Dica {indice + 1} de {hints.length}
      </div>

      {/* A dica trocada no lugar é uma mudança silenciosa: sem `role="status"`
          quem não vê a tela não fica sabendo que o texto mudou. */}
      <p role="status" className="text-sm leading-relaxed text-energy-700">
        {hints[indice]}
      </p>

      {!ultima && (
        <Button
          variant="ghost"
          className="mt-3 min-h-11 w-full text-energy-700 hover:bg-energy-50 hover:text-energy-700"
          onClick={() => revelar(indice + 1)}
        >
          Próxima dica
        </Button>
      )}
    </div>
  );
}

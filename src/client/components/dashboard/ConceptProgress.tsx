import { getConcept } from '../../../content';
import { MASTERY_LABELS, type ConceptMastery } from '../../lib/mastery';
import { Badge, type BadgeTone } from '../ui/Badge';
import { EmptyState } from '../ui/States';

/**
 * Domínio por conceito, com as evidências à vista.
 *
 * O §282 pede que o aluno saiba de onde saiu cada número — daí exibirmos
 * "3 de 5 tentativas" ao lado do nível, em vez de só um rótulo. Uma métrica que
 * o aluno não consegue auditar vira superstição.
 */

const tonePorNivel: Record<ConceptMastery['level'], BadgeTone> = {
  'nao-iniciado': 'neutral',
  conhecendo: 'neutral',
  praticando: 'caution',
  dominando: 'success',
};

export function ConceptProgress({ mastery }: { mastery: ConceptMastery[] }) {
  const comHistorico = mastery.filter((m) => m.attempts > 0);

  if (comHistorico.length === 0) {
    return (
      <EmptyState
        title="Nada praticado ainda"
        description="Assim que você resolver exercícios, o domínio de cada conceito aparece aqui — com as tentativas que geraram cada avaliação."
      />
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white">
      {comHistorico.map((m) => {
        const conceito = getConcept(m.conceptId);

        return (
          <li key={m.conceptId} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-zinc-900">
                {conceito?.title ?? m.conceptId}
              </span>
              {/* A evidência, não só o veredito. */}
              <span className="block text-sm text-zinc-500">
                {m.correctAttempts} de {m.attempts}{' '}
                {m.attempts === 1 ? 'tentativa' : 'tentativas'} · {m.exercisesSolved}{' '}
                {m.exercisesSolved === 1 ? 'exercício resolvido' : 'exercícios resolvidos'}
              </span>
            </span>

            <span className="flex flex-shrink-0 items-center gap-2">
              {m.needsReview && <Badge tone="caution">Revisar</Badge>}
              <Badge tone={tonePorNivel[m.level]}>{MASTERY_LABELS[m.level]}</Badge>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

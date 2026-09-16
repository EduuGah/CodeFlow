import { CATEGORIAS_DE_CONQUISTA, type Achievement, type CategoriaDeConquista } from '../../lib/gamification';
import { Card, SectionLabel } from '../ui/Card';
import { IconAward, IconLock } from '../ui/Icon';

/**
 * As conquistas, por categoria.
 *
 * Uma grade de pastilhas: a aberta com a medalha e a cor, a fechada com o
 * cadeado e o que falta. As de contagem mostram uma barra fina, para "50
 * exercícios" ser uma meta que se vê aproximar, não uma porta fechada.
 */
const ORDEM: CategoriaDeConquista[] = ['habitos', 'habilidades', 'trilhas', 'marcos'];

export function Conquistas({ conquistas }: { conquistas: Achievement[] }) {
  const abertas = conquistas.filter((c) => c.unlocked).length;

  return (
    <Card as="section" aria-labelledby="titulo-conquistas" className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="titulo-conquistas" className="font-bold text-ink">
          Conquistas
        </h2>
        <span className="label-mono tabular-nums text-ink-faint">
          {abertas} de {conquistas.length}
        </span>
      </div>

      {ORDEM.map((categoria) => {
        const lista = conquistas.filter((c) => c.categoria === categoria);
        if (lista.length === 0) return null;
        return (
          <div key={categoria}>
            <SectionLabel as="h3" className="mb-2">
              {CATEGORIAS_DE_CONQUISTA[categoria]} · {lista.filter((c) => c.unlocked).length}/{lista.length}
            </SectionLabel>
            <ul className="grid gap-2 sm:grid-cols-2">
              {lista.map((c) => (
                <li
                  key={c.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    c.unlocked ? 'border-energy-200 bg-energy-50' : 'border-line bg-canvas'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      c.unlocked ? 'bg-energy-500 text-white' : 'bg-sunken text-ink-faint'
                    }`}
                    aria-hidden
                  >
                    {c.unlocked ? <IconAward size={17} /> : <IconLock size={15} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-semibold ${c.unlocked ? 'text-ink' : 'text-ink-soft'}`}>
                      {c.title}
                    </span>
                    <span className="block text-xs leading-relaxed text-ink-soft">{c.description}</span>
                    {c.progresso && !c.unlocked && (
                      <span className="mt-1.5 flex items-center gap-2">
                        <span className="block h-1 flex-1 overflow-hidden rounded-full bg-sunken" aria-hidden>
                          <span
                            className="block h-full rounded-full bg-energy-500"
                            style={{ width: `${Math.round((c.progresso.atual / c.progresso.meta) * 100)}%` }}
                          />
                        </span>
                        <span className="label-mono tabular-nums text-ink-faint">
                          {c.progresso.atual}/{c.progresso.meta}
                        </span>
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </Card>
  );
}

import { corDaTrilha } from '../../lib/cores-das-trilhas';
import { CATEGORIAS_DE_CONQUISTA, type Achievement, type CategoriaDeConquista } from '../../lib/gamification';
import { Card } from '../ui/Card';
import { iconeDaConquista } from './icones';

/**
 * As conquistas, por categoria.
 *
 * Cada uma é uma medalha: aberta, com o ícone do feito em branco sobre a
 * cor (a da trilha, quando é de trilha; âmbar nas outras); fechada, o mesmo
 * ícone apagado num anel tracejado — a pessoa vê o que está por vir, não um
 * cadeado. As de contagem mostram uma barra fina, para "50 exercícios" ser
 * uma meta que se vê aproximar.
 */
const ORDEM: CategoriaDeConquista[] = ['habitos', 'habilidades', 'trilhas', 'marcos'];

const EXPLICACAO: Record<CategoriaDeConquista, string> = {
  habitos: 'Constância: voltar, insistir, revisar.',
  habilidades: 'O que você já mostrou saber fazer.',
  trilhas: 'Uma por trilha fechada, e uma pelo percurso inteiro.',
  marcos: 'Os números grandes.',
};

export function Medalha({ conquista, size = 44 }: { conquista: Achievement; size?: number }) {
  const Icone = iconeDaConquista(conquista);
  const deTrilha = conquista.id.startsWith('trilha-');
  const cor = deTrilha ? corDaTrilha(conquista.id.slice('trilha-'.length)) : 'var(--color-energy-500)';

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${
        conquista.unlocked ? 'text-white shadow-sm' : 'border-2 border-dashed border-line-strong text-ink-faint'
      }`}
      style={{
        width: size,
        height: size,
        background: conquista.unlocked ? cor : undefined,
        // A de trilha fechada já mostra a cor da trilha no anel: a pessoa
        // reconhece "SQL" antes de ler.
        ...(deTrilha && !conquista.unlocked ? { borderColor: cor, color: cor, opacity: 0.7 } : {}),
      }}
      aria-hidden
    >
      <Icone size={Math.round(size * 0.5)} strokeWidth={conquista.unlocked ? 2 : 1.75} />
    </span>
  );
}

export function Conquistas({ conquistas }: { conquistas: Achievement[] }) {
  return (
    <div className="space-y-6">
      {ORDEM.map((categoria) => {
        const lista = conquistas.filter((c) => c.categoria === categoria);
        if (lista.length === 0) return null;
        const abertas = lista.filter((c) => c.unlocked).length;
        return (
          <section key={categoria} aria-labelledby={`conquistas-${categoria}`}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h2 id={`conquistas-${categoria}`} className="font-bold text-ink">
                {CATEGORIAS_DE_CONQUISTA[categoria]}{' '}
                <span className="label-mono ml-1 tabular-nums text-ink-faint">
                  {abertas}/{lista.length}
                </span>
              </h2>
              <p className="hidden text-xs text-ink-faint sm:block">{EXPLICACAO[categoria]}</p>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {lista.map((c) => (
                <Card
                  as="li"
                  key={c.id}
                  padding="sm"
                  tone={c.unlocked ? 'caution' : 'default'}
                  className="flex items-center gap-3"
                >
                  <Medalha conquista={c} />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-semibold ${c.unlocked ? 'text-ink' : 'text-ink-soft'}`}>
                      {c.title}
                    </span>
                    <span className="block text-xs leading-relaxed text-ink-soft">{c.description}</span>
                    {c.progresso && !c.unlocked && (
                      <span className="mt-1.5 flex items-center gap-2">
                        <span
                          role="progressbar"
                          aria-valuenow={c.progresso.atual}
                          aria-valuemin={0}
                          aria-valuemax={c.progresso.meta}
                          aria-label={`${c.title}: ${c.progresso.atual} de ${c.progresso.meta}`}
                          className="block h-1 flex-1 overflow-hidden rounded-full bg-sunken"
                        >
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
                </Card>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

import { corDaTrilha } from '../../lib/cores-das-trilhas';
import { CATEGORIAS_DE_CONQUISTA, type Achievement, type CategoriaDeConquista } from '../../lib/gamification';
import { Card } from '../ui/Card';
import { IconFlag, IconTrack } from '../ui/Icon';
import { iconeDaConquista } from './icones';

/**
 * As conquistas: destaque de perto, depois por categoria.
 *
 * Duas categorias — trilhas e etapas — crescem com o catálogo (uma por
 * trilha, uma por etapa do percurso) e não cabem como cards grandes sem virar
 * uma parede repetitiva: o texto de cada uma só muda o nome do assunto. Elas
 * viram uma grade compacta de emblemas, só ícone, nome e progresso — a mesma
 * informação, sem o peso de um card por item. As outras categorias, com menos
 * itens e mais variedade de texto, continuam como cards.
 *
 * Acima de tudo, um destaque: até quatro conquistas em progresso, as mais
 * perto de fechar — a diferença entre "há 41 conquistas" e "faltam 2
 * exercícios para a próxima".
 */
const ORDEM: CategoriaDeConquista[] = ['habitos', 'habilidades', 'trilhas', 'etapas', 'marcos'];
const CATEGORIAS_COMPACTAS = new Set<CategoriaDeConquista>(['trilhas', 'etapas']);

const EXPLICACAO: Record<CategoriaDeConquista, string> = {
  habitos: 'Constância: voltar, insistir, revisar.',
  habilidades: 'O que você já mostrou saber fazer.',
  trilhas: 'Uma por trilha fechada, e uma pelo percurso inteiro.',
  etapas: 'Uma por etapa do percurso, quando todas as trilhas dela fecham.',
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

/** Uma pastilha entre 0 e 100 — porcentagem do progresso, ou 100 se já aberta. */
function percentual(c: Achievement): number {
  if (c.unlocked) return 100;
  if (!c.progresso || c.progresso.meta === 0) return 0;
  return Math.round((c.progresso.atual / c.progresso.meta) * 100);
}

/**
 * As conquistas mais perto de fechar, ainda não abertas.
 *
 * Só entram as que têm progresso registrado (contagem, não binárias) e já
 * saíram do zero — senão o destaque viraria "tudo que falta fazer", em vez de
 * "o que está quase pronto".
 */
function maisProximas(conquistas: Achievement[], max = 4): Achievement[] {
  return conquistas
    .filter((c) => !c.unlocked && c.progresso && c.progresso.atual > 0)
    .sort((a, b) => percentual(b) - percentual(a))
    .slice(0, max);
}

function Destaque({ conquistas }: { conquistas: Achievement[] }) {
  const proximas = maisProximas(conquistas);
  if (proximas.length === 0) return null;

  return (
    <section aria-labelledby="conquistas-destaque">
      <h2 id="conquistas-destaque" className="mb-2 font-bold text-ink">
        Quase lá
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {proximas.map((c) => (
          <Card as="li" key={c.id} tone="brand" padding="sm" className="flex items-center gap-3">
            <Medalha conquista={c} size={40} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">{c.title}</span>
              <span className="mt-1.5 flex items-center gap-2">
                <span
                  role="progressbar"
                  aria-valuenow={c.progresso!.atual}
                  aria-valuemin={0}
                  aria-valuemax={c.progresso!.meta}
                  aria-label={`${c.title}: ${c.progresso!.atual} de ${c.progresso!.meta}`}
                  className="block h-1.5 flex-1 overflow-hidden rounded-full bg-sunken"
                >
                  <span className="block h-full rounded-full bg-brand-600" style={{ width: `${percentual(c)}%` }} />
                </span>
                <span className="label-mono shrink-0 tabular-nums text-ink-faint">
                  {c.progresso!.atual}/{c.progresso!.meta}
                </span>
              </span>
            </span>
          </Card>
        ))}
      </ul>
    </section>
  );
}

/** Um emblema pequeno: ícone, nome, progresso — sem descrição visível. */
function EmblemaCompacto({ conquista }: { conquista: Achievement }) {
  const percent = percentual(conquista);
  return (
    <li title={conquista.description}>
      <div
        className={`flex h-full flex-col items-center gap-1.5 rounded-lg border p-2.5 text-center ${
          conquista.unlocked ? 'border-line bg-surface' : 'border-line bg-sunken'
        }`}
      >
        <Medalha conquista={conquista} size={36} />
        <span
          className={`line-clamp-2 text-xs font-semibold leading-tight ${
            conquista.unlocked ? 'text-ink' : 'text-ink-soft'
          }`}
        >
          {conquista.title}
        </span>
        {!conquista.unlocked && conquista.progresso && (
          <span className="label-mono tabular-nums text-ink-faint">{percent}%</span>
        )}
      </div>
    </li>
  );
}

function ParedeDeEmblemas({ conquistas }: { conquistas: Achievement[] }) {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
      {conquistas.map((c) => (
        <EmblemaCompacto key={c.id} conquista={c} />
      ))}
    </ul>
  );
}

export function Conquistas({ conquistas }: { conquistas: Achievement[] }) {
  return (
    <div className="space-y-6">
      <Destaque conquistas={conquistas} />
      {ORDEM.map((categoria) => {
        const lista = conquistas.filter((c) => c.categoria === categoria);
        if (lista.length === 0) return null;
        const abertas = lista.filter((c) => c.unlocked).length;
        const compacta = CATEGORIAS_COMPACTAS.has(categoria);
        return (
          <section key={categoria} aria-labelledby={`conquistas-${categoria}`}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h2 id={`conquistas-${categoria}`} className="flex items-center gap-1.5 font-bold text-ink">
                {categoria === 'etapas' && <IconFlag size={15} className="text-ink-faint" aria-hidden />}
                {categoria === 'trilhas' && <IconTrack size={15} className="text-ink-faint" aria-hidden />}
                {CATEGORIAS_DE_CONQUISTA[categoria]}{' '}
                <span className="label-mono ml-1 tabular-nums text-ink-faint">
                  {abertas}/{lista.length}
                </span>
              </h2>
              <p className="hidden text-xs text-ink-faint sm:block">{EXPLICACAO[categoria]}</p>
            </div>
            {compacta ? (
              <ParedeDeEmblemas conquistas={lista} />
            ) : (
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
            )}
          </section>
        );
      })}
    </div>
  );
}

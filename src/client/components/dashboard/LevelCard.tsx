import { useState } from 'react';
import { IconCheck, IconChevronDown } from '../ui/Icon';
import type { Achievement, LevelInfo, XpBreakdown } from '../../lib/gamification';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

/**
 * Nível e conquistas.
 *
 * Contido de propósito. O §19 pede gamificação que incentive sem virar jogo
 * infantil, e o §175 alerta contra transformar o XP no objetivo. Por isso:
 * sem animação de pontos subindo, sem medalha brilhante, sem ranking.
 *
 * As conquistas travadas ficam visíveis com a descrição do que falta — servem
 * de sugestão de próximo passo, não de vitrine de troféus.
 */
interface LevelCardProps {
  level: LevelInfo;
  breakdown: XpBreakdown;
  achievements: Achievement[];
}

export function LevelCard({ level, breakdown, achievements }: LevelCardProps) {
  const [aberto, setAberto] = useState(false);

  const desbloqueadas = achievements.filter((a) => a.unlocked);

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">
          Nível {level.level} · {level.title}
        </h2>
        <span className="text-sm tabular-nums text-ink-faint">{level.xp} XP</span>
      </div>

      {level.xpForNextLevel === null ? (
        <p className="mt-2 text-sm text-ink-faint">
          Você chegou ao último nível desta versão da plataforma.
        </p>
      ) : (
        <ProgressBar
          label={`Rumo a ${level.nextTitle}`}
          value={level.xpIntoLevel}
          max={level.xpForNextLevel}
          showCount
          className="mt-4"
        />
      )}

      {/* Transparência do §282: de onde veio cada ponto. */}
      <p className="mt-3 text-xs leading-relaxed text-ink-faint">
        {breakdown.exercicios} de exercícios · {breakdown.aulas} de aulas ·{' '}
        {breakdown.projetos} de projetos · {breakdown.revisao} de revisão
      </p>

      <div className="mt-5 border-t border-line pt-4">
        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          aria-expanded={aberto}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <span className="text-sm font-medium text-ink-soft">
            Conquistas{' '}
            <span className="font-normal text-ink-faint">
              ({desbloqueadas.length} de {achievements.length})
            </span>
          </span>
          <IconChevronDown
            size={16}
            className={`text-ink-faint transition-transform ${aberto ? 'rotate-180' : ''}`}
          />
        </button>

        {aberto && (
          <ul className="mt-4 space-y-3">
            {achievements.map((a) => (
              <li key={a.id} className="flex gap-3">
                <span
                  className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                    a.unlocked ? 'bg-success-600 text-white' : 'bg-sunken text-ink-faint'
                  }`}
                >
                  <IconCheck size={12} strokeWidth={3} />
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      a.unlocked ? 'text-ink' : 'text-ink-faint'
                    }`}
                  >
                    {a.title}
                  </p>
                  <p className="text-sm leading-relaxed text-ink-faint">{a.description}</p>
                </div>

                {a.unlocked && <Badge tone="success">Conquistada</Badge>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

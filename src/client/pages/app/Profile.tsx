import { getConcept } from '../../../content';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentData } from '../../contexts/StudentDataContext';
import { MASTERY_LABELS, type ConceptMastery } from '../../lib/mastery';
import { IconCheck, IconExit, IconStreak } from '../../components/ui/Icon';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Carregando, Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/States';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

/**
 * Perfil e evolução.
 *
 * Reúne o que o aluno consulta de vez em quando, não a cada sessão: nível,
 * conquistas e domínio por conceito. Tirar isso da tela inicial foi metade do
 * trabalho de fazer o início responder "o que eu faço agora".
 *
 * Todo número aparece com a evidência que o gerou (§282). Métrica que a pessoa
 * não consegue auditar vira superstição.
 */

const tonePorNivel: Record<ConceptMastery['level'], BadgeTone> = {
  'nao-iniciado': 'neutral',
  conhecendo: 'neutral',
  praticando: 'caution',
  dominando: 'success',
};

export function Profile() {
  useDocumentTitle('Perfil');
  const { user, logout } = useAuth();
  const { loading, level, xp, achievements, mastery, stats, streak, completedLessons } =
    useStudentData();

  const nomeCompleto = user?.user_metadata?.full_name as string | undefined;
  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const comHistorico = mastery.filter((m) => m.attempts > 0);
  const conquistadas = achievements.filter((a) => a.unlocked);

  if (loading) {
    return (
      <Carregando o="seu perfil">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </Carregando>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="h-14 w-14 shrink-0 rounded-full bg-sunken object-cover"
          />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
            {(nomeCompleto ?? user?.email ?? '?').charAt(0).toUpperCase()}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-extrabold tracking-tight text-ink">
            {nomeCompleto ?? user?.email ?? 'Estudante'}
          </h1>
          <p className="label-mono text-ink-faint">
            Nível {level.level} · {level.title}
          </p>
        </div>
      </header>

      <section className="rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold text-ink">{level.xp} XP</h2>
          {streak > 0 && (
            <span className="flex items-center gap-1.5 text-sm font-bold text-energy-700">
              <IconStreak size={16} />
              {streak} {streak === 1 ? 'dia seguido' : 'dias seguidos'}
            </span>
          )}
        </div>

        {level.xpForNextLevel === null ? (
          <p className="mt-2 text-sm text-ink-soft">
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

        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          {xp.exercicios} de exercícios · {xp.aulas} de aulas · {xp.projetos} de projetos ·{' '}
          {xp.revisao} de revisão
        </p>
      </section>

      <section>
        <h2 className="label-mono mb-3 text-ink-faint">
          Conquistas ({conquistadas.length} de {achievements.length})
        </h2>

        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {achievements.map((a) => (
            <li key={a.id} className="flex items-start gap-3 p-4">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  a.unlocked ? 'bg-success-600 text-white' : 'bg-sunken text-ink-faint'
                }`}
              >
                <IconCheck size={14} strokeWidth={2.5} />
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={`block font-semibold ${a.unlocked ? 'text-ink' : 'text-ink-faint'}`}
                >
                  {a.title}
                </span>
                <span className="block text-sm leading-relaxed text-ink-soft">{a.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="label-mono mb-1 text-ink-faint">Domínio por conceito</h2>
        <p className="mb-3 text-sm leading-relaxed text-ink-soft">
          Vem das suas tentativas, não das aulas concluídas.
        </p>

        {comHistorico.length === 0 ? (
          <EmptyState
            title="Nada praticado ainda"
            description="Assim que você resolver exercícios, o domínio de cada conceito aparece aqui — com as tentativas que geraram cada avaliação."
          />
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {comHistorico.map((m) => (
              <li key={m.conceptId} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">
                    {getConcept(m.conceptId)?.title ?? m.conceptId}
                  </span>
                  <span className="block text-sm text-ink-soft">
                    {m.correctAttempts} de {m.attempts}{' '}
                    {m.attempts === 1 ? 'tentativa' : 'tentativas'} · {m.exercisesSolved}{' '}
                    {m.exercisesSolved === 1 ? 'exercício resolvido' : 'exercícios resolvidos'}
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-2">
                  {m.needsReview && <Badge tone="caution">Revisar</Badge>}
                  <Badge tone={tonePorNivel[m.level]}>{MASTERY_LABELS[m.level]}</Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-line pt-6">
        <p className="mb-4 text-sm text-ink-faint">
          {completedLessons.length}{' '}
          {completedLessons.length === 1 ? 'aula concluída' : 'aulas concluídas'} ·{' '}
          {stats.exercisesSolved}{' '}
          {stats.exercisesSolved === 1 ? 'exercício resolvido' : 'exercícios resolvidos'}
        </p>

        <Button variant="outline" onClick={logout} className="gap-2">
          <IconExit size={17} />
          Sair da conta
        </Button>
      </section>
    </div>
  );
}

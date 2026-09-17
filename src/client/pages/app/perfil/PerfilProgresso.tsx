import { Link } from 'react-router-dom';

import { getConcept, getTrackProgress, listTracks } from '../../../../content';
import { CabecalhoDaSecao } from '../../../components/perfil/CabecalhoDaSecao';
import { Badge, type BadgeTone } from '../../../components/ui/Badge';
import { Card, SectionLabel } from '../../../components/ui/Card';
import { IconBolt, IconStreak } from '../../../components/ui/Icon';
import { EmblemaDaTrilha } from '../../../components/ui/Emblema';
import { VinhetaCaixa, VinhetaGrafico } from '../../../components/ui/Ilustracao';
import { Carregando, Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/States';
import { useStudentData } from '../../../contexts/StudentDataContext';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { corDaTrilha } from '../../../lib/cores-das-trilhas';
import { proximaFaixa, xpMinimoDoNivel } from '../../../lib/gamification';
import { MASTERY_LABELS, type ConceptMastery } from '../../../lib/mastery';

/**
 * Progresso: os números com a evidência que os gerou.
 *
 * O XP e de onde ele veio, o nível e o que o próximo título pede, a barra
 * de cada trilha na cor dela, a maior sequência, e o domínio por conceito —
 * que vem das tentativas, não das aulas concluídas. É a página para quem
 * quer auditar o número que viu no cabeçalho do perfil.
 */
const tonePorNivel: Record<ConceptMastery['level'], BadgeTone> = {
  'nao-iniciado': 'neutral',
  conhecendo: 'neutral',
  praticando: 'caution',
  dominando: 'success',
};

export function PerfilProgresso() {
  useDocumentTitle('Progresso');
  const { loading, level, xp, mastery, stats, sequencia, completedLessons, dobro } = useStudentData();

  const comHistorico = mastery.filter((m) => m.attempts > 0);
  const faixa = proximaFaixa(level.level);
  const trilhas = listTracks().map((t) => ({ track: t, ...getTrackProgress(t.id, completedLessons) }));

  return (
    <div className="space-y-6">
      <CabecalhoDaSecao
        titulo="Progresso"
        descricao="Cada número com a origem dele. Vem das suas tentativas, não de um contador."
        tom="success"
        vinheta={<VinhetaGrafico size={44} />}
      />

      {loading ? (
        <Carregando o="o progresso">
          <Skeleton className="h-40 w-full rounded-xl" />
        </Carregando>
      ) : (
        <>
          <Card as="section" aria-labelledby="titulo-nivel">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="titulo-nivel" className="font-bold text-ink">
                {level.xp} XP
              </h2>
              {dobro && (
                <span className="flex items-center gap-1.5 text-sm font-bold text-brand-700">
                  <IconBolt size={16} />
                  dobro de XP até {dobro.ate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-ink-soft">
                  Nível {level.level} → {level.level + 1}
                  {level.proximoMudaTitulo ? ` · vira ${level.nextTitle}` : ''}
                </span>
                <span className="text-xs tabular-nums text-ink-faint">
                  {level.xpIntoLevel} de {level.xpForNextLevel}
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={level.xpIntoLevel}
                aria-valuemin={0}
                aria-valuemax={level.xpForNextLevel}
                aria-label={`Rumo ao nível ${level.level + 1}`}
                className="h-2 w-full overflow-hidden rounded-full bg-line"
              >
                <div
                  className="h-full rounded-full bg-brand-600 transition-[width] duration-500"
                  style={{ width: `${Math.round((level.xpIntoLevel / level.xpForNextLevel) * 100)}%` }}
                />
              </div>
            </div>

            {/* De onde o XP veio. É uma partição, então cada fonte vem com o número. */}
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
              {[
                ['exercícios', xp.exercicios],
                ['aulas', xp.aulas],
                ['projetos', xp.projetos],
                ['revisão', xp.revisao],
                ['desafios', xp.desafios],
                ['vindos do dobro', xp.dobrado],
              ].map(([fonte, valor]) => (
                <div key={fonte} className="flex items-baseline justify-between gap-2 border-b border-line pb-1">
                  <dt className="text-ink-soft">{fonte}</dt>
                  <dd className="font-semibold tabular-nums text-ink">{valor}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-ink-faint">
              {faixa
                ? `O título ${faixa.title} começa no nível ${faixa.aPartirDe}, com ${xpMinimoDoNivel(faixa.aPartirDe)} XP. `
                : 'Você está na última faixa de título; os níveis continuam. '}
              Exercícios contam uma vez; velocidade não conta.
            </p>
          </Card>

          <Card as="section" aria-labelledby="titulo-trilhas">
            <h2 id="titulo-trilhas" className="font-bold text-ink">
              Trilhas
            </h2>
            <ul className="mt-3 space-y-3">
              {trilhas.map(({ track, completed, total, percentage }) => (
                <li key={track.id}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <Link to={`/app/trilhas/${track.id}`} className="flex items-center gap-2 font-semibold text-ink hover:underline">
                      <EmblemaDaTrilha trackId={track.id} size={22} />
                      {track.title}
                    </Link>
                    <span className="label-mono tabular-nums text-ink-faint">
                      {completed}/{total} aulas
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={completed}
                    aria-valuemin={0}
                    aria-valuemax={total}
                    aria-label={`${track.title}: ${completed} de ${total} aulas`}
                    className="h-2 w-full overflow-hidden rounded-full bg-sunken"
                  >
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${percentage}%`, background: corDaTrilha(track.id) }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card as="section" aria-labelledby="titulo-constancia" className="flex flex-wrap items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-energy-50 text-energy-700" aria-hidden>
              <IconStreak size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="titulo-constancia" className="font-bold text-ink">
                Constância
              </h2>
              <p className="text-sm leading-relaxed text-ink-soft">
                Sequência atual de {sequencia.atual} {sequencia.atual === 1 ? 'dia' : 'dias'}; a maior foi de{' '}
                {sequencia.recorde}. {stats.activeDays} {stats.activeDays === 1 ? 'dia de estudo' : 'dias de estudo'} no
                total
                {sequencia.diasCongelados.length > 0
                  ? `, ${sequencia.diasCongelados.length} ${sequencia.diasCongelados.length === 1 ? 'dia salvo' : 'dias salvos'} por congelamento`
                  : ''}
                .
              </p>
            </div>
          </Card>

          <section aria-labelledby="titulo-dominio">
            <SectionLabel as="h2" id="titulo-dominio" className="mb-1">
              Domínio por conceito
            </SectionLabel>
            <p className="mb-3 text-sm leading-relaxed text-ink-soft">
              Vem das suas tentativas, não das aulas concluídas.
            </p>

            {comHistorico.length === 0 ? (
              <EmptyState
                vinheta={<VinhetaCaixa size={52} />}
                title="Nada praticado ainda"
                description="Assim que você resolver exercícios, o domínio de cada conceito aparece aqui — com as tentativas que geraram cada avaliação."
              />
            ) : (
              <Card as="ul" padding="none" className="divide-y divide-line overflow-hidden">
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
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  );
}

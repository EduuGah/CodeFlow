import { Link } from 'react-router-dom';

import { LANGUAGE_LABELS } from '../../../content/types';
import { corDaTrilha } from '../../lib/cores-das-trilhas';
import { formatarDuracao, type EtapaMontada, type TrilhaNoPercurso } from '../../lib/percurso';
import { buttonClasses } from '../ui/Button';
import { EmblemaDaTrilha } from '../ui/Emblema';
import { IconArrowRight, IconCheck } from '../ui/Icon';

/**
 * O percurso na tela: as trilhas em etapas, com o ponto em que a pessoa está.
 *
 * Duas densidades, uma forma. Na tela inicial o percurso é o mapa ao lado
 * da ação — uma linha por trilha, número, nome e quanto já foi. Na tela de
 * trilhas ele é a própria tela — a mesma linha, com o que a trilha ensina,
 * o tamanho dela e, na trilha da vez, o botão de continuar.
 *
 * Não são cards. Sete cards iguais numa grade não dizem por onde começar; uma
 * lista numerada em três etapas diz. O marco à esquerda é o mesmo da linha do
 * tempo das aulas — feito, aqui, depois — para a leitura ser a mesma nas
 * duas escalas.
 */

/**
 * O marco leva a cor da trilha: cheio na trilha da vez e nas concluídas,
 * só o contorno nas outras. É a mesma cor da faixa da trilha e do cabeçalho
 * das aulas dela — a pessoa reconhece o assunto pela cor.
 */
function Marco({ trilha, atual }: { trilha: TrilhaNoPercurso; atual: boolean }) {
  const cor = corDaTrilha(trilha.track.id);
  const cheio = atual || trilha.estado === 'concluida';
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold"
      style={cheio ? { borderColor: cor, background: cor, color: '#fff' } : { borderColor: cor, color: cor }}
      aria-hidden
    >
      {trilha.estado === 'concluida' ? <IconCheck size={15} strokeWidth={3} /> : trilha.posicao}
    </span>
  );
}

function Barra({ trilha }: { trilha: TrilhaNoPercurso }) {
  return (
    <span className="block h-1 w-full overflow-hidden rounded-full bg-sunken" aria-hidden>
      <span
        className="block h-full rounded-full"
        style={{ width: `${trilha.resumo.percentage}%`, background: corDaTrilha(trilha.track.id) }}
      />
    </span>
  );
}

/** A tela inicial: uma linha por trilha, com o ponto atual em destaque. */
export function PercursoCompacto({ etapas, atualId }: { etapas: EtapaMontada[]; atualId?: string }) {
  return (
    <div>
      {etapas.map((etapa) => (
        <div key={etapa.numero}>
          {/* O nome da etapa é o que dá sentido à ordem: "A base" antes de
              "A web" explica por que JavaScript vem antes de A Página. */}
          <p className="label-mono mt-3 pl-11 text-ink-faint first:mt-0">
            {etapa.numero} · {etapa.etapa.title}
          </p>
          <ol className="divide-y divide-line">
            {etapa.trilhas.map((trilha) => {
              const atual = trilha.track.id === atualId;
              return (
                <li key={trilha.track.id}>
                  <Link
                    to={`/app/trilhas/${trilha.track.id}`}
                    aria-current={atual ? 'step' : undefined}
                    className="-mx-2 flex items-center gap-3.5 rounded-lg px-2 py-3 transition-colors hover:bg-sunken"
                  >
                    <Marco trilha={trilha} atual={atual} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span
                          className={`truncate text-sm font-semibold ${
                            atual ? 'text-ink' : trilha.estado === 'nao-iniciada' ? 'text-ink-soft' : 'text-ink'
                          }`}
                        >
                          {trilha.track.title}
                        </span>
                        <span className="label-mono shrink-0 tabular-nums text-ink-faint">
                          {trilha.resumo.completed}/{trilha.resumo.total}
                        </span>
                      </span>
                      <span className="mt-1.5 block">
                        <Barra trilha={trilha} />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}

/** A tela de trilhas: as etapas com nome, e cada trilha com o que ensina. */
export function PercursoDetalhado({ etapas, atualId }: { etapas: EtapaMontada[]; atualId?: string }) {
  return (
    <div className="space-y-9">
      {etapas.map((etapa) => (
        <section key={etapa.numero} aria-labelledby={`etapa-${etapa.numero}`}>
          <header className="mb-2">
            <h2 id={`etapa-${etapa.numero}`} className="text-base font-bold tracking-tight text-ink">
              <span className="label-mono mr-2 text-ink-faint">Etapa {etapa.numero}</span>
              {etapa.etapa.title}
            </h2>
            <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{etapa.etapa.description}</p>
          </header>

          <ol className="divide-y divide-line border-y border-line">
            {etapa.trilhas.map((trilha) => {
              const atual = trilha.track.id === atualId;
              const blocos = trilha.track.sections?.length ?? 1;
              const proxima = trilha.resumo.current;

              return (
                <li key={trilha.track.id} className={atual ? '-mx-3 rounded-xl bg-surface px-3 ring-1 ring-line' : ''}>
                  <div className="flex gap-3.5 py-4">
                    <Marco trilha={trilha} atual={atual} />

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/app/trilhas/${trilha.track.id}`}
                        className="group block"
                        aria-current={atual ? 'step' : undefined}
                      >
                        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                          <span className="text-base font-bold tracking-tight text-ink group-hover:text-brand-700">
                            {trilha.track.title}
                          </span>
                          <span className="label-mono tabular-nums text-ink-faint">
                            {trilha.estado === 'concluida'
                              ? 'concluída'
                              : `${trilha.resumo.completed} de ${trilha.resumo.total} aulas`}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
                          {trilha.track.description}
                        </span>
                        <span className="label-mono mt-2 block text-ink-faint">
                          {LANGUAGE_LABELS[trilha.track.language]} · {trilha.resumo.total} aulas
                          {blocos > 1 ? ` em ${blocos} blocos` : ''} · {formatarDuracao(trilha.minutos)}
                        </span>
                      </Link>

                      {(trilha.estado !== 'nao-iniciada' || atual) && (
                        <span className="mt-2.5 block">
                          <Barra trilha={trilha} />
                        </span>
                      )}

                      {/* Um botão na página inteira: o da trilha da vez. As outras
                          se abrem pelo nome — e lá dentro cada aula tem o seu link. */}
                      {atual && proxima && (
                        <Link
                          to={`/lesson/${proxima.lesson.id}`}
                          className={buttonClasses({ size: 'sm', className: 'mt-3' })}
                        >
                          {trilha.estado === 'em-andamento' ? 'Continuar' : 'Começar'}: {proxima.position}.{' '}
                          {proxima.lesson.title}
                          <IconArrowRight size={16} />
                        </Link>
                      )}
                    </div>

                    {/* O emblema, do lado de fora do link: a figura do assunto
                        ao lado do nome, para a lista não ser só texto. */}
                    <EmblemaDaTrilha trackId={trilha.track.id} size={40} className="hidden shrink-0 sm:block" />
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';

import { getConcept } from '../../../content';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentData } from '../../contexts/StudentDataContext';
import { MASTERY_LABELS, type ConceptMastery } from '../../lib/mastery';
import { nomeParaMostrar } from '../../lib/perfil';
import { proximaFaixa, xpMinimoDoNivel } from '../../lib/gamification';
import { Aparencia } from '../../components/perfil/Aparencia';
import { Conquistas } from '../../components/perfil/Conquistas';
import { ListaDeDesafios } from '../../components/perfil/Desafios';
import { EditarPerfil } from '../../components/perfil/EditarPerfil';
import { Loja } from '../../components/perfil/Loja';
import { Avatar } from '../../components/ui/Avatar';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, SectionLabel, cardClasses } from '../../components/ui/Card';
import { IconArrowRight, IconBolt, IconCoin, IconEdit, IconExit, IconFreeze, IconStreak } from '../../components/ui/Icon';
import { Carregando, Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/States';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useUserRole } from '../../hooks/useUserRole';

/**
 * Perfil e evolução.
 *
 * Reúne o que o aluno consulta de vez em quando, não a cada sessão: quem ele
 * é aqui (nome e avatar, editáveis), o nível e o XP, as moedas e a loja, os
 * desafios do dia e da semana, as conquistas por categoria, o domínio por
 * conceito e a aparência. A ordem é a da frequência de uso: o que muda todo
 * dia (desafios, nível) em cima; o que se ajusta uma vez (aparência) embaixo.
 *
 * Todo número aparece com a evidência que o gerou (§282). Métrica que a pessoa
 * não consegue auditar vira superstição — e isso vale para as moedas também.
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
  const { papel } = useUserRole();
  const {
    loading,
    level,
    xp,
    achievements,
    mastery,
    stats,
    sequencia,
    completedLessons,
    perfil,
    moedas,
    desafios,
    dobro,
  } = useStudentData();
  const [editando, setEditando] = useState(false);

  const nome = nomeParaMostrar(perfil, user);
  const fotoDoGoogle = user?.user_metadata?.avatar_url as string | undefined;
  const comHistorico = mastery.filter((m) => m.attempts > 0);

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
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Avatar escolhido={perfil.avatar} fotoDoGoogle={fotoDoGoogle} nome={nome} size={64} />

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-extrabold tracking-tight text-ink">{nome}</h1>
          <p className="label-mono text-ink-faint">
            Nível {level.level} · {level.title}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditando((v) => !v)}
            aria-expanded={editando}
            icon={<IconEdit size={16} />}
            className="h-11 gap-1.5 px-4"
          >
            Editar
          </Button>
          {/* Sair morava no fim da página, depois de toda a lista de conceitos.
              Sair da conta é uma ação que se procura, não o passo final de
              uma leitura. */}
          <Button variant="ghost" size="sm" onClick={logout} icon={<IconExit size={16} />} className="h-11 gap-1.5 px-4">
            Sair
          </Button>
        </div>
      </header>

      {editando && <EditarPerfil aoFechar={() => setEditando(false)} />}

      {/* A faixa: os três números que mudam todo dia, com a evidência de cada um. */}
      <dl className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className={cardClasses({ padding: 'sm', className: 'min-w-0' })}>
          <dt className="label-mono text-ink-faint">Sequência</dt>
          <dd className="mt-1 flex items-center gap-1.5 text-xl font-extrabold tabular-nums text-ink">
            <IconStreak size={18} className="text-energy-700" />
            {sequencia.atual}
            <span className="text-sm font-normal text-ink-soft">{sequencia.atual === 1 ? 'dia' : 'dias'}</span>
          </dd>
          <dd className="mt-0.5 truncate text-xs text-ink-faint">
            {sequencia.atual === 0
              ? 'estude hoje para começar'
              : sequencia.estudouHoje
                ? 'hoje já contou'
                : 'estude hoje para manter'}
            {sequencia.congelamentosRestantes > 0 && (
              <span className="ml-1 inline-flex items-center gap-0.5 text-brand-700">
                <IconFreeze size={11} />
                {sequencia.congelamentosRestantes}
              </span>
            )}
          </dd>
        </div>

        <div className={cardClasses({ padding: 'sm', className: 'min-w-0' })}>
          <dt className="label-mono text-ink-faint">Moedas</dt>
          <dd className="mt-1 flex items-center gap-1.5 text-xl font-extrabold tabular-nums text-ink">
            <IconCoin size={18} className="text-energy-700" />
            {moedas.saldo}
          </dd>
          <dd className="mt-0.5 truncate text-xs text-ink-faint">
            <a href="#titulo-loja" className="text-brand-700 hover:underline">
              gastar na loja
            </a>
          </dd>
        </div>

        <div className={cardClasses({ padding: 'sm', className: 'min-w-0' })}>
          <dt className="label-mono text-ink-faint">Recorde</dt>
          <dd className="mt-1 text-xl font-extrabold tabular-nums text-ink">
            {sequencia.recorde}
            <span className="ml-1 text-sm font-normal text-ink-soft">{sequencia.recorde === 1 ? 'dia' : 'dias'}</span>
          </dd>
          <dd className="mt-0.5 truncate text-xs text-ink-faint">a maior sequência</dd>
        </div>
      </dl>

      {/* A área de administração não tinha entrada nenhuma na interface: só
          existia para quem digitasse a URL. */}
      {papel === 'admin' && (
        <Link
          to="/admin"
          className={cardClasses({
            className: 'flex items-center justify-between gap-3 transition-colors hover:bg-sunken',
          })}
        >
          <span>
            <span className="block font-bold text-ink">Administração</span>
            <span className="block text-sm leading-relaxed text-ink-soft">
              Saúde do catálogo e como os alunos estão reagindo a ele.
            </span>
          </span>
          <IconArrowRight size={18} className="shrink-0 text-ink-faint" />
        </Link>
      )}

      <Card as="section" aria-labelledby="titulo-desafios" className="space-y-4">
        <h2 id="titulo-desafios" className="font-bold text-ink">
          Desafios
        </h2>
        <div>
          <SectionLabel as="h3" className="mb-1">
            Hoje
          </SectionLabel>
          <ListaDeDesafios desafios={desafios.dia} />
        </div>
        <div>
          <SectionLabel as="h3" className="mb-1">
            Esta semana
          </SectionLabel>
          <ListaDeDesafios desafios={desafios.semana} />
        </div>
        <p className="text-xs leading-relaxed text-ink-faint">
          Cumprir é receber: as moedas e o XP entram sozinhos. Os desafios trocam todo dia e toda segunda.
        </p>
      </Card>

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
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          exercícios {xp.exercicios} · aulas {xp.aulas} · projetos {xp.projetos} · revisão {xp.revisao} · desafios{' '}
          {xp.desafios}
          {xp.dobrado > 0 ? ` · ${xp.dobrado} vieram do dobro` : ''}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-ink-faint">
          {(() => {
            const faixa = proximaFaixa(level.level);
            return faixa
              ? `O título ${faixa.title} começa no nível ${faixa.aPartirDe}, com ${xpMinimoDoNivel(faixa.aPartirDe)} XP. `
              : 'Você está na última faixa de título; os níveis continuam. ';
          })()}
          Exercícios contam uma vez; velocidade não conta.
        </p>
      </Card>

      <Loja />

      <Conquistas conquistas={achievements} />

      <Aparencia />

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

      <footer className="border-t border-line pt-5">
        <p className="text-sm text-ink-faint">
          {completedLessons.length}{' '}
          {completedLessons.length === 1 ? 'aula concluída' : 'aulas concluídas'} ·{' '}
          {stats.exercisesSolved}{' '}
          {stats.exercisesSolved === 1 ? 'exercício resolvido' : 'exercícios resolvidos'} · {stats.activeDays}{' '}
          {stats.activeDays === 1 ? 'dia de estudo' : 'dias de estudo'}
        </p>
      </footer>
    </div>
  );
}

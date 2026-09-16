import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../../contexts/AuthContext';
import { useStudentData } from '../../../contexts/StudentDataContext';
import { useTema } from '../../../contexts/TemaContext';
import { proximaFaixa, xpMinimoDoNivel } from '../../../lib/gamification';
import { nomeParaMostrar } from '../../../lib/perfil';
import { ACENTOS, TEMAS } from '../../../lib/tema';
import { AnelDeNivel } from '../../../components/perfil/AnelDeNivel';
import { EditarPerfil } from '../../../components/perfil/EditarPerfil';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { Card, cardClasses } from '../../../components/ui/Card';
import { IconArrowRight, IconBolt, IconCoin, IconEdit, IconExit, IconFreeze, IconStreak } from '../../../components/ui/Icon';
import {
  VinhetaAlvo,
  VinhetaGrafico,
  VinhetaMedalha,
  VinhetaMoedas,
  VinhetaPaleta,
} from '../../../components/ui/Ilustracao';
import { Carregando, Skeleton } from '../../../components/ui/Skeleton';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useUserRole } from '../../../hooks/useUserRole';

/**
 * O perfil: quem a pessoa é aqui, e as portas para o resto.
 *
 * A primeira versão punha tudo numa página só — desafios, loja, conquistas,
 * aparência, domínio por conceito — e a pessoa rolava por 3 000 px para
 * achar a cor de destaque. Agora o perfil é o cabeçalho (nome, avatar com o
 * anel do nível, os três números do dia) e uma porta por assunto, cada uma
 * com o número que a resume. O que se consulta todo dia fica visível; o
 * resto fica a um toque, numa página só sua.
 *
 * Todo número aparece com a evidência que o gerou (§282). Métrica que a pessoa
 * não consegue auditar vira superstição — e isso vale para as moedas também.
 */

function Porta({
  para,
  titulo,
  resumo,
  vinheta,
  tom,
}: {
  para: string;
  titulo: string;
  resumo: ReactNode;
  vinheta: ReactNode;
  tom: 'brand' | 'energy' | 'success';
}) {
  const pastilha = {
    brand: 'bg-brand-50 text-brand-700',
    energy: 'bg-energy-50 text-energy-700',
    success: 'bg-success-50 text-success-700',
  }[tom];
  return (
    <li>
      <Link
        to={para}
        className={cardClasses({
          padding: 'sm',
          className: 'flex h-full items-center gap-3.5 transition-colors hover:border-line-strong hover:bg-sunken',
        })}
      >
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${pastilha}`} aria-hidden>
          {vinheta}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-ink">{titulo}</span>
          <span className="block text-sm leading-relaxed text-ink-soft">{resumo}</span>
        </span>
        <IconArrowRight size={18} className="shrink-0 text-ink-faint" />
      </Link>
    </li>
  );
}

export function Perfil() {
  useDocumentTitle('Perfil');
  const { user, logout } = useAuth();
  const { papel } = useUserRole();
  const { tema, acento } = useTema();
  const {
    loading,
    level,
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

  const feitosHoje = desafios.dia.filter((d) => d.concluido).length;
  const feitosNaSemana = desafios.semana.filter((d) => d.concluido).length;
  const conquistasAbertas = achievements.filter((c) => c.unlocked).length;
  const praticados = mastery.filter((m) => m.attempts > 0).length;
  const faixa = proximaFaixa(level.level);
  const nomeDoTema = TEMAS.find((t) => t.id === tema)?.title ?? tema;
  const corDeDestaque = ACENTOS.find((a) => a.id === acento);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-4">
        <AnelDeNivel nivel={level.level} fracao={level.xpIntoLevel / level.xpForNextLevel}>
          <Avatar escolhido={perfil.avatar} fotoDoGoogle={fotoDoGoogle} nome={nome} size={72} />
        </AnelDeNivel>

        <div className="min-w-0 flex-1 basis-40">
          <h1 className="truncate text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{nome}</h1>
          <p className="label-mono text-ink-faint">
            Nível {level.level} · {level.title}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            <span className="tabular-nums">
              {level.xpIntoLevel} de {level.xpForNextLevel} XP
            </span>{' '}
            para o nível {level.level + 1}
            {level.proximoMudaTitulo ? ` — vira ${level.nextTitle}` : ''}
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
          <dd className="mt-0.5 text-xs leading-snug text-ink-faint">
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
          <dd className="mt-0.5 text-xs leading-snug text-ink-faint">
            ganhas {moedas.ganhas.total} · gastas {moedas.gastas}
          </dd>
        </div>

        <div className={cardClasses({ padding: 'sm', className: 'min-w-0' })}>
          <dt className="label-mono text-ink-faint">XP</dt>
          <dd className="mt-1 flex items-center gap-1.5 text-xl font-extrabold tabular-nums text-ink">
            {dobro && <IconBolt size={18} className="text-brand-700" />}
            {level.xp}
          </dd>
          <dd className="mt-0.5 text-xs leading-snug text-ink-faint">
            {dobro
              ? `em dobro até ${dobro.ate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
              : faixa
                ? `${faixa.title} no nível ${faixa.aPartirDe}`
                : 'última faixa de título'}
          </dd>
        </div>
      </dl>

      <ul className="grid gap-3 sm:grid-cols-2" aria-label="Seções do perfil">
        <Porta
          para="/app/perfil/desafios"
          titulo="Desafios"
          tom="brand"
          vinheta={<VinhetaAlvo size={40} />}
          resumo={`${feitosHoje} de ${desafios.dia.length} hoje · ${feitosNaSemana} de ${desafios.semana.length} na semana`}
        />
        <Porta
          para="/app/perfil/loja"
          titulo="Loja"
          tom="energy"
          vinheta={<VinhetaMoedas size={40} />}
          resumo={
            moedas.saldo === 0
              ? 'Congelar a sequência, dobrar o XP, cores e avatares.'
              : `${moedas.saldo} ${moedas.saldo === 1 ? 'moeda' : 'moedas'} para gastar`
          }
        />
        <Porta
          para="/app/perfil/conquistas"
          titulo="Conquistas"
          tom="energy"
          vinheta={<VinhetaMedalha size={40} />}
          resumo={`${conquistasAbertas} de ${achievements.length} abertas`}
        />
        <Porta
          para="/app/perfil/aparencia"
          titulo="Aparência"
          tom="brand"
          vinheta={<VinhetaPaleta size={40} />}
          resumo={
            <span className="inline-flex items-center gap-1.5">
              {nomeDoTema} ·
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: corDeDestaque?.amostra }}
                aria-hidden
              />
              {corDeDestaque?.title}
            </span>
          }
        />
        <Porta
          para="/app/perfil/progresso"
          titulo="Progresso"
          tom="success"
          vinheta={<VinhetaGrafico size={40} />}
          resumo={`${praticados} ${praticados === 1 ? 'conceito praticado' : 'conceitos praticados'} · ${
            completedLessons.length
          } ${completedLessons.length === 1 ? 'aula' : 'aulas'}`}
        />
        {/* A área de administração não tinha entrada nenhuma na interface: só
            existia para quem digitasse a URL. */}
        {papel === 'admin' && (
          <li>
            <Link
              to="/admin"
              className={cardClasses({
                padding: 'sm',
                className: 'flex h-full items-center gap-3.5 transition-colors hover:border-line-strong hover:bg-sunken',
              })}
            >
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-ink">Administração</span>
                <span className="block text-sm leading-relaxed text-ink-soft">
                  Saúde do catálogo e como os alunos estão reagindo a ele.
                </span>
              </span>
              <IconArrowRight size={18} className="shrink-0 text-ink-faint" />
            </Link>
          </li>
        )}
      </ul>

      {level.level === 1 && stats.exercisesSolved === 0 && (
        <Card tone="sunken">
          <p className="text-sm leading-relaxed text-ink-soft">
            Tudo aqui nasce do que você faz nas aulas: XP, moedas, sequência e conquistas são calculados do
            histórico das suas tentativas. Resolva o primeiro exercício e os números começam.
          </p>
        </Card>
      )}

      <footer className="border-t border-line pt-5">
        <p className="text-sm text-ink-faint">
          {completedLessons.length}{' '}
          {completedLessons.length === 1 ? 'aula concluída' : 'aulas concluídas'} ·{' '}
          {stats.exercisesSolved}{' '}
          {stats.exercisesSolved === 1 ? 'exercício resolvido' : 'exercícios resolvidos'} · {stats.activeDays}{' '}
          {stats.activeDays === 1 ? 'dia de estudo' : 'dias de estudo'}
        </p>
        <p className="mt-1 text-xs text-ink-faint">
          O título {faixa ? `${faixa.title} começa no nível ${faixa.aPartirDe}, com ${xpMinimoDoNivel(faixa.aPartirDe)} XP` : 'atual é o último'}. Exercícios contam uma vez; velocidade não conta.
        </p>
      </footer>
    </div>
  );
}

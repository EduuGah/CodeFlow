import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { localizarExercicio } from '../../../content';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentData } from '../../contexts/StudentDataContext';
import {
  evidenciaPorExercicio,
  filaDeRevisao,
  resumoDoCaderno,
  TAMANHO_DA_SESSAO,
  type EntradaDoCaderno,
  type EstadoNoCaderno,
} from '../../lib/caderno';
import { fetchEvidencias } from '../../lib/progress';
import { respostaVazia, type EvidenciaDoErro } from '../../lib/resposta';
import { CabecalhoDaSecao } from '../../components/perfil/CabecalhoDaSecao';
import { RespostaDoAluno } from '../../components/caderno/RespostaDoAluno';
import { primeiroParagrafo, TextoEmLinha } from '../../components/caderno/TextoEmLinha';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { buttonClasses } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { IconArrowRight, IconChevronDown, IconRetry } from '../../components/ui/Icon';
import { VinhetaAlvo } from '../../components/ui/Ilustracao';
import { Carregando, Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/States';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

/**
 * Caderno de erros: cada exercício que a pessoa errou, com o que ela
 * respondeu, e quando ele volta.
 *
 * A pergunta que a tela responde não é "quantos eu errei" — é "o que eu errei,
 * e já consertei?". Por isso cada item mostra a evidência (o que foi enviado,
 * o retorno que a pessoa leu) e o estado na revisão espaçada, e a ação é uma
 * só: refazer. A explicação da resposta certa não aparece aqui: ela vem ao
 * acertar, como na aula — lida antes de tentar, vira resposta decorada.
 */

const ESTADOS: Record<EstadoNoCaderno, { rotulo: string; tom: BadgeTone }> = {
  pendente: { rotulo: 'Para refazer', tom: 'caution' },
  revisar: { rotulo: 'Revisar hoje', tom: 'caution' },
  'em-dia': { rotulo: 'Em dia', tom: 'neutral' },
  dominado: { rotulo: 'Dominado', tom: 'success' },
};

const dataCurta = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });
const formatar = (iso: string) => dataCurta.format(new Date(iso));
/** `AAAA-MM-DD` é um dia local; `new Date('AAAA-MM-DD')` seria meia-noite em UTC. */
const formatarDia = (dia: string) => dataCurta.format(new Date(`${dia}T12:00:00`));

/** A leitura da evidência, marcada com de quem é — a sessão pode trocar no meio. */
interface Evidencias {
  de: string;
  mapa: Map<string, EvidenciaDoErro>;
  erro?: string;
}

export function CadernoDeErros() {
  useDocumentTitle('Caderno de erros');
  const { loading, caderno } = useStudentData();
  const { user } = useAuth();
  const userId = user?.id;

  const [evidencias, setEvidencias] = useState<Evidencias | null>(null);

  useEffect(() => {
    if (!userId) return;
    let ativo = true;
    void fetchEvidencias(userId).then(({ dados, erro }) => {
      if (ativo) setEvidencias({ de: userId, mapa: evidenciaPorExercicio(dados), erro });
    });
    return () => {
      ativo = false;
    };
  }, [userId]);

  const cabecalho = (
    <CabecalhoDaSecao
      titulo="Caderno de erros"
      descricao="Cada exercício que você errou, com o que respondeu. Acertar de novo em dias espaçados é o que mostra que ficou."
      vinheta={<VinhetaAlvo size={44} />}
      tom="energy"
      voltar={{ para: '/app/praticar', rotulo: 'Praticar' }}
    />
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {cabecalho}
        <Carregando o="o caderno">
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </Carregando>
      </div>
    );
  }

  const fila = filaDeRevisao(caderno);
  const resumo = resumoDoCaderno(caderno);
  const emDia = caderno
    .filter((e) => e.estado === 'em-dia')
    .sort((a, b) => (a.proximaRevisao ?? '').localeCompare(b.proximaRevisao ?? ''));
  const dominados = caderno.filter((e) => e.estado === 'dominado');
  const mapa = evidencias && evidencias.de === userId ? evidencias.mapa : undefined;

  if (caderno.length === 0) {
    return (
      <div className="space-y-6">
        {cabecalho}
        <EmptyState
          vinheta={<VinhetaAlvo size={48} />}
          title="Nenhum erro por aqui"
          description="Quando um exercício não passar, ele entra aqui com o que você respondeu — e volta na hora certa para você conferir que ficou."
          action={
            <Link to="/app/trilhas" className={buttonClasses({ size: 'sm' })}>
              Ir para as trilhas
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {cabecalho}

      <section aria-labelledby="caderno-resumo">
        <h2 id="caderno-resumo" className="sr-only">
          Resumo
        </h2>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['pendente', 'revisar', 'em-dia', 'dominado'] as const).map((estado) => (
            <Card key={estado} padding="sm" className="text-center">
              <dt className="text-xs font-semibold text-ink-soft">{ESTADOS[estado].rotulo}</dt>
              <dd className="mt-0.5 text-2xl font-extrabold tabular-nums text-ink">{resumo[estado]}</dd>
            </Card>
          ))}
        </dl>

        {fila.length > 0 ? (
          <Link
            to="/refazer"
            className={buttonClasses({ size: 'lg', block: true, className: 'mt-4 sm:w-auto' })}
          >
            <IconRetry size={18} />
            Refazer agora · {Math.min(fila.length, TAMANHO_DA_SESSAO)}{' '}
            {Math.min(fila.length, TAMANHO_DA_SESSAO) === 1 ? 'exercício' : 'exercícios'}
          </Link>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Nada para refazer hoje.
            {emDia[0]?.proximaRevisao && ` O próximo volta em ${formatarDia(emDia[0].proximaRevisao)}.`}
          </p>
        )}
      </section>

      {evidencias?.erro && (
        <p role="status" className="rounded-lg bg-energy-50 px-4 py-3 text-sm text-energy-700">
          Não foi possível carregar o que você respondeu. Os erros estão aqui; as respostas voltam quando a conexão
          voltar.
        </p>
      )}

      {fila.length > 0 && (
        <Secao titulo="Para refazer" descricao="O que ainda não foi consertado vem primeiro, depois as revisões do dia.">
          {fila.map((e) => (
            <Entrada key={e.exerciseId} entrada={e} evidencia={mapa?.get(e.exerciseId)} />
          ))}
        </Secao>
      )}

      {emDia.length > 0 && (
        <Secao titulo="Em dia" descricao="Você acertou depois do erro. Cada um volta na data marcada, para confirmar.">
          {emDia.map((e) => (
            <Entrada key={e.exerciseId} entrada={e} evidencia={mapa?.get(e.exerciseId)} />
          ))}
        </Secao>
      )}

      {dominados.length > 0 && (
        <details className="group">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold text-ink [&::-webkit-details-marker]:hidden">
            <IconChevronDown size={18} className="shrink-0 text-ink-faint transition-transform group-open:rotate-180" />
            Dominados ({dominados.length})
          </summary>
          <p className="mb-3 text-sm leading-relaxed text-ink-soft">
            Acertados de novo em três revisões espaçadas. Ficam aqui como registro do caminho.
          </p>
          <ul className="space-y-3">
            {dominados.map((e) => (
              <Entrada key={e.exerciseId} entrada={e} evidencia={mapa?.get(e.exerciseId)} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function Secao({ titulo, descricao, children }: { titulo: string; descricao: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="label-mono mb-1 text-ink-faint">{titulo}</h2>
      <p className="mb-3 text-sm leading-relaxed text-ink-soft">{descricao}</p>
      <ul className="space-y-3">{children}</ul>
    </section>
  );
}

function Entrada({ entrada, evidencia }: { entrada: EntradaDoCaderno; evidencia: EvidenciaDoErro | undefined }) {
  const local = localizarExercicio(entrada.exerciseId);
  if (!local) return null;
  const { exercise, lesson } = local;
  const estado = ESTADOS[entrada.estado];
  const daUltimaVez = evidencia?.createdAt === entrada.ultimoErro.createdAt;

  return (
    <li>
      <Card as="article" className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-mono min-w-0 flex-1 truncate text-ink-faint">{lesson.title}</span>
          <Badge tone={estado.tom}>{estado.rotulo}</Badge>
        </div>

        <h3 className="break-words font-semibold leading-snug text-ink">
          <TextoEmLinha texto={primeiroParagrafo(exercise.prompt)} />
        </h3>

        <p className="text-sm text-ink-soft">
          {entrada.vezesErrado === 1 ? 'Errou 1 vez' : `Errou ${entrada.vezesErrado} vezes`} · último erro em{' '}
          {formatar(entrada.ultimoErro.createdAt)}
          {entrada.proximaRevisao && entrada.estado === 'em-dia' && ` · volta em ${formatarDia(entrada.proximaRevisao)}`}
        </p>

        {evidencia?.resposta && !respostaVazia(evidencia.resposta) && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-ink-soft">
              {daUltimaVez ? 'O que você respondeu' : `O que você respondeu em ${formatar(evidencia.createdAt)}`}
            </p>
            <RespostaDoAluno resposta={evidencia.resposta} exercise={exercise} />
          </div>
        )}

        {evidencia?.feedback && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-ink-soft">O retorno que você leu</p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{evidencia.feedback}</p>
          </div>
        )}

        <Link
          to={`/refazer?exercicio=${encodeURIComponent(entrada.exerciseId)}`}
          className={buttonClasses({ variant: 'outline', size: 'sm' })}
          aria-label={`Refazer: ${primeiroParagrafo(exercise.prompt)}`}
        >
          Refazer
          <IconArrowRight size={16} />
        </Link>
      </Card>
    </li>
  );
}

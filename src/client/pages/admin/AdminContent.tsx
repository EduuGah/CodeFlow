import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// O catálogo inteiro, com o corpo de tudo: a auditoria precisa dele, e esta
// rota já é um pedaço à parte — não pesa no pacote principal.
import { getExercises, getLesson, getLessonsOfTrack, listProjects, listTracks } from '../../../content/catalogo';
import { fetchExercisePerformance, fetchSaudeDaPlataforma } from '../../lib/progress';
import {
  auditCatalog,
  diagnoseAll,
  MINIMO_DE_ALUNOS,
  resumirSaude,
  ROTULO_DO_EVENTO,
  type ExerciseDiagnosis,
  type LinhaDeSaude,
  type ExercisePerformance,
} from '../../lib/admin';
import { IconArrowLeft, IconInfo } from '../../components/ui/Icon';
import { buttonClasses } from '../../components/ui/Button';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Card, SectionLabel } from '../../components/ui/Card';
import { Carregando, Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/States';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

/**
 * Administração de conteúdo.
 *
 * Duas perguntas, nesta ordem: o catálogo está completo, e como os alunos estão
 * reagindo a ele (§180 a §182).
 *
 * O que esta tela deliberadamente **não** faz é editar conteúdo direto no banco.
 * O conteúdo vive em TypeScript, validado por Zod na carga e coberto por testes
 * no CI — é impossível publicar um exercício quebrado. Um formulário que
 * gravasse direto no banco jogaria essas três garantias fora em troca de
 * conveniência.
 */

/** A janela da seção de saúde. */
const DIAS_DE_SAUDE = 14;

const tomDoSinal: Record<ExerciseDiagnosis['signal'], BadgeTone> = {
  'revisar-enunciado': 'danger',
  'facil-demais': 'caution',
  saudavel: 'success',
  'sem-dados': 'neutral',
};

const rotuloDoSinal: Record<ExerciseDiagnosis['signal'], string> = {
  'revisar-enunciado': 'Revisar enunciado',
  'facil-demais': 'Fácil demais?',
  saudavel: 'Saudável',
  'sem-dados': 'Sem dados',
};

export function AdminContent() {
  useDocumentTitle('Administração');
  const [desempenho, setDesempenho] = useState<ExercisePerformance[] | null>(null);
  const [plataforma, setPlataforma] = useState<{ linhas: LinhaDeSaude[]; erro?: string } | null>(null);

  useEffect(() => {
    let ativo = true;

    fetchExercisePerformance().then((dados) => {
      if (ativo) setDesempenho(dados);
    });
    fetchSaudeDaPlataforma(DIAS_DE_SAUDE).then((dados) => {
      if (ativo) setPlataforma(dados);
    });

    return () => {
      ativo = false;
    };
  }, []);

  const aulas = listTracks().flatMap((t) => getLessonsOfTrack(t.id));
  const exercicios = aulas.flatMap((l) => getExercises(l));
  const saude = auditCatalog(aulas, exercicios, listProjects());

  const lacunas = [
    ['Exercícios de código sem solução de referência', saude.codeExercisesWithoutSolution],
    ['Exercícios sem nenhuma dica', saude.exercisesWithoutHints],
    ['Projetos sem solução de referência', saude.projectsWithoutSolution],
  ] as const;

  const totalDeLacunas = lacunas.reduce((n, [, ids]) => n + ids.length, 0);
  const diagnosticos = desempenho ? diagnoseAll(desempenho) : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-8">
        <Link
          to="/app"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          <IconArrowLeft size={16} />
          Voltar ao aplicativo
        </Link>

        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Administração</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Saúde do catálogo e como os alunos estão reagindo a ele.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/admin/novo-exercicio" className={buttonClasses()}>
            Criar exercício
          </Link>
          <Link to="/admin/loja" className={buttonClasses({ variant: 'outline' })}>
            Loja
          </Link>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="label-mono mb-3 text-ink-faint">Catálogo</h2>

        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            ['Aulas', saude.lessons],
            ['Exercícios', saude.exercises],
            ['Projetos', saude.projects],
          ].map(([rotulo, valor]) => (
            <Card key={rotulo}>
              <p className="text-2xl font-extrabold tabular-nums text-ink">{valor}</p>
              <SectionLabel as="p">{rotulo}</SectionLabel>
            </Card>
          ))}
        </div>

        {totalDeLacunas === 0 ? (
          <Card tone="success" className="flex items-start gap-2 text-sm leading-relaxed text-success-700">
            <IconInfo size={16} className="mt-0.5 shrink-0" />
            Nenhuma lacuna estrutural. Todo exercício tem dica, e todo exercício de código e todo
            projeto têm solução de referência que o CI usa para provar que são resolvíveis.
          </Card>
        ) : (
          <ul className="space-y-2">
            {lacunas
              .filter(([, ids]) => ids.length > 0)
              .map(([rotulo, ids]) => (
                <Card
                  as="li"
                  key={rotulo}
                  tone="caution"
                  className="text-sm leading-relaxed text-energy-700"
                >
                  <strong className="font-semibold">{rotulo}:</strong>{' '}
                  <span className="font-mono">{ids.join(', ')}</span>
                </Card>
              ))}
          </ul>
        )}
      </section>

      <section className="mb-10" aria-labelledby="titulo-saude">
        <h2 id="titulo-saude" className="label-mono mb-1 text-ink-faint">
          Saúde · últimos {DIAS_DE_SAUDE} dias
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-ink-soft">
          O que quebrou do lado da plataforma, por tipo e onde. Vem do registro de eventos: sem mensagem de
          erro, sem nome, sem e-mail — só o tipo, a operação ou o motor, e quantas vezes.
        </p>
        {!plataforma ? (
          <Skeleton className="h-16 w-full rounded-xl" />
        ) : plataforma.erro ? (
          <Card tone="caution" className="text-sm text-energy-700">
            {plataforma.erro}
          </Card>
        ) : plataforma.linhas.length === 0 ? (
          <Card tone="success" className="flex items-start gap-2 text-sm leading-relaxed text-success-700">
            <IconInfo size={16} className="mt-0.5 shrink-0" />
            Nenhum evento registrado no período.
          </Card>
        ) : (
          <ul className="space-y-2" data-saude>
            {resumirSaude(plataforma.linhas).map((r) => (
              <Card as="li" key={r.tipo}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">{ROTULO_DO_EVENTO[r.tipo]}</span>
                  <span className="label-mono tabular-nums text-ink-faint">
                    {r.eventos} {r.eventos === 1 ? 'vez' : 'vezes'} · até {r.maisPessoasNumDia}{' '}
                    {r.maisPessoasNumDia === 1 ? 'pessoa' : 'pessoas'} num dia
                  </span>
                </div>
                {r.principais.some((p) => p.chave) && (
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    {r.principais
                      .filter((p) => p.chave)
                      .map((p) => `${p.chave} (${p.eventos})`)
                      .join(' · ')}
                  </p>
                )}
              </Card>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="label-mono mb-1 text-ink-faint">Desempenho por exercício</h2>
        <p className="mb-4 text-sm leading-relaxed text-ink-soft">
          Taxa baixa de acerto não é veredito. Um exercício difícil de propósito também tem taxa
          baixa — o que distingue é o padrão: muita tentativa <em>e</em> pouca conclusão sugere
          enunciado confuso, enquanto erro seguido de acerto é o aprendizado funcionando.
        </p>

        {desempenho === null ? (
          <Carregando o="o desempenho">
            <div className="space-y-2">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </Carregando>
        ) : diagnosticos.length === 0 ? (
          <EmptyState
            title="Nenhuma tentativa registrada ainda"
            description={`Os sinais aparecem conforme os alunos usam a plataforma. São necessários ao menos ${MINIMO_DE_ALUNOS} alunos por exercício para qualquer conclusão fazer sentido.`}
          />
        ) : (
          <ul className="space-y-2">
            {diagnosticos.map((d) => (
              <Card as="li" key={d.exerciseId}>
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-ink">{d.exerciseId}</span>
                  <Badge tone={tomDoSinal[d.signal]}>{rotuloDoSinal[d.signal]}</Badge>
                </div>

                <p className="text-sm leading-relaxed text-ink-soft">{d.reason}</p>

                <p className="label-mono mt-2 text-ink-faint">
                  {getLesson(d.lessonId)?.title ?? d.lessonId} · {d.students}{' '}
                  {d.students === 1 ? 'aluno' : 'alunos'} · {d.attempts} tentativas ·{' '}
                  {d.avgHintsUsed} dicas em média
                </p>
              </Card>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

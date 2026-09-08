import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getExercises, getLesson, getLessonsOfTrack, listProjects, listTracks } from '../../../content';
import { fetchExercisePerformance } from '../../lib/progress';
import {
  auditCatalog,
  diagnoseAll,
  MINIMO_DE_ALUNOS,
  type ExerciseDiagnosis,
  type ExercisePerformance,
} from '../../lib/admin';
import { IconArrowLeft, IconInfo } from '../../components/ui/Icon';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/States';

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
  const [desempenho, setDesempenho] = useState<ExercisePerformance[] | null>(null);

  useEffect(() => {
    let ativo = true;

    fetchExercisePerformance().then((dados) => {
      if (ativo) setDesempenho(dados);
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

        <Link
          to="/admin/novo-exercicio"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-900"
        >
          Criar exercício
        </Link>
      </header>

      <section className="mb-10">
        <h2 className="label-mono mb-3 text-ink-faint">Catálogo</h2>

        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            ['Aulas', saude.lessons],
            ['Exercícios', saude.exercises],
            ['Projetos', saude.projects],
          ].map(([rotulo, valor]) => (
            <div key={rotulo} className="rounded-xl border border-line bg-surface p-4">
              <p className="text-2xl font-extrabold tabular-nums text-ink">{valor}</p>
              <p className="label-mono text-ink-faint">{rotulo}</p>
            </div>
          ))}
        </div>

        {totalDeLacunas === 0 ? (
          <p className="flex items-start gap-2 rounded-xl border border-success-200 bg-success-50 p-4 text-sm leading-relaxed text-success-700">
            <IconInfo size={16} className="mt-0.5 shrink-0" />
            Nenhuma lacuna estrutural. Todo exercício tem dica, e todo exercício de código e todo
            projeto têm solução de referência que o CI usa para provar que são resolvíveis.
          </p>
        ) : (
          <ul className="space-y-2">
            {lacunas
              .filter(([, ids]) => ids.length > 0)
              .map(([rotulo, ids]) => (
                <li
                  key={rotulo}
                  className="rounded-xl border border-energy-200 bg-energy-50 p-4 text-sm leading-relaxed text-energy-700"
                >
                  <strong className="font-semibold">{rotulo}:</strong>{' '}
                  <span className="font-mono">{ids.join(', ')}</span>
                </li>
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
          <div className="space-y-2">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : diagnosticos.length === 0 ? (
          <EmptyState
            title="Nenhuma tentativa registrada ainda"
            description={`Os sinais aparecem conforme os alunos usam a plataforma. São necessários ao menos ${MINIMO_DE_ALUNOS} alunos por exercício para qualquer conclusão fazer sentido.`}
          />
        ) : (
          <ul className="space-y-2">
            {diagnosticos.map((d) => (
              <li key={d.exerciseId} className="rounded-xl border border-line bg-surface p-4">
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
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

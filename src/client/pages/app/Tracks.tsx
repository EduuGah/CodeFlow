import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { getLessonsOfTrack, getTrack, listConcepts, listProjects } from '../../../content';
import { ETAPAS_DO_PERCURSO } from '../../../content/percurso';
import { DIFFICULTY_LABELS, LANGUAGE_LABELS } from '../../../content/types';
import { useStudentData } from '../../contexts/StudentDataContext';
import { montarPercurso, trilhaDaVez } from '../../lib/percurso';
import { PercursoDetalhado } from '../../components/dashboard/Percurso';
import { IconArrowRight } from '../../components/ui/Icon';
import { Carregando, Skeleton } from '../../components/ui/Skeleton';
import { CenaPercurso, CenaProjeto } from '../../components/ui/Cena';
import { VinhetaCaixa, VinhetaEditor, VinhetaMedalha } from '../../components/ui/Ilustracao';
import { EmptyState } from '../../components/ui/States';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

/**
 * Trilhas e projetos.
 *
 * As trilhas vêm como percurso — três etapas, na ordem em que uma prepara a
 * outra, com o ponto em que a pessoa está — e não como uma grade de cards
 * iguais. A grade dizia "aqui estão sete coisas"; a lista numerada diz "comece
 * por esta, depois esta". Cada trilha tem um link (o nome) e a da vez tem o
 * único botão da página.
 *
 * Projetos ficam numa aba, não no fim da rolagem: "onde estão os projetos?" já
 * foi perguntado. `#projetos` na URL abre a aba, para os links de outras telas
 * continuarem valendo.
 */
type Aba = 'trilhas' | 'projetos';

export function Tracks() {
  useDocumentTitle('Trilhas');
  const { loading, completedLessons, completedProjects, mastery, attempts, resume } = useStudentData();

  const { hash } = useLocation();
  const navigate = useNavigate();
  const [aba, setAba] = useState<Aba>(hash === '#projetos' ? 'projetos' : 'trilhas');

  // Chegar por `/app/trilhas#projetos` de outra tela: a aba acompanha a URL.
  useEffect(() => {
    setAba(hash === '#projetos' ? 'projetos' : 'trilhas');
  }, [hash]);

  const trocarAba = (nova: Aba) => {
    setAba(nova);
    navigate(nova === 'projetos' ? '/app/trilhas#projetos' : '/app/trilhas', { replace: true });
  };

  const projetos = listProjects();

  if (loading) {
    return (
      <Carregando o="as trilhas">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </Carregando>
    );
  }

  const percurso = montarPercurso(
    ETAPAS_DO_PERCURSO,
    getTrack,
    getLessonsOfTrack,
    completedLessons,
    listConcepts(),
    mastery,
    attempts
  );
  const daVez = trilhaDaVez(percurso, resume?.lessonId);
  const trilhas = percurso.flatMap((e) => e.trilhas);
  const aulasFeitas = trilhas.reduce((s, t) => s + t.resumo.completed, 0);
  const aulasTotal = trilhas.reduce((s, t) => s + t.resumo.total, 0);

  const abas: Array<{ id: Aba; rotulo: string }> = [
    { id: 'trilhas', rotulo: `Trilhas · ${trilhas.length}` },
    { id: 'projetos', rotulo: `Projetos · ${projetos.length}` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Trilhas</h1>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            {trilhas.length} trilhas em {percurso.length} etapas, na ordem em que uma prepara a outra. Comece pela
            primeira; se já souber, pule.
            {aulasFeitas > 0 ? ` Você concluiu ${aulasFeitas} de ${aulasTotal} aulas.` : ''}
          </p>
        </div>
        {/* O percurso desenhado: as três etapas e o ponto andando. Só de sm
            para cima — no celular o espaço é da lista. */}
        <CenaPercurso className="hidden w-56 shrink-0 sm:block" />
      </div>

      {/* Duas abas, e não uma página longa: os projetos ficam a um toque em
          vez de no fim de sete trilhas. */}
      <div role="tablist" aria-label="Trilhas ou projetos" className="flex gap-1 border-b border-line">
        {abas.map(({ id, rotulo }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`aba-${id}`}
            aria-selected={aba === id}
            aria-controls={`painel-${id}`}
            onClick={() => trocarAba(id)}
            className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
              aba === id
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {aba === 'trilhas' && (
        <div role="tabpanel" id="painel-trilhas" aria-labelledby="aba-trilhas">
          <PercursoDetalhado etapas={percurso} atualId={daVez?.track.id} />
        </div>
      )}

      {aba === 'projetos' && (
        <section
          role="tabpanel"
          id="painel-projetos"
          aria-labelledby="aba-projetos"
          className="space-y-4"
        >
          <div className="flex items-center gap-6">
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-ink-soft">
              Sem passo a passo: você recebe requisitos e critérios de aceitação, e decide como
              resolver. A plataforma confere cada critério no seu código.
            </p>
            <CenaProjeto className="hidden w-56 shrink-0 sm:block" />
          </div>

          {projetos.length === 0 ? (
            <EmptyState
              vinheta={<VinhetaCaixa size={52} />}
              title="Nenhum projeto disponível ainda"
              description="Os projetos aparecem aqui conforme são publicados."
            />
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {projetos.map((projeto) => {
                const entregue = completedProjects.includes(projeto.id);

                return (
                  <li key={projeto.id}>
                    <Link
                      to={`/project/${projeto.id}`}
                      className="-mx-2 flex items-center gap-4 rounded-lg px-2 py-3.5 transition-colors hover:bg-sunken"
                    >
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          entregue ? 'bg-success-50' : 'bg-sunken'
                        }`}
                        aria-hidden
                      >
                        {entregue ? <VinhetaMedalha size={34} /> : <VinhetaEditor size={34} />}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-ink">{projeto.title}</span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-ink-soft">
                          {projeto.description}
                        </span>
                        <span className="label-mono mt-1 block text-ink-faint">
                          {DIFFICULTY_LABELS[projeto.difficulty]} · {LANGUAGE_LABELS[projeto.language]} ·{' '}
                          {entregue
                            ? 'entregue'
                            : `${projeto.checkpoints.length} critérios de aceitação`}
                        </span>
                      </span>

                      <IconArrowRight size={18} className="shrink-0 text-ink-faint" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

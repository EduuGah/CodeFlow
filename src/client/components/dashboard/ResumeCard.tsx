import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import type { Lesson } from '../../../content/types';
import { getLesson } from '../../../content';
import type { ResumePoint } from '../../lib/study';
import { Button } from '../ui/Button';

interface ResumeCardProps {
  resume: ResumePoint | null;
  /** Próxima aula da trilha — o destino de quem ainda não começou. */
  nextLesson: Lesson | undefined;
  streak: number;
  daysAway: number | null;
}

/**
 * Cartão de retomada (§108).
 *
 * Leva o aluno de volta ao ponto exato onde parou, não ao começo da próxima
 * aula. E trata o retorno depois de uma ausência como o §177 pede: sem
 * cobrança, dizendo onde a pessoa estava em vez de anunciar a sequência perdida.
 */
export function ResumeCard({ resume, nextLesson, streak, daysAway }: ResumeCardProps) {
  const aulaDaRetomada = resume ? getLesson(resume.lessonId) : undefined;
  const destino = aulaDaRetomada ?? nextLesson;

  if (!destino) return null;

  const voltandoDepoisDeAusencia = daysAway !== null && daysAway >= 7;
  const primeiraVez = resume === null;

  let titulo: string;
  let apoio: string;

  if (primeiraVez) {
    titulo = 'Comece por aqui';
    apoio = destino.objective;
  } else if (voltandoDepoisDeAusencia) {
    titulo = 'Bem-vindo de volta';
    apoio = `Você parou em "${destino.title}". Retomar por uma revisão rápida costuma render mais do que avançar direto.`;
  } else if (resume && !resume.wasCorrect) {
    titulo = 'Continue de onde parou';
    apoio = `Sua última tentativa em "${destino.title}" ainda não passou.`;
  } else {
    titulo = 'Continue de onde parou';
    apoio = destino.title;
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-zinc-900">{titulo}</h2>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">{apoio}</p>
        </div>

        {/* Sequência só aparece quando existe: exibir "0 dias" seria cobrança. */}
        {streak > 0 && (
          <span
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800"
            title="Dias seguidos com pelo menos um exercício"
          >
            <Flame size={15} className="text-amber-500" />
            {streak} {streak === 1 ? 'dia seguido' : 'dias seguidos'}
          </span>
        )}
      </div>

      <Link to={`/lesson/${destino.id}`}>
        <Button className="gap-2">
          {primeiraVez ? 'Começar aula' : 'Retomar'}
          <ArrowRight size={16} />
        </Button>
      </Link>
    </div>
  );
}

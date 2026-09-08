import { Link } from 'react-router-dom';

import { getLessonsOfTrack, listProjects, listTracks } from '../../content';
import { IconArrowRight, IconLogo } from '../components/ui/Icon';

/**
 * Página pública.
 *
 * Sem número inventado e sem depoimento fictício: os únicos dados aqui são
 * contados do catálogo real, então não podem envelhecer nem mentir.
 */
export function Landing() {
  const trilhas = listTracks();
  const aulas = trilhas.reduce((n, t) => n + getLessonsOfTrack(t.id).length, 0);
  const projetos = listProjects().length;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <IconLogo size={20} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink">CodeFlow</span>
        </div>

        <Link
          to="/login"
          className="rounded-lg px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-sunken hover:text-ink"
        >
          Entrar
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div className="max-w-xl space-y-6">
          <p className="label-mono text-brand-600">Aprender programação de verdade</p>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            Você não aprende a programar lendo.
            <br />
            Aprende resolvendo.
          </h1>

          <p className="text-lg leading-relaxed text-ink-soft">
            Aulas curtas, código rodando no navegador e correção que explica o porquê do erro — não
            apenas se você acertou.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-6 py-3.5 font-bold text-white transition-colors hover:bg-brand-900 active:translate-y-px"
          >
            Começar agora
            <IconArrowRight size={18} />
          </Link>

          {/* Contados do catálogo, então nunca ficam desatualizados. */}
          <p className="label-mono text-ink-faint">
            {trilhas.length} trilhas · {aulas} aulas · {projetos} projetos
          </p>
        </div>
      </main>
    </div>
  );
}

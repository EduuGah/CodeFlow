import { Link } from 'react-router-dom';

import { getLessonsOfTrack, listProjects, listTracks } from '../../content';
import { buttonClasses } from '../components/ui/Button';
import { CenaEditor } from '../components/ui/Cena';
import { EmblemaDaTrilha } from '../components/ui/Emblema';
import { IconArrowRight, IconLogo } from '../components/ui/Icon';
import { VinhetaBalao, VinhetaEditor, VinhetaRelogio } from '../components/ui/Ilustracao';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/**
 * Página pública.
 *
 * Sem número inventado e sem depoimento fictício: os únicos dados aqui são
 * contados do catálogo real — as trilhas, com os emblemas delas, são as que
 * existem, então não podem envelhecer nem mentir. A cena do editor é
 * desenhada, não é captura: mostra o que a plataforma faz (código, rodar,
 * veredito com explicação) sem ficar velha a cada mudança de tela.
 */
export function Landing() {
  // Sem chamada aqui, voltar do aplicativo para a apresentação deixaria o título
  // da tela anterior na aba.
  useDocumentTitle();
  const trilhas = listTracks();
  const aulas = trilhas.reduce((n, t) => n + getLessonsOfTrack(t.id).length, 0);
  const projetos = listProjects().length;

  const comoFunciona = [
    {
      Vinheta: VinhetaRelogio,
      titulo: 'Aulas curtas',
      texto: 'Cada aula cabe numa sentada: um conceito, um exercício, e o próximo passo já marcado.',
    },
    {
      Vinheta: VinhetaEditor,
      titulo: 'Código rodando no navegador',
      texto: 'JavaScript, TypeScript, React, SQL e páginas inteiras rodam aqui mesmo. Nada para instalar.',
    },
    {
      Vinheta: VinhetaBalao,
      titulo: 'Correção que explica',
      texto: 'Errou? Você vê o que era esperado, o que saiu, e por que — não só um "incorreto".',
    },
  ];

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

      <main className="flex-1">
        <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
          <div className="space-y-6">
            <p className="label-mono text-brand-700">Aprender programação de verdade</p>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              Você não aprende a programar lendo. Aprende resolvendo.
            </h1>

            <p className="text-lg leading-relaxed text-ink-soft">
              Aulas curtas, código rodando no navegador e correção que explica o porquê do erro — não
              apenas se você acertou.
            </p>

            <Link to="/login" className={buttonClasses({ size: 'lg', className: 'px-6' })}>
              Começar agora
              <IconArrowRight size={18} />
            </Link>

            {/* Contados do catálogo, então nunca ficam desatualizados. */}
            <p className="label-mono text-ink-faint">
              {trilhas.length} trilhas · {aulas} aulas · {projetos} projetos
            </p>
          </div>

          <div className="animar-pousar">
            <CenaEditor className="drop-shadow-xl" />
          </div>
        </section>

        <section className="border-y border-line bg-surface" aria-labelledby="como-funciona">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <h2 id="como-funciona" className="label-mono mb-6 text-ink-faint">
              Como funciona
            </h2>
            <ul className="grid gap-8 sm:grid-cols-3">
              {comoFunciona.map(({ Vinheta, titulo, texto }) => (
                <li key={titulo} className="flex gap-4 sm:flex-col">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sunken" aria-hidden>
                    <Vinheta size={44} />
                  </span>
                  <span>
                    <span className="block font-bold text-ink">{titulo}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{texto}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6" aria-labelledby="as-trilhas">
          <h2 id="as-trilhas" className="label-mono mb-2 text-ink-faint">
            As trilhas
          </h2>
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-ink-soft">
            Uma prepara a outra: os fundamentos primeiro, a web depois, e as ferramentas do mercado no fim.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trilhas.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
                <EmblemaDaTrilha trackId={t.id} size={40} />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink">{t.title}</span>
                  <span className="label-mono block text-ink-faint">{getLessonsOfTrack(t.id).length} aulas</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-line px-4 py-6 text-center sm:px-6">
        <Link to="/login" className={buttonClasses({ variant: 'outline', className: 'px-5' })}>
          Entrar com Google
          <IconArrowRight size={16} />
        </Link>
      </footer>
    </div>
  );
}

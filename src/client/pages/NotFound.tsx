import { Link } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { buttonClasses } from '../components/ui/Button';
import { IconArrowRight } from '../components/ui/Icon';
import { VinhetaBussola } from '../components/ui/Ilustracao';

/**
 * Endereço que não existe.
 *
 * Antes, qualquer URL desconhecida era redirecionada para a página de marketing,
 * em silêncio e com `replace`. Para um aluno logado isso era pior do que um erro:
 * ele caía numa tela de "conheça o CodeFlow", com o endereço apagado do
 * histórico, e a leitura natural era ter sido deslogado.
 *
 * Agora a página diz o que aconteceu e oferece a saída certa para quem chegou —
 * o aplicativo para quem está logado, a apresentação para quem não está.
 */
export function NotFound() {
  const { user, loading } = useAuth();

  useDocumentTitle('Página não encontrada');

  const destino = user ? '/app' : '/';
  const rotulo = user ? 'Voltar ao aplicativo' : 'Ir para o início';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-16 text-center">
      <span className="animar-pop mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-sunken" aria-hidden>
        <VinhetaBussola size={64} />
      </span>

      <h1 className="text-2xl font-extrabold tracking-tight text-ink">Esta página não existe</h1>

      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
        O endereço pode ter sido digitado errado, ou apontava para algo que saiu do ar. Seu progresso
        está intacto.
      </p>

      {/* Enquanto a sessão carrega, o destino ainda não é conhecido: um link que
          leva ao lugar errado é pior do que um instante sem link. */}
      {!loading && (
        <Link to={destino} className={buttonClasses({ className: 'mt-6' })}>
          {rotulo}
          <IconArrowRight size={17} />
        </Link>
      )}
    </main>
  );
}

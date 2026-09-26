import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { buttonClasses } from '../components/ui/Button';
import { IconAlert, IconSpinner } from '../components/ui/Icon';
import { useAuth } from '../contexts/AuthContext';

/** Segurança contra ficar girando para sempre se a sessão nunca chegar. */
const TIMEOUT_MS = 15000;

/**
 * O que dizer para cada erro que o provedor devolve na URL.
 *
 * Só frases nossas, por código. A versão anterior mostrava o
 * `error_description` da própria URL — texto que qualquer um escreve num link
 * ("Sua conta foi bloqueada, ligue para…") e que a página exibia como se fosse
 * dela. O detalhe original vai para o console, para quem depura.
 */
const ERROS_DO_PROVEDOR: Record<string, string> = {
  access_denied: 'Você cancelou a autorização no Google. Nenhum dado foi acessado.',
  server_error: 'O servidor de login falhou agora. Tente entrar de novo em alguns instantes.',
  temporarily_unavailable: 'O login está indisponível no momento. Tente de novo em alguns instantes.',
};

/** Erro devolvido pelo próprio provedor na URL (consentimento negado, etc.). */
export function erroDoProvedor(search: string, hash: string): string | null {
  const query = new URLSearchParams(search);
  const fragmento = new URLSearchParams(hash.replace(/^#/, ''));
  const code = query.get('error') ?? fragmento.get('error');

  if (!code) return null;

  const descricao = query.get('error_description') ?? fragmento.get('error_description');
  if (descricao) console.error(`Login recusado pelo provedor (${code}):`, descricao);

  return ERROS_DO_PROVEDOR[code] ?? 'O Google não concluiu o login. Tente entrar de novo.';
}

/**
 * Destino do redirecionamento do OAuth.
 *
 * Existe para eliminar uma corrida: o retorno do Google caía direto numa rota
 * protegida, e o ProtectedRoute avaliava `user` antes de o supabase-js terminar
 * de trocar o `code` da URL por uma sessão. O resultado era voltar para a tela
 * de login mesmo com o login tendo dado certo. Aqui a espera é explícita.
 */
export function AuthCallback() {
  const { user, authError } = useAuth();
  const [timedOut, setTimedOut] = useState(false);
  const providerError = erroDoProvedor(window.location.search, window.location.hash);

  useEffect(() => {
    if (providerError) return;

    const timer = setTimeout(() => setTimedOut(true), TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [providerError]);

  if (user) {
    return <Navigate to="/app" replace />;
  }

  const failure =
    providerError ??
    authError ??
    (timedOut ? 'A sessão não foi concluída a tempo. Tente entrar novamente.' : null);

  if (failure) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-50">
            <IconAlert size={24} className="text-danger-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-semibold text-ink">Não foi possível concluir o login</h1>
            <p className="text-sm leading-relaxed text-ink-faint">{failure}</p>
          </div>
          <Link to="/login" className={buttonClasses()}>
            Voltar para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-3">
      <IconSpinner className="h-8 w-8 animate-spin text-ink-faint" />
      <p className="text-sm text-ink-faint">Concluindo seu login…</p>
    </div>
  );
}

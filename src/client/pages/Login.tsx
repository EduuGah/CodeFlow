import { Navigate, useLocation } from 'react-router-dom';
import { IconAlert, IconLock, IconLogo, IconSpinner } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DEMO_ACCOUNTS } from '../lib/demo';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { AVATARES, AVATARES_LIVRES, AvatarDesenhado } from '../components/ui/Avatar';
import { CenaEditor } from '../components/ui/Cena';

/**
 * Para onde voltar depois de entrar: a rota que a `ProtectedRoute` guardou
 * (um link direto para uma aula, por exemplo). Só caminhos internos — `//x`
 * seria outro domínio.
 */
export function destinoDepoisDoLogin(estado: unknown): string {
  const de = (estado as { from?: { pathname?: unknown; search?: unknown } } | null)?.from;
  const caminho = typeof de?.pathname === 'string' ? de.pathname : '';
  if (!caminho.startsWith('/') || caminho.startsWith('//') || caminho === '/login') return '/app';
  return caminho + (typeof de?.search === 'string' ? de.search : '');
}

export function Login() {
  useDocumentTitle('Entrar');
  const location = useLocation();
  const { user, signInWithGoogle, signInWithPassword, loading, authError, isConfigured } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  // Qual entrada com senha está em andamento: o usuário de um botão de
  // demonstração, ou 'formulario' para o que foi digitado.
  const [entrandoComSenha, setEntrandoComSenha] = useState<string | null>(null);
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <IconSpinner size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={destinoDepoisDoLogin(location.state)} replace />;
  }

  // Não navegamos manualmente após o login: signInWithOAuth redireciona a aba para
  // o Google e, na volta, o <Navigate> acima leva o usuário ao /dashboard.
  const handleGoogleSignIn = async () => {
    try {
      setIsLoggingIn(true);
      await signInWithGoogle();
    } catch {
      // A mensagem amigável já vem do AuthContext em `authError`.
    } finally {
      setIsLoggingIn(false);
    }
  };

  const entrarComSenha = async (origem: string, u: string, s: string) => {
    try {
      setEntrandoComSenha(origem);
      await signInWithPassword(u, s);
    } catch {
      // A mensagem amigável já vem do AuthContext em `authError`.
      setEntrandoComSenha(null);
    }
  };

  const ocupado = isLoggingIn || entrandoComSenha !== null || !isConfigured;

  return (
    <main className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* A mesma cena da página pública: quem chega direto aqui também vê
            o que a plataforma faz antes de entrar. */}
        <CenaEditor className="animar-pousar drop-shadow-lg" />

        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mb-2 shadow-sm">
            <IconLogo size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Acesse o CodeFlow</h1>
          <p className="text-sm text-ink-faint">
            Continue sua jornada de aprendizado
          </p>
        </div>

        <div className="bg-surface p-6 sm:p-8 rounded-2xl shadow-sm border border-line">
          <Button 
            className="w-full gap-2" 
            variant="outline" 
            onClick={handleGoogleSignIn}
            disabled={ocupado}
          >
            {isLoggingIn ? (
              <IconSpinner size={18} className="animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {isLoggingIn ? "Conectando..." : "Entrar com Google"}
          </Button>

          {authError && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3 text-left"
            >
              <IconAlert size={16} className="mt-0.5 flex-shrink-0 text-danger-500" />
              <p className="text-xs leading-relaxed text-danger-700">{authError}</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center">
            <span className="text-xs text-ink-faint text-center">
              Ao entrar, você concorda com nossos termos de serviço.
            </span>
          </div>
        </div>

        {/* Para quem chega pelo portfólio: ver a plataforma por dentro sem
            entregar a conta Google. As contas vêm da migração 0008. */}
        <section
          aria-labelledby="demo-titulo"
          className="rounded-2xl border border-dashed border-line-strong bg-surface p-5 space-y-4"
        >
          <div className="space-y-1">
            <h2 id="demo-titulo" className="flex items-center gap-2 text-sm font-semibold text-ink">
              <IconLock size={16} className="text-brand-500" />
              Testar sem criar conta
            </h2>
            <p className="text-xs leading-relaxed text-ink-faint">
              Uma conta de aluno com progresso compartilhado e uma de administrador, só leitura.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((conta) => (
              <Button
                key={conta.usuario}
                variant="secondary"
                size="sm"
                title={conta.descricao}
                disabled={ocupado}
                onClick={() => entrarComSenha(conta.usuario, conta.usuario, conta.senha)}
              >
                {entrandoComSenha === conta.usuario ? (
                  <IconSpinner size={16} className="animate-spin" />
                ) : (
                  conta.rotulo
                )}
              </Button>
            ))}
          </div>

          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              entrarComSenha('formulario', usuario, senha);
            }}
          >
            <p className="text-xs text-ink-faint">
              Ou digite: usuário <strong className="text-ink">admin</strong>, senha{' '}
              <strong className="text-ink">admin</strong>.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <label className="sr-only" htmlFor="demo-usuario">Usuário</label>
              <Input
                id="demo-usuario"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Usuário"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
              <label className="sr-only" htmlFor="demo-senha">Senha</label>
              <Input
                id="demo-senha"
                type="password"
                autoComplete="current-password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="w-full"
              disabled={ocupado || !usuario || !senha}
            >
              {entrandoComSenha === 'formulario' ? (
                <IconSpinner size={16} className="animate-spin" />
              ) : (
                'Entrar com usuário e senha'
              )}
            </Button>
          </form>
        </section>

        {/* Os avatares de verdade, os que a pessoa escolhe depois de entrar:
            uma prévia do que é seu lá dentro, sem inventar nada. */}
        <div className="animar-pousar flex flex-col items-center gap-3" aria-hidden>
          <div className="flex -space-x-2">
            {AVATARES.filter((a) => AVATARES_LIVRES.includes(a.id))
              .slice(4, 10)
              .map((a) => (
                <AvatarDesenhado key={a.id} preset={a} size={40} className="ring-2 ring-canvas" />
              ))}
          </div>
          <p className="text-xs text-ink-faint">Depois de entrar, escolha quem você é aqui.</p>
        </div>
      </div>
    </main>
  );
}

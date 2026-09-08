import { Navigate } from 'react-router-dom';
import { IconAlert, IconLogo, IconSpinner } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function Login() {
  useDocumentTitle('Entrar');
  const { user, signInWithGoogle, loading, authError, isConfigured } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <IconSpinner size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app" replace />;
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

  return (
    <main className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 bg-ink rounded-xl flex items-center justify-center mb-2 shadow-sm">
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
            disabled={isLoggingIn || !isConfigured}
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
      </div>
    </main>
  );
}

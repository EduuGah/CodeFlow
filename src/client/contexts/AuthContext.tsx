import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, supabaseConfigError, isSupabaseConfigured } from '../lib/supabase';
import { emailDoUsuario } from '../lib/demo';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Mensagem de erro amigável do último login, ou null. */
  authError: string | null;
  /** false quando faltam as variáveis do .env — o login fica indisponível. */
  isConfigured: boolean;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  /** Entrada por usuário (ou e-mail) e senha — usada pelas contas de demonstração. */
  signInWithPassword: (usuario: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * O mesmo usuário, só com outro token? O supabase-js entrega um objeto `User`
 * novo a cada renovação do token (de hora em hora, e ao voltar para a aba),
 * e todo efeito que dependia de `user` rodava de novo: a revisão se
 * reembaralhava no meio da sessão, o papel era buscado outra vez. Manter a
 * referência quando nada que a tela mostra mudou corta isso na raiz.
 */
export function mesmoUsuario(a: User | null, b: User | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.id === b.id &&
    a.email === b.email &&
    a.updated_at === b.updated_at &&
    JSON.stringify(a.user_metadata ?? {}) === JSON.stringify(b.user_metadata ?? {})
  );
}

function describeAuthError(error: unknown): string {
  if (error instanceof AuthError) {
    // Provider desativado no painel é o erro mais comum na primeira configuração.
    if (/provider is not enabled/i.test(error.message)) {
      return 'O provedor Google não está ativado no seu projeto Supabase. Ative em Authentication › Providers › Google e informe o Client ID e o Client Secret do Google Cloud Console.';
    }

    if (/redirect|url/i.test(error.message)) {
      return `Supabase recusou a URL de redirecionamento (${window.location.origin}). Adicione-a em Authentication › URL Configuration › Redirect URLs.`;
    }

    return `Não foi possível entrar com o Google: ${error.message}`;
  }

  if (error instanceof TypeError) {
    return 'Não foi possível alcançar o Supabase. Verifique sua conexão e se a VITE_SUPABASE_URL está correta.';
  }

  return 'Não foi possível entrar com o Google. Tente novamente.';
}

function describePasswordError(error: unknown): string {
  if (error instanceof AuthError) {
    if (/invalid login credentials/i.test(error.message)) {
      return 'Usuário ou senha incorretos. As contas de teste são aluno/aluno e admin/admin.';
    }

    if (/email logins are disabled|provider is not enabled/i.test(error.message)) {
      return 'A entrada por e-mail e senha está desligada no seu projeto Supabase. Ative em Authentication › Providers › Email.';
    }

    return `Não foi possível entrar: ${error.message}`;
  }

  return describeAuthError(error);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // Sem configuração não há sessão para carregar: evita um spinner infinito.
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [authError, setAuthError] = useState<string | null>(supabaseConfigError);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser((atual) => (mesmoUsuario(atual, session?.user ?? null) ? atual : (session?.user ?? null)));
      })
      .catch((error) => {
        console.error('Erro ao recuperar a sessão:', error);
        setAuthError(describeAuthError(error));
      })
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser((atual) => (mesmoUsuario(atual, session?.user ?? null) ? atual : (session?.user ?? null)));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!supabase) {
      setAuthError(supabaseConfigError);
      return;
    }

    setAuthError(null);

    // signInWithOAuth redireciona a aba inteira para o Google. O retorno vai para
    // /auth/callback, e não direto para /dashboard: a rota protegida avaliava
    // `user` antes de o supabase-js trocar o code da URL por uma sessão, e
    // devolvia o aluno para a tela de login mesmo com o login bem-sucedido.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Erro no login com Google (Supabase):', error);
      setAuthError(describeAuthError(error));
      throw error;
    }
  };

  const signInWithPassword = async (usuario: string, senha: string) => {
    if (!supabase) {
      setAuthError(supabaseConfigError);
      return;
    }

    setAuthError(null);

    // No sucesso, o onAuthStateChange acima preenche `user` e a tela de login
    // leva para /app sozinha.
    const { error } = await supabase.auth.signInWithPassword({
      email: emailDoUsuario(usuario),
      password: senha,
    });

    if (error) {
      console.error('Erro no login com senha (Supabase):', error);
      setAuthError(describePasswordError(error));
      throw error;
    }
  };

  const logout = async () => {
    if (!supabase) return;

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao deslogar (Supabase):', error);
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        authError,
        isConfigured: isSupabaseConfigured,
        clearAuthError,
        signInWithGoogle,
        signInWithPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

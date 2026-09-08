import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { fetchUserRole, type UserRole } from '../lib/progress';
import { IconSpinner } from './ui/Icon';

/**
 * Restringe uma rota a administradores.
 *
 * Esta é a camada de conveniência, não a de segurança. A autorização real está
 * no RLS do banco: mesmo que alguém force a rota no navegador, as consultas
 * devolvem apenas o que o papel dele permite. O que este componente evita é
 * oferecer um caminho que o servidor vai recusar.
 *
 * Enquanto o papel não é conhecido, não redireciona: mandar o admin para o
 * início por um instante e trazê-lo de volta seria pior que esperar.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [papel, setPapel] = useState<UserRole | null>(null);

  useEffect(() => {
    let ativo = true;

    if (!user) {
      setPapel(null);
      return;
    }

    fetchUserRole(user.id).then((p) => {
      if (ativo) setPapel(p);
    });

    return () => {
      ativo = false;
    };
  }, [user]);

  if (loading || (user && papel === null)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <IconSpinner size={32} className="animate-spin text-ink-faint" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Sem estardalhaço: quem não é admin simplesmente vai para o início, sem uma
  // tela de "acesso negado" anunciando que a área existe.
  if (papel !== 'admin') return <Navigate to="/app" replace />;

  return <>{children}</>;
}

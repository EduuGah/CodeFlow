import { useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { fetchUserRole, type UserRole } from '../lib/progress';

/**
 * O papel do usuário atual.
 *
 * Duas telas precisam disso por motivos diferentes: a rota de administração para
 * decidir se deixa entrar, e o perfil para decidir se mostra o caminho. Duplicar
 * a busca faria as duas divergirem no primeiro ajuste.
 *
 * `null` enquanto não se sabe. Quem consome precisa tratar esse estado: assumir
 * `'student'` durante o carregamento faria a tela piscar o conteúdo errado, e
 * assumir `'admin'` ofereceria um caminho que o banco vai recusar.
 */
export function useUserRole(): { papel: UserRole | null; carregando: boolean } {
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

  return { papel, carregando: loading || (!!user && papel === null) };
}

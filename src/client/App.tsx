import { Routes, Route, Navigate } from 'react-router-dom';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { AuthCallback } from './pages/AuthCallback';
import { Lesson } from './pages/Lesson';
import { Review } from './pages/Review';
import { ProjectWorkspace } from './pages/ProjectWorkspace';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/app/Home';
import { Tracks } from './pages/app/Tracks';
import { TrackDetail } from './pages/app/TrackDetail';
import { Practice } from './pages/app/Practice';
import { Perfil } from './pages/app/perfil/Perfil';
import { PerfilAparencia } from './pages/app/perfil/PerfilAparencia';
import { PerfilConquistas } from './pages/app/perfil/PerfilConquistas';
import { PerfilDesafios } from './pages/app/perfil/PerfilDesafios';
import { PerfilLoja } from './pages/app/perfil/PerfilLoja';
import { PerfilProgresso } from './pages/app/perfil/PerfilProgresso';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminNewExercise } from './pages/admin/AdminNewExercise';

/**
 * Rotas.
 *
 * Duas famílias, por um motivo de experiência:
 *
 * - `/app/*` vive dentro do AppShell, com navegação sempre visível. São as telas
 *   de orientação: onde estou, o que existe, o que praticar.
 * - `/lesson`, `/project` e `/review` ocupam a tela inteira, sem navegação. São
 *   telas de foco — durante um exercício, uma barra de abas só oferece saída.
 *
 * `/dashboard` continua respondendo, redirecionando para `/app`: era a rota
 * anterior, e links salvos não devem quebrar.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="trilhas" element={<Tracks />} />
        <Route path="trilhas/:trackId" element={<TrackDetail />} />
        <Route path="praticar" element={<Practice />} />
        {/* O perfil é uma família: cada assunto numa página, para o celular
            não virar uma rolagem de 3 000 px. */}
        <Route path="perfil" element={<Perfil />} />
        <Route path="perfil/desafios" element={<PerfilDesafios />} />
        <Route path="perfil/loja" element={<PerfilLoja />} />
        <Route path="perfil/conquistas" element={<PerfilConquistas />} />
        <Route path="perfil/aparencia" element={<PerfilAparencia />} />
        <Route path="perfil/progresso" element={<PerfilProgresso />} />
      </Route>

      {/* Administração fora do AppShell: não é uma aba do aluno, e a barra de
          navegação dele não faz sentido aqui. */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminContent />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/novo-exercicio"
        element={
          <AdminRoute>
            <AdminNewExercise />
          </AdminRoute>
        }
      />

      <Route path="/dashboard/*" element={<Navigate to="/app" replace />} />

      <Route
        path="/lesson/:id"
        element={
          <ProtectedRoute>
            <Lesson />
          </ProtectedRoute>
        }
      />
      <Route
        path="/review"
        element={
          <ProtectedRoute>
            <Review />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:id"
        element={
          <ProtectedRoute>
            <ProjectWorkspace />
          </ProtectedRoute>
        }
      />

      {/* Qualquer outra rota volta para o início em vez de tela em branco. */}
      {/* Endereço desconhecido explica o que houve. Redirecionar em silêncio
          para a página de marketing fazia um aluno logado achar que tinha sido
          deslogado — e o `replace` ainda apagava a URL errada do histórico. */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

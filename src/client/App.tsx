import { Routes, Route, Navigate } from 'react-router-dom';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { AuthCallback } from './pages/AuthCallback';
import { Lesson } from './pages/Lesson';
import { Review } from './pages/Review';
import { ProjectWorkspace } from './pages/ProjectWorkspace';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/app/Home';
import { Tracks } from './pages/app/Tracks';
import { Practice } from './pages/app/Practice';
import { Profile } from './pages/app/Profile';
import { AdminContent } from './pages/admin/AdminContent';

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
        <Route path="praticar" element={<Practice />} />
        <Route path="perfil" element={<Profile />} />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

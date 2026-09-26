import { lazy, Suspense } from 'react';
import { Outlet, Routes, Route, Navigate } from 'react-router-dom';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { AuthCallback } from './pages/AuthCallback';
import { NotFound } from './pages/NotFound';
import { IconSpinner } from './components/ui/Icon';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { AppShell } from './components/layout/AppShell';
import { StudentDataProvider } from './contexts/StudentDataContext';
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

/**
 * As telas de foco e as de administração chegam sob demanda.
 *
 * Elas trazem o que o resto não usa: os dez componentes de exercício, o
 * Markdown (react-markdown, remark, micromark), o motor de cada linguagem, e
 * — no admin — o Zod do gerador de exercício. Carregadas junto, iam no pacote
 * que até a página pública baixa. O `vite:preloadError` do `main.tsx` cobre
 * a aba aberta de antes de um deploy.
 */
const Lesson = lazy(() => import('./pages/Lesson').then((m) => ({ default: m.Lesson })));
const Review = lazy(() => import('./pages/Review').then((m) => ({ default: m.Review })));
const ProjectWorkspace = lazy(() =>
  import('./pages/ProjectWorkspace').then((m) => ({ default: m.ProjectWorkspace }))
);
const AdminContent = lazy(() => import('./pages/admin/AdminContent').then((m) => ({ default: m.AdminContent })));
const AdminNewExercise = lazy(() =>
  import('./pages/admin/AdminNewExercise').then((m) => ({ default: m.AdminNewExercise }))
);

/**
 * Os dados do aluno acima das telas que os usam — o aplicativo e as telas de
 * foco. Assim o histórico carrega uma vez por sessão, e voltar de uma aula
 * revalida por baixo em vez de recomeçar do zero (`AppShell`).
 */
function ComDadosDoAluno() {
  return (
    <StudentDataProvider>
      <Outlet />
    </StudentDataProvider>
  );
}

/** Enquanto o pedaço da tela chega: o mesmo giro das rotas protegidas. */
function CarregandoTela() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas" role="status" aria-label="Carregando">
      <IconSpinner size={32} className="animate-spin text-ink-faint" />
    </div>
  );
}

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
    <Suspense fallback={<CarregandoTela />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route element={<ComDadosDoAluno />}>
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

        {/* Endereço desconhecido explica o que houve. Redirecionar em silêncio
            para a página de marketing fazia um aluno logado achar que tinha sido
            deslogado — e o `replace` ainda apagava a URL errada do histórico. */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;

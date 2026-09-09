import {
  lazy,
  Suspense,
  useEffect,
} from 'react'

import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import NavegacaoPrincipal from './components/NavegacaoPrincipal'
import RotaAdmin from './components/RotaAdmin'
import RotaProtegida from './components/RotaProtegida'

import './App.css'

const ConsultaPage = lazy(
  () =>
    import(
      './pages/ConsultaPage'
    ),
)

const CadastroPage = lazy(
  () =>
    import(
      './pages/CadastroPage'
    ),
)

const LoginPage = lazy(
  () =>
    import(
      './pages/LoginPage'
    ),
)

const VerificarEmailPage = lazy(
  () =>
    import(
      './pages/VerificarEmailPage'
    ),
)

const RecuperarSenhaPage = lazy(
  () =>
    import(
      './pages/RecuperarSenhaPage'
    ),
)

const RedefinirSenhaPage = lazy(
  () =>
    import(
      './pages/RedefinirSenhaPage'
    ),
)

const PerfilPage = lazy(
  () =>
    import(
      './pages/PerfilPage'
    ),
)

const PreferenciasPage = lazy(
  () =>
    import(
      './pages/PreferenciasPage'
    ),
)

const AdminPage = lazy(
  () =>
    import(
      './pages/AdminPage'
    ),
)

const DashboardAdminPage = lazy(
  () =>
    import(
      './pages/admin/DashboardAdminPage'
    ),
)

const RotasAdminPage = lazy(
  () =>
    import(
      './pages/admin/RotasAdminPage'
    ),
)

const AreasAdminPage = lazy(
  () =>
    import(
      './pages/admin/AreasAdminPage'
    ),
)

const CronogramasAdminPage = lazy(
  () =>
    import(
      './pages/admin/CronogramasAdminPage'
    ),
)

const TITULOS_PAGINAS = {
  '/':
    'Consulta de coleta | SIMUL',

  '/cadastro':
    'Criar conta | SIMUL',

  '/login':
    'Entrar | SIMUL',

  '/verificar-email':
    'Verificação de e-mail | SIMUL',

  '/recuperar-senha':
    'Recuperar senha | SIMUL',

  '/redefinir-senha':
    'Redefinir senha | SIMUL',

  '/minha-conta':
    'Minha conta | SIMUL',

  '/preferencias':
    'Preferências de notificação | SIMUL',

  '/admin':
    'Painel administrativo | SIMUL',

  '/admin/rotas':
    'Gerenciar rotas | SIMUL',

  '/admin/areas':
    'Gerenciar áreas atendidas | SIMUL',

  '/admin/cronogramas':
    'Gerenciar cronogramas | SIMUL',
}

function CarregandoPagina() {
  return (
    <main className="app">
      <section
        className="consulta"
        aria-busy="true"
        aria-labelledby="titulo-carregando-pagina"
      >
        <h1
          id="titulo-carregando-pagina"
          className="visualmente-oculto"
        >
          Carregando página
        </h1>

        <div
          className="mensagem"
          role="status"
          aria-live="polite"
        >
          Carregando...
        </div>
      </section>
    </main>
  )
}

function App() {
  const location =
    useLocation()

  useEffect(() => {
    document.title =
      TITULOS_PAGINAS[
        location.pathname
      ] ||
      'SIMUL'
  }, [location.pathname])

  return (
    <>
      <a
        href="#conteudo-principal"
        className="pular-conteudo"
      >
        Pular para o conteúdo principal
      </a>

      <NavegacaoPrincipal />

      <div
        id="conteudo-principal"
        tabIndex="-1"
      >
        <Suspense
          fallback={
            <CarregandoPagina />
          }
        >
          <Routes>
            <Route
              path="/"
              element={
                <ConsultaPage />
              }
            />

            <Route
              path="/cadastro"
              element={
                <CadastroPage />
              }
            />

            <Route
              path="/login"
              element={
                <LoginPage />
              }
            />

            <Route
              path="/verificar-email"
              element={
                <VerificarEmailPage />
              }
            />

            <Route
              path="/recuperar-senha"
              element={
                <RecuperarSenhaPage />
              }
            />

            <Route
              path="/redefinir-senha"
              element={
                <RedefinirSenhaPage />
              }
            />

            <Route
              element={
                <RotaProtegida />
              }
            >
              <Route
                path="/minha-conta"
                element={
                  <PerfilPage />
                }
              />

              <Route
                path="/preferencias"
                element={
                  <PreferenciasPage />
                }
              />

              <Route
                element={
                  <RotaAdmin />
                }
              >
                <Route
                  path="/admin"
                  element={
                    <AdminPage />
                  }
                >
                  <Route
                    index
                    element={
                      <DashboardAdminPage />
                    }
                  />

                  <Route
                    path="rotas"
                    element={
                      <RotasAdminPage />
                    }
                  />

                  <Route
                    path="areas"
                    element={
                      <AreasAdminPage />
                    }
                  />

                  <Route
                    path="cronogramas"
                    element={
                      <CronogramasAdminPage />
                    }
                  />
                </Route>
              </Route>
            </Route>

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />
          </Routes>
        </Suspense>
      </div>
    </>
  )
}

export default App
import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import NavegacaoPrincipal from './components/NavegacaoPrincipal'
import RotaAdmin from './components/RotaAdmin'
import RotaProtegida from './components/RotaProtegida'

import AdminPage from './pages/AdminPage'
import CadastroPage from './pages/CadastroPage'
import ConsultaPage from './pages/ConsultaPage'
import LoginPage from './pages/LoginPage'
import PerfilPage from './pages/PerfilPage'
import PreferenciasPage from './pages/PreferenciasPage'

import AreasAdminPage from './pages/admin/AreasAdminPage'
import CronogramasAdminPage from './pages/admin/CronogramasAdminPage'
import DashboardAdminPage from './pages/admin/DashboardAdminPage'
import RotasAdminPage from './pages/admin/RotasAdminPage'

function App() {
  return (
    <>
      <NavegacaoPrincipal />

      <Routes>
        <Route
          path="/"
          element={<ConsultaPage />}
        />

        <Route
          path="/cadastro"
          element={<CadastroPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          element={
            <RotaProtegida />
          }
        >
          <Route
            path="/minha-conta"
            element={<PerfilPage />}
          />

          <Route
            path="/preferencias"
            element={
              <PreferenciasPage />
            }
          />

          <Route
            element={<RotaAdmin />}
          >
            <Route
              path="/admin"
              element={<AdminPage />}
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
    </>
  )
}

export default App
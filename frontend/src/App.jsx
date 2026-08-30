import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import RotaProtegida from './components/RotaProtegida'
import CadastroPage from './pages/CadastroPage'
import ConsultaPage from './pages/ConsultaPage'
import LoginPage from './pages/LoginPage'
import PerfilPage from './pages/PerfilPage'
import PreferenciasPage from './pages/PreferenciasPage'

function App() {
  return (
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

      <Route element={<RotaProtegida />}>
        <Route
          path="/minha-conta"
          element={<PerfilPage />}
        />

        <Route
          path="/preferencias"
          element={<PreferenciasPage />}
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

export default App
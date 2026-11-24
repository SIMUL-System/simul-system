import { Navigate, Outlet } from 'react-router-dom'

import { obterToken } from '../services/authService'

/** Só deixa passar quem tem token; os demais vão para o login. */
function RotaProtegida() {
  const token = obterToken()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default RotaProtegida

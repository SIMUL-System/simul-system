import {
  Navigate,
  Outlet,
} from 'react-router-dom'

import { obterToken } from '../services/authService'

function RotaProtegida() {
  const token = obterToken()

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return <Outlet />
}

export default RotaProtegida
import { useEffect, useState } from 'react'
import {
  Navigate,
  Outlet,
} from 'react-router-dom'

import { obterUsuarioAtual } from '../services/usuarioService'

function RotaAdmin() {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    async function verificarPerfil() {
      try {
        const dados = await obterUsuarioAtual()

        setUsuario(dados)
      } catch {
        setErro(true)
      } finally {
        setCarregando(false)
      }
    }

    verificarPerfil()
  }, [])

  if (carregando) {
    return <p>Verificando permissão...</p>
  }

  if (erro) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (usuario?.perfil !== 'ADMIN') {
    return (
      <Navigate
        to="/minha-conta"
        replace
      />
    )
  }

  return <Outlet />
}

export default RotaAdmin
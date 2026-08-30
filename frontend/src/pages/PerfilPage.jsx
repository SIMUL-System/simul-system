import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { logout } from '../services/authService'
import { obterUsuarioAtual } from '../services/usuarioService'
import '../App.css'

function PerfilPage() {
  const navigate = useNavigate()

  const [usuario, setUsuario] = useState(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] =
    useState(true)

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const dados =
          await obterUsuarioAtual()

        setUsuario(dados)
      } catch (error) {
        setErro(
          error.message ||
            'Não foi possível carregar o usuário.',
        )
      } finally {
        setCarregando(false)
      }
    }

    carregarUsuario()
  }, [])

  function handleLogout() {
    logout()

    navigate('/login', {
      replace: true,
    })
  }

  return (
    <main className="app">
      <section className="consulta">
        <header className="consulta__cabecalho">
          <span className="consulta__marca">
            SIMUL
          </span>

          <h1>Minha conta</h1>

          <p>
            Dados do usuário autenticado.
          </p>
        </header>

        {carregando && (
          <p>Carregando usuário...</p>
        )}

        {erro && (
          <div
            className="mensagem mensagem--erro"
            role="alert"
          >
            {erro}
          </div>
        )}

        {usuario && (
          <section className="resultado">
            <p>
              <strong>Nome:</strong>{' '}
              {usuario.nome}
            </p>

            <p>
              <strong>E-mail:</strong>{' '}
              {usuario.email}
            </p>

            <p>
              <strong>Perfil:</strong>{' '}
              {usuario.perfil}
            </p>
          </section>
        )}

        <div className="acoes-conta">
          <Link to="/">
            Voltar para consulta
          </Link>

          <button
            type="button"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      </section>
    </main>
  )
}

export default PerfilPage
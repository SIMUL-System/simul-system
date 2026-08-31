import {
  NavLink,
  useNavigate,
} from 'react-router-dom'
import {
  useEffect,
  useState,
} from 'react'

import {
  logout,
  obterToken,
} from '../services/authService'

import {
  obterUsuarioAtual,
} from '../services/usuarioService'

function NavegacaoPrincipal() {
  const navigate = useNavigate()

  const [menuAberto, setMenuAberto] =
    useState(false)

  const [usuario, setUsuario] =
    useState(null)

  const token = obterToken()

  useEffect(() => {
    let componenteAtivo = true

    async function carregarUsuario() {
      if (!token) {
        return
      }

      try {
        const dados =
          await obterUsuarioAtual()

        if (componenteAtivo) {
          setUsuario(dados)
        }
      } catch {
        if (componenteAtivo) {
          setUsuario(null)
        }
      }
    }

    carregarUsuario()

    return () => {
      componenteAtivo = false
    }
  }, [token])

  function classeLink({
    isActive,
  }) {
    return isActive
      ? 'navegacao-principal__link navegacao-principal__link--ativo'
      : 'navegacao-principal__link'
  }

  function fecharMenu() {
    setMenuAberto(false)
  }

  function handleLogout() {
    logout()

    setUsuario(null)
    setMenuAberto(false)

    navigate('/', {
      replace: true,
    })
  }

  const autenticado =
    Boolean(token && usuario)

  const admin =
    usuario?.perfil === 'ADMIN'

  return (
    <header className="navegacao-principal">
      <div className="navegacao-principal__conteudo">
        <NavLink
          to="/"
          className="navegacao-principal__marca"
          onClick={fecharMenu}
        >
          <span className="navegacao-principal__simbolo">
            ♻
          </span>

          <span className="navegacao-principal__identidade">
            <strong>SIMUL</strong>

            <small>
              Monitoramento Urbano de
              Limpeza
            </small>
          </span>
        </NavLink>

        <button
          type="button"
          className="navegacao-principal__menu-botao"
          aria-label={
            menuAberto
              ? 'Fechar menu'
              : 'Abrir menu'
          }
          aria-expanded={
            menuAberto
          }
          onClick={() =>
            setMenuAberto(
              (valor) => !valor,
            )
          }
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={
            menuAberto
              ? 'navegacao-principal__links navegacao-principal__links--aberto'
              : 'navegacao-principal__links'
          }
        >
          <NavLink
            to="/"
            end
            className={classeLink}
            onClick={fecharMenu}
          >
            Consulta
          </NavLink>

          {autenticado && (
            <>
              <NavLink
                to="/minha-conta"
                className={
                  classeLink
                }
                onClick={fecharMenu}
              >
                Minha conta
              </NavLink>

              <NavLink
                to="/preferencias"
                className={
                  classeLink
                }
                onClick={fecharMenu}
              >
                Notificações
              </NavLink>

              {admin && (
                <NavLink
                  to="/admin"
                  className={
                    classeLink
                  }
                  onClick={
                    fecharMenu
                  }
                >
                  Painel ADM
                </NavLink>
              )}

              <button
                type="button"
                className="navegacao-principal__sair"
                onClick={
                  handleLogout
                }
              >
                Sair
              </button>
            </>
          )}

          {!autenticado && (
            <>
              <NavLink
                to="/login"
                className={
                  classeLink
                }
                onClick={
                  fecharMenu
                }
              >
                Entrar
              </NavLink>

              <NavLink
                to="/cadastro"
                className="navegacao-principal__cadastro"
                onClick={
                  fecharMenu
                }
              >
                Criar conta
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default NavegacaoPrincipal
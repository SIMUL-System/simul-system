import { NavLink, useNavigate } from 'react-router-dom'

import { useEffect, useRef, useState } from 'react'

import { logout, obterToken } from '../services/authService'

import { obterUsuarioAtual } from '../services/usuarioService'

import { useTema } from '../hooks/useTema'

import Icone from './Icone'

import simboloClaro from '../assets/marca/simul-simbolo.svg'
import simboloEscuro from '../assets/marca/simul-simbolo-escuro.svg'

/** Cabeçalho com o menu do site, o tema claro/escuro e entrar/sair. */
function NavegacaoPrincipal() {
  const navigate = useNavigate()

  const botaoMenuRef = useRef(null)

  const [menuAberto, setMenuAberto] = useState(false)
  const [usuario, setUsuario] = useState(null)

  const { tema, alternarTema } = useTema()

  const token = obterToken()

  useEffect(() => {
    let componenteAtivo = true

    async function carregarUsuario() {
      if (!token) {
        if (componenteAtivo) {
          setUsuario(null)
        }

        return
      }

      try {
        const dados = await obterUsuarioAtual()

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

  useEffect(() => {
    if (!menuAberto) {
      return undefined
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuAberto(false)

        botaoMenuRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuAberto])

  function classeLink({ isActive }) {
    return isActive ? 'cabecalho__link cabecalho__link--ativo' : 'cabecalho__link'
  }

  function fecharMenu() {
    setMenuAberto(false)
  }

  function alternarMenu() {
    setMenuAberto((valorAtual) => !valorAtual)
  }

  function handleLogout() {
    logout()

    setUsuario(null)
    setMenuAberto(false)

    navigate('/', {
      replace: true,
    })
  }

  const autenticado = Boolean(token && usuario)

  const admin = usuario?.perfil === 'ADMIN'

  const temaEscuro = tema === 'dark'

  const primeiroNome = usuario?.nome?.split(' ')[0]

  return (
    <header className="cabecalho">
      <div className="cabecalho__conteudo">
        <NavLink
          to="/"
          className="cabecalho__marca"
          onClick={fecharMenu}
          aria-label="SIMUL, página inicial"
        >
          <img src={temaEscuro ? simboloEscuro : simboloClaro} alt="" width="32" height="32" />

          <span className="cabecalho__nome">SIMUL</span>
        </NavLink>

        <div className="cabecalho__acoes">
          <button
            type="button"
            className="botao-icone"
            onClick={alternarTema}
            aria-label={temaEscuro ? 'Usar tema claro' : 'Usar tema escuro'}
            title={temaEscuro ? 'Usar tema claro' : 'Usar tema escuro'}
          >
            <Icone nome={temaEscuro ? 'sol' : 'lua'} />
          </button>

          <button
            ref={botaoMenuRef}
            type="button"
            className="botao-icone cabecalho__menu-botao"
            aria-label={menuAberto ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={menuAberto}
            aria-controls="menu-principal"
            onClick={alternarMenu}
          >
            <Icone nome={menuAberto ? 'fechar' : 'menu'} />
          </button>
        </div>

        <nav
          id="menu-principal"
          aria-label="Navegação principal"
          className={menuAberto ? 'cabecalho__menu cabecalho__menu--aberto' : 'cabecalho__menu'}
        >
          <ul className="cabecalho__links">
            <li>
              <NavLink to="/" end className={classeLink} onClick={fecharMenu}>
                Consultar coleta
              </NavLink>
            </li>

            <li>
              <NavLink to="/guia-de-descarte" className={classeLink} onClick={fecharMenu}>
                Guia de descarte
              </NavLink>
            </li>

            <li>
              <NavLink to="/quem-somos" className={classeLink} onClick={fecharMenu}>
                Quem somos
              </NavLink>
            </li>

            {autenticado && (
              <li>
                <NavLink to="/preferencias" className={classeLink} onClick={fecharMenu}>
                  Meus lembretes
                </NavLink>
              </li>
            )}

            {autenticado && (
              <li>
                <NavLink to="/minha-conta" className={classeLink} onClick={fecharMenu}>
                  Minha conta
                </NavLink>
              </li>
            )}

            {admin && (
              <li>
                <NavLink to="/admin" className={classeLink} onClick={fecharMenu}>
                  Painel admin
                </NavLink>
              </li>
            )}
          </ul>

          <div className="cabecalho__conta">
            {autenticado ? (
              <>
                <span className="cabecalho__usuario">
                  <Icone nome="usuario" tamanho={18} />
                  {primeiroNome}
                </span>

                <button
                  type="button"
                  className="botao botao--fantasma botao--pequeno"
                  onClick={handleLogout}
                >
                  <Icone nome="sair" tamanho={18} />
                  Sair
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="botao botao--fantasma botao--pequeno"
                  onClick={fecharMenu}
                >
                  Entrar
                </NavLink>

                <NavLink
                  to="/cadastro"
                  className="botao botao--primario botao--pequeno"
                  onClick={fecharMenu}
                >
                  Criar conta
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default NavegacaoPrincipal

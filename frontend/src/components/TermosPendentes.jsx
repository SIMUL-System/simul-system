import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import Alerta from './Alerta'

import { logout, obterToken } from '../services/authService'
import { aceitarTermos } from '../services/privacidadeService'
import { obterUsuarioAtual } from '../services/usuarioService'

import { VERSAO_TERMOS } from '../conteudo/legal'

// Nas páginas dos próprios termos o pedido não aparece: a pessoa precisa conseguir lê-los.
const PAGINAS_LIVRES = ['/termos', '/privacidade']

/**
 * Quem tem conta e ainda não aceitou a versão atual dos Termos de Uso e da
 * Política de Privacidade (conta antiga ou texto atualizado) vê este pedido
 * ao entrar. Dá para aceitar ou sair da conta.
 */
function TermosPendentes() {
  const location = useLocation()
  const navigate = useNavigate()
  const dialogoRef = useRef(null)
  const verificadoRef = useRef(null)
  const [pendente, setPendente] = useState(false)
  const [marcado, setMarcado] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const token = obterToken()
  const livre = PAGINAS_LIVRES.includes(location.pathname)

  // Confere uma vez por login (o token muda a cada entrada).
  useEffect(() => {
    if (!token || verificadoRef.current === token) {
      return undefined
    }

    let ativo = true
    verificadoRef.current = token

    obterUsuarioAtual()
      .then((usuario) => {
        if (ativo && usuario && usuario.termosVersao !== VERSAO_TERMOS) {
          setPendente(true)
        }
      })
      .catch(() => {
        // Sem resposta agora: tenta de novo no próximo login.
        verificadoRef.current = null
      })

    return () => {
      ativo = false
    }
  }, [token])

  const mostrar = pendente && Boolean(token) && !livre

  useEffect(() => {
    const dialogo = dialogoRef.current

    if (!dialogo) return

    if (mostrar && !dialogo.open) {
      dialogo.showModal?.()
    } else if (!mostrar && dialogo.open) {
      dialogo.close()
    }
  }, [mostrar])

  async function aceitar() {
    setSalvando(true)
    setErro('')

    try {
      await aceitarTermos(VERSAO_TERMOS)
      setPendente(false)
    } catch (error) {
      setErro(error.message || 'Não foi possível registrar o aceite. Tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  function sair() {
    setPendente(false)
    logout()
    navigate('/', { replace: true })
  }

  if (!pendente) {
    return null
  }

  return (
    <dialog
      ref={dialogoRef}
      className="dialogo dialogo-termos"
      aria-labelledby="titulo-termos-pendentes"
      // Esc não fecha: é preciso escolher uma das duas opções.
      onCancel={(event) => event.preventDefault()}
    >
      <div className="dialogo__conteudo">
        <h2 id="titulo-termos-pendentes" className="dialogo__titulo">
          Atualizamos nossos termos
        </h2>

        <div className="dialogo__texto dialogo-termos__corpo">
          <p>
            Para continuar usando sua conta, leia e aceite os{' '}
            <Link to="/termos" target="_blank" rel="noopener">
              Termos de Uso
            </Link>{' '}
            e a{' '}
            <Link to="/privacidade" target="_blank" rel="noopener">
              Política de Privacidade
            </Link>
            . Eles explicam, em linguagem simples, quais dados guardamos e como você pode baixá-los
            ou apagá-los.
          </p>

          <label className="aceite__opcao">
            <input
              type="checkbox"
              checked={marcado}
              onChange={(event) => setMarcado(event.target.checked)}
              disabled={salvando}
            />
            <span>Li e aceito os Termos de Uso e a Política de Privacidade.</span>
          </label>

          {erro && <Alerta tipo="erro">{erro}</Alerta>}
        </div>

        <div className="dialogo__acoes">
          <button
            type="button"
            className="botao botao--secundario"
            onClick={sair}
            disabled={salvando}
          >
            Sair da conta
          </button>
          <button
            type="button"
            className="botao botao--primario"
            onClick={aceitar}
            disabled={!marcado || salvando}
          >
            {salvando ? 'Salvando…' : 'Aceitar e continuar'}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default TermosPendentes

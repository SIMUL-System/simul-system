import { useEffect, useState } from 'react'

import { Link, useSearchParams } from 'react-router-dom'

import { verificarEmail } from '../services/usuarioService'

import '../App.css'

import Alerta from '../components/Alerta'
import LayoutAcesso from '../components/auth/LayoutAcesso'

/** Confirma o e-mail com o token do link. */
function VerificarEmailPage() {
  const [searchParams] = useSearchParams()

  const [carregando, setCarregando] = useState(true)
  const [sucesso, setSucesso] = useState(false)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    let componenteAtivo = true

    async function executarVerificacao() {
      const token = searchParams.get('token')

      if (!token) {
        if (!componenteAtivo) {
          return
        }

        setSucesso(false)

        setMensagem('O link de confirmação não possui um token válido.')

        setCarregando(false)

        return
      }

      try {
        const resposta = await verificarEmail(token)

        if (!componenteAtivo) {
          return
        }

        setSucesso(Boolean(resposta?.verificado))

        setMensagem(resposta?.mensagem || 'E-mail confirmado com sucesso.')
      } catch (error) {
        if (!componenteAtivo) {
          return
        }

        setSucesso(false)

        setMensagem(error.message || 'Não foi possível confirmar o e-mail.')
      } finally {
        if (componenteAtivo) {
          setCarregando(false)
        }
      }
    }

    executarVerificacao()

    return () => {
      componenteAtivo = false
    }
  }, [searchParams])

  return (
    <LayoutAcesso
      idTitulo="titulo-verificacao-email"
      titulo="Confirmação de e-mail"
      descricao={carregando ? 'Estamos conferindo o link que você recebeu.' : undefined}
      ocupado={carregando}
      rodape={
        !carregando && !sucesso ? (
          <p>Precisa de um novo link? Entre com seu e-mail e escolha reenviar.</p>
        ) : null
      }
    >
      {carregando && (
        <p className="acesso__carregando" role="status">
          <span className="acesso__spinner" aria-hidden="true" />
          Confirmando seu e-mail…
        </p>
      )}

      {!carregando && sucesso && (
        <>
          <Alerta tipo="sucesso" titulo="E-mail confirmado">
            {mensagem}
          </Alerta>

          <p>Sua conta está pronta. Entre para escolher sua rota e ativar o lembrete.</p>

          <Link to="/login" className="botao botao--primario">
            Entrar
          </Link>
        </>
      )}

      {!carregando && !sucesso && (
        <>
          <Alerta tipo="erro" titulo="Não foi possível confirmar">
            {mensagem}
          </Alerta>

          <p className="acesso__nota">
            O link pode ter expirado, já ter sido usado ou estar incompleto.
          </p>

          <Link to="/login" className="botao botao--secundario">
            Ir para o login
          </Link>
        </>
      )}
    </LayoutAcesso>
  )
}

export default VerificarEmailPage

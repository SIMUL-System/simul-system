import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useSearchParams,
} from 'react-router-dom'

import {
  verificarEmail,
} from '../services/usuarioService'

import '../App.css'

function VerificarEmailPage() {
  const [searchParams] =
    useSearchParams()

  const [carregando, setCarregando] =
    useState(true)

  const [sucesso, setSucesso] =
    useState(false)

  const [mensagem, setMensagem] =
    useState('')

  useEffect(() => {
    let componenteAtivo = true

    async function executarVerificacao() {
      const token =
        searchParams.get('token')

      if (!token) {
        if (!componenteAtivo) {
          return
        }

        setSucesso(false)

        setMensagem(
          'O link de confirmação não possui um token válido.',
        )

        setCarregando(false)

        return
      }

      try {
        const resposta =
          await verificarEmail(
            token,
          )

        if (!componenteAtivo) {
          return
        }

        setSucesso(
          Boolean(
            resposta?.verificado,
          ),
        )

        setMensagem(
          resposta?.mensagem ||
            'E-mail confirmado com sucesso.',
        )
      } catch (error) {
        if (!componenteAtivo) {
          return
        }

        setSucesso(false)

        setMensagem(
          error.message ||
            'Não foi possível confirmar o e-mail.',
        )
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
    <main className="app">
      <section
        className="consulta"
        aria-labelledby="titulo-verificacao-email"
        aria-busy={carregando}
      >
        <header className="consulta__cabecalho">
          <span
            className="consulta__marca"
            aria-label="SIMUL"
          >
            SIMUL
          </span>

          <h1 id="titulo-verificacao-email">
            Confirmação de e-mail
          </h1>

          <p>
            Estamos verificando o link
            enviado para o seu e-mail.
          </p>
        </header>

        {carregando && (
          <div
            className="mensagem"
            role="status"
            aria-live="polite"
          >
            Confirmando seu e-mail...
          </div>
        )}

        {!carregando &&
          sucesso && (
            <>
              <div
                className="mensagem mensagem--sucesso"
                role="status"
                aria-live="polite"
              >
                {mensagem}
              </div>

              <p className="navegacao-secundaria">
                Sua conta está pronta
                para ser utilizada.
              </p>

              <p className="navegacao-secundaria">
                <Link to="/login">
                  Ir para o login
                </Link>
              </p>
            </>
          )}

        {!carregando &&
          !sucesso && (
            <>
              <div
                className="mensagem mensagem--erro"
                role="alert"
                aria-live="assertive"
              >
                {mensagem}
              </div>

              <p className="navegacao-secundaria">
                O link pode ter
                expirado, já ter sido
                utilizado ou estar
                incorreto.
              </p>

              <p className="navegacao-secundaria">
                <Link to="/login">
                  Voltar para o login
                </Link>
              </p>
            </>
          )}
      </section>
    </main>
  )
}

export default VerificarEmailPage
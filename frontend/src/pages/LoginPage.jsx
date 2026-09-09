import { useState } from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { login } from '../services/authService'

import {
  reenviarVerificacaoEmail,
} from '../services/usuarioService'

import '../App.css'

function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    valor,
  )
}

function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const [
    mostrarSenha,
    setMostrarSenha,
  ] = useState(false)

  const [
    erroEmail,
    setErroEmail,
  ] = useState('')

  const [
    erroSenha,
    setErroSenha,
  ] = useState('')

  const [erro, setErro] = useState('')

  const [
    carregando,
    setCarregando,
  ] = useState(false)

  const [
    mostrarReenvio,
    setMostrarReenvio,
  ] = useState(false)

  const [
    reenviando,
    setReenviando,
  ] = useState(false)

  const [
    mensagemReenvio,
    setMensagemReenvio,
  ] = useState('')

  function limparEstadoReenvio() {
    setMostrarReenvio(false)
    setMensagemReenvio('')
  }

  function validarFormulario() {
    let formularioValido = true

    setErroEmail('')
    setErroSenha('')
    setErro('')

    const emailNormalizado =
      email.trim()

    if (!emailNormalizado) {
      setErroEmail(
        'Informe seu e-mail.',
      )

      formularioValido = false
    } else if (
      !emailValido(
        emailNormalizado,
      )
    ) {
      setErroEmail(
        'Informe um e-mail válido.',
      )

      formularioValido = false
    }

    if (!senha) {
      setErroSenha(
        'Informe sua senha.',
      )

      formularioValido = false
    }

    return formularioValido
  }

  async function handleSubmit(
    event,
  ) {
    event.preventDefault()

    limparEstadoReenvio()

    if (!validarFormulario()) {
      return
    }

    try {
      setCarregando(true)

      await login(
        email.trim(),
        senha,
      )

      navigate(
        '/minha-conta',
        {
          replace: true,
        },
      )
    } catch (error) {
      const emailNaoVerificado =
        error?.status === 403 &&
        (
          error?.data?.title ===
            'E-mail não verificado' ||
          error?.message ===
            'Confirme seu e-mail antes de entrar.'
        )

      if (emailNaoVerificado) {
        setMostrarReenvio(true)

        setErro(
          'Seu e-mail ainda não foi confirmado. Confirme o endereço antes de entrar.',
        )

        return
      }

      setErro(
        error.message ||
          'Não foi possível realizar o login.',
      )
    } finally {
      setCarregando(false)
    }
  }

  async function handleReenviarVerificacao() {
    const emailNormalizado =
      email.trim()

    setMensagemReenvio('')

    if (
      !emailNormalizado ||
      !emailValido(
        emailNormalizado,
      )
    ) {
      setErroEmail(
        'Informe um e-mail válido para reenviar a confirmação.',
      )

      return
    }

    try {
      setReenviando(true)

      const resposta =
        await reenviarVerificacaoEmail(
          emailNormalizado,
        )

      setMensagemReenvio(
        resposta?.mensagem ||
          'Se existir uma conta associada a este e-mail e ela ainda precisar de confirmação, enviaremos uma nova mensagem.',
      )
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível solicitar um novo e-mail de confirmação.',
      )
    } finally {
      setReenviando(false)
    }
  }

  return (
    <main className="app">
      <section
        className="consulta"
        aria-labelledby="titulo-login"
      >
        <header className="consulta__cabecalho">
          <span
            className="consulta__marca"
            aria-label="SIMUL"
          >
            SIMUL
          </span>

          <h1 id="titulo-login">
            Entrar
          </h1>

          <p>
            Acesse sua conta para
            gerenciar suas preferências
            de notificação.
          </p>
        </header>

        <form
          className="consulta__formulario"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="campo">
            <label htmlFor="email">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(
                  event.target.value,
                )

                if (erroEmail) {
                  setErroEmail('')
                }

                if (
                  mostrarReenvio ||
                  mensagemReenvio
                ) {
                  limparEstadoReenvio()
                }
              }}
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
              inputMode="email"
              aria-invalid={
                Boolean(erroEmail)
              }
              aria-describedby={
                erroEmail
                  ? 'erro-email-login'
                  : undefined
              }
              disabled={
                carregando ||
                reenviando
              }
            />

            {erroEmail && (
              <p
                id="erro-email-login"
                className="campo__erro"
                role="alert"
              >
                {erroEmail}
              </p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="senha">
              Senha
            </label>

            <div className="campo-senha">
              <input
                id="senha"
                type={
                  mostrarSenha
                    ? 'text'
                    : 'password'
                }
                value={senha}
                onChange={(event) => {
                  setSenha(
                    event.target.value,
                  )

                  if (erroSenha) {
                    setErroSenha('')
                  }
                }}
                autoComplete="current-password"
                placeholder="Digite sua senha"
                aria-invalid={
                  Boolean(erroSenha)
                }
                aria-describedby={
                  erroSenha
                    ? 'erro-senha-login'
                    : undefined
                }
                disabled={
                  carregando ||
                  reenviando
                }
              />

              <button
                type="button"
                className="botao-mostrar-senha"
                onClick={() =>
                  setMostrarSenha(
                    (valorAtual) =>
                      !valorAtual,
                  )
                }
                aria-pressed={
                  mostrarSenha
                }
                aria-label={
                  mostrarSenha
                    ? 'Ocultar senha'
                    : 'Mostrar senha'
                }
                disabled={
                  carregando ||
                  reenviando
                }
              >
                {mostrarSenha
                  ? 'Ocultar'
                  : 'Mostrar'}
              </button>
            </div>

            {erroSenha && (
              <p
                id="erro-senha-login"
                className="campo__erro"
                role="alert"
              >
                {erroSenha}
              </p>
            )}
          </div>

          <p className="navegacao-secundaria">
            <Link to="/recuperar-senha">
              Esqueci minha senha
            </Link>
          </p>

          <button
            type="submit"
            disabled={
              carregando ||
              reenviando
            }
          >
            {carregando
              ? 'Entrando...'
              : 'Entrar'}
          </button>
        </form>

        {erro && (
          <div
            className="mensagem mensagem--erro"
            role="alert"
            aria-live="assertive"
          >
            {erro}
          </div>
        )}

        {mostrarReenvio && (
          <section
            className="rota-selecionada"
            aria-labelledby="titulo-reenvio-email"
          >
            <h2 id="titulo-reenvio-email">
              Não recebeu o e-mail?
            </h2>

            <p>
              Podemos enviar um novo
              link de confirmação para:
            </p>

            <p>
              <strong>
                {email.trim()}
              </strong>
            </p>

            <button
              type="button"
              className="botao-salvar"
              onClick={
                handleReenviarVerificacao
              }
              disabled={
                reenviando ||
                carregando
              }
            >
              {reenviando
                ? 'Enviando...'
                : 'Reenviar e-mail de confirmação'}
            </button>
          </section>
        )}

        {mensagemReenvio && (
          <div
            className="mensagem mensagem--sucesso"
            role="status"
            aria-live="polite"
          >
            {mensagemReenvio}
          </div>
        )}

        <p className="navegacao-secundaria">
          Ainda não possui conta?{' '}
          <Link to="/cadastro">
            Criar conta
          </Link>
        </p>

        <p className="navegacao-secundaria">
          <Link to="/">
            Voltar para consulta
          </Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
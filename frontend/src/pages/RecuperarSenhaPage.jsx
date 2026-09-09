import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  solicitarRecuperacaoSenha,
} from '../services/usuarioService'

import '../App.css'

function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    valor,
  )
}

function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')

  const [
    erroEmail,
    setErroEmail,
  ] = useState('')

  const [erro, setErro] = useState('')

  const [
    mensagem,
    setMensagem,
  ] = useState('')

  const [
    carregando,
    setCarregando,
  ] = useState(false)

  async function handleSubmit(
    event,
  ) {
    event.preventDefault()

    setErro('')
    setErroEmail('')
    setMensagem('')

    const emailNormalizado =
      email.trim()

    if (!emailNormalizado) {
      setErroEmail(
        'Informe seu e-mail.',
      )

      return
    }

    if (
      !emailValido(
        emailNormalizado,
      )
    ) {
      setErroEmail(
        'Informe um e-mail válido.',
      )

      return
    }

    try {
      setCarregando(true)

      const resposta =
        await solicitarRecuperacaoSenha(
          emailNormalizado,
        )

      setMensagem(
        resposta?.mensagem ||
          'Se existir uma conta associada a este e-mail, enviaremos as instruções para redefinir a senha.',
      )
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível solicitar a recuperação da senha.',
      )
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="app">
      <section
        className="consulta"
        aria-labelledby="titulo-recuperacao-senha"
      >
        <header className="consulta__cabecalho">
          <span
            className="consulta__marca"
            aria-label="SIMUL"
          >
            SIMUL
          </span>

          <h1 id="titulo-recuperacao-senha">
            Esqueci minha senha
          </h1>

          <p>
            Informe o e-mail da sua
            conta. Se houver uma conta
            associada a esse endereço,
            enviaremos um link para
            redefinir sua senha.
          </p>
        </header>

        <form
          className="consulta__formulario"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="campo">
            <label htmlFor="emailRecuperacao">
              E-mail
            </label>

            <input
              id="emailRecuperacao"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(
                  event.target.value,
                )

                if (erroEmail) {
                  setErroEmail('')
                }

                if (erro) {
                  setErro('')
                }

                if (mensagem) {
                  setMensagem('')
                }
              }}
              autoComplete="email"
              inputMode="email"
              placeholder="seuemail@exemplo.com"
              aria-invalid={
                Boolean(erroEmail)
              }
              aria-describedby={
                erroEmail
                  ? 'erro-email-recuperacao'
                  : 'ajuda-email-recuperacao'
              }
              disabled={carregando}
            />

            <small id="ajuda-email-recuperacao">
              Use o mesmo e-mail
              cadastrado na sua conta do
              SIMUL.
            </small>

            {erroEmail && (
              <p
                id="erro-email-recuperacao"
                className="campo__erro"
                role="alert"
              >
                {erroEmail}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={carregando}
          >
            {carregando
              ? 'Enviando...'
              : 'Enviar link de recuperação'}
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

        {mensagem && (
          <div
            className="mensagem mensagem--sucesso"
            role="status"
            aria-live="polite"
          >
            {mensagem}
          </div>
        )}

        <p className="navegacao-secundaria">
          <Link to="/login">
            Voltar para o login
          </Link>
        </p>
      </section>
    </main>
  )
}

export default RecuperarSenhaPage
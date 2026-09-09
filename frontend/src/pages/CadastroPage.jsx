import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  cadastrarUsuario,
  reenviarVerificacaoEmail,
} from '../services/usuarioService'

import '../App.css'

function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    valor,
  )
}

function CadastroPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [
    confirmacaoSenha,
    setConfirmacaoSenha,
  ] = useState('')

  const [
    mostrarSenha,
    setMostrarSenha,
  ] = useState(false)

  const [
    mostrarConfirmacaoSenha,
    setMostrarConfirmacaoSenha,
  ] = useState(false)

  const [erroNome, setErroNome] =
    useState('')

  const [erroEmail, setErroEmail] =
    useState('')

  const [erroSenha, setErroSenha] =
    useState('')

  const [
    erroConfirmacaoSenha,
    setErroConfirmacaoSenha,
  ] = useState('')

  const [erro, setErro] = useState('')

  const [sucesso, setSucesso] =
    useState('')

  const [
    emailCadastro,
    setEmailCadastro,
  ] = useState('')

  const [
    cadastroConcluido,
    setCadastroConcluido,
  ] = useState(false)

  const [
    carregando,
    setCarregando,
  ] = useState(false)

  const [
    reenviando,
    setReenviando,
  ] = useState(false)

  const [
    mensagemReenvio,
    setMensagemReenvio,
  ] = useState('')

  function validarFormulario() {
    let formularioValido = true

    setErroNome('')
    setErroEmail('')
    setErroSenha('')
    setErroConfirmacaoSenha('')
    setErro('')
    setSucesso('')
    setMensagemReenvio('')

    const nomeNormalizado =
      nome.trim()

    const emailNormalizado =
      email.trim()

    if (!nomeNormalizado) {
      setErroNome(
        'Informe seu nome.',
      )

      formularioValido = false
    }

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
        'Informe uma senha.',
      )

      formularioValido = false
    }

    if (!confirmacaoSenha) {
      setErroConfirmacaoSenha(
        'Confirme sua senha.',
      )

      formularioValido = false
    } else if (
      senha !== confirmacaoSenha
    ) {
      setErroConfirmacaoSenha(
        'As senhas não coincidem.',
      )

      formularioValido = false
    }

    return formularioValido
  }

  async function handleSubmit(
    event,
  ) {
    event.preventDefault()

    if (!validarFormulario()) {
      return
    }

    const emailNormalizado =
      email.trim()

    try {
      setCarregando(true)

      await cadastrarUsuario({
        nome: nome.trim(),
        email: emailNormalizado,
        senha,
      })

      setEmailCadastro(
        emailNormalizado,
      )

      setCadastroConcluido(true)

      setSucesso(
        'Cadastro realizado com sucesso. Enviamos um link de confirmação para o seu e-mail.',
      )

      setNome('')
      setEmail('')
      setSenha('')
      setConfirmacaoSenha('')

      setMostrarSenha(false)
      setMostrarConfirmacaoSenha(
        false,
      )
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível realizar o cadastro.',
      )
    } finally {
      setCarregando(false)
    }
  }

  async function handleReenviarVerificacao() {
    if (!emailCadastro) {
      return
    }

    setErro('')
    setMensagemReenvio('')

    try {
      setReenviando(true)

      const resposta =
        await reenviarVerificacaoEmail(
          emailCadastro,
        )

      setMensagemReenvio(
        resposta?.mensagem ||
          'Se a conta ainda precisar de confirmação, um novo e-mail será enviado.',
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
        aria-labelledby="titulo-cadastro"
      >
        <header className="consulta__cabecalho">
          <span
            className="consulta__marca"
            aria-label="SIMUL"
          >
            SIMUL
          </span>

          <h1 id="titulo-cadastro">
            Crie sua conta
          </h1>

          <p>
            Cadastre-se para configurar
            suas preferências de
            notificação da coleta
            seletiva.
          </p>
        </header>

        {!cadastroConcluido && (
          <form
            className="consulta__formulario"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="campo">
              <label htmlFor="nome">
                Nome
              </label>

              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(event) => {
                  setNome(
                    event.target.value,
                  )

                  if (erroNome) {
                    setErroNome('')
                  }
                }}
                autoComplete="name"
                placeholder="Seu nome"
                aria-invalid={
                  Boolean(erroNome)
                }
                aria-describedby={
                  erroNome
                    ? 'erro-nome-cadastro'
                    : undefined
                }
                disabled={carregando}
              />

              {erroNome && (
                <p
                  id="erro-nome-cadastro"
                  className="campo__erro"
                  role="alert"
                >
                  {erroNome}
                </p>
              )}
            </div>

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
                }}
                autoComplete="email"
                placeholder="seuemail@exemplo.com"
                inputMode="email"
                aria-invalid={
                  Boolean(erroEmail)
                }
                aria-describedby={
                  erroEmail
                    ? 'erro-email-cadastro'
                    : undefined
                }
                disabled={carregando}
              />

              {erroEmail && (
                <p
                  id="erro-email-cadastro"
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

                    if (
                      erroConfirmacaoSenha
                    ) {
                      setErroConfirmacaoSenha(
                        '',
                      )
                    }
                  }}
                  autoComplete="new-password"
                  placeholder="Digite sua senha"
                  aria-invalid={
                    Boolean(erroSenha)
                  }
                  aria-describedby={
                    erroSenha
                      ? 'erro-senha-cadastro'
                      : undefined
                  }
                  disabled={carregando}
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
                  disabled={carregando}
                >
                  {mostrarSenha
                    ? 'Ocultar'
                    : 'Mostrar'}
                </button>
              </div>

              {erroSenha && (
                <p
                  id="erro-senha-cadastro"
                  className="campo__erro"
                  role="alert"
                >
                  {erroSenha}
                </p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="confirmacaoSenha">
                Confirme sua senha
              </label>

              <div className="campo-senha">
                <input
                  id="confirmacaoSenha"
                  type={
                    mostrarConfirmacaoSenha
                      ? 'text'
                      : 'password'
                  }
                  value={
                    confirmacaoSenha
                  }
                  onChange={(event) => {
                    setConfirmacaoSenha(
                      event.target.value,
                    )

                    if (
                      erroConfirmacaoSenha
                    ) {
                      setErroConfirmacaoSenha(
                        '',
                      )
                    }
                  }}
                  autoComplete="new-password"
                  placeholder="Digite a senha novamente"
                  aria-invalid={
                    Boolean(
                      erroConfirmacaoSenha,
                    )
                  }
                  aria-describedby={
                    erroConfirmacaoSenha
                      ? 'erro-confirmacao-senha-cadastro'
                      : undefined
                  }
                  disabled={carregando}
                />

                <button
                  type="button"
                  className="botao-mostrar-senha"
                  onClick={() =>
                    setMostrarConfirmacaoSenha(
                      (valorAtual) =>
                        !valorAtual,
                    )
                  }
                  aria-pressed={
                    mostrarConfirmacaoSenha
                  }
                  aria-label={
                    mostrarConfirmacaoSenha
                      ? 'Ocultar confirmação da senha'
                      : 'Mostrar confirmação da senha'
                  }
                  disabled={carregando}
                >
                  {mostrarConfirmacaoSenha
                    ? 'Ocultar'
                    : 'Mostrar'}
                </button>
              </div>

              {erroConfirmacaoSenha && (
                <p
                  id="erro-confirmacao-senha-cadastro"
                  className="campo__erro"
                  role="alert"
                >
                  {
                    erroConfirmacaoSenha
                  }
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={carregando}
            >
              {carregando
                ? 'Cadastrando...'
                : 'Criar conta'}
            </button>
          </form>
        )}

        {erro && (
          <div
            className="mensagem mensagem--erro"
            role="alert"
            aria-live="assertive"
          >
            {erro}
          </div>
        )}

        {cadastroConcluido && (
          <section
            className="rota-selecionada"
            aria-labelledby="titulo-confirmar-cadastro"
          >
            <h2 id="titulo-confirmar-cadastro">
              Confirme seu e-mail
            </h2>

            {sucesso && (
              <div
                className="mensagem mensagem--sucesso"
                role="status"
                aria-live="polite"
              >
                {sucesso}
              </div>
            )}

            <p>
              Enviamos a confirmação para:
            </p>

            <p>
              <strong>
                {emailCadastro}
              </strong>
            </p>

            <p>
              Abra sua caixa de entrada
              e clique no link de
              confirmação. Depois disso,
              sua conta estará liberada
              para login.
            </p>

            <p>
              Se não encontrar a
              mensagem, verifique também
              a pasta de spam ou lixo
              eletrônico.
            </p>

            <button
              type="button"
              className="botao-salvar"
              onClick={
                handleReenviarVerificacao
              }
              disabled={reenviando}
            >
              {reenviando
                ? 'Reenviando...'
                : 'Reenviar e-mail de confirmação'}
            </button>

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
              <Link to="/login">
                Ir para o login
              </Link>
            </p>
          </section>
        )}

        {!cadastroConcluido && (
          <>
            <p className="navegacao-secundaria">
              Já possui conta?{' '}
              <Link to="/login">
                Entrar
              </Link>
            </p>

            <p className="navegacao-secundaria">
              <Link to="/">
                Voltar para consulta
              </Link>
            </p>
          </>
        )}
      </section>
    </main>
  )
}

export default CadastroPage
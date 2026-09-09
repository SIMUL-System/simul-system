import { useState } from 'react'
import {
  Link,
  useSearchParams,
} from 'react-router-dom'

import {
  redefinirSenha,
} from '../services/usuarioService'

import '../App.css'

function RedefinirSenhaPage() {
  const [searchParams] =
    useSearchParams()

  const token =
    searchParams.get('token') || ''

  const [
    novaSenha,
    setNovaSenha,
  ] = useState('')

  const [
    confirmacaoSenha,
    setConfirmacaoSenha,
  ] = useState('')

  const [
    mostrarNovaSenha,
    setMostrarNovaSenha,
  ] = useState(false)

  const [
    mostrarConfirmacao,
    setMostrarConfirmacao,
  ] = useState(false)

  const [
    erroNovaSenha,
    setErroNovaSenha,
  ] = useState('')

  const [
    erroConfirmacao,
    setErroConfirmacao,
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

  const [
    senhaAlterada,
    setSenhaAlterada,
  ] = useState(false)

  function validarFormulario() {
    let valido = true

    setErroNovaSenha('')
    setErroConfirmacao('')
    setErro('')
    setMensagem('')

    if (!token) {
      setErro(
        'O link de recuperação não possui um token válido.',
      )

      return false
    }

    if (!novaSenha) {
      setErroNovaSenha(
        'Informe a nova senha.',
      )

      valido = false
    } else if (
      novaSenha.length < 8 ||
      novaSenha.length > 100
    ) {
      setErroNovaSenha(
        'A nova senha deve possuir entre 8 e 100 caracteres.',
      )

      valido = false
    }

    if (!confirmacaoSenha) {
      setErroConfirmacao(
        'Confirme a nova senha.',
      )

      valido = false
    } else if (
      novaSenha !==
      confirmacaoSenha
    ) {
      setErroConfirmacao(
        'As senhas não coincidem.',
      )

      valido = false
    }

    return valido
  }

  async function handleSubmit(
    event,
  ) {
    event.preventDefault()

    if (!validarFormulario()) {
      return
    }

    try {
      setCarregando(true)

      const resposta =
        await redefinirSenha({
          token,
          novaSenha,
          confirmacaoSenha,
        })

      setSenhaAlterada(
        Boolean(
          resposta?.sucesso,
        ),
      )

      setMensagem(
        resposta?.mensagem ||
          'Senha redefinida com sucesso.',
      )

      setNovaSenha('')
      setConfirmacaoSenha('')
      setMostrarNovaSenha(false)
      setMostrarConfirmacao(false)
    } catch (error) {
      setSenhaAlterada(false)

      setErro(
        error.message ||
          'Não foi possível redefinir a senha.',
      )
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="app">
      <section
        className="consulta"
        aria-labelledby="titulo-redefinir-senha"
      >
        <header className="consulta__cabecalho">
          <span
            className="consulta__marca"
            aria-label="SIMUL"
          >
            SIMUL
          </span>

          <h1 id="titulo-redefinir-senha">
            Redefinir senha
          </h1>

          <p>
            Crie uma nova senha para sua
            conta.
          </p>
        </header>

        {!token && (
          <div
            className="mensagem mensagem--erro"
            role="alert"
            aria-live="assertive"
          >
            O link de recuperação é
            inválido ou está incompleto.
          </div>
        )}

        {token &&
          !senhaAlterada && (
            <form
              className="consulta__formulario"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="campo">
                <label htmlFor="novaSenha">
                  Nova senha
                </label>

                <div className="campo-senha">
                  <input
                    id="novaSenha"
                    type={
                      mostrarNovaSenha
                        ? 'text'
                        : 'password'
                    }
                    value={novaSenha}
                    onChange={(event) => {
                      setNovaSenha(
                        event.target.value,
                      )

                      if (
                        erroNovaSenha
                      ) {
                        setErroNovaSenha(
                          '',
                        )
                      }

                      if (
                        erroConfirmacao
                      ) {
                        setErroConfirmacao(
                          '',
                        )
                      }
                    }}
                    autoComplete="new-password"
                    placeholder="Digite a nova senha"
                    aria-invalid={
                      Boolean(
                        erroNovaSenha,
                      )
                    }
                    aria-describedby={
                      erroNovaSenha
                        ? 'erro-nova-senha'
                        : 'ajuda-nova-senha'
                    }
                    disabled={carregando}
                  />

                  <button
                    type="button"
                    className="botao-mostrar-senha"
                    onClick={() =>
                      setMostrarNovaSenha(
                        (
                          valorAtual,
                        ) =>
                          !valorAtual,
                      )
                    }
                    aria-pressed={
                      mostrarNovaSenha
                    }
                    aria-label={
                      mostrarNovaSenha
                        ? 'Ocultar nova senha'
                        : 'Mostrar nova senha'
                    }
                    disabled={carregando}
                  >
                    {mostrarNovaSenha
                      ? 'Ocultar'
                      : 'Mostrar'}
                  </button>
                </div>

                <small id="ajuda-nova-senha">
                  A senha deve possuir
                  entre 8 e 100
                  caracteres.
                </small>

                {erroNovaSenha && (
                  <p
                    id="erro-nova-senha"
                    className="campo__erro"
                    role="alert"
                  >
                    {erroNovaSenha}
                  </p>
                )}
              </div>

              <div className="campo">
                <label htmlFor="confirmacaoNovaSenha">
                  Confirme a nova senha
                </label>

                <div className="campo-senha">
                  <input
                    id="confirmacaoNovaSenha"
                    type={
                      mostrarConfirmacao
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
                        erroConfirmacao
                      ) {
                        setErroConfirmacao(
                          '',
                        )
                      }
                    }}
                    autoComplete="new-password"
                    placeholder="Digite a nova senha novamente"
                    aria-invalid={
                      Boolean(
                        erroConfirmacao,
                      )
                    }
                    aria-describedby={
                      erroConfirmacao
                        ? 'erro-confirmacao-nova-senha'
                        : undefined
                    }
                    disabled={carregando}
                  />

                  <button
                    type="button"
                    className="botao-mostrar-senha"
                    onClick={() =>
                      setMostrarConfirmacao(
                        (
                          valorAtual,
                        ) =>
                          !valorAtual,
                      )
                    }
                    aria-pressed={
                      mostrarConfirmacao
                    }
                    aria-label={
                      mostrarConfirmacao
                        ? 'Ocultar confirmação da nova senha'
                        : 'Mostrar confirmação da nova senha'
                    }
                    disabled={carregando}
                  >
                    {mostrarConfirmacao
                      ? 'Ocultar'
                      : 'Mostrar'}
                  </button>
                </div>

                {erroConfirmacao && (
                  <p
                    id="erro-confirmacao-nova-senha"
                    className="campo__erro"
                    role="alert"
                  >
                    {
                      erroConfirmacao
                    }
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={carregando}
              >
                {carregando
                  ? 'Alterando senha...'
                  : 'Redefinir senha'}
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

        {senhaAlterada && (
          <>
            <div
              className="mensagem mensagem--sucesso"
              role="status"
              aria-live="polite"
            >
              {mensagem}
            </div>

            <p className="navegacao-secundaria">
              Sua nova senha já pode ser
              usada para entrar no
              SIMUL.
            </p>

            <p className="navegacao-secundaria">
              <Link to="/login">
                Ir para o login
              </Link>
            </p>
          </>
        )}

        {!senhaAlterada && (
          <p className="navegacao-secundaria">
            <Link to="/login">
              Voltar para o login
            </Link>
          </p>
        )}
      </section>
    </main>
  )
}

export default RedefinirSenhaPage
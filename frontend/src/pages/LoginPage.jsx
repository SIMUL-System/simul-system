import { useState } from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { login } from '../services/authService'

import {
  obterUsuarioAtual,
  reenviarVerificacaoEmail,
} from '../services/usuarioService'

import '../App.css'

import Alerta from '../components/Alerta'
import Icone from '../components/Icone'
import LayoutAcesso from '../components/auth/LayoutAcesso'
import CampoSenha from '../components/form/CampoSenha'
import CampoTexto from '../components/form/CampoTexto'

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

      // Administrador vai direto para o painel.
      let destino = '/minha-conta'

      try {
        const usuario =
          await obterUsuarioAtual()

        if (usuario?.perfil === 'ADMIN') {
          destino = '/admin'
        }
      } catch {
        // Sem os dados do usuário, segue para Minha conta.
      }

      navigate(
        destino,
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

  const ocupado =
    carregando ||
    reenviando

  return (
    <LayoutAcesso
      idTitulo="titulo-login"
      titulo="Entrar"
      descricao="Acesse sua conta para gerenciar os lembretes da coleta."
      ocupado={ocupado}
      rodape={
        <p>
          Ainda não tem conta?{' '}
          <Link to="/cadastro">
            Criar conta
          </Link>
        </p>
      }
    >
      {erro && (
        <Alerta
          tipo="erro"
          titulo={
            mostrarReenvio
              ? 'E-mail não confirmado'
              : 'Não foi possível entrar'
          }
        >
          {erro}
        </Alerta>
      )}

      {mensagemReenvio && (
        <Alerta
          tipo="sucesso"
          titulo="Pedido enviado"
        >
          {mensagemReenvio}
        </Alerta>
      )}

      <form
        className="acesso__form"
        onSubmit={handleSubmit}
        noValidate
      >
        <CampoTexto
          id="email"
          rotulo="E-mail"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)

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
          inputMode="email"
          placeholder="voce@exemplo.com"
          erro={erroEmail}
          disabled={ocupado}
        />

        <CampoSenha
          id="senha"
          rotulo="Senha"
          value={senha}
          onChange={(event) => {
            setSenha(event.target.value)

            if (erroSenha) {
              setErroSenha('')
            }
          }}
          autoComplete="current-password"
          erro={erroSenha}
          disabled={ocupado}
        />

        <Link
          to="/recuperar-senha"
          className="acesso__link-direita"
        >
          Esqueci minha senha
        </Link>

        <button
          type="submit"
          className="botao botao--primario"
          disabled={ocupado}
        >
          {carregando
            ? 'Entrando…'
            : 'Entrar'}
        </button>
      </form>

      {mostrarReenvio && (
        <>
          <hr className="acesso__separador" />

          <section
            className="acesso__bloco"
            aria-labelledby="titulo-reenvio-email"
          >
            <h2
              id="titulo-reenvio-email"
              className="titulo-cartao"
            >
              Não recebeu o e-mail?
            </h2>

            <p className="acesso__destaque-email">
              <Icone nome="email" />
              {email.trim()}
            </p>

            <button
              type="button"
              className="botao botao--secundario"
              onClick={handleReenviarVerificacao}
              disabled={ocupado}
            >
              {reenviando
                ? 'Enviando…'
                : 'Reenviar e-mail de confirmação'}
            </button>
          </section>
        </>
      )}
    </LayoutAcesso>
  )
}

export default LoginPage

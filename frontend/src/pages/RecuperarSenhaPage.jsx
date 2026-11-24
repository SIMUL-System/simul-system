import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  solicitarRecuperacaoSenha,
} from '../services/usuarioService'

import '../App.css'

import Alerta from '../components/Alerta'
import LayoutAcesso from '../components/auth/LayoutAcesso'
import CampoTexto from '../components/form/CampoTexto'

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
    <LayoutAcesso
      idTitulo="titulo-recuperacao-senha"
      titulo="Esqueci minha senha"
      descricao="Informe o e-mail da sua conta. Se ele estiver cadastrado, enviaremos um link para criar uma nova senha."
      ocupado={carregando}
      rodape={
        <p>
          Lembrou a senha?{' '}
          <Link to="/login">
            Entrar
          </Link>
        </p>
      }
    >
      {erro && (
        <Alerta
          tipo="erro"
          titulo="Não foi possível enviar"
        >
          {erro}
        </Alerta>
      )}

      {mensagem && (
        <Alerta
          tipo="sucesso"
          titulo="Confira seu e-mail"
        >
          {mensagem}
        </Alerta>
      )}

      <form
        className="acesso__form"
        onSubmit={handleSubmit}
        noValidate
      >
        <CampoTexto
          id="emailRecuperacao"
          rotulo="E-mail"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)

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
          placeholder="voce@exemplo.com"
          dica="Use o mesmo e-mail cadastrado no SIMUL."
          erro={erroEmail}
          disabled={carregando}
        />

        <button
          type="submit"
          className="botao botao--primario"
          disabled={carregando}
        >
          {carregando
            ? 'Enviando…'
            : 'Enviar link'}
        </button>
      </form>
    </LayoutAcesso>
  )
}

export default RecuperarSenhaPage

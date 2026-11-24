import { useState } from 'react'
import {
  Link,
  useSearchParams,
} from 'react-router-dom'

import {
  redefinirSenha,
} from '../services/usuarioService'

import '../App.css'

import Alerta from '../components/Alerta'
import LayoutAcesso from '../components/auth/LayoutAcesso'
import CampoSenha from '../components/form/CampoSenha'

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
    <LayoutAcesso
      idTitulo="titulo-redefinir-senha"
      titulo={
        senhaAlterada
          ? 'Senha alterada'
          : 'Criar nova senha'
      }
      descricao={
        senhaAlterada
          ? undefined
          : 'Escolha uma nova senha para sua conta.'
      }
      ocupado={carregando}
      rodape={
        senhaAlterada ? null : (
          <p>
            <Link to="/login">
              Voltar para o login
            </Link>
          </p>
        )
      }
    >
      {!token && (
        <Alerta
          tipo="erro"
          titulo="Link inválido"
        >
          O link de recuperação está
          incompleto. Peça um novo em
          “Esqueci minha senha”.
        </Alerta>
      )}

      {erro && (
        <Alerta
          tipo="erro"
          titulo="Não foi possível alterar"
        >
          {erro}
        </Alerta>
      )}

      {token && !senhaAlterada && (
        <form
          className="acesso__form"
          onSubmit={handleSubmit}
          noValidate
        >
          <CampoSenha
            id="novaSenha"
            rotulo="Nova senha"
            value={novaSenha}
            onChange={(event) => {
              setNovaSenha(event.target.value)

              if (erroNovaSenha) {
                setErroNovaSenha('')
              }

              if (erroConfirmacao) {
                setErroConfirmacao('')
              }
            }}
            autoComplete="new-password"
            maxLength={100}
            dica="Use pelo menos 8 caracteres."
            erro={erroNovaSenha}
            disabled={carregando}
          />

          <CampoSenha
            id="confirmacaoNovaSenha"
            rotulo="Confirmação da nova senha"
            value={confirmacaoSenha}
            onChange={(event) => {
              setConfirmacaoSenha(event.target.value)

              if (erroConfirmacao) {
                setErroConfirmacao('')
              }
            }}
            autoComplete="new-password"
            maxLength={100}
            erro={erroConfirmacao}
            disabled={carregando}
          />

          <button
            type="submit"
            className="botao botao--primario"
            disabled={carregando}
          >
            {carregando
              ? 'Salvando…'
              : 'Salvar nova senha'}
          </button>
        </form>
      )}

      {senhaAlterada && (
        <>
          <Alerta
            tipo="sucesso"
            titulo="Tudo certo"
          >
            {mensagem}
          </Alerta>

          <Link
            to="/login"
            className="botao botao--primario"
          >
            Entrar com a nova senha
          </Link>
        </>
      )}
    </LayoutAcesso>
  )
}

export default RedefinirSenhaPage

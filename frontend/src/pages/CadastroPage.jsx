import { useState } from 'react'
import { Link } from 'react-router-dom'

import { cadastrarUsuario, reenviarVerificacaoEmail } from '../services/usuarioService'

import '../App.css'

import Alerta from '../components/Alerta'
import Icone from '../components/Icone'
import LayoutAcesso from '../components/auth/LayoutAcesso'
import CampoSenha from '../components/form/CampoSenha'
import CampoTexto from '../components/form/CampoTexto'
import { emailValido } from '../utils/texto'

/** Criar conta; depois do cadastro a pessoa precisa confirmar o e-mail. */
function CadastroPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('')
  const [erroNome, setErroNome] = useState('')
  const [erroEmail, setErroEmail] = useState('')
  const [erroSenha, setErroSenha] = useState('')
  const [erroConfirmacaoSenha, setErroConfirmacaoSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [emailCadastro, setEmailCadastro] = useState('')
  const [cadastroConcluido, setCadastroConcluido] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [reenviando, setReenviando] = useState(false)
  const [mensagemReenvio, setMensagemReenvio] = useState('')

  function validarFormulario() {
    let formularioValido = true

    setErroNome('')
    setErroEmail('')
    setErroSenha('')
    setErroConfirmacaoSenha('')
    setErro('')
    setSucesso('')
    setMensagemReenvio('')

    const nomeNormalizado = nome.trim()

    const emailNormalizado = email.trim()

    if (!nomeNormalizado) {
      setErroNome('Informe seu nome.')

      formularioValido = false
    }

    if (!emailNormalizado) {
      setErroEmail('Informe seu e-mail.')

      formularioValido = false
    } else if (!emailValido(emailNormalizado)) {
      setErroEmail('Informe um e-mail válido.')

      formularioValido = false
    }

    if (!senha) {
      setErroSenha('Informe uma senha.')

      formularioValido = false
    } else if (senha.length < 8 || senha.length > 72) {
      setErroSenha('A senha deve ter entre 8 e 72 caracteres.')

      formularioValido = false
    }

    if (!confirmacaoSenha) {
      setErroConfirmacaoSenha('Confirme sua senha.')

      formularioValido = false
    } else if (senha !== confirmacaoSenha) {
      setErroConfirmacaoSenha('As senhas não coincidem.')

      formularioValido = false
    }

    return formularioValido
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!validarFormulario()) {
      return
    }

    const emailNormalizado = email.trim()

    try {
      setCarregando(true)

      await cadastrarUsuario({
        nome: nome.trim(),
        email: emailNormalizado,
        senha,
      })

      setEmailCadastro(emailNormalizado)

      setCadastroConcluido(true)

      setSucesso(
        'Cadastro realizado com sucesso. Enviamos um link de confirmação para o seu e-mail.',
      )

      setNome('')
      setEmail('')
      setSenha('')
      setConfirmacaoSenha('')
    } catch (error) {
      setErro(error.message || 'Não foi possível realizar o cadastro.')
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

      const resposta = await reenviarVerificacaoEmail(emailCadastro)

      setMensagemReenvio(
        resposta?.mensagem ||
          'Se a conta ainda precisar de confirmação, um novo e-mail será enviado.',
      )
    } catch (error) {
      setErro(error.message || 'Não foi possível solicitar um novo e-mail de confirmação.')
    } finally {
      setReenviando(false)
    }
  }

  return (
    <LayoutAcesso
      idTitulo="titulo-cadastro"
      titulo={cadastroConcluido ? 'Confirme seu e-mail' : 'Criar conta'}
      descricao={
        cadastroConcluido
          ? 'Falta só um passo para ativar sua conta.'
          : 'Cadastre-se para receber lembretes da coleta seletiva do seu bairro.'
      }
      ocupado={carregando || reenviando}
      rodape={
        cadastroConcluido ? (
          <p>
            Já confirmou? <Link to="/login">Entrar</Link>
          </p>
        ) : (
          <p>
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        )
      }
    >
      {erro && (
        <Alerta
          tipo="erro"
          titulo={
            cadastroConcluido ? 'Não foi possível reenviar' : 'Não foi possível criar a conta'
          }
        >
          {erro}
        </Alerta>
      )}

      {!cadastroConcluido && (
        <form className="acesso__form" onSubmit={handleSubmit} noValidate>
          <CampoTexto
            id="nome"
            rotulo="Nome"
            type="text"
            value={nome}
            onChange={(event) => {
              setNome(event.target.value)

              if (erroNome) {
                setErroNome('')
              }
            }}
            autoComplete="name"
            maxLength={120}
            erro={erroNome}
            disabled={carregando}
          />

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
            }}
            autoComplete="email"
            inputMode="email"
            placeholder="voce@exemplo.com"
            maxLength={150}
            dica="Os lembretes da coleta chegam neste endereço."
            erro={erroEmail}
            disabled={carregando}
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

              if (erroConfirmacaoSenha) {
                setErroConfirmacaoSenha('')
              }
            }}
            autoComplete="new-password"
            maxLength={72}
            dica="Use pelo menos 8 caracteres."
            erro={erroSenha}
            disabled={carregando}
          />

          <CampoSenha
            id="confirmacaoSenha"
            rotulo="Confirmação da senha"
            value={confirmacaoSenha}
            onChange={(event) => {
              setConfirmacaoSenha(event.target.value)

              if (erroConfirmacaoSenha) {
                setErroConfirmacaoSenha('')
              }
            }}
            autoComplete="new-password"
            maxLength={72}
            erro={erroConfirmacaoSenha}
            disabled={carregando}
          />

          <button type="submit" className="botao botao--primario" disabled={carregando}>
            {carregando ? 'Criando conta…' : 'Criar conta'}
          </button>
        </form>
      )}

      {cadastroConcluido && (
        <section className="acesso__bloco" aria-labelledby="titulo-confirmar-cadastro">
          <h2 id="titulo-confirmar-cadastro" className="visualmente-oculto">
            Confirmação pendente
          </h2>

          {sucesso && (
            <Alerta tipo="sucesso" titulo="Conta criada">
              Enviamos um link de confirmação para:
            </Alerta>
          )}

          <p className="acesso__destaque-email">
            <Icone nome="email" />
            {emailCadastro}
          </p>

          <p>Abra o e-mail e clique no link. Depois disso, você já pode entrar.</p>

          <p className="acesso__nota">Não encontrou? Confira a pasta de spam ou lixo eletrônico.</p>

          {mensagemReenvio && (
            <Alerta tipo="info" titulo="Pedido enviado">
              {mensagemReenvio}
            </Alerta>
          )}

          <button
            type="button"
            className="botao botao--secundario"
            onClick={handleReenviarVerificacao}
            disabled={reenviando}
          >
            {reenviando ? 'Reenviando…' : 'Reenviar e-mail de confirmação'}
          </button>
        </section>
      )}
    </LayoutAcesso>
  )
}

export default CadastroPage

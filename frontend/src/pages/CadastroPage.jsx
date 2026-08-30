import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cadastrarUsuario } from '../services/usuarioService'
import '../App.css'

function CadastroPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacaoSenha, setConfirmacaoSenha] =
    useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] =
    useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setErro('')
    setSucesso('')

    if (
      !nome.trim() ||
      !email.trim() ||
      !senha
    ) {
      setErro(
        'Preencha nome, e-mail e senha.',
      )
      return
    }

    if (senha !== confirmacaoSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    try {
      setCarregando(true)

      await cadastrarUsuario({
        nome: nome.trim(),
        email: email.trim(),
        senha,
      })

      setSucesso(
        'Cadastro realizado com sucesso.',
      )

      setNome('')
      setEmail('')
      setSenha('')
      setConfirmacaoSenha('')
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível realizar o cadastro.',
      )
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="app">
      <section className="consulta">
        <header className="consulta__cabecalho">
          <span className="consulta__marca">
            SIMUL
          </span>

          <h1>Crie sua conta</h1>

          <p>
            Cadastre-se para configurar suas
            preferências de notificação.
          </p>
        </header>

        <form
          className="consulta__formulario"
          onSubmit={handleSubmit}
        >
          <div className="campo">
            <label htmlFor="nome">
              Nome
            </label>

            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(event) =>
                setNome(event.target.value)
              }
              autoComplete="name"
              placeholder="Seu nome"
            />
          </div>

          <div className="campo">
            <label htmlFor="email">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
            />
          </div>

          <div className="campo">
            <label htmlFor="senha">
              Senha
            </label>

            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(event) =>
                setSenha(event.target.value)
              }
              autoComplete="new-password"
              placeholder="Digite sua senha"
            />
          </div>

          <div className="campo">
            <label htmlFor="confirmacaoSenha">
              Confirme sua senha
            </label>

            <input
              id="confirmacaoSenha"
              type="password"
              value={confirmacaoSenha}
              onChange={(event) =>
                setConfirmacaoSenha(
                  event.target.value,
                )
              }
              autoComplete="new-password"
              placeholder="Digite a senha novamente"
            />
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

        {erro && (
          <div
            className="mensagem mensagem--erro"
            role="alert"
          >
            {erro}
          </div>
        )}

        {sucesso && (
          <div
            className="mensagem mensagem--sucesso"
            role="status"
          >
            {sucesso}
          </div>
        )}

        <p className="navegacao-secundaria">
          <Link to="/">
            Voltar para consulta
          </Link>
        </p>
      </section>
    </main>
  )
}

export default CadastroPage
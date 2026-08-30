import { useState } from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { login } from '../services/authService'
import '../App.css'

function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] =
    useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setErro('')

    if (!email.trim() || !senha) {
      setErro('Informe o e-mail e a senha.')
      return
    }

    try {
      setCarregando(true)

      await login(email, senha)

      navigate(
        '/minha-conta',
        { replace: true },
      )
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível realizar o login.',
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

          <h1>Entrar</h1>

          <p>
            Acesse sua conta para gerenciar suas
            preferências de notificação.
          </p>
        </header>

        <form
          className="consulta__formulario"
          onSubmit={handleSubmit}
        >
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
              autoComplete="current-password"
              placeholder="Digite sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
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
          >
            {erro}
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
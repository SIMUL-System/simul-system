import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  obterUsuarioAtual,
} from '../services/usuarioService'

import '../App.css'

function PerfilPage() {
  const [
    usuario,
    setUsuario,
  ] = useState(null)

  const [
    erro,
    setErro,
  ] = useState('')

  const [
    carregando,
    setCarregando,
  ] = useState(true)

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const dados =
          await obterUsuarioAtual()

        setUsuario(dados)
      } catch (error) {
        setErro(
          error.message ||
            'Não foi possível carregar o usuário.',
        )
      } finally {
        setCarregando(false)
      }
    }

    carregarUsuario()
  }, [])

  return (
    <main className="app">
      <section className="consulta">
        <header className="consulta__cabecalho">
          <span className="consulta__marca">
            CONTA
          </span>

          <h1>Minha conta</h1>

          <p>
            Consulte seus dados e acesse
            rapidamente as configurações
            do SIMUL.
          </p>
        </header>

        {carregando && (
          <div
            className="mensagem"
            role="status"
          >
            Carregando usuário...
          </div>
        )}

        {erro && (
          <div
            className="mensagem mensagem--erro"
            role="alert"
          >
            {erro}
          </div>
        )}

        {usuario && (
          <>
            <section className="conta-resumo">
              <div className="conta-resumo__avatar">
                {usuario.nome
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  'U'}
              </div>

              <div>
                <h2>
                  {usuario.nome}
                </h2>

                <p>
                  {usuario.email}
                </p>

                <span className="conta-resumo__perfil">
                  {usuario.perfil}
                </span>
              </div>
            </section>

            <section className="conta-atalhos">
              <Link
                to="/"
                className="conta-atalho"
              >
                <span className="conta-atalho__icone">
                  ♻
                </span>

                <div>
                  <strong>
                    Consultar coleta
                  </strong>

                  <p>
                    Veja os dias e
                    horários da coleta
                    na sua região.
                  </p>
                </div>

                <span aria-hidden="true">
                  →
                </span>
              </Link>

              <Link
                to="/preferencias"
                className="conta-atalho"
              >
                <span className="conta-atalho__icone">
                  🔔
                </span>

                <div>
                  <strong>
                    Notificações
                  </strong>

                  <p>
                    Configure seus
                    lembretes de coleta.
                  </p>
                </div>

                <span aria-hidden="true">
                  →
                </span>
              </Link>

              {usuario.perfil ===
                'ADMIN' && (
                <Link
                  to="/admin"
                  className="conta-atalho"
                >
                  <span className="conta-atalho__icone">
                    ⚙
                  </span>

                  <div>
                    <strong>
                      Painel administrativo
                    </strong>

                    <p>
                      Gerencie rotas,
                      áreas e cronogramas.
                    </p>
                  </div>

                  <span aria-hidden="true">
                    →
                  </span>
                </Link>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  )
}

export default PerfilPage
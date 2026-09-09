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
    let componenteAtivo = true

    async function carregarUsuario() {
      try {
        const dados =
          await obterUsuarioAtual()

        if (componenteAtivo) {
          setUsuario(dados)
        }
      } catch (error) {
        if (componenteAtivo) {
          setErro(
            error.message ||
              'Não foi possível carregar o usuário.',
          )
        }
      } finally {
        if (componenteAtivo) {
          setCarregando(false)
        }
      }
    }

    carregarUsuario()

    return () => {
      componenteAtivo = false
    }
  }, [])

  return (
    <main className="app">
      <section
        className="consulta"
        aria-labelledby="titulo-minha-conta"
        aria-busy={carregando}
      >
        <header className="consulta__cabecalho">
          <span
            className="consulta__marca"
            aria-hidden="true"
          >
            CONTA
          </span>

          <h1 id="titulo-minha-conta">
            Minha conta
          </h1>

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
            aria-live="polite"
          >
            Carregando seus dados...
          </div>
        )}

        {!carregando &&
          erro && (
            <div
              className="mensagem mensagem--erro"
              role="alert"
              aria-live="assertive"
            >
              {erro}
            </div>
          )}

        {!carregando &&
          usuario && (
            <>
              <section
                className="conta-resumo"
                aria-labelledby="titulo-resumo-conta"
              >
                <div
                  className="conta-resumo__avatar"
                  aria-hidden="true"
                >
                  {usuario.nome
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    'U'}
                </div>

                <div>
                  <h2 id="titulo-resumo-conta">
                    {usuario.nome}
                  </h2>

                  <p>
                    {usuario.email}
                  </p>

                  <span className="conta-resumo__perfil">
                    {usuario.perfil ===
                    'ADMIN'
                      ? 'Administrador'
                      : 'Usuário'}
                  </span>
                </div>
              </section>

              <section
                className="conta-atalhos"
                aria-labelledby="titulo-atalhos-conta"
              >
                <h2
                  id="titulo-atalhos-conta"
                  className="visualmente-oculto"
                >
                  Atalhos da conta
                </h2>

                <Link
                  to="/"
                  className="conta-atalho"
                >
                  <span
                    className="conta-atalho__icone"
                    aria-hidden="true"
                  >
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

                  <span
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>

                <Link
                  to="/preferencias"
                  className="conta-atalho"
                >
                  <span
                    className="conta-atalho__icone"
                    aria-hidden="true"
                  >
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

                  <span
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>

                {usuario.perfil ===
                  'ADMIN' && (
                  <Link
                    to="/admin"
                    className="conta-atalho"
                  >
                    <span
                      className="conta-atalho__icone"
                      aria-hidden="true"
                    >
                      ⚙
                    </span>

                    <div>
                      <strong>
                        Painel administrativo
                      </strong>

                      <p>
                        Gerencie rotas,
                        áreas e
                        cronogramas.
                      </p>
                    </div>

                    <span
                      aria-hidden="true"
                    >
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
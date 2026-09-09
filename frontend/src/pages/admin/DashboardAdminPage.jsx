import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  listarAreasAtendidas,
} from '../../services/adminAreaService'

import {
  listarRotas,
} from '../../services/adminRotaService'

import {
  listarCronogramas,
} from '../../services/adminCronogramaService'

function DashboardAdminPage() {
  const [
    resumo,
    setResumo,
  ] = useState({
    rotas: 0,
    rotasAtivas: 0,

    areas: 0,
    areasComGeometria: 0,
    areasSemGeometria: 0,

    cronogramas: 0,
    cronogramasAtivos: 0,
  })

  const [
    carregando,
    setCarregando,
  ] = useState(true)

  const [
    erro,
    setErro,
  ] = useState('')

  useEffect(() => {
    let componenteAtivo = true

    Promise.all([
      listarRotas(),
      listarAreasAtendidas(),
      listarCronogramas(),
    ])
      .then(
        ([
          dadosRotas,
          dadosAreas,
          dadosCronogramas,
        ]) => {
          if (!componenteAtivo) {
            return
          }

          const rotas =
            Array.isArray(
              dadosRotas,
            )
              ? dadosRotas
              : []

          const areas =
            Array.isArray(
              dadosAreas,
            )
              ? dadosAreas
              : []

          const cronogramas =
            Array.isArray(
              dadosCronogramas,
            )
              ? dadosCronogramas
              : []

          const areasComGeometria =
            areas.filter(
              (area) =>
                area.possuiGeometria,
            ).length

          setResumo({
            rotas:
              rotas.length,

            rotasAtivas:
              rotas.filter(
                (rota) =>
                  rota.ativo,
              ).length,

            areas:
              areas.length,

            areasComGeometria,

            areasSemGeometria:
              areas.length -
              areasComGeometria,

            cronogramas:
              cronogramas.length,

            cronogramasAtivos:
              cronogramas.filter(
                (cronograma) =>
                  cronograma.ativo,
              ).length,
          })
        },
      )
      .catch((error) => {
        if (!componenteAtivo) {
          return
        }

        setErro(
          error.message ||
            'Não foi possível carregar o resumo administrativo.',
        )
      })
      .finally(() => {
        if (componenteAtivo) {
          setCarregando(false)
        }
      })

    return () => {
      componenteAtivo = false
    }
  }, [])

  const rotasInativas =
    resumo.rotas -
    resumo.rotasAtivas

  const cronogramasInativos =
    resumo.cronogramas -
    resumo.cronogramasAtivos

  const possuiPendencias =
    resumo.areasSemGeometria > 0 ||
    rotasInativas > 0 ||
    cronogramasInativos > 0

  if (carregando) {
    return (
      <section
        aria-labelledby="titulo-dashboard-admin"
        aria-busy="true"
      >
        <h2
          id="titulo-dashboard-admin"
          className="visualmente-oculto"
        >
          Visão geral administrativa
        </h2>

        <div
          className="mensagem"
          role="status"
          aria-live="polite"
        >
          Carregando resumo
          administrativo...
        </div>
      </section>
    )
  }

  return (
    <>
      <header
        className="admin-secao__cabecalho"
        aria-labelledby="titulo-visao-geral-admin"
      >
        <h2 id="titulo-visao-geral-admin">
          Visão geral
        </h2>

        <p>
          Acompanhe rapidamente o estado
          atual dos cadastros e
          configurações operacionais do
          SIMUL.
        </p>
      </header>

      {erro && (
        <div
          className="mensagem mensagem--erro"
          role="alert"
          aria-live="assertive"
        >
          {erro}
        </div>
      )}

      {!erro && (
        <>
          <section
            className="admin-dashboard"
            aria-label="Resumo administrativo"
          >
            <article
              className="admin-dashboard__card"
              aria-labelledby="titulo-card-rotas"
            >
              <h3 id="titulo-card-rotas">
                Rotas
              </h3>

              <p
                className="admin-dashboard__numero"
                aria-label={
                  `${resumo.rotas} rotas cadastradas`
                }
              >
                {resumo.rotas}
              </p>

              <div className="admin-dashboard__detalhes">
                <p>
                  <strong>
                    Ativas:
                  </strong>{' '}
                  {
                    resumo.rotasAtivas
                  }
                </p>

                <p>
                  <strong>
                    Inativas:
                  </strong>{' '}
                  {rotasInativas}
                </p>
              </div>

              <Link
                to="/admin/rotas"
                className="admin-dashboard__acao"
              >
                Gerenciar rotas
              </Link>
            </article>

            <article
              className="admin-dashboard__card"
              aria-labelledby="titulo-card-areas"
            >
              <h3 id="titulo-card-areas">
                Áreas atendidas
              </h3>

              <p
                className="admin-dashboard__numero"
                aria-label={
                  `${resumo.areas} áreas cadastradas`
                }
              >
                {resumo.areas}
              </p>

              <div className="admin-dashboard__detalhes">
                <p>
                  <strong>
                    Com geometria:
                  </strong>{' '}
                  {
                    resumo
                      .areasComGeometria
                  }
                </p>

                <p>
                  <strong>
                    Sem geometria:
                  </strong>{' '}
                  {
                    resumo
                      .areasSemGeometria
                  }
                </p>
              </div>

              <Link
                to="/admin/areas"
                className="admin-dashboard__acao"
              >
                Gerenciar áreas
              </Link>
            </article>

            <article
              className="admin-dashboard__card"
              aria-labelledby="titulo-card-cronogramas"
            >
              <h3 id="titulo-card-cronogramas">
                Cronogramas
              </h3>

              <p
                className="admin-dashboard__numero"
                aria-label={
                  `${resumo.cronogramas} cronogramas cadastrados`
                }
              >
                {
                  resumo.cronogramas
                }
              </p>

              <div className="admin-dashboard__detalhes">
                <p>
                  <strong>
                    Ativos:
                  </strong>{' '}
                  {
                    resumo
                      .cronogramasAtivos
                  }
                </p>

                <p>
                  <strong>
                    Inativos:
                  </strong>{' '}
                  {
                    cronogramasInativos
                  }
                </p>
              </div>

              <Link
                to="/admin/cronogramas"
                className="admin-dashboard__acao"
              >
                Gerenciar cronogramas
              </Link>
            </article>
          </section>

          <section
            className="admin-dashboard__pendencias"
            aria-labelledby="titulo-pendencias-admin"
          >
            <h3 id="titulo-pendencias-admin">
              Pendências
            </h3>

            {!possuiPendencias && (
              <p>
                Não foram identificadas
                pendências nos cadastros
                administrativos.
              </p>
            )}

            {resumo
              .areasSemGeometria >
              0 && (
              <p>
                Existem{' '}
                <strong>
                  {
                    resumo
                      .areasSemGeometria
                  }
                </strong>{' '}
                áreas ainda sem geometria
                própria cadastrada.{' '}

                <Link to="/admin/areas">
                  Revisar áreas
                </Link>
              </p>
            )}

            {rotasInativas > 0 && (
              <p>
                Existem{' '}
                <strong>
                  {rotasInativas}
                </strong>{' '}
                rotas inativas.{' '}

                <Link to="/admin/rotas">
                  Revisar rotas
                </Link>
              </p>
            )}

            {cronogramasInativos >
              0 && (
              <p>
                Existem{' '}
                <strong>
                  {
                    cronogramasInativos
                  }
                </strong>{' '}
                cronogramas inativos.{' '}

                <Link to="/admin/cronogramas">
                  Revisar cronogramas
                </Link>
              </p>
            )}
          </section>
        </>
      )}
    </>
  )
}

export default DashboardAdminPage
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

  if (carregando) {
    return (
      <div
        className="mensagem"
        role="status"
      >
        Carregando resumo administrativo...
      </div>
    )
  }

  return (
    <>
      <header className="admin-secao__cabecalho">
        <h2>
          Visão geral
        </h2>

        <p>
          Acompanhe rapidamente o estado
          atual da operação cadastrada no
          SIMUL.
        </p>
      </header>

      {erro && (
        <div
          className="mensagem mensagem--erro"
          role="alert"
        >
          {erro}
        </div>
      )}

      {!erro && (
        <>
          <section className="admin-dashboard">
            <article className="admin-dashboard__card">
              <h3>
                Rotas
              </h3>

              <p className="admin-dashboard__numero">
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
                  {resumo.rotas -
                    resumo.rotasAtivas}
                </p>
              </div>

              <Link
                to="/admin/rotas"
                className="admin-dashboard__acao"
              >
                Gerenciar rotas
              </Link>
            </article>

            <article className="admin-dashboard__card">
              <h3>
                Áreas atendidas
              </h3>

              <p className="admin-dashboard__numero">
                {resumo.areas}
              </p>

              <div className="admin-dashboard__detalhes">
                <p>
                  <strong>
                    Com geometria:
                  </strong>{' '}
                  {
                    resumo.areasComGeometria
                  }
                </p>

                <p>
                  <strong>
                    Sem geometria:
                  </strong>{' '}
                  {
                    resumo.areasSemGeometria
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

            <article className="admin-dashboard__card">
              <h3>
                Cronogramas
              </h3>

              <p className="admin-dashboard__numero">
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
                    resumo.cronogramasAtivos
                  }
                </p>

                <p>
                  <strong>
                    Inativos:
                  </strong>{' '}
                  {resumo.cronogramas -
                    resumo
                      .cronogramasAtivos}
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

          <section className="admin-dashboard__pendencias">
            <h3>
              Pendências
            </h3>

            {resumo
              .areasSemGeometria >
            0 ? (
              <p>
                Existem{' '}
                <strong>
                  {
                    resumo
                      .areasSemGeometria
                  }
                </strong>{' '}
                áreas ainda sem geometria
                própria cadastrada.
              </p>
            ) : (
              <p>
                Todas as áreas cadastradas
                possuem geometria.
              </p>
            )}

            {resumo.rotasAtivas <
              resumo.rotas && (
              <p>
                Existem{' '}
                <strong>
                  {resumo.rotas -
                    resumo.rotasAtivas}
                </strong>{' '}
                rotas inativas.
              </p>
            )}

            {resumo
              .cronogramasAtivos <
              resumo.cronogramas && (
              <p>
                Existem{' '}
                <strong>
                  {resumo.cronogramas -
                    resumo
                      .cronogramasAtivos}
                </strong>{' '}
                cronogramas inativos.
              </p>
            )}
          </section>
        </>
      )}
    </>
  )
}

export default DashboardAdminPage
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import '../App.css'

import MapaColeta from '../components/MapaColeta'

import {
  buscarCoordenadasArea,
} from '../services/geocodingService'

import {
  consultarColeta,
  listarAreasDisponiveis,
} from '../services/rotaService'

function ConsultaPage() {
  const [areas, setAreas] = useState([])

  const [cidade, setCidade] = useState('')
  const [bairro, setBairro] = useState('')

  const [resultado, setResultado] =
    useState(null)

  const [erro, setErro] = useState('')

  const [
    avisoMapa,
    setAvisoMapa,
  ] = useState('')

  const [
    carregando,
    setCarregando,
  ] = useState(false)

  const [
    carregandoAreas,
    setCarregandoAreas,
  ] = useState(true)

  const [
    latitudeMapa,
    setLatitudeMapa,
  ] = useState(null)

  const [
    longitudeMapa,
    setLongitudeMapa,
  ] = useState(null)

  const [
    nomeAreaMapa,
    setNomeAreaMapa,
  ] = useState('')

  const [
    geometriaArea,
    setGeometriaArea,
  ] = useState(null)

  const [
    limitesArea,
    setLimitesArea,
  ] = useState(null)

  const [
    carregandoLocalizacaoMapa,
    setCarregandoLocalizacaoMapa,
  ] = useState(false)

  const [
    latitudeUsuario,
    setLatitudeUsuario,
  ] = useState(null)

  const [
    longitudeUsuario,
    setLongitudeUsuario,
  ] = useState(null)

  const [
    precisaoUsuario,
    setPrecisaoUsuario,
  ] = useState(null)

  const [
    statusLocalizacaoUsuario,
    setStatusLocalizacaoUsuario,
  ] = useState(() =>
    navigator.geolocation
      ? 'buscando'
      : 'indisponivel',
  )

  const [
    erroLocalizacaoUsuario,
    setErroLocalizacaoUsuario,
  ] = useState(() =>
    navigator.geolocation
      ? ''
      : 'Seu navegador não oferece suporte à localização. Você ainda pode selecionar a cidade e o bairro manualmente.',
  )

  const ultimaSelecaoRef =
    useRef(0)

  const melhorPrecisaoRef =
    useRef(null)

  useEffect(() => {
    let componenteAtivo = true

    listarAreasDisponiveis()
      .then((dados) => {
        if (!componenteAtivo) {
          return
        }

        setAreas(
          Array.isArray(dados)
            ? dados
            : [],
        )
      })
      .catch((error) => {
        if (!componenteAtivo) {
          return
        }

        setErro(
          error.message ||
            'Não foi possível carregar as áreas atendidas.',
        )
      })
      .finally(() => {
        if (componenteAtivo) {
          setCarregandoAreas(false)
        }
      })

    return () => {
      componenteAtivo = false
    }
  }, [])

  useEffect(() => {
    let componenteAtivo = true

    if (!navigator.geolocation) {
      return () => {
        componenteAtivo = false
      }
    }

    function atualizarLocalizacao(
      position,
    ) {
      if (!componenteAtivo) {
        return
      }

      const {
        latitude,
        longitude,
        accuracy,
      } = position.coords

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        !Number.isFinite(accuracy)
      ) {
        return
      }

      const melhorPrecisao =
        melhorPrecisaoRef.current

      const primeiraLeitura =
        melhorPrecisao == null

      const leituraMelhor =
        primeiraLeitura ||
        accuracy < melhorPrecisao

      if (!leituraMelhor) {
        return
      }

      melhorPrecisaoRef.current =
        accuracy

      setLatitudeUsuario(
        latitude,
      )

      setLongitudeUsuario(
        longitude,
      )

      setPrecisaoUsuario(
        accuracy,
      )

      setErroLocalizacaoUsuario('')

      if (accuracy <= 100) {
        setStatusLocalizacaoUsuario(
          'precisa',
        )
      } else if (accuracy <= 500) {
        setStatusLocalizacaoUsuario(
          'aproximada',
        )
      } else {
        setStatusLocalizacaoUsuario(
          'imprecisa',
        )
      }
    }

    function tratarErroLocalizacao(
      error,
    ) {
      if (!componenteAtivo) {
        return
      }

      if (error.code === 1) {
        setStatusLocalizacaoUsuario(
          'negada',
        )

        setErroLocalizacaoUsuario(
          'A localização não foi autorizada. Você ainda pode selecionar a cidade e o bairro manualmente.',
        )

        return
      }

      if (error.code === 2) {
        setStatusLocalizacaoUsuario(
          'indisponivel',
        )

        setErroLocalizacaoUsuario(
          'Sua localização não está disponível no momento. Você ainda pode selecionar a cidade e o bairro manualmente.',
        )

        return
      }

      if (error.code === 3) {
        setStatusLocalizacaoUsuario(
          'timeout',
        )

        setErroLocalizacaoUsuario(
          'Não foi possível obter uma localização precisa a tempo. Você ainda pode selecionar a cidade e o bairro manualmente.',
        )

        return
      }

      setStatusLocalizacaoUsuario(
        'indisponivel',
      )

      setErroLocalizacaoUsuario(
        'Não foi possível obter sua localização. Você ainda pode selecionar a cidade e o bairro manualmente.',
      )
    }

    const watchId =
      navigator.geolocation.watchPosition(
        atualizarLocalizacao,
        tratarErroLocalizacao,
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0,
        },
      )

    return () => {
      componenteAtivo = false

      navigator.geolocation.clearWatch(
        watchId,
      )
    }
  }, [])

  const cidades = [
    ...new Set(
      areas.map(
        (area) => area.cidade,
      ),
    ),
  ]

  const bairros = cidade
    ? areas
        .filter(
          (area) =>
            area.cidade === cidade,
        )
        .map(
          (area) => area.bairro,
        )
    : []

  function limparAreaMapa() {
    setLatitudeMapa(null)
    setLongitudeMapa(null)
    setNomeAreaMapa('')
    setGeometriaArea(null)
    setLimitesArea(null)
  }

  function converterGeoJson(
    geometriaGeoJson,
  ) {
    if (!geometriaGeoJson) {
      return null
    }

    try {
      const geometria =
        JSON.parse(
          geometriaGeoJson,
        )

      if (
        !geometria ||
        typeof geometria !== 'object'
      ) {
        return null
      }

      if (
        geometria.type !== 'Polygon' &&
        geometria.type !== 'MultiPolygon'
      ) {
        return null
      }

      if (
        !Array.isArray(
          geometria.coordinates,
        ) ||
        geometria.coordinates.length === 0
      ) {
        return null
      }

      return geometria
    } catch {
      return null
    }
  }

  async function carregarLocalizacaoFallback(
    cidadeSelecionada,
    bairroSelecionado,
    idSelecao,
  ) {
    try {
      const localizacao =
        await buscarCoordenadasArea(
          cidadeSelecionada,
          bairroSelecionado,
        )

      if (
        idSelecao !==
        ultimaSelecaoRef.current
      ) {
        return
      }

      if (!localizacao) {
        limparAreaMapa()

        setAvisoMapa(
          'Os horários foram consultados, mas não foi possível localizar esta região no mapa.',
        )

        return
      }

      setLatitudeMapa(
        localizacao.latitude,
      )

      setLongitudeMapa(
        localizacao.longitude,
      )

      setNomeAreaMapa(
        `${bairroSelecionado}, ${cidadeSelecionada}`,
      )

      setGeometriaArea(
        localizacao.geometria,
      )

      setLimitesArea(
        localizacao.boundingBox,
      )
    } catch {
      if (
        idSelecao !==
        ultimaSelecaoRef.current
      ) {
        return
      }

      limparAreaMapa()

      setAvisoMapa(
        'Os horários foram consultados, mas não foi possível localizar esta região no mapa.',
      )
    }
  }

  async function executarConsultaArea(
    cidadeSelecionada,
    bairroSelecionado,
  ) {
    if (
      !cidadeSelecionada ||
      !bairroSelecionado
    ) {
      return
    }

    setResultado(null)
    setErro('')
    setAvisoMapa('')

    const idSelecao =
      ultimaSelecaoRef.current + 1

    ultimaSelecaoRef.current =
      idSelecao

    setCarregando(true)

    setCarregandoLocalizacaoMapa(
      true,
    )

    try {
      const dadosColeta =
        await consultarColeta(
          cidadeSelecionada,
          bairroSelecionado,
        )

      if (
        idSelecao !==
        ultimaSelecaoRef.current
      ) {
        return
      }

      setResultado(
        dadosColeta,
      )

      const geometriaSimul =
        converterGeoJson(
          dadosColeta
            ?.geometriaGeoJson,
        )

      if (geometriaSimul) {
        setNomeAreaMapa(
          `${bairroSelecionado}, ${cidadeSelecionada}`,
        )

        setGeometriaArea(
          geometriaSimul,
        )

        setLimitesArea(null)

        setLatitudeMapa(null)
        setLongitudeMapa(null)

        setAvisoMapa('')

        return
      }

      if (
        dadosColeta
          ?.geometriaGeoJson
      ) {
        setAvisoMapa(
          'A geometria cadastrada no SIMUL está inválida. O mapa usará a localização do OpenStreetMap como alternativa.',
        )
      }

      await carregarLocalizacaoFallback(
        cidadeSelecionada,
        bairroSelecionado,
        idSelecao,
      )
    } catch (error) {
      if (
        idSelecao !==
        ultimaSelecaoRef.current
      ) {
        return
      }

      setErro(
        error?.message ||
          'Não foi possível consultar a coleta.',
      )

      limparAreaMapa()
    } finally {
      if (
        idSelecao ===
        ultimaSelecaoRef.current
      ) {
        setCarregando(false)

        setCarregandoLocalizacaoMapa(
          false,
        )
      }
    }
  }

  function handleCidadeChange(
    event,
  ) {
    const novaCidade =
      event.target.value

    ultimaSelecaoRef.current += 1

    setCidade(novaCidade)
    setBairro('')

    setResultado(null)

    setErro('')
    setAvisoMapa('')

    limparAreaMapa()

    setCarregando(false)

    setCarregandoLocalizacaoMapa(
      false,
    )
  }

  async function handleBairroChange(
    event,
  ) {
    const novoBairro =
      event.target.value

    setBairro(
      novoBairro,
    )

    setErro('')
    setAvisoMapa('')

    if (
      !cidade ||
      !novoBairro
    ) {
      setResultado(null)

      limparAreaMapa()

      return
    }

    await executarConsultaArea(
      cidade,
      novoBairro,
    )
  }

  return (
    <main className="app app--publica">
      <section className="consulta consulta--publica">
        <header className="consulta-publica__hero">
          <div className="consulta-publica__marca">
            <span className="consulta-publica__simbolo">
              ♻
            </span>

            <div>
              <strong>SIMUL</strong>

              <span>
                Sistema Integrado de
                Monitoramento Urbano de
                Limpeza
              </span>
            </div>
          </div>

          <div className="consulta-publica__hero-conteudo">
            <span className="consulta-publica__destaque">
              COLETA SELETIVA
            </span>

            <h1>
              Saiba quando a coleta passa
              na sua região
            </h1>

            <p>
              Selecione sua cidade e seu
              bairro para consultar os
              dias, horários e a área
              atendida pela coleta
              seletiva.
            </p>
          </div>
        </header>

        <section className="consulta-publica__painel">
          <div className="consulta-publica__painel-cabecalho">
            <div>
              <span className="consulta-publica__etapa">
                CONSULTA
              </span>

              <h2>
                Encontre sua região
              </h2>
            </div>

            <p>
              O cronograma é carregado
              automaticamente após a
              seleção do bairro.
            </p>
          </div>

          <div className="consulta__formulario consulta-publica__filtros">
            <div className="campo">
              <label htmlFor="cidade">
                Cidade
              </label>

              <select
                id="cidade"
                value={cidade}
                onChange={
                  handleCidadeChange
                }
                disabled={
                  carregandoAreas ||
                  cidades.length === 0
                }
              >
                <option value="">
                  {carregandoAreas
                    ? 'Carregando cidades...'
                    : 'Selecione uma cidade'}
                </option>

                {cidades.map(
                  (nomeCidade) => (
                    <option
                      key={nomeCidade}
                      value={nomeCidade}
                    >
                      {nomeCidade}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="campo">
              <label htmlFor="bairro">
                Bairro
              </label>

              <select
                id="bairro"
                value={bairro}
                onChange={
                  handleBairroChange
                }
                disabled={
                  !cidade ||
                  bairros.length === 0
                }
              >
                <option value="">
                  {!cidade
                    ? 'Selecione primeiro a cidade'
                    : 'Selecione um bairro'}
                </option>

                {bairros.map(
                  (nomeBairro) => (
                    <option
                      key={nomeBairro}
                      value={nomeBairro}
                    >
                      {nomeBairro}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        </section>

        <MapaColeta
          latitude={latitudeMapa}
          longitude={longitudeMapa}
          nomeArea={nomeAreaMapa}
          carregandoLocalizacao={
            carregandoLocalizacaoMapa
          }
          geometriaArea={
            geometriaArea
          }
          limitesArea={
            limitesArea
          }
          latitudeUsuario={
            latitudeUsuario
          }
          longitudeUsuario={
            longitudeUsuario
          }
          precisaoUsuario={
            precisaoUsuario
          }
          statusLocalizacaoUsuario={
            statusLocalizacaoUsuario
          }
        />

        {erroLocalizacaoUsuario && (
          <div
            className="mensagem consulta-publica__mensagem"
            role="status"
          >
            {
              erroLocalizacaoUsuario
            }
          </div>
        )}

        {carregando && (
          <div
            className="mensagem consulta-publica__mensagem"
            role="status"
          >
            Carregando horários da coleta...
          </div>
        )}

        {erro && (
          <div
            className="mensagem mensagem--erro consulta-publica__mensagem"
            role="alert"
          >
            {erro}
          </div>
        )}

        {avisoMapa && (
          <div
            className="mensagem consulta-publica__mensagem"
            role="status"
          >
            {avisoMapa}
          </div>
        )}

        {resultado && (
          <section className="consulta-publica__resultado">
            <div className="consulta-publica__resultado-cabecalho">
              <div>
                <span className="consulta-publica__etapa">
                  CRONOGRAMA
                </span>

                <h2>
                  Coleta em{' '}
                  {
                    resultado.bairro
                  }
                </h2>
              </div>

              <span className="consulta-publica__status">
                Coleta cadastrada
              </span>
            </div>

            <div className="consulta-publica__local">
              <div>
                <span>
                  Cidade
                </span>

                <strong>
                  {
                    resultado.cidade
                  }
                </strong>
              </div>

              <div>
                <span>
                  Bairro
                </span>

                <strong>
                  {
                    resultado.bairro
                  }
                </strong>
              </div>
            </div>

            <h3>
              Dias e horários
            </h3>

            {resultado.cronogramas
              ?.length > 0 ? (
              <div className="cronogramas">
                {resultado.cronogramas.map(
                  (
                    cronograma,
                    index,
                  ) => (
                    <article
                      className="cronograma consulta-publica__cronograma"
                      key={`${cronograma.diaSemana}-${index}`}
                    >
                      <div>
                        <span className="consulta-publica__icone-dia">
                          ♻
                        </span>

                        <strong>
                          {
                            cronograma.diaSemana
                          }
                        </strong>
                      </div>

                      <span className="consulta-publica__horario">
                        {
                          cronograma.horarioInicio
                        }

                        {' — '}

                        {
                          cronograma.horarioFim
                        }
                      </span>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <p>
                Nenhum cronograma ativo
                encontrado.
              </p>
            )}
          </section>
        )}
      </section>
    </main>
  )
}

export default ConsultaPage
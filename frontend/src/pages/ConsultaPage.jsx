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
    erroLocalizacaoUsuario,
    setErroLocalizacaoUsuario,
  ] = useState(() =>
    navigator.geolocation
      ? ''
      : 'Seu navegador não oferece suporte à localização. Você ainda pode selecionar a cidade e o bairro manualmente.',
  )

  const ultimaSelecaoRef = useRef(0)

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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!componenteAtivo) {
          return
        }

        setLatitudeUsuario(
          position.coords.latitude,
        )

        setLongitudeUsuario(
          position.coords.longitude,
        )

        setPrecisaoUsuario(
          position.coords.accuracy,
        )

        setErroLocalizacaoUsuario('')
      },
      (error) => {
        if (!componenteAtivo) {
          return
        }

        if (error.code === 1) {
          setErroLocalizacaoUsuario(
            'A localização não foi autorizada. Você ainda pode selecionar a cidade e o bairro manualmente.',
          )

          return
        }

        if (error.code === 2) {
          setErroLocalizacaoUsuario(
            'Sua localização não está disponível no momento. Você ainda pode selecionar a cidade e o bairro manualmente.',
          )

          return
        }

        if (error.code === 3) {
          setErroLocalizacaoUsuario(
            'A localização demorou muito para responder. Você ainda pode selecionar a cidade e o bairro manualmente.',
          )

          return
        }

        setErroLocalizacaoUsuario(
          'Não foi possível obter sua localização. Você ainda pode selecionar a cidade e o bairro manualmente.',
        )
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )

    return () => {
      componenteAtivo = false
    }
  }, [])

  const cidades = [
    ...new Set(
      areas.map((area) => area.cidade),
    ),
  ]

  const bairros = cidade
    ? areas
        .filter(
          (area) =>
            area.cidade === cidade,
        )
        .map((area) => area.bairro)
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

  function handleCidadeChange(event) {
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
    setCarregandoLocalizacaoMapa(false)
  }

  async function handleBairroChange(
    event,
  ) {
    const novoBairro =
      event.target.value

    setBairro(novoBairro)

    setResultado(null)

    setErro('')
    setAvisoMapa('')

    if (!cidade || !novoBairro) {
      limparAreaMapa()

      return
    }

    const idSelecao =
      ultimaSelecaoRef.current + 1

    ultimaSelecaoRef.current =
      idSelecao

    setCarregando(true)
    setCarregandoLocalizacaoMapa(true)

    try {
      const dadosColeta =
        await consultarColeta(
          cidade,
          novoBairro,
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
          `${novoBairro}, ${cidade}`,
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
        cidade,
        novoBairro,
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
        setCarregandoLocalizacaoMapa(false)
      }
    }
  }

  return (
    <main className="app">
      <section className="consulta">
        <header className="consulta__cabecalho">
          <span className="consulta__marca">
            SIMUL
          </span>

          <h1>
            Consulte a coleta seletiva da sua região
          </h1>

          <p>
            Selecione sua cidade e bairro para
            visualizar a região e consultar
            automaticamente os dias e horários
            programados.
          </p>
        </header>

        <div className="consulta__formulario">
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
        />

        {erroLocalizacaoUsuario && (
          <div
            className="mensagem"
            role="status"
          >
            {
              erroLocalizacaoUsuario
            }
          </div>
        )}

        {carregando && (
          <div
            className="mensagem"
            role="status"
          >
            Carregando horários da coleta...
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

        {avisoMapa && (
          <div
            className="mensagem"
            role="status"
          >
            {avisoMapa}
          </div>
        )}

        {resultado && (
          <section className="resultado">
            <h2>
              Coleta em {
                resultado.bairro
              }
            </h2>

            <div className="resultado__informacoes">
              <p>
                <strong>
                  Cidade:
                </strong>{' '}
                {
                  resultado.cidade
                }
              </p>

              <p>
                <strong>
                  Bairro:
                </strong>{' '}
                {
                  resultado.bairro
                }
              </p>
            </div>

            <h3>Cronograma</h3>

            {resultado.cronogramas
              ?.length > 0 ? (
              <div className="cronogramas">
                {resultado.cronogramas.map(
                  (
                    cronograma,
                    index,
                  ) => (
                    <article
                      className="cronograma"
                      key={`${cronograma.diaSemana}-${index}`}
                    >
                      <strong>
                        {
                          cronograma
                            .diaSemana
                        }
                      </strong>

                      <span>
                        {
                          cronograma
                            .horarioInicio
                        }
                        {' — '}
                        {
                          cronograma
                            .horarioFim
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
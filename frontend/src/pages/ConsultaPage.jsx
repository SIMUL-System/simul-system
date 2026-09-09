import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react'

import '../App.css'

import {
  buscarCoordenadasArea,
} from '../services/geocodingService'

import {
  consultarColeta,
  listarAreasDisponiveis,
} from '../services/rotaService'

const MapaColeta = lazy(
  () =>
    import(
      '../components/MapaColeta'
    ),
)

const ROTULOS_DIAS = {
  SEGUNDA:
    'Segunda-feira',

  TERCA:
    'Terça-feira',

  QUARTA:
    'Quarta-feira',

  QUINTA:
    'Quinta-feira',

  SEXTA:
    'Sexta-feira',

  SABADO:
    'Sábado',

  DOMINGO:
    'Domingo',
}

function ordenarTexto(
  a,
  b,
) {
  return a.localeCompare(
    b,
    'pt-BR',
    {
      sensitivity:
        'base',
    },
  )
}

function obterRotuloDia(
  diaSemana,
) {
  return (
    ROTULOS_DIAS[
      diaSemana
    ] ||
    diaSemana
  )
}

function ConsultaPage() {
  const [
    areas,
    setAreas,
  ] = useState([])

  const [
    cidade,
    setCidade,
  ] = useState('')

  const [
    bairro,
    setBairro,
  ] = useState('')

  const [
    resultado,
    setResultado,
  ] = useState(null)

  const [
    erro,
    setErro,
  ] = useState('')

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
  ] = useState(
    () =>
      navigator.geolocation
        ? 'buscando'
        : 'indisponivel',
  )

  const [
    erroLocalizacaoUsuario,
    setErroLocalizacaoUsuario,
  ] = useState(
    () =>
      navigator.geolocation
        ? ''
        : 'Seu navegador não oferece suporte à localização. Você ainda pode selecionar a cidade e o bairro manualmente.',
  )

  const ultimaSelecaoRef =
    useRef(0)

  const melhorPrecisaoRef =
    useRef(null)

  const tituloResultadoRef =
    useRef(null)

  useEffect(() => {
    let componenteAtivo =
      true

    listarAreasDisponiveis()
      .then((dados) => {
        if (
          !componenteAtivo
        ) {
          return
        }

        setAreas(
          Array.isArray(
            dados,
          )
            ? dados
            : [],
        )
      })
      .catch((error) => {
        if (
          !componenteAtivo
        ) {
          return
        }

        setErro(
          error.message ||
            'Não foi possível carregar as áreas atendidas.',
        )
      })
      .finally(() => {
        if (
          componenteAtivo
        ) {
          setCarregandoAreas(
            false,
          )
        }
      })

    return () => {
      componenteAtivo =
        false
    }
  }, [])

  useEffect(() => {
    let componenteAtivo =
      true

    if (
      !navigator.geolocation
    ) {
      return () => {
        componenteAtivo =
          false
      }
    }

    function atualizarLocalizacao(
      position,
    ) {
      if (
        !componenteAtivo
      ) {
        return
      }

      const {
        latitude,
        longitude,
        accuracy,
      } =
        position.coords

      if (
        !Number.isFinite(
          latitude,
        ) ||
        !Number.isFinite(
          longitude,
        ) ||
        !Number.isFinite(
          accuracy,
        )
      ) {
        return
      }

      const melhorPrecisao =
        melhorPrecisaoRef.current

      const primeiraLeitura =
        melhorPrecisao ==
        null

      const leituraMelhor =
        primeiraLeitura ||
        accuracy <
          melhorPrecisao

      if (
        !leituraMelhor
      ) {
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

      setErroLocalizacaoUsuario(
        '',
      )

      if (
        accuracy <= 100
      ) {
        setStatusLocalizacaoUsuario(
          'precisa',
        )
      } else if (
        accuracy <= 500
      ) {
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
      if (
        !componenteAtivo
      ) {
        return
      }

      if (
        error.code === 1
      ) {
        setStatusLocalizacaoUsuario(
          'negada',
        )

        setErroLocalizacaoUsuario(
          'A localização não foi autorizada. Você ainda pode selecionar a cidade e o bairro manualmente.',
        )

        return
      }

      if (
        error.code === 2
      ) {
        setStatusLocalizacaoUsuario(
          'indisponivel',
        )

        setErroLocalizacaoUsuario(
          'Sua localização não está disponível no momento. Você ainda pode selecionar a cidade e o bairro manualmente.',
        )

        return
      }

      if (
        error.code === 3
      ) {
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
      navigator.geolocation
        .watchPosition(
          atualizarLocalizacao,
          tratarErroLocalizacao,
          {
            enableHighAccuracy:
              true,

            timeout:
              30000,

            maximumAge:
              0,
          },
        )

    return () => {
      componenteAtivo =
        false

      navigator.geolocation
        .clearWatch(
          watchId,
        )
    }
  }, [])

  useEffect(() => {
    if (!resultado) {
      return
    }

    tituloResultadoRef
      .current
      ?.focus()
  }, [resultado])

  const cidades = [
    ...new Set(
      areas
        .map(
          (area) =>
            area.cidade
              ?.trim(),
        )
        .filter(Boolean),
    ),
  ].sort(
    ordenarTexto,
  )

  const bairros =
    cidade
      ? [
          ...new Set(
            areas
              .filter(
                (area) =>
                  area.cidade
                    ?.trim() ===
                  cidade,
              )
              .map(
                (area) =>
                  area.bairro
                    ?.trim(),
              )
              .filter(
                Boolean,
              ),
          ),
        ].sort(
          ordenarTexto,
        )
      : []

  function limparAreaMapa() {
    setLatitudeMapa(
      null,
    )

    setLongitudeMapa(
      null,
    )

    setNomeAreaMapa(
      '',
    )

    setGeometriaArea(
      null,
    )

    setLimitesArea(
      null,
    )
  }

  function converterGeoJson(
    geometriaGeoJson,
  ) {
    if (
      !geometriaGeoJson
    ) {
      return null
    }

    try {
      const geometria =
        JSON.parse(
          geometriaGeoJson,
        )

      if (
        !geometria ||
        typeof geometria !==
          'object'
      ) {
        return null
      }

      if (
        geometria.type !==
          'Polygon' &&
        geometria.type !==
          'MultiPolygon'
      ) {
        return null
      }

      if (
        !Array.isArray(
          geometria.coordinates,
        ) ||
        geometria.coordinates
          .length === 0
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

      if (
        !localizacao
      ) {
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
      ultimaSelecaoRef.current +
      1

    ultimaSelecaoRef.current =
      idSelecao

    setCarregando(
      true,
    )

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

      if (
        geometriaSimul
      ) {
        setNomeAreaMapa(
          `${bairroSelecionado}, ${cidadeSelecionada}`,
        )

        setGeometriaArea(
          geometriaSimul,
        )

        setLimitesArea(
          null,
        )

        setLatitudeMapa(
          null,
        )

        setLongitudeMapa(
          null,
        )

        setAvisoMapa(
          '',
        )

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
        setCarregando(
          false,
        )

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

    ultimaSelecaoRef.current +=
      1

    setCidade(
      novaCidade,
    )

    setBairro('')

    setResultado(
      null,
    )

    setErro('')

    setAvisoMapa('')

    limparAreaMapa()

    setCarregando(
      false,
    )

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
      setResultado(
        null,
      )

      limparAreaMapa()

      return
    }

    await executarConsultaArea(
      cidade,
      novoBairro,
    )
  }

  const paginaCarregando =
    carregandoAreas ||
    carregando

  return (
    <main
      className="app app--publica"
      aria-busy={
        paginaCarregando
      }
    >
      <section
        className="consulta consulta--publica"
        aria-labelledby="titulo-consulta-publica"
      >
        <header className="consulta-publica__hero">
          <div className="consulta-publica__marca">
            <span
              className="consulta-publica__simbolo"
              aria-hidden="true"
            >
              ♻
            </span>

            <div>
              <strong>
                SIMUL
              </strong>

              <span>
                Sistema Integrado de
                Monitoramento Urbano de
                Limpeza
              </span>
            </div>
          </div>

          <div className="consulta-publica__hero-conteudo">
            <span
              className="consulta-publica__destaque"
              aria-hidden="true"
            >
              COLETA SELETIVA
            </span>

            <h1 id="titulo-consulta-publica">
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

        <section
          className="consulta-publica__painel"
          aria-labelledby="titulo-consulta-regiao"
          aria-busy={
            carregandoAreas
          }
        >
          <div className="consulta-publica__painel-cabecalho">
            <div>
              <span
                className="consulta-publica__etapa"
                aria-hidden="true"
              >
                CONSULTA
              </span>

              <h2 id="titulo-consulta-regiao">
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
                  cidades.length ===
                    0
                }
                aria-describedby="ajuda-cidade"
                aria-busy={
                  carregandoAreas
                }
              >
                <option value="">
                  {carregandoAreas
                    ? 'Carregando cidades...'
                    : cidades.length ===
                        0
                      ? 'Nenhuma cidade disponível'
                      : 'Selecione uma cidade'}
                </option>

                {cidades.map(
                  (
                    nomeCidade,
                  ) => (
                    <option
                      key={
                        nomeCidade
                      }
                      value={
                        nomeCidade
                      }
                    >
                      {
                        nomeCidade
                      }
                    </option>
                  ),
                )}
              </select>

              <small id="ajuda-cidade">
                {carregandoAreas
                  ? 'Aguarde enquanto as cidades atendidas são carregadas.'
                  : cidades.length >
                      0
                    ? 'Selecione a cidade onde deseja consultar a coleta seletiva.'
                    : 'Nenhuma cidade atendida foi encontrada.'}
              </small>
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
                  bairros.length ===
                    0 ||
                  carregando
                }
                aria-describedby="ajuda-bairro"
                aria-busy={
                  carregando
                }
              >
                <option value="">
                  {!cidade
                    ? 'Selecione primeiro a cidade'
                    : bairros.length ===
                        0
                      ? 'Nenhum bairro disponível'
                      : carregando
                        ? 'Consultando bairro...'
                        : 'Selecione um bairro'}
                </option>

                {bairros.map(
                  (
                    nomeBairro,
                  ) => (
                    <option
                      key={
                        nomeBairro
                      }
                      value={
                        nomeBairro
                      }
                    >
                      {
                        nomeBairro
                      }
                    </option>
                  ),
                )}
              </select>

              <small id="ajuda-bairro">
                {!cidade
                  ? 'Selecione uma cidade para liberar a lista de bairros.'
                  : bairros.length ===
                      0
                    ? 'Nenhum bairro atendido foi encontrado para esta cidade.'
                    : 'Ao selecionar o bairro, o cronograma será consultado automaticamente.'}
              </small>
            </div>
          </div>
        </section>

        <section
          aria-label="Mapa da área de coleta"
        >
          <Suspense
            fallback={
              <div
                className="mapa-coleta__card"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                Carregando mapa...
              </div>
            }
          >
            <MapaColeta
              latitude={
                latitudeMapa
              }
              longitude={
                longitudeMapa
              }
              nomeArea={
                nomeAreaMapa
              }
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
          </Suspense>
        </section>

        {erroLocalizacaoUsuario && (
          <div
            className="mensagem consulta-publica__mensagem"
            role="status"
            aria-live="polite"
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
            aria-live="polite"
          >
            Carregando horários da
            coleta...
          </div>
        )}

        {erro && (
          <div
            className="mensagem mensagem--erro consulta-publica__mensagem"
            role="alert"
            aria-live="assertive"
          >
            {erro}
          </div>
        )}

        {avisoMapa && (
          <div
            className="mensagem consulta-publica__mensagem"
            role="status"
            aria-live="polite"
          >
            {avisoMapa}
          </div>
        )}

        {resultado && (
          <section
            className="consulta-publica__resultado"
            aria-labelledby="titulo-resultado-consulta"
          >
            <div className="consulta-publica__resultado-cabecalho">
              <div>
                <span
                  className="consulta-publica__etapa"
                  aria-hidden="true"
                >
                  CRONOGRAMA
                </span>

                <h2
                  id="titulo-resultado-consulta"
                  ref={
                    tituloResultadoRef
                  }
                  tabIndex="-1"
                >
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
              <div
                className="cronogramas"
                aria-label="Cronogramas disponíveis"
              >
                {resultado.cronogramas.map(
                  (
                    cronograma,
                    index,
                  ) => {
                    const dia =
                      obterRotuloDia(
                        cronograma.diaSemana,
                      )

                    return (
                      <article
                        className="cronograma consulta-publica__cronograma"
                        key={`${cronograma.diaSemana}-${cronograma.horarioInicio}-${cronograma.horarioFim}-${index}`}
                        aria-label={`${dia}, das ${cronograma.horarioInicio} às ${cronograma.horarioFim}`}
                      >
                        <div>
                          <span
                            className="consulta-publica__icone-dia"
                            aria-hidden="true"
                          >
                            ♻
                          </span>

                          <strong>
                            {dia}
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
                    )
                  },
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
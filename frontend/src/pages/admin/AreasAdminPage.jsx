import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  atualizarAreaAtendida,
  atualizarGeometriaArea,
  criarAreaAtendida,
  listarAreasAtendidas,
} from '../../services/adminAreaService'

import {
  listarRotas,
} from '../../services/adminRotaService'

import {
  buscarCoordenadasArea,
} from '../../services/geocodingService'

import {
  consultarColeta,
} from '../../services/rotaService'

const MapaEdicaoArea = lazy(
  () =>
    import(
      '../../components/MapaEdicaoArea'
    ),
)

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

function normalizarTexto(
  valor,
) {
  return valor
    .trim()
    .replace(
      /\s+/g,
      ' ',
    )
}

function AreasAdminPage() {
  const [
    rotas,
    setRotas,
  ] = useState([])

  const [
    areas,
    setAreas,
  ] = useState([])

  const [
    busca,
    setBusca,
  ] = useState('')

  const [
    cidade,
    setCidade,
  ] = useState('')

  const [
    bairro,
    setBairro,
  ] = useState('')

  const [
    rotaId,
    setRotaId,
  ] = useState('')

  const [
    areaEmEdicao,
    setAreaEmEdicao,
  ] = useState(null)

  const [
    areaGeometria,
    setAreaGeometria,
  ] = useState(null)

  const [
    geometriaInicial,
    setGeometriaInicial,
  ] = useState(null)

  const [
    geometriaAtual,
    setGeometriaAtual,
  ] = useState(null)

  const [
    latitudeMapa,
    setLatitudeMapa,
  ] = useState(null)

  const [
    longitudeMapa,
    setLongitudeMapa,
  ] = useState(null)

  const [
    erro,
    setErro,
  ] = useState('')

  const [
    sucesso,
    setSucesso,
  ] = useState('')

  const [
    carregando,
    setCarregando,
  ] = useState(true)

  const [
    salvando,
    setSalvando,
  ] = useState(false)

  const [
    carregandoMapa,
    setCarregandoMapa,
  ] = useState(false)

  const [
    salvandoGeometria,
    setSalvandoGeometria,
  ] = useState(false)

  useEffect(() => {
    let componenteAtivo =
      true

    Promise.all([
      listarRotas(),
      listarAreasAtendidas(),
    ])
      .then(
        ([
          dadosRotas,
          dadosAreas,
        ]) => {
          if (
            !componenteAtivo
          ) {
            return
          }

          setRotas(
            Array.isArray(
              dadosRotas,
            )
              ? dadosRotas
              : [],
          )

          setAreas(
            Array.isArray(
              dadosAreas,
            )
              ? dadosAreas
              : [],
          )
        },
      )
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
          setCarregando(
            false,
          )
        }
      })

    return () => {
      componenteAtivo =
        false
    }
  }, [])

  const cidadesDisponiveis =
    useMemo(
      () =>
        [
          ...new Set(
            areas
              .map(
                (area) =>
                  area.cidade
                    ?.trim(),
              )
              .filter(
                Boolean,
              ),
          ),
        ].sort(
          ordenarTexto,
        ),
      [areas],
    )

  const bairrosDisponiveis =
    useMemo(
      () => {
        const cidadeNormalizada =
          cidade.trim()

        const bairrosFiltrados =
          cidadeNormalizada
            ? areas
                .filter(
                  (area) =>
                    area.cidade
                      ?.trim() ===
                    cidadeNormalizada,
                )
                .map(
                  (area) =>
                    area.bairro
                      ?.trim(),
                )
            : areas.map(
                (area) =>
                  area.bairro
                    ?.trim(),
              )

        return [
          ...new Set(
            bairrosFiltrados.filter(
              Boolean,
            ),
          ),
        ].sort(
          ordenarTexto,
        )
      },
      [
        areas,
        cidade,
      ],
    )

  const areasFiltradas =
    useMemo(
      () => {
        const termo =
          busca
            .trim()
            .toLocaleLowerCase(
              'pt-BR',
            )

        if (!termo) {
          return areas
        }

        return areas.filter(
          (area) => {
            const cidadeArea =
              (
                area.cidade ??
                ''
              ).toLocaleLowerCase(
                'pt-BR',
              )

            const bairroArea =
              (
                area.bairro ??
                ''
              ).toLocaleLowerCase(
                'pt-BR',
              )

            return (
              cidadeArea.includes(
                termo,
              ) ||
              bairroArea.includes(
                termo,
              )
            )
          },
        )
      },
      [
        areas,
        busca,
      ],
    )

  const totalComGeometria =
    useMemo(
      () =>
        areas.filter(
          (area) =>
            area.possuiGeometria,
        ).length,
      [areas],
    )

  const totalSemGeometria =
    areas.length -
    totalComGeometria

  const operacaoEmAndamento =
    salvando ||
    carregandoMapa ||
    salvandoGeometria

  async function recarregarAreas() {
    const dados =
      await listarAreasAtendidas()

    setAreas(
      Array.isArray(
        dados,
      )
        ? dados
        : [],
    )
  }

  function limparMensagens() {
    setErro('')
    setSucesso('')
  }

  function limparFormulario() {
    setCidade('')
    setBairro('')
    setRotaId('')
    setAreaEmEdicao(null)
  }

  function fecharEditorGeometria() {
    setAreaGeometria(
      null,
    )

    setGeometriaInicial(
      null,
    )

    setGeometriaAtual(
      null,
    )

    setLatitudeMapa(
      null,
    )

    setLongitudeMapa(
      null,
    )
  }

  function iniciarEdicao(
    area,
  ) {
    limparMensagens()

    fecharEditorGeometria()

    setAreaEmEdicao(
      area,
    )

    setCidade(
      area.cidade ??
        '',
    )

    setBairro(
      area.bairro ??
        '',
    )

    setRotaId(
      String(
        area.rotaId ??
          '',
      ),
    )

    window.scrollTo({
      top: 0,
      behavior:
        'smooth',
    })
  }

  function cancelarEdicao() {
    limparFormulario()

    limparMensagens()
  }

  function validarGeometria(
    geometria,
  ) {
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

      return validarGeometria(
        geometria,
      )
    } catch {
      return null
    }
  }

  async function iniciarEdicaoGeometria(
    area,
  ) {
    limparMensagens()

    setCarregandoMapa(
      true,
    )

    setAreaGeometria(
      area,
    )

    setGeometriaInicial(
      null,
    )

    setGeometriaAtual(
      null,
    )

    try {
      const [
        localizacao,
        coleta,
      ] =
        await Promise.all([
          buscarCoordenadasArea(
            area.cidade,
            area.bairro,
          ),

          consultarColeta(
            area.cidade,
            area.bairro,
          ),
        ])

      if (
        localizacao
      ) {
        setLatitudeMapa(
          localizacao.latitude,
        )

        setLongitudeMapa(
          localizacao.longitude,
        )
      }

      const geometriaSimul =
        converterGeoJson(
          coleta
            ?.geometriaGeoJson,
        )

      if (
        geometriaSimul
      ) {
        setGeometriaInicial(
          geometriaSimul,
        )

        setGeometriaAtual(
          geometriaSimul,
        )

        return
      }

      const geometriaNominatim =
        validarGeometria(
          localizacao
            ?.geometria,
        )

      if (
        geometriaNominatim
      ) {
        setGeometriaInicial(
          geometriaNominatim,
        )

        setGeometriaAtual(
          geometriaNominatim,
        )

        return
      }

      setGeometriaInicial(
        null,
      )

      setGeometriaAtual(
        null,
      )
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível preparar o mapa da área.',
      )
    } finally {
      setCarregandoMapa(
        false,
      )
    }
  }

  function handleGeometriaAlterada(
    geometria,
  ) {
    setGeometriaAtual(
      geometria,
    )
  }

  async function salvarGeometria() {
    if (
      !areaGeometria
    ) {
      return
    }

    limparMensagens()

    if (
      !geometriaAtual
    ) {
      setErro(
        'Desenhe uma área no mapa antes de salvar.',
      )

      return
    }

    if (
      geometriaAtual.type !==
        'Polygon' &&
      geometriaAtual.type !==
        'MultiPolygon'
    ) {
      setErro(
        'A geometria deve ser um Polygon ou MultiPolygon.',
      )

      return
    }

    if (
      !Array.isArray(
        geometriaAtual.coordinates,
      ) ||
      geometriaAtual.coordinates
        .length === 0
    ) {
      setErro(
        'A geometria desenhada não possui coordenadas válidas.',
      )

      return
    }

    try {
      setSalvandoGeometria(
        true,
      )

      const geometriaGeoJson =
        JSON.stringify(
          geometriaAtual,
        )

      await atualizarGeometriaArea(
        areaGeometria.id,
        geometriaGeoJson,
      )

      await recarregarAreas()

      setSucesso(
        `Geometria de ${areaGeometria.bairro} salva com sucesso.`,
      )

      fecharEditorGeometria()
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível salvar a geometria da área.',
      )
    } finally {
      setSalvandoGeometria(
        false,
      )
    }
  }

  async function handleSubmit(
    event,
  ) {
    event.preventDefault()

    limparMensagens()

    const cidadeNormalizada =
      normalizarTexto(
        cidade,
      )

    const bairroNormalizado =
      normalizarTexto(
        bairro,
      )

    if (
      !cidadeNormalizada ||
      !bairroNormalizado ||
      !rotaId
    ) {
      setErro(
        'Informe a cidade, o bairro e a rota associada.',
      )

      return
    }

    const rotaSelecionadaId =
      Number(
        rotaId,
      )

    if (
      !Number.isInteger(
        rotaSelecionadaId,
      )
    ) {
      setErro(
        'Selecione uma rota válida.',
      )

      return
    }

    const areaDuplicada =
      areas.find(
        (area) =>
          area.id !==
            areaEmEdicao?.id &&
          area.cidade
            ?.trim()
            .toLocaleLowerCase(
              'pt-BR',
            ) ===
            cidadeNormalizada
              .toLocaleLowerCase(
                'pt-BR',
              ) &&
          area.bairro
            ?.trim()
            .toLocaleLowerCase(
              'pt-BR',
            ) ===
            bairroNormalizado
              .toLocaleLowerCase(
                'pt-BR',
              ),
      )

    if (
      areaDuplicada
    ) {
      setErro(
        `Já existe uma área cadastrada para ${bairroNormalizado}, ${cidadeNormalizada}.`,
      )

      return
    }

    const dados = {
      cidade:
        cidadeNormalizada,

      bairro:
        bairroNormalizado,

      rotaId:
        rotaSelecionadaId,
    }

    try {
      setSalvando(
        true,
      )

      if (
        areaEmEdicao
      ) {
        await atualizarAreaAtendida(
          areaEmEdicao.id,
          dados,
        )

        setSucesso(
          'Área atendida atualizada com sucesso.',
        )
      } else {
        await criarAreaAtendida(
          dados,
        )

        setSucesso(
          'Bairro atendido cadastrado com sucesso.',
        )
      }

      limparFormulario()

      await recarregarAreas()
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível salvar a área atendida.',
      )
    } finally {
      setSalvando(
        false,
      )
    }
  }

  return (
    <>
      <header
        className="admin-secao__cabecalho"
        aria-labelledby="titulo-areas-admin"
      >
        <h2 id="titulo-areas-admin">
          Áreas atendidas
        </h2>

        <p>
          Associe cidades e bairros às
          rotas responsáveis pelos
          cronogramas de coleta.
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

      {sucesso && (
        <div
          className="mensagem mensagem--sucesso"
          role="status"
          aria-live="polite"
        >
          {sucesso}
        </div>
      )}

      <section
        className="resultado"
        aria-labelledby="titulo-formulario-area"
        aria-busy={
          salvando
        }
      >
        <h3 id="titulo-formulario-area">
          {areaEmEdicao
            ? 'Editar área atendida'
            : 'Cadastrar bairro atendido'}
        </h3>

        <form
          className="consulta__formulario"
          onSubmit={
            handleSubmit
          }
          noValidate
        >
          <div className="campo">
            <label htmlFor="cidadeArea">
              Cidade
            </label>

            <input
              id="cidadeArea"
              type="text"
              list="cidadesArea"
              value={
                cidade
              }
              onChange={(
                event,
              ) => {
                setCidade(
                  event.target
                    .value,
                )

                limparMensagens()
              }}
              placeholder="Selecione ou digite uma cidade"
              autoComplete="address-level2"
              aria-describedby="ajuda-cidade-area"
              disabled={
                operacaoEmAndamento
              }
            />

            <datalist id="cidadesArea">
              {cidadesDisponiveis.map(
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
                  />
                ),
              )}
            </datalist>

            <small id="ajuda-cidade-area">
              Selecione uma cidade já
              cadastrada ou digite o
              nome de uma nova cidade.
            </small>
          </div>

          <div className="campo">
            <label htmlFor="bairroArea">
              Bairro
            </label>

            <input
              id="bairroArea"
              type="text"
              list="bairrosArea"
              value={
                bairro
              }
              onChange={(
                event,
              ) => {
                setBairro(
                  event.target
                    .value,
                )

                limparMensagens()
              }}
              placeholder="Selecione ou digite um bairro"
              autoComplete="address-level3"
              aria-describedby="ajuda-bairro-area"
              disabled={
                operacaoEmAndamento
              }
            />

            <datalist id="bairrosArea">
              {bairrosDisponiveis.map(
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
                  />
                ),
              )}
            </datalist>

            <small id="ajuda-bairro-area">
              {cidade.trim()
                ? 'Os bairros já cadastrados nessa cidade aparecem como sugestões. Você também pode informar um novo bairro.'
                : 'Informe primeiro a cidade para receber sugestões de bairros dessa região.'}
            </small>
          </div>

          <div className="campo">
            <label htmlFor="rotaArea">
              Rota associada
            </label>

            <select
              id="rotaArea"
              value={
                rotaId
              }
              onChange={(
                event,
              ) => {
                setRotaId(
                  event.target
                    .value,
                )

                limparMensagens()
              }}
              disabled={
                carregando ||
                operacaoEmAndamento
              }
              aria-describedby="ajuda-rota-area"
            >
              <option value="">
                Selecione uma rota
              </option>

              {rotas.map(
                (rota) => (
                  <option
                    key={
                      rota.id
                    }
                    value={
                      rota.id
                    }
                    disabled={
                      !rota.ativo &&
                      Number(
                        rotaId,
                      ) !==
                        rota.id
                    }
                  >
                    {rota.nome}

                    {!rota.ativo
                      ? ' — Inativa'
                      : ''}
                  </option>
                ),
              )}
            </select>

            <small id="ajuda-rota-area">
              Escolha a rota responsável
              pelo atendimento dessa
              região.
            </small>
          </div>

          <button
            type="submit"
            disabled={
              operacaoEmAndamento
            }
          >
            {salvando
              ? 'Salvando...'
              : areaEmEdicao
                ? 'Salvar alterações'
                : 'Cadastrar bairro atendido'}
          </button>

          {areaEmEdicao && (
            <button
              type="button"
              onClick={
                cancelarEdicao
              }
              disabled={
                operacaoEmAndamento
              }
            >
              Cancelar edição
            </button>
          )}
        </form>
      </section>

      {areaGeometria && (
        <section
          className="resultado"
          aria-labelledby="titulo-editor-geometria"
          aria-busy={
            carregandoMapa ||
            salvandoGeometria
          }
        >
          <h3 id="titulo-editor-geometria">
            Editor da área —{' '}
            {
              areaGeometria.bairro
            }
          </h3>

          <p>
            Ajuste o contorno da região
            atendida no mapa.
          </p>

          <p id="instrucoes-editor-geometria">
            Use as ferramentas do mapa
            para desenhar o polígono,
            mover seus vértices ou
            ajustar o contorno da área.
          </p>

          {carregandoMapa ? (
            <p
              role="status"
              aria-live="polite"
            >
              Preparando mapa...
            </p>
          ) : (
            <>
              <div
                aria-describedby="instrucoes-editor-geometria"
              >
                <Suspense
                  fallback={
                    <div
                      className="mensagem"
                      role="status"
                      aria-live="polite"
                      aria-busy="true"
                    >
                      Carregando editor
                      do mapa...
                    </div>
                  }
                >
                  <MapaEdicaoArea
                    latitude={
                      latitudeMapa
                    }
                    longitude={
                      longitudeMapa
                    }
                    geometriaInicial={
                      geometriaInicial
                    }
                    aoAlterarGeometria={
                      handleGeometriaAlterada
                    }
                  />
                </Suspense>
              </div>

              <div
                className="rota-admin__acoes"
                aria-label={
                  `Ações da geometria de ${areaGeometria.bairro}`
                }
              >
                <button
                  type="button"
                  onClick={
                    salvarGeometria
                  }
                  disabled={
                    !geometriaAtual ||
                    salvandoGeometria
                  }
                >
                  {salvandoGeometria
                    ? 'Salvando geometria...'
                    : 'Salvar geometria'}
                </button>

                <button
                  type="button"
                  onClick={
                    fecharEditorGeometria
                  }
                  disabled={
                    salvandoGeometria
                  }
                >
                  Fechar editor
                </button>
              </div>
            </>
          )}
        </section>
      )}

      <section
        className="resultado"
        aria-labelledby="titulo-lista-areas"
        aria-busy={
          carregando
        }
      >
        <h3 id="titulo-lista-areas">
          Áreas cadastradas
        </h3>

        <div className="consulta__formulario">
          <div className="campo">
            <label htmlFor="buscaArea">
              Buscar área
            </label>

            <input
              id="buscaArea"
              type="search"
              value={
                busca
              }
              onChange={(
                event,
              ) =>
                setBusca(
                  event.target
                    .value,
                )
              }
              placeholder="Digite o bairro ou a cidade"
              aria-describedby="ajuda-busca-area resultado-busca-area"
            />

            <small id="ajuda-busca-area">
              A pesquisa considera o
              nome da cidade e do
              bairro.
            </small>

            {!carregando && (
              <small
                id="resultado-busca-area"
                role="status"
                aria-live="polite"
              >
                {
                  areasFiltradas.length
                }{' '}
                {areasFiltradas.length ===
                1
                  ? 'área encontrada.'
                  : 'áreas encontradas.'}
              </small>
            )}
          </div>
        </div>

        {!carregando && (
          <div className="resultado__informacoes">
            <p>
              <strong>
                Total:
              </strong>{' '}
              {
                areas.length
              }
            </p>

            <p>
              <strong>
                Com geometria:
              </strong>{' '}
              {
                totalComGeometria
              }
            </p>

            <p>
              <strong>
                Sem geometria:
              </strong>{' '}
              {
                totalSemGeometria
              }
            </p>
          </div>
        )}

        {carregando ? (
          <p
            role="status"
            aria-live="polite"
          >
            Carregando áreas
            atendidas...
          </p>
        ) : areasFiltradas.length ===
          0 ? (
          <p>
            Nenhuma área encontrada.
          </p>
        ) : (
          <div className="lista-rotas">
            {areasFiltradas.map(
              (area) => (
                <article
                  className="rota-admin"
                  key={
                    area.id
                  }
                  aria-labelledby={
                    `area-${area.id}`
                  }
                >
                  <div className="rota-admin__conteudo">
                    <h3
                      id={
                        `area-${area.id}`
                      }
                    >
                      {
                        area.bairro
                      }
                    </h3>

                    <p>
                      <strong>
                        Cidade:
                      </strong>{' '}
                      {
                        area.cidade
                      }
                    </p>

                    <p>
                      <strong>
                        Rota associada:
                      </strong>{' '}
                      {
                        area.nomeRota
                      }
                    </p>

                    <p>
                      <strong>
                        Geometria:
                      </strong>{' '}

                      <span
                        className={
                          area.possuiGeometria
                            ? 'status-admin status-admin--ativo'
                            : 'status-admin status-admin--inativo'
                        }
                      >
                        {area.possuiGeometria
                          ? 'Cadastrada'
                          : 'Não cadastrada'}
                      </span>
                    </p>
                  </div>

                  <div
                    className="rota-admin__acoes"
                    aria-label={
                      `Ações da área ${area.bairro}, ${area.cidade}`
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        iniciarEdicao(
                          area,
                        )
                      }
                      disabled={
                        operacaoEmAndamento
                      }
                      aria-label={
                        `Editar área ${area.bairro}, ${area.cidade}`
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        iniciarEdicaoGeometria(
                          area,
                        )
                      }
                      disabled={
                        operacaoEmAndamento
                      }
                      aria-label={
                        area.possuiGeometria
                          ? `Editar geometria de ${area.bairro}, ${area.cidade}`
                          : `Desenhar geometria de ${area.bairro}, ${area.cidade}`
                      }
                    >
                      {area.possuiGeometria
                        ? 'Editar geometria'
                        : 'Desenhar geometria'}
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </>
  )
}

export default AreasAdminPage
import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import MapaEdicaoArea from '../../components/MapaEdicaoArea'

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

function AreasAdminPage() {
  const [rotas, setRotas] =
    useState([])

  const [areas, setAreas] =
    useState([])

  const [busca, setBusca] =
    useState('')

  const [cidade, setCidade] =
    useState('')

  const [bairro, setBairro] =
    useState('')

  const [rotaId, setRotaId] =
    useState('')

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

  const [erro, setErro] =
    useState('')

  const [sucesso, setSucesso] =
    useState('')

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
    let componenteAtivo = true

    Promise.all([
      listarRotas(),
      listarAreasAtendidas(),
    ])
      .then(
        ([
          dadosRotas,
          dadosAreas,
        ]) => {
          if (!componenteAtivo) {
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
          setCarregando(false)
        }
      })

    return () => {
      componenteAtivo = false
    }
  }, [])

  const areasFiltradas = useMemo(
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
              area.cidade ?? ''
            ).toLocaleLowerCase(
              'pt-BR',
            )

          const bairroArea =
            (
              area.bairro ?? ''
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

  async function recarregarAreas() {
    const dados =
      await listarAreasAtendidas()

    setAreas(
      Array.isArray(dados)
        ? dados
        : [],
    )
  }

  function limparFormulario() {
    setCidade('')
    setBairro('')
    setRotaId('')
    setAreaEmEdicao(null)
  }

  function fecharEditorGeometria() {
    setAreaGeometria(null)

    setGeometriaInicial(null)
    setGeometriaAtual(null)

    setLatitudeMapa(null)
    setLongitudeMapa(null)
  }

  function iniciarEdicao(
    area,
  ) {
    setErro('')
    setSucesso('')

    fecharEditorGeometria()

    setAreaEmEdicao(
      area,
    )

    setCidade(
      area.cidade ?? '',
    )

    setBairro(
      area.bairro ?? '',
    )

    setRotaId(
      String(
        area.rotaId ?? '',
      ),
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function cancelarEdicao() {
    limparFormulario()

    setErro('')
    setSucesso('')
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
    if (!geometriaGeoJson) {
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
    setErro('')
    setSucesso('')

    setCarregandoMapa(true)

    setAreaGeometria(
      area,
    )

    setGeometriaInicial(null)
    setGeometriaAtual(null)

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

      if (localizacao) {
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

      if (geometriaSimul) {
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

      if (geometriaNominatim) {
        setGeometriaInicial(
          geometriaNominatim,
        )

        setGeometriaAtual(
          geometriaNominatim,
        )

        return
      }

      setGeometriaInicial(null)
      setGeometriaAtual(null)
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível preparar o mapa da área.',
      )
    } finally {
      setCarregandoMapa(false)
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
    if (!areaGeometria) {
      return
    }

    setErro('')
    setSucesso('')

    if (!geometriaAtual) {
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

    setErro('')
    setSucesso('')

    if (
      !cidade.trim() ||
      !bairro.trim() ||
      !rotaId
    ) {
      setErro(
        'Informe a cidade, o bairro e a rota associada.',
      )

      return
    }

    const rotaSelecionadaId =
      Number(rotaId)

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

    const dados = {
      cidade:
        cidade.trim(),

      bairro:
        bairro.trim(),

      rotaId:
        rotaSelecionadaId,
    }

    try {
      setSalvando(true)

      if (areaEmEdicao) {
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
      setSalvando(false)
    }
  }

  return (
    <>
      <header className="admin-secao__cabecalho">
        <h2>
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

      <section className="resultado">
        <h3>
          {areaEmEdicao
            ? 'Editar área atendida'
            : 'Cadastrar bairro atendido'}
        </h3>

        <form
          className="consulta__formulario"
          onSubmit={
            handleSubmit
          }
        >
          <div className="campo">
            <label
              htmlFor="cidadeArea"
            >
              Cidade
            </label>

            <input
              id="cidadeArea"
              type="text"
              value={cidade}
              onChange={(
                event,
              ) =>
                setCidade(
                  event.target
                    .value,
                )
              }
              placeholder="Ex.: Senador Canedo"
              autoComplete="address-level2"
            />
          </div>

          <div className="campo">
            <label
              htmlFor="bairroArea"
            >
              Bairro
            </label>

            <input
              id="bairroArea"
              type="text"
              value={bairro}
              onChange={(
                event,
              ) =>
                setBairro(
                  event.target
                    .value,
                )
              }
              placeholder="Ex.: Jardim Nova Goiânia"
              autoComplete="address-level3"
            />
          </div>

          <div className="campo">
            <label
              htmlFor="rotaArea"
            >
              Rota associada
            </label>

            <select
              id="rotaArea"
              value={rotaId}
              onChange={(
                event,
              ) =>
                setRotaId(
                  event.target
                    .value,
                )
              }
              disabled={
                carregando
              }
            >
              <option value="">
                Selecione uma rota
              </option>

              {rotas.map(
                (rota) => (
                  <option
                    key={rota.id}
                    value={rota.id}
                    disabled={
                      !rota.ativo &&
                      Number(
                        rotaId,
                      ) !== rota.id
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
          </div>

          <button
            type="submit"
            disabled={salvando}
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
              disabled={salvando}
            >
              Cancelar edição
            </button>
          )}
        </form>
      </section>

      {areaGeometria && (
        <section className="resultado">
          <h3>
            Editor da área —{' '}
            {
              areaGeometria.bairro
            }
          </h3>

          <p>
            Use as ferramentas no canto
            superior esquerdo do mapa para
            desenhar ou ajustar o contorno.
          </p>

          <p>
            <strong>
              Desenho:
            </strong>{' '}
            crie o polígono seguindo o
            limite da área.
            {' '}
            <strong>
              Edição:
            </strong>{' '}
            mova os vértices para corrigir
            o contorno.
            {' '}
            <strong>
              Arrastar:
            </strong>{' '}
            move a geometria inteira.
          </p>

          {carregandoMapa ? (
            <p>
              Preparando mapa...
            </p>
          ) : (
            <>
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

              <div className="rota-admin__acoes">
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

      <section className="resultado">
        <h3>
          Áreas cadastradas
        </h3>

        <div className="consulta__formulario">
          <div className="campo">
            <label
              htmlFor="buscaArea"
            >
              Buscar área
            </label>

            <input
              id="buscaArea"
              type="search"
              value={busca}
              onChange={(
                event,
              ) =>
                setBusca(
                  event.target
                    .value,
                )
              }
              placeholder="Digite o bairro ou a cidade"
            />
          </div>
        </div>

        {!carregando && (
          <div className="resultado__informacoes">
            <p>
              <strong>
                Total:
              </strong>{' '}
              {areas.length}
            </p>

            <p>
              <strong>
                Com geometria:
              </strong>{' '}
              {totalComGeometria}
            </p>

            <p>
              <strong>
                Sem geometria:
              </strong>{' '}
              {totalSemGeometria}
            </p>
          </div>
        )}

        {carregando ? (
          <p>
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
                  key={area.id}
                >
                  <div className="rota-admin__conteudo">
                    <h3>
                      {area.bairro}
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
                      {area.possuiGeometria
                        ? '✅ Cadastrada'
                        : '⚠️ Não cadastrada'}
                    </p>
                  </div>

                  <div className="rota-admin__acoes">
                    <button
                      type="button"
                      onClick={() =>
                        iniciarEdicao(
                          area,
                        )
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
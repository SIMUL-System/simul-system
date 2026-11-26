import { lazy, Suspense, useEffect, useRef, useState } from 'react'

import { Link } from 'react-router-dom'

import '../App.css'
import '../styles/consulta.css'

import Icone from '../components/Icone'
import CampoCombobox from '../components/form/CampoCombobox'
import CartaoProximaColeta from '../components/coleta/CartaoProximaColeta'
import ComoFunciona from '../components/coleta/ComoFunciona'
import DiasSemana from '../components/coleta/DiasSemana'

import { obterToken } from '../services/authService'

import {
  calcularProximaColeta,
  descreverHorario,
  formatarHora,
  ordenarCronogramas,
  rotuloDia,
  temHorario,
} from '../utils/coleta'

import { buscarCoordenadasArea } from '../services/geocodingService'

import { consultarColeta, listarAreasDisponiveis } from '../services/rotaService'
import { ordenarTexto } from '../utils/texto'

const MapaColeta = lazy(() => import('../components/MapaColeta'))

/** Página inicial: escolhe cidade e bairro e mostra dias, horários, próxima coleta e mapa. */
function ConsultaPage() {
  const [areas, setAreas] = useState([])
  const [cidade, setCidade] = useState('')
  const [bairro, setBairro] = useState('')
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [avisoMapa, setAvisoMapa] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [carregandoAreas, setCarregandoAreas] = useState(true)
  const [latitudeMapa, setLatitudeMapa] = useState(null)
  const [longitudeMapa, setLongitudeMapa] = useState(null)
  const [nomeAreaMapa, setNomeAreaMapa] = useState('')
  const [geometriaArea, setGeometriaArea] = useState(null)
  const [limitesArea, setLimitesArea] = useState(null)
  const [carregandoLocalizacaoMapa, setCarregandoLocalizacaoMapa] = useState(false)
  const [latitudeUsuario, setLatitudeUsuario] = useState(null)
  const [longitudeUsuario, setLongitudeUsuario] = useState(null)
  const [precisaoUsuario, setPrecisaoUsuario] = useState(null)
  const [statusLocalizacaoUsuario, setStatusLocalizacaoUsuario] = useState(() =>
    navigator.geolocation ? 'buscando' : 'indisponivel',
  )

  const [erroLocalizacaoUsuario, setErroLocalizacaoUsuario] = useState(() =>
    navigator.geolocation
      ? ''
      : 'Seu navegador não oferece suporte à localização. Você ainda pode selecionar a cidade e o bairro manualmente.',
  )

  const [agora, setAgora] = useState(() => new Date())

  const ultimaSelecaoRef = useRef(0)

  const melhorPrecisaoRef = useRef(null)

  const tituloResultadoRef = useRef(null)

  useEffect(() => {
    let componenteAtivo = true

    listarAreasDisponiveis()
      .then((dados) => {
        if (!componenteAtivo) {
          return
        }

        const lista = Array.isArray(dados) ? dados : []

        setAreas(lista)

        // Com uma única cidade atendida, ela já vem escolhida (um passo a menos).
        const cidadesUnicas = new Set(lista.map((area) => area.cidade?.trim()).filter(Boolean))

        if (cidadesUnicas.size === 1) {
          setCidade((atual) => atual || [...cidadesUnicas][0])
        }
      })
      .catch((error) => {
        if (!componenteAtivo) {
          return
        }

        setErro(error.message || 'Não foi possível carregar as áreas atendidas.')
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

    function atualizarLocalizacao(position) {
      if (!componenteAtivo) {
        return
      }

      const { latitude, longitude, accuracy } = position.coords

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(accuracy)) {
        return
      }

      const melhorPrecisao = melhorPrecisaoRef.current

      const primeiraLeitura = melhorPrecisao == null

      const leituraMelhor = primeiraLeitura || accuracy < melhorPrecisao

      if (!leituraMelhor) {
        return
      }

      melhorPrecisaoRef.current = accuracy

      setLatitudeUsuario(latitude)

      setLongitudeUsuario(longitude)

      setPrecisaoUsuario(accuracy)

      setErroLocalizacaoUsuario('')

      if (accuracy <= 100) {
        setStatusLocalizacaoUsuario('precisa')
      } else if (accuracy <= 500) {
        setStatusLocalizacaoUsuario('aproximada')
      } else {
        setStatusLocalizacaoUsuario('imprecisa')
      }
    }

    function tratarErroLocalizacao(error) {
      if (!componenteAtivo) {
        return
      }

      if (error.code === 1) {
        setStatusLocalizacaoUsuario('negada')

        setErroLocalizacaoUsuario(
          'A localização não foi autorizada. Você ainda pode selecionar a cidade e o bairro manualmente.',
        )

        return
      }

      if (error.code === 2) {
        setStatusLocalizacaoUsuario('indisponivel')

        setErroLocalizacaoUsuario(
          'Sua localização não está disponível no momento. Você ainda pode selecionar a cidade e o bairro manualmente.',
        )

        return
      }

      if (error.code === 3) {
        setStatusLocalizacaoUsuario('timeout')

        setErroLocalizacaoUsuario(
          'Não foi possível obter uma localização precisa a tempo. Você ainda pode selecionar a cidade e o bairro manualmente.',
        )

        return
      }

      setStatusLocalizacaoUsuario('indisponivel')

      setErroLocalizacaoUsuario(
        'Não foi possível obter sua localização. Você ainda pode selecionar a cidade e o bairro manualmente.',
      )
    }

    const watchId = navigator.geolocation.watchPosition(
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

      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  useEffect(() => {
    if (!resultado) {
      return
    }

    tituloResultadoRef.current?.focus()
  }, [resultado])

  const cidades = [...new Set(areas.map((area) => area.cidade?.trim()).filter(Boolean))].sort(
    ordenarTexto,
  )

  const bairros = cidade
    ? [
        ...new Set(
          areas
            .filter((area) => area.cidade?.trim() === cidade)
            .map((area) => area.bairro?.trim())
            .filter(Boolean),
        ),
      ].sort(ordenarTexto)
    : []

  function limparAreaMapa() {
    setLatitudeMapa(null)

    setLongitudeMapa(null)

    setNomeAreaMapa('')

    setGeometriaArea(null)

    setLimitesArea(null)
  }

  function converterGeoJson(geometriaGeoJson) {
    if (!geometriaGeoJson) {
      return null
    }

    try {
      const geometria = JSON.parse(geometriaGeoJson)

      if (!geometria || typeof geometria !== 'object') {
        return null
      }

      if (geometria.type !== 'Polygon' && geometria.type !== 'MultiPolygon') {
        return null
      }

      if (!Array.isArray(geometria.coordinates) || geometria.coordinates.length === 0) {
        return null
      }

      return geometria
    } catch {
      return null
    }
  }

  async function carregarLocalizacaoFallback(cidadeSelecionada, bairroSelecionado, idSelecao) {
    try {
      const localizacao = await buscarCoordenadasArea(cidadeSelecionada, bairroSelecionado)

      if (idSelecao !== ultimaSelecaoRef.current) {
        return
      }

      if (!localizacao) {
        limparAreaMapa()

        setAvisoMapa(
          'Os horários foram consultados, mas não foi possível localizar esta região no mapa.',
        )

        return
      }

      setLatitudeMapa(localizacao.latitude)

      setLongitudeMapa(localizacao.longitude)

      setNomeAreaMapa(`${bairroSelecionado}, ${cidadeSelecionada}`)

      setGeometriaArea(localizacao.geometria)

      setLimitesArea(localizacao.boundingBox)
    } catch {
      if (idSelecao !== ultimaSelecaoRef.current) {
        return
      }

      limparAreaMapa()

      setAvisoMapa(
        'Os horários foram consultados, mas não foi possível localizar esta região no mapa.',
      )
    }
  }

  async function executarConsultaArea(cidadeSelecionada, bairroSelecionado) {
    if (!cidadeSelecionada || !bairroSelecionado) {
      return
    }

    setResultado(null)

    setErro('')

    setAvisoMapa('')

    const idSelecao = ultimaSelecaoRef.current + 1

    ultimaSelecaoRef.current = idSelecao

    setCarregando(true)

    setCarregandoLocalizacaoMapa(true)

    try {
      const dadosColeta = await consultarColeta(cidadeSelecionada, bairroSelecionado)

      if (idSelecao !== ultimaSelecaoRef.current) {
        return
      }

      setAgora(new Date())

      setResultado(dadosColeta)

      const geometriaSimul = converterGeoJson(dadosColeta?.geometriaGeoJson)

      if (geometriaSimul) {
        setNomeAreaMapa(`${bairroSelecionado}, ${cidadeSelecionada}`)

        setGeometriaArea(geometriaSimul)

        setLimitesArea(null)

        setLatitudeMapa(null)

        setLongitudeMapa(null)

        setAvisoMapa('')

        return
      }

      if (dadosColeta?.geometriaGeoJson) {
        setAvisoMapa(
          'A geometria cadastrada no SIMUL está inválida. O mapa usará a localização do OpenStreetMap como alternativa.',
        )
      }

      await carregarLocalizacaoFallback(cidadeSelecionada, bairroSelecionado, idSelecao)
    } catch (error) {
      if (idSelecao !== ultimaSelecaoRef.current) {
        return
      }

      setErro(error?.message || 'Não foi possível consultar a coleta.')

      limparAreaMapa()
    } finally {
      if (idSelecao === ultimaSelecaoRef.current) {
        setCarregando(false)

        setCarregandoLocalizacaoMapa(false)
      }
    }
  }

  function handleCidadeChange(event) {
    const novaCidade = event.target.value

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

  async function handleBairroChange(novoBairro) {
    setBairro(novoBairro)

    setErro('')

    setAvisoMapa('')

    if (!cidade || !novoBairro) {
      setResultado(null)

      limparAreaMapa()

      return
    }

    await executarConsultaArea(cidade, novoBairro)
  }

  const paginaCarregando = carregandoAreas || carregando

  const cronogramasOrdenados = ordenarCronogramas(resultado?.cronogramas)

  // Faixa média dos turnos na cidade (operadora): horário aproximado quando a prefeitura informa só o turno.
  const faixaTurnos = resultado?.turnos ?? null

  const proximaColeta = calcularProximaColeta(cronogramasOrdenados, agora, faixaTurnos)

  const usuarioLogado = Boolean(obterToken())

  // Tipo da coleta do bairro: seletiva (recicláveis), convencional (lixo comum) ou não informado.
  const tipoColeta = resultado?.tipoColeta ?? 'SELETIVA'
  const nomeColeta = {
    SELETIVA: 'Coleta seletiva',
    CONVENCIONAL: 'Coleta convencional',
    NAO_INFORMADO: 'Coleta',
  }[tipoColeta]

  const algumSemHorario = cronogramasOrdenados.some((cronograma) => !temHorario(cronograma))

  // "Senador Canedo - Diurna (seg, qua e sex)" → "Diurna (seg, qua e sex)",
  // já que a cidade aparece ao lado.
  const prefixoCidade = resultado?.cidade ? `${resultado.cidade} - ` : null

  const rotaExibida =
    prefixoCidade && resultado?.nomeRota?.startsWith(prefixoCidade)
      ? resultado.nomeRota.slice(prefixoCidade.length)
      : resultado?.nomeRota

  const textoLocalizacao = {
    buscando: 'Procurando sua localização para mostrar no mapa…',
    precisa: 'Sua localização aparece no mapa.',
    aproximada: 'Sua localização aproximada aparece no mapa.',
  }[statusLocalizacaoUsuario]

  return (
    <main className="consulta-pagina" aria-busy={paginaCarregando}>
      <section className="consulta-hero" aria-labelledby="titulo-consulta-publica">
        <div className="consulta-hero__texto">
          <p className="sobretitulo sobretitulo--verde">Coleta no seu bairro</p>

          <h1 id="titulo-consulta-publica" className="consulta-hero__titulo">
            Quando passa a coleta no seu bairro?
          </h1>

          <p className="consulta-hero__lead">
            Escolha sua cidade e seu bairro para ver os dias, os horários e a área atendida. Com uma
            conta, você recebe um lembrete por e-mail antes de cada coleta.
          </p>
        </div>

        <form
          className="consulta-busca"
          aria-labelledby="titulo-consulta-regiao"
          aria-busy={carregandoAreas}
          onSubmit={(event) => event.preventDefault()}
        >
          <h2 id="titulo-consulta-regiao" className="titulo-cartao">
            Encontre sua região
          </h2>

          <div className="consulta-busca__campos">
            <div className="campo-ds">
              <label className="campo-ds__rotulo" htmlFor="cidade">
                Cidade
              </label>

              <select
                id="cidade"
                className="campo-ds__controle"
                value={cidade}
                onChange={handleCidadeChange}
                disabled={carregandoAreas || cidades.length === 0}
                aria-describedby="ajuda-cidade"
                aria-busy={carregandoAreas}
              >
                <option value="">
                  {carregandoAreas
                    ? 'Carregando cidades…'
                    : cidades.length === 0
                      ? 'Nenhuma cidade disponível'
                      : 'Selecione a cidade'}
                </option>

                {cidades.map((nomeCidade) => (
                  <option key={nomeCidade} value={nomeCidade}>
                    {nomeCidade}
                  </option>
                ))}
              </select>

              <p id="ajuda-cidade" className="campo-ds__dica">
                {carregandoAreas
                  ? 'Carregando as cidades atendidas.'
                  : cidades.length > 0
                    ? `${cidades.length} ${cidades.length === 1 ? 'cidade atendida' : 'cidades atendidas'}.`
                    : 'Nenhuma cidade atendida foi encontrada.'}
              </p>
            </div>

            <CampoCombobox
              id="bairro"
              rotulo="Bairro"
              opcoes={bairros}
              valor={bairro}
              aoEscolher={handleBairroChange}
              desabilitado={!cidade || bairros.length === 0}
              placeholder={
                !cidade
                  ? 'Escolha a cidade primeiro'
                  : bairros.length === 0
                    ? 'Nenhum bairro disponível'
                    : 'Digite ou escolha o bairro'
              }
              idDica="ajuda-bairro"
              dica={
                !cidade
                  ? 'A lista de bairros aparece depois da cidade.'
                  : bairros.length === 0
                    ? 'Nenhum bairro atendido nesta cidade.'
                    : `${bairros.length} ${bairros.length === 1 ? 'bairro atendido' : 'bairros atendidos'}. O resultado aparece assim que você escolher.`
              }
              mensagemVazia="Nenhum bairro encontrado com esse nome."
            />
          </div>

          {(textoLocalizacao || erroLocalizacaoUsuario) && (
            <p className="consulta-busca__local" role="status" aria-live="polite">
              <Icone nome="local" tamanho={16} />
              {textoLocalizacao || erroLocalizacaoUsuario}
            </p>
          )}
        </form>
      </section>

      <div className="consulta-grade">
        <div className="consulta-grade__principal">
          {erro && (
            <div className="alerta alerta--erro" role="alert">
              <Icone nome="erro" />

              <div>
                <strong>Não foi possível consultar</strong>
                {erro}
              </div>
            </div>
          )}

          {carregando && (
            <div className="consulta-carregando" role="status" aria-live="polite">
              <span className="consulta-carregando__barra" />
              <span className="consulta-carregando__barra consulta-carregando__barra--curta" />
              <span className="visualmente-oculto">Carregando os horários da coleta…</span>
            </div>
          )}

          {resultado && !carregando && (
            <section className="consulta-resultado" aria-labelledby="titulo-resultado-consulta">
              <header className="consulta-resultado__cabecalho">
                <p className="sobretitulo">Resultado da consulta</p>

                <h2
                  id="titulo-resultado-consulta"
                  ref={tituloResultadoRef}
                  tabIndex="-1"
                  className="consulta-resultado__titulo"
                >
                  {nomeColeta} em {resultado.bairro}
                </h2>

                <p className="consulta-resultado__local">
                  {resultado.cidade}
                  {rotaExibida && (
                    <>
                      {' · '}
                      {/^rota\b/i.test(rotaExibida) ? rotaExibida : `Rota ${rotaExibida}`}
                    </>
                  )}
                </p>
              </header>

              {cronogramasOrdenados.length > 0 ? (
                <>
                  <CartaoProximaColeta proxima={proximaColeta} bairro={resultado.bairro} />

                  <section className="cartao" aria-labelledby="titulo-dias-coleta">
                    <h3 id="titulo-dias-coleta" className="titulo-cartao">
                      Dias e horários
                    </h3>

                    <DiasSemana cronogramas={cronogramasOrdenados} hoje={agora} />

                    <ul className="horarios">
                      {cronogramasOrdenados.map((cronograma, indice) => {
                        const inicio = formatarHora(cronograma.horarioInicio)

                        const fim = formatarHora(cronograma.horarioFim)

                        return (
                          <li
                            key={`${cronograma.diaSemana}-${cronograma.turno}-${inicio}-${indice}`}
                            className="horarios__item"
                          >
                            <span className="horarios__dia">{rotuloDia(cronograma.diaSemana)}</span>

                            {temHorario(cronograma) ? (
                              <span className="horarios__hora">
                                <time dateTime={inicio}>{inicio}</time>
                                {' – '}
                                <time dateTime={fim}>{fim}</time>
                              </span>
                            ) : (
                              <span className="horarios__hora horarios__hora--turno">
                                {descreverHorario(cronograma, true, faixaTurnos)}
                              </span>
                            )}
                          </li>
                        )
                      })}
                    </ul>

                    {algumSemHorario && (
                      <p className="horarios__nota">
                        {faixaTurnos?.diurnoInicio || faixaTurnos?.noturnoInicio
                          ? `A prefeitura informa só o turno. A faixa é a média da cidade${faixaTurnos.fonte ? ` (${faixaTurnos.fonte.split(':')[0]})` : ''}; o horário exato varia por rua. Deixe o lixo na calçada até 1 hora antes do início do turno.`
                          : 'A prefeitura informa só o turno da coleta, sem o horário exato.'}
                      </p>
                    )}
                  </section>

                  {tipoColeta === 'CONVENCIONAL' && (
                    <div className="alerta alerta--info" role="note">
                      <Icone nome="info" />

                      <div>
                        <strong>Coleta convencional</strong>
                        Em {resultado.cidade}, os dias e turnos cadastrados são da coleta de lixo
                        comum. A prefeitura não informou um cronograma separado de coleta seletiva.
                      </div>
                    </div>
                  )}

                  {tipoColeta === 'NAO_INFORMADO' && (
                    <div className="alerta alerta--info" role="note">
                      <Icone nome="info" />

                      <div>
                        <strong>Tipo de coleta não informado</strong>A fonte da prefeitura de{' '}
                        {resultado.cidade} traz os dias e o turno, mas não diz se esta é a coleta
                        seletiva. Confirme com a prefeitura antes de separar os recicláveis só para
                        este dia.
                      </div>
                    </div>
                  )}

                  <section className="chamada-lembrete" aria-labelledby="titulo-chamada-lembrete">
                    <span className="chamada-lembrete__icone" aria-hidden="true">
                      <Icone nome="sino" tamanho={24} />
                    </span>

                    <div className="chamada-lembrete__texto">
                      <h3 id="titulo-chamada-lembrete">Não esqueça a próxima coleta</h3>

                      <p>
                        {usuarioLogado
                          ? 'Escolha esta rota nas suas preferências e defina com quanta antecedência quer o lembrete.'
                          : 'Crie uma conta gratuita e receba um e-mail antes de cada coleta do seu bairro.'}
                      </p>
                    </div>

                    <Link
                      to={usuarioLogado ? '/preferencias' : '/cadastro'}
                      className="botao botao--primario"
                    >
                      {usuarioLogado ? 'Configurar lembrete' : 'Ativar lembrete'}
                    </Link>
                  </section>
                </>
              ) : (
                <div className="alerta alerta--info" role="status">
                  <Icone nome="info" />

                  <div>
                    <strong>Ainda não há coleta cadastrada</strong>
                    Este bairro ainda não tem coleta seletiva ativa no SIMUL.
                  </div>
                </div>
              )}
            </section>
          )}

          {!resultado && !carregando && <ComoFunciona />}
        </div>

        <aside className="consulta-grade__mapa" aria-label="Mapa da área de coleta">
          {avisoMapa && (
            <div className="alerta alerta--aviso" role="status">
              <Icone nome="aviso" />

              <div>
                <strong>Sobre o mapa</strong>
                {avisoMapa}
              </div>
            </div>
          )}

          <Suspense
            fallback={
              <div
                className="mapa mapa--carregando"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                Carregando mapa…
              </div>
            }
          >
            <MapaColeta
              latitude={latitudeMapa}
              longitude={longitudeMapa}
              nomeArea={nomeAreaMapa}
              areaEscolhida={resultado ? `${resultado.bairro}, ${resultado.cidade}` : ''}
              carregandoLocalizacao={carregandoLocalizacaoMapa}
              geometriaArea={geometriaArea}
              limitesArea={limitesArea}
              latitudeUsuario={latitudeUsuario}
              longitudeUsuario={longitudeUsuario}
              precisaoUsuario={precisaoUsuario}
              statusLocalizacaoUsuario={statusLocalizacaoUsuario}
            />
          </Suspense>
        </aside>
      </div>
    </main>
  )
}

export default ConsultaPage

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Alerta from '../../components/Alerta'
import Icone from '../../components/Icone'
import PainelLateral from '../../components/admin/PainelLateral'
import FormHorarioLote from '../../components/admin/cronograma/FormHorarioLote'

import { listarAreasAtendidas } from '../../services/adminAreaService'
import { alterarHorariosEmLote, listarCronogramas } from '../../services/adminCronogramaService'
import { listarRotas } from '../../services/adminRotaService'

import useCidadeAdmin from '../../hooks/useCidadeAdmin'

import { nomeRotaCurto } from '../../utils/areas'
import {
  compararColetas,
  dadosTurno,
  DIAS_SEMANA,
  horaCurta,
  horaParaApi,
  rotuloHorario,
  temHorario,
  turnoDe,
} from '../../utils/cronogramas'
import { diaDeHoje } from '../../utils/painel'
import { comoLista, ordenarTexto } from '../../utils/texto'

/**
 * Admin: agenda da semana da cidade escolhida. Mostra, dia a dia, quais rotas
 * passam e em que turno (e horário, quando a prefeitura informa). Para mudar
 * os dias de uma rota, o administrador abre a rota; aqui fica a mudança de
 * horário de várias rotas de uma vez.
 */
function CronogramasAdminPage() {
  const { cidade } = useCidadeAdmin()
  const [rotas, setRotas] = useState([])
  const [areas, setAreas] = useState([])
  const [cronogramas, setCronogramas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState('')
  const [mensagem, setMensagem] = useState(null)
  const [painelAberto, setPainelAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    let ativo = true

    Promise.all([
      listarRotas(cidade.id),
      listarCronogramas(cidade.id),
      listarAreasAtendidas(cidade.id),
    ])
      .then(([dadosRotas, dadosCronogramas, dadosAreas]) => {
        if (!ativo) return
        setRotas(comoLista(dadosRotas))
        setCronogramas(comoLista(dadosCronogramas))
        setAreas(comoLista(dadosAreas))
      })
      .catch((error) => {
        if (ativo) setErroCarga(error.message || 'Não foi possível carregar a agenda.')
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [cidade.id])

  async function alterarLote(ids, { inicio, fim, semHorario, turno }, quantidadeRotas) {
    setSalvando(true)
    setMensagem(null)

    try {
      await alterarHorariosEmLote(
        ids,
        semHorario ? null : horaParaApi(inicio),
        semHorario ? null : horaParaApi(fim),
      )
      setCronogramas(comoLista(await listarCronogramas(cidade.id)))
      setPainelAberto(false)

      const sujeito = quantidadeRotas === 1 ? 'A rota' : `As ${quantidadeRotas} rotas`
      const turnoTexto = dadosTurno(turno).adjetivo

      setMensagem({
        tipo: 'sucesso',
        texto: semHorario
          ? `${sujeito} ${quantidadeRotas === 1 ? 'mostra' : 'mostram'} só o turno na coleta ${turnoTexto}, sem horário.`
          : `${sujeito} ${quantidadeRotas === 1 ? 'coleta' : 'coletam'} das ${inicio} às ${fim} no turno ${dadosTurno(turno).rotulo.toLowerCase()}.`,
      })
    } catch (error) {
      setMensagem({
        tipo: 'erro',
        texto: `${error.message || 'Não foi possível alterar os horários.'} Nenhum horário foi alterado.`,
      })
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <div className="carregando" role="status">
        <span className="carregando__spinner" aria-hidden="true" />
        Carregando agenda…
      </div>
    )
  }

  if (erroCarga) {
    return <Alerta tipo="erro">{erroCarga}</Alerta>
  }

  const rotasAtivas = rotas
    .filter((rota) => rota.ativo)
    .sort((a, b) => ordenarTexto(a.nome, b.nome))
  const idsAtivas = new Set(rotasAtivas.map((rota) => rota.id))
  const hoje = diaDeHoje(new Date().getDay())
  const cidadeUnica = cidade.nome
  const faixa = cidade.turnos ?? {}
  const faixaDiurno =
    faixa.diurnoInicio && `${horaCurta(faixa.diurnoInicio)}–${horaCurta(faixa.diurnoFim)}`
  const faixaNoturno =
    faixa.noturnoInicio && `${horaCurta(faixa.noturnoInicio)}–${horaCurta(faixa.noturnoFim)}`

  const bairrosPorRota = new Map()
  areas.forEach((area) =>
    bairrosPorRota.set(area.rotaId, (bairrosPorRota.get(area.rotaId) ?? 0) + 1),
  )

  const colunas = DIAS_SEMANA.map((dia) => ({
    dia,
    coletas: cronogramas
      .filter((item) => item.ativo && item.diaSemana === dia.valor && idsAtivas.has(item.rotaId))
      .sort(compararColetas),
  }))

  const semHorario = rotasAtivas.filter(
    (rota) => !cronogramas.some((item) => item.ativo && item.rotaId === rota.id),
  )

  return (
    <div className="admin-pagina">
      <header className="admin-pagina__cabecalho">
        <div>
          <h1 className="admin-pagina__titulo">Agenda da semana em {cidade.nome}</h1>
          <p className="admin-pagina__texto">
            Quais rotas passam em cada dia e em que turno. O horário aparece só quando a prefeitura
            informa. Para mudar os dias de uma rota, toque nela.
          </p>
        </div>

        <div className="admin-pagina__acoes">
          <button
            type="button"
            className="botao botao--secundario"
            onClick={() => {
              setMensagem(null)
              setPainelAberto(true)
            }}
          >
            <Icone nome="relogio" tamanho={18} />
            Mudar horário de várias rotas
          </button>
        </div>
      </header>

      {mensagem && <Alerta tipo={mensagem.tipo}>{mensagem.texto}</Alerta>}

      {semHorario.length > 0 && (
        <Alerta tipo="aviso">
          {semHorario.length === 1
            ? 'Uma rota ativa está'
            : `${semHorario.length} rotas ativas estão`}{' '}
          sem nenhum dia de coleta:{' '}
          {semHorario.map((rota, indice) => (
            <span key={rota.id}>
              {indice > 0 && ', '}
              <Link to={`/admin/rotas?rota=${rota.id}`}>{rota.nome}</Link>
            </span>
          ))}
          .
        </Alerta>
      )}

      <div className={`admin-area ${painelAberto ? 'admin-area--com-painel' : ''}`}>
        <section className="agenda" aria-label="Coletas por dia da semana">
          {colunas.map(({ dia, coletas }) => (
            <div
              key={dia.valor}
              className={`agenda__dia${dia.valor === hoje ? ' agenda__dia--hoje' : ''}`}
            >
              <h2 className="agenda__titulo">
                <span className="agenda__nome-curto" aria-hidden="true">
                  {dia.curto}
                </span>
                <span className="agenda__nome-longo">{dia.longo}</span>
                {dia.valor === hoje && <span className="selo selo--hoje">hoje</span>}
              </h2>

              {coletas.length === 0 ? (
                <p className="agenda__vazio">Sem coleta</p>
              ) : (
                <ul className="agenda__lista">
                  {coletas.map((item) => {
                    const total = bairrosPorRota.get(item.rotaId) ?? 0

                    return (
                      <li key={item.id}>
                        <Link
                          to={`/admin/rotas?rota=${item.rotaId}`}
                          className={`agenda__coleta${
                            turnoDe(item) === 'NOTURNO' ? ' agenda__coleta--noturna' : ''
                          }${turnoDe(item) === 'NAO_INFORMADO' ? ' agenda__coleta--sem-turno' : ''}`}
                        >
                          <span className="agenda__horario">
                            {rotuloHorario(item)}
                            {!temHorario(item) && (
                              <span className="visualmente-oculto"> (horário não informado)</span>
                            )}
                          </span>
                          <span className="agenda__rota">
                            {nomeRotaCurto(item.nomeRota, cidadeUnica)}
                          </span>
                          <span className="agenda__bairros">
                            {total === 1 ? '1 bairro' : `${total} bairros`}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          ))}
        </section>

        {painelAberto && (
          <PainelLateral
            titulo="Mudar horário de várias rotas"
            chave="lote"
            onFechar={() => setPainelAberto(false)}
          >
            <FormHorarioLote
              rotas={rotasAtivas}
              cronogramas={cronogramas}
              cidade={cidade.nome}
              salvando={salvando}
              onEnviar={alterarLote}
            />
          </PainelLateral>
        )}
      </div>

      <p className="admin-rodape">
        <span className="agenda__legenda agenda__legenda--dia" aria-hidden="true" /> Diurna
        {faixaDiurno && ` (aprox. ${faixaDiurno})`}
        <span className="agenda__legenda agenda__legenda--noite" aria-hidden="true" /> Noturna
        {faixaNoturno && ` (aprox. ${faixaNoturno})`} · Sem horário exato, aparece o turno com a
        faixa da cidade (editável na Visão geral)
        {rotas.length > rotasAtivas.length &&
          ` · ${rotas.length - rotasAtivas.length} rota(s) inativa(s) não aparecem na agenda.`}
      </p>
    </div>
  )
}

export default CronogramasAdminPage

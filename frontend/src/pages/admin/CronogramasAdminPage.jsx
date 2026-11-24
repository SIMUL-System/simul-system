import {
  useEffect,
  useState,
} from 'react'

import Alerta from '../../components/Alerta'
import DialogoConfirmacao from '../../components/admin/DialogoConfirmacao'
import PainelLateral from '../../components/admin/PainelLateral'
import FormEditarCronograma from '../../components/admin/cronograma/FormEditarCronograma'
import FormHorarioLote from '../../components/admin/cronograma/FormHorarioLote'
import FormNovoCronograma from '../../components/admin/cronograma/FormNovoCronograma'
import GradeCronogramas from '../../components/admin/cronograma/GradeCronogramas'

import {
  alterarHorariosEmLote,
  alterarStatusCronograma,
  atualizarCronograma,
  criarCronograma,
  listarCronogramas,
} from '../../services/adminCronogramaService'

import { listarRotas } from '../../services/adminRotaService'

import {
  horaCurta,
  horaParaApi,
  listarDias,
  montarGrade,
  nomeDia,
} from '../../utils/cronogramas'

function comoLista(dados) {
  return Array.isArray(dados) ? dados : []
}

function CronogramasAdminPage() {
  const [rotas, setRotas] = useState([])
  const [cronogramas, setCronogramas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState('')

  const [mensagem, setMensagem] = useState(null)
  const [mostrarInativos, setMostrarInativos] = useState(false)
  const [selecionadas, setSelecionadas] = useState([])
  const [painel, setPainel] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [confirmacao, setConfirmacao] = useState(null)

  useEffect(() => {
    let ativo = true

    Promise.all([listarRotas(), listarCronogramas()])
      .then(([dadosRotas, dadosCronogramas]) => {
        if (ativo) {
          setRotas(comoLista(dadosRotas))
          setCronogramas(comoLista(dadosCronogramas))
        }
      })
      .catch((error) => {
        if (ativo) {
          setErroCarga(error.message || 'Não foi possível carregar os cronogramas.')
        }
      })
      .finally(() => {
        if (ativo) {
          setCarregando(false)
        }
      })

    return () => {
      ativo = false
    }
  }, [])

  async function recarregar() {
    const [dadosRotas, dadosCronogramas] = await Promise.all([
      listarRotas(),
      listarCronogramas(),
    ])

    setRotas(comoLista(dadosRotas))
    setCronogramas(comoLista(dadosCronogramas))
  }

  const linhas = montarGrade(rotas, cronogramas, mostrarInativos)
  const rotasAtivas = rotas
    .filter((rota) => rota.ativo)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  const linhasSelecionadas = linhas.filter((linha) =>
    selecionadas.includes(linha.rota.id),
  )
  const idsSelecionados = linhasSelecionadas.flatMap((linha) =>
    linha.ativos.map((item) => item.id),
  )

  function nomeRota(rotaId) {
    return rotas.find((rota) => rota.id === rotaId)?.nome ?? `Rota ${rotaId}`
  }

  /* ---------- seleção ---------- */

  function alternarRota(rotaId) {
    setSelecionadas((atuais) =>
      atuais.includes(rotaId)
        ? atuais.filter((id) => id !== rotaId)
        : [...atuais, rotaId],
    )
  }

  function selecionar(filtro) {
    setSelecionadas(
      linhas
        .filter((linha) => linha.ativos.length > 0 && filtro(linha))
        .map((linha) => linha.rota.id),
    )
  }

  function limparSelecao() {
    setSelecionadas([])

    if (painel?.modo === 'lote') {
      setPainel(null)
    }
  }

  /* ---------- painel ---------- */

  function abrirNovo(rotaId = null, dia = null) {
    setMensagem(null)
    setPainel({
      modo: 'novo',
      rotaId,
      dias: dia ? [dia] : [],
      chave: `novo-${rotaId}-${dia}-${Date.now()}`,
    })
  }

  function abrirEdicao(cronograma) {
    setMensagem(null)
    setPainel({ modo: 'editar', cronograma, chave: `editar-${cronograma.id}` })
  }

  function abrirLote() {
    setMensagem(null)
    setPainel({ modo: 'lote', chave: `lote-${selecionadas.join('-')}` })
  }

  /* ---------- ações ---------- */

  async function criar({ rotaId, dias, inicio, fim }) {
    setSalvando(true)
    setMensagem(null)

    const criados = []
    const falhas = []

    // Um POST por dia, no endpoint que já existe.
    for (const dia of dias) {
      try {
        await criarCronograma({
          rotaId,
          diaSemana: dia,
          horarioInicio: horaParaApi(inicio),
          horarioFim: horaParaApi(fim),
        })
        criados.push(dia)
      } catch (error) {
        falhas.push({ dia, motivo: error.message })
      }
    }

    try {
      await recarregar()
    } catch {
      // A grade fica como estava; a mensagem abaixo já diz o que foi salvo.
    }

    setSalvando(false)

    if (falhas.length === 0) {
      setPainel(null)
      setMensagem({
        tipo: 'sucesso',
        texto: `${criados.length === 1 ? 'Horário criado' : `${criados.length} horários criados`} em ${nomeRota(rotaId)}: ${listarDias(criados)}, das ${inicio} às ${fim}.`,
      })
      return
    }

    setMensagem({
      tipo: criados.length > 0 ? 'aviso' : 'erro',
      texto: [
        criados.length > 0 ? `Criados: ${listarDias(criados)}.` : '',
        `Não foi possível criar: ${falhas
          .map((falha) => `${nomeDia(falha.dia)} (${falha.motivo || 'erro desconhecido'})`)
          .join('; ')}.`,
      ].join(' ').trim(),
    })
  }

  async function salvarEdicao({ rotaId, diaSemana, inicio, fim }) {
    const { cronograma } = painel

    setSalvando(true)
    setMensagem(null)

    try {
      await atualizarCronograma(cronograma.id, {
        rotaId,
        diaSemana,
        horarioInicio: horaParaApi(inicio),
        horarioFim: horaParaApi(fim),
      })
      await recarregar()
      setPainel(null)
      setMensagem({
        tipo: 'sucesso',
        texto: `Horário atualizado: ${nomeRota(rotaId)}, ${nomeDia(diaSemana)}, das ${inicio} às ${fim}.`,
      })
    } catch (error) {
      setMensagem({
        tipo: 'erro',
        texto: error.message || 'Não foi possível salvar o horário.',
      })
    } finally {
      setSalvando(false)
    }
  }

  function pedirAlteracaoStatus(cronograma, ativar) {
    if (ativar) {
      executarStatus(cronograma, true)
      return
    }

    setConfirmacao({ tipo: 'status', cronograma })
  }

  async function executarStatus(cronograma, ativar) {
    setSalvando(true)
    setMensagem(null)

    try {
      await alterarStatusCronograma(cronograma.id, ativar)
      await recarregar()
      setPainel(null)
      setConfirmacao(null)
      setMensagem({
        tipo: 'sucesso',
        texto: `${ativar ? 'Horário reativado' : 'Horário desativado'}: ${nomeRota(cronograma.rotaId)}, ${nomeDia(cronograma.diaSemana)}.`,
      })
    } catch (error) {
      setConfirmacao(null)
      setMensagem({
        tipo: 'erro',
        texto: error.message || 'Não foi possível alterar o status do horário.',
      })
    } finally {
      setSalvando(false)
    }
  }

  async function alterarLote({ inicio, fim }) {
    setSalvando(true)
    setMensagem(null)

    try {
      await alterarHorariosEmLote(
        idsSelecionados,
        horaParaApi(inicio),
        horaParaApi(fim),
      )
      await recarregar()
      setPainel(null)
      setSelecionadas([])
      setMensagem({
        tipo: 'sucesso',
        texto: `${idsSelecionados.length} horários agora vão das ${inicio} às ${fim}.`,
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

  async function desativarLote() {
    setSalvando(true)
    setMensagem(null)

    const falhas = []

    for (const id of idsSelecionados) {
      try {
        await alterarStatusCronograma(id, false)
      } catch {
        falhas.push(id)
      }
    }

    try {
      await recarregar()
    } catch {
      // Mantém a grade anterior; a mensagem informa o resultado.
    }

    setSalvando(false)
    setConfirmacao(null)
    setSelecionadas([])
    setPainel(null)

    const feitos = idsSelecionados.length - falhas.length

    setMensagem(
      falhas.length === 0
        ? { tipo: 'sucesso', texto: `${feitos} horários desativados.` }
        : {
            tipo: 'aviso',
            texto: `${feitos} horários desativados; ${falhas.length} não puderam ser desativados. Tente de novo.`,
          },
    )
  }

  /* ---------- tela ---------- */

  if (carregando) {
    return (
      <div
        className="carregando"
        role="status"
      >
        <span
          className="carregando__spinner"
          aria-hidden="true"
        />
        Carregando cronogramas…
      </div>
    )
  }

  if (erroCarga) {
    return <Alerta tipo="erro">{erroCarga}</Alerta>
  }

  const tituloPainel = {
    novo: 'Novo cronograma',
    editar: 'Editar horário',
    lote: 'Alterar em massa',
  }[painel?.modo]

  return (
    <div className="admin-pagina">
      <header className="admin-pagina__cabecalho">
        <div>
          <h1 className="admin-pagina__titulo">Cronogramas</h1>
          <p className="admin-pagina__texto">
            Cada linha é uma rota e cada coluna, um dia. Toque num horário para
            editar ou num espaço vazio para criar.
          </p>
        </div>

        <div className="admin-pagina__acoes">
          <label className="caixa-opcao">
            <input
              type="checkbox"
              checked={mostrarInativos}
              onChange={(event) => setMostrarInativos(event.target.checked)}
            />
            Mostrar inativos
          </label>

          <button
            type="button"
            className="botao botao--primario"
            onClick={() => abrirNovo()}
          >
            Novo cronograma
          </button>
        </div>
      </header>

      {mensagem && (
        <Alerta tipo={mensagem.tipo}>{mensagem.texto}</Alerta>
      )}

      <div className={`admin-area ${painel ? 'admin-area--com-painel' : ''}`}>
        <section
          className="admin-quadro"
          aria-label="Grade semanal de cronogramas"
        >
          <div className="admin-quadro__barra">
            <span className="admin-quadro__rotulo">Selecionar:</span>
            <button
              type="button"
              className="atalho"
              onClick={() => selecionar(() => true)}
            >
              Todas
            </button>
            <button
              type="button"
              className="atalho"
              onClick={() => selecionar((linha) => !linha.noturna)}
            >
              Todas as diurnas
            </button>
            <button
              type="button"
              className="atalho"
              onClick={() => selecionar((linha) => linha.noturna)}
            >
              Todas as noturnas
            </button>
          </div>

          {selecionadas.length > 0 && (
            <div
              className="barra-selecao"
              role="status"
            >
              <strong className="barra-selecao__texto">
                {idsSelecionados.length} horários selecionados em{' '}
                {selecionadas.length === 1 ? '1 rota' : `${selecionadas.length} rotas`}
              </strong>

              <button
                type="button"
                className="botao botao--pequeno botao--destaque"
                onClick={abrirLote}
                disabled={idsSelecionados.length === 0}
              >
                Alterar horário
              </button>

              <button
                type="button"
                className="botao botao--pequeno botao--contorno-claro"
                onClick={() => setConfirmacao({ tipo: 'lote' })}
                disabled={idsSelecionados.length === 0}
              >
                Desativar
              </button>

              <button
                type="button"
                className="botao botao--pequeno botao--link-claro"
                onClick={limparSelecao}
              >
                Limpar
              </button>
            </div>
          )}

          {linhas.length === 0 ? (
            <p className="admin-quadro__vazio">
              Nenhuma rota ativa. Cadastre uma rota antes de criar horários.
            </p>
          ) : (
            <GradeCronogramas
              linhas={linhas}
              selecionadas={selecionadas}
              cronogramaAberto={painel?.modo === 'editar' ? painel.cronograma.id : null}
              onAlternarRota={alternarRota}
              onAbrirCronograma={abrirEdicao}
              onCriar={abrirNovo}
            />
          )}

          <ul
            className="legenda-horarios"
            aria-label="Legenda"
          >
            <li><span className="legenda-horarios__amostra legenda-horarios__amostra--diurno" />Diurno</li>
            <li><span className="legenda-horarios__amostra legenda-horarios__amostra--noturno" />Noturno</li>
            <li><span className="legenda-horarios__amostra legenda-horarios__amostra--vazio" />Sem coleta</li>
            {mostrarInativos && (
              <li><span className="legenda-horarios__amostra legenda-horarios__amostra--inativo" />Inativo</li>
            )}
          </ul>
        </section>

        {painel && (
          <PainelLateral
            titulo={tituloPainel}
            chave={painel.chave}
            onFechar={() => setPainel(null)}
          >
            {painel.modo === 'novo' && (
              <FormNovoCronograma
                key={painel.chave}
                rotas={rotasAtivas}
                cronogramas={cronogramas}
                rotaInicial={painel.rotaId}
                diasIniciais={painel.dias}
                salvando={salvando}
                onEnviar={criar}
              />
            )}

            {painel.modo === 'editar' && (
              <FormEditarCronograma
                key={painel.chave}
                cronograma={painel.cronograma}
                rotas={rotas}
                cronogramas={cronogramas}
                salvando={salvando}
                onSalvar={salvarEdicao}
                onAlterarStatus={pedirAlteracaoStatus}
              />
            )}

            {painel.modo === 'lote' && (
              <FormHorarioLote
                key={painel.chave}
                rotasSelecionadas={linhasSelecionadas.map((linha) => linha.rota)}
                quantidade={idsSelecionados.length}
                salvando={salvando}
                onEnviar={alterarLote}
              />
            )}
          </PainelLateral>
        )}
      </div>

      <DialogoConfirmacao
        aberto={confirmacao?.tipo === 'status'}
        titulo="Desativar este horário?"
        textoConfirmar="Desativar horário"
        textoCancelar="Manter ativo"
        perigo
        processando={salvando}
        onConfirmar={() => executarStatus(confirmacao.cronograma, false)}
        onCancelar={() => setConfirmacao(null)}
      >
        {confirmacao?.tipo === 'status' && (
          <p>
            <strong>{nomeRota(confirmacao.cronograma.rotaId)}</strong>, na{' '}
            {nomeDia(confirmacao.cronograma.diaSemana)}, das{' '}
            {horaCurta(confirmacao.cronograma.horarioInicio)} às{' '}
            {horaCurta(confirmacao.cronograma.horarioFim)}. Os moradores deixam
            de ver este horário na consulta e de receber lembrete para ele.
            Você pode reativar depois.
          </p>
        )}
      </DialogoConfirmacao>

      <DialogoConfirmacao
        aberto={confirmacao?.tipo === 'lote'}
        titulo={`Desativar ${idsSelecionados.length} horários?`}
        textoConfirmar="Desativar horários"
        textoCancelar="Manter ativos"
        perigo
        processando={salvando}
        onConfirmar={desativarLote}
        onCancelar={() => setConfirmacao(null)}
      >
        <p>
          Todos os horários ativos de{' '}
          {linhasSelecionadas.map((linha) => linha.rota.nome).join(', ')}{' '}
          deixam de aparecer na consulta e de gerar lembretes. Você pode
          reativar cada um depois.
        </p>
      </DialogoConfirmacao>
    </div>
  )
}

export default CronogramasAdminPage

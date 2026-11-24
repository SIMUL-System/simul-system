import { useEffect, useState } from 'react'

import Alerta from '../../components/Alerta'
import DialogoConfirmacao from '../../components/admin/DialogoConfirmacao'
import PainelLateral from '../../components/admin/PainelLateral'
import FormRota from '../../components/admin/rota/FormRota'
import TabelaRotas from '../../components/admin/rota/TabelaRotas'

import { listarAreasAtendidas } from '../../services/adminAreaService'
import { listarCronogramas } from '../../services/adminCronogramaService'
import {
  alterarStatusRota,
  atualizarRota,
  criarRota,
  listarRotas,
} from '../../services/adminRotaService'

import { resumirColetaDaRota } from '../../utils/areas'
import { comoLista, ordenarTexto, semAcento } from '../../utils/texto'

/** Admin: rotas, com ativação e confirmação ao desativar. */
function RotasAdminPage() {
  const [rotas, setRotas] = useState([])
  const [areas, setAreas] = useState([])
  const [cronogramas, setCronogramas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState('')
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState('todas')
  const [mensagem, setMensagem] = useState(null)
  const [painel, setPainel] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [alterandoId, setAlterandoId] = useState(null)
  const [confirmacao, setConfirmacao] = useState(null)

  useEffect(() => {
    let ativo = true

    Promise.all([listarRotas(), listarAreasAtendidas(), listarCronogramas()])
      .then(([dadosRotas, dadosAreas, dadosCronogramas]) => {
        if (!ativo) return
        setRotas(comoLista(dadosRotas))
        setAreas(comoLista(dadosAreas))
        setCronogramas(comoLista(dadosCronogramas))
      })
      .catch((error) => {
        if (ativo) setErroCarga(error.message || 'Não foi possível carregar as rotas.')
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [])

  async function recarregarRotas() {
    const dados = comoLista(await listarRotas())
    setRotas(dados)
    return dados
  }

  function quantidadeAreas(rotaId) {
    return areas.filter((area) => area.rotaId === rotaId).length
  }

  const termo = semAcento(busca.trim())
  const linhas = rotas
    .filter((rota) => !termo || semAcento(rota.nome).includes(termo))
    .filter((rota) => {
      if (situacao === 'ativas') return rota.ativo
      if (situacao === 'inativas') return !rota.ativo
      return true
    })
    .sort((a, b) => ordenarTexto(a.nome, b.nome))
    .map((rota) => ({
      rota,
      quantidadeAreas: quantidadeAreas(rota.id),
      coleta: resumirColetaDaRota(cronogramas, rota.id).replace(/^Coleta: /, ''),
    }))

  const totalAtivas = rotas.filter((rota) => rota.ativo).length

  /* ---------- ações ---------- */

  async function salvarRota(dados) {
    const editando = Boolean(painel?.rota)

    setSalvando(true)
    setMensagem(null)

    try {
      if (editando) {
        await atualizarRota(painel.rota.id, dados)
      } else {
        await criarRota(dados)
      }

      await recarregarRotas()
      setPainel(null)
      setMensagem({
        tipo: 'sucesso',
        texto: editando
          ? `Rota “${dados.nome}” atualizada.`
          : `Rota “${dados.nome}” cadastrada. Agora crie os horários em Cronogramas.`,
      })
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Não foi possível salvar a rota.' })
    } finally {
      setSalvando(false)
    }
  }

  function pedirAlteracaoStatus(rota) {
    if (rota.ativo) {
      setConfirmacao(rota)
      return
    }

    executarStatus(rota, true)
  }

  async function executarStatus(rota, ativar) {
    setAlterandoId(rota.id)
    setMensagem(null)

    try {
      await alterarStatusRota(rota.id, ativar)
      await recarregarRotas()
      setMensagem({
        tipo: 'sucesso',
        texto: ativar
          ? `Rota “${rota.nome}” reativada. Os bairros dela voltam a aparecer na consulta.`
          : `Rota “${rota.nome}” desativada.`,
      })
    } catch (error) {
      setMensagem({
        tipo: 'erro',
        texto: error.message || 'Não foi possível alterar a situação da rota.',
      })
    } finally {
      setAlterandoId(null)
      setConfirmacao(null)
    }
  }

  /* ---------- tela ---------- */

  if (carregando) {
    return (
      <div className="carregando" role="status">
        <span className="carregando__spinner" aria-hidden="true" />
        Carregando rotas…
      </div>
    )
  }

  if (erroCarga) {
    return <Alerta tipo="erro">{erroCarga}</Alerta>
  }

  const opcoesSituacao = [
    { valor: 'todas', rotulo: `Todas (${rotas.length})` },
    { valor: 'ativas', rotulo: `Ativas (${totalAtivas})` },
    { valor: 'inativas', rotulo: `Inativas (${rotas.length - totalAtivas})` },
  ]

  const bairrosDaConfirmacao = confirmacao ? quantidadeAreas(confirmacao.id) : 0

  return (
    <div className="admin-pagina">
      <header className="admin-pagina__cabecalho">
        <div>
          <h1 className="admin-pagina__titulo">Rotas</h1>
          <p className="admin-pagina__texto">
            Uma rota reúne os bairros que têm a mesma coleta. Os horários ficam em Cronogramas; os
            bairros, em Áreas atendidas.
          </p>
        </div>

        <div className="admin-pagina__acoes">
          <button
            type="button"
            className="botao botao--primario"
            onClick={() => {
              setMensagem(null)
              setPainel({ chave: `nova-${Date.now()}` })
            }}
          >
            Nova rota
          </button>
        </div>
      </header>

      {mensagem && <Alerta tipo={mensagem.tipo}>{mensagem.texto}</Alerta>}

      <div className={`admin-area ${painel ? 'admin-area--com-painel' : ''}`}>
        <section className="admin-quadro" aria-label="Lista de rotas">
          <div className="admin-filtros">
            <div className="campo-ds admin-filtros__busca">
              <label className="campo-ds__rotulo" htmlFor="rotas-busca">
                Buscar rota
              </label>
              <input
                id="rotas-busca"
                type="search"
                className="campo-ds__controle"
                placeholder="Nome da rota"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
            </div>

            <div
              className="atalhos admin-filtros__mapa"
              role="group"
              aria-label="Filtrar por situação"
            >
              {opcoesSituacao.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  className="atalho"
                  aria-pressed={situacao === opcao.valor}
                  onClick={() => setSituacao(opcao.valor)}
                >
                  {opcao.rotulo}
                </button>
              ))}
            </div>
          </div>

          <TabelaRotas
            linhas={linhas}
            rotaAberta={painel?.rota?.id ?? null}
            alterandoId={alterandoId}
            onEditar={(rota) => {
              setMensagem(null)
              setPainel({ rota, chave: `editar-${rota.id}` })
            }}
            onAlternarStatus={pedirAlteracaoStatus}
          />
        </section>

        {painel && (
          <PainelLateral
            titulo={painel.rota ? 'Editar rota' : 'Nova rota'}
            chave={painel.chave}
            onFechar={() => setPainel(null)}
          >
            <FormRota
              key={painel.chave}
              rota={painel.rota ?? null}
              rotas={rotas}
              salvando={salvando}
              onEnviar={salvarRota}
            />
          </PainelLateral>
        )}
      </div>

      <DialogoConfirmacao
        aberto={Boolean(confirmacao)}
        titulo="Desativar esta rota?"
        textoConfirmar="Desativar rota"
        textoCancelar="Manter ativa"
        perigo
        processando={alterandoId !== null}
        onConfirmar={() => executarStatus(confirmacao, false)}
        onCancelar={() => setConfirmacao(null)}
      >
        {confirmacao && (
          <p>
            <strong>{confirmacao.nome}</strong>
            {bairrosDaConfirmacao > 0
              ? ` atende ${bairrosDaConfirmacao === 1 ? '1 bairro' : `${bairrosDaConfirmacao} bairros`}. Enquanto estiver inativa, esses bairros não aparecem na consulta e quem escolheu esta rota não recebe lembretes.`
              : ' não tem bairros ligados a ela.'}{' '}
            Nada é apagado: ao reativar, tudo volta como estava.
          </p>
        )}
      </DialogoConfirmacao>
    </div>
  )
}

export default RotasAdminPage

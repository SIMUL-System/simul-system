import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import Alerta from '../../components/Alerta'
import Icone from '../../components/Icone'
import DialogoConfirmacao from '../../components/admin/DialogoConfirmacao'
import EditorRota from '../../components/admin/rota/EditorRota'

import { listarAreasAtendidas } from '../../services/adminAreaService'
import { listarCronogramas } from '../../services/adminCronogramaService'
import { alterarStatusRota, listarRotas } from '../../services/adminRotaService'

import useCidadeAdmin from '../../hooks/useCidadeAdmin'

import { nomeRotaCurto, resumirColetaDaRota } from '../../utils/areas'
import { ativosDaRota, dadosTurno, turnosDaRota } from '../../utils/cronogramas'
import { comoLista, ordenarTexto } from '../../utils/texto'

/** "Diurna", "Noturna", "Diurna e noturna"… pelo conjunto de turnos da rota. */
function rotuloTurnos(turnos) {
  if (turnos.length === 0) return 'Sem dia de coleta'
  if (turnos.length === 1) {
    return turnos[0] === 'NAO_INFORMADO'
      ? 'Turno não informado'
      : dadosTurno(turnos[0]).rotulo.replace(/o$/, 'a')
  }
  return turnos
    .map((turno) => (turno === 'NAO_INFORMADO' ? 'sem turno' : dadosTurno(turno).adjetivo))
    .join(' e ')
    .replace(/^./, (letra) => letra.toUpperCase())
}

/**
 * Admin: rotas da cidade escolhida no painel. Cada rota é um padrão de coleta
 * (dias + turno) e os bairros ligados a ela herdam esses dias. A lista mostra
 * as rotas em cartões; "?rota=ID" abre o editor e "?nova=1" o cadastro.
 */
function RotasAdminPage() {
  const { cidade, recarregarCidades } = useCidadeAdmin()
  const [parametros, setParametros] = useSearchParams()
  const [rotas, setRotas] = useState([])
  const [areas, setAreas] = useState([])
  const [cronogramas, setCronogramas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState('')
  const [mensagem, setMensagem] = useState(null)
  const [alterandoId, setAlterandoId] = useState(null)
  const [confirmacao, setConfirmacao] = useState(null)
  const [mostrarInativas, setMostrarInativas] = useState(false)

  async function carregarTudo() {
    const [dadosRotas, dadosAreas, dadosCronogramas] = await Promise.all([
      listarRotas(cidade.id),
      listarAreasAtendidas(cidade.id),
      listarCronogramas(cidade.id),
    ])

    setRotas(comoLista(dadosRotas))
    setAreas(comoLista(dadosAreas))
    setCronogramas(comoLista(dadosCronogramas))

    // Atualiza os números do seletor de cidade (falha aqui não atrapalha a tela).
    recarregarCidades().catch(() => {})
  }

  useEffect(() => {
    let ativo = true

    Promise.all([
      listarRotas(cidade.id),
      listarAreasAtendidas(cidade.id),
      listarCronogramas(cidade.id),
    ])
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
  }, [cidade.id])

  const idAberto = Number(parametros.get('rota')) || null
  const criando = parametros.get('nova') === '1'
  const rotaAberta = rotas.find((rota) => rota.id === idAberto) ?? null

  function abrir(novosParametros) {
    setMensagem(null)
    setParametros(novosParametros)
    window.scrollTo({ top: 0 })
  }

  function quantidadeAreas(rotaId) {
    return areas.filter((area) => area.rotaId === rotaId).length
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
      await carregarTudo()
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

  if (criando || rotaAberta) {
    return (
      <>
        {mensagem && <Alerta tipo={mensagem.tipo}>{mensagem.texto}</Alerta>}

        <EditorRota
          key={rotaAberta?.id ?? 'nova'}
          rota={rotaAberta}
          cidade={cidade}
          rotas={rotas}
          areas={areas}
          cronogramas={cronogramas}
          onVoltar={() => abrir({})}
          onRecarregar={carregarTudo}
          onCriada={(id, texto, tipo = 'sucesso') => {
            setParametros({ rota: String(id) })
            setMensagem({ tipo, texto })
          }}
        />
      </>
    )
  }

  const inativas = rotas.filter((rota) => !rota.ativo)
  // Se a fonte da cidade inteira não diz o tipo, um aviso só basta (em vez de um selo por cartão).
  const todasSemTipo =
    rotas.length > 0 && rotas.every((rota) => rota.tipoColeta === 'NAO_INFORMADO')
  const visiveis = rotas
    .filter((rota) => mostrarInativas || rota.ativo)
    .sort((a, b) => Number(b.ativo) - Number(a.ativo) || ordenarTexto(a.nome, b.nome))
  const bairrosDaConfirmacao = confirmacao ? quantidadeAreas(confirmacao.id) : 0

  return (
    <div className="admin-pagina">
      <header className="admin-pagina__cabecalho">
        <div>
          <h1 className="admin-pagina__titulo">Rotas de {cidade.nome}</h1>
          <p className="admin-pagina__texto">
            Cada rota é um padrão de coleta: os mesmos dias e turnos. Os bairros ligados a uma rota
            seguem esses dias na consulta e nos lembretes. Só bairros de {cidade.nome} entram nas
            rotas desta cidade.
          </p>
        </div>

        <div className="admin-pagina__acoes">
          <button
            type="button"
            className="botao botao--primario"
            onClick={() => abrir({ nova: '1' })}
          >
            Nova rota
          </button>
        </div>
      </header>

      {mensagem && <Alerta tipo={mensagem.tipo}>{mensagem.texto}</Alerta>}

      {todasSemTipo && (
        <Alerta tipo="info">
          A fonte de {cidade.nome} informa dias e turnos, mas não diz se a coleta é a seletiva. As
          rotas estão com o tipo “não informado” e a consulta avisa o morador. Quando a prefeitura
          confirmar, mude o tipo em cada rota.
        </Alerta>
      )}

      <ol className="passos-admin" aria-label="Como cadastrar a coleta de um bairro">
        <li>
          <strong>Escolha a rota</strong> com os dias e o turno do bairro (ou crie uma, se nenhuma
          servir).
        </li>
        <li>
          <strong>Adicione o bairro</strong> na rota. Se ele estava em outra, é movido.
        </li>
        <li>
          <strong>Desenhe o contorno</strong> em Áreas atendidas para aparecer no mapa.
        </li>
      </ol>

      <ul className="cartoes-rota" aria-label="Rotas">
        {visiveis.map((rota) => {
          const ativos = ativosDaRota(cronogramas, rota.id)
          const total = quantidadeAreas(rota.id)
          const turnos = turnosDaRota(cronogramas, rota.id)
          const noturna = turnos.length === 1 && turnos[0] === 'NOTURNO'

          return (
            <li
              key={rota.id}
              className={`cartao-rota${rota.ativo ? '' : ' cartao-rota--inativa'}${
                noturna ? ' cartao-rota--noturna' : ''
              }`}
            >
              <div className="cartao-rota__topo">
                <span className="cartao-rota__periodo">
                  <Icone
                    nome={
                      noturna
                        ? 'lua'
                        : turnos.length === 1 && turnos[0] === 'DIURNO'
                          ? 'sol'
                          : 'relogio'
                    }
                    tamanho={16}
                  />
                  {rotuloTurnos(turnos)}
                </span>

                {!rota.ativo && <span className="selo selo--inativo">Inativa</span>}
                {rota.tipoColeta === 'NAO_INFORMADO' && !todasSemTipo && (
                  <span
                    className="selo selo--pendente"
                    title="A fonte não diz se é a coleta seletiva"
                  >
                    Tipo não informado
                  </span>
                )}
              </div>

              <h2 className="cartao-rota__nome">{nomeRotaCurto(rota.nome, cidade.nome)}</h2>

              <p className="cartao-rota__coleta">
                <Icone nome="calendario" tamanho={16} />
                {ativos.length === 0
                  ? 'Nenhum dia de coleta definido'
                  : resumirColetaDaRota(cronogramas, rota.id).replace(/^Coleta: /, '')}
              </p>

              <p className="cartao-rota__bairros">
                <Icone nome="local" tamanho={16} />
                {total === 0 ? (
                  <span className="cartao-rota__alerta">Nenhum bairro</span>
                ) : total === 1 ? (
                  '1 bairro'
                ) : (
                  `${total} bairros`
                )}
              </p>

              <div className="cartao-rota__acoes">
                <button
                  type="button"
                  className="botao botao--primario"
                  onClick={() => abrir({ rota: String(rota.id) })}
                  aria-label={`Abrir a rota ${rota.nome}`}
                >
                  Abrir rota
                </button>

                <button
                  type="button"
                  className="botao botao--secundario"
                  onClick={() => pedirAlteracaoStatus(rota)}
                  disabled={alterandoId === rota.id}
                  aria-label={`${rota.ativo ? 'Desativar' : 'Reativar'} a rota ${rota.nome}`}
                >
                  {alterandoId === rota.id ? 'Aguarde…' : rota.ativo ? 'Desativar' : 'Reativar'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {visiveis.length === 0 && (
        <p className="admin-vazio">
          Nenhuma rota ativa em {cidade.nome}. Cadastre uma em “Nova rota”.
        </p>
      )}

      {inativas.length > 0 && (
        <button
          type="button"
          className="botao-link"
          onClick={() => setMostrarInativas((atual) => !atual)}
          aria-expanded={mostrarInativas}
        >
          {mostrarInativas
            ? 'Esconder rotas inativas'
            : `Mostrar ${inativas.length === 1 ? '1 rota inativa' : `${inativas.length} rotas inativas`}`}
        </button>
      )}

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

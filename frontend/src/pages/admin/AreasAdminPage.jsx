import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import Alerta from '../../components/Alerta'
import PainelLateral from '../../components/admin/PainelLateral'
import EditorContorno from '../../components/admin/area/EditorContorno'
import FormArea from '../../components/admin/area/FormArea'
import ImportarContornos from '../../components/admin/area/ImportarContornos'
import TabelaAreas from '../../components/admin/area/TabelaAreas'

import {
  atualizarAreaAtendida,
  criarAreaAtendida,
  listarAreasAtendidas,
} from '../../services/adminAreaService'
import { listarCronogramas } from '../../services/adminCronogramaService'
import { listarRotas } from '../../services/adminRotaService'

import useCidadeAdmin from '../../hooks/useCidadeAdmin'

import { filtrarAreas, nomeRotaCurto } from '../../utils/areas'
import { comoLista, ordenarTexto } from '../../utils/texto'

const POR_PAGINA = 20

/** Admin: bairros da cidade escolhida no painel, com busca, filtros e editor do contorno. */
function AreasAdminPage() {
  const { cidade, recarregarCidades } = useCidadeAdmin()
  const [areas, setAreas] = useState([])
  const [rotas, setRotas] = useState([])
  const [cronogramas, setCronogramas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState('')

  // "/admin/areas?rota=3" ou "?mapa=sem" (links de Rotas e da Visão geral)
  // já abrem a lista filtrada.
  const [parametros] = useSearchParams()
  const [filtros, setFiltros] = useState({
    busca: '',
    rotaId: parametros.get('rota') ?? '',
    mapa: ['sem', 'com'].includes(parametros.get('mapa')) ? parametros.get('mapa') : 'todas',
  })
  const [pagina, setPagina] = useState(1)
  const [mensagem, setMensagem] = useState(null)
  const [painel, setPainel] = useState(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    let ativo = true

    Promise.all([
      listarAreasAtendidas(cidade.id),
      listarRotas(cidade.id),
      listarCronogramas(cidade.id),
    ])
      .then(([dadosAreas, dadosRotas, dadosCronogramas]) => {
        if (!ativo) return
        setAreas(comoLista(dadosAreas))
        setRotas(comoLista(dadosRotas))
        setCronogramas(comoLista(dadosCronogramas))
      })
      .catch((error) => {
        if (ativo) {
          setErroCarga(error.message || 'Não foi possível carregar as áreas atendidas.')
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [cidade.id])

  async function recarregarAreas() {
    const dados = comoLista(await listarAreasAtendidas(cidade.id))
    setAreas(dados)
    recarregarCidades().catch(() => {})
    return dados
  }

  const rotasOrdenadas = [...rotas].sort((a, b) => ordenarTexto(a.nome, b.nome))
  const semDesenho = areas.filter((area) => !area.possuiGeometria).length
  const filtradas = filtrarAreas(areas, filtros)

  function mudarFiltro(campo, valor) {
    setFiltros((atuais) => ({ ...atuais, [campo]: valor }))
    setPagina(1)
  }

  /* ---------- painel ---------- */

  function abrirNova() {
    setMensagem(null)
    setPainel({ modo: 'nova', chave: `nova-${Date.now()}` })
  }

  function abrirEdicao(area) {
    setMensagem(null)
    setPainel({ modo: 'editar', area, chave: `editar-${area.id}` })
  }

  function abrirImportacao() {
    setMensagem(null)
    setPainel({ modo: 'importar', chave: 'importar' })
  }

  function abrirContorno() {
    setPainel((atual) => ({ ...atual, modo: 'contorno', chave: `contorno-${atual.area.id}` }))
  }

  /* ---------- ações ---------- */

  async function salvarArea(dados) {
    const editando = painel.modo === 'editar'

    setSalvando(true)
    setMensagem(null)

    try {
      const salva = editando
        ? await atualizarAreaAtendida(painel.area.id, dados)
        : await criarAreaAtendida(dados)

      const atualizadas = await recarregarAreas()
      const idSalvo = salva?.id ?? painel.area?.id
      const areaSalva = atualizadas.find((area) => area.id === idSalvo)

      setMensagem({
        tipo: 'sucesso',
        texto: editando
          ? `${dados.bairro} atualizado.`
          : `${dados.bairro} cadastrado. Agora você pode desenhar o contorno no mapa.`,
      })

      // Após cadastrar, o painel continua aberto na área nova,
      // pronto para desenhar o contorno.
      setPainel(
        areaSalva
          ? { modo: 'editar', area: areaSalva, chave: `editar-${areaSalva.id}-salva` }
          : null,
      )
    } catch (error) {
      setMensagem({
        tipo: 'erro',
        texto: error.message || 'Não foi possível salvar a área.',
      })
    } finally {
      setSalvando(false)
    }
  }

  async function contornoSalvo(area) {
    let atualizada = area

    try {
      const atualizadas = await recarregarAreas()
      atualizada = atualizadas.find((item) => item.id === area.id) ?? area
    } catch {
      // A lista antiga continua na tela; o contorno já foi salvo.
    }

    setMensagem({ tipo: 'sucesso', texto: `Contorno de ${area.bairro} salvo.` })
    setPainel({ modo: 'editar', area: atualizada, chave: `editar-${area.id}-contorno` })
  }

  /* ---------- tela ---------- */

  if (carregando) {
    return (
      <div className="carregando" role="status">
        <span className="carregando__spinner" aria-hidden="true" />
        Carregando áreas atendidas…
      </div>
    )
  }

  if (erroCarga) {
    return <Alerta tipo="erro">{erroCarga}</Alerta>
  }

  const tituloPainel = {
    nova: 'Nova área',
    editar: painel?.area ? `Editar ${painel.area.bairro}` : 'Editar área',
    contorno: painel?.area ? `Contorno de ${painel.area.bairro}` : 'Contorno',
    importar: 'Contornos do OpenStreetMap',
  }[painel?.modo]

  const opcoesMapa = [
    { valor: 'todas', rotulo: `Todas (${areas.length})` },
    { valor: 'sem', rotulo: `Sem desenho (${semDesenho})` },
    { valor: 'com', rotulo: `Desenhadas (${areas.length - semDesenho})` },
  ]

  return (
    <div className="admin-pagina">
      <header className="admin-pagina__cabecalho">
        <div>
          <h1 className="admin-pagina__titulo">Áreas atendidas em {cidade.nome}</h1>
          <p className="admin-pagina__texto">
            {areas.length === 1 ? '1 bairro cadastrado' : `${areas.length} bairros cadastrados`}.
            Aqui você cuida do contorno de cada bairro no mapa. Para adicionar vários bairros ou
            trocar a rota deles, use a tela Rotas.
          </p>
        </div>

        <div className="admin-pagina__acoes">
          {semDesenho > 0 && (
            <button type="button" className="botao botao--secundario" onClick={abrirImportacao}>
              Buscar contornos no mapa
            </button>
          )}
          <button type="button" className="botao botao--primario" onClick={abrirNova}>
            Nova área
          </button>
        </div>
      </header>

      {mensagem && <Alerta tipo={mensagem.tipo}>{mensagem.texto}</Alerta>}

      {semDesenho > 0 && painel?.modo !== 'importar' && (
        <Alerta tipo="info">
          {semDesenho === 1 ? '1 bairro ainda não tem' : `${semDesenho} bairros ainda não têm`}{' '}
          contorno salvo no SIMUL. Na consulta, o mapa tenta achar esses bairros no OpenStreetMap a
          cada visita.{' '}
          <button type="button" className="botao-link" onClick={abrirImportacao}>
            Buscar e salvar os contornos de uma vez
          </button>
        </Alerta>
      )}

      <div
        className={[
          'admin-area',
          painel ? 'admin-area--com-painel' : '',
          painel?.modo === 'contorno' ? 'admin-area--painel-largo' : '',
        ].join(' ')}
      >
        <section className="admin-quadro" aria-label="Lista de áreas atendidas">
          <div className="admin-filtros">
            <div className="campo-ds admin-filtros__busca">
              <label className="campo-ds__rotulo" htmlFor="areas-busca">
                Buscar bairro
              </label>
              <input
                id="areas-busca"
                type="search"
                className="campo-ds__controle"
                placeholder="Digite parte do nome"
                value={filtros.busca}
                onChange={(event) => mudarFiltro('busca', event.target.value)}
              />
            </div>

            <div className="campo-ds">
              <label className="campo-ds__rotulo" htmlFor="areas-rota">
                Rota
              </label>
              <select
                id="areas-rota"
                className="campo-ds__controle admin-filtros__select"
                value={filtros.rotaId}
                onChange={(event) => mudarFiltro('rotaId', event.target.value)}
              >
                <option value="">Todas as rotas</option>
                {rotasOrdenadas.map((rota) => (
                  <option key={rota.id} value={rota.id}>
                    {nomeRotaCurto(rota.nome, cidade.nome)}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="atalhos admin-filtros__mapa"
              role="group"
              aria-label="Filtrar pelo contorno no mapa"
            >
              {opcoesMapa.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  className="atalho"
                  aria-pressed={filtros.mapa === opcao.valor}
                  onClick={() => mudarFiltro('mapa', opcao.valor)}
                >
                  {opcao.rotulo}
                </button>
              ))}
            </div>
          </div>

          <p className="visualmente-oculto" aria-live="polite">
            {filtradas.length === 1 ? '1 área encontrada' : `${filtradas.length} áreas encontradas`}
          </p>

          <TabelaAreas
            areas={filtradas}
            pagina={pagina}
            porPagina={POR_PAGINA}
            areaAberta={painel?.area?.id ?? null}
            mostrarCidade={false}
            onEditar={abrirEdicao}
            onMudarPagina={setPagina}
          />
        </section>

        {painel && (
          <PainelLateral
            titulo={tituloPainel}
            chave={painel.chave}
            onFechar={() => setPainel(null)}
          >
            {(painel.modo === 'nova' || painel.modo === 'editar') && (
              <FormArea
                key={painel.chave}
                area={painel.area ?? null}
                areas={areas}
                rotas={rotasOrdenadas}
                cronogramas={cronogramas}
                cidade={cidade.nome}
                salvando={salvando}
                onEnviar={salvarArea}
                onAbrirContorno={abrirContorno}
              />
            )}

            {painel.modo === 'importar' && (
              <ImportarContornos areas={areas} onConcluido={recarregarAreas} />
            )}

            {painel.modo === 'contorno' && (
              <EditorContorno
                key={painel.chave}
                area={painel.area}
                onSalvo={contornoSalvo}
                onCancelar={() => abrirEdicao(painel.area)}
              />
            )}
          </PainelLateral>
        )}
      </div>
    </div>
  )
}

export default AreasAdminPage

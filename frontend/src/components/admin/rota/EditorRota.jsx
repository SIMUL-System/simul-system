import { useState } from 'react'
import { Link } from 'react-router-dom'

import Alerta from '../../Alerta'
import Icone from '../../Icone'
import DialogoConfirmacao from '../DialogoConfirmacao'
import SemanaColeta from './SemanaColeta'
import SeletorBairros from './SeletorBairros'

import {
  adicionarBairrosNaRota,
  atualizarRota,
  criarRota,
} from '../../../services/adminRotaService'
import { definirSemanaDaRota } from '../../../services/adminCronogramaService'

import { nomeRotaCurto } from '../../../utils/areas'
import {
  dadosTurno,
  erroDaSemana,
  mesmaSemana,
  nomeDia,
  semanaDaRota,
  semanaParaApi,
  semanaVazia,
  TURNOS,
} from '../../../utils/cronogramas'
import { normalizarTexto, ordenarTexto, semAcento } from '../../../utils/texto'

const LIMITE_NOME = 120
const LIMITE_DESCRICAO = 255

const TIPOS_COLETA = [
  { valor: 'SELETIVA', rotulo: 'Coleta seletiva' },
  { valor: 'CONVENCIONAL', rotulo: 'Coleta convencional (lixo comum)' },
  { valor: 'NAO_INFORMADO', rotulo: 'Tipo não informado pela fonte' },
]

/** Pares "dia + turno" que saem da semana: "segunda-feira (noturno)". */
function coletasRemovidas(antes, depois) {
  return TURNOS.flatMap((turno) =>
    antes[turno.valor].dias
      .filter((dia) => !depois[turno.valor].dias.includes(dia))
      .map((dia) => `${nomeDia(dia)} (${dadosTurno(turno.valor).rotulo.toLowerCase()})`),
  )
}

/**
 * Tela de uma rota em três blocos independentes, cada um com o próprio botão
 * de salvar: 1) dias e turnos; 2) bairros atendidos; 3) nome, tipo e descrição.
 * Rota nova: nome e semana são salvos juntos e, depois, os bairros.
 * A rota é sempre da cidade escolhida no painel; só bairros dessa cidade
 * podem entrar nela.
 */
function EditorRota({ rota, cidade, rotas, areas, cronogramas, onVoltar, onRecarregar, onCriada }) {
  const nova = !rota
  const nomeCidade = rota?.cidade ?? cidade?.nome ?? ''

  const areasDaRota = nova
    ? []
    : areas
        .filter((area) => area.rotaId === rota.id)
        .sort((a, b) => ordenarTexto(a.bairro, b.bairro))
  const salva = nova
    ? { semana: semanaVazia(), horariosDiferentes: [] }
    : semanaDaRota(cronogramas, rota.id)
  const semanaSalva = salva.semana

  // Bloco 1
  const [nome, setNome] = useState(rota?.nome ?? '')
  const [descricao, setDescricao] = useState(rota?.descricao ?? '')
  const [tipoColeta, setTipoColeta] = useState(rota?.tipoColeta ?? 'SELETIVA')
  const [erroNome, setErroNome] = useState('')

  // Bloco 2
  const [semana, setSemana] = useState(semanaSalva)
  const [erroSemana, setErroSemana] = useState('')

  // Bloco 3
  const [selecionados, setSelecionados] = useState([])
  const [filtroBairros, setFiltroBairros] = useState('')

  const [salvando, setSalvando] = useState(null)
  const [retorno, setRetorno] = useState({})
  const [confirmarSaida, setConfirmarSaida] = useState(false)

  const dadosAlterados =
    normalizarTexto(nome) !== (rota?.nome ?? '') ||
    (descricao.trim() || null) !== (rota?.descricao || null) ||
    tipoColeta !== (rota?.tipoColeta ?? 'SELETIVA')
  const semanaAlterada = !mesmaSemana(semana, semanaSalva)
  const temAlteracao = dadosAlterados || semanaAlterada || selecionados.length > 0

  // Só bairros da mesma cidade da rota podem ser movidos para ela.
  const opcoesBairros = areas
    .filter((area) => semAcento(area.cidade) === semAcento(nomeCidade) && area.rotaId !== rota?.id)
    .map((area) => ({ bairro: area.bairro, rotaNome: nomeRotaCurto(area.nomeRota, area.cidade) }))
    .sort((a, b) => ordenarTexto(a.bairro, b.bairro))

  const removidas = nova ? [] : coletasRemovidas(semanaSalva, semana)

  function avisar(bloco, tipo, texto) {
    setRetorno((atual) => ({ ...atual, [bloco]: { tipo, texto } }))
  }

  function validarNome() {
    const limpo = normalizarTexto(nome)

    if (!limpo) {
      return 'Informe o nome da rota.'
    }

    const repetida = rotas.some(
      (item) => item.id !== rota?.id && semAcento(item.nome.trim()) === semAcento(limpo),
    )

    return repetida ? 'Já existe uma rota com esse nome.' : ''
  }

  async function salvarDados() {
    const erro = validarNome()
    setErroNome(erro)
    if (erro) return

    setSalvando('dados')
    try {
      await atualizarRota(rota.id, {
        nome: normalizarTexto(nome),
        descricao: descricao.trim() || null,
        cidadeId: rota.cidadeId,
        tipoColeta,
      })
      await onRecarregar()
      avisar('dados', 'sucesso', 'Nome, tipo de coleta e descrição salvos.')
    } catch (error) {
      avisar('dados', 'erro', error.message || 'Não foi possível salvar.')
    } finally {
      setSalvando(null)
    }
  }

  async function salvarSemana() {
    const erro = erroDaSemana(semana)
    setErroSemana(erro)
    if (erro) return

    setSalvando('semana')
    try {
      await definirSemanaDaRota(rota.id, semanaParaApi(semana))
      await onRecarregar()
      avisar(
        'semana',
        'sucesso',
        'Dias e turnos salvos. A consulta e os lembretes já usam a nova semana.',
      )
    } catch (error) {
      avisar('semana', 'erro', error.message || 'Não foi possível salvar os dias e os turnos.')
    } finally {
      setSalvando(null)
    }
  }

  async function cadastrarRotaNova() {
    const erro = validarNome()
    const erroDias = erroDaSemana(semana)
    setErroNome(erro)
    setErroSemana(erroDias)
    if (erro || erroDias) return

    setSalvando('nova')
    let criada = null

    try {
      criada = await criarRota({
        nome: normalizarTexto(nome),
        descricao: descricao.trim() || null,
        cidadeId: cidade.id,
        tipoColeta,
      })
      await definirSemanaDaRota(criada.id, semanaParaApi(semana))
      await onRecarregar()
      onCriada(
        criada.id,
        `Rota cadastrada em ${cidade.nome} com os dias e os turnos. Agora adicione os bairros.`,
      )
    } catch (error) {
      if (criada) {
        // A rota existe, mas a semana falhou: abre a rota para tentar de novo.
        await onRecarregar()
        onCriada(
          criada.id,
          `A rota foi cadastrada, mas os dias e os turnos não foram salvos: ${error.message}`,
          'erro',
        )
      } else {
        avisar('nova', 'erro', error.message || 'Não foi possível cadastrar a rota.')
      }
    } finally {
      setSalvando(null)
    }
  }

  async function salvarBairros() {
    setSalvando('bairros')
    try {
      const resultado = await adicionarBairrosNaRota(
        rota.id,
        nomeCidade,
        selecionados.map((item) => item.bairro),
      )
      await onRecarregar()
      setSelecionados([])

      const partes = []
      if (resultado?.cadastrados?.length)
        partes.push(`${resultado.cadastrados.length} cadastrado(s)`)
      if (resultado?.movidos?.length)
        partes.push(`${resultado.movidos.length} movido(s) de outra rota`)
      if (resultado?.jaEstavamNaRota?.length)
        partes.push(`${resultado.jaEstavamNaRota.length} já estava(m) nesta rota`)

      avisar(
        'bairros',
        'sucesso',
        `Bairros salvos: ${partes.join(', ') || 'nenhuma mudança'}.${
          resultado?.cadastrados?.length
            ? ' Os bairros novos já aparecem na consulta; desenhe o contorno deles em Áreas atendidas.'
            : ''
        }`,
      )
    } catch (error) {
      avisar('bairros', 'erro', error.message || 'Não foi possível salvar os bairros.')
    } finally {
      setSalvando(null)
    }
  }

  function voltar() {
    if (temAlteracao) {
      setConfirmarSaida(true)
    } else {
      onVoltar()
    }
  }

  const termoBairros = semAcento(filtroBairros.trim())
  const bairrosVisiveis = termoBairros
    ? areasDaRota.filter((area) => semAcento(area.bairro).includes(termoBairros))
    : areasDaRota
  const semContorno = areasDaRota.filter((area) => !area.possuiGeometria).length
  const movidos = selecionados.filter((item) => !item.novo)

  function mostrarRetorno(bloco) {
    const atual = retorno[bloco]
    return atual ? <Alerta tipo={atual.tipo}>{atual.texto}</Alerta> : null
  }

  const camposDados = (
    <>
      <div className="campo-ds">
        <label className="campo-ds__rotulo" htmlFor="rota-nome">
          Nome da rota
        </label>
        <input
          id="rota-nome"
          className="campo-ds__controle"
          value={nome}
          maxLength={LIMITE_NOME}
          onChange={(event) => setNome(event.target.value)}
          aria-invalid={Boolean(erroNome)}
          aria-describedby={erroNome ? 'rota-nome-erro' : 'rota-nome-dica'}
          disabled={Boolean(salvando)}
        />
        {erroNome ? (
          <p id="rota-nome-erro" className="campo-ds__erro" role="alert">
            <Icone nome="erro" tamanho={16} />
            {erroNome}
          </p>
        ) : (
          <p id="rota-nome-dica" className="campo-ds__dica">
            Use cidade, turno e dias, como “{nomeCidade || 'Cidade'} - Diurna (seg, qua e sex)”.
          </p>
        )}
      </div>

      <div className="campo-ds">
        <label className="campo-ds__rotulo" htmlFor="rota-tipo">
          Tipo de coleta
        </label>
        <select
          id="rota-tipo"
          className="campo-ds__controle"
          value={tipoColeta}
          onChange={(event) => setTipoColeta(event.target.value)}
          aria-describedby="rota-tipo-dica"
          disabled={Boolean(salvando)}
        >
          {TIPOS_COLETA.map((tipo) => (
            <option key={tipo.valor} value={tipo.valor}>
              {tipo.rotulo}
            </option>
          ))}
        </select>
        <p id="rota-tipo-dica" className="campo-ds__dica">
          Escolha “não informado” quando a prefeitura não disser se é a coleta seletiva. A consulta
          avisa o morador.
        </p>
      </div>

      <div className="campo-ds">
        <label className="campo-ds__rotulo" htmlFor="rota-descricao">
          Descrição <span className="campo-ds__opcional">(opcional)</span>
        </label>
        <textarea
          id="rota-descricao"
          className="campo-ds__controle campo-ds__controle--texto"
          rows={2}
          value={descricao}
          maxLength={LIMITE_DESCRICAO}
          onChange={(event) => setDescricao(event.target.value)}
          aria-describedby="rota-descricao-contador"
          disabled={Boolean(salvando)}
        />
        <p id="rota-descricao-contador" className="campo-ds__dica">
          {descricao.length} de {LIMITE_DESCRICAO} caracteres
        </p>
      </div>
    </>
  )

  const camposSemana = (
    <>
      <SemanaColeta
        idBase="rota-semana"
        semana={semana}
        onAlterar={(nova) => {
          setSemana(nova)
          setErroSemana('')
        }}
        disabled={Boolean(salvando)}
      />

      {erroSemana && (
        <p className="campo-ds__erro" role="alert">
          <Icone nome="erro" tamanho={16} />
          {erroSemana}
        </p>
      )}

      {!nova && salva.horariosDiferentes.length > 0 && !semanaAlterada && (
        <Alerta tipo="aviso">
          Esta rota tem dias com horários diferentes no mesmo turno. O editor mostra o horário do
          primeiro dia; ao salvar, todos os dias do turno ficam com ele.
        </Alerta>
      )}

      {removidas.length > 0 && (
        <Alerta tipo="aviso">
          Deixa{removidas.length === 1 ? '' : 'm'} de ter coleta nesta rota: {removidas.join(', ')}.
          Quem tem lembrete aqui não recebe mais aviso nesse
          {removidas.length === 1 ? ' dia' : 's dias'}.
        </Alerta>
      )}
    </>
  )

  return (
    <div className="admin-pagina editor-rota">
      <div className="editor-rota__topo">
        <button type="button" className="botao-link editor-rota__voltar" onClick={voltar}>
          <Icone nome="voltar" tamanho={18} />
          Todas as rotas
        </button>

        <h1 className="admin-pagina__titulo">{nova ? `Nova rota em ${nomeCidade}` : rota.nome}</h1>

        {!nova && (
          <p className="admin-pagina__texto">
            {rota.tipoColeta === 'NAO_INFORMADO' && (
              <span className="selo selo--pendente">Tipo de coleta não informado</span>
            )}
            {rota.tipoColeta === 'CONVENCIONAL' && (
              <span className="selo selo--info">Coleta convencional</span>
            )}{' '}
            {rota.ativo ? (
              <span className="selo selo--ativo">Ativa</span>
            ) : (
              <span className="selo selo--inativo">Inativa: não aparece na consulta</span>
            )}{' '}
            {areasDaRota.length === 1 ? '1 bairro' : `${areasDaRota.length} bairros`} de{' '}
            {nomeCidade} seguem os dias desta rota.
          </p>
        )}

        {!nova && rota.fonte && (
          <p className="campo-ds__dica editor-rota__fonte">
            <Icone nome="info" tamanho={16} />
            Fonte: {rota.fonte}
          </p>
        )}
      </div>

      {nova ? (
        <section className="admin-quadro bloco-rota" aria-labelledby="bloco-nova">
          <h2 id="bloco-nova" className="bloco-rota__titulo">
            <span className="bloco-rota__numero">1</span> Nome, dias e turnos
          </h2>

          <p className="bloco-rota__dica">
            <Icone nome="info" tamanho={18} />A rota será de <strong>{nomeCidade}</strong>. Crie uma
            rota só quando os bairros tiverem dias ou turnos diferentes das rotas que já existem
            nesta cidade.
          </p>

          {camposDados}
          {camposSemana}
          {mostrarRetorno('nova')}

          <button
            type="button"
            className="botao botao--primario bloco-rota__salvar"
            onClick={cadastrarRotaNova}
            disabled={Boolean(salvando)}
          >
            {salvando === 'nova' ? 'Cadastrando…' : 'Cadastrar rota e continuar'}
          </button>

          <p className="campo-ds__dica">Depois de cadastrar, você escolhe os bairros.</p>
        </section>
      ) : (
        <>
          <section className="admin-quadro bloco-rota" aria-labelledby="bloco-semana">
            <h2 id="bloco-semana" className="bloco-rota__titulo">
              <span className="bloco-rota__numero">1</span> Quando o caminhão passa
            </h2>

            <p className="bloco-rota__dica">
              <Icone nome="info" tamanho={18} />
              Todos os bairros desta rota seguem estes dias e turnos. Mudou a coleta de um bairro
              só? Adicione-o em outra rota da cidade em vez de mudar aqui.
            </p>

            {camposSemana}
            {mostrarRetorno('semana')}

            <button
              type="button"
              className="botao botao--primario bloco-rota__salvar"
              onClick={salvarSemana}
              disabled={Boolean(salvando) || !semanaAlterada}
            >
              {salvando === 'semana' ? 'Salvando…' : 'Salvar dias e turnos'}
            </button>
          </section>

          <section className="admin-quadro bloco-rota" aria-labelledby="bloco-bairros">
            <h2 id="bloco-bairros" className="bloco-rota__titulo">
              <span className="bloco-rota__numero">2</span> Bairros atendidos
              <span className="bloco-rota__contagem">{areasDaRota.length}</span>
            </h2>

            {areasDaRota.length === 0 ? (
              <p className="bloco-rota__vazio">Nenhum bairro ainda. Adicione abaixo.</p>
            ) : (
              <>
                {areasDaRota.length > 12 && (
                  <div className="campo-ds">
                    <label
                      className="campo-ds__rotulo campo-ds__rotulo--leve"
                      htmlFor="rota-filtro"
                    >
                      Procurar nesta rota
                    </label>
                    <input
                      id="rota-filtro"
                      type="search"
                      className="campo-ds__controle"
                      value={filtroBairros}
                      onChange={(event) => setFiltroBairros(event.target.value)}
                    />
                  </div>
                )}

                <ul className="lista-bairros" aria-label="Bairros desta rota">
                  {bairrosVisiveis.map((area) => (
                    <li key={area.id} className="lista-bairros__item">
                      {area.bairro}
                      {!area.possuiGeometria && (
                        <span className="lista-bairros__marca" title="Sem contorno no mapa">
                          <span className="visualmente-oculto">(sem contorno no mapa)</span>
                        </span>
                      )}
                    </li>
                  ))}
                  {bairrosVisiveis.length === 0 && (
                    <li className="bloco-rota__vazio">Nenhum bairro com esse nome nesta rota.</li>
                  )}
                </ul>

                {semContorno > 0 && (
                  <p className="campo-ds__dica">
                    <span className="lista-bairros__marca" aria-hidden="true" />{' '}
                    {semContorno === 1 ? '1 bairro sem' : `${semContorno} bairros sem`} contorno no
                    mapa.{' '}
                    <Link to={`/admin/areas?rota=${rota.id}&mapa=sem`}>
                      Desenhar em Áreas atendidas
                    </Link>
                  </p>
                )}
              </>
            )}

            <div className="bloco-rota__adicionar">
              <p className="campo-ds__dica">
                Bairros de <strong>{nomeCidade}</strong>. Bairros de outra cidade não entram nesta
                rota.
              </p>

              <SeletorBairros
                id="rota-bairros"
                opcoes={opcoesBairros}
                naRota={areasDaRota.map((area) => area.bairro)}
                selecionados={selecionados}
                onAlterar={setSelecionados}
                disabled={Boolean(salvando)}
              />

              {movidos.length > 0 && (
                <Alerta tipo="aviso">
                  {movidos.length === 1 ? 'Este bairro sai' : 'Estes bairros saem'} da rota atual e
                  passa{movidos.length === 1 ? '' : 'm'} a seguir os horários desta:{' '}
                  {movidos.map((item) => `${item.bairro} (${item.rotaOrigem})`).join(', ')}. Os
                  lembretes de quem mora {movidos.length === 1 ? 'nele' : 'neles'} passam a usar os
                  novos horários automaticamente.
                </Alerta>
              )}

              {mostrarRetorno('bairros')}

              <button
                type="button"
                className="botao botao--primario bloco-rota__salvar"
                onClick={salvarBairros}
                disabled={Boolean(salvando) || selecionados.length === 0}
              >
                {salvando === 'bairros'
                  ? 'Salvando…'
                  : selecionados.length === 0
                    ? 'Adicionar bairros'
                    : `Adicionar ${selecionados.length === 1 ? '1 bairro' : `${selecionados.length} bairros`}`}
              </button>

              <p className="campo-ds__dica">
                Para tirar um bairro desta rota, adicione-o na rota certa: ele é movido
                automaticamente.
              </p>
            </div>
          </section>

          <section className="admin-quadro bloco-rota" aria-labelledby="bloco-dados">
            <h2 id="bloco-dados" className="bloco-rota__titulo">
              <span className="bloco-rota__numero">3</span> Nome, tipo e descrição
            </h2>

            {camposDados}
            {mostrarRetorno('dados')}

            <button
              type="button"
              className="botao botao--secundario bloco-rota__salvar"
              onClick={salvarDados}
              disabled={Boolean(salvando) || !dadosAlterados}
            >
              {salvando === 'dados' ? 'Salvando…' : 'Salvar nome, tipo e descrição'}
            </button>
          </section>
        </>
      )}

      <DialogoConfirmacao
        aberto={confirmarSaida}
        titulo="Sair sem salvar?"
        textoConfirmar="Sair sem salvar"
        textoCancelar="Continuar editando"
        perigo
        onConfirmar={() => {
          setConfirmarSaida(false)
          onVoltar()
        }}
        onCancelar={() => setConfirmarSaida(false)}
      >
        <p>
          Há alterações que ainda não foram salvas (
          {[
            dadosAlterados && 'nome, tipo ou descrição',
            semanaAlterada && 'dias e turnos',
            selecionados.length > 0 && 'bairros escolhidos',
          ]
            .filter(Boolean)
            .join(', ')}
          ). Se sair agora, elas serão perdidas.
        </p>
      </DialogoConfirmacao>
    </div>
  )
}

export default EditorRota

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
import { horaParaApi, listarDias, semanaDaRota } from '../../../utils/cronogramas'
import { normalizarTexto, ordenarTexto, semAcento } from '../../../utils/texto'

const LIMITE_NOME = 120
const LIMITE_DESCRICAO = 255
const OUTRA_CIDADE = '__outra__'

/** Duas semanas iguais? (mesmos dias com o mesmo início e fim) */
function mesmaSemana(a, b) {
  const diasA = Object.keys(a).sort()
  const diasB = Object.keys(b).sort()

  return (
    diasA.join() === diasB.join() &&
    diasA.every((dia) => a[dia].inicio === b[dia].inicio && a[dia].fim === b[dia].fim)
  )
}

/** Cidade mais frequente nos bairros da rota (ou a única cidade cadastrada). */
function cidadeDaRota(areasDaRota, cidades) {
  const contagem = new Map()

  areasDaRota.forEach((area) => contagem.set(area.cidade, (contagem.get(area.cidade) ?? 0) + 1))

  const maisComum = [...contagem.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]

  return maisComum ?? (cidades.length === 1 ? cidades[0] : '')
}

/** Valida a semana antes de enviar; devolve a mensagem de erro ou ''. */
function erroDaSemana(semana) {
  const dias = Object.entries(semana)

  if (dias.length === 0) {
    return 'Marque pelo menos um dia de coleta.'
  }

  if (dias.some(([, horario]) => !horario.inicio || !horario.fim)) {
    return 'Preencha o início e o fim do horário.'
  }

  if (dias.some(([, horario]) => horario.inicio === horario.fim)) {
    return 'O início e o fim do horário não podem ser iguais.'
  }

  return ''
}

/**
 * Tela de uma rota em três blocos independentes, cada um com o próprio botão
 * de salvar: 1) nome e descrição; 2) dias e horário; 3) bairros atendidos.
 * Rota nova: os blocos 1 e 2 são salvos juntos e, depois, os bairros.
 */
function EditorRota({ rota, rotas, areas, cronogramas, onVoltar, onRecarregar, onCriada }) {
  const nova = !rota

  const areasDaRota = nova
    ? []
    : areas
        .filter((area) => area.rotaId === rota.id)
        .sort((a, b) => ordenarTexto(a.bairro, b.bairro))
  const cidades = [...new Set(areas.map((area) => area.cidade))].sort(ordenarTexto)
  const semanaSalva = nova ? {} : semanaDaRota(cronogramas, rota.id)

  // Bloco 1
  const [nome, setNome] = useState(rota?.nome ?? '')
  const [descricao, setDescricao] = useState(rota?.descricao ?? '')
  const [erroNome, setErroNome] = useState('')

  // Bloco 2
  const [semana, setSemana] = useState(semanaSalva)
  const [erroSemana, setErroSemana] = useState('')

  // Bloco 3
  const [cidadeEscolhida, setCidadeEscolhida] = useState(cidadeDaRota(areasDaRota, cidades))
  const [outraCidade, setOutraCidade] = useState('')
  const [selecionados, setSelecionados] = useState([])
  const [filtroBairros, setFiltroBairros] = useState('')

  const [salvando, setSalvando] = useState(null)
  const [retorno, setRetorno] = useState({})
  const [confirmarSaida, setConfirmarSaida] = useState(false)

  const dadosAlterados =
    normalizarTexto(nome) !== (rota?.nome ?? '') ||
    (descricao.trim() || null) !== (rota?.descricao || null)
  const semanaAlterada = !mesmaSemana(semana, semanaSalva)
  const temAlteracao = dadosAlterados || semanaAlterada || selecionados.length > 0

  const cidade = cidadeEscolhida === OUTRA_CIDADE ? normalizarTexto(outraCidade) : cidadeEscolhida
  const opcoesBairros = areas
    .filter((area) => semAcento(area.cidade) === semAcento(cidade) && area.rotaId !== rota?.id)
    .map((area) => ({ bairro: area.bairro, rotaNome: nomeRotaCurto(area.nomeRota, area.cidade) }))
    .sort((a, b) => ordenarTexto(a.bairro, b.bairro))

  const diasRemovidos = Object.keys(semanaSalva).filter((dia) => !semana[dia])

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

  function semanaParaApi() {
    return Object.entries(semana).map(([diaSemana, horario]) => ({
      diaSemana,
      horarioInicio: horaParaApi(horario.inicio),
      horarioFim: horaParaApi(horario.fim),
    }))
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
      })
      await onRecarregar()
      avisar('dados', 'sucesso', 'Nome e descrição salvos.')
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
      await definirSemanaDaRota(rota.id, semanaParaApi())
      await onRecarregar()
      avisar(
        'semana',
        'sucesso',
        'Dias e horário salvos. A consulta e os lembretes já usam a nova semana.',
      )
    } catch (error) {
      avisar('semana', 'erro', error.message || 'Não foi possível salvar os dias e o horário.')
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
      criada = await criarRota({ nome: normalizarTexto(nome), descricao: descricao.trim() || null })
      await definirSemanaDaRota(criada.id, semanaParaApi())
      await onRecarregar()
      onCriada(criada.id, 'Rota cadastrada com os dias e o horário. Agora adicione os bairros.')
    } catch (error) {
      if (criada) {
        // A rota existe, mas a semana falhou: abre a rota para tentar de novo.
        await onRecarregar()
        onCriada(
          criada.id,
          `A rota foi cadastrada, mas os dias e o horário não foram salvos: ${error.message}`,
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
    if (!cidade) {
      avisar('bairros', 'erro', 'Escolha a cidade dos bairros.')
      return
    }

    setSalvando('bairros')
    try {
      const resultado = await adicionarBairrosNaRota(
        rota.id,
        cidade,
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
            Use cidade, período e dias, como “Senador Canedo - Diurna (seg, qua e sex)”.
          </p>
        )}
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

      {!nova && diasRemovidos.length > 0 && (
        <Alerta tipo="aviso">
          {listarDias(diasRemovidos)} {diasRemovidos.length === 1 ? 'deixa' : 'deixam'} de ter
          coleta nesta rota. Quem tem lembrete aqui não recebe mais aviso nesse dia.
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

        <h1 className="admin-pagina__titulo">{nova ? 'Nova rota' : rota.nome}</h1>

        {!nova && (
          <p className="admin-pagina__texto">
            {rota.ativo ? (
              <span className="selo selo--ativo">Ativa</span>
            ) : (
              <span className="selo selo--inativo">Inativa: não aparece na consulta</span>
            )}{' '}
            {areasDaRota.length === 1 ? '1 bairro' : `${areasDaRota.length} bairros`} seguem os
            horários desta rota.
          </p>
        )}
      </div>

      {nova ? (
        <section className="admin-quadro bloco-rota" aria-labelledby="bloco-nova">
          <h2 id="bloco-nova" className="bloco-rota__titulo">
            <span className="bloco-rota__numero">1</span> Nome, dias e horário
          </h2>

          <p className="bloco-rota__dica">
            <Icone nome="info" tamanho={18} />
            Crie uma rota só quando os bairros tiverem dias ou horário diferentes das rotas que já
            existem. Se a coleta é igual, adicione o bairro na rota existente.
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
              Todos os bairros desta rota seguem estes dias e este horário. Mudou a coleta de um
              bairro só? Adicione-o em outra rota em vez de mudar aqui.
            </p>

            {camposSemana}
            {mostrarRetorno('semana')}

            <button
              type="button"
              className="botao botao--primario bloco-rota__salvar"
              onClick={salvarSemana}
              disabled={Boolean(salvando) || !semanaAlterada}
            >
              {salvando === 'semana' ? 'Salvando…' : 'Salvar dias e horário'}
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
              {cidades.length !== 1 || cidadeEscolhida === OUTRA_CIDADE ? (
                <div className="bloco-rota__cidade">
                  <div className="campo-ds">
                    <label className="campo-ds__rotulo" htmlFor="rota-cidade">
                      Cidade
                    </label>
                    <select
                      id="rota-cidade"
                      className="campo-ds__controle"
                      value={cidadeEscolhida}
                      onChange={(event) => {
                        setCidadeEscolhida(event.target.value)
                        setSelecionados([])
                      }}
                      disabled={Boolean(salvando)}
                    >
                      <option value="">Escolha a cidade</option>
                      {cidades.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                      <option value={OUTRA_CIDADE}>Outra cidade…</option>
                    </select>
                  </div>

                  {cidadeEscolhida === OUTRA_CIDADE && (
                    <div className="campo-ds">
                      <label className="campo-ds__rotulo" htmlFor="rota-outra-cidade">
                        Nome da cidade
                      </label>
                      <input
                        id="rota-outra-cidade"
                        className="campo-ds__controle"
                        value={outraCidade}
                        maxLength={120}
                        onChange={(event) => setOutraCidade(event.target.value)}
                        disabled={Boolean(salvando)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="campo-ds__dica">
                  Cidade: <strong>{cidade}</strong>{' '}
                  <button
                    type="button"
                    className="botao-link"
                    onClick={() => setCidadeEscolhida(OUTRA_CIDADE)}
                  >
                    outra cidade
                  </button>
                </p>
              )}

              <SeletorBairros
                id="rota-bairros"
                opcoes={opcoesBairros}
                naRota={areasDaRota.map((area) => area.bairro)}
                selecionados={selecionados}
                onAlterar={setSelecionados}
                disabled={Boolean(salvando) || !cidade}
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
              <span className="bloco-rota__numero">3</span> Nome e descrição
            </h2>

            {camposDados}
            {mostrarRetorno('dados')}

            <button
              type="button"
              className="botao botao--secundario bloco-rota__salvar"
              onClick={salvarDados}
              disabled={Boolean(salvando) || !dadosAlterados}
            >
              {salvando === 'dados' ? 'Salvando…' : 'Salvar nome e descrição'}
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
            dadosAlterados && 'nome ou descrição',
            semanaAlterada && 'dias e horário',
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

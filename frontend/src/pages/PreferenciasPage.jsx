import { useEffect, useState } from 'react'

import { consultarColeta, listarAreasDisponiveis } from '../services/rotaService'

import {
  atualizarPreferencia,
  criarPreferencia,
  obterPreferencia,
} from '../services/notificacaoService'

import {
  ativarWebPush,
  desativarWebPush,
  obterSubscriptionAtual,
  webPushSuportado,
} from '../services/webPushService'

import '../App.css'
import '../styles/conta.css'

import Alerta from '../components/Alerta'
import Icone from '../components/Icone'
import DiasSemana from '../components/coleta/DiasSemana'
import CampoCombobox from '../components/form/CampoCombobox'
import Interruptor from '../components/form/Interruptor'

import {
  calcularProximaColeta,
  descreverAntecedencia,
  formatarData,
  formatarHora,
  ordenarCronogramas,
} from '../utils/coleta'
import { ordenarTexto } from '../utils/texto'

const ATALHOS_ANTECEDENCIA = [1, 3, 12, 24, 48]

/** Meus lembretes: bairro, canais (e-mail e navegador) e antecedência. */
function PreferenciasPage() {
  const [preferencia, setPreferencia] = useState(null)
  const [areas, setAreas] = useState([])
  const [cidade, setCidade] = useState('')
  const [bairro, setBairro] = useState('')
  const [rotaSelecionada, setRotaSelecionada] = useState(null)
  const [emailAtivo, setEmailAtivo] = useState(true)
  const [webPushAtivo, setWebPushAtivo] = useState(false)
  const [navegadorInscrito, setNavegadorInscrito] = useState(false)
  const [alterandoWebPush, setAlterandoWebPush] = useState(false)
  const [webPushDisponivel, setWebPushDisponivel] = useState(true)
  const [antecedenciaHoras, setAntecedenciaHoras] = useState(3)
  const [mostrarErroAntecedencia, setMostrarErroAntecedencia] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [carregandoAreas, setCarregandoAreas] = useState(true)
  const [consultandoRota, setConsultandoRota] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  // Momento de referência da prévia do lembrete (fora do render).
  const [agora, setAgora] = useState(() => new Date())

  useEffect(() => {
    let componenteAtivo = true

    async function carregarDados() {
      try {
        const [dadosAreas, dadosPreferencia] = await Promise.all([
          listarAreasDisponiveis(),

          obterPreferencia().catch((error) => {
            if (error.status === 404) {
              return null
            }

            throw error
          }),
        ])

        if (!componenteAtivo) {
          return
        }

        setAreas(Array.isArray(dadosAreas) ? dadosAreas : [])

        const suportado = webPushSuportado()

        setWebPushDisponivel(suportado)

        if (suportado) {
          const subscription = await obterSubscriptionAtual()

          if (!componenteAtivo) {
            return
          }

          setNavegadorInscrito(Boolean(subscription))
        }

        if (dadosPreferencia) {
          setPreferencia(dadosPreferencia)

          setRotaSelecionada({
            rotaId: dadosPreferencia.rotaId,
            nomeRota: dadosPreferencia.nomeRota,
          })

          setEmailAtivo(dadosPreferencia.emailAtivo ?? true)

          setWebPushAtivo(dadosPreferencia.webPushAtivo ?? false)

          setAntecedenciaHoras(dadosPreferencia.antecedenciaHoras ?? 3)
        }
      } catch (error) {
        if (!componenteAtivo) {
          return
        }

        setErro(error.message || 'Não foi possível carregar suas preferências.')
      } finally {
        if (componenteAtivo) {
          setCarregando(false)
          setCarregandoAreas(false)
        }
      }
    }

    carregarDados()

    return () => {
      componenteAtivo = false
    }
  }, [])

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

  const antecedencia = Number(antecedenciaHoras)

  const antecedenciaValida =
    String(antecedenciaHoras).trim() !== '' &&
    Number.isInteger(antecedencia) &&
    antecedencia >= 0 &&
    antecedencia <= 72

  const operacaoEmAndamento = salvando || consultandoRota || alterandoWebPush

  function limparMensagens() {
    setErro('')
    setSucesso('')
  }

  function handleCidadeChange(event) {
    const novaCidade = event.target.value

    setCidade(novaCidade)
    setBairro('')
    setRotaSelecionada(null)

    limparMensagens()
  }

  function handleBairroChange(novoBairro) {
    setBairro(novoBairro)
    setRotaSelecionada(null)

    limparMensagens()

    if (cidade && novoBairro) {
      buscarRota(cidade, novoBairro)
    }
  }

  function handleAntecedenciaChange(event) {
    setAntecedenciaHoras(event.target.value)

    setMostrarErroAntecedencia(false)

    limparMensagens()
  }

  async function buscarRota(cidadeEscolhida, bairroEscolhido) {
    try {
      setConsultandoRota(true)

      const dados = await consultarColeta(cidadeEscolhida, bairroEscolhido)

      setAgora(new Date())

      setRotaSelecionada({
        rotaId: dados.rotaId,
        nomeRota: dados.nomeRota,
        cidade: dados.cidade,
        bairro: dados.bairro,
        cronogramas: ordenarCronogramas(dados.cronogramas),
      })
    } catch (error) {
      setRotaSelecionada(null)

      setErro(error.message || 'Não foi possível localizar a rota deste bairro.')
    } finally {
      setConsultandoRota(false)
    }
  }

  async function handleAtivarWebPush() {
    limparMensagens()

    if (!webPushDisponivel) {
      setErro('Este navegador não oferece suporte a Web Push.')

      return
    }

    try {
      setAlterandoWebPush(true)

      await ativarWebPush()

      setNavegadorInscrito(true)
      setWebPushAtivo(true)

      setSucesso(
        'Web Push ativado neste navegador. Salve as preferências para concluir a configuração.',
      )
    } catch (error) {
      setErro(error.message || 'Não foi possível ativar o Web Push.')
    } finally {
      setAlterandoWebPush(false)
    }
  }

  async function handleDesativarWebPush() {
    limparMensagens()

    try {
      setAlterandoWebPush(true)

      await desativarWebPush()

      setNavegadorInscrito(false)
      setWebPushAtivo(false)

      setSucesso(
        'Web Push desativado neste navegador. Salve as preferências para atualizar a configuração.',
      )
    } catch (error) {
      setErro(error.message || 'Não foi possível desativar o Web Push.')
    } finally {
      setAlterandoWebPush(false)
    }
  }

  async function handleSalvar() {
    limparMensagens()

    if (!rotaSelecionada?.rotaId) {
      setErro('Escolha o bairro antes de salvar.')

      return
    }

    if (!antecedenciaValida) {
      setMostrarErroAntecedencia(true)

      setErro('A antecedência deve ser um número inteiro de 0 a 72 horas.')

      return
    }

    if (webPushAtivo && !navegadorInscrito) {
      setErro('Ative o Web Push neste navegador antes de salvar essa opção.')

      return
    }

    const dados = {
      rotaId: rotaSelecionada.rotaId,
      emailAtivo,
      webPushAtivo,
      antecedenciaHoras: antecedencia,
    }

    try {
      setSalvando(true)

      const jaPossuiaPreferencia = Boolean(preferencia)

      const resposta = jaPossuiaPreferencia
        ? await atualizarPreferencia(dados)
        : await criarPreferencia(dados)

      setPreferencia(
        resposta || {
          ...dados,
          nomeRota: rotaSelecionada.nomeRota,
        },
      )

      setMostrarErroAntecedencia(false)

      setSucesso(
        jaPossuiaPreferencia
          ? 'Preferências atualizadas com sucesso.'
          : 'Preferências cadastradas com sucesso.',
      )
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar as preferências.')
    } finally {
      setSalvando(false)
    }
  }

  const proximaColeta = rotaSelecionada?.cronogramas?.length
    ? calcularProximaColeta(rotaSelecionada.cronogramas, agora)
    : null

  const horarioLembrete =
    proximaColeta && antecedenciaValida
      ? new Date(proximaColeta.inicio.getTime() - antecedencia * 60 * 60 * 1000)
      : null

  const lembreteJaPassou = horarioLembrete && horarioLembrete <= agora

  const algumCanal = emailAtivo || webPushAtivo

  if (carregando) {
    return (
      <main className="conta-pagina" aria-busy="true">
        <h1 className="visualmente-oculto">Meus lembretes</h1>

        <p className="carregando" role="status">
          <span className="carregando__spinner" aria-hidden="true" />
          Carregando suas preferências…
        </p>
      </main>
    )
  }

  return (
    <main
      className="conta-pagina"
      aria-labelledby="titulo-preferencias"
      aria-busy={operacaoEmAndamento}
    >
      <header className="conta-cabecalho">
        <p className="sobretitulo">Lembretes da coleta</p>

        <h1 id="titulo-preferencias" className="conta-cabecalho__titulo">
          Meus lembretes
        </h1>

        <p className="conta-cabecalho__texto">
          Escolha o bairro, como quer ser avisado e com quanta antecedência.
        </p>
      </header>

      {preferencia ? (
        <div className="resumo-lembrete">
          <span className="resumo-lembrete__icone" aria-hidden="true">
            <Icone nome="sino" />
          </span>

          <p>
            <strong>
              {preferencia.emailAtivo || preferencia.webPushAtivo
                ? 'Lembrete ativo'
                : 'Lembrete pausado'}
            </strong>
            {preferencia.nomeRota}
            {' · '}
            {descreverAntecedencia(preferencia.antecedenciaHoras)}
          </p>
        </div>
      ) : (
        <Alerta tipo="info" titulo="Você ainda não tem lembrete">
          Preencha os três passos abaixo e salve para começar a receber.
        </Alerta>
      )}

      {erro && (
        <Alerta tipo="erro" titulo="Atenção">
          {erro}
        </Alerta>
      )}

      {sucesso && (
        <Alerta tipo="sucesso" titulo="Pronto">
          {sucesso}
        </Alerta>
      )}

      <section
        className="cartao passo"
        aria-labelledby="titulo-localizar-rota"
        aria-busy={consultandoRota}
      >
        <div className="passo__cabecalho">
          <span className="passo__numero" aria-hidden="true">
            1
          </span>

          <h2 id="titulo-localizar-rota" className="titulo-cartao">
            Onde: seu bairro
          </h2>
        </div>

        <div className="passo__campos">
          <div className="campo-ds">
            <label className="campo-ds__rotulo" htmlFor="cidade">
              Cidade
            </label>

            <select
              id="cidade"
              className="campo-ds__controle"
              value={cidade}
              onChange={handleCidadeChange}
              disabled={carregandoAreas || cidades.length === 0 || operacaoEmAndamento}
            >
              <option value="">
                {cidades.length === 0 ? 'Nenhuma cidade disponível' : 'Selecione a cidade'}
              </option>

              {cidades.map((nomeCidade) => (
                <option key={nomeCidade} value={nomeCidade}>
                  {nomeCidade}
                </option>
              ))}
            </select>
          </div>

          <CampoCombobox
            id="bairro"
            rotulo="Bairro"
            opcoes={bairros}
            valor={bairro}
            aoEscolher={handleBairroChange}
            desabilitado={!cidade || bairros.length === 0 || operacaoEmAndamento}
            placeholder={
              !cidade
                ? 'Escolha a cidade primeiro'
                : consultandoRota
                  ? 'Buscando a rota…'
                  : 'Digite ou escolha o bairro'
            }
            idDica="ajuda-bairro-preferencia"
            dica={
              preferencia && !rotaSelecionada?.cronogramas
                ? 'Escolha de novo só se quiser trocar de bairro.'
                : 'A rota do bairro é encontrada automaticamente.'
            }
            mensagemVazia="Nenhum bairro encontrado com esse nome."
          />
        </div>

        {rotaSelecionada && (
          <div className="passo__resultado" role="status">
            <p className="passo__rota">
              <Icone nome="local" tamanho={18} />
              <span>
                {rotaSelecionada.bairro ? `${rotaSelecionada.bairro}: ` : 'Rota atual: '}
                <strong>{rotaSelecionada.nomeRota}</strong>
              </span>
            </p>

            {rotaSelecionada.cronogramas?.length > 0 && (
              <DiasSemana cronogramas={rotaSelecionada.cronogramas} hoje={agora} />
            )}
          </div>
        )}
      </section>

      <section className="cartao passo" aria-labelledby="titulo-canais">
        <div className="passo__cabecalho">
          <span className="passo__numero" aria-hidden="true">
            2
          </span>

          <h2 id="titulo-canais" className="titulo-cartao">
            Como: canais de aviso
          </h2>
        </div>

        <Interruptor
          id="emailAtivo"
          rotulo="E-mail"
          descricao="Receba o lembrete no e-mail da sua conta."
          checked={emailAtivo}
          onChange={(event) => {
            setEmailAtivo(event.target.checked)
            limparMensagens()
          }}
          disabled={operacaoEmAndamento}
        />

        <div className="canal-navegador">
          <Interruptor
            id="webPushAtivo"
            rotulo="Notificação no navegador"
            descricao={
              !webPushDisponivel
                ? 'Este navegador não oferece notificações.'
                : navegadorInscrito
                  ? 'Este navegador está autorizado a receber avisos.'
                  : 'Autorize este navegador para poder ligar esta opção.'
            }
            checked={webPushAtivo}
            onChange={(event) => {
              setWebPushAtivo(event.target.checked)
              limparMensagens()
            }}
            disabled={operacaoEmAndamento || !webPushDisponivel || !navegadorInscrito}
          />

          {webPushDisponivel && (
            <button
              type="button"
              className="botao botao--secundario botao--pequeno"
              onClick={navegadorInscrito ? handleDesativarWebPush : handleAtivarWebPush}
              disabled={operacaoEmAndamento}
            >
              <Icone nome="navegador" tamanho={18} />
              {alterandoWebPush
                ? 'Aguarde…'
                : navegadorInscrito
                  ? 'Remover este navegador'
                  : 'Autorizar este navegador'}
            </button>
          )}
        </div>

        {!algumCanal && (
          <p className="campo-ds__dica">Com os dois canais desligados, o lembrete fica pausado.</p>
        )}
      </section>

      <section className="cartao passo" aria-labelledby="titulo-antecedencia">
        <div className="passo__cabecalho">
          <span className="passo__numero" aria-hidden="true">
            3
          </span>

          <h2 id="titulo-antecedencia" className="titulo-cartao">
            Quando: antecedência
          </h2>
        </div>

        <div className="atalhos" role="group" aria-label="Antecedências mais usadas">
          {ATALHOS_ANTECEDENCIA.map((horas) => (
            <button
              key={horas}
              type="button"
              className={
                antecedencia === horas && antecedenciaValida ? 'atalho atalho--ativo' : 'atalho'
              }
              aria-pressed={antecedencia === horas && antecedenciaValida}
              onClick={() => {
                setAntecedenciaHoras(horas)
                setMostrarErroAntecedencia(false)
                limparMensagens()
              }}
              disabled={operacaoEmAndamento}
            >
              {horas} h
            </button>
          ))}
        </div>

        <div className="campo-ds campo-antecedencia">
          <label className="campo-ds__rotulo" htmlFor="antecedenciaHoras">
            Ou digite as horas (0 a 72)
          </label>

          <input
            id="antecedenciaHoras"
            className="campo-ds__controle"
            type="number"
            min="0"
            max="72"
            step="1"
            inputMode="numeric"
            value={antecedenciaHoras}
            onChange={handleAntecedenciaChange}
            onBlur={() => setMostrarErroAntecedencia(!antecedenciaValida)}
            aria-invalid={mostrarErroAntecedencia && !antecedenciaValida}
            aria-describedby="ajuda-antecedencia"
            disabled={operacaoEmAndamento}
          />

          {mostrarErroAntecedencia && !antecedenciaValida ? (
            <p id="ajuda-antecedencia" className="campo-ds__erro" role="alert">
              <Icone nome="erro" tamanho={16} />
              Use um número inteiro de 0 a 72.
            </p>
          ) : (
            <p id="ajuda-antecedencia" className="campo-ds__dica">
              0 avisa no próprio horário da coleta.
            </p>
          )}
        </div>

        {horarioLembrete && (
          <p className="previa-lembrete">
            <Icone nome="relogio" tamanho={18} />
            <span>
              Próxima coleta:{' '}
              <strong>
                {formatarData(proximaColeta.inicio)}, às{' '}
                {formatarHora(proximaColeta.cronograma.horarioInicio)}
              </strong>
              .{' '}
              {lembreteJaPassou ? (
                'Para esta coleta o horário do lembrete já passou; as próximas seguem a antecedência escolhida.'
              ) : (
                <>
                  O lembrete chega{' '}
                  <strong>
                    {formatarData(horarioLembrete)}, às{' '}
                    {String(horarioLembrete.getHours()).padStart(2, '0')}:
                    {String(horarioLembrete.getMinutes()).padStart(2, '0')}
                  </strong>
                  .
                </>
              )}
            </span>
          </p>
        )}
      </section>

      <div className="barra-salvar">
        <p className="barra-salvar__texto">
          {rotaSelecionada
            ? `${rotaSelecionada.nomeRota} · ${antecedenciaValida ? descreverAntecedencia(antecedencia) : 'antecedência inválida'}`
            : 'Escolha o bairro para salvar.'}
        </p>

        <button
          type="button"
          className="botao botao--primario"
          onClick={handleSalvar}
          disabled={operacaoEmAndamento}
        >
          {salvando ? 'Salvando…' : preferencia ? 'Salvar alterações' : 'Ativar lembrete'}
        </button>
      </div>
    </main>
  )
}

export default PreferenciasPage

import {
  useEffect,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import {
  consultarColeta,
  listarAreasDisponiveis,
} from '../services/rotaService'

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

function ordenarTexto(a, b) {
  return a.localeCompare(
    b,
    'pt-BR',
    {
      sensitivity: 'base',
    },
  )
}

function PreferenciasPage() {
  const [
    preferencia,
    setPreferencia,
  ] = useState(null)

  const [areas, setAreas] =
    useState([])

  const [cidade, setCidade] =
    useState('')

  const [bairro, setBairro] =
    useState('')

  const [
    rotaSelecionada,
    setRotaSelecionada,
  ] = useState(null)

  const [
    emailAtivo,
    setEmailAtivo,
  ] = useState(true)

  const [
    webPushAtivo,
    setWebPushAtivo,
  ] = useState(false)

  const [
    navegadorInscrito,
    setNavegadorInscrito,
  ] = useState(false)

  const [
    alterandoWebPush,
    setAlterandoWebPush,
  ] = useState(false)

  const [
    webPushDisponivel,
    setWebPushDisponivel,
  ] = useState(true)

  const [
    antecedenciaHoras,
    setAntecedenciaHoras,
  ] = useState(3)

  const [
    mostrarErroAntecedencia,
    setMostrarErroAntecedencia,
  ] = useState(false)

  const [
    carregando,
    setCarregando,
  ] = useState(true)

  const [
    carregandoAreas,
    setCarregandoAreas,
  ] = useState(true)

  const [
    consultandoRota,
    setConsultandoRota,
  ] = useState(false)

  const [
    salvando,
    setSalvando,
  ] = useState(false)

  const [erro, setErro] =
    useState('')

  const [sucesso, setSucesso] =
    useState('')

  useEffect(() => {
    let componenteAtivo = true

    async function carregarDados() {
      try {
        const [
          dadosAreas,
          dadosPreferencia,
        ] = await Promise.all([
          listarAreasDisponiveis(),

          obterPreferencia().catch(
            (error) => {
              if (
                error.status === 404
              ) {
                return null
              }

              throw error
            },
          ),
        ])

        if (!componenteAtivo) {
          return
        }

        setAreas(
          Array.isArray(dadosAreas)
            ? dadosAreas
            : [],
        )

        const suportado =
          webPushSuportado()

        setWebPushDisponivel(
          suportado,
        )

        if (suportado) {
          const subscription =
            await obterSubscriptionAtual()

          if (!componenteAtivo) {
            return
          }

          setNavegadorInscrito(
            Boolean(subscription),
          )
        }

        if (dadosPreferencia) {
          setPreferencia(
            dadosPreferencia,
          )

          setRotaSelecionada({
            rotaId:
              dadosPreferencia.rotaId,
            nomeRota:
              dadosPreferencia.nomeRota,
          })

          setEmailAtivo(
            dadosPreferencia
              .emailAtivo ?? true,
          )

          setWebPushAtivo(
            dadosPreferencia
              .webPushAtivo ?? false,
          )

          setAntecedenciaHoras(
            dadosPreferencia
              .antecedenciaHoras ?? 3,
          )
        }
      } catch (error) {
        if (!componenteAtivo) {
          return
        }

        setErro(
          error.message ||
            'Não foi possível carregar suas preferências.',
        )
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

  const cidades = [
    ...new Set(
      areas
        .map(
          (area) =>
            area.cidade?.trim(),
        )
        .filter(Boolean),
    ),
  ].sort(ordenarTexto)

  const bairros = cidade
    ? [
        ...new Set(
          areas
            .filter(
              (area) =>
                area.cidade?.trim() ===
                cidade,
            )
            .map(
              (area) =>
                area.bairro?.trim(),
            )
            .filter(Boolean),
        ),
      ].sort(ordenarTexto)
    : []

  const antecedencia =
    Number(antecedenciaHoras)

  const antecedenciaValida =
    String(
      antecedenciaHoras,
    ).trim() !== '' &&
    Number.isInteger(
      antecedencia,
    ) &&
    antecedencia >= 0 &&
    antecedencia <= 72

  const operacaoEmAndamento =
    salvando ||
    consultandoRota ||
    alterandoWebPush

  function limparMensagens() {
    setErro('')
    setSucesso('')
  }

  function handleCidadeChange(
    event,
  ) {
    const novaCidade =
      event.target.value

    setCidade(novaCidade)
    setBairro('')
    setRotaSelecionada(null)

    limparMensagens()
  }

  function handleBairroChange(
    event,
  ) {
    const novoBairro =
      event.target.value

    setBairro(novoBairro)
    setRotaSelecionada(null)

    limparMensagens()
  }

  function handleAntecedenciaChange(
    event,
  ) {
    setAntecedenciaHoras(
      event.target.value,
    )

    setMostrarErroAntecedencia(
      false,
    )

    limparMensagens()
  }

  async function handleConsultarRota(
    event,
  ) {
    event.preventDefault()

    limparMensagens()

    if (!cidade || !bairro) {
      setErro(
        'Selecione a cidade e o bairro.',
      )

      return
    }

    try {
      setConsultandoRota(true)

      const dados =
        await consultarColeta(
          cidade,
          bairro,
        )

      setRotaSelecionada({
        rotaId: dados.rotaId,
        nomeRota:
          dados.nomeRota,
        cidade: dados.cidade,
        bairro: dados.bairro,
      })

      setSucesso(
        'Região selecionada com sucesso.',
      )
    } catch (error) {
      setRotaSelecionada(null)

      setErro(
        error.message ||
          'Não foi possível localizar a rota.',
      )
    } finally {
      setConsultandoRota(false)
    }
  }

  async function handleAtivarWebPush() {
    limparMensagens()

    if (!webPushDisponivel) {
      setErro(
        'Este navegador não oferece suporte a Web Push.',
      )

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
      setErro(
        error.message ||
          'Não foi possível ativar o Web Push.',
      )
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
      setErro(
        error.message ||
          'Não foi possível desativar o Web Push.',
      )
    } finally {
      setAlterandoWebPush(false)
    }
  }

  async function handleSalvar() {
    limparMensagens()

    if (!rotaSelecionada?.rotaId) {
      setErro(
        'Selecione uma região antes de salvar.',
      )

      return
    }

    if (!antecedenciaValida) {
      setMostrarErroAntecedencia(
        true,
      )

      setErro(
        'Revise a antecedência do lembrete antes de salvar.',
      )

      return
    }

    if (
      webPushAtivo &&
      !navegadorInscrito
    ) {
      setErro(
        'Ative o Web Push neste navegador antes de salvar essa opção.',
      )

      return
    }

    const dados = {
      rotaId:
        rotaSelecionada.rotaId,
      emailAtivo,
      webPushAtivo,
      antecedenciaHoras:
        antecedencia,
    }

    try {
      setSalvando(true)

      const jaPossuiaPreferencia =
        Boolean(preferencia)

      const resposta =
        jaPossuiaPreferencia
          ? await atualizarPreferencia(
              dados,
            )
          : await criarPreferencia(
              dados,
            )

      setPreferencia(
        resposta || {
          ...dados,
          nomeRota:
            rotaSelecionada.nomeRota,
        },
      )

      setMostrarErroAntecedencia(
        false,
      )

      setSucesso(
        jaPossuiaPreferencia
          ? 'Preferências atualizadas com sucesso.'
          : 'Preferências cadastradas com sucesso.',
      )
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível salvar as preferências.',
      )
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <main className="app">
        <section
          className="consulta"
          aria-labelledby="titulo-carregando-preferencias"
          aria-busy="true"
        >
          <h1
            id="titulo-carregando-preferencias"
            className="visualmente-oculto"
          >
            Preferências de notificação
          </h1>

          <div
            className="mensagem"
            role="status"
            aria-live="polite"
          >
            Carregando preferências...
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <section
        className="consulta"
        aria-labelledby="titulo-preferencias"
        aria-busy={
          operacaoEmAndamento
        }
      >
        <header className="consulta__cabecalho">
          <span
            className="consulta__marca"
            aria-hidden="true"
          >
            NOTIFICAÇÕES
          </span>

          <h1 id="titulo-preferencias">
            Preferências de notificação
          </h1>

          <p>
            Escolha a região que deseja
            acompanhar, os canais de
            notificação e com quanto
            tempo de antecedência deseja
            receber o lembrete.
          </p>
        </header>

        {preferencia ? (
          <div
            className="mensagem"
            role="status"
          >
            Você já possui uma
            preferência configurada.
            As alterações serão salvas
            sobre a configuração atual.
          </div>
        ) : (
          <div
            className="mensagem"
            role="status"
          >
            Você ainda não possui uma
            preferência de notificação
            configurada.
          </div>
        )}

        {erro && (
          <div
            className="mensagem mensagem--erro"
            role="alert"
            aria-live="assertive"
          >
            {erro}
          </div>
        )}

        {sucesso && (
          <div
            className="mensagem mensagem--sucesso"
            role="status"
            aria-live="polite"
          >
            {sucesso}
          </div>
        )}

        <section
          className="resultado"
          aria-labelledby="titulo-localizar-rota"
        >
          <h2 id="titulo-localizar-rota">
            1. Escolha sua região
          </h2>

          <form
            className="consulta__formulario"
            onSubmit={
              handleConsultarRota
            }
            aria-busy={
              consultandoRota
            }
          >
            <div className="campo">
              <label htmlFor="cidade">
                Cidade
              </label>

              <select
                id="cidade"
                value={cidade}
                onChange={
                  handleCidadeChange
                }
                disabled={
                  carregandoAreas ||
                  cidades.length === 0 ||
                  operacaoEmAndamento
                }
                aria-describedby="ajuda-cidade-preferencia"
              >
                <option value="">
                  {carregandoAreas
                    ? 'Carregando cidades...'
                    : cidades.length === 0
                      ? 'Nenhuma cidade disponível'
                      : 'Selecione uma cidade'}
                </option>

                {cidades.map(
                  (nomeCidade) => (
                    <option
                      key={
                        nomeCidade
                      }
                      value={
                        nomeCidade
                      }
                    >
                      {nomeCidade}
                    </option>
                  ),
                )}
              </select>

              <small id="ajuda-cidade-preferencia">
                Selecione a cidade onde
                deseja receber os
                lembretes da coleta.
              </small>
            </div>

            <div className="campo">
              <label htmlFor="bairro">
                Bairro
              </label>

              <select
                id="bairro"
                value={bairro}
                onChange={
                  handleBairroChange
                }
                disabled={
                  !cidade ||
                  bairros.length === 0 ||
                  operacaoEmAndamento
                }
                aria-describedby="ajuda-bairro-preferencia"
              >
                <option value="">
                  {!cidade
                    ? 'Selecione primeiro a cidade'
                    : bairros.length === 0
                      ? 'Nenhum bairro disponível'
                      : 'Selecione um bairro'}
                </option>

                {bairros.map(
                  (nomeBairro) => (
                    <option
                      key={
                        nomeBairro
                      }
                      value={
                        nomeBairro
                      }
                    >
                      {nomeBairro}
                    </option>
                  ),
                )}
              </select>

              <small id="ajuda-bairro-preferencia">
                {!cidade
                  ? 'Selecione uma cidade para liberar os bairros disponíveis.'
                  : 'Selecione o bairro que deseja acompanhar.'}
              </small>
            </div>

            <button
              type="submit"
              disabled={
                consultandoRota ||
                salvando ||
                alterandoWebPush ||
                !cidade ||
                !bairro
              }
            >
              {consultandoRota
                ? 'Selecionando...'
                : 'Selecionar região'}
            </button>
          </form>

          {rotaSelecionada && (
            <div
              className="rota-selecionada"
              role="status"
              aria-live="polite"
            >
              <strong>
                Região selecionada
              </strong>

              {rotaSelecionada.bairro &&
                rotaSelecionada.cidade && (
                  <p>
                    {
                      rotaSelecionada.bairro
                    }

                    {' — '}

                    {
                      rotaSelecionada.cidade
                    }
                  </p>
                )}

              <p>
                <strong>
                  Rota responsável:
                </strong>{' '}
                {
                  rotaSelecionada.nomeRota
                }
              </p>
            </div>
          )}
        </section>

        <section
          className="resultado"
          aria-labelledby="titulo-canais-notificacao"
        >
          <h2 id="titulo-canais-notificacao">
            2. Configure os lembretes
          </h2>

          <fieldset className="grupo-preferencias">
            <legend>
              Canais de notificação
            </legend>

            <div className="campo campo-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={emailAtivo}
                  onChange={(event) => {
                    setEmailAtivo(
                      event.target.checked,
                    )

                    limparMensagens()
                  }}
                  disabled={
                    salvando ||
                    alterandoWebPush
                  }
                />

                <span>
                  Receber lembretes por
                  e-mail
                </span>
              </label>
            </div>

            <div
              className="web-push-config"
              aria-busy={
                alterandoWebPush
              }
            >
              <div className="web-push-config__cabecalho">
                <div>
                  <strong>
                    Web Push
                  </strong>

                  <p>
                    Receba notificações
                    diretamente neste
                    navegador.
                  </p>
                </div>

                <span
                  className={
                    navegadorInscrito
                      ? 'web-push-status web-push-status--ativo'
                      : 'web-push-status'
                  }
                  role="status"
                  aria-live="polite"
                >
                  {alterandoWebPush
                    ? 'Atualizando...'
                    : navegadorInscrito
                      ? 'Ativo'
                      : 'Inativo'}
                </span>
              </div>

              {!webPushDisponivel && (
                <p
                  className="web-push-config__aviso"
                  role="status"
                >
                  Este navegador não
                  oferece suporte a Web
                  Push.
                </p>
              )}

              {webPushDisponivel &&
                !navegadorInscrito && (
                  <button
                    type="button"
                    className="web-push-config__botao"
                    onClick={
                      handleAtivarWebPush
                    }
                    disabled={
                      alterandoWebPush ||
                      salvando
                    }
                  >
                    {alterandoWebPush
                      ? 'Ativando...'
                      : 'Ativar Web Push'}
                  </button>
                )}

              {webPushDisponivel &&
                navegadorInscrito && (
                  <button
                    type="button"
                    className="web-push-config__botao web-push-config__botao--secundario"
                    onClick={
                      handleDesativarWebPush
                    }
                    disabled={
                      alterandoWebPush ||
                      salvando
                    }
                  >
                    {alterandoWebPush
                      ? 'Desativando...'
                      : 'Desativar Web Push'}
                  </button>
                )}
            </div>
          </fieldset>

          <div className="campo">
            <label htmlFor="antecedenciaHoras">
              Antecedência do lembrete
            </label>

            <input
              id="antecedenciaHoras"
              type="number"
              min="0"
              max="72"
              step="1"
              value={
                antecedenciaHoras
              }
              onChange={
                handleAntecedenciaChange
              }
              inputMode="numeric"
              disabled={salvando}
              aria-invalid={
                mostrarErroAntecedencia &&
                !antecedenciaValida
              }
              aria-describedby={
                mostrarErroAntecedencia &&
                !antecedenciaValida
                  ? 'ajuda-antecedencia erro-antecedencia'
                  : 'ajuda-antecedencia'
              }
            />

            <small id="ajuda-antecedencia">
              Informe quantas horas antes
              da coleta deseja receber o
              lembrete. Valor permitido:
              de 0 a 72 horas.
            </small>

            {mostrarErroAntecedencia &&
              !antecedenciaValida && (
                <p
                  id="erro-antecedencia"
                  className="campo__erro"
                  role="alert"
                >
                  Informe um número
                  inteiro entre 0 e 72
                  horas.
                </p>
              )}
          </div>
        </section>

        <button
          type="button"
          className="botao-salvar"
          onClick={handleSalvar}
          disabled={
            salvando ||
            consultandoRota ||
            alterandoWebPush ||
            !rotaSelecionada?.rotaId
          }
        >
          {salvando
            ? 'Salvando preferências...'
            : 'Salvar preferências'}
        </button>

        <p className="navegacao-secundaria">
          <Link to="/minha-conta">
            Voltar para minha conta
          </Link>
        </p>
      </section>
    </main>
  )
}

export default PreferenciasPage
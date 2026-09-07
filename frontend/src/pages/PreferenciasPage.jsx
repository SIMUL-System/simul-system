import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { consultarColeta } from '../services/rotaService'

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

function PreferenciasPage() {
  const [preferencia, setPreferencia] =
    useState(null)

  const [cidade, setCidade] = useState('')
  const [bairro, setBairro] = useState('')

  const [rotaSelecionada, setRotaSelecionada] =
    useState(null)

  const [emailAtivo, setEmailAtivo] =
    useState(true)

  const [webPushAtivo, setWebPushAtivo] =
    useState(false)

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

  const [carregando, setCarregando] =
    useState(true)

  const [
    consultandoRota,
    setConsultandoRota,
  ] = useState(false)

  const [salvando, setSalvando] =
    useState(false)

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] =
    useState('')

  useEffect(() => {
    async function carregarPreferencia() {
      try {
        const suportado =
          webPushSuportado()

        setWebPushDisponivel(
          suportado,
        )

        if (suportado) {
          const subscription =
            await obterSubscriptionAtual()

          setNavegadorInscrito(
            Boolean(subscription),
          )
        }

        const dados =
          await obterPreferencia()

        setPreferencia(dados)

        setRotaSelecionada({
          rotaId: dados.rotaId,
          nomeRota: dados.nomeRota,
        })

        setEmailAtivo(
          dados.emailAtivo ?? true,
        )

        setWebPushAtivo(
          dados.webPushAtivo ?? false,
        )

        setAntecedenciaHoras(
          dados.antecedenciaHoras ?? 3,
        )
      } catch (error) {
        if (error.status !== 404) {
          setErro(
            error.message ||
              'Não foi possível carregar a preferência.',
          )
        }
      } finally {
        setCarregando(false)
      }
    }

    carregarPreferencia()
  }, [])

  async function handleConsultarRota(event) {
    event.preventDefault()

    setErro('')
    setSucesso('')

    if (!cidade.trim() || !bairro.trim()) {
      setErro(
        'Informe a cidade e o bairro.',
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
        nomeRota: dados.nomeRota,
        cidade: dados.cidade,
        bairro: dados.bairro,
      })
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
    setErro('')
    setSucesso('')

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
    setErro('')
    setSucesso('')

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
    setErro('')
    setSucesso('')

    if (!rotaSelecionada?.rotaId) {
      setErro(
        'Localize e selecione uma rota antes de salvar.',
      )
      return
    }

    const antecedencia =
      Number(antecedenciaHoras)

    if (
      !Number.isInteger(antecedencia) ||
      antecedencia < 0 ||
      antecedencia > 72
    ) {
      setErro(
        'A antecedência deve ser um número inteiro entre 0 e 72 horas.',
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
      rotaId: rotaSelecionada.rotaId,
      emailAtivo,
      webPushAtivo,
      antecedenciaHoras: antecedencia,
    }

    try {
      setSalvando(true)

      const resposta =
        preferencia
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

      setSucesso(
        preferencia
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
        <section className="consulta">
          <p>
            Carregando preferências...
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <section className="consulta">
        <header className="consulta__cabecalho">
          <span className="consulta__marca">
            SIMUL
          </span>

          <h1>
            Preferências de notificação
          </h1>

          <p>
            Escolha a rota que deseja
            acompanhar, os canais de
            notificação e com quanto tempo
            de antecedência deseja receber
            o lembrete.
          </p>
        </header>

        {preferencia ? (
          <div className="mensagem">
            Você já possui uma preferência
            configurada. As alterações serão
            salvas sobre a configuração atual.
          </div>
        ) : (
          <div className="mensagem">
            Você ainda não possui uma preferência
            de notificação configurada.
          </div>
        )}

        {erro && (
          <div
            className="mensagem mensagem--erro"
            role="alert"
          >
            {erro}
          </div>
        )}

        {sucesso && (
          <div
            className="mensagem mensagem--sucesso"
            role="status"
          >
            {sucesso}
          </div>
        )}

        <section className="resultado">
          <h2>1. Localize sua rota</h2>

          <form
            className="consulta__formulario"
            onSubmit={handleConsultarRota}
          >
            <div className="campo">
              <label htmlFor="cidade">
                Cidade
              </label>

              <input
                id="cidade"
                type="text"
                value={cidade}
                onChange={(event) =>
                  setCidade(
                    event.target.value,
                  )
                }
                placeholder="Ex.: Senador Canedo"
                autoComplete="address-level2"
              />
            </div>

            <div className="campo">
              <label htmlFor="bairro">
                Bairro
              </label>

              <input
                id="bairro"
                type="text"
                value={bairro}
                onChange={(event) =>
                  setBairro(
                    event.target.value,
                  )
                }
                placeholder="Ex.: Jardim Nova Goiânia"
                autoComplete="address-level3"
              />
            </div>

            <button
              type="submit"
              disabled={consultandoRota}
            >
              {consultandoRota
                ? 'Localizando...'
                : 'Localizar rota'}
            </button>
          </form>

          {rotaSelecionada && (
            <div className="rota-selecionada">
              <strong>
                Rota selecionada:
              </strong>

              <p>
                {rotaSelecionada.nomeRota}
              </p>

              {rotaSelecionada.cidade && (
                <p>
                  {rotaSelecionada.bairro}
                  {' — '}
                  {rotaSelecionada.cidade}
                </p>
              )}
            </div>
          )}
        </section>

        <section className="resultado">
          <h2>
            2. Configure os canais
          </h2>

          <div className="campo campo-checkbox">
            <label>
              <input
                type="checkbox"
                checked={emailAtivo}
                onChange={(event) =>
                  setEmailAtivo(
                    event.target.checked,
                  )
                }
              />

              Receber lembretes por e-mail
            </label>
          </div>

          <div className="web-push-config">
            <div className="web-push-config__cabecalho">
              <div>
                <strong>
                  Web Push
                </strong>

                <p>
                  Receba lembretes diretamente
                  neste navegador.
                </p>
              </div>

              <span
                className={
                  navegadorInscrito
                    ? 'web-push-status web-push-status--ativo'
                    : 'web-push-status'
                }
              >
                {navegadorInscrito
                  ? 'Ativado'
                  : 'Desativado'}
              </span>
            </div>

            {!webPushDisponivel && (
              <p className="web-push-config__aviso">
                Este navegador não oferece
                suporte a Web Push.
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
                    alterandoWebPush
                  }
                >
                  {alterandoWebPush
                    ? 'Ativando...'
                    : 'Ativar neste navegador'}
                </button>
              )}

            {webPushDisponivel &&
              navegadorInscrito && (
                <>
                  <div className="campo campo-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={webPushAtivo}
                        onChange={(event) =>
                          setWebPushAtivo(
                            event.target.checked,
                          )
                        }
                      />

                      Receber lembretes por Web Push
                    </label>
                  </div>

                  <button
                    type="button"
                    className="web-push-config__botao web-push-config__botao--secundario"
                    onClick={
                      handleDesativarWebPush
                    }
                    disabled={
                      alterandoWebPush
                    }
                  >
                    {alterandoWebPush
                      ? 'Desativando...'
                      : 'Desativar neste navegador'}
                  </button>
                </>
              )}
          </div>

          <div className="campo">
            <label htmlFor="antecedencia">
              Antecedência em horas
            </label>

            <input
              id="antecedencia"
              type="number"
              min="0"
              max="72"
              step="1"
              value={antecedenciaHoras}
              onChange={(event) =>
                setAntecedenciaHoras(
                  event.target.value,
                )
              }
            />

            <small>
              Informe um valor inteiro entre
              0 e 72 horas.
            </small>
          </div>

          <button
            className="botao-salvar"
            type="button"
            onClick={handleSalvar}
            disabled={salvando}
          >
            {salvando
              ? 'Salvando...'
              : 'Salvar preferências'}
          </button>
        </section>

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
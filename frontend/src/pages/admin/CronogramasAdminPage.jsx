import { useEffect, useState } from 'react'

import {
  alterarStatusCronograma,
  atualizarCronograma,
  criarCronograma,
  listarCronogramas,
} from '../../services/adminCronogramaService'

import {
  listarRotas,
} from '../../services/adminRotaService'

const DIAS_SEMANA = [
  'SEGUNDA',
  'TERCA',
  'QUARTA',
  'QUINTA',
  'SEXTA',
  'SABADO',
  'DOMINGO',
]

function CronogramasAdminPage() {
  const [rotas, setRotas] = useState([])
  const [cronogramas, setCronogramas] =
    useState([])

  const [
    cronogramaEmEdicao,
    setCronogramaEmEdicao,
  ] = useState(null)

  const [
    rotaCronogramaId,
    setRotaCronogramaId,
  ] = useState('')

  const [diaSemana, setDiaSemana] =
    useState('SEGUNDA')

  const [horarioInicio, setHorarioInicio] =
    useState('')

  const [horarioFim, setHorarioFim] =
    useState('')

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const [carregando, setCarregando] =
    useState(true)

  const [salvando, setSalvando] =
    useState(false)

  const [
    alterandoStatusId,
    setAlterandoStatusId,
  ] = useState(null)

  useEffect(() => {
    let componenteAtivo = true

    Promise.all([
      listarRotas(),
      listarCronogramas(),
    ])
      .then(([dadosRotas, dadosCronogramas]) => {
        if (!componenteAtivo) {
          return
        }

        setRotas(
          Array.isArray(dadosRotas)
            ? dadosRotas
            : [],
        )

        setCronogramas(
          Array.isArray(dadosCronogramas)
            ? dadosCronogramas
            : [],
        )
      })
      .catch((error) => {
        if (!componenteAtivo) {
          return
        }

        setErro(
          error.message ||
            'Não foi possível carregar os cronogramas.',
        )
      })
      .finally(() => {
        if (componenteAtivo) {
          setCarregando(false)
        }
      })

    return () => {
      componenteAtivo = false
    }
  }, [])

  async function recarregarCronogramas() {
    const dados = await listarCronogramas()

    setCronogramas(
      Array.isArray(dados)
        ? dados
        : [],
    )
  }

  function limparFormulario({
    manterRota = false,
  } = {}) {
    setCronogramaEmEdicao(null)

    if (!manterRota) {
      setRotaCronogramaId('')
    }

    setDiaSemana('SEGUNDA')
    setHorarioInicio('')
    setHorarioFim('')
  }

  function iniciarEdicao(cronograma) {
    setErro('')
    setSucesso('')

    setCronogramaEmEdicao(cronograma)

    setRotaCronogramaId(
      String(cronograma.rotaId ?? ''),
    )

    setDiaSemana(
      cronograma.diaSemana ?? 'SEGUNDA',
    )

    setHorarioInicio(
      cronograma.horarioInicio?.slice(0, 5) ??
        '',
    )

    setHorarioFim(
      cronograma.horarioFim?.slice(0, 5) ??
        '',
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function cancelarEdicao() {
    limparFormulario()

    setErro('')
    setSucesso('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setErro('')
    setSucesso('')

    if (
      !rotaCronogramaId ||
      !diaSemana ||
      !horarioInicio ||
      !horarioFim
    ) {
      setErro(
        'Informe a rota, o dia da semana e os horários.',
      )
      return
    }

    if (horarioInicio === horarioFim) {
      setErro(
        'O horário inicial e o horário final não podem ser iguais.',
      )
      return
    }

    const rotaId = Number(
      rotaCronogramaId,
    )

    if (!Number.isInteger(rotaId)) {
      setErro(
        'Selecione uma rota válida.',
      )
      return
    }

    const dados = {
      rotaId,
      diaSemana,
      horarioInicio: `${horarioInicio}:00`,
      horarioFim: `${horarioFim}:00`,
    }

    try {
      setSalvando(true)

      if (cronogramaEmEdicao) {
        await atualizarCronograma(
          cronogramaEmEdicao.id,
          dados,
        )

        setSucesso(
          'Cronograma atualizado com sucesso.',
        )

        limparFormulario()
      } else {
        await criarCronograma(dados)

        setSucesso(
          'Cronograma cadastrado com sucesso. Você pode adicionar outro horário para a mesma rota.',
        )

        limparFormulario({
          manterRota: true,
        })
      }

      await recarregarCronogramas()
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível salvar o cronograma.',
      )
    } finally {
      setSalvando(false)
    }
  }

  async function handleAlterarStatus(
    cronograma,
  ) {
    setErro('')
    setSucesso('')

    const novoStatus =
      !cronograma.ativo

    try {
      setAlterandoStatusId(
        cronograma.id,
      )

      await alterarStatusCronograma(
        cronograma.id,
        novoStatus,
      )

      await recarregarCronogramas()

      setSucesso(
        novoStatus
          ? 'Cronograma ativado com sucesso.'
          : 'Cronograma desativado com sucesso.',
      )
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível alterar o status do cronograma.',
      )
    } finally {
      setAlterandoStatusId(null)
    }
  }

  function obterNomeRota(rotaId) {
    const rota = rotas.find(
      (item) => item.id === rotaId,
    )

    return rota?.nome ?? `Rota ${rotaId}`
  }

  return (
    <>
      <header className="admin-secao__cabecalho">
        <h2>Cronogramas</h2>

        <p>
          Configure os dias e horários de coleta
          associados a cada rota.
        </p>
      </header>

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
        <h3>
          {cronogramaEmEdicao
            ? 'Editar cronograma'
            : 'Cadastrar cronograma'}
        </h3>

        <form
          className="consulta__formulario"
          onSubmit={handleSubmit}
        >
          <div className="campo">
            <label htmlFor="rotaCronograma">
              Rota
            </label>

            <select
              id="rotaCronograma"
              value={rotaCronogramaId}
              onChange={(event) =>
                setRotaCronogramaId(
                  event.target.value,
                )
              }
              disabled={carregando}
            >
              <option value="">
                Selecione uma rota
              </option>

              {rotas.map((rota) => (
                <option
                  key={rota.id}
                  value={rota.id}
                  disabled={!rota.ativo}
                >
                  {rota.nome}
                  {!rota.ativo
                    ? ' — Inativa'
                    : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="diaSemana">
              Dia da semana
            </label>

            <select
              id="diaSemana"
              value={diaSemana}
              onChange={(event) =>
                setDiaSemana(
                  event.target.value,
                )
              }
            >
              {DIAS_SEMANA.map((dia) => (
                <option
                  key={dia}
                  value={dia}
                >
                  {dia}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="horarioInicio">
              Horário inicial
            </label>

            <input
              id="horarioInicio"
              type="time"
              value={horarioInicio}
              onChange={(event) =>
                setHorarioInicio(
                  event.target.value,
                )
              }
            />
          </div>

          <div className="campo">
            <label htmlFor="horarioFim">
              Horário final
            </label>

            <input
              id="horarioFim"
              type="time"
              value={horarioFim}
              onChange={(event) =>
                setHorarioFim(
                  event.target.value,
                )
              }
            />
          </div>

          <button
            type="submit"
            disabled={salvando}
          >
            {salvando
              ? 'Salvando...'
              : cronogramaEmEdicao
                ? 'Salvar alterações'
                : 'Cadastrar cronograma'}
          </button>

          {cronogramaEmEdicao && (
            <button
              type="button"
              onClick={cancelarEdicao}
              disabled={salvando}
            >
              Cancelar edição
            </button>
          )}
        </form>
      </section>

      <section className="resultado">
        <h3>Cronogramas cadastrados</h3>

        {carregando ? (
          <p>
            Carregando cronogramas...
          </p>
        ) : cronogramas.length === 0 ? (
          <p>
            Nenhum cronograma cadastrado.
          </p>
        ) : (
          <div className="lista-rotas">
            {cronogramas.map(
              (cronograma) => (
                <article
                  className="rota-admin"
                  key={cronograma.id}
                >
                  <div className="rota-admin__conteudo">
                    <h3>
                      {obterNomeRota(
                        cronograma.rotaId,
                      )}
                    </h3>

                    <p>
                      <strong>Dia:</strong>{' '}
                      {cronograma.diaSemana}
                    </p>

                    <p>
                      <strong>Horário:</strong>{' '}
                      {cronograma.horarioInicio}
                      {' — '}
                      {cronograma.horarioFim}
                    </p>

                    <p>
                      <strong>Status:</strong>{' '}
                      {cronograma.ativo
                        ? 'Ativo'
                        : 'Inativo'}
                    </p>
                  </div>

                  <div className="rota-admin__acoes">
                    <button
                      type="button"
                      onClick={() =>
                        iniciarEdicao(
                          cronograma,
                        )
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleAlterarStatus(
                          cronograma,
                        )
                      }
                      disabled={
                        alterandoStatusId ===
                        cronograma.id
                      }
                    >
                      {alterandoStatusId ===
                      cronograma.id
                        ? 'Alterando...'
                        : cronograma.ativo
                          ? 'Desativar'
                          : 'Ativar'}
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </>
  )
}

export default CronogramasAdminPage
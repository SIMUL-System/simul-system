import { useState } from 'react'

import CamposHorario from '../cronograma/CamposHorario'
import {
  ATALHOS_DIAS,
  DIAS_SEMANA,
  faixasDaSemana,
  listarDias,
  viraODia,
} from '../../../utils/cronogramas'

const HORARIO_PADRAO = { inicio: '06:00', fim: '18:00' }

/**
 * Editor dos dias e do horário de coleta de uma rota.
 * Por padrão todos os dias usam o mesmo horário; se a rota precisar,
 * "Horário diferente por dia" libera um horário para cada dia.
 * Componente controlado: recebe a semana e devolve a semana alterada.
 */
function SemanaColeta({ idBase, semana, onAlterar, disabled }) {
  const diasMarcados = DIAS_SEMANA.filter((dia) => semana[dia.valor])
  const faixas = faixasDaSemana(semana)

  const [porDia, setPorDia] = useState(faixas.length > 1)
  const [horarioComum, setHorarioComum] = useState(
    diasMarcados.length > 0 ? semana[diasMarcados[0].valor] : HORARIO_PADRAO,
  )

  function alternarDia(valor) {
    const nova = { ...semana }

    if (nova[valor]) {
      delete nova[valor]
    } else {
      nova[valor] = { ...horarioComum }
    }

    onAlterar(nova)
  }

  function aplicarAtalho(dias) {
    onAlterar(Object.fromEntries(dias.map((dia) => [dia, semana[dia] ?? { ...horarioComum }])))
  }

  function alterarHorarioComum(horario) {
    setHorarioComum(horario)
    onAlterar(Object.fromEntries(Object.keys(semana).map((dia) => [dia, { ...horario }])))
  }

  function alterarHorarioDoDia(dia, horario) {
    onAlterar({ ...semana, [dia]: horario })
  }

  function alternarPorDia(ligar) {
    setPorDia(ligar)

    // Ao voltar para "mesmo horário", todos os dias recebem o horário comum.
    if (!ligar) {
      alterarHorarioComum(horarioComum)
    }
  }

  const resumoDias = listarDias(Object.keys(semana), 'curto')
  const algumViraODia = Object.values(semana).some((dia) => viraODia(dia.inicio, dia.fim))

  return (
    <div className="semana-coleta">
      <fieldset className="semana-coleta__grupo">
        <legend className="campo-ds__rotulo">Dias de coleta</legend>

        <div className="seletor-dias__grade">
          {DIAS_SEMANA.map((dia) => (
            <button
              key={dia.valor}
              type="button"
              className="seletor-dias__dia"
              aria-pressed={Boolean(semana[dia.valor])}
              aria-label={dia.longo}
              onClick={() => alternarDia(dia.valor)}
              disabled={disabled}
            >
              {dia.curto}
            </button>
          ))}
        </div>

        <div className="atalhos" role="group" aria-label="Marcar dias de uma vez">
          {ATALHOS_DIAS.map((atalho) => (
            <button
              key={atalho.rotulo}
              type="button"
              className="atalho"
              aria-pressed={
                atalho.dias.length === diasMarcados.length &&
                atalho.dias.every((dia) => semana[dia])
              }
              onClick={() => aplicarAtalho(atalho.dias)}
              disabled={disabled}
            >
              {atalho.rotulo}
            </button>
          ))}
        </div>
      </fieldset>

      {!porDia ? (
        <CamposHorario
          idBase={`${idBase}-comum`}
          inicio={horarioComum.inicio}
          fim={horarioComum.fim}
          onAlterar={alterarHorarioComum}
          disabled={disabled}
        />
      ) : (
        <fieldset className="semana-coleta__grupo">
          <legend className="campo-ds__rotulo">Horário de cada dia</legend>

          {diasMarcados.length === 0 ? (
            <p className="campo-ds__dica">
              Marque os dias acima para definir o horário de cada um.
            </p>
          ) : (
            <ul className="semana-coleta__dias">
              {diasMarcados.map((dia) => (
                <li key={dia.valor} className="semana-coleta__dia">
                  <span className="semana-coleta__nome-dia">{dia.curto}</span>

                  <label className="visualmente-oculto" htmlFor={`${idBase}-${dia.valor}-inicio`}>
                    Início na {dia.longo}
                  </label>
                  <input
                    id={`${idBase}-${dia.valor}-inicio`}
                    type="time"
                    className="campo-ds__controle"
                    value={semana[dia.valor].inicio}
                    onChange={(event) =>
                      alterarHorarioDoDia(dia.valor, {
                        ...semana[dia.valor],
                        inicio: event.target.value,
                      })
                    }
                    disabled={disabled}
                  />

                  <span aria-hidden="true">às</span>

                  <label className="visualmente-oculto" htmlFor={`${idBase}-${dia.valor}-fim`}>
                    Fim na {dia.longo}
                  </label>
                  <input
                    id={`${idBase}-${dia.valor}-fim`}
                    type="time"
                    className="campo-ds__controle"
                    value={semana[dia.valor].fim}
                    onChange={(event) =>
                      alterarHorarioDoDia(dia.valor, {
                        ...semana[dia.valor],
                        fim: event.target.value,
                      })
                    }
                    disabled={disabled}
                  />
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      )}

      <label className="caixa-opcao">
        <input
          type="checkbox"
          checked={porDia}
          onChange={(event) => alternarPorDia(event.target.checked)}
          disabled={disabled}
        />
        <span>Horário diferente em algum dia</span>
      </label>

      <p
        className={`semana-coleta__previa${diasMarcados.length === 0 ? ' semana-coleta__previa--vazia' : ''}`}
        aria-live="polite"
      >
        {diasMarcados.length === 0 ? (
          'Nenhum dia marcado: os bairros desta rota ficariam sem coleta.'
        ) : (
          <>
            O morador verá: <strong>coleta {resumoDias}</strong>
            {faixasDaSemana(semana).length === 1
              ? `, das ${diasMarcados.length ? semana[diasMarcados[0].valor].inicio : ''} às ${
                  diasMarcados.length ? semana[diasMarcados[0].valor].fim : ''
                }.`
              : ', com horários diferentes por dia.'}
            {algumViraODia && ' A coleta termina no dia seguinte.'}
          </>
        )}
      </p>
    </div>
  )
}

export default SemanaColeta

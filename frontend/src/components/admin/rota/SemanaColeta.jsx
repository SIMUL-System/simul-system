import Icone from '../../Icone'
import CamposHorario from '../cronograma/CamposHorario'
import {
  ATALHOS_DIAS,
  DIAS_SEMANA,
  listarDias,
  resumirSemana,
  TURNOS,
  viraODia,
} from '../../../utils/cronogramas'

/**
 * Editor da semana de coleta de uma rota, um bloco por turno (diurno e
 * noturno). Em cada turno: os dias e, só se a prefeitura informar, o
 * horário. Um mesmo dia pode ter coleta nos dois turnos.
 * O bloco "Turno não informado" só aparece quando a rota já tem dias assim.
 * Componente controlado: recebe a semana e devolve a semana alterada.
 */
function SemanaColeta({ idBase, semana, onAlterar, disabled }) {
  const turnosVisiveis = TURNOS.filter(
    (turno) => turno.valor !== 'NAO_INFORMADO' || semana.NAO_INFORMADO.dias.length > 0,
  )

  function alterarTurno(valor, mudancas) {
    onAlterar({ ...semana, [valor]: { ...semana[valor], ...mudancas } })
  }

  function alternarDia(turno, dia) {
    const dias = semana[turno].dias

    alterarTurno(turno, {
      dias: dias.includes(dia) ? dias.filter((item) => item !== dia) : [...dias, dia],
    })
  }

  const totalDias = TURNOS.reduce((soma, turno) => soma + semana[turno.valor].dias.length, 0)
  const comDias = TURNOS.map((turno) => semana[turno.valor]).filter((bloco) => bloco.dias.length)
  const algumSemHorario = comDias.some((bloco) => !bloco.informado)
  const algumViraODia = comDias.some(
    (bloco) => bloco.informado && viraODia(bloco.inicio, bloco.fim),
  )

  return (
    <div className="semana-coleta">
      {turnosVisiveis.map((turno) => {
        const bloco = semana[turno.valor]
        const idTurno = `${idBase}-${turno.valor.toLowerCase()}`

        return (
          <fieldset
            key={turno.valor}
            className={`turno-coleta turno-coleta--${turno.valor.toLowerCase()}`}
          >
            <legend className="turno-coleta__titulo">
              <Icone nome={turno.icone} tamanho={18} />
              {turno.valor === 'NAO_INFORMADO' ? 'Turno não informado' : `Coleta ${turno.adjetivo}`}
              <span className="turno-coleta__resumo">
                {bloco.dias.length === 0 ? 'nenhum dia' : listarDias(bloco.dias, 'curto')}
              </span>
            </legend>

            {turno.valor === 'NAO_INFORMADO' && (
              <p className="campo-ds__dica">
                A fonte da prefeitura não diz o turno destes dias. Se souber, marque os dias no
                turno certo e desmarque aqui.
              </p>
            )}

            <div
              className="seletor-dias__grade"
              role="group"
              aria-label={`Dias da coleta ${turno.adjetivo}`}
            >
              {DIAS_SEMANA.map((dia) => (
                <button
                  key={dia.valor}
                  type="button"
                  className="seletor-dias__dia"
                  aria-pressed={bloco.dias.includes(dia.valor)}
                  aria-label={`${dia.longo}, ${turno.rotulo.toLowerCase()}`}
                  onClick={() => alternarDia(turno.valor, dia.valor)}
                  disabled={disabled}
                >
                  {dia.curto}
                </button>
              ))}
            </div>

            {turno.valor !== 'NAO_INFORMADO' && (
              <div
                className="atalhos"
                role="group"
                aria-label={`Marcar dias da coleta ${turno.adjetivo}`}
              >
                {ATALHOS_DIAS.map((atalho) => (
                  <button
                    key={atalho.rotulo}
                    type="button"
                    className="atalho"
                    aria-pressed={
                      atalho.dias.length === bloco.dias.length &&
                      atalho.dias.every((dia) => bloco.dias.includes(dia))
                    }
                    onClick={() => alterarTurno(turno.valor, { dias: [...atalho.dias] })}
                    disabled={disabled}
                  >
                    {atalho.rotulo}
                  </button>
                ))}
                {bloco.dias.length > 0 && (
                  <button
                    type="button"
                    className="botao-link"
                    onClick={() => alterarTurno(turno.valor, { dias: [] })}
                    disabled={disabled}
                  >
                    Limpar
                  </button>
                )}
              </div>
            )}

            {bloco.dias.length > 0 && (
              <>
                <label className="caixa-opcao">
                  <input
                    type="checkbox"
                    checked={bloco.informado}
                    onChange={(event) =>
                      alterarTurno(turno.valor, { informado: event.target.checked })
                    }
                    disabled={disabled}
                  />
                  <span>A prefeitura informa o horário deste turno</span>
                </label>

                {bloco.informado && (
                  <CamposHorario
                    idBase={idTurno}
                    legenda={`Horário da coleta ${turno.adjetivo}`}
                    inicio={bloco.inicio}
                    fim={bloco.fim}
                    onAlterar={(horario) => alterarTurno(turno.valor, horario)}
                    disabled={disabled}
                  />
                )}
              </>
            )}
          </fieldset>
        )
      })}

      <p
        className={`semana-coleta__previa${totalDias === 0 ? ' semana-coleta__previa--vazia' : ''}`}
        aria-live="polite"
      >
        {totalDias === 0 ? (
          'Nenhum dia marcado: os bairros desta rota ficariam sem coleta.'
        ) : (
          <>
            O morador verá: <strong>coleta {resumirSemana(semana)}</strong>.
            {algumSemHorario && ' Sem horário, a consulta mostra só o turno.'}
            {algumViraODia && ' A coleta termina no dia seguinte.'}
          </>
        )}
      </p>
    </div>
  )
}

export default SemanaColeta

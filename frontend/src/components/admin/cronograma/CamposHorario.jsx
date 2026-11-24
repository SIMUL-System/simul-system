import { ATALHOS_HORARIO } from '../../../utils/cronogramas'

/**
 * Início e fim da coleta, com atalhos para os dois períodos da cidade.
 */
function CamposHorario({ idBase, inicio, fim, onAlterar, disabled }) {
  return (
    <fieldset className="campos-horario">
      <legend className="campo-ds__rotulo">Horário da coleta</legend>

      <div className="campos-horario__linha">
        <div className="campo-ds">
          <label className="campo-ds__rotulo campo-ds__rotulo--leve" htmlFor={`${idBase}-inicio`}>
            Início
          </label>

          <input
            id={`${idBase}-inicio`}
            type="time"
            className="campo-ds__controle"
            value={inicio}
            onChange={(event) => onAlterar({ inicio: event.target.value, fim })}
            required
            disabled={disabled}
          />
        </div>

        <div className="campo-ds">
          <label className="campo-ds__rotulo campo-ds__rotulo--leve" htmlFor={`${idBase}-fim`}>
            Fim
          </label>

          <input
            id={`${idBase}-fim`}
            type="time"
            className="campo-ds__controle"
            value={fim}
            onChange={(event) => onAlterar({ inicio, fim: event.target.value })}
            required
            disabled={disabled}
          />
        </div>
      </div>

      <div className="atalhos" role="group" aria-label="Preencher horário">
        {ATALHOS_HORARIO.map((atalho) => (
          <button
            key={atalho.rotulo}
            type="button"
            className="atalho"
            aria-pressed={inicio === atalho.inicio && fim === atalho.fim}
            onClick={() => onAlterar({ inicio: atalho.inicio, fim: atalho.fim })}
            disabled={disabled}
          >
            {atalho.rotulo} {atalho.inicio}–{atalho.fim}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export default CamposHorario

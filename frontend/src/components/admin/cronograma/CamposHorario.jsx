/**
 * Início e fim da coleta. Só para quando a prefeitura informa o horário:
 * não há atalhos com horários prontos, para nada ser inventado.
 */
function CamposHorario({
  idBase,
  inicio,
  fim,
  onAlterar,
  disabled,
  legenda = 'Horário da coleta',
}) {
  return (
    <fieldset className="campos-horario">
      <legend className="campo-ds__rotulo">{legenda}</legend>

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
    </fieldset>
  )
}

export default CamposHorario

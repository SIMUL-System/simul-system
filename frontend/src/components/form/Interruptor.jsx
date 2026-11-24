/**
 * Interruptor liga/desliga: checkbox nativo com role="switch",
 * acessível por teclado (Espaço) e anunciado como "ligado/desligado".
 */
function Interruptor({
  id,
  rotulo,
  descricao,
  checked,
  onChange,
  disabled,
}) {
  const idDescricao = descricao ? `${id}-descricao` : undefined

  return (
    <div className="interruptor">
      <input
        id={id}
        type="checkbox"
        role="switch"
        className="interruptor__controle"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-describedby={idDescricao}
      />

      <label
        htmlFor={id}
        className="interruptor__rotulo"
      >
        <span className="interruptor__texto">
          {rotulo}
        </span>

        {descricao && (
          <span
            id={idDescricao}
            className="interruptor__descricao"
          >
            {descricao}
          </span>
        )}
      </label>
    </div>
  )
}

export default Interruptor

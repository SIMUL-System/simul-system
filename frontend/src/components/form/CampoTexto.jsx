import Icone from '../Icone'

/**
 * Field do Design System: rótulo visível, controle, dica e erro ligados
 * por aria-describedby.
 */
function CampoTexto({
  id,
  rotulo,
  dica,
  erro,
  ...props
}) {
  // Com erro, a dica sai: a mensagem de erro já diz como corrigir.
  const mostrarDica = Boolean(dica) && !erro

  const idDica = mostrarDica ? `${id}-dica` : null
  const idErro = erro ? `${id}-erro` : null

  const descricao =
    [idErro, idDica].filter(Boolean).join(' ') || undefined

  return (
    <div className="campo-ds">
      <label
        className="campo-ds__rotulo"
        htmlFor={id}
      >
        {rotulo}
      </label>

      <input
        id={id}
        className="campo-ds__controle"
        aria-invalid={Boolean(erro)}
        aria-describedby={descricao}
        {...props}
      />

      {erro && (
        <p
          id={idErro}
          className="campo-ds__erro"
          role="alert"
        >
          <Icone
            nome="erro"
            tamanho={16}
          />
          {erro}
        </p>
      )}

      {mostrarDica && (
        <p
          id={idDica}
          className="campo-ds__dica"
        >
          {dica}
        </p>
      )}
    </div>
  )
}

export default CampoTexto

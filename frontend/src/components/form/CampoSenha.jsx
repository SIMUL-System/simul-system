import { useState } from 'react'

import Icone from '../Icone'

/**
 * Campo de senha com botão para mostrar/ocultar (aria-pressed).
 */
function CampoSenha({ id, rotulo, dica, erro, disabled, ...props }) {
  const [visivel, setVisivel] = useState(false)

  // Com erro, a dica sai: a mensagem de erro já diz como corrigir.
  const mostrarDica = Boolean(dica) && !erro

  const idDica = mostrarDica ? `${id}-dica` : null
  const idErro = erro ? `${id}-erro` : null

  const descricao = [idErro, idDica].filter(Boolean).join(' ') || undefined

  return (
    <div className="campo-ds">
      <label className="campo-ds__rotulo" htmlFor={id}>
        {rotulo}
      </label>

      <div className="campo-ds__senha">
        <input
          id={id}
          type={visivel ? 'text' : 'password'}
          className="campo-ds__controle"
          aria-invalid={Boolean(erro)}
          aria-describedby={descricao}
          disabled={disabled}
          {...props}
        />

        <button
          type="button"
          className="campo-ds__mostrar"
          onClick={() => setVisivel((atual) => !atual)}
          aria-pressed={visivel}
          aria-label={
            visivel ? `Ocultar ${rotulo.toLowerCase()}` : `Mostrar ${rotulo.toLowerCase()}`
          }
          disabled={disabled}
        >
          <Icone nome={visivel ? 'olhoFechado' : 'olho'} />
        </button>
      </div>

      {erro && (
        <p id={idErro} className="campo-ds__erro" role="alert">
          <Icone nome="erro" tamanho={16} />
          {erro}
        </p>
      )}

      {mostrarDica && (
        <p id={idDica} className="campo-ds__dica">
          {dica}
        </p>
      )}
    </div>
  )
}

export default CampoSenha

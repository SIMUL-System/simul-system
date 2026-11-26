import { useEffect, useId, useState } from 'react'

import Icone from '../../Icone'
import { prepararFoto } from '../../../utils/imagem'

/**
 * Escolha de foto com prévia. A foto é reduzida no navegador (máx. 1600 px,
 * JPEG) antes de chegar ao formulário; onEscolher recebe o arquivo pronto.
 */
function CampoFoto({ rotulo, dica, fotoAtual, onEscolher, disabled, redonda = false }) {
  const id = useId()
  const [previa, setPrevia] = useState('')
  const [preparando, setPreparando] = useState(false)
  const [erro, setErro] = useState('')

  // Libera a prévia anterior da memória.
  useEffect(() => () => previa && URL.revokeObjectURL(previa), [previa])

  async function handleChange(event) {
    const arquivo = event.target.files?.[0]
    event.target.value = ''

    if (!arquivo) return

    setErro('')
    setPreparando(true)

    try {
      const pronta = await prepararFoto(arquivo)
      setPrevia(URL.createObjectURL(pronta))
      onEscolher(pronta)
    } catch (error) {
      setErro(error.message || 'Não foi possível usar esta foto.')
      onEscolher(null)
    } finally {
      setPreparando(false)
    }
  }

  const imagem = previa || fotoAtual

  return (
    <div className="campo-foto">
      <span className="campo-ds__rotulo">{rotulo}</span>

      <div className="campo-foto__linha">
        <span className={`campo-foto__previa${redonda ? ' campo-foto__previa--redonda' : ''}`}>
          {imagem ? <img src={imagem} alt="" /> : <Icone nome="imagem" tamanho={28} />}
        </span>

        <div className="campo-foto__acoes">
          <label
            htmlFor={id}
            className={`botao botao--secundario botao--pequeno${disabled ? ' campo-foto__desabilitado' : ''}`}
          >
            {preparando ? 'Preparando…' : imagem ? 'Trocar foto' : 'Escolher foto'}
          </label>
          <input
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="visualmente-oculto"
            onChange={handleChange}
            disabled={disabled || preparando}
          />
          {dica && <p className="campo-ds__dica">{dica}</p>}
        </div>
      </div>

      {erro && (
        <p className="campo-ds__erro" role="alert">
          <Icone nome="erro" tamanho={16} />
          {erro}
        </p>
      )}
    </div>
  )
}

export default CampoFoto

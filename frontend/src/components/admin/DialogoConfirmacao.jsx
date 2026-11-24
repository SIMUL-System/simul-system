import { useEffect, useId, useRef } from 'react'

import Icone from '../Icone'

/**
 * Confirmação acessível que substitui o window.confirm.
 * Usa o <dialog> nativo em modo modal: prende o foco, fecha com Esc
 * e devolve o foco a quem abriu. O foco começa no botão "seguro".
 */
function DialogoConfirmacao({
  aberto,
  titulo,
  children,
  textoConfirmar,
  textoCancelar = 'Cancelar',
  perigo = false,
  processando = false,
  onConfirmar,
  onCancelar,
}) {
  const dialogoRef = useRef(null)
  const idTitulo = useId()
  const idDescricao = useId()

  useEffect(() => {
    const dialogo = dialogoRef.current

    if (!dialogo) {
      return
    }

    if (aberto && !dialogo.open) {
      dialogo.showModal()
    }

    if (!aberto && dialogo.open) {
      dialogo.close()
    }
  }, [aberto])

  function handleCancel(event) {
    // Esc: o React decide se fecha, para não fechar no meio do salvamento.
    event.preventDefault()

    if (!processando) {
      onCancelar()
    }
  }

  return (
    <dialog
      ref={dialogoRef}
      className="dialogo"
      role="alertdialog"
      aria-labelledby={idTitulo}
      aria-describedby={idDescricao}
      onCancel={handleCancel}
    >
      {aberto && (
        <div className="dialogo__conteudo">
          <span
            className={`dialogo__icone ${perigo ? 'dialogo__icone--perigo' : ''}`}
          >
            <Icone
              nome="aviso"
              tamanho={22}
            />
          </span>

          <h2
            id={idTitulo}
            className="dialogo__titulo"
          >
            {titulo}
          </h2>

          <div
            id={idDescricao}
            className="dialogo__texto"
          >
            {children}
          </div>

          <div className="dialogo__acoes">
            <button
              type="button"
              className="botao botao--secundario"
              onClick={onCancelar}
              disabled={processando}
              autoFocus
            >
              {textoCancelar}
            </button>

            <button
              type="button"
              className={`botao ${perigo ? 'botao--perigo' : 'botao--primario'}`}
              onClick={onConfirmar}
              disabled={processando}
            >
              {processando ? 'Aguarde…' : textoConfirmar}
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}

export default DialogoConfirmacao

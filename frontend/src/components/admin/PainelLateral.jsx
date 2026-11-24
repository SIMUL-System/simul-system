import { useEffect, useId, useRef } from 'react'

import Icone from '../Icone'

/**
 * Painel de edição ao lado da lista (no celular, logo abaixo dela).
 * Ao abrir ou trocar de assunto, leva o foco para o título, para quem
 * usa teclado ou leitor de tela saber onde está. Esc fecha.
 */
function PainelLateral({
  titulo,
  chave,
  onFechar,
  children,
}) {
  const idTitulo = useId()
  const tituloRef = useRef(null)
  const painelRef = useRef(null)

  useEffect(() => {
    tituloRef.current?.focus()

    if (window.matchMedia?.('(max-width: 1023px)').matches) {
      painelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [chave])

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onFechar()
    }
  }

  return (
    <aside
      ref={painelRef}
      className="painel-lateral"
      aria-labelledby={idTitulo}
      onKeyDown={handleKeyDown}
    >
      <div className="painel-lateral__topo">
        <h2
          id={idTitulo}
          ref={tituloRef}
          className="painel-lateral__titulo"
          tabIndex={-1}
        >
          {titulo}
        </h2>

        <button
          type="button"
          className="botao-icone"
          onClick={onFechar}
          aria-label="Fechar painel"
        >
          <Icone nome="fechar" />
        </button>
      </div>

      {children}
    </aside>
  )
}

export default PainelLateral

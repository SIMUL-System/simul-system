import { useEffect, useState } from 'react'

import { inscreverServidorLento } from '../services/api'

/**
 * Aviso fixo no rodapé quando uma requisição passa de alguns segundos.
 * Na hospedagem gratuita o servidor "dorme" e a primeira resposta pode
 * levar até 1 minuto: sem este aviso, parecia que o site travou.
 */
function AvisoServidorLento() {
  const [ativo, setAtivo] = useState(false)

  useEffect(() => inscreverServidorLento(setAtivo), [])

  return (
    <div className="aviso-servidor" role="status" aria-live="polite">
      {ativo && (
        <div className="aviso-servidor__caixa">
          <span className="carregando__spinner" aria-hidden="true" />
          <span>
            <strong>Conectando ao servidor…</strong> Ele pode estar iniciando; a primeira resposta
            pode levar até 1 minuto.
          </span>
        </div>
      )}
    </div>
  )
}

export default AvisoServidorLento

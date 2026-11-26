import { useState } from 'react'
import { Link } from 'react-router-dom'

import { CHAVE_AVISO_ARMAZENAMENTO } from '../conteudo/legal'

function avisoJaVisto() {
  try {
    return localStorage.getItem(CHAVE_AVISO_ARMAZENAMENTO) === 'visto'
  } catch {
    return false
  }
}

/**
 * Aviso sobre o que o site guarda no navegador. O SIMUL só usa armazenamento
 * necessário para funcionar (login, tema, progresso do guia), que não depende
 * de consentimento pela LGPD; por isso é um aviso, e não um pedido de permissão.
 */
function AvisoArmazenamento() {
  const [visivel, setVisivel] = useState(() => !avisoJaVisto())

  if (!visivel) {
    return null
  }

  function fechar() {
    try {
      localStorage.setItem(CHAVE_AVISO_ARMAZENAMENTO, 'visto')
    } catch {
      // Navegador sem armazenamento: o aviso só some até recarregar a página.
    }

    setVisivel(false)
  }

  return (
    <section className="aviso-armazenamento" aria-label="Aviso sobre cookies e armazenamento">
      <p>
        <strong>Sem cookies de propaganda.</strong> Guardamos no seu navegador só o necessário para
        o site funcionar, como o login e o tema escolhido.{' '}
        <Link to="/privacidade#armazenamento">Saiba mais</Link>
      </p>

      <button type="button" className="botao botao--primario botao--pequeno" onClick={fechar}>
        Entendi
      </button>
    </section>
  )
}

export default AvisoArmazenamento

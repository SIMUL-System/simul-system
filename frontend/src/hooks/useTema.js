import { useCallback, useEffect, useState } from 'react'

const CHAVE_TEMA = 'simul-tema'

/** Tema aplicado no carregamento (o index.html já escolhe antes do React). */
function lerTemaInicial() {
  const atual = document.documentElement.dataset.theme

  return atual === 'dark' ? 'dark' : 'light'
}

/**
 * Tema claro/escuro do SIMUL.
 * O index.html já aplica o tema antes da primeira pintura
 * (preferência salva ou prefers-color-scheme); este hook
 * apenas lê, alterna e persiste a escolha do usuário.
 */
export function useTema() {
  const [tema, setTema] = useState(lerTemaInicial)

  useEffect(() => {
    document.documentElement.dataset.theme = tema

    const meta = document.querySelector('meta[name="theme-color"]')

    if (meta) {
      meta.setAttribute('content', tema === 'dark' ? '#0d1520' : '#0b5cad')
    }
  }, [tema])

  const alternarTema = useCallback(() => {
    setTema((atual) => {
      const proximo = atual === 'dark' ? 'light' : 'dark'

      try {
        localStorage.setItem(CHAVE_TEMA, proximo)
      } catch {
        // Navegação privada ou armazenamento bloqueado:
        // o tema continua valendo nesta sessão.
      }

      return proximo
    })
  }, [])

  return {
    tema,
    alternarTema,
  }
}

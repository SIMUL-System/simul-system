import { useEffect, useState } from 'react'

/** Lê as cores atuais dos tokens CSS (mudam com o tema). */
function lerCores(nomes) {
  const estilo = getComputedStyle(document.documentElement)

  return Object.fromEntries(
    nomes.map((nome) => [nome, estilo.getPropertyValue(`--${nome}`).trim()]),
  )
}

/**
 * Lê tokens de cor (ex.: 'brand-blue') do tema atual e atualiza quando
 * <html data-theme> muda. Útil para bibliotecas que exigem a cor em
 * JavaScript, como o Leaflet.
 */
export function useCoresTema(nomes) {
  const chave = nomes.join('|')

  const [cores, setCores] = useState(() => lerCores(nomes))

  useEffect(() => {
    const lista = chave.split('|')

    const observador = new MutationObserver(() => {
      setCores(lerCores(lista))
    })

    observador.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => observador.disconnect()
  }, [chave])

  return cores
}

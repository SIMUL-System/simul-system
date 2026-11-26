import { useOutletContext } from 'react-router-dom'

/**
 * Cidade escolhida no painel admin (definida em AdminPage):
 * { cidade, cidades, recarregarCidades }.
 */
export default function useCidadeAdmin() {
  return useOutletContext()
}

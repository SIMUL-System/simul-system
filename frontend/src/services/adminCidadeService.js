import { apiRequest } from './api'
import { obterToken } from './authService'

/** GET /api/admin/cidades: cidades com rotas, bairros, coletas e pendências. */
function listarCidades() {
  return apiRequest('/api/admin/cidades', {
    token: obterToken(),
  })
}

export { listarCidades }

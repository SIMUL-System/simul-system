import { apiRequest } from './api'
import { obterToken } from './authService'

/** GET /api/admin/rotas */
function listarRotas() {
  return apiRequest('/api/admin/rotas', {
    token: obterToken(),
  })
}

/** POST /api/admin/rotas */
function criarRota(dados) {
  return apiRequest('/api/admin/rotas', {
    method: 'POST',
    token: obterToken(),
    body: dados,
  })
}

/** PUT /api/admin/rotas/{id} */
function atualizarRota(id, dados) {
  return apiRequest(`/api/admin/rotas/${id}`, {
    method: 'PUT',
    token: obterToken(),
    body: dados,
  })
}

/** PATCH /api/admin/rotas/{id}/status */
function alterarStatusRota(id, ativo) {
  return apiRequest(`/api/admin/rotas/${id}/status?ativo=${ativo}`, {
    method: 'PATCH',
    token: obterToken(),
  })
}

export { listarRotas, criarRota, atualizarRota, alterarStatusRota }

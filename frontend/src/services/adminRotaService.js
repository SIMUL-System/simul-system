import { apiRequest } from './api'
import { obterToken } from './authService'

function listarRotas() {
  return apiRequest('/api/admin/rotas', {
    token: obterToken(),
  })
}

function criarRota(dados) {
  return apiRequest('/api/admin/rotas', {
    method: 'POST',
    token: obterToken(),
    body: dados,
  })
}

function atualizarRota(id, dados) {
  return apiRequest(`/api/admin/rotas/${id}`, {
    method: 'PUT',
    token: obterToken(),
    body: dados,
  })
}

function alterarStatusRota(id, ativo) {
  return apiRequest(
    `/api/admin/rotas/${id}/status?ativo=${ativo}`,
    {
      method: 'PATCH',
      token: obterToken(),
    },
  )
}

export {
  listarRotas,
  criarRota,
  atualizarRota,
  alterarStatusRota,
}
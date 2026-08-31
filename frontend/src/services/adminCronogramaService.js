import { apiRequest } from './api'
import { obterToken } from './authService'

function listarCronogramas() {
  return apiRequest('/api/admin/cronogramas', {
    token: obterToken(),
  })
}

function criarCronograma(dados) {
  return apiRequest('/api/admin/cronogramas', {
    method: 'POST',
    token: obterToken(),
    body: dados,
  })
}

function atualizarCronograma(id, dados) {
  return apiRequest(
    `/api/admin/cronogramas/${id}`,
    {
      method: 'PUT',
      token: obterToken(),
      body: dados,
    },
  )
}

function alterarStatusCronograma(
  id,
  ativo,
) {
  return apiRequest(
    `/api/admin/cronogramas/${id}/status?ativo=${ativo}`,
    {
      method: 'PATCH',
      token: obterToken(),
    },
  )
}

export {
  listarCronogramas,
  criarCronograma,
  atualizarCronograma,
  alterarStatusCronograma,
}
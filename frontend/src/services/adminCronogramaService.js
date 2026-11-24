import { apiRequest } from './api'
import { obterToken } from './authService'

/** GET /api/admin/cronogramas */
function listarCronogramas() {
  return apiRequest('/api/admin/cronogramas', {
    token: obterToken(),
  })
}

/** POST /api/admin/cronogramas */
function criarCronograma(dados) {
  return apiRequest('/api/admin/cronogramas', {
    method: 'POST',
    token: obterToken(),
    body: dados,
  })
}

/** PUT /api/admin/cronogramas/{id} */
function atualizarCronograma(id, dados) {
  return apiRequest(`/api/admin/cronogramas/${id}`, {
    method: 'PUT',
    token: obterToken(),
    body: dados,
  })
}

/** PUT /api/admin/cronogramas/lote/horario (tudo ou nada) */
function alterarHorariosEmLote(ids, horarioInicio, horarioFim) {
  return apiRequest('/api/admin/cronogramas/lote/horario', {
    method: 'PUT',
    token: obterToken(),
    body: {
      ids,
      horarioInicio,
      horarioFim,
    },
  })
}

/** PATCH /api/admin/cronogramas/{id}/status */
function alterarStatusCronograma(id, ativo) {
  return apiRequest(`/api/admin/cronogramas/${id}/status?ativo=${ativo}`, {
    method: 'PATCH',
    token: obterToken(),
  })
}

export {
  listarCronogramas,
  criarCronograma,
  atualizarCronograma,
  alterarStatusCronograma,
  alterarHorariosEmLote,
}

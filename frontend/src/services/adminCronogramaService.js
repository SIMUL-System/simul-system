import { apiRequest } from './api'
import { obterToken } from './authService'

/** GET /api/admin/cronogramas */
function listarCronogramas() {
  return apiRequest('/api/admin/cronogramas', {
    token: obterToken(),
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

/**
 * PUT /api/admin/cronogramas/rota/{rotaId} (tudo ou nada)
 * Os dias enviados ficam ativos; os outros dias da rota são desativados.
 */
function definirSemanaDaRota(rotaId, dias) {
  return apiRequest(`/api/admin/cronogramas/rota/${rotaId}`, {
    method: 'PUT',
    token: obterToken(),
    body: { dias },
  })
}

export { listarCronogramas, alterarHorariosEmLote, definirSemanaDaRota }

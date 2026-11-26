import { apiRequest } from './api'
import { obterToken } from './authService'

/** GET /api/admin/cidades: cidades com rotas, bairros, coletas e pendências. */
function listarCidades() {
  return apiRequest('/api/admin/cidades', {
    token: obterToken(),
  })
}

/**
 * PUT /api/admin/cidades/{id}/turnos: faixa média do turno diurno e do
 * noturno ({ diurnoInicio, diurnoFim, noturnoInicio, noturnoFim, fonte }).
 */
function atualizarTurnosCidade(id, faixa) {
  return apiRequest(`/api/admin/cidades/${id}/turnos`, {
    method: 'PUT',
    token: obterToken(),
    body: faixa,
  })
}

export { atualizarTurnosCidade, listarCidades }

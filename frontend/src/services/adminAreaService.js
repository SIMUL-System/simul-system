import { apiRequest } from './api'
import { obterToken } from './authService'

/** POST /api/admin/rotas/areas */
function criarAreaAtendida(dados) {
  return apiRequest('/api/admin/rotas/areas', {
    method: 'POST',
    token: obterToken(),
    body: dados,
  })
}

/** GET /api/admin/rotas/areas */
function listarAreasAtendidas() {
  return apiRequest('/api/admin/rotas/areas', {
    token: obterToken(),
  })
}

/** PUT /api/admin/rotas/areas/{id} */
function atualizarAreaAtendida(id, dados) {
  return apiRequest(`/api/admin/rotas/areas/${id}`, {
    method: 'PUT',
    token: obterToken(),
    body: dados,
  })
}

/** PUT /api/admin/rotas/areas/{id}/geometria */
function atualizarGeometriaArea(id, geometriaGeoJson) {
  return apiRequest(`/api/admin/rotas/areas/${id}/geometria`, {
    method: 'PUT',
    token: obterToken(),
    body: {
      geometriaGeoJson,
    },
  })
}

export { atualizarAreaAtendida, atualizarGeometriaArea, criarAreaAtendida, listarAreasAtendidas }

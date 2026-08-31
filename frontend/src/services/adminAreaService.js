import { apiRequest } from './api'
import { obterToken } from './authService'

function criarAreaAtendida(dados) {
  return apiRequest('/api/admin/rotas/areas', {
    method: 'POST',
    token: obterToken(),
    body: dados,
  })
}

function listarAreasAtendidas() {
  return apiRequest('/api/admin/rotas/areas', {
    token: obterToken(),
  })
}

function atualizarAreaAtendida(id, dados) {
  return apiRequest(
    `/api/admin/rotas/areas/${id}`,
    {
      method: 'PUT',
      token: obterToken(),
      body: dados,
    },
  )
}

function atualizarGeometriaArea(
  id,
  geometriaGeoJson,
) {
  return apiRequest(
    `/api/admin/rotas/areas/${id}/geometria`,
    {
      method: 'PUT',
      token: obterToken(),
      body: {
        geometriaGeoJson,
      },
    },
  )
}

export {
  atualizarAreaAtendida,
  atualizarGeometriaArea,
  criarAreaAtendida,
  listarAreasAtendidas,
}
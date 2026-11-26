import { apiRequest, urlDaApi } from './api'
import { obterToken } from './authService'

/** GET /api/institucional (público): textos, fotos e equipe do "Quem somos". */
function buscarInstitucional() {
  return apiRequest('/api/institucional')
}

/** Endereço da imagem para <img src>. */
function urlImagem(imagemId) {
  return urlDaApi(`/api/institucional/imagens/${imagemId}`)
}

/** PUT /api/admin/institucional */
function atualizarTextosInstitucionais(dados) {
  return apiRequest('/api/admin/institucional', { method: 'PUT', token: obterToken(), body: dados })
}

/** POST /api/admin/institucional/fotos (arquivo + legenda) */
function adicionarFotoInstituicao(arquivo, legenda) {
  const formulario = new FormData()
  formulario.append('arquivo', arquivo, 'foto.jpg')
  formulario.append('legenda', legenda)

  return apiRequest('/api/admin/institucional/fotos', {
    method: 'POST',
    token: obterToken(),
    body: formulario,
  })
}

/** PUT /api/admin/institucional/fotos/{id} */
function atualizarLegendaFoto(id, legenda) {
  return apiRequest(`/api/admin/institucional/fotos/${id}`, {
    method: 'PUT',
    token: obterToken(),
    body: { legenda },
  })
}

/** DELETE /api/admin/institucional/fotos/{id} */
function removerFotoInstituicao(id) {
  return apiRequest(`/api/admin/institucional/fotos/${id}`, {
    method: 'DELETE',
    token: obterToken(),
  })
}

/** PUT /api/admin/institucional/fotos/ordem */
function reordenarFotosInstituicao(ids) {
  return apiRequest('/api/admin/institucional/fotos/ordem', {
    method: 'PUT',
    token: obterToken(),
    body: { ids },
  })
}

/** POST /api/admin/institucional/integrantes */
function cadastrarIntegrante(dados) {
  return apiRequest('/api/admin/institucional/integrantes', {
    method: 'POST',
    token: obterToken(),
    body: dados,
  })
}

/** PUT /api/admin/institucional/integrantes/{id} */
function atualizarIntegrante(id, dados) {
  return apiRequest(`/api/admin/institucional/integrantes/${id}`, {
    method: 'PUT',
    token: obterToken(),
    body: dados,
  })
}

/** PUT /api/admin/institucional/integrantes/{id}/foto (arquivo) */
function atualizarFotoIntegrante(id, arquivo) {
  const formulario = new FormData()
  formulario.append('arquivo', arquivo, 'foto.jpg')

  return apiRequest(`/api/admin/institucional/integrantes/${id}/foto`, {
    method: 'PUT',
    token: obterToken(),
    body: formulario,
  })
}

/** DELETE /api/admin/institucional/integrantes/{id}/foto */
function removerFotoIntegrante(id) {
  return apiRequest(`/api/admin/institucional/integrantes/${id}/foto`, {
    method: 'DELETE',
    token: obterToken(),
  })
}

/** DELETE /api/admin/institucional/integrantes/{id} */
function removerIntegrante(id) {
  return apiRequest(`/api/admin/institucional/integrantes/${id}`, {
    method: 'DELETE',
    token: obterToken(),
  })
}

/** PUT /api/admin/institucional/integrantes/ordem */
function reordenarIntegrantes(ids) {
  return apiRequest('/api/admin/institucional/integrantes/ordem', {
    method: 'PUT',
    token: obterToken(),
    body: { ids },
  })
}

export {
  buscarInstitucional,
  urlImagem,
  atualizarTextosInstitucionais,
  adicionarFotoInstituicao,
  atualizarLegendaFoto,
  removerFotoInstituicao,
  reordenarFotosInstituicao,
  cadastrarIntegrante,
  atualizarIntegrante,
  atualizarFotoIntegrante,
  removerFotoIntegrante,
  removerIntegrante,
  reordenarIntegrantes,
}

import { apiRequest } from './api'
import { obterToken } from './authService'

/** GET /api/notificacoes/preferencias (404 enquanto o usuário não tiver preferência) */
function obterPreferencia() {
  return apiRequest('/api/notificacoes/preferencias', {
    token: obterToken(),
  })
}

/** POST /api/notificacoes/preferencias */
function criarPreferencia(dados) {
  return apiRequest('/api/notificacoes/preferencias', {
    method: 'POST',
    token: obterToken(),
    body: dados,
  })
}

/** PUT /api/notificacoes/preferencias */
function atualizarPreferencia(dados) {
  return apiRequest('/api/notificacoes/preferencias', {
    method: 'PUT',
    token: obterToken(),
    body: dados,
  })
}

export { obterPreferencia, criarPreferencia, atualizarPreferencia }
